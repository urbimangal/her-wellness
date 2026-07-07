"""
Flask API for the Personalized Recommendation Engine.

POST /recommend
body: {
  "age": 27, "height_cm": 165, "weight_kg": 60, "sex": "female",
  "activity_level": "moderate",
  "menstrual_cycle_day": 20, "average_cycle_length": 28,
  "pregnancy_status": "not_pregnant"
}
"""
from flask import Flask, request, jsonify

from profile import UserProfile
from recommendation_engine import RecommendationEngine

app = Flask(__name__)
engine = RecommendationEngine()


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "service": "Personalized Recommendation Engine",
        "endpoints": ["/recommend (POST)"],
    })


@app.route("/recommend", methods=["POST"])
def recommend():
    payload = request.get_json(force=True) or {}
    try:
        profile = UserProfile(
            age=payload["age"],
            height_cm=payload["height_cm"],
            weight_kg=payload["weight_kg"],
            sex=payload.get("sex", "female"),
            activity_level=payload.get("activity_level", "moderate"),
            menstrual_cycle_day=payload.get("menstrual_cycle_day"),
            average_cycle_length=payload.get("average_cycle_length"),
            pregnancy_status=payload.get("pregnancy_status", "not_pregnant"),
            pregnancy_trimester=payload.get("pregnancy_trimester"),
            conditions=payload.get("conditions", []),
        )
    except KeyError as e:
        return jsonify({"error": f"missing required field: {e}"}), 400

    return jsonify(engine.recommend(profile))


if __name__ == "__main__":
    app.run(debug=True, port=5002)
