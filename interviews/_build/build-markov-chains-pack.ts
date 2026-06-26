#!/usr/bin/env tsx
// interviews/_build/build-markov-chains-pack.ts
// Generator for interviews/course-markov-chains.json
// Every answer computed by the Markov engine (src/engine/markov.ts) — exact rationals.
// Deterministic: no timestamps, no randomness. Re-running produces byte-identical JSON.

import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Rational } from '../../src/engine/types'
import { reduce } from '../../src/engine/automaton'
import {
  buildChain,
  matrixPower,
  absorptionProbabilities,
  expectedAbsorptionTime,
  stationaryDistribution,
  kacReturnTime,
  detailedBalance,
  pagerank,
  formatRational,
  formatVector,
} from '../../src/engine/markov'

// ── Helpers ────────────────────────────────────────────────────────────────────

const R = (n: number, d = 1): Rational => ({ n, d })

function ans(s: string, ctx: string, advisory?: string): string {
  if (advisory !== undefined && s !== advisory)
    throw new Error(`[MISMATCH] ${ctx}: engine=${s} advisory=${advisory}`)
  return s
}

function semFp(topic: string, entities: string, params: string, ask: string): string {
  return (
    'sem:' +
    createHash('sha1')
      .update(`${topic}|${entities}|${params}|${ask}`)
      .digest('hex')
      .slice(0, 12)
  )
}

function tplFp(id: string, params: Record<string, string | number>): string {
  const seg = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join(',')
  return `${id}:${seg}`
}

// ── Chain registry ─────────────────────────────────────────────────────────────

interface ChainDef {
  P: Rational[][]
  labels: string[]
  absorbing?: number[]
}

const CHAINS: Record<string, ChainDef> = {
  'machine-2': {
    P: [[R(1, 2), R(1, 2)], [R(1, 3), R(2, 3)]],
    labels: ['On', 'Off'],
  },
  'weather-clear-rainy': {
    P: [[R(3, 5), R(2, 5)], [R(3, 10), R(7, 10)]],
    labels: ['Clear', 'Rainy'],
  },
  'weather-gfg': {
    P: [[R(7, 10), R(3, 10)], [R(4, 10), R(6, 10)]],
    labels: ['A', 'B'],
  },
  'weather-asym': {
    P: [[R(1, 4), R(3, 4)], [R(1, 5), R(4, 5)]],
    labels: ['S1', 'S2'],
  },
  'weather-half-3q': {
    P: [[R(1, 2), R(1, 2)], [R(1, 4), R(3, 4)]],
    labels: ['A', 'B'],
  },
  snoqualmie: {
    P: [[R(4, 5), R(1, 5)], [R(2, 5), R(3, 5)]],
    labels: ['Clear', 'Rain'],
  },
  'cloudy-town': {
    P: [[R(0), R(1, 2), R(1, 2)], [R(1, 4), R(1, 2), R(1, 4)], [R(1, 4), R(1, 4), R(1, 2)]],
    labels: ['Sunny', 'Cloudy', 'Rainy'],
  },
  'land-of-oz': {
    P: [[R(1, 2), R(1, 4), R(1, 4)], [R(1, 2), R(0), R(1, 2)], [R(1, 4), R(1, 4), R(1, 2)]],
    labels: ['Rain', 'Nice', 'Snow'],
  },
  'ergodic-3': {
    P: [[R(1, 2), R(1, 4), R(1, 4)], [R(1, 3), R(1, 3), R(1, 3)], [R(0), R(1, 2), R(1, 2)]],
    labels: ['s0', 's1', 's2'],
  },
  'ehrenfest-2': {
    P: [[R(0), R(1), R(0)], [R(1, 2), R(0), R(1, 2)], [R(0), R(1), R(0)]],
    labels: ['0', '1', '2'],
  },
  'ehrenfest-3': {
    P: [
      [R(0), R(1), R(0), R(0)],
      [R(1, 3), R(0), R(2, 3), R(0)],
      [R(0), R(2, 3), R(0), R(1, 3)],
      [R(0), R(0), R(1), R(0)],
    ],
    labels: ['0', '1', '2', '3'],
  },
  'ehrenfest-4': {
    P: [
      [R(0), R(1), R(0), R(0), R(0)],
      [R(1, 4), R(0), R(3, 4), R(0), R(0)],
      [R(0), R(1, 2), R(0), R(1, 2), R(0)],
      [R(0), R(0), R(3, 4), R(0), R(1, 4)],
      [R(0), R(0), R(0), R(1), R(0)],
    ],
    labels: ['0', '1', '2', '3', '4'],
  },
  'gambler-0to3-up2_3': {
    P: [
      [R(1), R(0), R(0), R(0)],
      [R(1, 3), R(0), R(2, 3), R(0)],
      [R(0), R(1, 3), R(0), R(2, 3)],
      [R(0), R(0), R(0), R(1)],
    ],
    labels: ['$0', '$1', '$2', '$3'],
    absorbing: [0, 3],
  },
  'drunkard-0to4': {
    P: [
      [R(1), R(0), R(0), R(0), R(0)],
      [R(1, 2), R(0), R(1, 2), R(0), R(0)],
      [R(0), R(1, 2), R(0), R(1, 2), R(0)],
      [R(0), R(0), R(1, 2), R(0), R(1, 2)],
      [R(0), R(0), R(0), R(0), R(1)],
    ],
    labels: ['0', '1', '2', '3', '4'],
    absorbing: [0, 4],
  },
  'coin-hhh-thh': {
    P: [
      [R(0), R(1, 2), R(0), R(1, 2), R(0), R(0), R(0)],
      [R(0), R(0), R(1, 2), R(1, 2), R(0), R(0), R(0)],
      [R(0), R(0), R(0), R(1, 2), R(0), R(1, 2), R(0)],
      [R(0), R(0), R(0), R(1, 2), R(1, 2), R(0), R(0)],
      [R(0), R(0), R(0), R(1, 2), R(0), R(0), R(1, 2)],
      [R(0), R(0), R(0), R(0), R(0), R(1), R(0)],
      [R(0), R(0), R(0), R(0), R(0), R(0), R(1)],
    ],
    labels: ['∅', 'H', 'HH', 'T', 'TH', 'HHH', 'THH'],
    absorbing: [5, 6],
  },
  'dice-12-vs-77': {
    P: [
      [R(29, 36), R(1, 6), R(0), R(1, 36)],
      [R(29, 36), R(0), R(1, 6), R(1, 36)],
      [R(0), R(0), R(1), R(0)],
      [R(0), R(0), R(0), R(1)],
    ],
    labels: ['S', '7', '77', '12'],
    absorbing: [2, 3],
  },
  'thh-wait': {
    P: [
      [R(1, 2), R(1, 2), R(0), R(0)],
      [R(0), R(1, 2), R(1, 2), R(0)],
      [R(0), R(1, 2), R(0), R(1, 2)],
      [R(0), R(0), R(0), R(1)],
    ],
    labels: ['∅', 'T', 'TH', 'THH'],
    absorbing: [3],
  },
  'hh-wait': {
    P: [[R(1, 2), R(1, 2), R(0)], [R(1, 2), R(0), R(1, 2)], [R(0), R(0), R(1)]],
    labels: ['∅', 'H', 'HH'],
    absorbing: [2],
  },
  'hhh-wait': {
    P: [
      [R(1, 2), R(1, 2), R(0), R(0)],
      [R(1, 2), R(0), R(1, 2), R(0)],
      [R(1, 2), R(0), R(0), R(1, 2)],
      [R(0), R(0), R(0), R(1)],
    ],
    labels: ['∅', 'H', 'HH', 'HHH'],
    absorbing: [3],
  },
}

// ── PageRank link graphs ───────────────────────────────────────────────────────

const GRAPHS: Record<string, Rational[][]> = {
  'pr-3cycle': [[R(0), R(1), R(0)], [R(0), R(0), R(1)], [R(1), R(0), R(0)]],
  'pr-4node': [
    [R(0), R(1), R(0), R(0)],
    [R(1, 2), R(0), R(0), R(1, 2)],
    [R(1, 2), R(0), R(0), R(1, 2)],
    [R(1, 3), R(1, 3), R(1, 3), R(0)],
  ],
  'pr-3node': [[R(0), R(1, 2), R(1, 2)], [R(0), R(0), R(1)], [R(1), R(0), R(0)]],
}

// Validate all chains at startup (throws if any row doesn't sum to 1).
Object.values(CHAINS).forEach((def) => buildChain(def.P, def.labels))

// ── Utility functions ──────────────────────────────────────────────────────────

function transientStates(n: number, absorbing: number[]): number[] {
  return Array.from({ length: n }, (_, i) => i).filter((i) => !absorbing.includes(i))
}

function absorptionAt(chainId: string, start: number, target: number): Rational {
  const { P, absorbing } = CHAINS[chainId]
  if (!absorbing) throw new Error(`Chain ${chainId} has no absorbing states`)
  const B = absorptionProbabilities(P, absorbing)
  const row = transientStates(P.length, absorbing).indexOf(start)
  const col = absorbing.indexOf(target)
  return B[row][col]
}

function expectedAt(chainId: string, start: number): Rational {
  const { P, absorbing } = CHAINS[chainId]
  if (!absorbing) throw new Error(`Chain ${chainId} has no absorbing states`)
  const t = expectedAbsorptionTime(P, absorbing)
  return t[transientStates(P.length, absorbing).indexOf(start)]
}

function buildWalkP(N: number, pNum: number, pDen: number): Rational[][] {
  return Array.from({ length: N + 1 }, (_, i) => {
    const row: Rational[] = Array.from({ length: N + 1 }, () => R(0))
    if (i === 0) {
      row[0] = R(1)
    } else if (i === N) {
      row[N] = R(1)
    } else {
      row[i + 1] = R(pNum, pDen)
      row[i - 1] = R(pDen - pNum, pDen)
    }
    return row
  })
}

function walkReach(N: number, pNum: number, pDen: number, i: number): Rational {
  return absorptionProbabilities(buildWalkP(N, pNum, pDen), [0, N])[i - 1][1]
}

function walkDuration(N: number, pNum: number, pDen: number, i: number): Rational {
  return expectedAbsorptionTime(buildWalkP(N, pNum, pDen), [0, N])[i - 1]
}

// ── Template metadata ──────────────────────────────────────────────────────────

const MARKOV_MODULE = 'src/engine/markov.ts'

const TEMPLATES = [
  {
    id: 'tmpl-stationary',
    title: 'Stationary distribution piP=pi — long-run share of a regime',
    source: 'WEB (absent from GB): Math.SE 3336273 · GeeksforGeeks · Rochester ECE440 HW5 #2 · Math.SE 259852',
    description:
      'Solve piP=pi with sum(pi)=1 for the long-run time-share; interpret it and argue why a regular chain forgets its start.',
    engineModule: MARKOV_MODULE,
  },
  {
    id: 'tmpl-multistep',
    title: 'Multi-step transitions — entries of P^n (Chapman-Kolmogorov)',
    source:
      'GB §5.1 p.53 (path probability) · WEB Land of Oz (Grinstead & Snell Ch.11 Table 11.1; UC Davis dis6)',
    description:
      'An n-step probability is the (from,to) entry of P^n; it sums over every intermediate path, not one path.',
    engineModule: MARKOV_MODULE,
  },
  {
    id: 'tmpl-absorption',
    title: 'Absorption probability — which exit, via (I-Q)^-1 R / first-step analysis',
    source:
      'GB §5.1 p.54-57 (gambler 4/7; dice 7/13; coin 1/8) · WEB drunkard i/N (Grinstead & Snell Ex.11.13-15)',
    description:
      'P(absorbed at one target before another) by first-step analysis B=(I-Q)^-1 R — a split with no +1; the start sets the split.',
    engineModule: MARKOV_MODULE,
  },
  {
    id: 'tmpl-expected-absorption',
    title: 'Expected time to absorption — (I-Q)t=1 (the +1 per step)',
    source:
      'GB §5.1 p.54 + §5.2 p.59-61 (E[THH]=8, E[HH]=6, E[HHH]=14) · WEB drunkard i(N-i) (Grinstead & Snell Ex.11.15)',
    description:
      'Expected steps to absorption, solving (I-Q)t=1 — every step adds the +1 a probability-split lacks.',
    engineModule: MARKOV_MODULE,
  },
  {
    id: 'tmpl-gamblers-ruin',
    title: "Gambler's ruin / birth-death walk — reach probability and expected duration",
    source:
      'GB §5.1 p.54-55 + §5.2 p.59 (drunk-man 17/100, 1411) · WEB drunkard i/N & i(N-i) (Grinstead & Snell Ex.11.13-15)',
    description:
      'Boundary-value problems on a 0..N walk with up-prob p: reach P(hit N before 0|i) and duration E[steps|i]; fair gives i/N and i(N-i), bias breaks both.',
    engineModule: MARKOV_MODULE,
  },
  {
    id: 'tmpl-detailed-balance',
    title: 'Reversibility & detailed balance — pi without solving the whole system',
    source: 'WEB (absent from GB): Ehrenfest stats.libretexts 16.8 · phys.libretexts 12.3',
    description:
      'When pi_i p_ij = pi_j p_ji holds (birth-death / 2-state), march the ratios along the ladder to read pi directly.',
    engineModule: MARKOV_MODULE,
  },
  {
    id: 'tmpl-kac-return',
    title: "Kac's mean return time — 1/pi_i",
    source:
      "WEB (absent from GB): Kac's recurrence theorem; pi from Math.SE 3336273 (clear/rainy) & Rochester ECE440 HW5 #2 (cloudy-town)",
    description: 'Expected steps to first return to a state = the reciprocal of its stationary share, 1/pi_i.',
    engineModule: MARKOV_MODULE,
  },
  {
    id: 'tmpl-pagerank',
    title: 'PageRank — stationary distribution of the damped random surfer',
    source:
      'WEB (absent from GB): theorempath.com (3-cycle) · practicaldsc.org (4-node) · Wikipedia PageRank + arXiv math/0612079 (damping)',
    description:
      "Rank pages by the stationary distribution of G=d*M+(1-d)/n*J (M = row-stochastic out-links); the surfer's long-run share IS the rank.",
    engineModule: MARKOV_MODULE,
  },
]

// ── Per-template shared content ────────────────────────────────────────────────

const T1_SRC =
  'WEB (absent from GB): Math.SE 3336273 · GeeksforGeeks · Rochester ECE440 HW5 #2 · Math.SE 259852'
const RUB_STATIONARY = {
  correctness: 'matches the exact engine stationary vector (reduced, sums to 1)',
  approach: 'sets up the LEFT system piP=pi plus the sum(pi)=1 normalization',
  rigor: 'keeps exact rationals; checks components sum to 1; notes uniqueness needs irreducibility',
  communication: 'reads pi as a long-run time-share, not the single most-likely state',
  speed: 'reduces the 2-3 state system with no decimal drift',
}
const WRONG_STATIONARY = [
  'the starting state changes the long-run share',
  'pi is just the row of P with the biggest entries',
  'piP=pi implies P^n converges, even for a periodic chain',
  'solving the RIGHT eigenvector P*pi=pi instead of the left system piP=pi',
]
const FOLLOW_STATIONARY = [
  "From your pi, give a state's mean return time (Kac, 1/pi_i).",
  'Is this chain periodic? If so does the step-n distribution still converge?',
  "Nudge one transition up — which way does the busiest state's share move?",
]
const APR_STATIONARY = [
  'Write the left system (P^T - I)pi^T = 0, drop one redundant equation, close with sum(pi)=1, solve over the rationals.',
  '2-state shortcut: pi=(b/(a+b), a/(a+b)) with a,b the two switching probabilities; verify sum(pi)=1.',
]
function hintsStationary(chain: string): [string, string, string] {
  return [
    `You want the share that one more step leaves unchanged — set up piP=pi using the rows of ${chain}.`,
    `Transpose to a left-eigenvector system (P^T - I)pi^T = 0; one equation is redundant, so replace it with the constraint that the shares sum to one.`,
    `Solve that augmented system over the rationals and reduce, then check the components sum to one — derive pi, never read it off the matrix.`,
  ]
}

const T2_SRC =
  'GB §5.1 p.53 (path probability) · WEB Land of Oz (Grinstead & Snell Ch.11 Table 11.1; UC Davis dis6)'
const RUB_MULTISTEP = {
  correctness: 'matches the exact (from,to) entry of P^n',
  approach: 'computes P^n (or pushes the row vector n steps) and reads the right entry',
  rigor: 'sums over all intermediate states; entries stay exact-rational',
  communication: 'explains Chapman-Kolmogorov as one-step total probability repeated',
  speed: 'uses repeated squaring / one row push, not path enumeration',
}
const WRONG_MULTISTEP = [
  'multiply one most-likely path instead of summing all intermediate states',
  '(P^n)_ij = (P_ij)^n — raise the entry, not the matrix',
  'rows of P^n stop summing to 1',
  'confuse the n-step transition with the stationary share',
]
const FOLLOW_MULTISTEP = [
  'Push n higher — what vector does this row approach, and why?',
  'As n->infinity does the answer depend on the starting row? Tie it to pi.',
  'Compute the same entry one step earlier and explain the change.',
]
const APR_MULTISTEP = [
  'Form P^n by repeated squaring over the rationals and read entry (from,to).',
  'Equivalently push e_from through P n times and read coordinate `to` — total probability, one step at a time.',
]
function hintsMultistep(chain: string, n: number, from: number, to: number): [string, string, string] {
  return [
    `An n-step probability is the (${from}->${to}) entry of P raised to the n-th power for ${chain}, not a single path.`,
    `Multiply P by itself ${n} times (repeated squaring is fine); the entry you want sums the probabilities of all length-${n} paths from ${from} to ${to}.`,
    `Read row ${from}, column ${to} of that power and reduce; confirm the row still sums to one — raise the matrix, not the single entry.`,
  ]
}

const T3_SRC =
  'GB §5.1 p.54-57 (gambler 4/7; dice 7/13; coin 1/8) · WEB drunkard i/N (Grinstead & Snell Ex.11.13-15)'
const RUB_ABSORPTION = {
  correctness: 'matches the exact absorption probability for the named start and target',
  approach: 'splits transient Q from absorbing R and solves (I-Q)B=R for the right column',
  rigor: 'maps the WORD event to the correct absorbing state before solving; no spurious +1',
  communication: 'explains why the start changes the split (boundary values 1/0)',
  speed: 'solves the small system without rebuilding the whole fundamental matrix',
}
const WRONG_ABSORPTION = [
  'absorption probability equals the expected absorption time (adds a +1)',
  'the starting state does not change the split',
  'a symmetric walk is 50/50 to either wall from anywhere',
  'mis-map the event (read the two-7s column when asked for 12-first)',
]
const FOLLOW_ABSORPTION = [
  'Now give the expected time to absorption from the same start — same fundamental matrix.',
  'Bias the chain or move the start — which way does the split shift?',
  'What is the probability of the OTHER exit, and why must the two sum to 1?',
]
const APR_ABSORPTION = [
  'Set the asked target to 1 and every other absorbing state to 0; solve interior a_s = sum p_sc a_c for the start.',
  "Matrix form B=(I-Q)^-1 R; read the start's row, asked-target's column.",
]
function hintsAbsorption(chain: string): [string, string, string] {
  return [
    `This is a 'which exit first' question — first-step analysis on ${chain} for absorption probabilities, not times (no +1 here).`,
    `Pin the asked absorbing state to one and every other absorbing state to zero, then write each transient state as the probability-weighted average of where it steps next.`,
    `Solve that interior system for the start state and reduce; map the asked event to the right target before reading — split only, never add a step.`,
  ]
}

const T4_SRC =
  'GB §5.1 p.54 + §5.2 p.59-61 (E[THH]=8, E[HH]=6, E[HHH]=14) · WEB drunkard i(N-i) (Grinstead & Snell Ex.11.15)'
const RUB_EXPECTED = {
  correctness: 'matches the exact expected absorption time from the named start',
  approach: 'solves t_i = 1 + sum p_ij t_j with t=0 at absorbing states',
  rigor: 'keeps the +1 on every transient row; a run-length mismatch falls back, not always to the empty start',
  communication: 'contrasts the +1 here with the no-+1 absorption split',
  speed: 'solves the small system cleanly; no double-counting the first step',
}
const WRONG_EXPECTED = [
  'drop the +1 (treat it like a probability split)',
  'in a run-length chain a mismatch always resets to the empty start (it falls back to the longest still-valid prefix)',
  'expected time and absorption probability are the same computation',
  'expected time is symmetric in the start even under bias',
]
const FOLLOW_EXPECTED = [
  'Now give the absorption probability from the same start — drop the +1.',
  'Bias the coin/walk — does the time rise or fall?',
  'Generalize to a length-n run / N-step walk closed form.',
]
const APR_EXPECTED = [
  'Write t_i = 1 + sum_j p_ij t_j (t=0 at absorbing) and solve (I-Q)t=1.',
  'Fair symmetric walk: t_i = i(N-i); run-length wait: cross-check against 2^(n+1)-2.',
]
function hintsExpected(chain: string): [string, string, string] {
  return [
    `This asks 'how long until absorbed', so every transient step carries a +1 — set up t_i = 1 + (probability-weighted successors) on ${chain}.`,
    `One unknown per non-absorbing state, absorbing states zero; remember a failed step in a run-length chain falls back to the longest still-matching prefix, not always to the start.`,
    `Solve from the absorbing boundary backward; the whole count is the accumulated +1's — keep them, and don't count the first step twice.`,
  ]
}

const T5_SRC =
  'GB §5.1 p.54-55 + §5.2 p.59 (drunk-man 17/100, 1411) · WEB drunkard i/N & i(N-i) (Grinstead & Snell Ex.11.13-15)'
const RUB_RUIN = {
  correctness: 'matches the exact reach or duration for (N,p,i)',
  approach: 'boundary-value recurrence with correct boundaries (reach 0/1; duration 0/0 with +1)',
  rigor: 'reach (probability) kept distinct from duration (steps); biased ratio r=q/p handled exactly',
  communication: 'states the closed form and its boundary conditions',
  speed: 'uses the closed form instead of re-deriving the system',
}
const WRONG_RUIN = [
  'reach probability and expected duration are the same object',
  'a fair game is 50/50 to win regardless of the starting stake',
  'bias does not change the reach probability',
  'duration is symmetric in the start even under bias',
]
const FOLLOW_RUIN = [
  'Generalize the fair formula to arbitrary N and start i.',
  'Flip the bias (p->1-p) — what happens to reach and to duration?',
  'Why is the fair duration quadratic in the start while reach is linear?',
]
const APR_RUIN = [
  'Reach: P_i = p*P_{i+1} + q*P_{i-1}, P_0=0, P_N=1 => fair i/N, biased (1-r^i)/(1-r^N), r=q/p.',
  'Duration: D_i = 1 + p*D_{i+1} + q*D_{i-1}, D_0=D_N=0 => fair i(N-i).',
]
const HINTS_RUIN: [string, string, string] = [
  `Set up a boundary-value problem on the 0-to-N walk: for a reach probability fix the bottom at zero and the top at one (no +1); for a duration fix both ends at zero with a +1 on every step.`,
  `Fair coin: reach is linear (i/N), duration is quadratic (i(N-i)). Biased coin: form the down/up ratio r=q/p and use reach=(1-r^i)/(1-r^N); the duration loses its left-right symmetry.`,
  `Substitute your start into the matching closed form (or solve the small system) and reduce — keep a reach a probability and a duration a step count; never swap one form for the other.`,
]

const T6_SRC = 'WEB (absent from GB): Ehrenfest stats.libretexts 16.8 · phys.libretexts 12.3'
const RUB_DETAILED = {
  correctness: 'matches the exact stationary vector of the reversible chain',
  approach: 'uses detailed balance along the birth-death ladder, then normalizes',
  rigor: 'confirms reversibility before using the shortcut; exact rationals',
  communication: 'explains why detailed balance => stationary (flows cancel edge-by-edge)',
  speed: 'telescopes the ladder rather than solving the full eigen-system',
}
const WRONG_DETAILED = [
  'every chain is reversible / detailed balance always holds',
  'you must solve the full piP=pi system; the balance shortcut is not allowed',
  'detailed balance is identical to global balance piP=pi (it is strictly stronger)',
  'forget to normalize the telescoped ratios to sum to 1',
]
const FOLLOW_DETAILED = [
  'Confirm your pi also satisfies global balance piP=pi.',
  'Is the chain periodic? If so does P^n converge even though pi exists?',
  'Generalize Ehrenfest to m balls (binomial C(m,i)/2^m).',
]
const APR_DETAILED = [
  'Chain pi_{i+1} = pi_i * p_{i,i+1}/p_{i+1,i} from one end, then normalize sum(pi)=1 (telescopes to the binomial for Ehrenfest).',
  '2-state: detailed balance is automatic; pi=(b/(a+b), a/(a+b)).',
]
function hintsDetailedBalance(chain: string): [string, string, string] {
  return [
    `This chain is reversible, so skip the full solve: use detailed balance, pi_i*p_ij = pi_j*p_ji, on ${chain}.`,
    `Walk the balance equation along the birth-death ladder, expressing each state's share as a multiple of its neighbor's via the up/down probability ratio.`,
    `Telescope those ratios from one end and normalize so the shares sum to one — read off the (binomial) pattern rather than naming the entries.`,
  ]
}

const T7_SRC =
  "WEB (absent from GB): Kac's recurrence theorem; pi from Math.SE 3336273 (clear/rainy) & Rochester ECE440 HW5 #2 (cloudy-town)"
const RUB_KAC = {
  correctness: 'matches the exact mean return time 1/pi_i for the named state',
  approach: 'find the stationary share of the state, then reciprocate (Kac)',
  rigor: 'uses the long-run time-share (not a hitting time from a fixed other state); exact rational',
  communication: 'explains why a rarer state has a longer mean return time',
  speed: 'one stationary component, then its reciprocal',
}
const WRONG_KAC = [
  'mean return time equals the mean hitting time from some other fixed state',
  'every state has the same return time',
  'return time is 1/pi for the WHOLE chain rather than per-state',
  'use the raw transition probability instead of the stationary share',
]
const FOLLOW_KAC = [
  "Compare two states' return times — which recurs faster and why?",
  "Halve a state's pi — what happens to its return time?",
  'Does periodicity change the mean return time? (No — still 1/pi_i.)',
]
const APR_KAC = [
  "Solve piP=pi, take the asked state's component, return its reciprocal.",
  '2-state: pi=(b/(a+b), a/(a+b)) then invert the chosen component.',
]
function hintsKac(chain: string, state: number): [string, string, string] {
  const label = CHAINS[chain].labels[state]
  return [
    `Mean return time is a stationary-distribution question in disguise — first get the long-run share of state ${label} in ${chain}.`,
    `Kac's theorem: the expected first return time to a state is the reciprocal of that state's stationary probability.`,
    `Compute the stationary share of state ${label}, then take its reciprocal and reduce — derive the share, don't read it off the matrix.`,
  ]
}

const T8_SRC =
  'WEB (absent from GB): theorempath.com (3-cycle) · practicaldsc.org (4-node) · Wikipedia PageRank + arXiv math/0612079 (damping)'
const RUB_PAGERANK = {
  correctness: 'matches the exact PageRank vector for the graph and damping d',
  approach: 'builds G=d*M+(1-d)/n*J and solves the stationary piG=pi',
  rigor: 'handles dangling nodes (uniform row); exact rationals; ranks by the vector, not in-degree',
  communication: "explains PageRank as 'importance = where a random surfer spends time'",
  speed: 'exploits symmetry (uniform answer) when present instead of solving blindly',
}
const WRONG_PAGERANK = [
  'the page with the most in-links is automatically most important',
  'changing the damping d changes the ranking of a symmetric graph',
  'PageRank is not a Markov stationary distribution',
  'dangling (no out-link) nodes can be left as all-zero rows',
]
const FOLLOW_PAGERANK = [
  'Rank all pages and name the most important — does it match in-degree?',
  'Lower d toward 0 — what distribution do you approach, and why?',
  'Redirect one link — predict which page gains rank.',
]
const APR_PAGERANK = [
  'Form G=d*M+(1-d)/n*J from the row-stochastic link matrix, solve piG=pi, sum(pi)=1.',
  'If the graph is vertex-transitive (a pure cycle), argue by symmetry that pi is uniform for any d.',
]
function hintsPageRank(graph: string, dNum: number, dDen: number): [string, string, string] {
  return [
    `PageRank is just a stationary distribution: build the random-surfer matrix for ${graph} with damping d=${dNum}/${dDen} and solve piG=pi.`,
    `G mixes the link-following matrix (weight d) with a uniform teleport (weight 1-d); on a fully symmetric graph both pieces are symmetric — think about what that forces.`,
    `Solve the stationary system of G and reduce (or invoke symmetry); rank by the resulting shares — never by raw in-link counts.`,
  ]
}

// ── QuestionRecord types + builder ─────────────────────────────────────────────

type Tier = 'hard' | 'harder' | 'brutal'
interface Rubric {
  correctness: string
  approach: string
  rigor: string
  communication: string
  speed: string
}
interface QuestionRecord {
  id: string
  tier: Tier
  fingerprint: string
  template?: { id: string; params: Record<string, unknown> }
  prompt: string
  source: string
  engineCheck: { module: string; calls: string[]; answer: string; verified: boolean }
  hidden: {
    answer: string
    approaches: string[]
    wrongTurns: string[]
    hintLadder: [string, string, string]
    rubric: Rubric
  }
  followUps: string[]
}

function mkQ(
  id: string,
  tier: Tier,
  fingerprint: string,
  template: { id: string; params: Record<string, unknown> } | undefined,
  prompt: string,
  source: string,
  calls: string[],
  answer: string,
  approaches: string[],
  wrongTurns: string[],
  hintLadder: [string, string, string],
  rubric: Rubric,
  followUps: string[],
): QuestionRecord {
  return {
    id,
    tier,
    fingerprint,
    ...(template ? { template } : {}),
    prompt,
    source,
    engineCheck: { module: MARKOV_MODULE, calls, answer, verified: true },
    hidden: { answer, approaches, wrongTurns, hintLadder, rubric },
    followUps,
  }
}

// ── Questions ──────────────────────────────────────────────────────────────────

const questions: QuestionRecord[] = [
  // ── T1: tmpl-stationary (8 questions) ─────────────────────────────────────
  mkQ(
    'tmpl-stationary#machine-2', 'hard',
    tplFp('tmpl-stationary', { chain: 'machine-2' }),
    { id: 'tmpl-stationary', params: { chain: 'machine-2' } },
    'A trading signal flips between **on** and **off**: an on-day stays on w.p. 1/2 (else off); an off-day stays off w.p. 2/3 (else on). Build the transition matrix from these words, then find the long-run fraction of on vs off days; show the 2-state fixed point and explain the b/(a+b) structure.',
    T1_SRC,
    ["stationaryDistribution(CHAINS['machine-2'].P)"],
    ans(formatVector(stationaryDistribution(CHAINS['machine-2'].P)), 't1-machine-2', '2/5,3/5'),
    APR_STATIONARY, WRONG_STATIONARY, hintsStationary('machine-2'), RUB_STATIONARY, FOLLOW_STATIONARY,
  ),
  mkQ(
    'tmpl-stationary#clear-rainy', 'hard',
    tplFp('tmpl-stationary', { chain: 'weather-clear-rainy' }),
    { id: 'tmpl-stationary', params: { chain: 'weather-clear-rainy' } },
    "You model a stock's daily regime as two states. If it's **clear** today it stays clear tomorrow w.p. 3/5 (else rainy); if **rainy** it stays rainy w.p. 7/10 (else clear). Build the transition matrix from these words, then find the long-run fraction of days in each regime — and justify why the answer does **not** depend on today's regime.",
    T1_SRC,
    ["stationaryDistribution(CHAINS['weather-clear-rainy'].P)"],
    ans(formatVector(stationaryDistribution(CHAINS['weather-clear-rainy'].P)), 't1-clear-rainy', '3/7,4/7'),
    APR_STATIONARY, WRONG_STATIONARY, hintsStationary('weather-clear-rainy'), RUB_STATIONARY, FOLLOW_STATIONARY,
  ),
  mkQ(
    'tmpl-stationary#gfg', 'hard',
    tplFp('tmpl-stationary', { chain: 'weather-gfg' }),
    { id: 'tmpl-stationary', params: { chain: 'weather-gfg' } },
    "A two-state system: from A -> A w.p. 7/10 (else B); from B -> B w.p. 6/10 (else A). Construct P, then compute the steady-state share of time in each state and explain what 'steady state' means operationally for a desk that only cares about long-run occupancy.",
    T1_SRC,
    ["stationaryDistribution(CHAINS['weather-gfg'].P)"],
    ans(formatVector(stationaryDistribution(CHAINS['weather-gfg'].P)), 't1-gfg', '4/7,3/7'),
    APR_STATIONARY, WRONG_STATIONARY, hintsStationary('weather-gfg'), RUB_STATIONARY, FOLLOW_STATIONARY,
  ),
  mkQ(
    'tmpl-stationary#snoqualmie', 'hard',
    tplFp('tmpl-stationary', { chain: 'snoqualmie' }),
    { id: 'tmpl-stationary', params: { chain: 'snoqualmie' } },
    'In Snoqualmie the weather is sticky: a **clear** day stays clear w.p. 4/5; a **rainy** day stays rainy w.p. 3/5. Build P and find the fraction of clear vs rainy days in the long run; show your pi is unchanged by one more day and say why that fixed-point property is the definition you need.',
    T1_SRC,
    ["stationaryDistribution(CHAINS['snoqualmie'].P)"],
    ans(formatVector(stationaryDistribution(CHAINS['snoqualmie'].P)), 't1-snoqualmie', '2/3,1/3'),
    APR_STATIONARY, WRONG_STATIONARY, hintsStationary('snoqualmie'), RUB_STATIONARY, FOLLOW_STATIONARY,
  ),
  mkQ(
    'tmpl-stationary#weather-asym', 'harder',
    tplFp('tmpl-stationary', { chain: 'weather-asym' }),
    { id: 'tmpl-stationary', params: { chain: 'weather-asym' } },
    'Regime chain: S1 -> S1 w.p. 1/4 (else S2); S2 -> S2 w.p. 4/5 (else S1). Build it and give the long-run share of each state as exact fractions; the denominators aren\'t pretty — explain where the 19 comes from in terms of a+b.',
    T1_SRC,
    ["stationaryDistribution(CHAINS['weather-asym'].P)"],
    ans(formatVector(stationaryDistribution(CHAINS['weather-asym'].P)), 't1-weather-asym', '4/19,15/19'),
    APR_STATIONARY, WRONG_STATIONARY, hintsStationary('weather-asym'), RUB_STATIONARY, FOLLOW_STATIONARY,
  ),
  mkQ(
    'tmpl-stationary#cloudy-town', 'harder',
    tplFp('tmpl-stationary', { chain: 'cloudy-town' }),
    { id: 'tmpl-stationary', params: { chain: 'cloudy-town' } },
    'A city cycles **sunny/cloudy/rainy**: from sunny it never stays sunny (1/2 cloudy, 1/2 rainy); from cloudy it\'s 1/4 sunny, 1/2 cloudy, 1/4 rainy; from rainy it\'s 1/4 sunny, 1/4 cloudy, 1/2 rainy. Build P, find the long-run share of each weather, and argue the chain is ergodic (so the share is unique and start-independent).',
    T1_SRC,
    ["stationaryDistribution(CHAINS['cloudy-town'].P)"],
    ans(formatVector(stationaryDistribution(CHAINS['cloudy-town'].P)), 't1-cloudy-town', '1/5,2/5,2/5'),
    APR_STATIONARY, WRONG_STATIONARY, hintsStationary('cloudy-town'), RUB_STATIONARY, FOLLOW_STATIONARY,
  ),
  mkQ(
    'tmpl-stationary#land-of-oz', 'harder',
    tplFp('tmpl-stationary', { chain: 'land-of-oz' }),
    { id: 'tmpl-stationary', params: { chain: 'land-of-oz' } },
    "Land of Oz weather (Rain/Nice/Snow): Rain->(1/2,1/4,1/4), Nice->(1/2,0,1/2), Snow->(1/4,1/4,1/2). Build P and find the long-run share of each — then state which state is rarest and explain why 'Nice' is squeezed out structurally.",
    T1_SRC,
    ["stationaryDistribution(CHAINS['land-of-oz'].P)"],
    ans(formatVector(stationaryDistribution(CHAINS['land-of-oz'].P)), 't1-land-of-oz', '2/5,1/5,2/5'),
    APR_STATIONARY, WRONG_STATIONARY, hintsStationary('land-of-oz'), RUB_STATIONARY, FOLLOW_STATIONARY,
  ),
  mkQ(
    'tmpl-stationary#ergodic-3', 'brutal',
    tplFp('tmpl-stationary', { chain: 'ergodic-3' }),
    { id: 'tmpl-stationary', params: { chain: 'ergodic-3' } },
    'Three states with rows s0->(1/2,1/4,1/4), s1->(1/3,1/3,1/3), s2->(0,1/2,1/2). Build P, **first** argue it is irreducible and aperiodic (hence has a unique stationary), **then** compute the long-run share of each state. Explain why s1 and s2 end up equally occupied despite different rows.',
    T1_SRC,
    ["stationaryDistribution(CHAINS['ergodic-3'].P)"],
    ans(formatVector(stationaryDistribution(CHAINS['ergodic-3'].P)), 't1-ergodic-3', '1/4,3/8,3/8'),
    APR_STATIONARY, WRONG_STATIONARY, hintsStationary('ergodic-3'), RUB_STATIONARY, FOLLOW_STATIONARY,
  ),

  // ── T2: tmpl-multistep (6 questions) ──────────────────────────────────────
  mkQ(
    'tmpl-multistep#clear-rainy-n2-c-r', 'hard',
    tplFp('tmpl-multistep', { chain: 'weather-clear-rainy', from: 0, n: 2, to: 1 }),
    { id: 'tmpl-multistep', params: { chain: 'weather-clear-rainy', n: 2, from: 0, to: 1 } },
    'Two-state daily regime (clear->clear 3/5; rainy->rainy 7/10). Given it is **clear today**, what\'s the probability it is **rainy two days from now**? Build P, square it, and explain why this is not a single path\'s probability.',
    T2_SRC,
    ["matrixPower(CHAINS['weather-clear-rainy'].P, 2)[0][1]"],
    ans(formatRational(matrixPower(CHAINS['weather-clear-rainy'].P, 2)[0][1]), 't2-cr-n2-0-1', '13/25'),
    APR_MULTISTEP, WRONG_MULTISTEP, hintsMultistep('weather-clear-rainy', 2, 0, 1), RUB_MULTISTEP, FOLLOW_MULTISTEP,
  ),
  mkQ(
    'tmpl-multistep#oz-n2-rain-rain', 'hard',
    tplFp('tmpl-multistep', { chain: 'land-of-oz', from: 0, n: 2, to: 0 }),
    { id: 'tmpl-multistep', params: { chain: 'land-of-oz', n: 2, from: 0, to: 0 } },
    'Land of Oz (Rain/Nice/Snow). Given it **rains today**, probability it **rains again exactly two days later**. Compute via P^2 and explain why you must sum over the weather on the in-between day.',
    T2_SRC,
    ["matrixPower(CHAINS['land-of-oz'].P, 2)[0][0]"],
    ans(formatRational(matrixPower(CHAINS['land-of-oz'].P, 2)[0][0]), 't2-oz-n2-0-0', '7/16'),
    APR_MULTISTEP, WRONG_MULTISTEP, hintsMultistep('land-of-oz', 2, 0, 0), RUB_MULTISTEP, FOLLOW_MULTISTEP,
  ),
  mkQ(
    'tmpl-multistep#oz-n2-rain-snow', 'harder',
    tplFp('tmpl-multistep', { chain: 'land-of-oz', from: 0, n: 2, to: 2 }),
    { id: 'tmpl-multistep', params: { chain: 'land-of-oz', n: 2, from: 0, to: 2 } },
    'Land of Oz: probability it **snows exactly two days after a rainy day**. Set up Chapman-Kolmogorov and explain why this 2-step probability is a sum over the intermediate state, not one path.',
    T2_SRC,
    ["matrixPower(CHAINS['land-of-oz'].P, 2)[0][2]"],
    ans(formatRational(matrixPower(CHAINS['land-of-oz'].P, 2)[0][2]), 't2-oz-n2-0-2', '3/8'),
    APR_MULTISTEP, WRONG_MULTISTEP, hintsMultistep('land-of-oz', 2, 0, 2), RUB_MULTISTEP, FOLLOW_MULTISTEP,
  ),
  mkQ(
    'tmpl-multistep#clear-rainy-n2-r-c', 'harder',
    tplFp('tmpl-multistep', { chain: 'weather-clear-rainy', from: 1, n: 2, to: 0 }),
    { id: 'tmpl-multistep', params: { chain: 'weather-clear-rainy', n: 2, from: 1, to: 0 } },
    'Clear/rainy chain. Given **rainy today**, probability it is **clear two days later**. Compute (P^2) and contrast this entry with the long-run clear share — are they close, and should they be after only two steps?',
    T2_SRC,
    ["matrixPower(CHAINS['weather-clear-rainy'].P, 2)[1][0]"],
    ans(formatRational(matrixPower(CHAINS['weather-clear-rainy'].P, 2)[1][0]), 't2-cr-n2-1-0', '39/100'),
    APR_MULTISTEP, WRONG_MULTISTEP, hintsMultistep('weather-clear-rainy', 2, 1, 0), RUB_MULTISTEP, FOLLOW_MULTISTEP,
  ),
  mkQ(
    'tmpl-multistep#oz-n3-rain-snow', 'harder',
    tplFp('tmpl-multistep', { chain: 'land-of-oz', from: 0, n: 3, to: 2 }),
    { id: 'tmpl-multistep', params: { chain: 'land-of-oz', n: 3, from: 0, to: 2 } },
    'Land of Oz: probability it **snows exactly three days after rain**. Compute P^3 and comment on how the Rain->Snow entry is moving relative to the n=2 value.',
    T2_SRC,
    ["matrixPower(CHAINS['land-of-oz'].P, 3)[0][2]"],
    ans(formatRational(matrixPower(CHAINS['land-of-oz'].P, 3)[0][2]), 't2-oz-n3-0-2', '25/64'),
    APR_MULTISTEP, WRONG_MULTISTEP, hintsMultistep('land-of-oz', 3, 0, 2), RUB_MULTISTEP, FOLLOW_MULTISTEP,
  ),
  mkQ(
    'tmpl-multistep#oz-n4-rain-snow', 'brutal',
    tplFp('tmpl-multistep', { chain: 'land-of-oz', from: 0, n: 4, to: 2 }),
    { id: 'tmpl-multistep', params: { chain: 'land-of-oz', n: 4, from: 0, to: 2 } },
    'Land of Oz: probability it **snows exactly four days after rain**. Compute P^4, then compare with the long-run snow share and explain what convergence of P^n rows you\'re starting to see.',
    T2_SRC,
    ["matrixPower(CHAINS['land-of-oz'].P, 4)[0][2]"],
    ans(formatRational(matrixPower(CHAINS['land-of-oz'].P, 4)[0][2]), 't2-oz-n4-0-2', '51/128'),
    APR_MULTISTEP, WRONG_MULTISTEP, hintsMultistep('land-of-oz', 4, 0, 2), RUB_MULTISTEP, FOLLOW_MULTISTEP,
  ),

  // ── T3: tmpl-absorption (7 questions) ─────────────────────────────────────
  mkQ(
    'tmpl-absorption#gambler-1to3', 'hard',
    tplFp('tmpl-absorption', { chain: 'gambler-0to3-up2_3', start: 1, target: 3 }),
    { id: 'tmpl-absorption', params: { chain: 'gambler-0to3-up2_3', start: 1, target: 3 } },
    'A gambler holding $1 plays a game with an **edge**: each round +$1 w.p. 2/3, -$1 w.p. 1/3, stopping at $0 (broke) or $3 (cash out). Build the chain and find P(cash out at $3 before going broke | start $1). Explain why the edge does not break first-step analysis and why the **start** changes the answer.',
    T3_SRC,
    ["absorptionProbabilities(CHAINS['gambler-0to3-up2_3'].P, [0,3])[0][1]"],
    ans(formatRational(absorptionAt('gambler-0to3-up2_3', 1, 3)), 't3-gambler-1to3', '4/7'),
    APR_ABSORPTION, WRONG_ABSORPTION, hintsAbsorption('gambler-0to3-up2_3'), RUB_ABSORPTION, FOLLOW_ABSORPTION,
  ),
  mkQ(
    'tmpl-absorption#drunkard-1to4', 'hard',
    tplFp('tmpl-absorption', { chain: 'drunkard-0to4', start: 1, target: 4 }),
    { id: 'tmpl-absorption', params: { chain: 'drunkard-0to4', start: 1, target: 4 } },
    "A token does a symmetric +/-1 walk on 0-4 with 0 and 4 absorbing. From state **1**, probability of absorption at 4 before 0. Build it and explain why 'each step is 1/2-1/2' does **not** mean the outcome is 50/50.",
    T3_SRC,
    ["absorptionProbabilities(CHAINS['drunkard-0to4'].P, [0,4])[0][1]"],
    ans(formatRational(absorptionAt('drunkard-0to4', 1, 4)), 't3-drunkard-1to4', '1/4'),
    APR_ABSORPTION, WRONG_ABSORPTION, hintsAbsorption('drunkard-0to4'), RUB_ABSORPTION, FOLLOW_ABSORPTION,
  ),
  mkQ(
    'tmpl-absorption#gambler-2to3', 'harder',
    tplFp('tmpl-absorption', { chain: 'gambler-0to3-up2_3', start: 2, target: 3 }),
    { id: 'tmpl-absorption', params: { chain: 'gambler-0to3-up2_3', start: 2, target: 3 } },
    'Same edged gambler (+$1 w.p. 2/3) on $0-$3, but starting at **$2**. P(cash out at $3 first). Explain how moving one dollar up changed the split, and why this stays an exact rational.',
    T3_SRC,
    ["absorptionProbabilities(CHAINS['gambler-0to3-up2_3'].P, [0,3])[1][1]"],
    ans(formatRational(absorptionAt('gambler-0to3-up2_3', 2, 3)), 't3-gambler-2to3', '6/7'),
    APR_ABSORPTION, WRONG_ABSORPTION, hintsAbsorption('gambler-0to3-up2_3'), RUB_ABSORPTION, FOLLOW_ABSORPTION,
  ),
  mkQ(
    'tmpl-absorption#coin-thh-first', 'harder',
    tplFp('tmpl-absorption', { chain: 'coin-hhh-thh', start: 0, target: 6 }),
    { id: 'tmpl-absorption', params: { chain: 'coin-hhh-thh', start: 0, target: 6 } },
    "A fair coin is flipped until **HHH** or **THH** appears (whichever first). Build the combined pattern chain and find P(**THH** appears first). Explain the 'ambush' structure that makes THH so dominant.",
    T3_SRC,
    ["absorptionProbabilities(CHAINS['coin-hhh-thh'].P, [5,6])[0][1]"],
    ans(formatRational(absorptionAt('coin-hhh-thh', 0, 6)), 't3-coin-thh-first', '7/8'),
    APR_ABSORPTION, WRONG_ABSORPTION, hintsAbsorption('coin-hhh-thh'), RUB_ABSORPTION, FOLLOW_ABSORPTION,
  ),
  mkQ(
    'tmpl-absorption#dice-12-first', 'harder',
    tplFp('tmpl-absorption', { chain: 'dice-12-vs-77', start: 0, target: 3 }),
    { id: 'tmpl-absorption', params: { chain: 'dice-12-vs-77', start: 0, target: 3 } },
    'Two dice are summed each roll. One player wins if a **single 12** appears first, the other if **two consecutive 7s** appear first. Build the {S,7,77,12} chain (per-roll P(7)=1/6, P(12)=1/36) and find P(**single 12 first**). State precisely which absorbing state you\'re solving for.',
    T3_SRC,
    ["absorptionProbabilities(CHAINS['dice-12-vs-77'].P, [2,3])[0][1]"],
    ans(formatRational(absorptionAt('dice-12-vs-77', 0, 3)), 't3-dice-12-first', '7/13'),
    APR_ABSORPTION, WRONG_ABSORPTION, hintsAbsorption('dice-12-vs-77'), RUB_ABSORPTION, FOLLOW_ABSORPTION,
  ),
  mkQ(
    'tmpl-absorption#coin-hhh-first', 'brutal',
    tplFp('tmpl-absorption', { chain: 'coin-hhh-thh', start: 0, target: 5 }),
    { id: 'tmpl-absorption', params: { chain: 'coin-hhh-thh', start: 0, target: 5 } },
    'Same HHH-vs-THH race on a fair coin. Find P(**HHH** appears first) and explain why it is so much smaller than the THH probability — what is the **only** way HHH can win, and why does any tail doom it?',
    T3_SRC,
    ["absorptionProbabilities(CHAINS['coin-hhh-thh'].P, [5,6])[0][0]"],
    ans(formatRational(absorptionAt('coin-hhh-thh', 0, 5)), 't3-coin-hhh-first', '1/8'),
    APR_ABSORPTION, WRONG_ABSORPTION, hintsAbsorption('coin-hhh-thh'), RUB_ABSORPTION, FOLLOW_ABSORPTION,
  ),
  mkQ(
    'tmpl-absorption#dice-77-first', 'brutal',
    tplFp('tmpl-absorption', { chain: 'dice-12-vs-77', start: 0, target: 2 }),
    { id: 'tmpl-absorption', params: { chain: 'dice-12-vs-77', start: 0, target: 2 } },
    'Same dice game. Find P(**two consecutive 7s first**). Be explicit that this is the complement event — name the absorbing state — and verify it against the single-12 probability.',
    T3_SRC,
    ["absorptionProbabilities(CHAINS['dice-12-vs-77'].P, [2,3])[0][0]"],
    ans(formatRational(absorptionAt('dice-12-vs-77', 0, 2)), 't3-dice-77-first', '6/13'),
    APR_ABSORPTION, WRONG_ABSORPTION, hintsAbsorption('dice-12-vs-77'), RUB_ABSORPTION, FOLLOW_ABSORPTION,
  ),

  // ── T4: tmpl-expected-absorption (5 questions) ────────────────────────────
  mkQ(
    'tmpl-expected-absorption#drunkard-i2', 'hard',
    tplFp('tmpl-expected-absorption', { chain: 'drunkard-0to4', start: 2 }),
    { id: 'tmpl-expected-absorption', params: { chain: 'drunkard-0to4', start: 2 } },
    "Symmetric +/-1 walk on 0-4 (ends absorbing). Expected number of steps until absorption, **starting at 2**. Build it and explain where the '+1 per step' comes from (and why a probability question wouldn't have it).",
    T4_SRC,
    ["expectedAbsorptionTime(CHAINS['drunkard-0to4'].P, [0,4])[1]"],
    ans(formatRational(expectedAt('drunkard-0to4', 2)), 't4-drunkard-i2', '4'),
    APR_EXPECTED, WRONG_EXPECTED, hintsExpected('drunkard-0to4'), RUB_EXPECTED, FOLLOW_EXPECTED,
  ),
  mkQ(
    'tmpl-expected-absorption#hh-wait', 'hard',
    tplFp('tmpl-expected-absorption', { chain: 'hh-wait', start: 0 }),
    { id: 'tmpl-expected-absorption', params: { chain: 'hh-wait', start: 0 } },
    'Fair coin. Expected number of flips until **HH** first appears. Build the run-length chain {empty,H,HH} and explain why a tail seen right after a single head sends you back to the empty start — and why that reset lengthens the wait.',
    T4_SRC,
    ["expectedAbsorptionTime(CHAINS['hh-wait'].P, [2])[0]"],
    ans(formatRational(expectedAt('hh-wait', 0)), 't4-hh-wait', '6'),
    APR_EXPECTED, WRONG_EXPECTED, hintsExpected('hh-wait'), RUB_EXPECTED, FOLLOW_EXPECTED,
  ),
  mkQ(
    'tmpl-expected-absorption#drunkard-i1', 'harder',
    tplFp('tmpl-expected-absorption', { chain: 'drunkard-0to4', start: 1 }),
    { id: 'tmpl-expected-absorption', params: { chain: 'drunkard-0to4', start: 1 } },
    'Same symmetric walk on 0-4. Expected steps to absorption **from state 1**. Build it, give the value, and explain via symmetry why starting at 1 and starting at 3 take the same expected time.',
    T4_SRC,
    ["expectedAbsorptionTime(CHAINS['drunkard-0to4'].P, [0,4])[0]"],
    ans(formatRational(expectedAt('drunkard-0to4', 1)), 't4-drunkard-i1', '3'),
    APR_EXPECTED, WRONG_EXPECTED, hintsExpected('drunkard-0to4'), RUB_EXPECTED, FOLLOW_EXPECTED,
  ),
  mkQ(
    'tmpl-expected-absorption#thh-wait', 'harder',
    tplFp('tmpl-expected-absorption', { chain: 'thh-wait', start: 0 }),
    { id: 'tmpl-expected-absorption', params: { chain: 'thh-wait', start: 0 } },
    'Fair coin. Expected flips until **THH**. Build {empty,T,TH,THH} and explain precisely why a mismatch from TH falls back to **T**, not to the empty start — and how that shortens the wait relative to HHH.',
    T4_SRC,
    ["expectedAbsorptionTime(CHAINS['thh-wait'].P, [3])[0]"],
    ans(formatRational(expectedAt('thh-wait', 0)), 't4-thh-wait', '8'),
    APR_EXPECTED, WRONG_EXPECTED, hintsExpected('thh-wait'), RUB_EXPECTED, FOLLOW_EXPECTED,
  ),
  mkQ(
    'tmpl-expected-absorption#hhh-wait', 'brutal',
    tplFp('tmpl-expected-absorption', { chain: 'hhh-wait', start: 0 }),
    { id: 'tmpl-expected-absorption', params: { chain: 'hhh-wait', start: 0 } },
    'Fair coin. Expected flips until **HHH**. Build {empty,H,HH,HHH} and explain why HHH waits so much longer than THH despite equal length — connect it to the self-overlap / reset structure.',
    T4_SRC,
    ["expectedAbsorptionTime(CHAINS['hhh-wait'].P, [3])[0]"],
    ans(formatRational(expectedAt('hhh-wait', 0)), 't4-hhh-wait', '14'),
    APR_EXPECTED, WRONG_EXPECTED, hintsExpected('hhh-wait'), RUB_EXPECTED, FOLLOW_EXPECTED,
  ),

  // ── T5: tmpl-gamblers-ruin (10 questions) ─────────────────────────────────
  mkQ(
    'tmpl-gamblers-ruin#N4-p1_2-i1-reach', 'hard',
    tplFp('tmpl-gamblers-ruin', { N: 4, i: 1, pDen: 2, pNum: 1, query: 'reach' }),
    { id: 'tmpl-gamblers-ruin', params: { N: 4, pNum: 1, pDen: 2, i: 1, query: 'reach' } },
    "A market-maker's inventory does a **fair** +/-1 walk between a hard floor 0 and ceiling 4 (both force a stop). From inventory **1**, probability of hitting the ceiling 4 before the floor 0. Give the closed form and justify why reach is **linear** in the start.",
    T5_SRC,
    ['absorptionProbabilities(buildWalk(4,1,2),[0,4])[0][1]'],
    ans(formatRational(walkReach(4, 1, 2, 1)), 't5-N4-p1_2-i1-reach', '1/4'),
    APR_RUIN, WRONG_RUIN, HINTS_RUIN, RUB_RUIN, FOLLOW_RUIN,
  ),
  mkQ(
    'tmpl-gamblers-ruin#N4-p1_2-i2-duration', 'hard',
    tplFp('tmpl-gamblers-ruin', { N: 4, i: 2, pDen: 2, pNum: 1, query: 'duration' }),
    { id: 'tmpl-gamblers-ruin', params: { N: 4, pNum: 1, pDen: 2, i: 2, query: 'duration' } },
    'Same fair inventory walk on 0-4. Expected number of steps until it stops, **from 2**. Contrast this with the reach probability — which carries a +1 and why?',
    T5_SRC,
    ['expectedAbsorptionTime(buildWalk(4,1,2),[0,4])[1]'],
    ans(formatRational(walkDuration(4, 1, 2, 2)), 't5-N4-p1_2-i2-duration', '4'),
    APR_RUIN, WRONG_RUIN, HINTS_RUIN, RUB_RUIN, FOLLOW_RUIN,
  ),
  mkQ(
    'tmpl-gamblers-ruin#N6-p1_2-i3-reach', 'harder',
    tplFp('tmpl-gamblers-ruin', { N: 6, i: 3, pDen: 2, pNum: 1, query: 'reach' }),
    { id: 'tmpl-gamblers-ruin', params: { N: 6, pNum: 1, pDen: 2, i: 3, query: 'reach' } },
    'Fair +/-1 walk on 0-6, start at the midpoint **3**. Probability of reaching 6 before 0. Show it from the closed form and explain why the midpoint of a fair walk is exactly even money.',
    T5_SRC,
    ['absorptionProbabilities(buildWalk(6,1,2),[0,6])[2][1]'],
    ans(formatRational(walkReach(6, 1, 2, 3)), 't5-N6-p1_2-i3-reach', '1/2'),
    APR_RUIN, WRONG_RUIN, HINTS_RUIN, RUB_RUIN, FOLLOW_RUIN,
  ),
  mkQ(
    'tmpl-gamblers-ruin#N5-p1_2-i2-duration', 'harder',
    tplFp('tmpl-gamblers-ruin', { N: 5, i: 2, pDen: 2, pNum: 1, query: 'duration' }),
    { id: 'tmpl-gamblers-ruin', params: { N: 5, pNum: 1, pDen: 2, i: 2, query: 'duration' } },
    'Fair walk on 0-5, **start 2**. Expected steps to absorption. Use i(N-i) and explain why duration peaks in the middle of the board.',
    T5_SRC,
    ['expectedAbsorptionTime(buildWalk(5,1,2),[0,5])[1]'],
    ans(formatRational(walkDuration(5, 1, 2, 2)), 't5-N5-p1_2-i2-duration', '6'),
    APR_RUIN, WRONG_RUIN, HINTS_RUIN, RUB_RUIN, FOLLOW_RUIN,
  ),
  mkQ(
    'tmpl-gamblers-ruin#N10-p1_2-i5-duration', 'harder',
    tplFp('tmpl-gamblers-ruin', { N: 10, i: 5, pDen: 2, pNum: 1, query: 'duration' }),
    { id: 'tmpl-gamblers-ruin', params: { N: 10, pNum: 1, pDen: 2, i: 5, query: 'duration' } },
    'Fair walk on 0-10, **start at the middle 5**. Expected steps to absorption. Why is the duration quadratic in the start, so a wider board costs disproportionately more time?',
    T5_SRC,
    ['expectedAbsorptionTime(buildWalk(10,1,2),[0,10])[4]'],
    ans(formatRational(walkDuration(10, 1, 2, 5)), 't5-N10-p1_2-i5-duration', '25'),
    APR_RUIN, WRONG_RUIN, HINTS_RUIN, RUB_RUIN, FOLLOW_RUIN,
  ),
  mkQ(
    'tmpl-gamblers-ruin#N4-p1_3-i2-reach', 'harder',
    tplFp('tmpl-gamblers-ruin', { N: 4, i: 2, pDen: 3, pNum: 1, query: 'reach' }),
    { id: 'tmpl-gamblers-ruin', params: { N: 4, pNum: 1, pDen: 3, i: 2, query: 'reach' } },
    'A **losing** game: +1 w.p. 1/3, -1 w.p. 2/3, barriers 0 and 4, start **2**. Probability of reaching 4 first. Show how the bias enters through r=q/p and how it collapses an even-money midpoint.',
    T5_SRC,
    ['absorptionProbabilities(buildWalk(4,1,3),[0,4])[1][1]'],
    ans(formatRational(walkReach(4, 1, 3, 2)), 't5-N4-p1_3-i2-reach', '1/5'),
    APR_RUIN, WRONG_RUIN, HINTS_RUIN, RUB_RUIN, FOLLOW_RUIN,
  ),
  mkQ(
    'tmpl-gamblers-ruin#N4-p2_5-i2-reach', 'brutal',
    tplFp('tmpl-gamblers-ruin', { N: 4, i: 2, pDen: 5, pNum: 2, query: 'reach' }),
    { id: 'tmpl-gamblers-ruin', params: { N: 4, pNum: 2, pDen: 5, i: 2, query: 'reach' } },
    'Edge against you: +1 w.p. **2/5**, barriers 0 and 4, start **2**. Reach 4 first? Keep it an exact rational and locate the 13 in the (1-r^4) denominator.',
    T5_SRC,
    ['absorptionProbabilities(buildWalk(4,2,5),[0,4])[1][1]'],
    ans(formatRational(walkReach(4, 2, 5, 2)), 't5-N4-p2_5-i2-reach', '4/13'),
    APR_RUIN, WRONG_RUIN, HINTS_RUIN, RUB_RUIN, FOLLOW_RUIN,
  ),
  mkQ(
    'tmpl-gamblers-ruin#N4-p2_5-i2-duration', 'brutal',
    tplFp('tmpl-gamblers-ruin', { N: 4, i: 2, pDen: 5, pNum: 2, query: 'duration' }),
    { id: 'tmpl-gamblers-ruin', params: { N: 4, pNum: 2, pDen: 5, i: 2, query: 'duration' } },
    'Same biased walk (p=2/5) on 0-4, **start 2**. Expected steps to absorption — an ugly rational. Explain why a biased duration is **not** symmetric in the start, unlike the fair case.',
    T5_SRC,
    ['expectedAbsorptionTime(buildWalk(4,2,5),[0,4])[1]'],
    ans(formatRational(walkDuration(4, 2, 5, 2)), 't5-N4-p2_5-i2-duration', '50/13'),
    APR_RUIN, WRONG_RUIN, HINTS_RUIN, RUB_RUIN, FOLLOW_RUIN,
  ),
  mkQ(
    'tmpl-gamblers-ruin#N5-p2_3-i3-reach', 'brutal',
    tplFp('tmpl-gamblers-ruin', { N: 5, i: 3, pDen: 3, pNum: 2, query: 'reach' }),
    { id: 'tmpl-gamblers-ruin', params: { N: 5, pNum: 2, pDen: 3, i: 3, query: 'reach' } },
    'Edge **for** you: +1 w.p. **2/3**, barriers 0 and 5, start **3**. Probability of reaching 5 first. Show the biased closed form and explain why a positive edge pushes reach well above 3/5.',
    T5_SRC,
    ['absorptionProbabilities(buildWalk(5,2,3),[0,5])[2][1]'],
    ans(formatRational(walkReach(5, 2, 3, 3)), 't5-N5-p2_3-i3-reach', '28/31'),
    APR_RUIN, WRONG_RUIN, HINTS_RUIN, RUB_RUIN, FOLLOW_RUIN,
  ),
  mkQ(
    'tmpl-gamblers-ruin#N6-p1_3-i4-reach', 'brutal',
    tplFp('tmpl-gamblers-ruin', { N: 6, i: 4, pDen: 3, pNum: 1, query: 'reach' }),
    { id: 'tmpl-gamblers-ruin', params: { N: 6, pNum: 1, pDen: 3, i: 4, query: 'reach' } },
    'Edge against you: +1 w.p. **1/3**, barriers 0 and 6, start **4**. Reach 6 first? Note how even a high starting stake can\'t rescue reach against a persistent negative drift — quantify it exactly.',
    T5_SRC,
    ['absorptionProbabilities(buildWalk(6,1,3),[0,6])[3][1]'],
    ans(formatRational(walkReach(6, 1, 3, 4)), 't5-N6-p1_3-i4-reach', '5/21'),
    APR_RUIN, WRONG_RUIN, HINTS_RUIN, RUB_RUIN, FOLLOW_RUIN,
  ),

  // ── T6: tmpl-detailed-balance (4 questions) ───────────────────────────────
  mkQ(
    'tmpl-detailed-balance#weather-half-3q', 'hard',
    tplFp('tmpl-detailed-balance', { chain: 'weather-half-3q' }),
    { id: 'tmpl-detailed-balance', params: { chain: 'weather-half-3q' } },
    'Two-state chain: A->A 1/2, B->B 3/4. **Without** solving the full eigen-system, use detailed balance to get the stationary vector in one line — and explain why **every** irreducible 2-state chain is automatically reversible.',
    T6_SRC,
    ["detailedBalance(CHAINS['weather-half-3q'].P).pi"],
    (() => {
      const db = detailedBalance(CHAINS['weather-half-3q'].P)
      if (!db.reversible) throw new Error('weather-half-3q must be reversible')
      return ans(formatVector(db.pi), 't6-weather-half-3q', '1/3,2/3')
    })(),
    APR_DETAILED, WRONG_DETAILED, hintsDetailedBalance('weather-half-3q'), RUB_DETAILED, FOLLOW_DETAILED,
  ),
  mkQ(
    'tmpl-detailed-balance#ehrenfest-2', 'harder',
    tplFp('tmpl-detailed-balance', { chain: 'ehrenfest-2' }),
    { id: 'tmpl-detailed-balance', params: { chain: 'ehrenfest-2' } },
    'Two balls, two urns; each tick move one random ball to the other urn. Using detailed balance **along the birth-death ladder** (not the full solve), give the long-run share of 0/1/2 balls in the left urn. Why is detailed balance guaranteed for any birth-death chain?',
    T6_SRC,
    ["detailedBalance(CHAINS['ehrenfest-2'].P).pi"],
    (() => {
      const db = detailedBalance(CHAINS['ehrenfest-2'].P)
      if (!db.reversible) throw new Error('ehrenfest-2 must be reversible')
      return ans(formatVector(db.pi), 't6-ehrenfest-2', '1/4,1/2,1/4')
    })(),
    APR_DETAILED, WRONG_DETAILED, hintsDetailedBalance('ehrenfest-2'), RUB_DETAILED, FOLLOW_DETAILED,
  ),
  mkQ(
    'tmpl-detailed-balance#ehrenfest-3', 'harder',
    tplFp('tmpl-detailed-balance', { chain: 'ehrenfest-3' }),
    { id: 'tmpl-detailed-balance', params: { chain: 'ehrenfest-3' } },
    'Three balls, two urns, same dynamics. Use the detailed-balance ladder to read the stationary vector, and identify the **binomial** pattern emerging in the numerators.',
    T6_SRC,
    ["detailedBalance(CHAINS['ehrenfest-3'].P).pi"],
    (() => {
      const db = detailedBalance(CHAINS['ehrenfest-3'].P)
      if (!db.reversible) throw new Error('ehrenfest-3 must be reversible')
      return ans(formatVector(db.pi), 't6-ehrenfest-3', '1/8,3/8,3/8,1/8')
    })(),
    APR_DETAILED, WRONG_DETAILED, hintsDetailedBalance('ehrenfest-3'), RUB_DETAILED, FOLLOW_DETAILED,
  ),
  mkQ(
    'tmpl-detailed-balance#ehrenfest-4', 'brutal',
    tplFp('tmpl-detailed-balance', { chain: 'ehrenfest-4' }),
    { id: 'tmpl-detailed-balance', params: { chain: 'ehrenfest-4' } },
    'Four balls, two urns. Give the **full** stationary vector via detailed balance and prove it is C(4,i)/2^4 — then state why diffusion concentrates near the half-full state.',
    T6_SRC,
    ["detailedBalance(CHAINS['ehrenfest-4'].P).pi"],
    (() => {
      const db = detailedBalance(CHAINS['ehrenfest-4'].P)
      if (!db.reversible) throw new Error('ehrenfest-4 must be reversible')
      return ans(formatVector(db.pi), 't6-ehrenfest-4', '1/16,1/4,3/8,1/4,1/16')
    })(),
    APR_DETAILED, WRONG_DETAILED, hintsDetailedBalance('ehrenfest-4'), RUB_DETAILED, FOLLOW_DETAILED,
  ),

  // ── T7: tmpl-kac-return (5 questions) ─────────────────────────────────────
  mkQ(
    'tmpl-kac-return#clear-rainy-clear', 'hard',
    tplFp('tmpl-kac-return', { chain: 'weather-clear-rainy', state: 0 }),
    { id: 'tmpl-kac-return', params: { chain: 'weather-clear-rainy', state: 0 } },
    'Clear/rainy chain (clear->clear 3/5; rainy->rainy 7/10). What is the mean number of days between consecutive **clear** days (first return to Clear)? Use Kac and explain its link to the stationary share.',
    T7_SRC,
    ["kacReturnTime(CHAINS['weather-clear-rainy'].P, 0)"],
    ans(formatRational(kacReturnTime(CHAINS['weather-clear-rainy'].P, 0)), 't7-cr-clear', '7/3'),
    APR_KAC, WRONG_KAC, hintsKac('weather-clear-rainy', 0), RUB_KAC, FOLLOW_KAC,
  ),
  mkQ(
    'tmpl-kac-return#clear-rainy-rainy', 'harder',
    tplFp('tmpl-kac-return', { chain: 'weather-clear-rainy', state: 1 }),
    { id: 'tmpl-kac-return', params: { chain: 'weather-clear-rainy', state: 1 } },
    'Same chain — mean gap between consecutive **rainy** days. Compute via 1/pi and explain why the more common state returns faster.',
    T7_SRC,
    ["kacReturnTime(CHAINS['weather-clear-rainy'].P, 1)"],
    ans(formatRational(kacReturnTime(CHAINS['weather-clear-rainy'].P, 1)), 't7-cr-rainy', '7/4'),
    APR_KAC, WRONG_KAC, hintsKac('weather-clear-rainy', 1), RUB_KAC, FOLLOW_KAC,
  ),
  mkQ(
    'tmpl-kac-return#cloudy-sunny', 'harder',
    tplFp('tmpl-kac-return', { chain: 'cloudy-town', state: 0 }),
    { id: 'tmpl-kac-return', params: { chain: 'cloudy-town', state: 0 } },
    'Cloudy-town (sunny/cloudy/rainy, rows as given). Mean number of days between **sunny** days. Find the sunny stationary share first, then apply Kac, and say why sunny has the longest return time.',
    T7_SRC,
    ["kacReturnTime(CHAINS['cloudy-town'].P, 0)"],
    ans(formatRational(kacReturnTime(CHAINS['cloudy-town'].P, 0)), 't7-cloudy-sunny', '5'),
    APR_KAC, WRONG_KAC, hintsKac('cloudy-town', 0), RUB_KAC, FOLLOW_KAC,
  ),
  mkQ(
    'tmpl-kac-return#cloudy-cloudy', 'harder',
    tplFp('tmpl-kac-return', { chain: 'cloudy-town', state: 1 }),
    { id: 'tmpl-kac-return', params: { chain: 'cloudy-town', state: 1 } },
    'Cloudy-town — mean gap between **cloudy** days. Compute via 1/pi and contrast with the sunny return time.',
    T7_SRC,
    ["kacReturnTime(CHAINS['cloudy-town'].P, 1)"],
    ans(formatRational(kacReturnTime(CHAINS['cloudy-town'].P, 1)), 't7-cloudy-cloudy', '5/2'),
    APR_KAC, WRONG_KAC, hintsKac('cloudy-town', 1), RUB_KAC, FOLLOW_KAC,
  ),
  mkQ(
    'tmpl-kac-return#cloudy-rainy', 'brutal',
    tplFp('tmpl-kac-return', { chain: 'cloudy-town', state: 2 }),
    { id: 'tmpl-kac-return', params: { chain: 'cloudy-town', state: 2 } },
    'Cloudy-town — mean gap between **rainy** days. Give the value and **explain why cloudy and rainy share the same mean return time** (what does that say about their stationary shares?).',
    T7_SRC,
    ["kacReturnTime(CHAINS['cloudy-town'].P, 2)"],
    ans(formatRational(kacReturnTime(CHAINS['cloudy-town'].P, 2)), 't7-cloudy-rainy', '5/2'),
    APR_KAC, WRONG_KAC, hintsKac('cloudy-town', 2), RUB_KAC, FOLLOW_KAC,
  ),

  // ── T8: tmpl-pagerank (5 questions) ───────────────────────────────────────
  mkQ(
    'tmpl-pagerank#3cycle-d85_100', 'hard',
    tplFp('tmpl-pagerank', { dDen: 100, dNum: 85, graph: 'pr-3cycle' }),
    { id: 'tmpl-pagerank', params: { graph: 'pr-3cycle', dNum: 85, dDen: 100 } },
    'Three pages link in a cycle A->B->C->A. With the standard damping **d=0.85**, compute the PageRank vector and name the most important page. Explain the result in one sentence.',
    T8_SRC,
    ["pagerank(GRAPHS['pr-3cycle'], reduce(85,100))"],
    ans(formatVector(pagerank(GRAPHS['pr-3cycle'], reduce(85, 100))), 't8-3cycle-d85', '1/3,1/3,1/3'),
    APR_PAGERANK, WRONG_PAGERANK, hintsPageRank('pr-3cycle', 85, 100), RUB_PAGERANK, FOLLOW_PAGERANK,
  ),
  mkQ(
    'tmpl-pagerank#3cycle-d1_2', 'harder',
    tplFp('tmpl-pagerank', { dDen: 2, dNum: 1, graph: 'pr-3cycle' }),
    { id: 'tmpl-pagerank', params: { graph: 'pr-3cycle', dNum: 1, dDen: 2 } },
    'Same 3-cycle, now **d=1/2**. Does the ranking change versus d=0.85? Compute it and explain precisely why the damping is irrelevant for this graph.',
    T8_SRC,
    ["pagerank(GRAPHS['pr-3cycle'], reduce(1,2))"],
    ans(formatVector(pagerank(GRAPHS['pr-3cycle'], reduce(1, 2))), 't8-3cycle-d1_2', '1/3,1/3,1/3'),
    APR_PAGERANK, WRONG_PAGERANK, hintsPageRank('pr-3cycle', 1, 2), RUB_PAGERANK, FOLLOW_PAGERANK,
  ),
  mkQ(
    'tmpl-pagerank#4node-d1', 'harder',
    tplFp('tmpl-pagerank', { dDen: 1, dNum: 1, graph: 'pr-4node' }),
    { id: 'tmpl-pagerank', params: { graph: 'pr-4node', dNum: 1, dDen: 1 } },
    "Four pages: 1->2; 2->{1,4}; 3->{1,4}; 4->{1,2,3}. With **no damping (d=1)** rank all four pages and name the most important. Use this to **refute** 'the page with the most in-links wins'.",
    T8_SRC,
    ["pagerank(GRAPHS['pr-4node'], reduce(1,1))"],
    ans(formatVector(pagerank(GRAPHS['pr-4node'], reduce(1, 1))), 't8-4node-d1', '4/13,5/13,1/13,3/13'),
    APR_PAGERANK, WRONG_PAGERANK, hintsPageRank('pr-4node', 1, 1), RUB_PAGERANK, FOLLOW_PAGERANK,
  ),
  mkQ(
    'tmpl-pagerank#3node-d1_2', 'brutal',
    tplFp('tmpl-pagerank', { dDen: 2, dNum: 1, graph: 'pr-3node' }),
    { id: 'tmpl-pagerank', params: { graph: 'pr-3node', dNum: 1, dDen: 2 } },
    'Three pages: 1->{2,3}; 2->3; 3->1. With damping **d=1/2**, compute the full PageRank vector (ugly rationals) and rank the pages. Show the Google-matrix setup explicitly.',
    T8_SRC,
    ["pagerank(GRAPHS['pr-3node'], reduce(1,2))"],
    ans(formatVector(pagerank(GRAPHS['pr-3node'], reduce(1, 2))), 't8-3node-d1_2', '14/39,10/39,5/13'),
    APR_PAGERANK, WRONG_PAGERANK, hintsPageRank('pr-3node', 1, 2), RUB_PAGERANK, FOLLOW_PAGERANK,
  ),
  mkQ(
    'tmpl-pagerank#3cycle-d9_10', 'brutal',
    tplFp('tmpl-pagerank', { dDen: 10, dNum: 9, graph: 'pr-3cycle' }),
    { id: 'tmpl-pagerank', params: { graph: 'pr-3cycle', dNum: 9, dDen: 10 } },
    'The same 3-cycle at **d=9/10**. Rather than re-solving, **prove** the PageRank is uniform for **any** damping d, using the graph\'s symmetry — then confirm it matches the solved vector.',
    T8_SRC,
    ["pagerank(GRAPHS['pr-3cycle'], reduce(9,10))"],
    ans(formatVector(pagerank(GRAPHS['pr-3cycle'], reduce(9, 10))), 't8-3cycle-d9_10', '1/3,1/3,1/3'),
    APR_PAGERANK, WRONG_PAGERANK, hintsPageRank('pr-3cycle', 9, 10), RUB_PAGERANK, FOLLOW_PAGERANK,
  ),

  // ── Free-form (5 questions) ────────────────────────────────────────────────
  mkQ(
    'ff-classify-then-solve', 'brutal',
    semFp('classify-then-solve', 'drunkard-0to4', 'reach-vector', 'starts-1-2-3'),
    undefined,
    'A chain lands on your desk with the labels torn off: a token sits on one of five pads 0-4; from any interior pad it slips to an adjacent pad with equal probability; pads 0 and 4 are **sticky** (once there it never leaves). BEFORE computing anything, classify the chain — is there a state it can never leave? — then answer the question that classification implies: starting on pads 1, 2, and 3, the probability the token ends on pad 4 rather than pad 0. Give the full vector and explain why \'the long-run share of the middle\' is the **wrong** question here.',
    'WEB Grinstead & Snell Ex.11.13-15 (drunkard i/N) + classification GB §5.1 p.54-55',
    ['classifyStates(drunkard-0to4)', 'absorptionProbabilities(drunkard-0to4,[0,4]) -> target-4 column for starts 1,2,3'],
    ans(
      formatVector([absorptionAt('drunkard-0to4', 1, 4), absorptionAt('drunkard-0to4', 2, 4), absorptionAt('drunkard-0to4', 3, 4)]),
      'ff-classify-then-solve', '1/4,1/2,3/4',
    ),
    [
      'Classify first: pads 0 and 4 absorbing, 1-3 transient => ask absorption, not stationary. Solve a_i = 1/2 a_{i-1} + 1/2 a_{i+1}, a_0=0, a_4=1 => i/4.',
      'Read the target-4 column of B=(I-Q)^-1 R for the three interior pads (the expected times here are 3,4,3, a separate question).',
    ],
    [
      'it runs a while, so ask its long-run/stationary share',
      'a symmetric walk is 50/50 to either end from any start',
      'reach probability equals the expected number of steps',
      'treat the sticky pads as ordinary states',
    ],
    [
      'First test for a state the chain can never leave — that single fork decides whether you set up piP=pi or (I-Q)^-1 R.',
      'Two pads are absorbing, the three interior pads transient — so this is an absorption-probability question: pin the far pad to one and the near pad to zero, and write each interior pad as the average of its neighbors.',
      'Solve that interior system for all three starts and reduce; report the vector and reject the stationary reading — once the token sticks there is no long-run interior share.',
    ],
    {
      correctness: 'matches the exact absorption vector for starts 1,2,3',
      approach: 'classifies absorbing-vs-ergodic first, then solves the implied absorption system',
      rigor: 'rejects the stationary trap; boundaries 1/0 correct; exact rationals',
      communication: 'explains why structure (a state you can\'t leave), not the story, picks the tool',
      speed: 'sees i/N immediately for the symmetric case',
    },
    [
      'Now give the expected number of steps to stick from each start.',
      'Make the slips biased — recompute the reach vector.',
      'If both end pads were reflecting instead of sticky, which tool would you switch to?',
    ],
  ),
  mkQ(
    'ff-ehrenfest-periodic', 'brutal',
    semFp('ehrenfest-periodic', 'ehrenfest-2', 'stationary-and-period', 'converge-or-not'),
    undefined,
    "Two boxes hold 2 balls total; each tick you pick one of the 2 balls uniformly and move it to the other box. A colleague says 'the chain converges, so just take the limit of P^n.' Give the long-run fraction of time the left box holds 0, 1, 2 balls, AND state the chain's **period** — then settle the dispute: does P^n actually converge? Say precisely which long-run statement is valid and which is not.",
    'WEB Ehrenfest stats.libretexts 16.8 (stationary) + periodicity',
    ['stationaryDistribution(ehrenfest-2)', 'classifyStates(ehrenfest-2) -> period 2'],
    ans(formatVector(stationaryDistribution(CHAINS['ehrenfest-2'].P)), 'ff-ehrenfest-periodic', '1/4,1/2,1/4'),
    [
      'piP=pi (or detailed balance) gives the time-share; gcd of return-cycle lengths gives the period (here 2). The fraction-of-time exists (ergodic theorem) but P^n oscillates by parity, so it has no limit.',
      'Note pi=C(2,i)/2^2 and that every return to a state takes an even number of steps.',
    ],
    [
      'a stationary distribution implies P^n converges',
      'periodic chains have no stationary distribution',
      'the time-average and the step-n distribution are the same thing',
      'period is the number of states',
    ],
    [
      "Separate two different 'long-run' claims: the fraction of time in each state versus the distribution exactly at step n.",
      'Get the time-share from piP=pi (or detailed balance); get the period from the gcd of return-cycle lengths — here every return takes an even number of steps.',
      "Report the share and the period, then conclude the step-n matrix flips parity forever, so its limit doesn't exist even though the time-average does — state both, don't compute a fake limit.",
    ],
    {
      correctness: 'matches the exact stationary share and the period',
      approach: 'computes pi and the period and distinguishes time-average from P^n-limit',
      rigor: 'denies P^n convergence for a periodic chain while affirming the time-share',
      communication: "crisply separates 'fraction of time' from 'distribution at step n'",
      speed: 'uses the binomial/detailed-balance shortcut for pi',
    },
    [
      'Repeat for 3 balls — what is pi and is it still periodic?',
      'What minimal change (a self-loop) would make P^n converge?',
      'Compute the mean return time to the empty-left-box state.',
    ],
  ),
  mkQ(
    'ff-cloudy-stationary-and-kac', 'brutal',
    semFp('cloudy-stationary-kac', 'cloudy-town', 'stationary-and-return', 'sunny'),
    undefined,
    "A city's weather is a 3-state chain — sunny, cloudy, rainy: from sunny it never stays sunny (1/2 cloudy, 1/2 rainy); from cloudy it's 1/4 sunny, 1/2 cloudy, 1/4 rainy; from rainy it's 1/4 sunny, 1/4 cloudy, 1/2 rainy. Two desk questions: (a) the long-run fraction of sunny/cloudy/rainy days, and (b) the **mean number of days between consecutive sunny days**. Give both exactly and explain the relationship between them.",
    'WEB cloudy-town Rochester ECE440 HW5 #2 + Kac\'s theorem',
    ['stationaryDistribution(cloudy-town)', 'kacReturnTime(cloudy-town,0)'],
    ans(formatVector(stationaryDistribution(CHAINS['cloudy-town'].P)), 'ff-cloudy-stationary-and-kac', '1/5,2/5,2/5'),
    [
      "Solve piP=pi, sum(pi)=1 for the shares; Kac gives the sunny mean return time as the reciprocal of the sunny share (which is 5).",
      'The return time is large exactly because the sunny share is the smallest.',
    ],
    [
      'the start day changes the long-run share',
      'mean return time is the mean hitting time from a fixed other state',
      'return time = 1/pi for the whole chain',
      "rainy is the 'stuck' (absorbing) state",
    ],
    [
      'Both parts run through the stationary distribution — first solve piP=pi for the three shares.',
      "For part (b), Kac's theorem makes the mean return time to sunny the reciprocal of the sunny stationary share — no separate hitting-time solve.",
      'Compute the share vector, then invert the sunny component for (b), and explain that a rarer state has a longer return — derive both, state neither in advance.',
    ],
    {
      correctness: 'matches the exact stationary vector and the sunny mean return time',
      approach: 'one stationary solve feeds both the shares and (via Kac) the return time',
      rigor: 'links 1/pi to the share; exact rationals; notes no absorbing state => ergodic',
      communication: 'explains return time = reciprocal of share',
      speed: 'reuses pi for Kac instead of a second system',
    },
    [
      'Mean return time to a rainy day — bigger or smaller, and why?',
      'Does the answer change if it starts sunny? Why not?',
      'Is this chain reversible? Check detailed balance.',
    ],
  ),
  mkQ(
    'ff-oz-multistep-and-convergence', 'brutal',
    semFp('oz-multistep-convergence', 'land-of-oz', 'two-step-and-limit', 'rain-snow'),
    undefined,
    'Land of Oz weather (Rain, Nice, Snow): Rain->(1/2,1/4,1/4); Nice->(1/2,0,1/2); Snow->(1/4,1/4,1/2). (a) What is the probability it **snows exactly two days after a rainy day**? (b) Argue that as n->infinity **every row** of P^n approaches the **same** vector, and give that vector. Tie part (a)\'s machinery to part (b)\'s limit.',
    'WEB Land of Oz Grinstead & Snell Ch.11 Table 11.1; UC Davis dis6',
    ["matrixPower(land-of-oz,2)[0][2]", 'stationaryDistribution(land-of-oz)'],
    ans(formatRational(matrixPower(CHAINS['land-of-oz'].P, 2)[0][2]), 'ff-oz-multistep-and-convergence', '3/8'),
    [
      'Part (a): the (Rain,Snow) entry of P^2 — sum over the in-between day. Part (b): the chain is regular (a power is all-positive), so P^n -> 1*pi^T; find pi from piP=pi (it is 2/5,1/5,2/5).',
      'Chapman-Kolmogorov for the 2-step; the regular-chain convergence theorem for the limit.',
    ],
    [
      "the 2-step prob is one path's product (forget to sum the middle day)",
      'rows of P^n converge to different vectors depending on the start',
      'raise the entry instead of the matrix',
      'a periodic chain would also converge (this one is aperiodic — that matters)',
    ],
    [
      'Part (a) is one entry of the squared matrix; part (b) is what powers of P settle to — keep them separate but note both live in P^n.',
      'For (a) sum over the intermediate day (Chapman-Kolmogorov); for (b) check the chain is regular (a power is strictly positive), which forces every row of P^n to the same stationary vector.',
      'Read the (Rain,Snow) entry of P^2 and reduce, then solve piP=pi for the common limit row — derive each; the limit row is the stationary distribution, not a guess.',
    ],
    {
      correctness: 'matches the exact 2-step entry and the limit vector',
      approach: 'Chapman-Kolmogorov for (a), regular-chain limit for (b)',
      rigor: 'justifies row-convergence via regularity/aperiodicity; exact rationals',
      communication: "connects 'forgetting the start' to the common limit row",
      speed: 'one entry plus one stationary solve',
    },
    [
      'At what n is the row essentially converged? Compute P^3, P^4 and compare.',
      'Why does aperiodicity matter for (b)?',
      'Mean return time to a snowy day?',
    ],
  ),
  mkQ(
    'ff-absorb-prob-and-time', 'harder',
    semFp('absorb-prob-and-time', 'gambler-0to3-up2_3', 'prob-and-duration', 'start-1'),
    undefined,
    "A trader's bankroll is $1 (between a $0 wipeout and a $3 cash-out); each round +$1 w.p. 2/3, -$1 w.p. 1/3 (they have an edge). Starting at $1, compute BOTH (a) the probability they cash out at $3 before being wiped out, AND (b) the expected number of rounds until the game ends. Show the **same** fundamental matrix yields both, and point to the **single** structural difference between the two computations.",
    'GB §5.1 p.54-55 (gambler\'s ruin 4/7)',
    [
      'absorptionProbabilities(gambler-0to3-up2_3,[0,3]) -> [start $1][target $3]',
      'expectedAbsorptionTime(gambler-0to3-up2_3,[0,3]) -> start $1',
    ],
    ans(formatRational(absorptionAt('gambler-0to3-up2_3', 1, 3)), 'ff-absorb-prob-and-time', '4/7'),
    [
      'Both come from N=(I-Q)^-1: B=NR (split, no +1) gives the cash-out probability; (I-Q)t=1 (the +1) gives the duration (which is 15/7).',
      'First-step: a_1 = 1/3 a_0 + 2/3 a_2 (a_0=0, a_3=1) for (a); t_1 = 1 + 1/3 t_0 + 2/3 t_2 (t_0=t_3=0) for (b).',
    ],
    [
      'reach probability and expected duration are the same object',
      'the edge (up 2/3) breaks the formula',
      'drop the +1 in the duration',
      "the start doesn't change the cash-out probability",
    ],
    [
      'Both parts are first-step analysis on the same transient block — set up the interior equations once, then ask two different questions.',
      'For the probability, the boundaries are one (cash out) and zero (wiped out) with **no** +1; for the time, the boundaries are zero at both ends **with** a +1 on every round.',
      'Solve both small systems from $1 and reduce; the only structural difference is the +1 (present for time, absent for probability) — keep the edge probabilities 2/3 and 1/3 exact.',
    ],
    {
      correctness: 'matches the exact cash-out probability and the exact expected duration',
      approach: 'derives both from one fundamental matrix with correct boundaries',
      rigor: 'keeps reach distinct from duration; handles the 2/3-1/3 bias exactly',
      communication: 'names the +1 as the sole structural difference',
      speed: 'reuses the interior block for both questions',
    },
    [
      'Recompute both from $2 instead of $1.',
      'Make it a fair coin — how do both answers change?',
      'What is the probability of being wiped out, and why does it complete the split?',
    ],
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
  if (hintRungLeaks(a, q.hidden.hintLadder[1]))
    leakViolations.push(`${q.id}: hint rung 2 leaks "${a}"`)
  if (hintRungLeaks(a, q.hidden.hintLadder[2]))
    leakViolations.push(`${q.id}: hint rung 3 leaks "${a}"`)
}
if (leakViolations.length > 0)
  throw new Error(
    `[NO-LEAK GUARD] ${leakViolations.length} rung(s) leak the answer (rungs 2 & 3 must be METHOD-ONLY):\n  - ${leakViolations.join('\n  - ')}`,
  )
console.log(
  `✓ NO-LEAK guard passed: rungs 2 & 3 are method-only for all ${questions.length} questions`,
)

// ── Final assertions ───────────────────────────────────────────────────────────
if (questions.length < 50) throw new Error(`Too few questions: ${questions.length}`)
questions.forEach((q) => {
  if (!q.engineCheck.verified) throw new Error(`engineCheck.verified not true for ${q.id}`)
  if (!q.source || !q.prompt || !q.hidden.answer) throw new Error(`Empty required field for ${q.id}`)
  if (q.hidden.hintLadder.length !== 3) throw new Error(`hintLadder not 3 rungs for ${q.id}`)
  const r = q.hidden.rubric
  if (!r.correctness || !r.approach || !r.rigor || !r.communication || !r.speed)
    throw new Error(`Missing rubric axis for ${q.id}`)
  if (q.followUps.length < 1) throw new Error(`No followUps for ${q.id}`)
  if (!['hard', 'harder', 'brutal'].includes(q.tier)) throw new Error(`Invalid tier for ${q.id}`)
})
const fps = questions.map((q) => q.fingerprint)
if (new Set(fps).size !== fps.length)
  throw new Error(
    `Duplicate fingerprints: ${fps.filter((f, i) => fps.indexOf(f) !== i).join(', ')}`,
  )

const byTier = { hard: 0, harder: 0, brutal: 0 }
questions.forEach((q) => {
  byTier[q.tier]++
})
const templated = questions.filter((q) => q.template).length
const freeForm = questions.filter((q) => !q.template).length

console.log(`  questions.length = ${questions.length}`)
console.log(`  byTier           = ${JSON.stringify(byTier)}`)
console.log(`  templated        = ${templated}, freeForm = ${freeForm}`)
console.log(`  ALL ${questions.length} QUESTIONS ENGINE-VERIFIED`)

// ── Prompt strings ─────────────────────────────────────────────────────────────

const interviewerPrompt = `ROLE
You are a senior quantitative-research interviewer at a top trading desk (Jane Street / Citadel / IMC), a specialist in Markov chains and stochastic processes, running a live mock interview on MARKOV CHAINS. Be professional, probing, and fair-but-pressured: warm enough that the candidate keeps thinking aloud, sharp enough that sloppy reasoning gets caught. You are interviewing one candidate, right now, on the single question below.

THE QUESTION (injected at runtime)
- Prompt: {{prompt}}
- Tier: {{tier}}  (hard | harder | brutal — calibrate your pressure and follow-up depth to the tier)
- Source: {{source}}  (your context only; never read it aloud)

PROTOCOL
1. Ask the question once, faithfully from {{prompt}}, then stop and let the candidate drive. ONE question at a time — never stack asks or surface the follow-ups early.
2. Make them build the MODEL first. Before any arithmetic, push: "What are the states? Is there a state the chain can never leave — so is this absorbing or ergodic? Now write the structure: the transition rows, and the recurrence or balance equation you will actually solve." Reward an explicit setup; flag a candidate who jumps straight to numbers.
3. Probe, don't solve. Ask Socratic questions that test whether they have seen the edge this problem turns on (see EDGE CASES). Do NOT do the derivation for them and do NOT hand over the structure unless they are stuck.
4. Release hints only when genuinely stuck or explicitly asked (see HINTS).
5. After they COMMIT to a final answer, work the follow-up chain (see FOLLOW-UPS).
6. Then close (see SCORING).

EDGE CASES TO PROBE (the Markov traps that separate strong candidates — press the ones this question actually hinges on)
- Absorbing vs ergodic is the master fork: FIRST ask whether any state can never be left. A chain that mixes forever (Ehrenfest urn, weather) has NO absorbing state — ask the long-run share (piP=pi, or Kac's mean return time 1/pi_i), NEVER "when/where is it absorbed." A chain with walls (gambler's ruin, drunkard's walk) IS absorbing — ask which wall (absorption probability) and how long (expected hitting time). Picking the wrong branch is the most common failure.
- Reach probability != expected duration: absorption probability (I-Q)^-1 R is a split with NO +1 (=> i/N for a fair walk); expected hitting time solves (I-Q)t=1, the +1 per step (=> i(N-i)). Candidates conflate them constantly — make them say which object the question asks for.
- Stationary != convergence under periodicity: piP=pi needs only irreducibility, but P^n -> pi needs aperiodicity. The Ehrenfest urn has period 2, so its long-run time-fraction (1/4,1/2,1/4) is answerable while the step-n distribution OSCILLATES and never converges. Do not let "stationary" be conflated with "the distribution at step n settles."
- The start changes the absorption split: a symmetric walk is one-half / one-half per STEP, not one-half to win. From $1 of a $0-to-$4 game, P(reach $4) = 1/4, not 1/2. Press anyone who says "fifty-fifty from anywhere."
- A biased coin breaks the clean fair forms: fair reach = i/N and duration = i(N-i); biased reach = (1 - r^i)/(1 - r^N) with r = q/p (e.g. gambler's ruin from $1, up 2/3 => 4/7). Check they switch forms the moment the chain is asymmetric.
- PageRank != most-in-links: rank is the random surfer's stationary distribution, and damping handles dangling/disconnected pages; on a symmetric cycle every page ties at 1/n regardless of d. Reject "the page with the most in-links wins."
- Event mis-mapping (dice / coin chains): name the absorbing state BEFORE computing — 7/13 = P(a single 12 first), 6/13 = P(two consecutive 7s first). Make them label the target state precisely.
- Detailed balance is a shortcut, not the definition: pi_i p_ij = pi_j p_ji (reversibility) is a fast route to pi for birth-death chains, but not every stationary chain is reversible. Reward using it as a shortcut; flag treating it as the meaning of stationary.

HINTS — escalating, ONLY when stuck
Use {{hidden.hintLadder}} = [nudge, stronger, near-reveal]. Release ONE rung at a time, in order, and only after a visible stuck-signal (a long silence, a wrong turn they cannot recover, or an explicit request). Start at the nudge. Never skip ahead, never give two rungs at once, never go past near-reveal. The near-reveal points at the METHOD only — it must NOT state the final number, vector, or fraction.

NO-ANSWER-LEAK (critical)
Before the candidate commits, NEVER state, approximate, confirm, deny, or "narrow down" the final answer, and NEVER reveal {{hidden.answer}}. Do not paste or paraphrase any part of the hidden record ({{hidden.answer}}, {{hidden.approaches}}, {{hidden.wrongTurns}}, {{hidden.hintLadder}}, {{hidden.rubric}}). Hints come only from the ladder, one rung at a time, as above. If asked "is that right?" mid-solve, redirect ("walk me through why you think so") rather than confirm.

GROUNDING (critical)
Treat {{hidden.answer}} and {{hidden.approaches}} as GROUND TRUTH — they were verified by this concept's exact-rational engine (src/engine/markov.ts), which solves every system over the rationals Q via solveLinearSystem (no floats on any graded path). Every Markov answer is a clean integer, a fraction n/d, or a comma-joined rational vector (e.g. 1/5,2/5,2/5). Do NOT re-derive the math yourself and do NOT "correct" the ground truth even if your own mental arithmetic disagrees — if there is a conflict, you are the one who is wrong. Accept ANY mathematically-equivalent exact form: an equal but unreduced fraction (e.g. 2/4 = 1/2), the clean decimal of an exact rational (e.g. 0.25 = 1/4), a vector written in an equivalent stated ordering (as long as the candidate makes the state labels explicit), or an equivalent unevaluated expression (e.g. (I-Q)^-1 R written out, or 1/pi_i left symbolic). Reject only forms that are genuinely not equal, or a float that merely rounds an exact rational the candidate never actually pinned down. Use {{hidden.wrongTurns}} to RECOGNIZE a misconception, not to lead the candidate into it. Grade ONLY against the rubric.

FOLLOW-UPS — after they commit
Once a final answer is locked, ask {{followUps}} in order, one at a time (typical chain: bias the chain, generalize to n states, ask about periodicity / convergence, or ask for the mean return time too). Let each be its own mini-exchange, with the no-leak and hint rules still in force.

SCORING — close the interview
Give structured feedback, then a numeric score against {{hidden.rubric}}. Rate each axis 1-5 with one line of justification: correctness, approach, rigor, communication, speed. Then give an overall 1-5 (a hire-signal read, not a raw average). Tie every judgment to the rubric's stated bar and cite the specific moment that earned or cost points. Be candid and specific — fair-but-pressured to the end.

INJECTION NOTE
At runtime the live feature replaces every {{...}} placeholder above with the drawn question's fields ({{prompt}}, {{tier}}, {{source}}, {{hidden.*}}, {{followUps}}); treat the filled-in values as the entire ground truth for this interview.`

const generatorPrompt = `ROLE
You generate ONE fresh, hard, real-quant-style MARKOV-CHAIN interview question on demand, to top up a pre-built pool without ever repeating one a student has seen. Every question you emit must be (a) a realistic quant-interview question anchored to this concept's Green-Book / web topics, (b) engine-verifiable before it is served, and (c) structurally new versus an avoid-list. If you cannot satisfy all three, you REFUSE (see SELF-REJECTION). Output is a single JSON object and nothing else.

SCOPE — only these Markov-chain topics (anchor each honestly; GB = Green Book, WEB = web-sourced)
- Stationary distribution piP=pi (long-run share) and Kac's mean return time 1/pi_i — WEB (absent from the Green Book).
- Multi-step transitions via P^n / Chapman-Kolmogorov — GB path-probability p(i,j)*p(j,k)*... (p.53) PLUS WEB for the exact P^n entry.
- State classification: recurrent / transient / absorbing / communicating — GB p.54-55; the PERIODICITY sub-part is WEB (absent from GB).
- Absorption probability and expected hitting / absorption time, including gambler's ruin and the drunkard's walk — GB section 5.1-5.2 (p.54-62).
- Detailed balance / reversibility (birth-death, Ehrenfest urn) — WEB (absent from GB).
- PageRank — the random surfer with damping d — WEB (absent from GB).

REAL-QUANT-STYLE (mandatory, hard fence — ADR-0005)
Model every question on the actual quant-interview canon: gambler's ruin, the weather / Land-of-Oz stationary chain, dice and coin absorption races (a single 12 vs two consecutive 7s; HHH vs THH), the Ehrenfest urn (reversibility / detailed balance), and PageRank. It must read like something genuinely asked on a Jane Street / Citadel / IMC desk. NEVER invent an arbitrary chain puzzle that merely happens to be engine-solvable — real-quant-style grounding is not optional.

PREFER TEMPLATES (first choice); free-form only as a fallback
First, try to PARAMETERIZE an engine-backed template (set template.id + template.params), since templates are inherently verifiable. The eight forms and the engine function each maps to:
- tmpl-stationary          -> stationaryDistribution(P)              (weather / cloudy-town chain; long-run share)
- tmpl-multistep           -> matrixPower(P, n), then read the (i,j) entry or a row   (Chapman-Kolmogorov)
- tmpl-absorption          -> absorptionProbabilities(P, absorbing)  (dice 12-vs-7s, coin HHH/THH, reach-a-wall)
- tmpl-expected-absorption -> expectedAbsorptionTime(P, absorbing)   (drunkard i(N-i), E[THH])
- tmpl-gamblers-ruin       -> absorptionProbabilities AND expectedAbsorptionTime on a 1-D walk   (reach prob AND duration; fair + biased)
- tmpl-detailed-balance    -> detailedBalance(P) / isReversible(P, pi)   (Ehrenfest / birth-death => stationary)
- tmpl-kac-return          -> kacReturnTime(P, i)    (= 1/pi_i)
- tmpl-pagerank            -> pagerank(linkGraph, damping)   (random surfer; row-stochastic out-link graph; left stationary of the Google matrix)
Emit a free-form question ONLY if no template fits — and it STILL must pass engine verification below, with fingerprint "sem:<hash>".

ENGINE-VERIFY-BEFORE-SERVE (second hard fence — ADR-0005)
Your output MUST carry the exact data to reproduce the answer with src/engine/markov.ts, so the live feature can RUN the engine and REJECT / regenerate anything it cannot verify. In engineCheck put: module = "src/engine/markov.ts"; calls = the exact function call(s) with concrete args (transition rows as small-denominator rationals); answer = the exact value the engine returns. The engine is EXACT-RATIONAL (solveLinearSystem over Q). Documented functions, signatures, and ranges:
- buildChain(P, labels) -> validates P is square and EVERY row sums to exactly 1 (use to assert a well-formed stochastic chain before any other call).
- stationaryDistribution(P) -> Rational[] solving piP=pi with sum(pi)=1. Requires an irreducible chain.
- matrixPower(P, n) -> Rational[][], the exact P^n; the graded answer is the asked (i,j) entry or a row.
- absorptionProbabilities(P, absorbing: number[]) -> Rational[][] = (I-Q)^-1 R; row = transient start state, column = absorbing target. The graded answer is the asked entry (or the column vector).
- expectedAbsorptionTime(P, absorbing: number[]) -> Rational[] solving (I-Q)t=1; one entry per transient state.
- classifyStates(P) -> per state {class, kind: recurrent | transient | absorbing, period}.
- detailedBalance(P) -> {reversible: boolean, pi: Rational[]};  isReversible(P, pi) -> boolean.
- kacReturnTime(P, i) -> Rational = 1/pi_i.
- pagerank(linkGraph, damping: Rational) -> Rational[], the stationary of G = d*M + (1-d)/n * J (M is the row-stochastic out-link matrix; all-zero dangling rows are replaced with a uniform row).
- Output format: answers print via formatRational / formatVector — an integer, a fraction n/d, or a comma-joined vector in the chain's state order (e.g. 1/5,2/5,2/5).
HARD RANGE RULE: every graded answer must be an exact rational, an integer, or a vector of them. Keep all transition probabilities small-denominator rationals and the chain small (<= ~12 states) so the exact-rational solve stays representable. NEVER emit a decimal approximation or an irrational. The standard damped PageRank decimals (e.g. d = 0.85 giving roughly .387/.214/.399) are NOT clean rationals — only emit a PageRank answer the engine reproduces exactly (e.g. the symmetric cycle 1/3,1/3,1/3 for any rational d, or the d = 1 four-node 4/13,5/13,1/13,3/13). If the natural answer would be irrational or out of range, switch to a parameterization whose answer is an exact rational, or REFUSE.

AVOID-LIST / NO-OVERLAP
You are given avoidList: an array of fingerprints (the student's seen-set union the global pool). Your question's fingerprint MUST NOT be in avoidList. Fingerprint = "<templateId>:<normalized-params>" for a template (sort params into a canonical order so trivial re-parameterizations collide), or "sem:<hash>" for free-form (hash the structural semantics — states, transition probabilities, and what is asked — not the wording, so reworded duplicates collide). If your first candidate's fingerprint is in avoidList, change the structure or parameters until it is new, or REFUSE.

OUTPUT SCHEMA (emit EXACTLY this one JSON object — no prose, no code fences; the comments below are explanatory only)
{
  "tier": "hard | harder | brutal",
  "fingerprint": "<templateId>:<normalized-params>  |  sem:<hash>",
  "template": { "id": "<templateId>", "params": { } },
  "prompt": "the question text shown to the candidate",
  "source": "Green Book p.<n> section 5.x  |  <web / real quant-interview source> (mark GB-anchored or WEB-anchored)",
  "engineCheck": {
    "module": "src/engine/markov.ts",
    "calls": [ "exact call(s) with concrete rational args, e.g. stationaryDistribution([[0,1/2,1/2],[1/4,1/2,1/4],[1/4,1/4,1/2]])" ],
    "answer": "<exact value the engine returns, e.g. 1/5,2/5,2/5>"
  },
  "hidden": {
    "answer": "<exact answer; identical value to engineCheck.answer>",
    "approaches": [ "accepted solution path 1", "alternate accepted path 2" ],
    "wrongTurns": [ "common misconception 1", "common misconception 2" ],
    "hintLadder": [ "nudge", "stronger", "near-reveal" ],
    "rubric": {
      "correctness": "what a correct answer must contain",
      "approach": "what a strong method looks like (e.g. classify absorbing-vs-ergodic FIRST, then pick the formula)",
      "rigor": "states the irreducibility / aperiodicity assumptions; keeps exact rationals; names the absorbing target before computing",
      "communication": "clarity of the think-aloud",
      "speed": "the pace bar for this tier"
    }
  },
  "followUps": [ "first follow-up (e.g. bias the chain / generalize to n states)", "second follow-up" ]
}

FIELD RULES
- tier: tag honestly; the floor is "hard" (always harder than any lesson's mastery challenge). "harder" / "brutal" add cross-topic synthesis or nastier parameters.
- hintLadder: EXACTLY 3 rungs, escalating nudge -> stronger -> near-reveal. The near-reveal points at the METHOD / structure ONLY — it must NOT state the final number, vector, or fraction.
- hidden.answer MUST equal engineCheck.answer exactly (the verified rational or vector, in the engine's state order).
- followUps: a real chain (>=1, ideally 2-3): bias the chain, generalize to n states, ask periodicity / convergence, or ask the mean return time too.
- source: anchor to the Green-Book section the topic comes from (GB section 5.1-5.2 for path-probability, classification, absorption, hitting time, gambler's ruin), or a web / real quant-interview source for the WEB-only topics (stationary, convergence, reversibility, periodicity, PageRank) — and say which.

SELF-REJECTION (never serve an unverifiable or off-fence question)
If you cannot produce a question that is simultaneously (a) real-quant-style + GB / web-anchored, (b) engine-verifiable within the exact-rational range, and (c) structurally new vs avoidList — do NOT emit a question. Instead output exactly:
{ "refusal": true, "reason": "<one line: which fence failed — not-anchored | not-engine-verifiable | out-of-range/irrational | no-new-fingerprint>" }
An honest refusal beats an unverifiable or repeated question.`

// ── Assemble and write ─────────────────────────────────────────────────────────

const pack = {
  version: 1 as const,
  kind: 'interview-pack' as const,
  courseId: 'course-markov-chains',
  concept: 'Markov Chains',
  greenBookAnchor:
    'Xinfeng Zhou, A Practical Guide to Quantitative Finance Interviews — §5.1 Markov Chain (p.53-57): Markov property, transition matrix, path probability, state classification, and first-step analysis for absorption probability and expected absorption time (gambler\'s ruin 4/7; dice single-12 vs two consecutive-7s 7/13 & 6/13; coin HHH-before-THH 1/8, E[THH]=8); §5.2 Martingale and Random Walk (p.58-62): symmetric random walk / drunk-man bridge (17/100, 1411) and E[n heads]=2^(n+1)-2. Stationary distribution, convergence, reversibility/detailed balance, periodicity, and PageRank are WEB-anchored (confirmed absent from the Green Book; see concepts/markov-chains/source-pack.md §3 and §5).',
  engineModule: MARKOV_MODULE,
  generator: 'interviews/_build/build-markov-chains-pack.ts',
  note:
    'Dormant capstone asset: committed but NOT seeded or deployed (the seed glob matches only lesson-*/course-* fixtures, not interviews/). Every answer is reproduced by the exact-rational engine src/engine/markov.ts (solveLinearSystem over the rationals; no floats on any graded path).',
  counts: { total: questions.length, byTier, templated, freeForm },
  interviewerPrompt,
  generatorPrompt,
  templates: TEMPLATES,
  questions,
}

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
mkdirSync(outDir, { recursive: true })
const outPath = resolve(outDir, 'course-markov-chains.json')
writeFileSync(outPath, JSON.stringify(pack, null, 2) + '\n', 'utf8')
console.log(`\nWrote ${outPath}`)
