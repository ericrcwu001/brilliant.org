// Stamped-seal milestone, not a badge (docs/ui_design_system.md "Milestones"):
// a circular ink-ring with a mono glyph. `earned` shows the full ink seal;
// otherwise a ghost (dashed ring, faded glyph) shows what the learner is working
// toward. Used in the course-path seal gallery and the recap milestone stamp.
//
// `earning` plays the one-time quiet ghost→inked fade on the first Home load
// after a new earn (Q11). When `onClick` is supplied the seal becomes a button
// (tap to expand title + status in the gallery, Q20); otherwise it is inert.
//
// `stamped` triggers the wax-seal ink-stamp animation (seal--stamped) — used
// on the completion takeover in LessonPlayer so the seal lands with impact.

import type { MilestoneMeta } from './milestones'

export function MilestoneSeal({
  meta,
  earned,
  earning = false,
  active = false,
  stamped = false,
  onClick,
}: {
  meta: MilestoneMeta
  earned: boolean
  earning?: boolean
  active?: boolean
  stamped?: boolean
  onClick?: () => void
}) {
  const className = `seal${earned ? ' seal--earned' : ' seal--ghost'}${
    earning ? ' seal--earning' : ''
  }${active ? ' seal--active' : ''}${stamped ? ' seal--stamped' : ''}`
  const inner = (
    <>
      <span className="seal__ring" aria-hidden="true">
        <span className="seal__glyph mono">{meta.glyph}</span>
      </span>
      <span className="seal__title">{meta.title}</span>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        className={`${className} seal--button`}
        onClick={onClick}
        aria-pressed={active}
        aria-label={`${meta.title}${earned ? ', earned' : ', locked'}`}
      >
        {inner}
      </button>
    )
  }

  return (
    <span className={className} title={meta.title}>
      {inner}
    </span>
  )
}
