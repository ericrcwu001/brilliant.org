import { describe, it, expect } from 'vitest'
import { isQuantIntensity } from './track'
import type { UserDoc } from './userDoc'
import type { Progress } from '../content/schema'

const doc = (p: Partial<UserDoc>): UserDoc => ({ displayName: 'x', ...p })

describe('isQuantIntensity (quant-intensity gate, README §4 helper)', () => {
  it('fails GENTLE when nothing is set (undefined/null inputs)', () => {
    expect(isQuantIntensity(undefined)).toBe(false)
    expect(isQuantIntensity(null)).toBe(false)
    expect(isQuantIntensity(doc({}))).toBe(false)
  })

  it('is true for Track B (per-concept overrides userDoc)', () => {
    expect(isQuantIntensity(doc({ defaultTrack: 'B' }))).toBe(true)
    expect(isQuantIntensity(doc({ defaultTrack: 'A' }), { track: 'B' } as Progress)).toBe(true)
  })

  it('per-concept Track A overrides a userDoc Track B (fails gentle to the concept)', () => {
    expect(isQuantIntensity(doc({ defaultTrack: 'B' }), { track: 'A' } as Progress)).toBe(false)
  })

  it('is true for the interview learningGoal regardless of track', () => {
    expect(isQuantIntensity(doc({ learningGoal: 'interview' }))).toBe(true)
    expect(isQuantIntensity(doc({ defaultTrack: 'A', learningGoal: 'interview' }))).toBe(true)
  })

  it('is gentle for non-interview goals on Track A', () => {
    expect(isQuantIntensity(doc({ defaultTrack: 'A', learningGoal: 'school' }))).toBe(false)
  })
})
