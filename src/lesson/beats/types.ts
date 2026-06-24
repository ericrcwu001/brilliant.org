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
  // Habit loop (Phase 17): the milestone this lesson awards + whether the lesson
  // is complete, so the recap can press the milestone stamp on the recap flow.
  milestone: MilestoneMeta | null
  lessonComplete: boolean
}
