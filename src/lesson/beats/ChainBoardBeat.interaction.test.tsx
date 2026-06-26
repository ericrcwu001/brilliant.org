// Interaction regression tests for ChainBoardBeat — NODE env (no jsdom).
// Uses renderToString (react-dom/server) for render assertions and pure
// grading-logic assertions via the exported helpers from ChainBoardBeat.
// These tests FAIL on the old (broken) renderer and PASS on the fixed one.

import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import React from 'react'

vi.mock('../konva/ChainGraph', () => ({ ChainGraph: () => null }))
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
    answerSubmitted() {},
    hintRevealed() {},
    lessonStarted() {},
    lessonCompleted() {},
    beatCompleted() {},
  },
}))

import { ChainBoardBeat, argmax, returnProbability, periodicVerdict } from './ChainBoardBeat'
import { stationaryDistribution, pagerank, formatRational } from '../../engine/markov'
import type { BeatProps } from './types'
import type { Beat, Lesson } from '../../content/schema'
import type { Rational } from '../../engine/types'

import lesson2 from '../../../fixtures/lesson-markov-chains-2.json'
import lesson4 from '../../../fixtures/lesson-markov-chains-4.json'
import lesson6 from '../../../fixtures/lesson-markov-chains-6.json'
import lesson7 from '../../../fixtures/lesson-markov-chains-7.json'
import lesson9 from '../../../fixtures/lesson-markov-chains-9.json'

// ── Base props (mirrors ChainBoardBeat.test.tsx) ─────────────────────────────
const baseProps: Omit<BeatProps, 'beat'> = {
  lessonId: 'lesson-markov-chains-1',
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

function findBeat(lesson: unknown, beatId: string): Beat {
  const l = lesson as Lesson
  const beat = l.beats.find((b) => b.beatId === beatId)
  if (!beat) throw new Error(`Beat '${beatId}' not found in lesson`)
  return beat as unknown as Beat
}

// ── Test matrices ─────────────────────────────────────────────────────────────

// L4 transient-vs-recurrent: 1→2→1 (return prob 1/2), 3 is absorbing wall
// States: 0=1, 1=2, 2=3
const R3: Rational[][] = [
  [{ n: 0, d: 1 }, { n: 1, d: 1 }, { n: 0, d: 1 }],
  [{ n: 1, d: 2 }, { n: 0, d: 1 }, { n: 1, d: 2 }],
  [{ n: 0, d: 1 }, { n: 0, d: 1 }, { n: 1, d: 1 }],
]

// L7 periodic-trap: Ehrenfest m=2 (period 2 — oscillates)
const EHR2: Rational[][] = [
  [{ n: 0, d: 1 }, { n: 1, d: 1 }, { n: 0, d: 1 }],
  [{ n: 1, d: 2 }, { n: 0, d: 1 }, { n: 1, d: 2 }],
  [{ n: 0, d: 1 }, { n: 1, d: 1 }, { n: 0, d: 1 }],
]

// Weather chain (period 1 — converges)
const WEATHER: Rational[][] = [
  [{ n: 3, d: 5 }, { n: 2, d: 5 }],
  [{ n: 3, d: 10 }, { n: 7, d: 10 }],
]

// L6 read-the-share: Sunny/Rainy matrix
// π(Sunny) = 4/7
const GFG: Rational[][] = [
  [{ n: 7, d: 10 }, { n: 3, d: 10 }],
  [{ n: 4, d: 10 }, { n: 6, d: 10 }],
]

// L9 weight-by-source: 4-page link graph (d=1)
// Pages: 0=1, 1=2, 2=3, 3=4
// π = (4/13, 5/13, 1/13, 3/13), top = index 1
const LINK4: Rational[][] = [
  [{ n: 0, d: 1 }, { n: 1, d: 1 }, { n: 0, d: 1 }, { n: 0, d: 1 }],
  [{ n: 1, d: 2 }, { n: 0, d: 1 }, { n: 0, d: 1 }, { n: 1, d: 2 }],
  [{ n: 1, d: 2 }, { n: 0, d: 1 }, { n: 0, d: 1 }, { n: 1, d: 2 }],
  [{ n: 1, d: 3 }, { n: 1, d: 3 }, { n: 1, d: 3 }, { n: 0, d: 1 }],
]

// ── L4: transient-vs-recurrent (diagram + absorption) ────────────────────────
describe('L4 transient-vs-recurrent (diagram + absorption)', () => {
  const beat = findBeat(lesson4, 'transient-vs-recurrent')

  it('renders the absorption input (chainboard-absorb control is present)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('chainboard-absorb')
  })

  it('aria-label mentions "ever returning"', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('ever returning')
  })

  it('does NOT auto-reveal the answer "1/2" in the initial render', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    // "1/2" must not appear as a visible value (placeholder != answer, no printed answer)
    // The placeholder is "e.g. 1/3" — does not contain "1/2"
    // We check that the specific answer string is not rendered as a content value
    expect(html).not.toContain('>1/2<')
  })

  it('grading: returnProbability(R3, 0, [2]) === "1/2" (correct answer)', () => {
    const f = returnProbability(R3, 0, [2])
    expect(formatRational(f)).toBe('1/2')
  })

  it('grading: wrong input "1" does not equal "1/2"', () => {
    const f = returnProbability(R3, 0, [2])
    expect(formatRational(f)).not.toBe('1')
  })
})

// ── L7: periodic-trap (powers + classify) ────────────────────────────────────
describe('L7 periodic-trap (powers + classify)', () => {
  const beat = findBeat(lesson7, 'periodic-trap')

  it('renders "Oscillates forever" verdict chip', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('Oscillates forever')
  })

  it('renders "Converges to π" verdict chip', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('Converges to π')
  })

  it('grading: periodicVerdict(EHR2) === "oscillates" (Ehrenfest m=2 has period 2)', () => {
    expect(periodicVerdict(EHR2)).toBe('oscillates')
  })

  it('grading: periodicVerdict(WEATHER) === "converges" (aperiodic weather chain)', () => {
    expect(periodicVerdict(WEATHER)).toBe('converges')
  })

  it('grading discrimination: oscillates ≠ converges', () => {
    expect(periodicVerdict(EHR2)).not.toBe(periodicVerdict(WEATHER))
  })
})

// ── L6: read-the-share (distribution + stationary graded) ────────────────────
describe('L6 read-the-share (distribution + stationary graded)', () => {
  const beat = findBeat(lesson6, 'read-the-share')

  it('renders a fraction text input', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('<input')
  })

  it('does NOT auto-reveal the answer "4/7" in the initial render', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('>4/7<')
    // Also must not appear in "Stationary: ..." readout (no readout on graded path)
    expect(html).not.toContain('Stationary:')
  })

  it('grading: stationaryDistribution(GFG)[0] === "4/7" (Sunny long-run share)', () => {
    const pi = stationaryDistribution(GFG)
    expect(formatRational(pi[0])).toBe('4/7')
  })

  it('grading: "1/2" is NOT equal to "4/7" (wrong answer fails)', () => {
    const pi = stationaryDistribution(GFG)
    expect(formatRational(pi[0])).not.toBe('1/2')
  })
})

// ── L9: weight-by-source (diagram + pagerank) ─────────────────────────────────
describe('L9 weight-by-source (diagram + pagerank, no-leak)', () => {
  const beat = findBeat(lesson9, 'weight-by-source')

  it('does NOT contain PageRank fraction "4/13" in the initial render', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('4/13')
  })

  it('does NOT contain PageRank fraction "5/13" in the initial render', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('5/13')
  })

  it('does NOT contain PageRank fraction "1/13" in the initial render', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('1/13')
  })

  it('does NOT contain PageRank fraction "3/13" in the initial render', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('3/13')
  })

  it('node-label buttons are present (e.g. label "2")', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    // Labels "1", "2", "3", "4" must appear as button content
    expect(html).toContain('>2<')
  })

  it('grading: argmax(pagerank(LINK4, d=1)) === 1 (page 2 is top-ranked)', () => {
    const pr = pagerank(LINK4, { n: 1, d: 1 })
    expect(argmax(pr)).toBe(1)
  })

  it('grading: tapping index 0 (page 1) would be wrong', () => {
    const pr = pagerank(LINK4, { n: 1, d: 1 })
    expect(argmax(pr)).not.toBe(0)
  })
})

// ── L2: spot-the-invalid (retrievalGrid distinctness regression) ──────────────
describe('L2 spot-the-invalid (retrievalGrid — all match-targets distinct)', () => {
  it('all right-side match targets are distinct (no eviction softlock)', () => {
    const l = lesson2 as unknown as Lesson
    const beat = l.beats.find((b) => b.beatId === 'spot-the-invalid')
    expect(beat).toBeDefined()
    const interaction = beat!.interaction as { type: 'retrievalGrid'; pairs: Array<{ left: string; right: string }> }
    expect(interaction.type).toBe('retrievalGrid')
    const pairs = interaction.pairs
    const rights = pairs.map((p) => p.right)
    expect(new Set(rights).size).toBe(pairs.length)
  })
})
