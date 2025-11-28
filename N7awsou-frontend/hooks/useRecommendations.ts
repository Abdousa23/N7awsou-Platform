import { useState } from 'react';
import useAuthStore from '@/store/store';

export interface RecommendedTour {
    offer_id: number;
    name: string;
    description: string;
    price: number;
    destinationLocation: string;
    departureLocation: string;
    category: string;
    tripType: string;
    duration: number;
    availableCapacity: number;
    images: string[];
    includedFeatures: string[];
    departureDate: string | null;
    returnDate: string | null;
    createdAt: string | null;
}

export interface RecommendationResponse {
    recommendations: RecommendedTour[];
    type: string;
    error?: string;
}

export const useRecommendations = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

    const getMainPageRecommendations = async (topN: number = 6): Promise<RecommendationResponse> => {
        if (!isAuthenticated || !user?.id) {
            throw new Error('User must be authenticated to get recommendations');
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${AI_API_URL}/recommend/${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: RecommendationResponse = await response.json();
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recommendations';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getTourSpecificRecommendations = async (tourId: number, topN: number = 5): Promise<RecommendationResponse> => {
        if (!isAuthenticated || !user?.id) {
            throw new Error('User must be authenticated to get recommendations');
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${AI_API_URL}/recommend/${user.id}/${tourId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: RecommendationResponse = await response.json();
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tour recommendations';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const initializeRecommendationSystem = async (): Promise<{ status: string; total_offers: number; total_interactions: number }> => {
        try {
            const response = await fetch(`${AI_API_URL}/recommendations/initialize`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initialize recommendation system';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    return {
        getMainPageRecommendations,
        getTourSpecificRecommendations,
        initializeRecommendationSystem,
        isLoading,
        error,
    };
};
