// Stage-2 fact-check: every graded number in lesson-game-theory-2.json is
// reproduced by src/engine/gameTheory.ts from the fixture's own payoff matrices.

import { describe, it, expect } from 'vitest'
import { pureNashEquilibria, type Game } from '../engine/gameTheory'
import fixture from '../../fixtures/lesson-game-theory-2.json'
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

describe('lesson-game-theory-2 fact-check', () => {
  it('l2-scaffold: single pure NE = (0,0) and matches the declared headline', () => {
    const ne = pureNashEquilibria(gameOf('l2-scaffold'))
    expect(ne).toEqual([{ row: 0, col: 0 }])
    const beat = beatById('l2-scaffold')
    if (beat.interaction.type !== 'payoffMatrix') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe('0,0')
  })

  it('l2-explore: two pure NE = (0,0) and (1,1), headline matches', () => {
    const ne = pureNashEquilibria(gameOf('l2-explore'))
    expect(ne).toEqual([{ row: 0, col: 0 }, { row: 1, col: 1 }])
    const beat = beatById('l2-explore')
    if (beat.interaction.type !== 'payoffMatrix') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe('0,0;1,1')
  })

  it('l2-prove (Chicken): 2 pure NE, Straight-vs-Swerve payoff = 5, accepts match', () => {
    const chickenGame: Game = [
      [
        { row: { n: 4, d: 1 }, col: { n: 4, d: 1 } },
        { row: { n: 2, d: 1 }, col: { n: 5, d: 1 } },
      ],
      [
        { row: { n: 5, d: 1 }, col: { n: 2, d: 1 } },
        { row: { n: 1, d: 1 }, col: { n: 1, d: 1 } },
      ],
    ]
    expect(pureNashEquilibria(chickenGame).length).toBe(2)
    expect(chickenGame[1][0].row.n).toBe(5)
    const beat = beatById('l2-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const countField = beat.interaction.fields.find((f) => f.id === 'count')
    const straightField = beat.interaction.fields.find((f) => f.id === 'straight')
    expect(countField?.accept).toContain('2')
    expect(straightField?.accept).toContain('5')
  })

  it("l2-interleave: retrieval pairs match pure-NE counts (PD=1, Stag=2, Pennies=0)", () => {
    const pdGame: Game = [
      [
        { row: { n: 3, d: 1 }, col: { n: 3, d: 1 } },
        { row: { n: 0, d: 1 }, col: { n: 5, d: 1 } },
      ],
      [
        { row: { n: 5, d: 1 }, col: { n: 0, d: 1 } },
        { row: { n: 1, d: 1 }, col: { n: 1, d: 1 } },
      ],
    ]
    const stagGame: Game = [
      [
        { row: { n: 3, d: 1 }, col: { n: 3, d: 1 } },
        { row: { n: 0, d: 1 }, col: { n: 1, d: 1 } },
      ],
      [
        { row: { n: 1, d: 1 }, col: { n: 0, d: 1 } },
        { row: { n: 1, d: 1 }, col: { n: 1, d: 1 } },
      ],
    ]
    const penniesGame: Game = [
      [
        { row: { n: 1, d: 1 }, col: { n: -1, d: 1 } },
        { row: { n: -1, d: 1 }, col: { n: 1, d: 1 } },
      ],
      [
        { row: { n: -1, d: 1 }, col: { n: 1, d: 1 } },
        { row: { n: 1, d: 1 }, col: { n: -1, d: 1 } },
      ],
    ]
    expect(pureNashEquilibria(pdGame).length).toBe(1)
    expect(pureNashEquilibria(stagGame).length).toBe(2)
    expect(pureNashEquilibria(penniesGame).length).toBe(0)
    const beat = beatById('l2-interleave')
    if (beat.interaction.type !== 'retrievalGrid') throw new Error('wrong type')
    const pdPair = beat.interaction.pairs.find((p) => p.left === "Prisoner's Dilemma")
    const stagPair = beat.interaction.pairs.find((p) => p.left === 'Stag Hunt')
    const penniesPair = beat.interaction.pairs.find((p) => p.left === 'Matching Pennies')
    expect(pdPair?.right).toBe('1')
    expect(stagPair?.right).toBe('2')
    expect(penniesPair?.right).toBe('0')
  })
})
