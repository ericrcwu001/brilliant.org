# Phase 5 — Report, Persistence & CTAs

> Part of [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md). Shared contracts: [spec index](./README.md).

**Status:** Planned — not yet built.

---

## Goal

Surface the graded interview report after a session ends, provide a client read-layer for attempt history, lock down all three interview subcollections in Firestore (Function-owned, owner-read-only), and add the two concept-complete entry-point CTAs (lesson-complete done screen + concept page). Wire all eight `interview_*` analytics events.

---

## Scope

| In | Out |
|---|---|
| `firestore.rules` — three interview subcollection blocks | Cloud Functions (`mintInterviewToken`, `gradeInterview`) — P1 |
| `tests/firestore.rules.test.ts` — interview rules describe block | Realtime client hook + `InterviewPage` shell — P3 |
| `src/interview/attempts.ts` (new) — subscribe + selectors | Orb — P4 |
| `src/interview/InterviewReportView.tsx` (new) — report UI | New Firestore indexes (single-collection `interviews` query needs no composite index) |
| `src/lesson/LessonPlayer.tsx` — lesson-complete CTA | Pack authoring (P2B) — not required for the read layer |
| `src/pages/CourseJourney.tsx` — concept-complete CTA (DetailCard) | Any grading logic — server-only, done in P1 |
| `src/analytics/events.ts` — eight `interview_*` methods | |

---

## Dependencies & what this unblocks

- **Depends on P1** — `mintInterviewToken` and `gradeInterview` write all three subcollections; rules and the read layer are inert until P1 ships.
- **Depends on P3** — `InterviewPage` renders `InterviewReportView`; the lesson-complete CTA navigates to `interviewPath(conceptId)` (route added in P3).
- **Depends on P4** — aesthetics only; the report view is usable without the Orb.
- **Unblocks P6** — the rules tests and component smoke tests in P6 validate the work done here.

---

## Detailed design

### 1. `firestore.rules` (edit)

Add three `match` blocks inside `match /users/{uid}` immediately after the existing `streaks` block (`firestore.rules:99-102`), mirroring the milestones/streaks Function-only pattern at `firestore.rules:94-103`:

```firestore
      // Cloud Functions only (Admin SDK bypasses rules).
      match /interviews/{attemptId} {
        allow read: if isOwner(uid);
        allow write: if false;
      }
      match /interviewUsage/{day} {
        allow read: if isOwner(uid);
        allow write: if false;
      }
      match /interviewState/{conceptId} {
        allow read: if isOwner(uid);
        allow write: if false;
      }
```

**Why `allow write: if false`:** all three subcollections are exclusively written by Cloud Functions via the Admin SDK, which bypasses Firestore rules entirely. A client-side write would constitute either a forgery (e.g., inflating `hireSignal`) or a quota bypass (mutating `interviewUsage`). Denying client writes is the same contract as `milestones` and `streaks` (`firestore.rules:94-103`). This is acceptable per ADR-0008 because the interview gates no credential or unlock — a denied write is surfaced as an error to the client, not a silent data loss.

The `isOwner(uid)` helper is defined at `firestore.rules:21-27` and is already in scope.

---

### 2. `tests/firestore.rules.test.ts` (edit)

Add a `describe` block after the existing `milestones / streaks` block (`tests/firestore.rules.test.ts:183-201`). It mirrors that block's structure: `seed()` bypasses rules to simulate a Function-written doc, then asserts owner read succeeds, non-owner read fails, and any client write fails.

The `seed()` helper is defined at `tests/firestore.rules.test.ts:47-51` — reuse it unchanged.

```ts
describe('interviews / interviewUsage / interviewState (Cloud Functions only)', () => {
  it('allows owner reads but denies all client writes', async () => {
    // Simulate Cloud Function writes (Admin SDK bypasses rules).
    await seed('users/alice/interviews/attempt-1', {
      conceptId: 'course-expected-value',
      questionId: 'q-ev-1',
      fingerprint: 'abc123',
      tier: 'hard',
      mode: 'voice',
      status: 'graded',
      startedAt: 'ts',
      createdAt: 'ts',
    })
    await seed('users/alice/interviewUsage/2026-06-26', {
      date: '2026-06-26',
      secondsUsed: 300,
      sessionCount: 1,
      updatedAt: 'ts',
    })
    await seed('users/alice/interviewState/course-expected-value', {
      seenQuestionIds: ['q-ev-1'],
      attemptCount: 1,
      lastAttemptAt: 'ts',
    })

    // Owner can read all three subcollections.
    await assertSucceeds(
      getDoc(doc(alice(), 'users/alice/interviews/attempt-1')),
    )
    await assertSucceeds(
      getDoc(doc(alice(), 'users/alice/interviewUsage/2026-06-26')),
    )
    await assertSucceeds(
      getDoc(doc(alice(), 'users/alice/interviewState/course-expected-value')),
    )

    // Non-owner cannot read.
    await assertFails(
      getDoc(doc(bob(), 'users/alice/interviews/attempt-1')),
    )

    // Client writes are denied for all three (regardless of content).
    await assertFails(
      setDoc(doc(alice(), 'users/alice/interviews/forged'), {
        conceptId: 'course-expected-value',
        status: 'graded',
        hireSignal: 'Strong Yes',
      }),
    )
    await assertFails(
      setDoc(doc(alice(), 'users/alice/interviewUsage/2026-06-26'), {
        secondsUsed: 0,
      }),
    )
    await assertFails(
      setDoc(
        doc(alice(), 'users/alice/interviewState/course-expected-value'),
        { attemptCount: 0 },
      ),
    )
  })
})
```

---

### 3. `src/interview/attempts.ts` (new)

Client read layer — subscribe to the `interviews` subcollection, filter by `conceptId`, validate each doc, and expose pure selectors. Mirrors `subscribeProgressMap` (`src/progress/progress.ts:29-56`) for the onSnapshot/safeParse pattern, and `subscribeEarnedMilestones` (`src/habit/milestones.ts:46-66`) for the lazy `getDb()` + cancel guard.

```ts
import { collection, onSnapshot } from 'firebase/firestore'
import { z } from 'zod'
import { getDb } from '../firebase/app'

// Firestore Timestamps arrive as opaque objects; accept z.unknown() and
// coerce via toMs() below. Matches the Progress schema pattern in schema.ts.
const InterviewAttemptSchema = z.object({
  conceptId:   z.string(),
  questionId:  z.string(),
  fingerprint: z.string(),
  tier:        z.enum(['hard', 'harder', 'brutal']),
  mode:        z.enum(['voice', 'text']),
  status:      z.enum(['pending', 'graded', 'abandoned']),
  startedAt:   z.unknown(),
  durationSec: z.number().optional(),
  hireSignal:  z
    .enum(['Strong No', 'No', 'Lean No', 'Lean Yes', 'Yes', 'Strong Yes'])
    .optional(),
  report:    z.unknown().optional(), // InterviewReport; typed when consumed
  createdAt: z.unknown(),
  gradedAt:  z.unknown().optional(),
})

export type InterviewAttempt = z.infer<typeof InterviewAttemptSchema> & {
  id: string
}

// Realtime collection listener — all attempts for a user filtered to one
// concept. Each doc is validated; unparseable docs are skipped (best-effort,
// mirrors subscribeProgressMap). Denied/offline → keep last-known list.
export function subscribeInterviewAttempts(
  uid: string,
  conceptId: string,
  onChange: (attempts: InterviewAttempt[]) => void,
): () => void {
  let unsub: (() => void) | null = null
  let cancelled = false
  void getDb().then((db) => {
    if (cancelled) return
    unsub = onSnapshot(
      collection(db, 'users', uid, 'interviews'),
      (snap) => {
        const out: InterviewAttempt[] = []
        for (const d of snap.docs) {
          const parsed = InterviewAttemptSchema.safeParse(d.data())
          if (parsed.success && parsed.data.conceptId === conceptId) {
            out.push({ ...parsed.data, id: d.id })
          }
        }
        onChange(out)
      },
      () => {
        // Denied/offline → keep last-known list (display best-effort).
      },
    )
  })
  return () => {
    cancelled = true
    unsub?.()
  }
}

// Numeric rank mirrors README HireSignal ordering (Strong No=0 … Strong Yes=5).
const HIRE_RANK: Record<string, number> = {
  'Strong No': 0,
  'No':        1,
  'Lean No':   2,
  'Lean Yes':  3,
  'Yes':       4,
  'Strong Yes':5,
}

// Most-recent attempt by createdAt (Timestamp or epoch ms in tests).
export function selectLatest(
  attempts: InterviewAttempt[],
): InterviewAttempt | null {
  if (attempts.length === 0) return null
  return attempts.reduce((a, b) =>
    toMs(a.createdAt) >= toMs(b.createdAt) ? a : b,
  )
}

// Best graded attempt by hireSignal rank; null if none are graded.
export function selectBest(
  attempts: InterviewAttempt[],
): InterviewAttempt | null {
  const graded = attempts.filter(
    (a) => a.status === 'graded' && a.hireSignal != null,
  )
  if (graded.length === 0) return null
  return graded.reduce((a, b) =>
    (HIRE_RANK[a.hireSignal!] ?? 0) >= (HIRE_RANK[b.hireSignal!] ?? 0)
      ? a
      : b,
  )
}

function toMs(ts: unknown): number {
  if (ts && typeof ts === 'object' && 'toMillis' in ts) {
    return (ts as { toMillis(): number }).toMillis()
  }
  if (typeof ts === 'number') return ts
  return 0
}
```

**Unit-testability:** `selectLatest` and `selectBest` are pure functions; test them with plain objects (no Firebase import). See P6 unit tests.

---

### 4. `src/interview/InterviewReportView.tsx` (new)

Renders an `InterviewReport` (shape: [README §Report and turn types](./README.md#report-and-turn-types)) as a self-contained section inside `InterviewPage` once `gradeInterview` resolves.

**Layout (token-based, styled in `src/styles/surfaces/interview.css` — P3 created the file):**

1. **Hire-signal badge** — full-width pill with label + color coding:
   - `Strong No` / `No` → `--signal-no` (warm red)
   - `Lean No` → `--signal-lean-no` (amber)
   - `Lean Yes` → `--signal-lean-yes` (muted green)
   - `Yes` / `Strong Yes` → `--signal-yes` (green)

2. **Five dimension cards** in a 2-or-3-column responsive grid (`.iv-dims`): for each of `correctness`, `approach`, `rigor`, `communication`, `speed` — a label, a 1–5 star row (or numeric badge), and the quoted `evidence` string (`<blockquote>`).

3. **Summary** — `report.summary` as a `<p>`.

4. **Strengths / Fixes** — two `<ul>` lists from `report.strengths[]` and `report.fixes[]`.

```tsx
interface InterviewReportViewProps {
  report: InterviewReport
  attemptId: string
  conceptId: string
  onClose?: () => void
}

export function InterviewReportView({
  report,
  attemptId,
  conceptId,
  onClose,
}: InterviewReportViewProps) {
  // Fire analytics once on mount.
  useEffect(() => {
    analytics.interviewReportViewed({ conceptId, attemptId })
  }, [conceptId, attemptId])

  const DIMS = [
    ['correctness',   'Correctness'],
    ['approach',      'Approach'],
    ['rigor',         'Rigor'],
    ['communication', 'Communication'],
    ['speed',         'Speed'],
  ] as const

  return (
    <section className="iv-report" aria-label="Interview report">
      <div className={`iv-signal iv-signal--${signalSlug(report.hireSignal)}`}>
        {report.hireSignal}
      </div>

      <p className="iv-summary">{report.summary}</p>

      <div className="iv-dims">
        {DIMS.map(([key, label]) => {
          const dim = report.dimensions[key]
          return (
            <div key={key} className="iv-dim">
              <div className="iv-dim__label">{label}</div>
              <ScorePips score={dim.score} />
              <blockquote className="iv-dim__evidence">
                {dim.evidence}
              </blockquote>
            </div>
          )
        })}
      </div>

      {report.strengths.length > 0 && (
        <div className="iv-feedback">
          <h3 className="iv-feedback__heading">Strengths</h3>
          <ul>
            {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {report.fixes.length > 0 && (
        <div className="iv-feedback">
          <h3 className="iv-feedback__heading">To improve</h3>
          <ul>
            {report.fixes.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}

      {onClose && (
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          Done
        </button>
      )}
    </section>
  )
}
```

**`signalSlug`** maps `HireSignal` → a CSS slug (`strong-no`, `no`, `lean-no`, `lean-yes`, `yes`, `strong-yes`).

**Best-attempt view:** `InterviewPage` subscribes via `subscribeInterviewAttempts`, computes `selectBest(attempts)`, and renders a second `<InterviewReportView>` below the current one (or a tab/toggle) when a prior best exists and differs from the current attempt.

---

### 5. CTAs

#### 5a. Lesson-complete CTA — `src/lesson/LessonPlayer.tsx`

The done-screen actionbar at `src/lesson/LessonPlayer.tsx:444-455` currently renders a single "Back to course path" button. Add a second primary CTA — "Take the capstone interview" — **only when this was the concept's final lesson** (`completion?.unlockedLessonId === null`, meaning no next lesson was unlocked).

`lesson.courseId` is the `conceptId` (it is the same string — `course.courseId` in the schema at `src/content/schema.ts:416`). Thread it into the `navigate` call.

```tsx
<footer className="actionbar">
  {canExit && (
    <button
      ref={ctaRef}
      type="button"
      className="btn btn--primary"
      onClick={onExit}
    >
      Back to course path
    </button>
  )}
  {canExit && completion?.unlockedLessonId === null && (
    <button
      type="button"
      className="btn btn--primary"
      onClick={() => {
        analytics.interviewCtaClicked({
          conceptId: lesson.courseId,
          surface: 'lesson_complete',
        })
        navigate(interviewPath(lesson.courseId))
      }}
    >
      Take the capstone interview
    </button>
  )}
</footer>
```

- `completion` is already in scope at `src/lesson/LessonPlayer.tsx:111`.
- `interviewPath` is imported from `src/pages/routes.ts` (added in P3).
- The CTA is rendered inside the `done` takeover branch of the player (lines 444–455 context).
- The `/dev` harness (`DevRoutes.tsx`) passes no `uid` and no `gradeInterview` callable; the CTA is still rendered (navigates to `/dev/interview` via `ROUTES.devInterview` if `lesson.courseId` is absent, or the real path otherwise — keep it simple: the harness shows the button, clicking it navigates, auth guard catches it).

#### 5b. Concept-page CTA — `src/pages/CourseJourney.tsx`

The `DetailCard` component at `src/pages/CourseJourney.tsx:514-528` renders the active lesson's detail panel with a CTA button at lines 624-649. Add a second button — "Take capstone interview" — below the existing lesson CTA, shown **only when the concept's completion milestone is earned**.

Thread two new props into `CourseJourney` → `DetailCard`:

```tsx
// CourseJourney.tsx — extend existing props
interface CourseJourneyProps {
  // ... existing props ...
  earned?: Set<string>              // from StudyDesk → CoursePathPage
  completionMilestoneId?: string    // from course.completionMilestoneId (schema.ts:422)
  onInterviewCta?: (conceptId: string) => void
}
```

Inside `DetailCard`, after the existing `ergo-detail__cta` button:

```tsx
{completionEarned && (
  <button
    type="button"
    className="ergo-detail__cta ergo-detail__cta--interview"
    style={{ background: chColor }}
    onClick={() => {
      analytics.interviewCtaClicked({
        conceptId: course.courseId,
        surface: 'concept_page',
      })
      onInterviewCta?.(course.courseId)
    }}
    aria-label={`Take the capstone interview for ${node.title}`}
  >
    {hasPriorAttempt ? 'Retake or view interview' : 'Take capstone interview'}
    {/* same arrow SVG as existing CTA */}
  </button>
)}
```

where `completionEarned = earned?.has(completionMilestoneId ?? '') ?? false` and `hasPriorAttempt` is derived from `attempts` passed from `InterviewPage` (or from a lightweight subscribe in `CoursePathPage`).

In `CoursePathPage` (the container for `StudyDesk`):
- Pass `course.completionMilestoneId` and `earned` down to `StudyDesk` → `CourseJourney`.
- Wire `onInterviewCta` to `(conceptId) => navigate(interviewPath(conceptId))`.

**"View interview report" variant:** when `hasPriorAttempt` is true (derived from a `subscribeInterviewAttempts` call in `CoursePathPage`), the CTA label changes to "Retake or view interview". This reuses the same route; `InterviewPage` decides whether to show the report or start fresh based on attempt state.

---

### 6. `src/analytics/events.ts` (edit)

The `track()` function at `src/analytics/events.ts:50-66` and the `analytics` export at lines `70-106` are the insertion points. Add eight methods to the `analytics` object, each calling `track()` with the event name and typed payload. Matches the README event table exactly (snake_case, auto-carry `uid` + `client_ts`, no-op in dev/emulator).

```ts
// Append to the `analytics` object at src/analytics/events.ts:70-106:

  interviewCtaClicked: (p: {
    conceptId: string
    surface: 'lesson_complete' | 'concept_page'
  }) => track('interview_cta_clicked', p),

  interviewStarted: (p: {
    conceptId: string
    questionId: string
    tier: 'hard' | 'harder' | 'brutal'
    mode: 'voice' | 'text'
  }) => track('interview_started', p),

  interviewConnected: (p: { conceptId: string }) =>
    track('interview_connected', p),

  interviewFallbackUsed: (p: { conceptId: string }) =>
    track('interview_fallback_used', p),

  interviewCompleted: (p: {
    conceptId: string
    questionId: string
    durationSec: number
    hireSignal: string
  }) => track('interview_completed', p),

  interviewReportViewed: (p: { conceptId: string; attemptId: string }) =>
    track('interview_report_viewed', p),

  interviewQuotaBlocked: (p: {
    conceptId: string
    reason: 'daily' | 'session'
  }) => track('interview_quota_blocked', p),

  interviewError: (p: {
    conceptId: string
    stage: 'mint' | 'connect' | 'grade'
  }) => track('interview_error', p),
```

Events fired by P3/P4 (`interview_started`, `interview_connected`, `interview_fallback_used`, `interview_completed`, `interview_quota_blocked`, `interview_error`) and by P5 (`interview_cta_clicked`, `interview_report_viewed`). All eight methods must be added in this phase so P3 can import from `analytics` without forward-referencing.

---

## Data contracts

All shapes are defined in [README §Report and turn types](./README.md#report-and-turn-types) and [README §Firestore layout](./README.md#firestore-layout). **Do not duplicate them here.**

- `InterviewAttempt` — the full Firestore document shape (including `report?: InterviewReport` and `hireSignal?: HireSignal`); the `InterviewAttemptSchema` in `attempts.ts` is the runtime validator.
- `InterviewReport` / `HireSignal` / `Dim` — used directly by `InterviewReportView`.
- `Turn[]` — assembled by `useRealtimeInterview` (P3) and sent to `gradeInterview` (P1); this phase only reads it back from the `transcript?` field on a graded attempt.

---

## Acceptance criteria & verification

1. **Rules tests** — add the three `match` blocks to `firestore.rules`, then run:
   ```
   npm run test:rules
   ```
   The new `describe('interviews / interviewUsage / interviewState ...')` block must pass all assertions. (Requires Java + Firebase emulator — user-run.)

2. **`attempts.ts` selectors** — pure unit tests (no Firebase):
   ```
   ./node_modules/.bin/vitest run src/interview/attempts.test.ts
   ```
   Verify `selectLatest` returns the most-recent by `createdAt`, `selectBest` returns the max-rank graded attempt, both return `null` on an empty array.

3. **Report renders all dimensions** — `renderToString` smoke in `src/interview/InterviewReportView.test.tsx`:
   - All five dimension keys (`correctness`, `approach`, `rigor`, `communication`, `speed`) appear in the HTML.
   - Hire-signal label appears.
   - `aria-label="Interview report"` is present.

4. **Lesson-complete CTA** — only appears when `completion.unlockedLessonId === null`; navigates to `interviewPath(lesson.courseId)`; fires `interview_cta_clicked {surface:'lesson_complete'}`. Test in e2e (`e2e/interview.spec.ts` — P6) by completing a stub lesson with `unlockedLessonId: null` in the fixture.

5. **Concept-page CTA** — only appears when `earned.has(course.completionMilestoneId)`; navigates correctly. Verified in e2e (P6) or manually via `/dev/home` with a seeded `completionMilestoneId` in earned.

6. **Analytics** — `./node_modules/.bin/tsc -b` and `./node_modules/.bin/eslint .` green on `src/analytics/events.ts`.

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Report read denied or offline after session | `subscribeInterviewAttempts` keeps the last-known list on error (same as `subscribeEarnedMilestones`); `InterviewPage` falls back to the in-memory `report` returned by `gradeInterview` callable before the Firestore listener updates |
| `completion.unlockedLessonId` is `null` for non-final lessons too (e.g., if the Function hasn't run yet) | Gate on `completion.unlockedLessonId === null` AND `completion != null`; a pending completion leaves `completion` as `null` in LessonPlayer state (`src/lesson/LessonPlayer.tsx:111`) |
| Concept-complete detection divergence (two sources of truth) | Use only `earned.has(course.completionMilestoneId)` — the same signal already used in `CoursePathPage` to drive the seal gallery (`src/pages/CoursePathPage.tsx:93-105`); do not invent new gating state |
| Interview `report` field missing on a `graded` attempt (Function bug) | `InterviewReportView` checks `report != null` before rendering; show a fallback "Report unavailable" message if null |
| DetailCard prop threading is invasive | The two new props (`earned`, `completionMilestoneId`) already flow through `StudyDesk` to `CourseJourney`; add them as optional to minimize breakage |

---

## Cross-links

- [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md)
- [Spec index & shared contracts](./README.md)
- [Phase 1 — Cloud Functions](./phase-1-cloud-functions.md) — writes all three subcollections
- [Phase 2 — Interview Pack Content](./phase-2-interview-pack-content.md)
- [Phase 3 — Realtime Client](./phase-3-realtime-client.md) — `InterviewPage`, `interviewPath` route, `useRealtimeInterview`
- [Phase 4 — Orb](./phase-4-orb.md)
- [Phase 6 — Guardrails & Tests](./phase-6-guardrails-and-tests.md) — rules tests + component smokes for this phase
