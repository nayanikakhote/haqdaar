// rulesEngine.js
// Deterministic eligibility + benefit-matching for HaqDaar.
// NO machine learning. Every decision here is auditable: given the same
// worker profile, it always returns the same result. That is the point —
// welfare eligibility is law, not a prediction.

import maharashtra from "../data/maharashtra.json";
import delhi from "../data/delhi.json";

const STATES = { maharashtra, delhi };

/**
 * Worker profile shape:
 * {
 *   state: "maharashtra" | "delhi",
 *   age: number,
 *   workType: string,            // e.g. "mason"
 *   daysWorked: number,          // days worked in construction last 12 months
 *   registered: "yes" | "no" | "dontknow",
 *   gender: "male" | "female",
 *   married: boolean,
 *   kidsInSchool: boolean
 * }
 */

export function getStateData(state) {
  return STATES[state] || null;
}

/**
 * Base eligibility: can this worker register / claim anything at all?
 * Returns a verdict object the UI can render directly.
 */
export function checkBaseEligibility(profile) {
  const data = getStateData(profile.state);
  if (!data) {
    return { status: "error", reason: "unknown_state" };
  }

  const { minAge, maxAge, minDaysWorked } = data.registration;
  const ageOk = profile.age >= minAge && profile.age <= maxAge;
  const daysOk = profile.daysWorked >= minDaysWorked;

  if (profile.registered === "yes") {
    return { status: "registered", code: "already_registered" };
  }
  if (ageOk && daysOk) {
    return { status: "eligible", code: "can_register" };
  }
  if (!daysOk) {
    return {
      status: "not_yet",
      code: "needs_90_days",
      gap: minDaysWorked - profile.daysWorked,
    };
  }
  if (!ageOk) {
    return { status: "not_eligible", code: "age_out_of_range", minAge, maxAge };
  }
  return { status: "not_eligible", code: "unknown" };
}

/** Per-benefit eligibility check. Pure function, no side effects. */
function isBenefitEligible(benefit, profile) {
  const e = benefit.eligibility || {};

  // Age window
  if (e.minAge != null && profile.age < e.minAge) return false;
  if (e.maxAge != null && profile.age > e.maxAge) return false;

  // Days worked (defaults to the registration threshold if set)
  if (e.minDaysWorked != null && profile.daysWorked < e.minDaysWorked) return false;

  // Family-gated benefits
  if (e.requiresKids && !profile.kidsInSchool) return false;
  if (e.requiresMarried && !profile.married) return false;

  // Gender-gated benefits
  if (e.gender && e.gender !== "any" && profile.gender !== e.gender) return false;

  // Custom composite rules
  if (e.custom === "maternity") {
    // registered women OR wives of registered male members
    const eligible =
      profile.gender === "female" || (profile.gender === "male" && profile.married);
    if (!eligible) return false;
  }

  return true;
}

/**
 * Main entry point. Returns:
 * {
 *   verdict,                 // from checkBaseEligibility
 *   registrationStep | null, // the "register first" card, if not registered
 *   eligibleNow: [...],      // claimable right now (registered users)
 *   afterRegistration: [...] // unlocked once they register
 * }
 * Lists are sorted by benefit value, highest first.
 */
export function matchBenefits(profile) {
  const data = getStateData(profile.state);
  if (!data) return { verdict: { status: "error" }, eligibleNow: [], afterRegistration: [] };

  const verdict = checkBaseEligibility(profile);
  const isRegistered = profile.registered === "yes";

  const registrationStep =
    data.benefits.find((b) => b.isRegistrationStep) || null;

  const matched = data.benefits
    .filter((b) => !b.isRegistrationStep)
    .filter((b) => isBenefitEligible(b, profile))
    .sort((a, b) => (b.amount?.value || 0) - (a.amount?.value || 0));

  if (isRegistered) {
    return {
      verdict,
      registrationStep: null,
      eligibleNow: matched,
      afterRegistration: [],
    };
  }

  // Not registered (or unsure): everything that needs registration is shown
  // as "after registration"; anything that doesn't is claimable now.
  const eligibleNow = matched.filter((b) => !b.eligibility?.requiresRegistration);
  const afterRegistration = matched.filter((b) => b.eligibility?.requiresRegistration);

  return {
    verdict,
    registrationStep,
    eligibleNow,
    afterRegistration,
  };
}

/** Convenience: pull localized text from a {en,hi,mr} object with fallback. */
export function t(obj, lang) {
  if (obj == null) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] || obj.en || Object.values(obj)[0] || "";
}
