// Pure which-method gate grading (spec-13 / D12). No React / analytics imports so
// it is unit-testable in the node Vitest env (matches feedbackResolve.ts vs the
// React feedback.ts split). The gate's graded act is the METHOD selection: a pick
// is correct iff the option's registry id equals gate.correct — graded by id, not
// display copy, so green never lands on a wrong method.

import type { Beat } from '../content/schema'

// The gate block on a `prediction` beat (README §4.5). Narrowed locally so callers
// pass the discriminated interaction without re-importing the zod inference.
export type WhichMethodGateBlock = {
  kind: 'which-method'
  correct: string
  optionMethods: string[]
}

// True iff `beat` is a which-method gate: a `prediction` carrying `interaction.gate`
// (the ONLY gate signal — never a beat-type set; the exempt opening bet has no gate).
export function isWhichMethodGate(
  beat: Beat,
): beat is Beat & { interaction: { type: 'prediction'; options: string[]; gate: WhichMethodGateBlock } } {
  return beat.interaction.type === 'prediction' && !!beat.interaction.gate
}

// Grade a pick at `index` against the gate: correct ⇔ optionMethods[index] === correct.
export function gradeMethodGate(gate: WhichMethodGateBlock, index: number): boolean {
  return gate.optionMethods[index] === gate.correct
}
