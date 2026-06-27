// Pure grading contract for the which-method gate (spec-13 / D12). The graded act
// is the METHOD selection: correct ⇔ optionMethods[index] === gate.correct, graded
// by registry id (never display copy). Node env, no React.

import { describe, it, expect } from 'vitest'
import type { Beat } from '../content/schema'
import { gradeMethodGate, isWhichMethodGate, type WhichMethodGateBlock } from './methodGate'

const gate: WhichMethodGateBlock = {
  kind: 'which-method',
  correct: 'symmetry',
  // symmetry at index 1 — deliberately NOT index 0, so a positional bug is caught.
  optionMethods: ['conditioning', 'symmetry', 'complementary-counting'],
}

const gateBeat: Beat = {
  beatId: 'gate',
  required: true,
  prompt: 'p',
  interaction: {
    type: 'prediction',
    options: ['Conditioning', 'Symmetry', 'Complementary counting'],
    gate,
  },
  feedback: { byOption: { Symmetry: { note: 'yes', correct: true } } },
} as Beat

const openBet: Beat = {
  beatId: 'open-bet',
  required: false,
  prompt: 'p',
  interaction: { type: 'prediction', options: ['a', 'b'] },
  feedback: { byOption: { a: { note: 'n' } } },
} as Beat

describe('gradeMethodGate', () => {
  it('is correct only when the picked option id equals gate.correct (by index, not position)', () => {
    expect(gradeMethodGate(gate, 1)).toBe(true) // symmetry
    expect(gradeMethodGate(gate, 0)).toBe(false) // conditioning
    expect(gradeMethodGate(gate, 2)).toBe(false) // complementary-counting
  })
})

describe('isWhichMethodGate', () => {
  it('is true for a prediction carrying interaction.gate', () => {
    expect(isWhichMethodGate(gateBeat)).toBe(true)
  })

  it('is FALSE for the exempt opening bet (a prediction with no gate)', () => {
    expect(isWhichMethodGate(openBet)).toBe(false)
  })

  it('is false for a non-prediction beat', () => {
    expect(
      isWhichMethodGate({ ...gateBeat, interaction: { type: 'recap' } } as Beat),
    ).toBe(false)
  })
})
