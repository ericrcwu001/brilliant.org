import { describe, it, expect } from 'vitest'
import { linScale, niceTicks, fmtTick } from './plot'

describe('linScale', () => {
  it('maps domain endpoints to range endpoints', () => {
    const s = linScale(0, 10, 0, 100)
    expect(s(0)).toBe(0)
    expect(s(10)).toBe(100)
    expect(s(5)).toBe(50)
  })
  it('supports an inverted (SVG y) range', () => {
    const s = linScale(0, 1, 200, 0)
    expect(s(0)).toBe(200)
    expect(s(1)).toBe(0)
  })
  it('does not divide by zero on a degenerate domain', () => {
    const s = linScale(5, 5, 0, 100)
    expect(Number.isFinite(s(5))).toBe(true)
  })
})

describe('niceTicks', () => {
  it('produces round ticks within the domain', () => {
    const ticks = niceTicks(0, 10)
    expect(ticks[0]).toBeGreaterThanOrEqual(0)
    expect(ticks[ticks.length - 1]).toBeLessThanOrEqual(10)
    expect(ticks).toContain(0)
    expect(ticks).toContain(10)
  })
  it('returns a single value for a degenerate range', () => {
    expect(niceTicks(3, 3)).toEqual([3])
  })
  it('handles reversed args', () => {
    expect(niceTicks(10, 0).length).toBeGreaterThan(1)
  })
  it('avoids negative zero', () => {
    const ticks = niceTicks(-1, 1)
    expect(ticks).toContain(0)
    expect(ticks.some((t) => Object.is(t, -0))).toBe(false)
  })
})

describe('fmtTick', () => {
  it('renders integers without decimals', () => {
    expect(fmtTick(3)).toBe('3')
  })
  it('trims trailing zeros', () => {
    expect(fmtTick(0.5)).toBe('0.5')
    expect(fmtTick(0.2)).toBe('0.2')
  })
})
