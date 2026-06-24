# Build Brief — Implementing the Remaining Lessons (L0, L2–L6) with a Sub-Agent Team

**Audience.** A future *orchestrator* agent that will spin up a team of sub-agents to implement every
lesson in `docs/proposed-lessons.md` beyond the built flagship (L1): the optional on-ramp **L0**, and
**L2 Penney's**, **L3 Gambler's Ruin**, **L4 Mixed Review & Streaks**, **L5 Longer Patterns**, and
**L6 The Overlap Shortcut** — all with the inclusivity system baked in from the start.

**How to use this brief.** Read it top to bottom once. Then: (1) **re-verify the live working tree**
(see the box below — it moves fast), (2) freeze the shared contracts ([§4](#wave0)), (3) launch the
waves in dependency order ([§3](#team), [§9](#waves)), (4) hold every sub-agent to the shared
conventions ([§7](#conventions)) and the per-lesson packets ([§8](#packets)), (5) gate on the
verification checklist ([§10](#dod)). Assign **one owner per shared file** — parallel writes to the same
file have raced and clobbered edits in this repo before.

**Source-of-truth documents (read before building):**
- `docs/proposed-lessons.md` — the inclusive course design + the cross-cutting system (its §2 is
  mandatory for every lesson).
- `docs/l1-inclusive-redesign-spec.md` — the L1 spec; its infra is **already largely built** ([§1](#state)).
- `audits/ideation/plan-L{2..6}-*.md` — the math-verified beat specs. **Math is canonical; sequencing/
  copy is superseded by `proposed-lessons.md`.** ⚠ **Filename↔lesson offset:** `plan-L4-overlap-shortcut.md`
  is **this brief's L6**; `plan-L6-longer-patterns.md` is **this brief's L5** (see [§11](#risks)).
- `audits/ideation/inclusive-research-{1..5}-*.md` — the learning-science basis.
- `audits/ideation/tech-review-build-brief.md` — the technical feasibility review folded into this draft.
- `docs/mvp_prd.md`, `docs/ui_design_system.md`, `CONTEXT.md` — product, design, glossary.

> **⚠ The working tree is under active development — re-verify before building.** This brief was twice
> reviewed: by the five learning-science agents (pedagogy) and by a tech-stack agent (feasibility,
> against real code). The tech review (2026-06-24; `tsc -b` clean, **98 vitest pass**, `npm run validate`
> clean) found that a large slice of "Wave 0" **already landed in the working tree** (much of it
> untracked) *after* the first draft — so any "current state" snapshot here can be stale within hours.
> **An orchestrator must `git status` + spot-read the cited files before assigning work**, and treat
> [§1](#state) as "true as of the tech review," not gospel.

> **Two audits incorporated (2026-06-24).** *Learning-science:* the inclusivity system is now a **gate,
> not a guideline** — checkable schema fields + `validate-fixtures` asserts + per-lesson DoD checklists
> ([§4.4](#wave0)/[§4.5](#wave0)/[§10](#dod)), an enforced **early-win** rule, and the **mastery +
> adaptive-fade engine** ([§4.10](#wave0)). *Tech:* corrected the mastery **persistence** design (Cloud
> Function writes it; client only computes), the `buildWalk` **return type** (a `WalkModel`, not an
> `Automaton`), the `StateGraph`-reuse limits (race ✔ / walk ✗), the eager-`buildAutomaton` crash, and
> the schema-field placement. Per-source changelog in [§12](#audit).

---

## Table of contents
1. [Current state (verify against the live tree)](#state)
2. [Target & non-negotiables](#target)
3. [The sub-agent team](#team)
4. [Wave 0 — shared foundations (freeze first)](#wave0)
5. [Engine modules to build](#engines)
6. [Widget catalog to build](#widgets)
7. [Shared conventions (every agent obeys)](#conventions)
8. [Per-lesson task packets](#packets)
9. [Waves & dependency graph](#waves)
10. [Definition of done & verification gates](#dod)
11. [Risks & open decisions](#risks)
12. [Audit changelog (learning-science + tech)](#audit)
13. [Provenance](#provenance)

---

<a name="state"></a>
## 1. Current state (true as of the tech review — re-verify against the live tree)

**Do not re-build what exists.** The two-track inclusive infra is substantially implemented; the
remaining-lesson work *builds on it*. The tech review confirmed §1.1 is accurate and found §1.2 was
materially stale on the first draft — corrected below.

### 1.1 Already BUILT and reusable (spot-verified)
- **Engine:** `buildAutomaton(pattern,p)` (pure, exact-rational, KMP; states carry `id` **and** concrete
  `label`; handles `"H"` → `E0=2`). `simulate.ts`: `nextStateOf`, `flipsToAbsorption`, `empiricalMean`,
  `mulberry32`. (`src/engine/{automaton,simulate,types}.ts`.) **Caveat:** `prefixFunction` +
  `solveLinearSystem` are **module-private**; the `src/engine/index.ts` barrel was deleted.
- **Schema (closed unions):** `primer`, `mcq`, `byOption`, `EquationCopy` (+`mistakeHints`,`primer`),
  `EquationRow.faded`/`note`, `BeatSchema.{maxHintLevel,track,density}`, `ProgressDerived.{transferAttained,mastered}`,
  `Progress.track`, `Snapshot.maxHintLevelByBeat`. (`src/content/schema.ts`.)
- **Two-track player:** `LessonPlayer` (track A/B, `visibleBeats` filter, per-beat `density`, hint
  high-water via `bumpMaxHintLevel`). Beats: `PrimerBeat`, `McqBeat`, `OverlapBeat` (Track-A graded tap),
  `EquationTilesBeat` (dual-label graph + dyna-link via `highlight`, staged reveal, faded rung,
  fixture-authored copy), `CoinSimBeat` (Track-A split + gambler note + `H` guard). `FirstSuccessTimeline`
  (EV grounding; a **sub-widget** used by `PrimerBeat` variant `average`, not its own interaction).
- **Konva:** `StateGraph` (`labelMode:'prefix'|'dual'`, `highlight`, `activeEdge`, `pulseKey`, n>4 sizing;
  dual-label's 2nd line is **hardwired to `s.id` = `E${number}`**), `SimChart` (**logarithmic** y-axis),
  `BiasChart`, `theme.ts` (**fixed** palette — import `C`/`FONT_MONO`, never inline hex), `useElementWidth`.
- **Feedback/mastery:** `useHintLadder`, `resolveFeedback`, `resolveOptionFeedback`, `feedbackResolve.ts`;
  **`src/lesson/mastery.ts`** (`computeMastered`, `bumpMaxHintLevel`; tested) — wired in `LessonPlayer`.
- **Diagnostic/track:** `src/pages/DiagnosticGate.tsx` (4-Q → A/B) and **`src/progress/track.ts`**
  (`setDoc` merge of `track` on `progress/{courseId}` — rules-legal). *Built but not yet wired into
  `GuardedRoutes`.*
- **Per-lesson phases:** `src/lesson/phases.ts` is **already per-lesson** (`LESSON_PHASES`/`configFor`,
  an L0 `FIRST_HEADS` config); `getRail` puts unknown current beats off-rail (no throw). *(This was the
  first draft's top blocker — now effectively done; keep `phases.test.ts` as a regression.)*
- **L0 + course scaffold:** `fixtures/lesson-first-heads.json` exists (built); the course fixture carries
  the **L0 node (`optional:true`)**, L2–L6 `built:false`, and a **de-gatekept `persona`/`description`**.
- **Backend:** `completeLesson` (verifies required beats; **writes `derived` incl. `mastered`**;
  idempotent), `recordQualifyingAction`, `awardMilestonesForCompletion` (`LESSON_MILESTONES`,
  `MID/FULL_COURSE_PATH`), seed script.

### 1.2 NOT yet built — the real remaining work
1. **Engine internals private** → `export prefixFunction` + `solveLinearSystem` (add on `automaton.ts`;
   the barrel is gone). ([§4.1](#wave0))
2. **Eager-automaton crash (tech B4).** `LessonPlayer` builds `buildAutomaton(patternOptions[0],0.5)`
   for *every* lesson and `BeatProps.automaton` is required; `buildAutomaton` **throws on non-H/T**. An
   L3 fixture whose `patternOptions[0]` isn't H/T crashes before any beat renders. Need a Wave-0
   convention. ([§4.3](#wave0))
3. **No per-beat `pattern` field** on `BeatSchema` (needed for L5/L6 + the validator cross-check).
   ([§4.3](#wave0)/[§4.5](#wave0))
4. **New widget schema variants + the *checkable* inclusivity fields** are unspecified
   (`raceSim`/`walkBoard`/`sumTiles`/…, plus the `hero?` block + ordering tags + interview-note field).
   ([§4.4](#wave0))
5. **`validate-fixtures.ts` is flagship-only** (hardcodes `buildAutomaton('HH')` + the flagship file
   list). ([§4.5](#wave0))
6. **No `/dev/lesson/:lessonId` route** (and fixtures are bundled imports, not `/public` — needs a
   static import map, not `fetch`). ([§4.6](#wave0))
7. **`SimChart` y-axis is logarithmic** → a `[0,1]` win/ruin-rate mode needs a **linear-scale branch**,
   not a `yLo` tweak. ([§4.7](#wave0))
8. **Diagnostic not wired** into `GuardedRoutes`; **affective on-ramp + landing subline** unowned.
   ([§4.8](#wave0)/[§4.11](#wave0))
9. **Mastery re-surfacing + adaptive override** are not built: `computeMastered` exists but nothing
   consumes it; `derived.mastered` is **frozen at first completion** (idempotent CF) so re-surfacing must
   read the live snapshot; `attemptsByBeat` is **never persisted**; the adaptive **re-prefill** needs a
   new prop on the shared `EquationTilesBeat`. ([§4.10](#wave0))
10. **`theme.ts` token pre-stock** for new heroes (Wave-2 can't edit the shared palette). ([§4.4](#wave0)/[§6](#widgets))
11. **`EquationTilesBeat` chrome reduction** (legend+build+palette still appear together once
    `buildShown`). ([§6](#widgets))
12. **New engines + widgets + fixtures** for L2–L6; L0 exists but **differs from this brief's §8.0**
    (reconcile). ([§5](#engines), [§6](#widgets), [§8](#packets))

---

<a name="target"></a>
## 2. Target & non-negotiables

**Target:** every lesson completable end-to-end (Track A *and* B, tap-only, reduced-motion),
engine-driven, validated, seeded, unlock-wired, with the inclusivity system applied **and gated**.

**Non-negotiables:** No AI (Phase-1). Two tracks sharing **one adaptive spine** (support re-expands on
struggle — [§4.10](#wave0)). The inclusivity system (`proposed-lessons.md` §2) applied **and enforced**
(DoD + validator): JIT primers + notation ladder, faded worked→completion→independent, elicit-and-refute
(per-option/refutational hints), retrieval opener + generate-then-reveal recap, interleaving, the light
non-blocking **mastery** signal, a **guaranteed early win** per lesson, de-gatekept warm-but-precise
copy, and the **checkable** widget load rules. Tap-only + reduced-motion (e2e-asserted), 44px targets,
`aria-live`. Engine purity + golden tests. Surgical, contract-first, file-ownership respected.

---

<a name="team"></a>
## 3. The sub-agent team

Waves ([§9](#waves)); parallel only on disjoint files. `claude-opus-4-8-thinking-max-fast` (or latest
Opus) for engine/lesson agents; a fast model only for fixture-authoring **after** contracts are frozen
(the audits show soft inclusivity regresses on fast models unless it's a *checkable* contract).

| Role | Count | Owns (writes) | Mandate |
|---|---|---|---|
| **Foundations engineer** | 1 (Wave 0, serial) | `schema.ts`, `phases.ts`, `PhaseRail.tsx`, `LessonPlayer.tsx`, `beats/{index,types,EquationTilesBeat}.tsx`, `validate-fixtures.ts`, `App.tsx`/routes, `konva/{SimChart,theme}.*`, `functions/{index,milestones}.ts`, course fixture, `DiagnosticGate` wiring, `src/lesson/mastery.ts` + the next-step recommender | Clear all of [§4](#wave0). **Freeze the checkable contracts** (schema variants + `hero?` block + ordering/interview fields, `pattern` field, per-lesson phases regression, active-pattern convention, dev route, **mastery re-surfacing + adaptive override**, pre-stocked `theme.ts` tokens, chrome reduction) so Wave 1–2 never touch shared files. |
| **Engine specialist** | 1–3 (Wave 1) | `src/engine/race.ts`, `walk.ts`, `correlation.ts` (+ tests) | Build to [§5](#engines) with golden cross-checks vs `buildAutomaton`. New files only. |
| **Shared-widget specialist** | 1–2 (Wave 1) | AutocorrelationRuler, SumTiles, retrievalGrid/tripletReveal | Build to [§6](#widgets) + load rules. New files only. |
| **Per-lesson author** | 6 (Wave 2) | that lesson's *new* widget files + fixture + golden tests | Implement per the packet ([§8](#packets)). New files only. |
| **Integration/QA** | 1 (Wave 3) | course `built` flags, seed, e2e, final verification | Wire the path, seed, run the gate ([§10](#dod)). |

**Coordination:** contract-first; one owner per shared file; never batch parallel `StrReplace` to one
file; each agent runs its verification subset and reports green/red.

---

<a name="wave0"></a>
## 4. Wave 0 — shared foundations (freeze before any lesson)

Owner: Foundations engineer, serial. Recommended internal order (tech review): **schema fields →
validator → engine exports → dev route → SimChart → assist prop / chrome reduction → diagnostic wiring →
affective/landing** (the last two are independent). Each item ends green on `tsc -b`, `eslint .`,
`vitest`, `validate`, `build`. **First action: `git status` + confirm which §4 items already landed** (the
tech review found §4.2 done, §4.8/§4.9/§4.11 partly done, `mastery.ts` present).

**4.1 Export engine internals.** `export prefixFunction` + `solveLinearSystem` from `automaton.ts`
(+ a focused test). The `src/engine/index.ts` barrel is gone — export directly.

**4.2 Per-lesson phase config — VERIFY (likely done).** `phases.ts` already exposes `LESSON_PHASES`/
`configFor` + an L0 config and `getRail` no longer throws. Just confirm it covers L2–L6 lessonIds and
keep `phases.test.ts` green.

**4.3 Active-pattern convention + the eager-automaton fix (tech B4).** Add optional `pattern?: string`
to `BeatSchema`. **Keep `patternOptions[0]` a valid H/T placeholder for every lesson** (L2 already uses
real patterns; **L3 uses `["H"]`**) so the shared `buildAutomaton(patternOptions[0],0.5)` never throws;
race/walk beats **ignore the shared `automaton` and build their own** (the `OverlapBeat` precedent). This
is cheaper than making `automaton` optional across all beats. Guard empty `patternOptions`.

**4.4 Freeze schema variants + the *checkable* inclusivity contracts.**
- Add new variants + `BeatView` dispatcher stubs: `raceSim`, `walkBoard`, `gamblerLedger`, `sumTiles`,
  `dominanceWheel`, `tournamentHeatmap` (or fold into `raceSim`), `distributionHistogram` (or a
  `theorySimChart` variant), `tripletReveal`, plus `autocorrelationRuler`. Use **`retrievalGrid` as its
  own variant for a true matching grid** (reuse `mcq` only for single-select recall). `sumTiles` is its
  own variant (verified: `TileSchema` can't express `Σ2^L`/biased probs).
- **Make the ladder + load rules mechanically checkable (tech P-test 3/6 fix):** add **one optional
  `hero?: { slowFirst: boolean; structuralReadout: string; reducedMotionFinalFrame: true }` block on
  `BeatSchema`** (not per-interaction-member — that would force repetition), plus a `HERO_TYPES`
  allowlist the validator uses to require it. Add ordering tags on `BeatSchema`:
  `introducesSymbol?: string` / `groundedBy?: string[]` and `comparison?: true`. Add an
  **`interviewNote?: string`** field on `BeatSchema` (otherwise "a 'For the interview' note exists" is
  unverifiable). Add a primer `variant: 'gamblersFallacy'` (the enum currently lacks one) so L3's
  refutation is assertable; otherwise the L3 misconception check can only test structural presence.
- Pre-stock **`theme.ts` tokens** the new heroes need (race lanes A/B, heatmap gradient, ruin/win, swarm)
  so Wave-2 authors never edit the shared palette.

**4.5 Generalize `validate-fixtures.ts` — schema + math + inclusivity.** Iterate every
`fixtures/lesson-*.json`; per `equationTiles` beat cross-check `row.target` vs
`buildAutomaton(beat.pattern ?? patternOptions[0], 0.5)` (depends on §4.3); cross-check race/walk
goldens. **Inclusivity asserts (now mechanizable via §4.4):** a graded retrieval opener exists (except
**L5**, the logged transfer exception); **≥1 `primer`** and every `introducesSymbol` beat is preceded by
its `groundedBy` **within each track's visible subsequence** (apply `LessonPlayer`'s track filter — a
`track:'A'` grounding beat does NOT precede a `track:'both'` symbol beat for Track B); every `prediction`
uses `byOption`; every `hero?`-typed beat carries the `hero` block; an `interviewNote` exists somewhere;
**L3 contains the `gamblersFallacy` primer**, **L6 contains the `exponent` primer before `sum-it`**.

**4.6 Dev route for arbitrary lessons.** Add `/dev/lesson/:lessonId` → a **static import map**
`{ 'lesson-penneys-game': () => import('../../fixtures/lesson-penneys-game.json'), … }` (fixtures are
bundled, not in `/public`; a runtime `fetch` won't find them) → `<LessonPlayer lesson track>` with no
Firebase. Keep `/dev/lesson` (flagship) + `?track=A`.

**4.7 `SimChart` — add a linear `[0,1]` mode.** The axis is logarithmic (can't show <1). Add a
**linear-scale branch** for win-rate/ruin-rate; keep the flagship log look on defaults.

**4.8 Wire the diagnostic — VERIFY then finish.** `track.ts` already `setDoc`-merges `track` on
`progress/{courseId}` (rules-legal). Remaining: run `DiagnosticGate` in `GuardedRoutes` at course entry;
`CoursePathPage`/`LessonPage` read `track` → `LessonPlayer track=`. L0 always *offered*.

**4.9 Course + milestone scaffold — VERIFY then finish.** Course fixture already has the L0
(`optional:true`) node + de-gatekept persona; `CourseSchema` supports `optional`. Remaining: keep L2–L6
`built:false` until each ships; **if L0 should fire `first-heads-found`, add the
`lesson-first-heads → first-heads-found` entry to `LESSON_MILESTONES`** (it's absent today, so L0
currently awards no milestone — consistent with "optional," but a no-op if you intend the seal). Do
**not** add L0 to `MID/FULL_COURSE_PATH`.

**4.10 Mastery re-surfacing + adaptive override (the audits' #1 fix — corrected by tech).**
- **(a) `mastered` — CLIENT COMPUTES, CLOUD FUNCTION PERSISTS (do not change to a client write).**
  `firestore.rules` denies the client `progress.derived`; the correct flow already exists:
  `computeMastered(...)` (`src/lesson/mastery.ts`) runs in `LessonPlayer`, is passed into
  `completeLesson`'s `derived` arg, and the CF writes `derived.mastered`. **Use the existing
  `src/lesson/mastery.ts` — do not create `src/progress/mastery.ts`.**
- **(b) Idempotency caveat (new).** `completeLesson` early-returns on replay, so `derived.mastered` is
  **frozen at first completion**. The **next-step recommender + L4 weak-node selector must read the live
  snapshot** (`snapshots/{lessonId}.interactionState.maxHintLevelByBeat`, owner-readable), **not** the
  frozen `derived.mastered`. Note `attemptsByBeat` is **never persisted** — the reader keys on
  `maxHintLevelByBeat`. Build the recommender + the cross-lesson reader here.
- **(c) Adaptive override (tech B2 — needs a SHARED `EquationTilesBeat` edit, hence Wave 0).** Cap-lift
  works via a prop (`useHintLadder` recomputes `max` each render). **Re-prefill does not** (the faded
  fill is built once in a `useState` initializer; the beat remounts per beat via `key`). Add imperative
  props to `BeatProps`/`EquationTilesBeat`:
  ```ts
  hintCapOverride?: 1 | 2 | 3                          // threaded into useHintLadder's cap
  assist?: { prefillToLastTerm: boolean; nonce: number } // on nonce change, fill correctFill() into
                                                          // every still-open slot except the last term,
                                                          // preserving learner-correct tiles
  ```
  Driver: on ≥2 wrong submits across consecutive graded beats, lift the cap + bump `nonce`; on first-try
  success, fade faster. **Every capped beat (L2/L3 setup, L5, L6 `apply-*`) must be unable to dead-end.**
- **Gate (DoD):** `mastered` computed + consumed by the recommender; adaptive override active on every
  capped beat; re-surfacing reads the live snapshot.

**4.11 Affective on-ramp + landing surface — VERIFY then finish.** Persona/description already
de-gatekept. Remaining (co-located with §4.8, opt-in): the ~20s anxiety/belonging line; the "What brings
you here?" relevance question (quant choice surfaces "For the interview" notes; does **not** fork
content); and the **landing subline** rewrite in `LandingPage` ("State thinking for quant interviews" →
"Learn probability by playing with it") — **assign an explicit owner** (confirm it isn't left unowned
between this brief and the L1 spec).

---

<a name="engines"></a>
## 5. Engine modules to build (pure, golden-tested)

Exact-rational, dependency-free, reuse the §4.1 exports. Math canonical in `proposed-lessons.md` §10 +
`plan-L*` (HANDOFF corrections: Penney's **4-cycle**; `HHT`≻`HTT` **2:1**; `THH` vs `HTT` **tie**; L3
biased `p=0.4,i=2,N=4` → `P=4/13`, ruin `9/13`, `D=50/13`; guard `r=q/p=1`). The tech review re-derived
all goldens — correct.

```ts
// src/engine/race.ts  (L2)  — return shapes fine
buildRaceAutomaton(a,b,p): RaceAutomaton ; penneyOdds(a,b): { aBeatsB: Rational; bBeatsA: Rational }
conwayLeadingNumbers(a,b,q) ; bestBeater(a) ; winMatrix(patterns,p): Rational[][]
simulateRace(a,b,p,rng): 'A'|'B'   // MUST advance two KMP states on ONE shared stream; cannot reuse
                                   // simulate.ts's single-automaton flipsToAbsorption (tech ✔).
// Golden: penneyOdds('HHH','THH')=7:1 ⇒ P(THH first)=7/8; HH vs HT tie (½).

// src/engine/walk.ts  (L3)  — CORRECTED: a dedicated model, NOT "Automaton-shaped"
export type WalkModel = {
  N: number; p: Rational; q: Rational
  reachProb: Rational[]   // P_i = p·P_{i+1}+q·P_{i-1}, P_0=0, P_N=1   (no +1, boundary 1·0)
  ruinProb: Rational[]    // 1 - reachProb
  duration: Rational[]    // D_i = 1 + p·D_{i+1}+q·D_{i-1}, D_0=D_N=0  (+1, boundary 0)
}
buildWalk(N:number, p:number): WalkModel              // both solved via solveLinearSystem (handles r=1)
simulateWalk(i,N,p,rng): { end: 'ruin'|'win'; steps: number }   // tagged outcome, not 0|'N'
batchWalkStats(i,N,p,rng,trials): { ruin:number; win:number; meanSteps:number }
// Do NOT return an Automaton (two absorbers break flipsToAbsorption/empiricalMean & nextStateOf).
// OPTIONAL only if a graph is wanted: walkToGraph(w): { states; transitions } — a partial shape, never
// fed to the single-absorber sim helpers.
// Golden: fair N=4 → reach=[0,¼,½,¾,1], D=[0,3,4,3,0]; biased p=0.4,i=2 → reach=4/13, D=50/13.

// src/engine/correlation.ts  (L6, shared with L5)
correlation(v,w) ; autocorrelation(pattern,q): { bits; overlaps; sum }
expectedWaitFair(pattern): number   // Σ2^L = 2·CLN₂(self)
gamblerLedger(pattern, stream): { rows; payout }
// Golden: expectedWaitFair === buildAutomaton(p,0.5).E0 for HT/HH/THH/HTH/HHH (4,6,8,10,14); ledger payout === that.

// L0 / L4: no new engine — buildAutomaton('H',0.5).E0 === 2 (golden already validated).
```

---

<a name="widgets"></a>
## 6. Widget catalog to build

Per the **checkable** load rules ([§4.4](#wave0)): `hero.slowFirst` (paced single instance before any
swarm), `hero.structuralReadout` (the one plain number), `hero.reducedMotionFinalFrame` + `aria-live`
mirror; spectacle never replaces the number. Pattern: **Konva heroes** (`'use no memo'`, palette from
`theme.ts`, size via `useElementWidth`, **imperative animation on refs — no per-frame React state**;
the ~100-walker swarm runs **one** `Konva.Animation` loop mutating node refs), **DOM + `aria-live` for
taps/tiles/mirrors**, 44px targets, commit-on-drag-end.

**Two cross-cutting requirements (tech-refined):**
- **Dual-label/dyna-link applies to L2 race lanes via `StateGraph` reuse, but the L3 walk lattice is
  bespoke Konva.** `StateGraph` is static and its dual second-line is hardwired to `E${number}` — it
  **cannot** render the `$0..$N ↔ P_i/D_i` translation. WalkBoard/WalkerSwarm/RuinLandscape are new Konva
  that *replicate* the dual-label convention (the §6 "or an equivalent" hedge = real new code). Race
  lanes = two single-pattern `StateGraph`s driven by `nextStateOf` on one shared stream.
- **`EquationTilesBeat` chrome reduction is REQUIRED (Foundations, Wave 0)** — today legend+build+palette
  appear together once `buildShown`; reduce to on-demand reveal before L0/L2/L3/L5 reuse it.

| Widget | Lesson(s) | Build sketch |
|---|---|---|
| **AutocorrelationRuler** | **L5, L6 (self only)** | DOM mono rows + offset; tap match bits; drives `correlation()`; default read-out = concrete **`2^L` running total**; binary/Conway/CLN = collapsed **"For the interview"** layer (do NOT surface the symbol first; do NOT re-add it to L2 — proposed §5 cut the Conway beat). Shared, Wave 1. |
| **SumTiles / TermLedger** | L4, L6 | reuse tile components; `2^L`/series chips → running sum snaps to the closed form; own `sumTiles` variant. Shared, Wave 1. |
| **retrievalGrid** | L4, L6, openers | own variant for a matching grid (reuse `mcq` for single-select). Shared, Wave 1. |
| **tripletReveal** | L4 | three lenses → one number; **predict-then-reveal**. |
| **RaceTrack / PatternDuel** | L2 | two single-pattern `StateGraph`s + one shared `CoinStream`; `simulateRace`; converging win-rate bars + tally; `slowFirst` (one slow race → batch); dual-label. |
| **OddsDial** | L2 | Konva gauge fed one `Rational`; needle → 7:1; reduced-motion static split; `structuralReadout`="THH won ~7 of 8." |
| **DominanceWheel** | L2 | Konva radial + `winMatrix`; trace the **4-cycle**; narrative but include the `comparison` tap. |
| **TournamentHeatmap** | L2 | Konva 8×8 colored by `winMatrix`; pure (new theme gradient tokens). |
| **WalkBoard / RuinBoard** | L3 | **bespoke** Konva 1-D lattice; drag start/walls/bias (commit on drag-end); outcome bar + duration; `buildWalk`(`WalkModel`) + DOM slider mirror; replicate dual-label ($↔`P_i/D_i`) + dyna-link to the tiles. |
| **WalkerSwarm** | L3 | Konva particles over seeded `simulateWalk`; **one walker first**, then ~100 via one anim loop; `structuralReadout`="ruin 51 / win 49 of 100." |
| **RuinLandscape** | L3 | Konva line (BiasChart conventions); `P_i=i/N` warps with bias; concrete money/odds axis. |
| **DistributionHistogram** | L3 | Konva bars (SimChart theme); "average ≠ typical"; DOM table fallback. |
| **GamblerLedger + fairness meter** | L6 | Konva chips + DOM tap grid; `gamblerLedger`; **mean(in)/mean(out) converge before asserting `E[T]=Σ2^L`**; defer "martingale" to a note. |
| **TriangulationStrip** | L6 | reuse `SimChart` value axis; three markers snap; predict-then-reveal. |

(L5 = no new hero; reuse `OverlapBeat` graphs + AutocorrelationRuler + SumTiles. L0 = `StateGraph` 2-node
+ `FirstSuccessTimeline` + `PrimerBeat` + `equationTiles`.)

---

<a name="conventions"></a>
## 7. Shared conventions (every agent obeys)

1. **Inclusivity is mandatory AND gated** (validator §4.5 + DoD §10), not prose.
2. **Track discipline.** Track-exclusive beats `required:false`. Author merged (B) + split (A) for
   high-load beats via `density`. **Adaptive override (§4.10) on every capped beat — no dead-ends.**
3. **Engine-driven, exact, golden-tested.** No fixture number not engine-cross-checked.
4. **Konva:** `'use no memo'`; palette from `theme.ts` (request new tokens via Foundations, never inline);
   imperative animation, no per-frame React state; reduced-motion final frame + `aria-live`;
   commit-on-drag-end. New state/number-line heroes **dual-label + dyna-link** (race via `StateGraph`;
   walk bespoke — [§6](#widgets)).
5. **Copy voice:** warm-but-precise; gloss jargon or relegate to the `interviewNote`; **retire
   "trap"/"penalty"**; surface `needsReview` only as a gentle "worth another look," **never a demerit**.
6. **Files:** Wave-1/2 create **new** files only; shared-file changes route to Foundations; never batch
   parallel `StrReplace` to one file.
7. **Tests with every unit:** engine goldens; component reduced-motion + tap-only; fixture passes
   `validate` (incl. inclusivity asserts); a lesson needs its e2e Track-A + Track-B pass.
8. **Guaranteed early win.** Each lesson's **first graded interaction is a low-stakes, guaranteed-success
   win; the first graded beat is never the hardest.** Track-A **retrieval openers are no-penalty
   warm-ups** with supportive feedback.
9. **Reveals become comparisons.** Any beat that *states* a contrast carries `comparison:true` + a
   learner align-and-articulate tap.
10. **No symbol before its referent.** Author beats in `groundedBy → introducesSymbol` order **within
    each track**; the validator fails CI on inversion. The concrete read-out leads; the symbol/binary/
    Conway form is the last, optional (`interviewNote`) layer.

---

<a name="packets"></a>
## 8. Per-lesson task packets

One Wave-2 author each. Deps green first. Math canonical in the cited `plan-L*` (**mind the filename
offset**). **Every packet's DoD = the shared inclusivity checklist ([§10](#dod)) + the lines below.**

### 8.0 L0 — The First Heads (`lesson-first-heads`) — **EXISTS; reconcile to the shipped fixture**
The fixture is **built but differs from earlier drafts**: it is ~5 beats
(`prediction → primer:half → coinSim → primer:average → mcq`), `optional:true`, **`unlocks:null`**.
- **Action:** treat the shipped fixture as the source of truth; update any prose that says
  "→ FirstSuccessTimeline → StateGraph(dual) → equationTiles → recap" or `unlocks: lesson-pattern-hitting-times`
  (an optional/ungated L0 must **not** lock its successor — keep `unlocks:null`). If you *want* the
  fuller §3 sequence, change the fixture deliberately and re-validate. Optional `first-heads-found`
  milestone only fires if you add the `LESSON_MILESTONES` entry (§4.9).
- **DoD (+shared):** `buildAutomaton('H').E0===2`; completable A+B at `/dev/lesson/lesson-first-heads`.

### 8.1 L2 — Penney's Game (`lesson-penneys-game`)  [math: `plan-L2-penneys-game.md`]
- **Deps:** §4 + `race.ts` + RaceTrack/OddsDial/DominanceWheel/TournamentHeatmap + `SimChart` linear mode.
- **Build:** proposed §5 (retrieval `recall-6-4`; `whos-first` primer; per-option `open-bet`;
  `race-the-tie`; `first-step-split`; graded `pick-your-counter`; `race-the-counter` 7:1;
  `prob-vs-duration` primer; **2-state** `win-prob-tiles` (NOT the cyclic 5-state solve);
  `non-transitive-loop` narrative + `comparison` tap). **No Conway/`conway-aligner` symbol beat** (cut by
  design). `patternOptions[0]` = a real H/T pattern; race beats build their own engine.
- **DoD (+shared):** `penneyOdds('HHH','THH')=7:1`; HH/HT tie; RaceTrack/OddsDial carry the `hero` block +
  dual-label; milestone `penneys-game-won`; unlocks L3.

### 8.2 L3 — Gambler's Ruin (`lesson-gamblers-ruin`)  [math: `plan-L3-gamblers-ruin.md`]
- **Deps:** §4 (esp. **B4**: `patternOptions:["H"]` placeholder; walk beats ignore the shared automaton)
  + `walk.ts` (`WalkModel`) + WalkBoard/WalkerSwarm/RuinLandscape/DistributionHistogram + `SimChart`
  linear mode. Graded tiles **fair-coin only**.
- **Build:** proposed §6 (retrieval opener; per-option `open-bet`; **`primer:gamblersFallacy` (required)**;
  `walk-once`; `boundary-edge`; `ground-both` hand-tally; `prob-tiles`; **`duration-tiles` as a
  completion problem** — pre-fill the shared structure, learner adds the `+1` back; two signaled
  contrasts; `guided-solve`; `house-edge` `slowFirst` + "average ≠ typical" + `comparison`; recap).
- **DoD (+shared):** fair `N=4,i=2`→`reach=½,D=4`; biased golden `4/13`; **gambler's-fallacy primer
  present** (validator-asserted); WalkBoard replicates dual-label + dyna-links to the `P_i`/`D_i` tiles;
  `duration-tiles` is faded/completion; milestone `gamblers-ruin-solved` + mid-course
  `three-lessons-complete`; unlocks L4.

### 8.3 L4 — Mixed Review & Streaks (`lesson-states-streaks`, repurposed)
- **Deps:** §4 (esp. **§4.10 cross-lesson reader over the live snapshot**) + retrievalGrid + SumTiles +
  tripletReveal + (L2/L3 engines read-only).
- **Build:** proposed §7 — interleaved checkpoint (retrieval grid; "which waits longest?" mixed rank;
  "race or wait?" mixed; "`+1` or not?" mixed; **one re-surfaced weak node** from the §4.10 reader;
  recap+streak). `E[H]=2` is one card among many; Kac a footnote.
- **DoD (+shared):** interleaved (not blocked); the `weak-node` beat reads real cross-lesson struggle
  (`maxHintLevelByBeat`, **not** `attemptsByBeat`); milestone `first-pattern-cracked` (keep id, re-tone
  description); unlocks L5.

### 8.4 L5 — Longer Patterns & Overlap (`lesson-longer-patterns`) — transfer  [math: `plan-L6-longer-patterns.md`]
- **Deps:** §4 (esp. per-beat `pattern` + **§4.10 adaptive override**) + AutocorrelationRuler (self) +
  SumTiles.
- **Build:** proposed §8 — prediction-only opener (**the logged retrieval-opener exception** — assert L5
  is the only L2+ without one); `pattern-pick`; `coinSim` 4-state; **`overlap-ruler` concrete discovery
  first (do not cut)**; per-pattern `failure-edge` + `equation-tiles` (`maxHintLevel:2`); `guided-solve`;
  `theory-vs-sim`; `border-sum` chips→`Σ`; `overlap-compare` as articulation (`comparison`); recap with
  "Fully mastered" iff `transferAttained`.
- **DoD (+shared):** `transferAttained` only when both patterns clear setup beats without the cap; the
  §4.10 override guarantees no capped beat dead-ends; milestone `state-machine-builder`; unlocks L6.

### 8.5 L6 — The Overlap Shortcut (`lesson-overlap-shortcut`) — capstone  [math: `plan-L4-overlap-shortcut.md`]
- **Deps:** §4 + `correlation.ts` + AutocorrelationRuler (self) + SumTiles + GamblerLedger +
  TriangulationStrip.
- **Build:** proposed §9 — **`primer:exponent` gate (required, before `sum-it`)**; retrieval opener
  recalling all prior numbers; `self-overlap` ruler (concrete `2^L`; binary/CLN = `interviewNote` layer);
  `sum-it` (`6=4+2=Σ2^L`); **staged martingale** (one stream → mean(in)/mean(out) converge → then assert
  `E[T]=Σ2^L`; defer "martingale" to a note); `apply-THH`/`apply-HTH` (`maxHintLevel:2` + §4.10 override);
  `triangulation` predict-then-snap; capstone recap.
- **DoD (+shared):** `expectedWaitFair === buildAutomaton().E0` for all curated patterns; ledger payout
  matches; **exponent primer before `sum-it`** (validator-asserted); `apply-*` cannot dead-end; milestone
  `martingale-mastered` + `six-lessons-complete`; `unlocks:null`.

---

<a name="waves"></a>
## 9. Waves & dependency graph

**Wave 0 (serial):** `git status` reconcile → schema (`pattern` + `hero?`/ordering/`interviewNote` +
new variants) → `validate-fixtures` (depends on schema) → engine exports → `/dev/lesson/:id` → SimChart
linear mode → `EquationTilesBeat` assist prop + chrome reduction → `theme.ts` tokens → diagnostic wiring
→ affective/landing. *(Already-landed: per-lesson phases, `mastery.ts` compute, `track.ts`,
`DiagnosticGate`, L0 fixture/course node, de-gatekept persona — verify, don't redo.)*

**Wave 1 (parallel, disjoint new files):** `race.ts` · `walk.ts` (WalkModel) · `correlation.ts` (each +
goldens) · AutocorrelationRuler · SumTiles · retrievalGrid/tripletReveal.

**Wave 2 (parallel, one per lesson; new files only):** L0 (reconcile) · L2 (race + widgets) · L3 (walk +
bespoke widgets) · L4 (retrievalGrid/SumTiles/tripletReveal + §4.10 reader) · L5 (per-beat pattern +
ruler + SumTiles) · L6 (correlation + GamblerLedger + SumTiles + ruler + TriangulationStrip).

**Wave 3 (serial):** course `built` flags · seed · unlock chain · e2e (Track A + B per lesson; note the
L4 cross-lesson reader needs an emulator/authed path, not `/dev/lesson`) · full gate.

L0 first; then L2 (proves the race-engine + active-pattern convention) before L3's fully-bespoke walk.

---

<a name="dod"></a>
## 10. Definition of done & verification gates

**Per unit:** `tsc -b` · `eslint .` · relevant `vitest`.

**Per-lesson shared inclusivity checklist (validator-gated where mechanizable + a required copy review):**
retrieval opener present (or L5, the logged exception); ≥1 `primer` and every symbol beat preceded by its
`groundedBy` **within each track**; guaranteed early win (first graded beat low-stakes, not hardest;
Track-A openers no-penalty); every `prediction` uses `byOption`; wrong-answer hints **refute**;
lesson-specific misconceptions confronted (L3 `gamblersFallacy`, L6 `exponent` before `sum-it`); every
hero carries the `hero` block, new state/number-line heroes **dual-label + dyna-link**; reveals are
`comparison`s; **`mastered` computed + consumed by the recommender; adaptive override on every capped
beat (no dead-ends)**; de-gatekept copy + an `interviewNote` present.

**Per lesson:** `npm run validate` (schema + engine + inclusivity); golden tests; completable
**Track B + Track A**, tap-only, reduced-motion at `/dev/lesson/<id>` (e2e asserts both tracks + the CTA
gate matrix).

**Load gate (promoted from Risks):** wire `answer_submitted{hintLevel}`/reveal-rate as a load proxy
(anomalous rate ⇒ un-budgeted load to fix); plan ≥1 **real beginner playtest** (the persona selected
against beginners).

**Course-level (Wave 3):** course fixture updated (L0 node, `built` flags, de-gatekept persona + landing
subline, belonging line + relevance question or a logged deferral); seed runs; unlock chain + milestones
verified (idempotent; `three-/six-lessons-complete` fire); `build` · `vitest` · `e2e` green;
`test:rules` if rules touched.

**Commands:** `npm run validate` · `npx vitest run` · `npm run lint` · `npm run build` · `npm run e2e` ·
`npm run seed`. (macOS `npm run` quirk → call `./node_modules/.bin/...`.)

---

<a name="risks"></a>
## 11. Risks & open decisions (escalate to the human)

1. **Scope vs the gate.** L2/L6 are large. If time-boxed, ship L0 + simplest first — but inclusivity is
   now CI-gated, so trimming it **fails the build** (visible decision, not silent erosion).
2. **The working tree moves fast.** Re-verify §1 before assigning; the first draft's "blockers" were
   half-built within hours.
3. **`plan-L*` filename↔lesson offset (footgun).** `plan-L4-overlap-shortcut.md` = **L6**;
   `plan-L6-longer-patterns.md` = **L5**. Also reconcile `docs/future_ideas.md` (Overlap at L4) to the
   canonical **L6-last** order before seeding.
4. **L0 fixture vs §8.0** — shipped fixture is 5 beats/`unlocks:null`; decide whether to keep it or
   expand to the fuller §3 sequence (and whether to fire `first-heads-found`).
5. **Mastery semantics** — non-blocking + **frozen at first completion** (idempotent CF). Open: should
   the mid-course (L3) checkpoint be the one place a soft corrective re-test is gently required? And do we
   want replay to *upgrade* `mastered` (needs a CF change)?
6. **Two-track authoring cost / spectacle vs clarity / no-novices validity** — as before; the load gate +
   a beginner playtest are the mitigations.
7. **`equationDiagnosis` non-HH copy** — each new `equationTiles` lesson must author
   `mistakeHints`/`legend`/`workedExplanation` or fall back to HH defaults (a DoD line).
8. **e2e for the L4 cross-lesson reader** needs an emulator/authed path (not the Firebase-less
   `/dev/lesson`) or an injectable stub.

---

<a name="audit"></a>
## 12. Audit changelog (learning-science + tech)

**Learning-science (5 lenses):** adaptive override + mastery loop → Wave-0 §4.10 (cognitive-load +
progression + prerequisites + representations, the consensus #1); inclusivity as a **gate** via §4.4
checkable fields + §4.5 asserts + §10 DoD (all five); enforced early-win + affective on-ramp + landing +
non-punitive `needsReview` (motivation); checkable ladder/load + dual-label/dyna-link new heroes +
AutocorrelationRuler L5/L6-only + `EquationTilesBeat` chrome flag + reveals→comparisons (representations);
L3 `duration-tiles`→completion + load-proxy gate (cognitive-load); L4 interleaving + diagnostic confirmed
(progression). Memos: `audits/ideation/inclusive-research-{1..5}-*.md`.

**Tech (`audits/ideation/tech-review-build-brief.md`, sound-with-fixes):** §1.2 was stale → §1 rewritten
to the live tree (per-lesson phases, `mastery.ts`, `track.ts`, `DiagnosticGate`, L0 fixture, de-gatekept
persona already exist); **mastery persistence corrected** (client computes, **CF persists**;
`derived.mastered` frozen at first completion → re-surfacing reads the live snapshot; `attemptsByBeat`
never persisted; use existing `src/lesson/mastery.ts`); **adaptive re-prefill** needs a shared
`EquationTilesBeat` prop (Wave-0); **`buildWalk` → `WalkModel`** (not `Automaton`), `simulateWalk` tagged
outcome; **StateGraph reuse**: race ✔ / walk bespoke (money↔`P_i` not expressible); **eager-automaton
crash** → `patternOptions[0]` H/T placeholder + own-engine beats; schema **`hero?` block** (not
per-member) + `interviewNote` + `gamblersFallacy` variant for mechanizable asserts; ordering check
**within each track's visible subsequence**; **SimChart** needs a **linear** mode (axis is log); dev
route via **static import map**; `theme.ts` token **pre-stock**; `LESSON_MILESTONES` lacks
`lesson-first-heads`. Green state at review: `tsc` clean, **98 vitest**, `validate` clean.

---

<a name="provenance"></a>
## 13. Provenance
- Inclusive design + system: `docs/proposed-lessons.md`. L1 spec (foundation): `docs/l1-inclusive-redesign-spec.md`.
- Per-lesson math: `audits/ideation/plan-L{2..6}-*.md` (mind the filename offset).
- Learning-science basis + brief audit: `audits/ideation/inclusive-research-{1..5}-*.md`.
- Technical feasibility review: `audits/ideation/tech-review-build-brief.md`.
- Code state verified by reading (2026-06-24) across `src/engine/*`, `src/content/*`, `src/lesson/*`
  (incl. `mastery.ts`, `phases.ts`, `FirstSuccessTimeline`), `src/pages/{App,DiagnosticGate}.tsx`,
  `src/progress/track.ts`, `scripts/validate-fixtures.ts`, `functions/src/{index,milestones}.ts`,
  `firestore.rules`, both fixtures.
