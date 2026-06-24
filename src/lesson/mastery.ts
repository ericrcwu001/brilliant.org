// Per-lesson mastery signal (L1 §9). Pure + dependency-free so it is unit-tested
// in the node Vitest env; the LessonPlayer wires it to the persisted hint
// high-water mark. `mastered` is true iff the required graded beats were
// first-try-correct with no hint ever shown (the high-water mark stayed 0).
// Non-blocking: it never gates unlock — it only sets derived.mastered + the UI.

import type { Beat } from '../content/schema'

// Beat types that grade an answer through the hint ladder.
const GRADED_BEAT_TYPES = new Set(['stateTap', 'equationTiles', 'mcq'])

export function gradedRequiredBeatIds(beats: Beat[]): string[] {
  return beats
    .filter((b) => b.required && GRADED_BEAT_TYPES.has(b.interaction.type))
    .map((b) => b.beatId)
}

export function computeMastered(
  beats: Beat[],
  maxHintLevelByBeat: Record<string, number>,
): boolean {
  const ids = gradedRequiredBeatIds(beats)
  return ids.length > 0 && ids.every((id) => (maxHintLevelByBeat[id] ?? 0) === 0)
}

// Update the hint high-water mark for a beat, keeping the max ever reached.
// (The visible hint level resets to 0 on a correct submit, so only the max
// records whether a beat was ever a struggle.)
export function bumpMaxHintLevel(
  map: Record<string, number>,
  beatId: string,
  level: number,
): Record<string, number> {
  const cur = map[beatId] ?? 0
  return level > cur ? { ...map, [beatId]: level } : map
}
