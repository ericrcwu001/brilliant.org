import { PHASES, getPhaseProgress } from './phases'

export function PhaseRail({ beatId }: { beatId: string }) {
  const { currentPhaseIndex, step, steps, offRail } = getPhaseProgress(beatId)

  return (
    <div className="rail" role="group" aria-label="Lesson progress">
      {PHASES.map((phase, i) => {
        const state =
          i < currentPhaseIndex
            ? 'complete'
            : i === currentPhaseIndex
              ? 'current'
              : 'upcoming'
        const showStep = state === 'current' && !offRail && step !== null
        const label = showStep ? `${phase.id} · ${step}/${steps}` : phase.id
        return (
          <div
            key={phase.id}
            className={`rail__seg rail__seg--${state}`}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <div className="rail__bar" />
            <span className="rail__label">{label}</span>
          </div>
        )
      })}
    </div>
  )
}
