// App router + auth guard (Phase 13). A small hand-rolled SPA router (no
// react-router dependency, consistent with the Group A dev router) drives the
// auth-first flow: landing → sign-in/create → display-name capture (first
// sign-in only) → course path.
//
// The dev-only /dev/lesson route renders the local fixture lesson and bypasses
// auth entirely (preserves the Group A/e2e entry point); every other route is
// gated by <AuthProvider> + the guard in <GuardedRoutes>.

import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/authContext'
import {
  ROUTES,
  parseLessonId,
  parseDevLessonId,
  type NavigateFn,
  type NavigateOptions,
} from './pages/routes'
import { loadDevLesson } from './content/devLessons'
import { ErrorBoundary } from './app/ErrorBoundary'
import { withViewTransition } from './app/viewTransition'

const LessonPlayer = lazy(() =>
  import('./lesson/LessonPlayer').then(m => ({ default: m.LessonPlayer })),
)
const DevHomePage = lazy(() =>
  import('./pages/DevHomePage').then(m => ({ default: m.DevHomePage })),
)
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then(m => ({ default: m.LandingPage })),
)
const AuthPage = lazy(() =>
  import('./pages/AuthPage').then(m => ({ default: m.AuthPage })),
)
const DisplayNamePage = lazy(() =>
  import('./pages/DisplayNamePage').then(m => ({ default: m.DisplayNamePage })),
)
const CoursePathPage = lazy(() =>
  import('./pages/CoursePathPage').then(m => ({ default: m.CoursePathPage })),
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })),
)
const LessonPage = lazy(() =>
  import('./pages/LessonPage').then(m => ({ default: m.LessonPage })),
)

function useRouter() {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to: string, opts?: NavigateOptions) => {
    const apply = () => {
      if (opts?.replace) {
        window.history.replaceState({}, '', to)
      } else {
        window.history.pushState({}, '', to)
      }
      flushSync(() => setPath(window.location.pathname))
    }
    withViewTransition(apply, 'home-lesson')
  }, [])

  return { path, navigate }
}

const PUBLIC_ROUTES = new Set<string>([ROUTES.landing, ROUTES.auth])

// Returns the path to redirect to given the auth state, or null to stay put.
function redirectTarget(
  path: string,
  signedIn: boolean,
  onboarded: boolean,
): string | null {
  if (!signedIn) {
    return PUBLIC_ROUTES.has(path) ? null : ROUTES.landing
  }
  if (!onboarded) {
    return path === ROUTES.onboardingName ? null : ROUTES.onboardingName
  }
  // Signed in and onboarded: pre-auth screens bounce to the course path.
  if (
    path === ROUTES.landing ||
    path === ROUTES.auth ||
    path === ROUTES.onboardingName
  ) {
    return ROUTES.coursePath
  }
  const known =
    path === ROUTES.coursePath ||
    path === ROUTES.profile ||
    parseLessonId(path) !== null
  return known ? null : ROUTES.coursePath
}

function GuardedRoutes({
  path,
  navigate,
}: {
  path: string
  navigate: NavigateFn
}) {
  const { user, authReady, userDoc, userDocReady } = useAuth()

  const booting = !authReady || (!!user && !userDocReady)
  const target = booting
    ? null
    : redirectTarget(path, !!user, userDoc !== null)

  useEffect(() => {
    if (target && target !== path) navigate(target, { replace: true })
  }, [target, path, navigate])

  if (booting || target) return <BootScreen />

  if (path === ROUTES.landing) return <LandingPage navigate={navigate} />
  if (path === ROUTES.auth) return <AuthPage navigate={navigate} />
  if (path === ROUTES.onboardingName) return <DisplayNamePage />
  if (path === ROUTES.coursePath) return <CoursePathPage navigate={navigate} />
  if (path === ROUTES.profile) return <ProfilePage navigate={navigate} />

  const lessonId = parseLessonId(path)
  if (lessonId) return <LessonPage navigate={navigate} lessonId={lessonId} />

  // Unreachable: the guard redirects unknown paths above.
  return <BootScreen />
}

function BootScreen() {
  return (
    <div className="bootscreen" aria-busy="true" aria-live="polite">
      <p className="bootscreen__brand">Ergo</p>
      <div className="skeleton bootscreen__line" />
      <div className="skeleton bootscreen__line" />
      <p className="bootscreen__caption">Signing you in…</p>
    </div>
  )
}

function RouteSkeleton() {
  return (
    <div className="bootscreen" aria-busy="true">
      <p className="bootscreen__brand">Ergo</p>
      <div className="skeleton bootscreen__line" />
      <div className="skeleton bootscreen__line" />
    </div>
  )
}

function App() {
  const { path, navigate } = useRouter()

  // Compute page content for all branches, then wrap once in ErrorBoundary +
  // Suspense so both dev routes and the auth-guarded path share a single
  // boundary/fallback.
  const content = (() => {
    // Dev fixture routes: no auth, no Firebase mount (Group A / e2e entry point +
    // the Study Desk reskin harness). `?track=A` exercises the Track-A scaffolds
    // locally (and in the e2e Track-A pass); default is Track B.
    if (path === ROUTES.devLesson) {
      const track =
        new URLSearchParams(window.location.search).get('track') === 'A'
          ? 'A'
          : 'B'
      return <LessonPlayer track={track} />
    }
    // Parameterized dev route (build-brief §4.6): /dev/lesson/:lessonId renders any
    // bundled fixture lesson with no Firebase, so every lesson is exercisable +
    // e2e-testable in both tracks before it's seeded.
    const devLessonId = parseDevLessonId(path)
    if (devLessonId) {
      const track =
        new URLSearchParams(window.location.search).get('track') === 'A'
          ? 'A'
          : 'B'
      const lesson = loadDevLesson(devLessonId)
      if (lesson) return <LessonPlayer lesson={lesson} track={track} />
      return (
        <div className="bootscreen" aria-live="polite">
          <p className="bootscreen__brand">Lesson not found</p>
          <p className="bootscreen__caption">
            No bundled fixture for "{devLessonId}".
          </p>
        </div>
      )
    }
    if (path === ROUTES.devHome) return <DevHomePage />
    return (
      <AuthProvider>
        <GuardedRoutes path={path} navigate={navigate} />
      </AuthProvider>
    )
  })()

  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteSkeleton />}>{content}</Suspense>
    </ErrorBoundary>
  )
}

export default App
