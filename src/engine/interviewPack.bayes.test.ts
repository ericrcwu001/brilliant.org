/// <reference types="node" />
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  bayesUpdate,
  bayesPosterior,
  oddsUpdateProb,
  sequentialPosterior,
  naturalFrequencies,
  smallestKCross,
  formatRational,
} from './bayes'
import type { Rational } from './types'

type R = { n: number; d: number }
const r = (obj: R): Rational => obj

interface EngineCheck {
  fn: string
  args: Record<string, unknown>
  answer: string
  verified: boolean
}

interface Question {
  id: string
  engineCheck: EngineCheck
}

function dispatch(fn: string, args: Record<string, unknown>): Rational {
  switch (fn) {
    case 'bayesUpdate':
      return bayesUpdate(r(args.prior as R), r(args.pEgivenH as R), r(args.pEgivenNotH as R))
    case 'bayesPosterior': {
      const result = bayesPosterior(
        (args.priors as R[]).map(r),
        (args.likelihoods as R[]).map(r),
      )
      return result[args.index as number]
    }
    case 'oddsUpdateProb':
      return oddsUpdateProb(r(args.priorOdds as R), (args.likelihoodRatios as R[]).map(r))
    case 'sequentialPosterior':
      return sequentialPosterior(
        r(args.prior as R),
        r(args.pEgivenH as R),
        r(args.pEgivenNotH as R),
        args.k as number,
      )
    case 'naturalFrequencies': {
      const result = naturalFrequencies(
        r(args.prior as R),
        r(args.sensitivity as R),
        r(args.specificity as R),
        args.population as number,
      )
      return (result as Record<string, Rational>)[args.field as string]
    }
    case 'smallestKCross':
      return smallestKCross(
        r(args.prior as R),
        r(args.pEgivenH as R),
        r(args.pEgivenNotH as R),
        r(args.threshold as R),
      )
    default:
      throw new Error(`Unknown engineCheck.fn: "${fn}"`)
  }
}

const packPath = fileURLToPath(new URL('../../interviews/course-bayes-rule.json', import.meta.url))
const pack = JSON.parse(readFileSync(packPath, 'utf8')) as { questions: Question[] }

describe('interview pack — all 57 questions engine-verified', () => {
  for (const q of pack.questions) {
    it(`${q.id} [${q.engineCheck.fn}]`, () => {
      expect(q.engineCheck.verified, 'verified flag').toBe(true)
      const result = dispatch(q.engineCheck.fn, q.engineCheck.args)
      expect(formatRational(result), q.id).toBe(q.engineCheck.answer)
    })
  }
  it('total pool count is 57', () => {
    expect(pack.questions.length).toBe(57)
  })
})
