// scripts/demo-inject.ts
//
// ⚠️  TARGETS THE LIVE PROJECT (brilliant-org by default).
// All written sub-collections are server-authoritative and client-denied by
// firestore.rules:
//   users/{uid}/interviews       — allow write: if false
//   users/{uid}/milestones       — allow write: if false
//   users/{uid}/streaks          — allow write: if false
//   users/{uid}/interviewState   — allow write: if false
// The progress fields completionStatus/masteryStatus/needsReview/unlocks/derived
// are also client-denied; Admin SDK bypasses all rules.
//
// Needs Application Default Credentials pointing at the live project:
//   gcloud auth application-default login
//   GOOGLE_CLOUD_PROJECT=brilliant-org npx tsx scripts/demo-inject.ts
//
// Usage:
//   npx tsx scripts/demo-inject.ts               # dry-run (safe, no writes)
//   npx tsx scripts/demo-inject.ts --commit      # write demo data
//   npx tsx scripts/demo-inject.ts --undo        # dry-run: show what WOULD be deleted
//   npx tsx scripts/demo-inject.ts --undo --commit  # delete demo data

import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp, type Firestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// ── Config ────────────────────────────────────────────────────────────────────

const TARGET_EMAIL = 'eric.wu@alphaaiengineering.com'
const projectId = process.env.GOOGLE_CLOUD_PROJECT ?? 'brilliant-org'

// Derived from fixtures/course-pattern-hitting-times.json and src/content/courseIds.ts.
// conceptId = courseId (confirmed by InterviewAttemptSchema.conceptId + test fixtures).
const CONCEPT_ID = 'course-pattern-hitting-times'

// Ordered lesson IDs from fixtures/course-pattern-hitting-times.json (lessons[]).
// lesson-first-heads is index 0 (optional: true); entryIndex = 1 (lesson-pattern-hitting-times).
// We write progress for the first 4; final 3 are ABSENT → locked.
const PROGRESS_LESSON_IDS = [
  'lesson-first-heads',            // optional warm-up, index 0
  'lesson-pattern-hitting-times',  // flagship entry, index 1 (isEntry)
  'lesson-penneys-game',           // index 2
  'lesson-gamblers-ruin',          // index 3 — in_progress (Resume focus)
] as const

// Milestone IDs verified against MILESTONE_SEQUENCE in src/habit/milestones.ts.
const DEMO_MILESTONE_IDS = [
  'hh-ht-mastered',        // from lesson-pattern-hitting-times (LESSON_MILESTONES)
  'penneys-game-won',      // from lesson-penneys-game
  'gamblers-ruin-solved',  // from lesson-gamblers-ruin
  'three-lessons-complete', // aggregate: pht + penneys + gamblers (MID_COURSE_MILESTONE)
] as const

const INTERVIEW_IDS = ['demo-1', 'demo-2', 'demo-3'] as const

// ── Flag parsing ──────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const doCommit = argv.includes('--commit') || argv.includes('--yes')
const doUndo = argv.includes('--undo')
const DRY = !doCommit

function deriveMode(): string {
  if (doUndo) return DRY ? 'UNDO/dry-run' : 'UNDO/commit'
  return DRY ? 'INJECT/dry-run' : 'INJECT/commit'
}
const MODE = deriveMode()

// ── Timestamp helpers ─────────────────────────────────────────────────────────

const NOW_MS = Date.now()
const daysAgo = (d: number): Timestamp =>
  Timestamp.fromMillis(NOW_MS - d * 24 * 60 * 60 * 1000)

const TODAY_NY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York',
}).format(new Date(NOW_MS))

// ── Local types (mirrors src/content/interviewPack.ts InterviewReport) ───────
// Defined locally to avoid pulling src/ deps into the admin script.

interface Dim {
  score: number
  evidence: string
}

interface DemoReport {
  dimensions: {
    correctness: Dim
    approach: Dim
    rigor: Dim
    communication: Dim
    speed: Dim
  }
  summary: string
  strengths: string[]
  fixes: string[]
  tier: 'hard' | 'harder' | 'brutal'
  pressureNote: string
  correctnessAnchor?: {
    applied: boolean
    verdict: 'match' | 'mismatch' | 'na'
    expected: string
    extracted: string | null
  }
}

interface AttemptDoc {
  conceptId: string
  questionId: string
  fingerprint: string
  tier: 'hard' | 'harder' | 'brutal'
  mode: 'voice' | 'text'
  status: 'graded'
  startedAt: Timestamp
  createdAt: Timestamp
  gradedAt: Timestamp
  durationSec: number
  report: DemoReport
}

// ── Interview attempt data ────────────────────────────────────────────────────
// Rising rubric trend: demo-1 mean≈2.6, demo-2 mean≈3.6, demo-3 mean≈4.8.
// Strictly increasing createdAt: ~9d, ~5d, ~1d ago.

const ATTEMPTS: Array<{ id: string; data: AttemptDoc }> = [
  {
    id: 'demo-1',
    data: {
      conceptId: CONCEPT_ID,
      questionId: 'q-pht-hard-001',
      fingerprint: 'fp-demo-1',
      tier: 'hard',
      mode: 'text',
      status: 'graded',
      startedAt: daysAgo(9),
      createdAt: daysAgo(9),
      gradedAt: daysAgo(9),
      durationSec: 480,
      report: {
        dimensions: {
          correctness:   { score: 2, evidence: 'Identified the HH state machine but misstated the absorbing boundary condition.' },
          approach:      { score: 3, evidence: 'Applied first-step analysis; missed the partial-match self-loop on the intermediate state.' },
          rigor:         { score: 2, evidence: 'Recurrence set up informally; no explicit state enumeration before writing transitions.' },
          communication: { score: 3, evidence: 'Intuition was clear but notation was inconsistent throughout.' },
          speed:         { score: 3, evidence: 'Reached the recurrence structure in time; algebra ran longer than expected.' },
        },
        summary: 'Showed intuition for the state-machine approach but lacked precision on boundary conditions — a solid first pass.',
        strengths: [
          'Recognised the need for state tracking',
          'Correct directional reasoning on the recurrence',
        ],
        fixes: [
          'Enumerate all states explicitly before writing any transitions',
          'Prove (not assume) the absorbing state definition',
        ],
        tier: 'hard',
        pressureNote: 'Under pressure reverted to path-counting rather than leveraging the recurrence directly.',
      },
    },
  },
  {
    id: 'demo-2',
    data: {
      conceptId: CONCEPT_ID,
      questionId: 'q-pht-harder-001',
      fingerprint: 'fp-demo-2',
      tier: 'harder',
      mode: 'text',
      status: 'graded',
      startedAt: daysAgo(5),
      createdAt: daysAgo(5),
      gradedAt: daysAgo(5),
      durationSec: 390,
      report: {
        dimensions: {
          correctness:   { score: 4, evidence: 'Solved the HT recurrence correctly; minor slip on the HH case self-corrected under follow-up.' },
          approach:      { score: 4, evidence: 'Immediately drew the full three-state diagram and solved the linear system cleanly.' },
          rigor:         { score: 3, evidence: 'States named and transitions labelled; skipped the verification that E[HT] = 4 via the simpler anchor.' },
          communication: { score: 4, evidence: 'Walked through each step without prompting; interviewer could follow without interruption.' },
          speed:         { score: 3, evidence: 'Good setup but verifying both answers in the same pass took over eight minutes.' },
        },
        summary: 'Strong command of the state-machine method; execution noticeably tighter than the first attempt.',
        strengths: [
          'Systematic state enumeration before writing transitions',
          'Clean first-step recurrence setup',
          'Self-corrected the HH slip without prompting',
        ],
        fixes: [
          'Verify E[HH] and E[HT] in a single pass rather than sequentially',
          'Pre-anchor E[HT] = 4 as a reference before starting the HH case',
        ],
        tier: 'harder',
        pressureNote: 'When pushed on the asymmetry E[HH] ≠ E[HT] the explanation was clear and confident.',
      },
    },
  },
  {
    id: 'demo-3',
    data: {
      conceptId: CONCEPT_ID,
      questionId: 'q-pht-harder-002',
      fingerprint: 'fp-demo-3',
      tier: 'harder',
      mode: 'text',
      status: 'graded',
      startedAt: daysAgo(1),
      createdAt: daysAgo(1),
      gradedAt: daysAgo(1),
      durationSec: 315,
      report: {
        dimensions: {
          // score:5 verified by correctnessAnchor below — engine-canonical E[HH]=6 confirmed match.
          correctness:   { score: 5, evidence: 'Committed to E[HH] = 6; engine-canonical answer confirmed — match verified against the engine.' },
          approach:      { score: 5, evidence: 'State machine drawn immediately, linear system solved in one pass, overlap shortcut cited as consistency check.' },
          rigor:         { score: 5, evidence: 'Every state named, every transition labelled 1/2, absorbing boundary proved rather than assumed.' },
          communication: { score: 5, evidence: 'Narrated every step without prompting; follow-up questions answered with identical structure.' },
          speed:         { score: 4, evidence: 'Full solution delivered under six minutes; brief pause to verify via the martingale shortcut.' },
        },
        summary: 'Flawless execution: immediate state machine, correct recurrence, correct scalar answer E[HH] = 6, crisp communication under pressure.',
        strengths: [
          'Instant, correct state-machine setup with all three states named',
          'Scalar answer E[HH] = 6 stated, solved, and defended',
          'Cited the overlap shortcut Σ2^L as a sanity check unprompted',
        ],
        fixes: [
          'Consider opening with the martingale framing — it signals mastery earlier on the clock.',
        ],
        tier: 'harder',
        pressureNote: 'Defended the asymmetry E[HH] ≠ E[HT] unprompted and without hedging — the key quant signal.',
        correctnessAnchor: {
          applied: true,
          verdict: 'match',
          expected: '6',
          extracted: '6',
        },
      },
    },
  },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const banner = `  demo-inject [${MODE}] → ${projectId}  `
  const line = '─'.repeat(banner.length)
  console.log(`\n${line}`)
  console.log(banner)
  console.log(`${line}\n`)

  if (projectId === 'brilliant-org' || !process.env.FIRESTORE_EMULATOR_HOST) {
    console.warn('⚠️  WARNING: LIVE project targeted — Admin SDK bypasses firestore.rules.')
    console.warn('⚠️  All writes/deletes are permanent. Run without --commit to dry-run first.\n')
  }

  initializeApp({ projectId, credential: applicationDefault() })
  const db = getFirestore()
  const auth = getAuth()

  // Resolve uid from email — fail fast if the account does not exist.
  let uid: string
  try {
    const user = await auth.getUserByEmail(TARGET_EMAIL)
    uid = user.uid
    console.log(`✓ ${TARGET_EMAIL} → uid: ${uid}`)
    console.log(`  project: ${projectId}\n`)
  } catch (err) {
    console.error(`✗ No Firebase Auth account found for "${TARGET_EMAIL}".`)
    console.error(`  Sign up at the app first, then re-run this script.`)
    console.error(`  Raw error:`, err)
    process.exit(1)
  }

  if (doUndo) {
    await runUndo(db, uid)
  } else {
    await runInject(db, uid)
  }
}

// ── INJECT ────────────────────────────────────────────────────────────────────

async function runInject(db: Firestore, uid: string): Promise<void> {
  const w = (path: string, note: string): void => {
    const verb = DRY ? '[DRY] would write' : '✓ wrote      '
    console.log(`  ${verb}  ${path}`)
    if (note) console.log(`               ${note}`)
  }

  // 1. Interview attempts — 3 graded docs with strictly increasing createdAt.
  console.log('── 1. Interviews (3 graded attempts, rising rubric scores)')
  for (const { id, data } of ATTEMPTS) {
    const d = data.report.dimensions
    const scores = [d.correctness.score, d.approach.score, d.rigor.score, d.communication.score, d.speed.score]
    const mean = (scores.reduce((a, b) => a + b, 0) / 5).toFixed(1)
    const anchor = data.report.correctnessAnchor
      ? `  correctnessAnchor: verdict=${data.report.correctnessAnchor.verdict} expected=${data.report.correctnessAnchor.expected}`
      : ''
    w(
      `users/${uid}/interviews/${id}`,
      `tier:${data.tier}  scores:${scores.join('/')}  mean:${mean}${anchor}`,
    )
    if (!DRY) {
      await db.doc(`users/${uid}/interviews/${id}`).set(data)
    }
  }

  // 2. Streak — path: users/{uid}/streaks/current (confirmed in src/habit/streaks.ts).
  console.log('\n── 2. Streak')
  const streak = {
    count: 12,
    longest: 21,
    lastActiveDate: TODAY_NY,
    timezone: 'America/New_York',
    updatedAt: Timestamp.now(),
  }
  w(
    `users/${uid}/streaks/current`,
    `count:${streak.count}  longest:${streak.longest}  lastActiveDate:${TODAY_NY}`,
  )
  if (!DRY) {
    await db.doc(`users/${uid}/streaks/current`).set(streak)
  }

  // 3. Milestones — shape confirmed from functions/src/milestones.ts awardMilestone().
  // Gold/silver resolution at read time: isMilestoneMastered() in milestones.ts.
  //   hh-ht-mastered      → gold  (lesson-pht: derived.mastered=true)
  //   penneys-game-won    → silver (lesson-penneys: derived.mastered=false)
  //   gamblers-ruin-solved → silver (lesson-gamblers: in_progress, not aced)
  //   three-lessons-complete → silver (penneys not aced → aggregate fails gold)
  console.log('\n── 3. Milestones (4 earned)')
  const milestones: Array<{ id: string; sourceLessonId: string; earnedAt: Timestamp }> = [
    { id: 'hh-ht-mastered',        sourceLessonId: 'lesson-pattern-hitting-times', earnedAt: daysAgo(14) },
    { id: 'penneys-game-won',       sourceLessonId: 'lesson-penneys-game',          earnedAt: daysAgo(12) },
    { id: 'gamblers-ruin-solved',   sourceLessonId: 'lesson-gamblers-ruin',         earnedAt: daysAgo(7)  },
    { id: 'three-lessons-complete', sourceLessonId: 'lesson-gamblers-ruin',         earnedAt: daysAgo(7)  },
  ]
  for (const m of milestones) {
    w(`users/${uid}/milestones/${m.id}`, `sourceLessonId:${m.sourceLessonId}`)
    if (!DRY) {
      await db.doc(`users/${uid}/milestones/${m.id}`).set({
        milestoneId: m.id,
        sourceLessonId: m.sourceLessonId,
        earnedAt: m.earnedAt,
      })
    }
  }

  // 4. Progress — produces the following node states via resolveNodes() in studyDesk.model.ts:
  //   lesson-first-heads          → completed (optional on-ramp, gold)
  //   lesson-pattern-hitting-times → completed (isEntry, gold)
  //   lesson-penneys-game         → needsReview (completed + needsReview:true, silver)
  //   lesson-gamblers-ruin        → available/Resume (completionStatus in_progress)
  //   lesson-states-streaks       → locked (ABSENT, predecessor not completed)
  //   lesson-longer-patterns      → locked (ABSENT)
  //   lesson-overlap-shortcut     → locked (ABSENT)
  // recommendedAction → { kind: 'resume', lessonId: 'lesson-gamblers-ruin' }
  console.log('\n── 4. Progress (4 docs; final 3 lessons ABSENT → locked)')
  const progressDocs: Array<{ id: string; data: Record<string, unknown> }> = [
    {
      id: 'lesson-first-heads',
      data: {
        completionStatus: 'completed',
        masteryStatus: 'mastered',
        derived: { mastered: true },
        unlocks: null,
        completedAt: daysAgo(16),
        updatedAt: daysAgo(16),
        schemaVersion: 1,
      },
    },
    {
      id: 'lesson-pattern-hitting-times',
      data: {
        completionStatus: 'completed',
        masteryStatus: 'mastered',
        derived: { mastered: true },
        unlocks: 'lesson-penneys-game',
        completedAt: daysAgo(14),
        updatedAt: daysAgo(14),
        schemaVersion: 1,
      },
    },
    {
      id: 'lesson-penneys-game',
      data: {
        completionStatus: 'completed',
        masteryStatus: 'not_mastered',
        needsReview: true,
        derived: { mastered: false },
        unlocks: 'lesson-gamblers-ruin',
        completedAt: daysAgo(12),
        updatedAt: daysAgo(7),
        schemaVersion: 1,
      },
    },
    {
      id: 'lesson-gamblers-ruin',
      data: {
        completionStatus: 'in_progress',
        currentBeat: 'beat-gr-sim-2',
        completedBeats: ['beat-gr-primer', 'beat-gr-predict', 'beat-gr-sim-1'],
        updatedAt: daysAgo(1),
        schemaVersion: 1,
      },
    },
  ]
  for (const { id, data } of progressDocs) {
    const status = (data.completionStatus as string | undefined) ?? 'none'
    const derived = data.derived as { mastered?: boolean } | undefined
    const tags: string[] = [status]
    if (derived?.mastered === true) tags.push('gold')
    if (derived?.mastered === false) tags.push('not-mastered')
    if (data.needsReview) tags.push('needsReview')
    if (status === 'in_progress') tags.push(`currentBeat:${String(data.currentBeat)}`)
    w(`users/${uid}/progress/${id}`, tags.join('  '))
    if (!DRY) {
      await db.doc(`users/${uid}/progress/${id}`).set(data)
    }
  }
  console.log(`  (lesson-states-streaks, lesson-longer-patterns, lesson-overlap-shortcut → no doc written)`)

  // 5. User root doc — MERGE only; never overwrite existing displayName or onboardingCompletedAt.
  console.log('\n── 5. User root doc (MERGE, non-destructive)')
  if (!DRY) {
    const userSnap = await db.doc(`users/${uid}`).get()
    const existing = userSnap.data() ?? {}
    const patch: Record<string, unknown> = {}
    if (!existing.onboardingCompletedAt) {
      patch.onboardingCompletedAt = Timestamp.now()
    }
    const currentName = ((existing.displayName as string | undefined) ?? '').trim()
    if (!currentName) {
      patch.displayName = 'Eric'
    }
    if (Object.keys(patch).length > 0) {
      await db.doc(`users/${uid}`).set(patch, { merge: true })
      console.log(`  ✓ merged fields: ${Object.keys(patch).join(', ')}`)
    } else {
      console.log('  ✓ no merge needed (displayName and onboardingCompletedAt already set)')
    }
  } else {
    console.log(`  [DRY] would MERGE: onboardingCompletedAt (if absent), displayName 'Eric' (if empty)`)
  }

  // 6. InterviewState — mirrors the shape written by gradeInterview() in functions/src/interview.ts.
  console.log('\n── 6. InterviewState')
  const interviewState = {
    seenQuestionIds: ['q-pht-hard-001', 'q-pht-harder-001', 'q-pht-harder-002'],
    attemptCount: 3,
    lastAttemptAt: daysAgo(1),
  }
  w(
    `users/${uid}/interviewState/${CONCEPT_ID}`,
    `attemptCount:${interviewState.attemptCount}  seenIds:${interviewState.seenQuestionIds.join(',')}`,
  )
  if (!DRY) {
    await db.doc(`users/${uid}/interviewState/${CONCEPT_ID}`).set(interviewState)
  }

  if (DRY) {
    console.log('\n✓ Dry-run complete — no writes performed.')
    console.log('  Re-run with --commit to apply.\n')
  } else {
    console.log('\n✓ Demo data injected successfully.\n')
  }
}

// ── UNDO ──────────────────────────────────────────────────────────────────────

async function runUndo(db: Firestore, uid: string): Promise<void> {
  // Only the docs this script deterministically creates. The user root doc is
  // NOT deleted (we only merged non-destructively into it).
  const deletePaths: string[] = [
    ...INTERVIEW_IDS.map((id) => `users/${uid}/interviews/${id}`),
    `users/${uid}/streaks/current`,
    ...DEMO_MILESTONE_IDS.map((id) => `users/${uid}/milestones/${id}`),
    ...PROGRESS_LESSON_IDS.map((id) => `users/${uid}/progress/${id}`),
    `users/${uid}/interviewState/${CONCEPT_ID}`,
  ]

  console.log('── Docs to delete (users/{uid} root doc is NOT touched):')
  for (const p of deletePaths) {
    const verb = DRY ? '[DRY] would delete' : '🗑  deleted     '
    console.log(`  ${verb}  ${p}`)
    if (!DRY) {
      await db.doc(p).delete()
    }
  }

  if (DRY) {
    console.log('\n✓ Dry-run complete — no deletes performed.')
    console.log('  Re-run with --undo --commit to apply.\n')
  } else {
    console.log('\n✓ Demo data removed.\n')
  }
}

// ── Entry ─────────────────────────────────────────────────────────────────────

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n✗ demo-inject failed:\n', err)
    process.exit(1)
  })
