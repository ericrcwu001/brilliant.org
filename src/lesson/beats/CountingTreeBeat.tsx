// Product-rule tree for lesson-combinatorics-1: tap each level button to
// expand it and watch the running product update live. Graded when `accept`
// is present (type-in after all levels expanded); ungraded → Continue when
// all expanded. Hero variant auto-expands sequentially on mount (one slow
// cinematic pass before the learner acts). Reduced-motion → fully expanded
// final frame immediately if hero is set.

import { useState, useEffect } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import { product } from '../../engine/combinatorics'
import { isCountingTreeCorrect } from '../grading'

// Mirrors --dur-tell (600 ms) from tokens.generated.ts — used for hero step cadence.
const HERO_STEP_MS = 600

interface ConnectorProps {
  parentCount: number
  childCount: number
}

function ConnectorSvg({ parentCount, childCount }: ConnectorProps) {
  const lines: { x1: number; x2: number }[] = []
  const branchFactor = parentCount > 0 ? childCount / parentCount : childCount

  for (let p = 0; p < parentCount; p++) {
    const x1 = parentCount > 1 ? (p * 100) / (parentCount - 1) : 50
    for (let b = 0; b < branchFactor; b++) {
      const ci = p * branchFactor + b
      const x2 = childCount > 1 ? (ci * 100) / (childCount - 1) : 50
      lines.push({ x1, x2 })
    }
  }

  return (
    <svg
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className="counting-tree__connector"
      aria-hidden="true"
    >
      {lines.map((l, i) => (
        <line
          key={i}
          x1={`${l.x1}%`}
          y1="0"
          x2={`${l.x2}%`}
          y2="24"
          stroke="var(--ergo-line-2)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}

export function CountingTreeBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance, reducedMotion } = props

  // Derive interaction shape before hooks (hooks must be unconditional).
  // TypeScript cannot narrow across hook calls, so we extract the counting-tree
  // fields here via a narrowed conditional that gives the union member.
  const ctInteraction =
    beat.interaction.type === 'countingTree' ? beat.interaction : null
  const levels: Array<{ label: string; options: number }> =
    ctInteraction?.levels ?? []
  const accept: string[] | undefined = ctInteraction?.accept
  const isCounting = ctInteraction !== null
  const isGraded = !!accept
  const hasHero = !!beat.hero

  // Reduced-motion + hero → start fully expanded so learner sees the final frame.
  const startExpanded = hasHero && reducedMotion

  const [expanded, setExpanded] = useState<boolean[]>(() =>
    Array(levels.length).fill(startExpanded),
  )
  const [heroPlaying, setHeroPlaying] = useState(hasHero && !reducedMotion)
  const [value, setValue] = useState('')
  const [solved, setSolved] = useState(false)
  // Increment to re-key the product badge element, restarting the CSS pulse.
  const [productKey, setProductKey] = useState(0)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, pattern),
    required: beat.required,
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: isGraded ? props.reportNeedsReview : undefined,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: isGraded ? { lessonId: props.lessonId, beatId: beat.beatId } : undefined,
  })

  // Hero auto-play: expand each level sequentially at --dur-tell intervals.
  useEffect(() => {
    if (!isCounting || !hasHero || reducedMotion) return
    let idx = 0
    let cancelled = false

    const expandNext = () => {
      if (cancelled) return
      setExpanded((prev) => {
        const copy = [...prev]
        copy[idx] = true
        return copy
      })
      setProductKey((k) => k + 1)
      idx++
      if (idx < levels.length) {
        setTimeout(expandNext, HERO_STEP_MS)
      } else {
        setHeroPlaying(false)
      }
    }

    const timer = setTimeout(expandNext, HERO_STEP_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally runs once on mount; dependencies are stable setup values

  if (!isCounting) return null

  // Cumulative product at each level (number-safe for tree sizes ≤ 16 nodes).
  function countAt(upTo: number): number {
    return Number(product(levels.slice(0, upTo + 1).map((l) => l.options)))
  }

  const numExpanded = expanded.filter(Boolean).length
  const runningProduct =
    numExpanded > 0
      ? product(levels.slice(0, numExpanded).map((l) => l.options)).toString()
      : ''
  const allExpanded = expanded.every(Boolean)

  function handleExpand(i: number) {
    if (heroPlaying) setHeroPlaying(false) // user taps during hero → interrupt
    setExpanded((prev) => {
      const copy = [...prev]
      copy[i] = true
      return copy
    })
    setProductKey((k) => k + 1)
  }

  function check() {
    const ok = isCountingTreeCorrect({ levels, accept }, value)
    if (ok) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      ladder.submitWrong()
    }
  }

  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed
  const isWrong = !solved && !revealed && ladder.view.kind === 'hint'

  const primary = isGraded
    ? solved
      ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
      : {
          label: 'Check',
          enabled: allExpanded && value.trim() !== '',
          onClick: check,
        }
    : { label: isLast ? 'Finish' : 'Continue', enabled: allExpanded, onClick: onAdvance }

  return (
    <BeatShell
      primary={primary}
      feedback={isGraded ? ladder.view : undefined}
      onTryAgain={
        isGraded && revealed
          ? () => {
              ladder.tryAgain()
              setValue('')
            }
          : undefined
      }
    >
      <div className="counting-tree">
        {/* Running-product badge — aria-live so screen readers hear each update */}
        <p
          aria-live="polite"
          aria-atomic="true"
          className="counting-tree__product-live"
        >
          {runningProduct && (
            <span key={productKey} className="counting-tree__product-badge">
              {`Running total: ${runningProduct}`}
            </span>
          )}
        </p>

        {/* Tree level rows */}
        <div className="counting-tree__levels">
          {levels.map((level, i) => {
            const isExpanded = expanded[i]
            const currentCount = isExpanded ? countAt(i) : 0
            const prevCount = i === 0 ? 1 : countAt(i - 1)
            const nextExpanded = i < levels.length - 1 && expanded[i + 1]
            const nextCount = nextExpanded ? countAt(i + 1) : 0
            // Only allow expanding the next un-expanded level in sequence.
            const isDisabled =
              isExpanded || (i > 0 && !expanded[i - 1]) || heroPlaying

            return (
              <div key={i} className="counting-tree__level-group">
                <div className="counting-tree__level">
                  <button
                    type="button"
                    className={
                      'counting-tree__expand-btn' +
                      (isExpanded ? ' counting-tree__expand-btn--on' : '')
                    }
                    disabled={isDisabled}
                    aria-expanded={isExpanded}
                    onClick={() => {
                      if (!isExpanded && !isDisabled) handleExpand(i)
                    }}
                  >
                    {level.label}
                  </button>
                  {isExpanded && (
                    <div
                      className="counting-tree__nodes"
                      role="group"
                      aria-label={`${level.label} nodes`}
                    >
                      {Array.from({ length: currentCount }, (_, j) => (
                        <span
                          key={j}
                          className="counting-tree__node"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  )}
                </div>
                {/* Connector SVG between this level and the next expanded level */}
                {isExpanded && nextExpanded && (
                  <ConnectorSvg
                    parentCount={currentCount}
                    childCount={nextCount}
                  />
                )}
                {/* Connector from root (count=1) to level 0 when level 1 exists */}
                {i === 0 && isExpanded && prevCount === 1 && nextExpanded && null}
              </div>
            )
          })}
        </div>

        {/* Notation badge (e.g. "= n!" for l1-model) */}
        {allExpanded && beat.introducesSymbol && (
          <span
            className="counting-tree__notation-badge"
            aria-label={`equals ${beat.introducesSymbol}`}
          >
            {`= ${beat.introducesSymbol}`}
          </span>
        )}

        {/* Answer input — graded mode, all levels expanded, not yet solved */}
        {isGraded && allExpanded && !solved && !revealed && (
          <label className="counting-tree__answer">
            <span className="counting-tree__answer-label">Your answer:</span>
            <input
              type="text"
              inputMode="numeric"
              className={
                'counting-tree__input answer-entry__input' +
                (isWrong ? ' answer-entry__input--wrong' : '')
              }
              value={value}
              aria-label="Enter the total count"
              autoComplete="off"
              onChange={(e) => {
                setValue(e.target.value)
                ladder.clear()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && value.trim() !== '' && allExpanded) {
                  e.preventDefault()
                  check()
                }
              }}
            />
          </label>
        )}

        {/* Show revealed answer */}
        {isGraded && revealed && (
          <label className="counting-tree__answer">
            <span className="counting-tree__answer-label">Answer:</span>
            <input
              type="text"
              inputMode="numeric"
              className="counting-tree__input answer-entry__input answer-entry__input--correct"
              value={accept![0]}
              disabled
              aria-label="Answer"
              readOnly
            />
          </label>
        )}

        {/* Show solved answer */}
        {isGraded && solved && (
          <label className="counting-tree__answer">
            <span className="counting-tree__answer-label">Your answer:</span>
            <input
              type="text"
              inputMode="numeric"
              className="counting-tree__input answer-entry__input answer-entry__input--correct"
              value={value}
              disabled
              aria-label="Your answer"
              readOnly
            />
          </label>
        )}
      </div>
    </BeatShell>
  )
}
