// L2 Penney's Game engine (pure, exact-rational). Two patterns race to appear
// first on ONE shared coin stream. "Who appears first" is decoupled from the
// expected wait (L1), the "beats" relation is non-transitive, and the second
// mover always has a winning counter.
//
// Exact odds come from Conway's leading numbers (fair coin); `simulateRace`
// advances two KMP states on a single shared stream for the visual + a
// statistical cross-check. Reuses the §4.1 engine exports (no new math copies).

import { buildAutomaton, prefixFunction, reduce } from './automaton'
import type { Automaton, Rational } from './types'

export type RaceAutomaton = {
  a: Automaton
  b: Automaton
  p: number
}

// Two single-pattern automata sharing one stream — the RaceTrack draws a lane
// per automaton, driven by nextStateOf on the shared flips.
export function buildRaceAutomaton(a: string, b: string, p: number): RaceAutomaton {
  return { a: buildAutomaton(a, p), b: buildAutomaton(b, p), p }
}

// Conway leading number L(x, y) = Σ_{k=1}^{n} [last k of x === first k of y]·2^{k-1}
// (fair coin). The correlation of x's suffixes against y's prefixes.
function leadingNumber(x: string, y: string): number {
  const n = Math.min(x.length, y.length)
  let sum = 0
  for (let k = 1; k <= n; k++) {
    if (x.slice(x.length - k) === y.slice(0, k)) sum += 2 ** (k - 1)
  }
  return sum
}

export type ConwayNumbers = { aa: number; ab: number; ba: number; bb: number }

export function conwayLeadingNumbers(a: string, b: string): ConwayNumbers {
  return {
    aa: leadingNumber(a, a),
    ab: leadingNumber(a, b),
    ba: leadingNumber(b, a),
    bb: leadingNumber(b, b),
  }
}

// Exact win probabilities (fair coin) via Conway's odds:
//   odds(B beats A) = (L(A,A) − L(A,B)) : (L(B,B) − L(B,A)).
// Returns each pattern's probability of appearing first.
export function penneyOdds(
  a: string,
  b: string,
): { aBeatsB: Rational; bBeatsA: Rational } {
  const { aa, ab, ba, bb } = conwayLeadingNumbers(a, b)
  const numA = bb - ba // A-first numerator
  const numB = aa - ab // B-first numerator
  const d = numA + numB
  if (d === 0) {
    // Degenerate (e.g. identical patterns) → treat as a tie.
    return { aBeatsB: reduce(1, 2), bBeatsA: reduce(1, 2) }
  }
  return { aBeatsB: reduce(numA, d), bBeatsA: reduce(numB, d) }
}

// Second-mover counter (Penney): B = ¬a₂ · a₁ … a_{n−1}. For length 3 this is
// (¬a₂)a₁a₂, e.g. bestBeater('HHH') = 'THH'.
export function bestBeater(a: string): string {
  if (a.length < 2) return a === 'H' ? 'T' : 'H'
  const flip = (c: string) => (c === 'H' ? 'T' : 'H')
  return flip(a[1]) + a.slice(0, a.length - 1)
}

// who-beats-whom matrix (fair coin): m[i][j] = P(patterns[i] appears before
// patterns[j]); the diagonal is a ½ self-tie. Drives the TournamentHeatmap.
export function winMatrix(patterns: string[]): Rational[][] {
  return patterns.map((pi, i) =>
    patterns.map((pj, j) => (i === j ? reduce(1, 2) : penneyOdds(pi, pj).aBeatsB)),
  )
}

// KMP next-state for an integer state on symbol c (longest matched prefix len).
function advance(pattern: string, pi: number[], state: number, c: string): number {
  let k = state
  while (true) {
    if (c === pattern[k]) return k + 1
    if (k === 0) return 0
    k = pi[k - 1]
  }
}

// Advance two KMP states on ONE shared stream until one pattern completes.
// Cannot be expressed via simulate.ts's single-automaton flipsToAbsorption.
// For equal-length distinct patterns no simultaneous completion is possible, so
// the A-before-B check is an unreachable deterministic tiebreak.
export function simulateRace(
  a: string,
  b: string,
  p: number,
  rng: () => number,
): 'A' | 'B' {
  const piA = prefixFunction(a)
  const piB = prefixFunction(b)
  let sa = 0
  let sb = 0
  for (let i = 0; i < 1_000_000; i++) {
    const c = rng() < p ? 'H' : 'T'
    sa = advance(a, piA, sa, c)
    sb = advance(b, piB, sb, c)
    if (sa === a.length) return 'A'
    if (sb === b.length) return 'B'
  }
  return 'A'
}

export type RaceTrace = { winner: 'A' | 'B'; flips: ('H' | 'T')[] }

// Like simulateRace, but records the full shared coin stream. The winning
// pattern occupies exactly the last (winner === 'A' ? a.length : b.length)
// flips, since KMP completes the instant that suffix matches the pattern.
export function traceRace(
  a: string,
  b: string,
  p: number,
  rng: () => number,
): RaceTrace {
  const piA = prefixFunction(a)
  const piB = prefixFunction(b)
  let sa = 0
  let sb = 0
  const flips: ('H' | 'T')[] = []
  for (let i = 0; i < 1_000_000; i++) {
    const c: 'H' | 'T' = rng() < p ? 'H' : 'T'
    flips.push(c)
    sa = advance(a, piA, sa, c)
    sb = advance(b, piB, sb, c)
    if (sa === a.length) return { winner: 'A', flips }
    if (sb === b.length) return { winner: 'B', flips }
  }
  return { winner: 'A', flips }
}

// Batched race outcomes for the converging win-rate bars + tally.
export function batchRace(
  a: string,
  b: string,
  p: number,
  rng: () => number,
  trials: number,
): { a: number; b: number } {
  let aWins = 0
  for (let i = 0; i < trials; i++) {
    if (simulateRace(a, b, p, rng) === 'A') aWins++
  }
  return { a: aWins, b: trials - aWins }
}
