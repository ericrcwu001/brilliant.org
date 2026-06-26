#!/usr/bin/env tsx
// interviews/_build/build-pattern-hitting-times-pack.ts
// Generator for interviews/course-pattern-hitting-times.json
// EVERY answer is computed by the real PHT engines (automaton / race / walk /
// correlation) — engine-verified by construction. Deterministic: no timestamps,
// no Date, no randomness. Re-running produces byte-identical JSON.
//
// Template param shapes MUST match scripts/validate-interview-packs.ts
// (recomputePHT) and the two PHT verifiers, or the cross-checks fail.

import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Rational } from '../../src/engine/types'
import {
  buildAutomaton,
  prefixFunction,
  solveLinearSystem,
  ratAdd,
  ratSub,
  reduce,
} from '../../src/engine/automaton'
import { penneyOdds, bestBeater } from '../../src/engine/race'
import { buildWalk } from '../../src/engine/walk'
import { expectedWaitFair } from '../../src/engine/correlation'

// ── Helpers ──────────────────────────────────────────────────────────────────

const MAX_SAFE = Number.MAX_SAFE_INTEGER
const R = (n: number, d = 1): Rational => ({ n, d })

function ratStr(r: Rational): string {
  return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`
}

function assertSafe(r: Rational, ctx: string): void {
  if (!Number.isInteger(r.n) || !Number.isInteger(r.d) || Math.abs(r.n) > MAX_SAFE || Math.abs(r.d) > MAX_SAFE)
    throw new Error(`[OVERFLOW/PRECISION] ${ctx}: n=${r.n} d=${r.d}`)
}

// Assert the engine result matches a hand-derived advisory (sanity self-check),
// then return the canonical string. Advisory is optional: when omitted the
// engine output is trusted (and independently cross-checked by verify-pht-*).
function ans(r: Rational, ctx: string, advisory?: string): string {
  assertSafe(r, ctx)
  const s = ratStr(r)
  if (advisory !== undefined && s !== advisory)
    throw new Error(`[MISMATCH] ${ctx}: engine="${s}" advisory="${advisory}"`)
  return s
}

function semFp(topic: string, entities: string, params: string, ask: string): string {
  return 'sem:' + createHash('sha1').update(`${topic}|${entities}|${params}|${ask}`).digest('hex').slice(0, 12)
}

function tplFp(id: string, params: Record<string, string | number>): string {
  const seg = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join(',')
  return `${id}:${seg}`
}

// Exact rational pattern-wait for a biased coin — mirrors buildAutomaton's
// first-step system but with EXACT {n,d} probabilities (buildAutomaton's
// toRational(p) is lossy for p like 1/3). Byte-matched to validate-interview-packs.ts.
function patternWaitRational(pattern: string, p: Rational): Rational {
  const L = pattern.length
  const pi = prefixFunction(pattern)
  const q = ratSub(R(1), p)
  const next = (state: number, c: 'H' | 'T'): number => {
    let k = state
    for (;;) {
      if (c === pattern[k]) return k + 1
      if (k === 0) return 0
      k = pi[k - 1]
    }
  }
  const A: Rational[][] = []
  const b: Rational[] = []
  for (let i = 0; i < L; i++) {
    const row = new Array<Rational>(L).fill(R(0))
    row[i] = ratAdd(row[i], R(1))
    for (const c of ['H', 'T'] as const) {
      const to = next(i, c)
      const pr = c === 'H' ? p : q
      if (to < L) row[to] = ratSub(row[to], pr)
    }
    A.push(row)
    b.push(R(1))
  }
  return solveLinearSystem(A, b)[0]
}

const waitFair = (pattern: string): Rational => reduce(buildAutomaton(pattern, 0.5).expectedTimes.E0, 1)
const overlapWait = (pattern: string): Rational => reduce(expectedWaitFair(pattern), 1)

// ── Template metadata ─────────────────────────────────────────────────────────

const AUTO = 'src/engine/automaton.ts'
const RACE = 'src/engine/race.ts'
const WALK = 'src/engine/walk.ts'
const CORR = 'src/engine/correlation.ts'

const TEMPLATES = [
  { id: 'tmpl-pattern-wait', title: 'Expected flips to see a pattern (fair coin, Markov recurrence)', source: 'Green Book §5.2–5.3 p.113–128', description: 'E[flips] until an H/T pattern first appears, via the first-step state recurrence (KMP overlap).', engineModule: AUTO },
  { id: 'tmpl-biased-wait', title: 'Expected flips to see a pattern (biased coin p ≠ 1/2)', source: 'Green Book §5.2 p.113–120', description: 'Same hitting-time recurrence with p/q weights; exact rationals via the first-step solve.', engineModule: AUTO },
  { id: 'tmpl-penney-race', title: "Penney's Game — exact win probability (Conway's leading numbers)", source: 'Green Book §5.4–5.5 p.129–136', description: 'Probability one pattern beats another on a shared fair stream; win prob ≠ expected wait.', engineModule: RACE },
  { id: 'tmpl-second-mover', title: "Best counter in Penney's Game (second mover always wins)", source: 'Green Book §5.4–5.5 p.129–136', description: 'Construct bestBeater(a) and compute its win probability — the second mover always has an edge.', engineModule: RACE },
  { id: 'tmpl-gamblers-ruin', title: "Gambler's Ruin — reach probability and expected duration", source: 'Green Book §5.1 p.107–112', description: 'Boundary-value problems on a 1-D walk: P(reach N before 0 | i) and E[steps to absorption | i].', engineModule: WALK },
  { id: 'tmpl-overlap-wait', title: 'Overlap shortcut — E[wait] = Σ 2^k over self-borders', source: 'Green Book §5.3 p.121–128', description: 'Fair-coin wait via the martingale/self-border shortcut; cross-checks the Markov recurrence.', engineModule: CORR },
]

// ── Shared per-template content ────────────────────────────────────────────────

const RUB_WAIT = { correctness: 'matches the exact engine wait', approach: 'first-step state recurrence over matched-prefix states', rigor: 'mismatch falls back to the longest border (KMP), not always ∅', communication: 'explains why overlap changes the wait', speed: 'sets up and solves the small system cleanly' }
const WRONG_WAIT = ['longer pattern always waits longer', 'a mismatch always resets to the start', 'wait = 2^length', 'overlap is irrelevant to the wait']
const FOLLOW_WAIT = ['Bias the coin to p ≠ 1/2 — how does the wait change?', 'Compare this pattern to one of equal length with different overlap — why do they differ?', 'Generalize: which length-n pattern waits the longest, and why?']
const HINTS_WAIT = (pattern: string): [string, string, string] => [
  `Track only the matched-prefix states of ${pattern}: one expected-time unknown E_i per state, with E_∅ the start and the full match absorbing.`,
  `First-step each state: E_i = 1 + p·E_(next on H) + q·E_(next on T), fair p=q. On a mismatch, KMP sends you to the longest border — not always back to ∅.`,
  `Solve the small linear system from the absorbing state back down to E_∅; the overlap structure (how far a mismatch falls back) is what sets the wait — read the fallback edges, do not guess.`,
]

const RUB_BIAS = { correctness: 'matches the exact biased-coin wait (rational)', approach: 'first-step recurrence with p/q weights', rigor: 'uses exact p, q = 1−p; keeps the rational exact', communication: 'states the geometric structure of the wait', speed: 'no decimal drift; clean fraction' }
const WRONG_BIAS = ['use 1/2 weights even though the coin is biased', 'a repeated-symbol wait is 1/p (forgetting the +1/p²)', 'mixed-pair wait is 1/p not 1/(pq)', 'bias does not affect the wait']
const FOLLOW_BIAS = ['Restore a fair coin and compare — which way did the bias push the wait?', 'Which 2-pattern benefits most from this bias?', 'Generalize the repeated-symbol wait to a length-n run.']
const HINTS_BIAS = (pattern: string): [string, string, string] => [
  `Weight the first step by the coin's bias: p for H and q = 1−p for T, not 1/2, for ${pattern}.`,
  `For a 2-symbol pattern, a repeated symbol gives a geometric wait 1/r + 1/r² in that symbol's probability r; a mixed pair gives 1/(p·q).`,
  `Write E with the p/q weights and solve the small system; the same overlap/fallback logic applies as in the fair case.`,
]

const RUB_RACE = { correctness: 'matches the exact Conway odds', approach: "Conway's leading numbers, not expected waits", rigor: 'leading numbers L(x,y) correctly defined (suffix of x vs prefix of y)', communication: 'separates win probability from wait time', speed: 'four leading numbers then the odds ratio' }
const WRONG_RACE = ['the pattern with the shorter expected wait always wins', "Penney's game is transitive", 'win probability equals the wait ratio', 'L(x,y) = L(y,x)']
const FOLLOW_RACE = ['Why does this hold even though the expected waits differ?', "Is Penney's game transitive? Exhibit or rule out a beating cycle.", 'Does the second-mover advantage extend to length-4 patterns?']
const HINTS_RACE: [string, string, string] = [
  `Wait time and win probability are different objects — use Conway's leading numbers, not the expected waits.`,
  `Compute the four leading numbers L(A,A), L(A,B), L(B,A), L(B,B): for L(x,y) sum 2^(k−1) over k where the last k of x equals the first k of y.`,
  `Form odds(B beats A) = (L(A,A)−L(A,B)) : (L(B,B)−L(B,A)) and normalize to a probability; never substitute the expected waits for these.`,
]

const RUB_2MV = { correctness: 'identifies the optimal counter and its exact win prob', approach: 'bestBeater construction + Conway odds', rigor: 'counter built by the rule, win prob > 1/2 shown', communication: 'explains why the second mover always wins', speed: 'constructs the counter immediately, then the odds' }
const WRONG_2MV = ['copy the opponent shifted by one', 'mirror (flip every symbol of) the pattern', 'pick the pattern with the smallest wait', 'no counter can beat the announced pattern']
const FOLLOW_2MV = ['Is there any length-3 pattern whose best counter wins by exactly even money?', 'Does a pattern ever beat its own bestBeater?', 'How large can the second-mover edge get for length-3 patterns?']
const HINTS_2MV: [string, string, string] = [
  `The second mover can always name a pattern that beats the announced one — find that counter first.`,
  `Construct it by the rule bestBeater(a) = flip(a₂) followed by a₁…a_(n−1); then it is a standard Penney race.`,
  `Apply Conway's leading-number odds to (a, bestBeater(a)) to get the win probability; the counter always exceeds even money.`,
]

const RUB_RUIN = { correctness: 'matches the exact reach/duration value', approach: 'boundary-value recurrence with correct boundaries', rigor: 'reach (probability) kept distinct from duration (steps); biased ratio handled', communication: 'states the closed form and its boundaries', speed: 'plugs into the closed form without re-deriving' }
const WRONG_RUIN = ['reach probability and expected duration are the same object', 'fair-coin reach is 1/2 regardless of the start', 'duration is symmetric in the start even when biased', 'bias does not change the reach probability']
const FOLLOW_RUIN = ['Generalize the fair-coin formula to arbitrary N and start i.', 'Make the coin biased — does reach rise or fall from this start?', 'Why is the fair duration quadratic in the start while reach is linear?']
const HINTS_RUIN: [string, string, string] = [
  `Set up a boundary-value problem on positions 0..N: reach P_i with P_0=0, P_N=1, or duration D_i with D_0=D_N=0.`,
  `Fair coin: P_i = i/N (linear) and D_i = i·(N−i) (quadratic). Biased coin with ratio r = q/p: P_i = (1−r^i)/(1−r^N).`,
  `Plug the start i into the right closed form and keep reach (a probability) distinct from duration (a step count).`,
]

const RUB_OVL = { correctness: 'matches Σ 2^k over the borders', approach: 'self-border (overlap) shortcut + martingale justification', rigor: 'borders correctly enumerated (includes k=L)', communication: 'explains why Σ 2^k equals the wait (fair betting)', speed: 'reads borders off the pattern, no system to solve' }
const WRONG_OVL = ['only the full-length border counts', 'wait = 2^length', 'borders depend on the coin bias', 'overlap of length k contributes k, not 2^k']
const FOLLOW_OVL = ['Confirm it agrees with the Markov recurrence for this pattern.', 'Design a length-4 pattern that maximizes the wait via its borders.', 'Why does the martingale argument need a fair coin?']
const HINTS_OVL = (pattern: string): [string, string, string] => [
  `For a fair coin there is a shortcut: E[wait] = Σ 2^k over the pattern's self-borders.`,
  `A border is a length k (1 ≤ k ≤ L, including k = L) where the k-prefix equals the k-suffix of ${pattern}; list them.`,
  `Sum 2^k across those border lengths; the martingale of parlaying gamblers (each surviving border pays 2^k) proves the sum equals E[T].`,
]

// ── Question record + builder ──────────────────────────────────────────────────

type Tier = 'hard' | 'harder' | 'brutal'
interface Rubric { correctness: string; approach: string; rigor: string; communication: string; speed: string }
interface QuestionRecord {
  id: string
  tier: Tier
  fingerprint: string
  template?: { id: string; params: Record<string, unknown> }
  prompt: string
  source: string
  engineCheck: { module: string; calls: string[]; answer: string; verified: boolean }
  hidden: { answer: string; approaches: string[]; wrongTurns: string[]; hintLadder: [string, string, string]; rubric: Rubric }
  followUps: string[]
}

function mkQ(
  id: string, tier: Tier, fingerprint: string,
  template: { id: string; params: Record<string, unknown> } | undefined,
  prompt: string, source: string, module: string, calls: string[], answer: string,
  approaches: string[], wrongTurns: string[], hintLadder: [string, string, string],
  rubric: Rubric, followUps: string[],
): QuestionRecord {
  return {
    id, tier, fingerprint, ...(template ? { template } : {}), prompt, source,
    engineCheck: { module, calls, answer, verified: true },
    hidden: { answer, approaches, wrongTurns, hintLadder, rubric }, followUps,
  }
}

// ── Question generators (answers computed from the real engines) ───────────────

const T1_SRC = 'Green Book §5.2–5.3 p.113–128; src/engine/automaton.test.ts'
const T2_SRC = 'Green Book §5.2 p.113–120; src/engine/automaton.ts (biased first-step solve)'
const T3_SRC = 'Green Book §5.4–5.5 p.129–136; src/engine/race.test.ts'
const T4_SRC = 'Green Book §5.4–5.5 p.129–136; src/engine/race.ts (bestBeater + Conway odds)'
const T5_SRC = 'Green Book §5.1 p.107–112; src/engine/walk.test.ts'
const T6_SRC = 'Green Book §5.3 p.121–128; src/engine/correlation.test.ts'

function q1(pattern: string, tier: Tier, advisory?: string): QuestionRecord {
  const a = ans(waitFair(pattern), `t1-${pattern}`, advisory)
  return mkQ(
    `tmpl-pattern-wait#${pattern}`, tier, tplFp('tmpl-pattern-wait', { pattern }),
    { id: 'tmpl-pattern-wait', params: { pattern } },
    `A fair coin is flipped repeatedly. What is the expected number of flips until the pattern ${pattern} first appears? Set up the state recurrence and solve it — and say why overlap, not length alone, controls the answer.`,
    T1_SRC, AUTO, [`buildAutomaton('${pattern}', 0.5).expectedTimes.E0`], a,
    [`Define E_i for each matched-prefix state of ${pattern}; first-step E_i = 1 + ½E_(next on H) + ½E_(next on T); solve back to E_∅.`, `Equivalently sum 2^k over the self-borders of ${pattern} (the overlap shortcut).`],
    WRONG_WAIT, HINTS_WAIT(pattern), RUB_WAIT, FOLLOW_WAIT,
  )
}

function q2(pattern: string, pNum: number, pDen: number, tier: Tier, advisory?: string): QuestionRecord {
  const a = ans(patternWaitRational(pattern, R(pNum, pDen)), `t2-${pattern}-${pNum}/${pDen}`, advisory)
  return mkQ(
    `tmpl-biased-wait#${pattern}-p${pNum}_${pDen}`, tier, tplFp('tmpl-biased-wait', { pattern, pNum, pDen }),
    { id: 'tmpl-biased-wait', params: { pattern, pNum, pDen } },
    `A biased coin shows heads with probability ${pNum}/${pDen} (tails ${pDen - pNum}/${pDen}). What is the expected number of flips until ${pattern} first appears? Keep the answer an exact rational.`,
    T2_SRC, AUTO, [`first-step solve for '${pattern}' at p=${pNum}/${pDen} (automaton prefixFunction + solveLinearSystem)`], a,
    [`First-step recurrence with weights p=${pNum}/${pDen}, q=${pDen - pNum}/${pDen}; solve the small system exactly.`, `For a repeated symbol the wait is 1/r + 1/r²; for a mixed pair it is 1/(p·q).`],
    WRONG_BIAS, HINTS_BIAS(pattern), RUB_BIAS, FOLLOW_BIAS,
  )
}

function q3(a: string, b: string, tier: Tier, advisory?: string): QuestionRecord {
  const answer = ans(penneyOdds(a, b).bBeatsA, `t3-${a}-vs-${b}`, advisory)
  return mkQ(
    `tmpl-penney-race#${a}-vs-${b}`, tier, tplFp('tmpl-penney-race', { a, b }),
    { id: 'tmpl-penney-race', params: { a, b } },
    `Two players race on ONE shared stream of fair coin flips: A wins if ${a} appears first, B wins if ${b} appears first. What is the probability that B (${b}) wins? Note the answer is NOT determined by the expected waits.`,
    T3_SRC, RACE, [`penneyOdds('${a}', '${b}').bBeatsA`], answer,
    [`Conway leading numbers: L(A,A)=Σ2^(k−1) over self-overlaps of ${a}, similarly L(A,B), L(B,A), L(B,B); P(B wins) = (L(A,A)−L(A,B)) / ((L(A,A)−L(A,B)) + (L(B,B)−L(B,A))).`, `Cross-check by simulating the shared stream — win frequency converges to the same value.`],
    WRONG_RACE, HINTS_RACE, RUB_RACE, FOLLOW_RACE,
  )
}

function q4(a: string, tier: Tier, advisory?: string): QuestionRecord {
  const b = bestBeater(a)
  const answer = ans(penneyOdds(a, b).bBeatsA, `t4-${a}`, advisory)
  return mkQ(
    `tmpl-second-mover#${a}`, tier, tplFp('tmpl-second-mover', { a }),
    { id: 'tmpl-second-mover', params: { a } },
    `Your opponent announces the length-${a.length} pattern ${a} in a Penney's game on a fair coin, and you choose second. Pick the pattern that maximizes your win probability and state that probability exactly.`,
    T4_SRC, RACE, [`penneyOdds('${a}', bestBeater('${a}')).bBeatsA`], answer,
    [`Build the counter by bestBeater(${a}) = flip(${a}[1]) + ${a}[0..n−2], then apply Conway's odds.`, `The construction guarantees a win probability strictly above 1/2 for every length-3 pattern.`],
    WRONG_2MV, HINTS_2MV, RUB_2MV, FOLLOW_2MV,
  )
}

function q5(N: number, pNum: number, pDen: number, i: number, query: 'reach' | 'duration', tier: Tier, advisory?: string): QuestionRecord {
  const w = buildWalk(N, pNum / pDen)
  const r = query === 'duration' ? w.duration[i] : w.reachProb[i]
  const answer = ans(r, `t5-N${N}-p${pNum}/${pDen}-i${i}-${query}`, advisory)
  const fair = pNum * 2 === pDen
  const stepDesc = fair ? 'fair' : `biased (P(+1)=${pNum}/${pDen})`
  const askDesc = query === 'duration'
    ? `the expected number of steps until the walk is absorbed at 0 or ${N}`
    : `the probability of reaching ${N} before hitting 0`
  return mkQ(
    `tmpl-gamblers-ruin#N${N}-p${pNum}_${pDen}-i${i}-${query}`, tier, tplFp('tmpl-gamblers-ruin', { N, pNum, pDen, i, query }),
    { id: 'tmpl-gamblers-ruin', params: { N, pNum, pDen, i, query } },
    `A gambler does a ${stepDesc} random walk between absorbing barriers 0 (ruin) and ${N} (win), stepping +1 with probability ${pNum}/${pDen} and −1 otherwise. Starting at ${i}, what is ${askDesc}?`,
    T5_SRC, WALK, [`buildWalk(${N}, ${pNum}/${pDen}).${query === 'duration' ? 'duration' : 'reachProb'}[${i}]`], answer,
    query === 'duration'
      ? [`Solve D_i = 1 + p·D_(i+1) + q·D_(i−1) with D_0 = D_N = 0; fair coin gives D_i = i·(N−i).`, `Each step costs 1; total cost is the expected absorption time, not a probability.`]
      : [`Solve P_i = p·P_(i+1) + q·P_(i−1) with P_0 = 0, P_N = 1; fair coin gives P_i = i/N.`, `Biased: P_i = (1−r^i)/(1−r^N) with r = q/p.`],
    WRONG_RUIN, HINTS_RUIN, RUB_RUIN, FOLLOW_RUIN,
  )
}

function q6(pattern: string, tier: Tier, advisory?: string): QuestionRecord {
  const a = ans(overlapWait(pattern), `t6-${pattern}`, advisory)
  return mkQ(
    `tmpl-overlap-wait#${pattern}`, tier, tplFp('tmpl-overlap-wait', { pattern }),
    { id: 'tmpl-overlap-wait', params: { pattern } },
    `Using the overlap (self-border) shortcut — not a full state machine — find the expected number of fair-coin flips until ${pattern} first appears, and justify the shortcut with the martingale argument.`,
    T6_SRC, CORR, [`expectedWaitFair('${pattern}')`], a,
    [`Enumerate the self-borders of ${pattern} (lengths k where the k-prefix equals the k-suffix, including k=L), then sum 2^k.`, `Martingale: a fresh gambler enters each flip betting on ${pattern}; the survivors at the stop are exactly the borders, paying Σ 2^k = E[T].`],
    WRONG_OVL, HINTS_OVL(pattern), RUB_OVL, FOLLOW_OVL,
  )
}

// ── Question set ────────────────────────────────────────────────────────────────

const questions: QuestionRecord[] = [
  // T1 — fair pattern-wait (Markov recurrence)
  q1('HT', 'hard', '4'), q1('HH', 'hard', '6'), q1('TH', 'hard', '4'), q1('TT', 'hard', '6'),
  q1('HHH', 'harder', '14'), q1('HHT', 'harder', '8'), q1('HTT', 'harder', '8'), q1('HHHH', 'brutal', '30'),

  // T2 — biased pattern-wait (length 2, exact rationals)
  q2('HH', 1, 3, 'harder', '12'), q2('HH', 1, 4, 'harder', '20'),
  q2('HT', 1, 3, 'harder', '9/2'), q2('HT', 1, 4, 'harder', '16/3'),
  q2('TH', 1, 4, 'harder', '16/3'), q2('TT', 1, 3, 'brutal', '15/4'),
  q2('HH', 2, 5, 'brutal', '35/4'), q2('HT', 2, 5, 'brutal', '25/6'),

  // T3 — Penney's Game win probability (Conway)
  q3('HHH', 'THH', 'harder', '7/8'), q3('HH', 'TH', 'harder', '3/4'),
  q3('HH', 'HT', 'harder', '1/2'), q3('HHH', 'HHT', 'harder', '1/2'),
  q3('HTH', 'HHT', 'brutal', '2/3'), q3('HHT', 'THH', 'brutal', '3/4'),
  q3('TTT', 'HTT', 'brutal', '7/8'),

  // T4 — second-mover best counter
  q4('HHH', 'harder', '7/8'), q4('HTH', 'harder', '2/3'), q4('HHT', 'harder', '3/4'),
  q4('TTT', 'harder', '7/8'), q4('HTT', 'brutal'), q4('THH', 'brutal'),

  // T5 — Gambler's Ruin (reach + duration)
  q5(4, 1, 2, 1, 'reach', 'hard', '1/4'), q5(4, 1, 2, 2, 'reach', 'hard', '1/2'),
  q5(4, 1, 2, 2, 'duration', 'hard', '4'), q5(3, 1, 2, 1, 'reach', 'hard', '1/3'),
  q5(5, 1, 2, 2, 'reach', 'harder', '2/5'), q5(5, 1, 2, 2, 'duration', 'harder', '6'),
  q5(4, 1, 2, 3, 'duration', 'harder', '3'), q5(6, 1, 2, 3, 'duration', 'harder', '9'),
  q5(10, 1, 2, 5, 'duration', 'harder', '25'),
  q5(4, 2, 5, 2, 'reach', 'brutal', '4/13'), q5(4, 2, 5, 2, 'duration', 'brutal', '50/13'),

  // T6 — overlap shortcut (disjoint patterns from T1)
  q6('THH', 'harder', '8'), q6('HTH', 'harder', '10'), q6('THT', 'harder', '10'),
  q6('TTH', 'harder', '8'), q6('TTT', 'harder', '14'),
  q6('HTHT', 'brutal', '20'), q6('HHTT', 'brutal', '16'), q6('HTHH', 'brutal', '18'),

  // Free-form (synthesis / design)
  mkQ(
    'ff-pht-longest-len4', 'brutal',
    semFp('overlap-design', 'length-4-patterns', 'maximize-wait', 'which-and-value'),
    undefined,
    'Among all length-4 H/T patterns, which one has the LONGEST expected wait on a fair coin, and what is that wait? Explain via the self-border structure.',
    T6_SRC, CORR, ["expectedWaitFair('HHHH')"], ans(overlapWait('HHHH'), 'ff-longest', '30'),
    ['HHHH has every length a border (k=1,2,3,4), so Σ 2^k is maximal: 2+4+8+16.', 'Any run of four identical symbols maximizes overlap and therefore the wait.'],
    ['longer pattern is irrelevant — all length-4 waits are equal', 'wait = 2^4 only', 'alternating patterns wait longest'],
    [
      'Compare length-4 patterns by their self-border sets; more/longer borders mean a longer wait.',
      'The pattern with EVERY prefix equal to the matching suffix (a constant run) maximizes Σ 2^k.',
      'Identify the constant run and sum 2^k over all four border lengths — do not state the total here, derive it.',
    ],
    RUB_OVL, ['What length-4 pattern waits the SHORTEST, and why?', 'Generalize the longest-wait pattern to length n.', 'Confirm against the Markov recurrence.'],
  ),
  mkQ(
    'ff-pht-shortest-len4', 'harder',
    semFp('overlap-design', 'length-4-patterns', 'minimize-wait', 'which-and-value'),
    undefined,
    'Among length-4 H/T patterns, give one with the SHORTEST expected wait on a fair coin and state that wait. Why is it the minimum?',
    T6_SRC, CORR, ["expectedWaitFair('THHH')"], ans(overlapWait('THHH'), 'ff-shortest', '16'),
    ['A pattern with NO proper border (only the trivial k=L) waits the least: Σ 2^k = 2^4 alone.', 'THHH (or HTTT, HHHT…) has only the full-length border.'],
    ['the shortest pattern wins', 'every length-4 pattern waits the same', 'minimum wait is 2·4'],
    [
      'Look for a length-4 pattern whose only self-border is the whole pattern (no shorter prefix=suffix).',
      'With a single border at k=L, the overlap sum collapses to just 2^L.',
      'Pick such a pattern and evaluate 2^L for L=4 — derive it rather than stating it.',
    ],
    RUB_OVL, ['Which length-4 pattern waits the longest?', 'How many length-4 patterns achieve this minimum?', 'Does the minimum-wait pattern also win Penney races often?'],
  ),
  mkQ(
    'ff-pht-wait-vs-win', 'harder',
    semFp('wait-vs-win', 'HHH-THH', 'race', 'win-probability-despite-shorter-wait'),
    undefined,
    "E[THH]=8 is far below E[HHH]=14, yet the two race head-to-head on one shared fair stream. Which is more likely to appear first, and with what probability? Explain why wait time does not decide the race.",
    T3_SRC, RACE, ["penneyOdds('HHH', 'THH').bBeatsA"], ans(penneyOdds('HHH', 'THH').bBeatsA, 'ff-wait-vs-win', '7/8'),
    ['Use Conway odds on (HHH, THH): the leading numbers give P(THH first) = (L(HHH,HHH)−L(HHH,THH)) / total.', 'THH "ambushes" HHH: once a T precedes the run, THH almost always completes first.'],
    ['HHH wins because... no — shorter wait does not imply winning', 'the race is 50/50 by symmetry', 'win probability equals 8/14'],
    [
      'Win probability is a race property — use Conway leading numbers, not the individual expected waits.',
      'Compute L(HHH,HHH), L(HHH,THH), L(THH,HHH), L(THH,THH) and form the odds ratio.',
      'Normalize the odds to a probability for THH; the wait gap (8 vs 14) is a red herring.',
    ],
    RUB_RACE, ['What beats THH, and by how much (non-transitivity)?', 'Generalize: does every length-3 run have an ambusher?', 'Why are wait time and win probability decoupled?'],
  ),
]

// ── NO-LEAK GUARD (rungs 2 & 3 must be METHOD-ONLY) ───────────────────────────
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
const leakViolations: string[] = []
for (const q of questions) {
  const a = q.engineCheck.answer
  if (hintRungLeaks(a, q.hidden.hintLadder[1])) leakViolations.push(`${q.id}: hint rung 2 leaks "${a}"`)
  if (hintRungLeaks(a, q.hidden.hintLadder[2])) leakViolations.push(`${q.id}: hint rung 3 leaks "${a}"`)
}
if (leakViolations.length > 0)
  throw new Error(`[NO-LEAK GUARD] ${leakViolations.length} rung(s) leak the answer (rungs 2 & 3 must be METHOD-ONLY):\n  - ${leakViolations.join('\n  - ')}`)
console.log(`✓ NO-LEAK guard passed: rungs 2 & 3 are method-only for all ${questions.length} questions`)

// ── Final assertions ───────────────────────────────────────────────────────────
if (questions.length < 50) throw new Error(`Too few questions: ${questions.length}`)
questions.forEach((q) => {
  if (!q.engineCheck.verified) throw new Error(`engineCheck.verified not true for ${q.id}`)
  if (!q.source || !q.prompt || !q.hidden.answer) throw new Error(`Empty required field for ${q.id}`)
  if (q.hidden.hintLadder.length !== 3) throw new Error(`hintLadder not 3 rungs for ${q.id}`)
  const r = q.hidden.rubric
  if (!r.correctness || !r.approach || !r.rigor || !r.communication || !r.speed) throw new Error(`Missing rubric axis for ${q.id}`)
  if (q.followUps.length < 1) throw new Error(`No followUps for ${q.id}`)
  if (!['hard', 'harder', 'brutal'].includes(q.tier)) throw new Error(`Invalid tier for ${q.id}`)
})
const fps = questions.map((q) => q.fingerprint)
if (new Set(fps).size !== fps.length) throw new Error(`Duplicate fingerprints: ${fps.filter((f, i) => fps.indexOf(f) !== i).join(', ')}`)

const byTier = { hard: 0, harder: 0, brutal: 0 }
questions.forEach((q) => { byTier[q.tier]++ })
const templated = questions.filter((q) => q.template).length
const freeForm = questions.filter((q) => !q.template).length

console.log(`  questions.length = ${questions.length}`)
console.log(`  byTier           = ${JSON.stringify(byTier)}`)
console.log(`  templated        = ${templated}, freeForm = ${freeForm}`)
console.log(`  ALL ${questions.length} QUESTIONS ENGINE-VERIFIED`)

// ── Prompts ─────────────────────────────────────────────────────────────────────

const interviewerPrompt = `ROLE
You are a senior quantitative-research interviewer at a top trading desk (Jane Street / Citadel / IMC), a specialist in Markov chains, hitting times, and Penney's Game, running a live mock interview on PATTERN HITTING TIMES. Be professional, probing, and fair-but-pressured. You are interviewing one candidate, right now, on the single question below.

THE QUESTION (injected at runtime)
- Prompt: {{prompt}}
- Tier: {{tier}}  (hard | harder | brutal — calibrate your pressure and follow-up depth to the tier)
- Source: {{source}}  (your context only; never read it aloud)

PROTOCOL
1. Ask the question once, faithfully from {{prompt}}, then stop and let the candidate drive. ONE question at a time.
2. Make them think ALOUD. Push for the model first: "What are the states? What's the random variable? What boundaries/recurrence?" Reward an explicit setup.
3. Probe, don't solve. Ask Socratic questions that test whether they've seen the edge this problem turns on (see EDGE CASES). Do NOT do the derivation for them.
4. Release hints only when genuinely stuck or explicitly asked (see HINTS).
5. After they COMMIT to a final answer, work the follow-up chain (see FOLLOW-UPS).
6. Then close (see SCORING).

EDGE CASES TO PROBE (PHT-specific traps that separate strong candidates — press the ones this question actually hinges on)
- Wait ≠ win probability: a longer expected wait does NOT imply a higher win probability in a race (E[HHH]=14 > E[THH]=8 yet THH beats HHH 7/8 of the time). Candidates conflate these constantly.
- Non-transitivity of Penney's Game: A beats B and B beats C does NOT imply A beats C; a cycle can beat any fixed sequence. Ask explicitly whether Penney's is transitive.
- Self-overlap drives wait, not length: HHH waits longer than THH despite equal length because HHH has three self-borders (k=1,2,3) vs THH's one (k=3). Candidates assume longer pattern ⇒ longer wait.
- Reach vs duration are different objects: P(reach N before 0 | start i) ≠ E[steps to absorption | start i]. A biased gambler mid-board may have low reach probability but a not-so-short expected duration.
- Conway leading numbers are asymmetric: L(A,B) is the overlap of suffixes of A with prefixes of B; L(A,B) ≠ L(B,A) in general.
- Gambler's-Ruin fair-coin structure: with p=1/2, reach[i] = i/N (linear) and duration[i] = i(N−i) (quadratic); a biased coin breaks both.
- Martingale grounding for the overlap shortcut: the surviving-gamblers argument (each border length k contributes 2^k, total = E[wait] by fairness) is the PROOF, not just a formula. Candidates should state WHY Σ 2^k = E[T].

HINTS — escalating, ONLY when stuck
Use {{hidden.hintLadder}} = [nudge, stronger, near-reveal]. Release ONE rung at a time, in order, and only after a visible stuck-signal. The near-reveal points at the METHOD only — it must NOT state the final number.

NO-ANSWER-LEAK (critical)
Before the candidate commits, NEVER state, approximate, confirm, deny, or "narrow down" the final answer, and NEVER reveal {{hidden.answer}}. Do not paste or paraphrase any part of the hidden record ({{hidden.answer}}, {{hidden.approaches}}, {{hidden.wrongTurns}}, {{hidden.hintLadder}}, {{hidden.rubric}}). If asked "is that right?" mid-solve, redirect ("walk me through why") rather than confirm.

GROUNDING (critical)
Treat {{hidden.answer}} and {{hidden.approaches}} as GROUND TRUTH — they were verified by this concept's exact-rational PHT engines (automaton.ts / race.ts / walk.ts / correlation.ts). The four engines are exact-rational; every PHT answer is a clean integer or rational. Do NOT re-derive the math; if your mental arithmetic conflicts with the hidden record, you are wrong. Accept ANY mathematically-equivalent exact form (an equal unreduced fraction, the clean decimal of an exact rational, or an equivalent unevaluated expression). Use {{hidden.wrongTurns}} to RECOGNIZE a misconception, not to lead the candidate into it. Grade ONLY against the rubric.

FOLLOW-UPS — after they commit
Once a final answer is locked, ask {{followUps}} in order, one at a time (typical chain: bias the coin, generalize to N, change the dependence, or ask for the intuition). Each is its own mini-exchange, with the no-leak and hint rules still in force.

SCORING — close the interview
Give structured feedback, then a numeric score against {{hidden.rubric}}. Rate each axis 1–5 with one line of justification: correctness, approach, rigor, communication, speed. Then give an overall hire-signal read. Tie every judgment to the rubric's bar and cite the specific moment that earned or cost points.

INJECTION NOTE
At runtime the live feature replaces every {{...}} placeholder above with the drawn question's fields; treat the filled-in values as the entire ground truth for this interview.`

const generatorPrompt = `ROLE
You generate ONE fresh, hard, real-quant-style PATTERN-HITTING-TIMES interview question on demand, to top up a pre-built pool without ever repeating one a student has seen. Every question must be (a) a realistic quant-interview question anchored to this concept's Green-Book topics, (b) engine-verifiable before it is served, and (c) structurally new versus an avoid-list. If you cannot satisfy all three, you REFUSE. Output is a single JSON object and nothing else.

SCOPE — only these Green-Book Pattern-Hitting-Times topics
- Expected flips until an H/T pattern appears (fair and biased coins; Markov hitting times).
- Penney's Game win probability (Conway's leading numbers) and the second-mover counter.
- Non-transitivity of the "beats" relation.
- Gambler's Ruin: reach probability and expected duration (fair and biased).
- The overlap / self-border shortcut E[wait] = Σ 2^k and its martingale proof.

REAL-QUANT-STYLE (mandatory, hard fence — ADR-0005)
Model every question on the actual quant-interview canon: coin-pattern waits, Penney's Game, gambler's ruin, the overlap shortcut. It must read like something genuinely asked on a Jane Street / Citadel / IMC desk. NEVER invent an arbitrary puzzle that merely happens to be engine-solvable.

ENGINE-VERIFY-BEFORE-SERVE — PHT engines and exact-rational ranges (second hard fence — ADR-0005)
The live feature will run ONE of these engines to verify your output; REJECT if it cannot verify. Put in engineCheck: module, calls (exact call(s) with concrete args), answer (the exact value the engine returns).

1. src/engine/automaton.ts — buildAutomaton(pattern: string, p: number)
   → .expectedTimes.E0: number (integer for p=1/2; for a biased coin use the exact first-step rational solve). Patterns: H/T, length 1–6. p ∈ (0,1).
2. src/engine/race.ts — penneyOdds(a: string, b: string): { aBeatsB: Rational, bBeatsA: Rational }.
   bestBeater(a: string): string — the Conway counter. conwayLeadingNumbers(a, b): { aa, ab, ba, bb }. winMatrix(patterns): Rational[][].
3. src/engine/walk.ts — buildWalk(N: number, p: number): WalkModel
   → .reachProb: Rational[] (index 0..N; [0]=0, [N]=1); .ruinProb = 1 − reachProb; .duration: Rational[] (index 0..N; [0]=[N]=0). N ∈ [2..50]; p = a/b with small a,b to avoid overflow (use p whose decimal terminates: 1/2, 1/4, 3/4, 1/5, 2/5, 3/5, 4/5).
4. src/engine/correlation.ts — expectedWaitFair(pattern: string): number (exact integer = Σ 2^k over self-borders). autocorrelation(pattern): { bits, overlaps, sum }.

HARD RANGE RULE: every graded answer must be an exact rational (n/d with integer n,d) or a plain integer. Never emit an irrational or a decimal approximation as the answer. For a biased coin, keep p a small-denominator rational so the wait stays exactly representable.

AVOID-LIST / NO-OVERLAP
You are given avoidList: an array of fingerprints (the student's seen-set ∪ the global pool). Your fingerprint MUST NOT be in it. Fingerprint = "<templateId>:<normalized-params>" for a template (sort params canonically), or "sem:<hash>" for free-form. If the first candidate collides, change the structure or parameters until it is new, or REFUSE.

OUTPUT SCHEMA (emit EXACTLY one JSON object — no prose, no code fences)
{
  "tier": "hard | harder | brutal",
  "fingerprint": "<templateId>:<normalized-params>  |  sem:<hash>",
  "template": { "id": "<templateId>", "params": { } },
  "prompt": "the question text shown to the candidate",
  "source": "Green Book §5.x p.<n>  |  <real quant-interview source> (GB-anchored)",
  "engineCheck": { "module": "src/engine/<engine>.ts", "calls": [ "exact call(s)" ], "answer": "<exact rational>" },
  "hidden": {
    "answer": "<exact answer; identical value to engineCheck.answer>",
    "approaches": [ "accepted path 1", "alternate path 2" ],
    "wrongTurns": [ "misconception 1", "misconception 2" ],
    "hintLadder": [ "nudge", "stronger", "near-reveal" ],
    "rubric": { "correctness": "...", "approach": "...", "rigor": "...", "communication": "...", "speed": "..." }
  },
  "followUps": [ "first follow-up", "second follow-up" ]
}

FIELD RULES
- tier: the floor is "hard". hintLadder: EXACTLY 3 rungs; the near-reveal points at METHOD/structure ONLY — it must NOT state the final number.
- hidden.answer MUST equal engineCheck.answer exactly. followUps: a real chain (≥1).

SELF-REJECTION
If you cannot produce a question that is simultaneously (a) real-quant-style + GB-anchored, (b) engine-verifiable in range, and (c) structurally new — output exactly:
{ "refusal": true, "reason": "<one line: not-anchored | not-engine-verifiable | out-of-range/irrational | no-new-fingerprint>" }
An honest refusal beats an unverifiable or repeated question.`

// ── Assemble and emit ───────────────────────────────────────────────────────────

const pack = {
  version: 1,
  kind: 'interview-pack',
  courseId: 'course-pattern-hitting-times',
  concept: 'Pattern Hitting Times',
  greenBookAnchor:
    "Xinfeng Zhou, A Practical Guide to Quantitative Finance Interviews — " +
    "§5.1 Gambler's Ruin (p.107–112); §5.2–5.3 Markov chains / hitting times / pattern probability (p.113–128); " +
    "§5.4–5.5 Penney's Game + Conway leading numbers (p.129–136)",
  engineModule: AUTO,
  generator: 'interviews/_build/build-pattern-hitting-times-pack.ts',
  note:
    'Dormant capstone asset: committed but NOT seeded/deployed. Every numeric answer is reproduced by the ' +
    'exact-rational PHT engines (automaton.ts / race.ts / walk.ts / correlation.ts).',
  counts: { total: questions.length, byTier, templated, freeForm },
  interviewerPrompt,
  generatorPrompt,
  templates: TEMPLATES,
  questions,
}

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
mkdirSync(outDir, { recursive: true })
const outPath = resolve(outDir, 'course-pattern-hitting-times.json')
writeFileSync(outPath, JSON.stringify(pack, null, 2) + '\n', 'utf8')
console.log(`\nWrote ${outPath}`)
