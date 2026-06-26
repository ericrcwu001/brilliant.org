// Stage-2 fact-check: every graded number in lesson-markov-chains-2.json is
// reproduced by src/engine/markov.ts. Fails fast with a clear message if a
// fixture author transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { buildChain, matrixPower, formatRational } from '../engine/markov'
import fixture from '../../fixtures/lesson-markov-chains-2.json'
import type { Lesson } from './schema'

// Cast through unknown so we don't need exact TS inference of the JSON literal.
const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

const r = (n: number, d = 1) => ({ n, d })

// Weather chain: Clear/Rainy (beat 5 build-the-board)
const weather = [
  [r(3, 5), r(2, 5)],
  [r(3, 10), r(7, 10)],
]

// Story chain: Sunny/Rainy (beat 8 build-from-story)
const story = [
  [r(7, 10), r(3, 10)],
  [r(4, 10), r(6, 10)],
]

// Land-of-Oz: Rain/Nice/Snow (beat 9 mastery-challenge)
const oz = [
  [r(1, 2), r(1, 4), r(1, 4)],
  [r(1, 2), r(0), r(1, 2)],
  [r(1, 4), r(1, 4), r(1, 2)],
]

// Beat 7 distractor — Rainy row sums to 9/10, not 1
const distractor = [
  [r(3, 5), r(2, 5)],
  [r(3, 10), r(6, 10)],
]

describe('lesson-markov-chains-2 fact-check', () => {
  it('build-the-board headline === "1"', () => {
    const beat = beatById('build-the-board')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe('1')
  })

  it('build-from-story headline === "1"', () => {
    const beat = beatById('build-from-story')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe('1')
  })

  it('buildChain(weather, ["Clear","Rainy"]) does not throw (rows sum to 1)', () => {
    expect(() => buildChain(weather, ['Clear', 'Rainy'])).not.toThrow()
  })

  it('buildChain(story, ["Sunny","Rainy"]) does not throw (rows sum to 1)', () => {
    expect(() => buildChain(story, ['Sunny', 'Rainy'])).not.toThrow()
  })

  it('buildChain throws on b7 distractor [[3/5,2/5],[3/10,6/10]] (Rainy row 9/10)', () => {
    expect(() => buildChain(distractor, ['a', 'b'])).toThrow()
  })

  it('mastery seed accept "3/8" === formatRational(matrixPower(oz,2)[0][2])', () => {
    const beat = beatById('mastery-challenge')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const seedField = beat.interaction.fields.find((f) => f.id === 'seed')
    if (!seedField) throw new Error('seed field not found in fixture')
    expect(seedField.accept[0]).toBe(formatRational(matrixPower(oz, 2)[0][2]))
  })

  it('engine golden: formatRational(matrixPower(oz,2)[0][2]) = "3/8"', () => {
    expect(formatRational(matrixPower(oz, 2)[0][2])).toBe('3/8')
  })
})
