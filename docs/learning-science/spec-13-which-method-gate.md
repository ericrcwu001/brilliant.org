# spec-13 — Which-method discrimination gate (on the `prediction` beat)

- **Status:** Planned
- **Phase:** 1 (Logic)
- **Depends-on:** `spec-00` (method registry `methods.ts`, `BeatSchema.schemaId`, `MethodId`/`MethodIdSchema`).
- **Implements:** brainlift app-action **#3** (interleaving by hidden *method* / "which method?" discrimination);
  locked decisions **D12** (calibrate-vs-discrimination: discrimination is a *separate* gate on `prediction`, never
  `patternPick`, never overload `DiagnosticGate`), **D3/D5** (method tag / registry), **D6** (confidence on
  checkpoints — consumed, defined by `spec-02`); strategic POV **SPOV2** (transferable under-pressure retrieval —
  the graded act is *picking the method before solving*, not solving).

> Read `README.md` §1 (corrected premises), §3 (D12), §4 (shared contracts), §8 (R5, R11) before implementing.
> This spec assumes `spec-00` has shipped `src/content/methods.ts` and `BeatSchema.schemaId`. If they are absent,
> **stop and build `spec-00` first** (R5 — do not stub the registry).

---

## 1. Goal & non-goals

**Goal.** Add a *which-method discrimination gate*: a graded `prediction` beat whose options are **method names**
(a domain-appropriate subset of the `spec-00` registry), with `byOption` refutation, presented **before** the
learner solves a **label-stripped** problem. The *selection of the method is the graded act* — the gate measures
whether the learner can recognise deep structure, not whether they can compute. Provide a reusable
**label-stripping presentation mode** so the solving surface hides topic/chapter titles and method-revealing prompt
text. Add a **validator assertion** for gate well-formedness.

**Non-goals.**
- The Daily Review queue surface itself (`spec-20`) — this spec delivers the *gate beat + presentation mode + the
  standalone `WhichMethodGate` component the queue/checkpoints mount*, not the queue UI. `spec-20` mounts
  `WhichMethodGate` from `src/lesson/WhichMethodGate.tsx` with props `{ beat, schemaId, onResolved }`
  (README §5 collision matrix, gate Issue #11); this spec ships that exact component and signature.
- Confidence *capture mechanics* — `spec-02` owns `confidenceByBeat` and `ConfidenceRating.tsx`; this spec only
  marks the gate as a checkpoint that confidence applies to (D6) and wires the rating in where `spec-02` exposes it.
- SR scheduling / `submitReview` (`spec-01`/`spec-10`).
- Authoring the actual gate fixtures for every lesson — this spec ships the schema, the renderer, the validator,
  the presentation mode, and **one worked example fixture** on a `/dev` route; bulk authoring is a content pass
  (folded into the lesson-factory updates from `spec-00`/`spec-24`).

---

## 2. Current reality (verified against source)

| Claim | Evidence |
|---|---|
| `prediction` interaction is `{ type:'prediction', options: z.array(z.string()) }` — options are free strings. | `src/content/schema.ts:121`. |
| `prediction` is **ungraded** today: any selection is accepted, stored as `initialPrediction`, fires `predictionSet`; the copy literally says "there's no wrong answer here." | `src/lesson/beats/PredictionBeat.tsx:21-82` (caption line 64; `setLessonState({ initialPrediction })` line 52). |
| `prediction` already supports **`byOption`** refutation feedback. | `FeedbackSchema` `byOption` branch `src/content/schema.ts:594-606`; `resolveOptionFeedback` `src/lesson/feedbackResolve.ts:32-40`; rendered at `PredictionBeat.tsx:24-42`. |
| **`patternPick` has NO `byOption` and is ungraded** — confirmed. Its interaction is `{ type:'patternPick', patterns, mode, previews? }` (no `accept`, no graded path). | `src/content/schema.ts:122-131`. It is listed in `GRADED_TYPES` in the validator's *inclusivity* check (`scripts/validate-fixtures.ts:558`) but has **no grading code** in the player and no `byOption` — it cannot back a graded gate (R11). |
| The set of beats that actually grade through the hint ladder. | `GRADED_BEAT_TYPES` `src/lesson/mastery.ts:11` (`stateTap`,`equationTiles`,`answerEntry`,`masteryChallenge`,`retrievalGrid`,`handRanker`) + accept-gated `countingTree`/`selectionGrid` (`:15`). `prediction` is **not** in this set. |
| Graded beats grade via `useHintLadder` (`submitCorrect`/`submitWrong`) and report the hint high-water mark for the mastery signal. Model: `RetrievalGridBeat.tsx:108-134`. | `src/lesson/feedback.ts:34-43,61-73`; `src/lesson/mastery.ts:31-37`. |
| Beat dispatch is a single `switch` on `interaction.type`. | `src/lesson/beats/index.tsx:65-156` (`prediction` → `PredictionBeat`, line 67). |
| `BeatProps` carries `track: 'A'|'B'` density, `lessonState`/`setLessonState`, hint persistence, `hintCapOverride`/`assist`. No "label-stripping" flag exists. | `src/lesson/beats/types.ts:21-57`. |
| Beat-level two-track gate already exists: `beat.track?: 'A'|'B'|'both'`; track-exclusive beats must be `required:false`. | `src/content/schema.ts:616-618`. |
| Analytics has `predictionSet`; no method-gate event. | `src/analytics/events.ts:70-99` (`predictionSet` line 77). |
| Validator structure: per-lesson loops over `lesson.beats`, asserts per-type invariants, `fail()`/`process.exit(1)`. `usesByOption(beat)` helper already exists. | `scripts/validate-fixtures.ts:579-585` (`usesByOption`), `:587-681` (inclusivity per-lesson loop). |
| `BeatShell` renders the action bar + feedback strip; it does **not** render the lesson title. | `src/lesson/BeatShell.tsx`. |
| During active lesson play the **lesson title** is rendered by the **player**, not the page: `<span className="topbar__title">{lesson.title}</span>` (`src/lesson/LessonPlayer.tsx:494`), with a second copy in the completion takeover (`:408`). `LessonPage.tsx`'s topbar (`:120`, `:162`) only renders on loading/error states and shows `lessonId`, **never** the title during play — editing `LessonPage.tsx` would suppress nothing. | `src/lesson/LessonPlayer.tsx:408,494`; `src/pages/LessonPage.tsx:120,162`. |
| The active beat's **`beat.prompt`** is rendered by the **player** in a `<section className="prompt">` **above** `BeatView` (outside the beat component): `<p className="prompt__text">{beat.prompt}</p>`. A beat cannot suppress its own prompt; a method-revealing prompt on a gate beat would still show. | `src/lesson/LessonPlayer.tsx:528-531`. |
| The player resolves the active beat as `const beat = visibleBeats[index]` and constructs `BeatProps` for `<BeatView>`; so `beat.interaction.gate` (the gate-ness of the active beat) is directly available at the player level. | `src/lesson/LessonPlayer.tsx:143` (active beat), `:533-557` (BeatProps construction). |

**Consequence.** The gate is a **new graded variant of the `prediction` beat**, distinguished by the
`interaction.gate` fixture flag, graded against a declared correct method, reusing the existing `byOption`
refutation machinery, and rendered by a **standalone exported `WhichMethodGate` component**
(`src/lesson/WhichMethodGate.tsx`, props `{ beat, schemaId, onResolved }`) that both `PredictionBeat` and the
`spec-20` queue mount. It is **never** a new interaction type and **never** `patternPick` (R11 — `patternPick` has
no `byOption` and no graded path). Label-stripping is a **presentation flag threaded down**
to the **player** (`LessonPlayer.tsx`) — which owns both the title chrome (`:494`/`:408`) and the `beat.prompt`
render (`:528-531`) — and into the beat via `BeatProps`, not a content rewrite. `LessonPage.tsx` is **not** the
label-stripping site (its topbar shows `lessonId` only on loading/error, never the title during play).

---

## 3. Design

### 3.1 Schema delta — turn `prediction` into a gradeable method gate (additive)

Extend the `prediction` member of `InteractionSchema` (`src/content/schema.ts:121`) with **optional** fields so
every existing prediction fixture is untouched:

```ts
// src/content/schema.ts — replace line 121
z.object({
  type: z.literal('prediction'),
  options: z.array(z.string()),
  // ── Which-method discrimination gate (spec-13 / D12). When `gate` is present the
  // prediction becomes a GRADED method-discrimination checkpoint: `options` are
  // method display names, `gate.correct` names the right MethodId, and the
  // selection is graded (not the ungraded opening bet). Absent ⇒ today's ungraded
  // opening-bet behavior (PredictionBeat.tsx), unchanged.
  gate: z
    .object({
      kind: z.literal('which-method'),
      // The right answer, by registry id (Foundation B). Cross-checked by the
      // validator against `beat.schemaId` and against `options`.
      correct: MethodIdSchema,
      // Registry ids for each visible option, positionally aligned with `options`
      // (options[i] is the display label for optionMethods[i]). Lets the renderer
      // grade a click without string-matching display copy, and lets the validator
      // assert the labels match the registry. The distractor ids are NOT ad-hoc
      // author choices or arbitrary domain-overlap picks: they are drawn from the
      // curated CONFUSABLE[gate.correct] map in methods.ts (Foundation B, owned by
      // spec-00 — this spec only consumes it). Track B uses a fuller confusable
      // subset; Track A uses 2–3. The validator cross-checks every distractor is a
      // declared confusable of `correct` (§3.1.1, step 6g).
      optionMethods: z.array(MethodIdSchema).min(2),
    })
    .optional(),
}),
```

> **Shared field — now folded into the authoritative contract.** `prediction.gate` (`{ kind:'which-method',
> correct, optionMethods }`) is **owned by this spec** and is recorded in **README §4.5** ("Fields added by later
> specs", on the `prediction` member of `InteractionSchema`) and the **§5 collision matrix** row for
> `src/content/schema.ts`. Consumers (spec-02 `isCheckpointBeat`, spec-03 `isRetrievalRep`) detect a gate by
> `interaction.type === 'prediction' && !!interaction.gate` (README §4.5). `spec-00` owns `MethodIdSchema`; this
> spec imports it. `schemaId` (README §4 Foundation B) is **reused as-is**, not redefined — a gate beat carries
> `beat.schemaId === gate.correct`.

`MethodIdSchema` is imported from `spec-00`'s `src/content/methods.ts` (`README` §4 Foundation B). If `schema.ts`
cannot import `methods.ts` due to a cycle, mirror the pattern `spec-00` uses (it already lands `MethodIdSchema` for
the `BeatSchema.schemaId` field, so the import path is established by `spec-00`).

### 3.1.1 Distractor source — `CONFUSABLE[correct]` from `methods.ts` (consume, don't define)

A gate's distractors are **not** chosen ad-hoc by the author and **not** derived from raw domain overlap (e.g.
"both methods touch `probability`"). Two methods sharing a domain are not necessarily *confusable under pressure*;
the discrimination the gate trains is between methods a learner actually mistakes for one another. So
`gate.optionMethods` is drawn from a **curated confusability map** keyed on the correct method:

```ts
// src/content/methods.ts (Foundation B) — OWNED BY spec-00. This spec only CONSUMES it.
// CONFUSABLE[m] = the near-miss methods a learner plausibly picks instead of `m`.
export const CONFUSABLE: Record<MethodId, MethodId[]>
```

- **Ownership.** `CONFUSABLE` is a `spec-00` deliverable on `methods.ts` (the method-taxonomy single source of
  truth, README §4 Foundation B, D5 "controlled-vocabulary registry"). **spec-13 does not define or edit
  `CONFUSABLE`** — it imports and consumes it. If `CONFUSABLE` is absent when this spec is implemented, that is a
  missing Foundation B deliverable: coordinate with spec-00 to add it (do not stub it inline here — R5), and flag in
  the structured output.
- **Authoring rule.** When an author sets a gate, `gate.correct`'s distractors must be a subset of
  `CONFUSABLE[gate.correct]`. The author picks *how many* (Track-aware, §5), not *which arbitrary* methods.
- **Track sizing.** Track A: `correct` + **2–3** entries from `CONFUSABLE[correct]` (smaller, less-confusable
  set). The quant-intensity gate (Track B / `learningGoal==='interview'`): a **fuller** subset — more of the
  declared confusables — for a harder discrimination (§5 "Option count").
- The validator enforces the subset relation (step 6g), so a fixture cannot ship a distractor that the registry does
  not declare confusable with `correct`.

### 3.2 Grading semantics

- **Graded act = the method selection.** Correct ⇔ `optionMethods[selectedIndex] === gate.correct`.
- The gate is a **retrieval rep / checkpoint** (Foundation D, D6): it counts for the mastery signal and (later)
  the SR queue + calibration. To make the existing mastery machinery (`computeMastered`) and analytics treat it as
  graded **without** widening the ungraded opening bet, gate it on the **presence of `interaction.gate`**, not on
  `type === 'prediction'` wholesale (see step 4).
- Refutation uses the existing `byOption` feedback keyed by the **option display string** (unchanged machinery):
  `feedback.byOption[label].note` + `correct?: boolean`. The renderer's *grade* comes from `gate.correct`
  (authoritative); `byOption[label].correct` is the *copy affordance* (green vs soft note) and the validator
  cross-checks the two agree (step 6) so a fixture cannot show a green note on a wrong method.

### 3.3 Label-stripping presentation mode

A reusable flag that hides method-revealing chrome at the solving surface (the gate, and the problem solved right
after it). Thread a single boolean down rather than rewriting content:

- Add `labelStripped?: boolean` to `BeatProps` (`src/lesson/beats/types.ts`) — supplied by the player/queue driver.
- The suppression happens in the **player** (`src/lesson/LessonPlayer.tsx`), which owns the title chrome and the
  `beat.prompt` render — **not** in `LessonPage.tsx` (its topbar never shows the title during play). The player
  derives a single `stripped` predicate from the active beat: `stripped = labelStripped || isGateBeat(beat)` where
  `isGateBeat(beat)` is `beat.interaction.type === 'prediction' && !!beat.interaction.gate`. When `stripped`:
  - **Title:** suppress `topbar__title` at `LessonPlayer.tsx:494` (active-play header; also `:408` in the
    completion takeover) so the surface doesn't reveal "Markov Chains → Lesson 3". A gate beat is therefore always
    title-stripped locally (`isGateBeat` is true) even when `labelStripped` is false.
  - **Prompt:** suppress or neutralize the player's `beat.prompt` render at `LessonPlayer.tsx:528-531` — a
    method-revealing prompt above `BeatView` would otherwise defeat label-stripping. For a gate beat the player
    renders the gate's neutral discrimination prompt inside the beat (the `WhichMethodGate` component, step 5), not
    `beat.prompt`; outside a gate, when `labelStripped` is set surface-wide, suppress the `prompt` section.
  - Beats additionally suppress any method-naming auxiliary copy they render themselves (the gate beat hides the
    "there's no wrong answer" caption and uses a neutral prompt — step 5).
- Default `false` ⇒ today's chrome. In normal in-lesson flow the gate runs label-stripped **locally** (it hides its
  own title affordance) even when the surrounding lesson is labelled; the queue (`spec-20`) sets it surface-wide.

This is intentionally a thin flag: `spec-20` (queue) is the primary consumer; in-lesson checkpoints get
local stripping for free.

### 3.4 Placement (consumed by other specs)

- **Daily Review queue (`spec-20`):** the queue mounts the standalone `WhichMethodGate` (from
  `src/lesson/WhichMethodGate.tsx`, props `{ beat, schemaId, onResolved }`) label-stripped before each due problem,
  driving its own progression off `onResolved`. This spec exposes the component + flag; `spec-20` wires the surface.
- **In-lesson discrimination checkpoints:** a lesson fixture may include a `prediction` beat with `gate` set at a
  designated checkpoint (e.g. after introducing a second method that competes with an earlier one). Authored via the
  lesson-factory; this spec only requires the validator to accept/enforce well-formedness.

### 3.5 Confidence (D6) — consume, don't define

The gate is a checkpoint, so per D6 it captures confidence. `spec-02` defines `confidenceByBeat` (snapshot,
`README` §4 Foundation C) and `ConfidenceRating.tsx`. This spec marks the gate as a confidence-eligible checkpoint
(it is a retrieval rep — `spec-03`'s `isRetrievalRep` must return true for a gate beat) and renders the rating where
`spec-02` exposes it, **Track-aware** (B/`learningGoal==='interview'` sees it; Track A light/off). If `spec-02` has
not shipped when this spec is implemented, leave a `// spec-02: confidence rating mounts here (checkpoint)` seam at
the documented insertion point and do not block.

---

## 4. Step-by-step implementation

> Commands: `./node_modules/.bin/vitest run`, `tsx scripts/validate-fixtures.ts`, `./node_modules/.bin/eslint .`
> Manual UI: `/dev/*` routes (no Firebase/Java — see `AGENTS.md`).

1. **Confirm `spec-00` foundations exist.** `rg "export const MethodIdSchema" src/content/methods.ts`,
   `rg "export const CONFUSABLE" src/content/methods.ts`, and `rg "schemaId" src/content/schema.ts`.
   → verify: all return a hit. If `CONFUSABLE` is missing it is a missing Foundation B deliverable — coordinate with
   spec-00 to add it (the gate consumes it for distractor selection, §3.1.1); do not stub it inline (R5). If
   `MethodIdSchema`/`schemaId` are missing, build `spec-00` first (R5); do not proceed with a stub.

2. **Extend the `prediction` schema** (`src/content/schema.ts:121`) with the optional `gate` object from §3.1.
   Import `MethodIdSchema` from `./methods` (match `spec-00`'s import for `schemaId`).
   → verify: `tsx scripts/validate-fixtures.ts` still passes (all existing prediction fixtures have no `gate`, so
   they are unaffected) and `./node_modules/.bin/tsc -p tsconfig.json --noEmit` (or the repo's typecheck) is clean.

3. **Add the analytics event** (`src/analytics/events.ts`, after `predictionSet` ~line 78):
   ```ts
   methodGatePicked: (
     b: BeatRef & { picked: string; correct: boolean; schemaId: string },
   ) => track('method_gate_picked', b),
   ```
   → verify: file compiles; `rg "method_gate_picked" src/analytics/events.ts` hits once.

4. **Make the mastery/graded machinery recognise a gate** without grading ungraded predictions
   (`src/lesson/mastery.ts` — README §5 collision matrix: spec-13 edits `isGradedBeat`/`isCheckpointBeat` here;
   spec-03 does **not** touch this file). The gate is detected **only** by `type === 'prediction' &&
   !!interaction.gate` (README §4.5) — never by adding `'prediction'` to a beat-type set.
   - **`isGradedBeat` (body)** — a `prediction` counts **iff** it carries `gate`:
     ```ts
     function isGradedBeat(beat: Beat): boolean {
       const type = beat.interaction.type
       if (type === 'prediction') return 'gate' in beat.interaction && !!beat.interaction.gate
       if (GRADED_BEAT_TYPES.has(type)) return true
       if (ACCEPT_GATED_BEAT_TYPES.has(type)) { /* unchanged */ }
       return false
     }
     ```
     Leave `GRADED_BEAT_TYPES` itself **unchanged** (R2 — keep the set stable; the opening-bet `prediction` stays
     ungraded).
   - **`isCheckpointBeat` (spec-02 owns the function; coordinate the gate branch here)** — `spec-02` adds
     `isCheckpointBeat`/`CHECKPOINT_BEAT_TYPES` to this same file (README §5). The gate must be recognised as a
     checkpoint **via the predicate**, not the set: `isCheckpointBeat` returns true for `type === 'prediction' &&
     !!interaction.gate`. Do **NOT** add `'prediction'` to `CHECKPOINT_BEAT_TYPES` — that would capture confidence
     on the exempt opening bet (D6, gate Issue #4/#5). If `spec-02` has already shipped `isCheckpointBeat`, add the
     gate predicate branch; if not, leave a `// spec-13: gate prediction is a checkpoint — detect via
     interaction.gate, not a type set` seam at the documented insertion point and flag in the structured output to
     reconcile with spec-02.
   - **`isRetrievalRep` (spec-03 owns `src/lesson/retrievalRep.ts`)** — see step 8: the same predicate
     (`type === 'prediction' && !!interaction.gate`) makes a gate a retrieval rep; do not add `'prediction'` to any
     rep type set there either.
   → verify: add/extend `src/lesson/mastery.test.ts` (step 7) — a gate prediction is graded-required (and, where
   `isCheckpointBeat` exists, a checkpoint), an opening-bet prediction is **neither** graded nor a checkpoint.

5. **Build the standalone `WhichMethodGate` component** (`src/lesson/WhichMethodGate.tsx`, **NEW** — README §5
   collision matrix, gate Issue #11). This is the canonical gate renderer; both `PredictionBeat` (in-lesson) and
   `spec-20`'s queue mount it. Exported signature is **frozen by the README**:
   ```tsx
   export function WhichMethodGate(props: {
     beat: Beat                                   // the prediction beat; props.beat.interaction.gate is set
     schemaId: string                             // the method under test (= beat.interaction.gate.correct)
     onResolved: (result: { correct: boolean; picked: string }) => void
   }): JSX.Element
   ```
   - `beat` is the gate `prediction` beat; the component asserts `beat.interaction.type === 'prediction' &&
     !!beat.interaction.gate` and renders nothing otherwise.
   - `schemaId` is the method under test (callers pass `beat.interaction.gate.correct`); the component uses
     `gate.correct`/`gate.optionMethods` from the beat to grade and may cross-check against `schemaId`.
   - `onResolved({ correct, picked })` fires when the learner resolves the gate; the in-lesson host advances on
     `correct`, the queue (`spec-20`) drives its own progression off the same callback.
   The component:
   - hides any "there's no wrong answer" caption; uses a neutral discrimination prompt ("Which method cracks this?").
   - grades the click against `gate.correct` via `gate.optionMethods[i]`; drives `useHintLadder`
     (`submitCorrect`/`submitWrong`) so the high-water mark + `needsReview` + analytics flow exactly like other
     graded beats (model: `RetrievalGridBeat.tsx:108-134`).
   - shows `byOption` refutation on the picked option (reuse `resolveOptionFeedback`), and on a correct pick calls
     `onResolved({correct:true,…})`; on wrong, keeps the learner on the gate (it is the graded act) after
     `onResolved({correct:false,…})`.
   - fires `analytics.methodGatePicked({ lessonId, beatId: beat.beatId, picked: opt, correct, schemaId:
     beat.interaction.gate.correct })`.
   - is **always locally label-stripped** (does not render the lesson title) and renders its own neutral prompt.

   Then **delegate from `PredictionBeat`** (`src/lesson/beats/PredictionBeat.tsx`): branch on the gate. Keep hook
   order stable by dispatching to two child components, each owning its own hooks:
   ```tsx
   if (beat.interaction.type !== 'prediction') return null
   if (beat.interaction.gate) {
     return (
       <WhichMethodGate
         beat={beat}
         schemaId={beat.interaction.gate.correct}
         onResolved={({ correct }) => { if (correct) onAdvance() }}
       />
     )
   }
   // …today's ungraded opening-bet body unchanged below (OpeningBetView).
   ```
   > **Hook-order note:** `PredictionBeat` currently early-returns before any hook (`useState` is the only hook). By
   > dispatching to `WhichMethodGate` (which owns `useHintLadder`) vs the ungraded `OpeningBetView` — each a
   > component calling its own hooks — hook order stays stable per the rules of hooks. `PredictionBeat` itself calls
   > no hook before the dispatch branch.
   → verify: `/dev` manual check (step 9) — picking the wrong method shows the refutation and does **not** advance;
   the right method advances; `rg "export function WhichMethodGate" src/lesson/WhichMethodGate.tsx` hits once.

6. **Validator assertion — gate well-formedness** (`scripts/validate-fixtures.ts`). Import `CONFUSABLE` from
   `src/content/methods.ts` (Foundation B / spec-00 — consumed, not defined here). Add a pass (after the
   inclusivity loop, ~line 681) over **every** lesson beat (not just GATED lessons) — a helper:
   ```ts
   // ── Which-method gate well-formedness (spec-13 / D12).
   for (const lesson of lessons) {
     for (const beat of lesson.beats) {
       const it = beat.interaction
       if (it.type !== 'prediction' || !it.gate) continue
       const where = `${lesson.lessonId}/${beat.beatId}`
       // a) options ↔ optionMethods positional alignment
       if (it.gate.optionMethods.length !== it.options.length)
         fail(`${where}: gate optionMethods length ${it.gate.optionMethods.length} != options ${it.options.length}`)
       // b) correct must be one of the offered methods (no unanswerable gate)
       if (!it.gate.optionMethods.includes(it.gate.correct))
         fail(`${where}: gate.correct "${it.gate.correct}" is not among optionMethods`)
       // c) distinct methods (a real discrimination, not a duplicate)
       if (new Set(it.gate.optionMethods).size !== it.gate.optionMethods.length)
         fail(`${where}: gate optionMethods contains duplicates`)
       // d) graded ⇒ byOption refutation present (mirrors the inclusivity rule for predictions)
       if (!usesByOption(beat)) fail(`${where}: which-method gate lacks byOption refutation feedback`)
       // e) byOption.correct (if present) agrees with gate.correct, by option label
       const correctIdx = it.gate.optionMethods.indexOf(it.gate.correct)
       const correctLabel = it.options[correctIdx]
       const bo = (beat.feedback as { byOption: Record<string, { note: string; correct?: boolean }> }).byOption
       for (const [label, entry] of Object.entries(bo)) {
         const shouldBeCorrect = label === correctLabel
         if (entry.correct !== undefined && entry.correct !== shouldBeCorrect)
           fail(`${where}: byOption["${label}"].correct=${entry.correct} disagrees with gate.correct`)
       }
       // f) the gate's schemaId is the method it tests (Foundation B coherence)
       if (beat.schemaId && beat.schemaId !== it.gate.correct)
         fail(`${where}: beat.schemaId "${beat.schemaId}" != gate.correct "${it.gate.correct}"`)
       // g) every distractor is a DECLARED confusable of `correct` (no ad-hoc /
       //    domain-overlap distractors). CONFUSABLE is owned by spec-00 (methods.ts,
       //    Foundation B); this spec imports it. `correct` itself is exempt.
       const confusable = new Set(CONFUSABLE[it.gate.correct] ?? [])
       for (const m of it.gate.optionMethods) {
         if (m === it.gate.correct) continue
         if (!confusable.has(m))
           fail(`${where}: distractor "${m}" is not in CONFUSABLE["${it.gate.correct}"] (use a declared near-miss, not an ad-hoc/domain-overlap pick)`)
       }
       console.log(`✓ which-method gate: ${where}`)
     }
   }
   ```
   Note: also relax/confirm the existing inclusivity check at `:599-603` — an opening-bet prediction still needs
   `byOption`; a gate prediction satisfies that rule too, so no change there, but add a comment that gate predictions
   are additionally checked above.
   → verify: `tsx scripts/validate-fixtures.ts` passes on the repo; a deliberately malformed gate fixture (extra
   option, mismatched `correct`) makes it exit non-zero.

7. **Thread label-stripping through the player** (`src/lesson/LessonPlayer.tsx`) — this is where title + prompt
   chrome live, **not** `LessonPage.tsx` (verified: `LessonPage.tsx` only renders `lessonId` on loading/error,
   never the title during play — editing it suppresses nothing).
   - Add `labelStripped?: boolean` to `BeatProps` (`src/lesson/beats/types.ts:21-57`) with a doc comment, and thread
     it into the `<BeatView>` props block (`LessonPlayer.tsx:533-557`) from a player/dev-driver input (default
     `false`).
   - In `LessonPlayer.tsx`, give the player knowledge of the active beat's gate-ness. The active beat is already
     `const beat = visibleBeats[index]` (`:143`); derive
     `const isGate = beat.interaction.type === 'prediction' && !!beat.interaction.gate` and
     `const stripped = labelStripped || isGate`.
   - **Suppress the title** when `stripped`: gate the `<span className="topbar__title">{lesson.title}</span>` at
     `LessonPlayer.tsx:494` (active-play header). Apply the same suppression to the completion-takeover copy at
     `:408` if the completed lesson's terminal beat is a gate or the surface is `labelStripped`.
   - **Suppress / neutralize `beat.prompt`** when `stripped`: the player renders
     `<section className="prompt"><p className="prompt__text">{beat.prompt}</p></section>` at
     `LessonPlayer.tsx:528-531`, **outside** the beat component — so the beat cannot hide a method-revealing prompt.
     For a gate beat, do not render this section (`WhichMethodGate` shows its own neutral discrimination prompt,
     step 5); for a non-gate beat under surface-wide `labelStripped`, suppress it likewise.
   → verify: `/dev` route renders the gate with no lesson title and no leaking `beat.prompt` above the gate; a
   normal (non-stripped) lesson beat still shows its title and prompt unchanged.

8. **Retrieval-rep coherence (spec-03 seam).** Ensure `spec-03`'s `isRetrievalRep(beat, ctx)` returns `true` for a
   gate prediction, detected by the **same predicate** the rest of the plan uses: `beat.interaction.type ===
   'prediction' && !!beat.interaction.gate` (README §4.5). Do **not** add `'prediction'` to a rep beat-type set in
   `retrievalRep.ts` (that would mark the exempt opening bet a rep). If `spec-03` is already merged, extend its
   classifier with this predicate branch + a test; if not, since `spec-03` depends on `spec-00` (not this spec),
   coordinate — flag in the structured output that `isRetrievalRep` must treat `prediction` w/ `gate` as a rep, and
   add the test here once `retrievalRep.ts` exists. A `TODO` left in code is **not** acceptable.
   → verify: if `src/lesson/retrievalRep.ts` exists, `isRetrievalRep` of a gate beat is `true` and of an opening-bet
   prediction is `false` (unit test).

9. **Dev example.** Add one worked gate to an existing dev fixture or a new `/dev` example (e.g. a probability
   gate: options `['First-step analysis','Symmetry','Conditioning']`, `optionMethods:
   ['first-step-analysis','symmetry','conditioning']`, `correct:'first-step-analysis'`, matching `byOption` notes,
   `schemaId:'first-step-analysis'`), reachable on a `/dev` route, so a reviewer can click through. The two
   distractors must be members of `CONFUSABLE['first-step-analysis']` (§3.1.1) — confirm against the spec-00
   registry; if `symmetry`/`conditioning` aren't declared confusable with `first-step-analysis`, pick distractors
   that are (the validator step-6g check rejects non-confusable distractors).
   → verify: `npm run dev`-equivalent dev route shows the gate; right pick advances, wrong pick refutes and holds.

10. **Lint.** `./node_modules/.bin/eslint src/lesson/WhichMethodGate.tsx src/lesson/beats/PredictionBeat.tsx
    src/content/schema.ts src/lesson/mastery.ts src/analytics/events.ts scripts/validate-fixtures.ts
    src/lesson/beats/types.ts`.
    → verify: zero errors on touched files.

---

## 5. Two-track behavior

The gate is a **discrimination checkpoint**, which is exactly the kind of move D2 splits by track:

| Aspect | Track A (gentle default) | Quant-intensity gate (Track B **OR** `learningGoal==='interview'`) |
|---|---|---|
| Where it appears | Designated in-lesson checkpoints only; queue placement is light. | In-lesson checkpoints **and** before every due problem in the Daily Review queue (`spec-20`). |
| Option count | `correct` + **2–3** distractors drawn from `CONFUSABLE[correct]` (Foundation B / spec-00) — author chooses fewer near-miss distractors, never ad-hoc or domain-overlap picks. | Fuller subset of `CONFUSABLE[correct]` — more of the declared near-miss methods, for a harder discrimination. |
| Confidence (D6) | Light or off (no celebrated calibration). | Confidence rating shown on the gate; feeds calibration (`spec-12`). |
| Label-stripping | Local (the gate hides its own title). | Surface-wide (queue strips topic/chapter chrome across the session). |
| Wrong-pick behavior | Same: refute via `byOption`, stay on the gate. (Track-A copy softer; still graded.) | Same. |

Track selection is read the same way the player already resolves `density`/`track` (`BeatProps.track`); the gate
beat may itself be `track:'A'|'B'|'both'` (`schema.ts:616-618`) — a Track-exclusive harder gate must be
`required:false` (existing rule).

---

## 6. Data / schema changes (deltas only)

- **`InteractionSchema` `prediction` member** (`src/content/schema.ts:121`): add optional
  `gate: { kind:'which-method', correct: MethodId, optionMethods: MethodId[] (min 2) }`. **Owned by this spec and
  recorded in README §4.5 + §5 collision matrix** (`src/content/schema.ts` row). Consumers detect a gate via
  `interaction.type === 'prediction' && !!interaction.gate`. `gate.optionMethods` distractors are drawn from
  `CONFUSABLE[gate.correct]` (§3.1.1).
- **Consumes (does not define) `CONFUSABLE`** from `src/content/methods.ts` (Foundation B, **owned by `spec-00`**) —
  the curated near-miss map that sources gate distractors (Track B fuller, Track A 2–3). Imported by the validator
  (step 6g) and by the lesson-factory authoring guidance. No edit to `methods.ts` from this spec.
- **`src/lesson/WhichMethodGate.tsx`** (**NEW**, README §5 collision matrix): exported `WhichMethodGate` component
  with props `{ beat, schemaId, onResolved }` — the canonical gate renderer mounted by both `PredictionBeat` and
  `spec-20`'s queue (gate Issue #11).
- **`src/lesson/beats/PredictionBeat.tsx`**: delegate to `WhichMethodGate` when `interaction.gate` is set; the
  ungraded opening-bet body is unchanged.
- **Reuses** `BeatSchema.schemaId` (README §4 Foundation B, `spec-00`) — a gate beat sets `schemaId === gate.correct`.
- **Reuses** `FeedbackSchema.byOption` (`schema.ts:594-606`) — no change.
- **`BeatProps`** (`src/lesson/beats/types.ts`): add `labelStripped?: boolean` (presentation only; not persisted),
  threaded by the player (`src/lesson/LessonPlayer.tsx:533-557`).
- **`src/lesson/LessonPlayer.tsx`** (presentation, no schema change): suppress `topbar__title` (`:494`, and the
  completion takeover `:408`) and suppress/neutralize the `beat.prompt` section (`:528-531`) when the active beat is
  a gate or `labelStripped` is set. This is the actual label-stripping site — `LessonPage.tsx` is **not** touched.
- **No Firestore / progression schema change.** The gate's *result* is captured by the existing mastery snapshot
  (high-water mark via the hint ladder) and analytics; SR card writes belong to `spec-01`/`spec-10`. Confidence
  storage is `spec-02`'s `confidenceByBeat`. (R4 — no new progression field here.)
- **Analytics event** `method_gate_picked` (`{ lessonId, beatId, picked, correct, schemaId }`).

---

## 7. Tests

**Unit (vitest):**
- `src/lesson/mastery.test.ts` (extend): a `prediction` beat **with** `gate` is in `gradedRequiredBeatIds` /
  `isGradedBeat`; a `prediction` **without** `gate` (opening bet) is **not** graded. Asserts both paths (R2-style).
- `src/lesson/WhichMethodGate.test.tsx` (new): render the standalone `WhichMethodGate` with a gate beat;
  (a) clicking the wrong method shows the `byOption` refutation and calls `onResolved({correct:false,…})` (and the
  in-lesson host does **not** advance);
  (b) clicking the correct method shows the affirmation and calls `onResolved({correct:true,…})`;
  (c) `methodGatePicked` is fired with `correct` matching the pick.
- `src/lesson/beats/PredictionBeat.test.tsx` (new): (a) a gate prediction delegates to `WhichMethodGate` and a
  correct pick advances via `onAdvance`; (b) an opening-bet prediction (no `gate`) still behaves as the ungraded bet
  (no grading, advances on any pick).
- If `src/lesson/retrievalRep.ts` exists: a gate prediction → `isRetrievalRep === true`.

**Fixture validation (`tsx scripts/validate-fixtures.ts`):**
- The whole corpus still validates (existing predictions untouched).
- A throwaway malformed gate (wrong `optionMethods` length, `correct` not in `optionMethods`, missing `byOption`,
  `byOption.correct` disagreeing with `gate.correct`, **or a distractor not in `CONFUSABLE[correct]`**) is caught
  (assert by temporarily editing a fixture in a test harness or documenting the manual check; do **not** commit the
  malformed fixture).

**Manual (`/dev`):**
- Gate renders with no lesson title (label-stripped); right pick advances; wrong pick refutes and holds; the
  surrounding lesson chrome is suppressed when `labelStripped` is set.

---

## 8. Foolproofing (README §8)

- **R11 (the load-bearing one).** The gate is built on **`prediction`** (which has `byOption` and a graded
  selection path here), **never** `patternPick` (no `byOption`, ungraded — verified `schema.ts:122-131`). This is
  explicit in §2, §3, and the schema delta. `DiagnosticGate` (the "Quick check") is untouched — it stays a
  prerequisite gate (D12); this is a *separate* discrimination checkpoint.
- **R5.** The gate **needs `schemaId` + `MethodIdSchema` + `CONFUSABLE` from `spec-00`** (R5). Step 1 hard-checks
  they exist and forbids stubbing; `gate.correct`/`optionMethods` are `MethodId`s, the validator asserts `schemaId
  === gate.correct`, and distractors are validated against `CONFUSABLE[gate.correct]` (step 6g) — they are **not**
  ad-hoc author picks or domain-overlap picks. No foundation is faked; `CONFUSABLE` is consumed from spec-00, never
  defined here.
- **R2.** `GRADED_BEAT_TYPES` is left stable; the gate is recognised by the *presence of `gate`*, not by widening
  the set — so the opening-bet `prediction` stays ungraded and the medallion/recommender mastery reads don't shift
  unexpectedly. The mastery test asserts both the graded-gate and ungraded-bet paths.
- **R4.** No new progression/Firestore field; no client write to progression; no new index. The gate result rides
  existing graded-beat plumbing.
- **R9 (it's-in-the-content ≠ the mechanism).** This spec ships the *mechanism* (graded variant + validator +
  presentation flag + the hook surfaces call), not just example content.

---

## 9. Definition of Done

- [ ] `prediction.gate` added (optional) to `schema.ts`; existing fixtures unaffected.
- [ ] **`WhichMethodGate` exported** from `src/lesson/WhichMethodGate.tsx` with props `{ beat, schemaId,
      onResolved }` (exact signature spec-20 mounts — gate Issue #11), grading against `gate.correct`, refuting via
      `byOption`, calling `onResolved({correct,picked})`, firing `method_gate_picked`, always locally label-stripped.
- [ ] `PredictionBeat` delegates to `WhichMethodGate` when `interaction.gate` is set (hook order stable via
      dispatch); the ungraded opening-bet body is unchanged and advances on any pick.
- [ ] `isGradedBeat` (`mastery.ts`) counts a gate prediction as graded; opening-bet prediction stays ungraded.
      `isCheckpointBeat` (spec-02, same file) recognises the gate via `type==='prediction' && !!interaction.gate`,
      **not** by adding `'prediction'` to a checkpoint type set (keeps the opening bet exempt — D6).
- [ ] `BeatProps.labelStripped` threaded through `LessonPlayer.tsx`; the **player** suppresses the lesson title
      (`topbar__title` at `:494`/`:408`) **and** neutralizes the `beat.prompt` section (`:528-531`) under it (and
      always for a gate beat). `LessonPage.tsx` is not edited (it never renders the title during play).
- [ ] Validator asserts gate well-formedness (length, `correct ∈ optionMethods`, distinct, `byOption` present and
      agreeing, `schemaId === gate.correct`, and every distractor ∈ `CONFUSABLE[correct]` — distractors come from the
      spec-00 confusability map, not ad-hoc author choice).
- [ ] One worked gate reachable on a `/dev` route.
- [ ] `./node_modules/.bin/vitest run` green (incl. new `PredictionBeat.test.tsx` + extended `mastery.test.ts`).
- [ ] `tsx scripts/validate-fixtures.ts` passes; a malformed gate is provably rejected.
- [ ] `./node_modules/.bin/eslint` clean on all touched files.
- [ ] **Cross-spec coherence:** `prediction.gate` is recorded in README §4.5 + §5; consumers detect the gate via
      `type==='prediction' && !!interaction.gate`. Coordinate `isRetrievalRep` (spec-03) and `isCheckpointBeat`
      (spec-02) so the gate is a retrieval-rep checkpoint **without** adding `'prediction'` to any beat-type set, and
      confirm `spec-20` mounts `WhichMethodGate` (props `{beat, schemaId, onResolved}`).
