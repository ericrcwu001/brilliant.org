import { describe, it, expect } from 'vitest'
import lessonFixture from '../../fixtures/lesson-pattern-hitting-times.json'
import { LessonSchema, type Beat } from '../content/schema'
import {
  bumpMaxHintLevel,
  computeMastered,
  gradedRequiredBeatIds,
  isGradedBeat,
  isCheckpointBeat,
} from './mastery'

const beat = (interaction: Beat['interaction']): Beat =>
  ({
    beatId: 'b',
    required: true,
    prompt: 'p',
    interaction,
    feedback: { correct: 'ok', hints: ['a', 'b', 'c'] },
  }) as Beat

const lesson = LessonSchema.parse(lessonFixture)
const beats = lesson.beats as Beat[]

describe('gradedRequiredBeatIds', () => {
  it('selects only the required graded beats (L1: failure-edge + equation-tiles + mastery-challenge)', () => {
    expect(gradedRequiredBeatIds(beats)).toEqual(['failure-edge', 'equation-tiles', 'mastery-challenge'])
  })
})

describe('computeMastered (L1 §9)', () => {
  it('is true when every graded beat was first-try-correct (high-water mark 0)', () => {
    expect(computeMastered(beats, {})).toBe(true)
    expect(
      computeMastered(beats, { 'failure-edge': 0, 'equation-tiles': 0 }),
    ).toBe(true)
  })

  it('is false when any graded beat ever needed a hint', () => {
    expect(computeMastered(beats, { 'failure-edge': 1 })).toBe(false)
    expect(computeMastered(beats, { 'equation-tiles': 3 })).toBe(false)
  })

  it('ignores non-graded beats (a hinted slider does not block mastery)', () => {
    expect(computeMastered(beats, { 'refine-prediction': 3 })).toBe(true)
  })

  it('is false when there are no graded beats', () => {
    expect(computeMastered([], {})).toBe(false)
  })
})

describe('bumpMaxHintLevel (hint high-water mark, L1 §3.4)', () => {
  it('keeps the maximum level ever reached per beat', () => {
    let m: Record<string, number> = {}
    m = bumpMaxHintLevel(m, 'b', 1)
    m = bumpMaxHintLevel(m, 'b', 2)
    expect(m.b).toBe(2)
    // A later reset to 0 (correct submit) must NOT lower the high-water mark.
    m = bumpMaxHintLevel(m, 'b', 0)
    expect(m.b).toBe(2)
  })

  it('returns the same reference when the level does not exceed the current max', () => {
    const m = { b: 2 }
    expect(bumpMaxHintLevel(m, 'b', 1)).toBe(m)
  })
})

describe('isGradedBeat (exported predicate the validator reuses, spec-00)', () => {
  it('is true for a masteryChallenge beat', () => {
    expect(
      isGradedBeat(
        beat({ type: 'masteryChallenge', fields: [{ id: 'x', label: 'x', accept: ['6'] }] }),
      ),
    ).toBe(true)
  })

  it('is false for a recap and a primer (ungraded teaching beats)', () => {
    expect(isGradedBeat(beat({ type: 'recap' }))).toBe(false)
    expect(isGradedBeat(beat({ type: 'primer', variant: 'half', body: 'x' }))).toBe(false)
  })

  it('is true for a prediction carrying interaction.gate (which-method gate, spec-13)', () => {
    expect(
      isGradedBeat(
        beat({
          type: 'prediction',
          options: ['a', 'b'],
          gate: { kind: 'which-method', correct: 'symmetry', optionMethods: ['symmetry', 'conditioning'] },
        } as unknown as Beat['interaction']),
      ),
    ).toBe(true)
  })

  it('is FALSE for a prediction WITHOUT a gate (the EXEMPT ungraded opening bet, R2)', () => {
    expect(
      isGradedBeat(beat({ type: 'prediction', options: ['a', 'b'] } as Beat['interaction'])),
    ).toBe(false)
  })
})

describe('gradedRequiredBeatIds with a which-method gate (spec-13 / R2)', () => {
  const gate = (id: string, required: boolean): Beat =>
    ({
      beatId: id,
      required,
      prompt: 'p',
      interaction: {
        type: 'prediction',
        options: ['a', 'b'],
        gate: { kind: 'which-method', correct: 'symmetry', optionMethods: ['symmetry', 'conditioning'] },
      },
      feedback: { byOption: { a: { note: 'n', correct: true } } },
    }) as Beat
  const openBet = (id: string): Beat =>
    ({
      beatId: id,
      required: true,
      prompt: 'p',
      interaction: { type: 'prediction', options: ['a', 'b'] },
      feedback: { byOption: { a: { note: 'n' } } },
    }) as Beat

  it('includes a REQUIRED gate prediction and excludes the opening bet', () => {
    expect(gradedRequiredBeatIds([gate('g', true), openBet('bet')])).toEqual(['g'])
  })

  it('excludes an optional gate prediction (required:false)', () => {
    expect(gradedRequiredBeatIds([gate('g', false)])).toEqual([])
  })
})

describe('isCheckpointBeat (confidence-capture set, spec-02 / D6)', () => {
  it('is true for a masteryChallenge beat', () => {
    expect(
      isCheckpointBeat(
        beat({ type: 'masteryChallenge', fields: [{ id: 'x', label: 'x', accept: ['6'] }] }),
      ),
    ).toBe(true)
  })

  it('is true for a prediction beat carrying interaction.gate (which-method gate, spec-13)', () => {
    expect(
      isCheckpointBeat(
        beat({
          type: 'prediction',
          options: ['a', 'b'],
          gate: { kind: 'which-method', correct: 'symmetry', optionMethods: ['symmetry', 'conditioning'] },
        } as unknown as Beat['interaction']),
      ),
    ).toBe(true)
  })

  it('is FALSE for a prediction beat WITHOUT a gate (the EXEMPT opening bet — D6)', () => {
    expect(
      isCheckpointBeat(beat({ type: 'prediction', options: ['a', 'b'] } as Beat['interaction'])),
    ).toBe(false)
  })

  it('is false for equationTiles, coinSim, and recap', () => {
    expect(
      isCheckpointBeat(beat({ type: 'equationTiles' } as unknown as Beat['interaction'])),
    ).toBe(false)
    expect(
      isCheckpointBeat(beat({ type: 'coinSim' } as unknown as Beat['interaction'])),
    ).toBe(false)
    expect(isCheckpointBeat(beat({ type: 'recap' }))).toBe(false)
  })
})
