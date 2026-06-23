// Shared per-beat layout: the interaction region, the inline feedback strip,
// and the sticky action bar with one primary action plus an optional quiet
// secondary (docs/ui_design_system.md "Flagship Lesson Layout" + "Sticky Action
// Bar"). Each beat view composes this so the shell markup stays consistent.

import type { ReactNode } from 'react'
import { FeedbackStrip, type FeedbackView } from './FeedbackStrip'

export type PrimaryAction = {
  label: string
  enabled: boolean
  onClick: () => void
}

export type SecondaryAction = {
  label: string
  onClick: () => void
}

export function BeatShell({
  children,
  feedback,
  onTryAgain,
  primary,
  secondary,
  tertiary,
}: {
  children: ReactNode
  feedback?: FeedbackView
  onTryAgain?: () => void
  primary: PrimaryAction
  secondary?: SecondaryAction
  // Optional second quiet action (rendered as a ghost beside `secondary`), used
  // when a beat offers two side actions plus the primary — e.g. the sim chart's
  // "Run again" + "Run 500 more" alongside "Continue".
  tertiary?: SecondaryAction
}) {
  return (
    <>
      <main className="region">{children}</main>
      {feedback && <FeedbackStrip view={feedback} onTryAgain={onTryAgain} />}
      <footer className="actionbar">
        {secondary && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={secondary.onClick}
          >
            {secondary.label}
          </button>
        )}
        {tertiary && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={tertiary.onClick}
          >
            {tertiary.label}
          </button>
        )}
        <button
          type="button"
          className="btn btn--primary"
          onClick={primary.onClick}
          disabled={!primary.enabled}
        >
          {primary.label}
        </button>
      </footer>
    </>
  )
}
