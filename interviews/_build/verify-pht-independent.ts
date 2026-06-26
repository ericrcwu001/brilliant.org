#!/usr/bin/env tsx
// FULLY-INDEPENDENT verifier for interviews/course-pattern-hitting-times.json.
//
// Skeptical re-verification: does NOT trust the production engines, the build
// script, or verify-pht-pack.ts for the GROUND TRUTH. For every question it
// computes a ground-truth answer with pure BigInt rationals from first
// principles — solving the hitting-time / gambler's-ruin linear systems with an
// independent BigInt Gaussian elimination, computing Conway leading numbers from
// scratch, and summing 2^k over self-borders via an independent KMP-free border
// scan — then demands the 4-way agreement
//
//     BigInt-ground-truth == engine(documented API) == engineCheck.answer == hidden.answer
//
// plus exact-rational hygiene and the no-answer-leak hint spot-check.
// Run: ./node_modules/.bin/tsx interviews/_build/verify-pht-independent.ts

import { readFileSync } from 'node:fs'
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

const MAX = Number.MAX_SAFE_INTEGER

// ── BigInt exact rationals (independent) ───────────────────────────────────────
type Big = { n: bigint; d: bigint }
function gcdB(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  while (b) [a, b] = [b, a % b]
  return a || 1n
}
function B(n: bigint | number, d: bigint | number = 1n): Big {
  let nn = BigInt(n)
  let dd = BigInt(d)
  if (dd < 0n) {
    nn = -nn
    dd = -dd
  }
  const g = gcdB(nn, dd)
  return { n: nn / g, d: dd / g }
}
const addB = (a: Big, b: Big) => B(a.n * b.d + b.n * a.d, a.d * b.d)
const subB = (a: Big, b: Big) => B(a.n * b.d - b.n * a.d, a.d * b.d)
const mulB = (a: Big, b: Big) => B(a.n * b.n, a.d * b.d)
const divB = (a: Big, b: Big) => B(a.n * b.d, a.d * b.n)
const eqB = (a: Big, b: Big) => a.n * b.d === b.n * a.d
const fmtB = (b: Big) => (b.d === 1n ? `${b.n}` : `${b.n}/${b.d}`)

// Independent Gauss-Jordan over Big fractions (solves A x = b).
function solveBig(A: Big[][], b: Big[]): Big[] {
  const m = b.length
  const aug = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < m; col++) {
    let pivot = col
    while (pivot < m && aug[pivot][col].n === 0n) pivot++
    if (pivot === m) continue
    ;[aug[col], aug[pivot]] = [aug[pivot], aug[col]]
    const pv = aug[col][col]
    for (let j = col; j <= m; j++) aug[col][j] = divB(aug[col][j], pv)
    for (let r = 0; r < m; r++) {
      if (r === col) continue
      const f = aug[r][col]
      if (f.n === 0n) continue
      for (let j = col; j <= m; j++) aug[r][j] = subB(aug[r][j], mulB(f, aug[col][j]))
    }
  }
  return aug.map((row) => row[m])
}

// ── Independent ground-truth derivations (BigInt) ──────────────────────────────

// KMP transition computed by direct longest-suffix match (no engine import).
function nextMatched(pattern: string, i: number, c: string): number {
  const s = pattern.slice(0, i) + c
  for (let k = Math.min(i + 1, pattern.length); k >= 1; k--) {
    if (pattern.slice(0, k) === s.slice(s.length - k)) return k
  }
  return 0
}

// E[flips to first see `pattern`] on a coin with P(H)=p (Big), via the first-step
// linear system solved over BigInt — independent of buildAutomaton.
function gtPatternWait(pattern: string, p: Big): Big {
  const L = pattern.length
  const q = subB(B(1n), p)
  const A: Big[][] = []
  const b: Big[] = []
  for (let i = 0; i < L; i++) {
    const row = new Array<Big>(L).fill(B(0n))
    row[i] = addB(row[i], B(1n))
    for (const c of ['H', 'T'] as const) {
      const to = nextMatched(pattern, i, c)
      const pr = c === 'H' ? p : q
      if (to < L) row[to] = subB(row[to], pr)
    }
    A.push(row)
    b.push(B(1n))
  }
  return solveBig(A, b)[0]
}

// Conway leading number L(x,y) = Σ 2^(k-1) over k with last-k of x == first-k of y.
function leadingNumber(x: string, y: string): bigint {
  const n = Math.min(x.length, y.length)
  let sum = 0n
  for (let k = 1; k <= n; k++) {
    if (x.slice(x.length - k) === y.slice(0, k)) sum += 1n << BigInt(k - 1)
  }
  return sum
}
// P(b beats a) on a shared fair stream (Conway odds), independent of race.ts.
function gtPenneyBBeatsA(a: string, b: string): Big {
  const aa = leadingNumber(a, a)
  const ab = leadingNumber(a, b)
  const ba = leadingNumber(b, a)
  const bb = leadingNumber(b, b)
  const numA = bb - ba
  const numB = aa - ab
  const d = numA + numB
  if (d === 0n) return B(1n, 2n)
  return B(numB, d)
}

// Gambler's ruin reach/duration via independent BigInt tridiagonal solve.
function gtWalk(N: number, p: Big, i: number, query: 'reach' | 'duration'): Big {
  const q = subB(B(1n), p)
  const interior = (rhsConst: Big, x0: Big, xN: Big): Big[] => {
    const m = N - 1
    if (m <= 0) return []
    const A: Big[][] = []
    const b: Big[] = []
    for (let r = 1; r <= N - 1; r++) {
      const row = new Array<Big>(m).fill(B(0n))
      row[r - 1] = B(1n)
      if (r <= N - 2) row[r] = subB(row[r], p)
      if (r >= 2) row[r - 2] = subB(row[r - 2], q)
      A.push(row)
      let rhs = rhsConst
      if (r === 1) rhs = addB(rhs, mulB(q, x0))
      if (r === N - 1) rhs = addB(rhs, mulB(p, xN))
      b.push(rhs)
    }
    return solveBig(A, b)
  }
  if (query === 'duration') {
    const arr = [B(0n), ...interior(B(1n), B(0n), B(0n)), B(0n)]
    return arr[i]
  }
  const arr = [B(0n), ...interior(B(0n), B(0n), B(1n)), B(1n)]
  return arr[i]
}

// Σ 2^k over self-borders (k where the k-prefix equals the k-suffix), independent.
function gtOverlap(pattern: string): Big {
  const L = pattern.length
  let sum = 0n
  for (let k = 1; k <= L; k++) {
    if (pattern.slice(0, k) === pattern.slice(L - k)) sum += 1n << BigInt(k)
  }
  return B(sum, 1n)
}

// ── Engine (documented-API) re-call → Rational ─────────────────────────────────
const R = (n: number, d = 1): Rational => ({ n, d })
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

interface Q {
  id: string
  template?: { id: string; params: Record<string, unknown> }
  engineCheck: { module: string; answer: string }
  hidden: { answer: string; hintLadder: string[] }
}

function engineValue(q: Q): Rational | null {
  const t = q.template?.id
  const p = (q.template?.params ?? {}) as Record<string, unknown>
  const num = (k: string): number => Number(p[k])
  const str = (k: string): string => String(p[k])
  if (t === 'tmpl-pattern-wait') return reduce(buildAutomaton(str('pattern'), 0.5).expectedTimes.E0, 1)
  if (t === 'tmpl-biased-wait') return patternWaitRational(str('pattern'), reduce(num('pNum'), num('pDen')))
  if (t === 'tmpl-penney-race') return penneyOdds(str('a'), str('b')).bBeatsA
  if (t === 'tmpl-second-mover') return penneyOdds(str('a'), bestBeater(str('a'))).bBeatsA
  if (t === 'tmpl-gamblers-ruin') {
    const w = buildWalk(num('N'), num('pNum') / num('pDen'))
    return str('query') === 'duration' ? w.duration[num('i')] : w.reachProb[num('i')]
  }
  if (t === 'tmpl-overlap-wait') return reduce(expectedWaitFair(str('pattern')), 1)
  switch (q.id) {
    case 'ff-pht-longest-len4':
      return reduce(expectedWaitFair('HHHH'), 1)
    case 'ff-pht-shortest-len4':
      return reduce(expectedWaitFair('THHH'), 1)
    case 'ff-pht-wait-vs-win':
      return penneyOdds('HHH', 'THH').bBeatsA
    default:
      return null
  }
}

const failures: string[] = []
const fail = (id: string, msg: string) => failures.push(`${id}: ${msg}`)

function groundTruth(q: Q): Big | null {
  const t = q.template?.id
  const p = (q.template?.params ?? {}) as Record<string, unknown>
  const num = (k: string): number => Number(p[k])
  const str = (k: string): string => String(p[k])
  if (t === 'tmpl-pattern-wait') return gtPatternWait(str('pattern'), B(1n, 2n))
  if (t === 'tmpl-biased-wait') return gtPatternWait(str('pattern'), B(num('pNum'), num('pDen')))
  if (t === 'tmpl-penney-race') return gtPenneyBBeatsA(str('a'), str('b'))
  if (t === 'tmpl-second-mover') return gtPenneyBBeatsA(str('a'), bestBeater(str('a')))
  if (t === 'tmpl-gamblers-ruin') return gtWalk(num('N'), B(num('pNum'), num('pDen')), num('i'), str('query') as 'reach' | 'duration')
  if (t === 'tmpl-overlap-wait') return gtOverlap(str('pattern'))
  switch (q.id) {
    case 'ff-pht-longest-len4':
      return gtOverlap('HHHH')
    case 'ff-pht-shortest-len4':
      return gtOverlap('THHH')
    case 'ff-pht-wait-vs-win':
      return gtPenneyBBeatsA('HHH', 'THH')
    default:
      return null
  }
}

function engBig(r: Rational, id: string): Big | null {
  if (!Number.isInteger(r.n) || !Number.isInteger(r.d)) {
    fail(id, `engine produced NON-INTEGER rational ${r.n}/${r.d} — PRECISION LOSS`)
    return null
  }
  if (Math.abs(r.n) > MAX || Math.abs(r.d) > MAX) fail(id, `engine |n|/|d| exceed MAX_SAFE ${r.n}/${r.d}`)
  return B(BigInt(r.n), BigInt(r.d))
}
function answerBig(s: string): Big {
  const m = String(s).trim().match(/^(-?\d+)(?:\/(-?\d+))?$/)
  if (!m) throw new Error(`non-exact / unparseable answer "${s}"`)
  return B(BigInt(m[1]), m[2] ? BigInt(m[2]) : 1n)
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
}
function rungLeaks(answer: string, rung: string): boolean {
  const esc = escapeRegExp(answer)
  if (answer.includes('/')) return new RegExp(`(?<![\\d/])${esc}(?![\\d/])`).test(rung)
  return new RegExp(`(?:=|⇒|is\\s+|:\\s*)\\s*${esc}\\b`).test(rung) || new RegExp(`[=:]\\s*${esc}$`).test(rung.trim())
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
const pack = JSON.parse(readFileSync('interviews/course-pattern-hitting-times.json', 'utf8'))
const questions: Q[] = pack.questions

console.log('=== FULLY-INDEPENDENT RE-VERIFICATION (BigInt ground truth) ===\n')

let pass = 0
for (const q of questions) {
  const before = failures.length
  let gt: Big | null = null
  let ev: Rational | null = null
  try {
    gt = groundTruth(q)
  } catch (e) {
    fail(q.id, `ground-truth threw: ${(e as Error).message}`)
  }
  try {
    ev = engineValue(q)
  } catch (e) {
    fail(q.id, `engine re-call threw: ${(e as Error).message}`)
  }
  if (gt === null) fail(q.id, 'no independent ground truth')
  if (ev === null) fail(q.id, 'no engine re-call')

  let ecB: Big | null = null
  let hidB: Big | null = null
  try {
    ecB = answerBig(q.engineCheck.answer)
  } catch (e) {
    fail(q.id, (e as Error).message + ' (engineCheck.answer)')
  }
  try {
    hidB = answerBig(q.hidden.answer)
  } catch (e) {
    fail(q.id, (e as Error).message + ' (hidden.answer)')
  }

  const evB = ev ? engBig(ev, q.id) : null
  if (gt && evB && !eqB(gt, evB)) fail(q.id, `ground-truth ${fmtB(gt)} != engine ${fmtB(evB)}`)
  if (gt && ecB && !eqB(gt, ecB)) fail(q.id, `ground-truth ${fmtB(gt)} != engineCheck.answer ${q.engineCheck.answer}`)
  if (gt && hidB && !eqB(gt, hidB)) fail(q.id, `ground-truth ${fmtB(gt)} != hidden.answer ${q.hidden.answer}`)
  if (ecB && hidB && !eqB(ecB, hidB)) fail(q.id, `engineCheck.answer != hidden.answer`)

  const ok = failures.length === before
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${q.id.padEnd(42)} gt=${gt ? fmtB(gt) : '?'} eng=${evB ? fmtB(evB) : '?'} stored=${q.engineCheck.answer}`)
}

// no-leak spot-check (near-reveal + stronger rungs)
console.log('\n=== NO-ANSWER-LEAK spot-check (rungs 2 & 3 must be method-only) ===')
let leaks = 0
for (const q of questions) {
  const a = q.engineCheck.answer
  if (rungLeaks(a, q.hidden.hintLadder[1] ?? '')) {
    leaks++
    console.log(`  LEAK ${q.id} rung 2 states ${a}`)
  }
  if (rungLeaks(a, q.hidden.hintLadder[2] ?? '')) {
    leaks++
    console.log(`  LEAK ${q.id} rung 3 states ${a}`)
  }
}
if (leaks > 0) fail('NO-LEAK', `${leaks} hint rung(s) state the final answer`)
else console.log('PASS  no near-reveal/stronger rung states the final answer')

console.log('\n=== TALLY ===')
console.log(`4-way agreement: ${pass}/${questions.length} questions PASS`)
if (failures.length === 0) {
  console.log(`\nRESULT: ALL CHECKS PASS — ${pass}/${questions.length} independently reproduced (gt == engine == engineCheck == hidden), 0 leaks.`)
  process.exit(0)
}
console.log(`\nRESULT: ${failures.length} FAILURE(S):`)
for (const f of failures) console.log(`  - ${f}`)
process.exit(1)
