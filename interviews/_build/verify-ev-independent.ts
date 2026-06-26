// FULLY-INDEPENDENT verifier for interviews/course-expected-value.json.
//
// Skeptical re-verification: this script does NOT trust the engine's own
// formulas, nor the build script, nor the existing verify-ev-pack.ts. For every
// one of the 58 questions it computes a GROUND TRUTH answer with pure BigInt —
// by brute-force enumeration of the underlying sample space wherever that is
// finite (dice pairs, distinct-symbol sequences, first-special by combinatorial
// sum), and by first-principles BigInt arithmetic everywhere else (harmonic
// sums, Wald's identity for self-referential games, 1/p geometric waits,
// n/(n+1) order stats). It then demands that
//
//     BigInt-ground-truth  ==  engine(documented API)  ==  engineCheck.answer  ==  hidden.answer
//
// all four agree as exact rationals. It also (a) checks exact-rational hygiene
// (integer n/d, |n|,|d| <= MAX_SAFE_INTEGER), (b) re-runs the BigInt exactness
// cross-check on the high-parameter items, (c) runs structural / content /
// semantic-dedup gates, and (d) adds the NO-ANSWER-LEAK hint-ladder spot-check
// that the existing verifier omits: it flags any near-reveal (3rd hint rung)
// that states the final numeric answer.
//
// Run: ./node_modules/.bin/tsx interviews/_build/verify-ev-independent.ts

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

// ───────────────────────── BigInt exact rationals (independent) ──────────────
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
const eqB = (a: Big, b: Big) => a.n * b.d === b.n * a.d
const fmtB = (b: Big) => (b.d === 1n ? `${b.n}` : `${b.n}/${b.d}`)

// harmonic / coupon / order-stats / noodles from first principles (BigInt)
function harmonicBig(n: number): Big {
  let acc = B(0n)
  for (let k = 1; k <= n; k++) acc = addB(acc, B(1n, BigInt(k)))
  return acc
}
const couponBig = (n: number) => mulB(B(BigInt(n)), harmonicBig(n))
function noodleBig(n: number): Big {
  let acc = B(0n)
  for (let k = 1; k <= n; k++) acc = addB(acc, B(1n, BigInt(2 * k - 1)))
  return acc
}
// distinct-after-m by BRUTE FORCE: average distinct count over all N^m sequences.
function distinctBrute(N: number, m: number): Big {
  const total = BigInt(N) ** BigInt(m)
  let sum = 0n
  const idx = new Array(m).fill(0)
  const totalNum = Number(total)
  for (let s = 0; s < totalNum; s++) {
    const seen = new Set<number>()
    for (let p = 0; p < m; p++) seen.add(idx[p])
    sum += BigInt(seen.size)
    // odometer increment in base N
    for (let p = 0; p < m; p++) {
      if (++idx[p] < N) break
      idx[p] = 0
    }
  }
  return B(sum, total)
}
// closed-form distinct (BigInt) for the high-param exactness cross-check
function distinctClosedBig(N: number, m: number): Big {
  const base = B(BigInt(N - 1), BigInt(N))
  let pow = B(1n)
  for (let i = 0; i < m; i++) pow = mulB(pow, base)
  return mulB(B(BigInt(N)), subB(B(1n), pow))
}
// binomial (BigInt)
function choose(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n
  k = Math.min(k, n - k)
  let num = 1n
  let den = 1n
  for (let i = 0; i < k; i++) {
    num *= BigInt(n - i)
    den *= BigInt(i + 1)
  }
  return num / den
}
// E[position of first of A specials among D cards] by combinatorial definition:
// Σ_i i·P(first at i), P(first at i)=C(D-i,A-1)/C(D,A). Independent of (D+1)/(A+1).
function firstSpecialBrute(D: number, A: number): Big {
  const denom = choose(D, A)
  let num = 0n
  for (let i = 1; i <= D - A + 1; i++) num += BigInt(i) * choose(D - i, A - 1)
  return B(num, denom)
}
// brute-force two-dice EV over a value function f(d1,d2)
function twoDiceEV(f: (a: number, b: number) => number): Big {
  let sum = 0n
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) sum += BigInt(f(a, b))
  return B(sum, 36n)
}
function twoDiceCondEV(
  pred: (a: number, b: number) => boolean,
  f: (a: number, b: number) => number,
): Big {
  let sum = 0n
  let cnt = 0n
  for (let a = 1; a <= 6; a++)
    for (let b = 1; b <= 6; b++)
      if (pred(a, b)) {
        sum += BigInt(f(a, b))
        cnt++
      }
  return B(sum, cnt)
}
const faceMean = (d: number): Big => B(d + 1, 2) // E[uniform face on 1..d]

// ───────────────────────── parsing helpers ──────────────────────────────────
function parseFracBig(s: string | number): Big {
  if (typeof s === 'number') return B(s)
  const m = String(s).trim().match(/^(-?\d+)(?:\/(-?\d+))?$/)
  if (!m) throw new Error(`unparseable fraction: ${s}`)
  return B(BigInt(m[1]), m[2] ? BigInt(m[2]) : 1n)
}
// strict exact-rational parse for stored answer strings (NO decimals/exponents)
function answerBig(s: string): Big {
  const t = String(s).trim()
  const m = t.match(/^(-?\d+)(?:\/(-?\d+))?$/)
  if (!m) throw new Error(`non-exact / unparseable stored answer "${s}"`)
  return B(BigInt(m[1]), m[2] ? BigInt(m[2]) : 1n)
}
const intsIn = (s: string): number[] => (s.match(/\d+/g) || []).map(Number)
const meanInts = (xs: number[]): Big => {
  let sum = 0n
  for (const x of xs) sum += BigInt(x)
  return B(sum, BigInt(xs.length))
}

// ───────────────────────── engine Rational → Big (with hygiene) ──────────────
const failures: string[] = []
const fail = (id: string, msg: string) => failures.push(`${id}: ${msg}`)
function engBig(r: Rational, id: string, label: string): Big {
  if (!Number.isInteger(r.n) || !Number.isInteger(r.d)) {
    fail(id, `engine produced NON-INTEGER rational (${label}) ${r.n}/${r.d} — PRECISION LOSS`)
    return B(0n)
  }
  if (Math.abs(r.n) > MAX || Math.abs(r.d) > MAX) {
    fail(id, `engine |n|/|d| exceed MAX_SAFE_INTEGER (${label}) ${r.n}/${r.d}`)
  }
  return B(BigInt(r.n), BigInt(r.d))
}
const DIE = [1, 2, 3, 4, 5, 6].map((x) => ({ x: { n: x, d: 1 }, p: { n: 1, d: 6 } }))
const R = (n: number, d = 1): Rational => ({ n, d })

// ───────────────────────── per-question INDEPENDENT ground truth (BigInt) ────
function groundTruth(q: any): Big {
  const id: string = q.id
  if (q.template) {
    const t = q.template.id
    const p = q.template.params
    switch (t) {
      case 'tmpl-fair-value': {
        if (p.game === 'max-of-two-d6') return twoDiceEV((a, b) => Math.max(a, b))
        if (p.game === 'min-of-two-d6') return twoDiceEV((a, b) => Math.min(a, b))
        if (p.payouts) {
          let acc = B(0n)
          for (const term of String(p.payouts).split('+')) {
            const [v, pr] = term.split('@')
            acc = addB(acc, mulB(parseFracBig(v), parseFracBig(pr)))
          }
          return acc
        }
        // loaded die
        const lf = p.loadedFace
        const lp = parseFracBig(p.loadedP)
        const op = parseFracBig(p.otherP)
        let acc = B(0n)
        for (let k = 1; k <= 6; k++) acc = addB(acc, mulB(B(k), k === lf ? lp : op))
        return acc
      }
      case 'tmpl-linearity':
        if (p.type === 'noodles') return noodleBig(p.n)
        if (p.type === 'k-dice-sum') return mulB(B(p.k), faceMean(6))
        break
      case 'tmpl-indicator':
        if (p.type === 'distinct') return distinctBrute(p.N, p.m)
        return firstSpecialBrute(p.D, p.A) // first-special
      case 'tmpl-total-expectation': {
        if (p.type === 'geometric') {
          const w = intsIn(p.winFaces).length
          return B(p.d, w) // 1/p, p = w/d
        }
        if (p.type === 'conditional') {
          // coin: H -> fair die (7/2), T -> $1
          return addB(mulB(B(1, 2), faceMean(6)), mulB(B(1, 2), B(1)))
        }
        if (p.type === 'self-ref') {
          // Wald: E = E[N]·E[face] = (d/|stop|)·((d+1)/2)
          const stop = intsIn(p.stop)
          return mulB(B(p.d, stop.length), faceMean(p.d))
        }
        break
      }
      case 'tmpl-coupon-collector':
        if (p.type === 'full-set') return couponBig(p.N)
        if (p.type === 'from-holding') return mulB(B(p.N), harmonicBig(p.N - p.j))
        break
      case 'tmpl-order-statistics': {
        const n = p.n
        if (p.stat === 'max' || p.stat === 'ants') return B(n, n + 1)
        if (p.stat === 'min') return B(1, n + 1)
        if (p.stat === 'range') return B(n - 1, n + 1)
        break
      }
    }
    throw new Error(`${id}: no ground truth for template ${t} / ${JSON.stringify(p)}`)
  }
  // free-form
  switch (id) {
    case 'ff-fair-die-bet':
      return faceMean(6) // (a) fair die = 7/2 (primary graded answer)
    case 'ff-two-dice-two-ways':
      return twoDiceEV((a, b) => a + b) // brute-force sum of two dice
    case 'ff-coin-die-or-nothing':
      return mulB(B(1, 2), faceMean(6)) // 1/2·7/2 + 1/2·0
    case 'ff-max-min-two-uniform':
      return B(2, 3) // E[max of 2 U(0,1)] = n/(n+1) = 2/3
    case 'ff-first-ace-indicators':
      return firstSpecialBrute(52, 4)
    case 'ff-distinct-after-2of6':
      return distinctBrute(6, 2)
    case 'ff-coupon-full-6':
      return couponBig(6)
    case 'ff-rolls-until-first-6':
      return B(6, 1) // 1/p, p=1/6
    case 'ff-range-of-4-uniform':
      return B(3, 5) // (n-1)/(n+1), n=4
    case 'ff-noodles-6-asymptotic':
      return noodleBig(6)
    case 'ff-self-ref-dice-game':
      return mulB(B(6, 3), faceMean(6)) // stop {1,2,3}: (d/|stop|)·(d+1)/2
    case 'ff-ants-500':
      return B(500, 501)
    case 'ff-coupon-last-2-of-6':
      return mulB(B(6), harmonicBig(2)) // hold 4 of 6 -> 6·H_2
    case 'ff-sum-two-dice-given-six':
      return twoDiceCondEV((a, b) => a === 6 || b === 6, (a, b) => a + b)
  }
  throw new Error(`${id}: no ground truth for free-form id`)
}

// ───────────────────────── per-question ENGINE re-call (documented API) ──────
function engineValue(q: any, id: string): Rational {
  if (q.template) {
    const t = q.template.id
    const p = q.template.params
    switch (t) {
      case 'tmpl-fair-value': {
        let pmf: { x: Rational; p: Rational }[]
        if (p.game === 'max-of-two-d6')
          pmf = [1, 2, 3, 4, 5, 6].map((k) => ({ x: R(k), p: reduce(2 * k - 1, 36) }))
        else if (p.game === 'min-of-two-d6')
          pmf = [1, 2, 3, 4, 5, 6].map((k) => ({ x: R(k), p: reduce(13 - 2 * k, 36) }))
        else if (p.payouts)
          pmf = String(p.payouts)
            .split('+')
            .map((term: string) => {
              const [v, pr] = term.split('@')
              const fv = v.includes('/') ? v.split('/').map(Number) : [Number(v), 1]
              const fp = pr.split('/').map(Number)
              return { x: reduce(fv[0], fv[1] ?? 1), p: reduce(fp[0], fp[1] ?? 1) }
            })
        else {
          const lp = p.loadedP.split('/').map(Number)
          const op = p.otherP.split('/').map(Number)
          pmf = [1, 2, 3, 4, 5, 6].map((k) => ({
            x: R(k),
            p: k === p.loadedFace ? reduce(lp[0], lp[1]) : reduce(op[0], op[1]),
          }))
        }
        return expectedValue(pmf)
      }
      case 'tmpl-linearity':
        return p.type === 'noodles' ? noodleLoops(p.n) : ratMul(R(p.k), expectedValue(DIE))
      case 'tmpl-indicator':
        return p.type === 'distinct'
          ? distinctAfterDraws(p.N, p.m)
          : ratAdd(R(1), ratMul(R(p.D - p.A), indicatorExpectation(reduce(1, p.A + 1))))
      case 'tmpl-total-expectation': {
        if (p.type === 'geometric') {
          const w = intsIn(p.winFaces).length
          return totalExpectation([
            { p: reduce(w, p.d), value: R(1) },
            { p: reduce(p.d - w, p.d), restart: { add: R(1) } },
          ])
        }
        if (p.type === 'conditional')
          return totalExpectation([
            { p: R(1, 2), value: expectedValue(DIE) },
            { p: R(1, 2), value: R(1) },
          ])
        // self-ref
        const stop = intsIn(p.stop)
        const reroll = intsIn(p.reroll)
        const meanR = (xs: number[]) => reduce(xs.reduce((a, b) => a + b, 0), xs.length)
        return totalExpectation([
          { p: reduce(stop.length, p.d), value: meanR(stop) },
          { p: reduce(reroll.length, p.d), restart: { add: meanR(reroll) } },
        ])
      }
      case 'tmpl-coupon-collector':
        return p.type === 'full-set'
          ? couponCollector(p.N)
          : ratMul(R(p.N), harmonic(p.N - p.j))
      case 'tmpl-order-statistics': {
        const os = orderStatUniform(p.n)
        if (p.stat === 'max' || p.stat === 'ants') return os.max
        if (p.stat === 'min') return os.min
        return ratSub(os.max, os.min) // range
      }
    }
  }
  switch (id) {
    case 'ff-fair-die-bet':
      return expectedValue(DIE)
    case 'ff-two-dice-two-ways':
      return ratMul(R(2), expectedValue(DIE))
    case 'ff-coin-die-or-nothing':
      return totalExpectation([{ p: R(1, 2), value: expectedValue(DIE) }, { p: R(1, 2), value: R(0) }])
    case 'ff-max-min-two-uniform':
      return orderStatUniform(2).max
    case 'ff-first-ace-indicators':
      return ratAdd(R(1), ratMul(R(48), indicatorExpectation(reduce(1, 5))))
    case 'ff-distinct-after-2of6':
      return distinctAfterDraws(6, 2)
    case 'ff-coupon-full-6':
      return couponCollector(6)
    case 'ff-rolls-until-first-6':
      return totalExpectation([{ p: R(1, 6), value: R(1) }, { p: R(5, 6), restart: { add: R(1) } }])
    case 'ff-range-of-4-uniform':
      return ratSub(orderStatUniform(4).max, orderStatUniform(4).min)
    case 'ff-noodles-6-asymptotic':
      return noodleLoops(6)
    case 'ff-self-ref-dice-game':
      return totalExpectation([{ p: R(1, 2), value: R(2) }, { p: R(1, 2), restart: { add: R(5) } }])
    case 'ff-ants-500':
      return orderStatUniform(500).max
    case 'ff-coupon-last-2-of-6':
      return ratMul(R(6), harmonic(2))
    case 'ff-sum-two-dice-given-six':
      return expectedValue([7, 8, 9, 10, 11].map((x) => ({ x: R(x), p: R(2, 11) })).concat([{ x: R(12), p: R(1, 11) }]))
  }
  throw new Error(`${id}: no engine re-call`)
}

// ───────────────────────── canonical semantic key (for dedup by fn+args) ─────
function semKey(q: any): string {
  if (q.template) {
    const t = q.template.id
    const p = q.template.params
    if (t === 'tmpl-fair-value') {
      if (p.game) return `EV:${p.game}`
      if (p.payouts) return `EV:${p.payouts}`
      return `EV:loaded${p.loadedFace}@${p.loadedP}/others@${p.otherP}`
    }
    if (t === 'tmpl-linearity') return p.type === 'noodles' ? `noodle:${p.n}` : `kdice:${p.k}`
    if (t === 'tmpl-indicator')
      return p.type === 'distinct' ? `distinct:${p.N},${p.m}` : `first:${p.D},${p.A}`
    if (t === 'tmpl-total-expectation') {
      if (p.type === 'geometric') return `geom:${intsIn(p.winFaces).length}/${p.d}`
      if (p.type === 'conditional') return `cond:${p.branches}`
      return `selfref:${p.d}:${intsIn(p.stop).sort((a, b) => a - b).join('-')}`
    }
    if (t === 'tmpl-coupon-collector')
      return p.type === 'full-set' ? `coupon:${p.N}` : `couponfrom:${p.N},${p.N - p.j}`
    if (t === 'tmpl-order-statistics') {
      const stat = p.stat === 'ants' ? 'max' : p.stat
      return `os:${stat}:${p.n}`
    }
  }
  // free-form → map to the same semantic space as templates
  const map: Record<string, string> = {
    'ff-fair-die-bet': 'EV:uniform-d6',
    'ff-two-dice-two-ways': 'kdice:2',
    'ff-coin-die-or-nothing': 'cond:coin-H-die-T-zero',
    'ff-max-min-two-uniform': 'os:max:2',
    'ff-first-ace-indicators': 'first:52,4',
    'ff-distinct-after-2of6': 'distinct:6,2',
    'ff-coupon-full-6': 'coupon:6',
    'ff-rolls-until-first-6': 'geom:1/6',
    'ff-range-of-4-uniform': 'os:range:4',
    'ff-noodles-6-asymptotic': 'noodle:6',
    'ff-self-ref-dice-game': 'selfref:6:1-2-3',
    'ff-ants-500': 'os:max:500',
    'ff-coupon-last-2-of-6': 'couponfrom:6,2',
    'ff-sum-two-dice-given-six': 'sumgiven6',
  }
  return map[q.id] ?? `id:${q.id}`
}

// ───────────────────────── no-leak hint tokenizer ────────────────────────────
function rationalsInText(text: string): { tok: string; val: Big }[] {
  const out: { tok: string; val: Big }[] = []
  const fracRe = /(\d+)\/(\d+)/g
  let m: RegExpExecArray | null
  while ((m = fracRe.exec(text))) out.push({ tok: m[0], val: B(BigInt(m[1]), BigInt(m[2])) })
  const noFrac = text.replace(/\d+\/\d+/g, '  ')
  const numRe = /\d+\.\d+|\d+/g
  while ((m = numRe.exec(noFrac))) {
    const tk = m[0]
    if (tk.includes('.')) {
      const [ip, fp] = tk.split('.')
      out.push({ tok: tk, val: B(BigInt(ip + fp), 10n ** BigInt(fp.length)) })
    } else out.push({ tok: tk, val: B(BigInt(tk), 1n) })
  }
  return out
}
// does `text` state the EXACT final answer (an integer/fraction token == answer)?
function leaksExact(text: string, ans: Big): string | null {
  for (const r of rationalsInText(text)) {
    if (!r.tok.includes('.') && eqB(r.val, ans)) return r.tok
  }
  return null
}

// ════════════════════════════════ MAIN ══════════════════════════════════════
const pack = JSON.parse(readFileSync('interviews/course-expected-value.json', 'utf8'))
const questions: any[] = pack.questions

console.log('=== FULLY-INDEPENDENT RE-VERIFICATION (BigInt ground truth) ===\n')

let pass = 0
for (const q of questions) {
  const id = q.id
  const before = failures.length
  let gt: Big | null = null
  let ev: Rational | null = null
  try {
    gt = groundTruth(q)
  } catch (e: any) {
    fail(id, `ground-truth threw: ${e.message}`)
  }
  try {
    ev = engineValue(q, id)
  } catch (e: any) {
    fail(id, `engine re-call threw: ${e.message}`)
  }

  let ecB: Big | null = null
  let hidB: Big | null = null
  try {
    ecB = answerBig(q.engineCheck.answer)
  } catch (e: any) {
    fail(id, e.message + ' (engineCheck.answer)')
  }
  try {
    hidB = answerBig(q.hidden.answer)
  } catch (e: any) {
    fail(id, e.message + ' (hidden.answer)')
  }

  const evB = ev ? engBig(ev, id, 'engine') : null
  if (gt && evB && !eqB(gt, evB))
    fail(id, `BigInt ground-truth ${fmtB(gt)} != engine ${fmtB(evB)}`)
  if (gt && ecB && !eqB(gt, ecB))
    fail(id, `BigInt ground-truth ${fmtB(gt)} != engineCheck.answer ${q.engineCheck.answer}`)
  if (gt && hidB && !eqB(gt, hidB))
    fail(id, `BigInt ground-truth ${fmtB(gt)} != hidden.answer ${q.hidden.answer}`)
  if (ecB && hidB && !eqB(ecB, hidB)) fail(id, `engineCheck.answer != hidden.answer`)
  if (ecB && (ecB.n > BigInt(MAX) || ecB.d > BigInt(MAX))) fail(id, `stored answer exceeds MAX_SAFE`)

  // verified flag + module + no-float-token + range guards
  if (q.engineCheck?.verified !== true) fail(id, `engineCheck.verified !== true`)
  if (q.engineCheck?.module !== 'src/engine/expectation.ts') fail(id, `wrong engineModule`)
  const callsStr = JSON.stringify(q.engineCheck?.calls || [])
  if (/probabilityFromCounts|toRational\s*\(|Math\.|parseFloat|Number\s*\(/.test(callsStr))
    fail(id, `suspicious float/foreign-engine token in calls`)
  for (const mm of callsStr.matchAll(/noodleLoops\((\d+)\)/g))
    if (+mm[1] > 8) fail(id, `noodleLoops(${mm[1]}) exceeds n<=8 exact-rational range`)
  for (const mm of callsStr.matchAll(/(?:couponCollector|harmonic)\((\d+)\)/g))
    if (+mm[1] > 12) fail(id, `coupon/harmonic(${mm[1]}) exceeds N<=12 range`)

  const ok = failures.length === before
  if (ok) pass++
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${id.padEnd(42)} gt=${gt ? fmtB(gt) : '?'}  eng=${evB ? fmtB(evB) : '?'}  stored=${q.engineCheck.answer}`,
  )
}

// ───────────────── BigInt exactness cross-check (high-parameter) ─────────────
console.log('\n=== BigInt exactness cross-check (high-parameter, engine vs BigInt) ===')
const hi: { label: string; eng: Rational; big: Big }[] = [
  { label: 'couponCollector(10)', eng: couponCollector(10), big: couponBig(10) },
  { label: 'couponCollector(12)', eng: couponCollector(12), big: couponBig(12) },
  { label: 'distinctAfterDraws(6,6)', eng: distinctAfterDraws(6, 6), big: distinctClosedBig(6, 6) },
  { label: 'distinctAfterDraws(13,4)', eng: distinctAfterDraws(13, 4), big: distinctClosedBig(13, 4) },
  { label: 'noodleLoops(7)', eng: noodleLoops(7), big: noodleBig(7) },
  { label: 'noodleLoops(8)', eng: noodleLoops(8), big: noodleBig(8) },
]
let hiPass = 0
for (const c of hi) {
  const integral = Number.isInteger(c.eng.n) && Number.isInteger(c.eng.d)
  const safe = Math.abs(c.eng.n) <= MAX && Math.abs(c.eng.d) <= MAX
  const engb = integral ? B(BigInt(c.eng.n), BigInt(c.eng.d)) : null
  const exact = !!engb && eqB(engb, c.big) && integral && safe
  if (exact) hiPass++
  else fail('BIGINT', `${c.label}: engine=${c.eng.n}/${c.eng.d} bigint=${fmtB(c.big)} integral=${integral} safe=${safe}`)
  console.log(`${exact ? 'EXACT' : 'INEXACT'}  ${c.label.padEnd(26)} engine=${engb ? fmtB(engb) : c.eng.n + '/' + c.eng.d}  bigint=${fmtB(c.big)}`)
}
// confirm noodleLoops(100+) is NEVER engine-called (must stay verbal/asymptotic)
const allCalls = JSON.stringify(questions.map((q) => q.engineCheck?.calls))
const hundredNoodle = /noodleLoops\(\s*(100|[1-9]\d{2,})\s*\)/.test(allCalls)
console.log(`${hundredNoodle ? 'FAIL' : 'PASS'}  noodleLoops(100+) never engine-called (verbal/asymptotic only)`)
if (hundredNoodle) fail('ff-noodles-6-asymptotic', `noodleLoops(100+) engine-called`)

// ───────────────── structural / content gates ───────────────────────────────
console.log('\n=== Structural / content gates ===')
const sErr: string[] = []
const sOk = (cond: boolean, msg: string) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`)
  if (!cond) sErr.push(msg)
}
sOk(questions.length === 58 && pack.counts.total === 58, `total === 58 (got ${questions.length}/${pack.counts.total})`)
sOk(questions.length >= 50, `total >= 50`)
const fps = questions.map((q) => q.fingerprint)
const dupFp = fps.filter((f, i) => fps.indexOf(f) !== i)
sOk(dupFp.length === 0, `fingerprints unique (dups: ${[...new Set(dupFp)].join(',') || 'none'})`)
const tierSet = new Set(['hard', 'harder', 'brutal'])
sOk(questions.every((q) => tierSet.has(q.tier)), `all tiers ∈ {hard,harder,brutal} (floor=hard)`)
const byTier: Record<string, number> = {}
for (const q of questions) byTier[q.tier] = (byTier[q.tier] || 0) + 1
sOk(
  byTier.hard === pack.counts.byTier.hard && byTier.harder === pack.counts.byTier.harder && byTier.brutal === pack.counts.byTier.brutal,
  `byTier matches counts block (${JSON.stringify(byTier)})`,
)
const tmplN = questions.filter((q) => q.template).length
const ffN = questions.filter((q) => !q.template).length
sOk(tmplN === pack.counts.templated && ffN === pack.counts.freeForm, `templated/freeForm counts match (${tmplN}/${ffN})`)
const rubricAxes = ['correctness', 'approach', 'rigor', 'communication', 'speed']
const contentBad: string[] = []
for (const q of questions) {
  const src = q.source || ''
  if (!src.trim() || !(/Green Book|GB/.test(src) && /(§|p\.)/.test(src))) contentBad.push(`${q.id}:source`)
  const hl = q.hidden?.hintLadder
  if (!Array.isArray(hl) || hl.length !== 3) contentBad.push(`${q.id}:hintLadder=${hl?.length}`)
  const rub = q.hidden?.rubric || {}
  if (!rubricAxes.every((a) => typeof rub[a] === 'string' && rub[a].trim())) contentBad.push(`${q.id}:rubric`)
  if (!Array.isArray(q.followUps) || q.followUps.length < 1) contentBad.push(`${q.id}:followUps`)
  if (!q.prompt || !String(q.prompt).trim()) contentBad.push(`${q.id}:prompt`)
}
sOk(contentBad.length === 0, `every Q: GB source + 3 hints + 5 rubric axes + ≥1 followUp + prompt (bad: ${contentBad.join(', ') || 'none'})`)

// semantic dedup by canonical (fn,args) key
const keyMap = new Map<string, string[]>()
for (const q of questions) {
  const k = semKey(q)
  if (!keyMap.has(k)) keyMap.set(k, [])
  keyMap.get(k)!.push(q.id)
}
const semDups = [...keyMap.entries()].filter(([, ids]) => ids.length > 1)
sOk(semDups.length === 0, `no semantic dupes (same engine fn+args+ask) (${semDups.map(([k, ids]) => k + '=' + ids.join('&')).join('; ') || 'none'})`)

// asset hygiene
sOk(pack.version != null && pack.kind === 'interview-pack', `self-describing (version=${pack.version}, kind=${pack.kind})`)

// ───────────────── NO-ANSWER-LEAK hint-ladder spot-check ─────────────────────
console.log('\n=== NO-ANSWER-LEAK spot-check: does the near-reveal (hint[2]) state the final answer? ===')
let nearLeak = 0
const leakList: string[] = []
const earlyList: string[] = []
const cleanList: string[] = []
for (const q of questions) {
  let ans: Big
  try {
    ans = answerBig(q.hidden.answer)
  } catch {
    continue
  }
  const hl: string[] = q.hidden?.hintLadder || []
  const near = hl[2] || ''
  const hit = leaksExact(near, ans)
  if (hit) {
    nearLeak++
    leakList.push(`${q.id}  (ans ${q.hidden.answer}; near-reveal token "${hit}")`)
  } else {
    cleanList.push(`${q.id} (ans ${q.hidden.answer})`)
  }
  // also note if an EARLIER rung already leaks (nudge=0, stronger=1)
  for (let r = 0; r < 2; r++) {
    const eh = hl[r] && leaksExact(hl[r], ans)
    if (eh) earlyList.push(`${q.id} rung[${r}] token "${eh}" (ans ${q.hidden.answer})`)
  }
}
console.log(`near-reveal rungs that STATE the final exact answer: ${nearLeak}/${questions.length}`)
console.log(`earlier rungs (nudge/stronger) that already state the answer: ${earlyList.length}`)
if (nearLeak > 0) {
  console.log('Leaking near-reveals:')
  for (const l of leakList) console.log(`  LEAK  ${l}`)
}
if (earlyList.length > 0) {
  console.log('Early-rung leaks (nudge/stronger already give the answer):')
  for (const l of earlyList) console.log(`  EARLY ${l}`)
}
console.log(`Clean near-reveals (method-only, no answer stated): ${cleanList.length}`)
for (const l of cleanList) console.log(`  clean ${l}`)
const noLeakPass = nearLeak === 0
sOk(noLeakPass, `NO-LEAK: no near-reveal states the final numeric answer (${nearLeak} leak${nearLeak === 1 ? '' : 's'})`)

// ───────────────── tally ─────────────────────────────────────────────────────
console.log('\n=== TALLY ===')
console.log(`Independent BigInt recompute : ${pass}/${questions.length} questions PASS`)
console.log(`BigInt exactness (high-param): ${hiPass}/${hi.length} EXACT`)
console.log(`Structural/content gates     : ${sErr.length === 0 ? 'ALL PASS' : sErr.length + ' FAIL'}`)
console.log(`No-leak near-reveal spot-check: ${noLeakPass ? 'PASS' : `FAIL (${nearLeak} leaks)`}`)
const total = failures.length + sErr.length
if (total === 0) {
  console.log(`\nRESULT: ALL CHECKS PASS — ${pass}/${questions.length} independently reproduced, ${hiPass}/${hi.length} BigInt-exact, structural clean, no hint leaks.`)
  process.exit(0)
} else {
  console.log(`\nRESULT: ${total} FAILURE(S):`)
  for (const f of failures) console.log(`  - ${f}`)
  for (const s of sErr) console.log(`  - STRUCT: ${s}`)
  process.exit(1)
}
