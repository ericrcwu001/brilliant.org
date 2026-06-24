import { describe, it, expect } from 'vitest'
import lessonFixture from '../../fixtures/lesson-pattern-hitting-times.json'
import { LessonSchema } from '../content/schema'
import { RAIL_BEAT_IDS, getRail, biasChipState, OFF_RAIL_AFTER } from './phases'

const lesson = LessonSchema.parse(lessonFixture)
const beatOrder = lesson.beats.map((b) => b.beatId)

describe('per-beat progress rail', () => {
  it('has one segment per beat in lesson order, minus the off-rail beats', () => {
    expect(RAIL_BEAT_IDS).toEqual(beatOrder.filter((b) => !OFF_RAIL_AFTER[b]))
  })

  it('groups every rail beat under exactly one phase tint', () => {
    const segs = getRail('open-bet')
    expect(segs.map((s) => s.phase)).toEqual([
      'Bet',
      'Bet',
      'Explore',
      'Model',
      'Model',
      'Model',
      'Model',
      'Prove',
      'Prove',
      'Prove',
    ])
  })

  it('marks the current beat current, earlier beats complete, later upcoming', () => {
    const segs = getRail('failure-edge')
    const current = segs.find((s) => s.state === 'current')
    expect(current?.beatId).toBe('failure-edge')
    const idx = RAIL_BEAT_IDS.indexOf('failure-edge')
    segs.forEach((s, i) => {
      if (i < idx) expect(s.state).toBe('complete')
      else if (i > idx) expect(s.state).toBe('upcoming')
    })
  })

  it('advances the current segment monotonically across the linear walk', () => {
    let prev = -1
    for (const beatId of RAIL_BEAT_IDS) {
      const currentIdx = getRail(beatId).findIndex((s) => s.state === 'current')
      expect(currentIdx).toBe(RAIL_BEAT_IDS.indexOf(beatId))
      expect(currentIdx).toBeGreaterThan(prev)
      prev = currentIdx
    }
  })

  it('keeps bias-sandbox off the rail: no current segment, overlap complete, recap upcoming', () => {
    const segs = getRail('bias-sandbox')
    expect(segs.some((s) => s.beatId === 'bias-sandbox')).toBe(false)
    expect(segs.some((s) => s.state === 'current')).toBe(false)
    expect(segs.find((s) => s.beatId === 'overlap')?.state).toBe('complete')
    expect(segs.find((s) => s.beatId === 'recap')?.state).toBe('upcoming')
  })

  it('exposes the off-rail bias chip: active on the sandbox, available in Prove, hidden earlier', () => {
    expect(biasChipState('bias-sandbox')).toBe('active')
    expect(biasChipState('theory-vs-sim')).toBe('available')
    expect(biasChipState('open-bet')).toBe('hidden')
    expect(biasChipState('simulate')).toBe('hidden')
  })
})
