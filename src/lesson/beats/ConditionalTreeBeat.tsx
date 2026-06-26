// L4 tap-to-expand conditional expectation case tree (interaction-spec §4).
// Root "Roll die" node; each case branch is a ≥44px expandable button showing
// P(case) and either a literal E[X|case] or a `restart` branch (add+E[X]) with
// a curved SVG loop-back arc to the root. After all branches expanded the root
// recombines and the solve equation animates to E[X]=totalExpectation(cases).
// DOM/SVG, not Konva. Reads --ch1 (indigo #4F46E5) accent. UNGRADED in L4.

import { useState, useEffect, useRef } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import type { FeedbackView } from '../feedback'
import { resolveFeedback } from '../feedbackResolve'
import { totalExpectation } from '../../engine/expectation'
import type { Rational } from '../../engine/types'

const SVG_W = 320
const SVG_H = 155
const ROOT_CX = SVG_W / 2
const ROOT_CY = 28
const ROOT_R = 24
const BRANCH_L_CX = 80
const BRANCH_R_CX = SVG_W - 80
const BRANCH_CY = 122
const BRANCH_R = 20

const TOKEN_MS = 100
const SOLVE_DELAY_MS = 500

function fmtFrac(r: Rational): string {
  return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`
}

type EquationToken = { text: string; isFinal: boolean }

function buildTokens(
  cases: { p: Rational; value?: Rational; restart?: { add: Rational } }[],
  result: Rational,
): EquationToken[] {
  const hasRestart = cases.some((c) => c.restart)
  const terms = cases.map((c) => {
    const p = fmtFrac(c.p)
    if (c.value) return `${p}·${fmtFrac(c.value)}`
    if (c.restart) return `${p}·(${fmtFrac(c.restart.add)}+E[X])`
    return p
  })
  const tokens: EquationToken[] = [
    { text: terms.join(' + '), isFinal: false },
  ]
  if (hasRestart) {
    tokens.push({ text: ' = E[X]', isFinal: false })
    tokens.push({ text: ` \u2192 E[X] = ${fmtFrac(result)}`, isFinal: true })
  } else {
    tokens.push({ text: ` = ${fmtFrac(result)}`, isFinal: true })
  }
  return tokens
}

export function ConditionalTreeBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion, pattern } = props

  const interaction = beat.interaction
  const isCtree = interaction.type === 'conditionalTree'
  const cases = isCtree ? interaction.cases : []
  const hero = beat.hero
  const fb = resolveFeedback(beat.feedback, pattern)
  const showFinal = !!(reducedMotion && hero?.reducedMotionFinalFrame)

  const result: Rational = isCtree ? totalExpectation(cases) : { n: 0, d: 1 }
  const tokens = buildTokens(cases, result)
  const tokenCount = tokens.length

  const [expanded, setExpanded] = useState<boolean[]>(() =>
    new Array(cases.length).fill(showFinal),
  )
  const [politeText, setPoliteText] = useState('')
  const [revealedCount, setRevealedCount] = useState(showFinal ? tokenCount : 0)
  // Ref prevents double-scheduling; initialized true when already in final frame.
  const scheduledRef = useRef(showFinal)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const allExpanded = cases.length > 0 && expanded.every(Boolean)
  const equationVisible = revealedCount > 0
  const solveDone = allExpanded && revealedCount >= tokenCount

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function handleExpand(idx: number) {
    if (expanded[idx]) return
    const c = cases[idx]
    let announcement: string
    if (c.value) {
      announcement = `${c.label}: P equals ${fmtFrac(c.p)}, E[X given case] equals ${fmtFrac(c.value)}`
    } else if (c.restart) {
      announcement = `${c.label}: P equals ${fmtFrac(c.p)}, restarts — worth ${fmtFrac(c.restart.add)} plus E[X]`
    } else {
      announcement = c.label
    }
    setPoliteText(announcement)
    setExpanded((prev) => {
      const next = [...prev]
      next[idx] = true
      return next
    })
  }

  // Schedule token reveals via setTimeout to avoid direct setState in effect body.
  useEffect(() => {
    if (!allExpanded || scheduledRef.current) return
    scheduledRef.current = true
    const baseDelay = reducedMotion ? 0 : SOLVE_DELAY_MS
    const stepDelay = reducedMotion ? 0 : TOKEN_MS
    for (let i = 0; i < tokenCount; i++) {
      const n = i + 1
      const id = setTimeout(() => setRevealedCount(n), baseDelay + i * stepDelay)
      timersRef.current.push(id)
    }
  }, [allExpanded, reducedMotion, tokenCount])

  useEffect(() => () => clearTimers(), [])

  if (!isCtree) return null

  const bxs = cases.map((_, i) => (i === 0 ? BRANCH_L_CX : BRANCH_R_CX))
  const restartIdx = cases.findIndex((c) => c.restart)
  const assertiveText = solveDone ? `E[X] = ${fmtFrac(result)}` : ''

  const feedbackView: FeedbackView = solveDone
    ? { kind: 'correct', text: fb.correct }
    : { kind: 'idle' }

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: solveDone,
        onClick: onAdvance,
        variant: 'ghost',
      }}
      feedback={feedbackView}
    >
      <div className="ctree">
        {/* Decorative SVG: root circle, connector lines, branch anchors, loop arc */}
        <svg
          className="ctree__svg"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          aria-hidden="true"
        >
          {/* Connector lines root → each branch */}
          {bxs.map((bx, i) => (
            <line
              key={i}
              x1={ROOT_CX}
              y1={ROOT_CY + ROOT_R}
              x2={bx}
              y2={BRANCH_CY - BRANCH_R}
              className="ctree__branch-line"
            />
          ))}

          {/* Loop-back arc: restart branch → root (cubic Bézier, dashed --ch1) */}
          {restartIdx >= 0 && expanded[restartIdx] && (
            <path
              d={`M ${bxs[restartIdx]} ${BRANCH_CY - BRANCH_R} C ${bxs[restartIdx] + 72} ${BRANCH_CY - 55}, ${ROOT_CX + 72} ${ROOT_CY - 10}, ${ROOT_CX + ROOT_R} ${ROOT_CY}`}
              className={`ctree__loop-arc${reducedMotion ? '' : ' ctree__loop-arc--animate'}`}
            />
          )}

          {/* Root circle */}
          <circle cx={ROOT_CX} cy={ROOT_CY} r={ROOT_R} className="ctree__root-circle" />
          <text
            x={ROOT_CX}
            y={ROOT_CY}
            textAnchor="middle"
            dominantBaseline="central"
            className="ctree__root-label"
          >
            Roll die
          </text>

          {/* Branch anchor circles (decorative; coloured when expanded) */}
          {bxs.map((bx, i) => (
            <circle
              key={i}
              cx={bx}
              cy={BRANCH_CY}
              r={BRANCH_R}
              className={`ctree__branch-anchor${expanded[i] ? ' ctree__branch-anchor--expanded' : ''}`}
            />
          ))}
        </svg>

        {/* Interactive branch buttons (≥44px hit zone via min-height + padding) */}
        <div className="ctree__branches">
          {cases.map((c, i) => {
            const isExpanded = expanded[i]
            let detail = ''
            if (isExpanded) {
              if (c.value) {
                detail = `P = ${fmtFrac(c.p)} · E[X|case] = ${fmtFrac(c.value)}`
              } else if (c.restart) {
                detail = `P = ${fmtFrac(c.p)} · ${fmtFrac(c.restart.add)} + E[X]`
              }
            }
            return (
              <button
                key={i}
                type="button"
                className={`ctree__branch-btn${isExpanded ? ' ctree__branch-btn--expanded' : ''}`}
                aria-expanded={isExpanded}
                onClick={() => handleExpand(i)}
                disabled={isExpanded}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleExpand(i)
                  }
                }}
              >
                <span className="ctree__branch-name">{c.label}</span>
                {isExpanded && detail && (
                  <span className="ctree__branch-detail">{detail}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Aria-live regions */}
        <div aria-live="polite" aria-atomic="true" className="ctree__announce-polite">
          {politeText}
        </div>
        <div aria-live="assertive" aria-atomic="true" className="ctree__announce-assertive">
          {assertiveText}
        </div>

        {/* Equation solve: token-by-token reveal; final token highlighted */}
        {equationVisible && (
          <div className="ctree__equation">
            {tokens.slice(0, revealedCount).map((tok, i) => (
              <span
                key={i}
                className={tok.isFinal ? 'ctree__eq-final' : undefined}
              >
                {tok.text}
              </span>
            ))}
          </div>
        )}
      </div>
    </BeatShell>
  )
}
