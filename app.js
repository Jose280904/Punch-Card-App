import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  setDoc,
  doc,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBLzh6EHZ8wD6MHDo3jgovMA7CFsUDr7Ww",
  authDomain: "employee-time-clock-f2284.firebaseapp.com",
  projectId: "employee-time-clock-f2284",
  storageBucket: "employee-time-clock-f2284.firebasestorage.app",
  messagingSenderId: "733514813717",
  appId: "1:733514813717:web:0a5db5afe7a097e11b191c",
  measurementId: "G-ZCYGJWZWDJ"
};

const adminEmails = [
  "jerodriguez2804@gmail.com",
  "emeza@pcpsystems.com",
  "dmeza@pcpsystems.com",
  "miranda@pcpsystems.com"
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);

const authBox = $("authBox");
const signupBox = $("signupBox");
const appPages = $("appPages");
const hamburgerBtn = $("hamburgerBtn");
const sideMenu = $("sideMenu");
const closeMenuBtn = $("closeMenuBtn");
const menuOverlay = $("menuOverlay");
const adminMenuLinks = $("adminMenuLinks");
const footerNote = $("footerNote");

const welcomeText = $("welcomeText");
const clockStatusText = $("clockStatusText");
const lastPunchText = $("lastPunchText");

const settingsName = $("settingsName");
const profileNameText = $("profileNameText");
const profileEmailText = $("profileEmailText");

const weekPicker = $("weekPicker");
const myWeekPicker = $("myWeekPicker");
const myHistoryRecords = $("myHistoryRecords");
const records = $("records");

const editDate = $("editDate");
const editTime = $("editTime");
const editType = $("editType");
const editReason = $("editReason");
const myTimeEditRequests = $("myTimeEditRequests");
const timeEditRequests = $("timeEditRequests");

const timeOffStartDate = $("timeOffStartDate");
const timeOffEndDate = $("timeOffEndDate");
const timeOffReason = $("timeOffReason");
const myTimeOffRequests = $("myTimeOffRequests");
const timeOffRequests = $("timeOffRequests");

const signatureStatus = $("signatureStatus");
const signatureInput = $("signatureInput");
const submitSignatureBtn = $("submitSignatureBtn");
const weeklySignatures = $("weeklySignatures");

const adminScheduleBuilderWeekPicker = $("adminScheduleBuilderWeekPicker");
const buildScheduleWeekBtn = $("buildScheduleWeekBtn");
const scheduleWeekGrid = $("scheduleWeekGrid");
const selectedScheduleDayBox = $("selectedScheduleDayBox");
const selectedScheduleDayTitle = $("selectedScheduleDayTitle");
const scheduleBuilderWeekTotal = $("scheduleBuilderWeekTotal");
const scheduleBuilderTotalHours = $("scheduleBuilderTotalHours");

const scheduleEmployeeSelect = $("scheduleEmployeeSelect");
const selectedEmployeeInfo = $("selectedEmployeeInfo");
const selectedEmployeeNameText = $("selectedEmployeeNameText");

// Backward-compatible fallback only. These can be removed from index.html after switching to the dropdown.
const scheduleEmployeeEmail = $("scheduleEmployeeEmail");
const scheduleEmployeeName = $("scheduleEmployeeName");
const scheduleDate = $("scheduleDate");
const scheduleStartTime = $("scheduleStartTime");
const scheduleEndTime = $("scheduleEndTime");
const scheduleLocation = $("scheduleLocation");
const scheduleNotes = $("scheduleNotes");
const postScheduleBtn = $("postScheduleBtn");
const editingScheduleId = $("editingScheduleId");
const saveScheduleEditBtn = $("saveScheduleEditBtn");
const cancelScheduleEditBtn = $("cancelScheduleEditBtn");
const removeScheduleBtn = $("removeScheduleBtn");
const selectedDayHoursPreview = $("selectedDayHoursPreview");

const adminScheduleWeekPicker = $("adminScheduleWeekPicker");
const adminScheduleRecords = $("adminScheduleRecords");

const adminEditWeekPicker = $("adminEditWeekPicker");
const adminPunchEditorRecords = $("adminPunchEditorRecords");

const editPunchModal = $("editPunchModal");
const closeEditPunchBtn = $("closeEditPunchBtn");
const editingPunchId = $("editingPunchId");
const adminEditPunchDate = $("adminEditPunchDate");
const adminEditPunchTime = $("adminEditPunchTime");
const adminEditPunchType = $("adminEditPunchType");
const saveEditedPunchBtn = $("saveEditedPunchBtn");

const prevEmployeeWeekBtn = $("prevEmployeeWeekBtn");
const nextEmployeeWeekBtn = $("nextEmployeeWeekBtn");
const myScheduleWeekTitle = $("myScheduleWeekTitle");
const myScheduleCalendar = $("myScheduleCalendar");
const selectedScheduleDetails = $("selectedScheduleDetails");

let currentUserName = "";
let currentEmployeeWeekStart = getStartOfWeek(new Date());

setCurrentWeek();
setTodayDate();

$("showPasswordBtn").addEventListener("click", () => togglePassword("password", "showPasswordBtn"));
$("showSignupPasswordBtn").addEventListener("click", () => togglePassword("signupPassword", "showSignupPasswordBtn"));
$("showConfirmPasswordBtn").addEventListener("click", () => togglePassword("confirmPassword", "showConfirmPasswordBtn"));

$("openSignupBtn").addEventListener("click", () => {
  authBox.classList.add("hidden");
  signupBox.classList.remove("hidden");
});

$("backToLoginBtn").addEventListener("click", () => {
  signupBox.classList.add("hidden");
  authBox.classList.remove("hidden");
});

$("forgotPasswordLink").addEventListener("click", async () => {
  const email = $("email").value.trim().toLowerCase();

  if (!email) {
    alert("Enter your email first, then click forgot password.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent.");
  } catch (error) {
    alert(error.message);
  }
});

$("signupBtn").addEventListener("click", async () => {
  const name = $("signupName").value.trim();
  const email = $("signupEmail").value.trim().toLowerCase();
  const password = $("signupPassword").value;
  const confirmPassword = $("confirmPassword").value;

  if (!name || !email || !password || !confirmPassword) {
    alert("Enter name, email, password, and confirm password.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await saveEmployeeName(userCredential.user.uid, email, name, true);
    currentUserName = name;
    alert("Account created!");
  } catch (error) {
    alert(error.message);
  }
});

$("loginBtn").addEventListener("click", async () => {
  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value;

  if (!email || !password) {
    alert("Enter your email and password.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
});

$("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
});

hamburgerBtn.addEventListener("click", openMenu);
closeMenuBtn.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);

document.querySelectorAll(".menu-link").forEach((button) => {
  button.addEventListener("click", async () => {
    showPage(button.dataset.page);
    closeMenu();

    if (button.dataset.page === "timeOffPage") await loadMyTimeOffRequests();
    if (button.dataset.page === "timeEditPage") await loadMyTimeEditRequests();
    if (button.dataset.page === "historyPage") await loadMyHistory();
    if (button.dataset.page === "signaturePage") await checkWeeklySignature();
    if (button.dataset.page === "adminScheduleBuilderPage") await loadScheduleEmployeeDropdown();
    if (button.dataset.page === "adminPostedSchedulesPage") await loadAdminSchedules();
    if (button.dataset.page === "adminTimeOffPage") await loadPendingTimeOffRequests();
    if (button.dataset.page === "adminTimeEditPage") await loadPendingTimeEditRequests();
    if (button.dataset.page === "adminWeeklyRecordsPage") await loadWeeklyRecords();
    if (button.dataset.page === "adminSignaturesPage") await loadWeeklySignatures();
    if (button.dataset.page === "adminPunchEditorPage") await loadAdminPunchEditor();
  });
});

$("clockInBtn").addEventListener("click", async () => savePunch("Clock In"));
$("startLunchBtn").addEventListener("click", async () => savePunch("Start Lunch"));
$("endLunchBtn").addEventListener("click", async () => savePunch("End Lunch"));
$("clockOutBtn").addEventListener("click", async () => savePunch("Clock Out"));

$("saveNameBtn").addEventListener("click", async () => {
  const user = auth.currentUser;
  const newName = settingsName.value.trim();

  if (!user) return;

  if (!newName) {
    alert("Enter a name first.");
    return;
  }

  try {
    const cleanEmail = user.email.toLowerCase().trim();
    await saveEmployeeName(user.uid, cleanEmail, newName, false);

    currentUserName = newName;
    updateProfileUI(user);

    alert("Name updated!");
  } catch (error) {
    alert(error.message);
  }
});

$("resetPasswordBtn").addEventListener("click", async () => {
  const user = auth.currentUser;

  if (!user) return;

  try {
    await sendPasswordResetEmail(auth, user.email);
    alert("Password reset email sent.");
  } catch (error) {
    alert(error.message);
  }
});

$("submitTimeEditBtn").addEventListener("click", submitTimeEditRequest);
$("loadTimeEditRequestsBtn").addEventListener("click", loadPendingTimeEditRequests);
$("loadRecordsBtn").addEventListener("click", loadWeeklyRecords);
$("loadMyHistoryBtn").addEventListener("click", loadMyHistory);
$("loadWeeklySignaturesBtn").addEventListener("click", loadWeeklySignatures);
$("submitTimeOffBtn").addEventListener("click", submitTimeOffRequest);
$("loadTimeOffRequestsBtn").addEventListener("click", loadPendingTimeOffRequests);

submitSignatureBtn.addEventListener("click", submitWeeklySignature);

if (scheduleEmployeeSelect) {
  scheduleEmployeeSelect.addEventListener("change", () => {
    const employee = getSelectedScheduleEmployee();

    if (!employee) {
      if (selectedEmployeeInfo) selectedEmployeeInfo.classList.add("hidden");
      if (selectedEmployeeNameText) selectedEmployeeNameText.textContent = "None";
      return;
    }

    if (selectedEmployeeNameText) selectedEmployeeNameText.textContent = employee.name;
    if (selectedEmployeeInfo) selectedEmployeeInfo.classList.remove("hidden");
    resetScheduleForm();
    scheduleWeekGrid.innerHTML = `<p class="info-box">Choose an employee and week to build a schedule.</p>`;
    scheduleBuilderWeekTotal.classList.add("hidden");
  });
}

timeEditRequests.addEventListener("click", async (event) => {
  const approveBtn = event.target.closest(".approve-request-btn");
  const rejectBtn = event.target.closest(".reject-request-btn");

  if (approveBtn) await approveTimeEditRequest(approveBtn.dataset.id);
  if (rejectBtn) await rejectTimeEditRequest(rejectBtn.dataset.id);
});

timeOffRequests.addEventListener("click", async (event) => {
  const approveBtn = event.target.closest(".approve-timeoff-btn");
  const rejectBtn = event.target.closest(".reject-timeoff-btn");

  if (approveBtn) await approveTimeOffRequest(approveBtn.dataset.id);
  if (rejectBtn) await rejectTimeOffRequest(rejectBtn.dataset.id);
});

buildScheduleWeekBtn.addEventListener("click", buildScheduleWeekGrid);
postScheduleBtn.addEventListener("click", postEmployeeSchedule);
saveScheduleEditBtn.addEventListener("click", saveScheduleEdit);
cancelScheduleEditBtn.addEventListener("click", resetScheduleForm);
removeScheduleBtn.addEventListener("click", removeScheduleShift);

$("loadAdminSchedulesBtn").addEventListener("click", loadAdminSchedules);
$("loadAdminPunchesBtn").addEventListener("click", loadAdminPunchEditor);

scheduleStartTime.addEventListener("change", updateSelectedDayHoursPreview);
scheduleEndTime.addEventListener("change", updateSelectedDayHoursPreview);

scheduleWeekGrid.addEventListener("click", (event) => {
  const dayButton = event.target.closest(".schedule-day-btn");
  if (!dayButton || dayButton.disabled) return;

  document.querySelectorAll(".schedule-day-btn").forEach((button) => {
    button.classList.remove("active-day");
  });

  dayButton.classList.add("active-day");

  scheduleDate.value = dayButton.dataset.date;
  selectedScheduleDayTitle.textContent = `${dayButton.dataset.day} · ${dayButton.dataset.display}`;

  if (dayButton.dataset.scheduleId) {
    editingScheduleId.value = dayButton.dataset.scheduleId;
    scheduleStartTime.value = dayButton.dataset.startTime || "";
    scheduleEndTime.value = dayButton.dataset.endTime || "";
    scheduleLocation.value = dayButton.dataset.location || "";
    scheduleNotes.value = dayButton.dataset.notes || "";

    postScheduleBtn.classList.add("hidden");
    saveScheduleEditBtn.classList.remove("hidden");
    cancelScheduleEditBtn.classList.remove("hidden");
    removeScheduleBtn.classList.remove("hidden");
  } else {
    resetScheduleForm(false);
    scheduleDate.value = dayButton.dataset.date;
    selectedScheduleDayTitle.textContent = `${dayButton.dataset.day} · ${dayButton.dataset.display}`;
  }

  updateSelectedDayHoursPreview();
  selectedScheduleDayBox.classList.remove("hidden");
});

adminScheduleRecords.addEventListener("click", async (event) => {
  const toggleBtn = event.target.closest(".admin-employee-schedule-toggle");
  const editBtn = event.target.closest(".admin-edit-shift-btn");
  const removeBtn = event.target.closest(".admin-remove-shift-btn");

  if (toggleBtn) {
    const target = document.getElementById(toggleBtn.dataset.target);
    if (target) target.classList.toggle("hidden");
  }

  if (editBtn) {
    showPage("adminScheduleBuilderPage");

    await loadScheduleEmployeeDropdown();
    selectScheduleEmployeeByEmail(editBtn.dataset.email || "");

    if (scheduleEmployeeEmail) scheduleEmployeeEmail.value = editBtn.dataset.email || "";
    if (scheduleEmployeeName) scheduleEmployeeName.value = editBtn.dataset.name || "";

    adminScheduleBuilderWeekPicker.value =
      adminScheduleWeekPicker.value || getCurrentWeekValue();

    await buildScheduleWeekGrid();

    const matchingDay = document.querySelector(
      `.schedule-day-btn[data-schedule-id="${editBtn.dataset.id}"]`
    );

    if (matchingDay) {
      matchingDay.click();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (removeBtn) {
    await softDeleteSchedule(removeBtn.dataset.id);
  }
});

adminPunchEditorRecords.addEventListener("click", async (event) => {
  const editBtn = event.target.closest(".admin-edit-punch-btn");
  const deleteBtn = event.target.closest(".admin-delete-punch-btn");

  if (editBtn) openEditPunchModal(editBtn);
  if (deleteBtn) await softDeletePunch(deleteBtn.dataset.id);
});

closeEditPunchBtn.addEventListener("click", () => {
  editPunchModal.classList.add("hidden");
});

editPunchModal.addEventListener("click", (event) => {
  if (event.target === editPunchModal) {
    editPunchModal.classList.add("hidden");
  }
});

saveEditedPunchBtn.addEventListener("click", saveEditedPunch);

prevEmployeeWeekBtn.addEventListener("click", async () => {
  currentEmployeeWeekStart.setDate(currentEmployeeWeekStart.getDate() - 7);
  await loadMyWeeklySchedule();
});

nextEmployeeWeekBtn.addEventListener("click", async () => {
  currentEmployeeWeekStart.setDate(currentEmployeeWeekStart.getDate() + 7);
  await loadMyWeeklySchedule();
});

myScheduleCalendar.addEventListener("click", async (event) => {
  const dayBtn = event.target.closest(".employee-schedule-day");
  if (!dayBtn || !dayBtn.dataset.date) return;
  await showScheduleDetailsForDate(dayBtn.dataset.date);
});

function openMenu() {
  sideMenu.classList.remove("hidden");
  menuOverlay.classList.remove("hidden");
}

function closeMenu() {
  sideMenu.classList.add("hidden");
  menuOverlay.classList.add("hidden");
}

function showPage(pageId) {
  document.querySelectorAll(".app-page").forEach((page) => {
    page.classList.add("hidden");
    page.classList.remove("active-page");
  });

  const selectedPage = $(pageId);

  if (selectedPage) {
    selectedPage.classList.remove("hidden");
    selectedPage.classList.add("active-page");
  }

  document.querySelectorAll(".menu-link").forEach((button) => {
    button.classList.toggle("active-menu-link", button.dataset.page === pageId);
  });
}

async function savePunch(type) {
  const user = auth.currentUser;
  if (!user) return;

  const cleanEmail = user.email.toLowerCase().trim();

  if (!currentUserName) {
    currentUserName = await getEmployeeName(user.uid, cleanEmail);
  }

  try {
    await addDoc(collection(db, "punches"), {
      employeeId: user.uid,
      employeeName: currentUserName || cleanEmail,
      employeeEmail: cleanEmail,
      type,
      time: serverTimestamp(),
      source: "Employee Clock Button",
      deleted: false
    });

    alert(`${type} saved!`);
    await loadClockStatus();
  } catch (error) {
    alert(error.message);
  }
}

async function loadClockStatus() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const cleanEmail = user.email.toLowerCase().trim();
    const q = query(collection(db, "punches"), orderBy("time", "desc"));
    const snapshot = await getDocs(q);

    let lastPunch = null;

    snapshot.forEach((docSnap) => {
      if (lastPunch) return;

      const data = docSnap.data();
      if (data.deleted === true) return;
      if (!data.employeeEmail || !data.time) return;
      if (data.employeeEmail.toLowerCase().trim() !== cleanEmail) return;

      lastPunch = data;
    });

    if (!lastPunch) {
      clockStatusText.textContent = "Ready";
      lastPunchText.textContent = "No recent punch found.";
      return;
    }

    clockStatusText.textContent = lastPunch.type;

    const dateObj = lastPunch.time.toDate();

    lastPunchText.textContent = `Last punch: ${dateObj.toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}`;
  } catch (error) {
    clockStatusText.textContent = "Unable to load";
    lastPunchText.textContent = "Could not load recent punch.";
  }
}

async function submitTimeOffRequest() {
  const user = auth.currentUser;
  if (!user) return;

  const startDate = timeOffStartDate.value;
  const endDate = timeOffEndDate.value;
  const reason = timeOffReason.value.trim();

  if (!startDate || !endDate || !reason) {
    alert("Enter start date, end date, and reason.");
    return;
  }

  if (new Date(`${endDate}T00:00`) < new Date(`${startDate}T00:00`)) {
    alert("End date cannot be before start date.");
    return;
  }

  try {
    const cleanEmail = user.email.toLowerCase().trim();

    if (!currentUserName) {
      currentUserName = await getEmployeeName(user.uid, cleanEmail);
    }

    await addDoc(collection(db, "timeOffRequests"), {
      employeeId: user.uid,
      employeeName: currentUserName || cleanEmail,
      employeeEmail: cleanEmail,
      startDate,
      endDate,
      reason,
      status: "Pending",
      requestedAt: serverTimestamp()
    });

    timeOffReason.value = "";

    alert("Time off request submitted.");
    await loadMyTimeOffRequests();
    await loadMyWeeklySchedule();
  } catch (error) {
    alert(error.message);
  }
}

async function loadMyTimeOffRequests() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const cleanEmail = user.email.toLowerCase().trim();
    const q = query(collection(db, "timeOffRequests"), orderBy("requestedAt", "desc"));
    const snapshot = await getDocs(q);

    let html = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (!data.employeeEmail) return;
      if (data.employeeEmail.toLowerCase().trim() !== cleanEmail) return;

      html += buildMyTimeOffCard(data);
    });

    myTimeOffRequests.innerHTML = html || `<p class="info-box">No time off requests found.</p>`;
  } catch (error) {
    myTimeOffRequests.innerHTML = `<p class="info-box">Unable to load time off requests.</p>`;
  }
}

async function loadPendingTimeOffRequests() {
  try {
    const q = query(collection(db, "timeOffRequests"), orderBy("requestedAt", "desc"));
    const snapshot = await getDocs(q);

    let html = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status !== "Pending") return;
      html += buildAdminTimeOffCard(docSnap.id, data);
    });

    timeOffRequests.innerHTML = html || `<p class="info-box">No pending time off requests.</p>`;
  } catch (error) {
    alert(error.message);
  }
}

async function approveTimeOffRequest(requestId) {
  const adminUser = auth.currentUser;
  if (!adminUser) return;

  const confirmApprove = confirm("Approve this time off request?");
  if (!confirmApprove) return;

  try {
    const requestRef = doc(db, "timeOffRequests", requestId);

    await updateDoc(requestRef, {
      status: "Approved",
      reviewedBy: adminUser.email.toLowerCase().trim(),
      reviewedAt: serverTimestamp()
    });

    alert("Time off request approved.");

    await loadPendingTimeOffRequests();
    await loadMyWeeklySchedule();
  } catch (error) {
    alert(error.message);
  }
}

async function rejectTimeOffRequest(requestId) {
  const adminUser = auth.currentUser;
  if (!adminUser) return;

  const confirmReject = confirm("Reject this time off request?");
  if (!confirmReject) return;

  try {
    const requestRef = doc(db, "timeOffRequests", requestId);

    await updateDoc(requestRef, {
      status: "Rejected",
      reviewedBy: adminUser.email.toLowerCase().trim(),
      reviewedAt: serverTimestamp()
    });

    alert("Time off request rejected.");

    await loadPendingTimeOffRequests();
  } catch (error) {
    alert(error.message);
  }
}

function buildMyTimeOffCard(data) {
  const statusClass = getStatusClass(data.status);

  return `
    <div class="request-card">
      <h3>Time Off</h3>
      <p><strong>Dates:</strong> ${escapeHTML(formatDateDisplay(data.startDate))} - ${escapeHTML(formatDateDisplay(data.endDate))}</p>
      <p><strong>Reason:</strong> ${escapeHTML(data.reason)}</p>
      <span class="status-pill ${statusClass}">${escapeHTML(data.status)}</span>
    </div>
  `;
}

function buildAdminTimeOffCard(requestId, data) {
  return `
    <div class="request-card">
      <h3>${escapeHTML(data.employeeName || data.employeeEmail)}</h3>
      <p><strong>Email:</strong> ${escapeHTML(data.employeeEmail)}</p>
      <p><strong>Dates:</strong> ${escapeHTML(formatDateDisplay(data.startDate))} - ${escapeHTML(formatDateDisplay(data.endDate))}</p>
      <p><strong>Reason:</strong> ${escapeHTML(data.reason)}</p>
      <span class="status-pill status-pending">Pending</span>

      <div class="request-actions">
        <button class="approve-btn approve-timeoff-btn" data-id="${requestId}">Approve</button>
        <button class="danger-btn reject-timeoff-btn" data-id="${requestId}">Reject</button>
      </div>
    </div>
  `;
}

async function loadMyWeeklySchedule() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const cleanEmail = user.email.toLowerCase().trim();

    const startOfWeek = getStartOfWeek(currentEmployeeWeekStart);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    myScheduleWeekTitle.textContent = `${formatDateShort(startOfWeek)} - ${formatDateShort(addDays(startOfWeek, 6))}`;

    const schedules = await getSchedulesForEmployee(cleanEmail);
    const timeOff = await getTimeOffForEmployee(cleanEmail);

    const weekSchedules = schedules.filter((shift) => {
      if (!shift.date) return false;
      const shiftDate = new Date(`${shift.date}T00:00`);
      return shiftDate >= startOfWeek && shiftDate < endOfWeek;
    });

    buildEmployeeWeekSchedule(startOfWeek, weekSchedules, timeOff);
  } catch (error) {
    myScheduleCalendar.innerHTML = `<p class="info-box">Unable to load schedule.</p>`;
  }
}

function buildEmployeeWeekSchedule(startOfWeek, schedules, timeOff) {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let totalMinutes = 0;

  let html = `<div class="employee-week-grid">`;

  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(startOfWeek, i);
    const dateValue = formatDateInputValue(dayDate);
    const dayShift = schedules.find((shift) => shift.date === dateValue);

    const approvedOff = timeOff.some((request) => {
      if (request.status !== "Approved") return false;
      return dateValue >= request.startDate && dateValue <= request.endDate;
    });

    const minutes = dayShift ? calculateShiftMinutes(dayShift.startTime, dayShift.endTime) : 0;
    totalMinutes += minutes;

    html += `
      <button class="employee-schedule-day ${dayShift ? "has-shift" : ""} ${approvedOff ? "has-timeoff" : ""}" data-date="${dateValue}">
        <strong>${dayNames[i]}</strong>
        <span>${formatDateShort(dayDate)}</span>

        ${
          dayShift
            ? `
              <div class="shift-time">${formatTimeFrom24Hour(dayShift.startTime)} - ${formatTimeFrom24Hour(dayShift.endTime)}</div>
              <div class="shift-hours">${formatMinutes(minutes)}</div>
            `
            : approvedOff
              ? `<div class="shift-off">Approved Time Off</div>`
              : `<div class="shift-off">OFF</div>`
        }
      </button>
    `;
  }

  html += `</div>`;

  html += `
    <div class="schedule-total-box">
      <strong>Weekly Scheduled Total:</strong> ${formatMinutes(totalMinutes)}
    </div>
  `;

  myScheduleCalendar.innerHTML = html;
}

async function showScheduleDetailsForDate(dateValue) {
  const user = auth.currentUser;
  if (!user) return;

  const cleanEmail = user.email.toLowerCase().trim();
  const schedules = await getSchedulesForEmployee(cleanEmail);
  const timeOff = await getTimeOffForEmployee(cleanEmail);

  const daySchedules = schedules.filter((item) => item.date === dateValue);

  const approvedOff = timeOff.filter((item) => {
    if (item.status !== "Approved") return false;
    return dateValue >= item.startDate && dateValue <= item.endDate;
  });

  let html = `<div class="selected-date-card"><h3>${escapeHTML(formatDateDisplay(dateValue))}</h3>`;

  if (daySchedules.length === 0 && approvedOff.length === 0) {
    html += `<p class="info-box">No shift or approved time off for this day.</p>`;
  }

  daySchedules.forEach((shift) => {
    const minutes = calculateShiftMinutes(shift.startTime, shift.endTime);

    html += `
      <div class="schedule-card">
        <p><strong>Shift:</strong> ${formatTimeFrom24Hour(shift.startTime)} - ${formatTimeFrom24Hour(shift.endTime)}</p>
        <p><strong>Scheduled Hours:</strong> ${formatMinutes(minutes)}</p>
        <p><strong>Location:</strong> ${escapeHTML(shift.location || "Not listed")}</p>
        <p><strong>Notes:</strong> ${escapeHTML(shift.notes || "No notes")}</p>
      </div>
    `;
  });

  approvedOff.forEach((request) => {
    html += `
      <div class="schedule-card timeoff-card">
        <p><strong>Approved Time Off</strong></p>
        <p>${escapeHTML(request.reason || "No reason listed")}</p>
      </div>
    `;
  });

  html += `</div>`;

  selectedScheduleDetails.innerHTML = html;
}

async function getSchedulesForEmployee(email) {
  const q = query(collection(db, "schedules"), orderBy("scheduleDateTime", "asc"));
  const snapshot = await getDocs(q);
  const schedules = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    if (data.deleted === true) return;
    if (!data.employeeEmail) return;
    if (data.employeeEmail.toLowerCase().trim() !== email) return;

    schedules.push({
      id: docSnap.id,
      ...data
    });
  });

  return schedules;
}

async function getTimeOffForEmployee(email) {
  try {
    const q = query(collection(db, "timeOffRequests"), orderBy("requestedAt", "desc"));
    const snapshot = await getDocs(q);
    const requests = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (!data.employeeEmail) return;
      if (data.employeeEmail.toLowerCase().trim() !== email) return;

      requests.push(data);
    });

    return requests;
  } catch (error) {
    console.error("Unable to load time off for employee:", error);
    return [];
  }
}


async function loadScheduleEmployeeDropdown() {
  if (!scheduleEmployeeSelect) return;

  const currentValue = scheduleEmployeeSelect.value;

  try {
    const snapshot = await getDocs(collection(db, "employees"));
    const employees = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (!data.email || !data.name) return;

      employees.push({
        uid: docSnap.id,
        name: data.name,
        email: data.email.toLowerCase().trim()
      });
    });

    employees.sort((a, b) => a.name.localeCompare(b.name));

    let html = `<option value="">Select an employee</option>`;

    employees.forEach((employee) => {
      html += `
        <option
          value="${escapeHTML(employee.email)}"
          data-uid="${escapeHTML(employee.uid)}"
          data-name="${escapeHTML(employee.name)}"
          data-email="${escapeHTML(employee.email)}"
        >
          ${escapeHTML(employee.name)}
        </option>
      `;
    });

    scheduleEmployeeSelect.innerHTML = html;

    if (currentValue) {
      scheduleEmployeeSelect.value = currentValue;
      const selectedEmployee = getSelectedScheduleEmployee();

      if (selectedEmployee) {
        if (selectedEmployeeNameText) selectedEmployeeNameText.textContent = selectedEmployee.name;
        if (selectedEmployeeInfo) selectedEmployeeInfo.classList.remove("hidden");
      }
    }
  } catch (error) {
    console.error("Unable to load employees:", error);
    scheduleEmployeeSelect.innerHTML = `<option value="">Unable to load employees</option>`;
  }
}

function getSelectedScheduleEmployee() {
  if (scheduleEmployeeSelect && scheduleEmployeeSelect.value) {
    const option = scheduleEmployeeSelect.options[scheduleEmployeeSelect.selectedIndex];

    return {
      uid: option.dataset.uid || "",
      name: option.dataset.name || option.textContent.trim(),
      email: option.dataset.email || scheduleEmployeeSelect.value.toLowerCase().trim()
    };
  }

  // Backward-compatible fallback for the old email/name inputs.
  if (scheduleEmployeeEmail && scheduleEmployeeName) {
    const email = scheduleEmployeeEmail.value.trim().toLowerCase();
    const name = scheduleEmployeeName.value.trim();

    if (email && name) {
      return {
        uid: "",
        name,
        email
      };
    }
  }

  return null;
}

function selectScheduleEmployeeByEmail(email) {
  const cleanEmail = String(email || "").toLowerCase().trim();

  if (!cleanEmail) return;

  if (scheduleEmployeeSelect) {
    scheduleEmployeeSelect.value = cleanEmail;

    const employee = getSelectedScheduleEmployee();

    if (employee) {
      if (selectedEmployeeNameText) selectedEmployeeNameText.textContent = employee.name;
      if (selectedEmployeeInfo) selectedEmployeeInfo.classList.remove("hidden");
    }
  }

  if (scheduleEmployeeEmail) scheduleEmployeeEmail.value = cleanEmail;
}

async function buildScheduleWeekGrid() {
  const selectedWeek = adminScheduleBuilderWeekPicker.value;
  const employee = getSelectedScheduleEmployee();

  if (!selectedWeek) {
    alert("Please choose a week first.");
    return;
  }

  if (!employee) {
    alert("Please select an employee first.");
    return;
  }

  const employeeEmail = employee.email;
  const { startOfWeek } = getWeekDateRange(selectedWeek);

  let approvedOffDates = new Set();

  try {
    approvedOffDates = await getApprovedTimeOffDates(employeeEmail);
  } catch (error) {
    console.error("Could not load approved time off:", error);
    alert("Week loaded, but time off blocking could not be checked. Check Firebase rules for timeOffRequests.");
  }

  const employeeSchedules = await getSchedulesForEmployee(employeeEmail);

  const weekSchedules = employeeSchedules.filter((shift) => {
    if (!shift.date) return false;

    const shiftDate = new Date(`${shift.date}T00:00`);
    const endOfWeek = addDays(startOfWeek, 7);

    return shiftDate >= startOfWeek && shiftDate < endOfWeek;
  });

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let html = "";
  let weeklyMinutes = 0;

  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(startOfWeek, i);
    const dateValue = formatDateInputValue(dayDate);

    const displayDate = dayDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    const isOff = approvedOffDates.has(dateValue);
    const existingShift = weekSchedules.find((shift) => shift.date === dateValue);

    const dailyMinutes = existingShift
      ? calculateShiftMinutes(existingShift.startTime, existingShift.endTime)
      : 0;

    weeklyMinutes += dailyMinutes;

    html += `
      <button
        type="button"
        class="schedule-day-btn ${isOff ? "blocked-day" : ""} ${existingShift ? "scheduled-day" : ""}"
        data-date="${dateValue}"
        data-day="${dayNames[i]}"
        data-display="${displayDate}"
        data-schedule-id="${existingShift ? escapeHTML(existingShift.id) : ""}"
        data-start-time="${existingShift ? escapeHTML(existingShift.startTime) : ""}"
        data-end-time="${existingShift ? escapeHTML(existingShift.endTime) : ""}"
        data-location="${existingShift ? escapeHTML(existingShift.location || "") : ""}"
        data-notes="${existingShift ? escapeHTML(existingShift.notes || "") : ""}"
        ${isOff ? "disabled" : ""}
      >
        <strong>${dayNames[i]}</strong>
        <span>${displayDate}</span>

        ${
          existingShift
            ? `
              <span class="scheduled-label">Scheduled</span>
              <span>${formatTimeFrom24Hour(existingShift.startTime)} - ${formatTimeFrom24Hour(existingShift.endTime)}</span>
              <span class="day-hours">${formatMinutes(dailyMinutes)}</span>
            `
            : ""
        }

        ${isOff ? `<span class="blocked-note">Approved Time Off</span>` : ""}
      </button>
    `;
  }

  scheduleWeekGrid.innerHTML = html;
  scheduleBuilderWeekTotal.classList.remove("hidden");
  scheduleBuilderTotalHours.textContent = formatMinutes(weeklyMinutes);
  selectedScheduleDayBox.classList.add("hidden");
}

async function postEmployeeSchedule() {
  const adminUser = auth.currentUser;
  if (!adminUser) return;

  const employee = getSelectedScheduleEmployee();
  const dateValue = scheduleDate.value;
  const startTimeValue = scheduleStartTime.value;
  const endTimeValue = scheduleEndTime.value;
  const locationValue = scheduleLocation.value.trim();
  const notesValue = scheduleNotes.value.trim();

  if (!employee || !dateValue || !startTimeValue || !endTimeValue) {
    alert("Select an employee, choose a day, start time, and end time.");
    return;
  }

  if (calculateShiftMinutes(startTimeValue, endTimeValue) <= 0) {
    alert("End time must be after start time.");
    return;
  }

  try {
    const approvedOffDates = await getApprovedTimeOffDates(employee.email);

    if (approvedOffDates.has(dateValue)) {
      alert("This employee has approved time off on this day. You cannot schedule them.");
      return;
    }

    const existingShift = await getExistingScheduleForEmployeeDate(employee.email, dateValue);

    if (existingShift) {
      alert("This employee is already scheduled on this day. Click the scheduled day to edit it instead.");
      return;
    }
  } catch (error) {
    console.error("Could not check schedule before posting:", error);
    alert("Could not check existing schedule/time off before posting.");
    return;
  }

  const scheduleDateObj = new Date(`${dateValue}T${startTimeValue}`);

  if (Number.isNaN(scheduleDateObj.getTime())) {
    alert("Please enter a valid schedule date and time.");
    return;
  }

  try {
    const weekValue = getWeekValueFromDate(scheduleDateObj);

    await addDoc(collection(db, "schedules"), {
      employeeId: employee.uid || "",
      employeeEmail: employee.email,
      employeeName: employee.name,
      date: dateValue,
      startTime: startTimeValue,
      endTime: endTimeValue,
      location: locationValue,
      notes: notesValue,
      week: weekValue,
      scheduleDateTime: scheduleDateObj,
      postedBy: adminUser.email.toLowerCase().trim(),
      postedAt: serverTimestamp(),
      deleted: false
    });

    alert("Schedule posted for this day.");

    resetScheduleForm();
    adminScheduleWeekPicker.value = weekValue;

    await buildScheduleWeekGrid();
    await loadAdminSchedules();
  } catch (error) {
    alert(error.message);
  }
}

async function saveScheduleEdit() {
  const adminUser = auth.currentUser;
  if (!adminUser) return;

  const scheduleId = editingScheduleId.value;
  const dateValue = scheduleDate.value;
  const startTimeValue = scheduleStartTime.value;
  const endTimeValue = scheduleEndTime.value;
  const locationValue = scheduleLocation.value.trim();
  const notesValue = scheduleNotes.value.trim();

  if (!scheduleId || !dateValue || !startTimeValue || !endTimeValue) {
    alert("Missing shift information.");
    return;
  }

  if (calculateShiftMinutes(startTimeValue, endTimeValue) <= 0) {
    alert("End time must be after start time.");
    return;
  }

  const scheduleDateObj = new Date(`${dateValue}T${startTimeValue}`);

  try {
    await updateDoc(doc(db, "schedules", scheduleId), {
      startTime: startTimeValue,
      endTime: endTimeValue,
      location: locationValue,
      notes: notesValue,
      scheduleDateTime: scheduleDateObj,
      editedBy: adminUser.email.toLowerCase().trim(),
      editedAt: serverTimestamp()
    });

    alert("Shift updated.");

    resetScheduleForm();
    await buildScheduleWeekGrid();
    await loadAdminSchedules();
  } catch (error) {
    alert(error.message);
  }
}

async function removeScheduleShift() {
  const scheduleId = editingScheduleId.value;

  if (!scheduleId) {
    alert("No shift selected.");
    return;
  }

  const confirmRemove = confirm("Remove this shift from the schedule?");
  if (!confirmRemove) return;

  await softDeleteSchedule(scheduleId);

  resetScheduleForm();
  await buildScheduleWeekGrid();
}

async function softDeleteSchedule(scheduleId) {
  const adminUser = auth.currentUser;
  if (!adminUser) return;

  try {
    await updateDoc(doc(db, "schedules", scheduleId), {
      deleted: true,
      deletedBy: adminUser.email.toLowerCase().trim(),
      deletedAt: serverTimestamp()
    });

    alert("Shift removed.");

    await loadAdminSchedules();
    await loadMyWeeklySchedule();
  } catch (error) {
    alert(error.message);
  }
}

function resetScheduleForm(clearSelectedDay = true) {
  editingScheduleId.value = "";

  if (clearSelectedDay) {
    scheduleDate.value = "";
    selectedScheduleDayBox.classList.add("hidden");
  }

  scheduleStartTime.value = "";
  scheduleEndTime.value = "";
  scheduleLocation.value = "";
  scheduleNotes.value = "";

  postScheduleBtn.classList.remove("hidden");
  saveScheduleEditBtn.classList.add("hidden");
  cancelScheduleEditBtn.classList.add("hidden");
  removeScheduleBtn.classList.add("hidden");

  updateSelectedDayHoursPreview();
}

function updateSelectedDayHoursPreview() {
  const minutes = calculateShiftMinutes(scheduleStartTime.value, scheduleEndTime.value);
  selectedDayHoursPreview.textContent = `Scheduled Hours: ${formatMinutes(minutes)}`;
}

async function getExistingScheduleForEmployeeDate(employeeEmail, dateValue) {
  const schedules = await getSchedulesForEmployee(employeeEmail);
  return schedules.find((shift) => shift.date === dateValue);
}

async function getApprovedTimeOffDates(employeeEmail) {
  const q = query(collection(db, "timeOffRequests"), orderBy("requestedAt", "desc"));
  const snapshot = await getDocs(q);
  const dates = new Set();

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    if (data.status !== "Approved") return;
    if (!data.employeeEmail) return;
    if (data.employeeEmail.toLowerCase().trim() !== employeeEmail) return;

    getDatesBetween(data.startDate, data.endDate).forEach((dateValue) => {
      dates.add(dateValue);
    });
  });

  return dates;
}

async function loadAdminSchedules() {
  adminScheduleRecords.innerHTML = "";

  const selectedWeek = adminScheduleWeekPicker.value;

  if (!selectedWeek) {
    alert("Please choose a week first.");
    return;
  }

  try {
    const q = query(collection(db, "schedules"), orderBy("scheduleDateTime", "asc"));
    const snapshot = await getDocs(q);

    const grouped = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (data.deleted === true) return;
      if (data.week !== selectedWeek) return;
      if (!data.employeeEmail) return;

      const cleanEmail = data.employeeEmail.toLowerCase().trim();

      if (!grouped[cleanEmail]) {
        grouped[cleanEmail] = {
          employeeEmail: cleanEmail,
          employeeName: data.employeeName || cleanEmail,
          shifts: []
        };
      }

      grouped[cleanEmail].shifts.push({
        id: docSnap.id,
        ...data
      });
    });

    const employees = Object.values(grouped);

    if (employees.length === 0) {
      adminScheduleRecords.innerHTML = `<p class="info-box">No schedules found for this week.</p>`;
      return;
    }

    let html = "";

    employees.forEach((employee, index) => {
      html += buildAdminEmployeeScheduleGroup(employee, index);
    });

    adminScheduleRecords.innerHTML = html;
  } catch (error) {
    alert(error.message);
  }
}

function buildAdminEmployeeScheduleGroup(employee, index) {
  const targetId = `employeeScheduleGroup_${index}`;
  const sortedShifts = [...employee.shifts].sort((a, b) => a.date.localeCompare(b.date));

  let totalMinutes = 0;

  sortedShifts.forEach((shift) => {
    totalMinutes += calculateShiftMinutes(shift.startTime, shift.endTime);
  });

  let html = `
    <div class="employee-schedule-group">
      <button class="admin-employee-schedule-toggle" data-target="${targetId}">
        <span>${escapeHTML(employee.employeeName)}</span>
        <small>${escapeHTML(employee.employeeEmail)} · ${formatMinutes(totalMinutes)}</small>
      </button>

      <div id="${targetId}" class="admin-employee-schedule-body hidden">
        <div class="schedule-total-box">
          <strong>Weekly Scheduled Total:</strong> ${formatMinutes(totalMinutes)}
        </div>
  `;

  sortedShifts.forEach((shift) => {
    const minutes = calculateShiftMinutes(shift.startTime, shift.endTime);

    html += `
      <div class="schedule-card">
        <h3>${escapeHTML(formatDateDisplay(shift.date))}</h3>
        <p><strong>Time:</strong> ${formatTimeFrom24Hour(shift.startTime)} - ${formatTimeFrom24Hour(shift.endTime)}</p>
        <p><strong>Scheduled Hours:</strong> ${formatMinutes(minutes)}</p>
        <p><strong>Location:</strong> ${escapeHTML(shift.location || "Not listed")}</p>
        <p><strong>Notes:</strong> ${escapeHTML(shift.notes || "No notes")}</p>

        <div class="request-actions">
          <button
            class="edit-small-btn admin-edit-shift-btn"
            data-id="${escapeHTML(shift.id)}"
            data-email="${escapeHTML(employee.employeeEmail)}"
            data-name="${escapeHTML(employee.employeeName)}"
          >
            Edit Shift
          </button>

          <button
            class="danger-btn admin-remove-shift-btn"
            data-id="${escapeHTML(shift.id)}"
          >
            Remove Shift
          </button>
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

async function submitTimeEditRequest() {
  const user = auth.currentUser;
  if (!user) return;

  const dateValue = editDate.value;
  const timeValue = editTime.value;
  const typeValue = editType.value;
  const reasonValue = editReason.value.trim();

  if (!dateValue || !timeValue || !typeValue || !reasonValue) {
    alert("Please enter the date, time, punch type, and reason.");
    return;
  }

  const requestedDateTime = new Date(`${dateValue}T${timeValue}`);

  if (Number.isNaN(requestedDateTime.getTime())) {
    alert("Please enter a valid date and time.");
    return;
  }

  try {
    const cleanEmail = user.email.toLowerCase().trim();

    if (!currentUserName) {
      currentUserName = await getEmployeeName(user.uid, cleanEmail);
    }

    await addDoc(collection(db, "timeEditRequests"), {
      employeeId: user.uid,
      employeeName: currentUserName || cleanEmail,
      employeeEmail: cleanEmail,
      requestedType: typeValue,
      requestedDate: dateValue,
      requestedTime: timeValue,
      requestedDateTime,
      reason: reasonValue,
      status: "Pending",
      requestedAt: serverTimestamp()
    });

    editReason.value = "";
    alert("Time edit request submitted for admin approval.");

    await loadMyTimeEditRequests();
  } catch (error) {
    alert(error.message);
  }
}

async function loadMyTimeEditRequests() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const cleanEmail = user.email.toLowerCase().trim();
    const q = query(collection(db, "timeEditRequests"), orderBy("requestedAt", "desc"));
    const snapshot = await getDocs(q);

    let html = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (!data.employeeEmail) return;
      if (data.employeeEmail.toLowerCase().trim() !== cleanEmail) return;

      html += buildMyRequestCard(data);
    });

    myTimeEditRequests.innerHTML = html || `<p class="info-box">No time edit requests found.</p>`;
  } catch (error) {
    myTimeEditRequests.innerHTML = `<p class="info-box">Unable to load time edit requests.</p>`;
  }
}

async function loadPendingTimeEditRequests() {
  try {
    const q = query(collection(db, "timeEditRequests"), orderBy("requestedAt", "desc"));
    const snapshot = await getDocs(q);

    let html = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (data.status !== "Pending") return;

      html += buildAdminRequestCard(docSnap.id, data);
    });

    timeEditRequests.innerHTML = html || `<p class="info-box">No pending time edit requests.</p>`;
  } catch (error) {
    alert(error.message);
  }
}

async function approveTimeEditRequest(requestId) {
  const adminUser = auth.currentUser;
  if (!adminUser) return;

  const confirmApprove = confirm("Approve this time edit request and add it to the employee punch records?");
  if (!confirmApprove) return;

  try {
    const requestRef = doc(db, "timeEditRequests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      alert("Request not found.");
      return;
    }

    const requestData = requestSnap.data();

    if (requestData.status !== "Pending") {
      alert("This request has already been handled.");
      return;
    }

    const approvedDateTime = requestData.requestedDateTime.toDate
      ? requestData.requestedDateTime.toDate()
      : new Date(requestData.requestedDateTime);

    await addDoc(collection(db, "punches"), {
      employeeId: requestData.employeeId,
      employeeName: requestData.employeeName,
      employeeEmail: requestData.employeeEmail,
      type: requestData.requestedType,
      time: approvedDateTime,
      source: "Admin Approved Time Edit",
      timeEditRequestId: requestId,
      approvedBy: adminUser.email.toLowerCase().trim(),
      approvedAt: serverTimestamp(),
      deleted: false
    });

    await updateDoc(requestRef, {
      status: "Approved",
      reviewedBy: adminUser.email.toLowerCase().trim(),
      reviewedAt: serverTimestamp()
    });

    alert("Time edit approved and added to punch records.");

    await loadPendingTimeEditRequests();
    await loadWeeklyRecords();
  } catch (error) {
    alert(error.message);
  }
}

async function rejectTimeEditRequest(requestId) {
  const adminUser = auth.currentUser;
  if (!adminUser) return;

  const confirmReject = confirm("Reject this time edit request?");
  if (!confirmReject) return;

  try {
    await updateDoc(doc(db, "timeEditRequests", requestId), {
      status: "Rejected",
      reviewedBy: adminUser.email.toLowerCase().trim(),
      reviewedAt: serverTimestamp()
    });

    alert("Time edit request rejected.");
    await loadPendingTimeEditRequests();
  } catch (error) {
    alert(error.message);
  }
}

function buildMyRequestCard(data) {
  const statusClass = getStatusClass(data.status);

  return `
    <div class="request-card">
      <h3>${escapeHTML(data.requestedType)}</h3>
      <p><strong>Date:</strong> ${escapeHTML(data.requestedDate)}</p>
      <p><strong>Time:</strong> ${formatTimeFrom24Hour(data.requestedTime)}</p>
      <p><strong>Reason:</strong> ${escapeHTML(data.reason)}</p>
      <span class="status-pill ${statusClass}">${escapeHTML(data.status)}</span>
    </div>
  `;
}

function buildAdminRequestCard(requestId, data) {
  return `
    <div class="request-card">
      <h3>${escapeHTML(data.employeeName || data.employeeEmail)}</h3>
      <p><strong>Email:</strong> ${escapeHTML(data.employeeEmail)}</p>
      <p><strong>Requested Punch:</strong> ${escapeHTML(data.requestedType)}</p>
      <p><strong>Date:</strong> ${escapeHTML(data.requestedDate)}</p>
      <p><strong>Time:</strong> ${formatTimeFrom24Hour(data.requestedTime)}</p>
      <p><strong>Reason:</strong> ${escapeHTML(data.reason)}</p>
      <span class="status-pill status-pending">Pending</span>

      <div class="request-actions">
        <button class="approve-btn approve-request-btn" data-id="${requestId}">Approve</button>
        <button class="danger-btn reject-request-btn" data-id="${requestId}">Reject</button>
      </div>
    </div>
  `;
}

async function submitWeeklySignature() {
  const user = auth.currentUser;
  if (!user) return;

  const typedSignature = signatureInput.value.trim();

  if (!typedSignature) {
    alert("Please type your full name before submitting.");
    return;
  }

  const cleanEmail = user.email.toLowerCase().trim();
  const currentWeek = getCurrentWeekValue();
  const signatureId = `${user.uid}_${currentWeek}`;

  if (!currentUserName) {
    currentUserName = await getEmployeeName(user.uid, cleanEmail);
  }

  try {
    await setDoc(doc(db, "weeklySignatures", signatureId), {
      employeeId: user.uid,
      employeeName: currentUserName || cleanEmail,
      employeeEmail: cleanEmail,
      week: currentWeek,
      signature: typedSignature,
      signedAt: serverTimestamp()
    });

    signatureInput.value = "";
    await checkWeeklySignature();

    alert("Weekly e-signature submitted.");
  } catch (error) {
    alert(error.message);
  }
}

async function checkWeeklySignature() {
  const user = auth.currentUser;
  if (!user) return;

  const currentWeek = getCurrentWeekValue();
  const signatureId = `${user.uid}_${currentWeek}`;

  try {
    const signatureDoc = await getDoc(doc(db, "weeklySignatures", signatureId));

    if (signatureDoc.exists()) {
      const data = signatureDoc.data();

      signatureStatus.className = "info-box signature-complete";
      signatureStatus.innerHTML = `
        Signed for this week.<br>
        <strong>Signature:</strong> ${escapeHTML(data.signature)}
      `;

      signatureInput.disabled = true;
      submitSignatureBtn.disabled = true;
      submitSignatureBtn.textContent = "Signature Complete";
    } else {
      signatureStatus.className = "info-box signature-needed";
      signatureStatus.textContent = "You have not signed for this week yet.";

      signatureInput.disabled = false;
      submitSignatureBtn.disabled = false;
      submitSignatureBtn.textContent = "Submit Weekly Signature";
    }
  } catch (error) {
    signatureStatus.className = "info-box";
    signatureStatus.textContent = "Unable to check signature status.";
  }
}

async function loadWeeklySignatures() {
  weeklySignatures.innerHTML = "";

  const selectedWeek = weekPicker.value;

  if (!selectedWeek) {
    alert("Please choose a week first.");
    return;
  }

  try {
    const q = query(collection(db, "weeklySignatures"), orderBy("signedAt", "desc"));
    const snapshot = await getDocs(q);

    let html = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (data.week !== selectedWeek) return;

      let signedAtText = "Signed";

      if (data.signedAt && data.signedAt.toDate) {
        signedAtText = data.signedAt.toDate().toLocaleString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      }

      html += `
        <div class="request-card">
          <h3>${escapeHTML(data.employeeName || data.employeeEmail)}</h3>
          <p><strong>Email:</strong> ${escapeHTML(data.employeeEmail)}</p>
          <p><strong>Week:</strong> ${escapeHTML(data.week)}</p>
          <p><strong>Signature:</strong> ${escapeHTML(data.signature)}</p>
          <p><strong>Signed At:</strong> ${escapeHTML(signedAtText)}</p>
          <span class="status-pill status-approved">Signed</span>
        </div>
      `;
    });

    weeklySignatures.innerHTML = html || `<p class="info-box">No signatures found for this week.</p>`;
  } catch (error) {
    alert(error.message);
  }
}

async function loadWeeklyRecords() {
  records.innerHTML = "";

  const selectedWeek = weekPicker.value;

  if (!selectedWeek) {
    alert("Please choose a week first.");
    return;
  }

  try {
    const { startOfWeek, endOfWeek } = getWeekDateRange(selectedWeek);
    const weekDates = getWeekDates(startOfWeek);
    const employeeNamesByEmail = await getEmployeeNamesByEmail();

    const q = query(collection(db, "punches"), orderBy("time", "asc"));
    const snapshot = await getDocs(q);

    const grouped = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (data.deleted === true) return;
      if (!data.time || !data.employeeEmail) return;

      const dateObj = data.time.toDate();

      if (dateObj < startOfWeek || dateObj >= endOfWeek) return;

      const cleanEmail = data.employeeEmail.toLowerCase().trim();

      const employeeName =
        employeeNamesByEmail[cleanEmail] ||
        data.employeeName ||
        cleanEmail;

      if (!grouped[cleanEmail]) {
        grouped[cleanEmail] = {
          name: employeeName,
          days: emptyWeek()
        };
      }

      addPunchToDay(grouped[cleanEmail].days, data, dateObj);
    });

    const employees = Object.values(grouped);

    if (employees.length === 0) {
      records.innerHTML = `<p class="no-records">No records found for this week.</p>`;
      return;
    }

    employees.forEach((employee) => {
      const totalMinutes = calculateWeeklyMinutes(employee.days);

      records.innerHTML += buildWeekTable(
        employee.name,
        employee.days,
        totalMinutes,
        weekDates
      );
    });
  } catch (error) {
    alert(error.message);
  }
}

async function loadMyHistory() {
  myHistoryRecords.innerHTML = "";

  const user = auth.currentUser;
  if (!user) return;

  const selectedWeek = myWeekPicker.value;

  if (!selectedWeek) {
    alert("Please choose a week first.");
    return;
  }

  try {
    const cleanEmail = user.email.toLowerCase().trim();
    const { startOfWeek, endOfWeek } = getWeekDateRange(selectedWeek);
    const weekDates = getWeekDates(startOfWeek);

    const q = query(collection(db, "punches"), orderBy("time", "asc"));
    const snapshot = await getDocs(q);

    const days = emptyWeek();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (data.deleted === true) return;
      if (!data.time || !data.employeeEmail) return;
      if (data.employeeEmail.toLowerCase().trim() !== cleanEmail) return;

      const dateObj = data.time.toDate();

      if (dateObj < startOfWeek || dateObj >= endOfWeek) return;

      addPunchToDay(days, data, dateObj);
    });

    const totalMinutes = calculateWeeklyMinutes(days);

    myHistoryRecords.innerHTML = `
      <table class="my-history-table">
        <tr>
          ${createHeaderCell("Sunday", weekDates[0])}
          ${createHeaderCell("Monday", weekDates[1])}
          ${createHeaderCell("Tuesday", weekDates[2])}
          ${createHeaderCell("Wednesday", weekDates[3])}
          ${createHeaderCell("Thursday", weekDates[4])}
          ${createHeaderCell("Friday", weekDates[5])}
          ${createHeaderCell("Saturday", weekDates[6])}
          <th>Total<br>Hours</th>
        </tr>

        <tr>
          ${createDayCell(days.Sunday)}
          ${createDayCell(days.Monday)}
          ${createDayCell(days.Tuesday)}
          ${createDayCell(days.Wednesday)}
          ${createDayCell(days.Thursday)}
          ${createDayCell(days.Friday)}
          ${createDayCell(days.Saturday)}
          <td class="total-hours">${formatMinutes(totalMinutes)}</td>
        </tr>
      </table>
    `;
  } catch (error) {
    alert(error.message);
  }
}

async function loadAdminPunchEditor() {
  adminPunchEditorRecords.innerHTML = "";

  const selectedWeek = adminEditWeekPicker.value;

  if (!selectedWeek) {
    alert("Please choose a week first.");
    return;
  }

  try {
    const { startOfWeek, endOfWeek } = getWeekDateRange(selectedWeek);
    const employeeNamesByEmail = await getEmployeeNamesByEmail();

    const q = query(collection(db, "punches"), orderBy("time", "asc"));
    const snapshot = await getDocs(q);

    let html = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      if (data.deleted === true) return;
      if (!data.time || !data.employeeEmail) return;

      const dateObj = data.time.toDate();

      if (dateObj < startOfWeek || dateObj >= endOfWeek) return;

      const cleanEmail = data.employeeEmail.toLowerCase().trim();

      const employeeName =
        employeeNamesByEmail[cleanEmail] ||
        data.employeeName ||
        cleanEmail;

      html += buildAdminPunchRow(docSnap.id, data, employeeName, dateObj);
    });

    adminPunchEditorRecords.innerHTML =
      html || `<p class="info-box">No punches found for this week.</p>`;
  } catch (error) {
    alert(error.message);
  }
}

function buildAdminPunchRow(punchId, data, employeeName, dateObj) {
  const dateValue = formatDateInputValue(dateObj);
  const timeValue = `${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`;

  const displayTime = dateObj.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return `
    <div class="admin-punch-row">
      <p><strong>Employee:</strong> ${escapeHTML(employeeName)}</p>
      <p><strong>Email:</strong> ${escapeHTML(data.employeeEmail)}</p>
      <p><strong>Punch:</strong> ${escapeHTML(data.type)}</p>
      <p><strong>Time:</strong> ${escapeHTML(displayTime)}</p>

      <div class="admin-punch-actions">
        <button
          class="edit-small-btn admin-edit-punch-btn"
          data-id="${escapeHTML(punchId)}"
          data-date="${escapeHTML(dateValue)}"
          data-time="${escapeHTML(timeValue)}"
          data-type="${escapeHTML(data.type)}"
        >
          Edit
        </button>

        <button
          class="danger-btn admin-delete-punch-btn"
          data-id="${escapeHTML(punchId)}"
        >
          Delete
        </button>
      </div>
    </div>
  `;
}

function openEditPunchModal(button) {
  editingPunchId.value = button.dataset.id;
  adminEditPunchDate.value = button.dataset.date;
  adminEditPunchTime.value = button.dataset.time;
  adminEditPunchType.value = button.dataset.type;

  editPunchModal.classList.remove("hidden");
}

async function saveEditedPunch() {
  const adminUser = auth.currentUser;
  if (!adminUser) return;

  const punchId = editingPunchId.value;
  const dateValue = adminEditPunchDate.value;
  const timeValue = adminEditPunchTime.value;
  const typeValue = adminEditPunchType.value;

  if (!punchId || !dateValue || !timeValue || !typeValue) {
    alert("Please enter date, time, and punch type.");
    return;
  }

  const newDateTime = new Date(`${dateValue}T${timeValue}`);

  if (Number.isNaN(newDateTime.getTime())) {
    alert("Please enter a valid date and time.");
    return;
  }

  const confirmEdit = confirm("Save changes to this employee punch?");
  if (!confirmEdit) return;

  try {
    await updateDoc(doc(db, "punches", punchId), {
      type: typeValue,
      time: newDateTime,
      source: "Admin Modified Punch",
      editedBy: adminUser.email.toLowerCase().trim(),
      editedAt: serverTimestamp()
    });

    alert("Punch updated.");

    editPunchModal.classList.add("hidden");

    await loadAdminPunchEditor();

    if (weekPicker.value) await loadWeeklyRecords();
    if (myWeekPicker.value) await loadMyHistory();
  } catch (error) {
    alert(error.message);
  }
}

async function softDeletePunch(punchId) {
  const adminUser = auth.currentUser;
  if (!adminUser) return;

  const confirmDelete = confirm(
    "Are you sure you want to delete this punch? It will disappear from records, but it will still be saved in Firebase as deleted."
  );

  if (!confirmDelete) return;

  try {
    await updateDoc(doc(db, "punches", punchId), {
      deleted: true,
      deletedBy: adminUser.email.toLowerCase().trim(),
      deletedAt: serverTimestamp()
    });

    alert("Punch deleted.");

    await loadAdminPunchEditor();

    if (weekPicker.value) await loadWeeklyRecords();
    if (myWeekPicker.value) await loadMyHistory();
  } catch (error) {
    alert(error.message);
  }
}

async function saveEmployeeName(uid, email, name, isNewAccount) {
  const cleanEmail = email.toLowerCase().trim();

  const employeeData = {
    name,
    email: cleanEmail,
    updatedAt: serverTimestamp()
  };

  if (isNewAccount) {
    employeeData.createdAt = serverTimestamp();
  }

  await setDoc(doc(db, "employees", uid), employeeData, { merge: true });

  await setDoc(doc(db, "employeeNames", cleanEmail), {
    name,
    email: cleanEmail,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

async function getEmployeeName(uid, email) {
  const cleanEmail = email.toLowerCase().trim();

  const employeeDoc = await getDoc(doc(db, "employees", uid));

  if (employeeDoc.exists() && employeeDoc.data().name) {
    return employeeDoc.data().name;
  }

  const employeeNameDoc = await getDoc(doc(db, "employeeNames", cleanEmail));

  if (employeeNameDoc.exists() && employeeNameDoc.data().name) {
    return employeeNameDoc.data().name;
  }

  return "";
}

async function getEmployeeNamesByEmail() {
  const namesSnapshot = await getDocs(collection(db, "employeeNames"));
  const employeeNamesByEmail = {};

  namesSnapshot.forEach((docSnap) => {
    const data = docSnap.data();

    if (data.email && data.name) {
      employeeNamesByEmail[data.email.toLowerCase().trim()] = data.name;
    }
  });

  return employeeNamesByEmail;
}

function updateProfileUI(user) {
  const cleanEmail = user.email.toLowerCase().trim();

  welcomeText.innerHTML = currentUserName
    ? `Welcome, <span>${escapeHTML(currentUserName)}</span>`
    : `Welcome, <span>Add your name in profile</span>`;

  settingsName.value = currentUserName || "";
  profileNameText.textContent = currentUserName || "No name saved";
  profileEmailText.textContent = cleanEmail;
}

function emptyWeek() {
  return {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: []
  };
}

function addPunchToDay(days, data, dateObj) {
  const dayName = dateObj.toLocaleDateString("en-US", {
    weekday: "long"
  });

  const timeText = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  const sourceText =
    data.source === "Admin Approved Time Edit" ||
    data.source === "Admin Modified Punch"
      ? "<br><small>Admin Edit</small>"
      : "";

  days[dayName].push({
    type: data.type,
    time: dateObj,
    display: `${timeText}<br>${escapeHTML(data.type)}${sourceText}`
  });
}

function buildWeekTable(employeeName, days, totalMinutes, weekDates) {
  return `
    <div class="employee-card">
      <h3>${escapeHTML(employeeName)}</h3>

      <table class="week-table">
        <tr>
          ${createHeaderCell("Sunday", weekDates[0])}
          ${createHeaderCell("Monday", weekDates[1])}
          ${createHeaderCell("Tuesday", weekDates[2])}
          ${createHeaderCell("Wednesday", weekDates[3])}
          ${createHeaderCell("Thursday", weekDates[4])}
          ${createHeaderCell("Friday", weekDates[5])}
          ${createHeaderCell("Saturday", weekDates[6])}
          <th>Total<br>Hours</th>
        </tr>

        <tr>
          ${createDayCell(days.Sunday)}
          ${createDayCell(days.Monday)}
          ${createDayCell(days.Tuesday)}
          ${createDayCell(days.Wednesday)}
          ${createDayCell(days.Thursday)}
          ${createDayCell(days.Friday)}
          ${createDayCell(days.Saturday)}
          <td class="total-hours">${formatMinutes(totalMinutes)}</td>
        </tr>
      </table>
    </div>
  `;
}

function createHeaderCell(dayName, dateText = "") {
  return `
    <th>
      <div>${dayName.slice(0, 3)}</div>
      <small>${dateText}</small>
    </th>
  `;
}

function createDayCell(punches) {
  const punchText = punches.length
    ? punches.map((punch) => punch.display).join("<br><br>")
    : "—";

  const dailyMinutes = calculateDailyMinutes(punches);

  return `
    <td>
      ${punchText}
      <div class="day-total">${formatMinutes(dailyMinutes)}</div>
    </td>
  `;
}

function calculateDailyMinutes(punches) {
  let totalMinutes = 0;
  let workStartTime = null;

  const sortedPunches = [...punches].sort((a, b) => a.time - b.time);

  sortedPunches.forEach((punch) => {
    const type = normalizePunchType(punch.type);

    if (type === "Clock In") {
      workStartTime = punch.time;
      return;
    }

    if (type === "Start Lunch" && workStartTime) {
      totalMinutes += Math.round((punch.time - workStartTime) / 60000);
      workStartTime = null;
      return;
    }

    if (type === "End Lunch") {
      workStartTime = punch.time;
      return;
    }

    if (type === "Clock Out" && workStartTime) {
      totalMinutes += Math.round((punch.time - workStartTime) / 60000);
      workStartTime = null;
    }
  });

  return Math.max(totalMinutes, 0);
}

function normalizePunchType(type) {
  const cleanType = String(type || "").trim().toLowerCase();

  if (cleanType === "clock in" || cleanType === "punch in") return "Clock In";

  if (
    cleanType === "start lunch" ||
    cleanType === "lunch out" ||
    cleanType === "punch out for lunch" ||
    cleanType === "start break"
  ) {
    return "Start Lunch";
  }

  if (
    cleanType === "end lunch" ||
    cleanType === "lunch in" ||
    cleanType === "punch in from lunch" ||
    cleanType === "end break"
  ) {
    return "End Lunch";
  }

  if (cleanType === "clock out" || cleanType === "punch out") return "Clock Out";

  return type;
}

function calculateWeeklyMinutes(days) {
  let total = 0;

  Object.values(days).forEach((punches) => {
    total += calculateDailyMinutes(punches);
  });

  return total;
}

function calculateShiftMinutes(startTime, endTime) {
  if (!startTime || !endTime) return 0;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;

  if (endTotal <= startTotal) return 0;

  return endTotal - startTotal;
}

function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
}

function getWeekDateRange(weekValue) {
  const [yearText, weekText] = weekValue.split("-W");
  const year = Number(yearText);
  const week = Number(weekText);

  const janFirst = new Date(year, 0, 1);
  janFirst.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(janFirst);
  startOfWeek.setDate(janFirst.getDate() + (week - 1) * 7);

  while (startOfWeek.getDay() !== 0) {
    startOfWeek.setDate(startOfWeek.getDate() - 1);
  }

  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return { startOfWeek, endOfWeek };
}

function getWeekDates(startOfWeek) {
  const dates = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    dates.push(formatDateShort(currentDate));
  }

  return dates;
}

function getStartOfWeek(dateObj) {
  const start = new Date(dateObj);
  start.setHours(0, 0, 0, 0);

  while (start.getDay() !== 0) {
    start.setDate(start.getDate() - 1);
  }

  return start;
}

function addDays(dateObj, days) {
  const copy = new Date(dateObj);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getCurrentWeekValue() {
  return getWeekValueFromDate(new Date());
}

function getWeekValueFromDate(dateObj) {
  const startOfYear = new Date(dateObj.getFullYear(), 0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  const currentSunday = new Date(dateObj);
  currentSunday.setHours(0, 0, 0, 0);

  while (currentSunday.getDay() !== 0) {
    currentSunday.setDate(currentSunday.getDate() - 1);
  }

  const firstSunday = new Date(startOfYear);

  while (firstSunday.getDay() !== 0) {
    firstSunday.setDate(firstSunday.getDate() - 1);
  }

  const weekNumber =
    Math.floor((currentSunday - firstSunday) / 604800000) + 1;

  return `${dateObj.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function setCurrentWeek() {
  const currentWeek = getCurrentWeekValue();

  if (weekPicker) weekPicker.value = currentWeek;
  if (myWeekPicker) myWeekPicker.value = currentWeek;
  if (adminEditWeekPicker) adminEditWeekPicker.value = currentWeek;
  if (adminScheduleWeekPicker) adminScheduleWeekPicker.value = currentWeek;
  if (adminScheduleBuilderWeekPicker) adminScheduleBuilderWeekPicker.value = currentWeek;
}

function setTodayDate() {
  const today = new Date();
  const todayValue = formatDateInputValue(today);

  if (editDate) editDate.value = todayValue;
  if (scheduleDate) scheduleDate.value = todayValue;
  if (timeOffStartDate) timeOffStartDate.value = todayValue;
  if (timeOffEndDate) timeOffEndDate.value = todayValue;
}

function formatDateInputValue(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function formatDateShort(dateObj) {
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const yy = String(dateObj.getFullYear()).slice(-2);

  return `${mm}-${dd}-${yy}`;
}

function formatDateDisplay(dateValue) {
  if (!dateValue) return "Scheduled Day";

  const dateObj = new Date(`${dateValue}T00:00`);

  return dateObj.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatTimeFrom24Hour(timeValue) {
  if (!timeValue) return "";

  const [hoursText, minutesText] = timeValue.split(":");
  const date = new Date();

  date.setHours(Number(hoursText), Number(minutesText), 0, 0);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getDatesBetween(startDate, endDate) {
  const dates = [];
  const start = new Date(`${startDate}T00:00`);
  const end = new Date(`${endDate}T00:00`);

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    dates.push(formatDateInputValue(date));
  }

  return dates;
}

function getStatusClass(status) {
  if (status === "Approved") return "status-approved";
  if (status === "Rejected") return "status-rejected";
  return "status-pending";
}

function togglePassword(inputId, buttonId) {
  const input = $(inputId);
  const button = $(buttonId);

  if (input.type === "password") {
    input.type = "text";
    button.textContent = "Hide";
  } else {
    input.type = "password";
    button.textContent = "Show";
  }
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authBox.classList.add("hidden");
    signupBox.classList.add("hidden");
    appPages.classList.remove("hidden");
    hamburgerBtn.classList.remove("hidden");
    footerNote.classList.remove("hidden");

    const cleanEmail = user.email.toLowerCase().trim();

    currentUserName = await getEmployeeName(user.uid, cleanEmail);
    updateProfileUI(user);

    const cleanAdminEmails = adminEmails.map((email) =>
      email.toLowerCase().trim()
    );

    const isCurrentUserAdmin = cleanAdminEmails.includes(cleanEmail);

    if (isCurrentUserAdmin) {
      adminMenuLinks.classList.remove("hidden");
      document.querySelectorAll(".admin-page").forEach((page) => {
        page.classList.remove("admin-locked");
      });
    } else {
      adminMenuLinks.classList.add("hidden");
      document.querySelectorAll(".admin-page").forEach((page) => {
        page.classList.add("admin-locked");
      });
    }

    showPage("clockPage");

    await loadClockStatus();
    await checkWeeklySignature();
    await loadMyWeeklySchedule();
    await loadMyHistory();
    await loadMyTimeEditRequests();
    await loadMyTimeOffRequests();

    if (isCurrentUserAdmin) {
      await loadScheduleEmployeeDropdown();
      await loadPendingTimeEditRequests();
      await loadPendingTimeOffRequests();
      await loadWeeklySignatures();
      await loadAdminSchedules();
    }
  } else {
    authBox.classList.remove("hidden");
    signupBox.classList.add("hidden");
    appPages.classList.add("hidden");
    hamburgerBtn.classList.add("hidden");
    sideMenu.classList.add("hidden");
    menuOverlay.classList.add("hidden");
    footerNote.classList.add("hidden");
    adminMenuLinks.classList.add("hidden");
    editPunchModal.classList.add("hidden");

    currentUserName = "";
  }
});