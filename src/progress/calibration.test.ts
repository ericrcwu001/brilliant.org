import { describe, it, expect } from 'vitest'

import {
  brierScore,
  scoreCalibration,
  hardItemCalibrationBonus,
  foldAttemptIntoTrend,
  isCorrect,
  CORRECTNESS_PASS_THRESHOLD,
  MIN_CALIBRATION_N,
  type CalibrationItem,
} from './calibration'

describe('brierScore', () => {
  it('perfect calibration → 0', () => {
    const items: CalibrationItem[] = [
      { confidence: 1, correct: true },
      { confidence: 0, correct: false },
    ]
    expect(brierScore(items)).toBe(0)
  })

  it('maximally wrong-and-sure → 1', () => {
    expect(brierScore([{ confidence: 1, correct: false }])).toBe(1)
  })

  it('coin-flip (0.5) → 0.25 for any outcome', () => {
    expect(brierScore([{ confidence: 0.5, correct: true }])).toBe(0.25)
    expect(brierScore([{ confidence: 0.5, correct: false }])).toBe(0.25)
  })

  it('empty → null', () => {
    expect(brierScore([])).toBeNull()
  })

  it('drops a NaN confidence (does not poison the mean)', () => {
    const items: CalibrationItem[] = [
      { confidence: Number.NaN, correct: true },
      { confidence: 1, correct: true },
    ]
    // Only the finite item counts → perfect → 0, not (0 + something)/2.
    expect(brierScore(items)).toBe(0)
  })

  it('all-NaN → null', () => {
    expect(brierScore([{ confidence: Number.NaN, correct: true }])).toBeNull()
  })
})

describe('scoreCalibration', () => {
  it('overconfident: meanConfidence > accuracy → overconfidence > 0', () => {
    const r = scoreCalibration([
      { confidence: 0.9, correct: false },
      { confidence: 0.9, correct: true },
    ])
    expect(r.meanConfidence).toBeCloseTo(0.9)
    expect(r.accuracy).toBeCloseTo(0.5)
    expect(r.overconfidence).toBeCloseTo(0.4)
    expect(r.overconfidence! > 0).toBe(true)
  })

  it('underconfident: meanConfidence < accuracy → overconfidence < 0', () => {
    const r = scoreCalibration([
      { confidence: 0.6, correct: true },
      { confidence: 0.6, correct: true },
    ])
    expect(r.overconfidence! < 0).toBe(true)
  })

  it('n:0 all-null on empty', () => {
    const r = scoreCalibration([])
    expect(r).toEqual({
      n: 0,
      brier: null,
      meanConfidence: null,
      accuracy: null,
      overconfidence: null,
      reliable: false,
    })
  })

  it('clamps an out-of-range confidence (1.4 treated as 1)', () => {
    const r = scoreCalibration([{ confidence: 1.4, correct: true }])
    expect(r.brier).toBe(0) // (1 - 1)^2
    expect(r.meanConfidence).toBe(1)
  })
})

describe('hardItemCalibrationBonus', () => {
  it('null when no hard items', () => {
    expect(hardItemCalibrationBonus([{ confidence: 0.9, correct: true }])).toBeNull()
  })

  it('~1 for low-confidence-on-hard (humble, whatever the outcome)', () => {
    // low confidence + wrong on hard = well calibrated.
    expect(hardItemCalibrationBonus([{ confidence: 0.1, correct: false, hard: true }])).toBeCloseTo(0.9)
  })

  it('~1 for high-confidence-correct on hard', () => {
    expect(hardItemCalibrationBonus([{ confidence: 1, correct: true, hard: true }])).toBe(1)
  })

  it('low for high-confidence-wrong on hard', () => {
    expect(hardItemCalibrationBonus([{ confidence: 1, correct: false, hard: true }])).toBe(0)
  })

  it('only considers hard items', () => {
    const bonus = hardItemCalibrationBonus([
      { confidence: 0, correct: false }, // not hard, ignored
      { confidence: 1, correct: true, hard: true },
    ])
    expect(bonus).toBe(1)
  })
})

describe('foldAttemptIntoTrend', () => {
  const empty = { n: 0, brierSum: 0, confidenceSum: 0, correctSum: 0 }

  it('running mean == batch mean across two folds', () => {
    const a: CalibrationItem[] = [
      { confidence: 0.8, correct: true },
      { confidence: 0.3, correct: false },
    ]
    const b: CalibrationItem[] = [
      { confidence: 0.9, correct: false },
      { confidence: 0.5, correct: true },
    ]
    const folded = foldAttemptIntoTrend(foldAttemptIntoTrend(empty, a), b)
    const batch = scoreCalibration([...a, ...b])
    expect(folded.n).toBe(4)
    expect(folded.brierSum / folded.n).toBeCloseTo(batch.brier!)
    expect(folded.confidenceSum / folded.n).toBeCloseTo(batch.meanConfidence!)
    expect(folded.correctSum / folded.n).toBeCloseTo(batch.accuracy!)
  })

  it('empty items leave the prior unchanged', () => {
    const prior = { n: 3, brierSum: 0.5, confidenceSum: 2.1, correctSum: 2 }
    const folded = foldAttemptIntoTrend(prior, [])
    expect(folded.n).toBe(3)
    expect(folded.brierSum).toBe(0.5)
    expect(folded.confidenceSum).toBe(2.1)
    expect(folded.correctSum).toBe(2)
  })

  it('folding a single review-rep (typein) into an interview-derived trend combines (§3.3a)', () => {
    const interview: CalibrationItem[] = [
      { confidence: 0.8, correct: true, format: 'voice' },
      { confidence: 0.7, correct: false, format: 'voice' },
    ]
    const trend = foldAttemptIntoTrend(empty, interview)
    const rep: CalibrationItem = { confidence: 0.6, correct: true, format: 'typein' }
    const combined = foldAttemptIntoTrend(trend, [rep])
    const batch = scoreCalibration([...interview, rep])
    expect(combined.n).toBe(3)
    expect(combined.brierSum / combined.n).toBeCloseTo(batch.brier!)
    // review rep + interview attempts share one trend
    expect(combined.byFormat.voice!.n).toBe(2)
    expect(combined.byFormat.typein!.n).toBe(1)
  })
})

describe('isCorrect / CORRECTNESS_PASS_THRESHOLD', () => {
  it('threshold constant is 4 (locks the value spec-22/23 import)', () => {
    expect(CORRECTNESS_PASS_THRESHOLD).toBe(4)
  })

  it('isCorrect(4) and isCorrect(5) are true', () => {
    expect(isCorrect(4)).toBe(true)
    expect(isCorrect(5)).toBe(true)
  })

  it('isCorrect(3) and below are false', () => {
    expect(isCorrect(3)).toBe(false)
    expect(isCorrect(1)).toBe(false)
  })
})

describe('MIN_CALIBRATION_N / reliable (gate #7)', () => {
  it('constant is 5 (locks the value spec-23 imports)', () => {
    expect(MIN_CALIBRATION_N).toBe(5)
  })

  const items = (n: number): CalibrationItem[] =>
    Array.from({ length: n }, () => ({ confidence: 0.6, correct: true }))

  it('n=4 → reliable false', () => {
    expect(scoreCalibration(items(4)).reliable).toBe(false)
  })

  it('n=5 → reliable true', () => {
    expect(scoreCalibration(items(5)).reliable).toBe(true)
  })

  it('an unreliable result still returns finite brier/overconfidence (gating is surfacing-only)', () => {
    const r = scoreCalibration(items(4))
    expect(r.reliable).toBe(false)
    expect(Number.isFinite(r.brier!)).toBe(true)
    expect(Number.isFinite(r.overconfidence!)).toBe(true)
  })
})

describe('format / byFormat (gate #7)', () => {
  it('a mixed list yields per-format sub-summaries each with own n/brier/overconfidence', () => {
    const r = scoreCalibration([
      { confidence: 0.9, correct: true, format: 'voice' },
      { confidence: 0.5, correct: true, format: 'typein' },
      { confidence: 0.5, correct: false, format: 'typein' },
    ])
    expect(r.byFormat!.voice!.n).toBe(1)
    expect(r.byFormat!.typein!.n).toBe(2)
    expect(Number.isFinite(r.byFormat!.voice!.brier!)).toBe(true)
    expect(Number.isFinite(r.byFormat!.typein!.overconfidence!)).toBe(true)
  })

  it('a large pool of 0.5-floored typeins does NOT drag byFormat.voice toward 0.25 (anti-contamination)', () => {
    const typeins: CalibrationItem[] = Array.from({ length: 50 }, () => ({
      confidence: 0.5,
      correct: Math.random() < 0.5,
      format: 'typein' as const,
    }))
    const voice: CalibrationItem[] = [
      { confidence: 0.9, correct: true, format: 'voice' },
      { confidence: 0.85, correct: true, format: 'voice' },
      { confidence: 0.9, correct: true, format: 'voice' },
    ]
    const r = scoreCalibration([...typeins, ...voice])
    const voiceOnly = scoreCalibration(voice)
    expect(r.byFormat!.voice!.brier!).toBeCloseTo(voiceOnly.brier!)
    // well-calibrated voice → near 0, NOT dragged to chance ~0.25
    expect(r.byFormat!.voice!.brier!).toBeLessThan(0.1)
  })

  it('byFormat is undefined when no item carries a format', () => {
    const r = scoreCalibration([{ confidence: 0.7, correct: true }])
    expect(r.byFormat).toBeUndefined()
  })

  it('an item without a format counts toward pooled but no bucket', () => {
    const r = scoreCalibration([
      { confidence: 0.9, correct: true, format: 'voice' },
      { confidence: 0.6, correct: true }, // no format
    ])
    expect(r.n).toBe(2)
    expect(r.byFormat!.voice!.n).toBe(1)
    // no 'typein'/'binary' bucket spawned for the format-less item
    expect(Object.keys(r.byFormat!)).toEqual(['voice'])
  })
})

describe('foldAttemptIntoTrend per-format (gate #7)', () => {
  const empty = { n: 0, brierSum: 0, confidenceSum: 0, correctSum: 0 }

  it('per-bucket running mean == batch mean per format; pooled still equals all-items batch', () => {
    const voice: CalibrationItem[] = [
      { confidence: 0.9, correct: true, format: 'voice' },
      { confidence: 0.7, correct: false, format: 'voice' },
    ]
    const typein: CalibrationItem[] = [
      { confidence: 0.5, correct: true, format: 'typein' },
      { confidence: 0.5, correct: false, format: 'typein' },
    ]
    const folded = foldAttemptIntoTrend(foldAttemptIntoTrend(empty, voice), typein)
    const voiceBatch = scoreCalibration(voice)
    const typeinBatch = scoreCalibration(typein)
    const pooledBatch = scoreCalibration([...voice, ...typein])

    expect(folded.byFormat.voice!.brierSum / folded.byFormat.voice!.n).toBeCloseTo(voiceBatch.brier!)
    expect(folded.byFormat.typein!.brierSum / folded.byFormat.typein!.n).toBeCloseTo(typeinBatch.brier!)
    expect(folded.brierSum / folded.n).toBeCloseTo(pooledBatch.brier!)
  })

  it('a per-bucket reliable recomputed from byFormat.voice.n is independent of pooled n', () => {
    // 2 voice (unreliable) + many typein (so pool >= 5, reliable)
    const voice: CalibrationItem[] = [
      { confidence: 0.9, correct: true, format: 'voice' },
      { confidence: 0.8, correct: true, format: 'voice' },
    ]
    const typein: CalibrationItem[] = Array.from({ length: 6 }, () => ({
      confidence: 0.6,
      correct: true,
      format: 'typein' as const,
    }))
    const folded = foldAttemptIntoTrend(foldAttemptIntoTrend(empty, voice), typein)
    const pooledReliable = folded.n >= MIN_CALIBRATION_N
    const voiceReliable = folded.byFormat.voice!.n >= MIN_CALIBRATION_N
    expect(pooledReliable).toBe(true)
    expect(voiceReliable).toBe(false)
  })
})
