# Personalized Recommendation Engine

Given a user profile (age, height, weight -> BMI, activity level, menstrual
cycle info, pregnancy status), produces personalized diet, exercise, water
intake, sleep, and daily-tip recommendations.

## How it works

- `train_model.py` trains a scikit-learn `LinearRegression` model on a
  synthetic dataset (ground truth from the Mifflin-St Jeor equation) to
  estimate a **reference** daily energy range. Produces `model.joblib`.
- `recommendation_engine.py` loads that model and layers rule-based logic
  on top for diet focus, exercise plan, hydration, sleep, and tips —
  personalized by BMI category, activity level, menstrual phase, and
  pregnancy status.
- `profile.py` defines the `UserProfile` input schema + BMI/phase helpers.
- `app.py` exposes it all as a Flask REST API.

## Setup

```
pip install -r requirements.txt
python train_model.py        # generates model.joblib (already included)
python app.py                 # runs on http://localhost:5002
```

## Testing it (important!)

API only — no webpage. `http://localhost:5002` in a browser will show a
small JSON status at `/`; the real endpoint needs a `POST`:

```bash
curl -X POST http://localhost:5002/recommend \
  -H "Content-Type: application/json" \
  -d "{\"age\": 27, \"height_cm\": 165, \"weight_kg\": 60}"
```

## Example request

```
POST /recommend
{
  "age": 27, "height_cm": 165, "weight_kg": 60, "sex": "female",
  "activity_level": "moderate",
  "menstrual_cycle_day": 20, "average_cycle_length": 28,
  "pregnancy_status": "not_pregnant"
}
```

## Notes

All figures returned are **general wellness reference ranges**, not
individualized medical or nutrition prescriptions — every response includes
a disclaimer field. To feed this into the AI Health Assistant chatbot, POST
this endpoint's JSON response to the chatbot's `/explain` endpoint with
`"feature": "recommendation_engine"`.
