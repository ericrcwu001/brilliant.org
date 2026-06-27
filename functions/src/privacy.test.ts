// spec-05 deleteLearningData — cascade-delete enumeration + idempotency (§4.6).
// firebase-admin/firestore is mocked with a tiny in-memory store: collections are
// path-prefix groups; recursiveDelete drops a collection; doc set/merge + the
// FieldValue sentinels are honored so field-clears are observable.
//
// The store + fakeDb are built INSIDE the (hoisted) vi.mock factory and exposed
// via __store so the const-init-order trap is avoided (privacy.ts calls
// getFirestore() at module load).

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('firebase-admin/firestore', () => {
  const DELETE = { __op: 'delete' }
  const TS = { __op: 'ts' }
  const store = new Map<string, Record<string, unknown>>()

  function applyMerge(prev: Record<string, unknown>, data: Record<string, unknown>) {
    const next = { ...prev }
    for (const [k, v] of Object.entries(data)) {
      if (v === DELETE) delete next[k]
      else if (v === TS) next[k] = '<<ts>>'
      else next[k] = v
    }
    return next
  }

  const fakeDb = {
    doc: (path: string) => ({
      path,
      get: async () => {
        const data = store.get(path)
        return { exists: data !== undefined, data: () => data, get: (k: string) => data?.[k] }
      },
      set: async (data: Record<string, unknown>, opts?: { merge?: boolean }) => {
        const prev = opts?.merge ? store.get(path) ?? {} : {}
        store.set(path, applyMerge(prev, data))
      },
    }),
    collection: (col: string) => ({
      __col: col,
      get: async () => {
        const prefix = `${col}/`
        const docs = [...store.entries()]
          .filter(([k]) => k.startsWith(prefix))
          .map(([path, data]) => ({ ref: fakeDb.doc(path), data: () => data }))
        return { docs }
      },
    }),
    recursiveDelete: async (ref: { __col: string }) => {
      const prefix = `${ref.__col}/`
      for (const key of [...store.keys()]) {
        if (key.startsWith(prefix)) store.delete(key)
      }
    },
  }

  return {
    __store: store,
    getFirestore: () => fakeDb,
    FieldValue: { delete: () => DELETE, serverTimestamp: () => TS },
  }
})
vi.mock('firebase-functions/v2/https', () => ({
  onCall: vi.fn(() => undefined),
  HttpsError: class HttpsError extends Error {
    constructor(public code: string, message: string) {
      super(message)
    }
  },
}))

import { deleteLearningDataFor } from './privacy'
// Reach into the mock's exposed store.
import * as adminFirestore from 'firebase-admin/firestore'
const store = (adminFirestore as unknown as { __store: Map<string, Record<string, unknown>> })
  .__store

function seedUser() {
  store.clear()
  store.set('users/u1', {
    displayName: 'U',
    learningGoal: 'interview',
    defaultTrack: 'B',
    targetInterviewDate: '2026-09-01',
    rolloutCohort: 'treatment',
  })
  store.set('users/u1/reviews/lesson-a__b1', { lessonId: 'lesson-a', lastResult: 'pass' })
  store.set('users/u1/reviews/lesson-a__b2', { lessonId: 'lesson-a', lapses: 2 })
  store.set('users/u1/calibration/summary', { n: 5, brier: 0.1 })
  store.set('users/u1/interviews/att-1', {
    conceptId: 'course-x',
    status: 'graded',
    calibration: { n: 3, brier: 0.2 },
    transcript: [
      { role: 'user', text: 'hello', confidence: 0.8 },
      { role: 'assistant', text: 'go on' },
    ],
  })
  // A second user's data — must be UNTOUCHED (owner-only).
  store.set('users/u2/reviews/lesson-z__b1', { lessonId: 'lesson-z' })
  store.set('users/u2', { displayName: 'Other', rolloutCohort: 'holdout' })
}

beforeEach(seedUser)

describe('deleteLearningDataFor (§4.6 enumeration)', () => {
  it('empties the reviews + calibration subcollections', async () => {
    await deleteLearningDataFor('u1')
    const remaining = [...store.keys()].filter(
      (k) => k.startsWith('users/u1/reviews/') || k.startsWith('users/u1/calibration/'),
    )
    expect(remaining).toEqual([])
  })

  it('field-clears the per-attempt calibration block + per-turn transcript confidence', async () => {
    await deleteLearningDataFor('u1')
    const att = store.get('users/u1/interviews/att-1') as Record<string, unknown>
    expect(att).toBeDefined() // the interview DOC survives
    expect('calibration' in att).toBe(false) // calibration block cleared
    const transcript = att.transcript as Array<Record<string, unknown>>
    expect(transcript).toHaveLength(2) // turns kept (text/audio-text intact)
    expect('confidence' in transcript[0]).toBe(false) // per-turn confidence cleared
    expect(transcript[0].text).toBe('hello') // spoken-answer text preserved
  })

  it('removes the userDoc plan fields (targetInterviewDate, rolloutCohort) but keeps the account', async () => {
    await deleteLearningDataFor('u1')
    const u = store.get('users/u1') as Record<string, unknown>
    expect(u).toBeDefined() // account intact
    expect(u.displayName).toBe('U') // profile intact
    expect('targetInterviewDate' in u).toBe(false)
    expect('rolloutCohort' in u).toBe(false)
  })

  it('NEVER touches another user (owner-only)', async () => {
    await deleteLearningDataFor('u1')
    expect(store.get('users/u2/reviews/lesson-z__b1')).toBeDefined()
    expect((store.get('users/u2') as Record<string, unknown>).rolloutCohort).toBe('holdout')
  })

  it('is IDEMPOTENT (a second call succeeds and is a no-op)', async () => {
    await deleteLearningDataFor('u1')
    const summary1 = await deleteLearningDataFor('u1') // re-run on already-deleted data
    expect(summary1.reviewsDeleted).toBe(true)
    expect(summary1.calibrationDeleted).toBe(true)
    const u = store.get('users/u1') as Record<string, unknown>
    expect('rolloutCohort' in u).toBe(false)
  })

  it('returns a summary counting the cleared interview', async () => {
    const summary = await deleteLearningDataFor('u1')
    expect(summary.interviewsCleared).toBe(1)
    expect(summary.userFieldsCleared).toBe(true)
  })
})
