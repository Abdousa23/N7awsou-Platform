from fastapi import APIRouter, Request
import google.generativeai as genai
import os
import json
import re

router = APIRouter()
api_keyyy=os.getenv("GOOGLE_API_KEY")


@router.post("/")
async def generate_trip_plan(request: Request):
    genai.configure(api_key=api_keyyy)
    model = genai.GenerativeModel("gemini-1.5-flash")
    print("tha api key is", api_keyyy)
    data = await request.json()
    user_input = data.get("user_input", "i want to visit jijel")

    with open("data/knowlage_base.json", "r", encoding="utf-8") as file:
        agency_context = json.load(file)

    prompt = f"""
You are an expert travel planning assistant specializing in Algeria and tourism planning. Your task is to create a detailed and personalized travel plan.

IMPORTANT: Respond in the SAME LANGUAGE that the user is using in their request. If they write in Arabic, respond in Arabic. If they write in French, respond in French. If they write in English, respond in English.

User Request:
{user_input}

Available Agency Services:
{agency_context}

Please create a comprehensive travel plan that includes:

1. **Request Analysis**: Understanding user requirements (destination, duration, budget, interests)

2. **Destination Information**: 
   - Overview of the requested location
   - Best times to visit
   - Expected weather conditions

3. **Detailed Daily Program**:
   - Main tourist activities
   - Historical and natural landmarks
   - Suggested visiting times

4. **Budget and Costs**:
   - Estimated accommodation costs
   - Transportation costs
   - Food and activity expenses
   - Total expected budget

5. **Practical Tips**:
   - Suitable transportation methods
   - Recommended accommodations
   - Notable local restaurants
   - Safety advice

6. **Additional Information**:
   - Local souvenirs
   - Local customs and traditions
   - Emergency contact information

Important Instructions:
- Use clear, natural language in the SAME LANGUAGE as the user's request
- Provide accurate and realistic information
- Make the plan practical and executable
- Consider budget constraints if mentioned
- Offer alternatives for expensive activities
- Format the text beautifully and organized
- Write as clear, well-formatted text without JSON structure or code blocks

Remember: Match the user's language exactly - if they write in Arabic, respond in Arabic; if in French, respond in French; if in English, respond in English.
"""

    response = model.generate_content(prompt)
    
    # Enhanced text cleaning
    cleaned_text = response.text
    
    # Remove markdown formatting
    cleaned_text = re.sub(r'```(?:json|markdown|arabic|french|english)?\n?', '', cleaned_text, flags=re.IGNORECASE)
    cleaned_text = re.sub(r'```\n?', '', cleaned_text)
    
    # Clean escape characters and formatting
    cleaned_text = cleaned_text.replace('\\n', '\n')
    cleaned_text = cleaned_text.replace('\\"', '"')
    cleaned_text = cleaned_text.replace('\\t', '\t')
    
    # Remove extra whitespace while preserving text structure
    cleaned_text = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned_text)
    cleaned_text = cleaned_text.strip()
    
    return {"trip_plan": cleaned_text}