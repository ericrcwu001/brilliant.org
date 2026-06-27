import { describe, it, expect } from 'vitest'
import {
  MIN_EFFICACY_N,
  delayedRetrievalPassRate,
  transferPassRate,
  goldMintRate,
  cohortOverconfidence,
  queueCompletionRate,
  retrievalRepsPerLearner,
  abDelta,
  type Cohort,
  type ReviewEventRow,
  type MilestoneRow,
  type CalibrationRow,
} from './efficacy'

// Fixture builders — small inline row-sets matching the shapes BigQuery / the
// offline export would yield (spec-04 §5).
const review = (
  cardId: string,
  result: 'pass' | 'fail',
  o: Partial<ReviewEventRow> = {},
): ReviewEventRow => ({
  cardId,
  intervalDays: 3,
  result,
  isTransfer: false,
  ts: 1000,
  ...o,
})

// N distinct cards, each one first-delayed review; `passes` of them pass.
function cards(passes: number, total: number, o: Partial<ReviewEventRow> = {}) {
  return Array.from({ length: total }, (_, i) =>
    review(`c${i}`, i < passes ? 'pass' : 'fail', o),
  )
}

describe('delayedRetrievalPassRate (§3.1 metric 1)', () => {
  it('returns the exact first-delayed pass ratio over >= MIN_EFFICACY_N cards', () => {
    const rows = cards(15, 25) // 25 distinct cards, 15 pass
    expect(delayedRetrievalPassRate(rows)).toBe(15 / 25)
  })

  it('excludes reviews with intervalDays < 1 from BOTH numerator and denominator', () => {
    // 25 genuine delayed cards (15 pass) + same-session re-asks that must not count.
    const delayed = cards(15, 25)
    const sameSession = Array.from({ length: 10 }, (_, i) =>
      review(`s${i}`, 'pass', { intervalDays: 0 }),
    )
    expect(delayedRetrievalPassRate([...delayed, ...sameSession])).toBe(15 / 25)
  })

  it('counts each card by its EARLIEST delayed event — a later pass does NOT flip a first-review fail', () => {
    // 24 clean passing cards + one card whose FIRST delayed review failed but a
    // later review passed. Earliest-by-ts must keep it a fail (guards first-vs-latest).
    const clean = cards(24, 24)
    const flaky = [
      review('flaky', 'fail', { ts: 100 }), // first delayed review: FAIL
      review('flaky', 'pass', { ts: 200 }), // later review: PASS (must be ignored)
    ]
    // 25 distinct cards, 24 pass → first delayed of `flaky` is a fail.
    expect(delayedRetrievalPassRate([...clean, ...flaky])).toBe(24 / 25)
  })
})

describe('min-n floor (§3.1 hygiene)', () => {
  it('returns null (NOT 0) below MIN_EFFICACY_N', () => {
    expect(MIN_EFFICACY_N).toBe(20)
    const rows = cards(0, MIN_EFFICACY_N - 1) // 19 cards, all fail
    expect(delayedRetrievalPassRate(rows)).toBeNull()
    // sanity: a 1-card 0% must not read as 0
    expect(delayedRetrievalPassRate([review('one', 'fail')])).toBeNull()
  })
})

describe('transferPassRate (§3.1 metric 2)', () => {
  it('counts only isTransfer===true rows', () => {
    const nonTransfer = cards(5, 30, { isTransfer: false }) // ignored
    const transfer = cards(18, 25, { isTransfer: true }).map((r, i) => ({
      ...r,
      cardId: `t${i}`,
    }))
    expect(transferPassRate([...nonTransfer, ...transfer])).toBe(18 / 25)
  })

  it('returns null when the transfer subset is below the floor even if total clears it', () => {
    const nonTransfer = cards(20, 30, { isTransfer: false }) // clears floor alone
    const transfer = cards(3, 5, { isTransfer: true }).map((r, i) => ({
      ...r,
      cardId: `t${i}`,
    })) // only 5 transfer cards
    expect(transferPassRate([...nonTransfer, ...transfer])).toBeNull()
  })
})

describe('goldMintRate (§3.1 metric 3)', () => {
  const mint = (kind: MilestoneRow['kind']): MilestoneRow => ({ kind, ts: 1 })

  it('computes (delayed_gold + transfer_gold) / silver', () => {
    const rows = [
      ...Array.from({ length: 25 }, () => mint('silver')),
      ...Array.from({ length: 6 }, () => mint('delayed_gold')),
      ...Array.from({ length: 4 }, () => mint('transfer_gold')),
    ]
    expect(goldMintRate(rows)).toBe(10 / 25)
  })

  it('returns 0 (the motivation-cliff signal) when silver clears the floor but zero gold — distinct from null', () => {
    const rows = Array.from({ length: 25 }, () => mint('silver'))
    expect(goldMintRate(rows)).toBe(0)
  })

  it('returns null when silver is below the floor', () => {
    const rows = [
      ...Array.from({ length: 10 }, () => mint('silver')),
      ...Array.from({ length: 5 }, () => mint('delayed_gold')),
    ]
    expect(goldMintRate(rows)).toBeNull()
  })
})

describe('cohortOverconfidence (§3.1 metric 4 — consumes spec-12, never recomputes)', () => {
  const cal = (
    overconfidence: number | null,
    reliable: boolean,
  ): CalibrationRow => ({ overconfidence, reliable })

  it('averages only reliable rows with non-null overconfidence; drops unreliable', () => {
    const reliable = Array.from({ length: 20 }, () => cal(0.1, true)) // mean 0.1
    const unreliable = [cal(0.9, false), cal(0.9, false)] // dropped
    const nullVal = [cal(null, true)] // dropped (no computed delta)
    expect(
      cohortOverconfidence([...reliable, ...unreliable, ...nullVal]),
    ).toBeCloseTo(0.1)
  })

  it('returns null below the floor', () => {
    const rows = Array.from({ length: 19 }, () => cal(0.1, true))
    expect(cohortOverconfidence(rows)).toBeNull()
  })
})

describe('guardrails (§3.1 metric 5)', () => {
  it('queueCompletionRate = reviewed / surfaced, null below the surfaced floor', () => {
    expect(
      queueCompletionRate([
        { surfaced: 30, reviewed: 18 },
        { surfaced: 10, reviewed: 5 },
      ]),
    ).toBe(23 / 40)
    expect(queueCompletionRate([{ surfaced: 10, reviewed: 3 }])).toBeNull()
  })

  it('retrievalRepsPerLearner = mean reps per active learner, null below the learner floor', () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({
      uid: `u${i}`,
      ts: 1,
    }))
    // 20 learners, 1 rep each → mean 1
    expect(retrievalRepsPerLearner(rows)).toBe(1)
    // give one learner an extra rep: 21 reps / 20 learners
    expect(
      retrievalRepsPerLearner([...rows, { uid: 'u0', ts: 2 }]),
    ).toBe(21 / 20)
    // below floor (19 learners)
    expect(
      retrievalRepsPerLearner(rows.slice(0, 19)),
    ).toBeNull()
  })
})

describe('abDelta (§3.4 holdout vs treatment)', () => {
  const cohortOf = (r: ReviewEventRow): Cohort | undefined => r.cohort

  it('returns {holdout, treatment, delta} with delta = treatment − holdout when both present', () => {
    const holdout = cards(10, 25, { cohort: 'holdout' }).map((r, i) => ({
      ...r,
      cardId: `h${i}`,
    })) // 10/25 = 0.4
    const treatment = cards(20, 25, { cohort: 'treatment' }).map((r, i) => ({
      ...r,
      cardId: `x${i}`,
    })) // 20/25 = 0.8
    const out = abDelta(
      [...holdout, ...treatment],
      cohortOf,
      delayedRetrievalPassRate,
    )
    expect(out.holdout).toBeCloseTo(0.4)
    expect(out.treatment).toBeCloseTo(0.8)
    expect(out.delta).toBeCloseTo(0.4)
  })

  it('delta is null if EITHER cohort is below the floor (no spurious delta)', () => {
    const holdout = cards(2, 5, { cohort: 'holdout' }).map((r, i) => ({
      ...r,
      cardId: `h${i}`,
    })) // below floor
    const treatment = cards(20, 25, { cohort: 'treatment' }).map((r, i) => ({
      ...r,
      cardId: `x${i}`,
    }))
    const out = abDelta(
      [...holdout, ...treatment],
      cohortOf,
      delayedRetrievalPassRate,
    )
    expect(out.holdout).toBeNull()
    expect(out.treatment).toBeCloseTo(0.8)
    expect(out.delta).toBeNull()
  })

  it('excludes cohort===undefined rows from both arms; a treatment-only descriptive read is still computable', () => {
    const unassigned = cards(99, 99) // cohort undefined — must be excluded
      .map((r, i) => ({ ...r, cardId: `u${i}` }))
    const treatment = cards(20, 25, { cohort: 'treatment' }).map((r, i) => ({
      ...r,
      cardId: `x${i}`,
    }))
    const out = abDelta(
      [...unassigned, ...treatment],
      cohortOf,
      delayedRetrievalPassRate,
    )
    // holdout has no rows (unassigned excluded, not folded in) → null; no spurious delta.
    expect(out.holdout).toBeNull()
    expect(out.delta).toBeNull()
    // treatment-only descriptive read still works.
    expect(out.treatment).toBeCloseTo(0.8)
  })
})
