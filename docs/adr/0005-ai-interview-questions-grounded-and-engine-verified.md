# AI-generated quant-interview questions: allowed at runtime, but only grounded in real quant-style questions and engine-verified before serving

**Status:** Accepted — the live "interview an AI quant interviewer" feature is **built and committed on `main`** (the Functions runtime, Zod schema, and engine-verify gates exist); deploying it (functions + the `OPENAI_API_KEY` secret) is what activates it on a project. This decision binds the lesson factory's Interview Pack generation and the live feature alike.

The lesson factory's **iron rule** is *never invent, and fact-check every number twice*: every problem
is anchored to the Green Book and sourced (anchor-and-source), and every answer must be both stated by
the source **and** independently reproduced by a pure engine (two-stage fact-check). The planned
end-of-concept feature lets a learner do a live mock interview with an AI, and to guarantee **no student
ever sees a repeat**, the AI must **generate fresh questions at runtime** — which is, literally,
inventing questions. We carve out **one** exception to "never invent," fenced by two hard constraints:

1. **Grounded in real quant-style interview questions.** Every generated (and pre-loaded) question must
   be a realistic quant-interview question — anchored to the concept's Green-Book topic and the real
   quant-interview canon (`audits/ideation/agent-1-quant-canon.md`) — i.e. the *kind of question
   actually asked on quant desks. It must **not** be an arbitrary engine-solvable puzzle that merely
   happens to be verifiable.
2. **Engine-verify-before-serve.** The feature computes the question's answer with the concept's pure
   engine and **rejects anything it cannot verify** before showing it to a student. Generation prefers
   **parameterizing engine-backed templates derived from real interview questions**; free-form is a
   fallback that still must pass engine verification.

To make this cheap and safe, the factory **pre-generates a large engine-verified pool now** and ships a
**generator prompt** (encoding both constraints + an avoid-list) for runtime top-ups; de-duplication
across students uses per-question structural fingerprints + a per-student seen-set. The full spec lives
in `.cursor/skills/lesson-factory/interview-packs.md`.

## Considered options

- **Trust the LLM (generate question + answer, no engine check).** Rejected: breaks the "engine-true"
  half of the iron rule and risks serving a *wrong* answer in a high-stakes interview simulation.
- **Static fixed bank only (no generation).** Rejected: students would eventually repeat questions; it
  cannot deliver the "no overlap ever, per student" requirement.
- **Free-form engine-verifiable puzzles (verified, but not necessarily interview-style).** Rejected: a
  question can be verifiable yet not resemble a real quant interview; the value is in *realistic*
  interview practice, so real-quant-style grounding is mandatory, not optional.

## Consequences

- The Interview Pack's pre-loaded pool and generator are constrained to **real-quant-style, anchored,
  engine-verifiable** forms — preferring parameterized templates derived from real interview questions.
- The future live feature must run the engine to verify each served question and reject unverifiable
  ones; this is a hard product requirement, not a nice-to-have.
- The factory's **Interview Pack Scorecard** gates both constraints; `interview-packs.md` and `SKILL.md`
  (rule 2 carve-out) encode them.
