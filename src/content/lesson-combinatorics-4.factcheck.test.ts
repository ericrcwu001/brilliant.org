// Stage-2 fact-check: every graded number in lesson-combinatorics-4 is
// reproduced by src/engine/combinatorics.ts. No rendering — pure math.

import { describe, it, expect } from 'vitest'
import { LessonSchema } from './schema'
import {
  factorial,
  nCk,
  unionSize,
  derangements,
  reduce,
  probabilityFromCounts,
} from '../engine/combinatorics'
import fixtureRaw from '../../fixtures/lesson-combinatorics-4.json'

const lesson = LessonSchema.parse(fixtureRaw)

describe('lesson-combinatorics-4 fact-check', () => {
  // ── Engine cross-check anchors ──────────────────────────────────────────

  it('factorial(4) === 24n', () => {
    expect(factorial(4)).toBe(24n)
  })

  it('nCk(52,5) === 2598960n', () => {
    expect(nCk(52, 5)).toBe(2_598_960n)
  })

  it('unionSize(8,6,3) === 11n', () => {
    expect(unionSize(8, 6, 3)).toBe(11n)
  })

  it('derangements(5) === 44n (from l4-model interviewNote)', () => {
    expect(derangements(5)).toBe(44n)
  })

  it('reduce(44n, 120n) = {n:11n, d:30n} — P(all wrong) = 11/30', () => {
    const r = reduce(44n, 120n)
    expect(r.n).toBe(11n)
    expect(r.d).toBe(30n)
  })

  it('probabilityFromCounts(624, 2598960) = {n:1n, d:4165n}', () => {
    const { n, d } = probabilityFromCounts(624, 2_598_960)
    expect(n).toBe(1n)
    expect(d).toBe(4165n)
  })

  // ── l4-win: accept["24"] === factorial(4) ──────────────────────────────

  it('l4-win accept includes factorial(4).toString() = "24"', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l4-win')!
    expect(beat.interaction.type).toBe('answerEntry')
    if (beat.interaction.type !== 'answerEntry') return
    const field = beat.interaction.fields.find((f) => f.id === 'arrangements')!
    expect(factorial(4).toString()).toBe('24')
    expect(field.accept).toContain(factorial(4).toString())
  })

  // ── l4-prove count field accept === (13n * 48n).toString() = "624" ────

  it('l4-prove count field accept includes "624" = 13 × 48', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l4-prove')!
    expect(beat.interaction.type).toBe('masteryChallenge')
    if (beat.interaction.type !== 'masteryChallenge') return
    const countField = beat.interaction.fields.find((f) => f.id === 'four-count')!
    expect((13n * 48n).toString()).toBe('624')
    expect(countField.accept).toContain((13n * 48n).toString())
  })

  // ── l4-prove prob field accept "1/4165" = reduce(624, C(52,5)) ────────

  it('l4-prove prob field accept includes "1/4165" matching engine', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l4-prove')!
    if (beat.interaction.type !== 'masteryChallenge') return
    const probField = beat.interaction.fields.find((f) => f.id === 'four-prob')!
    const { n, d } = probabilityFromCounts(624, 2_598_960)
    expect(n).toBe(1n)
    expect(d).toBe(4165n)
    expect(probField.accept).toContain(`${n}/${d}`)
  })

  // ── l4-recall pair C(52,5) = 2,598,960 ────────────────────────────────

  it('l4-recall pair C(52,5) right-value matches nCk(52,5)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l4-recall')!
    expect(beat.interaction.type).toBe('retrievalGrid')
    if (beat.interaction.type !== 'retrievalGrid') return
    const pair = beat.interaction.pairs.find((p) => p.left === 'C(52,5)')!
    expect(pair).toBeDefined()
    const digits = pair.right.replace(/,/g, '')
    expect(BigInt(digits)).toBe(nCk(52, 5))
  })

  // ── l4-explore initial: unionSize(8,6,3) === 11n ───────────────────────

  it('l4-explore initial.ab=3 with a=8,b=6 gives unionSize=11n', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l4-explore')!
    expect(beat.interaction.type).toBe('vennCounter')
    if (beat.interaction.type !== 'vennCounter') return
    const init = beat.interaction.initial
    expect(init).toBeDefined()
    const ia = init?.a ?? 8
    const ib = init?.b ?? 6
    const iab = init?.ab ?? 3
    expect(unionSize(ia, ib, iab)).toBe(11n)
  })

  // ── Structural checks ──────────────────────────────────────────────────

  it('lesson has exactly 11 beats', () => {
    expect(lesson.beats).toHaveLength(11)
  })

  it('beat order matches the spec', () => {
    const ids = lesson.beats.map((b) => b.beatId)
    expect(ids).toEqual([
      'l4-primer',
      'l4-recall',
      'l4-bet',
      'l4-win',
      'l4-explore',
      'l4-model',
      'l4-birthday-scaffold',
      'l4-birthday',
      'transfer-heldout',
      'l4-prove',
      'l4-recap',
    ])
  })

  it('last beat is recap', () => {
    const last = lesson.beats[lesson.beats.length - 1]
    expect(last.interaction.type).toBe('recap')
  })

  it('penultimate beat is l4-prove: masteryChallenge required:true', () => {
    const penult = lesson.beats[lesson.beats.length - 2]
    expect(penult.beatId).toBe('l4-prove')
    expect(penult.interaction.type).toBe('masteryChallenge')
    expect(penult.required).toBe(true)
  })

  it('l4-prove has no beat.pattern (engine cross-check not via automaton)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l4-prove')!
    expect(beat.pattern).toBeUndefined()
  })

  it('l4-recall is the first graded beat (retrievalGrid)', () => {
    const graded = new Set([
      'retrievalGrid', 'answerEntry', 'masteryChallenge',
      'countingTree', 'selectionGrid', 'handRanker',
    ])
    const first = lesson.beats.find((b) => graded.has(b.interaction.type))
    expect(first?.beatId).toBe('l4-recall')
    expect(first?.interaction.type).toBe('retrievalGrid')
  })

  it('l4-explore is vennCounter sets:2 with hero and correct initial values', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l4-explore')!
    if (beat.interaction.type !== 'vennCounter') return
    expect(beat.interaction.sets).toBe(2)
    expect(beat.interaction.initial?.a).toBe(8)
    expect(beat.interaction.initial?.b).toBe(6)
    expect(beat.interaction.initial?.ab).toBe(3)
    expect(beat.hero).toBeDefined()
    expect(beat.hero?.reducedMotionFinalFrame).toBe(true)
  })

  it('l4-birthday-scaffold has track "A" and required:false', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l4-birthday-scaffold')!
    expect(beat.track).toBe('A')
    expect(beat.required).toBe(false)
  })

  it('at least one beat has interviewNote', () => {
    expect(lesson.beats.some((b) => b.interviewNote)).toBe(true)
  })

  it('l4-model has introducesSymbol and groundedBy', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l4-model')!
    expect(beat.introducesSymbol).toBe('|A\u222aB\u222aC|')
    expect(beat.groundedBy).toContain('l4-explore')
  })

  it('l4-bet is a prediction with byOption feedback', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l4-bet')!
    expect(beat.interaction.type).toBe('prediction')
    expect(beat.feedback).toHaveProperty('byOption')
  })
})
