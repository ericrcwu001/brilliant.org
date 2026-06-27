// Inclusion–exclusion Venn explorer for lesson-combinatorics-4.
// Stepper controls (−/+ ≥44px) are the primary tap/keyboard path; drag is
// additive-only and not required. Hero: ab animates 0→initial.ab on mount,
// making the subtraction visceral. Reduced-motion: final frame immediately.
// Ungraded in L4 (no `accept`): Continue→onAdvance, feedback.correct as note.
// sets:3 variant uses inclusionExclusion for completeness.

import { useState, useEffect } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import type { FeedbackView } from '../feedback'
import { useReducedMotion } from '../useReducedMotion'
import { unionSize, inclusionExclusion } from '../../engine/combinatorics'
import { isVennCounterCorrect } from '../grading'

const HERO_DURATION_MS = 600
const VENN_R = 38
const VENN_CY = 50
const VENN_MIDX = 120

function circleSep(abVal: number, aVal: number, bVal: number): number {
  const minAB = Math.min(aVal, bVal)
  const frac = minAB > 0 ? Math.min(abVal / minAB, 1) : 0
  const maxSep = 2 * VENN_R + 12
  const minSep = 14
  return maxSep + frac * (minSep - maxSep)
}

export function VennCounterBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props
  const reducedMotion = useReducedMotion()

  const vc = beat.interaction.type === 'vennCounter' ? beat.interaction : null
  const sets = vc?.sets ?? 2
  const maxSize = vc?.maxSize ?? 30
  const accept = vc?.accept
  const isGraded = !!accept
  const hasHero = !!beat.hero

  const initA = vc?.initial?.a ?? 8
  const initB = vc?.initial?.b ?? 6
  const initAb = vc?.initial?.ab ?? 3

  // Hero start: ab=0 unless reduced-motion (shows final frame immediately).
  const startAb = hasHero && !reducedMotion ? 0 : initAb

  const [a, setA] = useState(initA)
  const [b, setB] = useState(initB)
  const [ab, setAb] = useState(startAb)
  const [heroPlaying, setHeroPlaying] = useState(hasHero && !reducedMotion && initAb > 0)
  const [solved, setSolved] = useState(false)

  // sets:3 extra pairwise/triple state
  const [c, setC] = useState(0)
  const [ac, setAc] = useState(0)
  const [bc, setBc] = useState(0)
  const [abc3, setAbc3] = useState(0)

  const resolved = resolveFeedback(beat.feedback, pattern)

  const ladder = useHintLadder({
    feedback: resolved,
    required: beat.required,
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: isGraded ? props.reportNeedsReview : undefined,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: isGraded ? { lessonId: props.lessonId, beatId: beat.beatId } : undefined,
  })

  // Hero animation: step ab from 0 → initAb over HERO_DURATION_MS.
  // heroPlaying is initialized false when hasHero is false, reducedMotion is
  // true, or initAb <= 0 — no synchronous setState needed in the early path.
  useEffect(() => {
    if (!vc || !hasHero || reducedMotion || initAb <= 0) return
    const stepMs = Math.max(30, HERO_DURATION_MS / initAb)
    let cur = 0
    let dead = false

    const tick = () => {
      if (dead) return
      cur++
      setAb(cur)
      if (cur < initAb) setTimeout(tick, stepMs)
      else setHeroPlaying(false)
    }

    const t = setTimeout(tick, stepMs)
    return () => {
      dead = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally runs once on mount

  if (!vc) return null

  // === Union computation ===
  const union: bigint =
    sets === 3
      ? inclusionExclusion([
          { size: a, sign: 1 },
          { size: b, sign: 1 },
          { size: c, sign: 1 },
          { size: ab, sign: -1 },
          { size: ac, sign: -1 },
          { size: bc, sign: -1 },
          { size: abc3, sign: 1 },
        ])
      : unionSize(a, b, ab)
  const unionN = Number(union)

  // === Clamp helpers ===
  const clampAb = (v: number, na: number, nb: number) =>
    Math.max(0, Math.min(v, na, nb, maxSize))

  function stepA(d: number) {
    const na = Math.max(0, Math.min(a + d, maxSize))
    const nab = clampAb(ab, na, b)
    setA(na)
    setAb(nab)
    if (heroPlaying) setHeroPlaying(false)
  }

  function stepB(d: number) {
    const nb = Math.max(0, Math.min(b + d, maxSize))
    const nab = clampAb(ab, a, nb)
    setB(nb)
    setAb(nab)
    if (heroPlaying) setHeroPlaying(false)
  }

  function stepAb(d: number) {
    setAb(clampAb(ab + d, a, b))
    if (heroPlaying) setHeroPlaying(false)
  }

  // === sets:3 steppers ===
  function stepC(d: number) {
    const nc = Math.max(0, Math.min(c + d, maxSize))
    setC(nc)
    setAc(Math.min(ac, a, nc))
    setBc(Math.min(bc, b, nc))
  }
  function stepAc(d: number) {
    const nac = Math.max(0, Math.min(ac + d, a, c, maxSize))
    setAc(nac)
    setAbc3(Math.min(abc3, ab, nac, bc))
  }
  function stepBc(d: number) {
    const nbc = Math.max(0, Math.min(bc + d, b, c, maxSize))
    setBc(nbc)
    setAbc3(Math.min(abc3, ab, ac, nbc))
  }
  function stepAbc(d: number) {
    setAbc3(Math.max(0, Math.min(abc3 + d, ab, ac, bc, maxSize)))
  }

  // === Graded check ===
  function check() {
    const ok = isVennCounterCorrect({ accept }, union)
    if (ok) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      ladder.submitWrong()
    }
  }

  // === Feedback view ===
  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed
  const feedbackView: FeedbackView = isGraded
    ? ladder.view
    : { kind: 'note', text: resolved.correct }

  // === Primary action ===
  const primary = isGraded
    ? solved
      ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
      : { label: 'Check', enabled: true, onClick: check }
    : { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }

  // === SVG geometry ===
  const sep = circleSep(ab, a, b)
  const cxA = VENN_MIDX - sep / 2
  const cxB = VENN_MIDX + sep / 2

  return (
    <BeatShell
      primary={primary}
      feedback={feedbackView}
      onTryAgain={
        isGraded && revealed
          ? () => {
              ladder.tryAgain()
            }
          : undefined
      }
    >
      <div className="venn-counter">
        {/* aria-live region: announces all values to screen readers on every change */}
        <p
          aria-live="polite"
          aria-atomic="true"
          className="venn-counter__live"
        >
          {sets === 2
            ? `|A| = ${a}, |B| = ${b}, |A∩B| = ${ab}, |A∪B| = ${unionN}`
            : `|A| = ${a}, |B| = ${b}, |C| = ${c}, |A∩B| = ${ab}, |A∩C| = ${ac}, |B∩C| = ${bc}, |A∩B∩C| = ${abc3}, union = ${unionN}`}
        </p>

        {/* SVG Venn diagram */}
        {sets === 2 ? (
          <svg
            className="venn-counter__svg"
            viewBox="0 0 240 100"
            aria-hidden="true"
          >
            <defs>
              <clipPath id="venn-clip-a">
                <circle cx={cxA} cy={VENN_CY} r={VENN_R} />
              </clipPath>
            </defs>
            <circle cx={cxA} cy={VENN_CY} r={VENN_R} className="venn-counter__circle" />
            <circle cx={cxB} cy={VENN_CY} r={VENN_R} className="venn-counter__circle" />
            <circle
              cx={cxB}
              cy={VENN_CY}
              r={VENN_R}
              className="venn-counter__overlap"
              clipPath="url(#venn-clip-a)"
            />
            <text x={cxA} y={VENN_CY + 5} textAnchor="middle" className="venn-counter__set-label">
              A
            </text>
            <text x={cxB} y={VENN_CY + 5} textAnchor="middle" className="venn-counter__set-label">
              B
            </text>
          </svg>
        ) : (
          <svg
            className="venn-counter__svg"
            viewBox="0 0 240 120"
            aria-hidden="true"
          >
            <circle cx={120} cy={40} r={34} className="venn-counter__circle" />
            <circle cx={92} cy={84} r={34} className="venn-counter__circle" />
            <circle cx={148} cy={84} r={34} className="venn-counter__circle" />
            <text x={120} y={16} textAnchor="middle" className="venn-counter__set-label">A</text>
            <text x={64} y={96} textAnchor="middle" className="venn-counter__set-label">B</text>
            <text x={176} y={96} textAnchor="middle" className="venn-counter__set-label">C</text>
          </svg>
        )}

        {/* Live formula readout */}
        <p className="venn-counter__formula">
          {sets === 2
            ? `|A∪B| = ${a} + ${b} \u2212 ${ab} = ${unionN}`
            : `|A∪B∪C| = ${a} + ${b} + ${c} \u2212 ${ab} \u2212 ${ac} \u2212 ${bc} + ${abc3} = ${unionN}`}
        </p>

        {/* Stepper controls */}
        <div className="venn-counter__controls" role="group" aria-label="Set size controls">
          <div className="venn-counter__stepper">
            <span className="venn-counter__stepper-label">|A| = {a}</span>
            <button
              type="button"
              className="venn-counter__step-btn"
              aria-label="Decrease |A|"
              onClick={() => stepA(-1)}
              disabled={a <= 0 || heroPlaying}
            >
              −
            </button>
            <button
              type="button"
              className="venn-counter__step-btn"
              aria-label="Increase |A|"
              onClick={() => stepA(1)}
              disabled={a >= maxSize || heroPlaying}
            >
              +
            </button>
          </div>

          <div className="venn-counter__stepper">
            <span className="venn-counter__stepper-label">|B| = {b}</span>
            <button
              type="button"
              className="venn-counter__step-btn"
              aria-label="Decrease |B|"
              onClick={() => stepB(-1)}
              disabled={b <= 0 || heroPlaying}
            >
              −
            </button>
            <button
              type="button"
              className="venn-counter__step-btn"
              aria-label="Increase |B|"
              onClick={() => stepB(1)}
              disabled={b >= maxSize || heroPlaying}
            >
              +
            </button>
          </div>

          <div className="venn-counter__stepper">
            <span className="venn-counter__stepper-label">|A∩B| = {ab}</span>
            <button
              type="button"
              className="venn-counter__step-btn"
              aria-label="Decrease |A∩B|"
              onClick={() => stepAb(-1)}
              disabled={ab <= 0 || heroPlaying}
            >
              −
            </button>
            <button
              type="button"
              className="venn-counter__step-btn"
              aria-label="Increase |A∩B|"
              onClick={() => stepAb(1)}
              disabled={ab >= Math.min(a, b, maxSize) || heroPlaying}
            >
              +
            </button>
          </div>

          {sets === 3 && (
            <>
              <div className="venn-counter__stepper">
                <span className="venn-counter__stepper-label">|C| = {c}</span>
                <button
                  type="button"
                  className="venn-counter__step-btn"
                  aria-label="Decrease |C|"
                  onClick={() => stepC(-1)}
                  disabled={c <= 0}
                >
                  −
                </button>
                <button
                  type="button"
                  className="venn-counter__step-btn"
                  aria-label="Increase |C|"
                  onClick={() => stepC(1)}
                  disabled={c >= maxSize}
                >
                  +
                </button>
              </div>

              <div className="venn-counter__stepper">
                <span className="venn-counter__stepper-label">|A∩C| = {ac}</span>
                <button
                  type="button"
                  className="venn-counter__step-btn"
                  aria-label="Decrease |A∩C|"
                  onClick={() => stepAc(-1)}
                  disabled={ac <= 0}
                >
                  −
                </button>
                <button
                  type="button"
                  className="venn-counter__step-btn"
                  aria-label="Increase |A∩C|"
                  onClick={() => stepAc(1)}
                  disabled={ac >= Math.min(a, c, maxSize)}
                >
                  +
                </button>
              </div>

              <div className="venn-counter__stepper">
                <span className="venn-counter__stepper-label">|B∩C| = {bc}</span>
                <button
                  type="button"
                  className="venn-counter__step-btn"
                  aria-label="Decrease |B∩C|"
                  onClick={() => stepBc(-1)}
                  disabled={bc <= 0}
                >
                  −
                </button>
                <button
                  type="button"
                  className="venn-counter__step-btn"
                  aria-label="Increase |B∩C|"
                  onClick={() => stepBc(1)}
                  disabled={bc >= Math.min(b, c, maxSize)}
                >
                  +
                </button>
              </div>

              <div className="venn-counter__stepper">
                <span className="venn-counter__stepper-label">|A∩B∩C| = {abc3}</span>
                <button
                  type="button"
                  className="venn-counter__step-btn"
                  aria-label="Decrease |A∩B∩C|"
                  onClick={() => stepAbc(-1)}
                  disabled={abc3 <= 0}
                >
                  −
                </button>
                <button
                  type="button"
                  className="venn-counter__step-btn"
                  aria-label="Increase |A∩B∩C|"
                  onClick={() => stepAbc(1)}
                  disabled={abc3 >= Math.min(ab, ac, bc, maxSize)}
                >
                  +
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </BeatShell>
  )
}
