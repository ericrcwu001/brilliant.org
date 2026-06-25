import { describe, it, expect } from 'vitest'
import { runsDueByElapsed } from './useProgressiveRuns'

describe('runsDueByElapsed', () => {
  const cadence = 12
  const total = 200

  it('is 0 before the first cadence interval elapses', () => {
    expect(runsDueByElapsed(0, cadence, total)).toBe(0)
    expect(runsDueByElapsed(11, cadence, total)).toBe(0)
  })

  it('advances one run per cadence interval', () => {
    expect(runsDueByElapsed(12, cadence, total)).toBe(1)
    expect(runsDueByElapsed(24, cadence, total)).toBe(2)
    expect(runsDueByElapsed(120, cadence, total)).toBe(10)
  })

  it('clamps at total (never overshoots)', () => {
    expect(runsDueByElapsed(total * cadence, cadence, total)).toBe(total)
    expect(runsDueByElapsed(999_999, cadence, total)).toBe(total)
  })

  it('is monotonic non-decreasing in elapsed time', () => {
    let prev = 0
    for (let ms = 0; ms <= total * cadence + 100; ms += 7) {
      const v = runsDueByElapsed(ms, cadence, total)
      expect(v).toBeGreaterThanOrEqual(prev)
      expect(v).toBeLessThanOrEqual(total)
      prev = v
    }
  })

  it('treats a non-positive cadence as "run everything immediately"', () => {
    expect(runsDueByElapsed(0, 0, total)).toBe(total)
    expect(runsDueByElapsed(5, -1, total)).toBe(total)
  })

  it('returns 0 for an empty batch or non-positive elapsed', () => {
    expect(runsDueByElapsed(1000, cadence, 0)).toBe(0)
    expect(runsDueByElapsed(-5, cadence, total)).toBe(0)
  })
})
