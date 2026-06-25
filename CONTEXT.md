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

The signed-in landing screen after onboarding. A single scrollable page — not a separate
product area called "dashboard." Three regions top to bottom: top bar, momentum band, learning
journey.

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

A grouping of related lessons, each with a dedicated **chapter color** (hue + tint). Chapters
are marked in the learning journey by section dividers (ALL-CAPS label, chapter color) and
in the connector rail by chapter-colored segments.

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

## Welcome screen

The first-run greeting shown once to a brand-new account, right after account creation and
display-name selection, before the learning journey. Welcomes the learner by name and offers
the optional introduction (L0): they can start the intro or skip straight to the journey.
Distinct from the pre-auth landing hero.

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
