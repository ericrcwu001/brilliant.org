# Learning-Science Overhaul — Master Plan & Shared Contracts

This directory is the implementation plan for turning the learning-science strategy in
[`docs/brainlift-learning-science-brilliant-quant-prep.md`](../brainlift-learning-science-brilliant-quant-prep.md)
into shipped product changes for **Ergo**.

It mirrors the house style of [`docs/capstone-interview/`](../capstone-interview/README.md): **this README is
the hub** — it carries the corrected premises, the locked design decisions, the shared data contracts, the file
map, and the dependency/sequencing graph. Each `spec-*.md` is self-contained for its own scope and **links back
here rather than duplicating** the shared contracts.

> **If you are a fresh Claude Code session picking this up:** read §0–§4 of this file in full before opening any
> spec. The spec you implement assumes the foundations in §4 already exist (or are being built in the same
> sequence). Do **not** trust the brainlift's claims about the code — read §1 first; several of its "build on
> existing X" premises are false, and building on them produces dead-on-arrival code.

---

## §0. How to use this plan

1. Read §1 (corrected premises) and §3 (locked decisions) — they are the non-negotiable frame.
2. Find your spec in the §6 index. Note its **Phase** and its **Depends-on**.
3. Read §4 (shared contracts) for the exact schema/Firestore/file shapes your spec consumes or extends. **The
   shared contracts are authoritative** — if a spec and this README disagree on a field name or shape, this
   README wins; fix the spec.
4. Read §8 (foolproofing checklist) — every spec must respect every applicable item.
5. Build foundation-first. A Phase-1 or Phase-2 spec whose Phase-0 dependency is unbuilt must **stop** and build
   (or coordinate building) the foundation first, not stub it.

**Verification is part of every spec.** Each spec ends with a "Definition of Done" that includes passing tests
(`./node_modules/.bin/vitest run`), `tsx scripts/validate-fixtures.ts`, and `./node_modules/.bin/eslint .`
on touched files. Use the `/dev/*` routes (no Firebase/Java needed — see `AGENTS.md`) for manual UI checks.

---

## §1. CRITICAL — The brainlift describes a codebase that partly does not exist

The brainlift is an excellent learning-science strategy and a **poor map of the code**. Every claim of the form
"build on existing X" was checked against the source. Build on the **Reality** column, never the brainlift's
premise.

| # | Brainlift premise | Reality (verified) | Consequence for the plan |
|---|---|---|---|
| 1 | "Build on existing `selectWeakNode`/`recommendReview`; Ergo has the skeleton of a spaced scheduler." | `selectWeakNode` (`src/progress/recommend.ts:66-81`) and `recommendReview` (`:89-98`) exist, are pure and tested, but are **never called** in the live app. The Study Desk uses `recommendedAction` (`src/pages/studyDesk.model.ts:118-145`), which does **not** touch `recommend.ts`. There is **no time axis** anywhere. | The SR work includes writing the recommender's **first call site**. There is no scheduler skeleton — Foundation A is net-new. |
| 2 | "Mastery is read off the same first-try session." | **Two sources of truth.** `derived.mastered` (progress doc, frozen at completion, only upgrades silver→gold — `functions/src/index.ts:154-158`) drives the medallion tier. The recommender separately reads the **live** `maxHintLevelByBeat` snapshot. | Any mastery change must preserve both reads (see foolproofing R2) or it silently breaks the medallion gallery or the re-test loop. |
| 3 | "Re-point the streak to count retrieval reps, not lessons." | The streak **already** counts required-beat completion (not lessons), once per local day (`functions/src/index.ts:225-279`, `functions/src/streaks.ts`). There is **no "retrieval rep"** concept — only `required` vs `optional`. | We build a retrieval-rep taxonomy as **plumbing only**; the streak behavior is **unchanged** (Decision 10). |
| 4 | "Remove the reset-to-zero loss-aversion penalty." | The streak resets to **1**, not 0 (`functions/src/streaks.ts:53-54`; tests assert it). | No change. The premise was wrong. |
| 5 | "Gate medallions on delayed transfer." | Medallions are awarded **instantly** on completion (`functions/src/milestones.ts:71-131`, `index.ts:203-213`). No delay, no transfer gate exists. | Delayed-transfer gold is **net-new** infra (async mint days later). It is folded into the honest-mastery mechanism (Decision 7). |
| 6 | "Make the mock brutal by default." | `tierFloor` already defaults to `'hard'` (`functions/src/interviewDraw.ts:17-19`); the live mint passes no floor (`interview.ts:212`) so hard/harder/brutal mix equally. There is **no tier-aware rubric scaling** — a brutal question is graded by the hard rubric, deflating the score. | Brutal is a **Track-B/quant default**, not global. Tier-aware rubric scaling is a **correctness bug fix** for all tracks (Decision 9). |
| 7 | "Capture confidence; score a Brier stat." | **No confidence field exists anywhere** (not in `prediction`, snapshot, `ProgressDerived`, or the interview attempt). Brier is never computed. `predictionDeltaInitial` is an L1 distance, stored but never read. | Confidence is Foundation C — net-new. |
| 8 | "Make a label-stripped Mixed Floor the home surface." | Home is the `ConceptCatalog` (`src/App.tsx:144-147`); per-concept is a linear spine. No Mixed Floor, no label-stripping, no cross-concept queue. | Mixed-Floor-as-home is **deferred**; v1 ships a Daily Review hero on the existing home (Decision 8). |
| 9 | "Tag every problem with a hidden deep-structure schema id." | `BeatSchema` (`src/content/schema.ts:608-652`) has **no `schemaId`/`methodTag`**. | `schemaId` is Foundation B — net-new, with an extensible registry + tagging pipeline. |
| 10 | "`patternPick` reuses byOption refutation for a which-method gate." | `patternPick` (`schema.ts:122-131`) is **ungraded and has no `byOption`**. Only `prediction` has `byOption` (`schema.ts:594-606`). | The which-method gate is built on **`prediction`**, never `patternPick` (Decision 12, foolproofing R11). |
| 11 | "ADR-0006 onboarding is not built." (from the doc survey) | **Onboarding IS built.** `OnboardingSurvey.tsx` exists; `userDoc` stores `learningGoal:'interview'\|'school'\|'intuition'\|'curious'` and `comfortLevel`; `comfortToDefaultTrack` routes A/B (`src/pages/onboarding.model.ts:13-14`). | Interview-date capture and intensity-gating are **cheap additions** to shipping machinery (Decision 13). |

**The four load-bearing absences** (everything else depends on them): a **time axis**, a **`schemaId`** tag, a
**confidence** field, and a **retrieval-rep** taxonomy. They are §4's Foundations A–D and Phase 0 of the plan.

---

## §2. Thesis (one paragraph)

Quant-interview readiness is durable, transferable, under-pressure retrieval — not comprehension. Ergo today
optimizes in-session fluency, which is an unreliable — and often misleading — proxy for durable readiness
(immediate performance and long-term retention are dissociable; desirable difficulties depress in-session fluency
while improving retention; cf. Soderstrom & Bjork 2015). This plan inverts that: spaced
problem-level retrieval (SM-2, interview-date-anchored), interleaving by hidden **method**, honest **delayed**
mastery, calibration as a first-class signal, a desirable-difficulty governor, and an interview report that
feeds forward instead of judging the person. All aggressive moves are **two-track**: gentle by default, brutal
for the quant audience.

---

## §3. Locked decisions (grill-me outcomes — authoritative)

| # | Decision | Resolution |
|---|---|---|
| D1 | **Plan shape** | Foundation-first, full program, phased. Deliverable = this README + phase-grouped `spec-*.md`. |
| D2 | **Persona & intensity** | **Two-track.** Track A = gentle default (scaffolds on, gamification intact, mock = `hard`). Aggressive inversions (50–70% governor, failure-first *(failure-first sequencing is named as a quant-intensity property but is explicitly OUT OF SCOPE for v1 — see §7)*, brutal mock, calibration-forward report) gate on **Track B `OR` `userDoc.learningGoal === 'interview'`**. Call this the **quant-intensity gate** throughout. |
| D3 | **SR atomic unit** | **Problem (graded beat) level**, with a hidden **method tag** (`schemaId`) on each graded problem. The queue re-asks specific due problems, interleaved, labels hidden; weakness is also indexed by method. |
| D4 | **Scheduling model** | **SM-2** (init ease 2.5, ease floor 1.3; wrong → interval resets to 1d *and* ease −0.20; right → ease +0.10, interval ×ease). **Plus interview-date anchoring**: cap `dueAt` to never exceed the target date, force a final review into the last 3 days, ramp queue volume as the date nears. SM-2 constants are **untuned — revisit with real retention data.** The retention-data feedback loop that tunes these constants is owned by **spec-04**; constants ship as placeholders and are re-tuned per spec-04's process. SM-2 was an explicit decision over fixed-interval/Leitner; with binary pass/fail the ease factor degenerates toward an expanding-interval ladder, so the v1 fallback if constants prove unstable is a **Leitner ladder behind the same `nextSchedule()` seam**. |
| D5 | **Method taxonomy** | **Hybrid, extensible controlled-vocabulary registry.** Cross-domain methods shared; domain-specific added per concept. Tagging baked into the **lesson-factory skill** (every new graded beat must declare a `schemaId`); a one-time agent-assisted **backfill** of existing content; the fixture **validator** flips to *require* a valid `schemaId` on graded beats once backfill completes. |
| D6 | **Confidence capture** | On graded **checkpoints** (mastery challenge, which-method gate, spaced-review problem) **and** the interview. **Not** on teaching beats. **Track-aware**: Track B sees it + a celebrated calibration score; Track A light/off. The qualitative opening bet is exempt. |
| D7 | **Honest mastery** | Hints used while learning are **forgiven** (no longer bar gold). **Gold/mastered is gated on a delayed (≥1 day) success** via the SR system: **Track A** = re-retrieve the *same* checkpoint problem cold; **Track B** = solve a held-out **transfer** problem (fresh surface, same method). **Silver awards instantly** on completion; **gold mints asynchronously** when the delayed check passes. This single mechanism **is** "honest mastery (#2)" + "transfer-gated medallions". |
| D8 | **Home surface** | **Daily Review queue as a hero on the existing home**, catalog stays home. The interleaved, label-stripped queue (with the which-method gate inside) is the recommended daily action. **Mixed-Floor-as-home is deferred** to a later Track-B phase (`spec-20` documents it as Phase-Next, not built now). |
| D9 | **Difficulty** | **Light bounded auto-governor** for the quant-intensity gate: rolling success over recent **retrieval reps** nudges toward a desirable-difficulty target (acts below ~50% / above ~85%; ~50–70% is the heuristic target band, **UNTUNED** — re-tuned per spec-04). The governor modulates **SCAFFOLDING only** (fade density + hint cap), never retrieval volume or spacing. **Track A static.** **Tier-aware rubric scaling = bug fix (all tracks).** **Brutal mock default for the quant-intensity gate**, `hard` for Track A. |
| D10 | **Streak** | **Unchanged behavior.** Build the **retrieval-rep taxonomy** as plumbing for the governor, calibration, and analytics; an optional informational "retrieval reps" stat is allowed; the streak number is **not** re-based. |
| D11 | **Hire signal** | **Removed entirely.** The interview report becomes feed-forward "next fix" cards + a predicted-vs-measured **calibration** delta. No Strong-No→Strong-Yes verdict anywhere. **Supersedes the hire-signal parts of ADR-0008** (see ADR-0010). |
| D12 | **Calibrate vs discrimination** | `DiagnosticGate` (the "Quick check") **stays a prerequisite gate** (foundational fluency → Track A/B). Method **discrimination** is a *separate* which-method gate built on the `prediction` beat, living in the queue + designated in-lesson checkpoints. Never overload Calibrate; never use `patternPick`. |
| D13 | **Interview-date capture** | One optional **target interview date** field added to the existing `OnboardingSurvey` (and editable in Profile). Stored on `userDoc`. Drives D4 anchoring. Intensity-gating uses existing `learningGoal`/track — no new gate field needed. |
| D14 | **SR write-path** | Client computes "what's due" by reading review state and comparing `dueAt` to `now`. Review scheduling state is **Function-written** (Firestore rules forbid client writes to progression). **No scheduled Cloud Function / push notifications in v1** (noted as future). **Risk:** with no return-trigger, delayed gold can never mint for a non-returning user (a motivation cliff between instant silver and never-earned gold). v1 mitigation is **in-app only** (Daily Review hero + silver tooltip); an active re-engagement channel (push/email digest) is explicit future work. |
| D15 | **Transfer-problem content** | In scope as its own workstream (`spec-24`): ~1 held-out transfer problem per lesson (~48 lessons) for the Track-B gold gate, authored via a lesson-factory update. Cost is called out. |
| D16 | **Housekeeping** | Mark the older `docs/brainlift-learning-science-quant-prep.md` superseded; annotate the mis-numbered `audits/ideation/plan-L4-overlap-shortcut.md` (actually L6) and `plan-L6-longer-patterns.md` (actually L5); add ADR-0009 (SR + honest-mastery architecture) and ADR-0010 (hire-signal removal); update `CONTEXT.md`. |
| D17 | **Rollout posture** | Net-new runtime behaviors (SR queue, async gold-mint, difficulty governor, brutal mock) ship behind a **runtime flag** with a **holdout cohort** and **per-feature kill switch** — owned by `spec-05`; `isQuantIntensity` is the integration chokepoint (mirrors how D14 locked no-scheduled-Function). |

---

## §4. Shared contracts — the four Tier-0 foundations

These shapes are **authoritative**. Foundation specs (`spec-00`–`spec-03`) implement them; logic/surface specs
consume them. Do not invent variant field names.

### Foundation A — Time axis / SR scheduling state (`spec-01`)

Problem-level SM-2 cards, **Function-owned** (they gate gold mastery, so must be trusted; mirrors the
milestones/streaks/interview write pattern in `firestore.rules`).

```
users/{uid}/reviews/{cardId}          // cardId = `${lessonId}__${beatId}`
{
  lessonId:       string
  beatId:         string
  conceptId:      string              // = courseId; denormalized for cross-concept queue queries
  schemaId:       string              // method tag (Foundation B); denormalized for method-weakness + interleave
  track:          "A" | "B"           // which gold gate applies (re-retrieve vs transfer)
  dueAt:          Timestamp           // client compares to now to build the queue
  intervalDays:   number
  easeFactor:     number              // SM-2; init 2.5, floor 1.3
  reps:           number              // consecutive passes
  lapses:         number
  lastResult:     "pass" | "fail" | null
  lastConfidence: number | null       // last confidence captured on this review (D6 third capture site); fed to calibration (spec-12)
  isTransfer:     boolean             // true iff this card is a held-out transfer problem (beat.heldOut===true); gates Track-B gold (spec-11)
  suspended:      boolean             // true once gold reached via transfer (maintenance cadence only)
  createdAt:      Timestamp
  updatedAt:      Timestamp
  lastReviewedAt: Timestamp | null
}
```

**Card-creation predicate (authoritative — resolves gate Issue #1).** `writeCardsForCompletion` (spec-01)
creates a card for **every graded-required beat AND every `heldOut` transfer beat** (transfer beats are
`required:false`, so a `gradedRequiredBeatIds`-only predicate would never create them and Track-B gold could
never mint). On a transfer card set `isTransfer:true` and `track:'B'`. This makes spec-01 read
`BeatSchema.heldOut` → a real **spec-01 → spec-24 dependency** (reflected in §7).

**`submitReview` callable signature (authoritative — resolves gate Issue #2/#7; SERVER-GRADED per R13).** One shape
only: `submitReview({ cardId: string; answer: <beat-answer payload>; confidence?: number })`. The client sends the
learner's **raw answer**, NOT a pass/fail — the server loads the card's beat (`cardId = lessonId__beatId`), grades
`answer` against the fixture accept-list (reuse `loadLesson`), and derives `result: 'pass'|'fail'` itself (R13). A
client cannot mint gold by asserting a pass. **spec-01 owns** the callable declaration + server-grading + card
creation in `functions/src/review.ts`; **spec-10** fills the SM-2 advance body (which consumes the *server-derived*
`result`); **spec-11** adds the gold-mint branch. `confidence` is optional (the Daily-Review surface passes it per
D6; it lands in `lastConfidence`). No `{lessonId,beatId}` and **no client `result`** variant — the client derives
`cardId = \`${lessonId}__${beatId}\`` and may grade locally only for instant UX, never authoritatively.

- **userDoc additions** (`src/auth/userDoc.ts`): `targetInterviewDate?: string` (YYYY-MM-DD; client-writable; D13).
- **Pure SM-2 module** `src/progress/scheduling.ts`: `nextSchedule(card, result, { now, targetDate? }) → {dueAt, intervalDays, easeFactor, reps, lapses}` — the 3rd arg is an opts object whose `now` is a **required** server-supplied `Date` (spec-01 §4 `NextScheduleOpts`). Anchoring/capping logic lives here (pure, unit-tested).
- **Firestore rules**: add a `reviews` block — owner read, client write **denied**, Functions write.
- **Index**: `firestore.indexes.json` is currently empty. A query on the `reviews` subcollection `where('dueAt','<=',now).orderBy('dueAt')` needs only the automatic single-field index; if combined with `where('schemaId','==',…)`, add a composite `(schemaId ASC, dueAt ASC)`. State whichever queries the spec actually uses and pre-create their indexes.
- **Write path** (D14): a `submitReview` callable (new, in `functions/src/review.ts`) writes the card on each review; the first card per beat is created at lesson completion (extend `completeLesson` or create-on-first-review). Never key scheduling off a client-supplied timestamp (foolproofing R12) — use server `now`.

### Foundation B — Method registry + `schemaId` tag (`spec-00`)

```
src/content/methods.ts   (NEW — single source of truth)
  export const METHODS = {
    'first-step-analysis': { name: 'First-step analysis', domains: ['probability','markov-chains','optimal-stopping'] },
    'symmetry':            { name: 'Symmetry',            domains: ['probability','combinatorics'] },
    'conditioning':        { name: 'Conditioning',        domains: ['probability','bayes-rule'] },
    'linearity-indicators':{ name: 'Linearity / indicators', domains: ['expected-value','combinatorics'] },
    'states-markov':       { name: 'States / Markov',     domains: ['markov-chains'] },
    'complementary-counting':{ name:'Complementary counting', domains:['combinatorics'] },
    // domain-specific, added as concepts grow:
    'prior-update':        { name: 'Prior update',        domains: ['bayes-rule'] },
    'dominance-nash':      { name: 'Dominance / Nash',    domains: ['game-theory'] },
    'backward-induction':  { name: 'Backward induction',  domains: ['game-theory','optimal-stopping'] },
    'threshold-rule':      { name: 'Threshold / secretary', domains: ['optimal-stopping'] },
    // …extensible. Adding a concept may add ids here via the lesson-factory process.
  } as const
  export type MethodId = keyof typeof METHODS
  export const MethodIdSchema = z.enum(Object.keys(METHODS) as [MethodId, ...MethodId[]])
```

> The exact starter id list above is a **proposed taxonomy** for `spec-00` to finalize against the real corpus —
> not frozen vocabulary. The *structure* (shared + domain-specific, stable ids, extensible) is locked (D5).

**CONFUSABLE map (Foundation-B contract).** `methods.ts` also exports a curated, **symmetric**
`CONFUSABLE: Record<MethodId, MethodId[]>` of genuine near-misses; it (**NOT** `domains ∩`) is the source of
truth for which-method foils (spec-10) and gate distractors (spec-13). Domain overlap is a **fallback only** when
`CONFUSABLE` has no entry.

- **`BeatSchema`** (`src/content/schema.ts:608`): add `schemaId: MethodIdSchema.optional()`. Optional during backfill; the validator enforces required-on-graded-beats afterward.
- **Validator** (`scripts/validate-fixtures.ts`): assert every graded beat (`GRADED_BEAT_TYPES` in `src/lesson/mastery.ts:11` ∪ accept-gated `countingTree`/`selectionGrid` carrying `accept`) has a valid `schemaId`. Gate this behind a flag until backfill is done, then make it hard.
- **lesson-factory skill** (`.cursor/skills/lesson-factory/{departments.md,qa-rubric.md,artifacts.md}`): every authored graded beat declares a `schemaId`; if none fits, the author proposes a registry addition. This is the "prepared for new concepts" requirement (D5).
- **Backfill**: a one-time agent-assisted pass over `fixtures/lesson-*.json` (+ `concepts/*` authoring artifacts), human-reviewed.

### Foundation C — Confidence field (`spec-02`)

- **Snapshot** (`src/content/schema.ts:720`, `interactionState` is `.loose()`): add `confidenceByBeat?: Record<string, number>` (client-written; scale 0.5–1.0 or 4 buckets — `spec-02` fixes the scale). Captured only on checkpoint beats (D6).
- **Interview attempt** (`docs/capstone-interview/README.md` Firestore layout): add per-answer/per-question `confidence` to the transcript or attempt so the grader can compute a calibration delta.
- **Calibration aggregate** — see Foundation-adjacent `spec-12`. Store a trend in either `ProgressDerived` (per-lesson) or a new `users/{uid}/calibration` doc (cross-concept trend). `spec-02` defines the capture; `spec-12` defines the Brier computation + surfacing.
- **No teaching-beat friction**: the rating UI (`src/lesson/ConfidenceRating.tsx`, NEW) renders only on checkpoint beats and is suppressed/skipped for Track A per D6.

### Foundation D — Retrieval-rep taxonomy (`spec-03`)

- **Pure classifier** `src/lesson/retrievalRep.ts`: `isRetrievalRep(beat, ctx) → boolean`. A retrieval rep is a **cold recall act**: a spaced-review problem (surfaced by the queue), a `masteryChallenge`, or a which-method gate. **Not** ordinary teaching beats, primers, or sims.
- **Consumers**: the difficulty governor's rolling-success window (`spec-21`) counts only retrieval reps; calibration scoring (`spec-12`) marks which answers were real recall; analytics (`src/analytics/events.ts`).
- **Explicitly does NOT touch the streak** (D10). An optional informational "retrieval reps this week" stat may surface in the momentum band; it does not alter the streak number or reset rule.

### Shared helper — the quant-intensity gate predicate (authoritative — resolves gate Issue #9)

Every aggressive behavior (D2) gates on ONE helper, so a learner is never quant-gated in one surface and gentle
in another. Add `src/auth/track.ts`:

```ts
// effectiveTrack = per-concept progress.track ?? userDoc.defaultTrack ?? 'A'  (fail GENTLE)
export function isQuantIntensity(userDoc, conceptProgress?): boolean {
  const track = conceptProgress?.track ?? userDoc?.defaultTrack ?? 'A'
  return track === 'B' || userDoc?.learningGoal === 'interview'
}
```

**Default GENTLE** — a missing/loading track must never put a learner on the aggressive path (matches
`comfortToDefaultTrack`: new/dabbled → A). `learningGoal === 'interview'` is the only implicit opt-in to
intensity. **NOTE:** the EXISTING app convention is `defaultTrack ?? 'B'`; the intensity gate deliberately
diverges to fail gentle.

All of spec-02/13/20/21/22/23 import this; none re-derives the predicate from `defaultTrack` alone.

### §4.5 — Fields added by later specs (folded back into the authoritative contract — resolves gate Issue #2/#3/#11)

These fields are introduced by individual specs and are listed here so §4 stays the single source of truth (a
fresh session reading §4 sees every persisted field). Each spec applies its delta **additively** — see the §5
collision matrix for who-edits-what ordering.

| Field / shape | On | Owner spec | Consumers |
|---|---|---|---|
| `schemaId: MethodIdSchema.optional()` | `BeatSchema` | spec-00 | 01,10,11,13,24 |
| `heldOut: z.literal(true).optional()` | `BeatSchema` | spec-24 | 01 (→ card `isTransfer`), 11 (excluded from visible walk) |
| `gate: { kind, correct, optionMethods }` (on the `prediction` member) | `InteractionSchema` | spec-13 | 02/03 (`isCheckpointBeat`/`isRetrievalRep` detect a gate by `interaction.type==='prediction' && !!interaction.gate`) |
| `confidenceByBeat?: Record<string,number>` | `SnapshotSchema.interactionState` | spec-02 | 12 |
| `repWindow?: boolean[]` | `SnapshotSchema.interactionState` | spec-21 | 21 |
| `isTransfer`, `lastConfidence` (see card shape above) | `reviews/{cardId}` | spec-01 | 11 (`isTransfer`), 12 (`lastConfidence`) |
| `Turn.confidence?: number` | interview transcript turn | spec-02 | 12 (reads `transcript[i].confidence`) |
| `users/{uid}/calibration/summary` doc + per-attempt `calibration` block; `GradeInterviewOutput.calibration` returned (not just written) | calibration store | spec-12 | 23 (report renders the returned `calibration`) |
| `InterviewReport.tier`, `InterviewReport.pressureNote` | interview report | spec-22 | 23 |
| **Rollout cohort enum** (co-defined, one source of truth): persisted `userDoc.rolloutCohort?: 'treatment' \| 'holdout'` and the `assignCohort()` return value are **`'treatment' \| 'holdout'`** — the control arm is named **`'holdout'`**, there is **no `'control'` literal**. The same two literals are the values of the analytics `cohort` dimension (spec-04 Layer 1) and the read key of every efficacy A-B split. **spec-05 owns assignment** (persists the field, stamps the dimension); **spec-04 owns the analytics dimension contract + read** (treats `'holdout'` as its control arm). Both specs MUST use these exact literals; a spec using `'control'` will silently never match spec-05-stamped data. | `userDoc` (persisted) + `cohort` analytics dimension | spec-05 (assignment) | spec-04 (efficacy read), all events (carry the dimension) |

**`isCheckpointBeat` / `isRetrievalRep` vs the opening bet (resolves gate Issue #4/#5):** both the opening
qualitative bet and the which-method gate use the `prediction` interaction. The gate is distinguished **only** by
`interaction.gate` being present. `isCheckpointBeat` (spec-02) and `isRetrievalRep` (spec-03) must therefore test
`type==='prediction' && !!interaction.gate` — they must **not** add `'prediction'` to a beat-type set (that would
capture confidence on the exempt opening bet, violating D6).

---

## §4.6 — Data privacy, retention & deletion (cross-spec)

This plan adds new **personal data**. Enumerated:

- `userDoc.targetInterviewDate` (YYYY-MM-DD; D13).
- Per-attempt **calibration** block on `interviews/{attemptId}` (spec-12).
- `calibration/summary` **overconfidence trend** (cross-concept; spec-12).
- **Method-weakness** signal on `reviews/{cardId}` (`lastResult`, `lapses`, `schemaId`; spec-01/10).
- The **interview transcript** `Turn[]` (spoken-answer text + per-turn confidence; spec-02).

**Self-only use.** All of the above is **owner-only read** (per `firestore.rules`) and drives **only the
learner's own** scheduling, calibration, and report. It is **never shared** with recruiters, instructors, or other
learners, and is **never a gate** (D11 removed the hire signal). **Audio is NEVER stored** — transcripts retain
the spoken-answer **TEXT** only (carried forward from the capstone-interview contract).

**Retention posture.** Personal review/calibration/interview data is retained while the account is active to power
the learner's own scheduling and trend; it is not aged out automatically in v1 (the SR queue depends on full
history). A learner-initiated **delete path** must wipe it.

**Delete path (FLAG).** `firestore.rules` currently **hard-deny `delete`** on `userDoc`/progress, so a client
delete cannot cascade. A **Function-driven recursive cascade-delete** of the `reviews`, `interviews`, and
`calibration` subcollections (plus the new `userDoc` fields) must be specified. **Owner: `spec-05`** (rollout/ops)
— assigned here so the delete path is not orphaned.

---

## §4.7 — Cross-module signatures (frozen)

These signatures are **frozen** so specs that consume them do not drift:

```ts
dueCards(cards: ReviewCard[], now: Date): ReviewCard[]
buildQueue(cards: ReviewCard[], order: PrereqOrder, now: Date, opts: { maxItems: number; foils: …}): QueueItem[]
loadDueQueue(uid: string, now: Date): Promise<QueueItem[]>
```

**Canonical homes.** `ReviewCard` / `ReviewCardSchema` live in **`src/content/schema.ts`**. Pure SM-2
(`nextSchedule` / `initialSchedule` / `SchedulingState`) lives in **`src/progress/scheduling.ts`**
(**Firebase-free**). The clock value **`now` is a `Date` everywhere** (convert with `Timestamp.fromDate`).

---

## §5. Shared file map / collision matrix

Files touched by more than one spec. Coordinate via this README's contracts; sequence per §7. (✎ = edits, ✚ = creates.)

| File | Specs (apply additively) | Note |
|---|---|---|
| `src/content/schema.ts` | ✎00 (`BeatSchema.schemaId`), ✎01 (`ReviewCardSchema` new), ✎02 (`SnapshotSchema.interactionState.confidenceByBeat`), ✎12 (`CalibrationSummarySchema` new), ✎13 (`InteractionSchema` `prediction.gate`), ✎21 (`SnapshotSchema.interactionState.repWindow`), ✎24 (`BeatSchema.heldOut`) | **7 specs.** `BeatSchema` optional block: 00+24. `prediction` member: 13. `SnapshotSchema.interactionState`: 02+21. All shapes are in §4/§4.5; apply additively, never clobber a sibling field. |
| `functions/src/review.ts` (NEW) | ✚01 (declares `submitReview` + server-grading + `writeCardsForCompletion`), ✎10 (SM-2 advance body), ✎11 (gold-mint branch), ✎05 (`goldMint`/review kill switch) | **4 specs, one file.** Signature frozen in §4: `submitReview({ cardId, answer, confidence? })` — **server-graded** (R13), no client `result`. |
| `functions/src/index.ts` | ✎01 (call `writeCardsForCompletion` from `completeLesson`), ✎11 (`buildDerived.mastered:false`, remove `improveMastered`) | Both touch `completeLesson`; §7 sequences 01 before 11. |
| `src/lesson/mastery.ts` | ✎00 (export `isGradedBeat`), ✎02 (`isCheckpointBeat`/`CHECKPOINT_BEAT_TYPES`), ✎11 (`computeMastered` semantics), ✎13 (`isGradedBeat`/`isCheckpointBeat` recognize a gate `prediction`) | spec-03 does **NOT** edit this file. Keep `GRADED_BEAT_TYPES` stable; R2 applies. |
| `src/lesson/LessonPlayer.tsx` | ✎11 (exclude `heldOut` beats from the visible/required walk), ✎13 (mount the gate), ✎21 (governor knobs) | `heldOut` exclusion is **owned by spec-11** (gate Issue #10). |
| `scripts/validate-fixtures.ts` | ✎00 (`schemaId` required-on-graded, flag-gated), ✎13 (gate well-formedness), ✎24 (held-out transfer gate) | **3 specs.** Do not flip `REQUIRE_TRANSFER=1` before `REQUIRE_SCHEMA_ID=1` + backfill (gate Issue #12). |
| `.cursor/skills/lesson-factory/*` | ✎00 (tagging), ✎24 (transfer problems) | Update `departments.md`/`qa-rubric.md`/`artifacts.md` once, coordinated. |
| `src/progress/recommend.ts` | ✎10 (wire + time axis + method index) | Currently dead code (R1). `selectWeakNode`/`recommendReview` get their first call site; `masteredFromLive` is referenced by spec-11's R2 test. |
| `src/pages/studyDesk.model.ts` / `CourseJourney.tsx` | ✎10 (recommender call site), ✎20 (Daily Review entry) | `recommendedAction` is the live entry point. |
| `functions/src/interview.ts` | ✎22 (tier-aware rubric scaling, `tierFloor` by gate), ✎23 (remove `hireSignal`) | Shared `INTERVIEW_REPORT_SCHEMA.required`: 22 adds `tier`/`pressureNote`, 23 removes `hireSignal`; both spell out the merge. |
| `functions/src/calibration.ts` (NEW) ↔ `src/progress/calibration.ts` | ✚12 (Brier; byte-mirror src↔functions) | `CalibrationResult` mirrored both sides (parity test); imported by spec-23's `GradeInterviewOutput`. |
| `src/auth/userDoc.ts` + `src/auth/track.ts` (NEW) | ✎01 (`targetInterviewDate`), ✚§4 (`isQuantIntensity` helper), ✎05 (helper also consults flag+cohort), consumed by 20/21/22/23 | Client-writable; not in rules deny-list. `isQuantIntensity` is the single gate chokepoint (D17). |
| `src/analytics/events.ts` | ✎01 (per-interval review outcome), ✎03 (`retrievalRep`), ✎04 (`cohort`/`track` dimensions + efficacy events), ✎05 (flag/cohort assignment events), ✎12 (calibration events), ✎13 (`method_gate_picked`), ✎20 (queue events), ✎23 (report events) | **8 specs — highest-collision file.** All additive `track(name, params)` entries; never reorder existing events. spec-04 owns the shared `cohort`/`track` dimension all others should carry. |
| `src/analytics/efficacy.ts` (NEW) | ✚04 (metric formulas + rollup) | Consumes spec-01/02/03/12 signals; does not rebuild them. |
| `src/config/flags.ts` + `functions/src/flags.ts` (NEW) | ✚05 (flag read + cohort assignment, client + server) | The flag mechanism (Remote Config or `config/flags` doc); none exists today (R14). |
| `functions/src/privacy.ts` (NEW) | ✚05 (`deleteLearningData` recursive cascade-delete) | Owns the §4.6 delete path (rules hard-deny client delete). |
| `firestore.rules` + `firestore.indexes.json` | ✎01 (reviews block; index only if a `schemaId==` query is actually issued — see gate Issue #14) | Indexes file is currently empty. `loadDueQueue` uses single-field `dueAt`; method-grouping is in-memory, so the `(schemaId,dueAt)` composite is **speculative-for-later** — add only when a query needs it. |
| `src/lesson/queue.ts` (NEW) | ✚10 (`loadDueQueue`, `buildQueue(cards, order, now, {maxItems,foils})`, `dueCards`) | spec-20 **consumes these exact names/arity** (gate Issue #4/#12) — must pass the prereq-`order` map (R5) and `{foils}` (D2). |
| `src/lesson/WhichMethodGate.tsx` (NEW) | ✚13 (exported `{beat, schemaId, onResolved}` component) | spec-20 mounts this exact component (gate Issue #11). |

---

## §6. Spec index

Status legend: **Planned** (this drop) — none built yet.

### Phase 0 — Foundations (schema/data; build first)

| Spec | Summary | Depends on |
|---|---|---|
| [`spec-00-method-registry-and-tagging.md`](spec-00-method-registry-and-tagging.md) | Method registry (`methods.ts`), `BeatSchema.schemaId`, lesson-factory tagging, validator, backfill | — |
| [`spec-01-time-axis-and-scheduling.md`](spec-01-time-axis-and-scheduling.md) | `reviews/{cardId}` schema, SM-2 module, interview-date capture, rules + index, write-path | — |
| [`spec-02-confidence-capture.md`](spec-02-confidence-capture.md) | `confidenceByBeat` snapshot field, interview confidence, checkpoint rating UI | — |
| [`spec-03-retrieval-rep-taxonomy.md`](spec-03-retrieval-rep-taxonomy.md) | `isRetrievalRep` classifier + consumers wiring (plumbing only) | spec-00 (beat types) |
| [`spec-04-efficacy-measurement.md`](spec-04-efficacy-measurement.md) | **Phase 0 — Measurement.** Retention-data feedback loop that tunes SM-2/governor constants (D4/D9); efficacy instrumentation over the new review/calibration data | 01, 02, 03 |

### Phase 1 — Logic (consumes Phase 0)

| Spec | Summary | Depends on |
|---|---|---|
| [`spec-10-sr-engine-and-recommender.md`](spec-10-sr-engine-and-recommender.md) | SM-2 due-selection + interleave (`queue.ts`), recommender first call site, method-indexed weakness, `submitReview` | 00, 01 |
| [`spec-11-honest-delayed-mastery-and-medallions.md`](spec-11-honest-delayed-mastery-and-medallions.md) | Redefine gold (delayed re-retrieve / transfer), hints forgiven, async gold mint, two-source reconciliation | 01, 10, (24 for Track-B transfer content) |
| [`spec-12-calibration-scoring.md`](spec-12-calibration-scoring.md) | Brier computation, per-attempt + trend storage | 02 |
| [`spec-13-which-method-gate.md`](spec-13-which-method-gate.md) | `prediction`-based method picker, label-stripping, placement in queue + checkpoints, validator | 00 |

### Phase 2 — Surfaces (consumes Phase 1)

| Spec | Summary | Depends on |
|---|---|---|
| [`spec-20-daily-review-queue.md`](spec-20-daily-review-queue.md) | Daily Review hero on home + interleaved label-stripped queue surface; (Mixed-Floor-as-home documented as Phase-Next) | 10, 13 |
| [`spec-21-difficulty-governor.md`](spec-21-difficulty-governor.md) | Light bounded rolling-success governor (quant-intensity gate); extend assist/`hintCapOverride` beyond `equationTiles` | 03 |
| [`spec-22-brutal-mock-and-rubric-fairness.md`](spec-22-brutal-mock-and-rubric-fairness.md) | Track-gated tier floor + tier-aware rubric scaling (bug fix) + in-app-vs-interview gap surfacing | 02 |
| [`spec-23-interview-report-feedforward.md`](spec-23-interview-report-feedforward.md) | Remove `hireSignal`; feed-forward fix cards + calibration delta; ADR-0008 supersede | 12, 22 |
| [`spec-24-transfer-problem-content.md`](spec-24-transfer-problem-content.md) | Author ~1 held-out transfer problem per lesson; lesson-factory update; held-out marking *(build-order: Phase 0/1 — see §7; listed under Phase 2)* | 00 |
| [`spec-05-rollout-flags-and-kill-switches.md`](spec-05-rollout-flags-and-kill-switches.md) | **Phase-2 cross-cutting.** Runtime flag + holdout cohort + per-feature kill switch (D17); gates all net-new aggressive surfaces; owns the cascade-delete path (§4.6) | 04 |

---

## §7. Dependency graph & build order

```
Phase 0 (foundations, parallel):
  spec-00 method registry/tagging ─┐
  spec-01 time axis / SM-2 ────────┤
  spec-02 confidence field ────────┤
  spec-03 retrieval-rep (needs 00) ┘

Phase 0 also includes (content long pole — start now):
  spec-24 transfer problem content  ← 00     (re-tagged Phase-0/1; feeds spec-11 Track-B; also → spec-01 card creation)

Phase 0 — Measurement:
  spec-04 efficacy measurement      ← 01, 02, 03   (retention feedback loop; re-tunes D4/D9 constants)

Phase 1 (logic):
  spec-10 SR engine + recommender   ← 00, 01
  spec-13 which-method gate         ← 00
  spec-11 honest delayed mastery    ← 01, 10, 24   (SOLID edge to 24 — see two-stage note)
  spec-12 calibration scoring       ← 02
  spec-01 (card creation)           ← 24            (must read BeatSchema.heldOut)

Phase 2 (surfaces):
  spec-20 daily review queue        ← 10, 13
  spec-21 difficulty governor       ← 03
  spec-22 brutal mock + rubric fix  ← 02, 12 (shares the correctness-binarization constant; spec-12 owns it)
  spec-23 report feed-forward       ← 12, 22
  spec-05 rollout flags + kill      ← 04            (cross-cutting; gates all net-new aggressive surfaces)
```

> **spec-04 ↔ spec-05 cohort contract is co-defined (two-way).** The edge is drawn `04 → 05` because spec-05
> *consumes* spec-04's metric definitions, but spec-04 also *reads* the holdout `cohort` that spec-05 stamps. They
> resolve cleanly without a deadlock: spec-05 ships flags default-off and stamps `cohort`; spec-04 treats `cohort`
> as `undefined` until spec-05 lands (degrading to pre/post rather than control/treatment). Co-define the `cohort`
> field once (spec-04 owns the analytics dimension; spec-05 owns assignment).

**Critical-path notes.** `spec-24` (content authoring) is the long pole; it is re-tagged **Phase-0/1** and must
start early because (a) it feeds `spec-11`'s Track-B gold gate and (b) `spec-01` reads `BeatSchema.heldOut` to set
`isTransfer` on transfer cards. **Per-item cost:** ~48 individually hand-authored transfer problems, each
source-anchored AND engine-verified — this is **effort-bound, not just dependency-bound**; prioritize the
flagship **pattern-hitting-times** concept first so the demo path has gold. **spec-11 ships in two stages:** Track-A gold (re-retrieval) works in Phase 1 with
no dependency on 24; **Track-B gold (transfer) is non-functional until 24 lands** — so the `24 → 11` edge is
solid, not optional. `spec-01` before `spec-11` (both edit `completeLesson`/`review.ts`). `spec-00` is upstream of
00 → 03, 10, 11, 13, 24. Phases are shippable in order, with the one caveat that the Track-B half of D7 waits on 24.

**Explicitly out of scope (a decision, not an omission — resolves gate Issue #6):** brainlift app-action #5,
*generation-first / failure-first beat sequencing* (a cold attempt before the primer/worked example). It is a
large per-lesson content/sequencing change, the thesis is already delivered by SR + interleaving + honest mastery
+ the governor, and re-sequencing every lesson's beats is best done as its own future program. No spec owns it by
design.

---

## §8. Foolproofing checklist (every spec must respect the applicable items)

These come from a verified subsystem audit. A fresh session fails predictably without them.

- **R1 — The recommender is dead code.** `selectWeakNode`/`recommendReview` are never called. Any SR spec must name and create the **first call site** (`spec-10` wires it into `recommendedAction` / the queue), not "extend" a live path.
- **R2 — Two mastery sources of truth.** `derived.mastered` (frozen, drives medallion tier) vs the live `maxHintLevelByBeat` snapshot (drives recommender). Change both coherently; add a test asserting both paths after any mastery change.
- **R3 — Mastery computes client-side, persists server-side.** `computeMastered` runs in `LessonPlayer.tsx`; `completeLesson` stores it. Ensure the snapshot is fully hydrated before compute; test offline/permission-denied replay (the snapshot writer fails silently offline).
- **R4 — Schema migrations are permanent and the index file is empty.** Freeze field shapes (§4) before coding. Any new **progression** field routes through a Function (rules deny client writes). Any query on `dueAt`/`schemaId` needs a pre-created index or it throws at runtime.
- **R5 — Missing foundations silently degrade features.** The which-method gate needs `schemaId`; the queue needs method tags + a prerequisite order (don't surface a problem whose notation isn't taught yet); calibration needs the confidence field. Build Phase 0 first; never stub a foundation.
- **R6 — Capped beats dead-end without an assist path.** `hintCapOverride` + `assist.prefillToLastTerm` exist **only** on `EquationTilesBeat` (`src/lesson/beats/types.ts:51-52`). Any new capped/graded beat (e.g. a Track-A `masteryChallenge`) needs an assist/override path or a struggling novice gets stuck. (`spec-21` generalizes this to all capped graded beats.) Related: **`spec-11` owns excluding `heldOut` transfer beats from the normal visible/required beat walk** in `LessonPlayer.tsx` (else a held-out problem renders in normal flow).
- **R7 — `needsReview` is permanent + asymmetric.** Set true on full-reveal OR `wrongCount ≥ 3`; clears only via a successful review (`functions/src/index.ts`, `src/lesson/hintLadder.ts:52`). If both `needsReview` and `dueAt` exist, keep them coherent and branch UX on review-vs-first-attempt.
- **R8 — Stale lesson order in docs.** `future_ideas.md` and the filenames `audits/ideation/plan-L4-overlap-shortcut.md` / `plan-L6-longer-patterns.md` encode the OLD numbering. Canonical: Overlap is **last (L6)**; cite `docs/proposed-lessons.md §1`. **DONE (D16):** both files now carry a stale-numbering header; specs cite the canonical order.
- **R9 — "It's in the product" ≠ "the mechanism exists."** Learning-science is reflected in lesson *content*; the *systems* (SR queue, calibration, governor, method-indexed recommender) are unbuilt. Trust §1, not survey claims.
- **(R10 intentionally unused — the numbering jumps R9 → R11; not a missing item.)**
- **R11 — Calibrate/discrimination + patternPick trap.** The which-method gate is built on `prediction` (has `byOption`), never `patternPick` (no `byOption`, ungraded). Keep `DiagnosticGate` as a prerequisite gate (D12).
- **R12 — Client timestamps are spoofable.** SR scheduling keys only off server-controlled time (`completedAt`, `gradedAt`, server `now`), never client `startedAt`.
- **R13 — Review pass/fail must be SERVER-GRADED, not client-asserted.** `submitReview` must not trust a client `result`; it loads the card's beat (`cardId = lessonId__beatId`), grades the raw answer server-side against the fixture accept-list (reuse `loadLesson`), and derives `result` server-side. The client may grade locally for UX, but the gold-minting result is the server's. (spec-01, spec-11)
- **R14 — No feature-flag/remote-config/kill-switch infra exists today** (verified: 0 hits in `src` + `functions/src`). Staged rollout / holdout / kill MUST be built (`spec-05`); net-new aggressive features otherwise ship **ON** once merged.

---

## §8.5 — Gate issues index

The cross-spec gate "Issue #N" references (cited throughout §4/§5) are reconstructed here from the two prior gate
reports' resolved cross-spec consistency findings, so they are defined in one place. Each is resolved.

| # | Concern | Resolution | Owning spec |
|---|---|---|---|
| 1 | Transfer-card creation predicate would miss `heldOut` beats | `writeCardsForCompletion` creates a card for every graded-required beat AND every `heldOut` transfer beat (§4 Foundation A) | spec-01 / spec-11 |
| 2 | `submitReview` signature drift / client-asserted result | One shape: `submitReview({ cardId, answer, confidence? })` — **server-graded** (R13), no client `result`, no `{lessonId,beatId}` variant (§4) | spec-01 |
| 3 | Collision matrix / who-edits-what ordering unclear | §5 shared file map lists every multi-spec file with additive ordering | README §5 |
| 4 | Queue API name/arity drift between producer and consumer | `loadDueQueue` / `buildQueue(cards, order, now, {maxItems,foils})` / `dueCards` frozen (§4.7) | spec-10 / spec-20 |
| 5 | `isRetrievalRep` gate detection ambiguous vs opening bet | Gate detected by `type==='prediction' && !!interaction.gate`, not a beat-type set (§4.5) | spec-03 / spec-13 |
| 6 | App-action #5 (failure-first sequencing) ownership | Explicitly OUT OF SCOPE for v1; no spec owns it by design (§7) | §7 |
| 7 | `review.ts` ownership across specs | spec-01 owns the callable + card-creation; spec-10 fills SM-2 body; spec-11 adds gold-mint branch (§4) | spec-01 |
| 8 | Review-card confidence capture path | `lastConfidence` on the card; `Turn.confidence` on the transcript; consumed by calibration (§4.5) | spec-20 / spec-12 |
| 9 | `isQuantIntensity` track source ambiguous | Single helper `src/auth/track.ts`; effectiveTrack = progress.track ?? defaultTrack ?? 'A' (§4 helper) | spec-13 (helper) |
| 10 | `heldOut` beats leaking into the visible/required walk | spec-11 owns excluding `heldOut` beats from the normal walk in `LessonPlayer.tsx` (§5) | spec-11 |
| 11 | `WhichMethodGate` component name/props drift | spec-13 exports `{beat, schemaId, onResolved}`; spec-20 mounts that exact component (§5) | spec-13 / spec-20 |
| 12 | Validator flag-flip ordering | Do not flip `REQUIRE_TRANSFER=1` before `REQUIRE_SCHEMA_ID=1` + backfill (§5) | spec-00 / spec-24 |
| 13 | `mastery.ts` `isGradedBeat` export/body | spec-00 exports `isGradedBeat`; spec-13 makes it (and `isCheckpointBeat`) recognize a gate `prediction` (§5) | spec-00 / spec-13 |
| 14 | Speculative `(schemaId,dueAt)` composite index | Add only when a `schemaId==` query is actually issued; method-grouping is in-memory (§5) | spec-01 / spec-10 |

---

## §9. Glossary deltas & ADRs — D16 housekeeping is DONE (resolves gate Issue #5)

The gate flagged D16 as "orphaned" because the reviewers only saw `docs/learning-science/`. In fact all of D16
**is already complete** (committed alongside this plan); no spec needs to do it:

- ✅ **`CONTEXT.md`** updated: added *Method tag*, *Review card*, *Spaced review*, *Daily Review queue*,
  *Which-method gate*, *Calibration score*, *Retrieval rep*, *Target interview date*, *Quant-intensity gate*,
  *Transfer problem*; **retired** *Hire signal*; updated *Interview report*.
- ✅ **[ADR-0009](../adr/0009-spaced-retrieval-and-honest-delayed-mastery.md)** — Spaced-retrieval architecture &
  honest delayed mastery (problem-level SM-2, Function-owned review cards, gold-via-delayed-check, two-source
  reconciliation). Written.
- ✅ **[ADR-0010](../adr/0010-remove-interview-hire-signal-feedforward-report.md)** — Remove the interview
  hire-signal; report feeds forward + calibration. Supersedes the hire-signal parts of ADR-0008. Written.
- ✅ Older `docs/brainlift-learning-science-quant-prep.md` marked **superseded**; mis-numbered
  `audits/ideation/plan-L4-overlap-shortcut.md` (actually L6) and `plan-L6-longer-patterns.md` (actually L5)
  annotated with stale-numbering headers (R8).

---

## §10. Spec authoring conventions (template every `spec-*.md` follows)

1. **Header**: title, Status (Planned), Phase, Depends-on, "Implements" (which brainlift app-action(s) + decision #s).
2. **Goal & non-goals** (2–4 sentences each).
3. **Current reality** — exact files + line refs for what exists today (verified, not assumed).
4. **Design** — the change, referencing §4 shared contracts by name (do not redefine them).
5. **Step-by-step implementation** — numbered, each step `→ verify: <check>` (per `AGENTS.md §4`). Name every file created/edited.
6. **Two-track behavior** — what Track A vs the quant-intensity gate does.
7. **Data/schema changes** — only deltas; point to §4 for shared shapes.
8. **Tests** — unit (vitest), fixture validation, rules tests where relevant, `/dev` manual check.
9. **Foolproofing** — which §8 items apply and how the spec satisfies them.
10. **Definition of Done** — green tests, validator, lint on touched files; manual `/dev` verification steps.

> Specs are **surgical** per `AGENTS.md`: minimum code, match existing style, touch only what the change requires.
