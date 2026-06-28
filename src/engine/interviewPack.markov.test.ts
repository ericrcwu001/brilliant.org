/// <reference types="node" />
// Independent verification of the Markov Chains interview pack: re-derive every
// TEMPLATED question's answer from src/engine/markov.ts and assert it matches the
// committed pack's engineCheck.answer AND hidden.answer. Mirrors
// interviewPack.covariance.test.ts and interviewPack.optimalStopping.test.ts.
// Free-form questions (no template) are anchored manually — for them we assert
// verified === true and that hidden.answer carries the verified engineCheck.answer.
//
// Answers are exact-rational strings: scalars ("4/7", "8"), probability vectors
// ("1/3,1/3,1/3"), etc. — never floats. All vectors are produced via the engine's
// own formatVector so the comma-join exactly matches the committed string.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Rational } from './types'
import { reduce } from './automaton'
import {
  matrixPower,
  absorptionProbabilities,
  expectedAbsorptionTime,
  stationaryDistribution,
  kacReturnTime,
  detailedBalance,
  pagerank,
  formatRational,
  formatVector,
} from './markov'

interface Question {
  id: string
  tier: string
  template?: { id: string; params: Record<string, unknown> }
  engineCheck: { answer: string; verified: boolean; calls?: string[]; module?: string }
  hidden: { answer: string; hintLadder: string[] }
}

const R = (n: number, d = 1): Rational => ({ n, d })

// ── Chain / graph registry (mirrors interviews/_build/build-markov-chains-pack.ts) ──

interface ChainDef {
  P: Rational[][]
  labels: string[]
  absorbing?: number[]
}

const CHAINS: Record<string, ChainDef> = {
  'machine-2': {
    P: [[R(1, 2), R(1, 2)], [R(1, 3), R(2, 3)]],
    labels: ['On', 'Off'],
  },
  'weather-clear-rainy': {
    P: [[R(3, 5), R(2, 5)], [R(3, 10), R(7, 10)]],
    labels: ['Clear', 'Rainy'],
  },
  'weather-gfg': {
    P: [[R(7, 10), R(3, 10)], [R(4, 10), R(6, 10)]],
    labels: ['A', 'B'],
  },
  'weather-asym': {
    P: [[R(1, 4), R(3, 4)], [R(1, 5), R(4, 5)]],
    labels: ['S1', 'S2'],
  },
  'weather-half-3q': {
    P: [[R(1, 2), R(1, 2)], [R(1, 4), R(3, 4)]],
    labels: ['A', 'B'],
  },
  snoqualmie: {
    P: [[R(4, 5), R(1, 5)], [R(2, 5), R(3, 5)]],
    labels: ['Clear', 'Rain'],
  },
  'cloudy-town': {
    P: [[R(0), R(1, 2), R(1, 2)], [R(1, 4), R(1, 2), R(1, 4)], [R(1, 4), R(1, 4), R(1, 2)]],
    labels: ['Sunny', 'Cloudy', 'Rainy'],
  },
  'land-of-oz': {
    P: [[R(1, 2), R(1, 4), R(1, 4)], [R(1, 2), R(0), R(1, 2)], [R(1, 4), R(1, 4), R(1, 2)]],
    labels: ['Rain', 'Nice', 'Snow'],
  },
  'ergodic-3': {
    P: [[R(1, 2), R(1, 4), R(1, 4)], [R(1, 3), R(1, 3), R(1, 3)], [R(0), R(1, 2), R(1, 2)]],
    labels: ['s0', 's1', 's2'],
  },
  'ehrenfest-2': {
    P: [[R(0), R(1), R(0)], [R(1, 2), R(0), R(1, 2)], [R(0), R(1), R(0)]],
    labels: ['0', '1', '2'],
  },
  'ehrenfest-3': {
    P: [
      [R(0), R(1), R(0), R(0)],
      [R(1, 3), R(0), R(2, 3), R(0)],
      [R(0), R(2, 3), R(0), R(1, 3)],
      [R(0), R(0), R(1), R(0)],
    ],
    labels: ['0', '1', '2', '3'],
  },
  'ehrenfest-4': {
    P: [
      [R(0), R(1), R(0), R(0), R(0)],
      [R(1, 4), R(0), R(3, 4), R(0), R(0)],
      [R(0), R(1, 2), R(0), R(1, 2), R(0)],
      [R(0), R(0), R(3, 4), R(0), R(1, 4)],
      [R(0), R(0), R(0), R(1), R(0)],
    ],
    labels: ['0', '1', '2', '3', '4'],
  },
  'gambler-0to3-up2_3': {
    P: [
      [R(1), R(0), R(0), R(0)],
      [R(1, 3), R(0), R(2, 3), R(0)],
      [R(0), R(1, 3), R(0), R(2, 3)],
      [R(0), R(0), R(0), R(1)],
    ],
    labels: ['$0', '$1', '$2', '$3'],
    absorbing: [0, 3],
  },
  'drunkard-0to4': {
    P: [
      [R(1), R(0), R(0), R(0), R(0)],
      [R(1, 2), R(0), R(1, 2), R(0), R(0)],
      [R(0), R(1, 2), R(0), R(1, 2), R(0)],
      [R(0), R(0), R(1, 2), R(0), R(1, 2)],
      [R(0), R(0), R(0), R(0), R(1)],
    ],
    labels: ['0', '1', '2', '3', '4'],
    absorbing: [0, 4],
  },
  'coin-hhh-thh': {
    P: [
      [R(0), R(1, 2), R(0), R(1, 2), R(0), R(0), R(0)],
      [R(0), R(0), R(1, 2), R(1, 2), R(0), R(0), R(0)],
      [R(0), R(0), R(0), R(1, 2), R(0), R(1, 2), R(0)],
      [R(0), R(0), R(0), R(1, 2), R(1, 2), R(0), R(0)],
      [R(0), R(0), R(0), R(1, 2), R(0), R(0), R(1, 2)],
      [R(0), R(0), R(0), R(0), R(0), R(1), R(0)],
      [R(0), R(0), R(0), R(0), R(0), R(0), R(1)],
    ],
    labels: ['∅', 'H', 'HH', 'T', 'TH', 'HHH', 'THH'],
    absorbing: [5, 6],
  },
  'dice-12-vs-77': {
    P: [
      [R(29, 36), R(1, 6), R(0), R(1, 36)],
      [R(29, 36), R(0), R(1, 6), R(1, 36)],
      [R(0), R(0), R(1), R(0)],
      [R(0), R(0), R(0), R(1)],
    ],
    labels: ['S', '7', '77', '12'],
    absorbing: [2, 3],
  },
  'thh-wait': {
    P: [
      [R(1, 2), R(1, 2), R(0), R(0)],
      [R(0), R(1, 2), R(1, 2), R(0)],
      [R(0), R(1, 2), R(0), R(1, 2)],
      [R(0), R(0), R(0), R(1)],
    ],
    labels: ['∅', 'T', 'TH', 'THH'],
    absorbing: [3],
  },
  'hh-wait': {
    P: [[R(1, 2), R(1, 2), R(0)], [R(1, 2), R(0), R(1, 2)], [R(0), R(0), R(1)]],
    labels: ['∅', 'H', 'HH'],
    absorbing: [2],
  },
  'hhh-wait': {
    P: [
      [R(1, 2), R(1, 2), R(0), R(0)],
      [R(1, 2), R(0), R(1, 2), R(0)],
      [R(1, 2), R(0), R(0), R(1, 2)],
      [R(0), R(0), R(0), R(1)],
    ],
    labels: ['∅', 'H', 'HH', 'HHH'],
    absorbing: [3],
  },
}

const GRAPHS: Record<string, Rational[][]> = {
  'pr-3cycle': [[R(0), R(1), R(0)], [R(0), R(0), R(1)], [R(1), R(0), R(0)]],
  'pr-4node': [
    [R(0), R(1), R(0), R(0)],
    [R(1, 2), R(0), R(0), R(1, 2)],
    [R(1, 2), R(0), R(0), R(1, 2)],
    [R(1, 3), R(1, 3), R(1, 3), R(0)],
  ],
  'pr-3node': [[R(0), R(1, 2), R(1, 2)], [R(0), R(0), R(1)], [R(1), R(0), R(0)]],
}

// Transient states are everything not in the absorbing set, in ascending order —
// this is the row-ordering absorptionProbabilities / expectedAbsorptionTime use.
function transientStates(n: number, absorbing: number[]): number[] {
  return Array.from({ length: n }, (_, i) => i).filter((i) => !absorbing.includes(i))
}

function absorptionAt(chainId: string, start: number, target: number): Rational {
  const { P, absorbing } = CHAINS[chainId]
  if (!absorbing) throw new Error(`Chain ${chainId} has no absorbing states`)
  const B = absorptionProbabilities(P, absorbing)
  const row = transientStates(P.length, absorbing).indexOf(start)
  const col = absorbing.indexOf(target)
  if (row < 0 || col < 0) throw new Error(`bad start/target ${chainId} ${start}->${target}`)
  return B[row][col]
}

function expectedAt(chainId: string, start: number): Rational {
  const { P, absorbing } = CHAINS[chainId]
  if (!absorbing) throw new Error(`Chain ${chainId} has no absorbing states`)
  const t = expectedAbsorptionTime(P, absorbing)
  const row = transientStates(P.length, absorbing).indexOf(start)
  if (row < 0) throw new Error(`bad start ${chainId} ${start}`)
  return t[row]
}

// 1-D birth-death walk on 0..N with absorbing walls at 0 and N, up-prob pNum/pDen.
function buildWalkP(N: number, pNum: number, pDen: number): Rational[][] {
  return Array.from({ length: N + 1 }, (_, i) => {
    const row: Rational[] = Array.from({ length: N + 1 }, () => R(0))
    if (i === 0) {
      row[0] = R(1)
    } else if (i === N) {
      row[N] = R(1)
    } else {
      row[i + 1] = R(pNum, pDen)
      row[i - 1] = R(pDen - pNum, pDen)
    }
    return row
  })
}

function walkReach(N: number, pNum: number, pDen: number, i: number): Rational {
  return absorptionProbabilities(buildWalkP(N, pNum, pDen), [0, N])[i - 1][1]
}

function walkDuration(N: number, pNum: number, pDen: number, i: number): Rational {
  return expectedAbsorptionTime(buildWalkP(N, pNum, pDen), [0, N])[i - 1]
}

// ── Independent re-derivation from template params (no reading of engineCheck.calls) ──

function expected(templateId: string, p: Record<string, unknown>): string {
  const num = (k: string) => Number(p[k])
  const str = (k: string) => String(p[k])
  switch (templateId) {
    case 'tmpl-stationary':
      return formatVector(stationaryDistribution(CHAINS[str('chain')].P))
    case 'tmpl-multistep':
      return formatRational(matrixPower(CHAINS[str('chain')].P, num('n'))[num('from')][num('to')])
    case 'tmpl-absorption':
      return formatRational(absorptionAt(str('chain'), num('start'), num('target')))
    case 'tmpl-expected-absorption':
      return formatRational(expectedAt(str('chain'), num('start')))
    case 'tmpl-gamblers-ruin': {
      const N = num('N'), pNum = num('pNum'), pDen = num('pDen'), i = num('i')
      const query = str('query')
      if (query === 'reach') return formatRational(walkReach(N, pNum, pDen, i))
      if (query === 'duration') return formatRational(walkDuration(N, pNum, pDen, i))
      throw new Error(`unknown gamblers-ruin query: ${query}`)
    }
    case 'tmpl-detailed-balance':
      return formatVector(detailedBalance(CHAINS[str('chain')].P).pi)
    case 'tmpl-kac-return':
      return formatRational(kacReturnTime(CHAINS[str('chain')].P, num('state')))
    case 'tmpl-pagerank':
      return formatVector(pagerank(GRAPHS[str('graph')], reduce(num('dNum'), num('dDen'))))
    default:
      throw new Error(`unknown template id: ${templateId}`)
  }
}

const packPath = fileURLToPath(
  new URL('../../interviews/course-markov-chains.json', import.meta.url),
)
const pack = JSON.parse(readFileSync(packPath, 'utf8')) as { questions: Question[] }

describe('markov-chains interview pack — engine-verified', () => {
  for (const q of pack.questions) {
    it(`${q.id}`, () => {
      expect(q.engineCheck.verified, 'verified flag').toBe(true)
      // No bare float token anywhere in the answer (exact-rational contract).
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

  it('templated vs free-form split matches the committed counts', () => {
    const templated = pack.questions.filter((q) => q.template).length
    const freeForm = pack.questions.length - templated
    expect(templated).toBe(50)
    expect(freeForm).toBe(5)
  })
})
