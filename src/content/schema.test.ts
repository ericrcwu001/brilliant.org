import { describe, it, expect } from 'vitest'
import lessonFixture from '../../fixtures/lesson-pattern-hitting-times.json'
import { BeatSchema, LessonSchema } from './schema'
import { buildAutomaton } from '../engine/automaton'

describe('flagship fixture', () => {
  const lesson = LessonSchema.parse(lessonFixture)

  it('validates against the lesson schema', () => {
    expect(lesson.lessonId).toBe('lesson-pattern-hitting-times')
    // 11 core beats + 5 Track-A inclusivity beats (3 primers, name-the-overlap,
    // the EV grounding) + 1 held-out transfer beat (spec-24) + 1 mastery-challenge
    // beat; the Track-A beats are required:false so the Cloud Function's
    // required-beat check still passes.
    expect(lesson.beats).toHaveLength(18)
  })

  it('equation-tile targets equal the engine recurrences for HH', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'equation-tiles')!
    expect(beat.interaction.type).toBe('equationTiles')
    if (beat.interaction.type !== 'equationTiles') return
    const { recurrences } = buildAutomaton('HH', 0.5)
    for (const row of beat.interaction.rows) {
      expect(row.target).toEqual(recurrences[row.lhs as 'E0' | 'E1' | 'E2'])
    }
  })

  it('guided-solve is a balanceSolve whose engine solution sits in the slider domain', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'guided-solve')!
    expect(beat.interaction.type).toBe('balanceSolve')
    if (beat.interaction.type !== 'balanceSolve') return
    expect(beat.interaction.solveState ?? 'E0').toBe('E0')
    // The balance point the learner must reach is the engine's solved E0 (= 6);
    // it must be reachable within the authored [min, max] candidate domain.
    const e0 = buildAutomaton('HH', 0.5).expectedTimes['E0']
    expect(e0).toBe(6)
    expect(beat.interaction.min).toBeLessThanOrEqual(e0)
    expect(beat.interaction.max).toBeGreaterThanOrEqual(e0)
  })
})

describe('BeatSchema.schemaId (Foundation B, spec-00)', () => {
  const base = {
    beatId: 'b',
    required: true,
    prompt: 'p',
    interaction: {
      type: 'answerEntry',
      fields: [{ id: 'x', label: 'x', accept: ['6'] }],
    },
    feedback: { correct: 'ok', hints: ['a', 'b', 'c'] },
  } as const

  it('accepts a beat with a valid registry schemaId', () => {
    expect(BeatSchema.safeParse({ ...base, schemaId: 'first-step-analysis' }).success).toBe(true)
  })

  it('accepts a beat with no schemaId (optional during backfill)', () => {
    expect(BeatSchema.safeParse(base).success).toBe(true)
  })

  it('rejects a schemaId that is not in the registry', () => {
    expect(BeatSchema.safeParse({ ...base, schemaId: 'bogus' }).success).toBe(false)
  })
})
