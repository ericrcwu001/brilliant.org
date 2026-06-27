// Pure, dependency-free, EXACT (BigInt — NO floats) engine for the
// "Binary & Information" concept (lesson-binary-information-1..6). It reproduces
// every exact answer in concepts/binary-information/source-dossier.md: binary
// representation, the power-of-2 / power-of-4 bit tests, popcount, XOR
// (single-number / missing-number), multiply-by-shift, the ⌈log₂N⌉ information
// bound, the base-3 balance bound, and Bachet's balanced-ternary weight set.
// Mirrors the exact-arithmetic discipline of src/engine/optimalStopping.ts and
// src/engine/gameTheory.ts: BigInt integers, an optional {n,d} rational only for
// the fair-coin probability expansion, and NEVER Math.log / Math.pow / floats —
// ⌈log₂N⌉ and ⌈log₃N⌉ are computed by repeated multiplication on bigint.
// Goldens live in binary.test.ts and (Stage 2) cross-checked by validate-fixtures.ts.
//
// Source anchor: Green Book (Xinfeng Zhou, *A Practical Guide To Quantitative
// Finance Interviews*) §7.2 "The Power of Two" p.92 and Ch.2 "Brain Teasers"
// (defective ball) p.4–5; secondary quant/SWE-interview look-alikes (LeetCode
// 136/231/191/342/268, Bachet's weights, the secretary of weighings bound).

import type { Rational } from './types'

// ── small exact helpers ───────────────────────────────────────────────────────

function assertNonNegative(n: bigint, name: string): void {
  if (n < 0n) throw new Error(`${name}: expected a non-negative integer, got ${n}`)
}

// ── binary representation (GB6 / S17) ──────────────────────────────────────────

// Big-endian binary string of n (no "0b" prefix); toBinary(0n) === "0".
export function toBinary(n: bigint): string {
  assertNonNegative(n, 'toBinary')
  if (n === 0n) return '0'
  let s = ''
  let x = n
  while (x > 0n) {
    s = (x & 1n ? '1' : '0') + s
    x >>= 1n
  }
  return s
}

// Inverse of toBinary: parse a big-endian binary string of '0'/'1' to a bigint.
export function fromBinary(s: string): bigint {
  if (s.length === 0 || !/^[01]+$/.test(s)) {
    throw new Error(`fromBinary: expected a non-empty string of 0/1, got "${s}"`)
  }
  let n = 0n
  for (const ch of s) n = (n << 1n) | (ch === '1' ? 1n : 0n)
  return n
}

// The distinct powers of two that sum to n (its set bits), largest first.
// powersOfTwo(1000n) = [512, 256, 128, 64, 32, 8]; powersOfTwo(0n) = [].
export function powersOfTwo(n: bigint): bigint[] {
  assertNonNegative(n, 'powersOfTwo')
  const out: bigint[] = []
  let bit = 0n
  let x = n
  while (x > 0n) {
    if (x & 1n) out.push(1n << bit)
    x >>= 1n
    bit += 1n
  }
  return out.reverse() // largest power first
}

// ── popcount / power-of-k tests (S13 / GB1·S12 / S16) ──────────────────────────

// Hamming weight (number of set bits) via Kernighan's n & (n−1) clear-lowest-bit.
export function popcount(n: bigint): number {
  assertNonNegative(n, 'popcount')
  let count = 0
  let x = n
  while (x > 0n) {
    x &= x - 1n // clear the lowest set bit
    count += 1
  }
  return count
}

// True ⇔ n is a power of two (n > 0 and a single set bit). GB1 / LeetCode 231.
export function isPowerOfTwo(n: bigint): boolean {
  return n > 0n && (n & (n - 1n)) === 0n
}

// True ⇔ n is a power of four: a power of two whose single set bit is in an even
// position (2^0, 2^2, 2^4, …). LeetCode 342. e.g. 16 → true, 8 → false, 64 → true.
export function isPowerOfFour(n: bigint): boolean {
  if (!isPowerOfTwo(n)) return false
  // position of the single set bit must be even
  let pos = 0
  let x = n
  while (x > 1n) {
    x >>= 1n
    pos += 1
  }
  return pos % 2 === 0
}

// ── XOR (single-number / missing-number, S11 / S15) ────────────────────────────

// XOR of all elements; the "single number" answer (every other value cancels).
export function xorAll(xs: bigint[]): bigint {
  return xs.reduce((acc, x) => acc ^ x, 0n)
}

// Missing-number (LeetCode 268): with `values` a subset of [0..n] missing exactly
// one, the missing value = (XOR of 0..n) ⊕ (XOR of the values). n = values.length.
export function missingNumber(values: bigint[]): bigint {
  const n = BigInt(values.length)
  let acc = 0n
  for (let i = 0n; i <= n; i++) acc ^= i
  return acc ^ xorAll(values)
}

// ── multiply-by-shift (GB2) ────────────────────────────────────────────────────

// x · 2^k via a left shift (k ≥ 0). multiplyByShift(x, 3) = 8x, and the GB2
// identity multiplyByShift(x, 3) − x = 7x multiplies by 7 without a `*`.
export function multiplyByShift(x: bigint, k: number): bigint {
  if (!Number.isInteger(k) || k < 0) {
    throw new Error(`multiplyByShift: shift k must be a non-negative integer, got ${k}`)
  }
  return x << BigInt(k)
}

// ── information bounds (S2/S3/S4 ⌈log₂N⌉; GB5/S9 base-3) ────────────────────────

// ⌈log₂N⌉ — the minimum bits / yes-no questions to distinguish N outcomes: the
// smallest k with 2^k ≥ N. bitsNeeded(1n) = 0. Computed by repeated doubling on
// bigint (NO Math.log). bitsNeeded(100n)=7, bitsNeeded(1000n)=10, 10^6 → 20.
export function bitsNeeded(N: bigint): number {
  if (N < 1n) throw new Error(`bitsNeeded: N must be ≥ 1, got ${N}`)
  let k = 0
  let pow = 1n // 2^k
  while (pow < N) {
    pow <<= 1n
    k += 1
  }
  return k
}

// Minimum balance weighings to find one defective among N items (base-3, since a
// balance answers 3 ways: left<right / balance / left>right).
//   directionKnown = true  ⇒ smallest n with 3^n ≥ N            (defect known heavy/light)
//   directionKnown = false ⇒ smallest n with (3^n − 3)/2 ≥ N    (GB5 unknown-direction bound)
// Computed by repeated ×3 on bigint (NO Math.log). e.g. weighingsForN(12, false)=3,
// weighingsForN(13, false)=4, weighingsForN(9, true)=2, weighingsForN(27, true)=3.
export function weighingsForN(N: bigint, directionKnown: boolean): number {
  if (N < 1n) throw new Error(`weighingsForN: N must be ≥ 1, got ${N}`)
  let n = 0
  let pow = 1n // 3^n
  for (;;) {
    const capacity = directionKnown ? pow : (pow - 3n) / 2n
    if (capacity >= N) return n
    pow *= 3n
    n += 1
  }
}

// ── Bachet's weights (S10) ─────────────────────────────────────────────────────

// The minimal balanced-ternary weight set (powers of 3) that weighs every integer
// mass 1..maxMass on a two-pan balance (weights allowed on either pan, so each
// digit ∈ {−1,0,+1}). With weights {3^0,…,3^(k−1)} the reachable range is
// 1..(3^k−1)/2, so include powers of 3 until that range covers maxMass.
// bachetWeights(40n) = [1, 3, 9, 27]  ((3^4−1)/2 = 40).
export function bachetWeights(maxMass: bigint): bigint[] {
  if (maxMass < 1n) throw new Error(`bachetWeights: maxMass must be ≥ 1, got ${maxMass}`)
  const weights: bigint[] = []
  let pow = 1n // 3^k currently being considered
  let reach = 0n // (3^k − 1)/2 with the weights collected so far
  while (reach < maxMass) {
    weights.push(pow)
    reach += pow // (3^(k+1) − 1)/2 = (3^k − 1)/2 + 3^k
    pow *= 3n
  }
  return weights
}

// Signed balanced-ternary coefficients of `target` over the given `weights`
// (powers of 3, e.g. bachetWeights(...)), high→low, comma-joined with explicit
// sign: each coefficient ∈ {−1,0,+1} placing that weight on the opposite pan
// (−1), off (0), or the same pan as the mass (+1). The weights must be given
// high→low; Σ coeff_i · weight_i = target. Pure/exact (bigint), NO floats.
// e.g. balancedTernary(22n, [27n,9n,3n,1n]) = "+1,-1,+1,+1"  (27−9+3+1 = 22).
export function balancedTernary(target: bigint, weights: bigint[]): string {
  // Greedy from the largest weight: each step the running remainder is reduced
  // toward 0. With genuine powers of 3 in descending order this yields the unique
  // balanced-ternary representation (each digit ∈ {−1,0,+1}).
  const coeffs: bigint[] = []
  let rem = target
  for (const w of weights) {
    if (w <= 0n) throw new Error(`balancedTernary: weights must be positive, got ${w}`)
    let c = 0n
    if (rem > 0n && 2n * rem >= w) c = 1n
    else if (rem < 0n && 2n * -rem >= w) c = -1n
    coeffs.push(c)
    rem -= c * w
  }
  if (rem !== 0n) {
    throw new Error(
      `balancedTernary: ${target} not representable by weights [${weights.join(',')}] (remainder ${rem})`,
    )
  }
  return coeffs.map((c) => (c > 0n ? '+1' : c < 0n ? '-1' : '0')).join(',')
}

// ── triangular threshold (S7: 2 eggs, F floors) ────────────────────────────────

// Minimum worst-case drops in the 2-egg, F-floor problem: the smallest x with
// x(x+1)/2 ≥ F. eggDrops(100n) = 14. (Exact integer arithmetic, no floats.)
export function eggDrops(floors: bigint): number {
  if (floors < 1n) throw new Error(`eggDrops: floors must be ≥ 1, got ${floors}`)
  let x = 0n
  let tri = 0n // x(x+1)/2
  while (tri < floors) {
    x += 1n
    tri += x
  }
  return Number(x)
}

// ── fair-coin probability expansion (GB4, optional/rational) ───────────────────

// Binary expansion of a rational p ∈ [0,1) as "0.b1b2…" up to `maxBits` bits
// (default 64): toss a fair coin per bit (GB4). Terminating-binary p (e.g. 1/4 =
// "0.01") stops early and is EXACT; non-terminating p is truncated to maxBits.
// Returns "0" for p = 0, "1" for p = 1. Uses only bigint numerator/denominator.
export function binaryExpansion(p: Rational, maxBits = 64): string {
  if (!Number.isInteger(maxBits) || maxBits < 1) {
    throw new Error(`binaryExpansion: maxBits must be a positive integer, got ${maxBits}`)
  }
  // Normalize to non-negative numerator/positive denominator.
  let num = BigInt(p.n)
  let den = BigInt(p.d)
  if (den === 0n) throw new Error('binaryExpansion: denominator must be non-zero')
  if (den < 0n) {
    num = -num
    den = -den
  }
  if (num < 0n || num > den) {
    throw new Error(`binaryExpansion: p must be in [0,1], got ${p.n}/${p.d}`)
  }
  if (num === 0n) return '0'
  if (num === den) return '1'
  let bits = ''
  let r = num
  for (let i = 0; i < maxBits && r !== 0n; i++) {
    r <<= 1n
    if (r >= den) {
      bits += '1'
      r -= den
    } else {
      bits += '0'
    }
  }
  return `0.${bits}`
}
