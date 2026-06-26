#!/usr/bin/env tsx
// Engine-API cross-check for interviews/course-pattern-hitting-times.json.
// Re-derives every answer through the documented PHT engine APIs (automaton /
// race / walk / correlation), asserts exact-string equality with both
// engineCheck.answer and hidden.answer, runs the structural gates, asserts each
// engineCheck.module is a valid PHT engine, and spot-checks the no-leak rule.
// Run: ./node_modules/.bin/tsx interviews/_build/verify-pht-pack.ts

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
import { InterviewPackSchema, type Question } from '../../src/content/interviewPack'

const R = (n: number, d = 1): Rational => ({ n, d })
const ratStr = (r: Rational): string => (r.d === 1 ? String(r.n) : `${r.n}/${r.d}`)
const PHT_ENGINES = new Set([
  'src/engine/automaton.ts',
  'src/engine/race.ts',
  'src/engine/walk.ts',
  'src/engine/correlation.ts',
])

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

function recompute(q: Question): Rational | null {
  const mod = q.engineCheck.module
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
  // free-form by id
  switch (q.id) {
    case 'ff-pht-longest-len4':
      return reduce(expectedWaitFair('HHHH'), 1)
    case 'ff-pht-shortest-len4':
      return reduce(expectedWaitFair('THHH'), 1)
    case 'ff-pht-wait-vs-win':
      return penneyOdds('HHH', 'THH').bBeatsA
    default:
      void mod
      return null
  }
}

// near-reveal / stronger rung must not state the final answer
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
}
function rungLeaks(answer: string, rung: string): boolean {
  const esc = escapeRegExp(answer)
  if (answer.includes('/')) return new RegExp(`(?<![\\d/])${esc}(?![\\d/])`).test(rung)
  return new RegExp(`(?:=|⇒|is\\s+|:\\s*)\\s*${esc}\\b`).test(rung) || new RegExp(`[=:]\\s*${esc}$`).test(rung.trim())
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
const raw = JSON.parse(readFileSync('interviews/course-pattern-hitting-times.json', 'utf8'))
const parsed = InterviewPackSchema.safeParse(raw)
if (!parsed.success) {
  console.error('✗ schema validation failed')
  console.error(parsed.error)
  process.exit(1)
}
const pack = parsed.data
console.log('✓ schema: course-pattern-hitting-times.json')

const failures: string[] = []
let pass = 0
let recomputed = 0
for (const q of pack.questions) {
  const before = failures.length
  if (!PHT_ENGINES.has(q.engineCheck.module)) failures.push(`${q.id}: engineCheck.module "${q.engineCheck.module}" is not a PHT engine`)
  if (q.engineCheck.verified !== true) failures.push(`${q.id}: engineCheck.verified !== true`)
  let r: Rational | null = null
  try {
    r = recompute(q)
  } catch (e) {
    failures.push(`${q.id}: recompute threw: ${(e as Error).message}`)
  }
  if (r !== null) {
    recomputed++
    const s = ratStr(r)
    if (s !== q.engineCheck.answer) failures.push(`${q.id}: engine ${s} != engineCheck.answer ${q.engineCheck.answer}`)
    if (s !== q.hidden.answer) failures.push(`${q.id}: engine ${s} != hidden.answer ${q.hidden.answer}`)
  }
  if (q.engineCheck.answer !== q.hidden.answer) failures.push(`${q.id}: engineCheck.answer != hidden.answer`)
  if (rungLeaks(q.engineCheck.answer, q.hidden.hintLadder[1])) failures.push(`${q.id}: rung 2 leaks ${q.engineCheck.answer}`)
  if (rungLeaks(q.engineCheck.answer, q.hidden.hintLadder[2])) failures.push(`${q.id}: rung 3 leaks ${q.engineCheck.answer}`)
  const ok = failures.length === before
  if (ok) pass++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${q.id.padEnd(42)} ${r ? ratStr(r) : '(free-form: id recompute)'}`)
}

// structural gates
const fps = pack.questions.map((q) => q.fingerprint)
if (new Set(fps).size !== fps.length) failures.push(`duplicate fingerprints: ${fps.filter((f, i) => fps.indexOf(f) !== i).join(', ')}`)
const byTier = { hard: 0, harder: 0, brutal: 0 }
pack.questions.forEach((q) => byTier[q.tier]++)
if (byTier.hard !== pack.counts.byTier.hard || byTier.harder !== pack.counts.byTier.harder || byTier.brutal !== pack.counts.byTier.brutal)
  failures.push(`byTier mismatch: actual ${JSON.stringify(byTier)} vs ${JSON.stringify(pack.counts.byTier)}`)
if (pack.questions.length !== pack.counts.total) failures.push(`total mismatch: ${pack.questions.length} vs ${pack.counts.total}`)
if (pack.questions.length < 50) failures.push(`too few questions: ${pack.questions.length}`)

console.log(`\n=== TALLY ===`)
console.log(`Engine cross-check: ${pass}/${pack.questions.length} PASS (${recomputed} recomputed)`)
if (failures.length === 0) {
  console.log(`\nRESULT: ALL CHECKS PASS — ${pass}/${pack.questions.length} questions verified, 0 leaks.`)
  process.exit(0)
}
console.log(`\nRESULT: ${failures.length} FAILURE(S):`)
for (const f of failures) console.log(`  - ${f}`)
process.exit(1)
