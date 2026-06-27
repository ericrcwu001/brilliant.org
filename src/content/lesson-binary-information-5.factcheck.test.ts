// Stage-2 fact-check: every graded answer + every bitBoard headline in
// lesson-binary-information-5.json is reproduced by src/engine/binary.ts.
// Run: ./node_modules/.bin/vitest run src/content/lesson-binary-information-5.factcheck.test.ts

import { describe, it, expect } from 'vitest'
import {
  toBinary,
  popcount,
  isPowerOfTwo,
  xorAll,
  multiplyByShift,
} from '../engine/binary'
import fixture from '../../fixtures/lesson-binary-information-5.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

describe('lesson-binary-information-5 fact-check', () => {
  // ── engine golden self-checks ────────────────────────────────────────────
  it('engine goldens: isPowerOfTwo(16n)=true, isPowerOfTwo(5n)=false', () => {
    expect(isPowerOfTwo(16n)).toBe(true)
    expect(isPowerOfTwo(5n)).toBe(false)
  })

  it('engine golden: popcount(11n) = 3', () => {
    expect(popcount(11n)).toBe(3)
  })

  it('engine golden: xorAll([4,1,2,1,2]) = 4', () => {
    expect(xorAll([4n, 1n, 2n, 1n, 2n])).toBe(4n)
  })

  it('engine golden: xorAll([7,3,5,3,7]) = 5', () => {
    expect(xorAll([7n, 3n, 5n, 3n, 7n])).toBe(5n)
  })

  it('engine golden: nim-sum xorAll([3,4,5]) = 2', () => {
    expect(xorAll([3n, 4n, 5n])).toBe(2n)
  })

  it('engine golden: multiplyByShift(6n,3) = 48; 48-6 = 42 = 7×6', () => {
    const result = multiplyByShift(6n, 3)
    expect(result).toBe(48n)
    expect(result - 6n).toBe(42n)
  })

  // ── l5-recall: retrieval grid pairs ────────────────────────────────────
  it('l5-recall pairs: nim-sum {3,4,5} → "2"; a⊕a → "0"', () => {
    const beat = beatById('l5-recall')
    if (beat.interaction.type !== 'retrievalGrid') throw new Error('wrong type')
    const map = Object.fromEntries(beat.interaction.pairs.map((p) => [p.left, p.right]))
    // nim-sum {3,4,5} = 3 XOR 4 XOR 5 = 2
    expect(map['nim-sum of {3, 4, 5}']).toBe(String(xorAll([3n, 4n, 5n])))
    // a XOR a = 0
    expect(map['a ⊕ a for any a']).toBe('0')
  })

  // ── l5-bet: prediction, correct option ────────────────────────────────
  it('l5-bet correct option contains "XOR them (4)" and xorAll confirms 4', () => {
    const beat = beatById('l5-bet')
    if (beat.interaction.type !== 'prediction') throw new Error('wrong type')
    if (!('byOption' in beat.feedback)) throw new Error('expected byOption feedback')
    const correctKey = Object.entries(beat.feedback.byOption).find(
      ([, v]) => v.correct === true,
    )?.[0]
    expect(correctKey).toBe('XOR them (4)')
    // Engine confirms: XOR of [4,1,2,1,2] = 4
    expect(xorAll([4n, 1n, 2n, 1n, 2n])).toBe(4n)
  })

  // ── l5-win: answerEntry accept for isPowerOfTwo(16) ────────────────────
  it('l5-win accept includes "true" and isPowerOfTwo(16n) confirms it', () => {
    const beat = beatById('l5-win')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.pow2).toContain('true')
    expect(isPowerOfTwo(16n)).toBe(true)
    // Cross-check: 5 is not a power of 2
    expect(isPowerOfTwo(5n)).toBe(false)
  })

  // ── l5-explore: bitBoard headline = toBinary(12 & 11) ─────────────────
  it('l5-explore bitBoard headline = toBinary(12 & (12-1)) = "1000"', () => {
    const beat = beatById('l5-explore')
    if (beat.interaction.type !== 'bitBoard') throw new Error('wrong type')
    const it = beat.interaction
    expect(it.display).toBe('register')
    expect(it.op).toBe('and-x-minus-1')
    // headline = toBinary(value & (value - 1)) = toBinary(12 & 11)
    const value = BigInt(it.value ?? 0)
    const expected = toBinary(value & (value - 1n))
    expect(expected).toBe('1000')
    expect(it.headline).toBe(expected)
  })

  // ── l5-model: bitBoard headline = toBinary(multiplyByShift(6, 3)) ──────
  it('l5-model bitBoard headline = toBinary(6 << 3) = "110000"', () => {
    const beat = beatById('l5-model')
    if (beat.interaction.type !== 'bitBoard') throw new Error('wrong type')
    const it = beat.interaction
    expect(it.display).toBe('register')
    expect(it.op).toBe('shift')
    expect(it.operands?.a).toBe(6)
    expect(it.operands?.k).toBe(3)
    const a = BigInt(it.operands!.a)
    const k = it.operands!.k!
    const expected = toBinary(multiplyByShift(a, k))
    expect(expected).toBe('110000')
    expect(it.headline).toBe(expected)
  })

  // l5-model carries the interviewNote
  it('l5-model carries exactly one interviewNote', () => {
    const beat = beatById('l5-model')
    expect(beat.interviewNote).toBeTruthy()
    // No other beat should carry an interviewNote
    const otherNotes = lesson.beats.filter(
      (b) => b.beatId !== 'l5-model' && b.interviewNote,
    )
    expect(otherNotes).toHaveLength(0)
  })

  // ── l5-apply: answerEntry accept = popcount(11) = 3 ────────────────────
  it('l5-apply accept includes "3" and popcount(11n) = 3', () => {
    const beat = beatById('l5-apply')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.popcount).toContain('3')
    expect(popcount(11n)).toBe(3)
  })

  // ── l5-transfer: held-out, track B, required false, accept = xorAll([7,3,5,3,7]) = 5 ──
  it('l5-transfer is track:B, required:false, accept "5" and xorAll confirms', () => {
    const beat = beatById('l5-transfer')
    expect(beat.track).toBe('B')
    expect(beat.required).toBe(false)
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.loner).toContain('5')
    expect(xorAll([7n, 3n, 5n, 3n, 7n])).toBe(5n)
  })

  // ── l5-prove: masteryChallenge, required, accept = xorAll([4,1,2,1,2]) = 4 ──
  it('l5-prove is masteryChallenge, required:true, accept "4" and xorAll confirms', () => {
    const beat = beatById('l5-prove')
    expect(beat.required).toBe(true)
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.loner).toContain('4')
    expect(xorAll([4n, 1n, 2n, 1n, 2n])).toBe(4n)
  })

  // ── structural gate checks ───────────────────────────────────────────────

  // Gate 1: first graded beat is retrievalGrid (l5-recall)
  it('first graded beat is retrievalGrid (l5-recall)', () => {
    const gradedTypes = new Set([
      'retrievalGrid', 'equationTiles', 'substitution', 'patternPick',
      'stateTap', 'answerEntry', 'masteryChallenge',
      'countingTree', 'selectionGrid', 'handRanker',
    ])
    const firstGraded = lesson.beats.find((b) => gradedTypes.has(b.interaction.type))
    expect(firstGraded?.beatId).toBe('l5-recall')
    expect(firstGraded?.interaction.type).toBe('retrievalGrid')
  })

  // Gate 2: at least one primer beat (track A, required false)
  it('has at least one primer beat (track:A, required:false)', () => {
    const primer = lesson.beats.find(
      (b) => b.interaction.type === 'primer' && b.track === 'A' && b.required === false,
    )
    expect(primer).toBeTruthy()
    expect(primer?.beatId).toBe('l5-primer')
  })

  // Gate 3: prediction beats use byOption feedback
  it('all prediction beats use byOption feedback', () => {
    const predictions = lesson.beats.filter((b) => b.interaction.type === 'prediction')
    for (const b of predictions) {
      expect('byOption' in b.feedback).toBe(true)
    }
    expect(predictions.length).toBeGreaterThan(0)
  })

  // Gate 4: exactly one interviewNote (on l5-model)
  it('exactly one interviewNote in the lesson', () => {
    const notedBeats = lesson.beats.filter((b) => b.interviewNote)
    expect(notedBeats).toHaveLength(1)
    expect(notedBeats[0].beatId).toBe('l5-model')
  })

  // Gate 5: l5-transfer (B/required:false) immediately precedes l5-prove
  it('l5-transfer immediately precedes l5-prove', () => {
    const ids = lesson.beats.map((b) => b.beatId)
    const tIdx = ids.indexOf('l5-transfer')
    const pIdx = ids.indexOf('l5-prove')
    expect(tIdx).toBeGreaterThanOrEqual(0)
    expect(pIdx).toBeGreaterThanOrEqual(0)
    expect(pIdx).toBe(tIdx + 1)
  })

  // Gate 6: penultimate beat = masteryChallenge (required), last = recap
  it('penultimate beat is required masteryChallenge; last beat is recap', () => {
    const beats = lesson.beats
    const last = beats[beats.length - 1]
    const penult = beats[beats.length - 2]
    expect(last.interaction.type).toBe('recap')
    expect(penult.interaction.type).toBe('masteryChallenge')
    expect(penult.required).toBe(true)
  })

  // Gate 7: beatCount = 10
  it('lesson has exactly 10 beats', () => {
    expect(lesson.beats).toHaveLength(10)
  })
})
