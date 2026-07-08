/* =========================================================
   HerWellness — Application Logic
   Frontend-only. All data is in-memory dummy data;
   backend APIs to be integrated later.
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     0. In-memory app state (stands in for backend/session)
     --------------------------------------------------------- */
  const state = {
    registration: { name: "", phone: "", password: "" },
    otp: { value: "", resendSeconds: 30, resendTimer: null },
    profile: {},
    water: { current: 1.6, goal: 2.5 },
    stress: 4,
    mood: "okay",
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
  const regPassword = $("#reg-password");
  const regConfirm = $("#reg-confirm");
  const btnSendOtp = $("#btn-send-otp");

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

    const pwOk = validatePasswordLive();
    if (!pwOk) valid = false;

    const confirmOk = regConfirm.value.length > 0 && regConfirm.value === regPassword.value;
    toggleFieldError("reg-confirm", "err-reg-confirm", confirmOk, showErrors);
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

  function refreshSendOtpState() {
    const valid = validateRegistrationForm(false);
    btnSendOtp.disabled = !valid;
  }

  [regName, regPhone, regConfirm].forEach((el) => el.addEventListener("input", refreshSendOtpState));
  regPassword.addEventListener("input", () => {
    validatePasswordLive();
    refreshSendOtpState();
  });
  regPhone.addEventListener("input", () => {
    regPhone.value = regPhone.value.replace(/\D/g, "").slice(0, 10);
  });

  // Password visibility toggles (works for any [data-toggle-for])
  $$(".toggle-visibility").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-toggle-for");
      const input = $(`#${targetId}`);
      const isPw = input.type === "password";
      input.type = isPw ? "text" : "password";
      btn.textContent = isPw ? "HIDE" : "SHOW";
    });
  });

  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const valid = validateRegistrationForm(true);
    if (!valid) {
      toast("Please fix the highlighted fields.", "error");
      return;
    }
    state.registration = {
      name: regName.value.trim(),
      phone: regPhone.value.trim(),
      password: regPassword.value,
    };

    setButtonLoading(btnSendOtp, true, "Sending OTP...");
    await fakeRequest(1100);
    setButtonLoading(btnSendOtp, false);

    toast("OTP sent successfully!", "success");
    goToOtpScreen();
  });

  $("#link-to-login").addEventListener("click", (e) => {
    e.preventDefault();
    toast("Login screen coming soon — this is the registration-first demo flow.", "info");
  });

  /* ===========================================================
     5. OTP VERIFICATION SCREEN
     =========================================================== */
  const screenRegister = $("#screen-register");
  const screenOtp = $("#screen-otp");
  const screenProfile = $("#screen-profile");
  const otpBoxes = $$(".otp-box");
  const btnResend = $("#btn-resend");
  const resendTimerEl = $("#resend-timer");
  const btnVerifyOtp = $("#btn-verify-otp");
  const errOtp = $("#err-otp");

  function goToOtpScreen() {
    hide(screenRegister);
    show(screenOtp);
    $("#otp-phone-chip").textContent = `+91 ${maskPhone(state.registration.phone)}`;
    otpBoxes.forEach((b) => (b.value = ""));
    errOtp.style.display = "none";
    otpBoxes[0].focus();
    startResendTimer();
  }

  function maskPhone(phone) {
    if (!phone) return "XXXXXXXXXX";
    return phone.slice(0, 2) + "XXXXXX" + phone.slice(-2);
  }

  function startResendTimer() {
    clearInterval(state.otp.resendTimer);
    state.otp.resendSeconds = 30;
    btnResend.disabled = true;
    resendTimerEl.textContent = state.otp.resendSeconds;
    state.otp.resendTimer = setInterval(() => {
      state.otp.resendSeconds -= 1;
      resendTimerEl.textContent = state.otp.resendSeconds;
      if (state.otp.resendSeconds <= 0) {
        clearInterval(state.otp.resendTimer);
        btnResend.disabled = false;
        btnResend.innerHTML = "Resend OTP";
      }
    }, 1000);
  }

  otpBoxes.forEach((box, idx) => {
    box.addEventListener("input", () => {
      box.value = box.value.replace(/\D/g, "").slice(0, 1);
      if (box.value && idx < otpBoxes.length - 1) otpBoxes[idx + 1].focus();
      errOtp.style.display = "none";
    });
    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !box.value && idx > 0) otpBoxes[idx - 1].focus();
    });
    box.addEventListener("paste", (e) => {
      e.preventDefault();
      const digits = (e.clipboardData.getData("text").match(/\d/g) || []).slice(0, 6);
      digits.forEach((d, i) => { if (otpBoxes[i]) otpBoxes[i].value = d; });
      const next = Math.min(digits.length, otpBoxes.length - 1);
      otpBoxes[next].focus();
    });
  });

  btnResend.addEventListener("click", async () => {
    setButtonLoading(btnResend, true);
    await fakeRequest(700);
    setButtonLoading(btnResend, false);
    toast("A new OTP has been sent.", "success");
    startResendTimer();
  });

  $("#btn-back-to-register").addEventListener("click", () => {
    clearInterval(state.otp.resendTimer);
    hide(screenOtp);
    show(screenRegister);
  });

  $("#form-otp").addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = otpBoxes.map((b) => b.value).join("");
    if (code.length !== 6) {
      errOtp.textContent = "Please enter all 6 digits.";
      errOtp.style.display = "block";
      return;
    }
    setButtonLoading(btnVerifyOtp, true, "Verifying...");
    await fakeRequest(1000);
    setButtonLoading(btnVerifyOtp, false);

    // Demo: any 6-digit code verifies successfully
    clearInterval(state.otp.resendTimer);
    toast("Phone number verified!", "success");
    hide(screenOtp);
    show(screenProfile);
  });

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
  function buildCalendar() {
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
