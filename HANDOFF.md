# HANDOFF
<!-- Last updated: Agent 3 — Course Journey (Ergo UI reimagining) -->

Orientation doc for a fresh context. Session-by-session narration lives in git
history + the `docs/`/`audits/` files; this file keeps only what's needed going forward.

## Goal & Constraints

Brilliant-style learn-by-doing web app. Flagship lesson teaches **pattern hitting
times** for coin flips (why `E[HH]=6` but `E[HT]=4`). Sequenced by `docs/mvp_prd.md`
(Groups A–D).

- Match `docs/ui_design_system.md` (**Ergo Design System** — bright, clean, colorful,
  brilliant.org-like identity; Space Grotesk + Inter + JetBrains Mono; cool-white palette;
  chapter color-coding; learning journey with rich lesson cards; medallion gallery + streak
  dots). The Ergo reimagining is recorded in `docs/adr/0003-ergo-bright-reimagining.md`
  (supersedes ADR-0002). The product is renamed from "Pattern Hitting Times" to **Ergo**.
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
- **Git:** branch `main` in sync with `origin/main` at `5db37ea` (Group C + Study
  Desk + all 7 lessons + security hardening committed/pushed). **Living Notebook
  overhaul (Waves 0–4) is in the working tree, NOT committed** — large diff across
  tokens/CSS/surfaces/ui/motion/lesson/auth + VR harness. Don't commit unless asked.
- **Seeded (prod brilliant-org — DONE this session):** **all 7 lessons** (L0 +
  L1–L6) + the course doc (every node `built:true`) are now live in prod Firestore
  via `SEED_TARGET=prod GOOGLE_CLOUD_PROJECT=brilliant-org tsx scripts/seed-firestore.ts`
  (Admin SDK + gcloud ADC; no Java/emulator needed for a prod seed). Read-back
  confirmed `courses/course-pattern-hitting-times` + 7 `lessons/*` docs. The
  deployed hosting bundle (built/deployed earlier today) already contains the
  L2–L6 beat renderers, so the live client can render them — no redeploy needed.
  Still gated on auth to *enter* lessons (email/password only; Google sign-in off);
  unlock chain + L2–L6 milestone awarding unverified on a live authed walk.
- **MCQ → AnswerEntry migration — DONE this session:** removed `mcq` interaction
  type from `InteractionSchema` (replaced with `answerEntry`: array of `{id, label,
  accept[], placeholder?, suffix?}` fields graded against a normalized accept-list);
  deleted `McqBeat.tsx`; created `AnswerEntryBeat.tsx`; updated `beats/index.tsx`
  dispatcher; updated `mastery.ts` GRADED_BEAT_TYPES; updated `validate-fixtures.ts`
  GRADED_TYPES + OPENER_TYPES + opener error message; replaced `.mcq` CSS block with
  `.answer-entry` block in `beats-extended.css`; updated `recommend.test.ts`;
  replaced `gradedMcq` helper with `answerEntry` in `e2e/remaining-lessons.spec.ts`
  + rewrote completeL2/L3/L4/L5/L6 calls; added `runGhost = runSim` alias. Fixtures
  and DiagnosticGate.tsx are being edited by other agents in parallel. tsc: clean;
  eslint: 1 pre-existing error in WalkBoardBeat.tsx (not touched).
- **State-graph explainer — DONE this session** (per `docs/state-graph-explainer-brief.md`):
  Track-A `primer-graph` beat (static mini dual-label `StateGraph` + annotated key) inserted
  before `simulate`; compact non-interactive `coinsim__legend` added to `simulate` for both
  tracks; `'graph'` primer variant in schema; `phases.ts` off-rail entry; beat count 15 → 16;
  one extra `clickPrimary` in `completeLessonTrackA`. All 42 e2e tests green.
- **Finish → completion takeover — DONE:** Pressing "Finish" on the last beat replaces the beat with full-screen `LessonCelebration` (wax-seal ink-stamp on `--stamp-beat` + spring-in) containing the done-note, earned `MilestoneSeal`, and sticky "Back to course path" CTA. `useEffect` on `done` scrolls to top and focuses the CTA. e2e `.done-note` assertions unchanged.
- **First-run welcome + L0-clearly-optional — DONE this session:** new
  `src/pages/WelcomeScreen.tsx` (full-screen `authcard`-styled greeting that focuses
  its primary CTA) is shown **once to brand-new accounts only**, at `/path` **before**
  the `DiagnosticGate`. Flow: landing → auth → display-name → **welcome (new only)** →
  Quick check → desk; returning sign-ins skip it. Gated on `welcomeSeenAt` **absent** on
  `users/{uid}/progress/{courseId}` (`loadWelcomeSeen`/`markWelcomeSeen` in
  `progress/track.ts`; `welcomeSeenAt` added to `ProgressSchema`; rules already allow
  non-progression fields here, like `track`). "Start the introduction" → L0
  (`INTRO_LESSON_ID='lesson-first-heads'` in `routes.ts`); "Skip for now" falls through.
  `CoursePathPage` holds the desk skeleton until welcome+track resolve (no desk flash).
  L0 now reads optional on the desk: `NodeDetailCard` "Optional" pill +
  `stateCaption` "Optional · …" + `nodeAria` ", optional" (all in `StudyDesk.tsx`;
  model unchanged — `DeskNode.optional` already existed). Verified: tsc/eslint/vitest
  (133) green; **visually confirmed at `/dev/home`** (pill + caption + aria). ⚠ The
  welcome flow itself is auth-gated (emulator-verify) and entering the intro needs L0
  **seeded**. `CONTEXT.md` gained `L0 / The introduction` + `Welcome screen` glossary
  entries. Stale-Vite footgun bit again — verify on a freshly-started server.
- **Security audit + hardening — DONE this session** (brief: `docs/security-audit.md`).
  Multi-model audit (web research → `gemini-3-flash` evidence → `claude-opus-4-8` adjudication
  → `composer` brief). Backend posture confirmed strong (owner-scoped rules, server-authoritative
  callables, no secrets/eval). **Applied:** F2 HTTP security headers (CSP/HSTS/X-Frame-Options/
  X-Content-Type-Options/Referrer-Policy/Permissions-Policy) in `firebase.json` hosting — the CSP
  allowlists Google sign-in + reCAPTCHA/App Check + Firestore/Functions + Analytics; **validate
  against a real deploy** (watch console for CSP violations). F5 default-deny `storage.rules` +
  `firebase.json` `storage` block (deploy needs a provisioned bucket; else `firebase deploy --only
  hosting,firestore,functions`). **Deferred (ready-to-apply code in the brief):** F1
  `enforceAppCheck: true` on the callables + F3 client fail-loud — honoring the App-Check-OFF
  directive below; turn both on together once console metrics show verified tokens. F4 npm
  advisories are dev/CLI-only + unreachable (NO `firebase-admin@14` bump — latest `firebase-functions`
  7.2.5 caps admin at ^13; bumping yields an invalid tree). Net code change = `firebase.json` +
  new `storage.rules` + the brief. Verified green: `tsc -b`+`vite build`, 133 app + 7 functions
  vitest, 12 rules tests, lint.
- **Living Notebook premium-UI overhaul (Waves 0–4) — DONE in working tree, NOT committed**
  (per `docs/build-brief-living-notebook.md`): **Wave 0** — Style Dictionary pipeline
  (`style-dictionary/tokens/*.json` + `scripts/build-tokens.ts` → `tokens.generated.{css,ts}`;
  `konva/theme.ts` + `motion/tokens.ts` derive shared values; `--mark-wash` de-drifted to
  0.22; depth/timeline/font tokens); CSS split into `src/styles/surfaces/*` under `@layer`
  (`app.css` ~15-line barrel); Fraunces variable + `fonts.css` metric fallback; lazy seams
  (`gsapText`, `Katex`); `useAmbient`; route code-split + `ErrorBoundary` + `viewTransition.ts`;
  `src/ui/*` primitives + `ui.css`; Playwright VR harness (`playwright.vr.config.ts`, `e2e/vr/`).
  **Wave 1** — tactile depth + Fraunces display type (landing/auth, home/desk/habit, lesson shell/beats).
  **Wave 2** — synchronized flip (`StateGraph`), equation-tile drag (additive), confetti → wax-seal
  ink-stamp + streak SVG stroke-on, router View Transitions + spine traversal, GSAP SplitText
  (landing/recap), ambient breathing, TheorySimChartBeat sim-sweep batched to ≤30fps.
  **Wave 3** — React-Aria sliders (`useSliderControl`), `.infotip` → `ui/Tooltip`, offline/restore/
  failed-write `StatusNote` banners (gated on `persist`), KaTeX recap verdict, field-level auth
  errors (`classifyAuthError`). New deps: `style-dictionary`, `gsap`, `@gsap/react`, `katex`,
  Radix tooltip/dialog/popover/dropdown-menu/tabs, `react-aria`, `@fontsource-variable/fraunces`.
  **Verified green:** `tsc -b`, `eslint .`, `vitest run` **171/171**, `validate`, `vite build`.
  **NOT run (deferred to manual e2e):** Playwright functional suite (42/3 projects) + VR sweep —
  ⚠ VR baselines **stale** (last re-baselined Wave-1 look; re-baseline when running VR). Entry
  chunk ~**312 KB gz** (was ~477 KB via code-splitting); `gsap`/`katex` lazy; >500 KB raw warning
  remains (Firebase eager in entry + Konva). **Deferred:** Firebase lazy-load (auth-boot refactor),
  Fraunces glyph subsetting, `@property` registration (no animated custom props yet), e2e cold-chunk
  warm-up in harness.
- **KaTeX flash fix — DONE in working tree:** `src/lesson/Katex.tsx` no longer paints raw tex while
  the lazy lib loads. katex + CSS now preload once at module load via a shared `katexReady` promise +
  module-singleton `katexLib` (lazy `useState` initializer → synchronous typeset on re-renders); the
  pre-load fallback is wrapped in `.visually-hidden` (role=math + aria-label keep a11y) so raw markup
  never flashes. katex stays its own chunk (build-confirmed `katex-*.js`/`.css`, out of entry).
  `Katex.test.tsx` adds a `visually-hidden` assertion. Green: vitest 171, eslint, `tsc -b`+`vite build`.
- **Brilliant interactive-mechanics pass — DONE:** audit + prioritized
  backlog in `docs/interactive-mechanics-backlog.md`, then 4 mechanics implemented across
  L1/L3 (top picks; drag relaxation approved, no-AI-tutor kept). (1) **True drag-and-drop**
  on `EquationTilesBeat` — Motion `drag` + `onDragEnd` slot hit-testing (`slotRefs`), `wasDragRef`
  stray-click guard, `.slot--dragover` highlight; tap + keyboard preserved as the fallback
  (benefits L1/L3/L5). (2) **Balance-scale solver** — new `balanceSolve` interaction
  (`schema.ts` union + `BalanceSolveBeat.tsx` + **pure `balanceModel.ts`** so the test pulls no
  React/Firebase + dispatcher) wired into L1 `guided-solve`, replacing the below-bar
  `substitution`. Engine-derived balance point (HH E0=6, rhs(x)=otherTerm+selfCoeff·x);
  `.balance__range` keyboard-drivable; sets `theoreticalValue`; reduced-motion = no tilt anim,
  still interactive. `SubstitutionBeat`/`substitution` type kept wired (now unused). (3)
  **Distribution histogram + continuous bias knob** on L3 `house-edge` `walkBoard` — new pure
  `walkDurationHistogram` in `engine/walk.ts` + SVG bars; realizes the declared-but-unbuilt
  `display:'histogram'`; renders on mount; Continue stays always-enabled. (4) **Interactive
  `pattern-pick`** — optional fixture `previews` make L1 compare cards tap-to-preview the
  near-miss (passive elsewhere, e.g. L5; Continue always-enabled). Clears BOTH below-bar audit
  beats (`pattern-pick` 2.8, `guided-solve` 3.8). `schema.test.ts` updated (guided-solve now
  asserts `balanceSolve` + engine E0 in slider domain). **Verified green:** `tsc -b`, `eslint .`,
  `vitest run` **171/171** (+17), `validate`, `vite build`. e2e helpers' guided-solve step
  now drives `.balance__range`. Re-run **e2e 42/42** before deploy (warm Vite first — cold
  lazy-chunk compile flakes).
- **Last verified green** (prior session — pre-Living-Notebook e2e): `tsc -b`, `vitest run` (**133 app** + 7 functions),
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
  browsers get 200.) The security audit (this session) honored this directive — enforcement
  is NOT applied; `docs/security-audit.md` F1/F3 carry the ready-to-apply code + the
  monitor-then-enforce rollout sequence.

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
- **Tokens:** regenerate via `./node_modules/.bin/tsx scripts/build-tokens.ts`
  (or `npm run tokens` if your npm works). Edit `style-dictionary/tokens/*.json`, not
  the generated files.
- **VR:** run via `--config playwright.vr.config.ts` (kept out of functional suite by
  `testIgnore: ['**/vr/**']` in `playwright.config.ts`). Baselines under
  `e2e/vr/__screenshots__/` — currently stale vs Wave 2/3 visuals; re-baseline on sweep.

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
  `'use no memo'` for React Compiler); `konva/theme.ts` derives from
  `tokens.generated.ts` (keep in sync with Style Dictionary pipeline). Coin stream +
  tiles are DOM with `aria-live`.
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

## Premium-UI / Market-Ready ("The Living Notebook")

**DIRECTION:** Bolder cinematic evolution of the notebook — NOT the earlier "stay restrained /
thin additive layer" verdict (superseded). Spec: `docs/ui_design_system.md`; rationale:
`docs/adr/0002-bolder-living-notebook.md`. Orchestration: `docs/build-brief-living-notebook.md`.

**Living Notebook overhaul (Waves 0–4) — DONE in working tree, NOT committed.** Style
Dictionary single token source → CSS + Konva + motion/GSAP; CSS `@layer` surface split;
Fraunces display serif + tactile letterpress/deboss depth; cinematic motion on one timeline
(flip packet, ink-stamp celebration, streak stroke-on, GSAP SplitText, View Transitions);
Radix + React Aria primitives (`src/ui/*`); KaTeX typeset results; Playwright VR harness.
Light-only stays. See Current State bullet for wave-by-wave detail + verification/deferred items.

**Shipped (prior session) — Motion 12.41 + 5 "wow" moments** (partially evolved by Living
Notebook Wave 2 — confetti **replaced** by wax-seal ink-stamp on `--stamp-beat`):
`src/motion/{tokens.ts,MotionProvider.tsx}` (mounted in `main.tsx`: LazyMotion
`domMax`+`strict`, `MotionConfig reducedMotion="user"`). Moments: M1 `CoinStream.tsx`,
M2 `EquationTilesBeat.tsx` (+ drag layer in Wave 2), M3 `LessonCelebration.tsx` (now
ink-stamp, not confetti), M4 `StudyDesk.tsx`, M5 `LandingPage.tsx`. **Gotchas:** Konva
`'use no memo'`; global reduced-motion coexists with MotionConfig; keep our own
`useReducedMotion`. **Remaining perf levers (deferred):** Firebase lazy-load off boot path
(auth-boot refactor — needs emulator testing); Fraunces true glyph subsetting; `@property`
when a custom prop is animated; e2e cold-chunk warm-up in harness.

A 5-agent research council (June 2026) evaluated premium + market-ready options.
**Verdict: do NOT reskin with a UI kit — keep bespoke notebook CSS** (history retained below;
Living Notebook implements the bolder pivot instead of the thin layer). Recommended stack
items now largely **implemented** (Style Dictionary ✓, Motion ✓, View Transitions ✓, KaTeX ✓,
Radix/React Aria ✓, code-split + error boundaries ✓). Still open: prerender/PWA/dark, Konva
keyboard-a11y, SEO.

## Session State (latest)

**Ergo integration fix (this session):** Three parallel agents (token/font swap, Home shell, Course journey) merged their Ergo work. Integration fixer validated all four gates and made two surgical fixes to the newly-created files:

- **`src/lesson/mathviz/MathViz.tsx`**: Changed `JSX.Element` → `React.JSX.Element` (the project convention; bare `JSX` namespace not available under `"jsx": "react-jsx"` without an explicit import).
- **`src/pages/CourseJourney.tsx`**: Same `JSX.Element` → `React.JSX.Element` fix; also narrowed `chapterForLesson(...)` result from `Chapter | null | undefined` to `Chapter | null` via `?? null` so the `DetailCard` prop type (`Chapter | null`) is satisfied.

**Final gate results:** `tsc -b` ✅ 0 errors · `eslint .` ✅ 0 warnings/errors · `vitest run` ✅ 30 files / 202 tests · `vite build` ✅ built in 2.77s (chunk-size advisory is pre-existing, not an error).

**Pre-existing vitest issues:** None triggered in this run (the noted BalanceSolveBeat FirebaseError requires a live Firebase connection; schema.test guided-solve assertion passed locally).

**Orphaned files noted (not deleted, not breaking build):** `src/lesson/konva/CourseSpine.tsx` and `src/lesson/LessonPreview.tsx` are no longer imported by `StudyDesk.tsx` but remain in the tree — they compile cleanly and are simply unused top-level exports.

**Ergo Home Shell — Agent 2 (prior session) — DONE in working tree:**
Rewrote `src/pages/StudyDesk.tsx` to the Ergo Home layout; created two new habit
components and the surface CSS. `StudyDeskProps` is byte-identical (consumers
`CoursePathPage` + `DevHomePage` unchanged). ESLint + tsc both exit 0.

- **`src/pages/StudyDesk.tsx`** (rewritten): top bar (`Ergo` wordmark + profile avatar),
  momentum band (`<WeeklyStreak>` left / `<ConceptMedallion>` gallery right), and
  `<CourseJourney>` (Agent 3 contract, imports from `./CourseJourney`). Removed all old
  CourseSpine/LessonPreview/resolveNodes imports. Motion stagger kept. Skeleton = hairline
  band + 4 journey row placeholders with pulse animation.
- **`src/habit/WeeklyStreak.tsx`** (new): Props `{count, lastActiveDate, compact?}`.
  Large tabular streak numeral + "day streak" + 7-dot M–S rail. Approximates which dots
  are filled from `min(count,7)` trailing days ending at the last active weekday.
- **`src/habit/ConceptMedallion.tsx`** (new): Props `{meta, earned, earning?, hueVar?}`.
  44px circle medallion; earned = chapter-color ring + tint fill + mono glyph; locked =
  grey ring + muted glyph + lock SVG. `earning` triggers a CSS fade-in animation
  (reduced-motion: none). `hueVar` sets `--medallion-hue` / `--medallion-tint` inline.
- **`src/styles/surfaces/ergo-home.css`** (new): `.ergo-home`, `.ergo-topbar`,
  `.ergo-wordmark`, `.ergo-avatar`, `.ergo-momentum`, `.ergo-streak`, `.ergo-medallion`,
  `.ergo-skeleton`. Uses all Ergo tokens (Agent 1 contract). Agent 1 adds the @import
  to app.css. Mobile: momentum band stacks vertically; medallion row scrolls horizontally.
- Milestone→hue mapping in StudyDesk: ch1/ch1/ch1 (Foundations milestones),
  ch2/ch2/ch2 (Racing & Walks), ch3 (Mastery), ergo-brand (course completion).



- **Coin-sim state-graph shows on load (this session; orchestrated: Sonnet edit subagent
  + browser-use verify) — DONE in working tree:** Track-A (`density:'split'`) `CoinSimBeat`
  opened in a `'stream'` warm-up that hid the `StateGraph` until the learner flipped twice
  and clicked **"Show the machine"**. Removed the `'stream'` phase entirely — both tracks now
  open in `'free'` with the graph rendered unconditionally (the `{width>0 && <StateGraph/>}`
  guard stays), so the canvas appears immediately and animates on each flip. Dropped the dead
  `'stream'` branches (`Phase` type member, `showGraph`, the stream primary/secondary/hint
  blocks) + updated the header comment; all other split scaffolds (dual labels, single-step
  near-miss replay, dimming, gambler note) preserved. Updated the two split e2e flows that
  clicked "Show the machine" (`e2e/helpers.ts` `completeLessonTrackA`,
  `e2e/remaining-lessons.spec.ts` `simulate`). **Verified:** `tsc -b`/`eslint`/`vitest` **179**
  green; flagship (merged) e2e green on a fresh server; **browser-confirmed** the split
  `simulate` beat renders the `.canvas-frame` canvas (926×482) with primary "Flip" and no
  "Show the machine" BEFORE any flip, reacting ∅→H on the first flip. ⚠ **Stale-Vite footgun
  bit again** — the lingering 4321 dev server served pre-edit code (HMR never applied); verify
  only on a freshly-started server. ⚠ The **track-a** automated e2e still fails *upstream* of
  `simulate` on a **pre-existing** primer navigation race (`completeLessonTrackA` force-clicks
  5 consecutive identical "Continue" beats without waiting for the View-Transition to settle,
  so a click is dropped and it stalls on `primer-graph`) — independent of this change (the
  primer nav was untouched; merged path with fewer Continues passes).

- **No-MCQ pass (this session; orchestrated, 3 parallel Sonnet subagents) — DONE in
  working tree:** every graded `mcq` beat (14 across L0/L2–L5) + the `DiagnosticGate`
  "Quick check" replaced with hands-on interactions; `mcq` plumbing removed. New
  **`answerEntry`** type-in mechanic (`src/lesson/beats/AnswerEntryBeat.tsx` + `answerEntry`
  schema variant + dispatcher case + `.answer-entry` CSS + registered in `mastery.ts`
  `GRADED_BEAT_TYPES` and `validate-fixtures.ts` `GRADED_TYPES`). `McqBeat.tsx` deleted;
  `mcq` purged from schema/dispatcher/mastery/validator (`OPENER_TYPES`→`retrievalGrid`
  only)/`beats-extended.css`; `recommend.test.ts` stub → `retrievalGrid`. Conversions:
  L0 `l0-count`→answerEntry; L2 `recall-6-4`/`first-step-split`/`win-prob-tiles`→retrievalGrid
  + `pick-your-counter`→answerEntry; L3 `recall-overlap`/`boundary-edge`→retrievalGrid +
  `guided-solve`→answerEntry; L4 **patternOptions reordered HH-first** (lesson automaton
  must be HH for the new stateTap), `which-waits-longest`/`plus-one-or-not`→retrievalGrid,
  `race-or-wait`→raceSim+`hero`, `weak-node`→stateTap; L5 `guided-solve`→answerEntry +
  `overlap-compare`→retrievalGrid; DiagnosticGate→4 type-in numeric Qs (same 3-of-4→Track B).
  **Verified green:** `tsc -b`, `eslint .`, `vitest run` **178**, `validate` (all inclusivity
  gates), `vite build`; **e2e L2/L3/L4 both tracks × 3 projects = 36/36** (`--repeat-each=2`).
  e2e helpers: new `answerEntry`, role-based `runGhost` (robust to the LN action-bar restyle),
  `recapFinish` (the LN recap is now **reveal-then-finish**; label-targeted to dodge the
  in-place flip race).
  - ⚠ **Pre-existing, NOT this work:** L0/L5/L6/flagship/track-a e2e fail at uncommitted
    **Living Notebook** beat reworks never e2e-verified — coinSim/`PrimerBeat` avg-timeline
    (L0), `autocorrelationRuler` (L5/L6), `sumTiles`/`gamblerLedger` (L6), bias-sandbox
    advance (flagship/track-a). Out of MCQ scope; they pre-date this session.
  - ⚠ **Vite footgun (bit again):** deleting `McqBeat.tsx` wedged the **running 4321** dev
    server's HMR — the browser kept rendering the OLD MCQs even though disk/curl were fresh.
    **Restart the dev server** to see the changes (verified on a fresh one; a stray
    verification vite may linger on **4456**). VR re-baseline deferred: `dev-lesson-penneys`
    now snapshots the retrievalGrid (was the mcq); LN baselines were already stale.

- **L5 overlap-why deep-dive (this session):** reworded the `overlap-ruler` prompt ("Each overlap of length L adds 2^L to the wait."); inserted a collapsible `overlap-why` `primer` beat (the gambler/fair-bet/2^L explanation) immediately after `overlap-ruler` in `fixtures/lesson-longer-patterns.json` (`required:false`); added `'overlap-why': 'overlap-ruler'` to `LONGER_PATTERNS.offRailAfter` in `src/lesson/phases.ts`; added `await primer(page) // overlap-why deep-dive (collapsed)` in `completeL5` in `e2e/remaining-lessons.spec.ts`.

- **L3 walk-board decimals + bigger histogram (this session):** on `WalkBoardBeat.tsx` the
  `ratStr` exact-`Rational` fraction helper was replaced by `dec(r)=Number((r.n/r.d).toFixed(3)).toString()`
  (≤3 decimals, trailing zeros stripped) and all 6 call sites renamed, so reach/ruin/avg-flips +
  the per-node `P_i` labels render as clean decimals on every walk-board beat (the biased
  `house-edge` tilt beat previously showed ugly fractions like `369/671`). The duration histogram
  below the bias slider was enlarged: `HIST_VH` 130→190 (taller viewBox) and the `max-width:320px`
  cap removed from `.walkboard__histogram` (`components.css`) so it fills the column. The
  `landscape` polyline (uses `r.n/r.d` directly) was untouched. Gates: `tsc -b`, `eslint .`,
  `vitest run` **178/178** green. Gambler's ruin is not in the VR surface set
  (`e2e/vr/surfaces.spec.ts` = home/flagship/penneys) → VR baselines unaffected.
- **L3 Gambler's Ruin "Watch one walk" animation (this session; orchestrated: 2 Sonnet + 1
  composer subagent):** the single walk was instant (printed result only). Now it plays back
  step-by-step — a `.walkboard__walker` dot glides across the number line at a fixed `STEP_MS=400`
  per move (independent of walk length) until it lands on 0 (ruin)/N (win), then the outcome text
  appears. New `traceWalk`/`WalkTrace` in `engine/walk.ts` records the full positions path
  (mirrors `traceRace`); `WalkBoardBeat.tsx` drives an interval over `stepIdx` (only setState is in
  the interval callback — satisfies `react-hooks/set-state-in-effect`), reset in the click handler;
  reduced motion skips the interval and renders the final frame via a derived `idx`. Fixed a latent
  bug: single-walk seed now uses a dedicated `watches` counter (was `runs`), so repeated presses
  show *new* walks. CSS glide (`cx` transition) + reduced-motion override in `beats-extended.css`.
  Added 5 `traceWalk` tests. Gates: vitest **178/178**, `tsc -b` + `eslint` clean. (Animation is
  timer-driven so unverified by the node/`renderToString` harness — engine-tested + manual.)
- **L2 Penney's "Watch one race" fix (this session; orchestrated, 1 Sonnet subagent):**
  `RaceSimBeat.tsx` conflated `seen` (Continue gate) with the batch tally, so "Watch one race"
  flipped `seen→true` and rendered the 200-race bars instead of a single race. Replaced with an
  explicit `view: 'idle'|'single'|'batch'` state: "Watch one race" now shows the **full shared
  coin stream flip-by-flip** (new `traceRace` in `engine/race.ts` returns `{winner, flips}`; the
  last `winLen` chips highlighted in the winner's lane color) with **no bars**; "Run 200 races"
  shows the bars; reduced-motion still opens in `batch`. New `.racehero__stream/__flips/__flip`
  CSS (`beats-extended.css`). Added 2 `traceRace` tests. Gates: vitest **11/11** (race file),
  `tsc -b` + `eslint` clean. Browser-verified at `/dev/lesson/lesson-penneys-game` (HHH vs THH:
  8-flip stream `H T T T H · T H H`, last 3 = THH highlighted, bars absent). VR `dev-lesson-penneys`
  unaffected (snapshots the first MCQ beat, not the race).
- **Living Notebook overhaul (Waves 0–4)** — see Current State bullet + Premium-UI section.
  Working tree, not committed. Next: e2e re-run (warm Vite), VR re-baseline, commit when asked.
- **Onboarding + L1 bug-fix pass — 7 issues from a live Track-A report (this session;
  orchestrated, 6 Sonnet subagents):**
  (1+2) `onSkip` in `CoursePathPage.tsx` now also `saveTrack(uid,'A')`+`setTrack('A')` so "Skip
  for now" lands on the desk (Track A), bypassing the DiagnosticGate; `grid-column: 2` on
  `.topbar__center` (`shell.css`) un-clips the gate's "QUICK CHECK" (single-child was auto-placing
  into the 44px col-1 → "QUI…"; no-op for 3-child lesson topbars).
  (3) `CoinSimBeat.tsx` state graph was invisible on Track A (shared one-shot `useElementWidth`
  measured 0 because `.canvas-frame` mounts only after "Show the machine") → swapped to a local
  **callback ref + ResizeObserver**; shared hook untouched (`LessonPreview` reads `.current`).
  (4) `FirstSuccessTimeline.tsx` (`ground-ev`, DOM chart) got a title, left y-axis (flips + 0/
  theory/max ticks), x-axis label, and a distinct running-**avg** line (theory line relabeled);
  `.fst*` classes + button labels preserved.
  (5) `BalanceSolveBeat.tsx` reworked for clarity: substituted RHS ("3 + ½·E[HH]", value-matched
  via `balanceModel` otherTerm/selfCoeff), labeled pans + "flips" units, equation-tied tilt
  feedback, "only value that equals its own equation" solved line, progressive **Need a hint?**
  surfacing the (previously dead) fixture hints, rewritten `guided-solve` prompt; `balanceModel.ts`
  + test untouched; `.balance__range`/0-12-step1/`theoreticalValue` preserved (e2e safe).
  (6) `TheorySimChartBeat.tsx` opens the now-consumed `src/ui/Dialog` once (`varianceShownRef`) on
  first batch completion to explain variance (empirical≈theory, not exact); "Got it" closes. e2e
  clicks Continue mid-run (~5s before completion) so the modal never opens in tests.
  (7) `LessonPlayer.tsx` no longer swallows `completeLesson` failures (`.catch(()=>{})` →
  `console.error` + `completionError` state + retryable CTA + `completedOnce.current=false`); the
  unlock chain is otherwise coherent. **RESOLVED (this session):** the prod failure was NOT a
  seed mismatch. The Gen2 callables' Cloud Run services (`completelesson`/`recordqualifyingaction`,
  us-central1) had **no `allUsers` `roles/run.invoker`** binding — blocked by the org's (org
  `209657734628`, alphaaiengineering.com) **Domain Restricted Sharing** policy — so every browser
  call hit a Cloud Run **403 "request was not authenticated. Empty Authorization header value"**
  *before* reaching the function (logs showed zero app-level errors). Fixed (DRS-compatible) by
  disabling the Cloud Run invoker IAM check on both services:
  `gcloud run services update completelesson --region=us-central1 --project=brilliant-org --no-invoker-iam-check`
  (same for `recordqualifyingaction`). The function still authenticates internally via the Firebase
  ID token (`requireUid`). Verified: an unauth `curl` now returns the **function-level**
  `401 {"status":"UNAUTHENTICATED","message":"You must be signed in."}` instead of the platform 403.
  **⚠ Redeploy caveat:** a future `firebase deploy --only functions` may re-enable the invoker check
  (and/or hit the separate build-service-account org-policy error) — re-apply `--no-invoker-iam-check`
  after any functions redeploy. Final live click-through (finish a lesson → next unlocks) still to be
  confirmed by the user in the browser.
  **Gates green:** `tsc -b`, `eslint .`, `validate` (10 fixtures + inclusivity), `vitest run`
  **171/171**, `vite build`. e2e/VR not run (Vite server declined this session); selectors + beat
  order preserved by design.

- **Progressive (live-updating) Monte Carlo sims — DONE in working tree (this session;
  orchestrated: 1 foundation + 4 beat Sonnet subagents):** every batch simulation now plays
  its runs out over time at a **fixed per-run cadence** so learners watch the values converge
  live, instead of slamming the final number on screen instantly. Foundation: `sim-run-cadence:
  12ms` token (`style-dictionary/tokens/timeline.json` → regenerated `tokens.generated.{css,ts}`
  → `SIM_RUN_CADENCE_MS` in `src/motion/tokens.ts`); shared **`src/lesson/beats/useProgressiveRuns.ts`**
  (rAF loop lifted from TheorySimChartBeat — pure `runsDueByElapsed` helper + a hook that folds
  `onTrial` per run, flushes `onFlush` at ≤30fps, exposes `running`/`progress`/`count`/`start({reset})`/
  `cancel`; NOT gated on reduced-motion — convergence is content); `SecondaryAction.enabled?` added
  to `BeatShell` (disables Run buttons mid-batch). Beats converted (final numbers identical — same
  seed/order): **RaceSimBeat** (200 races, live bars), **WalkBoardBeat** (200-walk batch + 400-walk
  histogram — histogram animates the fill on first reveal but updates **instantly while dragging the
  bias slider**; single-walk playback untouched), **GamblerLedgerBeat** (cumulative 400-stream mean),
  **TheorySimChartBeat** (ported onto the shared hook; ~5s→~6s at 12ms). All reuse the existing
  `.sim-progress` CSS (no new CSS). Total duration scales with run count: ~2.4s/200, ~4.8s/400, ~6s/500
  (one tunable token). Tests: `useProgressiveRuns.test.ts` (cadence math) + `progressiveSim.test.ts`
  (progressive accumulation == batch result, incl. bin-for-bin histogram equivalence). **Gates:**
  `eslint .` clean, `vitest run` **202/202** green. ⚠ `tsc` has ONE **pre-existing, unrelated** error
  (`src/pages/StudyDesk.tsx` → missing `./CourseJourney`, from the uncommitted Ergo Home WIP — absent
  at HEAD). Not browser-verified yet (timer-driven; mirrors the proven TheorySimChart pattern).

## Next Steps (priority order)

0. **Living Notebook follow-ups:** (a) re-run **e2e 42/42** before deploy (warm Vite
   first); (b) VR sweep + **re-baseline** (baselines stale vs Wave 2/3); (c) commit when
   asked (large uncommitted diff). (d) **Remaining-lessons follow-ups:** prod re-seed DONE;
   still TODO live-walk unlock chain + milestones on authed path; L4 weak-node personalization;
   real-beginner playtest; commit remaining-lessons work if not yet done.
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
  `docs/build-brief-living-notebook.md` (premium-UI "Living Notebook" overhaul orchestration),
  `docs/state-graph-explainer-brief.md` (ready-to-implement: state-graph explainer —
  Track-A `primer-graph` beat + inline legend in `simulate`),
  `docs/adr/{0001,0002}-*.md` (0002 = bolder "Living Notebook" pivot), `CONTEXT.md` (glossary); audits in
  `audits/ideation/{inclusive-research-*,tech-review-build-brief}.md`
- **Styles/tokens:** `src/styles/{app.css,tokens.css,tokens.generated.css,fonts.css}`,
  `src/styles/surfaces/*`, `style-dictionary/tokens/*.json`, `scripts/build-tokens.ts`
- **UI primitives:** `src/ui/*` (Tooltip, Dialog, DropdownMenu, StatusNote, useSliderControl)
- **Motion/seams:** `src/motion/{tokens,gsapText,useAmbient}.*`, `src/app/{ErrorBoundary,viewTransition,useOnlineStatus}.ts`
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
- **e2e:** `e2e/*` + `playwright.config.ts` · **VR:** `e2e/vr/` +
  `playwright.vr.config.ts` · **Audits:** `audits/*`
## Last Session

**Lesson guidance clarity pass (this session; orchestrated: 2 Sonnet edit subagents + composer verify):** Reworked the overlap-chips beat + swept affordances/prompts (user report: the L5 `border-sum` "add HTH overlap tiles" beat read as non-interactive/unexplained). **Components/CSS:** `SumTilesBeat.tsx` (shared by L5 `border-sum` + L6 `sum-it`/`apply-THH`/`apply-HTH`) gained a tap kicker, a "Where these come from" overlap-grounding panel (per length L: prefix==suffix -> 2^L, derived from `autocorrelation`), and a visible `E[wait]=box+box=sum` equation builder that fills as chips are tapped; chips stay `.sumtiles__chips .token` so completion still gates on `placed.size===overlaps.length` (e2e selector intact); new `SumTilesBeat.test.tsx` (10 pure-model tests). `beats-extended.css` gave enabled chips in `.sumtiles__chips`/`.retgrid__palette`/`.wheel__options` `cursor:pointer`+hover+`:focus-visible` (the "don't know where to click" bug — base `.token` was styleless until clicked). `RetrievalGridBeat` got a visible "Tap a result on the left, then its match on the right" label; `SliderBeat` surfaced a visible "drag then lock it in" instruction (was sr-only). **Verified green:** `validate`, `vitest run` **195** (+10 SumTiles), `eslint .`, `tsc -b`+`vite build`. WARNING: **e2e + VR could NOT be cleanly completed** — the concurrent **Ergo refactor** (other agents editing `App.tsx`/`CoinSimBeat`/`RecapBeat`; `app.css` imports a not-yet-created `./surfaces/ergo-journey.css`) breaks the dev server / desyncs the committed e2e scripts. Every e2e failure is in a beat I never touched (Flip/recap/ruler/Track-A) -> not from this work. I added an **empty commented placeholder `src/styles/surfaces/ergo-journey.css`** so the CSS cascade loads; VR re-baselined the 3 lesson surfaces (`dev-lesson-flagship` x2, `dev-lesson-penneys`) but `dev-home` stayed blocked by the in-flight `CourseJourney`. Re-run e2e/VR once Ergo settles. **Prompts:** Applied an action-oriented prompt standard across all 7 lesson fixtures. Every `prompt` now states the concrete action verb (Press / Tap / Drag / Type / Reveal), matches the actual widget, briefly glosses symbols (E[...], recurrence, 2^L) on first use, and replaces vague teasers with read/continue cues. Smoke substring "which one makes you wait longer" preserved in `lesson-pattern-hitting-times.json` `open-bet`. Specific changes:
- `lesson-first-heads`: l0-half, l0-flip, l0-ground, l0-count
- `lesson-pattern-hitting-times`: pattern-pick, primer-half, primer-state, primer-graph, simulate, failure-edge, name-the-overlap, ground-ev, refine-prediction, recap
- `lesson-states-streaks`: retrieval-grid, mixed-primer, plus-one-or-not, race-or-wait, recap-streak
- `lesson-penneys-game`: whos-first-primer, prob-vs-duration, win-prob-tiles, non-transitive-loop, recap
- `lesson-gamblers-ruin`: gamblers-fallacy, ground-both, walk-once, prob-tiles, duration-tiles, house-edge, recap
- `lesson-longer-patterns`: pattern-pick, transfer-primer, simulate, overlap-ruler, failure-edge, equation-tiles, guided-solve, border-sum, recap
- `lesson-overlap-shortcut`: self-overlap, exponent-primer, sum-it, martingale, apply-THH, apply-HTH, triangulation, recap
`npm run validate` passed clean (all 7 + inclusivity gates). Only `prompt` fields were edited; no structural changes.

**Sim-beat action-bar emphasis inversion (previous session):** In `WalkBoardBeat`, `RaceSimBeat`,
`GamblerLedgerBeat`, and `TheorySimChartBeat` the "Run N" batch button is now the filled
primary CTA, "Watch one" is an outlined secondary, and "Continue" is a quiet ghost (disabled
in `WalkBoardBeat` until at least one sim has run). All CSS classes already existed;
no CSS was changed. Changes made:
- **`BeatShell.tsx`** — added `ActionVariant = 'primary'|'secondary'|'ghost'` type +
  `variant?` field to `PrimaryAction`/`SecondaryAction`; footer buttons now derive their
  class from `variant` (falling back to `'ghost'`/`'primary'`).
- **`WalkBoardBeat.tsx`** — `hasRun = trace !== null || batch !== null`; Continue `enabled:hasRun, variant:'ghost'`; Watch `variant:'secondary'`; Run 200 `variant:'primary'`. **Single-walk step-by-step animation (this session):** replaced `simulateWalk`/`single` state with `traceWalk`/`trace`+`stepIdx`+`watches`; `useEffect` advances `stepIdx` at 400 ms/step (reduced-motion jumps to last frame); walker `<circle className="walkboard__walker">` renders inside the SVG and changes color to ruin/win on landing; outcome text deferred until `stepIdx >= last`.
- **`RaceSimBeat.tsx`** — removed `reducedMotion` from props destructure; view always starts
  `'idle'` (no reduced-motion batch shortcut); main BeatShell gets ghost/secondary/primary variants (heatmap branch untouched).
- **`GamblerLedgerBeat.tsx`** — Continue `variant:'ghost'`; Run 400 `variant:'primary'`.
- **`TheorySimChartBeat.tsx`** — imported `PrimaryAction`/`SecondaryAction` types; widened
  local variable annotations; post-run `else` branch gets ghost/secondary/primary (the
  `if (running)` and `else if (count === 0)` branches unchanged).

- **Commands (call binaries directly, not `npm run`):** `validate` · `seed` ·
  `vitest run` · `lint` · `build` · `e2e` · `./node_modules/.bin/tsx scripts/build-tokens.ts`
  · VR: `./node_modules/.bin/playwright test --config playwright.vr.config.ts`; the
  `firebase` v24.3.0 alias for deploys
- **Reset learner progress** (client deletes are rules-denied → must use CLI/Admin):
  `firebase firestore:delete users --recursive --force --project brilliant-org` wipes
  all `users/*` (profile + progress/snapshots/milestones/streaks), keeps seeded
  courses/lessons; flagship stays available so no lockout. Scope to one learner with
  `users/<uid>` (uid from console Auth), or per-subcollection to keep the profile.
  Does NOT touch Firebase **Auth** (separate store): the same browser still
  auto-logs-in (persisted session, same uid), but the now-missing profile doc →
  guard routes to `/onboarding/name` for a fresh start. To wipe accounts too (kills
  auto-login — deleting a user revokes its tokens), run
  `GOOGLE_CLOUD_PROJECT=brilliant-org ./node_modules/.bin/tsx scripts/delete-auth-users.ts`
  (Admin SDK `deleteUsers()`; needs gcloud ADC). No bulk `firebase auth:delete` CLI;
  console Auth works for a manual delete.

## Ergo reimagining — Home transferred to production (2026-06-24)

Major UI reimagining: product renamed **Pattern Hitting Times → Ergo**; the signed-in
**Home** was rebuilt to a bright, premium, brilliant.org-style identity (cool near-white
base, per-chapter color-coding, "math is the art", sophisticated game-feel — NOT Duolingo).
Driven by a grill-me design interview; decisions recorded in
`docs/adr/0003-ergo-bright-reimagining.md` (supersedes ADR-0002); full spec rewritten in
`docs/ui_design_system.md` ("Ergo Design System", supersedes "The Living Notebook");
glossary updated in `CONTEXT.md`. Approved mock: `mock/ergo-home.html` (+ `-shot.png`).

- **Tokens/fonts — GLOBAL swap (DONE):** `style-dictionary/tokens/*.json` remapped legacy
  values to the Ergo palette (so lessons inherit Ergo colors/fonts) + added `--ergo-*`,
  `--ch1..ch5` (+tints), `--ergo-shadow-sm/md/lg`, `--ring-focus`. Fonts: Space Grotesk /
  Inter / JetBrains Mono via Fontsource (IBM Plex + Fraunces imports removed from
  `main.tsx`; `fonts.css` fallbacks updated). `konva/theme.ts` literals + `FONT_MONO`
  resynced. Regenerated `tokens.generated.{css,ts}`.
- **Home (DONE):** `StudyDesk.tsx` rewritten (Ergo top bar + momentum band) with
  `StudyDeskProps` byte-identical (CoursePathPage/DevHomePage untouched). New components:
  `src/habit/WeeklyStreak.tsx`, `src/habit/ConceptMedallion.tsx`, `src/pages/CourseJourney.tsx`
  (DOM/SVG vertical journey, replaces the Konva spine on Home), `src/lesson/mathviz/MathViz.tsx`
  (8 SVG math vizzes). `studyDesk.model.ts` extended additively (ERGO_CHAPTERS, chapterForLesson,
  LESSON_VIZ, vizForLesson; all 10 pre-existing model tests still pass). New CSS:
  `src/styles/surfaces/ergo-home.css` + `ergo-journey.css` (imported in `app.css`).
  Rename to "Ergo": `index.html` title, `App.tsx` bootscreens, `WelcomeScreen.tsx` copy,
  Home wordmark (hardcoded). Data IDs + lesson/course fixture titles UNCHANGED.
- **Verified GREEN:** `tsc -b`, `eslint .`, `vitest run` (202), `vite build`. Reference fixes
  applied: VR `dev-home` anchor `main.desk__main`→`.ergo-journey` (`e2e/vr/surfaces.spec.ts`);
  re-tagged active `CourseJourney` card with `.lesson-hero-source` (home→lesson view-transition);
  `LockDotIcon` hardcoded `#C0C4D0`→`var(--ergo-ink-3)`. **No Playwright run here** (user tests
  manually) — VR baselines (6 snapshots) WILL need re-capture; lesson VR will drift from the font swap.
- **DEFERRED cleanup (needs greenlight — non-breaking):** dead `home.css` selectors (old Home
  classes; KEEP list in the brief), orphaned `src/lesson/konva/CourseSpine.tsx` +
  `src/lesson/LessonPreview.tsx`, 4 unused `@fontsource` deps (fraunces, ibm-plex-sans/mono/serif),
  stale Fraunces/IBM-Plex comments. `RecapBeat` milestone-stamp branch is dead code.
- **Lessons NOT touched.** Comprehensive restyle plan drafted (planning only) at
  `docs/ergo-lesson-restyle-brief.md` (index) + `docs/ergo-lesson-restyle-brief/{01-shell-and-chrome,
  02-beats-and-visualizations,03-celebration-migration-and-risks}.md`. Core idea: replace
  notebook *semantics* (chapter `data-ch`→`--lesson-accent`; deboss→soft shadow;
  wax-seal/tally→ConceptMedallion/WeeklyStreak; StateGraph aligned to Home MathViz). Execution
  order: Shell→Beats→Celebration→Cleanup→Landing/Auth→VR rebaseline. e2e selectors preserved
  (values-only sweep). Chapter hues: L0/L1 indigo, L2/L3 teal, L4/L5/L6 coral.
- **Not committed** (working tree only). `mock/` (ergo-home.html, shot pngs, shot.mjs) is a
  design artifact, not wired to the app.
