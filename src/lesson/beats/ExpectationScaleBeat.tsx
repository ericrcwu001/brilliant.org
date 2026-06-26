// L1 weighted-average balance beam (build-brief §4.4 / interaction-spec §3).
// Learner taps outcome circles to place probability weights; the fulcrum SVG
// polygon slides to E[X] = Σ x·P(x) after every placement. DOM/SVG, not Konva.
// Reads --ch4 directly from CSS. UNGRADED in L1 (no accept field).

import { useState, useEffect, useRef, type CSSProperties } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import type { FeedbackView } from '../feedback'
import { resolveFeedback } from '../feedbackResolve'
import { expectedValue } from '../../engine/expectation'
import type { Rational } from '../../engine/types'

const SVG_W = 320
const SVG_H = 130
const BEAM_Y = 65
const BEAM_PAD = 20
const CIRCLE_R = 22   // radius 22px → 44px diameter tap target
const FULCRUM_TIP_Y = BEAM_Y + 6
const FULCRUM_BASE_Y = BEAM_Y + 30
const FULCRUM_HALF_W = 11

// Brief pause (ms) after first placement (hero slow-first path).
const SLOW_FIRST_PAUSE_MS = 650

function fmtFrac(r: Rational): string {
  return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`
}

// Map an outcome value to SVG x coordinate within the beam range.
function outcomeX(val: number, xMin: number, xMax: number): number {
  const usableW = SVG_W - 2 * (BEAM_PAD + CIRCLE_R)
  const range = xMax - xMin || 1
  return BEAM_PAD + CIRCLE_R + ((val - xMin) / range) * usableW
}

export function ExpectationScaleBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion, pattern } = props

  // Stable default values for hooks (hooks must precede any early return).
  const interaction = beat.interaction
  const isScale = interaction.type === 'expectationScale'
  const outcomes = isScale ? interaction.outcomes : []
  const hero = beat.hero
  const n = outcomes.length || 1
  const fb = resolveFeedback(beat.feedback, pattern)

  const xVals = outcomes.map((o) => o.x)
  const xMin = xVals.length ? Math.min(...xVals) : 0
  const xMax = xVals.length ? Math.max(...xVals) : 1

  // Reduced-motion final frame: show all weights placed immediately.
  const showFinal = !!(reducedMotion && hero?.reducedMotionFinalFrame)

  const [placed, setPlaced] = useState<boolean[]>(() =>
    new Array(n).fill(showFinal),
  )
  const [pausing, setPausing] = useState(false)
  const firstPlacedRef = useRef(showFinal)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allPlaced = placed.length === outcomes.length && placed.every(Boolean)

  // Weight for outcome i: use preset if provided, else uniform 1/n.
  function weightOf(i: number): Rational {
    return outcomes[i].weight ?? { n: 1, d: n }
  }

  // Running EV from all currently placed outcomes.
  const activePmf = outcomes
    .map((o, i) =>
      placed[i] ? { x: { n: o.x, d: 1 }, p: weightOf(i) } : null,
    )
    .filter((e): e is { x: Rational; p: Rational } => e !== null)

  const runningEv: Rational | null =
    activePmf.length > 0 ? expectedValue(activePmf) : null

  // Final EV (precomputed; shown once all placed).
  const finalPmf = outcomes.map((o, i) => ({ x: { n: o.x, d: 1 }, p: weightOf(i) }))
  const finalEv = finalPmf.length > 0 ? expectedValue(finalPmf) : { n: 0, d: 1 }

  // Fulcrum x position: running EV position, or beam midpoint before any tap.
  const midVal = (xMin + xMax) / 2
  const fulcrumVal = runningEv ? runningEv.n / runningEv.d : midVal
  const fulcrumX = outcomeX(fulcrumVal, xMin, xMax)

  function handlePlace(idx: number) {
    if (placed[idx] || pausing) return

    const isFirst = !firstPlacedRef.current
    firstPlacedRef.current = true

    setPlaced((prev) => {
      const next = [...prev]
      next[idx] = true
      return next
    })

    // Hero slow-first: block second placement briefly so the fulcrum slide registers.
    if (isFirst && hero?.slowFirst && !reducedMotion) {
      setPausing(true)
      timerRef.current = setTimeout(() => setPausing(false), SLOW_FIRST_PAUSE_MS)
    }
  }

  function handleRemove(idx: number) {
    if (!placed[idx] || allPlaced) return
    setPlaced((prev) => {
      const next = [...prev]
      next[idx] = false
      return next
    })
    if (placed.filter(Boolean).length === 1) firstPlacedRef.current = false
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Narrow type guard: render null for non-expectationScale beats.
  if (!isScale) return null

  // Aria-live readout: fraction + decimal approximation.
  const readoutText = runningEv
    ? `E[X] = ${fmtFrac(runningEv)} — fulcrum at ${(runningEv.n / runningEv.d).toFixed(2)}`
    : ''

  const feedbackView: FeedbackView = allPlaced
    ? { kind: 'correct', text: fb.correct }
    : { kind: 'idle' }

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: allPlaced,
        onClick: onAdvance,
        variant: 'ghost',
      }}
      feedback={feedbackView}
    >
      <div className="escale">
        <svg
          className="escale__svg"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          role="img"
          aria-label="Weighted balance beam"
        >
          {/* Beam axis */}
          <line
            x1={BEAM_PAD}
            y1={BEAM_Y}
            x2={SVG_W - BEAM_PAD}
            y2={BEAM_Y}
            className="escale__beam"
          />

          {/* Outcome circles */}
          {outcomes.map((o, i) => {
            const cx = outcomeX(o.x, xMin, xMax)
            const isPlaced = placed[i]
            const label = o.label ?? String(o.x)
            return (
              <g
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Outcome ${label}${isPlaced ? ', weight placed' : ', tap to place weight'}`}
                aria-pressed={isPlaced}
                onClick={() => handlePlace(i)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    if (!isPlaced) handlePlace(i)
                  }
                  if (e.key === '+' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    if (!isPlaced) handlePlace(i)
                  }
                  if (e.key === '-' || e.key === 'ArrowDown') {
                    e.preventDefault()
                    handleRemove(i)
                  }
                }}
                style={{ cursor: isPlaced ? 'default' : 'pointer' }}
              >
                <circle
                  cx={cx}
                  cy={BEAM_Y}
                  r={CIRCLE_R}
                  className={`escale__circle${isPlaced ? ' escale__circle--placed' : ''}`}
                />
                <text
                  x={cx}
                  y={BEAM_Y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="escale__label"
                >
                  {label}
                </text>
                {isPlaced && (
                  <text
                    x={cx}
                    y={BEAM_Y - CIRCLE_R - 6}
                    textAnchor="middle"
                    dominantBaseline="auto"
                    className="escale__weight-chip"
                  >
                    {fmtFrac(weightOf(i))}
                  </text>
                )}
              </g>
            )
          })}

          {/* Fulcrum triangle — slides via CSS transition on translateX */}
          <g
            className="escale__fulcrum-group"
            style={
              {
                transform: `translateX(${fulcrumX}px)`,
                transition: reducedMotion
                  ? 'none'
                  : 'transform var(--dur-slow) var(--ease-out)',
              } as CSSProperties
            }
          >
            <polygon
              className="escale__fulcrum"
              points={`0,${FULCRUM_TIP_Y} ${-FULCRUM_HALF_W},${FULCRUM_BASE_Y} ${FULCRUM_HALF_W},${FULCRUM_BASE_Y}`}
            />
          </g>

          {/* Final EV annotation (shown once all weights placed) */}
          {allPlaced && (
            <text
              x={SVG_W / 2}
              y={SVG_H - 6}
              textAnchor="middle"
              dominantBaseline="auto"
              className="escale__ev-label"
            >
              {`E[X] = ${fmtFrac(finalEv)}`}
            </text>
          )}
        </svg>

        {/* Aria-live running readout */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="escale__readout"
        >
          {readoutText}
        </div>

        {!allPlaced && (
          <p className="escale__hint">
            Tap each outcome to place its probability weight.
          </p>
        )}
      </div>
    </BeatShell>
  )
}
