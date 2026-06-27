# spec-05 — Rollout flags, holdout cohort & kill switches (cross-cutting ops)

**Status:** Planned
**Phase:** Phase 2 (cross-cutting — gates every net-new aggressive surface)
**Depends-on:** **spec-04** (efficacy measurement — owns the *reading* contract over the analytics `cohort` dimension and treats `'holdout'` as its control arm). There is **one** rollout-cohort enum, `'treatment' | 'holdout'` (README §4.5): this spec owns the cohort *assignment* (persists `userDoc.rolloutCohort` and stamps that same value directly onto the analytics `cohort` dimension — no mapping/translation — see §3c/§3d). Soft-consumes the §4 `isQuantIntensity` chokepoint helper (`src/auth/track.ts`) and the Function-owned write path in `functions/src/review.ts` (spec-01). It does not require spec-10/11/20/21/22 to compile — it gates them, so it ships their flags as **default-off** even before they land.
**Implements:** Decision **D17** (rollout posture: runtime flag + holdout cohort + per-feature kill switch); foolproofing **R14** (no flag/remote-config/kill-switch infra exists today); README **§4.6** delete-path (this spec **owns** the Function-driven cascade-delete).

> Read README §1 (corrected premises), §3 **D17**, §3 **D14** (no scheduled Function — mirrors the kill-switch posture), §4 shared helper (`isQuantIntensity` chokepoint), §4.6 (privacy delete-path — owned here), §8 **R14**, and the §10 template before coding. This spec defines machinery that **does not exist today** (verified: 0 hits for `remoteConfig`/`featureFlag`/`killSwitch`/`holdout`/`cohort` across `src` + `functions/src`).

---

## 1. Goal & non-goals

**Goal.** Build the rollout/holdout/kill machinery that gates every net-new aggressive runtime behavior so it does **not** ship ON the moment it merges (R14). Concretely: (1) one **flag mechanism** read at startup and cached; (2) **per-feature flags** for the four net-new behaviors (SR Daily Review queue, async gold-mint, difficulty governor, brutal-mock tier floor); (3) a deterministic **holdout-cohort assignment** that spec-04 reads as its control-vs-treatment split; (4) a **per-feature kill switch** with explicit, measurable rollback criteria; (5) integration through the **single `isQuantIntensity` chokepoint** + the existing queue-mount checks — no scattered gates; (6) the **Function-driven recursive cascade-delete** path for the privacy delete requirement (README §4.6).

**Non-goals.** No A/B *analysis* (that is spec-04 — this spec only assigns and persists the cohort spec-04 reads). No new aggressive *behavior* (each behavior is owned by its own spec; this spec only gates them). No push/email re-engagement channel (explicit future work per D14). No admin UI for flipping flags in v1 — flags are flipped via the chosen backend's console (Firebase Remote Config console / a Firestore doc edit) and the spec defines the **values + read contract**, not a bespoke dashboard. No scheduled Cloud Function (D14 posture preserved; the cascade-delete is a **callable**, triggered on user request, not a cron).

---

## 2. Current reality (verified, file:line)

- **No flag/remote-config/kill-switch infra exists.** `grep -rniE "remoteConfig|featureFlag|killSwitch|holdout|cohort" src functions/src` → **0 hits** (R14). Net-new aggressive features otherwise ship ON once merged.
- **`firebase` client SDK is already a dependency** (`package.json:32`, `"firebase": "^12.15.0"`) — it bundles `firebase/remote-config`. No new dependency is needed for the Remote Config option.
- **App Check is the precedent for "init a Firebase client service early, skip in emulator."** `src/firebase/app.ts` initializes App Check immediately after `initializeApp`, gated on `usingEmulators = import.meta.env.VITE_USE_EMULATORS === 'true'` (`src/firebase/app.ts:34` + the App Check block). Firestore/Functions are loaded on-demand via `getDb()`/`getFns()` (`src/firebase/app.ts:88-108`). Remote Config should follow the same on-demand + emulator-skip pattern.
- **The single chokepoint already exists in the plan.** `isQuantIntensity(userDoc, conceptProgress?)` in `src/auth/track.ts` (README §4 helper; created alongside spec-13) is the one predicate every aggressive surface imports. This spec **extends** that chokepoint to also consult flag + cohort — it does **not** add a second gate.
- **Server-side kill switches for Function-owned writes have a home.** `functions/src/review.ts` (NEW, owned by spec-01; holds `submitReview` + `writeCardsForCompletion`; spec-11 adds the gold-mint branch). The async gold-mint kill switch lives here because gold-mint is a Function-owned write (rules deny client writes to progression — README §4 Foundation A, R4).
- **Functions runtime.** `functions/src/index.ts:24-28` — `initializeApp()`, `setGlobalOptions({region:'us-central1', maxInstances:10})`, `db = getFirestore()`. `firebase-admin` `^13.10.0` + `firebase-functions` `^7.2.5` (`functions/package.json:17-18`). Callables are re-exported from `index.ts` (e.g. interview callables at `:283`).
- **Privacy delete-path is blocked client-side today.** `firestore.rules` hard-denies `delete` on the user profile (`firestore.rules:63`, `allow delete: if false`) and on `snapshots` (`:91`); progression subcollections (`milestones`/`streaks`/`interviews*`) are `allow write: if false` (`:96-116`). A client `delete` therefore **cannot cascade** — the delete must be Function-driven (Admin SDK bypasses rules). README §4.6 assigns this path to **this spec**.
- **New personal data to delete** (README §4.6, enumerated): `userDoc.targetInterviewDate` (spec-01); `users/{uid}/reviews/{cardId}` subcollection (spec-01/10); `users/{uid}/calibration/summary` (spec-12); per-attempt `calibration` block on `interviews/{attemptId}` (spec-12); per-turn `confidence` on the interview transcript (spec-02); the new cohort/flag-override field this spec adds (below).

---

## 3. Design

### 3a. Flag mechanism — recommendation: **Firebase Remote Config** (client) + a **server-mirror Firestore doc** for Function-owned switches

Two candidates were considered; the plan picks **Remote Config for client-read flags + a single `config/flags` Firestore doc for server-read kill switches**, for these reasons:

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **A. Firebase Remote Config** | Already on Firebase (no new dep — `firebase@^12` bundles `firebase/remote-config`); console-flippable with **no deploy**; built-in client caching + `fetchTimeMillis`; supports percentage rollout conditions natively; mirrors the App Check "init early, skip in emulator" pattern. | Not readable from a Cloud Function without the Admin Remote Config API (extra call, no realtime push server-side); console is the only editor. | **Chosen for client-read flags** (Daily Review queue mount, governor, brutal-mock floor surfacing). |
| **B. A `config/flags` Firestore doc read at startup** | Readable from **both** client and Function (Admin SDK) with one mechanism; trivially editable; testable with the rules emulator. | Costs a doc read per session (cheap, cached); percentage rollout must be computed in code, not by the backend. | **Chosen for the server-side kill switches** (async gold-mint in `functions/src/review.ts`) — a Function cannot cheaply read Remote Config, and the gold-mint kill must be server-authoritative. |

**Rationale for the split (not "pick exactly one"):** the task asks to recommend one; the honest recommendation is **Remote Config as the primary client mechanism** because it is zero-dep, deploy-free, and already idiomatic here (App Check) — *and* a tiny `config/flags` Firestore doc is the minimal addition needed so **Function-owned writes** (gold-mint) can be killed server-side without a redeploy. The two are kept in sync by treating Remote Config as the source of truth for client gates and the Firestore doc as the source of truth for server gates; **a flag that gates both a client surface and a server write (gold-mint) is declared in both and the spec's DoD asserts the two agree** (test below). If a future maintainer wants strictly one mechanism, the fallback is **Option B alone** (Firestore doc read on both sides), accepting the per-session read and in-code rollout math — recorded here so the decision is reversible behind the same `flags.ts` seam.

**Read contract (frozen).** All flag reads go through one pure-ish module so no surface reads Remote Config or the Firestore doc directly:

- `src/config/flags.ts` (NEW, client): `loadFlags(): Promise<Flags>` — fetches + activates Remote Config (or reads `config/flags` in the fallback), parses against `FlagsSchema` (zod), caches in-memory for the session, and **fails CLOSED to all-off defaults** on any error (R14 corollary: a flag that cannot be read must behave as if the feature is off, never on). `getFlagsSync(): Flags` returns the cached value (defaults until `loadFlags` resolves).
- `functions/src/flags.ts` (NEW, server): `loadServerFlags(): Promise<ServerFlags>` — reads the `config/flags` Firestore doc via Admin SDK, parses, caches per-instance with a short TTL (e.g. 60 s so a kill flip propagates within a minute without a deploy), **fails CLOSED**.

```ts
// src/config/flags.ts (client) — shapes frozen here; do not redefine per-surface.
export const FlagsSchema = z.object({
  dailyReviewQueue:  z.boolean().default(false), // spec-20 surface mount
  difficultyGovernor:z.boolean().default(false), // spec-21
  brutalMockFloor:   z.boolean().default(false), // spec-22 tier floor (not the rubric bug fix — see §6)
  // async gold-mint is ALSO mirrored server-side (config/flags.goldMint) — declared here for the client tooltip copy only.
  goldMint:          z.boolean().default(false), // spec-11
  rolloutPercent:    z.number().min(0).max(100).default(0), // staged % for cohort assignment (§3c)
}).strip()
export type Flags = z.infer<typeof FlagsSchema>
export const ALL_OFF: Flags = FlagsSchema.parse({}) // every feature default-off
```

### 3b. Which net-new behaviors are flag-gated (D17)

Exactly the four net-new aggressive behaviors named in D17, each behind its own flag so one can roll back without the others:

| Behavior | Owner spec | Flag | Gate location (single chokepoint) | Kill effect |
|---|---|---|---|---|
| **SR Daily Review queue** (hero + interleaved label-stripped surface) | spec-20 | `dailyReviewQueue` | the queue-mount check in `src/pages/studyDesk.model.ts` / `CourseJourney.tsx` (the live `recommendedAction` entry, README §5) | hero hidden; catalog/home behave as today |
| **Async gold-mint** (delayed-success gold) | spec-11 | `goldMint` (server-mirrored in `config/flags`) | the gold-mint branch in `functions/src/review.ts` | silver still mints instantly (spec-11 stage); gold simply never mints — no error surfaced |
| **Difficulty governor** (rolling-success scaffolding nudge) | spec-21 | `difficultyGovernor` | the governor knobs in `LessonPlayer.tsx` (§5) — read through `isQuantIntensity` | scaffolding stays static (Track-A behavior) for everyone |
| **Brutal-mock tier floor** (Track-B `brutal` default) | spec-22 | `brutalMockFloor` | the `tierFloor`-by-gate selection in `functions/src/interview.ts` | floor falls back to `hard` for everyone (the pre-plan default) |

**Note (do not over-gate):** the **tier-aware rubric scaling** in spec-22 is a *correctness bug fix for all tracks* (Decision 9), **not** an aggressive behavior — it is **NOT** flag-gated (it would be wrong to ship the deflated-score bug behind a flag). Only the *brutal tier floor* is gated. Likewise the calibration *computation* (spec-12) is not gated; only surfaces that change the learner's path are.

### 3c. Holdout-cohort assignment (the split spec-04 reads)

spec-04 needs a stable control-vs-treatment partition to measure efficacy. There is **one** rollout-cohort enum, `'treatment' | 'holdout'` (README §4.5, single source of truth): this spec **assigns** it; spec-04 **reads** it as its `cohort` dimension and treats `'holdout'` as its control arm. The persisted assignment value and the analytics-dimension value are the **same** two literals — stamped directly, no translation (see §3d).

- **Field (frozen):** `userDoc.rolloutCohort?: 'treatment' | 'holdout'` on `src/auth/userDoc.ts` (added to `UserDocSchema` + the rules update whitelist — see §7). This persisted value **is** the analytics `cohort` dimension value — spec-05 stamps it onto the dimension verbatim (§3d). Assigned **once**, then immutable for that user (so a user never flips holdout↔treatment mid-study, which would poison spec-04's measurement).
- **Assignment (deterministic, server-anchored):** a pure helper `assignCohort(uid: string, rolloutPercent: number): 'treatment' | 'holdout'` in `src/config/flags.ts` — hashes the `uid` to a stable bucket in `[0,100)` and returns `treatment` iff `bucket < rolloutPercent`, else `holdout`. Deterministic in `uid` so the same user always lands in the same bucket as `rolloutPercent` ramps; **monotonic** so raising `rolloutPercent` only ever *adds* users to treatment (never removes — `bucket < p1 ⇒ bucket < p2` for `p2 > p1`). This makes a staged 0→5→25→100 ramp safe.
- **Persistence:** assigned the first time `loadFlags` resolves for a signed-in user with no `rolloutCohort` yet, written client-side (it is a non-progression field; client-writable per the whitelist). Because the bucket is deterministic, a lost write self-heals to the same value on next load.
- **Interaction with flags:** a `holdout` user gets **none** of the four gated behaviors regardless of per-feature flag state (holdout is the control). A `treatment` user gets a behavior iff *its* flag is on. This is enforced once, in the chokepoint (§3d), so it cannot drift per-surface.

> **Dependency on spec-04 (explicit — one enum, one source of truth).** There is a **single** rollout-cohort enum, `'treatment' | 'holdout'` (README §4.5), used identically by both specs: (a) the **persisted assignment field** `userDoc.rolloutCohort` uses `'treatment' | 'holdout'` (this spec owns assignment, and "holdout" names the *withheld-from-rollout* control arm precisely); (b) the **analytics `cohort` dimension** that spec-04's measurement module reads (spec-04 §3.2/§3.4: `ReviewRow.cohort`, `abDelta`, the `treatment − holdout` delta) uses those **same** two literals, and spec-04 treats `cohort === 'holdout'` as its control arm. There is **no `'control'` literal** anywhere and **no map/translation**: this spec stamps the persisted value directly onto the dimension (§3d), so spec-04's between-cohort delta filters on `cohort === 'holdout'` and matches spec-05-stamped data by construction. spec-04's module is untouched; both specs use the exact same literals. If spec-04 ever needs a finer split (e.g. multi-arm), it amends the shared enum and this spec's `assignCohort` widens together — coordinate via README §4.5 before either ships.

### 3d. Integration — extend the ONE chokepoint, do not scatter gates (R-no-scatter)

The aggressive path is already funneled through `isQuantIntensity` (README §4 helper). This spec adds a thin wrapper so flag + cohort are consulted in the **same** place, reusing the single chokepoint:

```ts
// src/auth/track.ts — extend the existing chokepoint (do NOT add a parallel gate elsewhere).
// isQuantIntensity stays as-is (track/learningGoal). gatedOn() layers flag + cohort on top,
// per-feature, so every aggressive surface asks ONE question.
export type GatedFeature = 'dailyReviewQueue' | 'difficultyGovernor' | 'brutalMockFloor' | 'goldMint'

export function gatedOn(
  feature: GatedFeature,
  userDoc: UserDoc | null,
  flags: Flags,
  conceptProgress?: ConceptProgress,
): boolean {
  if (userDoc?.rolloutCohort === 'holdout') return false   // control cohort: never gets aggressive behavior
  if (!flags[feature]) return false                         // per-feature flag off (or fail-closed default)
  return isQuantIntensity(userDoc, conceptProgress)         // existing intensity predicate unchanged
}
```

Every aggressive surface (spec-20 queue mount, spec-21 governor, spec-22 floor) calls `gatedOn('<feature>', userDoc, flags, progress)` **instead of** calling `isQuantIntensity` directly. The server gold-mint branch (`functions/src/review.ts`) calls the server twin `serverGatedOn('goldMint', uid, serverFlags)` (reads `config/flags.goldMint` + the user's persisted `rolloutCohort`). No surface reads a flag or cohort field directly — they go through `gatedOn`/`serverGatedOn`. This is the "reuse the single chokepoint" requirement; a code-review item in the DoD asserts no other file references a flag field name.

**Stamp the cohort directly onto the analytics dimension (no translation).** spec-04 defines the analytics `cohort` dimension over the **same** enum this spec assigns — `'treatment' | 'holdout'` — and exposes the setter `setAnalyticsDimensions({ cohort })` (spec-04 §3.2 Step 1). Because both sides use one enum, the persisted value is stamped onto the dimension **verbatim**, with no map:

This spec calls `setAnalyticsDimensions({ cohort: userDoc.rolloutCohort })` once per session after `loadFlags` resolves the user's cohort (spec-04 §3 Step 6 defers the live `cohort` wiring to this spec). If `rolloutCohort` is absent (assignment not yet written), `cohort` is left unset so spec-04's fail-absent rule excludes the learner (spec-04 §3.4) rather than mislabeling them.

### 3e. Kill switches + rollback criteria (D17)

Each flag doubles as a kill switch: flipping it off in Remote Config / the `config/flags` doc disables the feature within one session (client) or one TTL (≤60 s, server) **with no deploy**. Per-feature, measurable rollback criteria (the numbers are **placeholders — re-tuned by spec-04** against real data, mirroring D4/D9's untuned posture):

| Feature | Flip OFF when (rollback criterion) | Signal source |
|---|---|---|
| `goldMint` | gold-mint write **error-rate > 1%** over a rolling 1 h window, OR any gold minted for a server-graded `fail` (R13 violation — should be impossible, but is a hard kill) | Function logs / spec-04 instrumentation on `functions/src/review.ts` |
| `dailyReviewQueue` | queue build throws for **> 0.5%** of mounts, OR median queue size is 0 for treatment users (foundations not populated — R5) | client analytics (`src/analytics/events.ts`) |
| `difficultyGovernor` | rolling-success of treatment cohort drops **> 10 pts below** holdout over a week (governor is hurting, not helping) | spec-04 cohort comparison |
| `brutalMockFloor` | interview completion-rate for treatment **> 15 pts below** holdout (brutal is driving abandonment) | spec-04 cohort comparison |

Rollback is **flip-the-flag**, not revert-the-merge — that is the entire point of D17/R14. After a kill, the owning spec's team fixes forward and re-ramps `rolloutPercent` from a low value. The kill criteria live in this spec; the *measurement* that evaluates them is spec-04 (the dependency edge).

### 3f. Privacy delete-path — Function-driven recursive cascade-delete (README §4.6 — owned here)

Because `firestore.rules` hard-denies client `delete` (`:63`, `:91`, `:96-116`), the learner-initiated delete is a **callable** (Admin SDK bypasses rules; no scheduled Function — D14 posture preserved):

- **`deleteLearningData` callable** in `functions/src/privacy.ts` (NEW; re-exported from `functions/src/index.ts` like the interview callables at `:283`). Auth-required (`requireUid`, mirroring `functions/src/index.ts:60`); operates **only on the caller's own `uid`** (never accepts a target uid — a user can only delete their own data).
- **What it deletes (the §4.6 enumeration):**
  1. `users/{uid}/reviews/*` subcollection (recursive, batched) — spec-01/10.
  2. `users/{uid}/calibration/*` subcollection (`summary` doc) — spec-12.
  3. per-attempt `calibration` block on each `users/{uid}/interviews/{attemptId}` — spec-12 (field-clear, not doc-delete, unless the user also requests full interview deletion).
  4. per-turn `confidence` on interview transcripts — spec-02 (field-clear within the transcript).
  5. userDoc fields added by this plan: `targetInterviewDate` (spec-01), `rolloutCohort` (this spec) — `FieldValue.delete()` on those keys, leaving the account intact.
- **Recursive batched delete:** use the Admin SDK recursive delete (`db.recursiveDelete(ref)`) for the `reviews`/`calibration` subcollections; field-clears via batched `update`. Idempotent: deleting already-deleted data is a no-op success (so a retried call is safe).
- **Audio is never stored** (README §4.6) — there is no audio to delete; transcripts hold spoken-answer TEXT only.
- **Scope note:** this callable deletes the *learning-science* data this plan added. Full-account deletion (auth user + all docs) is an existing/separate concern and is **out of scope** here — this spec explicitly owns only the §4.6 enumeration so the path is not orphaned, and says so rather than silently widening.

---

## 4. Two-track behavior

- **Track A (gentle default):** `isQuantIntensity` returns false, so `gatedOn` returns false for every aggressive feature regardless of flags — Track-A learners are unaffected by any rollout. The Daily Review queue mount (spec-20) is the one nuance: spec-20 may surface a gentle hero to Track-A; if so, that gentle variant is gated on `dailyReviewQueue` **alone** (not `gatedOn`), and the spec must state which. By default this spec treats all four flags as gating the **aggressive** variant only.
- **Quant-intensity gate (Track B `OR` `learningGoal==='interview'`):** receives a gated behavior iff (cohort is `treatment`) **AND** (the per-feature flag is on) **AND** `isQuantIntensity` is true — all three checked in `gatedOn`. `holdout` quant learners are the control: they get the *current* (pre-plan) experience and are the baseline spec-04 measures against.
- The cascade-delete (§3f) is **track-independent** — every user can delete their data.

---

## 5. Step-by-step implementation

1. **`src/config/flags.ts` (NEW)** — define `FlagsSchema`/`Flags`/`ALL_OFF`, `loadFlags()` (Remote Config fetch+activate, emulator-skip mirroring `src/firebase/app.ts` App Check, parse, cache, **fail-closed to `ALL_OFF`**), `getFlagsSync()`, and `assignCohort(uid, rolloutPercent)` (pure, deterministic hash → `treatment|holdout`). → **verify:** unit test `assignCohort` is deterministic in `uid` and monotonic in `rolloutPercent`; `loadFlags` returns `ALL_OFF` when the backend throws (mock reject).
2. **`functions/src/flags.ts` (NEW)** — `loadServerFlags()` reads `config/flags` doc (Admin SDK), parses against the server `ServerFlagsSchema` (mirror of the client shape, byte-for-byte field names), caches per-instance with ≤60 s TTL, **fails-closed**. `serverGatedOn(feature, uid, serverFlags)` reads the user's persisted `rolloutCohort` + the flag. → **verify:** unit test fail-closed; parity test that client `FlagsSchema` keys == server `ServerFlagsSchema` keys (catches drift).
3. **`src/auth/track.ts`** — add `GatedFeature` type + `gatedOn(feature, userDoc, flags, conceptProgress?)` wrapping the existing `isQuantIntensity` (do **not** modify `isQuantIntensity` itself). → **verify:** unit table-test the truth matrix (holdout always false; flag-off always false; treatment+flag-on follows `isQuantIntensity`).
4. **`src/auth/userDoc.ts`** — add `rolloutCohort?: 'treatment'|'holdout'` to `UserDoc` + `UserDocSchema`; assign-once on first `loadFlags` for a signed-in user with no cohort. → **verify:** unit test assign-once (a second `loadFlags` does not overwrite an existing cohort); fixture-validate the schema.
5. **`config/flags` Firestore doc seed** — document the doc shape (`{ goldMint:false, rolloutPercent:0, … }`) and that it is Admin-seeded (like courses/lessons — never client-written). Add a `config/{doc}` rules block: owner-less **public read** for signed-in users (so the client *could* fall back to Option B) but **client write denied** (`allow read: if request.auth != null; allow write: if false;` — mirrors `courses` at `firestore.rules:31-32`). → **verify:** rules test that a client write to `config/flags` is denied and read is allowed.
6. **`functions/src/privacy.ts` (NEW)** — `deleteLearningData` callable (§3f): `requireUid`, recursive-delete `reviews`+`calibration`, field-clear interview `calibration`/transcript `confidence`, `FieldValue.delete()` userDoc fields; idempotent. Re-export from `functions/src/index.ts`. → **verify:** emulator test that after the call, `reviews`/`calibration` are empty, the userDoc fields are gone, the account+interview docs still exist, and a second call succeeds (idempotent).
7. **Wire the chokepoint into the four surfaces** (each owned by its spec; this spec provides `gatedOn`/`serverGatedOn` and a short integration note each spec links to): spec-20 queue mount → `gatedOn('dailyReviewQueue', …)`; spec-21 governor → `gatedOn('difficultyGovernor', …)`; spec-22 floor → `gatedOn('brutalMockFloor', …)`; spec-11 gold-mint branch → `serverGatedOn('goldMint', uid, serverFlags)`. → **verify:** grep shows no surface references a raw flag/cohort field name (only `gatedOn`/`serverGatedOn`); each surface defaults OFF when flags fail-closed.
8. **Wire the analytics `cohort` dimension** (`src/analytics/events.ts`; spec-04 defers the live `cohort` wiring to this spec, spec-04 §3 Step 6) — once `loadFlags` has resolved the user's `rolloutCohort`, stamp it directly onto the dimension: call `setAnalyticsDimensions({ cohort: rolloutCohort })` **once per session** (not per event), no translation. Leave `cohort` unset when `rolloutCohort` is absent (fail-absent — spec-04 §3.4 excludes the learner). → **verify:** with a `holdout` user the dimension is `'holdout'`; the setter is called once per session (not per event); the existing track-context setter for `track` is untouched.
9. **Document the kill runbook** in this spec (§3e table) — which flag to flip, where (Remote Config console / `config/flags` doc), and the rollback criterion. → **verify:** the four rollback criteria are each tied to a named signal source (spec-04 instrumentation or `src/analytics/events.ts`).

---

## 6. Data / schema changes (deltas only — shared shapes live in README §4/§4.5)

- **`userDoc.rolloutCohort?: 'treatment'|'holdout'`** on `src/auth/userDoc.ts` (`UserDoc` + `UserDocSchema`) — client-writable, assign-once. The canonical **Rollout-cohort-enum row in README §4.5 already exists** (single enum `'treatment'|'holdout'`, no map): this spec **conforms to / cites** that row, it does not add a conflicting one. The same persisted literal is the analytics `cohort` dimension value (spec-04 reads it, control arm = `'holdout'`), stamped directly — no translation.
- **`config/flags` Firestore doc** — `{ dailyReviewQueue, difficultyGovernor, brutalMockFloor, goldMint, rolloutPercent }`, Admin-seeded, client-read-only (new `config/{doc}` rules block).
- **No change** to any §4 shared contract field (cards, snapshot, schema). The four feature flags are *additive ops infra*; they gate behavior, not data shape.
- **README §4.6 delete-path:** mark it **OWNED by spec-05** (it currently says "Owner: `spec-05`" — this spec fulfills it). The enumeration in §3f matches §4.6 exactly.

---

## 7. Firestore rules deltas

- Add `rolloutCohort` to the `users/{uid}` update whitelist (`firestore.rules:54-61`) — it is a non-progression, client-writable field (like `defaultTrack`).
- Add a `config/{doc}` block: `allow read: if request.auth != null; allow write: if false;` (mirrors `courses` at `:31-32`).
- **No change** to the delete denies (`:63`, `:91`, `:96-116`) — the cascade-delete is Admin-SDK driven and intentionally bypasses them; client delete stays denied (that is *why* the callable exists, R4/§4.6).

---

## 8. Tests

- **Unit (vitest):**
  - `assignCohort` deterministic in `uid`, monotonic in `rolloutPercent` (raising % never moves a user out of treatment), boundary `rolloutPercent=0` → all holdout, `=100` → all treatment.
  - `loadFlags`/`loadServerFlags` **fail-closed** to `ALL_OFF` on backend error.
  - cohort dimension stamping: a `holdout` user's `cohort` dimension is `'holdout'` (stamped directly, no translation); `cohort` is left unset when `rolloutCohort` is absent (fail-absent — spec-04 §3.4 excludes the learner, matching spec-04's `cohort==='holdout'` control filter).
  - `gatedOn` truth matrix: holdout ⇒ false; flag-off ⇒ false; treatment+flag-on ⇒ equals `isQuantIntensity`.
  - client `FlagsSchema` keys ≡ server `ServerFlagsSchema` keys (drift guard).
  - assign-once: a user with an existing `rolloutCohort` is not reassigned even if `rolloutPercent` changes.
- **Rules tests (`tests/firestore.rules.test.ts`, `npm run test:rules`):** client write to `config/flags` denied; client read allowed; client write to `userDoc.rolloutCohort` allowed (in whitelist); client `delete` on userDoc still denied.
- **Emulator / Function test:** `deleteLearningData` empties `reviews`+`calibration`, field-clears interview `calibration`/transcript `confidence`, removes userDoc `targetInterviewDate`/`rolloutCohort`, leaves account + interview docs intact, and is **idempotent** (second call succeeds, no-op).
- **`/dev` manual check:** with all flags `false` (default), the home, lesson player, and interview behave exactly as today (no queue hero, static scaffolding, `hard` floor, no gold-mint). Flip `dailyReviewQueue=true` + put the test user in `treatment` + `learningGoal:'interview'` → the queue hero appears; flip back → it disappears within one session. (Use `/dev/*` routes per `AGENTS.md`; no Firebase/Java needed for the UI-only checks — mock `getFlagsSync`.)
- **`tsx scripts/validate-fixtures.ts`** passes (no fixture shape change, but `UserDocSchema` parse of seed data must hold).

---

## 9. Foolproofing (which §8 items apply and how)

- **R14 (no flag/kill infra exists) — the core mandate.** This spec *is* the R14 fix: it builds the staged-rollout/holdout/kill machinery so net-new aggressive features ship **default-off** behind a flag, not ON-on-merge. Every gated feature's flag defaults `false` (`ALL_OFF`), and reads **fail closed**, so a misconfigured or unreachable backend cannot accidentally ship a feature ON.
- **R4 (progression writes route through a Function; rules deny client writes).** The `goldMint` kill is server-authoritative in `functions/src/review.ts`; the cascade-delete is Admin-SDK driven because rules deny client delete. No progression field is gated client-side only.
- **R5 (missing foundations silently degrade).** The `dailyReviewQueue` rollback criterion explicitly trips when treatment median queue size is 0 (foundations unpopulated) — a kill switch that catches the exact R5 failure mode rather than shipping an empty queue.
- **R13 (review pass/fail must be server-graded).** The `goldMint` hard-kill criterion includes "any gold minted for a server-graded `fail`" — a flag-level backstop reinforcing that gold never mints off a client-asserted result.
- **No-scatter (D17 chokepoint).** All gating funnels through `gatedOn`/`serverGatedOn` extending the single `isQuantIntensity` chokepoint; a DoD code-review item asserts no surface reads a raw flag/cohort field, so gates cannot drift apart per-surface.
- **D14 posture preserved.** The cascade-delete is a **callable** (user-triggered), not a scheduled Function — this spec adds no cron, consistent with "no scheduled Cloud Function in v1."

---

## 10. Definition of Done

- All unit tests above green (`./node_modules/.bin/vitest run`), including the `gatedOn` truth matrix, `assignCohort` determinism/monotonicity, direct cohort-dimension stamping (`holdout` user's `cohort` dimension is `'holdout'`; unset when absent), fail-closed defaults, schema-parity, and assign-once.
- Rules tests green (`npm run test:rules`): `config/flags` client-write denied + read allowed; `rolloutCohort` write allowed; userDoc client `delete` still denied.
- `deleteLearningData` emulator test green, including the **idempotency** re-call.
- `tsx scripts/validate-fixtures.ts` green; `./node_modules/.bin/eslint .` clean on touched files.
- Code-review check: **no surface file references a raw flag or cohort field name** — every gate goes through `gatedOn`/`serverGatedOn` (the single chokepoint).
- `/dev` manual verification: default all-off ⇒ today's behavior unchanged; flipping `dailyReviewQueue` on for a `treatment` + interview user shows/hides the hero within one session.
- README §4.5: **conform to / cite the existing canonical Rollout-cohort-enum row** — single enum `'treatment'|'holdout'` (spec-05 assigns, spec-04 reads with control arm = `'holdout'`), stamped directly onto the analytics `cohort` dimension with no map. Do **not** add a conflicting row or any `'control'` literal (the row already exists and is canonical; spec-04's `efficacy.ts` literals are untouched). Confirm §4.6 delete-path now reads **OWNED & specified by spec-05** (not orphaned).
- The four kill-switch rollback criteria (§3e) are each tied to a named, measurable signal owned by spec-04 or `src/analytics/events.ts`; the numeric thresholds are flagged **UNTUNED — re-tuned by spec-04**.
