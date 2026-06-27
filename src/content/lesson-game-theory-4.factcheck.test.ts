// Stage-2 fact-check: every graded number in lesson-game-theory-4.json is
// reproduced by src/engine/gameTheory.ts from the fixture's own payoff matrices.

import { describe, it, expect } from 'vitest'
import { saddlePoint, mixedValue2x2, formatRational } from '../engine/gameTheory'
import type { Rational } from '../engine/types'
import fixture from '../../fixtures/lesson-game-theory-4.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

function rowMatrix(id: string): Rational[][] {
  const beat = beatById(id)
  if (beat.interaction.type !== 'payoffMatrix') throw new Error('wrong interaction type')
  return beat.interaction.matrix.map((r) => r.cells.map((c) => c.row))
}

describe('lesson-game-theory-4 fact-check', () => {
  it('l4-win: saddlePoint value = "3" matches headline', () => {
    const rowM = rowMatrix('l4-win')
    const sp = saddlePoint(rowM)
    expect(sp).not.toBeNull()
    const got = formatRational(sp!.value)
    expect(got).toBe('3')
    const beat = beatById('l4-win')
    if (beat.interaction.type !== 'payoffMatrix') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(got)
  })

  it('l4-scaffold: saddlePoint value = "4" matches headline', () => {
    const rowM = rowMatrix('l4-scaffold')
    const sp = saddlePoint(rowM)
    expect(sp).not.toBeNull()
    const got = formatRational(sp!.value)
    expect(got).toBe('4')
    const beat = beatById('l4-scaffold')
    if (beat.interaction.type !== 'payoffMatrix') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(got)
  })

  it('l4-explore: no saddle; mixedValue2x2 value = "5/2" matches headline', () => {
    const rowM = rowMatrix('l4-explore')
    expect(saddlePoint(rowM)).toBeNull()
    const { value } = mixedValue2x2(rowM)
    const got = formatRational(value)
    expect(got).toBe('5/2')
    const beat = beatById('l4-explore')
    if (beat.interaction.type !== 'payoffMatrix') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(got)
  })

  it('l4-apply: Two-finger Morra value = "-1/12" matches accept', () => {
    const rowM: Rational[][] = [
      [{ n: 2, d: 1 }, { n: -3, d: 1 }],
      [{ n: -3, d: 1 }, { n: 4, d: 1 }],
    ]
    const { value } = mixedValue2x2(rowM)
    const got = formatRational(value)
    expect(got).toBe('-1/12')
    const beat = beatById('l4-apply')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    expect(beat.interaction.fields[0].accept).toContain('-1/12')
  })

  it('l4-prove: [[1,3],[4,2]] → value "5/2", p "1/2" match accepts', () => {
    const rowM: Rational[][] = [
      [{ n: 1, d: 1 }, { n: 3, d: 1 }],
      [{ n: 4, d: 1 }, { n: 2, d: 1 }],
    ]
    const { value, p } = mixedValue2x2(rowM)
    expect(formatRational(value)).toBe('5/2')
    expect(formatRational(p)).toBe('1/2')
    const beat = beatById('l4-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    expect(beat.interaction.fields[0].accept).toContain('5/2')
    expect(beat.interaction.fields[1].accept).toContain('1/2')
  })
})
