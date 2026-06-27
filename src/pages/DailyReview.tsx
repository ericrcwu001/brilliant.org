// Daily Review queue — presentational stepper (spec-20 / D8, §4.3). Pure render:
// it receives the spec-10-selected, interleaved, prereq-ordered QueueItem[] and
// the lesson content for each card, and walks them ONE AT A TIME with surface
// labels (concept / lesson / method) hidden. For each card:
//   1. (quant gate, when the card's lesson carries a which-method gate beat)
//      <WhichMethodGate> — spec-13, label-stripped — resolves the method pick.
//   2. The problem beat itself, rendered via the player's own BeatView so
//      grading/hints/assist behave identically to in-lesson (§1 non-goal: this
//      surface does NOT re-implement grading). For the quant gate <ConfidenceRating>
//      is mounted on the problem (D6 third capture site); Track A omits it.
//   3. On grade, submitReview({ cardId, answer, confidence? }) (server-graded, R13).
//
// LABEL-STRIPPING is the core invariant (D8 / #1): the surface never renders the
// concept, lesson title, or method name — not in text, not in aria-labels, not in
// the document title. A test asserts this (§8).
//
// This surface fabricates / reorders NOTHING (R5): it visits `items` in the exact
// array order spec-10's buildQueue returned and submits exactly those cardIds.

import { useEffect, useMemo, useState } from 'react'
import type { Beat, Lesson } from '../content/schema'
import { BeatView } from '../lesson/beats'
import { buildAutomaton } from '../engine/automaton'
import { WhichMethodGate } from '../lesson/WhichMethodGate'
import { ConfidenceRating } from '../lesson/ConfidenceRating'
import { isWhichMethodGate } from '../lesson/methodGate'
import { canonicalReviewAnswer } from './dailyReview.answer'
import { analytics } from '../analytics/events'
import { ROUTES, type NavigateFn } from './routes'
import type { QueueItem } from '../lesson/queue'

export interface DailyReviewProps {
  items: QueueItem[]
  // The source lesson for each due card (keyed by lessonId), so the stepper can
  // resolve the problem beat (and an optional which-method gate beat). Missing
  // entries are skipped — a card whose content failed to load is never surfaced.
  lessonsById: Record<string, Lesson>
  // Gold-gate LABEL only (re-retrieve vs transfer copy); never the gate predicate.
  track: 'A' | 'B'
  // The quant-intensity gate (computed by the container via isQuantIntensity —
  // README §4 helper; never re-derived here). Drives the which-method gate framing
  // + whether <ConfidenceRating> is mounted (D6). Track A → false.
  quantGate: boolean
  // submitReview wrapper (server-graded, R13). The container passes the §4.5 frozen
  // shape; `confidence` is omitted for Track A → lands as null in card.lastConfidence.
  onSubmit: (cardId: string, answer: Record<string, string>, confidence?: number) => void
  navigate: NavigateFn
}

// The renderable card = a QueueItem whose lesson + problem beat resolved.
type ResolvedCard = {
  item: QueueItem
  lesson: Lesson
  problem: Beat
  // The optional which-method gate beat for this card's lesson (a prediction beat
  // carrying interaction.gate). When present + quantGate, it fronts the problem.
  gate: Beat | null
}

function resolveCards(
  items: QueueItem[],
  lessonsById: Record<string, Lesson>,
): ResolvedCard[] {
  const out: ResolvedCard[] = []
  for (const item of items) {
    const lesson = lessonsById[item.lessonId]
    if (!lesson) continue
    const problem = lesson.beats.find((b) => b.beatId === item.beatId)
    if (!problem) continue
    // A which-method gate beat for the same method, if the lesson authored one.
    const gate = lesson.beats.find((b) => isWhichMethodGate(b)) ?? null
    out.push({ item, lesson, problem, gate })
  }
  return out
}

// A safe H/T placeholder pattern + automaton for the BeatView (mirrors
// LessonPlayer: a mis-authored fixture must never crash the surface).
function patternFor(lesson: Lesson): string {
  const raw = lesson.patternOptions?.[0]
  return raw && /^[HT]+$/.test(raw) ? raw : 'H'
}

export function DailyReview({
  items,
  lessonsById,
  track,
  quantGate,
  onSubmit,
  navigate,
}: DailyReviewProps) {
  const cards = useMemo(() => resolveCards(items, lessonsById), [items, lessonsById])

  const [index, setIndex] = useState(0)
  // The card index whose gate has been resolved (the gate is shown for the current
  // index only while `gateDoneIndex < index + 1`). Derived `phase` from this so the
  // FIRST render is correct without a resetting effect (SSR / no flash).
  const [gateDoneIndex, setGateDoneIndex] = useState(-1)
  const [confidence, setConfidence] = useState<number | undefined>(undefined)
  const [reviewed, setReviewed] = useState(0)
  const [passed, setPassed] = useState(0)

  // Neutral document title — never leak the concept/lesson (label-stripping).
  useEffect(() => {
    const prev = document.title
    document.title = 'Daily Review'
    return () => {
      document.title = prev
    }
  }, [])

  const current = cards[index]

  // A card with a gate beat (quant gate only) shows the which-method gate FIRST,
  // until it is resolved for this index; otherwise straight to the problem. Derived
  // so the first render is correct (no effect needed → no SSR/first-paint flash).
  const phase: 'gate' | 'problem' =
    quantGate && current?.gate && gateDoneIndex < index ? 'gate' : 'problem'

  // Empty queue: the inline empty state, not a crash (deep-link / caught-up).
  if (cards.length === 0) {
    return (
      <div className="ergo-review" data-ch="0">
        <ReviewChrome position={null} total={0} />
        <main className="ergo-review__main" aria-label="Daily Review">
          <section className="ergo-review__empty ergo-card">
            <p className="ergo-review__empty-title">Nothing due right now</p>
            <p className="ergo-review__empty-sub">
              You&apos;re caught up — new reviews unlock as you learn.
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate(ROUTES.landing)}
            >
              Back to home
            </button>
          </section>
        </main>
      </div>
    )
  }

  // Done summary once the queue empties (informational, never a verdict).
  if (index >= cards.length) {
    return (
      <div className="ergo-review" data-ch="0">
        <ReviewChrome position={null} total={cards.length} />
        <main className="ergo-review__main" aria-label="Daily Review">
          <section className="ergo-review__done ergo-card">
            <p className="ergo-review__done-title">Review complete ✓</p>
            <p className="ergo-review__done-sub">
              {reviewed} reviewed · {passed} correct
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate(ROUTES.landing)}
            >
              Back to home
            </button>
          </section>
        </main>
      </div>
    )
  }

  function advance(result: 'pass' | 'fail', answer: Record<string, string>) {
    const card = cards[index]
    onSubmit(card.item.cardId, answer, quantGate ? confidence : undefined)
    analytics.reviewCardCompleted({ result, schemaId: card.item.schemaId })
    const nextReviewed = reviewed + 1
    const nextPassed = passed + (result === 'pass' ? 1 : 0)
    setReviewed(nextReviewed)
    setPassed(nextPassed)
    const nextIndex = index + 1
    if (nextIndex >= cards.length) {
      analytics.dailyReviewCompleted({ reviewed: nextReviewed, passed: nextPassed })
    }
    setConfidence(undefined) // fresh per card
    setIndex(nextIndex)
  }

  const pattern = patternFor(current.lesson)

  return (
    <div className="ergo-review" data-ch="0">
      <ReviewChrome position={index + 1} total={cards.length} />
      <main className="ergo-review__main" aria-label="Daily Review">
        {phase === 'gate' && current.gate ? (
          <WhichMethodGate
            // The label-stripped which-method picker (spec-13). It renders its own
            // neutral prompt; schemaId labels the surface internally. We RECORD the
            // pick's `correct` for the rep/analytics path and advance to the problem.
            beat={current.gate}
            schemaId={current.item.schemaId}
            lessonId={current.item.lessonId}
            showConfidence={false}
            onResolved={() => setGateDoneIndex(index)}
          />
        ) : (
          <BeatView
            // The SAME single-beat renderer the player uses — grading/hints/assist
            // behave identically to in-lesson (§1 non-goal: no re-implemented grading).
            // labelStripped hides method-revealing chrome; the surface owns no title.
            key={current.item.cardId}
            beat={current.problem}
            lessonId={current.item.lessonId}
            pattern={pattern}
            patternOptions={current.lesson.patternOptions}
            automaton={buildAutomaton(pattern, 0.5)}
            reducedMotion
            density="merged"
            isLast
            labelStripped
            // On grade we cannot read the beat's internal field values (frozen beat
            // API), so onGraded(correct) is our authoritative LOCAL grade for instant
            // UX; we submit the canonical raw answer so the SERVER re-grades (R13) to
            // the same result. The server, not this client, mints gold.
            onGraded={(correct) =>
              advance(
                correct ? 'pass' : 'fail',
                canonicalReviewAnswer(current.problem, correct),
              )
            }
            onAdvance={() => {
              /* advance is driven by onGraded above; the action-bar Continue is a
                 no-op here so a non-graded/edge beat can still move on. */
              advance('pass', canonicalReviewAnswer(current.problem, true))
            }}
            reportNeedsReview={() => {}}
            needsReview={false}
            lessonState={{}}
            setLessonState={() => {}}
            // Confidence capture on the spaced-review problem (D6 third site) —
            // quant gate only; Track A renders no rating.
            showConfidence={quantGate}
            confidenceValue={confidence}
            onConfidence={setConfidence}
            milestone={null}
            lessonComplete={false}
          />
        )}
        {/* Confidence rating for the quant gate, alongside the problem, so the
            value is captured even for beats that don't host it themselves. The
            beat may also host its own (showConfidence above) — both write the same
            local state. Track A renders nothing. */}
        {quantGate && phase === 'problem' && (
          <ConfidenceRating
            value={confidence}
            onSelect={setConfidence}
            question="How sure are you?"
          />
        )}
      </main>
      {track === 'B' && (
        // A neutral hint that gold here comes from a held-out transfer pass; never
        // names the method/concept. Track A omits it.
        <p className="visually-hidden">Transfer review</p>
      )}
    </div>
  )
}

// Minimal top chrome: a neutral wordmark + an UN-NUMBERED position indicator
// (showing position is fine; showing WHICH concept is not — label-stripping).
function ReviewChrome({ position, total }: { position: number | null; total: number }) {
  return (
    <header className="ergo-review__topbar" aria-label="Daily Review">
      <span className="ergo-wordmark">Daily Review</span>
      {position !== null && total > 0 && (
        <span className="ergo-review__progress" aria-label={`${position} of ${total}`}>
          {position} / {total}
        </span>
      )}
    </header>
  )
}
