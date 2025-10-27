// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBljsh7t0XgfzoExwMapd_hbyRfk23mQzk",
  authDomain: "lingualink-45f5a.firebaseapp.com",
  projectId: "lingualink-45f5a",
  storageBucket: "lingualink-45f5a.firebasestorage.app",
  messagingSenderId: "344846878251",
  appId: "1:344846878251:web:21af8f57fdfe40d8354c6e"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
