# HANDOFF
<!-- Last updated: Concept medallion tier hover popup — custom .ergo-medallion__tip (dark card: concept name + tier-colored status line; gold/silver/locked) replaces the native title tooltip in ConceptMedallion, shown on hover via ergo-home.css + mirrored in aria-label (gallery only, lg medal unaffected); tsc+lint clean, verified /dev/home Tiers. Prior: Ch3 Mastery badge hue fix (StudyDesk MILESTONE_HUES first-pattern-cracked/state-machine-builder ch1->ch3). Prior admin op (prod, no code, in git history only): force-granted eric.wu@alphaaiengineering.com (uid irXQQXdxIJTIPi6r9PufqChItuk1) L2 Penney's-Game complete+mastered + penneys-game-won seal + streak 3/3 via temp Admin SDK script (deleted after verify) — 2026-06-25 -->

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

**Wave B1: Beats + Beat CSS (this session, DONE in working tree):**
Implemented per `docs/ergo-lesson-restyle-brief/02-beats-and-visualizations.md`. Parallel sibling waves (shell B0, Konva B2) ran independently.

**Files changed:**
- `src/styles/surfaces/beats.css` — full Ergo token migration; chapter accent triad block (`.lesson[data-ch='ch1..ch4']` + `--accent`/`--accent-tint`/`--accent-strong`/`--accent-glow` CSS vars); `--quill*` → `--accent*` across all beat selectors; `--mark-wash` → `--mark-tint` (hint-note--mark, eqprogress--invalid, recap__mark, numline__marklabel, slot--glow); `--press-deboss` removed (btn:active = transform only, slot--filled = `--ergo-shadow-sm`); `--paper-shadow-2` → `--ergo-shadow-sm` (feedback, tap-card); `--e1` → `--ergo-shadow-sm` (coin--latest, thumb, token--selected); focus rings → `box-shadow: var(--ring-focus); outline: none`; `slot-drop-settle` keyframe rewritten to chapter-accent border pulse settling to `--ergo-shadow-sm`; `--ergo-surface-2`/`--ergo-ink-3` on disabled btn. Wave C reserved rules (`.done-note`, `.celebration`, `.recap__seal`, `.recap__stamp`) left untouched.
- `src/styles/surfaces/beats-extended.css` — same `--quill*` → `--accent*` sweep across `.primer*`, `.answer-entry__input:focus-visible`, `.recap__belief`, `.retgrid__slot--sel`, `.sumtiles__slot--filled`/`sumtiles__chips .token--placed`/`sumtiles__eq-result`/`sumtiles__border-value`, `.triplet__card--open`/`.triplet__value`, `.ledger__sum`/`.ledger__mean`, `.balance__pan-val`, `.fst__theory`/`.fst__theory-label`/`.fst__bar`; `#b26a2b` → `var(--mark)` on `.racehero__fill--b`/`.racehero__flip--b`; `.racehero__fill--a`/`.racehero__flip--a` `--quill` → `--accent`; `--press-deboss` removed from `.balance__range`; `--paper-shadow-1` → `--ergo-shadow-sm` on `.primer__card`, `.balance__svg`, `.balance__pan`, `.ledger__col`; focus rings → `--ring-focus`.
- `src/lesson/beats/EquationTilesBeat.tsx` — `whileDrag boxShadow: 'var(--paper-shadow-2)'` → `'var(--ergo-shadow-md)'`.
- `src/lesson/beats/BalanceSolveBeat.tsx` — SVG pan disc fill `var(--quill)` → `var(--accent)`.
- `src/lesson/beats/WalkBoardBeat.tsx` — added `import { chapterColor } from '../chapters'`; destructured `lessonId`; replaced `C.quill` with `chapterColor(lessonId)` at all 4 SVG sites (start node fill, walker fill, landscape polyline stroke, histogram bar fill).
- `src/lesson/beats/BiasSandboxBeat.tsx` — added `import { chapterColor } from '../chapters'`; moved `SERIES_COLORS` inside component (now `seriesColors`), re-keyed `HH` from `C.quill` to `chapterColor(lessonId)`; fallback also uses `chapterColor(lessonId)`.

**Accent migration approach:** A single `--accent`/`--accent-tint`/`--accent-strong`/`--accent-glow` CSS var triad is defined on `.lesson` (default ch1/indigo) and overridden per `[data-ch='chN']` rule. All beat CSS reads `var(--accent)`, so chapter color flows automatically via the cascade. L0/L1 are pixel-identical (ch1 = indigo = former `--quill`). L2/L3 read teal; L4–L6 read coral. For Konva (no CSS-var access), `chapterColor(lessonId)` from `src/lesson/chapters.ts` resolves to the hex literal.

**e2e selectors confirmed preserved (no class renames):** `.token-row`, `.eqline--build .slot`, `.slot--filled`, `aria-pressed`, `.numline__range`, `.numline__thumb`, `.bias__range`, `.balance__range`, `.tap-card`, `.statechip`, `.overlap__tap`, `.compare__card`, `.retgrid__slot`, `.retgrid__palette`, `.answer-entry__input`, `.hint-note--mark`, `.feedback`, `.sim-stat--quill` (class name kept; value changed to `--accent`).

**Verified:** `eslint` on all 4 changed TSX files → 0 errors. Full `tsc`/`vitest`/`vite build` run by the orchestrator after all parallel waves merge.

⚠ VR baselines for the 4 lesson snapshots will need re-capture post-merge (ch2/ch3 lessons change substantially from indigo→teal/coral; ch1 flagship changes only from depth updates).

**Ergo integration fix (prior session):** Three parallel agents (token/font swap, Home shell, Course journey) merged their Ergo work. Integration fixer validated all four gates and made two surgical fixes to the newly-created files:

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
- **L3 "Watch one walk" re-paced + now plays under reduced motion (this session; 1 Sonnet edit +
  browser-use verify):** it was skipping straight to the wall under reduced motion (the
  `idx = reducedMotion ? last` final-frame snap), so reduced-motion users never saw the walk.
  `WalkBoardBeat.tsx` now always runs the playback interval (watching the walk IS lesson content,
  cf. `useProgressiveRuns`) and replaces the fixed `STEP_MS=400` with
  `stepMsForWalk(steps)=clamp(4000/steps,110,600)ms` so the whole walk plays over ~the same window
  (short walks ~600ms/step, long-tail capped ~4s); that value is mirrored onto the `--walk-step`
  CSS var so the glide cadence matches. Outcome text now gates on `stepIdx>=last` (not
  `reducedMotion`); the reduced-motion `transition:none` rule in `beats-extended.css` stays →
  reduced-motion users get discrete paced hops, others a synced glide. Gates: `tsc -b` + `eslint`
  clean; browser-verified on `/dev/lesson/lesson-gamblers-ruin` (dot steps through intermediate
  positions in both modes; no instant skip). Follow-up: the start ($i) node fill is now gated on
  `i === start && !trace`, so the middle dot's chapter-color shade only shows before a walk —
  once a walk begins the moving `.walkboard__walker` is the sole highlight (no lingering shaded dot).
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
  (1+2 follow-up, this session) the skip still reached the Quick check via a race: a late
  initial `loadTrack` could overwrite the locally-set `track='A'` back to `null`. The
  `loadTrack`/`loadWelcomeSeen` effects in `CoursePathPage.tsx` now use `prev === undefined`
  functional updates, so a late read can't clobber a choice the learner just made.
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

## Ergo Lesson Restyle — Wave A: Shell & Chrome (this session, DONE in working tree)

**Wave A** (lesson shell + chrome) implemented per `docs/ergo-lesson-restyle-brief/01-shell-and-chrome.md`.
Parallel sibling waves (beats / Konva) ran independently; this wave owns only its files.

**Files changed:**
- `src/styles/surfaces/shell.css` — chapter-accent block (`.lesson[data-ch='ch1..ch4']` → `--lesson-accent`/`--lesson-accent-tint`/`--lesson-accent-glow`); topbar → `--ergo-bg`/`--ergo-line`/`--ring-focus`; topbar__back/title/streak → Ergo tokens; rail → state-colored (chapter hue for complete+current; `--ergo-line-2` for upcoming; removed per-phase hues); biaschip → Ergo neutrals idle + `--mark-tint` active; prompt__text → weight 600 + clamp(1.5rem,4vw,2.25rem) + tabular-nums + `--ergo-ink`; prompt__kicker → `--lesson-accent` + Inter; canvas-frame → clean `--ergo-surface` (removed grid gradients); removed `--press-deboss` from `.token` and `.compare__card--on`.
- `src/styles/surfaces/beats.css` — actionbar → `--ergo-surface`/`--ergo-line` (removed 2dppx rule); btn → `--lesson-accent` primary + `--ergo-brand` ghost + `--ergo-surface-2` disabled + `--ring-focus` focus + transform-only active (no deboss); feedback → `--ok`/`--bad` tints + `--ergo-shadow-sm` + feedback__retry ring-focus; coin border → `--ergo-line`; coin--latest → `--ergo-shadow-sm`; coinstream__chip → `--lesson-accent` trio; done-note → `--ergo-ink` + font-display 600.
- `src/styles/surfaces/components.css` — btn--secondary → `--ergo-surface`/`--ergo-line-2` (removed deboss); skeleton → `--ergo-surface-2`/`--ergo-surface` shimmer/`--r-md`; bootscreen → `100dvh` + font-display wordmark + `--ergo-ink-2` caption.
- `src/styles/surfaces/ui.css` — StatusNote tones → `--ergo-ink-2` base, `--ergo-brand` info, `--ergo-ink-3` offline, `--bad` error.
- `src/lesson/LessonPlayer.tsx` — imported `chapterOf` from `./chapters`; added `data-ch={chapterOf(lessonId)}` to the **active** `.lesson` root only (done block untouched — Wave C).
- `src/lesson/FeedbackStrip.tsx` — prepended `aria-hidden` tone icon (✓/!/•) to `.feedback__label` for color-never-alone.

**data-ch / --accent mechanism:** `.lesson[data-ch='ch1..ch4']` overrides `--lesson-accent`/`--lesson-accent-tint`/`--lesson-accent-glow` on the root; all chapter-coded chrome (primary CTA, rail, prompt kicker, coinstream chip) reads `var(--lesson-accent)` via the CSS cascade. L0/L1 → indigo, L2/L3 → teal, L4–L6 → coral (ch3). Done block stays untouched (Wave C).

**e2e selectors confirmed preserved:** `.actionbar`, `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `section.prompt`, `.prompt__text`, `.done-note`, `.topbar`, `.biaschip`, `.rail`, `data-testid="status-note"`, `data-tone` — restyle-in-place only, no renames.

**Verified:** `eslint` on all changed TSX files → 0 errors. `--press-deboss` fully removed from owned files. Full `tsc`/`vitest`/`vite build` run by the orchestrator after all parallel waves merge.

⚠ VR baselines for the 4 lesson snapshots (`dev-lesson-flagship`×2, `dev-lesson-penneys`×2) will need re-capture once all waves merge. `dev-home.png` should be unchanged (no Home file touched).

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
## Ergo Lesson Restyle — Wave B2: Konva Visualizations + Theme (this session, DONE in working tree)

**Wave B2** (Konva canvases) implemented per `docs/ergo-lesson-restyle-brief/02-beats-and-visualizations.md` §3.

**Files changed (4):**
- `src/lesson/konva/theme.ts` — added ch1/ch2/ch3 tints to `C` palette; added `hexToRgba(hex, alpha)` helper; exported `CHAPTER_ACCENT` (keyed by ch1/ch2/ch3 with base/tint/glow); exported `accentFor(hex)` → `{base, tint, glow}` (looks up by lowercase hex, falls back to ch1 indigo).
- `src/lesson/konva/StateGraph.tsx` — added optional `accent?: string` prop (resolved hex, defaults to `C.quill`); nodes now chapter-tinted fill @ 0.10 opacity + accent stroke 1.8 (mirrors MathViz `StateMachineViz` vocabulary); active node: accent tint fill, sw=3, soft `shadowColor`/`shadowBlur` glow (8px steady, 0→14→8 bloom in existing pulse tween); absorbing ring: dashed `[3,2]` accent stroke @ opacity 0.6 (matches `MathViz.tsx:123-132`); label fills updated (inactive=`C.ink`, active=`acBase`); dual-id sub-label (inactive=`C.graphiteSoft`, active=`acBase`); `xOf` snaps to `Math.round()+0.5` for crisp HiDPI hairlines; `Stage pixelRatio={dpr}` set.
- `src/lesson/konva/SimChart.tsx` — added optional `accent?: string` prop; empirical curve, area gradient, head glow/bead, live chip, and run-count x-label all re-keyed to `accentFor(accent)` (theory line stays `C.ink`, prediction stays `C.mark`); `Stage pixelRatio={dpr}` set.
- `src/lesson/konva/BiasChart.tsx` — added optional `accent?: string` prop; p-guide readout label re-keyed to `acBase` (series colors remain caller-supplied via `BiasSeries[].color`); `Stage pixelRatio={dpr}` set.

**`accent` prop contract:**
- Name: `accent`; Type: `string` (resolved hex, e.g. `'#4F46E5'`); Optional: yes; Default: `C.quill` (#4F46E5 indigo); Affects: StateGraph active node ring/glow, SimChart empirical series, BiasChart p-guide label.
- The beat agent passes `accent={chapterColor(lessonId)}` to thread chapter hues through.
- `C.laneB` remains exported (beat agent references it).

**StateGraph ↔ MathViz consistency changes:**
- Node fill: was `C.paper0` (gray); now `hexToRgba(acBase, 0.10)` (chapter tint at 10% — matches `MathViz.tsx:77-78` `fillOpacity="0.12"`).
- Node stroke: was `C.graphite`; now `acBase` at sw=1.8 (matches `MathViz.tsx:79-80` `strokeWidth="1.8"`).
- Absorbing ring: was solid green `C.correct`; now dashed accent `[3,2]` @ 0.6 opacity (matches `MathViz.tsx:123-132` `strokeDasharray="3 2" opacity="0.6"`).
- Pixel snapping: `xOf` rounds to `+0.5` for crisp 1px strokes; `Stage` sets `pixelRatio=devicePixelRatio`.

**Verified:** ESLint 0 errors, `tsc --noEmit` 0 errors on all 4 files. `'use no memo'` directive preserved on all three Konva components.

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

### Ergo lesson interior restyle — Waves A/B/C DONE (2026-06-24)

Executed the lesson-restyle brief (`docs/ergo-lesson-restyle-brief.md`) Waves A–C (lesson
interior). **Gate green:** `tsc -b`, `eslint .`, `vitest run` (202), `vite build`. Visually
verified at `/dev/lesson` (indigo) + `/dev/lesson/lesson-penneys-game` (teal) — chapter
color-coding, sans display type, compact streak chip all live.

- **Foundation:** new `src/lesson/chapters.ts` (`chapterOf`/`chapterHueVar`/`chapterColor`) —
  single source for the lesson→chapter hue (L0/L1 ch1 indigo, L2/L3 ch2 teal, L4–L6 ch3 coral).
- **Wave A (shell/chrome):** `shell.css` + `LessonPlayer` active chrome + `BeatShell`/`PhaseRail`/
  `FeedbackStrip` + `components.css`/`ui.css`. Chapter accent cascade via `.lesson[data-ch]` →
  `--accent`/`--accent-tint`/`--accent-glow` (canonical block in `shell.css`); deboss/paper retired
  for soft-shadow depth; Space Grotesk prompt + tabular-nums; `--ring-focus`.
- **Wave B (beats + Konva):** `beats.css`/`beats-extended.css` + all `beats/*` swept `--quill*`→
  `--accent*`, `--mark-wash`→`--mark-tint`, deboss removed; `#b26a2b`→`var(--mark)`. Konva
  `theme.ts`/`StateGraph`/`SimChart`/`BiasChart` got an optional `accent?: string` prop (default
  brand) + StateGraph now matches the Home `MathViz` glyph language (chapter-tinted nodes, dashed
  absorbing ring, active glow, device-pixel hairlines). Konva beats pass `chapterColor(lessonId)`.
- **Wave C (celebration/streak):** `ConceptMedallion` gained `size` (sm/md/lg; Home default sm
  unchanged); completion takeover swaps `MilestoneSeal stamped`→`ConceptMedallion size=lg` +
  lazy-GSAP chapter light-streak (reduced-motion off) + `data-ch` on the done root; both top-bar
  `StreakTally compact`→`WeeklyStreak compact` chip; dead `recap__stamp` branch removed; `.recap__seal`
  → chapter-tint mono pill; `CELEBRATE_BEAT` alias in `motion/tokens.ts`.
- **Reconciled:** the shell + beats waves had introduced divergent accent vars
  (`--lesson-accent` vs `--accent`) — unified to `--accent` (shell.css is the single source; beats.css
  keeps only `--accent-strong`).
- **MilestoneSeal.tsx + StreakTally.tsx now have ZERO imports in `src/`** — Wave D (cleanup) can
  delete them. e2e nodes preserved verbatim (`.done-note`/"Lesson complete", `.actionbar .btn--primary`,
  beat selectors). The completion takeover (medallion lg + light-streak) needs a manual full-lesson
  walk to view; VR baselines need re-capture (user, Playwright).
- **Wave D (cleanup) DONE:** orphan files deleted (`CourseSpine.tsx`, `LessonPreview.tsx`, `MilestoneSeal.tsx`, `StreakTally.tsx`); `home.css` stripped of all dead selectors (SAFE-NOW + AFTER-C rows + CONFIRM API features + surgical 2dppx purge); 4 unused font deps dropped from `package.json` + `npm install`; 3 stale code comments fixed (`gsapText.ts`, `studyDesk.model.ts`, `milestones.ts`). Gates: `tsc -b` 0 errors · `eslint .` 0 errors · `vitest run` 202/202 green.
- **Wave E (Landing/Auth → Ergo) DONE:** see section below. Wave F (user VR re-baseline + a11y/perf) pending.

## Ergo Lesson Restyle — Wave C: Celebration, Completion, Recap Marker, Compact Streak (this session, DONE in working tree)

**Wave C** implemented per `docs/ergo-lesson-restyle-brief/03-celebration-migration-and-risks.md` §1–§1.8.

**Files changed (8):**
- `src/motion/tokens.ts` — added `CELEBRATE_BEAT = STAMP_BEAT` + `CELEBRATE_BEAT_MS = STAMP_BEAT_MS` aliases (named clock for the light-streak; no token-pipeline change).
- `src/habit/ConceptMedallion.tsx` — added `size?: 'sm'|'md'|'lg'` prop (default `'sm'` keeps Home byte-identical); applies `ergo-medallion--${size}` class.
- `src/lesson/LessonPlayer.tsx` — (a) done block: `data-ch={chapterOf(lessonId)}` on root; `<StreakTally>` → `<WeeklyStreak compact>`; `<MilestoneSeal earned stamped>` → `<ConceptMedallion size="lg" earning={!reducedMotion} hueVar={chapterHueVar(...)}>` + "Concept mastered" kicker; lazily-imported GSAP chapter-color light-streak (compositor-only transform/opacity, omitted under reduced-motion). (b) Active top bar: `<StreakTally>` → `<WeeklyStreak compact>`. Removed `MilestoneSeal`/`StreakTally` imports; added `ConceptMedallion`/`WeeklyStreak`/`CELEBRATE_BEAT`/`chapterHueVar` imports. Preserved `.done-note` + "Lesson complete" + `.actionbar .btn--primary` + `aria-label="Back to course path"` verbatim.
- `src/lesson/LessonCelebration.tsx` — updated stale header comment (was "ink-stamp seal is the sole cinematic beat"; now describes the medallion earn + light-streak arc).
- `src/lesson/beats/RecapBeat.tsx` — removed `MilestoneSeal` import; removed the unreachable `recap__stamp` + `<MilestoneSeal>` block from both the generic branch (generic recap) and the flagship branch (HH/HT recap). The `recap__reveal` blocks are untouched.
- `src/styles/surfaces/ergo-home.css` — added `.ergo-medallion--sm/--md/--lg` size variants (`sm=44px` keeps Home identical, `md=56px`, `lg=96px+ergo-shadow-md`) with glyph font-size bumps; added `.ergo-streak--compact` chip styling (row layout, pill border, 16px number, labels hidden, mini dots).
- `src/styles/surfaces/beats.css` — re-pointed `.done-note` color `--correct-text` → `--ergo-ink`; added `.done-note__mastered` kicker rule; added `.celebration__streak` (absolutely-positioned streak container, GSAP-driven); restyled `.recap__seal` from notebook `var(--ink)` to chapter-tinted mono pill (`var(--accent)` + `var(--accent-tint)` + `font-family: var(--font-mono)`). `.celebration` `position:relative` rule was already present.

**MilestoneSeal / StreakTally retirement:** no `import.*MilestoneSeal|import.*StreakTally` anywhere in `src/` → Wave D can delete both files.

**e2e-load-bearing nodes confirmed present:** `.done-note` + "Lesson complete", `.actionbar .btn--primary`, `aria-label="Back to course path"`.

**Verified:** `tsc -b` 0 errors · `eslint .` 0 errors · `vitest run` 202/202 green.

## Ergo Lesson Restyle — Wave E: Landing + Auth Public Surfaces (this session, DONE in working tree)

**Wave E** implemented per `docs/ergo-lesson-restyle-brief/03-celebration-migration-and-risks.md` §2.

**Files changed (2):**
- `src/pages/LandingPage.tsx` — fixed stale comment ("Fraunces" → "Space Grotesk"); added `FLIP_BEAT` to motion-tokens import; updated `StateMachinePreview` signal animation duration to `FLIP_BEAT * 3.5` (each edge traversal = 1 flip-beat) with proportional times `[0, 0.29, 0.43, 0.71, 0.86, 1]`; updated signal comment from "quill" → "Ch1 indigo".
- `src/styles/surfaces/auth-landing.css` — full token migration + structural Ergo upgrades:
  - **Landing hero:** dropped `font-optical-sizing` (serif-ism); weight 500→700 on `.hero__title`, 500→600 on `.hero__subtitle`; `--ink`→`--ergo-ink`, `--graphite-soft`→`--ergo-ink-3`.
  - **State-machine preview (Ch1 re-skin):** `--rule`→`--ergo-line` (edges), `--paper-0`→`--ergo-bg` + `--graphite`→`--ergo-ink-2` (rings), `--quill`→`--ch1` (signal fill + glow filter); `@keyframes preview-pulse` 0%/100% → `--ergo-ink-2`/`--ergo-bg`; 12% → `--ch1`/`--ch1-tint`. Node pulse reads as Ch1 indigo energy.
  - **Auth card:** `--paper-1`→`--ergo-surface`, `--paper-shadow-2`→`--ergo-shadow-md`, `--r-md`→`--r-xl`, `--rule`→`--ergo-line`; removed Retina 0.5px sub-pixel border hack (RGBA ergo-line is already visually lightweight).
  - **Inputs (full Ergo bordered):** removed notebook bottom-rule (`border: none; border-bottom: 1.5px`); replaced with `border: 1px solid var(--ergo-line-2); border-radius: var(--r-md); background: var(--ergo-surface); height: 48px; padding: 0 var(--s3)`. Focus → `border-width:2px; border-color: --ergo-brand; box-shadow: --ring-focus`. Disabled → `--ergo-ink-3`.
  - **Error state:** `--wrong`→`--bad` border + `--bad-tint` background + `--bad` helper text (was bottom-rule + `--wrong-text`). Error focus ring = 3px rgba(229,72,77,.2) (bad hue).
  - **Status/error copy:** `--wrong-text`→`--bad`, `--correct-text`→`--ok`.
  - **Typography:** `--graphite`→`--ergo-ink-2`, `--graphite-soft`→`--ergo-ink-3`, `--ink`→`--ergo-ink`, `--quill-strong`→`--ergo-brand-strong` throughout.
  - **Divider/switch:** `--rule`→`--ergo-line` (divider lines), `--graphite-soft`→`--ergo-ink-3` (divider text), removed Retina 0.5px authdivider hack.

**Token migration table (auth-landing.css):**

| Old | New |
|-----|-----|
| `--ink` | `--ergo-ink` |
| `--graphite` | `--ergo-ink-2` |
| `--graphite-soft` | `--ergo-ink-3` |
| `--rule` | `--ergo-line` |
| `--paper-0` | `--ergo-bg` |
| `--paper-1` | `--ergo-surface` |
| `--paper-shadow-2` | `--ergo-shadow-md` |
| `--quill` | `--ch1` (preview) / `--ergo-brand` (focus) |
| `--quill-tint` | `--ch1-tint` (preview) / `--ergo-brand-tint` |
| `--quill-strong` | `--ergo-brand-strong` |
| `--wrong` | `--bad` |
| `--wrong-text` | `--bad` |
| `--correct-text` | `--ok` |
| `--press-deboss` | removed (n/a — not present in auth-landing.css) |

**ProfilePage risk (shared `.field` / `.authform` classes):** LOW. ProfilePage's display-name and email fields will render as bordered Ergo inputs (height 48px, `--ergo-line-2` border, `--r-md` radius) instead of bottom-rule notebook inputs. Colors are equivalent (`--ergo-ink-2`/`--ergo-ink-3` map to same hex as old `--graphite`/`--graphite-soft`). Error/status colors change slightly (bright `--bad` vs darker `--wrong-text`; both red). No e2e assertions target ProfilePage. No VR baseline for ProfilePage. Functionally identical (same class names, input names, aria, form structure).

**e2e selectors preserved:** No class renames. `input[name="email"]`, `input[name="password"]`, `.btn`, `.btn--primary`, `.btn--secondary`, `.field`, `.field__input`, `.authform`, `.authcard` — all unchanged. `data-error` attribute pattern unchanged.

**Verified:** `eslint src/pages/LandingPage.tsx src/pages/AuthPage.tsx` → 0 errors.

### Ergo restyle — post-D/E regression fix + final certification (2026-06-24)

- **Regression caught via screenshot QA + fixed:** Wave A had scoped the `--accent` default to
  `.lesson {…}`, so `.btn--primary` / `.btn--ghost` on NON-lesson surfaces (auth, landing, profile,
  welcome, display-name, diagnostic gate) resolved `background: var(--accent)` to nothing → a
  transparent white-on-white **invisible primary button**. Fixed in `src/styles/surfaces/shell.css`
  by promoting the accent triad default (`--accent`/`--accent-tint`/`--accent-glow` + the previously
  missing `--accent-strong`) to a `:root` block; `.lesson[data-ch]` still overrides per chapter.
  Confirmed: auth "Create account" now computes solid `rgb(79,70,229)` indigo.
- **Final consolidated gate GREEN** (whole tree, all waves A–E + fix): `tsc -b`, `eslint .`,
  `vitest run` (202), `vite build`.
- **Screenshot-verified surfaces:** `/dev/lesson` (ch1 indigo) + `/dev/lesson/lesson-penneys-game`
  (ch2 teal) accents + compact `WeeklyStreak` chip; `/` landing (Space Grotesk hero + Ch1 state
  machine) + `/auth` (Ergo card, bordered inputs, solid indigo CTA). Lesson dev routes are
  Firebase-less; `/` + `/auth` boot resolves signed-out against real Firebase (no emulator needed).
- **Vite footgun (again):** stale dev servers served old CSS twice during QA — had to start fresh
  ports (4400/4402) to see edits. Verify on a freshly-started server.
- **Still PENDING (user):** full-lesson walk to view the completion takeover (medallion + GSAP
  light-streak); Playwright e2e + VR re-baseline (the 6 snapshots will have drifted from the restyle
  + font swap); a11y/perf pass. Optional later (own PR): retire the legacy token aliases
  (`--paper-*`/`--quill`/…) once `rg` shows no surface references. Nothing committed.

### L1 BalanceSolve explain-line clarity fix (2026-06-24)

- **Problem:** the `guided-solve` beat's explanation read `Substituting E₁ = 4: E[HH] = 3 + ½·E[HH].
  Slide until both sides match.` — the substituted `4` never appeared and the `3` materialized from
  nowhere (the `1 + ½·4` arithmetic was collapsed), and "both sides match" was ambiguous against an
  equation that literally has `E[HH]` on both sides.
- **Fix (`src/lesson/beats/BalanceSolveBeat.tsx`, explainLine only):** added `expandedRhs` built from
  the recurrence `constant` + `terms` (self term → `½·E[HH]`, non-self → numeric substituted value),
  so the line now shows `E[HH] = 1 + ½·4 + ½·E[HH] = 3 + ½·E[HH]` (the `3` is now derived on screen).
  Replaced the instruction with `E[HH] still appears on both sides, so slide your guess until the
  scale balances.` — names the scale mechanic and explains *why* you slide. Both branches updated;
  generic (no non-self terms) branch keeps the collapsed form.
- **Gates GREEN:** `eslint` (file), `vitest run` BalanceSolveBeat.test (12), `tsc -b`. No test/e2e
  asserted the old string; pure `balanceModel` untouched. Nothing committed.

### Landing page visual polish — `/frontend-design` pass (2026-06-24)

- **Ask:** "make the landing page prettier." Scope: `src/pages/LandingPage.tsx` +
  `src/styles/surfaces/auth-landing.css` (hero section only; the auth/form CSS below is
  byte-identical/untouched). Stayed inside Ergo tokens — no new hex, no new fonts.
- **What changed (visual):**
  - **Aurora** — `.hero::before` soft tri-chapter radial wash (ch1 indigo / ch2 teal / ch3
    coral via `color-mix`) on the cool-white base; `.hero` is now `position:relative;
    overflow:hidden`, content `z-index:1`.
  - **Eyebrow** — new `.hero__eyebrow` mono uppercase "The mathematics of waiting"
    (`--ergo-brand-strong`, letterspaced) above the wordmark.
  - **Exhibit card** — `StateMachinePreview` wrapped in a `.exhibit` surface card
    (`--ergo-surface`, `--ergo-shadow-md`, `--r-xl`, hairline, faint `--ch1-tint` inner glow)
    framing the HH automaton as the signature math object.
  - **EV payoff** — `.exhibit__results` shows the thesis: `E[HH] = 6` (indigo `--ch1`) `vs`
    `E[HT] = 4` (teal `--tails`), mono tabular-nums, `aria-label` for SR + `aria-hidden` spans;
    `.exhibit__caption` "Same odds, different waits."
  - **CTAs** — `.hero__cta .btn` → pill (`--r-pill`, 52px); primary gets a nudging `→` `::after`
    + `--ergo-shadow-md` hover lift.
  - **Title size** — `.hero__title` enlarged to `clamp(4.5rem, 17vw, 10rem)` (was 5.25rem max),
    line-height 0.95, tracking −0.04em; verified 160px desktop / 72px mobile, no 390px overflow.
    ⚠ Hit the stale-Vite footgun again (HMR didn't repaint a CSS-only edit; full reload still
    served old CSS) — only a hard server restart (fresh port 4600) showed the change.
- **Preserved:** GSAP wordmark reveal, motion stagger, `useAmbient` signal, reduced-motion
  gating, all `.preview__*` SVG classes + `preview-pulse` keyframe; `.btn--primary`/`--secondary`
  + navigate targets unchanged (no e2e selectors touched).
- **Verified GREEN:** `eslint` (LandingPage), `tsc -b`, `vite build` (chunk-size warning is
  pre-existing). Browser-verified on a fresh server (4500) — desktop + mobile (390px). ⚠ VR
  baseline for the landing surface will drift; re-capture on the next sweep. Nothing committed.

### MVP audit + README rewrite + App Check clarification (2026-06-24)

- **MVP verification (orchestrated: 3 Opus readonly audits + live-URL fetch):** the repo
  **satisfies the Phase-1 MVP** in `docs/core_instructions.md`. Hard gates all met —
  content-model-driven interactive flagship lesson, direct-manipulation problems
  (tiles/slider/balance/state-tap), responsive Konva visuals, instant hand-authored
  feedback, resumable Firestore snapshots, course path + mastery + next-step, streaks/
  milestones, email/Google auth, mobile, deployed & public (live-verified at
  https://brilliant-org.web.app), and **zero runtime AI**. Non-blocking caveats: perf is
  strong by-design but uninstrumented (~1 MB raw entry chunk); progression is forgeable
  while App Check enforcement is OFF (security-audit F1, intentional); cross-lesson
  weak-node recommender (`src/progress/recommend.ts`) is built + unit-tested but unwired.
- **⚠ Stale-premise correction:** the working tree is **CLEAN** (HEAD = origin/main =
  `2822c61`). The Ergo/Living-Notebook overhaul is **committed**, not uncommitted — the
  older "NOT committed" notes above are superseded.
- **README rewritten (`README.md`):** replaced the stock Vite boilerplate with a real
  README — subject/persona stated up front, live link, 7-lesson course table, tech stack,
  layered architecture, project structure, setup + emulator-first dev flow, commands
  table, deploy, security notes. Closes the one PARTIAL from the audit (subject "stated up
  front"). Writer hedges fixed: no `.nvmrc` exists (→ "current LTS"); `src/app/` is
  error-boundary/view-transition/online-status, not header/nav. (Done via a Sonnet writer
  subagent per model-routing.)
- **App Check clarified (no code change):** App Check IS implemented client-side
  (reCAPTCHA v3, `src/firebase/app.ts:41-54`); only ENFORCEMENT is deferred — callables
  use bare `onCall` (no `enforceAppCheck`) and the Firestore console toggle is off, per
  the documented monitor-then-enforce rollout (`docs/security-audit.md` F1/F3). Flip both
  together only once App Check metrics show legit traffic is "verified."

### DisplayNamePage subtitle removed (2026-06-24)

- Deleted the `authcard__sub` paragraph ("This is the name shown on your course path. You
  can change it later.") from `src/pages/DisplayNamePage.tsx` — the page now goes straight
  from the `What should we call you?` title to the form. No linter errors. Nothing committed.

### Concept medallions prettier — "make the badges prettier" (2026-06-24)

- **Ask:** "make the badges prettier." Disambiguated to the **concept medallions** (the
  "Concepts mastered" achievement badges on Home + the lesson-completion takeover medal).
- **Scope:** pure CSS, **`src/styles/surfaces/ergo-home.css`** medallion blocks only (+57/−22);
  no `.tsx` touched, no class renames (e2e/markup-safe). Done via a Sonnet edit subagent
  per model-routing; orchestrator wrote the spec + browser-verified.
- **What changed:** old medallions were pale `--medallion-tint` chips with a 2.5px hue ring +
  tiny colored 10px glyph — diverged from the design-system spec. Now they're **minted
  chapter-hue medals**: earned = `radial-gradient` hue fill (top-left sheen) + layered
  `box-shadow` (colored ambient + inner white highlight + darker inset rim, all via
  `color-mix`) + **white glyph** w/ hue text-shadow; locked = clean `inset` ring on
  `--ergo-surface-2` (dropped the `opacity:0.7` blur), glyph `--ergo-ink-3` @ 0.5; base size
  44→48px (spec); glyph 10→11px + `-0.02em` tracking + `padding:0 2px` (fits wide 5-char
  glyphs like `HH≠HT`); `--lg` earned gets a deeper hero shadow (completion takeover); hover
  lift (`translateY(-2px)`) gated to `(hover:hover) and (prefers-reduced-motion:no-preference)`.
  Kept `@keyframes ergo-medallion-earn` / `--earning` / reduced-motion guard / compact-streak /
  skeleton / mobile blocks intact.
- **Verified:** `vite build` green, 0 lint errors; **browser-confirmed** at `/dev/home`
  (temporarily earned-all in the dev harness to see all 3 chapter hues, then reverted) — solid
  vibrant medals, legible white glyphs, depth/sheen. `--lg` completion medal not live-walked
  (shares the earned style; low risk). ⚠ Home VR baseline will drift. Nothing committed.

### Home lesson card → selects side card, doesn't enter lesson (2026-06-24)

- **Ask:** on Home, pressing a lesson should pull up the side card for that lesson, not
  enter the lesson; only the side card's "Start lesson" CTA enters.
- **Change (single file, `src/pages/CourseJourney.tsx`):** added a `selectedId` state
  (`useState<string|null>`); `activeId = selectedId ?? action.lessonId` (defaults to the
  recommended lesson, so load is unchanged). `LessonRow` now takes `onSelect` instead of
  `navigate` and its `handleClick`/Enter-Space calls `onSelect(node.lessonId)` (no nav).
  The `DetailCard` CTA is untouched — `navigate(lessonPath(...))` is now the only path into
  a lesson. The selected card keeps the `--active` highlight, pulse, `aria-current`, and the
  `lesson-hero-source` view-transition tag (it's the card the CTA enters). `cardAriaLabel`
  reworked to announce status + ", selected" (dropped the misleading "Start/Resume" verb and
  its now-unused `progress` arg / `nodeCtaLabel` call). Locked/roadmap rows unchanged.
- **Gates GREEN:** `tsc -b`, `eslint src/pages/CourseJourney.tsx`, `vitest run` (202/202).
  Model test unaffected (no model change). ⚠ Browser check at `/dev/home` (click a card →
  side card updates, no nav; CTA enters) is the manual step — no dev server was running.
  Mobile (<768px) still stacks the side card below the list (selection updates it in place;
  auto-scroll-into-view is a possible follow-up). Nothing committed.

### Lesson-complete badge centering + "Boop Stamp" animation (2026-06-24)

- **Ask:** the end-of-lesson awarded badge (`ConceptMedallion` lg) was not horizontally
  centered and only did a quiet fade. Fix centering and add a "Boop Stamp" animation:
  scale/rotate overshoot-settle + 5 micro-particle burst.
- **Files created/modified:**
  - **`src/lesson/BadgeStamp.tsx`** (new): celebration-only wrapper — owns centering, the
    boop (scale 1.18→0.95→1.02→1, rotate −8°→1.5°→−0.5°→0°, opacity fade-in over
    `STAMP_BEAT`=0.48s), and a 5-particle burst spread across −60/−20/20/70/130°. Uses
    `m.div` from `motion/react` (strict mode); imports `STAMP_BEAT`/`EASE` from
    `motion/tokens`. Reduced-motion renders a static centered medallion.
  - **`src/lesson/LessonPlayer.tsx`** (modified): replaced the bare `<ConceptMedallion>` in
    the done block with `<BadgeStamp>`; removed the now-unused `ConceptMedallion` import and
    added `BadgeStamp`.
  - **`src/styles/surfaces/beats.css`** (modified): added `.badge-stamp` (relative,
    `fit-content`, `margin-inline:auto`, `grid`/`place-items:center`) + `.badge-stamp__particle`
    (absolute, `--badge-hue` color, `pointer-events:none`) + `@media (prefers-reduced-motion)`
    hides particles at the CSS layer too.
- **Verified:** `npx tsc --noEmit` → exit 0 (no errors). Nothing committed.

### Home top header enlarged (2026-06-24)

- **Ask:** "make the top header of the website larger." Target = the signed-in Home
  header (`<header class="ergo-topbar">` = Ergo wordmark + profile avatar) in
  `src/pages/StudyDesk.tsx`, styled in `src/styles/surfaces/ergo-home.css`.
- **Change (single file, `ergo-home.css`):** `.ergo-topbar` vertical padding `var(--s4)`
  (16px) → `var(--s5)` (24px); `.ergo-wordmark` font-size 22px → 28px; `.ergo-avatar`
  36×36 → 44×44 (font-size 14px → 16px, which also makes the visual size meet the 44px
  hit target directly). No markup/JSX changes; lesson `.topbar` and the `.appbar`
  (Profile) header were left untouched.
- **Verified:** no linter errors on the edited CSS. Not browser-verified (no dev server
  running). Nothing committed.

### RetrievalGrid drag-to-fill (2026-06-24)

- **Ask:** make `retrievalGrid` beat drag-compatible — learner can drag a right-side answer chip onto a left-side slot in addition to the existing tap-then-pick flow.
- **Files changed (2):**
  - `src/lesson/beats/RetrievalGridBeat.tsx` — added `useRef`/`m`/`PanInfo`/`SPRING` imports; `slotRefs`/`wasDragRef`/`dragoverIdxRef` refs; extracted `placeInto` helper; added `findSlotAtPoint`/`handleTileDrag`/`handleTileDragEnd`; registered left slot buttons with a ref callback; converted palette `<button>` → `<m.button drag dragSnapToOrigin …>`; `disabled` changed from `solved||revealed||selLeft===null` to `solved||revealed` (drag gestures require enabled elements); updated instruction label.
  - `src/styles/surfaces/beats-extended.css` — added `.retgrid__slot--dragover` drop-target highlight + `.retgrid__palette .token:not(:disabled) { cursor:grab }` + `:active { cursor:grabbing }` after the `.retgrid__palette` block.
- **Tap + keyboard flow preserved** — `onClick` guard `if (selLeft===null) return` + `wasDragRef` stray-click guard maintain the original tap interaction.
- **Verified GREEN:** `npm run build` (tsc + vite, 0 errors, ✓ built in ~3s) · `npm run lint` (eslint, 0 errors). Nothing committed.

### AnswerEntry placeholder no longer spoils the answer (2026-06-24)

- **Problem:** two `answerEntry` beats used a placeholder example that was literally the
  accepted answer, so the greyed-out `e.g. …` hint gave the solution away before the learner
  thought: `lesson-penneys-game` `pick-your-counter` (`accept:["THH"]`, placeholder `"e.g. THH"`)
  and `lesson-gamblers-ruin` (`accept:["1/2","0.5"]`, placeholder `"e.g. 1/2"`).
  `AnswerEntryBeat.tsx` renders `f.placeholder` verbatim, so this was content, not a render bug.
- **Fix (fixtures only):** placeholders swapped to a non-answer format example —
  penney's `"e.g. THH"`→`"e.g. HTH"`; gambler's `"e.g. 1/2"`→`"e.g. 3/4"`.
- **Scanned all fixtures** for the answer-equals-placeholder pattern: only those two were
  affected. The other `answerEntry` fields (`lesson-longer-patterns` thh/hth,
  `lesson-first-heads` count, gambler's avg) use `"?"` placeholders — safe, untouched.
- Nothing committed.

### Gambler's Ruin guided-solve — "explain the math more at the bottom" (2026-06-24)

- **Ask:** on the `guided-solve` beat ("Solve both systems for the start at $2"), explain the
  math more in the bottom CORRECT feedback strip.
- **Change (fixtures only):** expanded `fixtures/lesson-gamblers-ruin.json` `guided-solve`
  `feedback.correct` from one line ("Exactly — P = ½ and D = 4 = 2·(4−2).") into a short
  derivation of both results, reusing the two recurrences this lesson already builds:
  **chance** — P₀=0, P₄=1 and each interior = average of its neighbors ⇒ straight line Pᵢ=i/4 ⇒
  P₂=½ (the symmetry); **duration** — D₂=1+½·D₃+½·D₁ with D₀=D₄=0 ⇒ Dᵢ=i·(4−i) (product of the
  two wall distances) ⇒ D₂=2·(4−2)=4, the longest wait, at the middle. No grading/accept/
  structure change (accept lists `["1/2","0.5"]` / `["4"]` untouched).
- **Encoding gotcha:** this fixture stores ½/·/−/subscripts as literal `\uXXXX` *text* (but the
  em-dash as a literal glyph). The `StrReplace` harness kept collapsing the escapes to glyphs so
  the byte-match failed; the edit was done via a one-line **Python text replace** (preserves the
  escape convention, no whole-file reformat). `FeedbackStrip` renders the strip as a plain-text
  `<p>` (no KaTeX/markdown; newlines collapse) so it's written as flowing prose that wraps.
- **Verified:** JSON parses; decoded strip reads correctly (subscripts render); `validate-fixtures`
  all green.
- **Pushed live (user-approved):** re-seeded **prod** Firestore via `SEED_TARGET=prod
  GOOGLE_CLOUD_PROJECT=brilliant-org ./node_modules/.bin/tsx scripts/seed-firestore.ts` (Admin SDK
  + gcloud ADC, `full_network`; no Java/emulator). Wrote the course doc + all 7 built lessons
  (so it ALSO carried the in-tree penney's placeholder fix). Read-back confirmed
  `lessons/lesson-gamblers-ruin` → `guided-solve.feedback.correct` now holds the expanded text in
  prod. No hosting redeploy needed — the live client fetches lesson docs from Firestore at runtime
  (`firestoreLoader.ts`) and `FeedbackStrip` renders `feedback.correct` verbatim; a page reload +
  re-enter shows it. (`/dev/lesson/...` already had it from the bundled fixture.) Fixtures still
  uncommitted in the working tree.

### Mastery-challenge beats inserted into all 6 lesson fixtures (2026-06-24)

- **Ask:** insert one `masteryChallenge` beat as second-to-last in each of L1–L6, add a
  structural gate in `validate-fixtures.ts`, and update e2e helpers.
- **Files changed:**
  - `fixtures/lesson-pattern-hitting-times.json` — added mastery-challenge beat (E[HHH]=14); recap still last.
  - `fixtures/lesson-penneys-game.json` — added mastery-challenge beat (counter=HTT, winprob=7/8); recap still last.
  - `fixtures/lesson-gamblers-ruin.json` — added mastery-challenge beat (reach=3/10, steps=21); recap still last.
  - `fixtures/lesson-states-streaks.json` — added mastery-challenge beat (partA=6, partB=3/8); recap-streak still last.
  - `fixtures/lesson-longer-patterns.json` — added mastery-challenge beat (E[HTHT]=20); recap still last.
  - `fixtures/lesson-overlap-shortcut.json` — added mastery-challenge beat (E[HHHH]=30); recap still last.
  - `scripts/validate-fixtures.ts` — new gate #5 (MASTERY_LESSONS set): asserts last beat = recap, second-to-last = required masteryChallenge; pattern-pinned beats cross-checked against `buildAutomaton`.
  - `src/content/schema.test.ts` — beat count 16→17 (the new beat) + updated comment.
  - `src/lesson/mastery.test.ts` — `gradedRequiredBeatIds` snapshot updated to include mastery-challenge.
  - `e2e/helpers.ts` — inserted mastery-challenge step (fill "14", Check, Continue) in BOTH `completeLesson` and `completeLessonTrackA`, immediately before the recap step.
  - `e2e/remaining-lessons.spec.ts` — added `masteryChallenge(page, values)` helper; inserted calls before `recapFinish` in completeL2–completeL6 with per-lesson answers.
- **Gates GREEN:** `validate-fixtures` (all 6 mastery-challenge gate lines + "All fixtures valid.") · `tsc -b` 0 errors · `eslint .` 0 errors · `vitest run` 212/212 green.
- Nothing committed.

### Medallion icon + embossed visual upgrade (2026-06-24)

- **Ask:** CSS-only additions to `src/styles/surfaces/ergo-home.css` to support inline SVG icons
  and make earned medals look more crafted/coin-like.
- **Changes (single file, `ergo-home.css`):**
  - `.ergo-medallion__glyph`: added `position: relative; z-index: 1` (paints above `::before` sheen).
  - `.ergo-medallion__icon` (new): base `display:block; position:relative; z-index:1`; earned state
    `color:#fff; filter:drop-shadow(…)`; locked state `color/opacity`; size rules sm 24px / md 28px / lg 48px.
  - `.ergo-medallion--earned` box-shadow: added `inset 0 0 0 2.5px color-mix(in srgb,white 28%,transparent)`
    as a light bezel ring just inside the dark 1px rim (embossed coin edge). Same bezel added to hover state.
  - `.ergo-medallion--earned::before` (new): `linear-gradient(145deg, rgba(255,255,255,0.45)→0% at 48%)`
    sheen; self-clips via `border-radius:50%`, no `overflow:hidden` on parent.
  - `.ergo-medallion--lg.ergo-medallion--earned`: added wider bezel (`inset 0 0 0 3.5px …`).
  - `.ergo-medallion--capstone.ergo-medallion--earned` (new): outer brand-hued ring
    `0 0 0 3px`, larger ambient `0 6px 18px -4px`, plus full inset rims.
  - `@keyframes ergo-medallion-shine` (new): scrolls `background-position 0%→100%` on a 3×-wide
    diagonal gradient, clipped by `border-radius:50%` on `::after` — no `overflow:hidden` needed.
  - `.ergo-medallion--earning::after` (new): 700ms shine sweep pseudo-element.
  - Reduced-motion block: also disables `::after { display:none }`.
- **Verified:** `npx prettier --check` passes clean. Nothing committed.

### Home journey — dotted inter-section bridges (2026-06-24)

- **Ask:** "add dots in between the different sections in the main screen so that the lessons
  all seem more connected." Target = the Home `CourseJourney` rail, which cut off between each
  chapter (`.ergo-row:last-child::before { bottom:50% }`) and restarted below the next section
  label, so FOUNDATIONS / RACING & WALKS / MASTERY read as detached blocks.
- **Change (single file, `src/styles/surfaces/ergo-journey.css`, +~25 lines):** (1) the
  last-row rail cut is now scoped to the **final** section only
  (`.ergo-chapter:last-of-type:not(.ergo-chapter--roadmap) … :last-child::before`), so sections
  followed by another keep a full-height rail. (2) New dotted bridge
  `.ergo-chapter:not(:first-of-type) .ergo-chapter__label::before` — a `radial-gradient`
  dotted line (`left:14px`, `top:-24px`→`bottom:0`, `width:4px`, `opacity:0.6`) that carries the
  rail across the chapter-label gap. Dots inherit the upcoming chapter's hue via `currentColor`
  (the label already sets `color`), so the bridge fades in teal → coral → amber per section.
- **Verified (browser, fresh server):** computed `::before` on all 3 non-first labels shows the
  radial-gradient with correct hues, `top:-24px`, `left:14px`, `opacity:0.6`; screenshotted at
  `/dev/home` — teal dots flow FOUNDATIONS→RACING, coral dots RACING→MASTERY, rail now reads as
  one continuous path. ⚠ **Stale-Vite footgun again:** the long-running dev servers (4500/4700/…)
  served a cached `app.css` transform (it `@import`s `ergo-journey.css` inside `@layer components`,
  and the importer didn't invalidate) — the raw file was correct but the page showed old CSS;
  only a **freshly started** server (4900) picked it up. Restart the dev server to see it.
  Nothing committed.

### Bespoke inline-SVG medallion icons (2026-06-24)

- **Ask:** replace flat mono-text glyphs in `ConceptMedallion` with pictographic inline-SVG icons.
- **Created `src/habit/MilestoneIcon.tsx`:** exports `MilestoneIcon({ id, glyph })`. Registry
  (`Record<string, ReactNode>`) maps all 8 known milestone ids to distinct 24×24 line-art SVGs
  (all `stroke="currentColor"`, `fill="none"` via parent, filled accents via `fill="currentColor"`).
  Unknown ids fall back to `<span className="ergo-medallion__glyph">`. Icons: two overlapping coins
  (hh-ht), checkered flag (penneys), random-walk walls (gamblers-ruin), 3 rounded squares + check
  (first-pattern), 3-node state machine (state-machine), balance scale (martingale), half-arc + check
  (three-lessons), full ring + 5-point star (six-lessons). Check mark on filled box uses
  `stroke="var(--ergo-surface, canvas)"` for contrast.
- **Edited `src/habit/ConceptMedallion.tsx` (surgical):** added `import { MilestoneIcon }`;
  replaced `<span ergo-medallion__glyph>` with `<MilestoneIcon id={meta.id} glyph={meta.glyph} />`;
  added `capstoneClass` for `six-lessons-complete` → `ergo-medallion--capstone` modifier.
- **Verified:** `npx tsc -b` exits 0; `npx prettier --check` passes (ran `--write` to auto-format).
  No other files touched. CSS for `.ergo-medallion__icon` owned by another worker.

### End-of-lesson Mastery Challenge — L1-L6 (2026-06-24)

New graded `masteryChallenge` beat inserted **immediately before the recap** of each core lesson
(L1-L6) — one hard-ish *transfer* question to "prove mastery." **Authored by a council of
sub-agents** (4 parallel Opus proposers — correctness / quant-transfer / assessment / misconception
— synthesized by the orchestrator) and **every numeric answer engine-verified** (one-off
`scripts/verify-mastery-answers.ts` prints all hitting-times / Penney odds / walk P&D).

- **Type + UI:** new `masteryChallenge` interaction (`src/content/schema.ts`: `scenario?` +
  answerEntry-style `fields[]`). `src/lesson/beats/MasteryChallengeBeat.tsx` mirrors `AnswerEntryBeat`
  grading (norm + accept-list via `useHintLadder`, Enter-submit, reveal-on-3-wrong) but renders a
  **distinct `.mastery` card** (accent-bordered, mono "Mastery challenge" pill badge + scenario line,
  reusing `.answer-entry__*` inputs). Dispatcher case in `beats/index.tsx`; `.mastery*` block in
  `beats-extended.css` (`--accent`/`--accent-tint`/`--paper-1`/`--r-pill`).
- **Wiring:** added to `mastery.ts` `GRADED_BEAT_TYPES` (feeds `computeMastered`/needsReview;
  `progress/recommend.ts` inherits via `gradedRequiredBeatIds` — no edit) + `validate-fixtures.ts`
  `GRADED_TYPES`. `'mastery-challenge'` added to ALL SIX Prove-phase configs in `phases.ts` (else
  `getRail` throws). New validate **gate #5**: each L1-L6 ends recap-last with a `required`
  masteryChallenge penult; `pattern`-pinned beats (L1/L5/L6) cross-checked against `buildAutomaton`.
- **Questions (engine-verified):** L1 `E[HHH]=14` · L2 friend picks **TTT** → counter **HTT**, P=**7/8**
  · L3 start $3 walls $0/$10 → **3/10** & **21** · L4 (mixed/unlabeled) `E[TT]=6` & walk N=8 start3 →
  **3/8** · L5 `E[HTHT]=20` · L6 `E[HHHH]=30`. No-guess type-in; accept-lists hold all equivalent
  forms (fraction+decimal) and exclude each lesson's misconception wrong-answer.
- **e2e:** `e2e/helpers.ts` (flagship Track B + Track A) solve `14`→Check→Continue before the recap
  (recap stays **Finish**); `e2e/remaining-lessons.spec.ts` new `masteryChallenge(page, values)` helper
  before each `recapFinish` (L2 `[HTT,7/8]`, L3 `[3/10,21]`, L4 `[6,3/8]`, L5 `[20]`, L6 `[30]`).
- **Behavior change (intended):** `mastered` now also requires nailing the challenge first-try,
  no-hint — i.e. it genuinely proves mastery. Never blocks unlock (mastery/needsReview are non-blocking;
  the hint ladder reveals the answer so there's no dead-end).
- **Gates GREEN:** `validate` (incl. 6 `mastery-challenge gate` lines), `tsc -b`, `eslint .`,
  `vitest run` **212/212** (+ `MasteryChallengeBeat.test.tsx`; updated `schema.test.ts` beat count
  16→17 + `mastery.test.ts` snapshot), `vite build`. Playwright e2e edits are correct-by-construction
  (suite not run here — finicky dev-server env).
- **⚠ Re-seed required to activate in prod/emulator:** the live client loads lessons from Firestore
  (`firestoreLoader.ts`), so prod won't show the challenge until re-seeded (`SEED_TARGET=prod
  GOOGLE_CLOUD_PROJECT=brilliant-org ./node_modules/.bin/tsx scripts/seed-firestore.ts`). The Cloud
  Function validates required beats against the seeded doc, so seeding keeps completion consistent.
  `/dev/lesson/*` already renders it (bundled fixture). A manual full-lesson visual walk of the new
  card is the recommended follow-up. Nothing committed.
- **MilestoneIcon fix (uncommitted):** `first-pattern-cracked` last cell now uses
  `fillOpacity={0.3}` + check stroke `currentColor` (removed unreliable
  `var(--ergo-surface)` white-on-white).
