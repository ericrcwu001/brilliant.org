import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildAutomaton } from '../engine/automaton'
import { loadFlagshipLesson } from '../content/loader'
import type { Lesson, Snapshot } from '../content/schema'
import { PhaseRail } from './PhaseRail'
import { biasChipState } from './phases'
import { useReducedMotion } from './useReducedMotion'
import { BeatView } from './beats'
import type { LessonState } from './beats/types'
import {
  hintLevelsOf,
  snapshotToLessonState,
  useSnapshotWriter,
  type SnapshotInput,
} from './snapshot'
import {
  completeLesson,
  recordQualifyingAction,
  type CompleteLessonResult,
} from '../progress/functions'
import { loadStreak, ZERO_STREAK, type Streak } from '../habit/streaks'
import { milestoneMeta } from '../habit/milestones'
import { StreakTally } from '../habit/StreakTally'
import { analytics } from '../analytics/events'

// `lesson` is optional: `/dev/lesson` renders the local fixture (no prop, no
// persistence), while the authed route passes a Firestore-loaded lesson plus
// `persistence` (uid + lessonId) and an already-hydrated `initialSnapshot`.
// Persistence (Phase 15) and completion (Phase 16) only engage when `persistence`
// is supplied, so the dev route stays fully local.
export function LessonPlayer({
  lesson: lessonProp,
  initialSnapshot,
  persistence,
  onExit,
}: {
  lesson?: Lesson
  initialSnapshot?: Snapshot | null
  persistence?: { uid: string; lessonId: string }
  onExit?: () => void
} = {}) {
  const [lesson] = useState<Lesson>(() => lessonProp ?? loadFlagshipLesson())
  const persist = !!persistence?.uid
  const lessonId = persistence?.lessonId ?? lesson.lessonId

  const [index, setIndex] = useState<number>(() => {
    if (!initialSnapshot) return 0
    const i = lesson.beats.findIndex((b) => b.beatId === initialSnapshot.beatId)
    return i >= 0 ? i : 0
  })
  const [done, setDone] = useState(false)
  const [needsReview, setNeedsReview] = useState(false)
  const [completedBeats, setCompletedBeats] = useState<string[]>(
    () => initialSnapshot?.completedBeats ?? [],
  )
  const [hintLevelByBeat, setHintLevelByBeat] = useState<Record<string, number>>(
    () => (initialSnapshot ? hintLevelsOf(initialSnapshot) : {}),
  )
  const [lessonState, setLessonStateRaw] = useState<LessonState>(() =>
    initialSnapshot ? snapshotToLessonState(initialSnapshot) : {},
  )
  const [completion, setCompletion] = useState<CompleteLessonResult | null>(null)
  // Habit loop (Phase 17): the streak tally shown in the top bar.
  const [streak, setStreak] = useState<Streak>(ZERO_STREAK)
  const reducedMotion = useReducedMotion()

  // The flagship lesson is HH-centric (HT is the side-by-side contrast); the
  // engine-driven beats build the primary pattern's automaton.
  const pattern = lesson.patternOptions[0]
  const automaton = useMemo(() => buildAutomaton(pattern, 0.5), [pattern])
  // The milestone this lesson awards, surfaced on the recap stamp (Phase 17).
  const milestone = useMemo(
    () => milestoneMeta(lesson.milestoneId),
    [lesson.milestoneId],
  )

  const beat = lesson.beats[index]
  const isLast = index === lesson.beats.length - 1
  const chip = biasChipState(beat.beatId)

  // Referentially stable so the equation-builder's report-up effect doesn't loop.
  const setLessonState = useCallback(
    (patch: Partial<LessonState>) =>
      setLessonStateRaw((prev) => ({ ...prev, ...patch })),
    [],
  )

  const onHintLevelChange = useCallback(
    (level: number) =>
      setHintLevelByBeat((prev) =>
        prev[beat.beatId] === level ? prev : { ...prev, [beat.beatId]: level },
      ),
    [beat.beatId],
  )

  // --- Persistence (Phase 15) -------------------------------------------------
  const writer = useSnapshotWriter({
    uid: persistence?.uid ?? null,
    lessonId,
    enabled: persist,
  })

  const snapshotInput = useMemo<SnapshotInput>(
    () => ({
      lessonId,
      beatId: beat.beatId,
      pattern,
      completedBeats,
      lessonState,
      hintLevelByBeat,
    }),
    [lessonId, beat.beatId, pattern, completedBeats, lessonState, hintLevelByBeat],
  )

  // Mirror every committed change (debounced remote write + synchronous local
  // mirror inside the writer); flush immediately whenever the beat changes.
  const lastFlushedBeat = useRef<string | null>(null)
  useEffect(() => {
    if (!persist) return
    writer.save(snapshotInput)
    if (lastFlushedBeat.current !== beat.beatId) {
      lastFlushedBeat.current = beat.beatId
      writer.flush()
    }
  }, [persist, writer, snapshotInput, beat.beatId])

  // --- Habit loop + analytics (Phase 17 / 19) ---------------------------------
  // Load the streak tally for the top bar once signed in (best-effort).
  useEffect(() => {
    const uid = persistence?.uid
    if (!persist || !uid) return
    let cancelled = false
    void loadStreak(uid).then((s) => {
      if (!cancelled) setStreak(s)
    })
    return () => {
      cancelled = true
    }
  }, [persist, persistence?.uid])

  // beat_viewed fires on each beat change (no-op in emulator/dev).
  useEffect(() => {
    analytics.beatViewed({ lessonId, beatId: beat.beatId })
  }, [lessonId, beat.beatId])

  // lesson_completed fires exactly once when the lesson finishes.
  const completedAnalyticsFired = useRef(false)
  useEffect(() => {
    if (done && !completedAnalyticsFired.current) {
      completedAnalyticsFired.current = true
      analytics.lessonCompleted({ lessonId, needsReview })
    }
  }, [done, lessonId, needsReview])

  // --- Completion (Phase 16) --------------------------------------------------
  const completedOnce = useRef(false)

  function advance() {
    const firstTime = !completedBeats.includes(beat.beatId)
    const nextCompleted = firstTime
      ? [...completedBeats, beat.beatId]
      : completedBeats
    if (firstTime) setCompletedBeats(nextCompleted)

    // Required beat completion is the streak's qualifying action (Phase 17).
    // Fire-and-forget on the achievement path; never blocks the UI. The result
    // carries the updated streak, so the top-bar tally refreshes and
    // streak_incremented fires once, on the call that first ticks the day.
    if (persist && beat.required && firstTime) {
      void recordQualifyingAction({ lessonId, beatId: beat.beatId })
        .then((res) => {
          if (!res.streak) return
          setStreak({
            count: res.streak.count,
            longest: res.streak.longest,
            lastActiveDate: res.streak.lastActiveDate,
          })
          if (res.streak.incremented && res.streak.lastActiveDate) {
            analytics.streakIncremented({
              count: res.streak.count,
              date: res.streak.lastActiveDate,
            })
          }
        })
        .catch(() => {})
    }

    if (isLast) {
      setDone(true)
      if (persist && !completedOnce.current) {
        completedOnce.current = true
        writer.flush()
        void completeLesson({
          lessonId,
          completedBeats: nextCompleted,
          needsReview,
          derived: {
            initialPrediction: lessonState.initialPrediction ?? null,
            finalPrediction: lessonState.finalPrediction ?? null,
            empiricalMean: lessonState.empiricalMean ?? null,
            theoreticalValue: lessonState.theoreticalValue ?? null,
            simRuns: lessonState.simRuns ?? null,
          },
        })
          .then((res) => {
            setCompletion(res)
            // milestone_earned for each milestone this completion newly awarded
            // (lesson milestone + course-completion when all three are done).
            for (const milestoneId of res.awardedMilestones ?? []) {
              analytics.milestoneEarned({ lessonId, milestoneId })
            }
          })
          .catch(() => {})
      }
      return
    }
    setIndex((i) => Math.min(i + 1, lesson.beats.length - 1))
  }

  function back() {
    setDone(false)
    setIndex((i) => Math.max(i - 1, 0))
  }

  const atStart = index === 0
  const canExit = !!onExit

  return (
    <div className="lesson">
      <header className="topbar">
        <button
          type="button"
          className="topbar__back"
          onClick={atStart ? onExit : back}
          disabled={atStart && !canExit}
          aria-label={atStart && canExit ? 'Back to course path' : 'Previous beat'}
        >
          ←
        </button>
        <div className="topbar__center">
          <span className="topbar__title">{lesson.title}</span>
          <div className="rail-row">
            <PhaseRail beatId={beat.beatId} reducedMotion={reducedMotion} />
            {chip !== 'hidden' && (
              <span
                className={`biaschip biaschip--${chip}`}
                aria-label="Bias sandbox extension"
              >
                Try bias
              </span>
            )}
          </div>
        </div>
        <StreakTally count={streak.count} compact />
      </header>

      <section className="prompt">
        {!beat.required && <p className="prompt__kicker">Extension</p>}
        <p className="prompt__text">{beat.prompt}</p>
        {done && (
          <div className="done-note">
            <p>
              Lesson complete ✓{needsReview ? ' · review recommended' : ''}
              {completion?.unlockedLessonId ? ' · next lesson unlocked' : ''}
            </p>
            {canExit && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={onExit}
              >
                Back to course path
              </button>
            )}
          </div>
        )}
      </section>

      <BeatView
        key={beat.beatId}
        beat={beat}
        lessonId={lessonId}
        pattern={pattern}
        patternOptions={lesson.patternOptions}
        automaton={automaton}
        reducedMotion={reducedMotion}
        isLast={isLast}
        onAdvance={advance}
        reportNeedsReview={() => setNeedsReview(true)}
        needsReview={needsReview}
        lessonState={lessonState}
        setLessonState={setLessonState}
        initialHintLevel={hintLevelByBeat[beat.beatId]}
        onHintLevelChange={onHintLevelChange}
        milestone={milestone}
        lessonComplete={done}
      />
    </div>
  )
}
