# Interactive Mechanics Backlog (L1-L6)

Audit of the **Pattern Hitting Times** course against Brilliant's interactive
mechanics, plus a prioritized backlog. Inventory baseline: **71 beats / 20
interaction types** across L0-L6 (source of truth: `fixtures/lesson-*.json` +
`src/lesson/beats/*`).

## How a mechanic is added (pipeline)

```
schema.ts (InteractionSchema union)
  -> beats/index.tsx (BeatView switch)
    -> new <Name>Beat.tsx (composes BeatShell + feedback)
      -> fixtures/lesson-*.json (authored beat)
        -> scripts/validate-fixtures.ts (new branch if asserts apply)
          -> e2e/* + VR baselines
```

**Non-negotiable constraints** (carried from `docs/`, `HANDOFF.md`, `AGENTS.md`):

- Every drag interaction keeps a **tap + keyboard** fallback (the e2e suite and
  a11y model drive via tap only).
- Every beat is **completable under `prefers-reduced-motion`** (final static
  frame; no motion required to progress).
- **Engine-driven grading only** - no AI/chatbot tutor (`docs/mvp_prd.md`).
- Preserve e2e selectors (`.actionbar .btn--primary`, `.token-row`,
  `.eqline--build .slot`, `.tap-card`, `.numline__range`, etc.).
- Keep `src/lesson/konva/theme.ts` in sync with `src/styles/tokens.css`.

## Coverage map (Brilliant mechanic -> status -> evidence)

| # | Brilliant mechanic | Status | Where it lives today |
|---|--------------------|--------|----------------------|
| 1 | Physical-metaphor puzzles (balance scales) | **Missing** | No seesaw/balance manipulable anywhere |
| 2 | Drag-and-drop construction | **Partial** | `equationTiles`/`retrievalGrid`/`stateTap`/`sumTiles` are **tap-to-place** (drag deferred) |
| 3 | Action first, theory later | **Strong** | Every lesson opens with a `prediction` bet |
| 4 | Visual pattern machines (growing blocks) | **Missing** | `sumTiles` is discrete chips; no growth/area model |
| 5 | Simulation-based probability | **Very strong** (one gap) | `coinSim`, `raceSim`, `walkBoard`, `gamblerLedger`, `theorySimChart`, `FirstSuccessTimeline` - but **convergence-means only, no distribution view** |
| 6 | Physics toyboxes | N/A domain | Analog = manipulable Markov/walk systems |
| 7 | Systems you can manipulate | **Partial** | Only `bias-sandbox` is a live knob->chart; `walkBoard` uses +/- steppers |
| 8 | Feedback that is part of the world | **Partial** | In-world green/red + graph pulses, but also a text "Hint N" strip |
| 9 | Progression as game levels | **Strong** | Course path, milestones, streaks, Study Desk |
| 10 | Adaptive tutor (Koji) | Out of scope | Hint ladder + `recommend.ts` weak-node selector stand in (no-AI-tutor kept) |

**Strongest existing clusters:** state-graph + coin-stream simulations, equation
tile assembly, hint-ladder graded retrieval, the live bias sensitivity chart.

**Clear white space:** physical manipulatives (#1), true drag (#2), distribution
views with a live knob (#5/#7), consequence-as-feedback (#8), and area/growing
machines (#4).

## Per-lesson backlog (prioritized: P0 = this pass, P1 = next, P2 = later)

### L1 - Pattern Hitting Times (flagship)
- **P0** True drag-and-drop on `equation-tiles` (mechanic #2) - additive over tap.
- **P0** Balance-scale solver replacing the low-agency `guided-solve`
  (mechanics #1 + #8) - fixes audit finding `c1-guided-solve-P2-01` (2.8->goal 4+).
- **P0** Interactive `pattern-pick` cards (mechanic #8) - fixes audit finding
  `c1-pattern-pick-P2-01` (2.8->goal 4+).
- **P2** Consequence feedback on `theory-vs-sim`: ghost the learner's wrong guess
  and let the empirical mean visibly walk away from it.

### L2 - Penney's Game
- **P1** Clickable pre-race "duel preview": tap a pattern to see its first-step
  split before the race runs (mechanic #6/#8).
- **P2** Consequence feedback on the HT-because-4<6 trap in `open-bet`.

### L3 - Gambler's Ruin
- **P0** Live **distribution histogram** of walk durations with a continuous bias
  knob on `house-edge` (mechanics #5 + #7) - realizes the already-declared but
  unbuilt `display: 'histogram'` and surfaces "mean != typical path".
- **P2** Drag a token along the lattice to set the start position.

### L4 - Mixed Review & Streaks
- **P1** Drag-to-match `retrieval-grid` (mechanic #2) - reuse the L1 drag layer.
- **P1** Convert the MCQ-heavy middle beats into small manipulables (this lesson
  is the least hands-on: 5 of 7 beats are MCQ).

### L5 - Longer Patterns & Overlap
- **P0 (inherited)** Drag tiles - `equation-tiles` benefits from the L1 work.
- **P1** Growing-wait visual: as overlap structure is added on `overlap-ruler`,
  a bar visibly grows toward the longer wait (mechanic #4).

### L6 - The Overlap Shortcut (capstone)
- **P1** Drag `sum-tiles` chips into the running total (mechanic #2/#4).
- **P2** "Wait grows as overlap is added" animation tying Sigma 2^L to length.

## Implemented in this pass (top 4)

1. **Drag-and-drop construction** on `EquationTilesBeat` (benefits L1, L3, L5).
2. **Balance-scale solver** (`balanceSolve`) wired into L1 `guided-solve`.
3. **Distribution histogram + live bias knob** on L3 `house-edge` `walkBoard`.
4. **Interactive `pattern-pick`** preview cards on L1.

Together these add the two biggest missing mechanics (#1, #2), realize a
planned-but-unbuilt distribution view (#5/#7), strengthen consequence feedback
(#8), and clear **both** below-bar beats in `audits/scoreboard.json`
(`pattern-pick` 2.8, `guided-solve` 3.8).

## Deferred / future (with the why)

- **Clickable state-machine builder** (wire the automaton, watch it misbehave) -
  high pedagogy, but Konva is `listening:false` + needs a DOM-button overlay for
  a11y; sizeable. Mechanic #6/#7/#8.
- **Area/"growing block" visual algebra** - net-new visual language; mechanic #4.
- **Consequence-feedback layer** across all sim beats (empirical mean refuses to
  converge to a wrong guess) - cross-cutting; mechanic #8.
- **Adaptive tutor** - intentionally excluded by the no-AI-tutor constraint;
  the hint ladder + weak-node recommender remain the substitute.
