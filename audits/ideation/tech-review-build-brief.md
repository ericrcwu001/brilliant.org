# Tech Review — `docs/build-brief-remaining-lessons.md`

**Scope.** Feasibility / soundness / completeness / consistency review of the *pre-planned
implementation* in the build brief (how to build L0 + L2–L6), checked line-by-line against the actual
source. Review only — no source or brief was modified. Green-state confirmed before review:
`tsc -b` clean; `vitest run` = **98 tests / 13 files pass**; `npm run validate` clean (see Appendix).

---

## 1. Overall verdict

**SOUND-WITH-FIXES.** The plan is broadly feasible: the engine math is correct (I re-derived the
goldens), the schema/dispatcher additions are coherent, the diagnostic/track persistence is rules-legal
and half-built already, and the inclusivity-as-a-gate thesis is achievable. There are **no
make-it-impossible blockers**, but there are several concrete corrections that must land *before*
Wave 2 fans out, two of which the brief actively gets wrong or under-scopes.

The single most important meta-finding: **§1.2 ("NOT yet built") is materially stale relative to the
working tree.** A large body of uncommitted Wave-0-ish work already exists — `phases.ts` is already
per-lesson, `mastery.ts` / `feedbackResolve.ts` / `DiagnosticGate.tsx` / `track.ts` /
`fixtures/lesson-first-heads.json` already exist, and the course fixture already carries the L0 node +
L2–L6 `built:false`. An orchestrator following §1.2 literally would re-do finished work or get
confused. The brief's **§1.1 ("already BUILT") inventory, by contrast, is accurate** — every spot-check
passed.

### Top 5 technical issues

1. **§4.10 persistence wording is WRONG, but the working tree already does the right thing.**
   `firestore.rules` puts `derived` (which holds `mastered`) in the client **deny** list
   (`firestore.rules:77-86`). So "compute & persist … client-side" is rules-illegal. The correct
   design — client *computes* `mastered`, the **Cloud Function persists it** — is already implemented
   (`LessonPlayer.tsx:109,246-253` → `functions/src/index.ts:90-111`). Fix the brief's wording and add
   the idempotency caveat (below); do **not** let a Wave-0 agent "re-add" a client write.

2. **§4.10(b) "re-pre-fill a faded row mid-beat without a remount" cannot be done with "minimal
   `LessonPlayer` wiring."** `EquationTilesBeat` computes its faded prefill **once**, in a `useState`
   initializer (`EquationTilesBeat.tsx:348-367`), reads `maxHintLevel` straight off the fixture
   (`:428`), and is **remounted on every beat change** (`LessonPlayer.tsx:339` `key={beat.beatId}`).
   Lifting the cap is fine; runtime re-prefill needs a **new imperative prop on the shared
   `EquationTilesBeat`** — i.e. a Wave-0/Foundations edit, not Wave-2.

3. **StateGraph reuse: viable for L2 race lanes, NOT for the L3 walk lattice.** `StateGraph` is a
   static (`listening={false}`), horizontally-laid-out graph keyed on `kind: advance|self-loop|reset`
   whose dual-label is `s.label` + `s.id` where `id` is `E${number}` (`StateGraph.tsx:56,111-150,
   219-249`). Race lanes are single-pattern automata → render two `StateGraph`s. The walk needs bespoke
   Konva (drag walls/bias, ~100-walker swarm, **money↔`P_i` dual-label that `StateGraph` literally
   can't express**), and a two-absorber `buildWalk` returned "Automaton-shaped" **breaks**
   `flipsToAbsorption`/`empiricalMean` (`simulate.ts:19,24-38`).

4. **`LessonPlayer` eagerly builds `buildAutomaton(patternOptions[0], 0.5)` for *every* lesson
   (`LessonPlayer.tsx:90-91`), and `BeatProps.automaton` is required (`beats/types.ts:26`).**
   `buildAutomaton` throws on any non-`/^[HT]+$/` pattern (`automaton.ts:137-139`). An L3 fixture whose
   `patternOptions[0]` isn't a valid H/T string crashes the whole lesson before a single beat renders.
   §4.3's "guard empty `patternOptions`" is necessary but insufficient.

5. **Several §4.5 inclusivity asserts are not mechanizable as written** without schema scaffolding the
   brief only half-specifies: "every **hero** carries `slowFirst`/`structuralReadout`/
   `reducedMotionFinalFrame`" needs *hero* to be schema-detectable (no such flag/typelist exists yet);
   "carries a **'For the interview'** note" has no schema field at all; "**L3 gambler's-fallacy
   primer**" isn't cleanly checkable because primer `variant` is a closed enum with no such member
   (`schema.ts:135`). Without these, the brief's central "inclusivity is a gate, not a guideline" claim
   silently degrades to "some of it is a gate."

---

## 2. Blockers (must change before building)

### B1 — §4.10 mastery persistence: correct the instruction; mind idempotency
- **Rules reality:** `progress/{lessonId}` denies the client `derived` on both create and update
  (`firestore.rules:77-86`). `mastered` lives in `derived` (`schema.ts:257-271`). Client cannot write
  it. ✔ the brief's "persist client-side / keep `completeLesson` as-is" is **Wrong** as literally
  phrased.
- **Already-correct design to preserve:** client computes `computeMastered(...)`
  (`mastery.ts:18-24`, called at `LessonPlayer.tsx:109`), passes it into `completeLesson`'s `derived`
  arg (`LessonPlayer.tsx:246-253`), and the CF's `buildDerived` writes `mastered: input?.mastered ===
  true` (`functions/src/index.ts:90-111`). So `completeLesson` is **not** "as-is" — it already had to
  learn `mastered`; that's done.
- **Caveat the brief misses:** `completeLesson` is **idempotent** — a second completion returns early
  and never re-writes `derived` (`functions/src/index.ts:146-149`). So `derived.mastered` is **frozen
  at first completion** and can never upgrade on replay. The recommender + L4 weak-node selector must
  therefore read the **live snapshot** (`snapshots/{lessonId}.interactionState.maxHintLevelByBeat`,
  `schema.ts:246`; owner-readable `firestore.rules:64`) for re-surfacing, not the frozen
  `derived.mastered`.
- **Substrate gap:** the brief says it operates "over the already-persisted per-beat data
  (`maxHintLevelByBeat`, **attempts**)." `maxHintLevelByBeat` is persisted (in snapshots), but
  `attemptsByBeat` (`schema.ts:283`) is **never written** by any function (`functions/src/index.ts`
  writes neither in `completeLesson` nor `recordQualifyingAction`). The weak-node reader can use
  `maxHintLevelByBeat`; it cannot use `attemptsByBeat` until something persists it.
- **Path nit:** the brief proposes a *new* `src/progress/mastery.ts`; it already exists at
  `src/lesson/mastery.ts`. Don't create a duplicate.

### B2 — §4.10(b) adaptive override needs a shared `EquationTilesBeat` edit (Wave 0)
- **Cap lift is feasible as-is:** `useHintLadder` recomputes `max = opts.maxHintLevel ?? 3` every render
  and `submitWrong` closes over the *current* `max` (`hintLadder`/`feedback.ts:74,118-138`), so raising
  the cap via a prop affects subsequent submits with no remount.
- **Re-prefill is NOT feasible without new code:** the faded prefill is built in the `filled` state
  *initializer only* (`EquationTilesBeat.tsx:348-367`); flipping `faded` at runtime would `locked`-out
  slots (`:342,577`) but leave them **empty**. A remount (the only current way to re-run the
  initializer) wipes the learner's in-progress tiles — exactly what the brief says to avoid.
- **Required Wave-0 change (Foundations-owned):** add an imperative assist prop, e.g.
  ```ts
  // beats/types.ts BeatProps
  hintCapOverride?: 1 | 2 | 3            // lifts useHintLadder's cap at runtime
  assist?: { prefillToLastTerm: boolean; nonce: number }  // bump nonce to re-prefill
  ```
  plus an effect in `EquationTilesBeat` that, on `nonce` change, fills `correctFill(target)` into every
  still-open slot **except** the last term, preserving learner-correct tiles, and threads
  `hintCapOverride ?? beat.maxHintLevel` into `useHintLadder` (`:428`). Because L5/L6 capped beats are
  `equationTiles`, Wave-2 authors ("new files only") cannot wire this themselves — it must be frozen in
  Wave 0 or the §4.10(b) "no capped beat dead-ends" DoD line is unenforceable.

### B3 — StateGraph/walk + `buildWalk` contract
- **Race (L2): viable reuse.** Two single-pattern automata → two `StateGraph`s driven by `nextStateOf`
  (`simulate.ts:9-17`) on one shared stream. Winner detection needs `race.ts` (`flipsToAbsorption`
  tracks one automaton only). This matches §6's RaceTrack sketch.
- **Walk (L3): bespoke Konva, not StateGraph.** `StateGraph` is static and its dual-label second line is
  hardwired to `s.id` (`StateGraph.tsx:236-248`), which must match `E${number}` (`types.ts:5`) — it
  cannot render the `$0..$N ↔ P_i/D_i` translation the brief itself calls a DoD line for L3 (§6). The
  brief's §6 already lists WalkBoard/WalkerSwarm/RuinLandscape as bespoke ("reuse the number-line
  layout"), so the plan is internally consistent — but the §6 cross-cutting rule "render via
  `StateGraph`'s `labelMode:'dual'`" only survives via its "(or an equivalent)" hedge, and that
  equivalent is **real new Konva**, not reuse. Call it out so an author doesn't try to force
  `StateGraph`.
- **`buildWalk` must NOT be "Automaton-shaped".** An `Automaton` carries `pattern`, `recurrences`,
  `substitutionSteps`, `overlapHighlights` (`types.ts:30-39`) that are meaningless for a walk, and a
  two-absorber automaton breaks the single-absorber sim helpers (`absorbingId` returns the *first*
  absorbing state via `.find`, `simulate.ts:19`; reaching the other end makes `nextStateOf` throw,
  `:14-16`). See §4 for the corrected signature.

### B4 — `LessonPlayer` eager-automaton crash for non-H/T lessons
- `LessonPlayer.tsx:90-91` builds the shared automaton unconditionally; `buildAutomaton` throws on a bad
  pattern (`automaton.ts:137-139`); `BeatProps.automaton` is non-optional (`beats/types.ts:26`).
- **Decide the Wave-0 convention (the brief leaves this implicit):** either (a) **mandate a valid H/T
  placeholder** in L2/L3 `patternOptions[0]` (L2 already has real patterns like `["HHH","THH"]`; L3 can
  use `["H"]`), and have the race/walk beats ignore the shared `automaton` and build their own — the
  `OverlapBeat` precedent (`OverlapBeat.tsx:32-35` builds its own via `patternOptions.map(buildAutomaton)`);
  or (b) make the shared build lazy and `automaton?: Automaton` optional, which ripples through every
  beat consumer. (a) is far cheaper and matches the existing precedent — state it explicitly.

---

## 3. Claim-by-claim table

Status legend: **Sound** / **Risky** (works but the brief understates effort or a caveat) / **Wrong**
(contradicted by code) / **Missing** (brief assumes something absent).

### Pressure-test 1 — §1.1 "already built" inventory
| Brief claim (§1.1) | Status | Evidence | Note / fix |
|---|---|---|---|
| Schema variants `primer`/`mcq`/`byOption`/`EquationCopy`/`faded`/`track`/`density`/`mastered` | **Sound** | `schema.ts:133-146` (primer/mcq), `:161-167` (byOption), `:66-75` (EquationCopy), `:56` (faded), `:180,182` (track/density), `:269` (mastered) | All present exactly as described. |
| `LessonPlayer` track + density + maxHintLevel high-water | **Sound** | `LessonPlayer.tsx:38,56-62,103,77-79,123-134` | High-water via `bumpMaxHintLevel` (`mastery.ts:29`). |
| PrimerBeat/McqBeat/FirstSuccessTimeline/DiagnosticGate exist | **Sound** | `beats/index.tsx:59-62`; `FirstSuccessTimeline` wired through `PrimerBeat.tsx:11,90` (variant `average`), not a standalone beat type | FirstSuccessTimeline is a sub-widget, not an interaction — fine, but note it for §8.0. |
| StateGraph dual-label + dyna-link + shrinks n>4 | **Sound** | `StateGraph.tsx:52` (radius/n>4), `:234-249` (dual), dyna-link driven by `highlight` from `EquationTilesBeat.tsx:477-485,658` | "dyna-link" lives in the beat, using StateGraph's `highlight` prop. |
| De-hardcoded EquationTilesBeat (copy via fixture) | **Sound** | `EquationTilesBeat.tsx:65-134` (defaults + `resolveEqCopy` overrides) | Chrome-reduction is *partly* there (staged "Now your turn" `:565`), but the §6 "simultaneous chrome" complaint still largely holds (legend+build+palette appear together once `buildShown`). |
| Backend `completeLesson`/milestones/seed | **Sound** | `functions/src/index.ts`, `milestones.ts:14-42` | Matches. |

### Pressure-test 2 — Engine exports (§4.1) + new engines (§5)
| Item | Status | Evidence | Note / fix |
|---|---|---|---|
| `prefixFunction`/`solveLinearSystem` are private; export them | **Sound** | `automaton.ts:60,110` (no `export`); only `buildAutomaton` exported `:136` | Trivial. Note `src/engine/index.ts` barrel was deleted (git status) — add exports directly on `automaton.ts`. |
| `race.ts` reuses KMP; `penneyOdds('HHH','THH')=7:1` | **Sound** | KMP via `prefixFunction`; 7:1 is the classic THH-beats-HHH result | Return `Rational` matches engine. `simulateRace` genuinely needs its own sim (shared-stream, two absorbers) — `flipsToAbsorption` can't. ✔ brief correct. |
| `walk.ts` solves P (no +1, bndry 1·0) and D (+1, bndry 0) twice | **Sound (math)** | goldens re-derived exact: fair N=4 → P=[¼,½,¾], D=[3,4,3]; biased p=0.4,i=2,N=4 → P=4/13, ruin 9/13, D=50/13 (`solveLinearSystem` handles rationals incl. r=1) | Math is correct and exactly representable. **But return shape is Wrong** — see B3 / §4. |
| `buildWalk` returns "Automaton-shaped band" | **Wrong** | `simulate.ts:19,24-38`; `types.ts:30-39` | Two absorbers break `flipsToAbsorption`/`empiricalMean`; Automaton fields meaningless. Use a dedicated `WalkModel`. |
| "reuse StateGraph geometry/dual-label/dyna-link" for walk/race | **Risky** | `StateGraph.tsx:56,219-249` | Race lanes: yes. Walk lattice: no (bespoke; money↔`P_i` not expressible). See B3. |
| `correlation.ts`: `expectedWaitFair === buildAutomaton().E0` | **Sound** | re-derived: Σ2^(self-overlap len) = 2·CLN₂(self): HH=6,HT=4,THH=8,HTH=10,HHH=14 — all equal `expectedTimes.E0` | Cross-check golden is valid and cheap. |

### Pressure-test 3 — Schema / dispatcher coherence (§4.4)
| Item | Status | Evidence | Note / fix |
|---|---|---|---|
| Add ~10 union variants + dispatcher stubs | **Sound** | `InteractionSchema` is a closed `discriminatedUnion` (`schema.ts:88-147`); dispatcher has a `ContinueStub` default (`beats/index.tsx:70`) | New members + cases are additive; unknown types already fall through to a stub. |
| `sumTiles` must be its own variant (TileSchema can't express Σ2^L/biased) | **Sound** | `TileSchema` is closed: prob ∈ `{'1/2','p','1-p'}`, const ∈ number (`schema.ts:34-47`) | Confirmed — cannot express `2^L` chips. Own variant is correct. |
| `retrievalGrid` own variant vs reuse `mcq` | **Risky** | `mcq` is single-select `options:[{id,label,correct}]` (`schema.ts:141-146`) | Reuse `mcq` for single-select recall; a true *matching grid* (n×n pairing) exceeds that shape → own variant. The brief's "(or reuse mcq)" hedge is acceptable; recommend own variant for matching. |
| Place load fields on the **interaction**, ordering tags on the **beat** | **Risky** | discriminated union members can't share fields without repeating on each member | A per-interaction `slowFirst`/`structuralReadout`/`reducedMotionFinalFrame` must be added to *each* hero member (or a shared sub-object). **Cleaner:** one optional `hero?: {…}` block on `BeatSchema`, validator-gated when `interaction.type ∈ heroTypes`. This *also* fixes "how does the validator know it's a hero" (P-test 6). Ordering tags on `BeatSchema` are fine and `validate-fixtures` can read both (it parses whole `LessonSchema`). |

### Pressure-test 4 — Mastery + adaptive-fade engine (§4.10) — highest risk
| Sub-item | Status | Evidence | Note / fix |
|---|---|---|---|
| (a) `mastered` computable client-side | **Sound** | `mastery.ts:18-24`; `LessonPlayer.tsx:109` | Already built & tested (`mastery.test.ts`). |
| (a) persist client-side / "keep `completeLesson` as-is" | **Wrong** | `firestore.rules:77-86` deny `derived`; CF already writes it `functions/src/index.ts:90-111` | Client computes, **CF persists**. See B1. |
| (a) idempotency / replay upgrade | **Missing** | `functions/src/index.ts:146-149` early-return | `derived.mastered` frozen at first completion; re-surfacing must read live snapshot. See B1. |
| (b) lift `maxHintLevel` cap at runtime | **Sound** | `feedback.ts:74,118-138` | Prop-driven cap lift works without remount. |
| (b) re-pre-fill a faded row without remount | **Wrong/under-scoped** | `EquationTilesBeat.tsx:348-367,342,339(key)` | Needs new imperative prop + Foundations edit. See B2. |
| (c)/(d) cross-lesson struggle reader | **Sound (with cost)** | snapshots + progress owner-readable (`firestore.rules:64,76`); `maxHintLevelByBeat` in snapshots (`schema.ts:246`) | Feasible: ≤6 `getDoc`s (or a collection query). Use `maxHintLevelByBeat`, **not** `attemptsByBeat` (never persisted). Not testable on the Firebase-less `/dev/lesson`. |

### Pressure-test 5 — Per-lesson phases (§4.2) + active-pattern (§4.3)
| Item | Status | Evidence | Note / fix |
|---|---|---|---|
| `phases.ts` is a flagship singleton that throws | **Wrong (stale)** | already per-lesson: `LESSON_PHASES`/`configFor` (`phases.ts:56-63`), L0 `FIRST_HEADS` config (`:44-54`); `getRail` handles unknown current beats off-rail (`:88-94`) | §4.2 is effectively **done** in the working tree. Inner `phaseOf` (`:84`) only runs over `railBeatIds`, so it can't throw. Keep the `phases.test.ts` regression. |
| Add `pattern?: string` to `BeatSchema`; beat drives the right engine | **Risky** | `BeatSchema` has **no** `pattern` field today (`schema.ts:170-183`); `OverlapBeat` precedent (`OverlapBeat.tsx:32-35`) | Field still needs adding. The "beat builds its own automata" convention is sound (OverlapBeat proves it). |
| L2/L3 beats bypass the shared `automaton` prop | **Sound (recommended)** | `LessonPlayer.tsx:90-91` builds one shared automaton; race/walk should ignore it like OverlapBeat | Combine with B4: keep `patternOptions[0]` a valid H/T placeholder so the shared build doesn't throw. |

### Pressure-test 6 — `validate-fixtures` generalization (§4.5)
| Item | Status | Evidence | Note / fix |
|---|---|---|---|
| Generalize to every `lesson-*.json` + per-lesson engine cross-check | **Sound** | current script hardcodes `buildAutomaton('HH')` (`validate-fixtures.ts:58`) and the flagship file list (`:34-41`) | Iterate fixtures; per `equationTiles` beat, `buildAutomaton(beat.pattern ?? patternOptions[0], 0.5)` then compare `row.target`. **Depends on §4.3's `pattern` field.** |
| "graded retrieval opener present (except L5)" | **Sound** | scan first-N beats for `mcq`/`retrievalGrid` | Mechanizable. |
| "≥1 primer; `introducesSymbol` preceded by `groundedBy`" | **Risky** | needs §4.4 tag fields | Mechanizable *but* raw fixture order is necessary-not-sufficient: a Track-A grounding beat (`track:'A'`) won't precede a `track:'both'` symbol beat **for Track-B learners**. Assert order **within each track's visible subsequence** (apply the same filter as `LessonPlayer.tsx:56-62`). |
| "every `prediction` uses `byOption`" | **Sound** | `FeedbackSchema` union (`schema.ts:156-168`) | Check the feedback shape per prediction beat. |
| "every **hero** carries `slowFirst`/`structuralReadout`/`reducedMotionFinalFrame`" | **Missing** | no hero flag/typelist in schema; fields not in `InteractionSchema` yet | Not mechanizable until "hero" is schema-encoded. Add the `hero?` block (P-test 3 fix) + a `HERO_TYPES` allowlist in the validator. |
| "a 'For the interview' note present" | **Missing** | no schema field exists | Add a field (e.g. `interviewNote?: string` on `BeatSchema` or a `primer` body convention) or this assert is unverifiable. |
| "L3 gambler's-fallacy primer; L6 exponent primer before `sum-it`" | **Risky** | primer `variant` enum (`schema.ts:135`) has `exponent` but no gambler's-fallacy member | L6 exponent-before-`sum-it` is checkable (variant + index). L3's is **not** cleanly checkable (would be `variant:'custom'` + freeform body); either add a `gamblersFallacy` variant or assert only structural presence. |

### Pressure-test 7 — SimChart (§4.7), dev route (§4.6), course/milestone (§4.9), diagnostic (§4.8), affective/landing (§4.11)
| Item | Status | Evidence | Note / fix |
|---|---|---|---|
| `SimChart` hardcodes `yLo=2`; parameterize + `[0,1]` mode | **Risky** | y-axis is **logarithmic** (`SimChart.tsx:44,47-51`); `yForC` clamps to `yLo` | `[0,1]` win/ruin-rate needs a **linear-scale branch** (log can't show <1), not just a `yLo` param. Real second mode; feasible. |
| Dev route `/dev/lesson/:lessonId` | **Missing** | `App.tsx:128-132` loads the flagship only; no `:lessonId` parse | Add a dev branch that maps `lessonId → fixtures/lesson-<id>.json`. Fixtures live in `/fixtures` (not `/public`); `loadFlagshipLesson` imports JSON directly — add a small static import map (a runtime `fetch` won't find them). |
| Course/milestone scaffold | **Sound (partly done)** | course fixture already has L0 `optional:true` (`course-…json:9-16`), L2–L6 `built:false` | `LESSON_MILESTONES` (`milestones.ts:14-21`) has **no** `lesson-first-heads` entry → completing L0 awards no lesson milestone. Consistent with "optional," but to actually fire `first-heads-found` you'd add the entry. |
| Diagnostic wiring + persist `track` | **Sound (rules-legal)** | `track` is NOT in the deny-list (`firestore.rules:77-86`); `track.ts:31-37` already `setDoc` merges on `progress/{courseId}` | `DiagnosticGate.tsx` built but unwired into `GuardedRoutes` (`App.tsx:98-105`). Only the entry-flow wiring remains. |
| Affective on-ramp / landing subline ownership | **Sound** | course `persona`/`description` already de-gatekept (`course-…json:4-5`) | The "landing subline" lives in `LandingPage` (not read here) — confirm it isn't left unowned between this brief and the L1 spec, per §4.11. |

### Pressure-test 8 — Waves (§9) + file-ownership (§3)
| Item | Status | Evidence | Note / fix |
|---|---|---|---|
| Wave ordering (0→1→2→3) | **Sound** | dependencies trace correctly | One hidden coupling: §4.5 validator generalization depends on §4.3's `pattern` field; both are Wave 0 (same agent, serial) so fine. |
| "Wave-2 authors create new files only" | **Risky** | `theme.ts` is a fixed shared palette (`theme.ts:6-33`); convention forbids inline hex (§7.4) | New heroes (race lanes A/B, heatmap gradient, ruin/win, swarm) will likely need new tokens → a `theme.ts` edit Wave-2 can't make. **Pre-stock `theme.ts` tokens in Wave 0**, or explicitly allow Foundations-routed additions. Same risk for `EquationTilesBeat` chrome-reduction (already Foundations) and the B2 assist prop. |
| `plan-L*` numbering vs brief L-numbers | **Risky (footgun)** | `plan-L4-overlap-shortcut.md` = brief's **L6**; `plan-L6-longer-patterns.md` = brief's **L5** | The brief cross-references correctly per packet, but an agent told "build L6" must open `plan-L4-…`. Call it out loudly (it's the §11.3 ordering conflict). |

### Pressure-test 9 — Anything missing
| Item | Status | Evidence | Note / fix |
|---|---|---|---|
| Konva swarm (~100 walkers), no per-frame React state | **Sound (highest-risk widget)** | precedent: imperative `Konva.Animation` + refs (`StateGraph.tsx:76-87`); "never per-frame" rule (`CoinSimBeat.tsx:5-6`) | Achievable with **one** animation loop mutating node refs; do NOT drive 100 positions through React state. |
| `'use no memo'` on new Stage files | **Sound** | required directive present on every Stage file (`StateGraph.tsx:1`, `SimChart.tsx:1`) | Reiterate for every new Konva hero. |
| e2e for new lessons | **Risky** | `/dev/lesson` is the e2e entry (`App.tsx:125-132`) | New-lesson e2e depends on §4.6. The L4 cross-lesson reader (B1) can't run on the Firebase-less dev route — needs an emulator/authed path or an injectable stub. |
| §8.0 L0 fixture matches the §8.0 build list | **Wrong** | actual L0 = prediction→primer:half→coinSim→primer:average→mcq (5 beats, `unlocks:null`, `optional:true`) (`lesson-first-heads.json`) vs brief's prediction→primer:half→FirstSuccessTimeline→StateGraph(dual)→equationTiles→recap (~6, `unlocks:lesson-pattern-hitting-times`) | L0 is **built but different**. Also brief's `unlocks: lesson-pattern-hitting-times` **contradicts** the optional/ungated design (`schema.ts:207-208`: optional never locks its successor). Reconcile the brief's §8.0 to the shipped fixture (or change the fixture deliberately). |

---

## 4. Engine-contract corrections (signatures)

**`walk.ts` — replace "Automaton-shaped" with a dedicated model:**
```ts
// src/engine/walk.ts
import type { Rational } from './types'

export type WalkModel = {
  N: number
  p: Rational; q: Rational            // exact; q = 1 - p
  ruinProb: Rational[]                // P_i = P(hit 0 before N), i = 0..N  (bndry 0,0 … 0,1? see below)
  reachProb: Rational[]               // 1 - ruinProb (reach N first)
  duration: Rational[]                // D_i, i = 0..N
}
export function buildWalk(N: number, p: number): WalkModel
// reachProb: solve P_i = p·P_{i+1} + q·P_{i-1}, P_0 = 0, P_N = 1  (homogeneous; "no +1, boundary 1·0")
// duration: solve D_i = 1 + p·D_{i+1} + q·D_{i-1}, D_0 = D_N = 0  ("+1, boundary 0")
// both via solveLinearSystem over Rational (handles r = q/p = 1 directly)

export function simulateWalk(
  i: number, N: number, p: number, rng: () => number,
): { end: 'ruin' | 'win'; steps: number }   // NOT `0 | 'N'` — use a tagged outcome
export function batchWalkStats(
  i: number, N: number, p: number, rng: () => number, trials: number,
): { ruin: number; win: number; meanSteps: number }

// OPTIONAL, only if you want StateGraph to draw the band — return a *partial* shape,
// never a real Automaton (don't feed it to flipsToAbsorption/empiricalMean):
export function walkToGraph(w: WalkModel): { states: AutomatonState[]; transitions: Transition[] }
```

**`race.ts` — return shapes are fine; one note:**
```ts
export function buildRaceAutomaton(a: string, b: string, p: number): RaceAutomaton
export function penneyOdds(a: string, b: string): { aBeatsB: Rational; bBeatsA: Rational }
export function simulateRace(a: string, b: string, p: number, rng: () => number): 'A' | 'B'
// `simulateRace` MUST advance two KMP states on ONE shared flip stream until either matches —
// it cannot be expressed via simulate.ts's single-automaton flipsToAbsorption. ✔ brief correct.
```

**`EquationTilesBeat` (shared, Wave 0) — adaptive assist:** see B2 prop sketch.

---

## 5. Sequencing / feasibility notes

- **Reconcile §1.2 against the working tree first.** Treat as already-done: per-lesson `phases.ts`
  (§4.2), `mastery.ts` (§4.10a compute), `DiagnosticGate`/`track.ts` (§4.8 minus wiring), L0 fixture +
  course node (§4.9 minus the milestone-table entry), `feedbackResolve`. Wave 0's real remaining work is
  the **schema fields** (§4.3 `pattern`, §4.4 hero/ordering/`hero?` block), the **§4.5 validator
  generalization + inclusivity asserts** (with the gaps in P-test 6), the **B2 assist prop**, the
  **B4 eager-automaton decision**, **SimChart linear mode** (§4.7), **`/dev/lesson/:id`** (§4.6),
  **engine exports** (§4.1), **EquationTilesBeat chrome reduction**, and **theme.ts token pre-stock**.
- **Wave-0 internal order:** schema (`pattern` + hero/ordering fields) → validator (depends on them) →
  engine exports → dev route → SimChart → assist prop / chrome reduction. The diagnostic wiring and
  affective/landing copy are independent and can go last.
- **Wave 1 is genuinely parallel** (race/walk/correlation are disjoint new files; widgets disjoint).
  Golden cross-checks against `buildAutomaton` are all valid and cheap (verified).
- **Wave 2 file-ownership holds EXCEPT** for shared-file pressure: `theme.ts` tokens, the
  `EquationTilesBeat` assist prop, and any new dual-label need. Resolve all three in Wave 0 so no Wave-2
  author is forced to edit a shared file.
- **Wave 3 e2e:** depends on §4.6; L4's cross-lesson reader needs an emulator/authed path (not
  `/dev/lesson`).
- **L0/L2 priority is fine.** L0 is essentially shippable already (verify/adjust the §8.0 mismatch). L2
  (race) is the first real new-engine + StateGraph-reuse lesson and a good proof of the active-pattern
  convention before L3's fully-bespoke walk.

---

## Appendix — green-state confirmation (read-only)
- `./node_modules/.bin/tsc -b` → exit 0, no diagnostics.
- `./node_modules/.bin/vitest run` → **98 passed / 98**, 13 files.
- `npm run validate` → all fixtures valid; `E[H]=2` golden + HH recurrence cross-check pass.
- Git: working tree carries large uncommitted Wave-0-adjacent changes; `docs/build-brief-remaining-lessons.md`,
  `fixtures/lesson-first-heads.json`, `src/lesson/{mastery,feedbackResolve,FirstSuccessTimeline}.*`,
  `src/lesson/beats/{McqBeat,PrimerBeat}.tsx`, `src/pages/DiagnosticGate.tsx`, `src/progress/track.ts`
  are **untracked** — i.e. the brief's "current state" predates them.
