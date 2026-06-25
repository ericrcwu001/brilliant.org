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
import { MILESTONE_SEQUENCE, isMilestoneMastered } from '../habit/milestones'
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
}

// Milestone id → Ergo chapter hue variable name (without '--' prefix).
// Keyed by which lesson/concept the milestone represents; fallback is ergo-brand.
const MILESTONE_HUES: Record<string, string> = {
  'hh-ht-mastered':        'ch1',   // lesson-pattern-hitting-times (Ch1 Foundations)
  'first-pattern-cracked': 'ch3',   // lesson-states-streaks "Mixed Review & Streaks" (Ch3 Mastery)
  'state-machine-builder': 'ch3',   // lesson-longer-patterns "Longer Patterns & Overlap" (Ch3 Mastery)
  'penneys-game-won':      'ch2',   // lesson-penneys-game (Ch2 Racing & Walks)
  'gamblers-ruin-solved':  'ch2',   // lesson-gamblers-ruin (Ch2 Racing & Walks)
  'three-lessons-complete':'ch2',   // mid-course milestone — caps Ch2 Racing & Walks
  'martingale-mastered':   'ch3',   // lesson-overlap-shortcut (Ch3 Mastery)
  'six-lessons-complete':  'ergo-brand', // course completion — brand indigo (capstone)
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
}: StudyDeskProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="ergo-home">
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
                    {MILESTONE_SEQUENCE.map((meta) => (
                      <ConceptMedallion
                        key={meta.id}
                        meta={meta}
                        earned={earned.has(meta.id)}
                        earning={newlyEarned?.has(meta.id)}
                        mastered={isMilestoneMastered(meta.id, progressById)}
                        hueVar={MILESTONE_HUES[meta.id]}
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
