from fastapi import APIRouter, Query, HTTPException
from typing import Optional
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import asyncio
from generated.prisma import Prisma
import logging

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()



# Initialize Prisma client
prisma = Prisma()

# Global variables for ML models
tfidf = None
content_matrix = None
content_similarity = None
offers_df = None
interactions_df = None
user_offer_matrix = None
popularity_scores = None
is_initialized = False

async def initialize_recommendation_system():
    """Initialize the recommendation system with data from database"""
    global tfidf, content_matrix, content_similarity, offers_df, interactions_df, user_offer_matrix, popularity_scores, is_initialized
    
    if is_initialized:
        return
    
    try:
        logger.info("Connecting to database...")
        # Connect to database if not already connected
        if not prisma.is_connected():
            await prisma.connect()
        
        logger.info("Loading tours from database...")
        # Fetch tours from database (only available ones)
        tours = await prisma.tour.find_many(
            where={'available': True}
        )
        
        logger.info(f"Found {len(tours)} tours in database")
        
        # Convert tours to DataFrame
        offers_data = []
        for tour in tours:
            # Create tags from category and trip type
            tags = f"{tour.category or ''} {tour.tripType}".strip()
            
            offers_data.append({
                'offer_id': tour.id,
                'name': tour.name,
                'description': tour.description or '',
                'price': tour.price,
                'destinationLocation': tour.destinationLocation or '',
                'departureLocation': tour.departureLocation or '',
                'category': tour.category or '',
                'tripType': tour.tripType,
                'tags': tags,
                'duration': tour.duration,
                'availableCapacity': tour.availableCapacity,
                'images': tour.images or [],
                'includedFeatures': tour.includedFeatures or [],
                'departureDate': tour.departureDate.isoformat() if tour.departureDate else None,
                'returnDate': tour.returnDate.isoformat() if tour.returnDate else None,
                'createdAt': tour.createdAt.isoformat() if tour.createdAt else None
            })
        
        offers_df = pd.DataFrame(offers_data)
        logger.info(f"Created offers DataFrame with {len(offers_df)} rows")
        
        # Fetch interactions (History) from database
        logger.info("Loading history from database...")
        histories = await prisma.history.find_many()
        logger.info(f"Found {len(histories)} history records")
        
        # Convert interactions to DataFrame
        interactions_data = []
        for history in histories:
            interactions_data.append({
                'user_id': history.userId,
                'offer_id': history.tourId,
                'interaction': history.interaction,
                'enrolled': history.enrolled,
                'viewedAt': history.viewedAt.isoformat() if history.viewedAt else None
            })
        
        interactions_df = pd.DataFrame(interactions_data)
        logger.info(f"Created interactions DataFrame with {len(interactions_df)} rows")
        
        # Initialize recommendation models
        if len(offers_df) > 0:
            # Content Vectorization
            logger.info("Building content similarity matrix...")
            offers_df['content'] = (
                offers_df['destinationLocation'].fillna('') + " " + 
                offers_df['tags'].fillna('') + " " + 
                offers_df['description'].fillna('') + " " +
                offers_df['category'].fillna('')
            )
            
            tfidf = TfidfVectorizer(stop_words='english', max_features=5000)
            content_matrix = tfidf.fit_transform(offers_df['content'])
            content_similarity = cosine_similarity(content_matrix)
            logger.info("Content similarity matrix created")
        
        # Collaborative Filtering
        if len(interactions_df) > 0:
            logger.info("Building collaborative filtering matrix...")
            user_offer_matrix = interactions_df.pivot_table(
                index='user_id', 
                columns='offer_id', 
                values='interaction'
            ).fillna(0)
            
            # Popularity score (based on total interaction + enrollment bonus)
            popularity_scores = {}
            for _, interaction in interactions_df.iterrows():
                offer_id = interaction['offer_id']
                score = interaction['interaction']
                # Give bonus for enrollment
                if interaction['enrolled']:
                    score += 5
                
                if offer_id in popularity_scores:
                    popularity_scores[offer_id] += score
                else:
                    popularity_scores[offer_id] = score
            
            logger.info(f"Created popularity scores for {len(popularity_scores)} tours")
        else:
            user_offer_matrix = pd.DataFrame()
            popularity_scores = {}
            logger.info("No interactions found, using empty collaborative filtering")
        
        is_initialized = True
        logger.info(f"Recommendation system initialized successfully with {len(offers_df)} tours and {len(interactions_df)} interactions")
        
    except Exception as e:
        logger.error(f"Error initializing recommendation system: {e}")
        is_initialized = False
        # Initialize empty structures to prevent errors
        offers_df = pd.DataFrame()
        interactions_df = pd.DataFrame()
        user_offer_matrix = pd.DataFrame()
        popularity_scores = {}

def get_user_collaborative_scores(user_id: int):
    """Get collaborative filtering scores for a user"""
    if user_offer_matrix.empty or user_id not in user_offer_matrix.index:
        # Return zero scores for all available offers
        if not offers_df.empty:
            return pd.Series(0, index=offers_df['offer_id'])
        else:
            return pd.Series(dtype=float)
    
    user_vector = user_offer_matrix.loc[user_id]
    sim_users = user_offer_matrix.dot(user_vector).sort_values(ascending=False)
    
    if sim_users.sum() > 0:
        collaborative_scores = sim_users.dot(user_offer_matrix).div(sim_users.sum()).fillna(0)
    else:
        collaborative_scores = pd.Series(0, index=user_offer_matrix.columns)
    
    return collaborative_scores

async def get_user_interaction_history(user_id: int):
    """Get offers user has interacted with"""
    if interactions_df.empty:
        return set()
    
    user_interactions = interactions_df[interactions_df['user_id'] == user_id]
    return set(user_interactions['offer_id'].tolist())

def calculate_hybrid_scores(user_id: int, offer_id: Optional[int] = None, exclude_offers: set = None):
    """Calculate hybrid scores for recommendations"""
    try:
        if exclude_offers is None:
            exclude_offers = set()
        
        if offers_df.empty:
            logger.warning("No offers available for scoring")
            return []
        
        collaborative_scores = get_user_collaborative_scores(user_id)
        hybrid_scores = []
        max_popularity = max(popularity_scores.values()) if popularity_scores else 1
        
        if offer_id is not None:
            # Content-based recommendations for specific offer
            try:
                offer_idx = offers_df[offers_df['offer_id'] == offer_id].index[0]
                if content_similarity is not None:
                    content_scores = list(enumerate(content_similarity[offer_idx]))
                else:
                    content_scores = [(idx, 0.1) for idx in range(len(offers_df))]
            except IndexError:
                logger.error(f"Offer {offer_id} not found in offers DataFrame")
                return []
        else:
            # General recommendations
            content_scores = [(idx, 0.1) for idx in range(len(offers_df))]  # Small base score
        
        for idx, content_score in content_scores:
            if idx >= len(offers_df):
                continue
                
            offer = offers_df.iloc[idx]
            o_id = offer['offer_id']
            
            if o_id in exclude_offers:
                continue
            
            cb_score = content_score
            cf_score = collaborative_scores.get(o_id, 0) if not collaborative_scores.empty else 0
            pop_score = popularity_scores.get(o_id, 0) / max_popularity if max_popularity > 0 else 0
            
            if offer_id is not None:
                # Content-based weighting for specific offer page
                final_score = (0.6 * cb_score) + (0.3 * cf_score) + (0.1 * pop_score)
            else:
                # Collaborative filtering weighting for main page
                final_score = (0.1 * cb_score) + (0.6 * cf_score) + (0.3 * pop_score)
            
            hybrid_scores.append((o_id, final_score))
        
        return hybrid_scores
        
    except Exception as e:
        logger.error(f"Error calculating hybrid scores: {e}")
        return []

@router.get("/initialize")
async def manual_initialize():
    """Manually initialize the recommendation system"""
    global is_initialized
    is_initialized = False  # Force re-initialization
    await initialize_recommendation_system()
    
    total_offers = len(offers_df) if offers_df is not None else 0
    total_interactions = len(interactions_df) if interactions_df is not None else 0
    
    return {
        "status": "initialized" if is_initialized else "failed", 
        "total_offers": total_offers,
        "total_interactions": total_interactions
    }

@router.get("/{user_id}")
async def recommend_main_page(user_id: int, top_n: int = Query(5, ge=1, le=20)):
    """Get recommendations for main page"""
    try:
        # Initialize if not already done
        if not is_initialized:
            await initialize_recommendation_system()
        
        if offers_df is None or offers_df.empty:
            return {"error": "No tours available in database", "recommendations": [], "type": "empty"}
        
        user_interactions = await get_user_interaction_history(user_id)
        hybrid_scores = calculate_hybrid_scores(user_id, offer_id=None, exclude_offers=user_interactions)
        
        if not hybrid_scores or max(score for _, score in hybrid_scores) == 0:
            # Fallback to random popular recommendations
            available_offers = offers_df[~offers_df['offer_id'].isin(user_interactions)]
            if len(available_offers) == 0:
                available_offers = offers_df
            
            if len(available_offers) >= top_n:
                # Weight by popularity scores
                weights = available_offers['offer_id'].map(popularity_scores).fillna(1)
                sampled = available_offers.sample(n=top_n, weights=weights)
            else:
                sampled = available_offers
            
            recommended = sampled.to_dict(orient='records')
            return {"recommendations": recommended, "type": "random_popular"}
        
        # Get top recommendations
        top_offers = sorted(hybrid_scores, key=lambda x: x[1], reverse=True)[:top_n]
        top_ids = [x[0] for x in top_offers]
        
        recommended = offers_df[offers_df['offer_id'].isin(top_ids)].to_dict(orient='records')
        recommended = sorted(recommended, key=lambda x: top_ids.index(x['offer_id']))
        
        return {"recommendations": recommended, "type": "hybrid"}
        
    except Exception as e:
        logger.error(f"Error generating recommendations for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@router.get("/{user_id}/{offer_id}")
async def recommend_page_specific(user_id: int, offer_id: int, top_n: int = Query(5, ge=1, le=20)):
    """Get recommendations for specific offer page"""
    try:
        # Initialize if not already done
        if not is_initialized:
            await initialize_recommendation_system()
        
        if offers_df is None or offers_df.empty:
            return {"error": "No tours available in database", "recommendations": [], "type": "empty"}
        
        if offer_id not in offers_df['offer_id'].values:
            return {"error": "Offer not found", "recommendations": [], "type": "not_found"}
        
        user_interactions = await get_user_interaction_history(user_id)
        exclude_offers = user_interactions.union({offer_id})
        
        hybrid_scores = calculate_hybrid_scores(user_id, offer_id=offer_id, exclude_offers=exclude_offers)
        
        if not hybrid_scores:
            return {"recommendations": [], "type": "no_recommendations"}
        
        top_offers = sorted(hybrid_scores, key=lambda x: x[1], reverse=True)[:top_n]
        top_ids = [x[0] for x in top_offers]
        
        recommended = offers_df[offers_df['offer_id'].isin(top_ids)].to_dict(orient='records')
        recommended = sorted(recommended, key=lambda x: top_ids.index(x['offer_id']))
        
        return {"recommendations": recommended, "type": "content_hybrid"}
        
    except Exception as e:
        logger.error(f"Error generating specific recommendations for user {user_id}, offer {offer_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        if not is_initialized:
            await initialize_recommendation_system()
        
        total_offers = len(offers_df) if offers_df is not None else 0
        total_interactions = len(interactions_df) if interactions_df is not None else 0
        
        return {
            "status": "healthy" if is_initialized else "unhealthy", 
            "total_offers": total_offers, 
            "total_interactions": total_interactions,
            "system_initialized": is_initialized,
            "database_connected": prisma.is_connected()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "system_initialized": False,
            "database_connected": False
        }