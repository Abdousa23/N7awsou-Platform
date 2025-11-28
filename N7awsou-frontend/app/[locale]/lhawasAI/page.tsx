'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, Trash2, RotateCcw, User, Bot, Clock, Plane, MapPin, Mic, MicOff } from 'lucide-react';
import useAuthStore from '@/store/store';
import Navbar from '@/components/Navbar';

// Types
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface ChatResponse {
  response: string;
  session_id: string;
  timestamp: string;
  message_id: string;
}

interface Session {
  session_id: string;
  created_at: string;
  last_activity: string;
  message_count: number;
}

const TourismChatPage: React.FC = () => {
  // Get authenticated user data
  const { user, isAuthenticated } = useAuthStore();

  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [userId] = useState<string>(() => {
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    if (typeof window !== 'undefined') {
      const userid = localStorage.getItem('userId');
      if (userid) {
        return userid.toString();
      }
    }
    return `guest_${Date.now()}`;

  });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<any>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL + '/api/v1';

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check API connection
  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setIsConnected(true);
        setError('');
      } else {
        setIsConnected(false);
        setError('Backend server is not responding');
      }
    } catch (err) {
      setIsConnected(false);
      setError('Cannot connect to backend server');
    }
  }, []);

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.log('Error loading sessions:', err);
    }
  }, [userId]);

  // Load chat history
  const loadChatHistory = useCallback(async (sessionIdToLoad: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history/${sessionIdToLoad}`);
      if (response.ok) {
        const data = await response.json();
        const formattedMessages: Message[] = data.history.map((msg: any) => ({
          id: msg.message_id || `${msg.role}_${Date.now()}`,
          content: msg.content,
          role: msg.role,
          timestamp: msg.timestamp
        }));
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.log('Error loading chat history:', err);
    }
  }, []);

  // Initialize
  useEffect(() => {
    // checkConnection();
    loadSessions();
    console.log('userId:', userId);
    // Generate initial session ID
    if (!sessionId) {
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection, loadSessions, sessionId]);

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isConnected) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: sessionId,
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: Message = {
        id: data.message_id,
        content: data.response,
        role: 'assistant',
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSessionId(data.session_id);

      // Reload sessions to update the list
      loadSessions();

    } catch (err) {
      console.log('Error sending message:', err);
      setError('Failed to send message. Please try again.');

      // Remove the user message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Start new session
  const startNewSession = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setMessages([]);
    setError('');
  };

  // Load existing session
  const loadSession = async (sessionIdToLoad: string) => {
    setSessionId(sessionIdToLoad);
    await loadChatHistory(sessionIdToLoad);
    setError('');
  };

  // Clear session
  const clearSession = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/chat/session/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessages([]);
        loadSessions();
      }
    } catch (err) {
      console.log('Error clearing session:', err);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };    // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Force WAV format for better compatibility
      const options = {
        mimeType: 'audio/wav'
      };

      // Fallback to webm if WAV not supported
      if (!MediaRecorder.isTypeSupported('audio/wav')) {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options.mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options.mimeType = 'audio/webm';
        } else {
          options.mimeType = '';
        }
      }

      const recorder = new MediaRecorder(stream, options.mimeType ? options : undefined);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        setIsLoading(true);

        try {
          const mimeType = recorder.mimeType || 'audio/webm';
          let audioBlob = new Blob(audioChunks, { type: mimeType });

          // If it's not WAV, try to convert using Web Audio API
          if (!mimeType.includes('wav')) {
            try {
              audioBlob = await convertToWav(audioBlob);
            } catch (conversionError) {
              console.warn('Audio conversion failed, sending original:', conversionError);
              // Continue with original blob
            }
          }

          await sendVoiceMessage(audioBlob, '.wav');
        } catch (error) {
          console.log('Error processing voice message:', error);
          setError('Failed to process voice message. Please try again.');
        } finally {
          setIsLoading(false);
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
        }
      };

      recorder.onerror = (event) => {
        console.log('MediaRecorder error:', event);
        setError('Recording failed. Please try again.');
        setIsRecording(false);
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setIsRecording(true);
      recorder.start();

    } catch (err) {
      console.log('Error accessing microphone:', err);
      setError('Microphone access denied. Please allow microphone permissions.');
    }
  };

  // Convert audio to WAV using Web Audio API
  const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Convert to WAV
          const wavBuffer = audioBufferToWav(audioBuffer);
          const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });

          resolve(wavBlob);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error('Failed to read audio file'));
      fileReader.readAsArrayBuffer(audioBlob);
    });
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Convert samples
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      if (typeof mediaRecorder.stop === 'function') {
        mediaRecorder.stop();
      }
    }
  };    // Send voice message to backend
  const sendVoiceMessage = async (audioBlob: Blob, extension: string = '.webm') => {
    try {
      setError(''); // Clear any previous errors

      const formData = new FormData();
      const filename = `voice_message${extension}`;
      formData.append('audio_file', audioBlob, filename);
      formData.append('session_id', sessionId);
      formData.append('user_id', userId);
      formData.append('language', 'en-US');

      const response = await fetch(`${API_BASE_URL}/chat/voice`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process voice message');
      }

      const data = await response.json();

      // Add user's transcribed message
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        content: data.transcribed_text,
        role: 'user',
        timestamp: data.timestamp
      };

      // Add assistant's response
      const assistantMessage: Message = {
        id: data.message_id,
        content: data.chat_response,
        role: 'assistant',
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setSessionId(data.session_id);

      // Show success feedback
      setSuccessMessage('Voice message processed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.log('Error sending voice message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Provide specific error messages based on the error
      if (errorMessage.includes('FFmpeg') || errorMessage.includes('format')) {
        setError('Audio format not supported. Please install FFmpeg for full format support or try speaking again.');
      } else if (errorMessage.includes('understand')) {
        setError('Could not understand the audio. Please speak clearly and try again.');
      } else {
        setError(`Voice message failed: ${errorMessage}`);
      }

      // Auto-clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      <div className="flex h-[calc(100vh-80px)] bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Sidebar */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-white/20 shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-[#FEAC19] to-orange-400 text-white">
            <h1 className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Plane className="w-6 h-6" />
              </div>
              Travel Assistant
            </h1>
            <p className="text-orange-100 text-sm mt-1">Your AI Travel Companion</p>
            <div className="flex items-center gap-2 mt-3">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'}`} />
              <span className="text-sm text-orange-100">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={startNewSession}
              className="w-full bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={!isConnected}
            >
              <MessageCircle className="w-4 h-4" />
              Start New Journey
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto px-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Conversations
            </h3>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  onClick={() => loadSession(session.session_id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${session.session_id === sessionId
                    ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-[#FEAC19] shadow-md'
                    : 'bg-white/50 hover:bg-white/80 border-gray-100 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 truncate flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-[#FEAC19]" />
                      Trip {session.session_id.slice(-8)}
                    </span>
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                      {session.message_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(session.last_activity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Session Actions */}
          {sessionId && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={clearSession}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 border border-red-200 hover:shadow-md"
                disabled={!isConnected}
              >
                <Trash2 className="w-4 h-4" />
                Clear Journey
              </button>
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#FEAC19] to-orange-400 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  Active Journey
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Session: {sessionId.slice(-12) || 'Ready to start'}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-white/60 rounded-xl transition-all duration-200 hover:shadow-md"
                title="Refresh"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                <div className="text-sm text-red-600 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  {error}
                </div>
              </div>
            )}
            {successMessage && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm">
                <div className="text-sm text-green-600 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  {successMessage}
                </div>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center mt-20">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[#FEAC19] to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                    <Plane className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Your Travel Assistant!</h3>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                  Im here to help you plan the perfect trip. Ask me about destinations, hotels, activities, or anything travel-related!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                  <div className="p-4 bg-white/60 rounded-xl shadow-sm">
                    <MapPin className="w-6 h-6 text-[#FEAC19] mx-auto mb-2" />
                    <p className="text-sm text-gray-700">Find destinations</p>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl shadow-sm">
                    <Plane className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-700">Plan itineraries</p>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl shadow-sm">
                    <MessageCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-700">Get recommendations</p>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 bg-gradient-to-r from-[#FEAC19] to-orange-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${message.role === 'user'
                      ? 'bg-gradient-to-r from-[#FEAC19] to-orange-400 text-white'
                      : 'bg-white/80 backdrop-blur-sm border border-white/20'
                      }`}
                  >
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${message.role === 'user' ? 'text-white' : 'text-black'
                      }`}>{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${message.role === 'user' ? 'text-orange-100' : 'text-gray-600'
                        }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FEAC19] to-orange-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-[#FEAC19] rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-sm border-t border-white/20 p-6 shadow-lg">
            <div className="flex gap-4">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Where would you like to go? Ask me anything about travel..." : "Connecting to travel assistant..."}
                className="flex-1 bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#FEAC19] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm text-gray-800 placeholder-gray-500"
                disabled={isLoading || !isConnected}
              />

              {/* Voice Recording Button */}
              <button
                onClick={toggleRecording}
                disabled={isLoading || !isConnected}
                className={`p-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed ${isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : isLoading && mediaRecorder
                    ? 'bg-orange-500 text-white animate-spin'
                    : 'bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white'
                  }`}
                title={
                  isRecording
                    ? 'Stop recording'
                    : isLoading && mediaRecorder
                      ? 'Processing voice...'
                      : 'Start voice recording'
                }
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim() || !isConnected}
                className="bg-gradient-to-r from-[#FEAC19] to-orange-400 hover:from-[#FEAC19]/90 hover:to-orange-400/90 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Press Enter to send your message • Shift+Enter for a new line • {
                isRecording
                  ? 'Recording voice message... Click again to stop'
                  : isLoading && mediaRecorder
                    ? 'Processing voice message...'
                    : 'Click mic to record voice message'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourismChatPage;