// Pure, dependency-free, EXACT-RATIONAL expected-value engine for the Expected
// Value concept (lesson-expected-value-1..6). Reuses Rational from ./types and
// the exact-rational toolkit (reduce/ratAdd/ratSub/ratMul/solveLinearSystem) from
// ./automaton — one exact-math source of truth, no floats. Rational-in/out for
// the EV fns; number-in for the count helpers. Goldens: expectation.test.ts.

import type { Rational } from './types'
import { ratAdd, ratMul, ratSub, reduce, solveLinearSystem } from './automaton'

const ZERO: Rational = { n: 0, d: 1 }
const ONE: Rational = { n: 1, d: 1 }

// Core Σ x·P(x) — exact-rational weighted average.
export function expectedValue(pmf: { x: Rational; p: Rational }[]): Rational {
  const acc = pmf.reduce<Rational>((a, { x, p }) => ratAdd(a, ratMul(x, p)), ZERO)
  return reduce(acc.n, acc.d)
}

// Law of total expectation: Σ E[X|case]·P(case). A case is literal (`value`) or
// self-referential (`restart`: banks `add` and replays the SAME game → worth
// add + E[X]). With ≥1 restart, solve (1 − Σ p_restart)·E = RHS via
// solveLinearSystem (the util PHT first-step equations use).
export function totalExpectation(
  cases: { p: Rational; value?: Rational; restart?: { add: Rational } }[],
): Rational {
  let rhs: Rational = ZERO
  let restartP: Rational = ZERO
  for (const c of cases) {
    if (c.restart) {
      rhs = ratAdd(rhs, ratMul(c.p, c.restart.add))
      restartP = ratAdd(restartP, c.p)
    } else if (c.value) {
      rhs = ratAdd(rhs, ratMul(c.p, c.value))
    }
  }
  const coeff = ratSub(ONE, restartP)
  const [e] = solveLinearSystem([[coeff]], [rhs])
  return reduce(e.n, e.d)
}

// E[1_A] = P(A).
export function indicatorExpectation(p: Rational): Rational {
  return reduce(p.n, p.d)
}

// H_n = Σ_{k=1}^{n} 1/k (exact rational).
export function harmonic(n: number): Rational {
  let acc: Rational = ZERO
  for (let k = 1; k <= n; k++) acc = ratAdd(acc, { n: 1, d: k })
  return reduce(acc.n, acc.d)
}

// Coupon collector: N·H_N = expected draws to collect all N types.
export function couponCollector(n: number): Rational {
  return ratMul({ n, d: 1 }, harmonic(n))
}

// Coupon part B: E[distinct after m draws] = N(1 − ((N−1)/N)^m).
export function distinctAfterDraws(N: number, m: number): Rational {
  const base = reduce(N - 1, N)
  let pow: Rational = ONE
  for (let i = 0; i < m; i++) pow = ratMul(pow, base)
  return ratMul({ n: N, d: 1 }, ratSub(ONE, pow))
}

// Order stats for n IID Uniform(0,1): E[max]=n/(n+1), E[min]=1/(n+1).
export function orderStatUniform(n: number): { max: Rational; min: Rational } {
  return { max: reduce(n, n + 1), min: reduce(1, n + 1) }
}

// Connected-noodle loops: Σ_{k=1}^{n} 1/(2k−1) (linearity-of-expectation demo).
export function noodleLoops(n: number): Rational {
  let acc: Rational = ZERO
  for (let k = 1; k <= n; k++) acc = ratAdd(acc, { n: 1, d: 2 * k - 1 })
  return reduce(acc.n, acc.d)
}
