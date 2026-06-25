import type { Rational } from './types'
import { reduce, ratAdd, ratSub, ratMul, ratDiv } from './automaton'

const ONE: Rational = { n: 1, d: 1 }

// --- internal helpers ---
function ratPow(r: Rational, k: number): Rational {        // k >= 0
  let acc = ONE
  for (let i = 0; i < k; i++) acc = ratMul(acc, r)
  return acc
}

// odds n:d  ->  probability n/(n+d). Exact. (Exposed: the renderer shows odds as a probability bar.)
export function oddsToProb(o: Rational): Rational {
  return reduce(o.n, o.n + o.d)
}

// The "small n/d helper": reduced "n/d", or just "n" when the denominator is 1.
export function formatRational(r: Rational): string {
  const x = reduce(r.n, r.d)
  return x.d === 1 ? String(x.n) : `${x.n}/${x.d}`
}

// --- frozen public API ---

// Two-hypothesis posterior P(H|E) = prior·pH / (prior·pH + (1-prior)·pNotH).
export function bayesUpdate(prior: Rational, pEgivenH: Rational, pEgivenNotH: Rational): Rational {
  const num = ratMul(prior, pEgivenH)
  const other = ratMul(ratSub(ONE, prior), pEgivenNotH)
  return ratDiv(num, ratAdd(num, other))
}

// General n-hypothesis posterior, normalized: posterior_i = prior_i·L_i / Σ_j prior_j·L_j.
export function bayesPosterior(priors: Rational[], likelihoods: Rational[]): Rational[] {
  const unnorm = priors.map((p, i) => ratMul(p, likelihoods[i]))
  const Z = unnorm.reduce((a, b) => ratAdd(a, b), { n: 0, d: 1 })
  return unnorm.map((u) => ratDiv(u, Z))
}

// Odds form: posterior odds = prior odds × likelihood ratio.
export function posteriorOdds(priorOdds: Rational, likelihoodRatio: Rational): Rational {
  return ratMul(priorOdds, likelihoodRatio)
}

// Fold k independent identical observations (today's posterior is tomorrow's prior).
// = prior·pH^k / (prior·pH^k + (1-prior)·pNotH^k). Equals iterating bayesUpdate k times.
export function sequentialPosterior(
  prior: Rational, pEgivenH: Rational, pEgivenNotH: Rational, k: number,
): Rational {
  const num = ratMul(prior, ratPow(pEgivenH, k))
  const other = ratMul(ratSub(ONE, prior), ratPow(pEgivenNotH, k))
  return ratDiv(num, ratAdd(num, other))
}

// Natural frequencies over a population. Returns exact counts + PPV.
//   sick = prior·pop; healthy = (1-prior)·pop
//   tp = sick·sens; fn = sick·(1-sens); tn = healthy·spec; fp = healthy·(1-spec)
//   ppv = tp / (tp + fp)
export function naturalFrequencies(
  prior: Rational, sensitivity: Rational, specificity: Rational, population: number,
): { tp: Rational; fp: Rational; fn: Rational; tn: Rational; ppv: Rational } {
  const pop: Rational = { n: population, d: 1 }
  const sick = ratMul(prior, pop)
  const healthy = ratMul(ratSub(ONE, prior), pop)
  const tp = ratMul(sick, sensitivity)
  const fn = ratMul(sick, ratSub(ONE, sensitivity))
  const tn = ratMul(healthy, specificity)
  const fp = ratMul(healthy, ratSub(ONE, specificity))
  const ppv = ratDiv(tp, ratAdd(tp, fp))
  return { tp, fp, fn, tn, ppv }
}
