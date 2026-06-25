// Pure balance-model derivation for the BalanceSolveBeat. Kept dependency-free
// (engine types only — no React/feedback/Firebase) so it is node-testable in the
// plain Vitest environment, mirroring the repo's "pure, node-testable modules;
// React hooks wrap them" pattern.
//
// Derives the first-step recurrence balance model for solveState:
//   left(x) = x                       (the candidate, left pan)
//   rhs(x)  = otherTerm + selfCoeff*x (recurrence RHS, right pan)
// The beam levels when left(x) === rhs(x), i.e. at expectedTimes[solveState].
// selfCoeff < 1 always holds for any valid non-absorbing recurrence.

import type { Automaton, StateId } from '../../engine/types'

export type BalanceModel = {
  balancePoint: number
  rhsAt: (x: number) => number
  leftAt: (x: number) => number
  selfCoeff: number
  otherTerm: number
}

export function balanceModel(
  automaton: Automaton,
  solveState: StateId = 'E0',
): BalanceModel {
  const p = automaton.p
  const outgoing = automaton.transitions.filter((t) => t.from === solveState)
  let selfCoeff = 0
  let otherTerm = 1 // mandatory "1 flip" constant from the recurrence
  for (const t of outgoing) {
    const prob = t.on === 'H' ? p : 1 - p
    if (t.to === solveState) {
      selfCoeff += prob
    } else {
      otherTerm += prob * automaton.expectedTimes[t.to]
    }
  }
  const balancePoint = automaton.expectedTimes[solveState]
  return {
    balancePoint,
    rhsAt: (x: number) => otherTerm + selfCoeff * x,
    leftAt: (x: number) => x,
    selfCoeff,
    otherTerm,
  }
}
