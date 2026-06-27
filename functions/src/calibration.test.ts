// Parity test (spec-12 §7): the functions copy of the calibration maths must give
// identical numbers to the src/ copy, and the two files must be BYTE-IDENTICAL
// below their one-line header comment (guards drift between the two copies).
import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

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

// Fixed vector exercised by both copies (the parity assertion).
const VECTOR: CalibrationItem[] = [
  { confidence: 0.9, correct: true, hard: true, format: 'voice' },
  { confidence: 0.7, correct: false, hard: true, format: 'voice' },
  { confidence: 0.5, correct: true, format: 'typein' },
  { confidence: 0.5, correct: false, format: 'typein' },
  { confidence: 1, correct: true, format: 'binary' },
]

describe('functions calibration copy — numbers on the fixed vector', () => {
  it('brierScore matches the hand-computed value', () => {
    // (0.9-1)^2 + (0.7-0)^2 + (0.5-1)^2 + (0.5-0)^2 + (1-1)^2
    // = 0.01 + 0.49 + 0.25 + 0.25 + 0 = 1.0 ; /5 = 0.2
    expect(brierScore(VECTOR)).toBeCloseTo(0.2)
  })

  it('scoreCalibration produces the expected pooled + per-format shape', () => {
    const r = scoreCalibration(VECTOR)
    expect(r.n).toBe(5)
    expect(r.brier).toBeCloseTo(0.2)
    expect(r.meanConfidence).toBeCloseTo((0.9 + 0.7 + 0.5 + 0.5 + 1) / 5)
    expect(r.accuracy).toBeCloseTo(3 / 5)
    expect(r.overconfidence).toBeCloseTo(r.meanConfidence! - r.accuracy!)
    expect(r.reliable).toBe(true) // n = 5 = MIN_CALIBRATION_N
    expect(r.byFormat!.voice!.n).toBe(2)
    expect(r.byFormat!.typein!.n).toBe(2)
    expect(r.byFormat!.binary!.n).toBe(1)
  })

  it('hardItemCalibrationBonus over the hard (voice) items', () => {
    // hard items: (0.9, correct) → 1-|0.9-1| = 0.9 ; (0.7, wrong) → 1-|0.7-0| = 0.3
    expect(hardItemCalibrationBonus(VECTOR)).toBeCloseTo((0.9 + 0.3) / 2)
  })

  it('foldAttemptIntoTrend running == batch on the vector', () => {
    const empty = { n: 0, brierSum: 0, confidenceSum: 0, correctSum: 0 }
    const folded = foldAttemptIntoTrend(empty, VECTOR)
    const batch = scoreCalibration(VECTOR)
    expect(folded.brierSum / folded.n).toBeCloseTo(batch.brier!)
    expect(folded.byFormat.voice!.n).toBe(2)
  })

  it('binarization + min-n constants are locked', () => {
    expect(CORRECTNESS_PASS_THRESHOLD).toBe(4)
    expect(isCorrect(4)).toBe(true)
    expect(isCorrect(3)).toBe(false)
    expect(MIN_CALIBRATION_N).toBe(5)
  })
})

describe('byte-identity with src/progress/calibration.ts (below the header line)', () => {
  it('the two files are byte-identical from line 2 onward', () => {
    const functionsCopy = fs.readFileSync(path.join(__dirname, 'calibration.ts'), 'utf8')
    const srcCopy = fs.readFileSync(
      path.join(__dirname, '..', '..', 'src', 'progress', 'calibration.ts'),
      'utf8',
    )
    const dropHeader = (s: string): string => s.split('\n').slice(1).join('\n')
    expect(dropHeader(functionsCopy)).toBe(dropHeader(srcCopy))
  })
})
