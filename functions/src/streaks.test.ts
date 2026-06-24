import { describe, it, expect } from 'vitest'
import {
  computeStreakUpdate,
  previousDate,
  localDateInTimezone,
  type StreakDoc,
} from './streaks'

describe('computeStreakUpdate', () => {
  it('starts a streak at 1 on the first activity', () => {
    const { next, incremented } = computeStreakUpdate(
      undefined,
      '2026-06-23',
      'UTC',
    )
    expect(incremented).toBe(true)
    expect(next.count).toBe(1)
    expect(next.longest).toBe(1)
    expect(next.lastActiveDate).toBe('2026-06-23')
  })

  it('is idempotent on the same local day', () => {
    const current: StreakDoc = {
      count: 3,
      longest: 5,
      lastActiveDate: '2026-06-23',
      timezone: 'UTC',
    }
    const { next, incremented } = computeStreakUpdate(
      current,
      '2026-06-23',
      'UTC',
    )
    expect(incremented).toBe(false)
    expect(next.count).toBe(3)
    expect(next.longest).toBe(5)
  })

  it('continues the streak on the next consecutive day', () => {
    const current: StreakDoc = {
      count: 3,
      longest: 3,
      lastActiveDate: '2026-06-23',
      timezone: 'UTC',
    }
    const { next, incremented } = computeStreakUpdate(
      current,
      '2026-06-24',
      'UTC',
    )
    expect(incremented).toBe(true)
    expect(next.count).toBe(4)
    expect(next.longest).toBe(4)
  })

  it('resets to 1 after a gap, preserving the longest streak', () => {
    const current: StreakDoc = {
      count: 4,
      longest: 4,
      lastActiveDate: '2026-06-23',
      timezone: 'UTC',
    }
    const { next, incremented } = computeStreakUpdate(
      current,
      '2026-06-26',
      'UTC',
    )
    expect(incremented).toBe(true)
    expect(next.count).toBe(1)
    expect(next.longest).toBe(4)
  })
})

describe('previousDate', () => {
  it('handles month and year boundaries', () => {
    expect(previousDate('2026-06-24')).toBe('2026-06-23')
    expect(previousDate('2026-07-01')).toBe('2026-06-30')
    expect(previousDate('2026-01-01')).toBe('2025-12-31')
  })
})

describe('localDateInTimezone', () => {
  it('formats as YYYY-MM-DD', () => {
    expect(localDateInTimezone('UTC', new Date('2026-06-23T12:00:00Z'))).toBe(
      '2026-06-23',
    )
  })

  it('respects the timezone day boundary', () => {
    // 02:00 UTC is still the previous day in New York (UTC-4 in June).
    expect(
      localDateInTimezone('America/New_York', new Date('2026-06-23T02:00:00Z')),
    ).toBe('2026-06-22')
  })
})
