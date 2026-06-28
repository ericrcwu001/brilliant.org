// Pure, dependency-free, EXACT-RATIONAL (BigInt — NO floats on any graded path)
// options-pricing engine for course-options (lesson-options-1..6). BigRational
// discipline mirrors optimalStopping.ts: denominator normalised positive, reduce
// throws on d=0. Goldens are cross-checked in options.test.ts and
// validate-fixtures.ts. blackScholesCall and continuousGreek are display-only —
// the only places floats may appear; they are fenced below with a clear comment.

import { nCk } from './combinatorics'

// ── Types ─────────────────────────────────────────────────────────────────────

export type BigRational = { n: bigint; d: bigint }
export type Kind = 'call' | 'put'
export type Leg = {
  kind: 'call' | 'put' | 'stock' | 'bond'
  K?: BigRational
  qty: BigRational
}

// ── Arithmetic kernel (mirrors optimalStopping.ts) ────────────────────────────

function bgcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b
  while (y) {
    ;[x, y] = [y, x % y]
  }
  return x || 1n
}

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

const ZERO: BigRational = { n: 0n, d: 1n }
const ONE: BigRational = { n: 1n, d: 1n }

const ratAdd = (a: BigRational, b: BigRational): BigRational =>
  reduce(a.n * b.d + b.n * a.d, a.d * b.d)

const ratSub = (a: BigRational, b: BigRational): BigRational =>
  reduce(a.n * b.d - b.n * a.d, a.d * b.d)

const ratMul = (a: BigRational, b: BigRational): BigRational =>
  reduce(a.n * b.n, a.d * b.d)

const ratDiv = (a: BigRational, b: BigRational): BigRational =>
  reduce(a.n * b.d, a.d * b.n)

const ratGe = (a: BigRational, b: BigRational): boolean =>
  a.n * b.d >= b.n * a.d

const ratMax = (a: BigRational, b: BigRational): BigRational =>
  ratGe(a, b) ? a : b

function ratPow(base: BigRational, exp: number): BigRational {
  let result = ONE
  for (let i = 0; i < exp; i++) result = ratMul(result, base)
  return result
}

// ── Bridge with fixture plain-number rational ─────────────────────────────────

export function toBig(r: { n: number; d: number }): BigRational {
  return reduce(BigInt(r.n), BigInt(r.d))
}

export function fromBig(r: BigRational): { n: number; d: number } {
  return { n: Number(r.n), d: Number(r.d) }
}

// "n" if d===1n else "n/d" (reduced, sign on numerator).
export function formatRational(r: BigRational): string {
  const { n, d } = reduce(r.n, r.d)
  return d === 1n ? String(n) : `${n}/${d}`
}

// Display-only decimal approximation. NEVER used on a graded path.
export function ratToNumber(r: BigRational): number {
  return Number(r.n) / Number(r.d)
}

// ── L1 — Payoffs ──────────────────────────────────────────────────────────────

export function callPayoff(ST: BigRational, K: BigRational): BigRational {
  return ratMax(ratSub(ST, K), ZERO)
}

export function putPayoff(ST: BigRational, K: BigRational): BigRational {
  return ratMax(ratSub(K, ST), ZERO)
}

export function legPayoff(leg: Leg, ST: BigRational): BigRational {
  switch (leg.kind) {
    case 'call':
      return callPayoff(ST, leg.K!)
    case 'put':
      return putPayoff(ST, leg.K!)
    case 'stock':
      return ST
    case 'bond':
      return leg.K ?? ONE
  }
}

export function spreadPayoff(legs: Leg[], ST: BigRational): BigRational {
  return legs.reduce<BigRational>(
    (acc, leg) => ratAdd(acc, ratMul(leg.qty, legPayoff(leg, ST))),
    ZERO,
  )
}

// ── L2 — Put-call parity & no-arb bounds ─────────────────────────────────────

// (C−P) − (S − K·D)
export function parityGap(
  C: BigRational,
  P: BigRational,
  S: BigRational,
  K: BigRational,
  D: BigRational,
): BigRational {
  return ratSub(ratSub(C, P), ratSub(S, ratMul(K, D)))
}

// Solve for the one missing leg of C−P = S−K·D.
export function paritySolve(
  known: Partial<{
    C: BigRational
    P: BigRational
    S: BigRational
    K: BigRational
    D: BigRational
  }>,
): BigRational {
  const { C, P, S, K, D } = known
  if (C === undefined) return ratAdd(P!, ratSub(S!, ratMul(K!, D!)))
  if (P === undefined) return ratSub(ratAdd(C, ratMul(K!, D!)), S!)
  if (S === undefined) return ratAdd(ratSub(C, P), ratMul(K!, D!))
  if (K === undefined) return ratDiv(ratSub(S, ratSub(C, P)), D!)
  // D missing
  return ratDiv(ratSub(S, ratSub(C, P)), K)
}

// Conversion/reversal arb when C−P ≠ S−K·D; profitToday = |parityGap|.
export function parityArbLeg(
  C: BigRational,
  P: BigRational,
  S: BigRational,
  K: BigRational,
  D: BigRational,
): { trade: Leg[]; profitToday: BigRational } {
  const gap = parityGap(C, P, S, K, D)
  const profitToday: BigRational =
    gap.n < 0n ? reduce(-gap.n, gap.d) : { n: gap.n, d: gap.d }
  // gap>0: sell call, buy put, buy stock, short bond (conversion)
  // gap<0: buy call, sell put, sell stock, buy bond (reversal)
  const sign = gap.n >= 0n ? 1n : -1n
  const trade: Leg[] = [
    { kind: 'call', qty: reduce(-sign, 1n) },
    { kind: 'put', qty: reduce(sign, 1n) },
    { kind: 'stock', qty: reduce(sign, 1n) },
    { kind: 'bond', K, qty: reduce(-sign, 1n) },
  ]
  return { trade, profitToday }
}

// lo=max(S−K·D,0), hi=S
export function callBounds(
  S: BigRational,
  K: BigRational,
  D: BigRational,
): { lo: BigRational; hi: BigRational } {
  return { lo: ratMax(ratSub(S, ratMul(K, D)), ZERO), hi: S }
}

// lo=max(K·D−S,0), hi=K·D
export function putBounds(
  S: BigRational,
  K: BigRational,
  D: BigRational,
): { lo: BigRational; hi: BigRational } {
  const KD = ratMul(K, D)
  return { lo: ratMax(ratSub(KD, S), ZERO), hi: KD }
}

// ── L4 — One-step binomial ────────────────────────────────────────────────────

// Risk-neutral probability: (R−d)/(u−d).
export function riskNeutralQ(
  u: BigRational,
  d: BigRational,
  R: BigRational,
): BigRational {
  return ratDiv(ratSub(R, d), ratSub(u, d))
}

// (1/Rⁿ)·Σ_k C(n,k) q^k (1−q)^(n−k) · payoff(S·u^k·d^(n−k)).
export function binomialPrice(
  S: BigRational,
  u: BigRational,
  d: BigRational,
  R: BigRational,
  K: BigRational,
  n: number,
  kind: Kind,
): BigRational {
  const q = riskNeutralQ(u, d, R)
  const q1 = ratSub(ONE, q)
  let sum = ZERO
  for (let k = 0; k <= n; k++) {
    const terminal = ratMul(S, ratMul(ratPow(u, k), ratPow(d, n - k)))
    const payoff = kind === 'call' ? callPayoff(terminal, K) : putPayoff(terminal, K)
    if (payoff.n === 0n) continue
    const c = reduce(nCk(n, k), 1n)
    const term = ratMul(c, ratMul(ratPow(q, k), ratMul(ratPow(q1, n - k), payoff)))
    sum = ratAdd(sum, term)
  }
  return ratDiv(sum, ratPow(R, n))
}

// One-step replication: delta=(V_u−V_d)/(S(u−d)); bond=price−delta·S.
export function replicate(
  S: BigRational,
  u: BigRational,
  d: BigRational,
  R: BigRational,
  K: BigRational,
  kind: Kind,
): { delta: BigRational; bond: BigRational } {
  const Vu = kind === 'call' ? callPayoff(ratMul(S, u), K) : putPayoff(ratMul(S, u), K)
  const Vd = kind === 'call' ? callPayoff(ratMul(S, d), K) : putPayoff(ratMul(S, d), K)
  const delta = ratDiv(ratSub(Vu, Vd), ratMul(S, ratSub(u, d)))
  const price = binomialPrice(S, u, d, R, K, 1, kind)
  const bond = ratSub(price, ratMul(delta, S))
  return { delta, bond }
}

// ── L5 — Multi-step tree ──────────────────────────────────────────────────────

// Ordered highest first: index i → S·u^(n−i)·d^i, i=0..n.
export function treeTerminals(
  S: BigRational,
  u: BigRational,
  d: BigRational,
  n: number,
): BigRational[] {
  const result: BigRational[] = []
  for (let i = 0; i <= n; i++) {
    result.push(ratMul(S, ratMul(ratPow(u, n - i), ratPow(d, i))))
  }
  return result
}

// Aligned with treeTerminals: index i → C(n,n−i)·q^(n−i)·(1−q)^i.
export function treeWeights(q: BigRational, n: number): BigRational[] {
  const q1 = ratSub(ONE, q)
  const result: BigRational[] = []
  for (let i = 0; i <= n; i++) {
    const c = reduce(nCk(n, n - i), 1n)
    result.push(ratMul(c, ratMul(ratPow(q, n - i), ratPow(q1, i))))
  }
  return result
}

export function pathCount(n: number, k: number): bigint {
  return nCk(n, k)
}

// ── L6 — Hedging / portfolio / exotic ────────────────────────────────────────

export function hedgeRatio(cov: BigRational, varB: BigRational): BigRational {
  return ratDiv(cov, varB)
}

export function minVarWeights(
  varA: BigRational,
  varB: BigRational,
  cov: BigRational,
): { wA: BigRational; wB: BigRational; varMin: BigRational } {
  const TWO: BigRational = { n: 2n, d: 1n }
  const denom = ratSub(ratAdd(varA, varB), ratMul(TWO, cov))
  const wA = ratDiv(ratSub(varB, cov), denom)
  const wB = ratSub(ONE, wA)
  const varMin = ratAdd(
    ratAdd(ratMul(ratMul(wA, wA), varA), ratMul(ratMul(wB, wB), varB)),
    ratMul(TWO, ratMul(ratMul(wA, wB), cov)),
  )
  return { wA, wB, varMin }
}

// 1/H (risk-neutral price of a one-touch that pays 1 when the asset hits H).
export function oneTouchPrice(H: BigRational): BigRational {
  return ratDiv(ONE, H)
}

export function greekSign(
  greek: 'delta' | 'gamma' | 'theta' | 'vega' | 'rho',
  kind: Kind,
): -1 | 0 | 1 {
  switch (greek) {
    case 'delta':
      return kind === 'call' ? 1 : -1
    case 'gamma':
      return 1
    case 'vega':
      return 1
    case 'theta':
      return -1
    case 'rho':
      return kind === 'call' ? 1 : -1
  }
}

// ── DISPLAY-ONLY ──────────────────────────────────────────────────────────────
// Floats are allowed ONLY in the functions below. They are NEVER referenced on
// a graded path; graded values stay exact via formatRational / BigRational.

function normalCDF(x: number): number {
  // Abramowitz-Stegun 7.1.26 rational approximation for erf.
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * ax)
  const poly =
    t *
    (0.254829592 +
      t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  const erfVal = 1 - poly * Math.exp(-ax * ax)
  return 0.5 * (1 + sign * erfVal)
}

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

// c = S·N(d1) − K·e^(−rT)·N(d2).
export function blackScholesCall(
  S: number,
  K: number,
  r: number,
  sigma: number,
  T: number,
): number {
  const sqrtT = Math.sqrt(T)
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT)
  const d2 = d1 - sigma * sqrtT
  return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2)
}

export function continuousGreek(
  greek: 'delta' | 'gamma' | 'theta' | 'vega' | 'rho',
  S: number,
  K: number,
  r: number,
  sigma: number,
  T: number,
  kind: Kind,
): number {
  const sqrtT = Math.sqrt(T)
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT)
  const d2 = d1 - sigma * sqrtT
  const Nd1 = normalCDF(d1)
  const Nd2 = normalCDF(d2)
  const nd1 = normalPDF(d1)
  const df = Math.exp(-r * T)
  switch (greek) {
    case 'delta':
      return kind === 'call' ? Nd1 : Nd1 - 1
    case 'gamma':
      return nd1 / (S * sigma * sqrtT)
    case 'theta':
      return kind === 'call'
        ? -(S * nd1 * sigma) / (2 * sqrtT) - r * K * df * Nd2
        : -(S * nd1 * sigma) / (2 * sqrtT) + r * K * df * (1 - Nd2)
    case 'vega':
      return S * nd1 * sqrtT
    case 'rho':
      return kind === 'call' ? K * T * df * Nd2 : -K * T * df * (1 - Nd2)
  }
}
