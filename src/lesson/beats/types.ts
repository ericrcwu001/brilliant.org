import type { Automaton } from '../../engine/types'
import type { Beat } from '../../content/schema'

// Lesson-level values that survive beat navigation and feed the recap +
// downstream beats (the slider marker, the chart, the recap summary). Held by
// the LessonPlayer; beats read and patch it.
export type LessonState = {
  initialPrediction?: string
  finalPrediction?: number
  theoreticalValue?: number
  empiricalMean?: number
  simRuns?: number
}

export type BeatProps = {
  beat: Beat
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
}
