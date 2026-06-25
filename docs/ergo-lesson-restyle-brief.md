# Ergo Lesson Restyle Brief

> **Status: PLANNING ONLY — do not execute yet.** This brief specifies how to bring
> the in-lesson experience up to the bright, premium **Ergo** identity that now ships on
> the signed-in Home. No lesson source, CSS, or fixtures have been changed. Source of
> truth for the visual target: `docs/ui_design_system.md` + the approved mock at
> `mock/ergo-home.html` (`mock/ergo-home-shot.png`). Rationale/decisions:
> `docs/adr/0003-ergo-bright-reimagining.md`.

## What already happened (so this brief is correctly scoped)

The **Home** screen was reimagined to Ergo and is live in the production source (green
`tsc`/`eslint`/`vitest`/`vite build`). As part of that:

- The **global Style Dictionary tokens + fonts were swapped to Ergo** (cool near-white
  base `#F7F8FB`, indigo brand `#4F46E5`, chapter hues `--ch1` indigo / `--ch2` teal /
  `--ch3` coral / `--ch4` amber; Space Grotesk / Inter / JetBrains Mono). The legacy token
  names (`--paper-*`, `--quill`, `--ink`, `--heads`, …) were **remapped** to Ergo values,
  so **lessons already render in Ergo colors/fonts today**.
- New Ergo Home components shipped: `WeeklyStreak`, `ConceptMedallion`, `CourseJourney`,
  and the `MathViz` SVG system (`src/lesson/mathviz/MathViz.tsx`).

**Therefore the lesson work is NOT a recolor.** It is replacing notebook *semantics* with
Ergo *semantics*: chapter color-coding, depth language (deboss → soft shadow), and
components (wax-seal → concept-medallion, tally → weekly streak), plus elevating the
in-lesson visualizations to the "math is the art" bar.

## The brief (three parts)

1. **[Shell & chrome](./ergo-lesson-restyle-brief/01-shell-and-chrome.md)** — lesson top
   bar, per-beat rail, prompt strip, region, sticky action bar + button system, feedback
   strip, coin stream, status banners, boot/skeleton, completion takeover, view
   transitions.
2. **[Beats & visualizations](./ergo-lesson-restyle-brief/02-beats-and-visualizations.md)**
   — all 21 beats grouped by interaction family, the signature equation tiles + sliders,
   and the Konva visualizations (`StateGraph`/`SimChart`/`BiasChart`) under the "math is
   the art" north star.
3. **[Celebration, migration & risks](./ergo-lesson-restyle-brief/03-celebration-migration-and-risks.md)**
   — completion/recap restyle, the wave-by-wave migration plan + file-ownership, the
   cleanup punch-list, and the e2e/VR risk register. The capstone; read this for the
   execution order.

## Cross-cutting decisions (consistent across all three parts)

- **Chapter accent mechanism.** Introduce a `data-ch` → `--lesson-accent` (CSS) + a Konva
  `accent` prop so chrome, beats, and visualizations color-code by chapter:
  **L0/L1 → indigo (`--ch1`)**, **L2/L3 → teal (`--ch2`)**, **L4/L5/L6 → coral (`--ch3`)**.
  The flagship (L1) barely moves since it stays indigo.
- **Depth language.** Retire `--press-deboss`, paper-grain, `--mark-wash` highlighter, and
  the wax-seal/ink-bloom for Ergo **soft layered shadows + chapter tints**; press states
  become transform-only.
- **"Math is the art."** The in-lesson `StateGraph` should read as the same glyph system as
  the Home `MathViz` thumbnails (chapter-tinted nodes, dashed-accent absorbing ring,
  active glow, true device-pixel hairlines, tabular-nums).
- **Celebration.** A single **shared Ergo concept-medallion** (promote `ConceptMedallion`
  with size variants; retire `MilestoneSeal`) + a chapter-hued light-streak replaces the
  wax-seal/confetti; the compact lesson-top-bar `StreakTally` aligns to a compact
  `WeeklyStreak`. Premium, adult, reduced-motion parity. "The math does the celebrating."
- **Type.** Space Grotesk 600 prompt headline; JetBrains Mono + `tabular-nums` for math and
  figures; `--ring-focus` on every interactive element.

## Execution order (from Part 3)

**Shell → Beats → Celebration → Cleanup → Landing/Auth → VR re-baseline (user).** Each wave
uses exclusive per-file ownership and the DoD gate `tsc -b` + `eslint .` +
`vitest run` + `vite build` (Playwright + VR re-capture run manually by the user). The
**Landing + Auth** public surfaces are a related-but-separately-scoped wave for app-wide
consistency.

## Important findings to action during execution

- **e2e selectors are preserved — no renames required.** All three parts confirmed (via
  grep of `e2e/`) that load-bearing selectors stay (`section.prompt`, `.prompt__text`,
  `.actionbar .btn--primary`, `.token-row`, `.eqline--build .slot`, `aria-pressed`,
  `.numline__range`, `.balance__range`, `.done-note` / "Lesson complete", `status-note`).
  The lesson restyle is a **values-only** sweep on the styling side.
- **VR baselines must be re-captured** after the restyle: the 6 snapshots under
  `e2e/vr/__screenshots__/{vr-desktop,vr-mobile}/` (`dev-home`, `dev-lesson-flagship`,
  `dev-lesson-penneys`) — the global font swap alone drifts text metrics. Consider adding
  coral/teal hero cases (L2–L6) to the VR matrix.
- **Cleanup punch-list** (deferred, needs greenlight; details in Part 3): dead `home.css`
  selectors (with an explicit KEEP list), 2 orphaned files
  (`src/lesson/konva/CourseSpine.tsx`, `src/lesson/LessonPreview.tsx`), 4 now-unused
  `@fontsource` deps, and 4 stale code comments referencing Fraunces/IBM Plex.
- **Dead code:** the `RecapBeat` milestone-stamp branch is currently unreachable (the
  completion takeover replaces the beat before `lessonComplete` is true) — recommended for
  removal during the Celebration wave.
- **`RaceSimBeat`** has a hardcoded lane color (`#b26a2b`) that should move into
  `src/lesson/konva/theme.ts`.
