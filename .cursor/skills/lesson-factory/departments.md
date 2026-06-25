# Departments & Roles

Every role is a subagent. Roles within a department run **in parallel** wherever there's no data
dependency. Models follow `SKILL.md` → Model routing. Pass each subagent full context (they don't
see the conversation): the relevant brief/spec, the ground-truth rules, and the target files.

---

## Manager / Director — Opus

The brain and the only role that talks to the user. Responsibilities:

- Anchor the run to a Green-Book concept; produce/curate the **Concept Brief** (lesson list).
- Plan the run, spawn departments, and keep the **assembly line** full (multiple lessons in flight).
- Run the **Wave-0 contract freeze** (see `pipeline.md`) before any coder starts.
- **Arbitrate escalations** the departments can't self-resolve. Escalate to the **user only** if the
  Manager itself cannot resolve a genuine scope/product call.
- Own the **Scorecard sign-off** (`qa-rubric.md`): a concept is "ready" only when every lesson is green.
- **Slack-DM the user** with Scorecards + preview URL; handle the approval reply; run the deploy.

---

## Department 1 — Curriculum / Learning Science (5 roles)

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
   Continuity Report so it never re-teaches what the corpus already covers.** Leans on `docs/mvp_prd.md`,
   `docs/core_instructions.md`, `docs/proposed-lessons.md`, `docs/beat-audit-rubric.md`.
3. **Misconception Specialist** — *Opus readonly*. Inventories the specific wrong mental models to
   elicit + refute per beat; specifies per-option (refutational) feedback. Leans on
   `audits/ideation/inclusive-research-2-prerequisites-misconceptions.md`.
4. **Assessment Designer** — *Opus readonly*. Designs graded beats: retrieval opener, guaranteed
   early win, the end-of-lesson mastery challenge, spacing/interleaving, the mastery signal — and
   **turns every Continuity-Report overlap into a concrete recall/interleaving beat**. Leans on
   `audits/ideation/inclusive-research-5-progression-assessment.md` and the `validate-fixtures` gates.
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

Turns each Lesson Brief into an **Interaction Spec** (template in `artifacts.md`). Design only — no
production code. All nine fan out **in parallel** per lesson/beat; some fire only when relevant.
Models: **Opus** (design + critique is reasoning); read the codebase catalog + docs as needed.

1. **Game / Mechanic Designer** — turns each problem into a playable mechanic: the core loop + the
   "wow" moment.
2. **Interaction Designer** — formalizes each mechanic into a concrete beat: manipulate → instant
   response → feedback; names an existing interaction type or a new one.
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
   interactive beat. Consumes Dept 1's misconception inventory.
9. **Two-Track / Scaffolding Designer** — Track A/B density, just-in-time primers, faded worked
   examples (the product's inclusivity spine).

**Dept1↔Dept2 loop:** Dept 2 reviews the Brief; any beat that lacks a verified+sourced problem or a
genuine interactive mechanic kicks back to Dept 1 (reframe / reselect / re-sequence). Loop until the
joint **Definition-of-Ready** holds for every beat. Self-resolving; unresolved conflicts → Manager.

---

## Department 3 — Coding / Implementation (rich roster)

Implements every lesson. Coders work in **isolated git worktrees** against the Wave-0-frozen
contract. Order within a lesson: Drafter → Brief Reviewer → Schema/Types → (Coder A ∥ Coder B ∥ Test
Author) → Verification → Code Reviewer → Integrator/Pusher. Lessons run in parallel across the
assembly line.

1. **Feature-Brief Drafter** — *Sonnet*. Turns the Interaction Spec into an **Implementation Brief**
   (template in `artifacts.md`): exact files, contracts, and the parallel work split.
2. **Brief Reviewer** — *Opus*. Signs off the Implementation Brief before any code is written.
3. **Schema / Types Specialist** — *Sonnet*. Owns Zod schema additions (`src/content/schema.ts`) +
   TypeScript types + the beat dispatcher slot (`src/lesson/beats/index.tsx`). Part of Wave 0.
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
9. **Integrator / Pusher** — *composer (fast)*. Merges the worktree into the concept branch and
   pushes the branch.

> The two coders never edit the same shared file at once: the Schema/Types Specialist freezes the
> contract in **Wave 0**, then Coder A owns the engine and Coder B owns the renderer/fixture.
