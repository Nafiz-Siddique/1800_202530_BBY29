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
  where,
  deleteDoc,
  limit as limitFn,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// -------------------- CONFIG & CONSTANTS --------------------
const API_URL = "https://api.mymemory.translated.net/get"; // translation API
const AUTO_TRANSLATE_DELAY = 800; // ms
const HISTORY_CAP = 100; // maximum history documents per user

// -------------------- SLANG DICTIONARY --------------------
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
  "onika burger": "nicki minaj is fat",
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
  "slaps": "is really good",
  "sus": "suspicious",
  "tea": "gossip",
  "woke": "aware",
  "thirsty": "desperate for attention",
  "savage": "ruthless",
  "lowkey": "somewhat",
  "highkey": "definitely",
  "clout": "influence or fame",
  "shade": "insult",
  "fr": "for real",
  "bet": "okay/sure",
  "goat": "greatest of all time",
  "stan": "overzealous supporter",
  "ship": "support a relationship",
  "extra": "over the top",
  "bussin": "really good",
  "snatched": "looking good",
  "vibe check": "how are you feeling",
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
  "diddy": "baby oil needed for the little children in my basement",
  "flexing": "showing off",
  "dope": "cool",
  "irl": "in real life",
  "idrc": "I don't really care",
  "idc": "I don't care",
  "iykyk": "if you know you know",
  "wyd": "what are you doing",
  "wby": "what about you",
  "what's good": "hello",
  "bestie": "best friend",
  "boutta": "about to",
  "deadass": "seriously",
  "cooked": "going to fail",
  "jit": "young person",
  "typeshit": "agree",
  "ate": "did great",
  "finna": "going to",
  "gas": "cool/amazing",
  "mid": "average",
  "rizz": "charm",
  "mood": "relatable",
  "snack": "attractive",
  "whip": "car",
  "wildin": "acting crazy",
  "wildin'": "acting crazy",
  "fruity": "gay",
  "drip": "stylish",
  "dawg": "friend",
  "on god": "I swear",
  "hella": "very",
  "fit": "outfit",
  "aura": "vibe/energy",
  "tweaking": "overreacting",
  "caught slippin": "made a mistake",
  "caught slippin'": "made a mistake",
  "caught in 4k": "caught red-handed",
  "based": "approved",
  "big back": "fat ass",
  "od": "overdoing it",
  "ops": "enemies",
  "op": "overpowered",
  "trenches": "the streets",
  "mogging": "dominating",
  "hol up": "wait a moment",
  "hold up": "wait a moment",
  "chief": "leader",
  "bread": "money",
  "sigma": "alpha",
  "word": "I agree",
  "og": "original",
  "fineshyt": "goodlooking",
  "gr8": "great",
  "str8": "straight",
  "soft launch": "subtle reveal",
  "down bad": "desperate",
  "icymi": "in case you missed it",
  "plot armor": "protected by luck",
  "bricked up": "aroused",
  "wassup": "what is up",
  "whats up": "what is up",
  "what's up": "what is up",
  "sup": "what is up",
  "gotchu": "I got you",
  "got you": "I understand / I will help",
  "gottem": "got them",
  "brodie": "close friend",
  "gang": "friends / group",
  "no kizzy": "no lie",
  "bffr": "be for real",
  "ong": "on god",
  "ion": "I don't",
  "iont": "I don't",
  "tryna": "trying to",
  "wya": "where you at",
  "hmu": "hit me up",
  "lmk": "let me know",
  "oml": "oh my lord",
  "oomf": "one of my followers",
  "gn": "goodnight",
  "gm": "good morning",
  "asl": "as hell",
  "smth": "something",
  "rlly": "really",
  "prolly": "probably",
  "jus": "just",
  "mb": "my bad",
  "tf": "the f***",
  "stg": "swear to god",
  "idwt": "I don't want to",
  "my fault": "I'm sorry",
  "locked in": "focused",
  "slime": "close friend",
  "pookie": "cute person",
  "gyat": "big butt",
  "gyatt": "big butt",
  "skibidi": "nonsense joke word",
  "rizz god": "person with a lot of charm",
  "delulu": "delusional",
  "situationship": "unclear relationship",
  "npc": "boring predictable person",
  "wassup bro": "what is up brother",
  "wassup g": "what is up friend",
  "wussup": "what is up",
  "waddup": "what is up",
  "wuzgood": "what is good",
};



function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

// Replaces slang words in the input text with their proper meaning
function applySlangDictionary(text) {
  let processedText = text;
  for (const [slang, meaning] of Object.entries(slangDictionary)) {
    const safe = escapeRegExp(slang);
    // \b ensures whole word matches; 'gi' for global + case-insensitive
    const regex = new RegExp(`\\b${safe}\\b`, "gi");
    processedText = processedText.replace(regex, meaning);
  }
  return processedText;
}

// -------------------- DOM ELEMENTS --------------------
const translateBtn = document.getElementById("translateBtn");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const fromLang = document.getElementById("fromLang");
const toLang = document.getElementById("toLang");
const swapBtn = document.getElementById("swapBtn");
const micBtn = document.getElementById("micBtn");
const favoritesBtn = document.getElementById("favoritesBtn");
const settingsBtn = document.getElementById("settingsBtn");
const darkModeToggle = document.getElementById("darkModeToggle");
const slangToggle = document.getElementById("slangToggle");

// Timed Tooltip for slang mode
function toolTipTimer() {
  setTimeout(() => {
    const tip1 = document.getElementById("tooltip");
    const tip2 = document.getElementById("tooltip2");
    if (tip1) tip1.style.display = "none";
    if (tip2) tip2.style.display = "none";
  }, 10000);
}

function initPreferences() { // load saved preferences from localStorage
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    if (darkModeToggle) darkModeToggle.checked = true;
  }
  if (localStorage.getItem("slangMode") === "true") {
    if (slangToggle) {
      slangToggle.checked = true;
      turnDropDownOff();
      swapToEnglish();
    }
  }
}

window.addEventListener("load", () => {
  toolTipTimer();
  initPreferences();
});

// -------------------- SLANG MODE HELPERS --------------------
function swapToEnglish() {
  if (toLang) toLang.value = "en";
}
function turnDropDownOff() {
  const t = document.getElementById("toLang");
  if (t) t.disabled = true;
}
function turnDropDownOn() {
  const t = document.getElementById("toLang");
  if (t) t.disabled = false;
}
function blockDropDown() {
  if (!slangToggle) return;
  if (slangToggle.checked) {
    turnDropDownOff();
    swapToEnglish();
  } else {
    turnDropDownOn();
  }
}
if (slangToggle) {
  slangToggle.addEventListener("change", () => {
    localStorage.setItem("slangMode", slangToggle.checked);
    blockDropDown();
  });
}

// -------------------- SWAP LANGUAGES --------------------
if (swapBtn) {
  swapBtn.addEventListener("click", () => {
    const tempLang = fromLang.value;
    fromLang.value = toLang.value;
    toLang.value = tempLang;

    const tempText = inputText.value;
    inputText.value = outputText.value;
    outputText.value = tempText;

    console.log(`Swapped: ${fromLang.value} ↔ ${toLang.value}`);
  });
}

// -------------------- TRANSLATION LOGIC --------------------
/*
  performTranslation()
  - Reads input text and language selections
  - Applies slang processing if enabled (slangMode)
  - Calls MyMemory API to translate processed text when needed
  - Saves translation to Firestore with:
      { originalInput, processedInput, output, from, to, favorite, slangMode, timestamp }
  - Deduplicates (based on originalInput + from + to) and updates existing doc instead of creating duplicates
*/
async function performTranslation() {
  const original = (inputText?.value || "").trim();
  const source = (fromLang?.value || "en").toLowerCase();
  const target = (toLang?.value || "en").toLowerCase();

  if (!original) {
    if (outputText) outputText.value = "";
    return;
  }

  // Check if slang mode is active (localStorage preference or toggle)
  const slangEnabled =
    localStorage.getItem("slangMode") === "true" ||
    (slangToggle?.checked ?? false);

  // processedInput: the text that will be given to the translation API
  const processedInput = slangEnabled ? applySlangDictionary(original) : original;

  // Short-circuit: if translating EN -> EN and slangMode processed it to same, just show processedInput
  if (source === "en" && target === "en") {
    if (outputText) outputText.value = processedInput;
    // Save to Firestore (with original + processed + slangMode flag)
    if (auth.currentUser) {
      await saveOrUpdateTranslation(auth.currentUser.uid, {
        originalInput: original,
        processedInput,
        from: source,
        to: target,
        output: processedInput,
        slangMode: slangEnabled,
      });
      await trimHistoryIfNeeded(auth.currentUser.uid);
    }
    return;
  }

  if (outputText) outputText.value = "Translating...";

  try {
    // call translation API with processedInput
    const res = await fetch(
      `${API_URL}?q=${encodeURIComponent(processedInput)}&langpair=${source}|${target}`
    );

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    const translatedText = data.responseData?.translatedText || "Translation failed.";

    if (outputText) outputText.value = translatedText;

    // Save to Firestore (with original + processed + slangMode flag)
    const user = auth.currentUser;
    if (user) {
      await saveOrUpdateTranslation(user.uid, {
        originalInput: original,
        processedInput,
        from: source,
        to: target,
        output: translatedText,
        slangMode: slangEnabled,
      });
      // enforce cap
      await trimHistoryIfNeeded(user.uid);
    } else {
      //Users must be signed in to use app. If somehow not, warn.
      console.warn("No auth user available - translations won't be persisted.");
    }
  } catch (err) {
    console.error("Translation error:", err);
    if (outputText) outputText.value = "❌ Error connecting to translation service.";
  }
}

// Auto translate on input with debounce
let translateTimeout = null;
if (inputText) {
  inputText.addEventListener("input", () => {
    clearTimeout(translateTimeout);
    translateTimeout = setTimeout(performTranslation, AUTO_TRANSLATE_DELAY);
  });
}
if (translateBtn) translateBtn.addEventListener("click", performTranslation);

// -------------------- HISTORY / FAVORITES MANAGEMENT --------------------
/*
  saveOrUpdateTranslation(userId, docData)
  - Checks for a duplicate in the user's history (duplicate = same originalInput + from + to)
  - If found: updates the existing doc (keeps favorite flag if present)
  - If not found: creates a new doc
  Fields saved: originalInput, processedInput, output, from, to, favorite, slangMode, timestamp
*/
async function saveOrUpdateTranslation(userId, docData) {
  try {
    const historyCol = collection(db, "users", userId, "history");

    const dupQuery = query( // Check for existing translation with same originalInput, from, and to
      historyCol,
      where("originalInput", "==", docData.originalInput),
      where("from", "==", docData.from),
      where("to", "==", docData.to)
    );

    const dupSnap = await getDocs(dupQuery); // Execute query

    if (!dupSnap.empty) {
      // Update existing doc rather than creating a new one
      const docSnap = dupSnap.docs[0];
      const existing = docSnap.data();
      const docRef = doc(db, "users", userId, "history", docSnap.id);

      // Preserve favorite flag if it exists in the document
      const favoriteFlag = !!existing.favorite;

      await updateDoc(docRef, {
        originalInput: docData.originalInput,
        processedInput: docData.processedInput,
        output: docData.output,
        from: docData.from,
        to: docData.to,
        slangMode: !!docData.slangMode,
        favorite: favoriteFlag,
        timestamp: serverTimestamp(),
      });
      console.log(`Updated existing history doc (duplicate) id=${docSnap.id}`);
      return;
    }

    // No duplicate -> create a new one
    await addDoc(historyCol, {
      originalInput: docData.originalInput,
      processedInput: docData.processedInput,
      output: docData.output,
      from: docData.from,
      to: docData.to,
      favorite: false,
      slangMode: !!docData.slangMode,
      timestamp: serverTimestamp(),
    });
    console.log("Saved new translation to history.");
  } catch (err) {
    console.error("Error in saveOrUpdateTranslation:", err);
  }
}

/*
  trimHistoryIfNeeded(userId)
  - Ensures user's history does not exceed HISTORY_CAP
  - Deletes oldest non-favorited entries first until total <= HISTORY_CAP
  - Favorites are preserved and will NOT be auto-deleted
*/
async function trimHistoryIfNeeded(userId) { // trims history to cap if needed
  try {
    const historyCol = collection(db, "users", userId, "history");
    // Query all docs to get total count (ordered desc for UI, but we need count)
    const allQuery = query(historyCol, orderBy("timestamp", "desc"));
    const allSnap = await getDocs(allQuery);
    const total = allSnap.size;

    if (total <= HISTORY_CAP) return;

    const toRemove = total - HISTORY_CAP;
    console.log(`Trimming history: need to remove ${toRemove} non-favorited items.`);

    // Get the oldest non-favorited docs up to toRemove
    const deletableQuery = query(
      historyCol,
      where("favorite", "==", false),
      orderBy("timestamp", "asc"),
      limitFn(toRemove)
    );
    const deletableSnap = await getDocs(deletableQuery);

    if (deletableSnap.empty) {
      // No non-favorited docs to remove; allow history to remain > cap (favorites protected)
      console.warn("No non-favorited entries to delete; history may exceed cap due to favorites.");
      return;
    }

    let deleted = 0;
    for (const d of deletableSnap.docs) {
      try {
        await deleteDoc(doc(db, "users", userId, "history", d.id));
        deleted++;
        console.log("Deleted old history doc:", d.id);
      } catch (derr) {
        console.warn("Failed to delete old history doc:", derr);
      }
    }

    console.log(`Trimmed ${deleted} history docs.`);
  } catch (err) {
    console.error("Error trimming history:", err);
  }
}

// Load user’s translations (History + Favorites)
// History for translated Slang: show original (slang) -> translated output
async function loadUserTranslations() {
  const user = auth.currentUser;
  if (!user) return;

  const historyDiv = document.getElementById("history");
  const favoritesDiv = document.getElementById("favorites");
  if (historyDiv) historyDiv.innerHTML = "Loading...";
  if (favoritesDiv) favoritesDiv.innerHTML = "Loading...";

  try { // fetch user's history ordered by timestamp desc
    const q = query(
      collection(db, "users", user.uid, "history"),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);

    let historyHTML = "";
    let favoritesHTML = "";

    snapshot.forEach((docSnap) => { 
      const data = docSnap.data();
      // fallback values
      const originalVal = data.originalInput ?? "";
      const processedVal = data.processedInput ?? "";
      const outputVal = data.output ?? "";
      const fromVal = data.from ?? "";
      const toVal = data.to ?? "";
      const fav = !!data.favorite;
      const slangSaved = !!data.slangMode;

      // If this was a slang-mode save, show [slang] "original" -> "translated output"
      const left = slangSaved ? `[slang] "${escapeHtml(originalVal)}"` : `"${escapeHtml(originalVal)}"`;
      const right = `"${escapeHtml(outputVal)}"`;

      const subtitle = `${escapeHtml(fromVal)} → ${escapeHtml(toVal)}`;

      const card = `
        <div class="p-2 border rounded mb-2 d-flex justify-content-between align-items-center">
          <div>
            <strong>${left}</strong> → ${right}
            <small class="text-muted d-block">${subtitle}</small>
          </div>
          <i class="bi ${fav ? "bi-star-fill text-warning" : "bi-star"}"
             style="cursor:pointer;"
             onclick="toggleFavorite('${docSnap.id}', ${!fav})"></i>
        </div>`;

      historyHTML += card;
      if (fav) favoritesHTML += card;
    });

    if (historyDiv) historyDiv.innerHTML = historyHTML || "<p>No history yet.</p>";
    if (favoritesDiv) favoritesDiv.innerHTML = favoritesHTML || "<p>No favorites yet.</p>";
  } catch (err) {
    console.error("Failed to load user translations:", err);
    if (historyDiv) historyDiv.innerHTML = "<p>Failed to load history.</p>";
    if (favoritesDiv) favoritesDiv.innerHTML = "<p>Failed to load favorites.</p>";
  }
}

// Prevent HTML injection in displayed cards
function escapeHtml(str) {// escapeHtml() takes dangerous characters and makes them safe so text cannot break your HTML or run code.
  if (!str) return "";
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Build sorted dictionary HTML list
function generateSlangDictionaryHTML() {
  const entries = Object.entries(slangDictionary) // slangDictionary list
    .sort(([a], [b]) => a.localeCompare(b)); // alphabetize

  return entries
    .map(([slang, meaning]) =>
      `<p><strong>${escapeHtml(slang)}</strong> — ${escapeHtml(meaning)}</p>`
    )
    .join("");
}
// Slang Dictionary button
const slangDictBtn = document.getElementById("slangDictBtn");
if (slangDictBtn) {
  slangDictBtn.addEventListener("click", () => {
    const modalEl = document.getElementById("slangDictModal");
    const contentEl = document.getElementById("slangDictContent");

    if (contentEl) {
      contentEl.innerHTML = generateSlangDictionaryHTML();
    }

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  });
}

// Toggle favorite - updates Firestore and refreshes lists
window.toggleFavorite = async (id, makeFavorite) => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in to favorite items.");
    return;
  }
  try {
    await updateDoc(doc(db, "users", user.uid, "history", id), {
      favorite: makeFavorite,
    });
    await loadUserTranslations();
  } catch (err) {
    console.error("Failed to update favorite:", err);
  }
};

// Open favorites/history modal and load data
if (favoritesBtn) {
  favoritesBtn.addEventListener("click", () => {
    const modalEl = document.getElementById("favoritesModal");
    if (!modalEl) return;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    loadUserTranslations();
  });
}

// -------------------- SPEECH RECOGNITION --------------------
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  if (micBtn) {
    micBtn.disabled = true;
    micBtn.textContent = "Not supported";
  }
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  // map dropdown codes to browser locales
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

  if (micBtn) {
    micBtn.addEventListener("click", () => {
      try {
        recognition.lang = langMap[fromLang.value] || "en-US";
        recognition.start();
        micBtn.textContent = "Listening...";
        micBtn.classList.add("btn-danger");
      } catch (e) {
        console.error("Mic start error:", e);
      }
    });
  }

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript;
    if (inputText) {
      inputText.value = transcript;
      // auto-translate immediately after speech recognized
      performTranslation();
    }
    console.log("Speech recognized:", transcript);
  });

  recognition.addEventListener("end", () => {// reset mic button
    if (micBtn) {
      micBtn.textContent = "🎤 Speak";
      micBtn.classList.remove("btn-danger");
    }
  });

  recognition.addEventListener("error", (event) => {// handle errors
    console.error("Speech recognition error:", event.error);
    if (micBtn) {
      micBtn.textContent = "🎤 Speak";
      micBtn.classList.remove("btn-danger");
    }
  });
}

// -------------------- SETTINGS COGWHEEL & TOGGLES --------------------
if (settingsBtn) {
  settingsBtn.addEventListener("click", () => {
    const modalEl = document.getElementById("settingsModal");
    if (!modalEl) return;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  });
}

// dark mode toggle
if (darkModeToggle) {
  darkModeToggle.addEventListener("change", () => {
    const enabled = darkModeToggle.checked;
    document.body.classList.toggle("dark-mode", enabled);
    localStorage.setItem("darkMode", enabled);
  });
}

if (slangToggle) { 
  slangToggle.addEventListener("change", () => {
    const enabled = slangToggle.checked;
    localStorage.setItem("slangMode", enabled);

    if (enabled) {
      // Force BOTH languages to English
      fromLang.value = "en";
      toLang.value = "en";

      // Disable To dropdown
      turnDropDownOff();
    } else {
      // Re-enable To dropdown
      turnDropDownOn();
    }
  });
}

//Automatically pre-load user history into the modal 
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Auth ready:", user.email);
    // Preload user translations into memory/UI so they don't disappear
    loadUserTranslations();
  } else {
    console.log("No user signed in");
  }
});
