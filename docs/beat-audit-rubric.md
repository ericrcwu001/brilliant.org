# Beat Audit Rubric

Governing document for the in-session **beat-audit loop**. Each cycle scores
every beat against this rubric, files findings, auto-fixes objective defects, and
stages subjective changes for human review. The loop terminates per the **Stop
Rule** below.

Source of truth for "good": `docs/core_instructions.md` (learn-by-doing north
star), `docs/mvp_prd.md` (per-beat specs, hint ladder, `needsReview`, perf
targets), `docs/ui_design_system.md` (identity, CTA matrix, accessibility), and
`fixtures/lesson-pattern-hitting-times.json` (authored content).

> Status: **APPROVED (2026-06-23).** This file is the contract the loop reads
> each cycle. Subjective changes ship as one **branch + PR per cycle**; the hard
> stop is **3 cycles**. See §8 for the locked knobs.

---

## 1. Scope

Audited surface: the flagship lesson at `/dev/lesson` (local-only; Groups A & B).
Firebase, auth, persistence, and Cloud Functions are **out of scope** until they
exist — objective checks that depend on them are marked `n/a` rather than failed.

Beat inventory (from the fixture; IDs are stable):

| # | beatId | interaction | required | phase |
|---|--------|-------------|----------|-------|
| 1 | `open-bet` | prediction | yes | Bet |
| 2 | `pattern-pick` | patternPick | yes | Bet |
| 3 | `simulate` | coinSim (free) | yes | Explore |
| 4 | `failure-edge` | stateTap | yes | Model |
| 5 | `equation-tiles` | equationTiles | yes | Model |
| 6 | `refine-prediction` | slider | yes | Model |
| 7 | `guided-solve` | substitution | yes | Model |
| 8 | `theory-vs-sim` | theorySimChart | yes | Prove |
| 9 | `overlap` | overlap | yes | Prove |
| 10 | `bias-sandbox` | slider | **no (Extension)** | off-rail |
| 11 | `recap` | recap | yes | Prove |

Extension beats (`bias-sandbox`) never block completion and never set
`needsReview`; pedagogy is scored but held to a lighter bar (see Stop Rule).

---

## 2. Two scoring axes

Every beat is evaluated on two axes that map directly to the split-autonomy rule:

- **Pedagogy (P1–P5)** — subjective, scored **1–5**. Drives *proposals* (staged
  for review). This is the "is there real learning here?" axis.
- **Objective (O1–O5)** — pass / fail / `n/a`. Drives *auto-fixes* (committed
  behind the verify gate). This is the "does it work and conform?" axis.

### 2A. Pedagogy dimensions (1–5)

| Id | Dimension | What it asks | 1 (poor) | 3 (adequate) | 5 (excellent) |
|----|-----------|--------------|----------|--------------|---------------|
| **P1** | Objective clarity | Is there exactly one thing this beat teaches, traceable to a Core Learning Promise bullet? | No discernible objective; decorative or filler | Objective exists but diluted or implicit | One crisp objective, obviously tied to the lesson's promise |
| **P2** | Productive struggle | Does the learner *do / predict / derive*, with a wrong path that's possible and instructive — not click-through? | Passive read-and-Continue | Interaction exists but low demand (busywork taps) | Interaction forces the target insight; mistakes teach |
| **P3** | Feedback & hint quality | Instant, specific, explanatory for right *and* wrong; ladder escalates nudge → highlight → reveal; targets the authored misconceptions | Generic or missing; red-X with no why | Correct + 3 hints present but vague | Each hint escalates and names the actual misconception |
| **P4** | Interaction fit & element economy | Right widget for the idea; every interactive element earns its place; none missing | Wrong widget, or cluttered / empty | Workable but an element is redundant or absent | Minimal elements, each load-bearing; widget matches the math |
| **P5** | Non-redundancy & sequence fit | Earns its slot vs. neighbors; respects the Bet → Explore → Model → Prove arc | Duplicates an adjacent beat or breaks the arc | Fits but overlaps a neighbor's job | Distinct, necessary, advances the arc |

`pedagogyMean` = average of P1–P5 (Extension beats: average of whichever apply).

### 2B. Objective checks (pass / fail / n/a)

| Id | Check | Pass criteria | Primary evidence |
|----|-------|---------------|------------------|
| **O1** | Functional correctness | Behaves per the PRD beat spec + design-system **CTA "enabled when"** matrix: gates fire (e.g. `simulate` swaps Flip→Continue after ≥3 flips & ≥1 prefix change), checkers grade correctly, `theory-vs-sim` empirical mean converges to the engine value, `Continue` enables exactly when specified | Playwright (DOM/`aria-live`) + Vitest on pure modules |
| **O2** | Robustness | No crash / uncaught error / console error under chaos (rapid clicks, out-of-order taps, spam flips, double-advance, resize); pure graders **never throw** on malformed input | Playwright chaos + Vitest fuzz |
| **O3** | Accessibility | 44px targets; never color-alone; canvas has DOM/`aria-live` equivalents; visible focus; **tap-only path completes**; **reduced-motion path completes**; 200% text no clipping | Playwright (incl. reduced-motion project) |
| **O4** | Performance | Feedback < 100ms; no per-frame React state or writes during drag/animation; no console perf warnings | Playwright timing + code inspection |
| **O5** | Design-system conformance | Tokens not literal hex in components; notebook identity (not dashboard/game); CTA label matches the matrix; semantic color usage | Code inspection + visual snapshot |

---

## 3. Severity

Findings carry a severity that gates the Stop Rule:

- **S3 — critical:** crash; data loss; a required beat is uncompletable on a
  required path (tap-only or reduced-motion); a grader returns a *false correct*
  or *false incorrect*.
- **S2 — major:** accessibility violation; a broken gate or CTA-enable rule;
  console errors; a missed performance target; misleading feedback.
- **S1 — minor:** copy nits, token drift, polish, non-blocking inconsistencies.

---

## 4. Split-autonomy classifier

The decisive rule for **commit vs. stage**:

### Auto-fix → commit (objective)
A finding is auto-fixable when it is an **O1–O5 failure fixable in code/config
without changing authored content or pedagogy**, AND it can be captured by a
**failing regression test that the fix turns green**. Examples:
- Uncaught exception / console error
- A gate or CTA-enable rule that doesn't match the spec
- A grader mis-handling a known input or throwing on malformed input
- Broken reduced-motion or tap-only path; missing `aria-live`; focus loss; sub-44px target
- Layout overflow at the 768px breakpoint; literal hex where a token exists
- A genuine fixture **bug** (e.g. a target recurrence that disagrees with the engine)

Every auto-fix lands with its test and must pass the **verify gate**
(`npm run validate && npx vitest run && npm run build && npm run lint`); red ⇒
the cycle's edits are reverted, never committed.

### Stage → await approval (subjective)
Anything that is an **opinion about teaching or content** is applied on a
per-cycle branch and opened as a **pull request** (with a rationale in the PR
body) for red/green review — **never merged automatically**. Examples:
- Any P1–P5 improvement (clarity, struggle, fit, redundancy)
- Adding or removing an interactive element, or a whole beat
- Rewording prompts, feedback, or hints (authored copy is pedagogy, not a bug)
- Reordering beats; difficulty/scaffolding changes; new-beat proposals

Edge rule: if a fix is *objective in mechanism* but *changes authored copy*
(e.g. feedback wording), it is **subjective** → stage. If it changes
code/logic/structure to meet the spec, it is **objective** → auto-fix.

Per-cycle edit cap: at most **3** auto-fixes committed per cycle, highest
severity first, to keep diffs reviewable.

Proposal delivery: **one branch + PR per cycle** (e.g. `beat-audit/cycle-NN`),
each staged change applied in the branch so you review it as a red/green diff and
merge or close it. Requires a GitHub remote + `gh`; if neither exists we fall
back to local review branches (no PR) and note it.

---

## 5. Scoreboard schema

Each cycle appends one record to `audits/scoreboard.json` (cross-cycle memory,
since the in-session loop itself is ephemeral):

```jsonc
{
  "cycle": 3,
  "timestamp": "2026-06-23T22:10:00Z",
  "beats": {
    "open-bet": {
      "pedagogy": { "P1": 4, "P2": 3, "P3": 5, "P4": 4, "P5": 4 },
      "pedagogyMean": 4.0,
      "objective": { "O1": "pass", "O2": "pass", "O3": "pass", "O4": "pass", "O5": "pass" },
      "findingIds": ["c3-open-bet-P2-01"]
    }
    // ...one entry per beat
  },
  "totals": {
    "pedagogyMean": 4.12,
    "objectivePass": "53/55",
    "openFindings": { "S3": 0, "S2": 1, "S1": 4 },
    "pedagogyMeanDeltaVsPrev": 0.08
  }
}
```

Findings live in `audits/backlog.json`:

```jsonc
{
  "id": "c3-equation-tiles-O2-01",
  "beatId": "equation-tiles",
  "axis": "objective",        // objective | pedagogy
  "dimension": "O2",
  "severity": "S2",
  "kind": "auto-fix",         // auto-fix | stage
  "summary": "checkRow throws on a tokens array containing a lone 'op:='",
  "repro": "e2e/equation-tiles.spec.ts > malformed sequence",
  "status": "open"            // open | fixed | proposed | accepted | wontfix
}
```

---

## 6. Stop Rule (termination)

The loop **stops** when ALL of these hold:

1. Every **required** beat has `pedagogyMean ≥ 4.0` **and** no single P-dimension
   `< 3` on any required beat. (Extension beats: `pedagogyMean ≥ 3.0`.)
2. All objective checks (O1–O5) are `pass` or `n/a` on every beat.
3. **Zero** open S2 or S3 findings.
4. Convergence: `|pedagogyMeanDeltaVsPrev| < 0.1` (a cycle that barely moved the
   needle).

OR a hard stop fires:

5. **Max cycles** reached (**3**) — report status and halt.
6. The user says stop.

Anti-spin guard: if two consecutive cycles produce only **staged proposals** with
no human approvals in between, the loop **pauses** (it does not keep re-auditing
unchanged beats) and surfaces the pending proposals.

---

## 7. Cycle procedure (how the loop uses this doc)

One cycle = one heartbeat tick:

1. **Refresh inventory** from the fixture + `src/lesson/beats/index.tsx`.
2. **Pass A — pedagogy:** one read-only subagent per beat scores P1–P5 against
   §2A and writes proposals for anything `< 4`.
3. **Pass B — functional (O1):** Playwright drives each widget at `/dev/lesson`,
   asserting against the CTA matrix + beat spec.
4. **Pass C — robustness/a11y/perf (O2–O4):** Vitest fuzz on the pure modules
   (`equationChecker`, `equationDiagnosis`, `stateTapHints`, `hintLadder`,
   engine) + Playwright chaos and the reduced-motion project.
5. **Conformance (O5):** code inspection + visual snapshot.
6. **Score → `audits/scoreboard.json`; file findings → `audits/backlog.json`.**
7. **Edit:** auto-fix up to 3 objective findings (+ tests) → run the verify gate
   → commit; apply subjective findings on a `beat-audit/cycle-NN` branch, open a
   PR, and pause for review.
8. **Evaluate the Stop Rule**; stop, pause, or re-arm the next tick.

---

## 8. Locked knobs (approved 2026-06-23)

- **Proposal delivery:** one branch + PR per cycle (`beat-audit/cycle-NN`).
- **Max cycles:** 3.
- **Per-cycle auto-fix cap:** 3.
- **Pedagogy threshold:** `≥ 4.0` mean, no dimension `< 3` (Extension `≥ 3.0`).
