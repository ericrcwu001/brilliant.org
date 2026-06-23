import { describe, it, expect } from 'vitest'
import { buildAutomaton } from './automaton'
import type { Transition } from './types'

const findEdge = (ts: Transition[], from: string, on: 'H' | 'T') =>
  ts.find((t) => t.from === from && t.on === on)!

describe('buildAutomaton — golden expected times at p = 0.5', () => {
  it('E[HH] = 6', () => {
    expect(buildAutomaton('HH', 0.5).expectedTimes.E0).toBe(6)
  })
  it('E[HT] = 4', () => {
    expect(buildAutomaton('HT', 0.5).expectedTimes.E0).toBe(4)
  })
  it('E[THH] = 8', () => {
    expect(buildAutomaton('THH', 0.5).expectedTimes.E0).toBe(8)
  })
  it('E[HTH] = 10', () => {
    expect(buildAutomaton('HTH', 0.5).expectedTimes.E0).toBe(10)
  })
})

describe('transition kinds', () => {
  it('HH: E1 on T resets to E0', () => {
    const t = findEdge(buildAutomaton('HH', 0.5).transitions, 'E1', 'T')
    expect(t).toMatchObject({ to: 'E0', kind: 'reset' })
  })

  it('HT: E1 on H is a self-loop back to E1', () => {
    const t = findEdge(buildAutomaton('HT', 0.5).transitions, 'E1', 'H')
    expect(t).toMatchObject({ to: 'E1', kind: 'self-loop' })
  })

  it('advancing edges are flagged advance (HT: E0->E1 on H, E1->E2 on T)', () => {
    const ts = buildAutomaton('HT', 0.5).transitions
    expect(findEdge(ts, 'E0', 'H')).toMatchObject({ to: 'E1', kind: 'advance' })
    expect(findEdge(ts, 'E1', 'T')).toMatchObject({ to: 'E2', kind: 'advance' })
  })

  it('THH: E2 on T resets to E1 (intermediate fallback, kind reset)', () => {
    const t = findEdge(buildAutomaton('THH', 0.5).transitions, 'E2', 'T')
    expect(t).toMatchObject({ to: 'E1', kind: 'reset' })
  })
})

describe('canonical recurrences', () => {
  it('HH matches the PRD tile structure', () => {
    const { recurrences } = buildAutomaton('HH', 0.5)
    expect(recurrences.E0).toEqual({
      lhs: 'E0',
      constant: 1,
      terms: [
        { coeff: { n: 1, d: 2 }, var: 'E1' },
        { coeff: { n: 1, d: 2 }, var: 'E0' },
      ],
    })
    expect(recurrences.E1).toEqual({
      lhs: 'E1',
      constant: 1,
      terms: [
        { coeff: { n: 1, d: 2 }, var: 'E2' },
        { coeff: { n: 1, d: 2 }, var: 'E0' },
      ],
    })
    expect(recurrences.E2).toEqual({ lhs: 'E2', constant: 0, terms: [] })
  })

  it('HT has the structural 1/2 E1 self-loop term in E1', () => {
    const { recurrences } = buildAutomaton('HT', 0.5)
    expect(recurrences.E1).toEqual({
      lhs: 'E1',
      constant: 1,
      terms: [
        { coeff: { n: 1, d: 2 }, var: 'E1' },
        { coeff: { n: 1, d: 2 }, var: 'E2' },
      ],
    })
  })
})

describe('states, overlap highlights, and substitution steps', () => {
  it('labels matched prefixes and marks the absorbing state', () => {
    const { states } = buildAutomaton('HH', 0.5)
    expect(states).toEqual([
      { id: 'E0', label: '∅', absorbing: false },
      { id: 'E1', label: 'H', absorbing: false },
      { id: 'E2', label: 'HH', absorbing: true },
    ])
  })

  it('overlap highlights point at the near-miss edges', () => {
    expect(buildAutomaton('HH', 0.5).overlapHighlights).toEqual([
      { from: 'E1', on: 'T' },
    ])
    expect(buildAutomaton('HT', 0.5).overlapHighlights).toEqual([
      { from: 'E1', on: 'H' },
    ])
  })

  it('substitution replay ends on the solved E0 value', () => {
    const steps = buildAutomaton('HH', 0.5).substitutionSteps
    const last = steps[steps.length - 1]
    expect(last.substitute).toBe('E0')
    expect(last.resultValue).toBe(6)
    expect(last.display).toBe('E0 = 1 + 1/2 E1 + 1/2 E0')
  })
})

describe('bias generalization', () => {
  it('E[HH] with p = 1/3 equals 1/p + 1/p^2 = 12', () => {
    expect(buildAutomaton('HH', 1 / 3).expectedTimes.E0).toBeCloseTo(12, 6)
  })
})
