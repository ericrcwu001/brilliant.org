# spec-02 — Confidence capture (snapshot + interview)

**Status:** Planned
**Phase:** 0 (Foundation C)
**Depends-on:** none
**Implements:** brainlift app-action **#7** (capture confidence; Brier is **NOT** in scope here) · decisions **D6** (confidence on checkpoints + interview, track-aware), **D2** (quant-intensity gate)

> Read [`README.md`](README.md) §1 (corrected premises — esp. #7: *no confidence field exists anywhere*), §3 (D6),
> §4 **Foundation C**, §8 (R3, R4) before coding. This spec **only captures** confidence. Brier / calibration
> scoring + surfacing is **spec-12** — do not compute any score here.

---

## 1. Goal & non-goals

**Goal.** Add a confidence signal at the two places D6 names: (a) a per-beat rating on **checkpoint** beats inside a
lesson, persisted in the existing client snapshot under `interactionState.confidenceByBeat`; and (b) a per-answer
confidence on the **interview** transcript so the grader (spec-12/spec-23) can later compute a predicted-vs-measured
delta. The capture is **track-aware** (D6/D2): the quant-intensity gate sees it; Track A is light/off.

**Non-goals.**
- **No Brier / calibration math, no aggregate doc, no surfacing.** That is spec-12 (reads `confidenceByBeat` + the
  interview confidence this spec writes).
- **No new checkpoint beat types.** The which-method gate beat is built in spec-13; this spec only makes the rating
  UI render on the *interaction types that are checkpoints* (and is forward-compatible with the which-method gate,
  which is a `prediction` beat carrying `interaction.gate` per D12/R11 and README §4.5 — detected by the
  `isCheckpointBeat` predicate, never by adding `'prediction'` to a beat-type set — see §6).
- **No change to mastery, streak, unlock, or the SR card.** `confidenceByBeat` is a passive signal, exactly like
  `maxHintLevelByBeat` (it never gates anything here).
- **The opening qualitative bet (`PredictionBeat`) is EXEMPT** (D6) — it is a guess, not a graded checkpoint.

---

## 2. Current reality (verified)

| Fact | Evidence |
|---|---|
| **No confidence field exists anywhere.** Only hit is a prose word in the interviewer prompt. | `grep -rn "confidence" src functions tests` → only `functions/src/interview.ts:133` (prompt copy). Confirms README §1 #7. |
| Snapshot `interactionState` is a `.loose()` object with `equationTiles`/`prediction`/`hintLevelByBeat`/`maxHintLevelByBeat`. | `src/content/schema.ts:725-737` (`SnapshotSchema`, `interactionState: z.object({…}).loose()`). |
| The snapshot is **client-written** (not Function-owned): `users/{uid}/snapshots/{lessonId}`, debounced + localStorage-mirrored, fire-and-forget. | `src/lesson/snapshot.ts:1-16, 53-78, 153-218`. The header comment at `schema.ts:717` states "client-written, authoritative for restore." |
| `interactionState` is assembled in `toSnapshot()` from `SnapshotInput`; new per-beat maps follow the `hintLevelByBeat`/`maxHintLevelByBeat` precedent exactly. | `src/lesson/snapshot.ts:37-48` (`SnapshotInput`), `:53-78` (`toSnapshot`), `:95-101` (`hintLevelsOf`/`maxHintLevelsOf`). |
| The LessonPlayer owns the per-beat state maps (e.g. `maxHintLevelByBeat`), feeds them into `snapshotInput` (memoized), and the writer mirrors on every change + flushes on beat change. | `src/lesson/LessonPlayer.tsx:103-105, 182-208, 217-248`. |
| Beat props are passed through `BeatView`; the player already threads per-beat callbacks (`onHintLevelChange`) and per-beat values (`initialHintLevel`). | `src/lesson/beats/types.ts:21-57`; `src/lesson/LessonPlayer.tsx:533-557`; dispatch `src/lesson/beats/index.tsx:65-156`. |
| Checkpoint beat = `masteryChallenge` (graded type-in). `GRADED_BEAT_TYPES` lists the graded set. | `MasteryChallengeBeat` at `src/lesson/beats/MasteryChallengeBeat.tsx`; routed `src/lesson/beats/index.tsx:91-92`; `GRADED_BEAT_TYPES` `src/lesson/mastery.ts:11`. |
| The opening bet `PredictionBeat` is ungraded, stores `initialPrediction` only. **Exempt.** | `src/lesson/beats/PredictionBeat.tsx:1-82`. |
| Beats carry a two-track gate `track?: 'A'\|'B'\|'both'`; the player resolves `track` (default `'B'`) and passes `density`. The player knows the active `track`. | `src/content/schema.ts:615-620`; `src/lesson/LessonPlayer.tsx:46-47, 143-148`. |
| Interview transcript is `Turn[]`; `Turn = { role, text, ts, final }`. No confidence. The full `Turn[]` is sent to `gradeInterview`. | `src/content/interviewPack.ts:145-150`; `GradeInterviewInput.transcript: Turn[]` at `src/interview/functions.ts:37-42`; capstone README "Report and turn types". |
| Interview attempt doc (`users/{uid}/interviews/{attemptId}`) is **Function-owned** (client write denied); `transcript?: Turn[]` is stored at grade time. | `docs/capstone-interview/README.md` Firestore layout + "All three subcollections are Function-owned". |
| `BeatShell` is the shared per-beat layout (region + feedback strip + action bar). New in-region UI composes inside it. | `src/lesson/BeatShell.tsx:25-79`. |
| `/dev/lesson` renders the local fixture with **no persistence** (no Firebase) — the manual-check surface. | `src/lesson/LessonPlayer.tsx:35-39, 66-68`; `src/pages/DevRoutes.tsx:12-32`; `src/pages/routes.ts:20,48-49`. |

**Discrepancy vs brief:** the brief says verify `interactionState` is `.loose()` "~725-737" and `ProgressDerived` "~746" — both confirmed exactly (`schema.ts:725-737`, `746-760`). No drift.

---

## 3. Design

### 3.1 The scale — DECISION: **4 discrete buckets, stored as the 0.5–1.0 midpoint**

D6/Foundation C leave the scale to this spec (`0.5–1.0` *or* 4 buckets). **Decision: present 4 buckets, persist a
number in `[0.5, 1.0]`.** Justification:

- **UX:** a 4-button row ("Guessing / Shaky / Fairly sure / Certain") is one tap, no slider, matches the chip/button
  idiom already in the codebase (`PredictionBeat` chips, `BeatShell` buttons). A continuous slider invites
  false precision and adds friction on a checkpoint.
- **Storage as a probability, not an ordinal:** spec-12's Brier score needs a **probability** `p ∈ [0,1]` for a
  binary correct/incorrect outcome. For a 2-option-or-better correct/wrong checkpoint, a rational floor is ~0.5
  (chance), ceiling <1.0. Mapping the 4 buckets to **`{0.5, 0.7, 0.85, 1.0}`** (clamped, never literally storing a
  number outside `[0.5,1.0]`) gives spec-12 a ready probability with **zero re-mapping**, while the UI stays
  discrete. This is why we store the midpoint number, not the bucket index — it makes `confidenceByBeat: Record<beatId, number>`
  (the Foundation-C contract field, **already named in §4**) directly consumable.

> The exact bucket→number map (`CONFIDENCE_SCALE`) is a constant in `ConfidenceRating.tsx`, exported so spec-12
> imports it rather than hard-coding. The **field name and type** (`confidenceByBeat?: Record<string, number>`) are
> the **authoritative README §4 contract** — do not rename.

### 3.2 Snapshot field (Foundation C, README §4)

Add `confidenceByBeat?: Record<string, number>` to `SnapshotSchema.interactionState` (`schema.ts`). Client-written,
optional, additive — rides the existing `.loose()` object and the existing client snapshot write-path (no Function,
no rules change: the snapshot collection already permits owner client writes — see §8 R4).

### 3.3 `ConfidenceRating` UI (NEW — `src/lesson/ConfidenceRating.tsx`)

A small presentational component: a labelled row of 4 buttons. It renders **inside** a checkpoint beat's region (the
beat owns placement), is shown **after** the learner has answered (so confidence is about *their* answer, captured
once, not re-litigated), and reports the chosen number up via a callback. Track-aware suppression is decided by the
**player** (it knows the track) — the component is dumb.

### 3.4 Which beats show it

Checkpoint set for **this spec**: **`masteryChallenge`** (the only graded checkpoint that exists today;
`which-method gate` and `spaced-review` problem are built later in spec-13/spec-20 and will opt in the same way —
see §6 forward-compat). The rating is wired into `MasteryChallengeBeat` only. The opening `PredictionBeat` is
**exempt** and is **not** touched.

### 3.5 Interview per-answer confidence

Add an **optional** `confidence?: number` to the `Turn` type (`src/content/interviewPack.ts`), populated only on
`role === 'candidate'` turns, same `[0.5,1.0]` scale + `CONFIDENCE_SCALE` map. It rides the existing
`transcript: Turn[]` → `gradeInterview` pipe (`functions.ts:40`) with **no new callable arg and no attempt-doc
schema change beyond `transcript`** (the attempt already stores `transcript?: Turn[]`). This is the **lowest-plumbing**
capture point and gives spec-12 per-question granularity.

> **SHARED FIELD — now authoritative in README §4.5:** `Turn.confidence?: number` (`[0.5,1.0]`), on the interview
> **transcript turn**, owned by **spec-02**, consumed by **spec-12** (reads `transcript[i].confidence`) and spec-23.
> The consistency gate fixed the open "transcript **or** attempt" choice (README §4 Foundation C) to the
> **transcript/`Turn`** in §4.5 — so this is no longer a flag; it is the locked contract. Do not move it to an
> attempt-level field.

UI: the interview is real-time voice; a mid-turn modal is intrusive. **Capture is a single post-interview step**, and
it must live **inside `useRealtimeInterview`'s state machine**, not in `InterviewPage`. `gradeInterview` is **not**
called by the page — it is called inside the hook's `stop()` (`src/interview/useRealtimeInterview.ts:682`), which
builds `finalTranscript` from `transcriptRef.current` (`:675`) and runs `live → ending → grading → gradeInterview`
**synchronously, with no interactive pause**. `stop()` is also **auto-invoked by the countdown timeout** (`:367`), so
it is not always user-initiated. `InterviewPage` only consumes `stop` (`:40`) and renders "Grading your interview…"
once `status` is `ending`/`grading` (`:254-266`); it never touches the transcript or the grade call. So the page has
no seam to insert a rating before grading.

**Decision: add an intermediate paused status to the hook.** When a session ends (whether by the user pressing "End
interview" or by the countdown firing `stop()`), if the quant-intensity gate is on, the hook transitions to a new
`'confidence'` status that **pauses before `gradeInterview`** instead of running straight to `grading`. It buffers the
computed `finalTranscript` and exposes a `submitConfidence(value)` callback. `InterviewPage` renders the
`ConfidenceRating` once ("How confident were you in your answer(s)?") during that paused status; on select, the hook
stamps the number onto the **last `role === 'candidate'` turn** of the buffered transcript (via the `stampConfidence`
pure helper) and then proceeds to `grading → gradeInterview` with the stamped transcript. When the gate is **off**, the
hook skips the pause entirely and grades the unchanged transcript exactly as today. (One rating for the single drawn
question — the interview draws **one** question per attempt; `MintInterviewTokenOutput.question` is singular.) This
keeps it to one tap, reuses the same `ConfidenceRating` component, and is robust to the countdown auto-stop because the
capture point is owned by the hook, not by a page-level click handler.

### 3.6 The third D6 site (spaced-review problem) — captured by spec-20, NOT here

D6 names **three** confidence sites: the in-lesson checkpoint (§3.1–3.4), the interview (§3.5), and the
**spaced-review problem** surfaced by the Daily Review queue. This spec captures the **first two**. The third is a
**hand-off**, recorded here so it is not orphaned (gate Issue #8):

- The review surface is **spec-20**. It mounts the **same `ConfidenceRating` component** built here (Track B /
  quant-intensity-gated only, per D6) and passes the chosen number as the optional `confidence?` arg of
  **`submitReview({ cardId, result, confidence? })`** — the callable owned by **spec-01** (signature frozen in
  README §4 Foundation A).
- Inside that callable the number lands in **`reviews/{cardId}.lastConfidence`** (`number | null`, README §4
  Foundation A card shape — the explicit "D6 third capture site" field). spec-12 reads `lastConfidence` for
  calibration, exactly as it reads `confidenceByBeat` and `Turn.confidence`.
- **This spec adds nothing on the review path** — no `reviews` field, no callable, no queue code. `ConfidenceRating`
  and `CONFIDENCE_SCALE` are the only shared artifacts, and they are exported here for spec-20/spec-12 to import.

---

## 4. Step-by-step implementation

> Surgical (AGENTS.md): minimum code, match the `maxHintLevelByBeat` precedent everywhere.

1. **Schema delta** — `src/content/schema.ts`. In `SnapshotSchema.interactionState` (the `.loose()` object at
   `:725-737`), add after `maxHintLevelByBeat`:
   ```ts
   // Confidence rating captured on checkpoint beats (spec-02 / Foundation C).
   // Client-written; scale = ConfidenceRating's CONFIDENCE_SCALE midpoints in [0.5,1.0].
   // Captured only on checkpoint beats (D6); never on teaching beats or the opening bet.
   // spec-12 reads this to compute a calibration (Brier) signal — NOT computed here.
   confidenceByBeat: z.record(z.string(), z.number()).optional(),
   ```
   → **verify:** `tsx scripts/validate-fixtures.ts` passes (no fixture carries the field; additive optional).
   → **verify:** `./node_modules/.bin/eslint src/content/schema.ts` clean.

2. **`ConfidenceRating` component** — create `src/lesson/ConfidenceRating.tsx`:
   ```tsx
   // Confidence capture on checkpoint beats (spec-02 / D6). One-tap, 4 buckets,
   // stored as a probability midpoint in [0.5,1.0] so spec-12 can score Brier
   // directly. Track-aware suppression is the caller's job (the player knows the
   // track) — this component is presentational.
   export const CONFIDENCE_SCALE = [
     { label: 'Guessing', value: 0.5 },
     { label: 'Shaky', value: 0.7 },
     { label: 'Fairly sure', value: 0.85 },
     { label: 'Certain', value: 1.0 },
   ] as const

   export function ConfidenceRating({
     value,
     onSelect,
     question = 'How sure are you?',
   }: {
     value?: number
     onSelect: (v: number) => void
     question?: string
   }) {
     return (
       <div className="confidence" role="group" aria-label={question}>
         <p className="confidence__q">{question}</p>
         <div className="chips" role="radiogroup" aria-label={question}>
           {CONFIDENCE_SCALE.map((b) => (
             <button
               type="button"
               role="radio"
               aria-checked={value === b.value}
               key={b.value}
               className={`chip chip--select${value === b.value ? ' chip--on' : ''}`}
               onClick={() => onSelect(b.value)}
             >
               {b.label}
             </button>
           ))}
         </div>
       </div>
     )
   }
   ```
   Reuses existing `.chips`/`.chip--select`/`.chip--on` classes (see `PredictionBeat.tsx:66-78`) — **no new CSS
   required**; add only a `.confidence`/`.confidence__q` rule if spacing needs it (check `/dev/lesson` first).
   → **verify:** `./node_modules/.bin/eslint src/lesson/ConfidenceRating.tsx` clean; component type-checks.

3. **Thread the capture through beat props** — `src/lesson/beats/types.ts`. Add to `BeatProps`:
   ```ts
   // Confidence capture (spec-02 / D6). Present only when the active track sees
   // confidence (quant-intensity gate); undefined ⇒ the beat renders no rating.
   // The beat calls onConfidence(v) once the learner has answered the checkpoint.
   showConfidence?: boolean
   confidenceValue?: number
   onConfidence?: (value: number) => void
   ```
   → **verify:** `tsc`/build still passes (all optional; no existing beat must change).

4. **Player owns the `confidenceByBeat` map + gate** — `src/lesson/LessonPlayer.tsx`:
   - Add state mirroring the `maxHintLevelByBeat` precedent (`:103-105`):
     ```ts
     const [confidenceByBeat, setConfidenceByBeat] = useState<Record<string, number>>(
       () => (initialSnapshot && !review ? confidencesOf(initialSnapshot) : {}),
     )
     ```
   - Add a stable setter:
     ```ts
     const onConfidence = useCallback(
       (v: number) => {
         clearRestoringNote()
         setConfidenceByBeat((prev) =>
           prev[beat.beatId] === v ? prev : { ...prev, [beat.beatId]: v },
         )
       },
       [beat.beatId, clearRestoringNote],
     )
     ```
   - Compute the gate (D2): confidence is shown when **Track B OR `learningGoal === 'interview'`**. The player
     currently receives `track` but **not** `learningGoal`. **Add a prop** `showConfidence?: boolean` to
     `LessonPlayer` (default `false`). The player does **not** compute the gate — the *routes* compute and pass it
     (step 5). Inside the player:
     ```ts
     const confidenceEnabled = showConfidence  // route already applied the quant-intensity gate (D2)
     ```
     > Rationale: the player has no userDoc access today; pushing the gate to the route keeps the player dumb and
     > matches how `track` is already injected from outside. Document in the prop's JSDoc that the route must pass
     > `track === 'B' || userDoc.learningGoal === 'interview'`. **The `default false` means the feature renders
     > nowhere until the routes in step 5 are edited.**
   - In `snapshotInput` (`:217-236`) add `confidenceByBeat` to the object **and** the dep array.
   - In the `<BeatView .../>` props (`:533-557`) add:
     ```tsx
     showConfidence={confidenceEnabled && isCheckpointBeat(beat)}
     confidenceValue={confidenceByBeat[beat.beatId]}
     onConfidence={onConfidence}
     ```
   → **verify:** mid-lesson refresh on a checkpoint restores the chosen rating (manual, §7).

5. **Routes compute and pass `showConfidence`** — without this the new `LessonPlayer` prop defaults to `false`, the
   feature renders nowhere, and the §7 manual check cannot pass. Edit **both** lesson routes:
   - **`src/pages/LessonPage.tsx`** — the authed route. It already has `userDoc` via `useAuth()` (`:42`) and computes
     `effectiveTrack` at `:91`. Pass the gate to the player (`:92-104`):
     ```tsx
     const showConfidence = effectiveTrack === 'B' || userDoc?.learningGoal === 'interview'
     // …
     <LessonPlayer … track={effectiveTrack} showConfidence={showConfidence} … />
     ```
   - **`src/pages/DevRoutes.tsx`** — the no-Firebase manual-check surface (`:17, :27`), currently passing only
     `track`. Pass `showConfidence={true}` on **both** `LessonPlayer` render sites so `/dev/lesson` (and
     `/dev/lesson/<id>`) actually show the rating for the §7 check:
     ```tsx
     return <LessonPlayer track={track} showConfidence />            // :17 (devLesson fixture)
     // …
     if (lesson) return <LessonPlayer lesson={lesson} track={track} showConfidence />  // :27
     ```
     (Track A simulation for §7's gate-off case is still reachable via the player's `default false` — e.g. a separate
     check passing `showConfidence={false}`, or simply asserting Track-A routing in `LessonPage` keeps it off.)
   → **verify:** on `/dev/lesson/<id-with-a-masteryChallenge>` the rating renders after solving (§7); in the authed
     app a Track-A / non-interview user sees no rating, a Track-B or `learningGoal === 'interview'` user does.

6. **Checkpoint predicate** — add to `src/lesson/mastery.ts` (it already owns the graded-beat taxonomy; keep it the
   single source so spec-03/13/20 extend the same set). **Authoritative shape (README §4.5):** the which-method gate
   is a `prediction` beat distinguished **only** by `interaction.gate` being present — so `isCheckpointBeat` must
   detect it with the predicate `type === 'prediction' && !!interaction.gate` and must **NOT** add `'prediction'` to
   `CHECKPOINT_BEAT_TYPES` (that would also capture the EXEMPT opening qualitative bet, which is a `prediction` beat
   with **no** `gate` — a D6 violation). `interaction.gate` is the `gate: { kind, correct, optionMethods }` member
   that **spec-13 adds** to the `prediction` interaction (README §4.5; gate Issue #4). Until spec-13 lands, no beat
   carries `gate`, so the predicate matches `masteryChallenge` only — exactly today's set:
   ```ts
   // Checkpoint beats eligible for confidence capture (spec-02 / D6) and, later,
   // retrieval-rep classification (spec-03). The graded mastery challenge plus the
   // which-method gate (a `prediction` beat that carries `interaction.gate`,
   // added by spec-13 — README §4.5). The opening qualitative `prediction` bet has
   // no `gate` and is EXEMPT (D6), so we MUST NOT put 'prediction' in this set.
   // The spaced-review problem (third D6 site) is captured on the review surface by
   // spec-20 (→ card.lastConfidence via submitReview), not here — see §3.6.
   const CHECKPOINT_BEAT_TYPES = new Set(['masteryChallenge'])
   export function isCheckpointBeat(beat: Beat): boolean {
     const i = beat.interaction
     // which-method gate: a prediction beat carrying interaction.gate (spec-13).
     if (i.type === 'prediction' && !!(i as { gate?: unknown }).gate) return true
     return CHECKPOINT_BEAT_TYPES.has(i.type)
   }
   ```
   Import `isCheckpointBeat` into `LessonPlayer.tsx`. **Coordination with spec-13 (gate Issue #4):** spec-13 owns the
   `prediction.gate` schema member; this spec only reads it. When spec-13 lands, the gate beats become checkpoints
   **automatically** via the predicate above — spec-13 makes **no** edit to `CHECKPOINT_BEAT_TYPES`.
   → **verify:** unit test in §7 asserts `masteryChallenge` true; a `prediction` beat **with** `gate` true; a
     `prediction` beat **without** `gate` (the opening bet) false; `equationTiles` false.

7. **Snapshot read/write helpers** — `src/lesson/snapshot.ts`:
   - In `SnapshotInput` (`:37-48`) add `confidenceByBeat: Record<string, number>`.
   - In `toSnapshot()` (`:62-66`) add `confidenceByBeat: input.confidenceByBeat` to the `interactionState` object.
   - Add the reader beside `maxHintLevelsOf` (`:99-101`):
     ```ts
     export function confidencesOf(snap: Snapshot): Record<string, number> {
       return snap.interactionState.confidenceByBeat ?? {}
     }
     ```
   Import `confidencesOf` into `LessonPlayer.tsx`.
   → **verify:** `confidencesOf(toSnapshot(input, ts))` round-trips (unit test §7).

8. **Render the rating in the checkpoint beat** — `src/lesson/beats/MasteryChallengeBeat.tsx`. After the learner
   answers (i.e. once `solved` is true, or once they have submitted at least once — capture confidence about the
   answer they committed), render `<ConfidenceRating>` inside the `.mastery` region, gated by `props.showConfidence`:
   ```tsx
   {props.showConfidence && solved && (
     <ConfidenceRating
       value={props.confidenceValue}
       onSelect={(v) => props.onConfidence?.(v)}
       question="How sure were you before checking?"
     />
   )}
   ```
   Place it above the action bar (inside `.mastery`, before `</div>` at line ~107). Do **not** block advance on it —
   confidence is optional signal, never a gate.
   → **verify:** on `/dev/lesson`, a `masteryChallenge` beat with `showConfidence` shows the row after solving;
   choosing a bucket highlights it.

9. **Interview per-answer confidence** — `src/content/interviewPack.ts`. Add to `Turn`:
   ```ts
   export interface Turn {
     role: 'interviewer' | 'candidate'
     text: string
     ts: number // unix ms
     final: boolean
     // Self-reported confidence on a candidate answer (spec-02 / D6). [0.5,1.0]
     // (ConfidenceRating's CONFIDENCE_SCALE). Optional; present only when the
     // quant-intensity gate is on. spec-12/spec-23 read this for calibration.
     confidence?: number
   }
   ```
   → **verify:** `GradeInterviewInput.transcript: Turn[]` (`functions.ts:40`) now carries it with no signature
   change; existing transcript tests (`src/interview/transcript.test.ts`) still pass.

10. **`stampConfidence` pure helper** — add to `src/interview/useRealtimeInterview.ts` (beside `buildTranscript` at
   `:69`, the other exported transcript helper), exported for the unit test. Stamps confidence onto the last
   `role === 'candidate'` turn, never mutating the input:
   ```ts
   // Stamp self-reported confidence onto the last candidate turn (spec-02 / D6).
   // Pure; returns input unchanged when there is no candidate turn.
   export function stampConfidence(turns: Turn[], confidence: number): Turn[] {
     const lastCandidate = [...turns].reverse().find((t) => t.role === 'candidate')
     return lastCandidate
       ? turns.map((t) => (t === lastCandidate ? { ...t, confidence } : t))
       : turns
   }
   ```
   → **verify:** unit test in §7; `./node_modules/.bin/eslint src/interview/useRealtimeInterview.ts` clean.

11. **Add the paused `'confidence'` status to the hook** — `src/interview/useRealtimeInterview.ts`. The capture must
    live in the hook because `gradeInterview` is called in `stop()` (`:682`), not in the page, and `stop()` is also
    auto-fired by the countdown (`:367`). Do **not** add the rating to `InterviewPage` before `stop()` — there is no
    such seam.
    - Add `'confidence'` to the `InterviewStatus` union (`:24-33`), between `'ending'` and `'grading'`. Update the
      header doc comment (`:1-5`) to include the new state.
    - Add the gate as a hook param: `useRealtimeInterview(conceptId, _transport, showConfidence = false)`. The authed
      page passes `track === 'B' || userDoc?.learningGoal === 'interview'` (computed in `App.tsx` where `useAuth()` is
      already in scope — `App.tsx:130, 163`); the gate flag is **not** read inside the hook from userDoc.
    - Refactor `stop()` (`:666-701`) so the grade call moves into a separate internal `grade(transcript: Turn[])`
      function that does the `setStatusSafe('grading') … gradeInterview … setReport … 'done'`/error block (`:680-700`).
      `stop()` becomes: guard + `setStatusSafe('ending')` + clear countdown + compute `finalTranscript`/`durationSec`
      + `cleanup()`, then:
      ```ts
      pendingTranscriptRef.current = finalTranscript
      pendingDurationRef.current   = durationSec
      if (showConfidence) {
        setStatusSafe('confidence')      // pause — page renders ConfidenceRating
      } else {
        await grade(finalTranscript)      // unchanged path when gate is off
      }
      ```
      (Add `pendingTranscriptRef`/`pendingDurationRef` refs; `grade` reads `durationSec` from the buffered ref.)
    - Add `submitConfidence`:
      ```ts
      function submitConfidence(value: number) {
        if (statusRef.current !== 'confidence') return  // idempotent; ignore double-tap
        void grade(stampConfidence(pendingTranscriptRef.current, value))
      }
      ```
      Add `submitConfidence: (value: number) => void` to `UseRealtimeInterviewReturn` (`:53-65`) and return it.
    → **verify:** `tsc`/build passes; `src/interview/transcript.test.ts` still green (existing `buildTranscript`/`Turn`
      unchanged); the countdown-driven `stop()` still pauses at `'confidence'` when the gate is on.

12. **Render the rating during the paused status** — `src/pages/InterviewPage.tsx`. Destructure the new
    `submitConfidence` from the hook (`:29-41`) and add a branch **before** the `ending`/`grading` block (`:254`):
    ```tsx
    if (status === 'confidence') {
      return (
        <div className="iv-page">
          <header className="iv-topbar"><span /><span /></header>
          <div className="iv-grading">
            <ConfidenceRating
              question="How confident were you in your answer(s)?"
              onSelect={submitConfidence}
            />
          </div>
        </div>
      )
    }
    ```
    The gate flag reaches the hook from `App.tsx` (step 11); `InterviewPage` itself stays gate-agnostic — it simply
    renders the rating whenever `status === 'confidence'`, which only occurs when the gate is on.
    → **verify:** with the gate on, ending the interview shows the rating; tapping a bucket advances to "Grading…" and
    `gradeInterview` receives a transcript whose last candidate turn carries `confidence`. With the gate off, no
    `'confidence'` state occurs and the flow is identical to today (unit test on `stampConfidence`; the realtime path
    is not exercised in `InterviewPage.test.tsx`).

13. **Lint touched files.**
    → **verify:** `./node_modules/.bin/eslint src/content/schema.ts src/content/interviewPack.ts src/lesson/ConfidenceRating.tsx src/lesson/snapshot.ts src/lesson/mastery.ts src/lesson/LessonPlayer.tsx src/lesson/beats/types.ts src/lesson/beats/MasteryChallengeBeat.tsx src/pages/LessonPage.tsx src/pages/DevRoutes.tsx src/interview/useRealtimeInterview.ts src/pages/InterviewPage.tsx src/App.tsx` clean.

---

## 5. Two-track behavior

| | Track A (gentle default) | Quant-intensity gate: **Track B OR `learningGoal === 'interview'`** (D2) |
|---|---|---|
| **In-lesson checkpoint rating** | **Off** (light/off per D6). `showConfidence` resolves to `false`; no rating renders; `confidenceByBeat` stays empty. | **On.** Rating shows on `masteryChallenge` (and future checkpoints) after answering; persisted to `confidenceByBeat`. |
| **Interview confidence** | **Off** — transcript sent unchanged; no `Turn.confidence`. | **On** — post-session one-tap rating; stamped to the last candidate turn. |
| **Opening bet (`PredictionBeat`)** | Exempt both tracks (D6). | Exempt both tracks (D6). |

The gate is **computed by the route** (`track === 'B' || userDoc.learningGoal === 'interview'`) and passed as
`showConfidence` to `LessonPlayer` / the interview confidence flag. The player/beats never read userDoc.

---

## 6. Forward-compatibility (so spec-13 / spec-20 plug in cleanly)

- The **which-method gate** (spec-13) is a `prediction` beat carrying `interaction.gate` (`{ kind, correct,
  optionMethods }`, README §4.5) — built on `prediction`, **not** `patternPick` (D12 / R11). The `isCheckpointBeat`
  predicate in step 6 **already detects it** via `type === 'prediction' && !!interaction.gate`, so when spec-13 lands
  the gate beats become checkpoints with **no edit to `CHECKPOINT_BEAT_TYPES`** — spec-13 only adds the schema member
  and passes `showConfidence`/`onConfidence` through where it mounts the gate. The opening qualitative `prediction`
  bet has **no** `gate` and so is never matched — it stays EXEMPT (D6), which is exactly why this spec keys on
  `interaction.gate` rather than on the `prediction` type.
- The **spaced-review problem** (the third D6 capture site) is **not** captured by this spec. It is surfaced by the
  Daily Review queue (spec-20), which mounts `ConfidenceRating` and passes the chosen number to `submitReview`, where
  it lands in `reviews/{cardId}.lastConfidence` (README §4 Foundation A; owned by spec-01's callable, gate Issue #8).
  See §3.6 for the hand-off so this site is not orphaned.
- spec-12 imports `CONFIDENCE_SCALE` from `ConfidenceRating.tsx` and reads all three D6 sites: `confidenceByBeat`
  (in-lesson checkpoints), `Turn.confidence` (interview), and `card.lastConfidence` (spaced review). It owns all scoring.

---

## 7. Tests

**Unit (vitest — `./node_modules/.bin/vitest run`):**

1. `src/lesson/mastery.test.ts` (extend): `isCheckpointBeat` → true for `masteryChallenge`; true for a `prediction`
   beat **carrying `interaction.gate`** (the which-method gate, spec-13); **false** for a `prediction` beat **without**
   `gate` (the EXEMPT opening bet — D6); false for `equationTiles`, `coinSim`, `recap`. This pins that `'prediction'`
   is never in `CHECKPOINT_BEAT_TYPES`.
2. `src/lesson/snapshot.test.ts` (new or extend): `toSnapshot()` includes `confidenceByBeat`; `confidencesOf()`
   round-trips `{ 'mc-1': 0.85 }`; absent map → `{}` (never `undefined`).
3. `src/lesson/ConfidenceRating.test.tsx` (new, jsdom): renders 4 buckets; clicking "Certain" calls `onSelect(1.0)`;
   `aria-checked` reflects `value`; asserts `CONFIDENCE_SCALE` values are exactly `[0.5, 0.7, 0.85, 1.0]` and all lie
   in `[0.5, 1.0]`.
4. `src/interview/interviewConfidence.test.ts` (new): import `stampConfidence` from
   `src/interview/useRealtimeInterview.ts` (where it is exported, beside `buildTranscript`). Assert it puts
   `confidence` on the **last** candidate turn only; returns input unchanged when there is no candidate turn; never
   mutates input (referential check). The hook's realtime state machine (the paused `'confidence'` status) is **not**
   exercised here — only the pure helper.

**Fixture validation:** `tsx scripts/validate-fixtures.ts` — must stay green (additive optional schema; no fixture
changes). No new validator assertion in this spec.

**Existing suites must stay green:** `src/interview/transcript.test.ts` (Turn shape unchanged for existing fields).

**Rules tests:** none — the snapshot collection is already client-writable by the owner; the interview attempt is
Function-written and this spec adds no new attempt field beyond the existing `transcript`. (See §8 R4.)

**Manual `/dev` check (no Firebase/Java — AGENTS.md):**
- `/dev/lesson/<id-with-a-masteryChallenge>` launched with the dev harness passing `showConfidence`:
  answer the mastery challenge → the 4-bucket row appears → tapping a bucket highlights it → tapping **Continue**
  advances (rating never blocks).
- With `showConfidence` off (Track A simulation): no row appears; flow identical to today.

---

## 8. Foolproofing (README §8)

- **R3 — client snapshot write; hydration + offline.** `confidenceByBeat` follows the **exact** `maxHintLevelByBeat`
  pattern: state seeded from `initialSnapshot` only when fully hydrated and not in `review`; mirrored into
  `snapshotInput` (memoized) so the debounced writer + synchronous localStorage mirror + flush-on-beat-change all
  apply unchanged. Offline/permission-denied writes already fail silently in the writer (`snapshot.ts:163-171`) — no
  new failure mode. **Never write `undefined`:** `confidencesOf` returns `{}` and `toSnapshot` always sets the key to
  the (possibly empty) record, consistent with `hintLevelByBeat`. → covered by snapshot round-trip test.
- **R4 — schema migrations are permanent; route progression writes through a Function.** `confidenceByBeat` lives in
  the **client-written snapshot** (not a progression doc), so it correctly does **not** go through a Function and
  needs **no `firestore.rules` change** (owner already writes `snapshots/*`). The interview `Turn.confidence` rides
  the existing `transcript` field of the Function-written attempt — **no new attempt field, no rules change, no new
  index** (no query touches it). Field shapes are frozen here per §4 before coding.
- **R5 (avoid silently degrading a foundation):** spec-12 depends on this capture. The field name/shape match README
  §4 exactly so spec-12 is not stubbed against a wrong name. The one open shape choice (`Turn.confidence` vs an
  attempt field) is flagged for the gate (§3.5).

---

## 9. Data / schema deltas (only deltas; shared shapes in README §4)

- `SnapshotSchema.interactionState` (`src/content/schema.ts`): `+ confidenceByBeat?: Record<string, number>`
  (Foundation C contract — authoritative name).
- `Turn` (`src/content/interviewPack.ts`): `+ confidence?: number` — **shared field, now locked in README §4.5** to
  the transcript/`Turn` (the open "transcript **or** attempt" choice was resolved by the consistency gate). Consumed
  by spec-12/spec-23.
- `BeatProps` (`src/lesson/beats/types.ts`): `+ showConfidence? / confidenceValue? / onConfidence?` (internal prop
  plumbing, not a persisted contract).
- `SnapshotInput` (`src/lesson/snapshot.ts`): `+ confidenceByBeat: Record<string, number>` (internal).
- `LessonPlayer` props (`src/lesson/LessonPlayer.tsx`): `+ showConfidence?: boolean` (default `false`; route-supplied
  gate). Routes pass it: `src/pages/LessonPage.tsx` (authed, from `userDoc`) and `src/pages/DevRoutes.tsx`
  (`true`) — internal prop plumbing, not a persisted contract.
- `InterviewStatus` (`src/interview/useRealtimeInterview.ts`): `+ 'confidence'` paused state;
  `UseRealtimeInterviewReturn` `+ submitConfidence: (value: number) => void`; hook signature gains a third
  `showConfidence = false` param (passed from `App.tsx`). Internal — no persisted contract.
- No Firestore rules, no index, no progression-doc change.

---

## 10. Definition of Done

- [ ] `confidenceByBeat?: Record<string, number>` added to `SnapshotSchema.interactionState`; `Turn.confidence?: number`
      added — both additive/optional.
- [ ] `src/lesson/ConfidenceRating.tsx` created, exporting `CONFIDENCE_SCALE` (`[0.5,0.7,0.85,1.0]`) and the component.
- [ ] Rating renders on `masteryChallenge` **only when the quant-intensity gate is on**, after answering, never gating
      advance; Track A shows nothing.
- [ ] `isCheckpointBeat` detects the which-method gate via `type === 'prediction' && !!interaction.gate` and **does
      not** add `'prediction'` to `CHECKPOINT_BEAT_TYPES`, so the EXEMPT opening bet is never captured (D6; README §4.5).
- [ ] Snapshot round-trips the field (hydrate → restore on mid-lesson refresh); empty map never serializes `undefined`.
- [ ] Routes pass `showConfidence` (`LessonPage.tsx` from `userDoc`; `DevRoutes.tsx` = `true`) so the feature
      actually renders — without these edits the prop defaults to `false` and nothing shows.
- [ ] Interview confidence captured inside the hook's paused `'confidence'` status (works for both the user-pressed
      and countdown-driven `stop()`); `Turn.confidence` lands on the last candidate turn when gated on; off otherwise.
- [ ] **No Brier / aggregate / surfacing** (spec-12 owns that).
- [ ] `./node_modules/.bin/vitest run` green (new tests in §7 + existing transcript/snapshot/mastery suites).
- [ ] `tsx scripts/validate-fixtures.ts` green.
- [ ] `./node_modules/.bin/eslint` clean on every file in §4 step 13.
- [ ] Manual `/dev/lesson` check (§7) passes both gate-on and gate-off.
- [ ] Third D6 site (spaced-review confidence) hand-off documented (§3.6): captured by spec-20 → `submitReview`
      `confidence?` → `reviews/{cardId}.lastConfidence` (spec-01), **not** by this spec — so it is not orphaned.
