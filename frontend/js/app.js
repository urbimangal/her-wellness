/* =========================================================
   HerWellness — Application Logic
   Frontend-only. All data is in-memory dummy data;
   backend APIs to be integrated later.
   ========================================================= */
(function () {
  "use strict";
  const API_BASE_URL = "http://localhost:5000/api";
  /* ---------------------------------------------------------
     0. In-memory app state (stands in for backend/session)
     --------------------------------------------------------- */
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
  async function apiRequest(url, options = {}) {

    const token = getToken();

    try {

        const response = await fetch(url, {

            ...options,

            headers: {

                "Content-Type": "application/json",

                ...(token && {
                    Authorization: `Bearer ${token}`
                }),

                ...options.headers
            }

        });

        let data = {};

        try {
            data = await response.json();
        }
        catch {}

        return { response, data };

    }

    catch {

        return {

            response: {
                ok: false,
                status: 500
            },

            data: {
                message: "Network Error"
            }

        };

    }

}
// ==========================================
// Common Helpers
// ==========================================

function getToken() {
    return localStorage.getItem("token");
}

function saveLocal(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadLocal(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
}

function setHTML(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = value;
    }
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
  if (!toastRegion) return;

  const el = document.createElement("div");
  el.className = `toast ${type}`;

  el.innerHTML = `
    <svg>
      <use href="${toastIcons[type] || toastIcons.info}"></use>
    </svg>
    <span>${message}</span>
  `;

  toastRegion.appendChild(el);

  setTimeout(() => {
    el.classList.add("leaving");

    setTimeout(() => {
      el.remove();
    }, 260);

  }, duration);
}

window.HW_toast = toast;
  
  /* ---------------------------------------------------------
     3. Initial page loader
     --------------------------------------------------------- */
  window.addEventListener("load", () => {
    const loader = $("#page-loader");

    if (!loader) return;

    setTimeout(() => {
        loader.style.opacity = "0";

        setTimeout(() => {
            hide(loader);
        }, 350);

    }, 500);
});
window.addEventListener("DOMContentLoaded", autoLogin);

async function autoLogin() {

    const token = getToken();
    if (!token) return;

    try {

        const { response, data } = await apiRequest(
    `${API_BASE_URL}/profile`
);

        if (!response.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            return;
        }


        state.profile = data.data.user;

        state.registration = {
            name: data.data.user.fullName,
            email: data.data.user.email,
            phone: data.data.user.phone
        };

        enterDashboard();

    } catch (err) {
    toast("Unable to restore session", "error");
    }

}

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

      if (row) {
          row.classList.toggle("met", met);
      }
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

        const { response, data } = await apiRequest(
        `${API_BASE_URL}/auth/register`,
        {
            method: "POST",
            body: JSON.stringify({
                fullName: state.registration.name,
                email: state.registration.email,
                phone: state.registration.phone,
                password: state.registration.password,
                confirmPassword: regConfirm.value
            })
        }
      );
        if (response.status === 409) {
    setButtonLoading(btnRegister, false);
    toast("User already exists", "error");
    return;
}
        if (!response.ok) {
            setButtonLoading(btnRegister, false);
            toast(data.message || "Something went wrong", "error");
            return;
        }


        localStorage.setItem(
            "userId",
            data.data.userId
        );
        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        setButtonLoading(btnRegister, false);
        toast(
            "Registration Successful",
            "success"
        );
        regForm.reset();
        refreshRegisterState();
        goToProfileScreen();

    } catch (err) {

        setButtonLoading(btnRegister, false);

        toast(
            "Server Error",
            "error"
        );

    }
});

// Login
$("#link-to-login").addEventListener("click", (e) => {
    e.preventDefault();
    goToLoginScreen();
});

const loginForm = $("#form-login");

const loginEmail = $("#login-email");

const loginPassword = $("#login-password");

const btnLogin = $("#btn-login");

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = loginEmail.value.trim();

    const password = loginPassword.value;

    if (!email || !password) {

        toast("Please fill all fields.", "error");

        return;

    }

    setButtonLoading(btnLogin, true, "Logging in...");

    try {

        const { response, data } = await apiRequest(
          `${API_BASE_URL}/auth/login`,
          {
              method: "POST",
              body: JSON.stringify({
                  identifier: email,
                  password
              })
          }
        );
        if (response.status === 401) {

          setButtonLoading(btnLogin, false);

          toast("Invalid Email or Password", "error");

          return;

        }
        if (!response.ok) {

            setButtonLoading(btnLogin, false);

            toast(data.message || "Something went wrong", "error");

            return;

        }

        localStorage.setItem("token", data.token);

        localStorage.setItem("userId", data.data.userId);

       const {
        response: profileResponse,
        data: profileData
    } = await apiRequest(
        `${API_BASE_URL}/profile`
    ); 
      if (!profileResponse.ok) {
        setButtonLoading(btnLogin, false);
        toast("Unable to load profile", "error");
        return;
      }
    state.profile = profileData.data.user;
    state.registration.name = profileData.data.user.fullName;
    state.registration.email = profileData.data.user.email;
    state.registration.phone = profileData.data.user.phone;




        toast("Login Successful", "success");

        setButtonLoading(btnLogin, false);
        loginForm.reset();
        enterDashboard();

    }

    catch (err) {

        setButtonLoading(btnLogin, false);


        toast("Server Error", "error");

    }

});

$("#link-to-register").addEventListener("click", (e) => {
    e.preventDefault();
    goToRegisterScreen();
});
  

  /* ===========================================================
   5. SCREEN NAVIGATION 
=========================================================== */

const screenRegister = $("#screen-register");
const screenLogin = $("#screen-login");
const screenProfile = $("#screen-profile");

function goToLoginScreen() {
    hide(screenRegister);
    hide(screenProfile);
    show(screenLogin);
}

function goToRegisterScreen() {
    hide(screenLogin);
    hide(screenProfile);
    show(screenRegister);
}

function goToProfileScreen() {
    hide(screenRegister);
    hide(screenLogin);
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
      ["p-ec-number1", "err-p-ec-number1", (v) => /^[6-9]\d{9}$/.test(v.trim())],
      ["p-ec-number2", "err-p-ec-number2", (v) => /^[6-9]\d{9}$/.test(v.trim())],
    ];
    checks.forEach(([inputId, errId, fn]) => {
      const input = $(`#${inputId}`);
      const ok = fn(input.value);
      toggleFieldError(inputId, errId, ok, true);
      if (!ok) valid = false;
    });
    return valid;
  }

  ["#p-ec-number1", "#p-ec-number2"].forEach((id) => {
    const input = $(id);

    if (!input) return;

    input.addEventListener("input", (e) => {
        e.target.value = e.target.value
            .replace(/\D/g, "")
            .slice(0, 10);
    });
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
      emergencyNumber1: $("#p-ec-number1").value,
      emergencyNumber2: $("#p-ec-number2").value,
      conditions: $("#p-conditions").value,
      allergies: $("#p-allergies").value,
    };

    setButtonLoading(btnSaveProfile, true, "Saving...");
    

try {

    const { response, data } = await apiRequest(
    `${API_BASE_URL}/profile`,
    {
        method: "PUT",
        body: JSON.stringify({
            age: Number(state.profile.age),
            bloodGroup: state.profile.blood,
            height: Number(state.profile.height),
            weight: Number(state.profile.weight),
            emergencyContact1: state.profile.emergencyNumber1,
            emergencyContact2: state.profile.emergencyNumber2,
            medicalConditions: state.profile.conditions,
            allergies: state.profile.allergies
        })
    }
);
    
if (response.status === 401) {

    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    toast("Session Expired. Please Login Again.","error");

    logout();

    return;

}
if (!response.ok) {
    setButtonLoading(btnSaveProfile, false);
    toast(data.message || "Something went wrong", "error");
    return;
}


state.profile = data.data.user;
setButtonLoading(btnSaveProfile, false);
toast("Profile Saved Successfully", "success");
enterDashboard();

}

catch(err){

    setButtonLoading(btnSaveProfile,false);

    toast("Server Error","error");

}
  });

  /* ===========================================================
     7. ENTER APP SHELL / DASHBOARD
     =========================================================== */
  const appShell = $("#app-shell");

  function enterDashboard() {
    hide(screenRegister);
    hide(screenLogin);
    hide(screenProfile);

    show(appShell);

    populateUserChrome();

    if (predictionData) {
        buildPredictionCalendar(predictionData);
    }

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
    if (state.profile.bloodGroup) $("#view-blood").value = state.profile.bloodGroup;
    if (state.profile.height) $("#view-height").value = state.profile.height;
    if (state.profile.weight) $("#view-weight").value = state.profile.weight;
    if (state.profile.emergencyContact1) $("#view-ec-number1").value = state.profile.emergencyContact1;
    if (state.profile.emergencyContact2) $("#view-ec-number2").value = state.profile.emergencyContact2;
    if (state.profile.medicalConditions) $("#view-conditions").value = state.profile.medicalConditions;
    if (state.profile.allergies) $("#view-allergies").value = state.profile.allergies;
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

    state.profile = {};
    state.registration = {
      name: "",
      email: "",
      phone: "",
      password: ""
    };
    hide(screenLogin);
    hide(screenProfile);
    hide(appShell);

    show(screenRegister);

    toast("You've been logged out.", "info");
    regForm.reset();
    loginForm.reset();
    profileForm.reset();
    setButtonLoading(btnRegister, false);
    setButtonLoading(btnLogin, false);
    setButtonLoading(btnSaveProfile, false);
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

const API_BASE = `${API_BASE_URL}/ml`;
let predictionData = null;
const cycleContainer = document.getElementById("cycle-history-container");
const addCycleBtn = document.getElementById("btn-add-cycle");
const predictBtn = document.getElementById("btn-predict-cycle");
function loadCycleHistory() {

    const history = loadLocal("cycleHistory");

if(!history) return;

    cycleContainer.innerHTML = "";

    history.period_start_dates.forEach((date, index) => {

        addCycleRow(
            date,
            history.period_lengths[index]
        );

    });

    document.getElementById("pregnancy-status").value =
        history.pregnancy_status;

}
// Default Initialization
document.addEventListener("DOMContentLoaded", () => {
    initMenstrualTracker();
    loadPrediction();
});

// ------------------------------------------
// Initialize
// ------------------------------------------

function initMenstrualTracker() {

    cycleContainer.innerHTML = "";

loadCycleHistory();

if (!cycleContainer.children.length) {

    for (let i = 0; i < 4; i++) {

        addCycleRow();

    }

}
}
function clearCycleHistory(){

    localStorage.removeItem("cycleHistory");

    localStorage.removeItem("lastPrediction");

    predictionData = null;

    cycleContainer.innerHTML = "";

    for(let i=0;i<4;i++){

        addCycleRow();

    }

    toast("History Cleared");

}

// ------------------------------------------
// Add New Cycle Row
// ------------------------------------------

function addCycleRow(date = "", length = 5) {

    const row = document.createElement("div");

    row.className = "cycle-row";

    row.innerHTML = `

        <input
            type="date"
            class="input cycle-date"
            value="${date}"
        >

        <input
            type="number"
            class="input cycle-length"
            min="1"
            max="10"
            value="${length}"
        >

        <button
            type="button"
            class="btn btn-danger btn-remove-cycle"
        >
            Remove
        </button>

    `;

    cycleContainer.appendChild(row);

}

// ------------------------------------------
// Remove Row
// ------------------------------------------

cycleContainer.addEventListener("click", (e) => {

    if (!e.target.classList.contains("btn-remove-cycle"))
        return;

    const rows =
        document.querySelectorAll(".cycle-row");

    if (rows.length <= 2) {

        toast("Minimum 2 cycles required.");

        return;

    }

    e.target.closest(".cycle-row").remove();

});

// ------------------------------------------
// Add Row Button
// ------------------------------------------
if(addCycleBtn){

    addCycleBtn.addEventListener("click", () => {
    
        addCycleRow();
    
    });
}

// ------------------------------------------
// Validate Input
// ------------------------------------------

function validateCycleHistory() {

    const dates =
        document.querySelectorAll(".cycle-date");

    const lengths =
        document.querySelectorAll(".cycle-length");

    if (dates.length < 2) {

        toast("Enter at least 2 previous cycles.");

        return false;

    }

    for (let i = 0; i < dates.length; i++) {

        if (!dates[i].value) {

            toast(
                `Select period date for cycle ${i + 1}`
            );

            dates[i].focus();

            return false;

        }

        const len = Number(lengths[i].value);

        if (len < 1 || len > 10) {

            toast(
                `Invalid period length in cycle ${i + 1}`
            );

            lengths[i].focus();

            return false;

        }

    }

    return true;

}

// ------------------------------------------
// Collect History
// ------------------------------------------

function collectCycleHistory() {

    const dates =
        document.querySelectorAll(".cycle-date");

    const lengths =
        document.querySelectorAll(".cycle-length");

    const period_start_dates = [];

    const period_lengths = [];

    dates.forEach((item) => {

        period_start_dates.push(item.value);

    });

    lengths.forEach((item) => {

        period_lengths.push(
            Number(item.value)
        );

    });

    return {

        period_start_dates,

        period_lengths,

        pregnancy_status:
            document.getElementById("pregnancy-status")
                .value

    };
  }
    // ==========================================
// PREDICT CYCLE
// ==========================================
if(predictBtn){

    predictBtn.addEventListener("click", predictCycle);
}

async function predictCycle() {

    if (!validateCycleHistory()) return;

    const payload = collectCycleHistory();

    console.log("Sending Payload :", payload);

    try {

        setPredictionLoading(true);

        const token = getToken();

        const response = await fetch(
            `${API_BASE}/predict`,
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify(payload)

            }
        );

        const result = await response.json();

        console.log(result);

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Prediction Failed"
            );

        }
        
        predictionData = result.data;

        updatePredictionUI(result.data);

        buildPredictionCalendar(result.data);

        savePrediction(result.data);
        saveCycleHistory();
        toast("Prediction Generated Successfully");

    }

    catch (err) {

        console.error(err);

        toast(err.message);

    }

    finally {

        setPredictionLoading(false);

    }
  }
  function saveCycleHistory() {

    const history = collectCycleHistory();

    saveLocal("cycleHistory", history);

}
    // ==========================================
// BUTTON LOADER
// ==========================================

function setPredictionLoading(status) {

    if (status) {

        predictBtn.disabled = true;

        predictBtn.innerHTML =
            "Predicting...";

    }

    else {

        predictBtn.disabled = false;

        predictBtn.innerHTML =
            "Predict Cycle";

    }
  }
    // ==========================================
// SAVE LAST PREDICTION
// ==========================================

function savePrediction(data) {

    saveLocal("lastPrediction", data);

}
// ==========================================
// LOAD SAVED DATA
// ==========================================

function loadPrediction() {

    const data = loadLocal("lastPrediction");

if(!data) return;

    predictionData = data;

    updatePredictionUI(data);

    buildPredictionCalendar(data);

}

// =====================================
// UPDATE PREDICTION CARDS
// =====================================
function formatDate(date){

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day:"numeric",
            month:"short",
            year:"numeric"
        }
    );

}
function updatePredictionUI(data) {

    setHTML(
"cycle-day",
`Average Cycle : <strong>${data.average_cycle_length_days} Days</strong>`
);



    setText(
"last-period-result",
formatDate(data.predicted_next_period_start)
);



   setText(
"cycle-length-result",
`${data.average_cycle_length_days} Days`
);


    setText(
"period-length-result",
`${data.average_period_length_days} Days`
);


    setText(
    "next-period-result",
    formatDate(data.predicted_next_period_start)
);



    setText(
    "fertile-window-result",
    `${formatDate(data.fertile_window_start)} - ${formatDate(data.fertile_window_end)}`
);



   setText(
    "ovulation-result",
    "Ovulation : " + formatDate(data.predicted_ovulation_date)
);


setText(
    "prediction-confidence",
    data.confidence.toUpperCase()
);
setText(
    "prediction-note",
    data.note || "Your cycle appears healthy."
);

    }
    
    
// =====================================
// BUILD CALENDAR
// =====================================
let currentCalendarMonth = null;
let currentCalendarYear = null;
let currentPrediction = null;
function buildPredictionCalendar(data) {
    
    const grid = document.getElementById("cal-grid");

    grid.innerHTML = "";



    const days =

        ["S", "M", "T", "W", "T", "F", "S"];



    days.forEach(day => {

        const cell = document.createElement("div");

        cell.className = "cal-dow";

        cell.innerHTML = day;

        grid.appendChild(cell);

    });

    if (!data) return;

    currentPrediction = data;

const predictionDate = new Date(data.predicted_next_period_start);

if (currentCalendarMonth === null) {
    currentCalendarMonth = predictionDate.getMonth();
    currentCalendarYear = predictionDate.getFullYear();
}

const month = currentCalendarMonth;
const year = currentCalendarYear;



    const displayDate = new Date(year, month);

document.getElementById("calendar-month").textContent =
displayDate.toLocaleString("default", {
    month: "long",
    year: "numeric"
});




    const firstDay =

        new Date(

            year,

            month,

            1

        ).getDay();



    const totalDays =

        new Date(

            year,

            month + 1,

            0

        ).getDate();



    for (let i = 0; i < firstDay; i++) {

        const blank = document.createElement("div");

        blank.className = "cal-day muted";

        grid.appendChild(blank);

    }



    const today = new Date();



    const fertileStart =

        new Date(

            data.fertile_window_start

        );



    const fertileEnd =

        new Date(

            data.fertile_window_end

        );

      const ovulation =
new Date(data.predicted_ovulation_date);

    const periodStart =

        new Date(

            data.predicted_next_period_start

        );



    const periodEnd =

        new Date(periodStart);



    periodEnd.setDate(

        periodEnd.getDate() +

        data.average_period_length_days - 1

    );



    for (

        let day = 1;

        day <= totalDays;

        day++

    ) {

        const cell =

            document.createElement("div");



        cell.className = "cal-day";

        cell.innerHTML = day;



        const current =

            new Date(

                year,

                month,

                day

            );



        if (

            current >= fertileStart &&

            current <= fertileEnd

        ) {

            cell.classList.add(

                "fertile"

            );

        }
        if(
current.getDate()===ovulation.getDate() &&
current.getMonth()===ovulation.getMonth() &&
current.getFullYear()===ovulation.getFullYear()
){

    cell.classList.add("ovulation");

    cell.innerHTML=`
        ${day}
        <span class="ovu-star">★</span>
    `;

}



        if (

            current >= periodStart &&

            current <= periodEnd

        ) {

            cell.classList.add(

                "period"

            );

        }



        if (

            current.getDate() === today.getDate() &&

            current.getMonth() === today.getMonth() &&

            current.getFullYear() === today.getFullYear()

        ) {

            cell.classList.add(

                "today"

            );

        }



        grid.appendChild(cell);

    }

}
document
.getElementById("prev-month")
.addEventListener("click", () => {

    currentCalendarMonth--;

    if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    }

    buildPredictionCalendar(currentPrediction);
});

document
.getElementById("next-month")
.addEventListener("click", () => {

    currentCalendarMonth++;

    if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    }

    buildPredictionCalendar(currentPrediction);
});



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

    try {

        const { response, data } = await apiRequest(
            `${API_BASE_URL}/ai/chat`,
            {
                method: "POST",
                body: JSON.stringify({
                    message: text
                })
            }
        );

        typing.remove();

        if (!response.ok) {
            addBubble("Unable to generate response.", "ai");
            return;
        }

        addBubble(data.data.reply, "ai");

    }
    catch {

        typing.remove();

        addBubble("Server unavailable.", "ai");

    }

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
