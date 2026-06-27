# spec-21 — Light bounded difficulty governor (+ generalize the capped-beat assist)

- **Status:** Planned
- **Phase:** 2 (Surfaces)
- **Depends-on:** spec-03 (`isRetrievalRep` classifier + `analytics.retrievalRep`). Soft-reads spec-00 `schemaId` only via context (never required).
- **Implements:** brainlift app-action **#4** (desirable-difficulty governor); Decision **D9** (light bounded auto-governor, Track A static; the assist generalization); SPOV3 (struggling learner is never dead-ended); foolproofing **R6**.

> Links back to [`README.md`](README.md). The §4 shared contracts are authoritative; this spec references them by
> name and does **not** redefine or rename them. The one new shared field this spec introduces (`snapshot`
> `repWindow`) is flagged for the consistency gate in §7.

---

## 1. Goal & non-goals

**Goal.** Two coupled deliverables:

1. **The governor.** A *light, bounded* difficulty auto-governor for the **quant-intensity gate** (the shared
   `isQuantIntensity(userDoc, conceptProgress?)` predicate — README §4). It keeps a **rolling success window computed over retrieval reps only**
   (`isRetrievalRep`, spec-03) and nudges two knobs toward a desirable-difficulty target band of **~50–70%**:
   *fade density* (whether Track-A-style faded scaffolds are offered) and *hint availability* (the per-beat hint cap).
   `>85%` recent success ⇒ make it harder (drop scaffolds, tighten the cap); `<50%` ⇒ make it easier (offer the
   faded rung, restore the cap). The nudge is **bounded by a hard floor/ceiling** so it can never spiral past the
   point where a learner is dead-ended or trivially coasting.

2. **Generalize the capped-beat assist (R6 — the central correctness requirement).** Today the *no-dead-end* escape
   hatch is the runtime **`hintCapOverride`** (lifts the hint cap so the level-3 answer reveal is always reachable) —
   already threaded into nearly every graded beat — plus the equation-specific **`assist.prefillToLastTerm`** on
   `EquationTilesBeat`. This spec **closes the one remaining gap** (`OverlapBeat` ignores `hintCapOverride`) and adds
   a **lint/test guard** so *every* capped graded beat honors the override forever. The governor must never be able to
   strand a learner: when it tightens the cap, the existing struggle-driven cap-lift still fires.

**Non-goals.**
- **Track A stays completely static** (D9/D2). No governor math runs for Track A; no Track-A experience changes.
- **No new SR/queue code.** The governor consumes whatever review-vs-lesson context the queue (`spec-10`) supplies;
  it does not build the queue. Before `spec-10` ships, the rep window is fed by in-lesson `masteryChallenge` reps and
  is simply sparser — the governor degrades gracefully (§3.4).
- **No server writes / no scheduling.** The rep window persists in the existing client-written `snapshot`
  (`interactionState` is `.loose()`); the governor reads server-agnostic counts only. No Function, no Firestore rule,
  no index. (SR scheduling state remains Function-owned per spec-01 — untouched here.)
- **No change to `GRADED_BEAT_TYPES`, mastery semantics, or the streak.** R2/R9 preserved.
- This spec does **not** redefine fade behavior itself — it only chooses *whether* the existing `density:'split'` faded
  rung and the hint cap are offered, per learner, within bounds.

---

## 2. Current reality (verified against the code)

| Claim | Evidence |
|---|---|
| `density` is resolved per-beat by track in the LessonPlayer: `beat.density ?? (track === 'A' ? 'split' : 'merged')`. Track B is `'merged'` (no faded scaffolds). | `src/lesson/LessonPlayer.tsx:148`. `density` prop typed `'split' \| 'merged'` in `src/lesson/beats/types.ts:32`. |
| The faded rung (the desirable-difficulty scaffold) only renders on `density === 'split'` (`const split = props.density === 'split'`) and `row.faded`. | `src/lesson/beats/EquationTilesBeat.tsx:338,342`. |
| The per-beat hint cap is `props.hintCapOverride ?? beat.maxHintLevel`, read by `useHintLadder` each render (no remount needed to honor a lifted cap). | `src/lesson/feedback.ts:74` (`const max = opts.maxHintLevel ?? 3`), `:121` (`Math.min(state.level + 1, max)`); `beat.maxHintLevel` is `1\|2\|3` optional (`src/content/schema.ts:613`). |
| **`hintCapOverride` is ALREADY threaded into nearly every graded beat** — the brief's "only EquationTiles" premise (R6 as written) is **false**. | `props.hintCapOverride ?? beat.maxHintLevel` appears in `AnswerEntryBeat.tsx:20`, `BayesUpdateBeat.tsx:370`, `ChainBoardBeat.tsx:81,389,602,759,916`, `CountingTreeBeat.tsx:89`, `EquationTilesBeat.tsx:459`, `HandRankerBeat.tsx:69`, `MasteryChallengeBeat.tsx:21`, `RetrievalGridBeat.tsx:111`, `ProbabilityCounterBeat.tsx:52`, `SelectionGridBeat.tsx:34`, `StateTapBeat.tsx:31`, `VennCounterBeat.tsx:65`. |
| **The one gap: `OverlapBeat` ignores `hintCapOverride`** (uses bare `beat.maxHintLevel`). If it is ever authored with `maxHintLevel < 3`, a struggling learner dead-ends there. | `src/lesson/beats/OverlapBeat.tsx:32` (`maxHintLevel: beat.maxHintLevel,`). |
| **`assist.prefillToLastTerm` is genuinely EquationTiles-only.** No other beat reads `props.assist`. | `grep "assist" src/lesson/beats/*.tsx` → only `EquationTilesBeat.tsx:472-496`. The LessonPlayer passes `assist` to *all* beats (`LessonPlayer.tsx:551-554`) but only EquationTiles consumes it. |
| The LessonPlayer already **generalizes the cap-lift driver** across all beats: on `onHintLevelChange`, if `beat.maxHintLevel < 3 && level >= cap` it sets `capLiftByBeat[beatId]=true` (→ `hintCapOverride: 3`) and bumps `assistNonceByBeat`. So the no-dead-end driver is *not* equation-specific; only the *assist consumer* is. | `src/lesson/LessonPlayer.tsx:182-208`, `:550-554`. |
| The level-3 hint **reveal is the universal escape**: every graded beat shows the correct answer at the reveal (e.g. `MasteryChallengeBeat` shows `f.accept[0]`; EquationTiles shows `correctFill`). So lifting the cap to 3 is sufficient to un-stick *any* capped graded beat — the equation prefill is an extra affordance, not the guarantee. | `src/lesson/beats/MasteryChallengeBeat.tsx:64` (`revealed ? f.accept[0]`), `EquationTilesBeat.tsx:508`. |
| The quant-intensity gate is the shared helper `isQuantIntensity(userDoc, conceptProgress?)` (README §4). `LessonPage` has both `userDoc` and the per-concept `track`/`progress` in scope to call it, but the gate is **not** currently computed there nor passed to `LessonPlayer`. | `src/auth/track.ts` (`isQuantIntensity`, created by README §4); `src/auth/userDoc.ts:25` (`learningGoal?: 'interview'\|…`), `:29` (`defaultTrack?`); `src/pages/LessonPage.tsx:91` (`effectiveTrack = state.track ?? userDoc?.defaultTrack ?? 'B'`), `:93-103` (no gate prop). `LessonPlayer` props have `track` but no gate flag (`LessonPlayer.tsx:40-65`). |
| `isRetrievalRep(beat, ctx)` + `RetrievalRepContext { source?, role?, schemaId? }` + `analytics.retrievalRep({lessonId,beatId,schemaId?,correct,source})` are spec-03 deliverables (pure, dependency-free). | `docs/learning-science/spec-03-retrieval-rep-taxonomy.md` §3–§4; classifier at `src/lesson/retrievalRep.ts` (created by spec-03). |
| Snapshot `interactionState` is `.loose()`, so an additive client-written field round-trips without a schema bump break. | `src/content/schema.ts:720` (`.loose()`), `hintLevelByBeat`/`maxHintLevelByBeat` precedent at `:711-718`. |
| Pure lesson modules are unit-tested in the node Vitest env (no React/Firebase). | `src/lesson/mastery.test.ts`, `src/lesson/hintLadder.test.ts`, `src/lesson/retrievalRep.test.ts` (spec-03). |

**Discrepancy noted (TRUST THE CODE).** The brief / README R6 say the escape hatch exists *only* on `EquationTilesBeat`.
Reality: the **`hintCapOverride`** half is on ~13 graded beats already; only `OverlapBeat` is missing it, and only the
**`assist` prefill** half is EquationTiles-only. This spec therefore narrows R6 to its real residue (OverlapBeat +
a permanent guard) rather than re-plumbing already-correct beats.

---

## 3. Design

### 3.1 Where the governor lives

A new **pure module** `src/lesson/governor.ts` (dependency-free, node-testable like `mastery.ts`). It owns:

- `RepWindow` — a tiny ring of the last N retrieval-rep outcomes (booleans) + a recent success rate.
- `pushRep(window, correct) → RepWindow` — append, drop oldest past `WINDOW_SIZE`.
- `successRate(window) → number | null` — `null` until `MIN_REPS` reached (don't govern on noise).
- `governorState(window) → GovernorState` — the bounded decision (see §3.3).
- Constants: `WINDOW_SIZE = 8`, `MIN_REPS = 4`, target band `LOWER = 0.50`, `UPPER = 0.70`, plus the
  harder/easier thresholds `EASIER_BELOW = 0.50`, `HARDER_ABOVE = 0.85`. **All untuned — revisit with real
  retention data** (mirror the SM-2 constants caveat in D4).

The governor is driven from `LessonPlayer.tsx`, which already holds the per-beat hint/assist override state and the
`density` resolution — the natural single integration point.

### 3.2 What the governor controls (two bounded knobs)

| Knob | Floor (easiest, can't go below) | Ceiling (hardest, can't go above) | Default when not governing |
|---|---|---|---|
| **fade density** | `'split'` faded rung **offered** (scaffold on) | `'merged'` (no faded scaffold) | quant-gate default `'merged'` |
| **hint availability** | full ladder (cap = 3, reveal reachable) | tightened cap = `beat.maxHintLevel ?? 3` (author's cap) | author's cap |

The governor only ever picks a value **between** these bounds. Concretely it emits:

```ts
export type GovernorState = {
  // Offer the Track-A-style faded rung on capable split-aware beats even on the
  // quant gate (makes a too-hard streak easier). Null window ⇒ false (static default).
  offerFade: boolean
  // Cap delta applied to the hint ladder for the NEXT graded beat:
  //   'tighten' → cap = min(beat.maxHintLevel ?? 3, 2) (harder; reveal still reachable via the
  //               existing struggle cap-lift, so NO dead-end — see R6/§3.5)
  //   'default' → cap = beat.maxHintLevel ?? 3 (author's cap)
  //   'loosen'  → cap = 3 (full ladder; easiest)
  hintCap: 'tighten' | 'default' | 'loosen'
}
```

**Bounding is structural, not arithmetic.** Because the only states are `{offerFade, hintCap∈{tighten,default,loosen}}`
and `tighten` is floored at `2` (never `1`, never `0`), the governor *cannot* remove the reveal path. The reveal is
always reachable (cap≥2 plus the struggle cap-lift to 3), so it literally cannot spiral into a dead-end. This is the
bound D9 requires, expressed as a closed enum rather than an unbounded number that needs clamping.

### 3.3 The decision function (bounded)

```ts
export function governorState(window: RepWindow): GovernorState {
  const rate = successRate(window)
  if (rate === null) return { offerFade: false, hintCap: 'default' } // not enough reps: static
  if (rate > HARDER_ABOVE) return { offerFade: false, hintCap: 'tighten' } // coasting → harder
  if (rate < EASIER_BELOW) return { offerFade: true,  hintCap: 'loosen'  } // struggling → easier
  return { offerFade: false, hintCap: 'default' } // inside 50–70% band: leave it
}
```

One step per evaluation, re-evaluated as each new rep lands — so it tracks toward the band rather than overshooting.
There is deliberately no multi-step ramp: the enum + window already make movement gradual and bounded.

### 3.4 Feeding the window (retrieval reps only)

The window is appended **only** when a graded beat that `isRetrievalRep(beat, ctx)` is submitted (correct or wrong) —
never on ordinary teaching attempts. The `ctx` is what the LessonPlayer knows:
- `source`: `'review'` when the queue (`spec-10`) launched this beat as a spaced-review problem, else `'lesson'`.
  Until `spec-10` lands, the LessonPlayer always passes `'lesson'`, so the only in-lesson reps are
  `masteryChallenge` beats (rep #2 in spec-03). The governor therefore works (more sparsely) pre-`spec-10` and
  automatically densifies once review-surfaced reps flow.
- `role`: `'whichMethodGate'` when `spec-13`'s prediction-based gate is active (also a rep).
- `schemaId`: passed through from `beat.schemaId` when spec-00 has landed (carried, not used in the boolean).

Submission is observed by adding an **`onGradedSubmit({ correct })`-style hook** the LessonPlayer passes down. Rather
than touch all 14 beats, we reuse the signal the LessonPlayer **already** receives: `useHintLadder`'s analytics path
fires `answer_submitted` on every graded submit. We surface the same correct/wrong at the player by adding a thin
optional prop `onGraded?: (correct: boolean) => void` to `BeatProps` and calling it from the **two checkpoint beats
that are reps in lesson flow** — `MasteryChallengeBeat` (always a rep) — plus the queue/which-method surfaces when
they exist. (Plain graded teaching beats are *not* reps, so they must NOT call it; this keeps the window pure per
spec-03 without instrumenting every beat.)

> Surgical choice (AGENTS.md): we instrument only the beats that can be reps today (`masteryChallenge`), not all
> graded beats. `spec-10`/`spec-13` add their own rep call sites when they introduce review/gate surfacing. This
> avoids speculative wiring and keeps the window definitionally equal to "retrieval reps".

### 3.5 Generalizing the assist / no-dead-end (R6)

Two concrete changes make the escape hatch universal and permanent:

1. **Fix `OverlapBeat`** to honor the override: `maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel` (matching
   the 13 other graded beats). This closes the only beat where a tightened/authored cap could strand a learner.

2. **Add a guard test + ESLint rule** asserting every graded-beat view passes `props.hintCapOverride ?? beat.maxHintLevel`
   to `useHintLadder`, so a future capped graded beat cannot regress R6.

The **assist prefill** (`assist.prefillToLastTerm`) stays EquationTiles-specific — it is structurally about equation
rows and has no meaning for type-in/grid beats. The *universal* no-dead-end guarantee is the **cap-lift to the
level-3 reveal**, which already works for every graded beat (the reveal shows the answer). The governor's `tighten`
floors at cap 2, and the struggle cap-lift (`LessonPlayer.tsx:197`) still escalates to 3 — so even when the governor
makes a beat harder, a learner who keeps missing reaches the reveal. The governor and the no-dead-end guarantee are
therefore **independent and non-conflicting**.

### 3.6 Persistence

The rep window persists in the snapshot under a new `interactionState.repWindow` key (booleans + count) so the
governor survives a mid-lesson refresh and (post-`spec-10`) accrues across the session. `interactionState` is
`.loose()`, so this is additive and round-trips with no schema-version break. It is **client-written** (it is not
progression/gold state — it only tunes presentation), consistent with the existing `hintLevelByBeat` precedent.

---

## 4. Step-by-step implementation

> Prereq: spec-03 merged (provides `src/lesson/retrievalRep.ts` + `analytics.retrievalRep`). If absent, STOP and
> build spec-03 first (do not stub it — R5).

### Step 1 — Create the pure governor `src/lesson/governor.ts`

Dependency-free; mirror the `mastery.ts` header/style. Export `RepWindow`, `GovernorState`, the constants,
`pushRep`, `successRate`, `governorState`. Use the §3.1–§3.3 sketches verbatim.

```ts
// Light bounded difficulty governor (README §4 consumers; Decision D9, app-action #4).
// PURE + dependency-free (node Vitest). Quant-intensity gate only; Track A never
// calls this. Counts ONLY retrieval reps (isRetrievalRep, spec-03) into a rolling
// window and nudges fade-density + hint cap toward a 50–70% desirable-difficulty
// band, BOUNDED (closed enum) so it can never strand a learner. Constants UNTUNED.

export const WINDOW_SIZE = 8
export const MIN_REPS = 4
export const EASIER_BELOW = 0.5
export const HARDER_ABOVE = 0.85

export type RepWindow = { results: boolean[] } // most-recent-last, length ≤ WINDOW_SIZE

export const EMPTY_WINDOW: RepWindow = { results: [] }

export function pushRep(w: RepWindow, correct: boolean): RepWindow {
  const results = [...w.results, correct]
  if (results.length > WINDOW_SIZE) results.splice(0, results.length - WINDOW_SIZE)
  return { results }
}

export function successRate(w: RepWindow): number | null {
  if (w.results.length < MIN_REPS) return null
  return w.results.filter(Boolean).length / w.results.length
}

export type GovernorState = {
  offerFade: boolean
  hintCap: 'tighten' | 'default' | 'loosen'
}

export function governorState(w: RepWindow): GovernorState {
  const rate = successRate(w)
  if (rate === null) return { offerFade: false, hintCap: 'default' }
  if (rate > HARDER_ABOVE) return { offerFade: false, hintCap: 'tighten' }
  if (rate < EASIER_BELOW) return { offerFade: true, hintCap: 'loosen' }
  return { offerFade: false, hintCap: 'default' }
}

// Resolve the effective hint cap for a beat given the governor + the author cap,
// FLOORED so the level-3 reveal is always reachable (R6, no dead-end).
export function effectiveHintCap(
  state: GovernorState,
  authorCap: 1 | 2 | 3 | undefined,
): 1 | 2 | 3 {
  const author = authorCap ?? 3
  if (state.hintCap === 'loosen') return 3
  if (state.hintCap === 'tighten') return Math.min(author, 2) as 1 | 2 | 3 // never below 2
  return author
}
```

→ **verify:** `./node_modules/.bin/eslint src/lesson/governor.ts` passes; the file imports nothing.

### Step 2 — Snapshot field `repWindow` (additive, `.loose()`)

Edit `src/content/schema.ts` `SnapshotSchema.interactionState` (the `.loose()` object at `:705-719`): add an optional
`repWindow`, next to `maxHintLevelByBeat`.

```ts
      // Difficulty-governor rolling window (spec-21): the last ≤8 retrieval-rep
      // outcomes (most-recent-last). Client-written presentation tuning only —
      // NOT progression/gold state. Quant-intensity gate only; empty for Track A.
      repWindow: z.array(z.boolean()).optional(),
```

→ **verify:** `tsx scripts/validate-fixtures.ts` passes (additive, optional — no fixture touches it).
→ **verify:** `grep -n repWindow src/content/schema.ts` shows the entry inside the `.loose()` block.

Then thread it through the snapshot read/write helpers in `src/lesson/snapshot.ts` (mirror `maxHintLevelsOf`): add a
`repWindowOf(snapshot): boolean[]` reader and include `repWindow` in the `SnapshotInput`/serialize path so the
LessonPlayer can seed + persist it. Keep the change parallel to the existing `maxHintLevelByBeat` plumbing.

→ **verify:** `grep -n repWindow src/lesson/snapshot.ts` shows reader + write inclusion; `./node_modules/.bin/eslint src/lesson/snapshot.ts` passes.

### Step 3 — Pass the quant-intensity gate into the LessonPlayer

The gate is computed via the **shared** `isQuantIntensity(userDoc, conceptProgress?)` helper (README §4 — single
source so a learner is never quant-gated in one surface and gentle in another). It is **not** re-derived from
`defaultTrack`/`learningGoal` here. Compute it where both inputs are in scope (`LessonPage`) and pass the resolved
boolean down as one prop.

3a. `src/pages/LessonPage.tsx`: import `isQuantIntensity` from `../auth/track` and pass the resolved flag to
`<LessonPlayer …>` (`:93-103`). `LessonPage` already loaded the per-concept track into `state.track` (`loadTrack`,
`:58`/`:69`) and has `userDoc` in scope. The helper's second arg is `conceptProgress?` and only reads `.track`, so
pass the per-concept track in that shape (it must win over `defaultTrack`, matching the existing `effectiveTrack`
precedence at `:91`):

```ts
// Quant-intensity gate (README §4/D2/D9): governor runs only here. ONE shared
// predicate; pass the per-concept track so it wins over defaultTrack (as :91 does).
quantGate={isQuantIntensity(userDoc, { track: state.track ?? undefined })}
```

3b. `src/lesson/LessonPlayer.tsx`: add `quantGate?: boolean` to the props type (`:40-65`) and consume it directly —
no `track`/`learningGoal` math in the player:

```ts
// Quant-intensity gate (README §4): resolved by the caller via isQuantIntensity.
// The governor runs only when true; Track A is static (quantGate === false).
const quantGate = props.quantGate ?? false
```

→ **verify:** `grep -n "isQuantIntensity" src/pages/LessonPage.tsx` shows the import + call; `grep -n "quantGate" src/lesson/LessonPlayer.tsx`
   shows the prop only (no bare `track === 'B' || learningGoal` derivation in the player);
   `/dev/lesson?track=A` passes `quantGate={false}` (governor inert).

### Step 4 — Wire the window + governor into the LessonPlayer

In `LessonPlayer.tsx`:

4a. Seed window state from the snapshot (mirror `maxHintLevelByBeat` seeding at `:103-105`):

```ts
const [repWindow, setRepWindow] = useState<RepWindow>(() =>
  initialSnapshot && !review && quantGate
    ? { results: repWindowOf(initialSnapshot) }
    : EMPTY_WINDOW,
)
```

4b. Compute governor state each render and the effective cap/fade for the current beat:

```ts
const gov = quantGate ? governorState(repWindow) : { offerFade: false, hintCap: 'default' as const }
```

4c. **Fade density** — fold `gov.offerFade` into the existing density resolution (`:148`). On the quant gate, when the
governor says "easier", offer the split/faded rendering even though the track is B:

```ts
const density: 'split' | 'merged' =
  beat.density ?? (track === 'A' ? 'split' : gov.offerFade ? 'split' : 'merged')
```

(Author-pinned `beat.density` still wins; Track A unchanged.)

4d. **Hint cap** — the governor's tightened/loosened cap must reach beats. The beats read `props.hintCapOverride ??
beat.maxHintLevel`. Today `hintCapOverride` is set only by the struggle cap-lift (`capLiftByBeat`). Extend the value
passed down so the governor's cap is honored **while preserving the struggle lift as the floor**:

```ts
// Effective cap = max(governor cap, struggle cap-lift). The struggle lift to 3
// always wins so no beat dead-ends (R6); the governor only tightens within bounds.
const govCap = effectiveHintCap(gov, beat.maxHintLevel)
const struggleLift = capLiftByBeat[beat.beatId] ? 3 : 0
const cap = (Math.max(govCap, struggleLift) || beat.maxHintLevel) as 1 | 2 | 3 | undefined
…
hintCapOverride={quantGate ? cap : (capLiftByBeat[beat.beatId] ? 3 : undefined)}
```

> Note: passing `effectiveHintCap` as `hintCapOverride` is safe — the beats already treat it as the authoritative cap
> via `props.hintCapOverride ?? beat.maxHintLevel`, and `effectiveHintCap` never returns below 2, so the reveal stays
> reachable. For Track A nothing changes (the `quantGate ?` branch falls back to today's struggle-only behavior).

4e. Append to the window on each retrieval-rep graded submit via a new `onGraded` prop (Step 5). On append, also fire
`analytics.retrievalRep` (spec-03 hook):

```ts
const onGraded = useCallback((correct: boolean) => {
  const ctx = { source: 'lesson' as const, schemaId: beat.schemaId }
  if (!isRetrievalRep(beat, ctx)) return
  analytics.retrievalRep({ lessonId, beatId: beat.beatId, schemaId: beat.schemaId, correct, source: 'lesson' })
  if (quantGate) setRepWindow((w) => pushRep(w, correct))
}, [beat, lessonId, quantGate])
```

(`beat.schemaId` is `undefined` until spec-00 lands — safe; the analytics field is optional.)

4f. Include `repWindow` in `snapshotInput` (Step 2 plumbing) so it persists.

→ **verify:** `./node_modules/.bin/eslint src/lesson/LessonPlayer.tsx` passes; typecheck clean.

### Step 5 — Add the `onGraded` rep hook to `BeatProps` and call it from rep beats

5a. `src/lesson/beats/types.ts`: add to `BeatProps`:

```ts
  // Difficulty governor (spec-21): a graded checkpoint reports its correct/wrong
  // outcome so the LessonPlayer can feed the retrieval-rep success window. Only
  // beats that are retrieval reps (masteryChallenge; review/which-method surfaces)
  // call this — ordinary graded teaching beats must NOT, to keep the window pure.
  onGraded?: (correct: boolean) => void
```

5b. `src/lesson/LessonPlayer.tsx`: pass `onGraded={onGraded}` in the `<BeatView …>` props (`:533-557`).

5c. `src/lesson/beats/MasteryChallengeBeat.tsx`: in `check()` (`:35-43`), call `props.onGraded?.(ok)` after grading:

```ts
function check() {
  const ok = gradeAcceptFields(fields, values)
  props.onGraded?.(ok)
  if (ok) { ladder.submitCorrect(); setSolved(true) } else { ladder.submitWrong() }
}
```

> Do NOT add `onGraded` to plain graded teaching beats (AnswerEntry, StateTap, etc.) — they are not retrieval reps in
> lesson flow (spec-03). `spec-10` (review surfacing) and `spec-13` (which-method gate) add their own `onGraded` calls
> with the right `ctx.source`/`ctx.role`.

→ **verify:** `grep -rn "onGraded" src/lesson` shows the prop, the player pass-down, and exactly the MasteryChallenge
   call site; `./node_modules/.bin/eslint` passes on touched files.

### Step 6 — Close the R6 gap in `OverlapBeat`

`src/lesson/beats/OverlapBeat.tsx:32`: change `maxHintLevel: beat.maxHintLevel,` →
`maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,` (match the 13 other graded beats).

→ **verify:** `grep -rLn "props.hintCapOverride ?? beat.maxHintLevel" $(grep -rln useHintLadder src/lesson/beats/*.tsx)`
   returns **no** graded-beat file (every graded view now honors the override). `OverlapBeat` no longer appears.

### Step 7 — Permanent R6 guard (ESLint local rule OR a static test)

Prefer the lighter-weight option that matches house style. Add a **node test**
`src/lesson/beats/hintCapOverride.guard.test.ts` that reads every `src/lesson/beats/*Beat.tsx` source, and for each
file that contains `useHintLadder(`, asserts the source also contains the exact substring
`props.hintCapOverride ?? beat.maxHintLevel`. This fails CI if a future capped graded beat forgets the override.

```ts
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'

const dir = new URL('.', import.meta.url).pathname
describe('R6: every graded beat honors hintCapOverride (no dead-end)', () => {
  for (const f of readdirSync(dir).filter((f) => f.endsWith('Beat.tsx'))) {
    const src = readFileSync(join(dir, f), 'utf8')
    if (!src.includes('useHintLadder(')) continue
    it(`${f} passes props.hintCapOverride ?? beat.maxHintLevel`, () => {
      expect(src).toContain('props.hintCapOverride ?? beat.maxHintLevel')
    })
  }
})
```

→ **verify:** `./node_modules/.bin/vitest run src/lesson/beats/hintCapOverride.guard.test.ts` green (covers all
   graded beats incl. the fixed OverlapBeat).

---

## 5. Two-track behavior

| | **Track A (gentle default)** | **Quant-intensity gate (Track B `OR` `learningGoal==='interview'`)** |
|---|---|---|
| Governor math | **Never runs.** `quantGate` is false; `gov` is the static default; `repWindow` stays empty and is not persisted. | Runs: rolling window over retrieval reps nudges within bounds toward 50–70%. |
| Fade density | Today's behavior: `'split'` faded scaffolds always on (`track==='A'`). Untouched. | Default `'merged'`; governor may **offer** the faded rung when `<50%` (easier), bounded — never forced when coasting. |
| Hint cap | Author cap + struggle cap-lift (today). Untouched. | `effectiveHintCap`: `loosen`→3, `default`→author, `tighten`→min(author,2). Struggle cap-lift to 3 still overrides (no dead-end). |
| Reps recorded | `masteryChallenge` still fires `analytics.retrievalRep` (analytics only; no governor effect). | Same reps, plus they drive the window. |
| No-dead-end (R6) | Guaranteed (reveal reachable; OverlapBeat fixed). | Guaranteed — `tighten` floored at 2 + struggle lift to 3. |

The governor never reads `track`/`learningGoal` itself; the gate is the shared `isQuantIntensity(userDoc, conceptProgress?)`
predicate (README §4), resolved once in `LessonPage` and passed to the player as the `quantGate` boolean — so the
governor uses the *same* gate as every other aggressive behavior (no per-surface drift, gate Issue #9).

---

## 6. Tests

**Unit — `src/lesson/governor.test.ts`** (node Vitest, pure):
1. `successRate` is `null` below `MIN_REPS`; correct fraction at/above it.
2. `pushRep` caps at `WINDOW_SIZE` (oldest dropped, most-recent-last order).
3. `governorState`: `null` window → `{offerFade:false, hintCap:'default'}`; rate `0.9` (>0.85) → `tighten`;
   rate `0.3` (<0.5) → `{offerFade:true, hintCap:'loosen'}`; rate `0.6` (band) → `default`.
4. **Bounding (D9 core):** `effectiveHintCap({hintCap:'tighten'}, 1)` and `(…, undefined)` never return `<2`;
   `'loosen'` always returns `3`; `'default'` returns the author cap. Assert no path yields `0`/`1` for `tighten`.
5. Monotone tracking: starting from a coasting window, one wrong rep moving the rate into the band flips `tighten`→
   `default` in a single evaluation (no overshoot).

**Guard — `src/lesson/beats/hintCapOverride.guard.test.ts`** (Step 7): every `useHintLadder` beat honors the override.

**Snapshot round-trip** — extend `src/lesson/snapshot.test.ts` (or add a case): a snapshot with
`interactionState.repWindow:[true,false]` round-trips through `repWindowOf` + serialize unchanged; an absent field
yields `[]`.

**Regression:** `src/lesson/mastery.test.ts`, `src/lesson/hintLadder.test.ts`, `src/lesson/retrievalRep.test.ts`
still green (no semantics changed). `git diff --stat functions/` is **empty** (R9 — streak untouched).

**Fixture validator:** `tsx scripts/validate-fixtures.ts` passes (additive optional field).

**Manual `/dev` check** (`AGENTS.md` — no Firebase/Java):
- `/dev/lesson?track=A`: behaves exactly as today; no faded-rung changes from any answer pattern (governor inert).
- `/dev/lesson?track=B`: answer a `masteryChallenge` correctly several times in a replayed flow → after `MIN_REPS`
  reps above 85%, the next capable beat should NOT offer the faded rung and the hint cap tightens (still reaches
  reveal by repeated wrong submits). Miss several → faded rung is offered and the cap loosens. (Dev route has no
  persistence, so reps reset on reload — that's expected; persistence is exercised by the snapshot test.)

→ **verify:** `./node_modules/.bin/vitest run src/lesson/governor.test.ts src/lesson/beats/hintCapOverride.guard.test.ts src/lesson/snapshot.test.ts` green.

---

## 7. Data / schema changes

- **NEW shared snapshot field** (flag to the consistency gate): `SnapshotSchema.interactionState.repWindow?: boolean[]`
  (client-written, additive, inside the existing `.loose()` block). It is **presentation tuning, not progression** —
  so it stays client-written (unlike SR cards, which are Function-owned per spec-01). No Firestore rule, index, or
  Function change. This is the only field this spec introduces beyond what §4 already defines.
- No change to `BeatSchema`, `reviews/{cardId}`, `confidenceByBeat`, the method registry, or `GRADED_BEAT_TYPES`.
- `RepWindow`/`GovernorState` are local module types (not §4 shared shapes); only the persisted `repWindow` boolean
  array crosses a contract boundary.

---

## 8. Foolproofing (which §8 items apply)

- **R6 — Capped beats dead-end without an assist path (the central requirement).** Satisfied three ways: (1)
  `OverlapBeat` fixed to honor `hintCapOverride` (Step 6) — closing the only real gap; (2) the guard test (Step 7)
  prevents regression across all graded beats forever; (3) the governor's `tighten` is *floored at cap 2* and the
  existing struggle cap-lift still escalates to the level-3 reveal — so even when the governor makes a beat harder, a
  persistent learner always reaches the answer. The equation `assist` prefill remains an extra (not the guarantee).
- **R2 — Two mastery sources of truth.** Untouched: `GRADED_BEAT_TYPES`, `computeMastered`, `derived.mastered`, and
  `maxHintLevelByBeat` are not modified. The governor reads a *separate* `repWindow` and never feeds mastery. Add no
  mastery assertions are needed because mastery code is unchanged, but the regression run (`mastery.test.ts`) proves it.
- **R5 — Missing foundations silently degrade.** The governor hard-depends on spec-03's `isRetrievalRep`; Step 4
  imports it rather than re-deriving "is this a rep". If spec-03 is absent, STOP (don't stub).
- **R9 — "It's in the product" ≠ "the mechanism exists" / streak untouched.** No `functions/` change; `git diff
  --stat functions/` empty. The retrieval-rep window is independent of the streak (D10).
- **R12 — Client timestamps are spoofable.** The governor records no time and no scheduling state; the window is a
  count-only ring. Nothing here keys off client time. (SR scheduling remains Function-owned, spec-01.)

---

## 9. Definition of Done

- [ ] `src/lesson/governor.ts` exists: pure, dependency-free; exports `RepWindow`, `GovernorState`, `EMPTY_WINDOW`,
      `pushRep`, `successRate`, `governorState`, `effectiveHintCap`, and the (untuned) constants.
- [ ] Governor runs **only** on the quant-intensity gate, resolved via the shared `isQuantIntensity(userDoc,
      conceptProgress?)` helper (README §4) in `LessonPage` and passed down as `quantGate` — not re-derived from
      `defaultTrack`/`learningGoal` in the player; Track A is byte-for-byte unchanged in behavior.
- [ ] Window counts **only** `isRetrievalRep` graded submits (spec-03); plain graded teaching beats do not feed it.
- [ ] Two bounded knobs work: fade density offered when `<50%`, withheld/`merged` when `>85%`; hint cap loosens/tightens
      within `[2,3]` — **never** below 2, so the level-3 reveal is always reachable (D9 bound + R6).
- [ ] `OverlapBeat` honors `hintCapOverride`; the guard test passes for **every** `useHintLadder` graded beat.
- [ ] `repWindow` persists in the snapshot and round-trips (`repWindowOf` + serialize); absent ⇒ `[]`.
- [ ] `analytics.retrievalRep` fires on each rep (reuses spec-03's hook); no new analytics name added here.
- [ ] **Zero changes under `functions/`** (`git diff --stat functions/` empty); `GRADED_BEAT_TYPES`/mastery untouched.
- [ ] Green: `./node_modules/.bin/vitest run src/lesson/governor.test.ts src/lesson/beats/hintCapOverride.guard.test.ts
      src/lesson/snapshot.test.ts` and the regression files (`mastery`, `hintLadder`, `retrievalRep`).
- [ ] `tsx scripts/validate-fixtures.ts` passes.
- [ ] `./node_modules/.bin/eslint` clean on every touched file (`governor.ts`, `governor.test.ts`, `schema.ts`,
      `snapshot.ts`, `LessonPlayer.tsx`, `LessonPage.tsx`, `beats/types.ts`, `beats/MasteryChallengeBeat.tsx`,
      `beats/OverlapBeat.tsx`, the guard test).
- [ ] Manual `/dev/lesson?track=A` (inert) and `?track=B` (governs within bounds, never dead-ends) verified.
