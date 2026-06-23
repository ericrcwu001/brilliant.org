# Beat-audit cycle runner

The exact procedure executed on each heartbeat tick. Governed by
`docs/beat-audit-rubric.md` (the approved rubric). Supervised, split-autonomy,
PR-per-cycle, 3-cycle cap.

## Per-tick procedure

1. **Preflight / anti-spin.** If an open, unreviewed `beat-audit/cycle-*` PR
   exists, **pause** — do not start a new cycle (re-arm a longer heartbeat).
   Otherwise `git switch main && git pull` and read `audits/scoreboard.json` for
   the last cycle's scores. Stop if cycle count ≥ 3.

2. **Branch.** `git switch -c beat-audit/cycle-<N>`.

3. **Pass A — pedagogy (subjective).** For each beat in
   `fixtures/lesson-pattern-hitting-times.json`, score P1–P5 (rubric §2A) against
   the beat component + fixture copy + `docs/mvp_prd.md` + `docs/ui_design_system.md`.
   Fan out one read-only subagent per beat for independence, or score inline.

4. **Pass B — functional/a11y (objective).** `npm run e2e` (chromium + mobile +
   reduced-motion) → O1, O3.

5. **Pass C — robustness (objective).** `npx vitest run` (incl. the `*.fuzz.test.ts`
   property tests) → O2. Add new fuzz/edge cases for any newly-touched module.

6. **Score + record.** Append a cycle record to `audits/scoreboard.json`; write
   findings to `audits/backlog.json` (classify each `auto-fix` vs `stage` per
   rubric §4).

7. **Objective auto-fix (≤3).** Implement the top objective findings + a failing
   regression test that turns green. Run the verify gate:
   `npm run validate && npx vitest run && npm run build && npm run lint`. Red ⇒
   revert this cycle's edits.

8. **Subjective stage.** Apply the top staged proposals on the branch, write
   `audits/proposals/cycle-<N>.md`, push, and open ONE PR
   (`gh pr create`) with that file as the body. Objective fixes + subjective
   proposals share the cycle PR, clearly sectioned.

9. **Stop rule (rubric §6).** If met → report and stop. Else **pause for review**
   of the PR (do not auto-start the next cycle).

## Notes

- Authored copy / pedagogy changes are always `stage` (PR), never auto-merged.
- O4 (perf: feedback <100ms, 60fps) is not yet instrumented — wire it before
  claiming O4 in a future cycle.
- Konva canvases (state graph, sim chart) are asserted via their DOM/`aria-live`
  equivalents + visual snapshots, never canvas hit-testing.
