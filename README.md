# HaqDaar — हक़दार

**Claim What's Yours.**

An AI-assisted welfare benefits navigator for India's ~50 million construction workers. A worker describes their situation in their own language, a deterministic rules engine matches every benefit they personally qualify for — state by state — and HaqDaar returns a plain-language walkthrough of what to claim, which documents to carry, and where to go.

🔗 **Live demo:** https://haqdaar.vercel.app/
🌐 **Languages:** हिंदी · मराठी · English
🏗️ **Built for:** OSC Build Hackathon — *AI for Social Impact*

---

## The problem

The Building & Other Construction Workers (BOCW) Act, 1996 already guarantees education, medical, pension, maternity, accident and housing benefits to construction workers. Roughly **₹37,000 crore** sits in state BOCW boards — largely unspent. Eligibility is simple (90+ days worked, age 18–60, registration fee ≤ ₹50), yet most workers never register, and those who do rarely know what they can actually claim.

> The money is already funded. The gap is between the law and the laborer.

HaqDaar closes that gap in about two minutes — no login, no forms, mobile-first.

## How it works

```
User input  →  Language layer  →  Rules engine  →  Benefits DB  →  Output layer  →  Benefits card
(guided Q's    (LLM parses        (deterministic,   (per-state      (plain-language   (what you qualify
 + free text)   messy vernacular)  state-specific)    JSON)           walkthrough)      for + how to claim)
```

The worker answers a few guided questions (state, age, days worked, registration status, family details) or types their situation in free text. A rules engine evaluates eligibility against state-specific thresholds and returns only the benefits that person qualifies for, with amounts and claim steps.


**Coverage today:** Delhi + Maharashtra (2 states). Adding a state = adding one JSON file.

## Data & disclaimer

Benefit amounts are sourced from official state BOCW board websites. They can change — always verify on the official board site before applying. HaqDaar is an informational navigator, not an official government service.

## Built by

**Nayanika Khote** — K.J. Somaiya School of Engineering

> HaqDaar doesn't need a new law. It just needs to exist.
