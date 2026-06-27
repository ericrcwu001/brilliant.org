// Stage-2 fact-check: every graded number in lesson-binary-information-1.json is
// reproduced by src/engine/binary.ts. Fails fast if a fixture author
// transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { toBinary, powersOfTwo } from '../engine/binary'
import fixture from '../../fixtures/lesson-binary-information-1.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

describe('lesson-binary-information-1 fact-check', () => {
  it('l1-recall pairs match 2^n for n = 1, 2, 3, 10', () => {
    const beat = beatById('l1-recall')
    if (beat.interaction.type !== 'retrievalGrid') throw new Error('wrong type')
    const map = Object.fromEntries(beat.interaction.pairs.map((p) => [p.left, p.right]))
    expect(map['1 flip']).toBe('2')
    expect(map['2 flips']).toBe('4')
    expect(map['3 flips']).toBe('8')
    expect(map['10 flips']).toBe('1024')
    // Engine check: 2^10 = 1024
    expect(String(2 ** 10)).toBe('1024')
  })

  it('l1-bet correct option is "2 cuts"', () => {
    const beat = beatById('l1-bet')
    if (beat.interaction.type !== 'prediction') throw new Error('wrong type')
    if (!('byOption' in beat.feedback)) throw new Error('expected byOption feedback')
    const correct = Object.entries(beat.feedback.byOption).find(([, v]) => v.correct)?.[0]
    expect(correct).toBe('2 cuts')
    // Engine check: powersOfTwo(7) = [4, 2, 1] — three pieces, two cuts
    expect(powersOfTwo(7n).map(Number)).toEqual([4, 2, 1])
    expect(powersOfTwo(7n).length - 1).toBe(2) // cuts = pieces - 1
  })

  it('l1-win accept includes "4" and powersOfTwo(7) largest is 4', () => {
    const beat = beatById('l1-win')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.largest).toContain('4')
    // Engine check: largest power of 2 in 7 is 4
    expect(String(powersOfTwo(7n)[0])).toBe('4')
  })

  it('l1-explore bitBoard headline = toBinary(7) = "111"', () => {
    const beat = beatById('l1-explore')
    if (beat.interaction.type !== 'bitBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(toBinary(7n))
    expect(beat.interaction.headline).toBe('111')
  })

  it('l1-model bitBoard headline = toBinary(1000) = "1111101000"', () => {
    const beat = beatById('l1-model')
    if (beat.interaction.type !== 'bitBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(toBinary(1000n))
    expect(beat.interaction.headline).toBe('1111101000')
    // interviewNote is present on this beat
    expect(beat.interviewNote).toBeTruthy()
  })

  it('l1-apply accept includes "1100100" and toBinary(100) = "1100100"', () => {
    const beat = beatById('l1-apply')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.binary100).toContain(toBinary(100n))
    expect(toBinary(100n)).toBe('1100100')
  })

  it('l1-transfer accept includes "101011" and toBinary(43) = "101011"; is track B required:false', () => {
    const beat = beatById('l1-transfer')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.binary43).toContain(toBinary(43n))
    expect(toBinary(43n)).toBe('101011')
    // gate: track B, required:false
    expect(beat.track).toBe('B')
    expect(beat.required).toBe(false)
  })

  it('l1-prove accept includes "1111101000" and toBinary(1000) = "1111101000"; is required masteryChallenge', () => {
    const beat = beatById('l1-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.binary1000).toContain(toBinary(1000n))
    expect(toBinary(1000n)).toBe('1111101000')
    expect(beat.required).toBe(true)
  })

  it('engine goldens: toBinary covers all four fixture answer values', () => {
    expect(toBinary(7n)).toBe('111')
    expect(toBinary(100n)).toBe('1100100')
    expect(toBinary(43n)).toBe('101011')
    expect(toBinary(1000n)).toBe('1111101000')
  })

  it('powersOfTwo goldens: 7 and 1000', () => {
    expect(powersOfTwo(7n).map(Number)).toEqual([4, 2, 1])
    expect(powersOfTwo(1000n).map(Number)).toEqual([512, 256, 128, 64, 32, 8])
  })

  it('lesson structure: 10 beats, recap is last, masteryChallenge is penultimate', () => {
    expect(lesson.beats.length).toBe(10)
    const last = lesson.beats[lesson.beats.length - 1]
    const penult = lesson.beats[lesson.beats.length - 2]
    expect(last.interaction.type).toBe('recap')
    expect(penult.interaction.type).toBe('masteryChallenge')
    expect(penult.required).toBe(true)
  })

  it('gate: first graded beat is l1-recall (retrievalGrid)', () => {
    const GRADED = new Set(['retrievalGrid', 'answerEntry', 'masteryChallenge'])
    const firstGraded = lesson.beats.find((b) => GRADED.has(b.interaction.type))
    expect(firstGraded?.beatId).toBe('l1-recall')
    expect(firstGraded?.interaction.type).toBe('retrievalGrid')
  })

  it('gate: exactly one interviewNote in the lesson', () => {
    const notedBeats = lesson.beats.filter((b) => b.interviewNote)
    expect(notedBeats.length).toBe(1)
    expect(notedBeats[0].beatId).toBe('l1-model')
  })

  it('gate: at least one primer beat', () => {
    const primers = lesson.beats.filter((b) => b.interaction.type === 'primer')
    expect(primers.length).toBeGreaterThanOrEqual(1)
  })

  it('gate: prediction beat uses byOption feedback', () => {
    const beat = beatById('l1-bet')
    expect('byOption' in beat.feedback).toBe(true)
  })

  it('gate: l1-transfer immediately precedes l1-prove', () => {
    const transferIdx = lesson.beats.findIndex((b) => b.beatId === 'l1-transfer')
    const proveIdx = lesson.beats.findIndex((b) => b.beatId === 'l1-prove')
    expect(proveIdx).toBe(transferIdx + 1)
  })
})
