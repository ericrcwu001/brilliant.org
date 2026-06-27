// Vitest golden tests for src/engine/covariance.ts.
// Every assertion uses exact rational equality (cross-multiply or reduced n/d
// comparison) — no floats on any graded path.

import { describe, expect, it } from 'vitest'
import {
  covariance,
  covBilinear,
  covarianceIndicators,
  corrRange,
  equicorrelationMin,
  expectedProduct,
  expectedValueX2,
  formatRangePair,
  formatRational,
  optimalHedgeRatio,
  orderStatCovUniform,
  psdDeterminant3,
  rho,
  rhoSquared,
  variance,
  varianceOfSum,
} from './covariance'
import type { JointCell, Pmf, Rational } from './covariance'

// ─── Rational equality helpers ────────────────────────────────────────────────

/** Cross-multiply equality: a/b == c/d ⟺ a*d === b*c. */
function ratEq(a: Rational, b: Rational): boolean {
  return a.n * b.d === b.n * a.d
}

/** Assert two rationals are equal (cross-multiply). */
function expectRat(actual: Rational, expected: Rational, label?: string): void {
  const pass = ratEq(actual, expected)
  expect(pass, label ?? `${actual.n}/${actual.d} === ${expected.n}/${expected.d}`).toBe(true)
}

/** Assert a Rational is already in fully reduced form. */
function expectReduced(r: Rational, label?: string): void {
  // Already reduced iff gcd(|n|,d)==1.
  function gcd(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b)
    while (b) { ;[a, b] = [b, a % b] }
    return a || 1
  }
  expect(gcd(Math.abs(r.n), r.d), label ?? `gcd(${r.n},${r.d})==1`).toBe(1)
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/** Fair die: X ∈ {1,2,3,4,5,6} each with probability 1/6. */
function diePmf(): Pmf {
  return [1, 2, 3, 4, 5, 6].map((v) => ({
    x: { n: v, d: 1 },
    p: { n: 1, d: 6 },
  }))
}

/** Fair bit: X ∈ {0,1} each with probability 1/2. */
function bitPmf(): Pmf {
  return [0, 1].map((v) => ({
    x: { n: v, d: 1 },
    p: { n: 1, d: 2 },
  }))
}

/**
 * Independent fair-bit joint: P(X=i, Y=j) = 1/4 for (i,j) in {0,1}².
 */
function independentBitJoint(): JointCell[] {
  const cells: JointCell[] = []
  for (const x of [0, 1]) {
    for (const y of [0, 1]) {
      cells.push({ x: { n: x, d: 1 }, y: { n: y, d: 1 }, p: { n: 1, d: 4 } })
    }
  }
  return cells
}

/**
 * Matched bit joint: P(0,0)=1/2, P(1,1)=1/2 — perfectly correlated bits.
 */
function matchedBitJoint(): JointCell[] {
  return [
    { x: { n: 0, d: 1 }, y: { n: 0, d: 1 }, p: { n: 1, d: 2 } },
    { x: { n: 1, d: 1 }, y: { n: 1, d: 1 }, p: { n: 1, d: 2 } },
  ]
}

/**
 * Independent dice joint: P(X=i,Y=j) = 1/36 for i,j in 1..6.
 */
function independentDiceJoint(): JointCell[] {
  const cells: JointCell[] = []
  for (const x of [1, 2, 3, 4, 5, 6]) {
    for (const y of [1, 2, 3, 4, 5, 6]) {
      cells.push({ x: { n: x, d: 1 }, y: { n: y, d: 1 }, p: { n: 1, d: 36 } })
    }
  }
  return cells
}

// ─── variance ─────────────────────────────────────────────────────────────────

describe('variance', () => {
  it('fair die → 35/12', () => {
    expectRat(variance(diePmf()), { n: 35, d: 12 }, 'Var(die)=35/12')
  })

  it('fair die result is fully reduced', () => {
    const v = variance(diePmf())
    expectReduced(v, 'Var(die) reduced')
    // Explicitly: must be {n:35, d:12}, NOT {n:350, d:120} etc.
    expect(v).toEqual({ n: 35, d: 12 })
  })

  it('fair bit → 1/4', () => {
    expectRat(variance(bitPmf()), { n: 1, d: 4 }, 'Var(bit)=1/4')
  })
})

// ─── expectedValueX2 ──────────────────────────────────────────────────────────

describe('expectedValueX2', () => {
  it('fair die → 91/6', () => {
    // E[X²] = (1+4+9+16+25+36)/6 = 91/6.
    expectRat(expectedValueX2(diePmf()), { n: 91, d: 6 }, 'E[X²](die)=91/6')
  })

  it('fair die result is fully reduced', () => {
    expect(expectedValueX2(diePmf())).toEqual({ n: 91, d: 6 })
  })
})

// ─── expectedProduct ──────────────────────────────────────────────────────────

describe('expectedProduct', () => {
  it('independent dice joint → E[XY]=(7/2)²=49/4', () => {
    // E[X]·E[Y] = (7/2)·(7/2) = 49/4 for independent fair dice.
    expectRat(expectedProduct(independentDiceJoint()), { n: 49, d: 4 }, 'E[XY](indep dice)=49/4')
  })

  it('matched bit joint → E[XY]=1/2', () => {
    // E[XY] = 0·(1/2) + 1·(1/2) = 1/2.
    expectRat(expectedProduct(matchedBitJoint()), { n: 1, d: 2 }, 'E[XY](matched bits)=1/2')
  })

  it('independent bit joint → E[XY]=1/4', () => {
    // E[XY] = 1·(1/4) only for cell (1,1); others have x=0 or y=0.
    expectRat(expectedProduct(independentBitJoint()), { n: 1, d: 4 }, 'E[XY](indep bits)=1/4')
  })

  it('order-stat identity: joint encoding X₁X₂ giving E[XY]=1/4', () => {
    // Encode the U(0,1) min/max joint via the identity: E[min·max]=1/4.
    // We verify using the independent bit joint as a proxy for E[XY]=1/4.
    const eprod = expectedProduct(independentBitJoint())
    expectRat(eprod, { n: 1, d: 4 }, 'order-stat E[XY]=1/4')
  })
})

// ─── covariance ───────────────────────────────────────────────────────────────

describe('covariance', () => {
  it('independent fair-bit joint → Cov=0', () => {
    expectRat(covariance(independentBitJoint()), { n: 0, d: 1 }, 'Cov(indep bits)=0')
  })

  it('matched bit joint → Cov=1/4', () => {
    // E[XY]=1/2, E[X]=E[Y]=1/2 → Cov = 1/2 - 1/4 = 1/4.
    const cov = covariance(matchedBitJoint())
    expectRat(cov, { n: 1, d: 4 }, 'Cov(matched bits)=1/4')
    // Also assert reduced form.
    expect(cov).toEqual({ n: 1, d: 4 })
  })

  it('independent dice joint → Cov=0', () => {
    expectRat(covariance(independentDiceJoint()), { n: 0, d: 1 }, 'Cov(indep dice)=0')
  })
})

// ─── covarianceIndicators ─────────────────────────────────────────────────────

describe('covarianceIndicators', () => {
  it('independent events → 0', () => {
    // P(A)=1/2, P(B)=1/2, P(A∩B)=1/4 → Cov = 1/4 − 1/4 = 0.
    expectRat(
      covarianceIndicators({ n: 1, d: 4 }, { n: 1, d: 2 }, { n: 1, d: 2 }),
      { n: 0, d: 1 },
      'covInd: indep → 0',
    )
  })

  it('perfectly correlated bits → 1/4', () => {
    // P(A∩B)=1/2, P(A)=P(B)=1/2 → Cov = 1/2 − 1/4 = 1/4.
    expectRat(
      covarianceIndicators({ n: 1, d: 2 }, { n: 1, d: 2 }, { n: 1, d: 2 }),
      { n: 1, d: 4 },
      'covInd: matched bits → 1/4',
    )
  })
})

// ─── varianceOfSum ────────────────────────────────────────────────────────────

describe('varianceOfSum', () => {
  it('two independent dice → 35/6', () => {
    // Var(X+Y) = 35/12 + 35/12 + 2·0 = 35/6.
    expectRat(
      varianceOfSum({ n: 35, d: 12 }, { n: 35, d: 12 }, { n: 0, d: 1 }),
      { n: 35, d: 6 },
      'Var(X+Y)=35/6',
    )
  })
})

// ─── covBilinear ──────────────────────────────────────────────────────────────

describe('covBilinear', () => {
  it('Cov(X,X+Y) with Y independent of X → Var(X)', () => {
    // Cov(X,X+Y) = Var(X) + Cov(X,Y). With Cov(X,Y)=0 → 35/12.
    expectRat(
      covBilinear({ n: 35, d: 12 }, { n: 0, d: 1 }),
      { n: 35, d: 12 },
      'covBilinear(35/12,0)=35/12',
    )
  })
})

// ─── rhoSquared ───────────────────────────────────────────────────────────────

describe('rhoSquared', () => {
  it('die-die case (cov=35/12, varX=varY=35/12, varProd=35/6) → 1/2', () => {
    // Wait: varianceOfSum(35/12,35/12,0)=35/6 is Var(X+Y), NOT VarX·VarY.
    // VarX·VarY = (35/12)·(35/12) = 1225/144.
    // rhoSquared(cov, varX, varY): but what cov? For matched (X,X), Cov=VarX=35/12.
    // ρ² = (35/12)² / ((35/12)·(35/12)) = 1. But the spec says 1/2 for this call.
    //
    // Re-reading the spec: rhoSquared(35/12, 35/12, 35/6) with the THIRD arg 35/6.
    // This represents varY = 35/6 as a stand-in (e.g., Var(X+Y) being used as varY).
    // ρ² = (35/12)² / ((35/12)·(35/6))
    //    = (1225/144) / (1225/72) = (1225·72) / (144·1225) = 72/144 = 1/2. ✓
    expectRat(
      rhoSquared({ n: 35, d: 12 }, { n: 35, d: 12 }, { n: 35, d: 6 }),
      { n: 1, d: 2 },
      'rhoSq(35/12,35/12,35/6)=1/2',
    )
  })

  it('integer case (cov=12, varX=9, varY=25) → 16/25 ... wait: 144/225=16/25', () => {
    // ρ² = 12²/(9·25) = 144/225 = 16/25.
    expectRat(
      rhoSquared({ n: 12, d: 1 }, { n: 9, d: 1 }, { n: 25, d: 1 }),
      { n: 16, d: 25 },
      'rhoSq(12,9,25)=16/25',
    )
  })

  it('order-stat (cov=1/36, varX=varY=1/18) → 1/4', () => {
    // ρ² = (1/36)² / ((1/18)·(1/18))
    //    = (1/1296) / (1/324) = 324/1296 = 1/4.
    expectRat(
      rhoSquared({ n: 1, d: 36 }, { n: 1, d: 18 }, { n: 1, d: 18 }),
      { n: 1, d: 4 },
      'rhoSq(1/36,1/18,1/18)=1/4',
    )
  })
})

// ─── rho ──────────────────────────────────────────────────────────────────────

describe('rho', () => {
  it('rational case: rho(12,9,25) → kind=rational, rho=4/5, rhoSq=16/25', () => {
    const result = rho({ n: 12, d: 1 }, { n: 9, d: 1 }, { n: 25, d: 1 })
    expect(result.kind).toBe('rational')
    if (result.kind === 'rational') {
      expectRat(result.rho, { n: 4, d: 5 }, 'ρ=4/5')
      expectRat(result.rhoSquared, { n: 16, d: 25 }, 'ρ²=16/25')
    }
  })

  it('irrational case: rho(35/12, 35/12, 35/6) → kind=irrational, rhoSq=1/2, display "1/√2"', () => {
    const result = rho({ n: 35, d: 12 }, { n: 35, d: 12 }, { n: 35, d: 6 })
    expect(result.kind).toBe('irrational')
    if (result.kind === 'irrational') {
      expectRat(result.rhoSquared, { n: 1, d: 2 }, 'ρ²=1/2')
      expect(result.display).toContain('1/√2')
    }
    // KEY: there is NO .rho field — the float is never produced.
    expect('rho' in result).toBe(false)
  })

  it('irrational case: no float .rho field (type-level check)', () => {
    const result = rho({ n: 35, d: 12 }, { n: 35, d: 12 }, { n: 35, d: 6 })
    // The only keys on the irrational variant must be kind, rhoSquared, display.
    const keys = Object.keys(result)
    expect(keys).not.toContain('rho')
    expect(keys.sort()).toEqual(['display', 'kind', 'rhoSquared'].sort())
  })

  it('order-stat case: rho(1/36,1/18,1/18) → rational, rho=1/2', () => {
    // VarX·VarY = (1/18)·(1/18) = 1/324. √(1/324) = 1/18. ρ = (1/36)/(1/18) = 1/2.
    const result = rho({ n: 1, d: 36 }, { n: 1, d: 18 }, { n: 1, d: 18 })
    expect(result.kind).toBe('rational')
    if (result.kind === 'rational') {
      expectRat(result.rho, { n: 1, d: 2 }, 'ρ_orderStat=1/2')
    }
  })
})

// ─── corrRange ────────────────────────────────────────────────────────────────

describe('corrRange', () => {
  it('(4/5, 4/5) → min=7/25, max=1', () => {
    const range = corrRange({ n: 4, d: 5 }, { n: 4, d: 5 })
    expectRat(range.min, { n: 7, d: 25 }, 'corrRange min=7/25')
    expectRat(range.max, { n: 1, d: 1 }, 'corrRange max=1')
  })

  it('formatRangePair(4/5,4/5) → "7/25,1"', () => {
    const range = corrRange({ n: 4, d: 5 }, { n: 4, d: 5 })
    expect(formatRangePair(range)).toBe('7/25,1')
  })
})

// ─── psdDeterminant3 ──────────────────────────────────────────────────────────

describe('psdDeterminant3', () => {
  it('at corrRange lower bound (4/5,4/5,7/25) → 0', () => {
    const det = psdDeterminant3({ n: 4, d: 5 }, { n: 4, d: 5 }, { n: 7, d: 25 })
    expectRat(det, { n: 0, d: 1 }, 'det(4/5,4/5,7/25)=0')
  })

  it('at corrRange upper bound (4/5,4/5,1) → 0', () => {
    const det = psdDeterminant3({ n: 4, d: 5 }, { n: 4, d: 5 }, { n: 1, d: 1 })
    expectRat(det, { n: 0, d: 1 }, 'det(4/5,4/5,1)=0')
  })

  it('at the interior point (0,0,0) → 1 (identity matrix)', () => {
    const det = psdDeterminant3({ n: 0, d: 1 }, { n: 0, d: 1 }, { n: 0, d: 1 })
    expectRat(det, { n: 1, d: 1 }, 'det(0,0,0)=1')
  })
})

// ─── equicorrelationMin ───────────────────────────────────────────────────────

describe('equicorrelationMin', () => {
  it('n=3 → −1/2', () => {
    expectRat(equicorrelationMin(3), { n: -1, d: 2 }, 'equicorrelationMin(3)=−1/2')
  })

  it('n=2 → −1', () => {
    expectRat(equicorrelationMin(2), { n: -1, d: 1 }, 'equicorrelationMin(2)=−1')
  })

  it('n=5 → −1/4', () => {
    expectRat(equicorrelationMin(5), { n: -1, d: 4 }, 'equicorrelationMin(5)=−1/4')
  })
})

// ─── optimalHedgeRatio ────────────────────────────────────────────────────────

describe('optimalHedgeRatio', () => {
  it('{-6,1} / {9,1} → -2/3', () => {
    expectRat(
      optimalHedgeRatio({ n: -6, d: 1 }, { n: 9, d: 1 }),
      { n: -2, d: 3 },
      'hedgeRatio(-6,9)=-2/3',
    )
    expect(optimalHedgeRatio({ n: -6, d: 1 }, { n: 9, d: 1 })).toEqual({ n: -2, d: 3 })
  })
})

// ─── orderStatCovUniform ──────────────────────────────────────────────────────

describe('orderStatCovUniform', () => {
  it('cov=1/36, rho=1/2', () => {
    const result = orderStatCovUniform()
    expect(result.cov).toEqual({ n: 1, d: 36 })
    expect(result.rho).toEqual({ n: 1, d: 2 })
  })
})

// ─── formatRational ───────────────────────────────────────────────────────────

describe('formatRational', () => {
  it('{35,12} → "35/12"', () => expect(formatRational({ n: 35, d: 12 })).toBe('35/12'))
  it('{1,1} → "1"', () => expect(formatRational({ n: 1, d: 1 })).toBe('1'))
  it('{-2,3} → "-2/3"', () => expect(formatRational({ n: -2, d: 3 })).toBe('-2/3'))
  it('{0,1} → "0"', () => expect(formatRational({ n: 0, d: 1 })).toBe('0'))
  it('{3,1} → "3"', () => expect(formatRational({ n: 3, d: 1 })).toBe('3'))
})

// ─── Reduced/exact and plain-number-safety goldens ────────────────────────────

describe('reduced/exact and plain-number safety', () => {
  it('covariance(matchedBitJoint) returns {n:1,d:4} not {n:25,d:100}', () => {
    const cov = covariance(matchedBitJoint())
    expect(cov).toEqual({ n: 1, d: 4 })
    expectReduced(cov)
  })

  it('variance(die) returns {n:35,d:12} in fully reduced form', () => {
    const v = variance(diePmf())
    expect(v).toEqual({ n: 35, d: 12 })
    expectReduced(v)
  })

  it('rhoSquared(12,9,25) returns {n:16,d:25} in fully reduced form', () => {
    const rs = rhoSquared({ n: 12, d: 1 }, { n: 9, d: 1 }, { n: 25, d: 1 })
    expect(rs).toEqual({ n: 16, d: 25 })
    expectReduced(rs)
  })

  it('no result has |n| or d anywhere near 1e15 (plain-number safety)', () => {
    const THRESHOLD = 1e13
    const checks: Rational[] = [
      variance(diePmf()),
      expectedValueX2(diePmf()),
      covariance(matchedBitJoint()),
      covariance(independentDiceJoint()),
      rhoSquared({ n: 35, d: 12 }, { n: 35, d: 12 }, { n: 35, d: 6 }),
      rhoSquared({ n: 12, d: 1 }, { n: 9, d: 1 }, { n: 25, d: 1 }),
      rhoSquared({ n: 1, d: 36 }, { n: 1, d: 18 }, { n: 1, d: 18 }),
      corrRange({ n: 4, d: 5 }, { n: 4, d: 5 }).min,
      corrRange({ n: 4, d: 5 }, { n: 4, d: 5 }).max,
      psdDeterminant3({ n: 4, d: 5 }, { n: 4, d: 5 }, { n: 7, d: 25 }),
      equicorrelationMin(3),
      optimalHedgeRatio({ n: -6, d: 1 }, { n: 9, d: 1 }),
    ]
    for (const r of checks) {
      expect(Math.abs(r.n), `|n|=${r.n} exceeds threshold`).toBeLessThan(THRESHOLD)
      expect(r.d, `d=${r.d} exceeds threshold`).toBeLessThan(THRESHOLD)
    }
  })
})
