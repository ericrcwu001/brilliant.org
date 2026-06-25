// Phase 12 — Bias sensitivity sandbox (Extension). Dragging the coin bias p
// recomputes each pattern's recurrence values and expected times live. Purely
// exploratory: never graded, never blocks completion, never sets needsReview.

import { useMemo, useState } from 'react'
import type { BeatProps } from './types'
import type { Automaton, StateId } from '../../engine/types'
import { buildAutomaton } from '../../engine/automaton'
import { BeatShell } from '../BeatShell'
import { BiasChart, type BiasSeries } from '../konva/BiasChart'
import { C } from '../konva/theme'
import { chapterColor } from '../chapters'
import { useElementWidth } from '../konva/useElementWidth'
import { useSliderControl } from '../../ui/useSliderControl'

const SAMPLE_COUNT = 120

function symbolicRecurrence(a: Automaton, from: StateId): string {
  const to = (on: 'H' | 'T') =>
    a.transitions.find((e) => e.from === from && e.on === on)!.to
  return `${from} = 1 + p·${to('H')} + (1−p)·${to('T')}`
}

export function BiasSandboxBeat(props: BeatProps) {
  const { beat, patternOptions, isLast, onAdvance, lessonId } = props
  const [p, setP] = useState(0.5)
  const [boxRef, width] = useElementWidth<HTMLDivElement>()

  const seriesColors: Record<string, string> = {
    HH: chapterColor(lessonId),
    HT: C.tails,
  }

  // Bias range comes from the slider interaction; fall back to a sane window so
  // the hooks below run unconditionally (all hooks must precede any early out).
  const interaction = beat.interaction
  const min = interaction.type === 'slider' ? interaction.min : 0.1
  const max = interaction.type === 'slider' ? interaction.max : 0.9

  const {
    groupProps,
    trackProps,
    labelProps,
    thumbProps,
    inputProps,
    inputRef,
    trackRef,
    percent,
  } = useSliderControl({
    value: p,
    onChange: setP,
    minValue: min,
    maxValue: max,
    step: (max - min) / SAMPLE_COUNT,
    label: 'Coin bias p',
  })

  // Each E-vs-p curve depends only on the bias range + pattern set, not the live
  // p, so sample them once; only the marker recomputes as the slider moves.
  const curves = useMemo(
    () =>
      patternOptions.map((pat) => {
        const samples: { p: number; e: number }[] = []
        for (let i = 0; i <= SAMPLE_COUNT; i++) {
          const pp = min + ((max - min) * i) / SAMPLE_COUNT
          const a = buildAutomaton(pat, pp)
          samples.push({ p: pp, e: a.expectedTimes[a.states[0].id] })
        }
        return { pattern: pat, samples }
      }),
    [patternOptions, min, max],
  )

  if (interaction.type !== 'slider') return null

  const automata = patternOptions.map((pat) => buildAutomaton(pat, p))

  const series: BiasSeries[] = curves.map((c) => {
    const a = automata.find((au) => au.pattern === c.pattern)!
    return {
      pattern: c.pattern,
      color: seriesColors[c.pattern] ?? chapterColor(lessonId),
      samples: c.samples,
      current: a.expectedTimes[a.states[0].id],
    }
  })

  const { className: groupClassName, ...restGroupProps } = groupProps
  const { className: trackClassName, ...restTrackProps } = trackProps
  const { className: thumbClassName, style: thumbStyle, ...restThumbProps } = thumbProps

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: true,
        onClick: onAdvance,
      }}
      secondary={{ label: 'Skip', onClick: onAdvance }}
    >
      <div className="bias">
        <div className="bias__control">
          <span className="bias__label">
            Coin bias <span className="mono">p(H) = {p.toFixed(2)}</span>
          </span>
          <div
            {...restGroupProps}
            className={['bias__slider', groupClassName].filter(Boolean).join(' ')}
            data-testid="bias-slider"
          >
            <label {...labelProps} className="sr-only">
              Coin bias p
            </label>
            <div
              {...restTrackProps}
              ref={trackRef}
              className={['bias__track', trackClassName].filter(Boolean).join(' ')}
            >
              <div
                {...restThumbProps}
                className={['bias__thumb', thumbClassName].filter(Boolean).join(' ')}
                style={{ ...thumbStyle, left: `${percent * 100}%` }}
              >
                <input
                  {...inputProps}
                  ref={inputRef}
                  className="bias__range"
                  aria-label="Coin bias p"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bias__chart" ref={boxRef}>
          <div className="canvas-frame">
            {width > 0 && (
              <BiasChart
                width={width}
                height={Math.max(240, Math.round(width * 0.5))}
                pMin={min}
                pMax={max}
                p={p}
                series={series}
              />
            )}
          </div>
        </div>

        <div className="bias__cards">
          {automata.map((a) => (
            <div className="bias__card" key={a.pattern}>
              <p className="bias__pattern mono">{a.pattern}</p>
              <p className="bias__exp mono">
                E = {a.expectedTimes[a.states[0].id].toFixed(2)}
              </p>
              <div className="bias__eqs">
                {a.states
                  .filter((s) => !s.absorbing)
                  .map((s) => (
                    <p className="bias__eq mono" key={s.id}>
                      {symbolicRecurrence(a, s.id)}
                    </p>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <p className="hint-note">
          Exploratory — biasing the coin stretches or shrinks both waits. This
          never affects completion.
        </p>
      </div>
    </BeatShell>
  )
}
