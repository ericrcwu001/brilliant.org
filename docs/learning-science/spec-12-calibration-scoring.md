# spec-12 — Calibration scoring (Brier)

**Status:** Planned
**Phase:** Phase 1 (Logic)
**Depends-on:** [`spec-02-confidence-capture.md`](spec-02-confidence-capture.md) (Foundation C — the `confidence` capture must exist before this can score it)
**Implements:** brainlift app-action **#9** ("capture confidence; score a Brier stat"); locked decision **D6** (confidence capture, Track-aware); feeds **D11** / [`spec-23`](spec-23-interview-report-feedforward.md) (the report's predicted-vs-measured calibration delta).

> Read [`README.md`](README.md) §1 (corrected premises — esp. #7), §3 (D6, D11), §4 Foundation C, §8 (R4) first.
> This spec defines the **Brier computation + storage + surfacing hooks**. It does **not** capture confidence
> (that is spec-02) and it does **not** render the report (that is spec-23). It produces the numbers both consume.

---

## 1. Goal & non-goals

**Goal.** Turn the raw confidence captured by spec-02 into a **calibration score** — the standard **Brier score**,
`mean((confidence − correct)²)` over graded answers — at two granularities: (a) **per interview attempt**, computed
server-side in the grading pass and stored on the attempt doc; and (b) a **cross-concept learner trend**, stored in a
new Function-owned `users/{uid}/calibration` aggregate doc. Expose a **predicted-vs-measured delta** (the learner's
mean stated confidence minus their measured accuracy) that spec-23's report renders. Ship a small **pure module**
`src/progress/calibration.ts` that is the single source of the maths, unit-tested in isolation.

**Non-goals.**
- Capturing confidence (spec-02 owns `confidenceByBeat` and the per-question interview `confidence`; this spec only
  reads them).
- The report UI / fix-cards (spec-23). This spec only writes the numbers and the delta the report reads.
- Surfacing in the lesson player (spec-02 owns the rating UI; this spec exposes a selector + hook the surfaces call,
  but does not place any new in-lesson component).
- Scoring per-checkpoint snapshot calibration into a live in-lesson medallion — out of scope; the learner trend
  doc aggregates checkpoint confidence as a future consumer (§7 leaves the field present but only the interview path
  writes it in v1; see Two-track §6).

---

## 2. Current reality (verified)

- **No confidence field exists yet.** `SnapshotSchema.interactionState` (`src/content/schema.ts:725-737`, `.loose()`)
  has no `confidenceByBeat`. The interview attempt doc (`functions/src/interview.ts:225-235` mint;
  `:485-497` grade) carries no per-answer confidence. spec-02 adds both (README §4 Foundation C). **This spec assumes
  spec-02 has landed** — if it has not, stop and build it first (R5: never stub a foundation).
- **`predictionDeltaInitial` is stored-but-never-read.** It is an L1 distance `|initialNumeric − theoreticalValue|`
  computed in `buildDerived` (`functions/src/index.ts:90-110`) and written into `progress/{lessonId}.derived`
  (`:178`), surfaced in the schema at `src/content/schema.ts:752`. `grep` confirms **no read site** anywhere in
  `src/` or `functions/`. It is **not** a calibration signal (it's prediction-vs-truth distance, not
  confidence-vs-correctness) and this spec does **not** repurpose it. Leave it untouched.
- **Brier is never computed** anywhere (verified: no `brier`/`calibration` identifiers in `src/` or `functions/`).
- **Interview grading pass** lives in `gradeInterview` (`functions/src/interview.ts:402-526`). The grader returns an
  `InterviewReport` with five `dimensions` (each `{score:1..5, evidence}`), `hireSignal`, `summary`, `strengths`,
  `fixes` (schema `INTERVIEW_REPORT_SCHEMA` at `:327-363`; type in `functions/src/interviewPack.ts`). The transcript
  (`Turn[]`) is finalized onto the attempt at `:485-497`. `gradeInterview` currently **returns `{ report, attemptId }`**
  (`:524`; type `GradeInterviewOutput` at `:320-323`) — this spec extends both the type and the return with
  `calibration` (§3.2). `Turn` is `{role,text,ts,final}` (`functions/src/interviewPack.ts:145-150`) with **no
  `confidence`** today; spec-02 adds `Turn.confidence?: number` (README §4.5) which this spec reads. **spec-23 removes
  `hireSignal`** (D11); this spec must not depend on `hireSignal` and must compute its correctness signal from the
  **per-question grade**, not the verdict.
- **The interview is single-question** per attempt (`drawQuestion` draws ONE question — `interview.ts:212-219`). So a
  single attempt's Brier is over a **small n** (1 main answer + any confidence-rated follow-ups spec-02 captured).
  The cross-concept trend doc is what makes Brier statistically meaningful; the per-attempt number is informational.
- **Function-owned write pattern** is well established: `interviews`/`interviewState`/`interviewUsage` are all
  Function-written, client read-only (`firestore.rules:105-115`; mirror of milestones/streaks `:95-101`).
- **No `firestore.indexes.json` query needed** for this spec: the calibration aggregate is a single doc read by id
  (`users/{uid}/calibration/summary`), not a collection query. (README §4 R4 — no new index required here.)
- **Pure-module + lazy-Firestore idiom** to copy: `src/progress/recommend.ts:1-45` (pure selectors at the bottom,
  Firestore read lazy-imported and dependency-free for node tests; test file `src/progress/recommend.test.ts`).

---

## 3. Design

### 3.1 The pure module — `src/progress/calibration.ts` (NEW)

The single source of the maths. **Pure, dependency-free, node-testable** (mirrors `recommend.ts`'s pure tail).

```ts
// src/progress/calibration.ts
//
// Calibration = how well stated confidence matches realized correctness.
// Standard Brier score over graded answers: mean((confidence - correct)^2),
// where confidence ∈ [0,1] and correct ∈ {0,1}. LOWER is better (0 = perfect,
// 0.25 = chance/coin-flip at 0.5 confidence, 1 = maximally wrong-and-sure).
//
// Two derived signals the report (spec-23) consumes:
//   - meanConfidence  = mean(confidence)             (what the learner predicted)
//   - accuracy        = mean(correct)                (what actually happened)
//   - overconfidence  = meanConfidence - accuracy    (the predicted-vs-measured delta;
//                                                      >0 overconfident, <0 underconfident)
//
// Two guards on SURFACING (not on computation — numbers always compute/store):
//   - format          each item is binary|typein|voice; per-format sub-summaries
//                      keep the interview (voice) delta free of 0.5-floored type-in
//                      contamination. spec-23 reads byFormat.voice for the interview delta.
//   - reliable        = n >= MIN_CALIBRATION_N (pooled and per format). spec-23 must
//                      not surface/celebrate a delta whose bucket is unreliable.

/** Capture format an item came from. Kept on every item so we can split Brier by
 *  format (a 0.5-floored in-lesson type-in must not contaminate the interview
 *  free-response calibration delta spec-23 surfaces). `binary` = a forced-choice /
 *  which-method-gate answer; `typein` = an in-lesson numeric/type-in checkpoint;
 *  `voice` = an interview spoken free-response answer. */
export type CalibrationFormat = 'binary' | 'typein' | 'voice'

/** One graded answer's calibration input. `confidence` already normalized to [0,1]
 *  by spec-02's scale; `correct` is the binary grade outcome for that answer. */
export interface CalibrationItem {
  confidence: number // [0,1]
  correct: boolean
  hard?: boolean // true for harder/brutal-tier items; powers the reward weighting
  format?: CalibrationFormat // capture format; drives the per-format sub-summaries
}

/** Minimum graded answers before a Brier / overconfidence number is statistically
 *  worth surfacing or celebrating. Below this, a result is PROVISIONAL — spec-23
 *  must hide or label it (§3.5). Owned by spec-12; imported by spec-23's hand-off.
 *  Set to 5 (lower bound of the 5–10 range): per-attempt interview Brier is over a
 *  tiny n by design (§2), so the trend doc is the first place this gate clears. */
export const MIN_CALIBRATION_N = 5

export interface CalibrationResult {
  n: number
  brier: number | null // null when n === 0
  meanConfidence: number | null
  accuracy: number | null
  overconfidence: number | null // meanConfidence - accuracy
  /** false until n >= MIN_CALIBRATION_N. When false, brier/overconfidence are
   *  informational only — spec-23 must NOT surface or celebrate them (§3.5). */
  reliable: boolean
  /** Per-format Brier sub-summaries so a 0.5-floored type-in cannot pollute the
   *  interview (voice) calibration delta. Each present format carries its own
   *  {n, brier, overconfidence}; absent formats are omitted. */
  byFormat?: Partial<Record<CalibrationFormat, { n: number; brier: number | null; overconfidence: number | null }>>
}

/** Owned by spec-12; imported by spec-22/23. A per-question correctness score
 *  (1..5 from INTERVIEW_REPORT_SCHEMA.dimensions.correctness) counts as "correct"
 *  for calibration at or above this threshold. Single source — do not re-derive. */
export const CORRECTNESS_PASS_THRESHOLD = 4
export const isCorrect = (correctnessScore: number): boolean => correctnessScore >= CORRECTNESS_PASS_THRESHOLD

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x)

/** Mean Brier over the items. Defensive: clamps confidence to [0,1] and drops
 *  non-finite confidences so a malformed capture can't poison the score. */
export function brierScore(items: CalibrationItem[]): number | null {
  const valid = items.filter((it) => Number.isFinite(it.confidence))
  if (valid.length === 0) return null
  const sum = valid.reduce((acc, it) => {
    const c = clamp01(it.confidence)
    const y = it.correct ? 1 : 0
    return acc + (c - y) ** 2
  }, 0)
  return sum / valid.length
}

/** Per-format {n, brier, overconfidence} for each format present in the items.
 *  Lets spec-23 read the `voice` (interview free-response) calibration in isolation
 *  from `typein` (the 0.5-floored in-lesson capture). Items with no `format` are
 *  not bucketed (they only count toward the pooled top-level result). */
function byFormatSummaries(
  valid: CalibrationItem[],
): Partial<Record<CalibrationFormat, { n: number; brier: number | null; overconfidence: number | null }>> | undefined {
  const formats = [...new Set(valid.map((it) => it.format).filter((f): f is CalibrationFormat => !!f))]
  if (formats.length === 0) return undefined
  const out: Partial<Record<CalibrationFormat, { n: number; brier: number | null; overconfidence: number | null }>> = {}
  for (const f of formats) {
    const group = valid.filter((it) => it.format === f)
    const meanConf = group.reduce((a, it) => a + clamp01(it.confidence), 0) / group.length
    const acc = group.reduce((a, it) => a + (it.correct ? 1 : 0), 0) / group.length
    out[f] = { n: group.length, brier: brierScore(group), overconfidence: meanConf - acc }
  }
  return out
}

/** Full calibration result (Brier + the predicted-vs-measured signals). */
export function scoreCalibration(items: CalibrationItem[]): CalibrationResult {
  const valid = items.filter((it) => Number.isFinite(it.confidence))
  const n = valid.length
  if (n === 0) {
    return { n: 0, brier: null, meanConfidence: null, accuracy: null, overconfidence: null, reliable: false }
  }
  const meanConfidence = valid.reduce((a, it) => a + clamp01(it.confidence), 0) / n
  const accuracy = valid.reduce((a, it) => a + (it.correct ? 1 : 0), 0) / n
  return {
    n,
    brier: brierScore(valid),
    meanConfidence,
    accuracy,
    overconfidence: meanConfidence - accuracy,
    reliable: n >= MIN_CALIBRATION_N,
    byFormat: byFormatSummaries(valid),
  }
}

/** "Reward correctly-low confidence on hard items" (D6 brief): a virtue bonus,
 *  bounded to [0,1], for being humble-and-right OR humble-and-wrong on HARD items
 *  — i.e. low confidence on a hard item is good calibration whatever the outcome,
 *  and high confidence + correct on a hard item is also good. Used only for the
 *  *celebrated* Track-B surfacing copy (§6), NEVER to alter the Brier number.
 *  Returns null when there are no hard items. */
export function hardItemCalibrationBonus(items: CalibrationItem[]): number | null {
  const hard = items.filter((it) => it.hard && Number.isFinite(it.confidence))
  if (hard.length === 0) return null
  // Per-item virtue: 1 - |confidence - correct|  (1 = perfectly calibrated on this
  // hard item; 0 = maximally miscalibrated). Mean over hard items.
  const sum = hard.reduce((a, it) => a + (1 - Math.abs(clamp01(it.confidence) - (it.correct ? 1 : 0))), 0)
  return sum / hard.length
}

/** Count-weighted running sums for one format (or the pooled total). O(1) update;
 *  exact for the mean Brier; never stores raw per-answer history (server-only writer). */
export interface TrendSums {
  n: number
  brierSum: number // Σ (confidence - correct)^2
  confidenceSum: number // Σ confidence
  correctSum: number // Σ correct (0/1)
}

const EMPTY_SUMS: TrendSums = { n: 0, brierSum: 0, confidenceSum: 0, correctSum: 0 }

function addItemsToSums(prior: TrendSums, items: CalibrationItem[]): TrendSums {
  const valid = items.filter((it) => Number.isFinite(it.confidence))
  return {
    n: prior.n + valid.length,
    brierSum: prior.brierSum + valid.reduce((a, it) => a + (clamp01(it.confidence) - (it.correct ? 1 : 0)) ** 2, 0),
    confidenceSum: prior.confidenceSum + valid.reduce((a, it) => a + clamp01(it.confidence), 0),
    correctSum: prior.correctSum + valid.reduce((a, it) => a + (it.correct ? 1 : 0), 0),
  }
}

/** Combine a prior aggregate with a new attempt's items into an updated running
 *  mean Brier + counts, keeping BOTH the pooled total AND per-format sub-totals so
 *  the interview (voice) calibration delta can be read without `typein` contamination.
 *  Pure so the Function can call it and tests can assert it. Count-weighted running
 *  mean — not re-deriving from raw history (we do not store every item). */
export function foldAttemptIntoTrend(
  prior: { n: number; brierSum: number; confidenceSum: number; correctSum: number; byFormat?: Partial<Record<CalibrationFormat, TrendSums>> },
  items: CalibrationItem[],
): { n: number; brierSum: number; confidenceSum: number; correctSum: number; byFormat: Partial<Record<CalibrationFormat, TrendSums>> } {
  const valid = items.filter((it) => Number.isFinite(it.confidence))
  const pooled = addItemsToSums(prior, valid)
  const byFormat: Partial<Record<CalibrationFormat, TrendSums>> = { ...(prior.byFormat ?? {}) }
  for (const f of new Set(valid.map((it) => it.format).filter((x): x is CalibrationFormat => !!x))) {
    byFormat[f] = addItemsToSums(byFormat[f] ?? EMPTY_SUMS, valid.filter((it) => it.format === f))
  }
  return { ...pooled, byFormat }
}
```

> **Why sums in the trend, not a list.** Storing every `CalibrationItem` ever would grow unbounded and leak
> per-answer history into a doc the client reads. A count-weighted running mean (sums + n) is O(1) to update, exact
> for the mean Brier, and the **server is the only writer**, so the running sums cannot be tampered with.

A **byte-identical mirror** of the pure module is needed in `functions/` because the Functions package compiles
separately and does not import from `src/` (same split the interview functions use — `functions/src/interviewPack.ts`
mirrors `src/content/interviewPack.ts`). Per README §5 the two files are a **byte-mirror src↔functions**: create
**`functions/src/calibration.ts`** as a byte-for-byte copy of everything in §3.1 — `CalibrationFormat`,
`CalibrationItem`, `CalibrationResult`, `TrendSums`, `MIN_CALIBRATION_N`, `CORRECTNESS_PASS_THRESHOLD`, `isCorrect`,
`brierScore`, `scoreCalibration`, `hardItemCalibrationBonus`, `foldAttemptIntoTrend` (no React/Firestore imports). `CalibrationResult` from the
functions copy is the type imported by `gradeInterview`'s `GradeInterviewOutput`, which **spec-23 consumes** (README
§5). A **parity test** (§7) asserts both copies produce identical numbers on a fixed vector, guarding drift. (If the
repo already shares a path alias from functions→src, prefer importing; verify in step 2 — but the README mandates the
byte-mirror, so default to copying.)

### 3.2 Per-attempt calibration (computed in `gradeInterview`)

The grader already produces a per-question outcome we can binarize. **Decision: derive `correct` from
`report.dimensions.correctness.score`** (1..5): treat `score >= 4` as correct (`true`), else `false`. This is the
honest "did they get it right" signal and survives the D11 `hireSignal` removal (spec-23 keeps the `dimensions`).

**Read the per-question confidence explicitly from `transcript[i].confidence`** — spec-02 adds `Turn.confidence?: number`
to the interview transcript turn (README §4.5; `Turn` is in `functions/src/interviewPack.ts:145-150`, currently
`{role,text,ts,final}` with no confidence). Build the `CalibrationItem[]` by walking the candidate turns and reading
each turn's `confidence` (skip turns where it is absent/non-finite — `scoreCalibration` also drops non-finite, but only
candidate answers carry a confidence, so filter to `role === 'candidate'` with a finite `confidence`). Do **not** read
confidence from a top-level attempt field — the authoritative location is `transcript[i].confidence`.

**The binarization constant is owned here (shared with spec-22/23).** Export a single source for the
correct-threshold so spec-22 imports it rather than re-deriving:

```ts
// src/progress/calibration.ts (and the functions/ mirror)
/** A per-question correctness score (1..5 from INTERVIEW_REPORT_SCHEMA.dimensions.correctness)
 *  counts as "correct" for calibration at this threshold. Owned by spec-12; imported by spec-22/23. */
export const CORRECTNESS_PASS_THRESHOLD = 4
export const isCorrect = (correctnessScore: number): boolean => correctnessScore >= CORRECTNESS_PASS_THRESHOLD
```

`correct := isCorrect(report.dimensions.correctness.score)` (i.e. `score >= 4`).

Compute `const cal = scoreCalibration([{confidence, correct, hard, format: 'voice'}])` over the attempt's rated
answers (main question + confidence-rated follow-ups, if spec-02 captured any), and write a **`calibration: cal` block
onto the attempt doc** in the same finalize transaction (`interview.ts:475-522`). **Every interview item is
`format: 'voice'`** (spoken free-response) — this is what keeps the interview calibration delta spec-23 surfaces
separable from the `typein`/`binary` in-lesson captures (§3.2a). Also fold the attempt into the learner trend doc in
the same transaction.

**`cal` is RETURNED, not only written (gate Issue #10).** `gradeInterview`'s return is currently
`{ report, attemptId }` (`functions/src/interview.ts:524`); add `calibration: cal` to it so the type becomes
`GradeInterviewOutput = { report; attemptId; calibration: CalibrationResult }` (`:320-323`). spec-23's report renders
from the **function return**, not by re-reading the attempt doc, so `cal` must be in scope at the `return` — compute it
**before** `runTransaction` (not inside the closure) so the value survives the transaction and reaches the return.

`hard` = the drawn question's tier is `harder` or `brutal`, i.e. `question.tier !== 'hard'` (`Question.tier` is
`'hard'|'harder'|'brutal'` — `functions/src/interviewPack.ts:33`; `question` is loaded at grade time —
`interview.ts:434-436`).

### 3.2a Format dimension (gate #7 — interview Brier must not be polluted by type-ins)

Calibration signal arrives from three differently-reliable capture formats, and a 0.5-floored in-lesson type-in
confidence must not contaminate the interview free-response calibration delta spec-23 surfaces. Every
`CalibrationItem` therefore carries `format?: CalibrationFormat` (`'binary' | 'typein' | 'voice'`), and both the
per-attempt result and the trend doc keep **per-format** sub-summaries alongside the pooled total.

| Capture source | `format` | Set by |
|---|---|---|
| Interview spoken answer (`transcript[i].confidence`, §3.2) | `'voice'` | this spec, in `gradeInterview` |
| Which-method gate / forced-choice checkpoint | `'binary'` | the fold call site (spec-10 / spec-13 surface) |
| In-lesson numeric/type-in checkpoint, Daily-Review reps (§3.2b) | `'typein'` | the fold call site (spec-10) |

- **Pooling is NOT acceptable for the interview delta.** spec-23 must read the **`voice`** sub-summary
  (`summary.byFormat.voice` / `attempt.calibration.byFormat.voice`) for the predicted-vs-measured interview delta, so a
  large pool of 0.5-floored type-ins cannot drag it toward chance. The pooled top-level number remains for the overall
  "your calibration over time" context where mixing formats is acceptable.
- The per-format buckets are exact (own `n`/`brierSum`/…); `MIN_CALIBRATION_N` (§3.5) is applied **per bucket** when
  surfacing the voice delta — a learner with 2 interview answers has an unreliable voice delta even if their pooled n is
  large.

### 3.2b Daily-Review reps fold as `typein` (format note for §3.3a)

The Daily-Review fold (full spec in §3.3a) builds its item with `format: 'typein'` (review reps are in-lesson type-in/binary
recall, never spoken free-response), so review confidence accumulates into the `typein` bucket and the pooled total,
**never** the `voice` bucket. (A which-method-gate review rep may instead set `format: 'binary'`; the fold call site —
spec-10 — picks per rep card type. Either way it stays out of `voice`.)

### 3.3 Learner trend — storage decision (`users/{uid}/calibration/summary`)

**Decision: a new `users/{uid}/calibration` subcollection with a single `summary` doc, Function-written.** Justified
against the two alternatives in README §4 Foundation C:

| Option | Verdict |
|---|---|
| **`ProgressDerived` fields** (per-lesson) | **Rejected as the trend home.** `derived` is keyed per `lessonId` and frozen at completion (only `mastered` upgrades on replay — `index.ts:154-167`). Calibration is inherently **cross-concept** (it spans interview attempts across concepts) and **must update after completion** (each interview attempt updates it). Stuffing a running cross-concept aggregate into a per-lesson frozen doc fights both invariants. |
| **`users/{uid}/calibration/summary` aggregate doc** (chosen) | One small doc, **Function-written** (trusted — it feeds the celebrated Track-B score; rules deny client writes per R4/D14). O(1) running-mean update. Read by id (no index). Mirrors the milestones/streaks/interview Function-owned pattern exactly. |

The `summary` doc shape (NEW shared field — flag for the consistency gate, §8):

```
users/{uid}/calibration/summary          // Function-written; owner read-only
{
  n:             number     // count of graded answers folded in (all sources, pooled)
  brierSum:      number     // Σ (confidence - correct)^2  — divide by n for mean Brier
  confidenceSum: number     // Σ confidence
  correctSum:    number     // Σ correct (0/1)
  // convenience denormals, recomputed on each write (client renders without dividing):
  brier:         number     // brierSum / n
  meanConfidence:number     // confidenceSum / n
  accuracy:      number     // correctSum / n
  overconfidence:number     // meanConfidence - accuracy  ← pooled predicted-vs-measured delta
  reliable:      boolean    // n >= MIN_CALIBRATION_N — spec-23 hides/labels when false (§3.5)
  // per-format sub-totals (gate #7): the interview delta is read from byFormat.voice,
  // NOT the pooled overconfidence, so 0.5-floored type-ins can't contaminate it.
  byFormat: {              // each present format only; absent formats omitted
    voice?:  { n, brierSum, confidenceSum, correctSum, brier, overconfidence, reliable }
    typein?: { n, brierSum, confidenceSum, correctSum, brier, overconfidence, reliable }
    binary?: { n, brierSum, confidenceSum, correctSum, brier, overconfidence, reliable }
  }
  updatedAt:     Timestamp
}
```

Each `byFormat.<format>.reliable` is that bucket's own `n >= MIN_CALIBRATION_N` (the voice delta can be unreliable
while the pool is reliable, and vice-versa). The denormals (`brier`, `overconfidence`, `reliable`) are recomputed from
the sums on every write, both pooled and per-format.

### 3.3a Daily-Review reps fold into the trend (gate Issue #8)

The trend doc must reflect **all** calibration signal, not just interview attempts — Daily-Review reps carry their own
confidence. Foundation A's review card stores `reviews/{cardId}.lastConfidence: number | null` (README §4 Foundation A;
the D6 third capture site, listed in §4.5 with consumer **12**). Each `submitReview` (spec-01 declares the callable;
spec-10 fills the SM-2 advance body — `functions/src/review.ts`) must, **in the same transaction that advances the
card**, fold that rep into `users/{uid}/calibration/summary` so review reps count toward Brier:

- Build one `CalibrationItem` from the rep: `{ confidence: card.lastConfidence (the value just written), correct:
  result === 'pass', format: 'typein' }` (a which-method-gate rep card sets `format: 'binary'` instead — never
  `'voice'`; §3.2b). Skip the fold when `confidence` is `null`/absent (Track A passes none — null-safe, same as the
  interview path), so a confidence-less rep never poisons the trend.
- `mark hard` from the card's tier is not available on the review card shape; review reps fold with `hard` unset (the
  hard-item bonus is interview-surfacing copy only — §6 — and does not affect Brier).
- Call `foldAttemptIntoTrend(prior, [item])` and recompute denormals exactly as the interview path does (§3.3). This is
  the **same pure fold**, so running-mean == batch-mean parity holds across both sources.

**Ownership note:** the **fold call site inside `submitReview` is wired by spec-10** (it owns the SM-2 advance body in
`review.ts` per README §5/§7); this spec **owns the trend-doc shape, the `foldAttemptIntoTrend` math, and the
requirement** that review reps fold in. spec-10 imports `foldAttemptIntoTrend` from `functions/src/calibration.ts`.
Because both interview grading and `submitReview` write the same `summary` doc and both are Function-only transactions,
there is no client-write race (R4/D14).

### 3.4 Exposing the predicted-vs-measured delta to spec-23

spec-23's report renders a calibration delta. Two read paths, both provided:
- **Per-attempt (interview):** the report's predicted-vs-measured **interview** delta reads
  `attempt.calibration.byFormat.voice.overconfidence` (+ `.brier`, `.n`, `.reliable`) — the **voice** bucket, not the
  pooled `attempt.calibration.overconfidence`, so a 0.5-floored type-in never contaminates it (gate #7). The pooled
  fields stay on the attempt for completeness.
- **Trend:** `users/{uid}/calibration/summary` — spec-23 reads `byFormat.voice` for the interview-over-time delta and
  the pooled `overconfidence`/`brier` for the general "your calibration over time" context.
- **Reliability gate (gate #7):** every delta carries a `reliable` flag (`n >= MIN_CALIBRATION_N`, applied per bucket).
  spec-23 **must** suppress or label-as-provisional any delta whose `reliable === false` — see the hand-off in §3.5.

A tiny **client read selector** `src/progress/calibrationRead.ts` (NEW, lazy-Firestore, mirrors
`recommend.ts:19-45`) exposes `loadCalibrationSummary(uid) → CalibrationResult | null` so spec-23 (and any surface)
reads through one place rather than touching Firestore directly.

### 3.5 Min-n suppression guard + spec-23 hand-off (gate #7)

A Brier or overconfidence delta computed over a handful of answers is noise. **`MIN_CALIBRATION_N` (= 5, defined in
`calibration.ts`, §3.1) is the floor below which a delta is provisional and must not be surfaced or celebrated.** This
spec does the gating *math*; spec-23 does the *hiding*:

- **Where the constant lives.** `export const MIN_CALIBRATION_N = 5` in `src/progress/calibration.ts` (and the
  byte-identical `functions/src/calibration.ts`). It is the single source — spec-23 **imports** it from the `src/` copy
  for its surfacing decision; it does not hard-code `5`.
- **What this spec emits.** `scoreCalibration` sets `reliable = n >= MIN_CALIBRATION_N` on the pooled result, and the
  trend write recomputes `reliable` on the pooled doc **and on each `byFormat.<format>` bucket** (so the voice delta is
  gated on the voice n, not the pooled n).
- **Hand-off to spec-23 (the surfacing contract).** spec-23 MUST:
  - treat `reliable === false` as "hold" — do **not** render the number, the celebration copy, or
    `hardItemCalibrationBonus` praise; instead show the provisional/collecting-signal state (e.g. "keep going — a few
    more answers and we'll show your calibration");
  - gate the **interview** delta on `byFormat.voice.reliable`, not the pooled `reliable`;
  - import `MIN_CALIBRATION_N` from `calibration.ts` rather than re-deriving the threshold.
- **Preserved framing (do not regress).** The **count-weighted running trend** (§3.1/§3.3) and the
  **per-attempt-Brier-is-informational** stance (§2, §5 — Track A) are unchanged: a single attempt's Brier is still
  computed and stored; the `reliable` flag only governs *celebrated surfacing*, never *computation or storage*. Below
  `MIN_CALIBRATION_N` the numbers still accumulate in the trend; they are simply not surfaced as a verdict.

---

## 4. Step-by-step implementation

1. **Verify spec-02 has landed.** Confirm `confidenceByBeat` is in `SnapshotSchema.interactionState`
   (`src/content/schema.ts` ~725) **and** that the interview attempt/transcript carries per-question `confidence`
   (check `functions/src/interview.ts` mint/grade + the `Turn`/attempt shape in `functions/src/interviewPack.ts`).
   Note spec-02's chosen confidence scale (0.5–1.0 continuous vs 4 buckets) and its normalization to [0,1].
   → verify: `grep -n confidenceByBeat src/content/schema.ts` returns a hit; the interview confidence field is present.
   **If absent, STOP — build spec-02 first (R5).**

2. **Check the functions→src import boundary.** `grep -n "from '\.\./\.\./src" functions/src/*.ts` and inspect
   `functions/tsconfig.json` `paths`. If functions cannot import `src/`, you will mirror the pure module (step 4b).
   → verify: you know whether to import or mirror before writing the Function.

3. **Create the pure module `src/progress/calibration.ts`** with the exact contents in §3.1.
   → verify: `./node_modules/.bin/eslint src/progress/calibration.ts` passes; the file imports nothing from React/Firestore.

4a. **Write `src/progress/calibration.test.ts`** (the tests in §7).
   → verify: `./node_modules/.bin/vitest run src/progress/calibration.test.ts` is green.

4b. **Create `functions/src/calibration.ts`** — **byte-identical** copy of §3.1: `CalibrationFormat`,
   `CalibrationItem`, `CalibrationResult`, `TrendSums`, `MIN_CALIBRATION_N`, `CORRECTNESS_PASS_THRESHOLD`, `isCorrect`,
   `brierScore`, `scoreCalibration`, `hardItemCalibrationBonus`, `foldAttemptIntoTrend` (per README §5 byte-mirror;
   default to copying even if an import alias exists). Add a one-line header comment: `// Mirror of src/progress/calibration.ts — keep BYTE-IDENTICAL (functions
   compiles separately; parity test guards drift).`
   → verify: `cd functions && ./node_modules/.bin/tsc --noEmit` (or the repo's functions build) passes; the two files
     are byte-identical below their header comment (`diff <(tail -n +2 functions/src/calibration.ts) <(tail -n +2 src/progress/calibration.ts)` empty).

5. **Wire per-attempt + trend write + RETURN into `gradeInterview`** (`functions/src/interview.ts`):
   - Import `scoreCalibration`, `foldAttemptIntoTrend`, `isCorrect` from `./calibration` (or `../../src/...` per step 2).
   - **Before** `runTransaction` (after the grade succeeds, ~`interview.ts:473`), build the `CalibrationItem[]` from the
     transcript: walk `transcript`, keep `t.role === 'candidate' && Number.isFinite(t.confidence)`, and map each to
     `{ confidence: t.confidence, correct: isCorrect(report.dimensions.correctness.score), hard: question.tier !== 'hard', format: 'voice' }`.
     (v1 binarizes against the single per-attempt correctness dimension; the main answer plus any confidence-rated
     follow-up turns spec-02 captured all contribute confidence. `format: 'voice'` keeps the interview bucket clean of
     `typein` contamination — gate #7, §3.2a.)
   - `const cal = scoreCalibration(items)` — **declared in the function body, not inside the transaction closure**, so it
     survives to the `return`.
   - In the finalize transaction (`interview.ts:475-522`): add `calibration: cal` to the attempt finalize `tx.set`
     (`:485-497`) **only when `cal.n > 0`** (Track-A null-safe — no confidence ⇒ no block, no trend fold). In the
     **same transaction**, read `users/{uid}/calibration/summary`, `foldAttemptIntoTrend(prior, items)`, recompute the
     denormals (`brier = brierSum/n`, `reliable = n >= MIN_CALIBRATION_N`, etc.) **on the pooled doc and on each
     `byFormat.<format>` bucket the fold touched**, and `tx.set(summaryRef, {...}, {merge:true})`. Reads before writes
     (the transaction already reads `stateRef`/`usageRef` — add `summaryRef` to the read phase).
   - **Extend `GradeInterviewOutput`** (`:320-323`) to `{ report: InterviewReport; attemptId: string; calibration:
     CalibrationResult }` and change the final `return { report, attemptId }` (`:524`) to
     `return { report, attemptId, calibration: cal }`. Import `CalibrationResult` from `./calibration`. spec-23 renders
     from this return (gate Issue #10). When `cal.n === 0`, `cal` is the all-null zero-n result — still returned (the
     report just shows no calibration for Track A); the attempt doc simply omits the block.
   → verify: `cd functions && <build>` passes; re-read the transaction — `summaryRef.get` is in the read phase, the new
     `tx.set`s in the write phase; `cal` is referenced at the `return` (in scope, not shadowed by the closure).

6. **Add the `calibration` rules block** to `firestore.rules` (after the `interviewState` block, `:113-115`):
   ```
   match /calibration/{docId} {
     allow read: if isOwner(uid);
     allow write: if false;
   }
   ```
   → verify: `grep -n "calibration" firestore.rules` shows the new block; pattern matches `interviewState` exactly.

7. **Add the `calibration` Firestore type** to `src/content/schema.ts` (additive; near the interview/progress
   schemas) so the client read is parsed, not raw:
   ```ts
   const FormatBucketSchema = z
     .object({
       n: z.number(),
       brier: z.number().nullable().optional(),
       overconfidence: z.number().nullable().optional(),
       reliable: z.boolean().optional(),
     })
     .loose()
   export const CalibrationSummarySchema = z
     .object({
       n: z.number(),
       brier: z.number().nullable().optional(),
       meanConfidence: z.number().nullable().optional(),
       accuracy: z.number().nullable().optional(),
       overconfidence: z.number().nullable().optional(),
       reliable: z.boolean().optional(), // n >= MIN_CALIBRATION_N (gate #7)
       byFormat: z
         .object({ voice: FormatBucketSchema.optional(), typein: FormatBucketSchema.optional(), binary: FormatBucketSchema.optional() })
         .loose()
         .optional(),
     })
     .loose() // brierSum etc. + server Timestamp arrive loose
   ```
   → verify: `tsx scripts/validate-fixtures.ts` still passes (no fixture references this; additive only).

8. **Create the client read selector `src/progress/calibrationRead.ts`** (lazy-Firestore, mirrors
   `recommend.ts:19-45`): `loadCalibrationSummary(uid) → CalibrationResult | null` — reads
   `users/{uid}/calibration/summary`, `safeParse`s with `CalibrationSummarySchema`, maps to `CalibrationResult`,
   returns `null` on missing/denied/offline (the same `try/catch → null` idiom as `loadMaxHintLevels`).
   → verify: `./node_modules/.bin/eslint src/progress/calibrationRead.ts` passes.

9. **Add analytics event** in `src/analytics/events.ts` (mirror the `interview_*` events listed in
   `docs/capstone-interview/README.md §Analytics`): `calibration_computed`
   `{ conceptId, n, brier, overconfidence }` — fired by the client after a graded attempt returns (no-op in dev).
   → verify: `grep -n calibration_computed src/analytics/events.ts`; lint passes.

10. **Run the full gate** (Definition of Done §10).

---

## 5. Two-track behavior

Calibration is **captured** on the quant-intensity gate (Track B `OR` `learningGoal === 'interview'`) and light/off
for Track A — but that gating lives in **spec-02 (capture)** and **spec-23 (surfacing)**, not here. This spec's
behavior:

| | Track A (gentle) | Quant-intensity gate (Track B OR `learningGoal === 'interview'`) |
|---|---|---|
| **Compute Brier** | Yes if confidence items exist; if spec-02 captured nothing, `scoreCalibration` returns `n:0`/all-null and we write **no** `calibration` block (and skip the trend fold). | Yes — full per-attempt + trend. |
| **Surface the score** | Not surfaced (spec-23 hides it for Track A). The number is still stored for analysis. | **Celebrated**: the report shows the Brier + the predicted-vs-measured delta; `hardItemCalibrationBonus` powers "you stayed humble and right on the brutal one" copy. spec-23 owns the rendering; this spec exposes `attempt.calibration` + the trend doc + `hardItemCalibrationBonus`. |

The compute path is **track-agnostic and null-safe** (no-confidence ⇒ no write), so Track A never gets a spurious
zero-n calibration block and the trend doc only accumulates real signal. The **track-aware surfacing hook** is the
data this spec exposes (`attempt.calibration`, `calibration/summary`, `hardItemCalibrationBonus`); the celebration is
spec-23.

---

## 6. Data / schema deltas

Only deltas; shared shapes live in README §4 Foundation C.

- **NEW Firestore doc** `users/{uid}/calibration/summary` (Function-written) — shape in §3.3. **New shared field set**
  — flagged for the consistency gate (§8).
- **NEW field on the interview attempt doc** `calibration: CalibrationResult` — written in `gradeInterview`'s finalize
  transaction (only when `cal.n > 0`). (The attempt doc is Function-owned; no rules change beyond the existing
  `interviews` block.)
- **NEW field on `GradeInterviewOutput`** `calibration: CalibrationResult` — `gradeInterview` now **returns** `cal`
  (was `{ report, attemptId }`), so spec-23 renders the calibration from the function return, not a re-read (README
  §4.5; gate Issue #10).
- **Review reps fold into the trend** — `submitReview` (spec-01 callable / spec-10 SM-2 body, `functions/src/review.ts`)
  folds `reviews/{cardId}.lastConfidence` + `result==='pass'` into `users/{uid}/calibration/summary` via
  `foldAttemptIntoTrend` (§3.3a; gate Issue #8). This spec owns the math + requirement; spec-10 owns the call site.
- **NEW exported constant** `CORRECTNESS_PASS_THRESHOLD = 4` + `isCorrect()` in `calibration.ts` (both copies) — the
  correctness-binarization source owned here, imported by spec-22/23 (README §7).
- **NEW exported constant** `MIN_CALIBRATION_N = 5` + `reliable` field on `CalibrationResult` and the trend doc (pooled
  + per `byFormat` bucket) — the min-n surfacing floor owned here, imported by **spec-23** (gate #7, §3.5).
- **NEW `format` dimension** `CalibrationItem.format?: 'binary'|'typein'|'voice'` + `byFormat` sub-summaries on
  `CalibrationResult`, the per-attempt block, and the trend doc — keeps the interview (`voice`) Brier/delta separable
  from `typein`/`binary` captures (gate #7, §3.2a). Interview items are `'voice'`; review reps `'typein'`/`'binary'`.
- **Privacy/retention:** `users/{uid}/calibration/**` + the per-attempt `calibration` block are a self-only,
  Function-written behavioral-inference profile; **deletion is owned by README §4.6's delete path** (gate #13, §8).
- **NEW Zod schema** `CalibrationSummarySchema` in `src/content/schema.ts` (additive; client read parse only).
- **NEW rules block** `match /calibration/{docId}` (owner read, client write denied).
- **No change** to `predictionDeltaInitial`, `ProgressDerived`, `SnapshotSchema`, or `INTERVIEW_REPORT_SCHEMA`.
  (`INTERVIEW_REPORT_SCHEMA` is the grader's structured output; calibration is computed **from** the report, not
  added **to** the grader schema — keeps the grader contract stable for spec-22/23.)
- **No `firestore.indexes.json` change** — the summary doc is read by id.

---

## 7. Tests

**Unit — `src/progress/calibration.test.ts`** (vitest; pure, no Firestore):
- `brierScore`: perfect calibration (`confidence 1 + correct`, `confidence 0 + wrong`) → `0`; maximally wrong-and-sure
  (`confidence 1 + wrong`) → `1`; coin-flip (`confidence 0.5`, any outcome) → `0.25`; `[]` → `null`; a `NaN`
  confidence is dropped (not poisoning the mean).
- `scoreCalibration`: `overconfidence > 0` when meanConfidence > accuracy (overconfident); `< 0` when underconfident;
  `n:0` all-null on `[]`; confidence clamped (a `1.4` is treated as `1`).
- `hardItemCalibrationBonus`: `null` when no `hard` items; ~`1` when low-confidence-on-hard or high-confidence-correct
  on hard; low when high-confidence-wrong on hard.
- `foldAttemptIntoTrend`: folding two attempts yields the same mean Brier as scoring all items at once (running mean
  == batch mean); empty items leave the prior unchanged; folding a single review-rep item (the §3.3a Daily-Review path)
  into a prior interview-derived trend yields the combined mean (review reps + interview attempts share one trend).
- `isCorrect` / `CORRECTNESS_PASS_THRESHOLD`: `isCorrect(4)`/`isCorrect(5)` true; `isCorrect(3)` and below false;
  `CORRECTNESS_PASS_THRESHOLD === 4` (locks the constant spec-22/23 import).
- `MIN_CALIBRATION_N` / `reliable` (gate #7): `MIN_CALIBRATION_N === 5` (locks the constant spec-23 imports);
  `scoreCalibration(items with n=4).reliable === false`; `scoreCalibration(items with n=5).reliable === true`; an
  unreliable result still returns a finite `brier`/`overconfidence` (gating is surfacing-only, not computation —
  asserts the preserved "Brier still computed below the floor" framing).
- `format` / `byFormat` (gate #7): a mixed list of `voice` and `typein` items yields `byFormat.voice` and
  `byFormat.typein` each with its own `n`/`brier`/`overconfidence`; a `typein`-only contamination case — many
  0.5-floored `typein` items plus a few well-calibrated `voice` items — leaves `byFormat.voice.brier` near the voice
  items' true Brier and **not** dragged toward `0.25` by the type-ins (the core anti-contamination assertion);
  `byFormat` is `undefined` when no item carries a `format`; an item with no `format` counts toward the pooled total but
  no bucket.
- `foldAttemptIntoTrend` per-format (gate #7): folding `voice` then `typein` items yields `byFormat.voice` and
  `byFormat.typein` sub-sums whose per-bucket mean Brier equals scoring each format's items alone (running == batch, per
  format); the pooled sums still equal the all-items batch; a per-bucket `reliable` recomputed from `byFormat.voice.n`
  is independent of the pooled `n` (assert voice unreliable while pool reliable).

**Unit — `functions/src/calibration.test.ts`** (mirrored): a **parity test** asserting the functions copy gives the
same numbers as the `src/` copy on a fixed vector, and that the two files are byte-identical below their header (guards
drift between the two copies). Include the same `CORRECTNESS_PASS_THRESHOLD` assertion so a threshold change in one copy
fails CI.

**Rules — `tests/firestore.rules.test.ts`** (mirror the interview rules tests): owner can **read**
`users/{uid}/calibration/summary`; **client write is denied**; a non-owner cannot read.

**`/dev` manual check.** No Firebase/Java needed for the pure module. For the wired path: there is no `/dev`
calibration surface in v1 (surfacing is spec-23). Verify the maths via the unit tests and a one-off node REPL of
`scoreCalibration` if desired. (If spec-23's `/dev/interview` report harness exists, confirm `attempt.calibration`
renders there once spec-23 lands.)

**Fixture validation.** `tsx scripts/validate-fixtures.ts` must stay green (this spec adds no fixture requirements).

---

## 8. Foolproofing (README §8)

- **R4 — Schema migrations are permanent; index file is empty; progression fields route through a Function.**
  - The learner trend is **Function-written** (`gradeInterview`), client read-only via the new `calibration` rules
    block — never a client write (it feeds the celebrated score, so it must be trusted). ✔
  - Field shapes for `users/{uid}/calibration/summary` and the attempt `calibration` block are **frozen here** (§3.3)
    before coding. ✔
  - **No new index** — the summary doc is read by id; no `dueAt`/`schemaId` query. ✔
- **R5 — Missing foundations silently degrade.** Step 1 hard-stops if spec-02's confidence capture is absent; the
  compute path is null-safe (no confidence ⇒ no write) so a partial spec-02 cannot write a garbage zero-n score. ✔
- **D11 / hireSignal** — correctness is binarized via `isCorrect(report.dimensions.correctness.score)`, **never** from
  `hireSignal`, so spec-23's hire-signal removal does not break calibration. The binarization constant is owned here and
  imported by spec-22/23 (no re-derivation drift). ✔
- **Two-copy drift** — `functions/src/calibration.ts` is a **byte-identical** mirror (README §5); the parity test (§7)
  asserts identical numbers + byte-identity, guarding drift. ✔
- **Return reaches the report (gate Issue #10)** — `cal` is computed before `runTransaction` so it stays in scope and is
  returned in `GradeInterviewOutput.calibration`; spec-23 renders from the return, not a re-read of the attempt doc. ✔
- **All signal counts (gate Issue #8)** — Daily-Review reps fold `lastConfidence` into the same trend doc (§3.3a), so
  Brier reflects review reps and not only interview attempts. ✔
- **Format isolation (gate #7)** — every item carries `format`; the interview (`voice`) Brier/delta is kept in its own
  `byFormat.voice` bucket so a 0.5-floored `typein` cannot contaminate the interview calibration delta spec-23
  surfaces. ✔
- **Min-n suppression (gate #7)** — `reliable = n >= MIN_CALIBRATION_N` is computed pooled and per-format; spec-23 holds
  the number/celebration until the relevant bucket clears the floor; below it the trend still accumulates (numbers are
  stored, not surfaced). ✔

### Privacy & retention (gate #13)

`users/{uid}/calibration/summary` (and the per-attempt `calibration` block) is a **behavioral-inference profile** — it
records how a learner's stated confidence diverges from their realized correctness (overconfidence/underconfidence,
per-format). Treat it accordingly:

- **Self-only.** Owner read, **client write denied** (the `calibration` rules block, §3 step 6). It is never exposed to
  other users, instructors, or any hire/verdict surface (D11 removed the hire signal; calibration must not become a
  back-door judgment). ✔
- **Function-written.** Every write — interview fold, review-rep fold, denormal recompute — is a Function-only
  transaction. The client cannot mutate or fabricate it. ✔
- **Deletion requires a Function.** Because the doc is client-write-denied, a learner cannot delete their own
  calibration profile from the client; **deletion is part of the account-data delete path, which is a Function**.
  **README §4.6 owns that delete path** (account/learning-data deletion + retention policy) — this spec does not define
  it; it only registers `users/{uid}/calibration/**` and the per-attempt `calibration` block as data the §4.6 delete
  path must purge. (If §4.6 does not yet exist in the README, this is the cross-ref that flags it must.) ✔

## 9. NEW shared field (now folded into README §4.5)

This spec introduces the `users/{uid}/calibration/summary` aggregate doc, the per-attempt `calibration` block, the
returned `GradeInterviewOutput.calibration`, and the owned binarization constant. README §4.5 now records the
calibration store row (`GradeInterviewOutput.calibration` returned, not just written; consumer **spec-23**) and §4
Foundation A lists `reviews/{cardId}.lastConfidence` as fed to spec-12. For the consistency gate:
- `users/{uid}/calibration/summary` shape (§3.3) — consumed by **spec-23** (report delta); fed by both interview
  attempts (§3.2) and Daily-Review reps (§3.3a, gate Issue #8).
- attempt-doc `calibration: CalibrationResult` **and** `GradeInterviewOutput.calibration` returned (README §4.5; gate
  Issue #10) — consumed by **spec-23** (renders from the function return).
- `Turn.confidence?: number` (README §4.5; added by spec-02) — **read here** as `transcript[i].confidence`.
- `CORRECTNESS_PASS_THRESHOLD = 4` / `isCorrect()` — the binarization source owned here, imported by **spec-22/23**
  (README §7). `correct := isCorrect(report.dimensions.correctness.score)`.
- `MIN_CALIBRATION_N = 5` + `CalibrationResult.reliable` / per-bucket `reliable` — the min-n surfacing floor owned here,
  imported by **spec-23** (gate #7, §3.5); spec-23 holds the number/celebration until the relevant bucket is reliable.
- `CalibrationItem.format` + `CalibrationResult.byFormat` + the trend doc's `byFormat` — the format-isolation contract
  (gate #7, §3.2a); **spec-23** reads `byFormat.voice` for the interview delta, not the pooled `overconfidence`.
- **Privacy:** `users/{uid}/calibration/**` + the per-attempt `calibration` block are self-only, Function-written; their
  **deletion is owned by README §4.6's delete path** (gate #13).

## 10. Definition of Done

- `src/progress/calibration.ts` (+ byte-identical `functions/src/calibration.ts`) + `src/progress/calibrationRead.ts`
  created; `gradeInterview` writes per-attempt `calibration` + folds the trend doc in its finalize transaction **and
  RETURNS `calibration` in `GradeInterviewOutput`**; `firestore.rules` has the `calibration` block;
  `CalibrationSummarySchema` added; `CORRECTNESS_PASS_THRESHOLD`/`isCorrect` exported for spec-22/23.
- `./node_modules/.bin/vitest run src/progress/calibration.test.ts` (and `functions/src/calibration.test.ts` if
  mirrored) green; the rules test green.
- `tsx scripts/validate-fixtures.ts` passes.
- `./node_modules/.bin/eslint .` clean on every touched file (`src/progress/calibration.ts`,
  `src/progress/calibrationRead.ts`, `src/content/schema.ts`, `src/analytics/events.ts`,
  `functions/src/interview.ts`, `functions/src/calibration.ts`).
- Functions build (`cd functions && <build>`) passes.
- `attempt.calibration` and `users/{uid}/calibration/summary` are readable by spec-23; the predicted-vs-measured delta
  (`overconfidence`) is exposed at both granularities, **pooled and per-format** (`byFormat.voice` for the interview
  delta).
- **Gate #7 (format isolation):** every `CalibrationItem` carries `format`; interview items are `'voice'`, review reps
  `'typein'`/`'binary'`; the trend doc and per-attempt block carry `byFormat`; the contamination test (§7) shows a pool
  of 0.5-floored `typein` items does not move `byFormat.voice.brier`.
- **Gate #7 (min-n):** `MIN_CALIBRATION_N = 5` exported from `calibration.ts` (both copies, parity-tested); `reliable`
  is set pooled and per-bucket; the spec-23 hand-off (§3.5) is recorded; the running-trend + per-attempt-informational
  framing is preserved (numbers compute/store below the floor, only surfacing is gated).
- **Gate #13 (privacy/retention):** the calibration profile is documented as self-only, Function-written, with
  deletion cross-referenced to README §4.6's delete path (§8).
