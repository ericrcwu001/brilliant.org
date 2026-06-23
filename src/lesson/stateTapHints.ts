// Engine-derived per-transition hints for the stateTap beat. Pure and
// dependency-free so it can be unit-tested in the node Vitest environment.

import { nextStateOf } from '../engine/simulate'
import type { Automaton, StateId } from '../engine/types'

function labelOf(automaton: Automaton, id: StateId): string {
  return automaton.states.find((s) => s.id === id)?.label ?? id
}

function transitionOf(automaton: Automaton, from: StateId, on: 'H' | 'T') {
  const t = automaton.transitions.find((e) => e.from === from && e.on === on)
  if (!t) throw new Error(`No transition from ${from} on ${on}`)
  return t
}

export function stateTapHint(
  automaton: Automaton,
  from: StateId,
  on: 'H' | 'T',
  level: 1 | 2 | 3,
): string {
  const fromLabel = labelOf(automaton, from)
  const to = nextStateOf(automaton, from, on)
  const toLabel = labelOf(automaton, to)
  const { kind } = transitionOf(automaton, from, on)

  if (level === 1) {
    return `Watch where ${fromLabel} (${from}) goes on a ${on}.`
  }

  if (level === 2) {
    switch (kind) {
      case 'reset':
        return `${fromLabel} (${from}) on ${on} is a near-miss — matched progress is lost.`
      case 'self-loop':
        return `${fromLabel} (${from}) on ${on} stays put — progress is preserved.`
      case 'advance':
        return `${fromLabel} (${from}) on ${on} extends the match toward the goal.`
    }
  }

  return `${from} on ${on} goes to ${to} (${toLabel}).`
}
