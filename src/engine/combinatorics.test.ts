import { describe, it, expect } from 'vitest'
import {
  factorial,
  nPk,
  nCk,
  product,
  pascalRow,
  unionSize,
  inclusionExclusion,
  derangements,
  pigeonholeMin,
  forcesCollision,
  probabilityFromCounts,
  reduce,
} from './combinatorics'

describe('combinatorics engine (exact BigInt)', () => {
  it('factorial / nPk / nCk', () => {
    expect(factorial(0)).toBe(1n)
    expect(factorial(5)).toBe(120n)
    expect(nPk(5, 3)).toBe(60n)
    expect(nPk(365, 3)).toBe(48228180n)
    expect(nCk(52, 5)).toBe(2598960n)
    expect(nCk(5, 3)).toBe(10n)
    expect(nCk(6, 3)).toBe(20n)
  })

  it('product (multiplication rule)', () => {
    expect(product([2, 2, 2])).toBe(8n)
    expect(product([2, 3, 2])).toBe(12n)
    expect(product([3, 2, 1])).toBe(6n)
    expect(product([13, 4, 12, 6])).toBe(3744n)
    expect(product([78, 6, 6, 44])).toBe(123552n)
    expect(product([])).toBe(1n)
  })

  it('pascalRow with row-sum + symmetry invariants', () => {
    expect(pascalRow(4)).toEqual([1n, 4n, 6n, 4n, 1n])
    for (let n = 0; n <= 6; n++) {
      const row = pascalRow(n)
      expect(row.reduce((a, b) => a + b, 0n)).toBe(2n ** BigInt(n))
      for (let k = 0; k <= n; k++) expect(row[k]).toBe(row[n - k])
    }
  })

  it('inclusion–exclusion + derangements', () => {
    expect(unionSize(8, 6, 3)).toBe(11n)
    expect(derangements(5)).toBe(44n)
    const atLeastOne = inclusionExclusion([
      { size: 120, sign: 1 },
      { size: 60, sign: -1 },
      { size: 20, sign: 1 },
      { size: 5, sign: -1 },
      { size: 1, sign: 1 },
    ])
    expect(atLeastOne).toBe(76n)
    expect(factorial(5) - atLeastOne).toBe(derangements(5))
  })

  it('pigeonhole', () => {
    expect(pigeonholeMin(51, 25)).toBe(3)
    expect(pigeonholeMin(4, 3)).toBe(2)
    expect(pigeonholeMin(7, 3)).toBe(3)
    expect(pigeonholeMin(9, 7)).toBe(2)
    expect(forcesCollision(4, 3)).toBe(true)
    expect(forcesCollision(3, 3)).toBe(false)
    expect(forcesCollision(26, 25)).toBe(true)
    expect(forcesCollision(9, 7)).toBe(true)
  })

  it('reduce + probabilityFromCounts', () => {
    expect(reduce(44n, 120n)).toEqual({ n: 11n, d: 30n })
    expect(probabilityFromCounts(624, 2598960)).toEqual({ n: 1n, d: 4165n })
    expect(probabilityFromCounts(3744, 2598960)).toEqual({ n: 6n, d: 4165n })
    expect(probabilityFromCounts(123552, 2598960)).toEqual({ n: 198n, d: 4165n })
    expect(probabilityFromCounts(20, 216)).toEqual({ n: 5n, d: 54n })
  })
})
