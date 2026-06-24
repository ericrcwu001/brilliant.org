import { useEffect, useRef } from 'react'
import { getRail } from './phases'

export function PhaseRail({
  beatId,
  reducedMotion,
}: {
  beatId: string
  reducedMotion?: boolean
}) {
  const segments = getRail(beatId)
  const currentRef = useRef<HTMLLIElement>(null)

  // Keep the current beat in view as the learner advances.
  useEffect(() => {
    currentRef.current?.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }, [beatId, reducedMotion])

  return (
    <ol className="rail" aria-label="Lesson progress">
      {segments.map((seg) => (
        <li
          key={seg.beatId}
          ref={seg.state === 'current' ? currentRef : undefined}
          className={`rail__seg rail__seg--${seg.phase.toLowerCase()} rail__seg--${seg.state}`}
          aria-current={seg.state === 'current' ? 'step' : undefined}
        >
          <span className="rail__bar" />
        </li>
      ))}
    </ol>
  )
}
