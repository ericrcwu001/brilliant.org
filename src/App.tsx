// App router + auth guard (Phase 13). A small hand-rolled SPA router (no
// react-router dependency, consistent with the Group A dev router) drives the
// auth-first flow: landing → sign-in/create → display-name capture (first
// sign-in only) → catalog home.
//
// Routing (Wave-0):
//   signed-out  /            → LandingPage
//   signed-in   /            → ConceptCatalogPage (macro home)
//   signed-in   /concept/:id → CoursePathPage(conceptId)
//   signed-in   /path        → redirect to / (back-compat)
//   /lesson/:id              → LessonPage (unchanged)
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
  parseConceptId,
  type NavigateFn,
  type NavigateOptions,
} from './pages/routes'
import { ErrorBoundary } from './app/ErrorBoundary'
import { withViewTransition } from './app/viewTransition'
import { prefetchLesson, prefetchAuth } from './app/prefetch'

const DevRoutes = lazy(() => import('./pages/DevRoutes'))
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then(m => ({ default: m.LandingPage })),
)
const AuthPage = lazy(() =>
  import('./pages/AuthPage').then(m => ({ default: m.AuthPage })),
)
const DisplayNamePage = lazy(() =>
  import('./pages/DisplayNamePage').then(m => ({ default: m.DisplayNamePage })),
)
const ConceptCatalogPage = lazy(() =>
  import('./pages/ConceptCatalogPage').then(m => ({ default: m.ConceptCatalogPage })),
)
const CoursePathPage = lazy(() =>
  import('./pages/CoursePathPage').then(m => ({ default: m.CoursePathPage })),
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })),
)
const OnboardingSurvey = lazy(() =>
  import('./pages/OnboardingSurvey').then(m => ({ default: m.OnboardingSurvey })),
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
    withViewTransition(apply, opts?.viewTransition ?? 'home-lesson')
  }, [])

  return { path, navigate }
}

const PUBLIC_ROUTES = new Set<string>([ROUTES.landing, ROUTES.auth])

// Returns the path to redirect to given the auth state, or null to stay put.
function redirectTarget(
  path: string,
  signedIn: boolean,
  onboarded: boolean,
  onboardingComplete: boolean,
): string | null {
  if (!signedIn) {
    return PUBLIC_ROUTES.has(path) ? null : ROUTES.landing
  }
  if (!onboarded) {
    return path === ROUTES.onboardingName ? null : ROUTES.onboardingName
  }
  // Has a userDoc but hasn't finished the survey yet.
  if (!onboardingComplete) {
    return path === ROUTES.onboarding ? null : ROUTES.onboarding
  }
  // Fully onboarded: bounce pre-auth screens, survey, and /path to catalog home.
  if (
    path === ROUTES.auth ||
    path === ROUTES.onboardingName ||
    path === ROUTES.onboarding ||
    path === ROUTES.coursePath
  ) {
    return ROUTES.landing
  }
  const known =
    path === ROUTES.landing ||
    path === ROUTES.profile ||
    parseLessonId(path) !== null ||
    parseConceptId(path) !== null
  return known ? null : ROUTES.landing
}

function GuardedRoutes({
  path,
  navigate,
}: {
  path: string
  navigate: NavigateFn
}) {
  const { user, authReady, userDoc, userDocReady } = useAuth()

  const onboardingComplete = userDoc?.onboardingCompletedAt != null
  const booting = !authReady || (!!user && !userDocReady)
  const target = booting
    ? null
    : redirectTarget(path, !!user, userDoc !== null, onboardingComplete)

  useEffect(() => {
    if (target && target !== path) navigate(target, { replace: true })
  }, [target, path, navigate])

  if (booting || target) return <BootScreen />

  if (path === ROUTES.landing) {
    // Signed-in+onboarded users land on the catalog; signed-out see marketing.
    return user
      ? <ConceptCatalogPage navigate={navigate} />
      : <LandingPage navigate={navigate} />
  }
  if (path === ROUTES.auth) return <AuthPage navigate={navigate} />
  if (path === ROUTES.onboardingName) return <DisplayNamePage />
  if (path === ROUTES.onboarding) return <OnboardingSurvey navigate={navigate} />
  if (path === ROUTES.profile) return <ProfilePage navigate={navigate} />

  const lessonId = parseLessonId(path)
  if (lessonId) return <LessonPage navigate={navigate} lessonId={lessonId} />

  const conceptId = parseConceptId(path)
  if (conceptId) return <CoursePathPage navigate={navigate} conceptId={conceptId} />

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

  // Idle prefetch: warms heavy lazy chunks after first paint so subsequent
  // navigations feel instant. Cancelled on path change to avoid stale work.
  useEffect(() => {
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number
      cancelIdleCallback?: (id: number) => void
    }
    const run = () => {
      if (path === ROUTES.landing || path === ROUTES.auth) prefetchAuth()
      // Pre-warm lesson chunk from the catalog home (signed-in landing).
      if (path === ROUTES.landing) prefetchLesson()
    }
    const id = w.requestIdleCallback ? w.requestIdleCallback(run) : window.setTimeout(run, 300)
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id)
      else clearTimeout(id)
    }
  }, [path])

  // Compute page content for all branches, then wrap once in ErrorBoundary +
  // Suspense so both dev routes and the auth-guarded path share a single
  // boundary/fallback.
  const content = (() => {
    // Dev fixture routes: no auth, no Firebase mount (Group A / e2e entry point +
    // the Study Desk reskin harness). Lazily loaded so fixture JSON stays out of
    // the prod entry chunk.
    if (path.startsWith('/dev')) return <DevRoutes path={path} />
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
