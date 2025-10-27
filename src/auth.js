import { auth } from "/src/firebaseConfig.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// RUN ON SIGNUP PAGE
export function signupUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// RUN ON LOGIN PAGE
export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
