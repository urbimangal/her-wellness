# AI Health Assistant Chatbot

A context-aware health & wellness chatbot built with prompt engineering on
top of Google's free-tier Gemini API, plus rule-based medical safety
guardrails. It can also explain the structured output of the other two
ML features in this project (Recommendation Engine, Menstrual Prediction).

## Setup

1. Get a **free** Gemini API key from https://aistudio.google.com/app/apikey
2. `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and paste your key in:
   ```
   cp .env.example .env
   ```
4. Run the API:
   ```
   python app.py
   ```
   Server starts on `http://localhost:5001`

## Testing it (important!)

This is an **API only** — there's no webpage to look at. Visiting
`http://localhost:5001` in a browser will correctly show a small JSON status
message at `/`, but the real endpoints only accept `POST` requests. Test with
`curl` (or Postman / Thunder Client):

```bash
curl -X POST http://localhost:5001/chat \
  -H "Content-Type: application/json" \
  -d "{\"session_id\": \"u1\", \"message\": \"How much water should I drink daily?\"}"
```

## Endpoints

- `POST /chat` – `{"session_id": "u1", "message": "..."}` -> `{"reply": "..."}`
- `POST /explain` – have the bot explain another feature's output in plain language
- `POST /reset` – clear a session's conversation history

## Safety design

- `safety_guardrails.py` intercepts crisis language (self-harm, suicide) and
  diagnostic/dosage requests **before** they reach the LLM, replying with a
  safe canned response instead.
- Every LLM reply is wrapped with a "not a medical professional" disclaimer.
- The system prompt scopes the bot to general wellness education only.

## Notes

- Swap `GEMINI_MODEL` in `.env` for whichever model is currently free-tier in
  Google AI Studio if `gemini-1.5-flash` is ever deprecated.
- For production, replace the in-memory `_sessions` dict in `chatbot.py`
  with Redis or a database so history survives restarts / scales across
  multiple server processes.
