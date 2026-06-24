# Domain Glossary

Terms for the Pattern Hitting Times learning product. Implementation-neutral.

## Home

The signed-in landing screen after onboarding. A single scrollable page — not a separate product area called "dashboard."

## Study desk

The visual identity of Home: streak tally, milestone seal gallery, and course path arranged like a notebook spread on a desk. Dashboard-lite functionality expressed through notebook metaphors (tally marks, stamps, graph nodes), not SaaS KPI tiles.

## Course path

The vertical state-chain list of six unlock-ordered lessons on Home, plus locked roadmap stubs below a divider.

## Lesson order (L1–L6)

1. Pattern Hitting Times — flagship hook (`lesson-pattern-hitting-times`)
2. Penney's Game — race two patterns (`lesson-penneys-game`)
3. Gambler's Ruin — random walk between walls (`lesson-gamblers-ruin`)
4. States & Streaks — consolidate fundamentals (`lesson-states-streaks`)
5. Longer Patterns & Overlap — transfer check, the long way (`lesson-longer-patterns`)
6. The Overlap Shortcut — martingale retrieval capstone, last (`lesson-overlap-shortcut`)

Weighted Coins & Dice remains a post-L6 roadmap stub. Milestones: `three-lessons-complete` after L3, `six-lessons-complete` after L6.

## Habit panel

The top region of Home. Contains the primary streak tally and a one-line **status line** for the recommended next action. **No button** in this panel — the sole primary CTA lives in the **focused lesson path node's detail panel**.

## Milestone seal gallery

The horizontal shelf on Home showing **all course milestones from day one**: earned seals in full ink, unearned seals as ghosts. Eight seals in fixed course order (not reordered by earn date). Ink-ring stamps, not gamified badges.

## Course path

The vertical **graph-node chain** of six unlock-ordered lessons on Home, plus locked roadmap node stubs below a divider. Nodes sit on a central spine; lesson detail appears on hover (laptop) or tap (mobile).

## Lesson path node

A circle on the course spine with a mono **lesson glyph**. **At rest:** glyph only (no title). **Completed at rest:** filled quill dot (vs hollow ring for available). **Focused node:** full detail panel pinned open (title, hook, status, primary CTA) plus a small **live preview** of that lesson's signature interaction. **Other nodes on hover/focus:** detail panel with title, hook, status — no CTA, no preview.

## Earn moment

Milestone seals have two moments: the **recap stamp** (primary — seal presses down on lesson completion) and a **quiet Home fade-in** (secondary — the gallery seal inks from ghost on the first Home load after earning, once only). Reduced motion collapses both to a fade.

## Live preview

A small looping animation inside the focused node's detail panel teasing that lesson's signature interaction (L1: pulsing state graph; L2: race lanes; L3: walking token; etc.). Engine-driven where the engine exists; static final frame under reduced motion. Only L1 is built, so the L1 preview ships first; L2–L6 previews are authored as each lesson is built.

## Focus emphasis

The recommended-action node (Resume, Review, or Start). Quill ring on the graph dot; **detail panel pinned open by default** (title, hook, status, sole primary button). Other nodes show glyph only until hover/focus.

Priority: **Resume** (any in-progress snapshot) always wins; **Review** of a `needsReview` lesson is focused only when no lesson is in progress; otherwise **Start** the next unlocked lesson. A `needsReview` flag never interrupts an active session — it shows as a `--mark` ring + hover detail + an optional quiet habit-panel note.

## Roadmap stub

A locked lesson listed under "On the roadmap" after L6. Visible for direction-setting but not enterable until promoted into the path.
