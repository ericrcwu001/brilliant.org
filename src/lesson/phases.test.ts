import { describe, it, expect } from 'vitest'
import lessonFixture from '../../fixtures/lesson-pattern-hitting-times.json'
import { LessonSchema } from '../content/schema'
import { PHASES, getPhaseProgress } from './phases'

const lesson = LessonSchema.parse(lessonFixture)
const beatOrder = lesson.beats.map((b) => b.beatId)

describe('phase rail mapping', () => {
  it('maps every flagship beat to a phase', () => {
    for (const beatId of beatOrder) {
      const p = getPhaseProgress(beatId)
      expect(p.currentPhaseIndex).toBeGreaterThanOrEqual(0)
      expect(p.currentPhaseIndex).toBeLessThan(PHASES.length)
    }
  })

  it('advances through all four phases in order as you Continue', () => {
    const indices = beatOrder.map((b) => getPhaseProgress(b).currentPhaseIndex)
    // Non-decreasing across the linear walk...
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThanOrEqual(indices[i - 1])
    }
    // ...and every one of the four segments is reached.
    expect(new Set(indices)).toEqual(new Set([0, 1, 2, 3]))
  })

  it('marks bias-sandbox off-rail with no step counter', () => {
    const p = getPhaseProgress('bias-sandbox')
    expect(p.offRail).toBe(true)
    expect(p.step).toBeNull()
  })

  it('shows step-within-phase for on-rail beats (Model · 1/4 at failure-edge)', () => {
    const p = getPhaseProgress('failure-edge')
    expect(p).toMatchObject({ currentPhaseIndex: 2, step: 1, steps: 4, offRail: false })
  })
})
