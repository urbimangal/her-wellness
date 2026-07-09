/* ===========================================================
   ML INTEGRATION — Period Prediction & Recommendations
   Insert this block into app.js, e.g. right after section
   "10. MENSTRUAL TRACKER — Calendar generation"
   Matches your actual Flask services (predictor.py on :5003,
   recommendation_engine.py on :5002).
   =========================================================== */

const PREDICTION_API_BASE = "http://localhost:5003";
const RECOMMENDATION_API_BASE = "http://localhost:5002";

async function callApi(base, path, payload) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error (${res.status})`);
  }
  return res.json();
}

/* -----------------------------------------------------------
   Period history — /predict needs actual logged dates, which
   nothing in the current app collects yet. This keeps a simple
   running log in localStorage so the demo has real input data.
   Swap this for a real backend-persisted log when you have one.
   ----------------------------------------------------------- */
const CYCLE_HISTORY_KEY = "hw_cycle_history";

function loadCycleHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(CYCLE_HISTORY_KEY));
    if (stored?.periodStartDates?.length) return stored;
  } catch (_) {}
  // Seed data so the calendar has something to predict from on first run.
  return {
    periodStartDates: ["2026-04-27", "2026-05-25", "2026-06-22"],
    periodLengths: [5, 5, 5],
  };
}

function saveCycleHistory(history) {
  localStorage.setItem(CYCLE_HISTORY_KEY, JSON.stringify(history));
}

state.cycleHistory = loadCycleHistory();

// Call this from a "Log period start" button (dateISO = "YYYY-MM-DD")
function logPeriodStart(dateISO, lengthDays = 5) {
  state.cycleHistory.periodStartDates.push(dateISO);
  state.cycleHistory.periodLengths.push(lengthDays);
  saveCycleHistory(state.cycleHistory);

  // force calendar + recommendations to rebuild with new data
  const grid = $("#cal-grid");
  if (grid) { grid.innerHTML = ""; delete grid.dataset.built; }
  buildCalendar();
}

/* -----------------------------------------------------------
   Prediction call — maps directly onto predictor.py's contract
   ----------------------------------------------------------- */
function fetchPeriodPrediction() {
  return callApi(PREDICTION_API_BASE, "/predict", {
    period_start_dates: state.cycleHistory.periodStartDates,
    period_lengths: state.cycleHistory.periodLengths,
    pregnancy_status: state.profile.pregnancyStatus || "not_pregnant",
  });
}

/* -----------------------------------------------------------
   Recommendation call — maps onto recommendation_engine.py's
   UserProfile fields. Pulls what it can from state.profile
   (already collected on the profile screen) and from the
   prediction result for cycle day / length.
   ----------------------------------------------------------- */
function fetchRecommendations(prediction) {
  const today = new Date();
  let menstrualCycleDay = null;
  let avgCycleLength = null;

  if (prediction?.status === "ok") {
    avgCycleLength = Math.round(prediction.average_cycle_length_days);
    const lastStart = new Date(
      state.cycleHistory.periodStartDates[state.cycleHistory.periodStartDates.length - 1]
    );
    const daysSince = Math.floor((today - lastStart) / (1000 * 60 * 60 * 24)) + 1;
    menstrualCycleDay = ((daysSince - 1) % avgCycleLength) + 1;
  }

  return callApi(RECOMMENDATION_API_BASE, "/recommend", {
    age: Number(state.profile.age) || 25,
    height_cm: Number(state.profile.height) || 165,
    weight_kg: Number(state.profile.weight) || 60,
    sex: "female",
    // Not yet collected on the profile form — add a field for this
    // if you want real personalization instead of this default.
    activity_level: state.profile.activityLevel || "moderate",
    menstrual_cycle_day: menstrualCycleDay,
    average_cycle_length: avgCycleLength,
    // Not yet collected either — important, since the prediction
    // service pauses cycle predictions entirely when pregnant.
    pregnancy_status: state.profile.pregnancyStatus || "not_pregnant",
    conditions: state.profile.conditions
      ? state.profile.conditions.split(",").map((c) => c.trim()).filter(Boolean)
      : [],
  });
}

/* -----------------------------------------------------------
   Rendering
   ----------------------------------------------------------- */
function dateRangeToDayNumbers(startISO, endISO) {
  if (!startISO || !endISO) return [];
  const start = new Date(startISO);
  const end = new Date(endISO);
  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(d.getDate());
  }
  return days;
}

function renderPredictionSummary(prediction) {
  const el = $("#predicted-next-period"); // add this element to your HTML
  if (!el) return;
  if (prediction.status !== "ok") {
    el.textContent = prediction.reason || "Not enough data yet";
    return;
  }
  const date = new Date(prediction.predicted_next_period_start);
  el.textContent = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  const badge = $("#cycle-regularity-badge");
  if (badge) {
    badge.textContent = prediction.is_cycle_irregular ? "Irregular" : "Regular";
    badge.classList.toggle("badge-warning", prediction.is_cycle_irregular);
  }
}

function renderRecommendations(rec) {
  const container = $("#recommendations-list"); // add this container to your HTML
  if (!container) return;

  if (!rec) {
    container.innerHTML = `<p class="text-muted">Recommendations unavailable.</p>`;
    return;
  }

  const cards = [
    rec.daily_tip && { title: "Today's tip", body: rec.daily_tip },
    rec.exercise_plan && { title: "Movement", body: rec.exercise_plan },
    rec.sleep_recommendation && { title: "Sleep", body: rec.sleep_recommendation },
    rec.water_intake_ml && { title: "Hydration", body: `${(rec.water_intake_ml / 1000).toFixed(1)}L target today` },
    ...(rec.diet_focus || []).map((tip) => ({ title: "Nutrition", body: tip })),
  ].filter(Boolean);

  container.innerHTML = "";
  cards.forEach(({ title, body }) => {
    const card = document.createElement("div");
    card.className = "recommendation-card";
    card.innerHTML = `<h4>${title}</h4><p>${body}</p>`;
    container.appendChild(card);
  });

  // Optional: sync the dashboard's water goal with the model's suggestion
  if (rec.water_intake_ml) {
    state.water.goal = +(rec.water_intake_ml / 1000).toFixed(2);
  }
}

async function loadRecommendations(prediction) {
  try {
    const rec = await fetchRecommendations(prediction);
    renderRecommendations(rec);
  } catch (err) {
    console.error("Recommendations unavailable", err);
    renderRecommendations(null);
  }
}

/* ===========================================================
   MODIFIED buildCalendar — replace the existing function.
   Handles the predictor's non-"ok" statuses (insufficient
   history, or paused because pregnancy_status isn't "not_pregnant").
   =========================================================== */
async function buildCalendar() {
  const grid = $("#cal-grid");
  if (!grid || grid.dataset.built) return;
  grid.dataset.built = "1";

  const dow = ["S", "M", "T", "W", "T", "F", "S"];
  dow.forEach((d) => {
    const cell = document.createElement("div");
    cell.className = "cal-dow";
    cell.textContent = d;
    grid.appendChild(cell);
  });

  const leadingBlank = 3;
  const totalDays = 31;
  const periodDays = [];
  const today = 8;

  let fertileDays = [];
  let predictedDays = [];

  try {
    const prediction = await fetchPeriodPrediction();
    renderPredictionSummary(prediction);

    if (prediction.status === "ok") {
      fertileDays = dateRangeToDayNumbers(prediction.fertile_window_start, prediction.fertile_window_end);
      predictedDays = dateRangeToDayNumbers(prediction.predicted_next_period_start, prediction.predicted_next_period_start);
      if (prediction.is_cycle_irregular) {
        toast("Your cycle has looked irregular lately — worth a mention to your doctor.", "info", 4000);
      }
      loadRecommendations(prediction);
    } else if (prediction.status === "insufficient_data") {
      toast("Log at least one period start date to see predictions.", "info", 3000);
      loadRecommendations(null);
    } else if (prediction.status === "predictions_paused") {
      toast(prediction.reason || "Cycle predictions are paused.", "info", 3000);
      loadRecommendations(null);
    }
  } catch (err) {
    console.error("Prediction service unavailable", err);
    toast("Couldn't reach the prediction service — check it's running on :5003.", "error", 3500);
    loadRecommendations(null);
  }

  for (let i = 0; i < leadingBlank; i++) {
    const cell = document.createElement("div");
    cell.className = "cal-day muted";
    cell.textContent = "";
    grid.appendChild(cell);
  }
  for (let d = 1; d <= totalDays; d++) {
    const cell = document.createElement("div");
    cell.className = "cal-day";
    cell.textContent = d;
    if (periodDays.includes(d)) cell.classList.add("period");
    if (fertileDays.includes(d)) cell.classList.add("fertile");
    if (predictedDays.includes(d)) cell.classList.add("predicted");
    if (d === today) cell.classList.add("today");
    grid.appendChild(cell);
  }
}

/* ===========================================================
   RUNNING THE BACKEND SERVICES
   -----------------------------------------------------------
   Both Flask apps default to debug mode with CORS disabled.
   For local dev, enable CORS in each app.py:

     pip install flask-cors

     from flask_cors import CORS
     CORS(app, origins=["http://localhost:YOUR_FRONTEND_PORT"])

   Run both alongside your Node backend:
     python app.py   (in the predictor folder, :5003)
     python app.py   (in the recommendation folder, :5002)
   =========================================================== */
