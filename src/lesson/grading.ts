// Pure, React-free grading helpers extracted from each graded beat component.
// Phase 1 of the answer-acceptance audit: extract correctness logic verbatim so
// it is independently testable. DO NOT change any comparison semantics here.
//
// Imports: engine (pure), equationDiagnosis (pure), beats/balanceModel (pure),
// engine/types + content/schema (types only). No React, no .tsx imports.

import { nCk, nPk, product, probabilityFromCounts, unionSize, inclusionExclusion } from '../engine/combinatorics'
import { nextStateOf } from '../engine/simulate'
import { bayesPosterior } from '../engine/bayes'
import {
  classifyStates,
  absorptionProbabilities,
  stationaryDistribution,
  detailedBalance,
  pagerank,
  formatRational,
  formatVector,
} from '../engine/markov'
import { reduce, ratAdd, ratMul } from '../engine/automaton'
import { diagnoseRow } from './equationDiagnosis'
import { balanceModel } from './beats/balanceModel'
import type { Automaton, StateId, Rational } from '../engine/types'
import {
  covariance as covFn,
  variance as varFn,
  corrRange as corrRangeFn,
  rhoSquared as rhoSqFn,
  formatRational as formatRationalCov,
  formatRangePair,
} from '../engine/covariance'
import type { JointCell as CovJointCell } from '../engine/covariance'

// Re-export diagnoseRow so the beat can keep its current import path via grading.ts
// if desired, but components may also import it directly from equationDiagnosis.
export { diagnoseRow }

// ─── 1. Shared normalizer (answerEntry + masteryChallenge + selectionGrid) ─────
//
// Intentionally kept as ONE export so AnswerEntryBeat, MasteryChallengeBeat, and
// SelectionGridBeat all share a single definition.
export const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '')

// ─── 2. answerEntry / masteryChallenge ─────────────────────────────────────────

export type AcceptField = { id: string; accept: string[] }

/** True iff every field's value is in its normalized accept list. */
export function gradeAcceptFields(
  fields: AcceptField[],
  values: Record<string, string>,
): boolean {
  return fields.every((f) =>
    f.accept.map(norm).includes(norm(values[f.id] ?? '')),
  )
}

// ─── 3. selectionGrid ──────────────────────────────────────────────────────────

export type SelectionGridIx = {
  n: number
  k: number
  order: 'toggle' | 'on' | 'off'
  accept?: string[]
}

/** Compute the selection count string given orderedMode. Defaults to order !== 'off'. */
export function selectionGridCount(
  ix: SelectionGridIx,
  orderedMode?: boolean,
): string {
  const ordered = orderedMode ?? ix.order !== 'off'
  return (ordered ? nPk(ix.n, ix.k) : nCk(ix.n, ix.k)).toString()
}

/** True iff accept is present and non-empty. */
export function isSelectionGridGraded(ix: SelectionGridIx): boolean {
  return ix.accept !== undefined && ix.accept.length > 0
}

/** True iff the normalized count string is in the accept list. */
export function isSelectionGridCorrect(ix: SelectionGridIx, count: string): boolean {
  return ix.accept!.map(norm).includes(norm(count))
}

// ─── 4. countingTree ───────────────────────────────────────────────────────────

// Normalize for numeric comparison: strip commas, spaces, and leading zeros.
// INTENTIONALLY DIFFERENT from `norm` — do not unify.
export const normNum = (s: string): string => {
  const stripped = s.replace(/[,\s]/g, '')
  return stripped.replace(/^0+(\d)/, '$1') || stripped || '0'
}

export type CountingTreeIx = {
  levels: { label: string; options: number }[]
  accept?: string[]
}

/** Canonical total: product of all level option-counts. */
export function countingTreeAnswer(ix: CountingTreeIx): string {
  return product(ix.levels.map((l) => l.options)).toString()
}

/** True iff accept is defined. */
export function isCountingTreeGraded(ix: CountingTreeIx): boolean {
  return !!ix.accept
}

/** True iff the value matches any accept entry under normNum. */
export function isCountingTreeCorrect(ix: CountingTreeIx, value: string): boolean {
  return ix.accept!.some((a) => normNum(a) === normNum(value))
}

// ─── 5. vennCounter ────────────────────────────────────────────────────────────

export type VennCounterIx = {
  sets?: 2 | 3
  maxSize?: number
  initial?: { a?: number; b?: number; ab?: number }
  accept?: string[]
}

/** Canonical union from the initial values (defaults match VennCounterBeat). */
export function vennUnion(ix: VennCounterIx): bigint {
  const a = ix.initial?.a ?? 8
  const b = ix.initial?.b ?? 6
  const ab = ix.initial?.ab ?? 3
  if ((ix.sets ?? 2) === 3) {
    // c, ac, bc, abc3 default to 0 (initial only specifies a/b/ab)
    return inclusionExclusion([
      { size: a, sign: 1 },
      { size: b, sign: 1 },
      { size: 0, sign: 1 },
      { size: ab, sign: -1 },
      { size: 0, sign: -1 },
      { size: 0, sign: -1 },
      { size: 0, sign: 1 },
    ])
  }
  return unionSize(a, b, ab)
}

/** True iff accept is defined. */
export function isVennCounterGraded(ix: VennCounterIx): boolean {
  return !!ix.accept
}

/** STRICT: accept must contain exactly String(union). No normalization. */
export function isVennCounterCorrect(ix: VennCounterIx, union: bigint): boolean {
  return ix.accept!.some((acc) => acc === String(union))
}

// ─── 6. probabilityCounter ─────────────────────────────────────────────────────

export type ProbabilityCounterIx = {
  factors: { label: string; value: number }[]
  total: number
  accept?: string[]
}

/** Canonical answer "n/d" when all factors are selected; null if no factors. */
export function canonicalProbabilityAnswer(ix: ProbabilityCounterIx): string | null {
  const fav = product(ix.factors.map((f) => f.value))
  if (fav <= 0n) return null
  const reduced = probabilityFromCounts(Number(fav), ix.total)
  return `${reduced.n}/${reduced.d}`
}

/** True iff accept is defined. */
export function isProbabilityCounterGraded(ix: ProbabilityCounterIx): boolean {
  return !!ix.accept
}

/** STRICT: accept must contain exactly the "n/d" answer string. No normalization. */
export function isProbabilityCounterCorrect(
  ix: ProbabilityCounterIx,
  answer: string,
): boolean {
  return ix.accept!.some((a) => a === answer)
}

// ─── 7. stateTap ───────────────────────────────────────────────────────────────

export type StateTapIx = {
  transitions: { from: string; on: 'H' | 'T' }[]
}

/** Map from "from-on" key to the correct destination StateId for every transition. */
export function correctStateTapPicks(
  ix: StateTapIx,
  automaton: Automaton,
): Record<string, StateId> {
  const picks: Record<string, StateId> = {}
  for (const t of ix.transitions) {
    picks[`${t.from}-${t.on}`] = nextStateOf(automaton, t.from as StateId, t.on)
  }
  return picks
}

/** True iff every transition's pick equals the engine's next-state. */
export function isStateTapCorrect(
  ix: StateTapIx,
  automaton: Automaton,
  picks: Record<string, StateId | null>,
): boolean {
  return ix.transitions.every(
    (t) => picks[`${t.from}-${t.on}`] === nextStateOf(automaton, t.from as StateId, t.on),
  )
}

// ─── 8. overlap ────────────────────────────────────────────────────────────────

/** True iff the automaton's first overlapHighlight edge is NOT a reset (keeps progress). */
export function keepsProgress(a: Automaton): boolean {
  const h = a.overlapHighlights[0]
  if (!h) return false
  const t = a.transitions.find((e) => e.from === h.from && e.on === h.on)
  return !!t && t.kind !== 'reset'
}

/** The pattern string of the automaton in the list that keeps progress. */
export function correctOverlapPattern(automata: Automaton[]): string | undefined {
  return automata.find(keepsProgress)?.pattern
}

/** Graded only in Track A (density === 'split'). */
export function isOverlapGraded(density: string): boolean {
  return density === 'split'
}

/** True iff picked matches the pattern that keeps progress. */
export function isOverlapCorrect(automata: Automaton[], picked: string): boolean {
  return picked === correctOverlapPattern(automata)
}

// ─── 9. equationTiles ──────────────────────────────────────────────────────────

// Local helper — mirrors the component's private ratStr.
function ratStr(r: { n: number; d: number }): string {
  return r.d === 1 ? `${r.n}` : `${r.n}/${r.d}`
}

/**
 * One canonical slot-token array for a CanonicalRecurrence target.
 * Format: [const:<c>, prob:<p0>, var:<s0>, prob:<p1>, var:<s1>, ...].
 * diagnoseRow(correctFill(target), target).ok === true always.
 */
export function correctFill(target: {
  constant: number
  terms: { coeff: { n: number; d: number }; var: string }[]
}): string[] {
  const out: string[] = [`const:${target.constant}`]
  for (const term of target.terms) out.push(`prob:${ratStr(term.coeff)}`, `var:${term.var}`)
  return out
}

/** True iff the row has graded: true. */
export function isEquationRowGraded(row: { graded: boolean }): boolean {
  return row.graded
}

// ─── 10. bayesUpdate ───────────────────────────────────────────────────────────

type BayesUpdateIx = {
  display: 'bars' | 'tree' | 'sequence'
  priors?: { n: number; d: number }[]
  likelihoods?: { n: number; d: number }[]
  population?: number
}

type BayesUpdateBeat = {
  hero?: unknown
  interaction: BayesUpdateIx
}

/** Graded only when display === 'tree' AND no hero on the beat. */
export function isBayesUpdateGraded(beat: BayesUpdateBeat): boolean {
  return beat.interaction.display === 'tree' && !beat.hero
}

/** Number of focal icons: Math.round(posterior[0] * population). */
export function bayesFocalCount(beat: BayesUpdateBeat): number {
  const ix = beat.interaction
  const priors = ix.priors ?? [{ n: 1, d: 2 }, { n: 1, d: 2 }]
  const likelihoods = ix.likelihoods ?? [{ n: 1, d: 1 }, { n: 1, d: 2 }]
  const population = ix.population ?? 3
  const post = bayesPosterior(priors, likelihoods)
  return Math.round((post[0].n / post[0].d) * population)
}

/**
 * True iff exactly the first focalCount icon indices (0..focalCount-1) are
 * tapped — mirrors TreeSmallDisplay's check() exactly.
 */
export function isBayesUpdateCorrect(
  beat: BayesUpdateBeat,
  tapped: Set<number>,
): boolean {
  const focalCount = bayesFocalCount(beat)
  return (
    tapped.size === focalCount &&
    Array.from({ length: focalCount }, (_, i) => i).every((i) => tapped.has(i))
  )
}

// ─── 11. chainBoard ────────────────────────────────────────────────────────────
//
// These four helpers were previously exported from ChainBoardBeat.tsx.
// Components import them from here; re-exported from ChainBoardBeat.tsx for
// back-compat with any existing test imports.

/** Parse a typed "a/b" or integer "a" string → reduced Rational; null if invalid. */
export function parseFrac(s: string): Rational | null {
  const t = s.trim()
  const m = /^(-?\d+)\s*\/\s*(\d+)$/.exec(t)
  if (m) {
    const d = Number(m[2])
    return d === 0 ? null : reduce(Number(m[1]), d)
  }
  if (/^-?\d+$/.test(t)) return { n: Number(t), d: 1 }
  return null
}

/** argmax over a Rational array (exact cross-multiply, no floats). */
export function argmax(v: Rational[]): number {
  let best = 0
  for (let i = 1; i < v.length; i++) {
    if (v[i].n * v[best].d > v[best].n * v[i].d) best = i
  }
  return best
}

/**
 * Return probability of ever returning to `home` state.
 * Makes `home` absorbing, then sums P[home][j] * P(reach home | start j).
 */
export function returnProbability(
  P: Rational[][],
  home: number,
  walls: number[],
): Rational {
  const n = P.length
  const absorbing = [home, ...walls.filter((w) => w !== home)]
  const Pmod = P.map((row, i) =>
    i === home ? row.map((_, j) => ({ n: j === home ? 1 : 0, d: 1 })) : row,
  )
  const B = absorptionProbabilities(Pmod, absorbing)
  const transient = P.map((_, i) => i).filter((i) => !absorbing.includes(i))
  const rowOf = new Map(transient.map((s, idx) => [s, idx]))
  let f: Rational = { n: 0, d: 1 }
  for (let j = 0; j < n; j++) {
    if (P[home][j].n === 0) continue
    const g: Rational =
      j === home
        ? { n: 1, d: 1 }
        : absorbing.includes(j)
          ? { n: 0, d: 1 }
          : B[rowOf.get(j)!][0]
    f = ratAdd(f, ratMul(P[home][j], g))
  }
  return f
}

/** Classify a chain as 'oscillates' (period > 1) or 'converges'. */
export function periodicVerdict(P: Rational[][]): 'oscillates' | 'converges' {
  const cls = classifyStates(P)
  const recPeriod = (cls.find((c) => c.kind !== 'transient') ?? cls[0]).period
  return recPeriod > 1 ? 'oscillates' : 'converges'
}

// Rational equality by cross-multiplication (no reduction needed).
function eqRat(a: Rational, b: Rational): boolean {
  return a.n * b.d === b.n * a.d
}

type ChainMatrixRow = { cells: Rational[] }

type ChainBoardIx = {
  display: 'diagram' | 'matrix' | 'powers' | 'distribution' | 'stationary'
  matrix: ChainMatrixRow[]
  labels: string[]
  task?: string
  step?: number
  start?: number
  absorbing?: number[]
  cell?: { row: number; col: number }
  damping?: Rational
  headline?: string
}

type ChainBoardBeat = {
  hero?: unknown
  interaction: ChainBoardIx
}

/**
 * Tagged-union input type for isChainBoardCorrect / correctChainAnswerFor.
 * Each variant corresponds to one display+task grading path.
 */
export type ChainBoardInput =
  | { kind: 'text'; value: string }
  | { kind: 'bool'; value: boolean }
  | { kind: 'node'; index: number }
  | { kind: 'edge'; from: number; to: number }
  | { kind: 'cell'; row: number; col: number }
  | { kind: 'nodeClasses'; classes: Record<number, string> }
  | { kind: 'matrix'; cells: (Rational | null)[][] }
  | { kind: 'verdict'; value: 'oscillates' | 'converges' }

/** Graded iff beat has no hero. */
export function isChainBoardGraded(beat: { hero?: unknown }): boolean {
  return !beat.hero
}

/** Derive the canonical correct answer for the current beat display+task. */
export function correctChainAnswerFor(beat: ChainBoardBeat): ChainBoardInput {
  const ix = beat.interaction
  const P = ix.matrix.map((r) => r.cells)
  const defaultDamping: Rational = ix.damping ?? { n: 85, d: 100 }

  if (ix.display === 'diagram') {
    const { task, cell, absorbing: absorbingStates } = ix
    if (task === 'entry') {
      return { kind: 'edge', from: cell!.row, to: cell!.col }
    }
    if (task === 'classify') {
      const classes = classifyStates(P)
      const nodeClasses: Record<number, string> = {}
      for (const sc of classes) nodeClasses[sc.index] = sc.kind
      return { kind: 'nodeClasses', classes: nodeClasses }
    }
    if (task === 'pagerank') {
      return { kind: 'node', index: argmax(pagerank(P, defaultDamping)) }
    }
    // absorption
    const f = returnProbability(P, cell?.row ?? 0, absorbingStates ?? [])
    return { kind: 'text', value: formatRational(f) }
  }

  if (ix.display === 'matrix') {
    // build task — canonical answer is the full P matrix
    return { kind: 'matrix', cells: P as Rational[][] }
  }

  if (ix.display === 'powers') {
    if (ix.task === 'classify') {
      return { kind: 'verdict', value: periodicVerdict(P) }
    }
    return { kind: 'cell', row: ix.cell!.row, col: ix.cell!.col }
  }

  if (ix.display === 'distribution') {
    const stationary = stationaryDistribution(P)
    const cellRow = ix.cell?.row ?? 0
    return { kind: 'text', value: formatRational(stationary[cellRow]) }
  }

  // stationary display
  if (ix.task === 'pagerank') {
    return { kind: 'bool', value: ix.headline === 'unique' }
  }

  // balance
  const db = detailedBalance(P)
  const reversibleChoice = ix.headline === 'not-reversible' || ix.headline === 'reversible'
  const vectorMode = !reversibleChoice && !!ix.headline && ix.headline.includes(',')
  const col = ix.cell?.col ?? 0

  if (reversibleChoice) {
    return { kind: 'bool', value: db.reversible }
  }
  if (vectorMode) {
    return { kind: 'text', value: formatVector(db.pi) }
  }
  return { kind: 'text', value: formatRational(db.pi[col]) }
}

/** Grade a chainBoard beat against the learner's wrapped input. */
export function isChainBoardCorrect(
  beat: ChainBoardBeat,
  input: ChainBoardInput,
): boolean {
  if (beat.hero) return false
  const ix = beat.interaction
  const P = ix.matrix.map((r) => r.cells)
  const defaultDamping: Rational = ix.damping ?? { n: 85, d: 100 }

  if (ix.display === 'diagram') {
    const { task, cell, absorbing: absorbingStates } = ix
    if (task === 'entry' && input.kind === 'edge') {
      return input.from === cell!.row && input.to === cell!.col
    }
    if (task === 'classify' && input.kind === 'nodeClasses') {
      const classes = classifyStates(P)
      return classes.every((sc) => input.classes[sc.index] === sc.kind)
    }
    if (task === 'pagerank' && input.kind === 'node') {
      return input.index === argmax(pagerank(P, defaultDamping))
    }
    if (task === 'absorption' && input.kind === 'text') {
      const f = returnProbability(P, cell?.row ?? 0, absorbingStates ?? [])
      return norm(input.value) === norm(formatRational(f))
    }
    return false
  }

  if (ix.display === 'matrix' && ix.task === 'build' && input.kind === 'matrix') {
    return input.cells.every((row, i) =>
      row.every((c, j) => c !== null && eqRat(c, P[i][j])),
    )
  }

  if (ix.display === 'powers') {
    if (ix.task === 'classify' && input.kind === 'verdict') {
      return input.value === periodicVerdict(P)
    }
    if (input.kind === 'cell' && ix.cell) {
      return input.row === ix.cell.row && input.col === ix.cell.col
    }
    return false
  }

  if (ix.display === 'distribution' && input.kind === 'text') {
    const stationary = stationaryDistribution(P)
    const cellRow = ix.cell?.row ?? 0
    return norm(input.value) === norm(formatRational(stationary[cellRow]))
  }

  // stationary display
  if (ix.task === 'pagerank' && input.kind === 'bool') {
    return input.value === (ix.headline === 'unique')
  }

  // balance
  const db = detailedBalance(P)
  const reversibleChoice = ix.headline === 'not-reversible' || ix.headline === 'reversible'
  const vectorMode = !reversibleChoice && !!ix.headline && ix.headline.includes(',')
  const col = ix.cell?.col ?? 0

  if (reversibleChoice && input.kind === 'bool') {
    return input.value === db.reversible
  }
  if (vectorMode && input.kind === 'text') {
    return norm(input.value) === norm(formatVector(db.pi))
  }
  if (!reversibleChoice && input.kind === 'text') {
    return norm(input.value) === norm(formatRational(db.pi[col]))
  }

  return false
}

// ─── 12. balanceSolve ──────────────────────────────────────────────────────────

const BALANCE_EPSILON = 0.001

type BalanceSolveIx = {
  solveState?: string
}

type BalanceSolveBeat = {
  interaction: BalanceSolveIx
}

/** The engine's exact balance point (expectedTimes[solveState]). */
export function balancePointFor(
  beat: BalanceSolveBeat,
  automaton: Automaton,
): number {
  const solveState = (beat.interaction.solveState ?? 'E0') as StateId
  return balanceModel(automaton, solveState).balancePoint
}

/** True iff |candidate - rhs(candidate)| < EPSILON (mirrors BalanceSolveBeat EPSILON = 0.001). */
export function isBalanceSolved(
  beat: BalanceSolveBeat,
  automaton: Automaton,
  candidate: number,
): boolean {
  const solveState = (beat.interaction.solveState ?? 'E0') as StateId
  const { rhsAt } = balanceModel(automaton, solveState)
  return Math.abs(candidate - rhsAt(candidate)) < BALANCE_EPSILON
}

// ─── 13. handRanker ────────────────────────────────────────────────────────────

type HandRankerIx = {
  hands: { label: string; favorable: number }[]
  total: number
  order?: 'rarestFirst' | 'commonestFirst'
}

/**
 * Engine-correct ranking: indices into `hands` sorted by favorable count.
 * rarestFirst (default) → ascending favorable; commonestFirst → descending.
 */
export function correctRanking(ix: HandRankerIx): number[] {
  const order = ix.order ?? 'rarestFirst'
  return ix.hands
    .map((_, i) => i)
    .sort((a, b) =>
      order === 'rarestFirst'
        ? ix.hands[a]!.favorable - ix.hands[b]!.favorable
        : ix.hands[b]!.favorable - ix.hands[a]!.favorable,
    )
}

/** True iff ranking[slot] === correctOrder[slot] for all slots. */
export function isHandRankerCorrect(
  ix: HandRankerIx,
  ranking: (number | null)[],
): boolean {
  const correctOrder = correctRanking(ix)
  return ranking.every((idx, slot) => idx === correctOrder[slot])
}

// ─── 14. retrievalGrid ─────────────────────────────────────────────────────────

type RetrievalGridIx = {
  pairs: { left: string; right: string }[]
}

/** The correct assignment: index i → pairs[i].right. */
export function correctRetrievalAssignment(ix: RetrievalGridIx): string[] {
  return ix.pairs.map((p) => p.right)
}

/** True iff assign[i] === pairs[i].right for every i. */
export function isRetrievalGridCorrect(
  ix: RetrievalGridIx,
  assign: Record<number, string | null>,
): boolean {
  return ix.pairs.every((p, i) => assign[i] === p.right)
}

// ─── 15. covarianceBoard ────────────────────────────────────────────────────────
//
// covarianceBoard is NOT in GRADED_TYPES and is never self-graded: explore beats
// are ungraded; graded reads (Cov, ρ², corrRange) use answerEntry/masteryChallenge
// which compare learner input to the engine-anchored `headline` string. The helpers
// here are testable and correct IF ever wired, but they are intentionally NOT
// invoked by the CovarianceBoardBeat runtime renderer.
// (Engine imports covFn/varFn/corrRangeFn/rhoSqFn/formatRationalCov/formatRangePair
//  and the JointCell type are all imported at the top of this file.)

type CovarianceBoardIx = {
  display: 'jointPmf' | 'scatter' | 'corrVectors'
  joint?: CovJointCell[]
  rho1?: Rational
  rho2?: Rational
  task?: 'covariance' | 'rhoSquared' | 'corrRange'
  headline?: string
}

type CovarianceBoardBeat = {
  interaction: CovarianceBoardIx
}

/**
 * covarianceBoard is never self-graded; graded reads use answerEntry/masteryChallenge.
 * This always returns false to make the intent clear and prevent accidental wiring.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isCovarianceBoardGraded(_beat: CovarianceBoardBeat): boolean {
  // Design note (schema.ts §15): covarianceBoard NOT in GRADED_TYPES.
  // Explore beats are ungraded; graded reads use answerEntry. Always false.
  return false
}

/**
 * Grade a covarianceBoard beat against a typed string input.
 * Recomputes the anchor via the engine (covariance/rhoSquared/corrRange→formatRational/
 * formatRangePair) and compares under `norm`. Correct if the learner's input
 * matches the engine-derived headline for the beat's `task`.
 *
 * NOTE: This helper is not invoked by the runtime renderer. It is testable
 * and available for future graded wiring (e.g. a hybrid answerEntry beat
 * that also displays the joint pmf).
 */
export function isCovarianceBoardCorrect(
  beat: CovarianceBoardBeat,
  input: string,
): boolean {
  const ix = beat.interaction
  const { task, joint, rho1, rho2 } = ix

  if (task === 'covariance' && joint && joint.length > 0) {
    const cov = covFn(joint)
    return norm(input) === norm(formatRationalCov(cov))
  }

  if (task === 'rhoSquared' && joint && joint.length > 0) {
    const cov = covFn(joint)
    const varX = varFn(joint.map((c) => ({ x: c.x, p: c.p })))
    const varY = varFn(joint.map((c) => ({ x: c.y, p: c.p })))
    const rs = rhoSqFn(cov, varX, varY)
    return norm(input) === norm(formatRationalCov(rs))
  }

  if (task === 'corrRange' && rho1 && rho2) {
    // corrRange THROWS on non-Pythagorean inputs (engine has no float fallback).
    // The renderer wraps it in try/catch for its display-only readout; mirror
    // that here so a future non-Pythagorean fixture grades as `false` rather
    // than crashing the grader.
    try {
      const range = corrRangeFn(rho1, rho2)
      return norm(input) === norm(formatRangePair(range))
    } catch {
      return false
    }
  }

  // Fallback: compare to stored headline (validation anchor)
  if (ix.headline) {
    return norm(input) === norm(ix.headline)
  }

  return false
}
