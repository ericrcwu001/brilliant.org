// Pure, dependency-free, EXACT-RATIONAL (plain Number) engine for the
// Covariance & Correlation concept (lesson-covariance-1..6). No floats on any
// graded path; ratToNumber is display-only. Mirrors the exact-rational style of
// src/engine/optimalStopping.ts and src/engine/expectation.ts.
//
// PLAIN-NUMBER RATIONAL DECISION: this engine uses Rational = {n:number;d:number}
// (consistent with src/engine/types.ts), NOT BigInt. Justification by worst-case
// intermediate analysis:
//
//   • rhoSquared path (die example): cov={35,12}, varX·varY={1225,72}.
//     Intermediate numerator before reduction = 1225*72 = 88,200; denominator =
//     144*1225 = 176,400. Both tiny vs MAX_SAFE_INTEGER ≈ 9e15. ✓
//
//   • psdDeterminant3 with r12=r13=4/5, r23=1: terms have d ≤ 25; the LCM path
//     through 6 ratAdd/ratMul calls keeps every intermediate denominator ≤ 25^3
//     = 15,625 and every numerator < 10,000. ✓
//
//   • corrRange (4/5,4/5): 1−16/25 = {9,25}; cross-products through sqrt-checks
//     use only the reduced p/q with p,q ≤ 25. ✓
//
//   • General n=10 case: largest pmf has d=10 for probabilities, outcomes ≤ 10.
//     After ratMul chains: intermediate products of denominators ≈ 10^2=100,
//     numerators ≈ 100. Well under 1e15. The spec's stated worst-case ≈1e9 is a
//     conservative upper bound and remains <<9e15. ✓
//
//   Conclusion: every intermediate provably stays well under ~1e14. The BigInt
//   bridge would be unnecessary and would break the fixture/validate-fixtures
//   consumers (which speak plain-number Rational). Plain Number chosen.

// ─── Types ───────────────────────────────────────────────────────────────────

// Consistent with src/engine/types.ts Rational = { n: number; d: number }.
export type Rational = { n: number; d: number }

// Probability mass function: P(X=x) for one variable.
export type Pmf = { x: Rational; p: Rational }[]

// One cell of a joint distribution: P(X=x, Y=y).
export type JointCell = { x: Rational; y: Rational; p: Rational }

// ρ is rational only when Cov/√(VarX·VarY) simplifies exactly.
export type RhoResult =
  | { kind: 'rational'; rho: Rational; rhoSquared: Rational }
  | { kind: 'irrational'; rhoSquared: Rational; display: string }

// ─── Arithmetic kernel ────────────────────────────────────────────────────────

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a || 1
}

// Reduce to lowest terms; denominator always positive.
export function reduce(n: number, d: number): Rational {
  if (d === 0) throw new Error('reduce: denominator must be non-zero')
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d)
  return { n: n / g, d: d / g }
}

export const ratAdd = (a: Rational, b: Rational): Rational =>
  reduce(a.n * b.d + b.n * a.d, a.d * b.d)

export const ratSub = (a: Rational, b: Rational): Rational =>
  reduce(a.n * b.d - b.n * a.d, a.d * b.d)

export const ratMul = (a: Rational, b: Rational): Rational =>
  reduce(a.n * b.n, a.d * b.d)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ZERO: Rational = { n: 0, d: 1 }
const ONE: Rational = { n: 1, d: 1 }

// Σ (p·x) over a pmf.
function weightedSum(pmf: { x: Rational; p: Rational }[]): Rational {
  return pmf.reduce<Rational>((acc, { x, p }) => ratAdd(acc, ratMul(p, x)), ZERO)
}

// Is a non-negative integer a perfect square? Returns the root if so, else null.
function intSqrt(n: number): number | null {
  if (n < 0) return null
  if (n === 0) return 0
  const r = Math.round(Math.sqrt(n))
  // Check r-1, r, r+1 to guard against float rounding.
  for (const c of [r - 1, r, r + 1]) {
    if (c >= 0 && c * c === n) return c
  }
  return null
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * E[X²] = Σ p·x².
 */
export function expectedValueX2(pmf: Pmf): Rational {
  return pmf.reduce<Rational>(
    (acc, { x, p }) => ratAdd(acc, ratMul(p, ratMul(x, x))),
    ZERO,
  )
}

/**
 * Var(X) = E[X²] − (E[X])².
 */
export function variance(pmf: Pmf): Rational {
  const ex = weightedSum(pmf)
  const ex2 = expectedValueX2(pmf)
  return ratSub(ex2, ratMul(ex, ex))
}

/**
 * E[XY] = Σ p·x·y over the joint distribution.
 */
export function expectedProduct(joint: JointCell[]): Rational {
  return joint.reduce<Rational>(
    (acc, { x, y, p }) => ratAdd(acc, ratMul(p, ratMul(x, y))),
    ZERO,
  )
}

/**
 * Cov(X,Y) = E[XY] − E[X]·E[Y]. E[X] and E[Y] are derived from the marginals
 * of the joint distribution.
 */
export function covariance(joint: JointCell[]): Rational {
  const exy = expectedProduct(joint)

  // Marginal means derived from the joint cells.
  const ex = joint.reduce<Rational>(
    (acc, { x, p }) => ratAdd(acc, ratMul(p, x)),
    ZERO,
  )
  const ey = joint.reduce<Rational>(
    (acc, { y, p }) => ratAdd(acc, ratMul(p, y)),
    ZERO,
  )

  return ratSub(exy, ratMul(ex, ey))
}

/**
 * Cov(1_A, 1_B) = P(A∩B) − P(A)·P(B).
 */
export function covarianceIndicators(
  pAB: Rational,
  pA: Rational,
  pB: Rational,
): Rational {
  return ratSub(pAB, ratMul(pA, pB))
}

/**
 * Var(X+Y) = Var(X) + Var(Y) + 2·Cov(X,Y).
 */
export function varianceOfSum(
  varX: Rational,
  varY: Rational,
  cov: Rational,
): Rational {
  return ratAdd(ratAdd(varX, varY), ratMul({ n: 2, d: 1 }, cov))
}

/**
 * Cov(X, X+Y) = Var(X) + Cov(X,Y) — by bilinearity.
 */
export function covBilinear(varX: Rational, covXY: Rational): Rational {
  return ratAdd(varX, covXY)
}

/**
 * ρ² = Cov² / (Var(X)·Var(Y)) — always rational.
 */
export function rhoSquared(
  cov: Rational,
  varX: Rational,
  varY: Rational,
): Rational {
  const cov2 = ratMul(cov, cov)
  const varProd = ratMul(varX, varY)
  // cov2 / varProd = (cov2.n * varProd.d) / (cov2.d * varProd.n)
  return reduce(cov2.n * varProd.d, cov2.d * varProd.n)
}

/**
 * ρ = Cov / √(Var(X)·Var(Y)).
 *
 * Returns {kind:'rational', rho, rhoSquared} when √(VarX·VarY) is exact
 * (i.e., the reduced numerator and denominator of VarX·VarY are both perfect
 * squares). Otherwise returns {kind:'irrational', rhoSquared, display} with a
 * human-readable string like "1/√2" — NO float .rho field is ever produced.
 */
export function rho(
  cov: Rational,
  varX: Rational,
  varY: Rational,
): RhoResult {
  const rhoSq = rhoSquared(cov, varX, varY)

  // Check whether VarX·VarY has a rational square root by testing whether its
  // fully-reduced numerator and denominator are each perfect squares.
  const varProd = ratMul(varX, varY) // already reduced by ratMul→reduce

  const sqrtNum = intSqrt(varProd.n)
  const sqrtDen = intSqrt(varProd.d)

  if (sqrtNum !== null && sqrtDen !== null) {
    // √(VarX·VarY) = sqrtNum/sqrtDen (exact rational).
    // ρ = Cov / (sqrtNum/sqrtDen) = Cov·sqrtDen/sqrtNum
    const rhoVal = reduce(cov.n * sqrtDen, cov.d * sqrtNum)
    return { kind: 'rational', rho: rhoVal, rhoSquared: rhoSq }
  }

  // Irrational case — build a display string.
  // rhoSq = p/q (reduced). ρ = sign(cov) · √(p/q).
  // Display as "sign √(p/q)", simplified to e.g. "1/√2" when p=1.
  const sign = cov.n < 0 ? '-' : cov.n === 0 ? '' : ''
  let display: string
  if (rhoSq.d === 1) {
    // ρ = sign·√p — integer under the radical (p not a perfect square).
    display = `${sign}√${rhoSq.n}`
  } else if (rhoSq.n === 1) {
    // ρ = sign·1/√d  e.g. rhoSq=1/2 → "1/√2".
    display = `${sign}1/√${rhoSq.d}`
  } else {
    // General: sign·√(p/q).
    display = `${sign}√(${rhoSq.n}/${rhoSq.d})`
  }

  return { kind: 'irrational', rhoSquared: rhoSq, display }
}

/**
 * The range of admissible ρ(X,Z) given ρ(X,Y)=ρ1 and ρ(Y,Z)=ρ2:
 *   ρ ∈ [ρ1·ρ2 − √(1−ρ1²)·√(1−ρ2²), ρ1·ρ2 + √(1−ρ1²)·√(1−ρ2²)].
 *
 * Returns exact rationals ONLY when (1−ρ1²) and (1−ρ2²) are both
 * perfect-square rationals (Pythagorean-pair inputs). Throws otherwise.
 */
export function corrRange(
  rho1: Rational,
  rho2: Rational,
): { min: Rational; max: Rational } {
  // 1 − ρ1²
  const one_m_r1sq = ratSub(ONE, ratMul(rho1, rho1))
  // 1 − ρ2²
  const one_m_r2sq = ratSub(ONE, ratMul(rho2, rho2))

  // Each must be a perfect-square rational for an exact result.
  const s1n = intSqrt(one_m_r1sq.n)
  const s1d = intSqrt(one_m_r1sq.d)
  const s2n = intSqrt(one_m_r2sq.n)
  const s2d = intSqrt(one_m_r2sq.d)

  if (s1n === null || s1d === null || s2n === null || s2d === null) {
    throw new Error(
      `corrRange: √(1−ρ₁²) or √(1−ρ₂²) is irrational for inputs ` +
        `ρ1=${rho1.n}/${rho1.d}, ρ2=${rho2.n}/${rho2.d}. ` +
        `Only Pythagorean-pair inputs are supported.`,
    )
  }

  // √(1−ρ1²) = s1n/s1d, √(1−ρ2²) = s2n/s2d.
  const sqrt1: Rational = reduce(s1n, s1d)
  const sqrt2: Rational = reduce(s2n, s2d)

  // The spread: √(1−ρ1²)·√(1−ρ2²).
  const spread = ratMul(sqrt1, sqrt2)

  // The centre: ρ1·ρ2.
  const centre = ratMul(rho1, rho2)

  return {
    min: ratSub(centre, spread),
    max: ratAdd(centre, spread),
  }
}

/**
 * Determinant of the 3×3 correlation matrix [[1,r12,r13],[r12,1,r23],[r13,r23,1]]:
 *   1 + 2·r12·r13·r23 − r12² − r13² − r23².
 * Must equal 0 at the corrRange bounds for the PSD boundary condition.
 */
export function psdDeterminant3(
  r12: Rational,
  r13: Rational,
  r23: Rational,
): Rational {
  const r12sq = ratMul(r12, r12)
  const r13sq = ratMul(r13, r13)
  const r23sq = ratMul(r23, r23)
  const cross = ratMul(ratMul(r12, r13), r23)
  const two_cross = ratMul({ n: 2, d: 1 }, cross)
  // 1 + 2·r12·r13·r23 − r12² − r13² − r23²
  let det = ratAdd(ONE, two_cross)
  det = ratSub(det, r12sq)
  det = ratSub(det, r13sq)
  det = ratSub(det, r23sq)
  return det
}

/**
 * The minimum admissible equicorrelation for an n-asset portfolio:
 *   −1/(n−1).
 */
export function equicorrelationMin(n: number): Rational {
  if (!Number.isInteger(n) || n < 2) {
    throw new Error(`equicorrelationMin: n must be an integer ≥ 2, got ${n}`)
  }
  return reduce(-1, n - 1)
}

/**
 * The minimum-variance hedge ratio β = Cov(A,B) / Var(B).
 */
export function optimalHedgeRatio(covAB: Rational, varB: Rational): Rational {
  // covAB / varB = (covAB.n * varB.d) / (covAB.d * varB.n)
  return reduce(covAB.n * varB.d, covAB.d * varB.n)
}

/**
 * Closed-form order-statistic result for the two IID U(0,1) min/max:
 *   Cov(min,max) = 1/36, Var(min) = Var(max) = 1/18,
 *   ρ(min,max) = (1/36) / (1/18) = 1/2.
 *
 * (All values are exact from the U(0,1) order-stat distribution moments.)
 */
export function orderStatCovUniform(): { cov: Rational; rho: Rational } {
  return { cov: { n: 1, d: 36 }, rho: { n: 1, d: 2 } }
}

/**
 * "n" for integers, "n/d" for fractions. Sign on numerator.
 */
export function formatRational(r: Rational): string {
  const { n, d } = reduce(r.n, r.d)
  return d === 1 ? String(n) : `${n}/${d}`
}

/**
 * "<min>,<max>" via formatRational.
 */
export function formatRangePair(range: { min: Rational; max: Rational }): string {
  return `${formatRational(range.min)},${formatRational(range.max)}`
}

/**
 * Display-only decimal approximation. NEVER used on a graded path.
 */
export function ratToNumber(r: Rational): number {
  return r.n / r.d
}
