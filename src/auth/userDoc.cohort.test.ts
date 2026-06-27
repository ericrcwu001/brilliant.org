// spec-05 ensureRolloutCohort — assign-ONCE persistence (D17, README §4.5).
// firebase/app + firebase/firestore are mocked so the helper runs against a tiny
// in-memory doc store (no SDK boot, no emulator).

import { describe, it, expect, beforeEach, vi } from 'vitest'

// A per-path doc registry the mocked firestore reads/writes against.
const store = new Map<string, Record<string, unknown>>()
const updates: { path: string; data: Record<string, unknown> }[] = []

vi.mock('../firebase/app', () => ({
  getDb: vi.fn(async () => ({})),
}))

vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, col: string, id: string) => ({ path: `${col}/${id}` }),
  getDoc: async (ref: { path: string }) => {
    const data = store.get(ref.path)
    return { exists: () => data !== undefined, data: () => data }
  },
  updateDoc: async (ref: { path: string }, data: Record<string, unknown>) => {
    updates.push({ path: ref.path, data })
    store.set(ref.path, { ...(store.get(ref.path) ?? {}), ...data })
  },
  serverTimestamp: () => '<<ts>>',
  deleteField: () => '<<delete>>',
}))

import { ensureRolloutCohort } from './userDoc'

beforeEach(() => {
  store.clear()
  updates.length = 0
})

describe('ensureRolloutCohort (assign-once)', () => {
  it('writes the cohort when the doc has none yet', async () => {
    store.set('users/u1', { displayName: 'U' })
    const cohort = await ensureRolloutCohort('u1', 'treatment')
    expect(cohort).toBe('treatment')
    expect(updates).toHaveLength(1)
    expect(updates[0].data.rolloutCohort).toBe('treatment')
  })

  it('does NOT overwrite an existing cohort (a second call / raised % is a no-op)', async () => {
    store.set('users/u1', { displayName: 'U', rolloutCohort: 'holdout' })
    // Even if the deterministic re-computation now says treatment, assign-once wins.
    const cohort = await ensureRolloutCohort('u1', 'treatment')
    expect(cohort).toBe('holdout') // unchanged
    expect(updates).toHaveLength(0) // never written
  })

  it('returns the desired cohort and writes it when the doc is missing entirely', async () => {
    // No doc at users/u1 yet (getDoc.exists() === false) → still writes.
    const cohort = await ensureRolloutCohort('u1', 'holdout')
    expect(cohort).toBe('holdout')
    expect(updates).toHaveLength(1)
    expect(updates[0].data.rolloutCohort).toBe('holdout')
  })
})
