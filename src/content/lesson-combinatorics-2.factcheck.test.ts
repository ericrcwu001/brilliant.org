// Stage-2 fact-check: every graded number in lesson-combinatorics-2 is
// reproduced by src/engine/combinatorics.ts. No rendering — pure math.

import { describe, it, expect } from 'vitest'
import { LessonSchema } from './schema'
import {
  factorial,
  nCk,
  nPk,
  probabilityFromCounts,
  reduce,
} from '../engine/combinatorics'
import fixtureRaw from '../../fixtures/lesson-combinatorics-2.json'

const lesson = LessonSchema.parse(fixtureRaw)

describe('lesson-combinatorics-2 fact-check', () => {
  // ── Engine cross-check anchors ──────────────────────────────────────────

  it('nCk(5,3) === nPk(5,3) / factorial(3)  → 10', () => {
    expect(nCk(5, 3)).toBe(nPk(5, 3) / factorial(3))
    expect(nCk(5, 3)).toBe(10n)
  })

  it('nCk(52,5) === 2598960n', () => {
    expect(nCk(52, 5)).toBe(2_598_960n)
  })

  it('nPk(5,3) === 60n', () => {
    expect(nPk(5, 3)).toBe(60n)
  })

  it('factorial(3) === 6n', () => {
    expect(factorial(3)).toBe(6n)
  })

  it('factorial(4) === 24n', () => {
    expect(factorial(4)).toBe(24n)
  })

  // ── l2-win: selectionGrid accept === nPk(5,3) ──────────────────────────

  it('l2-win accept includes nPk(5,3).toString() = "60"', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l2-win')!
    expect(beat.interaction.type).toBe('selectionGrid')
    if (beat.interaction.type !== 'selectionGrid') return
    expect(beat.interaction.accept).toContain(nPk(5, 3).toString())
    expect(nPk(5, 3).toString()).toBe('60')
  })

  // ── l2-fraction: step1 1/6 = reduce(1n, factorial(3)) ──────────────────

  it('l2-fraction step1 accept includes "1/6" = reduce(1n, factorial(3))', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l2-fraction')!
    expect(beat.interaction.type).toBe('answerEntry')
    if (beat.interaction.type !== 'answerEntry') return
    const step1 = beat.interaction.fields.find((f) => f.id === 'step1')!
    const { n, d } = reduce(1n, factorial(3))
    const fraction = `${n}/${d}`
    expect(fraction).toBe('1/6')
    expect(step1.accept).toContain(fraction)
  })

  it('reduce(1n, factorial(3)) = {n:1n, d:6n}', () => {
    const r = reduce(1n, factorial(3))
    expect(r.n).toBe(1n)
    expect(r.d).toBe(6n)
  })

  it('l2-fraction step2 accept includes "5/54" = probabilityFromCounts(20, 216)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l2-fraction')!
    expect(beat.interaction.type).toBe('answerEntry')
    if (beat.interaction.type !== 'answerEntry') return
    const step2 = beat.interaction.fields.find((f) => f.id === 'step2')!
    const { n, d } = probabilityFromCounts(20, 216)
    const fraction = `${n}/${d}`
    expect(fraction).toBe('5/54')
    expect(step2.accept).toContain(fraction)
  })

  it('l2-fraction step2 also accepts "20/216"', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l2-fraction')!
    if (beat.interaction.type !== 'answerEntry') return
    const step2 = beat.interaction.fields.find((f) => f.id === 'step2')!
    expect(step2.accept).toContain('20/216')
  })

  it('probabilityFromCounts(20, 216) = {n:5n, d:54n}', () => {
    const r = probabilityFromCounts(20, 216)
    expect(r.n).toBe(5n)
    expect(r.d).toBe(54n)
  })

  // ── l2-prove: masteryChallenge accept === factorial(4) ─────────────────

  it('l2-prove accept includes factorial(4).toString() = "24"', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l2-prove')!
    expect(beat.interaction.type).toBe('masteryChallenge')
    if (beat.interaction.type !== 'masteryChallenge') return
    const aceField = beat.interaction.fields.find((f) => f.id === 'aces')!
    expect(aceField.accept).toContain(factorial(4).toString())
    expect(factorial(4).toString()).toBe('24')
  })

  it('l2-prove has required:true', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l2-prove')!
    expect(beat.required).toBe(true)
  })

  it('l2-prove pattern field is absent', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l2-prove')!
    expect(beat.pattern).toBeUndefined()
  })

  // ── Structural checks ──────────────────────────────────────────────────

  it('lesson has exactly 10 beats', () => {
    expect(lesson.beats).toHaveLength(10)
  })

  it('beat order matches the spec', () => {
    const ids = lesson.beats.map((b) => b.beatId)
    expect(ids).toEqual([
      'l2-primer',
      'l2-recall',
      'l2-bet',
      'l2-win',
      'l2-scaffold',
      'l2-explore',
      'l2-model',
      'l2-fraction',
      'l2-prove',
      'l2-recap',
    ])
  })

  it('last beat is recap', () => {
    const last = lesson.beats[lesson.beats.length - 1]
    expect(last.interaction.type).toBe('recap')
  })

  it('penultimate beat is masteryChallenge required:true', () => {
    const penult = lesson.beats[lesson.beats.length - 2]
    expect(penult.interaction.type).toBe('masteryChallenge')
    expect(penult.required).toBe(true)
  })

  it('l2-scaffold has track:"A" and required:false', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l2-scaffold')!
    expect(beat.track).toBe('A')
    expect(beat.required).toBe(false)
  })

  it('l2-explore has comparison:true and hero block', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l2-explore')!
    expect(beat.comparison).toBe(true)
    expect(beat.hero).toBeDefined()
    expect(beat.hero?.reducedMotionFinalFrame).toBe(true)
  })

  it('l2-model has introducesSymbol and groundedBy', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l2-model')!
    expect(beat.introducesSymbol).toBe('nPk, nCk')
    expect(beat.groundedBy).toContain('l2-win')
    expect(beat.groundedBy).toContain('l2-explore')
  })

  it('at least one beat has interviewNote', () => {
    expect(lesson.beats.some((b) => b.interviewNote)).toBe(true)
  })

  it('l2-win has interviewNote about 52!', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l2-win')!
    expect(beat.interviewNote).toContain('52!')
  })

  it('l2-explore selectionGrid has order:"toggle" and no accept', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l2-explore')!
    expect(beat.interaction.type).toBe('selectionGrid')
    if (beat.interaction.type !== 'selectionGrid') return
    expect(beat.interaction.order).toBe('toggle')
    expect(beat.interaction.accept).toBeUndefined()
  })

  it('l2-recall is the first graded beat (retrievalGrid)', () => {
    const firstGraded = lesson.beats.find(
      (b) =>
        b.interaction.type === 'retrievalGrid' ||
        b.interaction.type === 'answerEntry' ||
        b.interaction.type === 'masteryChallenge' ||
        (b.interaction.type === 'selectionGrid' &&
          'accept' in b.interaction &&
          b.interaction.accept !== undefined),
    )
    expect(firstGraded?.beatId).toBe('l2-recall')
    expect(firstGraded?.interaction.type).toBe('retrievalGrid')
  })
})
