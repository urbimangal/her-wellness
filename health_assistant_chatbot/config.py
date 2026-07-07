"""
Configuration for the AI Health Assistant Chatbot.
Loads the Gemini API key from environment variables (.env supported).
"""
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
# You can swap this for whichever free-tier Gemini model is currently available
# in Google AI Studio (https://aistudio.google.com/). At the time of writing,
# "gemini-1.5-flash" is on the free tier. Check Google's docs for the latest name.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

MAX_HISTORY_TURNS = int(os.getenv("MAX_HISTORY_TURNS", "10"))
