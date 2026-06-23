import { describe, it, expect } from 'vitest'
import {
  initialLadder,
  isRevealed,
  needsReview,
  onCorrect,
  onTryAgain,
  onWrong,
} from './hintLadder'

const wrongTimes = (n: number, max = 3) => {
  let s = initialLadder
  for (let i = 0; i < n; i++) s = onWrong(s, max)
  return s
}

describe('hint ladder escalation (max 3)', () => {
  it('escalates nudge -> highlight -> reveal on successive wrong submits', () => {
    expect(wrongTimes(1).level).toBe(1)
    expect(wrongTimes(2).level).toBe(2)
    expect(wrongTimes(3).level).toBe(3)
    expect(isRevealed(wrongTimes(3))).toBe(true)
    expect(isRevealed(wrongTimes(2))).toBe(false)
  })

  it('does not climb past the reveal on further wrong submits', () => {
    expect(wrongTimes(5).level).toBe(3)
  })
})

describe('hint ladder cap of 2 (transfer setup beats)', () => {
  it('stops at level 2 and never reveals', () => {
    const s = wrongTimes(3, 2)
    expect(s.level).toBe(2)
    expect(isRevealed(s)).toBe(false)
    expect(s.everRevealed).toBe(false)
  })
})

describe('hint ladder reset', () => {
  it('resets the visible level on a correct submit', () => {
    const s = onCorrect(wrongTimes(2))
    expect(s.level).toBe(0)
    expect(s.outcome).toBe('correct')
  })

  it('clears the strip on Try again but keeps needsReview accounting', () => {
    const revealed = wrongTimes(3)
    const after = onTryAgain(revealed)
    expect(after.level).toBe(0)
    expect(after.outcome).toBe('idle')
    expect(after.everRevealed).toBe(true)
  })
})

describe('needsReview thresholds', () => {
  it('flags on a reveal for Required beats', () => {
    expect(needsReview(wrongTimes(3), true)).toBe(true)
  })

  it('flags on 3+ wrong submits even when capped before reveal', () => {
    expect(needsReview(wrongTimes(3, 2), true)).toBe(true)
  })

  it('does not flag before the thresholds', () => {
    expect(needsReview(wrongTimes(2), true)).toBe(false)
  })

  it('never flags on Extension beats', () => {
    expect(needsReview(wrongTimes(3), false)).toBe(false)
    expect(needsReview(wrongTimes(5), false)).toBe(false)
  })

  it('keeps needsReview after a correct submit following a reveal', () => {
    expect(needsReview(onCorrect(wrongTimes(3)), true)).toBe(true)
  })
})
