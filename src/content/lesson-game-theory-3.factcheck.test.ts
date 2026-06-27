// Stage-2 fact-check: every graded number in lesson-game-theory-3.json is
// reproduced by src/engine/gameTheory.ts from the fixture's own payoff matrices.

import { describe, it, expect } from 'vitest'
import {
  mixedValue2x2,
  mixedNash2x2,
  pureNashEquilibria,
  formatRational,
  type Game,
} from '../engine/gameTheory'
import fixture from '../../fixtures/lesson-game-theory-3.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

function rowMatrix(id: string): { n: number; d: number }[][] {
  const beat = beatById(id)
  if (beat.interaction.type !== 'payoffMatrix') throw new Error('wrong type')
  return beat.interaction.matrix.map((r) => r.cells.map((c) => c.row))
}

function gameOf(id: string): Game {
  const beat = beatById(id)
  if (beat.interaction.type !== 'payoffMatrix') throw new Error('wrong type')
  return beat.interaction.matrix.map((r) => r.cells.map((c) => ({ row: c.row, col: c.col })))
}

describe('lesson-game-theory-3 fact-check', () => {
  it('l3-win: Matching Pennies mixed value = 0, headline = "0"', () => {
    const rowM = rowMatrix('l3-win')
    expect(formatRational(mixedValue2x2(rowM).value)).toBe('0')
    const beat = beatById('l3-win')
    if (beat.interaction.type !== 'payoffMatrix') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe('0')
  })

  it('l3-win: Matching Pennies has no pure Nash equilibria', () => {
    expect(pureNashEquilibria(gameOf('l3-win'))).toEqual([])
  })

  it('l3-explore: Two-finger Morra mixed value = -1/12, headline = "-1/12"', () => {
    const rowM = rowMatrix('l3-explore')
    expect(formatRational(mixedValue2x2(rowM).value)).toBe('-1/12')
    const beat = beatById('l3-explore')
    if (beat.interaction.type !== 'payoffMatrix') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe('-1/12')
  })

  it('l3-apply: Battle of the Sexes mixed NE p = 3/5 matches accept', () => {
    const bos: Game = [
      [
        { row: { n: 3, d: 1 }, col: { n: 2, d: 1 } },
        { row: { n: 0, d: 1 }, col: { n: 0, d: 1 } },
      ],
      [
        { row: { n: 0, d: 1 }, col: { n: 0, d: 1 } },
        { row: { n: 2, d: 1 }, col: { n: 3, d: 1 } },
      ],
    ]
    const result = mixedNash2x2(bos)
    expect(result).not.toBeNull()
    expect(formatRational(result!.p)).toBe('3/5')
    const beat = beatById('l3-apply')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    expect(beat.interaction.fields[0].accept).toContain('3/5')
  })

  it('l3-prove: Two-finger Morra p = 7/12 and value = -1/12 match accepts', () => {
    const rowM = rowMatrix('l3-explore')
    const result = mixedValue2x2(rowM)
    expect(formatRational(result.p)).toBe('7/12')
    expect(formatRational(result.value)).toBe('-1/12')
    const beat = beatById('l3-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    expect(beat.interaction.fields.find((f) => f.id === 'mix')!.accept).toContain('7/12')
    expect(beat.interaction.fields.find((f) => f.id === 'value')!.accept).toContain('-1/12')
  })
})
