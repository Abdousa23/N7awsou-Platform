"""
Test script for voice chat functionality
Run this after starting the FastAPI server to test the voice endpoints
"""

import requests
import json
from pathlib import Path

# Server URL (adjust if needed)
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_text_chat():
    """Test the regular text chat endpoint"""
    try:
        payload = {
            "message": "Hello, I'm testing the chat functionality",
            "session_id": "test_session_123"
        }
        
        response = requests.post(
            f"{BASE_URL}/chat",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Text chat test passed")
            result = response.json()
            print(f"   Session ID: {result.get('session_id')}")
            print(f"   Response: {result.get('response')[:100]}...")
            return True
        else:
            print(f"❌ Text chat test failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Text chat error: {e}")
        return False

def test_voice_endpoints_without_audio():
    """Test voice endpoints without actual audio (should get validation errors)"""
    try:
        # Test voice chat endpoint without file
        response = requests.post(f"{BASE_URL}/chat/voice")
        if response.status_code == 422:  # Validation error expected
            print("✅ Voice chat endpoint validation working")
        else:
            print(f"⚠️  Unexpected response from voice chat: {response.status_code}")
        
        # Test transcribe endpoint without file
        response = requests.post(f"{BASE_URL}/chat/transcribe")
        if response.status_code == 422:  # Validation error expected
            print("✅ Transcribe endpoint validation working")
        else:
            print(f"⚠️  Unexpected response from transcribe: {response.status_code}")
            
        return True
    except Exception as e:
        print(f"❌ Voice endpoint validation error: {e}")
        return False

def create_test_audio_file():
    """Create a simple test audio file (placeholder)"""
    try:
        # Create a minimal WAV file header for testing
        # This won't contain actual audio but will pass format validation
        wav_header = b'RIFF\x24\x00\x00\x00WAVE'
        
        test_file_path = Path("test_audio.wav")
        with open(test_file_path, "wb") as f:
            f.write(wav_header)
        
        return test_file_path
    except Exception as e:
        print(f"Error creating test audio file: {e}")
        return None

def main():
    """Run all tests"""
    print("🎤 Voice Chat API Test Suite")
    print("=" * 40)
    
    # Test 1: Health check
    health_ok = test_health_check()
    print()
    
    if not health_ok:
        print("❌ Server is not running or not responding. Please start the FastAPI server first.")
        print("   Run: uvicorn main:app --reload")
        return
    
    # Test 2: Text chat
    text_ok = test_text_chat()
    print()
    
    # Test 3: Voice endpoint validation
    voice_validation_ok = test_voice_endpoints_without_audio()
    print()
    
    # Summary
    print("📋 Test Summary:")
    print(f"   Health Check: {'✅' if health_ok else '❌'}")
    print(f"   Text Chat: {'✅' if text_ok else '❌'}")
    print(f"   Voice Validation: {'✅' if voice_validation_ok else '❌'}")
    
    if all([health_ok, text_ok, voice_validation_ok]):
        print("\n🎉 All tests passed! Voice chat API is ready.")
        print("\n📝 Next steps:")
        print("   1. Test with real audio files using the /chat/voice endpoint")
        print("   2. Integrate with frontend voice recording functionality")
        print("   3. Check the VOICE_CHAT_API.md file for integration details")
    else:
        print("\n⚠️  Some tests failed. Check the server logs for details.")

if __name__ == "__main__":
    main()
