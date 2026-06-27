/// <reference types="node" />
// Independent verification of the Optimal Stopping interview pack: re-derive every
// TEMPLATED question's answer from src/engine/optimalStopping.ts and assert it
// matches the committed pack's hidden.answer. Mirrors interviewPack.bayes.test.ts.
// Free-form questions are anchored manually (engineCheck.calls) — for them we only
// assert the verified flag + hint-ladder shape.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  secretarySuccess,
  naiveSuccess,
  optimalCutoff,
  runStrategy,
  formatRational,
} from './optimalStopping'

interface Question {
  id: string
  tier: string
  template?: { id: string; params: Record<string, unknown> }
  engineCheck: { answer: string; verified: boolean }
  hidden: { answer: string; hintLadder: string[] }
}

function expected(templateId: string, params: Record<string, unknown>): string {
  switch (templateId) {
    case 'tmpl-best-prob':
      return formatRational(secretarySuccess(params.n as number, params.r as number))
    case 'tmpl-optimal-cutoff': {
      const { r, p } = optimalCutoff(params.n as number)
      return `r=${r}, p=${formatRational(p)}`
    }
    case 'tmpl-naive-vs-optimal': {
      const n = params.n as number
      const { r, p } = optimalCutoff(n)
      return `naive=${formatRational(naiveSuccess(n))}, optimal=${formatRational(p)} (r=${r})`
    }
    case 'tmpl-skip-count':
      return String(optimalCutoff(params.n as number).r - 1)
    case 'tmpl-run-outcome': {
      const res = runStrategy(params.order as number[], params.cutoff as number)
      return `position ${res.selectedIndex + 1} (rank ${res.selectedRank}) — ${res.win ? 'WIN, the best' : 'miss'}`
    }
    default:
      throw new Error(`unknown template id: ${templateId}`)
  }
}

const packPath = fileURLToPath(
  new URL('../../interviews/course-optimal-stopping.json', import.meta.url),
)
const pack = JSON.parse(readFileSync(packPath, 'utf8')) as { questions: Question[] }

describe('optimal-stopping interview pack — engine-verified', () => {
  for (const q of pack.questions) {
    it(`${q.id}`, () => {
      expect(q.engineCheck.verified, 'verified flag').toBe(true)
      expect(q.hidden.hintLadder.length, 'hint ladder rungs').toBe(3)
      if (q.template) {
        const want = expected(q.template.id, q.template.params)
        expect(q.engineCheck.answer, `${q.id} engineCheck`).toBe(want)
        expect(q.hidden.answer, `${q.id} hidden`).toBe(want)
      }
    })
  }

  it('pool is 50+ questions across all three tiers', () => {
    expect(pack.questions.length).toBeGreaterThanOrEqual(50)
    const tiers = new Set(pack.questions.map((q) => q.tier))
    expect(tiers).toEqual(new Set(['hard', 'harder', 'brutal']))
  })
})
