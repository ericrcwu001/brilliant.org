# Departments & Roles

Each department is a **persistent department-lead subagent** (Opus, non-readonly) that spawns and
manages its worker roles. The Manager spawns the four leads; each lead spawns its workers. Workers
within a department still run **in parallel** wherever there's no data dependency. Models follow
`SKILL.md` → Model routing. Pass each subagent full context (they don't see the conversation): the
relevant brief/spec, the ground-truth rules, and the target files.

> **Every Dept 1, Dept 2, and Interview Studio worker builds to `learning-science.md`** — the mandatory
> per-lesson + per-concept translation of the brainlift into the shipped LS specs (spec-00…spec-24).
> Pass it to each design/assessment worker as context. The role notes below call out who owns which §.

---

## Manager / Director — Opus

The brain and the only role that talks to the user. Responsibilities:

- Anchor the run to a Green-Book concept; produce/curate the **Concept Brief** (lesson list).
- Plan the run, spawn departments, and keep the **assembly line** full (multiple lessons in flight).
- Run the **Wave-0 contract freeze** (see `pipeline.md`) before any coder starts.
- **Arbitrate escalations** the departments can't self-resolve. Escalate to the **user only** if the
  Manager itself cannot resolve a genuine scope/product call.
- Own the **Scorecard sign-off** (`qa-rubric.md`): a concept is "ready" only when every lesson is green.
- Run the **dev smoke test**, then **auto-ship** the concept to prod (merge → `main`, push, seed,
  deploy) with no approval step, and **Slack-DM the user a one-time FYI** once it's live.

---

## Department 1 — Curriculum / Learning Science (5 roles)

**Lead — Opus, persistent, non-readonly:** Spawned once by the Manager; resumed across pipeline
stages. Spawns and manages the five worker roles listed below, drives the internal flow,
reads/writes `concepts/<slug>/` artifacts, synthesizes the Lesson Brief for each lesson, and
escalates unresolved issues to the Manager.

Produces the **Lesson Brief** per lesson (template in `artifacts.md`). Every problem/number cited.

Internal flow: **Corpus Cartographer ∥ Source Miner first** (survey the existing corpus + assemble
verified problems — no inputs → no design) → **Curriculum Architect** lays the skeleton (using both,
so it never re-teaches covered ground) → **Misconception Specialist ∥ Assessment Designer** enrich in
parallel (Assessment turns overlap into retrieval/interleaving) → synthesis pass merges everything
into the Lesson Brief.

1. **Source Miner / Fact-checker** — *Opus, non-readonly (needs web + `references/`)*.
   Greps `references/green-book.txt` to **anchor the concept** (cite chapter/section/page). For each
   problem, either pulls it from the book **or** searches the web for a similar quant-interview
   question and records its source + the stated answer. Rejects anything unsourceable. Owns the
   **anchor-and-source gate**.
2. **Curriculum Architect** — *Opus readonly*. Designs the concept theme + lesson list (order,
   prerequisites) and each lesson's objectives + **Bet→Explore→Model→Prove** skeleton. **Reads the
   Continuity Report so it never re-teaches what the corpus already covers.** **Owns the
   expertise-reversal boundary conditions (`learning-science.md` §2.8/§4):** a **thin worked-example
   on-ramp** for genuine first contact, **block briefly to seed each schema then interleave**, **fade
   fast** (`density:'split'`→`'merged'`), and flag **speed primitives** to be **overlearned to
   automaticity** (the one place smoothness is the goal). Also specifies the concept's **catalog card**
   (domain/order/status/tagline/accent/vizKey) and **`chapters[]` covering every built lesson** so it
   auto-registers + renders in the Concept Catalog (ADR-0004; emit-contract in `artifacts.md`). Leans on
   `docs/mvp_prd.md`, `docs/core_instructions.md`, `docs/proposed-lessons.md`, `docs/beat-audit-rubric.md`.
3. **Misconception Specialist** — *Opus readonly*. Inventories the specific wrong mental models to
   elicit + refute per beat; specifies per-option (refutational) feedback. **Owns feedback discipline
   (`learning-science.md` §2.9):** feedback targets the **task/process and the next fix**, never the
   person — **no verdict-on-the-learner anywhere** (ADR-0010 removed the hire signal). **Also supplies
   the which-method gate's foils:** for each gate, name the wrong mental model behind each
   `CONFUSABLE[correct]` distractor so the `byOption` copy refutes a *real* near-miss method, not a
   strawman. Leans on `audits/ideation/inclusive-research-2-prerequisites-misconceptions.md`.
4. **Assessment Designer** — *Opus readonly*. **Owns most of the per-lesson learning-science contract
   (`learning-science.md` §2).** Designs graded beats: a **cold retrieval opener** (not a primer; gate
   the worked solution behind a real attempt — §2.5), guaranteed early win, the end-of-lesson mastery
   challenge, spacing/interleaving, the mastery signal — and **turns every Continuity-Report overlap
   into a concrete recall/interleaving beat**, including ≥1 **"same method, different costume"
   comparison** (`retrievalGrid`/compare) that pairs two surfaces sharing one `schemaId` (§2.7).
   Specifically:
   - **`schemaId` on every graded beat** (Foundation B / spec-00) at brief time — the hidden
     deep-structure method tag, surface labels stripped; if no existing id fits, proposes a registry
     addition (see the Schema/Types Specialist).
   - **A which-method discrimination gate** (spec-13 / §2.2): a **graded `prediction` with the `gate`
     block** (`kind:'which-method'`, `correct` == the beat's `schemaId`, `optionMethods` drawn from
     `CONFUSABLE[correct]`), on a label-stripped prompt. **Never `patternPick`** (ungraded, no
     `byOption`); never the exempt opening bet.
   - **≥1 cold graded checkpoint** that confidence rides on (mastery challenge and/or the gate) so
     spec-02 confidence + spec-12 calibration have somewhere to land (§2.4); keep the qualitative
     opening bet a plain ungraded `prediction` (no `gate`). Design feedback to **reward correctly-low
     confidence on hard items**, not bravado.
   - **The held-out transfer problem** (fresh surface, **same `schemaId`** as the mastery challenge,
     engine-verified, `heldOut:true track:'B' required:false`, placed **before** the mastery challenge)
     for the Track-B delayed gold gate (spec-24 / §2.3).
   - **Difficulty-band readiness** (spec-21 / §2.6): every capped graded beat carries an **assist /
     `hintCapOverride` path** (so the governor never dead-ends a struggling novice — foolproofing R6)
     and a sensible **`density`** flag; author for productive struggle (~50–85% success), never floor
     below ~50%.
   Leans on `audits/ideation/inclusive-research-5-progression-assessment.md` and the
   `validate-fixtures` gates.
5. **Corpus Cartographer / Continuity Auditor** — *Opus, non-readonly (Firebase MCP + git)*. Maps the
   **entire existing lesson corpus** — shipped (`fixtures/lesson-*.json` on `main` + prod
   `brilliant-org` Firestore) and in-dev (open `concept/*` branches + dev `brilliant-org-dev` Firestore,
   via the Firebase MCP `firestore_query_collection` on `lessons`/`courses`). Detects conceptual
   overlap with the planned concept and writes the **Continuity Report** (`artifacts.md`): for each
   overlap, either **dedupe** (don't re-teach; reference instead) or a **retrieval / spaced-review /
   interleaving** opportunity (`inclusive-research-5`). Feeds the Architect (no redundant lessons) and
   the Assessment Designer (wires the recall beats).

---

## Department 2 — Interactive Experience / Design (9 roles)

**Lead — Opus, persistent, non-readonly:** Spawned once by the Manager; resumed across pipeline
stages. Spawns and manages the nine worker roles listed below, drives the internal flow,
reads/writes `concepts/<slug>/` artifacts, synthesizes the Interaction Spec for each lesson, and
escalates unresolved issues to the Manager.

Turns each Lesson Brief into an **Interaction Spec** (template in `artifacts.md`). Design only — no
production code. All nine fan out **in parallel** per lesson/beat; some fire only when relevant.
Models: **Opus** (design + critique is reasoning); read the codebase catalog + docs as needed.

1. **Game / Mechanic Designer** — turns each problem into a playable mechanic: the core loop + the
   "wow" moment.
2. **Interaction Designer** — formalizes each mechanic into a concrete beat: manipulate → instant
   response → feedback; names an existing interaction type or a new one. **Realizes the which-method
   gate as a graded `prediction.gate` beat** (never `patternPick`) and the **"same method, different
   costume" comparison** as a `retrievalGrid`/compare beat (`learning-science.md` §2.2/§2.7) — making
   method *selection* and schema *abstraction* the graded acts, not just execution.
3. **Catalog / Reuse Auditor** — maps every proposal to the current Zod schema + widget catalog
   (`src/content/schema.ts`, `src/lesson/beats/`, `src/lesson/konva/`); maximizes reuse; flags
   genuinely-new interaction types. Also reads `docs/interactive-mechanics-backlog.md`.
4. **Technical Planner / Build-Decomposer** — decomposes ambitious mechanics into a concrete build
   plan for Dept 3 (engine module, schema type, renderer, widget, fixture, tests). **Never vetoes
   for cost** — its job is to make ambition buildable.
5. **Pedagogy-Fit Critic** — verifies the manipulation *embodies* the target idea (interaction fit),
   not decorative; keeps every beat genuinely learn-by-doing.
6. **Visual & Motion Designer** — hero "watch it resolve" visual, motion + reduced-motion, design
   tokens (`docs/ui_design_system.md`, the widget-load rules in `docs/proposed-lessons.md §2.8`).
7. **Accessibility & Mobile Specialist** — 44px tap-only, reduced-motion, `aria-live` mirrors,
   keyboard/screen-reader.
8. **Feedback & Hint-Ladder Designer** — per-mistake feedback + the 3-level hint ladder for each
   interactive beat. Consumes Dept 1's misconception inventory. **Feedback is feed-forward and
   task-level** ("next fix"), never a verdict-on-the-learner (`learning-science.md` §2.9). **Owns the
   assist path so capped beats never dead-end** (foolproofing R6 / spec-21): every capped graded beat
   gets `hintCapOverride` (reveal stays reachable) and/or an `assist` re-prefill, so when the difficulty
   governor lowers scaffolding a struggling learner still has a way through.
9. **Two-Track / Scaffolding Designer** — Track A/B density, just-in-time primers, faded worked
   examples (the product's inclusivity spine). **Owns worked-example/concreteness fading + the
   desirable-difficulty knobs (`learning-science.md` §2.6/§2.8):** set each beat's **`density`**
   (`'split'` scaffolded ↔ `'merged'` dense), keep a **thin worked-example on-ramp** for first contact
   then **fade fast**, and ensure the quant-intensity governor has scaffolding to fade without breaking
   Track A (static). Flag **speed primitives** as overlearn-to-automaticity (smoothness is the goal only
   there).

**Dept1↔Dept2 loop:** Dept 2 reviews the Brief; any beat that lacks a verified+sourced problem or a
genuine interactive mechanic kicks back to Dept 1 (reframe / reselect / re-sequence). Loop until the
joint **Definition-of-Ready** holds for every beat. Self-resolving; unresolved conflicts → Manager.

---

## Department 3 — Coding / Implementation (rich roster)

**Lead — Opus, persistent, non-readonly:** Spawned once by the Manager; resumed across pipeline
stages. Owns the **Wave-0 contract freeze** (via its Schema/Types worker) before any per-lesson
build starts. Then, for each lesson, provisions a git worktree and spawns that lesson's full role
chain directly (Drafter → Brief Reviewer → Coder A ∥ Coder B ∥ Test Author → Verification → Code
Reviewer → Integrator). Processes lessons in bounded waves (assembly line) to keep concurrent
workers and worktrees manageable. Coordinates merging each lesson's worktree back into the concept
branch and escalates to the Manager.

Implements every lesson. Coders work in **isolated git worktrees** (one per lesson, provisioned by the Lead) against the
Wave-0-frozen contract. Order within a lesson: Drafter → Brief Reviewer → Schema/Types → (Coder A
∥ Coder B ∥ Test Author) → Verification → Code Reviewer → Integrator/Pusher. Lessons run in
parallel across the assembly line.

1. **Feature-Brief Drafter** — *Sonnet*. Turns the Interaction Spec into an **Implementation Brief**
   (template in `artifacts.md`): exact files, contracts, and the parallel work split.
2. **Brief Reviewer** — *Opus*. Signs off the Implementation Brief before any code is written.
3. **Schema / Types Specialist** — *Sonnet*. Owns Zod schema additions (`src/content/schema.ts`) +
   TypeScript types + the beat dispatcher slot (`src/lesson/beats/index.tsx`). **Also owns
   `src/content/methods.ts` method-registry additions during the Wave-0 freeze** (Foundation B /
   spec-00): when the Assessment Designer needs a `schemaId` no existing id covers, review and add the
   new id (`id`, `name`, `domains`, plus its symmetric `CONFUSABLE` neighbours) here with the schema
   freeze — ids are persisted on review cards, so they are permanent; never an ad-hoc string on a beat.
   Part of Wave 0.
4. **Coder A** — *Sonnet*. The pure verifying **engine module** (`src/engine/<topic>.ts`) — exact
   rational arithmetic, no floats — plus its golden tests.
5. **Coder B** — *Sonnet*. The **beat renderer / widget** (`src/lesson/beats/`, `src/lesson/konva/`
   or DOM) + the **fixture JSON** + feedback/hints wiring + dispatcher entry.
6. **Test Author** — *Sonnet*. Engine goldens, renderer unit tests, and the lesson e2e flow
   (`e2e/*.spec.ts`).
7. **Verification Engineer** — *Opus*. Runs `validate-fixtures`, vitest, build, lint, and e2e (exact
   binaries in `qa-rubric.md`), **plus the engine-vs-source numeric cross-check**; bounces failures
   back to the coders until green.
8. **Code Reviewer** — *Opus*. Reviews the diff for correctness, surgical-ness (`AGENTS.md`), and
   style/design-system match.
9. **Integrator** — *composer (fast)*. Merges the lesson worktree back into the concept branch
   (`concept/<slug>`) and removes the worktree. No remote push here — the single `git push origin main`
   happens once, at ship.

> The two coders never edit the same shared file at once: the Schema/Types Specialist freezes the
> contract in **Wave 0**, then Coder A owns the engine and Coder B owns the renderer/fixture.

---

## Interview Studio — per concept, after the lessons are built

**Lead — Opus, persistent, non-readonly:** Spawned by the Manager after Dept 3 finishes the
lessons. Spawns and manages the roles listed below — including its own coder, verification, and
integrator workers (it cannot reach into Dept 3's subtree; it spawns the same worker types
independently). Synthesizes the Interview Pack and escalates to the Manager.

Produces the concept's **Interview Pack** (full spec in `interview-packs.md`): a large pre-loaded,
engine-verified bank of HARD interview questions + an interviewer prompt + a generator prompt for
non-overlapping runtime top-ups. Reuses the concept's freshly-built engines. Runs after Dept 3 finishes
the lessons.

1. **Interview Question Author** — *Opus, non-readonly*. Designs the tiered (`hard/harder/brutal`)
   synthesis questions + engine-backed templates (anchored+sourced), each question's hidden record
   (answer, approaches, wrong turns, hint ladder, rubric), and follow-up chains. **Brutal-by-default for
   the quant-intensity audience** (floor = `hard`, always harder than any lesson's mastery challenge;
   synthesis across the whole concept) with a **tier-aware `hidden.rubric`** so a brutal question is not
   graded by the hard rubric (`learning-science.md` §3, spec-22). Captures per-question confidence so
   the report can score calibration.
2. **Interview Prompt Engineer** — *Opus*. Writes the per-concept interviewer system-prompt template and
   the generator prompt (engine-verify-before-serve + avoid-list constraints). **The interviewer scales
   expectations to the question's tier and the report feeds forward (`learning-science.md` §3,
   spec-23/ADR-0010): five dimensions as "next fix" cards + a predicted-vs-measured calibration delta +
   a one-sentence `pressureNote` framing the result as under-pressure retrieval — never a
   Strong-No→Strong-Yes verdict or any person-level score.**
3. **Coder / Verification / Integrator** — spawned by this lead (same worker types as Dept 3, not
   shared). A Coder builds the templates/parameterizer/fingerprinter (on the concept's engine); the
   Verification Engineer engine-verifies the entire pre-loaded pool; the Integrator writes
   `interviews/<courseId>.json` + `.md`.
