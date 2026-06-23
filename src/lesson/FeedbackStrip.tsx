// Inline feedback strip rendered above the sticky action bar
// (docs/ui_design_system.md "Feedback Strip").

import type { FeedbackView } from './feedback'

export type { FeedbackView }

export function FeedbackStrip({
  view,
  onTryAgain,
}: {
  view: FeedbackView
  onTryAgain?: () => void
}) {
  if (view.kind === 'idle') return null

  const tone = view.kind === 'correct' ? 'correct' : 'wrong'
  const label =
    view.kind === 'correct'
      ? 'Correct'
      : view.revealed
        ? 'Answer'
        : `Hint ${view.level}`

  return (
    <div className={`feedback feedback--${tone}`} role="status" aria-live="polite">
      <p className="feedback__label">{label}</p>
      <p className="feedback__text">{view.text}</p>
      {view.kind === 'hint' && view.revealed && onTryAgain && (
        <button type="button" className="feedback__retry" onClick={onTryAgain}>
          Try again
        </button>
      )}
    </div>
  )
}
