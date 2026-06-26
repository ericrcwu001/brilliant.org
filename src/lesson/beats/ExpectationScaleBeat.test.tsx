// Smoke test for ExpectationScaleBeat: uses react-dom/server renderToString in
// the Node vitest environment (no jsdom, no clicks). Asserts structural markup:
// beam outcomes, aria-live readout region, and the reduced-motion final frame.

import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { ExpectationScaleBeat } from './ExpectationScaleBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

function makeExploreBeat(withHero: boolean): Beat {
  return {
    beatId: 'ev1-explore',
    required: false,
    prompt: 'Tap each face value to place its weight.',
    interaction: {
      type: 'expectationScale',
      outcomes: [
        { x: 1, label: '1' },
        { x: 2, label: '2' },
        { x: 3, label: '3' },
        { x: 4, label: '4' },
        { x: 5, label: '5' },
        { x: 6, label: '6' },
      ],
    },
    hero: withHero
      ? { slowFirst: true, structuralReadout: 'E[X] = 7/2', reducedMotionFinalFrame: true }
      : undefined,
    feedback: {
      correct: 'The die balances at E[X] = 7/2.',
      hints: ['Tap each number to place its weight (1/6 for a fair die).', 'Each of the six faces is equally likely: P(x) = 1/6.', 'Place all six weights and watch the beam settle.'],
    },
  }
}

function makeProps(overrides: Partial<BeatProps> = {}): BeatProps {
  return {
    beat: makeExploreBeat(false),
    lessonId: 'lesson-expected-value-1',
    pattern: 'H',
    patternOptions: ['H'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    automaton: null as any,
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

describe('ExpectationScaleBeat (smoke — renderToString)', () => {
  it('renders without crashing for the default (no weights placed) state', () => {
    expect(() => renderToString(<ExpectationScaleBeat {...makeProps()} />)).not.toThrow()
  })

  it('returns null for a non-expectationScale beat', () => {
    const html = renderToString(
      <ExpectationScaleBeat
        {...makeProps({
          beat: {
            ...makeExploreBeat(false),
            interaction: { type: 'recap' },
          },
        })}
      />,
    )
    expect(html).toBe('')
  })

  it('renders beam outcome circles for each of the 6 fair-die outcomes', () => {
    const html = renderToString(<ExpectationScaleBeat {...makeProps()} />)
    // Each outcome renders a <g role="button"> with an aria-label containing the label.
    for (const label of ['1', '2', '3', '4', '5', '6']) {
      expect(html).toContain(`Outcome ${label}`)
    }
  })

  it('renders an aria-live="polite" readout region', () => {
    const html = renderToString(<ExpectationScaleBeat {...makeProps()} />)
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('aria-atomic="true"')
  })

  it('renders the Continue button disabled when no weights placed', () => {
    const html = renderToString(<ExpectationScaleBeat {...makeProps()} />)
    // BeatShell renders a disabled primary button when enabled=false.
    expect(html).toContain('disabled')
  })

  it('reduced-motion final frame: shows all weights placed and Continue enabled', () => {
    const html = renderToString(
      <ExpectationScaleBeat
        {...makeProps({
          beat: makeExploreBeat(true),
          reducedMotion: true,
        })}
      />,
    )
    // All 6 circles should be "placed" → escale__circle--placed class present.
    const placedCount = (html.match(/escale__circle--placed/g) ?? []).length
    expect(placedCount).toBe(6)
    // The fulcrum should be shown at the correct final EV position (fulcrum-group present).
    expect(html).toContain('escale__fulcrum-group')
    // The final E[X] annotation is rendered.
    expect(html).toContain('E[X] = 7/2')
    // Continue button should be enabled (no disabled attribute).
    expect(html).not.toContain('disabled')
  })

  it('renders the fulcrum polygon inside escale__fulcrum-group', () => {
    const html = renderToString(<ExpectationScaleBeat {...makeProps()} />)
    expect(html).toContain('escale__fulcrum-group')
    expect(html).toContain('escale__fulcrum')
    expect(html).toContain('<polygon')
  })
})
