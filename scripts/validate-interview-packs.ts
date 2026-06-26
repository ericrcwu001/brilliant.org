// Validates every committed interview pack (interviews/course-*.json) against
// the shared Zod schema, recomputes each question's answer from the real engines
// and asserts exact-string equality with engineCheck.answer, then enforces the
// structural + NO-LEAK gates. Exits non-zero on any failure. Hooked as
// `validate:interviews` in package.json; the per-pack standalone verifiers
// (interviews/_build/verify-*.ts) do the deeper BigInt 4-way + free-form checks.
//
// Mirrors scripts/validate-fixtures.ts (fail(), numbered sections, z.prettifyError).

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { InterviewPackSchema } from '../src/content/interviewPack'
import type { InterviewPack, Question } from '../src/content/interviewPack'
import type { Rational } from '../src/engine/types'
import {
  buildAutomaton,
  prefixFunction,
  solveLinearSystem,
  ratAdd,
  ratSub,
  ratMul,
  reduce,
} from '../src/engine/automaton'
import { penneyOdds, bestBeater } from '../src/engine/race'
import { buildWalk } from '../src/engine/walk'
import { expectedWaitFair } from '../src/engine/correlation'
import {
  expectedValue,
  totalExpectation,
  indicatorExpectation,
  harmonic,
  couponCollector,
  distinctAfterDraws,
  orderStatUniform,
  noodleLoops,
} from '../src/engine/expectation'

const interviewsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'interviews')

function fail(msg: string): never {
  console.error(`\n✗ ${msg}`)
  process.exit(1)
}

// ── shared helpers ─────────────────────────────────────────────────────────────
const R = (n: number, d = 1): Rational => ({ n, d })
const DIE: { x: Rational; p: Rational }[] = [1, 2, 3, 4, 5, 6].map((x) => ({ x: R(x), p: R(1, 6) }))
function ratStr(r: Rational): string {
  return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`
}
function parseFrac(s: string | number): Rational {
  if (typeof s === 'number') return R(s)
  const m = String(s).trim().match(/^(-?\d+)(?:\/(-?\d+))?$/)
  if (!m) throw new Error(`unparseable fraction: ${s}`)
  return reduce(parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 1)
}
const intsIn = (s: string): number[] => (s.match(/\d+/g) || []).map((x) => parseInt(x, 10))
function meanOfSet(ints: number[]): Rational {
  return reduce(
    ints.reduce((a, b) => a + b, 0),
    ints.length,
  )
}

// Exact rational pattern-wait for a biased coin (p as a Rational), mirroring
// buildAutomaton's first-step linear system but WITHOUT the lossy toRational(p)
// path that buildAutomaton uses for non-(2/5)-denominator p (e.g. 1/3). Fair
// coin (p=1/2) goes through buildAutomaton directly (its toRational(0.5) is exact).
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

// ── per-question recompute → exact string, or null when no strategy applies ────
function recomputeEV(q: Question): Rational | null {
  const t = q.template?.id
  const p = (q.template?.params ?? {}) as Record<string, never> & Record<string, unknown>
  const num = (k: string): number => Number(p[k])
  const str = (k: string): string => String(p[k])
  if (t === 'tmpl-fair-value') {
    let pmf: { x: Rational; p: Rational }[]
    if (p.game === 'max-of-two-d6') pmf = [1, 2, 3, 4, 5, 6].map((k) => ({ x: R(k), p: reduce(2 * k - 1, 36) }))
    else if (p.game === 'min-of-two-d6') pmf = [1, 2, 3, 4, 5, 6].map((k) => ({ x: R(k), p: reduce(13 - 2 * k, 36) }))
    else if (p.payouts)
      pmf = str('payouts')
        .split('+')
        .map((term) => {
          const [v, pr] = term.split('@')
          return { x: parseFrac(v), p: parseFrac(pr) }
        })
    else {
      const lf = num('loadedFace')
      const lp = parseFrac(str('loadedP'))
      const op = parseFrac(str('otherP'))
      pmf = [1, 2, 3, 4, 5, 6].map((k) => ({ x: R(k), p: k === lf ? lp : op }))
    }
    return expectedValue(pmf)
  }
  if (t === 'tmpl-linearity') {
    if (p.type === 'noodles') return noodleLoops(num('n'))
    if (p.type === 'k-dice-sum') return ratMul(R(num('k')), expectedValue(DIE))
    return null
  }
  if (t === 'tmpl-indicator') {
    if (p.type === 'distinct') return distinctAfterDraws(num('N'), num('m'))
    return ratAdd(R(1), ratMul(R(num('D') - num('A')), indicatorExpectation(reduce(1, num('A') + 1))))
  }
  if (t === 'tmpl-total-expectation') {
    if (p.type === 'geometric') {
      const w = intsIn(str('winFaces')).length
      const d = num('d')
      return totalExpectation([
        { p: reduce(w, d), value: R(1) },
        { p: reduce(d - w, d), restart: { add: R(1) } },
      ])
    }
    if (p.type === 'conditional')
      return totalExpectation([
        { p: R(1, 2), value: expectedValue(DIE) },
        { p: R(1, 2), value: R(1) },
      ])
    if (p.type === 'self-ref') {
      const stop = intsIn(str('stop'))
      const reroll = intsIn(str('reroll'))
      const d = num('d')
      return totalExpectation([
        { p: reduce(stop.length, d), value: meanOfSet(stop) },
        { p: reduce(reroll.length, d), restart: { add: meanOfSet(reroll) } },
      ])
    }
    return null
  }
  if (t === 'tmpl-coupon-collector') {
    if (p.type === 'full-set') return couponCollector(num('N'))
    if (p.type === 'from-holding') return ratMul(R(num('N')), harmonic(num('N') - num('j')))
    return null
  }
  if (t === 'tmpl-order-statistics') {
    const os = orderStatUniform(num('n'))
    if (p.stat === 'max' || p.stat === 'ants') return os.max
    if (p.stat === 'min') return os.min
    if (p.stat === 'range') return ratSub(os.max, os.min)
    return null
  }
  // free-form EV questions
  switch (q.id) {
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
      return expectedValue(
        [7, 8, 9, 10, 11].map((x) => ({ x: R(x), p: R(2, 11) })).concat([{ x: R(12), p: R(1, 11) }]),
      )
    default:
      return null
  }
}

function recomputePHT(q: Question): Rational | null {
  const mod = q.engineCheck.module
  const t = q.template?.id
  const p = (q.template?.params ?? {}) as Record<string, unknown>
  const num = (k: string): number => Number(p[k])
  const str = (k: string): string => String(p[k])
  if (mod === 'src/engine/automaton.ts') {
    if (t === 'tmpl-pattern-wait') return reduce(buildAutomaton(str('pattern'), 0.5).expectedTimes.E0, 1)
    if (t === 'tmpl-biased-wait') return patternWaitRational(str('pattern'), reduce(num('pNum'), num('pDen')))
    return null
  }
  if (mod === 'src/engine/race.ts') {
    if (t === 'tmpl-penney-race') return penneyOdds(str('a'), str('b')).bBeatsA
    if (t === 'tmpl-second-mover') return penneyOdds(str('a'), bestBeater(str('a'))).bBeatsA
    return null
  }
  if (mod === 'src/engine/walk.ts') {
    if (t === 'tmpl-gamblers-ruin') {
      const w = buildWalk(num('N'), num('pNum') / num('pDen'))
      return str('query') === 'duration' ? w.duration[num('i')] : w.reachProb[num('i')]
    }
    return null
  }
  if (mod === 'src/engine/correlation.ts') {
    if (t === 'tmpl-overlap-wait') return reduce(expectedWaitFair(str('pattern')), 1)
    return null
  }
  return null
}

function recomputeAnswer(q: Question): string | null {
  const r =
    q.engineCheck.module === 'src/engine/expectation.ts' ? recomputeEV(q) : recomputePHT(q)
  return r === null ? null : ratStr(r)
}

// ── NO-LEAK guard (verbatim from build-expected-value-pack.ts:1064–1078) ───────
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

// ── 1. Schema validation ───────────────────────────────────────────────────────
const packFiles = readdirSync(interviewsDir)
  .filter((f) => /^course-.*\.json$/.test(f))
  .sort()
if (packFiles.length === 0) fail('No interview packs found in interviews/')

const packs: InterviewPack[] = packFiles.map((f) => {
  const json = JSON.parse(readFileSync(join(interviewsDir, f), 'utf8'))
  const result = InterviewPackSchema.safeParse(json)
  if (!result.success) {
    console.error(`\n✗ ${f} failed schema validation:\n`)
    console.error(z.prettifyError(result.error))
    process.exit(1)
  }
  console.log(`✓ schema: ${f}`)
  return result.data
})

// ── 2. Per-question engine cross-check ────────────────────────────────────────
for (const pack of packs) {
  let crossChecked = 0
  for (const q of pack.questions) {
    let recomputed: string | null
    try {
      recomputed = recomputeAnswer(q)
    } catch (e) {
      fail(`${pack.courseId}/${q.id}: engine recompute threw: ${(e as Error).message}`)
    }
    if (recomputed !== null && recomputed !== q.engineCheck.answer) {
      fail(
        `${pack.courseId}/${q.id}: engine recompute="${recomputed}" engineCheck.answer="${q.engineCheck.answer}"`,
      )
    }
    if (recomputed !== null) crossChecked++
  }
  console.log(`✓ engine cross-check: ${pack.courseId} (${crossChecked}/${pack.questions.length} questions recomputed)`)
}

// ── 3. Structural gates (per-pack) ────────────────────────────────────────────
for (const pack of packs) {
  pack.questions.forEach((q) => {
    if (!q.engineCheck.verified) fail(`${pack.courseId}/${q.id}: engineCheck.verified !== true`)
  })

  const fps = pack.questions.map((q) => q.fingerprint)
  if (new Set(fps).size !== fps.length) {
    const dups = [...new Set(fps.filter((f, i) => fps.indexOf(f) !== i))]
    fail(`${pack.courseId}: duplicate fingerprints: ${dups.join(', ')}`)
  }

  pack.questions.forEach((q) => {
    if (!['hard', 'harder', 'brutal'].includes(q.tier)) fail(`${pack.courseId}/${q.id}: invalid tier "${q.tier}"`)
    if (q.hidden.hintLadder.length !== 3)
      fail(`${pack.courseId}/${q.id}: hintLadder has ${q.hidden.hintLadder.length} rungs (expected 3)`)
    const r = q.hidden.rubric
    if (!r.correctness || !r.approach || !r.rigor || !r.communication || !r.speed)
      fail(`${pack.courseId}/${q.id}: missing rubric axis`)
    if (q.followUps.length < 1) fail(`${pack.courseId}/${q.id}: no followUps`)
    if (!q.source.trim()) fail(`${pack.courseId}/${q.id}: empty source`)
    if (!q.prompt.trim()) fail(`${pack.courseId}/${q.id}: empty prompt`)
  })

  if (pack.questions.length !== pack.counts.total)
    fail(`${pack.courseId}: counts.total=${pack.counts.total} but ${pack.questions.length} questions present`)
  const byTier = { hard: 0, harder: 0, brutal: 0 }
  pack.questions.forEach((q) => {
    byTier[q.tier]++
  })
  ;(['hard', 'harder', 'brutal'] as const).forEach((t) => {
    if (byTier[t] !== pack.counts.byTier[t])
      fail(`${pack.courseId}: counts.byTier.${t}=${pack.counts.byTier[t]} but got ${byTier[t]}`)
  })
  const templated = pack.questions.filter((q) => q.template).length
  const freeForm = pack.questions.filter((q) => !q.template).length
  if (templated !== pack.counts.templated)
    fail(`${pack.courseId}: counts.templated=${pack.counts.templated} but got ${templated}`)
  if (freeForm !== pack.counts.freeForm)
    fail(`${pack.courseId}: counts.freeForm=${pack.counts.freeForm} but got ${freeForm}`)

  // NO-LEAK: hint rungs 2 & 3 must be method-only (not state the final answer).
  pack.questions.forEach((q) => {
    const ans = q.engineCheck.answer
    if (hintRungLeaks(ans, q.hidden.hintLadder[1]))
      fail(`${pack.courseId}/${q.id}: hint rung 2 (stronger) leaks final answer "${ans}"`)
    if (hintRungLeaks(ans, q.hidden.hintLadder[2]))
      fail(`${pack.courseId}/${q.id}: hint rung 3 (near-reveal) leaks final answer "${ans}"`)
  })

  console.log(`✓ structural gates: ${pack.courseId}`)
}

// ── 4. Drift guard: functions/src copies must be byte-identical ────────────────
// The functions package can't import across its rootDir, so it bundles verbatim
// copies of the shared modules. If they drift, the deployed runtime parses packs
// with a different schema than this validator — a silent correctness/leak hazard.
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
for (const mod of ['interviewPack.ts', 'interviewDraw.ts']) {
  const canonical = readFileSync(join(repoRoot, 'src', 'content', mod), 'utf8')
  const copy = readFileSync(join(repoRoot, 'functions', 'src', mod), 'utf8')
  if (canonical !== copy)
    fail(
      `functions/src/${mod} has drifted from src/content/${mod} — re-copy: ` +
        `cp src/content/${mod} functions/src/${mod}`,
    )
  console.log(`✓ functions copy in sync: ${mod}`)
}

console.log('\nAll packs valid.')
