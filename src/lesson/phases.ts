// 4-segment phase rail mapping for the flagship lesson.
// Bet = beats 1–2, Explore = beat 3, Model = beats 4–7, Prove = beats 8–9 + 11.
// The Extension bias-sandbox (beat 10) is off-rail and never counts toward a
// segment total (see docs/ui_design_system.md "Top Bar").

export type PhaseId = 'Bet' | 'Explore' | 'Model' | 'Prove'

export const PHASES: ReadonlyArray<{ id: PhaseId; beatIds: string[] }> = [
  { id: 'Bet', beatIds: ['open-bet', 'pattern-pick'] },
  { id: 'Explore', beatIds: ['simulate'] },
  {
    id: 'Model',
    beatIds: ['failure-edge', 'equation-tiles', 'refine-prediction', 'guided-solve'],
  },
  { id: 'Prove', beatIds: ['theory-vs-sim', 'overlap', 'recap'] },
]

// Off-rail beats map to the phase whose context surrounds them, but render
// without a step counter.
const OFF_RAIL_PHASE: Record<string, number> = { 'bias-sandbox': 3 }

export type PhaseProgress = {
  currentPhaseIndex: number
  step: number | null // 1-based step within the current phase; null when off-rail
  steps: number
  offRail: boolean
}

export function getPhaseProgress(beatId: string): PhaseProgress {
  for (let i = 0; i < PHASES.length; i++) {
    const idx = PHASES[i].beatIds.indexOf(beatId)
    if (idx >= 0) {
      return {
        currentPhaseIndex: i,
        step: idx + 1,
        steps: PHASES[i].beatIds.length,
        offRail: false,
      }
    }
  }
  const phaseIndex = OFF_RAIL_PHASE[beatId] ?? PHASES.length - 1
  return {
    currentPhaseIndex: phaseIndex,
    step: null,
    steps: PHASES[phaseIndex].beatIds.length,
    offRail: true,
  }
}
