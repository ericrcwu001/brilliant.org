// Stage-2 fact-check: every graded number in lesson-binary-information-3.json is
// reproduced by src/engine/binary.ts. Fails fast if a fixture author transcribes
// a wrong number.

import { describe, it, expect } from 'vitest'
import { toBinary, fromBinary, bitsNeeded, weighingsForN } from '../engine/binary'
import fixture from '../../fixtures/lesson-binary-information-3.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

describe('lesson-binary-information-3 fact-check', () => {
  it('l3-recall pairs: k bits ↔ 2ᵏ items for k=1,2,3,10', () => {
    const beat = beatById('l3-recall')
    if (beat.interaction.type !== 'retrievalGrid') throw new Error('wrong type')
    const map = Object.fromEntries(beat.interaction.pairs.map((p) => [p.left, p.right]))
    expect(map['k = 1']).toBe('2')
    expect(map['k = 2']).toBe('4')
    expect(map['k = 3']).toBe('8')
    expect(map['k = 10']).toBe('1024')
    // Engine verify: 2^k
    expect(String(1 << 1)).toBe('2')
    expect(String(1 << 2)).toBe('4')
    expect(String(1 << 3)).toBe('8')
    expect(String(1 << 10)).toBe('1024')
  })

  it('l3-bet correct option = "All 1000" and bitsNeeded(1000) = 10', () => {
    const beat = beatById('l3-bet')
    if (beat.interaction.type !== 'prediction') throw new Error('wrong type')
    if (!('byOption' in beat.feedback)) throw new Error('expected byOption feedback')
    const correct = Object.entries(beat.feedback.byOption).find(([, v]) => v.correct)?.[0]
    expect(correct).toBe('All 1000')
    // Engine verify: 10 mice cover 2^10 = 1024 >= 1000
    expect(bitsNeeded(1000n)).toBe(10)
    expect(1 << 10).toBeGreaterThanOrEqual(1000)
  })

  it('l3-win accept = ["4"] — 2 mice → 2² = 4 bottles', () => {
    const beat = beatById('l3-win')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.bottles).toContain('4')
    // Engine verify: 2^2 = 4
    expect(1 << 2).toBe(4)
  })

  it('l3-explore bitBoard groupTest headline = String(fromBinary(toBinary(culprit=176))) = "176"', () => {
    const beat = beatById('l3-explore')
    if (beat.interaction.type !== 'bitBoard') throw new Error('wrong type')
    expect(beat.interaction.display).toBe('groupTest')
    const culprit = beat.interaction.culprit
    expect(culprit).toBe(176)
    const pattern = toBinary(BigInt(culprit!))
    const recovered = fromBinary(pattern)
    expect(String(recovered)).toBe('176')
    expect(beat.interaction.headline).toBe(String(recovered))
    expect(beat.interaction.headline).toBe('176')
    // Also verify the binary pattern
    expect(pattern).toBe('10110000')
  })

  it('l3-model bitBoard groupTest headline = String(fromBinary(toBinary(culprit=1000))) = "1000"', () => {
    const beat = beatById('l3-model')
    if (beat.interaction.type !== 'bitBoard') throw new Error('wrong type')
    expect(beat.interaction.display).toBe('groupTest')
    const culprit = beat.interaction.culprit
    expect(culprit).toBe(1000)
    const pattern = toBinary(BigInt(culprit!))
    const recovered = fromBinary(pattern)
    expect(String(recovered)).toBe('1000')
    expect(beat.interaction.headline).toBe(String(recovered))
    expect(beat.interaction.headline).toBe('1000')
    // Also verify the canonical binary pattern from the brief
    expect(pattern).toBe('1111101000')
  })

  it('l3-model carries the interviewNote', () => {
    const beat = beatById('l3-model')
    expect(beat.interviewNote).toBeTruthy()
    expect(beat.interviewNote).toContain('poisoned-wine')
  })

  it('l3-apply accept = ["2"] — 9 balls, weighingsForN(9, true) = 2', () => {
    const beat = beatById('l3-apply')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.weighings).toContain('2')
    // Engine verify: 9 balls, direction known (heavier), 3^2 = 9 >= 9
    expect(weighingsForN(9n, true)).toBe(2)
  })

  it('l3-transfer accept = ["10"] — 600 bottles, bitsNeeded(600) = 10', () => {
    const beat = beatById('l3-transfer')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    expect(beat.track).toBe('B')
    expect(beat.required).toBe(false)
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.mice).toContain('10')
    // Engine verify: 2^9 = 512 < 600, 2^10 = 1024 >= 600
    expect(bitsNeeded(600n)).toBe(10)
    expect(1 << 9).toBeLessThan(600)
    expect(1 << 10).toBeGreaterThanOrEqual(600)
  })

  it('l3-prove masteryChallenge accept = ["10"] — 1000 bottles, bitsNeeded(1000) = 10', () => {
    const beat = beatById('l3-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    expect(beat.required).toBe(true)
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.mice).toContain('10')
    // Engine verify: bitsNeeded(1000) = 10; 2^10 = 1024 >= 1000
    expect(bitsNeeded(1000n)).toBe(10)
    expect(1 << 10).toBeGreaterThanOrEqual(1000)
    // The bottle 1000 binary label is the spec's headline example
    expect(toBinary(1000n)).toBe('1111101000')
    expect(fromBinary('1111101000')).toBe(1000n)
  })

  it('l3-recap is the last beat and is a recap', () => {
    const last = lesson.beats[lesson.beats.length - 1]
    expect(last.beatId).toBe('l3-recap')
    expect(last.interaction.type).toBe('recap')
  })

  it('l3-prove is the penultimate beat (masteryChallenge before recap)', () => {
    const penult = lesson.beats[lesson.beats.length - 2]
    expect(penult.beatId).toBe('l3-prove')
    expect(penult.interaction.type).toBe('masteryChallenge')
    expect(penult.required).toBe(true)
  })

  it('l3-transfer immediately precedes l3-prove', () => {
    const transferIdx = lesson.beats.findIndex((b) => b.beatId === 'l3-transfer')
    const proveIdx = lesson.beats.findIndex((b) => b.beatId === 'l3-prove')
    expect(proveIdx).toBe(transferIdx + 1)
  })

  it('first graded beat is l3-recall (retrievalGrid)', () => {
    const GRADED_TYPES = new Set([
      'retrievalGrid', 'equationTiles', 'substitution', 'patternPick',
      'stateTap', 'answerEntry', 'masteryChallenge',
    ])
    const firstGraded = lesson.beats.find((b) => GRADED_TYPES.has(b.interaction.type))
    expect(firstGraded?.beatId).toBe('l3-recall')
    expect(firstGraded?.interaction.type).toBe('retrievalGrid')
  })

  it('has at least one primer beat (track A, required false)', () => {
    const primer = lesson.beats.find((b) => b.interaction.type === 'primer')
    expect(primer).toBeTruthy()
    expect(primer?.track).toBe('A')
    expect(primer?.required).toBe(false)
  })

  it('prediction beat l3-bet uses byOption feedback', () => {
    const beat = beatById('l3-bet')
    expect(beat.interaction.type).toBe('prediction')
    expect('byOption' in beat.feedback).toBe(true)
  })

  it('exactly one beat carries an interviewNote', () => {
    const withNote = lesson.beats.filter((b) => b.interviewNote)
    expect(withNote.length).toBe(1)
    expect(withNote[0].beatId).toBe('l3-model')
  })

  it('has exactly 10 beats', () => {
    expect(lesson.beats.length).toBe(10)
  })

  it('engine goldens: bitsNeeded and weighingsForN', () => {
    expect(bitsNeeded(1000n)).toBe(10)
    expect(bitsNeeded(600n)).toBe(10)
    expect(toBinary(1000n)).toBe('1111101000')
    expect(fromBinary('1111101000')).toBe(1000n)
    expect(weighingsForN(9n, true)).toBe(2)
  })
})
