# Pipeline & Orchestration

The Manager runs this for **one concept per run**. Maximize parallelism at every stage; the only
serialization points are the **Wave-0 contract freeze** and the **human approval gate**.

## 0. Preflight (Manager)

- **Run the automated first-run setup** (`deploy.md` → First-run setup): ground-truth check,
  `firebase` auth, auto-generate `.env.dev`, dev-routes flag, seed credentials (ADC), and resolve the
  dev URL. Idempotent; if any **credential login is missing, the Manager Slack-DMs the user the exact
  terminal commands** and pauses until they reply.
- Confirm the repo is clean and on `main` (or ask). Create the concept branch:
  `git switch -c concept/<slug>`. Set it active.
- Read `docs/mvp_prd.md`, `docs/beat-audit-rubric.md`, `docs/ui_design_system.md`, and skim
  `fixtures/lesson-*.json` + `src/content/schema.ts` so plans reuse what exists.

## 1. Concept planning (Manager + Dept 1)

- **Corpus Cartographer** (non-readonly) surveys the **entire existing corpus** — shipped
  (`fixtures/lesson-*.json` on `main` + prod Firestore) and in-dev (open `concept/*` branches + dev
  `brilliant-org-dev` Firestore via the Firebase MCP) — and writes the **Continuity Report**
  (`concepts/<slug>/continuity-report.md`): every conceptual overlap flagged and marked **dedupe** or a
  **retrieval / spaced-review / interleaving** opportunity (`inclusive-research-5`). Runs in parallel
  with the Source Miner.
- **Source Miner** (non-readonly) anchors the concept in the Green Book and assembles the verified,
  cited problem set (book problems + sourced look-alikes).
- **Curriculum Architect** produces the **Concept Brief**: the lesson list (order, prerequisites,
  one-line objective each) — **using the Continuity Report so it never re-teaches covered ground**, and
  folding overlaps into deliberate recall. Save to `concepts/<slug>/concept-brief.md` on the branch.
- Manager reviews the Concept Brief. If `/lesson-factory` was called with no argument, present the
  candidate backlog to the user and let them pick before continuing.

## 2. Per-lesson design (Dept 1 → Dept 2, looped) — PARALLEL across lessons

For each lesson (fan out — independent lessons proceed concurrently):

1. **Dept 1** writes the **Lesson Brief** (`concepts/<slug>/<lesson>/brief.md`): hook, core promise,
   cited problems + answers, beat-by-beat plan, misconceptions, assessment. (Architect skeleton, then
   Misconception ∥ Assessment, then synthesize.)
2. **Dept 2** writes the **Interaction Spec** (`concepts/<slug>/<lesson>/interaction-spec.md`): per
   beat, the mechanic, reuse-vs-new, build decomposition, feedback/hints, a11y, visual/motion, track.
3. **Loop** until the joint **Definition-of-Ready** holds for every beat (every beat has a
   verified+sourced problem AND a concrete interactive mechanic + feedback). Self-resolve; escalate
   unresolved conflicts to the Manager; the Manager escalates to the user only as a last resort.

## 3. Wave 0 — freeze shared contracts (Manager + Dept 3 Schema/Types) — SERIAL

Before any coder starts, collect every **new interaction type** the concept needs across all lessons
and freeze them once:

- Add the Zod variants to `src/content/schema.ts` and the dispatcher slots in
  `src/lesson/beats/index.tsx` (stubs OK).
- Freeze each new engine module's **interface** (signatures + types) in `src/engine/<topic>.ts`.
- Record the frozen contracts in `concepts/<slug>/wave0-contracts.md`.

This is the safeguard that lets lessons build in parallel without colliding on shared files. Commit
Wave 0 to the concept branch.

## 4. Build — PARALLEL across lessons, in isolated worktrees

For each lesson, create an isolated worktree **on its own branch** (you cannot check out
`concept/<slug>` in two worktrees at once — use `-b` to fork a per-lesson branch):

```bash
git worktree add -b lesson/<slug>-<lesson> ../lf-<slug>-<lesson> concept/<slug>
```

The Integrator later merges `lesson/<slug>-<lesson>` back into `concept/<slug>`. (Or launch a
`best-of-n-runner` subagent per lesson, which provisions its own worktree + branch.)

Inside each worktree, Dept 3 runs: Drafter → Brief Reviewer → **Coder A (engine+goldens) ∥ Coder B
(renderer+widget+fixture) ∥ Test Author** → Verification → Code Reviewer → Integrator. Each lesson
adds only **its own** files (engine module, renderer, fixture, tests) plus filling its Wave-0 slot —
never editing another lesson's files.

The **Integrator** merges each finished worktree back into `concept/<slug>` and removes the worktree
(`git worktree remove ...`). Resolve the rare shared-file conflict (dispatcher index) deterministically.

## 5. QA gate (per lesson) — see `qa-rubric.md`

Each lesson must pass the **two-stage fact-check** and all **9 Scorecard gates**. The Verification
Engineer runs the mechanized checks; Dept 1/Dept 2 critics confirm the judgment gates. Emit
`concepts/<slug>/<lesson>/scorecard.md`. A red gate loops back to the owning department.

## 5b. Interview Pack — Interview Studio — see `interview-packs.md`

Once the concept's lessons are built (engines available), the **Interview Studio** builds the concept's
capstone AI-interview pack, reusing those engines:

- **Interview Question Author** designs the tiered (`hard/harder/brutal`) synthesis questions +
  engine-backed templates; **Interview Prompt Engineer** writes the interviewer + generator prompts.
- A **Dept 3 Coder** builds the templates/parameterizer/fingerprinter; the **Verification Engineer**
  engine-verifies the **entire pre-loaded pool**; the **Integrator** writes `interviews/<courseId>.json`
  + `interviews/<courseId>.md`.
- Gate it with the **Interview Pack Scorecard** (`qa-rubric.md` / `interview-packs.md`). May run in
  parallel with per-lesson QA once the engines are frozen.

## 6. Test on dev + sign-off (Manager)

When **every** lesson's Scorecard is green **and the Interview Pack Scorecard is green**, the Manager
deploys the concept to the **dev project `brilliant-org-dev` (#836579828208)** and seeds its Firestore
(see `deploy.md` → Test deploy), then **Slack-DMs the user** the Scorecards + the **dev linked-domain
URL** + the **Interview Pack `.md`** to review. Production is untouched.

## 7. Approval → Ship (Manager) — see `deploy.md`

- **Changes requested** → route notes to the owning department; re-run the affected stage; re-QA;
  redeploy to dev; re-alert.
- **Approved** → merge `concept/<slug>` → `main`; seed the concept's course doc + lessons to **prod
  (`brilliant-org`)** and `vite build` + `firebase deploy --project brilliant-org`. The concept
  **auto-registers in the Concept Catalog** on seed (ADR-0004) — live at `/concept/<courseId>` (lessons
  at `/lesson/<lessonId>`), zero UI code. The Interview Pack is merged too but **not seeded/deployed**.
  Confirm in Slack with the production `/concept/<courseId>` link.

## Parallelism summary

- **Within a department:** all independent roles concurrently (Dept 1 misconception ∥ assessment;
  Dept 2's nine roles; Dept 3 Coder A ∥ Coder B ∥ Test Author).
- **Across lessons:** the concept's lessons flow as an assembly line — design lesson N+1 while lesson
  N is being coded; independent lessons fully parallel.
- **Serialization only at:** Wave-0 freeze, worktree merges, and the human approval gate.

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
interviews/<courseId>.json    # capstone Interview Pack (committed, NOT seeded/deployed)
interviews/<courseId>.md      # human-readable mirror
```
