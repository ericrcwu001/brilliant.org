// Balance-scale solver beat. The learner adjusts a candidate value until a
// seesaw beam levels: left pan = unknown E_{solveState}, right pan = the
// first-step recurrence RHS evaluated at the candidate. When the pans balance
// the engine's solved value is revealed and the learner can advance.
// Mechanic #1 (physical metaphor) + #8 (feedback is part of the world).

import { useState, useEffect, useRef } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback } from '../feedback'
import type { FeedbackView } from '../FeedbackStrip'
import type { CanonicalRecurrence, StateId } from '../../engine/types'
import { balanceModel } from './balanceModel'

const EPSILON = 0.001
const MAX_TILT_DEG = 26

// ── Display helpers ──────────────────────────────────────────────────────────

// Returns a unicode fraction where possible (½, ⅓, ¼, ¾), else n/d.
function fmtCoeffNice(coeff: { n: number; d: number }): string {
  if (coeff.d === 1) return String(coeff.n)
  const map: Record<string, string> = {
    '1/2': '½',
    '1/3': '⅓',
    '2/3': '⅔',
    '1/4': '¼',
    '3/4': '¾',
  }
  return map[`${coeff.n}/${coeff.d}`] ?? `${coeff.n}/${coeff.d}`
}

const SUB_DIGITS = '₀₁₂₃₄₅₆₇₈₉'
function fmtState(id: string): string {
  return id.replace(/(\d+)$/, (_, n: string) =>
    n
      .split('')
      .map((d) => SUB_DIGITS[parseInt(d)])
      .join(''),
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export function BalanceSolveBeat({
  beat,
  pattern,
  automaton,
  reducedMotion,
  isLast,
  onAdvance,
  setLessonState,
  initialHintLevel,
  onHintLevelChange,
}: BeatProps) {
  // Extract interaction fields with safe defaults so hooks always run.
  const interaction = beat.interaction.type === 'balanceSolve' ? beat.interaction : null
  const min = interaction?.min ?? 0
  const max = interaction?.max ?? 10
  const step = interaction?.step ?? 1
  const solveState = (interaction?.solveState ?? 'E0') as StateId

  const { balancePoint, rhsAt, otherTerm, selfCoeff } = balanceModel(automaton, solveState)

  // Resolve the self-coefficient as a display-friendly fraction from the recurrence.
  const rec = (automaton.recurrences as Record<string, CanonicalRecurrence | undefined>)[solveState]
  const selfTerm = rec?.terms.find((t) => t.var === solveState)
  const selfCoeffStr = selfTerm ? fmtCoeffNice(selfTerm.coeff) : selfCoeff.toFixed(2)

  // Non-self terms are the states whose expected values were substituted into
  // otherTerm — displayed in the explanation so the learner sees the derivation.
  const nonSelfTerms = rec?.terms.filter((t) => t.var !== solveState) ?? []

  const [candidate, setCandidate] = useState(min)
  // Hint level: increments on demand; wired to initialHintLevel for persistence.
  const [hintIdx, setHintIdx] = useState(initialHintLevel ?? 0)
  const reported = useRef(false)

  const leftVal = candidate
  const rhsVal = rhsAt(candidate)
  const diff = leftVal - rhsVal
  const isBalanced = Math.abs(diff) < EPSILON

  // Tilt angle: proportional to (left − rhs), scaled by domain span, clamped.
  const span = max - min || 1
  const angle = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, (diff / span) * MAX_TILT_DEG))

  // Report theoreticalValue once so downstream beats (chart, recap) keep working.
  useEffect(() => {
    if (isBalanced && !reported.current) {
      reported.current = true
      setLessonState({ theoreticalValue: balancePoint })
    }
  }, [isBalanced, balancePoint, setLessonState])

  if (!interaction) return null

  const fb = resolveFeedback(beat.feedback, pattern)
  const view: FeedbackView = isBalanced ? { kind: 'correct', text: fb.correct } : { kind: 'idle' }

  const balanceStatus = isBalanced
    ? `Balanced! E[${pattern}] = ${balancePoint} flips — the only value that equals its own equation.`
    : diff < 0
      ? 'Too low — the equation still needs more flips than your guess.'
      : 'Too high — your guess is more than the equation needs.'

  const ariaValueText = [
    `E[${pattern}] = ${candidate} flips`,
    `equation needs ${Number.isInteger(rhsVal) ? rhsVal : rhsVal.toFixed(2)} flips`,
    isBalanced ? 'balanced' : diff < 0 ? 'too low' : 'too high',
  ].join('; ')

  // Substituted, collapsed RHS label — symbol and numeric value visibly agree.
  const substRhsLabel = `${otherTerm} + ${selfCoeffStr}·E[${pattern}]`

  // Pre-collapse RHS: the recurrence with the substituted numbers still visible
  // (e.g. "1 + ½·4 + ½·E[HH]") so the learner can see those knowns fold into the
  // collapsed constant rather than the constant appearing from nowhere.
  const expandedRhs = rec
    ? [
        String(rec.constant),
        ...rec.terms.map((t) =>
          t.var === solveState
            ? `${fmtCoeffNice(t.coeff)}·E[${pattern}]`
            : `${fmtCoeffNice(t.coeff)}·${automaton.expectedTimes[t.var]}`,
        ),
      ].join(' + ')
    : substRhsLabel

  // Explanation: substitute the known values, show the arithmetic that folds them
  // into the constant, then point at the scale mechanic. The unknown stays on both
  // sides, which is *why* we slide for the balancing value instead of reading it off.
  const substitutedParts = nonSelfTerms
    .map((t) => `${fmtState(t.var)} = ${automaton.expectedTimes[t.var]}`)
    .join(', ')
  const explainLine = substitutedParts
    ? `Substituting ${substitutedParts}: E[${pattern}] = ${expandedRhs} = ${substRhsLabel}. E[${pattern}] still appears on both sides, so slide your guess until the scale balances.`
    : `E[${pattern}] = ${substRhsLabel}. E[${pattern}] appears on both sides, so slide your guess until the scale balances.`

  // SVG beam geometry (viewBox 0 0 200 100):
  //   pivot at (100, 58), beam half-span 78px, stand+base below pivot.
  const cx = 100
  const cy = 58
  const hs = 78

  function revealNextHint() {
    const next = Math.min(hintIdx + 1, fb.hints.length)
    setHintIdx(next)
    onHintLevelChange?.(next)
  }

  return (
    <BeatShell
      feedback={view}
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: isBalanced,
        onClick: onAdvance,
      }}
    >
      <div className="balance">
        {/* ── Substituted recurrence explanation ── */}
        <p className="balance__explain">{explainLine}</p>

        {/* ── Beam visual ── */}
        <svg
          className="balance__svg"
          viewBox="0 0 200 100"
          aria-hidden="true"
          focusable="false"
        >
          {/* Stand and base (non-rotating) */}
          <line
            x1={cx}
            y1={cy + 5}
            x2={cx}
            y2={cy + 32}
            stroke="var(--graphite)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x={cx - 24}
            y={cy + 32}
            width={48}
            height={6}
            rx="3"
            fill="var(--rule)"
          />
          {/* Rotating beam group — transform-box:view-box via CSS class */}
          <g
            className={`balance__beam-g${reducedMotion ? '' : ' balance__beam-g--anim'}`}
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
            }}
          >
            <line
              x1={cx - hs}
              y1={cy}
              x2={cx + hs}
              y2={cy}
              stroke={isBalanced ? 'var(--correct)' : 'var(--ink)'}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Left pan disc */}
            <circle
              cx={cx - hs}
              cy={cy}
              r="8"
              fill={isBalanced ? 'var(--correct)' : 'var(--accent)'}
            />
            {/* Right pan disc */}
            <circle
              cx={cx + hs}
              cy={cy}
              r="8"
              fill={isBalanced ? 'var(--correct)' : 'var(--accent)'}
            />
          </g>
          {/* Pivot cap rendered above beam to mark the fulcrum */}
          <circle cx={cx} cy={cy} r="5.5" fill="var(--graphite)" />
        </svg>

        {/* ── Pan labels (visual supplement; screen reader uses aria-valuetext) ── */}
        <div className="balance__pans">
          <div className="balance__pan balance__pan--left">
            <span className="balance__pan-expr">E[{pattern}]</span>
            <span className="balance__pan-val">{candidate}</span>
            <span className="balance__pan-caption">your guess (flips)</span>
          </div>
          <div className="balance__pan-center">
            {isBalanced ? (
              <span className="balance__solved" aria-live="polite">
                E[{pattern}] = {balancePoint} flips
              </span>
            ) : (
              <span className="balance__equals">=</span>
            )}
          </div>
          <div className="balance__pan balance__pan--right">
            <span className="balance__pan-expr">{substRhsLabel}</span>
            <span className="balance__pan-val">
              {Number.isInteger(rhsVal) ? rhsVal : rhsVal.toFixed(2)}
            </span>
            <span className="balance__pan-caption">what the equation needs (flips)</span>
          </div>
        </div>

        {/* ── Candidate slider ── */}
        <div className="balance__control">
          <input
            type="range"
            className="balance__range"
            min={min}
            max={max}
            step={step}
            value={candidate}
            disabled={isBalanced}
            onChange={(e) => setCandidate(Number(e.target.value))}
            aria-label={`Candidate value for E[${pattern}]`}
            aria-valuetext={ariaValueText}
          />
          <p className="balance__hint" aria-live="polite" aria-atomic="true">
            {balanceStatus}
          </p>
        </div>

        {/* ── Progressive hint affordance ── */}
        {fb.hints.length > 0 && (
          <div className="balance__hints-area">
            {hintIdx > 0 && (
              <ul className="balance__revealed-hints">
                {fb.hints.slice(0, hintIdx).map((h, i) => (
                  <li key={i} className="balance__revealed-hint">
                    {h}
                  </li>
                ))}
              </ul>
            )}
            {hintIdx < fb.hints.length && (
              <button type="button" className="balance__hint-btn" onClick={revealNextHint}>
                {hintIdx === 0 ? 'Need a hint?' : 'Next hint'}
              </button>
            )}
          </div>
        )}
      </div>
    </BeatShell>
  )
}
