// Unit tests for the masteryChallenge beat type in the mastery signal.
// Tests that gradedRequiredBeatIds / computeMastered treat a required
// masteryChallenge beat as graded — no React rendering required.

import { describe, it, expect } from 'vitest'
import { gradedRequiredBeatIds, computeMastered } from '../mastery'
import type { Beat } from '../../content/schema'

const mockBeat: Beat = {
  beatId: 'mastery-challenge',
  required: true,
  prompt: 'What is the expected wait for HH?',
  interaction: {
    type: 'masteryChallenge',
    scenario: 'Fair coin, pattern HH.',
    fields: [{ id: 'ans', label: 'Expected flips', accept: ['6'] }],
  },
  feedback: {
    correct: 'Exactly right.',
    hints: ['Think about the self-overlap.', 'E[T] = 6 for HH.', 'The answer is 6.'],
  },
}

const nonGradedBeat: Beat = {
  beatId: 'primer-half',
  required: false,
  prompt: 'Quick refresher.',
  interaction: { type: 'primer', variant: 'half', body: 'A fair coin lands heads half the time.' },
  feedback: {
    correct: '',
    hints: ['', '', ''],
  },
}

describe('masteryChallenge grading signal', () => {
  it('gradedRequiredBeatIds includes a required masteryChallenge beat', () => {
    expect(gradedRequiredBeatIds([mockBeat])).toEqual(['mastery-challenge'])
  })

  it('gradedRequiredBeatIds excludes non-graded beats', () => {
    expect(gradedRequiredBeatIds([nonGradedBeat])).toEqual([])
  })

  it('gradedRequiredBeatIds excludes an optional masteryChallenge beat', () => {
    const optional: Beat = { ...mockBeat, required: false }
    expect(gradedRequiredBeatIds([optional])).toEqual([])
  })

  it('computeMastered is true when masteryChallenge was first-try-correct (hint level 0)', () => {
    expect(computeMastered([mockBeat], { 'mastery-challenge': 0 })).toBe(true)
  })

  it('computeMastered is true when hint level is absent (treated as 0)', () => {
    expect(computeMastered([mockBeat], {})).toBe(true)
  })

  it('computeMastered is false when masteryChallenge needed any hint', () => {
    expect(computeMastered([mockBeat], { 'mastery-challenge': 1 })).toBe(false)
  })
})
