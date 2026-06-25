// Stage-2 fact-check: every graded number in lesson-combinatorics-1.json is
// reproduced by src/engine/combinatorics.ts. Fails fast with a clear message
// if a fixture author transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { product, nPk } from '../engine/combinatorics'
import fixture from '../../fixtures/lesson-combinatorics-1.json'
import type { Lesson } from './schema'

// Cast through unknown so we don't need exact TS inference of the JSON literal.
const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

describe('lesson-combinatorics-1 fact-check', () => {
  it('l1-win countingTree accept[0] === product([2,2,2]).toString() (= "8")', () => {
    const beat = beatById('l1-win')
    if (beat.interaction.type !== 'countingTree') throw new Error('wrong type')
    const accept = beat.interaction.accept ?? []
    const opts = beat.interaction.levels.map((l) => l.options)
    expect(accept[0].replace(/[,\s]/g, '')).toBe(product(opts).toString())
  })

  it('l1-scaffold ungraded tree product === product([2,2,2,2]).toString() (= "16")', () => {
    const beat = beatById('l1-scaffold')
    if (beat.interaction.type !== 'countingTree') throw new Error('wrong type')
    const opts = beat.interaction.levels.map((l) => l.options)
    expect(product(opts).toString()).toBe('16')
  })

  it('l1-explore ungraded tree product === product([2,3,2]).toString() (= "12")', () => {
    const beat = beatById('l1-explore')
    if (beat.interaction.type !== 'countingTree') throw new Error('wrong type')
    const opts = beat.interaction.levels.map((l) => l.options)
    expect(product(opts).toString()).toBe('12')
  })

  it('l1-model ungraded tree product === product([3,2,1]).toString() (= "6")', () => {
    const beat = beatById('l1-model')
    if (beat.interaction.type !== 'countingTree') throw new Error('wrong type')
    const opts = beat.interaction.levels.map((l) => l.options)
    expect(product(opts).toString()).toBe('6')
  })

  it('l1-multadd answerEntry accept === product([3,3,3]).toString() (= "27")', () => {
    const beat = beatById('l1-multadd')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const accept = beat.interaction.fields[0].accept
    expect(accept[0].replace(/[,\s]/g, '')).toBe(product([3, 3, 3]).toString())
  })

  it(
    'l1-prove masteryChallenge accept[0] (strip commas) === nPk(365,3).toString() (= "48228180")',
    () => {
      const beat = beatById('l1-prove')
      if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
      const raw = beat.interaction.fields[0].accept[0]
      expect(raw.replace(/[,\s]/g, '')).toBe(nPk(365, 3).toString())
    },
  )

  it('engine golden: product([2,2,2]) = 8n', () => {
    expect(product([2, 2, 2])).toBe(8n)
  })

  it('engine golden: product([2,3,2]) = 12n', () => {
    expect(product([2, 3, 2])).toBe(12n)
  })

  it('engine golden: product([3,3,3]) = 27n', () => {
    expect(product([3, 3, 3])).toBe(27n)
  })

  it('engine golden: product([3,2,1]) = 6n', () => {
    expect(product([3, 2, 1])).toBe(6n)
  })

  it('engine golden: product([2,2,2,2]) = 16n', () => {
    expect(product([2, 2, 2, 2])).toBe(16n)
  })

  it('engine golden: nPk(365,3) = 48_228_180n', () => {
    expect(nPk(365, 3)).toBe(48_228_180n)
  })
})
