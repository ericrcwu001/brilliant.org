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

/** One graded answer's calibration input. `confidence` already normalized to [0,1]
 *  by spec-02's scale; `correct` is the binary grade outcome for that answer. */
export interface CalibrationItem {
  confidence: number // [0,1]
  correct: boolean
  hard?: boolean // true for harder/brutal-tier items; powers the reward weighting
}

export interface CalibrationResult {
  n: number
  brier: number | null // null when n === 0
  meanConfidence: number | null
  accuracy: number | null
  overconfidence: number | null // meanConfidence - accuracy
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

/** Full calibration result (Brier + the predicted-vs-measured signals). */
export function scoreCalibration(items: CalibrationItem[]): CalibrationResult {
  const valid = items.filter((it) => Number.isFinite(it.confidence))
  const n = valid.length
  if (n === 0) return { n: 0, brier: null, meanConfidence: null, accuracy: null, overconfidence: null }
  const meanConfidence = valid.reduce((a, it) => a + clamp01(it.confidence), 0) / n
  const accuracy = valid.reduce((a, it) => a + (it.correct ? 1 : 0), 0) / n
  return {
    n,
    brier: brierScore(valid),
    meanConfidence,
    accuracy,
    overconfidence: meanConfidence - accuracy,
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

/** Combine a prior aggregate with a new attempt's items into an updated running
 *  mean Brier + counts. Pure so the Function can call it and tests can assert it.
 *  Uses a count-weighted running mean (not re-deriving from raw history — we do
 *  not store every item). */
export function foldAttemptIntoTrend(
  prior: { n: number; brierSum: number; confidenceSum: number; correctSum: number },
  items: CalibrationItem[],
): { n: number; brierSum: number; confidenceSum: number; correctSum: number } {
  const valid = items.filter((it) => Number.isFinite(it.confidence))
  const addBrier = valid.reduce((a, it) => a + (clamp01(it.confidence) - (it.correct ? 1 : 0)) ** 2, 0)
  const addConf = valid.reduce((a, it) => a + clamp01(it.confidence), 0)
  const addCorrect = valid.reduce((a, it) => a + (it.correct ? 1 : 0), 0)
  return {
    n: prior.n + valid.length,
    brierSum: prior.brierSum + addBrier,
    confidenceSum: prior.confidenceSum + addConf,
    correctSum: prior.correctSum + addCorrect,
  }
}
```

> **Why sums in the trend, not a list.** Storing every `CalibrationItem` ever would grow unbounded and leak
> per-answer history into a doc the client reads. A count-weighted running mean (sums + n) is O(1) to update, exact
> for the mean Brier, and the **server is the only writer**, so the running sums cannot be tampered with.

A **byte-identical mirror** of the pure module is needed in `functions/` because the Functions package compiles
separately and does not import from `src/` (same split the interview functions use — `functions/src/interviewPack.ts`
mirrors `src/content/interviewPack.ts`). Per README §5 the two files are a **byte-mirror src↔functions**: create
**`functions/src/calibration.ts`** as a byte-for-byte copy of everything in §3.1 — `CalibrationItem`,
`CalibrationResult`, `CORRECTNESS_PASS_THRESHOLD`, `isCorrect`, `brierScore`, `scoreCalibration`,
`hardItemCalibrationBonus`, `foldAttemptIntoTrend` (no React/Firestore imports). `CalibrationResult` from the
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

Compute `const cal = scoreCalibration([{confidence, correct, hard}])` over the attempt's rated answers (main
question + confidence-rated follow-ups, if spec-02 captured any), and write a **`calibration: cal` block onto the
attempt doc** in the same finalize transaction (`interview.ts:475-522`). Also fold the attempt into the learner trend
doc in the same transaction.

**`cal` is RETURNED, not only written (gate Issue #10).** `gradeInterview`'s return is currently
`{ report, attemptId }` (`functions/src/interview.ts:524`); add `calibration: cal` to it so the type becomes
`GradeInterviewOutput = { report; attemptId; calibration: CalibrationResult }` (`:320-323`). spec-23's report renders
from the **function return**, not by re-reading the attempt doc, so `cal` must be in scope at the `return` — compute it
**before** `runTransaction` (not inside the closure) so the value survives the transaction and reaches the return.

`hard` = the drawn question's tier is `harder` or `brutal`, i.e. `question.tier !== 'hard'` (`Question.tier` is
`'hard'|'harder'|'brutal'` — `functions/src/interviewPack.ts:33`; `question` is loaded at grade time —
`interview.ts:434-436`).

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
  n:             number     // count of graded answers folded in (all sources)
  brierSum:      number     // Σ (confidence - correct)^2  — divide by n for mean Brier
  confidenceSum: number     // Σ confidence
  correctSum:    number     // Σ correct (0/1)
  // convenience denormals, recomputed on each write (client renders without dividing):
  brier:         number     // brierSum / n
  meanConfidence:number     // confidenceSum / n
  accuracy:      number     // correctSum / n
  overconfidence:number     // meanConfidence - accuracy  ← predicted-vs-measured delta (spec-23)
  updatedAt:     Timestamp
}
```

### 3.3a Daily-Review reps fold into the trend (gate Issue #8)

The trend doc must reflect **all** calibration signal, not just interview attempts — Daily-Review reps carry their own
confidence. Foundation A's review card stores `reviews/{cardId}.lastConfidence: number | null` (README §4 Foundation A;
the D6 third capture site, listed in §4.5 with consumer **12**). Each `submitReview` (spec-01 declares the callable;
spec-10 fills the SM-2 advance body — `functions/src/review.ts`) must, **in the same transaction that advances the
card**, fold that rep into `users/{uid}/calibration/summary` so review reps count toward Brier:

- Build one `CalibrationItem` from the rep: `{ confidence: card.lastConfidence (the value just written), correct:
  result === 'pass' }`. Skip the fold when `confidence` is `null`/absent (Track A passes none — null-safe, same as the
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
- **Per-attempt:** `attempt.calibration.overconfidence` (+ `brier`, `n`, `meanConfidence`, `accuracy`) on the
  finalized attempt doc — spec-23 reads it from the same attempt it already loads for the report.
- **Trend:** `users/{uid}/calibration/summary.overconfidence` (+ `brier`) — spec-23 reads it for "your calibration
  over time" context.

A tiny **client read selector** `src/progress/calibrationRead.ts` (NEW, lazy-Firestore, mirrors
`recommend.ts:19-45`) exposes `loadCalibrationSummary(uid) → CalibrationResult | null` so spec-23 (and any surface)
reads through one place rather than touching Firestore directly.

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

4b. **Create `functions/src/calibration.ts`** — **byte-identical** copy of §3.1: `CalibrationItem`,
   `CalibrationResult`, `CORRECTNESS_PASS_THRESHOLD`, `isCorrect`, `brierScore`, `scoreCalibration`,
   `hardItemCalibrationBonus`, `foldAttemptIntoTrend` (per README §5 byte-mirror; default to copying even if an import
   alias exists). Add a one-line header comment: `// Mirror of src/progress/calibration.ts — keep BYTE-IDENTICAL (functions
   compiles separately; parity test guards drift).`
   → verify: `cd functions && ./node_modules/.bin/tsc --noEmit` (or the repo's functions build) passes; the two files
     are byte-identical below their header comment (`diff <(tail -n +2 functions/src/calibration.ts) <(tail -n +2 src/progress/calibration.ts)` empty).

5. **Wire per-attempt + trend write + RETURN into `gradeInterview`** (`functions/src/interview.ts`):
   - Import `scoreCalibration`, `foldAttemptIntoTrend`, `isCorrect` from `./calibration` (or `../../src/...` per step 2).
   - **Before** `runTransaction` (after the grade succeeds, ~`interview.ts:473`), build the `CalibrationItem[]` from the
     transcript: walk `transcript`, keep `t.role === 'candidate' && Number.isFinite(t.confidence)`, and map each to
     `{ confidence: t.confidence, correct: isCorrect(report.dimensions.correctness.score), hard: question.tier !== 'hard' }`.
     (v1 binarizes against the single per-attempt correctness dimension; the main answer plus any confidence-rated
     follow-up turns spec-02 captured all contribute confidence.)
   - `const cal = scoreCalibration(items)` — **declared in the function body, not inside the transaction closure**, so it
     survives to the `return`.
   - In the finalize transaction (`interview.ts:475-522`): add `calibration: cal` to the attempt finalize `tx.set`
     (`:485-497`) **only when `cal.n > 0`** (Track-A null-safe — no confidence ⇒ no block, no trend fold). In the
     **same transaction**, read `users/{uid}/calibration/summary`, `foldAttemptIntoTrend(prior, items)`, recompute the
     denormals (`brier = brierSum/n`, etc.), and `tx.set(summaryRef, {...}, {merge:true})`. Reads before writes (the
     transaction already reads `stateRef`/`usageRef` — add `summaryRef` to the read phase).
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
   export const CalibrationSummarySchema = z
     .object({
       n: z.number(),
       brier: z.number().nullable().optional(),
       meanConfidence: z.number().nullable().optional(),
       accuracy: z.number().nullable().optional(),
       overconfidence: z.number().nullable().optional(),
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
  (`overconfidence`) is exposed at both granularities.
