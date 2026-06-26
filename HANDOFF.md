# HANDOFF

<!-- Orientation doc for a fresh context. Session-by-session narration lives in git history; this file keeps only what's needed going forward. -->

## Goal & Constraints

- Brilliant-style learn-by-doing web app. Flagship lesson teaches **pattern hitting times** for coin flips (why `E[HH]=6` but `E[HT]=4`). Sequenced by `docs/mvp_prd.md` (Groups A–D).
- **Ergo Design System** (`docs/ui_design_system.md`, ADR-0003): bright, clean, colorful, brilliant.org-like; Space Grotesk + Inter + JetBrains Mono; cool-white palette; per-chapter color-coding. Product renamed "Pattern Hitting Times" → **Ergo**.
- KMP engine stays **pure / dependency-free** (exact rational arithmetic, no floats).
- Surgical changes, simplicity first, no speculative scope (`AGENTS.md`).

## Current State

- **Live (prod):** Firebase Hosting → https://brilliant-org.web.app (SPA). Project **brilliant-org** (#801582458333), Blaze enabled, Firestore `(default)` db in `nam5`. `.firebaserc`: `default`+`prod` → `brilliant-org`.
- **Live (dev):** Firebase Hosting → https://brilliant-org-dev.web.app. Project **brilliant-org-dev** (#836579828208), Firestore `(default)` db in `nam5` (seeded). `.firebaserc`: `dev` → `brilliant-org-dev`. Built `vite build --mode dev` (uses `.env.dev`, emulators OFF), deployed `firebase deploy -P dev --only hosting,firestore`. Re-seed dev: `SEED_TARGET=prod GOOGLE_CLOUD_PROJECT=brilliant-org-dev ./node_modules/.bin/tsx scripts/seed-firestore.ts`. **Status:** Blaze linked + Email/Password enabled + Functions (`completeLesson`, `recordQualifyingAction`) deployed to `us-central1` → fully functional. Google sign-in not enabled on dev; App Check off (no reCAPTCHA key in `.env.dev`). To redeploy code: rebuild then `firebase deploy -P dev` (`--only hosting`/`functions`/`firestore` as needed).
- **Built:** All 7 lessons (L0 + L1–L6) with two-track (A/B) inclusive design; Group C Firebase backend (auth/onboarding, Firestore loader, snapshots, Cloud Functions, streaks/milestones, rules, App Check seam, analytics); Ergo Home (Study Desk); Ergo lesson restyle (Waves A–E); Living Notebook premium-UI overhaul; end-of-lesson mastery-challenge beats (L1–L6); page-load latency reduction (lazy Firestore/Functions off first paint).
- **Concept Catalog (macro home)** — signed-in `/` now renders `ConceptCatalogPage` (domain-shelved catalog: resume hero + horizontal carousels); `/concept/:conceptId` is the per-concept path (generalized `CoursePathPage`, no more hardcoded `COURSE_ID`); `/path` redirects to `/`. Selecting a concept morphs into its lessons via the `concept-open` View Transition (shared element `concept-hero`; single-wrapped through `navigate(to, { viewTransition })`). Single source of truth = concept/lesson docs: `CourseSchema` gained optional `domain`/`domainOrder`/`order`/`status`/`tagline`/`accent`/`vizKey`/`chapters[]` + per-lesson `glyphKey`/`vizKey`; within-concept chapters/glyphs are data-driven (fallback to `ERGO_CHAPTERS`/`LESSON_GLYPHS`/`LESSON_VIZ`). New: `src/pages/{conceptCatalog.model,ConceptCatalog,ConceptCatalogPage}.tsx`, `src/styles/surfaces/ergo-catalog.css`; seed + validate generalized to all `fixtures/course-*.json`; ADR-0004 + `CONTEXT.md` glossary + lesson-factory contract docs updated.
- **Seeded (prod):** the 7 lessons + the single course doc are live, but the catalog's **new fields + 6 coming-soon stub concepts are NOT seeded yet** → **re-seed dev+prod to populate the catalog** (otherwise the live app shows only PHT via graceful fallbacks). Re-seed cmds in §Current State (dev) and §Pending (prod).
- **Git:** on `main`. The Concept Catalog feature is **uncommitted** (schema/routes/App/pages/styles/fixtures/scripts/docs). Verified locally green: `tsc -b`, `eslint`, `vitest` (239 tests, incl. `conceptCatalog.model.test.ts`), `validate-fixtures` (14 fixtures). `e2e/concept-catalog.spec.ts` authored but mostly skipped pending a `/dev/catalog` harness (needs server/emulator → user-run). Don't commit unless asked.

**Pending before fully-live functionality:**

- Enable **Google sign-in** in the brilliant-org console (Auth → Sign-in method). Until then only email/password works.
- **App Check enforcement is intentionally OFF.** reCAPTCHA v3 is wired; do NOT enforce (or set `enforceAppCheck: true` on the callables) until console metrics show real users getting verified tokens. See `docs/security-audit.md` F1/F3 for the monitor-then-enforce rollout.
- After any fixture change, **re-seed prod** (`SEED_TARGET=prod GOOGLE_CLOUD_PROJECT=brilliant-org ./node_modules/.bin/tsx scripts/seed-firestore.ts`) — the live client loads lessons from Firestore at runtime.
- Live unlock chain + L2–L6 milestone awarding unverified on a live authed walk.

## Environment Gotchas (these will bite you)

- **Firebase CLI must run under Node v24.3.0.** Newer Node breaks the `node-fetch@2` bundled in firebase-tools. Use the `firebase` alias in `~/.zshrc` (pinned to v24.3.0), NOT `npx firebase` or the global.
- **Avoid `npm run`** (npm 11 + macOS bash 3.2 → `/bin/sh: --: invalid option`). Call binaries directly: `./node_modules/.bin/{vite,tsc,vitest,playwright,tsx}`.
- **No Java locally** → emulators / `seed` / `test:rules` can't run here; the user runs those.
- **Dev run order:** start emulators FIRST, then the dev server, else the auth-init `BootScreen` hangs forever.
- **`.env.development` is gitignored** and must exist, or the app white-screens (`getAuth` throws at import). `/dev/lesson` + `/dev/home` bypass Firebase.
- **Stale Vite footgun (bites constantly):** if edits don't show, kill lingering `node .../vite` PIDs and start a fresh server — wedged HMR serves old source. Always verify on a freshly-started server.
- **Tooling:** never batch multiple `StrReplace` to the *same* file in one turn; `timeout` is absent on macOS; keep `tsx` scripts under `scripts/`.
- **Tokens:** regenerate via `./node_modules/.bin/tsx scripts/build-tokens.ts`; edit `style-dictionary/tokens/*.json`, not the generated files.
- **VR baselines** (under `e2e/vr/__screenshots__/`) go stale after visual changes — re-baseline on a sweep; VR runs via `--config playwright.vr.config.ts`.

## Architecture & Key Decisions

- **Pure KMP engine** `src/engine/*`: `buildAutomaton(pattern,p)` → exact rationals via Gaussian elimination. Goldens: `E[HH]=6, E[HT]=4, E[THH]=8, E[HTH]=10, E[HHH]=14`. New modules `race.ts` (L2), `walk.ts` (L3, returns a `WalkModel`), `correlation.ts` (L4/L6).
- **Self-contained beat views** `src/lesson/beats/*` compose `<BeatShell>`; `index.tsx` dispatches on `interaction.type`. `LessonPlayer` owns cross-beat state; `key={beatId}` remounts. Pure node-testable graders (`hintLadder`, `equationChecker`, `equationDiagnosis`, `stateTapHints`); React hooks wrap them.
- **Konva** only for `StateGraph`/`SimChart`/`BiasChart` (each `'use no memo'` for React Compiler); `konva/theme.ts` derives from `tokens.generated.ts`. Per-chapter hue via `src/lesson/chapters.ts`.
- **Routing:** hand-rolled SPA router + auth guard in `src/App.tsx` (no react-router). Signed-out `/` → LandingPage; signed-in + no `users/{uid}` → `/onboarding/name`; onboarded `/` → ConceptCatalogPage (macro home); `/concept/:id` → CoursePathPage(conceptId); `/path` → redirect to `/` (back-compat).
- **Firestore writes:** progression/completion/streaks/milestones are **Function-owned** (`completeLesson`, `recordQualifyingAction`, idempotent). Rules are owner-scoped + field-whitelisted; clients can't write progression fields. Instant feedback stays client-side.
- **Perf:** Firestore + Functions are deferred off first paint — `src/firebase/app.ts` eagerly exports app+auth+App Check only; memoized async `getDb()`/`getFns()` dynamically import the SDKs; `vite.config.ts` uses native `rolldownOptions.output.codeSplitting` (eager `fb-core`/`react-vendor`/`motion-vendor`/`zod` only).
- **Design tokens:** Style Dictionary single source (`style-dictionary/tokens/*.json` → `tokens.generated.{css,ts}`) feeds CSS + Konva + motion. CSS split into `src/styles/surfaces/*` under `@layer`.

## Bayes-Rule Worktree (`concept/bayes-rule`) — CSS blocker fixed
`src/styles/surfaces/beats-extended.css` in `.lf/bayes-rule/` now contains all `.bayes-bars*`, `.bayes-tree*`, `.bayes-icons*`, and `.bayes-seq*` rules (37 selectors). Token-only (no hex). Reduced-motion via `@media (prefers-reduced-motion: reduce)` on fill transitions. `vite build` + `tsc -b` green. Committed as `df331d8`.

## Expected-Value Concept (`concept/expected-value`) — Wave-0 Contract FROZEN

Schema/Types Specialist subagent completed the Wave-0 contract freeze on branch `concept/expected-value`. All 5 edits applied; all 3 gates green (`tsc -b`, `vitest run` 35 files / 269 tests, `validate-fixtures`). Summary of changes:
- **`src/content/schema.ts`** — `theorySimChart` extended (`mode?`, `nMax?`); `coinSim` extended (`p?`); `raceSim` extended (`mode?`, `ants?`); 3 new discriminated-union variants added: `expectationScale`, `conditionalTree`, `couponCollectorSim` (all ungraded, no GRADED_TYPES entry).
- **`src/lesson/beats/index.tsx`** — stacked Wave-0 stub slots for `expectationScale` / `conditionalTree` / `couponCollectorSim` → `ContinueStub`.
- **`src/engine/expectation.ts`** (new) — pure exact-rational EV engine: `expectedValue`, `totalExpectation` (via `solveLinearSystem`), `indicatorExpectation`, `harmonic`, `couponCollector`, `distinctAfterDraws`, `orderStatUniform`, `noodleLoops`.
- **`src/engine/expectation.test.ts`** (new) — 6 `describe`/`it` blocks, 269 tests total (all pass).
- **`scripts/validate-fixtures.ts`** — `Course` type import; `reduce` + full expectation import; `courses` array; EV lessons in `GATED`+`MASTERY_LESSONS`; Sections 6 (engine self-check), 7 (chapters-coverage gate), 8 (per-fixture EV cross-check, 0 beats dormant).

## Expected-Value Concept (`concept/expected-value`) — Stage 3 Dept-2 Interaction Spec: L6 COMPLETE (CONCEPT FINALE)

`concepts/expected-value/lesson-expected-value-6/interaction-spec.md` written (READY verdict). 10-beat arc: ev6-primer(primer/custom,Track-A) · ev6-recall(retrievalGrid,first-graded) · ev6-bet(prediction/byOption) · ev6-win(answerEntry,2/3+1/3) · ev6-explore(raceSim/lanes+ants-mode,HERO,comparison) · ev6-model(slider,introducesSymbol E[max]=n/(n+1),interviewNote) · ev6-derive(primer/custom,Track-A,CDF proof) · ev6-min(answerEntry,1/5) · ev6-prove(masteryChallenge,required,500/501) · ev6-recap(recap,required,concept-finale+variance-teaser). **NO new interaction type.** `ev6-explore` reuses `raceSim` with minimal additive extension: `mode?:enum(['patterns','ants'])` + `ants?:{n:number}` (2 optional fields, fully back-compat). Engine fn to freeze: `orderStatUniform(n)→{max:{n,d:n+1},min:{n:1,d:n+1}}`. Goldens: `n=2→{2/3,1/3}`, `n=4→{4/5,1/5}`, `n=500→{500/501,1/501}`. Two Dept-3 kickbacks (renderer-only, non-blocking): `AntsLanesBeat.tsx` ants-mode Konva sim + DOM aria-live mirror; `SliderBeat` order-stat dual readout when `introducesSymbol='E[max]=n/(n+1)'`. `beat.pattern` UNSET everywhere; `ev6-prove` required:true penultimate; `ev6-recap` last.

## Expected-Value Concept — Dept-3 Coder: lesson-expected-value-1 BUILT (worktree `ev-1`)

Branch `lesson/expected-value-1` (worktree `.lf/ev-1`). All 4 gates green: `tsc -b --force` ✓ · `vitest run` 280 tests ✓ · `validate-fixtures` All fixtures valid (✓ inclusivity gate: lesson-expected-value-1, ✓ mastery-challenge gate: lesson-expected-value-1) · `eslint src` ✓.

**6 new files created (no shared-file edits):**
1. `fixtures/lesson-expected-value-1.json` — 10-beat fixture verbatim from interaction-spec (ev1-recall→ev1-recap), `patternOptions:["H"]`, `milestoneId:"ev-fundamentals"`, `unlocks:"lesson-expected-value-2"`, `beat.pattern` unset on every beat.
2. `src/styles/surfaces/expected-value-1.css` — tokens-only (--ch4, --ergo-surface-2, --rule, --dur-slow, --ease-out, --font-mono, --s4, --r-md); reduced-motion `@media` block for `.escale__fulcrum-group`.
3. `src/lesson/beats/ExpectationScaleBeat.tsx` — real DOM/SVG renderer; hooks before early return; imports `resolveFeedback` from `../feedbackResolve` (not `../feedback`) to avoid Firebase in tests; all weights placed → Continue enabled + correct feedback; hero slow-first pause (650ms); reduced-motion final frame; 44px outcome circles; aria-live readout; keyboard (Tab/Space/+/-/Arrow).
4. `src/lesson/beats/ExpectationScaleBeat.test.tsx` — 6 smoke assertions via `react-dom/server renderToString` (Node env, no jsdom).
5. `src/content/lesson-expected-value-1.factcheck.test.ts` — Stage-2 fact-check: ev1-win "7/2"=expectedValue(fairDie), ev1-pmf field-1 "1/9"=reduce(4,36), ev1-pmf field-2 "5"=expectedValue({3,5,7} pmf), ev1-prove "7"=expectedValue(twoDiceSum).
6. `e2e/expected-value-1.spec.ts` — Playwright completion script (NOT run this wave; requires dispatcher wiring + app.css @import).

**Lead actions required to go live:**
- Dispatcher: in `src/lesson/beats/index.tsx`, replace `case 'expectationScale':` stub with: `case 'expectationScale': return <ExpectationScaleBeat {...props} />` and add `import { ExpectationScaleBeat } from './ExpectationScaleBeat'` to the imports block.
- CSS: in `src/styles/app.css`, add: `@import './surfaces/expected-value-1.css';`

## Expected-Value Concept (`concept/expected-value`) — Stage 3 Dept-2 Interaction Spec: L1 COMPLETE

`concepts/expected-value/lesson-expected-value-1/interaction-spec.md` written (READY verdict, 1 minor non-blocking kickback). 10-beat arc: ev1-recall(retrievalGrid,first-graded,both) · ev1-bet(prediction/byOption,ungraded,both) · ev1-primer(primer/average,collapsible,both) · ev1-win(answerEntry,"7/2"/"21/6",guaranteed-early-win) · ev1-explore(expectationScale,NEW,hero,ungraded,both) · ev1-model(primer/custom,introducesSymbol,comparison,interviewNote,both) · ev1-deepen(theorySimChart,Track-A,required:false) · ev1-pmf(answerEntry,"1/9"+"5",graded-check,both) · ev1-prove(masteryChallenge,required,"7"/"252/36",penultimate,pattern-UNSET) · ev1-recap(recap,required,last). New type `expectationScale` fully frozen: DOM/SVG balance beam, `{ type, outcomes[{x,label?,weight?}], accept? }` — UNGRADED in L1 (accept omitted). Engine fn: `expectedValue(pmf):Rational` with goldens fair-die `{n:7,d:2}`, two-dice `{n:7,d:1}`, 3-outcome `{n:5,d:1}`. Hard gates: ev1-recall=first-graded ✓, ev1-prove required penultimate pattern-UNSET ✓, ev1-recap last ✓, ≥1 primer ✓, ≥1 Track-A(ev1-deepen) ✓, ≥2 interviewNotes(ev1-model+ev1-prove) ✓, every prediction byOption ✓, beat.pattern UNSET everywhere ✓. Wave-0 freeze: (1) `expectationScale` Zod → InteractionSchema union + ExpectationScaleBeat.tsx + BeatView dispatcher; (2) `expectation.ts` `expectedValue`; (3) validate-fixtures Stage-2 cross-check + GATED+MASTERY_LESSONS for lesson-expected-value-1..6. Minor kickback: Dept-1 sign-off on ev1-pmf field-2 specific pmf {$3,prob=1/4;$5,prob=1/2;$7,prob=1/4}→E=5 (non-blocking).

## Expected-Value Concept (`concept/expected-value`) — Stage 3 Dept-2 Interaction Spec: L5 COMPLETE

`concepts/expected-value/lesson-expected-value-5/interaction-spec.md` written (READY verdict). 10-beat arc: ev5-primer-geom(primer/custom,Track-A) · ev5-recall(retrievalGrid,first-graded) · ev5-bet(prediction/byOption) · ev5-win(answerEntry,"6") · ev5-explore(couponCollectorSim,NEW,hero) · ev5-model(primer/custom,introduces N·H_N,interviewNote) · ev5-stage-scaffold(primer/custom,Track-A) · ev5-stage(answerEntry,"3/2") · ev5-prove(masteryChallenge,required,"147/10") · ev5-recap(recap,required). New type `couponCollectorSim` frozen: `{ type, n, accept? }` — UNGRADED in L5 (no `accept`). Engine goldens: `harmonic(6)={n:49,d:20}`, `couponCollector(6)={n:147,d:10}`, `stageWait(6,2)={n:3,d:2}`, `stageWait(6,5)={n:6,d:1}`. `beat.pattern` UNSET everywhere. Two Dept-3 Wave-0 actions: (1) schema + `CouponCollectorSimBeat.tsx` + engine fns; (2) register `lesson-expected-value-1..6` in `GATED`+`MASTERY_LESSONS`. One Dept-3 confirm: `theorySimChart` skipped for ev5-model (primer used instead — no schema change).

## Expected-Value Concept (`concept/expected-value`) — Stage 3 Dept-2 Interaction Spec: L4 COMPLETE

`concepts/expected-value/lesson-expected-value-4/interaction-spec.md` written (READY verdict, 1 minor kickback). 9-beat arc: ev4-recall(retrievalGrid) · ev4-bet(prediction/byOption) · ev4-win(answerEntry,7/4) · ev4-explore(conditionalTree,HERO) · ev4-model(primer/custom,comparison) · ev4-firststep(answerEntry,5+E[X]) · ev4-isolate(primer/custom,Track-A) · ev4-prove(masteryChallenge,required) · ev4-recap(recap,required). New type `conditionalTree` (frozen Zod + renderer ConditionalTreeBeat.tsx + engine `totalExpectation`). `beat.pattern` UNSET everywhere — ev4-prove's E[X]=7 is a total-expectation fixed point, not an H/T recurrence. `solveLinearSystem` reuse from automaton.ts for the self-referential dice game. Engine goldens: coin-die `{n:7,d:4}`, dice game `{n:7,d:1}`. Kickback to Dept 1: confirm ev4-firststep accept list for symbolic "5+E[X]" vs numeric-only field.

## Expected-Value Concept — Dept-3 Coder: lesson-expected-value-3 BUILT (worktree `ev-3`)

Branch `lesson/expected-value-3` (worktree `.lf/ev-3`). All 4 gates green: `tsc -b --force` ✓ · `vitest run` 317 tests (41 files) ✓ · `validate-fixtures` All fixtures valid (✓ inclusivity gate: lesson-expected-value-3, ✓ mastery-challenge gate: lesson-expected-value-3) · `eslint src` ✓.

**Files changed/created (5 new, 1 additive edit):**
1. `src/lesson/beats/CoinSimBeat.tsx` — **ADDITIVE edit**: extracted existing PHT logic to `CoinSimPHT` function; added thin `CoinSimBeat` router (no hooks) + `IndicatorSim` component. When `coinSim.p` is defined and ≠ 0.5: renders biased 0/1 Bernoulli stream with running-average bar converging to `p`, theory line at `p`, `aria-live="polite"` readout, "Ace (1)"/"Not ace (0)" labels, gamblerNote after 20+ consecutive draws within 0.01 of `p`, reduced-motion via `transition:none`. All existing PHT behavior (CoinSimPHT) byte-for-byte unchanged.
2. `fixtures/lesson-expected-value-3.json` — 10-beat fixture verbatim from interaction-spec (ev3-indicator-primer→ev3-recap), `patternOptions:["H"]`, `milestoneId:"indicator-mastered"`, `unlocks:"lesson-expected-value-4"`, `beat.pattern` unset on every beat. ev3-explore `coinSim.p = 0.07692307692307693` (1/13).
3. `src/lesson/beats/CoinSimBeat.test.tsx` — 11 smoke tests via `react-dom/server renderToString`; mocks `konva/StateGraph` + `CoinStream`; covers p-branch (isim container, aria-live, theory-line, labels, Draw card button, Run 100, reduced-motion transition:none) AND fair-coin baseline (coinsim container, Flip button, no theory-line).
4. `src/content/lesson-expected-value-3.factcheck.test.ts` — Stage-2 fact-check: ev3-win "1/13"=indicatorExpectation({n:4,d:52}), ev3-count "11/6"=distinctAfterDraws(6,2), ev3-prove "53/5"=ratAdd({n:1,d:1}, ratMul({n:48,d:1}, indicatorExpectation({n:1,d:5}))).
5. `e2e/expected-value-3.spec.ts` — Playwright completion script for both tracks (NOT run this wave).
6. `src/styles/surfaces/expected-value-3.css` — tokens-only styles for `.isim*` classes (--ch1 indigo accent, --ergo-surface-2, tabular-nums, `@media (prefers-reduced-motion: no-preference)` transition guard).

**Lead actions required to go live:**
- CSS: in `src/styles/app.css`, add: `@import './surfaces/expected-value-3.css';`
- No dispatcher change needed (`coinSim` already wired in `beats/index.tsx`). PHT behavior confirmed preserved.

## Expected-Value Concept (`concept/expected-value`) — Stage 3 Dept-2 Interaction Spec: L3 COMPLETE

`concepts/expected-value/lesson-expected-value-3/interaction-spec.md` written (CONDITIONAL PASS). 10-beat arc: ev3-indicator-primer · ev3-recall · ev3-bet · ev3-win · ev3-explore · ev3-model · ev3-scaffold(Track-A) · ev3-count · ev3-prove · ev3-recap. No new interaction types; `coinSim {mode:'free'}` reused for `ev3-explore` with minor additive extension flagged (optional `p:number` for Bernoulli probability ≠ 0.5). Engine fns to freeze: `indicatorExpectation({n:4,d:52})→{n:1,d:13}`, `distinctAfterDraws(6,2)→{n:11,d:6}`, first-ace `1+48·(1/5)=53/5`. Hard gates: ev3-recall=retrievalGrid(first graded), ev3-prove=masteryChallenge required penultimate (NO pattern), ev3-recap last, ≥1 primer(custom), interviewNote on ev3-prove (5-equal-gaps), Track-A scaffold (ev3-scaffold), byOption on ev3-bet, hero+aria-live on ev3-explore, notation ladder ev3-model introducesSymbol groundedBy ev3-win. 3 low-risk kickbacks (D1: retrievalGrid string verification; D3: coinSim p-extension; D3: validate-fixtures pattern-absent handling).

## Expected-Value Concept — Dept-3 Coder: lesson-expected-value-4 BUILT (worktree `ev-4`)

Branch `lesson/expected-value-4` (worktree `.lf/ev-4`). All 4 gates green: `tsc -b --force` ✓ · `vitest run` 313 tests (41 files) ✓ · `validate-fixtures` All fixtures valid (✓ inclusivity gate: lesson-expected-value-4, ✓ mastery-challenge gate: lesson-expected-value-4) · `eslint src` ✓.

**6 new files created (no shared-file edits):**
1. `fixtures/lesson-expected-value-4.json` — 9-beat fixture verbatim from interaction-spec (ev4-recall→ev4-recap), `patternOptions:["H"]`, `milestoneId:"conditional-expectation-mastered"`, `unlocks:"lesson-expected-value-5"`, `beat.pattern` unset on every beat.
2. `src/styles/surfaces/expected-value-4.css` — tokens-only (--ch1 indigo accent, --ergo-surface-2, --rule, --ch1-tint); loop-arc `@keyframes arc-draw`; reduced-motion `@media` block suppresses animation.
3. `src/lesson/beats/ConditionalTreeBeat.tsx` — DOM/SVG renderer for `conditionalTree`; root "Roll die" node; tap-to-expand branch buttons (≥44px hit zone); SVG cubic Bézier loop-back arc for restart branches; post-all-expanded equation token animation (100ms/token); `totalExpectation` → `E[X]=7`; `aria-live="polite"` per branch + `aria-live="assertive"` for solve; reduced-motion final frame; calls `onAdvance` after solve.
4. `src/lesson/beats/ConditionalTreeBeat.test.tsx` — 9 smoke assertions via `react-dom/server renderToString` (Node env, no jsdom).
5. `src/content/lesson-expected-value-4.factcheck.test.ts` — Stage-2 fact-check: ev4-win "7/4"=totalExpectation(literal coin-die), ev4-prove "7"=totalExpectation(self-referential dice game), ev4-explore conditionalTree cases → 7.
6. `e2e/expected-value-4.spec.ts` — Playwright completion script for both tracks (NOT run this wave).

**Lead actions required to go live:**
- Dispatcher: in `src/lesson/beats/index.tsx`, replace the `case 'conditionalTree':` stub (`ContinueStub`) with: `case 'conditionalTree': return <ConditionalTreeBeat {...props} />` and add `import { ConditionalTreeBeat } from './ConditionalTreeBeat'` to the imports block.
- CSS: in `src/styles/app.css`, add: `@import './surfaces/expected-value-4.css';`

## Expected-Value Concept — Dept-3 Coder: lesson-expected-value-2 BUILT (worktree `ev-2`)

Branch `lesson/expected-value-2` (worktree `.lf/ev-2`). All 4 gates green: `tsc -b --force` ✓ · `vitest run` 285 tests (37 files) ✓ · `validate-fixtures` All fixtures valid (✓ inclusivity gate: lesson-expected-value-2, ✓ mastery-challenge gate: lesson-expected-value-2) · `eslint src` ✓.

**Files changed/created (5 new, 1 additive edit):**
1. `fixtures/lesson-expected-value-2.json` — 10-beat fixture verbatim from interaction-spec (ev2-recall→ev2-recap), `patternOptions:["H"]`, `milestoneId:"linearity-mastered"`, `unlocks:"lesson-expected-value-3"`, `beat.pattern` unset on every beat.
2. `src/lesson/beats/TheorySimChartBeat.tsx` — **ADDITIVE edit only**: added `useEffect`/`useMemo`/`noodleLoops` imports + 3 unconditional hooks (`isNoodleLoops`, `fullSeries`, `step`, keyboard `useEffect`) + noodleLoops rendering branch (SVG step-through chart, aria-live readout, Step/Reset/Continue buttons, hero `reducedMotionFinalFrame` initial state). Existing automaton path is byte-for-byte unchanged.
3. `src/lesson/beats/TheorySimChartBeat.test.tsx` — 10 smoke assertions via `react-dom/server renderToString` (Node env, no jsdom); mocks for `analytics/events`+`konva/SimChart`+`konva/useElementWidth`; covers both noodleLoops mode AND baseline automaton mode (PHT behavior protected).
4. `src/content/lesson-expected-value-2.factcheck.test.ts` — Stage-2 fact-check: ev2-win "7"=expectedValue(twoDiceSum), ev2-noodles "4/3"=noodleLoops(2), ev2-prove "23/15"=noodleLoops(3).
5. `e2e/expected-value-2.spec.ts` — Playwright completion script for both tracks (NOT run this wave).
6. `src/styles/surfaces/expected-value-2.css` — tokens-only styles for `.noodle-chart*` classes (--ch4 line, --font-mono tick labels, tabular-nums, reduced-motion `no-preference` transition guard).

**Lead actions required to go live:**
- CSS: in `src/styles/app.css`, add: `@import './surfaces/expected-value-2.css';`
- No dispatcher change needed (`theorySimChart` already wired in `beats/index.tsx`). PHT behavior confirmed preserved.

## Expected-Value Concept (`concept/expected-value`) — Stage 3 Dept-2 Interaction Spec: L2 COMPLETE

`concepts/expected-value/lesson-expected-value-2/interaction-spec.md` written (405 lines, READY verdict). 10-beat arc (ev2-recall → ev2-recap). No new interaction types; `theorySimChart` reused for `ev2-explore` with minor additive extension flagged (`mode:'noodleLoops'`, `nMax:number` optional fields). Engine fns to freeze: `noodleLoops` (n=2→4/3, n=3→23/15) + `expectedValue` (two-dice→7). All hard gates satisfied: ev2-recall=retrievalGrid, ev2-prove=masteryChallenge required penultimate, ev2-recap last, ≥1 primer, ≥1 interviewNote (ev2-model + ev2-prove), Track-A scaffold (ev2-tie-scaffold), every prediction byOption, pattern UNSET everywhere, hero on ev2-explore, aria-live on running E[loops].

## Expected-Value Concept (`concept/expected-value`) — Stage 2 Lesson Briefs COMPLETE (6 lessons)
Dept 1 produced full Lesson Briefs for all 6 EV lessons: `concepts/expected-value/lesson-expected-value-{1..6}/brief.md` (Architect skeleton → Misconception Specialist ∥ Assessment Designer → Lead synthesis). Each now fully fills Hook / Core promise / Display fields / Verified problems & answers / Beat-by-beat plan / **Misconceptions (inventory + per-option refutations)** / **Assessment + continuity (retrieval opener, early win, required mastery, spacing/interleaving, mastery signal, graded?-per-beat, gate/DoR notes)** — no TODO placeholders remain. Cross-dept handoffs for DoR: each `ev<n>-recall` = `retrievalGrid` (first graded), each `ev<n>-prove` = `masteryChallenge`+`required` with **`beat.pattern` unset** (verified by `src/engine/expectation.ts`, NOT `buildAutomaton`); Dept 2 still owes ≥1 `primer` + Track-A + `interviewNote` per lesson; Dept 3 must add `lesson-expected-value-1..6` to `MASTERY_LESSONS`+`GATED` in `scripts/validate-fixtures.ts`. 8-beat arc per lesson (`ev<n>-recall,bet,win,explore,model,<check>,prove,recap`); checks = `ev1-pmf,ev2-noodles,ev3-count,ev4-firststep,ev5-stage,ev6-min`. Every number re-verified against the Green Book on disk and is exact-rational reproducible by the planned `src/engine/expectation.ts`: fair die `7/2` + two-dice `7` (L1), noodles `4/3`/`23/15` + first-ace `53/5` (L2), `E[1_A]=P(A)` + first-ace `53/5` (L3), dice game `7` (L4), coupon `N=6→147/10` (L5), ants `500/501` (L6). No `⚠️ NEEDS-WEB-SOURCE` rows — L1's second rational toy (two-dice `E=7`) is cleanly GB-anchored (p.62 die + p.47 linearity).

## Lesson-Factory Skill Redesign (Living Departments) — DONE

Implemented the nested "living departments" redesign end-to-end (see `docs/adr/0007-lesson-factory-nested-department-leads.md`). Each department is now a persistent, non-readonly Opus **department lead** subagent that spawns/manages its own ephemeral workers; the Manager stays the single root orchestrator and spawns the 4 leads (Dept 1/2/3 + Interview Studio). Coordination is Manager-mediated via on-disk `concepts/<slug>/` artifacts (no peer-to-peer); **all units are 3 layers** (Manager → lead → workers) — the Dept 3 Lead provisions a worktree per lesson and spawns that lesson's role chain directly (no per-lesson runner), batched as an assembly line; nesting is hard-required via a first-run preflight probe that verifies a lead can spawn a worker (no flat fallback). Files: `SKILL.md` (intro, org chart, model-routing table + Department Lead row, dispatcher paragraph, global-override + probe note), `departments.md` (Lead paragraph on all 4 units + intro reframe + Dept 3/Studio specifics), `pipeline.md` (§0 probe, §1–2 Manager-mediated loop via resumed leads, §3 Wave-0 via Dept 3 Lead, §4 Dept 3 Lead worktree-per-lesson build, §5b Studio Lead, parallelism summary), `deploy.md` (worktree note), light touch-ups to `qa-rubric.md` / `artifacts.md` / `interview-packs.md`, and `docs/adr/0007-...md` (incl. a dated Revision note recording the 4→3 layer reduction). The global `model-routing` skill/rule was intentionally left unchanged. Plans: `/Users/ericwu/.cursor/plans/living_departments_nested_leads_1f1050f5.plan.md` (initial), `/Users/ericwu/.cursor/plans/flatten_dept3_to_three_layers_a2c75585.plan.md` (depth fix).

## Next Steps (priority order)

> **Built (UNCOMMITTED): Onboarding gate (ADR-0006).** Mandatory 4-question first-run survey (learning goal · comfort level · focus area · pace) at `/onboarding/survey` — the final question submits straight to the catalog (no summary screen), gated after `/onboarding/name`, before the catalog (new `redirectTarget` check on `userDoc.onboardingCompletedAt`). Comfort→default track (4 levels → A/A/B/B, binary tracks kept); per-concept **Quick check** repositioned as optional skippable **Calibrate** (`DiagnosticGate` gains `conceptId`/`onSkip` + analytics) that overrides the default on `progress/{conceptId}` (un-strands it — fixes the new-account-no-diagnostic bug + drops the hardcoded `COURSE_ID` track via per-concept `loadTrack(uid, conceptId)`). Profile (raw+derived+`onboardingCompletedAt`) on `users/{uid}` via `saveOnboardingProfile` + `completeOnboarding` provider method; `UserDocSchema` added; `firestore.rules` `users` update-whitelist widened (displayName-validation only when displayName changes). **Retired** `WelcomeScreen` + `welcomeSeenAt`. Catalog: smart-start hero (`recommendedConceptId` = first live concept in focus area, else flagship) + focus-area shelf reorder. Funnel analytics (`onboarding_*`, `quick_check_*`, `recommendation_shown`). Onboarding answers immutable (no edit/retake). New files: `src/pages/{OnboardingSurvey.tsx,onboarding.model.ts,onboarding.model.test.ts}`, `src/content/courseIds.ts` (Firebase-free `COURSE_ID` so pure models/tests don't pull the Firestore loader), `src/styles/surfaces/onboarding.css`. Verified: `tsc -b` ✓, `vitest run` ✓ (263 tests), `eslint src` ✓ — NOTE `eslint .` is currently broken only by a gitignored `.lf/bayes-rule` worktree on disk (nested tsconfig), not by this code. **User-run (no Java locally):** redeploy `firestore.rules`, run the rules tests + e2e; commit when ready.

1. **Wave-0 contract frozen** (`src/content/schema.ts`, `src/App.tsx`, `src/pages/routes.ts`, `src/content/loader.ts`). Stubs ready: `ConceptCatalogPage`, `conceptCatalog.model`, `ergo-catalog.css`, `loadCoursesFromFirestore`, `CONCEPT_OPEN_TRANSITION`. `tsc -b` green. Parallel streams (A/B/C/D) can now start from their isolated worktrees.
2. **Stream A done:** `fixtures/course-pattern-hitting-times.json` enriched (domain/status/tagline/accent/vizKey/chapters + per-lesson glyphKey/vizKey). Six coming-soon stub fixtures added: `course-expected-value` (Probability, ch4), `course-markov-chains` (Probability, ch1), `course-bayes-rule` (Probability, ch2), `course-combinatorics` (Combinatorics & Games, ch5), `course-optimal-stopping` (Combinatorics & Games, ch3), `course-game-theory` (Combinatorics & Games, ch2). `scripts/seed-firestore.ts` and `scripts/validate-fixtures.ts` generalized to all `course-*.json`. `firestore.rules` unchanged (already `allow read` covers list). `tsx scripts/validate-fixtures.ts` passes all checks.
2. **Stream C done** (`CoursePathPage.tsx`, `studyDesk.model.ts`): concept hero header added to CoursePathPage (morph target `viewTransitionName: conceptHeroName(effectiveConceptId)`, back button → `ROUTES.landing`, reuses `ergo-topbar`/`ergo-avatar`/`ergo-wordmark` classes); `studyDesk.model.ts` made data-driven: `resolveNodes` uses `lesson.glyphKey ?? glyphFor()` and surfaces `vizKey` on `DeskNode`; new `resolveChapters(course)` maps `course.chapters` → `Chapter[]` (fallback: `ERGO_CHAPTERS`); `chapterForLesson`/`vizForLesson` accept optional overrides for back-compat. All existing callers unchanged.
2. **Wave 2 morph integration done + review fixes applied** (`shell.css`, `ConceptCatalog.tsx`, `CoursePathPage.tsx`, `StudyDesk.tsx`, `CourseJourney.tsx`, `routes.ts`, `App.tsx`, `viewTransition.ts`, `loader.ts`, 7 fixtures):
   - **P0 morph fix:** `NavigateOptions` gains `viewTransition?`; `App.tsx` `navigate` uses `opts?.viewTransition ?? 'home-lesson'`; `ConceptCatalog.tsx` `handleNavigate` calls `navigate(path, { viewTransition: CONCEPT_OPEN_TRANSITION })` directly — removes double-wrap so the morph type is never overwritten.
   - **P1 double topbar:** `StudyDesk` gains optional `onBack`/`conceptTitle` props; when `onBack` is provided it renders `ergo-topbar concept-hero-target` (back ‹ button + title + avatar). `CoursePathPage` removes its extra `<header>` and passes `onBack`/`conceptTitle` to `StudyDesk`.
   - **P1 CourseJourney data-driven:** uses `resolveChapters(course)` instead of `ERGO_CHAPTERS`; `chapterForLesson`/`chapters.findIndex` pass resolved chapters; `vizForLesson(node.lessonId, node.vizKey)` passes per-node vizKey.
   - **P1 vizKey fixtures:** all 7 `course-*.json` now use valid `MathVizKind` values (stateMachine/sum/fourNode/twoNode/dice/raceLanes/coin).
   - **P2:** `ProgressRing` → `role="progressbar"`; live `ConceptCardItem` → `role="button"`; `DomainShelf` `updateChevrons()` called on mount; dead `conceptHeroName` and `DEFAULT_CONCEPT_ID` removed.
   - `tsc -b` + `eslint` + `vitest run` (33 files, 239 tests) + `validate-fixtures` all clean.
2. **Living Notebook / Ergo restyle follow-ups:** re-run e2e (warm Vite first), VR sweep + re-baseline (baselines stale), commit when asked.
2. **Resolve cycle-1 beat-audit proposals** (`audits/proposals/cycle-1.md`): redesign/waive `pattern-pick` + `guided-solve`, then continue/stop the loop.
3. **Instrument perf (O4):** feedback <100ms, no per-frame React state during drag/animation (currently uninstrumented).
4. Enable **Google sign-in** (last gate for full live auth).
5. **Live end-to-end check** (emulator/seed/auth + live `/path`; verify unlock chain + milestones on an authed walk) — user's terminal (no Java here).
6. **Tidy the working tree** (only when asked): commit pending work; consider removing the stray committed `docs/Hermes-Setup.dmg` (binary, likely unintended).

## Quick Reference

- **Docs:** `docs/{mvp_prd,core_instructions,ui_design_system,home-study-desk,beat-audit-rubric,proposed-lessons,future_ideas,security-audit}.md`, `docs/build-brief-*.md`, `docs/ergo-lesson-restyle-brief/*`, `docs/adr/000{1,2,3,4}-*.md`, `CONTEXT.md` (glossary), `audits/*`.
- **Engine:** `src/engine/{automaton,simulate,race,walk,correlation,types}.ts`
- **Content:** `src/content/{schema,loader,firestoreLoader}.ts`, `fixtures/`, `scripts/{validate-fixtures,seed-firestore,build-tokens}.ts`
- **Lesson shell/beats/Konva:** `src/lesson/{LessonPlayer,BeatShell,FeedbackStrip,phases,chapters}.*`, `src/lesson/beats/*`, `src/lesson/konva/*`
- **Styles/tokens:** `src/styles/{app.css,surfaces/*}`, `style-dictionary/tokens/*.json`
- **UI/motion:** `src/ui/*`, `src/motion/*`, `src/app/{ErrorBoundary,viewTransition,useOnlineStatus}.ts`
- **Auth/pages:** `src/auth/*`, `src/pages/*` (`StudyDesk`, `studyDesk.model`, `CourseJourney`, `CoursePathPage`, `DevHomePage`)
- **Habit/progress/analytics:** `src/habit/*`, `src/progress/*`, `src/analytics/events.ts`
- **Functions:** `functions/src/{index,streaks,milestones}.ts`; rules `firestore.rules` + `tests/firestore.rules.test.ts`
- **Firebase config:** `firebase.json`, `.firebaserc`, `.env.{development,production}` (gitignored)
- **e2e/VR:** `e2e/*` + `playwright.config.ts`; `e2e/vr/` + `playwright.vr.config.ts`
- **Concept Catalog tests:** unit tests → `src/pages/conceptCatalog.model.test.ts` (27 passing); e2e spec → `e2e/concept-catalog.spec.ts` (/path redirect runs today; catalog group skipped until `/dev/catalog` dev harness is added to DevRoutes.tsx)

**Commands** (call binaries directly): `./node_modules/.bin/vitest run` · `eslint .` · `tsc -b` · `vite build` · `tsx scripts/validate-fixtures.ts` · `playwright test`; VR via `playwright test --config playwright.vr.config.ts`; the `firebase` v24.3.0 alias for deploys/seed.

**Reset learner progress** (client deletes are rules-denied → use CLI/Admin): `firebase firestore:delete users --recursive --force --project brilliant-org` wipes all `users/*` (keeps seeded courses/lessons; does NOT touch Firebase Auth). To also wipe Auth accounts: `GOOGLE_CLOUD_PROJECT=brilliant-org ./node_modules/.bin/tsx scripts/delete-auth-users.ts`.
