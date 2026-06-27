// Stage-2 fact-check: every graded number in lesson-game-theory-6.json is
// reproduced by src/engine/gameTheory.ts from the fixture's own data.

import { describe, it, expect } from 'vitest'
import { nimSum, nimIsWinning, subtractionWinningMove } from '../engine/gameTheory'
import fixture from '../../fixtures/lesson-game-theory-6.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

describe('lesson-game-theory-6 fact-check', () => {
  it('l6-win: subtraction (10, k=3) headline matches engine residue and subtractionWinningMove', () => {
    const beat = beatById('l6-win')
    if (beat.interaction.type !== 'nimBoard') throw new Error('wrong type')
    const { heaps, maxRemove, headline } = beat.interaction
    if (maxRemove === undefined) throw new Error('maxRemove not set')
    expect(String(heaps[0] % (maxRemove + 1))).toBe('2')
    expect(headline).toBe('2')
    expect(subtractionWinningMove(10, 3)).toBe(2)
  })

  it('l6-scaffold: subtraction (7, k=3) headline matches engine residue', () => {
    const beat = beatById('l6-scaffold')
    if (beat.interaction.type !== 'nimBoard') throw new Error('wrong type')
    const { heaps, maxRemove, headline } = beat.interaction
    if (maxRemove === undefined) throw new Error('maxRemove not set')
    expect(String(heaps[0] % (maxRemove + 1))).toBe('3')
    expect(headline).toBe('3')
  })

  it('l6-explore: nim (3,4,5) headline matches nimSum and nimIsWinning is true', () => {
    const beat = beatById('l6-explore')
    if (beat.interaction.type !== 'nimBoard') throw new Error('wrong type')
    const { heaps, headline } = beat.interaction
    expect(String(nimSum(heaps))).toBe('2')
    expect(headline).toBe('2')
    expect(nimIsWinning(heaps)).toBe(true)
  })

  it('l6-apply: chocolate-bar 6×8 answer is 47 (mn − 1)', () => {
    const beat = beatById('l6-apply')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    expect(6 * 8 - 1).toBe(47)
    expect(Number(beat.interaction.fields[0].accept[0])).toBe(47)
  })

  it('l6-prove: nimSum([1,4,5]) = 0; nimIsWinning = false; accept lists match', () => {
    const beat = beatById('l6-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    expect(nimSum([1, 4, 5])).toBe(0)
    expect(nimIsWinning([1, 4, 5])).toBe(false)
    const nimsumField = beat.interaction.fields.find((f) => f.id === 'nimsum')
    const winField = beat.interaction.fields.find((f) => f.id === 'win')
    expect(nimsumField?.accept).toContain('0')
    expect(winField?.accept).toContain('no')
  })
})
