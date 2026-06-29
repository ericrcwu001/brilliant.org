/// <reference types="node" />
// Independent verification of the Expected Value interview pack: re-derive every
// TEMPLATED question's answer from src/engine/expectation.ts and assert it matches
// the committed pack's engineCheck.answer AND that hidden.answer carries the
// engine value. Mirrors interviewPack.covariance.test.ts and
// interviewPack.optimalStopping.test.ts. Free-form questions (no `template`) are
// anchored manually (engineCheck.calls) — for them we assert verified === true and
// that hidden.answer carries the verified engineCheck.answer string.
//
// EXACT-RATIONAL contract: every templated answer is an exact rational string
// ("n/d" or an integer when d === 1) — never a float.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  expectedValue,
  totalExpectation,
  indicatorExpectation,
  harmonic,
  couponCollector,
  distinctAfterDraws,
  orderStatUniform,
  noodleLoops,
} from './expectation'
import { ratMul, ratSub, reduce } from './automaton'
import type { Rational } from './types'

interface Question {
  id: string
  tier: string
  template?: { id: string; params: Record<string, unknown> }
  engineCheck: { answer: string; verified: boolean; calls?: string[]; module?: string }
  hidden: { answer: string; hintLadder: string[] }
}

// "n" for integers, "n/d" for fractions — the pack's canonical rational rendering.
function formatRational(r: Rational): string {
  const { n, d } = reduce(r.n, r.d)
  return d === 1 ? String(n) : `${n}/${d}`
}

const R = (n: number, d = 1): Rational => ({ n, d })

// Parse a "n" / "n/d" fraction string into a reduced Rational.
function F(s: string): Rational {
  const m = String(s).match(/^(-?\d+)(?:\/(-?\d+))?$/)
  if (!m) throw new Error(`bad frac ${s}`)
  return reduce(parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 1)
}

// Extract the integer faces listed inside a face-set string, e.g. "{5,6}",
// "{1}", "odd{1,3,5}", "even{2,4,6}".
function faces(s: string): number[] {
  const m = String(s).match(/\{([^}]*)\}/)
  if (!m) throw new Error(`bad face set ${s}`)
  return m[1]
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => parseInt(t, 10))
}

// Mean of a list of faces as an exact Rational.
function meanFaces(fs: number[]): Rational {
  const sum = fs.reduce((a, b) => a + b, 0)
  return reduce(sum, fs.length)
}

// Parse a payout string "1@1/2+5@1/3+11@1/6" into a pmf for expectedValue.
function parsePayouts(s: string): { x: Rational; p: Rational }[] {
  return s.split('+').map((term) => {
    const [xStr, pStr] = term.split('@')
    return { x: F(xStr), p: F(pStr) }
  })
}

// Independent re-derivation from template params (no reading of engineCheck.calls).
function expected(templateId: string, p: Record<string, unknown>): string {
  const num = (k: string) => Number(p[k])
  const str = (k: string) => String(p[k])
  switch (templateId) {
    case 'tmpl-fair-value': {
      // The fair value is the raw EV of the game (price is the offered cost only).
      if (p.payouts !== undefined) {
        return formatRational(expectedValue(parsePayouts(str('payouts'))))
      }
      if (p.game !== undefined) {
        const game = str('game')
        if (game === 'max-of-two-d6') {
          // P(max = k) = (2k − 1)/36, k = 1..6.
          const pmf = Array.from({ length: 6 }, (_, i) => {
            const k = i + 1
            return { x: R(k), p: R(2 * k - 1, 36) }
          })
          return formatRational(expectedValue(pmf))
        }
        if (game === 'min-of-two-d6') {
          // P(min = k) = (13 − 2k)/36, k = 1..6.
          const pmf = Array.from({ length: 6 }, (_, i) => {
            const k = i + 1
            return { x: R(k), p: R(13 - 2 * k, 36) }
          })
          return formatRational(expectedValue(pmf))
        }
        throw new Error(`unknown fair-value game: ${game}`)
      }
      // Loaded d6: loadedFace carries loadedP, every other face carries otherP.
      const loadedFace = num('loadedFace')
      const loadedP = F(str('loadedP'))
      const otherP = F(str('otherP'))
      const pmf = Array.from({ length: 6 }, (_, i) => {
        const face = i + 1
        return { x: R(face), p: face === loadedFace ? loadedP : otherP }
      })
      return formatRational(expectedValue(pmf))
    }

    case 'tmpl-total-expectation': {
      const type = str('type')
      if (type === 'geometric') {
        // Geometric: win on each trial w.p. |winFaces|/d, else pay 1 and replay.
        const d = num('d')
        const win = faces(str('winFaces')).length
        const winP = reduce(win, d)
        const loseP = reduce(d - win, d)
        return formatRational(
          totalExpectation([
            { p: winP, value: R(1) },
            { p: loseP, restart: { add: R(1) } },
          ]),
        )
      }
      if (type === 'conditional') {
        // coin-H-die-T-dollar: H (½) → roll a fair d6 (E = 7/2); T (½) → win $1.
        if (str('branches') === 'coin-H-die-T-dollar') {
          return formatRational(
            totalExpectation([
              { p: R(1, 2), value: R(7, 2) },
              { p: R(1, 2), value: R(1) },
            ]),
          )
        }
        throw new Error(`unknown conditional branches: ${str('branches')}`)
      }
      if (type === 'self-ref') {
        // Roll d-sided die; on a `stop` face bank that face's mean and stop, on a
        // `reroll` face bank that face's mean and replay the SAME game.
        const d = num('d')
        const stop = faces(str('stop'))
        const reroll = faces(str('reroll'))
        const stopP = reduce(stop.length, d)
        const rerollP = reduce(reroll.length, d)
        return formatRational(
          totalExpectation([
            { p: stopP, value: meanFaces(stop) },
            { p: rerollP, restart: { add: meanFaces(reroll) } },
          ]),
        )
      }
      throw new Error(`unknown total-expectation type: ${type}`)
    }

    case 'tmpl-linearity': {
      const type = str('type')
      if (type === 'noodles') return formatRational(noodleLoops(num('n')))
      if (type === 'k-dice-sum') {
        // Sum of k fair d6: k · E[die] = k · 7/2.
        const die = expectedValue(Array.from({ length: 6 }, (_, i) => ({ x: R(i + 1), p: R(1, 6) })))
        return formatRational(ratMul(R(num('k')), die))
      }
      throw new Error(`unknown linearity type: ${type}`)
    }

    case 'tmpl-indicator': {
      if (str('type') === 'distinct') {
        return formatRational(distinctAfterDraws(num('N'), num('m')))
      }
      // First A-type card in a D-card deck: E = (D + 1)/(A + 1).
      const D = num('D')
      const A = num('A')
      return formatRational(indicatorExpectation(reduce(D + 1, A + 1)))
    }

    case 'tmpl-coupon-collector': {
      if (str('type') === 'from-holding') {
        // Already holding j of N distinct types; remaining ≡ N·H_{N−j}.
        const N = num('N')
        const j = num('j')
        return formatRational(ratMul(R(N), harmonic(N - j)))
      }
      return formatRational(couponCollector(num('N')))
    }

    case 'tmpl-order-statistics': {
      const n = num('n')
      const stat = str('stat')
      const os = orderStatUniform(n)
      if (stat === 'max' || stat === 'ants') return formatRational(os.max)
      if (stat === 'min') return formatRational(os.min)
      if (stat === 'range') return formatRational(ratSub(os.max, os.min))
      throw new Error(`unknown order-statistics stat: ${stat}`)
    }

    default:
      throw new Error(`unknown template id: ${templateId}`)
  }
}

const packPath = fileURLToPath(
  new URL('../../interviews/course-expected-value.json', import.meta.url),
)
const pack = JSON.parse(readFileSync(packPath, 'utf8')) as { questions: Question[] }

describe('expected-value interview pack — engine-verified', () => {
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
})
