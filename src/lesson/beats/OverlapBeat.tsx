// Phase 12 — Discover overlap. Side-by-side mini state graphs for the compare
// set emphasize each pattern's near-miss edge (the engine's overlapHighlights):
// HH's failing edge resets to ∅, HT's preserves progress. Narrative highlight,
// not graded.

import { useMemo } from 'react'
import type { Automaton } from '../../engine/types'
import type { BeatProps } from './types'
import { buildAutomaton } from '../../engine/automaton'
import { BeatShell } from '../BeatShell'
import { resolveFeedback } from '../feedback'
import { StateGraph } from '../konva/StateGraph'
import { useElementWidth } from '../konva/useElementWidth'

export function OverlapBeat(props: BeatProps) {
  const { beat, pattern, patternOptions, reducedMotion, isLast, onAdvance } = props

  const automata = useMemo(
    () => patternOptions.map((p) => buildAutomaton(p, 0.5)),
    [patternOptions],
  )

  if (beat.interaction.type !== 'overlap') return null

  return (
    <BeatShell
      feedback={{ kind: 'correct', text: resolveFeedback(beat.feedback, pattern).correct }}
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

// Each column measures its own frame so the canvas fills whatever width the
// layout gives it: full width when the columns stack on mobile, ~half when they
// sit side by side on laptop. (Measuring one shared width and dividing by the
// column count left the stacked mobile graphs at half size.)
function OverlapColumn({
  automaton,
  reducedMotion,
}: {
  automaton: Automaton
  reducedMotion: boolean
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
            highlight={automaton.overlapHighlights}
            reducedMotion={reducedMotion}
          />
        )}
      </div>
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
    </figure>
  )
}
