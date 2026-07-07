"""
Trains a small ML regression model that estimates daily energy needs
(as a *reference range*, not a prescription) from profile features.

Ground truth for the synthetic training set comes from the well-established
Mifflin-St Jeor equation adjusted by activity multiplier. A real regression
model is trained on top of this so the project has an actual trained
ML artifact (model.joblib) that the recommendation engine loads at runtime,
rather than hard-coding the formula everywhere.

Run:  python train_model.py
Produces: model.joblib
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}


def mifflin_st_jeor(age, height_cm, weight_kg, sex, activity_level):
    if sex == "male":
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    return bmr * ACTIVITY_MULTIPLIERS.get(activity_level, 1.55)


def generate_synthetic_data(n=4000, seed=42):
    rng = np.random.default_rng(seed)
    ages = rng.integers(16, 70, n)
    heights = rng.normal(163, 8, n).clip(140, 195)
    weights = rng.normal(65, 14, n).clip(38, 130)
    sexes = rng.choice(["female", "male"], n, p=[0.7, 0.3])
    activities = rng.choice(list(ACTIVITY_MULTIPLIERS.keys()), n)

    targets = [
        mifflin_st_jeor(a, h, w, s, act)
        for a, h, w, s, act in zip(ages, heights, weights, sexes, activities)
    ]

    df = pd.DataFrame({
        "age": ages,
        "height_cm": heights,
        "weight_kg": weights,
        "is_male": (sexes == "male").astype(int),
        "activity_score": [list(ACTIVITY_MULTIPLIERS.keys()).index(a) for a in activities],
        "target_kcal": targets,
    })
    return df


def train():
    df = generate_synthetic_data()
    X = df[["age", "height_cm", "weight_kg", "is_male", "activity_score"]]
    y = df["target_kcal"]

    model = LinearRegression()
    model.fit(X, y)

    joblib.dump(model, "model.joblib")
    score = model.score(X, y)
    print(f"Trained model R^2 on synthetic data: {score:.4f}")
    print("Saved to model.joblib")


if __name__ == "__main__":
    train()
