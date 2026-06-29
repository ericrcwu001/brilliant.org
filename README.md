# Ergo

**Quantitative intuition, learned by doing.** Ergo is a Brilliant.org-style interactive web app that teaches probability, combinatorics, and quantitative reasoning through direct manipulation — not videos or walls of text. It spans a catalog of ten concepts across four domains, and each concept ends with an optional, AI-powered spoken mock interview.

The flagship topic is *pattern hitting times*: why does flipping for HH take longer (E[HH] = 6) than flipping for HT (E[HT] = 4)? The answer unfolds through interactive state graphs, Monte-Carlo simulations, and a short proof built beat by beat.

> **Live demo:** https://brilliant-org.web.app

---

## Who It's For

### Primary persona: curious learner

The primary user is **anyone curious about probability who likes to learn by doing** — no prior probability, statistics, or algebra is assumed. They are not trying to memorize formulas or isolated tricks; they want to build genuine intuition through direct manipulation, one concept at a time. A two-track diagnostic at course start places each learner appropriately: **Track A** scaffolds from a near-zero foundation; **Track B** runs leaner for learners who already feel confident.

After completing the course, a learner should be able to:

- Convert a pattern-matching probability problem into states and transitions.
- Write recursive expected-time equations from a state machine — without looking anything up.
- Explain why `HH` and `HT` have different expected waiting times even though both are length-2 coin patterns.
- Understand why overlapping patterns change expected hitting time.
- See simulation and theory validate each other and know what it means when they do.
- Apply the method to a novel length-3 pair (`THH` vs `HTH`) — identify the overlap-breaking transition, assemble the recurrence, and predict which waits longer — with at most two hints and no answer reveal on the setup beats.

### Secondary persona: quant-interview candidate

The course also fully serves a **university underclassman preparing for quant interviews**. They know the standard resources — the Green Book and similar problem lists — but want something more interactive and hands-on than static exercises. They want deeper understanding of the *patterns of thinking* that let them solve unfamiliar probability questions under interview pressure — and that prep is a first-class, fully-served track (**Track B**), not the only way in. Each concept caps off with an optional, voice-based AI mock interview that pushes them on the same dimensions a real quant screen does.

---

## User Stories

### Persona and Onboarding

- As a quant-interview candidate, I want to sign in and save my progress so that I can practice across study sessions and devices.
- As a first-time learner, I want to see that the course is about state thinking for probability interviews so that I understand why this app is relevant to my goals.
- As a returning learner, I want to resume exactly where I left off so that I do not lose momentum during a hard lesson.

### Course Path

- As a quant-interview candidate, I want a clear path through pattern hitting time lessons so that I know what to study next.
- As a learner who completed a lesson, I want the next lesson to unlock so that the course feels like structured progression.
- As a learner preparing under time pressure, I want future advanced lessons to be visible so that I can see where the course is going.

### Flagship Lesson

- As a quant-interview candidate, I want to choose target patterns like `HH` and `HT` so that I can compare cases that look similar but behave differently.
- As a learner, I want to simulate coin flips and watch the state machine update so that I can connect random outcomes to state transitions.
- As a learner, I want to build recurrence equations with draggable tiles so that I practice setting up the problem instead of passively reading the answer.
- As a learner, I want immediate feedback on correct and incorrect answers so that every check teaches me something.
- As a learner, I want hints that escalate from nudges to reveals so that I can recover without being handed a black-box explanation.
- As a learner, I want to predict the expected waiting time before seeing the solution so that I commit to my intuition and can measure it against the math.
- As a learner, I want to direct substitution steps through taps or drags so that I understand the algebra without doing tedious free-form equation entry.
- As a learner, I want to compare simulation against theory so that I trust the recurrence result.
- As a learner, I want to adjust coin bias in a sandbox so that I can explore how the expected time changes beyond the fair-coin case.

### Persistence and Habit

- As a learner, I want my tile placements and predictions to be saved so that leaving mid-lesson does not erase my work.
- As a learner, I want a streak to persist across sessions so that I have a reason to keep practicing daily.
- As a learner, I want milestones for important moments so that finishing hard probability lessons feels rewarding.

### For Developers / Content and Trust

- As a developer, I want lesson content seeded from version-controlled fixtures so that Firestore content can be recreated reliably.
- As a developer, I want lesson content hosted in Firestore at runtime so that the app is structured for future dynamic content.
- As a developer, I want completion, streak, milestone, and unlock writes handled by Cloud Functions and denied to the client by security rules so that achievements cannot be forged from the browser.

---

## What It Is

Each lesson is a short sequence of interactive **beats**: concept → problem → instant feedback. Problems use direct manipulation — drag-and-drop equation tiles, tap-to-build state graphs, sliders, a balance-scale solver — and give hand-authored, mistake-specific feedback computed entirely client-side. Lesson feedback uses **no AI and no server round-trips** — it is intentionally authored and instant.

The one AI surface is the **optional capstone interview** at the end of each concept (see below), deliberately walled off from the authored lesson core.

---

## Concept Catalog

Ergo is organized as a **catalog of concepts** grouped into four domains. A signed-in learner lands on a domain-shelved home (`ConceptCatalogPage`) and drills into a per-concept lesson path (`/concept/:conceptId`). All ten concepts below are **live** — **66 lessons total** — and each ships its own engine-verified interview pack.

| Domain | Concept | Lessons | What it covers |
|--------|---------|:-------:|----------------|
| Probability | **Pattern Hitting Times** *(flagship)* | 7 | Why `E[HH] = 6` but `E[HT] = 4`; Penney's game; gambler's ruin; the overlap shortcut |
| Probability | Expected Value | 6 | Linearity, indicators, conditional expectation, coupon collector, order statistics |
| Probability | Bayes' Rule | 8 | The update rule, the base-rate trap, Monty Hall, the prosecutor's fallacy |
| Probability | Covariance & Correlation | 6 | Variance and standard deviation, the covariance formula, variance of a sum, the unit-free correlation ρ and its [−1, 1] bound, the correlation triangle |
| Probability | Markov Chains | 10 | Transition matrices, absorption, stationary distributions, PageRank |
| Combinatorics & Games | Optimal Stopping | 5 | The secretary problem and the 37% rule |
| Combinatorics & Games | Game Theory | 6 | Dominance, Nash, mixed strategies, minimax, backward induction, Nim |
| Combinatorics & Games | Combinatorics | 6 | Counting principle, permutations/combinations, the binomial theorem, inclusion–exclusion |
| Algorithms & Information | Binary & Information | 6 | Numbers as sums of powers of two; bits as information; group testing (poisoned wine), base-3 weighing, bit tricks, and the ⌈log₂N⌉ search bound |
| Quantitative Finance | Options, Payoffs & No-Arbitrage | 6 | Payoff diagrams, put-call parity and no-arbitrage bounds, replication, the binomial tree and risk-neutral measure, delta hedging |

**Roadmap (not yet built):** Weighted Coins & Dice (a roadmap lesson within Pattern Hitting Times).

### Flagship: Pattern Hitting Times

Seven lessons across three chapters.

| # | Title | Summary | Chapter |
|---|-------|---------|---------|
| L0 *(opt.)* | Watch the First Heads | Warm-up: flip until first heads, discover E[H] = 2 | Ch 1 · Foundations |
| L1 | Pattern Hitting Times | **Flagship:** prove E[HH] = 6 vs E[HT] = 4 via state recurrences | Ch 1 · Foundations |
| L2 | Penney's Game | Two patterns race; going second can win 7:1 | Ch 2 · Racing & Walks |
| L3 | Gambler's Ruin | Random walk between walls: P(ruin) = i/N, E[duration] = i(N−i) | Ch 2 · Racing & Walks |
| L4 | Mixed Review & Streaks | Interleaved checkpoint — waiting, racing, and walking unlabeled | Ch 3 · Mastery |
| L5 | Longer Patterns & Overlap | Transfer to THH vs HTH (E[THH] = 8, E[HTH] = 10); faded hints | Ch 3 · Mastery |
| L6 | The Overlap Shortcut | Capstone: E[wait] = Σ 2^(overlap length), proved by a martingale | Ch 3 · Mastery |

---

## AI Capstone Interview

After finishing a concept's lessons, a learner can take an **optional, voice-based AI mock interview** — a spoken quant-style interview that runs in the browser over WebRTC against the OpenAI Realtime API. It is optional and **never gates** the concept-mastered medallion or any lesson unlocks.

How it stays safe and grounded:

- **Server-minted ephemeral tokens.** A Cloud Function (`mintInterviewToken`) mints a short-lived OpenAI Realtime token; the standing `OPENAI_API_KEY` **never leaves the server**. The browser connects directly to OpenAI with the throwaway `ek_…` value only.
- **Grounded in engine-verified packs.** Each concept ships an *interview pack* (`interviews/course-*.json`) — a verified question bank plus hidden answers, rubric, and interviewer prompt. The interviewer asks only from the verified bank and qualitative follow-ups; it never invents numeric problems. Every numeric answer in a pack is reproduced by the probability engine before it ships.
- **Leak-safe live session.** The Realtime API echoes the session instructions back to the browser, so hidden answers and rubric are stripped from anything the live session can see. Exact answers live server-side only and are consumed only by the grader.
- **Separate grading pass.** Grading is a distinct server-side LLM pass (`gradeInterview`) over the transcript that writes a structured report — per-dimension scores plus a hire signal. **Audio is never stored.**
- **Caps.** An 8-minute hard session cap and a 30-minute daily per-user quota, both enforced server-side.

Try the UI without OpenAI or Firebase at `/dev/interview` (fixture-backed harness). Design details live in [`docs/adr/0008-ai-capstone-interview-realtime-grounded.md`](docs/adr/0008-ai-capstone-interview-realtime-grounded.md) and [`docs/capstone-interview/`](docs/capstone-interview/).

---

## Tech Stack

| Layer | Key packages |
|-------|-------------|
| Frontend | React 19, TypeScript 6, Vite 8 (with the React Compiler) |
| Backend / DB | Firebase 12 — Auth, Firestore, Cloud Functions, App Check, Analytics |
| AI capstone interview | OpenAI Realtime API over WebRTC (speech-to-speech) + Responses API grader |
| Canvas visuals | Konva 10 + react-konva; raw WebGL for the audio-reactive interview orb |
| Content schema | Zod 4 |
| Animation | Motion 12, GSAP 3 |
| Accessible primitives | Radix UI, react-aria |
| Math typesetting | KaTeX |
| Design tokens | Style Dictionary |
| Testing | Vitest, Playwright |

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│  Content model  (src/content/, fixtures/, interviews/) │
│  Zod schemas → JSON fixtures → loader / Firestore sync │
├────────────────────────────────────────────────────────┤
│  Probability engine  (src/engine/)                     │
│  KMP automaton + Gauss-Jordan over exact rationals     │
│  → expected hitting times, Monte-Carlo, Markov chains  │
├────────────────────────────────────────────────────────┤
│  Frontend renderer  (src/lesson/, src/pages/)          │
│  Concept catalog → LessonPlayer → beats/* → hints      │
│  Konva interactive visuals, hand-rolled SPA router     │
├────────────────────────────────────────────────────────┤
│  Capstone interview  (src/interview/)                  │
│  WebRTC ↔ OpenAI Realtime · server-minted token        │
│  audio-reactive WebGL orb · server-side grader         │
├────────────────────────────────────────────────────────┤
│  Progress, mastery & habit  (src/progress/, src/habit/)│
│  Unlock chain, needsReview path, streaks, medallions   │
├────────────────────────────────────────────────────────┤
│  Persistence  (Firebase)                               │
│  Auth (email + Google) · Firestore (per-beat progress) │
│  Cloud Functions — server-authoritative progression    │
│  + interview token mint / transcript grading           │
└────────────────────────────────────────────────────────┘
```

**Content model** — lessons are structured JSON fixtures (`fixtures/lesson-*.json`, `fixtures/course-*.json`) validated against a Zod schema (`src/content/schema.ts`). A lesson is an ordered list of typed beats, not HTML blobs. Loaded via `src/content/loader.ts` and `src/content/firestoreLoader.ts`. Interview packs (`interviews/course-*.json`) are a parallel content type with their own Zod schema (`src/content/interviewPack.ts`); the full pack with hidden answers is bundled server-side only.

**Probability engine** — a pure, zero-dependency module (`src/engine/`) using exact rational arithmetic (no floats). It builds the KMP pattern automaton, solves linear systems via Gauss-Jordan over rationals for expected hitting times, and runs Monte-Carlo simulations. Each concept has its own engine module (e.g. `gameTheory.ts`, `optimalStopping.ts`, `bayes.ts`). Every answer shown to the user — and every numeric answer in an interview pack — is derived from this engine, not hardcoded.

**Frontend renderer** — `src/lesson/LessonPlayer.tsx` + `src/lesson/beats/` render beats from the content model, capture interactions, and deliver instant feedback through a hint ladder (`src/lesson/feedback.ts`, `src/lesson/hintLadder.ts`, `src/lesson/equationDiagnosis.ts`). Interactive visuals live in `src/lesson/konva/`. The signed-in home is a domain-shelved concept catalog (`src/pages/ConceptCatalogPage.tsx`). Hand-rolled SPA router and auth guard in `src/App.tsx` (no react-router).

**Capstone interview** — `src/interview/` holds the WebRTC hook (`useRealtimeInterview.ts`), the audio-reactive WebGL `Orb.tsx`, the report view, and the callable wrappers; the server side lives in `functions/src/interview.ts` (`mintInterviewToken` + `gradeInterview`). See [AI Capstone Interview](#ai-capstone-interview) above.

**Progress, mastery & habit** — a course path with an unlock chain and next-step recommendation; mastery signal + `needsReview` path (`src/progress/`, `src/lesson/mastery.ts`); streaks and concept-mastered medallions (`src/habit/`).

**Persistence & backend** — Firebase Auth (email/password + Google; display-name onboarding); Cloud Firestore for resumable per-beat snapshots, progress, streaks, and milestones; Cloud Functions (`functions/src/`) as the server-authoritative writer for progression/completion/streaks/milestones (idempotent). Owner-scoped, field-whitelisted Firestore security rules (`firestore.rules`). Deployed on Firebase Hosting.

---

## Project Structure

```
.
├── fixtures/           # Authored lesson & course JSON (source of truth for content)
├── interviews/         # Engine-verified interview packs (course-*.json) + _build generators
├── concepts/           # Lesson-factory authoring artifacts (briefs, specs, scorecards)
├── docs/               # ADRs (docs/adr/), design system, capstone-interview specs
├── functions/          # Cloud Functions (TypeScript, firebase-admin)
│   └── src/interview.ts  # mintInterviewToken + gradeInterview (server-only OPENAI_API_KEY)
├── scripts/            # validate-fixtures, validate-interview-packs, seed-firestore, build-tokens
├── src/
│   ├── app/            # App-level utilities (error boundary, view transitions, online status)
│   ├── auth/           # Auth UI + guards
│   ├── content/        # Schema (Zod), loader, Firestore loader, interviewPack schema
│   ├── engine/         # Per-concept engines (KMP, Gauss-Jordan, game theory, Bayes, …)
│   ├── habit/          # Streaks, medallions
│   ├── interview/      # WebRTC hook, WebGL Orb, report view, callable wrappers
│   ├── lesson/
│   │   ├── beats/      # Beat renderers (one per interaction type)
│   │   ├── konva/      # Konva canvas visuals (state graph, etc.)
│   │   ├── feedback.ts
│   │   ├── hintLadder.ts
│   │   ├── equationDiagnosis.ts
│   │   └── LessonPlayer.tsx
│   ├── pages/          # Route-level pages (ConceptCatalogPage, CoursePathPage, InterviewPage, …)
│   ├── progress/       # Unlock chain, mastery, needsReview
│   ├── firebase/       # Firebase client init (app.ts)
│   └── App.tsx         # SPA router + auth guard
├── firestore.rules     # Firestore security rules
├── firebase.json       # Hosting, Firestore, Functions, Emulators config
└── .env.example        # Env var template
```

---

## Getting Started

### Prerequisites

- **Node.js** (current LTS recommended; the Firebase CLI is sensitive to the Node version)
- **Java** — only for the full emulator path below (most lesson/UI work uses the fast path and needs neither Java nor Firebase)

### Install

```bash
npm install
cd functions && npm install && cd ..
```

### Environment

```bash
cp .env.example .env.development
```

Edit `.env.development` and fill in your Firebase web app config (Project settings → Your apps → Web in the Firebase console, or `firebase apps:sdkconfig web`). Keep `VITE_USE_EMULATORS=true` for local development. Leave `VITE_FIREBASE_APPCHECK_SITE_KEY` blank; App Check is skipped in emulator mode.

For production, create `.env.production` with `VITE_USE_EMULATORS=false` (or unset) and your production config.

> **Note:** If you use Google sign-in, it must be enabled in the Firebase console (Authentication → Sign-in method).

### Fast path: UI work with no Firebase or Java

The `/dev/*` routes render fixture data and bypass auth/Firebase entirely, so most lesson/UI work needs only Vite — no emulator, seeding, or Java:

```bash
npm run dev
```

- `http://localhost:5173/dev/home` — Study Desk harness with a scenario switcher
- `http://localhost:5173/dev/lesson/<lessonId>` — any lesson from its fixture (e.g. `lesson-pattern-hitting-times`)
- `http://localhost:5173/dev/interview` — the capstone interview UI, fixture-backed (no OpenAI key needed)

### Full path: authed flow against the Emulator Suite (important ordering)

The app's auth initialization hangs if the page loads before the emulators are reachable, so start the emulators **first**.

```bash
# 1. Start the Emulator Suite (Auth :9099, Firestore :8080, Functions :5001, UI :4000)
firebase emulators:start

# 2. Seed Firestore with lessons and the course fixtures
#    (the app shows a "not found" error if content isn't seeded)
npm run seed

# 3. Start the dev server
npm run dev
```

The Emulator UI is available at http://localhost:4000.

> **Capstone interview secret:** the interview Cloud Functions read `OPENAI_API_KEY` as a [Functions secret](https://firebase.google.com/docs/functions/config-env) (not a `VITE_` var), set with `firebase functions:secrets:set OPENAI_API_KEY`. Without it, lessons work fully and the `/dev/interview` harness still renders; only the live `mintInterviewToken` call fails. App Check on the mint is enforced only on the prod project.

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check + production build (`dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (Vitest, single pass) |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:rules` | Run Firestore rules tests against the emulator (requires Java + emulators) |
| `npm run validate` | Validate all lesson/course fixtures against the Zod schema |
| `npm run validate:interviews` | Validate all interview packs against the pack schema |
| `npm run seed` | Seed Firestore with lessons + course fixtures |
| `npm run e2e` | Run Playwright end-to-end tests |
| `npm run tokens` | Regenerate design tokens from `style-dictionary/` |
| `npm run format` | Format with Prettier |

---

## Deployment

```bash
npm run build
firebase deploy
# or scope it:
firebase deploy --only hosting,firestore,functions
```

The Firebase project alias is `brilliant-org` (`.firebaserc`). Hosting serves `dist/` and rewrites all paths to `index.html` (SPA mode). Production URL: https://brilliant-org.web.app.

---

## Security Notes

- **Firestore rules** (`firestore.rules`): owner-scoped with field whitelists. Users can only read/write their own documents, and only expected fields.
- **Server-authoritative progression**: all completion/streak/milestone writes go through Cloud Functions, not direct Firestore writes from the client.
- **HTTP security headers**: HSTS, CSP, X-Frame-Options (DENY), X-Content-Type-Options, Referrer-Policy, and Permissions-Policy are set via `firebase.json`.
- **App Check** (reCAPTCHA v3): initialized client-side when `VITE_FIREBASE_APPCHECK_SITE_KEY` is set and emulators are off. Global enforcement on Firestore and callable Functions is **intentionally deferred** pending a monitor-then-enforce rollout; the one exception is `mintInterviewToken`, which opts into App Check on the prod project.
- **Capstone interview isolation**: the standing `OPENAI_API_KEY` never leaves the server — the browser only ever holds a short-lived ephemeral token. Hidden answers/rubric are stripped from the live session and bundled server-side only (never seeded to Firestore). The three interview subcollections are Function-owned (client writes denied); `gradeInterview` is ownership-, pending-, and concept-checked (no IDOR/replay). Audio is never stored. Full findings in `docs/security-audit.md`.

---

## Status

Active development. The catalog covers **ten live concepts (66 lessons)** across Probability, Combinatorics & Games, Algorithms & Information, and Quantitative Finance, each with an engine-verified interview pack and an optional AI capstone interview. The "Weighted Coins & Dice" lesson within Pattern Hitting Times is on the roadmap but not yet built.

*License: not specified.*
