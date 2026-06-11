import type { Profile } from "./haqdaar-types";

const KEY = "haqdaar:profile";

export function loadProfile(): Partial<Profile> {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProfile(p: Partial<Profile>) {
  try { sessionStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}

export function clearProfile() {
  try { sessionStorage.removeItem(KEY); } catch {}
}

export function isProfileComplete(p: Partial<Profile>): p is Profile {
  return !!p.state && typeof p.age === "number" && !!p.workType
    && typeof p.daysWorked === "number" && !!p.registered && !!p.gender
    && typeof p.married === "boolean" && typeof p.kidsInSchool === "boolean";
}
