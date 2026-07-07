"""
UserProfile: the input schema for the Personalized Recommendation Engine.
"""
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class UserProfile:
    age: int
    height_cm: float
    weight_kg: float
    sex: str = "female"                     # "female" | "male" | "other"
    activity_level: str = "moderate"        # "sedentary"|"light"|"moderate"|"active"|"very_active"
    menstrual_cycle_day: Optional[int] = None   # day N of current cycle, if applicable
    average_cycle_length: Optional[int] = None  # days, if known
    pregnancy_status: str = "not_pregnant"  # "not_pregnant"|"pregnant"|"postpartum"
    pregnancy_trimester: Optional[int] = None   # 1, 2, or 3 if pregnant
    conditions: list = field(default_factory=list)  # e.g. ["pcos", "diabetes"] - informational only

    @property
    def bmi(self) -> float:
        h_m = self.height_cm / 100
        return round(self.weight_kg / (h_m ** 2), 1)

    @property
    def bmi_category(self) -> str:
        b = self.bmi
        if b < 18.5:
            return "underweight"
        if b < 25:
            return "normal"
        if b < 30:
            return "overweight"
        return "obese"

    def menstrual_phase(self) -> Optional[str]:
        """Rough phase estimate from cycle day, using a 28-day default if
        average_cycle_length is unknown. Informational only."""
        if self.menstrual_cycle_day is None or self.pregnancy_status != "not_pregnant":
            return None
        cycle_len = self.average_cycle_length or 28
        day = self.menstrual_cycle_day
        period_len = 5
        ovulation_day = max(1, cycle_len - 14)
        if day <= period_len:
            return "menstrual"
        if day < ovulation_day - 1:
            return "follicular"
        if ovulation_day - 1 <= day <= ovulation_day + 1:
            return "ovulation"
        return "luteal"
