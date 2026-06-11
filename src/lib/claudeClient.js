// claudeClient.js
// The LLM "language layer" — used ONLY for two jobs:
//   1) understanding messy free-text intake
//   2) rewriting claim steps in simple, kind vernacular
// Money/eligibility logic NEVER goes through here — that's rulesEngine.js.
//
// Two ways to wire this up. Pick one in your Lovable project:
//
//   A) Via your FastAPI backend (recommended — keeps the API key off the client):
//      set MODE = "backend" and expose POST /parse and POST /explain.
//
//   B) Direct to Anthropic from the client (fastest for a hackathon demo):
//      set MODE = "anthropic" and add VITE_ANTHROPIC_API_KEY to your env.
//
// If neither is configured or a call fails, everything degrades gracefully:
//   parseWorkerInput -> falls back to the offline keyword parser
//   explainClaim     -> falls back to the plain English steps from the JSON

import { parseInput } from "./parseInput.js";

const MODE = import.meta.env.VITE_LLM_MODE || "fallback"; // "backend" | "anthropic" | "fallback"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";
const MODEL = "claude-sonnet-4-20250514";

async function callAnthropic(system, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json();
  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

async function callBackend(path, payload) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Backend ${path} ${res.status}`);
  return res.json();
}

/**
 * Turn messy free text into partial profile fields.
 * Always returns an object; never throws.
 */
export async function parseWorkerInput(text, currentField) {
  const fallback = parseInput(text);

  try {
    if (MODE === "backend" && BACKEND_URL) {
      const data = await callBackend("/parse", { text, field: currentField });
      return { ...fallback, ...(data || {}) };
    }
    if (MODE === "anthropic" && ANTHROPIC_KEY) {
      const system =
        "You extract structured fields from a construction worker's casual message. " +
        "Reply with ONLY a JSON object, no preamble, no markdown. " +
        "Possible keys: state ('maharashtra'|'delhi'), age (number), " +
        "workType ('mason'|'tiling'|'painting'|'carpentry'|'helper'|'electrician'|'plumbing'|'other'), " +
        "daysWorked (number), registered ('yes'|'no'|'dontknow'), gender ('male'|'female'), " +
        "married (boolean), kidsInSchool (boolean). Include only keys you are confident about.";
      const raw = await callAnthropic(system, text);
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      return { ...fallback, ...parsed };
    }
  } catch (e) {
    console.warn("parseWorkerInput LLM failed, using keyword fallback:", e);
  }
  return fallback;
}

/**
 * Rewrite a benefit's claim steps in simple vernacular for this worker.
 * Falls back to the plain English steps already in the JSON.
 */
export async function explainClaim(benefit, profile, lang) {
  const fallbackSteps = benefit.howToClaim || [];

  try {
    if (MODE === "backend" && BACKEND_URL) {
      const data = await callBackend("/explain", { benefit, profile, lang });
      return data.steps || fallbackSteps;
    }
    if (MODE === "anthropic" && ANTHROPIC_KEY) {
      const langName = { hi: "Hindi", mr: "Marathi", en: "simple English" }[lang] || "Hindi";
      const system =
        `You help a low-literacy construction worker claim a welfare benefit. ` +
        `Rewrite the claim steps in very simple, warm ${langName}. ` +
        `Short sentences. No jargon. Reply with ONLY a JSON array of strings, no markdown.`;
      const user = JSON.stringify({
        benefit: benefit.name,
        amount: benefit.amount?.display,
        officialSteps: benefit.howToClaim,
        documents: benefit.documents,
      });
      const raw = await callAnthropic(system, user);
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("explainClaim LLM failed, using JSON steps:", e);
  }
  return fallbackSteps;
}
