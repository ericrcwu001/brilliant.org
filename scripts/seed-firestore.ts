// Manual seed script (Phase 14). Uploads version-controlled fixtures into
// Firestore using the Admin SDK: each course doc to `courses/{courseId}` and
// each built lesson (for non-coming-soon courses) to `lessons/{lessonId}`.
// Git is the source of truth; re-running overwrites the docs to match the
// fixtures (idempotent).
//
// Targets the local Firestore emulator by default (matches firebase.json and
// src/firebase/app.ts). To seed a real project instead (e.g. the live Blaze
// project brilliant-org), provide Application Default Credentials:
//   SEED_TARGET=prod gcloud auth application-default login   # or set GOOGLE_APPLICATION_CREDENTIALS
//   SEED_TARGET=prod GOOGLE_CLOUD_PROJECT=brilliant-org npm run seed
//
// Run with the emulator up:  npm run seed   (FIRESTORE_EMULATOR_HOST auto-set)

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  applicationDefault,
  initializeApp,
  type AppOptions,
} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { CourseSchema, LessonSchema } from '../src/content/schema'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures')

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(join(fixturesDir, file), 'utf8'))
}

const projectId =
  process.env.GOOGLE_CLOUD_PROJECT ??
  process.env.GCLOUD_PROJECT ??
  'brilliant-org'

const target = process.env.SEED_TARGET ?? 'emulator'
if (target === 'emulator' && !process.env.FIRESTORE_EMULATOR_HOST) {
  // Default to the Firestore emulator port declared in firebase.json.
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
}

async function main(): Promise<void> {
  const options: AppOptions = { projectId }
  if (target === 'prod') {
    // Reads GOOGLE_APPLICATION_CREDENTIALS (a gitignored service-account key).
    options.credential = applicationDefault()
  }
  initializeApp(options)
  const db = getFirestore()

  const where =
    target === 'emulator'
      ? `emulator @ ${process.env.FIRESTORE_EMULATOR_HOST}`
      : `project ${projectId}`
  console.log(`Seeding Firestore (${where})\n`)

  const courseFiles = readdirSync(fixturesDir)
    .filter((f) => /^course-.*\.json$/.test(f))
    .sort()

  for (const file of courseFiles) {
    const course = CourseSchema.parse(readJson(file))
    await db.collection('courses').doc(course.courseId).set(course)
    console.log(`✓ courses/${course.courseId}`)

    // Coming-soon stubs have no lesson fixtures; skip lesson seeding.
    if (course.status === 'coming_soon') continue

    const builtLessons = course.lessons.filter((node) => node.built)
    for (const node of builtLessons) {
      const lesson = LessonSchema.parse(readJson(`${node.lessonId}.json`))
      await db.collection('lessons').doc(lesson.lessonId).set(lesson)
      console.log(`  ✓ lessons/${lesson.lessonId}`)
    }

    const skipped = course.lessons.filter((node) => !node.built).map((n) => n.lessonId)
    if (skipped.length > 0) {
      console.log(`  Skipped (no fixture yet): ${skipped.join(', ')}`)
    }
  }

  console.log('\nSeed complete.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n✗ Seed failed:\n', err)
    process.exit(1)
  })
