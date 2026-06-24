import { describe, it, expect } from 'vitest'
import lessonFixture from '../../fixtures/lesson-pattern-hitting-times.json'
import { LessonSchema } from './schema'
import { buildAutomaton } from '../engine/automaton'

describe('flagship fixture', () => {
  const lesson = LessonSchema.parse(lessonFixture)

  it('validates against the lesson schema', () => {
    expect(lesson.lessonId).toBe('lesson-pattern-hitting-times')
    // 11 core beats + 5 Track-A inclusivity beats (3 primers, name-the-overlap,
    // the EV grounding); the Track-A beats are required:false so the Cloud
    // Function's required-beat check still passes for either track.
    expect(lesson.beats).toHaveLength(16)
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

  it('guided-solve steps equal the engine substitution steps for HH', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'guided-solve')!
    if (beat.interaction.type !== 'substitution') throw new Error('wrong type')
    expect(beat.interaction.steps).toEqual(buildAutomaton('HH', 0.5).substitutionSteps)
  })
})
