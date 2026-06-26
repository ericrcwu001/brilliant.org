# Phase 4 — Orb

> Part of [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md). Shared contracts: [spec index](./README.md).

**Status:** Planned — not yet built.

---

## Goal

An audio-reactive WebGL sphere that pulses while the AI speaks and settles to a calm resting frame when silent. The Orb reads AI audio amplitude each frame via a Web Audio `AnalyserNode` and drives a GLSL `uAmplitude` uniform. It is purely decorative — the accessible transcript lives in `InterviewPage`'s `aria-live` region.

---

## Scope

**In (this phase owns):**

- `src/interview/Orb.tsx` (new) — the full imperative WebGL + Web Audio component
- `src/styles/surfaces/interview.css` — orb container tokens + `@media (prefers-reduced-motion: reduce)` block (shared file with Phase 3; Phase 4 adds the `.interview__orb` rules)

**Out (other phases):**

- `useRealtimeInterview` hook that produces `remoteStream` + `isAiSpeaking` — [Phase 3](./phase-3-realtime-client.md)
- Mounting `<Orb>` inside `InterviewPage` — [Phase 3](./phase-3-realtime-client.md)
- All transcript and typed-answer UI — [Phase 3](./phase-3-realtime-client.md)

---

## Dependencies & what this unblocks

**Depends on:**

- [Phase 3](./phase-3-realtime-client.md): supplies `remoteStream: MediaStream | null` (from `RTCPeerConnection.ontrack`) and `isAiSpeaking: boolean` (from `output_audio_buffer.started/stopped`) as props
- [Phase 0](./phase-0-infrastructure.md): `Permissions-Policy: microphone=(self)` header; the Orb reads only the _remote_ stream (no mic access required for Phase 4 itself)

**Unblocks:**

- [Phase 5](./phase-5-report-persistence-and-ctas.md): the complete interview experience (Phase 3 + Phase 4) must be stable before CTA integration is finalized

---

## Detailed design

### 1. Tech decision — raw WebGL (zero new dependencies)

**Evidence:** `package.json` lists no WebGL library — no `three`, `ogl`, `regl`, or `gl-matrix`; `konva@10.3.0` (2D canvas only) is the sole graphics dep. [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md) states "hand-written shader or tiny `ogl`, NOT three.js."

**Decision: raw WebGL with a hand-written GLSL fragment shader — no new `npm` dependency.**

The Orb is a single draw call on a full-screen quad. A fragment shader raymarches a smooth sphere and drives displacement + brightness via a `uAmplitude` uniform sampled from an `AnalyserNode` each rAF tick. This is ≈100 lines of GLSL and ≈200 lines of imperative TypeScript — consistent with AGENTS.md's minimum-code principle.

`ogl` remains the named fallback if raw WebGL proves unwieldy during implementation (e.g. if texture or normal-map support is needed for visual polish). It would be a new `package.json` dependency (≈12 KB min+gzip). That decision is **deferred to the implementer**; if adopted, note it in the PR and add the dep explicitly — Phase 0 intentionally left this open.

---

### 2. `src/interview/Orb.tsx` (new)

**First line: `'use no memo'`** — required by the React Compiler config (mirror `src/lesson/konva/StateGraph.tsx:1`). The Orb uses imperative WebGL refs and a rAF loop; the compiler must not instrument it.

#### Props

```ts
interface OrbProps {
  remoteStream:   MediaStream | null   // e.streams[0] from pc.ontrack — see Appendix A §2
  isAiSpeaking:   boolean              // driven by output_audio_buffer.started/stopped — see Appendix A §3
  reducedMotion?: boolean              // caller can pass useReducedMotion() result; Orb also reads it internally
}
```

#### Canvas sizing

Use `useElementWidth<HTMLDivElement>()` (`src/lesson/konva/useElementWidth.ts:5-23`) to measure the container `div`. Size the `<canvas>` to `width × width` (square orb). Apply `devicePixelRatio` — mirror the pattern at `src/lesson/konva/StateGraph.tsx:356-359`:

```ts
const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1
canvas.width  = width * dpr
canvas.height = width * dpr
canvas.style.width  = `${width}px`
canvas.style.height = `${width}px`
```

Resize is handled by a second `useEffect` that watches `width` (from `useElementWidth`) and updates the canvas dimensions + calls `gl.viewport`.

#### WebGL setup (once in `useEffect(setup, [])`)

```ts
const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
if (!gl) {
  // WebGL unavailable: degrade to a CSS-only pulsing circle (see risk table)
  return
}

// Compile vertex + fragment shaders
const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC)
const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC)
// Log getShaderInfoLog on compile error; on failure skip rAF and degrade
const program = linkProgram(gl, vert, frag)

// Uniform locations
const uTimeLoc       = gl.getUniformLocation(program, 'uTime')
const uAmplitudeLoc  = gl.getUniformLocation(program, 'uAmplitude')
const uResolutionLoc = gl.getUniformLocation(program, 'uResolution')

// Full-screen quad: two triangles covering NDC clip space
const quadVerts = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1])
const vbo = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW)
const aPos = gl.getAttribLocation(program, 'aPosition')
gl.enableVertexAttribArray(aPos)
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

gl.useProgram(program)
gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
```

#### Vertex shader

```glsl
// orb.vert — full-screen quad passthrough
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
```

#### Fragment shader sketch

```glsl
// orb.frag
precision mediump float;

uniform float uTime;          // seconds since session start
uniform float uAmplitude;     // 0.0–1.0, audio energy
uniform vec2  uResolution;    // canvas pixel dimensions (after DPR)

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
  float dist = length(uv);

  // Sphere radius expands with amplitude
  float radius   = 0.28 + uAmplitude * 0.07;
  float softness = 0.04;

  // Slow surface ripple driven by time + amplitude
  float ripple  = sin(dist * 18.0 - uTime * 2.5) * 0.5 + 0.5;
  float disp    = uAmplitude * ripple * 0.04;
  float shape   = smoothstep(radius + softness + disp, radius - softness + disp, dist);

  // Soft corona glow — brighter while speaking
  float glow  = exp(-dist * 5.0) * (0.08 + uAmplitude * 0.35);

  // Base color: calm blue-white — can be driven by a CSS custom property
  // via a uniform if the design system needs it later
  vec3 baseColor = vec3(0.55, 0.75, 1.0);
  vec3 color     = baseColor * (shape + glow);
  float alpha    = clamp(shape + glow, 0.0, 1.0);

  gl_FragColor = vec4(color * alpha, alpha);   // premultiplied alpha
}
```

#### rAF loop (imperative, zero per-frame `setState`)

Mirrors the `StateGraph.tsx` pattern: refs + rAF in `useEffect`; NO per-frame React state (`src/lesson/konva/StateGraph.tsx:19-25` — `useEffect`, refs, Konva imperatives, never `setState` in loop):

```ts
let rafId: number
let lastDrawTime = 0
const startTime = performance.now()

function draw(now: number) {
  rafId = requestAnimationFrame(draw)

  // FPS cap: 60 fps while speaking, 30 fps when idle (battery/perf)
  const targetInterval = isAiSpeakingRef.current ? 1000 / 60 : 1000 / 30
  if (now - lastDrawTime < targetInterval) return
  lastDrawTime = now

  // Visibility / idle gate — skip GPU work when tab is hidden AND AI is silent
  if (!ambientActiveRef.current && !isAiSpeakingRef.current) return

  const amplitude = readAmplitude(analyserRef.current)   // AnalyserNode → RMS 0..1
  const t = (now - startTime) / 1000

  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.uniform1f(uTimeLoc, t)
  gl.uniform1f(uAmplitudeLoc, isAiSpeakingRef.current ? amplitude : amplitude * 0.04)
  gl.uniform2f(uResolutionLoc, canvas.width, canvas.height)
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}

rafId = requestAnimationFrame(draw)
```

`isAiSpeakingRef` and `ambientActiveRef` are refs updated by separate `useEffect`s that watch the corresponding props/hooks — they are never read directly from the closure over the `draw` function to avoid stale captures.

#### `readAmplitude`

```ts
function readAmplitude(analyser: AnalyserNode | null): number {
  if (!analyser) return 0
  const buf = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteTimeDomainData(buf)
  // RMS of the time-domain signal, normalised to 0..1
  let sum = 0
  for (let i = 0; i < buf.length; i++) {
    const v = (buf[i] - 128) / 128
    sum += v * v
  }
  return Math.sqrt(sum / buf.length)
}
```

#### Web Audio setup (one `useEffect` per `remoteStream` change)

```ts
useEffect(() => {
  if (!remoteStream) return
  const ctx = new AudioContext()
  audioCtxRef.current = ctx
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 256
  analyserRef.current = analyser
  const src = ctx.createMediaStreamSource(remoteStream)
  src.connect(analyser)
  // Resume covers the autoplay policy: the "Start interview" button gesture
  // in InterviewPage pre-satisfies the user-activation requirement.
  if (ctx.state === 'suspended') void ctx.resume()
  return () => {
    src.disconnect()
    analyser.disconnect()
    analyserRef.current = null
    void ctx.close()
    audioCtxRef.current = null
  }
}, [remoteStream])
```

Per [Appendix A §2](./README.md#2-browser-webrtc-connection): `remoteStream` is `e.streams[0]` from `pc.ontrack`, stored in the hook and passed as a prop.

---

### 3. Reduced motion

Per `useReducedMotion()` (`src/lesson/konva/useElementWidth.ts` — see also `src/lesson/useReducedMotion.ts:6-22`) and the early-return pattern at `src/lesson/konva/StateGraph.tsx:143-145`:

```ts
if (reducedMotion) {
  // Draw exactly one static representative frame: calm resting state
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.uniform1f(uTimeLoc, 0.0)
  gl.uniform1f(uAmplitudeLoc, 0.12)   // soft resting glow
  gl.uniform2f(uResolutionLoc, canvas.width, canvas.height)
  gl.drawArrays(gl.TRIANGLES, 0, 6)
  return   // skip requestAnimationFrame entirely
}
```

This check is at the top of the `useEffect` that starts the rAF loop. If `reducedMotion` changes from `false` to `true` at runtime (user toggles OS setting), the loop's next tick reads the ref and skips the rAF re-schedule.

The `<canvas>` element always carries `aria-hidden="true"` — it is purely decorative. All accessible interview content is in the `aria-live` transcript region in `InterviewPage`.

---

### 4. Animation gating

Compose `useReducedMotion()` (`src/lesson/useReducedMotion.ts:6-22`) with `useAmbient()` (`src/motion/useAmbient.ts:17-82`) to gate on tab visibility + idle state:

```ts
const reducedMotion = useReducedMotion()
const containerRef  = useRef<HTMLDivElement>(null)
const ambientActive = useAmbient(containerRef)   // false: tab hidden OR user idle ≥ 8 s
```

`useAmbient` checks `document.visibilityState`, an `IntersectionObserver`, and idle detection (`src/motion/useAmbient.ts:36-79`). In the rAF loop:

- `reducedMotion === true` → one static frame, no rAF.
- `isAiSpeaking === true` → always draw at 60 fps (even tab backgrounded — keeps audio sync ready).
- `ambientActive === false` AND `isAiSpeaking === false` → skip GPU draw, re-schedule rAF at near-zero cost (one branch + one rAF call per tick).
- Otherwise → draw at 30 fps (idle resting animation).

Both `isAiSpeakingRef` and `ambientActiveRef` are synced via a `useEffect` that watches the corresponding values, so the rAF closure never captures stale booleans.

---

### 5. Lifecycle and cleanup

```ts
useEffect(() => {
  // ... setup GL context, shaders, quad buffers, start rAF ...

  const handleContextLost = (e: Event) => {
    e.preventDefault()   // required to allow restore
    cancelAnimationFrame(rafId)
  }
  const handleContextRestored = () => {
    reInitGL()           // re-compile shaders, recreate buffers
    rafId = requestAnimationFrame(draw)
  }
  canvas.addEventListener('webglcontextlost',     handleContextLost)
  canvas.addEventListener('webglcontextrestored', handleContextRestored)

  return () => {
    cancelAnimationFrame(rafId)
    canvas.removeEventListener('webglcontextlost',     handleContextLost)
    canvas.removeEventListener('webglcontextrestored', handleContextRestored)
    // AudioContext is closed in its own useEffect (remoteStream cleanup above)
  }
}, [])   // setup runs once; GL teardown is in return
```

Full cleanup order on unmount: (1) cancel rAF, (2) remove context-loss listeners, (3) disconnect `AnalyserNode` + close `AudioContext` (Web Audio `useEffect` cleanup). No shared mutable state between the two effects.

---

### 6. CSS — orb container (in `src/styles/surfaces/interview.css`)

Appended to the Phase 3 interview surface stylesheet:

```css
/* Orb container — appended to src/styles/surfaces/interview.css */

.interview__orb {
  display: flex;
  justify-content: center;
  align-items: center;
  block-size: clamp(160px, 40vmin, 320px);
  inline-size: clamp(160px, 40vmin, 320px);
  margin-inline: auto;
}

.interview__orb canvas {
  border-radius: 50%;
  /* Canvas dimensions are set imperatively (width/height attrs + DPR);
     CSS constrains visual overflow only */
  max-inline-size: 100%;
  max-block-size: 100%;
  display: block;
}

@media (prefers-reduced-motion: reduce) {
  .interview__orb canvas {
    /* Static frame is drawn once by JS (uAmplitude = 0.12, uTime = 0);
       no CSS animation to suppress, but confirm no transition on the element */
    transition: none;
  }
}
```

The Orb ships inside the lazy `InterviewPage` chunk (via `React.lazy` at `src/App.tsx`). If the GLSL source string grows large, optionally `React.lazy` the `Orb` component itself within `InterviewPage` with a null fallback — the transcript and typed-input render immediately without waiting for the orb chunk.

---

## Data contracts

The Orb has no Firestore interactions. Its data flow:

```
useRealtimeInterview (Phase 3)
  ├── remoteStream: MediaStream | null
  │     source: RTCPeerConnection.ontrack → e.streams[0]   (README §2)
  └── isAiSpeaking: boolean
        source: output_audio_buffer.started / .stopped     (README §3)
          ↓
Orb.tsx
  ├── AudioContext + AnalyserNode
  │     → readAmplitude() → float 0..1
  └── uAmplitude uniform → GLSL fragment shader → gl.drawArrays
```

See [shared contracts](./README.md#shared-contracts) for `Turn[]` and `MintInterviewTokenOutput` — the Orb does not consume these directly.

---

## Acceptance criteria & verification

```sh
# 1. TypeScript
./node_modules/.bin/tsc -b

# 2. Lint
./node_modules/.bin/eslint src/interview/Orb.tsx

# 3. Smoke test — static frame + aria-hidden (mocks WebGL + AudioContext)
./node_modules/.bin/vitest run src/interview/Orb.test.tsx
```

**Specific checks:**

- [ ] Under `prefers-reduced-motion: reduce`: rAF loop never starts; exactly one `gl.drawArrays` call occurs during mount; `canvas` has `aria-hidden="true"`
- [ ] No per-frame `setState` — zero React re-renders during the rAF loop (verify with React DevTools profiler in the `/dev/interview` harness)
- [ ] `webglcontextlost` is handled without throwing; `webglcontextrestored` restarts the rAF loop
- [ ] `AudioContext` is closed on unmount — no "AudioContext is closed" console error on re-mount in the harness
- [ ] No `three`, `ogl`, or `gl-matrix` import: `./node_modules/.bin/tsc -b` passes; `rg "from 'three'" src/` returns empty
- [ ] Orb renders without errors in the `/dev/interview` harness with `stubRealtimeTransport`'s fake `remoteStream`
- [ ] FPS cap: 60 fps while `isAiSpeaking`, 30 fps at rest (verified via `requestAnimationFrame` call count in test)

**Smoke test sketch:**

```tsx
// src/interview/Orb.test.tsx
import { render } from '@testing-library/react'
import { Orb } from './Orb'

const mockGl = {
  getContext: vi.fn(),
  uniform1f: vi.fn(), uniform2f: vi.fn(),
  drawArrays: vi.fn(), clear: vi.fn(), viewport: vi.fn(),
  // ... minimal stub
}
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockGl)

class MockAudioContext {
  state = 'running'
  createAnalyser() { return { fftSize: 0, frequencyBinCount: 4, getByteTimeDomainData: vi.fn(), connect: vi.fn(), disconnect: vi.fn() } }
  createMediaStreamSource() { return { connect: vi.fn(), disconnect: vi.fn() } }
  close() { return Promise.resolve() }
  resume() { return Promise.resolve() }
}
vi.stubGlobal('AudioContext', MockAudioContext)

it('renders a static frame and is aria-hidden under reduced motion', () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,   // prefers-reduced-motion: reduce
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  const { container } = render(
    <Orb remoteStream={null} isAiSpeaking={false} reducedMotion />
  )
  const canvas = container.querySelector('canvas')
  expect(canvas).toHaveAttribute('aria-hidden', 'true')
  expect(mockGl.drawArrays).toHaveBeenCalledTimes(1)   // exactly one static frame
})
```

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| WebGL context loss (GPU reset, mobile tab backgrounded) | Handle `webglcontextlost` (call `preventDefault`) + `webglcontextrestored` (re-init GL + restart rAF). See §5 above. |
| Battery / perf drain from rAF | Gate draw on `isAiSpeaking \|\| ambientActive`; cap at 30 fps when idle, 60 fps while speaking; single draw call per frame. |
| AudioContext autoplay policy blocks resume | The "Start interview" button gesture in `InterviewPage` satisfies the activation requirement; call `ctx.resume()` defensively after `createMediaStreamSource`. |
| Fragment shader compile error (device variation, WebGL 1 vs 2) | Check `gl.getShaderInfoLog` after compile; on failure clear the canvas and render a CSS-only pulsing circle (`.interview__orb--fallback` class on the container) — the interview still functions. |
| `ogl` dep decision deferred | If the implementer adopts `ogl`, add it to `package.json` deps and note the deviation in the PR description. Phase 0 explicitly deferred this choice here. |
| `remoteStream` arrives after component mounts | The Web Audio `useEffect` has `[remoteStream]` deps; it re-runs when the stream becomes non-null and connects the analyser. No special initialization race. |

---

## Cross-links

- [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md)
- [Spec index & shared contracts](./README.md)
- [Phase 0 — Infrastructure](./phase-0-infrastructure.md)
- [Phase 3 — Realtime Client](./phase-3-realtime-client.md) ← sibling
- [Phase 5 — Report, Persistence & CTAs](./phase-5-report-persistence-and-ctas.md)
- [Phase 6 — Guardrails & Tests](./phase-6-guardrails-and-tests.md)
- [Appendix A §2](./README.md#2-browser-webrtc-connection) — `remoteStream` source: `pc.ontrack → e.streams[0]`
- [Appendix A §3](./README.md#3-session-configuration--events-over-the-oai-events-data-channel) — `output_audio_buffer.started/stopped` → `isAiSpeaking`
