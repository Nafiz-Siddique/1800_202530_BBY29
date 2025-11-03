// translator.js
import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const API_URL = "https://api.mymemory.translated.net/get";

const translateBtn = document.getElementById("translateBtn");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const fromLang = document.getElementById("fromLang");
const toLang = document.getElementById("toLang");
const swapBtn = document.getElementById("swapBtn");
const micBtn = document.getElementById("micBtn");

// Open Favorites/History Modal
document.getElementById("favoritesBtn").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("favoritesModal"));
  modal.show();
  loadUserTranslations();
});

//Swap language dropdowns and text fields
swapBtn.addEventListener("click", () => {
  const tempLang = fromLang.value;
  fromLang.value = toLang.value;
  toLang.value = tempLang;

  const tempText = inputText.value;
  inputText.value = outputText.value;
  outputText.value = tempText;

  console.log(`Swapped: ${fromLang.value} ↔ ${toLang.value}`);
});

//Real-Time Translation (Automatic)
let translateTimeout;

// Shared translation function (used by both auto + manual)
async function performTranslation() {
  const text = inputText.value.trim();
  const source = fromLang.value.toLowerCase();
  const target = toLang.value.toLowerCase();

  if (!text) {
    outputText.value = "";
    return;
  }

  outputText.value = "⏳ Translating...";

  try {
    const res = await fetch(
      `${API_URL}?q=${encodeURIComponent(text)}&langpair=${source}|${target}`
    );

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data = await res.json();
    const translatedText =
      data.responseData.translatedText || "❌ Translation failed.";

    outputText.value = translatedText;

    // Save translation to Firestore (history)
    if (auth.currentUser) {
      await addDoc(collection(db, "users", auth.currentUser.uid, "history"), {
        from: source,
        to: target,
        input: text,
        output: translatedText,
        favorite: false,
        timestamp: serverTimestamp(),
      });
      console.log("Translation saved to Firestore!");
    } else {
      console.log("User not logged in — translation not saved.");
    }
  } catch (err) {
    console.error("Translation error:", err);
    outputText.value = "❌ Error connecting to translation service.";
  }
}

// Auto-translate as user types
inputText.addEventListener("input", () => {
  clearTimeout(translateTimeout);
  translateTimeout = setTimeout(performTranslation, 800);
});

// Manual translation button, cuz im too lazy to just delete it and ocd wants me to fill in that box
translateBtn.addEventListener("click", performTranslation);

// Load user’s history + favorites
async function loadUserTranslations() {
  const user = auth.currentUser;
  if (!user) return;

  const historyDiv = document.getElementById("history");
  const favoritesDiv = document.getElementById("favorites");
  historyDiv.innerHTML = "Loading...";
  favoritesDiv.innerHTML = "Loading...";

  const q = query(
    collection(db, "users", user.uid, "history"),
    orderBy("timestamp", "desc")
  );
  const snapshot = await getDocs(q);

  let historyHTML = "";
  let favoritesHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const card = `
      <div class="p-2 border rounded mb-2 d-flex justify-content-between align-items-center">
        <div>
          <strong>${data.input}</strong> → ${data.output}
          <small class="text-muted d-block">${data.from} → ${data.to}</small>
        </div>
        <i class="bi ${
          data.favorite ? "bi-star-fill text-warning" : "bi-star"
        }"
           style="cursor:pointer;"
           onclick="toggleFavorite('${docSnap.id}', ${!data.favorite})"></i>
      </div>`;

    historyHTML += card;
    if (data.favorite) favoritesHTML += card;
  });

  historyDiv.innerHTML = historyHTML || "<p>No history yet.</p>";
  favoritesDiv.innerHTML = favoritesHTML || "<p>No favorites yet.</p>";
}

// Toggle favorite (update Firestore)
window.toggleFavorite = async (id, makeFavorite) => {
  const user = auth.currentUser;
  if (!user) return;

  await updateDoc(doc(db, "users", user.uid, "history", id), {
    favorite: makeFavorite,
  });
  loadUserTranslations();
};

// Speech Recognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  console.warn("Speech recognition not supported in this browser.");
  micBtn.disabled = true;
  micBtn.textContent = "🎤 Not supported";
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  // Map language codes to locales since myMemory api uses weird words shorthands for the language smh
  const langMap = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    nl: "nl-NL",
    ru: "ru-RU",
    "zh-CN": "zh-CN",
    "zh-TW": "zh-TW",
    ja: "ja-JP",
    ko: "ko-KR",
    ar: "ar-SA",
    tr: "tr-TR",
    pl: "pl-PL",
    sv: "sv-SE",
    da: "da-DK",
    fi: "fi-FI",
    no: "no-NO",
    el: "el-GR",
    cs: "cs-CZ",
    hu: "hu-HU",
    ro: "ro-RO",
    bg: "bg-BG",
    hi: "hi-IN",
    id: "id-ID",
    ms: "ms-MY",
    th: "th-TH",
    vi: "vi-VN",
    he: "he-IL",
    uk: "uk-UA",
  };

  micBtn.addEventListener("click", () => {
    try {
      recognition.lang = langMap[fromLang.value] || "en-US";
      recognition.start();
      micBtn.textContent = "🎙️ Listening...";
      micBtn.classList.add("btn-danger");
    } catch (e) {
      console.error("Mic already active or permission denied:", e);
    }
  });

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript;
    inputText.value = transcript;
    console.log("Speech recognized:", transcript);
    performTranslation(); // instantly translate after recognition
  });

  recognition.addEventListener("end", () => {
    micBtn.textContent = "🎤 Speak";
    micBtn.classList.remove("btn-danger");
  });

  recognition.addEventListener("error", (event) => {
    console.error("Speech recognition error:", event.error);
    micBtn.textContent = "🎤 Speak";
    micBtn.classList.remove("btn-danger");
  });
}
// Settings Modal Logic
const settingsBtn = document.getElementById("settingsBtn");
const darkModeToggle = document.getElementById("darkModeToggle");

// When the cogwheel is clicked, open settings modal
settingsBtn.addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("settingsModal"));
  modal.show();
});

// Load dark mode preference if previously enabled
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
  darkModeToggle.checked = true;
}

// Listen for dark mode toggle changes
darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", darkModeToggle.checked);
  localStorage.setItem("darkMode", darkModeToggle.checked);
});
