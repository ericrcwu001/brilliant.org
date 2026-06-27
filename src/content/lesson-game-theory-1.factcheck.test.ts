// Stage-2 fact-check: every graded number in lesson-game-theory-1.json is
// reproduced by src/engine/gameTheory.ts from the fixture's own payoff matrices.

import { describe, it, expect } from 'vitest'
import { iesdsSolution, pureNashEquilibria, type Game } from '../engine/gameTheory'
import fixture from '../../fixtures/lesson-game-theory-1.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

function gameOf(id: string): Game {
  const beat = beatById(id)
  if (beat.interaction.type !== 'payoffMatrix') throw new Error('wrong type')
  return beat.interaction.matrix.map((r) => r.cells.map((c) => ({ row: c.row, col: c.col })))
}

describe('lesson-game-theory-1 fact-check', () => {
  it('l1-win: PD iesdsSolution = (1,1) and matches the declared headline', () => {
    const sol = iesdsSolution(gameOf('l1-win'))
    expect(sol).not.toBeNull()
    const got = `${sol!.row},${sol!.col}`
    expect(got).toBe('1,1')
    const beat = beatById('l1-win')
    if (beat.interaction.type !== 'payoffMatrix') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(got)
  })

  it('l1-win: PD unique pure NE = (1,1)', () => {
    expect(pureNashEquilibria(gameOf('l1-win'))).toEqual([{ row: 1, col: 1 }])
  })

  it('l1-explore: 3×3 IESDS survivor = (Middle, Left) = "1,0"', () => {
    const sol = iesdsSolution(gameOf('l1-explore'))
    expect(sol).not.toBeNull()
    const got = `${sol!.row},${sol!.col}`
    expect(got).toBe('1,0')
    const beat = beatById('l1-explore')
    if (beat.interaction.type !== 'payoffMatrix') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe('1,0')
  })

  it('l1-prove: mastery accepts equal the PD cell payoffs from the fixture', () => {
    const g = gameOf('l1-win')
    expect(String(g[1][1].row.n)).toBe('1') // (Defect, Defect) row payoff = 1
    expect(String(g[0][0].row.n)).toBe('3') // (Cooperate, Cooperate) row payoff = 3
    const beat = beatById('l1-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    expect(beat.interaction.fields[0].accept).toContain('1')
    expect(beat.interaction.fields[1].accept).toContain('3')
  })

  it('l1-apply: guess-2/3-of-the-average equilibrium accept is "0"', () => {
    const beat = beatById('l1-apply')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    expect(beat.interaction.fields[0].accept).toContain('0')
  })
})
