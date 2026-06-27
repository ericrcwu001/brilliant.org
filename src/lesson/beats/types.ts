import type { Automaton } from '../../engine/types'
import type { Beat } from '../../content/schema'
import type { MilestoneMeta } from '../../habit/milestones'

// Lesson-level values that survive beat navigation and feed the recap +
// downstream beats (the slider marker, the chart, the recap summary). Held by
// the LessonPlayer; beats read and patch it. The whole object is mirrored into
// the persistence snapshot (Phase 15) so a mid-lesson refresh restores it.
//
// `equationTiles` holds the equation-builder slot placements (per LHS row, one
// token-or-null per slot) so an in-progress build survives navigation + refresh.
export type LessonState = {
  initialPrediction?: string
  finalPrediction?: number
  theoreticalValue?: number
  empiricalMean?: number
  simRuns?: number
  equationTiles?: Record<string, (string | null)[]>
}

export type BeatProps = {
  beat: Beat
  lessonId: string // for analytics events (Phase 19)
  pattern: string // primary engine pattern for the lesson, e.g. "HH"
  patternOptions: string[] // the compare set, e.g. ["HH", "HT"]
  automaton: Automaton
  reducedMotion: boolean
  // Render density for this beat, resolved by the LessonPlayer from the learner's
  // track + the beat's `density` flag (L1 §3.3). 'split' = Track-A segmented /
  // scaffolded rendering (CoinSim micro-steps, EquationTiles dyna-link graph +
  // staged reveal); 'merged' (default) = today's single-beat rendering.
  density: 'split' | 'merged'
  isLast: boolean
  onAdvance: () => void
  reportNeedsReview: () => void
  needsReview: boolean
  lessonState: LessonState
  setLessonState: (patch: Partial<LessonState>) => void
  // Persistence (Phase 15): the restored hint level for this beat, and a
  // callback the hint ladder fires whenever the level changes so the
  // LessonPlayer can persist `hintLevelByBeat`. Undefined on the dev route
  // (no persistence) — beats simply start at level 0.
  initialHintLevel?: number
  onHintLevelChange?: (level: number) => void
  // Adaptive override (build-brief §4.10c). The LessonPlayer driver supplies
  // these when a learner struggles so a capped beat never dead-ends:
  // `hintCapOverride` lifts useHintLadder's cap at runtime (reveal becomes
  // reachable); `assist` re-prefills a faded equationTiles row on each `nonce`
  // bump — filling every still-open slot except the last term, preserving the
  // learner's already-correct tiles. Inert at nonce 0.
  hintCapOverride?: 1 | 2 | 3
  assist?: { prefillToLastTerm: boolean; nonce: number }
  // Confidence capture (spec-02 / D6). Present only when the active track sees
  // confidence (quant-intensity gate); when `showConfidence` is false/undefined
  // the beat renders no rating. The beat calls `onConfidence(v)` once the learner
  // has answered the checkpoint; `confidenceValue` is the restored choice.
  showConfidence?: boolean
  confidenceValue?: number
  onConfidence?: (value: number) => void
  // Label-stripping presentation mode (spec-13 / D12, §3.3). When true the
  // solving surface hides method-revealing chrome (lesson title + the player's
  // beat.prompt section) so a which-method gate measures recognition of deep
  // structure, not surface recall. Supplied by the player/queue driver; the
  // actual suppression happens in the PLAYER (it owns the title + prompt chrome).
  // A gate beat is ALWAYS title-stripped locally even when this is false. Default
  // (absent) ⇒ today's chrome. The spec-20 queue sets it surface-wide.
  labelStripped?: boolean
  // Habit loop (Phase 17): the milestone this lesson awards + whether the lesson
  // is complete, so the recap can press the milestone stamp on the recap flow.
  milestone: MilestoneMeta | null
  lessonComplete: boolean
}
