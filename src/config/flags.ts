// Rollout flags + holdout-cohort assignment (spec-05, D17 / R14).
//
// This is the SINGLE client-side flag mechanism. No surface reads Remote Config
// (or the config/flags fallback doc) directly — every gate goes through
// getFlagsSync()/loadFlags() here + gatedOn() in src/auth/track.ts.
//
// THE MANDATE (R14 — no flag/remote-config/kill-switch infra existed before this
// spec): every net-new aggressive behavior ships DEFAULT-OFF behind a flag, and a
// flag that cannot be read FAILS CLOSED to all-off — a misconfigured or
// unreachable backend can never accidentally ship a feature ON.
//
// Mechanism (spec-05 §3a): Firebase Remote Config is the primary client source
// (zero-dep — firebase@^12 bundles firebase/remote-config; console-flippable with
// no deploy; mirrors the App Check "init early, skip in emulator" precedent in
// src/firebase/app.ts). A flag that ALSO gates a Function-owned write (goldMint)
// is mirrored server-side in functions/src/flags.ts (a kill there is the
// authoritative one for the write); it is declared here only for client copy.

import { z } from 'zod'
import { app, usingEmulators } from '../firebase/app'

// FROZEN flag shape (spec-05 §3a). Every feature flag DEFAULT-OFF. `.strip()`
// drops unknown keys so a backend typo cannot smuggle a truthy unknown gate.
// The four gated behaviors map 1:1 to D17's four net-new aggressive behaviors.
export const FlagsSchema = z
  .object({
    dailyReviewQueue: z.boolean().default(false), // spec-20 surface mount
    difficultyGovernor: z.boolean().default(false), // spec-21 governor knobs
    brutalMockFloor: z.boolean().default(false), // spec-22 tier floor (NOT the rubric bug fix)
    // Async gold-mint is ALSO mirrored server-side (config/flags.goldMint, the
    // authoritative kill for the Function-owned write). Declared here for client
    // tooltip copy / parity only — the client never mints gold.
    goldMint: z.boolean().default(false), // spec-11
    // Staged rollout %: the deterministic cohort bucket threshold (§3c).
    rolloutPercent: z.number().min(0).max(100).default(0),
  })
  .strip()

export type Flags = z.infer<typeof FlagsSchema>

// Every feature default-off (R14 corollary). The cached value until loadFlags
// resolves AND the fail-closed value on any error.
export const ALL_OFF: Flags = FlagsSchema.parse({})

// Per-session in-memory cache. getFlagsSync returns this; loadFlags fills it.
let cached: Flags = ALL_OFF
let loadPromise: Promise<Flags> | null = null

// Remote Config parameter keys map 1:1 to FlagsSchema keys. Remote Config stores
// every value as a STRING, so booleans arrive as "true"/"false" and the percent
// as a numeric string — coerce before parsing.
function coerceRemoteConfigValues(raw: Record<string, string>): unknown {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(FlagsSchema.shape)) {
    if (!(key in raw)) continue
    const v = raw[key]
    if (key === 'rolloutPercent') {
      const n = Number(v)
      if (Number.isFinite(n)) out[key] = n
    } else {
      out[key] = v === 'true'
    }
  }
  return out
}

// Fetch + activate Remote Config, parse against FlagsSchema, cache for the
// session. FAILS CLOSED to ALL_OFF on ANY error (network, parse, emulator). In
// emulator/dev there is no Remote Config backend, so we skip it and stay ALL_OFF
// (mirrors the App Check emulator-skip in src/firebase/app.ts).
export async function loadFlags(): Promise<Flags> {
  if (loadPromise) return loadPromise
  loadPromise = (async () => {
    try {
      if (usingEmulators) {
        cached = ALL_OFF
        return cached
      }
      const { getRemoteConfig, fetchAndActivate, getAll } = await import(
        'firebase/remote-config'
      )
      const rc = getRemoteConfig(app)
      // In-app defaults so a first paint before fetch is also all-off.
      rc.defaultConfig = {
        dailyReviewQueue: false,
        difficultyGovernor: false,
        brutalMockFloor: false,
        goldMint: false,
        rolloutPercent: 0,
      }
      await fetchAndActivate(rc)
      const all = getAll(rc)
      const raw: Record<string, string> = {}
      for (const [k, v] of Object.entries(all)) raw[k] = v.asString()
      const parsed = FlagsSchema.safeParse(coerceRemoteConfigValues(raw))
      cached = parsed.success ? parsed.data : ALL_OFF
      return cached
    } catch {
      // Fail CLOSED — a flag that cannot be read behaves as if OFF (R14).
      cached = ALL_OFF
      return cached
    }
  })()
  return loadPromise
}

// Synchronous cached read for render-time gates. Returns ALL_OFF until loadFlags
// resolves, so a surface that reads before flags load defaults OFF (fail-closed).
export function getFlagsSync(): Flags {
  return cached
}

// Test seam: reset the module cache so each test starts from ALL_OFF.
export function __resetFlagsForTest(next: Flags = ALL_OFF): void {
  cached = next
  loadPromise = null
}

// ── Holdout-cohort assignment (the split spec-04 reads; README §4.5) ────────────
// There is ONE rollout-cohort enum: 'treatment' | 'holdout'. NO 'control' literal.
// 'holdout' is the withheld-from-rollout control arm spec-04 measures against.
export type RolloutCohort = 'treatment' | 'holdout'

// Deterministic, server-anchored hash of `uid` to a stable bucket in [0,100).
// FNV-1a over the uid → a uniform-ish bucket. Pure + deterministic so the same
// user always lands in the same bucket as rolloutPercent ramps.
function uidBucket(uid: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < uid.length; i++) {
    h ^= uid.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  // >>> 0 → unsigned; mod 100 → a stable bucket in [0,100).
  return (h >>> 0) % 100
}

// Assign a cohort: treatment iff bucket < rolloutPercent, else holdout.
// MONOTONIC in rolloutPercent (bucket < p1 ⇒ bucket < p2 for p2 > p1) so raising
// the % only ever ADDS users to treatment — a 0→5→25→100 ramp never flips a user
// out of treatment. Deterministic in uid.
export function assignCohort(uid: string, rolloutPercent: number): RolloutCohort {
  const pct = Math.max(0, Math.min(100, rolloutPercent))
  return uidBucket(uid) < pct ? 'treatment' : 'holdout'
}
