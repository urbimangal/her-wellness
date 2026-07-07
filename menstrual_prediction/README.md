# Menstrual Prediction Logic

Predicts next period, ovulation date, fertile window, and flags irregular
cycles from a user's logged period-start-date history.

## How it works

- `predictor.py` — `MenstrualPredictor.predict()`:
  - Computes cycle lengths from consecutive period start dates.
  - Uses a **recency-weighted average** (more recent cycles count more) to
    forecast the next cycle length — a lightweight, explainable forecasting
    model. Swap in an LSTM/regression model later without changing the
    public interface.
  - Ovulation ≈ 14 days before predicted next period; fertile window =
    5 days before ovulation through 1 day after.
  - Flags irregularity via standard deviation of cycle lengths and/or any
    single cycle outside the typical 21–35 day range.
  - Confidence field reflects how much history is available.
- `app.py` — Flask REST API wrapper.

## Setup

```
pip install -r requirements.txt
python app.py     # runs on http://localhost:5003
```

## Testing it (important!)

API only — no webpage. `http://localhost:5003` in a browser will show a
small JSON status at `/`; the real endpoint needs a `POST`:

```bash
curl -X POST http://localhost:5003/predict \
  -H "Content-Type: application/json" \
  -d "{\"period_start_dates\": [\"2026-03-01\", \"2026-03-29\", \"2026-04-27\"]}"
```

## Example request

```
POST /predict
{
  "period_start_dates": ["2026-03-01", "2026-03-29", "2026-04-27", "2026-05-25"],
  "period_lengths": [5, 4, 5, 5],
  "pregnancy_status": "not_pregnant"
}
```

## Notes

Every response includes a disclaimer — this is a personal tracking estimate,
not a medical or contraceptive-grade fertility diagnosis. To have the AI
Health Assistant chatbot explain a prediction in plain language, POST this
endpoint's JSON to the chatbot's `/explain` endpoint with
`"feature": "menstrual_prediction"`.
