"""
Flask API for Menstrual Prediction Logic.

POST /predict
body: {
  "period_start_dates": ["2026-03-01", "2026-03-29", "2026-04-27", "2026-05-25"],
  "period_lengths": [5, 4, 5, 5],
  "pregnancy_status": "not_pregnant"
}
"""
from datetime import datetime

from flask import Flask, request, jsonify

from predictor import CycleHistory, MenstrualPredictor

app = Flask(__name__)
predictor = MenstrualPredictor()


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "service": "Menstrual Prediction Logic",
        "endpoints": ["/predict (POST)"],
    })


@app.route("/predict", methods=["POST"])
def predict():
    payload = request.get_json(force=True) or {}
    try:
        raw_dates = payload.get("period_start_dates", [])
        dates = [datetime.strptime(d, "%Y-%m-%d").date() for d in raw_dates]
    except ValueError:
        return jsonify({"error": "dates must be in YYYY-MM-DD format"}), 400

    history = CycleHistory(
        period_start_dates=dates,
        period_lengths=payload.get("period_lengths"),
        pregnancy_status=payload.get("pregnancy_status", "not_pregnant"),
    )
    return jsonify(predictor.predict(history))


if __name__ == "__main__":
    app.run(debug=True, port=5003)
