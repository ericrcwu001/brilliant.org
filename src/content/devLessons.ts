// Dev-only static fixture map for /dev/lesson/:lessonId (build-brief §4.6).
//
// Fixtures are bundled (not in /public), so a runtime `fetch` wouldn't find
// them. `import.meta.glob` builds a STATIC import map at build time that
// auto-includes every fixtures/lesson-*.json — no hand-maintained list to drift
// as Wave-2 lessons land. This module is imported only by the dev route in
// App.tsx, so the Vite-only `import.meta.glob` never reaches the tsx/node
// validate path or non-Vite tests.

import { LessonSchema, type Lesson } from './schema'

const modules = import.meta.glob('../../fixtures/lesson-*.json', {
  eager: true,
}) as Record<string, { default: unknown }>

const byId = new Map<string, Lesson>()
for (const mod of Object.values(modules)) {
  const parsed = LessonSchema.safeParse(mod.default)
  if (parsed.success) byId.set(parsed.data.lessonId, parsed.data)
}

/** Lesson ids available at /dev/lesson/:lessonId. */
export function devLessonIds(): string[] {
  return [...byId.keys()].sort()
}

/** The bundled fixture lesson for a dev lessonId, or null if not found. */
export function loadDevLesson(lessonId: string): Lesson | null {
  return byId.get(lessonId) ?? null
}
