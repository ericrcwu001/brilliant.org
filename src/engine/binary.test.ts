import { describe, it, expect } from 'vitest'
import {
  toBinary,
  fromBinary,
  powersOfTwo,
  popcount,
  isPowerOfTwo,
  isPowerOfFour,
  xorAll,
  missingNumber,
  multiplyByShift,
  bitsNeeded,
  weighingsForN,
  bachetWeights,
  balancedTernary,
  eggDrops,
  binaryExpansion,
} from './binary'

// Every assertion below pins an exact answer from
// concepts/binary-information/source-dossier.md (the Stage-2 math-fact-check
// goldens). No floats anywhere.

describe('binary representation — GB6 / S17', () => {
  it('toBinary(1000) = "1111101000"', () => {
    expect(toBinary(1000n)).toBe('1111101000')
  })
  it('fromBinary("1111101000") = 1000', () => {
    expect(fromBinary('1111101000')).toBe(1000n)
  })
  it('toBinary / fromBinary round-trip', () => {
    for (const n of [0n, 1n, 2n, 5n, 16n, 100n, 1000n, 1024n, 1000000n]) {
      expect(fromBinary(toBinary(n))).toBe(n)
    }
  })
  it('toBinary(100) = "1100100" (S17)', () => {
    expect(toBinary(100n)).toBe('1100100')
  })
  it('toBinary(0) = "0"', () => {
    expect(toBinary(0n)).toBe('0')
  })
  it('powersOfTwo(1000) = [512,256,128,64,32,8] and sums to 1000', () => {
    // dossier: 1000 = 2^9+2^8+2^7+2^6+2^5+2^3 = 512+256+128+64+32+8
    const ps = powersOfTwo(1000n)
    expect(ps).toEqual([512n, 256n, 128n, 64n, 32n, 8n]) // largest power first
    expect(ps.reduce((a, b) => a + b, 0n)).toBe(1000n)
  })
  it('powersOfTwo of the gold rod (S1): 7 = [4,2,1]', () => {
    expect(powersOfTwo(7n)).toEqual([4n, 2n, 1n]) // 2 cuts → pieces 1,2,4
  })
  it('powersOfTwo(0) = []', () => {
    expect(powersOfTwo(0n)).toEqual([])
  })
})

describe('popcount — S13', () => {
  it('popcount(11) = 3  (1011)', () => {
    expect(popcount(11n)).toBe(3)
  })
  it('popcount(1000) = 6  (six set bits)', () => {
    expect(popcount(1000n)).toBe(6)
  })
  it('popcount(128) = 1', () => {
    expect(popcount(128n)).toBe(1)
  })
  it('popcount(0) = 0', () => {
    expect(popcount(0n)).toBe(0)
  })
})

describe('power-of-two / power-of-four tests — GB1·S12 / S16', () => {
  it('isPowerOfTwo: 16→true, 5→false, 1→true, 0→false', () => {
    expect(isPowerOfTwo(16n)).toBe(true)
    expect(isPowerOfTwo(5n)).toBe(false)
    expect(isPowerOfTwo(1n)).toBe(true)
    expect(isPowerOfTwo(0n)).toBe(false)
  })
  it('isPowerOfFour: 16→true, 8→false, 64→true', () => {
    expect(isPowerOfFour(16n)).toBe(true) // 4^2
    expect(isPowerOfFour(8n)).toBe(false) // 2^3, odd bit position
    expect(isPowerOfFour(64n)).toBe(true) // 4^3
  })
  it('isPowerOfFour edge cases: 1→true, 4→true, 5→false, 0→false', () => {
    expect(isPowerOfFour(1n)).toBe(true) // 4^0
    expect(isPowerOfFour(4n)).toBe(true) // 4^1
    expect(isPowerOfFour(5n)).toBe(false)
    expect(isPowerOfFour(0n)).toBe(false)
  })
})

describe('XOR — single-number S11 / missing-number S15', () => {
  it('xorAll([2,2,1]) = 1 (single number)', () => {
    expect(xorAll([2n, 2n, 1n])).toBe(1n)
  })
  it('xorAll([4,1,2,1,2]) = 4 (single number)', () => {
    expect(xorAll([4n, 1n, 2n, 1n, 2n])).toBe(4n)
  })
  it('missing-number via xor of [0..n] with [3,0,1] = 2', () => {
    // n = 3; XOR of indices 0..3 with the values [3,0,1] yields the missing 2.
    const values = [3n, 0n, 1n]
    const n = BigInt(values.length)
    let acc = 0n
    for (let i = 0n; i <= n; i++) acc ^= i
    expect(acc ^ xorAll(values)).toBe(2n)
  })
  it('missingNumber([3,0,1]) = 2 and missingNumber([9,6,4,2,3,5,7,0,1]) = 8', () => {
    expect(missingNumber([3n, 0n, 1n])).toBe(2n)
    expect(missingNumber([9n, 6n, 4n, 2n, 3n, 5n, 7n, 0n, 1n])).toBe(8n)
  })
})

describe('bitsNeeded = ⌈log₂N⌉ — S2/S3/S4', () => {
  it('bitsNeeded(100) = 7  (2^7=128 ≥ 100)', () => {
    expect(bitsNeeded(100n)).toBe(7)
  })
  it('bitsNeeded(1000) = 10  (2^10=1024)', () => {
    expect(bitsNeeded(1000n)).toBe(10)
  })
  it('bitsNeeded(1_000_000) = 20  (2^20=1,048,576)', () => {
    expect(bitsNeeded(1000000n)).toBe(20)
  })
  it('bitsNeeded(500) = 9  (held-out transfer)', () => {
    expect(bitsNeeded(500n)).toBe(9)
  })
  it('bitsNeeded(1024) = 10  (exact power: 2^10 = 1024 ≥ 1024)', () => {
    expect(bitsNeeded(1024n)).toBe(10)
  })
  it('bitsNeeded(1) = 0  (one outcome needs no question)', () => {
    expect(bitsNeeded(1n)).toBe(0)
  })
  it('bitsNeeded at the 2^k boundaries', () => {
    expect(bitsNeeded(2n)).toBe(1)
    expect(bitsNeeded(3n)).toBe(2)
    expect(bitsNeeded(4n)).toBe(2)
    expect(bitsNeeded(5n)).toBe(3)
  })
})

describe('multiply-by-shift — GB2', () => {
  it('multiplyByShift(x,3) = 8x and (·) − x = 7x', () => {
    for (const x of [0n, 1n, 5n, 7n, 13n, 1000n, -3n]) {
      expect(multiplyByShift(x, 3)).toBe(8n * x)
      expect(multiplyByShift(x, 3) - x).toBe(7n * x) // GB2 identity: 7x without a `*`
    }
  })
  it('multiplyByShift(x,0)=x, (x,1)=2x', () => {
    expect(multiplyByShift(9n, 0)).toBe(9n)
    expect(multiplyByShift(9n, 1)).toBe(18n)
  })
})

describe('balance weighings — base-3 (GB5 / S9 / S5 / S6)', () => {
  it('weighingsForN(12,false) = 3  ((3^3−3)/2 = 12 ≥ 12)', () => {
    expect(weighingsForN(12n, false)).toBe(3)
  })
  it('weighingsForN(13,false) = 4  (12-ball capacity exceeded at n=3)', () => {
    // boundary: (3^3−3)/2 = 12 < 13, so N=13 needs n=4 ((3^4−3)/2 = 39 ≥ 13)
    expect(weighingsForN(13n, false)).toBe(4)
  })
  it('weighingsForN(9,true) = 2  (3^2 = 9 ≥ 9) — S5 nine balls, heavier', () => {
    expect(weighingsForN(9n, true)).toBe(2)
  })
  it('weighingsForN(8,true) = 2  (⌈log₃8⌉ = 2) — S6 eight balls', () => {
    expect(weighingsForN(8n, true)).toBe(2)
  })
  it('weighingsForN(27,true) = 3  (3^3 = 27 ≥ 27)', () => {
    expect(weighingsForN(27n, true)).toBe(3)
  })
  it('weighingsForN(28,true) = 4  (3^3 = 27 < 28)', () => {
    expect(weighingsForN(28n, true)).toBe(4)
  })
})

describe("Bachet's weights — S10", () => {
  it('bachetWeights(40) = [1,3,9,27]  (balanced ternary, (3^4−1)/2 = 40)', () => {
    expect(bachetWeights(40n)).toEqual([1n, 3n, 9n, 27n])
  })
  it('bachetWeights covers the exact (3^k−1)/2 thresholds', () => {
    expect(bachetWeights(1n)).toEqual([1n]) // reach 1
    expect(bachetWeights(4n)).toEqual([1n, 3n]) // reach (3^2−1)/2 = 4
    expect(bachetWeights(13n)).toEqual([1n, 3n, 9n]) // reach 13
    expect(bachetWeights(41n)).toEqual([1n, 3n, 9n, 27n, 81n]) // 40 < 41 ≤ 121
  })
})

describe('balanced ternary — S10 / L4 weighing readout', () => {
  it('balancedTernary(22, [27,9,3,1]) = "+1,-1,+1,+1"  (27−9+3+1 = 22)', () => {
    expect(balancedTernary(22n, [27n, 9n, 3n, 1n])).toBe('+1,-1,+1,+1')
  })
  it('coefficients reconstruct the target', () => {
    const weights = [27n, 9n, 3n, 1n]
    for (const target of [0n, 1n, 5n, 13n, 22n, 40n, -22n, -40n]) {
      const coeffs = balancedTernary(target, weights).split(',').map((s) => BigInt(s))
      const sum = coeffs.reduce((acc, c, i) => acc + c * weights[i], 0n)
      expect(sum).toBe(target)
    }
  })
  it('every mass 1..40 is representable by [27,9,3,1] (Bachet)', () => {
    const weights = [27n, 9n, 3n, 1n]
    for (let m = 1n; m <= 40n; m++) {
      const coeffs = balancedTernary(m, weights).split(',').map((s) => BigInt(s))
      expect(coeffs.reduce((acc, c, i) => acc + c * weights[i], 0n)).toBe(m)
    }
  })
  it('endpoints and a single positive weight', () => {
    expect(balancedTernary(0n, [27n, 9n, 3n, 1n])).toBe('0,0,0,0')
    expect(balancedTernary(40n, [27n, 9n, 3n, 1n])).toBe('+1,+1,+1,+1') // 27+9+3+1
    expect(balancedTernary(1n, [1n])).toBe('+1')
  })
  it('throws when the mass exceeds the weight set', () => {
    expect(() => balancedTernary(41n, [27n, 9n, 3n, 1n])).toThrow()
  })
})

describe('two-egg drops — S7 (triangular threshold)', () => {
  it('eggDrops(100) = 14  (smallest x with x(x+1)/2 ≥ 100; 14·15/2 = 105)', () => {
    expect(eggDrops(100n)).toBe(14)
  })
  it('eggDrops boundaries', () => {
    expect(eggDrops(1n)).toBe(1) // 1·2/2 = 1
    expect(eggDrops(3n)).toBe(2) // 2·3/2 = 3
    expect(eggDrops(105n)).toBe(14) // exactly 105
    expect(eggDrops(106n)).toBe(15) // needs one more
  })
})

describe('fair-coin probability expansion — GB4 (rational, terminating-binary exact)', () => {
  it('1/4 = "0.01" (terminating, exact)', () => {
    expect(binaryExpansion({ n: 1, d: 4 })).toBe('0.01')
  })
  it('1/2 = "0.1", 3/4 = "0.11", 3/8 = "0.011"', () => {
    expect(binaryExpansion({ n: 1, d: 2 })).toBe('0.1')
    expect(binaryExpansion({ n: 3, d: 4 })).toBe('0.11')
    expect(binaryExpansion({ n: 3, d: 8 })).toBe('0.011')
  })
  it('endpoints 0 and 1', () => {
    expect(binaryExpansion({ n: 0, d: 1 })).toBe('0')
    expect(binaryExpansion({ n: 1, d: 1 })).toBe('1')
  })
  it('1/3 = "0.0101…" truncated to maxBits (non-terminating)', () => {
    expect(binaryExpansion({ n: 1, d: 3 }, 8)).toBe('0.01010101')
  })
})
