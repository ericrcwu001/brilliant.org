// Phase 12 — Review and next step, redesigned as a generate-then-reveal recap so
// the lesson ends in retrieval rather than passive reading (testing + generation
// effects; Roediger & Karpicke 2006; Slamecka & Graf 1978). The learner first
// reconstructs *why* HH waits longer (one tap, never blocks Finish), then the
// payoff reveals: the hero verdict E[HH] > E[HT], the mechanism they built (the
// 1/2 E0 reset term), their own belief-update arc (opening bet -> guess -> theory
// -> simulation), and a forward bridge to the THH-vs-HTH transfer. All numbers
// come straight from the engine; only `needsReview` softens the praise.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { BeatProps } from './types'
import type { Automaton, Rational, StateId } from '../../engine/types'
import { buildAutomaton } from '../../engine/automaton'
import { BeatShell } from '../BeatShell'
import { resolveFeedback } from '../feedback'
import type { FeedbackView } from '../FeedbackStrip'
import { MilestoneSeal } from '../../habit/MilestoneSeal'
import { FLAGSHIP_LESSON_ID } from '../../pages/routes'
import { analytics } from '../../analytics/events'

type RecallId = 'length' | 'overlap' | 'rarity'

// The retrieval check. The trap is "length" (HH/HT are both length 2) — the same
// misconception the opening bet's tie option carries; "rarity" is the other
// common wrong model. Only "overlap" names the actual cause.
const RECALL: Array<{ id: RecallId; correct: boolean; label: string; why: string }> = [
  {
    id: 'length',
    correct: false,
    label: 'HH is the longer pattern, so it needs more flips.',
    why: 'HH and HT are both length 2 — the same number of symbols. Length is the red herring; what differs is the cost of a near-miss.',
  },
  {
    id: 'overlap',
    correct: true,
    label: 'A near-miss resets HH to the start, but HT keeps its matched head.',
    why: '',
  },
  {
    id: 'rarity',
    correct: false,
    label: 'HH is rarer to land than HT.',
    why: 'In any two flips, HH and HT are equally likely (1/4 each). The gap comes from how you recover after a near-miss, not from rarity.',
  },
]

const ratLabel = (r: Rational): string => (r.d === 1 ? `${r.n}` : `${r.n}/${r.d}`)

// The near-miss out of E1 is the non-advancing edge: HH resets to the start, HT
// self-loops and keeps its head. That destination is the memory term we
// highlight in the recurrence the learner built.
function e1Memory(a: Automaton) {
  const rec = a.recurrences['E1' as StateId]
  const t = a.transitions.find(
    (e) => e.from === ('E1' as StateId) && e.kind !== 'advance',
  )
  if (!rec || !t) return null
  return { rec, memoryVar: t.to, kind: t.kind }
}

// Process-praise narrative anchored to the learner's opening bet (growth mindset:
// reward the evidence-driven revision, not the person). Matches the three
// authored bet options.
function openingBetNote(initial: string | undefined): string | null {
  if (!initial) return null
  if (initial === 'Waiting for HH takes longer')
    return 'You called it from the start — then proved exactly why.'
  if (initial.startsWith('They tie'))
    return 'You opened on the most common guess — a tie — then let the model change your mind. Updating on evidence is the real skill.'
  return 'Your opening hunch leaned the other way — then the states set it straight. That is the method earning its keep.'
}

export function RecapBeat(props: BeatProps) {
  const {
    beat,
    pattern,
    patternOptions,
    automaton,
    reducedMotion,
    isLast,
    onAdvance,
    needsReview,
    lessonState,
  } = props

  const [picked, setPicked] = useState<RecallId | null>(null)
  const [revealedAnyway, setRevealedAnyway] = useState(false)

  // The contrast pattern (HT) drives E[HT] and the second mechanism row.
  const contrastPattern = patternOptions.find((p) => p !== pattern)
  const contrast = useMemo(
    () => (contrastPattern ? buildAutomaton(contrastPattern, automaton.p) : null),
    [contrastPattern, automaton.p],
  )

  // review_recommended_shown (Phase 19): fire once when the recap surfaces the
  // review recommendation (a needsReview lesson, once the recap is revealed).
  const reviewShown = useRef(false)
  useEffect(() => {
    const visible = needsReview && (picked !== null || revealedAnyway)
    if (visible && !reviewShown.current) {
      reviewShown.current = true
      analytics.reviewRecommendedShown({ lessonId: props.lessonId })
    }
  }, [needsReview, picked, revealedAnyway, props.lessonId])

  if (beat.interaction.type !== 'recap') return null

  const fb = resolveFeedback(beat.feedback, pattern)

  // The rich recap below is hardwired to the flagship's HH/HT contrast. Every
  // other lesson (L0, L2–L6) gets a generic generate-then-reveal recap from its
  // authored feedback — the takeaway line + supporting points — so the content is
  // never the wrong (flagship) framing. Finish is always enabled either way.
  if (props.lessonId !== FLAGSHIP_LESSON_ID) {
    const revealedG = revealedAnyway
    return (
      <BeatShell
        feedback={revealedG ? { kind: 'correct', text: fb.correct } : undefined}
        primary={{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }}
        secondary={
          revealedG ? undefined : { label: 'Reveal recap', onClick: () => setRevealedAnyway(true) }
        }
      >
        <div className="recap">
          {props.lessonComplete && props.milestone && (
            <div className={`recap__stamp${reducedMotion ? '' : ' recap__stamp--press'}`}>
              <p className="recap__stamp-kicker">Milestone earned</p>
              <MilestoneSeal meta={props.milestone} earned />
            </div>
          )}
          <p className="recap__q">{beat.prompt}</p>
          {revealedG && (
            <div className={`recap__reveal${reducedMotion ? '' : ' recap__reveal--enter'}`}>
              <p className="recap__principle">{fb.correct}</p>
              <ul className="recap__takeaways">
                {fb.hints.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </BeatShell>
    )
  }

  const answered = picked !== null
  const revealed = answered || revealedAnyway
  const pickedCorrect = picked === 'overlap'

  // Verdict numbers, straight from the engine — never hardcoded.
  const eHH =
    lessonState.theoreticalValue ?? automaton.expectedTimes[automaton.states[0].id]
  const eHT = contrast
    ? contrast.expectedTimes[contrast.states[0].id]
    : undefined

  const guess = lessonState.finalPrediction
  const sim = lessonState.empiricalMean
  const runs = lessonState.simRuns

  const metrics: Array<{ label: string; value: number | undefined }> = [
    { label: 'Your guess', value: guess },
    { label: 'Theory', value: eHH },
    ...(sim !== undefined ? [{ label: `Sim · ${runs ?? 0} runs`, value: sim }] : []),
  ]

  // Triangulation gloss that folds in calibration (three independent roads to the
  // same wait), so the three "6"s read as corroboration, not repetition.
  let trioGloss: string | null = null
  if (guess !== undefined && sim !== undefined) {
    trioGloss =
      guess === eHH
        ? `Your guess, the algebra, and ${runs} simulations all land on ${eHH}.`
        : `Algebra and ${runs} simulations land on ${eHH}; your locked guess of ${guess} was off by ${Math.abs(guess - eHH)}.`
  }

  const narrative = openingBetNote(lessonState.initialPrediction)

  // Hypercorrection (L1 §4.11): re-present the opening bet against the proven
  // numbers. Confronting a confident wrong guess with the result makes the
  // correction stick harder than never having guessed.
  const initial = lessonState.initialPrediction
  let beliefUpdate: string | null = null
  if (initial && eHT !== undefined) {
    if (initial.startsWith('They tie'))
      beliefUpdate = `You bet they'd tie — but it's E[${pattern}] = ${eHH} vs E[${contrastPattern}] = ${eHT}. The near-miss is what splits them.`
    else if (initial === `Waiting for ${pattern} takes longer`)
      beliefUpdate = `You bet ${pattern} takes longer — and the model agrees: ${eHH} vs ${eHT}.`
    else
      beliefUpdate = `You bet the other way — but it lands at E[${pattern}] = ${eHH} vs E[${contrastPattern}] = ${eHT}. The states set it straight.`
  }

  // Generation must precede praise: no verdict strip until the learner commits,
  // and never a green "Correct" for someone who reached it only via reveals.
  let view: FeedbackView = { kind: 'idle' }
  if (revealed) {
    if (pickedCorrect && !needsReview)
      view = {
        kind: 'correct',
        text: 'You reconstructed the cause yourself — that is the part that transfers.',
      }
    else if (pickedCorrect)
      view = {
        kind: 'note',
        label: 'Got there',
        text: 'Right idea — reached with a few hints. Replay the reset step once to lock it in.',
      }
    else if (answered)
      view = {
        kind: 'note',
        label: 'Not quite',
        text: RECALL.find((c) => c.id === picked)!.why,
      }
    else view = { kind: 'note', label: 'The idea', text: fb.hints[0] }
  }

  const primary = {
    label: isLast ? 'Finish' : 'Continue',
    enabled: true,
    onClick: onAdvance,
  }
  // An honest, non-blocking escape for learners who would rather just see it.
  const secondary = revealed
    ? undefined
    : { label: 'Reveal recap', onClick: () => setRevealedAnyway(true) }

  const mechAutos = [automaton, contrast].filter((a): a is Automaton => a != null)

  return (
    <BeatShell feedback={view} primary={primary} secondary={secondary}>
      <div className="recap">
        {props.lessonComplete && props.milestone && (
          <div
            className={`recap__stamp${reducedMotion ? '' : ' recap__stamp--press'}`}
          >
            <p className="recap__stamp-kicker">Milestone earned</p>
            <MilestoneSeal meta={props.milestone} earned />
          </div>
        )}
        <div className="recap__retrieve">
          <p className="recap__q">
            Before you finish — why does HH wait longer than HT?
          </p>
          <div
            className="chips"
            role="radiogroup"
            aria-label="Why HH waits longer than HT"
          >
            {RECALL.map((c) => {
              const isPicked = picked === c.id
              const cls = [
                'chip',
                'chip--select',
                !revealed && isPicked ? 'chip--on' : '',
                revealed && c.correct ? 'chip--correct' : '',
                revealed && isPicked && !c.correct ? 'chip--wrong' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={isPicked}
                  disabled={revealed}
                  className={cls}
                  onClick={() => setPicked(c.id)}
                >
                  {revealed && (c.correct || isPicked) && (
                    <span className="recap__choicemark" aria-hidden="true">
                      {c.correct ? '✓' : '✗'}
                    </span>
                  )}
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {revealed && (
          <div
            className={`recap__reveal${reducedMotion ? '' : ' recap__reveal--enter'}`}
          >
            <div className="recap__hero">
              <span className="recap__seal mono">HH ≠ HT</span>
              <p
                className="recap__verdict mono"
                aria-label={`Expected wait for ${pattern} is ${eHH}${
                  eHT !== undefined
                    ? `, greater than ${contrastPattern} at ${eHT}`
                    : ''
                }`}
              >
                E[{pattern}] = {eHH}
                {eHT !== undefined && (
                  <>
                    {' '}
                    &gt; E[{contrastPattern}] = {eHT}
                  </>
                )}
              </p>
              <p className="recap__principle">{fb.hints[0]}</p>
            </div>

            {mechAutos.length > 0 && (
              <div className="recap__mech">
                {mechAutos.map((a) => {
                  const m = e1Memory(a)
                  if (!m) return null
                  const isReset = m.kind === 'reset'
                  return (
                    <div className="recap__mechrow" key={a.pattern}>
                      <span className="recap__mechlabel mono">{a.pattern}</span>
                      <span className="recap__mecheq mono">
                        E1 = {m.rec.constant}
                        {m.rec.terms.map((t, i) => (
                          <span key={i}>
                            {' + '}
                            <span
                              className={
                                t.var === m.memoryVar && isReset
                                  ? 'recap__mark'
                                  : undefined
                              }
                            >
                              {ratLabel(t.coeff)} {t.var}
                            </span>
                          </span>
                        ))}
                      </span>
                      <span className="recap__mechtag">
                        {isReset
                          ? 'near-miss resets to start'
                          : 'near-miss keeps progress'}
                      </span>
                    </div>
                  )
                })}
                <p className="recap__gloss">{fb.hints[1]}</p>
              </div>
            )}

            <div className="recap__path">
              {beliefUpdate && <p className="recap__belief">{beliefUpdate}</p>}
              {narrative && <p className="recap__narrative">{narrative}</p>}
              <div className="recap__trio">
                {metrics.map((mt) => (
                  <div className="recap__metric" key={mt.label}>
                    <span className="recap__metric-val mono">
                      {mt.value ?? '—'}
                    </span>
                    <span className="recap__metric-label">{mt.label}</span>
                  </div>
                ))}
              </div>
              {trioGloss && <p className="recap__gloss">{trioGloss}</p>}
            </div>

            <p className="recap__next">
              {fb.hints[2]}{' '}
              <span className="recap__nexthint">
                Watch which near-miss resets further.
              </span>
            </p>

            {needsReview && (
              <p className="recap__review">
                A few steps needed hints — that is how the method sticks. Replay the
                reset step before the next lesson.
              </p>
            )}
          </div>
        )}
      </div>
    </BeatShell>
  )
}
