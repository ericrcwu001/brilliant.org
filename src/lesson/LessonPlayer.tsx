import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildAutomaton } from '../engine/automaton'
import { loadFlagshipLesson } from '../content/loader'
import type { Lesson, Snapshot } from '../content/schema'
import { PhaseRail } from './PhaseRail'
import { biasChipState } from './phases'
import { chapterOf, chapterHueVar } from './chapters'
import { computeMastered, bumpMaxHintLevel, isCheckpointBeat } from './mastery'
import { useReducedMotion } from './useReducedMotion'
import { BeatView } from './beats'
import type { LessonState } from './beats/types'
import {
  hintLevelsOf,
  maxHintLevelsOf,
  confidencesOf,
  repWindowOf,
  snapshotToLessonState,
  useSnapshotWriter,
  type SnapshotInput,
} from './snapshot'
import {
  governorState,
  pushRep,
  effectiveHintCap,
  EMPTY_WINDOW,
  type RepWindow,
  type GovernorState,
} from './governor'
import { isRetrievalRep } from './retrievalRep'
import {
  completeLesson,
  recordQualifyingAction,
  type CompleteLessonResult,
} from '../progress/functions'
import { loadStreak, ZERO_STREAK, type Streak } from '../habit/streaks'
import { milestoneMeta, type ConceptBadge } from '../habit/milestones'
import { BadgeStamp } from './BadgeStamp'
import { WeeklyStreak } from '../habit/WeeklyStreak'
import { analytics } from '../analytics/events'
import { CELEBRATE_BEAT } from '../motion/tokens'
import { LessonCelebration } from './LessonCelebration'
import { withViewTransition } from '../app/viewTransition'
import { useOnlineStatus } from '../app/useOnlineStatus'
import { StatusNote } from '../ui/StatusNote'

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
  onInterviewCta,
  badge,
  track = 'B',
  review = false,
  showConfidence = false,
  quantGate = false,
  labelStripped = false,
}: {
  lesson?: Lesson
  initialSnapshot?: Snapshot | null
  persistence?: { uid: string; lessonId: string }
  onExit?: () => void
  /** Called when the learner clicks "Take the capstone interview" on the done screen. */
  onInterviewCta?: () => void
  // Per-concept completion badge (icon meta + accent hue). When omitted (e.g. /dev/lesson) it falls back to the flagship milestone meta + chapter hue.
  badge?: ConceptBadge
  // Two-track selection (L1 §3.3). Default 'B' = today's experience. Track 'A'
  // reveals the additive scaffolds (primers, split density, name-the-overlap).
  track?: 'A' | 'B'
  // When true, this is a replay of an already-completed lesson: start from the
  // first beat with a fresh pass so mastery is re-evaluated (badge can only
  // improve, never demote — enforced server-side). Completion is never lost.
  review?: boolean
  // Confidence capture gate (spec-02 / D6). The ROUTE must pass the quant-intensity
  // gate (isQuantIntensity: track === 'B' || userDoc.learningGoal === 'interview');
  // the player has no userDoc access and stays dumb. Default false ⇒ the rating
  // renders nowhere (Track A / gentle) until a route opts in.
  showConfidence?: boolean
  // Quant-intensity gate (README §4 / D2 / D9): resolved by the CALLER via the
  // shared isQuantIntensity helper (the player has no userDoc access and stays
  // dumb — it never re-derives the gate from track/learningGoal). The difficulty
  // governor (spec-21) runs ONLY when true; Track A is static (quantGate === false),
  // so its experience is byte-for-byte unchanged. Default false ⇒ fail GENTLE.
  quantGate?: boolean
  // Label-stripping presentation mode (spec-13 / §3.3). When true the player hides
  // the lesson title + the beat.prompt section surface-wide (the spec-20 queue sets
  // it). A which-method gate beat is ALWAYS stripped locally regardless. Default
  // false ⇒ today's chrome.
  labelStripped?: boolean
} = {}) {
  const [lesson] = useState<Lesson>(() => lessonProp ?? loadFlagshipLesson())
  const persist = !!persistence?.uid
  const lessonId = persistence?.lessonId ?? lesson.lessonId
  const online = useOnlineStatus()

  // Beats render for a track when they carry no `track` (or 'both'), or match
  // the active track. Track-exclusive beats are authored `required: false`, so
  // the Cloud Function's required-beat check (which sees the full fixture)
  // always passes regardless of which track a learner took.
  //
  // spec-11 (README §5, §8 R6, gate Issue #10): held-out transfer beats
  // (`beat.heldOut === true`, authored by spec-24) are SR-queue-only — they are
  // the Track-B gold gate and must NEVER render inline in the normal lesson flow
  // (else a learner sees the transfer problem the same day and the gold gate is
  // defeated). Dropping them here also keeps them out of `completedBeats`,
  // `isLast`, and the `computeMastered(visibleBeats, …)` gold-candidate signal
  // with no other change. Optional field ⇒ a safe no-op before spec-24 lands.
  const visibleBeats = useMemo(
    () =>
      lesson.beats.filter(
        (b) =>
          !b.heldOut &&
          (!b.track || b.track === 'both' || b.track === track),
      ),
    [lesson, track],
  )

  const [index, setIndex] = useState<number>(() => {
    if (review || !initialSnapshot) return 0
    const i = visibleBeats.findIndex((b) => b.beatId === initialSnapshot.beatId)
    return i >= 0 ? i : 0
  })
  const [showRestoringNote, setShowRestoringNote] = useState(() => {
    if (review || !initialSnapshot) return false
    const i = visibleBeats.findIndex((b) => b.beatId === initialSnapshot.beatId)
    return i > 0
  })
  const [done, setDone] = useState(false)
  const [needsReview, setNeedsReview] = useState(false)
  const [completedBeats, setCompletedBeats] = useState<string[]>(() =>
    review
      ? visibleBeats.map((b) => b.beatId)
      : (initialSnapshot?.completedBeats ?? []),
  )
  const [hintLevelByBeat, setHintLevelByBeat] = useState<Record<string, number>>(
    () => (initialSnapshot && !review ? hintLevelsOf(initialSnapshot) : {}),
  )
  const [maxHintLevelByBeat, setMaxHintLevelByBeat] = useState<
    Record<string, number>
  >(() => (initialSnapshot && !review ? maxHintLevelsOf(initialSnapshot) : {}))
  // Per-checkpoint confidence ratings (spec-02 / D6). Seeded from the snapshot
  // (same hydration guard as maxHintLevelByBeat); empty + unused on Track A.
  const [confidenceByBeat, setConfidenceByBeat] = useState<
    Record<string, number>
  >(() => (initialSnapshot && !review ? confidencesOf(initialSnapshot) : {}))
  // Difficulty-governor rolling window (spec-21 / D9). Only the quant-intensity
  // gate runs the governor, so seed from the snapshot only then; Track A keeps the
  // window empty + unpersisted (the governor never reads it). A review replay
  // starts fresh, matching the maxHintLevelByBeat seeding guard above.
  const [repWindow, setRepWindow] = useState<RepWindow>(() =>
    initialSnapshot && !review && quantGate
      ? { results: repWindowOf(initialSnapshot) }
      : EMPTY_WINDOW,
  )
  // Adaptive override (build-brief §4.10c): per-beat cap lift + re-prefill nonce.
  // When a learner reaches a capped beat's hint cap while still wrong, the cap is
  // lifted (the level-3 reveal becomes reachable — no dead-end) and, on an
  // equationTiles beat, the assist nonce bumps to re-prefill all but the last term.
  const [capLiftByBeat, setCapLiftByBeat] = useState<Record<string, boolean>>({})
  const [assistNonceByBeat, setAssistNonceByBeat] = useState<
    Record<string, number>
  >({})
  const [lessonState, setLessonStateRaw] = useState<LessonState>(() =>
    initialSnapshot && !review ? snapshotToLessonState(initialSnapshot) : {},
  )
  const [completion, setCompletion] = useState<CompleteLessonResult | null>(null)
  const [completionError, setCompletionError] = useState(false)
  // Habit loop (Phase 17): the streak tally shown in the top bar.
  const [streak, setStreak] = useState<Streak>(ZERO_STREAK)
  const reducedMotion = useReducedMotion()
  // Ref for the post-completion CTA so focus moves to it when done.
  const ctaRef = useRef<HTMLButtonElement>(null)
  // Ref for the chapter-color light-streak element (GSAP, compositor-only).
  const streakRef = useRef<HTMLDivElement>(null)

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

  // Difficulty governor (spec-21 / D9). Runs ONLY on the quant-intensity gate;
  // Track A always gets the static default (offerFade:false, hintCap:'default'),
  // so its experience is byte-for-byte unchanged. The governor modulates ONLY
  // scaffolding (fade density + hint cap) within a bounded closed enum — never
  // retrieval volume or spacing (those are the queue's / transfer gate's job).
  const gov: GovernorState = quantGate
    ? governorState(repWindow)
    : { offerFade: false, hintCap: 'default' }

  // Density is resolved by track: Track A gets the segmented/scaffolded rendering
  // unless a beat pins its own `density`. Track B stays 'merged' (today) UNLESS the
  // governor says "struggling" (gov.offerFade) — then the faded rung is OFFERED on
  // the quant gate to make a too-hard streak easier. Author-pinned beat.density
  // still wins; Track A is unaffected (gov is the static default there).
  const density: 'split' | 'merged' =
    beat.density ?? (track === 'A' ? 'split' : gov.offerFade ? 'split' : 'merged')

  // Effective hint cap = max(governor cap, struggle cap-lift). effectiveHintCap is
  // FLOORED at 2 (never strands a learner), and the struggle cap-lift to 3 always
  // wins — so even when the governor tightens, a persistent learner reaches the
  // level-3 reveal (R6 / §3.5). Off the quant gate this is undefined, preserving
  // today's struggle-only behavior (Track A unchanged).
  const govCap = effectiveHintCap(gov, beat.maxHintLevel)
  const struggleLift = capLiftByBeat[beat.beatId] ? 3 : 0
  const hintCapOverride: 1 | 2 | 3 | undefined = quantGate
    ? ((Math.max(govCap, struggleLift) || beat.maxHintLevel) as 1 | 2 | 3 | undefined)
    : capLiftByBeat[beat.beatId]
      ? 3
      : undefined

  // Label-stripping (spec-13 / §3.3): a which-method gate is ALWAYS title-stripped
  // locally (it must not reveal "Markov Chains → Lesson 3"); the spec-20 queue also
  // sets `labelStripped` surface-wide. `stripped` drives the title (:521/:435) and
  // the player's beat.prompt section (:555) suppression below.
  const isGate =
    beat.interaction.type === 'prediction' && !!beat.interaction.gate
  const stripped = labelStripped || isGate

  // Per-lesson GOLD-CANDIDATE signal (spec-11 / D7): the required graded beats
  // were completed — hints are now FORGIVEN (computeMastered no longer reads the
  // hint high-water mark). It is sent in `data.derived.mastered` but the server
  // IGNORES it for gold (completeLesson writes mastered:false unconditionally;
  // §3.2). Gold is minted later by a delayed SR pass (submitReview). Still
  // surfaced on the done note + non-blocking (never gates unlock).
  const mastered = computeMastered(visibleBeats, maxHintLevelByBeat)

  // Stable beat-navigation callbacks for withViewTransition. These are defined
  // with useCallback so the React Compiler can correctly analyse them as
  // side-effectful (state-setter calls), preventing it from silently skipping
  // the withViewTransition call site as a pure no-op.
  const doAdvanceBeat = useCallback(() => {
    setIndex((i) => Math.min(i + 1, visibleBeats.length - 1))
  }, [visibleBeats.length])

  const doBackBeat = useCallback(() => {
    setDone(false)
    setIndex((i) => Math.max(i - 1, 0))
  }, [])

  // Referentially stable so the equation-builder's report-up effect doesn't loop.
  const clearRestoringNote = useCallback(() => {
    setShowRestoringNote(false)
  }, [])

  const setLessonState = useCallback(
    (patch: Partial<LessonState>) => {
      clearRestoringNote()
      setLessonStateRaw((prev) => ({ ...prev, ...patch }))
    },
    [clearRestoringNote],
  )

  const onHintLevelChange = useCallback(
    (level: number) => {
      clearRestoringNote()
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
    [beat.beatId, beat.maxHintLevel, clearRestoringNote],
  )

  // Difficulty-governor retrieval-rep signal (spec-21 / D9). A graded checkpoint
  // (masteryChallenge today; review/which-method surfaces added by spec-10/13)
  // reports its correct/wrong outcome here. We gate the window append on
  // isRetrievalRep (spec-03) so the window stays definitionally equal to "retrieval
  // reps" even if a non-rep beat ever calls onGraded. Fires analytics.retrievalRep
  // (spec-03's reserved hook) regardless of track; only appends to the governor
  // window on the quant gate (Track A keeps the window empty). source:'lesson'
  // until spec-10 surfaces review reps; beat.schemaId is undefined until spec-00
  // backfill (the analytics field is optional).
  const onGraded = useCallback(
    (correct: boolean) => {
      const ctx = { source: 'lesson' as const, schemaId: beat.schemaId }
      if (!isRetrievalRep(beat, ctx)) return
      analytics.retrievalRep({
        lessonId,
        beatId: beat.beatId,
        schemaId: beat.schemaId,
        correct,
        source: 'lesson',
      })
      if (quantGate) setRepWindow((w) => pushRep(w, correct))
    },
    [beat, lessonId, quantGate],
  )

  // Confidence rating chosen on a checkpoint beat (spec-02 / D6). Persisted into
  // confidenceByBeat exactly like maxHintLevelByBeat; never gates anything.
  const onConfidence = useCallback(
    (v: number) => {
      clearRestoringNote()
      analytics.confidenceRated({ lessonId, beatId: beat.beatId, value: v })
      setConfidenceByBeat((prev) =>
        prev[beat.beatId] === v ? prev : { ...prev, [beat.beatId]: v },
      )
    },
    [beat.beatId, lessonId, clearRestoringNote],
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
      confidenceByBeat,
      // Persist the governor window so it survives a mid-lesson refresh and (post-
      // spec-10) accrues across the session. Empty for Track A (the governor never
      // appends there), so this is a no-op write for gentle learners (spec-21 §3.6).
      repWindow: repWindow.results,
    }),
    [
      lessonId,
      beat.beatId,
      pattern,
      completedBeats,
      lessonState,
      hintLevelByBeat,
      maxHintLevelByBeat,
      confidenceByBeat,
      repWindow,
    ],
  )

  // Mirror every committed change (debounced remote write + synchronous local
  // mirror inside the writer); flush immediately whenever the beat changes.
  const lastFlushedBeat = useRef<string | null>(null)
  useEffect(() => {
    if (!persist || review) return
    writer.save(snapshotInput)
    if (lastFlushedBeat.current !== beat.beatId) {
      lastFlushedBeat.current = beat.beatId
      writer.flush()
    }
  }, [persist, review, writer, snapshotInput, beat.beatId])

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

  // Chapter-color light-streak: one compositor-only sweep across the
  // celebration on mount. Lazy-loaded GSAP; omitted under reduced-motion.
  useEffect(() => {
    if (!done || reducedMotion) return
    const el = streakRef.current
    if (!el) return
    void import('gsap').then(({ default: gsap }) => {
      gsap
        .timeline()
        .fromTo(
          el,
          { xPercent: -100, opacity: 0 },
          { xPercent: 20, opacity: 0.65, duration: CELEBRATE_BEAT * 0.55, ease: 'power2.out' },
        )
        .to(el, { xPercent: 120, opacity: 0, duration: CELEBRATE_BEAT * 0.45, ease: 'power2.in' })
    })
  }, [done, reducedMotion])

  // --- Completion (Phase 16) --------------------------------------------------
  const completedOnce = useRef(false)

  const submitCompletion = useCallback(
    (beats: string[]) => {
      setCompletionError(false)
      writer.flush()
      return completeLesson({
        lessonId,
        completedBeats: beats,
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
          for (const milestoneId of res.awardedMilestones ?? []) {
            analytics.milestoneEarned({ lessonId, milestoneId })
          }
        })
        .catch((err) => {
          console.error('completeLesson failed', err)
          setCompletionError(true)
          completedOnce.current = false
        })
    },
    [writer, lessonId, needsReview, lessonState, mastered],
  )

  function advance() {
    clearRestoringNote()
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
        void submitCompletion(nextCompleted)
      }
      return
    }
    withViewTransition(doAdvanceBeat, 'beat')
  }

  function back() {
    withViewTransition(doBackBeat, 'beat')
  }

  const atStart = index === 0
  const canExit = !!onExit

  // Completion takeover: replaces the beat entirely so the celebration and the
  // return CTA are right in front of the learner (not buried above the fold).
  if (done) {
    return (
      <div className="lesson" data-ch={chapterOf(lessonId)}>
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
            {!stripped && <span className="topbar__title">{lesson.title}</span>}
          </div>
          <WeeklyStreak count={streak.count} lastActiveDate={streak.lastActiveDate} compact />
        </header>

        <LessonCelebration>
          <div ref={streakRef} className="celebration__streak" aria-hidden="true" />
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
            {completionError && (
              <p className="done-note__error" role="alert">
                We couldn't save your progress, so the next lesson may stay locked.{' '}
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    if (completedOnce.current) return
                    completedOnce.current = true
                    void submitCompletion(completedBeats)
                  }}
                >
                  Try again
                </button>
              </p>
            )}
            <p className="done-note__mastered">Concept mastered</p>
            <BadgeStamp
              meta={badge?.meta ?? milestone}
              hueVar={badge?.hueVar ?? chapterHueVar(lessonId)}
              reducedMotion={reducedMotion}
            />
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
          {canExit && completion?.unlockedLessonId === null && onInterviewCta && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                void analytics.interviewCtaClicked({
                  conceptId: lesson.courseId,
                  surface: 'lesson_complete',
                })
                onInterviewCta()
              }}
            >
              Take the capstone interview
            </button>
          )}
        </footer>
      </div>
    )
  }

  return (
    <div className="lesson" data-ch={chapterOf(lessonId)}>
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
          {!stripped && <span className="topbar__title">{lesson.title}</span>}
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
        <WeeklyStreak count={streak.count} lastActiveDate={streak.lastActiveDate} compact />
      </header>

      {persist && !online && (
        <StatusNote tone="offline">
          Saved locally — syncs when you're back online.
        </StatusNote>
      )}
      {persist && showRestoringNote && (
        <StatusNote tone="info">Restoring your work…</StatusNote>
      )}
      {persist && writer.writeError && (
        <StatusNote tone="error">
          Couldn't sync your progress — saved locally.
        </StatusNote>
      )}

      {/* Label-stripping (spec-13 / §3.3): the player renders beat.prompt OUTSIDE
          the beat, so a method-revealing prompt would defeat the gate. Suppress it
          when `stripped` — a gate beat shows WhichMethodGate's own neutral prompt;
          a surface-wide labelStripped lesson hides the prompt likewise. */}
      {!stripped && (
        <section className="prompt">
          {!beat.required && <p className="prompt__kicker">Extension</p>}
          <p className="prompt__text">{beat.prompt}</p>
        </section>
      )}

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
        hintCapOverride={hintCapOverride}
        assist={{
          prefillToLastTerm: true,
          nonce: assistNonceByBeat[beat.beatId] ?? 0,
        }}
        showConfidence={showConfidence && isCheckpointBeat(beat)}
        confidenceValue={confidenceByBeat[beat.beatId]}
        onConfidence={onConfidence}
        onGraded={onGraded}
        labelStripped={stripped}
        milestone={milestone}
        lessonComplete={done}
      />
    </div>
  )
}
