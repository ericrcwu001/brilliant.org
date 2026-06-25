// Stage-2 fact-check: every graded number in lesson-combinatorics-3 is
// reproduced by src/engine/combinatorics.ts. No rendering — pure math.

import { describe, it, expect } from 'vitest'
import { LessonSchema } from './schema'
import { nCk, pascalRow } from '../engine/combinatorics'
import fixtureRaw from '../../fixtures/lesson-combinatorics-3.json'

const lesson = LessonSchema.parse(fixtureRaw)

describe('lesson-combinatorics-3 fact-check', () => {
  // ── Engine cross-check anchors ──────────────────────────────────────────

  it('pascalRow(4) deep-equals [1n, 4n, 6n, 4n, 1n]', () => {
    expect(pascalRow(4)).toEqual([1n, 4n, 6n, 4n, 1n])
  })

  it('nCk(2,1) === 2n (coefficient of ab in (a+b)²)', () => {
    expect(nCk(2, 1)).toBe(2n)
  })

  it('nCk(3,1) === 3n (base coefficient before ×10 in l3-prove)', () => {
    expect(nCk(3, 1)).toBe(3n)
  })

  it('nCk(3,1) * 10n === 30n (coefficient of a²b in (a+10b)³)', () => {
    expect(nCk(3, 1) * 10n).toBe(30n)
  })

  // ── Row-sum invariant: Σ pascalRow(n) === 2^n for n = 0..6 ────────────

  for (let n = 0; n <= 6; n++) {
    const expected = 2n ** BigInt(n)
    it(`Σ pascalRow(${n}) === 2^${n} = ${expected}`, () => {
      const sum = pascalRow(n).reduce((a, b) => a + b, 0n)
      expect(sum).toBe(2n ** BigInt(n))
    })
  }

  // ── Symmetry invariant: pascalRow(n)[k] === pascalRow(n)[n-k] ─────────

  it('symmetry: pascalRow(n)[k] === pascalRow(n)[n-k] for all rows 0..5', () => {
    for (let n = 0; n <= 5; n++) {
      const row = pascalRow(n)
      for (let k = 0; k <= n; k++) {
        expect(row[k]).toBe(row[n - k])
      }
    }
  })

  // ── l3-win: answerEntry accept === nCk(2,1).toString() ────────────────

  it('l3-win accept includes nCk(2,1).toString() = "2"', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l3-win')!
    expect(beat.interaction.type).toBe('answerEntry')
    if (beat.interaction.type !== 'answerEntry') return
    const field = beat.interaction.fields.find((f) => f.id === 'coeff-ab')!
    expect(field.accept).toContain(nCk(2, 1).toString())
    expect(nCk(2, 1).toString()).toBe('2')
  })

  // ── l3-prove: masteryChallenge accept === (nCk(3,1) * 10n).toString() ─

  it('l3-prove accept includes (nCk(3,1) * 10n).toString() = "30"', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l3-prove')!
    expect(beat.interaction.type).toBe('masteryChallenge')
    if (beat.interaction.type !== 'masteryChallenge') return
    const field = beat.interaction.fields.find((f) => f.id === 'coeff-a2b')!
    expect(field.accept).toContain((nCk(3, 1) * 10n).toString())
    expect((nCk(3, 1) * 10n).toString()).toBe('30')
  })

  // ── l3-applied: accept is "yes" — skip engine check ───────────────────
  // (the irrational-cancellation result is not a numeric engine value)

  it('l3-applied accept includes "yes" (non-numeric, no engine check)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l3-applied')!
    expect(beat.interaction.type).toBe('answerEntry')
    if (beat.interaction.type !== 'answerEntry') return
    const field = beat.interaction.fields.find((f) => f.id === 'integer-check')!
    expect(field.accept).toContain('yes')
  })

  // ── Structural checks ──────────────────────────────────────────────────

  it('lesson has exactly 10 beats', () => {
    expect(lesson.beats).toHaveLength(10)
  })

  it('beat order matches the spec', () => {
    const ids = lesson.beats.map((b) => b.beatId)
    expect(ids).toEqual([
      'l3-primer',
      'l3-recall',
      'l3-bet',
      'l3-win',
      'l3-scaffold-a',
      'l3-explore',
      'l3-model',
      'l3-applied',
      'l3-prove',
      'l3-recap',
    ])
  })

  it('last beat is recap', () => {
    const last = lesson.beats[lesson.beats.length - 1]!
    expect(last.interaction.type).toBe('recap')
  })

  it('penultimate beat is masteryChallenge required:true', () => {
    const penult = lesson.beats[lesson.beats.length - 2]!
    expect(penult.interaction.type).toBe('masteryChallenge')
    expect(penult.required).toBe(true)
  })

  it('l3-scaffold-a has track:"A" and required:false', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l3-scaffold-a')!
    expect(beat.track).toBe('A')
    expect(beat.required).toBe(false)
  })

  it('l3-explore is pascalTriangle with hero block and reducedMotionFinalFrame', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l3-explore')!
    expect(beat.interaction.type).toBe('pascalTriangle')
    expect(beat.hero).toBeDefined()
    expect(beat.hero?.reducedMotionFinalFrame).toBe(true)
  })

  it('l3-explore pascalTriangle has no accept (ungraded)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l3-explore')!
    if (beat.interaction.type !== 'pascalTriangle') return
    expect(beat.interaction.accept).toBeUndefined()
  })

  it('l3-model has introducesSymbol and groundedBy', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l3-model')!
    expect(beat.introducesSymbol).toBe('(a+b)ⁿ/Σ')
    expect(beat.groundedBy).toContain('l3-explore')
    expect(beat.groundedBy).toContain('l3-primer')
  })

  it('at least one beat has interviewNote', () => {
    expect(lesson.beats.some((b) => b.interviewNote)).toBe(true)
  })

  it('l3-applied has interviewNote about GB p.36-37', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l3-applied')!
    expect(beat.interviewNote).toContain('GB p.36')
  })

  it('l3-recall is the first graded beat (retrievalGrid)', () => {
    const firstGraded = lesson.beats.find(
      (b) =>
        b.interaction.type === 'retrievalGrid' ||
        b.interaction.type === 'answerEntry' ||
        b.interaction.type === 'masteryChallenge',
    )
    expect(firstGraded?.beatId).toBe('l3-recall')
    expect(firstGraded?.interaction.type).toBe('retrievalGrid')
  })

  it('l3-prove pattern field is absent (engine-verified, no automaton cross-check)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l3-prove')!
    expect(beat.pattern).toBeUndefined()
  })

  it('l3-bet uses byOption (refutational) feedback', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l3-bet')!
    expect(beat.feedback).toHaveProperty('byOption')
  })
})
