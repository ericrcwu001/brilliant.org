# Ergo

**Probability, learned by doing.** Ergo is a Brilliant.org-style interactive web app that teaches probability through direct manipulation — not videos or walls of text. The flagship topic is *pattern hitting times*: why does flipping for HH take longer (E[HH] = 6) than flipping for HT (E[HT] = 4)? The answer unfolds through interactive state graphs, Monte-Carlo simulations, and a short proof built beat by beat.

> **Live demo:** https://brilliant-org.web.app

---

## What It Is

Each lesson is a short sequence of interactive **beats**: concept → problem → instant feedback. Problems use direct manipulation — drag-and-drop equation tiles, tap-to-build state graphs, sliders, a balance-scale solver — and give hand-authored, mistake-specific feedback computed entirely client-side. No AI, no server round-trips for feedback; Phase 1 is intentionally authored.

The app has a two-track diagnostic: **Track A** scaffolds from near-zero foundation; **Track B** runs leaner for confident learners and quant-interview prep. The course description says it best:

> *"For anyone curious about probability who likes to learn by doing — no prior probability, statistics, or algebra assumed. Quant-interview prep is a fully-served optional track, not a prerequisite to walk in."*

---

## Course: Pattern Hitting Times

Seven lessons across three chapters. All are currently built.

| # | Title | Summary | Chapter |
|---|-------|---------|---------|
| L0 *(opt.)* | Watch the First Heads | Warm-up: flip until first heads, discover E[H] = 2 | Ch 1 · Foundations |
| L1 | Pattern Hitting Times | **Flagship:** prove E[HH] = 6 vs E[HT] = 4 via state recurrences | Ch 1 · Foundations |
| L2 | Penney's Game | Two patterns race; going second can win 7:1 | Ch 2 · Racing & Walks |
| L3 | Gambler's Ruin | Random walk between walls: P(ruin) = i/N, E[duration] = i(N−i) | Ch 2 · Racing & Walks |
| L4 | Mixed Review & Streaks | Interleaved checkpoint — waiting, racing, and walking unlabeled | Ch 3 · Mastery |
| L5 | Longer Patterns & Overlap | Transfer to THH vs HTH (E[THH] = 8, E[HTH] = 10); faded hints | Ch 3 · Mastery |
| L6 | The Overlap Shortcut | Capstone: E[wait] = Σ 2^(overlap length), proved by a martingale | Ch 3 · Mastery |

**Roadmap (not yet built):** Weighted Coins & Dice.

---

## Tech Stack

| Layer | Key packages |
|-------|-------------|
| Frontend | React 19, TypeScript 6, Vite 8 (with the React Compiler) |
| Backend / DB | Firebase 12 — Auth, Firestore, Cloud Functions, App Check, Analytics |
| Canvas visuals | Konva 10 + react-konva |
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
│  Content model  (src/content/, fixtures/)              │
│  Zod schema → JSON fixtures → loader / Firestore sync  │
├────────────────────────────────────────────────────────┤
│  Probability engine  (src/engine/)                     │
│  KMP automaton + Gauss-Jordan over exact rationals     │
│  → expected hitting times, Monte-Carlo, Markov chains  │
├────────────────────────────────────────────────────────┤
│  Frontend renderer  (src/lesson/)                      │
│  LessonPlayer → beats/* → feedback / hint ladder       │
│  Konva interactive visuals, hand-rolled SPA router     │
├────────────────────────────────────────────────────────┤
│  Progress, mastery & habit  (src/progress/, src/habit/)│
│  Unlock chain, needsReview path, streaks, medallions   │
├────────────────────────────────────────────────────────┤
│  Persistence  (Firebase)                               │
│  Auth (email + Google) · Firestore (per-beat progress) │
│  Cloud Functions — server-authoritative progression    │
└────────────────────────────────────────────────────────┘
```

**Content model** — lessons are structured JSON fixtures (`fixtures/lesson-*.json`, `fixtures/course-*.json`) validated against a Zod schema (`src/content/schema.ts`). A lesson is an ordered list of typed beats, not HTML blobs. Loaded via `src/content/loader.ts` and `src/content/firestoreLoader.ts`.

**Probability engine** — a pure, zero-dependency module (`src/engine/`) using exact rational arithmetic (no floats). It builds the KMP pattern automaton, solves linear systems via Gauss-Jordan over rationals for expected hitting times, and runs Monte-Carlo simulations. Every answer shown to the user is derived from this engine, not hardcoded.

**Frontend renderer** — `src/lesson/LessonPlayer.tsx` + `src/lesson/beats/` render beats from the content model, capture interactions, and deliver instant feedback through a hint ladder (`src/lesson/feedback.ts`, `src/lesson/hintLadder.ts`, `src/lesson/equationDiagnosis.ts`). Interactive visuals live in `src/lesson/konva/`. Hand-rolled SPA router and auth guard in `src/App.tsx` (no react-router).

**Progress, mastery & habit** — a course path with an unlock chain and next-step recommendation; mastery signal + `needsReview` path (`src/progress/`, `src/lesson/mastery.ts`); streaks and concept-mastered medallions (`src/habit/`).

**Persistence & backend** — Firebase Auth (email/password + Google; display-name onboarding); Cloud Firestore for resumable per-beat snapshots, progress, streaks, and milestones; Cloud Functions (`functions/src/`) as the server-authoritative writer for progression/completion/streaks/milestones (idempotent). Owner-scoped, field-whitelisted Firestore security rules (`firestore.rules`). Deployed on Firebase Hosting.

---

## Project Structure

```
.
├── fixtures/           # Authored lesson & course JSON (source of truth for content)
├── functions/          # Cloud Functions (TypeScript, firebase-admin)
├── scripts/            # validate-fixtures, seed-firestore, build-tokens
├── src/
│   ├── app/            # App-level utilities (error boundary, view transitions, online status)
│   ├── auth/           # Auth UI + guards
│   ├── content/        # Schema (Zod), loader, Firestore loader
│   ├── engine/         # KMP automaton, Gauss-Jordan, Monte-Carlo
│   ├── habit/          # Streaks, medallions
│   ├── lesson/
│   │   ├── beats/      # Beat renderers (one per interaction type)
│   │   ├── konva/      # Konva canvas visuals (state graph, etc.)
│   │   ├── feedback.ts
│   │   ├── hintLadder.ts
│   │   ├── equationDiagnosis.ts
│   │   └── LessonPlayer.tsx
│   ├── pages/          # Route-level pages (LandingPage, etc.)
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
- **Java** — required to run the Firebase Emulator Suite

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

### Local dev (important ordering)

The app's auth initialization hangs if the page loads before the emulators are reachable, so start the emulators **first**.

```bash
# 1. Start the Emulator Suite (Auth :9099, Firestore :8080, Functions :5001, UI :4000)
firebase emulators:start

# 2. Seed Firestore with lessons and the course fixture
#    (the app shows a "not found" error if content isn't seeded)
npm run seed

# 3. Start the dev server
npm run dev
```

The Emulator UI is available at http://localhost:4000.

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
| `npm run seed` | Seed Firestore with lessons + course fixture |
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
- **App Check** (reCAPTCHA v3): initialized client-side when `VITE_FIREBASE_APPCHECK_SITE_KEY` is set and emulators are off. Enforcement on Firestore and callable Functions is **intentionally deferred** pending a monitor-then-enforce rollout — it is not currently enforced in production.

---

## Status

Active development. MVP covers the full 7-lesson course. The "Weighted Coins & Dice" module is on the roadmap but not yet built.

*License: not specified.*
