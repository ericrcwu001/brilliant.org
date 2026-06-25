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

  // 'note' is a neutral, ungraded acknowledgement (e.g. the open bet) — it uses
  // the base strip styling with no correct/wrong tint.
  const tone =
    view.kind === 'correct' ? 'correct' : view.kind === 'note' ? null : 'wrong'
  const label =
    view.kind === 'correct'
      ? 'Correct'
      : view.kind === 'note'
        ? (view.label ?? 'Noted')
        : view.revealed
          ? 'Answer'
          : `Hint ${view.level}`
  const icon = view.kind === 'correct' ? '✓' : view.kind === 'note' ? '•' : '!'

  return (
    <div
      className={`feedback${tone ? ` feedback--${tone}` : ''}`}
      role="status"
      aria-live="polite"
    >
      <p className="feedback__label">
        <span aria-hidden="true">{icon} </span>
        {label}
      </p>
      <p className="feedback__text">{view.text}</p>
      {view.kind === 'hint' && view.revealed && onTryAgain && (
        <button type="button" className="feedback__retry" onClick={onTryAgain}>
          Try again
        </button>
      )}
    </div>
  )
}
