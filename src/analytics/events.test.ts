import { describe, it, expect, beforeEach, vi } from 'vitest'

// events.ts imports the eager firebase/app singleton (which calls getAuth on
// load and throws without a real api key in node). Mock it — the param-assembly
// helpers under test never touch Firebase. Mirrors src/interview/attempts.test.ts.
vi.mock('../firebase/app', () => ({
  app: {},
  auth: { currentUser: null },
  usingEmulators: true,
}))

import { buildEventParams, setAnalyticsDimensions } from './events'

// spec-04 §5 case 8 — the omit-undefined (fail-absent) dimension contract.
// Tests the PURE param-assembly helper (buildEventParams) so no real Firebase /
// logEvent is needed: the helper is exactly what track() spreads into logEvent.

describe('analytics session dimensions (spec-04 §3.2 Layer 1)', () => {
  beforeEach(() => {
    // Reset module-scoped dimensions between cases (set once per session in prod).
    setAnalyticsDimensions({ cohort: undefined, track: undefined })
  })

  it('omits cohort/track keys entirely when unset (fail-absent)', () => {
    setAnalyticsDimensions({})
    const params = buildEventParams('uid-1', { lessonId: 'l1' })
    expect('cohort' in params).toBe(false)
    expect('track' in params).toBe(false)
    expect(params).toMatchObject({ uid: 'uid-1', lessonId: 'l1' })
    expect(typeof params.client_ts).toBe('number')
  })

  it('carries cohort once it is set (stamped by spec-05)', () => {
    setAnalyticsDimensions({ cohort: 'treatment' })
    const params = buildEventParams('uid-1', { lessonId: 'l1' })
    expect(params.cohort).toBe('treatment')
    expect('track' in params).toBe(false) // track still unset → omitted
  })

  it('merges dimensions across calls and carries the control arm literal', () => {
    setAnalyticsDimensions({ cohort: 'holdout' })
    setAnalyticsDimensions({ track: 'B' }) // independent later resolution
    const params = buildEventParams('uid-1', {})
    expect(params.cohort).toBe('holdout')
    expect(params.track).toBe('B')
  })

  it('call params win over auto-carried keys (spread order)', () => {
    setAnalyticsDimensions({})
    const params = buildEventParams('uid-1', { uid: 'override' })
    expect(params.uid).toBe('override')
  })
})
