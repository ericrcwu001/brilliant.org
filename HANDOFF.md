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
