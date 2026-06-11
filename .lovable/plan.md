## HaqDaar — Welfare Benefits Navigator

A 2-minute intake that tells a construction worker exactly which BOCW benefits they can claim, in their language, with no login. The data layer you uploaded (rulesEngine, translations, state JSONs) is the single source of truth — UI only renders what it returns.

## Drop in the data layer (verbatim, no edits)

Copy your uploaded files into the project unchanged:

```
src/data/maharashtra.json
src/data/delhi.json
src/data/translations.js
src/lib/rulesEngine.js
src/lib/parseInput.js
src/lib/claudeClient.js
```

Add a tiny `src/lib/lang.tsx` with a React `LangProvider` + `useLang()` hook (context + localStorage) so any component can call `ui(lang, key)` / `t(obj, lang)` without prop-drilling. Default `VITE_LLM_MODE=fallback` — no API key shipped.

## Screens (each is its own route)

```
src/routes/
  __root.tsx          neobrutalist shell, <Outlet/>, LangProvider, sticky lang switcher
  index.tsx           Language picker (hi / mr / en) → CTA "Start"
  intake.tsx          8-step intake wizard, writes profile to sessionStorage
  verdict.tsx         renders matchBenefits(profile).verdict + registrationStep
  benefits.tsx        eligibleNow + afterRegistration lists (cards)
  benefits.$id.tsx    one benefit: description, amount, documents checklist, claim steps
```

Navigation is via `<Link to=...>` with typed `params` — no hash anchors.

### 1. Language picker (`/`)
Three big stamped buttons: हिंदी / मराठी / English. Picking one stores lang and navigates to `/intake`. Tagline + "AI for Social Impact" badge from translations.

### 2. Intake wizard (`/intake`)
One question per step, progress chip "प्रश्न 3 / 8". Questions and option labels come from `ui(lang, ...)`. Profile keys exactly as the add-on prompt requires:

| Step | Field | Input |
|---|---|---|
| 1 | `state` | Maharashtra / Delhi cards |
| 2 | `age` | number stepper |
| 3 | `workType` | 8 work-type chips (mason/tiling/painting/carpentry/helper/electrician/plumbing/other) + free-text box that calls `parseWorkerInput(text, "work")` and merges result |
| 4 | `daysWorked` | "90 days or more" → 120, "less than 90" → 45 |
| 5 | `registered` | yes / no / dontknow |
| 6 | `gender` | male / female |
| 7 | `married` | yes / no |
| 8 | `kidsInSchool` | yes / no → submit → `/verdict` |

Back/Next buttons. Profile persisted in `sessionStorage` so refresh keeps state.

### 3. Verdict (`/verdict`)
Calls `matchBenefits(profile)`. Renders the verdict banner (color-coded by status: registered=green, eligible=green, not_yet=amber, not_eligible=red, error=red) using the `verdict_*` keys. If `registrationStep` exists, show it as the prominent "Step 1" card with a "Register first" CTA linking to its `officeLink`. Primary CTA: "See my benefits" → `/benefits`.

### 4. Benefits list (`/benefits`)
Two stacked sections with the `eligibleNow` and `afterRegistration` headers from translations. Each card: benefit name, amount badge, one-line description, "How to claim →" link to `/benefits/$id`. `afterRegistration` cards are visually locked (dashed border, lock icon) with the "Unlocked after you register" caption.

### 5. Benefit detail (`/benefits/$id`)
- Title, amount, full description (all via `t(obj, lang)`)
- **Documents needed** — checkbox checklist from `benefit.documents` (state persisted per-benefit in localStorage so worker can come back)
- **Steps** — calls `explainClaim(benefit, profile, lang)` from claudeClient (LLM rewrites in plain language; falls back to JSON steps when no key). Show a small skeleton while loading.
- **Where to apply** — button → `benefit.officeLink`
- "Share on WhatsApp" button (opens `https://wa.me/?text=...` with title + amount + link)

## Neobrutalist design system

Set in `src/styles.css` via the existing `:root` tokens (no hardcoded hex in components):

- Background `#fcfbf8` (warm off-white), foreground near-black `#111`
- Primary `#ffd400` (saffron-yellow), secondary `#1f6feb` (board-blue), accent `#ff4d4d`, success `#16a34a`
- Borders: 3px solid black, `--radius: 0` (sharp corners)
- Shadow token: `--shadow-brutal: 6px 6px 0 0 #111` applied to cards/buttons; on `:hover` translate +2/+2 and shrink shadow to 2 2 0
- Typography: **Space Grotesk** (headings, 700/800) + **Inter** (body) via Google Fonts in `__root.tsx` head links. Numerals tabular. Devanagari falls back to **Noto Sans Devanagari**.
- Buttons: chunky, uppercase tracking-wide, no rounding, hard shadow. Reuse the existing shadcn `button.tsx` with a new `brutal` variant rather than restyling every call site.
- Cards: white fill, 3px black border, hard shadow, generous padding
- Sticky top-right language switcher (3 pill buttons) in `__root.tsx`

Mobile-first — every screen designed for a 360px Android phone first, scales up.

## SEO / metadata

Each route sets its own `head()` with route-specific title + meta description + og tags. Root sets only the shared title template + viewport. No `og:image` at root (would override leaves).

## Technical details

- **State**: profile lives in `sessionStorage` keyed `haqdaar:profile`. Language lives in `localStorage` keyed `haqdaar:lang`. Document checklists in `localStorage` keyed `haqdaar:docs:<benefitId>`. No backend, no auth.
- **Data layer is untouched.** `rulesEngine.js`, `parseInput.js`, `claudeClient.js`, `translations.js`, `maharashtra.json`, `delhi.json` are copied verbatim and imported. The add-on prompt's constraint ("never re-implement eligibility in components") is enforced — components only call `matchBenefits`, `checkBaseEligibility`, `parseWorkerInput`, `explainClaim`.
- **LLM mode** defaults to `fallback`. `claudeClient.js` is already graceful — no API call happens without `VITE_LLM_MODE` being switched on. You can flip it to `anthropic` later via env without code changes.
- **Type-friendly JS interop**: the lib files are `.js`; we import them as-is. Add lightweight TS shims (`src/lib/rulesEngine.d.ts`, etc.) so the strict TS build doesn't choke on the untyped imports.
- **Routing**: TanStack Start file routes with `<Link to="/benefits/$id" params={{id}}>`, never `<a href>`. Every route with a loader gets `errorComponent` + `notFoundComponent`; `__root.tsx` already has its own. No server functions needed — this is a fully client-side flow.
- **Accessibility**: all buttons keyboard-focusable, focus ring uses the brutal shadow color, contrast meets AA on the yellow primary by pairing with black text only.

## Out of scope (call out so you can ask later)

- Voice input button ("बोलकर बताएं" in translations) — wired as a placeholder that toasts "Coming soon"; real Web Speech API hookup can be a follow-up
- Saving the checklist as a PDF — "Save checklist" button uses `window.print()` with print styles for v1
- More states beyond Maharashtra / Delhi — drop a new JSON in `src/data/` and add it to the `STATES` map in rulesEngine and the state picker
