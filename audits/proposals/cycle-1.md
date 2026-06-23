# Beat-audit — Cycle 1 proposals

Supervised loop, split autonomy. **Objective fixes are applied; subjective
proposals below need your call** (merge to accept, or close to reject).

Scope: `/dev/lesson` flagship (Groups A/B, local-only). Full scores in
`audits/scoreboard.json`. Overall the lesson scores well (required-beat
pedagogy mean **4.34/5**); two beats fall below the 4.0 bar.

---

## Objective (applied this cycle — gated green)

- **Harness:** stood up Playwright (3 projects: desktop, mobile tap-only,
  reduced-motion) + a full end-to-end completion spec, plus `*.fuzz.test.ts`
  property tests (8k-iteration `diagnoseRow` fuzz). All green;
  `validate + vitest + build + lint` green.
- **F1 (closed, not-a-bug):** mobile completion initially failed at the
  equation-tiles `Check`. Verified it was a Playwright actionability quirk
  re-scrolling the CSS-sticky action bar — **not** a product defect (the button
  is the top element at the click point when scrolled). Fixed in the test helper;
  reverted a speculative `.actionbar` z-index.

---

## Subjective proposals (need your decision)

### P-1 · `pattern-pick` — passive confirmation screen (S2, pedagogyMean 2.8)

**Why:** Both patterns are pre-selected; the only action is `Continue`, with no
feedback and no decision. P2 (productive struggle) = 2, P4 (interaction fit) = 3.
It restates what `open-bet` and `simulate` already establish, so it spends a beat
without creating learning.

**Options (pick one):**
1. **Cut it** and fold the "HH vs HT, same fair coin" framing into the
   `simulate` beat's intro. Shortest path; removes a low-value tap.
2. **Make it a micro-decision:** tap the pattern you think waits longer (echoes
   `open-bet` but per-pattern), with a one-line "we'll find out" ack.
3. **Make the cards interactive:** tap each card to preview that pattern's
   near-miss edge before continuing.

_Recommendation: Option 1 (cut) unless you want the compare framing on its own
screen, in which case Option 3._

### P-2 · `guided-solve` — low learner agency (S1, pedagogyMean 3.8)

**Why:** Tap-to-advance reveals each substitution step; "Show algebra" reveals
the whole derivation at once. The learner can finish without doing the
substitution. P2 (productive struggle) = 3. Retrieval value is weak next to the
strong `recap`.

**Options (pick one):**
1. **Choose-the-next-step:** before each fold, ask which state to substitute
   next (tap `E2` first), confirming the dependency order.
2. **Predict-the-value:** the learner picks/enters each `resultValue` before it’s
   revealed (turns a reveal into a retrieval).
3. **Leave as-is:** it’s a deliberate low-friction solve before the heavier recap.

_Recommendation: Option 1 (small, high-leverage agency bump)._

---

## Not changing
The other 9 beats meet the bar; `failure-edge` and `recap` are exemplary (5.0).
`overlap` (P2=3) and `refine-prediction` (P3=3) are watch-items but above bar —
revisit only if a later cycle frees budget.
