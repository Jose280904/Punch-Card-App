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
  serverTimestamp
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
  "emeza@pcpsystems.com"
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

let currentUserName = "";

setCurrentWeek();

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
    welcomeText.innerHTML = `Welcome, <span>${currentUserName}</span>`;
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
  await savePunch("Clock In");
});

document.getElementById("clockOutBtn").addEventListener("click", async () => {
  await savePunch("Clock Out");
});

document.getElementById("loadRecordsBtn").addEventListener("click", async () => {
  records.innerHTML = "";

  const selectedWeek = weekPicker.value;

  if (!selectedWeek) {
    alert("Please choose a week first.");
    return;
  }

  try {
    const { startOfWeek, endOfWeek } = getWeekDateRange(selectedWeek);
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
      const employeeKey = cleanEmail;

      const employeeName =
        employeeNamesByEmail[cleanEmail] ||
        data.employeeName ||
        cleanEmail;

      if (!grouped[employeeKey]) {
        grouped[employeeKey] = {
          name: employeeName,
          days: emptyWeek()
        };
      }

      addPunchToDay(grouped[employeeKey].days, data, dateObj);
    });

    const employees = Object.values(grouped);

    if (employees.length === 0) {
      records.innerHTML = `<p class="no-records">No records found for this week.</p>`;
      return;
    }

    employees.forEach((employee) => {
      const totalMinutes = calculateWeeklyMinutes(employee.days);

      records.innerHTML += buildWeekTable(employee.name, employee.days, totalMinutes);
    });
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById("loadMyHistoryBtn").addEventListener("click", async () => {
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
          ${createHeaderCell("Monday")}
          ${createHeaderCell("Tuesday")}
          ${createHeaderCell("Wednesday")}
          ${createHeaderCell("Thursday")}
          ${createHeaderCell("Friday")}
          ${createHeaderCell("Saturday")}
          ${createHeaderCell("Sunday")}
          <th>Total<br>Hours</th>
        </tr>

        <tr>
          ${createDayCell(days.Monday)}
          ${createDayCell(days.Tuesday)}
          ${createDayCell(days.Wednesday)}
          ${createDayCell(days.Thursday)}
          ${createDayCell(days.Friday)}
          ${createDayCell(days.Saturday)}
          ${createDayCell(days.Sunday)}
          <td class="total-hours">${formatMinutes(totalMinutes)}</td>
        </tr>
      </table>
    `;
  } catch (error) {
    alert(error.message);
  }
});

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
    time: serverTimestamp()
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
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
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

  days[dayName].push({
    type: data.type,
    time: dateObj,
    display: `${timeText}<br>${data.type}`
  });
}

function buildWeekTable(employeeName, days, totalMinutes) {
  return `
    <div class="employee-card">
      <h3>${employeeName}</h3>

      <table class="week-table">
        <tr>
          ${createHeaderCell("Monday")}
          ${createHeaderCell("Tuesday")}
          ${createHeaderCell("Wednesday")}
          ${createHeaderCell("Thursday")}
          ${createHeaderCell("Friday")}
          ${createHeaderCell("Saturday")}
          ${createHeaderCell("Sunday")}
          <th>Total<br>Hours</th>
        </tr>

        <tr>
          ${createDayCell(days.Monday)}
          ${createDayCell(days.Tuesday)}
          ${createDayCell(days.Wednesday)}
          ${createDayCell(days.Thursday)}
          ${createDayCell(days.Friday)}
          ${createDayCell(days.Saturday)}
          ${createDayCell(days.Sunday)}
          <td class="total-hours">${formatMinutes(totalMinutes)}</td>
        </tr>
      </table>
    </div>
  `;
}

function createHeaderCell(dayName) {
  return `<th>${dayName.slice(0, 3)}</th>`;
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
  let clockInTime = null;

  punches.forEach((punch) => {
    if (punch.type === "Clock In") {
      clockInTime = punch.time;
    }

    if (punch.type === "Clock Out" && clockInTime) {
      totalMinutes += Math.round((punch.time - clockInTime) / 60000);
      clockInTime = null;
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

  const janFourth = new Date(year, 0, 4);
  const janFourthDay = janFourth.getDay() || 7;

  const mondayOfWeekOne = new Date(janFourth);
  mondayOfWeekOne.setDate(janFourth.getDate() - janFourthDay + 1);
  mondayOfWeekOne.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(mondayOfWeekOne);
  startOfWeek.setDate(mondayOfWeekOne.getDate() + (week - 1) * 7);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return { startOfWeek, endOfWeek };
}

function getCurrentWeekValue() {
  const now = new Date();
  const tempDate = new Date(now.getTime());

  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));

  const week1 = new Date(tempDate.getFullYear(), 0, 4);

  const weekNumber =
    1 +
    Math.round(
      ((tempDate - week1) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    );

  return `${tempDate.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authBox.classList.add("hidden");
    signupBox.classList.add("hidden");
    clockBox.classList.remove("hidden");
    myHistoryBox.classList.remove("hidden");
    settingsIconBtn.classList.remove("hidden");

    const cleanEmail = user.email.toLowerCase().trim();

    currentUserName = await getEmployeeName(user.uid, cleanEmail);
    settingsName.value = currentUserName;

    if (currentUserName) {
      welcomeText.innerHTML = `Welcome, <span>${currentUserName}</span>`;
    } else {
      welcomeText.innerHTML = `Welcome, <span>Add your name in settings</span>`;
    }

    const cleanAdminEmails = adminEmails.map((email) =>
      email.toLowerCase().trim()
    );

    if (cleanAdminEmails.includes(cleanEmail)) {
      adminBox.classList.remove("hidden");
    } else {
      adminBox.classList.add("hidden");
    }
  } else {
    authBox.classList.remove("hidden");
    signupBox.classList.add("hidden");
    clockBox.classList.add("hidden");
    myHistoryBox.classList.add("hidden");
    adminBox.classList.add("hidden");
    settingsIconBtn.classList.add("hidden");
    settingsModal.classList.add("hidden");
    currentUserName = "";
  }
});