# Staging (dev), Alert & Ship (prod)

Two Firebase projects:

| Role | Project | Number | When |
|---|---|---|---|
| **Dev / staging** | `brilliant-org-dev` | 836579828208 | factory deploys + seeds freely, for the user to **test** |
| **Production** | `brilliant-org` | 801582458333 | **automatically**, once a concept passes QA + the dev smoke test |

The factory builds on a **per-concept branch (in a worktree outside this repo; this checkout stays on
`main`)** and smoke-tests on the **dev project**, then **automatically** merges to `main`, pushes, and
ships to **production** — no approval step.

> **What the factory deploys (authoritative — keep dev + prod consistent):**
> - **Hosting + Firestore (the lesson app): always, autonomously.** This is the autonomous auto-ship.
> - **Functions (the secret-dependent, paid live interview): secret-gated.** Functions deploy only when
>   the `OPENAI_API_KEY` secret is set on the target project (the HARD preflight below). If the secret is
>   set → the factory deploys functions too and the live interview activates. If it is **not** set → the
>   factory deploys **`--only hosting,firestore`** and flags functions-deploy + secret-set as a remaining
>   **human** step (matching HANDOFF.md, which lists prod functions-deploy + secret-set as "User-run
>   remaining"). The factory **NEVER** silently deploys functions without the secret.

> **Repo command gotchas (from `HANDOFF.md` — obey):**
> - **No `npm run`** — call `./node_modules/.bin/{tsx,vitest,tsc,vite,eslint,playwright}` directly.
> - **Use the `firebase` shell alias** (it pins Node to **v24.3.0**, which firebase-tools needs; not
>   `npx firebase`/global). Pick the project with `--project brilliant-org-dev` or `--project brilliant-org`.
> - **No Java locally** → emulator/rules tests are user-run. The dev/prod **Admin-SDK seed** and the
>   **hosting deploys** need no Java; the factory runs them.

## First-run setup (the skill does this automatically)

On the first run (or whenever something is missing) the Manager runs this preflight. It is
**idempotent** and skips anything already in place. Everything here is automated **except** one-time
interactive credential logins (browser OAuth) — for those, the skill **Slack-DMs the user the exact
terminal commands** and pauses (see step 2).

1. **Ground truth** — ensure `references/green-book.txt` exists (extract from
   `references/green-book.pdf` per *Ground-truth setup* below). If neither exists, stop and ask for the book.

2. **Credentials — the only steps that need the user (Slack-DM'd).** Check both:
   ```bash
   firebase projects:list                                   # is the firebase CLI logged in?
   gcloud auth application-default print-access-token        # is ADC present (for the Admin-SDK seed)?
   ```
   If **either** is missing, the Manager **Slack-DMs the user ONE message listing every command to run
   in their terminal** (the *Credential setup* template below — include only the missing ones), then
   **pauses** until the user replies (e.g. *done*). Re-verify, then continue. (Logins write to the
   shared home dir, so the factory's shell picks them up automatically afterward.)

3. **`.env.dev` — auto-generated.** If missing, pull the dev web config and write it:
   ```bash
   firebase apps:sdkconfig web --project brilliant-org-dev    # prints the web config
   ```
   Write `.env.dev` (gitignored via `.env.*`) with the mapped `VITE_FIREBASE_*` values plus:
   ```
   VITE_USE_EMULATORS=false
   VITE_INCLUDE_DEV_ROUTES=1
   ```

4. **Dev-routes flag (PINNED: ON).** Ensure the build gates `DevRoutes` on
   `import.meta.env.VITE_INCLUDE_DEV_ROUTES`; if that gate doesn't exist yet, add it (small infra) so
   `/dev/lesson/:id` is available on the dev build. Dev routes are **enabled on dev** (quick no-auth
   review), alongside real Firestore-seeded review.

5. **Dev URL (PINNED: auto-resolve).** `firebase hosting:sites:list --project brilliant-org-dev`; the
   review URL is the default `https://brilliant-org-dev.web.app` plus any linked custom domain it
   reports. The Manager records the live URL(s) for the Slack alert — **no hardcoded domain**.

> Non-interactive/CI runs: instead of the gcloud ADC login, provide `GOOGLE_APPLICATION_CREDENTIALS`
> (a gitignored service-account key with access to the target project) and ensure `.env.dev` exists.

### Credential setup — Slack DM template (step 2)

`user-slack` → `slack_send_message`, `channel_id` = **`U0B9VC0TJBH`**. List only the commands detected
as missing:

```
*Lesson Factory — one-time credential setup needed*
Run these in your terminal (use your `firebase` alias), then reply *done* and I'll continue:

```bash
firebase login                                   # authorizes deploys (only if not logged in)
gcloud auth application-default login            # authorizes the Admin-SDK seed (only if ADC missing)
```

These let me deploy to brilliant-org-dev and seed its Firestore. I'll re-check and resume automatically once you reply.
```

## Ground-truth setup (`references/`)

The Green Book lives gitignored at `references/`.

- Required: **`references/green-book.txt`** — grep-searchable extraction with page markers
  (`===== PAGE n =====`) for citations.
- (Re)create from `references/green-book.pdf` with Python (`pypdf`, or `pdfplumber`/PyMuPDF). Verify:
  `rg -c "Markov|Bayes|gambler" references/green-book.txt`.
- More source books later = drop more files in `references/` (the Green Book stays the concept anchor).

## Branch + worktrees

**This repo always stays on `main`** — never `git switch` this checkout. The concept branch lives in a
worktree *outside* the repo, and each lesson gets its own nested worktree:

```bash
# Concept branch in its OWN worktree (this repo stays on main):
git worktree add -b concept/<slug> ../lf-<slug> main
# Per-lesson worktree on its OWN branch, forked from the concept branch:
git worktree add -b lesson/<slug>-<lesson> ../lf-<slug>-<lesson> concept/<slug>
# ... build ... then the Integrator merges lesson/<slug>-<lesson> back into concept/<slug>, then:
git worktree remove ../lf-<slug>-<lesson>
```

All concept-level work (artifacts, builds, the dev smoke deploy) runs from `../lf-<slug>`. The Dept 3
Lead provisions one worktree per lesson, spawns that lesson's workers directly inside it, then merges it
back into `concept/<slug>` and removes it. The `../lf-<slug>` worktree is removed after the concept
ships (see Ship).

## OPENAI_API_KEY secret — HARD preflight (gates every functions deploy)

The interview Functions (`mintInterviewToken` / `gradeInterview`, `functions/src/interview.ts`) bind the
`OPENAI_API_KEY` Functions secret (`defineSecret('OPENAI_API_KEY')`) and call OpenAI at runtime (a
**paid** Realtime/Responses call). **HANDOFF.md lists setting this secret on `brilliant-org` AND
`brilliant-org-dev`, plus the functions deploy, as "User-run remaining"** — so the factory must NOT
assume it is set on any project.

Before **any** functions deploy to a project `<p>`, run this hard check and branch on it:

```bash
firebase functions:secrets:access OPENAI_API_KEY --project <p>   # exit 0 + a value ⇒ secret is set
```

- **Secret present (exit 0):** include `functions` in that project's deploy (the predeploy hook bundles
  the interview packs and the live interview activates).
- **Secret absent (non-zero / no value):** **do NOT deploy functions to `<p>`.** Deploy
  `--only hosting,firestore` only, and flag **functions-deploy + secret-set** as a remaining human step
  (matching HANDOFF.md). Never silently deploy functions without the secret — that ships a `mintInterviewToken`
  that errors at runtime.

This same check is wired into `pipeline.md` step-0 preflight and `SKILL.md` (Environment / Guardrails);
the smoke-test and Ship steps below both branch on it.

> To set the secret (the user-run step the factory surfaces when it is missing):
> ```bash
> firebase functions:secrets:set OPENAI_API_KEY --project <p>   # brilliant-org and/or brilliant-org-dev
> ```

## Smoke-test deploy (on `brilliant-org-dev`)

From the `../lf-<slug>` worktree, deploy the concept to the dev project + seed the dev Firestore as an
automated pre-ship smoke test (the real lesson-loading path, plus `/dev/lesson/:id` for quick no-auth
checks). The Manager confirms it renders, then ships — no human review:

```bash
./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build --mode dev      # uses .env.dev
# Seed ALL fixtures/course-*.json (+ each course's built:true lessons) into the DEV Firestore:
SEED_TARGET=prod GOOGLE_CLOUD_PROJECT=brilliant-org-dev \
  ./node_modules/.bin/tsx scripts/seed-firestore.ts

# Run the OPENAI_API_KEY hard preflight (above) for brilliant-org-dev, then deploy accordingly:
if firebase functions:secrets:access OPENAI_API_KEY --project brilliant-org-dev >/dev/null 2>&1; then
  firebase deploy --only hosting,firestore,functions --project brilliant-org-dev   # secret set ⇒ interview live on dev
else
  firebase deploy --only hosting,firestore --project brilliant-org-dev             # no secret ⇒ skip functions; flag as remaining
fi
```

Smoke-test URL = the dev URL resolved in first-run setup step 5; the Manager verifies the concept
renders there (catalog `/` + `/concept/<courseId>`) before shipping. The dev project is non-prod, so the
factory may also push work-in-progress here anytime for incremental testing.

### Interview-mint smoke (only when the dev secret IS set — exercise the mint path)

The render check above only proves the catalog/concept pages load; it does **not** prove the interview
works. So **when (and only when) the dev `OPENAI_API_KEY` secret is set and functions were deployed to
dev above**, run **one capped** dev mint against the deployed `mintInterviewToken` for the new
`course-<slug>`:

- Assert `mintInterviewToken({ conceptId: 'course-<slug>' })` returns an `attemptId` + a `question`
  (the loader resolved the bundled pack and `drawQuestion` drew one) and an ephemeral `clientSecret`.
- **Cap it:** make exactly ONE mint, then abandon the session immediately — do **not** open the
  WebRTC/audio session and do **not** call `gradeInterview`. The minted token self-expires
  (`TOKEN_TTL_SECONDS`), so an abandoned mint costs ~nothing; this stays well under the
  ≈$0.20 manual-smoke ceiling HANDOFF cites.
- A failed/erroring mint **hard-stops the run** (the interview would be broken in prod) and is escalated.

If the dev secret is **not** set, this mint smoke is **skipped** (there is no dev functions runtime to
hit). In that case the green smoke covers lessons only — record that the interview path is unverified and
that prod functions-deploy + secret-set remain human steps (see Ship). The `/dev/interview` route uses a
**stubbed transport** (`src/interview/stubRealtimeTransport.ts`) and does NOT call the real
`mintInterviewToken`, so it is not a substitute for this check.

> `SEED_TARGET=prod` just means "real project via Admin SDK" (vs the local emulator); the **project is
> chosen by `GOOGLE_CLOUD_PROJECT`**. Dev = `brilliant-org-dev`, prod = `brilliant-org`.

> **Seed-script scope.** `scripts/seed-firestore.ts` seeds **all** `fixtures/course-*.json` and each
> course's `built:true` lessons in one pass. Coming-soon stubs are course docs with `status:
> 'coming_soon'` and no lessons — the script seeds the course doc only and skips the lessons step for
> them. No `COURSE_ID` filtering is needed; running the script after adding a new fixture is sufficient.

## Ship (automatic, on a green smoke test → `brilliant-org`)

No approval step. Once the dev smoke test is green, ship from **this repo** (which has stayed on
`main` the whole run — no `git switch` needed):

```bash
git merge --no-ff concept/<slug>                             # promote the whole concept onto main
./node_modules/.bin/tsx scripts/validate-fixtures.ts         # final gate on main
./node_modules/.bin/tsx scripts/validate-interview-packs.ts  # interview-pack gate on main
git push origin main                                         # publish main to the remote
./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build # prod build (.env.production)
# Seed the concept's lessons + course doc into PROD Firestore:
SEED_TARGET=prod GOOGLE_CLOUD_PROJECT=brilliant-org \
  ./node_modules/.bin/tsx scripts/seed-firestore.ts

# Hosting + firestore (the lesson app) ALWAYS ship autonomously. Functions (the
# secret-dependent, paid live interview) ship ONLY when the OPENAI_API_KEY secret
# is set on brilliant-org — the HARD preflight above (NEVER deploy functions without it):
if firebase functions:secrets:access OPENAI_API_KEY --project brilliant-org >/dev/null 2>&1; then
  firebase deploy --only hosting,firestore,functions --project brilliant-org   # secret set ⇒ activate the live interview
else
  firebase deploy --only hosting,firestore --project brilliant-org             # no secret ⇒ ship the lesson app only
  # → flag functions-deploy + `firebase functions:secrets:set OPENAI_API_KEY --project brilliant-org`
  #   as a remaining HUMAN step in the Slack FYI (matches HANDOFF.md's "User-run remaining").
fi
git worktree remove ../lf-<slug>                             # concept worktree no longer needed
```

> **Interview pack + functions deploy (secret-gated).** The `firebase.json` predeploy hook
> (`scripts/copy-interview-packs.mjs`) copies `interviews/course-*.json` into `functions/packs/` at
> deploy time — so the interview pack reaches the Functions runtime **whenever functions deploy**. But the
> functions deploy itself is **gated on the OPENAI_API_KEY hard preflight** (top of this doc): functions
> deploy (and thus activate the live interview) **only when the secret is set on the target project**.
> The `loadPack` function strips a leading `course-` from the conceptId
> (`conceptId.replace(/^course-/, '')`) so `course-<slug>.json` is always the filename.
> Shipping `--only hosting,firestore` (the no-secret path) skips the predeploy hook, does not touch the
> interview runtime, and leaves the pack to be bundled later when a human deploys functions with the secret.

If `validate-fixtures` (the final gate on `main`) fails, **abort the merge** (`git merge --abort`, or
reset `main` to its pre-merge commit) and hard-stop instead of pushing or deploying — `main` must never
carry a broken concept.

## Slack FYI — concept shipped (Manager → user)

After prod deploy succeeds, send **one** notification (`user-slack` MCP → `slack_send_message`,
`channel_id` = the user's `user_id` **`U0B9VC0TJBH`**; echo into chat as fallback). This is an FYI,
**not** a request — the concept is already live:

```
*Lesson Factory — shipped to production: <Concept Title>*
<one-line pitch>

Lessons (all 9/9 gates green):
• <L1 title> — <one-liner>  | sources: GB p.<n>, <web>
• <L2 title> — <one-liner>  | sources: GB p.<n>
...

Fact-check: every answer cited AND reproduced by the engine. validate/test/build/lint/e2e green.
LIVE (prod): <prod URL>/concept/<courseId>
Scorecards: concepts/<slug>/*/scorecard.md
Interview Pack: interviews/<courseId>.md  (<N> engine-verified hard Qs) — bundled into the prod Functions runtime when functions were deployed (OPENAI_API_KEY set); otherwise flagged as a remaining human step

Shipped autonomously — no action needed. Reply with change requests if anything looks off.
```

## Interview-critical hosting headers (ADR-0008 — do not strip)

The `firebase.json` hosting config carries headers required for the live interview feature. When
deploying `--only hosting`, verify these are not removed:

- `Content-Security-Policy`: must include `connect-src … https://api.openai.com` (the browser
  connects directly to OpenAI Realtime via an ephemeral token).
- `Permissions-Policy`: must include `microphone=(self)` (hard-blocks the mic if absent).

These are already set in `firebase.json`. Any hosting-only lesson ship should leave that file
untouched.

## Reachability

Each shipped concept = its own **`fixtures/course-<slug>.json`** seeded to `courses/{courseId}`.
Once seeded, the concept **appears automatically in the Concept Catalog** (the signed-in macro home at
`/`) — no UI code change required. Live concepts are clickable; coming-soon stubs (course docs with
`status: 'coming_soon'` and no lessons) appear as muted, non-enterable cards. The concept is
reachable directly at `/concept/<courseId>` on both dev and prod.

> ⚠️ **Live-concept hard requirement (verify before shipping):** the course doc's `chapters[]` must
> cover **every** built `lessonId`. The per-concept journey renders lessons **only inside chapters**; a
> missing/incomplete `chapters[]` silently falls back to Pattern-Hitting-Times' chapters → the new
> concept's lessons render **invisible**. The catalog also `safeParse`s each course doc and **silently
> skips** any that fail `CourseSchema`. So always confirm the concept actually renders on the dev
> catalog (`/`) + `/concept/<courseId>` — a silent skip or empty journey won't error.

## Environment / config

- `references/green-book.txt` — ground truth (gitignored).
- `.env.dev` — dev build config, **auto-generated by first-run setup** (gitignored via `.env.*`);
  `.env.production` — prod build config.
- `.env.factory` — optional factory config (gitignored). Default Slack DM target `U0B9VC0TJBH`.
- Never commit `references/`, `.env*` (except `.env.example`), or service-account keys.
