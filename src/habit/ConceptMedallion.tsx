// Circular concept medallion for the Ergo momentum band. A 44px circle with a
// 2.5px ring and tint fill keyed to a chapter hue (via hueVar CSS custom
// property name, e.g. 'ch2'). Earned = full color; locked = muted grey + lock
// overlay; earning = one-time quiet fade-in (respects reduced-motion via CSS).
// Do not confuse with the existing MilestoneSeal (notebook-era component).

import type { MilestoneMeta } from './milestones'

export function ConceptMedallion({
  meta,
  earned,
  earning = false,
  hueVar,
}: {
  meta: MilestoneMeta
  earned: boolean
  earning?: boolean
  hueVar?: string
}) {
  const hue = hueVar ?? 'ergo-brand'
  const style = {
    '--medallion-hue': `var(--${hue})`,
    '--medallion-tint': `var(--${hue}-tint)`,
  } as React.CSSProperties

  const stateClass = earned
    ? `ergo-medallion--earned${earning ? ' ergo-medallion--earning' : ''}`
    : 'ergo-medallion--locked'

  return (
    <div
      className={`ergo-medallion ${stateClass}`}
      style={style}
      role="listitem"
      aria-label={`${meta.title}${earned ? ', earned' : ', locked'}`}
      title={meta.title}
    >
      <span className="ergo-medallion__glyph" aria-hidden="true">
        {meta.glyph}
      </span>
      {!earned && (
        <svg
          className="ergo-medallion__lock"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <rect x="2" y="7" width="10" height="7" rx="1.5" fill="var(--ergo-ink-3)" />
          <path
            d="M4 7V5.5a3 3 0 0 1 6 0V7"
            stroke="var(--ergo-ink-3)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      )}
    </div>
  )
}
