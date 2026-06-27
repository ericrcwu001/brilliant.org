// Smoke + dispatch tests for PredictionBeat (spec-13 / D12). NODE env, no jsdom:
// renderToString asserts the dispatch — a gate prediction delegates to the
// canonical WhichMethodGate (neutral discrimination prompt, no opening-bet
// caption); an opening-bet prediction (no gate) keeps today's ungraded bet body
// (the "no wrong answer" caption + chips). The advance-on-correct path is covered
// purely by methodGate.test.ts and manually on /dev/gate (no click sim here,
// matching every other beat test).

import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import React from 'react'

vi.mock('../../firebase/app', () => ({
  app: {},
  auth: {},
  db: {},
  functions: {},
  usingEmulators: false,
  getDb: () => ({}),
}))
vi.mock('../../analytics/events', () => ({
  analytics: { predictionSet: () => {}, methodGatePicked: () => {}, answerSubmitted: () => {}, hintRevealed: () => {} },
}))

import { PredictionBeat } from './PredictionBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

const baseProps: Omit<BeatProps, 'beat'> = {
  lessonId: 'lesson-x',
  pattern: 'H',
  patternOptions: ['H'],
  automaton: {} as BeatProps['automaton'],
  reducedMotion: false,
  density: 'merged',
  isLast: false,
  onAdvance: () => {},
  reportNeedsReview: () => {},
  needsReview: false,
  lessonState: {},
  setLessonState: () => {},
  milestone: null,
  lessonComplete: false,
}

function render(beat: Beat): string {
  return renderToString(React.createElement(PredictionBeat, { ...baseProps, beat }))
}

const gateBeat: Beat = {
  beatId: 'gate',
  required: true,
  prompt: 'p',
  schemaId: 'symmetry',
  interaction: {
    type: 'prediction',
    options: ['Symmetry', 'Conditioning'],
    gate: { kind: 'which-method', correct: 'symmetry', optionMethods: ['symmetry', 'conditioning'] },
  },
  feedback: {
    byOption: {
      Symmetry: { note: 'Right.', correct: true },
      Conditioning: { note: 'Not quite.' },
    },
  },
} as Beat

const openBet: Beat = {
  beatId: 'open-bet',
  required: false,
  prompt: 'p',
  interaction: { type: 'prediction', options: ['Both equal', 'HH longer'] },
  feedback: {
    byOption: { 'Both equal': { note: 'Worth testing.' } },
    hints: ['A guess.', '', ''],
  },
} as Beat

describe('PredictionBeat dispatch (spec-13)', () => {
  it('delegates a GATE prediction to WhichMethodGate (neutral prompt, no bet caption)', () => {
    const html = render(gateBeat)
    expect(html).toContain('Which method cracks this?')
    expect(html).not.toContain('no wrong answer')
  })

  it('renders the ungraded opening bet for a prediction WITHOUT a gate (unchanged)', () => {
    const html = render(openBet)
    expect(html).toContain('no wrong answer')
    expect(html).toContain('Both equal')
    // The opening bet shows no gate discrimination prompt.
    expect(html).not.toContain('Which method cracks this?')
  })

  it('renders nothing for a non-prediction beat', () => {
    expect(render({ ...openBet, interaction: { type: 'recap' } } as Beat)).toBe('')
  })
})
