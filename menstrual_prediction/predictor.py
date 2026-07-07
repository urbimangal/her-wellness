"""
Menstrual Prediction Logic.

Given a history of past period start dates (and optional period lengths),
predicts:
  - Next period start date
  - Ovulation date
  - Fertile window
  - Whether the cycle appears irregular

Approach: a lightweight "ML-style" weighted-average model — recent cycles
are weighted more heavily than older ones (recency-weighted mean), which
is a simple but effective forecasting technique. A production version could
swap this for an LSTM/regression trained on a large longitudinal dataset;
the interface (`predict()`) would stay the same.
"""
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import List, Optional
import statistics


DEFAULT_CYCLE_LENGTH = 28
DEFAULT_PERIOD_LENGTH = 5
IRREGULAR_STD_THRESHOLD_DAYS = 7   # std dev above this => irregular
IRREGULAR_RANGE = (21, 35)         # a single cycle outside this range is atypical


@dataclass
class CycleHistory:
    period_start_dates: List[date] = field(default_factory=list)  # chronological, oldest first
    period_lengths: Optional[List[int]] = None  # optional, same order as period_start_dates
    pregnancy_status: str = "not_pregnant"


class MenstrualPredictor:
    def __init__(self, recency_weight_decay: float = 0.7):
        # weight of cycle i (0 = most recent) = decay^i, more recent = higher weight
        self.decay = recency_weight_decay

    def _cycle_lengths(self, dates: List[date]) -> List[int]:
        return [(dates[i + 1] - dates[i]).days for i in range(len(dates) - 1)]

    def _weighted_avg_cycle_length(self, cycle_lengths: List[int]) -> float:
        if not cycle_lengths:
            return DEFAULT_CYCLE_LENGTH
        recent_first = list(reversed(cycle_lengths))  # most recent cycle first
        weights = [self.decay ** i for i in range(len(recent_first))]
        weighted_sum = sum(w * c for w, c in zip(weights, recent_first))
        return weighted_sum / sum(weights)

    def _is_irregular(self, cycle_lengths: List[int]) -> bool:
        if len(cycle_lengths) < 2:
            return False
        std = statistics.pstdev(cycle_lengths)
        out_of_range = any(
            c < IRREGULAR_RANGE[0] or c > IRREGULAR_RANGE[1] for c in cycle_lengths
        )
        return std > IRREGULAR_STD_THRESHOLD_DAYS or out_of_range

    def predict(self, history: CycleHistory) -> dict:
        if history.pregnancy_status != "not_pregnant":
            return {
                "status": "predictions_paused",
                "reason": f"pregnancy_status is '{history.pregnancy_status}'; "
                          "cycle prediction is not applicable.",
            }

        dates = sorted(history.period_start_dates)
        if not dates:
            return {"status": "insufficient_data", "reason": "no cycle history provided"}

        cycle_lengths = self._cycle_lengths(dates)
        avg_cycle_length = self._weighted_avg_cycle_length(cycle_lengths)
        avg_period_length = (
            round(sum(history.period_lengths) / len(history.period_lengths))
            if history.period_lengths else DEFAULT_PERIOD_LENGTH
        )
        irregular = self._is_irregular(cycle_lengths)

        last_period_start = dates[-1]
        predicted_next_period = last_period_start + timedelta(days=round(avg_cycle_length))
        ovulation_date = predicted_next_period - timedelta(days=14)
        fertile_window_start = ovulation_date - timedelta(days=5)
        fertile_window_end = ovulation_date + timedelta(days=1)

        result = {
            "status": "ok",
            "average_cycle_length_days": round(avg_cycle_length, 1),
            "average_period_length_days": avg_period_length,
            "predicted_next_period_start": predicted_next_period.isoformat(),
            "predicted_ovulation_date": ovulation_date.isoformat(),
            "fertile_window_start": fertile_window_start.isoformat(),
            "fertile_window_end": fertile_window_end.isoformat(),
            "is_cycle_irregular": irregular,
            "confidence": "low" if len(cycle_lengths) < 3 else (
                "medium" if irregular else "high"
            ),
            "disclaimer": (
                "Estimates based on your logged history, not a medical "
                "diagnosis. If cycles are consistently irregular or you're "
                "trying to conceive/avoid pregnancy, consult a gynecologist "
                "and consider clinical fertility tracking methods."
            ),
        }
        if irregular:
            result["note"] = (
                "Your recent cycle lengths vary more than typical — this can "
                "be normal but may also be worth discussing with a doctor, "
                "especially if it's a new pattern."
            )
        return result
