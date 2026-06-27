/// <reference types="node" />
// Independent verification of the Covariance & Correlation interview pack:
// re-derive every TEMPLATED question's answer from src/engine/covariance.ts and
// assert it matches the committed pack's engineCheck.answer AND hidden.answer.
// Mirrors interviewPack.optimalStopping.test.ts. Free-form questions are anchored
// manually (engineCheck.calls) — for them we only assert verified + hint shape +
// that hidden.answer carries the verified engineCheck.answer string.
//
// EXACT-RATIONAL contract: every templated answer is an exact rational string
// ("n/d", integer, "min,max" range pair, or a "Cov=…, ρ=…" gloss) — never a float.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  variance,
  covariance,
  covarianceIndicators,
  varianceOfSum,
  covBilinear,
  rho,
  rhoSquared,
  corrRange,
  psdDeterminant3,
  equicorrelationMin,
  optimalHedgeRatio,
  orderStatCovUniform,
  formatRational,
  formatRangePair,
  reduce,
  type Pmf,
  type JointCell,
  type Rational,
} from './covariance'

interface Question {
  id: string
  tier: string
  template?: { id: string; params: Record<string, unknown> }
  engineCheck: { answer: string; verified: boolean }
  hidden: { answer: string; hintLadder: string[] }
}

const R = (n: number, d = 1): Rational => ({ n, d })
function F(s: string): Rational {
  const m = String(s).match(/^(-?\d+)(?:\/(-?\d+))?$/)
  if (!m) throw new Error(`bad frac ${s}`)
  return reduce(parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 1)
}
function diePmf(m: number): Pmf {
  return Array.from({ length: m }, (_, i) => ({ x: R(i + 1), p: R(1, m) }))
}
function bernoulliPmf(p: Rational): Pmf {
  return [{ x: R(0), p: reduce(p.d - p.n, p.d) }, { x: R(1), p }]
}
function joint2x2(cells: string, den: number): JointCell[] {
  const [a, b, c, d] = cells.split('-').map((x) => parseInt(x, 10))
  return [
    { x: R(0), y: R(0), p: R(a, den) },
    { x: R(0), y: R(1), p: R(b, den) },
    { x: R(1), y: R(0), p: R(c, den) },
    { x: R(1), y: R(1), p: R(d, den) },
  ]
}

// Independent re-derivation from template params (no reading of engineCheck.calls).
function expected(templateId: string, p: Record<string, unknown>): string {
  const num = (k: string) => Number(p[k])
  const str = (k: string) => String(p[k])
  switch (templateId) {
    case 'tmpl-variance':
      return formatRational(
        p.kind === 'die' ? variance(diePmf(num('m'))) : variance(bernoulliPmf(F(str('p')))),
      )
    case 'tmpl-cov-joint':
      return formatRational(covariance(joint2x2(str('cells'), num('den'))))
    case 'tmpl-cov-indicator':
      return formatRational(covarianceIndicators(F(str('pAB')), F(str('pA')), F(str('pB'))))
    case 'tmpl-var-linear': {
      const a = num('a'), b = num('b')
      const vX = F(str('vX')), vY = F(str('vY')), cov = F(str('cov'))
      const A = reduce(a * a * vX.n, vX.d)
      const B = reduce(b * b * vY.n, vY.d)
      const C = reduce(a * b * cov.n, cov.d)
      return formatRational(varianceOfSum(A, B, C))
    }
    case 'tmpl-cov-bilinear':
      return formatRational(covBilinear(F(str('vX')), F(str('cov'))))
    case 'tmpl-rho-perfsq': {
      const cov = F(str('cov')), vX = F(str('vX')), vY = F(str('vY'))
      if (str('grade') === 'rho') {
        const r = rho(cov, vX, vY)
        if (r.kind !== 'rational') throw new Error(`expected rational ρ for ${JSON.stringify(p)}`)
        return formatRational(r.rho)
      }
      return formatRational(rhoSquared(cov, vX, vY))
    }
    case 'tmpl-corr-range':
      return formatRangePair(corrRange(F(str('rho1')), F(str('rho2'))))
    case 'tmpl-psd-det':
      return formatRational(psdDeterminant3(F(str('r12')), F(str('r13')), F(str('r23'))))
    case 'tmpl-equicorr-min':
      return formatRational(equicorrelationMin(num('n')))
    case 'tmpl-hedge-ratio':
      return formatRational(optimalHedgeRatio(F(str('cov')), F(str('varB'))))
    case 'tmpl-order-stat':
      return formatRational(str('ask') === 'cov' ? orderStatCovUniform().cov : orderStatCovUniform().rho)
    default:
      throw new Error(`unknown template id: ${templateId}`)
  }
}

const packPath = fileURLToPath(
  new URL('../../interviews/course-covariance.json', import.meta.url),
)
const pack = JSON.parse(readFileSync(packPath, 'utf8')) as { questions: Question[] }

describe('covariance interview pack — engine-verified', () => {
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
