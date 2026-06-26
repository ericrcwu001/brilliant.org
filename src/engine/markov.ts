import type { Rational } from './types'
import {
  reduce,
  ratAdd,
  ratSub,
  ratMul,
  ratDiv,
  ratNum,
  solveLinearSystem,
} from './automaton'
import { mulberry32 } from './simulate'

// ── Private helpers ────────────────────────────────────────────────────────

const equalRat = (a: Rational, b: Rational): boolean => a.n * b.d === b.n * a.d

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a || 1
}

function transpose(M: Rational[][]): Rational[][] {
  const n = M.length
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => M[j][i]),
  )
}

function matMul(A: Rational[][], B: Rational[][]): Rational[][] {
  const n = A.length
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      let s: Rational = { n: 0, d: 1 }
      for (let k = 0; k < n; k++) s = ratAdd(s, ratMul(A[i][k], B[k][j]))
      return s
    }),
  )
}

function identity(n: number): Rational[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? { n: 1, d: 1 } : { n: 0, d: 1 })),
  )
}

// Build the (I − Q) submatrix for the transient states.
function buildIQ(P: Rational[][], transient: number[]): Rational[][] {
  const nt = transient.length
  return Array.from({ length: nt }, (_, a) =>
    Array.from({ length: nt }, (_, b) =>
      ratSub(
        a === b ? { n: 1, d: 1 } : { n: 0, d: 1 },
        P[transient[a]][transient[b]],
      ),
    ),
  )
}

// Shared augmented-system setup for πM = π, Σπ = 1 (M is the chain matrix).
// Returns a fresh A and b each time; solveLinearSystem creates its own copy.
function stationarySystem(M: Rational[][]): { A: Rational[][]; b: Rational[] } {
  const n = M.length
  const MT = transpose(M)
  // A = Mᵀ − I; last row replaced with ones for the normalisation constraint.
  const A: Rational[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      ratSub(MT[i][j], i === j ? { n: 1, d: 1 } : { n: 0, d: 1 }),
    ),
  )
  A[n - 1] = Array.from({ length: n }, () => ({ n: 1, d: 1 }))
  const b: Rational[] = Array.from({ length: n }, (_, i) =>
    i === n - 1 ? { n: 1, d: 1 } : { n: 0, d: 1 },
  )
  return { A, b }
}

// Graph-theoretic period via BFS over within-class directed edges.
function computePeriod(C: number[], adj: boolean[][]): number {
  const hasInternal = C.some(u => C.some(v => adj[u][v]))
  if (!hasInternal) return 0

  const level = new Map<number, number>([[C[0], 0]])
  const queue = [C[0]]
  let period = 0

  while (queue.length > 0) {
    const u = queue.shift()!
    const lu = level.get(u)!
    for (const v of C) {
      if (!adj[u][v]) continue
      if (!level.has(v)) {
        level.set(v, lu + 1)
        queue.push(v)
      } else {
        // In directed BFS, lu+1 − level[v] ≥ 0; accumulate non-zero diffs.
        const diff = lu + 1 - level.get(v)!
        if (diff > 0) period = gcd(period, diff)
      }
    }
  }

  // gcd(0, …) remains 0 only if no back-edges existed, which cannot happen in
  // a strongly-connected graph with internal edges; the fallback yields 1 for
  // the self-loop case where diff=1 makes gcd = 1 before we reach here.
  return period === 0 ? 1 : period
}

// ── Public API ─────────────────────────────────────────────────────────────

export type Chain = { P: Rational[][]; labels: string[]; n: number }
export type StateClass = {
  index: number
  class: number
  kind: 'recurrent' | 'transient' | 'absorbing'
  period: number
}

export function buildChain(P: Rational[][], labels: string[]): Chain {
  const n = P.length
  if (labels.length !== n) {
    throw new Error(`labels.length ${labels.length} !== P.length ${n}`)
  }
  for (let i = 0; i < n; i++) {
    if (P[i].length !== n) {
      throw new Error(`Row ${i} has length ${P[i].length}, expected ${n}`)
    }
    let sum: Rational = { n: 0, d: 1 }
    for (const p of P[i]) sum = ratAdd(sum, p)
    if (!equalRat(sum, { n: 1, d: 1 })) {
      throw new Error(`Row ${i} sums to ${sum.n}/${sum.d}, expected 1`)
    }
  }
  return { P, labels, n }
}

export function matrixPower(P: Rational[][], n: number): Rational[][] {
  const size = P.length
  if (n === 0) return identity(size)
  if (n === 1) return P.map(row => [...row])
  let result = identity(size)
  let base = P.map(row => [...row])
  let exp = n
  while (exp > 0) {
    if (exp % 2 === 1) result = matMul(result, base)
    base = matMul(base, base)
    exp = Math.floor(exp / 2)
  }
  return result
}

export function classifyStates(P: Rational[][]): StateClass[] {
  const n = P.length
  const adj: boolean[][] = P.map(row => row.map(c => c.n !== 0))

  // Directed reachability via Floyd-Warshall (paths of length ≥ 1).
  const reach: boolean[][] = adj.map(row => [...row])
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      if (!reach[i][k]) continue
      for (let j = 0; j < n; j++) {
        if (reach[k][j]) reach[i][j] = true
      }
    }
  }

  // SCCs: i and j communicate iff reach[i][j] && reach[j][i].
  // Processing in ascending order means each SCC is first found by its
  // smallest member → class IDs are already in ascending-smallest-member order.
  const classOf = new Array<number>(n).fill(-1)
  const sccs: number[][] = []
  for (let i = 0; i < n; i++) {
    if (classOf[i] !== -1) continue
    const scc: number[] = [i]
    classOf[i] = sccs.length
    for (let j = i + 1; j < n; j++) {
      if (reach[i][j] && reach[j][i]) {
        scc.push(j)
        classOf[j] = sccs.length
      }
    }
    sccs.push(scc)
  }

  return Array.from({ length: n }, (_, i) => {
    const clsId = classOf[i]
    const scc = sccs[clsId]

    // A class is closed if no edge exits it.
    let closed = true
    for (const u of scc) {
      for (let v = 0; v < n; v++) {
        if (adj[u][v] && classOf[v] !== clsId) {
          closed = false
          break
        }
      }
      if (!closed) break
    }

    let kind: StateClass['kind']
    if (scc.length === 1 && equalRat(P[i][i], { n: 1, d: 1 })) {
      kind = 'absorbing'
    } else if (closed) {
      kind = 'recurrent'
    } else {
      kind = 'transient'
    }

    return { index: i, class: clsId, kind, period: computePeriod(scc, adj) }
  })
}

export function absorptionProbabilities(
  P: Rational[][],
  absorbing: number[],
): Rational[][] {
  const n = P.length
  const absSet = new Set(absorbing)
  const transient = Array.from({ length: n }, (_, i) => i).filter(i => !absSet.has(i))
  const nt = transient.length
  const na = absorbing.length
  const IQ = buildIQ(P, transient)

  // Solve (I−Q) x = R[:,k] for each absorbing column k.
  const B: Rational[][] = Array.from({ length: nt }, () => new Array<Rational>(na))
  for (let k = 0; k < na; k++) {
    const rk = transient.map(t => P[t][absorbing[k]])
    const x = solveLinearSystem(IQ, rk)
    for (let a = 0; a < nt; a++) B[a][k] = x[a]
  }
  return B
}

export function expectedAbsorptionTime(
  P: Rational[][],
  absorbing: number[],
): Rational[] {
  const n = P.length
  const absSet = new Set(absorbing)
  const transient = Array.from({ length: n }, (_, i) => i).filter(i => !absSet.has(i))
  const nt = transient.length
  const IQ = buildIQ(P, transient)
  const ones: Rational[] = Array.from({ length: nt }, () => ({ n: 1, d: 1 }))
  return solveLinearSystem(IQ, ones)
}

export function stationaryDistribution(P: Rational[][]): Rational[] {
  const { A, b } = stationarySystem(P)
  return solveLinearSystem(A, b)
}

export function kacReturnTime(P: Rational[][], i: number): Rational {
  return ratDiv({ n: 1, d: 1 }, stationaryDistribution(P)[i])
}

export function isReversible(P: Rational[][], pi: Rational[]): boolean {
  const n = P.length
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (!equalRat(ratMul(pi[i], P[i][j]), ratMul(pi[j], P[j][i]))) return false
    }
  }
  return true
}

export function detailedBalance(P: Rational[][]): { reversible: boolean; pi: Rational[] } {
  const pi = stationaryDistribution(P)
  return { pi, reversible: isReversible(P, pi) }
}

export function pagerank(linkGraph: Rational[][], damping: Rational): Rational[] {
  const n = linkGraph.length
  const oneMinusDamping = ratSub({ n: 1, d: 1 }, damping)
  const uniform: Rational = { n: 1, d: n }

  // Replace dangling (all-zero) rows with a uniform row.
  const Mprime: Rational[][] = linkGraph.map(row =>
    row.every(c => c.n === 0)
      ? Array.from({ length: n }, () => ({ n: 1, d: n }))
      : row,
  )

  // G[i][j] = d·M'[i][j] + (1−d)/n
  const G: Rational[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      ratAdd(ratMul(damping, Mprime[i][j]), ratMul(oneMinusDamping, uniform)),
    ),
  )

  const { A, b } = stationarySystem(G)
  return solveLinearSystem(A, b)
}

export function simulateChain(
  P: Rational[][],
  start: number,
  steps: number,
  rng: () => number = mulberry32(0x9e3779b9),
): number[] {
  const path = [start]
  let curr = start
  for (let step = 0; step < steps; step++) {
    const rand = rng()
    let cumsum = 0
    let next = P[curr].length - 1
    for (let j = 0; j < P[curr].length; j++) {
      cumsum += ratNum(P[curr][j])
      if (rand < cumsum) {
        next = j
        break
      }
    }
    path.push(next)
    curr = next
  }
  return path
}

export function formatRational(r: Rational): string {
  const { n, d } = reduce(r.n, r.d)
  return d === 1 ? String(n) : `${n}/${d}`
}

export function formatVector(v: Rational[]): string {
  return v.map(formatRational).join(',')
}
