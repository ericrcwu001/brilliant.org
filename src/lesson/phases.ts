// Per-beat progress rail. The rail derives directly from the lesson's visible
// beat sequence (the data LessonPlayer already owns): one segment per beat,
// filled by position. This replaces the old hardcoded per-lesson phase configs,
// which only covered 7 of 64 lessons and left every other lesson's rail static.
//
// biasChipState stays here: the flagship's bias-sandbox extension surfaces an
// off-rail chip once the learner reaches the Prove section.

export type SegmentState = 'complete' | 'current' | 'upcoming'

export type RailSegment = {
  beatId: string
  state: SegmentState
}

// One segment per beat, in lesson order. Everything before the current index is
// complete, the current index is current, everything after is upcoming.
export function railSegments(
  beatIds: string[],
  currentIndex: number,
): RailSegment[] {
  return beatIds.map((beatId, i) => ({
    beatId,
    state:
      i < currentIndex ? 'complete' : i === currentIndex ? 'current' : 'upcoming',
  }))
}

export type BiasChipState = 'hidden' | 'available' | 'active'

// The flagship's Prove-phase beats: the bias sandbox is an extension of the
// flagship proof section, so its off-rail chip becomes available here.
const FLAGSHIP_PROVE_BEATS = [
  'theory-vs-sim',
  'overlap',
  'mastery-challenge',
  'recap',
]

// Surface the off-rail bias chip once the learner reaches the Prove phase, and
// mark it active while the learner is on the bias-sandbox beat itself.
export function biasChipState(currentBeatId: string): BiasChipState {
  if (currentBeatId === 'bias-sandbox') return 'active'
  return FLAGSHIP_PROVE_BEATS.includes(currentBeatId) ? 'available' : 'hidden'
}
