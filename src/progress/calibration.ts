// src/progress/calibration.ts (spec-12)
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
//
// PURE + dependency-free (no React/Firestore) so it is node-testable, mirroring
// recommend.ts's pure tail. functions/src/calibration.ts is a BYTE-IDENTICAL
// mirror (functions compiles separately); a parity test guards drift.

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
 *  must hide or label it. Owned by spec-12; imported by spec-23's hand-off.
 *  Set to 5 (lower bound of the 5–10 range): per-attempt interview Brier is over a
 *  tiny n by design, so the trend doc is the first place this gate clears. */
export const MIN_CALIBRATION_N = 5

export interface CalibrationResult {
  n: number
  brier: number | null // null when n === 0
  meanConfidence: number | null
  accuracy: number | null
  overconfidence: number | null // meanConfidence - accuracy
  /** false until n >= MIN_CALIBRATION_N. When false, brier/overconfidence are
   *  informational only — spec-23 must NOT surface or celebrate them. */
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
 *  *celebrated* Track-B surfacing copy, NEVER to alter the Brier number.
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
  prior: {
    n: number
    brierSum: number
    confidenceSum: number
    correctSum: number
    byFormat?: Partial<Record<CalibrationFormat, TrendSums>>
  },
  items: CalibrationItem[],
): {
  n: number
  brierSum: number
  confidenceSum: number
  correctSum: number
  byFormat: Partial<Record<CalibrationFormat, TrendSums>>
} {
  const valid = items.filter((it) => Number.isFinite(it.confidence))
  const pooled = addItemsToSums(prior, valid)
  const byFormat: Partial<Record<CalibrationFormat, TrendSums>> = { ...(prior.byFormat ?? {}) }
  for (const f of new Set(valid.map((it) => it.format).filter((x): x is CalibrationFormat => !!x))) {
    byFormat[f] = addItemsToSums(
      byFormat[f] ?? EMPTY_SUMS,
      valid.filter((it) => it.format === f),
    )
  }
  return { ...pooled, byFormat }
}
