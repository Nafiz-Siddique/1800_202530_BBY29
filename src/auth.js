import { auth } from "/src/firebaseConfig.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// For signup page, creates new firebase user
export function signupUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// For login page, logs in existing firebase user
export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
