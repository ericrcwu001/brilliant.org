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

```bash
git switch -c concept/<slug>            # one branch per concept
# Per-lesson worktree on its OWN branch (you can't check out concept/<slug> twice; use -b):
git worktree add -b lesson/<slug>-<lesson> ../lf-<slug>-<lesson> concept/<slug>
# ... build ... then the Integrator merges lesson/<slug>-<lesson> back into concept/<slug>, then:
git worktree remove ../lf-<slug>-<lesson>
```

The Dept 3 Lead provisions one worktree per lesson (using the commands above), spawns that lesson's workers directly inside it, then merges it back into `concept/<slug>` and removes it.

## Test deploy (on `brilliant-org-dev`)

Deploy the concept to the dev project + seed the dev Firestore so the user tests on the dev linked
domain (the real lesson-loading path, plus `/dev/lesson/:id` for quick no-auth checks):

```bash
./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build --mode dev      # uses .env.dev
# Seed ALL fixtures/course-*.json (+ each course's built:true lessons) into the DEV Firestore:
SEED_TARGET=prod GOOGLE_CLOUD_PROJECT=brilliant-org-dev \
  ./node_modules/.bin/tsx scripts/seed-firestore.ts
firebase deploy --only hosting,firestore,functions --project brilliant-org-dev
```

Review URL = the dev URL resolved in first-run setup step 5. The dev project is non-prod, so the
factory may also push work-in-progress here anytime for incremental testing.

> `SEED_TARGET=prod` just means "real project via Admin SDK" (vs the local emulator); the **project is
> chosen by `GOOGLE_CLOUD_PROJECT`**. Dev = `brilliant-org-dev`, prod = `brilliant-org`.

> **Seed-script scope.** `scripts/seed-firestore.ts` seeds **all** `fixtures/course-*.json` and each
> course's `built:true` lessons in one pass. Coming-soon stubs are course docs with `status:
> 'coming_soon'` and no lessons — the script seeds the course doc only and skips the lessons step for
> them. No `COURSE_ID` filtering is needed; running the script after adding a new fixture is sufficient.

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
Interview Pack (future feature, not deployed): interviews/<courseId>.md  (<N> engine-verified hard Qs)

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

## Reachability

Each approved concept = its own **`fixtures/course-<slug>.json`** seeded to `courses/{courseId}`.
Once seeded, the concept **appears automatically in the Concept Catalog** (the signed-in macro home at
`/`) — no UI code change required. Live concepts are clickable; coming-soon stubs (course docs with
`status: 'coming_soon'` and no lessons) appear as muted, non-enterable cards. The concept is
reachable directly at `/concept/<courseId>` on both dev and prod.

> ⚠️ **Live-concept hard requirement (verify before alerting):** the course doc's `chapters[]` must
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
