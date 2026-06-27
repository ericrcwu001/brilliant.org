// Goldens for the Optimal Stopping (Secretary problem) engine. Pins the famous
// LibreTexts §12.9 table and BRUTE-FORCE-ENUMERATES every arrival order for
// n ≤ 7 to prove secretarySuccess(n,r) equals the exact win frequency — an
// independent ground truth, not a restatement of the closed form.

import { describe, it, expect } from 'vitest'
import {
  secretarySuccess,
  naiveSuccess,
  successCurve,
  optimalCutoff,
  runStrategy,
  formatRational,
  reduce,
} from './optimalStopping'

// All permutations of [1..n] (the equally-likely arrival orders by true rank).
function perms(arr: number[]): number[][] {
  if (arr.length <= 1) return [arr]
  const out: number[][] = []
  arr.forEach((x, i) => {
    for (const p of perms([...arr.slice(0, i), ...arr.slice(i + 1)])) out.push([x, ...p])
  })
  return out
}

describe('optimalStopping engine', () => {
  it('naiveSuccess(n) = 1/n', () => {
    expect(formatRational(naiveSuccess(2))).toBe('1/2')
    expect(formatRational(naiveSuccess(3))).toBe('1/3')
    expect(formatRational(naiveSuccess(10))).toBe('1/10')
  })

  it('reproduces the famous small-n optimal table (LibreTexts §12.9)', () => {
    const table: Array<[number, number, string]> = [
      // [n, optimal r*, optimal p* (reduced)]
      [3, 2, '1/2'],
      [4, 2, '11/24'],
      [5, 3, '13/30'],
      [6, 3, '77/180'],
      [7, 3, '29/70'],
      [8, 4, '459/1120'],
      [9, 4, '341/840'],
      [10, 4, '3349/8400'],
    ]
    for (const [n, r, p] of table) {
      const o = optimalCutoff(n)
      expect(o.r, `optimal r for n=${n}`).toBe(r)
      expect(formatRational(o.p), `optimal p for n=${n}`).toBe(p)
    }
  })

  it('large-n optimal cutoff fraction approaches 1/e (≈0.368)', () => {
    // Exact argmax for moderate n (BigInt is exact; we keep n ≤ 100 so the test
    // stays fast — n in the thousands needs ~430-digit lcm arithmetic).
    expect(optimalCutoff(50).r).toBe(19) // 19/50 = 0.38
    expect(optimalCutoff(100).r).toBe(38) // 38/100 = 0.38
    // The ratio r*/n hugs 1/e ≈ 0.3679 from above as n grows.
    for (const n of [20, 30, 50, 100]) {
      const x = optimalCutoff(n).r / n
      expect(x, `r*/n for n=${n}`).toBeGreaterThan(0.34)
      expect(x, `r*/n for n=${n}`).toBeLessThan(0.41)
    }
  })

  it('successCurve(4) = [1/4, 11/24, 5/12, 1/4]', () => {
    expect(successCurve(4).map(formatRational)).toEqual(['1/4', '11/24', '5/12', '1/4'])
  })

  it('secretarySuccess matches brute-force enumeration for all n≤7, all r', () => {
    for (let n = 1; n <= 7; n++) {
      const all = perms(Array.from({ length: n }, (_, i) => i + 1))
      for (let r = 1; r <= n; r++) {
        const wins = all.filter((o) => runStrategy(o, r).win).length
        const brute = formatRational(reduce(BigInt(wins), BigInt(all.length)))
        expect(formatRational(secretarySuccess(n, r)), `n=${n}, r=${r}`).toBe(brute)
      }
    }
  })

  it('take-first (cutoff 1) wins exactly (n-1)!/n! = 1/n', () => {
    for (const n of [3, 4, 5]) {
      const all = perms(Array.from({ length: n }, (_, i) => i + 1))
      const wins = all.filter((o) => runStrategy(o, 1).win).length
      expect(formatRational(reduce(BigInt(wins), BigInt(all.length)))).toBe(`1/${n}`)
    }
  })

  it('runStrategy replays the look-then-leap rule deterministically', () => {
    // n=3, take-first: best at position 2 → grabs position 1 (rank 2), miss.
    expect(runStrategy([2, 1, 3], 1)).toEqual({ selectedIndex: 0, selectedRank: 2, win: false })
    // n=3, cutoff 2: observe rank 2, then accept the first better → position 2 (rank 1), win.
    expect(runStrategy([2, 1, 3], 2)).toEqual({ selectedIndex: 1, selectedRank: 1, win: true })
    // Fell through (best was in the look phase) → forced to take the last candidate.
    expect(runStrategy([1, 2, 3], 2)).toEqual({ selectedIndex: 2, selectedRank: 3, win: false })
  })

  it('rejects malformed input', () => {
    expect(() => secretarySuccess(3, 0)).toThrow()
    expect(() => secretarySuccess(3, 4)).toThrow()
    expect(() => runStrategy([1, 2, 2], 1)).toThrow() // not a permutation
    expect(() => runStrategy([1, 2, 3], 9)).toThrow()
  })
})
