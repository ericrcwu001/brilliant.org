// Render smoke + contract tests for the Daily Review surface (spec-20 §8.2/§8.3).
// NODE env, no jsdom — renderToString static assertions, mirroring how the repo
// tests every interactive surface (WhichMethodGate.test.tsx / ConfidenceRating.test.tsx).
// The interactive stepper advance / submit / confidence-pass-through logic is
// covered purely in dailyReview.answer.test.ts (the answer the surface submits)
// + manually on /dev/review; here we assert the render INVARIANTS that matter:
// label-stripping, the empty + done states, and the two-track confidence mount.

import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import React from 'react'

vi.mock('../firebase/app', () => ({
  app: {},
  auth: { currentUser: null },
  db: {},
  functions: {},
  usingEmulators: true,
  getDb: () => ({}),
  getFns: () => ({}),
}))
vi.mock('../analytics/events', () => ({
  analytics: new Proxy({}, { get: () => () => {} }),
}))
// Mock spec-13's gate to a neutral marker so ITS own labels never pollute the
// label-stripping assertion (§8 — "mock spec-13's gate to a no-op").
vi.mock('../lesson/WhichMethodGate', () => ({
  WhichMethodGate: () => React.createElement('div', { 'data-testid': 'gate' }, 'GATE'),
}))

import { DailyReview } from './DailyReview'
import type { QueueItem } from '../lesson/queue'
import type { Beat, Lesson } from '../content/schema'

// A method-revealing lesson title + an answerEntry problem beat. The card's
// conceptId / lessonId / schemaId all carry strings that must NEVER surface.
const problemBeat = {
  beatId: 'secret-beat',
  required: true,
  prompt: 'PROMPT_SECRET_METHOD_REVEAL',
  schemaId: 'symmetry',
  interaction: {
    type: 'answerEntry',
    fields: [{ id: 'x', label: 'Answer', accept: ['42'] }],
  },
  feedback: { hints: ['', '', ''] },
} as unknown as Beat

const lesson = {
  lessonId: 'lesson-secret-symmetry',
  courseId: 'probability',
  title: 'SYMMETRY_LESSON_TITLE',
  patternOptions: ['HH'],
  beats: [problemBeat],
  milestoneId: 'm',
  unlocks: null,
  schemaVersion: 1,
} as unknown as Lesson

const item: QueueItem = {
  cardId: 'lesson-secret-symmetry__secret-beat',
  lessonId: 'lesson-secret-symmetry',
  beatId: 'secret-beat',
  conceptId: 'probability',
  schemaId: 'symmetry',
  kind: 'review',
}

function render(props: Partial<React.ComponentProps<typeof DailyReview>> = {}): string {
  return renderToString(
    React.createElement(DailyReview, {
      items: [item],
      lessonsById: { [lesson.lessonId]: lesson },
      track: 'A',
      quantGate: false,
      onSubmit: () => {},
      navigate: () => {},
      ...props,
    }),
  )
}

describe('DailyReview — label-stripping invariant (§8 / D8)', () => {
  it('leaks none of the concept, lesson title, method name, or prompt', () => {
    const html = render()
    // The human method name from the registry must not appear…
    expect(html).not.toContain('Symmetry')
    // …nor the lesson title, the conceptId, or the method-revealing prompt.
    expect(html).not.toContain('SYMMETRY_LESSON_TITLE')
    expect(html).not.toContain('PROMPT_SECRET_METHOD_REVEAL')
    expect(html).not.toContain('probability')
    expect(html).not.toContain('lesson-secret-symmetry')
  })

  it('shows the neutral Daily Review wordmark + an un-numbered position indicator', () => {
    const html = render()
    expect(html).toContain('Daily Review')
    // Position is fine (which concept is not): the indicator carries "1 of 1".
    expect(html).toContain('1 of 1')
  })
})

describe('DailyReview — empty + done states (§8)', () => {
  it('renders the inline empty state (not a crash) when items is empty', () => {
    const html = render({ items: [] })
    expect(html).toContain('Nothing due right now')
    expect(html).toContain('Back to home')
  })

  it('skips a card whose lesson content failed to load (never surfaces it)', () => {
    // No lessonsById entry ⇒ the card resolves to nothing ⇒ empty state, not a crash.
    const html = render({ lessonsById: {} })
    expect(html).toContain('Nothing due right now')
  })
})

describe('DailyReview — two-track confidence mount (§6 / D6)', () => {
  it('mounts the confidence rating on the problem for the quant gate', () => {
    const html = render({ quantGate: true, track: 'B' })
    // ConfidenceRating renders its "How sure are you?" prompt on the problem phase.
    expect(html).toContain('How sure are you?')
  })

  it('does NOT mount the confidence rating for Track A (gentle)', () => {
    const html = render({ quantGate: false, track: 'A' })
    expect(html).not.toContain('How sure are you?')
  })

  it('fronts the problem with the which-method gate first on the quant gate', () => {
    // With a gate beat present + quantGate, the gate phase renders the (mocked) gate.
    const gateLesson = {
      ...lesson,
      beats: [
        {
          beatId: 'g',
          required: true,
          schemaId: 'symmetry',
          interaction: {
            type: 'prediction',
            options: ['a', 'b'],
            gate: { kind: 'which-method', correct: 'symmetry', optionMethods: ['symmetry', 'conditioning'] },
          },
          feedback: { hints: ['', '', ''] },
        } as unknown as Beat,
        problemBeat,
      ],
    } as unknown as Lesson
    const html = render({
      quantGate: true,
      track: 'B',
      lessonsById: { [lesson.lessonId]: gateLesson },
    })
    expect(html).toContain('GATE')
  })
})
