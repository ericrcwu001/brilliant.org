// src/lesson/queue.ts — spaced-review queue: pure due-selection + interleave +
// confusable foils, plus a thin Firestore reader (spec-10, README §4.7).
//
// brainlift app-actions #1 (spaced problem-level retrieval) + #10 (method-indexed
// weakness); decisions D3 (SR atomic unit = graded beat + method tag), D14 (client
// computes "what's due", Functions own writes).
//
// The pure pieces (dueCards / isNotationReady / areConfusable / buildQueue) are
// dependency-free and node-testable like recommend.ts. Only `loadDueQueue` touches
// Firestore (lazy import, try/catch → []), mirroring loadMaxHintLevels.

import { ReviewCardSchema, type Beat, type ReviewCard } from '../content/schema'
import { METHODS, CONFUSABLE, type MethodId } from '../content/methods'

export type QueueItem = {
  cardId: string // `${lessonId}__${beatId}`
  lessonId: string
  beatId: string
  conceptId: string
  schemaId: MethodId
  kind: 'review' | 'foil' // foil = a deliberate confusable-method item (which-method context)
}

// A lesson's beats + whether it is completed, supplied by the caller so the
// prerequisite/notation guard can see notation tags (R5). The map key is lessonId.
export type LessonOrder = { lessonId: string; beats: Beat[]; completed: boolean }

// dueAt is a Firestore Timestamp at runtime (schema types it `unknown`). Read it
// defensively (mirror src/interview/attempts.ts toMs) so a malformed row sorts to
// the back rather than throwing.
function toMs(ts: unknown): number {
  if (ts && typeof ts === 'object' && 'toMillis' in ts) {
    return (ts as { toMillis(): number }).toMillis()
  }
  if (typeof ts === 'number') return ts
  if (ts instanceof Date) return ts.getTime()
  return Number.POSITIVE_INFINITY
}

/** Pure: cards whose dueAt <= now, excluding suspended, sorted by dueAt. `now` is
 * a Date passed in by the caller (R12 — never a client startedAt). */
export function dueCards(cards: ReviewCard[], now: Date): ReviewCard[] {
  const nowMs = now.getTime()
  return cards
    .filter((c) => !c.suspended && toMs(c.dueAt) <= nowMs)
    .sort((a, b) => toMs(a.dueAt) - toMs(b.dueAt))
}

/**
 * Prerequisite/notation guard (R5): never surface a card whose beat introduces or
 * depends on notation not yet taught. A card is eligible only if its source lesson
 * is `completed` AND every `groundedBy` beatId of the target beat precedes it
 * within that lesson's own beat order. A lesson absent from `order` or not
 * completed is excluded outright. A card whose target beat is missing is excluded.
 */
export function isNotationReady(
  card: ReviewCard,
  order: Map<string, LessonOrder>,
): boolean {
  const lesson = order.get(card.lessonId)
  if (!lesson || !lesson.completed) return false
  const idx = lesson.beats.findIndex((b) => b.beatId === card.beatId)
  if (idx < 0) return false
  const target = lesson.beats[idx]
  const grounded = (target as { groundedBy?: string[] }).groundedBy
  if (!grounded || grounded.length === 0) return true
  // Every grounding beat must appear strictly before the target beat.
  const precedingIds = new Set(lesson.beats.slice(0, idx).map((b) => b.beatId))
  return grounded.every((id) => precedingIds.has(id))
}

/**
 * Two methods are confusable iff `b ∈ CONFUSABLE[a]` (the CURATED near-miss map in
 * methods.ts — the primary signal). FALLBACK only when `CONFUSABLE[a]` is
 * undefined/empty: domain overlap (METHODS[a].domains ∩ METHODS[b].domains ≠ ∅).
 * `a === b` is never confusable. Reads METHODS/CONFUSABLE only for valid ids.
 */
export function areConfusable(a: MethodId, b: MethodId): boolean {
  if (a === b) return false
  if (!(a in METHODS) || !(b in METHODS)) return false
  const curated = CONFUSABLE[a]
  if (curated && curated.length > 0) return curated.includes(b)
  // Fallback: domain overlap.
  const domainsA = new Set<string>(METHODS[a].domains)
  return METHODS[b].domains.some((d) => domainsA.has(d))
}

// A card with a real (non-empty, METHODS-backed) schemaId. Narrowing the union to
// MethodId lets the bucketing/foil code index METHODS/CONFUSABLE safely.
type TaggedCard = ReviewCard & { schemaId: MethodId }

function toQueueItem(card: TaggedCard, kind: 'review' | 'foil'): QueueItem {
  return {
    cardId: `${card.lessonId}__${card.beatId}`,
    lessonId: card.lessonId,
    beatId: card.beatId,
    conceptId: card.conceptId,
    schemaId: card.schemaId,
    kind,
  }
}

/**
 * Pure builder: due, notation-ready cards interleaved by method, optionally with
 * confusable-method foils injected, capped at `maxItems`. Deterministic given a
 * fixed input order (stable for tests).
 *
 * R5 / gate Issue #6: cards with a falsy/empty (or unknown) `schemaId` are FILTERED
 * OUT before bucketing/foiling — `METHODS[''] === undefined`, so reading `.domains`
 * on an un-backfilled card would throw. A corpus where every due card lacks a
 * usable schemaId degrades to plain due-order (no interleave, no foils) rather than
 * crashing.
 *
 * Interleave = round-robin across per-method buckets (bucket order = first
 * appearance; within a bucket, due order is preserved) so adjacent items differ in
 * method where avoidable. Foils (when `opts.foils`) re-order EXISTING due cards: a
 * due card of a method confusable with the just-placed method is pulled forward and
 * marked `kind:'foil'`. No content is synthesised.
 */
export function buildQueue(
  cards: ReviewCard[],
  order: Map<string, LessonOrder>,
  now: Date,
  opts: { maxItems: number; foils: boolean },
): QueueItem[] {
  // 1) due + notation-ready, in dueAt order.
  const eligible = dueCards(cards, now).filter((c) => isNotationReady(c, order))

  // 2) Drop un-backfilled / unknown-method cards BEFORE any METHODS/CONFUSABLE
  //    index (gate Issue #6). Degrades to plain due-order when none survive.
  const tagged = eligible.filter(
    (c): c is TaggedCard => typeof c.schemaId === 'string' && c.schemaId in METHODS,
  )
  if (tagged.length === 0) {
    // Plain due-order over the eligible cards we couldn't bucket (no interleave/foil).
    return eligible
      .slice(0, Math.max(0, opts.maxItems))
      .map((c) => toQueueItem(c as TaggedCard, 'review'))
  }

  // 3) Bucket by method (first-appearance order; due order within a bucket).
  const buckets = new Map<MethodId, TaggedCard[]>()
  for (const c of tagged) {
    const list = buckets.get(c.schemaId)
    if (list) list.push(c)
    else buckets.set(c.schemaId, [c])
  }

  // 4) Round-robin interleave across buckets.
  const interleaved: TaggedCard[] = []
  const order2 = [...buckets.keys()]
  let remaining = tagged.length
  while (remaining > 0) {
    for (const method of order2) {
      const list = buckets.get(method)
      if (list && list.length > 0) {
        interleaved.push(list.shift()!)
        remaining -= 1
      }
    }
  }

  // 5) Foils: greedily pull a confusable-method card forward after each placement.
  //    Operates only on schemaId-bearing cards, so METHODS/CONFUSABLE are never
  //    indexed with an empty id.
  const sequence = opts.foils ? injectFoils(interleaved) : interleaved.map((c) => toQueueItem(c, 'review'))

  return sequence.slice(0, Math.max(0, opts.maxItems))
}

/**
 * Re-order an already-interleaved list so a confusable sibling follows each item:
 * after placing a card of method `a`, prefer the next remaining card whose method
 * `b` satisfies `areConfusable(a, b)` and mark it a foil. Curated matches
 * (CONFUSABLE[a]) are preferred over merely domain-overlapping ones. Deterministic:
 * always picks the EARLIEST remaining qualifying card.
 */
function injectFoils(interleaved: TaggedCard[]): QueueItem[] {
  const remaining = [...interleaved]
  const out: QueueItem[] = []
  let prevMethod: MethodId | null = null
  while (remaining.length > 0) {
    let pickIdx = 0
    let asFoil = false
    if (prevMethod !== null) {
      // Prefer a curated confusable sibling; else any (incl. domain-overlap) one.
      const curated = CONFUSABLE[prevMethod] ?? []
      const curatedIdx = remaining.findIndex(
        (c) => c.schemaId !== prevMethod && curated.includes(c.schemaId),
      )
      if (curatedIdx >= 0) {
        pickIdx = curatedIdx
        asFoil = true
      } else {
        const overlapIdx = remaining.findIndex(
          (c) => areConfusable(prevMethod as MethodId, c.schemaId),
        )
        if (overlapIdx >= 0) {
          pickIdx = overlapIdx
          asFoil = true
        }
      }
    }
    const [card] = remaining.splice(pickIdx, 1)
    out.push(toQueueItem(card, asFoil ? 'foil' : 'review'))
    prevMethod = card.schemaId
  }
  return out
}

/**
 * Thin async reader (D14, R12): reads the learner's due review cards from
 * Firestore and returns the built queue. The ONLY Firestore-touching piece. Mirrors
 * loadMaxHintLevels: lazy `firebase/firestore` import + try/catch → [] (a no-Firebase
 * dev route or a permission/offline failure degrades to the legacy recommender).
 *
 * Query (Issue #14): single-field `where('dueAt','<=', Timestamp.fromDate(now)).
 * orderBy('dueAt')` — the automatic single-field index suffices; NO composite. The
 * `now` is the client read clock used ONLY to decide what to SHOW; the authoritative
 * write-time comparison is the Function's server `now` (R12).
 *
 * `opts.foils`/`maxItems` default to a gentle straight interleave; spec-20 (the
 * Daily-Review surface) passes the quant-intensity-gated `{ foils }` + a tuned cap.
 */
export async function loadDueQueue(
  uid: string,
  now: Date,
  opts: { maxItems?: number; foils?: boolean } = {},
): Promise<QueueItem[]> {
  try {
    const [{ getDb }, { collection, query, where, orderBy, getDocs, Timestamp, doc, getDoc }] =
      await Promise.all([import('../firebase/app'), import('firebase/firestore')])
    const db = await getDb()
    const reviewsRef = collection(db, 'users', uid, 'reviews')
    const q = query(
      reviewsRef,
      where('dueAt', '<=', Timestamp.fromDate(now)),
      orderBy('dueAt'),
    )
    const snap = await getDocs(q)
    const cards: ReviewCard[] = []
    snap.forEach((d) => {
      const parsed = ReviewCardSchema.safeParse(d.data())
      if (parsed.success) cards.push(parsed.data)
    })
    if (cards.length === 0) return []

    // Load each due card's source-lesson beats into the prerequisite-order map.
    const lessonIds = [...new Set(cards.map((c) => c.lessonId))]
    const order = new Map<string, LessonOrder>()
    await Promise.all(
      lessonIds.map(async (lessonId) => {
        try {
          const lessonSnap = await getDoc(doc(db, 'lessons', lessonId))
          const data = lessonSnap.exists() ? (lessonSnap.data() as { beats?: Beat[] }) : null
          order.set(lessonId, {
            lessonId,
            beats: Array.isArray(data?.beats) ? data!.beats : [],
            // A card only exists for a beat once its lesson was completed; the card's
            // presence is the completion proof for the queue's read path.
            completed: true,
          })
        } catch {
          order.set(lessonId, { lessonId, beats: [], completed: true })
        }
      }),
    )

    return buildQueue(cards, order, now, {
      maxItems: opts.maxItems ?? cards.length,
      foils: opts.foils ?? false,
    })
  } catch {
    // Offline / denied / no-Firebase dev route → no due queue (legacy path).
    return []
  }
}
