import { describe, it, expect } from 'vitest'
import { railSegments, biasChipState } from './phases'

describe('per-beat progress rail', () => {
  // A non-flagship lesson's beats — the old hardcoded config covered none of
  // these, so the rail used to stay static. It now derives from the sequence.
  const beatIds = [
    'cov1-recall',
    'cov1-bet',
    'cov1-primer-square',
    'cov1-explore',
    'cov1-recap',
  ]

  it('has one segment per beat in lesson order', () => {
    expect(railSegments(beatIds, 0).map((s) => s.beatId)).toEqual(beatIds)
  })

  it('marks the current beat current, earlier complete, later upcoming', () => {
    const segs = railSegments(beatIds, 2)
    expect(segs.map((s) => s.state)).toEqual([
      'complete',
      'complete',
      'current',
      'upcoming',
      'upcoming',
    ])
    expect(segs.find((s) => s.state === 'current')?.beatId).toBe(
      'cov1-primer-square',
    )
  })

  it('advances the current segment monotonically across the walk', () => {
    let prev = -1
    beatIds.forEach((_, index) => {
      const currentIdx = railSegments(beatIds, index).findIndex(
        (s) => s.state === 'current',
      )
      expect(currentIdx).toBe(index)
      expect(currentIdx).toBeGreaterThan(prev)
      prev = currentIdx
    })
  })

  it('exposes the off-rail bias chip: active on the sandbox, available in Prove, hidden earlier', () => {
    expect(biasChipState('bias-sandbox')).toBe('active')
    expect(biasChipState('theory-vs-sim')).toBe('available')
    expect(biasChipState('open-bet')).toBe('hidden')
    expect(biasChipState('simulate')).toBe('hidden')
  })
})
