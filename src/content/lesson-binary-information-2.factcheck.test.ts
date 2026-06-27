// Stage-2 fact-check: every graded answer and every bitBoard headline in
// lesson-binary-information-2.json is reproduced by src/engine/binary.ts.
// Fails fast if a fixture author transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { bitsNeeded, toBinary } from '../engine/binary'
import fixture from '../../fixtures/lesson-binary-information-2.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

describe('lesson-binary-information-2 fact-check', () => {
  // ── engine goldens ──────────────────────────────────────────────────────────

  it('engine golden: bitsNeeded(100n) = 7', () => {
    expect(bitsNeeded(100n)).toBe(7)
  })

  it('engine golden: bitsNeeded(1000n) = 10', () => {
    expect(bitsNeeded(1000n)).toBe(10)
  })

  it('engine golden: bitsNeeded(1_000_000n) = 20', () => {
    expect(bitsNeeded(1_000_000n)).toBe(20)
  })

  it('engine golden: bitsNeeded(500n) = 9', () => {
    expect(bitsNeeded(500n)).toBe(9)
  })

  it('engine golden: toBinary(1000n) = "1111101000"', () => {
    expect(toBinary(1000n)).toBe('1111101000')
  })

  // ── l2-recall: retrievalGrid (first graded beat / retrieval opener) ─────────

  it('l2-recall is a retrievalGrid (retrieval opener)', () => {
    const beat = beatById('l2-recall')
    expect(beat.interaction.type).toBe('retrievalGrid')
    expect(beat.required).toBe(true)
  })

  it('l2-recall pairs cover the pigeonhole facts', () => {
    const beat = beatById('l2-recall')
    if (beat.interaction.type !== 'retrievalGrid') throw new Error('wrong type')
    const rightValues = beat.interaction.pairs.map((p) => p.right)
    expect(rightValues).toContain('⌈N/H⌉')
    expect(rightValues).toContain('a collision')
  })

  // ── l2-bet: prediction with byOption (refutational) feedback ──────────────

  it('l2-bet is a prediction beat with byOption feedback', () => {
    const beat = beatById('l2-bet')
    expect(beat.interaction.type).toBe('prediction')
    if (!('byOption' in beat.feedback)) throw new Error('expected byOption feedback')
    const correct = Object.entries(beat.feedback.byOption).find(([, v]) => v.correct)?.[0]
    expect(correct).toBe('10')
  })

  // ── l2-primer: JIT primer, track A, required false ─────────────────────────

  it('l2-primer is a primer, track A, required false', () => {
    const beat = beatById('l2-primer')
    expect(beat.interaction.type).toBe('primer')
    expect(beat.track).toBe('A')
    expect(beat.required).toBe(false)
  })

  // ── l2-win: accept = bitsNeeded(100n) = 7 ────────────────────────────────

  it('l2-win accept includes String(bitsNeeded(100n))', () => {
    const beat = beatById('l2-win')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.q).toContain(String(bitsNeeded(100n)))
    expect(fields.q).toContain('7')
  })

  // ── l2-explore: bitBoard questions, headline = String(bitsNeeded(1000n)) ───

  it('l2-explore bitBoard questions headline = String(bitsNeeded(1000n)) = "10"', () => {
    const beat = beatById('l2-explore')
    if (beat.interaction.type !== 'bitBoard') throw new Error('wrong type')
    expect(beat.interaction.display).toBe('questions')
    expect(beat.interaction.n).toBe(1000)
    expect(beat.interaction.headline).toBe(String(bitsNeeded(BigInt(beat.interaction.n!))))
    expect(beat.interaction.headline).toBe('10')
  })

  // ── l2-model: bitBoard register, headline = toBinary(1000n), interviewNote ─

  it('l2-model bitBoard register headline = toBinary(1000n) = "1111101000"', () => {
    const beat = beatById('l2-model')
    if (beat.interaction.type !== 'bitBoard') throw new Error('wrong type')
    expect(beat.interaction.display).toBe('register')
    expect(beat.interaction.value).toBe(1000)
    expect(beat.interaction.headline).toBe(toBinary(BigInt(beat.interaction.value!)))
    expect(beat.interaction.headline).toBe('1111101000')
  })

  it('l2-model carries exactly one interviewNote', () => {
    const beat = beatById('l2-model')
    expect(beat.interviewNote).toBeDefined()
    expect(typeof beat.interviewNote).toBe('string')
    expect((beat.interviewNote as string).length).toBeGreaterThan(20)
  })

  it('exactly one beat has an interviewNote', () => {
    const withNote = lesson.beats.filter((b) => b.interviewNote)
    expect(withNote).toHaveLength(1)
    expect(withNote[0].beatId).toBe('l2-model')
  })

  // ── l2-apply: accept = bitsNeeded(1_000_000n) = 20 ───────────────────────

  it('l2-apply accept includes String(bitsNeeded(1_000_000n))', () => {
    const beat = beatById('l2-apply')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.q).toContain(String(bitsNeeded(1_000_000n)))
    expect(fields.q).toContain('20')
  })

  // ── l2-transfer: held-out, track B, required false, accept = bitsNeeded(500n) = 9 ──

  it('l2-transfer is track B, required false, accept includes String(bitsNeeded(500n))', () => {
    const beat = beatById('l2-transfer')
    expect(beat.track).toBe('B')
    expect(beat.required).toBe(false)
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.q).toContain(String(bitsNeeded(500n)))
    expect(fields.q).toContain('9')
  })

  // ── l2-prove: masteryChallenge, required true, accept = bitsNeeded(1000n) = 10 ──

  it('l2-prove is a required masteryChallenge with accept including String(bitsNeeded(1000n))', () => {
    const beat = beatById('l2-prove')
    expect(beat.required).toBe(true)
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.q).toContain(String(bitsNeeded(1000n)))
    expect(fields.q).toContain('10')
  })

  // ── l2-recap: last beat, required ────────────────────────────────────────

  it('l2-recap is the last beat and is a recap', () => {
    const last = lesson.beats[lesson.beats.length - 1]
    expect(last.beatId).toBe('l2-recap')
    expect(last.interaction.type).toBe('recap')
    expect(last.required).toBe(true)
  })

  // ── penultimate beat is the masteryChallenge (gate §5 check) ───────────────

  it('penultimate beat is l2-prove (masteryChallenge), last beat is l2-recap', () => {
    const penult = lesson.beats[lesson.beats.length - 2]
    const last = lesson.beats[lesson.beats.length - 1]
    expect(penult.beatId).toBe('l2-prove')
    expect(penult.interaction.type).toBe('masteryChallenge')
    expect(last.beatId).toBe('l2-recap')
  })

  // ── l2-transfer immediately precedes l2-prove ─────────────────────────────

  it('l2-transfer immediately precedes l2-prove', () => {
    const ids = lesson.beats.map((b) => b.beatId)
    const tIdx = ids.indexOf('l2-transfer')
    const pIdx = ids.indexOf('l2-prove')
    expect(tIdx).toBeGreaterThan(-1)
    expect(pIdx).toBeGreaterThan(-1)
    expect(pIdx).toBe(tIdx + 1)
  })

  // ── beat count ────────────────────────────────────────────────────────────

  it('fixture has exactly 10 beats', () => {
    expect(lesson.beats).toHaveLength(10)
  })

  // ── header fields ─────────────────────────────────────────────────────────

  it('fixture header fields are correct', () => {
    expect(lesson.lessonId).toBe('lesson-binary-information-2')
    expect(lesson.courseId).toBe('course-binary-information')
    expect(lesson.milestoneId).toBe('binary-information-bound')
    expect(lesson.unlocks).toBe('lesson-binary-information-3')
    expect(lesson.schemaVersion).toBe(1)
  })
})
