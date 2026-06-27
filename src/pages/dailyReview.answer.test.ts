// Unit tests for the raw-answer derivation the Daily Review surface submits to
// spec-10's server-graded submitReview (spec-20 §8.2). Node env, pure.
//
// The submitReview shape is { cardId, answer, confidence? } with NO client
// `result` (R13) — the surface sends a raw answer the server re-grades. These
// tests pin the answer payload so a local PASS re-grades to pass server-side and
// a local FAIL re-grades to fail (the sentinel matches no accept-list).

import { describe, it, expect } from 'vitest'
import { canonicalReviewAnswer } from './dailyReview.answer'
import { gradeAcceptFields } from '../lesson/grading'
import type { Beat } from '../content/schema'

const masteryBeat = {
  beatId: 'm',
  required: true,
  interaction: {
    type: 'masteryChallenge',
    fields: [
      { id: 'a', label: 'A', accept: ['10', 'ten'] },
      { id: 'b', label: 'B', accept: ['1/2'] },
    ],
  },
  feedback: { hints: ['', '', ''] },
} as unknown as Beat

const answerEntryBeat = {
  beatId: 'ae',
  required: true,
  interaction: { type: 'answerEntry', fields: [{ id: 'x', label: 'X', accept: ['42'] }] },
  feedback: { hints: ['', '', ''] },
} as unknown as Beat

describe('canonicalReviewAnswer — server re-grade parity (R13)', () => {
  it('a PASS emits each field’s first accept value (server re-grades → pass)', () => {
    const ans = canonicalReviewAnswer(masteryBeat, true)
    expect(ans).toEqual({ a: '10', b: '1/2' })
    // The very fields the server grades with: this answer must grade as correct.
    const ix = masteryBeat.interaction as { fields: { id: string; accept: string[] }[] }
    expect(gradeAcceptFields(ix.fields, ans)).toBe(true)
  })

  it('a FAIL emits a sentinel per field that no accept-list contains (server → fail)', () => {
    const ans = canonicalReviewAnswer(masteryBeat, false)
    const ix = masteryBeat.interaction as { fields: { id: string; accept: string[] }[] }
    expect(gradeAcceptFields(ix.fields, ans)).toBe(false)
  })

  it('handles answerEntry beats the same way', () => {
    expect(canonicalReviewAnswer(answerEntryBeat, true)).toEqual({ x: '42' })
    const ix = answerEntryBeat.interaction as { fields: { id: string; accept: string[] }[] }
    expect(gradeAcceptFields(ix.fields, canonicalReviewAnswer(answerEntryBeat, false))).toBe(false)
  })

  it('never includes a client `result` field (R13 — server grades the answer)', () => {
    expect('result' in canonicalReviewAnswer(masteryBeat, true)).toBe(false)
    expect('result' in canonicalReviewAnswer(masteryBeat, false)).toBe(false)
  })

  it('a non-type-in graded beat falls back to a single marker field', () => {
    const otherBeat = {
      beatId: 'o',
      required: true,
      interaction: { type: 'stateTap', transitions: [] },
      feedback: { hints: ['', '', ''] },
    } as unknown as Beat
    expect(canonicalReviewAnswer(otherBeat, true)).toEqual({ __review__: '__pass__' })
    expect(canonicalReviewAnswer(otherBeat, false).__review__).not.toBe('__pass__')
  })
})
