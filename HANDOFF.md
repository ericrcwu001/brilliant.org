# HANDOFF

## Goal

Build a Brilliant-style learn-by-doing web app whose flagship lesson teaches
**pattern hitting times** for coin flips (why `E[HH]=6` but `E[HT]=4`). Work is
sequenced by `docs/mvp_prd.md` (Groups A–D). The **local-only flagship lesson
(Groups A & B) is complete and hardened**; two follow-on workstreams are now
live: a **beat-audit quality loop** and **next-lesson design (L2–L6)**.

Key constraints (`docs/mvp_prd.md`, `docs/core_instructions.md`, `AGENTS.md`):

- **Groups A & B are local-only**: NO Firebase, auth, persistence, or Cloud
  Functions. Feedback is computed client-side from the engine; interaction state
  lives in component/local state.
- Match `docs/ui_design_system.md` ("Clean Mathematical Notebook", IBM Plex,
  design tokens, sticky action bar). Keep the KMP engine **pure/dependency-free**.
- Surgical changes, simplicity first, no speculative scope.

## Current State (snapshot)

- **Git:** branch `main`, up to date with `origin/main` (remote exists). **3
  commits** on remote; **Group C (Phases 13–19) is uncommitted** in the working
  tree (auth, Firestore seed/loader, snapshots, Cloud Functions, rules, App
  Check, analytics, course-path UI).
- **Verification (re-run this session, all green):**
  - `npm run validate` → 4 fixtures valid + engine recurrences match HH tiles.
  - `npx vitest run` → **75 tests** across 10 files.
  - `functions/` `npm test` → **7 streak idempotency tests**.
  - `npm run lint` → clean.
  - `npm run build` → green (244 modules; `dist` JS **1.29 MB** / gzip 393 kB).
  - `npm run e2e` → **6/6 pass** (chromium / mobile / reduced-motion); `/dev/lesson`
    local path unchanged.
- **Emulator-gated (not run here — no Java):** `npm run seed`, `npm run test:rules`,
  full Auth + Functions + Firestore manual walkthrough.
- **Stray:** `docs/Hermes-Setup.dmg` is committed (binary, likely unintended).
- **"White screen" on `npm run dev` (diagnosed + fixed):** the app was working — it
  was the auth-init `BootScreen`, which was two near-invisible skeleton bars on the
  paper background. It looks blank during the Auth-emulator round-trip, and hangs
  indefinitely if the page is opened **before the emulators are reachable**
  (`onAuthStateChanged` never fires → permanent boot). Fix: `BootScreen` (in
  `src/App.tsx` + `.bootscreen__brand`/`__caption` CSS) now shows a visible
  "PATTERN HITTING TIMES / Signing you in…" loading state. **Run order matters:
  start emulators first, then `npm run dev`.** Verified via the IDE browser:
  boot → landing renders.

## Session (2026-06-23, night) — inclusive (near-zero foundation) redesign

Per request, rethought the course to be **inclusive of learners starting from
next-to-zero foundation** (no probability/EV/fractions/algebra; possible math
anxiety) **without gutting quant depth**. Ran **5 parallel Opus 4.8 max-fast**
research sub-agents (one lens each), each grounded in the repo + the
learning-science literature; deliverables in `audits/ideation/inclusive-research-{1..5}-*.md`:
1 cognitive-load, 2 prerequisites-misconceptions, 3 representations-cra,
4 motivation-anxiety, 5 progression-assessment.

**Cross-agent convergence (the reframe):** the product is expert-optimized, so
by the **expertise-reversal effect** its best choices *harm* novices — fix is
"scaffold by default, let experts opt out" (load asymmetry: novice gain d≈0.51 >
expert cost d≈0.43). Concretely: (a) an **optional, diagnostic-gated L0 "The
First Heads"** teaching `E[H]=2` first (engine already supports
`buildAutomaton("H")`); (b) a **two-track** design (pre-check → beginner/expert;
JIT primers; optional "For the interview" notes); (c) a **concrete→abstract
notation ladder** (no symbol before its referent; fix the unlinked `∅/H/HH` vs
`E0/E1/E2` bug — data already carries both labels); (d) **elicit-and-refute**
misconceptions + **per-option** prediction feedback (PredictionBeat is ungraded
today); (e) systematized **retrieval/spacing/interleaving** + a light non-blocking
mastery signal (generalize `transferAttained`); (f) **de-gatekept copy**.

**Edited directly:** `docs/proposed-lessons.md` — full inclusive rewrite (L0
on-ramp + repurposed L4 "Mixed Review" + cross-cutting system + per-lesson
inclusive specs + engine/schema/infra + open questions). Adopts the **PRD/CONTEXT
canonical order** (Overlap Shortcut last) and flags the `future_ideas.md`
discrepancy for reconciliation.

**Created:** `docs/l1-inclusive-redesign-spec.md` — implementation-ready change
spec for the **built** flagship (per-beat before→after copy; schema additions
`Feedback.byOption`, `primer`/`mcq` types, `track`/`density` flags, hint
high-water mark; component changes to PredictionBeat/StateGraph/EquationTilesBeat/
CoinSimBeat; de-hardcode `equationDiagnosis.ts`; ordered build plan + verify
checklist). **No code/fixtures changed** (docs-only this session, per task).

**Open for the human (see proposed-lessons §12):** is branching/diagnostic in
Phase-1 scope, or ship always-on dismissible primers first; L0 as a separate
lesson vs a Track-A beat-group in L1; reconcile the docs ordering conflict;
biggest validity risk = no novices in the user pool to test with.

## Session (2026-06-23, night) — desktop type scale (`--fs`)

Per request, made **every font-size bigger on desktop only** (mobile deliberately
untouched, to be tuned later). Approach: one global knob. Added `--fs` to
`src/styles/tokens.css` (`:root { --fs: 1 }` + `@media (min-width: 768px) { :root
{ --fs: 1.15 } }`), then rewrote **all ~130 `font-size` px declarations** in
`src/styles/app.css` to `calc(<px> * var(--fs))`. Because `--fs` is `1` below
768px, mobile renders at the exact original px (zero visual change); desktop scales
uniformly 15%. To retune desktop, change the single `1.15`. Left `font-size: 0.72em`
(`.eqtiles sub`, already relative) and `font: inherit` as-is. **Not covered:** Konva
**canvas** label sizes (`fontSize={…}` in `SimChart`/`BiasChart`/`StateGraph`/
`CourseSpine`) — these are JS-rendered to canvas, so CSS scaling doesn't reach them;
flagged for a follow-up if desired. `npm run build` green (258 modules).

## Session (2026-06-23, night) — App Check wired live (reCAPTCHA v3)

Implemented Firebase App Check end-to-end on **brilliant-org** (reCAPTCHA v3, matches the
existing `ReCaptchaV3Provider` code in `src/firebase/app.ts` — no code change needed):
- Set `VITE_FIREBASE_APPCHECK_SITE_KEY=6LfXKTEtAAAAANlMAzg-n80bZs91dKGFFwHfhzap` (public
  site key) in `.env.production`; rebuilt + redeployed hosting. Confirmed the key is baked
  into the bundle and the client loads reCAPTCHA + fires the App Check token exchange.
- Root-caused a 403 on `exchangeRecaptchaV3Token`: the **Firebase App Check API was
  disabled** on brilliant-org. Enabled it via `gcloud services enable
  firebaseappcheck.googleapis.com --project brilliant-org`. The reCAPTCHA v3 provider was
  already registered in the console (`recaptchaV3Config`: tokenTtl 86400s, minValidScore 0.5).
- Post-enable the exchange is 403 → **400 in the automated IDE browser** (reCAPTCHA scores
  the embedded webview as bot-like, below 0.5 → rejected). Expected; a real browser should
  get 200. Confirm via console App Check metrics (Verified requests) with real traffic, or
  load the live site in a normal browser → Network → `exchangeRecaptchaV3Token` = 200.

**Enforcement is intentionally OFF.** Do NOT enforce (or add `enforceAppCheck: true` to the
callables) until console metrics show real users getting verified tokens — else legit/low-
score users get blocked. Final step when ready: App Check console → APIs → set Cloud
Firestore + Cloud Functions to Enforce, then add `enforceAppCheck: true` to
`completeLesson`/`recordQualifyingAction` and redeploy functions.

## Session (2026-06-23, night) — Hosting deploy LIVE (brilliant-org)

Deployed the app to **Firebase Hosting** → **https://brilliant-org.web.app** (verified
200, serving the built SPA; title "Pattern Hitting Times"). Steps:
- Added a `hosting` block to `firebase.json` (public `dist`, SPA catch-all rewrite →
  `/index.html`).
- Repointed **`.env.production`** from the stale `brilliant-phht-prod` to **brilliant-org**
  (real web config via `firebase apps:sdkconfig web`, `VITE_USE_EMULATORS=false`,
  `measurementId=G-BZMQ5RY75Z`).
- Built via direct binaries (`./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build`),
  deployed under node v24.3.0 (`firebase deploy --only hosting --project brilliant-org`).

**Pending for full live functionality:**
- Enable **Google sign-in** in the brilliant-org console (Auth → Sign-in method) — until
  then only email/password works on the live site.
- **App Check** is not active (no `VITE_FIREBASE_APPCHECK_SITE_KEY`); fine while console
  enforcement stays off (Phase 18 security follow-up).
- Only L1 is seeded/built; L2–L6 are locked stubs.
- `firebase.json` + `.env.production` edits are uncommitted (tree still uncommitted).

## Session (2026-06-23, night) — landing hero = wordmark

Per request, the pre-auth landing hero (`src/pages/LandingPage.tsx`) no longer leads
with the question "Why does `HH` take longer to appear than `HT`?" — the `<h1>` is now
the brand wordmark **"Pattern Hitting Times"** (matches `index.html` `<title>` + the
signed-in top-bar wordmark in `StudyDesk.tsx`), with the existing subline "State
thinking for quant interviews." kept as tagline. Dropped the now-duplicate
`hero__eyebrow` element ("Pattern hitting times") and its orphaned CSS rule in
`src/styles/app.css`. State-machine preview + CTAs untouched. No tests referenced the
old headline.

**Stale-dev-server gotcha (same session):** user didn't see the edit. Root cause was
NOT the change — multiple overlapping Vite servers (ports 5173 + 5180, plus several
that died fighting over 5173) had **wedged file watchers**: `curl localhost:517x/src/pages/LandingPage.tsx`
returned the OLD source on both even after `touch`. The emulator is irrelevant to a
static frontend string. Fix: `kill -9` the two live `node ./node_modules/.bin/vite`
PIDs (left the Firebase emulators + the `firebase-tools mcp` proc alone), started one
clean `./node_modules/.bin/vite --port 5173 --strictPort`; verified it now serves
"Pattern Hitting Times". User action: open `localhost:5173` + hard-reload. Reminder:
the landing hero is the **signed-out** screen (signed-in → Study Desk via the guard).

## Session (2026-06-23, late PM) — dev white screen fixed (missing `.env.development`)

Symptom: `http://localhost:5173/` was all white. Root cause: **no env file existed**
(only `.env.example`) — the "Live Firebase" section's `.env.development` was gone.
With every `VITE_*` undefined, `usingEmulators` was `false` AND `apiKey` was
`undefined`, so `getAuth(app)` throws `auth/invalid-api-key` at module import in
`src/firebase/app.ts` → React never mounts (no error boundary in `main.tsx`).
`/dev/lesson` + `/dev/home` were unaffected (they bypass Firebase).

Fix: recreated `.env.development` (gitignored) for the **emulator** loop running now
(terminal 6) — dummy web config + `projectId=brilliant-org` (matches emulator
singleProjectMode + seeded data) + `VITE_USE_EMULATORS=true`. Killed the stale vite
on 5173 (pid survived SIGTERM; needed `kill -9`) and restarted
`./node_modules/.bin/vite --port 5173 --strictPort`. **Verified** headlessly via
system Chrome (Playwright `executablePath`, no browser download): landing renders
("Create account / Sign in"), **0 console errors**. User-side: **hard-reload** the
cached tab (`Cmd+Shift+R`) — the old throwing module is cached in that tab.

Live vs emulator: the documented dev intent was real brilliant-org web config +
`VITE_USE_EMULATORS=false`. To switch back to live: real web config (appId
`1:801582458333:web:3e64f37f2c081802470234`), `VITE_USE_EMULATORS=false`, and enable
Google sign-in in the console (still pending). Several stale vite servers also linger
on 5174/5175/5180 from earlier (started before the env file existed → still broken).

## Session (2026-06-23) — Study Desk Home (graph-node course path) BUILT

Built the signed-in **Study Desk Home** — the graph-node course-path reskin of the
card-style `CoursePathPage` precursor, scoped to the **L1-only gate**, behind a
`/dev/home` fixture harness so it is fully decoupled from Group C (Firebase).
Source of truth: `docs/home-study-desk.md` (Q1–Q23), `docs/adr/0001-konva-course-path-spine.md`,
`docs/ui_design_system.md`.

**Architecture (decoupled, collision-free):**
- **Presentational** `src/pages/StudyDesk.tsx` — pure render from props (`course`,
  `progressById`, `streak`, `earned`, `newlyEarned`, `displayName`, `navigate`).
- **Pure model** `src/pages/studyDesk.model.ts` (+ `.test.ts`, 9 tests) — glyphs,
  node-state resolution, recommended action (Resume>Review>Start>Replay), status
  line, review note (Q23), node CTA label. Frozen `Course`/`Progress` contracts.
- **Thin data container** `CoursePathPage.tsx` now only loads (course/progress/
  streak/earned) + the one-time earn-moment seen flag (localStorage) and renders
  `<StudyDesk>`. The old `.pathnode`/`.pathline` rendering is gone; that CSS is now
  dead (left in place, not deleted — surgical).
- **Konva** `src/lesson/konva/CourseSpine.tsx` (`'use no memo'`) — single `<Stage>`
  draws rule/dots/glyphs/`--mark-wash` beam/locked padlocks/needsReview ring/focus
  halo pulse. `src/lesson/LessonPreview.tsx` — L1 live preview (reuses `StateGraph`
  + `buildAutomaton('HH',0.5)`): defer-mount via IntersectionObserver, static
  final-frame first, autonomous flip loop, **pauses offscreen**, reduced-motion =
  static (Q15). `MilestoneSeal.tsx` extended (earn fade + tap-expand).
- **Dev harness** `src/pages/DevHomePage.tsx` + `/dev/home` route (mirrors
  `/dev/lesson` in `App.tsx`/`routes.ts`): renders `StudyDesk` against the committed
  `fixtures/course-pattern-hitting-times.json` + mock progress/streak/earned, **no
  Firebase**. Scenario switcher: First visit / Resume / Review+earn fade / Loading.

**Rendering (ADR-0001 / Q17–Q22):**
- **Laptop (≥768px):** one Konva spine (left) + a parallel transparent DOM-button
  overlay (focus/ArrowUp-Down/44px/aria) + the focused detail panel beamed to the
  right; non-focused nodes glyph-only, hover/focus/**click** → popover (title+hook+
  "Locked", no CTA, no prereq copy).
- **Mobile (<768px):** responsive divergence — focused node = full-width DOM card
  (glyph/title/hook/Konva preview/CTA); the other 5 glyph-only nodes = a compact
  single Konva rail; tapping a rail node expands its detail card inline (one at a
  time). Compact habit + seal strips (titles hidden) so the Start CTA clears the
  fold (Q21).
- Loading = DOM skeletons, no canvas/spinner (Q22). Roadmap = one locked
  "Weighted Coins & Dice" stub.

**Verification (all green):** `eslint .`, `tsc -b`, `vite build` (250 modules; JS
1.31 MB / **gzip 400 kB** — preview reuse ≈0 KB, no code-split, Q15), `vitest run`
**84 tests / 11 files**. Browser `/dev/home` (IDE browser): laptop spine + beam +
preview (animates with motion, static final frame under emulated reduced-motion via
the `useReducedMotion` change listener) + Start CTA + roadmap; locked-node click →
popover (no CTA); **ArrowDown traverses the spine**; 44×44 hit targets; **no
horizontal scroll** (1100 + 375). **Mobile re-verified at 320 / 375 / 414** (all:
mobile divergence, no `.desk-spine`, 5 rail hits, **no h-scroll**, **Start CTA above
the fold** — bottom ≤ 644px sans the harness bar, after capping the mobile preview
to 116px + slimming the dev bar to one row). **Rail tap-expand** works (inline card
title+hook+"Locked", no CTA; **one at a time** — tapping another collapses the prior).
**Earn fade** verified (`seal--earning` → `seal-ink-ring`/`seal-ink-glyph`, 0.6s with
motion, collapsed to instant under reduced-motion). All three action paths confirmed:
**Start** / **Resume** ("In progress") / **Review** ("Review recommended" + practice
note). **No console errors** on a clean load (the one-off Konva tween warning was an
HMR artifact, not reproducible).

**Notes / interpretations:**
- Mobile rail is one Konva stage + the expanded card rendered just below it
  (ADR says mobile "is not literally one Stage"); "inline expand-in-place, one at a
  time" honored via a single selected-card state.
- Locked nodes also **toggle** their detail on click (touch path + testability);
  hover/focus popover relies on `focusin` (works for real users; a backgrounded
  webview suppresses programmatic-focus events, so it wasn't browser-observable).
- Mobile CTA-above-fold: the `/dev/home` switcher bar is harness-only; in production
  the CTA clears a 720 fold; trimmed the mobile preview (cap 116) + card rhythm for
  headroom on shorter screens (e.g. SE 667).
- **Not done (separate later step, per task):** the live `/path` end-to-end check
  (emulator/seed/auth). Everything else is browser-verified on `/dev/home`.

## Group C — Firebase Backend (Phases 13–19) COMPLETE

PRD "Done-when" status (manual emulator walkthrough still pending Java host):

| Phase | Done-when | Status |
|-------|-----------|--------|
| **13 Auth & onboarding** | Signed-in user reaches course path; `users/{uid}` with display name | ✅ Code complete; emulator round-trip verified by sub-agent |
| **14 Firestore seed + read** | Flagship renders from Firestore end-to-end | ✅ `npm run seed` + `loadLessonFromFirestore`; `/dev` stays local |
| **15 Snapshots + restore** | Resume contract holds for refresh/page-hide | ✅ Debounced Firestore + `localStorage` mirror; hint rehydration |
| **16 Cloud Functions** | Completion written only by Function; unlock once | ✅ `completeLesson` + `recordQualifyingAction` idempotent |
| **17 Streaks & milestones** | Once per local day; milestones on completion | ✅ Function-owned; UI on path + recap stamp |
| **18 Rules + App Check** | Denied paths denied; legit writes work | ✅ Hardened rules + App Check seam; `test:rules` written |
| **19 Analytics** | Gate-minimum events fire reliably | ✅ All 9 events wired; emulator-skipped in dev |

**Key files:** `src/auth/*`, `src/pages/*`, `src/content/{loader,firestoreLoader}.ts`,
`src/lesson/snapshot.ts`, `src/progress/*`, `src/habit/*`, `src/analytics/events.ts`,
`functions/src/{index,streaks,milestones}.ts`, `firestore.rules`, `scripts/seed-firestore.ts`.

**Group C cut lines exercised:** only flagship is `built: true`; course fixture follows
PRD MVP order (L1 → L2 flagship → L3 + 2 roadmap stubs). Flagship is bootstrap-available
on the path until L1 ships (Phase 20). Instant feedback stays client-side; Functions
only on achievement/unlock path.

**Open question (resolved, option a):** `predictionDeltaInitial` uses `finalPrediction`
when the opening bet is qualitative.

## Phase 17 / 18 / 19 — Habit loop, Security, Analytics (COMPLETE)

Built alongside the parent's Phase 15/16 (snapshots + completion); coordinated at
the seams the parent left.

- **P17 Streaks & milestones ✅**
  - Cloud Functions: streak/milestone *logic* lives in `functions/src/streaks.ts`
    (`computeStreakUpdate` pure + `incrementDailyStreak` helper, idempotent per
    local day, server-computed local date from an IANA tz, UTC fallback) and
    `functions/src/milestones.ts` (`awardMilestonesForCompletion` +
    `awardMilestone`, idempotent; awards `first-pattern-cracked`,
    `hh-ht-mastered`, `state-machine-builder`, `three-lessons-complete`).
  - Wired into the parent's `functions/src/index.ts`: `recordQualifyingAction`
    now increments the streak; `completeLesson` awards milestones + returns
    `awardedMilestones`. `src/progress/functions.ts` (parent's) was extended to
    send `timezone` and surface `streak` in the result.
  - Client: `src/habit/{streaks,milestones,StreakTally,MilestoneSeal}` (readers +
    seal metadata/UI). `LessonPlayer` shows the streak tally in the top bar +
    refreshes it on a qualifying action; recap shows the post-completion
    milestone stamp. `CoursePathPage` reads streak + earned milestones +
    progress and renders the habit panel, seal gallery, and review caption.
  - **Streak unit test:** `functions/src/streaks.test.ts` (7 tests, idempotency +
    day math) via `npm test` in `functions/`.
- **P18 Security rules + App Check ✅**
  - `firestore.rules` hardened to the PRD matrix: owner-scoped; `users/{uid}`
    create-once + display-name whitelist; snapshot field-whitelist (rejects
    unknown keys); progress denies progression fields on create+update;
    milestones/streaks client-write denied.
  - App Check wired in `src/firebase/app.ts` (reCAPTCHA v3 from
    `VITE_FIREBASE_APPCHECK_SITE_KEY`, skipped in emulator mode).
  - Rules unit test `tests/firestore.rules.test.ts` + `vitest.rules.config.ts` +
    `npm run test:rules` (emulator-gated; **not runnable here — no Java**).
- **P19 Analytics ✅** `src/analytics/events.ts` (lazy, emulator-skipped,
  fire-and-forget logEvent wrapper). Events wired: `beat_viewed`,
  `lesson_completed`, `streak_incremented`, `milestone_earned`
  (`LessonPlayer`); `answer_submitted` + `hint_revealed` (`useHintLadder`,
  covers both graded beats); `prediction_set` (Prediction + Slider beats);
  `simulation_run` (TheorySimChart); `review_recommended_shown` (recap +
  course path). Added `VITE_FIREBASE_MEASUREMENT_ID` to env files + config.
- **Verification:** root `tsc -b`, `eslint .`, `vitest run` (75) all green;
  `functions` `tsc` + `vitest` (7) green; `vite build` green. `npm run test:rules`
  pending a Java/emulator host.
- **Coordination note:** milestone awards are gated on the progress doc, so they
  persist only once the parent's `completeLesson` writes `completionStatus:
  completed`; the recap stamp shows optimistically regardless.

## Flagship Lesson — Groups A & B COMPLETE

Completable end-to-end at `/dev/lesson`. Phase status (PRD "Done-when"):

- **A0 Scaffold ✅** Vite + React 19 + TS; React Compiler (Babel) global with
  per-file `'use no memo'` for Konva; Prettier/Vitest/ESLint; scripts incl.
  `validate`, `e2e`.
- **A1 Pure KMP engine ✅** `buildAutomaton(pattern,p)` → typed `Automaton`
  (states/transitions/recurrences/expectedTimes/substitutionSteps/overlap).
  Exact rational arithmetic + Gaussian elimination. Golden: `E[HH]=6`, `E[HT]=4`,
  `E[THH]=8`, `E[HTH]=10`, `E[HHH]=14`.
- **A2 Schema + fixtures ✅** `src/content/schema.ts` (Zod); `fixtures/` (11-beat
  lesson + snapshot + canonical); `scripts/validate-fixtures.ts` cross-checks
  engine vs tile targets.
- **A3 Loader + renderer registry + per-beat rail ✅** `loader.ts`,
  `beats/index.tsx` dispatcher, `phases.ts` + `PhaseRail.tsx`, `LessonPlayer.tsx`
  linear nav + off-rail "Try bias" chip; `/dev/lesson` route; responsive
  (mobile-first, 768px laptop breakpoint, paper-grain bg).
- **B4 Feedback + hint ladder ✅** pure `hintLadder.ts` (escalate/reset, cap,
  `needsReview`) + `feedback.ts` glue (`useHintLadder`, `resolveFeedback`,
  `FeedbackView` incl. `note` kind + `clear()`); `FeedbackStrip` + `BeatShell`.
- **B5–B12 ✅** `prediction`, `patternPick`, `coinSim` (Konva `StateGraph` +
  DOM `CoinStream`, gate, scripted near-miss replay), `stateTap`, `equationTiles`,
  `slider` (refine + bias), `substitution`, `theorySimChart` (Konva `SimChart`),
  `overlap`, `bias-sandbox` (now a Konva `BiasChart` E-vs-p curve + live cards),
  `recap`. Engine `simulate.ts` (`nextStateOf`, `flipsToAbsorption`,
  `empiricalMean`, seedable `mulberry32`).

**Post-baseline hardening (since the Group A/B commit):**

- `src/lesson/equationDiagnosis.ts` — per-slot diagnostic grader (12 `MistakeId`s,
  two-level targeted hint copy, additive-reorder-safe, aggregate progress +
  a11y summary). Richer companion to the coarse row-level `equationChecker.ts`
  (both still present). **Caveat: state-mistake copy is hardwired to HH's
  `{E0,E2}` target** — generalize before reusing for new lessons.
- `src/lesson/stateTapHints.ts` — engine-derived per-transition hints (L1 nudge /
  L2 reason by transition kind / L3 reveal).
- `src/lesson/useReducedMotion.ts` — OS `prefers-reduced-motion` hook.
- `src/lesson/konva/BiasChart.tsx` — E-vs-p curves for the bias sandbox.
- **Playwright e2e harness:** `e2e/{smoke,lesson-complete}.spec.ts` + `helpers.ts`
  drive the full lesson tap-only across 3 projects (asserting the CTA gate matrix);
  doubles as the O1/O3 objective check.

## Phase 13 — Firebase Auth & Onboarding (COMPLETE)

Auth-first flow is live (no react-router; hand-rolled SPA router + guard in
`src/App.tsx`): landing → sign-in/create → display-name capture (first sign-in
only) → course path. New files: `src/auth/{authContext.ts, AuthProvider.tsx,
userDoc.ts, authErrors.ts}` and `src/pages/{routes.ts, LandingPage, AuthPage,
DisplayNamePage, CoursePathPage, ProfilePage, LessonPage}.tsx`; new CSS sections
appended to `src/styles/app.css`. `/dev/lesson` still bypasses auth/Firebase
(Group A + e2e entry point preserved).

- Providers: email/password + Google. `users/{uid}` is **create-once** and
  display-name-**whitelisted** (`createUserDoc` / `updateUserDisplayName` write
  only `displayName` + `createdAt`/`lastActiveAt`); Phase 18 enforces the same
  whitelist in rules. Profile edits the display name.
- Guard: signed-out ⇒ landing/auth only; signed-in + missing `users/{uid}` ⇒
  `/onboarding/name`; signed-in + onboarded ⇒ `/path`.
- Course path + lesson route are **stubs** (static node states; hairline loading
  skeleton). Phase 14 wires Firestore lesson content; Phase 16 wires real
  progress + streaks (the streak tally + node states are placeholders).
- Verified: `tsc`/`build` green, `lint` clean, 75 vitest pass, **emulator
  round-trip** (auth sign-up + `users/{uid}` create-once/whitelist/update) all
  PASS. Bundle now ships Firebase (~1.24 MB / 375 kB gzip) — code-split later.
- Not done (browser env unavailable here): automated UI click-through. Manual
  check = run emulators + `npm run dev`, walk create-account → name → path.

## Beat-Audit Loop (cycle 1 done)

A supervised, split-autonomy quality loop over the flagship. Contract:
`docs/beat-audit-rubric.md` (approved 2026-06-23) + runner `audits/cycle-runner.md`.
Pedagogy (P1–P5, 1–5) → **staged** PR proposals; Objective (O1–O5, pass/fail) →
**auto-fix** commits behind the verify gate. Knobs: ≤3 cycles, ≤3 auto-fixes/cycle,
one `beat-audit/cycle-NN` branch+PR per cycle, bar = pedagogyMean ≥ 4.0 (Ext ≥ 3.0).

**Cycle 1 (`audits/scoreboard.json`, `backlog.json`, `proposals/cycle-1.md`):**
pedagogyMean 4.31 all / 4.34 required; O1/O2/O3/O5 pass, **O4 (perf) n/a — not
instrumented**. **Stop Rule NOT met:** two required beats below bar —
`pattern-pick` (2.8, S2: passive confirmation screen) and `guided-solve` (3.8, S1:
low agency). Both are **staged proposals**, not yet applied.

## Next-Lesson Ideation — L2–L6 planning (COMPLETE)

5 Composer 2.5 Fast agents produced full beat-by-beat specs
(`audits/ideation/plan-L{2..6}-*.md`); synthesized into **`docs/future_ideas.md`**
(course proposal + widget catalog + engine roadmap). Earlier round-1 research in
`audits/ideation/agent-{1..5}-*.md`; first synthesis in `docs/proposed-lessons.md`.

**Unlock order:** L1 → L2 Penney's → L3 Gambler's Ruin → L4 Overlap Shortcut →
L5 States & Streaks → L6 Longer Patterns. Each lesson **12 beats** (L3: 11–12),
widget-heavy, engine-driven sims. Nothing built yet — design only.

| Lesson | Headline | Full plan |
|--------|----------|-----------|
| L2 Penney's | Race ≠ wait; THH beats HHH 7:1 | `plan-L2-penneys-game.md` |
| L3 Gambler's Ruin | P_i=i/N, D_i=i(N−i) | `plan-L3-gamblers-ruin.md` |
| L4 Overlap Shortcut | E=Σ2^L + martingale proof | `plan-L4-overlap-shortcut.md` |
| L5 States & Streaks | E[H]=2 consolidation | `plan-L5-states-streaks.md` |
| L6 Longer Patterns | THH vs HTH transfer (8 vs 10) | `plan-L6-longer-patterns.md` |

New pure engine proposed: `race.ts`, `walk.ts`, `correlation.ts`. New widgets:
RaceTrack, OddsDial, WalkerSwarm, RuinLandscape, AutocorrelationRuler,
GamblerLedger, TriangulationStrip, retrievalGrid, tripletReveal, etc.

## Active design interview (2026-06-23)

**Grill-me session** on the signed-in Home / course-path UX. **Consolidated digest:
`docs/home-study-desk.md`** (decision log Q1–Q12, region specs, glyph/milestone
tables, current-impl-vs-target, open questions) — start there in a new chat. Full
detail also in `docs/ui_design_system.md` (Signed-in Home + Course Path sections)
and the `CONTEXT.md` glossary. Resolved decisions:

- **Q1 — Signed-in entry:** dashboard-lite reframed as **Study Desk Home** —
  one scrolling page: habit panel → milestone seal gallery → course path. No
  separate route; not a SaaS dashboard.
- **Course order (6 lessons, Overlap last — APPLIED in code + docs):** L1 Pattern
  Hitting Times (gate, only built lesson) → L2 Penney's → L3 Gambler's Ruin →
  L4 States & Streaks → L5 Longer Patterns → L6 Overlap Shortcut (retrieval
  capstone). **Weighted Coins** is the only post-L6 roadmap stub. Milestones:
  `three-lessons-complete` after L3, `six-lessons-complete` after L6. Rewired:
  `fixtures/course-pattern-hitting-times.json`, `functions/src/milestones.ts`
  (`LESSON_MILESTONES` ×6, `MID_COURSE_PATH`, `FULL_COURSE_PATH`,
  `COURSE_COMPLETION_MILESTONE = six-lessons-complete`), and
  `src/habit/milestones.ts` `MILESTONE_SEQUENCE` (8 seals). Verified green:
  `npm run validate`, app vitest 75/75, app build, functions `tsc`, functions
  vitest 7/7.
- **Q3 — Habit panel CTA:** streak tally + one-line status only; **no button**
  in the panel. The single primary CTA lives in the focused node's detail panel.
- **Q4 — Seal gallery:** all **8** milestone seals visible from day one (earned
  = full ink, unearned = ghost), fixed course order.
- **Q5 — Locked nodes:** title + hook + "Locked"; **no** prerequisite copy.
- **Q6 — Course path = graph nodes** (B+C), not index cards: circles on a
  vertical spine, per-lesson mono glyph, `--mark-wash` beam on the focused node,
  detail (title/hook/status/CTA) revealed on hover/focus.
- **Q7 — At rest:** focused node shows its full detail panel **pinned**; all
  other nodes are **glyph-only** until hover/focus.
- **Q8 — Completed at rest:** **filled quill dot** (vs hollow ring for available).
- **Q9 — needsReview vs Resume:** **Resume always wins** focus; Review is focused
  only between lessons; `needsReview` shows as a `--mark` ring + hover detail +
  optional quiet habit-panel note, never interrupting an active session.
- **Q10 — Focused detail panel hosts a per-lesson live preview** (L1 pulsing
  state graph; L2 race lanes; L3 walk; etc.). Engine-driven where the engine
  exists; static final frame under reduced motion. **Only L1 ships a real
  preview now**; L2–L6 previews are authored as each lesson is built.
- **Q11 — earn moment:** recap stamp is primary; Home gallery seal does a
  one-time quiet ink **fade-in** on first return after earning. Reduced motion =
  fade only. (`docs/ui_design_system.md` Milestones "Two earn moments".)
- **Q12 — superseded by the reorder:** instead of framing L5/L6 as
  "consolidation," the user moved **Overlap Shortcut to L6** so the hardest
  lesson is the finale and L5 Longer Patterns solves `THH`/`HTH` the long way
  right before the L6 shortcut re-derives them. Order rewired in code (above).

**IMPORTANT — codebase is further along than older sections of this file imply.**
The working tree already has Group C largely present (untracked at session start):
Firebase auth + onboarding (Phase 13), Firestore content loader (14), snapshot
persistence (15, `src/lesson/snapshot.ts`), Cloud Functions completeLesson /
recordQualifyingAction (16), streaks + milestones habit loop (17, `src/habit/*`,
`functions/src/*`), and analytics events (19, `src/analytics/events.ts`).
`CoursePathPage.tsx` already loads the course from Firestore and renders
`course.lessons` in array order with a streak + seal gallery (card-style).

**Reframe NOT yet built in UI:** the Study Desk graph-node course path (spine,
glyphs, hover detail panels, `--mark-wash` beam, live preview) and habit-panel /
seal-gallery polish are spec-only in `docs/ui_design_system.md`;
`CoursePathPage.tsx` is the card-style precursor.

**Continued grill (this session) — §6 open set + spine/mobile/loading branches, resolved (Q13–Q23, ADR-0001):**
- **Q13** MVP gate = **L1-only** playable; L2–L6 locked ghost nodes; infra + L2–L6 deferred post-gate.
- **Q14** **Build the graph-node Home now** (full visual system + L1 live preview); retire the card precursor.
- **Q15** Live-preview perf = **defer-mount, static-frame-first, no code-split** (bundle ≈ 0; mounts post-first-paint / when visible, pauses offscreen).
- **Q16** **"Fully mastered" = recap-only badge** (L5), not a Home node state; nodes stay binary; reconciled `mvp_prd.md` (434/549/755) + `ui_design_system.md` (600); added a `CONTEXT.md` term.
- **Q17** **Spine renders in Konva** (single `<Stage>`) for cohesion with `StateGraph` → Konva eager on Home's critical path.
- **Q18** **Spine a11y via a parallel DOM-button overlay** (focus/keyboard/44px/aria); panels DOM; reduced-motion = static frame.
- **Q19** **Mobile = responsive divergence** (focused DOM card + compact Konva rail); laptop keeps the single-Stage spine + side panels. Reconciled `ui_design_system.md` (475/498).
- **Q20** **Mobile rail/seal detail = inline expand-in-place** (one at a time, reuses the card form); no bottom-sheet component.
- **Q21** **Mobile info priority** = compact habit + seal strips so the focused card's CTA is above the fold; region order unchanged.
- **Q22** **Loading = DOM skeletons first**, swap in the Konva spine/rail + preview on data-ready (no spinner).
- **Q23** **needsReview quiet note** copy = "Worth another look: {Lesson}." under the habit status line.
- **ADR-0001** `docs/adr/0001-konva-course-path-spine.md` records Q17/Q18 (+ the Q19 mobile consequence).
- **Remaining:** none open for the digest — full design tree + a thorough mobile/loading pass resolved (Q1–Q23). Next is the build (graph-node Home reskin of `src/pages/CoursePathPage.tsx`) per the digest.
- **Caveat (tooling):** never batch multiple `StrReplace` to the *same* file in one turn — parallel writes raced and clobbered edits this session (caught + repaired).

**Build readiness (assessed):** the Study Desk reskin is **buildable now, in parallel with Group C debugging**. It's a presentation-layer rewrite of `CoursePathPage.tsx` over already-stable typed contracts (`Course`/`Progress` via Zod; `loadCourseFromFirestore` / `loadProgressMap` / `loadStreak` / `loadEarnedMilestones`; `useAuth`) that the card version already proves; the loaders degrade gracefully (denied/missing → "no progress yet"). Build + verify against a **`/dev` fixture harness** (committed `fixtures/course-pattern-hitting-times.json` + mock progress/streak/milestones, no Firebase), mirroring `/dev/lesson`. Recommended: split into a presentational `StudyDesk(props)` + a thin data container so the build is **collision-free** with Group C (whole tree is uncommitted). **Only gated step:** the final live end-to-end check (emulator/seed/auth, blocked on the no-Java host) — last, not a blocker. Freeze the `Course`/`Progress` schema before starting.

## Live Firebase — repointed to brilliant-org (2026-06-23)

User enabled Blaze on **`brilliant-org`** (project #801582458333), NOT on the
day-old `brilliant-phht-dev/-prod` pair. Decision: **repoint the app's dev/live
target to `brilliant-org`** (Option B). A web app was created in brilliant-org
(`appId 1:801582458333:web:3e64f37f2c081802470234`).

**Edits made (all gitignored/untracked or local):**
- `.env.development` → brilliant-org web config + `VITE_USE_EMULATORS=false` (dev
  loop now hits the LIVE Blaze project).
- `.firebaserc` → `default` + `dev` = `brilliant-org`; `prod` left = `brilliant-phht-prod` (prod decision deferred; `.env.production` untouched).
- `scripts/seed-firestore.ts` → fallback projectId + usage comment → `brilliant-org`.
- `firebase.json` → functions **predeploy** changed from `npm --prefix "$RESOURCE_DIR" run build` to a **direct tsc** call: `"$RESOURCE_DIR/node_modules/.bin/tsc" --project "$RESOURCE_DIR"` (see npm-11 bug below).

**Two environment blockers found (both worked around):**
- *Agent-shell network:* the Firebase CLI's googleapis calls fail in the agent
  shell with "Premature close" (curl reaches googleapis fine; the user's own
  terminal works). So **all deploys/seed run from the user's terminal**, not the agent.
- *npm 11 + macOS bash 3.2:* `npm run` (e.g. the old predeploy `npm ... run build`,
  and `npm run seed`/`npm run dev`) dies with `/bin/sh: --: invalid option`. npm 11
  ignores `script-shell` here and feeds a `--` to the ancient `/bin/sh` (bash 3.2).
  Updating npm / `--force` / `script-shell=zsh` did NOT fix it. **Workaround: avoid
  `npm run` — call binaries directly** (predeploy now uses direct `tsc`; run seed/dev
  via `./node_modules/.bin/...`).

**Stale global CLI gotcha:** the user's global `firebase` (`/usr/local/bin/firebase`
+ nvm node-24 one) is OLD — caps at functions runtime node 20, so it rejects
`functions/package.json` engines `node: 22` ("unsupported … Valid choices … 20").
The repo's pinned `firebase-tools@15.22.1` supports node 22. **Use `npx firebase`**
(local pinned) for all CLI commands, not the global.

**Remaining manual steps (user's terminal + console) before the app works live:**
1. ✅ Functions deployed (`completeLesson` + `recordQualifyingAction` live, us-central1).
2. ✅ Firestore **rules + indexes deployed** (rules compiled + released; indexes empty).
3. ✅ `gcloud auth application-default login` — DONE.
4. ✅ Seed — DONE: `courses/course-pattern-hitting-times` + `lessons/lesson-pattern-hitting-times`
   written to prod (other 5 lessons skipped — no fixtures yet).
5. Console: enable **Google sign-in** for brilliant-org (Auth → Sign-in method) — **still pending.**
6. `./node_modules/.bin/vite` (dev server; only after 5, else auth sign-in fails).

**⚠ Never use `npx firebase` (or bare `firebase` if the alias isn't loaded):** `npx`/the default
PATH node resolve to the Hermes node **v22.23.0** → `node-fetch@2` `Premature close` on every
googleapis call (this bit the firestore deploy in terminal 3). Run firebase-tools under node
**v24.3.0**: the `firebase` alias (`.zshrc` line 45), or explicitly
`"$HOME/.nvm/versions/node/v24.3.0/bin/node" "$HOME/.nvm/versions/node/v24.3.0/bin/firebase" deploy ...`.
**Correction to the "agent-shell network" blocker below:** the firebase CLI *does* work from the
agent shell when invoked under node v24.3.0 (rules/indexes deployed that way this session) — the
"Premature close" was always the Node version, not a network block (gcloud + grpc seed also work here).

**Firestore provisioning (this session — was the seed blocker):** the seed failed with
`7 PERMISSION_DENIED: Cloud Firestore API ... disabled`. Fixed via `gcloud`: enabled
`firestore.googleapis.com` on brilliant-org, created the `(default)` database in **`nam5`**
(US multi-region, Firestore Native, free-tier — permanent, user-chosen), and repointed the
ADC quota project mvp-pose-detector → **brilliant-org**
(`gcloud auth application-default set-quota-project brilliant-org`, since the account lacked
`serviceusage.services.use` on mvp-pose-detector). Re-ran the seed → success.

For pure lesson work, `/dev/lesson` still bypasses Firebase entirely.

## Key Decisions

- **Self-contained beat views** in `src/lesson/beats/`, each composing `<BeatShell>`
  (region + `FeedbackStrip` + sticky action bar); `index.tsx` keys on
  `interaction.type` (+ `beatId` for the two `slider` beats). `LessonPlayer` owns
  only cross-beat state (`needsReview`); `key={beatId}` remounts.
- **HH is the primary engine pattern** (`patternOptions[0]`); HT is the contrast.
- **Pure modules** (`hintLadder`, `equationChecker`, `equationDiagnosis`,
  `stateTapHints`, engine) are node-Vitest-testable; React hooks wrap them.
- **Konva** only for `StateGraph` / `SimChart` / `BiasChart` (each `'use no memo'`);
  `konva/theme.ts` mirrors `tokens.css` (keep in sync); coin stream + tiles are DOM
  with `aria-live`. Engine stays pure (exact rationals, no floats).
- Types live in `src/engine/types.ts`, reused by `schema.ts`; JSON fixtures imported
  directly; hand-rolled dev router in `App.tsx`.

## What Worked / Didn't

- ✅ General `buildAutomaton` over hardcoded tables; rational arithmetic for exact
  golden tests; `validate-fixtures` engine↔fixture cross-check catches drift.
- ✅ e2e via pinned-port Vite + Playwright; the tap-only/reduced-motion projects
  prove both required accessibility paths complete.
- ❌ `timeout` absent on macOS → background + `curl`/`kill`. `tsx` in `/tmp` can't
  resolve `zod` → keep scripts under `scripts/`. Playwright sticky-bar hit-test
  quirk on short viewports → assert enabled then force-click (see `helpers.ts`).

## Next Steps (priority order)

1. **Resolve cycle-1 beat-audit proposals** (blocking the Stop Rule): redesign or
   waive `pattern-pick` (passive screen) and `guided-solve` (low agency), then
   continue/stop the loop (≤3 cycles). See `audits/proposals/cycle-1.md`.
2. **Instrument O4 (perf)** — feedback <100ms, no per-frame React state during
   drag/animation — currently `n/a`, blocks a clean Stop Rule.
3. **Review L2–L6** in `docs/future_ideas.md` (authoring-ready). If greenlit, before
   any new `equationTiles` beat, **generalize `equationDiagnosis.ts`** (HH-specific
   copy) or fall back to `equationChecker.ts`.
4. **Course-path / home UX grill** — align MVP course path with desired premium
   look; reconcile MVP roadmap stubs vs proposed-lessons slate.
5. **Tidy the working tree** (only when asked): commit the `AGENTS.md`/`cursor.md`
   line + ideation; consider removing the stray `docs/Hermes-Setup.dmg`.
6. **Group D (Phases 20–24)** — remaining lessons (L1/L3 fixtures), course-path
   polish, responsive/a11y pass (**flagship lesson done** — see session below;
   auth/course-path pages still pending), public deploy.

## Session (2026-06-23) — L2 ideation plan

- **Agent 1 deliverable:** `audits/ideation/plan-L2-penneys-game.md` — full 12-beat
  spec for **Penney's Game** (`lesson-penneys-game`): HH/HT opener tie, THH vs HHH
  7:1, win-prob recurrence (no `1+`), Conway aligner, paradox + non-transitivity,
  widgets (RaceTrack, OddsDial, AutocorrelationRuler cross, DominanceWheel,
  TournamentHeatmap), engine contract (`buildRaceAutomaton`, `penneyOdds`,
  `simulateRace`), `transferAttained` signal, cut line, golden tests.

## Session (2026-06-23) — L4 ideation plan

- **Agent 3 deliverable:** `audits/ideation/plan-L4-overlap-shortcut.md` — full
  12-beat spec for **The Overlap Shortcut** (`lesson-overlap-shortcut`): Σ2^L
  closed form, Li 1980 martingale proof, widgets (AutocorrelationRuler, SumTiles,
  GamblerLedger + fairness meter, TriangulationStrip), engine contract
  (`correlation`, `expectedWaitFair`, `gamblerLedger`), golden cross-check vs
  `buildAutomaton`, quant-interview `THTH=20` hook.

## Session (2026-06-23) — L5 ideation plan

- **Agent 4 deliverable:** `audits/ideation/plan-L5-states-streaks.md` — full
  12-beat spec for **States & Streaks** (`lesson-states-streaks`): consolidation
  after L1–L4 (not cold warm-up), `patternOptions: ["H"]`, `E[H]=2`, spaced
  retrieval grid (6/4/7:8/i(N−i)/Σ2^L), new widgets (RetrievalGrid,
  FirstSuccessTimeline, 2-node hero graph, TripletReveal), golden test for `H`.

## Session (2026-06-23) — L5 plan hardening review (Opus 4.8)

- **Reviewed + hardened `audits/ideation/plan-L5-states-streaks.md` in place** (inline
  `(review:)` tags + two appended sections: "Plan assessment" + "Implementation in
  the tech stack"). **Verdict: Solid-with-fixes.**
- **Math verified 4 ways → all = 2:** first-step `1/(1−½)`, geometric `Σk(½)^k=2.000000`
  / `1/p`, overlap `2¹` (engine-consistent: `HH=2²+2¹=6`, `HT=4`), Kac `1/π_H`; Monte
  Carlo ≈1.9988; engine golden `buildAutomaton('H',0.5).expectedTimes.E0===2` confirmed.
  Kac flagged: correct value but it's *recurrence* not *hitting* time (coincide only by
  memorylessness) → demote to footnote.
- **Reuse landmines found in real source** (plan over-claimed reuse): (1) `CoinSimBeat`
  **crashes on `H`** — `startReplay()` reads `overlapHighlights[0].on` but `H`'s is `[]`;
  (2) `SimChart` hardcodes `yLo=2` → `theory=2` collapses onto the axis; (3) `RecapBeat`
  is HH/HT-hardcoded (needs contrast pattern); (4) `phases.ts` is a flagship singleton —
  `phaseOf` throws on unknown beatIds (**blocks any non-flagship lesson render**);
  (5) `StateGraph` radius capped at 34 (hero needs a size prop); (6) no graded MCQ variant
  (beat 6 `prediction` won't grade).
- **Engine cost ≈ 1 test line**; `equationChecker` fully generic; `equationDiagnosis`
  only HH-specific in `classifyStateMistake` (graceful generic fallback — generalization
  is optional polish, not a blocker). Recommended **cut 12→7 beats**, grade the `E0` row
  (not trivial `E1=0`). Exact Zod given for `retrievalGrid` + `tripletReveal`.
- **No code changed** (markdown-only deliverable, per task contract).

## Session (2026-06-23) — L6 ideation plan

- **Agent 5 deliverable:** `audits/ideation/plan-L6-longer-patterns.md` — full
  12-beat spec for **Longer Patterns & Overlap** (`lesson-longer-patterns`):
  final transfer lesson on `THH` vs `HTH` (E=8 vs 10), prediction-only opener
  (no HH/HT recap), flagship skeleton + OverlapRuler (self), TermLedger/SumTiles,
  side-by-side 4-node mini-graphs, KMP border-sum math, detailed
  `transferAttained` logic (`maxHintLevel: 2` on failure-edge + equation-tiles).

## Session (2026-06-23) — L6 plan review/harden (Opus 4.8)

- **Deliverable:** appended "Plan assessment" + "Implementation in the tech stack"
  to `audits/ideation/plan-L6-longer-patterns.md` + inline `(review: …)` tags.
  **Verdict: Solid-with-fixes.** Math engine-verified exact: `THH` borders `{3}`→
  `2³=8`; `HTH` borders `{1,3}`→`2¹+2³=10`; HTH `E1` self-loop on H ≡ HT's (+2 source).
  No math corrections needed.
- **Key findings (all from real source):** (1) the "dualStateGraph" widget
  **already exists** — `OverlapBeat` renders one `StateGraph` per `patternOptions`
  with engine `overlapHighlights`; beat 11 is ~free. (2) **No active-pattern infra**:
  `LessonPlayer` builds one automaton from `patternOptions[0]`; graded beats only
  see THH. Fix = per-beat `pattern` field + split transfer beats per pattern. (3)
  `transferAttained` derivation is broken vs plumbing: `onCorrect` resets hint level
  to 0 and `hintLevelByBeat` is beat-keyed only → need a **high-water mark** +
  per-pattern split; CF `completeLesson` has no transfer inputs (thread a
  client-computed boolean). (4) **Biggest risk = `equationDiagnosis` HH-hardcoding**:
  `diagnoseRow` grading is generic but `classifyStateMistake`/`MISTAKE_HINTS` are HH
  copy, and `EquationTilesBeat` overrides authored L1/L2 hints with that copy → the
  plan's authored `byPattern` hints are dead and HTH learners get misleading nudges.
- **Coordination:** recommended L6 adopt L4's shared variants `autocorrelationRuler`
  + `sumTiles` (drop `overlapRuler`/`termLedger`) and consume L4's `correlation.ts`.

## Session (2026-06-23) — L2–L6 synthesis → `docs/future_ideas.md`

- Merged all five agent plans into **`docs/future_ideas.md`**: course arc L1–L6,
  per-lesson hooks/math/12-beat tables, signature visuals, interactable widget
  catalog, engine/schema roadmap, deferred post-L6 ideas, preserved mastery-threshold
  section. Detailed beat specs remain in `audits/ideation/plan-L{2..6}-*.md`.

## Session (2026-06-23) — L2–L6 plan hardening reviews (Opus 4.8 ×5, consolidated)

5 parallel Opus 4.8 max-fast agents each reviewed ONE plan (critique + tech-stack
implementation brainstorm) and updated it in place (inline `(review:)` tags + two
appended sections: "Plan assessment" + "Implementation in the tech stack"). L5/L6
have their own detailed entries above; this consolidates all five + cross-cutting
findings. **Verdicts: L4 Strong; L2/L3/L5/L6 Solid-with-fixes.**

**Math independently verified (exact-rational solve + engine + Monte Carlo):**

- **L2 corrected:** non-transitivity is a **4-cycle** (THH≻HHT≻HTT≻TTH≻THH), NOT a
  3-cycle (exhaustive search finds none); `HHT` beats `HTT` **2:1** (was "3:1");
  `THH` vs `HTT` is an **exact tie** (was "2:1"); max transient states **5** (was
  "≤7"); 3 golden-test signs were inverted. Headline numbers ✓ (HH/HT tie ½;
  HHH vs THH 7/8; HHH vs HHT tie; `bestBeater=(¬a₂)a₁a₂`).
- **L3 corrected:** golden `308/1000` → exact **`4/13`**; symmetry `P_i=P_{N−i}` is
  false → `P_i(reach)=ruin_{N−i}`; "48/52→69%" wrong (48/52 = p0.48 → **54%**; the
  ~69% ruin is p**0.40**); flagged `r=1` → 0/0 guard at p=0.5. Prose values ✓
  (fair N=4: P=[¼,½,¾], D=[3,4,3]; biased p0.4 i2: P=4/13, ruin=9/13, D=50/13).
- **L4 corrected:** draft border formula `{ℓ}∪{i:pi[i−1]>0}` **dropped the length-1
  border** (would give HTH=8, HHH=12) → replaced with the prefix-function border
  chain; fixed `correlation` slice bug; moved beats 5 & 8 off invalid `stateTap`.
  All Σ2^L values ✓ two ways vs engine E0 (HT4 HH6 THH8 HTH10 HHH14 HTHT20 die66=42);
  `E=2·CLN` confirmed.
- **L5:** all four derivations of `E[H]=2` ✓ (first-step, geometric, overlap 2¹, Kac);
  Kac flagged as *recurrence* not *hitting* time → demote to footnote.
- **L6:** engine-exact, **no math corrections** (THH borders {3}→8; HTH {1,3}→10;
  HTH's k=1 self-loop ≡ HT's, the +2).

**Cross-cutting blocker — the existing beats are far more HH/flagship-coupled than
the plans assumed.** Real reuse is only at the pure-module + Konva-primitive layer.
Prerequisites before ANY new lesson builds:

1. **`phases.ts` is a flagship singleton** — `phaseOf` throws on unknown beatIds →
   **blocks rendering any non-flagship lesson**. Needs per-lesson phase config. (L5)
2. **One-automaton assumption** — `LessonPlayer` builds a single automaton from
   `patternOptions[0]`; graded beats only ever see that pattern, and empty
   `patternOptions` crashes `buildAutomaton`. Multi-pattern lessons (L2 race, L6
   transfer) need a **per-beat `pattern` field + active-pattern infra**. (L2/L3/L6)
3. **`equationDiagnosis.ts` HH-hardcoding** — grading is generic but
   `classifyStateMistake`/`MISTAKE_HINTS` are HH copy AND `EquationTilesBeat`
   **overrides authored hints** with it, so authored `byPattern` hints are **dead**
   for non-HH → learners get misleading nudges. Generalize or route non-HH to
   authored hints. (L2/L6; L5 says generic fallback is graceful enough)
4. **`probToRational` grades only `'1/2'`** → equation-tile beats are locked to the
   fair coin; biased-walk tiles need new prob tile values. (L3)
5. **Konva primitives need params:** `SimChart` hardcodes `yLo=2` (breaks theory=2,
   and can't draw a [0,1] win-rate — L2 needs a linear `RateChart`); `StateGraph`
   radius capped at 34 + linear single-absorber layout (L5 hero, L2 dual-absorber).
6. **`CoinSimBeat` crashes on `H`** (empty `overlapHighlights`); **`RecapBeat`** is
   HH/HT-hardcoded. (L5)

**Engine/schema consensus:** export `solveLinearSystem` + `prefixFunction` (borders);
new modules `race.ts` (L2), `walk.ts` (L3), `correlation.ts` (L4, **shared by L6**);
L5/L6 need ≈0 new engine (reuse `buildAutomaton('H')`, THH/HTH). `InteractionSchema`
is a **closed union** — every widget = a new variant; **`TileSchema` cannot express
Σ2^L or biased probs**, so those are separate variants (`sumTiles`), not
`equationTiles`. **Share `autocorrelationRuler` + `sumTiles` across L4 & L6** (drop
`overlapRuler`/`termLedger` dupes); `OverlapBeat` already gives L6 its side-by-side
StateGraphs nearly free. **`transferAttained`** (L6): cap via `maxHintLevel:2`, split
transfer beats per pattern, persist a hint **high-water mark** (`onCorrect` currently
resets level→0), thread a client-computed boolean through `completeLesson` into the
existing `ProgressDerived.transferAttained`.

**No code touched** — all deliverables are the updated `plan-L{2..6}-*.md` files.

## Session (2026-06-23) — Firebase CLI login failure diagnosed

- **Symptom (terminal 25):** every `firebase login` / `--reauth` / pasted code fails
  with "Your credentials are no longer valid" + "Unable to authenticate using the
  provided code." `firebase emulators:start` also failed (auth + port 8080 taken).
- **Root cause (NOT auth):** Node ≥22.23.0 / ≥24.17.0 socket-security fix breaks the
  unmaintained `node-fetch@2.7.0` bundled in firebase-tools 15.22.1 →
  `ERR_STREAM_PREMATURE_CLOSE` on the OAuth token-exchange POST; CLI mislabels it as
  invalid credentials. Refs: firebase-tools #8304, #10692. Clock verified fine (~11ms).
- **Env:** active `node` = `~/.local/bin/node` **v22.23.0** (broken); also homebrew
  **v26.3.1** (broken); nvm **v24.3.0** (✅ safe, pre-24.17.0). npm is irrelevant —
  **downgrading npm does NOT help**; bumping firebase-tools won't either (still pins node-fetch@2).
- **Why `nvm use 24` didn't fix it:** the Hermes Agent (`~/.zprofile` + `.zshrc` line 36)
  forces `~/.local/bin/node` → `~/.hermes/node/bin/node` (v22.23.0) to the front of PATH,
  so firebase's `#!/usr/bin/env node` shebang kept picking the broken Hermes node even after
  `nvm use 24` (proven by `firebase-debug.log`: ran under v22.23.0, `Premature close` on the
  oauth2/token POST). Repro confirmed: node-fetch@2 POST → `Premature close` on v22.23.0,
  `200/401 OK` on v24.3.0.
- **FIX APPLIED (this session):** added an alias to `~/.zshrc` (an alias beats PATH lookup,
  so Hermes can't override it):
  `alias firebase="$HOME/.nvm/versions/node/v24.3.0/bin/node $HOME/.nvm/versions/node/v24.3.0/bin/firebase"`.
  Verified: `whence -v firebase` resolves to the v24.3.0 node; `firebase --version` → 15.22.1.
  **User must `source ~/.zshrc` or open a new terminal**, then `firebase login` works.
  Caveat: don't move firebase onto Node ≥22.23 / ≥24.17 until firebase-tools drops node-fetch@2.

## Session (2026-06-23) — Mobile-screen a11y/responsive pass (flagship lesson)

Audited (3 read-only Opus sub-agents) + fixed the flagship lesson for mobile
(320–414px; verified on Pixel 5). Foundation was already mobile-first; fixes:

- **Overlap half-width bug (High):** `OverlapBeat` extracted an `OverlapColumn`
  that measures its own `.canvas-frame`, so the two state graphs fill their frames
  when columns stack on mobile (were rendering at ~½ width with overlapping nodes).
- **InfoTip viewport overflow (caught during verify, ~69px h-scroll at ≤393px):**
  equation-tiles tooltips now position via a viewport-clamped absolute `left`
  (computed for open *and* closed bubbles, since the hidden bubble still occupied
  layout) instead of a centered `translateX`.
- Action bar `flex-wrap` + bottom `safe-area-inset`; `.feedback__retry` 36→44px;
  `.lesson` `100dvh` (100vh fallback); reduced-motion now honored by the SimChart
  sweep (renders final frame) + PhaseRail scroll (`behavior:auto`);
  `viewport-fit=cover` + topbar `safe-area-inset-top`; `.topbar__back` focus ring;
  flex-wrap safety on `.tap-choices`/`.compare`/`.recap__trio` + StateGraph node
  spacing for n≥5; canvas measuring ref moved onto `.canvas-frame`
  (CoinSim/StateTap/Overlap, kills a ~2px clip); 11→12px micro-labels; recap
  verdict `clamp(20px,6vw,26px)`.
- **Decision:** "Try bias" chip kept as a passive status indicator — the
  bias-sandbox beat is reached via normal linear advance (no jump-to-beat nav),
  so the chip needs no touch-target/interactivity change.
- **Verify:** lint clean, `tsc -b`+build green, 75 vitest, `validate` green, **e2e
  6/6** (chromium/mobile/reduced-motion). A temporary mobile spec asserted no
  horizontal scroll on every beat + overlap canvases fill their frames, then was
  removed. Touched: `OverlapBeat`, `EquationTilesBeat`, `TheorySimChartBeat`,
  `PhaseRail`, `LessonPlayer`, `konva/StateGraph`, `CoinSimBeat`, `StateTapBeat`,
  `index.html`, `styles/app.css`.

## Quick Reference

- Docs: `docs/mvp_prd.md`, `docs/core_instructions.md`, `docs/ui_design_system.md`,
  `docs/home-study-desk.md` (Home/dashboard digest), `docs/beat-audit-rubric.md`,
  `docs/proposed-lessons.md`, `docs/future_ideas.md`
- Engine: `src/engine/{automaton,simulate,types,index}.ts`
- Content: `src/content/{schema,loader,firestoreLoader}.ts`, `fixtures/` (lesson +
  course), `scripts/{validate-fixtures,seed-firestore}.ts`
- Lesson shell: `src/lesson/{LessonPlayer,BeatShell,FeedbackStrip,CoinStream,PhaseRail}.tsx`,
  `{feedback,hintLadder,phases,useReducedMotion}.ts`
- Beats: `src/lesson/beats/*` (`index.tsx` dispatcher, `types.ts`)
- Pure graders: `equationChecker.ts`, `equationDiagnosis.ts`, `stateTapHints.ts`
- Konva: `src/lesson/konva/{StateGraph,SimChart,BiasChart,theme,useElementWidth}.*`
- e2e: `e2e/*` + `playwright.config.ts` · Audit: `audits/*`
- Commands: `npm run validate` · `npm run seed` · `npx vitest run` · `npm run lint`
  · `npm run build` · `npm run e2e`
