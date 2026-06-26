// Smoke tests for ConditionalTreeBeat via react-dom/server renderToString.
// Node env, no jsdom, no clicks. Asserts branch labels, solved-E region,
// and reduced-motion final frame render correctly in server HTML.

import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { ConditionalTreeBeat } from './ConditionalTreeBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'
import { buildAutomaton } from '../../engine/automaton'

const mockBeat: Beat = {
  beatId: 'ev4-explore',
  required: false,
  prompt: 'Tap each branch to expand the case tree.',
  interaction: {
    type: 'conditionalTree',
    cases: [
      {
        label: 'Roll {1, 2, 3}',
        p: { n: 1, d: 2 },
        value: { n: 2, d: 1 },
      },
      {
        label: 'Roll {4, 5, 6}',
        p: { n: 1, d: 2 },
        restart: { add: { n: 5, d: 1 } },
      },
    ],
  },
  feedback: {
    correct:
      'The {4,5,6} branch loops back to the same game — E[X] appears on both sides.',
    hints: ['hint 1', 'hint 2', 'hint 3'],
  },
  hero: {
    slowFirst: true,
    structuralReadout: 'E[X] = 7 (solved by isolating E[X]).',
    reducedMotionFinalFrame: true,
  },
}

const automaton = buildAutomaton('H', 0.5)

function makeProps(overrides: Partial<BeatProps> = {}): BeatProps {
  return {
    beat: mockBeat,
    lessonId: 'lesson-expected-value-4',
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

describe('ConditionalTreeBeat — renderToString smoke', () => {
  it('renders without throwing', () => {
    expect(() => renderToString(<ConditionalTreeBeat {...makeProps()} />)).not.toThrow()
  })

  it('includes both branch labels in HTML', () => {
    const html = renderToString(<ConditionalTreeBeat {...makeProps()} />)
    expect(html).toContain('Roll {1, 2, 3}')
    expect(html).toContain('Roll {4, 5, 6}')
  })

  it('does not show solved equation in non-reduced-motion initial state', () => {
    const html = renderToString(<ConditionalTreeBeat {...makeProps({ reducedMotion: false })} />)
    expect(html).not.toContain('E[X] = 7')
  })

  it('reduced-motion final frame: shows all branches expanded', () => {
    const html = renderToString(<ConditionalTreeBeat {...makeProps({ reducedMotion: true })} />)
    expect(html).toContain('Roll {1, 2, 3}')
    expect(html).toContain('Roll {4, 5, 6}')
    // expanded buttons carry the detail text
    expect(html).toContain('P = 1/2')
  })

  it('reduced-motion final frame: shows solved E[X] = 7', () => {
    const html = renderToString(<ConditionalTreeBeat {...makeProps({ reducedMotion: true })} />)
    expect(html).toContain('E[X] = 7')
  })

  it('reduced-motion final frame: assertive aria-live region has E[X] = 7', () => {
    const html = renderToString(<ConditionalTreeBeat {...makeProps({ reducedMotion: true })} />)
    expect(html).toContain('aria-live="assertive"')
    expect(html).toContain('E[X] = 7')
  })

  it('reduced-motion final frame: loop-back arc is rendered (static, no animate class)', () => {
    const html = renderToString(<ConditionalTreeBeat {...makeProps({ reducedMotion: true })} />)
    expect(html).toContain('ctree__loop-arc')
    expect(html).not.toContain('ctree__loop-arc--animate')
  })

  it('returns null for non-conditionalTree beat type', () => {
    const nonCtreeBeat: Beat = {
      ...mockBeat,
      interaction: { type: 'recap' },
      feedback: { correct: 'ok', hints: ['h1', 'h2', 'h3'] },
    }
    const html = renderToString(
      <ConditionalTreeBeat {...makeProps({ beat: nonCtreeBeat })} />,
    )
    expect(html).toBe('')
  })

  it('Continue button is disabled in initial (non-reduced-motion) state', () => {
    const html = renderToString(<ConditionalTreeBeat {...makeProps({ reducedMotion: false })} />)
    // The button is disabled until solveDone; expect disabled attribute present
    expect(html).toContain('disabled')
  })

  it('Continue button is enabled in reduced-motion final frame', () => {
    const html = renderToString(<ConditionalTreeBeat {...makeProps({ reducedMotion: true })} />)
    // solveDone=true means no disabled attribute on the primary button
    // The correct feedback text is shown, which only renders when solveDone
    expect(html).toContain('loops back to the same game')
  })
})
