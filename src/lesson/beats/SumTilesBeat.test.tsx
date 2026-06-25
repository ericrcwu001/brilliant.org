// Pure unit tests for the SumTilesBeat model, mirroring BalanceSolveBeat.test.tsx.
// No React rendering — these run in the plain node Vitest environment.

import { describe, it, expect } from 'vitest'
import { autocorrelation } from '../../engine/correlation'

// Model helpers mirroring what SumTilesBeat derives from autocorrelation.
function sumTilesModel(target: string, placed: Set<number>) {
  const { overlaps, sum } = autocorrelation(target)
  const runningTotal = [...placed].reduce((acc, k) => acc + 2 ** k, 0)
  const complete = placed.size === overlaps.length
  return { overlaps, sum, runningTotal, complete }
}

describe('SumTilesBeat model — HTH', () => {
  const empty = new Set<number>()

  it('derives two overlap lengths: 1 and 3', () => {
    const { overlaps } = sumTilesModel('HTH', empty)
    expect(overlaps).toEqual([1, 3])
  })

  it('chip values are 2 and 8', () => {
    const { overlaps } = sumTilesModel('HTH', empty)
    expect(overlaps.map((k) => 2 ** k)).toEqual([2, 8])
  })

  it('sum (E[wait for HTH]) is 10', () => {
    const { sum } = sumTilesModel('HTH', empty)
    expect(sum).toBe(10)
  })

  it('no chips placed → not complete, runningTotal 0', () => {
    const { complete, runningTotal } = sumTilesModel('HTH', empty)
    expect(complete).toBe(false)
    expect(runningTotal).toBe(0)
  })

  it('only one chip placed → not complete', () => {
    const { complete } = sumTilesModel('HTH', new Set([1]))
    expect(complete).toBe(false)
  })

  it('all chips placed → complete, runningTotal 10', () => {
    const { complete, runningTotal } = sumTilesModel('HTH', new Set([1, 3]))
    expect(complete).toBe(true)
    expect(runningTotal).toBe(10)
  })

  it('runningTotal equals sum when complete', () => {
    const full = new Set([1, 3])
    const { complete, runningTotal, sum } = sumTilesModel('HTH', full)
    expect(complete).toBe(true)
    expect(runningTotal).toBe(sum)
  })
})

describe('SumTilesBeat model — HH (overlaps at length 1 and 2)', () => {
  // HH: length-1 suffix "H" == prefix "H"; length-2 suffix "HH" == prefix "HH"
  // → overlaps [1, 2], sum = 2 + 4 = 6
  it('has overlaps at lengths 1 and 2, sum 6', () => {
    const { overlaps, sum } = sumTilesModel('HH', new Set())
    expect(overlaps).toEqual([1, 2])
    expect(sum).toBe(6)
  })

  it('placing only chip 1 is not complete', () => {
    const { complete } = sumTilesModel('HH', new Set([1]))
    expect(complete).toBe(false)
  })

  it('placing both chips is complete, runningTotal 6', () => {
    const { complete, runningTotal } = sumTilesModel('HH', new Set([1, 2]))
    expect(complete).toBe(true)
    expect(runningTotal).toBe(6)
  })
})
