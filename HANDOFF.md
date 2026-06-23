# HANDOFF

## Goal

Build a Brilliant-style learn-by-doing web app whose flagship lesson teaches
**pattern hitting times** for coin flips (why `E[HH]=6` but `E[HT]=4`). Work is
sequenced by the phased plan in `docs/mvp_prd.md` (Groups A–D). This handoff
covers the completion of **Group A (Phases 0–3)** and **Group B (Phases 4–12)**
— the full local-only flagship lesson.

Key constraints (from `docs/mvp_prd.md` + `AGENTS.md`):

- **Groups A & B are local-only**: NO Firebase, auth, persistence, or Cloud
  Functions. All feedback is computed client-side from the engine; interaction
  state lives in component/local state for now.
- Match the visual identity in `docs/ui_design_system.md` ("Clean Mathematical
  Notebook", IBM Plex typography, design tokens, sticky action bar).
- Keep the KMP engine **pure and dependency-free**.
- Surgical changes, simplicity first, no speculative scope.

## Current Progress

**Group B (Phases 4–12) is COMPLETE.** The full flagship lesson is completable
end-to-end locally at `/dev/lesson`. All programmatic checks pass:

- `npm run validate` → green (fixtures valid + engine recurrences match tiles)
- `npx vitest run` → **47 tests passing across 6 files**
- `npm run build` → green (`tsc -b && vite build`; Konva pushes the bundle past
  the 500 kB advisory — a warning, not an error)
- `npm run lint` → clean

Group B phase-by-phase status (PRD "Done-when"):

- **Phase 4 — Feedback + hint-ladder primitive ✅**
  - Pure state machine `src/lesson/hintLadder.ts` (escalate on wrong, reset on
    success/Try-again, `maxHintLevel` cap, `needsReview` rule). React glue in
    `src/lesson/feedback.ts` (`useHintLadder`, `resolveFeedback`) and the strip
    in `src/lesson/FeedbackStrip.tsx`. `src/lesson/BeatShell.tsx` lays out
    region + strip + sticky action bar. **10 ladder tests** verify escalation,
    cap-of-2-before-reveal, and `needsReview` thresholds.
- **Phase 5 — `prediction` (open bet) ✅** — `PredictionBeat`; trap options;
  stores `initialPrediction`; shows authored feedback.
- **Phase 6 — `coinSim` state graph + simulation ✅** — Konva `StateGraph`
  hero (node pulse + traveling-dash edge; self-loop arcs above, reset curves
  below), DOM `CoinStream` with active prefix-state chip + `aria-live`; single
  + batch flip; gate (`≥3 flips && ≥1 prefix change`) swaps `Flip → Continue`;
  scripted near-miss `guidedReplay`; reduced-motion lands immediately. Pure
  `src/engine/simulate.ts` (**4 convergence tests**).
- **Phase 7 — `stateTap` (failure edge) ✅** — `StateTapBeat` checks taps
  against the engine, emphasizes overlap edges at hint level ≥2, honors the
  `maxHintLevel` cap.
- **Phase 8 — `equationTiles` builder + checker ✅** — pure
  `src/lesson/equationChecker.ts` (canonical form; additive reorder accepted;
  fixed prob tokens; implicit coeff 1; full row required; reasons
  incomplete/wrong-var/wrong-coeff/wrong-constant/malformed) with **10 tests**;
  tap-to-place `EquationTilesBeat` (44px slots, level-2 glow, level-3 reveal).
- **Phase 9 — `slider` (refine prediction) ✅** — `SliderBeat` number-line;
  stores `finalPrediction` + `theoreticalValue`; locked `--mark` marker.
- **Phase 10 — `substitution` (guided solve) ✅** — `SubstitutionBeat`
  tap-to-advance stepper + "Show algebra" single-reveal fallback.
- **Phase 11 — `theorySimChart` ✅** — Konva `SimChart` (theory / empirical /
  prediction series); `Run simulation` batches converge the empirical mean;
  stores `empiricalMean` + `simRuns`.
- **Phase 12 — `overlap`, `bias-sandbox`, `recap` ✅** — side-by-side
  mini-graphs (`OverlapBeat`); Extension `BiasSandboxBeat` (live `p` recompute,
  never blocks / never `needsReview`); `RecapBeat` summarizing
  prediction/theory/sim/overlap + milestone stamp + review note.
- Also built `PatternPickBeat` (beat 2 compare cards) — not in the Phase 4–12
  list but required for end-to-end completion.

**Group A (Phases 0–3) remains COMPLETE.** Phase-by-phase status (PRD
"Done-when"):

- **Phase 0 — Scaffold & tooling ✅**
  - Vite + React 19 + TS. Pinned `konva@10.3.0` + `react-konva@19.2.5`.
  - React Compiler enabled globally via Babel preset; per-file opt-out
    `'use no memo'` documented in `vite.config.ts` for Konva stage files.
  - Prettier (`.prettierrc`), Vitest (`vitest.config.ts`), ESLint +
    `eslint-config-prettier`, `.env.example`, `.gitignore`.
  - Scripts in `package.json`: `dev`, `build`, `test`, `test:watch`, `lint`,
    `format`, `format:check`, `validate`.
- **Phase 1 — Pure KMP engine ✅**
  - `buildAutomaton(pattern, p)` in `src/engine/automaton.ts` returns the full
    typed `Automaton` (states, transitions, recurrences, expectedTimes,
    substitutionSteps, overlapHighlights). Exact rational arithmetic + Gaussian
    elimination (no floats).
  - Golden tests pass: `E[HH]=6`, `E[HT]=4`, `E[THH]=8`, `E[HTH]=10`; transition
    kinds (advance/self-loop/reset) match PRD.
- **Phase 2 — Schema, types & golden fixture ✅**
  - `src/content/schema.ts`: Zod schemas + inferred types for
    Lesson/Beat/Interaction/Feedback/Snapshot/CanonicalRecurrence.
  - Fixtures: `fixtures/lesson-pattern-hitting-times.json` (11 beats),
    `fixtures/example-snapshot.json`, `fixtures/canonical.example.json`.
  - `scripts/validate-fixtures.ts` validates fixtures AND cross-checks engine
    recurrences against fixture `equationTiles` targets.
- **Phase 3 — Content loader + beat renderer registry (local) ✅**
  - `src/content/loader.ts` → `loadFlagshipLesson()` reads + validates fixture.
  - `src/lesson/renderers.tsx` → registry keyed by `interaction.type` with stub
    renderers; exported as `BeatInteraction` component.
  - `src/lesson/phases.ts` + `PhaseRail.tsx` → **scrollable per-beat progress
    rail**: one segment per beat (10 rail beats; `bias-sandbox` is off-rail),
    color-grouped by phase tint (Bet=quill, Explore=heads, Model=tails,
    Prove=correct), complete/current/upcoming states, hidden scrollbar,
    auto-scrolls current into view. `getRail()` + `biasChipState()` are the API.
  - `src/lesson/LessonPlayer.tsx` does linear Continue navigation and renders
    the off-rail "Try bias" chip (available in Prove, active on `bias-sandbox`).
  - Dev-only route `/dev/lesson` wired in `src/App.tsx` (Vite SPA fallback).
  - **Responsive** (`docs/ui_design_system.md`): mobile-first, single laptop
    breakpoint at 768px. Page background is seamless paper-grain (SVG
    feTurbulence noise on `--paper-0`); the old full-page graph-paper grid and
    560px notebook frame are gone. Laptop centers a `--page-max` (960px) column
    with top/action bars aligned to it, +25% type bump, `.region` min-height
    55vh, bumped vertical spacing, and button/rail hover affordances. Tokens
    `--bp-laptop` / `--page-max` live in `src/styles/tokens.css`.

## What Worked

- **General KMP build over hardcoded tables**: PRD allowed hardcoding HH/HT/THH/
  HTH, but a single general `buildAutomaton` was simpler and correct. UI still
  only exposes curated patterns.
- **Rational arithmetic + Gaussian elimination** for exact expected times —
  avoids float drift, makes golden tests exact.
- **Validation cross-check**: `validate-fixtures.ts` asserting engine output ==
  fixture `equationTiles` caught content/engine drift early.
- **Smoke-testing dev server** via background `npm run dev` + `curl` + `kill`
  (since `timeout` is unavailable on macOS).

## What Didn't Work (and fixes)

- `timeout` command → not on macOS. Fix: background process + `curl` + `kill`.
- `tsx` script in `/tmp` couldn't resolve `zod`. Fix: keep scripts under
  `scripts/` so node module resolution works.
- ESLint `react-refresh/only-export-components` in `renderers.tsx` (exported a
  non-component fn). Fix: refactored to a `BeatInteraction` React component.

## Key Decisions (Group B)

- **Self-contained beat views over a central controller.** Each beat is its own
  component in `src/lesson/beats/` that renders region + feedback + action bar
  via the shared `<BeatShell>`. The dispatcher `beats/index.tsx` keys on
  `interaction.type` (and on `beatId` for the two `slider` beats). The player
  (`LessonPlayer.tsx`) owns only cross-beat state: current index, `needsReview`,
  and `LessonState` (`initialPrediction`, `finalPrediction`, `theoreticalValue`,
  `empiricalMean`, `simRuns`) read by the recap. `key={beatId}` remounts each
  beat so per-beat interaction/hint state resets on navigation.
- **HH is the primary engine pattern** for the flagship (`patternOptions[0]`);
  HT is the side-by-side contrast (overlap + bias beats build it via
  `buildAutomaton`). This matches the HH-centric fixture targets. `BeatProps`
  carries both `pattern` and `patternOptions`.
- **Hint ladder is a pure module** (`hintLadder.ts`) so it is unit-testable in
  the node Vitest env; `useHintLadder` wraps it. `needsReview` is reported up to
  the player via a callback (`reportNeedsReview`).
- **Konva scope**: only the state graph (`konva/StateGraph.tsx`) and the
  simulation chart (`konva/SimChart.tsx`). Both start with `'use no memo'`. The
  coin stream is **DOM** (`CoinStream.tsx`) with an `aria-live` summary — the
  accessible equivalent of the canvas motion. Equation tiles/slots are DOM.
- **Canvas palette mirror**: Konva can't read CSS vars, so `konva/theme.ts`
  mirrors the relevant `tokens.css` values — keep them in sync.
- **Engine stays pure**; added `src/engine/simulate.ts` (`nextStateOf`,
  `flipsToAbsorption`, `empiricalMean`, seedable `mulberry32`).

## Key Decisions (Group A)

- Engine is pure/dependency-free; all types live in `src/engine/types.ts` and
  are reused by `src/content/schema.ts`.
- JSON fixtures imported directly (`resolveJsonModule: true` in
  `tsconfig.app.json`).
- Vitest runs in a `node` environment (`vitest.config.ts`,
  `include: src/**/*.test.ts`).
- Minimal hand-rolled dev router in `App.tsx` (no router dep) for `/dev/lesson`.
- Design tokens in `src/styles/tokens.css`; layout in `src/styles/app.css`.

## Next Steps (priority order)

1. **Manual eyeball check (the remaining human step for Group B)**: run
   `npm run dev`, open `/dev/lesson`, and play the full lesson — confirm the
   state graph pulses + the active edge travels on each flip, the near-miss
   replay gates `Continue`, the equation tiles grade correctly (build the HH
   recurrences, reorder terms, try a wrong coeff/var), the empirical mean
   converges on the chart, and the recap shows all four summary values. Repeat
   with OS reduced-motion on and using tap-only (no drag).
2. **Initial git commit**: repo has NO commits yet and everything is untracked.
   Create the first commit for the Group A + B baseline (only when the user
   asks).
3. **Begin Group C** per `docs/mvp_prd.md` — Firebase Auth + onboarding,
   Firestore content seeding/runtime read, snapshot persistence + restore (the
   `LessonState` + `hintLevelByBeat` shapes are ready to serialize), Cloud
   Functions for completion/mastery/unlock, streaks/milestones, security rules +
   App Check, analytics.
   - **Open question — opening-bet field is qualitative, analytics expects
     numeric.** The `open-bet` beat is an ungraded "which wait is longer" guess,
     so `LessonState.initialPrediction` is a **string** (e.g. "Waiting for HH
     takes longer") and is consumed only by `RecapBeat` as a narrative bookend —
     it drives no computation. But the analytics spec in `docs/mvp_prd.md`
     ("Derived learning fields", e.g. `initialPrediction: 4` and
     `predictionDeltaInitial = |initialPrediction − theoreticalValue|`) assumes a
     **number**. The numeric "how many flips" guess is only captured later by the
     `refine-prediction` slider as `finalPrediction` (number). Before wiring
     analytics/derived fields, decide one of: (a) treat the qualitative bet and
     the numeric guess as two distinct fields (rename/keep `initialPrediction`
     qualitative; base `predictionDeltaInitial` on `finalPrediction`), or (b) also
     capture a numeric estimate at the opening bet. This also affects the
     `predictionDeltaInitial` KPI ("median should shrink between opening bet and
     locked prediction"), which needs two comparable numbers to be meaningful.

## Quick Reference

- PRD: `docs/mvp_prd.md` (Implementation Phases + Data Contracts Appendix)
- Design: `docs/ui_design_system.md`
- Engine: `src/engine/automaton.ts`, `src/engine/types.ts`,
  `src/engine/simulate.ts`
- Content: `src/content/schema.ts`, `src/content/loader.ts`, `fixtures/`
- Lesson shell: `src/lesson/LessonPlayer.tsx`, `BeatShell.tsx`,
  `FeedbackStrip.tsx`, `feedback.ts`, `hintLadder.ts`, `CoinStream.tsx`
- Beats: `src/lesson/beats/*` (one component per interaction, `index.tsx`
  dispatcher, `types.ts` `BeatProps`/`LessonState`)
- Konva: `src/lesson/konva/*` (`StateGraph.tsx`, `SimChart.tsx`, `theme.ts`,
  `useElementWidth.ts`)
- Checker: `src/lesson/equationChecker.ts`
- Validate: `npm run validate` · Tests: `npx vitest run` · Build: `npm run build`
