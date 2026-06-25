/**
 * useSliderControl — single-thumb bespoke number-line slider hook.
 *
 * Composes React Aria (useSlider + useSliderThumb) with React Stately
 * (useSliderState) into a single hook. Visuals, markers, and labels
 * are the consumer's responsibility — this hook is generic.
 *
 * FROZEN RETURN SHAPE (Wave 3 contract — W3-A reimplements SliderBeat /
 * BiasSandboxBeat on this hook; do NOT add visual/marker logic here):
 *
 *   {
 *     state        — SliderState (react-stately); exposes getThumbValue,
 *                    setThumbValue, getThumbPercent, isThumbDragging, etc.
 *     trackRef     — RefObject<HTMLDivElement | null>   → spread onto track
 *     groupProps   — spread onto the slider group wrapper <div>
 *     trackProps   — spread onto the track <div>
 *     labelProps   — spread onto <label>
 *     outputProps  — spread onto <output>
 *     thumbProps   — spread onto the visual thumb <div>
 *     inputProps   — spread onto the hidden <input type="range">
 *     inputRef     — RefObject<HTMLInputElement | null> → passed to <input>
 *     label        — string label (echoes opts.label)
 *     output       — formatted current value string
 *     percent      — thumb position as 0..1
 *   }
 *
 * Typical DOM structure for the consumer:
 *   <div {...groupProps}>
 *     <label {...labelProps}>{label}</label>
 *     <output {...outputProps}>{output}</output>
 *     <div {...trackProps} ref={trackRef}>
 *       {/* visual track fill, markers, etc. go here *\/}
 *       <div {...thumbProps}>
 *         <input {...inputProps} ref={inputRef} />
 *       </div>
 *     </div>
 *   </div>
 */
import { useRef } from 'react'
import { useSlider, useSliderThumb } from 'react-aria'
import { useSliderState } from 'react-stately'
import type { SliderState } from 'react-stately'
import type { SliderAria, SliderThumbAria } from 'react-aria'

export interface SliderControlOptions {
  value: number
  onChange: (v: number) => void
  onChangeEnd?: (v: number) => void
  minValue?: number
  maxValue?: number
  step?: number
  label: string
  formatOptions?: Intl.NumberFormatOptions
}

export interface SliderControlReturn {
  state: SliderState
  trackRef: React.RefObject<HTMLDivElement | null>
  groupProps: SliderAria['groupProps']
  trackProps: SliderAria['trackProps']
  labelProps: SliderAria['labelProps']
  outputProps: SliderAria['outputProps']
  thumbProps: SliderThumbAria['thumbProps']
  inputProps: SliderThumbAria['inputProps']
  inputRef: React.RefObject<HTMLInputElement | null>
  label: string
  output: string
  percent: number
}

export function useSliderControl(opts: SliderControlOptions): SliderControlReturn {
  const {
    value,
    onChange,
    onChangeEnd,
    minValue = 0,
    maxValue = 100,
    step = 1,
    label,
    formatOptions,
  } = opts

  const trackRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const numberFormatter = new Intl.NumberFormat(undefined, formatOptions)

  const state = useSliderState<number[]>({
    value: [value],
    onChange: (vals) => onChange(vals[0]),
    onChangeEnd: onChangeEnd ? (vals) => onChangeEnd(vals[0]) : undefined,
    minValue,
    maxValue,
    step,
    numberFormatter,
  })

  const { groupProps, trackProps, labelProps, outputProps } = useSlider(
    { label, minValue, maxValue, step },
    state,
    trackRef,
  )

  const { thumbProps, inputProps } = useSliderThumb(
    { index: 0, trackRef, inputRef },
    state,
  )

  const range = maxValue - minValue
  const percent = range === 0 ? 0 : (state.values[0] - minValue) / range
  const output = state.getThumbValueLabel(0)

  return {
    state,
    trackRef,
    groupProps,
    trackProps,
    labelProps,
    outputProps,
    thumbProps,
    inputProps,
    inputRef,
    label,
    output,
    percent,
  }
}
