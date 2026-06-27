---
name: lesson-factory
description: Runs the on-demand multi-agent "software factory" that builds new interactive lessons for the Ergo learning app, grounded in the Green Book (references/green-book.txt). Use when the user asks to build or generate lessons or a new concept/course, to "launch the lesson factory / software factory", or runs /lesson-factory. Orchestrates a Manager (Opus) over three departments (curriculum/learning-science, interactive-game design, coding) plus an Interview Studio, fact-checks every problem against the Green Book, checks the existing corpus for overlap, stages each concept on its own branch in a separate git worktree (this repo stays on `main`), smoke-tests it on a separate dev Firebase project (brilliant-org-dev), then automatically ships to production (merges to `main`, pushes, seeds + deploys) and Slack-DMs a one-time notification — a fully autonomous, hands-off process.
disable-model-invocation: true
---

# Lesson Factory

An on-demand assembly line that turns Green-Book quant concepts into fully-built, fact-checked,
interactive **lessons** for the Ergo app — smoke-tested on a **dev Firebase project** and then
**automatically shipped to production**, end-to-end with no human approval step. A top-level
**Manager (Opus)** spawns four persistent
**department leads**; each lead in turn spawns and manages its own worker subagents — a real nested
hierarchy, not a flat fan-out. At the end of each concept it also produces a capstone **Interview Pack** — the
engine-verified question pool consumed by the live "interview an AI quant interviewer" feature (`interview-packs.md`, ADR-0008).

> Vocabulary (the product's three layers, authoritative):
> - **Large concept / macro** = a `course` (`fixtures/course-*.json` → Firestore `courses/{id}`).
> - **Lesson** = `fixtures/lesson-<slug>.json` → Firestore `lessons/{id}`; an ordered list of beats.
> - **Beat** = one entry in `lesson.beats[]` — a single prompt → interaction → feedback.
>
> A **run builds one whole concept** (many lessons), then ships it **per concept** autonomously.

> Firebase projects:
> - **Dev / staging = `brilliant-org-dev` (#836579828208)** + its linked domain — the factory deploys
>   and seeds here freely as an automated **smoke test** before shipping. Not production.
> - **Production = `brilliant-org` (#801582458333)** — shipped to **automatically** once a concept passes QA + the dev smoke test.

## Invocation

- `/lesson-factory <concept or Green Book topic>` → build that whole concept end-to-end.
- `/lesson-factory` (no argument) → the Manager proposes a **Green-Book-grounded backlog** of
  candidate concepts and asks the user to pick.

## Non-negotiable rules (read first)

1. **Ground truth = the Green Book.** The book (`references/green-book.txt`, gitignored) decides
   what is legitimate to teach. **Every concept must be anchored to a Green-Book concept** (cite it).
2. **Anchor-and-source, never invent.** A problem is either a Green-Book problem **or** a similar
   quant-interview question found by searching, **with its source recorded**. No invented or
   unsourced problems, ever. (Runtime-generated interview questions are the one exception — allowed
   only when **grounded in real quant-style interview questions** *and* **engine-verified before
   serving**; see `interview-packs.md`, `docs/adr/0005-ai-interview-questions-grounded-and-engine-verified.md`, and `docs/adr/0008-ai-capstone-interview-realtime-grounded.md`. ADR-0008 governs the live feature: server-minted ephemeral token, `toClientPack` hidden-stripping loader, leak-guard contract, and per-user/session cost caps.)
3. **Two-stage fact-check on every number.** (1) the source states the answer; (2) the lesson's
   **engine independently reproduces it** and the `validate-fixtures` script cross-checks it. Both, or
   it doesn't ship. Interview-pack questions follow the same engine-verify rule. **Every lesson also
   carries a held-out transfer problem** (`heldOut:true`, `track:'B'`, `required:false`) — the **same
   method (`schemaId`)** as the mastery challenge on a **fresh surface** — engine-verified like any
   other number and placed **before** the mastery challenge; it is reserved for the Track-B delayed
   gold gate (spec-24) and is **never shown in normal lesson flow** on either track.
4. **Autonomous end-to-end ship.** The factory builds each concept on a per-concept branch **in a
   worktree outside this repo** (this checkout stays on `main`), runs an automated smoke test on the
   **dev project `brilliant-org-dev`**, then — with **no approval step** — merges to `main`, pushes
   `origin/main`, and seeds + deploys **`brilliant-org` (prod)**, finishing with a one-time Slack FYI.
   It still **hard-stops** (does not ship) on a genuine failure: a red QA gate, a broken dev smoke
   test, or a concept that can't be Green-Book-anchored (see Guardrails).
5. **Build by doing.** Every beat must be genuine direct-manipulation. Ambition is encouraged — cost
   is **not** a reason to reject a mechanic (the user said "get it done").
6. **Maximize parallelism** everywhere, made safe by a concept-level **Wave-0 contract freeze** +
   isolated **git worktrees** (see `pipeline.md`).
7. **Build on the existing corpus — never duplicate it.** Before planning, the Corpus Cartographer
   surveys **every** existing lesson — shipped (`main` + prod) and in-dev (`concept/*` branches +
   `brilliant-org-dev`). Don't re-teach covered ground; convert conceptual overlap into deliberate
   **retrieval practice, spaced review, and interleaving** (Continuity Report; `inclusive-research-5`).
8. **Surgical & simple per `AGENTS.md`.** Reuse the existing engine, schema, widget catalog, rubric,
   and research memos before building new.

## Org chart

```
                      Manager / Director  (Opus)  [root · only agent the user talks to]
            plans concept · Wave-0 · arbitrates · Scorecard · dev smoke test · auto-ships prod · Slack FYI
   ┌───────────────────┬────────────────────┬──────────────────────────┬───────────────────┐
Dept 1 Lead         Dept 2 Lead          Dept 3 Lead               Interview Studio Lead
Curriculum          Interactive Exp.     Coding [worktree per lesson]  (per concept)
[persistent]        [persistent]         [persistent]              [persistent]
    │                    │                    │                          │
5 workers           9 workers          role chain per lesson      Question Author
(Source Miner,      (Mechanic,         (Drafter→Reviewer→CdrA‖B   Prompt Engineer
 Cartographer,       Planner, …)        →Test→Verify→Review→       + coder/verify/integrate
 Architect, …)                          Integrate, 1 worktree each)
    │                    │
    └─── Manager mediates Dept1↔Dept2 design loop ──┘
         (resumes each lead; Dept 3 Lead owns Wave-0 freeze before per-lesson builds start)
```

Full rosters, responsibilities, and per-role model assignments: **`departments.md`**.

## Pipeline at a glance

1. **Plan** — Manager + Dept 1 anchor the concept to the Green Book, **survey the existing corpus for
   overlap (Continuity Report)**, and draft the **Concept Brief** (lesson list) + per-lesson **Lesson
   Briefs**.
2. **Design** — Dept 2 turns each Lesson Brief into an **Interaction Spec**; Dept1↔Dept2 loop until
   a joint **Definition-of-Ready** holds for every beat.
3. **Wave 0** — Manager freezes shared contracts (schema additions, engine interfaces, dispatcher
   slots, **`src/content/methods.ts` registry additions** for any new graded-beat `schemaId`) once, at
   concept level.
4. **Build** — Dept 3 implements every lesson in parallel (isolated worktrees): engine + schema +
   renderer/widget + fixture + tests.
5. **QA** — two-stage fact-check + the 9-gate **Scorecard** per lesson (`qa-rubric.md`).
6. **Interview Pack** — the **Interview Studio** builds the concept's capstone AI-interview pack
   (pre-loaded engine-verified question pool + interviewer & generator prompts), QA'd by its own
   concept-level Scorecard (`interview-packs.md`).
7. **Smoke-test on dev** — when the whole concept is green, the Manager deploys it to
   **`brilliant-org-dev`** (+ seeds the dev Firestore) from the `../lf-<slug>` worktree as an automated
   smoke test and verifies it renders (`deploy.md`).
8. **Auto-ship** — on a green smoke test the Manager **automatically** merges the concept branch →
   `main`, pushes `origin/main`, and seeds + deploys to **prod (`brilliant-org`)**, then **Slack-DMs the
   user a one-time FYI** with the prod link + Scorecards + Interview Pack `.md` link. The Interview Pack
   rides along committed and **is bundled into the live Functions runtime** by the `firebase.json`
   predeploy hook (`scripts/copy-interview-packs.mjs`) when functions deploy.

Step-by-step orchestration (with parallelism and worktrees): **`pipeline.md`**.
Artifact templates (Concept Brief, Continuity Report, Lesson Brief, Interaction Spec, Implementation
Brief, Scorecard): **`artifacts.md`**. QA gates + Definition-of-Done: **`qa-rubric.md`**. Staging, dev
deploy, seed, prod ship, Slack: **`deploy.md`**. Capstone AI-interview assets (live feature — ADR-0008):
**`interview-packs.md`**.

## Model routing (per `.cursor/rules/model-routing.mdc`; nested-department architecture: ADR-0007)

| Work | Model | Notes |
|---|---|---|
| Manager / Director, arbitration, Scorecard sign-off | `claude-opus-4-8-thinking-max-fast` | the brain |
| **Department Lead (×4)** — Dept 1, Dept 2, Dept 3, Interview Studio | `claude-opus-4-8-thinking-max-fast` | **non-readonly** (must spawn workers via Task tool); persistent/resumable across stages |
| Dept 1 & Dept 2 workers (research / planning / design = reasoning) | `claude-opus-4-8-thinking-max-fast` | readonly **except** the Source Miner + Corpus Cartographer |
| **Source Miner** (web + `references/`) & **Corpus Cartographer** (Firebase MCP + git) | Opus, **non-readonly** | readonly subagents have no internet/MCP |
| Dept 3 coders, schema/types, test author, brief drafter | `claude-4.6-sonnet-high-thinking` | code writing/editing |
| Dept 3 brief reviewer, verification, code reviewer | `claude-opus-4-8-thinking-max-fast` | review/reasoning |
| Interview Studio (Question Author, Prompt Engineer) | `claude-opus-4-8-thinking-max-fast` | reuses Dept 3 for templates/engine-verify |
| Integrator/push, `validate`/seed/deploy (dev+prod) runs | `composer-2.5-fast` | mechanical IO |

The skill's main agent **is** the **Manager** — the root orchestrator and the only agent that talks
to the user. It spawns four persistent **department leads**, which in turn spawn and manage their own
ephemeral workers and synthesize one department-level result each. This nested orchestration
intentionally **overrides** the global flat pattern in `.cursor/rules/model-routing.mdc` / the
model-routing skill for lesson-factory specifically (those files stay unchanged). The Manager's
first-run **preflight probe** hard-requires nested spawning to the needed depth — if any level cannot
spawn its child, the skill **hard-stops** and tells the user it cannot run in this environment (see
`pipeline.md` / `deploy.md`).

## Environment / prerequisites

- **`references/green-book.txt`** — the grep-searchable Green Book (gitignored). Required ground truth.
- **Firebase projects** — dev `brilliant-org-dev` (#836579828208, test/staging) and prod
  `brilliant-org` (#801582458333, auto-shipped after the dev smoke test). Selected per command via `--project` /
  `GOOGLE_CLOUD_PROJECT` (`deploy.md`).
- **Concept Catalog (macro home is LIVE — ADR-0004)** — a concept **auto-registers** when its
  `course-<slug>.json` is seeded; deep links `/concept/<courseId>` + `/lesson/<lessonId>`. A **live**
  concept MUST emit `chapters[]` covering every built lessonId (else its lessons render invisible) plus
  the catalog card (domain/order/status/tagline/accent/vizKey). Emit-contract: `artifacts.md` / `deploy.md`.
- **`.env.dev`** (gitignored) — dev build config (`VITE_USE_EMULATORS=false`, `VITE_INCLUDE_DEV_ROUTES=1`,
  `brilliant-org-dev` web config). **Auto-generated by the skill's first-run setup** (`deploy.md`) — not
  a manual step. Dev `/dev/lesson/:id` review is enabled; the dev URL is auto-resolved at deploy.
- **`interviews/<courseId>.json` + `.md`** (committed) — the per-concept Interview Pack. The JSON
  is bundled into the live Functions runtime at deploy time via the `firebase.json` predeploy hook
  (`scripts/copy-interview-packs.mjs`); it is consumed by `functions/src/interview.ts` via `loadPack`
  (which strips a leading `course-` from the conceptId to form `course-<slug>.json`). Not seeded to
  Firestore; the Zod schema lives at `src/content/interviewPack.ts` (`interview-packs.md`, ADR-0008).
- **Slack** — alerts via the `user-slack` MCP, `slack_send_message` to `channel_id` = the user's
  `user_id` (`U0B9VC0TJBH`); chat echo as fallback.
- **`.env.factory`** (gitignored) — optional factory config (e.g. Slack target override).
- Reuse docs: `docs/beat-audit-rubric.md`, `docs/core_instructions.md`, `docs/mvp_prd.md`,
  `docs/ui_design_system.md`, `docs/proposed-lessons.md`, `docs/interactive-mechanics-backlog.md`,
  and the research memos in `audits/ideation/inclusive-research-*.md`.
- **Repo gotchas (`HANDOFF.md`) — obey:** do **not** use `npm run` (call `./node_modules/.bin/*`
  binaries directly); use the **`firebase` shell alias** (it pins Node to **v24.3.0**, which
  firebase-tools needs); **Java-dependent emulator/seed/rules steps are user-run** (the factory uses
  the dev/prod Admin-SDK seed + hosting deploys, which need no Java). Exact commands live in
  `qa-rubric.md` and `deploy.md`.

## Guardrails

- **This repo stays on `main`.** Never `git switch` this checkout; create the concept branch and all
  per-lesson branches in **worktrees outside the repo** (`../lf-<slug>…`). Ship by merging the concept
  branch into `main` from this always-on-`main` checkout.
- **Smoke-test on `brilliant-org-dev` first; only ship to prod `brilliant-org` after that smoke test passes.**
- Ship autonomously, but **never ship broken work**: a red QA gate, a failed dev smoke test, or an
  unanchored concept hard-stops the run and is escalated to the user instead of shipped.
- Never re-teach a concept the corpus already covers — turn the overlap into recall (rule 7).
- The Interview Pack is **committed and bundled into the live Functions runtime** when functions deploy
  (predeploy hook). It is not seeded to Firestore. Deploying only `--only hosting,firestore` skips
  the predeploy hook and does not update the live interview runtime (`interview-packs.md`, ADR-0008).
- **Functions deploy is secret-gated.** Never deploy the interview Functions without the
  `OPENAI_API_KEY` secret set on the target project — hard-check it first
  (`firebase functions:secrets:access OPENAI_API_KEY --project <p>`); if absent, deploy
  `--only hosting,firestore` and flag functions-deploy + secret-set as a remaining human step
  (matches HANDOFF.md). The preflight rule lives in `pipeline.md` step-0 and `deploy.md`.
- Keep the KMP/probability engine and any new engine **pure, dependency-free, exact** (no floats).
- If a concept can't be Green-Book-anchored, or a beat genuinely resists being made interactive
  after honest attempts, the Manager escalates to the user — it does not fabricate or ship.
