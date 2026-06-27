// Smoke tests for StoppingBoardBeat via react-dom/server renderToString.
// NODE env — no jsdom, no click simulation. Asserts the static initial-render
// HTML for each display; engine-derived values are checked against the engine.

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
  analytics: {
    answerSubmitted: () => {},
    hintRevealed: () => {},
    lessonStarted: () => {},
    lessonCompleted: () => {},
    beatCompleted: () => {},
  },
}))

import { StoppingBoardBeat } from './StoppingBoardBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

function makeBeat(interaction: Beat['interaction'], overrides: Partial<Beat> = {}): Beat {
  return {
    beatId: 'os-test',
    required: false,
    prompt: 'Watch the run.',
    interaction,
    feedback: { correct: 'ok', hints: ['a', 'b', 'c'] },
    ...overrides,
  }
}

const baseProps: Omit<BeatProps, 'beat'> = {
  lessonId: 'lesson-optimal-stopping-1',
  pattern: 'H',
  patternOptions: ['H'],
  automaton: {
    pattern: 'H',
    p: 0.5,
    states: [],
    transitions: [],
    recurrences: {} as BeatProps['automaton']['recurrences'],
    expectedTimes: {} as BeatProps['automaton']['expectedTimes'],
    substitutionSteps: [],
    overlapHighlights: [],
  },
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

function render(beat: Beat, reducedMotion = false): string {
  return renderToString(
    React.createElement(StoppingBoardBeat, { ...baseProps, beat, reducedMotion }),
  )
}

describe('StoppingBoardBeat smoke', () => {
  it('sequence: renders, has aria-live + Continue', () => {
    const beat = makeBeat({ type: 'stoppingBoard', display: 'sequence', n: 3, order: [2, 1, 3], cutoff: 2 })
    const html = render(beat)
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('Continue')
  })

  it('sequence: reduced-motion shows the final win frame', () => {
    const beat = makeBeat({ type: 'stoppingBoard', display: 'sequence', n: 3, order: [2, 1, 3], cutoff: 2 })
    const html = render(beat, true)
    expect(html).toContain('Win')
  })

  it('sequence: reduced-motion shows a miss for take-first when best is not first', () => {
    const beat = makeBeat({ type: 'stoppingBoard', display: 'sequence', n: 3, order: [2, 1, 3], cutoff: 1 })
    const html = render(beat, true)
    expect(html).toContain('Missed the best')
  })

  it('cutoff: shows the exact success probability for the active cutoff', () => {
    const beat = makeBeat({ type: 'stoppingBoard', display: 'cutoff', n: 4, cutoff: 2, interactive: true })
    const html = render(beat)
    expect(html).toContain('11/24') // secretarySuccess(4,2)
    expect(html).toContain('type="range"')
  })

  it('convergence: renders the 37% table', () => {
    const beat = makeBeat({ type: 'stoppingBoard', display: 'convergence', n: 10, nValues: [3, 5, 10] })
    const html = render(beat)
    expect(html).toContain('37%')
    expect(html).toContain('Candidates n')
  })

  it('returns empty string for a non-stoppingBoard beat', () => {
    const html = render(makeBeat({ type: 'recap' }))
    expect(html).toBe('')
  })
})
