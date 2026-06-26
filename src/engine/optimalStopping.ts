// Pure, dependency-free, EXACT-RATIONAL (BigInt — NO floats) engine for the
// Optimal Stopping concept (the classic Secretary / Best-Choice / Marriage
// problem). It computes the "look-then-leap" success probabilities, the optimal
// cutoff for each n, and replays a single deterministic run — the verifying
// engine for lesson-optimal-stopping-1..5. Mirrors the BigInt discipline of
// src/engine/combinatorics.ts (exact arithmetic, no Number rounding on any
// graded path; `ratToNumber` is a display-only convenience). Goldens are
// cross-checked in optimalStopping.test.ts and (Stage 2) by validate-fixtures.ts.
//
// Source anchor (Green-Book-style quant-interview canon; the Green Book PDF is
// gitignored and absent in this checkout): the Secretary Problem — Statistics
// LibreTexts §12.9, Wikipedia "Secretary problem", Stanford AMDM lecture 8.
// Success-probability formula (LibreTexts §12.9):
//   p_n(r) = 1/n                           if r = 1
//          = (r−1)/n · Σ_{j=r}^{n} 1/(j−1) if 2 ≤ r ≤ n
// The optimal cutoff r* maximizes p_n(r); as n→∞ both r*/n and p_n(r*) → 1/e.

export type BigRational = { n: bigint; d: bigint }

function bgcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b
  while (y) {
    ;[x, y] = [y, x % y]
  }
  return x || 1n
}

// Reduce a bigint fraction to lowest terms; denominator normalized positive.
export function reduce(n: bigint, d: bigint): BigRational {
  if (d === 0n) throw new Error('reduce: denominator must be non-zero')
  let nn = n
  let dd = d
  if (dd < 0n) {
    nn = -nn
    dd = -dd
  }
  const g = bgcd(nn, dd)
  return { n: nn / g, d: dd / g }
}

const ratAdd = (a: BigRational, b: BigRational): BigRational =>
  reduce(a.n * b.d + b.n * a.d, a.d * b.d)
const ratMul = (a: BigRational, b: BigRational): BigRational =>
  reduce(a.n * b.n, a.d * b.d)

// Strict ordering over BigRationals via cross-multiplication (denominators > 0).
const ratLt = (a: BigRational, b: BigRational): boolean => a.n * b.d < b.n * a.d

function assertCount(n: number, name: string): void {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`${name}: expected a positive integer, got ${n}`)
  }
}

// p_n(r): probability the look-then-leap rule (reject the first r−1 candidates,
// then take the first one better than all seen so far; take the last if none) selects
// the single best of n candidates arriving in uniformly random order.
export function secretarySuccess(n: number, r: number): BigRational {
  assertCount(n, 'secretarySuccess(n)')
  if (!Number.isInteger(r) || r < 1 || r > n) {
    throw new Error(`secretarySuccess: cutoff r must be in 1..${n}, got ${r}`)
  }
  if (r === 1) return reduce(1n, BigInt(n))
  let sum: BigRational = { n: 0n, d: 1n }
  for (let j = r; j <= n; j++) sum = ratAdd(sum, reduce(1n, BigInt(j - 1)))
  return ratMul(reduce(BigInt(r - 1), BigInt(n)), sum)
}

// Every fixed-position / random rule (take-first, take-last, take-a-random-one)
// selects the best with probability exactly 1/n.
export function naiveSuccess(n: number): BigRational {
  assertCount(n, 'naiveSuccess(n)')
  return reduce(1n, BigInt(n))
}

// [p_n(1), p_n(2), …, p_n(n)] — the full success-vs-cutoff curve.
export function successCurve(n: number): BigRational[] {
  assertCount(n, 'successCurve(n)')
  return Array.from({ length: n }, (_, i) => secretarySuccess(n, i + 1))
}

// The optimal cutoff r* (and its success probability) for n candidates: the r
// that maximizes p_n(r). Ties resolve to the smallest r (none occur for n ≥ 3).
export function optimalCutoff(n: number): { r: number; p: BigRational } {
  assertCount(n, 'optimalCutoff(n)')
  const curve = successCurve(n)
  let bestR = 1
  let bestP = curve[0]
  for (let r = 2; r <= n; r++) {
    if (ratLt(bestP, curve[r - 1])) {
      bestP = curve[r - 1]
      bestR = r
    }
  }
  return { r: bestR, p: bestP }
}

// Replay a single deterministic run of the look-then-leap rule. `order[i]` is the
// TRUE rank (1 = the single best) of the candidate arriving at position i
// (0-indexed); it must be a permutation of 1..order.length. The rule observes the
// first `cutoff−1` candidates, then accepts the first one strictly better (lower
// rank) than the best observed; if none, it is forced to take the last candidate.
export function runStrategy(
  order: number[],
  cutoff: number,
): { selectedIndex: number; selectedRank: number; win: boolean } {
  const n = order.length
  assertCount(n, 'runStrategy(order)')
  if (!Number.isInteger(cutoff) || cutoff < 1 || cutoff > n) {
    throw new Error(`runStrategy: cutoff must be in 1..${n}, got ${cutoff}`)
  }
  const sorted = [...order].sort((a, b) => a - b)
  if (sorted.some((v, i) => v !== i + 1)) {
    throw new Error(`runStrategy: order must be a permutation of 1..${n}, got ${order}`)
  }
  // Look phase: observe the first cutoff−1 candidates, track the best (min) rank.
  let bestSeen = Infinity
  for (let i = 0; i < cutoff - 1; i++) bestSeen = Math.min(bestSeen, order[i])
  // Leap phase: accept the first candidate better than everything observed.
  for (let i = cutoff - 1; i < n; i++) {
    if (order[i] < bestSeen) {
      return { selectedIndex: i, selectedRank: order[i], win: order[i] === 1 }
    }
  }
  // Fell through: forced to take the last candidate.
  return { selectedIndex: n - 1, selectedRank: order[n - 1], win: order[n - 1] === 1 }
}

// Reduced "n" (integer) or "n/d" string — the validation/display anchor.
export function formatRational(r: BigRational): string {
  const { n, d } = reduce(r.n, r.d)
  return d === 1n ? String(n) : `${n}/${d}`
}

// Display-only decimal approximation (e.g. for "≈ 37%" captions). NEVER used on a
// graded path — graded values stay exact via formatRational.
export function ratToNumber(r: BigRational): number {
  return Number(r.n) / Number(r.d)
}
