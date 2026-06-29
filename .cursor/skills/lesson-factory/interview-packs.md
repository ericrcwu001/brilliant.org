# Interview Packs (capstone AI quant interview — BUILT + committed, ADR-0008)

At the end of each **macro concept (course)** the factory produces an **Interview Pack**: a large,
engine-verified bank of HARD quant-interview questions + an AI **interviewer prompt** + a **generator
prompt** for unlimited fresh, non-overlapping questions. The "interview an AI quant interviewer"
feature is **built and committed on `main`** (ADR-0008): the Functions runtime
(`functions/src/interview.ts`), the Zod schema (`src/content/interviewPack.ts`), the question-draw +
seen-set seam (`functions/src/interviewDraw.ts`), and the leak-guard all exist. The pack is consumed by
`functions/src/interview.ts` via `loadPack` (`loadPack` strips a leading `course-` from the conceptId so
the filename is always `course-<slug>.json`). It goes **live for a project only when functions are
deployed there with the `OPENAI_API_KEY` secret set** — a secret-gated step the factory performs
autonomously **only** when that precondition holds, and otherwise flags as a remaining human step (see
`deploy.md`; HANDOFF.md lists the prod functions-deploy + secret-set as user-run remaining). Do not
assume it is already deployed/active on any given project. Decision records:
`docs/adr/0005-ai-interview-questions-grounded-and-engine-verified.md` and
`docs/adr/0008-ai-capstone-interview-realtime-grounded.md` (both ADR status lines predate the build and
read "feature not yet built"; the code has since landed on `main`, but deploying it with the secret is
what activates it).

## What's produced (per concept)

`interviews/<courseId>.json` (canonical, versioned) + `interviews/<courseId>.md` (human-readable
mirror). Committed on `main` with the concept; **not seeded to Firestore** — `scripts/seed-firestore.ts`
globs **only** `fixtures/course-*.json` and then reads each course's lessons by **explicit node id**
(`courses/{id}` + `lessons/{id}`); it never globs `lesson-*.json`, and nothing under `interviews/` is
ever seeded. **Bundled into the deployed Functions runtime** at deploy time via the `firebase.json`
predeploy hook (`scripts/copy-interview-packs.mjs`) — i.e. it reaches a project's Functions runtime only
on a `--only … functions` deploy there (which is itself secret-gated; see `deploy.md`). The Zod schema
already exists at `src/content/interviewPack.ts`; use it — do not define a separate schema.

Contents:
1. **Pre-loaded question pool** (large), built two ways:
   - **Engine-backed templates** (≈5–10): each a parameterized form **derived from a real quant-interview
     question**, whose answer the concept's pure engine computes; expanded into many **verified
     parameterizations**.
   - A few **free-form showcase** hard questions (also real-quant-style + engine-verified).
   Target **≈50+ ready questions**, all engine-verified and de-duplicated.
2. **Interviewer prompt template** (one per concept).
3. **Generator prompt** (runtime top-ups under the real-quant-style + engine-verify + avoid-list rules).
4. Per-question **fingerprint** for de-dup.

## Top-level pack shape (authoritative schema: `src/content/interviewPack.ts`)

```jsonc
{
  "version": 1,                      // z.literal(1)
  "kind": "interview-pack",
  "courseId": "course-<slug>",
  "concept": "<Human-readable concept name>",
  "greenBookAnchor": "<GB chapter/section cite>",
  "engineModule": "src/engine/<topic>.ts",
  "generator": "<generator identifier>",
  "note": "<any authoring note>",
  "counts": {
    "total": 50,
    "byTier": { "hard": 20, "harder": 20, "brutal": 10 },
    "templated": 40,
    "freeForm": 10
  },
  "interviewerPrompt": "...",         // server-only; stripped by toClientPack()
  "generatorPrompt": "...",           // server-only; stripped by toClientPack()
  "templates": [
    { "id": "...", "title": "...", "source": "...", "description": "...", "engineModule": "..." }
  ],
  "questions": [ /* see Per-question record below */ ]
}
```

## Grounding & verification (the iron rule, incl. the runtime carve-out — ADR-0005)

- **Real quant-style (ALWAYS).** Every question — pre-loaded *or* runtime-generated — must be a
  **realistic quant-interview question**, anchored to the concept's Green-Book topic and the real
  quant-interview canon (`audits/ideation/agent-1-quant-canon.md`). It must read like something actually
  asked on a quant desk — **never an arbitrary engine-solvable puzzle** that merely happens to verify.
- **Anchor-and-source:** the concept is Green-Book-anchored; each seed/showcase question is sourced (a
  Green-Book problem or a sourced real quant-interview question).
- **Engine-verify-before-serve:** every question's answer is reproduced by the concept's pure engine.
  Templates are inherently verifiable; free-form questions are kept only if the engine verifies them.
  The **generator prompt instructs the live interview runtime to run the engine and reject any question it
  cannot verify** before showing it to a student.
- **Difficulty:** tiered `hard | harder | brutal` (floor = hard, always harder than any lesson's
  mastery challenge); **synthesis across the whole concept**; each question carries a **follow-up chain**.

> Runtime generation is the **single exception** to the factory's "never invent" rule — and it is fenced
> by *both* real-quant-style grounding *and* engine-verify-before-serve (ADR-0005). Neither is optional.

## Pressure, tier-aware grading & feed-forward (learning science — `learning-science.md` §3)

The capstone is where the brainlift's **stress-inoculation** (SPOV 3) and **feed-forward** (SPOV 4) live.
The pack and its prompts must encode all of:

- **Brutal-by-default for the quant-intensity audience** (spec-22 / D9): the live mint floors the tier at
  `hard` for Track A and **`brutal` for the quant-intensity gate** (Track B `OR`
  `learningGoal==='interview'`). A single brutal mock outcome should weigh more than any number of smooth
  in-app wins (brainlift I11) — train under representative pressure *after* the concept is encoded.
- **Tier-aware grading (a correctness fix, all tracks — spec-22):** each `hidden.rubric` and the
  interviewer prompt **scale expectations to the question's tier** — a `brutal` question must not be
  graded by the `hard` rubric (which deflates the score). The grader emits a `tier`.
- **Feed-forward report, NO person-verdict (spec-23 / ADR-0010):** the report is five dimensions as
  **"next fix" cards** + a **predicted-vs-measured calibration delta** + a one-sentence **`pressureNote`**
  framing the result as *under-pressure retrieval*. **There is no Strong-No→Strong-Yes hire signal and no
  person-level score anywhere** — the hire signal was removed entirely. Person-level verdicts are the
  weakest, most-often-harmful feedback type (Kluger & DeNisi; Hattie & Timperley).
- **Calibration is captured + celebrated:** the interview captures **per-question confidence**
  (`Turn.confidence`), the grader returns a Brier/overconfidence **calibration** block (spec-12), and the
  report rewards **correctly-low confidence on hard items** — the trader's core skill (bet sizing).
- **Arousal reappraisal** (boundary §4.4): the `pressureNote` + interviewer tone reframe arousal as
  readiness, never shame. *(The pre-interview expressive-writing worry-dump is a real technique but is
  not yet spec'd as app machinery — express it as report/interviewer copy only, not new infra;
  `learning-science.md` §5.)*

## Per-question record (in the JSON)

```jsonc
{
  "id": "...",
  "tier": "hard|harder|brutal",
  "fingerprint": "<templateId>:<normalized-params>  |  sem:<hash>",   // for de-dup
  "template": { "id": "...", "params": { ... } },                      // omitted for free-form
  "prompt": "the question shown to the candidate",
  "source": "Green Book p.<n> §<x>  |  <real quant-interview source> (GB-anchored to §<x>)",
  // engineCheck is REQUIRED by InterviewPackSchema and ALL four fields are required
  // (src/content/interviewPack.ts → QuestionSchema.engineCheck): module, calls, answer,
  // verified. `calls` is the (non-empty) list of engine calls the verifier ran to
  // reproduce `answer` — omitting it fails the schema (and validate-interview-packs.ts).
  "engineCheck": {
    "module": "src/engine/<topic>.ts",
    "calls": ["expectedValue(DIE)"],   // string[] — the engine call(s) that reproduce `answer`
    "answer": "<exact>",
    "verified": true
  },
  "hidden": {                                  // NEVER shown verbatim to the candidate
    "answer": "<exact>",
    "approaches": ["accepted path 1", "..."],
    "wrongTurns": ["common misconception 1", "..."],
    "hintLadder": ["nudge", "stronger", "near-reveal"],
    "rubric": { "correctness": "...", "approach": "...", "rigor": "...", "communication": "...", "speed": "..." }
  },
  "followUps": ["now bias the coin...", "generalize to N..."]
}
```

## Interviewer prompt template (one per concept, parameterized)

Stored as `interviewerPrompt` in the JSON. Structure:
- **Persona** — a senior quant interviewer at a top desk; professional, probing, fair-but-pressured.
- **Protocol** — one question at a time; make the candidate think aloud; **never reveal the answer**;
  probe assumptions/edge cases; **escalating hints only when stuck** (use `hidden.hintLadder`); ask the
  `followUps`; close with **structured feed-forward feedback + a tier-scaled score** against
  `hidden.rubric` (the rubric scales to the question's tier) — phrased as "next fix" cards, **never a
  person-level verdict / hire signal** (spec-23 / ADR-0010; `learning-science.md` §3).
- **Grounding clause (critical)** — treat `hidden.answer`/`approaches` as **ground truth; do NOT invent
  or re-derive math**; grade the candidate against the rubric only. Keeps the *interviewer* honest.
- **Injection** — at runtime the feature fills the template with the drawn question's `prompt` + `hidden`.

## Generator prompt (runtime top-ups, non-overlapping)

Stored as `generatorPrompt`. It must:
- Produce only **real quant-style interview questions** within the concept's Green-Book-anchored topic
  (modeled on the quant-interview canon) — **prefer parameterizing the engine-backed templates**;
  free-form only as a fallback.
- Output a question **plus** the data needed to engine-verify it, so the feature can run the engine and
  **reject if unverifiable**.
- Take an **avoid-list** (the student's seen fingerprints + the global pool) and produce a question with
  a **new fingerprint** → guarantees "no overlap ever, per student."

## No-overlap-per-student (implemented in committed code — `functions/src/interview.ts`)

- Each question has a **structural fingerprint** (`templateId` + normalized params; a semantic signature
  for free-form) — catches reworded/parameter-trivial duplicates, not just exact text.
- `mintInterviewToken` loads the per-user `seenQuestionIds` from Firestore, draws one unseen question
  via `drawQuestion` (see `functions/src/interviewDraw.ts`), and `gradeInterview` transactionally
  appends the just-answered id to `seenQuestionIds`. The generator prompt's avoid-list spec is the
  long-term overflow path for when the static pool is exhausted.

## Who builds it — the Interview Studio (after a concept's lessons are built)

The **Interview Studio Lead** *(Opus, non-readonly, persistent/resumable — spawned by the Manager)* orchestrates the studio: it spawns and manages the workers below, runs the internal flow, and synthesizes the final pack.

- **Interview Question Author** *(Interview Studio, Opus, non-readonly)* — designs the tiered synthesis questions +
  engine-backed templates (real-quant-style, anchored+sourced), the hidden records, and follow-up chains.
- **Interview Prompt Engineer** *(Interview Studio, Opus)* — writes the interviewer prompt template + the generator
  prompt with the real-quant-style + engine-verify + avoid-list constraints.
- **Studio Lead spawns its own coder/verification/integrator workers** — a Coder builds the templates/parameterizer/fingerprinter (reusing the concept's engine); the Verification Engineer engine-verifies the **entire** pre-loaded pool; the Integrator writes `interviews/<courseId>.json` + `.md`. The Studio Lead spawns these worker types independently; it cannot reach into Dept 3's subtree.

## Interview Pack Scorecard (concept-level — signed off with the lesson Scorecards)

| # | gate | pass condition | evidence |
|---|------|----------------|---------|
| 1 | Source fidelity | concept Green-Book-anchored; every seed/showcase question cited | manual review |
| 2 | Real quant-style | every question reads like a real quant-interview question (canon-grounded), not an arbitrary puzzle | manual review |
| 3 | Engine-verified pool | every pooled question's answer reproduced by the engine; all `verified:true` | **`./node_modules/.bin/tsx scripts/validate-interview-packs.ts`** (engine cross-check section; exits non-zero on any mismatch) |
| 4 | De-duplicated | all fingerprints unique within the pool | **`validate-interview-packs.ts`** (duplicate-fingerprint gate) |
| 5 | Interviewer prompt | no-answer-leak; escalating hints; grounding clause; structured **feed-forward** scoring; **tier-aware rubric**; **`pressureNote` (no person-verdict / hire signal)** | **`validate-interview-packs.ts`** (NO-LEAK hint-rung gate) + manual review of persona/protocol |
| 6 | Generator prompt | constrained to real-quant-style + anchored + engine-solvable forms; engine-verify-before-serve; avoid-list | manual review |
| 7 | Difficulty | floor = hard; tiers tagged; follow-up chains present | **`validate-interview-packs.ts`** (tier + followUps structural gates) |
| 8 | Asset hygiene | `interviews/<courseId>.json` validates against `InterviewPackSchema`; `.md` mirror generated; schema drift guard passes | **`validate-interview-packs.ts`** (schema validation + functions copy drift guard) |
| 9 | Leak guard | `functions/src/interview.leak.test.ts` passes | **`./node_modules/.bin/vitest run functions/src/interview.leak.test.ts`** |
| 10 | Pressure & feed-forward (learning science — `learning-science.md` §3) | brutal floor for the quant-intensity gate (spec-22); `hidden.rubric` scales by tier (no `hard`-rubric on a `brutal` Q); report is feed-forward "next fix" + predicted-vs-measured calibration + `pressureNote`; **no hire-signal / person-verdict anywhere** (spec-23 / ADR-0010); per-question confidence captured for calibration (spec-12) | manual review of rubric/prompt + report copy |

Run both mechanized gates before signing off:
```bash
./node_modules/.bin/tsx scripts/validate-interview-packs.ts   # engine-recompute + no-leak + schema + drift
./node_modules/.bin/vitest run functions/src/interview.leak.test.ts  # leak-guard unit test
```

## Lifecycle

Built at the **end of the concept** (after lessons, reusing their engines). Its Scorecard is part of the
**concept sign-off**; the **Slack FYI** notes the pack (question count + a link to the `.md`). When the
concept **auto-ships** it is **merged to `main`** with the concept. It is **bundled into a project's
Functions runtime only when functions deploy there** (the `firebase.json` predeploy hook runs
`scripts/copy-interview-packs.mjs`), and that functions deploy is itself **gated on the `OPENAI_API_KEY`
secret being set on the target project** (`deploy.md`): if the secret is set the factory deploys
functions and the pack goes live there; if not, the factory ships hosting + firestore only and flags
functions-deploy + secret-set as a remaining human step (matching HANDOFF.md). It is **never seeded to
Firestore**. The loader (`functions/src/interview.ts`:`loadPack`), the Zod schema
(`src/content/interviewPack.ts`), and the verify-before-serve + per-student seen-set seam already exist
in committed code.
