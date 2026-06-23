import { useMemo, useState } from 'react'
import { buildAutomaton } from '../engine/automaton'
import { loadFlagshipLesson } from '../content/loader'
import { PhaseRail } from './PhaseRail'
import { biasChipState } from './phases'
import { useReducedMotion } from './useReducedMotion'
import { BeatView } from './beats'
import type { LessonState } from './beats/types'

export function LessonPlayer() {
  const [lesson] = useState(loadFlagshipLesson)
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [needsReview, setNeedsReview] = useState(false)
  const [lessonState, setLessonStateRaw] = useState<LessonState>({})
  const reducedMotion = useReducedMotion()

  // The flagship lesson is HH-centric (HT is the side-by-side contrast); the
  // engine-driven beats build the primary pattern's automaton.
  const pattern = lesson.patternOptions[0]
  const automaton = useMemo(() => buildAutomaton(pattern, 0.5), [pattern])

  const beat = lesson.beats[index]
  const isLast = index === lesson.beats.length - 1
  const chip = biasChipState(beat.beatId)

  function advance() {
    if (isLast) {
      setDone(true)
      return
    }
    setIndex((i) => Math.min(i + 1, lesson.beats.length - 1))
  }

  function back() {
    setDone(false)
    setIndex((i) => Math.max(i - 1, 0))
  }

  const setLessonState = (patch: Partial<LessonState>) =>
    setLessonStateRaw((prev) => ({ ...prev, ...patch }))

  return (
    <div className="lesson">
      <header className="topbar">
        <button
          type="button"
          className="topbar__back"
          onClick={back}
          disabled={index === 0}
          aria-label="Previous beat"
        >
          ←
        </button>
        <div className="topbar__center">
          <span className="topbar__title">{lesson.title}</span>
          <div className="rail-row">
            <PhaseRail beatId={beat.beatId} />
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
        <span className="streak" aria-label="Daily streak">
          0
        </span>
      </header>

      <section className="prompt">
        {!beat.required && <p className="prompt__kicker">Extension</p>}
        <p className="prompt__text">{beat.prompt}</p>
        {done && (
          <p className="done-note">
            Lesson complete ✓{needsReview ? ' · review recommended' : ''}
          </p>
        )}
      </section>

      <BeatView
        key={beat.beatId}
        beat={beat}
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
      />
    </div>
  )
}
