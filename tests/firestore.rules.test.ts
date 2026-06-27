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
  deleteDoc,
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

  it('allows the owner to set targetInterviewDate (alone and with lastActiveAt)', async () => {
    await seed('users/alice', { displayName: 'Alice', lastActiveAt: 'orig' })
    await assertSucceeds(
      updateDoc(doc(alice(), 'users/alice'), {
        targetInterviewDate: '2026-09-01',
      }),
    )
    await assertSucceeds(
      updateDoc(doc(alice(), 'users/alice'), {
        targetInterviewDate: '2026-09-02',
        lastActiveAt: serverTimestamp(),
      }),
    )
  })

  it('denies a non-owner setting targetInterviewDate', async () => {
    await seed('users/alice', { displayName: 'Alice' })
    await assertFails(
      updateDoc(doc(bob(), 'users/alice'), {
        targetInterviewDate: '2026-09-01',
      }),
    )
  })

  it('denies a userDoc update smuggling a progression field alongside targetInterviewDate', async () => {
    await seed('users/alice', { displayName: 'Alice' })
    await assertFails(
      updateDoc(doc(alice(), 'users/alice'), {
        targetInterviewDate: '2026-09-01',
        masteryStatus: 'mastered', // not in the update whitelist
      }),
    )
  })

  // spec-05: rolloutCohort is a client-writable, non-progression field (assign-once
  // in the app; the rules just whitelist it).
  it('allows the owner to set rolloutCohort (in the update whitelist)', async () => {
    await seed('users/alice', { displayName: 'Alice', lastActiveAt: 'orig' })
    await assertSucceeds(
      updateDoc(doc(alice(), 'users/alice'), {
        rolloutCohort: 'treatment',
        lastActiveAt: serverTimestamp(),
      }),
    )
  })

  it('denies a userDoc client DELETE (cascade-delete is Admin-SDK-driven — §4.6)', async () => {
    await seed('users/alice', { displayName: 'Alice', rolloutCohort: 'holdout' })
    await assertFails(deleteDoc(doc(alice(), 'users/alice')))
  })
})

describe('config/flags (Admin-seeded; spec-05)', () => {
  it('allows any signed-in user to READ but DENIES client writes', async () => {
    await seed('config/flags', { goldMint: false, rolloutPercent: 0 })
    await assertSucceeds(getDoc(doc(alice(), 'config/flags')))
    // A learner must never flip a feature flag from the client.
    await assertFails(
      setDoc(doc(alice(), 'config/flags'), { goldMint: true }),
    )
    await assertFails(
      updateDoc(doc(alice(), 'config/flags'), { rolloutPercent: 100 }),
    )
  })

  it('denies unauthenticated reads of config', async () => {
    await seed('config/flags', { goldMint: false })
    await assertFails(getDoc(doc(anon(), 'config/flags')))
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

describe('interviews / interviewUsage / interviewState (Cloud Functions only)', () => {
  it('allows owner reads but denies all client writes', async () => {
    // Simulate Cloud Function writes (Admin SDK bypasses rules).
    await seed('users/alice/interviews/attempt-1', {
      conceptId: 'course-expected-value',
      questionId: 'q-ev-1',
      fingerprint: 'abc123',
      tier: 'hard',
      mode: 'voice',
      status: 'graded',
      startedAt: 'ts',
      createdAt: 'ts',
    })
    await seed('users/alice/interviewUsage/2026-06-26', {
      date: '2026-06-26',
      secondsUsed: 300,
      sessionCount: 1,
      updatedAt: 'ts',
    })
    await seed('users/alice/interviewState/course-expected-value', {
      seenQuestionIds: ['q-ev-1'],
      attemptCount: 1,
      lastAttemptAt: 'ts',
    })

    // Owner can read all three subcollections.
    await assertSucceeds(
      getDoc(doc(alice(), 'users/alice/interviews/attempt-1')),
    )
    await assertSucceeds(
      getDoc(doc(alice(), 'users/alice/interviewUsage/2026-06-26')),
    )
    await assertSucceeds(
      getDoc(doc(alice(), 'users/alice/interviewState/course-expected-value')),
    )

    // Non-owner cannot read.
    await assertFails(
      getDoc(doc(bob(), 'users/alice/interviews/attempt-1')),
    )

    // Client writes are denied for all three (regardless of content).
    await assertFails(
      setDoc(doc(alice(), 'users/alice/interviews/forged'), {
        conceptId: 'course-expected-value',
        status: 'graded',
        hireSignal: 'Strong Yes',
      }),
    )
    await assertFails(
      setDoc(doc(alice(), 'users/alice/interviewUsage/2026-06-26'), {
        secondsUsed: 0,
      }),
    )
    await assertFails(
      setDoc(
        doc(alice(), 'users/alice/interviewState/course-expected-value'),
        { attemptCount: 0 },
      ),
    )
  })
})

describe('reviews (Cloud Functions only)', () => {
  it('allows owner reads but denies all client writes', async () => {
    // Simulate a Cloud Function (submitReview / writeCardsForCompletion) write.
    await seed('users/alice/reviews/lesson-bayes-rule-1__compute-posterior', {
      lessonId: 'lesson-bayes-rule-1',
      beatId: 'compute-posterior',
      conceptId: 'course-bayes-rule',
      schemaId: '',
      track: 'A',
      intervalDays: 1,
      easeFactor: 2.5,
      reps: 0,
      lapses: 0,
      lastResult: null,
      lastConfidence: null,
      isTransfer: false,
      suspended: false,
    })

    // Owner reads.
    await assertSucceeds(
      getDoc(
        doc(alice(), 'users/alice/reviews/lesson-bayes-rule-1__compute-posterior'),
      ),
    )
    // Non-owner cannot read.
    await assertFails(
      getDoc(
        doc(bob(), 'users/alice/reviews/lesson-bayes-rule-1__compute-posterior'),
      ),
    )

    // Client writes denied — owner and non-owner, create and update (a client
    // must not be able to forge a pass to mint gold; R13).
    await assertFails(
      setDoc(doc(alice(), 'users/alice/reviews/forged'), {
        lessonId: 'lesson-bayes-rule-1',
        beatId: 'compute-posterior',
        lastResult: 'pass',
      }),
    )
    await assertFails(
      updateDoc(
        doc(alice(), 'users/alice/reviews/lesson-bayes-rule-1__compute-posterior'),
        { lastResult: 'pass', reps: 99 },
      ),
    )
    await assertFails(
      setDoc(doc(bob(), 'users/alice/reviews/forged'), { lastResult: 'pass' }),
    )
  })
})
