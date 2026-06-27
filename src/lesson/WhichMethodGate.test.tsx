// Render smoke + contract tests for the standalone WhichMethodGate (spec-13 / D12,
// the component spec-20's queue mounts — gate Issue #11). NODE env, no jsdom: we
// assert the static renderToString output (neutral prompt, options, locally
// label-stripped — no "no wrong answer" caption, no lesson title) and the
// renders-nothing-for-a-non-gate contract. The grading/onResolved/analytics path
// (correct ⇔ optionMethods[i]===gate.correct, byOption refutation) is unit-tested
// purely in methodGate.test.ts and exercised manually on /dev/gate, mirroring how
// the repo tests every other interactive beat (renderToString only, no click sim).

import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import React from 'react'

vi.mock('../firebase/app', () => ({
  app: {},
  auth: {},
  db: {},
  functions: {},
  usingEmulators: false,
  getDb: () => ({}),
}))
vi.mock('../analytics/events', () => ({
  analytics: { methodGatePicked: () => {}, answerSubmitted: () => {}, hintRevealed: () => {} },
}))

import { WhichMethodGate } from './WhichMethodGate'
import type { Beat } from '../content/schema'

const gateBeat: Beat = {
  beatId: 'gate',
  required: true,
  prompt: 'A method-revealing prompt that must NOT leak into the gate surface.',
  schemaId: 'first-step-analysis',
  interaction: {
    type: 'prediction',
    options: ['First-step analysis', 'States / Markov', 'Recursion / self-reference'],
    gate: {
      kind: 'which-method',
      correct: 'first-step-analysis',
      optionMethods: ['first-step-analysis', 'states-markov', 'recursion-self-reference'],
    },
  },
  feedback: {
    byOption: {
      'First-step analysis': { note: 'Right — condition on the first step.', correct: true },
      'States / Markov': { note: 'Close, but the move is first-step conditioning.' },
      'Recursion / self-reference': { note: 'The recurrence comes from the first step.' },
    },
    hints: ['Which single move sets up the equation?', '', ''],
  },
} as Beat

function render(beat: Beat, extra: Record<string, unknown> = {}): string {
  return renderToString(
    React.createElement(WhichMethodGate, {
      beat,
      schemaId: 'first-step-analysis',
      onResolved: () => {},
      lessonId: 'dev-gate',
      ...extra,
    } as React.ComponentProps<typeof WhichMethodGate>),
  )
}

describe('WhichMethodGate render (spec-13)', () => {
  it('renders the neutral discrimination prompt, not the method-revealing beat.prompt', () => {
    const html = render(gateBeat)
    expect(html).toContain('Which method cracks this?')
    // Locally label-stripped: it must not render the beat's own prompt copy.
    expect(html).not.toContain('method-revealing prompt')
  })

  it('hides the ungraded opening-bet "no wrong answer" caption', () => {
    const html = render(gateBeat)
    expect(html).not.toContain('no wrong answer')
  })

  it('renders every method option label as a radio', () => {
    const html = render(gateBeat)
    for (const opt of ['First-step analysis', 'States / Markov', 'Recursion / self-reference']) {
      expect(html).toContain(opt)
    }
    expect(html).toContain('role="radio"')
  })

  it('carries the schemaId under test on the surface', () => {
    expect(render(gateBeat)).toContain('data-schema-id="first-step-analysis"')
  })

  it('Continue is disabled until a correct pick lands (no pick yet)', () => {
    // The action bar primary is disabled (the pick is the graded act).
    expect(render(gateBeat)).toContain('disabled')
  })

  it('shows the confidence rating only when showConfidence is set (Track-aware, D6)', () => {
    // No rating before a pick even with showConfidence (rating gates on a pick).
    expect(render(gateBeat, { showConfidence: true })).not.toContain('How sure were you?')
    // And never on the Track-A gate-off path.
    expect(render(gateBeat, { showConfidence: false })).not.toContain('How sure were you?')
  })

  it('renders nothing for a non-gate beat (the exempt opening bet)', () => {
    const openBet = {
      ...gateBeat,
      interaction: { type: 'prediction', options: ['a', 'b'] },
    } as Beat
    expect(render(openBet)).toBe('')
  })

  it('renders nothing for a non-prediction beat', () => {
    expect(render({ ...gateBeat, interaction: { type: 'recap' } } as Beat)).toBe('')
  })
})
