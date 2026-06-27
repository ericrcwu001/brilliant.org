// Stage-2 fact-check: every graded number in lesson-game-theory-5.json is
// reproduced by src/engine/gameTheory.ts from the fixture's own game trees.

import { describe, it, expect } from 'vitest'
import {
  backwardInduction,
  pirateGame,
  tigerSheepEaten,
  formatVector,
  type GameTreeNode,
} from '../engine/gameTheory'
import fixture from '../../fixtures/lesson-game-theory-5.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

function treeOf(id: string): GameTreeNode {
  const beat = beatById(id)
  if (beat.interaction.type !== 'gameTree') throw new Error('wrong type')
  return beat.interaction.root as unknown as GameTreeNode
}

describe('lesson-game-theory-5 fact-check', () => {
  it('l5-win: backwardInduction payoff = "2,1" and matches headline', () => {
    const root = treeOf('l5-win')
    const result = backwardInduction(root)
    const got = formatVector(result.payoff)
    expect(got).toBe('2,1')
    const beat = beatById('l5-win')
    if (beat.interaction.type !== 'gameTree') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(got)
  })

  it('l5-scaffold: backwardInduction payoff = "3,0" and matches headline', () => {
    const root = treeOf('l5-scaffold')
    const result = backwardInduction(root)
    const got = formatVector(result.payoff)
    expect(got).toBe('3,0')
    const beat = beatById('l5-scaffold')
    if (beat.interaction.type !== 'gameTree') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(got)
  })

  it('l5-explore: backwardInduction payoff = "1,0", path[0] = "Take", matches headline', () => {
    const root = treeOf('l5-explore')
    const result = backwardInduction(root)
    const got = formatVector(result.payoff)
    expect(got).toBe('1,0')
    expect(result.path[0]).toBe('Take')
    const beat = beatById('l5-explore')
    if (beat.interaction.type !== 'gameTree') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(got)
  })

  it('l5-apply: pirateGame(5,100) senior[0]=98, junior[4]=1, matches accept lists', () => {
    const alloc = pirateGame(5, 100)
    expect(alloc[0]).toBe(98)
    expect(alloc[4]).toBe(1)
    const beat = beatById('l5-apply')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    expect(beat.interaction.fields.find((f) => f.id === 'keep')?.accept).toContain('98')
    expect(beat.interaction.fields.find((f) => f.id === 'junior')?.accept).toContain('1')
  })

  it('l5-prove: pirateGame(3,100) senior[0]=99, bribed[2]=1; tigerSheepEaten(100)=false', () => {
    const alloc = pirateGame(3, 100)
    expect(alloc[0]).toBe(99)
    expect(alloc[2]).toBe(1)
    expect(tigerSheepEaten(100)).toBe(false)
    const beat = beatById('l5-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    expect(beat.interaction.fields.find((f) => f.id === 'keep3')?.accept).toContain('99')
    expect(beat.interaction.fields.find((f) => f.id === 'bribe')?.accept).toContain('1')
    expect(beat.interaction.fields.find((f) => f.id === 'sheep')?.accept).toContain('no')
  })
})
