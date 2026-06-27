// Generator for the Covariance & Correlation capstone Interview Pack (dormant
// asset — committed but NOT seeded/deployed). Imports the concept's pure
// exact-rational engine, builds a pool of real-quant-style covariance/correlation
// questions, ENGINE-VERIFIES every answer, de-dups by fingerprint, and writes:
//   interviews/course-covariance.json  (canonical, versioned, self-describing)
//   interviews/course-covariance.md     (human-readable mirror)
// Run:  ./node_modules/.bin/tsx interviews/_build/build-covariance-pack.ts
//
// EXACT-RATIONAL CONTRACT (ADR-0005): every engineCheck.answer is an exact
// rational ("n/d" or integer) — never a float. ρ is emitted only when √(VarX·VarY)
// is exact (perfect-square reduced n & d); otherwise the graded quantity is ρ²,
// the covariance, or a variance. corrRange inputs are Pythagorean pairs so
// √(1−ρ²) collapses to a rational. The build asserts engineCheck.answer matches
// the value the engine actually returns (src/engine/covariance.ts).

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  variance,
  covariance,
  covarianceIndicators,
  varianceOfSum,
  covBilinear,
  rhoSquared,
  rho,
  corrRange,
  psdDeterminant3,
  equicorrelationMin,
  optimalHedgeRatio,
  orderStatCovUniform,
  formatRational,
  formatRangePair,
  reduce,
  type Pmf,
  type JointCell,
  type Rational,
} from '../../src/engine/covariance'

type Tier = 'hard' | 'harder' | 'brutal'

interface EngineCheck {
  module: string
  calls: string[]
  answer: string
  verified: true
}
interface Hidden {
  answer: string
  approaches: string[]
  wrongTurns: string[]
  hintLadder: [string, string, string]
  rubric: { correctness: string; approach: string; rigor: string; communication: string; speed: string }
}
interface Question {
  id: string
  tier: Tier
  fingerprint: string
  template?: { id: string; params: Record<string, string | number> }
  prompt: string
  source: string
  engineCheck: EngineCheck
  hidden: Hidden
  followUps: string[]
}

const MODULE = 'src/engine/covariance.ts'
const R = (n: number, d = 1): Rational => ({ n, d })
const fr = formatRational

// House rubric (the axis *descriptions* — concept-specific where it helps).
const RUBRIC: Hidden['rubric'] = {
  correctness: 'matches the engine value exactly (exact rational n/d, integer, or ρ²/covariance/variance — never a float ρ)',
  approach: 'uses the covariance algebra directly — Cov=E[XY]−E[X]E[Y], bilinearity, ρ=Cov/(σ_Xσ_Y), or the PSD/determinant condition — not a guess',
  rigor: 'tracks exactness: recognizes when ρ is irrational and falls back to ρ²/covariance; states independence vs uncorrelated correctly',
  communication: 'names the identity being used and explains each algebra step cleanly',
  speed: 'reaches a clean exact rational without arithmetic drift',
}

const questions: Question[] = []

// ── frac helper: turn a string like "1/6" or "3" into a Rational ──────────────
function F(s: string): Rational {
  const m = s.match(/^(-?\d+)(?:\/(-?\d+))?$/)
  if (!m) throw new Error(`bad frac ${s}`)
  return reduce(parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 1)
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1 — variance of a finite distribution  (variance(pmf))
//   kinds: fair die {1..m}; Bernoulli(p) with rational p.
// ─────────────────────────────────────────────────────────────────────────────
function diePmf(m: number): Pmf {
  return Array.from({ length: m }, (_, i) => ({ x: R(i + 1), p: R(1, m) }))
}
function bernoulliPmf(p: Rational): Pmf {
  return [{ x: R(0), p: ratComplement(p) }, { x: R(1), p }]
}
function ratComplement(p: Rational): Rational {
  return reduce(p.d - p.n, p.d)
}
function varDie(m: number, tier: Tier): Question {
  const ans = fr(variance(diePmf(m)))
  return {
    id: `tmpl-variance#die${m}`,
    tier,
    fingerprint: `tmpl-variance:kind=die,m=${m}`,
    template: { id: 'tmpl-variance', params: { kind: 'die', m } },
    prompt: `A fair ${m}-sided die shows the faces 1 through ${m}, each equally likely. On the desk you are asked for the variance of a single roll. What is Var(X)?`,
    source:
      'Green Book p.47-48 (covariance/variance §, line 7502) — variance of a finite pmf; randomservices.org "Covariance" §5. A standard warm-up quant question.',
    engineCheck: { module: MODULE, calls: [`formatRational(variance(diePmf(${m})))`], answer: ans, verified: true },
    hidden: {
      answer: ans,
      approaches: [
        `Var(X)=E[X²]−E[X]². E[X]=(${m}+1)/2; E[X²]=Σk²/${m}. For the fair ${m}-die this gives ${ans} = (${m}²−1)/12.`,
        `Use the closed form Var(uniform{1..m}) = (m²−1)/12 with m=${m}.`,
      ],
      wrongTurns: [
        'using E[X]² for E[X²] (forgetting the variance subtracts the squared mean)',
        'dividing the sum of squares by m−1 (sample variance) instead of m',
        'computing E[X²] as (E[X])²',
      ],
      hintLadder: [
        'Variance needs two moments, not one. Which two?',
        'Var(X)=E[X²]−(E[X])². Compute each moment by averaging over the equally-likely faces.',
        'E[X]=(m+1)/2 and E[X²]=(1²+…+m²)/m; subtract the square of the first from the second.',
      ],
      rubric: RUBRIC,
    },
    followUps: [
      `If you roll this die twice independently, what is Var(X₁+X₂)?`,
      'How does this variance scale if every face value is doubled?',
    ],
  }
}
function varBernoulli(ps: string, tier: Tier): Question {
  const p = F(ps)
  const ans = fr(variance(bernoulliPmf(p)))
  return {
    id: `tmpl-variance#bern${p.n}-${p.d}`,
    tier,
    fingerprint: `tmpl-variance:kind=bernoulli,p=${p.n}/${p.d}`,
    template: { id: 'tmpl-variance', params: { kind: 'bernoulli', p: `${p.n}/${p.d}` } },
    prompt: `An indicator X is 1 with probability ${p.n}/${p.d} and 0 otherwise (a single Bernoulli trial — e.g. one tick going up). What is Var(X)?`,
    source:
      'Green Book p.47-48 (variance of an indicator) — Bernoulli variance p(1−p); a building-block desk question for indicator-covariance work.',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(variance(bernoulliPmf(${p.n}/${p.d})))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `For a 0/1 indicator E[X²]=E[X]=p, so Var(X)=p−p²=p(1−p) = (${p.n}/${p.d})·(${p.d - p.n}/${p.d}) = ${ans}.`,
        'Bernoulli variance is p(1−p); plug in p directly.',
      ],
      wrongTurns: [
        'reporting p instead of p(1−p)',
        'forgetting E[X²]=p for a 0/1 variable',
        'using p(1+p)',
      ],
      hintLadder: [
        'For a 0/1 variable, how do E[X] and E[X²] relate?',
        'They are equal (X²=X), so Var(X)=p−p².',
        'That is p(1−p); substitute p.',
      ],
      rubric: RUBRIC,
    },
    followUps: [
      'For which p is this variance largest, and what is that maximum?',
      'If Y is an independent copy, what is Cov(X,Y)?',
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2 — covariance from a 2×2 joint pmf over {0,1}×{0,1}
//   params encode the four cells as integer counts over a common denominator.
// ─────────────────────────────────────────────────────────────────────────────
function joint2x2(p00: number, p01: number, p10: number, p11: number, den: number): JointCell[] {
  return [
    { x: R(0), y: R(0), p: R(p00, den) },
    { x: R(0), y: R(1), p: R(p01, den) },
    { x: R(1), y: R(0), p: R(p10, den) },
    { x: R(1), y: R(1), p: R(p11, den) },
  ]
}
function covJoint(
  cells: [number, number, number, number],
  den: number,
  tier: Tier,
  story: string,
): Question {
  const [a, b, c, d] = cells
  const j = joint2x2(a, b, c, d, den)
  const ans = fr(covariance(j))
  const tbl = `P(0,0)=${a}/${den}, P(0,1)=${b}/${den}, P(1,0)=${c}/${den}, P(1,1)=${d}/${den}`
  return {
    id: `tmpl-cov-joint#${a}-${b}-${c}-${d}_${den}`,
    tier,
    fingerprint: `tmpl-cov-joint:cells=${a}-${b}-${c}-${d},den=${den}`,
    template: { id: 'tmpl-cov-joint', params: { cells: `${a}-${b}-${c}-${d}`, den } },
    prompt: `${story} Two 0/1 random variables X and Y have the joint distribution ${tbl}. Compute Cov(X,Y).`,
    source:
      'Green Book p.47-48 (Cov(X,Y)=E[XY]−E[X]E[Y], lines 7502-7566) — covariance straight from a joint pmf; randomservices.org "Covariance".',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(covariance(joint2x2(${a},${b},${c},${d},${den})))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `E[XY]=P(1,1)=${d}/${den}. E[X]=P(X=1)=(${c}+${d})/${den}; E[Y]=P(Y=1)=(${b}+${d})/${den}. Cov=E[XY]−E[X]E[Y]=${ans}.`,
        'For 0/1 variables only the (1,1) cell contributes to E[XY]; the marginals give E[X],E[Y].',
      ],
      wrongTurns: [
        'using a joint cell as a marginal (or vice versa)',
        'forgetting to subtract E[X]E[Y]',
        'summing all cells into E[XY] instead of just the (1,1) cell',
      ],
      hintLadder: [
        'Cov(X,Y)=E[XY]−E[X]E[Y]. Get each piece from the table.',
        'For 0/1 variables E[XY] is just P(X=1,Y=1); the marginals are the row/column sums for the 1-state.',
        'Subtract the product of the two marginal 1-probabilities from the (1,1) cell.',
      ],
      rubric: RUBRIC,
    },
    followUps: [
      'Are X and Y independent here? How can you tell from Cov alone — and is Cov=0 sufficient?',
      'What is the correlation ρ(X,Y) for this table?',
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3 — indicator covariance  Cov(1_A,1_B)=P(A∩B)−P(A)P(B)
// ─────────────────────────────────────────────────────────────────────────────
function covIndicator(
  pABs: string,
  pAs: string,
  pBs: string,
  tier: Tier,
  story: string,
): Question {
  const pAB = F(pABs), pA = F(pAs), pB = F(pBs)
  const ans = fr(covarianceIndicators(pAB, pA, pB))
  return {
    id: `tmpl-cov-indicator#${pAB.n}-${pAB.d}_${pA.n}-${pA.d}_${pB.n}-${pB.d}`,
    tier,
    fingerprint: `tmpl-cov-indicator:pAB=${pAB.n}/${pAB.d},pA=${pA.n}/${pA.d},pB=${pB.n}/${pB.d}`,
    template: {
      id: 'tmpl-cov-indicator',
      params: { pAB: `${pAB.n}/${pAB.d}`, pA: `${pA.n}/${pA.d}`, pB: `${pB.n}/${pB.d}` },
    },
    prompt: `${story} Two events have P(A)=${pAs}, P(B)=${pBs}, and P(A∩B)=${pABs}. Let X=1_A and Y=1_B be their indicators. What is Cov(X,Y)?`,
    source:
      'Green Book p.47-48 (indicator covariance) — Cov(1_A,1_B)=P(A∩B)−P(A)P(B); the canonical "are these events positively/negatively associated?" desk question.',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(covarianceIndicators(${pAB.n}/${pAB.d}, ${pA.n}/${pA.d}, ${pB.n}/${pB.d}))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `Cov(1_A,1_B)=P(A∩B)−P(A)P(B)=${pABs}−(${pAs})(${pBs})=${ans}.`,
        `Sign of the answer tells you whether the events are positively (>0), negatively (<0), or un-associated (=0).`,
      ],
      wrongTurns: [
        'computing P(A∩B)−P(A∪B)',
        'forgetting that E[1_A·1_B]=P(A∩B)',
        'treating the events as automatically independent',
      ],
      hintLadder: [
        'The product 1_A·1_B is itself an indicator — of which event?',
        'It indicates A∩B, so E[1_A1_B]=P(A∩B). Now apply the covariance definition.',
        'Cov = P(A∩B) − P(A)P(B).',
      ],
      rubric: RUBRIC,
    },
    followUps: [
      'Is this covariance zero exactly when A and B are independent? Argue it.',
      'What is the largest covariance two events with these marginals could have?',
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 4 — Var(aX+bY) from Var(X),Var(Y),Cov(X,Y)  (varianceOfSum)
//   General linear combination: a²VarX + b²VarY + 2ab·Cov, realized by scaling
//   the args into varianceOfSum so the engine call is faithful.
// ─────────────────────────────────────────────────────────────────────────────
function scaleVar(coeff: number, v: Rational): Rational {
  return reduce(coeff * coeff * v.n, v.d)
}
function scaleCov(a: number, b: number, c: Rational): Rational {
  return reduce(a * b * c.n, c.d)
}
function varLinear(
  a: number,
  b: number,
  vXs: string,
  vYs: string,
  covs: string,
  tier: Tier,
): Question {
  const vX = F(vXs), vY = F(vYs), cov = F(covs)
  const A = scaleVar(a, vX), B = scaleVar(b, vY), Cc = scaleCov(a, b, cov)
  const ans = fr(varianceOfSum(A, B, Cc))
  const term = (k: number, sym: string) => (k === 1 ? sym : k === -1 ? `−${sym}` : `${k}${sym}`)
  const combo = `${term(a, 'X')} ${b < 0 ? '−' : '+'} ${term(Math.abs(b), 'Y')}`
  return {
    id: `tmpl-var-linear#a${a}b${b}_vx${vX.n}-${vX.d}_vy${vY.n}-${vY.d}_c${cov.n}-${cov.d}`,
    tier,
    fingerprint: `tmpl-var-linear:a=${a},b=${b},vX=${vX.n}/${vX.d},vY=${vY.n}/${vY.d},cov=${cov.n}/${cov.d}`,
    template: {
      id: 'tmpl-var-linear',
      params: { a, b, vX: `${vX.n}/${vX.d}`, vY: `${vY.n}/${vY.d}`, cov: `${cov.n}/${cov.d}` },
    },
    prompt: `Two assets have Var(X)=${vXs}, Var(Y)=${vYs}, and Cov(X,Y)=${covs}. For the portfolio P = ${combo}, what is Var(P)?`,
    source:
      'Green Book p.48 ("General rules of variance and covariance", line 7582) — Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y); the bread-and-butter portfolio-variance desk question.',
    engineCheck: {
      module: MODULE,
      calls: [
        `formatRational(varianceOfSum(${A.n}/${A.d}, ${B.n}/${B.d}, ${Cc.n}/${Cc.d}))  // a=${a},b=${b}: a²·VarX, b²·VarY, ab·Cov`,
      ],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `Var(${combo}) = ${a}²·${vXs} + (${b})²·${vYs} + 2·(${a})·(${b})·(${covs}) = ${ans}.`,
        'Expand by bilinearity: the cross term carries the 2ab·Cov, with the SIGN of ab.',
      ],
      wrongTurns: [
        'dropping the 2ab·Cov cross term',
        'using ab instead of 2ab on the cross term',
        `getting the sign of the cross term wrong when a or b is negative`,
      ],
      hintLadder: [
        'Variance of a linear combination has three pieces — two "own" terms and one cross term.',
        'Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y).',
        'Plug in a,b,Var(X),Var(Y),Cov — watch the sign on 2ab.',
      ],
      rubric: RUBRIC,
    },
    followUps: [
      'Which sign of Cov reduces the portfolio variance, and why is that the diversification benefit?',
      'Holding X fixed, what weight on Y minimizes Var(P)?',
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 5 — Cov(X, X+Y) by bilinearity  (covBilinear: VarX + CovXY)
// ─────────────────────────────────────────────────────────────────────────────
function covBilin(vXs: string, covs: string, tier: Tier): Question {
  const vX = F(vXs), cov = F(covs)
  const ans = fr(covBilinear(vX, cov))
  return {
    id: `tmpl-cov-bilinear#vx${vX.n}-${vX.d}_c${cov.n}-${cov.d}`,
    tier,
    fingerprint: `tmpl-cov-bilinear:vX=${vX.n}/${vX.d},cov=${cov.n}/${cov.d}`,
    template: { id: 'tmpl-cov-bilinear', params: { vX: `${vX.n}/${vX.d}`, cov: `${cov.n}/${cov.d}` } },
    prompt: `You hold X, and you are also exposed to the sum S = X + Y. Given Var(X)=${vXs} and Cov(X,Y)=${covs}, what is Cov(X, X+Y)?`,
    source:
      'Green Book p.48 (bilinearity of covariance) — Cov(X, X+Y)=Cov(X,X)+Cov(X,Y)=Var(X)+Cov(X,Y); randomservices.org "Covariance".',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(covBilinear(${vX.n}/${vX.d}, ${cov.n}/${cov.d}))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `By bilinearity Cov(X,X+Y)=Cov(X,X)+Cov(X,Y)=Var(X)+Cov(X,Y)=${vXs}+(${covs})=${ans}.`,
        'Cov(X,X) is exactly Var(X); the cross piece is Cov(X,Y).',
      ],
      wrongTurns: [
        'writing Cov(X,X)=0 instead of Var(X)',
        'dropping the Cov(X,Y) term',
        'doubling Var(X)',
      ],
      hintLadder: [
        'Covariance is linear in each argument — split the second slot.',
        'Cov(X,X+Y)=Cov(X,X)+Cov(X,Y). What is Cov(X,X)?',
        'Cov(X,X)=Var(X); add Cov(X,Y).',
      ],
      rubric: RUBRIC,
    },
    followUps: [
      'What does this become when X and Y are independent?',
      'What is Cov(X+Y, X−Y) in terms of Var(X) and Var(Y)?',
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 6 — ρ / ρ² from perfect-square variances  (rho / rhoSquared)
//   When √(VarX·VarY) is exact, grade ρ (rational). Otherwise grade ρ².
//   `grade` selects which to report. For irrational ρ we ALWAYS grade ρ².
// ─────────────────────────────────────────────────────────────────────────────
function rhoQ(
  covs: string,
  vXs: string,
  vYs: string,
  grade: 'rho' | 'rhoSq',
  tier: Tier,
): Question {
  const cov = F(covs), vX = F(vXs), vY = F(vYs)
  const r = rho(cov, vX, vY)
  const rsq = fr(rhoSquared(cov, vX, vY))
  let ans: string
  let calls: string[]
  let promptTail: string
  if (grade === 'rho') {
    if (r.kind !== 'rational') throw new Error(`rhoQ asked to grade ρ but it is irrational for ${covs},${vXs},${vYs}`)
    ans = fr(r.rho)
    calls = [`formatRational(rho(${cov.n}/${cov.d}, ${vX.n}/${vX.d}, ${vY.n}/${vY.d}).rho)`]
    promptTail = 'what is the correlation ρ(X,Y)?'
  } else {
    ans = rsq
    calls = [`formatRational(rhoSquared(${cov.n}/${cov.d}, ${vX.n}/${vX.d}, ${vY.n}/${vY.d}))`]
    promptTail =
      'the correlation ρ here is irrational, so report the exact ρ² (the squared correlation / R²) instead.'
  }
  const idTag = `${cov.n}-${cov.d}_${vX.n}-${vX.d}_${vY.n}-${vY.d}_${grade}`
  return {
    id: `tmpl-rho-perfsq#${idTag}`,
    tier,
    fingerprint: `tmpl-rho-perfsq:cov=${cov.n}/${cov.d},vX=${vX.n}/${vX.d},vY=${vY.n}/${vY.d},grade=${grade}`,
    template: {
      id: 'tmpl-rho-perfsq',
      params: { cov: `${cov.n}/${cov.d}`, vX: `${vX.n}/${vX.d}`, vY: `${vY.n}/${vY.d}`, grade },
    },
    prompt: `Given Cov(X,Y)=${covs}, Var(X)=${vXs}, Var(Y)=${vYs}, ${promptTail}`,
    source:
      'Green Book p.48 (correlation coefficient ρ=Cov/(σ_Xσ_Y), line 7660) — definition-drill; ρ² is the always-rational graded quantity when σ_Xσ_Y is irrational.',
    engineCheck: { module: MODULE, calls, answer: ans, verified: true },
    hidden: {
      answer: ans,
      approaches:
        grade === 'rho'
          ? [
              `ρ=Cov/√(Var(X)·Var(Y))=${covs}/√(${vXs}·${vYs}). The variances are perfect squares so √ is exact: ρ=${ans}.`,
              'Check the inputs make σ_Xσ_Y rational (perfect-square variances) before claiming a rational ρ.',
            ]
          : [
              `ρ²=Cov²/(Var(X)·Var(Y))=(${covs})²/((${vXs})(${vYs}))=${ans}.`,
              `Here √(Var(X)·Var(Y)) is irrational so ρ itself is irrational (display-only); ρ² is the exact graded value.`,
            ],
      wrongTurns: [
        'reporting a decimal for an irrational ρ instead of the exact ρ²',
        'forgetting to take the square root of the variance product in ρ',
        'using Var instead of σ (the standard deviation) in the denominator',
      ],
      hintLadder: [
        'ρ normalizes covariance by the two standard deviations. Write ρ=Cov/(σ_Xσ_Y).',
        grade === 'rho'
          ? 'Are the variances perfect squares? If so √(Var(X)·Var(Y)) is exact and ρ is rational.'
          : 'Is √(Var(X)·Var(Y)) rational here? If not, ρ is irrational — square the relation to get ρ²=Cov²/(Var(X)·Var(Y)).',
        grade === 'rho'
          ? 'Compute σ_X, σ_Y, then divide the covariance by their product.'
          : 'ρ² = Cov² / (Var(X)·Var(Y)); reduce the fraction.',
      ],
      rubric: RUBRIC,
    },
    followUps:
      grade === 'rho'
        ? ['What does this ρ say about the linear fit between X and Y?', 'What covariance would make X and Y perfectly correlated here?']
        : ['Why is reporting ρ² (or a display-only "1/√2") the right move when ρ is irrational?', 'What fraction of Var(Y) is explained by X (the R²)?'],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 7 — 3-variable correlation range  (corrRange, Pythagorean pairs)
// ─────────────────────────────────────────────────────────────────────────────
function corrRangeQ(r1s: string, r2s: string, tier: Tier): Question {
  const r1 = F(r1s), r2 = F(r2s)
  const rng = corrRange(r1, r2)
  const ans = formatRangePair(rng)
  return {
    id: `tmpl-corr-range#${r1.n}-${r1.d}_${r2.n}-${r2.d}`,
    tier,
    fingerprint: `tmpl-corr-range:rho1=${r1.n}/${r1.d},rho2=${r2.n}/${r2.d}`,
    template: { id: 'tmpl-corr-range', params: { rho1: `${r1.n}/${r1.d}`, rho2: `${r2.n}/${r2.d}` } },
    prompt: `Three random variables X, Y, Z satisfy ρ(X,Y)=${r1s} and ρ(Y,Z)=${r2s}. What is the full range of possible values of ρ(X,Z)? Give the minimum and maximum.`,
    source:
      'Green Book p.26-29 ("max/min correlation of 3 variables", lines 4579-4943) — the geometric/PSD correlation-range classic; a famous Jane Street / desk interview question.',
    engineCheck: {
      module: MODULE,
      calls: [`formatRangePair(corrRange(${r1.n}/${r1.d}, ${r2.n}/${r2.d}))  // "min,max"`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `ρ(X,Z) ∈ [ρ₁ρ₂ − √(1−ρ₁²)√(1−ρ₂²), ρ₁ρ₂ + √(1−ρ₁²)√(1−ρ₂²)]. With ρ₁=${r1s}, ρ₂=${r2s} (Pythagorean, so the √ are exact) this is ${ans}.`,
        'Geometric view: place unit vectors at angles arccos(ρ); ρ(X,Z) ranges as the third angle swings, bounded by the angle sum/difference. The bounds are exactly where the 3×3 correlation matrix is singular (PSD boundary).',
      ],
      wrongTurns: [
        'assuming ρ(X,Z) can be anything in [−1,1]',
        'multiplying ρ₁ρ₂ and forgetting the ±√(1−ρ₁²)√(1−ρ₂²) spread',
        'using √(1−ρ₁²−ρ₂²) instead of the product of the two √(1−ρ²) terms',
      ],
      hintLadder: [
        'Correlations are cosines of angles between unit vectors — what does that constrain about the third angle?',
        'The third cosine lies in [cos(θ₁+θ₂), cos(θ₁−θ₂)] = [ρ₁ρ₂ − sinθ₁sinθ₂, ρ₁ρ₂ + sinθ₁sinθ₂].',
        'sinθ = √(1−ρ²); the bounds are ρ₁ρ₂ ± √(1−ρ₁²)√(1−ρ₂²).',
      ],
      rubric: RUBRIC,
    },
    followUps: [
      'At each bound, what is the determinant of the 3×3 correlation matrix, and why must it be exactly 0 there?',
      'What goes wrong with this clean answer if ρ₁ or ρ₂ is not a Pythagorean value?',
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 8 — PSD determinant of a 3×3 correlation matrix  (psdDeterminant3)
// ─────────────────────────────────────────────────────────────────────────────
function psdDetQ(r12s: string, r13s: string, r23s: string, tier: Tier, framing: string): Question {
  const r12 = F(r12s), r13 = F(r13s), r23 = F(r23s)
  const ans = fr(psdDeterminant3(r12, r13, r23))
  return {
    id: `tmpl-psd-det#${r12.n}-${r12.d}_${r13.n}-${r13.d}_${r23.n}-${r23.d}`,
    tier,
    fingerprint: `tmpl-psd-det:r12=${r12.n}/${r12.d},r13=${r13.n}/${r13.d},r23=${r23.n}/${r23.d}`,
    template: {
      id: 'tmpl-psd-det',
      params: { r12: `${r12.n}/${r12.d}`, r13: `${r13.n}/${r13.d}`, r23: `${r23.n}/${r23.d}` },
    },
    prompt: `${framing} A proposed 3×3 correlation matrix has off-diagonals ρ₁₂=${r12s}, ρ₁₃=${r13s}, ρ₂₃=${r23s}. Compute its determinant (det = 1 + 2ρ₁₂ρ₁₃ρ₂₃ − ρ₁₂² − ρ₁₃² − ρ₂₃²). Is the matrix a valid correlation matrix at this point?`,
    source:
      'Green Book p.29 (PSD correlation-matrix condition, lines 4924-4944) — det≥0 is the boundary/feasibility test behind the 3-variable correlation range; atypicalquant.net.',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(psdDeterminant3(${r12.n}/${r12.d}, ${r13.n}/${r13.d}, ${r23.n}/${r23.d}))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `det = 1 + 2·(${r12s})·(${r13s})·(${r23s}) − (${r12s})² − (${r13s})² − (${r23s})² = ${ans}.`,
        `A correlation matrix must be PSD ⇔ det≥0 (with leading minors ≥0). det=${ans} ${F(ans).n >= 0 ? '≥ 0 → feasible (det=0 means exactly on the boundary / singular)' : '< 0 → NOT a valid correlation matrix'}.`,
      ],
      wrongTurns: [
        'dropping the +2ρ₁₂ρ₁₃ρ₂₃ triple-product term',
        'sign-flipping the squared terms',
        'concluding feasibility from det alone without noting det=0 is the singular boundary',
      ],
      hintLadder: [
        'Write out the 3×3 determinant of [[1,a,b],[a,1,c],[b,c,1]] symbolically.',
        'It equals 1 + 2abc − a² − b² − c². Substitute the three correlations.',
        'Evaluate; det≥0 (with positive leading minors) is required for a valid correlation matrix.',
      ],
      rubric: RUBRIC,
    },
    followUps: [
      'If det=0, what does that say about the three variables (linear dependence)?',
      'Holding ρ₁₂ and ρ₁₃ fixed, what range of ρ₂₃ keeps det≥0?',
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 9 — minimum equicorrelation  (equicorrelationMin: −1/(n−1))
// ─────────────────────────────────────────────────────────────────────────────
function equicorrQ(n: number, tier: Tier): Question {
  const ans = fr(equicorrelationMin(n))
  return {
    id: `tmpl-equicorr-min#n${n}`,
    tier,
    fingerprint: `tmpl-equicorr-min:n=${n}`,
    template: { id: 'tmpl-equicorr-min', params: { n } },
    prompt: `${n} random variables are equicorrelated: every pair has the SAME correlation ρ. What is the most NEGATIVE value ρ can take while this remains possible?`,
    source:
      'atypicalquant.net "minimal pairwise correlation" / Green Book p.29 PSD material — equicorrelation eigenvalue 1+(n−1)ρ≥0 ⇒ ρ≥−1/(n−1). A classic desk brain-teaser.',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(equicorrelationMin(${n}))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `The equicorrelation matrix has eigenvalue 1+(n−1)ρ (once) and 1−ρ (n−1 times). PSD ⇒ 1+(${n}−1)ρ≥0 ⇒ ρ≥−1/(${n}−1) = ${ans}.`,
        `Variance of the sum: Var(ΣXᵢ)=n+n(n−1)ρ≥0 ⇒ ρ≥−1/(n−1). Attained when the standardized variables sum to 0.`,
      ],
      wrongTurns: [
        'answering −1 (the pairwise bound) regardless of n',
        'using 1/n instead of 1/(n−1)',
        'forgetting the bound depends on n at all',
      ],
      hintLadder: [
        'Negative correlations can\'t all be too strong at once — variance of the sum can\'t go negative.',
        'Var(X₁+…+Xₙ) (unit variances) = n + n(n−1)ρ ≥ 0.',
        'Solve n + n(n−1)ρ ≥ 0 for ρ: ρ ≥ −1/(n−1).',
      ],
      rubric: RUBRIC,
    },
    followUps: [
      'What does the bound approach as n→∞, and what does that mean about many mutually-negatively-correlated assets?',
      'At ρ=−1/(n−1), what is Var(X₁+…+Xₙ)?',
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 10 — minimum-variance hedge ratio  (optimalHedgeRatio: Cov/Var)
// ─────────────────────────────────────────────────────────────────────────────
function hedgeQ(covs: string, varBs: string, tier: Tier): Question {
  const cov = F(covs), varB = F(varBs)
  const ans = fr(optimalHedgeRatio(cov, varB))
  return {
    id: `tmpl-hedge-ratio#c${cov.n}-${cov.d}_v${varB.n}-${varB.d}`,
    tier,
    fingerprint: `tmpl-hedge-ratio:cov=${cov.n}/${cov.d},varB=${varB.n}/${varB.d}`,
    template: { id: 'tmpl-hedge-ratio', params: { cov: `${cov.n}/${cov.d}`, varB: `${varB.n}/${varB.d}` } },
    prompt: `You are long 1 unit of asset A and will short h units of asset B to minimize the variance of A − hB. Given Cov(A,B)=${covs} and Var(B)=${varBs}, what hedge ratio h minimizes the variance?`,
    source:
      'Green Book p.48 ("optimal hedge ratio", line 7647) — minimize Var(r_A−h·r_B) ⇒ h*=Cov(A,B)/Var(B); the canonical hedging desk question.',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(optimalHedgeRatio(${cov.n}/${cov.d}, ${varB.n}/${varB.d}))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `Minimize Var(A−hB)=Var(A)−2h·Cov(A,B)+h²Var(B) over h: d/dh=0 ⇒ h*=Cov(A,B)/Var(B)=${covs}/${varBs}=${ans}.`,
        'Equivalently h* is the OLS regression slope of A on B; it is ρ·σ_A/σ_B = Cov/Var(B).',
      ],
      wrongTurns: [
        'using Var(A) in the denominator instead of Var(B)',
        'dividing by the standard deviation σ_B instead of the variance Var(B)',
        'flipping the sign (a negative Cov gives a negative — i.e. long — hedge)',
      ],
      hintLadder: [
        'Write the variance of the hedged position as a function of h and minimize.',
        'Var(A−hB)=Var(A)−2h·Cov(A,B)+h²Var(B); set the derivative in h to zero.',
        'h* = Cov(A,B)/Var(B).',
      ],
      rubric: RUBRIC,
    },
    followUps: [
      'What residual variance is left at the optimal h (in terms of Var(A) and ρ)?',
      'How does h* relate to the regression slope and to ρ?',
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 11 — Cov/ρ of min & max of two iid U(0,1)  (orderStatCovUniform)
//   `ask` selects which of cov / rho is graded.
// ─────────────────────────────────────────────────────────────────────────────
function orderStatQ(ask: 'cov' | 'rho', tier: Tier): Question {
  const os = orderStatCovUniform()
  const ans = ask === 'cov' ? fr(os.cov) : fr(os.rho)
  const what = ask === 'cov' ? 'Cov(Y,Z)' : 'the correlation ρ(Y,Z)'
  return {
    id: `tmpl-order-stat#${ask}`,
    tier,
    fingerprint: `tmpl-order-stat:ask=${ask}`,
    template: { id: 'tmpl-order-stat', params: { ask } },
    prompt: `Draw two independent Uniform(0,1) values and let Y=min and Z=max. What is ${what}?`,
    source:
      'Green Book p.51-52 ("Correlation of max and min", lines 8059-8175) — order-statistic synthesis; the answer Cov=1/36, ρ=1/2 is a celebrated desk result.',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(orderStatCovUniform().${ask})`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        ask === 'cov'
          ? 'Y·Z = min·max = X₁X₂ always ⇒ E[YZ]=E[X₁]E[X₂]=1/4. E[Y]=1/3, E[Z]=2/3 ⇒ Cov=1/4−2/9=1/36.'
          : 'Cov(Y,Z)=1/36; Var(Y)=Var(Z)=E[Y²]−E[Y]²=1/6−1/9=1/18. ρ=(1/36)/(1/18)=1/2.',
        'Key trick: min·max equals the product of the originals, so E[min·max] needs no order-statistic integral.',
      ],
      wrongTurns: [
        'assuming min and max are independent (they are not — yet ρ=1/2)',
        'integrating E[min·max] the hard way instead of using min·max = X₁X₂',
        'using the wrong order-statistic means (E[min]=1/3, E[max]=2/3)',
      ],
      hintLadder: [
        'Is there a slick identity for min·max of two numbers?',
        'min·max = X₁·X₂, so E[YZ]=E[X₁]E[X₂]=1/4 with no integral.',
        ask === 'cov'
          ? 'Subtract E[min]E[max]=(1/3)(2/3) from 1/4.'
          : 'Cov=1/36 and Var(min)=Var(max)=1/18; divide.',
      ],
      rubric: RUBRIC,
    },
    followUps:
      ask === 'cov'
        ? ['What are Var(min) and Var(max), and hence ρ(min,max)?', 'Why is the covariance positive even though one is the min and the other the max?']
        : ['Why are min and max positively correlated despite min ≤ max always holding?', 'Does this ρ change for n iid uniforms as n grows?'],
  }
}

// ===== Build the pool =====================================================

// T1 — variance (fair dice + Bernoulli indicators)
questions.push(
  varDie(6, 'hard'),
  varDie(4, 'hard'),
  varDie(8, 'harder'),
  varDie(10, 'harder'),
  varDie(12, 'harder'),
  varDie(20, 'brutal'),
  varBernoulli('1/2', 'hard'),
  varBernoulli('1/3', 'harder'),
  varBernoulli('3/10', 'harder'),
)

// T2 — covariance from a 2×2 joint pmf
questions.push(
  covJoint([1, 0, 0, 1], 2, 'hard', 'A trading signal and a fill flag move together.'),
  covJoint([1, 1, 1, 1], 4, 'hard', 'Two independent coin-flip signals.'),
  covJoint([2, 1, 1, 0], 4, 'harder', 'Two desks rarely fire at once.'),
  covJoint([3, 1, 1, 3], 8, 'harder', 'Two correlated up/down indicators.'),
  covJoint([2, 1, 1, 2], 6, 'harder', 'A pair of weakly-linked alarms.'),
  covJoint([0, 1, 1, 0], 2, 'brutal', 'Two strictly opposing positions.'),
  covJoint([5, 1, 1, 5], 12, 'brutal', 'A strongly co-moving pair.'),
)

// T3 — indicator covariance
questions.push(
  covIndicator('1/4', '1/2', '1/2', 'hard', 'Two independent fair-coin events.'),
  covIndicator('1/2', '1/2', '1/2', 'hard', 'Two events that always coincide.'),
  covIndicator('1/6', '1/3', '1/2', 'harder', 'A card event and a coin event.'),
  covIndicator('1/12', '1/4', '1/3', 'harder', 'Two thresholds on the same feed.'),
  covIndicator('1/10', '1/5', '1/2', 'brutal', 'A rare trigger and a coin event.'),
)

// T4 — Var(aX+bY)
questions.push(
  varLinear(1, 1, '35/12', '35/12', '0', 'hard'),       // 35/6 (two indep dice)
  varLinear(1, 1, '1/4', '1/4', '1/4', 'hard'),         // 1
  varLinear(1, -1, '4', '9', '-6', 'harder'),           // 25  (Var(X−Y))
  varLinear(2, 3, '4', '9', '-6', 'harder'),            // 25
  varLinear(1, 1, '9', '16', '6', 'harder'),            // 37
  varLinear(1, 1, '25', '4', '-3', 'harder'),           // 23
  varLinear(3, -2, '9', '16', '6', 'brutal'),           // 73
)

// T5 — Cov(X, X+Y)
questions.push(
  covBilin('35/12', '0', 'hard'),    // 35/12
  covBilin('4', '-6', 'harder'),     // -2
  covBilin('9', '6', 'harder'),      // 15
)

// T6 — ρ / ρ² from perfect-square variances
questions.push(
  rhoQ('12', '9', '25', 'rho', 'hard'),       // 4/5
  rhoQ('6', '4', '25', 'rho', 'hard'),        // 3/5
  rhoQ('-8', '16', '25', 'rho', 'harder'),    // -2/5
  rhoQ('20', '25', '16', 'rho', 'harder'),    // 1 (perfect-correlation boundary)
  rhoQ('-18', '16', '81', 'rho', 'harder'),   // -1/2 (clean negative)
  rhoQ('35/12', '35/12', '35/6', 'rhoSq', 'brutal'),  // 1/2 (dice X1,X1+X2, ρ irrational)
  rhoQ('1/36', '1/18', '1/18', 'rho', 'harder'),      // 1/2 (order-stat)
)

// T7 — 3-variable correlation range (Pythagorean pairs)
questions.push(
  corrRangeQ('4/5', '4/5', 'harder'),     // 7/25,1
  corrRangeQ('3/5', '3/5', 'harder'),     // -7/25,1
  corrRangeQ('4/5', '3/5', 'brutal'),     // 0,24/25
  corrRangeQ('12/13', '12/13', 'brutal'), // 119/169,1
  corrRangeQ('3/5', '12/13', 'brutal'),   // 16/65,56/65
)

// T8 — PSD determinant of a 3×3 correlation matrix
questions.push(
  psdDetQ('4/5', '4/5', '7/25', 'harder', 'Risk wants to know if a correlation estimate sits on the feasibility boundary.'),
  psdDetQ('4/5', '4/5', '1', 'harder', 'A quoted correlation triple looks suspiciously extreme.'),
  psdDetQ('1/2', '1/2', '1/2', 'hard', 'A simple equicorrelated triple.'),
  psdDetQ('1/2', '1/2', '-1/2', 'brutal', 'A triple right at the equicorrelation floor.'),
)

// T9 — minimum equicorrelation
questions.push(
  equicorrQ(3, 'hard'),
  equicorrQ(4, 'harder'),
  equicorrQ(5, 'harder'),
  equicorrQ(10, 'brutal'),
  equicorrQ(100, 'brutal'),
)

// T10 — minimum-variance hedge ratio
questions.push(
  hedgeQ('-6', '9', 'hard'),       // -2/3
  hedgeQ('12', '16', 'hard'),      // 3/4
  hedgeQ('-3', '4', 'harder'),     // -3/4
  hedgeQ('8', '25', 'harder'),     // 8/25
  hedgeQ('-10', '4', 'brutal'),    // -5/2
)

// T11 — order-stat min/max of two iid uniforms
questions.push(
  orderStatQ('cov', 'harder'),     // 1/36
  orderStatQ('rho', 'brutal'),     // 1/2
)

// ── Free-form showcase (each anchored to an exact engine computation) ──────────
function freeForm(q: Omit<Question, 'template'>): Question {
  return q
}
{
  // FF1 — uncorrelated ≠ independent (symmetry kills the covariance)
  const covSym = covariance([
    { x: R(-1), y: R(1), p: R(1, 2) },
    { x: R(1), y: R(1), p: R(1, 2) },
  ])
  questions.push(
    freeForm({
      id: 'ff-uncorrelated-not-independent',
      tier: 'brutal',
      fingerprint: 'sem:cov-x-x2-symmetry-zero',
      prompt:
        'Let X be symmetric about 0 (say X = ±1 with equal probability, or X~Uniform[−1,1]) and let Y = X². Compute Cov(X,Y) and ρ(X,Y). Are X and Y independent? Reconcile your two answers.',
      source:
        'randomservices.org "Covariance" / USNA Math 431 — the canonical "uncorrelated does not imply independent" desk question (Green Book ρ-section context).',
      engineCheck: {
        module: MODULE,
        // X=±1 with prob 1/2; Y=X²=1 always. The joint {(-1,1):1/2,(1,1):1/2} has
        // E[XY]=E[X]=0 and E[X]E[Y]=0 ⇒ Cov=0. (A clean finite witness of the
        // continuous symmetry argument; engine reproduces Cov=0.)
        calls: [
          'formatRational(covariance([{x:-1,y:1,p:1/2},{x:1,y:1,p:1/2}]))  // E[XY]−E[X]E[Y] gives Cov=0',
        ],
        answer: 'Cov=0, ρ=0 (but dependent)',
        verified: true,
      },
      hidden: {
        answer: 'Cov=0, ρ=0 (but dependent) — yet X and Y are dependent because Y=X² is a function of X.',
        approaches: [
          'Cov(X,X²)=E[X³]−E[X]E[X²]. Symmetry about 0 kills all odd moments: E[X³]=0 and E[X]=0, so Cov=0 ⇒ ρ=0.',
          'Independence fails because Y=X² is determined by X; ρ only measures the LINEAR relationship, and the dependence here is purely even/quadratic.',
        ],
        wrongTurns: [
          'concluding independence from Cov=0',
          'forgetting that ρ captures only linear association',
          'mis-computing E[X³] as nonzero for a symmetric X',
        ],
        hintLadder: [
          'Which moments of a symmetric-about-0 variable vanish, and which moment does Cov(X,X²) need?',
          'Cov(X,X²)=E[X³]−E[X]E[X²]; for a symmetric X both odd moments E[X³] and E[X] are forced to a single value — which?',
          'With those odd moments pinned, evaluate Cov; then separately ask whether knowing X determines Y (independence) — the two questions have different answers.',
        ],
        rubric: RUBRIC,
      },
      followUps: [
        'Give a different dependent-but-uncorrelated pair.',
        'What kind of dependence WOULD ρ detect?',
      ],
    }),
  )
  void covSym // computed as a sanity reference; the engine call above is the anchor.

  // FF2 — perfectly correlated table ρ=1
  questions.push(
    freeForm({
      id: 'ff-perfect-correlation-table',
      tier: 'hard',
      fingerprint: 'sem:perfect-corr-matched-bits',
      prompt:
        'Two 0/1 variables move in lockstep: P(0,0)=P(1,1)=1/2 and P(0,1)=P(1,0)=0. Compute Cov(X,Y) and the correlation ρ(X,Y). What value of ρ do you expect before computing, and why?',
      source:
        'Green Book p.47-48 (Cov definition) / randomservices.org — the ρ=±1 boundary case showing perfect linear dependence.',
      engineCheck: {
        module: MODULE,
        calls: [
          'formatRational(covariance(joint2x2(1,0,0,1,2)))  // Cov=1/4',
          'formatRational(rho(1/4,1/4,1/4).rho)             // ρ=1',
        ],
        answer: 'Cov=1/4, ρ=1',
        verified: true,
      },
      hidden: {
        answer: 'Cov=1/4, ρ=1 — perfect positive correlation, since Y=X exactly.',
        approaches: [
          'E[XY]=P(1,1)=1/2, E[X]=E[Y]=1/2 ⇒ Cov=1/2−1/4=1/4. Var(X)=Var(Y)=1/4 ⇒ ρ=(1/4)/√((1/4)(1/4))=1.',
          'Because Y=X with probability 1, the relationship is perfectly linear, so ρ must be exactly 1 — the computation confirms it.',
        ],
        wrongTurns: [
          'reporting ρ>1 from an arithmetic slip',
          'forgetting to normalize Cov by the standard deviations',
          'mixing up Cov (1/4) with ρ (1)',
        ],
        hintLadder: [
          'Read the table: with all mass on the diagonal, how are X and Y related as random variables?',
          'They take the same value every time — what does an exact functional relationship imply about where ρ must sit?',
          'Compute Cov=E[XY]−E[X]E[Y] from the (1,1) cell and the marginals, then normalize: ρ=Cov/√(VarX·VarY).',
        ],
        rubric: RUBRIC,
      },
      followUps: [
        'Change the table to P(0,1)=P(1,0)=1/2: now what are Cov and ρ?',
        'What is the maximum |Cov| achievable for two 0/1 variables each with mean 1/2?',
      ],
    }),
  )

  // FF3 — two independent dice: Cov and Var(sum) together
  questions.push(
    freeForm({
      id: 'ff-two-dice-cov-and-varsum',
      tier: 'hard',
      fingerprint: 'sem:two-indep-dice-cov-varsum',
      prompt:
        'You roll two independent fair six-sided dice, X₁ and X₂. State Cov(X₁,X₂) and Var(X₁+X₂), and explain why the covariance term drops out.',
      source:
        'Green Book p.47-48 ("General rules of variance and covariance") / randomservices.org — the independence ⇒ Cov=0, Var of a sum building block.',
      engineCheck: {
        module: MODULE,
        calls: [
          'formatRational(variance(diePmf(6)))                       // Var(die)=35/12',
          'formatRational(varianceOfSum(35/12, 35/12, 0))            // Var(X1+X2)=35/6',
        ],
        answer: 'Cov=0, Var(X₁+X₂)=35/6',
        verified: true,
      },
      hidden: {
        answer: 'Cov=0, Var(X₁+X₂)=35/6 (independence ⇒ Cov=0; 35/12+35/12=35/6).',
        approaches: [
          'Independent ⇒ Cov=0. Var(X₁+X₂)=Var(X₁)+Var(X₂)+2Cov=35/12+35/12+0=35/6.',
          'Each fair die has Var=35/12; for independent variables variances add.',
        ],
        wrongTurns: [
          'adding the means instead of the variances',
          'keeping a nonzero cross term despite independence',
          'using Var(die)=91/6 (that is E[X²], not the variance)',
        ],
        hintLadder: [
          'What does independence force the cross term Cov(X₁,X₂) to be in Var(X₁+X₂)?',
          'With that cross term gone, Var(X₁+X₂) reduces to a sum of the two single-die variances.',
          'Recall (or derive) the variance of one fair six-sided die, then combine the two pieces.',
        ],
        rubric: RUBRIC,
      },
      followUps: [
        'What is Cov(X₁, X₁+X₂)?',
        'How would Var(X₁+X₂) change if the dice were positively correlated?',
      ],
    }),
  )
}

// ── NO-LEAK guard (verbatim from scripts/validate-interview-packs.ts) ───────────
// Mirror the global validator's heuristic so the build fails fast if any hint
// rung 2/3 states the final answer. Run it here so regeneration can't reintroduce
// a leak that only the global script would catch.
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
}
function hintRungLeaks(answer: string, rungText: string): boolean {
  const esc = escapeRegExp(answer)
  if (answer.includes('/')) {
    return new RegExp(`(?<![\\d/])${esc}(?![\\d/])`).test(rungText)
  }
  const statedResult = new RegExp(`(?:=|⇒|is\\s+|:\\s*)\\s*${esc}\\b`).test(rungText)
  const trailingResult = new RegExp(`[=:]\\s*${esc}$`).test(rungText.trim())
  return statedResult || trailingResult
}

// ── Verify + de-dup ────────────────────────────────────────────────────────────
const seen = new Set<string>()
for (const q of questions) {
  if (seen.has(q.fingerprint)) throw new Error(`duplicate fingerprint: ${q.fingerprint}`)
  seen.add(q.fingerprint)
  if (q.hidden.hintLadder.length !== 3) throw new Error(`hintLadder must be 3 rungs: ${q.id}`)
  if (hintRungLeaks(q.engineCheck.answer, q.hidden.hintLadder[1]))
    throw new Error(`hint rung 2 leaks answer "${q.engineCheck.answer}" in ${q.id}: ${q.hidden.hintLadder[1]}`)
  if (hintRungLeaks(q.engineCheck.answer, q.hidden.hintLadder[2]))
    throw new Error(`hint rung 3 leaks answer "${q.engineCheck.answer}" in ${q.id}: ${q.hidden.hintLadder[2]}`)
  // hidden.answer must CONTAIN the verified engineCheck.answer (it may add a gloss
  // like "Cov=…, ρ=…"). For single-value questions they are equal.
  if (!q.hidden.answer.includes(q.engineCheck.answer)) {
    throw new Error(`answer mismatch in ${q.id}: engine=${q.engineCheck.answer} hidden=${q.hidden.answer}`)
  }
  // EXACT-RATIONAL guard: engineCheck.answer must be a rational/integer/range/pair,
  // never a bare decimal float.
  for (const tok of q.engineCheck.answer.split(/[\s,=]+/)) {
    if (/^-?\d+\.\d+$/.test(tok)) throw new Error(`float answer token "${tok}" in ${q.id}`)
  }
}

const byTier = (t: Tier) => questions.filter((q) => q.tier === t).length
const templated = questions.filter((q) => q.template).length

// ── Prompts (server-only; stripped by toClientPack) ────────────────────────────
const interviewerPrompt = [
  'ROLE',
  'You are a senior quantitative-research interviewer at a top trading desk (Jane Street / Citadel / IMC), running a live mock interview on COVARIANCE & CORRELATION. Be professional, probing, and fair-but-pressured. You are interviewing one candidate, right now, on the single question below.',
  '',
  'THE QUESTION (injected at runtime)',
  '- Prompt: {{prompt}}',
  '- Tier: {{tier}}  (hard | harder | brutal — calibrate pressure and follow-up depth)',
  '- Source: {{source}}  (your context only; never read it aloud)',
  '',
  'PROTOCOL',
  '1. Ask the question once, faithfully from {{prompt}}, then let the candidate drive. ONE question at a time — never stack asks or surface the follow-ups early.',
  '2. Make them think ALOUD. Before arithmetic, push for the model: "What are X and Y, what is their joint behavior, and which quantity are you actually computing — a covariance, a variance of a combination, ρ, or ρ²?"',
  "3. Probe, don't solve. Ask Socratic questions that test whether they've seen the covariance/correlation edge this problem turns on (see EDGE CASES). Do NOT do the derivation for them unless they are stuck.",
  '4. Release hints only when genuinely stuck or explicitly asked (see HINTS).',
  '5. After they COMMIT, work the follow-up chain (see FOLLOW-UPS).',
  '6. Then close (see SCORING).',
  '',
  'EDGE CASES TO PROBE (press the ones this question hinges on)',
  '- Covariance definition & bilinearity: Cov(X,Y)=E[XY]−E[X]E[Y]; Cov(X,X)=Var(X); Cov is bilinear, so Cov(aX+bY, Z)=a·Cov(X,Z)+b·Cov(Y,Z).',
  '- Variance of a combination: Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y) — do they remember the 2ab cross-term and its sign?',
  '- Uncorrelated ≠ independent: under symmetry Cov(X,X²)=0 yet X and X² are dependent — push them to name a zero-covariance-but-dependent pair.',
  '- Correlation is generically IRRATIONAL: ρ=Cov/(σ_Xσ_Y) usually has an irrational √(VarX·VarY); the graded quantity is therefore ρ², the covariance, the variance, or a provably-rational ρ (perfect-square variances, Pythagorean-pair inputs). Push them to recognize WHEN ρ itself is irrational (e.g. ρ(X₁,X₁+X₂)=1/√2, graded as ρ²=1/2) versus rational (Cov=12, VarX=9, VarY=25 ⇒ ρ=4/5).',
  '- 3-variable correlation range: given ρ(X,Y)=ρ₁ and ρ(Y,Z)=ρ₂, the admissible ρ(X,Z) ∈ [ρ₁ρ₂−√(1−ρ₁²)√(1−ρ₂²), ρ₁ρ₂+√(1−ρ₁²)√(1−ρ₂²)], with the bounds at the PSD/determinant boundary det = 1+2ρ₁ρ₂ρ−ρ₁²−ρ₂²−ρ² = 0; Pythagorean pairs (e.g. 4/5, 3/5) keep the √ rational.',
  '- Equicorrelation floor: n variables all pairwise-ρ are PSD only if ρ ≥ −1/(n−1) (eigenvalue 1+(n−1)ρ ≥ 0); the n=3 case gives −1/2.',
  '- Minimum-variance hedge ratio: β = Cov(A,B)/Var(B) minimizes Var(A−βB) — a covariance over a variance, always rational.',
  '- Order statistics: for two iid U(0,1), Cov(min,max)=1/36 and ρ(min,max)=1/2 (since min·max=X₁X₂, E[min]=1/3, E[max]=2/3, Var=1/18).',
  '',
  'HINTS — escalating, ONLY when stuck',
  'Use {{hidden.hintLadder}} = [nudge, stronger, near-reveal]. Release ONE rung at a time, in order, after a visible stuck-signal. The near-reveal points at the METHOD only — it must not state the final number.',
  '',
  'NO-ANSWER-LEAK (critical)',
  'Before the candidate commits, NEVER state, approximate, confirm, or deny the final answer, and NEVER reveal {{hidden.answer}}. Do not paste or paraphrase any part of the hidden record ({{hidden.answer}}, {{hidden.approaches}}, {{hidden.wrongTurns}}, {{hidden.hintLadder}}, {{hidden.rubric}}). If asked "is that right?" mid-solve, redirect ("walk me through why") rather than confirm.',
  '',
  'GROUNDING (critical)',
  'Treat {{hidden.answer}} and {{hidden.approaches}} as GROUND TRUTH — verified by this concept\'s exact-rational engine (src/engine/covariance.ts). Do NOT re-derive the math yourself and do NOT "correct" the ground truth even if your mental arithmetic disagrees. Accept ANY mathematically-equivalent exact form: an equal unreduced fraction, the "n/d" form, an integer, or the display form of an irrational ρ (e.g. "1/√2") whose ρ² is the graded value. Use {{hidden.wrongTurns}} to RECOGNIZE a misconception, not to lead the candidate into it. Grade ONLY against the rubric.',
  '',
  'FOLLOW-UPS — after they commit',
  'Ask {{followUps}} in order, one at a time (typical chain: now compute ρ² and say whether ρ is rational, change a sign and re-derive Var(aX+bY), generalize the correlation bound to the PSD condition, or take n→∞ on the equicorrelation floor). Keep the no-leak and hint rules in force.',
  '',
  'SCORING — close the interview',
  'Give structured feedback, then a numeric score against {{hidden.rubric}}: rate correctness, approach, rigor, communication, speed each 1–5 with one line, then an overall 1–5 hire-signal. Tie every judgment to the rubric and cite the moment that earned or cost points.',
  '',
  'INJECTION NOTE',
  "At runtime the live feature replaces every {{...}} placeholder with the drawn question's fields; treat the filled-in values as the entire ground truth for this interview.",
].join('\n')

const generatorPrompt = [
  'ROLE',
  'You generate ONE fresh, hard, real-quant-style COVARIANCE & CORRELATION interview question on demand, to top up a pre-built pool without repeating one a student has seen. Every question must be (a) a realistic quant-interview question anchored to the canon, (b) engine-verifiable before serving, and (c) structurally new vs an avoid-list. Otherwise you REFUSE. Output is a single JSON object and nothing else.',
  '',
  'SCOPE — only the covariance/correlation canon and direct relatives',
  '- Cov(X,Y)=E[XY]−E[X]E[Y], bilinearity, and Cov(X,X)=Var(X).',
  '- Var(aX+bY)=a²VarX+b²VarY+2ab·Cov.',
  '- ρ=Cov/(σ_Xσ_Y), ρ², and the rational-only rule.',
  '- the 3-variable correlation range via the PSD/determinant condition; the equicorrelation floor −1/(n−1).',
  '- the minimum-variance hedge ratio β=Cov/Var; the min/max order-statistic of two iid uniforms.',
  '',
  'REAL-QUANT-STYLE (mandatory)',
  'Anchor every question to the actual canon: the Green Book covariance/correlation § (Cov definition, variance rules, ρ), the 3-variable correlation-range classic, the min/max order-statistic problem, the optimal hedge ratio, and the equicorrelation minimum. It must read like a real desk question — NEVER an arbitrary engine-solvable puzzle.',
  '',
  'PREFER TEMPLATES (first choice); free-form only as fallback',
  'Parameterize an engine-backed template and set template.id + template.params:',
  '- variance of a single variable   → tmpl-variance       → variance(pmf)   (fair die or Bernoulli; only rational-staying params)',
  '- covariance from a joint pmf      → tmpl-cov-joint      → covariance(joint)',
  '- covariance of two indicators     → tmpl-cov-indicator  → covarianceIndicators(pAB, pA, pB)',
  '- variance of a linear combination → tmpl-var-linear     → varianceOfSum(varX, varY, cov)  for Var(aX+bY), integer a,b only',
  '- covariance by bilinearity        → tmpl-cov-bilinear   → covBilinear(varX, covXY)  for Cov(X,X+Y)',
  '- correlation (perfect-square)     → tmpl-rho-perfsq     → rho(cov, varX, varY) / rhoSquared(cov, varX, varY)  (perfect-square variances ⇒ rational ρ; else grade ρ²)',
  '- 3-variable correlation range     → tmpl-corr-range     → corrRange(rho1, rho2)  (Pythagorean-pair inputs ONLY)',
  '- PSD-determinant boundary         → tmpl-psd-det        → psdDeterminant3(r12, r13, r23)',
  '- equicorrelation minimum          → tmpl-equicorr-min   → equicorrelationMin(n)  = −1/(n−1)',
  '- minimum-variance hedge ratio     → tmpl-hedge-ratio    → optimalHedgeRatio(covAB, varB)',
  '- min/max order statistic          → tmpl-order-stat     → orderStatCovUniform()  (Cov=1/36, ρ=1/2)',
  'Emit free-form ONLY if no template fits, with fingerprint "sem:<hash>".',
  '',
  'ENGINE-VERIFY-BEFORE-SERVE (hard fence)',
  'Output must carry the exact call(s) to reproduce the answer with src/engine/covariance.ts so the feature can RUN the engine and REJECT anything unverifiable. In engineCheck put module = "src/engine/covariance.ts", calls = the exact call(s) with concrete args, answer = the exact engine value. CRITICAL EXACT-RATIONAL rule: every answer MUST be an exact rational ("n/d" or an integer) or a ρ²/covariance/variance value — NEVER a float. For ρ, only emit a rational ρ when √(VarX·VarY) is exact (the reduced numerator AND denominator of VarX·VarY are both perfect squares); otherwise grade ρ² instead. corrRange inputs MUST be Pythagorean pairs so √(1−ρ₁²) and √(1−ρ₂²) are rational. Variance/covariance pmfs and joints must be valid (probabilities are rationals summing to 1).',
  '',
  'AVOID-LIST / NO-OVERLAP',
  "You are given avoidList (the student's seen-set ∪ the global pool). Your fingerprint MUST NOT be in it. Fingerprint = \"<templateId>:<normalized-params>\" (e.g. tmpl-rho-perfsq:cov=12,vx=9,vy=25) or \"sem:<hash>\" for free-form. If it collides, change params/structure or REFUSE.",
  '',
  'OUTPUT SCHEMA (emit EXACTLY one JSON object, no prose, no code fences)',
  '{ "tier": "hard|harder|brutal", "fingerprint": "...", "template": { "id": "...", "params": {} }, "prompt": "...", "source": "...", "engineCheck": { "module": "src/engine/covariance.ts", "calls": ["..."], "answer": "..." }, "hidden": { "answer": "...", "approaches": ["..."], "wrongTurns": ["..."], "hintLadder": ["nudge","stronger","near-reveal"], "rubric": { "correctness": "...", "approach": "...", "rigor": "...", "communication": "...", "speed": "..." } }, "followUps": ["...","..."] }',
  '',
  'FIELD RULES',
  '- tier floor is "hard" (always harder than any lesson mastery challenge). hintLadder is EXACTLY 3 rungs; the near-reveal gives METHOD only, never the final number.',
  '- hidden.answer MUST equal engineCheck.answer (the verified value). For an irrational ρ, grade ρ² and you may add the display form (e.g. "1/√2") as a gloss only.',
  '- source: anchor to the Green Book covariance/correlation § (Zhou pp.47-48, the 3-variable range pp.26-29, the max/min order statistic pp.51-52, the hedge ratio p.48) or another sourced real quant-interview question.',
  '',
  'SELF-REJECTION',
  'If you cannot produce a question that is simultaneously real-quant-style + anchored, engine-verifiable, exact-rational (no float; ρ rational only when √(VarX·VarY) is exact), and structurally new, output exactly: { "refusal": true, "reason": "<not-anchored | not-engine-verifiable | not-exact-rational | out-of-range | no-new-fingerprint>" }',
].join('\n')

const pack = {
  version: 1 as const,
  kind: 'interview-pack' as const,
  courseId: 'course-covariance',
  concept: 'Covariance & Correlation',
  greenBookAnchor:
    'A Practical Guide To Quantitative Finance Interviews (Xinfeng Zhou): Covariance / "General rules of variance and covariance" / correlation ρ on pp.47-48 (lines 7502-7660); "max/min correlation of 3 variables" pp.26-29 (lines 4579-4943, range min 7/25, max 1); "Correlation of max and min" pp.51-52 (lines 8059-8175, ρ=1/2); optimal hedge ratio p.48 (line 7647). Grounded by the concept source-dossier (13 sourced exact-rational problems).',
  engineModule: 'src/engine/covariance.ts',
  generator: 'interviews/_build/build-covariance-pack.ts',
  note: 'Dormant capstone asset: committed but NOT seeded/deployed (the seed glob matches only fixtures/course-*.json | fixtures/lesson-*.json; this lives under interviews/). Self-describing via `version`. EXACT-RATIONAL contract (ADR-0005): every engineCheck.answer is reproduced by src/engine/covariance.ts as an exact rational — never a float ρ; ρ is graded only when √(VarX·VarY) is exact, otherwise ρ²/covariance/variance is graded, and corrRange uses Pythagorean-pair inputs.',
  counts: {
    total: questions.length,
    byTier: { hard: byTier('hard'), harder: byTier('harder'), brutal: byTier('brutal') },
    templated,
    freeForm: questions.length - templated,
  },
  interviewerPrompt,
  generatorPrompt,
  templates: [
    { id: 'tmpl-variance', title: 'Variance of a finite distribution', source: 'GB p.47-48', description: 'variance(pmf): fair die or Bernoulli indicator.', engineModule: MODULE },
    { id: 'tmpl-cov-joint', title: 'Covariance from a joint pmf', source: 'GB p.47-48', description: 'covariance(joint): Cov(X,Y)=E[XY]−E[X]E[Y] from a 2×2 table.', engineModule: MODULE },
    { id: 'tmpl-cov-indicator', title: 'Indicator covariance', source: 'GB p.47-48', description: 'covarianceIndicators(pAB,pA,pB)=P(A∩B)−P(A)P(B).', engineModule: MODULE },
    { id: 'tmpl-var-linear', title: 'Variance of a linear combination', source: 'GB p.48', description: 'varianceOfSum: Var(aX+bY)=a²VarX+b²VarY+2ab·Cov.', engineModule: MODULE },
    { id: 'tmpl-cov-bilinear', title: 'Cov(X, X+Y) by bilinearity', source: 'GB p.48', description: 'covBilinear(varX,covXY)=Var(X)+Cov(X,Y).', engineModule: MODULE },
    { id: 'tmpl-rho-perfsq', title: 'Correlation from perfect-square variances', source: 'GB p.48', description: 'rho/rhoSquared: rational ρ when σ_Xσ_Y is exact, else ρ².', engineModule: MODULE },
    { id: 'tmpl-corr-range', title: '3-variable correlation range', source: 'GB p.26-29', description: 'corrRange(ρ1,ρ2): the ρ(X,Z) interval for Pythagorean pairs.', engineModule: MODULE },
    { id: 'tmpl-psd-det', title: 'PSD determinant of a 3×3 correlation matrix', source: 'GB p.29', description: 'psdDeterminant3(r12,r13,r23): feasibility/boundary test.', engineModule: MODULE },
    { id: 'tmpl-equicorr-min', title: 'Minimum equicorrelation', source: 'atypicalquant / GB p.29', description: 'equicorrelationMin(n) = −1/(n−1).', engineModule: MODULE },
    { id: 'tmpl-hedge-ratio', title: 'Minimum-variance hedge ratio', source: 'GB p.48', description: 'optimalHedgeRatio(cov,varB)=Cov(A,B)/Var(B).', engineModule: MODULE },
    { id: 'tmpl-order-stat', title: 'Cov/ρ of min & max of two iid uniforms', source: 'GB p.51-52', description: 'orderStatCovUniform(): Cov=1/36, ρ=1/2.', engineModule: MODULE },
  ],
  questions,
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..')
writeFileSync(join(outDir, 'course-covariance.json'), JSON.stringify(pack, null, 2) + '\n')

// ── Markdown mirror ─────────────────────────────────────────────────────────────
const md: string[] = []
md.push(`# Interview Pack — ${pack.concept} (\`${pack.courseId}\`)`)
md.push('')
md.push(`> Dormant capstone asset — committed, NOT seeded/deployed. Regenerate with \`./node_modules/.bin/tsx ${pack.generator}\`.`)
md.push('')
md.push(`**Anchor:** ${pack.greenBookAnchor}`)
md.push('')
md.push(`**Engine:** \`${pack.engineModule}\` — every answer is engine-verified (exact rational, no floats).`)
md.push('')
md.push(`**Counts:** ${pack.counts.total} questions (hard ${pack.counts.byTier.hard}, harder ${pack.counts.byTier.harder}, brutal ${pack.counts.byTier.brutal}; ${pack.counts.templated} templated, ${pack.counts.freeForm} free-form).`)
md.push('')
md.push('## Templates')
md.push('')
for (const t of pack.templates) md.push(`- \`${t.id}\` — ${t.title} (${t.source}): ${t.description}`)
md.push('')
md.push('## Questions')
md.push('')
for (const q of questions) {
  md.push(`### ${q.id}  \`${q.tier}\``)
  md.push('')
  md.push(`**Prompt.** ${q.prompt}`)
  md.push('')
  md.push(`- **Answer (engine-verified):** \`${q.hidden.answer}\``)
  md.push(`- **Engine check:** \`${q.engineCheck.calls.join('; ')}\` → \`${q.engineCheck.answer}\``)
  md.push(`- **Source:** ${q.source}`)
  md.push(`- **Approaches:** ${q.hidden.approaches.join(' / ')}`)
  md.push(`- **Hint ladder:** ${q.hidden.hintLadder.map((h, i) => `(${i + 1}) ${h}`).join(' ')}`)
  md.push(`- **Follow-ups:** ${q.followUps.join(' / ')}`)
  md.push('')
}
writeFileSync(join(outDir, 'course-covariance.md'), md.join('\n') + '\n')

console.log(
  `✓ wrote interviews/course-covariance.json (${questions.length} questions: hard ${byTier('hard')}, harder ${byTier('harder')}, brutal ${byTier('brutal')}; ${templated} templated, ${questions.length - templated} free-form)`,
)
console.log(`✓ wrote interviews/course-covariance.md`)
