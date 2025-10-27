// translatorAuth.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // not logged in — redirect to login
    alert("Please log in to access the translator.");
    window.location.href = "Login.html";
  } else {
    console.log("User authenticated:", user.email);
    // Optional: personalize the page
    const namePlaceholder = document.getElementById("user-name");
    if (namePlaceholder) {
      namePlaceholder.textContent = user.displayName || user.email;
    }
  }
});
