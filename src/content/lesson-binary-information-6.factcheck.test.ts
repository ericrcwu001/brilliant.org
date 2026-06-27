// Stage-2 fact-check: every graded number in lesson-binary-information-6.json is
// reproduced by src/engine/binary.ts. Fails fast if a fixture author transcribes
// a wrong answer. Also asserts bitBoard/weighing headlines match the engine.

import { describe, it, expect } from 'vitest'
import {
  missingNumber,
  bitsNeeded,
  weighingsForN,
  xorAll,
  toBinary,
} from '../engine/binary'
import fixture from '../../fixtures/lesson-binary-information-6.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

describe('lesson-binary-information-6 fact-check', () => {
  // ── engine goldens ─────────────────────────────────────────────────────────

  it('engine golden: missingNumber([3,0,1]) = 2 (l6-bet scenario)', () => {
    expect(missingNumber([3n, 0n, 1n])).toBe(2n)
  })

  it('engine golden: missingNumber([0,1,3]) = 2 (l6-win)', () => {
    expect(missingNumber([0n, 1n, 3n])).toBe(2n)
  })

  it('engine golden: missingNumber([0,1,3,4]) = 2 (l6-transfer)', () => {
    expect(missingNumber([0n, 1n, 3n, 4n])).toBe(2n)
  })

  it('engine golden: missingNumber([9,6,4,2,3,5,7,0,1]) = 8 (l6-prove)', () => {
    expect(missingNumber([9n, 6n, 4n, 2n, 3n, 5n, 7n, 0n, 1n])).toBe(8n)
  })

  it('engine golden: bitsNeeded(27) = 5 yes/no questions (l6-model)', () => {
    expect(bitsNeeded(27n)).toBe(5)
  })

  it('engine golden: weighingsForN(27, true) = 3 weighings (l6-model)', () => {
    expect(weighingsForN(27n, true)).toBe(3)
  })

  it('engine golden: xor of indices 0..3 = 0; xor of values [0,1,3] = 2; headline = toBinary(0^2) = "10"', () => {
    const idxXor = xorAll([0n, 1n, 2n, 3n])
    const valXor = xorAll([0n, 1n, 3n])
    expect(idxXor).toBe(0n)
    expect(valXor).toBe(2n)
    expect(toBinary(xorAll([idxXor, valXor]))).toBe('10')
  })

  // ── fixture beat checks ────────────────────────────────────────────────────

  it('l6-recall is the first graded beat and is a retrievalGrid', () => {
    const b = beatById('l6-recall')
    expect(b.interaction.type).toBe('retrievalGrid')
    // It should be the first graded beat in the lesson
    const gradedTypes = new Set([
      'retrievalGrid', 'equationTiles', 'substitution', 'patternPick',
      'stateTap', 'answerEntry', 'masteryChallenge',
    ])
    const firstGraded = lesson.beats.find((beat) => gradedTypes.has(beat.interaction.type))
    expect(firstGraded?.beatId).toBe('l6-recall')
  })

  it('l6-recall has 4 pairs covering the mixed interleave scenario', () => {
    const b = beatById('l6-recall')
    if (b.interaction.type !== 'retrievalGrid') throw new Error('wrong type')
    expect(b.interaction.pairs).toHaveLength(4)
  })

  it('l6-bet uses byOption feedback (refutational)', () => {
    const b = beatById('l6-bet')
    if (b.interaction.type !== 'prediction') throw new Error('wrong type')
    expect('byOption' in b.feedback).toBe(true)
    if (!('byOption' in b.feedback)) throw new Error('no byOption')
    const correct = Object.entries(b.feedback.byOption).find(([, v]) => v.correct)?.[0]
    expect(correct).toBeDefined()
    expect(correct).toContain('XOR')
    expect(correct).toContain('2')
  })

  it('l6-primer is track A and required:false (JIT primer gate)', () => {
    const b = beatById('l6-primer')
    expect(b.track).toBe('A')
    expect(b.required).toBe(false)
    expect(b.interaction.type).toBe('primer')
  })

  it('l6-win accept includes "2" (missingNumber([0,1,3]) = 2)', () => {
    const b = beatById('l6-win')
    if (b.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const allAccepts = b.interaction.fields.flatMap((f) => f.accept)
    expect(allAccepts).toContain(String(missingNumber([0n, 1n, 3n])))
    expect(allAccepts).toContain('2')
  })

  it('l6-explore bitBoard headline = toBinary(xorAll([0, 2])) = "10"', () => {
    const b = beatById('l6-explore')
    if (b.interaction.type !== 'bitBoard') throw new Error('wrong type')
    expect(b.interaction.display).toBe('register')
    expect(b.interaction.op).toBe('xor')
    expect(b.interaction.operands).toBeDefined()
    const a = BigInt(b.interaction.operands!.a)
    const bVal = BigInt(b.interaction.operands!.b!)
    const expected = toBinary(xorAll([a, bVal]))
    expect(b.interaction.headline).toBe(expected)
    expect(b.interaction.headline).toBe('10')
  })

  it('l6-model carries the interviewNote', () => {
    const b = beatById('l6-model')
    expect(b.interviewNote).toBeDefined()
    expect(typeof b.interviewNote).toBe('string')
    expect(b.interviewNote!.length).toBeGreaterThan(0)
  })

  it('l6-model is the ONLY beat with an interviewNote', () => {
    const withNote = lesson.beats.filter((b) => b.interviewNote !== undefined)
    expect(withNote).toHaveLength(1)
    expect(withNote[0].beatId).toBe('l6-model')
  })

  it('l6-model pairs include 5 questions and 3 weighings for N=27', () => {
    const b = beatById('l6-model')
    if (b.interaction.type !== 'retrievalGrid') throw new Error('wrong type')
    const rights = b.interaction.pairs.map((p) => p.right)
    expect(rights.some((r) => r.includes(String(bitsNeeded(27n))))).toBe(true)   // "5"
    expect(rights.some((r) => r.includes(String(weighingsForN(27n, true))))).toBe(true) // "3"
  })

  it('l6-transfer is track B and required:false (held-out transfer)', () => {
    const b = beatById('l6-transfer')
    expect(b.track).toBe('B')
    expect(b.required).toBe(false)
    if (b.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const allAccepts = b.interaction.fields.flatMap((f) => f.accept)
    expect(allAccepts).toContain(String(missingNumber([0n, 1n, 3n, 4n])))
    expect(allAccepts).toContain('2')
  })

  it('l6-transfer immediately precedes l6-prove (held-out before mastery)', () => {
    const idx = lesson.beats.findIndex((b) => b.beatId === 'l6-transfer')
    const proveIdx = lesson.beats.findIndex((b) => b.beatId === 'l6-prove')
    expect(proveIdx).toBe(idx + 1)
  })

  it('l6-prove is a required masteryChallenge with accept "8"', () => {
    const b = beatById('l6-prove')
    expect(b.required).toBe(true)
    if (b.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const allAccepts = b.interaction.fields.flatMap((f) => f.accept)
    expect(allAccepts).toContain(String(missingNumber([9n, 6n, 4n, 2n, 3n, 5n, 7n, 0n, 1n])))
    expect(allAccepts).toContain('8')
  })

  it('penultimate beat is l6-prove (masteryChallenge) and last beat is l6-recap', () => {
    const beats = lesson.beats
    const last = beats[beats.length - 1]
    const penult = beats[beats.length - 2]
    expect(last.beatId).toBe('l6-recap')
    expect(last.interaction.type).toBe('recap')
    expect(penult.beatId).toBe('l6-prove')
    expect(penult.interaction.type).toBe('masteryChallenge')
    expect(penult.required).toBe(true)
  })

  it('lesson has exactly 10 beats', () => {
    expect(lesson.beats).toHaveLength(10)
  })

  it('lesson has at least one primer beat (JIT gate)', () => {
    expect(lesson.beats.some((b) => b.interaction.type === 'primer')).toBe(true)
  })

  it('all prediction beats use byOption feedback', () => {
    for (const b of lesson.beats) {
      if (b.interaction.type === 'prediction') {
        expect('byOption' in b.feedback).toBe(true)
      }
    }
  })

  it('lesson header fields are correct', () => {
    expect(lesson.lessonId).toBe('lesson-binary-information-6')
    expect(lesson.courseId).toBe('course-binary-information')
    expect(lesson.milestoneId).toBe('binary-information-synthesis')
    expect(lesson.unlocks).toBeNull()
    expect(lesson.schemaVersion).toBe(1)
  })
})
