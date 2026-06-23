# MVP PRD: Pattern Hitting Times

## Product Summary

Build a Brilliant-style learn-by-doing app for university underclassmen preparing for quant interviews. The MVP teaches probability and statistics through one deep interactive concept: pattern hitting times in coin flips.

The flagship lesson is **Pattern Hitting Times: State Thinking for Quant Interviews**, centered on the question: why does `HH` take longer to appear than `HT`?

The product should teach the habit of modeling probability problems as states, transitions, recurrences, and simulations. It should feel like a clean mathematical notebook come alive: precise, visual, tactile, and serious enough for quant interview prep.

Phase 1 must contain no AI features: no model calls, no generated content, and no chatbot tutor.

The Phase 1 experience should follow a Brilliant-style cadence: one concept per screen, problem first, learner action second, explanation after. Each lesson beat should have one prompt, one interaction, instant feedback, a short explanation, and a clear Continue action.

## User Persona

The primary user is a university underclassman preparing for quant interviews. They know about resources like the Green Book, but want something more interactive and hands-on than static problem lists. They are not trying to memorize isolated tricks. They want deeper understanding of the patterns of thinking that help them solve unfamiliar probability questions under interview pressure.

## Core Learning Promise

After the MVP lesson, the learner should understand:

- How to convert a pattern-matching probability problem into states.
- Why overlapping patterns change expected hitting time.
- How to write recursive expected-time equations from a state machine.
- How simulation and theory validate each other.
- Why `HH` and `HT` have different expected waiting times even though both are length-2 patterns.
- How to **apply** the method to a novel length-3 pair (`THH` vs `HTH`) — identify the overlap-breaking transition, assemble the recurrence, and predict which waits longer — with at most two hints and no answer reveal on the setup beats.

## MVP Scope

### In Scope

- React frontend.
- Firebase Auth with auth-first onboarding.
- Firebase Firestore for lesson content, user progress, snapshots, streaks, and milestones.
- Firebase Cloud Functions are required for all trusted writes: completion, mastery, streak, milestone, and unlock.
- Emergency-only fallback (does not satisfy acceptance): client-side achievement writes guarded by Firestore rules, used only if Cloud Functions setup fails outright. The chosen Phase 1 path is Cloud Functions.
- Firestore-hosted lesson content seeded from committed repo fixtures (required; runtime reads from Firestore).
- Emergency-only fallback (does not satisfy acceptance): static typed lesson fixtures imported at build time if the Firestore seed pipeline fails outright.
- React + Konva for the flagship interactive lesson.
- Programmatic KMP-style state construction for coin-pattern automata.
- Three built lessons in a coherent path.
- Two future roadmap lessons visible but not built.
- Completion equals mastery for MVP.
- Lightweight `needsReview` flag when the learner repeatedly misses a required interaction or reveals the answer.
- Full interaction snapshot persistence.
- Hand-authored feedback and hint ladder with no AI, including explanations for correct answers.
- Mobile-responsive experience.
- Firebase Hosting deployment with a public URL.

### Out of Scope

- AI hints, AI-generated lessons, AI-generated explanations, or chatbot tutor.
- Performance-threshold mastery.
- Separate retrieval-practice mastery checks.
- Variance and tails lesson.
- Martingale method lesson.
- Admin content editor.
- Fully general arbitrary-length pattern UI.
- Raw animation-frame persistence.

## Course Path

### Built for MVP

1. **States & Streaks** (`lesson-states-streaks`, milestone `first-pattern-cracked`)
   - Warm-up lesson. Single fixed target: first `H` (`patternOptions: ["H"]`, no compare mode).
   - Engine: 2 states (`∅`, `H`), `E0 = 1 + 1/2 E1 + 1/2 E0`, `E1 = 0`, `E[H] = 2`.
   - Beat inventory (all Required unless noted):

   | beatId | interactionType | Purpose |
   |--------|-----------------|---------|
   | `open-hook` | `prediction` | Guess flips until the first `H` (trap: "1 flip"). |
   | `simulate` | `coinSim` (free) | Step/batch flips until first `H`; graph visible and pulsing. |
   | `reset-edge` | `stateTap` | Tap where `∅` goes on `T` (self-loop) vs `H` advancing to the absorbing state. |
   | `equation-tiles` | `equationTiles` | Build `E0 = 1 + 1/2 E1 + 1/2 E0` and `E1 = 0`. |
   | `guided-solve` | `substitution` | Tap through steps to `E[H] = 2`. |
   | `recap` | `recap` | Recap state thinking; tease `HH` vs `HT`. |

   - Omitted vs flagship: pattern pick, refine-prediction, theory-vs-sim, overlap, bias sandbox.
   - **Cut line if slipping:** may drop to a ≤5-beat warm-up (simulate + one graded check + recap); do not block the gate on L1 parity with the flagship.

2. **Pattern Hitting Times** (`lesson-pattern-hitting-times`, milestone `hh-ht-mastered`)
   - Flagship lesson.
   - Compares `HH` vs `HT`.
   - Includes simulation, state-machine animation, equation tiles, expected-time solve, theory-vs-simulation comparison, and overlap explanation.
   - Key fair-coin results: `E[HH] = 6`, `E[HT] = 4`.
   - Beat inventory is the 11-beat list in `Flagship Lesson Flow` below.

3. **Longer Patterns & Overlap** (`lesson-longer-patterns`, milestone `state-machine-builder`)
   - **Transfer lesson.** Uses the matched contrast `THH` vs `HTH` — patterns the learner was not hand-held through — to verify the method transfers to a novel case.
   - Reuses the flagship beat skeleton; per-beat content comes from `buildAutomaton(selectedPattern, 0.5)` (4 states `E0..E3`, `E3 = 0`). Key fair-coin results: `E[THH] = 8`, `E[HTH] = 10`.
   - Deltas vs flagship: opening bet is prediction-only (no `HH`/`HT` recap); `failure-edge` and `equation-tiles` are the transfer "setup" beats; the equation builder has 4 rows.
   - **Faded scaffolding:** on the setup beats (`failure-edge`, `equation-tiles`), hints are capped at level 2 (`maxHintLevel: 2`) with no level-3 reveal. Reaching the cap still records `needsReview` but never blocks completion.
   - **Transfer signal:** `derived.transferAttained = true` iff the learner passes the setup beats for **both** `THH` and `HTH` without reaching the hint cap. This does not change the unlock rule; see `Mastery and Progress`.
   - **Cut line if slipping:** may reduce to ≤8 Required beats (failure-edge, equation-tiles, refine-prediction, theory-vs-sim, overlap, recap) reusing flagship interaction types.

Completing all three lessons earns the `three-lessons-complete` milestone.

### Visible Roadmap After MVP

4. **Penney's Game**
   - Race two patterns to see which appears first.
   - Teaches competing absorbing states.

5. **Weighted Coins & Dice**
   - Generalizes the method beyond fair binary flips.
   - Introduces biased coins and larger alphabets.

## Flagship Lesson Flow

The lesson is a linear guided experience with sandbox moments embedded. Each beat is a focused screen with one interaction, instant feedback, a short explanation, and one primary action (usually `Continue`; simulation, check, prediction, and run-simulation beats use the action named in the design-system CTA matrix). A 4-segment phase rail (Bet, Explore, Model, Prove) shows lesson position on mobile; the per-beat index is persisted internally rather than rendered as 11 dots.

1. **Open with the bet**
   - Prompt: "You flip a fair coin until you see `HH`. Then again until you see `HT`. Which wait is longer, and by how much?"
   - Learner makes an initial prediction before any algebra.
   - This intentionally captures the common misconception that both should take 4 flips.

2. **Choose or compare a target pattern**
   - The flagship lesson is scoped to a `HH` vs `HT` compare mode only. Length-3 patterns are introduced in the `Longer Patterns & Overlap` lesson, not here, so the failure-edge and equation-tile targets in later beats stay consistent with the learner's selection.
   - MVP emphasizes the `HH` vs `HT` contrast.

Each beat below is tagged **Required** (counts toward completion and `needsReview`) or **Extension** (exploratory, never blocks completion). Required beats: 1, 2, 3, 4, 5, 6, 7, 8, 9, 11. Extension beats: 10 (bias sandbox).

3. **Simulate and watch the state machine** (merged from the former simulate and state-machine beats)
   - Hero: the coin stream appends left to right with the active prefix-state chip, and the three-node graph stays visible and pulses on each flip.
   - Primary action: `Flip` (single step and batch). After at least 3 flips and at least one prefix-state change, the primary action swaps to `Continue`.
   - On `Continue`, a short guided replay steps to the annotated near-miss for the selected target (for `HH`: one `H` then `T` returns to start; for `HT`: another `H` stays at `H`), setting up the failure-edge beat. No quiz here.
   - Persist flip count and the last committed stream segment only; never persist per-frame animation.

4. **Find the failure edge**
   - Learner answers where the state machine goes after the key near-miss transitions.
   - For `HH`, state `H` plus `T` resets to state `0`.
   - For `HT`, state `H` plus `H` stays at state `H`.
   - This edge contrast is the core overlap insight.

5. **Build recursive equations with tiles**
   - Learner assembles expected-time equations using draggable tiles.
   - Tiles include state variables, constants, operators, and probability weights.
   - `HH` target structure:
     - `E0 = 1 + 1/2 E1 + 1/2 E0`
     - `E1 = 1 + 1/2 E2 + 1/2 E0`
      - `E2 = 0`
   - `HT` target structure:
     - `E0 = 1 + 1/2 E1 + 1/2 E0`
     - `E1 = 1 + 1/2 E1 + 1/2 E2`
     - `E2 = 0`
   - The `1/2 E1` self-loop in the `HT` equation is the structural difference that makes `HT` faster than `HH`.
   - The app checks the structured expression, not free-form text.

6. **Refine expected-time prediction**
   - Learner places a prediction on a slider before seeing the answer.
   - The prediction becomes a visible marker in the theory-vs-simulation chart.

7. **Guided substitution solve**
   - Learner directs the algebra without typing it.
   - MVP-safe interaction: tap-to-advance or tap-to-substitute each engine-computed step.
   - Enhanced interaction, if time permits: drag known values or solved expressions into later equations.
   - The app animates substitution and simplification until the expected value is derived.
   - Cut line if slipping: replace the animated multi-step replay with a single "Show algebra" reveal after the prediction lock; the learner still completes the beat via `Continue`. This stepper is flagship-Required only; L1 keeps a short version and L3 may collapse it to a reveal.

8. **Compare theory vs simulation**
   - Learner runs many simulations.
   - The empirical mean converges toward the theoretical expectation.
   - The chart shows the learner prediction, empirical average, and theory line.

9. **Discover overlap**
   - The app highlights the key difference between `HH` and `HT`.
   - For `HH`, breaking after one `H` sends progress back to zero.
   - For `HT`, seeing another `H` after one `H` preserves progress toward `HT`.
   - Takeaway: overlap is memory; near-misses that preserve progress change expected waiting time.
   - Optional expert note: for fair binary patterns, the expected wait equals the sum of `2^i` over prefix-suffix overlap lengths, including the full pattern length.

10. **Bias sensitivity sandbox**
   - Extension within the lesson.
   - Learner adjusts coin bias `p`.
   - Equations and expected times update live.
   - This is exploratory, not required for completion.
   - Flagship lesson only; do not add bias-sandbox beats to Lessons 1 or 3 in Phase 1.

11. **Review and next step**
   - Learner sees a short recap: prediction, theoretical result, simulation result, and the overlap explanation.
   - The app awards the lesson milestone.
   - The course path recommends the next lesson or a review if the learner needed repeated reveals.

## Core Interaction Model

### KMP-Style State Construction

The app generates pattern automata programmatically. Each state represents how many characters of the target pattern have currently been matched. On each flip, the engine computes the longest prefix of the target pattern that is also a suffix of the observed sequence.

The engine powers:

- State graph rendering.
- Simulation transitions.
- Correct equation targets for tile checking.
- Linear-system construction for expected time.
- Overlap explanations.

MVP UI should expose a curated set of patterns up to length 3, even if the engine supports the general case.

Engine contract: the engine is a pure function `buildAutomaton(pattern: string, p: number)` returning a single typed object that powers every dependent feature, so lesson copy never hardcodes fair-coin strings:

- `states`: ordered states with matched-prefix labels (`∅`, `H`, `HH`).
- `transitions`: per-state `H`/`T` next-state edges, flagged as advance, self-loop, or reset.
- `recurrences`: `Record<state, CanonicalRecurrence>` (the tile-check targets).
- `expectedTimes`: `Record<state, number>` (the solved values).
- `substitutionSteps`: ordered steps the guided solve replays.
- `overlapHighlights`: the edges to emphasize in the overlap reveal.

Phase 1 may hardcode the `HH`, `HT`, `THH`, and `HTH` automata behind this interface; generalizing the implementation is a stretch. Golden tests assert outputs at `p = 0.5`: `E[HH] = 6`, `E[HT] = 4`, `E[THH] = 8`, `E[HTH] = 10`.

### Equation Tile Builder

The tile builder should use React + Konva for touch-friendly tiles and equation slots. Primary mobile input should be tap-to-place; drag is a progressive enhancement.

Requirements:

- Tiles snap into equation slots.
- The app serializes placements into a structured expression.
- The checker compares the expression to the generated expected recurrence.
- Expressions normalize to a canonical form: constant term plus coefficients by state variable (see the `CanonicalRecurrence` type in the Data Contracts appendix).
- Additive reordering is accepted, such as `1/2 E1 + 1/2 E0` vs `1/2 E0 + 1/2 E1`.
- Expansion, factoring, and free-form algebra are not accepted in MVP.
- Differing coefficients or wrong state variables fail with targeted feedback.
- Feedback should be instant and specific.

Checker normalization rules (must be deterministic and testable):

- Probability tiles are fixed tokens, not free numerals: fair-coin mode offers only `1/2`; the bias sandbox offers `p` and `1-p`. There is no `2/4` or `0.5` tile, so fraction-equivalence is a non-issue.
- State variables are fixed to `E0..En` for the generated automaton; aliases are rejected.
- An implicit coefficient is treated as `1` (`E1` equals `1 E1`).
- `Check` requires every slot in the active equation row(s) filled; empty or partial rows are not graded as correct. No partial credit in MVP.
- The bias sandbox is exploratory and is never graded against a target.

### Feedback and Hint Ladder

All feedback is hand-authored or deterministically generated from the state graph. No AI.

Every submitted check should return explanatory feedback:

- Correct answer: a short "why this is right" explanation.
- Wrong answer: an escalating hint ladder.

Wrong-answer ladder:

1. First wrong attempt: conceptual nudge.
2. Second wrong attempt: highlight the relevant state transition or equation slot.
3. Third wrong attempt: reveal the correct tile or substitution step with explanation.

After a reveal, the learner may continue, but the lesson progress records `needsReview: true`.

Hint-ladder state machine (per `lessonId` + `beatId`):

- Hint level increments only on a wrong `Check` submission.
- Level resets to 1 on a successful `Check`, on beat completion, and on an explicit `Try again` after a reveal.
- The current hint level is persisted in the snapshot (`hintLevelByBeat`). On restore, the feedback strip rehydrates to the last persisted level, so a learner who already saw a reveal never drops back to a level-1 nudge.

`needsReview` definition (testable): `needsReview = true` for a lesson if, on any Required beat, the learner either (a) reaches hint level 3 (reveal), or (b) accumulates 3 or more wrong `Check` submissions on that beat. Extension beats never set `needsReview`. The flag is stored on the progress document and does not block unlocking in Phase 1.

Common authored misconceptions:

- "Both length-2 patterns should take 4 flips."
- "Expected wait is always `1 / P(pattern)`."
- Forgetting the `1 +` flip cost in a recurrence.
- Sending the `HT` self-loop to `E0` instead of `E1`.
- Treating the absorbing state `E2` as nonzero.

## Visual Direction

Use a **Clean Mathematical Notebook** identity.

Design traits:

- Off-white notebook-like background.
- Crisp black and gray notation.
- Restrained accent colors for active states, selected tiles, and correct/incorrect feedback.
- Elegant Konva motion, not game-like effects.
- State graph as the visual hero.
- Equation tiles should feel tactile but not childish.
- Charts should look like clear mathematical instrumentation, not dashboards.

The "wow" should come from clarity, motion, and the moment the learner sees the state machine explain the algebra.

The detailed UI design system lives in `docs/ui_design_system.md`.

## Auth and Onboarding

Use auth-first onboarding:

1. Landing page.
2. Sign in or create account with Firebase Auth. Supported methods: email/password and Google.
3. Enter or confirm display name (first sign-in only; editable later from the profile).
4. Land on course path.
5. Start or resume lesson.

Auth-first is intentionally chosen to make account identity, cross-device persistence, and progress restoration straightforward.

## Persistence Requirements

Use full interaction snapshots. A learner should be able to leave mid-lesson and return to the same state.

Persist:

- Selected lesson and pattern.
- Current beat.
- Completed beats.
- Tile placements and equation assemblies.
- Submitted answers.
- Prediction slider value.
- Guided substitution progress.
- Simulation settings and summarized results.
- Sensitivity sandbox settings.
- Streak state.
- Earned milestones.
- Unlock state.

Do not persist raw animation frames or every individual simulated flip unless needed for a submitted answer. Persist deterministic inputs and summary outputs so the UI can reconstruct the scene.

Snapshot writes should go to one document per user per lesson, be debounced by at least 1 second, flush on beat changes and page hide, and never run during drag frames or animation frames. Snapshot writes should be fire-and-forget so offline Firestore writes do not block the UI.

Resume authority and restore contract:

- `users/{uid}/snapshots/{lessonId}` is the single authoritative source for restoring mid-lesson interaction state. `users/{uid}/progress/{lessonId}` is a denormalized read cache for course-path display (current beat, completion, mastery, `needsReview`); on conflict, the snapshot wins for interaction state and the Cloud-Function-written progress fields win for completion/mastery/unlock.
- Authoritative interaction state is the last *committed* interaction: a tap/place, a drag-end, a beat change, or a `visibilitychange` flush. In-flight drag and animation frames are never authoritative.
- The client mirrors each commit synchronously to `localStorage` with the same schema and `updatedAt`; on load, the app hydrates from whichever of Firestore or the local mirror has the newer `updatedAt`. This covers refresh-before-flush.
- Acceptable loss: a refresh during an in-flight drag or within the debounce window may lose only the uncommitted drag; the last committed interaction is always restored. Uncommitted work is never shown as saved.

## Firebase Architecture

### Firestore Collections

Recommended structure:

- `courses/{courseId}`
  - Course title, description, persona framing, lesson order, roadmap nodes.

- `lessons/{lessonId}`
  - Firestore-hosted lesson content.
  - Includes title, pattern options, beats, feedback copy, milestone ids, unlock metadata.

- `users/{uid}`
  - Display name, created timestamp, last active timestamp.

- `users/{uid}/progress/{lessonId}`
  - Current beat, completed beats, completion status, mastery status, attempts, snapshot summary.

- `users/{uid}/snapshots/{lessonId}`
  - Full interaction snapshot for restoring mid-lesson state.

- `users/{uid}/milestones/{milestoneId}`
  - Earned timestamp and source lesson.

- `users/{uid}/streaks/current`
  - Current streak count, last active date, longest streak.

### Content Source of Truth

Git is the canonical source of lesson content. Firestore is the runtime store.

Commit:

- Lesson fixtures.
- Lesson schema/types.
- Seed script.

Gitignore:

- `.env*`.
- Firebase service account keys.
- Local private overrides.
- Firestore exports/backups.

Use a manual seed script to upload version-controlled content into Firestore.

### Write Model

Use a hybrid write model:

- The client writes only frequent debounced interaction snapshots and non-authoritative draft fields (current beat, tile placements, prediction value), scoped by security rules to the signed-in user's own documents.
- Cloud Functions are the only writer of official lesson completion, mastery, streak updates, milestone awards, and unlock updates. Callable Functions verify the submitted state against the lesson fixture before writing.
- Function writes must be idempotent: completing an already-completed beat, re-awarding an earned milestone, or double-incrementing a streak on the same local day must be no-ops.

This keeps interaction persistence responsive while keeping achievements and unlocks trusted.

No instant-feedback path may depend on a network call; all answer feedback is computed client-side from the engine. Cloud Functions are only on the achievement/unlock path. The emergency-only fallback (client writes achievements, rules enforce `request.auth.uid`) does not satisfy acceptance and is used only if Functions fail outright.

### Firestore Security Rules Requirements

Rules are part of the deliverable, deployed before the public URL goes live.

| Collection | Client read | Client write |
|---|---|---|
| `courses/*`, `lessons/*` | `auth != null` | deny (seeded by Admin SDK only) |
| `users/{uid}` | owner only | owner; create once; field whitelist (display name) |
| `users/{uid}/snapshots/{lessonId}` | owner | owner; field whitelist; reject unknown keys |
| `users/{uid}/progress/{lessonId}` | owner | deny (Cloud Functions only) for `completionStatus`, `masteryStatus`, `needsReview`, unlock fields |
| `users/{uid}/milestones/*`, `users/{uid}/streaks/*` | owner | deny (Cloud Functions only) |

Additional requirements:

- Require Firebase App Check on all Firestore and Function calls before the public deploy, to limit scripted abuse of the public API key.
- Snapshot rules whitelist allowed fields and reject unknown keys so the client cannot smuggle progression fields into a snapshot write.
- Use separate Firebase projects (or aliases) for dev and prod; deploy prod rules before public Hosting.

## Mastery and Progress

MVP rule: **completion equals mastery**.

A lesson is mastered when the learner completes all required beats once. The next lesson unlocks after mastery. This is intentionally simple for Phase 1.

The internal `masteryStatus: mastered` is the unlock signal and is unchanged by transfer. The learner-facing label, however, distinguishes effort quality on the transfer lesson (`lesson-longer-patterns`):

- **Fully mastered** when `derived.transferAttained` is true (the learner passed the `failure-edge` and `equation-tiles` setup beats for both `THH` and `HTH` without reaching the hint cap).
- **Completed** otherwise, with the course path recommending a review of the setup beats.

`transferAttained` is written only by the Cloud Function on lesson completion and never gates unlocking. The "Fully mastered" badge appears on the course path and the recap.

MVP still records `needsReview` when the learner reveals an answer or repeatedly misses core interactions. `needsReview` does not block unlocking in Phase 1, but the course path should recommend reviewing that lesson before advancing too far.

The future performance-threshold mastery idea is documented separately in `docs/future_ideas.md`.

## Success Metrics and Instrumentation

Completion still equals mastery for unlocking, but the app instruments learning so we can answer "does it teach?" beyond "does it function." Use Firebase Analytics for events; persist the derived per-lesson fields on the progress document.

### Event taxonomy

Each event carries `uid` (or anonymous client id pre-auth), `lessonId`, `beatId`, and a client timestamp:

- `beat_viewed`
- `answer_submitted` `{ attemptN, correct, hintLevel }`
- `hint_revealed` `{ hintLevel }`
- `prediction_set` `{ value }`
- `simulation_run` `{ n }`
- `lesson_completed` `{ needsReview }`
- `milestone_earned` `{ milestoneId }`
- `streak_incremented` `{ count, date }`
- `review_recommended_shown`

**Cut line if slipping:** the gate-minimum events are `lesson_completed`, `milestone_earned`, `streak_incremented`, and `answer_submitted` on graded beats; the remaining events and all derived fields may be deferred without failing the gate.

### Derived learning fields (written on lesson complete)

On the flagship lesson, store: `initialPrediction`, `finalPrediction`, `empiricalMean`, `theoreticalValue`, `predictionDeltaInitial` (`|initialPrediction - theoreticalValue|`), and `simRuns`.

### Target KPIs

- Lesson and beat completion rates; per-beat `first_try_correct` rate.
- Reveal rate on Required beats; `needsReview` rate.
- Prediction improvement: median `predictionDeltaInitial` should shrink between the opening bet and the locked prediction.
- D1 return after first lesson completion.
- "Teaches" proxy: a majority of completers reach the overlap beat without a reveal.

## Habit Loop

MVP includes streaks and milestones.

### Streak

- A daily activity streak increments once per day on the first qualifying action.
- Qualifying action: completing a Required beat or completing a lesson. Non-qualifying: viewing the landing or course path, running the bias sandbox only, or replaying a mastered lesson without completing a beat.
- The activity day is the calendar date in the learner's local timezone at event time. Store `lastActiveDate` as a `YYYY-MM-DD` local-date string plus the IANA timezone; the Cloud Function increments only when the new local date differs from `lastActiveDate`.
- The streak persists across sessions and devices.

### Milestones

Use hand-authored milestones such as:

- `First Pattern Cracked`
- `HH vs HT Mastered`
- `State Machine Builder`
- `Three Lessons Complete`

Milestones should appear on the course path and after lesson completion.

## User Stories

### Persona and Onboarding

- As a quant-interview candidate, I want to sign in and save my progress so that I can practice across study sessions and devices.
- As a first-time learner, I want to see that the course is about state thinking for probability interviews so that I understand why this app is relevant to my goals.
- As a returning learner, I want to resume exactly where I left off so that I do not lose momentum during a hard lesson.

### Course Path

- As a quant-interview candidate, I want a clear path through pattern hitting time lessons so that I know what to study next.
- As a learner who completed a lesson, I want the next lesson to unlock so that the course feels like structured progression.
- As a learner preparing under time pressure, I want future advanced lessons to be visible so that I can see where the course is going.

### Flagship Lesson

- As a quant-interview candidate, I want to choose target patterns like `HH` and `HT` so that I can compare cases that look similar but behave differently.
- As a learner, I want to simulate coin flips and watch the state machine update so that I can connect random outcomes to state transitions.
- As a learner, I want to build recurrence equations with draggable tiles so that I practice setting up the problem instead of passively reading the answer.
- As a learner, I want immediate feedback on correct and incorrect answers so that every check teaches me something.
- As a learner, I want hints that escalate from nudges to reveals so that I can recover without AI giving me a black-box explanation.
- As a learner, I want to predict the expected waiting time before seeing the solution so that I commit to my intuition and can compare it against the math.
- As a learner, I want to direct substitution steps through taps or drags so that I understand the algebra without doing tedious free-form equation entry.
- As a learner, I want to compare simulation against theory so that I trust the recurrence result.
- As a learner, I want to adjust coin bias in a sandbox so that I can explore how the expected time changes beyond the fair-coin case.

### Persistence and Habit

- As a learner, I want my tile placements and predictions to be saved so that leaving mid-lesson does not erase my work.
- As a learner, I want a streak to persist across sessions so that I have a reason to keep practicing daily.
- As a learner, I want milestones for important moments so that finishing hard probability lessons feels rewarding.

### Admin and Content

- As a developer, I want lesson content seeded from version-controlled fixtures so that Firestore content can be recreated reliably.
- As a developer, I want lesson content hosted in Firestore at runtime so that the app is structured for future dynamic content.
- As a developer, I want completion, streak, milestone, and unlock writes handled by Cloud Functions and denied to the client by security rules so that achievements cannot be forged from the browser.

## Acceptance Criteria

The MVP is acceptable when:

- A signed-in learner can enter the app, see the course path, and start the first lesson.
- The chosen subject and persona are clearly stated in product copy or README.
- The flagship lesson teaches pattern hitting times through direct interaction, not passive text.
- The lesson follows a problem-first, one-concept-per-screen cadence.
- The learner can manipulate at least one rich interaction: equation tiles, slider prediction, state-machine simulation, or substitution stepper.
- The learner can interact with a visual state machine that responds to flips in real time.
- Feedback appears instantly and includes specific explanations for both correct and incorrect answers.
- The learner can leave mid-lesson and return with the last committed interaction state restored (per the resume contract; uncommitted mid-drag work may be lost).
- Completing a lesson marks it mastered and unlocks the next lesson, written only by a Cloud Function.
- On `lesson-longer-patterns`, hints are capped at level 2 (no reveal) on the `failure-edge` and `equation-tiles` setup beats, and `derived.transferAttained` is set true only when the learner clears those setup beats for both `THH` and `HTH` without reaching the cap. The course path and recap show "Fully mastered" when true and "Completed" otherwise.
- The lesson is marked `needsReview` per the defined thresholds (reveal, or 3+ wrong submits, on any Required beat), and the course path recommends review.
- Streak and milestones persist in Firestore and cannot be written by the client.
- Firestore security rules and App Check are deployed before the public URL.
- The lesson is completable via the non-drag (tap-to-place) path and the reduced-motion path, per `docs/ui_design_system.md` Accessibility.
- The app works on mobile screen sizes with touch input.
- The app is deployed publicly on Firebase Hosting.
- No AI features are present in Phase 1.

## Performance Targets

- Feedback appears in under 100 ms after a submitted interaction.
- Konva interactions remain smooth at 60 FPS on mobile during dragging and animation.
- Lessons load to first interaction in under 2 seconds on a typical connection.
- Snapshot writes are debounced so Firestore is not spammed during drag or animation.
- Multiple learners can use the app concurrently with no shared-state collisions or visible slowdown.

## Implementation Notes

- Keep the KMP state engine pure and testable.
- Add golden tests for `HH = 6`, `HT = 4`, `THH = 8`, and `HTH = 10`.
- Keep lesson fixtures typed and schema-validated before seeding.
- Treat Firestore lesson documents as data, not HTML blobs.
- Store user-specific state separately from lesson content.
- Keep Cloud Functions narrow if used: completion, streak, milestones, unlocks.
- Use client-side local checking for all feedback; never wait on Cloud Functions for answer feedback.
- Use deterministic, hand-authored feedback copy for Phase 1.
- Prefer reconstructable snapshots over raw event logs for MVP simplicity.
- Pin `react-konva` and `konva` to versions compatible with React 19.
- Scope Konva to the state graph, coin stream, and simulation chart only. The equation tiles and slots are DOM components (44px minimum targets) with an optional Konva drag-ghost; this keeps the required tap-to-place and accessibility paths simple and avoids reimplementing focus and `aria-live` on canvas.
- Disable React Compiler for Konva stage files (`reactCompiler: false` or a file-level opt-out), since the global React Compiler in `vite.config.ts` can break Konva refs and animations.

## Implementation Phases

This section sequences the MVP into small, independently shippable phases so each feature can be built and then **manually tested in isolation** before moving on. The order is dependency-driven: pure engine first, then the full flagship lesson running **entirely locally** (no Firebase), then the Firebase backend, then the remaining lessons and deploy.

Each phase lists **Goal**, **Build**, **Manual test** (concrete steps to perform by hand), and **Done when** (the acceptance bar to move on). Phases are designed so that after every phase the app still runs and the new feature is observable.

Guiding principles for the phasing:

- **Local-first:** Group A and B require no Firebase. Use a dev-only route (e.g. `/dev/lesson`) that renders a lesson from a local fixture so interactions are testable before auth, persistence, or Cloud Functions exist.
- **One interaction per phase:** Each flagship beat interaction type is its own phase so it can be exercised in isolation.
- **Keep it green:** The engine golden tests (`HH=6`, `HT=4`, `THH=8`, `HTH=10`) and fixture validation run after every phase.

### Group A — Foundations (local, no cloud)

#### Phase 0 — Project scaffold & tooling
- **Goal:** A running React 19 + Vite + TypeScript app with the right dependencies pinned.
- **Build:** Vite app; pin `react-konva` + `konva` to React 19-compatible versions; configure global React Compiler with a documented per-file opt-out for Konva stage files; add ESLint/Prettier, Vitest, and a `.env.example`; commit `.gitignore` (`.env*`, service-account keys, Firestore exports).
- **Manual test:** Run the dev server and confirm a placeholder page renders; run `build` and confirm it succeeds; run the (empty) test command.
- **Done when:** `dev`, `build`, and `test` scripts all succeed on a clean checkout.

#### Phase 1 — Pure KMP engine
- **Goal:** `buildAutomaton(pattern, p)` returns the full typed `Automaton` (states, transitions, recurrences, expectedTimes, substitutionSteps, overlapHighlights).
- **Build:** Pure, dependency-free engine module per the Data Contracts appendix. Phase 1 may hardcode the `HH`, `HT`, `THH`, `HTH` automata behind the interface.
- **Manual test:** Add golden tests asserting `E[HH]=6`, `E[HT]=4`, `E[THH]=8`, `E[HTH]=10` and the `HT` self-loop on `E1`. Add a throwaway dev harness page or console log that prints the automaton for each pattern and eyeball the states/transitions/recurrences.
- **Done when:** All four golden values pass and transition `kind`s (advance/self-loop/reset) match the PRD for each pattern.

#### Phase 2 — Schema, types & the single golden fixture
- **Goal:** Typed + Zod-validated content contracts and the one complete flagship fixture.
- **Build:** `src/content/schema.ts` with the `Lesson`/`Beat`/`Interaction`/`Feedback` types and Zod schemas; author `fixtures/lesson-pattern-hitting-times.json`, `fixtures/example-snapshot.json`, `fixtures/canonical.example.json`; a validation script that fails on schema violations.
- **Manual test:** Run validation and confirm it passes; intentionally corrupt one field (e.g. delete a beat `interaction.type`) and confirm validation fails with a clear error; revert.
- **Done when:** The golden fixture validates and the engine's recurrences match the fixture's equation-tile targets.

#### Phase 3 — Content loader + beat renderer registry (local)
- **Goal:** Walk through the flagship lesson beat-by-beat from the local fixture, with no interactions wired yet.
- **Build:** A content loader that reads the local fixture; a beat-renderer registry keyed by `interaction.type` (stub renderers showing prompt + `Continue`); linear beat navigation; the 4-segment phase rail (Bet, Explore, Model, Prove); a dev route `/dev/lesson`.
- **Manual test:** Open `/dev/lesson`, click `Continue` through all 11 beats, confirm the phase rail advances across the four phases and the prompt text matches the fixture.
- **Done when:** You can reach the recap beat from the open-bet beat using only `Continue`.

### Group B — Flagship lesson interactions (local)

Each phase below replaces a stub renderer with the real interaction and its instant, client-side feedback. Build the shared feedback/hint-ladder primitive in Phase 4 and reuse it.

#### Phase 4 — Feedback + hint-ladder primitive
- **Goal:** A reusable feedback strip that drives the escalating hint ladder and `needsReview` accounting.
- **Build:** Hint-ladder state machine per `lessonId`+`beatId` (increment on wrong `Check`, reset on success/beat-complete/`Try again`); `maxHintLevel` cap support (no level-3 reveal when capped); `needsReview` rule (reveal, or ≥3 wrong submits, on Required beats); feedback rendered from authored copy.
- **Manual test:** Wire it to a temporary check button; submit wrong answers and watch the ladder escalate nudge → highlight → reveal; confirm a cap of 2 stops before reveal; confirm a correct submit resets to level 1.
- **Done when:** The ladder escalates/resets correctly and flags `needsReview` per the thresholds.

#### Phase 5 — `prediction` (open bet) beat
- **Goal:** Capture the initial which-is-longer prediction.
- **Build:** `prediction` interaction with authored options including the "1 flip"/"both 4" traps; store `initialPrediction`.
- **Manual test:** Pick each option and confirm the choice persists in component state and `Continue` advances.
- **Done when:** The open-bet beat records a selection and shows authored feedback.

#### Phase 6 — State graph + coin simulation (`coinSim`, Konva)
- **Goal:** The visual hero: live coin stream + pulsing three-node state graph, with the guided near-miss replay.
- **Build:** Konva state graph; left-to-right coin stream with active prefix-state chip; `Flip` (single + batch); swap to `Continue` after ≥3 flips and ≥1 prefix-state change; scripted `guidedReplay` to the annotated near-miss; reduced-motion path; persist only flip count + last committed stream segment (in component state for now).
- **Manual test:** Flip single and batch; confirm the graph pulses and the active state chip updates per flip; confirm `Continue` only unlocks after the gate; trigger the near-miss replay; toggle OS reduced-motion and confirm motion is dampened.
- **Done when:** The state machine visibly responds to flips and the near-miss replay gates `Continue`.

#### Phase 7 — `stateTap` (failure edge) beat
- **Goal:** Learner identifies where the near-miss transitions go.
- **Build:** `stateTap` interaction over the engine transitions; check against engine; faded-hint cap support (used later by L3).
- **Manual test:** Tap correct and incorrect targets; confirm instant correct/incorrect feedback and that the hint ladder engages on wrong taps.
- **Done when:** Correct edges pass and the overlap-relevant edges are emphasizable.

#### Phase 8 — `equationTiles` builder + checker
- **Goal:** Tap-to-place tile builder that grades against the canonical recurrence.
- **Build:** DOM tiles/slots (44px min targets) with optional Konva drag-ghost; serialize placements to a structured expression; canonical-form checker (constant + coefficients by state var; additive reorder accepted; fixed prob/state tokens; implicit coeff = 1; full-row-required, no partial credit); targeted feedback for wrong coeff/var.
- **Manual test:** Build the correct `HH` and `HT` recurrences and confirm pass; reorder additive terms and confirm still pass; use a wrong coefficient and a wrong state var and confirm targeted feedback; leave a slot empty and confirm it is not graded correct; verify the whole flow works with tap-only (no drag).
- **Done when:** Correct recurrences pass, the listed wrong cases fail with specific feedback, and the tap-only path is complete.

#### Phase 9 — `slider` (refine prediction) beat
- **Goal:** Numeric expected-time prediction captured as a chart marker.
- **Build:** `slider` interaction (min/max/step from fixture); store `finalPrediction`; expose the value for the theory-vs-sim chart.
- **Manual test:** Drag and tap the slider across the range; confirm the value persists and round-trips into the next beat's marker.
- **Done when:** The prediction value is captured and available downstream.

#### Phase 10 — `substitution` (guided solve) beat
- **Goal:** Tap-to-advance algebra replay that derives the expected value.
- **Build:** `substitution` stepper driven by engine `substitutionSteps`; tap-to-advance/tap-to-substitute; the "Show algebra" single-reveal cut-line fallback.
- **Manual test:** Step through every substitution to the final value; confirm each step's `display` matches the engine; exercise the "Show algebra" fallback path.
- **Done when:** The stepper derives the correct expected value via taps.

#### Phase 11 — `theorySimChart` (theory vs simulation) beat
- **Goal:** Empirical mean converges to theory, with the learner prediction shown.
- **Build:** Konva/instrumentation-style chart plotting learner prediction marker, running empirical average, and theory line; `Run simulation` action with batch `n`; store `empiricalMean` + `simRuns`.
- **Manual test:** Run increasing simulation counts and confirm the empirical mean visibly converges toward the theory line; confirm the prediction marker is positioned at the slider value.
- **Done when:** Empirical mean converges to the theoretical value and all three series render.

#### Phase 12 — `overlap`, `bias-sandbox` (Extension), and `recap` beats
- **Goal:** Finish the remaining flagship beats.
- **Build:** `overlap` narrative highlight using engine `overlapHighlights`; `bias-sandbox` (Extension, never blocks completion, never sets `needsReview`) with live `p` recompute; `recap` summarizing prediction/theory/sim/overlap.
- **Manual test:** Confirm the overlap reveal emphasizes the correct edges; drag bias `p` and confirm equations/expected times update live; confirm the sandbox does not affect completion; confirm the recap shows all four summary values.
- **Done when:** The full flagship lesson is completable end-to-end locally and the recap is correct.

### Group C — Firebase backend

#### Phase 13 — Firebase project, Auth & onboarding
- **Goal:** Auth-first onboarding into a (still local-content) course path.
- **Build:** Dev + prod Firebase projects/aliases; Firebase Auth (email/password + Google); landing → sign-in/create → display-name capture (first sign-in, editable later) → course path; `users/{uid}` create-once with display-name whitelist.
- **Manual test:** Create an account both ways; set a display name; sign out and back in; confirm the display name persists and is editable from the profile.
- **Done when:** A signed-in user reaches the course path and `users/{uid}` exists with their display name.

#### Phase 14 — Firestore content seeding + runtime read
- **Goal:** Lessons served from Firestore instead of the local fixture.
- **Build:** Manual seed script (Admin SDK) uploading committed fixtures to `courses/*` and `lessons/*`; switch the runtime loader to read from Firestore; keep the local fixture for `/dev`.
- **Manual test:** Run the seed script; load the flagship lesson and confirm content matches the fixture; edit a fixture, re-seed, and confirm the change appears at runtime.
- **Done when:** The flagship lesson renders from Firestore content end-to-end.

#### Phase 15 — Snapshot persistence + restore
- **Goal:** Leave mid-lesson and return to the last committed interaction state.
- **Build:** `users/{uid}/snapshots/{lessonId}` writes (debounced ≥1s, flush on beat change + page hide, fire-and-forget, never during drag/animation frames); synchronous `localStorage` mirror with `updatedAt`; hydrate from whichever source is newer; rehydrate `hintLevelByBeat`.
- **Manual test:** Place tiles / set predictions, refresh mid-lesson, confirm restore to the last committed state; refresh during a drag and confirm only the uncommitted drag is lost; confirm a learner who saw a reveal does not drop back to a level-1 hint.
- **Done when:** The resume/restore contract holds for refresh and page-hide.

#### Phase 16 — Cloud Functions: completion, mastery & unlock
- **Goal:** Trusted, idempotent progression writes.
- **Build:** Callable Functions that verify submitted state against the lesson fixture and write `completionStatus`, `masteryStatus`, and unlock fields to `users/{uid}/progress/{lessonId}`; idempotent (re-completing is a no-op); completion = mastery; write `derived.*` fields on flagship completion.
- **Manual test:** Complete the flagship lesson and confirm progress flips to completed/mastered and the next lesson unlocks; call completion again and confirm no double-write; confirm derived fields are stored.
- **Done when:** Completion is written only by the Function and unlock advances exactly once.

#### Phase 17 — Streaks & milestones
- **Goal:** Habit loop persisted server-side.
- **Build:** Function-owned streak increment (once per local calendar day on first qualifying action; store `lastActiveDate` + IANA tz; idempotent same-day); milestone awards (`first-pattern-cracked`, `hh-ht-mastered`, `state-machine-builder`, `three-lessons-complete`); surface streak + milestones on the course path and post-completion.
- **Manual test:** Complete a Required beat and confirm the streak increments; repeat the same day and confirm no second increment; confirm milestones appear after completion; confirm a non-qualifying action (bias sandbox only) does not increment.
- **Done when:** Streaks increment once per local day and milestones are awarded correctly.

#### Phase 18 — Security rules + App Check
- **Goal:** Lock down the data model before any public exposure.
- **Build:** Firestore rules per the rules matrix (owner-scoped reads/writes; client-deny on progress/milestone/streak progression fields; snapshot field whitelist rejecting unknown keys); App Check on all Firestore + Function calls; deploy prod rules.
- **Manual test:** From the client, attempt to write a progression field on `progress` and a milestone, and confirm both are denied; attempt a snapshot write with an unknown key and confirm rejection; confirm normal snapshot/draft writes still succeed.
- **Done when:** All denied paths are denied and legitimate client writes still work with App Check enabled.

#### Phase 19 — Analytics instrumentation
- **Goal:** Answer "does it teach?" via events + derived fields.
- **Build:** Firebase Analytics events per the taxonomy (`beat_viewed`, `answer_submitted`, `hint_revealed`, `prediction_set`, `simulation_run`, `lesson_completed`, `milestone_earned`, `streak_incremented`, `review_recommended_shown`) with required params; persist derived per-lesson fields.
- **Manual test:** Walk a lesson and confirm events fire with correct params in the Analytics DebugView; confirm derived fields land on the progress doc.
- **Done when:** Gate-minimum events (`lesson_completed`, `milestone_earned`, `streak_incremented`, `answer_submitted`) fire reliably.

### Group D — Remaining lessons, polish & deploy

#### Phase 20 — Lesson 1 (`lesson-states-streaks`)
- **Goal:** The warm-up lesson, reusing existing renderers.
- **Build:** Author + validate the L1 fixture (single fixed target `H`; beats `open-hook`, `simulate`, `reset-edge`, `equation-tiles`, `guided-solve`, `recap`); seed; wire milestone `first-pattern-cracked`. Apply the ≤5-beat cut line only if slipping.
- **Manual test:** Complete L1 end-to-end; confirm `E[H]=2` derivation and milestone award; confirm it unlocks the flagship.
- **Done when:** L1 is completable from Firestore content and unlocks Lesson 2.

#### Phase 21 — Lesson 3 (`lesson-longer-patterns`) + transfer logic
- **Goal:** The transfer lesson with faded scaffolding for `THH` vs `HTH`.
- **Build:** Author + validate the L3 fixture (4-row equation builder; prediction-only opener; `failure-edge` + `equation-tiles` as setup beats with `maxHintLevel: 2`); engine-driven content via `buildAutomaton`; Function computes `derived.transferAttained` (passes both setup beats for both patterns without hitting the cap; never gates unlock); learner-facing "Fully mastered" vs "Completed" labels.
- **Manual test:** Complete L3 clearing setup beats for both patterns without hitting the cap and confirm "Fully mastered"; repeat hitting the cap and confirm "Completed" + review recommendation; confirm no level-3 reveal on the capped setup beats; confirm `three-lessons-complete` on course completion.
- **Done when:** Transfer label and `transferAttained` behave per acceptance and unlock is unaffected.

#### Phase 22 — Course path, unlock gating & review recommendations
- **Goal:** A coherent path tying the three lessons + two roadmap stubs together.
- **Build:** Course-path node states (locked/available/completed/mastered, "Fully mastered" badge); unlock order enforcement; visible-but-locked roadmap nodes (`lesson-penneys-game`, `lesson-weighted-coins`); review recommendation when `needsReview`.
- **Manual test:** Confirm locked lessons are not enterable; complete in order and watch nodes unlock; confirm a `needsReview` lesson shows a review recommendation; confirm roadmap stubs are visible but locked.
- **Done when:** The path enforces unlock order and surfaces mastery/review states correctly.

#### Phase 23 — Mobile, accessibility & performance pass
- **Goal:** Meet the responsive/a11y/performance acceptance bars.
- **Build:** Mobile-responsive layouts; complete the lesson via tap-only and reduced-motion paths; 44px targets, focus management, `aria-live` feedback; verify performance targets.
- **Manual test:** Complete the flagship lesson on a phone-sized viewport with touch using only tap-to-place; complete it again with reduced motion; spot-check feedback <100ms and Konva at ~60fps during drag/animation.
- **Done when:** The lesson is fully completable on mobile, tap-only, and reduced-motion, within performance targets.

#### Phase 24 — Public deploy
- **Goal:** Live on Firebase Hosting with a public URL.
- **Build:** Hosting config; deploy prod rules + App Check first; deploy the app; smoke-test the public URL.
- **Manual test:** From a fresh browser/incognito, sign up, complete a lesson, refresh to confirm restore, and confirm streak/milestone persist; confirm no AI features are present.
- **Done when:** The full acceptance-criteria walkthrough passes against the public URL.

## Data Contracts Appendix

These are the contracts an implementer (or coding agent) must follow. Define them as TypeScript types plus Zod schemas in `src/content/schema.ts`, validate every fixture before seeding, and treat them as the source of truth shared by renderers, checkers, the engine, and persistence.

### Canonical IDs and default build path

```text
courseId:   course-pattern-hitting-times
lessonIds:  lesson-states-streaks | lesson-pattern-hitting-times | lesson-longer-patterns
roadmapIds: lesson-penneys-game | lesson-weighted-coins   (locked stubs, not built)
milestoneIds: first-pattern-cracked | hh-ht-mastered | state-machine-builder | three-lessons-complete
unlock order: lesson-states-streaks -> lesson-pattern-hitting-times -> lesson-longer-patterns
AUTH: email/password + Google; display name on first sign-in
CONTENT: Firestore-hosted, seeded from committed fixtures (runtime reads from Firestore)
WRITES: Cloud Functions own completion/mastery/streak/milestone/unlock; client owns snapshots + drafts
```

Beat IDs are stable kebab-case strings. Flagship: `open-bet`, `pattern-pick`, `simulate` (merged simulate + state-machine), `failure-edge`, `equation-tiles`, `refine-prediction`, `guided-solve`, `theory-vs-sim`, `overlap`, `bias-sandbox`, `recap`. Lessons may add their own IDs (e.g. L1 `open-hook`, `reset-edge`). Milestone mapping: `lesson-states-streaks` → `first-pattern-cracked`, `lesson-pattern-hitting-times` → `hh-ht-mastered`, `lesson-longer-patterns` → `state-machine-builder`; `three-lessons-complete` on course completion.

### Lesson and beat schema (shape)

```ts
type Lesson = {
  lessonId: string;
  courseId: string;
  title: string;
  patternOptions: string[];       // flagship: ["HH", "HT"]
  beats: Beat[];
  milestoneId: string;
  unlocks: string | null;         // next lessonId
  schemaVersion: number;
};

type Beat = {
  beatId: string;
  required: boolean;
  prompt: string;
  interaction: Interaction;       // discriminated union on `type`
  feedback: Feedback;
  maxHintLevel?: 1 | 2 | 3;       // default 3 (reveal); transfer setup beats use 2 (no reveal)
};

type Interaction =
  | { type: "prediction"; options: string[] }
  | { type: "patternPick"; patterns: string[]; mode: "single" | "compare" }
  // free = learner flips; guidedReplay = scripted replay that gates Continue on a near-miss
  | { type: "coinSim"; mode: "free" | "guidedReplay"; gate?: "near-miss" | { minFlips: number } }
  | { type: "stateTap"; transitions: Array<{ from: StateId; on: "H" | "T" }> }
  | { type: "equationTiles"; bank: Tile[]; rows: EquationRow[] }
  | { type: "slider"; min: number; max: number; step: number }
  | { type: "substitution"; steps: SubstitutionStep[] }
  // narrative highlight beat; the engine's overlapHighlights are the emphasized edges
  | { type: "overlap"; highlight: Array<{ from: StateId; on: "H" | "T" }> }
  | { type: "theorySimChart" }
  | { type: "recap" };

// For compare lessons, feedback may be keyed by the active pattern; otherwise a single triple.
type Feedback =
  | { correct: string; hints: [string, string, string] }
  | { byPattern: Record<string, { correct: string; hints: [string, string, string] }> };
```

### Engine, tile, and substitution types

```ts
type StateId = `E${number}`;     // E0, E1, ...; display label (∅, H, HH) is separate

type AutomatonState = { id: StateId; label: string; absorbing: boolean };
type Transition = {
  from: StateId; on: "H" | "T"; to: StateId;
  kind: "advance" | "self-loop" | "reset";
};

type Automaton = {                          // buildAutomaton(pattern, p) return type
  pattern: string;
  p: number;
  states: AutomatonState[];
  transitions: Transition[];
  recurrences: Record<StateId, CanonicalRecurrence>;
  expectedTimes: Record<StateId, number>;
  substitutionSteps: SubstitutionStep[];
  overlapHighlights: Array<{ from: StateId; on: "H" | "T" }>;
};

type Tile =
  | { id: string; kind: "state"; value: StateId }      // E0, E1
  | { id: string; kind: "prob"; value: "1/2" | "p" | "1-p" }
  | { id: string; kind: "const"; value: number }       // 0, 1
  | { id: string; kind: "op"; value: "+" | "-" | "=" };

type EquationRow = { lhs: StateId; target: CanonicalRecurrence; graded: boolean };

type SubstitutionStep = {
  display: string;                 // e.g. "E1 = 1 + 1/2 E2 + 1/2 E0"
  substitute: StateId;             // which value is being substituted in this step
  resultValue?: number;            // populated once this state is solved
};
```

### Canonical recurrence (tile-check target)

```ts
type Rational = { n: number; d: number };
type CanonicalRecurrence = {
  lhs: `E${number}`;
  constant: number;                            // the leading "1 +" flip cost
  terms: Array<{ coeff: Rational; var: `E${number}` }>;  // sorted by var index
};

// E0 = 1 + 1/2 E1 + 1/2 E0  serializes to:
// { lhs: "E0", constant: 1, terms: [ { coeff: {n:1,d:2}, var: "E1" }, { coeff: {n:1,d:2}, var: "E0" } ] }
```

### Persistence documents (examples)

```jsonc
// users/{uid}/snapshots/lesson-pattern-hitting-times  (client-written, authoritative for restore)
{
  "lessonId": "lesson-pattern-hitting-times",
  "beatId": "equation-tiles",
  "pattern": "HH",
  "completedBeats": ["open-bet", "pattern-pick", "simulate", "failure-edge"],
  "interactionState": {
    "equationTiles": { "E0": ["const:1","op:+","prob:1/2","var:E1","op:+","prob:1/2","var:E0"] },
    "prediction": null,
    "hintLevelByBeat": { "failure-edge": 2 }
  },
  "updatedAt": "<serverTimestamp>",
  "schemaVersion": 1
}

// users/{uid}/progress/lesson-pattern-hitting-times  (Cloud-Function-written, read cache)
{
  "currentBeat": "equation-tiles",
  "completionStatus": "in_progress",   // in_progress | completed
  "masteryStatus": "not_mastered",     // mastered when completed
  "needsReview": false,
  "attemptsByBeat": { "failure-edge": 2 },
  "derived": { "initialPrediction": 4, "finalPrediction": 6, "empiricalMean": 6.1, "theoreticalValue": 6 }
  // lesson-longer-patterns also writes derived.transferAttained: boolean
}
```

### Single golden artifact (build this first)

Author one complete, schema-validated fixture `fixtures/lesson-pattern-hitting-times.json` plus a matching `fixtures/example-snapshot.json` and `fixtures/canonical.example.json`. Building and validating this one artifact unblocks the content loader, the beat-renderer registry, the checkers, the seed script, and the restore logic in a single pass.

## Revision History

- Cycle 1 — 2026-06-23 — Resolved Phase 1 forks (Cloud Functions required, Firestore-hosted content, email/Google auth, local-timezone streaks, full analytics). Added engine contract, Firestore rules matrix + App Check, resume/restore contract, `needsReview` and hint-ladder definitions, checker normalization rules, Konva/React-Compiler scope, success metrics, and a Data Contracts appendix with canonical IDs and a golden fixture. Owner kept all three lessons as the Wednesday gate against the Scope expert's recommendation.
- Cycle 2 — 2026-06-23 — Added beat inventories for Lessons 1 and 3 with cut lines; designated Lesson 3 as the transfer lesson (faded hints, `transferAttained` for both `THH` and `HTH`, learner-facing "Fully mastered" label, non-blocking). Merged flagship beats 3 and 4 into one (11 beats, renumbered). Switched the mobile beat rail to a 4-phase rail. Fleshed out the Data Contracts appendix (engine `Automaton`, `Tile`, `EquationRow`, `SubstitutionStep`, `overlap` interaction, interaction modes, `maxHintLevel`). Added analytics, substitution, and bias-sandbox cut lines. Aligned the design system (Top Bar phase rail, CTA matrix, mobile layout, course-path node states).
- Cycle 3 — 2026-06-23 — Added an `Implementation Phases` section breaking the MVP into 25 granular, independently testable phases (Groups A–D: foundations, flagship interactions, Firebase backend, remaining lessons/polish/deploy). Each phase specifies Goal, Build, Manual test, and Done-when criteria, and follows a local-first, one-interaction-per-phase strategy so each feature can be built and manually tested before the next.

## Open Questions

- Build risk: all three lessons + Cloud Functions + Firestore runtime + full analytics is the most ambitious option set against the Wednesday gate; cut lines are now documented per item — exercise them if the schedule slips.
- `docs/future_ideas.md` is referenced but not yet confirmed to exist.
- Flagship beat ordering: experts suggested moving the overlap/failure-edge insight before the equation tiles; deferred as a pedagogy decision for the author.
- Try-before-signup vs auth-first: kept auth-first; revisit if landing-to-signup conversion is a concern.
- Display-name PII hardening (max length, sanitization, deletion) is specced at the rules level only (P2); confirm the privacy note for the README.

