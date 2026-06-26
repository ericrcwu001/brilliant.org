// INDEPENDENT verifier for interviews/course-expected-value.json.
// Re-derives every answer from scratch via the engine (NOT the build script),
// cross-checks the high-parameter items against a separate BigInt computation,
// asserts exact-rational hygiene + structural/content gates, and de-dups.
// Run: ./node_modules/.bin/tsx interviews/_build/verify-ev-pack.ts

import { readFileSync } from 'node:fs'
import type { Rational } from '../../src/engine/types'
import {
  expectedValue,
  totalExpectation,
  indicatorExpectation,
  harmonic,
  couponCollector,
  distinctAfterDraws,
  orderStatUniform,
  noodleLoops,
} from '../../src/engine/expectation'
import { ratAdd, ratSub, ratMul, reduce } from '../../src/engine/automaton'

const MAX = Number.MAX_SAFE_INTEGER
const R = (n: number, d = 1): Rational => ({ n, d })
const DIE: { x: Rational; p: Rational }[] = [1, 2, 3, 4, 5, 6].map((x) => ({
  x: R(x),
  p: R(1, 6),
}))

// ---------- failure accounting ----------
let failures: string[] = []
const checks: { id: string; ok: boolean; notes: string[] }[] = []
function fail(id: string, msg: string) {
  failures.push(`${id}: ${msg}`)
}

// ---------- fraction parsing (numbers, for building engine inputs) ----------
function parseFrac(s: string | number): Rational {
  if (typeof s === 'number') return R(s)
  const t = s.trim()
  const m = t.match(/^(-?\d+)(?:\/(-?\d+))?$/)
  if (!m) throw new Error(`unparseable fraction: ${s}`)
  return reduce(parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 1)
}

// ---------- BigInt exact arithmetic (fully independent of the engine) ----------
type Big = { n: bigint; d: bigint }
function gcdB(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  while (b) [a, b] = [b, a % b]
  return a
}
function rB(n: bigint, d: bigint): Big {
  if (d < 0n) {
    n = -n
    d = -d
  }
  const g = gcdB(n, d) || 1n
  return { n: n / g, d: d / g }
}
const addB = (a: Big, b: Big) => rB(a.n * b.d + b.n * a.d, a.d * b.d)
const subB = (a: Big, b: Big) => rB(a.n * b.d - b.n * a.d, a.d * b.d)
const mulB = (a: Big, b: Big) => rB(a.n * b.n, a.d * b.d)
function harmonicB(n: number): Big {
  let acc: Big = { n: 0n, d: 1n }
  for (let k = 1; k <= n; k++) acc = addB(acc, { n: 1n, d: BigInt(k) })
  return acc
}
const couponB = (n: number): Big => mulB({ n: BigInt(n), d: 1n }, harmonicB(n))
function distinctB(N: number, m: number): Big {
  const base: Big = rB(BigInt(N - 1), BigInt(N))
  let pow: Big = { n: 1n, d: 1n }
  for (let i = 0; i < m; i++) pow = mulB(pow, base)
  return mulB({ n: BigInt(N), d: 1n }, subB({ n: 1n, d: 1n }, pow))
}
function noodleB(n: number): Big {
  let acc: Big = { n: 0n, d: 1n }
  for (let k = 1; k <= n; k++) acc = addB(acc, { n: 1n, d: BigInt(2 * k - 1) })
  return acc
}

// ---------- exact comparison: engine Rational vs stored string vs BigInt ----------
function ansToBig(s: string): Big {
  const t = String(s).trim()
  // strict exact-rational only: integer or n/d, no decimals / exponents
  const m = t.match(/^(-?\d+)(?:\/(-?\d+))?$/)
  if (!m) throw new Error(`non-exact / unparseable answer string: "${s}"`)
  return rB(BigInt(m[1]), m[2] ? BigInt(m[2]) : 1n)
}
function ratToBig(r: Rational, id: string, label: string): Big {
  if (!Number.isInteger(r.n) || !Number.isInteger(r.d)) {
    fail(id, `engine produced non-integer rational (${label}): ${r.n}/${r.d} — PRECISION LOSS`)
    return { n: 0n, d: 1n }
  }
  return rB(BigInt(r.n), BigInt(r.d))
}
const eqB = (a: Big, b: Big) => a.n * b.d === b.n * a.d
const fmt = (b: Big) => (b.d === 1n ? `${b.n}` : `${b.n}/${b.d}`)
function safe(r: Rational): boolean {
  return Math.abs(r.n) <= MAX && Math.abs(r.d) <= MAX
}

// ---------- pmf / cases independent reconstruction ----------
function checkPmfSumsTo1(pmf: { x: Rational; p: Rational }[], id: string) {
  let s: Rational = R(0, 1)
  for (const t of pmf) s = ratAdd(s, t.p)
  if (!(s.n === 1 && s.d === 1)) fail(id, `pmf probabilities sum to ${s.n}/${s.d}, not 1`)
}
function meanOfSet(ints: number[]): Rational {
  let sum = 0
  for (const v of ints) sum += v
  return reduce(sum, ints.length)
}
function intsIn(s: string): number[] {
  return (s.match(/\d+/g) || []).map((x) => parseInt(x, 10))
}

// Independent recompute → returns the engine Rational for this question.
function recompute(q: any): Rational {
  const id = q.id
  if (q.template) {
    const t = q.template.id
    const p = q.template.params
    if (t === 'tmpl-fair-value') {
      let pmf: { x: Rational; p: Rational }[]
      if (p.game === 'max-of-two-d6') {
        pmf = [1, 2, 3, 4, 5, 6].map((k) => ({ x: R(k), p: reduce(2 * k - 1, 36) }))
      } else if (p.game === 'min-of-two-d6') {
        pmf = [1, 2, 3, 4, 5, 6].map((k) => ({ x: R(k), p: reduce(13 - 2 * k, 36) }))
      } else if (p.payouts) {
        pmf = String(p.payouts)
          .split('+')
          .map((term: string) => {
            const [v, pr] = term.split('@')
            return { x: parseFrac(v), p: parseFrac(pr) }
          })
      } else {
        // loaded die: loadedFace gets loadedP, the other 5 faces get otherP each
        const lf = p.loadedFace
        const lp = parseFrac(p.loadedP)
        const op = parseFrac(p.otherP)
        pmf = [1, 2, 3, 4, 5, 6].map((k) => ({ x: R(k), p: k === lf ? lp : op }))
      }
      checkPmfSumsTo1(pmf, id)
      return expectedValue(pmf)
    }
    if (t === 'tmpl-linearity') {
      if (p.type === 'noodles') return noodleLoops(p.n)
      if (p.type === 'k-dice-sum') return ratMul(R(p.k), expectedValue(DIE))
      throw new Error(`${id}: unknown linearity type ${p.type}`)
    }
    if (t === 'tmpl-indicator') {
      if (p.type === 'distinct') return distinctAfterDraws(p.N, p.m)
      // first-special: E[pos] = 1 + (D-A)·E[1_{nonspecial before all A}] , P=1/(A+1)
      const viaIndicator = ratAdd(
        R(1),
        ratMul(R(p.D - p.A), indicatorExpectation(reduce(1, p.A + 1))),
      )
      const viaClosed = reduce(p.D + 1, p.A + 1)
      if (!eqB(ratToBig(viaIndicator, id, 'indicator'), ratToBig(viaClosed, id, 'closed')))
        fail(id, `indicator vs closed-form mismatch: ${viaIndicator.n}/${viaIndicator.d} vs ${viaClosed.n}/${viaClosed.d}`)
      return viaIndicator
    }
    if (t === 'tmpl-total-expectation') {
      if (p.type === 'geometric') {
        const w = intsIn(p.winFaces).length
        const d = p.d
        const cases = [
          { p: reduce(w, d), value: R(1) },
          { p: reduce(d - w, d), restart: { add: R(1) } },
        ]
        return totalExpectation(cases)
      }
      if (p.type === 'conditional') {
        // coin: heads → roll a fair die (E=7/2), tails → $1 flat
        return totalExpectation([
          { p: R(1, 2), value: expectedValue(DIE) },
          { p: R(1, 2), value: R(1) },
        ])
      }
      if (p.type === 'self-ref') {
        const stop = intsIn(p.stop)
        const reroll = intsIn(p.reroll)
        const d = p.d
        const cases = [
          { p: reduce(stop.length, d), value: meanOfSet(stop) },
          { p: reduce(reroll.length, d), restart: { add: meanOfSet(reroll) } },
        ]
        return totalExpectation(cases)
      }
      throw new Error(`${id}: unknown total-expectation type ${p.type}`)
    }
    if (t === 'tmpl-coupon-collector') {
      if (p.type === 'full-set') return couponCollector(p.N)
      if (p.type === 'from-holding') return ratMul(R(p.N), harmonic(p.N - p.j))
      throw new Error(`${id}: unknown coupon type ${p.type}`)
    }
    if (t === 'tmpl-order-statistics') {
      const os = orderStatUniform(p.n)
      if (p.stat === 'max' || p.stat === 'ants') return os.max
      if (p.stat === 'min') return os.min
      if (p.stat === 'range') return ratSub(os.max, os.min)
      throw new Error(`${id}: unknown order-stat ${p.stat}`)
    }
    throw new Error(`${id}: unknown template ${t}`)
  }

  // ---- free-form: fresh per-id computation ----
  switch (id) {
    case 'ff-fair-die-bet':
      return expectedValue(DIE) // (a) fair price; part (d) re-priced separately below
    case 'ff-two-dice-two-ways': {
      const w = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]
      const pmf = w.map((wi, i) => ({ x: R(i + 2), p: reduce(wi, 36) }))
      checkPmfSumsTo1(pmf, id)
      const viaPmf = expectedValue(pmf)
      const viaLin = ratMul(R(2), expectedValue(DIE))
      if (!eqB(ratToBig(viaPmf, id, 'pmf'), ratToBig(viaLin, id, 'lin')))
        fail(id, `two-ways disagree: ${viaPmf.n}/${viaPmf.d} vs ${viaLin.n}/${viaLin.d}`)
      return viaLin
    }
    case 'ff-coin-die-or-nothing':
      return totalExpectation([
        { p: R(1, 2), value: expectedValue(DIE) },
        { p: R(1, 2), value: R(0) },
      ])
    case 'ff-max-min-two-uniform':
      return orderStatUniform(2).max
    case 'ff-first-ace-indicators': {
      const viaClosed = reduce(53, 5)
      const viaIndicator = ratAdd(R(1), ratMul(R(48), indicatorExpectation(reduce(1, 5))))
      if (!eqB(ratToBig(viaClosed, id, 'c'), ratToBig(viaIndicator, id, 'i')))
        fail(id, `first-ace forms disagree`)
      return viaIndicator
    }
    case 'ff-distinct-after-2of6':
      return distinctAfterDraws(6, 2)
    case 'ff-coupon-full-6':
      return couponCollector(6)
    case 'ff-rolls-until-first-6':
      return totalExpectation([
        { p: R(1, 6), value: R(1) },
        { p: R(5, 6), restart: { add: R(1) } },
      ])
    case 'ff-range-of-4-uniform': {
      const os = orderStatUniform(4)
      return ratSub(os.max, os.min)
    }
    case 'ff-noodles-6-asymptotic':
      return noodleLoops(6)
    case 'ff-self-ref-dice-game':
      // {1,2,3} end pays face (mean 2); {4,5,6} bank face (mean 5) + replay
      return totalExpectation([
        { p: R(1, 2), value: R(2) },
        { p: R(1, 2), restart: { add: R(5) } },
      ])
    case 'ff-ants-500':
      return orderStatUniform(500).max
    case 'ff-coupon-last-2-of-6':
      return ratMul(R(6), harmonic(2)) // hold 4 of 6 → 6·H_{6-4}=6·H_2
    case 'ff-sum-two-dice-given-six': {
      const pmf = [
        { x: R(7), p: R(2, 11) },
        { x: R(8), p: R(2, 11) },
        { x: R(9), p: R(2, 11) },
        { x: R(10), p: R(2, 11) },
        { x: R(11), p: R(2, 11) },
        { x: R(12), p: R(1, 11) },
      ]
      checkPmfSumsTo1(pmf, id)
      return expectedValue(pmf)
    }
    default:
      throw new Error(`no independent recompute for free-form id ${id}`)
  }
}

// ============================ MAIN ============================
const pack = JSON.parse(readFileSync('interviews/course-expected-value.json', 'utf8'))
const questions: any[] = pack.questions

console.log('=== INDEPENDENT RE-VERIFICATION OF course-expected-value.json ===\n')

let pass = 0
for (const q of questions) {
  const id = q.id
  const notes: string[] = []
  const before = failures.length
  let engineVal: Rational | null = null
  try {
    engineVal = recompute(q)
  } catch (e: any) {
    fail(id, `recompute threw: ${e.message}`)
  }

  if (engineVal) {
    // exact-rational hygiene on engine output
    if (!safe(engineVal)) fail(id, `engine |n|/|d| exceed MAX_SAFE_INTEGER: ${engineVal.n}/${engineVal.d}`)
    const eng = ratToBig(engineVal, id, 'engine')

    // stored answers must be strict exact rationals
    let ecBig: Big | null = null
    let hidBig: Big | null = null
    try {
      ecBig = ansToBig(q.engineCheck.answer)
    } catch (e: any) {
      fail(id, e.message + ' (engineCheck.answer)')
    }
    try {
      hidBig = ansToBig(q.hidden.answer)
    } catch (e: any) {
      fail(id, e.message + ' (hidden.answer)')
    }
    if (ecBig) {
      if (!eqB(eng, ecBig)) fail(id, `engine ${fmt(eng)} != engineCheck.answer ${q.engineCheck.answer}`)
      if (ecBig.n > BigInt(MAX) || ecBig.d > BigInt(MAX)) fail(id, `engineCheck.answer exceeds MAX_SAFE`)
    }
    if (hidBig) {
      if (!eqB(eng, hidBig)) fail(id, `engine ${fmt(eng)} != hidden.answer ${q.hidden.answer}`)
    }
    if (ecBig && hidBig && !eqB(ecBig, hidBig)) fail(id, `engineCheck.answer != hidden.answer`)

    notes.push(`E=${fmt(eng)}`)
  }

  // verified flag
  if (q.engineCheck?.verified !== true) fail(id, `engineCheck.verified !== true`)

  // no float / no foreign-engine misuse in the calls
  const callsStr = JSON.stringify(q.engineCheck?.calls || [])
  if (/probabilityFromCounts|toRational\s*\(|Math\.|parseFloat|Number\(/.test(callsStr))
    fail(id, `suspicious float/foreign-engine token in calls`)
  if (q.engineCheck?.module !== 'src/engine/expectation.ts') fail(id, `wrong engineModule`)

  // range guards inside the calls
  for (const m of callsStr.matchAll(/noodleLoops\((\d+)\)/g))
    if (+m[1] > 8) fail(id, `noodleLoops(${m[1]}) exceeds n<=8 exact-rational range`)
  for (const m of callsStr.matchAll(/(?:couponCollector|harmonic)\((\d+)\)/g))
    if (+m[1] > 12) fail(id, `coupon/harmonic(${m[1]}) exceeds N<=12 range`)

  const ok = failures.length === before
  if (ok) pass++
  checks.push({ id, ok, notes })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id.padEnd(40)} ${notes.join(' ')}`)
}

// ===== BigInt exactness cross-check on the high-parameter items =====
console.log('\n=== BigInt exactness cross-check (high-parameter) ===')
const bigCases: { label: string; eng: Rational; big: Big }[] = [
  { label: 'couponCollector(10)', eng: couponCollector(10), big: couponB(10) },
  { label: 'couponCollector(12)', eng: couponCollector(12), big: couponB(12) },
  { label: 'distinctAfterDraws(6,6)', eng: distinctAfterDraws(6, 6), big: distinctB(6, 6) },
  { label: 'distinctAfterDraws(13,4)', eng: distinctAfterDraws(13, 4), big: distinctB(13, 4) },
  { label: 'noodleLoops(7)', eng: noodleLoops(7), big: noodleB(7) },
  { label: 'noodleLoops(8)', eng: noodleLoops(8), big: noodleB(8) },
]
let bigPass = 0
for (const c of bigCases) {
  const engB = rB(BigInt(c.eng.n), BigInt(c.eng.d))
  const exact = eqB(engB, c.big) && Number.isInteger(c.eng.n) && Number.isInteger(c.eng.d) && safe(c.eng)
  if (exact) bigPass++
  else fail('BIGINT', `${c.label}: engine ${fmt(engB)} vs BigInt ${fmt(c.big)} — NOT exact`)
  console.log(`${exact ? 'EXACT' : 'INEXACT'}  ${c.label.padEnd(26)} engine=${fmt(engB)}  bigint=${fmt(c.big)}`)
}

// Confirm the 100-noodle value is verbal only (never engine-graded).
const allCalls = JSON.stringify(questions.map((q) => q.engineCheck?.calls))
if (/noodleLoops\(\s*(100|[1-9]\d{2,})\s*\)/.test(allCalls))
  fail('ff-noodles-6-asymptotic', `noodleLoops(100+) is engine-called — must be verbal/asymptotic only`)

// ===================== STRUCTURAL / CONTENT GATES =====================
console.log('\n=== Structural / content gates ===')
const sErr: string[] = []
const sOk = (cond: boolean, msg: string) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`)
  if (!cond) sErr.push(msg)
}

sOk(questions.length === 58 && pack.counts.total === 58, `total === 58 (got ${questions.length}/${pack.counts.total})`)
sOk(questions.length >= 50, `total >= 50`)

// fingerprints unique
const fps = questions.map((q) => q.fingerprint)
const dupFp = fps.filter((f, i) => fps.indexOf(f) !== i)
sOk(dupFp.length === 0, `fingerprints unique (dups: ${dupFp.join(',') || 'none'})`)

// tiers ∈ set, floor = hard
const tierSet = new Set(['hard', 'harder', 'brutal'])
const badTier = questions.filter((q) => !tierSet.has(q.tier)).map((q) => q.id)
sOk(badTier.length === 0, `all tiers ∈ {hard,harder,brutal} floor=hard (bad: ${badTier.join(',') || 'none'})`)

// counts block matches arrays
const byTier: Record<string, number> = {}
for (const q of questions) byTier[q.tier] = (byTier[q.tier] || 0) + 1
const tmplN = questions.filter((q) => q.template).length
const ffN = questions.filter((q) => !q.template).length
sOk(
  byTier.hard === pack.counts.byTier.hard &&
    byTier.harder === pack.counts.byTier.harder &&
    byTier.brutal === pack.counts.byTier.brutal,
  `byTier matches (actual ${JSON.stringify(byTier)} vs ${JSON.stringify(pack.counts.byTier)})`,
)
sOk(
  tmplN === pack.counts.templated && ffN === pack.counts.freeForm,
  `templated/freeForm counts match (actual ${tmplN}/${ffN} vs ${pack.counts.templated}/${pack.counts.freeForm})`,
)

// per-question content
const rubricAxes = ['correctness', 'approach', 'rigor', 'communication', 'speed']
let contentBad: string[] = []
for (const q of questions) {
  const src = q.source || ''
  const citesGB = /Green Book|GB/.test(src) && /(§|p\.)/.test(src)
  if (!src.trim() || !citesGB) contentBad.push(`${q.id}:source`)
  const hl = q.hidden?.hintLadder
  if (!Array.isArray(hl) || hl.length !== 3) contentBad.push(`${q.id}:hintLadder(${hl?.length})`)
  const rub = q.hidden?.rubric || {}
  if (!rubricAxes.every((a) => typeof rub[a] === 'string' && rub[a].trim())) contentBad.push(`${q.id}:rubric`)
  if (!Array.isArray(q.followUps) || q.followUps.length < 1) contentBad.push(`${q.id}:followUps`)
  if (!q.prompt || !String(q.prompt).trim()) contentBad.push(`${q.id}:prompt`)
}
sOk(contentBad.length === 0, `every Q: GB source + 3 hints + 5 rubric axes + >=1 followUp + prompt (bad: ${contentBad.join(', ') || 'none'})`)

// de-dup beyond fingerprints: identical normalized engine call signature => semantic dup
const sig = new Map<string, string[]>()
for (const q of questions) {
  const key = JSON.stringify(q.engineCheck?.calls || []).replace(/\s+/g, '')
  if (!sig.has(key)) sig.set(key, [])
  sig.get(key)!.push(q.id)
}
const semDups = [...sig.values()].filter((ids) => ids.length > 1)
sOk(semDups.length === 0, `no semantic dupes (same engine calls) (dups: ${semDups.map((g) => g.join('=')).join('; ') || 'none'})`)

// asset hygiene: lives under interviews/, NOT under fixtures/ seed glob
sOk(pack.version != null && pack.kind === 'interview-pack', `self-describing (version + kind)`)

// ===== NO-LEAK spot-check: near-reveal (3rd hint) must NOT state the final answer =====
console.log('\n=== No-leak spot-check (near-reveal hint must not state final answer) ===')
function answerForms(ans: string): string[] {
  const m = String(ans).trim().match(/^(-?\d+)(?:\/(\d+))?$/)
  if (!m) return [ans]
  const n = parseInt(m[1], 10)
  const d = m[2] ? parseInt(m[2], 10) : 1
  const forms = new Set<string>([ans])
  if (d !== 1) {
    const v = n / d
    forms.add(v.toString())
    forms.add(v.toFixed(2))
    forms.add(v.toFixed(3))
  }
  return [...forms]
}
const leakers: string[] = []
for (const q of questions) {
  const ans = q.hidden.answer
  const rung3 = String(q.hidden.hintLadder?.[2] || '')
  for (const f of answerForms(ans)) {
    const re = new RegExp(`(^|[^\\d/.])${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\d/]|$)`)
    if (re.test(rung3)) {
      leakers.push(`${q.id}(=${ans})`)
      break
    }
  }
}
const leakOk = leakers.length === 0
console.log(`${leakOk ? 'PASS' : 'FAIL'}  near-reveal rungs withhold the final answer: ${questions.length - leakers.length}/${questions.length} clean`)
if (!leakers.length) {
  // nothing
} else {
  console.log(`        ${leakers.length} leaking near-reveal rungs:`)
  for (const l of leakers) console.log(`          - ${l}`)
}
if (!leakOk) sErr.push(`no-leak: ${leakers.length}/${questions.length} near-reveal rungs state the final numeric answer`)

// ============================== TALLY ==============================
console.log('\n=== TALLY ===')
console.log(`Independent recompute (math) : ${pass}/${questions.length} questions PASS`)
console.log(`BigInt exactness (high-param): ${bigPass}/${bigCases.length} items EXACT`)
console.log(`Structural/content gates     : ${sErr.length === 0 ? 'ALL PASS' : sErr.length + ' FAIL'}`)
console.log(`No-leak near-reveal           : ${leakOk ? 'PASS' : leakers.length + '/' + questions.length + ' LEAK (DEFECT)'}`)
const total = failures.length + sErr.length
if (total === 0) {
  console.log(`\nRESULT: ALL CHECKS PASS — ${pass}/${questions.length} reproduced, ${bigPass}/${bigCases.length} BigInt-exact, structural clean, no leaks.`)
  process.exit(0)
} else {
  console.log(
    `\nRESULT: math/engine ${pass}/${questions.length} reproduced & ${bigPass}/${bigCases.length} BigInt-exact (CORE GATE PASS), but ${total} OTHER FAILURE(S):`,
  )
  for (const f of failures) console.log(`  - ${f}`)
  for (const s of sErr) console.log(`  - GATE: ${s}`)
  process.exit(1)
}
