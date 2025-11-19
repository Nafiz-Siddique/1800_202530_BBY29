// translator.js


// --- FIREBASE IMPORTS ---
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

// --- TRANSLATION API CONFIG ---
const API_URL = "https://api.mymemory.translated.net/get"; // Free public translation API

// --- SLANG DICTIONARY ---
// Converts internet slang or abbreviations into proper English before translation
const slangDictionary = {
 "brb": "be right back",
  "yolo": "you only live once",
  "fam": "family",
  "tbh": "to be honest",
  "imo": "in my opinion",
  "fomo": "fear of missing out",
  "rn": "right now",
  "yo": "hi",
  "sassy man": "zesty guy",
  "onika ate burgers": "nicki minaj is fat",
  "idgaf": "I don't give a f***",
  "water is tight": "person does not have water at all",
  "motion": "money",
  "bruh": "bro",
  "gtg": "got to go",
  "idk": "I don't know",
  "tung tung tung sahur": "mad man",
  "lol": "laughing out loud",
  "smh": "shaking my head",
  "btw": "by the way",
  "lit": "amazing",
  "cap": "lie",
  "no cap": "no lie",
  "broke boi": "poor person",
  "clock it": "get that",
  "no cap": "no lie",
  "slaps": "is really good",
  "sus": "suspicious",
  "tea": "gossip",
  "woke": " aware",
  "thirsty": "desperate for attention",
  "savage": "ruthless",
  "lowkey": "somewhat",
  "highkey": "definitely",
  "clout": "influence or fame",
  "shade": "insult",
  "fr": "for real",
  "bet": "okay/sure",
  "goat": "greatest of all time",
  "stan": "overzealous ",
  "ship": "support",
  "extra": "over the top",
  "bussin": "really good",
  "snatched": "looking good",
  "vibe check": "How are you feeling?",
  "cheugy": "out of date or trying too hard",
  "mc": "main character",
  "hits different": "better than usual",
  "bop": "thot",
  "canceled": "exiled",
  "ghosted": "ignored",
  "salty": "mad",
  "fire": "really good",
  "vibes": "feelings",
  "flex": "show off",
  "bro": "brother",
  "diddy": "baby oil needed for the little children inb my basement",
  "bet": "sure",
  "flex": "show off",
  "flexing": "showing off",
  "dope": "cool",
  "irl": "in real life",
  "idrc": "I don't really care",
  "idc": "I don't care",
  "iykyk": "if you know you know",
  "wyd": "what are you doing",
  "wby" : "what about you",
  "What's good": "Hello",
  "Bestie": "Best friend",
  "boutta": "about to",
  "deadass": "seriously",
  "cooked": "going to fail",
  "jit": "young person",
  "typeshit": "agree",
  "ate": "did/looks great",
  "finna":"going to",
  "fire": "cool/amazing",
  "gas": "cool/amazing",
  "mid": "average/mediocre",
  "rizz": "charm",
  "mood": "relatable",
  "snack": "attractive",
  "whip": "car",
  "wildin'": "crazy",
  "fruity":"gay",
  "drip":"stylish",
  "dawg":"friend",
  "on god":"I swear",
  "hella":"very/a lot of",
  "fit":"outfit",
  "aura":"vibe/energy",
  "tweaking":"overreacting",
  "caught slippin'":"made a mistake",
  "caught in 4k":"caught red-handed",
  "based":"approved",
  "big back": "fat ass",
  "OD":"overdoing it",
  "ops":"opponents/enemies",
  "op":"overpowered",
  "trenches":"the streets",
  "mogging":"outperforming",
  "hol up":"wait a moment",
  "hold up":"wait a moment",
  "chief":"leader/boss",
  "bread":"money",
  "sigma":"alpha",
  "word":"agreement/acknowledgment",
  "og":"original",
  "fineshyt":"goodlooking",
  "gr8":"great",
  "str8":"straight",
};


// Replaces slang words in the input text with their proper meaning
function applySlangDictionary(text) {
  let processedText = text;
  for (const [slang, meaning] of Object.entries(slangDictionary)) {
    const regex = new RegExp(`\\b${slang}\\b`, "gi"); // match whole word, case-insensitive
    processedText = processedText.replace(regex, meaning);
  }
  return processedText;
}

// --- DOM ELEMENTS ---
// Grabbing all key elements from the HTML
const translateBtn = document.getElementById("translateBtn");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const fromLang = document.getElementById("fromLang");
const toLang = document.getElementById("toLang");
const swapBtn = document.getElementById("swapBtn");
const micBtn = document.getElementById("micBtn");

// --- FAVORITES / HISTORY MODAL ---
// Opens the history modal and loads previous user translations
document.getElementById("favoritesBtn").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("favoritesModal"));
  modal.show();
  loadUserTranslations();
});

// --- SWAP LANGUAGES ---
// Switches both dropdowns and their text contents
swapBtn.addEventListener("click", () => {
  const tempLang = fromLang.value;
  fromLang.value = toLang.value;
  toLang.value = tempLang;

  const tempText = inputText.value;
  inputText.value = outputText.value;
  outputText.value = tempText;

  console.log(`Swapped: ${fromLang.value} ↔ ${toLang.value}`);
});

// - BLOCK SWAPPING LANGUAGE WHEN SLANG IS ON & swap to english
function swapToEnglish(){
  toLang.value = "en";
}

function turnDropDownOff() {
  document.getElementById("toLang").disabled = true;
}

function turnDropDownOn() {
  document.getElementById("toLang").disabled = false;
}

function blockDropDown() {
  const checkbox = document.getElementById("slangToggle");
  if (checkbox.checked) {
    turnDropDownOff();
    swapToEnglish();
    window.onload=turnDropDownOff;
  } else {
    turnDropDownOn();
  }
}

// Tooltip timer
window.onload = function toolTipTimer(){

setTimeout (() => {
const tip1 = document.getElementById("tooltip");
const tip2 = document.getElementById("tooltip2");

tip1.style.display = 'none';
tip2.style.display = 'none';



}, 10000)
}
// Make it run automatically when the checkbox changes:
document.getElementById("slangToggle").addEventListener("change", blockDropDown);


// --- TRANSLATION FUNCTION ---
// Core logic that handles translation, slang cleaning, and saving history
async function performTranslation() {
  let text = inputText.value.trim();
  const source = fromLang.value.toLowerCase();
  const target = toLang.value.toLowerCase();

  if (!text) {
    outputText.value = "";
    return;
  }

  // Check if "Slang Mode" is on (from localStorage or settings toggle)
  const slangEnabled =
    localStorage.getItem("slangMode") === "true" ||
    (document.getElementById("slangToggle")?.checked ?? false);

  // If slang mode is enabled, translate slang to standard English first
  if (slangEnabled) {
    text = applySlangDictionary(text);
    console.log(" Slang mode ON →", text);
  }

  // If both languages are English, skip the API call
  if (source === "en" && target === "en") {
    outputText.value = text;
    console.log("English → English detected (no translation needed)");
    return;
  }

  outputText.value = "Translating...";

  try {
    // Call MyMemory API
    const res = await fetch(
      `${API_URL}?q=${encodeURIComponent(text)}&langpair=${source}|${target}`
    );

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data = await res.json();
    const translatedText =
      data.responseData.translatedText || "Translation failed.";

    outputText.value = translatedText;

    // Save to Firestore if user is logged in
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
    outputText.value = "Error connecting to translation service.";
  }
}

// --- AUTO-TRANSLATE ---
// Waits 800ms after typing stops, then auto-translates
let translateTimeout;
inputText.addEventListener("input", () => {
  clearTimeout(translateTimeout);
  translateTimeout = setTimeout(performTranslation, 800);
});

// --- MANUAL TRANSLATE BUTTON ---
// Just runs performTranslation() when clicked
translateBtn.addEventListener("click", performTranslation);

// --- LOAD USER HISTORY & FAVORITES ---
// Fetches past translations from Firestore and displays them
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
        <i class="bi ${data.favorite ? "bi-star-fill text-warning" : "bi-star"}"
           style="cursor:pointer;"
           onclick="toggleFavorite('${docSnap.id}', ${!data.favorite})"></i>
      </div>`;

    historyHTML += card;
    if (data.favorite) favoritesHTML += card;
  });

  historyDiv.innerHTML = historyHTML || "<p>No history yet.</p>";
  favoritesDiv.innerHTML = favoritesHTML || "<p>No favorites yet.</p>";
}

// --- TOGGLE FAVORITE ---
// Updates Firestore when a user clicks the star icon
window.toggleFavorite = async (id, makeFavorite) => {
  const user = auth.currentUser;
  if (!user) return;

  await updateDoc(doc(db, "users", user.uid, "history", id), {
    favorite: makeFavorite,
  });
  loadUserTranslations();
};

// --- SPEECH RECOGNITION ---
// Uses the browser's built-in Web Speech API (no external library)
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  // If browser doesn’t support it, disable the mic
  console.warn("Speech recognition not supported in this browser.");
  micBtn.disabled = true;
  micBtn.textContent = "Not supported";
} else {
  // Create a recognition instance
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  // Map dropdown language codes to browser locales
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

  // Start listening when mic is clicked
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

  // When speech is recognized, fill input and auto-translate
  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript;
    inputText.value = transcript;
    console.log("Speech recognized:", transcript);
    performTranslation();
  });

  // When done or canceled, reset button text
  recognition.addEventListener("end", () => {
    micBtn.textContent = "🎤 Speak";
    micBtn.classList.remove("btn-danger");
  });

  // Handle recognition errors
  recognition.addEventListener("error", (event) => {
    console.error("Speech recognition error:", event.error);
    micBtn.textContent = "🎤 Speak";
    micBtn.classList.remove("btn-danger");
  });
}

// --- SETTINGS MODAL ---
// Handles dark mode and slang mode preferences
const settingsBtn = document.getElementById("settingsBtn");
const darkModeToggle = document.getElementById("darkModeToggle");

// Open settings modal (cogwheel)
settingsBtn.addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("settingsModal"));
  modal.show();
});

// --- DARK MODE ---
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
  darkModeToggle.checked = true;
}

// When user toggles dark mode, save preference
darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", darkModeToggle.checked);
  localStorage.setItem("darkMode", darkModeToggle.checked);
});

// --- SLANG MODE TOGGLE ---
// Save and load slang mode preference
const slangToggle = document.getElementById("slangToggle");

if (localStorage.getItem("slangMode") === "true") {
  slangToggle.checked = true;
  turnDropDownOff();
  swapToEnglish();
  window.onload=turnDropDownOff;
}

slangToggle.addEventListener("change", () => {
  localStorage.setItem("slangMode", slangToggle.checked);

});
