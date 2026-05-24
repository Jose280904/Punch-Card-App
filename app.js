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
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Replace this with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBLzh6EHZ8wD6MHDo3jgovMA7CFsUDr7Ww",
  authDomain: "employee-time-clock-f2284.firebaseapp.com",
  projectId: "employee-time-clock-f2284",
  storageBucket: "employee-time-clock-f2284.firebasestorage.app",
  messagingSenderId: "733514813717",
  appId: "1:733514813717:web:0a5db5afe7a097e11b191c",
  measurementId: "G-ZCYGJWZWDJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Change this to your admin email
const adminEmails = [
    "jerodriguez2804@gmail.com",
    "emeza@pcpsystems.com"
];

const authBox = document.getElementById("authBox");
const clockBox = document.getElementById("clockBox");
const adminBox = document.getElementById("adminBox");
const welcomeText = document.getElementById("welcomeText");
const records = document.getElementById("records");

document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await createUserWithEmailAndPassword(auth, email, password);
  alert("Account created!");
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await signInWithEmailAndPassword(auth, email, password);
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
});

document.getElementById("clockInBtn").addEventListener("click", async () => {
  const user = auth.currentUser;

  await addDoc(collection(db, "punches"), {
    employeeEmail: user.email,
    type: "Clock In",
    time: serverTimestamp()
  });

  alert("Clocked in!");
});

document.getElementById("clockOutBtn").addEventListener("click", async () => {
  const user = auth.currentUser;

  await addDoc(collection(db, "punches"), {
    employeeEmail: user.email,
    type: "Clock Out",
    time: serverTimestamp()
  });

  alert("Clocked out!");
});

document.getElementById("loadRecordsBtn").addEventListener("click", async () => {
  records.innerHTML = "";

  const q = query(collection(db, "punches"), orderBy("time", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach((doc) => {
    const data = doc.data();
    const time = data.time?.toDate().toLocaleString() || "Loading time...";

    records.innerHTML += `
      <div class="record">
        <strong>${data.employeeEmail}</strong><br>
        ${data.type}<br>
        ${time}
      </div>
    `;
  });
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    authBox.classList.add("hidden");
    clockBox.classList.remove("hidden");
    welcomeText.textContent = `Welcome, ${user.email}`;

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