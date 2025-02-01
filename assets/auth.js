// Import Firebase methods
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbTLrujtzrTZ-FvqxDa5t-5Dce2Vcy8nw",
  authDomain: "quiz-user-login.firebaseapp.com",
  projectId: "quiz-user-login",
  storageBucket: "quiz-user-login.appspot.com",
  messagingSenderId: "708666745396",
  appId: "1:708666745396:web:2b0935cbd171676349a061"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Select login, logout, and form elements
const loginForm = document.querySelector('.login-form');
const signUpForm = document.querySelector('.sign-up-form');
const logoutButton = document.getElementById('logoutButton');
const googleSignUpButton = document.getElementById('google-signup');
const loginButton = document.getElementById('loginButton');
var statusMsg=document.getElementById('status');
var statusStd=document.getElementById('student-status');
console.log(statusStd)
// ========================== Sign Up ==========================
// Select the Sign Up button
const signupButton = document.getElementById("signupButton");

// Redirect to signup page when clicked
if (signupButton) {
  signupButton.addEventListener("click", () => {
    window.location.href = "user-signup.html"; // Change to your signup page
  });
}

if (signUpForm) {
  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('[name="email"]').value;
    const password = document.querySelector('[name="password"]').value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User signed up:", userCredential.user);
      alert("Sign-up successful!");
      window.location.href = "user-login.html"; // Redirect to login page
    } catch (error) {
      console.error("Sign-up error:", error.message);
      alert(error.message);
    }
  });
}

// ========================== Login (Email & Password) ==========================
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user);
      alert("Login successful!");

      // Hide login button after login
      if (loginButton) loginButton.style.display = "none";

      // Redirect to dashboard
      window.location.href = "index.html";
    } catch (error) {
      console.error("Login error:", error.message);
      alert("Invalid email or password. Please try again.");
    }
  });
}

// ========================== Google Login ==========================
if (googleSignUpButton) {
  googleSignUpButton.addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google user logged in:", result.user);
      alert(`Welcome, ${result.user.displayName}!`);

      // Hide login button after login
      if (loginButton) loginButton.style.display = "none";

      // Redirect after login
      window.location.href = "index.html";
    } catch (error) {
      console.error("Google login error:", error.message);
      alert("Google login failed. Please try again.");
    }
  });
}

// ========================== Logout ==========================
if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
      alert("Logout successful!");

      // Redirect after logout
      window.location.href = "user-login.html";
    } catch (error) {
      console.error("Logout error:", error.message);
      alert("Logout failed. Please try again.");
    }
  });
}

// ========================== Auth State Monitoring ==========================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user);

    // Hide login options and show logout button
    if (logoutButton) logoutButton.style.display = "block";
    if (loginButton) loginButton.style.display = "none"; 
    if (loginForm) loginForm.style.display = "none";
    if (googleSignUpButton) googleSignUpButton.style.display = "none";
    if (statusMsg) statusMsg.style.display="none";
    if (statusStd)statusStd.style.display="none";
  } else {
    console.log("User is logged out");
    if (logoutButton) logoutButton.style.display = "none";
    if (loginButton) loginButton.style.display = "block";
    if (loginForm) loginForm.style.display = "block";
    if (googleSignUpButton) googleSignUpButton.style.display = "block";
    let submitBtns = document.querySelectorAll('button[type="submit"]');
    submitBtns.forEach(btn => {
      btn.disabled = true;
      
      if (statusMsg) statusMsg.style.display="block";
    if (statusStd)statusStd.style.display="block";
    });
    // Show login options & hide logout button
   
  }
});
