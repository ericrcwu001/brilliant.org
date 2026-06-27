// Program-level efficacy metrics (spec-04 §3.1). PURE — runs over an in-memory
// row-set (Firebase Analytics → BigQuery export rows OR an offline Firestore read;
// the data source is swappable behind these formulas, see docs note). Imports
// NOTHING from firebase: it is the single source of truth for the metric formulas
// and is unit-tested in the node Vitest env (matches mastery.ts / retrievalRep.ts /
// scheduling.ts).
//
// It READS only fields spec-01/02/03/12 already persist and defines NO new learning
// signal (R2 — consume, don't fork): the server-graded review outcome (spec-01),
// the milestone `kind` (spec-11), and spec-12's already-computed `overconfidence`
// (never recomputes Brier). The whole module measures DELAYED retrieval + transfer,
// not in-session fluency (the §2 thesis / R9).
//
// Numerator/denominator hygiene: every rate returns `null` (NOT 0) below the
// minimum-n floor, mirroring spec-12's `reliable` gate so a 1-card cohort cannot
// read as "0% pass." The cohort enum is co-defined in README §4.5; the control arm
// is 'holdout' — there is NO 'control' literal anywhere.

export const MIN_EFFICACY_N = 20

// Cohort enum co-defined in README §4.5. Control arm = 'holdout'; NO 'control'.
export type Cohort = 'treatment' | 'holdout'

// ONE ROW PER REVIEW EVENT — the per-review outcome event spec-01 fires on each
// submitReview — NOT the reviews/{cardId} snapshot. Carries the server-graded
// `result` (R13) + the ELAPSED interval for THAT review + a timestamp, so the
// metric can identify each card's FIRST delayed review. (The card doc is a
// current-state snapshot: `lastResult` is only the latest result, and reps/lapses
// are not a review counter — spec-01 resets reps=0 on FAIL — so a snapshot cannot
// recover the first review's result.)
export type ReviewEventRow = {
  cardId: string
  cohort?: Cohort
  intervalDays: number // ELAPSED interval for this review event (days)
  result: 'pass' | 'fail' // server-graded (R13)
  isTransfer: boolean
  ts: number // epoch ms; ordering (first-per-card) + window filter
}

// One row per milestone_earned event (spec-11 stamps `kind`; spec-04 §3.2 widens it).
export type MilestoneRow = {
  cohort?: Cohort
  kind: 'silver' | 'delayed_gold' | 'transfer_gold'
  ts: number
}

// One row per reliable-or-not learner's calibration/summary (spec-12). `overconfidence`
// is spec-12's already-computed `meanConfidence − accuracy` (taken as INPUT, never
// recomputed here — R2).
export type CalibrationRow = {
  cohort?: Cohort
  overconfidence: number | null
  reliable: boolean
}

// One row per surfaced/reviewed due card (queue-completion guardrail, §3.1 metric 5):
// `surfaced` from review_recommended_shown; `reviewed` from retrieval_rep source==='review'.
export type QueueRow = { cohort?: Cohort; surfaced: number; reviewed: number }

// One row per retrieval_rep event for an active learner (reps/week guardrail, §3.1
// metric 5 / spec-03 informational stat). `uid` groups reps per learner; `ts` windows.
export type RetrievalRepRow = { cohort?: Cohort; uid: string; ts: number }

// First delayed (>=1d ELAPSED) review event per card, by earliest ts. This is WHY
// the metric reads the event stream, not the snapshot: a snapshot can report the
// latest review's result, never the FIRST review's. (No reps+lapses disambiguation
// — that is invalid against spec-01's counter semantics.)
function firstDelayedPerCard(rows: ReviewEventRow[]): ReviewEventRow[] {
  const earliest = new Map<string, ReviewEventRow>()
  for (const r of rows) {
    if (r.intervalDays < 1) continue
    const prev = earliest.get(r.cardId)
    if (!prev || r.ts < prev.ts) earliest.set(r.cardId, r)
  }
  return [...earliest.values()]
}

// §3.1 metric 1 — headline durability. Fraction of FIRST delayed SR reviews that
// pass. Null below the floor.
export function delayedRetrievalPassRate(
  rows: ReviewEventRow[],
): number | null {
  const firstDelayed = firstDelayedPerCard(rows)
  if (firstDelayed.length < MIN_EFFICACY_N) return null
  const passes = firstDelayed.filter((r) => r.result === 'pass').length
  return passes / firstDelayed.length
}

// §3.1 metric 2 — headline transferability. Same as (1) but only held-out transfer
// cards (isTransfer===true; the Track-B gold gate's empirical pass rate, spec-11).
export function transferPassRate(rows: ReviewEventRow[]): number | null {
  return delayedRetrievalPassRate(rows.filter((r) => r.isTransfer))
}

// §3.1 metric 3 — gold-mint rate. (delayed_gold + transfer_gold) over silver. A
// cohort with silver but zero gold returns 0 (the D14 motivation-cliff signal),
// distinct from null (no data).
export function goldMintRate(rows: MilestoneRow[]): number | null {
  const silver = rows.filter((r) => r.kind === 'silver').length
  if (silver < MIN_EFFICACY_N) return null
  const gold = rows.filter(
    (r) => r.kind === 'delayed_gold' || r.kind === 'transfer_gold',
  ).length
  return gold / silver
}

// §3.1 metric 4 — calibration cohort overconfidence. Mean of spec-12's already-
// computed `overconfidence` over RELIABLE learners only (n >= MIN_CALIBRATION_N,
// surfaced as reliable===true). spec-12 owns Brier; this only AGGREGATES the delta.
export function cohortOverconfidence(rows: CalibrationRow[]): number | null {
  const reliable = rows.filter((r) => r.reliable && r.overconfidence != null)
  if (reliable.length < MIN_EFFICACY_N) return null
  return (
    reliable.reduce((s, r) => s + (r.overconfidence as number), 0) /
    reliable.length
  )
}

// §3.1 metric 5 — queue-completion guardrail. dueCardsReviewed / dueCardsSurfaced.
// Floor on SURFACED count (the denominator), null below it.
export function queueCompletionRate(rows: QueueRow[]): number | null {
  const surfaced = rows.reduce((s, r) => s + r.surfaced, 0)
  if (surfaced < MIN_EFFICACY_N) return null
  const reviewed = rows.reduce((s, r) => s + r.reviewed, 0)
  return reviewed / surfaced
}

// §3.1 metric 5 — retrieval-reps/week guardrail. Mean reps per active learner over
// a 7-day window (caller windows the rows to 7 days). Floor on the number of active
// learners; null below it.
export function retrievalRepsPerLearner(rows: RetrievalRepRow[]): number | null {
  const byLearner = new Map<string, number>()
  for (const r of rows) byLearner.set(r.uid, (byLearner.get(r.uid) ?? 0) + 1)
  if (byLearner.size < MIN_EFFICACY_N) return null
  let total = 0
  for (const n of byLearner.values()) total += n
  return total / byLearner.size
}

// §3.4 A-B hook — run the SAME pure metric per cohort, then difference. `delta` is
// the headline efficacy result (treatment − holdout), null if EITHER arm is below
// the floor (no spurious delta). Rows with cohort===undefined are EXCLUDED from
// both arms (fail-absent, §3.4) — never silently folded into treatment. The control
// arm is 'holdout' (README §4.5); a 'control' key would never match spec-05 data.
export function abDelta<T>(
  rows: T[],
  cohortOf: (r: T) => Cohort | undefined,
  metric: (rs: T[]) => number | null,
): { holdout: number | null; treatment: number | null; delta: number | null } {
  const holdout = metric(rows.filter((r) => cohortOf(r) === 'holdout'))
  const treatment = metric(rows.filter((r) => cohortOf(r) === 'treatment'))
  const delta =
    holdout != null && treatment != null ? treatment - holdout : null
  return { holdout, treatment, delta }
}
