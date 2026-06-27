// Dev-only fixture routes (bypasses auth entirely; Group A / e2e entry point).
// This whole module is lazy-imported so the devLessons fixtures (~73 KB of JSON)
// stay out of the production entry chunk.

import { ROUTES, parseDevLessonId } from './routes'
import { loadDevLesson } from '../content/devLessons'
import { LessonPlayer } from '../lesson/LessonPlayer'
import { DevHomePage } from './DevHomePage'
import { DevInterviewPage } from './DevInterviewPage'
import { DevGatePage } from './DevGatePage'

export function DevRoutes({ path }: { path: string }) {
  if (path === ROUTES.devGate) return <DevGatePage />

  if (path === ROUTES.devLesson) {
    const track =
      new URLSearchParams(window.location.search).get('track') === 'A'
        ? 'A'
        : 'B'
    // Dev harness shows the confidence rating (spec-02) so /dev/lesson can verify
    // it without auth; pass ?track=A to simulate the Track-A gate-off case.
    return <LessonPlayer track={track} showConfidence={track === 'B'} />
  }

  const devLessonId = parseDevLessonId(path)
  if (devLessonId) {
    const track =
      new URLSearchParams(window.location.search).get('track') === 'A'
        ? 'A'
        : 'B'
    const lesson = loadDevLesson(devLessonId)
    if (lesson)
      return (
        <LessonPlayer lesson={lesson} track={track} showConfidence={track === 'B'} />
      )
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

  if (path === ROUTES.devInterview) return <DevInterviewPage />

  // Fallback: shouldn't be reached given the /dev prefix guard in App.
  return <DevHomePage />
}

export default DevRoutes
