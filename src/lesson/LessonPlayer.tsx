import { useState } from 'react'
import { loadFlagshipLesson } from '../content/loader'
import { PhaseRail } from './PhaseRail'
import { BeatInteraction } from './renderers'

// Design-system CTA matrix (docs/ui_design_system.md "Sticky Action Bar"). In
// Group A every primary action simply advances the stub; Group B wires the
// real enablement and feedback behind each one.
const PRIMARY_ACTION: Record<string, string> = {
  'open-bet': 'Continue',
  'pattern-pick': 'Continue',
  simulate: 'Continue',
  'failure-edge': 'Check',
  'equation-tiles': 'Check',
  'refine-prediction': 'Lock prediction',
  'guided-solve': 'Continue',
  'theory-vs-sim': 'Run simulation',
  overlap: 'Continue',
  'bias-sandbox': 'Continue',
  recap: 'Continue',
}

export function LessonPlayer() {
  const [lesson] = useState(loadFlagshipLesson)
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)

  const beat = lesson.beats[index]
  const isLast = index === lesson.beats.length - 1
  const primaryLabel = isLast ? 'Finish' : (PRIMARY_ACTION[beat.beatId] ?? 'Continue')

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
          <PhaseRail beatId={beat.beatId} />
        </div>
        <span className="streak" aria-label="Daily streak">
          0
        </span>
      </header>

      <section className="prompt">
        {!beat.required && <p className="prompt__kicker">Extension</p>}
        <p className="prompt__text">{beat.prompt}</p>
      </section>

      <main className="region">
        <BeatInteraction interaction={beat.interaction} />
      </main>

      <footer className="actionbar">
        {done && <p className="done-note">Lesson complete ✓</p>}
        <button
          type="button"
          className="btn btn--primary"
          onClick={advance}
          disabled={done}
        >
          {primaryLabel}
        </button>
      </footer>
    </div>
  )
}
