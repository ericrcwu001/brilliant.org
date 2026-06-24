// Route paths for the hand-rolled SPA router (no react-router dependency, per
// the existing dev-router decision). Shared by App's guard and the pages so
// navigation targets stay in one place.

export interface NavigateOptions {
  replace?: boolean
}

export type NavigateFn = (to: string, options?: NavigateOptions) => void

export const ROUTES = {
  landing: '/',
  auth: '/auth',
  onboardingName: '/onboarding/name',
  coursePath: '/path',
  profile: '/profile',
  /** Dev-only fixture route preserved from Group A (bypasses auth). */
  devLesson: '/dev/lesson',
  /** Dev-only Study Desk harness (fixture data, no Firebase). */
  devHome: '/dev/home',
} as const

export const FLAGSHIP_LESSON_ID = 'lesson-pattern-hitting-times'

export function lessonPath(lessonId: string): string {
  return `/lesson/${lessonId}`
}

/** Returns the lessonId for a `/lesson/:lessonId` path, else null. */
export function parseLessonId(pathname: string): string | null {
  const match = pathname.match(/^\/lesson\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : null
}
