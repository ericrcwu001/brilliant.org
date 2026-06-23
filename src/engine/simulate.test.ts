import { describe, it, expect } from 'vitest'
import { buildAutomaton } from './automaton'
import {
  empiricalMean,
  flipsToAbsorption,
  mulberry32,
  nextStateOf,
} from './simulate'

describe('nextStateOf', () => {
  it('reads HH transitions: E1 on T resets to E0, E1 on H advances to E2', () => {
    const a = buildAutomaton('HH', 0.5)
    expect(nextStateOf(a, 'E1', 'T')).toBe('E0')
    expect(nextStateOf(a, 'E1', 'H')).toBe('E2')
  })
})

describe('flipsToAbsorption', () => {
  it('counts at least the pattern length flips', () => {
    const a = buildAutomaton('HH', 0.5)
    expect(flipsToAbsorption(a, mulberry32(1))).toBeGreaterThanOrEqual(2)
  })
})

describe('empiricalMean converges to theory', () => {
  it('E[HH] empirical mean lands near 6 over many trials', () => {
    const a = buildAutomaton('HH', 0.5)
    const mean = empiricalMean(a, 20000, mulberry32(42))
    expect(Math.abs(mean - 6)).toBeLessThan(0.4)
  })

  it('E[HT] empirical mean lands near 4 over many trials', () => {
    const a = buildAutomaton('HT', 0.5)
    const mean = empiricalMean(a, 20000, mulberry32(7))
    expect(Math.abs(mean - 4)).toBeLessThan(0.3)
  })
})
