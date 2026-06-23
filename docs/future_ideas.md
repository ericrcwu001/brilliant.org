# Future Ideas

A running list of features deliberately deferred past the MVP, with enough context to pick them up later.

## Mastery: Performance-Threshold Signal (deferred from MVP)

**Status:** Not in MVP. MVP uses `completion = mastery` (finish all beats once → node mastered → next unlocks).

**The idea:** Replace pure completion with a performance-based mastery signal derived from interactions the learner *already* does in each lesson — no extra quiz UI required.

**Signals to track per lesson:**
- Transition tiles correct on first try (the core state-thinking skill).
- Prediction within tolerance (the slider/number gate before the solve).
- Overlap / concept question correct on first attempt.
- Whether the learner triggered a full-answer reveal or used many hints.

**Proposed rule:** Mastered if ≥ ~80% first-try correctness with no full-answer reveals. Otherwise the node is marked **"completed, needs review."**

**Path behavior it enables:**
- Next-step recommender points the learner back to a weak node before advancing.
- Honest "got it wrong repeatedly → resurface review" behavior (matches the MVP testing scenario more rigorously).

**Why deferred:** `completion = mastery` is enough to demonstrate a working path for the Phase 1 gate. Performance-threshold mastery is a clean upgrade once the core loop is solid.

**Natural next step (Phase 3):** Promote to a **separate retrieval check** — a short 2–3 question check on a *fresh* pattern that decides mastery. This becomes the hook for spaced repetition and retrieval-practice learning-science features.
