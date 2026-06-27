import { describe, it, expect } from 'vitest'
import {
  initialSchedule,
  nextSchedule,
  INIT_EASE,
  EASE_FLOOR,
  MS_PER_DAY,
  type SchedulingState,
} from './scheduling'

const NOW = new Date('2026-06-27T12:00:00.000Z')
const daysOut = (now: Date, n: number) => new Date(now.getTime() + n * MS_PER_DAY)

describe('initialSchedule', () => {
  it('is due in 1 day with init ease, zero reps/lapses', () => {
    const s = initialSchedule(NOW)
    expect(s.intervalDays).toBe(1)
    expect(s.easeFactor).toBe(INIT_EASE)
    expect(s.reps).toBe(0)
    expect(s.lapses).toBe(0)
    expect(s.dueAt.getTime()).toBe(NOW.getTime() + MS_PER_DAY)
  })
})

describe('nextSchedule — plain SM-2 (no target)', () => {
  it('first pass from initial → reps 1, interval 1d, ease 2.6', () => {
    const next = nextSchedule(initialSchedule(NOW), 'pass', { now: NOW })
    expect(next.reps).toBe(1)
    expect(next.intervalDays).toBe(1)
    expect(next.easeFactor).toBeCloseTo(2.6, 10)
    expect(next.lapses).toBe(0)
    expect(next.dueAt.getTime()).toBe(NOW.getTime() + MS_PER_DAY)
  })

  it('second consecutive pass → interval = round(1 * 2.7), reps 2', () => {
    const after1 = nextSchedule(initialSchedule(NOW), 'pass', { now: NOW })
    const after2 = nextSchedule(after1, 'pass', { now: NOW })
    expect(after2.reps).toBe(2)
    expect(after2.easeFactor).toBeCloseTo(2.7, 10)
    expect(after2.intervalDays).toBe(Math.round(1 * 2.7)) // 3
  })

  it('fail resets interval to 1d, ease -0.20, lapses +1, reps 0', () => {
    const advanced: SchedulingState = {
      dueAt: NOW,
      intervalDays: 10,
      easeFactor: 2.5,
      reps: 4,
      lapses: 0,
    }
    const next = nextSchedule(advanced, 'fail', { now: NOW })
    expect(next.intervalDays).toBe(1)
    expect(next.easeFactor).toBeCloseTo(2.3, 10)
    expect(next.lapses).toBe(1)
    expect(next.reps).toBe(0)
  })

  it('ease floor: repeated fails never drop ease below 1.3', () => {
    let s: SchedulingState = initialSchedule(NOW)
    for (let i = 0; i < 20; i++) s = nextSchedule(s, 'fail', { now: NOW })
    expect(s.easeFactor).toBe(EASE_FLOOR)
    expect(s.easeFactor).toBeGreaterThanOrEqual(EASE_FLOOR)
  })

  it('no target → no cap (interval can exceed any window)', () => {
    const advanced: SchedulingState = {
      dueAt: NOW,
      intervalDays: 20,
      easeFactor: 2.5,
      reps: 3,
      lapses: 0,
    }
    const next = nextSchedule(advanced, 'pass', { now: NOW })
    expect(next.intervalDays).toBe(Math.round(20 * 2.6)) // 52
    expect(next.dueAt.getTime()).toBe(NOW.getTime() + 52 * MS_PER_DAY)
  })
})

describe('nextSchedule — interview-date anchoring', () => {
  it('caps dueAt to the target and recomputes interval (target beyond the final window)', () => {
    const target = daysOut(NOW, 5) // 5 days out — outside the 3-day forced-final window
    const advanced: SchedulingState = {
      dueAt: NOW,
      intervalDays: 20,
      easeFactor: 2.5,
      reps: 3,
      lapses: 0,
    }
    // A pass that would schedule ~52 days out, capped to the 5-day target.
    const next = nextSchedule(advanced, 'pass', { now: NOW, targetDate: target })
    expect(next.dueAt.getTime()).toBe(target.getTime())
    expect(next.intervalDays).toBe(5)
  })

  it('forced final review: within 3 days of target, an overshoot lands <= target and >= target-1d', () => {
    const target = daysOut(NOW, 2) // inside the 3-day window
    const advanced: SchedulingState = {
      dueAt: NOW,
      intervalDays: 30,
      easeFactor: 2.5,
      reps: 5,
      lapses: 0,
    }
    const next = nextSchedule(advanced, 'pass', { now: NOW, targetDate: target })
    expect(next.dueAt.getTime()).toBeLessThanOrEqual(target.getTime())
    expect(next.dueAt.getTime()).toBeGreaterThanOrEqual(target.getTime() - MS_PER_DAY)
  })

  it('past target → anchoring ignored (plain SM-2)', () => {
    const target = daysOut(NOW, -1) // already passed
    const advanced: SchedulingState = {
      dueAt: NOW,
      intervalDays: 20,
      easeFactor: 2.5,
      reps: 3,
      lapses: 0,
    }
    const next = nextSchedule(advanced, 'pass', { now: NOW, targetDate: target })
    expect(next.intervalDays).toBe(Math.round(20 * 2.6))
    expect(next.dueAt.getTime()).toBe(NOW.getTime() + 52 * MS_PER_DAY)
  })

  it('target far out (beyond interval) → no cap applied', () => {
    const target = daysOut(NOW, 365)
    const next = nextSchedule(initialSchedule(NOW), 'pass', { now: NOW, targetDate: target })
    expect(next.intervalDays).toBe(1)
    expect(next.dueAt.getTime()).toBe(NOW.getTime() + MS_PER_DAY)
  })
})

describe('nextSchedule — determinism', () => {
  it('same inputs → same outputs (no internal Date.now)', () => {
    const prev = initialSchedule(NOW)
    const a = nextSchedule(prev, 'pass', { now: NOW })
    const b = nextSchedule(prev, 'pass', { now: NOW })
    expect(a).toEqual(b)
  })
})
