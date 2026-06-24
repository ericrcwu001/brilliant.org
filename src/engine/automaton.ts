// Pure, dependency-free KMP-style automaton engine.
//
// `buildAutomaton(pattern, p)` returns the single typed object that powers the
// state graph, simulation transitions, equation-tile targets, expected-time
// solve, guided substitution, and overlap reveal. See docs/mvp_prd.md
// ("Core Interaction Model" and "Data Contracts Appendix").
//
// The implementation is general for any H/T pattern; the MVP UI only exposes a
// curated set (HH, HT, THH, HTH). Golden tests pin p = 0.5 results.

import type {
  Automaton,
  AutomatonState,
  CanonicalRecurrence,
  Rational,
  StateId,
  SubstitutionStep,
  Transition,
} from './types'

const SYMBOLS = ['H', 'T'] as const
type Symbol = (typeof SYMBOLS)[number]

// --- Rational arithmetic (exact, keeps p = 0.5 results integral) ---

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a || 1
}

// Exact rational toolkit. Exported (build-brief §4.1) so the new pure engines
// (race.ts, walk.ts, correlation.ts) construct and operate on the same Rational
// representation as buildAutomaton — one exact-math source of truth, no drift.
export function reduce(n: number, d: number): Rational {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d)
  return { n: n / g, d: d / g }
}

export function toRational(x: number): Rational {
  if (Number.isInteger(x)) return { n: x, d: 1 }
  const denom = 1_000_000_000
  return reduce(Math.round(x * denom), denom)
}

export const ratAdd = (a: Rational, b: Rational) =>
  reduce(a.n * b.d + b.n * a.d, a.d * b.d)
export const ratSub = (a: Rational, b: Rational) =>
  reduce(a.n * b.d - b.n * a.d, a.d * b.d)
export const ratMul = (a: Rational, b: Rational) => reduce(a.n * b.n, a.d * b.d)
export const ratDiv = (a: Rational, b: Rational) => reduce(a.n * b.d, a.d * b.n)
export const ratNum = (a: Rational) => a.n / a.d

// --- KMP transition table ---

export function prefixFunction(pattern: string): number[] {
  const pi = new Array<number>(pattern.length).fill(0)
  for (let i = 1; i < pattern.length; i++) {
    let k = pi[i - 1]
    while (k > 0 && pattern[i] !== pattern[k]) k = pi[k - 1]
    if (pattern[i] === pattern[k]) k++
    pi[i] = k
  }
  return pi
}

// Longest matched-prefix length after observing symbol `c` from `state`.
function nextState(
  pattern: string,
  pi: number[],
  state: number,
  c: Symbol,
): number {
  let k = state
  while (true) {
    if (c === pattern[k]) return k + 1
    if (k === 0) return 0
    k = pi[k - 1]
  }
}

function classifyKind(from: number, to: number): Transition['kind'] {
  if (to === from + 1) return 'advance'
  if (to === from) return 'self-loop'
  return 'reset' // to < from
}

const stateId = (i: number): StateId => `E${i}`

function ratStr(r: Rational): string {
  return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`
}

function recurrenceToString(rec: CanonicalRecurrence): string {
  const parts: string[] = []
  if (rec.terms.length === 0 || rec.constant !== 0) {
    parts.push(String(rec.constant))
  }
  for (const term of rec.terms) {
    parts.push(`${ratStr(term.coeff)} ${term.var}`)
  }
  return `${rec.lhs} = ${parts.join(' + ')}`
}

// Solve A x = b over the rationals via Gauss-Jordan elimination. Exported
// (build-brief §4.1) for walk.ts (handles the r = q/p = 1 fair-coin case).
export function solveLinearSystem(a: Rational[][], b: Rational[]): Rational[] {
  const m = b.length
  const aug = a.map((row, i) => [...row, b[i]])

  for (let col = 0; col < m; col++) {
    let pivot = col
    while (pivot < m && aug[pivot][col].n === 0) pivot++
    if (pivot === m) continue
    ;[aug[col], aug[pivot]] = [aug[pivot], aug[col]]

    const pivotVal = aug[col][col]
    for (let j = col; j <= m; j++) aug[col][j] = ratDiv(aug[col][j], pivotVal)

    for (let r = 0; r < m; r++) {
      if (r === col) continue
      const factor = aug[r][col]
      if (factor.n === 0) continue
      for (let j = col; j <= m; j++) {
        aug[r][j] = ratSub(aug[r][j], ratMul(factor, aug[col][j]))
      }
    }
  }

  return aug.map((row) => row[m])
}

export function buildAutomaton(pattern: string, p: number): Automaton {
  if (!/^[HT]+$/.test(pattern)) {
    throw new Error(`Invalid pattern "${pattern}": expected non-empty H/T string`)
  }

  const L = pattern.length
  const pi = prefixFunction(pattern)
  const prob: Record<Symbol, Rational> = {
    H: toRational(p),
    T: toRational(1 - p),
  }

  // States E0..EL; EL is the absorbing match state.
  const states: AutomatonState[] = []
  for (let i = 0; i <= L; i++) {
    states.push({
      id: stateId(i),
      label: i === 0 ? '∅' : pattern.slice(0, i),
      absorbing: i === L,
    })
  }

  // Transitions out of every non-absorbing state.
  const transitions: Transition[] = []
  for (let i = 0; i < L; i++) {
    for (const c of SYMBOLS) {
      const to = nextState(pattern, pi, i, c)
      transitions.push({
        from: stateId(i),
        on: c,
        to: stateId(to),
        kind: classifyKind(i, to),
      })
    }
  }

  // Canonical recurrences (tile-check targets), one per state.
  const recurrences: Record<StateId, CanonicalRecurrence> = {}
  for (let i = 0; i <= L; i++) {
    if (i === L) {
      recurrences[stateId(i)] = { lhs: stateId(i), constant: 0, terms: [] }
      continue
    }
    const terms = SYMBOLS.map((c) => ({
      coeff: prob[c],
      var: stateId(nextState(pattern, pi, i, c)),
    }))
    recurrences[stateId(i)] = { lhs: stateId(i), constant: 1, terms }
  }

  // Expected hitting times: E_i = 1 + sum_c P(c) E_{next(i,c)}, E_L = 0.
  const aMat: Rational[][] = []
  const bVec: Rational[] = []
  for (let i = 0; i < L; i++) {
    const row = new Array<Rational>(L).fill({ n: 0, d: 1 })
    row[i] = ratAdd(row[i], { n: 1, d: 1 })
    for (const c of SYMBOLS) {
      const to = nextState(pattern, pi, i, c)
      if (to < L) row[to] = ratSub(row[to], prob[c])
    }
    aMat.push(row)
    bVec.push({ n: 1, d: 1 })
  }
  const solved = solveLinearSystem(aMat, bVec)
  const expectedTimes: Record<StateId, number> = {}
  for (let i = 0; i < L; i++) expectedTimes[stateId(i)] = ratNum(solved[i])
  expectedTimes[stateId(L)] = 0

  // Guided-solve replay: reveal solved values from the absorbing state down to
  // E0, so the final step lands on the answer the learner predicted.
  const substitutionSteps: SubstitutionStep[] = []
  for (let i = L; i >= 0; i--) {
    substitutionSteps.push({
      display: recurrenceToString(recurrences[stateId(i)]),
      substitute: stateId(i),
      resultValue: expectedTimes[stateId(i)],
    })
  }

  // Overlap reveal: the near-miss (non-advancing) edge out of each matched
  // prefix state. These are the edges that explain why overlap changes the
  // expected wait (reset to start vs. self-loop preserving progress).
  const overlapHighlights: Array<{ from: StateId; on: Symbol }> = []
  for (let i = 1; i < L; i++) {
    const advancing = pattern[i] as Symbol
    const failing: Symbol = advancing === 'H' ? 'T' : 'H'
    overlapHighlights.push({ from: stateId(i), on: failing })
  }

  return {
    pattern,
    p,
    states,
    transitions,
    recurrences,
    expectedTimes,
    substitutionSteps,
    overlapHighlights,
  }
}
