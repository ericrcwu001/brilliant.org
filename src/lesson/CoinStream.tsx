// Left-to-right coin stream with the active prefix-state chip at the head
// (docs/ui_design_system.md beat 3). DOM-rendered so the flip/state summary is
// announced to screen readers via aria-live — the accessible equivalent of the
// canvas motion (docs/ui_design_system.md "Accessibility").

export type Flip = { on: 'H' | 'T'; key: string }

export function CoinStream({
  flips,
  stateLabel,
  announce,
}: {
  flips: Flip[]
  stateLabel: string
  announce: string
}) {
  return (
    <div className="coinstream">
      <div className="coinstream__row" aria-hidden="true">
        {flips.map((f, i) => (
          <span
            key={f.key}
            className={`coin coin--${f.on}${i === flips.length - 1 ? ' coin--latest' : ''}`}
          >
            {f.on}
          </span>
        ))}
        <span className="coinstream__chip" title="Active prefix state">
          {stateLabel}
        </span>
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">
        {announce}
      </p>
    </div>
  )
}
