// src/login.js
import { auth } from "/src/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const form = document.querySelector("form");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const errorMsg = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.innerText = "";

  // Validate inputs before attempting login
  const errors = getLoginFormErrors(emailInput.value, passwordInput.value);
  if (errors.length > 0) {
    errorMsg.innerText = errors.join(". ");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    alert("Login successful! Redirecting to translator...");
    window.location.href = "translator.html";
  } catch (err) {
    errorMsg.innerText = `Login failed: ${err.message}`;
  }
});

// ---- Helper validation function ----
function getLoginFormErrors(email, password) {
  const errors = [];

  if (!email) errors.push("Please enter your email");
  if (!password) errors.push("Please enter your password");
  if (password && password.length < 8)
    errors.push("Password must have at least 8 characters");

  return errors;
}
