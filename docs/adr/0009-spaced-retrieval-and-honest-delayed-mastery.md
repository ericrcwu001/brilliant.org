# Spaced-retrieval architecture & honest, delayed mastery

**Status:** Accepted — 2026-06-27. Records the design resolved during a grill-me planning session for the
learning-science overhaul; the spec set lives under [`docs/learning-science/`](../learning-science/README.md)
(see that README §3–§4 for the authoritative contracts). Built atop the verified-reality correction in that
README §1 (the brainlift's "Ergo already has a spaced-scheduler skeleton" premise is false — the recommender is
dead code and there is no time axis).

Ergo will gain **problem-level spaced retrieval** and redefine "mastery" as a **delayed** event. Concretely:
each graded problem (beat) becomes an SM-2 **review card** stored in a new **Function-owned** subcollection
`users/{uid}/reviews/{lessonId}__{beatId}` (client-read, client-write-denied, mirroring the milestones/streaks
pattern), scheduled by a pure SM-2 module (init ease 2.5, floor 1.3) whose intervals are **anchored to an
optional target interview date**. The Daily Review queue is built client-side by comparing `dueAt` to `now`;
scheduling state is advanced only through Cloud Functions off server-controlled timestamps. **Mastery (gold) is
no longer read off the teaching session** and no longer penalizes hint use: silver is awarded instantly on
completion, and gold mints **asynchronously ≥1 day later** when a delayed retrieval passes — re-retrieving the
same problem (Track A) or solving a held-out transfer problem of the same method (Track B). This one mechanism
unifies "honest mastery" and "transfer-gated medallions."

## Considered options

- **Lesson-level scheduling** (replay whole lessons when due). Rejected: cannot index weakness by method or
  interleave individual problems — the discrimination skill the interview grades is exactly what it can't train.
- **Method-level scheduling** (draw a fresh problem per due method). Rejected for v1: requires a deep
  interchangeable problem bank per method that today's ~48 lessons cannot reliably supply; would recycle a few
  problems and defeat the purpose. Kept as a natural later upgrade once the bank is deep.
- **Fixed expanding intervals** instead of SM-2. Considered; the user chose SM-2 for personalization, accepting
  the added state and the fact that the ease constants are **untuned** until real retention data exists.
- **Delaying the base medallion** to gate it on transfer. Rejected: adds latency to the core motivation loop;
  instead silver stays instant and a delayed gold tier layers on top.

## Consequences

- **Two sources of truth must be kept coherent** (README §8 R2): the frozen `derived.mastered` (drives the
  medallion tier) and the live `maxHintLevelByBeat` snapshot (drives the recommender). Mastery changes touch both.
- Schema is permanent and currently unindexed (`firestore.indexes.json` is empty); review-queue queries need
  pre-created indexes or they throw at runtime.
- The recommender (`src/progress/recommend.ts`) is dead code today; this work ships its **first call site**.
- All aggressive behavior is **two-track** (gentle Track A vs the quant-intensity gate = Track B `OR`
  `learningGoal === 'interview'`).
