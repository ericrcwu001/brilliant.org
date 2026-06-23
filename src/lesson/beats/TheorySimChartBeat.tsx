// Phase 11 — Compare theory vs simulation. Each Run simulation adds a batch of
// trials; the cumulative empirical mean is plotted and visibly converges toward
// the theory line, with the learner's locked prediction shown as a marker. The
// summarized result (empiricalMean + simRuns) is stored — never per-trial data.

import { useState } from 'react'
import type { BeatProps } from './types'
import { flipsToAbsorption } from '../../engine/simulate'
import { BeatShell } from '../BeatShell'
import { resolveFeedback } from '../feedback'
import type { FeedbackView } from '../FeedbackStrip'
import { SimChart } from '../konva/SimChart'
import { useElementWidth } from '../konva/useElementWidth'

const BATCH = 60

export function TheorySimChartBeat(props: BeatProps) {
  const { beat, pattern, automaton, isLast, onAdvance } = props
  const [boxRef, width] = useElementWidth<HTMLDivElement>()
  const [points, setPoints] = useState<number[]>([])
  const [totalRuns, setTotalRuns] = useState(0)
  const [totalFlips, setTotalFlips] = useState(0)

  if (beat.interaction.type !== 'theorySimChart') return null

  const theory = automaton.expectedTimes[automaton.states[0].id]
  const mean = totalRuns > 0 ? totalFlips / totalRuns : 0

  function runSimulation() {
    let added = 0
    for (let i = 0; i < BATCH; i++) added += flipsToAbsorption(automaton)
    const newFlips = totalFlips + added
    const newRuns = totalRuns + BATCH
    setTotalFlips(newFlips)
    setTotalRuns(newRuns)
    setPoints((p) => [...p, newFlips / newRuns])
    props.setLessonState({
      empiricalMean: Math.round((newFlips / newRuns) * 100) / 100,
      simRuns: newRuns,
    })
  }

  // Confirm convergence once enough trials have accumulated.
  const view: FeedbackView =
    totalRuns >= BATCH * 2
      ? { kind: 'correct', text: resolveFeedback(beat.feedback, pattern).correct }
      : { kind: 'idle' }

  const secondary =
    totalRuns > 0
      ? {
          label: isLast ? 'Finish' : 'Continue',
          onClick: onAdvance,
        }
      : undefined

  return (
    <BeatShell
      feedback={view}
      primary={{ label: 'Run simulation', enabled: true, onClick: runSimulation }}
      secondary={secondary}
    >
      <div className="simbeat" ref={boxRef}>
        <div className="canvas-frame">
          {width > 0 && (
            <SimChart
              width={width}
              height={Math.max(240, Math.round((width || 320) * 0.5))}
              theory={theory}
              prediction={props.lessonState.finalPrediction}
              points={points}
            />
          )}
        </div>
        <p className="sim-readout mono" role="status" aria-live="polite">
          {totalRuns === 0
            ? 'Run a simulation to plot the empirical average.'
            : `${totalRuns} runs · empirical mean ${mean.toFixed(2)} · theory ${theory}`}
        </p>
      </div>
    </BeatShell>
  )
}
