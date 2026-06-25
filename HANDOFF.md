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
- **Seeded (prod):** all 7 lessons + the course doc (every node `built:true`) are live in prod Firestore.
- **Git:** on `main`. Base (Ergo + Living Notebook) is committed; recent working-tree changes (page-load latency split — `src/auth/userDoc.ts`, `src/analytics/events.ts`, `vite.config.ts`) are **uncommitted**. Don't commit unless asked.

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
- **Routing:** hand-rolled SPA router + auth guard in `src/App.tsx` (no react-router). Signed-out → landing/auth; signed-in + no `users/{uid}` → `/onboarding/name`; onboarded → `/path`.
- **Firestore writes:** progression/completion/streaks/milestones are **Function-owned** (`completeLesson`, `recordQualifyingAction`, idempotent). Rules are owner-scoped + field-whitelisted; clients can't write progression fields. Instant feedback stays client-side.
- **Perf:** Firestore + Functions are deferred off first paint — `src/firebase/app.ts` eagerly exports app+auth+App Check only; memoized async `getDb()`/`getFns()` dynamically import the SDKs; `vite.config.ts` uses native `rolldownOptions.output.codeSplitting` (eager `fb-core`/`react-vendor`/`motion-vendor`/`zod` only).
- **Design tokens:** Style Dictionary single source (`style-dictionary/tokens/*.json` → `tokens.generated.{css,ts}`) feeds CSS + Konva + motion. CSS split into `src/styles/surfaces/*` under `@layer`.

## Next Steps (priority order)

1. **Living Notebook / Ergo restyle follow-ups:** re-run e2e (warm Vite first), VR sweep + re-baseline (baselines stale), commit when asked.
2. **Resolve cycle-1 beat-audit proposals** (`audits/proposals/cycle-1.md`): redesign/waive `pattern-pick` + `guided-solve`, then continue/stop the loop.
3. **Instrument perf (O4):** feedback <100ms, no per-frame React state during drag/animation (currently uninstrumented).
4. Enable **Google sign-in** (last gate for full live auth).
5. **Live end-to-end check** (emulator/seed/auth + live `/path`; verify unlock chain + milestones on an authed walk) — user's terminal (no Java here).
6. **Tidy the working tree** (only when asked): commit pending work; consider removing the stray committed `docs/Hermes-Setup.dmg` (binary, likely unintended).

## Quick Reference

- **Docs:** `docs/{mvp_prd,core_instructions,ui_design_system,home-study-desk,beat-audit-rubric,proposed-lessons,future_ideas,security-audit}.md`, `docs/build-brief-*.md`, `docs/ergo-lesson-restyle-brief/*`, `docs/adr/000{1,2,3}-*.md`, `CONTEXT.md` (glossary), `audits/*`.
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

**Commands** (call binaries directly): `./node_modules/.bin/vitest run` · `eslint .` · `tsc -b` · `vite build` · `tsx scripts/validate-fixtures.ts` · `playwright test`; VR via `playwright test --config playwright.vr.config.ts`; the `firebase` v24.3.0 alias for deploys/seed.

**Reset learner progress** (client deletes are rules-denied → use CLI/Admin): `firebase firestore:delete users --recursive --force --project brilliant-org` wipes all `users/*` (keeps seeded courses/lessons; does NOT touch Firebase Auth). To also wipe Auth accounts: `GOOGLE_CLOUD_PROJECT=brilliant-org ./node_modules/.bin/tsx scripts/delete-auth-users.ts`.
