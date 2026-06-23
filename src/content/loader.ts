// Content loader. In Group A this reads the committed local fixture and
// validates it through the Zod schema. Group C swaps the source to Firestore
// while keeping this contract (a validated `Lesson`).

import lessonFixture from '../../fixtures/lesson-pattern-hitting-times.json'
import { LessonSchema, type Lesson } from './schema'

export function loadFlagshipLesson(): Lesson {
  return LessonSchema.parse(lessonFixture)
}
