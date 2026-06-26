// INDEPENDENT verification of interviews/course-combinatorics.json.
//
// This file is a FRESH re-implementation of every question's canonical answer
// straight from src/engine/combinatorics.ts. It deliberately does NOT import or
// call interviews/_build/build-combinatorics-pack.ts — the whole point is to
// re-derive every answer from scratch and cross-check the stored pool, so the
// build script's own assertions are never trusted.
//
// Run: ./node_modules/.bin/tsx interviews/_build/verify-pack.ts

import { readFileSync } from 'node:fs'
import {
  factorial,
  nPk,
  nCk,
  product,
  pascalRow,
  unionSize,
  inclusionExclusion,
  derangements,
  pigeonholeMin,
  forcesCollision,
  reduce,
  probabilityFromCounts,
} from '../../src/engine/combinatorics'

const SAFE = 9e15 // probabilityFromCounts JS-number ceiling per the contract

const raw = readFileSync(
  new URL('../course-combinatorics.json', import.meta.url),
  'utf8',
)
const pack = JSON.parse(raw)
const questions = pack.questions as any[]

// ── helpers ────────────────────────────────────────────────────────────────

const fail: string[] = [] // collected failure lines (defects)
function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
// Numeric/fraction/odds token present with DIGIT boundaries (so "76" does not
// match inside "760", but "11/30" or "4164:1" match exactly).
function present(haystack: string, token: string): boolean {
  const re = new RegExp(`(?<!\\d)${esc(token)}(?!\\d)`)
  return re.test(haystack)
}
function frac(n: bigint, d: bigint): string {
  const r = reduce(n, d)
  return `${r.n}/${r.d}`
}

type Expect = { tokens: string[]; boolFacts?: boolean[]; note?: string }

// ── per-question canonical recompute (fresh, from the engine) ────────────────

function expectFor(q: any): Expect {
  const id: string = q.id
  const tid: string | undefined = q.template?.id
  const p = q.template?.params ?? {}

  if (tid === 'tmpl-sequence-count') {
    const total = product(Array(p.n).fill(p.m)) // m^n
    const noRep = nPk(p.m, p.n)
    const rep = total - noRep
    return { tokens: [total.toString(), noRep.toString(), rep.toString()] }
  }

  if (tid === 'tmpl-perm-vs-comb') {
    const ordered = nPk(p.n, p.k)
    const unordered = nCk(p.n, p.k)
    const gap = factorial(p.k)
    return {
      tokens: [ordered.toString(), unordered.toString(), gap.toString()],
    }
  }

  if (tid === 'tmpl-derangement') {
    const all = derangements(p.n)
    const fac = factorial(p.n)
    const atLeast = fac - all
    return {
      tokens: [all.toString(), atLeast.toString(), frac(all, fac)],
    }
  }

  if (tid === 'tmpl-poker-hand') {
    const total = nCk(52, 5) // 2598960
    const counts: Record<string, bigint> = {
      fourOfAKind: product([13, 48]),
      fullHouse: product([13, 4, 12, 6]),
      twoPairs: product([78, 6, 6, 44]),
    }
    const c = counts[p.variant]
    const pr = probabilityFromCounts(Number(c), Number(total))
    const odds = reduce(total - c, c) // odds-against n:d
    return {
      tokens: [c.toString(), `${pr.n}/${pr.d}`, `${odds.n}:${odds.d}`],
    }
  }

  if (tid === 'tmpl-binomial-term') {
    if (p.variant === 'identity') {
      const sum = pascalRow(p.n).reduce((a, b) => a + b, 0n) // 2^n
      const mid = nCk(p.n, 4) // symmetry example used by the pack (n=10)
      return { tokens: [sum.toString(), mid.toString()] }
    }
    const coeff = nCk(p.n, p.k) * product(Array(p.k).fill(p.c)) // C(n,k)·c^k
    const rowSum = product(Array(p.n).fill(1 + p.c)) // (1+c)^n
    const sym = nCk(p.n, p.k) // = C(n,n-k)
    return {
      tokens: [coeff.toString(), rowSum.toString(), sym.toString()],
    }
  }

  if (tid === 'tmpl-pigeonhole') {
    const forced = forcesCollision(p.itemsCount, p.holes)
    const minNow = pigeonholeMin(p.itemsCount, p.holes)
    const threshold = (p.t - 1) * p.holes + 1
    return {
      tokens: [
        String(p.holes),
        String(minNow),
        String(p.t),
        String(threshold),
      ],
      boolFacts: [forced === true],
    }
  }

  if (tid === 'tmpl-dice-increasing') {
    const fav = nCk(6, p.k)
    const total = product(Array(p.k).fill(6)) // 6^k
    if (p.k > 6 || fav === 0n) return { tokens: ['0'] }
    const pr = probabilityFromCounts(Number(fav), Number(total))
    return { tokens: [`${pr.n}/${pr.d}`] }
  }

  if (tid === 'tmpl-inclusion-exclusion') {
    if (p.variant === '2set') {
      const union = unionSize(p.a, p.b, p.ab)
      const exactlyOne = BigInt(p.a) + BigInt(p.b) - 2n * BigInt(p.ab)
      const neither = BigInt(p.N) - union
      return {
        tokens: [
          union.toString(),
          exactlyOne.toString(),
          neither.toString(),
        ],
      }
    }
    if (p.variant === '3set') {
      const union = inclusionExclusion([
        { size: p.A, sign: 1 },
        { size: p.B, sign: 1 },
        { size: p.C, sign: 1 },
        { size: p.AB, sign: -1 },
        { size: p.AC, sign: -1 },
        { size: p.BC, sign: -1 },
        { size: p.ABC, sign: 1 },
      ])
      const none = BigInt(p.N) - union
      return { tokens: [union.toString(), none.toString()] }
    }
    if (p.variant === '3set-exactlyone') {
      const v =
        BigInt(p.A + p.B + p.C) -
        2n * BigInt(p.AB + p.AC + p.BC) +
        3n * BigInt(p.ABC)
      return { tokens: [v.toString()] }
    }
    if (p.variant === '3set-exactlytwo') {
      const v = BigInt(p.AB + p.AC + p.BC) - 3n * BigInt(p.ABC)
      return { tokens: [v.toString()] }
    }
  }

  // ── free-form ──────────────────────────────────────────────────────────
  switch (id) {
    case 'ff-birthday-23': {
      let n = 1
      // smallest n with 2·nPk(365,n) < 365^n  (pure BigInt, no float / no PFC)
      while (!(2n * nPk(365, n) < product(Array(n).fill(365)))) n++
      return { tokens: [String(n)] } // expect 23
    }
    case 'ff-root2-integer': {
      // S_n = 2·Σ_{j=0..n/2} C(n,2j)·2^j ; n=10
      let s = 0n
      for (let j = 0; 2 * j <= 10; j++) s += nCk(10, 2 * j) * product(Array(j).fill(2))
      s *= 2n
      return { tokens: [s.toString()] } // expect 6726
    }
    case 'ff-handshakes-26':
      return { tokens: ['26', '25'], boolFacts: [forcesCollision(26, 25) === true] }
    case 'ff-socks-pair-triple': {
      const holes = 6
      const pair = (2 - 1) * holes + 1 // 7
      const triple = (3 - 1) * holes + 1 // 13
      const ok = pigeonholeMin(pair, holes) === 2 && pigeonholeMin(triple, holes) === 3
      return { tokens: [String(pair), String(triple)], boolFacts: [ok] }
    }
    case 'ff-ants-force-four': {
      const a = pigeonholeMin(51, 25) // 3
      const b = (4 - 1) * 25 + 1 // 76
      return { tokens: [String(a), String(b)] }
    }
    case 'ff-base3-weighings': {
      const combos = product([3, 3, 3]) // 27
      const minN = pigeonholeMin(27, 7) // 4
      return {
        tokens: [combos.toString(), '7', String(minN)],
        boolFacts: [forcesCollision(27, 7) === true],
      }
    }
    case 'ff-dice-increasing-compare': {
      const p3 = probabilityFromCounts(Number(nCk(6, 3)), Number(product(Array(3).fill(6))))
      const p4 = probabilityFromCounts(Number(nCk(6, 4)), Number(product(Array(4).fill(6))))
      return { tokens: [`${p3.n}/${p3.d}`, `${p4.n}/${p4.d}`] }
    }
    case 'ff-aces-four-piles': {
      const fav = factorial(4) // 24
      const tot = product([4, 4, 4, 4]) // 256
      const pr = probabilityFromCounts(Number(fav), Number(tot))
      return { tokens: [fav.toString(), tot.toString(), `${pr.n}/${pr.d}`] }
    }
    case 'ff-subsets-2n': {
      const sum = pascalRow(12).reduce((a, b) => a + b, 0n) // 4096
      const sym = nCk(12, 3) // 220
      return { tokens: [sum.toString(), sym.toString()] }
    }
    case 'ff-letters-matching': {
      const fac = factorial(5)
      const all = derangements(5)
      const pAll = reduce(all, fac) // 11/30
      const pAtLeast = reduce(fac - all, fac) // 19/30
      const exactlyOne = nCk(5, 1) * derangements(4) // 45
      const pExactlyOne = reduce(exactlyOne, fac) // 3/8
      return {
        tokens: [`${pAll.n}/${pAll.d}`, `${pAtLeast.n}/${pAtLeast.d}`, `${pExactlyOne.n}/${pExactlyOne.d}`],
      }
    }
    case 'ff-poker-ranking': {
      const total = nCk(52, 5)
      const four = probabilityFromCounts(Number(product([13, 48])), Number(total))
      const full = probabilityFromCounts(Number(product([13, 4, 12, 6])), Number(total))
      const two = probabilityFromCounts(Number(product([78, 6, 6, 44])), Number(total))
      return {
        tokens: [`${four.n}/${four.d}`, `${full.n}/${full.d}`, `${two.n}/${two.d}`],
      }
    }
    case 'ff-52-factorial':
      return { tokens: [factorial(52).toString()] }
  }

  throw new Error(`No recompute rule for question id=${id} (template=${tid})`)
}

// ── main verification loop ───────────────────────────────────────────────────

let pass = 0
const seenFingerprints = new Set<string>()
const tierSet = new Set<string>()
const ALLOWED_TIERS = new Set(['hard', 'harder', 'brutal'])
const dedup = new Map<string, string>() // calls+answer signature -> first id
const leakFlags: string[] = []
let pfcMaxCount = 0

const tierTally: Record<string, number> = { hard: 0, harder: 0, brutal: 0 }
let templatedCount = 0
let freeFormCount = 0

console.log('═══ INDEPENDENT ENGINE RE-VERIFICATION (per question) ═══\n')

for (const q of questions) {
  const problems: string[] = []
  tierSet.add(q.tier)
  if (ALLOWED_TIERS.has(q.tier)) tierTally[q.tier]++
  if (q.template) templatedCount++
  else freeFormCount++

  // (a) recompute + value-consistency against BOTH stored answer strings
  let exp: Expect | null = null
  try {
    exp = expectFor(q)
  } catch (e: any) {
    problems.push(`recompute-threw: ${e.message}`)
  }
  const ecAns: string = q.engineCheck?.answer ?? ''
  const hidAns: string = q.hidden?.answer ?? ''
  if (exp) {
    for (const tok of exp.tokens) {
      if (!present(ecAns, tok)) problems.push(`engineCheck.answer missing token "${tok}"`)
      if (!present(hidAns, tok)) problems.push(`hidden.answer missing token "${tok}"`)
    }
    if (exp.boolFacts) {
      exp.boolFacts.forEach((b, i) => {
        if (!b) problems.push(`engine bool fact #${i} did not hold`)
      })
    }
  }

  // (b) engineCheck.answer === hidden.answer (formatting-identical sanity)
  if (ecAns !== hidAns) problems.push('engineCheck.answer !== hidden.answer')

  // (c) verified flag
  if (q.engineCheck?.verified !== true) problems.push('engineCheck.verified !== true')

  // (d) probabilityFromCounts overflow guard across this question's calls
  const callsStr = JSON.stringify(q.engineCheck?.calls ?? [])
  const pfc = [...callsStr.matchAll(/probabilityFromCounts\(\s*(\d+)\s*,\s*(\d+)\s*\)/g)]
  for (const m of pfc) {
    const a = Number(m[1])
    const b = Number(m[2])
    pfcMaxCount = Math.max(pfcMaxCount, a, b)
    if (a > SAFE || b > SAFE) problems.push(`probabilityFromCounts arg > 9e15: ${m[0]}`)
  }
  // birthday / 52! must NOT route huge values through probabilityFromCounts
  if ((q.id === 'ff-birthday-23' || q.id === 'ff-52-factorial') && /probabilityFromCounts/.test(callsStr)) {
    problems.push('huge-magnitude question uses probabilityFromCounts (should be BigInt path)')
  }

  // (e) structure: fingerprint uniqueness, hintLadder=3, rubric 5 axes, followUps>=1, source GB
  if (seenFingerprints.has(q.fingerprint)) problems.push(`duplicate fingerprint ${q.fingerprint}`)
  seenFingerprints.add(q.fingerprint)
  if (!ALLOWED_TIERS.has(q.tier)) problems.push(`illegal tier ${q.tier}`)
  if (q.hidden?.hintLadder?.length !== 3) problems.push(`hintLadder length ${q.hidden?.hintLadder?.length} != 3`)
  const RUBRIC = ['correctness', 'approach', 'rigor', 'communication', 'speed']
  const rk = q.hidden?.rubric ? Object.keys(q.hidden.rubric) : []
  for (const ax of RUBRIC) if (!rk.includes(ax)) problems.push(`rubric missing axis ${ax}`)
  if (!(q.followUps?.length >= 1)) problems.push('no followUps')
  if (!/green book/i.test(q.source ?? '') || !/(§|p\.)/.test(q.source ?? ''))
    problems.push(`source not GB-anchored: ${JSON.stringify(q.source)}`)

  // (f) semantic-dup signature (same engine calls AND same answer)
  const sig = callsStr.replace(/\s/g, '') + '||' + ecAns.replace(/\s/g, '')
  if (dedup.has(sig)) problems.push(`semantic-duplicate of ${dedup.get(sig)} (same calls+answer)`)
  else dedup.set(sig, q.id)

  // (g) no-leak scan: does the near-reveal (rung 3) literally state a canonical token?
  const rung3: string = q.hidden?.hintLadder?.[2] ?? ''
  if (exp) {
    for (const tok of exp.tokens) {
      // ignore trivially-small tokens that aren't really "the answer"
      if (tok.length <= 1) continue
      if (present(rung3, tok)) leakFlags.push(`${q.id}: rung3 contains "${tok}"`)
    }
  }

  if (problems.length === 0) {
    pass++
    console.log(`PASS  ${q.id}`)
  } else {
    for (const pr of problems) fail.push(`${q.id}: ${pr}`)
    console.log(`FAIL  ${q.id}\n      - ${problems.join('\n      - ')}`)
  }
}

// ── pool-level structural cross-checks ───────────────────────────────────────

console.log('\n═══ POOL-LEVEL CHECKS ═══')
const structProblems: string[] = []
if (questions.length < 50) structProblems.push(`total ${questions.length} < 50`)
if (pack.counts?.total !== questions.length)
  structProblems.push(`counts.total ${pack.counts?.total} != ${questions.length}`)
for (const t of ['hard', 'harder', 'brutal'])
  if (pack.counts?.byTier?.[t] !== tierTally[t])
    structProblems.push(`counts.byTier.${t} ${pack.counts?.byTier?.[t]} != ${tierTally[t]}`)
if (pack.counts?.templated !== templatedCount)
  structProblems.push(`counts.templated ${pack.counts?.templated} != ${templatedCount}`)
if (pack.counts?.freeForm !== freeFormCount)
  structProblems.push(`counts.freeForm ${pack.counts?.freeForm} != ${freeFormCount}`)
if (seenFingerprints.size !== questions.length)
  structProblems.push(`unique fingerprints ${seenFingerprints.size} != ${questions.length}`)
for (const t of tierSet) if (!ALLOWED_TIERS.has(t)) structProblems.push(`unexpected tier ${t}`)
// floor = hard means no tier easier than hard exists (only the 3 allowed appear)
const easier = [...tierSet].filter((t) => !ALLOWED_TIERS.has(t))
if (easier.length) structProblems.push(`tiers below floor present: ${easier.join(',')}`)

console.log(`total questions      : ${questions.length} (>=50 ✔)`)
console.log(`tiers present        : ${[...tierSet].sort().join(', ')}`)
console.log(`byTier recomputed    : ${JSON.stringify(tierTally)}`)
console.log(`templated/freeForm   : ${templatedCount}/${freeFormCount}`)
console.log(`unique fingerprints  : ${seenFingerprints.size}`)
console.log(`max PFC count seen   : ${pfcMaxCount} (ceiling 9e15)`) 
console.log(`semantic-dup sigs    : ${questions.length - dedup.size} collision(s)`) 

if (structProblems.length) for (const sp of structProblems) fail.push(`POOL: ${sp}`)

// ── leak report (manual-review aid; not an auto-fail) ────────────────────────
console.log('\n═══ NO-LEAK NEAR-REVEAL SCAN (rung 3 vs canonical tokens) ═══')
if (leakFlags.length === 0) console.log('clean — no near-reveal rung literally states a canonical answer token.')
else { console.log('REVIEW (rung 3 contains a canonical token):'); for (const l of leakFlags) console.log('  - ' + l) }

// ── final tally ──────────────────────────────────────────────────────────────
console.log('\n═══ FINAL TALLY ═══')
console.log(`Independently engine-reproduced: ${pass}/${questions.length}`)
if (fail.length) {
  console.log(`\nDEFECTS (${fail.length}):`)
  for (const f of fail) console.log('  ✗ ' + f)
  console.log(`\nRESULT: FAIL`)
  process.exit(1)
} else {
  console.log(`RESULT: ALL ${pass}/${questions.length} PASS — every answer independently reproduced from the engine.`)
}
