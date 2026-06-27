import { describe, it, expect } from 'vitest'
import lessonFixture from '../../fixtures/lesson-pattern-hitting-times.json'
import { LessonSchema, type Beat } from '../content/schema'
import { isRetrievalRep } from './retrievalRep'

const lesson = LessonSchema.parse(lessonFixture)
const beats = lesson.beats as Beat[]
const byId = (id: string): Beat => {
  const b = beats.find((x) => x.beatId === id)
  if (!b) throw new Error(`fixture beat not found: ${id}`)
  return b
}

// Real beats from the flagship fixture (mirrors mastery.test.ts): a masteryChallenge,
// a graded equationTiles, the plain opening-bet prediction, and teaching beats.
const masteryChallenge = byId('mastery-challenge') // masteryChallenge
const equationTiles = byId('equation-tiles') // graded, non-mastery
const openBet = byId('open-bet') // plain prediction (no gate — exempt opening bet)
const primer = byId('primer-half') // teaching primer
const simulate = byId('simulate') // coinSim teaching beat
const recap = byId('recap') // recap teaching beat

// A which-method gate (spec-13): the opening-bet prediction with a synthesized
// `gate` block. Fixtures carry no gate until spec-13 backfills, so we add it here
// by spreading the real prediction beat (README §4.5 detects gate BY STRUCTURE).
const gatePrediction: Beat = {
  ...openBet,
  interaction: {
    ...openBet.interaction,
    gate: {
      kind: 'which-method',
      correct: 'symmetry',
      optionMethods: ['symmetry', 'conditioning'],
    },
  },
} as Beat

describe('isRetrievalRep (README §4 Foundation D / spec-03)', () => {
  it('1. masteryChallenge is always a rep (empty ctx and source:lesson)', () => {
    expect(isRetrievalRep(masteryChallenge)).toBe(true)
    expect(isRetrievalRep(masteryChallenge, { source: 'lesson' })).toBe(true)
  })

  it('2. a review-surfaced graded beat is a rep', () => {
    expect(isRetrievalRep(equationTiles, { source: 'review' })).toBe(true)
  })

  it('3. a which-method gate prediction is a rep by structure (no ctx.role needed)', () => {
    expect(isRetrievalRep(gatePrediction)).toBe(true)
    // Detection must not depend on a threaded role/source flag.
    expect(isRetrievalRep(gatePrediction, {})).toBe(true)
  })

  it('4. a plain prediction (the exempt opening bet) is NOT a rep', () => {
    expect(isRetrievalRep(openBet)).toBe(false)
    expect(isRetrievalRep(openBet, { source: 'lesson' })).toBe(false)
  })

  it('5. teaching / sim / recap first-pass beats are NOT reps', () => {
    expect(isRetrievalRep(primer)).toBe(false)
    expect(isRetrievalRep(simulate)).toBe(false)
    expect(isRetrievalRep(recap)).toBe(false)
  })

  it('6. fail-closed default: a non-mastery beat with no ctx is false', () => {
    expect(isRetrievalRep(equationTiles)).toBe(false)
  })

  it('7. review surfacing overrides: even a teaching beat with source:review is a rep', () => {
    // The queue only re-asks graded problems, but the predicate's contract is
    // "review surfacing ⇒ rep" — ctx.source==='review' wins over beat type.
    expect(isRetrievalRep(primer, { source: 'review' })).toBe(true)
  })
})
