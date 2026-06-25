// Bayesian belief-update widget (concept-bayes-rule, Wave 0). Three display
// modes: 'bars' (drag prior, watch posterior swing), 'tree' (icon array /
// confusion grid), 'sequence' (posterior climbs per observation). DOM/SVG only,
// no Konva. All displayed numbers via src/engine/bayes.ts (exact rationals).

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import {
  bayesPosterior,
  sequentialPosterior,
  naturalFrequencies,
  formatRational,
} from '../../engine/bayes'
import { ratSub } from '../../engine/automaton'
import type { Rational } from '../../engine/types'

const ONE: Rational = { n: 1, d: 1 }

// Narrowed interaction type alias for readability in the sub-components.
type BayesIx = Extract<BeatProps['beat']['interaction'], { type: 'bayesUpdate' }>

// ── Bars display: two paths keyed on a `direct` predicate.
//   direct = false (n===2 && interactive!==false): 2-hypothesis drag-slider — existing path, unchanged.
//   direct = true  (n>2 || interactive===false):   static N-bar render via bayesPosterior, no slider.
function BarsDisplay({
  ix,
  beat,
  isLast,
  onAdvance,
  reducedMotion,
}: {
  ix: BayesIx
  beat: BeatProps['beat']
  isLast: boolean
  onAdvance: () => void
  reducedMotion: boolean
}) {
  const priors = ix.priors ?? [{ n: 1, d: 2 }, { n: 1, d: 2 }]
  const likelihoods = ix.likelihoods ?? [{ n: 1, d: 1 }, { n: 1, d: 2 }]
  const n = ix.hypotheses.length
  const direct = n > 2 || ix.interactive === false

  // Hooks must be declared unconditionally. initPct / priorPct are only used on
  // Path A (slider); interacted starts true on Path B so Continue is immediate.
  const initPct = Math.round((priors[0].n / priors[0].d) * 100)
  const [priorPct, setPriorPct] = useState(initPct)
  const [interacted, setInteracted] = useState(direct || reducedMotion)

  if (!direct) {
    // ── PATH A: 2-hypothesis drag-slider — EXISTING body, BYTE-FOR-BYTE UNCHANGED ──
    const livePrior: Rational[] = [
      { n: priorPct, d: 100 },
      { n: 100 - priorPct, d: 100 },
    ]
    const post = bayesPosterior(livePrior, likelihoods)
    const postPct0 = Math.round((post[0].n / post[0].d) * 100)
    const postPct1 = 100 - postPct0
    const postStr = formatRational(post[0])
    const livePostStr = `Posterior: ${post[0].n} in ${post[0].d}`

    return (
      <BeatShell
        primary={{
          label: isLast ? 'Finish' : 'Continue',
          enabled: interacted,
          onClick: onAdvance,
        }}
      >
        <div className="bayes-bars">
          {beat.hero && (
            <p className="sr-only">{beat.hero.structuralReadout}</p>
          )}
          <div className="bayes-bars__hypotheses">
            <span className="bayes-bars__label">{ix.hypotheses[0]}</span>
            <span className="bayes-bars__label">{ix.hypotheses[1]}</span>
          </div>
          <div className="bayes-bars__row">
            <span className="bayes-bars__rowlabel">Prior</span>
            <div className="bayes-bars__track">
              <div
                className="bayes-bars__fill bayes-bars__fill--h0"
                style={{ width: `${priorPct}%`, transition: reducedMotion ? 'none' : undefined }}
              />
              <div
                className="bayes-bars__fill bayes-bars__fill--h1"
                style={{ width: `${100 - priorPct}%`, transition: reducedMotion ? 'none' : undefined }}
              />
            </div>
          </div>
          <label className="bayes-bars__dragrow">
            <span className="bayes-bars__draglabel">
              Drag prior: {ix.hypotheses[0]} = {priorPct}%
            </span>
            <input
              type="range"
              className="bayes-bars__range"
              min={0}
              max={100}
              value={priorPct}
              disabled={ix.interactive === false}
              onChange={(e) => {
                setPriorPct(Number(e.target.value))
                setInteracted(true)
              }}
              aria-label={`Prior probability of ${ix.hypotheses[0]}: ${priorPct}%`}
              style={{ minHeight: '44px' }}
            />
          </label>
          {ix.evidence && (
            <p className="bayes-bars__evidence">
              Evidence observed: <strong>{ix.evidence}</strong>
            </p>
          )}
          <div className="bayes-bars__row">
            <span className="bayes-bars__rowlabel">Posterior</span>
            <div className="bayes-bars__track">
              <div
                className="bayes-bars__fill bayes-bars__fill--h0"
                style={{ width: `${postPct0}%`, transition: reducedMotion ? 'none' : 'width 0.3s ease' }}
              />
              <div
                className="bayes-bars__fill bayes-bars__fill--h1"
                style={{ width: `${postPct1}%`, transition: reducedMotion ? 'none' : 'width 0.3s ease' }}
              />
            </div>
            <span className="bayes-bars__value">{postStr}</span>
          </div>
          <p role="status" aria-live="polite" className="sr-only">
            {livePostStr}
          </p>
        </div>
      </BeatShell>
    )
  }

  // ── PATH B: DIRECT render (n>2 and/or interactive:false) ──
  // bayesPosterior is already n-way; 0/1 likelihoods (Monty Hall) fall out naturally.
  const post = bayesPosterior(priors, likelihoods)
  const focalStr = formatRational(post[0])
  const ariaStatus = ix.hypotheses
    .map((h, i) => `${h} ${post[i].n} in ${post[i].d}`)
    .join(', ')

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: true,
        onClick: onAdvance,
      }}
    >
      <div className="bayes-bars">
        {beat.hero && (
          <p className="sr-only">{beat.hero.structuralReadout}</p>
        )}
        <span className="bayes-bars__rowlabel">Prior</span>
        {ix.hypotheses.map((hyp, i) => (
          <div key={i} className="bayes-bars__row">
            <span className="bayes-bars__label">{hyp}</span>
            <div className="bayes-bars__track">
              <div
                className={`bayes-bars__fill bayes-bars__fill--h${Math.min(i, 2)}`}
                style={{
                  width: `${Math.round((priors[i].n / priors[i].d) * 100)}%`,
                  transition: reducedMotion ? 'none' : undefined,
                }}
                aria-label={`${hyp} prior`}
              />
            </div>
          </div>
        ))}
        {ix.evidence && (
          <p className="bayes-bars__evidence">
            Evidence observed: <strong>{ix.evidence}</strong>
          </p>
        )}
        <span className="bayes-bars__rowlabel">Posterior</span>
        {ix.hypotheses.map((hyp, i) => {
          const pct = Math.round((post[i].n / post[i].d) * 100)
          return (
            <div key={i} className="bayes-bars__row">
              <span className="bayes-bars__label">
                {hyp}: {formatRational(post[i])}
              </span>
              <div className="bayes-bars__track">
                <div
                  className={`bayes-bars__fill bayes-bars__fill--h${Math.min(i, 2)}`}
                  style={{
                    width: `${pct}%`,
                    transition: reducedMotion ? 'none' : 'width 0.3s ease',
                  }}
                  aria-label={`${hyp}: ${formatRational(post[i])}`}
                />
              </div>
            </div>
          )
        })}
        <span className="bayes-bars__value">{focalStr}</span>
        <p role="status" aria-live="polite" className="sr-only">
          {`Posterior: ${ariaStatus}`}
        </p>
      </div>
    </BeatShell>
  )
}

// ── Tree display: icon array. Two modes keyed by hero presence.
//   hero=true  → large confusion grid (naturalFrequencies), draggable prevalence.
//   hero=false → small tap-partition (graded); learner taps the focal-class icons.
function TreeDisplay({
  ix,
  beat,
  isLast,
  onAdvance,
  reducedMotion,
  props,
}: {
  ix: BayesIx
  beat: BeatProps['beat']
  isLast: boolean
  onAdvance: () => void
  reducedMotion: boolean
  props: BeatProps
}) {
  if (beat.hero) {
    return (
      <TreeLargeDisplay
        ix={ix}
        beat={beat}
        isLast={isLast}
        onAdvance={onAdvance}
        reducedMotion={reducedMotion}
      />
    )
  }
  return (
    <TreeSmallDisplay
      ix={ix}
      beat={beat}
      isLast={isLast}
      onAdvance={onAdvance}
      props={props}
    />
  )
}

// ── Tree large: confusion grid with draggable prevalence. Hero (ungraded).
function TreeLargeDisplay({
  ix,
  beat,
  isLast,
  onAdvance,
  reducedMotion,
}: {
  ix: BayesIx
  beat: BeatProps['beat']
  isLast: boolean
  onAdvance: () => void
  reducedMotion: boolean
}) {
  const priors = ix.priors ?? [{ n: 1, d: 100 }, { n: 99, d: 100 }]
  const likelihoods = ix.likelihoods ?? [{ n: 99, d: 100 }, { n: 1, d: 100 }]
  const population = ix.population ?? 10000
  const initPct = Math.round((priors[0].n / priors[0].d) * 100)
  const [prevPct, setPrevPct] = useState(initPct)
  const [interacted, setInteracted] = useState(reducedMotion)

  const livePrior: Rational = { n: prevPct, d: 100 }
  const sensitivity = likelihoods[0]
  const specificity = ratSub(ONE, likelihoods[1])
  const freq = naturalFrequencies(livePrior, sensitivity, specificity, population)
  const ppvStr = formatRational(freq.ppv)
  const liveStatus = `${freq.tp.n} true positives, ${freq.fp.n} false positives — ${ppvStr} are ${ix.hypotheses[0].toLowerCase()}`

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: interacted,
        onClick: onAdvance,
      }}
    >
      <div className="bayes-tree">
        {beat.hero && (
          <p className="sr-only">{beat.hero.structuralReadout}</p>
        )}
        <label className="bayes-tree__dragrow">
          <span className="bayes-tree__draglabel">
            Prevalence ({ix.hypotheses[0]}): {prevPct}%
          </span>
          <input
            type="range"
            className="bayes-tree__range"
            min={0}
            max={100}
            value={prevPct}
            onChange={(e) => {
              setPrevPct(Number(e.target.value))
              setInteracted(true)
            }}
            aria-label={`Prevalence of ${ix.hypotheses[0]}: ${prevPct}%`}
            style={{ minHeight: '44px' }}
          />
        </label>
        {ix.evidence && (
          <p className="bayes-tree__evidence">
            Test result: <strong>{ix.evidence}</strong>
          </p>
        )}
        <table className="bayes-tree__grid" aria-label="Confusion grid">
          <thead>
            <tr>
              <th />
              <th>Test +</th>
              <th>Test −</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{ix.hypotheses[0]}</th>
              <td className="bayes-tree__tp" aria-label={`True positives: ${freq.tp.n}`}>{freq.tp.n}</td>
              <td className="bayes-tree__fn" aria-label={`False negatives: ${freq.fn.n}`}>{freq.fn.n}</td>
            </tr>
            <tr>
              <th scope="row">{ix.hypotheses[1]}</th>
              <td className="bayes-tree__fp" aria-label={`False positives: ${freq.fp.n}`}>{freq.fp.n}</td>
              <td className="bayes-tree__tn" aria-label={`True negatives: ${freq.tn.n}`}>{freq.tn.n}</td>
            </tr>
          </tbody>
        </table>
        <p className="bayes-tree__ppv">
          P({ix.hypotheses[0]} | {ix.evidence ?? 'positive'}) = <strong>{ppvStr}</strong>
        </p>
        <p role="status" aria-live="polite" className="sr-only">
          {liveStatus}
        </p>
      </div>
    </BeatShell>
  )
}

// ── Tree small: equal-likelihood tap-partition (graded). Learner taps the icons
//   that belong to the focal hypothesis. Check passes iff all focal icons are
//   tapped (exactly focalCount selected). No motion to suppress (static buttons).
function TreeSmallDisplay({
  ix,
  beat,
  isLast,
  onAdvance,
  props,
}: {
  ix: BayesIx
  beat: BeatProps['beat']
  isLast: boolean
  onAdvance: () => void
  props: BeatProps
}) {
  const priors = ix.priors ?? [{ n: 1, d: 2 }, { n: 1, d: 2 }]
  const likelihoods = ix.likelihoods ?? [{ n: 1, d: 1 }, { n: 1, d: 2 }]
  const population = ix.population ?? 3
  const post = bayesPosterior(priors, likelihoods)
  const focalCount = Math.round((post[0].n / post[0].d) * population)

  const [tapped, setTapped] = useState<Set<number>>(new Set())
  const [solved, setSolved] = useState(false)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, props.pattern),
    required: beat.required,
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: props.reportNeedsReview,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: { lessonId: props.lessonId, beatId: beat.beatId },
  })

  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed

  function toggle(i: number) {
    if (solved || revealed) return
    setTapped((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
    ladder.clear()
  }

  function check() {
    // Correct iff exactly the first focalCount icons are all tapped.
    const correct =
      tapped.size === focalCount &&
      Array.from({ length: focalCount }, (_, i) => i).every((i) => tapped.has(i))
    if (correct) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      ladder.submitWrong()
    }
  }

  const countStr = `${tapped.size} of ${population} selected — ${solved ? 'correct' : 'tap the focal icons'}`
  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: tapped.size > 0, onClick: check }

  return (
    <BeatShell
      primary={primary}
      feedback={ladder.view}
      onTryAgain={
        revealed
          ? () => {
              ladder.tryAgain()
              setTapped(new Set())
            }
          : undefined
      }
    >
      <div className="bayes-icons">
        <p className="bayes-icons__prompt">
          Tap the {ix.evidence ?? 'outcomes'} that belong to <strong>{ix.hypotheses[0]}</strong>:
        </p>
        <div className="bayes-icons__row" role="group" aria-label="Icon array">
          {Array.from({ length: population }, (_, i) => {
            const isFocal = i < focalCount
            const isTapped = tapped.has(i) || (revealed && isFocal)
            return (
              <button
                key={i}
                type="button"
                className={
                  'bayes-icons__icon' +
                  (isTapped ? ' bayes-icons__icon--tapped' : '') +
                  (isFocal && (solved || revealed) ? ' bayes-icons__icon--focal' : '')
                }
                aria-pressed={isTapped}
                aria-label={`${ix.evidence ?? 'icon'} ${i + 1}: ${isFocal ? ix.hypotheses[0] : ix.hypotheses[1]}`}
                disabled={solved || revealed}
                onClick={() => toggle(i)}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {/* head icon — simple text glyph */}
                🪙
              </button>
            )
          })}
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {countStr}
        </p>
      </div>
    </BeatShell>
  )
}

// ── Sequence display: posterior climbs step by step. Hero (ungraded).
function SequenceDisplay({
  ix,
  beat,
  isLast,
  onAdvance,
  reducedMotion,
}: {
  ix: BayesIx
  beat: BeatProps['beat']
  isLast: boolean
  onAdvance: () => void
  reducedMotion: boolean
}) {
  const priors = ix.priors ?? [{ n: 1, d: 1000 }, { n: 999, d: 1000 }]
  const likelihoods = ix.likelihoods ?? [{ n: 1, d: 1 }, { n: 1, d: 2 }]
  const steps = ix.steps ?? 10
  const [step, setStep] = useState(reducedMotion ? steps : 0)

  const post = step === 0
    ? priors[0]
    : sequentialPosterior(priors[0], likelihoods[0], likelihoods[1], step)
  const postStr = formatRational(post)
  const pct = Math.round((post.n / post.d) * 100)
  const liveStatus = `After ${step} ${ix.evidence ?? 'observations'}: ${postStr}`
  const done = step >= steps

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: done || reducedMotion,
        onClick: onAdvance,
      }}
      secondary={
        !done
          ? {
              label: `Flip (${step}/${steps})`,
              onClick: () => setStep((s) => Math.min(s + 1, steps)),
              variant: 'secondary',
            }
          : undefined
      }
    >
      <div className="bayes-seq">
        {beat.hero && (
          <p className="sr-only">{beat.hero.structuralReadout}</p>
        )}
        <p className="bayes-seq__step">
          {step === 0 ? 'Prior' : `After ${step} ${ix.evidence ?? 'flip'}${step !== 1 ? 's' : ''}`}:{' '}
          <strong>{postStr}</strong>
        </p>
        <div className="bayes-seq__track" aria-hidden="true">
          <div
            className="bayes-seq__fill"
            style={{
              width: `${pct}%`,
              transition: reducedMotion ? 'none' : 'width 0.4s ease',
            }}
          />
          <span className="bayes-seq__pct">{pct}%</span>
        </div>
        <p className="bayes-seq__hypothesis">P({ix.hypotheses[0]} | evidence)</p>
        <p role="status" aria-live="polite" className="sr-only">
          {liveStatus}
        </p>
      </div>
    </BeatShell>
  )
}

// ── Public entry point: narrow to bayesUpdate, dispatch to the right display.
export function BayesUpdateBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion } = props
  if (beat.interaction.type !== 'bayesUpdate') return null
  const ix = beat.interaction

  if (ix.display === 'bars') {
    return (
      <BarsDisplay
        ix={ix}
        beat={beat}
        isLast={isLast}
        onAdvance={onAdvance}
        reducedMotion={reducedMotion}
      />
    )
  }
  if (ix.display === 'tree') {
    return (
      <TreeDisplay
        ix={ix}
        beat={beat}
        isLast={isLast}
        onAdvance={onAdvance}
        reducedMotion={reducedMotion}
        props={props}
      />
    )
  }
  return (
    <SequenceDisplay
      ix={ix}
      beat={beat}
      isLast={isLast}
      onAdvance={onAdvance}
      reducedMotion={reducedMotion}
    />
  )
}
