// Snapshot round-trip tests (spec-02 / Foundation C). NODE env. snapshot.ts
// imports ../firebase/app at module load; mock it so no Firebase init runs.
import { describe, it, expect, vi } from 'vitest'

vi.mock('../firebase/app', () => ({
  getDb: vi.fn(),
  getFns: vi.fn(),
  auth: { currentUser: null },
  usingEmulators: true,
  app: {},
}))

import { toSnapshot, confidencesOf, repWindowOf, type SnapshotInput } from './snapshot'
import { SnapshotSchema } from '../content/schema'

const baseInput: SnapshotInput = {
  lessonId: 'lesson-x',
  beatId: 'mc-1',
  pattern: 'HH',
  completedBeats: ['b0'],
  lessonState: {},
  hintLevelByBeat: {},
  maxHintLevelByBeat: {},
  confidenceByBeat: {},
  repWindow: [],
}

describe('toSnapshot — confidenceByBeat (spec-02)', () => {
  it('includes confidenceByBeat in interactionState', () => {
    const snap = toSnapshot(
      { ...baseInput, confidenceByBeat: { 'mc-1': 0.85 } },
      '2026-01-01T00:00:00.000Z',
    )
    expect(snap.interactionState.confidenceByBeat).toEqual({ 'mc-1': 0.85 })
  })

  it('always sets the key (empty record, never undefined) so we never write undefined', () => {
    const snap = toSnapshot(baseInput, '2026-01-01T00:00:00.000Z')
    expect(snap.interactionState.confidenceByBeat).toEqual({})
  })

  it('round-trips through SnapshotSchema (additive optional field parses)', () => {
    const snap = toSnapshot(
      { ...baseInput, confidenceByBeat: { 'mc-1': 0.7 } },
      '2026-01-01T00:00:00.000Z',
    )
    const parsed = SnapshotSchema.parse(snap)
    expect(parsed.interactionState.confidenceByBeat).toEqual({ 'mc-1': 0.7 })
  })
})

describe('confidencesOf', () => {
  it('round-trips a written map', () => {
    const snap = toSnapshot(
      { ...baseInput, confidenceByBeat: { 'mc-1': 0.85 } },
      '2026-01-01T00:00:00.000Z',
    )
    expect(confidencesOf(snap)).toEqual({ 'mc-1': 0.85 })
  })

  it('returns {} (never undefined) when the field is absent', () => {
    const parsed = SnapshotSchema.parse({
      lessonId: 'l',
      beatId: 'b',
      completedBeats: [],
      interactionState: {},
      updatedAt: '2026-01-01T00:00:00.000Z',
      schemaVersion: 1,
    })
    expect(confidencesOf(parsed)).toEqual({})
  })
})

describe('repWindow round-trip (spec-21)', () => {
  it('includes repWindow in interactionState and round-trips through the schema', () => {
    const snap = toSnapshot(
      { ...baseInput, repWindow: [true, false, true] },
      '2026-01-01T00:00:00.000Z',
    )
    expect(snap.interactionState.repWindow).toEqual([true, false, true])
    const parsed = SnapshotSchema.parse(snap)
    expect(repWindowOf(parsed)).toEqual([true, false, true])
  })

  it('always sets the key (empty array, never undefined) so we never write undefined', () => {
    const snap = toSnapshot(baseInput, '2026-01-01T00:00:00.000Z')
    expect(snap.interactionState.repWindow).toEqual([])
  })

  it('repWindowOf returns [] (never undefined) when the field is absent', () => {
    const parsed = SnapshotSchema.parse({
      lessonId: 'l',
      beatId: 'b',
      completedBeats: [],
      interactionState: {},
      updatedAt: '2026-01-01T00:00:00.000Z',
      schemaVersion: 1,
    })
    expect(repWindowOf(parsed)).toEqual([])
  })
})
