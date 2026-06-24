import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildAutomaton } from '../engine/automaton'
import { loadFlagshipLesson } from '../content/loader'
import type { Lesson, Snapshot } from '../content/schema'
import { PhaseRail } from './PhaseRail'
import { biasChipState } from './phases'
import { computeMastered, bumpMaxHintLevel } from './mastery'
import { useReducedMotion } from './useReducedMotion'
import { BeatView } from './beats'
import type { LessonState } from './beats/types'
import {
  hintLevelsOf,
  maxHintLevelsOf,
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
import { MilestoneSeal } from '../habit/MilestoneSeal'
import { StreakTally } from '../habit/StreakTally'
import { analytics } from '../analytics/events'
import { LessonCelebration } from './LessonCelebration'

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
  track = 'B',
}: {
  lesson?: Lesson
  initialSnapshot?: Snapshot | null
  persistence?: { uid: string; lessonId: string }
  onExit?: () => void
  // Two-track selection (L1 §3.3). Default 'B' = today's experience. Track 'A'
  // reveals the additive scaffolds (primers, split density, name-the-overlap).
  track?: 'A' | 'B'
} = {}) {
  const [lesson] = useState<Lesson>(() => lessonProp ?? loadFlagshipLesson())
  const persist = !!persistence?.uid
  const lessonId = persistence?.lessonId ?? lesson.lessonId

  // Beats render for a track when they carry no `track` (or 'both'), or match
  // the active track. Track-exclusive beats are authored `required: false`, so
  // the Cloud Function's required-beat check (which sees the full fixture)
  // always passes regardless of which track a learner took.
  const visibleBeats = useMemo(
    () =>
      lesson.beats.filter(
        (b) => !b.track || b.track === 'both' || b.track === track,
      ),
    [lesson, track],
  )

  const [index, setIndex] = useState<number>(() => {
    if (!initialSnapshot) return 0
    const i = visibleBeats.findIndex((b) => b.beatId === initialSnapshot.beatId)
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
  const [maxHintLevelByBeat, setMaxHintLevelByBeat] = useState<
    Record<string, number>
  >(() => (initialSnapshot ? maxHintLevelsOf(initialSnapshot) : {}))
  // Adaptive override (build-brief §4.10c): per-beat cap lift + re-prefill nonce.
  // When a learner reaches a capped beat's hint cap while still wrong, the cap is
  // lifted (the level-3 reveal becomes reachable — no dead-end) and, on an
  // equationTiles beat, the assist nonce bumps to re-prefill all but the last term.
  const [capLiftByBeat, setCapLiftByBeat] = useState<Record<string, boolean>>({})
  const [assistNonceByBeat, setAssistNonceByBeat] = useState<
    Record<string, number>
  >({})
  const [lessonState, setLessonStateRaw] = useState<LessonState>(() =>
    initialSnapshot ? snapshotToLessonState(initialSnapshot) : {},
  )
  const [completion, setCompletion] = useState<CompleteLessonResult | null>(null)
  // Habit loop (Phase 17): the streak tally shown in the top bar.
  const [streak, setStreak] = useState<Streak>(ZERO_STREAK)
  const reducedMotion = useReducedMotion()
  // Ref for the post-completion CTA so focus moves to it when done.
  const ctaRef = useRef<HTMLButtonElement>(null)

  // The shared hitting-time automaton for the lesson's primary pattern (the
  // flagship is HH-centric; HT is the side-by-side contrast). Active-pattern
  // convention (build-brief §4.3): race (L2) and walk (L3) beats IGNORE this
  // shared automaton and build their own model (the OverlapBeat precedent), so
  // those lessons keep patternOptions[0] a valid H/T placeholder (L3 uses ["H"]).
  // Guard a missing/invalid placeholder so a mis-authored fixture can't crash the
  // whole player before any beat renders (buildAutomaton throws on non-H/T).
  const raw = lesson.patternOptions[0]
  const pattern = raw && /^[HT]+$/.test(raw) ? raw : 'H'
  const automaton = useMemo(() => buildAutomaton(pattern, 0.5), [pattern])
  // The milestone this lesson awards, surfaced on the recap stamp (Phase 17).
  const milestone = useMemo(
    () => milestoneMeta(lesson.milestoneId),
    [lesson.milestoneId],
  )

  const beat = visibleBeats[index]
  const isLast = index === visibleBeats.length - 1
  const chip = biasChipState(beat.beatId)
  // Density is resolved by track: Track A gets the segmented/scaffolded rendering
  // unless a beat pins its own `density`. Track B stays 'merged' (today).
  const density = beat.density ?? (track === 'A' ? 'split' : 'merged')

  // Per-lesson mastery signal (L1 §9): the required graded beats first-try-
  // correct with no hint ever shown (the hint high-water mark stays 0).
  // Non-blocking — surfaced on the done note + persisted via derived.mastered;
  // never gates unlock. A future L4 mixed review re-surfaces beats when false.
  const mastered = computeMastered(visibleBeats, maxHintLevelByBeat)

  // Referentially stable so the equation-builder's report-up effect doesn't loop.
  const setLessonState = useCallback(
    (patch: Partial<LessonState>) =>
      setLessonStateRaw((prev) => ({ ...prev, ...patch })),
    [],
  )

  const onHintLevelChange = useCallback(
    (level: number) => {
      setHintLevelByBeat((prev) =>
        prev[beat.beatId] === level ? prev : { ...prev, [beat.beatId]: level },
      )
      // Persist the high-water mark too: the visible level resets to 0 on a
      // correct submit, so only the max records whether a beat was ever a
      // struggle (the per-lesson mastery signal reads this).
      setMaxHintLevelByBeat((prev) => bumpMaxHintLevel(prev, beat.beatId, level))
      // Adaptive override: once the learner reaches a capped beat's fixture cap
      // and is still wrong, lift the cap (so the reveal is reachable) and
      // re-prefill all but the last term (equationTiles). Guarantees no capped
      // beat can dead-end (build-brief §4.10c DoD).
      const cap = beat.maxHintLevel
      if (cap !== undefined && cap < 3 && level >= cap) {
        setCapLiftByBeat((prev) =>
          prev[beat.beatId] ? prev : { ...prev, [beat.beatId]: true },
        )
        setAssistNonceByBeat((prev) => ({
          ...prev,
          [beat.beatId]: (prev[beat.beatId] ?? 0) + 1,
        }))
      }
    },
    [beat.beatId, beat.maxHintLevel],
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
      maxHintLevelByBeat,
    }),
    [
      lessonId,
      beat.beatId,
      pattern,
      completedBeats,
      lessonState,
      hintLevelByBeat,
      maxHintLevelByBeat,
    ],
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

  // On completion: scroll to top and move focus to the return CTA so the
  // celebration is immediately in view (a11y + discoverability).
  useEffect(() => {
    if (!done) return
    if (reducedMotion) {
      window.scrollTo(0, 0)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    ctaRef.current?.focus()
  }, [done, reducedMotion])

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
            mastered,
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
    setIndex((i) => Math.min(i + 1, visibleBeats.length - 1))
  }

  function back() {
    setDone(false)
    setIndex((i) => Math.max(i - 1, 0))
  }

  const atStart = index === 0
  const canExit = !!onExit

  // Completion takeover: replaces the beat entirely so the celebration and the
  // return CTA are right in front of the learner (not buried above the fold).
  if (done) {
    return (
      <div className="lesson">
        <header className="topbar">
          <button
            type="button"
            className="topbar__back"
            onClick={onExit}
            disabled={!canExit}
            aria-label="Back to course path"
          >
            ←
          </button>
          <div className="topbar__center">
            <span className="topbar__title">{lesson.title}</span>
          </div>
          <StreakTally count={streak.count} compact />
        </header>

        <LessonCelebration>
          <div className="done-note">
            <p>
              Lesson complete ✓
              {mastered
                ? ' · fully mastered'
                : needsReview
                  ? ' · review recommended'
                  : ''}
              {completion?.unlockedLessonId ? ' · next lesson unlocked' : ''}
            </p>
            <MilestoneSeal meta={milestone} earned />
          </div>
        </LessonCelebration>

        <footer className="actionbar">
          {canExit && (
            <button
              ref={ctaRef}
              type="button"
              className="btn btn--primary"
              onClick={onExit}
            >
              Back to course path
            </button>
          )}
        </footer>
      </div>
    )
  }

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
            <PhaseRail
              beatId={beat.beatId}
              lessonId={lesson.lessonId}
              reducedMotion={reducedMotion}
            />
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
      </section>

      <BeatView
        key={beat.beatId}
        beat={beat}
        lessonId={lessonId}
        pattern={pattern}
        patternOptions={lesson.patternOptions}
        automaton={automaton}
        reducedMotion={reducedMotion}
        density={density}
        isLast={isLast}
        onAdvance={advance}
        reportNeedsReview={() => setNeedsReview(true)}
        needsReview={needsReview}
        lessonState={lessonState}
        setLessonState={setLessonState}
        initialHintLevel={hintLevelByBeat[beat.beatId]}
        onHintLevelChange={onHintLevelChange}
        hintCapOverride={capLiftByBeat[beat.beatId] ? 3 : undefined}
        assist={{
          prefillToLastTerm: true,
          nonce: assistNonceByBeat[beat.beatId] ?? 0,
        }}
        milestone={milestone}
        lessonComplete={done}
      />
    </div>
  )
}
