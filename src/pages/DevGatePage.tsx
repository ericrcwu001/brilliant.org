// Dev-only which-method gate harness (spec-13 / step 9). Renders the standalone
// WhichMethodGate against a hand-built worked gate beat so a reviewer can click
// through with no Firebase/auth and no committed-fixture churn. The right pick
// resolves (advances); a wrong pick refutes via byOption and HOLDS (the chips
// stay live). Pass ?track=A to hide the confidence rating (Track-A gate-off).
//
// The distractors (`states-markov`, `recursion-self-reference`) are members of
// CONFUSABLE['first-step-analysis'] (methods.ts) — the validator's step-6g check
// rejects ad-hoc/domain-overlap foils, so a worked gate must use declared
// near-misses. The gate beat carries schemaId === gate.correct.

import { useState } from 'react'
import type { Beat } from '../content/schema'
import { WhichMethodGate } from '../lesson/WhichMethodGate'

const GATE_BEAT: Beat = {
  beatId: 'dev-gate',
  required: true,
  // A label-stripped surface: the prompt is shown by the player normally, but the
  // gate renders its own neutral discrimination prompt. Kept here for fixture shape.
  prompt: 'A gambler bets $1 a round, stopping at $0 or $10. What is the chance of reaching $10?',
  schemaId: 'first-step-analysis',
  interaction: {
    type: 'prediction',
    options: ['First-step analysis', 'States / Markov', 'Recursion / self-reference'],
    gate: {
      kind: 'which-method',
      correct: 'first-step-analysis',
      optionMethods: ['first-step-analysis', 'states-markov', 'recursion-self-reference'],
    },
  },
  feedback: {
    byOption: {
      'First-step analysis': {
        note: 'Right — condition on the first step and solve the boundary recurrence.',
        correct: true,
      },
      'States / Markov': {
        note: 'Close — you would set up states, but the move that cracks it is conditioning on the first step.',
      },
      'Recursion / self-reference': {
        note: 'The recurrence appears, but it comes FROM the first-step conditioning — that is the method here.',
      },
    },
    hints: ['Which single move sets up the equation?', '', ''],
  },
}

export function DevGatePage() {
  const [result, setResult] = useState<{ correct: boolean; picked: string } | null>(null)
  const track =
    new URLSearchParams(window.location.search).get('track') === 'A' ? 'A' : 'B'

  return (
    <div className="lesson" data-ch="0">
      <div className="dev-switcher" role="group" aria-label="Dev gate harness">
        <span className="dev-switcher__label">/dev/gate</span>
        <span className="dev-switcher__btn" aria-live="polite">
          {result
            ? `Resolved: picked "${result.picked}" → ${result.correct ? 'correct (advances)' : 'wrong (holds)'}`
            : 'Pick a method'}
        </span>
      </div>
      <WhichMethodGate
        beat={GATE_BEAT}
        schemaId="first-step-analysis"
        lessonId="dev-gate"
        showConfidence={track === 'B'}
        onResolved={setResult}
      />
    </div>
  )
}

export default DevGatePage
