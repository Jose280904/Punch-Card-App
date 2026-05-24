import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
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

/* 
  Add your admin email here.
  You can add more admin emails inside this list.
*/
const adminEmails = [
  "jerodriguez2804@gmail.com",
  "emeza@pcpsystems.com"
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authBox = document.getElementById("authBox");
const clockBox = document.getElementById("clockBox");
const adminBox = document.getElementById("adminBox");
const welcomeText = document.getElementById("welcomeText");
const records = document.getElementById("records");

let currentUserName = "";

document.getElementById("signupBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    alert("For a new account, enter name, email, and password.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "employees", user.uid), {
      name,
      email,
      createdAt: serverTimestamp()
    });

    alert("Account created!");
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
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

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
});

document.getElementById("clockInBtn").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, "punches"), {
    employeeId: user.uid,
    employeeName: currentUserName,
    employeeEmail: user.email,
    type: "Clock In",
    time: serverTimestamp()
  });

  alert("Clocked in!");
});

document.getElementById("clockOutBtn").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, "punches"), {
    employeeId: user.uid,
    employeeName: currentUserName,
    employeeEmail: user.email,
    type: "Clock Out",
    time: serverTimestamp()
  });

  alert("Clocked out!");
});

document.getElementById("loadRecordsBtn").addEventListener("click", async () => {
  records.innerHTML = "";

  const selectedWeek = document.getElementById("weekPicker").value;

  if (!selectedWeek) {
    alert("Please choose a week first.");
    return;
  }

  const q = query(collection(db, "punches"), orderBy("time", "asc"));
  const snapshot = await getDocs(q);

  const grouped = {};

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.time) return;

    const dateObj = data.time.toDate();
    const punchWeek = getWeekValue(dateObj);

    if (punchWeek !== selectedWeek) return;

    const employeeKey = data.employeeId || data.employeeEmail;
    const employeeName = data.employeeName || data.employeeEmail;

    if (!grouped[employeeKey]) {
      grouped[employeeKey] = {
        name: employeeName,
        days: {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: []
        },
        totalMinutes: 0
      };
    }

    const dayName = dateObj.toLocaleDateString("en-US", {
      weekday: "long"
    });

    const timeText = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    grouped[employeeKey].days[dayName].push({
      type: data.type,
      time: dateObj,
      display: `${timeText}<br>${data.type}`
    });
  });

  Object.values(grouped).forEach((employee) => {
    employee.totalMinutes = calculateWeeklyMinutes(employee.days);

    records.innerHTML += `
      <div class="employee-card">
        <h3>${employee.name}</h3>

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
            ${createDayCell(employee.days.Monday)}
            ${createDayCell(employee.days.Tuesday)}
            ${createDayCell(employee.days.Wednesday)}
            ${createDayCell(employee.days.Thursday)}
            ${createDayCell(employee.days.Friday)}
            ${createDayCell(employee.days.Saturday)}
            ${createDayCell(employee.days.Sunday)}
            <td class="total-hours">${formatMinutes(employee.totalMinutes)}</td>
          </tr>
        </table>
      </div>
    `;
  });

  if (records.innerHTML === "") {
    records.innerHTML = `<p class="no-records">No records found for this week.</p>`;
  }
});

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

function getWeekValue(date) {
  const tempDate = new Date(date.getTime());
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authBox.classList.add("hidden");
    clockBox.classList.remove("hidden");

    const employeeDoc = await getDoc(doc(db, "employees", user.uid));

    if (employeeDoc.exists()) {
      currentUserName = employeeDoc.data().name;
    } else {
      currentUserName = user.email;
    }

    welcomeText.innerHTML = `Welcome, <span>${currentUserName}</span>`;

    if (adminEmails.includes(user.email)) {
      adminBox.classList.remove("hidden");
    } else {
      adminBox.classList.add("hidden");
    }
  } else {
    authBox.classList.remove("hidden");
    clockBox.classList.add("hidden");
    adminBox.classList.add("hidden");
  }
});