# Interview Packs (capstone AI quant interview — LIVE feature, ADR-0008)

At the end of each **macro concept (course)** the factory produces an **Interview Pack**: a large,
engine-verified bank of HARD quant-interview questions + an AI **interviewer prompt** + a **generator
prompt** for unlimited fresh, non-overlapping questions. The "interview an AI quant interviewer"
feature is **live** (ADR-0008). The pack is consumed by `functions/src/interview.ts` via `loadPack`;
the Zod schema is `src/content/interviewPack.ts`; `loadPack` strips a leading `course-` from the
conceptId so the filename is always `course-<slug>.json`. Decision records:
`docs/adr/0005-ai-interview-questions-grounded-and-engine-verified.md` and
`docs/adr/0008-ai-capstone-interview-realtime-grounded.md`.

## What's produced (per concept)

`interviews/<courseId>.json` (canonical, versioned) + `interviews/<courseId>.md` (human-readable
mirror). Committed on `main` with the concept; **not seeded to Firestore** (the seed glob only matches
`lesson-*.json`/`course-*.json`). **Bundled into the live Functions runtime** at deploy time via the
`firebase.json` predeploy hook (`scripts/copy-interview-packs.mjs`). The Zod schema already exists at
`src/content/interviewPack.ts`; use it — do not define a separate schema.

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

## Per-question record (in the JSON)

```jsonc
{
  "id": "...",
  "tier": "hard|harder|brutal",
  "fingerprint": "<templateId>:<normalized-params>  |  sem:<hash>",   // for de-dup
  "template": { "id": "...", "params": { ... } },                      // omitted for free-form
  "prompt": "the question shown to the candidate",
  "source": "Green Book p.<n> §<x>  |  <real quant-interview source> (GB-anchored to §<x>)",
  "engineCheck": { "module": "src/engine/<topic>.ts", "answer": "<exact>", "verified": true },
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
  `followUps`; close with **structured feedback + a score** against `hidden.rubric`.
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

## No-overlap-per-student (live — implemented in `functions/src/interview.ts`)

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
| 5 | Interviewer prompt | no-answer-leak; escalating hints; grounding clause; structured scoring | **`validate-interview-packs.ts`** (NO-LEAK hint-rung gate) + manual review of persona/protocol |
| 6 | Generator prompt | constrained to real-quant-style + anchored + engine-solvable forms; engine-verify-before-serve; avoid-list | manual review |
| 7 | Difficulty | floor = hard; tiers tagged; follow-up chains present | **`validate-interview-packs.ts`** (tier + followUps structural gates) |
| 8 | Asset hygiene | `interviews/<courseId>.json` validates against `InterviewPackSchema`; `.md` mirror generated; schema drift guard passes | **`validate-interview-packs.ts`** (schema validation + functions copy drift guard) |
| 9 | Leak guard | `functions/src/interview.leak.test.ts` passes | **`./node_modules/.bin/vitest run functions/src/interview.leak.test.ts`** |

Run both mechanized gates before signing off:
```bash
./node_modules/.bin/tsx scripts/validate-interview-packs.ts   # engine-recompute + no-leak + schema + drift
./node_modules/.bin/vitest run functions/src/interview.leak.test.ts  # leak-guard unit test
```

## Lifecycle

Built at the **end of the concept** (after lessons, reusing their engines). Its Scorecard is part of the
**concept sign-off**; the **Slack FYI** notes the pack (question count + a link to the `.md`). When the
concept **auto-ships** it is **merged to `main`** with the concept and **bundled into the live Functions
runtime** when functions deploy (the `firebase.json` predeploy hook runs `scripts/copy-interview-packs.mjs`).
Not seeded to Firestore. The loader (`functions/src/interview.ts`:`loadPack`), the Zod schema
(`src/content/interviewPack.ts`), and the verify-before-serve + per-student seen-set seam already exist.
