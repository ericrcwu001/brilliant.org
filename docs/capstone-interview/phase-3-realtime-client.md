# Phase 3 — Realtime Client

> Part of [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md). Shared contracts: [spec index](./README.md).
>
> **Superseded in part by [ADR-0010](../adr/0010-remove-interview-hire-signal-feedforward-report.md) / `docs/learning-science/spec-23-interview-report-feedforward.md` (D11):** the `interview_completed` analytics no longer carries `hireSignal` (it carries `meanScore`, the mean of the five 1..5 rubric dimensions). The `hireSignal` reference below is historical.

**Status:** Planned — not yet built.

---

## Goal

Wire the `/interview/:conceptId` route end-to-end: mint an ephemeral token, connect the browser to OpenAI via WebRTC, assemble a live `Turn[]` transcript from data-channel events, support a typed-answer fallback, enforce an 8-minute countdown, and hand off to `gradeInterview` when the session ends.

---

## Scope

**In (this phase owns):**

- `src/pages/routes.ts` — `interviewPath`, `parseInterviewId`, `ROUTES.devInterview`
- `src/App.tsx` — lazy `InterviewPage`, known-route whitelist, `GuardedRoutes` branch
- `src/pages/InterviewPage.tsx` (new) — all UI states: preflight → live → grading → done / error
- `src/interview/useRealtimeInterview.ts` (new) — WebRTC hook, state machine, transcript assembly, typed fallback, countdown, grade call
- `src/styles/surfaces/interview.css` (new) + `@import` in `src/styles/app.css`
- `src/pages/DevRoutes.tsx` (edit) + `src/pages/DevInterviewPage.tsx` (new) — `/dev/interview` harness with stubbed transport
- `src/interview/stubRealtimeTransport.ts` (new) — canned stub for the harness

**Out (other phases):**

- Ephemeral token server logic and `gradeInterview` Cloud Function — [Phase 1](./phase-1-cloud-functions.md)
- `src/interview/functions.ts` client wrappers (`mintInterviewToken`, `gradeInterview`) — [Phase 1](./phase-1-cloud-functions.md)
- `Orb.tsx` audio-reactive sphere — [Phase 4](./phase-4-orb.md)
- Report display, attempt persistence, CTAs that launch this route — [Phase 5](./phase-5-report-persistence-and-ctas.md)
- `src/analytics/events.ts` event definitions — shared file; Phase 3 fires the events but does not own the definitions
- `firestore.rules` interview blocks — [Phase 6](./phase-6-guardrails-and-tests.md)

---

## Dependencies & what this unblocks

**Depends on:**

- [Phase 0](./phase-0-infrastructure.md): `connect-src https://api.openai.com` in the Content-Security-Policy; `Permissions-Policy: microphone=(self)`
- [Phase 1](./phase-1-cloud-functions.md): `mintInterviewToken` + `gradeInterview` callables and `src/interview/functions.ts` client wrappers; `SESSION_CAP_SECONDS` constant
- [Phase 2A](./phase-2-interview-pack-content.md): `ClientQuestion` type + `src/content/interviewPack.ts` (needed at compile time; used in the `/dev` harness fixture)

**Unblocks:**

- [Phase 4](./phase-4-orb.md): depends on `remoteStream: MediaStream | null` + `isAiSpeaking: boolean` from this hook
- [Phase 5](./phase-5-report-persistence-and-ctas.md): depends on the `/interview/:conceptId` route existing and `report: InterviewReport` from the hook

---

## Detailed design

### 1. `src/pages/routes.ts` (edit)

Mirror the `conceptPath`/`parseConceptId` pair at `src/pages/routes.ts:50-59`:

```ts
/** Returns the path for an interview page: `/interview/:conceptId`. */
export function interviewPath(conceptId: string): string {
  return `/interview/${conceptId}`
}

/** Returns the conceptId for an `/interview/:conceptId` path, else null. */
export function parseInterviewId(pathname: string): string | null {
  const match = pathname.match(/^\/interview\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : null
}
```

Add to the `ROUTES` object (`src/pages/routes.ts:12-23`):

```ts
/** Dev-only interview harness (fixture data, no Firebase/OpenAI). */
devInterview: '/dev/interview',
```

---

### 2. `src/App.tsx` (edit)

**a. Lazy import.** Add after the existing `LessonPage` lazy import at `src/App.tsx:54-56`:

```ts
const InterviewPage = lazy(() =>
  import('./pages/InterviewPage').then(m => ({ default: m.InterviewPage })),
)
```

**b. Known-route whitelist.** Add `parseInterviewId` to the named import at `src/App.tsx:23-27`, then extend the `known` check at `src/App.tsx:110-115`:

```ts
  const known =
    path === ROUTES.landing ||
    path === ROUTES.profile ||
    parseLessonId(path) !== null ||
    parseConceptId(path) !== null ||
    parseInterviewId(path) !== null   // ← new
  return known ? null : ROUTES.landing
```

Without this, `redirectTarget` bounces authed users at `/interview/:id` back to the landing page before `GuardedRoutes` can render the page.

**c. `GuardedRoutes` dispatch branch.** Add after the `conceptId` branch at `src/App.tsx:153-154`:

```tsx
  const interviewConceptId = parseInterviewId(path)
  if (interviewConceptId)
    return <InterviewPage navigate={navigate} conceptId={interviewConceptId} />
```

**d. Optional view transition.** Export `INTERVIEW_OPEN_TRANSITION = 'interview-open'` from `src/app/viewTransition.ts` (mirroring `CONCEPT_OPEN_TRANSITION` at `src/app/viewTransition.ts:23`). Pass `{ viewTransition: INTERVIEW_OPEN_TRANSITION }` in the CTA `navigate` call added in [Phase 5](./phase-5-report-persistence-and-ctas.md).

---

### 3. `src/pages/InterviewPage.tsx` (new)

Uses `useAuth()` from `src/auth/authContext.ts:40-44` (`user.uid`). The `LoadState` union pattern and topbar/skeleton/error shell come from `src/pages/LessonPage.tsx:20-170`. The cancel-guarded async loader pattern comes from `src/pages/CoursePathPage.tsx:64-86`.

**Props:**

```ts
export function InterviewPage({
  navigate,
  conceptId,
  _transport,   // optional; injected by /dev harness for a stub
}: {
  navigate: NavigateFn
  conceptId: string
  _transport?: RealtimeTransport
})
```

**UI state mapping** (rendered based on hook `status`):

| Hook `status` | Rendered UI |
|---|---|
| `idle` | Pre-flight screen: concept name, "Start interview" button, mic-permission note |
| `minting` \| `awaitingMic` \| `connecting` | Connecting skeleton + cancel button |
| `live` | `<Orb remoteStream={…} isAiSpeaking={…} />` + live transcript `aria-live` region + typed-answer input + countdown + stop button |
| `ending` \| `grading` | Grading spinner (topbar remains; no back button) |
| `done` | Navigate to or inline-render the report (Phase 5) |
| `error` | Error screen with contextual message + retry / back buttons |

**Error cases and their treatment:**

| `error.stage` | Scenario | UI |
|---|---|---|
| `mint`, `resource-exhausted` | Daily quota exhausted | Friendly quota message; fire `interview_quota_blocked`; no retry offered |
| `mint`, other | Function error / network | Generic mint error + retry button |
| `awaitingMic` | `getUserMedia` denied | Auto-continue in typed-only mode; show "Mic unavailable — type your answers" persistent banner |
| `connect` | WebRTC / SDP failure | Connection error + retry button |
| `grade` | `gradeInterview` call failed | Grade-error screen with retry-grading option |

**Transcript region** — an `aria-live="polite"` `<ol>` renders each `Turn` with a visible role label (`"Interviewer"` / `"You"`). Partial turns (non-`final`) render in a pending style.

**Typed-answer input** — always rendered in `live` state (even when mic is active), as per the typed fallback spec. Submitting calls `sendTypedAnswer(text)` from the hook.

**Countdown** — display `mm:ss` from `secondsLeft`. At ≤ 60 s add class `interview__countdown--warning`. The hook force-stops at 0; the page does not need to call `stop()` itself on countdown expiry.

**Back button** — navigates to `conceptPath(conceptId)` (`src/pages/routes.ts:51-52`).

Sketch of `live` screen structure:

```tsx
<div className="interview interview--live">
  <header className="interview__topbar">
    <button onClick={() => navigate(conceptPath(conceptId))} aria-label="Back">←</button>
    <span className="interview__countdown interview__countdown--warning">
      {formatMmSs(secondsLeft)}
    </span>
    <button onClick={stop}>End interview</button>
  </header>

  {/* Orb — decorative, audio-reactive (Phase 4) */}
  <div className="interview__orb" aria-hidden="true">
    <Orb remoteStream={remoteStream} isAiSpeaking={isAiSpeaking} />
  </div>

  {/* Accessible transcript */}
  <ol className="interview__transcript" aria-live="polite" aria-label="Interview transcript">
    {transcript.map((turn, i) => (
      <li key={i} data-role={turn.role}>
        <span className="interview__turn-role">
          {turn.role === 'interviewer' ? 'Interviewer' : 'You'}
        </span>
        <span className={turn.final ? '' : 'interview__turn--pending'}>{turn.text}</span>
      </li>
    ))}
  </ol>

  {/* Typed fallback — always available */}
  <form className="interview__typed-input" onSubmit={handleTypedSubmit}>
    <input type="text" placeholder="Type your answer…" aria-label="Type your answer" />
    <button type="submit">Send</button>
  </form>
</div>
```

---

### 4. `src/interview/useRealtimeInterview.ts` (new)

#### State machine

```
idle → minting → awaitingMic → connecting → live → ending → grading → done
                                                                ↘ error (from any stage)
```

`error` is terminal within the hook; the page offers a fresh `start()` call.

#### Returned interface

```ts
interface UseRealtimeInterviewReturn {
  status:         InterviewStatus        // the union above
  transcript:     Turn[]
  isAiSpeaking:   boolean
  remoteStream:   MediaStream | null     // passed to <Orb>
  secondsLeft:    number                 // counts down from SESSION_CAP_SECONDS
  error:          InterviewError | null  // { stage, err }
  report:         InterviewReport | null // populated in status 'done'
  start:          () => void
  stop:           () => void
  sendTypedAnswer: (text: string) => void
}

type InterviewStatus =
  | 'idle' | 'minting' | 'awaitingMic' | 'connecting'
  | 'live' | 'ending' | 'grading' | 'done' | 'error'

interface InterviewError {
  stage: 'mint' | 'awaitingMic' | 'connect' | 'grade'
  code?: string   // e.g. 'resource-exhausted'
  err:  unknown
}
```

#### `start()` sequence

1. Set `status = 'minting'`. Call `mintInterviewToken({ conceptId, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, mode })` — [Phase 1](./phase-1-cloud-functions.md) wrapper (mirrors the `httpsCallable` pattern at `src/progress/functions.ts:60-70`). Fire `interview_started { conceptId, questionId, tier, mode }`.
2. On quota error (`resource-exhausted`) → `status = 'error'`; fire `interview_quota_blocked { conceptId, reason: 'daily' }`. On other mint error → `status = 'error', stage: 'mint'`; fire `interview_error { conceptId, stage: 'mint' }`.
3. Store `mintResult.question` (the `ClientQuestion`) — its `prompt` seeds the first interviewer turn displayed in the transcript.
4. Set `status = 'awaitingMic'`. Call `navigator.mediaDevices.getUserMedia({ audio: true })`. On denial: set `mode = 'text'`; keep `micStream = null`; continue (do not error-out).
5. Set `status = 'connecting'`. Build the peer connection **exactly per [Appendix A §2](./README.md#2-browser-webrtc-connection)**:

```ts
const pc = new RTCPeerConnection()
pcRef.current = pc

// (a) Remote audio track → expose as remoteStream for the Orb
pc.ontrack = (e) => { remoteStreamRef.current = e.streams[0] }

// (b) Mic track (skip if mic was denied)
if (micStream) pc.addTrack(micStream.getTracks()[0])

// (c) Data channel — MUST be named "oai-events"
const dc = pc.createDataChannel('oai-events')
dcRef.current = dc
dc.onmessage = (e) => handleEvent(JSON.parse(e.data as string))

// (d) SDP offer + POST to OpenAI
const offer = await pc.createOffer()
await pc.setLocalDescription(offer)
const sdpRes = await fetch('https://api.openai.com/v1/realtime/calls', {
  method: 'POST',
  body: offer.sdp,
  headers: {
    Authorization: `Bearer ${mintResult.clientSecret}`,
    'Content-Type': 'application/sdp',
  },
})
await pc.setRemoteDescription({ type: 'answer', sdp: await sdpRes.text() })
```

6. On ICE/SDP failure → `status = 'error', stage: 'connect'`; fire `interview_error { conceptId, stage: 'connect' }`.
7. Transition to `live` is triggered by the `session.created` event (see below). Start the countdown interval.

> **Security constraint:** the client does **not** send a `session.update` with instructions. All session config (instructions, VAD, voice, transcription model) is locked server-side at mint time per [Appendix A §1](./README.md#1-ephemeral-token-mint-server-side-uses-standing-openai_api_key). A client `session.update` is only acceptable for non-secret tweaks (e.g. adjusting VAD threshold) that contain no rubric or answer data.
>
> Per [Appendix A §5](./README.md#5-hidden-instruction-leak-risk), the `session.created` event echoes the configured `instructions` back to the browser. The hook must **never** surface `event.session.instructions` in any state field, console log, or prop.

#### Event handler

All event-name strings are authoritative from [Appendix A §3](./README.md#3-session-configuration--events-over-the-oai-events-data-channel):

```ts
function handleEvent(event: { type: string; [key: string]: unknown }) {
  switch (event.type) {

    // Candidate speech transcript
    case 'conversation.item.input_audio_transcription.delta':
      appendToInProgressTurn('candidate', event.delta as string)
      break
    case 'conversation.item.input_audio_transcription.completed':
      finalizeTurn('candidate', event.transcript as string)
      break

    // Interviewer (assistant) speech transcript
    case 'response.output_audio_transcript.delta':
      appendToInProgressTurn('interviewer', event.delta as string)
      break
    case 'response.output_audio_transcript.done':
      finalizeTurn('interviewer', event.transcript as string)
      break

    // AI speaking gate (WebRTC only)
    case 'output_audio_buffer.started':
      isAiSpeakingRef.current = true
      break
    case 'output_audio_buffer.stopped':
      isAiSpeakingRef.current = false
      break

    // Session ready
    case 'session.created':
      // IMPORTANT: do NOT read or propagate event.session.instructions
      if (statusRef.current === 'connecting') {
        setStatus('live')
        logEvent('interview_connected', { conceptId })
        // Seed first interviewer turn from the drawn question
        seedInterviewerTurn(mintResultRef.current!.question.prompt)
        startCountdown()
      }
      break
  }
}
```

`finalizeTurn` pushes `{ role, text, ts: Date.now(), final: true }` into `transcriptRef.current` and triggers a React state update (single `setTranscript([...transcriptRef.current])` — once per completed turn, not per delta).

`isAiSpeakingRef` is kept as a ref (not state) to avoid re-renders on every `output_audio_buffer.started/stopped`; it is synced to a `isAiSpeaking` state via a separate effect or by exposing the ref value via `useSyncExternalStore` if fine-grained re-rendering is needed for the Orb.

#### `sendTypedAnswer(text: string)`

Per [Appendix A §4](./README.md#4-typed-text-input-fallback-when-the-user-types-instead-of-speaks):

```ts
function sendTypedAnswer(text: string) {
  if (!dcRef.current || dcRef.current.readyState !== 'open') return
  dcRef.current.send(JSON.stringify({
    type: 'conversation.item.create',
    item: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] },
  }))
  dcRef.current.send(JSON.stringify({ type: 'response.create' }))
  logEvent('interview_fallback_used', { conceptId })
  // Also push the text into local transcript as a candidate turn (final immediately)
  finalizeTurn('candidate', text)
}
```

#### Countdown

```ts
const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

function startCountdown() {
  secondsLeftRef.current = SESSION_CAP_SECONDS   // 480, from Phase 1 constants
  setSecondsLeft(SESSION_CAP_SECONDS)
  countdownRef.current = setInterval(() => {
    secondsLeftRef.current -= 1
    setSecondsLeft(secondsLeftRef.current)
    if (secondsLeftRef.current <= 0) void stop()
  }, 1_000)
}
```

`SESSION_CAP_SECONDS` is re-exported from `src/interview/constants.ts` (defined alongside the Phase 1 functions file; value `480`). `TOKEN_TTL_SECONDS` is `600`, so there is a 120 s buffer between token expiry and the session cap per [README caps](./README.md#caps--constants).

#### `stop()` and cleanup

```ts
async function stop() {
  if (statusRef.current === 'ending' || statusRef.current === 'grading') return
  setStatus('ending')
  clearInterval(countdownRef.current!)
  dcRef.current?.close()
  micStream?.getTracks().forEach(t => t.stop())
  pcRef.current?.close()

  const finalTranscript = [...transcriptRef.current]
  const durationSec = SESSION_CAP_SECONDS - secondsLeftRef.current

  setStatus('grading')
  try {
    const { report } = await gradeInterview({
      attemptId: mintResultRef.current!.attemptId,
      conceptId,
      transcript: finalTranscript,
      durationSec,
    })
    logEvent('interview_completed', {
      conceptId,
      questionId: mintResultRef.current!.question.id,
      durationSec,
      hireSignal: report.hireSignal,
    })
    reportRef.current = report
    setStatus('done')
  } catch (err) {
    setError({ stage: 'grade', err })
    setStatus('error')
    logEvent('interview_error', { conceptId, stage: 'grade' })
  }
}
```

`useEffect` cleanup (on unmount while live):

```ts
useEffect(() => {
  return () => {
    clearInterval(countdownRef.current!)
    dcRef.current?.close()
    micStreamRef.current?.getTracks().forEach(t => t.stop())
    pcRef.current?.close()
  }
}, [])
```

#### Testability / transport injection

The hook accepts an optional `_transport?: RealtimeTransport` parameter. When provided it replaces the real `RTCPeerConnection` + `fetch` SDP exchange:

```ts
export interface RealtimeTransport {
  connect(
    clientSecret: string,
    micStream: MediaStream | null,
    onEvent: (event: Record<string, unknown>) => void,
  ): Promise<{
    remoteStream: MediaStream | null
    sendRaw: (json: string) => void
    close: () => void
  }>
}
```

Production usage: `_transport` is omitted; the hook uses the real WebRTC path. Dev harness and unit tests: inject `stubRealtimeTransport`.

---

### 5. `src/styles/surfaces/interview.css` (new)

Tokens-only; no magic numbers. Add `@import url('./surfaces/interview.css');` to `src/styles/app.css`.

Orb container styling is detailed in [Phase 4](./phase-4-orb.md) (same file, separate section).

```css
/* src/styles/surfaces/interview.css */

.interview {
  display: flex;
  flex-direction: column;
  min-block-size: 100dvh;
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.interview__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-block-end: 1px solid var(--color-border-subtle);
}

.interview__live {
  flex: 1;
  display: grid;
  grid-template-rows: 1fr auto auto auto;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-4);
  align-items: center;
  max-inline-size: 640px;
  margin-inline: auto;
  inline-size: 100%;
}

.interview__countdown {
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.interview__countdown--warning {
  color: var(--color-error);
  font-weight: var(--font-weight-medium);
}

.interview__transcript {
  list-style: none;
  padding: 0;
  margin: 0;
  max-block-size: 40dvh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.interview__turn-role {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  display: block;
  margin-block-end: var(--space-1);
}

.interview__turn--pending {
  opacity: 0.6;
}

.interview__typed-input {
  display: flex;
  gap: var(--space-2);
}
```

---

### 6. `/dev/interview` harness

**`src/pages/DevRoutes.tsx` (edit).** Add a branch after the existing `devHome` check (`src/pages/DevRoutes.tsx:37`):

```tsx
if (path === ROUTES.devInterview) return <DevInterviewPage />
```

Import `DevInterviewPage` at the top of the file. Add `devInterview` to the `ROUTES` import.

**`src/pages/DevInterviewPage.tsx` (new):**

```tsx
// Dev harness — renders InterviewPage with a stubbed transport.
// No Firebase auth, no OpenAI calls. Navigate to /dev/interview to use.
import { InterviewPage } from './InterviewPage'
import { stubRealtimeTransport } from '../interview/stubRealtimeTransport'

export function DevInterviewPage() {
  return (
    <InterviewPage
      navigate={(to) => { window.history.pushState({}, '', to) }}
      conceptId="course-expected-value"
      _transport={stubRealtimeTransport}
    />
  )
}
```

**`src/interview/stubRealtimeTransport.ts` (new)** implements `RealtimeTransport`:

- Immediately fires a synthetic `session.created` event (triggers `connecting → live`).
- Emits a fixture `ClientQuestion.prompt` as the first interviewer turn via a `response.output_audio_transcript.done` event.
- Then emits canned candidate/interviewer `Turn` events at 800 ms intervals from a short fixture script.
- Returns a `remoteStream` from a silent `AudioContext` oscillator (a real `MediaStream` the Orb can consume).
- `close()` is a no-op.

The stub must never import a full pack JSON; it uses a minimal inline `ClientQuestion` fixture:

```ts
const FIXTURE_QUESTION: ClientQuestion = {
  id:          'ev-q1-stub',
  tier:        'hard',
  fingerprint: 'stub',
  prompt:      'A biased coin has P(H) = 0.6. What is the expected number of flips to get the first head?',
  source:      'stub fixture',
  engineCheck: { module: 'stub', verified: true },
  followUps:   [],
}
```

---

## Data contracts

All types are defined in the [shared contracts section](./README.md#shared-contracts):

- **`Turn[]`** — `{ role: 'interviewer' | 'candidate'; text: string; ts: number; final: boolean }`. Assembled by the hook from data-channel events; the first turn is seeded from `ClientQuestion.prompt`.
- **`MintInterviewTokenOutput`** — `clientSecret`, `expiresAt`, `model`, `attemptId`, `question: ClientQuestion`, `sessionCapSeconds`, `dailyRemainingSeconds`.
- **`ClientQuestion`** — `id`, `tier`, `prompt`, `source`, `engineCheck: { module, verified }`, `followUps`. The `hidden` field and `engineCheck.answer/calls` are stripped server-side; the browser never sees them.

---

## Acceptance criteria & verification

```sh
# 1. TypeScript
./node_modules/.bin/tsc -b

# 2. Lint
./node_modules/.bin/eslint \
  src/pages/routes.ts \
  src/App.tsx \
  src/pages/InterviewPage.tsx \
  src/interview/useRealtimeInterview.ts \
  src/pages/DevRoutes.tsx \
  src/pages/DevInterviewPage.tsx \
  src/interview/stubRealtimeTransport.ts

# 3. Unit — hook state machine + transcript assembly
./node_modules/.bin/vitest run src/interview/useRealtimeInterview.test.ts

# 4. /dev/interview harness (manual / e2e, user-run against local dev server)
#    Navigate to http://localhost:5173/dev/interview
#    Verify: preflight renders → start → stub session.created → live screen →
#    transcript builds from stub events → countdown decrements → typed answer →
#    fallback event fires → stop → grading spinner (stub gradeInterview).
./node_modules/.bin/playwright test --grep "dev/interview"
```

**Specific checks:**

- [ ] `/interview/course-expected-value` is reachable when authed (not redirected to landing); TypeScript confirms `parseInterviewId` is in the `known` guard
- [ ] `GuardedRoutes` renders `InterviewPage` for `/interview/:id`; does not fall through to `<BootScreen />`
- [ ] Mic-denied path: `mode` switches to `text`; the typed-answer input is functional; `interview_fallback_used` fires when a typed answer is submitted
- [ ] `Turn[]` assembles correctly from raw data-channel events — unit test with a mock `dc.onmessage` sequence
- [ ] Countdown starts at `SESSION_CAP_SECONDS` (480), decrements once per second, and calls `stop()` at 0; `status` transitions to `grading`
- [ ] `interview_quota_blocked` fires on `resource-exhausted` mint error; no retry button is rendered
- [ ] `/dev/interview` renders fully without any Firebase initialization or `fetch` to OpenAI
- [ ] `session.created.session.instructions` is never referenced outside the `handleEvent` switch; grep confirms no surfacing in state, console, or props

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Token expiry mid-session | `TOKEN_TTL_SECONDS` (600) ≥ `SESSION_CAP_SECONDS` (480) by 120 s margin. Mint fires immediately before the WebRTC connect. See [README caps](./README.md#caps--constants). |
| Mic denied after token is minted | Auto-switch to `mode: 'text'`; the session still works via the typed fallback — the model still speaks and responds. |
| Instruction leak via `session.created` echo | `handleEvent` never reads or propagates `event.session.instructions`. See [Appendix A §5](./README.md#5-hidden-instruction-leak-risk). |
| Tamperable client transcript | Acceptable — the interview gates nothing. The server stores the drawn question; the grader re-verifies against the hidden rubric. See [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md). |
| `RTCPeerConnection` unavailable (old browser) | Guard with `typeof RTCPeerConnection !== 'undefined'` in `start()`; show an unsupported-browser error on the pre-flight screen. |
| Data-channel message flood | `handleEvent` is synchronous and writes to refs; React state is updated only on finalized turns (not per delta). No per-event re-render. |

---

## Cross-links

- [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md)
- [Spec index & shared contracts](./README.md)
- [Phase 0 — Infrastructure](./phase-0-infrastructure.md)
- [Phase 1 — Cloud Functions](./phase-1-cloud-functions.md)
- [Phase 2 — Interview Pack Content](./phase-2-interview-pack-content.md)
- [Phase 4 — Orb](./phase-4-orb.md) ← sibling
- [Phase 5 — Report, Persistence & CTAs](./phase-5-report-persistence-and-ctas.md)
- [Phase 6 — Guardrails & Tests](./phase-6-guardrails-and-tests.md)
- [Appendix A §1](./README.md#1-ephemeral-token-mint-server-side-uses-standing-openai_api_key) — ephemeral token mint sequence
- [Appendix A §2](./README.md#2-browser-webrtc-connection) — exact WebRTC `RTCPeerConnection` → `oai-events` → `POST /v1/realtime/calls` sequence
- [Appendix A §3](./README.md#3-session-configuration--events-over-the-oai-events-data-channel) — exact event-name strings for transcript + `isAiSpeaking`
- [Appendix A §4](./README.md#4-typed-text-input-fallback-when-the-user-types-instead-of-speaks) — `conversation.item.create` + `response.create` typed fallback
- [Appendix A §5](./README.md#5-hidden-instruction-leak-risk) — `session.created` instruction echo leak risk
