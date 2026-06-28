// spec-01 review write-path tests (pure predicates + grading + two-phase card
// creation against a fake transaction). firebase-admin is mocked so importing
// review.ts does not boot the firebase runtime (same strategy as
// interview.grade.test.ts). The `submitReview` callable itself is wrapped by the
// mocked `onCall` (→ undefined); its load-bearing logic — server-grading
// (gradeAgainstAccept) + SM-2 advance (nextSchedule, covered in
// src/progress/scheduling.test.ts) — is exercised directly here.

import { vi, describe, it, expect, beforeEach } from 'vitest'

// A per-path doc registry the fake transaction reads/writes against.
const docStore = new Map<string, Record<string, unknown> | undefined>()
const writes: { path: string; data: Record<string, unknown>; opts: unknown }[] = []

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    // db.doc(path).get() (used by loadReviewLesson) reads the same docStore.
    doc: (path: string) => ({
      path,
      get: async () => {
        const data = docStore.get(path)
        return { exists: data !== undefined, data: () => data }
      },
    }),
  })),
  FieldValue: { serverTimestamp: () => '<<serverTimestamp>>' },
  Timestamp: { fromDate: (d: Date) => ({ __ts: d.getTime() }) },
}))
vi.mock('firebase-functions/v2/https', () => ({
  onCall: vi.fn(() => undefined),
  HttpsError: class HttpsError extends Error {
    constructor(
      public code: string,
      message: string,
    ) {
      super(message)
    }
  },
}))

import {
  gradeAgainstAccept,
  isGradedReviewBeat,
  isCardBeat,
  readCardsForCompletion,
  writeCardsForCompletion,
  submitReviewTx,
  setReviewOutcomeSink,
  GRADED_BEAT_TYPES,
  ACCEPT_GATED_BEAT_TYPES,
  type ReviewLessonDoc,
  type ReviewOutcomeEvent,
} from './review'
import { serverGatedOn, DEFAULT_FLAGS_SERVER } from './flags'

// Minimal fake Transaction: get reads docStore by ref.path; set records the write
// and updates the store (so a follow-up read in a later "transaction" sees it).
type FakeRef = { path: string }
function fakeTx() {
  return {
    get: async (ref: FakeRef) => {
      const data = docStore.get(ref.path)
      return {
        exists: data !== undefined,
        data: () => data,
        get: (k: string) => (data ? (data as Record<string, unknown>)[k] : undefined),
      }
    },
    set: (ref: FakeRef, data: Record<string, unknown>, opts: unknown) => {
      writes.push({ path: ref.path, data, opts })
      docStore.set(ref.path, { ...(docStore.get(ref.path) ?? {}), ...data })
    },
  } as unknown as Parameters<typeof writeCardsForCompletion>[0]
}

beforeEach(() => {
  docStore.clear()
  writes.length = 0
})

// ── Server-grade predicate ─────────────────────────────────────────────────────

describe('gradeAgainstAccept (server-side, R13)', () => {
  const answerEntryBeat = {
    beatId: 'compute-posterior',
    required: true,
    interaction: {
      type: 'answerEntry',
      fields: [{ id: 'posterior', accept: ['2/3'] }],
    },
  }

  it('grades a correct answerEntry value as pass', () => {
    expect(gradeAgainstAccept(answerEntryBeat, { posterior: '2/3' })).toBe(true)
  })

  it('grades a wrong answerEntry value as fail', () => {
    expect(gradeAgainstAccept(answerEntryBeat, { posterior: '1/2' })).toBe(false)
  })

  it('normalizes whitespace/case like the in-lesson grader', () => {
    expect(gradeAgainstAccept(answerEntryBeat, { posterior: ' 2/3 ' })).toBe(true)
  })

  it('requires every field of a multi-field answerEntry', () => {
    const beat = {
      beatId: 'framing-flip',
      required: true,
      interaction: {
        type: 'answerEntry',
        fields: [
          { id: 'atleast', accept: ['1/3'] },
          { id: 'thischild', accept: ['1/2'] },
        ],
      },
    }
    expect(gradeAgainstAccept(beat, { atleast: '1/3', thischild: '1/2' })).toBe(true)
    expect(gradeAgainstAccept(beat, { atleast: '1/3', thischild: '9/9' })).toBe(false)
  })

  it('grades an accept-gated single-value type against interaction.accept', () => {
    const beat = {
      beatId: 'count',
      required: true,
      interaction: { type: 'countingTree', accept: ['24'] },
    }
    expect(gradeAgainstAccept(beat, { value: '24' })).toBe(true)
    expect(gradeAgainstAccept(beat, { value: '12' })).toBe(false)
  })
})

// ── Card-eligibility predicate ─────────────────────────────────────────────────

describe('isGradedReviewBeat / isCardBeat', () => {
  const mk = (type: string, interactionExtra: Record<string, unknown> = {}) => ({
    beatId: 'b',
    required: true,
    interaction: { type, ...interactionExtra },
  })

  it('treats answerEntry as graded; primer as not', () => {
    expect(isGradedReviewBeat(mk('answerEntry'))).toBe(true)
    expect(isGradedReviewBeat(mk('primer'))).toBe(false)
  })

  it('accept-gated type is graded only with a non-empty accept list', () => {
    expect(isGradedReviewBeat(mk('countingTree', { accept: ['24'] }))).toBe(true)
    expect(isGradedReviewBeat(mk('countingTree'))).toBe(false)
  })

  it('card predicate = graded-required ∪ heldOut', () => {
    // graded-required → card
    expect(isCardBeat(mk('answerEntry'))).toBe(true)
    // ungraded non-required non-heldOut → no card
    expect(isCardBeat({ beatId: 'p', required: false, interaction: { type: 'primer' } })).toBe(false)
    // heldOut transfer beat (required:false) → card
    expect(
      isCardBeat({
        beatId: 't',
        required: false,
        heldOut: true,
        interaction: { type: 'answerEntry', fields: [{ id: 'x', accept: ['1'] }] },
      }),
    ).toBe(true)
  })
})

// ── Inlined-predicate sync (R2 — must match src/lesson/mastery.ts) ──────────────

describe('inlined graded-beat type set stays in sync with mastery.ts', () => {
  it('matches GRADED_BEAT_TYPES ∪ ACCEPT_GATED_BEAT_TYPES', async () => {
    const { readFileSync } = await import('node:fs')
    const text = readFileSync(
      new URL('../../src/lesson/mastery.ts', import.meta.url),
      'utf8',
    )
    const extract = (name: string): string[] => {
      const m = new RegExp(`const ${name} = new Set\\(\\[([^\\]]*)\\]`).exec(text)
      if (!m) throw new Error(`could not find ${name} in mastery.ts`)
      return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1])
    }
    expect(new Set(extract('GRADED_BEAT_TYPES'))).toEqual(GRADED_BEAT_TYPES)
    expect(new Set(extract('ACCEPT_GATED_BEAT_TYPES'))).toEqual(ACCEPT_GATED_BEAT_TYPES)
  })

  it('functions/src/scheduling.ts is byte-identical to src/progress/scheduling.ts', async () => {
    const { readFileSync } = await import('node:fs')
    const a = readFileSync(new URL('./scheduling.ts', import.meta.url), 'utf8')
    const b = readFileSync(
      new URL('../../src/progress/scheduling.ts', import.meta.url),
      'utf8',
    )
    expect(a).toBe(b)
  })
})

// ── Two-phase card creation (predicate + backfill + per-card existence guard) ───

const transferLesson: ReviewLessonDoc = {
  lessonId: 'lesson-x',
  courseId: 'course-x',
  beats: [
    { beatId: 'g1', required: true, interaction: { type: 'answerEntry', fields: [{ id: 'a', accept: ['1'] }] } },
    { beatId: 'g2', required: true, interaction: { type: 'masteryChallenge', fields: [{ id: 'b', accept: ['2'] }] } },
    { beatId: 'teach', required: false, interaction: { type: 'primer' } },
    { beatId: 'xfer', required: false, heldOut: true, interaction: { type: 'answerEntry', fields: [{ id: 'c', accept: ['3'] }] } },
  ],
}

async function createCards(track?: 'A' | 'B') {
  if (track) docStore.set('users/u1', { defaultTrack: track })
  const tx = fakeTx()
  const plan = await readCardsForCompletion(tx, 'u1', transferLesson)
  writeCardsForCompletion(tx, plan)
  return plan
}

describe('card-creation predicate + track resolution', () => {
  it('creates a card for every graded-required beat AND the heldOut beat; none for ungraded', async () => {
    await createCards()
    const paths = writes.map((w) => w.path).sort()
    expect(paths).toEqual([
      'users/u1/reviews/lesson-x__g1',
      'users/u1/reviews/lesson-x__g2',
      'users/u1/reviews/lesson-x__xfer',
    ])
    expect(paths).not.toContain('users/u1/reviews/lesson-x__teach')
  })

  it('transfer card → isTransfer:true, track:B regardless of resolved track; normal card → isTransfer:false, resolved track', async () => {
    await createCards('A') // gentle concept
    const byPath = new Map(writes.map((w) => [w.path, w.data]))
    const normal = byPath.get('users/u1/reviews/lesson-x__g1')!
    const transfer = byPath.get('users/u1/reviews/lesson-x__xfer')!
    expect(normal.isTransfer).toBe(false)
    expect(normal.track).toBe('A')
    expect(transfer.isTransfer).toBe(true)
    expect(transfer.track).toBe('B')
  })

  it('unresolved track defaults GENTLE to A (#16), never B', async () => {
    await createCards() // no defaultTrack, no concept progress
    const normal = writes.find((w) => w.path.endsWith('__g1'))!.data
    expect(normal.track).toBe('A')
  })

  it('per-concept progress.track wins over defaultTrack', async () => {
    docStore.set('users/u1', { defaultTrack: 'A' })
    docStore.set('users/u1/progress/course-x', { track: 'B' })
    const tx = fakeTx()
    const plan = await readCardsForCompletion(tx, 'u1', transferLesson)
    writeCardsForCompletion(tx, plan)
    const normal = writes.find((w) => w.path.endsWith('__g1'))!.data
    expect(normal.track).toBe('B') // per-concept, not the lesson doc
  })

  it('initial schedule: reps 0, fresh card shape (all frozen §4 fields present)', async () => {
    await createCards()
    const card = writes.find((w) => w.path.endsWith('__g1'))!.data
    expect(card.reps).toBe(0)
    expect(card.lapses).toBe(0)
    expect(card.lastResult).toBeNull()
    expect(card.lastConfidence).toBeNull()
    expect(card.suspended).toBe(false)
    expect(card.intervalDays).toBe(1)
    expect(card.conceptId).toBe('course-x')
    expect(card.schemaId).toBe('') // '' until spec-00 backfill
    expect(card).toHaveProperty('createdAt')
    expect(card).toHaveProperty('dueAt')
  })
})

// ── submitReviewTx: server-grading, scheduling, confidence, suspended ──────────

const NOW = new Date('2026-06-27T12:00:00.000Z')

// Seed lessons/lesson-x (read by loadReviewLesson) + a normal card for g1.
function seedForSubmit(cardOverrides: Record<string, unknown> = {}) {
  docStore.set('lessons/lesson-x', transferLesson as unknown as Record<string, unknown>)
  docStore.set('users/u1/reviews/lesson-x__g1', {
    lessonId: 'lesson-x',
    beatId: 'g1', // answerEntry, accept ['1']
    conceptId: 'course-x',
    schemaId: 'symmetry',
    track: 'A',
    intervalDays: 10,
    easeFactor: 2.5,
    reps: 4,
    lapses: 0,
    lastResult: 'pass',
    lastConfidence: null,
    isTransfer: false,
    suspended: false,
    ...cardOverrides,
  })
}

describe('submitReviewTx (server-grade, R13)', () => {
  it('grades a CORRECT answer as pass and advances (ignores any client-asserted result)', async () => {
    seedForSubmit()
    const tx = fakeTx()
    const out = await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, null, NOW)
    expect(out.graded).toBe('pass')
    expect(out.next.reps).toBe(5) // advanced from 4
    expect(out.elapsedIntervalDays).toBe(10)
    const card = docStore.get('users/u1/reviews/lesson-x__g1') as Record<string, unknown>
    expect(card.lastResult).toBe('pass')
  })

  it('grades a WRONG answer as fail → interval reset, lapses +1, reps 0', async () => {
    seedForSubmit()
    const tx = fakeTx()
    const out = await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '9' }, null, NOW)
    expect(out.graded).toBe('fail')
    expect(out.next.intervalDays).toBe(1)
    expect(out.next.lapses).toBe(1)
    expect(out.next.reps).toBe(0)
  })

  it('writes confidence → lastConfidence; omitted → null', async () => {
    seedForSubmit()
    let tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, 0.8, NOW)
    expect((docStore.get('users/u1/reviews/lesson-x__g1') as Record<string, unknown>).lastConfidence).toBe(0.8)

    seedForSubmit() // reset (lastConfidence null in seed)
    tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, null, NOW)
    expect((docStore.get('users/u1/reviews/lesson-x__g1') as Record<string, unknown>).lastConfidence).toBeNull()
  })

  it('preserves suspended across a review (merge-write leaves it untouched)', async () => {
    seedForSubmit({ suspended: true })
    const tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, null, NOW)
    expect((docStore.get('users/u1/reviews/lesson-x__g1') as Record<string, unknown>).suspended).toBe(true)
  })

  it('honors targetInterviewDate anchoring (caps dueAt to the target)', async () => {
    seedForSubmit()
    docStore.set('users/u1', { targetInterviewDate: '2026-07-02' }) // 5 days out
    const tx = fakeTx()
    const out = await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, null, NOW)
    // A pass from interval 10 (ease 2.6) would schedule ~26 days out; capped to 5.
    expect(out.next.intervalDays).toBeLessThanOrEqual(5)
  })

  it('missing card → failed-precondition', async () => {
    const tx = fakeTx()
    await expect(
      submitReviewTx(tx, 'u1', 'lesson-x__nope', { a: '1' }, null, NOW),
    ).rejects.toThrow(/not found/)
  })
})

describe('per-interval outcome analytics event', () => {
  // The callable derives the event fields from the submitReviewTx result and
  // emits exactly one event through the (overridable) sink. We assert (a) the
  // sink is overridable + restorable and (b) the field derivation is correct.
  it('the outcome event carries {cardId, schemaId, intervalDays(elapsed), result, lapses}', async () => {
    seedForSubmit()
    const tx = fakeTx()
    const out = await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, null, NOW)
    const event: ReviewOutcomeEvent = {
      cardId: 'lesson-x__g1',
      schemaId: out.schemaId, // denormalized card.schemaId
      intervalDays: out.elapsedIntervalDays, // the ELAPSED interval (prev.intervalDays)
      result: out.graded, // server-graded
      lapses: out.next.lapses, // post-update
    }
    expect(event).toEqual({
      cardId: 'lesson-x__g1',
      schemaId: 'symmetry',
      intervalDays: 10,
      result: 'pass',
      lapses: 0,
    })
  })

  it('the analytics sink is overridable and restorable (test seam)', () => {
    const seen: ReviewOutcomeEvent[] = []
    const restore = setReviewOutcomeSink((e) => seen.push(e))
    restore() // restoring must not throw and returns the sink to the default
    expect(seen).toHaveLength(0)
  })
})

// ── spec-11: gold mint on a delayed qualifying pass (+ suspend + calibration) ──

// A card whose createdAt exposes .toDate() (the gold-mint delay check needs it;
// the mock Timestamp.fromDate does not). Seeds lessons/lesson-x too.
const cardTs = (iso: string) => ({ toDate: () => new Date(iso) })

function seedForGold(
  cardOverrides: Record<string, unknown> = {},
  progress?: Record<string, unknown>,
) {
  docStore.set('lessons/lesson-x', transferLesson as unknown as Record<string, unknown>)
  docStore.set('users/u1/reviews/lesson-x__g1', {
    lessonId: 'lesson-x',
    beatId: 'g1', // answerEntry, accept ['1']
    conceptId: 'course-x',
    schemaId: 'symmetry',
    track: 'A',
    intervalDays: 10,
    easeFactor: 2.5,
    reps: 4,
    lapses: 0,
    lastResult: 'pass',
    lastConfidence: null,
    isTransfer: false,
    suspended: false,
    createdAt: cardTs('2026-06-26T12:00:00.000Z'), // an EARLIER UTC day than NOW
    ...cardOverrides,
  })
  if (progress) docStore.set('users/u1/progress/lesson-x', progress)
}

const progressGold = () =>
  docStore.get('users/u1/progress/lesson-x') as Record<string, unknown> | undefined

describe('spec-11 gold mint (Track A — delayed same-checkpoint pass)', () => {
  it('a DELAYED correct pass mints derived.mastered:true (upgrade-only)', async () => {
    seedForGold()
    const tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, null, NOW)
    expect((progressGold()?.derived as { mastered?: boolean })?.mastered).toBe(true)
  })

  it('a SAME-day pass does NOT mint (not delayed)', async () => {
    seedForGold({ createdAt: cardTs('2026-06-27T08:00:00.000Z') })
    const tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, null, NOW)
    expect(progressGold()?.derived).toBeUndefined()
  })

  it('a wrong (fail) answer never mints — even submitted as if it were a pass (R13)', async () => {
    seedForGold()
    const tx = fakeTx()
    // The client cannot fake gold: a wrong answer is graded fail server-side.
    const out = await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '9' }, null, NOW)
    expect(out.graded).toBe('fail')
    expect(progressGold()?.derived).toBeUndefined()
  })

  it('is idempotent: an already-gold lesson is never re-written or demoted', async () => {
    seedForGold({}, { derived: { mastered: true } })
    const tx = fakeTx()
    writes.length = 0
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, null, NOW)
    // No write to the progress doc on the idempotent pass (only the card SM-2 write).
    expect(writes.some((w) => w.path === 'users/u1/progress/lesson-x')).toBe(false)
    expect((progressGold()?.derived as { mastered?: boolean })?.mastered).toBe(true)
  })

  it('a Track-A checkpoint-card mint leaves suspended FALSE (only transfer cards suspend)', async () => {
    seedForGold()
    const tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, null, NOW)
    expect(
      (docStore.get('users/u1/reviews/lesson-x__g1') as Record<string, unknown>).suspended,
    ).toBe(false)
  })
})

describe('spec-11 gold mint (Track B — transfer gate)', () => {
  it('a delayed pass on a CHECKPOINT (non-transfer) Track-B card does NOT mint', async () => {
    seedForGold({ track: 'B', isTransfer: false })
    const tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, null, NOW)
    expect(progressGold()?.derived).toBeUndefined()
  })

  it('a delayed pass on a TRANSFER Track-B card mints gold AND suspends the card', async () => {
    // Seed the xfer card (heldOut → accept ['3']) as a Track-B transfer card.
    docStore.set('lessons/lesson-x', transferLesson as unknown as Record<string, unknown>)
    docStore.set('users/u1/reviews/lesson-x__xfer', {
      lessonId: 'lesson-x',
      beatId: 'xfer', // answerEntry, accept ['3']
      conceptId: 'course-x',
      schemaId: 'symmetry',
      track: 'B',
      intervalDays: 10,
      easeFactor: 2.5,
      reps: 1,
      lapses: 0,
      lastResult: 'pass',
      lastConfidence: null,
      isTransfer: true,
      suspended: false,
      createdAt: cardTs('2026-06-26T12:00:00.000Z'),
    })
    const tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__xfer', { c: '3' }, null, NOW)
    expect((progressGold()?.derived as { mastered?: boolean })?.mastered).toBe(true)
    expect(
      (docStore.get('users/u1/reviews/lesson-x__xfer') as Record<string, unknown>).suspended,
    ).toBe(true)
  })
})

describe('spec-11/12 review-rep calibration fold', () => {
  it('a confidence-carrying review folds into calibration/summary (pooled + byFormat.typein)', async () => {
    seedForGold()
    const tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, 0.9, NOW)
    const summary = docStore.get('users/u1/calibration/summary') as Record<string, unknown>
    expect(summary).toBeDefined()
    expect(summary.n).toBe(1)
    // brier = (0.9 - 1)^2 = 0.01 (a correct pass at confidence 0.9)
    expect(summary.brier).toBeCloseTo(0.01, 6)
    const byFormat = summary.byFormat as Record<string, { n: number }>
    expect(byFormat.typein.n).toBe(1)
  })

  it('a review WITHOUT confidence does not touch calibration/summary', async () => {
    seedForGold()
    const tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, null, NOW)
    expect(docStore.get('users/u1/calibration/summary')).toBeUndefined()
  })

  it('a second review accumulates into the running trend (count-weighted)', async () => {
    seedForGold()
    let tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, 0.9, NOW) // correct
    seedForGold() // reset the card; summary persists in docStore
    tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '9' }, 0.9, NOW) // wrong
    const summary = docStore.get('users/u1/calibration/summary') as Record<string, unknown>
    expect(summary.n).toBe(2)
    // brierSum = 0.01 (correct@0.9) + 0.81 (wrong@0.9) = 0.82 over n=2 ⇒ 0.41
    expect(summary.brier).toBeCloseTo(0.41, 6)
  })
})

// ── spec-05: gold-mint SERVER kill switch (D17 / R14) ──────────────────────────
// submitReviewTx's last arg (goldMintEnabled) gates the spec-11 mint branch. The
// callable computes it via serverGatedOn('goldMint', cohort, serverFlags), which
// is DEFAULT-ON as of 2026-06-28 (kill via the config/flags doc). These assert the
// wiring: false ⇒ no mint even on a qualifying delayed pass; true ⇒ mints.

describe('spec-05 gold-mint kill switch (goldMintEnabled gate)', () => {
  it('goldMintEnabled=false ⇒ a qualifying DELAYED pass does NOT mint (kill switch)', async () => {
    seedForGold()
    const tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, null, NOW, false)
    // The card still advances (SM-2), but gold is NOT minted — silver stays.
    expect(progressGold()?.derived).toBeUndefined()
    const card = docStore.get('users/u1/reviews/lesson-x__g1') as Record<string, unknown>
    expect(card.lastResult).toBe('pass') // review still recorded
  })

  it('goldMintEnabled=true (or omitted) ⇒ the same pass DOES mint (flag-on path)', async () => {
    seedForGold()
    const tx = fakeTx()
    await submitReviewTx(tx, 'u1', 'lesson-x__g1', { a: '1' }, null, NOW, true)
    expect((progressGold()?.derived as { mastered?: boolean })?.mastered).toBe(true)
  })
})

describe('spec-05 client flag ↔ server kill agree for goldMint', () => {
  it('serverGatedOn goldMint is ON by default, OFF for holdout or an explicit kill', () => {
    // Server twin (the authoritative gold-mint kill) agrees with the client gate
    // shape: default-on (2026-06-28), holdout-off, explicit-kill ⇒ off.
    expect(serverGatedOn('goldMint', 'treatment', DEFAULT_FLAGS_SERVER)).toBe(true) // default on
    expect(
      serverGatedOn('goldMint', 'holdout', DEFAULT_FLAGS_SERVER),
    ).toBe(false) // holdout control
    expect(
      serverGatedOn('goldMint', 'treatment', { ...DEFAULT_FLAGS_SERVER, goldMint: false }),
    ).toBe(false) // explicit kill
  })
})

describe('backfill / per-card existence guard (§5d, #4)', () => {
  it('replay when no cards exist creates them all (existing-user backfill)', async () => {
    await createCards() // first pass
    expect(writes.filter((w) => w.opts).length).toBe(3)
  })

  it('replay does not reset existing cards but creates absent ones', async () => {
    await createCards() // creates g1, g2, xfer
    // Simulate an intervening submitReview advancing g1.
    docStore.set('users/u1/reviews/lesson-x__g1', {
      ...(docStore.get('users/u1/reviews/lesson-x__g1') as object),
      reps: 5,
      intervalDays: 30,
    })
    writes.length = 0
    // Drop one card to simulate a partially-present state.
    docStore.delete('users/u1/reviews/lesson-x__g2')
    const tx = fakeTx()
    const plan = await readCardsForCompletion(tx, 'u1', transferLesson)
    writeCardsForCompletion(tx, plan)
    // Only the absent card is (re)written; g1's advanced schedule is untouched.
    const rewrittenPaths = writes.map((w) => w.path)
    expect(rewrittenPaths).toEqual(['users/u1/reviews/lesson-x__g2'])
    expect((docStore.get('users/u1/reviews/lesson-x__g1') as Record<string, unknown>).reps).toBe(5)
  })
})
