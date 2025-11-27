// translatorAuth.js
import { auth } from "./firebase.js";
import { onAuthStateChanged,
  signOut 
  
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

//logout 
// for the longest time i could not figure out why my logout 
//button isnt wokring turns out because in the ID i wrote "Logoutbtn" instead of "logoutBtn"

const logoutBtn = document.getElementById("logoutBtn");
 if(logoutBtn){
  logoutBtn.addEventListener("click", () =>{
    signOut(auth)
    .then(() => { 
      console.log("user logged out")
      window.location.herf ="login.html";
    })
    .catch ((error) => {
      console.error("logout error:", error);
    });
  });

 }