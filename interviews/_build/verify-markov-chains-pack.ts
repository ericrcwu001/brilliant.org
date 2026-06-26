#!/usr/bin/env tsx
// FULLY-INDEPENDENT verifier for interviews/course-markov-chains.json.
//
// Combines the two PHT exemplars into one file: it does NOT trust the
// production engine, the build script, or the in-pack engineCheck for the
// GROUND TRUTH. For every one of the 55 questions it recomputes the answer from
// first principles in pure BigInt rationals (an independent Gauss-Jordan solve
// over a re-transcribed chain registry) and then demands the 4-way agreement
//
//   BigInt-ground-truth == engine(documented API) == engineCheck.answer == hidden.answer
//
// plus an advisory expected-answer cross-check, gambler's-ruin walk-vs-closed-
// form agreement, an independent periodicity / detailed-balance check, exact-
// rational hygiene, the schema + structural gates, and the no-answer-leak hint
// spot-check. Exit non-zero on ANY failure; exit 0 with "ALL CHECKS PASS".
//
// Run from .lf/markov-chains:
//   ./node_modules/.bin/tsx interviews/_build/verify-markov-chains-pack.ts

import { readFileSync } from 'node:fs'
import type { Rational } from '../../src/engine/types'
import { reduce } from '../../src/engine/automaton'
import {
  buildChain,
  matrixPower,
  classifyStates,
  absorptionProbabilities,
  expectedAbsorptionTime,
  stationaryDistribution,
  kacReturnTime,
  detailedBalance,
  pagerank,
  formatRational,
  formatVector,
} from '../../src/engine/markov'
import { InterviewPackSchema, type Question } from '../../src/content/interviewPack'

const MAX = Number.MAX_SAFE_INTEGER

// ── BigInt exact rationals (independent of the engine's number-based math) ─────
type Big = { n: bigint; d: bigint }
function gcdB(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  while (b) [a, b] = [b, a % b]
  return a || 1n
}
function B(n: bigint | number, d: bigint | number = 1n): Big {
  let nn = BigInt(n)
  let dd = BigInt(d)
  if (dd < 0n) {
    nn = -nn
    dd = -dd
  }
  const g = gcdB(nn, dd)
  return { n: nn / g, d: dd / g }
}
const addB = (a: Big, b: Big) => B(a.n * b.d + b.n * a.d, a.d * b.d)
const subB = (a: Big, b: Big) => B(a.n * b.d - b.n * a.d, a.d * b.d)
const mulB = (a: Big, b: Big) => B(a.n * b.n, a.d * b.d)
const divB = (a: Big, b: Big) => B(a.n * b.d, a.d * b.n)
const eqB = (a: Big, b: Big) => a.n * b.d === b.n * a.d
const fmtB = (b: Big) => (b.d === 1n ? `${b.n}` : `${b.n}/${b.d}`)
const powB = (b: Big, e: number): Big => {
  let r = B(1n)
  for (let k = 0; k < e; k++) r = mulB(r, b)
  return r
}

// Independent Gauss-Jordan over Big fractions (solves A x = b).
function solveBig(A: Big[][], b: Big[]): Big[] {
  const m = b.length
  const aug = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < m; col++) {
    let pivot = col
    while (pivot < m && aug[pivot][col].n === 0n) pivot++
    if (pivot === m) continue
    ;[aug[col], aug[pivot]] = [aug[pivot], aug[col]]
    const pv = aug[col][col]
    for (let j = col; j <= m; j++) aug[col][j] = divB(aug[col][j], pv)
    for (let r = 0; r < m; r++) {
      if (r === col) continue
      const f = aug[r][col]
      if (f.n === 0n) continue
      for (let j = col; j <= m; j++) aug[r][j] = subB(aug[r][j], mulB(f, aug[col][j]))
    }
  }
  return aug.map((row) => row[m])
}

// ── Matrix helpers (BigInt) + Frac transcription ──────────────────────────────
type Frac = [number, number]

const transposeBig = (M: Big[][]): Big[][] => M.map((_, i) => M.map((row) => row[i]))

function matMulBig(A: Big[][], C: Big[][]): Big[][] {
  const n = A.length
  const inner = C.length
  const wide = C[0].length
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: wide }, (_, j) => {
      let s = B(0n)
      for (let t = 0; t < inner; t++) s = addB(s, mulB(A[i][t], C[t][j]))
      return s
    }),
  )
}

// Independent matrix power by repeated multiply (n is small: 2,3,4 here).
function matPowBig(P: Big[][], n: number): Big[][] {
  let r = P
  for (let k = 1; k < n; k++) r = matMulBig(r, P)
  return r
}

const bigToRat = (b: Big): Rational => ({ n: Number(b.n), d: Number(b.d) })
const bigMatToRat = (M: Big[][]): Rational[][] => M.map((r) => r.map(bigToRat))
const toBigMat = (m: Frac[][]): Big[][] => m.map((r) => r.map(([n, d]) => B(n, d)))
const toRatMat = (m: Frac[][]): Rational[][] => m.map((r) => r.map(([n, d]) => reduce(n, d)))

// ── Re-transcribed chain / graph registry (the skeptical second source) ───────
// Rows are row-stochastic; every entry is an exact [numerator, denominator].
const CHAIN_SPEC: Record<string, Frac[][]> = {
  'machine-2': [
    [[1, 2], [1, 2]],
    [[1, 3], [2, 3]],
  ],
  'weather-clear-rainy': [
    [[3, 5], [2, 5]],
    [[3, 10], [7, 10]],
  ],
  'weather-gfg': [
    [[7, 10], [3, 10]],
    [[4, 10], [6, 10]],
  ],
  'snoqualmie': [
    [[4, 5], [1, 5]],
    [[2, 5], [3, 5]],
  ],
  'weather-asym': [
    [[1, 4], [3, 4]],
    [[1, 5], [4, 5]],
  ],
  'weather-half-3q': [
    [[1, 2], [1, 2]],
    [[1, 4], [3, 4]],
  ],
  'cloudy-town': [
    [[0, 1], [1, 2], [1, 2]],
    [[1, 4], [1, 2], [1, 4]],
    [[1, 4], [1, 4], [1, 2]],
  ],
  'land-of-oz': [
    [[1, 2], [1, 4], [1, 4]],
    [[1, 2], [0, 1], [1, 2]],
    [[1, 4], [1, 4], [1, 2]],
  ],
  'ergodic-3': [
    [[1, 2], [1, 4], [1, 4]],
    [[1, 3], [1, 3], [1, 3]],
    [[0, 1], [1, 2], [1, 2]],
  ],
  'ehrenfest-2': [
    [[0, 1], [1, 1], [0, 1]],
    [[1, 2], [0, 1], [1, 2]],
    [[0, 1], [1, 1], [0, 1]],
  ],
  'ehrenfest-3': [
    [[0, 1], [1, 1], [0, 1], [0, 1]],
    [[1, 3], [0, 1], [2, 3], [0, 1]],
    [[0, 1], [2, 3], [0, 1], [1, 3]],
    [[0, 1], [0, 1], [1, 1], [0, 1]],
  ],
  'ehrenfest-4': [
    [[0, 1], [1, 1], [0, 1], [0, 1], [0, 1]],
    [[1, 4], [0, 1], [3, 4], [0, 1], [0, 1]],
    [[0, 1], [1, 2], [0, 1], [1, 2], [0, 1]],
    [[0, 1], [0, 1], [3, 4], [0, 1], [1, 4]],
    [[0, 1], [0, 1], [0, 1], [1, 1], [0, 1]],
  ],
  'gambler-0to3-up2_3': [
    [[1, 1], [0, 1], [0, 1], [0, 1]],
    [[1, 3], [0, 1], [2, 3], [0, 1]],
    [[0, 1], [1, 3], [0, 1], [2, 3]],
    [[0, 1], [0, 1], [0, 1], [1, 1]],
  ],
  'drunkard-0to4': [
    [[1, 1], [0, 1], [0, 1], [0, 1], [0, 1]],
    [[1, 2], [0, 1], [1, 2], [0, 1], [0, 1]],
    [[0, 1], [1, 2], [0, 1], [1, 2], [0, 1]],
    [[0, 1], [0, 1], [1, 2], [0, 1], [1, 2]],
    [[0, 1], [0, 1], [0, 1], [0, 1], [1, 1]],
  ],
  'coin-hhh-thh': [
    [[0, 1], [1, 2], [0, 1], [1, 2], [0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [1, 2], [1, 2], [0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1], [1, 2], [0, 1], [1, 2], [0, 1]],
    [[0, 1], [0, 1], [0, 1], [1, 2], [1, 2], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1], [1, 2], [0, 1], [0, 1], [1, 2]],
    [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [1, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [1, 1]],
  ],
  'dice-12-vs-77': [
    [[29, 36], [1, 6], [0, 1], [1, 36]],
    [[29, 36], [0, 1], [1, 6], [1, 36]],
    [[0, 1], [0, 1], [1, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1], [1, 1]],
  ],
  'thh-wait': [
    [[1, 2], [1, 2], [0, 1], [0, 1]],
    [[0, 1], [1, 2], [1, 2], [0, 1]],
    [[0, 1], [1, 2], [0, 1], [1, 2]],
    [[0, 1], [0, 1], [0, 1], [1, 1]],
  ],
  'hh-wait': [
    [[1, 2], [1, 2], [0, 1]],
    [[1, 2], [0, 1], [1, 2]],
    [[0, 1], [0, 1], [1, 1]],
  ],
  'hhh-wait': [
    [[1, 2], [1, 2], [0, 1], [0, 1]],
    [[1, 2], [0, 1], [1, 2], [0, 1]],
    [[1, 2], [0, 1], [0, 1], [1, 2]],
    [[0, 1], [0, 1], [0, 1], [1, 1]],
  ],
}

const GRAPH_SPEC: Record<string, Frac[][]> = {
  'pr-3cycle': [
    [[0, 1], [1, 1], [0, 1]],
    [[0, 1], [0, 1], [1, 1]],
    [[1, 1], [0, 1], [0, 1]],
  ],
  'pr-4node': [
    [[0, 1], [1, 1], [0, 1], [0, 1]],
    [[1, 2], [0, 1], [0, 1], [1, 2]],
    [[1, 2], [0, 1], [0, 1], [1, 2]],
    [[1, 3], [1, 3], [1, 3], [0, 1]],
  ],
  'pr-3node': [
    [[0, 1], [1, 2], [1, 2]],
    [[0, 1], [0, 1], [1, 1]],
    [[1, 1], [0, 1], [0, 1]],
  ],
}

const ABSORBING: Record<string, number[]> = {
  'gambler-0to3-up2_3': [0, 3],
  'drunkard-0to4': [0, 4],
  'coin-hhh-thh': [5, 6],
  'dice-12-vs-77': [2, 3],
  'thh-wait': [3],
  'hh-wait': [2],
  'hhh-wait': [3],
}

const CHAINS_BIG: Record<string, Big[][]> = Object.fromEntries(
  Object.entries(CHAIN_SPEC).map(([k, v]) => [k, toBigMat(v)]),
)
const CHAINS_RAT: Record<string, Rational[][]> = Object.fromEntries(
  Object.entries(CHAIN_SPEC).map(([k, v]) => [k, toRatMat(v)]),
)
const GRAPHS_BIG: Record<string, Big[][]> = Object.fromEntries(
  Object.entries(GRAPH_SPEC).map(([k, v]) => [k, toBigMat(v)]),
)
const GRAPHS_RAT: Record<string, Rational[][]> = Object.fromEntries(
  Object.entries(GRAPH_SPEC).map(([k, v]) => [k, toRatMat(v)]),
)

// ── Independent BigInt ground-truth derivations (NO engine calls) ─────────────
const transientOf = (n: number, absorbing: number[]): number[] => {
  const s = new Set(absorbing)
  return Array.from({ length: n }, (_, i) => i).filter((i) => !s.has(i))
}

// Stationary pi solving piP=pi, sum(pi)=1: A = (P^T - I) with last row all-ones,
// b = e_last. Independent BigInt elimination (mirrors the engine's setup only).
function stationaryBig(P: Big[][]): Big[] {
  const n = P.length
  const PT = transposeBig(P)
  const A = PT.map((row, i) => row.map((val, j) => subB(val, i === j ? B(1n) : B(0n))))
  A[n - 1] = Array.from({ length: n }, () => B(1n))
  const b = Array.from({ length: n }, (_, i) => (i === n - 1 ? B(1n) : B(0n)))
  return solveBig(A, b)
}

// Absorption column toward `target`: (I - Q) a = R[:,target], indexed by T.
function absorbColVecBig(P: Big[][], T: number[], target: number): Big[] {
  const IQ = T.map((ti, a) => T.map((tj, b) => subB(a === b ? B(1n) : B(0n), P[ti][tj])))
  const Rcol = T.map((ti) => P[ti][target])
  return solveBig(IQ, Rcol)
}

// Expected absorption time: (I - Q) t = 1, indexed by T.
function expectedVecBig(P: Big[][], T: number[]): Big[] {
  const IQ = T.map((ti, a) => T.map((tj, b) => subB(a === b ? B(1n) : B(0n), P[ti][tj])))
  const ones = T.map(() => B(1n))
  return solveBig(IQ, ones)
}

// 0..N gambler's-ruin walk: interior up=pNum/pDen, down=(pDen-pNum)/pDen; 0,N absorbing.
function buildWalkBig(N: number, pNum: number, pDen: number): Big[][] {
  const up = B(pNum, pDen)
  const down = B(pDen - pNum, pDen)
  const P = Array.from({ length: N + 1 }, () => Array.from({ length: N + 1 }, () => B(0n)))
  for (let r = 0; r <= N; r++) {
    if (r === 0 || r === N) P[r][r] = B(1n)
    else {
      P[r][r + 1] = up
      P[r][r - 1] = down
    }
  }
  return P
}

// Closed-form gambler's ruin, the second independent ground truth for the walk.
function gamblerClosed(
  N: number,
  pNum: number,
  pDen: number,
  i: number,
  query: string,
): Big {
  const fair = 2 * pNum === pDen
  const p = B(pNum, pDen)
  const q = B(pDen - pNum, pDen)
  const r = divB(q, p)
  if (query === 'reach') {
    if (fair) return B(i, N)
    return divB(subB(B(1n), powB(r, i)), subB(B(1n), powB(r, N)))
  }
  // duration
  if (fair) return B(i * (N - i), 1)
  const qp = subB(q, p)
  const frac = divB(subB(B(1n), powB(r, i)), subB(B(1n), powB(r, N)))
  return subB(divB(B(i), qp), mulB(divB(B(N), qp), frac))
}

// PageRank: G = d*M + (1-d)/n*J (all-zero rows of M -> uniform), then piG=pi.
function pagerankBig(M: Big[][], dNum: number, dDen: number): Big[] {
  const n = M.length
  const d = B(dNum, dDen)
  const oneMinusD = subB(B(1n), d)
  const u = B(1, n)
  const Mp = M.map((row) =>
    row.every((c) => c.n === 0n) ? Array.from({ length: n }, () => B(1, n)) : row,
  )
  const G = Mp.map((row) => row.map((val) => addB(mulB(d, val), mulB(oneMinusD, u))))
  return stationaryBig(G)
}

// Independent detailed-balance check: pi_i P_ij == pi_j P_ji for all i,j.
function isReversibleBig(P: Big[][], pi: Big[]): boolean {
  const n = P.length
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (!eqB(mulB(pi[i], P[i][j]), mulB(pi[j], P[j][i]))) return false
  return true
}

// Independent graph period via BFS gcd of back-edge level differences.
function graphPeriod(adj: boolean[][], start: number): number {
  const n = adj.length
  const level = new Array<number>(n).fill(-1)
  level[start] = 0
  const queue: number[] = [start]
  let period = 0n
  while (queue.length > 0) {
    const u = queue.shift()
    if (u === undefined) break
    for (let v = 0; v < n; v++) {
      if (!adj[u][v]) continue
      if (level[v] === -1) {
        level[v] = level[u] + 1
        queue.push(v)
      } else {
        const diff = level[u] + 1 - level[v]
        if (diff > 0) period = gcdB(period, BigInt(diff))
      }
    }
  }
  return period === 0n ? 1 : Number(period)
}

function groundTruth(q: Question): Big[] | null {
  const t = q.template?.id
  const p = (q.template?.params ?? {}) as Record<string, unknown>
  const num = (k: string): number => Number(p[k])
  const str = (k: string): string => String(p[k])
  if (t === 'tmpl-stationary') return stationaryBig(CHAINS_BIG[str('chain')])
  if (t === 'tmpl-multistep')
    return [matPowBig(CHAINS_BIG[str('chain')], num('n'))[num('from')][num('to')]]
  if (t === 'tmpl-absorption') {
    const chain = str('chain')
    const P = CHAINS_BIG[chain]
    const T = transientOf(P.length, ABSORBING[chain])
    return [absorbColVecBig(P, T, num('target'))[T.indexOf(num('start'))]]
  }
  if (t === 'tmpl-expected-absorption') {
    const chain = str('chain')
    const P = CHAINS_BIG[chain]
    const T = transientOf(P.length, ABSORBING[chain])
    return [expectedVecBig(P, T)[T.indexOf(num('start'))]]
  }
  if (t === 'tmpl-gamblers-ruin') {
    const N = num('N')
    const i = num('i')
    const walk = buildWalkBig(N, num('pNum'), num('pDen'))
    const T = transientOf(N + 1, [0, N])
    const val =
      str('query') === 'reach'
        ? absorbColVecBig(walk, T, N)[T.indexOf(i)]
        : expectedVecBig(walk, T)[T.indexOf(i)]
    return [val]
  }
  if (t === 'tmpl-detailed-balance') return stationaryBig(CHAINS_BIG[str('chain')])
  if (t === 'tmpl-kac-return')
    return [divB(B(1n), stationaryBig(CHAINS_BIG[str('chain')])[num('state')])]
  if (t === 'tmpl-pagerank')
    return pagerankBig(GRAPHS_BIG[str('graph')], num('dNum'), num('dDen'))
  // free-form by id
  switch (q.id) {
    case 'ff-classify-then-solve':
      return absorbColVecBig(CHAINS_BIG['drunkard-0to4'], [1, 2, 3], 4)
    case 'ff-ehrenfest-periodic':
      return stationaryBig(CHAINS_BIG['ehrenfest-2'])
    case 'ff-cloudy-stationary-and-kac':
      return stationaryBig(CHAINS_BIG['cloudy-town'])
    case 'ff-oz-multistep-and-convergence':
      return [matPowBig(CHAINS_BIG['land-of-oz'], 2)[0][2]]
    case 'ff-absorb-prob-and-time': {
      const P = CHAINS_BIG['gambler-0to3-up2_3']
      const T = transientOf(P.length, ABSORBING['gambler-0to3-up2_3'])
      return [absorbColVecBig(P, T, 3)[T.indexOf(1)]]
    }
    default:
      return null
  }
}

// ── Engine (documented-API) re-call → Rational[] ──────────────────────────────
function engineValue(q: Question): Rational[] | null {
  const t = q.template?.id
  const p = (q.template?.params ?? {}) as Record<string, unknown>
  const num = (k: string): number => Number(p[k])
  const str = (k: string): string => String(p[k])
  if (t === 'tmpl-stationary') return stationaryDistribution(CHAINS_RAT[str('chain')])
  if (t === 'tmpl-multistep')
    return [matrixPower(CHAINS_RAT[str('chain')], num('n'))[num('from')][num('to')]]
  if (t === 'tmpl-absorption') {
    const chain = str('chain')
    const P = CHAINS_RAT[chain]
    const ab = ABSORBING[chain]
    const T = transientOf(P.length, ab)
    const Bm = absorptionProbabilities(P, ab)
    return [Bm[T.indexOf(num('start'))][ab.indexOf(num('target'))]]
  }
  if (t === 'tmpl-expected-absorption') {
    const chain = str('chain')
    const P = CHAINS_RAT[chain]
    const ab = ABSORBING[chain]
    const T = transientOf(P.length, ab)
    return [expectedAbsorptionTime(P, ab)[T.indexOf(num('start'))]]
  }
  if (t === 'tmpl-gamblers-ruin') {
    const N = num('N')
    const i = num('i')
    const walk = bigMatToRat(buildWalkBig(N, num('pNum'), num('pDen')))
    buildChain(walk, walk.map((_, k) => `w${k}`)) // sanity: stochastic & well-formed
    const ab = [0, N]
    const T = transientOf(N + 1, ab)
    return str('query') === 'reach'
      ? [absorptionProbabilities(walk, ab)[T.indexOf(i)][ab.indexOf(N)]]
      : [expectedAbsorptionTime(walk, ab)[T.indexOf(i)]]
  }
  if (t === 'tmpl-detailed-balance') return detailedBalance(CHAINS_RAT[str('chain')]).pi
  if (t === 'tmpl-kac-return')
    return [kacReturnTime(CHAINS_RAT[str('chain')], num('state'))]
  if (t === 'tmpl-pagerank')
    return pagerank(GRAPHS_RAT[str('graph')], reduce(num('dNum'), num('dDen')))
  switch (q.id) {
    case 'ff-classify-then-solve': {
      const Bm = absorptionProbabilities(CHAINS_RAT['drunkard-0to4'], [0, 4])
      return [Bm[0][1], Bm[1][1], Bm[2][1]]
    }
    case 'ff-ehrenfest-periodic':
      return stationaryDistribution(CHAINS_RAT['ehrenfest-2'])
    case 'ff-cloudy-stationary-and-kac':
      return stationaryDistribution(CHAINS_RAT['cloudy-town'])
    case 'ff-oz-multistep-and-convergence':
      return [matrixPower(CHAINS_RAT['land-of-oz'], 2)[0][2]]
    case 'ff-absorb-prob-and-time':
      return [absorptionProbabilities(CHAINS_RAT['gambler-0to3-up2_3'], [0, 3])[0][1]]
    default:
      return null
  }
}

// ── Advisory expected-answer table (an extra independent cross-check) ──────────
const ADVISORY: Record<string, string> = {
  'tmpl-stationary#machine-2': '2/5,3/5',
  'tmpl-stationary#clear-rainy': '3/7,4/7',
  'tmpl-stationary#gfg': '4/7,3/7',
  'tmpl-stationary#snoqualmie': '2/3,1/3',
  'tmpl-stationary#weather-asym': '4/19,15/19',
  'tmpl-stationary#cloudy-town': '1/5,2/5,2/5',
  'tmpl-stationary#land-of-oz': '2/5,1/5,2/5',
  'tmpl-stationary#ergodic-3': '1/4,3/8,3/8',
  'tmpl-multistep#clear-rainy-n2-c-r': '13/25',
  'tmpl-multistep#oz-n2-rain-rain': '7/16',
  'tmpl-multistep#oz-n2-rain-snow': '3/8',
  'tmpl-multistep#clear-rainy-n2-r-c': '39/100',
  'tmpl-multistep#oz-n3-rain-snow': '25/64',
  'tmpl-multistep#oz-n4-rain-snow': '51/128',
  'tmpl-absorption#gambler-1to3': '4/7',
  'tmpl-absorption#drunkard-1to4': '1/4',
  'tmpl-absorption#gambler-2to3': '6/7',
  'tmpl-absorption#coin-thh-first': '7/8',
  'tmpl-absorption#dice-12-first': '7/13',
  'tmpl-absorption#coin-hhh-first': '1/8',
  'tmpl-absorption#dice-77-first': '6/13',
  'tmpl-expected-absorption#drunkard-i2': '4',
  'tmpl-expected-absorption#hh-wait': '6',
  'tmpl-expected-absorption#drunkard-i1': '3',
  'tmpl-expected-absorption#thh-wait': '8',
  'tmpl-expected-absorption#hhh-wait': '14',
  'tmpl-gamblers-ruin#N4-p1_2-i1-reach': '1/4',
  'tmpl-gamblers-ruin#N4-p1_2-i2-duration': '4',
  'tmpl-gamblers-ruin#N6-p1_2-i3-reach': '1/2',
  'tmpl-gamblers-ruin#N5-p1_2-i2-duration': '6',
  'tmpl-gamblers-ruin#N10-p1_2-i5-duration': '25',
  'tmpl-gamblers-ruin#N4-p1_3-i2-reach': '1/5',
  'tmpl-gamblers-ruin#N4-p2_5-i2-reach': '4/13',
  'tmpl-gamblers-ruin#N4-p2_5-i2-duration': '50/13',
  'tmpl-gamblers-ruin#N5-p2_3-i3-reach': '28/31',
  'tmpl-gamblers-ruin#N6-p1_3-i4-reach': '5/21',
  'tmpl-detailed-balance#weather-half-3q': '1/3,2/3',
  'tmpl-detailed-balance#ehrenfest-2': '1/4,1/2,1/4',
  'tmpl-detailed-balance#ehrenfest-3': '1/8,3/8,3/8,1/8',
  'tmpl-detailed-balance#ehrenfest-4': '1/16,1/4,3/8,1/4,1/16',
  'tmpl-kac-return#clear-rainy-clear': '7/3',
  'tmpl-kac-return#clear-rainy-rainy': '7/4',
  'tmpl-kac-return#cloudy-sunny': '5',
  'tmpl-kac-return#cloudy-cloudy': '5/2',
  'tmpl-kac-return#cloudy-rainy': '5/2',
  'tmpl-pagerank#3cycle-d85_100': '1/3,1/3,1/3',
  'tmpl-pagerank#3cycle-d1_2': '1/3,1/3,1/3',
  'tmpl-pagerank#4node-d1': '4/13,5/13,1/13,3/13',
  'tmpl-pagerank#3node-d1_2': '14/39,10/39,5/13',
  'tmpl-pagerank#3cycle-d9_10': '1/3,1/3,1/3',
  'ff-classify-then-solve': '1/4,1/2,3/4',
  'ff-ehrenfest-periodic': '1/4,1/2,1/4',
  'ff-cloudy-stationary-and-kac': '1/5,2/5,2/5',
  'ff-oz-multistep-and-convergence': '3/8',
  'ff-absorb-prob-and-time': '4/7',
}

// ── Comparison + hygiene helpers ──────────────────────────────────────────────
const failures: string[] = []
const fail = (id: string, msg: string) => {
  failures.push(`${id}: ${msg}`)
}

const engBig = (r: Rational, id: string): Big | null => {
  if (!Number.isInteger(r.n) || !Number.isInteger(r.d)) {
    fail(id, `engine produced NON-INTEGER rational ${r.n}/${r.d} — PRECISION LOSS`)
    return null
  }
  if (Math.abs(r.n) > MAX || Math.abs(r.d) > MAX)
    fail(id, `engine |n|/|d| exceed MAX_SAFE ${r.n}/${r.d}`)
  return B(BigInt(r.n), BigInt(r.d))
}
const engVec = (rs: Rational[], id: string): Big[] | null => {
  const out: Big[] = []
  for (const r of rs) {
    const b = engBig(r, id)
    if (b === null) return null
    out.push(b)
  }
  return out
}
// Exact-rational hygiene: integer / fraction, or comma-vector of them; no decimals.
const answerVec = (s: string): Big[] =>
  String(s)
    .trim()
    .split(',')
    .map((part) => {
      const m = part.trim().match(/^(-?\d+)(?:\/(-?\d+))?$/)
      if (!m) throw new Error(`non-exact / unparseable answer component "${part}"`)
      return B(BigInt(m[1]), m[2] ? BigInt(m[2]) : 1n)
    })
const vecEq = (a: Big[], b: Big[]): boolean =>
  a.length === b.length && a.every((x, i) => eqB(x, b[i]))
const fmtVecB = (v: Big[]): string => v.map(fmtB).join(',')

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
}
function rungLeaks(answer: string, rung: string): boolean {
  const esc = escapeRegExp(answer)
  if (answer.includes('/')) return new RegExp(`(?<![\\d/])${esc}(?![\\d/])`).test(rung)
  return (
    new RegExp(`(?:=|⇒|is\\s+|:\\s*)\\s*${esc}\\b`).test(rung) ||
    new RegExp(`[=:]\\s*${esc}$`).test(rung.trim())
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const raw = JSON.parse(readFileSync('interviews/course-markov-chains.json', 'utf8'))
const parsed = InterviewPackSchema.safeParse(raw)
if (!parsed.success) {
  console.error('✗ schema validation FAILED: course-markov-chains.json')
  console.error(parsed.error)
  process.exit(1)
}
const pack = parsed.data
console.log('✓ schema: course-markov-chains.json (InterviewPackSchema.safeParse OK)')

// Transcription sanity: every re-transcribed chain must be a valid stochastic
// matrix (buildChain throws otherwise), and every graph row sums to 0 or 1.
for (const name of Object.keys(CHAIN_SPEC)) {
  try {
    buildChain(CHAINS_RAT[name], CHAINS_RAT[name].map((_, i) => `${name}-s${i}`))
  } catch (e) {
    fail(`registry:${name}`, `buildChain rejected my transcription: ${(e as Error).message}`)
  }
}
for (const name of Object.keys(GRAPH_SPEC)) {
  GRAPHS_BIG[name].forEach((row, i) => {
    const s = row.reduce((acc, c) => addB(acc, c), B(0n))
    if (!eqB(s, B(1n)) && !eqB(s, B(0n)))
      fail(`registry:${name}`, `graph row ${i} sums to ${fmtB(s)} (need 0 or 1)`)
  })
}

console.log('\n=== 4-WAY AGREEMENT (BigInt gt == engine == engineCheck == hidden) ===\n')
const MARKOV_ENGINE = 'src/engine/markov.ts'
const RUBRIC_AXES = ['correctness', 'approach', 'rigor', 'communication', 'speed'] as const
let pass = 0
for (const q of pack.questions) {
  const before = failures.length

  // per-question structural gates
  if (q.engineCheck.module !== MARKOV_ENGINE)
    fail(q.id, `engineCheck.module "${q.engineCheck.module}" != ${MARKOV_ENGINE}`)
  if (q.engineCheck.verified !== true) fail(q.id, 'engineCheck.verified !== true')
  if (q.hidden.hintLadder.length !== 3)
    fail(q.id, `hintLadder length ${q.hidden.hintLadder.length} != 3`)
  for (const ax of RUBRIC_AXES)
    if (typeof q.hidden.rubric[ax] !== 'string' || q.hidden.rubric[ax].length === 0)
      fail(q.id, `rubric axis ${ax} missing`)
  if (q.followUps.length < 1) fail(q.id, 'followUps empty')
  if (!['hard', 'harder', 'brutal'].includes(q.tier)) fail(q.id, `bad tier ${q.tier}`)
  if (q.engineCheck.answer !== q.hidden.answer)
    fail(q.id, `engineCheck.answer "${q.engineCheck.answer}" != hidden.answer "${q.hidden.answer}"`)

  // exact-rational hygiene + parse stored answers
  let ec: Big[] | null = null
  let hid: Big[] | null = null
  try {
    ec = answerVec(q.engineCheck.answer)
  } catch (e) {
    fail(q.id, (e as Error).message + ' (engineCheck.answer)')
  }
  try {
    hid = answerVec(q.hidden.answer)
  } catch (e) {
    fail(q.id, (e as Error).message + ' (hidden.answer)')
  }

  // independent BigInt ground truth + engine re-call
  let gt: Big[] | null = null
  let ev: Rational[] | null = null
  try {
    gt = groundTruth(q)
  } catch (e) {
    fail(q.id, `ground-truth threw: ${(e as Error).message}`)
  }
  try {
    ev = engineValue(q)
  } catch (e) {
    fail(q.id, `engine re-call threw: ${(e as Error).message}`)
  }
  if (gt === null) fail(q.id, 'no independent ground truth')
  if (ev === null) fail(q.id, 'no engine re-call')
  const evB = ev ? engVec(ev, q.id) : null

  // advisory cross-check
  const advStr = ADVISORY[q.id]
  let adv: Big[] | null = null
  if (advStr === undefined) fail(q.id, 'no advisory entry')
  else
    try {
      adv = answerVec(advStr)
    } catch (e) {
      fail(q.id, (e as Error).message + ' (advisory)')
    }

  // the 4-way agreement + advisory
  if (gt && evB && !vecEq(gt, evB)) fail(q.id, `gt ${fmtVecB(gt)} != engine ${fmtVecB(evB)}`)
  if (gt && ec && !vecEq(gt, ec))
    fail(q.id, `gt ${fmtVecB(gt)} != engineCheck.answer ${q.engineCheck.answer}`)
  if (gt && hid && !vecEq(gt, hid))
    fail(q.id, `gt ${fmtVecB(gt)} != hidden.answer ${q.hidden.answer}`)
  if (ec && hid && !vecEq(ec, hid)) fail(q.id, 'engineCheck.answer != hidden.answer (rational)')
  if (adv && ec && !vecEq(adv, ec)) fail(q.id, `advisory ${advStr} != stored ${q.engineCheck.answer}`)
  if (adv && gt && !vecEq(adv, gt)) fail(q.id, `advisory ${advStr} != gt ${fmtVecB(gt)}`)

  // gambler's-ruin: the walk-solve must ALSO equal the closed form
  if (q.template?.id === 'tmpl-gamblers-ruin' && gt) {
    const pp = q.template.params as Record<string, unknown>
    const closed = gamblerClosed(
      Number(pp.N),
      Number(pp.pNum),
      Number(pp.pDen),
      Number(pp.i),
      String(pp.query),
    )
    if (!eqB(gt[0], closed))
      fail(q.id, `walk-solve ${fmtB(gt[0])} != closed-form ${fmtB(closed)}`)
  }

  const ok = failures.length === before
  if (ok) pass++
  const engStr = ev ? (ev.length === 1 ? formatRational(ev[0]) : formatVector(ev)) : '?'
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${q.id.padEnd(40)} gt=${gt ? fmtVecB(gt) : '?'} eng=${engStr} stored=${q.engineCheck.answer}`,
  )
}

// ── Independent periodicity / reversibility checks ────────────────────────────
console.log('\n=== PERIODICITY / REVERSIBILITY (independent) ===')
{
  const adj = CHAINS_BIG['ehrenfest-2'].map((row) => row.map((c) => c.n !== 0n))
  const myPeriod = graphPeriod(adj, 0)
  const engPeriod = classifyStates(CHAINS_RAT['ehrenfest-2'])[0].period
  if (myPeriod !== 2) fail('ff-ehrenfest-periodic', `independent period ${myPeriod} != 2`)
  if (engPeriod !== 2) fail('ff-ehrenfest-periodic', `engine classifyStates period ${engPeriod} != 2`)
  console.log(`ehrenfest-2 period: independent=${myPeriod}, engine=${engPeriod} (expect 2)`)
}
const dbChains = pack.questions
  .filter((q) => q.template?.id === 'tmpl-detailed-balance')
  .map((q) => String((q.template?.params as Record<string, unknown>).chain))
for (const chain of dbChains) {
  const pi = stationaryBig(CHAINS_BIG[chain])
  if (!isReversibleBig(CHAINS_BIG[chain], pi))
    fail(`tmpl-detailed-balance#${chain}`, 'pi_i·P_ij != pi_j·P_ji (not reversible)')
}
console.log(
  `detailed balance: verified pi_i·P_ij = pi_j·P_ji on ${dbChains.length} chains (${dbChains.join(', ')})`,
)

// ── Schema + structural gates ─────────────────────────────────────────────────
console.log('\n=== STRUCTURAL + SCHEMA GATES ===')
const fps = pack.questions.map((q) => q.fingerprint)
if (new Set(fps).size !== fps.length)
  fail('STRUCT', `duplicate fingerprints: ${fps.filter((f, i) => fps.indexOf(f) !== i).join(', ')}`)
const byTier = { hard: 0, harder: 0, brutal: 0 }
pack.questions.forEach((q) => {
  byTier[q.tier]++
})
if (
  byTier.hard !== pack.counts.byTier.hard ||
  byTier.harder !== pack.counts.byTier.harder ||
  byTier.brutal !== pack.counts.byTier.brutal
)
  fail('STRUCT', `byTier mismatch: actual ${JSON.stringify(byTier)} vs ${JSON.stringify(pack.counts.byTier)}`)
if (pack.questions.length !== pack.counts.total)
  fail('STRUCT', `total mismatch: ${pack.questions.length} vs ${pack.counts.total}`)
const templated = pack.questions.filter((q) => q.template).length
const freeForm = pack.questions.length - templated
if (templated !== pack.counts.templated)
  fail('STRUCT', `templated mismatch: ${templated} vs ${pack.counts.templated}`)
if (freeForm !== pack.counts.freeForm)
  fail('STRUCT', `freeForm mismatch: ${freeForm} vs ${pack.counts.freeForm}`)
if (pack.questions.length < 50) fail('STRUCT', `too few questions: ${pack.questions.length}`)
if (pack.questions.length !== 55)
  fail('STRUCT', `expected 55 questions, got ${pack.questions.length}`)
console.log(`fingerprints unique: ${new Set(fps).size}/${fps.length}`)
console.log(
  `counts: total=${pack.questions.length} byTier=${JSON.stringify(byTier)} templated=${templated} freeForm=${freeForm}`,
)

// ── No-answer-leak spot-check (rungs 2 & 3 must be method-only) ────────────────
console.log('\n=== NO-ANSWER-LEAK spot-check (rungs 2 & 3 must be method-only) ===')
let leaks = 0
for (const q of pack.questions) {
  const a = q.engineCheck.answer
  if (rungLeaks(a, q.hidden.hintLadder[1] ?? '')) {
    leaks++
    console.log(`  LEAK ${q.id} rung 2 states ${a}`)
  }
  if (rungLeaks(a, q.hidden.hintLadder[2] ?? '')) {
    leaks++
    console.log(`  LEAK ${q.id} rung 3 states ${a}`)
  }
}
if (leaks > 0) fail('NO-LEAK', `${leaks} hint rung(s) state the final answer`)
else console.log('PASS  no near-reveal/stronger rung states the final answer (0 leaks)')

// ── Tally ─────────────────────────────────────────────────────────────────────
console.log('\n=== TALLY ===')
console.log(`4-way agreement: ${pass}/${pack.questions.length} questions PASS`)
console.log(`no-answer-leak: ${leaks} leaks`)
if (failures.length === 0) {
  console.log(
    `\nRESULT: ALL CHECKS PASS — ${pass}/${pack.questions.length} independently reproduced ` +
      `(BigInt gt == engine == engineCheck == hidden), advisory + closed-form + reversibility cross-checks OK, ` +
      `schema valid, ${leaks} leaks.`,
  )
  process.exit(0)
}
console.log(`\nRESULT: ${failures.length} FAILURE(S):`)
for (const f of failures) console.log(`  - ${f}`)
process.exit(1)
