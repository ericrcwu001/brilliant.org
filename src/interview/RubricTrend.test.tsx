// Presentational smoke for RubricTrend + its loading skeleton (renderToString,
// node env — neither component has effects). Guards two contracts:
//   1. RubricTrendSkeleton announces aria-busy and mirrors the chart shape.
//   2. The real empty-state message survives — the skeleton must NOT replace
//      RubricTrend's "Finish a Capstone interview…" copy when attempts === [].
import { renderToString } from 'react-dom/server'
import { describe, it, expect, vi } from 'vitest'

// RubricTrend imports selectors from ./attempts, which imports getDb from
// '../firebase/app'; mock it so Firebase init doesn't crash in the node env
// (no valid config in tests). Mirrors src/interview/attempts.test.ts.
vi.mock('../firebase/app', () => ({
  getDb: vi.fn(),
  getFns: vi.fn(),
  auth: { currentUser: null },
  usingEmulators: true,
  app: {},
}))

import { RubricTrend, RubricTrendSkeleton } from './RubricTrend'

describe('RubricTrendSkeleton (loading placeholder)', () => {
  it('announces aria-busy while loading', () => {
    const html = renderToString(<RubricTrendSkeleton variant="full" />)
    expect(html).toContain('aria-busy="true"')
  })

  it('renders one bar placeholder per chart slot', () => {
    const html = renderToString(<RubricTrendSkeleton variant="full" />)
    const bars = html.match(/rubric-trend-skeleton__bar/g) ?? []
    expect(bars.length).toBe(5)
  })

  it('composes the shared .skeleton shimmer primitive', () => {
    const html = renderToString(<RubricTrendSkeleton variant="full" />)
    expect(html).toContain('skeleton rubric-trend-skeleton__bar')
  })

  it('compact variant omits the per-dimension rows', () => {
    const html = renderToString(<RubricTrendSkeleton variant="compact" />)
    expect(html).not.toContain('rubric-trend-skeleton__dim')
  })
})

describe('RubricTrend empty state', () => {
  it('shows the real empty-state message for [] (not a skeleton)', () => {
    const html = renderToString(<RubricTrend attempts={[]} />)
    expect(html).toContain('Finish a Capstone interview')
    expect(html).not.toContain('aria-busy')
  })
})
