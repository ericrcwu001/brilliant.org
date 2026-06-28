// Server-side rollout flags + kill switches (spec-05, D17 / R14).
//
// The AUTHORITATIVE source for Function-owned kill switches (async gold-mint —
// rules deny client writes to progression, README §4 Foundation A / R4, so the
// gold-mint kill must be server-side). Reads the `config/flags` Firestore doc via
// the Admin SDK (bypasses rules), parses against ServerFlagsSchema, caches
// per-instance with a short TTL so a kill flip propagates within ~60s WITHOUT a
// deploy. Falls back to DEFAULT_FLAGS_SERVER on any error — which is now all-ON
// (2026-06-28 override of the original fail-closed rule; see src/config/flags.ts).
//
// The client mirror lives in src/config/flags.ts; flags.parity.test.ts asserts the
// two schemas have byte-identical keys so a flag cannot drift between sides.

import { z } from 'zod'
import { getFirestore } from 'firebase-admin/firestore'

// Mirror of the client FlagsSchema (src/config/flags.ts) — SAME keys + defaults.
// Every flag DEFAULT-ON as of 2026-06-28 (LS-on-for-everyone). The server reads the
// config/flags doc (typed booleans/number, not Remote Config strings), so no
// coercion is needed here. .strip() drops unknown keys (a backend typo cannot
// smuggle an unknown gate). Server-consumed flags: goldMint (review.ts) +
// brutalMockFloor (interview.ts).
export const ServerFlagsSchema = z
  .object({
    dailyReviewQueue: z.boolean().default(true),
    difficultyGovernor: z.boolean().default(true),
    brutalMockFloor: z.boolean().default(true),
    goldMint: z.boolean().default(true),
    rolloutPercent: z.number().min(0).max(100).default(100),
  })
  .strip()

export type ServerFlags = z.infer<typeof ServerFlagsSchema>

// Default server flag set — now all-ON (2026-06-28). The fallback on any read
// error, so the server now fails OPEN (e.g. gold-mint stays enabled during a
// Firestore outage). Kill an individual flag by setting it false in config/flags.
export const DEFAULT_FLAGS_SERVER: ServerFlags = ServerFlagsSchema.parse({})

// Per-instance cache with a short TTL (kill flips propagate within ~60s).
const TTL_MS = 60_000
let cached: ServerFlags = DEFAULT_FLAGS_SERVER
let cachedAt = 0

// Test seam: a swappable doc reader so the cache + fail-closed logic is unit
// testable without the firebase-admin runtime.
type FlagsDocReader = () => Promise<Record<string, unknown> | undefined>
let docReader: FlagsDocReader | null = null

export function __setFlagsDocReaderForTest(reader: FlagsDocReader | null): void {
  docReader = reader
  cached = DEFAULT_FLAGS_SERVER
  cachedAt = 0
}

async function readFlagsDoc(): Promise<Record<string, unknown> | undefined> {
  if (docReader) return docReader()
  const snap = await getFirestore().doc('config/flags').get()
  return snap.exists ? (snap.data() as Record<string, unknown>) : undefined
}

// Read + parse + cache the server flags. Falls back to DEFAULT_FLAGS_SERVER on any
// error (missing doc, parse failure, Firestore throw) — now all-ON, so the server
// fails OPEN (2026-06-28 override; kill an individual flag in config/flags instead).
export async function loadServerFlags(now: number = Date.now()): Promise<ServerFlags> {
  if (now - cachedAt < TTL_MS && cachedAt !== 0) return cached
  try {
    const data = await readFlagsDoc()
    const parsed = ServerFlagsSchema.safeParse(data ?? {})
    cached = parsed.success ? parsed.data : DEFAULT_FLAGS_SERVER
  } catch {
    cached = DEFAULT_FLAGS_SERVER // fail OPEN (defaults now all-ON)
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
