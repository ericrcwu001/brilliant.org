// Pure, dependency-free, EXACT combinatorics engine (BigInt — NO floats); the
// verifying engine for the Combinatorics concept (lesson-combinatorics-1..6).
// Convention (Wave-0 frozen contract): number-in / bigint-out for the counting
// functions; `reduce` is bigint-in / bigint-out. Mirrors the exact-arithmetic
// discipline of src/engine/automaton.ts. Goldens are cross-checked in
// combinatorics.test.ts and (Stage 2) by scripts/validate-fixtures.ts.

function bgcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b
  while (y) {
    ;[x, y] = [y, x % y]
  }
  return x || 1n
}

// n! — factorial(0) = 1n. Throws on a negative or non-integer n.
export function factorial(n: number): bigint {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`factorial: expected a non-negative integer, got ${n}`)
  }
  let acc = 1n
  for (let i = 2; i <= n; i++) acc *= BigInt(i)
  return acc
}

// nPk = n·(n−1)·…·(n−k+1) = n!/(n−k)! (ordered selection of k from n).
// Out-of-range (k<0, n<0, k>n) → 0n; k=0 → 1n.
export function nPk(n: number, k: number): bigint {
  if (!Number.isInteger(n) || !Number.isInteger(k)) {
    throw new Error(`nPk: expected integers, got n=${n}, k=${k}`)
  }
  if (k < 0 || n < 0 || k > n) return 0n
  let acc = 1n
  for (let i = 0; i < k; i++) acc *= BigInt(n - i)
  return acc
}

// nCk = n!/(k!·(n−k)!) (unordered selection). Out-of-range → 0n.
export function nCk(n: number, k: number): bigint {
  if (!Number.isInteger(n) || !Number.isInteger(k)) {
    throw new Error(`nCk: expected integers, got n=${n}, k=${k}`)
  }
  if (k < 0 || n < 0 || k > n) return 0n
  // Use the smaller of k, n−k to keep the running product small; exact division.
  const kk = k > n - k ? n - k : k
  let num = 1n
  for (let i = 0; i < kk; i++) num *= BigInt(n - i)
  return num / factorial(kk)
}

// Multiplication rule: product of per-step option counts. product([]) = 1n.
export function product(opts: number[]): bigint {
  let acc = 1n
  for (const o of opts) {
    if (!Number.isInteger(o)) {
      throw new Error(`product: expected integer options, got ${o}`)
    }
    acc *= BigInt(o)
  }
  return acc
}

// Row n of Pascal's triangle: [C(n,0), C(n,1), …, C(n,n)].
export function pascalRow(n: number): bigint[] {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`pascalRow: expected a non-negative integer, got ${n}`)
  }
  const row: bigint[] = []
  for (let k = 0; k <= n; k++) row.push(nCk(n, k))
  return row
}

// |A∪B| = |A| + |B| − |A∩B| (two-set inclusion–exclusion).
export function unionSize(a: number, b: number, ab: number): bigint {
  return BigInt(a) + BigInt(b) - BigInt(ab)
}

// General signed inclusion–exclusion sum: Σ sign·size.
export function inclusionExclusion(
  terms: { size: number; sign: 1 | -1 }[],
): bigint {
  let acc = 0n
  for (const { size, sign } of terms) acc += BigInt(sign) * BigInt(size)
  return acc
}

// Derangements (no fixed point): D0=1, D1=0, Dn=(n−1)(D_{n−1}+D_{n−2}).
export function derangements(n: number): bigint {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`derangements: expected a non-negative integer, got ${n}`)
  }
  if (n === 0) return 1n
  if (n === 1) return 0n
  let prev = 1n // D0
  let cur = 0n // D1
  for (let i = 2; i <= n; i++) {
    const next = BigInt(i - 1) * (cur + prev)
    prev = cur
    cur = next
  }
  return cur
}

// Pigeonhole guaranteed minimum: ⌈items/holes⌉ (integer ceiling — no float).
export function pigeonholeMin(items: number, holes: number): number {
  if (!Number.isInteger(items) || !Number.isInteger(holes) || holes <= 0) {
    throw new Error(
      `pigeonholeMin: need integer items and holes>0, got items=${items}, holes=${holes}`,
    )
  }
  return Math.floor((items + holes - 1) / holes)
}

// Pigeonhole existence trigger: more items than holes forces a repeat.
export function forcesCollision(items: number, holes: number): boolean {
  return items > holes
}

// Reduce a bigint fraction to lowest terms; denominator normalized positive.
export function reduce(n: bigint, d: bigint): { n: bigint; d: bigint } {
  if (d === 0n) throw new Error('reduce: denominator must be non-zero')
  let nn = n
  let dd = d
  if (dd < 0n) {
    nn = -nn
    dd = -dd
  }
  const g = bgcd(nn, dd)
  return { n: nn / g, d: dd / g }
}

// count→probability bridge: the reduced favorable/total fraction.
export function probabilityFromCounts(
  fav: number,
  total: number,
): { n: bigint; d: bigint } {
  return reduce(BigInt(fav), BigInt(total))
}
