# L6 Plan — Longer Patterns & Overlap (`lesson-longer-patterns`)

> **STALE NUMBERING (annotated 2026-06-27).** The filename and "Final lesson (L6 of 6)" use the retired
> ordering. **Canonical:** `lesson-longer-patterns` is **L5** (transfer check); `lesson-overlap-shortcut` is the
> final **L6**. See `CONTEXT.md` → "Lesson order (L1–L6)" and `docs/proposed-lessons.md §1`. Not renamed to
> avoid breaking references; trust the canonical order.

**Agent:** 5 of 5 (curriculum / transfer lesson)  
**Status:** Ideation → fixture-ready spec  
**Course position:** Final lesson (L6 of 6); unlocks `six-lessons-complete` milestone  
**Milestone:** `state-machine-builder`  
**Unlocks:** `null` (course end; roadmap stub `lesson-weighted-coins` visible but locked)

---

## 1. Positioning

### Role in the course

L6 is the **final transfer lesson**. The learner has already:

| Prior lesson | What L6 assumes |
|---|---|
| **L1** Pattern Hitting Times | States, failure edges, equation tiles, substitution, theory-vs-sim, overlap narrative on `HH` vs `HT` |
| **L2** Penney's Game | Cross-mode AutocorrelationRuler (optional recall; not required in L6 opener) |
| **L3** Gambler's Ruin | First-step recurrences, linear solve habit |
| **L4** Overlap Shortcut | Border-sum `E = Σ 2^L`, SumTiles, self-mode ruler — **retrieval**, not re-teach |
| **L5** States & Streaks | Minimal warm-up on single-state `H`; confirms the method scales down |

L6 asks: *can you apply the full toolkit to a **novel** length-3 pair you were never hand-held through?*

### Hook (no HH/HT recap)

> *"Both patterns are length 3. One waits **8** flips on average, the other **10**. Same length — where do the extra 2 flips come from?"*

The opener is **prediction-only** on `THH` vs `HTH`. Do **not** reopen the `HH`/`HT` contrast, show a recall grid, or name the flagship numbers. The learner's prior knowledge is assumed; wrong guesses are productive.

### Core learning promise

After L6, the learner can:

1. Build a 4-state KMP automaton for an unseen `H`/`T` pattern.
2. Identify the **overlap-breaking** near-miss edge(s) that change expected wait.
3. Assemble and solve the 4-row recurrence system without answer reveal (at most 2 hints).
4. Predict which of two same-length patterns waits longer — and justify via borders or reset depth.
5. Cross-check recurrence, border-sum ledger, and simulation on `E[THH]=8`, `E[HTH]=10`.

### Quant-interview framing

Interviewers often ask: *"Expected flips until `THTH`?"* or *"Why doesn't length determine wait?"* L6 trains the habit:

> **States → near-miss edges → recurrences → solve → validate → border shortcut.**

The graded beats are deliberately **setup beats** (`failure-edge`, `equation-tiles`) with faded scaffolding — mirroring whiteboard pressure where the interviewer won't give the answer but may nudge once.

---

## 2. Math foundation

### KMP prefix function and borders

For pattern `w` of length `L`, the **prefix function** `π[i]` (KMP) gives the length of the longest proper prefix of `w[0..i]` that is also a suffix.

A **border** (self-overlap length) is any `k ∈ {1, …, L}` such that `w[0..k-1] = w[L-k..L-1]`. Always include `k = L` (the full pattern).

| Pattern | `π` | Proper borders | All borders `B` |
|---|---|---|---|
| `THH` | `[0, 0, 0]` | *(none)* | `{3}` |
| `HTH` | `[0, 0, 1]` | `{1}` | `{1, 3}` |

**Reading KMP on the automaton:** when a mismatch occurs at state `E_k`, the engine falls back to `E_{π[k-1]}` (or `E_0`). A proper border at length `k` means a near-miss can reset to `E_k` instead of `E_0` — preserving `k` symbols of progress.

### Border-sum formula (fair coin)

For fair binary patterns:

\[
E[w] = \sum_{k \in B} 2^k
\]

where `B` is the set of border lengths (always including `L`).

| Pattern | Sum | Result |
|---|---|---|
| `THH` | `2³` | **8** |
| `HTH` | `2¹ + 2³ = 2 + 8` | **10** |

Cross-check: `buildAutomaton(pattern, 0.5).expectedTimes.E0` (golden tests in `src/engine/automaton.test.ts`).

**Term intuition (for TermLedger copy):**

- `2^L` — base "frequency" term: pattern probability `1/2^L`, fair-casino payout scale.
- Each **proper** border `k < L` — extra startup penalty: a near-miss can restart with `k` symbols already matched (shallower reset → longer wait).

### Engine automata (authoritative, `p = 0.5`)

#### `THH` — 4 states `∅, T, TH, THH`

```
E0 ──T──► E1 ──H──► E2 ──H──► E3 (absorbing)
 │         │ self(T)  │
 └──H──► E0          └──T──► E1  ← reset (not E0!)
```

| State | Recurrence |
|---|---|
| `E0` | `1 + ½ E0 + ½ E1` |
| `E1` | `1 + ½ E2 + ½ E1` |
| `E2` | `1 + ½ E3 + ½ **E1**` ← reset to `E1`, not `E0` |
| `E3` | `0` |

- **Overlap highlights:** `E1` on `T` (self-loop), `E2` on `T` (reset to `E1`).
- **Signature near-miss for transfer:** at `E2` (`TH` matched), flip `T` → fall back to `E1` (`T`), not empty. Progress is *partially* preserved — but no proper border means this is the *deepest* meaningful reset and the system still resolves to `E0 = 8`.

#### `HTH` — 4 states `∅, H, HT, HTH`

```
E0 ──H──► E1 ──T──► E2 ──H──► E3 (absorbing)
 │         │ self(H)  │
 └──T──► E0          └──T──► E0  ← full reset
```

| State | Recurrence |
|---|---|
| `E0` | `1 + ½ E1 + ½ E0` |
| `E1` | `1 + ½ E1 + ½ E2` ← **self-loop on `H`** (border `k=1`) |
| `E2` | `1 + ½ E3 + ½ E0` |
| `E3` | `0` |

- **Overlap highlights:** `E1` on `H` (self-loop), `E2` on `T` (reset to `E0`).
- **Signature near-miss:** at `E1` (`H` matched), flip `H` → stay at `E1`. Same structural move as `HT`'s `E1` self-loop — the `k=1` border costs **+2** flips vs `THH`.

### Why `THH` is faster despite the same length

| Misconception | Reality |
|---|---|
| "Length 3 ⇒ same wait" | `THH`=8, `HTH`=10 — **2-flip gap** |
| "Rarer pattern ⇒ longer wait" | Both appear with frequency `1/8` per window |
| "Longer pattern ⇒ slower" | `THH`(3)=8 < `HHH`(3)=14; length is not monotonic |

**Correct story:** per-window rarity is identical (`2^3`). The difference is **self-overlap**:

- `THH` has **no proper border** → only the `2³` term → minimal wait for length 3 (`2^L`).
- `HTH` has border **`k=1`** (`H`…`H`) → adds `2¹=2` → the `E1` self-loop term in the recurrence → **+2** expected flips.

This is the length-3 echo of `HT`(4) vs `HH`(6): preserving progress on a near-miss shortens wait; the `k=1` border is the quantitative fingerprint.

---

## 3. Signature visual

**Hero moment:** side-by-side **4-node mini-graphs** at the overlap-compare beat, with:

1. **Near-miss edge contrast** — `THH`: `E2 ──T──► E1` (partial reset); `HTH`: `E1 ──H──► E1` (self-loop) highlighted in `--accent-overlap`.
2. **Border-sum ledger** — TermLedger below the graphs:
   - `THH`: single tile `2³ = 8`
   - `HTH`: tiles `2¹ + 2³ = 10` snapping into place

Layout (desktop): two `StateGraph` columns (240px each) + centered ledger strip; mobile: swipeable tabs (`THH` | `HTH`) with ledger sticky below.

---

## 4. Beat inventory (12 beats)

Phase rail: **Bet → Explore → Model → Prove** (same 4-phase top bar as L1).

| # | beatId | Phase | Required | Type | Purpose |
|---|---|---|---|---|---|
| 1 | `open-bet` | Bet | ✓ | `prediction` | Commit: `THH` vs `HTH` vs tie — **no HH/HT mention** |
| 2 | `pattern-pick` | Bet | ✓ | `patternPick` | Lock compare mode `THH` vs `HTH` |
| 3 | `simulate` | Explore | ✓ | `coinSim` | 4-state graph; feel deeper resets; guided replay to near-miss |
| 4 | `overlap-ruler` | Model | ✓ | `overlapRuler` *(NEW)* | Self-mode: discover borders before graded setup |
| 5 | `failure-edge` | Model | ✓ | `stateTap` | **Transfer setup #1** — tap near-miss targets |
| 6 | `equation-tiles` | Model | ✓ | `equationTiles` | **Transfer setup #2** — build 4-row system |
| 7 | `refine-prediction` | Prove | ✓ | `slider` | Lock numeric prediction before solve |
| 8 | `guided-solve` | Prove | ✓ | `substitution` | Tap-through 4-state algebra |
| 9 | `theory-vs-sim` | Prove | ✓ | `theorySimChart` | MC convergence; both patterns on chart |
| 10 | `border-sum-ledger` | Prove | ✓ | `termLedger` *(NEW)* | Assemble `Σ 2^L`; land on 8 vs 10 |
| 11 | `overlap-compare` | Prove | ✓ | `overlap` + mini-graphs | Side-by-side 4-node contrast + narrative |
| 12 | `recap` | Prove | ✓ | `recap` | Course completion; **Fully mastered** badge |

**Cut line if slipping:** drop beats 4 and 10 → **10 beats**; keep transfer setup beats 5–6 and overlap-compare 11.

---

## 5. Beat-by-beat specification

### Beat 1 — `open-bet` (prediction)

**Prompt:** *"You flip a fair coin until `THH` appears. Then again until `HTH` appears. Which wait is longer?"*

**Options:**
- "Waiting for `THH` takes longer"
- "Waiting for `HTH` takes longer"
- "They tie — both are length 3"

**CTA:** `Check` → `Continue` (prediction recorded, not graded for correctness).

**Feedback:**
- Correct (any choice): *"Good — we'll build both automata and test your instinct."*
- Hints (3 levels, standard cap): nudge toward "length ≠ wait" without naming 8 or 10.

**Analytics:** `initialPrediction` ∈ {THH, HTH, tie}.

**Explicit exclusion:** No recap card, no "remember HH vs HT", no numbers 6/4/8/10.

---

### Beat 2 — `pattern-pick` (compare lock-in)

**Prompt:** *"We'll derive both side by side — same fair coin, same method."*

**Interaction:** `{ type: "patternPick", patterns: ["THH", "HTH"], mode: "compare" }`

**Feedback:** Confirm compare mode; hint ladder mentions both stay selected for the lesson.

**Pattern chip behavior:** Active pattern chip switches context on beats 3–8 (simulate, ruler, setup beats). Compare overlay on beats 9–11.

> **(review: this infrastructure does not exist yet.** `LessonPlayer` builds **one** automaton from `patternOptions[0]` (`const pattern = lesson.patternOptions[0]`) and passes that single `automaton` to every beat; there is no active-pattern state or chip. The graded beats (`stateTap`, `equationTiles`, `substitution`) only ever see THH. See "Implementation → Two-pattern grading" for the recommended fix (per-beat `pattern` field + split graded beats).)

---

### Beat 3 — `simulate` (coinSim, 4-state)

**Prompt:** *"Flip and watch the 4-state machine. Where does a near-miss send you?"*

**Interaction:**
```json
{ "type": "coinSim", "mode": "free", "gate": { "minFlips": 5 } }
```

**Hero:** 4-node `StateGraph` always visible; prefix chip shows `∅` / `T` / `TH` / `THH` (or `H` / `HT` / `HTH`).

**On Continue:** guided replay (mode `guidedReplay` segment) stepping to:
- `THH`: stream `… T H T` — lands on `E2`, next flip `T` → animate reset to `E1`
- `HTH`: stream `… H H` — lands on `E1`, next flip `H` → animate self-loop

Replay uses `byPattern` authored paths; gates `failure-edge`.

**Feedback byPattern:** Short copy on what the replay showed (no graded check).

---

### Beat 4 — `overlap-ruler` (OverlapRuler / AutocorrelationRuler, self mode)

**Prompt:** *"Slide a copy of the pattern over itself. Which shifts are full matches — borders?"*

**Widget:** `OverlapRuler` (self mode) — shared component with L4, configured `mode: "self"`.

**Manipulation:**
- Drag (or ◀/▶ step) translucent pattern over fixed row.
- Matching columns glow; full-window matches tag border length `k` and spawn a `2^k` chip (preview only — ledger beat assembles formally).

**Graded micro-check (per active pattern):**
- Tap each tagged shift: "Is this a border?" Yes/No against engine `borders(pattern)`.
- `THH`: only shift 3; reject shifts 1, 2.
- `HTH`: shifts 1 and 3.

**Engine:** `borders(pattern)` from `prefixFunction` (pure helper; golden: `{THH: [3], HTH: [1,3]}`).

**Feedback byPattern:**
- `THH`: *"No proper border — only the full match at length 3. That usually means a shorter wait for this length."*
- `HTH`: *"Border at k=1: the leading and trailing H match. That self-overlap adds cost."*

**Hints:** Standard 3-level; **not** transfer-scored (scaffolding beat).

**Reduced motion:** step buttons only; matches = color + ✓, no slide animation.

---

### Beat 5 — `failure-edge` (stateTap) — TRANSFER SETUP

**Prompt:** *"After the near-miss shown in the replay — where does the machine go?"*

**Interaction:**
```json
{
  "type": "stateTap",
  "transitions": [
    { "from": "E2", "on": "T" },
    { "from": "E1", "on": "H" }
  ]
}
```
*(Targets swap by active pattern — engine `overlapHighlights` drives grading.)*

> **(review: the authored `transitions` array mixes both patterns' edges** — `{E2,T}` is THH's near-miss but `{E1,H}` is HTH's (in THH, `E1 on H` is an *advance* to E2, not a near-miss). `StateTapBeat` grades every listed transition against the **single** `automaton` via `nextStateOf`, so this list cannot be graded against one pattern. The beat must either (a) be split per pattern, each authoring that pattern's own edges, or (b) read `automaton.overlapHighlights` of the active pattern instead of a fixed authored list. See Implementation.)

**Grading:** Learner must correctly tap **both** patterns' primary near-miss edge before Continue:
- `THH`: `E2` on `T` → `E1` (reset, not `E0`)
- `HTH`: `E1` on `H` → `E1` (self-loop)

**UI:** Pattern toggle or sequential sub-steps (`THH` then `HTH`); progress dots "1/2 patterns".

**`maxHintLevel: 2`** — no level-3 reveal.

**Hints byPattern (2 levels each):**

| Pattern | Hint 1 | Hint 2 |
|---|---|---|
| `THH` | "You matched `TH`. The next symbol needed is `H`. What if you flip `T`?" | "The fallback uses the longest proper prefix — here that's `T`, state `E1`." |
| `HTH` | "You matched `H`. Another `H` doesn't finish `HTH` yet. Does progress vanish?" | "`E1` on `H` loops back to `E1`. The matched `H` is preserved." |

**Wrong-path feedback:** Tap `E0` on `THH`/`E2`/`T` → *"That's a full reset — the KMP fallback stops at `T`, not empty."*

**Transfer scoring:** See §7.

---

### Beat 6 — `equation-tiles` (4 rows) — TRANSFER SETUP

**Prompt:** *"Build the expected-time equations for every state. `E3 = 0` is already placed."*

**Interaction:** `equationTiles` with **4 rows** (`E0`–`E3`); `E3` row pre-filled, `graded: false`.

**Bank:** Same tile kinds as L1 plus `E3` state tile.

**Rows (graded per pattern):**

| Row | `THH` target | `HTH` target |
|---|---|---|
| `E0` | `1 + ½ E0 + ½ E1` | `1 + ½ E1 + ½ E0` |
| `E1` | `1 + ½ E2 + ½ E1` | `1 + ½ **E1** + ½ E2` ← self-loop |
| `E2` | `1 + ½ E3 + ½ **E1**` ← reset term | `1 + ½ E3 + ½ E0` |
| `E3` | `0` (given) | `0` (given) |

**UX:** Toggle `THH` | `HTH`; each pattern needs rows `E0`–`E2` graded (3 rows × 2 patterns = 6 checks, or 2 patterns × 3 rows sequential).

**`maxHintLevel: 2`**

**Hints byPattern:**
- `THH` / `E2`: *"On `T` from `TH`, KMP falls back to `T` — that's `E1`, not `E0`."*
- `HTH` / `E1`: *"Look at the `H` edge out of `E1` — does progress reset?"*

**Diagnosis reuse:** `equationDiagnosis` module flags swapped reset vs self-loop terms.

> **(review: only partially true, and the gap is the #1 risk.** `diagnoseRow`'s per-slot green/red grading *is* target-generic and works for THH/HTH out of the box. But the *mistake classification* (`classifyStateMistake`) is hard-coded to the `{E0,E2}` target (HH's E1 row); every other target falls back to `wrong-var-generic`. Worse, `EquationTilesBeat` **overrides authored level-1/2 hints** with `hintForMistake(...)`, whose copy is HH-specific ("waiting for HH", "one matched head") — so the authored `byPattern` hints below are *dead* (only `hints[2]`, the reveal, is authored, and `maxHintLevel:2` suppresses it). On THH/HTH this surfaces HH language that is **actively wrong**. The module must be generalized — or the beat must route non-HH targets to authored hints. See Implementation → `equationDiagnosis` generalization.)

**Transfer scoring:** See §7.

---

### Beat 7 — `refine-prediction` (slider)

**Prompt:** *"Lock your expected waits before the algebra confirms them."*

**Interaction:** Dual slider or two-step lock:
- `THH`: slider `[4, 14]`, step 1
- `HTH`: slider `[4, 14]`, step 1

**Gate:** Both markers placed → `Check` → `Continue`.

**Feedback:** Compare to `initialPrediction`; celebrate improvement without revealing truth yet.

**Analytics:** `finalPrediction` { THH, HTH }.

---

### Beat 8 — `guided-solve` (substitution)

**Prompt:** *"Tap through the substitution — from `E3` down to `E0`."*

**Interaction:** `{ type: "substitution" }` — steps from `buildAutomaton(activePattern, 0.5).substitutionSteps`.

**Flow:** Solve `THH` first (lands on 8), then `HTH` (lands on 10). Pattern chip switches between sequences.

**Cut line:** Single-pattern only if slipping (HTH only); prefer both.

**Hints:** Standard 3-level (not transfer-scored).

---

### Beat 9 — `theory-vs-sim` (theorySimChart)

**Prompt:** *"Run simulations for both patterns. Does the mean land on your theory?"*

**Interaction:** `{ type: "theorySimChart" }` — dual series:
- Theory lines at 8 and 10
- Learner prediction markers from beat 7
- Empirical means converge separately (color-coded)

**Gate:** `minRuns: 200` per pattern (or combined toggle).

**Feedback:** *"`THH` settles near 8, `HTH` near 10 — three methods agree."*

---

### Beat 10 — `border-sum-ledger` (TermLedger / SumTiles)

**Prompt:** *"Each border length contributes a `2^k` term. Build the sum for each pattern."*

**Widget:** `termLedger` (alias `SumTiles` in PRD L4).

**Manipulation:**
- Border chips discovered in beat 4 (or re-listed): tap to drop `2^k` tiles into ledger.
- Running partial sum updates live.
- Wrong/duplicate term rejected with flash.

**Targets:**
- `THH`: tap `2³` → sum **8**
- `HTH`: tap `2¹`, then `2³` → sum **10**

**Graded check:** Final sum within 0 of `expectedTimes.E0`.

**Feedback byPattern:**
- `THH`: *"Only one term — no proper border penalty. That's why `THH` is the fast length-3 pattern."*
- `HTH`: *"`2¹` is the border at k=1; it accounts for the 2-flip gap over `THH`."*

**Cross-check copy:** *"Same formula L4 used — now on patterns you derived from scratch."*

---

### Beat 11 — `overlap-compare` (side-by-side mini-graphs)

**Prompt:** *"Same length, different memory — see the near-miss edges and the border sums together."*

**Interaction:** Composite beat:
1. **Dual 4-node `StateGraph`** (mini layout, no sim controls)
2. **`overlap` highlights** on both graphs simultaneously
3. **TermLedger strip** (read-only, populated from beat 10)

**Highlights:**
| Graph | Edge | Label |
|---|---|---|
| `THH` | `E2 ──T──► E1` | "Partial reset — no k=1 border" |
| `HTH` | `E1 ──H──► E1` | "Self-loop — border k=1" |

**CTA:** `Continue` (narrative beat, not graded).

**Takeaway copy:** *"Overlap is memory. `HTH` remembers an extra `H` on a near-miss; that memory costs 2 expected flips."*

---

### Beat 12 — `recap` (course completion)

**Prompt:** *"You applied the method to novel patterns — states, equations, simulation, and the border shortcut."*

**Recap card fields:**
- Initial vs final prediction
- Theory: `E[THH]=8`, `E[HTH]=10`
- Simulation means
- Border sums
- **Mastery label:** "Fully mastered" if `transferAttained` else "Completed"
- Milestone: `state-machine-builder`
- Course milestone: `six-lessons-complete` (if all six done)
- Next: locked roadmap node **Weighted Coins & Dice**

**If `needsReview`:** inline link *"Review failure-edge and equation-tiles"* (non-blocking).

---

## 6. New widgets

### 6.1 OverlapRuler / AutocorrelationRuler (self mode)

| Field | Value |
|---|---|
| **ID** | `overlapRuler` |
| **Modes** | `self` (L6), `cross` (L2/L4) |
| **Engine** | `borders(pattern: string): number[]` |
| **DOM** | Mono letter rows + offset slider; optional Konva tie-line to graph reset edge |
| **Accessibility** | Step buttons; `aria-label` per shift; reduced motion = instant match highlight |
| **Reuse** | Authored in L4 fixture; L6 imports same component |

### 6.2 TermLedger / SumTiles

| Field | Value |
|---|---|
| **ID** | `termLedger` |
| **Engine** | `borders()` + `pow2(k)`; validate `sum === buildAutomaton(...).expectedTimes.E0` |
| **UI** | Tile bank (`2¹`, `2²`, …) + running sum rail; `--correct` snap animation |
| **Reuse** | L4 `sumTiles`; L6 uses dual-pattern variant |

### 6.3 Side-by-side 4-node mini-graphs

| Field | Value |
|---|---|
| **ID** | `dualStateGraph` (layout wrapper, not new graph engine) — **(review: already exists.** `OverlapBeat` (the existing `overlap` interaction type) maps over `patternOptions` and renders one `StateGraph` per pattern with that automaton's `overlapHighlights`, plus an auto-generated "resets to … / keeps progress at …" note from each transition's `kind`. With `patternOptions: ["THH","HTH"]` it renders the two-up 4-node contrast with **zero new widget code and zero new schema variant**. `StateGraph` lays out N nodes generically, so 4-state graphs render fine.) |
| **Source** | Two `buildAutomaton` calls; shared `TransitionRenderer` |
| **Highlight** | `overlapHighlights` + `kind` coloring (reset vs self-loop) |
| **Mobile** | Tab switch with sync highlight on active tab |

---

## 7. Transfer assessment — `transferAttained` logic

### Definition (PRD-aligned)

```ts
derived.transferAttained =
  transferSetupPassed("THH", "failure-edge") &&
  transferSetupPassed("THH", "equation-tiles") &&
  transferSetupPassed("HTH", "failure-edge") &&
  transferSetupPassed("HTH", "equation-tiles");
```

Where:

```ts
function transferSetupPassed(pattern: "THH" | "HTH", beatId: "failure-edge" | "equation-tiles"): boolean {
  return (
    beatCompleted(beatId, pattern) &&
    hintLevelByBeatAndPattern[beatId][pattern] < 2 &&  // never consumed hint level 2
    !revealed(beatId, pattern)                           // no reveal path exists (maxHintLevel 2)
  );
}
```

> **(review: this derivation cannot read what it needs from current plumbing.** Two concrete blockers: (1) **Level resets on pass.** `onCorrect` sets `level: 0` (keeping only `wrongCount`/`everRevealed`), and the only persisted signal is `hintLevelByBeat` = the *current* level, so after a successful pass it is `0` regardless of whether the cap was hit. You must persist a **high-water mark** (max level reached) or `wrongCount` to know "passed without hitting level 2". (2) **No per-pattern key.** Snapshot stores `hintLevelByBeat` keyed by `beatId` only; `hintLevelByBeatAndPattern` does not exist. The clean fix is to split the transfer beats per pattern (distinct `beatId`s ⇒ per-pattern tracking for free). See Implementation → transferAttained.)

### Hint cap mechanics (`maxHintLevel: 2`)

| Event | Effect |
|---|---|
| Wrong `Check` on setup beat | Increment hint level for `(beatId, pattern)` |
| Hint level reaches **2** | Show hint 2 text; **no hint 3 / no reveal** |
| Further wrong checks after level 2 | `needsReview = true` for that `(beatId, pattern)`; learner can still pass by answering correctly |
| Correct `Check` after hints | Beat passes; hint level frozen for scoring |
| **`hintLevelByBeatAndPattern[beatId][pattern] >= 2` at pass time** | Counts as **cap reached** → `transferSetupPassed = false` for that cell |

**Important:** Passing on first try with hint level 0 → counts toward transfer. Using hint 1 only → still counts. Using hint 2 (cap) → pass allowed, transfer **not** attained for that cell.

### Snapshot fields (client-written)

```jsonc
{
  "lessonId": "lesson-longer-patterns",
  "interactionState": {
    "hintLevelByBeatAndPattern": {
      "failure-edge": { "THH": 1, "HTH": 0 },
      "equation-tiles": { "THH": 0, "HTH": 2 }
    },
    "transferSetupPassed": {
      "THH": { "failure-edge": true, "equation-tiles": true },
      "HTH": { "failure-edge": true, "equation-tiles": false }
    },
    "initialPrediction": "tie",
    "finalPrediction": { "THH": 8, "HTH": 10 }
  }
}
```

### Progress document (Cloud Function on complete)

```jsonc
{
  "lessonId": "lesson-longer-patterns",
  "completionStatus": "completed",
  "masteryStatus": "mastered",           // always — completion = mastery for unlock
  "needsReview": true,                   // if any setup cell hit cap or ≥3 wrong submits
  "derived": {
    "transferAttained": false,
    "initialPrediction": "tie",
    "finalPrediction": { "THH": 8, "HTH": 10 },
    "theoreticalValue": { "THH": 8, "HTH": 10 },
    "empiricalMean": { "THH": 7.9, "HTH": 10.2 },
    "transferSetupByPattern": {
      "THH": { "failure-edge": "passed_clean", "equation-tiles": "passed_clean" },
      "HTH": { "failure-edge": "passed_clean", "equation-tiles": "hint_cap" }
    }
  }
}
```

### Learner-facing labels

| Condition | Course path badge | Recap headline |
|---|---|---|
| `transferAttained === true` | **Fully mastered** | "You transferred the method — no reveals needed." |
| else | **Completed** | "Lesson complete — consider reviewing the setup beats." |

**Unlock rule:** unchanged. `masteryStatus: mastered` on completion regardless of transfer.

### Analytics events

- `answer_submitted` with `{ beatId, pattern, attemptN, correct, hintLevel, transferBeat: true }` on beats 5–6.
- `lesson_completed` with `{ needsReview, transferAttained }`.
- KPI: `% transferAttained` among completers; first-try-correct rate on setup beats per pattern.

---

## 8. Fixture outline

**File:** `fixtures/lesson-longer-patterns.json`

```json
{
  "lessonId": "lesson-longer-patterns",
  "courseId": "course-pattern-hitting-times",
  "title": "Longer Patterns & Overlap",
  "patternOptions": ["THH", "HTH"],
  "milestoneId": "state-machine-builder",
  "unlocks": null,
  "schemaVersion": 1,
  "beats": [ /* 12 beats per §5 */ ]
}
```

**Engine-driven fields** (not duplicated in fixture):
- `transitions`, `recurrences`, `substitutionSteps`, `overlapHighlights`, `expectedTimes` from `buildAutomaton(pattern, 0.5)`.

**New engine export (Phase 24):**
```ts
export function borders(pattern: string): number[] {
  const L = pattern.length;
  const pi = prefixFunction(pattern);
  const result: number[] = [];
  for (let k = 1; k <= L; k++) {
    if (pattern.slice(0, k) === pattern.slice(L - k)) result.push(k);
  }
  return result;
}
```

Golden tests:
```ts
expect(borders('THH')).toEqual([3]);
expect(borders('HTH')).toEqual([1, 3]);
expect(borders('THH').reduce((s,k)=>s+2**k,0)).toBe(8);
expect(borders('HTH').reduce((s,k)=>s+2**k,0)).toBe(10);
```

---

## 9. Misconceptions targeted

| Misconception | Where surfaced | Correct resolution |
|---|---|---|
| Same length ⇒ same wait | `open-bet`, `refine-prediction` | 8 vs 10 |
| Longer pattern always slower | `border-sum-ledger`, recap | `THH`(3)=8 < `HHH`(3)=14 |
| Near-miss always resets to start | `failure-edge` THH | `E2`/`T` → `E1` |
| Only full-length overlap matters | `overlap-ruler`, HTH ledger | k=1 border adds `2¹` |
| Rarity determines wait | `theory-vs-sim` | Same 1/8 frequency, different memory |

---

## 10. Dependencies and build order

| Dependency | Status |
|---|---|
| `buildAutomaton('THH'|'HTH', 0.5)` | ✅ golden tests exist |
| Flagship widgets (coinSim, stateTap, equationTiles, slider, substitution, theorySimChart, overlap, recap) | ✅ L1 |
| OverlapRuler self mode | 🔲 from L4 widget spec |
| TermLedger / SumTiles | 🔲 from L4 widget spec |
| `borders()` helper | 🔲 small engine add |
| Cloud Function `transferAttained` compute | 🔲 Phase 24 — **(review: the current `completeLesson` CF has neither the inputs nor a snapshot read.** `CompleteLessonInput.derived` carries only `{initialPrediction, finalPrediction, empiricalMean, theoreticalValue, simRuns}` (all scalars; `buildDerived` runs them through `finiteNumber`, which would null out per-pattern objects). Recommend the **client** compute `transferAttained` from in-memory ladders and pass it through `derived` (the field already exists, optional, in `ProgressDerivedSchema`); thread it through `DerivedInput` + `buildDerived`. It is a non-gating quality badge, so client-asserted is acceptable.) |
| Fixture + seed | 🔲 Phase 24 |

**Phase 24 manual test checklist:**
1. Complete L6 without hints on beats 5–6 for both patterns → "Fully mastered" + `transferAttained: true`.
2. Complete with hint cap on `HTH` equation-tiles → "Completed" + `transferAttained: false` + review link.
3. Confirm unlock / `six-lessons-complete` in both cases.
4. `npm run validate` + vitest green on border-sum golden values.

---

## 11. Author notes

- **Interleaving:** Beats 5–6 alternate or sub-step `THH` then `HTH` — avoid blocking on one pattern only.
- **Voice:** Quant-interview serious; no gamification beyond existing design tokens.
- **Expert note (beat 11, collapsible):** Fair-coin border-sum equals Conway correlation polynomial evaluation at 2; link forward to Weighted Coins (`Σ (1/p)^k`).
- **Do not add** bias-sandbox to L6 (flagship/L5 territory); keep lesson focused on transfer.

---

## Plan assessment (Opus 4.8 review)

**Verdict: Solid-with-fixes.** The pedagogy is genuinely strong and the math is *exactly* right (engine-verified below). The fixes are all on the *implementation premises*, not the lesson design: the plan assumes a two-pattern "active chip" grading architecture, a per-pattern hint-cap signal, and a CF transfer computation that **do not exist yet**, and it under-counts the work because it frames the lift as "new widgets" when the widgets are the *easy* part (one already exists) and the **two-pattern grading + `transferAttained` plumbing** is the real cost.

### Pedagogy

- **Transfer fidelity — excellent.** Novel length-3 pair, no `HH`/`HT` recap in the opener, prediction-only hook, graded work concentrated on the two *setup* beats (`failure-edge`, `equation-tiles`) with `maxHintLevel:2`. This is a true transfer test, not a re-teach. The "states → near-miss → recurrences → solve → validate → shortcut" spine is the right interview habit. Keep beat 1's explicit exclusions (no 6/4/8/10).
- **`transferAttained` fairness — concept fair, mechanism currently unfair.** "Pass both patterns' failure-edge AND equation-tiles without hitting the cap" is a defensible bar *and* it's non-gating (completion still = mastery), so a missed badge never blocks the course. **But** fairness depends on the hints the learner sees at levels 1–2, and on `equation-tiles` those hints currently come from `equationDiagnosis`'s **HH-specific** copy (the authored `byPattern` hints are dead — see review tag in §5 beat 6). A learner being nudged with "waiting for HH… one matched head" while solving HTH's `E1` self-loop row is being *misled*, then denied the badge. The badge is only fair once the diagnosis is generalized (or the beat routes to authored hints). 
- **"Fully mastered" vs "Completed" — good motivation, no punishment.** Since unlock is unchanged, this is upside-only. Keep the non-blocking "review the setup beats" link.

### Verified math (engine-checked via `buildAutomaton(p, 0.5)`)

| Pattern | π (KMP) | Proper borders | All borders B | Σ 2^L | Engine `E0` | Status |
|---|---|---|---|---|---|---|
| `THH` | `[0,0,0]` | *(none)* | `{3}` | `2³ = 8` | `8` | ✓ |
| `HTH` | `[0,0,1]` | `{1}` | `{1,3}` | `2¹ + 2³ = 10` | `10` | ✓ |

Structural claims, all confirmed by the engine:

- **THH** transitions: `E0H→E0` (self), `E0T→E1`, `E1H→E2`, `E1T→E1` (self), `E2H→E3`, `E2T→E1` (**reset to E1**, not E0). `overlapHighlights = [{E1,T},{E2,T}]`. Recurrences: `E0=1+½E0+½E1`, `E1=1+½E2+½E1`, `E2=1+½E3+½E1`, `E3=0` — **identical to the plan's §2 tables.** ✓
- **HTH** transitions: `E0H→E1`, `E0T→E0` (self), `E1H→E1` (**self-loop on H — the k=1 border**), `E1T→E2`, `E2H→E3`, `E2T→E0` (full reset). `overlapHighlights = [{E1,H},{E2,T}]`. Recurrences: `E0=1+½E1+½E0`, `E1=1+½E1+½E2`, `E2=1+½E3+½E0`, `E3=0` — **identical to plan §2.** ✓
- **HTH's k=1 self-loop ≡ HT's self-loop.** Engine `HT`: `E1H→E1` (self-loop), the source of HT's `+2`. HTH reproduces exactly this at `E1`, the `2¹` term that makes `10 = 8 + 2`. ✓ (The plan's central analogy holds.)
- Both length 3, per-window frequency `1/2³ = 1/8`; `THH(8) < HTH(10) < HHH(14)` so length is non-monotonic. ✓
- The 4-row THH/HTH recurrences are all-`½`, so they **fit `TileSchema`** and the `validate-fixtures` engine↔tiles cross-check passes per row (caveat: the cross-check is hard-wired to `HH`/one file — must be generalized, see Implementation). The `Σ2^L` ledger (`2¹`, `2³`) does **not** fit `TileSchema` (no power token) → `sumTiles` must be its own variant. ✓ confirmed.

**No math corrections required** — every numeric and structural claim in §2 matches the engine.

### Scope realism & cut line

12 beats is reasonable *for the content*, but the plan's "reuse L1 beats" framing hides the real cost: **two-pattern grading is new architecture.** The honest build order is:

1. `equationDiagnosis` generalization (or coarse-route) — **biggest single risk.**
2. Two-pattern grading: per-beat `pattern` + split the two transfer beats per pattern.
3. `transferAttained`: high-water hint persistence + thread to CF.
4. Shared `autocorrelationRuler` / `sumTiles` widgets (coordinate with L4).
5. `validate-fixtures` + per-pattern derived fields.

Recommended cut line (keep ≤ ~12 *learner-facing* steps even after splitting transfer beats per pattern): drop beat 4 (`overlap-ruler`) and beat 10 (`border-sum-ledger`) **first** — they are the two net-new widgets and the transfer signal lives in beats 5–6, not here. Beat 11 (`overlap-compare`) is nearly free (existing `OverlapBeat`), so **keep it** over the ruler/ledger. If splitting 5–6 per pattern pushes the count up, that's fine — they're short single-pattern beats.

### Beat-by-beat flags

| Beat | Flag |
|---|---|
| 1 `open-bet` | ✓ Clean. `prediction` exists; exclusions are right. |
| 2 `pattern-pick` | ✓ Schema OK (`patternPick`, `mode:'compare'`). But "compare mode" is cosmetic until the player gets an active-pattern concept. |
| 3 `simulate` | ⚠ `coinSim` has `mode` + `gate` only — **no field for authored replay streams.** The "byPattern `…THT` / `…HH`" guided replay needs a stream source (hardcode by pattern in `CoinSimBeat`, or add an optional field). Also a single beat can't be both `free` and `guidedReplay`. |
| 4 `overlap-ruler` | New widget; share with L4. Top cut-line candidate. |
| 5 `failure-edge` | ⚠ Authored `transitions` mix both patterns; must split per pattern or read active `overlapHighlights` (see §5 tag). |
| 6 `equation-tiles` | ⚠ Highest risk: HH-hardcoded diagnosis + dead authored hints; 4 rows × 2 patterns needs split/cross-check work (see §5 tag). |
| 7 `refine-prediction` | ⚠ `slider` schema is single `{min,max,step}`; "dual slider / two-step lock" + per-pattern `finalPrediction:{THH,HTH}` exceed current `slider` + scalar `LessonState.finalPrediction`. |
| 8 `guided-solve` | ⚠ `substitution` reads one automaton; "solve THH then HTH" needs the per-beat pattern fix (or split). |
| 9 `theory-vs-sim` | ⚠ `theorySimChart` takes no props and reads one automaton + scalar `empiricalMean`; "dual series" is new work. Cut to one pattern if slipping. |
| 10 `border-sum-ledger` | New widget; share with L4. Top cut-line candidate. |
| 11 `overlap-compare` | ✓ **Essentially free** — existing `OverlapBeat` already renders the dual mini-graphs. Drop the "TermLedger strip" sub-panel to keep it a pure narrative beat. |
| 12 `recap` | ✓ `recap` exists; badge reads `transferAttained` (once plumbed). Per-pattern numbers in the card come from `lessonState` locally. |

### Prioritized recommended changes

1. **Generalize `equationDiagnosis`** (or route non-HH targets to authored hints) so level-1/2 hints are correct for THH/HTH. Without this the transfer badge is unfair and the equation beat shows wrong copy. *(blocker)*
2. **Add a per-beat `pattern`** to the beat schema + `LessonPlayer`, and **split** `failure-edge`/`equation-tiles` into `-thh`/`-hth` beats. This unlocks two-pattern grading *and* gives per-pattern hint tracking for free. *(blocker)*
3. **Persist a hint high-water mark** (`maxHintLevelByBeat`) and compute `transferAttained` client-side, threaded through `completeLesson`. *(blocker for the badge)*
4. **Adopt L4's variant names** `autocorrelationRuler` + `sumTiles` (don't introduce `overlapRuler`/`termLedger`) and consume L4's `src/engine/correlation.ts`. *(coordination)*
5. **Reuse `OverlapBeat` as-is** for beat 11; delete the `dualStateGraph` "new widget". *(simplification)*
6. **Generalize `validate-fixtures`** to the L6 file + THH/HTH automata; add golden tests `E0=8`, `E0=10`, `borders('THH')=[3]`, `borders('HTH')=[1,3]`.
7. Resolve the `coinSim` guided-replay-stream and `slider`/`theorySimChart`/`finalPrediction` per-pattern shapes (or cut to single-pattern on 7/9).

---

## Implementation in the tech stack

### Widget 1 — OverlapRuler → **share L4's `autocorrelationRuler` (`mode:'self'`)**

- **Reuse:** nothing existing renders this; it is genuinely new DOM. **Do not create a second widget** — adopt L4's `autocorrelationRuler` and `mode:'self'`. Engine driver lives in L4's planned `src/engine/correlation.ts` (`borders(pattern)` / `correlation(v,w)`); L6 only consumes it.
- **Component sketch:** two mono rows — fixed pattern + a translucent copy — with `◀ Shift` / `Shift ▶` buttons (tap-only). On each shift, overlapping columns highlight; a full-window column-match tags border length `k` and previews a `2^k` chip. Graded micro-check: per tagged shift, tap "border? yes/no" graded against `borders(pattern)` (`THH→{3}`, `HTH→{1,3}`). Not transfer-scored (scaffolding).
- **Per-pattern:** operates on the *active* pattern → needs the per-beat `pattern` fix (one ruler beat per pattern, or `beat.pattern`).
- **Reduced motion:** step buttons only; matched columns get color + ✓ instantly, no slide tween.
- **a11y / tap:** `role="status"` `aria-live` mirror ("Shift 1: match — add 2¹"); fully completable via the shift buttons + yes/no taps.
- **Zod (shared with L4):**
  ```ts
  z.object({
    type: z.literal('autocorrelationRuler'),
    mode: z.enum(['self', 'cross']),
    pattern: z.string().optional(),   // omitted ⇒ active pattern from BeatProps
    partner: z.string().optional(),   // cross-mode (L2) only
  })
  ```
- **Effort: M. Risk: low–med** (well-scoped; the only real risk is duplicating L4 — *share it*).

### Widget 2 — TermLedger → **share L4's `sumTiles`**

- **Reuse:** none; **adopt L4's `sumTiles`.** Confirmed it cannot reuse `TileSchema` (no power token), so it is correctly a separate variant.
- **Component sketch:** bank of `2¹,2²,2³,…` chips; tap to drop into the ledger; running partial sum; snap to theory on complete; reject wrong/duplicate exponents. Target = `expectedWaitFair(pattern) === buildAutomaton(p,0.5).expectedTimes.E0` (`THH→8`, `HTH→2¹+2³=10`).
- **Per-pattern:** one ledger beat per pattern (or active-pattern chip).
- **Reduced motion / a11y / tap:** instant snap; `aria-live` running sum; tap-only chip placement.
- **Zod (shared with L4):**
  ```ts
  z.object({
    type: z.literal('sumTiles'),
    base: z.number().int().optional(),  // default 2 (fair coin); L4 dice ext uses 6
    pattern: z.string().optional(),     // omitted ⇒ active pattern
  })
  ```
- **Effort: S–M. Risk: low.** Share with L4.

### Widget 3 — side-by-side 4-node mini-graphs → **already built (`OverlapBeat`)**

- **Reuse:** the existing `overlap` interaction → `OverlapBeat` already maps over `patternOptions`, renders one `StateGraph` per pattern with that automaton's `overlapHighlights`, and writes a "resets to … / keeps progress at …" note from each transition's `kind`. `StateGraph` lays out N nodes generically and draws self-loop/reset/advance edges, with `highlight[]` adding a gold glow (`C.mark` shadow). With `patternOptions: ["THH","HTH"]` this *is* the hero visual — **no new component, no new schema variant.**
- **Note:** `OverlapBeat` ignores the authored `interaction.highlight` (it uses each automaton's engine highlights), so the fixture can author `highlight: []` for beat 11; it's required by the schema but unused.
- **Recommendation:** keep beat 11 = `overlap` exactly; **drop** the planned read-only TermLedger sub-strip to avoid a composite beat (the ledger already has its own beat 10).
- **Effort: XS. Risk: none.**

### `transferAttained` — end-to-end derivation

1. **Cap.** Put `maxHintLevel: 2` on each transfer setup beat. `onWrong` caps `level` at 2 and `isRevealed` needs `level ≥ 3`, so the level-3 reveal never shows. ✓ (verified in `hintLadder.ts`).
2. **"Hit the cap" signal.** Reaching level 2 ⟺ `wrongCount ≥ 2` on that beat. **Problem:** `onCorrect` resets `level→0`, and the persisted `hintLevelByBeat` is the *current* level (0 after a pass). **Fix:** track a high-water mark in `LadderState` (e.g. `maxLevel`, bumped in `onWrong`) and persist `maxHintLevelByBeat[beatId]` (the `SnapshotSchema.interactionState` is `.loose()`, so this needs no schema break; add it explicitly for clarity). A cell is "clean" iff `passed && maxHintLevelByBeat[beatId] < 2`.
3. **Per-pattern.** Don't invent `hintLevelByBeatAndPattern`. **Split** the two transfer beats into `failure-edge-thh`, `failure-edge-hth`, `equation-tiles-thh`, `equation-tiles-hth`. Distinct `beatId`s ⇒ the existing beat-keyed `maxHintLevelByBeat` already gives per-(beat,pattern) granularity.
4. **Compute.** In `LessonPlayer.advance()` at completion:
   ```ts
   const TRANSFER = ['failure-edge-thh','failure-edge-hth','equation-tiles-thh','equation-tiles-hth']
   const transferAttained = TRANSFER.every(
     id => completedBeats.includes(id) && (maxHintLevelByBeat[id] ?? 0) < 2,
   )
   ```
5. **Write.** Pass `transferAttained` in `completeLesson({ derived: { …, transferAttained } })`. Extend `CompleteLessonInput.derived`, the CF `DerivedInput`, and `buildDerived` to pass the boolean through into `derived` (`ProgressDerivedSchema.transferAttained` already exists, optional). Trust note: client-asserted, acceptable because it's a **non-gating** badge (`masteryStatus: mastered` regardless). Optional hardening: have the CF read `users/{uid}/snapshots/{lessonId}.interactionState.maxHintLevelByBeat` and recompute server-side.
6. **Recap badge.** `RecapBeat` shows "Fully mastered" when `transferAttained`, else "Completed". In-session it can compute from the same value; the course-path node reads `progress.derived.transferAttained`.

### `equationDiagnosis` generalization (the key prerequisite)

- **What already works:** `diagnoseRow(rawSlots, target)` is target-generic — slot template, per-slot green/red, `correctFill`, `aggregateProgress` all derive from `target.terms`/`target.constant`. THH/HTH 4-row grading lights up correctly with **no change**.
- **What's HH-hardcoded (must change):**
  1. `classifyStateMistake` only handles the `{E0,E2}` multiset; all other targets → `wrong-var-generic`.
  2. `MISTAKE_HINTS` copy names HH ("waiting for HH", "the second head", "one matched head").
  3. `EquationTilesBeat` UI literals: `E0_WORKED_EXPLANATION`, `E0_TERM_TIPS`, `TOKEN_TIPS`, `STATE_LEGEND`, and `renderStaticRow` ("Absorbing state — HH matched") render verbatim for any pattern.
  4. **The trap:** `EquationTilesBeat` builds `dynamicFeedback` by replacing authored `hints[0]`/`hints[1]` with `hintForMistake(mistake,1|2)`; only `hints[2]` (the reveal) stays authored. With `maxHintLevel:2`, the authored `byPattern` hints **never render**. So authoring good THH/HTH hints in the fixture has *no effect* under the current beat.
- **Plan (recommended — generalize, benefits L3/L5/L6):**
  - Rewrite `classifyStateMistake` to be **transition-kind-driven**: compare each chosen `var` to the target `var` using the active automaton's transition `kind` (`advance`/`self-loop`/`reset`/`goal`), yielding mistakes like `chose-reset-want-self-loop`, `chose-self-loop-want-reset`, `chose-advance-want-reset`, etc. The beat already receives the per-pattern `automaton` via props.
  - Replace `MISTAKE_HINTS` with pattern-neutral copy ("on this near-miss, does the matched prefix survive, or do you fall back?") parameterized by the automaton; no literal pattern strings.
  - Parameterize the UI literals from `pattern` + `automaton` (worked-row explanation, legend, absorbing-row note).
- **Plan (pragmatic MVP fallback):** in `EquationTilesBeat`, only apply the `hintForMistake` override when the target is the HH `{E0,E2}` shape; otherwise use the authored `byPattern` hints (`base`). Keeps generic `diagnoseRow` green/red, makes L6 fair via authored copy, defers the full rewrite. Lower effort; smaller blast radius.
- **Effort: M–L. Risk: HIGH — the single biggest L6 code dependency.**

### Two-pattern grading (the other prerequisite the plan assumes)

- Add optional `pattern?: string` to `BeatSchema`; in `LessonPlayer`, `const beatPattern = beat.pattern ?? lesson.patternOptions[0]` and `buildAutomaton(beatPattern, 0.5)` per beat. Beats stay unchanged; they just receive the right `automaton`.
- Split the graded compare beats per pattern (see transfer section). `simulate`/`guided-solve`/`overlap-ruler`/`border-sum-ledger` likewise pin a `pattern` per beat.
- `OverlapBeat`/`TheorySimChartBeat` that want *both* patterns keep reading `patternOptions` (as `OverlapBeat` already does).

### Schema & engine changes (consolidated)

- **New interaction variants (shared with L4 — use L4's names):** `autocorrelationRuler` and `sumTiles` (shapes above). **Do not** add `overlapRuler`/`termLedger`.
- **No change** to the `overlap` variant — `OverlapBeat` already renders the dual graphs.
- **`BeatSchema`:** add optional `pattern?: z.string()`.
- **`SnapshotSchema.interactionState`:** add `maxHintLevelByBeat: z.record(z.string(), z.number()).optional()` (loose object already tolerates it).
- **`ProgressDerived` / CF:** `transferAttained` field already exists; add it to `CompleteLessonInput.derived`, the CF `DerivedInput`, and `buildDerived` passthrough. Per-pattern `finalPrediction`/`theoreticalValue`/`empiricalMean` need either scalar-splitting or loose passthrough (current `finiteNumber` nulls objects).
- **Engine:** **no new automaton** — `buildAutomaton('THH'|'HTH', 0.5)` already yields the full 4-state pipeline. Add `borders()`/`correlation()`/`expectedWaitFair()` in L4's `src/engine/correlation.ts`.
- **Golden tests** (`src/engine/automaton.test.ts` + `correlation.test.ts`):
  ```ts
  expect(buildAutomaton('THH',0.5).expectedTimes.E0).toBe(8)
  expect(buildAutomaton('HTH',0.5).expectedTimes.E0).toBe(10)
  expect(borders('THH')).toEqual([3])
  expect(borders('HTH')).toEqual([1,3])
  expect(expectedWaitFair('THH')).toBe(8)   // === E0
  expect(expectedWaitFair('HTH')).toBe(10)  // === E0
  ```
- **`validate-fixtures.ts`:** currently hard-wired to `buildAutomaton('HH')` + beatId `equation-tiles` + the one flagship file. Generalize to also load `lesson-longer-patterns.json` and cross-check each equation row against the right automaton (THH vs HTH). With per-pattern split beats (`equation-tiles-thh`/`-hth`), map beatId-suffix → pattern; otherwise tag rows with their pattern.

### Risks & open questions (ranked)

1. **`equationDiagnosis` HH-hardcoding (copy + classify + dead authored hints).** Highest risk; makes the transfer badge unfair and shows wrong copy until fixed. *Biggest risk.*
2. **Two-pattern grading infra.** `LessonPlayer` single-automaton + beat-keyed hints. Fix with per-beat `pattern` + split beats; affects beat count/cut-line.
3. **`transferAttained` plumbing.** High-water persistence + CF threading; level resets on pass today.
4. **`validate-fixtures` + per-pattern derived fields** (`finalPrediction:{THH,HTH}` etc. don't fit current scalar shapes).
5. **`coinSim` guided-replay stream** has no schema field; `slider`/`theorySimChart` per-pattern shapes — resolve or cut to single-pattern on beats 7/9.

**Open questions:** (a) Confirm L4 owns the shared `autocorrelationRuler`/`sumTiles` variants and `correlation.ts` (L6 consumes). (b) Accept client-asserted `transferAttained` (recommended, non-gating). (c) After splitting transfer beats per pattern, is the slightly-higher beat count OK, or apply the ruler/ledger cut to compensate?

---

*End of plan — ready for fixture authoring and Phase 24 implementation.*
