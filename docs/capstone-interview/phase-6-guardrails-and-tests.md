# Phase 6 — Guardrails & Tests

> Part of [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md). Shared contracts: [spec index](./README.md).

**Status:** Planned — not yet built.

---

## Goal

Harden the cost/abuse guardrails, close any remaining surface gaps, and ship the full test suite: unit tests (vitest, node env), Firestore rules tests, and Playwright e2e against the `/dev/interview` stub harness.

---

## Scope

| In | Out |
|---|---|
| Guardrail hardening checklist (server-side caps, App Check gating, abandoned-session path, per-attempt question tracking) | Any new Cloud Function logic — all caps are already defined in P1; this phase documents and verifies them |
| Unit tests — pack schema, draw, selectors, transcript assembly, quota math, report schema, component smokes | Visual-regression baselines for the Orb (own `playwright.vr.config.ts` suite) |
| Firestore rules tests — interview subcollection block (shared with P5) | Load / stress testing (future; flag for post-launch) |
| e2e — `e2e/interview.spec.ts` against `/dev/interview` stub | Real-cost end-to-end with live OpenAI (manual smoke only; see §Acceptance) |
| `validate:interviews` in pre-commit / CI gate | Pack authoring (P2B) — validation script already defined in P2 |

---

## Dependencies & what this unblocks

- **Depends on P0–P5** — this phase closes the feature; all prior phases must be shippable.
- **Unblocks prod enablement** — the manual cost smoke (§Acceptance §5) and the monitor-then-enforce rollout are the final gates before turning on for users.

---

## Detailed design

### 1. Guardrail hardening (consolidated checklist)

All caps are **enforced server-side** at mint and grade time. The client enforces `SESSION_CAP_SECONDS` as a secondary UX measure (countdown), but the server is the authoritative gate.

| Guardrail | Enforcement point | Value | Notes |
|---|---|---|---|
| `DAILY_QUOTA_SECONDS` | `mintInterviewToken` (P1) — reads `interviewUsage/{day}.secondsUsed`; throws `resource-exhausted` if `≥ 1800` | 1800 s (30 min) | Day key resolved from `timezone` param (IANA); falls back to UTC |
| `SESSION_CAP_SECONDS` | Client countdown (`useRealtimeInterview`, P3) force-stops the session; also bounds `TOKEN_TTL_SECONDS` blast radius | 480 s (8 min) | `TOKEN_TTL_SECONDS` (600 s) must be ≥ session cap |
| `TOKEN_TTL_SECONDS` | `expires_after.seconds` at mint (P1) | 600 s | Limits the blast-radius window: even if a client holds the token without connecting, it expires within 10 min |
| Auth required | `requireUid(request)` in both callables (P1) | — | Unauthenticated calls rejected before any pack load |
| App Check (mint only) | `enforceAppCheck: true` on `mintInterviewToken` **gated per-env** | — | Dev has no reCAPTCHA key; global App Check stays OFF per security-audit F1/F3; only `mintInterviewToken` opts in |
| Per-attempt drawn question | Server writes `questionId` + `fingerprint` to the pending attempt at mint (P1) | — | `gradeInterview` re-loads the drawn question's `hidden` field by `questionId`; the client cannot tamper with which question is graded |

**App Check gating rationale:** enabling App Check globally would break the `/dev` harness and any unauthenticated test path. `mintInterviewToken` is the only endpoint that costs real money per call, so per-function enforcement is the right scope. See the security-audit cross-link below for F1 and F3.

**Abandoned-session path:** if a user starts a session (pending attempt written) but never calls `gradeInterview` (e.g., closes the tab), the attempt remains in `status: 'pending'` and `interviewUsage/{day}.secondsUsed` is **not** incremented (incrementing happens only in the `gradeInterview` transaction at P1). This means an abandoned session does not consume quota. Acceptable: the cost is bounded by `TOKEN_TTL_SECONDS`; the pending attempt is inert and non-gating.

**Monitor-then-enforce rollout:** ship with daily-alert monitoring on `interviewUsage` aggregate before enabling for all users. Do not rely on Firebase quota alerts alone — add a server-side Firestore read in `mintInterviewToken` that can be tightened retroactively without a deploy (the constant is a function-level env var, not hard-coded).

Cross-reference: `docs/security-audit.md` (findings F1, F3).

---

### 2. Unit tests (vitest, node env)

Config: `vitest.config.ts:7-17` — environment `node`, includes `src/**/*.test.{ts,tsx}`, JSX via `esbuild` with `jsxImportSource: react`. Components use `renderToString` (not jsdom). Run:

```
./node_modules/.bin/vitest run
```

#### 2a. `src/content/interviewPack.test.ts` — pack schema

```ts
import { describe, it, expect } from 'vitest'
import { InterviewPackSchema } from './interviewPack'
import evPack from '../../interviews/course-expected-value.json'

describe('InterviewPackSchema', () => {
  it('parses the canonical EV pack without error', () => {
    expect(() => InterviewPackSchema.parse(evPack)).not.toThrow()
  })

  it('rejects a pack missing required fields', () => {
    const { version: _, ...bad } = evPack
    expect(InterviewPackSchema.safeParse(bad).success).toBe(false)
  })
})
```

#### 2b. `src/content/interviewDraw.test.ts` — draw logic

```ts
describe('interviewDraw', () => {
  it('never draws a seen question id', () => { /* ... */ })
  it('respects tier floor: returns null when pool exhausted', () => { /* ... */ })
  it('returns distinct ids across multiple draws from the same pool', () => { /* ... */ })
})
```

Covers: no-repeat (seen-set exclusion), tier floor (does not fall below the requested tier), pool exhaustion → `null` return (so the caller knows to reset the seen set). All assertions operate on plain JS arrays (no Firebase).

#### 2c. `src/interview/attempts.test.ts` — selectors

```ts
import { describe, it, expect } from 'vitest'
import { selectLatest, selectBest } from './attempts'
import type { InterviewAttempt } from './attempts'

const make = (overrides: Partial<InterviewAttempt>): InterviewAttempt => ({
  id: 'a1',
  conceptId: 'course-expected-value',
  questionId: 'q-1',
  fingerprint: 'fp',
  tier: 'hard',
  mode: 'voice',
  status: 'graded',
  startedAt: 0,
  createdAt: 1000,
  ...overrides,
})

describe('selectLatest', () => {
  it('returns null on empty array', () => {
    expect(selectLatest([])).toBeNull()
  })
  it('returns the attempt with the highest createdAt', () => {
    const a = make({ id: 'a', createdAt: 1000 })
    const b = make({ id: 'b', createdAt: 2000 })
    expect(selectLatest([a, b])?.id).toBe('b')
  })
})

describe('selectBest', () => {
  it('returns null when no graded attempts', () => {
    expect(selectBest([make({ status: 'pending', hireSignal: undefined })])).toBeNull()
  })
  it('returns the attempt with the highest hireSignal rank', () => {
    const a = make({ id: 'a', hireSignal: 'No' })
    const b = make({ id: 'b', hireSignal: 'Yes' })
    expect(selectBest([a, b])?.id).toBe('b')
  })
  it('Strong Yes beats Yes', () => {
    const a = make({ id: 'a', hireSignal: 'Yes' })
    const b = make({ id: 'b', hireSignal: 'Strong Yes' })
    expect(selectBest([a, b])?.id).toBe('b')
  })
})
```

#### 2d. `src/interview/transcript.test.ts` — transcript assembly helper

The helper (a pure function, defined in `src/interview/transcript.ts` or inline in `useRealtimeInterview`) converts raw Realtime API events into `Turn[]` (README shape). Test with synthetic event objects — no WebRTC import needed.

```ts
describe('buildTranscript', () => {
  it('maps completed interviewer transcript events to role=interviewer turns', () => { /* ... */ })
  it('maps completed candidate transcript events to role=candidate turns', () => { /* ... */ })
  it('sets final=true only on completed (not delta) events', () => { /* ... */ })
  it('orders turns by ts ascending', () => { /* ... */ })
})
```

#### 2e. `src/interview/quota.test.ts` — quota / day-key math

```ts
describe('dayKeyFromTimezone', () => {
  it('returns YYYY-MM-DD in the given IANA timezone', () => { /* ... */ })
  it('falls back to UTC on unknown timezone', () => { /* ... */ })
})

describe('quota math', () => {
  it('remainingSeconds = DAILY_QUOTA_SECONDS - secondsUsed (clamped to 0)', () => {
    expect(remainingSeconds(1800)).toBe(0)
    expect(remainingSeconds(300)).toBe(1500)
  })
})
```

#### 2f. `src/interview/InterviewReportView.test.tsx` — `renderToString` smoke

Mirrors the pattern in `src/lesson/beats/ExpectationScaleBeat.test.tsx` (node env, `renderToString`, no jsdom). Mock `firebase/firestore`, `firebase/analytics`, and `../firebase/app` to avoid network calls.

```tsx
import { renderToString } from 'react-dom/server'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../firebase/app', () => ({ getDb: vi.fn(), auth: { currentUser: null }, usingEmulators: true, app: {} }))
vi.mock('firebase/analytics', () => ({ isSupported: vi.fn(() => Promise.resolve(false)), getAnalytics: vi.fn(), logEvent: vi.fn() }))

describe('InterviewReportView (smoke — renderToString)', () => {
  it('renders all five dimension keys', () => {
    const html = renderToString(<InterviewReportView report={fixtureReport} attemptId="a1" conceptId="course-ev" />)
    for (const label of ['Correctness', 'Approach', 'Rigor', 'Communication', 'Speed']) {
      expect(html).toContain(label)
    }
  })
  it('renders the hire signal label', () => {
    const html = renderToString(<InterviewReportView report={fixtureReport} attemptId="a1" conceptId="course-ev" />)
    expect(html).toContain('Lean Yes')
  })
  it('has aria-label="Interview report"', () => {
    const html = renderToString(<InterviewReportView report={fixtureReport} attemptId="a1" conceptId="course-ev" />)
    expect(html).toContain('aria-label="Interview report"')
  })
})
```

#### 2g. `src/pages/InterviewPage.test.tsx` + `src/interview/Orb.test.tsx` — `renderToString` smokes

Mock the realtime/WebGL/AudioContext layer (`vi.mock('../interview/useRealtimeInterview', ...)`, `vi.mock('../interview/Orb', ...)`):

- **InterviewPage smoke:** assert the page renders without throwing; assert `aria-live="polite"` transcript region is present; assert `aria-hidden="true"` on the Orb container.
- **Orb smoke:** the reduced-motion static frame renders a non-animated `<canvas>` or `<svg>` placeholder — assert the container is present and `aria-hidden`.

These smokes guard against import-time crashes in the realtime/WebGL modules. They are not interaction tests.

---

### 3. Rules tests

The interview subcollection describe block is defined in [Phase 5 §2](./phase-5-report-persistence-and-ctas.md#2-testsfirestore-rulestestts-edit). It is part of `tests/firestore.rules.test.ts` and runs in the same `npm run test:rules` invocation.

**Coverage checklist:**
- Owner reads succeed for all three subcollections (`interviews/{id}`, `interviewUsage/{day}`, `interviewState/{conceptId}`)
- Non-owner reads fail
- Client `setDoc` fails on all three (even with valid content shapes)
- `seed()` bypass (`withSecurityRulesDisabled`) is the only write path — same as milestones/streaks pattern at `tests/firestore.rules.test.ts:47-51`

Run (requires Java + Firebase emulator; user-run):
```
npm run test:rules
```

---

### 4. e2e — `e2e/interview.spec.ts`

Playwright against the `/dev/interview` stub harness (added in `DevRoutes.tsx` in P3 — `ROUTES.devInterview = "/dev/interview"`). The stub uses:
- A **fixture pack** (a stripped `ClientQuestion` from the EV pack) in place of `mintInterviewToken`.
- A **stubbed realtime transport** that replays a pre-scripted transcript (no WebRTC, no OpenAI call).
- A **fixture `InterviewReport`** injected directly into `InterviewPage` in place of `gradeInterview`.

This is a functional test of the UI state machine (ready → live → report), not a cost-incurring real session.

Config reference: `playwright.config.ts:24-38` — three projects: `chromium`, `mobile` (Pixel 5), `reduced-motion` (Desktop Chrome + `reducedMotion: 'reduce'`). The webServer command starts Vite on port 4321 (see `playwright.config.ts:40-45`).

Reuse `e2e/helpers.ts` helpers (`clickPrimary`, `primaryOf`) where the CTA selectors overlap. The interview spec uses `.actionbar .btn--primary` and `.iv-report` selectors.

```ts
// e2e/interview.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Interview flow (/dev/interview stub)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/interview')
  })

  test('ready state: shows question prompt and Start button', async ({ page }) => {
    await expect(page.locator('.iv-ready')).toBeVisible()
    await expect(page.getByRole('button', { name: /Start interview/ })).toBeEnabled()
  })

  test('live state: transcript aria-live region is present', async ({ page }) => {
    await page.getByRole('button', { name: /Start interview/ }).click()
    await expect(page.locator('[aria-live="polite"]')).toBeVisible()
  })

  test('report state: all five dimensions and hire signal render', async ({ page }) => {
    // The stub auto-advances to the report state; or click an "End session" control.
    await page.getByRole('button', { name: /Start interview/ }).click()
    // Stub transport fires gradeInterview immediately with a fixture report.
    await expect(page.locator('.iv-report')).toBeVisible({ timeout: 5000 })
    for (const label of ['Correctness', 'Approach', 'Rigor', 'Communication', 'Speed']) {
      await expect(page.locator('.iv-report')).toContainText(label)
    }
    await expect(page.locator('.iv-signal')).toBeVisible()
  })

  test('typed fallback: text input sends a turn', async ({ page }) => {
    await page.getByRole('button', { name: /Start interview/ }).click()
    const input = page.locator('.iv-typed-input')
    await input.fill('My answer is 42.')
    await page.getByRole('button', { name: /Send/ }).click()
    await expect(page.locator('[aria-live="polite"]')).toContainText('My answer is 42.')
  })

  test('countdown UI is visible during live state', async ({ page }) => {
    await page.getByRole('button', { name: /Start interview/ }).click()
    await expect(page.locator('.iv-countdown')).toBeVisible()
  })
})

test.describe('reduced-motion project', () => {
  test('Orb container is aria-hidden and renders a static frame', async ({ page }) => {
    await page.goto('/dev/interview')
    await page.getByRole('button', { name: /Start interview/ }).click()
    const orb = page.locator('.iv-orb')
    await expect(orb).toHaveAttribute('aria-hidden', 'true')
    // Static frame: no animation class (canvas or svg placeholder visible)
    await expect(orb).toBeVisible()
  })
})
```

**Warm Vite first** before running e2e (see HANDOFF note):
```
npm run dev -- --port 4321 --strictPort &
# wait for "ready" then:
./node_modules/.bin/playwright test e2e/interview.spec.ts
```

---

### 5. Validation gate

`validate:interviews` (defined in P2) must pass in both the pre-commit hook and CI alongside `validate` (content fixtures). Verify:

```
./node_modules/.bin/tsx scripts/validate-interview-packs.ts
```

The gate checks:
- All `interviews/course-*.json` files parse against `InterviewPackSchema`
- Every question's `engineCheck.verified === true`
- `counts.total` matches `questions.length`
- `counts.byTier` matches the actual tier distribution

If the PHT pack (P2B) is not yet authored, the script passes on the EV pack alone (`passWithNoTests` semantics — only validates what exists).

---

## Acceptance criteria & verification

1. **`vitest run` green:**
   ```
   ./node_modules/.bin/vitest run
   ```
   All unit tests (pack schema, draw, selectors, transcript, quota, `renderToString` smokes) pass.

2. **TypeScript + ESLint clean:**
   ```
   ./node_modules/.bin/tsc -b && ./node_modules/.bin/eslint .
   ```
   No errors introduced by this phase.

3. **Pack validation green:**
   ```
   ./node_modules/.bin/tsx scripts/validate-interview-packs.ts
   ```

4. **Rules tests green** (user-run — requires Java):
   ```
   npm run test:rules
   ```
   The `interviews / interviewUsage / interviewState` describe block passes all assertions.

5. **e2e green** (user-run — warm Vite on port 4321 first):
   ```
   ./node_modules/.bin/playwright test e2e/interview.spec.ts
   ```
   All three projects (chromium, mobile, reduced-motion) pass.

6. **Manual cost smoke** (before prod enablement — NOT automated):
   - Point `VITE_FIREBASE_PROJECT` at the dev Firebase project.
   - Start a real interview session (live OpenAI Realtime), speak for ~2 min, end session.
   - Verify: `interviewUsage/{day}.secondsUsed` increments correctly; `interviews/{attemptId}.status` transitions `pending → graded`; the report renders in the UI; the daily quota blocks a subsequent call that would exceed 1800 s.
   - Check Firebase billing dashboard: session cost should be ≤ ~$0.20 for a 2-min session (`gpt-realtime` at ~$0.10/min).

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Realtime transport is hard to drive end-to-end in Playwright | Use a **stubbed transport** in `/dev/interview` — the stub replays a pre-scripted transcript and calls a fixture `gradeInterview` immediately; no OpenAI call, no cost |
| Real-session testing costs money | The stub harness covers all UI state transitions; the manual cost smoke (§5) is the only live-call test, and it is explicitly capped |
| Orb visual regression baselines are unstable under WebGL | Use the `reduced-motion` Playwright project as the stable baseline — the Orb renders a static, deterministic frame; use the full `playwright.vr.config.ts` (separate suite, not in scope here) for pixel-level Orb baselines if ever added |
| `validate:interviews` fails on a malformed PHT pack draft | Script uses `safeParse` + collects errors; failing packs are logged, not thrown, so the EV pack still validates. P2B is the long pole; CI gate on EV pack only until PHT is complete |
| App Check misconfiguration in prod blocks all mints | Test App Check enforcement in staging before prod; keep `enforceAppCheck` behind a feature flag initially if needed |
| Abandoned pending attempts accumulate in Firestore | Acceptable — they're small (< 1 KB) and non-gating; add a TTL policy (Firestore TTL field on `startedAt` + 24 h) in a follow-up if volume is a concern |

---

## Cross-links

- [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md)
- [Spec index & shared contracts](./README.md)
- [Phase 1 — Cloud Functions](./phase-1-cloud-functions.md) — server-side caps implementation
- [Phase 2 — Interview Pack Content](./phase-2-interview-pack-content.md) — `validate:interviews` script
- [Phase 3 — Realtime Client](./phase-3-realtime-client.md) — `InterviewPage`, stub harness, typed fallback
- [Phase 4 — Orb](./phase-4-orb.md) — reduced-motion static frame
- [Phase 5 — Report, Persistence & CTAs](./phase-5-report-persistence-and-ctas.md) — rules tests, `InterviewReportView` smoke
- `docs/security-audit.md` — findings F1 (global App Check off), F3 (dev reCAPTCHA absent)
