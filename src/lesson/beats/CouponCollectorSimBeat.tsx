// L5 coupon-collector sim: draw boxes until all N types collected (interaction-spec §5).
// N pill cells; "Draw box" button (≥44px, Space/Enter); running Σ N/(N−i+1) panel
// (JetBrains Mono tabular-nums, aria-live="polite"); stage-prob pill (N−k)/N;
// new-type aria-live="assertive"; hero slowFirst 500ms/box auto-draw on first run;
// reduced-motion → final frame (all N filled, Σ = N·H_N). DOM/SVG, not Konva.
// Reads --ch2 (#0D9488) from CSS. UNGRADED in L5 (no accept); Continue after set complete.

import { useState, useEffect, useRef } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import type { FeedbackView } from '../feedback'
import { resolveFeedback } from '../feedbackResolve'
import { harmonic, couponCollector } from '../../engine/expectation'

const HERO_MS = 500

function fmtFrac(n: number, d: number): string {
  return d === 1 ? String(n) : `${n}/${d}`
}

function sigmaTerms(n: number, k: number): string[] {
  const terms: string[] = []
  for (let j = 0; j < k; j++) {
    terms.push(`${n}/${n - j}`)
  }
  return terms
}

function sigmaTotal(n: number, k: number): number {
  let sum = 0
  for (let j = 0; j < k; j++) {
    sum += n / (n - j)
  }
  return sum
}

export function CouponCollectorSimBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion, pattern } = props

  const interaction = beat.interaction
  const isCCS = interaction.type === 'couponCollectorSim'
  const n = isCCS ? interaction.n : 1
  const slowFirst = !!(beat.hero?.slowFirst)
  const fb = resolveFeedback(beat.feedback, pattern)

  const hN = harmonic(n)
  const fullSetR = couponCollector(n)
  const fullSetDecimal = (fullSetR.n / fullSetR.d).toFixed(1)

  const showFinal = !!(reducedMotion && beat.hero?.reducedMotionFinalFrame)

  const [collected, setCollected] = useState<boolean[]>(() =>
    new Array(n).fill(showFinal),
  )
  const [setComplete, setSetComplete] = useState(showFinal)
  const [lastNewType, setLastNewType] = useState<number | null>(showFinal ? n - 1 : null)
  const [newTypeKey, setNewTypeKey] = useState(0)
  const [drawCount, setDrawCount] = useState(showFinal ? Math.round(fullSetR.n / fullSetR.d) : 0)
  const [heroRunning, setHeroRunning] = useState(!reducedMotion && slowFirst)

  const collectedCountRef = useRef(showFinal ? n : 0)
  const heroTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const k = collected.filter(Boolean).length

  function applyDraw(prev: boolean[]): boolean[] {
    const typeIdx = Math.floor(Math.random() * n)
    const next = [...prev]
    if (!next[typeIdx]) {
      next[typeIdx] = true
      setLastNewType(typeIdx)
      setNewTypeKey((c) => c + 1)
    }
    return next
  }

  function handleDraw() {
    if (setComplete) return
    setCollected((prev) => {
      const next = applyDraw(prev)
      const newK = next.filter(Boolean).length
      collectedCountRef.current = newK
      if (newK === n) setSetComplete(true)
      return next
    })
    setDrawCount((prev) => prev + 1)
  }

  useEffect(() => {
    if (!heroRunning || setComplete) {
      if (heroTimerRef.current) clearTimeout(heroTimerRef.current)
      return
    }
    heroTimerRef.current = setTimeout(() => {
      setCollected((prev) => {
        const next = applyDraw(prev)
        const newK = next.filter(Boolean).length
        collectedCountRef.current = newK
        if (newK === n) {
          setSetComplete(true)
          setHeroRunning(false)
        }
        return next
      })
      setDrawCount((d) => d + 1)
    }, HERO_MS)
    return () => {
      if (heroTimerRef.current) clearTimeout(heroTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroRunning, setComplete, n])

  useEffect(() => {
    return () => {
      if (heroTimerRef.current) clearTimeout(heroTimerRef.current)
    }
  }, [])

  if (!isCCS) return null

  const terms = sigmaTerms(n, k)
  const runningSum = sigmaTotal(n, k)
  const runningSumStr = runningSum.toFixed(2)

  const remainingNew = n - k
  const stageProbNum = remainingNew
  const stageProbDen = n
  const stageProbDecimal = k < n ? (remainingNew / n).toFixed(2) : '0.00'

  const termsDisplay = terms.length > 0 ? terms.join(' + ') : '—'
  const sigmaDisplay =
    showFinal
      ? `${fmtFrac(n, 1)}·H_${n} = ${fmtFrac(hN.n, hN.d)} = ${fullSetDecimal}`
      : k > 0
        ? `${termsDisplay} = ${runningSumStr}${k < n ? ' …' : ''}`
        : '—'

  const assertiveText =
    lastNewType !== null && newTypeKey > 0
      ? `Found type ${lastNewType + 1}! ${k} of ${n} collected. Next-new probability: ${stageProbNum}/${stageProbDen}.`
      : ''

  const feedbackView: FeedbackView = setComplete
    ? { kind: 'correct', text: fb.correct }
    : { kind: 'idle' }

  const drawBtnLabel = showFinal ? 'Show final state' : 'Draw box'

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: setComplete,
        onClick: onAdvance,
        variant: 'ghost',
      }}
      feedback={feedbackView}
    >
      <div className="ccsim">
        <div className="ccsim__grid" role="list" aria-label={`${n} toy types`}>
          {collected.map((isCollected, i) => (
            <div
              key={i}
              role="listitem"
              className={[
                'ccsim__type-pill',
                isCollected ? 'ccsim__type-pill--collected' : '',
                isCollected && lastNewType === i && newTypeKey > 0
                  ? 'ccsim__type-pill--new'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`Type ${i + 1}${isCollected ? ', collected' : ', not yet found'}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {!showFinal && (
          <button
            type="button"
            className="ccsim__draw-btn"
            disabled={setComplete || heroRunning}
            onClick={handleDraw}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                handleDraw()
              }
            }}
            aria-label="Draw box"
          >
            {drawBtnLabel}
          </button>
        )}

        <div className="ccsim__sigma-panel">
          <span className="ccsim__sigma-terms">Σ N/(N−i+1): </span>
          <span
            aria-live="polite"
            aria-atomic="true"
            className="ccsim__sigma-total"
          >
            {sigmaDisplay}
          </span>
        </div>

        {k < n && !showFinal && (
          <div
            className={`ccsim__stage-prob${k > 0 ? ' ccsim__stage-prob--active' : ''}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {`Next-new prob: (${n}−${k})/${n} = ${stageProbNum}/${stageProbDen} ≈ ${stageProbDecimal}`}
          </div>
        )}

        {setComplete && (
          <div className="ccsim__draw-count">
            {`Set complete in ${drawCount} draws`}
          </div>
        )}

        <div
          aria-live="assertive"
          aria-atomic="true"
          className="ccsim__announce-assertive"
        >
          {assertiveText}
        </div>

        <div
          aria-live="polite"
          aria-atomic="true"
          className="ccsim__announce-polite"
        >
          {setComplete
            ? `Set complete — all ${n} types collected in ${drawCount} draws.`
            : k > 0
              ? `Running total: ${runningSumStr}. ${k} of ${n} types collected.`
              : ''}
        </div>
      </div>
    </BeatShell>
  )
}
