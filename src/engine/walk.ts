// L3 Gambler's Ruin engine (pure, exact-rational). A 1-D random walk between an
// absorbing 0 (ruin) and N (win): +1 on H (prob p), −1 on T (prob q = 1−p).
//
// CORRECTED return shape (tech review B3): a dedicated WalkModel, NOT an
// "Automaton-shaped" object — a two-absorber walk would break simulate.ts's
// single-absorber helpers (flipsToAbsorption / nextStateOf / empiricalMean), and
// the Automaton fields (pattern, recurrences, overlapHighlights) are meaningless
// here. Both recurrences are solved over the rationals via solveLinearSystem,
// which handles the fair-coin case r = q/p = 1 directly (no 0/0 special-case).

import { ratAdd, ratMul, ratSub, solveLinearSystem, toRational } from './automaton'
import type { Rational } from './types'

export type WalkModel = {
  N: number
  p: Rational
  q: Rational
  // P_i = P(reach N before 0 | start i): P_i = p·P_{i+1} + q·P_{i-1}, with
  // P_0 = 0, P_N = 1 (homogeneous; no +1, boundary 1·0). Index 0..N.
  reachProb: Rational[]
  // 1 − reachProb (P(ruin) per start).
  ruinProb: Rational[]
  // D_i = E[steps to absorption | start i]: D_i = 1 + p·D_{i+1} + q·D_{i-1},
  // with D_0 = D_N = 0 (+1, boundary 0). Index 0..N.
  duration: Rational[]
}

const ZERO: Rational = { n: 0, d: 1 }
const ONE: Rational = { n: 1, d: 1 }

// Solve an interior tridiagonal system over states 1..N-1 of the form
//   x_i − p·x_{i+1} − q·x_{i-1} = rhs(i),
// with the boundary values x_0, x_N supplied (their contributions move to RHS).
function solveInterior(
  N: number,
  p: Rational,
  q: Rational,
  rhsConst: Rational, // the per-row constant (0 for reach, 1 for duration)
  x0: Rational,
  xN: Rational,
): Rational[] {
  const m = N - 1
  if (m <= 0) return []
  const A: Rational[][] = []
  const b: Rational[] = []
  for (let i = 1; i <= N - 1; i++) {
    const row = new Array<Rational>(m).fill(ZERO)
    row[i - 1] = ONE
    if (i <= N - 2) row[i] = ratSub(row[i], p) // −p · x_{i+1} (interior)
    if (i >= 2) row[i - 2] = ratSub(row[i - 2], q) // −q · x_{i-1} (interior)
    A.push(row)
    // RHS: the row constant + boundary contributions (q·x_0 at i=1, p·x_N at i=N-1).
    let rhs = rhsConst
    if (i === 1) rhs = ratAdd(rhs, ratMul(q, x0))
    if (i === N - 1) rhs = ratAdd(rhs, ratMul(p, xN))
    b.push(rhs)
  }
  return solveLinearSystem(A, b)
}

export function buildWalk(N: number, p: number): WalkModel {
  const pr = toRational(p)
  const qr = ratSub(ONE, pr)

  const interiorReach = solveInterior(N, pr, qr, ZERO, ZERO, ONE)
  const reachProb = [ZERO, ...interiorReach, ONE]
  const ruinProb = reachProb.map((r) => ratSub(ONE, r))

  const interiorDur = solveInterior(N, pr, qr, ONE, ZERO, ZERO)
  const duration = [ZERO, ...interiorDur, ZERO]

  return { N, p: pr, q: qr, reachProb, ruinProb, duration }
}

// One seeded walk: +1 on H (prob p), −1 on T, until 0 (ruin) or N (win).
export function simulateWalk(
  i: number,
  N: number,
  p: number,
  rng: () => number,
): { end: 'ruin' | 'win'; steps: number } {
  let pos = i
  let steps = 0
  while (pos > 0 && pos < N && steps < 1_000_000) {
    pos += rng() < p ? 1 : -1
    steps++
  }
  return { end: pos <= 0 ? 'ruin' : 'win', steps }
}

// Batched walk outcomes for the WalkerSwarm + DistributionHistogram.
export function batchWalkStats(
  i: number,
  N: number,
  p: number,
  rng: () => number,
  trials: number,
): { ruin: number; win: number; meanSteps: number } {
  let ruin = 0
  let totalSteps = 0
  for (let t = 0; t < trials; t++) {
    const r = simulateWalk(i, N, p, rng)
    if (r.end === 'ruin') ruin++
    totalSteps += r.steps
  }
  return { ruin, win: trials - ruin, meanSteps: trials > 0 ? totalSteps / trials : 0 }
}
