// Dev-only Study Desk harness (mirrors /dev/lesson). Renders the presentational
// <StudyDesk> against the committed course fixture + mock progress/streak/earned
// so the graph-node Home can be built and visually verified with no Firebase /
// emulator. A small scenario switcher exercises the gate states (first visit,
// resume, review + earn fade, loading). Not part of the authed flow.

import { useState } from 'react'
import courseFixture from '../../fixtures/course-pattern-hitting-times.json'
import { CourseSchema, type Course, type Progress } from '../content/schema'
import { ZERO_STREAK, type Streak } from '../habit/streaks'
import { StudyDesk } from './StudyDesk'
import type { NavigateFn } from './routes'

const course: Course = CourseSchema.parse(courseFixture)
const L1 = 'lesson-pattern-hitting-times'

type ScenarioId = 'first' | 'resume' | 'review' | 'loading'

interface Scenario {
  label: string
  course: Course | null
  progressById: Record<string, Progress>
  streak: Streak
  earned: Set<string>
  newlyEarned: Set<string>
}

const SCENARIOS: Record<ScenarioId, Scenario> = {
  first: {
    label: 'First visit',
    course,
    progressById: {},
    streak: ZERO_STREAK,
    earned: new Set(),
    newlyEarned: new Set(),
  },
  resume: {
    label: 'Resume',
    course,
    progressById: { [L1]: { completionStatus: 'in_progress', currentBeat: 'simulate' } },
    streak: { count: 3, longest: 3, lastActiveDate: null },
    earned: new Set(),
    newlyEarned: new Set(),
  },
  review: {
    label: 'Review + earn fade',
    course,
    progressById: { [L1]: { completionStatus: 'completed', needsReview: true } },
    streak: { count: 5, longest: 7, lastActiveDate: null },
    earned: new Set(['hh-ht-mastered']),
    newlyEarned: new Set(['hh-ht-mastered']),
  },
  loading: {
    label: 'Loading',
    course: null,
    progressById: {},
    streak: ZERO_STREAK,
    earned: new Set(),
    newlyEarned: new Set(),
  },
}

const SCENARIO_ORDER: ScenarioId[] = ['first', 'resume', 'review', 'loading']

// In the harness, "entering a lesson" jumps to the local /dev/lesson fixture;
// profile/other navigation is a no-op (no auth here).
const devNavigate: NavigateFn = (to) => {
  if (to.startsWith('/lesson/')) window.location.assign('/dev/lesson')
}

export function DevHomePage() {
  const [id, setId] = useState<ScenarioId>('first')
  const s = SCENARIOS[id]

  return (
    <>
      <div className="dev-switcher" role="group" aria-label="Dev scenarios">
        <span className="dev-switcher__label">/dev/home</span>
        {SCENARIO_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            className={`dev-switcher__btn${id === key ? ' dev-switcher__btn--on' : ''}`}
            onClick={() => setId(key)}
          >
            {SCENARIOS[key].label}
          </button>
        ))}
      </div>
      <StudyDesk
        key={id}
        course={s.course}
        progressById={s.progressById}
        streak={s.streak}
        earned={s.earned}
        newlyEarned={s.newlyEarned}
        displayName="Dev"
        navigate={devNavigate}
      />
    </>
  )
}
