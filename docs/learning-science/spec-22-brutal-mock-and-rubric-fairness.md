# spec-22 — Brutal mock (track-gated) + tier-aware rubric fairness + practice-vs-performance gap

**Status:** Planned
**Phase:** 2 (Surfaces)
**Depends-on:** spec-02 (confidence capture — provides `Turn.confidence`, not load-bearing for this spec's core; see §1) · spec-12 (calibration scoring — **owns** the correctness-binarization constant `CORRECTNESS_PASS_THRESHOLD`/`isCorrect`, which this spec **imports** rather than re-deriving; README §7 DAG)
**Implements:** brainlift app-action **#7** (the mock) · decisions **D9** (tier-aware rubric scaling = bug fix all tracks; brutal mock default for the quant-intensity gate, `hard` for Track A) · **D2** (quant-intensity gate) · README §1 row 6 (SPOV3: brutal is a Track-B/quant default, not global; tier-aware rubric scaling is a correctness bug)

> Read [`README.md`](README.md) §1 (esp. **row 6** — `tierFloor` already defaults to `'hard'`; the live mint passes no
> floor; **there is no tier-aware rubric scaling — a brutal question is graded by the hard rubric, deflating the
> score**), §3 (**D9**, **D2**), §4 (no shared schema foundation is *consumed* here except spec-02's `Turn.confidence`,
> which is optional context), §8 (**R12** — server timestamps / server-controlled time only), §10 (template) **before
> coding.** Also read [`docs/capstone-interview/README.md`](../capstone-interview/README.md) (tiers `hard|harder|brutal`;
> the grader; Firestore attempt layout).
>
> **Coordinate with spec-23** (interview report feed-forward): spec-23 **removes `hireSignal`** from
> `INTERVIEW_REPORT_SCHEMA` / `InterviewReport` and adds the calibration delta + feed-forward fix cards. This spec
> **adds** two grader-output fields (`tier`, `pressureNote`) and **adds a client-computed gap block**. §3.5 and §8
> spell out exactly how the two specs share the `InterviewReport` shape so neither clobbers the other.

---

## 1. Goal & non-goals

**Goal.** Three changes to the capstone mock, all in the interview subsystem:

1. **Track-gate the tier floor at mint.** The quant-intensity gate (Track B **OR** `learningGoal === 'interview'`)
   draws from `tierFloor: 'brutal'`; Track A draws from `tierFloor: 'hard'` (today's effective behaviour, made
   explicit). The `drawQuestion` plumbing for this **already exists** (`DrawOpts.tierFloor`) and is simply unused at
   the live mint (`interview.ts:212`).
2. **Tier-aware rubric scaling in the grader (correctness bug fix, ALL tracks).** Today every question is graded on the
   same flat 1–5 scale regardless of tier, so a `brutal` question graded against an implicitly `hard`-calibrated
   expectation deflates the score. Make the grader **tier-aware**: tell it the question's tier and how to interpret the
   1–5 scale *relative to that tier's difficulty*, and echo the `tier` back in the report so the UI can label it. This
   is a fairness fix, not a Track-B feature.
3. **Surface the practice-vs-performance gap + a "pressure graduation" note** on the report: the learner's **in-app
   accuracy** (computed client-side from their concept progress) next to their **interview accuracy** (from the report's
   `correctness` dimension), with a one-line "pressure graduation" explanation of why under-pressure retrieval is the
   real signal.

**Non-goals.**
- **No Brier / calibration math.** That is spec-12 (capture) + spec-23 (surface the predicted-vs-measured delta). This
  spec surfaces a *practice-accuracy vs interview-accuracy* gap, which is a different, simpler signal (no confidence
  needed) and is computed entirely client-side.
- **No removal of `hireSignal`.** spec-23 owns that. This spec must be written so that spec-23's removal is a clean
  delete (see §3.5 / §8). If spec-23 lands first, this spec adapts (§3.5 note).
- **No new SR card, no mastery change, no streak change, no governor.** Those are spec-10/11/21.
- **No change to the draw algorithm, seen-set, fingerprinting, or pool top-up.** Only the *floor passed in* changes.
- **No new persisted field on the attempt doc beyond what the grader already writes** (the report). The gap block is
  rendered from data already available client-side (progress + the returned report); nothing new is stored.

**spec-02 dependency note.** spec-02 adds `Turn.confidence?` to the shared `Turn` type. This spec does **not** require
it for any of the three changes — the gap is computed from `correctness` + in-app accuracy, no confidence. The
dependency is declared because spec-02 is the only Phase-0 spec touching the interview pipeline. The quant-intensity
gate itself is **not** owned by spec-02: it is the shared `isQuantIntensity(userDoc, conceptProgress?)` helper in
`src/auth/track.ts` (README §4, gate Issue #9), which this spec imports — never re-deriving the predicate from
`defaultTrack` alone (§3.0/§3.1).

**spec-12 dependency note.** spec-12 owns the **correctness-binarization constant** `CORRECTNESS_PASS_THRESHOLD = 4`
and `isCorrect(correctnessScore)` in `calibration.ts` (byte-mirrored `src/progress/calibration.ts` ↔
`functions/src/calibration.ts`). The gap block's *binary* "was the interview answer correct?" decision **imports**
`isCorrect` from there (README §7 DAG: spec-22 "shares the correctness-binarization constant; spec-12 owns it") — this
spec does **not** redefine the threshold (§3.3).

---

## 2. Current reality (verified — file:line)

| Fact | Evidence |
|---|---|
| `drawQuestion` accepts `DrawOpts.tierFloor` (`'hard'|'harder'|'brutal'`), **default `'hard'`**, and filters the eligible pool to `TIER_ORDER.indexOf(q.tier) >= tierMin`. The plumbing for a brutal floor **already exists**. | `functions/src/interviewDraw.ts:12-25` (`DrawOpts`), `:47-48` (`const { tierFloor = 'hard' } = …`), `:57-62` (filter). |
| **The live mint passes NO opts** → effective floor `'hard'` → hard/harder/brutal mix equally for everyone. | `functions/src/interview.ts:212` `const draw = drawQuestion(pack, seenQuestionIds)`. |
| The attempt doc records the drawn `tier`. So a per-attempt tier is already persisted. | `functions/src/interview.ts:230` (`tier: question.tier`). |
| **The grader prompt is tier-blind.** It interpolates `question.prompt`, `hidden.answer`, `approaches`, `wrongTurns`, and the five **qualitative** rubric strings — but never the tier, and never any instruction to scale the 1–5 score by difficulty. | `functions/src/interview.ts:377-400` (`buildGraderPrompt`). |
| The rubric is **per-question qualitative text** (`correctness/approach/rigor/communication/speed`), identical in *structure* across tiers; it is **not** a per-tier numeric calibration. Verified across the EV pack: a `brutal` linearity question and a `hard` fair-value question carry differently-worded but equally flat rubrics, with no "this is harder, grade leniently/strictly" signal. | `src/content/interviewPack.ts:23-29` (`RubricSchema`), and EV pack inspection: `hard` (`tmpl-fair-value#loaded-high6`), `harder` (`tmpl-fair-value#lottery-4tier`), `brutal` (`tmpl-linearity#noodles-7`) all 5 flat strings. |
| The grader output schema is `INTERVIEW_REPORT_SCHEMA` (strict; mirrors `InterviewReport`): `dimensions{correctness,approach,rigor,communication,speed:{score 1-5, evidence}}`, `hireSignal` enum, `summary`, `strengths[]`, `fixes[]`. **`additionalProperties:false` everywhere, every property in `required`.** | `functions/src/interview.ts:327-363`; mirrored type `src/content/interviewPack.ts:131-143`. |
| The grade transaction finalizes the attempt with `status:'graded'`, `transcript`, `report`, `hireSignal`, `durationSec`, **`gradedAt: serverTimestamp()`**, `updatedAt`. Server time only — R12 already satisfied on the existing path. | `functions/src/interview.ts:484-497`. |
| `interviewDraw.ts` and `interviewPack.ts` each have a **byte-identical copy** under `functions/src/` and `src/content/`. A drift guard fails the build if they diverge. **Any edit to one MUST be mirrored.** | `scripts/validate-interview-packs.ts:410-423` (`functions/src/${mod} has drifted … re-copy`); confirmed `diff` of both pairs = identical. **This spec touches `functions/src/interview.ts` only (server-only, no copy) and the mint input plumbing — see §3.1 for why no `interviewDraw`/`interviewPack` edit is needed.** |
| Client mint wrapper `mintInterviewToken({conceptId, mode?})` injects `timezone`; the realtime hook calls it with `{ conceptId }` only (no track). | `src/interview/functions.ts:50-67`; `src/interview/useRealtimeInterview.ts:517` `await mintInterviewToken({ conceptId })`. |
| Track resolution is client-side: per-concept `progress/{conceptId}.track` (`loadTrack`), falling back to `userDoc.defaultTrack ?? 'B'`. `learningGoal` lives on `userDoc`. | `src/progress/track.ts:18-29`; `src/auth/userDoc.ts:25,29,40,44,96-100`. |
| The report UI (`InterviewReportView`) renders `hireSignal`, `summary`, the five dims with pip scores + evidence, strengths, fixes. No tier label, no gap block. | `src/interview/InterviewReportView.tsx` (full file). |
| In-app accuracy: **there is no stored accuracy number.** The durable per-lesson signal is `progress.derived.mastered` (bool, frozen — `schema.ts:756-758`) and the live `snapshots/{lessonId}.interactionState.maxHintLevelByBeat`. The client already subscribes to the per-concept progress map. | `src/content/schema.ts:747-760` (`ProgressDerivedSchema`, `mastered`); `src/progress/progress.ts:29` (`subscribeProgressMap`); `src/pages/CoursePathPage.tsx:56,151` (per-concept `progressById`). |
| The interview is **one question per attempt** (`MintInterviewTokenOutput.question` singular; `report.dimensions.correctness` is the single correctness score). So "interview accuracy" for an attempt = the `correctness` dimension (1–5), not a count. | `functions/src/interview.ts:171-179`, `:305`; report shape above. |

**Discrepancy vs brief:** none material. The brief's "tierFloor ~17-19 default 'hard'" is at `:47-48` (the default lives
in the destructure, the *type* at `:12-25`); "mint ~212 passes no tierFloor" is exact. The brief's "hidden.rubric is
qualitative per-tier?" → **qualitative, but NOT tier-calibrated** (same flat 1–5 expectation regardless of tier) — this
is precisely the bug. **Important correction the brief implies but does not state:** the tier floor change needs **no
edit to `interviewDraw.ts`** (the option already exists) — only the mint must pass it; this avoids the byte-identical
drift hazard entirely for change #1.

---

## 3. Design

### 3.0 Where the gate is decided

The quant-intensity gate is the **shared `isQuantIntensity(userDoc, conceptProgress?)` helper** in `src/auth/track.ts`
(README §4 — *Shared helper, resolves gate Issue #9*). It encodes the canonical predicate
`effectiveTrack === 'B' || userDoc.learningGoal === 'interview'`, where
`effectiveTrack = conceptProgress?.track ?? userDoc?.defaultTrack ?? 'B'`. **This spec imports that helper; it must
NOT re-derive the predicate from `defaultTrack` alone** (gate Issue #9 — a learner must never be quant-gated in one
surface and gentle in another). The server mint (`mintInterviewToken`) does **not** read the progress/userDoc track
today. Two options:

- **(A) Client passes a resolved flag.** The client already knows the effective track (`loadTrack` + `defaultTrack`
  fallback) and `learningGoal` (userDoc), so it calls `isQuantIntensity(userDoc, conceptProgress)` and passes a single
  `intensity: 'gentle' | 'brutal'` (or equivalently `tierFloor`) mint input.
- **(B) Server resolves track + learningGoal** by reading `progress/{conceptId}` + the user doc.

**Decision: (A) — client passes `tierFloor`, server validates and clamps.** Rationale: the client already owns track
resolution (`src/progress/track.ts`) and userDoc; option (B) duplicates that logic server-side and adds two Firestore
reads to a latency-sensitive mint. The tier floor is **not a security boundary** (the worst a spoofing client can do is
ask itself harder or easier questions — it cannot leak answers, exceed quota, or change grading; the grader fairness fix
is independent and server-authoritative). The server still **validates** the input against the `Tier` enum and defaults
to `'hard'` on anything invalid/absent (so a stale client that sends nothing gets the gentle default — safe). This
mirrors how `mode` is already validated server-side (`interview.ts:188`).

> **R12 note:** the tier floor is a *difficulty knob*, not a time/scheduling input, so R12 (no client timestamps for
> scheduling) does not bite here. The grade path's server `gradedAt` is untouched. We add **no** client timestamp anywhere.

### 3.1 Change #1 — track-gated tier floor (mint)

- **`MintInterviewTokenInput`** (server `functions/src/interview.ts:165-169` and client mirror
  `src/interview/functions.ts:24-28`): add `tierFloor?: 'hard' | 'harder' | 'brutal'`.
- **Server validation** (`mintInterviewToken`, near `mode` resolution `:188`): resolve a safe floor:
  ```ts
  const TIERS = ['hard', 'harder', 'brutal'] as const
  const tierFloor: (typeof TIERS)[number] =
    (TIERS as readonly string[]).includes(data.tierFloor as string)
      ? (data.tierFloor as (typeof TIERS)[number])
      : 'hard' // safe gentle default for absent/invalid (Track A, or a stale client)
  ```
  Pass it to the draw: `const draw = drawQuestion(pack, seenQuestionIds, { tierFloor })` (`:212`).
  → **no edit to `interviewDraw.ts`** — the option already exists; the drift guard is not engaged.
- **Pool-empty resilience.** `drawQuestion` returns `null` when the floored pool is exhausted, and the mint already
  throws `failed-precondition` "No interview questions remaining" (`:213-218`). With `tierFloor:'brutal'` the eligible
  pool is *smaller* (EV pack: 13 brutal vs 58 total), so a heavy Track-B user can exhaust brutal-only sooner. **Add a
  graceful fallback:** if the brutal draw is `null`, retry once at `'hard'` before throwing, so a Track-B learner who
  has seen all brutal questions still gets a (now easier) interview rather than a hard error:
  ```ts
  let draw = drawQuestion(pack, seenQuestionIds, { tierFloor })
  if (!draw && tierFloor !== 'hard') {
    draw = drawQuestion(pack, seenQuestionIds, { tierFloor: 'hard' })
  }
  if (!draw) throw new HttpsError('failed-precondition', 'No interview questions remaining for this concept.')
  ```
- **Client wrapper** (`src/interview/functions.ts`): add `tierFloor?` to `MintInterviewTokenInput` type and pass it
  through (it already spreads `...input`).
- **Caller computes the gate** (`src/interview/useRealtimeInterview.ts:517`): resolve the gate via the **shared
  `isQuantIntensity` helper** (`src/auth/track.ts`, README §4) and pass the floor. The hook receives `conceptId` only
  today; it must learn the gate. The route computes the quant-intensity gate and passes it down rather than reading
  userDoc inside the hook:
  ```ts
  // InterviewPage/route computes (using the shared helper — do NOT inline the predicate):
  //   import { isQuantIntensity } from '../auth/track'
  //   const intensity = isQuantIntensity(userDoc, conceptProgress) ? 'brutal' : 'hard'
  // and passes it into useRealtimeInterview, which forwards it as tierFloor.
  mintResult = await mintInterviewToken({ conceptId, tierFloor })
  ```
  Add `tierFloor?: 'hard'|'harder'|'brutal'` (or a derived `intensity`) param to `useRealtimeInterview` and to
  `InterviewPage` props; the authed route resolves it via `isQuantIntensity`. `/dev/interview` may pass `'brutal'` to
  demo it (the dev transport never calls the real mint — `useRealtimeInterview.ts:501` `model:'dev'`).

  > **Surgical:** add **one** optional param threaded route→page→hook→mint. Default `'hard'` everywhere so Track A and
  > all existing tests are unchanged without touching them.

### 3.2 Change #2 — tier-aware rubric scaling (grader; ALL tracks)

The grader prompt must (a) state the question's **tier** and (b) instruct the model to interpret the 1–5 scale
**relative to that tier's difficulty band**, so a strong attempt on a `brutal` question is not deflated by an implicit
`hard` yardstick. Implementation is **prompt-only + one new output field** — no change to the grading transaction, no
new Firestore field beyond the report.

- **`buildGraderPrompt(question, transcript)`** (`functions/src/interview.ts:377-400`): inject tier + a tier-calibration
  block. Add near the rubric:
  ```ts
  '## Question difficulty tier',
  `This question is tier: ${question.tier}.`,
  TIER_CALIBRATION[question.tier],
  ```
  where `TIER_CALIBRATION` is a new server-only constant:
  ```ts
  // Tier-aware rubric scaling (spec-22 / D9). The 1–5 dimension scores must be
  // calibrated to the QUESTION'S tier so a brutal question is not graded on a
  // hard-question yardstick. This is a fairness fix for ALL tracks, not a Track-B
  // feature. The bands describe how to map performance → score AT THIS TIER.
  const TIER_CALIBRATION: Record<'hard' | 'harder' | 'brutal', string> = {
    hard:
      'Standard interview difficulty. Grade against a solid prepared candidate: ' +
      'a correct, well-explained solution earns 5; minor gaps earn 3–4.',
    harder:
      'Above standard. The problem has an extra twist or heavier computation. ' +
      'Credit partial progress generously — reaching the right setup and a ' +
      'mostly-correct path is a 4 even if the final value has a slip. Do NOT ' +
      'penalize for the added difficulty itself.',
    brutal:
      'Top-tier / brain-teaser difficulty. Many strong candidates fail this. ' +
      'Grade on insight and method, not just the final number: identifying the ' +
      'key idea and a viable approach is already a 3–4; a complete rigorous ' +
      'solution is a 5. A blank or fundamentally wrong approach is still low, ' +
      'but do NOT deflate a genuine strong attempt because the question is hard.',
  }
  ```
- **Echo the tier into the report** so the UI can label "graded as a *brutal* question" and the gap block (§3.3) can
  caveat fairly. Add `tier` to `INTERVIEW_REPORT_SCHEMA` and to `InterviewReport`:
  - `INTERVIEW_REPORT_SCHEMA.properties.tier = { type: 'string', enum: ['hard','harder','brutal'] }` and add `'tier'`
    to `required` (strict mode demands it). The model fills it from the prompt; **also defensively overwrite it
    server-side** from the attempt's known tier after parsing (the server already knows `question.tier` — trust the
    server, not the model, for the label):
    ```ts
    const report = JSON.parse(reportJson) as InterviewReport
    report.tier = question.tier // authoritative; the model's echo is belt-and-suspenders
    ```
  - `InterviewReport` (`src/content/interviewPack.ts:131-143`): add `tier: 'hard' | 'harder' | 'brutal'`.

  > Adding `tier` to a **strict** schema requires it in `required` + keeps `additionalProperties:false`. Because we
  > overwrite it server-side anyway, the schema field is mostly to keep strict-mode happy and document intent.

- **`pressureNote`** — the "pressure graduation" line (D9 brief). One short grader-authored sentence framing the result
  as *under-pressure retrieval*, not a verdict. Add to schema + type the same way:
  - `INTERVIEW_REPORT_SCHEMA.properties.pressureNote = { type: 'string' }`, add to `required`.
  - `InterviewReport`: `pressureNote: string`.
  - Prompt instruction (append to `buildGraderPrompt`):
    ```
    Also output `pressureNote`: ONE sentence reminding the candidate that a live,
    timed, spoken interview is harder than untimed practice, and that improving
    under-pressure retrieval (not just knowing the method) is the goal. Encouraging,
    forward-looking, never a hire/no-hire verdict.
    ```

### 3.3 Change #3 — practice-vs-performance gap block (client, report UI)

A new block in `InterviewReportView` showing **in-app accuracy** vs **interview accuracy** + a one-line pressure
graduation note. **All data is already client-side** — no new persisted field, no extra Firestore read beyond the
per-concept progress map the course pages already subscribe to.

- **Interview accuracy (this attempt):** `report.dimensions.correctness.score` (1–5) → render as a 0–100% bar via
  `score / 5`. (One question per attempt, so correctness *is* the interview-accuracy proxy.) The `score / 5` value is a
  **display-only continuous proxy** for the bar length; it is **not** a re-derivation of any pass threshold. Wherever a
  *binary* "did they get the interview question right?" judgment is needed (e.g. the consistency between this gap
  framing and calibration), **import `isCorrect` / `CORRECTNESS_PASS_THRESHOLD` from spec-12's `calibration.ts`**
  (README §7 DAG — spec-12 owns the constant) rather than inventing a local `>= N` cutoff. Do not redefine the
  threshold here.
- **In-app accuracy (this concept):** a **pure helper** `computeInAppAccuracy(progressList)` over the concept's
  per-lesson progress docs. **The caller MUST pass only the progress docs for this concept's lessons** — the helper does
  no concept filtering of its own (it cannot: a progress doc carries no `conceptId`; see §3.4 for how `InterviewPage`
  scopes the docs to the concept's `lessonIds` before calling). Definition (kept deliberately simple and honest):
  ```ts
  // Fraction of COMPLETED graded lessons in this concept that the learner
  // mastered first-try (derived.mastered === true). This is the in-app
  // "looked easy in practice" signal. Returns null when too few completed
  // lessons to be meaningful (< MIN_LESSONS) so the UI can hide the comparison.
  // PRECONDITION: `progress` is already scoped to ONE concept's lessons (§3.4).
  export function computeInAppAccuracy(
    progress: { completionStatus?: string; derived?: { mastered?: boolean } }[],
  ): number | null {
    const completed = progress.filter((p) => p.completionStatus === 'completed')
    if (completed.length < 3) return null
    const mastered = completed.filter((p) => p.derived?.mastered === true).length
    return mastered / completed.length
  }
  ```
  > **Why `derived.mastered` and not `maxHintLevelByBeat`?** `derived.mastered` is the same frozen first-try signal the
  > medallion uses (R2) and is already in the progress map the page subscribes to — zero extra reads, and it is exactly
  > the "in-app fluency" the thesis (README §2) says is *negatively* diagnostic of readiness. The gap block makes that
  > thesis visible: high in-app mastery + low interview correctness = the practice-vs-performance gap.
- **The gap framing:** if in-app accuracy is high and interview accuracy is lower, render the pressure-graduation note
  (from `report.pressureNote`, with a static fallback string if absent for an old attempt). Never frame it as failure —
  "Your practice looked strong; the live interview is the harder, realer test. Keep closing that gap."
- **Tier label:** show "Graded as a **{tier}** question" next to the correctness bar so a Track-B learner sees their
  score was tier-calibrated (ties change #2 to the surface).

The block is rendered **unconditionally** when both numbers are available (it is informational and honest for everyone),
but the *pressure-graduation emphasis* only highlights when `inApp - interviewAccuracy >= GAP_THRESHOLD` (e.g. 0.2).

### 3.4 Wiring the progress data into the report view

`InterviewReportView` is rendered by `InterviewPage` (`src/pages/InterviewPage.tsx` `status === 'done'`). The page does
**not** currently load progress.

> **CRITICAL — scope the progress to THIS concept (do not pass the whole library).** `subscribeProgressMap`
> (`src/progress/progress.ts:29-56`) returns the **entire** `users/{uid}/progress` collection keyed by **lessonId across
> ALL concepts**, and `ProgressSchema` (`src/content/schema.ts:762-780`) carries **no `conceptId`/`courseId` field**, so
> the progress docs alone cannot be filtered to one concept. The concept→lesson mapping lives **only in the course
> definition** (`CourseSchema.lessons[].lessonId` and `CourseSchema.chapters[].lessonIds` — `schema.ts:669-715`), loaded
> by `loadCourseFromFirestore` (`src/content/firestoreLoader.ts:24`). `InterviewPage` does **not** load the course today.
> Passing `Object.values(progressMap)` straight to `computeInAppAccuracy` would compute the learner's accuracy across
> their **whole library**, not "this concept" as §3.3 promises.

`InterviewPage` must therefore, in addition to the progress map:

1. **Load the course for `conceptId`** via `loadCourseFromFirestore(conceptId)` (the same loader `CoursePathPage` uses at
   `src/pages/CoursePathPage.tsx:78`).
2. **Derive this concept's lesson IDs** from the loaded `Course`: union of `course.lessons.map(l => l.lessonId)` and
   `course.chapters?.flatMap(c => c.lessonIds)` (chapters are optional; `lessons` is the authoritative built path). A tiny
   pure helper `conceptLessonIds(course): Set<string>` keeps this testable.
3. **Intersect** the progress map keys (lessonIds) with that set and pass **only the matching docs** to
   `computeInAppAccuracy`:
   ```ts
   // InterviewPage, status === 'done'
   const lessonIds = conceptLessonIds(course)              // from CourseSchema
   const conceptProgress = Object.entries(progressMap)
     .filter(([lessonId]) => lessonIds.has(lessonId))
     .map(([, p]) => p)
   const inAppAccuracy = computeInAppAccuracy(conceptProgress)
   ```
4. Pass `inAppAccuracy: number | null` into `InterviewReportView` as a prop.

Keep `InterviewReportView` **presentational** (it already is): it receives `inAppAccuracy` + reads `report.tier`,
`report.dimensions.correctness.score`, `report.pressureNote`. While the course is still loading, treat `inAppAccuracy` as
`null` (the gap block hides cleanly, per §3.3). The `/dev` harness can pass a stub `inAppAccuracy` (and need not load a
real course) to preview the block.

> **Surgical:** one new prop on `InterviewReportView`; two pure helpers in `src/interview/gap.ts`
> (`computeInAppAccuracy` + `conceptLessonIds`); and, in `InterviewPage`, the course load **plus** the per-concept
> progress load + key intersection. No change to the report *schema* for the gap (it is derived, not stored).

### 3.5 Coordination with spec-23 (shared `InterviewReport`)

spec-23 **removes** `hireSignal` from `INTERVIEW_REPORT_SCHEMA`, `InterviewReport`, the type re-exports, the attempt
write (`hireSignal: report.hireSignal` at `interview.ts:491`), `InterviewAttemptSchema` (`attempts.ts`), `selectBest`,
and the report UI signal badge; it **adds** a calibration delta + feed-forward fix cards.

This spec **adds** `tier` and `pressureNote` to the same schema/type. To avoid a merge collision:

- **Both specs edit `INTERVIEW_REPORT_SCHEMA` and `InterviewReport` additively/subtractively in disjoint fields**
  (`tier`/`pressureNote` added here; `hireSignal` removed there; calibration added there). Whichever lands second
  rebases onto the first — no field is touched by both.
- **`required` array (strict mode):** both specs modify it. The merged `required` must list **exactly** the properties
  present after both changes (§4.5 records both deltas). Concretely:
  - Today (pre-both): `['dimensions','hireSignal','summary','strengths','fixes']` (verified `interview.ts:350`).
  - After **spec-22** (this spec ADDS `tier`/`pressureNote`): `required` =
    `['dimensions','hireSignal','summary','strengths','fixes','tier','pressureNote']`.
  - After **spec-23** also lands (it REMOVES `hireSignal` and ADDS its calibration field per §4.5): drop `'hireSignal'`
    and add spec-23's calibration property → `['dimensions','summary','strengths','fixes','tier','pressureNote', …spec-23 calibration field]`.

  **The merger must reconcile `required` to match the final property set** (no orphaned `hireSignal`, both
  `tier`/`pressureNote` present) **or strict-mode grading throws at runtime.** `tier`/`pressureNote` and `hireSignal`
  are disjoint fields, so spec-22 and spec-23 never clobber each other's *properties* — only the shared `required`
  array needs this manual reconciliation.
- **`pressureNote` is independent of `hireSignal`** — it is the encouraging forward-looking line spec-23's feed-forward
  philosophy wants anyway, so it survives spec-23 unchanged.
- **If spec-23 lands first:** drop nothing; just add `tier`/`pressureNote` to the (already hireSignal-free) schema/type
  and reconcile `required`.

> **NEW SHARED FIELDS — flag for the consistency gate:** `InterviewReport.tier: 'hard'|'harder'|'brutal'` and
> `InterviewReport.pressureNote: string` (also in `INTERVIEW_REPORT_SCHEMA`). These coexist with spec-23's removal of
> `hireSignal`; the merger reconciles the strict-mode `required` array (§8).

---

## 4. Step-by-step implementation

> Surgical (AGENTS.md): minimum code, match existing style. **`functions/src/interview.ts` is server-only (no
> byte-identical copy)** — it is safe to edit directly. Do **not** edit `interviewDraw.ts`/`interviewPack.ts` for change
> #1 (no need) — but change #2 edits `InterviewReport` in `src/content/interviewPack.ts`, which **has a copy at
> `functions/src/interviewPack.ts`** → **mirror it and re-run the drift guard** (step 5).

1. **Mint input + server floor resolution** — `functions/src/interview.ts`:
   - Add `tierFloor?: 'hard' | 'harder' | 'brutal'` to `MintInterviewTokenInput` (`:165-169`).
   - In `mintInterviewToken`, after `mode` is resolved (`:188`), add the `TIERS`/`tierFloor` validation block (§3.1).
   - Replace `:212` draw with the floored draw + the brutal→hard fallback (§3.1).
   → **verify:** `./node_modules/.bin/eslint functions/src/interview.ts` clean; a unit test (step 6) asserts an invalid
     `tierFloor` resolves to `'hard'` and `'brutal'` is passed through.

2. **Client mint wrapper** — `src/interview/functions.ts`: add `tierFloor?: 'hard'|'harder'|'brutal'` to
   `MintInterviewTokenInput` (`:24-28`); it already spreads `...input` so no body change.
   → **verify:** `tsc`/build passes; `./node_modules/.bin/eslint src/interview/functions.ts` clean.

3. **Thread the gate route → page → hook → mint** — `src/interview/useRealtimeInterview.ts`,
   `src/pages/InterviewPage.tsx`, and the authed route that mounts `InterviewPage`:
   - `useRealtimeInterview(conceptId, _transport, tierFloor='hard')` — forward `tierFloor` into the
     `mintInterviewToken({ conceptId, tierFloor })` call (`:517`).
   - `InterviewPage` gains a `tierFloor?` (or `intensity?`) prop, defaulting to `'hard'`, passed to the hook.
   - The authed route resolves the gate with the **shared helper**: `isQuantIntensity(userDoc, conceptProgress) ?
     'brutal' : 'hard'` (`src/auth/track.ts`, README §4). Use `loadTrack`/`defaultTrack` + userDoc to assemble the
     helper's args; **do NOT inline the `track === 'B' || …` predicate** (gate Issue #9). Pass the floor to `InterviewPage`.
   → **verify:** `/dev/interview` still works (dev transport bypasses mint); default `'hard'` keeps all existing
     `InterviewPage` / hook tests green without edits.

4. **Tier-aware grader prompt + new report fields** — `functions/src/interview.ts`:
   - Add the `TIER_CALIBRATION` constant (§3.2).
   - In `buildGraderPrompt`, inject the tier line + calibration block + the `pressureNote` instruction (§3.2).
   - In `INTERVIEW_REPORT_SCHEMA` (`:327-363`): add `tier` (enum) and `pressureNote` (string) to `properties` and to
     `required`; keep `additionalProperties:false`.
   - After `JSON.parse` (`:467`): `report.tier = question.tier` (authoritative overwrite). Extend the post-parse
     completeness check (`:468-469`) to also require `report.tier` and `report.pressureNote`.
   - The grade transaction write (`:484-497`) already writes the full `report` — no change needed (tier/pressureNote
     ride inside it).
   → **verify:** unit test (step 6) asserts `buildGraderPrompt` includes the tier string and the calibration band for
     each tier; `INTERVIEW_REPORT_SCHEMA.required` contains `tier` + `pressureNote`.

5. **Mirror `InterviewReport` to both copies + drift guard** — `src/content/interviewPack.ts` **and**
   `functions/src/interviewPack.ts`: add `tier: 'hard'|'harder'|'brutal'` and `pressureNote: string` to the
   `InterviewReport` interface (`:131-143`) in **both** files, byte-identically.
   → **verify:** `tsx scripts/validate-interview-packs.ts` passes the drift guard (`✓ functions copy in sync:
     interviewPack.ts`); `./node_modules/.bin/eslint` clean on both.

6. **`InterviewAttemptSchema`** — `src/interview/attempts.ts`: `report` is already `z.unknown().optional()`, so the new
   report fields need **no schema change** there. (spec-23 will edit this file to remove `hireSignal`; do not touch it
   here unless a test reads `report.tier` from a parsed attempt — it does not.)
   → **verify:** existing `attempts` tests stay green.

7. **In-app accuracy helper** — create `src/interview/gap.ts` (or add to `src/progress/`):
   `computeInAppAccuracy(progress)` (§3.3) + `conceptLessonIds(course): Set<string>` (union of
   `course.lessons[].lessonId` and `course.chapters?.flatMap(c => c.lessonIds)`, §3.4) + exported constants
   `MIN_LESSONS = 3`, `GAP_THRESHOLD = 0.2`, and the display-only proxy `interviewAccuracyFromScore(score: number) =>
   score / 5` (bar length only — NOT a pass threshold). **Do NOT define a correctness pass threshold here;** import
   `isCorrect`/`CORRECTNESS_PASS_THRESHOLD` from spec-12's `calibration.ts` if a binary correctness check is needed
   (README §7 DAG).
   → **verify:** unit test (step 9) covers `computeInAppAccuracy` (`< MIN_LESSONS` null case, all-mastered = 1.0,
     none-mastered = 0.0) and `conceptLessonIds` (collects from `lessons` and, when present, `chapters`).

8. **Report UI gap block** — `src/interview/InterviewReportView.tsx` + `InterviewPage.tsx`:
   - `InterviewPage`: load the course for `conceptId` (`loadCourseFromFirestore`, as `CoursePathPage` does at
     `CoursePathPage.tsx:78`) **and** the progress map (reuse `subscribeProgressMap`/`loadProgress`). Scope the progress
     to this concept by intersecting the map's keys (lessonIds) with `conceptLessonIds(course)`, then compute
     `inAppAccuracy = computeInAppAccuracy(conceptProgress)` (§3.4) and pass it as a prop. **Do NOT pass
     `Object.values(progressMap)` directly** — that map spans the learner's whole library (`progress.ts:29-56`;
     `ProgressSchema` has no `conceptId`), so unfiltered it computes library-wide accuracy, not "this concept". While the
     course is loading, pass `inAppAccuracy = null` (block hides).
   - `InterviewReportView`: accept `inAppAccuracy?: number | null`; render a new `.iv-gap` block showing the two
     accuracy bars, the "Graded as a **{report.tier}** question" label, and the pressure-graduation line
     (`report.pressureNote` with a static fallback). Emphasize the gap when
     `inAppAccuracy != null && inAppAccuracy - interviewAccuracyFromScore(correctness) >= GAP_THRESHOLD`.
   - Add minimal `.iv-gap` CSS in `src/styles/surfaces/interview.css` (reuse existing `.iv-*` idiom; check `/dev` first).
   → **verify:** on `/dev/interview` (or a report-view storybook/dev mount) the gap block renders with a stubbed
     `inAppAccuracy`; `aria-label`s present; no layout break.

9. **Tests** (see §7) and **lint** all touched files.
   → **verify:** `./node_modules/.bin/vitest run`, `tsx scripts/validate-fixtures.ts`,
     `tsx scripts/validate-interview-packs.ts`, `./node_modules/.bin/eslint` all green.

---

## 5. Two-track behavior

| | Track A (gentle default) | Quant-intensity gate: **Track B OR `learningGoal === 'interview'`** (D2) |
|---|---|---|
| **Mock tier floor** | `tierFloor: 'hard'` (today's effective mix, made explicit). | `tierFloor: 'brutal'`; if the brutal pool is exhausted, falls back to `'hard'` (never a hard error). |
| **Tier-aware rubric scaling** | **On (all tracks).** This is a correctness/fairness fix, not gated. A `hard` question is graded on the `hard` band; if a Track-A learner ever sees a `harder`/`brutal` question (pool mix), it is graded fairly too. | **On (all tracks).** Same mechanism; matters more here because brutal questions dominate the draw. |
| **Practice-vs-performance gap block** | Shown when ≥3 completed lessons exist (informational, honest for everyone). | Shown; the brutal tier label + the larger expected gap make the pressure-graduation framing land harder. |
| **Pressure-graduation note** | Shown (`report.pressureNote`). | Shown. |

The only **track-gated** change is the **tier floor** (#1). Changes #2 (rubric scaling) and #3 (gap block) are
**all-tracks** — #2 because it is a bug fix (README §1 row 6: "correctness bug fix for all tracks"), #3 because the gap
is honest signal for any learner.

---

## 6. Data / schema deltas (only deltas; shared shapes in README §4)

- **`MintInterviewTokenInput`** (server `functions/src/interview.ts`; client `src/interview/functions.ts`):
  `+ tierFloor?: 'hard' | 'harder' | 'brutal'` — a difficulty knob, server-validated, default `'hard'`. **Not a
  persisted field**, not security-sensitive (§3.0).
- **`INTERVIEW_REPORT_SCHEMA`** (`functions/src/interview.ts`): `+ tier` (enum `hard|harder|brutal`), `+ pressureNote`
  (string); both added to `required`; `additionalProperties:false` preserved.
- **`InterviewReport`** (`src/content/interviewPack.ts` **+ byte-identical** `functions/src/interviewPack.ts`):
  `+ tier`, `+ pressureNote`. **NEW SHARED FIELDS — flagged for the consistency gate (§3.5).**
- **No new Firestore field** beyond the existing `report` blob (the attempt already stores the whole report;
  `tier`/`pressureNote` ride inside it). **No rules change, no index** — no query touches the new fields.
- **No persisted in-app-accuracy field** — the gap is computed client-side from the existing per-concept progress map.
- **R12:** no client timestamp anywhere; the grade path's `gradedAt: serverTimestamp()` is untouched.
- **Imports (no redefinition):** the quant-intensity gate uses `isQuantIntensity` from `src/auth/track.ts` (README §4);
  any binary interview-correctness check uses `isCorrect`/`CORRECTNESS_PASS_THRESHOLD` from spec-12's `calibration.ts`
  (README §7 DAG). Neither predicate/constant is re-derived in this spec.

---

## 7. Tests

**Unit (vitest — `./node_modules/.bin/vitest run`):**

1. `functions/src/interview.grade.test.ts` (extend — it already mocks firebase so `interview.ts` imports cleanly):
   - `buildGraderPrompt(q, [])` includes `This question is tier: ${q.tier}` and the matching `TIER_CALIBRATION[q.tier]`
     band for each of `hard`/`harder`/`brutal` (parameterize over a stub question per tier).
   - `buildGraderPrompt` includes the `pressureNote` instruction text.
   - `INTERVIEW_REPORT_SCHEMA.required` contains `'tier'` and `'pressureNote'`; `properties.tier.enum` is
     `['hard','harder','brutal']`; `additionalProperties` is `false`.
2. **New** `functions/src/interview.mint.test.ts` (or extend grade test, same mock harness) — pure floor-resolution
   logic: extract the floor-resolution into a tiny exported helper `resolveTierFloor(input?: string)` and test:
   `'brutal' → 'brutal'`, `'hard' → 'hard'`, `undefined → 'hard'`, `'garbage' → 'hard'`, `'' → 'hard'`.
   > Extracting `resolveTierFloor` keeps it unit-testable without invoking the full callable (which needs OpenAI).
3. **New** `src/interview/gap.test.ts`:
   - `computeInAppAccuracy`: `[]` and `< 3` completed → `null`; 3 completed all `mastered:true` → `1.0`; 4 completed,
     2 mastered → `0.5`; ignores `in_progress` lessons.
   - `conceptLessonIds`: collects `course.lessons[].lessonId`; also unions `course.chapters[].lessonIds` when chapters
     are present; returns a `Set` (no duplicates). This is the concept-scoping guard for change #3 — assert that progress
     keys outside the set are excludable (e.g. a `lessonId` from another concept is **not** in the returned set).
   - `interviewAccuracyFromScore(5) === 1.0`, `(3) === 0.6`, `(1) === 0.2`.
4. `src/interview/InterviewReportView.test.tsx` (extend): with `inAppAccuracy=0.9` and a report whose
   `correctness.score=2` (interview acc 0.4, gap 0.5 ≥ threshold), the gap block renders the pressure-graduation line +
   "Graded as a **brutal** question"; with `inAppAccuracy=null` the gap block is hidden but the rest of the report
   renders. (Provide `report.tier`/`report.pressureNote` in the test fixtures.)

**Drift guard:** `tsx scripts/validate-interview-packs.ts` must print `✓ functions copy in sync: interviewPack.ts`
after step 5 (the `InterviewReport` edit is mirrored).

**Fixture validation:** `tsx scripts/validate-fixtures.ts` — unaffected (no lesson-fixture schema change); must stay green.

**Existing suites must stay green** without edits (default `tierFloor='hard'` preserves behaviour): the `interview.leak`
test, `interviewPack`/`interviewDraw` tests, `transcript` test, `attempts` tests, the realtime hook / InterviewPage tests.

**Rules tests:** none — no new Firestore field, no rules change.

**Manual `/dev` check (no Firebase/Java — AGENTS.md):**
- `/dev/interview` with the dev transport: confirm the report view renders the new gap block + tier label (pass a
  stubbed `inAppAccuracy` and a dev report carrying `tier`/`pressureNote`).
- (Server behaviour — tier floor + tier-aware grading — needs the emulator/live OpenAI and is **not** a `/dev` check;
  cover it with the unit tests above + a note in the PR for a staging smoke test.)

---

## 8. Foolproofing (README §8)

- **R12 — client timestamps are spoofable.** This spec adds **no** client timestamp and does **not** touch scheduling.
  The grade path's `gradedAt: serverTimestamp()` (`interview.ts:493`) is unchanged. The new `tierFloor` mint input is a
  difficulty knob, server-validated/clamped, and is explicitly **not** a security boundary (§3.0) — a spoofing client can
  only change its own question difficulty, never leak answers, exceed quota, or alter grading.
- **Byte-identical-copy drift guard (R4-adjacent).** `interviewPack.ts` has a copy under `functions/src/`; the
  `InterviewReport` edit (#2) is applied to **both** and verified by `scripts/validate-interview-packs.ts` (step 5).
  `interview.ts` is server-only (no copy) and is edited directly. `interviewDraw.ts` is **not** edited at all (the
  `tierFloor` option already exists) — change #1 sidesteps the drift hazard entirely.
- **R2 — two mastery sources of truth.** The gap block reads `progress.derived.mastered` (the **frozen** medallion
  signal), not the live `maxHintLevelByBeat`, so it cannot diverge from the medallion the learner sees — it is the same
  number, deliberately (the thesis wants in-app *fluency* surfaced). The block is **read-only**; it changes no mastery
  state, so the R2 "change both coherently" obligation does not apply (nothing is written).
- **Strict-mode schema (R4).** Adding `tier`/`pressureNote` to a `strict:true` json_schema requires them in `required`
  with `additionalProperties:false` preserved — done (step 4), and the server overwrites `report.tier` post-parse so the
  label is server-authoritative even if the model echoes wrong. The shared `required` array is the one spot spec-22 and
  spec-23 both edit; §3.5 fixes the reconciliation rule.
- **R5 — don't degrade a foundation / pool exhaustion.** The brutal floor shrinks the eligible pool; the brutal→hard
  fallback (§3.1) prevents a heavy Track-B user from hitting a dead "no questions" error, so the feature degrades
  gracefully instead of silently breaking the mock.

---

## 9. Definition of Done

- [ ] `mintInterviewToken` accepts `tierFloor`, validates/clamps to `'hard'|'harder'|'brutal'` (invalid/absent →
      `'hard'`), passes it to `drawQuestion`, and falls back brutal→hard before throwing pool-empty.
- [ ] The quant-intensity gate is resolved by the route via the **shared `isQuantIntensity(userDoc, conceptProgress?)`
      helper** (`src/auth/track.ts`, README §4 — gate Issue #9; **not** an inlined `defaultTrack`-only predicate) and
      threaded route → `InterviewPage` → `useRealtimeInterview` → mint as `tierFloor` (`'brutal'` for the gate, `'hard'`
      for Track A); default `'hard'` everywhere so existing tests/flows are untouched.
- [ ] `buildGraderPrompt` is tier-aware: states the tier + the matching `TIER_CALIBRATION` band, and asks for a
      `pressureNote`. **All tracks** (bug fix).
- [ ] `INTERVIEW_REPORT_SCHEMA` + `InterviewReport` (both byte-identical copies) carry `tier` + `pressureNote`;
      `required` updated; `additionalProperties:false` preserved; server overwrites `report.tier = question.tier`.
- [ ] The report UI shows the practice-vs-performance gap (in-app accuracy from `derived.mastered` vs interview
      accuracy from `correctness.score`), a "Graded as a **{tier}** question" label, and the pressure-graduation note;
      hidden cleanly when `inAppAccuracy` is `null` (< 3 completed lessons or course still loading).
- [ ] In-app accuracy is scoped to **this concept**: `InterviewPage` loads the course for `conceptId`, derives the
      concept's lessonIds (`conceptLessonIds` over `CourseSchema.lessons`/`chapters`), intersects them with the
      whole-library progress map keys, and passes **only** those docs to `computeInAppAccuracy` — never
      `Object.values(progressMap)` unfiltered.
- [ ] **No** Brier/calibration math (spec-12) and **no** `hireSignal` removal (spec-23) here; §3.5 coordination note
      followed so the merge reconciles the strict-mode `required` array (spec-22 ADDS `tier`/`pressureNote`; spec-23
      REMOVES `hireSignal`).
- [ ] The correctness-binarization constant is **imported** from spec-12's `calibration.ts`
      (`CORRECTNESS_PASS_THRESHOLD`/`isCorrect`) wherever a binary interview-correctness judgment is made — **not**
      redefined in `gap.ts`; `interviewAccuracyFromScore = score/5` is a display-only bar proxy, not a pass threshold
      (README §7 DAG).
- [ ] `./node_modules/.bin/vitest run` green (new + existing suites).
- [ ] `tsx scripts/validate-fixtures.ts` green; `tsx scripts/validate-interview-packs.ts` green (drift guard in sync).
- [ ] `./node_modules/.bin/eslint` clean on: `functions/src/interview.ts`, `functions/src/interviewPack.ts`,
      `src/content/interviewPack.ts`, `src/interview/functions.ts`, `src/interview/useRealtimeInterview.ts`,
      `src/interview/InterviewReportView.tsx`, `src/interview/gap.ts`, `src/pages/InterviewPage.tsx`,
      `src/styles/surfaces/interview.css`.
- [ ] Manual `/dev/interview` check of the gap block + tier label passes; PR notes a staging smoke test for the
      server-side tier floor + tier-aware grading (not coverable via `/dev`).
- [ ] `InterviewReport.tier` + `InterviewReport.pressureNote` reconciled with the consistency gate (and with spec-23's
      `hireSignal` removal in the shared `required` array).
