// Rollout flags + holdout-cohort assignment (spec-05, D17 / R14).
//
// This is the SINGLE client-side flag mechanism. No surface reads Remote Config
// (or the config/flags fallback doc) directly — every gate goes through
// getFlagsSync()/loadFlags() here + gatedOn() in src/auth/track.ts.
//
// THE ORIGINAL MANDATE (R14): every net-new aggressive behavior shipped
// DEFAULT-OFF behind a flag, failing CLOSED to all-off so an unreachable backend
// could never accidentally ship a feature ON.
//
// UPDATE 2026-06-28 (product decision — "LS behaviors on for everyone"): the
// defaults below are now flipped to DEFAULT-ON and rolloutPercent to 100, and the
// quant-intensity gate is collapsed (see src/auth/track.ts:isQuantIntensity). This
// DELIBERATELY inverts R14 — the app now fails OPEN (a backend that can't be read
// leaves every feature ON). The flag + holdout-cohort kill switches still work, so
// an individual feature can be turned back off via Remote Config / the config/flags
// doc without a deploy. To restore the gentle path, set these defaults back to
// false / 0 and re-add the Track-B/interview predicate in isQuantIntensity.
//
// Mechanism (spec-05 §3a): Firebase Remote Config is the primary client source
// (zero-dep — firebase@^12 bundles firebase/remote-config; console-flippable with
// no deploy; mirrors the App Check "init early, skip in emulator" precedent in
// src/firebase/app.ts). A flag that ALSO gates a Function-owned write (goldMint)
// is mirrored server-side in functions/src/flags.ts (a kill there is the
// authoritative one for the write); it is declared here only for client copy.

import { z } from 'zod'
import { app, usingEmulators } from '../firebase/app'

// FROZEN flag shape (spec-05 §3a). Every feature flag DEFAULT-ON as of 2026-06-28
// (LS-on-for-everyone; see the header note). `.strip()` still drops unknown keys so
// a backend typo cannot smuggle an unknown gate.
// The four gated behaviors map 1:1 to D17's four net-new aggressive behaviors.
export const FlagsSchema = z
  .object({
    dailyReviewQueue: z.boolean().default(true), // spec-20 surface mount
    difficultyGovernor: z.boolean().default(true), // spec-21 governor knobs
    brutalMockFloor: z.boolean().default(true), // spec-22 tier floor (NOT the rubric bug fix)
    // Async gold-mint is ALSO mirrored server-side (config/flags.goldMint, the
    // authoritative kill for the Function-owned write). Declared here for client
    // tooltip copy / parity only — the client never mints gold.
    goldMint: z.boolean().default(true), // spec-11
    // Staged rollout %: the deterministic cohort bucket threshold (§3c).
    // Now 100 by default → every newly-assigned user lands in 'treatment'.
    rolloutPercent: z.number().min(0).max(100).default(100),
  })
  .strip()

export type Flags = z.infer<typeof FlagsSchema>

// The default flag set — now every feature DEFAULT-ON (2026-06-28; see header).
// The cached value until loadFlags resolves AND the value used when the backend is
// unreachable, so the app now fails OPEN (every gated feature on) rather than off.
export const DEFAULT_FLAGS: Flags = FlagsSchema.parse({})

// Per-session in-memory cache. getFlagsSync returns this; loadFlags fills it.
let cached: Flags = DEFAULT_FLAGS
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
// session. Falls back to DEFAULT_FLAGS on ANY error (network, parse, emulator) —
// which is now all-ON (fails OPEN, 2026-06-28). In emulator/dev there is no Remote
// Config backend, so we skip it and stay on DEFAULT_FLAGS.
export async function loadFlags(): Promise<Flags> {
  if (loadPromise) return loadPromise
  loadPromise = (async () => {
    try {
      if (usingEmulators) {
        cached = DEFAULT_FLAGS
        return cached
      }
      const { getRemoteConfig, fetchAndActivate, getAll } = await import(
        'firebase/remote-config'
      )
      const rc = getRemoteConfig(app)
      // In-app defaults so a first paint before fetch is also all-ON (2026-06-28).
      rc.defaultConfig = {
        dailyReviewQueue: true,
        difficultyGovernor: true,
        brutalMockFloor: true,
        goldMint: true,
        rolloutPercent: 100,
      }
      await fetchAndActivate(rc)
      const all = getAll(rc)
      const raw: Record<string, string> = {}
      for (const [k, v] of Object.entries(all)) raw[k] = v.asString()
      const parsed = FlagsSchema.safeParse(coerceRemoteConfigValues(raw))
      cached = parsed.success ? parsed.data : DEFAULT_FLAGS
      return cached
    } catch {
      // Fail OPEN — a flag that cannot be read falls back to DEFAULT_FLAGS, which
      // is now all-ON (2026-06-28 override of the original R14 fail-closed rule).
      cached = DEFAULT_FLAGS
      return cached
    }
  })()
  return loadPromise
}

// Synchronous cached read for render-time gates. Returns DEFAULT_FLAGS until
// loadFlags resolves, so a surface that reads before flags load now defaults ON.
export function getFlagsSync(): Flags {
  return cached
}

// Test seam: reset the module cache so each test starts from DEFAULT_FLAGS.
export function __resetFlagsForTest(next: Flags = DEFAULT_FLAGS): void {
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
