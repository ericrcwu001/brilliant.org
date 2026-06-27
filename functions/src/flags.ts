// Server-side rollout flags + kill switches (spec-05, D17 / R14).
//
// The AUTHORITATIVE source for Function-owned kill switches (async gold-mint —
// rules deny client writes to progression, README §4 Foundation A / R4, so the
// gold-mint kill must be server-side). Reads the `config/flags` Firestore doc via
// the Admin SDK (bypasses rules), parses against ServerFlagsSchema, caches
// per-instance with a short TTL so a kill flip propagates within ~60s WITHOUT a
// deploy. FAILS CLOSED to ALL_OFF_SERVER on any error.
//
// The client mirror lives in src/config/flags.ts; flags.parity.test.ts asserts the
// two schemas have byte-identical keys so a flag cannot drift between sides.

import { z } from 'zod'
import { getFirestore } from 'firebase-admin/firestore'

// Mirror of the client FlagsSchema (src/config/flags.ts) — SAME keys. The server
// reads the config/flags doc (typed booleans/number, not Remote Config strings),
// so no coercion is needed here. .strip() drops unknown keys (a backend typo
// cannot smuggle a truthy gate).
export const ServerFlagsSchema = z
  .object({
    dailyReviewQueue: z.boolean().default(false),
    difficultyGovernor: z.boolean().default(false),
    brutalMockFloor: z.boolean().default(false),
    goldMint: z.boolean().default(false),
    rolloutPercent: z.number().min(0).max(100).default(0),
  })
  .strip()

export type ServerFlags = z.infer<typeof ServerFlagsSchema>

export const ALL_OFF_SERVER: ServerFlags = ServerFlagsSchema.parse({})

// Per-instance cache with a short TTL (kill flips propagate within ~60s).
const TTL_MS = 60_000
let cached: ServerFlags = ALL_OFF_SERVER
let cachedAt = 0

// Test seam: a swappable doc reader so the cache + fail-closed logic is unit
// testable without the firebase-admin runtime.
type FlagsDocReader = () => Promise<Record<string, unknown> | undefined>
let docReader: FlagsDocReader | null = null

export function __setFlagsDocReaderForTest(reader: FlagsDocReader | null): void {
  docReader = reader
  cached = ALL_OFF_SERVER
  cachedAt = 0
}

async function readFlagsDoc(): Promise<Record<string, unknown> | undefined> {
  if (docReader) return docReader()
  const snap = await getFirestore().doc('config/flags').get()
  return snap.exists ? (snap.data() as Record<string, unknown>) : undefined
}

// Read + parse + cache the server flags. FAILS CLOSED to ALL_OFF_SERVER on any
// error (missing doc, parse failure, Firestore throw) — the kill is the safe state.
export async function loadServerFlags(now: number = Date.now()): Promise<ServerFlags> {
  if (now - cachedAt < TTL_MS && cachedAt !== 0) return cached
  try {
    const data = await readFlagsDoc()
    const parsed = ServerFlagsSchema.safeParse(data ?? {})
    cached = parsed.success ? parsed.data : ALL_OFF_SERVER
  } catch {
    cached = ALL_OFF_SERVER // fail CLOSED
  }
  cachedAt = now
  return cached
}

// Server twin of src/auth/track.ts gatedOn for a Function-owned feature. The
// gold-mint kill consults BOTH the per-feature flag AND the user's persisted
// holdout cohort (a holdout user never gets the aggressive behavior — control arm).
// Track/learningGoal intensity is enforced at card creation (the card's `track`
// already encodes it), so the server gate is flag + cohort only.
export function serverGatedOn(
  feature: keyof ServerFlags,
  rolloutCohort: 'treatment' | 'holdout' | undefined,
  flags: ServerFlags,
): boolean {
  if (rolloutCohort === 'holdout') return false // control cohort — never aggressive
  const value = flags[feature]
  return value === true
}
