"""
Flask API for the AI Health Assistant chatbot.

Endpoints:
  POST /chat
      body: {"session_id": "abc123", "message": "How much water should I drink?"}
      returns: {"reply": "..."}

  POST /explain
      body: {"session_id": "abc123", "feature": "menstrual_prediction", "data": {...}}
      returns: {"reply": "..."}

  POST /reset
      body: {"session_id": "abc123"}
      returns: {"status": "ok"}
"""
from flask import Flask, request, jsonify

from chatbot import HealthAssistantChatbot

app = Flask(__name__)
bot = HealthAssistantChatbot()


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "service": "AI Health Assistant Chatbot",
        "endpoints": ["/chat (POST)", "/explain (POST)", "/reset (POST)"],
    })


@app.route("/chat", methods=["POST"])
def chat():
    payload = request.get_json(force=True) or {}
    session_id = payload.get("session_id", "default")
    message = payload.get("message", "")
    if not message.strip():
        return jsonify({"error": "message is required"}), 400
    reply = bot.chat(session_id, message)
    return jsonify({"reply": reply})


@app.route("/explain", methods=["POST"])
def explain():
    payload = request.get_json(force=True) or {}
    session_id = payload.get("session_id", "default")
    feature = payload.get("feature", "")
    data = payload.get("data", {})
    reply = bot.explain_model_output(session_id, feature, data)
    return jsonify({"reply": reply})


@app.route("/reset", methods=["POST"])
def reset():
    payload = request.get_json(force=True) or {}
    session_id = payload.get("session_id", "default")
    bot.reset_session(session_id)
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5001)
