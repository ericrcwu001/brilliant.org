// Stage-2 fact-check: every graded number in lesson-markov-chains-3.json is
// reproduced by src/engine/markov.ts matrixPower. Fails fast with a clear
// message if a fixture author transcribes a wrong rational.

import { describe, it, expect } from 'vitest'
import { matrixPower, formatRational } from '../engine/markov'
import type { Rational } from '../engine/types'
import fixture from '../../fixtures/lesson-markov-chains-3.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

// Land of Oz chain: P = [[1/2,1/4,1/4],[1/2,0,1/2],[1/4,1/4,1/2]]
// labels: ["Rain","Nice","Snow"]  (Grinstead & Snell Ch.11 Table 11.1)
const oz: Rational[][] = [
  [{ n: 1, d: 2 }, { n: 1, d: 4 }, { n: 1, d: 4 }],
  [{ n: 1, d: 2 }, { n: 0, d: 1 }, { n: 1, d: 2 }],
  [{ n: 1, d: 4 }, { n: 1, d: 4 }, { n: 1, d: 2 }],
]

// Two-state weather chain: P = [[3/5,2/5],[3/10,7/10]]
// labels: ["Clear","Rainy"]  (Math.SE 3336273)
const weather: Rational[][] = [
  [{ n: 3, d: 5 }, { n: 2, d: 5 }],
  [{ n: 3, d: 10 }, { n: 7, d: 10 }],
]

describe('lesson-markov-chains-3 fact-check', () => {
  it('explore-powers headline "3/8" === formatRational(matrixPower(oz,2)[0][2])', () => {
    const beat = beatById('explore-powers')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(formatRational(matrixPower(oz, 2)[0][2]))
  })

  it('read-another-entry headline "7/16" === formatRational(matrixPower(oz,2)[0][0])', () => {
    const beat = beatById('read-another-entry')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(formatRational(matrixPower(oz, 2)[0][0]))
  })

  it('warmup-two-step accept[0] "12/25" === formatRational(matrixPower(weather,2)[0][0])', () => {
    const beat = beatById('warmup-two-step')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    expect(beat.interaction.fields[0].accept[0]).toBe(
      formatRational(matrixPower(weather, 2)[0][0]),
    )
  })

  it('prove-two-day-snow accept[0] "3/8" === formatRational(matrixPower(oz,2)[0][2])', () => {
    const beat = beatById('prove-two-day-snow')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    expect(beat.interaction.fields[0].accept[0]).toBe(formatRational(matrixPower(oz, 2)[0][2]))
  })

  it('mastery-three-day-snow accept[0] "25/64" === formatRational(matrixPower(oz,3)[0][2])', () => {
    const beat = beatById('mastery-three-day-snow')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    expect(beat.interaction.fields[0].accept[0]).toBe(formatRational(matrixPower(oz, 3)[0][2]))
  })

  // Engine goldens — pin the four key values independently of the fixture
  it('engine golden: matrixPower(oz,2)[0][2] = "3/8"  (P²_Rain,Snow)', () => {
    expect(formatRational(matrixPower(oz, 2)[0][2])).toBe('3/8')
  })

  it('engine golden: matrixPower(oz,2)[0][0] = "7/16"  (P²_Rain,Rain)', () => {
    expect(formatRational(matrixPower(oz, 2)[0][0])).toBe('7/16')
  })

  it('engine golden: matrixPower(weather,2)[0][0] = "12/25"  (P²_Clear,Clear)', () => {
    expect(formatRational(matrixPower(weather, 2)[0][0])).toBe('12/25')
  })

  it('engine golden: matrixPower(oz,3)[0][2] = "25/64"  (P³_Rain,Snow)', () => {
    expect(formatRational(matrixPower(oz, 3)[0][2])).toBe('25/64')
  })
})
