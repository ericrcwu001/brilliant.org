/// <reference types="node" />
// Independent verification of the Bayes' Rule interview pack:
// re-derive every TEMPLATED question's answer from src/engine/bayes.ts and assert
// it matches the committed pack's engineCheck.answer AND hidden.answer. Mirrors
// interviewPack.covariance.test.ts / interviewPack.optimalStopping.test.ts.
// Free-form questions are anchored manually (engineCheck.calls) — for them we only
// assert verified + the 3-rung hint shape + that hidden.answer carries the verified
// engineCheck.answer string.
//
// EXACT-RATIONAL contract: every templated answer is an exact rational string
// ("n/d" or an integer) — never a float. We re-derive strictly from template.params
// (and the structured `fingerprint` for the odds LR list, the question id for the
// defect scenario), never by parsing the human-readable engineCheck.calls.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  bayesUpdate,
  bayesPosterior,
  oddsUpdateProb,
  sequentialPosterior,
  naturalFrequencies,
  formatRational,
} from './bayes'
import { reduce } from './automaton'
import type { Rational } from './types'

interface Question {
  id: string
  tier: string
  fingerprint: string
  template?: { id: string; params: Record<string, unknown> }
  engineCheck: { module: string; calls: string[]; answer: string; verified: boolean }
  hidden: { answer: string; hintLadder: string[] }
}

const ONE: Rational = { n: 1, d: 1 }
const HALF: Rational = { n: 1, d: 2 }

// "n" or "n/d" -> reduced Rational.
function F(s: string): Rational {
  const m = String(s).match(/^(-?\d+)(?:\/(-?\d+))?$/)
  if (!m) throw new Error(`bad frac ${s}`)
  return reduce(parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 1)
}

// Urn composition like "2R1B" -> P(red) = red / (red + blue).
function redFraction(comp: string): Rational {
  const m = String(comp).match(/^(\d+)R(\d+)B$/)
  if (!m) throw new Error(`bad urn composition ${comp}`)
  const red = parseInt(m[1], 10)
  const blue = parseInt(m[2], 10)
  return reduce(red, red + blue)
}

// Scenario constants for the multi-source-defect template. The priors/likelihoods
// live only in the prompt prose, keyed by the question id; we transcribe them here
// and feed them to the REAL bayesPosterior — no parsing of engineCheck.calls.
const DEFECT_SCENARIOS: Record<
  string,
  { priors: string[]; likelihoods: string[]; index: number }
> = {
  'defect-2factory-pA': { priors: ['6/10', '4/10'], likelihoods: ['2/100', '5/100'], index: 0 },
  'defect-2factory-pB': { priors: ['6/10', '4/10'], likelihoods: ['2/100', '5/100'], index: 1 },
  'defect-3machine-pM1': {
    priors: ['1/2', '3/10', '1/5'],
    likelihoods: ['1/100', '2/100', '3/100'],
    index: 0,
  },
  'defect-3machine-pM3': {
    priors: ['1/2', '3/10', '1/5'],
    likelihoods: ['1/100', '2/100', '3/100'],
    index: 2,
  },
  'defect-3supplier-pS1': {
    priors: ['1/4', '1/5', '11/20'],
    likelihoods: ['5/100', '3/100', '1/100'],
    index: 0,
  },
}

// Parse the odds-multi-evidence LR list out of the structured fingerprint
// (e.g. "odds-multi-evidence:prior=1:99;lr=[99/1,99/1]"). The fingerprint is a
// committed structured field, distinct from the human-readable engineCheck.calls.
function oddsLikelihoodRatios(fingerprint: string): Rational[] {
  const m = fingerprint.match(/lr=\[([^\]]*)\]/)
  if (!m) throw new Error(`no lr=[…] in fingerprint ${fingerprint}`)
  return m[1]
    .split(',')
    .map((tok) => tok.trim())
    .filter(Boolean)
    .map(F)
}

// Independent re-derivation from template params (+ fingerprint for the odds LRs and
// the question id for the defect scenario). Returns the canonical exact-rational
// answer string.
function expected(q: Question): string {
  const t = q.template!
  const p = t.params
  const num = (k: string) => Number(p[k])
  const str = (k: string) => String(p[k])

  switch (t.id) {
    case 'screening-ppv': {
      // PPV = bayesUpdate(prevalence, sensitivity, falsePositiveRate = 1 − specificity).
      const specificity = F(str('specificity'))
      const fpr = reduce(specificity.d - specificity.n, specificity.d)
      return formatRational(bayesUpdate(F(str('prevalence')), F(str('sensitivity')), fpr))
    }

    case 'spam-precision':
      // Precision = bayesUpdate(baseRate, recall, falsePositiveRate).
      return formatRational(
        bayesUpdate(F(str('baseRate')), F(str('recall')), F(str('falsePositiveRate'))),
      )

    case 'two-coins-sequential':
      // Fair vs double-headed, even prior; k heads in a row.
      // P(H|H)=1 (double-headed), P(H|¬H)=1/2 (fair).
      return formatRational(sequentialPosterior(HALF, ONE, HALF, num('heads')))

    case 'rare-coin-n': {
      // One double-headed coin among `coins`; prior = doubleHeaded/coins; k heads.
      const prior = reduce(num('doubleHeaded'), num('coins'))
      return formatRational(sequentialPosterior(prior, ONE, HALF, num('heads')))
    }

    case 'odds-multi-evidence': {
      // prior odds "a:b" -> a/b; LR list from the structured fingerprint.
      const [a, b] = str('priorOdds').split(':').map((x) => parseInt(x, 10))
      const priorOdds = reduce(a, b)
      return formatRational(oddsUpdateProb(priorOdds, oddsLikelihoodRatios(q.fingerprint)))
    }

    case 'two-children': {
      const n = num('children')
      const total = 2 ** n
      const priorAllBoys = reduce(1, total) // P(all boys)
      if (str('evidence') === 'specificBoy') {
        // A named/specific child is a boy: P(E|all boys)=1; among the not-all-boys
        // worlds where the named child is a boy, P(all boys | E) = 1/(2^(n−1)).
        const pEgivenNotH = reduce(1, total - 1)
        return formatRational(bayesUpdate(priorAllBoys, ONE, pEgivenNotH))
      }
      // atLeastOneBoy: P(E|all boys)=1; P(≥1 boy | not all boys) = (2^n−2)/(2^n−1).
      const pEgivenNotH = reduce(total - 2, total - 1)
      return formatRational(bayesUpdate(priorAllBoys, ONE, pEgivenNotH))
    }

    case 'two-urns': {
      // Drew a RED ball: bayesUpdate(priorA, P(red|A), P(red|B)).
      return formatRational(
        bayesUpdate(F(str('priorA')), redFraction(str('urnA')), redFraction(str('urnB'))),
      )
    }

    case 'multi-source-defect': {
      const sc = DEFECT_SCENARIOS[q.id]
      if (!sc) throw new Error(`no defect scenario for ${q.id}`)
      const post = bayesPosterior(sc.priors.map(F), sc.likelihoods.map(F))
      return formatRational(post[sc.index])
    }

    case 'natural-frequency-counts': {
      const nf = naturalFrequencies(
        F(str('prevalence')),
        F(str('sensitivity')),
        F(str('specificity')),
        num('population'),
      )
      const field = str('field') as 'tp' | 'fp' | 'fn' | 'tn' | 'ppv'
      return formatRational(nf[field])
    }

    default:
      throw new Error(`unknown template id: ${t.id}`)
  }
}

const packPath = fileURLToPath(new URL('../../interviews/course-bayes-rule.json', import.meta.url))
const pack = JSON.parse(readFileSync(packPath, 'utf8')) as { questions: Question[] }

describe('bayes interview pack — engine-verified', () => {
  for (const q of pack.questions) {
    it(`${q.id}`, () => {
      expect(q.engineCheck.verified, 'verified flag').toBe(true)
      expect(q.hidden.hintLadder.length, 'hint ladder rungs').toBe(3)
      // EXACT-RATIONAL: no bare float token anywhere in the answer.
      for (const tok of q.engineCheck.answer.split(/[\s,=]+/)) {
        expect(/^-?\d+\.\d+$/.test(tok), `float token "${tok}" in ${q.id}`).toBe(false)
      }
      if (q.template) {
        const want = expected(q)
        expect(q.engineCheck.answer, `${q.id} engineCheck`).toBe(want)
        expect(q.hidden.answer, `${q.id} hidden contains engine value`).toContain(want)
      } else {
        // free-form: manually anchored; hidden.answer must carry the verified value.
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
    const fps = pack.questions.map((q) => q.fingerprint)
    expect(new Set(fps).size).toBe(fps.length)
  })
})
