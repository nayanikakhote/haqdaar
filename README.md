# HaqDaar — हक़दार

> **Claim What's Yours.** An AI-assisted welfare benefits navigator for India's construction workers.

🔗 **Live Demo:** https://haqdaar.vercel.app/ · 🌐 हिंदी · मराठी · English · 🏗️ *AI for Social Impact*
---

## 📌 Project Overview

HaqDaar helps India's ~50 million construction workers discover and claim the welfare benefits they are legally owed. A worker answers a few guided questions (or describes their situation in their own language), a deterministic rules engine matches every benefit they personally qualify for — state by state — and HaqDaar returns a plain-language walkthrough of what to claim, which documents to carry, and where to go.

No login. No forms. Mobile-first. Done in about two minutes.

The guiding principle: **AI where it helps, rules where accuracy is non-negotiable.** An LLM is used only to understand messy free-text and simplify guidance — never to decide eligibility. All money and eligibility logic runs through an auditable rules engine.

## 🧩 Problem Statement

The Building & Other Construction Workers (BOCW) Act, 1996 guarantees education, medical, pension, maternity, accident and housing benefits to registered construction workers. Yet:

- **₹37,000 crore+** sits in state BOCW boards, largely unspent.
- **50M+** construction workers form India's largest informal workforce.
- Eligibility is simple — 90+ days worked, age 18–60, registration fee ≤ ₹50 — but most workers never register, and those who do rarely know what they can claim.

> The money is already funded. The gap is between the law and the laborer.

Generic government portals are English-only and show every scheme with zero personalization or claim guidance. HaqDaar is built for the low-literacy, informal worker — vernacular-first, personalized, and step-by-step.

## ✨ Features

- **Multilingual intake** — works in Hindi, Marathi and English.
- **Guided + free-text input** — answer simple questions, or type your situation in your own words.
- **Personalized results** — shows *only* the benefits you qualify for, not a generic list.
- **Deterministic rules engine** — correct, auditable eligibility logic with state-specific thresholds (no ML guessing on money).
- **Plain-language walkthrough** — what to claim, documents needed, and where to go.
- **State-specific data** — accurate benefit amounts per state (Delhi + Maharashtra today).
- **No login, no forms, mobile-first** — built for a shared phone at a worksite.
- **Graceful AI fallback** — optional LLM language layer; if unavailable, an offline parser keeps the app fully functional.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TanStack Start (Vite, Nitro), Tailwind CSS v4, shadcn/ui |
| Backend | FastAPI (Python) — hosts the language layer *(optional)* |
| AI | Claude / GPT API — language layer only |
| Data | Curated benefits JSON, one file per state |
| Deployment | Vercel (frontend) · Render (backend) |

## 👥 Team Details

**Team:** dr engineers

| Name | Institution | Role |
|------|-------------|------|
| Nayanika Khote | K.J. Somaiya School of Engineering | Developer / Designer |


## 🔗 Demo Link

**Live app:** https://haqdaar.vercel.app/

---

*Benefit amounts are sourced from official state BOCW board websites and may change — always verify on the official board site before applying. HaqDaar is an informational navigator, not an official government service.*

> HaqDaar doesn't need a new law. It just needs to exist.
