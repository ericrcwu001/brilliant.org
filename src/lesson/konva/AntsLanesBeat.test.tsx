// Smoke tests for AntsLanesBeat via react-dom/server renderToString. Node env —
// no jsdom, no clicks. Konva Stage is mocked (react-konva doesn't run in Node).
// Asserts DOM controls (toggle, run button) and aria-live mirror render; does
// not depend on Konva canvas internals.

import { renderToString } from 'react-dom/server'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-konva', () => ({
  Stage: () => null,
  Layer: () => null,
  Line: () => null,
  Circle: () => null,
  Text: () => null,
}))

import { AntsLanesBeat } from './AntsLanesBeat'
import type { BeatProps } from '../beats/types'
import type { Beat } from '../../content/schema'
import { buildAutomaton } from '../../engine/automaton'

const automaton = buildAutomaton('H', 0.5)

const antsBeat: Beat = {
  beatId: 'ev6-explore',
  required: false,
  comparison: true,
  prompt: 'Watch 500 ants march and bounce.',
  interaction: {
    type: 'raceSim',
    display: 'lanes',
    mode: 'ants',
    ants: { n: 500 },
  },
  hero: {
    slowFirst: true,
    structuralReadout: 'With 500 ants, the last one off falls at 500/501 \u2248 0.998 min.',
    reducedMotionFinalFrame: true,
  },
  feedback: {
    correct: 'The last-off ant is the one that started farthest from its exit.',
    hints: [
      'The set of fall-off times is identical whether ants bounce or pass through.',
      'In pass-through mode each ant walks straight off; the last off simply started farthest.',
      'The farthest start = max of 500 U(0,1) draws = E[max] = 500/501.',
    ],
  },
}

function makeProps(overrides?: Partial<BeatProps>): BeatProps {
  return {
    beat: antsBeat,
    lessonId: 'lesson-expected-value-6',
    pattern: 'H',
    patternOptions: ['H'],
    automaton,
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
    ...overrides,
  }
}

describe('AntsLanesBeat (smoke — renderToString)', () => {
  it('renders without crashing', () => {
    expect(() => renderToString(<AntsLanesBeat {...makeProps()} />)).not.toThrow()
  })

  it('renders the role=switch toggle button', () => {
    const html = renderToString(<AntsLanesBeat {...makeProps()} />)
    expect(html).toContain('role="switch"')
    expect(html).toContain('aria-label="Swap labels on collision"')
  })

  it('toggle is aria-checked=true by default (bounce view)', () => {
    const html = renderToString(<AntsLanesBeat {...makeProps()} />)
    expect(html).toContain('aria-checked="true"')
  })

  it('renders the DOM aria-live mirror with role=log', () => {
    const html = renderToString(<AntsLanesBeat {...makeProps()} />)
    expect(html).toContain('role="log"')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('aria-atomic="false"')
  })

  it('renders Run simulation button in idle state', () => {
    const html = renderToString(<AntsLanesBeat {...makeProps()} />)
    expect(html).toContain('Run simulation')
  })

  it('Continue button is disabled before run', () => {
    const html = renderToString(<AntsLanesBeat {...makeProps()} />)
    expect(html).toContain('disabled')
  })

  it('renders the canvas wrap container', () => {
    const html = renderToString(<AntsLanesBeat {...makeProps()} />)
    expect(html).toContain('ants-beat__canvas-wrap')
  })

  it('renders without crashing in reduced-motion mode', () => {
    expect(() =>
      renderToString(<AntsLanesBeat {...makeProps({ reducedMotion: true })} />),
    ).not.toThrow()
  })
})
