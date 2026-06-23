// Phase 12 — Discover overlap. Side-by-side mini state graphs for the compare
// set emphasize each pattern's near-miss edge (the engine's overlapHighlights):
// HH's failing edge resets to ∅, HT's preserves progress. Narrative highlight,
// not graded.

import { useMemo } from 'react'
import type { BeatProps } from './types'
import { buildAutomaton } from '../../engine/automaton'
import { BeatShell } from '../BeatShell'
import { resolveFeedback } from '../feedback'
import { StateGraph } from '../konva/StateGraph'
import { useElementWidth } from '../konva/useElementWidth'

export function OverlapBeat(props: BeatProps) {
  const { beat, pattern, patternOptions, reducedMotion, isLast, onAdvance } = props
  const [boxRef, width] = useElementWidth<HTMLDivElement>()

  const automata = useMemo(
    () => patternOptions.map((p) => buildAutomaton(p, 0.5)),
    [patternOptions],
  )

  if (beat.interaction.type !== 'overlap') return null

  const cols = automata.length || 1
  const stageW = width > 0 ? Math.floor((width - 12 * (cols - 1)) / cols) : 0
  const stageH = Math.max(180, Math.round(stageW * 0.72))

  return (
    <BeatShell
      feedback={{ kind: 'correct', text: resolveFeedback(beat.feedback, pattern).correct }}
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: true,
        onClick: onAdvance,
      }}
    >
      <div className="overlap" ref={boxRef}>
        <div className="overlap__cols">
          {automata.map((a) => (
            <figure className="overlap__col" key={a.pattern}>
              <figcaption className="overlap__cap mono">{a.pattern}</figcaption>
              <div className="canvas-frame">
                {stageW > 0 && (
                  <StateGraph
                    automaton={a}
                    width={stageW}
                    height={stageH}
                    highlight={a.overlapHighlights}
                    reducedMotion={reducedMotion}
                  />
                )}
              </div>
              <p className="overlap__note">
                {a.overlapHighlights.map((h) => {
                  const t = a.transitions.find(
                    (e) => e.from === h.from && e.on === h.on,
                  )!
                  const to = a.states.find((s) => s.id === t.to)!
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
          ))}
        </div>
      </div>
    </BeatShell>
  )
}
