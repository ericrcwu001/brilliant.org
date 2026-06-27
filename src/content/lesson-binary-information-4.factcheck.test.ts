// Stage-2 fact-check: every graded number in lesson-binary-information-4.json is
// reproduced by src/engine/binary.ts. Also verifies bitBoard/weighing headlines
// match the engine (mirrors validate-fixtures.ts §3f). Fails fast on any drift.

import { describe, it, expect } from 'vitest'
import {
  weighingsForN,
  bachetWeights,
  balancedTernary,
} from '../engine/binary'
import fixture from '../../fixtures/lesson-binary-information-4.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

describe('lesson-binary-information-4 fact-check', () => {
  // ── engine goldens ──────────────────────────────────────────────────────────

  it('engine: weighingsForN(9n, true) = 2', () => {
    expect(weighingsForN(9n, true)).toBe(2)
  })

  it('engine: weighingsForN(12n, false) = 3', () => {
    expect(weighingsForN(12n, false)).toBe(3)
  })

  it('engine: bachetWeights(40n) = [1,3,9,27]', () => {
    expect(bachetWeights(40n)).toEqual([1n, 3n, 9n, 27n])
  })

  it('engine: balancedTernary(22n, [27,9,3,1]) = "+1,-1,+1,+1"', () => {
    expect(balancedTernary(22n, [27n, 9n, 3n, 1n])).toBe('+1,-1,+1,+1')
  })

  // ── header fields ───────────────────────────────────────────────────────────

  it('lessonId is lesson-binary-information-4', () => {
    expect(lesson.lessonId).toBe('lesson-binary-information-4')
  })

  it('courseId is course-binary-information', () => {
    expect(lesson.courseId).toBe('course-binary-information')
  })

  it('milestoneId is binary-information-base3', () => {
    expect(lesson.milestoneId).toBe('binary-information-base3')
  })

  it('unlocks is lesson-binary-information-5', () => {
    expect(lesson.unlocks).toBe('lesson-binary-information-5')
  })

  it('has exactly 10 beats', () => {
    expect(lesson.beats).toHaveLength(10)
  })

  // ── beat structure gates ─────────────────────────────────────────────────────

  it('first graded beat is l4-recall (retrievalGrid)', () => {
    const GRADED = new Set(['retrievalGrid', 'answerEntry', 'masteryChallenge'])
    const first = lesson.beats.find((b) => GRADED.has(b.interaction.type))
    expect(first?.beatId).toBe('l4-recall')
    expect(first?.interaction.type).toBe('retrievalGrid')
  })

  it('has at least one primer beat (track A, required false)', () => {
    const primer = lesson.beats.find((b) => b.interaction.type === 'primer')
    expect(primer).toBeTruthy()
    expect(primer?.track).toBe('A')
    expect(primer?.required).toBe(false)
  })

  it('prediction beat l4-bet uses byOption feedback', () => {
    const beat = beatById('l4-bet')
    expect(beat.interaction.type).toBe('prediction')
    expect('byOption' in beat.feedback).toBe(true)
  })

  it('exactly one beat has an interviewNote (l4-model)', () => {
    const noted = lesson.beats.filter((b) => b.interviewNote)
    expect(noted).toHaveLength(1)
    expect(noted[0].beatId).toBe('l4-model')
  })

  it('l4-transfer is track B, required false, and is immediately before l4-prove', () => {
    const transferIdx = lesson.beats.findIndex((b) => b.beatId === 'l4-transfer')
    const proveIdx = lesson.beats.findIndex((b) => b.beatId === 'l4-prove')
    expect(transferIdx).toBeGreaterThanOrEqual(0)
    const transfer = lesson.beats[transferIdx]
    expect(transfer.track).toBe('B')
    expect(transfer.required).toBe(false)
    expect(proveIdx).toBe(transferIdx + 1)
  })

  it('penultimate beat is masteryChallenge (required)', () => {
    const penult = lesson.beats[lesson.beats.length - 2]
    expect(penult.interaction.type).toBe('masteryChallenge')
    expect(penult.required).toBe(true)
  })

  it('last beat is recap', () => {
    const last = lesson.beats[lesson.beats.length - 1]
    expect(last.interaction.type).toBe('recap')
  })

  // ── graded accept values reproduced by engine ────────────────────────────────

  it('l4-win accept "2" = weighingsForN(9n, true)', () => {
    const beat = beatById('l4-win')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.weighings).toContain(String(weighingsForN(9n, true)))
    expect(fields.weighings).toContain('2')
  })

  it('l4-apply accept includes "1,3,9,27" = bachetWeights(40n) and "27" = largest', () => {
    const beat = beatById('l4-apply')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    const weights = bachetWeights(40n).map(String).join(',')
    expect(fields.weights).toContain(weights)
    expect(fields.weights).toContain('27') // largest weight
  })

  it('l4-prove accept "3" = weighingsForN(12n, false)', () => {
    const beat = beatById('l4-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.weighings).toContain(String(weighingsForN(12n, false)))
    expect(fields.weighings).toContain('3')
  })

  // ── weighing beat headlines cross-checked (mirrors validate-fixtures §3f) ────

  it('l4-explore scale headline = String(weighingsForN(12, false)) = "3"', () => {
    const beat = beatById('l4-explore')
    if (beat.interaction.type !== 'weighing') throw new Error('wrong type')
    expect(beat.interaction.display).toBe('scale')
    const items = beat.interaction.items!
    const directionKnown = beat.interaction.directionKnown ?? false
    const expected = String(weighingsForN(BigInt(items), directionKnown))
    expect(beat.interaction.headline).toBe(expected)
    expect(beat.interaction.headline).toBe('3')
  })

  it('l4-model scale headline = String(weighingsForN(12, false)) = "3"', () => {
    const beat = beatById('l4-model')
    if (beat.interaction.type !== 'weighing') throw new Error('wrong type')
    expect(beat.interaction.display).toBe('scale')
    const items = beat.interaction.items!
    const directionKnown = beat.interaction.directionKnown ?? false
    const expected = String(weighingsForN(BigInt(items), directionKnown))
    expect(beat.interaction.headline).toBe(expected)
    expect(beat.interaction.headline).toBe('3')
  })

  it('l4-transfer ternary headline = balancedTernary(22, [27,9,3,1] desc) = "+1,-1,+1,+1"', () => {
    const beat = beatById('l4-transfer')
    if (beat.interaction.type !== 'weighing') throw new Error('wrong type')
    expect(beat.interaction.display).toBe('ternary')
    const target = beat.interaction.target!
    const wDesc = [...beat.interaction.weights!.set].sort((a, b) => b - a).map((w) => BigInt(w))
    const expected = balancedTernary(BigInt(target), wDesc)
    expect(beat.interaction.headline).toBe(expected)
    expect(beat.interaction.headline).toBe('+1,-1,+1,+1')
  })
})
