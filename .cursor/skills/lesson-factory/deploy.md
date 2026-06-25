# Staging (dev), Alert & Ship (prod)

Two Firebase projects:

| Role | Project | Number | When |
|---|---|---|---|
| **Dev / staging** | `brilliant-org-dev` | 836579828208 | factory deploys + seeds freely, for the user to **test** |
| **Production** | `brilliant-org` | 801582458333 | **only** after the user approves a concept |

The factory only writes to a **per-concept branch** + the **dev project**. Production is touched only
on approval.

> **Repo command gotchas (from `HANDOFF.md` — obey):**
> - **No `npm run`** — call `./node_modules/.bin/{tsx,vitest,tsc,vite,eslint,playwright}` directly.
> - **`firebase` CLI = the v24.3.0 shell alias** (not `npx firebase`). Pick the project with
>   `--project brilliant-org-dev` or `--project brilliant-org`.
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
Run these in your terminal (use your `firebase` v24.3.0 alias), then reply *done* and I'll continue:

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

```bash
git switch -c concept/<slug>            # one branch per concept
git worktree add ../lf-<slug>-<lesson> concept/<slug>   # isolated per-lesson build
# ... build ...
git worktree remove ../lf-<slug>-<lesson>
```

Prefer a `best-of-n-runner` subagent per lesson — it provisions its own worktree + branch.

## Test deploy (on `brilliant-org-dev`)

Deploy the concept to the dev project + seed the dev Firestore so the user tests on the dev linked
domain (the real lesson-loading path, plus `/dev/lesson/:id` for quick no-auth checks):

```bash
./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build --mode dev      # uses .env.dev
# Seed the concept's lessons + course doc into the DEV Firestore (Admin SDK + ADC):
SEED_TARGET=prod GOOGLE_CLOUD_PROJECT=brilliant-org-dev \
  ./node_modules/.bin/tsx scripts/seed-firestore.ts
firebase deploy --only hosting,firestore,functions --project brilliant-org-dev
```

Review URL = the dev URL resolved in first-run setup step 5. The dev project is non-prod, so the
factory may also push work-in-progress here anytime for incremental testing.

> `SEED_TARGET=prod` just means "real project via Admin SDK" (vs the local emulator); the **project is
> chosen by `GOOGLE_CLOUD_PROJECT`**. Dev = `brilliant-org-dev`, prod = `brilliant-org`.

> **Seed-script generalization (required infra, first concept's Wave 0).** `scripts/seed-firestore.ts`
> hardcodes `course-pattern-hitting-times.json`. Generalize it to seed **all** `fixtures/course-*.json`
> (and each course's `built:true` lessons), or accept a `COURSE_ID` arg.

## Slack alert — concept ready to test (Manager → user)

`user-slack` MCP → `slack_send_message`, `channel_id` = the user's `user_id` **`U0B9VC0TJBH`** (DM).
Echo into chat as fallback. Template:

```
*Lesson Factory — concept ready to test: <Concept Title>*
<one-line pitch>

Lessons (all 9/9 gates green):
• <L1 title> — <one-liner>  | sources: GB p.<n>, <web>
• <L2 title> — <one-liner>  | sources: GB p.<n>
...

Fact-check: every answer cited AND reproduced by the engine. validate/test/build/lint/e2e green.
TEST IT (dev, not prod): <resolved dev URL>   (e.g. https://brilliant-org-dev.web.app)
Scorecards: concepts/<slug>/*/scorecard.md

Reply *approve* to ship the whole concept to PRODUCTION (brilliant-org), or send change requests.
```

## Approval handling

- **Change requests** → route to the owning department, re-run that stage, re-QA, redeploy to dev,
  re-alert.
- **Approved** → ship (next section). Never seed/deploy **prod** without this.

## Ship (on approval → `brilliant-org`)

```bash
git switch main && git merge --no-ff concept/<slug>          # promote the whole concept
./node_modules/.bin/tsx scripts/validate-fixtures.ts         # final gate on main
./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build # prod build (.env.production)
# Seed the concept's lessons + course doc into PROD Firestore:
SEED_TARGET=prod GOOGLE_CLOUD_PROJECT=brilliant-org \
  ./node_modules/.bin/tsx scripts/seed-firestore.ts
firebase deploy --only hosting,firestore,functions --project brilliant-org
```

Confirm in Slack with the production link once deployed.

## Reachability now (macro browse deferred)

Each approved concept = its own **`fixtures/course-<slug>.json`** (macro) doc seeded to
`courses/{courseId}` with `built:true` lesson nodes — reachable via a direct course/lesson deep link
on both dev and prod. The cross-concept **browse** UI is the macro layer the user builds later. If the
SPA router has no public deep link to a non-default course yet, add a minimal `/<courseId>` (or
`?course=`) entry when shipping the first new concept.

## Environment / config

- `references/green-book.txt` — ground truth (gitignored).
- `.env.dev` — dev build config, **auto-generated by first-run setup** (gitignored via `.env.*`);
  `.env.production` — prod build config.
- `.env.factory` — optional factory config (gitignored). Default Slack DM target `U0B9VC0TJBH`.
- Never commit `references/`, `.env*` (except `.env.example`), or service-account keys.
