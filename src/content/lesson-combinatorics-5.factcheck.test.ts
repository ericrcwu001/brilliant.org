// Stage-2 fact-check: every graded number in lesson-combinatorics-5 is
// reproduced by src/engine/combinatorics.ts. No rendering — pure math.

import { describe, it, expect } from 'vitest'
import { LessonSchema } from './schema'
import {
  pigeonholeMin,
  forcesCollision,
} from '../engine/combinatorics'
import fixtureRaw from '../../fixtures/lesson-combinatorics-5.json'

const lesson = LessonSchema.parse(fixtureRaw)

describe('lesson-combinatorics-5 fact-check', () => {
  // ── Engine golden values ────────────────────────────────────────────────

  it('forcesCollision(4,3) === true  (l5-win threshold)', () => {
    expect(forcesCollision(4, 3)).toBe(true)
  })

  it('forcesCollision(3,3) === false (boundary: 3 socks can be all-different)', () => {
    expect(forcesCollision(3, 3)).toBe(false)
  })

  it('forcesCollision(26,25) === true (l5-apply handshakes)', () => {
    expect(forcesCollision(26, 25)).toBe(true)
  })

  it('pigeonholeMin(4,3) === 2', () => {
    expect(pigeonholeMin(4, 3)).toBe(2)
  })

  it('pigeonholeMin(7,3) === 3 (l5-scaffold)', () => {
    expect(pigeonholeMin(7, 3)).toBe(3)
  })

  it('pigeonholeMin(51,25) === 3 (l5-prove ants)', () => {
    expect(pigeonholeMin(51, 25)).toBe(3)
  })

  // ── l5-win: accept === "4" and forcesCollision(4,3)===true ─────────────

  it('l5-win accept[0] === "4"', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l5-win')!
    expect(beat.interaction.type).toBe('answerEntry')
    if (beat.interaction.type !== 'answerEntry') return
    const field = beat.interaction.fields[0]!
    expect(field.accept[0]).toBe('4')
    expect(forcesCollision(4, 3)).toBe(true)
    expect(forcesCollision(3, 3)).toBe(false)
  })

  // ── l5-apply: field-0 accept === "25" and forcesCollision(26,25)===true ─

  it('l5-apply field-0 accept[0] === "25"', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l5-apply')!
    expect(beat.interaction.type).toBe('answerEntry')
    if (beat.interaction.type !== 'answerEntry') return
    const holesField = beat.interaction.fields.find((f) => f.id === 'holes')!
    expect(holesField.accept[0]).toBe('25')
    expect(forcesCollision(26, 25)).toBe(true)
  })

  // ── l5-prove: accept === pigeonholeMin(51,25).toString() === "3" ────────

  it('l5-prove accept[0] === pigeonholeMin(51,25).toString() = "3"', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l5-prove')!
    expect(beat.interaction.type).toBe('masteryChallenge')
    if (beat.interaction.type !== 'masteryChallenge') return
    const field = beat.interaction.fields[0]!
    const expected = pigeonholeMin(51, 25).toString()
    expect(expected).toBe('3')
    expect(field.accept[0]).toBe(expected)
  })

  // ── Every pigeonholeBoard beat: forcesCollision===true, pigeonholeMin≥2 ─

  it('l5-explore pigeonholeBoard: forcesCollision(4,3)===true, pigeonholeMin(4,3)>=2', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l5-explore')!
    expect(beat.interaction.type).toBe('pigeonholeBoard')
    if (beat.interaction.type !== 'pigeonholeBoard') return
    expect(forcesCollision(beat.interaction.items, beat.interaction.holes)).toBe(true)
    expect(pigeonholeMin(beat.interaction.items, beat.interaction.holes)).toBeGreaterThanOrEqual(2)
  })

  it('l5-scaffold pigeonholeBoard: forcesCollision(7,3)===true, pigeonholeMin(7,3)>=2', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l5-scaffold')!
    expect(beat.interaction.type).toBe('pigeonholeBoard')
    if (beat.interaction.type !== 'pigeonholeBoard') return
    expect(forcesCollision(beat.interaction.items, beat.interaction.holes)).toBe(true)
    expect(pigeonholeMin(beat.interaction.items, beat.interaction.holes)).toBeGreaterThanOrEqual(2)
  })

  // ── Structural checks ───────────────────────────────────────────────────

  it('lesson has exactly 10 beats', () => {
    expect(lesson.beats).toHaveLength(10)
  })

  it('beat order matches the spec', () => {
    const ids = lesson.beats.map((b) => b.beatId)
    expect(ids).toEqual([
      'l5-recall',
      'l5-bet',
      'l5-primer',
      'l5-win',
      'l5-explore',
      'l5-scaffold',
      'l5-model',
      'l5-apply',
      'l5-prove',
      'l5-recap',
    ])
  })

  it('last beat is recap', () => {
    const last = lesson.beats[lesson.beats.length - 1]!
    expect(last.interaction.type).toBe('recap')
  })

  it('penultimate beat is l5-prove: masteryChallenge required:true', () => {
    const penult = lesson.beats[lesson.beats.length - 2]!
    expect(penult.beatId).toBe('l5-prove')
    expect(penult.interaction.type).toBe('masteryChallenge')
    expect(penult.required).toBe(true)
  })

  it('l5-prove has no beat.pattern', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l5-prove')!
    expect(beat.pattern).toBeUndefined()
  })

  it('l5-recall is retrievalGrid (first graded beat = retrieval opener)', () => {
    const graded = new Set([
      'retrievalGrid', 'answerEntry', 'masteryChallenge',
      'countingTree', 'selectionGrid', 'handRanker',
    ])
    const first = lesson.beats.find((b) => graded.has(b.interaction.type))
    expect(first?.beatId).toBe('l5-recall')
    expect(first?.interaction.type).toBe('retrievalGrid')
  })

  it('l5-explore is pigeonholeBoard with hero and reducedMotionFinalFrame', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l5-explore')!
    expect(beat.interaction.type).toBe('pigeonholeBoard')
    expect(beat.hero).toBeDefined()
    expect(beat.hero?.reducedMotionFinalFrame).toBe(true)
  })

  it('l5-scaffold has track "A" and required:false', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l5-scaffold')!
    expect(beat.track).toBe('A')
    expect(beat.required).toBe(false)
  })

  it('at least one beat has interviewNote', () => {
    expect(lesson.beats.some((b) => b.interviewNote)).toBe(true)
  })

  it('l5-model has introducesSymbol "⌈N/H⌉" grounded by l5-win and l5-explore', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l5-model')!
    expect(beat.introducesSymbol).toBe('⌈N/H⌉')
    expect(beat.groundedBy).toContain('l5-win')
    expect(beat.groundedBy).toContain('l5-explore')
  })

  it('l5-bet is a prediction with byOption feedback', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l5-bet')!
    expect(beat.interaction.type).toBe('prediction')
    expect(beat.feedback).toHaveProperty('byOption')
  })

  it('l5-primer is a primer with variant "custom"', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'l5-primer')!
    expect(beat.interaction.type).toBe('primer')
    if (beat.interaction.type !== 'primer') return
    expect(beat.interaction.variant).toBe('custom')
  })
})
