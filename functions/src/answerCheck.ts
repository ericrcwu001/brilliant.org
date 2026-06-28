// Deterministic answer comparator for the Capstone correctness anchor.
//
// Mentor feedback: the interview rubric's `correctness` row is LLM-graded, which
// can flatter or err. This module lets gradeInterview() OVERRIDE that row with a
// deterministic check — the candidate's stated final answer against the
// engine-verified ground truth (each question's `engineCheck.answer`, which the
// src/engine/interviewPack.*.test.ts factcheck tests reproduce from the engine).
//
// functions/ is a separate CommonJS project and CANNOT import src/engine, so this
// is a small self-contained re-implementation of the engine's exact-rational
// canonicalization (mirrors `reduce` / `formatRational` in src/engine/*.ts).
//
// SCOPE: scalar rationals ONLY — integers ("10"), fractions ("1/2", "-1/12"),
// terminating decimals ("0.5" -> 1/2), and percents ("50%" -> 1/2). This is
// exactly the recurrence / hitting-time / posterior answer the mentor named and
// ~2/3 of the capstone pool. Anything non-scalar (vector "1/3,1/3,1/3",
// multi-part prose, "1/e ≈ 0.368" approximations) returns null, and the
// comparison reports 'na' — the LLM's correctness score stands. Reporting 'na'
// rather than guessing is deliberate: under a hard override a misparse must
// never force a wrong score.

export type Canonical = { n: number; d: number }

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    const t = a % b
    a = b
    b = t
  }
  return a || 1
}

// Reduce to lowest terms with a positive denominator (matches src/engine reduce).
function reduce(n: number, d: number): Canonical | null {
  if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) return null
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d)
  return { n: n / g || 0, d: d / g } // `|| 0` normalizes -0 to 0
}

/**
 * Parse a SINGLE scalar answer to a reduced rational, or null if the string is
 * not an unambiguous single scalar. Accepts integers, "a/b" fractions,
 * terminating decimals, and a trailing-percent form of any of those. Rejects
 * everything else (vectors, ranges, multi-part prose, approximations, units) so
 * the hard override can never fire on an ambiguous value.
 */
export function parseCanonical(input: string): Canonical | null {
  if (typeof input !== 'string') return null
  const s = input.trim()
  if (s === '') return null

  // Trailing percent: "50%" -> 50/100 -> 1/2. Recurse on the numeric part.
  const pct = s.match(/^(.+)%$/)
  if (pct) {
    const base = parseCanonical(pct[1].trim())
    return base == null ? null : reduce(base.n, base.d * 100)
  }

  // Integer or fraction: "a" or "a/b".
  const frac = s.match(/^(-?\d+)(?:\/(-?\d+))?$/)
  if (frac) {
    const n = parseInt(frac[1], 10)
    const d = frac[2] != null ? parseInt(frac[2], 10) : 1
    return reduce(n, d)
  }

  // Terminating decimal: "-?D.D".
  const dec = s.match(/^(-?)(\d+)\.(\d+)$/)
  if (dec) {
    const sign = dec[1] === '-' ? -1 : 1
    const denom = Math.pow(10, dec[3].length)
    const numer = parseInt(dec[2] + dec[3], 10)
    if (!Number.isSafeInteger(numer) || !Number.isSafeInteger(denom)) return null
    return reduce(sign * numer, denom)
  }

  return null
}

export type AnswerVerdict = 'match' | 'mismatch' | 'na'

/**
 * Compare a candidate's extracted final answer against the engine-canonical
 * ground truth. Returns 'na' whenever either side is not a clean scalar — in
 * that case the anchor does not apply and the LLM's correctness score stands.
 */
export function compareAnswers(
  expected: string,
  extracted: string | null | undefined,
): AnswerVerdict {
  if (extracted == null) return 'na'
  const e = parseCanonical(expected)
  const c = parseCanonical(extracted)
  if (e == null || c == null) return 'na'
  return e.n === c.n && e.d === c.d ? 'match' : 'mismatch'
}
