# Pipeline & Orchestration

The Manager runs this for **one concept per run**. Maximize parallelism at every stage; the only
serialization point is the **Wave-0 contract freeze** (there is no human approval gate — the run
ships autonomously).

## 0. Preflight (Manager)

- **HARD-REQUIRE nested-spawn probe** (run first, before any other step): spawn a 2-deep nested
  chain — a subagent that spawns a subagent — confirming that a lead can spawn a worker
  (`Manager → lead → worker`, 3 layers total, per ADR-0007). If any layer cannot spawn its child,
  **hard-stop** and tell the user the skill requires nested subagent spawning to 3 layers (a lead
  that can spawn workers) and cannot run in this environment. **No flat fallback.**
- **Run the automated first-run setup** (`deploy.md` → First-run setup): ground-truth check,
  `firebase` auth, auto-generate `.env.dev`, dev-routes flag, seed credentials (ADC), and resolve the
  dev URL. Idempotent; if any **credential login is missing, the Manager Slack-DMs the user the exact
  terminal commands** and pauses until they reply.
- **`OPENAI_API_KEY` secret preflight — HARD-gates every functions deploy.** Before any functions deploy
  to a project `<p>`, hard-check the secret: `firebase functions:secrets:access OPENAI_API_KEY --project <p>`.
  **Set** → include `functions` in that project's deploy (the predeploy hook bundles the interview pack and
  the live interview activates). **Absent** → deploy `--only hosting,firestore` only and flag
  functions-deploy + secret-set as a **remaining human step** (matches HANDOFF.md); **never** silently
  deploy functions without it (that ships a `mintInterviewToken` that errors at runtime). Full rule +
  commands: `deploy.md` → "OPENAI_API_KEY secret — HARD preflight".
- Confirm this repo is clean and on `main`. **Keep it on `main` for the entire run** — never
  `git switch` this checkout. Create the concept branch in a **worktree outside the repo** and work
  there: `git worktree add -b concept/<slug> ../lf-<slug> main`. All concept-level artifacts, builds,
  and the dev smoke deploy run from `../lf-<slug>`.
- Read `docs/mvp_prd.md`, `docs/beat-audit-rubric.md`, `docs/ui_design_system.md`, and skim
  `fixtures/lesson-*.json` + `src/content/schema.ts` so plans reuse what exists.

## 1. Concept planning (Manager + Dept 1)

- The Manager spawns the **persistent Dept 1 Lead** (`claude-opus-4-8-thinking-max-fast`,
  non-readonly, resumable). The Dept 1 Lead runs its internal flow and synthesizes results to
  `concepts/<slug>/`:
  - Spawns **Corpus Cartographer** (non-readonly) and **Source Miner** (non-readonly) in parallel.
    Corpus Cartographer surveys the **entire existing corpus** — shipped (`fixtures/lesson-*.json`
    on `main` + prod Firestore) and in-dev (open `concept/*` branches + dev `brilliant-org-dev`
    Firestore via the Firebase MCP) — and writes the **Continuity Report**
    (`concepts/<slug>/continuity-report.md`): every conceptual overlap flagged and marked **dedupe**
    or a **retrieval / spaced-review / interleaving** opportunity (`inclusive-research-5`).
    Source Miner anchors the concept in the Green Book and assembles the verified, cited problem set
    (book problems + sourced look-alikes).
  - Spawns **Curriculum Architect**, who produces the **Concept Brief**
    (`concepts/<slug>/concept-brief.md`): the lesson list (order, prerequisites, one-line objective
    each) — using the Continuity Report so it never re-teaches covered ground, folding overlaps into
    deliberate recall.
  - Dept 1 Lead synthesizes both artifacts and writes them to the concept branch; escalates to the
    Manager.
- Manager reviews the Concept Brief. If `/lesson-factory` was called with no argument, present the
  candidate backlog to the user and let them pick before continuing.

## 2. Per-lesson design (Dept 1 → Dept 2, looped) — PARALLEL across lessons

The Manager also spawns the **persistent Dept 2 Lead** (`claude-opus-4-8-thinking-max-fast`,
non-readonly, resumable). The Manager drives a **Manager-mediated design loop** for each lesson by
resuming each lead in turn with the other's latest on-disk artifact:

1. Manager resumes **Dept 1 Lead** with the lesson context → Dept 1 Lead spawns its workers
   (Architect skeleton, then Misconception ∥ Assessment, then synthesize) and writes the **Lesson
   Brief** (`concepts/<slug>/<lesson>/brief.md`): hook, core promise, cited problems + answers,
   beat-by-beat plan, misconceptions, assessment.
2. Manager resumes **Dept 2 Lead** with the updated Lesson Brief → Dept 2 Lead spawns its workers
   and writes the **Interaction Spec** (`concepts/<slug>/<lesson>/interaction-spec.md`): per beat,
   the mechanic, reuse-vs-new, build decomposition, feedback/hints, a11y, visual/motion, track.
3. **Loop** (Manager resumes Dept 1 Lead with the Interaction Spec, then Dept 2 Lead with the
   revised Lesson Brief, alternating) until the joint **Definition-of-Ready** holds for every beat
   (every beat has a verified+sourced problem AND a concrete interactive mechanic + feedback). Each
   lead self-resolves within its lane; unresolved conflicts escalate to the Manager; the Manager
   escalates to the user only as a last resort.

Independent lessons run concurrently — the Manager fans out across lessons and drives each lesson's
loop in parallel.

## 3. Wave 0 — freeze shared contracts (Dept 3 Lead + Schema/Types worker) — SERIAL

Before any per-lesson build starts, the Manager resumes the **persistent Dept 3 Lead**
(`claude-opus-4-8-thinking-max-fast`, non-readonly, resumable) for the Wave-0 contract freeze.
The Dept 3 Lead spawns its **Schema/Types worker** to collect every **new interaction type** the
concept needs across all lessons and freeze them once:

- Add the Zod variants to `src/content/schema.ts` and the dispatcher slots in
  `src/lesson/beats/index.tsx` (stubs OK).
- Freeze each new engine module's **interface** (signatures + types) in `src/engine/<topic>.ts`.
- Record the frozen contracts in `concepts/<slug>/wave0-contracts.md`.

This is the safeguard that lets lessons build in parallel without colliding on shared files. Commit
Wave 0 to the concept branch.

## 4. Build — PARALLEL across lessons, in isolated worktrees

The **Dept 3 Lead** provisions one isolated worktree per lesson **on its own branch** (cannot check
out `concept/<slug>` in two worktrees at once — uses `-b` to fork a per-lesson branch):

```bash
git worktree add -b lesson/<slug>-<lesson> ../lf-<slug>-<lesson> concept/<slug>
```

For each lesson the Lead spawns that lesson's role chain workers **directly** inside that worktree:
Drafter → Brief Reviewer → **Coder A (engine+goldens) ∥ Coder B (renderer+widget+fixture) ∥ Test
Author** → Verification → Code Reviewer → Integrator. Each lesson adds only **its own** files
(engine module, renderer, fixture, tests) plus filling its Wave-0 slot — never editing another
lesson's files.

The Lead keeps a bounded number of lessons/worktrees in flight at once (assembly-line batching).
The **Integrator** (or the Lead) merges each finished worktree back into `concept/<slug>` and
removes it (`git worktree remove ...`). The Lead orders merges to resolve the rare
shared-file conflict (dispatcher index) deterministically.

## 5. QA gate (per lesson) — see `qa-rubric.md`

Each lesson must pass the **two-stage fact-check** and all **9 Scorecard gates**. The Verification
Engineer runs the mechanized checks; Dept 1/Dept 2 critics confirm the judgment gates. Emit
`concepts/<slug>/<lesson>/scorecard.md`. A red gate loops back to the owning department.

## 5b. Interview Pack — Interview Studio — see `interview-packs.md`

Once the concept's lessons are built (engines available), the Manager spawns the **persistent
Interview Studio Lead** (`claude-opus-4-8-thinking-max-fast`, non-readonly, resumable), which builds
the concept's capstone AI-interview pack reusing those engines:

- The Interview Studio Lead spawns **Interview Question Author** (designs the tiered
  `hard/harder/brutal` synthesis questions + engine-backed templates) and **Interview Prompt
  Engineer** (writes the interviewer + generator prompts).
- The Interview Studio Lead also spawns its own **Coder**, **Verification Engineer**, and
  **Integrator** workers — it cannot reach into Dept 3's subtree. The Coder builds the
  templates/parameterizer/fingerprinter; the Verification Engineer engine-verifies the **entire
  pre-loaded pool**; the Integrator writes `interviews/<courseId>.json` + `interviews/<courseId>.md`.
- Gate it with the **Interview Pack Scorecard** (`qa-rubric.md` / `interview-packs.md`). May run in
  parallel with per-lesson QA once the engines are frozen.

## 6. Dev smoke test (Manager)

When **every** lesson's Scorecard is green **and the Interview Pack Scorecard is green**, the Manager
deploys the concept (from the `../lf-<slug>` worktree) to the **dev project `brilliant-org-dev`
(#836579828208)**, seeds its Firestore, and **verifies it renders** (see `deploy.md` → Smoke-test
deploy) as an automated pre-ship smoke test. If the smoke test fails it hard-stops and escalates;
otherwise it proceeds straight to Ship.

## 7. Auto-ship (Manager) — see `deploy.md`

- **Green smoke test → ship automatically** (no approval): from this repo (already on `main`),
  `git merge --no-ff concept/<slug>` then `git push origin main`; seed the concept's course doc +
  lessons to **prod (`brilliant-org`)** and `vite build` + `firebase deploy --project brilliant-org`;
  then `git worktree remove ../lf-<slug>`. The concept **auto-registers in the Concept Catalog** on
  seed (ADR-0004) — live at `/concept/<courseId>` (lessons at `/lesson/<lessonId>`), zero UI code. The
  Interview Pack is merged and **bundled into the live Functions runtime** by the predeploy hook when
  functions deploy (not seeded to Firestore). **Slack-DM a one-time FYI** with the production
  `/concept/<courseId>` link.
- **Only on failure** (red QA gate, broken dev smoke test, or unanchored concept) → hard-stop, do
  **not** ship, and escalate to the user (route fixable notes to the owning department, re-run, re-QA).

## Parallelism summary

- **Manager layer:** Manager spawns 4 persistent leads (Dept 1, Dept 2, Dept 3, Interview Studio)
  and drives all inter-department coordination; it is the only agent that talks to the user.
- **Within a department:** each lead fans out to its workers concurrently (Dept 1: Corpus
  Cartographer ∥ Source Miner; Dept 2: up to 9 roles; Dept 3 per-lesson: Coder A ∥ Coder B
  ∥ Test Author).
- **Dept 3 per-lesson worktrees:** the Dept 3 Lead fans out to one worker role chain per lesson,
  each in its own worktree, batched as an assembly line.
- **Across lessons:** the concept's lessons flow as an assembly line — design lesson N+1 while
  lesson N is being coded; independent lessons fully parallel.
- **Serialization only at:** Wave-0 freeze and worktree merges (no human approval gate — the run ships autonomously).

## Artifacts on the concept branch

```
concepts/<slug>/
├── concept-brief.md
├── continuity-report.md
├── wave0-contracts.md
├── <lesson>/
│   ├── brief.md              # Dept 1
│   ├── interaction-spec.md   # Dept 2
│   ├── implementation-brief.md # Dept 3
│   └── scorecard.md          # QA
└── ...
fixtures/lesson-<lesson>.json # the actual lesson (one per lesson)
fixtures/course-<slug>.json   # the concept (macro) doc
src/engine/<topic>.ts         # new verifying engine(s)
src/lesson/beats/<Beat>.tsx   # new renderer(s) / widget(s)
interviews/<courseId>.json    # capstone Interview Pack (committed; bundled into Functions at deploy)
interviews/<courseId>.md      # human-readable mirror
```
