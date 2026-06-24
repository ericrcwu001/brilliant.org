// Pen tally-stroke streak indicator (docs/ui_design_system.md "Streak"): tally
// marks plus a label, never a flame, to stay inside the notebook identity. Used
// at display scale in the course-path habit panel and compact in the lesson top
// bar. Presentational only — the count comes from the Function-owned streak doc.

// Vertical strokes grouped in fives (a gap marks each fifth, the notebook tally
// cue); large counts collapse to a numeric form so the chip never overflows.
function tallyMarks(count: number): string {
  if (count <= 0) return '\u2014' // em dash for a zero-day streak
  if (count > 10) return `\u00d7${count}` // ×N
  let out = ''
  for (let i = 1; i <= count; i++) {
    out += '\u2502' // light vertical stroke
    if (i % 5 === 0 && i < count) out += ' '
  }
  return out
}

export function StreakTally({
  count,
  compact = false,
}: {
  count: number
  compact?: boolean
}) {
  return (
    <span
      className={`streaktally${compact ? ' streaktally--compact' : ''}`}
      aria-label={`${count}-day streak`}
    >
      <span className="streaktally__marks" aria-hidden="true">
        {tallyMarks(count)}
      </span>
      <span className="streaktally__label">{count}-day streak</span>
    </span>
  )
}
