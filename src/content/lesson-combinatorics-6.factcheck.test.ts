// Stage-2 fact-check: every graded number in lesson-combinatorics-6 is
// reproduced by src/engine/combinatorics.ts. No rendering — pure math.

import { describe, it, expect } from 'vitest'
import { LessonSchema } from './schema'
import {
  nCk,
  product,
  probabilityFromCounts,
} from '../engine/combinatorics'
import fixtureRaw from '../../fixtures/lesson-combinatorics-6.json'

const lesson = LessonSchema.parse(fixtureRaw)

describe('lesson-combinatorics-6 fact-check', () => {
  // ── Engine cross-check anchors ──────────────────────────────────────────

  it('probabilityFromCounts(624, 2598960) = {n:1n, d:4165n}', () => {
    const p = probabilityFromCounts(624, 2_598_960)
    expect(p.n).toBe(1n)
    expect(p.d).toBe(4165n)
  })

  it('probabilityFromCounts(3744, 2598960) = {n:6n, d:4165n}', () => {
    const p = probabilityFromCounts(3744, 2_598_960)
    expect(p.n).toBe(6n)
    expect(p.d).toBe(4165n)
  })

  it('probabilityFromCounts(123552, 2598960) = {n:198n, d:4165n}', () => {
    const p = probabilityFromCounts(123_552, 2_598_960)
    expect(p.n).toBe(198n)
    expect(p.d).toBe(4165n)
  })

  it('probabilityFromCounts(20, 216) = {n:5n, d:54n}', () => {
    const p = probabilityFromCounts(20, 216)
    expect(p.n).toBe(5n)
    expect(p.d).toBe(54n)
  })

  it('product([13,4,12,6]) === 3744n (full house chip product)', () => {
    expect(product([13, 4, 12, 6])).toBe(3744n)
  })

  it('product([78,6,6,44]) === 123552n (two-pairs chip product)', () => {
    expect(product([78, 6, 6, 44])).toBe(123_552n)
  })

  it('nCk(13,2)*nCk(4,2)*nCk(4,2)*44n === 123552n (two-pairs formula)', () => {
    const count = nCk(13, 2) * nCk(4, 2) * nCk(4, 2) * 44n
    expect(count).toBe(123_552n)
  })

  // ── l6-win: answerEntry accept includes 1/4165 ──────────────────────────

  it('l6-win accept includes "1/4165" matching probabilityFromCounts(624, 2598960)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-win')!
    expect(beat.interaction.type).toBe('answerEntry')
    if (beat.interaction.type !== 'answerEntry') return
    const field = beat.interaction.fields.find((f) => f.id === 'foak-prob')!
    const { n, d } = probabilityFromCounts(624, 2_598_960)
    expect(field.accept).toContain(`${n}/${d}`)
  })

  // ── l6-explore: probabilityCounter chips produce 3744 → 6/4165 ──────────

  it('l6-explore factors product equals 3744n', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-explore')!
    expect(beat.interaction.type).toBe('probabilityCounter')
    if (beat.interaction.type !== 'probabilityCounter') return
    const vals = beat.interaction.factors.map((f) => f.value)
    expect(product(vals)).toBe(3744n)
  })

  it('l6-explore probabilityFromCounts(3744, 2598960) = {n:6n, d:4165n}', () => {
    const { n, d } = probabilityFromCounts(3744, 2_598_960)
    expect(n).toBe(6n)
    expect(d).toBe(4165n)
  })

  // ── l6-pairs-scaffold: factors produce 123552 ───────────────────────────

  it('l6-pairs-scaffold factors product equals 123552n', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-pairs-scaffold')!
    expect(beat.interaction.type).toBe('probabilityCounter')
    if (beat.interaction.type !== 'probabilityCounter') return
    const vals = beat.interaction.factors.map((f) => f.value)
    expect(product(vals)).toBe(123_552n)
  })

  // ── l6-prove: masteryChallenge accept matches engine ────────────────────

  it('l6-prove count accept "123552" === nCk(13,2)*nCk(4,2)*nCk(4,2)*44n', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-prove')!
    expect(beat.interaction.type).toBe('masteryChallenge')
    if (beat.interaction.type !== 'masteryChallenge') return
    const countField = beat.interaction.fields.find((f) => f.id === 'two-pair-count')!
    const engineCount = (nCk(13, 2) * nCk(4, 2) * nCk(4, 2) * 44n).toString()
    expect(engineCount).toBe('123552')
    expect(countField.accept).toContain(engineCount)
  })

  it('l6-prove prob accept "198/4165" matches probabilityFromCounts(123552, 2598960)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-prove')!
    expect(beat.interaction.type).toBe('masteryChallenge')
    if (beat.interaction.type !== 'masteryChallenge') return
    const probField = beat.interaction.fields.find((f) => f.id === 'two-pair-prob')!
    const { n, d } = probabilityFromCounts(123_552, 2_598_960)
    expect(`${n}/${d}`).toBe('198/4165')
    expect(probField.accept).toContain('198/4165')
  })

  // ── l6-rank: engine sort of hands by favorable ascending ────────────────

  it('l6-rank engine sort by favorable ascending = [624, 3744]', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-rank')!
    expect(beat.interaction.type).toBe('handRanker')
    if (beat.interaction.type !== 'handRanker') return
    const sorted = [...beat.interaction.hands].sort(
      (a, b) => a.favorable - b.favorable,
    )
    expect(sorted.map((h) => h.favorable)).toEqual([624, 3744])
  })

  // ── l6-recall: retrieval pairs include the correct fractions ────────────

  it('l6-recall includes "1/4165" (probabilityFromCounts(624,2598960).d === 4165n)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-recall')!
    expect(beat.interaction.type).toBe('retrievalGrid')
    if (beat.interaction.type !== 'retrievalGrid') return
    const rights = beat.interaction.pairs.map((p) => p.right)
    expect(rights).toContain('1/4165')
    const { d } = probabilityFromCounts(624, 2_598_960)
    expect(d).toBe(4165n)
  })

  it('l6-recall includes "5/54" (probabilityFromCounts(20,216) = {n:5n,d:54n})', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-recall')!
    expect(beat.interaction.type).toBe('retrievalGrid')
    if (beat.interaction.type !== 'retrievalGrid') return
    const rights = beat.interaction.pairs.map((p) => p.right)
    expect(rights).toContain('5/54')
    const { n, d } = probabilityFromCounts(20, 216)
    expect(n).toBe(5n)
    expect(d).toBe(54n)
  })

  // ── Structural checks ──────────────────────────────────────────────────

  it('lesson has exactly 10 beats', () => {
    expect(lesson.beats).toHaveLength(10)
  })

  it('beat order matches the spec', () => {
    const ids = lesson.beats.map((b) => b.beatId)
    expect(ids).toEqual([
      'l6-primer',
      'l6-recall',
      'l6-bet',
      'l6-win',
      'l6-explore',
      'l6-model',
      'l6-rank',
      'l6-pairs-scaffold',
      'l6-prove',
      'l6-recap',
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

  it('l6-pairs-scaffold has track:"A" and required:false', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-pairs-scaffold')!
    expect(beat.track).toBe('A')
    expect(beat.required).toBe(false)
  })

  it('l6-explore is probabilityCounter with hero block and reducedMotionFinalFrame', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-explore')!
    expect(beat.interaction.type).toBe('probabilityCounter')
    expect(beat.hero).toBeDefined()
    expect(beat.hero?.reducedMotionFinalFrame).toBe(true)
  })

  it('l6-explore probabilityCounter has no accept (ungraded)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-explore')!
    if (beat.interaction.type !== 'probabilityCounter') return
    expect(beat.interaction.accept).toBeUndefined()
  })

  it('l6-pairs-scaffold probabilityCounter has no accept (ungraded)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-pairs-scaffold')!
    if (beat.interaction.type !== 'probabilityCounter') return
    expect(beat.interaction.accept).toBeUndefined()
  })

  it('l6-rank is handRanker with order rarestFirst', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-rank')!
    expect(beat.interaction.type).toBe('handRanker')
    if (beat.interaction.type !== 'handRanker') return
    expect(beat.interaction.order).toBe('rarestFirst')
  })

  it('l6-model has introducesSymbol and groundedBy', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-model')!
    expect(beat.introducesSymbol).toBe('P=favorable/total')
    expect(beat.groundedBy).toContain('l6-win')
    expect(beat.groundedBy).toContain('l6-explore')
  })

  it('at least one beat has interviewNote', () => {
    expect(lesson.beats.some((b) => b.interviewNote)).toBe(true)
  })

  it('l6-prove has interviewNote about GB p.34', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-prove')!
    expect(beat.interviewNote).toContain('GB p.34')
  })

  it('l6-recall is the first graded beat (retrievalGrid)', () => {
    const GRADED = new Set([
      'retrievalGrid', 'answerEntry', 'masteryChallenge', 'handRanker',
    ])
    const firstGraded = lesson.beats.find((b) => GRADED.has(b.interaction.type))
    expect(firstGraded?.beatId).toBe('l6-recall')
    expect(firstGraded?.interaction.type).toBe('retrievalGrid')
  })

  it('l6-prove pattern field is absent (engine-verified, no automaton cross-check)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-prove')!
    expect(beat.pattern).toBeUndefined()
  })

  it('l6-bet uses byOption (refutational) feedback', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-bet')!
    expect(beat.feedback).toHaveProperty('byOption')
  })

  it('at least one beat has track:"A" (Track-A scaffold)', () => {
    expect(lesson.beats.some((b) => b.track === 'A')).toBe(true)
  })

  it('l6-rank is required:true', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l6-rank')!
    expect(beat.required).toBe(true)
  })
})
