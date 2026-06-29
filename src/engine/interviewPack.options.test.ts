/// <reference types="node" />
// Independent verification of the Options interview pack: re-derive every
// TEMPLATED question's answer from src/engine/options.ts and assert it matches
// the committed pack's engineCheck.answer AND hidden.answer. Mirrors
// interviewPack.covariance.test.ts. Free-form questions are anchored manually
// (engineCheck.calls) — for them we assert verified + hint shape + that
// hidden.answer carries the verified engineCheck.answer string.
//
// EXACT-RATIONAL contract: every templated answer is an exact rational string
// ("n/d", integer, or signed-integer Greek sign) — never a float.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  spreadPayoff,
  paritySolve,
  parityGap,
  callBounds,
  putBounds,
  riskNeutralQ,
  binomialPrice,
  replicate,
  treeTerminals,
  treeWeights,
  pathCount,
  hedgeRatio,
  minVarWeights,
  oneTouchPrice,
  greekSign,
  reduce,
  formatRational,
  type BigRational,
  type Leg,
  type Kind,
} from './options'

interface Question {
  id: string
  tier: string
  template?: { id: string; params: Record<string, unknown> }
  engineCheck: { answer: string; verified: boolean }
  hidden: { answer: string; hintLadder: string[] }
}

const B = (n: number, d = 1): BigRational => reduce(BigInt(n), BigInt(d))
function F(s: string): BigRational {
  const m = String(s).trim().match(/^(-?\d+)(?:\/(-?\d+))?$/)
  if (!m) throw new Error(`bad frac ${s}`)
  return reduce(BigInt(m[1]), BigInt(m[2] ?? '1'))
}
function legsOf(structure: string, strikes: string): Leg[] {
  const K = strikes.split('-').map(F)
  switch (structure) {
    case 'call':
      return [{ kind: 'call', K: K[0], qty: B(1) }]
    case 'put':
      return [{ kind: 'put', K: K[0], qty: B(1) }]
    case 'straddle':
      return [{ kind: 'call', K: K[0], qty: B(1) }, { kind: 'put', K: K[0], qty: B(1) }]
    case 'bull':
      return [{ kind: 'call', K: K[0], qty: B(1) }, { kind: 'call', K: K[1], qty: B(-1) }]
    case 'butterfly':
      return [
        { kind: 'call', K: K[0], qty: B(1) },
        { kind: 'call', K: K[1], qty: B(-2) },
        { kind: 'call', K: K[2], qty: B(1) },
      ]
    case 'strangle':
      return [{ kind: 'put', K: K[0], qty: B(1) }, { kind: 'call', K: K[1], qty: B(1) }]
    case 'protective-put':
      return [{ kind: 'stock', qty: B(1) }, { kind: 'put', K: K[0], qty: B(1) }]
    default:
      throw new Error(`unknown structure ${structure}`)
  }
}

// Independent re-derivation from template params (no reading of engineCheck.calls).
function expected(templateId: string, p: Record<string, unknown>): string {
  const num = (k: string) => Number(p[k])
  const str = (k: string) => String(p[k])
  switch (templateId) {
    case 'tmpl-payoff':
      return formatRational(spreadPayoff(legsOf(str('structure'), str('strikes')), F(str('ST'))))
    case 'tmpl-parity-solve': {
      const known =
        str('solveFor') === 'P'
          ? { C: F(str('premium')), S: F(str('S')), K: F(str('K')), D: F(str('D')) }
          : { P: F(str('premium')), S: F(str('S')), K: F(str('K')), D: F(str('D')) }
      return formatRational(paritySolve(known))
    }
    case 'tmpl-parity-gap':
      return formatRational(parityGap(F(str('C')), F(str('P')), F(str('S')), F(str('K')), F(str('D'))))
    case 'tmpl-bounds': {
      const b =
        str('kind') === 'call'
          ? callBounds(F(str('S')), F(str('K')), F(str('D')))
          : putBounds(F(str('S')), F(str('K')), F(str('D')))
      return formatRational(str('which') === 'lo' ? b.lo : b.hi)
    }
    case 'tmpl-rn-q':
      return formatRational(riskNeutralQ(F(str('u')), F(str('d')), F(str('R'))))
    case 'tmpl-binomial-price':
      return formatRational(
        binomialPrice(F(str('S')), F(str('u')), F(str('d')), F(str('R')), F(str('K')), num('n'), str('kind') as Kind),
      )
    case 'tmpl-replicate': {
      const r = replicate(F(str('S')), F(str('u')), F(str('d')), F(str('R')), F(str('K')), str('kind') as Kind)
      return formatRational(str('which') === 'delta' ? r.delta : r.bond)
    }
    case 'tmpl-tree-terminal':
      return formatRational(treeTerminals(F(str('S')), F(str('u')), F(str('d')), num('n'))[num('i')])
    case 'tmpl-tree-weight':
      return formatRational(treeWeights(F(str('q')), num('n'))[num('i')])
    case 'tmpl-path-count':
      return String(pathCount(num('n'), num('k')))
    case 'tmpl-hedge-ratio':
      return formatRational(hedgeRatio(F(str('cov')), F(str('varB'))))
    case 'tmpl-min-var': {
      const m = minVarWeights(F(str('varA')), F(str('varB')), F(str('cov')))
      return formatRational(str('which') === 'wA' ? m.wA : str('which') === 'wB' ? m.wB : m.varMin)
    }
    case 'tmpl-one-touch':
      return formatRational(oneTouchPrice(F(str('H'))))
    case 'tmpl-greek-sign':
      return String(
        greekSign(str('greek') as 'delta' | 'gamma' | 'theta' | 'vega' | 'rho', str('kind') as Kind),
      )
    default:
      throw new Error(`unknown template id: ${templateId}`)
  }
}

const packPath = fileURLToPath(new URL('../../interviews/course-options.json', import.meta.url))
const pack = JSON.parse(readFileSync(packPath, 'utf8')) as { questions: Question[] }

describe('options interview pack — engine-verified', () => {
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
