// Firestore security-rules unit tests (Phase 18). Exercises the PRD rules matrix
// against the Firestore emulator with @firebase/rules-unit-testing.
//
// Run with the emulator (Java required), kept OUT of the default `npm test`:
//   npm run test:rules
// (wraps `firebase emulators:exec --only firestore "vitest --config
// vitest.rules.config.ts"`).

import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'phht-rules-test',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})

afterAll(async () => {
  await testEnv?.cleanup()
})

beforeEach(async () => {
  await testEnv?.clearFirestore()
})

const alice = () => testEnv.authenticatedContext('alice').firestore()
const bob = () => testEnv.authenticatedContext('bob').firestore()
const anon = () => testEnv.unauthenticatedContext().firestore()

// Seed a doc bypassing rules (simulates Admin SDK / Cloud Function writes).
async function seed(path: string, data: Record<string, unknown>) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), path), data)
  })
}

describe('courses / lessons (seeded content)', () => {
  it('lets any signed-in user read but never write', async () => {
    await seed('courses/c1', { title: 'Course' })
    await seed('lessons/l1', { title: 'Lesson' })
    await assertSucceeds(getDoc(doc(alice(), 'courses/c1')))
    await assertSucceeds(getDoc(doc(alice(), 'lessons/l1')))
    await assertFails(setDoc(doc(alice(), 'courses/c2'), { title: 'x' }))
    await assertFails(setDoc(doc(alice(), 'lessons/l2'), { title: 'x' }))
  })

  it('denies unauthenticated reads', async () => {
    await seed('courses/c1', { title: 'Course' })
    await assertFails(getDoc(doc(anon(), 'courses/c1')))
  })
})

describe('users/{uid} profile', () => {
  it('is owner-scoped', async () => {
    await seed('users/alice', { displayName: 'Alice' })
    await assertSucceeds(getDoc(doc(alice(), 'users/alice')))
    await assertFails(getDoc(doc(bob(), 'users/alice')))
  })

  it('allows create-once with only the whitelisted fields', async () => {
    await assertSucceeds(
      setDoc(doc(alice(), 'users/alice'), {
        displayName: 'Alice',
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      }),
    )
  })

  it('rejects create with an extra (non-whitelisted) field', async () => {
    await assertFails(
      setDoc(doc(alice(), 'users/alice'), {
        displayName: 'Alice',
        masteryStatus: 'mastered',
      }),
    )
  })

  it('allows display-name edit but not mutating createdAt', async () => {
    await seed('users/alice', {
      displayName: 'Alice',
      createdAt: 'orig',
      lastActiveAt: 'orig',
    })
    await assertSucceeds(
      updateDoc(doc(alice(), 'users/alice'), {
        displayName: 'Alicia',
        lastActiveAt: serverTimestamp(),
      }),
    )
    await assertFails(
      updateDoc(doc(alice(), 'users/alice'), { createdAt: 'tampered' }),
    )
  })
})

describe('snapshots (client-authoritative, whitelist)', () => {
  it('accepts a well-formed snapshot write', async () => {
    await assertSucceeds(
      setDoc(doc(alice(), 'users/alice/snapshots/lesson-1'), {
        lessonId: 'lesson-1',
        beatId: 'equation-tiles',
        pattern: 'HH',
        completedBeats: ['open-bet'],
        interactionState: {},
        updatedAt: 'now',
        schemaVersion: 1,
      }),
    )
  })

  it('rejects a snapshot smuggling an unknown/progression key', async () => {
    await assertFails(
      setDoc(doc(alice(), 'users/alice/snapshots/lesson-1'), {
        lessonId: 'lesson-1',
        beatId: 'equation-tiles',
        completedBeats: [],
        interactionState: {},
        updatedAt: 'now',
        schemaVersion: 1,
        completionStatus: 'completed', // smuggled progression field
      }),
    )
  })
})

describe('progress (draft writes ok, progression fields denied)', () => {
  it('allows a non-authoritative draft create (currentBeat)', async () => {
    await assertSucceeds(
      setDoc(doc(alice(), 'users/alice/progress/lesson-1'), {
        currentBeat: 'simulate',
      }),
    )
  })

  it('denies creating progression fields from the client', async () => {
    await assertFails(
      setDoc(doc(alice(), 'users/alice/progress/lesson-1'), {
        completionStatus: 'completed',
      }),
    )
    await assertFails(
      setDoc(doc(alice(), 'users/alice/progress/lesson-1'), {
        masteryStatus: 'mastered',
      }),
    )
  })

  it('denies updating a progression field, allows updating a draft field', async () => {
    await seed('users/alice/progress/lesson-1', {
      currentBeat: 'simulate',
      completionStatus: 'in_progress',
    })
    await assertFails(
      updateDoc(doc(alice(), 'users/alice/progress/lesson-1'), {
        completionStatus: 'completed',
      }),
    )
    await assertSucceeds(
      updateDoc(doc(alice(), 'users/alice/progress/lesson-1'), {
        currentBeat: 'failure-edge',
      }),
    )
  })
})

describe('milestones / streaks (Cloud Functions only)', () => {
  it('allows owner reads but denies all client writes', async () => {
    await seed('users/alice/milestones/hh-ht-mastered', { milestoneId: 'x' })
    await seed('users/alice/streaks/current', { count: 1 })

    await assertSucceeds(
      getDoc(doc(alice(), 'users/alice/milestones/hh-ht-mastered')),
    )
    await assertSucceeds(getDoc(doc(alice(), 'users/alice/streaks/current')))

    await assertFails(
      setDoc(doc(alice(), 'users/alice/milestones/forged'), {
        milestoneId: 'forged',
      }),
    )
    await assertFails(
      setDoc(doc(alice(), 'users/alice/streaks/current'), { count: 999 }),
    )
  })
})
