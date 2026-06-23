// Pure, dependency-free grader for the equation-tiles beat. The learner builds
// each graded row as an ordered sequence of token strings ("<kind>:<value>",
// kinds: const | op | prob | var) matching the PRD snapshot format, e.g. for
// HH E0: ["const:1","op:+","prob:1/2","var:E1","op:+","prob:1/2","var:E0"]. The
// LHS "Ei =" is static chrome and is NOT part of the sequence.
//
// We parse the sequence into a normalized canonical form (sum of a constant and
// a multiset of coeff·var terms) and compare it to a CanonicalRecurrence target.
// Additive reordering is accepted. No side effects.
//
// Inputs are typed structurally (string-valued ids) so both the engine's nominal
// `CanonicalRecurrence`/`EquationRow` (StateId-keyed) and the Zod-inferred
// content-schema shapes satisfy them — keeping this module import-free.

type Rational = { n: number; d: number }
type TargetTerm = { coeff: Rational; var: string }
export type Recurrence = { constant: number; terms: TargetTerm[] }
export type GradedRow = { lhs: string; target: Recurrence; graded: boolean }

export type RowCheck =
  | { ok: true }
  | {
      ok: false
      reason: 'incomplete' | 'wrong-constant' | 'wrong-var' | 'wrong-coeff' | 'malformed'
    }

type ParsedToken = { kind: string; value: string }

function parseToken(tok: string): ParsedToken | null {
  const i = tok.indexOf(':')
  if (i < 0) return null
  return { kind: tok.slice(0, i), value: tok.slice(i + 1) }
}

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}

function reduceRat(r: Rational): Rational {
  let { n, d } = r
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d)
  return { n: n / g, d: d / g }
}

// Only '1/2' is gradable in the MVP scope; 'p' / '1-p' are not (return null so
// the comparison reports a coefficient mismatch instead of crashing).
function probToRational(value: string): Rational | null {
  if (value === '1/2') return { n: 1, d: 2 }
  return null
}

const varIndex = (id: string): number => Number(id.slice(1))

type NormalizedTerm = { coeff: Rational | null; var: string }
type Normalized = { constant: number; terms: NormalizedTerm[] }

// Split the (complete) sequence on `op:+` into additive segments and parse each.
// A segment is either a single constant, a `prob var` pair, or a bare `var`
// (implicit coefficient 1). Anything else is structurally malformed.
function parseSequence(tokens: string[]): Normalized | 'malformed' {
  const segments: ParsedToken[][] = [[]]
  for (const tok of tokens) {
    const p = parseToken(tok)
    if (!p) return 'malformed'
    if (p.kind === 'op' && p.value === '+') segments.push([])
    else segments[segments.length - 1].push(p)
  }

  let constant = 0
  const terms: NormalizedTerm[] = []
  for (const seg of segments) {
    if (seg.length === 1) {
      const [t] = seg
      if (t.kind === 'const') {
        const k = Number(t.value)
        if (!Number.isFinite(k)) return 'malformed'
        constant += k
      } else if (t.kind === 'var') {
        terms.push({ coeff: { n: 1, d: 1 }, var: t.value })
      } else {
        return 'malformed' // lone prob / op
      }
    } else if (seg.length === 2 && seg[0].kind === 'prob' && seg[1].kind === 'var') {
      terms.push({ coeff: probToRational(seg[0].value), var: seg[1].value })
    } else {
      return 'malformed' // empty segment, wrong arity, or wrong ordering
    }
  }
  return { constant, terms }
}

const varKey = (t: NormalizedTerm) => varIndex(t.var)
const pairKey = (t: NormalizedTerm): string => {
  const c = t.coeff ? reduceRat(t.coeff) : null
  return `${varIndex(t.var)}|${c ? `${c.n}/${c.d}` : '?'}`
}
const sortedEq = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i])

// Grade one row. `tokens` is the ordered sequence including the static `op:+`
// separators; empty slots are passed as null/'' and make the row incomplete.
export function checkRow(
  tokens: (string | null)[],
  target: Recurrence,
): RowCheck {
  if (tokens.length === 0 || tokens.some((t) => t == null || t === '')) {
    return { ok: false, reason: 'incomplete' }
  }

  const parsed = parseSequence(tokens as string[])
  if (parsed === 'malformed') return { ok: false, reason: 'malformed' }

  const parsedVars = parsed.terms.map(varKey).sort((a, b) => a - b).map(String)
  const targetVars = target.terms.map(varKey).sort((a, b) => a - b).map(String)
  if (!sortedEq(parsedVars, targetVars)) return { ok: false, reason: 'wrong-var' }

  const parsedPairs = parsed.terms.map(pairKey).sort()
  const targetPairs = target.terms.map(pairKey).sort()
  if (!sortedEq(parsedPairs, targetPairs)) return { ok: false, reason: 'wrong-coeff' }

  if (parsed.constant !== target.constant) return { ok: false, reason: 'wrong-constant' }
  return { ok: true }
}

export type RowsCheck = {
  ok: boolean
  results: Record<string, RowCheck>
}

// Grade every graded row. Non-graded rows (e.g. the absorbing E2 = 0) are
// skipped. `tokensByRow` is keyed by each row's lhs id.
export function checkRows(
  rows: GradedRow[],
  tokensByRow: Record<string, (string | null)[]>,
): RowsCheck {
  const results: Record<string, RowCheck> = {}
  let ok = true
  for (const row of rows) {
    if (!row.graded) continue
    const result = checkRow(tokensByRow[row.lhs] ?? [], row.target)
    results[row.lhs] = result
    if (!result.ok) ok = false
  }
  return { ok, results }
}
