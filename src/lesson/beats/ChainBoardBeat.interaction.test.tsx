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

import { ChainBoardBeat, argmax, returnProbability, periodicVerdict, parseFrac } from './ChainBoardBeat'
import { stationaryDistribution, pagerank, formatRational, detailedBalance, formatVector } from '../../engine/markov'
import type { BeatProps } from './types'
import type { Beat, Lesson } from '../../content/schema'
import type { Rational } from '../../engine/types'

import lesson1 from '../../../fixtures/lesson-markov-chains-1.json'
import lesson2 from '../../../fixtures/lesson-markov-chains-2.json'
import lesson3 from '../../../fixtures/lesson-markov-chains-3.json'
import lesson4 from '../../../fixtures/lesson-markov-chains-4.json'
import lesson6 from '../../../fixtures/lesson-markov-chains-6.json'
import lesson7 from '../../../fixtures/lesson-markov-chains-7.json'
import lesson8 from '../../../fixtures/lesson-markov-chains-8.json'
import lesson9 from '../../../fixtures/lesson-markov-chains-9.json'
import lesson10 from '../../../fixtures/lesson-markov-chains-10.json'

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

// L8 reversible-or-not: cyclic 3-state chain A→B→C→A (NOT reversible)
const CYC3: Rational[][] = [
  [{ n: 0, d: 1 }, { n: 1, d: 1 }, { n: 0, d: 1 }],
  [{ n: 0, d: 1 }, { n: 0, d: 1 }, { n: 1, d: 1 }],
  [{ n: 1, d: 1 }, { n: 0, d: 1 }, { n: 0, d: 1 }],
]

// The initial Check button must be rendered DISABLED for every graded beat (no zero-input auto-pass).
function checkButtonDisabled(html: string): boolean {
  const m = html.match(/<button[^>]*>\s*Check\s*<\/button>/)
  return m != null && /\bdisabled\b/.test(m[0])
}

// ── L4: transient-vs-recurrent (diagram + absorption) ────────────────────────
describe('L4 transient-vs-recurrent (diagram + absorption)', () => {
  const beat = findBeat(lesson4, 'transient-vs-recurrent')

  it('Check button is disabled initially (no auto-pass)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

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

  it('Check button is disabled initially (no auto-pass)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

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

  it('Check button is disabled initially (no auto-pass)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

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

  it('Check button is disabled initially (no auto-pass)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

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

// ── S1: L2 build-from-story (matrix/build graded) ────────────────────────────
describe('S1 — L2 build-from-story (matrix/build graded, no-leak, real input)', () => {
  const beat = findBeat(lesson2, 'build-from-story')

  it('Check button is disabled initially (no zero-input auto-pass)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

  it('does NOT contain target value "7/10" in initial render (no answer leak)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('>7/10<')
  })

  it('does NOT contain target value "3/10" in initial render (no answer leak)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('>3/10<')
  })

  it('does NOT contain target value "4/10" in initial render (no answer leak)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('>4/10<')
  })

  it('does NOT contain target value "6/10" in initial render (no answer leak)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('>6/10<')
  })

  it('renders editable build inputs (chainboard-build__input present)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('chainboard-build__input')
  })

  it('grading: parseFrac("7/10") deep-equals {n:7,d:10}', () => {
    const r = parseFrac('7/10')
    expect(r).not.toBeNull()
    expect(r!.n).toBe(7)
    expect(r!.d).toBe(10)
  })

  it('grading: parseFrac("7/10") is NOT equal to parseFrac("3/10")', () => {
    const a = parseFrac('7/10')!
    const b = parseFrac('3/10')!
    expect(a.n * b.d).not.toBe(b.n * a.d)
  })

  it('grading: parseFrac("4/8") reduces to {n:1,d:2}', () => {
    const r = parseFrac('4/8')
    expect(r).not.toBeNull()
    expect(r!.n).toBe(1)
    expect(r!.d).toBe(2)
  })

  it('grading: parseFrac on invalid input returns null', () => {
    expect(parseFrac('abc')).toBeNull()
    expect(parseFrac('1/0')).toBeNull()
    expect(parseFrac('')).toBeNull()
  })
})

// ── S2: L8 balance-one-edge (stationary/balance scalar) ──────────────────────
describe('S2 — L8 balance-one-edge (stationary/balance scalar, no-leak, real input)', () => {
  const beat = findBeat(lesson8, 'balance-one-edge')

  it('Check button is disabled initially (no zero-input auto-pass)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

  it('does NOT print the detailed-balance verdict "Detailed balance"', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('Detailed balance')
  })

  it('does NOT print "irreversible" (leaks reversibility answer)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('irreversible')
  })

  it('does NOT show the stationary distribution π bars', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('Stationary distribution')
  })

  it('renders a text input for the learner to enter π(1)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('<input')
  })

  it('grading: formatRational(detailedBalance(EHR2).pi[1]) === "1/2" (correct answer)', () => {
    expect(formatRational(detailedBalance(EHR2).pi[1])).toBe('1/2')
  })

  it('grading: "1/4" does not equal "1/2" (wrong answer fails)', () => {
    expect(formatRational(detailedBalance(EHR2).pi[1])).not.toBe('1/4')
  })
})

// ── S2: L8 telescope-to-pi (stationary/balance vector) ───────────────────────
describe('S2 — L8 telescope-to-pi (stationary/balance vector, no-leak, real input)', () => {
  const beat = findBeat(lesson8, 'telescope-to-pi')

  it('Check button is disabled initially (no zero-input auto-pass)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

  it('does NOT contain the vector answer "1/4,1/2,1/4" in initial render', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('1/4,1/2,1/4')
  })

  it('does NOT print "Detailed balance" verdict', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('Detailed balance')
  })

  it('renders a text input (vector entry)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('<input')
  })

  it('grading: formatVector(detailedBalance(EHR2).pi) === "1/4,1/2,1/4"', () => {
    expect(formatVector(detailedBalance(EHR2).pi)).toBe('1/4,1/2,1/4')
  })
})

// ── S2: L8 reversible-or-not (stationary/balance categorical) ────────────────
describe('S2 — L8 reversible-or-not (stationary/balance reversibility chips, no-leak)', () => {
  const beat = findBeat(lesson8, 'reversible-or-not')

  it('Check button is disabled initially (no zero-input auto-pass)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

  it('renders "Reversible" chip', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('>Reversible<')
  })

  it('renders "Not reversible" chip', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('>Not reversible<')
  })

  it('does NOT print "irreversible" (leaks the answer)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('irreversible')
  })

  it('does NOT print "Detailed balance" verdict', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('Detailed balance')
  })

  it('grading: detailedBalance(CYC3).reversible === false (so "Not reversible" is correct)', () => {
    expect(detailedBalance(CYC3).reversible).toBe(false)
  })
})

// ── Existing paths — no-auto-pass regression (Check must start disabled) ──────
describe('diagram/entry — L1 read-the-edge (no auto-pass, no leak)', () => {
  const beat = findBeat(lesson1, 'read-the-edge')

  it('Check button is disabled initially', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

  it('does NOT contain the mastery answer "4/5" (only L1 edge values appear)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('4/5')
  })

  it('renders edge tap buttons (chainboard-edge-btn present)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('chainboard-edge-btn')
  })
})

describe('powers/entry — L3 read-another-entry (no auto-pass, no leak)', () => {
  const beat = findBeat(lesson3, 'read-another-entry')

  it('Check button is disabled initially', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

  it('does NOT contain out-of-scope mastery value "25/64"', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('25/64')
  })

  it('renders cell tap buttons (chainboard-cell-btn present)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('chainboard-cell-btn')
  })
})

describe('powers/entry — L7 early-power (no auto-pass)', () => {
  const beat = findBeat(lesson7, 'early-power')

  it('Check button is disabled initially', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

  it('renders cell tap buttons (chainboard-cell-btn present)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('chainboard-cell-btn')
  })
})

describe('diagram/classify — L4 classify-first (no auto-pass, chips not pre-answered)', () => {
  const beat = findBeat(lesson4, 'classify-first')

  it('Check button is disabled initially', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

  it('renders classify chip controls (chainboard-classify present)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('chainboard-classify')
  })
})

describe('diagram/classify — L10 classify-one (no auto-pass, chips not pre-answered)', () => {
  const beat = findBeat(lesson10, 'classify-one')

  it('Check button is disabled initially', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

  it('renders classify chip controls (chainboard-classify present)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('chainboard-classify')
  })
})

describe('stationary/pagerank — L9 damping-saves-sink (no auto-pass, no LINK4 value leak)', () => {
  const beat = findBeat(lesson9, 'damping-saves-sink')

  it('Check button is disabled initially', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

  it('does NOT contain LINK4 PageRank fraction "4/13" (different graph)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('4/13')
  })

  it('renders unique/not-unique chips for categorical grading', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('>unique<')
    expect(html).toContain('>not unique<')
  })
})

describe('diagram/classify — L4 classify-and-group (no auto-pass, chips not pre-answered)', () => {
  const beat = findBeat(lesson4, 'classify-and-group')

  it('Check button is disabled initially', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

  it('renders classify chip controls (chainboard-classify present)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('chainboard-classify')
  })

  it('does NOT pre-render the correct kinds as a verdict (chips are R/T/A choices, not the answer)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    // The graded answer string is never printed as a verdict readout.
    expect(html).not.toContain('transient,recurrent,recurrent,absorbing')
  })
})

describe('diagram/classify — L4 ehrenfest-period (no auto-pass, chips not pre-answered)', () => {
  const beat = findBeat(lesson4, 'ehrenfest-period')

  it('Check button is disabled initially', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

  it('renders classify chip controls (chainboard-classify present)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('chainboard-classify')
  })
})

describe('distribution/stationary — L7 approach-pi (no auto-pass, value-less bars)', () => {
  const beat = findBeat(lesson7, 'approach-pi')

  it('Check button is disabled initially', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(checkButtonDisabled(html)).toBe(true)
  })

  it('renders a share text input (chainboard-dist__entry input present)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toContain('<input')
  })

  it('does NOT print the settled bar values (no chainboard-dist__value — structural no-leak)', () => {
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).not.toContain('chainboard-dist__value')
  })
})
