// Confidence capture on checkpoint beats (spec-02 / D6). One-tap, 4 buckets,
// stored as a SELF-REPORTED subjective probability in [0.5,1.0] (NOT a
// chance-adjusted floor — today's checkpoint is a type-in, chance≈0). spec-12
// scores Brier against the binary outcome but must NOT read 0.5 as chance.
// Track-aware suppression is the caller's job (the player knows the
// track) — this component is presentational.

// Exported for spec-12 (calibration) to import the bucket→number map rather than
// hard-code it. Co-located with the component it drives, per the MathText pattern.
// eslint-disable-next-line react-refresh/only-export-components
export const CONFIDENCE_SCALE = [
  { label: 'Guessing', value: 0.5 },
  { label: 'Shaky', value: 0.7 },
  { label: 'Fairly sure', value: 0.85 },
  { label: 'Certain', value: 1.0 },
] as const

export function ConfidenceRating({
  value,
  onSelect,
  question = 'How sure are you?',
}: {
  value?: number
  onSelect: (v: number) => void
  question?: string
}) {
  return (
    <div className="confidence" role="group" aria-label={question}>
      <p className="confidence__q">{question}</p>
      <div className="chips" role="radiogroup" aria-label={question}>
        {CONFIDENCE_SCALE.map((b) => (
          <button
            type="button"
            role="radio"
            aria-checked={value === b.value}
            key={b.value}
            className={`chip chip--select${value === b.value ? ' chip--on' : ''}`}
            onClick={() => onSelect(b.value)}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}
