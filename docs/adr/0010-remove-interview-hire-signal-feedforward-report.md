# Remove the interview "hire signal"; the report feeds forward + reports calibration

**Status:** Accepted — 2026-06-27. From the learning-science overhaul grill-me session; implemented by
[`docs/learning-science/spec-23-interview-report-feedforward.md`](../learning-science/spec-23-interview-report-feedforward.md).
**Supersedes the hire-signal parts of [ADR-0008](0008-ai-capstone-interview-realtime-grounded.md)** and its
shared contract in [`docs/capstone-interview/README.md`](../capstone-interview/README.md) (the `HireSignal`
type, the `hireSignal` attempt field, and "best attempt = numeric hireSignal mapping").

The capstone interview report will **drop the Strong-No → Strong-Yes "hire signal" verdict entirely**. The
report becomes (1) the five rubric dimensions rewritten as **feed-forward "next fix" cards** (actionable,
task-level) and (2) a **predicted-vs-measured calibration delta** ("you felt 80% ready; you performed at 60%").
The rationale is the feedback research the brainlift cites (Hattie & Timperley 2007; Kluger & DeNisi 1996): a
person-level verdict is the weakest, most-often-harmful feedback type, and for a quant candidate a reassuring
verdict manufactures the overconfidence the interview is built to detect. "Best attempt" selection switches from
the numeric hire-signal mapping to a defined alternative (e.g. mean rubric score, or best calibration) — the
spec fixes the exact key.

## Considered options

- **Keep the verdict as the headline, add calibration below.** Rejected: the self-level verdict still dominates
  attention; weakest on the learning-science intent.
- **Reframe: keep the verdict as a secondary line.** Rejected by the user in favor of full removal.

## Consequences

- ADR-0008 / `docs/capstone-interview/` shared contracts change: remove `HireSignal` and the `hireSignal`
  attempt field; update the grader's structured-output schema, `InterviewReportView`, the `interview_completed`
  analytics property, and the "best attempt" selector.
- Calibration becomes a first-class interview output, depending on the confidence-capture foundation
  (`spec-02`) and calibration scoring (`spec-12`).
- Track-aware: calibration is foregrounded for the quant-intensity gate; the interview remains optional and
  non-gating (ADR-0008's other decisions stand).
