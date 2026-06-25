// refine-prediction beat — the learner commits a numeric expected-time guess on
// a number-line slider (docs/ui_design_system.md "Prediction Slider"). Not
// graded: any locked value is accepted, stored as finalPrediction alongside the
// theoretical answer for the recap + theory-vs-simulation chart.

import { useState, type CSSProperties } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback } from '../feedback'
import type { FeedbackView } from '../FeedbackStrip'
import { analytics } from '../../analytics/events'
import { useSliderControl } from '../../ui/useSliderControl'

export function SliderBeat(props: BeatProps) {
  const { beat, lessonId, pattern, automaton, reducedMotion, isLast, onAdvance, setLessonState } =
    props
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

  const {
    groupProps,
    trackProps,
    labelProps,
    outputProps,
    thumbProps,
    inputProps,
    inputRef,
    trackRef,
    output,
    percent,
  } = useSliderControl({
    value,
    onChange: (v) => {
      if (locked) return
      setValue(v)
      setMoved(true)
    },
    minValue: min,
    maxValue: max,
    step,
    label: beat.prompt,
  })

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

  // This is an ungraded prediction, not a checked answer, so the locked
  // acknowledgement is a neutral 'note' (no green "Correct" tint) — matching the
  // open-bet PredictionBeat.
  const fb = resolveFeedback(beat.feedback, pattern)
  const view: FeedbackView = locked
    ? { kind: 'note', text: fb.correct, label: 'Locked in' }
    : { kind: 'idle' }

  const numlineClass =
    'numline' + (reducedMotion ? ' numline--still' : '') + (locked ? ' numline--locked' : '')

  const { className: groupClassName, ...restGroupProps } = groupProps
  const { className: trackClassName, ...restTrackProps } = trackProps
  const { className: thumbClassName, style: thumbStyle, ...restThumbProps } = thumbProps

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
                analytics.predictionSet({
                  lessonId,
                  beatId: beat.beatId,
                  value,
                })
              },
            }
      }
    >
      <div
        {...restGroupProps}
        className={[numlineClass, groupClassName].filter(Boolean).join(' ')}
        data-testid="prediction-slider"
      >
        <label {...labelProps} className="sr-only">
          {beat.prompt}
        </label>
        {!locked && (
          <p className="numline__instruction" aria-hidden="true">
            Drag the slider to your estimate, then lock it in.
          </p>
        )}
        <output {...outputProps} className="numline__value">
          {output}
        </output>
        <div
          {...restTrackProps}
          ref={trackRef}
          className={['numline__track', trackClassName].filter(Boolean).join(' ')}
        >
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
          <div
            {...restThumbProps}
            className={['numline__thumb', thumbClassName].filter(Boolean).join(' ')}
            style={{ ...thumbStyle, left: `${percent * 100}%` }}
          >
            <input
              {...inputProps}
              ref={inputRef}
              className="numline__range"
              disabled={locked}
            />
          </div>
        </div>
      </div>
    </BeatShell>
  )
}
