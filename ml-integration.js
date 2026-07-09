(function () {
  "use strict";
  const state = {
    registration: {
        name: "",
        email: "",
        phone: "",
        password: ""
    },
    profile: {},
    water: {
        current: 1.6,
        goal: 2.5
    },
    stress: 4,
    mood: "okay"
};

  /* ---------------------------------------------------------
     1. Utilities
     --------------------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function show(el) { el && el.classList.remove("hidden"); }
  function hide(el) { el && el.classList.add("hidden"); }

  function setButtonLoading(btn, loading, loadingText) {
    if (!btn) return;
    if (loading) {
      btn.dataset.originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span>${loadingText ? `<span>${loadingText}</span>` : ""}`;
    } else {
      if (btn.dataset.originalHtml) btn.innerHTML = btn.dataset.originalHtml;
      btn.disabled = false;
    }
  }

  // Simulate an async backend call (dummy data / no real API yet)
  function fakeRequest(ms = 900) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function initials(name) {
    if (!name) return "U";
    return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
  }

  /* ---------------------------------------------------------
     2. Toast notifications
     --------------------------------------------------------- */
  const toastRegion = $("#toast-region");
  const toastIcons = {
    success: "#ic-check",
    error: "#ic-x",
    info: "#ic-info",
  };
  function toast(message, type = "info", duration = 3400) {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `<svg><use href="${toastIcons[type] || toastIcons.info}"/></svg><span>${message}</span>`;
    toastRegion.appendChild(el);
    setTimeout(() => {
      el.classList.add("leaving");
      setTimeout(() => el.remove(), 260);
    }, duration);
  }
  window.HW_toast = toast; // exposed for quick debugging if needed

  /* ---------------------------------------------------------
     3. Initial page loader
     --------------------------------------------------------- */
  window.addEventListener("load", () => {
    const loader = $("#page-loader");
    setTimeout(() => {
      loader.style.opacity = "0";
      setTimeout(() => hide(loader), 350);
    }, 500);
  });

  /* ===========================================================
     4. REGISTRATION SCREEN — live password validation
     =========================================================== */
  const regForm = $("#form-register");
  const regName = $("#reg-name");
  const regPhone = $("#reg-phone");
  const regEmail = $("#reg-email");
  const regPassword = $("#reg-password");
  const regConfirm = $("#reg-confirm");
  const btnRegister = $("#btn-register");

  const pwRules = {
    len: (v) => v.length >= 8,
    upper: (v) => /[A-Z]/.test(v),
    lower: (v) => /[a-z]/.test(v),
    num: (v) => /[0-9]/.test(v),
    special: (v) => /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/.test(v),
  };

  function validatePasswordLive() {
    const val = regPassword.value;
    let allMet = true;
    Object.keys(pwRules).forEach((rule) => {
      const met = pwRules[rule](val);
      const row = $(`.pw-check[data-rule="${rule}"]`);
      row.classList.toggle("met", met);
      if (!met) allMet = false;
    });
    return allMet;
  }

  function validateRegistrationForm(showErrors) {
    let valid = true;

    const nameOk = regName.value.trim().length >= 2;
    toggleFieldError("reg-name", "err-reg-name", nameOk, showErrors);
    if (!nameOk) valid = false;

    const phoneOk = /^[6-9]\d{9}$/.test(regPhone.value.trim());
    toggleFieldError("reg-phone", "err-reg-phone", phoneOk, showErrors);
    if (!phoneOk) valid = false;

    // Email Validation
    const emailOk =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            regEmail.value.trim()
        );

    toggleFieldError(
        "reg-email",
        "err-reg-email",
        emailOk,
        showErrors
    );

    if (!emailOk)
        valid = false;

    const pwOk = validatePasswordLive();
    if (!pwOk) valid = false;

    const confirmOk =
        regConfirm.value.length > 0 &&
        regConfirm.value === regPassword.value;

    toggleFieldError(
        "reg-confirm",
        "err-reg-confirm",
        confirmOk,
        showErrors
    );

    if (!confirmOk) valid = false;

    return valid;
}

  function toggleFieldError(inputId, errorId, isValid, showErrors) {
    const input = $(`#${inputId}`);
    const err = $(`#${errorId}`);
    if (!input) return;
    if (isValid) {
      input.classList.remove("error");
      input.classList.add("valid");
      if (err) err.classList.remove("show");
    } else {
      input.classList.remove("valid");
      if (showErrors && input.value.length > 0) {
        input.classList.add("error");
        if (err) err.classList.add("show");
      } else {
        input.classList.remove("error");
        if (err) err.classList.remove("show");
      }
    }
  }
  function refreshRegisterState() {
    const valid = validateRegistrationForm(false);
    btnRegister.disabled = !valid;
}

[regName, regPhone, regEmail, regConfirm].forEach((el) => {
    el.addEventListener("input", refreshRegisterState);
});

regPassword.addEventListener("input", () => {
    validatePasswordLive();
    refreshRegisterState();
});

regPhone.addEventListener("input", () => {
    regPhone.value = regPhone.value.replace(/\D/g, "").slice(0, 10);
});

// Password visibility
$$(".toggle-visibility").forEach((btn) => {
    btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-toggle-for");
        const input = $(`#${targetId}`);

        input.type =
            input.type === "password" ? "text" : "password";

        btn.textContent =
            input.type === "password" ? "SHOW" : "HIDE";
    });
});

// Register
regForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateRegistrationForm(true)) {
        toast("Please fix the highlighted fields.", "error");
        return;
    }

    state.registration = {
        name: regName.value.trim(),
        email: regEmail.value.trim(),
        phone: regPhone.value.trim(),
        password: regPassword.value
    };

    setButtonLoading(
        btnRegister,
        true,
        "Creating Account..."
    );

    try {

        const response = await fetch(
            "http://localhost:5000/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName: state.registration.name,
                    email: state.registration.email,
                    phone: state.registration.phone,
                    password: state.registration.password,
                    confirmPassword: regConfirm.value
                })
            }
        );

        const data = await response.json();

        setButtonLoading(btnRegister, false);

        if (!response.ok) {
            toast(data.message, "error");
            return;
        }

        localStorage.setItem(
            "userId",
            data.data.userId,
            console.log(data)
        );
        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        toast(
            "Registration Successful",
            "success"
        );

        goToProfileScreen();

    } catch (err) {

        setButtonLoading(btnRegister, false);

        toast(
            "Server Error",
            "error"
        );

        console.error(err);
    }
});

// Login
$("#link-to-login").addEventListener("click", (e) => {
    e.preventDefault();

    toast(
        "Login screen will be added next.",
        "info"
    );
});
  

  /* ===========================================================
   5. SCREEN NAVIGATION 
=========================================================== */

const screenRegister = $("#screen-register");
const screenProfile = $("#screen-profile");

function goToProfileScreen() {
    hide(screenRegister);
    show(screenProfile);
}

  /* ===========================================================
     6. COMPLETE PROFILE SCREEN
     =========================================================== */
  const profileForm = $("#form-profile");
  const btnSaveProfile = $("#btn-save-profile");

  function validateProfileForm() {
    let valid = true;
    const checks = [
      ["p-age", "err-p-age", (v) => +v >= 10 && +v <= 90],
      ["p-blood", "err-p-blood", (v) => v.trim().length > 0],
      ["p-height", "err-p-height", (v) => +v >= 100 && +v <= 220],
      ["p-weight", "err-p-weight", (v) => +v >= 25 && +v <= 200],
      ["p-ec-name", "err-p-ec-name", (v) => v.trim().length >= 2],
      ["p-ec-number", "err-p-ec-number", (v) => /^[6-9]\d{9}$/.test(v.trim())],
    ];
    checks.forEach(([inputId, errId, fn]) => {
      const input = $(`#${inputId}`);
      const ok = fn(input.value);
      toggleFieldError(inputId, errId, ok, true);
      if (!ok) valid = false;
    });
    return valid;
  }

  $("#p-ec-number").addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
  });

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) {
      toast("Please complete the required fields.", "error");
      return;
    }
    state.profile = {
      age: $("#p-age").value,
      blood: $("#p-blood").value,
      height: $("#p-height").value,
      weight: $("#p-weight").value,
      ecName: $("#p-ec-name").value,
      ecNumber: $("#p-ec-number").value,
      conditions: $("#p-conditions").value,
      allergies: $("#p-allergies").value,
    };

    setButtonLoading(btnSaveProfile, true, "Saving...");
    await fakeRequest(1100);
    setButtonLoading(btnSaveProfile, false);

    toast(`Welcome to HerWellness, ${state.registration.name.split(" ")[0]}!`, "success");
    enterDashboard();
  });

  /* ===========================================================
     7. ENTER APP SHELL / DASHBOARD
     =========================================================== */
  const appShell = $("#app-shell");

  function enterDashboard() {
    hide(screenProfile);
    show(appShell);
    populateUserChrome();
    buildCalendar();
    buildMoodChart();
    buildFitnessChart();
    navigateTo("dashboard");
  }

  function populateUserChrome() {
    const name = state.registration.name || "Ananya Sharma";
    const first = name.split(" ")[0];
    $("#topbar-user-name").textContent = first;
    $("#topbar-avatar").textContent = initials(name);
    $("#profile-name").textContent = name;
    $("#profile-avatar").textContent = initials(name);
    if (state.registration.phone) {
      $("#profile-phone").textContent = "+91 " + state.registration.phone;
    }
    if (state.profile.age) $("#view-age").value = state.profile.age;
    if (state.profile.blood) $("#view-blood").value = state.profile.blood;
    if (state.profile.height) $("#view-height").value = state.profile.height;
    if (state.profile.weight) $("#view-weight").value = state.profile.weight;
    if (state.profile.ecName) $("#view-ec-name").value = state.profile.ecName;
    if (state.profile.ecNumber) $("#view-ec-number").value = state.profile.ecNumber;
  }

  /* ---------------------------------------------------------
     8. Sidebar navigation / routing (in-app, hash-free)
     --------------------------------------------------------- */
  const pageTitles = {
    dashboard: ["Overview", "Welcome back"],
    menstrual: ["Health Modules", "Menstrual Tracker"],
    pregnancy: ["Health Modules", "Pregnancy Care"],
    mental: ["Health Modules", "Mental Wellness"],
    fitness: ["Health Modules", "Fitness"],
    ai: ["Health Modules", "AI Health Assistant"],
    sos: ["Support", "Emergency SOS"],
    community: ["Support", "Community"],
    analytics: ["Insights", "Analytics"],
    notifications: ["Support", "Notifications"],
    profile: ["Account", "Your Profile"],
  };

  function navigateTo(pageKey) {
    $$(".page").forEach((p) => hide(p));
    const target = $(`#page-${pageKey}`);
    if (target) show(target);

    $$(".nav-item[data-page]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-page") === pageKey);
    });

    const [eyebrow, title] = pageTitles[pageKey] || ["", ""];
    $("#topbar-eyebrow").textContent = eyebrow;
    $("#topbar-title").textContent = pageKey === "dashboard"
      ? `Welcome back, ${(state.registration.name || "there").split(" ")[0]}`
      : title;

    closeMobileSidebar();
    $(".page-content").scrollTo?.({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  $$("[data-page]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const key = el.getAttribute("data-page");
      if (key) navigateTo(key);
    });
  });

  /* Mobile sidebar toggle */
  const sidebar = $("#sidebar");
  const sidebarScrim = $("#sidebar-scrim");
  function openMobileSidebar() { sidebar.classList.add("open"); sidebarScrim.classList.add("show"); }
  function closeMobileSidebar() { sidebar.classList.remove("open"); sidebarScrim.classList.remove("show"); }
  $("#btn-menu-toggle").addEventListener("click", openMobileSidebar);
  sidebarScrim.addEventListener("click", closeMobileSidebar);

  /* Logout */
  function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    hide(appShell);
    show(screenRegister);

    toast("You've been logged out.", "info");
}
  $("#btn-logout").addEventListener("click", (e) => { e.preventDefault(); logout(); });
  $("#btn-logout-2").addEventListener("click", logout);

  $("#btn-search").addEventListener("click", () => toast("Search is a UI preview in this demo.", "info"));

  /* ===========================================================
     9. DASHBOARD — Water intake quick add
     =========================================================== */
  $("#btn-add-water").addEventListener("click", () => {
    state.water.current = Math.min(state.water.goal, +(state.water.current + 0.25).toFixed(2));
    toast(`Water intake logged — ${state.water.current}L today`, "success");
  });

  /* ===========================================================
     10. MENSTRUAL TRACKER — Calendar generation (dummy data)
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


    // July 2026 starts on a Wednesday; 31 days. Period: Jun 22-26 (shown as muted lead days),
    // fertile window Jul 12-17, today = Jul 8, predicted next period starts Jul 20.
    const leadingBlank = 3; // Wed is index 3 (Sun=0)
    const totalDays = 31;
    const periodDays = []; // none in July start range shown, but let's mark none early
    const fertileDays = [12, 13, 14, 15, 16, 17];
    const predictedDays = [20, 21, 22, 23, 24];
    const today = 8;

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
     11. MENTAL WELLNESS — Mood selector + stress slider
     =========================================================== */
  $$(".mood-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".mood-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.mood = btn.getAttribute("data-mood");
      toast("Mood logged for today.", "success", 2200);
    });
  });

  const stressSlider = $("#stress-slider");
  const stressVal = $("#stress-val");
  if (stressSlider) {
    stressSlider.addEventListener("input", () => {
      stressVal.textContent = `${stressSlider.value} / 10`;
      state.stress = +stressSlider.value;
    });
  }

  /* ===========================================================
     12. AI HEALTH ASSISTANT — canned chat
     =========================================================== */
  const chatLog = $("#chat-log");
  const chatForm = $("#form-chat");
  const chatInput = $("#chat-input");
  const btnMic = $("#btn-mic");

  const aiResponses = {
    "why are my periods irregular?": "Irregular cycles can stem from stress, big changes in weight, thyroid shifts, or conditions like PCOS. Tracking a few cycles here will help spot a pattern — if it continues past 2–3 months, it's worth flagging to your doctor.",
    "foods to ease cramps": "Warm foods rich in magnesium — like leafy greens, bananas, and dark chocolate — along with ginger tea and staying hydrated, can help ease cramps for many people. Gentle heat on the lower abdomen helps too.",
    "is my headache pregnancy-related?": "Mild headaches are common in pregnancy due to hormone and blood volume changes. If it's severe, sudden, or paired with vision changes or swelling, contact your doctor right away — those can signal something that needs quick attention.",
    "tips to reduce stress": "Short breathing breaks, a consistent sleep schedule, and 10–15 minutes of movement a day can meaningfully lower stress. The meditation cards in your Mental Wellness tab are a good place to start.",
  };

  function addBubble(text, who) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${who}`;
    bubble.textContent = text;
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
    return bubble;
  }

  function addTypingIndicator() {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble ai";
    bubble.innerHTML = `<span class="typing-dots"><span></span><span></span><span></span></span>`;
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
    return bubble;
  }

  async function sendChatMessage(text) {
    if (!text.trim()) return;
    addBubble(text, "user");
    chatInput.value = "";
    const typing = addTypingIndicator();
    await fakeRequest(1000);
    typing.remove();
    const key = text.trim().toLowerCase();
    const reply = aiResponses[key] || "Thanks for sharing that. While I can offer general wellness guidance, for anything specific to your symptoms it's best to confirm with your doctor. Would you like a few general tips in the meantime?";
    addBubble(reply, "ai");
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendChatMessage(chatInput.value);
  });

  $$(".chip-suggest").forEach((chip) => {
    chip.addEventListener("click", () => sendChatMessage(chip.textContent));
  });

  btnMic.addEventListener("click", () => {
    btnMic.classList.toggle("listening");
    if (btnMic.classList.contains("listening")) {
      toast("Listening... (voice UI preview only)", "info", 2000);
      setTimeout(() => btnMic.classList.remove("listening"), 2200);
    }
  });

  /* ===========================================================
     13. EMERGENCY SOS
     =========================================================== */
  const modalRoot = $("#modal-root");

  function openModal(html) {
    modalRoot.innerHTML = `<div class="modal-overlay" id="active-modal">${html}</div>`;
    $("#active-modal").addEventListener("click", (e) => {
      if (e.target.id === "active-modal") closeModal();
    });
  }
  function closeModal() { modalRoot.innerHTML = ""; }
  window.HW_closeModal = closeModal;

  function triggerSos() {
    openModal(`
      <div class="modal-box" style="text-align:center;">
        <span class="icon-badge bg-coral" style="width:56px;height:56px;margin:0 auto 14px;"><svg style="width:26px;height:26px;"><use href="#ic-alert"/></svg></span>
        <h3>Send emergency alert?</h3>
        <p>This will notify Riya Sharma and Anil Kumar with your live location.</p>
        <div style="display:flex; gap:10px; margin-top:18px;">
          <button class="btn btn-secondary btn-block" onclick="window.HW_closeModal()">Cancel</button>
          <button class="btn btn-danger btn-block" id="confirm-sos">Send Alert</button>
        </div>
      </div>
    `);
    $("#confirm-sos").addEventListener("click", async () => {
      setButtonLoading($("#confirm-sos"), true, "Sending...");
      await fakeRequest(1200);
      closeModal();
      toast("Emergency alert sent to your contacts.", "success", 4000);
    });
  }
  $("#btn-sos-main").addEventListener("click", triggerSos);
  $("#btn-sos-quick").addEventListener("click", () => { navigateTo("sos"); });

  $$(".call-btn").forEach((btn) => {
    btn.addEventListener("click", () => toast("Dialing... (UI preview only)", "info", 2000));
  });

  /* ===========================================================
     14. COMMUNITY — post button (dummy)
     =========================================================== */
  $$("#page-community textarea").forEach((ta) => {
    const btn = ta.closest(".card").querySelector(".btn-primary");
    if (btn) btn.addEventListener("click", async () => {
      if (!ta.value.trim()) { toast("Write something before posting.", "error"); return; }
      setButtonLoading(btn, true, "Posting...");
      await fakeRequest(700);
      setButtonLoading(btn, false);
      ta.value = "";
      toast("Your post has been shared with the community.", "success");
    });
  });

  /* ===========================================================
     15. ANALYTICS — bar charts (dummy data, built once)
     =========================================================== */
  function buildBarChart(containerId, data, color) {
    const el = $(`#${containerId}`);
    if (!el || el.dataset.built) return;
    el.dataset.built = "1";
    const max = Math.max(...data.map((d) => d.value));
    data.forEach((d) => {
      const col = document.createElement("div");
      col.className = "bar-col";
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.background = color;
      bar.style.height = "0%";
      const label = document.createElement("span");
      label.className = "bar-label";
      label.textContent = d.label;
      col.appendChild(bar);
      col.appendChild(label);
      el.appendChild(col);
      requestAnimationFrame(() => {
        setTimeout(() => { bar.style.height = `${(d.value / max) * 100}%`; }, 60);
      });
    });
  }

  function buildMoodChart() {
    buildBarChart("mood-chart", [
      { label: "Mon", value: 6 },
      { label: "Tue", value: 8 },
      { label: "Wed", value: 5 },
      { label: "Thu", value: 7 },
      { label: "Fri", value: 9 },
      { label: "Sat", value: 8 },
      { label: "Sun", value: 6 },
    ], "var(--plum-600)");
  }

  function buildFitnessChart() {
    buildBarChart("fitness-chart", [
      { label: "Mon", value: 5200 },
      { label: "Tue", value: 6800 },
      { label: "Wed", value: 4100 },
      { label: "Thu", value: 7300 },
      { label: "Fri", value: 6240 },
      { label: "Sat", value: 8900 },
      { label: "Sun", value: 5100 },
    ], "var(--sage-600)");
  }

  /* ===========================================================
     16. PROFILE — edit toggle + change password modal
     =========================================================== */
  let profileEditing = false;
  $("#btn-edit-profile").addEventListener("click", () => {
    profileEditing = !profileEditing;
    $$(".profile-grid input").forEach((inp) => (inp.disabled = !profileEditing));
    const btn = $("#btn-edit-profile");
    btn.innerHTML = profileEditing
      ? `<svg style="width:13px;height:13px;"><use href="#ic-check"/></svg> Save`
      : `<svg style="width:13px;height:13px;"><use href="#ic-edit"/></svg> Edit`;
    if (!profileEditing) toast("Profile details updated.", "success");
  });

  $("#btn-change-password").addEventListener("click", () => {
    openModal(`
      <div class="modal-box">
        <h3>Change password</h3>
        <p class="text-muted">Choose a new password that meets all security requirements.</p>
        <div class="field" style="margin-top:16px;">
          <label>Current password</label>
          <input class="input" type="password" placeholder="Enter current password">
        </div>
        <div class="field">
          <label>New password</label>
          <input class="input" type="password" placeholder="Enter new password">
        </div>
        <div class="field">
          <label>Confirm new password</label>
          <input class="input" type="password" placeholder="Re-enter new password">
        </div>
        <div style="display:flex; gap:10px; margin-top:8px;">
          <button class="btn btn-secondary btn-block" onclick="window.HW_closeModal()">Cancel</button>
          <button class="btn btn-primary btn-block" id="confirm-pw-change">Update</button>
        </div>
      </div>
    `);
    $("#confirm-pw-change").addEventListener("click", async () => {
      setButtonLoading($("#confirm-pw-change"), true, "Updating...");
      await fakeRequest(900);
      closeModal();
      toast("Password updated successfully.", "success");
    });
  });

})();


/* ===========================================================
   ML INTEGRATION — Period Prediction & Recommendations
   Insert this block into app.js, e.g. right after section
   "10. MENSTRUAL TRACKER — Calendar generation"
   Matches your actual Flask services (predictor.py on :5003,
   recommendation_engine.py on :5002).
   =========================================================== */

