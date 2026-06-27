// Spaced-review write-path Cloud Functions (spec-01, README §4 Foundation A).
// THIS FILE owns:
//   - the `submitReview` callable (FROZEN server-grade signature
//     `{cardId, answer, confidence?}`) — the Function-owned writer of a review
//     card on each review; and
//   - the two-phase card-creation helpers (`readCardsForCompletion` /
//     `writeCardsForCompletion`) called from `completeLesson` to create the first
//     card per graded-required beat AND per held-out transfer beat.
//
// Later specs build ON this single file (README §5 collision matrix, 3 specs):
//   - spec-10 fills the SM-2 advance body (it already consumes `nextSchedule`);
//   - spec-11 adds the gold-mint branch (delayed honest-mastery pass →
//     progress.derived.mastered=true, upgrade-only + idempotent) + sets
//     `suspended` on a transfer card at gold, and folds review-rep confidence
//     into the cross-concept calibration trend (README §5; third D6 site).
//
// R12/R13 (SERVER-GRADED): the client sends its RAW answer, NEVER a pass/fail.
// `submitReview` loads the card's beat via `loadLesson`, grades `answer` against
// the fixture accept-list, and derives `result` itself — a client cannot mint
// gold (spec-11) by asserting a pass. All time is server `now` /
// `FieldValue.serverTimestamp()`, never a client timestamp.

import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { Transaction, DocumentReference } from 'firebase-admin/firestore'

import {
  initialSchedule,
  nextSchedule,
  type SchedulingState,
} from './scheduling'
import { qualifiesForGoldMint } from './goldMint'
import { loadServerFlags, serverGatedOn } from './flags'
import {
  foldAttemptIntoTrend,
  MIN_CALIBRATION_N,
  type CalibrationItem,
  type CalibrationFormat,
  type TrendSums,
} from './calibration'

const db = getFirestore()

// Mirror of index.ts's module-local PROGRESS_SCHEMA_VERSION. review.ts cannot
// import it (index.ts re-exports submitReview from this file → circular), so the
// value is duplicated; both must stay equal (it is a single integer bump field).
const PROGRESS_SCHEMA_VERSION = 1

// Duplicated (not imported from ./index) to avoid a circular import — index.ts
// re-exports `submitReview` from this file (mirrors interview.ts:66).
function requireUid(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'You must be signed in.')
  return uid
}

function requireString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0)
    throw new HttpsError('invalid-argument', `${name} is required.`)
  return value
}

// ── Lesson shape (widened from index.ts:32 LessonDoc) ──────────────────────────
// Enough to (a) read courseId/per-beat schemaId/heldOut for card creation and
// (b) read the graded beats' accept-lists so submitReview can grade server-side.
type BeatInteraction = {
  type: string
  accept?: string[] // accept-gated types (countingTree/selectionGrid)
  fields?: Array<{ id: string; accept: string[] }> // answerEntry / masteryChallenge
}
type ReviewBeatDef = {
  beatId: string
  required: boolean
  heldOut?: boolean
  schemaId?: string
  interaction: BeatInteraction
}
export type ReviewLessonDoc = {
  lessonId?: string
  courseId?: string
  beats?: ReviewBeatDef[]
  unlocks?: string | null
}

async function loadReviewLesson(lessonId: string): Promise<ReviewLessonDoc> {
  const snap = await db.doc(`lessons/${lessonId}`).get()
  if (!snap.exists) {
    throw new HttpsError('not-found', `Lesson ${lessonId} not found.`)
  }
  return (snap.data() ?? {}) as ReviewLessonDoc
}

// ── Graded-beat predicate (inlined copy of src/lesson/mastery.ts:11-38) ─────────
// SOURCE OF TRUTH: src/lesson/mastery.ts `GRADED_BEAT_TYPES` ∪ `ACCEPT_GATED_BEAT_TYPES`
// + `isGradedBeat`. Functions cannot import across the src/↔functions/ boundary, so
// this is duplicated (the type set is small + stable, R2). A sync test
// (review.sync.test.ts) asserts the two sets never drift.
export const GRADED_BEAT_TYPES = new Set([
  'stateTap',
  'equationTiles',
  'answerEntry',
  'masteryChallenge',
  'retrievalGrid',
  'handRanker',
])
export const ACCEPT_GATED_BEAT_TYPES = new Set(['countingTree', 'selectionGrid'])

export function isGradedReviewBeat(beat: ReviewBeatDef): boolean {
  const type = beat.interaction.type
  // A `prediction` is graded IFF it carries a which-method `gate` (spec-13). The
  // server doesn't read gates in v1 (no prediction card grading path here), but
  // mirror the predicate so the sync test compares like-for-like.
  if (type === 'prediction') {
    const gate = (beat.interaction as { gate?: unknown }).gate
    return gate != null
  }
  if (GRADED_BEAT_TYPES.has(type)) return true
  if (ACCEPT_GATED_BEAT_TYPES.has(type)) {
    const accept = beat.interaction.accept
    return Array.isArray(accept) && accept.length > 0
  }
  return false
}

// Card-creation predicate (authoritative — README §4, gate Issue #1): a card is
// created for every graded-required beat AND every held-out transfer beat. Transfer
// beats are `required:false`, so a gradedRequiredBeatIds-only predicate would never
// create them and Track-B gold (spec-11) could never mint.
export function isCardBeat(beat: ReviewBeatDef): boolean {
  return (beat.required && isGradedReviewBeat(beat)) || beat.heldOut === true
}

// ── Server-side accept grading (inlined from src/lesson/grading.ts norm +
// gradeAcceptFields) ──────────────────────────────────────────────────────────
// SOURCE OF TRUTH: src/lesson/grading.ts `norm` + `gradeAcceptFields`. Kept in
// sync by inspection (the normalization must match the in-lesson grader exactly,
// else the server and client disagree on pass/fail — R13). Covers the accept-list
// beat types that get review cards in v1: answerEntry / masteryChallenge (fields[])
// and the accept-gated countingTree / selectionGrid (interaction.accept[]).
const norm = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, '')

export function gradeAgainstAccept(
  beat: ReviewBeatDef,
  answer: Record<string, string>,
): boolean {
  const ix = beat.interaction
  // answerEntry / masteryChallenge: every field's value in its accept list.
  if (Array.isArray(ix.fields) && ix.fields.length > 0) {
    return ix.fields.every((f) =>
      f.accept.map(norm).includes(norm(answer[f.id] ?? '')),
    )
  }
  // accept-gated single-value types: a single value compared to interaction.accept.
  // The client submits it under a conventional key; accept any single provided
  // value against the list (the answer object carries exactly one entry).
  if (Array.isArray(ix.accept) && ix.accept.length > 0) {
    const submitted = Object.values(answer)[0] ?? ''
    return ix.accept.map(norm).includes(norm(submitted))
  }
  return false // no accept-list ⇒ mis-routed card (caller throws failed-precondition)
}

function hasAcceptList(beat: ReviewBeatDef): boolean {
  const ix = beat.interaction
  return (
    (Array.isArray(ix.fields) && ix.fields.length > 0) ||
    (Array.isArray(ix.accept) && ix.accept.length > 0)
  )
}

// ── Per-interval outcome analytics (spec-04 feed — UNTUNED) ────────────────────
// Emitted once per submitReview at the one place that knows both the ELAPSED
// interval and the SERVER-GRADED result. Injectable so tests can spy; defaults to
// a structured console emit (the Function-side sink; spec-04 reads one schema —
// the client sink in src/analytics/events.ts uses the same event name/shape).
export type ReviewOutcomeEvent = {
  cardId: string
  schemaId: string
  intervalDays: number // the interval that ELAPSED before this review (prev.intervalDays)
  result: 'pass' | 'fail'
  lapses: number
}
export const REVIEW_OUTCOME_EVENT = 'review_outcome'
let reviewOutcomeSink: (event: ReviewOutcomeEvent) => void = (event) => {
  console.log(REVIEW_OUTCOME_EVENT, JSON.stringify(event))
}
// Test seam: swap the analytics sink (returns a restore fn).
export function setReviewOutcomeSink(
  sink: (event: ReviewOutcomeEvent) => void,
): () => void {
  const prev = reviewOutcomeSink
  reviewOutcomeSink = sink
  return () => {
    reviewOutcomeSink = prev
  }
}

// ── Calibration trend denormalization (mirrors interview.ts:343 denormSums) ─────
// A review rep that carries a confidence is a third D6 capture site (README §5):
// fold it into the SAME cross-concept calibration trend the interview folds into,
// so review reps count toward Brier. Pure; the running mean == batch mean across
// both sources. Format is 'typein' (an in-lesson type-in checkpoint surfaced cold
// by the queue) — kept OUT of the interview's 'voice' bucket so the per-format
// interview delta (spec-23) is not contaminated.
const REVIEW_CALIBRATION_FORMAT: CalibrationFormat = 'typein'

function denormSums(s: TrendSums): {
  n: number
  brierSum: number
  confidenceSum: number
  correctSum: number
  brier: number
  meanConfidence: number
  accuracy: number
  overconfidence: number
  reliable: boolean
} {
  const brier = s.brierSum / s.n
  const meanConfidence = s.confidenceSum / s.n
  const accuracy = s.correctSum / s.n
  return {
    n: s.n,
    brierSum: s.brierSum,
    confidenceSum: s.confidenceSum,
    correctSum: s.correctSum,
    brier,
    meanConfidence,
    accuracy,
    overconfidence: meanConfidence - accuracy,
    reliable: s.n >= MIN_CALIBRATION_N,
  }
}

// ── Card-creation: two-phase (reads-before-writes) ─────────────────────────────
// Firestore forbids reads after writes in a transaction, so the helper is split:
// the caller (completeLesson) must run the READ phase before its own progress
// writes and the WRITE phase after them, all within the one transaction.
//
// A single reads-then-writes helper is NOT usable here because completeLesson
// must write progressRef/nextRef BETWEEN the two phases.

export type CardPlanEntry = {
  cardRef: DocumentReference
  beat: ReviewBeatDef
  exists: boolean
  isTransfer: boolean
}
export type CardCreationPlan = {
  uid: string
  lesson: ReviewLessonDoc
  resolvedTrack: 'A' | 'B'
  entries: CardPlanEntry[]
}

// READ phase: resolve track (per-CONCEPT, fail GENTLE) + every per-card tx.get.
// MUST run before any tx.set in completeLesson. No writes.
export async function readCardsForCompletion(
  tx: Transaction,
  uid: string,
  lesson: ReviewLessonDoc,
): Promise<CardCreationPlan> {
  // Track is keyed by CONCEPT (courseId), not lesson. progress/{lessonId}.track is
  // ALWAYS undefined for real fixtures (lessonId !== courseId), so we must read
  // progress/{courseId}. Final fallback is GENTLE 'A' (#16) — an unresolved track
  // must not silently opt a learner into the brutal/transfer-gated path.
  const conceptId = typeof lesson.courseId === 'string' ? lesson.courseId : ''
  const conceptProgressSnap = conceptId
    ? await tx.get(db.doc(`users/${uid}/progress/${conceptId}`))
    : null
  const userSnap = await tx.get(db.doc(`users/${uid}`))
  const resolvedTrack: 'A' | 'B' =
    (conceptProgressSnap?.get('track') as 'A' | 'B' | undefined) ??
    (userSnap.get('defaultTrack') as 'A' | 'B' | undefined) ??
    'A'

  const beats = lesson.beats ?? []
  const lessonId = typeof lesson.lessonId === 'string' ? lesson.lessonId : ''
  const entries: CardPlanEntry[] = []
  for (const beat of beats) {
    if (!isCardBeat(beat)) continue
    const cardId = `${lessonId}__${beat.beatId}`
    const cardRef = db.doc(`users/${uid}/reviews/${cardId}`)
    const snap = await tx.get(cardRef)
    entries.push({
      cardRef,
      beat,
      exists: snap.exists,
      isTransfer: beat.heldOut === true,
    })
  }
  return { uid, lesson, resolvedTrack, entries }
}

// WRITE phase: create only ABSENT cards (per-card existence guard, README §5b).
// MUST run after completeLesson's progress writes. The guard is per-card existence
// (not "first completion vs replay"), so an existing-user replay that finds cards
// missing backfills exactly them (§5d) and a {merge:true} create never clobbers
// live SM-2 state. No read may follow these writes.
export function writeCardsForCompletion(
  tx: Transaction,
  plan: CardCreationPlan,
): void {
  const { lesson, resolvedTrack, entries } = plan
  const conceptId = typeof lesson.courseId === 'string' ? lesson.courseId : ''
  const lessonId = typeof lesson.lessonId === 'string' ? lesson.lessonId : ''
  const now = new Date() // server now (R12)
  const init = initialSchedule(now)
  const initTs = Timestamp.fromDate(init.dueAt)

  for (const entry of entries) {
    if (entry.exists) continue // never reset an existing card
    // A transfer card always stores track:'B' + isTransfer:true (content-driven,
    // not a fallback — the transfer gold gate is Track-B only, D7).
    const fullCard = {
      lessonId,
      beatId: entry.beat.beatId,
      conceptId,
      schemaId: entry.beat.schemaId ?? '', // '' until spec-00 backfill
      track: entry.isTransfer ? 'B' : resolvedTrack,
      dueAt: initTs,
      intervalDays: init.intervalDays,
      easeFactor: init.easeFactor,
      reps: 0,
      lapses: 0,
      lastResult: null,
      lastConfidence: null,
      isTransfer: entry.isTransfer,
      suspended: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastReviewedAt: null,
    }
    tx.set(entry.cardRef, fullCard, { merge: true })
  }
}

// ── submitReview callable (FROZEN server-grade) ────────────────────────────────
type SubmitReviewData = {
  cardId?: string
  answer?: Record<string, string> // entryId/fieldId → submitted value
  confidence?: number
}

// Transaction body, extracted so it is unit-testable with a fake Transaction
// (the `onCall` wrapper is opaque under vitest). Server-grades (R13) BEFORE
// scheduling, writes the advanced card (merge — leaves `suspended` + identity
// fields untouched), and returns the data the analytics event + client response
// need. `now` is injected (server-supplied — R12).
export async function submitReviewTx(
  tx: Transaction,
  uid: string,
  cardId: string,
  answer: Record<string, string>,
  confidence: number | null,
  now: Date,
  // spec-05 SERVER kill switch (D17 / R14): the gold-mint branch is the only
  // Function-owned write gated by a flag. The callable passes
  // serverGatedOn('goldMint', cohort, serverFlags) — DEFAULT-OFF when the flag is
  // off or the backend is unreachable (fail-closed). Defaults true so the SM-2 /
  // mint MECHANISM stays directly unit-testable (the default-off integration is
  // asserted at the callable boundary + a goldMintEnabled:false test below).
  goldMintEnabled = true,
): Promise<{
  graded: 'pass' | 'fail'
  next: SchedulingState
  elapsedIntervalDays: number
  schemaId: string
}> {
  const ref = db.doc(`users/${uid}/reviews/${cardId}`)
  const snap = await tx.get(ref)
  if (!snap.exists) {
    throw new HttpsError('failed-precondition', 'review card not found.')
  }
  const card = snap.data() as Record<string, unknown>

  // Read the learner's target interview date in the SAME tx (anchoring).
  const userSnap = await tx.get(db.doc(`users/${uid}`))
  const rawDate = userSnap.get('targetInterviewDate') as string | undefined
  const targetDate = parseTargetDate(rawDate)

  // ── Server-grade (R13) BEFORE scheduling ────────────────────────────────────
  // Derive {lessonId, beatId} from the card (stored fields are simplest).
  const lessonId = requireCardString(card.lessonId, 'lessonId', cardId)
  const beatId = requireCardString(card.beatId, 'beatId', cardId)

  // spec-11 READ PHASE: the lesson's progress doc (gold-mint idempotency) and the
  // calibration trend doc (review-rep fold). Both reads MUST precede every write
  // in this transaction (Firestore forbids reads-after-writes). We read them
  // unconditionally up front; the writes below decide whether to act.
  const progressRef = db.doc(`users/${uid}/progress/${lessonId}`)
  const progressSnap = await tx.get(progressRef)
  const alreadyGold =
    (progressSnap.get('derived') as { mastered?: boolean } | undefined)
      ?.mastered === true
  const summaryRef = db.doc(`users/${uid}/calibration/summary`)
  // Only read the summary when a confidence is present to fold (no fold ⇒ no read).
  const summarySnap = confidence != null ? await tx.get(summaryRef) : null

  const lesson = await loadReviewLesson(lessonId)
  const beat = (lesson.beats ?? []).find((b) => b.beatId === beatId)
  if (!beat || !hasAcceptList(beat)) {
    throw new HttpsError(
      'failed-precondition',
      `card ${cardId} has no gradable accept-list beat.`,
    )
  }
  const graded: 'pass' | 'fail' = gradeAgainstAccept(beat, answer) ? 'pass' : 'fail'

  const prev: SchedulingState = {
    dueAt: now, // unused by nextSchedule (it recomputes from `now`)
    intervalDays: numberField(card.intervalDays, 1),
    easeFactor: numberField(card.easeFactor, 2.5),
    reps: numberField(card.reps, 0),
    lapses: numberField(card.lapses, 0),
  }
  const next = nextSchedule(prev, graded, { now, targetDate })

  // The SM-2 merge-write leaves the identity fields untouched. `suspended` is set
  // ONLY by the spec-11 gold-mint branch below (and only on a transfer card), so
  // this base write deliberately omits it.
  tx.set(
    ref,
    {
      dueAt: Timestamp.fromDate(next.dueAt),
      intervalDays: next.intervalDays,
      easeFactor: next.easeFactor,
      reps: next.reps,
      lapses: next.lapses,
      lastResult: graded,
      lastConfidence: confidence, // null when omitted (not a stale carry-over)
      lastReviewedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  // ── spec-11: gold mint on an honest, DELAYED, SERVER-GRADED pass (§3.3) ───────
  // `graded` is the SERVER's verdict (gradeAgainstAccept above), NOT a client
  // result — a wrong answer is `fail` here and mints nothing (R13). Track is read
  // off the CARD (set at creation from progress.track / defaultTrack, README §4),
  // never a client arg (R12). Upgrade-only + idempotent: only ever write
  // mastered:true, never demote, and never re-write once already gold (mirrors
  // index.ts's upgrade-only discipline).
  const cardTrack: 'A' | 'B' = card.track === 'B' ? 'B' : 'A'
  const cardCreatedAt = card.createdAt as Timestamp | undefined
  const isTransfer = card.isTransfer === true
  if (
    goldMintEnabled && // spec-05 server kill switch (DEFAULT-OFF at the callable)
    graded === 'pass' &&
    !alreadyGold &&
    cardCreatedAt != null &&
    typeof cardCreatedAt.toDate === 'function' &&
    qualifiesForGoldMint({ createdAt: cardCreatedAt, isTransfer }, now, cardTrack)
  ) {
    tx.set(
      progressRef,
      {
        derived: { mastered: true }, // merge:true deep-merges (matches index.ts)
        updatedAt: FieldValue.serverTimestamp(),
        schemaVersion: PROGRESS_SCHEMA_VERSION,
      },
      { merge: true },
    )
    // spec-01 §5a hands `suspended` to spec-11: a TRANSFER card that reaches gold
    // drops to maintenance cadence. Track-A checkpoint cards stay in active
    // rotation (NOT suspended). This is the field's only writer.
    if (isTransfer) {
      tx.set(
        ref,
        { suspended: true, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      )
    }
  }

  // ── spec-11 / spec-12 (README §5): review-rep calibration fold ────────────────
  // A review carrying a confidence is the third D6 capture site — fold it into the
  // cross-concept calibration trend so review reps count toward Brier. summarySnap
  // was read in the read phase above; the fold is the same pure helper the
  // interview uses, recomputing pooled + per-byFormat denormals.
  if (confidence != null && summarySnap) {
    const item: CalibrationItem = {
      confidence,
      correct: graded === 'pass',
      format: REVIEW_CALIBRATION_FORMAT,
    }
    const prior = (summarySnap.data() ?? {}) as {
      n?: number
      brierSum?: number
      confidenceSum?: number
      correctSum?: number
      byFormat?: Partial<Record<CalibrationFormat, TrendSums>>
    }
    const folded = foldAttemptIntoTrend(
      {
        n: prior.n ?? 0,
        brierSum: prior.brierSum ?? 0,
        confidenceSum: prior.confidenceSum ?? 0,
        correctSum: prior.correctSum ?? 0,
        byFormat: prior.byFormat,
      },
      [item],
    )
    const byFormatDenorm: Partial<Record<CalibrationFormat, ReturnType<typeof denormSums>>> = {}
    for (const f of Object.keys(folded.byFormat) as CalibrationFormat[]) {
      byFormatDenorm[f] = denormSums(folded.byFormat[f] as TrendSums)
    }
    tx.set(
      summaryRef,
      {
        ...denormSums({
          n: folded.n,
          brierSum: folded.brierSum,
          confidenceSum: folded.confidenceSum,
          correctSum: folded.correctSum,
        }),
        byFormat: byFormatDenorm,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
  }

  return {
    graded,
    next,
    elapsedIntervalDays: prev.intervalDays, // the interval that ELAPSED pre-review
    schemaId: typeof card.schemaId === 'string' ? card.schemaId : '',
  }
}

export const submitReview = onCall(
  async (request: CallableRequest<SubmitReviewData>) => {
    const uid = requireUid(request)
    const data = request.data ?? {}
    const cardId = requireString(data.cardId, 'cardId')

    const answer = data.answer
    if (answer == null || typeof answer !== 'object' || Array.isArray(answer)) {
      throw new HttpsError('invalid-argument', 'answer must be an object.')
    }
    let confidence: number | null = null
    if (data.confidence !== undefined) {
      if (typeof data.confidence !== 'number' || !Number.isFinite(data.confidence)) {
        throw new HttpsError('invalid-argument', 'confidence must be a finite number.')
      }
      confidence = data.confidence
    }

    const now = new Date() // server now — R12; never a client timestamp

    // spec-05 SERVER kill switch (D17 / R14): resolve the gold-mint gate BEFORE
    // the tx. serverGatedOn consults the per-feature flag (config/flags.goldMint,
    // fail-closed to OFF) + the user's persisted holdout cohort. DEFAULT-OFF:
    // until an operator flips goldMint=true in config/flags, gold never mints — no
    // error surfaced (silver still minted instantly by spec-11's earlier stage).
    let goldMintEnabled = false
    try {
      const [serverFlags, userSnap] = await Promise.all([
        loadServerFlags(),
        db.doc(`users/${uid}`).get(),
      ])
      const cohort = userSnap.get('rolloutCohort') as
        | 'treatment'
        | 'holdout'
        | undefined
      goldMintEnabled = serverGatedOn('goldMint', cohort, serverFlags)
    } catch {
      goldMintEnabled = false // fail CLOSED — never mint on a flag-read error
    }

    const result = await db.runTransaction((tx) =>
      submitReviewTx(
        tx,
        uid,
        cardId,
        answer as Record<string, string>,
        confidence,
        now,
        goldMintEnabled,
      ),
    )

    // Fire the per-interval outcome event (spec-04 feed — UNTUNED) after commit.
    reviewOutcomeSink({
      cardId,
      schemaId: result.schemaId,
      intervalDays: result.elapsedIntervalDays,
      result: result.graded,
      lapses: result.next.lapses,
    })

    return {
      result: result.graded, // server-graded
      dueAt: result.next.dueAt.toISOString(),
      intervalDays: result.next.intervalDays,
      easeFactor: result.next.easeFactor,
      reps: result.next.reps,
      lapses: result.next.lapses,
      lastResult: result.graded,
    }
  },
)

// Parse userDoc.targetInterviewDate (YYYY-MM-DD) → a Date at LOCAL midnight, or
// null. Coherent with the client validateInterviewDate normalization.
function parseTargetDate(raw: string | undefined): Date | null {
  if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  const [y, m, d] = raw.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? null : date
}

function numberField(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function requireCardString(value: unknown, name: string, cardId: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new HttpsError('failed-precondition', `card ${cardId} is missing ${name}.`)
  }
  return value
}
