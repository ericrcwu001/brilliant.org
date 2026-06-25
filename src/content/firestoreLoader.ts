// Runtime content loader (Phase 14). Reads seeded content from Firestore and
// validates it through the same Zod schemas as the committed fixtures, so the
// runtime never trusts unvalidated documents. Seeding is done out-of-band by
// `scripts/seed-firestore.ts` (Admin SDK); see `npm run seed`.
//
// The local `/dev` route keeps using the committed fixture via
// `loadFlagshipLesson()` in `./loader`; this module is the authed-route path.

import { collection, doc, getDocs, getDoc } from 'firebase/firestore'
import { getDb } from '../firebase/app'
import { CourseSchema, LessonSchema, type Course, type Lesson } from './schema'

export async function loadLessonFromFirestore(lessonId: string): Promise<Lesson> {
  const db = await getDb()
  const snap = await getDoc(doc(db, 'lessons', lessonId))
  if (!snap.exists()) {
    throw new Error(
      `Lesson "${lessonId}" not found in Firestore. Run \`npm run seed\` to upload fixtures.`,
    )
  }
  return LessonSchema.parse(snap.data())
}

export async function loadCourseFromFirestore(courseId: string): Promise<Course> {
  const db = await getDb()
  const snap = await getDoc(doc(db, 'courses', courseId))
  if (!snap.exists()) {
    throw new Error(
      `Course "${courseId}" not found in Firestore. Run \`npm run seed\` to upload fixtures.`,
    )
  }
  return CourseSchema.parse(snap.data())
}

/** Load all course docs from Firestore. Docs that fail schema validation are
 *  silently skipped so a malformed stub never breaks the catalog render. */
export async function loadCoursesFromFirestore(): Promise<Course[]> {
  const db = await getDb()
  const snap = await getDocs(collection(db, 'courses'))
  const courses: Course[] = []
  for (const d of snap.docs) {
    const result = CourseSchema.safeParse(d.data())
    if (result.success) courses.push(result.data)
  }
  return courses
}
