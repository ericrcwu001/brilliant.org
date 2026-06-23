// refine-prediction beat — the learner commits a numeric expected-time guess on
// a number-line slider (docs/ui_design_system.md "Prediction Slider"). Not
// graded: any locked value is accepted, stored as finalPrediction alongside the
// theoretical answer for the recap + theory-vs-simulation chart.

import { useState, type CSSProperties } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback } from '../feedback'
import type { FeedbackView } from '../FeedbackStrip'

export function SliderBeat(props: BeatProps) {
  const { beat, pattern, automaton, reducedMotion, isLast, onAdvance, setLessonState } = props
  const interaction = beat.interaction
  const slider = interaction.type === 'slider' ? interaction : null
  const min = slider?.min ?? 0
  const max = slider?.max ?? 0
  const step = slider?.step || 1
  // Midpoint default, snapped to the step grid.
  const mid = min + Math.round((max - min) / 2 / step) * step

  const [value, setValue] = useState(mid)
  const [moved, setMoved] = useState(false)
  const [locked, setLocked] = useState(false)

  if (interaction.type !== 'slider') return null

  const span = max - min || 1
  const frac = (v: number) => (v - min) / span

  const ticks: number[] = []
  for (let v = min; v <= max + step / 2; v += step) ticks.push(v)

  // Label ~5 evenly spaced ticks (always the two endpoints).
  const labelCount = Math.min(5, ticks.length)
  const labelIdx = new Set<number>()
  for (let i = 0; i < labelCount; i++) {
    labelIdx.add(Math.round((i * (ticks.length - 1)) / Math.max(1, labelCount - 1)))
  }

  const fb = resolveFeedback(beat.feedback, pattern)
  const view: FeedbackView = locked
    ? { kind: 'correct', text: fb.correct }
    : { kind: 'idle' }

  const numlineClass =
    'numline' + (reducedMotion ? ' numline--still' : '') + (locked ? ' numline--locked' : '')

  return (
    <BeatShell
      feedback={view}
      primary={
        locked
          ? {
              label: isLast ? 'Finish' : 'Continue',
              enabled: true,
              onClick: onAdvance,
            }
          : {
              label: 'Lock prediction',
              enabled: moved,
              onClick: () => {
                setLocked(true)
                setLessonState({
                  finalPrediction: value,
                  theoreticalValue: automaton.expectedTimes.E0,
                })
              },
            }
      }
    >
      <div className={numlineClass}>
        <output className="numline__value" aria-live="polite">
          {value}
        </output>
        <div className="numline__track">
          <div className="numline__rule" aria-hidden="true" />
          {ticks.map((t, i) => (
            <span
              key={t}
              className={'numline__tick' + (labelIdx.has(i) ? ' numline__tick--major' : '')}
              style={{ '--p': frac(t) } as CSSProperties}
              aria-hidden="true"
            >
              {labelIdx.has(i) && <span className="numline__ticklabel">{t}</span>}
            </span>
          ))}
          {locked && (
            <span className="numline__mark" style={{ '--p': frac(value) } as CSSProperties}>
              <span className="numline__marklabel">
                <span className="numline__markflag" aria-hidden="true">
                  ▲
                </span>
                {value}
              </span>
            </span>
          )}
          <input
            className="numline__range"
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={locked}
            aria-label={beat.prompt}
            aria-valuetext={`${value}${locked ? ', locked prediction' : ''}`}
            onChange={(e) => {
              setValue(Number(e.target.value))
              setMoved(true)
            }}
          />
        </div>
      </div>
    </BeatShell>
  )
}
