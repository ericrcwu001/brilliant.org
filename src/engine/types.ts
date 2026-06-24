// Core engine + content data contracts (see docs/mvp_prd.md "Data Contracts
// Appendix"). This module is pure and dependency-free; it is the source of
// truth shared by the engine, renderers, checkers, and persistence.

export type StateId = `E${number}` // E0, E1, ...; display label (∅, H, HH) is separate

export type Rational = { n: number; d: number }

export type AutomatonState = { id: StateId; label: string; absorbing: boolean }

export type Transition = {
  from: StateId
  on: 'H' | 'T'
  to: StateId
  kind: 'advance' | 'self-loop' | 'reset'
}

export type CanonicalRecurrence = {
  lhs: StateId
  constant: number // the leading "1 +" flip cost
  terms: Array<{ coeff: Rational; var: StateId }> // probability-weighted next states
}

export type SubstitutionStep = {
  display: string // e.g. "E1 = 1 + 1/2 E2 + 1/2 E0"
  substitute: StateId // which value is being substituted in this step
  resultValue?: number // populated once this state is solved
}

export type Automaton = {
  pattern: string
  p: number
  states: AutomatonState[]
  transitions: Transition[]
  recurrences: Record<StateId, CanonicalRecurrence>
  expectedTimes: Record<StateId, number>
  substitutionSteps: SubstitutionStep[]
  overlapHighlights: Array<{ from: StateId; on: 'H' | 'T' }>
}
