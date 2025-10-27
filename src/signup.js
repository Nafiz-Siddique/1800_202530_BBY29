// src/signup.js
import { auth } from "/src/firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const form = document.querySelector("form");
const firstnameInput = document.getElementById("firstname-input");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const repeatPasswordInput = document.getElementById("repeat-password-input");
const errorMsg = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Clear old error
  errorMsg.innerText = "";

  // Validate inputs before calling Firebase
  const errors = getSignupFormErrors(
    firstnameInput.value,
    emailInput.value,
    passwordInput.value,
    repeatPasswordInput.value
  );

  if (errors.length > 0) {
    errorMsg.innerText = errors.join(". ");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    alert("Signup successful! Redirecting...");
    window.location.href = "Login.html";
  } catch (err) {
    errorMsg.innerText = `Firebase: ${err.message}`;
  }
});

// ---- Helper function for validation ----
function getSignupFormErrors(firstname, email, password, repeatPassword) {
  const errors = [];

  if (!firstname) errors.push("Firstname is required");
  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");
  if (!repeatPassword) errors.push("Repeat password is required");
  if (password && password.length < 8) errors.push("Password must have at least 8 characters");
  if (password !== repeatPassword) errors.push("Passwords do not match");

  return errors;
}
