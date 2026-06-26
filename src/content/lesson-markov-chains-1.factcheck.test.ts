// Stage-2 fact-check: every graded number in lesson-markov-chains-1.json is
// reproduced by src/engine/markov.ts. Fails fast with a clear message if a
// fixture author transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { matrixPower, formatRational } from '../engine/markov'
import fixture from '../../fixtures/lesson-markov-chains-1.json'
import type { Lesson } from './schema'

// Cast through unknown so we don't need exact TS inference of the JSON literal.
const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

const r = (n: number, d = 1) => ({ n, d })

// Weather chain P = [[3/5, 2/5], [3/10, 7/10]], rows = today {Clear, Rainy}.
const weather = [
  [r(3, 5), r(2, 5)],
  [r(3, 10), r(7, 10)],
]

// Augmented (yesterday, today) chain on {CC, CR, RC, RR}.
// From RR (both days rainy): rain tomorrow = 4/5 → stays RR; clear tomorrow = 1/5 → goes RC.
const aug = [
  [r(4, 5), r(1, 5), r(0), r(0)],     // CC → CC=4/5, CR=1/5
  [r(0), r(0), r(4, 5), r(1, 5)],     // CR → RC=4/5, RR=1/5
  [r(4, 5), r(1, 5), r(0), r(0)],     // RC → CC=4/5, CR=1/5
  [r(0), r(0), r(1, 5), r(4, 5)],     // RR → RC=1/5, RR=4/5
]

describe('lesson-markov-chains-1 fact-check', () => {
  it(
    'read-the-edge headline "7/10" === formatRational(matrixPower(weather, 1)[1][1])',
    () => {
      const beat = beatById('read-the-edge')
      if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
      expect(beat.interaction.headline).toBe(formatRational(matrixPower(weather, 1)[1][1]))
    },
  )

  it(
    'mastery-augment accept "4/5" === formatRational(matrixPower(aug, 1)[3][3])',
    () => {
      const beat = beatById('mastery-augment')
      if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
      const accept = beat.interaction.fields[0].accept
      expect(accept[0]).toBe(formatRational(matrixPower(aug, 1)[3][3]))
    },
  )

  it('engine golden: formatRational(matrixPower(weather, 1)[1][1]) = "7/10"', () => {
    expect(formatRational(matrixPower(weather, 1)[1][1])).toBe('7/10')
  })

  it('engine golden: formatRational(matrixPower(aug, 1)[3][3]) = "4/5"', () => {
    expect(formatRational(matrixPower(aug, 1)[3][3])).toBe('4/5')
  })
})
