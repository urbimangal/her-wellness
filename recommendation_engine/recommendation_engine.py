"""
Personalized Recommendation Engine.

Combines:
  - A trained ML model (model.joblib, from train_model.py) that estimates a
    reference daily energy-need range.
  - Rule-based logic layered on top for diet direction, exercise, water
    intake, sleep, and daily tips — personalized by BMI category, activity
    level, menstrual phase, and pregnancy status.

All numeric outputs are presented as general reference ranges with a
disclaimer, not individualized medical/nutrition prescriptions.
"""
import os
import joblib
import numpy as np

from profile import UserProfile

_MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")
_ACTIVITY_ORDER = ["sedentary", "light", "moderate", "active", "very_active"]


class RecommendationEngine:
    def __init__(self, model_path: str = _MODEL_PATH):
        self._model = joblib.load(model_path) if os.path.exists(model_path) else None

    # ---------- ML-backed estimate ----------
    def _estimate_energy_kcal(self, profile: UserProfile):
        if self._model is None:
            return None
        activity_score = _ACTIVITY_ORDER.index(profile.activity_level) \
            if profile.activity_level in _ACTIVITY_ORDER else 2
        import pandas as pd
        X = pd.DataFrame([{
            "age": profile.age,
            "height_cm": profile.height_cm,
            "weight_kg": profile.weight_kg,
            "is_male": 1 if profile.sex == "male" else 0,
            "activity_score": activity_score,
        }])
        pred = float(self._model.predict(X)[0])
        return round(pred)

    # ---------- Rule-based layers ----------
    def _water_intake_ml(self, profile: UserProfile):
        base = profile.weight_kg * 33  # common general hydration guideline (ml/kg/day)
        if profile.pregnancy_status == "pregnant":
            base += 300
        if profile.activity_level in ("active", "very_active"):
            base += 400
        return round(base / 50) * 50  # round to nearest 50ml

    def _sleep_hours(self, profile: UserProfile):
        if profile.age < 18:
            return "8-10 hours"
        if profile.pregnancy_status in ("pregnant", "postpartum"):
            return "8-9 hours (plus rest/naps as needed)"
        return "7-9 hours"

    def _diet_focus(self, profile: UserProfile):
        tips = []
        cat = profile.bmi_category
        if cat == "underweight":
            tips.append("Focus on nutrient-dense, calorie-sufficient meals with regular snacks.")
        elif cat == "normal":
            tips.append("Maintain a balanced plate: protein, whole grains, vegetables, and healthy fats.")
        elif cat == "overweight":
            tips.append("Favor high-fiber, high-protein whole foods and mindful portion sizes.")
        else:  # obese
            tips.append("Consider working with a registered dietitian for a sustainable, individualized plan.")

        phase = profile.menstrual_phase()
        if phase == "menstrual":
            tips.append("Iron-rich foods (leafy greens, legumes, lean meat) can help offset menstrual blood loss.")
        elif phase == "luteal":
            tips.append("Complex carbs and magnesium-rich foods may help with PMS symptoms.")

        if profile.pregnancy_status == "pregnant":
            tips.append("Prioritize folate, iron, calcium, and protein; discuss any supplements with your OB/GYN.")

        return tips

    def _exercise_plan(self, profile: UserProfile):
        phase = profile.menstrual_phase()
        if profile.pregnancy_status == "pregnant":
            return ("Low-impact activity such as walking, prenatal yoga, or swimming "
                    "(with your doctor's clearance) — generally 20-30 min/day.")
        if phase == "menstrual":
            return "Light movement (walking, gentle yoga, stretching) if cramps/fatigue are present."
        if phase == "ovulation":
            return "Good window for higher-intensity training — energy typically peaks here."
        base_minutes = {
            "sedentary": 15, "light": 20, "moderate": 30, "active": 45, "very_active": 60
        }.get(profile.activity_level, 30)
        return f"Aim for about {base_minutes} minutes of moderate activity today."

    def _daily_tip(self, profile: UserProfile):
        phase = profile.menstrual_phase()
        if phase == "luteal":
            return "Cravings and mood dips are common pre-period — be kind to yourself."
        if profile.pregnancy_status == "pregnant":
            return "Track any unusual symptoms (severe headache, swelling, reduced movement) and call your provider promptly."
        if profile.bmi_category in ("underweight", "obese"):
            return "Small, consistent habit changes tend to stick better than big overnight ones."
        return "Consistency with sleep, water, and movement compounds over time — small wins count!"

    # ---------- Public API ----------
    def recommend(self, profile: UserProfile) -> dict:
        return {
            "bmi": profile.bmi,
            "bmi_category": profile.bmi_category,
            "menstrual_phase": profile.menstrual_phase(),
            "estimated_daily_energy_kcal_reference": self._estimate_energy_kcal(profile),
            "water_intake_ml": self._water_intake_ml(profile),
            "sleep_recommendation": self._sleep_hours(profile),
            "diet_focus": self._diet_focus(profile),
            "exercise_plan": self._exercise_plan(profile),
            "daily_tip": self._daily_tip(profile),
            "disclaimer": ("General wellness reference only — not medical or "
                           "nutrition advice. Consult a healthcare professional "
                           "for individualized guidance."),
        }
