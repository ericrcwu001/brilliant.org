// Pure simulation helpers over an Automaton. Used by the coin-sim beat (single
// interactive steps) and the theory-vs-simulation beat (batched runs to
// absorption). Dependency-free and deterministic given an injected RNG.

import type { Automaton, StateId } from './types'

// Next state for `from` after observing `on`, read from the automaton's
// transition table.
export function nextStateOf(
  automaton: Automaton,
  from: StateId,
  on: 'H' | 'T',
): StateId {
  const t = automaton.transitions.find((e) => e.from === from && e.on === on)
  if (!t) throw new Error(`No transition from ${from} on ${on}`)
  return t.to
}

const absorbingId = (automaton: Automaton): StateId =>
  automaton.states.find((s) => s.absorbing)!.id

// Flip a coin (P(H) = automaton.p) repeatedly from E0 until the absorbing
// state, returning the number of flips taken.
export function flipsToAbsorption(
  automaton: Automaton,
  rng: () => number = Math.random,
): number {
  const absorbing = absorbingId(automaton)
  let state: StateId = automaton.states[0].id
  let flips = 0
  // Hard cap guards against a malformed automaton with no path to absorption.
  while (state !== absorbing && flips < 100_000) {
    const on: 'H' | 'T' = rng() < automaton.p ? 'H' : 'T'
    state = nextStateOf(automaton, state, on)
    flips++
  }
  return flips
}

// Run `n` independent trials and return the empirical mean hitting time.
export function empiricalMean(
  automaton: Automaton,
  n: number,
  rng: () => number = Math.random,
): number {
  if (n <= 0) return 0
  let total = 0
  for (let i = 0; i < n; i++) total += flipsToAbsorption(automaton, rng)
  return total / n
}

// Small seedable PRNG (mulberry32) so simulations are reproducible in tests and
// for the optional deterministic chart path.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
