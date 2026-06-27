// Dev-only Daily Review harness (spec-20 / step 8). Renders the presentational
// <DailyReviewHero> (its four visible states) and the <DailyReview> stepper
// against the committed flagship fixture + synthesized QueueItem[], so the queue
// + the gate→problem→done loop are verifiable with NO Firebase / auth. A scenario
// switcher exercises the hero states; a track-A / quant toggle feeds `quantGate`
// straight into both surfaces (isQuantIntensity is exercised in the container's
// unit test, not needed here). devNavigate is a no-op (copy DevHomePage).

import { useState } from 'react'
import courseFixture from '../../fixtures/lesson-pattern-hitting-times.json'
import { LessonSchema, type Beat, type Lesson } from '../content/schema'
import { DailyReview } from './DailyReview'
import { DailyReviewHero } from './DailyReviewHero'
import { buildHeroModel } from './dailyReview.model'
import type { QueueItem } from '../lesson/queue'
import type { NavigateFn } from './routes'

const lesson: Lesson = LessonSchema.parse(courseFixture)

// A synthesized which-method gate beat (the fixtures carry none yet — spec-24
// authors them) so the quant path can show the gate ahead of the problem. Modelled
// on DevGatePage's GATE_BEAT; distractors are CONFUSABLE members of the method.
const GATE_BEAT: Beat = {
  beatId: 'dev-review-gate',
  required: true,
  prompt: 'A method-revealing prompt that must NOT leak into the gate surface.',
  schemaId: 'first-step-analysis',
  interaction: {
    type: 'prediction',
    options: ['First-step analysis', 'States / Markov', 'Recursion / self-reference'],
    gate: {
      kind: 'which-method',
      correct: 'first-step-analysis',
      optionMethods: ['first-step-analysis', 'states-markov', 'recursion-self-reference'],
    },
  },
  feedback: {
    byOption: {
      'First-step analysis': { note: 'Right — condition on the first step.', correct: true },
      'States / Markov': { note: 'Close — the move is first-step conditioning.' },
      'Recursion / self-reference': { note: 'The recurrence comes from the first step.' },
    },
    hints: ['Which single move sets up the equation?', '', ''],
  },
} as Beat

// The two graded checkpoint beats in the flagship fixture (masteryChallenge) make
// good review problems. Build a fixture lesson that also carries the gate beat.
const reviewLesson: Lesson = { ...lesson, beats: [GATE_BEAT, ...lesson.beats] }
const lessonsById: Record<string, Lesson> = { [lesson.lessonId]: reviewLesson }

function itemFor(beatId: string): QueueItem {
  return {
    cardId: `${lesson.lessonId}__${beatId}`,
    lessonId: lesson.lessonId,
    beatId,
    conceptId: lesson.courseId,
    schemaId: 'first-step-analysis',
    kind: 'review',
  }
}

// Three real graded beats from the fixture for the due-3 / queue walk.
const DUE_ITEMS: QueueItem[] = [
  itemFor('mastery-challenge'),
  itemFor('transfer-heldout'),
  itemFor('mastery-challenge'),
]

type ScenarioId = 'due-3' | 'ramp-final' | 'caught-up' | 'no-deck'

const NOW = new Date()
function isoInDays(d: number): string {
  const t = new Date(NOW)
  t.setDate(t.getDate() + d)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

const SCENARIOS: Record<ScenarioId, { label: string; model: ReturnType<typeof buildHeroModel>; items: QueueItem[] }> = {
  'due-3': {
    label: 'Due (3)',
    model: buildHeroModel(3, true, true, undefined, NOW),
    items: DUE_ITEMS,
  },
  'ramp-final': {
    label: 'Ramp (final stretch)',
    model: buildHeroModel(3, true, true, isoInDays(2), NOW),
    items: DUE_ITEMS,
  },
  'caught-up': {
    label: 'Caught up',
    model: buildHeroModel(0, true, true, undefined, NOW),
    items: [],
  },
  'no-deck': {
    label: 'No deck',
    model: buildHeroModel(0, false, true, undefined, NOW),
    items: [],
  },
}

const SCENARIO_ORDER: ScenarioId[] = ['due-3', 'ramp-final', 'caught-up', 'no-deck']

const devNavigate: NavigateFn = () => {
  /* no-op in the harness (no auth/router) */
}

export function DevReviewPage() {
  const [id, setId] = useState<ScenarioId>('due-3')
  const [quant, setQuant] = useState(true)
  const s = SCENARIOS[id]

  return (
    <div className="ergo-catalog" data-ch="0">
      <div className="dev-switcher" role="group" aria-label="Dev review scenarios">
        <span className="dev-switcher__label">/dev/review</span>
        {SCENARIO_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            className={`dev-switcher__btn${id === key ? ' dev-switcher__btn--on' : ''}`}
            onClick={() => setId(key)}
          >
            {SCENARIOS[key].label}
          </button>
        ))}
        <button
          type="button"
          className={`dev-switcher__btn${quant ? ' dev-switcher__btn--on' : ''}`}
          onClick={() => setQuant((q) => !q)}
        >
          {quant ? 'quant' : 'track-A'}
        </button>
      </div>

      <main className="ergo-catalog__main" aria-label="Daily Review hero">
        <DailyReviewHero
          model={s.model}
          quantGate={quant}
          onStart={() => {}}
          onBuildDeck={() => console.log('[dev] onBuildDeck fired')}
        />
      </main>

      {s.items.length > 0 && (
        <DailyReview
          key={`${id}-${quant}`}
          items={s.items}
          lessonsById={lessonsById}
          track={quant ? 'B' : 'A'}
          quantGate={quant}
          onSubmit={(cardId, answer, confidence) =>
            console.log('[dev] submitReview', { cardId, answer, confidence })
          }
          navigate={devNavigate}
        />
      )}
    </div>
  )
}

export default DevReviewPage
