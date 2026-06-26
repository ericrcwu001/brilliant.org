# Staging (dev), Alert & Ship (prod)

Two Firebase projects:

| Role | Project | Number | When |
|---|---|---|---|
| **Dev / staging** | `brilliant-org-dev` | 836579828208 | factory deploys + seeds freely, for the user to **test** |
| **Production** | `brilliant-org` | 801582458333 | **automatically**, once a concept passes QA + the dev smoke test |

The factory builds on a **per-concept branch (in a worktree outside this repo; this checkout stays on
`main`)** and smoke-tests on the **dev project**, then **automatically** merges to `main`, pushes, and
ships to **production** — no approval step.

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

## Smoke-test deploy (on `brilliant-org-dev`)

From the `../lf-<slug>` worktree, deploy the concept to the dev project + seed the dev Firestore as an
automated pre-ship smoke test (the real lesson-loading path, plus `/dev/lesson/:id` for quick no-auth
checks). The Manager confirms it renders, then ships — no human review:

```bash
./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build --mode dev      # uses .env.dev
# Seed ALL fixtures/course-*.json (+ each course's built:true lessons) into the DEV Firestore:
SEED_TARGET=prod GOOGLE_CLOUD_PROJECT=brilliant-org-dev \
  ./node_modules/.bin/tsx scripts/seed-firestore.ts
firebase deploy --only hosting,firestore,functions --project brilliant-org-dev
```

Smoke-test URL = the dev URL resolved in first-run setup step 5; the Manager verifies the concept
renders there (catalog `/` + `/concept/<courseId>`) before shipping. The dev project is non-prod, so the
factory may also push work-in-progress here anytime for incremental testing.

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
git push origin main                                         # publish main to the remote
./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build # prod build (.env.production)
# Seed the concept's lessons + course doc into PROD Firestore:
SEED_TARGET=prod GOOGLE_CLOUD_PROJECT=brilliant-org \
  ./node_modules/.bin/tsx scripts/seed-firestore.ts
firebase deploy --only hosting,firestore,functions --project brilliant-org
git worktree remove ../lf-<slug>                             # concept worktree no longer needed
```

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
Interview Pack (future feature, not deployed): interviews/<courseId>.md  (<N> engine-verified hard Qs)

Shipped autonomously — no action needed. Reply with change requests if anything looks off.
```

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
