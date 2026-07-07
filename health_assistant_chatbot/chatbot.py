"""
Core AI Health Assistant chatbot logic.

Features:
- Prompt engineering: a carefully crafted system prompt that scopes the bot
  to general wellness/health education and enforces safe behavior.
- Context-aware responses: keeps a rolling per-session conversation history.
- Can explain outputs from the other two ML features in this project
  (Recommendation Engine + Menstrual Prediction) in plain language.
- Medical safety guardrails (see safety_guardrails.py) run before/after
  every LLM call.
"""
from google import genai
from google.genai import types

from config import GEMINI_API_KEY, GEMINI_MODEL, MAX_HISTORY_TURNS
from safety_guardrails import apply_guardrails, wrap_response

SYSTEM_PROMPT = """You are "WellBot", a friendly AI health & wellness assistant \
embedded inside a women's health app.

Scope & tone:
- Answer general questions about nutrition, fitness, sleep, hydration, \
menstrual health and pregnancy wellness in a warm, encouraging, plain-language way.
- You are NOT a doctor. Never diagnose a condition, never name a specific \
disease as something the user "has", and never give medication names, doses, \
or dosage adjustments.
- If the user describes symptoms that could be serious (severe pain, heavy \
bleeding, fainting, chest pain, signs of pregnancy complications, etc.), \
gently but clearly recommend they seek care from a healthcare professional \
or emergency services, in addition to whatever general information you give.
- Keep answers concise (short paragraphs or bullet points), avoid medical \
jargon unless you explain it, and never shame the user about their body, \
weight, or habits.
- When asked to explain output from the app's Recommendation Engine or \
Menstrual Prediction model, translate the structured data into a short, \
friendly explanation of WHAT it means and WHY, without inventing extra \
numbers or facts that weren't in the data you were given.
"""


class HealthAssistantChatbot:
    def __init__(self, api_key: str = None, model_name: str = None):
        self.client = genai.Client(api_key=api_key or GEMINI_API_KEY)
        self.model_name = model_name or GEMINI_MODEL
        self.chat_config = types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT)
        # session_id -> list of {"role": "user"/"model", "text": str}
        self._sessions = {}

    def _get_history(self, session_id: str):
        return self._sessions.setdefault(session_id, [])

    def _trim_history(self, session_id: str):
        history = self._sessions[session_id]
        max_items = MAX_HISTORY_TURNS * 2
        if len(history) > max_items:
            self._sessions[session_id] = history[-max_items:]

    def chat(self, session_id: str, user_message: str) -> str:
        """Main entry point: send a user message, get a safe reply back."""
        short_circuit, canned = apply_guardrails(user_message)
        if short_circuit:
            # Still record it in history for context, but skip the LLM call.
            history = self._get_history(session_id)
            history.append({"role": "user", "text": user_message})
            history.append({"role": "model", "text": canned})
            return canned

        history = self._get_history(session_id)
        genai_history = [
            types.Content(role=turn["role"], parts=[types.Part(text=turn["text"])])
            for turn in history
        ]
        chat_session = self.client.chats.create(
            model=self.model_name, config=self.chat_config, history=genai_history
        )
        response = chat_session.send_message(user_message)
        reply = wrap_response(response.text)

        history.append({"role": "user", "text": user_message})
        history.append({"role": "model", "text": reply})
        self._trim_history(session_id)
        return reply

    def explain_model_output(self, session_id: str, feature: str, data: dict) -> str:
        """
        Ask the LLM to explain the output of another ML feature in this app
        (feature = "recommendation_engine" or "menstrual_prediction").
        `data` should be the dict returned by that model.
        """
        prompt = (
            f"The app's '{feature}' model just produced this structured "
            f"result for the user:\n{data}\n\n"
            "Explain this to the user in 3-5 friendly sentences. Do not "
            "invent numbers that aren't in the data."
        )
        return self.chat(session_id, prompt)

    def reset_session(self, session_id: str):
        self._sessions.pop(session_id, None)
