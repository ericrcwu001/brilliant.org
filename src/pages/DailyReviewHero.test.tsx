// Render tests for the Daily Review hero (spec-20 §8.3). Node env, renderToString.
// Asserts the two-track copy + that the TWO empty states (caught-up vs no-deck)
// render distinctly — the §4.5 invariant: a no-deck learner never sees the
// "all caught up" copy.

import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import React from 'react'
import { DailyReviewHero } from './DailyReviewHero'
import { buildHeroModel } from './dailyReview.model'

const NOW = new Date(2026, 5, 27)
function inDays(n: number): string {
  const t = new Date(NOW)
  t.setDate(t.getDate() + n)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

function render(model: ReturnType<typeof buildHeroModel>, quantGate: boolean): string {
  return renderToString(
    React.createElement(DailyReviewHero, {
      model,
      quantGate,
      onStart: () => {},
      onBuildDeck: () => {},
    }),
  )
}

describe('DailyReviewHero — due / ramp states', () => {
  it('due: shows N due + the start CTA, gentle copy on Track A', () => {
    const html = render(buildHeroModel(5, true, true, undefined, NOW), false)
    expect(html).toContain('5 due')
    expect(html).toContain('Review now →')
    expect(html).toContain('ready to revisit')
  })

  it('due: terse no-peeking copy on the quant gate', () => {
    const html = render(buildHeroModel(5, true, true, undefined, NOW), true)
    expect(html).toContain('Recall cold — no peeking')
  })

  it('ramp: shows the interview-date line', () => {
    const html = render(buildHeroModel(5, true, true, inDays(2), NOW), false)
    expect(html).toContain('Final stretch')
  })
})

describe('DailyReviewHero — the two empty states are distinct (§4.5)', () => {
  it('caught-up: renders the all-caught-up copy and NO build-deck CTA', () => {
    const html = render(buildHeroModel(0, true, true, undefined, NOW), false)
    expect(html).toContain('caught up')
    expect(html).not.toContain('Build deck')
  })

  it('caught-up (quant): terse "come back when cards are due", no praise', () => {
    const html = render(buildHeroModel(0, true, true, undefined, NOW), true)
    expect(html).toContain('Come back when cards are due')
  })

  it('no-deck: renders the Build-your-review-deck affordance, NOT the caught-up copy', () => {
    const html = render(buildHeroModel(0, false, true, undefined, NOW), false)
    expect(html).toContain('Build your review deck')
    expect(html).toContain('Build deck')
    // The §4.5 invariant: the misleading caught-up line is never shown over an empty deck.
    expect(html).not.toContain("all caught up")
  })

  it('no-deck (quant): "No review deck yet" + Build, never the caught-up line', () => {
    const html = render(buildHeroModel(0, false, true, undefined, NOW), true)
    expect(html).toContain('No review deck yet')
    expect(html).not.toContain('Come back when cards are due')
  })

  it('hidden: renders nothing (defer to ResumeHero)', () => {
    const html = render(buildHeroModel(0, false, false, undefined, NOW), false)
    expect(html).toBe('')
  })
})
