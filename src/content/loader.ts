// Content loader entry point.
//
// Runtime (authed route): read seeded content from Firestore via
// `loadLessonFromFirestore` / `loadCourseFromFirestore` (re-exported below from
// `./firestoreLoader`). LessonPlayer already accepts a `lesson` prop for this.
//
// Dev (`/dev/lesson`): keep reading the committed fixture via
// `loadFlagshipLesson()` so the lesson is exercisable with no Firebase/emulator
// running. Importing this module is side-effect-free w.r.t. the network — the
// Firebase SDK only opens connections on the first Firestore call.

import lessonFixture from '../../fixtures/lesson-pattern-hitting-times.json'
import { LessonSchema, type Lesson } from './schema'

export {
  loadLessonFromFirestore,
  loadCourseFromFirestore,
  loadCoursesFromFirestore,
} from './firestoreLoader'

// Canonical course id (mirrors docs/mvp_prd.md Data Contracts).
export const COURSE_ID = 'course-pattern-hitting-times'

export function loadFlagshipLesson(): Lesson {
  return LessonSchema.parse(lessonFixture)
}
