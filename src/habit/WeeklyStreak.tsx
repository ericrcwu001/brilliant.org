// Weekly streak tracker for the Ergo momentum band. Renders a large tabular
// streak count, "day streak" label, and a 7-dot Mon–Sun rail. Since only
// `count` + `lastActiveDate` are available (no per-day history), the trailing
// min(count, 7) days ending at the last active day are approximated as active.

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

function todayLocalISO(): string {
  const d = new Date()
  const p = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// Returns a 7-element array (Mon=0 … Sun=6) indicating which dots are filled.
// Fills a contiguous trailing run of min(count, 7) days ending at the last
// active weekday. If lastActiveDate equals today, today's dot is included;
// otherwise the run ends at yesterday (streak still live, not yet practised).
function getActiveDots(count: number, lastActiveDate: string | null): boolean[] {
  const dots: boolean[] = Array(7).fill(false)
  if (count <= 0) return dots

  const today = new Date()
  const todayISO = todayLocalISO()
  // JS: 0=Sun, 1=Mon … 6=Sat → Mon=0 scale: (getDay() + 6) % 7
  const todayDow = (today.getDay() + 6) % 7

  const refDow = lastActiveDate === todayISO
    ? todayDow
    : (todayDow + 6) % 7 // yesterday in Mon=0 scale

  const activeDays = Math.min(count, 7)
  for (let i = 0; i < activeDays; i++) {
    dots[(refDow - i + 7) % 7] = true
  }
  return dots
}

export function WeeklyStreak({
  count,
  lastActiveDate,
  compact = false,
}: {
  count: number
  lastActiveDate: string | null
  compact?: boolean
}) {
  const dots = getActiveDots(count, lastActiveDate)

  return (
    <div
      className={`ergo-streak${compact ? ' ergo-streak--compact' : ''}`}
      aria-label={`${count}-day streak`}
    >
      <div className="ergo-streak__header" aria-hidden="true">
        <span className="ergo-streak__number">{count}</span>
        <span className="ergo-streak__label">day streak</span>
      </div>

      <div className="ergo-streak__dots" aria-hidden="true">
        <div className="ergo-streak__day-labels">
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="ergo-streak__day-label">
              {label}
            </span>
          ))}
        </div>
        <div className="ergo-streak__day-dots">
          {dots.map((filled, i) => (
            <span
              key={i}
              className={`ergo-streak__dot${filled ? ' ergo-streak__dot--filled' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
