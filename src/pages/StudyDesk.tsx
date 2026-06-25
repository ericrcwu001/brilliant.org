// Study Desk — the Ergo signed-in Home (docs/ui_design_system.md "Home").
// Presentational: receives all data from the container (CoursePathPage) or the
// /dev/home harness. Three regions: top bar (Ergo wordmark + profile avatar),
// momentum band (weekly streak + concepts-mastered gallery), and the course
// journey (delegated to CourseJourney, owned by Agent 3).
//
// StudyDeskProps is kept byte-identical to the pre-Ergo signature so the
// containers (CoursePathPage, DevHomePage) need zero changes.

import { m } from 'motion/react'
import { DUR, EASE } from '../motion/tokens'
import type { Course, Progress } from '../content/schema'
import type { Streak } from '../habit/streaks'
import { conceptBadges, isMilestoneMasteredForCourse } from '../habit/milestones'
import { useReducedMotion } from '../lesson/useReducedMotion'
import { ROUTES, type NavigateFn } from './routes'
import { prefetchLesson } from '../app/prefetch'
import { WeeklyStreak } from '../habit/WeeklyStreak'
import { ConceptMedallion } from '../habit/ConceptMedallion'
import { CourseJourney } from './CourseJourney'

export interface StudyDeskProps {
  course: Course | null
  progressById: Record<string, Progress>
  streak: Streak
  earned: Set<string>
  /** Milestone ids earned since the last Home visit — play the one-time fade (Q11). */
  newlyEarned?: Set<string>
  displayName: string
  navigate: NavigateFn
  /** When provided, renders a back button instead of the wordmark and sets the
   *  concept-hero-target class so the header morphs from the catalog card. */
  onBack?: () => void
  /** Title to display beside the back button (concept name). */
  conceptTitle?: string
}

// Stagger: sections rise in sequence on load; reduced-motion drops the slide
// (MotionConfig handles it at the lesson root) leaving an opacity-only fade.
const deskContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
}
const deskItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.out } },
}

export function StudyDesk({
  course,
  progressById,
  streak,
  earned,
  newlyEarned,
  displayName,
  navigate,
  onBack,
  conceptTitle,
}: StudyDeskProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="ergo-home">
      {onBack ? (
        <header className="ergo-topbar concept-hero-target" aria-label={conceptTitle ?? 'Concept'}>
          <button
            type="button"
            className="ergo-avatar"
            onClick={onBack}
            aria-label="Back to catalog"
          >
            ‹
          </button>
          <span className="ergo-wordmark">{conceptTitle}</span>
          <button
            type="button"
            className="ergo-avatar"
            onClick={() => navigate(ROUTES.profile)}
            aria-label={`Profile: ${displayName}`}
          >
            {displayName.charAt(0).toUpperCase()}
          </button>
        </header>
      ) : (
        <header className="ergo-topbar" aria-label="Ergo navigation">
          <span className="ergo-wordmark">Ergo</span>
          <button
            type="button"
            className="ergo-avatar"
            onClick={() => navigate(ROUTES.profile)}
            aria-label={`Profile: ${displayName}`}
          >
            {displayName.charAt(0).toUpperCase()}
          </button>
        </header>
      )}

      <main aria-label="Home">
        {!course ? (
          <ErgoSkeleton />
        ) : (
          <m.div
            variants={deskContainer}
            initial="hidden"
            animate="show"
          >
            {/* ── Momentum band ── */}
            <m.div variants={deskItem}>
              <section className="ergo-momentum" aria-label="Momentum">
                <div className="ergo-momentum__left">
                  <WeeklyStreak
                    count={streak.count}
                    lastActiveDate={streak.lastActiveDate}
                  />
                </div>
                <div className="ergo-momentum__right">
                  <p className="ergo-medallions__label">Concepts mastered</p>
                  <div
                    className="ergo-medallions__row"
                    role="list"
                    aria-label="Concepts mastered"
                  >
                    {conceptBadges(course).map(({ meta, hueVar, capstone }) => (
                      <ConceptMedallion
                        key={meta.id}
                        meta={meta}
                        earned={earned.has(meta.id)}
                        earning={newlyEarned?.has(meta.id)}
                        mastered={isMilestoneMasteredForCourse(
                          course,
                          meta.id,
                          progressById,
                        )}
                        hueVar={hueVar}
                        capstone={capstone}
                      />
                    ))}
                  </div>
                </div>
              </section>
            </m.div>

            {/* ── Course journey (Agent 3) ── */}
            <m.div variants={deskItem} onPointerEnter={prefetchLesson} onFocus={prefetchLesson}>
              <CourseJourney
                course={course}
                progressById={progressById}
                navigate={navigate}
                reducedMotion={reducedMotion}
              />
            </m.div>
          </m.div>
        )}
      </main>
    </div>
  )
}

// Hairline skeleton — shown while course data loads. No spinner; hairline
// placeholders for the momentum band + a few journey rows (Q22).
function ErgoSkeleton() {
  return (
    <div className="ergo-skeleton" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Loading your study desk…</span>
      <div className="ergo-skeleton__band" />
      <div className="ergo-skeleton__journey">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="ergo-skeleton__row" />
        ))}
      </div>
    </div>
  )
}
