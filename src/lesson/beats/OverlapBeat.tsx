// Phase 12 — Discover overlap. Side-by-side mini state graphs for the compare
// set emphasize each pattern's near-miss edge (the engine's overlapHighlights):
// HH's failing edge resets to ∅, HT's preserves progress.
//
// Track B (density 'merged') keeps the original narrative-highlight, ungraded
// view. Track A (density 'split') turns it into an action (L1 §4.10): the learner
// taps which pattern's near-miss *keeps* progress, graded stateTap-style, before
// the 2-flip consequence is revealed.

import { useMemo, useState } from 'react'
import type { Automaton } from '../../engine/types'
import type { BeatProps } from './types'
import { buildAutomaton } from '../../engine/automaton'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import { StateGraph } from '../konva/StateGraph'
import { useElementWidth } from '../konva/useElementWidth'
import { keepsProgress } from '../grading'

export function OverlapBeat(props: BeatProps) {
  const { beat, pattern, patternOptions, reducedMotion, density, isLast, onAdvance } =
    props

  const automata = useMemo(
    () => patternOptions.map((p) => buildAutomaton(p, 0.5)),
    [patternOptions],
  )

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, pattern),
    required: beat.required,
    // Honor the runtime cap-lift so a capped Overlap tap never dead-ends (R6 /
    // spec-21 §3.5) — matches every other graded beat. Was bare beat.maxHintLevel.
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: props.reportNeedsReview,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: { lessonId: props.lessonId, beatId: beat.beatId },
  })
  const [picked, setPicked] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)

  if (beat.interaction.type !== 'overlap') return null

  // Track B: the original passive narrative view, byte-for-byte unchanged.
  if (density !== 'split') {
    return (
      <BeatShell
        feedback={{
          kind: 'correct',
          text: resolveFeedback(beat.feedback, pattern).correct,
        }}
        primary={{
          label: isLast ? 'Finish' : 'Continue',
          enabled: true,
          onClick: onAdvance,
        }}
      >
        <div className="overlap">
          <div className="overlap__cols">
            {automata.map((a) => (
              <OverlapColumn key={a.pattern} automaton={a} reducedMotion={reducedMotion} />
            ))}
          </div>
        </div>
      </BeatShell>
    )
  }

  // Track A: tap which near-miss keeps progress, then reveal the consequence.
  const correctPattern = automata.find(keepsProgress)?.pattern
  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed
  const emphasize = solved || (ladder.view.kind === 'hint' && ladder.view.level >= 2)

  function check() {
    if (picked === correctPattern) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      ladder.submitWrong()
    }
  }

  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: picked !== null, onClick: check }

  return (
    <BeatShell
      feedback={ladder.view}
      onTryAgain={revealed ? () => { ladder.tryAgain(); setPicked(null) } : undefined}
      primary={primary}
    >
      <div className="overlap">
        <div className="overlap__cols">
          {automata.map((a) => (
            <OverlapColumn
              key={a.pattern}
              automaton={a}
              reducedMotion={reducedMotion}
              emphasize={emphasize}
              showNote={solved || revealed}
            />
          ))}
        </div>
        <fieldset className="overlap__tap">
          <legend className="overlap__tap-q">
            Tap the pattern whose near-miss keeps your progress.
          </legend>
          <div className="tap-choices" role="radiogroup">
            {automata.map((a) => {
              const isPick = picked === a.pattern
              const graded = ladder.view.kind === 'hint' && !solved
              const showCorrect =
                ((revealed || solved) && a.pattern === correctPattern) ||
                (graded && isPick && a.pattern === correctPattern)
              const showWrong = graded && isPick && a.pattern !== correctPattern
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={isPick}
                  key={a.pattern}
                  disabled={solved || revealed}
                  className={
                    'statechip' +
                    (isPick ? ' statechip--on' : '') +
                    (showCorrect ? ' statechip--correct' : '') +
                    (showWrong ? ' statechip--wrong' : '')
                  }
                  onClick={() => {
                    setPicked(a.pattern)
                    ladder.clear()
                  }}
                >
                  <span className="statechip__label mono">{a.pattern}</span>
                </button>
              )
            })}
          </div>
        </fieldset>
      </div>
    </BeatShell>
  )
}

// Each column measures its own frame so the canvas fills whatever width the
// layout gives it: full width when the columns stack on mobile, ~half when they
// sit side by side on laptop. (Measuring one shared width and dividing by the
// column count left the stacked mobile graphs at half size.)
function OverlapColumn({
  automaton,
  reducedMotion,
  emphasize = true,
  showNote = true,
}: {
  automaton: Automaton
  reducedMotion: boolean
  // Track A withholds the edge glow + spelled-out note until the learner has
  // answered, so the tap is a genuine prediction. Track B keeps both on (default).
  emphasize?: boolean
  showNote?: boolean
}) {
  const [frameRef, width] = useElementWidth<HTMLDivElement>()
  const stageH = Math.max(180, Math.round(width * 0.72))

  return (
    <figure className="overlap__col">
      <figcaption className="overlap__cap mono">{automaton.pattern}</figcaption>
      <div className="canvas-frame" ref={frameRef}>
        {width > 0 && (
          <StateGraph
            automaton={automaton}
            width={width}
            height={stageH}
            highlight={emphasize ? automaton.overlapHighlights : []}
            reducedMotion={reducedMotion}
          />
        )}
      </div>
      {showNote && (
      <p className="overlap__note">
        {automaton.overlapHighlights.map((h) => {
          const t = automaton.transitions.find(
            (e) => e.from === h.from && e.on === h.on,
          )!
          const to = automaton.states.find((s) => s.id === t.to)!
          return (
            <span key={`${h.from}-${h.on}`}>
              Near-miss <span className="mono">{h.on}</span>{' '}
              {t.kind === 'reset'
                ? `resets to ${to.label}`
                : `keeps progress at ${to.label}`}
              .
            </span>
          )
        })}
      </p>
      )}
    </figure>
  )
}
