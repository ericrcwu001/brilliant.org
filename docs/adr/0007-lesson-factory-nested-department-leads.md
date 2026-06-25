# Lesson-factory departments become persistent nested lead subagents ("living departments"), replacing the flat fan-out

**Status:** Accepted — 2026-06-25. Records the design resolved during a grill-me planning session;
the `lesson-factory` skill docs (`SKILL.md`, `departments.md`, `pipeline.md`, and light updates to
`qa-rubric.md`, `artifacts.md`, `interview-packs.md`) follow.

The lesson-factory skill was a **flat fan-out**: a single "thin dispatcher" main agent spawned every
role as a leaf subagent, with departments existing only as a conceptual grouping in `departments.md`
("Every role is a subagent"). There was no intermediate agent layer between the Manager and the
individual roles, so departments could not make judgment calls, run internal loops, or hold
department-level state.

The redesign makes each department **alive**: a dedicated persistent orchestrating subagent — a
"department lead" — that spawns and manages its own worker subagents, runs the department's internal
flow, and synthesizes one department-level result. The Manager becomes the single root orchestrator
that spawns four leads rather than ~25 individual roles.

Concretely this locks these choices:

1. **Four persistent department leads.** Each of the four units (Dept 1 Curriculum, Dept 2
   Interactive, Dept 3 Coding, Interview Studio) is a persistent, non-readonly
   `claude-opus-4-8-thinking-max-fast` subagent spawned by the Manager and **resumed** across
   stages. Leads make judgment calls, run internal loops, and synthesize one department result.
   Workers remain ephemeral — spawned per task by the lead, returned, done.

2. **Manager stays the single root orchestrator.** The Manager (main agent) is the only agent that
   talks to the user. It spawns the four leads and drives the Dept 1 ↔ Dept 2 refinement loop by
   resuming each lead with the other's updated artifacts until Definition-of-Ready is reached.
   Sibling leads never communicate peer-to-peer.

3. **Coordination via on-disk artifacts.** Leads read and write the shared `concepts/<slug>/`
   artifacts as the source of truth. Manager-mediated handoffs (resume with updated artifact)
   replace any direct lead-to-lead messaging, which also limits persistent-lead context bloat.

4. **Dept 3 stays 3 layers, like the other departments.** `Manager → Dept 3 Lead → worker role
   chain`. The persistent Dept 3 Lead owns the Wave-0 contract freeze, then provisions a git
   worktree per lesson and spawns that lesson's role chain directly (no per-lesson
   sub-orchestrator), processing lessons as a bounded assembly line. Per-lesson worktree isolation
   is retained.

5. **Nesting is hard-required; no flat fallback.** A preflight probe (first step in every run)
   tests nested spawning to the needed depth. If the platform cannot support it, the skill
   **hard-stops** and tells the user. There is no automatic degradation to the old flat model.

6. **Lesson-factory-scoped exception to global model-routing.** The global `model-routing`
   skill/rule (thin orchestrator, flat fan-out) remains unchanged elsewhere. Lesson-factory
   explicitly documents itself as the one exception: its leads are true orchestrating agents, not
   thin dispatchers.

## Considered options

- **Keep the flat fan-out.** Rejected: departments would remain conceptual only, with no ability to
  run internal loops, make judgment calls, or hold department-scoped context — not "alive."
- **Nested-but-thin leads (fan-out only, no judgment).** Rejected: a lead that merely relays tasks
  to workers without running an internal loop or synthesizing a result adds agent depth without
  adding real capability.
- **Main-agent-driven department lifecycle (no new agent layer).** Rejected: placing each
  department's orchestration logic in the Manager conflates roles, defeats true delegation, and
  grows the Manager's context unboundedly.
- **Probe with automatic fallback to flat.** Rejected by the user in favor of a single, unambiguous
  execution model: if nesting is unsupported the skill should tell the user rather than silently
  degrade to a different architecture.

## Consequences

- Richer "living" departments with genuine department-level reasoning, internal loops, and
  per-department context isolation.
- Higher cost and latency: more agents, deeper nesting, persistent lead context accumulating across
  stages.
- Persistent leads risk context bloat; mitigated by treating on-disk `concepts/<slug>/` artifacts
  as the authoritative source of truth and resuming leads with targeted context rather than full
  history.
- Brittleness: if the platform does not support nested subagent spawning to three layers (a lead
  spawning workers), the skill hard-stops — an accepted trade-off for a single clear execution
  model over silent degradation.
- Documentation scope: `SKILL.md`, `departments.md`, and `pipeline.md` are substantially rewritten;
  `qa-rubric.md`, `artifacts.md`, and `interview-packs.md` receive light updates. The global
  `model-routing` rule/skill is explicitly left unchanged.

## Revision (2026-06-25)

The platform supports nested subagent spawning to **3 layers** (`Manager → Lead → worker`) but not
4. The originally-accepted **Dept 3 team-of-teams** (item 4: `Manager → Dept 3 Lead →
best-of-n-runner per lesson → worker role chain`, 4 layers) is therefore not runnable. Dept 3 is
reduced to **3 layers**: the persistent Dept 3 Lead provisions a worktree per lesson and spawns
that lesson's role chain directly (no per-lesson runner), batched as an assembly line. Per-lesson
worktree isolation and the full role chain are retained; the preflight probe is relaxed accordingly
(it now verifies a lead can spawn a worker). All other decisions in this ADR stand.
