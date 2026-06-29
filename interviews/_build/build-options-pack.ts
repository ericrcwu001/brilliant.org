// Generator for the Options, Payoffs & No-Arbitrage capstone Interview Pack
// (dormant asset — committed but NOT seeded/deployed). Imports the concept's pure
// exact-rational engine, builds a pool of real-quant-style options questions,
// ENGINE-VERIFIES every answer, de-dups by fingerprint, and writes:
//   interviews/course-options.json  (canonical, versioned, self-describing)
//   interviews/course-options.md    (human-readable mirror)
// Run:  ./node_modules/.bin/tsx interviews/_build/build-options-pack.ts
//
// EXACT-RATIONAL CONTRACT (ADR-0005): every engineCheck.answer is an exact
// rational ("n/d" or integer) — never a float. The build asserts every answer
// matches the value the engine actually returns (src/engine/options.ts).

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  reduce,
  formatRational,
  spreadPayoff,
  parityGap,
  paritySolve,
  callBounds,
  putBounds,
  riskNeutralQ,
  binomialPrice,
  replicate,
  treeTerminals,
  treeWeights,
  pathCount,
  hedgeRatio,
  minVarWeights,
  oneTouchPrice,
  greekSign,
  type BigRational,
  type Leg,
} from '../../src/engine/options'

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

const MODULE = 'src/engine/options.ts'
const fr = formatRational
const B = (n: number, d = 1): BigRational => reduce(BigInt(n), BigInt(d))
function F(s: string): BigRational {
  const m = s.match(/^(-?\d+)(?:\/(-?\d+))?$/)
  if (!m) throw new Error(`bad frac ${s}`)
  return reduce(BigInt(m[1]), BigInt(m[2] ?? '1'))
}

const RUBRIC: Hidden['rubric'] = {
  correctness:
    'matches the engine value exactly (exact rational n/d, integer, or signed-integer Greek sign — never a Black-Scholes float, implied vol, or sqrt-of-variance)',
  approach:
    'uses the no-arbitrage spine directly — piecewise-linear payoff algebra, put-call parity C−P=S−K·D, replication Delta=(V_u−V_d)/(S(u−d)) with bond B, or the risk-neutral q=(R−d)/(u−d) — not a guess or a memorized Black-Scholes number',
  rigor:
    'keeps every quantity exact and rational; knows q is the no-arb weight (not the real p, not a Bayes posterior) and that Black-Scholes / continuous Greeks are the irrational display-only limit',
  communication: 'names the identity or hedge being used and walks each leg/step cleanly',
  speed:
    'reaches a clean exact rational without arithmetic drift; tier-scaled — a brutal multi-step replication is judged on the brutal bar, not the hard one',
}

const questions: Question[] = []

// ── Leg constructor helpers ────────────────────────────────────────────────────
function makeLegs(structure: string, strikes: string): Leg[] {
  const parts = strikes.split('-')
  const K0 = F(parts[0])
  const K1 = parts[1] !== undefined ? F(parts[1]) : undefined
  const K2 = parts[2] !== undefined ? F(parts[2]) : undefined
  switch (structure) {
    case 'call':
      return [{ kind: 'call', K: K0, qty: B(1) }]
    case 'put':
      return [{ kind: 'put', K: K0, qty: B(1) }]
    case 'straddle':
      return [
        { kind: 'call', K: K0, qty: B(1) },
        { kind: 'put', K: K0, qty: B(1) },
      ]
    case 'bull':
      return [
        { kind: 'call', K: K0, qty: B(1) },
        { kind: 'call', K: K1!, qty: B(-1) },
      ]
    case 'butterfly':
      return [
        { kind: 'call', K: K0, qty: B(1) },
        { kind: 'call', K: K1!, qty: B(-2) },
        { kind: 'call', K: K2!, qty: B(1) },
      ]
    case 'strangle':
      return [
        { kind: 'put', K: K0, qty: B(1) },
        { kind: 'call', K: K1!, qty: B(1) },
      ]
    case 'protective-put':
      return [
        { kind: 'stock', qty: B(1) },
        { kind: 'put', K: K0, qty: B(1) },
      ]
    default:
      throw new Error(`makeLegs: unknown structure ${structure}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1 — tmpl-payoff
//   params: { structure, strikes, ST } (all strings)
// ─────────────────────────────────────────────────────────────────────────────
function buildPayoff(structure: string, strikes: string, ST: string, tier: Tier): Question {
  const legs = makeLegs(structure, strikes)
  const ans = fr(spreadPayoff(legs, F(ST)))
  const fp = `tmpl-payoff:structure=${structure},strikes=${strikes},ST=${ST}`
  const id = `tmpl-payoff#${structure}-${strikes.replace(/-/g, '_')}-ST${ST}`
  const kParts = strikes.split('-')
  const K0s = kParts[0]
  const K1s = kParts[1]
  const K2s = kParts[2]
  const src_payoff =
    'Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)'

  let prompt: string
  let approaches: string[]
  let wrongTurns: string[]
  let hintLadder: [string, string, string]
  let followUps: string[]
  const source = src_payoff

  switch (structure) {
    case 'call': {
      const ITM = F(ST).n > F(K0s).n * F(ST).d // S_T > K numerically (both integers here)
      prompt = `A European call with strike K = ${K0s} expires at S_T = ${ST}. What is the call payoff at expiry?`
      approaches = [
        `Payoff = max(S_T − K, 0) = max(${ST} − ${K0s}, 0) = ${ans}.`,
        `Call pays only when S_T > K; since S_T = ${ST} ${ITM ? '>' : '<'} K = ${K0s}, payoff = ${ans}.`,
      ]
      wrongTurns = [
        'using the put formula max(K−S_T,0) instead of max(S_T−K,0)',
        'omitting the max with zero — the option cannot pay a negative amount',
        'subtracting in the wrong order (K − S_T for a call)',
      ]
      if (ITM) {
        hintLadder = [
          `The call pays when S_T exceeds the strike. Is S_T = ${ST} above K = ${K0s}?`,
          `Call payoff formula: max(S_T − K, 0). With S_T above K, which branch of the max applies?`,
          `Since S_T > K here, max picks the first term; subtract K from S_T to find the payoff.`,
        ]
      } else {
        hintLadder = [
          `The call pays only when the stock finishes above the strike. Does S_T = ${ST} exceed K = ${K0s}?`,
          `Call payoff: max(S_T − K, 0). With S_T below K, the inner quantity is negative; what does max return?`,
          `When S_T − K is negative, max(·, 0) returns the floor — the call simply expires worthless.`,
        ]
      }
      followUps = [
        `If you also hold a put at K = ${K0s} (a straddle), what is the combined payoff at S_T = ${ST}?`,
        `At what S_T does this call first pay a positive amount at expiry?`,
      ]
      break
    }
    case 'put': {
      const ITM = F(K0s).n > F(ST).n
      prompt = `A European put with strike K = ${K0s} expires at S_T = ${ST}. What is the put payoff at expiry?`
      approaches = [
        `Payoff = max(K − S_T, 0) = max(${K0s} − ${ST}, 0) = ${ans}.`,
        `Put pays when K > S_T; since K = ${K0s} ${ITM ? '>' : '<='} S_T = ${ST}, payoff = ${ans}.`,
      ]
      wrongTurns = [
        'using max(S_T−K,0) — that is the call payoff, not the put',
        'forgetting the floor at zero (option expires, not negative)',
        'subtracting S_T from zero instead of K from S_T',
      ]
      if (ITM) {
        hintLadder = [
          `The put pays when the stock finishes below the strike. Is S_T = ${ST} below K = ${K0s}?`,
          `Put payoff formula: max(K − S_T, 0). With K above S_T, which branch of the max applies?`,
          `Since K > S_T, max picks the first term; subtract S_T from K to find the payoff.`,
        ]
      } else {
        hintLadder = [
          `The put pays when the stock finishes below K. Does S_T = ${ST} lie below K = ${K0s}?`,
          `Put payoff: max(K − S_T, 0). With S_T above K, is K − S_T positive or negative?`,
          `When K − S_T is negative, max(·, 0) returns the floor — the put expires worthless.`,
        ]
      }
      followUps = [
        `By put-call parity (r = 0), if the call struck at K = ${K0s} costs C, what must the put cost?`,
        `What is the straddle payoff (long call + long put at K = ${K0s}) at S_T = ${ST}?`,
      ]
      break
    }
    case 'protective-put': {
      const putITM = F(K0s).n > F(ST).n
      prompt = `A protective put: long one share and long a put with strike K = ${K0s}. At expiry S_T = ${ST}, what is the total position payoff?`
      approaches = [
        `Stock: ${ST}. Put: max(${K0s}−${ST},0) = ${putITM ? String(Number(K0s) - Number(ST)) : '0'}. Total = ${ans}.`,
        `Protective-put payoff = max(S_T, K). With S_T = ${ST}, K = ${K0s}: max(${ST},${K0s}) = ${ans}.`,
      ]
      wrongTurns = [
        'computing only the put leg and ignoring the stock',
        'using max(S_T−K,0) for the put instead of max(K−S_T,0)',
        'forgetting the stock contributes S_T at expiry, not S_0',
      ]
      if (putITM) {
        hintLadder = [
          `Two legs: long stock (payoff S_T) and long put (payoff max(K−S_T,0)). Evaluate each at the given S_T, then add.`,
          `With S_T below the strike K, the put is in the money; compute max(K−S_T,0) and the stock payoff S_T separately, then sum.`,
          `The two legs together yield S_T + (K − S_T) when S_T < K — the S_T terms cancel, leaving just the strike value.`,
        ]
      } else {
        hintLadder = [
          `Two legs: long stock (payoff S_T) and long put (payoff max(K−S_T,0)). Evaluate each at the given S_T, then add.`,
          `With S_T above the strike K, the put is out of the money and expires worthless; which leg is the sole contributor?`,
          `Only the stock contributes at expiry; the total payoff equals the stock's terminal value S_T alone.`,
        ]
      }
      followUps = [
        `Show that the protective-put payoff equals max(S_T, K) algebraically.`,
        `Put-call parity links C + PV(K) = S + P. How does a protective put relate to a call plus a bond?`,
      ]
      break
    }
    case 'straddle': {
      const above = F(ST).n >= F(K0s).n
      prompt = `A long straddle: long a call and a put, both struck at K = ${K0s}. At expiry S_T = ${ST}, what is the total straddle payoff? (GB §6.3 L12552)`
      approaches = [
        `Call payoff: max(${ST}−${K0s},0). Put payoff: max(${K0s}−${ST},0). Sum = ${ans}.`,
        `Straddle payoff = |S_T − K| = |${ST} − ${K0s}| = ${ans}.`,
      ]
      wrongTurns = [
        'adding two call payoffs (or two put payoffs) instead of one of each',
        'using only one of the two legs and forgetting the other',
        'confusing straddle payoff with the net premium paid',
      ]
      if (above) {
        hintLadder = [
          `Straddle = long call + long put at K = ${K0s}. Evaluate each leg's payoff at S_T = ${ST} and add.`,
          `Call payoff: max(S_T − K, 0) with S_T > K — this is positive. Put payoff: max(K − S_T, 0) with K < S_T — what does max return?`,
          `The put expires worthless when S_T > K; total payoff equals only the call's contribution. Evaluate max(S_T − K, 0) with these values.`,
        ]
      } else {
        hintLadder = [
          `Straddle = long call + long put at K = ${K0s}. Evaluate each at S_T = ${ST} and add.`,
          `Put payoff: max(K − S_T, 0) with K > S_T — this is positive. Call payoff: max(S_T − K, 0) with S_T < K — what does max return?`,
          `The call expires worthless when S_T < K; total payoff equals only the put's contribution. Evaluate max(K − S_T, 0) with these values.`,
        ]
      }
      followUps = [
        `Why does the straddle payoff equal |S_T − K|? Verify the formula for both cases S_T > K and S_T < K.`,
        `If the combined straddle premium is ${ans}, for what two values of S_T does the position break even?`,
      ]
      break
    }
    case 'bull': {
      const K0n = Number(K0s), K1n = Number(K1s!), STn = Number(ST)
      prompt = `A bull call spread: long call at K = ${K0s}, short call at K = ${K1s}. At expiry S_T = ${ST}, what is the net payoff? (GB Table 6.3 L12449)`
      approaches = [
        `Long call (K=${K0s}): max(${ST}−${K0s},0) = ${Math.max(STn - K0n, 0)}. Short call (K=${K1s}): −max(${ST}−${K1s},0) = ${-Math.max(STn - K1n, 0)}. Net = ${ans}.`,
        `Bull spread payoff is capped at K2 − K1 = ${K1n - K0n}. With S_T = ${STn}: net = ${ans}.`,
      ]
      wrongTurns = [
        'forgetting to subtract the short call (treating only the long call)',
        'adding both payoffs instead of netting long minus short',
        'confusing which strike is the long and which is the short leg',
      ]
      if (STn <= K0n) {
        hintLadder = [
          `Bull spread: +call(K=${K0s}) − call(K=${K1s}). S_T = ${ST} is below both strikes.`,
          `Long call (K=${K0s}): max(S_T − K, 0) with S_T < K — what is the payoff? Short call (K=${K1s}): similarly.`,
          `Both calls expire worthless when S_T is below the lower strike; compute the net of the two floor values.`,
        ]
      } else if (STn >= K1n) {
        hintLadder = [
          `Bull spread: +call(K=${K0s}) − call(K=${K1s}). S_T = ${ST} exceeds both strikes — both calls are in the money.`,
          `Long call (K=${K0s}): payoff = S_T − K0. Short call (K=${K1s}): payoff = −(S_T − K1). Net = (S_T − K0) − (S_T − K1).`,
          `The S_T terms cancel, leaving K1 − K0 = ${K1n} − ${K0n}; evaluate that difference.`,
        ]
      } else {
        hintLadder = [
          `Bull spread: +call(K=${K0s}) − call(K=${K1s}). S_T = ${ST} is between the two strikes.`,
          `Long call (K=${K0s}): S_T > K0 so it is in the money — compute max(S_T − ${K0s}, 0). Short call (K=${K1s}): S_T < K1 — what does it contribute?`,
          `Only the lower-strike call is in the money; the upper call expires worthless. Net payoff equals the long call's payoff only.`,
        ]
      }
      followUps = [
        `What is the maximum payoff for this bull spread, and at what stock price is it achieved?`,
        `How does the payoff profile change if you reverse the position (bear spread)?`,
      ]
      break
    }
    case 'butterfly': {
      const K0n = Number(K0s), K1n = Number(K1s!), K2n = Number(K2s!), STn = Number(ST)
      const p0 = Math.max(STn - K0n, 0)
      const p1 = Math.max(STn - K1n, 0)
      const p2 = Math.max(STn - K2n, 0)
      prompt = `A long butterfly: +1 call at K = ${K0s}, −2 calls at K = ${K1s}, +1 call at K = ${K2s}. At expiry S_T = ${ST}, what is the total payoff? (GB §6.3 dossier problem #12)`
      approaches = [
        `+call(${K0s}): max(${ST}−${K0s},0)=${p0}; −2×call(${K1s}): −2·max(${ST}−${K1s},0)=${-2 * p1}; +call(${K2s}): max(${ST}−${K2s},0)=${p2}. Total = ${ans}.`,
        `Butterfly peaks at middle strike K=${K1s}; payoff = max(S_T−K0,0) − 2·max(S_T−K1,0) + max(S_T−K2,0) = ${ans}.`,
      ]
      wrongTurns = [
        'treating the middle leg as −1 instead of −2',
        'summing payoffs without applying the signed quantities (+1, −2, +1)',
        'forgetting to apply max(·,0) to each leg before multiplying',
      ]
      hintLadder = [
        `Three legs with quantities +1, −2, +1 at strikes ${K0s}, ${K1s}, ${K2s}. Evaluate max(S_T − K, 0) at each strike at S_T = ${ST}.`,
        `Compute each raw payoff: max(${ST}−${K0s},0), max(${ST}−${K1s},0), max(${ST}−${K2s},0) — apply the max before multiplying by quantity.`,
        `Multiply each payoff by its signed quantity (+1, −2, +1 respectively) and sum the three products.`,
      ]
      followUps = [
        `Sketch the butterfly payoff profile: for what range of S_T is the payoff positive?`,
        `Decompose this butterfly into two bull spreads and verify the payoff matches.`,
      ]
      break
    }
    case 'strangle': {
      const K0n = Number(K0s), K1n = Number(K1s!), STn = Number(ST)
      const putPayoff = Math.max(K0n - STn, 0)
      const callPayoff = Math.max(STn - K1n, 0)
      prompt = `A long strangle: long put at K = ${K0s} and long call at K = ${K1s}. At expiry S_T = ${ST}, what is the combined payoff? (GB §6.3 dossier problem #13)`
      approaches = [
        `Put (K=${K0s}): max(${K0s}−${ST},0)=${putPayoff}. Call (K=${K1s}): max(${ST}−${K1s},0)=${callPayoff}. Total = ${ans}.`,
        `Strangle pays outside [${K0s},${K1s}]; S_T = ${STn}${STn < K0n ? ' < ' + K0s + ' (put ITM)' : STn > K1n ? ' > ' + K1s + ' (call ITM)' : ' between strikes (both OTM)'}. Total = ${ans}.`,
      ]
      wrongTurns = [
        'using a call formula for the put leg (max(S_T−K,0) instead of max(K−S_T,0))',
        'using the same strike for both legs (that is a straddle)',
        'adding the payoffs of two calls (or two puts) instead of one of each at different strikes',
      ]
      if (putPayoff > 0 && callPayoff === 0) {
        hintLadder = [
          `Strangle: long put (K=${K0s}) + long call (K=${K1s}). Evaluate each at S_T = ${ST}.`,
          `Put payoff: max(K − S_T, 0) with K=${K0s}, S_T=${ST} — is K > S_T? Call payoff: max(S_T − K, 0) with K=${K1s} — is S_T > ${K1s}?`,
          `Only the put is in the money here; the call expires worthless. Evaluate max(K_put − S_T, 0) with K_put = ${K0s}.`,
        ]
      } else if (callPayoff > 0 && putPayoff === 0) {
        hintLadder = [
          `Strangle: long put (K=${K0s}) + long call (K=${K1s}). Evaluate each at S_T = ${ST}.`,
          `Call payoff: max(S_T − K, 0) with S_T=${ST}, K=${K1s} — is S_T > K? Put payoff: max(K − S_T, 0) with K=${K0s} — is K > S_T?`,
          `Only the call is in the money here; the put expires worthless. Evaluate max(S_T − K_call, 0) with K_call = ${K1s}.`,
        ]
      } else {
        hintLadder = [
          `Strangle: long put (K=${K0s}) + long call (K=${K1s}). Evaluate each at S_T = ${ST}.`,
          `S_T = ${ST} sits between the two strikes. For the put (K=${K0s}): is K > S_T? For the call (K=${K1s}): is S_T > K?`,
          `A strangle pays only when S_T is outside [K_put, K_call]; when S_T is between the strikes, both legs expire worthless.`,
        ]
      }
      followUps = [
        `How does a strangle differ from a straddle with K = ${K1s}? Which has a lower upfront premium?`,
        `At what pair of stock prices does this strangle break even (ignoring premium)?`,
      ]
      break
    }
    default:
      throw new Error(`buildPayoff: unknown structure ${structure}`)
  }

  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-payoff', params: { structure, strikes, ST } },
    prompt,
    source,
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(spreadPayoff(legs('${structure}','${strikes}'),F('${ST}')))`],
      answer: ans,
      verified: true,
    },
    hidden: { answer: ans, approaches, wrongTurns, hintLadder, rubric: RUBRIC },
    followUps,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2 — tmpl-parity-solve
//   params: { solveFor:'C'|'P', S, K, D, premium } (all strings)
// ─────────────────────────────────────────────────────────────────────────────
function buildParitySolve(
  solveFor: 'C' | 'P',
  S: string,
  K: string,
  D: string,
  premium: string,
  tier: Tier,
): Question {
  const known =
    solveFor === 'P'
      ? { C: F(premium), S: F(S), K: F(K), D: F(D) }
      : { P: F(premium), S: F(S), K: F(K), D: F(D) }
  const ans = fr(paritySolve(known))
  const fp = `tmpl-parity-solve:solveFor=${solveFor},S=${S},K=${K},D=${D},premium=${premium}`
  const id = `tmpl-parity-solve#solveFor${solveFor}-S${S}-K${K}-D${D.replace('/', '_')}-prem${premium}`
  const src = 'Green Book §6.1 p.70 L10820/L10840 (put-call parity C−P=S−K·D); dossier problems #3-#5'
  const knownSide = solveFor === 'P' ? `C = ${premium}` : `P = ${premium}`
  const solveExpr =
    solveFor === 'P'
      ? `C + K·D − S = ${premium} + ${K}·${D} − ${S}`
      : `P + S − K·D = ${premium} + ${S} − ${K}·${D}`

  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-parity-solve', params: { solveFor, S, K, D, premium } },
    prompt: `Put-call parity (r ≥ 0): C − P = S − K·D where D = e^(−rT). Given ${knownSide}, S = ${S}, K = ${K}, D = ${D}, find the missing ${solveFor === 'P' ? 'put price P' : 'call price C'}.`,
    source: src,
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(paritySolve({${solveFor === 'P' ? 'C' : 'P'}:${premium},S:${S},K:${K},D:${D}}))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: `${solveFor === 'P' ? 'P' : 'C'} = ${ans}`,
      approaches: [
        `Rearrange C − P = S − K·D: ${solveFor === 'P' ? 'P = C + K·D − S' : 'C = P + S − K·D'} = ${solveExpr} = ${ans}.`,
        `Put-call parity is a no-arbitrage identity; isolate the unknown by moving known quantities to the right-hand side.`,
      ],
      wrongTurns: [
        'using C − P = S + K·D (wrong sign on K·D)',
        'forgetting to multiply K by D when D ≠ 1',
        `solving for the wrong variable (finding ${solveFor === 'P' ? 'C' : 'P'} instead of ${solveFor})`,
      ],
      hintLadder: [
        `Write the parity identity: C − P = S − K·D. Which variable is unknown, and which are given?`,
        `Rearrange algebraically: isolate ${solveFor} on one side by moving known terms across. Compute K·D first.`,
        `${solveFor === 'P' ? 'P = C + K·D − S' : 'C = P + S − K·D'}; substitute the given values and reduce.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      `If interest rates rise (D decreases), how does the parity-implied ${solveFor === 'P' ? 'put' : 'call'} price change?`,
      `Verify your answer by checking that C − P equals S − K·D with the values you found.`,
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3 — tmpl-parity-gap
//   params: { C, P, S, K, D } (strings)
// ─────────────────────────────────────────────────────────────────────────────
function buildParityGap(C: string, P: string, S: string, K: string, D: string, tier: Tier): Question {
  const ans = fr(parityGap(F(C), F(P), F(S), F(K), F(D)))
  const fp = `tmpl-parity-gap:C=${C},P=${P},S=${S},K=${K},D=${D}`
  const id = `tmpl-parity-gap#C${C}-P${P}-S${S}-K${K}-D${D.replace('/', '_')}`
  const lhs = `C − P = ${C} − ${P}`
  const rhs = `S − K·D = ${S} − ${K}·${D}`
  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-parity-gap', params: { C, P, S, K, D } },
    prompt: `You observe: C = ${C}, P = ${P}, S = ${S}, K = ${K}, D = ${D}. Compute the put-call-parity gap (C − P) − (S − K·D). Is there an arbitrage? If so, identify the trade. (GB §6.1 p.70 L10820/L10840)`,
    source: 'Green Book §6.1 p.70 L10820/L10840 (put-call parity C−P=S−K·D, conversion/reversal arb); dossier problems #3-#5',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(parityGap(${C},${P},${S},${K},${D}))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: `gap = ${ans}${ans === '0' ? ' — no arbitrage; parity holds exactly' : ans.startsWith('-') ? ' — option side cheap; buy C, sell P, sell stock, lend K·D (reversal)' : ' — option side rich; sell C, buy P, buy stock, borrow K·D (conversion)'}`,
      approaches: [
        `${lhs}. ${rhs}. Gap = (${C}−${P}) − (${S}−${K}·${D}) = ${ans}.`,
        `Gap = 0 ⇒ no arb; gap > 0 ⇒ sell the option spread (conversion); gap < 0 ⇒ buy the option spread (reversal). Gap here = ${ans}.`,
      ],
      wrongTurns: [
        'computing (S−K·D) − (C−P) (reversing the sign of the gap)',
        'using K instead of K·D when D ≠ 1',
        'concluding arb exists when the gap is zero',
      ],
      hintLadder: [
        `Parity gap = (C − P) − (S − K·D). Compute each side separately.`,
        `Left side: C − P = ${C} − ${P}. Right side: S − K·D = ${S} − ${K}·${D}. Subtract right from left.`,
        `Take the difference of the two sides; if nonzero, identify whether to run a conversion (option side rich) or reversal (option side cheap).`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      `If there is an arbitrage, what is the locked profit today, and how does it unwind at expiry?`,
      `Holding C, P, S constant, what value of K·D makes the gap exactly zero?`,
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 4 — tmpl-bounds
//   params: { kind:'call'|'put', S, K, D, which:'lo'|'hi' }
// ─────────────────────────────────────────────────────────────────────────────
function buildBounds(kind: 'call' | 'put', S: string, K: string, D: string, which: 'lo' | 'hi', tier: Tier): Question {
  const bounds = kind === 'call' ? callBounds(F(S), F(K), F(D)) : putBounds(F(S), F(K), F(D))
  const ans = fr(bounds[which])
  const fp = `tmpl-bounds:kind=${kind},S=${S},K=${K},D=${D},which=${which}`
  const id = `tmpl-bounds#${kind}-S${S}-K${K}-D${D.replace('/', '_')}-${which}`
  const src = 'Green Book §6.3 p.80 L12501 / §6.1 no-arb bounds; dossier problem #6'

  const callLoBound = 'max(S − K·D, 0)'
  const callHiBound = 'S (the stock price)'
  const putLoBound = 'max(K·D − S, 0)'
  const putHiBound = 'K·D (discounted strike)'

  const formulaLabel = kind === 'call'
    ? (which === 'lo' ? callLoBound : callHiBound)
    : (which === 'lo' ? putLoBound : putHiBound)

  let prompt: string
  let approaches: string[]
  let wrongTurns: string[]
  let hintLadder: [string, string, string]
  let followUps: string[]

  if (kind === 'call' && which === 'lo') {
    prompt = `No-arbitrage lower bound for a European call: S = ${S}, K = ${K}, D = ${D}. What is the tightest lower bound on the call price?`
    approaches = [
      `Lower bound = max(S − K·D, 0) = max(${S}−${K}·${D},0) = ${ans}.`,
      `If C < S−K·D, sell the stock, buy the call, lend K·D — locked profit; so C ≥ S−K·D, and C ≥ 0.`,
    ]
    wrongTurns = [
      'giving just max(S−K,0) and forgetting to discount K by D',
      'giving K·D − S as the lower bound (that is for a put)',
      'confusing lower and upper bounds',
    ]
    hintLadder = [
      `The call lower bound comes from a no-arbitrage argument. What is the static replication that sets the floor?`,
      `If C < S − K·D, you can sell stock, lend K·D, and buy C for a net profit today. What floor does this imply for C?`,
      `Lower bound = max(S − K·D, 0); evaluate S − K·D numerically, then apply the max with zero.`,
    ]
    followUps = [
      `What is the corresponding upper bound on this call?`,
      `When S = K·D exactly (at-forward), what does the lower bound become?`,
    ]
  } else if (kind === 'call' && which === 'hi') {
    prompt = `No-arbitrage upper bound for a European call: S = ${S}, K = ${K}, D = ${D}. What is the tightest upper bound on the call price?`
    approaches = [
      `Upper bound = S (the stock price). A call can never be worth more than the underlying stock. Bound = ${ans}.`,
      `If C > S, sell C, buy stock — riskless profit at time 0; so C ≤ S.`,
    ]
    wrongTurns = [
      'using K·D as the upper bound (that is for a put)',
      'using S + K·D (double-counting)',
      'confusing the upper and lower bounds',
    ]
    hintLadder = [
      `A call gives the right to buy stock at K. Can a right to buy ever be worth more than the asset itself?`,
      `If C > S, you could sell the call and buy the stock for a riskless profit; what does this imply about the maximum call price?`,
      `The upper bound is the stock price S itself; read off S from the given parameters.`,
    ]
    followUps = [
      `What is the lower bound on this same call?`,
      `As K → 0, what does the call approach, and why does the upper bound become tight?`,
    ]
  } else if (kind === 'put' && which === 'lo') {
    prompt = `No-arbitrage lower bound for a European put: S = ${S}, K = ${K}, D = ${D}. What is the tightest lower bound on the put price?`
    approaches = [
      `Lower bound = max(K·D − S, 0) = max(${K}·${D}−${S},0) = ${ans}.`,
      `If P < K·D − S, buy put, buy stock, borrow K·D — riskless profit; so P ≥ max(K·D−S,0).`,
    ]
    wrongTurns = [
      'using max(S−K·D,0) — that is the call lower bound',
      'forgetting to discount K by D',
      'omitting the max with zero when K·D < S',
    ]
    hintLadder = [
      `The put lower bound follows from a no-arbitrage replication. What position locks in a floor?`,
      `If P < K·D − S, you can buy the put, buy stock, and borrow K·D for a riskless profit today. What floor does this set?`,
      `Lower bound = max(K·D − S, 0); compute K·D − S numerically, then apply max with zero.`,
    ]
    followUps = [
      `What is the upper bound for this put?`,
      `When S = K·D (at-forward), what is the lower bound?`,
    ]
  } else {
    // put hi
    prompt = `No-arbitrage upper bound for a European put: S = ${S}, K = ${K}, D = ${D}. What is the tightest upper bound on the put price?`
    approaches = [
      `Upper bound = K·D (discounted strike) = ${K}·${D} = ${ans}.`,
      `Put payoff ≤ K at expiry; discounted back: P ≤ K·D. Upper bound = ${ans}.`,
    ]
    wrongTurns = [
      'using K instead of K·D (not discounting)',
      'using S as the upper bound (that is for a call)',
      'confusing put upper bound K·D with call upper bound S',
    ]
    hintLadder = [
      `The put payoff is at most K (when S_T = 0). What is the present value of that maximum payoff?`,
      `Maximum put payoff at expiry is K; discounting at rate D gives K·D as the upper bound today.`,
      `Upper bound = K·D; substitute K and D and multiply.`,
    ]
    followUps = [
      `What is the lower bound for this same put?`,
      `As r → ∞ (D → 0), what happens to the put upper bound and why?`,
    ]
  }

  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-bounds', params: { kind, S, K, D, which } },
    prompt,
    source: src,
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(${kind}Bounds(${S},${K},${D}).${which})`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: `${which === 'lo' ? 'Lower' : 'Upper'} bound = ${formulaLabel} = ${ans}`,
      approaches,
      wrongTurns,
      hintLadder,
      rubric: RUBRIC,
    },
    followUps,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 5 — tmpl-rn-q
//   params: { u, d, R } (strings)
// ─────────────────────────────────────────────────────────────────────────────
function buildRnQ(u: string, d: string, R: string, tier: Tier): Question {
  const ans = fr(riskNeutralQ(F(u), F(d), F(R)))
  const fp = `tmpl-rn-q:u=${u},d=${d},R=${R}`
  const id = `tmpl-rn-q#u${u.replace('/', '_')}-d${d.replace('/', '_')}-R${R.replace('/', '_')}`
  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-rn-q', params: { u, d, R } },
    prompt: `A one-step binomial tree has up factor u = ${u}, down factor d = ${d}, and gross risk-free rate R = ${R} (so 1 unit grows to R). What is the risk-neutral probability q? (GB §6.1 L11002)`,
    source: 'Green Book §6.1 p.70 L11002 (risk-neutral pricing, q=(R−d)/(u−d)); dossier problem #7',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(riskNeutralQ(${u},${d},${R}))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: `q = (R − d)/(u − d) = ${ans}`,
      approaches: [
        `q = (R − d)/(u − d) = (${R} − ${d})/(${u} − ${d}) = ${ans}.`,
        `q is the unique weight that makes the discounted stock a martingale: q·u + (1−q)·d = R ⇒ q = (R−d)/(u−d).`,
      ],
      wrongTurns: [
        'using q = (u − R)/(u − d) (wrong sign in numerator)',
        'confusing q with a real-world probability — q is the no-arb weight, not the true up-probability p',
        'computing (R − d)/(u + d) (wrong denominator)',
      ],
      hintLadder: [
        `The risk-neutral probability comes from the condition q·u·S + (1−q)·d·S = R·S. Rearrange for q.`,
        `Rearranging q·(u−d) = R−d gives q = (R−d)/(u−d). Substitute u, d, R.`,
        `Compute numerator R − d and denominator u − d separately, then divide and reduce.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      `Would q change if I told you the stock historically goes up 70% of the time? Explain why or why not.`,
      `Price a call with K = 100 on a tree with S = 100, u = ${u}, d = ${d}, R = ${R} using this q.`,
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 6 — tmpl-binomial-price
//   params: { S, u, d, R, K, n (NUMBER), kind }
// ─────────────────────────────────────────────────────────────────────────────
function buildBinomialPrice(
  S: string, u: string, d: string, R: string, K: string,
  n: number, kind: 'call' | 'put', tier: Tier,
): Question {
  const ans = fr(binomialPrice(F(S), F(u), F(d), F(R), F(K), n, kind))
  const fp = `tmpl-binomial-price:S=${S},u=${u},d=${d},R=${R},K=${K},n=${n},kind=${kind}`
  const id = `tmpl-binomial-price#${kind}-S${S}-n${n}-K${K}-u${u.replace('/', '_')}`
  const src =
    'Green Book §6.1 risk-neutral L11002 + §5.3 backward induction L9497; web-sourced tree mechanics (Cudina UT-Austin; Worrall ECO-30004; AnalystPrep)'

  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-binomial-price', params: { S, u, d, R, K, n, kind } },
    prompt: `Binomial tree (${n}-step): S = ${S}, u = ${u}, d = ${d}, R = ${R} (gross risk-free). Price a European ${kind} with K = ${K} using risk-neutral pricing. (GB §5.3 L9497, §6.1 L11002)`,
    source: src,
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(binomialPrice(${S},${u},${d},${R},${K},${n},'${kind}'))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: `${kind} price = ${ans}`,
      approaches: [
        `q = (R−d)/(u−d). Price = (1/R^${n})·E_q[payoff] by backward induction / direct formula. Result = ${ans}.`,
        `With q = (${R}−${d})/(${u}−${d}), compute terminal payoffs, weight by q^k·(1−q)^(n−k)·C(n,k), sum, discount by 1/R^${n}. Price = ${ans}.`,
      ],
      wrongTurns: [
        'using real-world probabilities p instead of risk-neutral q',
        'forgetting to discount by 1/R^n after taking the expectation',
        'using the wrong payoff formula (put instead of call, or vice versa)',
      ],
      hintLadder: [
        `Step 1: find risk-neutral q = (R−d)/(u−d). Step 2: list the ${n + 1} terminal stock prices S·u^k·d^(n−k). Step 3: compute the ${kind} payoff at each terminal. Step 4: take the q-weighted expectation and discount by 1/R^${n}.`,
        `q = (${R}−${d})/(${u}−${d}). List terminal nodes S·u^k·d^(n−k) for k = 0…${n} and apply max(S_T−K,0) or max(K−S_T,0). Assign binomial weights C(${n},k)·q^k·(1−q)^(${n}−k).`,
        `Sum the weighted payoffs across all ${n + 1} terminals, then divide by R^${n} to get the present value.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      n === 1
        ? `Now replicate this ${kind}: find Δ (shares) and B (bond) so the hedge portfolio matches the ${kind}'s payoffs at both nodes.`
        : `Verify by put-call parity: does the complementary ${kind === 'call' ? 'put' : 'call'} price satisfy C − P = S − K·R^(−${n})?`,
      `How does the price change as n → ∞ (toward the Black-Scholes limit)?`,
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 7 — tmpl-replicate
//   params: { S, u, d, R, K, kind, which:'delta'|'bond' }
// ─────────────────────────────────────────────────────────────────────────────
function buildReplicate(
  S: string, u: string, d: string, R: string, K: string,
  kind: 'call' | 'put', which: 'delta' | 'bond', tier: Tier,
): Question {
  const rep = replicate(F(S), F(u), F(d), F(R), F(K), kind)
  const ans = fr(rep[which])
  const fp = `tmpl-replicate:S=${S},u=${u},d=${d},R=${R},K=${K},kind=${kind},which=${which}`
  const id = `tmpl-replicate#${kind}-${which}-u${u.replace('/', '_')}`
  const src =
    'Green Book §6.1 risk-neutral L11002 + §5.3 L9497; delta=(V_u−V_d)/(S(u−d)); bond=price−delta·S (Cudina UT-Austin; Worrall ECO-30004)'

  const priceAns = fr(binomialPrice(F(S), F(u), F(d), F(R), F(K), 1, kind))
  const deltaAns = fr(rep.delta)
  const bondAns = fr(rep.bond)

  let prompt: string
  let approaches: string[]
  let wrongTurns: string[]
  let hintLadder: [string, string, string]

  if (which === 'delta') {
    prompt = `One-step binomial tree: S = ${S}, u = ${u}, d = ${d}, R = ${R}. Find the replicating delta Δ for a ${kind} with K = ${K}. (Delta = (V_u − V_d)/(S·(u−d)))`
    approaches = [
      `V_u = ${kind === 'call' ? 'max' : 'max'}(S·u − K, 0) or max(K−S·u, 0). V_d likewise. Δ = (V_u − V_d)/(S·(u−d)) = ${ans}.`,
      `Δ is the share count that cancels risk; it also equals the hedge ratio Cov(V,S)/Var(S) in this tree. Δ = ${ans}.`,
    ]
    wrongTurns = [
      'dividing (V_u − V_d) by (S_u − S_d) instead of S·(u−d) — same numerically but different conceptually',
      'using a put payoff formula for a call (or vice versa)',
      'computing (V_u + V_d)/(2·S) — average, not difference',
    ]
    hintLadder = [
      `Replicating delta Δ = (V_u − V_d)/(S·(u−d)). First compute V_u and V_d — the ${kind} payoffs at the up and down nodes.`,
      `S·u = ${String(Number(S) * Number(u.split('/')[0]) / (Number(u.split('/')[1] ?? 1)))}, S·d = ${String(Number(S) * Number(d.split('/')[0]) / (Number(d.split('/')[1] ?? 1)))}. Compute the ${kind} payoff at each node: ${kind === 'call' ? 'max(S_node − K, 0)' : 'max(K − S_node, 0)'}.`,
      `With V_u and V_d in hand, form (V_u − V_d) / (S·(u−d)) and reduce the fraction.`,
    ]
  } else {
    // bond
    prompt = `One-step binomial tree: S = ${S}, u = ${u}, d = ${d}, R = ${R}. The ${kind} replicating portfolio is {Δ = ${deltaAns}, B = ?}. Find the bond position B. (B = price − Δ·S)`
    approaches = [
      `Price = ${priceAns} (risk-neutral). Δ = ${deltaAns}. B = price − Δ·S = ${priceAns} − ${deltaAns}·${S} = ${ans}.`,
      `B is the bond (lending if positive, borrowing if negative). For a ${kind === 'call' ? 'long call replication you borrow' : 'put replication you lend'}. B = ${ans}.`,
    ]
    wrongTurns = [
      'using B = Δ·S − price (wrong sign)',
      'forgetting to include the risk-neutral price (not the intrinsic value)',
      'confusing positive B (lending) with negative B (borrowing)',
    ]
    hintLadder = [
      `The replicating portfolio satisfies: ${kind} price = Δ·S + B. You already have Δ = ${deltaAns}; find the risk-neutral price first.`,
      `Risk-neutral price = (1/R)·[q·V_u + (1−q)·V_d] = ${priceAns}. Then B = price − Δ·S = ${priceAns} − ${deltaAns}·${S}.`,
      `Compute ${priceAns} − ${deltaAns}·${S} and reduce; a negative result means you are borrowing to finance the hedge.`,
    ]
  }

  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-replicate', params: { S, u, d, R, K, kind, which } },
    prompt,
    source: src,
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(replicate(${S},${u},${d},${R},${K},'${kind}').${which})`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: `${which === 'delta' ? 'Δ' : 'B'} = ${ans}; full replication: Δ = ${deltaAns}, B = ${bondAns}, price = ${priceAns}`,
      approaches,
      wrongTurns,
      hintLadder,
      rubric: RUBRIC,
    },
    followUps: [
      `Verify: Δ·S_u + B·R = V_u and Δ·S_d + B·R = V_d (both should match the ${kind} payoffs).`,
      which === 'delta'
        ? `How does the delta relate to the risk-neutral probability q?`
        : `What does the sign of B tell you about whether you are lending or borrowing in this replication?`,
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 8 — tmpl-tree-terminal
//   params: { S, u, d, n (NUMBER), i (NUMBER) }
// ─────────────────────────────────────────────────────────────────────────────
function buildTreeTerminal(S: string, u: string, d: string, n: number, i: number, tier: Tier): Question {
  const ans = fr(treeTerminals(F(S), F(u), F(d), n)[i])
  const fp = `tmpl-tree-terminal:S=${S},u=${u},d=${d},n=${n},i=${i}`
  const id = `tmpl-tree-terminal#n${n}-i${i}-u${u.replace('/', '_')}`
  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-tree-terminal', params: { S, u, d, n, i } },
    prompt: `On a ${n}-step binomial tree with S = ${S}, u = ${u}, d = ${d}, list the terminal stock prices highest-first. What is the stock price at index i = ${i} (zero-based, highest first)?`,
    source: 'Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(treeTerminals(${S},${u},${d},${n})[${i}])`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: `Terminal[${i}] = S·u^(${n}−${i})·d^${i} = ${ans}`,
      approaches: [
        `Index i = ${i} → S·u^(${n}−${i})·d^${i} = ${S}·(${u})^${n - i}·(${d})^${i} = ${ans}.`,
        `Terminals are ordered highest to lowest: T[0]=S·u^n, T[1]=S·u^(n−1)·d, …, T[n]=S·d^n.`,
      ],
      wrongTurns: [
        'mixing up 0-based vs 1-based indexing',
        'computing u^i·d^(n−i) instead of u^(n−i)·d^i (wrong exponents)',
        'forgetting to multiply by S',
      ],
      hintLadder: [
        `Terminals are ordered highest to lowest: index i corresponds to (n−i) up-moves and i down-moves. Identify the formula for T[i].`,
        `T[i] = S·u^(n−i)·d^i. Substitute S = ${S}, u = ${u}, d = ${d}, n = ${n}, i = ${i}; compute u^${n - i} and d^${i} separately.`,
        `Multiply S by u^${n - i} and then by d^${i}; combine the fractions and reduce.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      `What is the call payoff max(T[${i}] − K, 0) at this terminal if K = 100?`,
      `What risk-neutral weight (binomial probability) corresponds to this node with q = 1/2?`,
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 9 — tmpl-tree-weight
//   params: { q, n (NUMBER), i (NUMBER) }
// ─────────────────────────────────────────────────────────────────────────────
function buildTreeWeight(q: string, n: number, i: number, tier: Tier): Question {
  const ans = fr(treeWeights(F(q), n)[i])
  const fp = `tmpl-tree-weight:q=${q},n=${n},i=${i}`
  const id = `tmpl-tree-weight#q${q.replace('/', '_')}-n${n}-i${i}`
  const upMoves = n - i
  const downMoves = i
  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-tree-weight', params: { q, n, i } },
    prompt: `On a ${n}-step binomial tree with risk-neutral probability q = ${q}, what is the risk-neutral weight (probability) at index i = ${i} (ordered highest-first, so ${upMoves} up-moves and ${downMoves} down-moves)?`,
    source: 'Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(treeWeights(${q},${n})[${i}])`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: `Weight[${i}] = C(${n},${upMoves})·q^${upMoves}·(1−q)^${downMoves} = ${ans}`,
      approaches: [
        `Weight[${i}] = C(${n},${n - i})·q^${n - i}·(1−q)^${i} = C(${n},${n - i})·(${q})^${n - i}·(${fr({ n: F(q).d - F(q).n, d: F(q).d })})^${i} = ${ans}.`,
        `The weight is the binomial probability of exactly ${n - i} up-moves in ${n} steps.`,
      ],
      wrongTurns: [
        'confusing q (risk-neutral) with the real-world up-probability p',
        'using C(n,i) instead of C(n,n−i) (indexing from the wrong end)',
        'swapping the exponents on q and (1−q)',
      ],
      hintLadder: [
        `The weight at index i is C(n, n−i)·q^(n−i)·(1−q)^i, counting paths with ${upMoves} up-moves and ${downMoves} down-moves.`,
        `With n = ${n} and ${upMoves} up-moves: C(${n},${upMoves}) = ${n}!/(${upMoves}!·${downMoves}!). Compute this binomial coefficient, then multiply by q^${upMoves} and (1−q)^${downMoves}.`,
        `Multiply C(${n},${upMoves}) by q^${upMoves} and by (1−q)^${downMoves}; express all factors as fractions and multiply out.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      `Verify that all weights for n = ${n} sum to one.`,
      `What is the corresponding terminal stock price (S = 100, u = 6/5, d = 4/5) at this index?`,
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 10 — tmpl-path-count
//   params: { n (NUMBER), k (NUMBER) }
// ─────────────────────────────────────────────────────────────────────────────
function buildPathCount(n: number, k: number, tier: Tier): Question {
  const ans = String(pathCount(n, k))
  const fp = `tmpl-path-count:n=${n},k=${k}`
  const id = `tmpl-path-count#n${n}-k${k}`
  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-path-count', params: { n, k } },
    prompt: `On a ${n}-step binomial tree, how many distinct paths lead to exactly ${k} up-moves (and ${n - k} down-moves)?`,
    source: 'Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon',
    engineCheck: {
      module: MODULE,
      calls: [`String(pathCount(${n},${k}))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: `C(${n},${k}) = ${ans}`,
      approaches: [
        `C(${n},${k}) = ${n}!/(${k}!·${n - k}!) = ${ans}.`,
        `Count the number of ways to choose which ${k} of the ${n} steps are "up"; the rest are "down" by default.`,
      ],
      wrongTurns: [
        `computing C(${n},${n - k}) instead of C(${n},${k}) (though they are equal here)`,
        'using n·k (product instead of binomial coefficient)',
        'forgetting that order matters within "which steps are up" when counting paths incorrectly',
      ],
      hintLadder: [
        `The number of paths with exactly k up-moves in n steps is the binomial coefficient C(n,k) = n!/(k!(n−k)!).`,
        `Apply the factorial formula C(n,k) = n!/(k!·(n−k)!) with the given n and k; expand each factorial term.`,
        `Simplify by cancelling shared factors between numerator and denominator before multiplying out.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      `What is C(${n}, ${n - k}) — the count of paths with ${n - k} up-moves — and why does it equal C(${n},${k})?`,
      `How does pathCount relate to the binomial weight at the corresponding tree node?`,
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 11 — tmpl-hedge-ratio
//   params: { cov, varB } (strings)
// ─────────────────────────────────────────────────────────────────────────────
function buildHedgeRatio(cov: string, varB: string, tier: Tier): Question {
  const ans = fr(hedgeRatio(F(cov), F(varB)))
  const fp = `tmpl-hedge-ratio:cov=${cov},varB=${varB}`
  const id = `tmpl-hedge-ratio#cov${cov.replace('/', '_')}-varB${varB.replace('/', '_')}`
  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-hedge-ratio', params: { cov, varB } },
    prompt: `You are long asset A and will short h units of asset B to minimize Var(A − h·B). Given Cov(A,B) = ${cov} and Var(B) = ${varB}, what is the optimal hedge ratio h*? (GB §4.5 p.48 L7647)`,
    source: 'Green Book §4.5 p.48 L7647 (h* = Cov/Var); dossier problem #16',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(hedgeRatio(${cov},${varB}))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: `h* = Cov(A,B)/Var(B) = ${cov}/${varB} = ${ans}`,
      approaches: [
        `Minimize Var(A−h·B) = Var(A) − 2h·Cov(A,B) + h²Var(B). Differentiate w.r.t. h and set to zero: h* = Cov(A,B)/Var(B) = ${cov}/${varB} = ${ans}.`,
        `h* is also the OLS slope of A on B: h* = ρ·σ_A/σ_B = Cov(A,B)/Var(B) = ${ans}.`,
      ],
      wrongTurns: [
        'using Var(A) in the denominator instead of Var(B)',
        'dividing by the standard deviation σ_B instead of Var(B)',
        'getting the sign wrong for a negative covariance (negative Cov ⇒ short a negative amount = long)',
      ],
      hintLadder: [
        `Write Var(A − h·B) as a function of h and differentiate; set the derivative to zero to find the minimizer.`,
        `Var(A−h·B) = Var(A) − 2h·Cov(A,B) + h²·Var(B). Derivative w.r.t. h: −2·Cov + 2h·Var(B) = 0.`,
        `Solving: h* = Cov(A,B)/Var(B); substitute Cov = ${cov} and Var(B) = ${varB} and reduce.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      `What residual variance Var(A − h*·B) remains at the optimal hedge?`,
      `How does h* relate to the option delta Δ = (V_u−V_d)/(S(u−d)) on a binomial tree?`,
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 12 — tmpl-min-var
//   params: { varA, varB, cov, which:'wA'|'wB'|'varMin' }
// ─────────────────────────────────────────────────────────────────────────────
function buildMinVar(varA: string, varB: string, cov: string, which: 'wA' | 'wB' | 'varMin', tier: Tier): Question {
  const mv = minVarWeights(F(varA), F(varB), F(cov))
  const ans = fr(mv[which])
  const fp = `tmpl-min-var:varA=${varA},varB=${varB},cov=${cov},which=${which}`
  const id = `tmpl-min-var#varA${varA.replace('/', '_')}-varB${varB.replace('/', '_')}-cov${cov.replace('/', '_')}-${which}`
  const wAans = fr(mv.wA), wBans = fr(mv.wB), vmAns = fr(mv.varMin)

  const whatLabel = which === 'wA' ? 'the weight in asset A (w_A)' : which === 'wB' ? 'the weight in asset B (w_B)' : 'the minimum portfolio variance (Var_min)'

  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-min-var', params: { varA, varB, cov, which } },
    prompt: `Two assets with Var(A) = ${varA}, Var(B) = ${varB}, Cov(A,B) = ${cov}. Find the minimum-variance portfolio weights and variance. What is ${whatLabel}? (GB §6.4 p.82-83 L12795)`,
    source: 'Green Book §6.4 p.82-83 L12795 (min-variance two-stock, 6/7 in A, 1/7 in B); dossier problem #20',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(minVarWeights(${varA},${varB},${cov}).${which})`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: `${which === 'wA' ? 'w_A' : which === 'wB' ? 'w_B' : 'Var_min'} = ${ans}; full solution: w_A = ${wAans}, w_B = ${wBans}, Var_min = ${vmAns}`,
      approaches: [
        `w_A = (Var(B) − Cov)/(Var(A) + Var(B) − 2·Cov) = (${varB} − ${cov})/(${varA} + ${varB} − 2·${cov}) = ${wAans}; w_B = 1 − w_A = ${wBans}; Var_min = ${vmAns}.`,
        `The minimum-variance frontier formula: dVAR/dw = 0 gives w_A = (σ_B² − σ_{AB})/(σ_A² + σ_B² − 2σ_{AB}).`,
      ],
      wrongTurns: [
        'using σ_A and σ_B (standard deviations) instead of variances Var(A), Var(B)',
        'forgetting the −2·Cov term in the denominator',
        'setting w_A + w_B ≠ 1 (weights must sum to one)',
      ],
      hintLadder: [
        `Minimize Var(w_A·A + w_B·B) = w_A²·Var(A) + w_B²·Var(B) + 2·w_A·w_B·Cov subject to w_A + w_B = 1. Substitute w_B = 1 − w_A.`,
        `After substituting, differentiate w.r.t. w_A and set to zero: the formula for w_A is (Var(B) − Cov)/(Var(A) + Var(B) − 2·Cov).`,
        `Compute denominator = Var(A) + Var(B) − 2·Cov and numerator = Var(B) − Cov; divide and reduce.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      `Verify w_A + w_B = 1.`,
      `How does Var_min compare to Var(A) and Var(B) individually?`,
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 13 — tmpl-one-touch
//   params: { H } (string)
// ─────────────────────────────────────────────────────────────────────────────
function buildOneTouch(H: string, tier: Tier): Question {
  const ans = fr(oneTouchPrice(F(H)))
  const fp = `tmpl-one-touch:H=${H}`
  const id = `tmpl-one-touch#H${H.replace('/', '_')}`
  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-one-touch', params: { H } },
    prompt: `A one-touch digital option pays $1 the first time the asset reaches the level H = ${H}, starting from S_0 = 1, with r = 0. What is the fair price of this digital? (GB §6.2 p.75 L11741)`,
    source: 'Green Book §6.2 p.75 L11741 (one-touch digital = 1/H); dossier problem #18',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(oneTouchPrice(${H}))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: `one-touch price = 1/H = ${ans}`,
      approaches: [
        `At r = 0 the stock is a martingale. Replication: buy 1/H shares. If the asset hits H, 1/H shares × H = 1 = the payoff. Cost today: (1/H) × S_0 = 1/H = ${ans}.`,
        `Optional stopping + martingale: E_Q[S_T] = S_0 = 1. The payout is 1 at the first hitting time τ, so price = E_Q[1{τ<∞}] = S_0/H = 1/H.`,
      ],
      wrongTurns: [
        'pricing it as H (the barrier) rather than 1/H',
        'applying Black-Scholes with a continuous barrier formula (irrational; not the graded answer)',
        'confusing one-touch (pays at first hit) with a digital call (pays at expiry if above H)',
      ],
      hintLadder: [
        `The one-touch is replicated by holding 1/H shares. If S hits H, the shares are worth 1. How much does the replicating portfolio cost today?`,
        `Replicating portfolio: hold 1/H shares at price S_0 = 1. Cost = 1/H · S_0. Since S_0 is given, evaluate 1/H.`,
        `Price = 1/H with H = ${H}; compute this fraction and reduce.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      `Verify: if S_0 = 1 and you hold 1/H shares, the payoff is exactly $1 when S first reaches H.`,
      `How does the price change if H decreases toward 1? What does H = 1 imply?`,
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 14 — tmpl-greek-sign
//   params: { greek, kind }
// ─────────────────────────────────────────────────────────────────────────────
function buildGreekSign(
  greek: 'delta' | 'gamma' | 'theta' | 'vega' | 'rho',
  kind: 'call' | 'put',
  tier: Tier,
): Question {
  const ans = String(greekSign(greek, kind))
  const fp = `tmpl-greek-sign:greek=${greek},kind=${kind}`
  const id = `tmpl-greek-sign#${greek}-${kind}`
  const src = 'Green Book §6.2 p.75 L11736 (Greek signs; magnitude N(d1) display-only); dossier problem #17'

  const explanations: Record<string, string> = {
    'delta-call': 'Delta > 0 for calls: as S rises, call value rises (long stock sensitivity).',
    'delta-put': 'Delta < 0 for puts: as S rises, put value falls (short stock sensitivity).',
    'gamma-call': 'Gamma > 0 for calls: the delta itself increases as S rises (convexity).',
    'gamma-put': 'Gamma > 0 for puts: same as calls — both exhibit positive convexity.',
    'theta-call': 'Theta < 0 for calls: time decay reduces option value as expiry approaches.',
    'theta-put': 'Theta < 0 for puts: time decay also hurts puts (both erode with passage of time).',
    'vega-call': 'Vega > 0 for calls: higher volatility increases the chance of a large payoff.',
    'vega-put': 'Vega > 0 for puts: higher volatility also benefits puts (symmetric payoff spreading).',
    'rho-call': 'Rho > 0 for calls: higher rates reduce the PV of the strike, making calls worth more.',
    'rho-put': 'Rho < 0 for puts: higher rates reduce the PV of the strike, making puts worth less.',
  }

  const signLabel = ans === '1' ? 'positive (+1)' : ans === '-1' ? 'negative (−1)' : 'zero'

  return {
    id,
    tier,
    fingerprint: fp,
    template: { id: 'tmpl-greek-sign', params: { greek, kind } },
    prompt: `What is the sign of ${greek} for a European ${kind} option? Answer +1, 0, or −1. (GB §6.2 p.75 L11736)`,
    source: src,
    engineCheck: {
      module: MODULE,
      calls: [`String(greekSign('${greek}','${kind}'))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: `${greek}/${kind} sign = ${ans} (${signLabel}): ${explanations[`${greek}-${kind}`]}`,
      approaches: [
        explanations[`${greek}-${kind}`],
        `Recall the Black-Scholes magnitudes are irrational (they involve N(d1)); only the SIGN is exact and graded here.`,
      ],
      wrongTurns: [
        'reporting a continuous Greek magnitude (e.g. N(d1)) as the graded answer — only the sign is exact',
        'confusing gamma sign (always +) with theta sign (always −)',
        `reversing call vs put delta sign (call = +1, put = −1)`,
      ],
      hintLadder: [
        `${greek} measures how the option value changes with respect to ${greek === 'delta' ? 'the stock price S' : greek === 'gamma' ? 'the stock price S (second derivative)' : greek === 'theta' ? 'time to expiry T' : greek === 'vega' ? 'volatility σ' : 'the interest rate r'}. Think about the direction for a ${kind}.`,
        `For a ${kind}: as ${greek === 'delta' ? 'S' : greek === 'gamma' ? 'S' : greek === 'theta' ? 'time passes (T decreases)' : greek === 'vega' ? 'σ' : 'r'} increases, does the ${kind} value increase or decrease?`,
        `${explanations[`${greek}-${kind}`]} Report +1 for positive, −1 for negative — magnitudes are irrational (N(d1)) and are NOT the graded answer.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      `Name a situation (in terms of moneyness or time) where this Greek is largest in magnitude.`,
      `Which Greek is the same sign for both calls and puts, and why?`,
    ],
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Build the pool
// ═════════════════════════════════════════════════════════════════════════════

// ── T1: tmpl-payoff (14 questions) ───────────────────────────────────────────
// Anchored goldens (12):
questions.push(buildPayoff('call', '100', '130', 'hard'))
questions.push(buildPayoff('call', '100', '70', 'hard'))
questions.push(buildPayoff('put', '100', '70', 'hard'))
questions.push(buildPayoff('put', '100', '130', 'hard'))
questions.push(buildPayoff('protective-put', '100', '130', 'harder'))
questions.push(buildPayoff('protective-put', '100', '80', 'harder'))
questions.push(buildPayoff('straddle', '100', '130', 'harder'))
questions.push(buildPayoff('straddle', '100', '70', 'harder'))
questions.push(buildPayoff('bull', '100-120', '130', 'harder'))
questions.push(buildPayoff('bull', '100-120', '90', 'harder'))
questions.push(buildPayoff('butterfly', '90-100-110', '100', 'brutal'))
questions.push(buildPayoff('strangle', '90-110', '130', 'brutal'))
// Extra parameterizations:
questions.push(buildPayoff('bull', '90-110', '100', 'harder'))    // between strikes
questions.push(buildPayoff('strangle', '90-110', '80', 'brutal')) // put ITM side

// ── T2: tmpl-parity-solve (4 questions) ──────────────────────────────────────
// Anchored goldens (3):
questions.push(buildParitySolve('P', '100', '100', '1', '10', 'hard'))
questions.push(buildParitySolve('C', '50', '44', '10/11', '3', 'harder'))
questions.push(buildParitySolve('C', '100', '90', '1', '5', 'harder'))
// Extra: deep OTM call / deep ITM put (r=0)
questions.push(buildParitySolve('P', '80', '100', '1', '5', 'brutal'))

// ── T3: tmpl-parity-gap (3 questions) ────────────────────────────────────────
questions.push(buildParityGap('8', '2', '100', '95', '1', 'harder'))
questions.push(buildParityGap('6', '4', '100', '100', '1', 'harder'))
questions.push(buildParityGap('3', '3', '100', '100', '1', 'hard'))

// ── T4: tmpl-bounds (4 questions) ────────────────────────────────────────────
questions.push(buildBounds('call', '100', '90', '1', 'lo', 'hard'))
questions.push(buildBounds('call', '100', '90', '1', 'hi', 'hard'))
questions.push(buildBounds('put', '100', '110', '1', 'lo', 'hard'))
questions.push(buildBounds('put', '100', '110', '1', 'hi', 'hard'))

// ── T5: tmpl-rn-q (5 questions) ──────────────────────────────────────────────
// Anchored goldens (4):
questions.push(buildRnQ('6/5', '4/5', '1', 'hard'))
questions.push(buildRnQ('3/2', '1/2', '11/10', 'harder'))
questions.push(buildRnQ('7/4', '3/4', '5/4', 'harder'))
questions.push(buildRnQ('4/3', '2/3', '1', 'hard'))
// Extra:
questions.push(buildRnQ('5/4', '3/4', '1', 'hard'))

// ── T6: tmpl-binomial-price (6 questions) ────────────────────────────────────
// Anchored goldens (5):
questions.push(buildBinomialPrice('100', '6/5', '4/5', '1', '100', 1, 'call', 'hard'))
questions.push(buildBinomialPrice('100', '7/4', '3/4', '5/4', '100', 1, 'call', 'harder'))
questions.push(buildBinomialPrice('100', '6/5', '4/5', '1', '100', 1, 'put', 'harder'))
questions.push(buildBinomialPrice('100', '6/5', '4/5', '1', '100', 2, 'call', 'brutal'))
questions.push(buildBinomialPrice('100', '6/5', '4/5', '1', '100', 3, 'call', 'brutal'))
// Extra (n=2 put — verifies parity C=P when r=0, S=K):
questions.push(buildBinomialPrice('100', '6/5', '4/5', '1', '100', 2, 'put', 'brutal'))

// ── T7: tmpl-replicate (5 questions) ─────────────────────────────────────────
// Anchored goldens (5):
questions.push(buildReplicate('100', '6/5', '4/5', '1', '100', 'call', 'delta', 'harder'))
questions.push(buildReplicate('100', '6/5', '4/5', '1', '100', 'call', 'bond', 'brutal'))
questions.push(buildReplicate('100', '7/4', '3/4', '5/4', '100', 'call', 'delta', 'harder'))
questions.push(buildReplicate('100', '6/5', '4/5', '1', '100', 'put', 'delta', 'harder'))
questions.push(buildReplicate('100', '6/5', '4/5', '1', '100', 'put', 'bond', 'brutal'))

// ── T8: tmpl-tree-terminal (6 questions) ─────────────────────────────────────
// Anchored goldens (4):
questions.push(buildTreeTerminal('100', '6/5', '4/5', 2, 0, 'harder'))
questions.push(buildTreeTerminal('100', '6/5', '4/5', 2, 1, 'harder'))
questions.push(buildTreeTerminal('100', '6/5', '4/5', 2, 2, 'harder'))
questions.push(buildTreeTerminal('100', '6/5', '4/5', 3, 0, 'brutal'))
// Extras (n=3 middle and low nodes):
questions.push(buildTreeTerminal('100', '6/5', '4/5', 3, 1, 'brutal'))
questions.push(buildTreeTerminal('100', '6/5', '4/5', 3, 2, 'brutal'))

// ── T9: tmpl-tree-weight (5 questions) ───────────────────────────────────────
// Anchored goldens (3):
questions.push(buildTreeWeight('1/2', 2, 0, 'harder'))
questions.push(buildTreeWeight('1/2', 2, 1, 'harder'))
questions.push(buildTreeWeight('1/2', 2, 2, 'harder'))
// Extras (n=3 nodes):
questions.push(buildTreeWeight('1/2', 3, 0, 'brutal'))
questions.push(buildTreeWeight('1/2', 3, 1, 'brutal'))

// ── T10: tmpl-path-count (5 questions) ───────────────────────────────────────
// Anchored goldens (4):
questions.push(buildPathCount(2, 1, 'hard'))
questions.push(buildPathCount(3, 3, 'hard'))
questions.push(buildPathCount(4, 2, 'harder'))
questions.push(buildPathCount(5, 2, 'harder'))
// Extra:
questions.push(buildPathCount(4, 3, 'harder'))

// ── T11: tmpl-hedge-ratio (4 questions) ──────────────────────────────────────
questions.push(buildHedgeRatio('6', '9', 'hard'))
questions.push(buildHedgeRatio('-6', '9', 'hard'))
questions.push(buildHedgeRatio('12', '16', 'harder'))
questions.push(buildHedgeRatio('8', '25', 'harder'))

// ── T12: tmpl-min-var (3 questions) ──────────────────────────────────────────
questions.push(buildMinVar('1/25', '9/100', '3/100', 'wA', 'brutal'))
questions.push(buildMinVar('1/25', '9/100', '3/100', 'wB', 'brutal'))
questions.push(buildMinVar('1/25', '9/100', '3/100', 'varMin', 'brutal'))

// ── T13: tmpl-one-touch (3 questions) ────────────────────────────────────────
questions.push(buildOneTouch('5/4', 'hard'))
questions.push(buildOneTouch('2', 'hard'))
questions.push(buildOneTouch('5/2', 'harder'))

// ── T14: tmpl-greek-sign (10 questions) ──────────────────────────────────────
// Anchored goldens (6):
questions.push(buildGreekSign('delta', 'call', 'hard'))
questions.push(buildGreekSign('delta', 'put', 'hard'))
questions.push(buildGreekSign('gamma', 'call', 'hard'))
questions.push(buildGreekSign('vega', 'call', 'hard'))
questions.push(buildGreekSign('theta', 'call', 'hard'))
questions.push(buildGreekSign('rho', 'put', 'harder'))
// Extras (symmetric Greeks, require knowing call/put symmetry):
questions.push(buildGreekSign('gamma', 'put', 'harder'))
questions.push(buildGreekSign('theta', 'put', 'harder'))
questions.push(buildGreekSign('vega', 'put', 'harder'))
questions.push(buildGreekSign('rho', 'call', 'harder'))

// ═════════════════════════════════════════════════════════════════════════════
// Free-form showcase (6 questions, no template field)
// ═════════════════════════════════════════════════════════════════════════════

// Compute and assert each free-form answer from the engine:
const _ff1 = fr(binomialPrice(B(100), B(6, 5), B(4, 5), B(1), B(100), 1, 'call'))
if (_ff1 !== '10') throw new Error(`ff-canonical-hedge-cost assert: expected 10, got ${_ff1}`)

const _ff2 = fr(paritySolve({ C: B(10), S: B(100), K: B(100), D: B(1) }))
if (_ff2 !== '10') throw new Error(`ff-parity-put-from-call assert: expected 10, got ${_ff2}`)

const _ff3 = fr(parityGap(B(8), B(2), B(100), B(95), B(1)))
if (_ff3 !== '1') throw new Error(`ff-conversion-arb-gap assert: expected 1, got ${_ff3}`)

const _ff4 = fr(binomialPrice(B(100), B(6, 5), B(4, 5), B(1), B(100), 2, 'call'))
if (_ff4 !== '11') throw new Error(`ff-two-step-call-price assert: expected 11, got ${_ff4}`)

const _ff5 = fr(replicate(B(100), B(6, 5), B(4, 5), B(1), B(100), 'call').delta)
if (_ff5 !== '1/2') throw new Error(`ff-delta-is-hedge-ratio assert: expected 1/2, got ${_ff5}`)

const _ff6 = fr(minVarWeights(B(1, 25), B(9, 100), B(3, 100)).wA)
if (_ff6 !== '6/7') throw new Error(`ff-min-var-weight-A assert: expected 6/7, got ${_ff6}`)

questions.push({
  id: 'ff-canonical-hedge-cost',
  tier: 'brutal',
  fingerprint: 'sem:canonical-hedge-cost-replication-10',
  prompt:
    'Canonical one-step tree: S = 100, K = 100, u = 6/5, d = 4/5, r = 0. Price the call by building the replicating hedge — find Δ and B so that Δ·S_u + B = V_u and Δ·S_d + B = V_d — then show the hedge cost Δ·S + B equals the risk-neutral price.',
  source:
    'Green Book §6.1 risk-neutral L11002 + §5.3 L9497; delta=(V_u−V_d)/(S(u−d)); dossier problem #8 (canonical tree)',
  engineCheck: {
    module: MODULE,
    calls: [`formatRational(binomialPrice(100,6/5,4/5,1,100,1,'call'))`],
    answer: '10',
    verified: true,
  },
  hidden: {
    answer:
      'price = 10; Δ = 1/2, B = −40. Hedge cost = 1/2·100 + (−40) = 50 − 40 = 10. Risk-neutral: q = 1/2, price = (1/1)·[1/2·20 + 1/2·0] = 10. Both routes agree.',
    approaches: [
      'System: Δ·120 + B = 20, Δ·80 + B = 0. Subtract: Δ·40 = 20 ⇒ Δ = 1/2. Back-sub: B = −40. Cost = 1/2·100 − 40 = 10.',
      'Risk-neutral shortcut: q = (R−d)/(u−d) = (1−4/5)/(6/5−4/5) = 1/2. Price = (1/R)·[q·V_u + (1−q)·V_d] = 1·[1/2·20 + 1/2·0] = 10.',
    ],
    wrongTurns: [
      'using p (real-world probability) instead of q in the pricing formula',
      'forgetting that B is a signed bond position (negative = borrowing)',
      'computing Δ·S_u + B and getting something other than V_u (indicates an arithmetic error)',
    ],
    hintLadder: [
      'Set up the two replication equations: Δ·S_u + B = V_u and Δ·S_d + B = V_d. First compute S_u, S_d, V_u, V_d.',
      'S_u = 120, S_d = 80. V_u = max(120−100,0) = 20, V_d = max(80−100,0) = 0. Subtract the two equations to isolate Δ.',
      'Subtracting gives Δ·(S_u − S_d) = V_u − V_d; solve for Δ, back-sub to get B, then compute Δ·S + B as the hedge cost.',
    ],
    rubric: RUBRIC,
  },
  followUps: [
    'Verify both replication equations hold: Δ·S_u + B·R = V_u and Δ·S_d + B·R = V_d (R = 1 here).',
    'Now compute the risk-neutral price independently using q = 1/2. Do the two approaches give the same answer?',
  ],
})

questions.push({
  id: 'ff-parity-put-from-call',
  tier: 'hard',
  fingerprint: 'sem:parity-put-from-call-r0-canonical',
  prompt:
    'r = 0, S = 100, K = 100, and you observe a call price C = 10. Using put-call parity, find the fair put price P.',
  source: 'Green Book §6.1 p.70 L10820/L10840 (put-call parity C−P=S−K·D); dossier problem #3',
  engineCheck: {
    module: MODULE,
    calls: [`formatRational(paritySolve({C:10,S:100,K:100,D:1}))`],
    answer: '10',
    verified: true,
  },
  hidden: {
    answer:
      'P = 10. Parity: C − P = S − K·D = 100 − 100·1 = 0, so P = C = 10.',
    approaches: [
      'C − P = S − K·D = 100 − 100 = 0 ⇒ P = C = 10.',
      'Rearrange: P = C − (S − K·D) = 10 − 0 = 10.',
    ],
    wrongTurns: [
      'computing P = S − K·D + C (sign error)',
      'forgetting to compute S − K·D first before isolating P',
      'not recognizing that at-money and r=0 forces C = P by parity',
    ],
    hintLadder: [
      'Write put-call parity: C − P = S − K·D. You know C, S, K, D. Rearrange to isolate P.',
      'S − K·D = 100 − 100·1. Compute this first, then rearrange C − P = (that value) for P.',
      'After computing S − K·D, isolate P: P = C − (S − K·D). Substitute and simplify.',
    ],
    rubric: RUBRIC,
  },
  followUps: [
    'Why does C = P when S = K and r = 0? Give an intuitive argument.',
    'If you buy the call and sell the put, what position have you created? What is its payoff at expiry?',
  ],
})

questions.push({
  id: 'ff-conversion-arb-gap',
  tier: 'harder',
  fingerprint: 'sem:conversion-arb-gap-K95-r0-gap1',
  prompt:
    'Market quotes: S = 100, K = 95, r = 0 (D = 1), C = 8, P = 2. Compute the put-call parity gap (C − P) − (S − K·D). If nonzero, identify the arbitrage trade and the locked profit.',
  source:
    'Green Book §6.1 p.70 L10820/L10840 (parity arb, conversion/reversal); dossier problem #5',
  engineCheck: {
    module: MODULE,
    calls: [`formatRational(parityGap(8,2,100,95,1))`],
    answer: '1',
    verified: true,
  },
  hidden: {
    answer:
      'gap = 1 > 0. Option side is overpriced. Conversion trade: sell C, buy P, buy S, borrow K·D = 95. Net cash today = (8 − 2) − (100 − 95) = 6 − 5 = 1 (locked profit). The position self-liquidates at expiry.',
    approaches: [
      '(C − P) − (S − K·D) = (8 − 2) − (100 − 95·1) = 6 − 5 = 1. Positive gap ⇒ conversion arb: sell C, buy P, buy stock, borrow K.',
      'Parity says C − P = S − K (r=0). Here LHS = 6 > RHS = 5, so the LHS is rich; sell it and buy the RHS.',
    ],
    wrongTurns: [
      'computing (S − K·D) − (C − P) and getting the wrong sign',
      'concluding no arb when gap = 1 ≠ 0',
      'naming the wrong trade (reversal vs conversion)',
    ],
    hintLadder: [
      'Parity gap = (C − P) − (S − K·D). Compute the left side (option spread) and the right side (stock minus discounted strike) separately.',
      'Left side: C − P = 8 − 2 = 6. Right side: S − K·D = 100 − 95·1 = 5. Now subtract right from left to get the gap.',
      'If the gap is positive, the option side is overpriced; run a conversion — sell the option spread and buy the synthetic forward — locking in the gap as profit.',
    ],
    rubric: RUBRIC,
  },
  followUps: [
    'What does the conversion trade look like at expiry when S_T > 95? When S_T < 95?',
    'If the gap were negative, what trade would you run instead (reversal)?',
  ],
})

questions.push({
  id: 'ff-two-step-call-price',
  tier: 'brutal',
  fingerprint: 'sem:two-step-binomial-call-K100-canonical-11',
  prompt:
    'Two-step binomial tree: S = 100, u = 6/5, d = 4/5, R = 1 (r = 0), K = 100. Three terminal nodes exist at expiry. Price the European call by risk-neutral backward induction.',
  source:
    'Green Book §5.3 backward induction L9497 + §6.1 risk-neutral L11002; dossier problem #10',
  engineCheck: {
    module: MODULE,
    calls: [`formatRational(binomialPrice(100,6/5,4/5,1,100,2,'call'))`],
    answer: '11',
    verified: true,
  },
  hidden: {
    answer:
      'price = 11. q = 1/2. Terminals: S·u² = 144 (payoff 44), S·u·d = 96 (payoff 0), S·d² = 64 (payoff 0). Weights: 1/4, 1/2, 1/4. Price = 1/4·44 + 1/2·0 + 1/4·0 = 11.',
    approaches: [
      'q = (1−4/5)/(6/5−4/5) = 1/2. Terminals: 144 (payoff 44), 96 (payoff 0), 64 (payoff 0). Weights: C(2,2)·(1/2)² = 1/4, C(2,1)·(1/2)² = 1/2, C(2,0)·(1/2)² = 1/4. Price = 1·(1/4·44) = 11.',
      'Backward induction: at t=1 up-node: call = (1/1)·[1/2·44 + 1/2·0] = 22. At t=1 down-node: call = 0. At t=0: price = (1/1)·[1/2·22 + 1/2·0] = 11.',
    ],
    wrongTurns: [
      'using n=1 formula (forgetting there are n=2 steps)',
      'computing payoffs at only 2 terminals instead of all 3',
      'forgetting to discount by R^2 (here R=1 so the discount is trivial, but must be acknowledged)',
    ],
    hintLadder: [
      'Map out the 3 terminal stock prices: S·u², S·u·d, S·d². Compute the call payoff max(S_T − K, 0) at each. Find q first.',
      'q = (R−d)/(u−d). Terminals: 100·(6/5)², 100·(6/5)·(4/5), 100·(4/5)². Payoffs: apply max(·−100,0). Binomial weights: C(2,k)·q^k·(1−q)^(2−k).',
      'Price = (1/R²)·∑ weight_k · payoff_k; with R = 1, just sum the weighted payoffs over the three terminals.',
    ],
    rubric: RUBRIC,
  },
  followUps: [
    'Price the put with K = 100 on the same two-step tree and verify parity: C − P = S − K·R^(−2).',
    'What are the replicating Δ and B at each of the two t=1 nodes?',
  ],
})

questions.push({
  id: 'ff-delta-is-hedge-ratio',
  tier: 'brutal',
  fingerprint: 'sem:delta-equals-cov-var-hedge-ratio-canonical',
  prompt:
    'Canonical one-step tree: S = 100, u = 6/5, d = 4/5, r = 0. The call delta is Δ = (V_u − V_d)/(S(u−d)). Show that this equals the Cov/Var hedge ratio from portfolio theory and compute the common value.',
  source:
    'Green Book §4.5 p.48 L7647 (h* = Cov/Var) + §6.1 L11002 (delta); dossier problems #8, #16',
  engineCheck: {
    module: MODULE,
    calls: [`formatRational(replicate(100,6/5,4/5,1,100,'call').delta)`],
    answer: '1/2',
    verified: true,
  },
  hidden: {
    answer:
      'Δ = 1/2. Delta route: (V_u − V_d)/(S(u−d)) = (20 − 0)/(100·2/5) = 20/40 = 1/2. Hedge-ratio route: Cov(V,S)/Var(S). V = (20, 0) with q=1/2: E[V]=10, E[S]= 100, Cov = q·20·120 + (1−q)·0·80 − 10·100 = 1200 − 1000 = 200. Var(S) = q·120² + (1−q)·80² − 100² = (14400+6400)/2 − 10000 = 10400 − 10000 = 400. h = 200/400 = 1/2.',
    approaches: [
      'Δ = (V_u − V_d)/(S(u−d)) = (20 − 0)/(100·(2/5)) = 20/40 = 1/2.',
      'Cov/Var: Cov(V,S) = E[VS] − E[V]E[S] = (1/2·20·120 + 1/2·0·80) − 10·100 = 1200 − 1000 = 200. Var(S) = 400. h = 200/400 = 1/2.',
    ],
    wrongTurns: [
      'computing (V_u − V_d)/(S_u − S_d) — same numerically but S(u−d) is the correct denominator',
      'using the real p instead of q in the Cov/Var computation',
      'omitting the Cov/Var derivation and only giving the delta (the question asks for both)',
    ],
    hintLadder: [
      'Compute the call delta two ways: (1) directly as (V_u − V_d)/(S(u−d)), and (2) as Cov(V,S)/Var(S) using the risk-neutral distribution with q = 1/2.',
      'Delta route: V_u = max(120−100,0) = 20, V_d = 0. S(u−d) = 100·(6/5−4/5) = 100·(2/5) = 40. Divide (V_u − V_d) by 40.',
      'For the hedge-ratio route: compute E[V], E[S], E[VS] under q; then Cov = E[VS] − E[V]E[S] and Var(S) = E[S²] − E[S]²; take the ratio.',
    ],
    rubric: RUBRIC,
  },
  followUps: [
    'Why must the delta route and the Cov/Var route give the same answer?',
    'What does Δ = 1/2 mean for the replicating portfolio?',
  ],
})

questions.push({
  id: 'ff-min-var-weight-A',
  tier: 'brutal',
  fingerprint: 'sem:min-var-weights-GB-6-7-in-A',
  prompt:
    'Two-stock minimum-variance portfolio (Green Book §6.4). σ_A = 1/5, σ_B = 3/10, ρ = 1/2. Hence Var(A) = 1/25, Var(B) = 9/100, Cov(A,B) = ρ·σ_A·σ_B = 3/100. Find the minimum-variance weight in asset A (w_A).',
  source:
    'Green Book §6.4 p.82-83 L12795 (min-variance two-stock, w_A = 6/7, w_B = 1/7); dossier problem #20',
  engineCheck: {
    module: MODULE,
    calls: [`formatRational(minVarWeights(1/25,9/100,3/100).wA)`],
    answer: '6/7',
    verified: true,
  },
  hidden: {
    answer:
      'w_A = 6/7. Denominator = Var(A) + Var(B) − 2·Cov = 1/25 + 9/100 − 6/100 = 4/100 + 9/100 − 6/100 = 7/100. Numerator = Var(B) − Cov = 9/100 − 3/100 = 6/100. w_A = (6/100)/(7/100) = 6/7.',
    approaches: [
      'w_A = (Var(B) − Cov)/(Var(A) + Var(B) − 2·Cov) = (9/100 − 3/100)/(1/25 + 9/100 − 6/100) = (6/100)/(7/100) = 6/7.',
      'This is the canonical Green Book §6.4 example: σ_A = 1/5, σ_B = 3/10, ρ = 1/2 ⇒ w_A = 6/7 ≈ 85.7% in A.',
    ],
    wrongTurns: [
      'using standard deviations σ in the formula instead of variances Var',
      'computing (Var(A) − Cov)/(Var(A)+Var(B)−2Cov) — wrong numerator (should be Var(B)−Cov)',
      'forgetting the −2·Cov in the denominator',
    ],
    hintLadder: [
      'The minimum-variance weight formula is w_A = (Var(B) − Cov(A,B))/(Var(A) + Var(B) − 2·Cov(A,B)). First compute Var(A), Var(B), Cov(A,B) from the given σ and ρ.',
      'Var(A) = σ_A² = (1/5)² = 1/25. Var(B) = (3/10)² = 9/100. Cov = ρ·σ_A·σ_B = (1/2)·(1/5)·(3/10) = 3/100. Now compute numerator and denominator.',
      'Numerator = Var(B) − Cov = 9/100 − 3/100. Denominator = Var(A) + Var(B) − 2·Cov. Reduce both to a common denominator before dividing.',
    ],
    rubric: RUBRIC,
  },
  followUps: [
    'What is the minimum portfolio variance Var_min = w_A²·Var(A) + w_B²·Var(B) + 2·w_A·w_B·Cov?',
    'What is w_B = 1 − w_A? Verify Var_min < Var(A) and Var_min < Var(B).',
  ],
})

// ═════════════════════════════════════════════════════════════════════════════
// NO-LEAK guard (verbatim from scripts/validate-interview-packs.ts)
// ═════════════════════════════════════════════════════════════════════════════
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

// ═════════════════════════════════════════════════════════════════════════════
// Verify + de-dup
// ═════════════════════════════════════════════════════════════════════════════
const seen = new Set<string>()
for (const q of questions) {
  if (seen.has(q.fingerprint)) throw new Error(`duplicate fingerprint: ${q.fingerprint}`)
  seen.add(q.fingerprint)
  if (q.hidden.hintLadder.length !== 3)
    throw new Error(`hintLadder must be 3 rungs: ${q.id}`)
  if (hintRungLeaks(q.engineCheck.answer, q.hidden.hintLadder[1]))
    throw new Error(
      `hint rung 2 leaks answer "${q.engineCheck.answer}" in ${q.id}: "${q.hidden.hintLadder[1]}"`,
    )
  if (hintRungLeaks(q.engineCheck.answer, q.hidden.hintLadder[2]))
    throw new Error(
      `hint rung 3 leaks answer "${q.engineCheck.answer}" in ${q.id}: "${q.hidden.hintLadder[2]}"`,
    )
  if (!q.hidden.answer.includes(q.engineCheck.answer))
    throw new Error(
      `answer mismatch in ${q.id}: engine=${q.engineCheck.answer} hidden=${q.hidden.answer}`,
    )
  // EXACT-RATIONAL guard: no bare decimal float in engineCheck.answer
  for (const tok of q.engineCheck.answer.split(/[\s,=]+/)) {
    if (/^-?\d+\.\d+$/.test(tok))
      throw new Error(`float answer token "${tok}" in ${q.id}`)
  }
}

const byTier = (t: Tier) => questions.filter((q) => q.tier === t).length
const templated = questions.filter((q) => q.template).length

// ═════════════════════════════════════════════════════════════════════════════
// Prompts (server-only; stripped by toClientPack)
// ═════════════════════════════════════════════════════════════════════════════
const interviewerPrompt = [
  'ROLE',
  'You are a senior quantitative-research interviewer at a top trading desk (Jane Street / Citadel / IMC / Optiver), running a live mock interview on OPTIONS, PAYOFFS & NO-ARBITRAGE. Be professional, probing, and fair-but-pressured. You are interviewing one candidate, right now, on the single question below.',
  '',
  'THE QUESTION (injected at runtime)',
  '- Prompt: {{prompt}}',
  '- Tier: {{tier}}  (hard | harder | brutal — calibrate pressure, follow-up depth, AND the grading bar)',
  '- Source: {{source}}  (your context only; never read it aloud)',
  '',
  'PROTOCOL',
  '1. Ask the question once, faithfully from {{prompt}}, then let the candidate drive. ONE question at a time — never stack asks or surface the follow-ups early.',
  '2. Make them think ALOUD. Before arithmetic, force the model: "Which quantity are you actually computing — a payoff read at S_T, a put-call-parity solve or arbitrage gap, a no-arb price bound, the risk-neutral q, a binomial price, a replicating (Delta, B), a tree terminal/weight, a min-variance hedge ratio, or a Greek sign?"',
  '3. Probe, do not solve. Ask Socratic questions that test whether they have seen the no-arbitrage edge this problem turns on (see EDGE CASES). Do NOT do the derivation for them unless they are stuck.',
  '4. Release hints only when genuinely stuck or explicitly asked (see HINTS).',
  '5. After they COMMIT, work the follow-up chain (see FOLLOW-UPS).',
  '6. Then close (see SCORING).',
  '',
  'EDGE CASES TO PROBE (press the ones this question hinges on)',
  '- The risk-neutral measure is NOT a real-world probability and NOT a Bayes posterior: q=(R-d)/(u-d) is the no-arbitrage weight that makes the discounted stock a martingale; it does not depend on the true up-probability p, and it is not a belief updated by evidence. Push hard on "would your q change if I told you the stock usually goes up?" (it would not).',
  '- Price = the cost of the replicating hedge = the discounted risk-neutral expectation: price = (1/R^n)*E_q[payoff] = Delta*S + B. The two routes (replicate vs q-price) MUST agree; make them reconcile.',
  '- The option delta IS the Cov/Var hedge ratio in a new costume: Delta=(V_u-V_d)/(S(u-d)) is the share count that cancels risk, exactly the h=Cov/Var of the min-variance hedge. Push the analogy.',
  '- Payoffs are piecewise-linear: call max(S-K,0), put max(K-S,0); spreads/straddles/butterflies/strangles ADD leg payoffs; protective put = max(S_T,K). Watch for sign/leg errors and the cap of a bull spread (K2-K1).',
  '- Put-call parity is an exact identity: C-P = S - K*D (D the rational discount; r=0 => C-P=S-K). A parity gap (C-P)-(S-K*D) != 0 is a conversion/reversal arbitrage — make them name the trade and the locked profit |gap|.',
  '- Black-Scholes is the IRRATIONAL continuous limit and is NEVER the graded answer: c=S*N(d1)-K*e^(-rT)*N(d2) and the continuous Greeks Delta=N(d1), Gamma, vega, Theta carry the normal CDF N(.) and are irrational. The exact binomial Delta replaces N(d1); grade the binomial price/Delta and the variances/weights, never a Black-Scholes price, an implied vol, or a sqrt-of-variance (the same "grade rho^2 not the irrational rho" discipline). Greek SIGNS are exact (call Delta +, put Delta -, Gamma +, vega +, Theta -, call rho +, put rho -); magnitudes are display-only.',
  '- The one-touch digital on a martingale (S0=1, r=0) that pays $1 when S first hits H is worth exactly 1/H, replicated by buying 1/H shares — a fully rational exotic.',
  '',
  'HINTS — escalating, ONLY when stuck',
  'Use {{hidden.hintLadder}} = [nudge, stronger, near-reveal]. Release ONE rung at a time, in order, after a visible stuck-signal. The near-reveal points at the METHOD only — it must not state the final number.',
  '',
  'NO-ANSWER-LEAK (critical)',
  'Before the candidate commits, NEVER state, approximate, confirm, or deny the final answer, and NEVER reveal {{hidden.answer}}. Do not paste or paraphrase any part of the hidden record ({{hidden.answer}}, {{hidden.approaches}}, {{hidden.wrongTurns}}, {{hidden.hintLadder}}, {{hidden.rubric}}). If asked "is that right?" mid-solve, redirect ("walk me through why") rather than confirm.',
  '',
  'GROUNDING (critical)',
  "Treat {{hidden.answer}} and {{hidden.approaches}} as GROUND TRUTH — verified by this concept's exact-rational engine (src/engine/options.ts). Do NOT re-derive the math yourself and do NOT \"correct\" the ground truth even if your mental arithmetic disagrees. Accept ANY mathematically-equivalent exact form: an equal unreduced fraction, the \"n/d\" form, an integer, or a signed integer for a Greek sign. Use {{hidden.wrongTurns}} to RECOGNIZE a misconception, not to lead the candidate into it. Grade ONLY against the rubric.",
  '',
  'FOLLOW-UPS — after they commit',
  'Ask {{followUps}} in order, one at a time (typical chain: now flip r to 1/4 and re-price, now price the put on the same tree and verify parity, now state the replicating Delta and bond, now hedge it, now take n->infinity toward the Black-Scholes limit and say why it is not graded). Keep the no-leak and hint rules in force.',
  '',
  'SCORING — close with FEED-FORWARD, never a verdict (spec-23 / ADR-0010)',
  'Close with structured FEED-FORWARD, NOT a hire decision. Produce five "next fix" cards — one per concept method-spine (payoffs; put-call-parity / no-arbitrage; risk-neutral pricing; the binomial tree; delta-hedging) — each naming the single highest-leverage next action, scored against {{hidden.rubric}} SCALED TO {{tier}} (a brutal question is graded on the brutal bar; never deflate a brutal answer with the hard rubric, and never inflate a hard answer with the brutal one). Then give a predicted-vs-measured CALIBRATION delta from the candidate\'s stated confidence, and REWARD correctly-low confidence on a hard/brutal item (disciplined bet-sizing is the trader\'s edge). End with a one-sentence pressureNote that frames the result as under-pressure retrieval and reappraises arousal as readiness — encouraging and task-focused, never shame. Do NOT output a hire/no-hire signal, an overall 1-5, or ANY person-level verdict or score — only task-and-process feed-forward (Kluger & DeNisi; Hattie & Timperley; ADR-0010).',
  '',
  'INJECTION NOTE',
  "At runtime the live feature replaces every {{...}} placeholder with the drawn question's fields; treat the filled-in values as the entire ground truth for this interview.",
].join('\n')

const generatorPrompt = [
  'ROLE',
  'You generate ONE fresh, hard, real-quant-style OPTIONS / NO-ARBITRAGE interview question on demand, to top up a pre-built pool without repeating one a student has seen. Every question must be (a) a realistic quant-interview question anchored to the canon, (b) engine-verifiable before serving, and (c) structurally new vs an avoid-list. Otherwise you REFUSE. Output is a single JSON object and nothing else.',
  '',
  'SCOPE — only the options / no-arbitrage canon (Green Book Ch.6) and direct relatives',
  '- piecewise-linear payoffs: call max(S-K,0), put max(K-S,0), and composed legs (straddle, bull/bear spread, butterfly, strangle, protective put).',
  '- put-call parity C-P = S - K*D, the parity arbitrage gap, and no-arb price bounds for a call/put.',
  '- the one-step binomial: risk-neutral q=(R-d)/(u-d), price=(1/R)*E_q[payoff], replication {Delta=(V_u-V_d)/(S(u-d)), B=price-Delta*S}.',
  '- the multi-step tree: terminals S*u^k*d^(n-k), node weights nCk*q^k(1-q)^(n-k), path counts nCk, price by backward induction.',
  '- hedging & exotics: the min-variance hedge ratio h=Cov/Var (= the option delta), the two-stock min-variance weights, the one-touch digital 1/H, and the exact Greek signs.',
  '',
  'REAL-QUANT-STYLE (mandatory)',
  'Anchor every question to the actual canon: the Green Book Finance chapter (6.1 option pricing & put-call parity, 6.2 the Greeks & the one-touch digital, 6.3 spreads/straddles/digitals, 6.4 min-variance portfolio; 4.5 the optimal hedge ratio; 5.3 backward induction). It must read like a real desk question — NEVER an arbitrary engine-solvable puzzle.',
  '',
  'PREFER TEMPLATES (first choice); free-form only as fallback',
  'Parameterize an engine-backed template and set template.id + template.params:',
  '- payoff at S_T (single or composed)   -> tmpl-payoff         -> spreadPayoff(legs, S_T)',
  '- solve a missing parity leg           -> tmpl-parity-solve   -> paritySolve(known)',
  '- put-call-parity arbitrage gap        -> tmpl-parity-gap     -> parityGap(C,P,S,K,D)',
  '- no-arbitrage price bound             -> tmpl-bounds         -> callBounds/putBounds(S,K,D)',
  '- risk-neutral probability             -> tmpl-rn-q           -> riskNeutralQ(u,d,R)',
  '- binomial price (n>=1)                -> tmpl-binomial-price -> binomialPrice(S,u,d,R,K,n,kind)',
  '- replicating delta / bond             -> tmpl-replicate      -> replicate(S,u,d,R,K,kind)',
  '- multi-step tree terminal             -> tmpl-tree-terminal  -> treeTerminals(S,u,d,n)[i]',
  '- multi-step node weight               -> tmpl-tree-weight    -> treeWeights(q,n)[i]',
  '- path count to a node                 -> tmpl-path-count     -> pathCount(n,k)',
  '- min-variance hedge ratio             -> tmpl-hedge-ratio    -> hedgeRatio(cov,varB)',
  '- two-stock min-variance weights/var   -> tmpl-min-var        -> minVarWeights(varA,varB,cov)',
  '- one-touch digital                    -> tmpl-one-touch      -> oneTouchPrice(H)',
  '- Greek sign                           -> tmpl-greek-sign     -> greekSign(greek,kind)',
  'Emit free-form ONLY if no template fits, with fingerprint "sem:<hash>".',
  '',
  'ENGINE-VERIFY-BEFORE-SERVE (hard fence)',
  'Output must carry the exact call(s) to reproduce the answer with src/engine/options.ts so the feature can RUN the engine and REJECT anything unverifiable. In engineCheck put module = "src/engine/options.ts", calls = the exact call(s) with concrete args, answer = the exact engine value via formatRational. CRITICAL EXACT-RATIONAL rule: every answer MUST be an exact rational ("n/d" or an integer) or a signed integer Greek sign — NEVER a float. Choose u, d, R as exact rationals so q, price, Delta, B, and the n-step weights stay rational (the 6/5, 4/5, R=1 family with q=1/2 is cleanest); prefer r=0 => D=1, R=1, or a given rational D/R. FORBIDDEN as a graded answer: any Black-Scholes price, any continuous Greek MAGNITUDE (N(d1) etc.), any implied vol, and any sqrt-of-variance / standard deviation — those are irrational and display-only.',
  '',
  'AVOID-LIST / NO-OVERLAP',
  "You are given avoidList (the student's seen-set union the global pool). Your fingerprint MUST NOT be in it. Fingerprint = \"<templateId>:<normalized-params>\" (e.g. tmpl-binomial-price:S=100,u=6/5,d=4/5,R=1,K=100,n=1,kind=call) or \"sem:<hash>\" for free-form. If it collides, change params/structure or REFUSE.",
  '',
  'OUTPUT SCHEMA (emit EXACTLY one JSON object, no prose, no code fences)',
  '{ "tier": "hard|harder|brutal", "fingerprint": "...", "template": { "id": "...", "params": {} }, "prompt": "...", "source": "...", "engineCheck": { "module": "src/engine/options.ts", "calls": ["..."], "answer": "..." }, "hidden": { "answer": "...", "approaches": ["..."], "wrongTurns": ["..."], "hintLadder": ["nudge","stronger","near-reveal"], "rubric": { "correctness": "...", "approach": "...", "rigor": "...", "communication": "...", "speed": "..." } }, "followUps": ["...","..."] }',
  '',
  'FIELD RULES',
  '- tier floor is "hard" (always harder than any lesson mastery challenge); the rubric must be written to SCALE with the tier (a brutal question expects a full multi-step synthesis). hintLadder is EXACTLY 3 rungs; the near-reveal gives METHOD only, never the final number.',
  '- hidden.answer MUST contain engineCheck.answer (the verified value). You may add a short gloss (e.g. "price 11, Delta=1/2") but the exact engine string must appear.',
  '- source: anchor to the Green Book Finance chapter (Zhou 6.1-6.4 pp.69-85, 4.5 p.48, 5.3 p.61) or another sourced real quant-interview question (Cudina, Worrall, AnalystPrep for the explicit tree).',
  '',
  'SELF-REJECTION',
  'If you cannot produce a question that is simultaneously real-quant-style + anchored, engine-verifiable, exact-rational (no float; no Black-Scholes price / continuous-Greek magnitude / implied vol / sqrt-of-variance), and structurally new, output exactly: { "refusal": true, "reason": "<not-anchored | not-engine-verifiable | not-exact-rational | out-of-range | no-new-fingerprint>" }',
].join('\n')

// ═════════════════════════════════════════════════════════════════════════════
// Pack object
// ═════════════════════════════════════════════════════════════════════════════
const pack = {
  version: 1 as const,
  kind: 'interview-pack' as const,
  courseId: 'course-options',
  concept: 'Options, Payoffs & No-Arbitrage',
  greenBookAnchor:
    'A Practical Guide To Quantitative Finance Interviews (Xinfeng Zhou), Chapter 6 — Finance: §6.1 Option Pricing pp.69-73 (call/put payoffs max(S−K,0)/max(K−S,0) L10744; put-call parity C−P=S−K·e^(−rT) L10820/L10840; risk-neutral pricing price=e^(−rT)·E_Q[payoff] L11002/L11319; Black-Scholes c=S·N(d1)−K·e^(−rT)·N(d2) L11274, display-only); §6.2 The Greeks p.75 (Greek signs L11736; one-touch digital = 1/H L11741); §6.3 Option Portfolios & Exotics p.80 (straddle |S_T−K| L12552; bull spread bounded by e^(−rT)(K₂−K₁) Table 6.3 L12449); §6.4 Other pp.82-85 (min-variance two-stock 6/7,1/7 L12795); §4.5 optimal hedge ratio h=Cov/Var p.48 L7647; §5.3 backward induction p.61 L9497. Grounded by the concept source-dossier (22 sourced problems; 20 exact-rational graded + 2 Black-Scholes/continuous-Greek display-only).',
  engineModule: 'src/engine/options.ts',
  generator: 'interviews/_build/build-options-pack.ts',
  note: "Dormant capstone asset: committed but NOT seeded/deployed (the seed glob matches only fixtures/course-*.json | fixtures/lesson-*.json; this lives under interviews/). Self-describing via `version`. EXACT-RATIONAL contract (ADR-0005): every engineCheck.answer is reproduced by src/engine/options.ts as an exact rational (\"n/d\", integer, or signed-integer Greek sign) — never a float. Black-Scholes price, continuous-Greek magnitudes, implied vol, and sqrt-of-variance are IRRATIONAL and display-only context only, NEVER graded — the binomial Delta replaces N(d1) and variances/weights are graded, never the standard deviation (the same \"grade rho^2 not rho\" discipline as covariance).",
  counts: {
    total: questions.length,
    byTier: {
      hard: byTier('hard'),
      harder: byTier('harder'),
      brutal: byTier('brutal'),
    },
    templated,
    freeForm: questions.length - templated,
  },
  templates: [
    {
      id: 'tmpl-payoff',
      title: 'Option payoff at expiry',
      source: 'GB §6.1 p.69 L10744, §6.3 p.80 L12449/L12552',
      description: 'spreadPayoff(legs, S_T): single or multi-leg piecewise-linear payoff.',
      engineModule: MODULE,
    },
    {
      id: 'tmpl-parity-solve',
      title: 'Solve for missing parity leg',
      source: 'GB §6.1 p.70 L10820/L10840',
      description: 'paritySolve(known): rearrange C−P=S−K·D for the missing quantity.',
      engineModule: MODULE,
    },
    {
      id: 'tmpl-parity-gap',
      title: 'Put-call-parity arbitrage gap',
      source: 'GB §6.1 p.70 L10820/L10840',
      description: 'parityGap(C,P,S,K,D): compute (C−P)−(S−K·D) to detect conversion/reversal arb.',
      engineModule: MODULE,
    },
    {
      id: 'tmpl-bounds',
      title: 'No-arbitrage price bounds',
      source: 'GB §6.3 p.80 L12501',
      description: 'callBounds/putBounds(S,K,D): lo/hi no-arb price bounds for a European option.',
      engineModule: MODULE,
    },
    {
      id: 'tmpl-rn-q',
      title: 'Risk-neutral probability',
      source: 'GB §6.1 L11002',
      description: 'riskNeutralQ(u,d,R): q=(R−d)/(u−d), the no-arb weight on the binomial tree.',
      engineModule: MODULE,
    },
    {
      id: 'tmpl-binomial-price',
      title: 'Binomial option price (n-step)',
      source: 'GB §5.3 L9497 + §6.1 L11002',
      description: 'binomialPrice(S,u,d,R,K,n,kind): exact rational price by risk-neutral backward induction.',
      engineModule: MODULE,
    },
    {
      id: 'tmpl-replicate',
      title: 'Replicating delta and bond',
      source: 'GB §6.1 L11002 + §5.3 L9497',
      description: 'replicate(S,u,d,R,K,kind): Delta=(V_u−V_d)/(S(u−d)), bond=price−Delta·S.',
      engineModule: MODULE,
    },
    {
      id: 'tmpl-tree-terminal',
      title: 'Multi-step tree terminal price',
      source: 'GB §5.3 L9497 + §6.1 L11319',
      description: 'treeTerminals(S,u,d,n)[i]: i-th terminal stock price (highest first) on an n-step tree.',
      engineModule: MODULE,
    },
    {
      id: 'tmpl-tree-weight',
      title: 'Multi-step binomial node weight',
      source: 'GB §5.3 L9497 + §6.1 L11319',
      description: 'treeWeights(q,n)[i]: risk-neutral binomial weight at index i (C(n,n−i)·q^(n−i)·(1−q)^i).',
      engineModule: MODULE,
    },
    {
      id: 'tmpl-path-count',
      title: 'Binomial path count',
      source: 'GB §5.3 L9497 + §6.1 L11319',
      description: 'pathCount(n,k): number of paths with exactly k up-moves in n steps = C(n,k).',
      engineModule: MODULE,
    },
    {
      id: 'tmpl-hedge-ratio',
      title: 'Minimum-variance hedge ratio',
      source: 'GB §4.5 p.48 L7647',
      description: 'hedgeRatio(cov,varB): h*=Cov(A,B)/Var(B), the Cov/Var optimal hedge.',
      engineModule: MODULE,
    },
    {
      id: 'tmpl-min-var',
      title: 'Two-stock minimum-variance weights',
      source: 'GB §6.4 p.82-83 L12795',
      description: 'minVarWeights(varA,varB,cov): wA, wB, varMin for the two-asset MVP.',
      engineModule: MODULE,
    },
    {
      id: 'tmpl-one-touch',
      title: 'One-touch digital price',
      source: 'GB §6.2 p.75 L11741',
      description: 'oneTouchPrice(H): price = 1/H for a one-touch that pays $1 at first hitting of H (r=0, S0=1).',
      engineModule: MODULE,
    },
    {
      id: 'tmpl-greek-sign',
      title: 'Greek sign (exact)',
      source: 'GB §6.2 p.75 L11736',
      description: 'greekSign(greek,kind): exact signed-integer sign of a Black-Scholes Greek (+1/−1/0).',
      engineModule: MODULE,
    },
  ],
  interviewerPrompt,
  generatorPrompt,
  questions,
}

// ═════════════════════════════════════════════════════════════════════════════
// Write JSON
// ═════════════════════════════════════════════════════════════════════════════
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..')
writeFileSync(join(outDir, 'course-options.json'), JSON.stringify(pack, null, 2) + '\n')

// ═════════════════════════════════════════════════════════════════════════════
// Markdown mirror
// ═════════════════════════════════════════════════════════════════════════════
const md: string[] = []
md.push(`# Interview Pack — ${pack.concept} (\`${pack.courseId}\`)`)
md.push('')
md.push(
  `> Dormant capstone asset — committed, NOT seeded/deployed. Regenerate with \`./node_modules/.bin/tsx ${pack.generator}\`.`,
)
md.push('')
md.push(`**Anchor:** ${pack.greenBookAnchor}`)
md.push('')
md.push(`**Engine:** \`${pack.engineModule}\` — every answer is engine-verified (exact rational, no floats).`)
md.push('')
md.push(
  `**Counts:** ${pack.counts.total} questions (hard ${pack.counts.byTier.hard}, harder ${pack.counts.byTier.harder}, brutal ${pack.counts.byTier.brutal}; ${pack.counts.templated} templated, ${pack.counts.freeForm} free-form).`,
)
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
writeFileSync(join(outDir, 'course-options.md'), md.join('\n') + '\n')

console.log(
  `\u2713 wrote interviews/course-options.json (${questions.length} questions: hard ${byTier('hard')}, harder ${byTier('harder')}, brutal ${byTier('brutal')}; ${templated} templated, ${questions.length - templated} free-form)`,
)
console.log(`\u2713 wrote interviews/course-options.md`)
