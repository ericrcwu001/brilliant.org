import { describe, it, expect } from 'vitest'
import type { Beat } from '../content/schema'
import type { MethodId } from '../content/methods'
import {
  masteredFromLive,
  selectWeakNode,
  recommendReview,
  selectWeakMethod,
} from './recommend'

function gradedBeat(beatId: string, required = true): Beat {
  return {
    beatId,
    required,
    prompt: 'x',
    interaction: { type: 'retrievalGrid', pairs: [{ left: 'a', right: 'b' }] },
    feedback: { correct: 'ok', hints: ['1', '2', '3'] },
  } as Beat
}

function taggedBeat(beatId: string, schemaId: MethodId | '', required = true): Beat {
  return { ...gradedBeat(beatId, required), schemaId: schemaId || undefined } as Beat
}

describe('masteredFromLive', () => {
  it('is true when every graded-required beat has a 0 high-water mark', () => {
    expect(masteredFromLive([gradedBeat('g1'), gradedBeat('g2')], {})).toBe(true)
    expect(masteredFromLive([gradedBeat('g1')], { g1: 0 })).toBe(true)
  })

  it('is false when any graded-required beat struggled', () => {
    expect(masteredFromLive([gradedBeat('g1'), gradedBeat('g2')], { g2: 1 })).toBe(false)
  })

  it('is false when there are no graded-required beats', () => {
    expect(masteredFromLive([gradedBeat('opt', false)], {})).toBe(false)
  })
})

describe('selectWeakNode', () => {
  const lessons = [
    { lessonId: 'L1', beats: [gradedBeat('a'), gradedBeat('b')] },
    { lessonId: 'L2', beats: [gradedBeat('c')] },
  ]

  it('picks the highest max-hint graded beat across lessons', () => {
    const node = selectWeakNode(lessons, { L1: { a: 1, b: 3 }, L2: { c: 2 } })
    expect(node).toEqual({ lessonId: 'L1', beatId: 'b', maxHintLevel: 3 })
  })

  it('returns null when nothing struggled', () => {
    expect(selectWeakNode(lessons, { L1: {}, L2: { c: 0 } })).toBeNull()
  })

  it('ignores non-graded-required beats and unknown beatIds', () => {
    const ls = [{ lessonId: 'L1', beats: [gradedBeat('a'), gradedBeat('opt', false)] }]
    // `opt` is not graded-required and `ghost` is not a beat → both ignored.
    expect(selectWeakNode(ls, { L1: { opt: 3, ghost: 3, a: 1 } })).toEqual({
      lessonId: 'L1',
      beatId: 'a',
      maxHintLevel: 1,
    })
  })
})

describe('recommendReview', () => {
  it('points at the weakest completed-but-not-mastered node, ignoring incomplete lessons', () => {
    const lessons = [
      { lessonId: 'L1', beats: [gradedBeat('a')], completed: true },
      { lessonId: 'L2', beats: [gradedBeat('b')], completed: true },
      { lessonId: 'L3', beats: [gradedBeat('c')], completed: false },
    ]
    const node = recommendReview(lessons, { L1: { a: 2 }, L2: {}, L3: { c: 3 } })
    // L2 is mastered (no struggle); L3 is incomplete; only L1 qualifies.
    expect(node).toEqual({ lessonId: 'L1', beatId: 'a', maxHintLevel: 2 })
  })

  it('returns null when every completed lesson is mastered', () => {
    const lessons = [{ lessonId: 'L1', beats: [gradedBeat('a')], completed: true }]
    expect(recommendReview(lessons, { L1: {} })).toBeNull()
  })
})

describe('selectWeakMethod', () => {
  it('aggregates struggle by schemaId; highest total hint wins', () => {
    const lessons = [
      { lessonId: 'L1', beats: [taggedBeat('a', 'symmetry'), taggedBeat('b', 'conditioning')] },
      { lessonId: 'L2', beats: [taggedBeat('c', 'symmetry')] },
    ]
    // symmetry: a=1 + c=3 = 4 over 2 beats; conditioning: b=2 over 1 beat.
    const weak = selectWeakMethod(lessons, { L1: { a: 1, b: 2 }, L2: { c: 3 } })
    expect(weak).toEqual({ schemaId: 'symmetry', totalHint: 4, beatCount: 2 })
  })

  it('breaks an equal-total tie by highest mean', () => {
    const lessons = [
      { lessonId: 'L1', beats: [taggedBeat('a', 'symmetry'), taggedBeat('b', 'symmetry')] },
      { lessonId: 'L2', beats: [taggedBeat('c', 'conditioning')] },
    ]
    // symmetry total 4 over 2 (mean 2); conditioning total 4 over 1 (mean 4) → wins.
    const weak = selectWeakMethod(lessons, { L1: { a: 2, b: 2 }, L2: { c: 4 } })
    expect(weak?.schemaId).toBe('conditioning')
  })

  it('breaks an equal-total, equal-mean tie alphabetically by schemaId', () => {
    const lessons = [
      { lessonId: 'L1', beats: [taggedBeat('a', 'symmetry')] },
      { lessonId: 'L2', beats: [taggedBeat('c', 'conditioning')] },
    ]
    // both total 3 over 1 beat → alphabetical: conditioning < symmetry.
    const weak = selectWeakMethod(lessons, { L1: { a: 3 }, L2: { c: 3 } })
    expect(weak?.schemaId).toBe('conditioning')
  })

  it('skips beats without a schemaId and non-graded / unstruggled beats', () => {
    const lessons = [
      {
        lessonId: 'L1',
        beats: [taggedBeat('a', 'symmetry'), taggedBeat('untagged', ''), gradedBeat('opt', false)],
      },
    ]
    // untagged contributes nothing; opt is not graded-required; only a counts.
    const weak = selectWeakMethod(lessons, { L1: { a: 2, untagged: 5, opt: 5 } })
    expect(weak).toEqual({ schemaId: 'symmetry', totalHint: 2, beatCount: 1 })
  })

  it('returns null when no graded beat carries a usable schemaId (backfill-incomplete)', () => {
    const lessons = [{ lessonId: 'L1', beats: [taggedBeat('a', '')] }]
    expect(selectWeakMethod(lessons, { L1: { a: 3 } })).toBeNull()
  })

  it('returns null when nothing struggled', () => {
    const lessons = [{ lessonId: 'L1', beats: [taggedBeat('a', 'symmetry')] }]
    expect(selectWeakMethod(lessons, { L1: { a: 0 } })).toBeNull()
  })
})
