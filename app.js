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
  "dmeza@pcpsystems.com"
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authBox = document.getElementById("authBox");
const signupBox = document.getElementById("signupBox");
const clockBox = document.getElementById("clockBox");
const adminBox = document.getElementById("adminBox");
const welcomeText = document.getElementById("welcomeText");
const records = document.getElementById("records");
const settingsName = document.getElementById("settingsName");
const weekPicker = document.getElementById("weekPicker");
const settingsIconBtn = document.getElementById("settingsIconBtn");
const settingsModal = document.getElementById("settingsModal");
const myHistoryBox = document.getElementById("myHistoryBox");
const myWeekPicker = document.getElementById("myWeekPicker");
const myHistoryRecords = document.getElementById("myHistoryRecords");

const timeEditBox = document.getElementById("timeEditBox");
const editDate = document.getElementById("editDate");
const editTime = document.getElementById("editTime");
const editType = document.getElementById("editType");
const editReason = document.getElementById("editReason");
const myTimeEditRequests = document.getElementById("myTimeEditRequests");
const timeEditRequests = document.getElementById("timeEditRequests");

let currentUserName = "";

setCurrentWeek();
setTodayDate();

document.getElementById("showPasswordBtn").addEventListener("click", () => {
  togglePassword("password", "showPasswordBtn");
});

document.getElementById("showSignupPasswordBtn").addEventListener("click", () => {
  togglePassword("signupPassword", "showSignupPasswordBtn");
});

document.getElementById("showConfirmPasswordBtn").addEventListener("click", () => {
  togglePassword("confirmPassword", "showConfirmPasswordBtn");
});

document.getElementById("openSignupBtn").addEventListener("click", () => {
  authBox.classList.add("hidden");
  signupBox.classList.remove("hidden");
});

document.getElementById("backToLoginBtn").addEventListener("click", () => {
  signupBox.classList.add("hidden");
  authBox.classList.remove("hidden");
});

document.getElementById("forgotPasswordLink").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim().toLowerCase();

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

settingsIconBtn.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
});

document.getElementById("closeSettingsBtn").addEventListener("click", () => {
  settingsModal.classList.add("hidden");
});

settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) {
    settingsModal.classList.add("hidden");
  }
});

document.getElementById("signupBtn").addEventListener("click", async () => {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

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
    const user = userCredential.user;

    await saveEmployeeName(user.uid, email, name, true);

    currentUserName = name;
    alert("Account created!");
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

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

document.getElementById("saveNameBtn").addEventListener("click", async () => {
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
    welcomeText.innerHTML = `Welcome, <span>${escapeHTML(currentUserName)}</span>`;
    settingsModal.classList.add("hidden");

    alert("Name updated!");
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById("resetPasswordBtn").addEventListener("click", async () => {
  const user = auth.currentUser;

  if (!user) return;

  try {
    await sendPasswordResetEmail(auth, user.email);
    alert("Password reset email sent.");
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
});

document.getElementById("clockInBtn").addEventListener("click", async () => {
  await savePunch("Punch In");
});

document.getElementById("clockOutBtn").addEventListener("click", async () => {
  await savePunch("Punch Out");
});

document.getElementById("submitTimeEditBtn").addEventListener("click", async () => {
  await submitTimeEditRequest();
});

document.getElementById("loadTimeEditRequestsBtn").addEventListener("click", async () => {
  await loadPendingTimeEditRequests();
});

timeEditRequests.addEventListener("click", async (event) => {
  const approveBtn = event.target.closest(".approve-request-btn");
  const rejectBtn = event.target.closest(".reject-request-btn");

  if (approveBtn) {
    await approveTimeEditRequest(approveBtn.dataset.id);
  }

  if (rejectBtn) {
    await rejectTimeEditRequest(rejectBtn.dataset.id);
  }
});

document.getElementById("loadRecordsBtn").addEventListener("click", async () => {
  await loadWeeklyRecords();
});

document.getElementById("loadMyHistoryBtn").addEventListener("click", async () => {
  await loadMyHistory();
});

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

      if (!data.time || !data.employeeEmail) return;

      const punchEmail = data.employeeEmail.toLowerCase().trim();

      if (punchEmail !== cleanEmail) return;

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
      requestedDateTime: requestedDateTime,
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
      approvedAt: serverTimestamp()
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
    const requestRef = doc(db, "timeEditRequests", requestId);

    await updateDoc(requestRef, {
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

function togglePassword(inputId, buttonId) {
  const input = document.getElementById(inputId);
  const button = document.getElementById(buttonId);

  if (input.type === "password") {
    input.type = "text";
    button.textContent = "Hide";
  } else {
    input.type = "password";
    button.textContent = "Show";
  }
}

async function saveEmployeeName(uid, email, name, isNewAccount) {
  const cleanEmail = email.toLowerCase().trim();

  const employeeData = {
    name: name,
    email: cleanEmail,
    updatedAt: serverTimestamp()
  };

  if (isNewAccount) {
    employeeData.createdAt = serverTimestamp();
  }

  await setDoc(doc(db, "employees", uid), employeeData, { merge: true });

  await setDoc(doc(db, "employeeNames", cleanEmail), {
    name: name,
    email: cleanEmail,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

async function savePunch(type) {
  const user = auth.currentUser;

  if (!user) return;

  const cleanEmail = user.email.toLowerCase().trim();

  if (!currentUserName) {
    currentUserName = await getEmployeeName(user.uid, cleanEmail);
  }

  await addDoc(collection(db, "punches"), {
    employeeId: user.uid,
    employeeName: currentUserName || cleanEmail,
    employeeEmail: cleanEmail,
    type: type,
    time: serverTimestamp(),
    source: "Employee Punch Button"
  });

  alert(`${type} saved!`);
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

  const sourceText = data.source === "Admin Approved Time Edit"
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

function isWorkStart(type) {
  return (
    type === "Punch In" ||
    type === "Clock In" ||
    type === "Lunch In" ||
    type === "End Lunch"
  );
}

function isWorkStop(type) {
  return (
    type === "Punch Out" ||
    type === "Clock Out" ||
    type === "Lunch Out" ||
    type === "Start Lunch"
  );
}

function calculateDailyMinutes(punches) {
  let totalMinutes = 0;
  let activeStartTime = null;

  const sortedPunches = [...punches].sort((a, b) => a.time - b.time);

  sortedPunches.forEach((punch) => {
    if (isWorkStart(punch.type)) {
      activeStartTime = punch.time;
    }

    if (isWorkStop(punch.type) && activeStartTime) {
      totalMinutes += Math.round((punch.time - activeStartTime) / 60000);
      activeStartTime = null;
    }
  });

  return totalMinutes;
}

function calculateWeeklyMinutes(days) {
  let total = 0;

  Object.values(days).forEach((punches) => {
    total += calculateDailyMinutes(punches);
  });

  return total;
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

    const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dd = String(currentDate.getDate()).padStart(2, "0");
    const yy = String(currentDate.getFullYear()).slice(-2);

    dates.push(`${mm}-${dd}-${yy}`);
  }

  return dates;
}

function getCurrentWeekValue() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  const currentSunday = new Date(now);
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

  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function setCurrentWeek() {
  const currentWeek = getCurrentWeekValue();

  if (weekPicker) {
    weekPicker.value = currentWeek;
  }

  if (myWeekPicker) {
    myWeekPicker.value = currentWeek;
  }
}

function setTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  if (editDate) {
    editDate.value = `${yyyy}-${mm}-${dd}`;
  }
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

function getStatusClass(status) {
  if (status === "Approved") return "status-approved";
  if (status === "Rejected") return "status-rejected";
  return "status-pending";
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
    clockBox.classList.remove("hidden");
    myHistoryBox.classList.remove("hidden");
    timeEditBox.classList.remove("hidden");
    settingsIconBtn.classList.remove("hidden");

    const cleanEmail = user.email.toLowerCase().trim();

    currentUserName = await getEmployeeName(user.uid, cleanEmail);
    settingsName.value = currentUserName;

    if (currentUserName) {
      welcomeText.innerHTML = `Welcome, <span>${escapeHTML(currentUserName)}</span>`;
    } else {
      welcomeText.innerHTML = `Welcome, <span>Add your name in settings</span>`;
    }

    const cleanAdminEmails = adminEmails.map((email) =>
      email.toLowerCase().trim()
    );

    if (cleanAdminEmails.includes(cleanEmail)) {
      adminBox.classList.remove("hidden");
      await loadPendingTimeEditRequests();
    } else {
      adminBox.classList.add("hidden");
    }

    await loadMyTimeEditRequests();
  } else {
    authBox.classList.remove("hidden");
    signupBox.classList.add("hidden");
    clockBox.classList.add("hidden");
    myHistoryBox.classList.add("hidden");
    timeEditBox.classList.add("hidden");
    adminBox.classList.add("hidden");
    settingsIconBtn.classList.add("hidden");
    settingsModal.classList.add("hidden");
    currentUserName = "";
  }
});