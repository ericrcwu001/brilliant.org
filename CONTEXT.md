# Domain Glossary

Terms for the **Ergo** learning product (formerly "Pattern Hitting Times" — the old name was
borrowed from the flagship math topic and has been retired as the product name). Implementation-neutral.

## Ergo

The product name. A focused, brandable probability and quant-intuition product covering the
7-lesson coin-pattern curriculum (L0–L6) with a state-thinking throughline. Designed to grow:
Home is structured so additional courses can be added later. Tagline candidates: "Reason
about randomness." / "From hunch to proof." The visual identity is defined in
`docs/ui_design_system.md` (Ergo Design System).

## Home

_(Evolved term — see **Macro home / Concept catalog** and **Per-concept path**.)_

Previously the sole signed-in landing screen; now split into two screens: the **Macro home /
Concept catalog** (root, lists all concepts) and the **Per-concept path** (within a concept).
The three-region layout — top bar, momentum band, learning journey — now lives on the
per-concept path.

## Learning journey

The full-height vertical list of lessons on Home, replacing the old "course path / spine."
Each lesson is a rich lesson card with a math-visualization thumbnail, title, description,
and chapter color-coding. Lesson cards are connected by a chapter-gradient vertical connector
rail, with chapter section dividers above the first lesson of each chapter. Structured
vertical layout — not serpentine. DOM + SVG (not Konva).

## Lesson node

A lesson's position in the learning journey. Represented as a circle on the connector rail
(chapter color, state-coded: completed / active / available / locked / roadmap) paired with
a full-width lesson card. The active lesson node's card is highlighted with a chapter-color
border and opens a detail card (on laptop: sticky right panel; on mobile: bottom sheet).

## Chapter

A grouping of related lessons within a **concept**, each with a dedicated **chapter color**
(hue + tint). Chapters are defined per-concept and marked in the per-concept path by section
dividers (ALL-CAPS label, chapter color) and chapter-colored connector-rail segments.

Chapters for the Pattern Hitting Times concept:

| Chapter | Lessons | Hue |
|---------|---------|-----|
| Ch 1: Foundations | L0 First Heads, L1 Pattern Hitting Times | indigo `#4F46E5` |
| Ch 2: Racing & Walks | L2 Penney's Game, L3 Gambler's Ruin | teal `#0D9488` |
| Ch 3: Mastery | L4 States & Streaks, L5 Longer Patterns, L6 The Overlap Shortcut | coral `#F0584A` |
| Roadmap | Weighted Coins & Dice | amber `#E0982E` (muted) |

## Chapter color-coding

The system by which each chapter's color (hue + tint) propagates through the interface:
connector rail segments, lesson card borders (active), detail card CTA buttons, medallion
fills, chapter section divider labels, and progress rings all use the chapter's hue. Roadmap
items use amber at reduced opacity to signal "not yet active."

## Concept-mastered medallion

A circular badge representing a mastered concept, displayed in the momentum band's
concepts-mastered gallery. Replaces the wax-seal milestone. Earned medallions show a colored
background (chapter hue) with a white math glyph (e.g., `E[X]`, `σ²`, `ρ`, `Σ`). Locked
medallions show a gray background with the glyph at low opacity and a lock icon. All
medallions are visible from day one in fixed concept order. Earn animation: scale up with a
shadow flash on lesson completion; quiet fade-in the first time Home loads after earning.

## Momentum band

The top content region of Home, below the top bar. Contains two side-by-side sections:
the **weekly streak tracker** (left) and the **concepts-mastered gallery** (right). Establishes
momentum (what has been done) before the learner looks at the learning journey.

## Weekly streak tracker

The streak display in the momentum band. A large tabular numeral (count + "day streak" label)
above a 7-dot week rail (M T W T F S S): filled dots for completed days, a hollow ring for
today if not yet completed, muted dots for future days. No flame icon, no tally marks.
Replaces the old tally-mark streak component.

## L0 / The introduction

The optional warm-up lesson `lesson-first-heads` ("First Heads"): flip until the first heads
and discover E[H] = 2. Signature viz: a single coin face (heads side). Never required, never
a prerequisite, and never the recommended next action. Also called "the introduction" or "the
intro." Part of Chapter 1.

## Onboarding

The mandatory first-run flow shown once to a new account, right after display-name capture and
before the concept catalog. A short self-report survey capturing the learner's **learning goal**,
**comfort level**, **focus area**, and **pace**; on completion it sets a **default track** and a
starting recommendation. This is the first-run greeting — it replaces the retired **welcome
screen**. Cannot be skipped or replayed.

## Learning goal

Why the learner came to Ergo (quant-interview prep, school/exams, sharpening intuition, or
curiosity). Captured during **onboarding**; used for segmentation and reserved for later
personalization (e.g. the AI quant interviewer).

## Comfort level

The learner's self-rated comfort with quant questions, on a four-step scale (new → very
confident). Captured during **onboarding**; the two lower steps yield **default track** A, the
two higher steps yield track B.

## Focus area

The domain a learner most wants to start with (e.g. Probability, Combinatorics & Games), chosen
during **onboarding**. Drives the starting recommendation and floats that domain's shelf to the
top of the catalog.

## Pace

The learner's intended time commitment, captured during **onboarding** (e.g. casual / steady /
intense). Reserved to drive streak goals; not yet wired into the weekly streak tracker.

## Track

A learner-routing choice selecting which variant of a lesson renders: **Track A** is scaffolded
(more support), **Track B** is lean. Never gates content — only its presentation. Set by the
**default track**, optionally overridden per concept by **calibrate**.

## Default track

The track applied across all of a learner's concepts, derived from their onboarding **comfort
level**. A per-concept **calibrate** result supersedes it for that concept only.

## Calibrate

The optional, graded ~4-question check offered (skippable) the first time a learner opens a
concept; its score overrides the **default track** for that concept only. Shown in the UI as the
"Quick check"; supersedes the old always-on "diagnostic" gate.

## Welcome screen

_(Retired — superseded by **Onboarding**.)_ The old first-run greeting that welcomed the learner
by name and offered the optional introduction (L0). The greeting role moves to onboarding; L0
remains an optional lesson in the flagship path.

## Lesson order (L1–L6)

1. Pattern Hitting Times — flagship hook (`lesson-pattern-hitting-times`) · Ch 1
2. Penney's Game — race two patterns (`lesson-penneys-game`) · Ch 2
3. Gambler's Ruin — random walk between walls (`lesson-gamblers-ruin`) · Ch 2
4. States & Streaks — consolidate fundamentals (`lesson-states-streaks`) · Ch 3
5. Longer Patterns & Overlap — transfer check, the long way (`lesson-longer-patterns`) · Ch 3
6. The Overlap Shortcut — martingale retrieval capstone (`lesson-overlap-shortcut`) · Ch 3

Weighted Coins & Dice: post-L6 roadmap stub (Ch 4, amber, muted).

## Habit panel

_(Former name for the streak/status region of Home. Now called the **momentum band** in the
Ergo design system; see that entry.)_

## Focus emphasis

The recommended-action lesson node. Its lesson card is highlighted with a chapter-color border
and its detail card is open by default. Priority: **Resume** (any in-progress snapshot) always
wins; **Review** (most recent `needsReview`, when nothing is in progress); then **Start** the
next unlocked lesson.

## Roadmap stub

A locked lesson listed under the roadmap section of the learning journey, below Chapter 3.
Visible for direction-setting, not enterable until promoted into the path.

## Beat

The atomic unit of a lesson: a single prompt → interaction → feedback exchange. One entry in
a lesson's `beats[]` list. A lesson contains an ordered sequence of beats; a concept contains
an ordered sequence of lessons.

## Concept

The product and UI word for what the codebase and Firestore call a **course**. The terms are
synonymous — no data migration or rename separates them. The vocabulary split exists to give
the product a learner-facing identity ("explore a concept") while keeping the persistence
layer stable. See *Macro home / Concept catalog* and *Per-concept path*.

## Domain

A thematic shelf grouping of concepts on the macro home (e.g. "Probability",
"Combinatorics & Games"). Domains are not a separate data entity — they emerge from the
concepts that declare them. Concepts within a domain are ordered by their declared position;
each domain is rendered as a labeled horizontal carousel on the catalog.

## Macro home / Concept catalog

The signed-in root screen that lists all available concepts grouped into domain shelves.
Contains a "Continue learning" resume hero (the learner's most-recently-active concept) and
one horizontal carousel per domain. Replaces the old single-concept **Home** as the landing
screen. Navigating here is the first thing a signed-in learner sees. See ADR-0004.

## Per-concept path

The within-concept learning screen: the lesson list, chapter structure, and active-lesson
detail for a single concept. Previously called "Home" or "the learning journey" when the
product had only one concept. Reached by selecting a concept from the macro home.

## Coming-soon concept

A concept that is listed in the macro catalog but not yet open for learning. Appears as a
muted concept card with a "Coming soon" status label — visible for direction-setting, not
enterable. Distinct from a **roadmap stub**, which is a locked lesson within an already-open
concept.

## Capstone interview

A spoken AI mock-interview a learner takes **once per concept**, after completing all of that
concept's lessons (not per lesson). An AI interviewer voices quant-style questions aloud and the
learner answers back by **speaking** (with a typed fallback); at the end the conversation is
graded into an **interview report**. It is **optional** — it does not gate the concept-mastered
medallion or the next-concept unlock — but earns its own recognition. Distinct from an **interview
note** (the static "For the interview" micro-copy on a beat) and from the **interview pack** (the
authored question bank + interviewer prompt that feeds it). _Avoid_: "mock interview", "AI
interview" (ambiguous with interview note).

## Interview pack

The per-concept authored asset that feeds a **capstone interview**: an interviewer prompt, a
bank of engine-verified quant-interview questions, and a hidden grading rubric. Specified in the
lesson-factory skill and governed by ADR-0005; injected into the interview as hidden ground truth
so the AI never voices unverified math.

## Interview report

The graded result of a **capstone interview**: the five rubric dimensions (correctness, approach,
rigor, communication, speed) surfaced as feed-forward **next-fix cards** plus a **calibration**
delta (predicted vs measured readiness). Produced by a server-side grading pass over the transcript
and stored per attempt (latest + best surfaced); raw audio is never stored. _(No longer carries a
**hire signal** — see ADR-0010.)_

## Hire signal

_(Retired — removed by ADR-0010.)_ The old **capstone interview** overall verdict, expressed in desk
language on a Strong No → Strong Yes scale. Removed because a person-level verdict is the weakest,
most-often-harmful feedback type; the **interview report** now feeds forward (next-fix cards) and
reports **calibration** instead.

---

## Learning-science overhaul

_(New vocabulary for the spaced-retrieval / honest-mastery / calibration work — see
[`docs/learning-science/README.md`](docs/learning-science/README.md), ADR-0009, ADR-0010.)_

## Method tag

The hidden **deep-structure** label on a graded problem naming the technique it trains (e.g.
*first-step analysis*, *symmetry*, *conditioning*, *states/Markov*). Drawn from a single extensible
registry (`src/content/methods.ts`); stored as `schemaId` on a beat. Enables interleaving "the same
method in different costumes" across concepts and indexing a learner's weakness by method rather than
by lesson. _Avoid_: topic, surface label, category.

## Review card

The per-problem spaced-retrieval scheduling record (one per graded beat per learner) holding its
SM-2 state (`dueAt`, `intervalDays`, `easeFactor`, `reps`). Function-owned (client-read,
client-write-denied), stored at `users/{uid}/reviews/{lessonId}__{beatId}`.

## Spaced review

A cold, delayed re-attempt of a previously-seen problem, scheduled by SM-2 and surfaced by the
**Daily Review queue**. The act of passing one is a **retrieval rep** and (≥1 day after completion)
can mint **gold** mastery.

## Daily Review queue

The home-screen hero and surface that presents due **review cards** — interleaved across concepts
with surface labels hidden — as the recommended daily action. The catalog remains home; the
label-stripped "Mixed Floor as home" is a deferred later phase.

## Which-method gate

A graded discrimination check, built on the `prediction` beat (with `byOption` refutation), shown
before solving a label-stripped problem: the learner first commits to the **method** from a
domain-appropriate menu. Selection is the graded act. Distinct from **Calibrate** (a prerequisite
fluency gate). _Avoid_: building it on `patternPick` (ungraded, no `byOption`).

## Calibration score

A measure of how well a learner's stated confidence matches their accuracy (a Brier-style stat),
captured on graded checkpoints and the interview. Surfaced as a predicted-vs-measured delta; the
trader's-edge skill (bet sizing). Foregrounded for the **quant-intensity gate**.

## Retrieval rep

A cold-recall act — a **spaced review**, a `masteryChallenge`, or a **which-method gate** — as
opposed to ordinary teaching interaction. A plumbing taxonomy that feeds the difficulty governor,
calibration scoring, and analytics. Deliberately does **not** drive the streak.

## Target interview date

An optional date a learner sets in **onboarding** (editable in Profile); the SM-2 schedule bends
around it so every problem gets a final cold review in the days before the date.

## Quant-intensity gate

The rule that activates the aggressive desirable-difficulty behaviors (difficulty governor, brutal
mock, failure-first, calibration-forward report): **Track B `OR` `learningGoal === 'interview'`**.
Track A stays gentle.

## Transfer problem

A held-out, fresh-surface problem of the same **method** as a lesson's checkpoint, authored per
lesson and shown only as the **Track-B gold gate** (delayed transfer check).

---

## Retired terms (superseded by the Ergo reimagining — see ADR-0003)

**Study desk** — The old visual identity of Home (notebook spread on a desk metaphor). Superseded by the Ergo reimagining — see ADR-0003.

**Course path / course spine** — The old name for the vertical lesson list, rendered as a
Konva graph-node chain. Replaced by "learning journey" (DOM + SVG). Superseded by the Ergo reimagining — see ADR-0003.

**Milestone seal / wax seal** — The stamped circular ink-ring milestone earned on lesson
completion. Replaced by the concept-mastered medallion. Superseded by the Ergo reimagining — see ADR-0003.

**Tally marks / streak-as-tally** — The pen-stroke tally mark representation of the streak
count. Replaced by the weekly streak dot rail. Superseded by the Ergo reimagining — see ADR-0003.

**Paper grain** — The SVG `feTurbulence` background texture applied to the old warm-paper
surfaces. Removed; Ergo uses cool-white flat surfaces. Superseded by the Ergo reimagining — see ADR-0003.

**Earn moment** — Old glossary term for the two-moment wax-seal earn sequence (recap stamp +
quiet Home fade-in). The concept persists as medallion earn; the wax-seal mechanism is retired. Superseded by the Ergo reimagining — see ADR-0003.

**Live preview** — The small looping animation in the old focused graph-node detail panel.
The concept persists as the lesson card thumbnail animation in the learning journey. Superseded by the Ergo reimagining — see ADR-0003.

**Lesson path node** — Old term for the graph-node circle on the Konva course spine. Replaced by "lesson node" in the DOM+SVG learning journey. Superseded by the Ergo reimagining — see ADR-0003.
