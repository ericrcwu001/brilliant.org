// Phase 7 — Find the failure edge. The learner taps where each near-miss
// transition lands; answers are checked against the engine, and the
// overlap-relevant edges are emphasized in the graph as the hint ladder
// escalates. maxHintLevel from the beat caps the ladder for the L3 transfer
// (faded scaffolding).

import { useState } from 'react'
import type { BeatProps } from './types'
import type { StateId } from '../../engine/types'
import { nextStateOf } from '../../engine/simulate'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import { StateGraph } from '../konva/StateGraph'
import { useElementWidth } from '../konva/useElementWidth'
import { stateTapHint } from '../stateTapHints'

const key = (from: string, on: 'H' | 'T') => `${from}-${on}`

export function StateTapBeat(props: BeatProps) {
  const { beat, pattern, automaton, reducedMotion, isLast, onAdvance } = props
  const [boxRef, width] = useElementWidth<HTMLDivElement>()
  const [picks, setPicks] = useState<Record<string, StateId | null>>({})
  const [solved, setSolved] = useState(false)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, pattern),
    required: beat.required,
    maxHintLevel: beat.maxHintLevel,
    onNeedsReview: props.reportNeedsReview,
  })

  if (beat.interaction.type !== 'stateTap') return null
  const { transitions } = beat.interaction

  const labelOf = (id: string) =>
    automaton.states.find((s) => s.id === id)?.label ?? id
  const correctOf = (from: string, on: 'H' | 'T') =>
    nextStateOf(automaton, from as StateId, on)

  const allPicked = transitions.every((t) => picks[key(t.from, t.on)])
  const revealed =
    ladder.view.kind === 'hint' && ladder.view.revealed
  // Emphasize overlap edges once the ladder reaches the highlight level.
  const emphasize =
    (ladder.view.kind === 'hint' && ladder.view.level >= 2) || solved
  const hintLevel =
    ladder.view.kind === 'hint' ? (ladder.view.level as 1 | 2 | 3) : 0

  function check() {
    const allCorrect = transitions.every(
      (t) => picks[key(t.from, t.on)] === correctOf(t.from, t.on),
    )
    if (allCorrect) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      ladder.submitWrong()
    }
  }

  function retry() {
    ladder.tryAgain()
    setPicks({})
  }

  const primary =
    solved
      ? {
          label: isLast ? 'Finish' : 'Continue',
          enabled: true,
          onClick: onAdvance,
        }
      : { label: 'Check', enabled: allPicked, onClick: check }

  return (
    <BeatShell
      primary={primary}
      secondary={undefined}
      feedback={ladder.view}
      onTryAgain={revealed ? retry : undefined}
    >
      <div className="tapbeat" ref={boxRef}>
        <div className="canvas-frame">
          {width > 0 && (
            <StateGraph
              automaton={automaton}
              width={width}
              height={Math.max(200, Math.round((width || 320) * 0.46))}
              highlight={emphasize ? automaton.overlapHighlights : []}
              reducedMotion={reducedMotion}
            />
          )}
        </div>

        <div className="tap-prompts">
          {transitions.map((t) => {
            const k = key(t.from, t.on)
            const picked = picks[k] ?? null
            const correct = correctOf(t.from, t.on)
            return (
              <fieldset className="tap-card" key={k}>
                <legend className="tap-card__q">
                  State <span className="mono">{labelOf(t.from)}</span>, then{' '}
                  <span className={`coin coin--${t.on} coin--inline`}>{t.on}</span> →
                </legend>
                <div className="tap-choices" role="radiogroup">
                  {automaton.states.map((s) => {
                    const isPick = picked === s.id
                    // A check that wasn't fully correct still grades each card:
                    // a correct pick goes green, a wrong pick goes red.
                    const graded = ladder.view.kind === 'hint' && !solved
                    const showCorrect =
                      ((revealed || solved) && s.id === correct) ||
                      (graded && isPick && s.id === correct)
                    const showWrong = graded && isPick && s.id !== correct
                    return (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isPick}
                        key={s.id}
                        disabled={solved || revealed}
                        className={
                          'statechip' +
                          (isPick ? ' statechip--on' : '') +
                          (showCorrect ? ' statechip--correct' : '') +
                          (showWrong ? ' statechip--wrong' : '')
                        }
                        onClick={() => {
                          setPicks((p) => ({ ...p, [k]: s.id }))
                          // Editing a pick drops the stale verdict from the
                          // previous Check.
                          ladder.clear()
                        }}
                      >
                        <span className="statechip__label mono">{s.label}</span>
                        <span className="statechip__id mono">{s.id}</span>
                      </button>
                    )
                  })}
                </div>
                {hintLevel > 0 &&
                  !solved &&
                  picked &&
                  picked !== correct && (
                    <p className="tap-card__hint">
                      {stateTapHint(
                        automaton,
                        t.from as StateId,
                        t.on,
                        hintLevel as 1 | 2 | 3,
                      )}
                    </p>
                  )}
              </fieldset>
            )
          })}
        </div>
      </div>
    </BeatShell>
  )
}
