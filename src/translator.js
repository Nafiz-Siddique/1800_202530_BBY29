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

//for the slangs dictionary
//add more slang terms as needed
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
function applySlangDictionary(text) {
  let processedText = text;
  for (const [slang, meaning] of Object.entries(slangDictionary)) {
    const regex = new RegExp(`\\b${slang}\\b`, "gi");
    processedText = processedText.replace(regex, meaning);
  }
  return processedText;
}

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
//UGHHH im trying to make slang mode work here help
//english to english slang translator
//im so done with this project
//omg it worked i cant anymore 
async function performTranslation() {
  let text = inputText.value.trim();
  const source = fromLang.value.toLowerCase();
  const target = toLang.value.toLowerCase();

  if (!text) {
    outputText.value = "";
    return;
  }
   
  const slangEnabled =
    localStorage.getItem("slangMode") === "true" ||
    (document.getElementById("slangToggle")?.checked ?? false);

  // If slang mode is on, clean up text first
  if (slangEnabled) {
    text = applySlangDictionary(text);
    console.log("💬 Slang mode ON →", text);
  }

    
  if (source === "en" && target === "en") {
    outputText.value = text;
    console.log("Slang English → English detected");
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

// Slang mode toggle save/load
const slangToggle = document.getElementById("slangToggle");

// Load saved slang mode setting
if (localStorage.getItem("slangMode") === "true") {
  slangToggle.checked = true;
}

// Save slang mode when changed
slangToggle.addEventListener("change", () => {
  localStorage.setItem("slangMode", slangToggle.checked);
});