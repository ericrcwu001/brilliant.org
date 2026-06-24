# Home — Study Desk (Dashboard) Spec

**Purpose.** Single source of truth for the signed-in **Home** screen (the
"dashboard," reframed as a notebook **study desk**). Captures every decision
reached in the design interview so work can continue in a fresh chat without
re-deriving context.

**Canonical cross-refs** (this doc is the digest; those are authoritative):
- `docs/ui_design_system.md` → **Signed-in Home (Study Desk)** + **Course Path (Graph Nodes)** + **Milestones** + **Streak** sections.
- `docs/mvp_prd.md` → **Course Path** (six-lesson order) + **Habit Loop**.
- `CONTEXT.md` → glossary (Home, Study desk, Habit panel, Seal gallery, Lesson path node, Focus emphasis, Earn moment, Live preview, Fully mastered).
- `docs/adr/0001-konva-course-path-spine.md` → why the spine is Konva + a DOM a11y overlay (Q17/Q18).

**Status legend:** ✅ decided · 🟡 spec-only (not built) · 🔵 implemented (card-style precursor) · ❓ open.

---

## 1. Concept

After auth/onboarding the learner lands on **Home** — one vertically scrolling
page, not a separate route, not a SaaS dashboard. "Dashboard-lite" expressed
through notebook metaphors only: tally marks, stamped seals, graph nodes. It
shows **momentum** (what you've done) and **direction** (what's next) in one
glance. ✅

### Page skeleton (top → bottom)

```text
[home top bar: course wordmark / profile]
[habit panel: streak tally + one-line next-action status]   (no button)
[milestone seal gallery: all 8 seals, earned + ghost]
[section label: "Course"]
[course path: vertical graph-node spine]
[section label: "On the roadmap"]
[roadmap node stub: Weighted Coins & Dice]
```

All regions align to the centered page column (`--page-max`) on laptop; paper-grain background fills the viewport. **Mobile priority (Q21):** region order is unchanged, but the habit panel and seal gallery render as compact single-row strips so the focused card and its primary CTA land within the first viewport — the primary action needs no scroll.

---

## 2. Region specs

### 2.1 Home top bar ✅🟡
- Left: course wordmark ("Pattern Hitting Times", IBM Plex Serif, label scale).
- Right: profile control (display-name initial in an ink ring) → display-name edit + sign-out.
- No back control, no beat rail, **no streak here** (streak lives in the habit panel).

### 2.2 Habit panel ✅ (Q3)
- First region under the top bar.
- Contents: primary **streak tally** (pen tally marks, every 5th day a diagonal slash) + one **status line** (e.g. "Resume Pattern Hitting Times · beat 5").
- **No primary button in the panel** — the status line is text-only. The single CTA lives on the focused course-path node.
- Background `--paper-1`, flat, one hairline `--rule` border. Not a floating card.
- If not qualified today: quiet `--mark` note "Practice today to extend your streak." No countdown/red urgency.

### 2.3 Milestone seal gallery ✅ (Q4)
- Horizontal shelf on `--paper-1`; no visible scrollbar; upcoming seals peek at the right edge.
- **All 8 seals shown from day one** (earned = full ink ring + `--mark` glyph; unearned = ghost: dashed `--graphite-soft` ring + 30%-opacity glyph). Stamp-album preview, never a progress bar.
- **Fixed order = lesson sequence** (never sorted by earn date):

  | # | milestoneId | title | glyph |
  |---|---|---|---|
  | 1 | `hh-ht-mastered` | HH vs HT Mastered | `HH≠HT` |
  | 2 | `penneys-game-won` | Penney's Game Won | `A≻B` |
  | 3 | `gamblers-ruin-solved` | Gambler's Ruin Solved | `i/N` |
  | 4 | `three-lessons-complete` | Three Lessons Complete | `✓×3` |
  | 5 | `first-pattern-cracked` | First Pattern Cracked | `E[H]` |
  | 6 | `state-machine-builder` | State Machine Builder | `∅→H` |
  | 7 | `martingale-mastered` | Martingale Mastered | `Σ2ᴸ` |
  | 8 | `six-lessons-complete` | Six Lessons Complete | `✓×6` |

- Mobile ~2.5 visible; laptop ~4. Tap earned → earned date + source lesson; tap ghost → title + unlock hint.
- Source of truth in code: `src/habit/milestones.ts` `MILESTONE_SEQUENCE`.

### 2.4 Course path — graph nodes ✅🟡 (Q6, Q7, Q8)
Lessons are **graph nodes on a vertical spine**, NOT index cards.
- Central `--rule-faint` vertical rule connects node dots (reuse the in-lesson `StateGraph` node vocabulary).
- **Rendering (Q17/Q18):** a single Konva `<Stage>` draws the spine, dots, glyphs, and `--mark-wash` beam + a **parallel transparent DOM-button overlay** (one per node) carrying focus, keyboard-arrow nav, 44px targets, and `aria`; detail panels are DOM. Konva is **eager on Home** (the spine is on the critical path; only the looping preview defers per Q15). Reduced-motion = static Konva frame.
- Each node = a circle + a mono **lesson glyph** (see §3).
- **At rest:** non-focused nodes are **glyph-only** (no title). (Q7)
- **Focused node** (recommended action): quill ring + `--mark-wash` **beam** to a **pinned detail panel** (title H2, hook `--graphite`, status, sole primary CTA, live preview). (Q6, Q7)
- **Other nodes on hover/focus:** detail panel with title + hook + status — **no CTA, no preview**.
- **Node dot states:**
  - Available (not focused): hollow ink ring.
  - **Completed: filled quill dot** (glyph on fill), visible at rest; optional slight opacity recede until hover. (Q8) No separate "fully mastered" node variant — that transfer-lesson quality label is **recap-only** (Q16).
  - needsReview: completed dot + `--mark` ring.
  - Locked: dashed `--rule-faint` ring + lock glyph + 30% glyph; hover shows title + hook + "Locked" only — **no prerequisite copy** (sequence implies order). (Q5)
- Detail panel placement (Q19): **laptop** = single Konva spine (left) + DOM panel beamed to the right of the focused node; **mobile** = focused node renders as a full-width **DOM card** (glyph + title + hook + Konva preview + CTA) on top, with the remaining glyph-only nodes as a compact **Konva rail** below (responsive divergence — mobile is not literally one Stage; gate focus = L1 = top).
- Interaction: laptop hover/focus opens panel (focused stays open); **mobile** — the focused node's card is pinned open, tapping a rail node (or a seal) **expands it inline in place** (one at a time, reusing the card form; Q20), and the focused card's CTA enters the lesson; keyboard arrows along spine, Enter activates focused. 44px min node hit target.

### 2.5 Focused detail panel — live preview ✅🟡 (Q10)
- The focused node's panel hosts a small **looping per-lesson preview** (the one cinematic Home moment). Non-focused panels never show a preview.
- Panel order: title → hook → preview region → status → CTA.
- Engine-driven where the engine exists; **reduced motion = static final frame**.
- **Only L1 ships a real preview now**; L2–L6 previews are authored as each lesson is built (until then, static glyph placeholder — no fabricated animation).
- **Perf (Q15):** the static final frame paints first; mount the Konva `<Stage>` + start the loop only after first paint / when the focused panel is on-screen (IntersectionObserver), and pause when offscreen. No code-split for the gate (the single bundle already ships Konva, so adding the preview to Home is ≈ 0 KB). A global Konva code-split is a separate post-gate perf task.
- Per-lesson preview intent in §3 table.

### 2.6 Recommended-action priority ✅ (Q9)
Habit status line + the focused node must agree, in order:
1. **Resume** — any in-progress lesson with a snapshot. An active session **always wins**; review never interrupts it.
2. **Review** — most recent `needsReview` lesson, **only when no lesson is in progress**.
3. **Start** — next unlocked lesson not started.
4. **Replay** — all mastered → "Course complete."

`needsReview` while a lesson is in progress: Resume stays focused; the review lesson shows a `--mark` ring + hover detail + an optional quiet `--mark` note under the habit status line ("Worth another look: {Lesson}.", Q23). It never steals focus or the CTA.

### 2.7 Earn moment ✅🟡 (Q11)
- **Recap beat (primary):** seal presses down with a stamp animation on lesson completion.
- **Home return (secondary, quiet):** the matching gallery seal does a **one-time ink fade-in** (ghost → inked) on the first Home load after earning, then static. Track a seen/unseen flag.
- Reduced motion = fade only for both.

### 2.8 Roadmap ✅
- Below an "On the roadmap" divider: **Weighted Coins & Dice** (`lesson-weighted-coins`) only — smaller node, title + hook on hover, not tappable.

### 2.9 Home loading / empty states 🟡
- Loading (Q22): **DOM skeletons** for every region — no canvas, no spinner. Laptop: tally strokes, circular seal ghosts, a DOM spine + node-dot placeholders. Mobile: compact habit + seal strips + a focused-card placeholder + a few rail dots. The Konva spine/rail + preview mount only once `course` + `progress` resolve.
- First visit (no progress): `0-day streak`; all 8 seal ghosts; L1 node focused with detail open; roadmap visible.

---

## 3. Course order, glyphs, milestones (Overlap last)

Final six-lesson unlock order (Overlap Shortcut is the retrieval **capstone**, last):

| L | lessonId | title | glyph | milestone | live preview |
|---|---|---|---|---|---|
| 1 | `lesson-pattern-hitting-times` | Pattern Hitting Times | `HH` | `hh-ht-mastered` | 3-node state graph pulsing through flips (reuse `StateGraph`) — **built lesson** |
| 2 | `lesson-penneys-game` | Penney's Game | `A≻B` | `penneys-game-won` | two race lanes; tally drifting to 7:1 |
| 3 | `lesson-gamblers-ruin` | Gambler's Ruin | `i/N` | `gamblers-ruin-solved` | token random-walking between two walls |
| 4 | `lesson-states-streaks` | States & Streaks | `H` | `first-pattern-cracked` | 2-node graph flipping until first `H` |
| 5 | `lesson-longer-patterns` | Longer Patterns & Overlap | `THH` | `state-machine-builder` | 4-node chain advancing then resetting |
| 6 | `lesson-overlap-shortcut` | The Overlap Shortcut | `Σ2ᴸ` | `martingale-mastered` | `2^L` chips dropping into a sum landing on 6 |

- Unlock chain: L1→L2→L3→L4→L5→L6→null (via each lesson fixture's `unlocks`).
- **Mid-course milestone** `three-lessons-complete` after L1–L3; **course-completion** `six-lessons-complete` after all six.
- Only **L1 is built** today (playable at `/dev/lesson`); L2/L3/L6 specced in `docs/proposed-lessons.md`, L4/L5 in `docs/mvp_prd.md`.

---

## 4. Design tokens used (from `docs/ui_design_system.md`)

`--paper-0/1/2`, `--rule`, `--rule-faint`, `--ink`, `--graphite`, `--graphite-soft`,
`--quill` (active/focus), `--quill-tint`, `--mark` (highlighter/seal glyph),
`--mark-wash` (focused-node beam), `--correct`. Fonts: IBM Plex Sans (UI),
IBM Plex Mono (glyphs/tallies/values), IBM Plex Serif (wordmark). Respect
`prefers-reduced-motion` everywhere (pulse/beam/preview/fade collapse to static or short fade).

---

## 5. Current implementation vs target

**Implemented today** 🔵 — `src/pages/CoursePathPage.tsx` (+ `src/habit/{StreakTally,MilestoneSeal,milestones,streaks}.tsx/ts`, `src/progress/progress.ts`):
- Loads course from Firestore, renders `course.lessons` **in array order** (so the reorder is already reflected once seeded).
- Habit region: streak tally + status line, **no button** (matches Q3).
- Seal gallery: renders all 8 `MILESTONE_SEQUENCE` seals, earned vs ghost (matches Q4).
- `nextActionStatus`: Resume → Review → Start → complete (matches Q9).
- Locked nodes: title + summary + "Locked"/"Coming soon", no prereq copy (matches Q5).
- Focus emphasis: `--quill` left rule on the available node's card.

**Still card-style (needs the graph-node reskin)** 🟡:
- Vertical **graph-node spine** with per-lesson **glyphs**, hover/focus **detail panels**, `--mark-wash` **beam**, **pinned focused panel**, glyph-only-at-rest.
- **Completed = filled quill dot** (currently a checkmark marker + full card).
- **Live preview** in the focused panel (L1 first).
- **Earn-moment fade-in** on return to Home.
- Section label is "Earned" in code vs "Milestones" in spec (minor).

**Backend already wired** (so the dashboard has real data once seeded): Cloud Functions `completeLesson` / `recordQualifyingAction`, milestone awards (`functions/src/milestones.ts`), streaks (`functions/src/streaks.ts`), security rules (`firestore.rules`). To see live data, seed Firestore (`npm run seed`) against the emulator or a project.

---

## 6. Open questions ❓

None outstanding — the original open set and the spine/mobile branches are resolved (decision log Q13–Q19). Minor polish still spec-only: §2.9 loading/first-visit with the Konva spine, and the `needsReview` quiet-note copy.

---

## 7. Decision log (interview Q1–Q23)

| Q | Decision |
|---|---|
| Q1 | Signed-in entry = **Study Desk Home** (dashboard-lite reframed): habit panel → seal gallery → course path, one page. |
| — | **Course order = 6 lessons, Overlap last** (L1 PHT, L2 Penney's, L3 Gambler's Ruin, L4 States & Streaks, L5 Longer Patterns, L6 Overlap Shortcut); Weighted Coins post-L6 roadmap. |
| Q3 | Habit panel = streak + status line, **no button**; CTA on focused node. |
| Q4 | Seal gallery = **all 8** milestones from day one (earned + ghost), fixed lesson order. |
| Q5 | Locked nodes = title + hook + "Locked", **no prerequisite copy**. |
| Q6 | Course path = **graph nodes** on a spine (B+C), per-lesson glyph, `--mark-wash` beam, hover/focus detail. |
| Q7 | At rest: **focused node pinned-open**, others **glyph-only**. |
| Q8 | Completed at rest = **filled quill dot** (vs hollow ring). |
| Q9 | **Resume always wins** focus; Review only between lessons; `needsReview` = ring + hover detail + quiet note. |
| Q10 | Focused detail panel hosts a **per-lesson live preview**; only L1 real now; reduced motion = static frame. |
| Q11 | Earn moment = recap stamp primary + **one-time quiet Home fade-in**. |
| Q12 | Superseded by the reorder (Overlap moved to L6). |
| Q13 | **MVP gate = L1-only playable**; L2–L6 ship as locked ghost nodes (placeholder previews). Infra refactor + L2–L6 builds deferred to post-gate (Group D). |
| Q14 | **Build the graph-node Home now for the gate** — full visual system (spine, glyphs, glyph-only-at-rest, pinned focused panel + `--mark-wash` beam, filled-quill/locked dot states, earn fade-in) **including the L1 live preview**. Card precursor (`CoursePathPage.tsx`) retired into the reskin. |
| Q15 | **Live-preview perf = defer-mount, static-frame-first, no code-split** for the gate. Static final frame paints instantly; the Konva `<Stage>` mounts + loops only after first paint / when the focused panel is on-screen (IntersectionObserver), pausing offscreen. Bundle impact ≈ 0 (the single bundle already ships Konva). A global Konva code-split is a separate post-gate perf task. |
| Q16 | **"Fully mastered" is a recap-only badge** (transfer lesson L5), not a Home node state. Home path nodes stay **binary** (completed / needsReview); avoids the lone-special-node asymmetry. Moot at the L1 gate (L5 unbuilt). Reconciled `docs/mvp_prd.md` + `docs/ui_design_system.md` (badge → recap, dropped from the course-path node list). |
| Q17 | **Course-path spine renders in Konva** (single `<Stage>`), not DOM/SVG — chosen for visual cohesion with the in-lesson `StateGraph` hero, over the recommended DOM/SVG. Konva is therefore **eager on Home's critical path** (revises Q15's rationale; the no-code-split conclusion stands; only the looping preview defers). |
| Q18 | **Spine a11y via a parallel DOM overlay:** transparent, absolutely-positioned focusable DOM buttons (one per node) carry focus, keyboard-arrow nav, 44px targets, and `aria`; detail panels stay DOM (the repo's visual-in-Konva / interaction-in-DOM split). Reduced-motion = static Konva frame. |
| Q19 | **Mobile layout = responsive divergence (focused card + Konva rail).** Mobile renders the focused node as a full-width **DOM card** (glyph/title/hook/Konva preview/CTA); the remaining glyph-only nodes are a compact **Konva rail** below. Laptop keeps the single-Stage spine + beamed side panels (Q17). Gate is clean (focused = L1 = top); mid-spine focus is a post-gate refinement. |
| Q20 | **Mobile rail/seal detail = inline expand-in-place.** Tapping a rail node (or a seal) expands it into a temporary detail card in the flow (one at a time), reusing the focused-card form; locked = title + hook + "Locked", no CTA; tapping elsewhere/another collapses. No bottom-sheet component. |
| Q21 | **Mobile information priority = compact habit + seals so the focused card's CTA is above the fold.** Region order unchanged from laptop; on mobile the habit panel and seal gallery render as compact single-row strips so the primary action needs no scroll. |
| Q22 | **Loading = DOM skeleton first, swap in Konva on data-ready.** All regions render as DOM skeletons (no canvas, no spinner) during the Firestore fetch; the Konva spine/rail + preview mount once course+progress resolve. Mobile skeletons the compact strips + focused-card placeholder + a few rail dots. First-visit per §2.9 (L1 focused/open, 0-day streak, 8 ghosts). |
| Q23 | **needsReview quiet note copy = "Worth another look: {Lesson}."** under the habit status line (`--mark`, non-urgent), distinct from the node's "Review recommended". Shown only when Resume is active and a *different* lesson needs review. |
