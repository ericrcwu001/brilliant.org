// Per-slot diagnostic grader for the equation-tiles beat. Unlike the coarse
// row-level `equationChecker` (one reason per row), this reports the status of
// every individual slot so the UI can highlight correct tiles green, and it
// selects a targeted, varied hint for the single most useful mistake to surface.
//
// Token format matches the beat: "<kind>:<value>" where kind is const | prob |
// var (state tiles serialize as `var`). The fillable slot layout for a target
// with T terms is [const] then, per term, [prob][var] — length 1 + 2T. The
// static "+" separators are NOT part of the slot array.
//
// Additive reordering is fully accepted: the learner's two weighted term-pairs
// are matched to the target terms with the assignment that maximizes correct
// slots, so a reordered-but-correct answer is all-green and a real swap of equal
// 1/2 weights is (correctly) not treated as an error.
//
// Pure and dependency-free so it runs in the node Vitest env.

export type Rational = { n: number; d: number }
type TargetTerm = { coeff: Rational; var: string }
export type Recurrence = { constant: number; terms: TargetTerm[] }

export type SlotStatus = 'correct' | 'wrong' | 'empty'

export type MistakeId =
  | 'lead-prob'
  | 'lead-state'
  | 'weight-not-prob'
  | 'state-slot-not-state'
  | 'tail-self-loop'
  | 'both-self-loop'
  | 'both-goal'
  | 'head-no-advance'
  | 'both-reset'
  | 'wrong-var-generic'
  | 'const-zero'
  | 'const-generic'

export type RowDiagnosis = {
  complete: boolean
  ok: boolean
  structurallyValid: boolean
  slotStatus: SlotStatus[]
  correctCount: number
  fillableCount: number
  glowIndex: number | null
  mistake: MistakeId | null
}

const kindOf = (t: string): string => t.slice(0, t.indexOf(':'))
const valOf = (t: string): string => t.slice(t.indexOf(':') + 1)

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}

function ratStr(r: Rational): string {
  const g = gcd(r.n, r.d)
  let n = r.n / g
  let d = r.d / g
  if (d < 0) {
    n = -n
    d = -d
  }
  return d === 1 ? `${n}` : `${n}/${d}`
}

const probMatches = (value: string, coeff: Rational): boolean => value === ratStr(coeff)

function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr]
  const out: T[][] = []
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]
    for (const p of permutations(rest)) out.push([arr[i], ...p])
  }
  return out
}

const multisetEq = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  return sa.every((x, i) => x === sb[i])
}

// Diagnose one row. `rawSlots` is the fillable-slot array (no "+"); entries are
// token strings or null for empty slots.
export function diagnoseRow(
  rawSlots: (string | null)[] | undefined,
  target: Recurrence,
): RowDiagnosis {
  const termCount = target.terms.length
  const fillableCount = 1 + 2 * termCount
  const slots: (string | null)[] = []
  for (let i = 0; i < fillableCount; i++) slots.push(rawSlots?.[i] ?? null)

  const status: SlotStatus[] = slots.map((s) => (s == null || s === '' ? 'empty' : 'wrong'))
  const complete = slots.every((s) => s != null && s !== '')

  // Lead (constant) slot: correct only if it's a const tile of the right value.
  const lead = slots[0]
  if (lead == null || lead === '') status[0] = 'empty'
  else if (kindOf(lead) === 'const' && Number(valOf(lead)) === target.constant)
    status[0] = 'correct'
  else status[0] = 'wrong'

  // Structural validity: every slot holds the right KIND for its role.
  let structurallyValid = lead != null && kindOf(lead) === 'const'
  for (let j = 0; j < termCount; j++) {
    const w = slots[1 + 2 * j]
    const s = slots[2 + 2 * j]
    if (!(w != null && kindOf(w) === 'prob')) structurallyValid = false
    if (!(s != null && kindOf(s) === 'var')) structurallyValid = false
  }

  // Value correctness for the weighted terms, choosing the pair→target
  // assignment that maximizes correct slots (so additive reorder is accepted).
  const pairIdx = Array.from({ length: termCount }, (_, j) => ({
    wi: 1 + 2 * j,
    si: 2 + 2 * j,
  }))
  let bestLocal: Record<number, SlotStatus> | null = null
  let bestScore = -1
  for (const perm of permutations(Array.from({ length: termCount }, (_, k) => k))) {
    let score = 0
    const local: Record<number, SlotStatus> = {}
    for (let p = 0; p < termCount; p++) {
      const { wi, si } = pairIdx[p]
      const term = target.terms[perm[p]]
      const w = slots[wi]
      const s = slots[si]
      const wOk = w != null && kindOf(w) === 'prob' && probMatches(valOf(w), term.coeff)
      const sOk = s != null && kindOf(s) === 'var' && valOf(s) === term.var
      local[wi] = w == null || w === '' ? 'empty' : wOk ? 'correct' : 'wrong'
      local[si] = s == null || s === '' ? 'empty' : sOk ? 'correct' : 'wrong'
      score += (wOk ? 1 : 0) + (sOk ? 1 : 0)
    }
    if (score > bestScore) {
      bestScore = score
      bestLocal = local
    }
  }
  if (bestLocal) for (const k of Object.keys(bestLocal)) status[Number(k)] = bestLocal[Number(k)]

  const correctCount = status.filter((s) => s === 'correct').length
  const ok = complete && status.every((s) => s === 'correct')

  let glowIndex: number | null = null
  for (let i = 0; i < fillableCount; i++) {
    if (status[i] === 'wrong') {
      glowIndex = i
      break
    }
  }

  const mistake = ok || !complete ? null : selectMistake(slots, target)

  return {
    complete,
    ok,
    structurallyValid,
    slotStatus: status,
    correctCount,
    fillableCount,
    glowIndex,
    mistake,
  }
}

// Classify a structurally-valid-but-wrong set of destination states. Specific
// to the two-term {E0,E2} target (the HH E1 row); falls back to a generic
// wrong-var message otherwise.
function classifyStateMistake(states: string[], targetStates: string[]): MistakeId {
  if (multisetEq([...targetStates].sort(), ['E0', 'E2'])) {
    const has = (x: string) => states.includes(x)
    const allAre = (x: string) => states.length > 0 && states.every((s) => s === x)
    if (allAre('E1')) return 'both-self-loop'
    if (allAre('E2')) return 'both-goal'
    if (allAre('E0')) return 'both-reset'
    if (has('E1') && has('E2') && !has('E0')) return 'tail-self-loop'
    if (has('E0') && has('E1') && !has('E2')) return 'head-no-advance'
  }
  return 'wrong-var-generic'
}

// Pick the single most useful mistake to headline: structural/kind problems
// first (the row must be a valid equation before its values mean anything),
// then the conceptual state error (the heart of the lesson), then the constant.
function selectMistake(slots: (string | null)[], target: Recurrence): MistakeId | null {
  const termCount = target.terms.length

  const lead = slots[0]
  if (lead != null && lead !== '') {
    const k = kindOf(lead)
    if (k === 'prob') return 'lead-prob'
    if (k === 'var') return 'lead-state'
  }

  for (let j = 0; j < termCount; j++) {
    const w = slots[1 + 2 * j]
    const s = slots[2 + 2 * j]
    if (w != null && w !== '' && kindOf(w) !== 'prob') return 'weight-not-prob'
    if (s != null && s !== '' && kindOf(s) !== 'var') return 'state-slot-not-state'
  }

  // Structurally valid: examine destination states (reorder-safe multiset).
  const states: string[] = []
  for (let j = 0; j < termCount; j++) {
    const s = slots[2 + 2 * j]
    if (s != null && s !== '' && kindOf(s) === 'var') states.push(valOf(s))
  }
  const targetStates = target.terms.map((t) => t.var)
  if (!multisetEq(states, targetStates)) return classifyStateMistake(states, targetStates)

  // States right → the constant must be the odd one out.
  if (lead == null || lead === '' || Number(valOf(lead)) !== target.constant) {
    if (lead != null && kindOf(lead) === 'const' && valOf(lead) === '0') return 'const-zero'
    return 'const-generic'
  }

  return null
}

// Level-1 (gentle nudge) and level-2 (specific reasoning) copy per mistake.
// Token-free: never names the literal correct tile (the level-3 answer reveal is
// handled by the authored feedback in the beat).
const MISTAKE_HINTS: Record<MistakeId, [string, string]> = {
  'lead-prob': [
    "The row opens with a cost you pay no matter how the coin lands — a probability only belongs inside a branch.",
    "Put a standalone count in the first slot, then attach each weight to the state its branch leads to.",
  ],
  'lead-state': [
    "The opening term is the per-flip cost, not one of the places you can land.",
    "States belong inside the weighted branches; the first slot is the flat step every visit pays.",
  ],
  'weight-not-prob': [
    "Inside a branch the leading piece is the chance of taking it — a bare count or a state can't be a weight.",
    "Read each branch as probability times state: put the coin's chance first, then the state it reaches.",
  ],
  'state-slot-not-state': [
    "Each branch has to end on a destination — the slot after the weight names a state, not a number.",
    "Pair every chance with the single state that flip sends you to; a weight with nothing after it isn't a term.",
  ],
  'tail-self-loop': [
    "On the tail — your near-miss — does waiting for HH let you keep that one matched head, or are you starting over?",
    "A tail after one head breaks the streak entirely, so that branch can't return to a state that still remembers a head.",
  ],
  'both-self-loop': [
    "Both branches leave you exactly where you are — but from one matched head, can the next flip really change nothing?",
    "One outcome finishes the pattern and the other throws the head away; neither keeps you at one matched head.",
  ],
  'both-goal': [
    "Both branches treat the next flip as the finish — but a tail is the near-miss that throws HH backward.",
    "Only one face completes HH; the other still costs you, so the two branches can't both be the finished state.",
  ],
  'head-no-advance': [
    "Your reset branch looks right — but when the next flip is the second head, hasn't the pattern already finished?",
    "The winning flip ends the wait with nothing left to count, so that branch should land on the finished state.",
  ],
  'both-reset': [
    "Both branches send you back to the start — but is a head really as damaging as a tail here?",
    "Exactly one outcome destroys progress; the other moves you toward HH, so the two branches must differ.",
  ],
  'wrong-var-generic': [
    "One branch lands on a state this flip wouldn't take you to — retrace the two outcomes from one matched head.",
    "From one matched head, one flip finishes HH and the other resets to the start; match each branch to its destination.",
  ],
  'const-zero': [
    "Zero would make this turn free — but you still have to flip the coin before anything can happen.",
    "Save 0 for a state that's already finished; a live state still spends a flip before the coin decides.",
  ],
  'const-generic': [
    "The leading term counts the flips this turn always costs, whatever the outcome.",
    "Before the coin splits the future, every visit pays the same flat toll — set that count first.",
  ],
}

export function hintForMistake(mistake: MistakeId, level: 1 | 2): string {
  return MISTAKE_HINTS[mistake][level - 1]
}

export type Progress = {
  correct: number
  fillable: number
  structurallyValid: boolean
}

// Aggregate per-row diagnoses into a single progress summary (for the visible
// note + an aria-live announcement). Generic over any number of build rows.
export function aggregateProgress(diags: RowDiagnosis[]): Progress {
  let correct = 0
  let fillable = 0
  let structurallyValid = true
  for (const d of diags) {
    correct += d.correctCount
    fillable += d.fillableCount
    if (!d.structurallyValid) structurallyValid = false
  }
  return { correct, fillable, structurallyValid }
}

export function progressLine(p: Progress): string {
  if (!p.structurallyValid) {
    return "Not a valid equation row yet — any green tiles stay locked. Shape each branch as a probability followed by the state it leads to."
  }
  if (p.correct <= 0) {
    return "Re-trace the worked E\u2080 row: a flip cost, then two branches, each a probability times a next state."
  }
  if (p.correct >= p.fillable) return "Every tile is correct."
  if (p.correct === p.fillable - 1) {
    return `${p.correct} of ${p.fillable} tiles locked in green — one idea left.`
  }
  return `${p.correct} of ${p.fillable} tiles locked in green — keep going.`
}

export function a11ySummary(p: Progress): string {
  if (!p.structurallyValid) {
    return "Some tiles may be locked in green, but the row isn't a valid equation yet — each branch needs a probability paired with a state."
  }
  if (p.correct >= p.fillable) return "All tiles correct."
  return `${p.correct} of ${p.fillable} tiles correct and locked in green; ${p.fillable - p.correct} still to fix.`
}
