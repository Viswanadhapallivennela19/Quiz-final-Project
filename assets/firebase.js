// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwVUaSZaYJ0JJaaBQodGF4BnzGQHEjFUM",
  authDomain: "quiz-signup-686cf.firebaseapp.com",
  projectId: "quiz-signup-686cf",
  storageBucket: "quiz-signup-686cf.appspot.com",
  messagingSenderId: "74869102665",
  appId: "1:74869102665:web:154d4e3d241ac17536c798",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
 
// ************************ SignUp Section  ***************************
const registerForm = document.getElementById('registerForm');
  if(registerForm){
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const signUpRegex = /^[a-zA-Z]+\.admin\d$/;
      const confirmPassword = document.getElementById('confirmPassword').value;
      if(!signUpRegex.test(password)){
        alert("Don't match the Admin Pattern")
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert('Registration successful! Welcome, ' + name);
        window.location.href = 'admin-login.html'; // Redirect to login page
      } catch (error) {
        alert('Error registering: ' + error.message);
      }
    });

  }
// ************************ Login and LogOut Functionality ***************************

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          const loginRegex = /^[a-zA-Z]+\.admin\d$/;

          console.log("Attempting login with email:", email);  

          try {
              const userCredential = await signInWithEmailAndPassword(auth, email, password);
              const userEmail = userCredential.user.email;

              console.log("Login successful! User email:", userEmail);  

              if (loginRegex.test(password)) {
                  const userName = userEmail.split('@')[0];  
                  localStorage.setItem('userName', userName);  

                  alert('Login successful! Welcome ' + userName);
                  window.location.href = 'admin.html';  
              } else {
                  alert('Invalid Credentials: Please Enter Valid Credentials');
              }
          } catch (error) {
              console.error('Error logging in:', error.message);  
              alert('Error logging in: ' + error.message);
          }
      });
  }

  if (logoutBtn) {
      const userName = localStorage.getItem('userName');
      if (userName) {
          document.getElementById('userName').textContent = userName;  
      } else {
          window.location.replace('admin-login.html');
      }
      // Logout Functionality
      document.getElementById('logoutBtn').addEventListener('click', () => {
          signOut(auth)
              .then(() => {
                  alert('Logged out successfully.');
                  localStorage.clear();  
                  window.location.replace('admin-login.html');
              })
              .catch((error) => {
                  alert('Error logging out: ' + error.message);
              });
      });
  }
});
