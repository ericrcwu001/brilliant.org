# HANDOFF

## Goal

Build a Brilliant-style learn-by-doing web app whose flagship lesson teaches
**pattern hitting times** for coin flips (why `E[HH]=6` but `E[HT]=4`). Work is
sequenced by the phased plan in `docs/mvp_prd.md` (Groups A–D). This handoff
covers the completion of **Group A (Phases 0–3)** — the local-only foundation.

Key constraints (from `docs/mvp_prd.md` + `AGENTS.md`):

- **Group A is local-only**: NO Firebase, auth, persistence, or Cloud Functions.
- Match the visual identity in `docs/ui_design_system.md` ("Clean Mathematical
  Notebook", IBM Plex typography, design tokens, sticky action bar).
- Keep the KMP engine **pure and dependency-free**.
- Surgical changes, simplicity first, no speculative scope.

## Current Progress

**Group A (Phases 0–3) is COMPLETE.** All programmatic checks pass:

- `npm run validate` → green (fixtures valid + engine recurrences match tiles)
- `npx vitest run` → **21 tests passing across 3 files**
- `npm run build` → green (`tsc -b && vite build`)
- `npm run lint` → clean

Phase-by-phase status (PRD "Done-when"):

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
  - `src/lesson/phases.ts` + `PhaseRail.tsx` → 4-segment rail
    (Bet/Explore/Model/Prove), `Model · n/4` step counter, `bias-sandbox` is
    off-rail. `src/lesson/LessonPlayer.tsx` does linear Continue navigation.
  - Dev-only route `/dev/lesson` wired in `src/App.tsx` (Vite SPA fallback).

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

## Key Decisions

- Engine is pure/dependency-free; all types live in `src/engine/types.ts` and
  are reused by `src/content/schema.ts`.
- JSON fixtures imported directly (`resolveJsonModule: true` in
  `tsconfig.app.json`).
- Vitest runs in a `node` environment (`vitest.config.ts`,
  `include: src/**/*.test.ts`).
- Minimal hand-rolled dev router in `App.tsx` (no router dep) for `/dev/lesson`.
- Design tokens in `src/styles/tokens.css`; layout in `src/styles/app.css`.

## Next Steps (priority order)

1. **Manual eyeball check (the one remaining human step for Phase 3)**: run
   `npm run dev`, open `http://localhost:5173/dev/lesson`, click `Continue`
   through all 11 beats and confirm prompts + phase rail advance correctly.
2. **Initial git commit**: repo has NO commits yet and everything is untracked.
   Create the first commit for the Group A baseline (only when the user asks).
3. **Begin Group B** per `docs/mvp_prd.md` — the next phases (real beat
   renderers: Konva state graph, coin stream, guided-solve tiles, simulation
   chart). Remember the `'use no memo'` opt-out for any file mounting a Konva
   `<Stage>`.

## Quick Reference

- PRD: `docs/mvp_prd.md` (Implementation Phases + Data Contracts Appendix)
- Design: `docs/ui_design_system.md`
- Engine: `src/engine/automaton.ts`, `src/engine/types.ts`
- Content: `src/content/schema.ts`, `src/content/loader.ts`, `fixtures/`
- Lesson UI: `src/lesson/*`
- Validate: `npm run validate` · Tests: `npx vitest run` · Build: `npm run build`
