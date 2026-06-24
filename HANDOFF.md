# HANDOFF

Orientation doc for a fresh context. Session-by-session narration lives in git
history + the `docs/`/`audits/` files; this file keeps only what's needed going forward.

## Goal & Constraints

Brilliant-style learn-by-doing web app. Flagship lesson teaches **pattern hitting
times** for coin flips (why `E[HH]=6` but `E[HT]=4`). Sequenced by `docs/mvp_prd.md`
(Groups A–D).

- Match `docs/ui_design_system.md` ("Clean Mathematical Notebook", IBM Plex, design
  tokens, sticky action bar).
- KMP engine stays **pure / dependency-free** (exact rational arithmetic, no floats).
- Surgical changes, simplicity first, no speculative scope (`AGENTS.md`).

## Current State

- **Live:** deployed to Firebase Hosting → https://brilliant-org.web.app (SPA, title
  "Pattern Hitting Times"). Project **brilliant-org** (#801582458333), Blaze enabled,
  Firestore `(default)` db in `nam5`.
- **Built:** **All 7 lessons — L0 + L1–L6 — built in the working tree** (Groups A & B +
  the remaining-lessons build per `docs/build-brief-remaining-lessons.md`). Group C Firebase
  backend (Phases 13–19: auth/onboarding, Firestore loader, snapshots, Cloud Functions,
  streaks/milestones, rules, App Check seam, analytics) complete. Study Desk graph-node
  Home built + browser-verified on `/dev/home`.
- **Remaining lessons L0 + L2–L6 — DONE this session** (build-brief waves 0–3): Wave-0
  shared contracts frozen (schema variants `raceSim`/`walkBoard`/`dominanceWheel`/`gamblerLedger`/
  `sumTiles`/`autocorrelationRuler`/`retrievalGrid`/`tripletReveal` + `pattern`/`hero`/ordering/
  `interviewNote` fields + `gamblersFallacy`/`legendLead`; generalized `validate-fixtures` with
  CI-gated inclusivity asserts; engine exports `prefixFunction`/`solveLinearSystem`/rational
  toolkit; eager-automaton guard; `/dev/lesson/:lessonId` static-import-map route; `SimChart`
  linear `[0,1]` mode; `EquationTilesBeat` `hintCapOverride`+`assist` re-prefill + chrome
  reduction + `LessonPlayer` adaptive driver (no capped beat dead-ends); `theme.ts` hero tokens;
  L2–L6 `phases.ts` configs; `DiagnosticGate` at course entry; `src/progress/recommend.ts`
  live-snapshot weak-node reader; landing subline). Engines `race`/`walk`(WalkModel)/`correlation`
  + goldens. Widgets: shared (RetrievalGrid/SumTiles/AutocorrelationRuler/TripletReveal) + heroes
  (RaceSim/DominanceWheel/WalkBoard/GamblerLedger). Fixtures L2–L6 authored + gate-passing;
  course node `built:true` + de-gatekept persona/subline; **RecapBeat generic branch** (non-flagship
  lessons) + **EquationTilesBeat per-beat namespaced** tile state (fixed L3 prob/duration
  cross-contamination). Decisions: L0 stays 5-beat `unlocks:null` no-milestone; `mastered` frozen
  at first completion (recommender reads live snapshot); Overlap-Shortcut canonical-last.
- **L1 inclusive redesign (full two-track) — DONE in the working tree** (per
  `docs/l1-inclusive-redesign-spec.md`): schema additions (byOption feedback, `primer`/`mcq`
  interactions, `track`/`density`/`faded`/`optional`, snapshot `maxHintLevelByBeat`, derived
  `mastered`); de-hardcoded `equationDiagnosis`/`EquationTilesBeat` copy → fixture `copy`;
  per-option `open-bet`; `StateGraph` dual-label + dyna-link; `FirstSuccessTimeline`;
  interactive (Track-A) `OverlapBeat`; segmented Track-A `CoinSimBeat` (+H guard, gambler's
  note); staged/faded `EquationTilesBeat`; `PrimerBeat`/`McqBeat`; Track-A primers +
  `name-the-overlap` + `ground-ev` (all `required:false track:'A'`, off-rail); `LessonPlayer`
  track filtering + density; `DiagnosticGate` (writes `track` to `progress/{courseId}`);
  **L0** `lesson-first-heads` (optional course node); per-lesson `phases.ts`; mastery signal
  (`mastered` via hint high-water mark → done-note + RecapBeat belief-update). Track B is
  unchanged (e2e `lesson-complete` still green). **Re-seed required** (emulator/prod, user's
  terminal) so Firestore picks up the updated L1 fixture **+ the new L0 and L2–L6 lesson
  fixtures + the `built:true` course nodes** (seed reads `fixtures/lesson-*.json`).
- **Git:** branch `main`, 3 commits on remote; **all of Group C + Study Desk + docs/
  ideation are uncommitted** in the working tree. Don't commit unless asked.
- **Seeded:** only `course-pattern-hitting-times` + `lesson-pattern-hitting-times` in
  prod. L2–L6 are locked stubs (design-only).
- **State-graph explainer — DONE this session** (per `docs/state-graph-explainer-brief.md`):
  Track-A `primer-graph` beat (static mini dual-label `StateGraph` + annotated key) inserted
  before `simulate`; compact non-interactive `coinsim__legend` added to `simulate` for both
  tracks; `'graph'` primer variant in schema; `phases.ts` off-rail entry; beat count 15 → 16;
  one extra `clickPrimary` in `completeLessonTrackA`. All 42 e2e tests green.
- **Finish → completion takeover — DONE:** Pressing "Finish" on the last beat now replaces the beat with a full-screen `LessonCelebration` (confetti + spring-in) containing the done-note text, the earned `MilestoneSeal`, and a sticky "Back to course path" CTA in the action bar. A `useEffect` on `done` scrolls to top and focuses the CTA. Previously the celebration rendered off-screen in the `.prompt` section while the recap + "Finish" stayed on-screen below the fold. `tsc`/`eslint` clean; e2e `.done-note` assertions unchanged.
- **Last verified green** (this session): `tsc -b`, `vitest run` (**133 app** + 7 functions),
  `validate` (all 7 fixtures + inclusivity gates + 2-beat engine cross-check), `lint`, `build`,
  **`e2e` all 3 projects** (chromium + mobile + reduced-motion, 42/42: flagship Track B + Track A
  + new-lesson spec L0 + L2–L6 × both tracks). Functions `tsc` via the local
  `functions/node_modules/.bin/tsc`. e2e browsers: `playwright install chromium` then run e2e
  with `required_permissions:["all"]` (sandbox redirects the browser cache); the
  `playwright.config` webServer uses the broken `npm run dev`, so **start Vite manually**
  (`./node_modules/.bin/vite --port 4321 --strictPort`) and let `reuseExistingServer` pick it up.
- **Emulator-gated (can't run here — no Java):** `seed`, `test:rules`, full
  Auth+Functions+Firestore walkthrough — user runs these in their own terminal.

**Pending before fully-live functionality:**

- Enable **Google sign-in** in the brilliant-org console (Auth → Sign-in method). Until
  then only email/password works on the live site.
- **App Check enforcement is intentionally OFF.** reCAPTCHA v3 is wired and the App
  Check API is enabled, but do NOT enforce (or set `enforceAppCheck: true` on the
  callables) until console metrics show real users getting verified tokens — else
  legit/low-score users get blocked. (Embedded webviews score as bots → 400; real
  browsers get 200.)

## Environment Gotchas (these will bite you)

- **Firebase CLI must run under Node v24.3.0.** Node ≥22.23 / ≥24.17 breaks the
  `node-fetch@2` bundled in firebase-tools (`ERR_STREAM_PREMATURE_CLOSE` on googleapis,
  mislabeled "invalid credentials"). A `firebase` alias in `~/.zshrc` pins v24.3.0; use
  that alias, NOT `npx firebase` or the global. The Hermes Agent forces
  `~/.local/bin/node` (v22.23.0) to the front of PATH, so an alias (not `nvm use`) is
  required.
- **Avoid `npm run`.** npm 11 + macOS bash 3.2 → `/bin/sh: --: invalid option`. Call
  binaries directly: `./node_modules/.bin/{vite,tsc,vitest,...}`. `firebase.json`
  predeploy already uses a direct `tsc`.
- **No Java locally** → emulators / `seed` / `test:rules` can't run here.
- **Dev run order:** start emulators FIRST, then the dev server. The auth-init
  `BootScreen` looks blank during the round-trip and hangs forever if the page opens
  before emulators are reachable (`onAuthStateChanged` never fires).
- **`.env.development` is gitignored** and must exist, or the app white-screens
  (`getAuth` throws `auth/invalid-api-key` at import → React never mounts; no error
  boundary). `/dev/lesson` + `/dev/home` bypass Firebase entirely.
- **Stale Vite servers:** if edits don't show, kill lingering `node .../vite` PIDs
  (may need `kill -9`); wedged watchers serve old source.
- **Tooling:** never batch multiple `StrReplace` to the *same* file in one turn
  (parallel writes raced + clobbered edits). `timeout` is absent on macOS. Keep `tsx`
  scripts under `scripts/` (can't resolve `zod` from `/tmp`).

## Architecture & Key Decisions

- **Pure KMP engine** `src/engine/{automaton,simulate,types,index}.ts`:
  `buildAutomaton(pattern,p)` → typed `Automaton` (exact rationals, Gaussian
  elimination). Golden: `E[HH]=6, E[HT]=4, E[THH]=8, E[HTH]=10, E[HHH]=14`. HH is the
  primary pattern (`patternOptions[0]`); HT is the contrast.
- **Self-contained beat views** `src/lesson/beats/*` each compose `<BeatShell>` (region
  + `FeedbackStrip` + sticky action bar); `index.tsx` dispatches on `interaction.type`
  (+ `beatId` for the two `slider` beats). `LessonPlayer` owns only cross-beat state;
  `key={beatId}` remounts.
- **Pure, node-testable modules** (`hintLadder`, `equationChecker`, `equationDiagnosis`,
  `stateTapHints`, engine); React hooks wrap them.
- **Konva** only for `StateGraph`/`SimChart`/`BiasChart`/`CourseSpine` (each
  `'use no memo'` for React Compiler); `konva/theme.ts` mirrors `tokens.css` (keep in
  sync). Coin stream + tiles are DOM with `aria-live`.
- **Routing:** hand-rolled SPA router + auth guard in `src/App.tsx` (no react-router).
  Signed-out → landing/auth; signed-in + no `users/{uid}` → `/onboarding/name`;
  onboarded → `/path`. `users/{uid}` is create-once + display-name-whitelisted.
- **Firestore writes:** progression/completion/streaks/milestones are
  **Function-owned** (`completeLesson`, `recordQualifyingAction`, idempotent). Rules are
  owner-scoped + field-whitelisted; clients can't write progression fields. Instant
  feedback stays client-side.
- **Study Desk Home:** `src/pages/StudyDesk.tsx` (presentational) + `studyDesk.model.ts`
  (pure + `.test.ts`) — graph-node course path. Laptop (≥768px) = Konva spine + parallel
  DOM-button overlay for a11y + side detail panel; mobile (<768px) = responsive
  divergence (focused DOM card + compact Konva rail, inline expand one-at-a-time).
  Reduced-motion = static frames. Source of truth: `docs/home-study-desk.md` (Q1–Q23) +
  `docs/adr/0001-konva-course-path-spine.md`. `CoursePathPage.tsx` is the older
  card-style precursor; its dead `.pathnode`/`.pathline` CSS was removed in the
  dead-code sweep.

## Building New Lessons (L2–L6) — BUILT (this session); prereq blockers cleared

> **Status:** L0 + L2–L6 are now built, validated, and e2e-green in both tracks (see
> Current State). The prerequisite blockers listed below have all been resolved; the
> ordering conflict is reconciled (Overlap-last everywhere, incl. `docs/future_ideas.md`).
> The notes below are retained as the design/contract record.

**Start here: `docs/build-brief-remaining-lessons.md`** — the orchestration brief for
building L0 + L2–L6 with a sub-agent team (waves, file-ownership, Wave-0 foundations,
engine `race`/`walk`/`correlation` contracts, widget catalog, per-lesson packets + DoD).
It was reviewed by the 5 learning-science agents (inclusivity is now a *gated* DoD, not a
guideline) and a tech-stack agent (`audits/ideation/tech-review-build-brief.md`, verdict
**sound-with-fixes**: mastery is **CF-persisted** not client-written; `buildWalk` returns a
`WalkModel` not an `Automaton`; `StateGraph` reuse = race ✔ / walk bespoke; fix the eager
`buildAutomaton` crash; `SimChart` needs a linear mode). ⚠ The brief's "current state" can
go stale fast — **re-verify the working tree before building.**

Full beat-by-beat specs in `audits/ideation/plan-L{2..6}-*.md`; synthesis in
`docs/future_ideas.md`. The inclusive (near-zero-foundation) redesign is in
`docs/proposed-lessons.md` + `docs/l1-inclusive-redesign-spec.md` (research in
`audits/ideation/inclusive-research-{1..5}-*.md`; open scoping questions in
proposed-lessons §12 + build-brief §11).

> **Ordering — RECONCILED:** Overlap-last is now canonical everywhere (code/fixtures/
> milestones + `docs/future_ideas.md`): **L4 Mixed Review & Streaks, L5 Longer Patterns,
> L6 Overlap Shortcut = capstone**. ⚠ The plan **filenames** are still offset:
> `plan-L4-overlap-shortcut.md` = L6, `plan-L6-longer-patterns.md` = L5,
> `plan-L5-states-streaks.md` = L4 (math canonical; only the filename L-numbers are off).
> The table below follows the plan filenames.

| Plan file | Lesson | Headline (math verified exact) |
|---|---|---|
| `plan-L2-penneys-game.md` | Penney's | Race ≠ wait; THH beats HHH 7:1; non-transitivity is a **4-cycle** |
| `plan-L3-gamblers-ruin.md` | Gambler's Ruin | `P_i=i/N`, `D_i=i(N−i)`; golden `4/13` |
| `plan-L4-overlap-shortcut.md` | Overlap Shortcut | `E=Σ2^L` + martingale proof (prefix-function borders) |
| `plan-L5-states-streaks.md` | States & Streaks | `E[H]=2` consolidation / spaced retrieval |
| `plan-L6-longer-patterns.md` | Longer Patterns | THH vs HTH transfer (8 vs 10) |

**Prerequisite blockers before ANY non-flagship lesson builds** (existing beats are far
more HH/flagship-coupled than the plans assumed; real reuse is only at the pure-module +
Konva-primitive layer):

1. ~~**`phases.ts` is a flagship singleton**~~ **DONE** — `phases.ts` is now per-lesson
   config keyed by lessonId (`getRail(beatId, lessonId)`), with flagship + `lesson-first-heads`
   configs and exported `OFF_RAIL_AFTER`. Add a config entry per new lesson.
2. ~~**One-automaton assumption**~~ **DONE** — `LessonPlayer` guards the shared
   `buildAutomaton` (validates `patternOptions[0]` is H/T, falls back to `'H'`, never
   throws); race/walk beats build their own model (active-pattern convention); a beat-level
   `pattern` field drives `equationTiles`/`sumTiles`/`autocorrelationRuler` per pattern.
3. ~~**`equationDiagnosis.ts` HH-hardcoding**~~ **DONE** — `hintForMistake(mistake, level,
   overrides?)` accepts fixture-authored `interaction.copy.mistakeHints`; `EquationTilesBeat`
   resolves all copy (worked explanation, legend, tooltips, mistake hints) from
   `interaction.copy` with the module constants as the generic fallback (HH unchanged).
4. **`probToRational` grades only `'1/2'`** → equation-tile beats locked to the fair
   coin; biased walks (L3) need new prob tile values.
5. **Konva primitives need params:** `SimChart` hardcodes `yLo=2` (breaks theory=2;
   can't draw a [0,1] win-rate — L2 needs a linear chart); `StateGraph` radius capped at
   34 + single-absorber layout (L5 hero, L2 dual-absorber need a size prop).
6. ~~**`CoinSimBeat` crashes on `H`**~~ / ~~**`RecapBeat` HH/HT-hardcoded**~~ **DONE** —
   CoinSimBeat guards empty `overlapHighlights`; **RecapBeat now has a generic branch** for
   non-flagship lessons (`lessonId !== FLAGSHIP_LESSON_ID` → generate-then-reveal from the
   beat's authored feedback), so L2–L6 use real `recap` beats (flagship HH/HT path unchanged).

**Engine/schema consensus:** export `solveLinearSystem` + `prefixFunction`; new modules
`race.ts` (L2), `walk.ts` (L3), `correlation.ts` (L4, shared by L6); L5/L6 need ≈0 new
engine. `InteractionSchema` is a closed union (every widget = a new variant);
`TileSchema` can't express Σ2^L or biased probs → use a separate `sumTiles` variant.
Share `autocorrelationRuler` + `sumTiles` across L4 & L6. `transferAttained` (L6): cap
via `maxHintLevel:2`, split transfer beats per pattern, persist a hint **high-water
mark** (`onCorrect` currently resets level→0), thread a client-computed boolean through
`completeLesson`.

## Beat-Audit Quality Loop

Supervised loop over the flagship: `docs/beat-audit-rubric.md` + runner
`audits/cycle-runner.md`. Bar = pedagogyMean ≥ 4.0 (Ext ≥ 3.0), ≤3 cycles. **Cycle 1
(`audits/scoreboard.json`, `backlog.json`, `proposals/cycle-1.md`): Stop Rule NOT met**
— two beats below bar: `pattern-pick` (2.8, passive screen) + `guided-solve` (3.8, low
agency), both **staged proposals, not yet applied**. O4 (perf) **n/a — not instrumented**.

## Premium-UI / Market-Ready (research + IMPLEMENTED motion layer)

**Shipped this session — Motion 12.41 + 5 "wow" moments. Verified: tsc + lint +
`vite build` green; e2e 42/42 (chromium / mobile / reduced-motion).** Files:
`src/motion/{tokens.ts,MotionProvider.tsx}` (mounted in `main.tsx`: LazyMotion
`domMax`+`strict`, `MotionConfig reducedMotion="user"`; tokens = JS mirror of
`--dur-*`/`--ease-*` + SPRING/SPRING_SOFT/SPRING_CELEBRATE). Moments: M1
`CoinStream.tsx` (coins spring in via AnimatePresence initial={false}; state chip
pops on change; removed CSS `coin-pop` keyframe). M2 `beats/EquationTilesBeat.tsx`
(palette `m.button` hover/press lift + token spring-snap into slots; tap flow +
e2e selectors unchanged — full drag deferred to protect the tested tap/a11y model).
M3 `lesson/LessonCelebration.tsx` wraps `.done-note` (confetti burst + spring-in;
"Lesson complete" text kept for e2e). M4 `pages/StudyDesk.tsx` (DeskBody staggered
reveal via deskContainer/deskItem). M5 `pages/LandingPage.tsx` (staggered hero +
traveling quill `.preview__signal` in the state machine + magnetic CTAs).
**Gotchas honored:** Konva files keep `'use no memo'`; global reduced-motion
`*{…!important}` coexists with MotionConfig; kept our own `useReducedMotion`
(Motion's hook doesn't live-update). **OPEN follow-ups:** entry bundle is ~477 KB
gz as a single chunk (no code-splitting — see Phase 0 below); cross-route
shared-element "zoom into lesson" deferred (needs router work).

A 5-agent research council (1 read-only codebase crawl + 4 web-research agents,
June 2026, version-verified) evaluated how to make the UI more premium + market-ready.
**Verdict: do NOT reskin with a UI kit — keep the bespoke "notebook" CSS and add a thin
layer.** Recommended "Premium Notebook" stack (additive, React-Compiler/Vite-8 safe):
1. **Style Dictionary** token pipeline → CSS vars + *resolved* Konva JS (permanently kills
   the `tokens.css` ↔ `konva/theme.ts` drift; note live drift `--mark-wash` 0.22 vs 0.30).
2. **Base UI** (`@base-ui-components/react`) headless primitives → dialog/popover/tooltip/
   menu/toast (none exist today), styled via `[data-*]`+existing tokens. Radix = safe alt.
3. **Motion** (`motion/react`, `LazyMotion`+`m`) → beat enter/exit, spring feedback,
   course-path `layoutId`. ⚠ gotchas: keep `'use no memo'` on Konva; the global reduced-motion
   `*{…0.01ms!important}` rule fights Motion (use `<MotionConfig reducedMotion="user">`);
   keep our own `useReducedMotion.ts` (Motion's doesn't live-update).
4. **Native View Transitions API** → page transitions for the hand-rolled router (0 KB).
5. **KaTeX** (math notation) + **Lucide** (icons, `strokeWidth ~1.5`). Keep Konva as hero viz.
6. **dotLottie** (lazy) → lesson-complete/mastery celebrations; reserve `--ease-spring` for those.
Explicitly avoided: MUI/Mantine/Chakra/shadcn/Tailwind-as-system, big-bang `app.css` rewrite,
runtime CSS-in-JS, React Spring, React's experimental `<ViewTransition>`.
**Biggest *market-ready* gaps are structural, not visual:** `App.tsx` eager-imports every
page+Konva+Firebase (no code-splitting), no error boundaries, Konva canvases not keyboard-a11y,
no SEO/prerender. Suggested order: Phase 0 code-split + error boundaries + WCAG 2.2 AA + web-vitals
→ Phase 1 token pipeline + Base UI → Phase 2 Motion/KaTeX/Lucide/celebration → Phase 3 prerender/PWA/dark.

## Next Steps (priority order)

0. **Remaining-lessons follow-ups:** (a) **re-seed** Firestore (emulator + prod) so the new
   L0 + L2–L6 fixtures + `built:true` course nodes go live, then **live-walk the unlock chain
   + milestones** (`three-/six-lessons-complete`) on an authed path — the `/dev/lesson` route
   is Firebase-less so the L4 cross-lesson weak-node reader (`src/progress/recommend.ts`) and
   mastery persistence are only exercisable against the emulator/authed path; (b) the L4
   `weak-node` beat is currently a **fixed re-test** (dev-route-safe) — wire it to call
   `recommendReview`/`selectWeakNode` over the live snapshot on the authed path for true
   personalization; (c) **validity:** real-beginner playtest + the load proxy
   (`answer_submitted{hintLevel}`/reveal-rate) per build-brief §10; (d) commit (working tree
   is large — not yet committed).
1. **Resolve cycle-1 beat-audit proposals** (blocking the Stop Rule): redesign/waive
   `pattern-pick` + `guided-solve`, then continue/stop the loop. See
   `audits/proposals/cycle-1.md`.
2. **Instrument O4 (perf)** — feedback <100ms, no per-frame React state during
   drag/animation (currently `n/a`).
3. Enable **Google sign-in** in the brilliant-org console (last gate for full live auth).
4. ~~**Before building L2–L6:** clear blockers; reconcile ordering~~ **DONE** — L0 + L2–L6
   built + e2e-green both tracks; blockers cleared; Overlap-last reconciled everywhere.
5. **Live end-to-end check** (emulator/seed/auth + live `/path`) — user's terminal
   (blocked on the no-Java host here).
6. **Tidy the working tree** (only when asked): commit Group C + Study Desk + ideation;
   consider removing the stray committed `docs/Hermes-Setup.dmg` (binary, likely
   unintended). A dead-code sweep (uncommitted) already removed `verify-tmp.mjs`,
   `firepit-log.txt`, the unused `src/engine/index.ts` barrel, the dead duplicate
   `FLAGSHIP_LESSON_ID` in `content/loader.ts`, the dead engine `Tile`/`EquationRow`
   types, the unused `DeskNode.milestoneId` field, the unused `functions`
   `isKnownMilestone`/`ALL_MILESTONES`, and ~255 lines of dead CSS. Verified green:
   tsc/eslint/vitest (84 app + 7 functions)/build; `e2e` + `validate` not re-run.
7. **Group D (Phases 20–24):** remaining lesson fixtures, auth/course-path responsive +
   a11y pass (flagship lesson already done), public deploy.

## Quick Reference

- **Docs:** `docs/mvp_prd.md`, `docs/core_instructions.md`, `docs/ui_design_system.md`,
  `docs/home-study-desk.md`, `docs/beat-audit-rubric.md`, `docs/proposed-lessons.md`,
  `docs/future_ideas.md`, `docs/proposed-lessons.md`, `docs/l1-inclusive-redesign-spec.md`,
  `docs/build-brief-remaining-lessons.md` (L0/L2–L6 build orchestration),
  `docs/state-graph-explainer-brief.md` (ready-to-implement: state-graph explainer —
  Track-A `primer-graph` beat + inline legend in `simulate`),
  `docs/adr/0001-*.md`, `CONTEXT.md` (glossary); audits in
  `audits/ideation/{inclusive-research-*,tech-review-build-brief}.md`
- **Engine:** `src/engine/{automaton,simulate,types,index}.ts`
- **Content:** `src/content/{schema,loader,firestoreLoader}.ts`, `fixtures/` (lesson +
  course), `scripts/{validate-fixtures,seed-firestore}.ts`
- **Lesson shell:** `src/lesson/{LessonPlayer,BeatShell,FeedbackStrip,CoinStream,PhaseRail,LessonPreview,snapshot}.tsx`,
  `{feedback,hintLadder,phases,useReducedMotion}.ts`
- **Beats:** `src/lesson/beats/*` (`index.tsx` dispatcher, `types.ts`)
- **Pure graders:** `equationChecker.ts`, `equationDiagnosis.ts`, `stateTapHints.ts`
- **Konva:** `src/lesson/konva/{StateGraph,SimChart,BiasChart,CourseSpine,theme,useElementWidth}.*`
- **Auth/pages:** `src/auth/*`, `src/pages/*` (incl. `StudyDesk`, `studyDesk.model`,
  `DevHomePage`, `CoursePathPage`)
- **Habit/progress/analytics:** `src/habit/*`, `src/progress/*`, `src/analytics/events.ts`
- **Functions:** `functions/src/{index,streaks,milestones}.ts`; rules `firestore.rules`
  + `tests/firestore.rules.test.ts`
- **Firebase config:** `firebase.json`, `.firebaserc`, `.env.{development,production}`
  (gitignored)
- **e2e:** `e2e/*` + `playwright.config.ts` · **Audits:** `audits/*`
- **Commands (call binaries directly, not `npm run`):** `validate` · `seed` ·
  `vitest run` · `lint` · `build` · `e2e`; the `firebase` v24.3.0 alias for deploys
- **Reset learner progress** (client deletes are rules-denied → must use CLI/Admin):
  `firebase firestore:delete users --recursive --force --project brilliant-org` wipes
  all `users/*` (profile + progress/snapshots/milestones/streaks), keeps seeded
  courses/lessons; flagship stays available so no lockout. Scope to one learner with
  `users/<uid>` (uid from console Auth), or per-subcollection to keep the profile.
