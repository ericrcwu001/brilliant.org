// Snapshot persistence + restore (Phase 15).
//
// Contract (docs/mvp_prd.md "Resume authority and restore contract"):
//   - users/{uid}/snapshots/{lessonId} is the authoritative restore source.
//   - Writes are debounced ≥1s, flushed on beat change + page hide, and
//     fire-and-forget so offline Firestore writes never block the UI.
//   - Every commit is mirrored synchronously to localStorage with the same
//     schema + updatedAt; on load the newer of the two sources wins (covers a
//     refresh before the debounced remote write lands).
//   - Only the last *committed* interaction is authoritative — there are no drag
//     frames in this tap-only UI, and nothing is written during animation.
//
// The cross-beat LessonState (predictions + engine summaries) is serialized
// under the documented `prediction` key as a single blob, and the equation
// builder's slot placements under `equationTiles`, keeping the snapshot to the
// three interactionState keys Phase 18 will whitelist.

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/app'
import { SnapshotSchema, type Snapshot } from '../content/schema'
import type { LessonState } from './beats/types'

export const SNAPSHOT_SCHEMA_VERSION = 1
const DEBOUNCE_MS = 1000

type PredictionBlob = {
  initialPrediction: string | null
  finalPrediction: number | null
  theoreticalValue: number | null
  empiricalMean: number | null
  simRuns: number | null
}

// What the LessonPlayer hands the writer on each commit; the writer stamps
// updatedAt + schemaVersion.
export type SnapshotInput = {
  lessonId: string
  beatId: string
  pattern: string | null
  completedBeats: string[]
  lessonState: LessonState
  hintLevelByBeat: Record<string, number>
}

const localKey = (uid: string, lessonId: string) =>
  `phht:snapshot:${uid}:${lessonId}`

const snapshotRef = (uid: string, lessonId: string) =>
  doc(db, 'users', uid, 'snapshots', lessonId)

function toSnapshot(input: SnapshotInput, updatedAt: string): Snapshot {
  const ls = input.lessonState
  const prediction: PredictionBlob = {
    initialPrediction: ls.initialPrediction ?? null,
    finalPrediction: ls.finalPrediction ?? null,
    theoreticalValue: ls.theoreticalValue ?? null,
    empiricalMean: ls.empiricalMean ?? null,
    simRuns: ls.simRuns ?? null,
  }
  const interactionState: Snapshot['interactionState'] = {
    prediction,
    hintLevelByBeat: input.hintLevelByBeat,
  }
  // Omit the key entirely when absent so we never write `undefined` to Firestore.
  if (ls.equationTiles) interactionState.equationTiles = ls.equationTiles
  return {
    lessonId: input.lessonId,
    beatId: input.beatId,
    pattern: input.pattern,
    completedBeats: input.completedBeats,
    interactionState,
    updatedAt,
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
  }
}

// Reconstruct the cross-beat LessonState from a restored snapshot.
export function snapshotToLessonState(snap: Snapshot): LessonState {
  const p = (snap.interactionState.prediction ?? {}) as Partial<PredictionBlob>
  const out: LessonState = {}
  if (p.initialPrediction != null) out.initialPrediction = String(p.initialPrediction)
  if (typeof p.finalPrediction === 'number') out.finalPrediction = p.finalPrediction
  if (typeof p.theoreticalValue === 'number') out.theoreticalValue = p.theoreticalValue
  if (typeof p.empiricalMean === 'number') out.empiricalMean = p.empiricalMean
  if (typeof p.simRuns === 'number') out.simRuns = p.simRuns
  if (snap.interactionState.equationTiles) {
    out.equationTiles = snap.interactionState.equationTiles
  }
  return out
}

export function hintLevelsOf(snap: Snapshot): Record<string, number> {
  return snap.interactionState.hintLevelByBeat ?? {}
}

function readLocalSnapshot(uid: string, lessonId: string): Snapshot | null {
  try {
    const raw = localStorage.getItem(localKey(uid, lessonId))
    if (!raw) return null
    return SnapshotSchema.parse(JSON.parse(raw))
  } catch {
    // Missing/corrupt mirror — treat as no local snapshot.
    return null
  }
}

function writeLocalSnapshot(snap: Snapshot, uid: string): void {
  try {
    localStorage.setItem(localKey(uid, snap.lessonId), JSON.stringify(snap))
  } catch {
    // Storage full or unavailable — Firestore remains the durable copy.
  }
}

// Hydrate the newer of the Firestore doc and the local mirror. Used by the
// lesson route before mounting the player, so restore is synchronous from the
// player's point of view.
export async function loadSnapshot(
  uid: string,
  lessonId: string,
): Promise<Snapshot | null> {
  const local = readLocalSnapshot(uid, lessonId)
  let remote: Snapshot | null = null
  try {
    const snap = await getDoc(snapshotRef(uid, lessonId))
    if (snap.exists()) remote = SnapshotSchema.parse(snap.data())
  } catch {
    // Offline or read error → fall back to the local mirror.
  }
  if (!local) return remote
  if (!remote) return local
  // Whichever was committed last wins; ties favor local (refresh-before-flush).
  return local.updatedAt >= remote.updatedAt ? local : remote
}

export type SnapshotWriter = {
  save: (input: SnapshotInput) => void
  flush: () => void
}

// Debounced, fire-and-forget snapshot writer with a synchronous localStorage
// mirror. No-ops when disabled (the dev route runs without auth/persistence).
export function useSnapshotWriter(opts: {
  uid: string | null
  lessonId: string
  enabled: boolean
}): SnapshotWriter {
  const { uid, lessonId, enabled } = opts
  const latest = useRef<Snapshot | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const writeRemote = useCallback(() => {
    const snap = latest.current
    if (!snap || !enabled || !uid) return
    // Fire-and-forget: an offline/slow write must never block interaction.
    void setDoc(snapshotRef(uid, lessonId), snap).catch(() => {})
  }, [uid, lessonId, enabled])

  const save = useCallback(
    (input: SnapshotInput) => {
      if (!enabled || !uid) return
      const snap = toSnapshot(input, new Date().toISOString())
      latest.current = snap
      // Synchronous mirror first so a refresh before the debounced remote write
      // still restores the last committed interaction.
      writeLocalSnapshot(snap, uid)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        timer.current = null
        writeRemote()
      }, DEBOUNCE_MS)
    },
    [enabled, uid, writeRemote],
  )

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    writeRemote()
  }, [writeRemote])

  // Flush on page hide; flush any pending write on unmount (leaving the lesson).
  useEffect(() => {
    if (!enabled) return
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
        writeRemote()
      }
    }
  }, [enabled, flush, writeRemote])

  return useMemo(() => ({ save, flush }), [save, flush])
}
