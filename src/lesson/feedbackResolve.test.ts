import { describe, it, expect } from 'vitest'
import { resolveFeedback, resolveOptionFeedback } from './feedbackResolve'
import type { Feedback } from '../content/schema'

const triple: Feedback = { correct: 'yes', hints: ['h0', 'h1', 'h2'] }

const byPattern: Feedback = {
  byPattern: {
    HH: { correct: 'hh', hints: ['a', 'b', 'c'] },
    HT: { correct: 'ht', hints: ['d', 'e', 'f'] },
  },
}

const byOption: Feedback = {
  byOption: {
    'Waiting for HH takes longer': { note: 'right', correct: true },
    'They tie — both take 4 flips on average': { note: 'trap', correct: false },
  },
  hints: ['idle', 'soften', 'later'],
}

describe('resolveFeedback (back-compat)', () => {
  it('returns the triple unchanged', () => {
    expect(resolveFeedback(triple, 'HH')).toEqual(triple)
  })

  it('selects the active pattern for byPattern, falling back to the first', () => {
    expect(resolveFeedback(byPattern, 'HT').correct).toBe('ht')
    expect(resolveFeedback(byPattern, 'ZZ').correct).toBe('hh')
  })

  it('exposes byOption hints (and an empty correct) for captions', () => {
    expect(resolveFeedback(byOption, 'HH')).toEqual({
      correct: '',
      hints: ['idle', 'soften', 'later'],
    })
  })
})

describe('resolveOptionFeedback (per-option, L1 §3.1)', () => {
  it('returns the matched option note + correctness', () => {
    expect(
      resolveOptionFeedback(byOption, 'Waiting for HH takes longer'),
    ).toEqual({ note: 'right', correct: true })
    expect(
      resolveOptionFeedback(byOption, 'They tie — both take 4 flips on average'),
    ).toEqual({ note: 'trap', correct: false })
  })

  it('returns null for an unknown option', () => {
    expect(resolveOptionFeedback(byOption, 'nope')).toBeNull()
  })

  it('returns null for triple / byPattern feedback (graceful fallback)', () => {
    expect(resolveOptionFeedback(triple, 'x')).toBeNull()
    expect(resolveOptionFeedback(byPattern, 'x')).toBeNull()
  })
})
