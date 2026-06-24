// L6 Overlap Shortcut engine (pure). For a FAIR coin, the expected wait for a
// pattern equals the sum of 2^k over every self-overlap length k (a length where
// the k-prefix equals the k-suffix, including the full pattern):
//
//     E[wait] = Σ 2^k  over borders k of the pattern.
//
// A fair-betting martingale proves it: at the first occurrence, the surviving
// parlaying gamblers are exactly the borders, paying 2^k each, while money in =
// the wait T; fairness ⇒ E[T] = Σ 2^k. Cross-checked against buildAutomaton.E0.

import { prefixFunction } from './automaton'

export type Correlation = {
  // bits[k-1] = 1 iff the length-k suffix of v equals the length-k prefix of w
  // (k = 1..min(|v|,|w|)). For v === w these are the pattern's self-overlaps.
  bits: number[]
  // The lengths k with bits set (the overlap/border lengths).
  overlaps: number[]
}

export function correlation(v: string, w: string): Correlation {
  const n = Math.min(v.length, w.length)
  const bits: number[] = []
  const overlaps: number[] = []
  for (let k = 1; k <= n; k++) {
    const hit = v.slice(v.length - k) === w.slice(0, k) ? 1 : 0
    bits.push(hit)
    if (hit) overlaps.push(k)
  }
  return { bits, overlaps }
}

export type Autocorrelation = Correlation & { sum: number }

// Self-overlap of a pattern (fair coin): the borders + their 2^k running sum.
export function autocorrelation(pattern: string): Autocorrelation {
  const { bits, overlaps } = correlation(pattern, pattern)
  const sum = overlaps.reduce((acc, k) => acc + 2 ** k, 0)
  return { bits, overlaps, sum }
}

// E[wait] for a fair coin = Σ 2^k over the pattern's borders. Equals
// buildAutomaton(pattern, 0.5).expectedTimes.E0 for every pattern (golden).
export function expectedWaitFair(pattern: string): number {
  return autocorrelation(pattern).sum
}

export type LedgerRow = {
  // A surviving gambler at the stop: started so that its matched run is the
  // length-k border, holding a doubled parlay worth 2^k.
  matchedLength: number
  parlay: number
}

// Fair-betting martingale ledger over a stream that ends at the pattern's first
// occurrence. Surviving gamblers = the pattern's borders; payout = Σ 2^k (= the
// expected wait); money in = the wait T (flips until first occurrence).
export function gamblerLedger(
  pattern: string,
  stream: string,
): { rows: LedgerRow[]; payout: number; moneyIn: number } {
  const rows: LedgerRow[] = autocorrelation(pattern).overlaps.map((k) => ({
    matchedLength: k,
    parlay: 2 ** k,
  }))
  const payout = rows.reduce((acc, r) => acc + r.parlay, 0)
  return { rows, payout, moneyIn: firstOccurrence(pattern, stream) }
}

// 1-based index of the flip on which `pattern` first fully appears in `stream`
// (KMP), or stream.length if it never completes.
function firstOccurrence(pattern: string, stream: string): number {
  const pi = prefixFunction(pattern)
  let k = 0
  for (let i = 0; i < stream.length; i++) {
    const c = stream[i]
    while (k > 0 && c !== pattern[k]) k = pi[k - 1]
    if (c === pattern[k]) k++
    if (k === pattern.length) return i + 1
  }
  return stream.length
}
