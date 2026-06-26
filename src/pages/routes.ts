// Route paths for the hand-rolled SPA router (no react-router dependency, per
// the existing dev-router decision). Shared by App's guard and the pages so
// navigation targets stay in one place.

export interface NavigateOptions {
  replace?: boolean
  viewTransition?: string
}

export type NavigateFn = (to: string, options?: NavigateOptions) => void

export const ROUTES = {
  landing: '/',
  auth: '/auth',
  onboardingName: '/onboarding/name',
  onboarding: '/onboarding/survey',
  coursePath: '/path',
  profile: '/profile',
  /** Dev-only fixture route preserved from Group A (bypasses auth). */
  devLesson: '/dev/lesson',
  /** Dev-only Study Desk harness (fixture data, no Firebase). */
  devHome: '/dev/home',
  /** Dev-only interview harness (fixture data, no Firebase/OpenAI). */
  devInterview: '/dev/interview',
} as const

export const FLAGSHIP_LESSON_ID = 'lesson-pattern-hitting-times'

/** The optional warm-up lesson (L0) offered from the first-run welcome screen. */
export const INTRO_LESSON_ID = 'lesson-first-heads'

export function lessonPath(lessonId: string): string {
  return `/lesson/${lessonId}`
}

/** Returns the lessonId for a `/lesson/:lessonId` path, else null. */
export function parseLessonId(pathname: string): string | null {
  const match = pathname.match(/^\/lesson\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

/** Returns the lessonId for a dev `/dev/lesson/:lessonId` path, else null. */
export function parseDevLessonId(pathname: string): string | null {
  const match = pathname.match(/^\/dev\/lesson\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

export function devLessonPath(lessonId: string): string {
  return `/dev/lesson/${lessonId}`
}

/** Returns the path for a concept page: `/concept/:conceptId`. */
export function conceptPath(conceptId: string): string {
  return `/concept/${conceptId}`
}

/** Returns the conceptId for a `/concept/:conceptId` path, else null. */
export function parseConceptId(pathname: string): string | null {
  const match = pathname.match(/^\/concept\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

/** Returns the path for an interview page: `/interview/:conceptId`. */
export function interviewPath(conceptId: string): string {
  return `/interview/${conceptId}`
}

/** Returns the conceptId for an `/interview/:conceptId` path, else null. */
export function parseInterviewId(pathname: string): string | null {
  const match = pathname.match(/^\/interview\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : null
}
