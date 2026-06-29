# Learning-Science Authoring Contract

This is the factory's **mandatory translation** of
[`docs/brainlift-learning-science-brilliant-quant-prep.md`](../../../docs/brainlift-learning-science-brilliant-quant-prep.md)
into concrete per-lesson and per-concept authoring rules. **Every lesson the factory builds, and every
Interview Pack, must satisfy the contract below.** It is enforced at QA (`qa-rubric.md` gates 3 & 6 +
the Interview Pack Scorecard) and templated in `artifacts.md`.

> **Read this before designing any beat.** The brainlift is the *strategy*; this file is the *spec the
> factory builds to*. Where the brainlift and the shipped code disagree, the shipped code wins — the
> brainlift "describes a codebase that partly does not exist" (`docs/learning-science/README.md` §1).
> The mechanisms below are **already built** in the app as `docs/learning-science/spec-00…spec-24`; the
> factory's only job is to author content that actually **uses** them. Do **not** invent new schema —
> author the existing fields.

---

## §0. The thesis (why every rule below exists)

Quant-interview readiness is **durable, transferable, under-pressure retrieval — not comprehension**.
The interview is a cold, delayed, interleaved retrieval test under load: a novel unlabeled problem, no
solution to re-read, working memory under stress, answer generated and re-derived aloud. The training
content that transfers is **isomorphic to that test**, not a polished forward pass. A lesson that *feels*
smooth has usually optimized in-session fluency — the treacherous proxy (Soderstrom & Bjork 2015) that
inflates the demo and starves the interview. So the factory authors for the **dip**: generation over
reading, discrimination over execution, delayed cold retrieval over completion, calibration over
confidence, feed-forward over verdicts.

---

## §1. Scope — what the factory owns vs. feeds vs. defers

The brainlift's app-improvement backlog spans two layers. **Most of it is app/engine machinery that is
already built and is NOT the factory's job.** The factory builds **lesson content + the Interview Pack**;
that content must *feed* the machinery with the right beats, tags, and fields.

| Layer | Owner | What the factory does |
|---|---|---|
| **Content the factory AUTHORS** (per lesson / per concept) | **this factory** | Author the beats, tags, and fields in §2–§4. **Enforced at QA.** |
| **App machinery the factory FEEDS** (SR queue, governor, calibration, medallions, recommender, report) | the LS specs (already built) | Author content so the machinery has what it reads (schemaId tags, graded checkpoints, held-out transfer, confidence-eligible checkpoints, assist paths). The factory does **not** edit these systems. |
| **Bounded / deferred** | — | Two brainlift moves are deliberately bounded (§5): wholesale **failure-first beat re-sequencing** (v1 out-of-scope, README §7) and the **pre-interview worry-dump** (not yet spec'd — surface as report copy only). |

**Spec map** (every technique → the built spec it feeds; `docs/learning-science/spec-*.md`):

| Brainlift technique (SPOV) | Built spec | Factory authoring duty |
|---|---|---|
| Hidden deep-structure method tag, label-stripped (SPOV 2) | spec-00 | `schemaId` on **every** graded beat (§2.1) |
| Which-method discrimination gate (SPOV 2) | spec-13 | author a graded `prediction.gate` checkpoint (§2.2) |
| Honest delayed mastery via transfer (SPOV 1, 4) | spec-11 + spec-24 | author the **held-out transfer** problem (§2.3) |
| Confidence capture + calibration (SPOV 1, 4) | spec-02 + spec-12 | author **confidence-eligible checkpoints** (§2.4) |
| Retrieval-first / cold recall (SPOV 1, 3) | spec-03 | make the graded checkpoints **cold retrieval reps** (§2.5) |
| Desirable-difficulty band ~50–85% (SPOV 3) | spec-21 | author **assist/`hintCapOverride` paths + faded density** so the governor can fade scaffolding without dead-ending (§2.6) |
| Interleaving + analogical encoding / contrasting cases (SPOV 2) | spec-10 (queue) + content | author **"same method, different costume"** comparisons and **CONFUSABLE** foils (§2.7) |
| Worked-example / concreteness fading (boundary) | two-track scaffolding | thin on-ramp, faded `equationTiles`, `density:'split'`, fade fast (§2.8) |
| Brutal-by-default mock, tier-aware, pressure (SPOV 3) | spec-22 | Interview Pack: brutal floor + stress framing (§3) |
| Feed-forward report, NO person-verdict (SPOV 4) | spec-23 / ADR-0010 | Interview Pack: feed-forward, no hire-signal (§3) |

---

## §2. The per-lesson Learning-Science contract (MANDATORY)

Every lesson the factory ships carries **all** of the following. The Bet→Explore→Model→Prove arc
(`docs/beat-audit-rubric.md`) is the spine; these are the LS requirements layered onto it.

### §2.1 — Deep-structure method tag on every graded beat (spec-00 / SPOV 2)

- **Every graded beat declares a `schemaId`** — a valid id from `src/content/methods.ts` (`METHODS`),
  the hidden METHOD the solver applies, independent of surface story. `validate-fixtures` enforces a
  valid registry id on every graded beat (`REQUIRE_SCHEMA_ID`).
- **Strip surface labels at the solving surface.** The chapter/topic title is a permanent Level-0
  hint that pre-announces the method (I3); never let the method leak through a label, a section
  heading, or a give-away beat title on a graded beat.
- **Registry-extension process:** if no existing `METHODS` id fits a graded beat, propose a new id
  (`id`, `name`, `domains`, plus its **symmetric** `CONFUSABLE` near-misses) as a **Wave-0 addition**,
  reviewed by the Dept-3 Schema/Types Specialist with the schema freeze. Ids are persisted on review
  cards — **never put an unregistered string on a beat.**

### §2.2 — A which-method discrimination gate (spec-13 / SPOV 2) — the highest-leverage new beat

The interview never asks you to *execute* a named method; it asks *which* method this unlabeled problem
needs. That selection is the graded act. **Each lesson includes at least one which-method gate** at a
designated checkpoint (and the queue re-asks it spaced + interleaved later).

Author it as a **graded `prediction` beat carrying the `gate` block** — never `patternPick` (which is
ungraded and has no `byOption`), never the ungraded opening bet:

```jsonc
{
  "beatId": "...",
  "required": true,
  "schemaId": "first-step-analysis",          // == gate.correct
  "interaction": {
    "type": "prediction",
    "options": ["First-step analysis", "Symmetry", "Conditioning"],  // DISPLAY labels
    "gate": {
      "kind": "which-method",
      "correct": "first-step-analysis",        // the right MethodId
      "optionMethods": ["first-step-analysis", "symmetry", "conditioning"]  // positionally aligned with options[]
    }
  },
  "feedback": { "byOption": { /* refutational copy per wrong method (§2.9) */ } }
}
```

Rules (validator-checked):
- `gate.correct` **must equal the beat's `schemaId`**.
- Distractors (`optionMethods` minus `correct`) are drawn **only from `CONFUSABLE[correct]`** in
  `methods.ts` — genuine deep-structure near-misses, **never** "shares a domain" foils and never a
  random shuffle. Interleaving helps only for confusable categories (Rohrer); a random distractor
  teaches nothing.
- `options[i]` is the display label for `optionMethods[i]` (positionally aligned).
- The prompt presents a **label-stripped** problem (surface story only) so selecting the method is the
  whole task.
- It is detected as graded + a checkpoint + a retrieval rep automatically (`isGradedBeat` /
  `isCheckpointBeat` / `isRetrievalRep` key off `interaction.gate`).

### §2.3 — A held-out transfer problem (spec-24 + spec-11 / SPOV 1, 2, 4)

Completion ≠ mastery. Gold mastery mints only on a **delayed (≥1 day) clean retrieval**; for Track B
that is a **held-out transfer problem** the lesson must carry.

- One per lesson: `heldOut:true, track:'B', required:false`, a **graded** beat with a valid `schemaId`
  **equal to the mastery challenge's method**, on a **visibly fresh surface** (different
  numbers/objects/framing — never the checkpoint reworded), placed **immediately before** the mastery
  challenge, **engine-verified** like any other number, and **never shown in normal lesson flow** (it
  is reserved for the Track-B delayed gold gate; `LessonPlayer` excludes `heldOut` beats from the
  visible/required walk).
- Two-stage fact-check applies identically (source states it AND the engine reproduces it).

### §2.4 — Confidence-eligible checkpoints + calibration (spec-02 + spec-12 / SPOV 4)

Calibration is the trader's edge *and* the cure for the fluency illusion — the one metric that heals the
learning and trains the work (I7). The app captures confidence on **graded checkpoints** (mastery
challenge, which-method gate, spaced-review) for the quant-intensity audience and scores a Brier stat;
the factory's duty is to **guarantee those checkpoints exist** so confidence has somewhere to ride:

- Every lesson has **≥1 graded checkpoint** — a `masteryChallenge` and/or a which-method gate. These
  are the only beats confidence is captured on (Track B sees the rating + a celebrated calibration
  score; Track A light/off). **Never** make the qualitative opening bet a checkpoint — it is exempt by
  design (D6); keep it a plain `prediction` with **no `gate`**.
- Design the feedback to **reward correctly-low confidence on hard items**, not just correctness — the
  goal is calibration, not bravado (boundary: reward calibration *and* decisive commitment together).

### §2.5 — Make the checkpoints COLD retrieval reps (spec-03 / SPOV 1, 3)

Retrieval is the learning event, not its measurement. The graded checkpoints must be **cold recall
acts**, not post-reading confirmations:

- **Open with a retrieval beat**, not a primer: a cold `answerEntry` / `masteryChallenge` /
  `retrievalGrid` / `tripletReveal` / which-method gate. Use the Continuity Report to open with a
  graded retrieval of a *prior* concept (turn overlap into recall — §2.7).
- **Gate the worked solution behind a real attempt** via the hint ladder — default to a cold attempt;
  re-derivation, not reading, is the path. Use `equationTiles` faded / `density:'split'` so the learner
  re-generates the steps (generation effect, Slamecka & Graf).
- The cold in-lesson checkpoints (`masteryChallenge`, which-method gate) are what `isRetrievalRep`
  counts; the SR queue re-asks them spaced + interleaved later. (The retrieval *opener* is first-pass,
  so author it as genuine recall even though the classifier only counts review-surfaced + checkpoint
  reps.)

### §2.6 — Author within the desirable-difficulty band (spec-21 / SPOV 3)

The difficulty governor (quant-intensity gate only) modulates **scaffolding** (fade density + hint cap)
to hold rolling retrieval success in a desirable-difficulty band (acts below ~50% / above ~85%;
heuristic target ~50–70%, **untuned**). Track A is static. The factory authors the **knobs the governor
needs and the floor that protects a struggling novice**:

- **Every capped/graded beat needs an assist path** (foolproofing R6): author `hintCapOverride`
  and/or `assist` (e.g. `assist.prefillToLastTerm` on a faded `equationTiles`) so a capped beat **never
  dead-ends** when the governor lowers scaffolding. A graded beat with no assist path is a trap.
- Author a sensible **`density`** flag per beat (`'split'` = segmented/scaffolded; `'merged'` = dense)
  so the governor and the two tracks have something to fade.
- **Comfort is the alarm, not the goal.** Do not over-scaffold to make the lesson feel smooth — aim for
  productive struggle. But never floor below ~50% success: a relentless failure-first queue crushes
  competence/autonomy (Deci & Ryan) and induces choking (Beilock).

### §2.7 — Interleaving by deep structure + analogical encoding (SPOV 2 / Gick & Holyoak)

Far transfer is rare and must be **engineered** (Barnett & Ceci). Two analogs compared beats one example
read.

- The Corpus Cartographer's **Continuity Report** turns every conceptual overlap with the existing
  corpus into a **retrieval / spaced-review / interleaving** beat — never a re-teach (skill rule 7).
- Author at least one **"same method, different costume" comparison** — a `retrievalGrid` (or compare-
  mode beat) that pairs two surfaces sharing one `schemaId` and asks *what's the same?* — so the learner
  abstracts the schema, not the story.
- Interleave only **confusable** categories, using the `CONFUSABLE` map as the source of foils — never
  a random shuffle.

### §2.8 — Worked-example fading, thin on-ramp (expertise-reversal boundary)

The boundary condition on every spike: you cannot retrieve what was never encoded.

- For **genuine first contact**, keep a **thin worked-example on-ramp** (a primer / faded
  `equationTiles`) — block briefly to seed the schema, *then* interleave and fade fast. Do not invert to
  cold retrieval before the schema exists.
- **Fade aggressively** thereafter: `density:'split'` → `'merged'`, hint caps tighten, scaffolds drop.
  Two-track: Track A keeps scaffolds; the quant-intensity gate fades them.
- **Speed primitives** (mental math, powers of two, common identities) are the **one exception where
  smoothness is the goal** — overlearn them to automaticity; don't gate them behind desirable
  difficulty.

### §2.9 — Feedback discipline: feed-forward, never the person (SPOV 4 / spec-23)

- Predictions and which-method gates use **per-option (`byOption`) refutational feedback** — name the
  specific wrong mental model each distractor encodes and refute it (Dept 1 Misconception inventory).
- Feedback targets the **task/process and the next fix**, never the learner ("you are…"). ~1/3 of
  feedback interventions *lower* performance, concentrated on self/ego-level cues (Kluger & DeNisi);
  person-level verdicts are the weakest, most-harmful type (Hattie & Timperley). **No "hire signal" /
  verdict-on-the-person anywhere** — that was removed entirely (ADR-0010).

---

## §3. The per-concept Interview-Pack contract (SPOV 3 + 4)

The capstone Interview Pack (`interview-packs.md`) is where pressure-training and feed-forward live.

- **Brutal by default for the quant-intensity audience** (spec-22): the pool floor is `hard`, always
  harder than any lesson's mastery challenge; tiers `hard | harder | brutal`; questions are
  **synthesis across the whole concept** with a follow-up chain. (Track A sees `hard`.) A single brutal
  mock outcome should outweigh any number of smooth in-app wins (I11).
- **Tier-aware grading** (spec-22, a correctness fix): a brutal question must not be graded by the hard
  rubric. The pack's `hidden.rubric` + the interviewer prompt must scale expectations to the tier.
- **Surface the practice-vs-performance gap, not a verdict** (spec-23 / ADR-0010): the report feeds
  forward — five dimensions as **"next fix" cards** + a **predicted-vs-measured calibration delta** +
  a one-sentence **`pressureNote`** framing the result as *under-pressure retrieval* (stress
  inoculation: train under representative pressure *after* encoding). **No Strong-No→Strong-Yes pill,
  no person-level score.**
- **Calibration is the celebrated number**: capture per-question confidence in the interview and report
  the Brier/overconfidence delta; reward correctly-low confidence on hard items.
- **Grounding + engine-verify-before-serve** (the iron rule, unchanged): every pooled and runtime
  question is real-quant-style, anchored+sourced, and engine-verified; the generator rejects anything it
  cannot verify.

---

## §4. Boundary conditions (temper every spike — do not skip)

These are the brainlift's own guardrails; ignoring them turns a desirable difficulty into a destructive
one.

1. **Expertise reversal / cognitive load** (Kalyuga; Sweller; Cowan ~4 chunks): novices learn from
   worked examples, not flailing. Thin on-ramp for first contact; block briefly to seed each schema;
   fade fast. The inversion to cold retrieval applies **after** first exposure.
2. **Calibrate success to the band, not to 0–20%**: ~50–85% retrieval success (heuristic 50–70%). A
   relentless failure-first queue crushes competence and autonomy and induces choking.
3. **Interleave confusable categories only** — deliberate `CONFUSABLE` foils, not random shuffles.
4. **Math anxiety taxes working memory** (Ashcraft & Kirk): pair difficulty with arousal **reappraisal**
   framing and an encouraging, task-focused tone — never shame.
5. **Automaticity is the exception**: overlearn speed primitives to fluency; smoothness is the goal only
   there.
6. **Adherence dominates for the marginal learner**: the two-track default (Track A) keeps scaffolds and
   gentle gamification intact; the aggressive inversions gate on the quant-intensity audience. Invert
   for the interview-bound learner, not on day one for everyone.

---

## §5. Explicitly bounded / deferred (do NOT over-apply)

Two brainlift moves are **intentionally bounded** so factory output stays consistent with the locked LS
plan. Authoring against them anyway produces content that fights the shipped systems.

- **Wholesale failure-first / generation-first beat re-sequencing** (brainlift app-action #5 — a cold
  attempt *before* the primer/worked example for every lesson) is **explicitly out-of-scope for v1 and
  owned by no spec** (`docs/learning-science/README.md` §7, Gate Issue #6). The factory's
  productive-failure expression is the **cold retrieval opener (§2.5)**, **gating the worked solution
  behind a hint-ladder attempt (§2.5)**, and the **cold checkpoints (§2.2/§2.4)** — *not* reordering
  every lesson so the primer follows a forced failure. Apply failure-first **only** where Dept 1+2 agree
  it fits a specific beat and it doesn't strand a novice (boundary §4.1); never as a blanket re-sequence.
- **Pre-interview expressive-writing worry-dump / arousal-reappraisal routine** (Ramirez & Beilock;
  Jamieson) is a real technique but is **not yet spec'd as a system**. Express it only as **report copy**
  — the interview `pressureNote` and an encouraging reappraisal line — not as new app machinery the
  factory builds.

---

## §6. Per-lesson LS checklist (the Manager verifies before sign-off)

A lesson is LS-ready only when **all** hold (folded into `qa-rubric.md` gates 3 & 6):

- [ ] **§2.1** every graded beat has a valid `schemaId`; no method leaks through a label.
- [ ] **§2.2** ≥1 which-method gate (`prediction.gate`), `correct == schemaId`, distractors from
      `CONFUSABLE[correct]`, label-stripped prompt.
- [ ] **§2.3** a held-out transfer problem (`heldOut:true track:'B' required:false`, same `schemaId` as
      the mastery challenge, fresh surface, before the mastery challenge, engine-verified).
- [ ] **§2.4** ≥1 graded checkpoint exists (confidence-eligible); the opening bet is a plain ungraded
      `prediction`.
- [ ] **§2.5** opens with cold retrieval; the worked solution is gated behind an attempt.
- [ ] **§2.6** every capped/graded beat has an assist/`hintCapOverride` path; `density` set per beat.
- [ ] **§2.7** every Continuity-Report overlap is a recall/interleave beat; ≥1 "same method, different
      costume" comparison; foils are `CONFUSABLE`, not random.
- [ ] **§2.8** thin worked-example on-ramp for first contact; fades fast; speed primitives overlearned.
- [ ] **§2.9** `byOption` refutational feedback; feed-forward, no person-level verdict.

The Interview Pack adds **§3** (brutal floor, tier-aware grading, feed-forward report, calibration) to
the Interview Pack Scorecard.
