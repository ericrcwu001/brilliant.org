// Stage-2 fact-check: every graded number in lesson-markov-chains-8.json is
// reproduced by src/engine/markov.ts. Fails fast with a clear message if a
// fixture author transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { detailedBalance, formatRational, formatVector } from '../engine/markov'
import type { Rational } from '../engine/types'
import fixture from '../../fixtures/lesson-markov-chains-8.json'
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

// ── Ehrenfest m=2: states {0,1,2} ───────────────────────────────────────────
// P(0→1)=1; P(1→0)=1/2, P(1→2)=1/2; P(2→1)=1
const ehr2: Rational[][] = [
  [r(0), r(1), r(0)],
  [r(1, 2), r(0), r(1, 2)],
  [r(0), r(1), r(0)],
]

// ── Directed 3-cycle A→B→C→A ────────────────────────────────────────────────
const cyc3: Rational[][] = [
  [r(0), r(1), r(0)],
  [r(0), r(0), r(1)],
  [r(1), r(0), r(0)],
]

// ── Ehrenfest m=3: states {0,1,2,3} ─────────────────────────────────────────
// P(0→1)=1; P(1→0)=1/3, P(1→2)=2/3; P(2→1)=2/3, P(2→3)=1/3; P(3→2)=1
const ehr3: Rational[][] = [
  [r(0), r(1), r(0), r(0)],
  [r(1, 3), r(0), r(2, 3), r(0)],
  [r(0), r(2, 3), r(0), r(1, 3)],
  [r(0), r(0), r(1), r(0)],
]

describe('lesson-markov-chains-8 fact-check', () => {
  // ── Engine goldens ────────────────────────────────────────────────────────

  it('engine: detailedBalance(ehr2) reversible, pi = "1/4,1/2,1/4"', () => {
    const db = detailedBalance(ehr2)
    expect(db.reversible).toBe(true)
    expect(formatVector(db.pi)).toBe('1/4,1/2,1/4')
  })

  it('engine: detailedBalance(ehr3) reversible, pi = "1/8,3/8,3/8,1/8"', () => {
    const db = detailedBalance(ehr3)
    expect(db.reversible).toBe(true)
    expect(formatVector(db.pi)).toBe('1/8,3/8,3/8,1/8')
  })

  it('engine: detailedBalance(cyc3).reversible === false', () => {
    expect(detailedBalance(cyc3).reversible).toBe(false)
  })

  // ── Fixture cross-checks ──────────────────────────────────────────────────

  it('balance-one-edge headline "1/2" === formatRational(detailedBalance(ehr2).pi[1])', () => {
    const beat = beatById('balance-one-edge')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe('1/2')
    expect(beat.interaction.headline).toBe(formatRational(detailedBalance(ehr2).pi[1]))
  })

  it('ehrenfest-walk headline "1/4,1/2,1/4" === formatVector(detailedBalance(ehr2).pi)', () => {
    const beat = beatById('ehrenfest-walk')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe('1/4,1/2,1/4')
    expect(beat.interaction.headline).toBe(formatVector(detailedBalance(ehr2).pi))
  })

  it('telescope-to-pi headline "1/4,1/2,1/4" === formatVector(detailedBalance(ehr2).pi)', () => {
    const beat = beatById('telescope-to-pi')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe('1/4,1/2,1/4')
    expect(beat.interaction.headline).toBe(formatVector(detailedBalance(ehr2).pi))
  })

  it('reversible-or-not headline "not-reversible" ↔ detailedBalance(cyc3).reversible === false', () => {
    const beat = beatById('reversible-or-not')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe('not-reversible')
    expect(detailedBalance(cyc3).reversible).toBe(false)
  })

  it('mastery-ehrenfest-m3 accept values match detailedBalance(ehr3).pi', () => {
    const beat = beatById('mastery-ehrenfest-m3')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const db = detailedBalance(ehr3)
    expect(formatVector(db.pi)).toBe('1/8,3/8,3/8,1/8')
    expect(beat.interaction.fields[0].accept[0]).toBe(formatRational(db.pi[0]))
    expect(beat.interaction.fields[1].accept[0]).toBe(formatRational(db.pi[1]))
    expect(beat.interaction.fields[2].accept[0]).toBe(formatRational(db.pi[2]))
    expect(beat.interaction.fields[3].accept[0]).toBe(formatRational(db.pi[3]))
  })

  // ── Structural checks ─────────────────────────────────────────────────────

  it('ehrenfest-walk has layout:"line" and hero block with slowFirst:true', () => {
    const beat = beatById('ehrenfest-walk')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.layout).toBe('line')
    expect(beat.hero).toBeDefined()
    expect(beat.hero?.slowFirst).toBe(true)
    expect(beat.hero?.reducedMotionFinalFrame).toBe(true)
  })

  it('balance-one-edge, telescope-to-pi, reversible-or-not carry no hero (graded)', () => {
    expect(beatById('balance-one-edge').hero).toBeUndefined()
    expect(beatById('telescope-to-pi').hero).toBeUndefined()
    expect(beatById('reversible-or-not').hero).toBeUndefined()
  })

  it('mastery-ehrenfest-m3 has no pattern (avoids buildAutomaton cross-check)', () => {
    const beat = beatById('mastery-ehrenfest-m3')
    expect((beat as { pattern?: unknown }).pattern).toBeUndefined()
  })

  it('telescope-to-pi has an interviewNote', () => {
    const beat = beatById('telescope-to-pi')
    expect((beat as { interviewNote?: string }).interviewNote).toBeTruthy()
  })

  it('name-detailed-balance is track:A, required:false', () => {
    const beat = beatById('name-detailed-balance')
    expect(beat.track).toBe('A')
    expect(beat.required).toBe(false)
  })

  it('lesson has exactly 10 beats in spec order', () => {
    const ids = lesson.beats.map((b) => b.beatId)
    expect(ids).toEqual([
      'recall-birth-death',
      'guess-pi-bet',
      'name-detailed-balance',
      'balance-one-edge',
      'ehrenfest-walk',
      'telescope-to-pi',
      'triplet-reveal',
      'reversible-or-not',
      'mastery-ehrenfest-m3',
      'recap',
    ])
  })

  it('penultimate beat is mastery-ehrenfest-m3 (required), last beat is recap', () => {
    const beats = lesson.beats
    expect(beats[beats.length - 2].beatId).toBe('mastery-ehrenfest-m3')
    expect(beats[beats.length - 2].required).toBe(true)
    expect(beats[beats.length - 1].beatId).toBe('recap')
  })
})
