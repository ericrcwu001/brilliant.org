// Per-beat progress rail mapping for the flagship lesson.
// One rail segment per beat; beats are color-grouped by phase tint
// (Bet, Explore, Model, Prove) with no separate phase label text.
// Phase mapping: Bet = beats 1–2, Explore = beat 3, Model = beats 4–7,
// Prove = beats 8–9 + 11. The Extension bias-sandbox (beat 10) is off-rail and
// never appears as a segment (see docs/ui_design_system.md "Top Bar").

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

// Rail segments, in lesson order — the flatten of PHASES, which deliberately
// omits the off-rail bias-sandbox beat.
export const RAIL_BEAT_IDS: string[] = PHASES.flatMap((p) => p.beatIds)

// Off-rail beats are not segments. Each maps to the rail beat it follows so the
// rail still shows the right amount of progress while the learner is off-rail.
const OFF_RAIL_AFTER: Record<string, string> = { 'bias-sandbox': 'overlap' }

export type SegmentState = 'complete' | 'current' | 'upcoming'

export type RailSegment = {
  beatId: string
  phase: PhaseId
  state: SegmentState
}

function phaseOf(beatId: string): PhaseId {
  const phase = PHASES.find((p) => p.beatIds.includes(beatId))
  if (!phase) throw new Error(`Beat "${beatId}" is not in any phase`)
  return phase.id
}

export function getRail(currentBeatId: string): RailSegment[] {
  const railIndex = RAIL_BEAT_IDS.indexOf(currentBeatId)
  // On-rail: one segment is current. Off-rail: no current segment; everything
  // through the followed beat is complete.
  const onRail = railIndex >= 0
  const completeThrough = onRail
    ? railIndex - 1
    : RAIL_BEAT_IDS.indexOf(OFF_RAIL_AFTER[currentBeatId] ?? '')

  return RAIL_BEAT_IDS.map((beatId, i) => {
    let state: SegmentState
    if (onRail && i === railIndex) state = 'current'
    else if (i <= completeThrough) state = 'complete'
    else state = 'upcoming'
    return { beatId, phase: phaseOf(beatId), state }
  })
}

export type BiasChipState = 'hidden' | 'available' | 'active'

// The bias sandbox is an extension of the proof section; surface its off-rail
// chip once the learner reaches the Prove phase, and mark it active while the
// learner is on the bias-sandbox beat itself.
export function biasChipState(currentBeatId: string): BiasChipState {
  if (currentBeatId === 'bias-sandbox') return 'active'
  const proveBeats = PHASES.find((p) => p.id === 'Prove')!.beatIds
  return proveBeats.includes(currentBeatId) ? 'available' : 'hidden'
}
