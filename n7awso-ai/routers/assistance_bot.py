from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import json
import asyncio
import logging
from datetime import datetime, timedelta
import uuid
import os
import tempfile
import io
from pathlib import Path

# Audio processing imports
import speech_recognition as sr
from pydub import AudioSegment

# Updated LangChain imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory

# Prisma imports
from generated.prisma import Prisma

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models (keep the same)
class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = None
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str
    message_id: str

class SessionInfo(BaseModel):
    session_id: str
    created_at: str
    last_activity: str
    message_count: int

class ChatHistoryItem(BaseModel):
    role: str
    content: str
    timestamp: str
    message_id: str

# Voice chat models
class VoiceChatRequest(BaseModel):
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    language: Optional[str] = "en-US"

class VoiceChatResponse(BaseModel):
    transcribed_text: str
    chat_response: str
    session_id: str
    timestamp: str
    message_id: str
    audio_duration: Optional[float] = None

# Database manager (keep the same)
class PrismaDatabaseManager:
    def __init__(self):
        self.prisma = Prisma()
        self._connected = False
    
    async def connect(self):
        """Connect to database"""
        if not self._connected:
            try:
                await self.prisma.connect()
                self._connected = True
                logger.info("Connected to Prisma database")
            except Exception as e:
                if "Already connected" in str(e):
                    logger.warning("Prisma already connected, skipping.")
                    self._connected = True
                else:
                    raise
    
    async def disconnect(self):
        """Disconnect from database"""
        if self._connected:
            await self.prisma.disconnect()
            self._connected = False
            logger.info("Disconnected from Prisma database")
    
    async def ensure_connection(self):
        """Ensure database connection is active"""
        if not self._connected:
            await self.connect()

# Knowledge base manager (keep the same)
class KnowledgeBaseManager:
    def __init__(self):
        self.data_file = Path(__file__).parent.parent / "data" / "trip_plans.json"
        self.knowledge_base = {}
        self.load_knowledge_base()
    
    def load_knowledge_base(self):
        """Load the trip plans JSON"""
        try:
            with open(self.data_file, "r", encoding="utf-8") as file:
                self.knowledge_base = json.load(file)
                logger.info("Knowledge base loaded successfully.")
        except Exception as e:
            logger.error(f"❌ Error loading knowledge base: {e}")
    
    def get_relevant_info(self, query: str) -> str:
        """Return relevant info based on query"""
        relevant_info = []
        query_lower = query.lower()

        # Handle both list and dict at the top level
        if isinstance(self.knowledge_base, dict):
            for category, data in self.knowledge_base.items():
                if isinstance(data, dict):
                    for key, value in data.items():
                        if any(k in query_lower for k in [category.lower(), key.lower()]):
                            relevant_info.append(f"{category} - {key}: {str(value)[:200]}...")
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and any(k in query_lower for k in str(item).lower().split()):
                            relevant_info.append(f"{category}: {str(item)[:200]}...")
        elif isinstance(self.knowledge_base, list):
            for item in self.knowledge_base:
                if isinstance(item, dict):
                    # Check all string fields for a match
                    for key, value in item.items():
                        if isinstance(value, str) and key.lower() in query_lower:
                            relevant_info.append(f"{item.get('title', 'Unknown')}: {str(value)[:200]}...")
                        elif isinstance(value, list):
                            for v in value:
                                if isinstance(v, str) and v.lower() in query_lower:
                                    relevant_info.append(f"{item.get('title', 'Unknown')}: {str(v)[:200]}...")
        return "\n".join(relevant_info[:3]) if relevant_info else ""

# Updated Chat memory manager using modern LangChain
class PrismaChatMessageHistory(BaseChatMessageHistory):
    """Custom chat message history using Prisma database"""
    
    def __init__(self, session_id: str, db_manager: PrismaDatabaseManager):
        self.session_id = session_id
        self.db_manager = db_manager
        self._messages = []
        self._loaded = False
    
    async def _ensure_loaded(self):
        """Load messages from database if not loaded"""
        if not self._loaded:
            await self._load_messages()
            self._loaded = True
    
    async def _load_messages(self):
        """Load messages from database"""
        await self.db_manager.ensure_connection()
        try:
            messages = await self.db_manager.prisma.chatmessage.find_many(
                where={"sessionId": self.session_id},
                order=[{"timestamp": "asc"}]
            )
            self._messages = []
            for msg in messages:
                if msg.role == "user":
                    self._messages.append(HumanMessage(content=msg.content))
                elif msg.role == "assistant":
                    self._messages.append(AIMessage(content=msg.content))
        except Exception as e:
            logger.error(f"Error loading messages: {e}")
            self._messages = []
    
    @property
    def messages(self):
        """Get messages (synchronous property)"""
        return self._messages
    
    def add_message(self, message):
        """Add message to history"""
        self._messages.append(message)
    
    def clear(self):
        """Clear message history"""
        self._messages = []

class PrismaChatMemoryManager:
    def __init__(self, db_manager: PrismaDatabaseManager):
        self.db_manager = db_manager
        self.store = {}
    
    async def get_or_create_session(self, session_id: str = None, user_id: str = None) -> str:
        """Get existing session or create new one"""
        await self.db_manager.ensure_connection()
        
        if not session_id:
            session_id = str(uuid.uuid4())
        
        try:
            existing_session = await self.db_manager.prisma.chatsession.find_unique(
                where={"sessionId": session_id}
            )
            
            if not existing_session:
                await self.db_manager.prisma.chatsession.create(
                    data={
                        "sessionId": session_id,
                        "userId": user_id,
                        "createdAt": datetime.now(),
                        "lastActivity": datetime.now(),
                        "isActive": True
                    }
                )
                logger.info(f"Created new chat session: {session_id}")
            else:
                await self.db_manager.prisma.chatsession.update(
                    where={"sessionId": session_id},
                    data={"lastActivity": datetime.now()}
                )
            
            return session_id
            
        except Exception as e:
            logger.error(f"Error in get_or_create_session: {e}")
            raise
    
    async def save_message(self, session_id: str, role: str, content: str) -> str:
        """Save message to database"""
        await self.db_manager.ensure_connection()
        message_id = str(uuid.uuid4())
        
        try:
            await self.db_manager.prisma.chatmessage.create(
                data={
                    "sessionId": session_id,
                    "messageId": message_id,
                    "role": role,
                    "content": content,
                    "timestamp": datetime.now()
                }
            )
            return message_id
        except Exception as e:
            logger.error(f"Error saving message: {e}")
            raise
    
    def get_session_history(self, session_id: str) -> PrismaChatMessageHistory:
        """Get chat message history for session"""
        if session_id not in self.store:
            self.store[session_id] = PrismaChatMessageHistory(session_id, self.db_manager)
        return self.store[session_id]
    
    async def get_conversation_history(self, session_id: str, limit: int = 10) -> List[Dict]:
        """Get conversation history from database"""
        await self.db_manager.ensure_connection()
        try:
            messages = await self.db_manager.prisma.chatmessage.find_many(
                where={"sessionId": session_id},
                order=[{"timestamp": "desc"}],
                take=limit
            )
            messages.reverse()
            return [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "message_id": msg.messageId
                }
                for msg in messages
            ]
        except Exception as e:
            logger.error(f"Error getting conversation history: {e}")
            return []
    
    async def get_session_info(self, session_id: str) -> Optional[Dict]:
        """Get session information"""
        await self.db_manager.ensure_connection()
        
        try:
            session = await self.db_manager.prisma.chatsession.find_unique(
                where={"sessionId": session_id},
                include={"messages": True}
            )
            
            if session:
                return {
                    "session_id": session.sessionId,
                    "user_id": session.userId,
                    "created_at": session.createdAt.isoformat(),
                    "last_activity": session.lastActivity.isoformat(),
                    "is_active": session.isActive,
                    "message_count": len(session.messages)
                }
            return None
        except Exception as e:
            logger.error(f"Error getting session info: {e}")
            return None

# Speech-to-Text processor class
class SpeechToTextProcessor:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
    
    async def process_audio_file(self, audio_file: UploadFile, language: str = "en-US") -> str:
        """Process uploaded audio file and convert to text"""
        temp_audio_path = None
        
        try:
            # Read the uploaded file
            audio_data = await audio_file.read()
            
            # Check if it's likely a WAV file by checking content type and filename
            filename = audio_file.filename or "audio.wav"
            content_type = audio_file.content_type or "audio/wav"
            
            logger.info(f"Processing audio file: {filename}, content_type: {content_type}, size: {len(audio_data)} bytes")
            
            # Create temporary file with .wav extension for speech recognition
            temp_audio_path = self._create_temp_file(audio_data, ".wav")
            
            # Perform speech recognition directly
            transcribed_text = await self._speech_to_text(temp_audio_path, language)
            
            return transcribed_text
            
        except Exception as e:
            logger.error(f"Error processing audio file: {e}")
            # Provide more helpful error messages
            if "could not be read as PCM WAV" in str(e) or "corrupted" in str(e):
                raise HTTPException(
                    status_code=400, 
                    detail="Audio format not supported. Please ensure the audio is in WAV format. The frontend should convert audio automatically."
                )
            elif "No speech detected" in str(e) or "Could not understand" in str(e):
                raise HTTPException(status_code=400, detail="No speech detected in audio. Please speak clearly and try again.")
            else:
                raise HTTPException(status_code=500, detail="Audio processing failed. Please try recording again.")
        
        finally:
            # Clean up temporary files safely
            self._cleanup_temp_file(temp_audio_path)
    
    def _create_temp_file(self, data: bytes, suffix: str) -> str:
        """Create a temporary file with data"""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_file.write(data)
                temp_file.flush()
                os.fsync(temp_file.fileno())  # Ensure data is written to disk
                return temp_file.name
        except Exception as e:
            logger.error(f"Error creating temporary file: {e}")
            raise
    
    def _cleanup_temp_file(self, file_path: str) -> None:
        """Safely clean up temporary file"""
        if file_path and os.path.exists(file_path):
            try:
                os.unlink(file_path)
            except (OSError, PermissionError) as e:
                logger.warning(f"Could not delete temporary file {file_path}: {e}")
                # Try again after a short delay
                try:
                    import time
                    time.sleep(0.1)
                    os.unlink(file_path)
                except Exception:
                    logger.warning(f"Failed to delete temporary file {file_path} after retry")
    
    async def _speech_to_text(self, audio_path: str, language: str) -> str:
        """Convert audio to text using Google Speech Recognition"""
        try:
            # Check if file exists and is readable
            if not os.path.exists(audio_path):
                raise HTTPException(status_code=500, detail="Audio file not found")
            
            # Check file size
            file_size = os.path.getsize(audio_path)
            logger.info(f"Processing audio file: {audio_path}, size: {file_size} bytes")
            
            if file_size == 0:
                raise HTTPException(status_code=400, detail="Audio file is empty")
            
            # Try to read the audio file
            try:
                with sr.AudioFile(audio_path) as source:
                    # Adjust for ambient noise
                    self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                    # Record the audio
                    audio_data = self.recognizer.record(source)
                    logger.info("Audio data successfully loaded for recognition")
            
            except Exception as file_error:
                logger.warning(f"AudioFile method failed: {file_error}")
                raise HTTPException(
                    status_code=400, 
                    detail="Cannot read audio file. Please ensure the audio is in WAV format with proper encoding."
                )
            
            # Use Google Speech Recognition API
            if self.google_api_key:
                try:
                    text = self.recognizer.recognize_google(
                        audio_data, 
                        key=self.google_api_key,
                        language=language
                    )
                    logger.info(f"Speech recognition successful (API): {len(text)} characters")
                    return text
                except sr.RequestError as e:
                    logger.warning(f"Google Speech API error: {e}, falling back to free service")
                except sr.UnknownValueError:
                    raise HTTPException(status_code=400, detail="Could not understand the audio. Please speak clearly and try again.")
            
            # Fallback to free Google Speech Recognition
            try:
                text = self.recognizer.recognize_google(audio_data, language=language)
                logger.info(f"Speech recognition successful (free): {len(text)} characters")
                return text
            except sr.UnknownValueError:
                raise HTTPException(status_code=400, detail="Could not understand the audio. Please speak clearly and try again.")
            except sr.RequestError as e:
                logger.error(f"Speech recognition service error: {e}")
                raise HTTPException(status_code=500, detail="Speech recognition service temporarily unavailable. Please try again.")
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in speech to text: {e}")
            raise HTTPException(status_code=500, detail="Speech recognition failed. Please try again.")

# Updated Tourism Assistant using modern LangChain
class TourismAssistant:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.7,
            max_tokens=1000,
            convert_system_message_to_human=True
        )
        
        self.knowledge_manager = KnowledgeBaseManager()
        self.db_manager = PrismaDatabaseManager()
        self.memory_manager = PrismaChatMemoryManager(self.db_manager)
        self.speech_processor = SpeechToTextProcessor()
        
        # Create prompt template
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", self._get_system_prompt()),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}")
        ])
        
        # Create the runnable chain
        self.chain = self.prompt_template | self.llm
        
        # Create chain with message history
        self.chain_with_history = RunnableWithMessageHistory(
            self.chain,
            self.get_session_history,
            input_messages_key="input",
            history_messages_key="history",
        )
    
    async def initialize(self):
        """Initialize the assistant"""
        await self.db_manager.connect()
    
    async def cleanup(self):
        """Cleanup resources"""
        await self.db_manager.disconnect()
    
    def get_session_history(self, session_id: str) -> BaseChatMessageHistory:
        """Get session history for RunnableWithMessageHistory"""
        return self.memory_manager.get_session_history(session_id)
    
    def _get_system_prompt(self) -> str:
        return """You are a helpful tourism assistant for N7awsou travel agency. Your role is to:

1. Help users plan their trips and vacations
2. Provide information about destinations, hotels, activities, and attractions
3. Suggest itineraries based on user preferences and budget
4. Answer questions about travel requirements, weather, and local customs
5. Assist with booking inquiries and travel arrangements

Guidelines:
- Be friendly, professional, and enthusiastic about travel
- Provide accurate and helpful information
- Use the knowledge base information when available
- Remember the conversation context
- If you don't know something specific, acknowledge it and offer to help find the information
don't ask too many questions 
Always aim to make travel planning enjoyable and stress-free for users.

Available Knowledge Base: {knowledge_base}
"""
    
    async def get_response(self, message: str, session_id: str, user_id: str = None) -> Dict[str, Any]:
        """Get AI response with memory and knowledge base"""
        try:
            # Ensure session exists
            session_id = await self.memory_manager.get_or_create_session(session_id, user_id)
            
            # Load existing messages into history
            history = self.memory_manager.get_session_history(session_id)
            await history._ensure_loaded()
            
            # Get relevant knowledge base info
            knowledge_info = self.knowledge_manager.get_relevant_info(message)
            
            # Update system prompt with knowledge
            updated_prompt = self.prompt_template.partial(knowledge_base=knowledge_info)
            updated_chain = updated_prompt | self.llm
            
            chain_with_history = RunnableWithMessageHistory(
                updated_chain,
                self.get_session_history,
                input_messages_key="input",
                history_messages_key="history",
            )
            
            # Get AI response
            response = await chain_with_history.ainvoke(
                {"input": message},
                config={"configurable": {"session_id": session_id}}
            )
            
            # Extract content from AIMessage
            response_content = response.content if hasattr(response, 'content') else str(response)
            
            # Save messages to database
            await self.memory_manager.save_message(session_id, "user", message)
            message_id = await self.memory_manager.save_message(session_id, "assistant", response_content)
            
            return {
                "response": response_content,
                "session_id": session_id,
                "message_id": message_id,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting AI response: {e}")
            raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")
    
    async def process_voice_message(self, audio_file: UploadFile, session_id: str = None, user_id: str = None, language: str = "en-US") -> Dict[str, Any]:
        """Process voice message and return both transcription and chat response"""
        try:
            # Convert audio to text
            transcribed_text = await self.speech_processor.process_audio_file(audio_file, language)
            
            if not transcribed_text or transcribed_text.strip() == "":
                raise HTTPException(status_code=400, detail="No speech detected in audio")
            
            # Get chat response using existing method
            chat_result = await self.get_response(
                message=transcribed_text,
                session_id=session_id,
                user_id=user_id
            )
            
            return {
                "transcribed_text": transcribed_text,
                "chat_response": chat_result["response"],
                "session_id": chat_result["session_id"],
                "message_id": chat_result["message_id"],
                "timestamp": chat_result["timestamp"]
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error processing voice message: {e}")
            raise HTTPException(status_code=500, detail=f"Voice processing error: {str(e)}")

# Rest of the code remains the same (global assistant, API routes, etc.)
assistant = None

async def get_assistant():
    global assistant
    if assistant is None:
        assistant = TourismAssistant()
        await assistant.initialize()
    return assistant

# API Routes (keep all the existing routes - they should work with the updated assistant)
@router.post("/chat", response_model=ChatResponse)
async def chat(
    chat_request: ChatMessageRequest,
    current_assistant: TourismAssistant = Depends(get_assistant)
):
    """Main chat endpoint with memory"""
    try:
        result = await current_assistant.get_response(
            message=chat_request.message,
            session_id=chat_request.session_id,
            user_id=chat_request.user_id
        )
        
        return ChatResponse(**result)
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/chat/history/{session_id}")
async def get_chat_history(
    session_id: str,
    limit: int = 20,
    current_assistant: TourismAssistant = Depends(get_assistant)
):
    """Get chat history for a session"""
    try:
        history = await current_assistant.memory_manager.get_conversation_history(session_id, limit)
        return {"session_id": session_id, "history": history}
    except Exception as e:
        logger.error(f"Error getting history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/session/{session_id}")
async def get_session_info(
    session_id: str,
    current_assistant: TourismAssistant = Depends(get_assistant)
):
    """Get session information"""
    try:
        session_info = await current_assistant.memory_manager.get_session_info(session_id)
        if not session_info:
            raise HTTPException(status_code=404, detail="Session not found")
        return session_info
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/chat/session/{session_id}")
async def clear_session(
    session_id: str,
    current_assistant: TourismAssistant = Depends(get_assistant)
):
    """Clear a chat session"""
    try:
        await current_assistant.db_manager.ensure_connection()
        
        # Remove from memory cache
        if session_id in current_assistant.memory_manager.memory_cache:
            del current_assistant.memory_manager.memory_cache[session_id]
        
        # Mark session as inactive in database
        await current_assistant.db_manager.prisma.chatsession.update(
            where={"sessionId": session_id},
            data={"isActive": False}
        )
        
        return {"message": "Session cleared successfully"}
    except Exception as e:
        logger.error(f"Error clearing session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/sessions")
async def get_user_sessions(
    user_id: str = None,
    limit: int = 10,
    current_assistant: TourismAssistant = Depends(get_assistant)
):
    """Get user's active sessions"""
    try:
        await current_assistant.db_manager.ensure_connection()
        
        where_clause = {"isActive": True}
        if user_id:
            where_clause["userId"] = user_id
        
        sessions = await current_assistant.db_manager.prisma.chatsession.find_many(
            where=where_clause,
            include={"messages": True},
            
            take=limit
        )
        
        session_list = [
            SessionInfo(
                session_id=session.sessionId,
                created_at=session.createdAt.isoformat(),
                last_activity=session.lastActivity.isoformat(),
                message_count=len(session.messages)
            )
            for session in sessions
        ]
        
        return {"sessions": session_list}
    except Exception as e:
        logger.error(f"Error getting sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/stream")
async def chat_stream(
    chat_request: ChatMessageRequest,
    current_assistant: TourismAssistant = Depends(get_assistant)
):
    """Streaming chat response"""
    async def generate_response():
        try:
            result = await current_assistant.get_response(
                message=chat_request.message,
                session_id=chat_request.session_id,
                user_id=chat_request.user_id
            )
            
            # Simulate streaming by yielding response in chunks
            response_text = result["response"]
            chunk_size = 10
            
            for i in range(0, len(response_text), chunk_size):
                chunk = response_text[i:i + chunk_size]
                yield f"data: {json.dumps({'chunk': chunk, 'session_id': result['session_id']})}\n\n"
                await asyncio.sleep(0.1)  # Small delay for streaming effect
            
            yield f"data: {json.dumps({'done': True, 'session_id': result['session_id']})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

# Cleanup on app shutdown
@router.on_event("shutdown")
async def shutdown_event():
    global assistant
    if assistant:
        await assistant.cleanup()

@router.get("/chat/history/{session_id}")
async def get_chat_history(
    session_id: str,
    limit: int = 20,
    current_assistant: TourismAssistant = Depends(get_assistant)
):
    """Get chat history for a session"""
    try:
        history = await current_assistant.memory_manager.get_conversation_history(session_id, limit)
        return {"session_id": session_id, "history": history}
    except Exception as e:
        logger.error(f"Error getting history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/session/{session_id}")
async def get_session_info(
    session_id: str,
    current_assistant: TourismAssistant = Depends(get_assistant)
):
    """Get session information"""
    try:
        session_info = await current_assistant.memory_manager.get_session_info(session_id)
        if not session_info:
            raise HTTPException(status_code=404, detail="Session not found")
        return session_info
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/chat/session/{session_id}")
async def clear_session(
    session_id: str,
    current_assistant: TourismAssistant = Depends(get_assistant)
):
    """Clear a chat session"""
    try:
        await current_assistant.db_manager.ensure_connection()
        
        # Remove from memory cache
        if session_id in current_assistant.memory_manager.memory_cache:
            del current_assistant.memory_manager.memory_cache[session_id]
        
        # Mark session as inactive in database
        await current_assistant.db_manager.prisma.chatsession.update(
            where={"sessionId": session_id},
            data={"isActive": False}
        )
        
        return {"message": "Session cleared successfully"}
    except Exception as e:
        logger.error(f"Error clearing session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/sessions")
async def get_user_sessions(
    user_id: str = None,
    limit: int = 10,
    current_assistant: TourismAssistant = Depends(get_assistant)
):
    """Get user's active sessions"""
    try:
        await current_assistant.db_manager.ensure_connection()
        
        where_clause = {"isActive": True}
        if user_id:
            where_clause["userId"] = user_id
        
        sessions = await current_assistant.db_manager.prisma.chatsession.find_many(
            where=where_clause,
            include={"messages": True},
            
            take=limit
        )
        
        session_list = [
            SessionInfo(
                session_id=session.sessionId,
                created_at=session.createdAt.isoformat(),
                last_activity=session.lastActivity.isoformat(),
                message_count=len(session.messages)
            )
            for session in sessions
        ]
        
        return {"sessions": session_list}
    except Exception as e:
        logger.error(f"Error getting sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/stream")
async def chat_stream(
    chat_request: ChatMessageRequest,
    current_assistant: TourismAssistant = Depends(get_assistant)
):
    """Streaming chat response"""
    async def generate_response():
        try:
            result = await current_assistant.get_response(
                message=chat_request.message,
                session_id=chat_request.session_id,
                user_id=chat_request.user_id
            )
            
            # Simulate streaming by yielding response in chunks
            response_text = result["response"]
            chunk_size = 10
            
            for i in range(0, len(response_text), chunk_size):
                chunk = response_text[i:i + chunk_size]
                yield f"data: {json.dumps({'chunk': chunk, 'session_id': result['session_id']})}\n\n"
                await asyncio.sleep(0.1)  # Small delay for streaming effect
            
            yield f"data: {json.dumps({'done': True, 'session_id': result['session_id']})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

@router.post("/chat/voice", response_model=VoiceChatResponse)
async def voice_chat(
    audio_file: UploadFile = File(...),
    session_id: Optional[str] = None,
    user_id: Optional[str] = None,
    language: Optional[str] = "en-US",
    current_assistant: TourismAssistant = Depends(get_assistant)
):
    """Voice chat endpoint - accepts audio file and returns transcription + chat response"""
    try:
        # Validate file type
        allowed_types = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/webm']
        if audio_file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported audio format. Allowed: {', '.join(allowed_types)}"
            )
        
        # Check file size (limit to 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if audio_file.size and audio_file.size > max_size:
            raise HTTPException(status_code=400, detail="Audio file too large. Maximum size: 10MB")
        
        # Process the voice message
        result = await current_assistant.process_voice_message(
            audio_file=audio_file,
            session_id=session_id,
            user_id=user_id,
            language=language
        )
        
        return VoiceChatResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Voice chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/transcribe")
async def transcribe_audio(
    audio_file: UploadFile = File(...),
    language: Optional[str] = "en-US",
    current_assistant: TourismAssistant = Depends(get_assistant)
):
    """Transcribe audio file to text only (no chat response)"""
    try:
        # Validate file type
        allowed_types = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/webm']
        if audio_file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported audio format. Allowed: {', '.join(allowed_types)}"
            )
        
        # Transcribe audio
        transcribed_text = await current_assistant.speech_processor.process_audio_file(audio_file, language)
        
        return {
            "transcribed_text": transcribed_text,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Cleanup on app shutdown
@router.on_event("shutdown")
async def shutdown_event():
    global assistant
    if assistant:
        await assistant.cleanup()