// parseInput.js
// Offline keyword parser for messy natural-language intake.
// This is the FALLBACK that makes the app work even with no LLM / no API key.
// The LLM layer (claudeClient.js) is the upgrade, not the dependency.
//
// Maps free text like "I do tiling, started after Diwali, 2 kids in school"
// to partial profile fields. Returns only what it can confidently detect.

const WORK_KEYWORDS = {
  mason: ["mason", "rajmistri", "राजमिस्त्री", "गवंडी", "mistri", "brick", "ईंट", "वीट"],
  tiling: ["tile", "tiling", "tiles", "टाइल", "फरशी"],
  painting: ["paint", "painter", "painting", "रंग", "पेंट"],
  carpentry: ["carpenter", "wood", "लकड़ी", "सुतार", "बढ़ई"],
  helper: ["helper", "labour", "labor", "mazdoor", "मजदूर", "मजूर", "coolie", "beldar"],
  electrician: ["electric", "wiring", "wireman", "बिजली", "वायरमन"],
  plumbing: ["plumb", "plumber", "pipe", "नल", "प्लंबर", "प्लंबिंग"],
};

const NEG = ["no", "not", "nahi", "नहीं", "नाही", "नको"];
const POS = ["yes", "haan", "ha", "हाँ", "होय", "registered", "पंजीकृत", "नोंदणी"];

export function parseInput(text) {
  if (!text) return {};
  const s = text.toLowerCase();
  const out = {};

  // Work type
  for (const [type, words] of Object.entries(WORK_KEYWORDS)) {
    if (words.some((w) => s.includes(w))) {
      out.workType = type;
      break;
    }
  }

  // Age — first 2-digit number that looks like an age (18-70)
  const ageMatch = s.match(/\b(1[89]|[2-6]\d|70)\b/);
  if (ageMatch) out.age = parseInt(ageMatch[1], 10);

  // Days worked — explicit number near "day", else infer from "months"
  const daysMatch = s.match(/(\d{1,3})\s*(day|din|दिन|दिवस)/);
  if (daysMatch) {
    out.daysWorked = parseInt(daysMatch[1], 10);
  } else {
    const monthsMatch = s.match(/(\d{1,2})\s*(month|mahine|mahina|महीने|महिने)/);
    if (monthsMatch) out.daysWorked = parseInt(monthsMatch[1], 10) * 26; // ~26 working days/mo
  }

  // Kids in school
  if (/(kid|child|children|bachch|बच्च|मुल|मूल|school|स्कूल|शाळा)/.test(s)) {
    out.kidsInSchool = !NEG.some((n) => s.includes(n));
  }

  // Married
  if (/(marri|shaadi|शादी|लग्न|विवाह|wife|husband|पत्नी|पति)/.test(s)) {
    out.married = !NEG.some((n) => s.includes(n));
  }

  // Registration status
  if (/(regist|panjik|पंजीकृत|नोंदणी)/.test(s)) {
    if (NEG.some((n) => s.includes(n))) out.registered = "no";
    else if (POS.some((p) => s.includes(p))) out.registered = "yes";
  }

  return out;
}
