/// <reference types="node" />
// Independent verification of the Game Theory interview pack: re-derive every
// TEMPLATED question's answer from src/engine/gameTheory.ts and assert it matches
// the committed pack's engineCheck.answer AND hidden.answer. Mirrors
// interviewPack.covariance.test.ts / interviewPack.optimalStopping.test.ts.
// Free-form questions (no `template`) are anchored manually (engineCheck.calls) —
// for them we only assert the verified flag + that hidden.answer carries the
// verified engineCheck.answer string.
//
// EXACT contract: every templated answer is an exact rational string, an integer,
// a comma-joined vector ("98,0,1,0,1"), a semicolon-joined list of "row,col"
// strategy profiles ("0,0;1,1"), or a categorical token ("none" / "mixed").

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  reduce,
  formatRational,
  formatVector,
  pureNashEquilibria,
  iesdsSolution,
  saddlePoint,
  mixedValue2x2,
  backwardInduction,
  pirateGame,
  nimSum,
  subtractionWinningMove,
  type Game,
  type GameTreeNode,
} from './gameTheory'
import type { Rational } from './types'

interface Question {
  id: string
  tier: string
  template?: { id: string; params: Record<string, unknown> }
  engineCheck: { answer: string; verified: boolean; calls?: string[]; module?: string }
  hidden: { answer: string; hintLadder: string[] }
}

const R = (n: number, d = 1): Rational => ({ n, d })

// Build a bimatrix Game from a [rows][cols][2] payoff array ([row,col] per cell).
function gameFromPayoffs(payoffs: number[][][]): Game {
  return payoffs.map((row) => row.map(([r, c]) => ({ row: R(r), col: R(c) })))
}
// Build a zero-sum payoff matrix (ROW's payoffs) from a number[][].
function rmatrix(m: number[][]): Rational[][] {
  return m.map((row) => row.map((x) => R(x)))
}

// Value of a 2×2 zero-sum game: the saddle value if a pure saddle exists,
// otherwise the mixed value. (mixedValue2x2 throws on a degenerate/saddle game,
// so the saddle test must come first.)
function zeroSumValue(m: number[][]): Rational {
  const M = rmatrix(m)
  const sp = saddlePoint(M)
  return sp ? sp.value : mixedValue2x2(M).value
}

// Independent re-derivation from template params (no reading of engineCheck.calls).
function expected(templateId: string, p: Record<string, unknown>): string {
  switch (templateId) {
    case 'tmpl-nim-sum':
      return String(nimSum(p.heaps as number[]))

    case 'tmpl-pirate':
      return pirateGame(p.pirates as number, p.coins as number).join(',')

    case 'tmpl-subtraction':
      // Winning move = pile mod (maxRemove+1); on a P-position (null) the pack
      // reports 0 (no winning move).
      return String(subtractionWinningMove(p.pile as number, p.maxRemove as number) ?? 0)

    case 'tmpl-pure-nash': {
      const nash = pureNashEquilibria(gameFromPayoffs(p.payoffs as number[][][]))
      if (nash.length === 0) return 'none'
      return nash.map((e) => `${e.row},${e.col}`).join(';')
    }

    case 'tmpl-iesds': {
      const sol = iesdsSolution(gameFromPayoffs(p.payoffs as number[][][]))
      if (!sol) throw new Error(`tmpl-iesds: no unique survivor for ${JSON.stringify(p)}`)
      return `${sol.row},${sol.col}`
    }

    case 'tmpl-saddle-value': {
      const sp = saddlePoint(rmatrix(p.matrix as number[][]))
      return sp ? formatRational(sp.value) : 'mixed'
    }

    case 'tmpl-mixed-value':
      return formatRational(zeroSumValue(p.matrix as number[][]))

    case 'tmpl-mixed-prob': {
      // ROW's optimal probability of playing row 0 in the 2×2 zero-sum game.
      // Only meaningful with no saddle (mixedValue2x2 throws otherwise).
      const M = rmatrix(p.matrix as number[][])
      if (saddlePoint(M)) throw new Error(`tmpl-mixed-prob: game has a saddle ${JSON.stringify(p)}`)
      return formatRational(mixedValue2x2(M).p)
    }

    case 'tmpl-backward-induction':
      return formatVector(backwardInduction(p.tree as GameTreeNode).payoff)

    default:
      throw new Error(`unknown template id: ${templateId}`)
  }
}

const packPath = fileURLToPath(
  new URL('../../interviews/course-game-theory.json', import.meta.url),
)
const pack = JSON.parse(readFileSync(packPath, 'utf8')) as { questions: Question[] }

describe('game-theory interview pack — engine-verified', () => {
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

  // sanity: reduce is the exact-arithmetic primitive the formatters rely on.
  it('engine arithmetic is exact (no float drift)', () => {
    expect(reduce(2, 4)).toEqual({ n: 1, d: 2 })
    expect(formatRational(R(-1, 12))).toBe('-1/12')
  })
})
