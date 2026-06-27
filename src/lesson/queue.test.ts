import { describe, it, expect } from 'vitest'
import type { Beat, ReviewCard } from '../content/schema'
import { CONFUSABLE, type MethodId } from '../content/methods'
import {
  dueCards,
  isNotationReady,
  areConfusable,
  buildQueue,
  type LessonOrder,
} from './queue'

// A minimal Firestore-Timestamp stand-in: dueCards/buildQueue read dueAt via
// `.toMillis()` (the schema types dueAt as unknown — a Timestamp at runtime).
function ts(ms: number): { toMillis(): number } {
  return { toMillis: () => ms }
}

const DAY = 86_400_000
const NOW = new Date('2026-06-27T12:00:00Z')

function card(over: Partial<ReviewCard> & { beatId: string }): ReviewCard {
  return {
    lessonId: 'L1',
    conceptId: 'C1',
    schemaId: 'symmetry',
    track: 'A',
    dueAt: ts(NOW.getTime() - DAY), // due yesterday by default
    intervalDays: 1,
    easeFactor: 2.5,
    reps: 0,
    lapses: 0,
    lastResult: null,
    lastConfidence: null,
    isTransfer: false,
    suspended: false,
    createdAt: ts(0),
    updatedAt: ts(0),
    lastReviewedAt: null,
    ...over,
  } as ReviewCard
}

// A graded beat carrying a schemaId; groundedBy optional for the notation guard.
function beat(beatId: string, over: Partial<Beat> = {}): Beat {
  return {
    beatId,
    required: true,
    prompt: 'x',
    interaction: { type: 'answerEntry', fields: [{ id: 'a', accept: ['1'] }] },
    feedback: { correct: 'ok', hints: ['1', '2', '3'] },
    ...over,
  } as Beat
}

// All cards in these tests come from one completed lesson whose beats are all
// notation-ready unless a test overrides groundedBy.
function orderFor(beats: Beat[], lessonId = 'L1'): Map<string, LessonOrder> {
  return new Map([[lessonId, { lessonId, beats, completed: true }]])
}

describe('dueCards', () => {
  it('returns only dueAt<=now, excludes suspended, sorted by dueAt', () => {
    const cards = [
      card({ beatId: 'late', dueAt: ts(NOW.getTime() + DAY) }), // future → excluded
      card({ beatId: 'b', dueAt: ts(NOW.getTime() - DAY) }),
      card({ beatId: 'a', dueAt: ts(NOW.getTime() - 2 * DAY) }),
      card({ beatId: 'susp', dueAt: ts(NOW.getTime() - 3 * DAY), suspended: true }),
    ]
    const due = dueCards(cards, NOW)
    expect(due.map((c) => c.beatId)).toEqual(['a', 'b'])
  })

  it('includes a card due exactly now', () => {
    const cards = [card({ beatId: 'now', dueAt: ts(NOW.getTime()) })]
    expect(dueCards(cards, NOW)).toHaveLength(1)
  })
})

describe('isNotationReady', () => {
  const beats = [beat('intro'), beat('uses', { groundedBy: ['intro'] })]

  it('drops a card whose lesson is not completed', () => {
    const order = new Map<string, LessonOrder>([
      ['L1', { lessonId: 'L1', beats, completed: false }],
    ])
    expect(isNotationReady(card({ beatId: 'uses' }), order)).toBe(false)
  })

  it('drops a card whose target beat is absent from the lesson', () => {
    expect(isNotationReady(card({ beatId: 'ghost' }), orderFor(beats))).toBe(false)
  })

  it('drops a card whose groundedBy id does not precede it', () => {
    // 'uses' grounded by 'intro' but 'intro' comes AFTER → not ready.
    const reordered = [beat('uses', { groundedBy: ['intro'] }), beat('intro')]
    expect(isNotationReady(card({ beatId: 'uses' }), orderFor(reordered))).toBe(false)
  })

  it('accepts when all groundedBy ids precede the target', () => {
    expect(isNotationReady(card({ beatId: 'uses' }), orderFor(beats))).toBe(true)
  })

  it('accepts a beat with no groundedBy in a completed lesson', () => {
    expect(isNotationReady(card({ beatId: 'intro' }), orderFor(beats))).toBe(true)
  })
})

describe('areConfusable', () => {
  it('is true for a curated pair (symmetric in methods.ts)', () => {
    // first-step-analysis ↔ states-markov is a curated near-miss.
    expect(areConfusable('first-step-analysis', 'states-markov')).toBe(true)
    expect(areConfusable('states-markov', 'first-step-analysis')).toBe(true)
  })

  it('falls back to domain overlap when the curated entry is empty/undefined', () => {
    // spec-00's CONFUSABLE is fully curated today, so the fallback is reachable
    // only when a method has no curated list (a future uncurated method — §6).
    // Simulate that by temporarily clearing pigeonhole's entry: pigeonhole and
    // linearity-indicators share the 'combinatorics' domain, so the fallback
    // marks them confusable; a non-overlapping pair stays not-confusable.
    const saved = CONFUSABLE['pigeonhole']
    delete (CONFUSABLE as Record<MethodId, MethodId[] | undefined>)['pigeonhole']
    try {
      expect(areConfusable('pigeonhole', 'linearity-indicators')).toBe(true) // shared domain
      expect(areConfusable('pigeonhole', 'prior-update')).toBe(false) // no shared domain
    } finally {
      CONFUSABLE['pigeonhole'] = saved
    }
  })

  it('uses the curated list (not domain overlap) when one is present', () => {
    // symmetry & complementary-counting are curated near-misses; symmetry &
    // linearity-indicators share a domain but are NOT curated → not confusable.
    expect(areConfusable('symmetry', 'complementary-counting')).toBe(true)
    expect(areConfusable('symmetry', 'linearity-indicators')).toBe(false)
  })

  it('is false for a method against itself', () => {
    expect(areConfusable('symmetry', 'symmetry')).toBe(false)
  })
})

describe('buildQueue — interleave', () => {
  it('interleaves so adjacent items differ in schemaId when ≥2 methods are due', () => {
    const cards = [
      card({ beatId: 'a1', schemaId: 'symmetry', dueAt: ts(NOW.getTime() - 5 * DAY) }),
      card({ beatId: 'a2', schemaId: 'symmetry', dueAt: ts(NOW.getTime() - 4 * DAY) }),
      card({ beatId: 'b1', schemaId: 'pigeonhole', dueAt: ts(NOW.getTime() - 3 * DAY) }),
    ]
    const beats = [beat('a1'), beat('a2'), beat('b1')]
    const q = buildQueue(cards, orderFor(beats), NOW, { maxItems: 10, foils: false })
    expect(q.map((i) => i.schemaId)).toEqual(['symmetry', 'pigeonhole', 'symmetry'])
    expect(q.every((i) => i.kind === 'review')).toBe(true)
  })

  it('caps at maxItems', () => {
    const cards = [
      card({ beatId: 'a1', schemaId: 'symmetry' }),
      card({ beatId: 'b1', schemaId: 'pigeonhole' }),
      card({ beatId: 'c1', schemaId: 'conditioning' }),
    ]
    const beats = [beat('a1'), beat('b1'), beat('c1')]
    const q = buildQueue(cards, orderFor(beats), NOW, { maxItems: 2, foils: false })
    expect(q).toHaveLength(2)
  })

  it('is deterministic given a fixed input order', () => {
    const cards = [
      card({ beatId: 'a1', schemaId: 'symmetry', dueAt: ts(NOW.getTime() - 5 * DAY) }),
      card({ beatId: 'b1', schemaId: 'pigeonhole', dueAt: ts(NOW.getTime() - 4 * DAY) }),
      card({ beatId: 'a2', schemaId: 'symmetry', dueAt: ts(NOW.getTime() - 3 * DAY) }),
    ]
    const beats = [beat('a1'), beat('b1'), beat('a2')]
    const order = orderFor(beats)
    const q1 = buildQueue(cards, order, NOW, { maxItems: 10, foils: false })
    const q2 = buildQueue(cards, order, NOW, { maxItems: 10, foils: false })
    expect(q1).toEqual(q2)
  })
})

describe('buildQueue — foils', () => {
  it('foils:true marks a curated-confusable sibling and prefers it over a non-confusable card', () => {
    // first-step-analysis ↔ states-markov is curated; conditioning is not
    // confusable with first-step-analysis. With foils on, the states-markov card
    // should be pulled forward right after first-step-analysis and marked foil.
    const cards = [
      card({ beatId: 'f1', schemaId: 'first-step-analysis', dueAt: ts(NOW.getTime() - 5 * DAY) }),
      card({ beatId: 'c1', schemaId: 'conditioning', dueAt: ts(NOW.getTime() - 4 * DAY) }),
      card({ beatId: 's1', schemaId: 'states-markov', dueAt: ts(NOW.getTime() - 3 * DAY) }),
    ]
    const beats = [beat('f1'), beat('c1'), beat('s1')]
    const q = buildQueue(cards, orderFor(beats), NOW, { maxItems: 10, foils: true })
    expect(q[0]).toMatchObject({ schemaId: 'first-step-analysis', kind: 'review' })
    expect(q[1]).toMatchObject({ schemaId: 'states-markov', kind: 'foil' })
  })

  it('foils:false emits no foils', () => {
    const cards = [
      card({ beatId: 'f1', schemaId: 'first-step-analysis' }),
      card({ beatId: 's1', schemaId: 'states-markov' }),
    ]
    const beats = [beat('f1'), beat('s1')]
    const q = buildQueue(cards, orderFor(beats), NOW, { maxItems: 10, foils: false })
    expect(q.every((i) => i.kind === 'review')).toBe(true)
  })

  it('fallback: with no curated entry, a domain-overlap sibling is foiled', () => {
    // Clear pigeonhole's curated list so the domain-overlap fallback decides:
    // pigeonhole & linearity-indicators share 'combinatorics' → foiled.
    const saved = CONFUSABLE['pigeonhole']
    delete (CONFUSABLE as Record<MethodId, MethodId[] | undefined>)['pigeonhole']
    try {
      const cards = [
        card({ beatId: 'p1', schemaId: 'pigeonhole', dueAt: ts(NOW.getTime() - 5 * DAY) }),
        card({ beatId: 'l1', schemaId: 'linearity-indicators', dueAt: ts(NOW.getTime() - 4 * DAY) }),
      ]
      const beats = [beat('p1'), beat('l1')]
      const q = buildQueue(cards, orderFor(beats), NOW, { maxItems: 10, foils: true })
      expect(q[0]).toMatchObject({ schemaId: 'pigeonhole', kind: 'review' })
      expect(q[1]).toMatchObject({ schemaId: 'linearity-indicators', kind: 'foil' })
    } finally {
      CONFUSABLE['pigeonhole'] = saved
    }
  })
})

describe('buildQueue — gate Issue #6 (un-backfilled schemaId)', () => {
  it('does not throw on cards with an empty schemaId; filters them out', () => {
    // METHODS[''] === undefined, so reading .domains would throw if not filtered.
    const cards = [
      card({ beatId: 'a1', schemaId: 'symmetry' }),
      card({ beatId: 'bad', schemaId: '' as MethodId }),
    ]
    const beats = [beat('a1'), beat('bad')]
    const q = buildQueue(cards, orderFor(beats), NOW, { maxItems: 10, foils: true })
    expect(q.map((i) => i.beatId)).toEqual(['a1'])
  })

  it('degrades to plain due-order when EVERY due card lacks a usable schemaId', () => {
    const cards = [
      card({ beatId: 'x', schemaId: '' as MethodId, dueAt: ts(NOW.getTime() - 5 * DAY) }),
      card({ beatId: 'y', schemaId: '' as MethodId, dueAt: ts(NOW.getTime() - 4 * DAY) }),
    ]
    const beats = [beat('x'), beat('y')]
    const q = buildQueue(cards, orderFor(beats), NOW, { maxItems: 10, foils: true })
    // No bucketing/foiling possible → plain due-order, all kind:'review', no throw.
    expect(q.map((i) => i.beatId)).toEqual(['x', 'y'])
    expect(q.every((i) => i.kind === 'review')).toBe(true)
  })
})
