/// <reference types="node" />
// Independent verification of the Pattern Hitting Times interview pack: re-derive
// every TEMPLATED question's answer from the real engines and assert it matches
// the committed pack's engineCheck.answer AND hidden.answer. Mirrors
// interviewPack.covariance.test.ts and interviewPack.optimalStopping.test.ts.
// Free-form questions (no template) are anchored manually (engineCheck.calls) —
// for them we assert verified + that hidden.answer carries the engineCheck.answer.
//
// This is the "state-machine recurrence" pack and spans four pure engines:
//   - automaton.ts  (buildAutomaton expected hitting times; biased waits re-solve
//                     the same KMP linear system over EXACT rationals to avoid the
//                     float round-trip that toRational(p) introduces)
//   - race.ts       (penneyOdds / bestBeater — Penney's-game win odds)
//   - walk.ts       (buildWalk — Gambler's-ruin reach/duration)
//   - correlation.ts(expectedWaitFair — Σ 2^k overlap shortcut, fair coin)
//
// EXACT-RATIONAL contract: every templated answer is an exact integer or "n/d"
// string — never a float token.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  buildAutomaton,
  prefixFunction,
  solveLinearSystem,
  reduce,
  ratAdd,
  ratSub,
} from './automaton'
import { penneyOdds, bestBeater } from './race'
import { buildWalk } from './walk'
import { expectedWaitFair } from './correlation'
import type { Rational, StateId } from './types'

interface Question {
  id: string
  tier: string
  template?: { id: string; params: Record<string, unknown> }
  engineCheck: { answer: string; verified: boolean; calls: string[]; module: string }
  hidden: { answer: string; hintLadder: string[] }
}

// Canonical exact-rational string: integers print bare, otherwise "n/d".
// Matches the ratStr convention used inside automaton.ts.
function fmt(r: Rational): string {
  return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`
}

const SYMBOLS = ['H', 'T'] as const
type Sym = (typeof SYMBOLS)[number]

// KMP next-state (longest matched-prefix length after observing c from `state`).
// Mirrors the private nextState() in automaton.ts so the biased re-solve uses the
// same transition structure buildAutomaton uses.
function nextState(pattern: string, pi: number[], state: number, c: Sym): number {
  let k = state
  while (true) {
    if (c === pattern[k]) return k + 1
    if (k === 0) return 0
    k = pi[k - 1]
  }
}

// Exact-rational expected wait E0 for `pattern` on a coin with P(H) = pNum/pDen.
// Re-builds the SAME linear system buildAutomaton solves (E_i = 1 + Σ_c P(c)·E_next),
// but with exact rational probabilities — buildAutomaton itself routes p through
// toRational(pNum/pDen), which is lossy for thirds/fifths and yields a float E0.
// This is the "first-step solve via prefixFunction + solveLinearSystem" the pack's
// engineCheck.calls describes, done exactly.
function expectedWaitRational(pattern: string, pNum: number, pDen: number): Rational {
  const L = pattern.length
  const pi = prefixFunction(pattern)
  const prob: Record<Sym, Rational> = {
    H: reduce(pNum, pDen),
    T: reduce(pDen - pNum, pDen),
  }
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
  return solved[0] // E0 = expected wait until the pattern first appears
}

// Independent re-derivation from template params (no reading of engineCheck.answer).
function expected(templateId: string, p: Record<string, unknown>): string {
  const num = (k: string) => Number(p[k])
  const str = (k: string) => String(p[k])
  switch (templateId) {
    // Fair-coin expected wait straight from the automaton hitting times.
    case 'tmpl-pattern-wait':
      return String(buildAutomaton(str('pattern'), 0.5).expectedTimes['E0' as StateId])

    // Biased-coin expected wait — exact rational re-solve of the automaton system.
    case 'tmpl-biased-wait':
      return fmt(expectedWaitRational(str('pattern'), num('pNum'), num('pDen')))

    // Penney's game: P(B appears before A), fair coin, via Conway odds.
    case 'tmpl-penney-race':
      return fmt(penneyOdds(str('a'), str('b')).bBeatsA)

    // Second mover plays the optimal counter to A, then reads B's win prob.
    case 'tmpl-second-mover': {
      const a = str('a')
      return fmt(penneyOdds(a, bestBeater(a)).bBeatsA)
    }

    // Gambler's ruin on 0..N: reach-probability or expected duration from start i.
    case 'tmpl-gamblers-ruin': {
      const walk = buildWalk(num('N'), num('pNum') / num('pDen'))
      const i = num('i')
      const arr = str('query') === 'reach' ? walk.reachProb : walk.duration
      return fmt(arr[i])
    }

    // Overlap shortcut: fair-coin expected wait = Σ 2^k over the pattern's borders.
    case 'tmpl-overlap-wait':
      return String(expectedWaitFair(str('pattern')))

    default:
      throw new Error(`unknown template id: ${templateId}`)
  }
}

const packPath = fileURLToPath(
  new URL('../../interviews/course-pattern-hitting-times.json', import.meta.url),
)
const pack = JSON.parse(readFileSync(packPath, 'utf8')) as { questions: Question[] }

describe('pattern-hitting-times interview pack — engine-verified', () => {
  for (const q of pack.questions) {
    it(`${q.id}`, () => {
      expect(q.engineCheck.verified, 'verified flag').toBe(true)
      expect(q.hidden.hintLadder.length, 'hint ladder rungs').toBe(3)
      // EXACT-RATIONAL: no bare float token anywhere in the answer.
      for (const tok of q.engineCheck.answer.split(/[\s,=]+/)) {
        expect(/^-?\d+\.\d+$/.test(tok), `float token "${tok}" in ${q.id}`).toBe(false)
      }
      if (q.template) {
        const want = expected(q.template.id, q.template.params)
        expect(q.engineCheck.answer, `${q.id} engineCheck`).toBe(want)
        expect(q.hidden.answer, `${q.id} hidden contains engine value`).toContain(want)
      } else {
        // free-form: hidden.answer must carry the verified engineCheck.answer string.
        expect(q.hidden.answer, `${q.id} free-form hidden`).toContain(q.engineCheck.answer)
      }
    })
  }

  it('pool is 50+ questions across all three tiers', () => {
    expect(pack.questions.length).toBeGreaterThanOrEqual(50)
    const tiers = new Set(pack.questions.map((q) => q.tier))
    expect(tiers).toEqual(new Set(['hard', 'harder', 'brutal']))
  })

  it('all fingerprints are unique', () => {
    const fps = pack.questions.map((q) => (q as unknown as { fingerprint: string }).fingerprint)
    expect(new Set(fps).size).toBe(fps.length)
  })
})
