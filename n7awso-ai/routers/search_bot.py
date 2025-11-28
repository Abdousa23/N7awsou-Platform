import json
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List, Optional

import google.generativeai as genai

# Load trip plans from JSON file
with open("trip_plans.json", "r", encoding="utf-8") as f:
    TRIP_PLANS = json.load(f)

# Gemini API setup (replace with your API key)
genai.configure(api_key="YOUR_GEMINI_API_KEY")
MODEL = "models/gemini-1.5-flash-latest"

router = APIRouter()

class UserPreferences(BaseModel):
    destination: Optional[str] = None
    date: Optional[str] = None
    budget: Optional[float] = None
    agency: Optional[str] = None
    activities: Optional[List[str]] = None

def search_trips(preferences: UserPreferences):
    results = []
    for plan in TRIP_PLANS:
        if preferences.destination and preferences.destination.lower() not in plan["destination"].lower():
            continue
        if preferences.date and preferences.date != plan["date"]:
            continue
        if preferences.budget and preferences.budget < plan.get("price", 0):
            continue
        if preferences.agency and preferences.agency.lower() not in plan["agency"].lower():
            continue
        if preferences.activities:
            if not any(act.lower() in [a.lower() for a in plan.get("activities", [])] for act in preferences.activities):
                continue
        results.append(plan)
    return results

@router.post("/chat")
async def chat_with_bot(request: Request):
    data = await request.json()
    user_message = data.get("message", "")

    # Use Gemini to extract user preferences
    prompt = (
        "Extract the user's trip preferences (destination, date, budget, agency, activities) from this message:\n"
        f"Message: {user_message}\n"
        "Respond in JSON format with keys: destination, date, budget, agency, activities."
    )
    response = genai.generate_content(MODEL, prompt)
    try:
        preferences_json = json.loads(response.text)
        preferences = UserPreferences(**preferences_json)
    except Exception:
        return {"reply": "Sorry, I couldn't understand your preferences. Please specify your destination, date, budget, agency, or activities."}

    # Search for trips
    trips = search_trips(preferences)
    if not trips:
        return {"reply": "Sorry, no trips match your preferences."}

    # Format reply
    reply = "Here are some trips matching your preferences:\n"
    for trip in trips:
        reply += (
            f"- {trip['destination']} on {trip['date']} by {trip['agency']}, "
            f"Price: {trip['price']}, Activities: {', '.join(trip.get('activities', []))}\n"
        )
    return {"reply": reply}