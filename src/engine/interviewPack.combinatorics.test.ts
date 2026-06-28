/// <reference types="node" />
// Independent verification of the Combinatorics interview pack: re-derive every
// TEMPLATED question's answer from src/engine/combinatorics.ts and assert it
// matches the committed pack's engineCheck.answer AND hidden.answer. Mirrors
// interviewPack.covariance.test.ts and interviewPack.optimalStopping.test.ts.
// Free-form questions (no `template`) are anchored manually — for them we only
// assert the verified flag + that hidden.answer carries the engineCheck.answer.
//
// EXACT contract: every counting value is re-derived with the BigInt engine
// (no floats) and the compound answer strings are reassembled byte-for-byte.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
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
} from './combinatorics'

interface Question {
  id: string
  tier: string
  template?: { id: string; params: Record<string, unknown> }
  engineCheck: { answer: string; verified: boolean }
  hidden: { answer: string; hintLadder: string[] }
}

// Format a reduced fraction "n/d", collapsing d===1 to a bare integer.
function frac(n: bigint, d: bigint): string {
  const r = reduce(n, d)
  return r.d === 1n ? String(r.n) : `${r.n}/${r.d}`
}

// 52-card deck: total 5-card hands. Re-derived, not hard-coded.
const POKER_TOTAL = nCk(52, 5) // 2598960n

// Per-variant hand counts via the multiplication rule (engineCheck.calls).
const POKER_VARIANTS: Record<string, { label: string; count: bigint }> = {
  fourOfAKind: { label: 'four-of-a-kind', count: product([13, 48]) },
  fullHouse: { label: 'a full house', count: product([13, 4, 12, 6]) },
  twoPairs: { label: 'two pairs', count: product([78, 6, 6, 44]) },
}

// Independent re-derivation from template params.
function expected(templateId: string, p: Record<string, unknown>): string {
  const num = (k: string) => Number(p[k])
  const str = (k: string) => String(p[k])
  switch (templateId) {
    case 'tmpl-sequence-count': {
      const m = num('m')
      const n = num('n')
      const total = product(Array(n).fill(m)) // m^n
      const noRepeat = nPk(m, n)
      const atLeastOne = total - noRepeat
      return `total = ${total}; no-repeat = ${noRepeat}; at-least-one-repeat = ${atLeastOne}.`
    }
    case 'tmpl-perm-vs-comb': {
      const n = num('n')
      const k = num('k')
      const ordered = nPk(n, k)
      const unordered = nCk(n, k)
      const kfact = factorial(k)
      return `ordered = ${ordered}; unordered = ${unordered}; they differ by k! = ${kfact}.`
    }
    case 'tmpl-binomial-term': {
      const n = num('n')
      if (str('variant') === 'identity') {
        // Σ_k C(n,k) = sum of pascalRow(n) = 2^n. The committed identity row is
        // n=10 with the symmetric example C(n,4)=C(n,6).
        const row = pascalRow(n)
        const sum = row.reduce((a, b) => a + b, 0n)
        const pair = nCk(n, 4) // === nCk(n, 6) for n=10
        return `Σ_k C(${n},k) = ${sum} = 2^${n}; the row is symmetric, e.g. C(${n},4)=C(${n},6)=${pair}.`
      }
      const k = num('k')
      const c = num('c')
      const coef = nCk(n, k) * product(Array(k).fill(c)) // C(n,k)·c^k
      const sum = product(Array(n).fill(c + 1)) // (1+c)^n
      const sym = n - k // symmetry index C(n,k)=C(n,n-k)
      return `coefficient = C(${n},${k})·${c}^${k} = ${coef}; all coefficients sum to (1+${c})^${n} = ${sum}; C(${n},${k}) = C(${n},${sym}) = ${nCk(n, k)}.`
    }
    case 'tmpl-inclusion-exclusion': {
      const variant = str('variant')
      if (variant === '2set') {
        const a = num('a')
        const b = num('b')
        const ab = num('ab')
        const N = num('N')
        const union = unionSize(a, b, ab)
        const exactlyOne = inclusionExclusion([
          { size: a, sign: 1 },
          { size: b, sign: 1 },
          { size: ab, sign: -1 },
          { size: ab, sign: -1 },
        ])
        const neither = BigInt(N) - union
        return `A or B = ${union}; exactly one = ${exactlyOne}; neither = ${neither}.`
      }
      const A = num('A')
      const B = num('B')
      const C = num('C')
      const AB = num('AB')
      const AC = num('AC')
      const BC = num('BC')
      const ABC = num('ABC')
      const union3 = inclusionExclusion([
        { size: A, sign: 1 },
        { size: B, sign: 1 },
        { size: C, sign: 1 },
        { size: AB, sign: -1 },
        { size: AC, sign: -1 },
        { size: BC, sign: -1 },
        { size: ABC, sign: 1 },
      ])
      if (variant === '3set') {
        const N = num('N')
        const none = BigInt(N) - union3
        return `at least one = ${union3}; none = ${none}.`
      }
      if (variant === '3set-exactlyone') {
        // |exactly one| = ΣA − 2·Σpairs + 3·|ABC|
        const exactlyOne = inclusionExclusion([
          { size: A, sign: 1 },
          { size: B, sign: 1 },
          { size: C, sign: 1 },
          { size: AB, sign: -1 },
          { size: AB, sign: -1 },
          { size: AC, sign: -1 },
          { size: AC, sign: -1 },
          { size: BC, sign: -1 },
          { size: BC, sign: -1 },
          { size: ABC, sign: 1 },
          { size: ABC, sign: 1 },
          { size: ABC, sign: 1 },
        ])
        return `exactly one = ${exactlyOne}.`
      }
      if (variant === '3set-exactlytwo') {
        // |exactly two| = Σpairs − 3·|ABC|
        const exactlyTwo = inclusionExclusion([
          { size: AB, sign: 1 },
          { size: AC, sign: 1 },
          { size: BC, sign: 1 },
          { size: ABC, sign: -1 },
          { size: ABC, sign: -1 },
          { size: ABC, sign: -1 },
        ])
        return `exactly two = ${exactlyTwo}.`
      }
      throw new Error(`unknown inclusion-exclusion variant: ${variant}`)
    }
    case 'tmpl-derangement': {
      const n = num('n')
      const allWrong = derangements(n)
      const total = factorial(n)
      const atLeastOne = total - allWrong
      const prob = frac(allWrong, total)
      return `all-wrong = ${allWrong}; at-least-one = ${atLeastOne}; P(all wrong) = ${prob}; limit → 1/e.`
    }
    case 'tmpl-dice-increasing': {
      const k = num('k')
      const fav = nCk(6, k)
      const total = product(Array(k).fill(6)) // 6^k
      const prob = probabilityFromCounts(Number(fav), Number(total))
      return `P(strictly increasing) = ${frac(prob.n, prob.d)}.`
    }
    case 'tmpl-pigeonhole': {
      const items = num('itemsCount')
      const holes = num('holes')
      const t = num('t')
      const forced = forcesCollision(items, holes)
      const guaranteed = pigeonholeMin(items, holes) // some hole holds ≥ this
      const needed = holes * (t - 1) + 1 // = items count making pigeonholeMin === t
      // sanity: needed is the smallest count m with pigeonholeMin(m, holes) === t
      return `holes = ${holes}; collision forced = ${forced}; some hole holds ≥ ${guaranteed}; to force ≥ ${t} you need ${needed} items.`
    }
    case 'tmpl-poker-hand': {
      const v = POKER_VARIANTS[str('variant')]
      if (!v) throw new Error(`unknown poker variant: ${str('variant')}`)
      const prob = probabilityFromCounts(Number(v.count), Number(POKER_TOTAL))
      const odds = reduce(POKER_TOTAL - v.count, v.count) // (total−count) : count
      return `${v.label}: ${v.count} hands; P = ${frac(prob.n, prob.d)}; odds against ${odds.n}:${odds.d}.`
    }
    default:
      throw new Error(`unknown template id: ${templateId}`)
  }
}

const packPath = fileURLToPath(
  new URL('../../interviews/course-combinatorics.json', import.meta.url),
)
const pack = JSON.parse(readFileSync(packPath, 'utf8')) as { questions: Question[] }

describe('combinatorics interview pack — engine-verified', () => {
  for (const q of pack.questions) {
    it(`${q.id}`, () => {
      expect(q.engineCheck.verified, 'verified flag').toBe(true)
      expect(q.hidden.hintLadder.length, 'hint ladder rungs').toBe(3)
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
