# HANDOFF

## Goal

Build a Brilliant-style learn-by-doing web app whose flagship lesson teaches
**pattern hitting times** for coin flips (why `E[HH]=6` but `E[HT]=4`). Work is
sequenced by `docs/mvp_prd.md` (Groups A–D). The **local-only flagship lesson
(Groups A + B) is complete and hardened**; two follow-on workstreams are now
live: a **beat-audit quality loop** and **next-lesson design (L4–L6)**.

Key constraints (`docs/mvp_prd.md`, `docs/core_instructions.md`, `AGENTS.md`):

- **Groups A & B are local-only**: NO Firebase, auth, persistence, or Cloud
  Functions. Feedback is computed client-side from the engine; interaction state
  lives in component/local state.
- Match `docs/ui_design_system.md` ("Clean Mathematical Notebook", IBM Plex,
  design tokens, sticky action bar). Keep the KMP engine **pure/dependency-free**.
- Surgical changes, simplicity first, no speculative scope.

## Current State (snapshot)

- **Git:** branch `main`, up to date with `origin/main` (remote exists). **3
  commits** (HEAD `a958010` added Playwright + e2e, the diagnosis/hint modules,
  `BiasChart`, the beat-audit infra, and a tree of `.agents/skills/firebase-*`).
- **Working tree (uncommitted):** `AGENTS.md` + `cursor.md` (added the "update
  HANDOFF.md each response" line); **untracked** `audits/ideation/agent-{1..5}-*.md`
  and `docs/proposed-lessons.md` (the L4–L6 proposal).
- **Verification (re-run this session, all green):**
  - `npm run validate` → fixtures valid + engine recurrences match HH tiles.
  - `npx vitest run` → **75 tests across 10 files** (incl. `equationDiagnosis`
    + `stateTapHints` unit **and** `*.fuzz.test.ts` property tests).
  - `npm run lint` → clean. `npm run build` → green (199 modules; `dist` JS
    654 kB / gzip 203 kB — Konva trips the 500 kB advisory, a warning not error).
  - `npm run e2e` (Playwright, 3 projects: chromium / mobile-tap-only / reduced-
    motion) — **not re-run here**; recorded green in the cycle-1 audit.
- **Stray:** `docs/Hermes-Setup.dmg` is committed (binary, likely unintended).

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

## Next-Lesson Ideation — L4–L6 proposed (untracked)

5 parallel research agents (`audits/ideation/agent-{1..5}-*.md`) converged, synthesized
in `docs/proposed-lessons.md`, on the next three lessons — each varies exactly one
variable from the base course:

- **L4 Penney's Game** (vary the *question*: who's first ≠ how long; non-transitive,
  second-mover edge; `THH≻HHH` at 7/8).
- **L5 Gambler's Ruin** (vary the *arena*: random walk between two walls;
  probability `i/N` + duration `i(N−i)`; the house-edge cliff).
- **L6 Overlap Shortcut** (vary the *method*: `E=Σ2^L` via a fair-casino martingale;
  re-derives 6/4/8/10/14).

New pure engine proposed (`race.ts`, `walk.ts`, `correlation.ts`); new widgets
(RaceTrack, WalkBoard, AutocorrelationRuler, GamblerLedger, DominanceWheel, SumTiles,
DistributionHistogram). Nothing built yet — design only.

## Key Decisions

- **Self-contained beat views** in `src/lesson/beats/`, each composing `<BeatShell>`
  (region + `FeedbackStrip` + sticky action bar); `index.tsx` keys on
  `interaction.type` (+ `beatId` for the two `slider` beats). `LessonPlayer` owns
  only cross-beat state (`LessonState`, `needsReview`); `key={beatId}` remounts.
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
3. **Decide on L4–L6** from `docs/proposed-lessons.md`. If greenlit, commit the
   ideation and, before any new `equationTiles` beat, **generalize
   `equationDiagnosis.ts`** (HH-specific copy) or fall back to `equationChecker.ts`.
4. **Tidy the working tree** (only when asked): commit the `AGENTS.md`/`cursor.md`
   line + ideation; consider removing the stray `docs/Hermes-Setup.dmg`.
5. **Manual eyeball pass** remains the human step (e2e covers the tap-only/reduced-
   motion happy path, not visual polish).
6. **Group C (Firebase)** still unstarted: Auth/onboarding, Firestore seed+read,
   snapshot persistence (`LessonState` + `hintLevelByBeat` are serialize-ready),
   Cloud Functions, streaks/milestones, rules + App Check, analytics.
   - **Open question (unresolved):** `open-bet` is qualitative, so
     `LessonState.initialPrediction` is a **string** used only by the recap, but the
     analytics spec assumes a **number** (`predictionDeltaInitial`). The numeric
     guess only appears later via the slider `finalPrediction`. Before wiring derived
     fields, decide: (a) keep the bet qualitative and base the delta on
     `finalPrediction`, or (b) also capture a numeric opening estimate.

## Quick Reference

- Docs: `docs/mvp_prd.md`, `docs/core_instructions.md`, `docs/ui_design_system.md`,
  `docs/beat-audit-rubric.md`, `docs/proposed-lessons.md`, `docs/future_ideas.md`
- Engine: `src/engine/{automaton,simulate,types,index}.ts`
- Content: `src/content/{schema,loader}.ts`, `fixtures/`, `scripts/validate-fixtures.ts`
- Lesson shell: `src/lesson/{LessonPlayer,BeatShell,FeedbackStrip,CoinStream,PhaseRail}.tsx`,
  `{feedback,hintLadder,phases,useReducedMotion}.ts`
- Beats: `src/lesson/beats/*` (`index.tsx` dispatcher, `types.ts`)
- Pure graders: `equationChecker.ts`, `equationDiagnosis.ts`, `stateTapHints.ts`
- Konva: `src/lesson/konva/{StateGraph,SimChart,BiasChart,theme,useElementWidth}.*`
- e2e: `e2e/*` + `playwright.config.ts` · Audit: `audits/*`
- Commands: `npm run validate` · `npx vitest run` · `npm run lint` · `npm run build`
  · `npm run e2e`
