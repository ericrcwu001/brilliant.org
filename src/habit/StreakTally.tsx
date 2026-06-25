// Pen tally-stroke streak indicator (docs/ui_design_system.md "Streak"): tally
// marks plus a label, never a flame, to stay inside the notebook identity. Used
// at display scale in the course-path habit panel and compact in the lesson top
// bar. Presentational only — the count comes from the Function-owned streak doc.

// Marks are rendered as an inline SVG so the final stroke can draw itself in
// with a CSS stroke-dashoffset animation on increment. Groups of 5 use the
// classic tally diagonal (4 verticals + 1 slash). Counts > 10 fall back to the
// ×N text form so the chip never overflows; 0 shows an em dash.

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lesson/useReducedMotion'

// SVG layout constants (viewBox units)
const MH = 12  // mark height
const MG = 5   // gap between verticals within a group
const GG = 10  // gap between groups

interface TallyMark {
  x1: number
  y1: number
  x2: number
  y2: number
}

function buildMarks(count: number): { marks: TallyMark[]; vbWidth: number } {
  const marks: TallyMark[] = []
  let gx = 0
  let g = 0
  for (let i = 1; i <= count; i++) {
    const p = (i - 1) % 5
    if (p < 4) {
      const x = gx + p * MG
      marks.push({ x1: x, y1: 0, x2: x, y2: MH })
    } else {
      // diagonal slash crosses all 4 verticals in the group
      marks.push({ x1: gx, y1: MH + 1, x2: gx + 4 * MG + 2, y2: -1 })
      g++
      gx = g * (4 * MG + GG)
    }
  }
  const last = marks[marks.length - 1]
  const vbWidth = last ? Math.ceil(Math.max(last.x1, last.x2) + 2) : 0
  return { marks, vbWidth }
}

export function StreakTally({
  count,
  compact = false,
}: {
  count: number
  compact?: boolean
}) {
  const reduced = useReducedMotion()

  // freshKey increments only on count increase → remounts the last mark element
  // so the CSS stroke-on animation restarts. Never fires on first render (key=0).
  const [freshKey, setFreshKey] = useState(0)
  const prevCountRef = useRef(count)
  useEffect(() => {
    if (count > prevCountRef.current) {
      setFreshKey((k) => k + 1)
    }
    prevCountRef.current = count
  }, [count])

  const base = `streaktally${compact ? ' streaktally--compact' : ''}`

  // Zero-day: em dash
  if (count <= 0) {
    return (
      <span className={base} aria-label={`${count}-day streak`}>
        <span className="streaktally__marks" aria-hidden="true">—</span>
        <span className="streaktally__label">{count}-day streak</span>
      </span>
    )
  }

  // Large counts: ×N text so the chip never overflows
  if (count > 10) {
    return (
      <span className={base} aria-label={`${count}-day streak`}>
        <span className="streaktally__marks mono" aria-hidden="true">×{count}</span>
        <span className="streaktally__label">{count}-day streak</span>
      </span>
    )
  }

  // 1–10: inline SVG tally marks
  const { marks, vbWidth } = buildMarks(count)
  const vbH = MH + 4  // viewBox spans y=-2 to y=MH+2 (accommodates diagonal ends)
  // Width in em so the SVG scales with the surrounding font-size context
  const emWidth = vbWidth > 0 ? (vbWidth / vbH).toFixed(2) : '0'

  return (
    <span className={base} aria-label={`${count}-day streak`}>
      <svg
        className="streaktally__marks"
        viewBox={`0 -2 ${vbWidth} ${vbH}`}
        style={{ display: 'block', height: '1em', width: `${emWidth}em` }}
        aria-hidden="true"
      >
        {marks.map((m, i) => {
          const isLast = i === marks.length - 1
          // Animate only the newest mark (freshKey > 0 guards first render)
          // and only when reduced motion is off (CSS backstop covers the rest).
          const animate = isLast && !reduced && freshKey > 0
          return (
            <line
              key={isLast ? freshKey : i}
              x1={m.x1}
              y1={m.y1}
              x2={m.x2}
              y2={m.y2}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              {...(animate
                ? {
                    pathLength: 1,
                    strokeDasharray: '1',
                    className: 'streaktally__mark--fresh',
                  }
                : {})}
            />
          )
        })}
      </svg>
      <span className="streaktally__label">{count}-day streak</span>
    </span>
  )
}
