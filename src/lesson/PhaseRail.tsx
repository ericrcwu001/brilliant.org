import { useEffect, useRef } from 'react'
import { railSegments } from './phases'

export function PhaseRail({
  beats,
  index,
  reducedMotion,
}: {
  beats: { beatId: string }[]
  index: number
  reducedMotion?: boolean
}) {
  const segments = railSegments(
    beats.map((b) => b.beatId),
    index,
  )
  const currentRef = useRef<HTMLLIElement>(null)

  // Keep the current beat in view as the learner advances.
  useEffect(() => {
    currentRef.current?.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }, [index, reducedMotion])

  return (
    <ol className="rail" aria-label="Lesson progress">
      {segments.map((seg) => (
        <li
          key={seg.beatId}
          ref={seg.state === 'current' ? currentRef : undefined}
          className={`rail__seg rail__seg--${seg.state}`}
          aria-current={seg.state === 'current' ? 'step' : undefined}
        >
          <span className="rail__bar" />
        </li>
      ))}
    </ol>
  )
}
