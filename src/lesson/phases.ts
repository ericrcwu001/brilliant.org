// Per-beat progress rail mapping. Each lesson has a phase config: one rail
// segment per on-rail beat, color-grouped by phase tint (Bet, Explore, Model,
// Prove). Off-rail beats (the bias-sandbox extension + the Track-A inclusivity
// beats) are not segments; each maps to the rail beat it follows so the rail
// still shows the right amount of progress while the learner is off-rail.
//
// The flagship is the default config; per-lesson configs (e.g. the L0 on-ramp)
// are looked up by lessonId so non-flagship lessons get a correct rail instead
// of the flagship's (HANDOFF blocker #1).

export type PhaseId = 'Bet' | 'Explore' | 'Model' | 'Prove'

type PhaseGroup = { id: PhaseId; beatIds: string[] }
type PhaseConfig = {
  phases: ReadonlyArray<PhaseGroup>
  offRailAfter: Record<string, string>
}

// Flagship L1. Phase mapping: Bet = open-bet/pattern-pick, Explore = simulate,
// Model = failure-edge…guided-solve, Prove = theory-vs-sim/overlap/recap. The
// Extension bias-sandbox is off-rail; so are the Track-A inclusivity beats
// (primers, name-the-overlap, the EV grounding) — additive, no new segments.
const FLAGSHIP: PhaseConfig = {
  phases: [
    { id: 'Bet', beatIds: ['open-bet', 'pattern-pick'] },
    { id: 'Explore', beatIds: ['simulate'] },
    {
      id: 'Model',
      beatIds: ['failure-edge', 'equation-tiles', 'refine-prediction', 'guided-solve'],
    },
    { id: 'Prove', beatIds: ['theory-vs-sim', 'overlap', 'recap'] },
  ],
  offRailAfter: {
    'bias-sandbox': 'overlap',
    'primer-half': 'pattern-pick',
    'primer-state': 'pattern-pick',
    'name-the-overlap': 'failure-edge',
    'ground-ev': 'equation-tiles',
  },
}

// L0 on-ramp (lesson-first-heads): a short first-success lesson. The two primers
// (½ refresher, EV grounding) are off-rail scaffolds.
const FIRST_HEADS: PhaseConfig = {
  phases: [
    { id: 'Bet', beatIds: ['l0-bet'] },
    { id: 'Explore', beatIds: ['l0-flip'] },
    { id: 'Prove', beatIds: ['l0-count'] },
  ],
  offRailAfter: {
    'l0-half': 'l0-bet',
    'l0-ground': 'l0-flip',
  },
}

const LESSON_PHASES: Record<string, PhaseConfig> = {
  'lesson-pattern-hitting-times': FLAGSHIP,
  'lesson-first-heads': FIRST_HEADS,
}

function configFor(lessonId?: string): PhaseConfig {
  return (lessonId && LESSON_PHASES[lessonId]) || FLAGSHIP
}

// Back-compat flagship exports (used by phases.test.ts + biasChipState).
export const PHASES = FLAGSHIP.phases
export const OFF_RAIL_AFTER = FLAGSHIP.offRailAfter
// Rail segments, in lesson order — the flatten of the flagship phases.
export const RAIL_BEAT_IDS: string[] = FLAGSHIP.phases.flatMap((p) => p.beatIds)

export type SegmentState = 'complete' | 'current' | 'upcoming'

export type RailSegment = {
  beatId: string
  phase: PhaseId
  state: SegmentState
}

export function getRail(currentBeatId: string, lessonId?: string): RailSegment[] {
  const cfg = configFor(lessonId)
  const railBeatIds = cfg.phases.flatMap((p) => p.beatIds)
  const phaseOf = (beatId: string): PhaseId => {
    const phase = cfg.phases.find((p) => p.beatIds.includes(beatId))
    if (!phase) throw new Error(`Beat "${beatId}" is not in any phase`)
    return phase.id
  }

  const railIndex = railBeatIds.indexOf(currentBeatId)
  // On-rail: one segment is current. Off-rail: no current segment; everything
  // through the followed beat is complete.
  const onRail = railIndex >= 0
  const completeThrough = onRail
    ? railIndex - 1
    : railBeatIds.indexOf(cfg.offRailAfter[currentBeatId] ?? '')

  return railBeatIds.map((beatId, i) => {
    let state: SegmentState
    if (onRail && i === railIndex) state = 'current'
    else if (i <= completeThrough) state = 'complete'
    else state = 'upcoming'
    return { beatId, phase: phaseOf(beatId), state }
  })
}

export type BiasChipState = 'hidden' | 'available' | 'active'

// The bias sandbox is an extension of the flagship's proof section; surface its
// off-rail chip once the learner reaches the Prove phase, and mark it active
// while the learner is on the bias-sandbox beat itself.
export function biasChipState(currentBeatId: string): BiasChipState {
  if (currentBeatId === 'bias-sandbox') return 'active'
  const proveBeats = FLAGSHIP.phases.find((p) => p.id === 'Prove')!.beatIds
  return proveBeats.includes(currentBeatId) ? 'available' : 'hidden'
}
