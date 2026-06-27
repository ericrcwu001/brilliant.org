// Client read selector for the Function-written calibration trend (spec-12 §3.4).
//
// The trend doc `users/{uid}/calibration/summary` is Function-written and owner
// read-only (firestore.rules). spec-23 (and any surface) reads it through THIS one
// place rather than touching Firestore directly. The Firestore read is lazy-imported
// so the module stays dependency-free where possible; the parse goes through
// CalibrationSummarySchema, and any missing/denied/offline read degrades to null —
// the same try/catch → null idiom as recommend.ts's loadMaxHintLevels.

import { CalibrationSummarySchema } from '../content/schema'
import type { CalibrationResult } from './calibration'

/**
 * Load the learner's cross-concept calibration trend. Returns the pooled
 * CalibrationResult (+ per-format byFormat sub-summaries) for spec-23 to render, or
 * `null` when the doc is missing, the read is denied/offline, or the parse fails.
 */
export async function loadCalibrationSummary(uid: string): Promise<CalibrationResult | null> {
  try {
    const [{ getDb }, { doc, getDoc }] = await Promise.all([
      import('../firebase/app'),
      import('firebase/firestore'),
    ])
    const db = await getDb()
    const snap = await getDoc(doc(db, 'users', uid, 'calibration', 'summary'))
    if (!snap.exists()) return null
    const parsed = CalibrationSummarySchema.safeParse(snap.data())
    if (!parsed.success) return null
    const d = parsed.data
    if (typeof d.n !== 'number' || d.n === 0) return null
    return {
      n: d.n,
      brier: d.brier ?? null,
      meanConfidence: d.meanConfidence ?? null,
      accuracy: d.accuracy ?? null,
      overconfidence: d.overconfidence ?? null,
      reliable: d.reliable ?? false,
      byFormat: d.byFormat
        ? {
            ...(d.byFormat.voice
              ? { voice: { n: d.byFormat.voice.n, brier: d.byFormat.voice.brier ?? null, overconfidence: d.byFormat.voice.overconfidence ?? null } }
              : {}),
            ...(d.byFormat.typein
              ? { typein: { n: d.byFormat.typein.n, brier: d.byFormat.typein.brier ?? null, overconfidence: d.byFormat.typein.overconfidence ?? null } }
              : {}),
            ...(d.byFormat.binary
              ? { binary: { n: d.byFormat.binary.n, brier: d.byFormat.binary.brier ?? null, overconfidence: d.byFormat.binary.overconfidence ?? null } }
              : {}),
          }
        : undefined,
    }
  } catch {
    // Offline / denied / missing → no trend.
    return null
  }
}
