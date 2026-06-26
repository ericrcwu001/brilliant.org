// Stage-2 fact-check: every graded number in lesson-markov-chains-5.json is
// reproduced by src/engine/markov.ts. Fails fast with a clear message if a
// fixture author transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { absorptionProbabilities, formatRational, formatVector } from '../engine/markov'
import type { Rational } from '../engine/types'
import fixture from '../../fixtures/lesson-markov-chains-5.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

// ── Rational constructor shorthand ──────────────────────────────────────────
function r(n: number, d = 1): Rational {
  return { n, d }
}

// ── Gambler up-2/3: states {0,1,2,3}, absorbing {0,3} ──────────────────────
// P = [[1,0,0,0],[1/3,0,2/3,0],[0,1/3,0,2/3],[0,0,0,1]]
const gr: Rational[][] = [
  [r(1), r(0), r(0), r(0)],
  [r(1, 3), r(0), r(2, 3), r(0)],
  [r(0), r(1, 3), r(0), r(2, 3)],
  [r(0), r(0), r(0), r(1)],
]

// ── Symmetric walk {0,1,2,3,4}, absorbing {0,4} ────────────────────────────
// P[i][i-1] = P[i][i+1] = 1/2 for transient states; walls absorbing.
const sym5: Rational[][] = [
  [r(1), r(0), r(0), r(0), r(0)],
  [r(1, 2), r(0), r(1, 2), r(0), r(0)],
  [r(0), r(1, 2), r(0), r(1, 2), r(0)],
  [r(0), r(0), r(1, 2), r(0), r(1, 2)],
  [r(0), r(0), r(0), r(0), r(1)],
]

// ── Dice 4-state chain: {S=0, 7=1, 12-wins=2, 7·7-wins=3} ─────────────────
// Per roll: P(7)=6/36=1/6, P(12)=1/36, other=29/36
// S: go to 7 w.p. 1/6, go to 12-wins w.p. 1/36, stay at S w.p. 29/36
// 7: go to 7·7-wins w.p. 1/6, go to 12-wins w.p. 1/36, go to S w.p. 29/36
// 12-wins (absorbing): [0,0,1,0]
// 7·7-wins (absorbing): [0,0,0,1]
const dice4: Rational[][] = [
  [r(29, 36), r(1, 6), r(1, 36), r(0)],
  [r(29, 36), r(0), r(1, 36), r(1, 6)],
  [r(0), r(0), r(1), r(0)],
  [r(0), r(0), r(0), r(1)],
]

describe('lesson-markov-chains-5 fact-check', () => {
  // ── Engine golden: solve-matrix headline "4/7,6/7" ─────────────────────
  it('engine: absorptionProbabilities(gr,[0,3]) col-1 = "4/7,6/7"', () => {
    const B = absorptionProbabilities(gr, [0, 3])
    // B is 2×2 (transient states 1,2 × absorbing states 0,3).
    // col 1 = P(reach state 3 | start state 1 or 2).
    expect(formatVector([B[0][1], B[1][1]])).toBe('4/7,6/7')
  })

  // ── Engine golden: iN-early-win (1/4, 1/2, 3/4) ──────────────────────
  it('engine: absorptionProbabilities(sym5,[0,4]) reach-wall-4 = 1/4,1/2,3/4', () => {
    const Bw = absorptionProbabilities(sym5, [0, 4])
    // transient states 1,2,3 → col 1 = P(reach 4)
    expect(formatRational(Bw[0][1])).toBe('1/4')
    expect(formatRational(Bw[1][1])).toBe('1/2')
    expect(formatRational(Bw[2][1])).toBe('3/4')
  })

  // ── Engine golden: mastery-dice "7/13" ────────────────────────────────
  it('engine: absorptionProbabilities(dice4,[2,3]) 12-first = "7/13"', () => {
    const Bd = absorptionProbabilities(dice4, [2, 3])
    // transient states 0,1 → col 0 = P(reach state 2 = 12-wins | start S or 7)
    expect(formatRational(Bd[0][0])).toBe('7/13')
  })

  // ── Fixture cross-checks: declared values match engine ──────────────────
  it('fixture solve-matrix headline matches engine col-1', () => {
    const beat = beatById('solve-matrix')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    const B = absorptionProbabilities(gr, [0, 3])
    expect(beat.interaction.headline).toBe(formatVector([B[0][1], B[1][1]]))
  })

  it('fixture iN-early-win accept values match engine', () => {
    const beat = beatById('iN-early-win')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const Bw = absorptionProbabilities(sym5, [0, 4])
    const [f1, f2, f3] = beat.interaction.fields
    expect(f1.accept[0]).toBe(formatRational(Bw[0][1]))
    expect(f2.accept[0]).toBe(formatRational(Bw[1][1]))
    expect(f3.accept[0]).toBe(formatRational(Bw[2][1]))
  })

  it('fixture mastery-dice accept value matches engine', () => {
    const beat = beatById('mastery-dice')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const Bd = absorptionProbabilities(dice4, [2, 3])
    expect(beat.interaction.fields[0].accept[0]).toBe(formatRational(Bd[0][0]))
  })

  // ── Structural checks ──────────────────────────────────────────────────
  it('walk-recall carries hero block with slowFirst:false', () => {
    const beat = beatById('walk-recall')
    expect(beat.hero).toBeDefined()
    expect(beat.hero?.slowFirst).toBe(false)
  })

  it('race-recall carries hero block with slowFirst:false', () => {
    const beat = beatById('race-recall')
    expect(beat.hero).toBeDefined()
    expect(beat.hero?.slowFirst).toBe(false)
  })

  it('solve-matrix carries hero block with slowFirst:true', () => {
    const beat = beatById('solve-matrix')
    expect(beat.hero).toBeDefined()
    expect(beat.hero?.slowFirst).toBe(true)
  })

  it('mastery-dice has no pattern (avoids buildAutomaton cross-check)', () => {
    const beat = beatById('mastery-dice')
    expect((beat as { pattern?: unknown }).pattern).toBeUndefined()
  })

  it('lesson has exactly 11 beats in spec order', () => {
    const ids = lesson.beats.map((b) => b.beatId)
    expect(ids).toEqual([
      'recall-first-step',
      'time-or-prob-bet',
      'lift-to-matrix',
      'walk-recall',
      'iN-early-win',
      'race-recall',
      'solve-matrix',
      'triplet-reveal',
      'time-vs-prob',
      'mastery-dice',
      'recap',
    ])
  })

  it('penultimate beat is mastery-dice (required), last beat is recap', () => {
    const beats = lesson.beats
    expect(beats[beats.length - 2].beatId).toBe('mastery-dice')
    expect(beats[beats.length - 2].required).toBe(true)
    expect(beats[beats.length - 1].beatId).toBe('recap')
  })
})
