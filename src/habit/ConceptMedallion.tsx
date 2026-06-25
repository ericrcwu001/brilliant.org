// Circular concept medallion for the Ergo momentum band. A 44px circle with a
// 2.5px ring and tint fill keyed to a chapter hue (via hueVar CSS custom
// property name, e.g. 'ch2'). Earned = full color; locked = muted grey + lock
// overlay; earning = one-time quiet fade-in (respects reduced-motion via CSS).
// Do not confuse with the existing MilestoneSeal (notebook-era component).

import type { MilestoneMeta } from './milestones'
import { MilestoneIcon } from './MilestoneIcon'

// Hover tooltip + screen-reader copy per tier (gallery medallions). Gold = aced
// (derived.mastered); silver = earned but not aced; locked = not yet earned.
const TIER_DESCRIPTION: Record<'gold' | 'silver' | 'locked', string> = {
  gold: 'Gold: perfect mastery',
  silver: 'Silver: completed with hints',
  locked: 'Locked: not yet earned',
}

export function ConceptMedallion({
  meta,
  earned,
  earning = false,
  mastered = false,
  hueVar,
  size = 'sm',
}: {
  meta: MilestoneMeta
  earned: boolean
  earning?: boolean
  mastered?: boolean
  hueVar?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const hue = hueVar ?? 'ergo-brand'
  const style = {
    '--medallion-hue': `var(--${hue})`,
    '--medallion-tint': `var(--${hue}-tint)`,
  } as React.CSSProperties

  // Gold/silver tier ring — gallery only (the lg celebration medallion is left
  // unchanged). Gold = aced; silver = earned but not aced.
  const tierClass =
    earned && size !== 'lg'
      ? mastered
        ? ' ergo-medallion--gold'
        : ' ergo-medallion--silver'
      : ''
  const stateClass = earned
    ? `ergo-medallion--earned${earning ? ' ergo-medallion--earning' : ''}${tierClass}`
    : 'ergo-medallion--locked'
  const capstoneClass =
    meta.id === 'six-lessons-complete' ? ' ergo-medallion--capstone' : ''

  // Tier shown on hover via a custom popup (.ergo-medallion__tip) and mirrored in
  // aria-label for screen readers. Gallery only; the lg celebration medallion has
  // no tier popup.
  const tier = earned ? (mastered ? 'gold' : 'silver') : 'locked'
  const tierDesc = size !== 'lg' ? TIER_DESCRIPTION[tier] : null
  const ariaLabel = tierDesc
    ? `${meta.title}, ${tierDesc}`
    : `${meta.title}${earned ? ', earned' : ', locked'}`

  return (
    <div
      className={`ergo-medallion ergo-medallion--${size} ${stateClass}${capstoneClass}`}
      style={style}
      role="listitem"
      aria-label={ariaLabel}
    >
      <MilestoneIcon id={meta.id} glyph={meta.glyph} />
      {!earned && (
        <svg
          className="ergo-medallion__lock"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="7"
            width="10"
            height="7"
            rx="1.5"
            fill="var(--ergo-ink-3)"
          />
          <path
            d="M4 7V5.5a3 3 0 0 1 6 0V7"
            stroke="var(--ergo-ink-3)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      )}
      {tierDesc && (
        <span
          className="ergo-medallion__tip"
          data-tier={tier}
          aria-hidden="true"
        >
          <span className="ergo-medallion__tip-name">{meta.title}</span>
          <span className="ergo-medallion__tip-tier">{tierDesc}</span>
        </span>
      )}
    </div>
  )
}
