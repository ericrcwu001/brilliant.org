// Pure, dependency-free, EXACT game-theory engine (rationals as {n,d}, integers,
// and XOR — NO floats); the verifying engine for the Game Theory concept
// (lesson-game-theory-1..6). Mirrors the exact-arithmetic discipline of
// src/engine/automaton.ts / combinatorics.ts. Every number a lesson shows is
// reproduced here and cross-checked by scripts/validate-fixtures.ts (Stage 2 of
// the two-stage fact-check) + the per-lesson factcheck tests.

import type { Rational } from './types'

// ── exact rational arithmetic ────────────────────────────────────────────────
function gcd(a: number, b: number): number {
  let x = a < 0 ? -a : a
  let y = b < 0 ? -b : b
  while (y) {
    ;[x, y] = [y, x % y]
  }
  return x || 1
}

// Reduce to lowest terms; denominator normalized positive. reduce(0, d) = 0/1.
export function reduce(n: number, d: number): Rational {
  if (d === 0) throw new Error('gameTheory.reduce: denominator must be non-zero')
  let nn = n
  let dd = d
  if (dd < 0) {
    nn = -nn
    dd = -dd
  }
  const g = gcd(nn, dd)
  return { n: nn / g, d: dd / g }
}

const rAdd = (a: Rational, b: Rational): Rational => reduce(a.n * b.d + b.n * a.d, a.d * b.d)
const rSub = (a: Rational, b: Rational): Rational => reduce(a.n * b.d - b.n * a.d, a.d * b.d)
const rMul = (a: Rational, b: Rational): Rational => reduce(a.n * b.n, a.d * b.d)
const rDiv = (a: Rational, b: Rational): Rational => {
  if (b.n === 0) throw new Error('gameTheory.rDiv: division by zero')
  return reduce(a.n * b.d, a.d * b.n)
}
// Sign of a - b: -1, 0, or +1 (exact via cross-multiplication; denominators > 0).
const rCmp = (a: Rational, b: Rational): number => {
  const lhs = a.n * b.d
  const rhs = b.n * a.d
  return lhs < rhs ? -1 : lhs > rhs ? 1 : 0
}

// Reduced "n/d"; "n" when the denominator is 1; "0" for zero; sign on numerator.
export function formatRational(r: Rational): string {
  const x = reduce(r.n, r.d)
  return x.d === 1 ? String(x.n) : `${x.n}/${x.d}`
}

export function formatVector(rs: Rational[]): string {
  return rs.map(formatRational).join(',')
}

// ── normal-form (bimatrix) games ─────────────────────────────────────────────
export type Cell = { row: Rational; col: Rational }
export type Game = Cell[][] // game[i][j] = payoffs when row plays i, col plays j

function nRows(g: Game): number {
  return g.length
}
function nCols(g: Game): number {
  return g[0]?.length ?? 0
}

// For each column j, the set of row indices that maximize ROW's payoff (best responses).
export function rowBestResponses(g: Game): number[][] {
  const out: number[][] = []
  for (let j = 0; j < nCols(g); j++) {
    let best: number[] = []
    let bestVal: Rational | null = null
    for (let i = 0; i < nRows(g); i++) {
      const v = g[i][j].row
      if (bestVal === null || rCmp(v, bestVal) > 0) {
        bestVal = v
        best = [i]
      } else if (rCmp(v, bestVal) === 0) {
        best.push(i)
      }
    }
    out.push(best)
  }
  return out
}

// For each row i, the set of column indices that maximize COL's payoff.
export function colBestResponses(g: Game): number[][] {
  const out: number[][] = []
  for (let i = 0; i < nRows(g); i++) {
    let best: number[] = []
    let bestVal: Rational | null = null
    for (let j = 0; j < nCols(g); j++) {
      const v = g[i][j].col
      if (bestVal === null || rCmp(v, bestVal) > 0) {
        bestVal = v
        best = [j]
      } else if (rCmp(v, bestVal) === 0) {
        best.push(j)
      }
    }
    out.push(best)
  }
  return out
}

// Pure-strategy Nash equilibria: cells that are mutual best responses. Sorted (row, then col).
export function pureNashEquilibria(g: Game): { row: number; col: number }[] {
  const rbr = rowBestResponses(g) // rbr[j] = best rows vs col j
  const cbr = colBestResponses(g) // cbr[i] = best cols vs row i
  const out: { row: number; col: number }[] = []
  for (let i = 0; i < nRows(g); i++) {
    for (let j = 0; j < nCols(g); j++) {
      if (rbr[j].includes(i) && cbr[i].includes(j)) out.push({ row: i, col: j })
    }
  }
  return out
}

// Rows strictly dominated by another (pure) row over the given surviving columns.
function dominatedRowsAmong(g: Game, rows: number[], cols: number[]): number[] {
  const dominated: number[] = []
  for (const i of rows) {
    for (const i2 of rows) {
      if (i2 === i) continue
      // i2 strictly dominates i iff payoff(i2) > payoff(i) for ALL surviving cols.
      let strictlyBetter = true
      for (const j of cols) {
        if (rCmp(g[i2][j].row, g[i][j].row) <= 0) {
          strictlyBetter = false
          break
        }
      }
      if (strictlyBetter) {
        dominated.push(i)
        break
      }
    }
  }
  return dominated
}

function dominatedColsAmong(g: Game, rows: number[], cols: number[]): number[] {
  const dominated: number[] = []
  for (const j of cols) {
    for (const j2 of cols) {
      if (j2 === j) continue
      let strictlyBetter = true
      for (const i of rows) {
        if (rCmp(g[i][j2].col, g[i][j].col) <= 0) {
          strictlyBetter = false
          break
        }
      }
      if (strictlyBetter) {
        dominated.push(j)
        break
      }
    }
  }
  return dominated
}

// Strictly dominated rows / cols of the full game (by a pure strategy).
export function strictlyDominatedRows(g: Game): number[] {
  const rows = g.map((_, i) => i)
  const cols = g[0].map((_, j) => j)
  return dominatedRowsAmong(g, rows, cols)
}
export function strictlyDominatedCols(g: Game): number[] {
  const rows = g.map((_, i) => i)
  const cols = g[0].map((_, j) => j)
  return dominatedColsAmong(g, rows, cols)
}

// Iterated elimination of strictly dominated strategies → SURVIVING indices.
export function iteratedElimination(g: Game): { rows: number[]; cols: number[] } {
  let rows = g.map((_, i) => i)
  let cols = g[0].map((_, j) => j)
  for (;;) {
    const dr = dominatedRowsAmong(g, rows, cols)
    const dc = dominatedColsAmong(g, rows, cols)
    if (dr.length === 0 && dc.length === 0) break
    rows = rows.filter((i) => !dr.includes(i))
    cols = cols.filter((j) => !dc.includes(j))
    if (rows.length <= 1 && cols.length <= 1) break
  }
  return { rows, cols }
}

// Unique surviving cell after IESDS, or null if more than one strategy survives for either player.
export function iesdsSolution(g: Game): { row: number; col: number } | null {
  const { rows, cols } = iteratedElimination(g)
  if (rows.length === 1 && cols.length === 1) return { row: rows[0], col: cols[0] }
  return null
}

// ── zero-sum games (M[i][j] = ROW's payoff; COL's = −that) ────────────────────
// A saddle point: an entry that is the minimum of its row AND the maximum of its
// column (a pure-strategy value). Returns null when none exists (must randomize).
export function saddlePoint(
  M: Rational[][],
): { row: number; col: number; value: Rational } | null {
  for (let i = 0; i < M.length; i++) {
    for (let j = 0; j < M[i].length; j++) {
      const v = M[i][j]
      let isRowMin = true
      for (let jj = 0; jj < M[i].length; jj++) {
        if (rCmp(M[i][jj], v) < 0) {
          isRowMin = false
          break
        }
      }
      if (!isRowMin) continue
      let isColMax = true
      for (let ii = 0; ii < M.length; ii++) {
        if (rCmp(M[ii][j], v) > 0) {
          isColMax = false
          break
        }
      }
      if (isColMax) return { row: i, col: j, value: v }
    }
  }
  return null
}

// Mixed value of a 2×2 zero-sum game with NO saddle point:
//   v = (ad − bc)/Δ,  p = Prob(row plays row 0) = (d − c)/Δ,
//   q = Prob(col plays col 0) = (d − b)/Δ,  with Δ = a + d − b − c.
export function mixedValue2x2(M: Rational[][]): {
  value: Rational
  p: Rational
  q: Rational
} {
  const [a, b] = M[0]
  const [c, d] = M[1]
  const delta = rSub(rSub(rAdd(a, d), b), c)
  if (delta.n === 0) throw new Error('gameTheory.mixedValue2x2: Δ = 0 (degenerate / has a saddle)')
  const value = rDiv(rSub(rMul(a, d), rMul(b, c)), delta)
  const p = rDiv(rSub(d, c), delta)
  const q = rDiv(rSub(d, b), delta)
  return { value, p, q }
}

// Fully-mixed Nash equilibrium of a general-sum 2×2 game (the indifference mix).
//   p = Prob(row 0) makes COL indifferent; q = Prob(col 0) makes ROW indifferent.
export function mixedNash2x2(g: Game): { p: Rational; q: Rational } | null {
  const c00 = g[0][0].col
  const c01 = g[0][1].col
  const c10 = g[1][0].col
  const c11 = g[1][1].col
  const denomP = rSub(rAdd(rSub(c00, c10), c11), c01) // c00 − c10 − c01 + c11
  const r00 = g[0][0].row
  const r01 = g[0][1].row
  const r10 = g[1][0].row
  const r11 = g[1][1].row
  const denomQ = rSub(rAdd(rSub(r00, r01), r11), r10) // r00 − r01 − r10 + r11
  if (denomP.n === 0 || denomQ.n === 0) return null
  const p = rDiv(rSub(c11, c10), denomP)
  const q = rDiv(rSub(r11, r01), denomQ)
  return { p, q }
}

// ── sequential / extensive-form games (backward induction) ────────────────────
export type GameTreeNode =
  | { kind: 'leaf'; label?: string; payoff: Rational[] }
  | {
      kind: 'decision'
      player: number
      label?: string
      moves: { label: string; child: GameTreeNode }[]
    }

// Subgame-perfect equilibrium by backward induction: each decision node picks the
// move maximizing THAT node's player's payoff (ties → the first listed move).
export function backwardInduction(root: GameTreeNode): {
  payoff: Rational[]
  path: string[]
} {
  if (root.kind === 'leaf') return { payoff: root.payoff, path: [] }
  let bestMove: { label: string; child: GameTreeNode } | null = null
  let bestResult: { payoff: Rational[]; path: string[] } | null = null
  for (const move of root.moves) {
    const result = backwardInduction(move.child)
    if (
      bestResult === null ||
      rCmp(result.payoff[root.player], bestResult.payoff[root.player]) > 0
    ) {
      bestMove = move
      bestResult = result
    }
  }
  if (!bestMove || !bestResult) throw new Error('gameTheory.backwardInduction: decision node has no moves')
  return { payoff: bestResult.payoff, path: [bestMove.label, ...bestResult.path] }
}

// ── pirate game ("Screwy pirates", Green Book Ch.2 p.3) ───────────────────────
// nPirates rational/greedy/survival-first; a proposal passes with ≥50% of votes
// (the proposer breaks ties); an INDIFFERENT pirate votes NO (so a vote must be
// bought with a strictly positive coin). Returns the senior→junior allocation.
export function pirateGame(nPirates: number, coins: number): number[] {
  if (!Number.isInteger(nPirates) || nPirates < 0) {
    throw new Error(`pirateGame: nPirates must be a non-negative integer, got ${nPirates}`)
  }
  if (nPirates === 0) return []
  if (nPirates === 1) return [coins]
  const fallback = pirateGame(nPirates - 1, coins) // pirates 2..n if this proposal fails
  const votesNeeded = Math.ceil(nPirates / 2) - 1 // yes-votes to buy beyond the proposer's own
  // Each other pirate (current index i = 1..n−1) would get fallback[i−1] if this fails;
  // buying their vote costs fallback[i−1] + 1. Bribe the cheapest votesNeeded of them.
  const others = []
  for (let i = 1; i < nPirates; i++) others.push({ idx: i, cost: fallback[i - 1] + 1 })
  others.sort((x, y) => x.cost - y.cost || x.idx - y.idx)
  const alloc = new Array(nPirates).fill(0)
  let spent = 0
  for (let v = 0; v < votesNeeded && v < others.length; v++) {
    alloc[others[v].idx] = others[v].cost
    spent += others[v].cost
  }
  alloc[0] = coins - spent
  return alloc
}

// Tiger & sheep (Green Book Ch.2 p.4): a tiger that eats the sheep becomes the
// sheep. By backward-induction parity the sheep is eaten iff the tiger count is ODD.
export function tigerSheepEaten(nTigers: number): boolean {
  if (!Number.isInteger(nTigers) || nTigers < 0) {
    throw new Error(`tigerSheepEaten: nTigers must be a non-negative integer, got ${nTigers}`)
  }
  return nTigers % 2 === 1
}

// ── impartial combinatorial games (Nim & subtraction) ─────────────────────────
// nim-sum = XOR of heap sizes. First (moving) player wins iff nim-sum ≠ 0.
export function nimSum(heaps: number[]): number {
  return heaps.reduce((acc, h) => acc ^ h, 0)
}
export function nimIsWinning(heaps: number[]): boolean {
  return nimSum(heaps) !== 0
}
// All winning moves (reduce some heap h to h⊕X < h, making the nim-sum 0).
export function nimWinningMoves(heaps: number[]): { heap: number; removeTo: number }[] {
  const x = nimSum(heaps)
  if (x === 0) return []
  const moves: { heap: number; removeTo: number }[] = []
  for (let i = 0; i < heaps.length; i++) {
    const target = heaps[i] ^ x
    if (target < heaps[i]) moves.push({ heap: i, removeTo: target })
  }
  return moves
}

// Subtraction game (pile of n, remove 1..k each turn, last to take WINS — normal
// play). P-positions (mover loses) are exactly the multiples of (k+1).
export function subtractionIsWinning(n: number, k: number): boolean {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 1 || n < 0) {
    throw new Error(`subtractionIsWinning: need n≥0, k≥1, got n=${n}, k=${k}`)
  }
  return n % (k + 1) !== 0
}
// The winning move (tokens to remove) = n mod (k+1); null when on a P-position.
export function subtractionWinningMove(n: number, k: number): number | null {
  const r = n % (k + 1)
  return r === 0 ? null : r
}
