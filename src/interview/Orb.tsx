'use no memo'

// Audio-reactive WebGL sphere for the capstone interview (Phase 4). Pulses
// while the AI speaks; settles to a calm resting frame when silent. Uses a raw
// WebGL fragment shader with a full-screen quad — no new npm dependencies.
//
// INVARIANTS:
// - First line is 'use no memo' to skip the React Compiler (imperative rAF loop).
// - No per-frame React setState — all animation state lives in refs.
// - The <canvas> carries aria-hidden="true" — decorative only.

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lesson/useReducedMotion'
import { useAmbient } from '../motion/useAmbient'

// ── GLSL shaders ─────────────────────────────────────────────────────────────

const VERT_SRC = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAG_SRC = `
precision mediump float;

uniform float uTime;
uniform float uAmplitude;
uniform vec2  uResolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
  float dist = length(uv);

  float radius   = 0.28 + uAmplitude * 0.07;
  float softness = 0.04;

  float ripple = sin(dist * 18.0 - uTime * 2.5) * 0.5 + 0.5;
  float disp   = uAmplitude * ripple * 0.04;
  float shape  = smoothstep(radius + softness + disp, radius - softness + disp, dist);

  float glow  = exp(-dist * 5.0) * (0.08 + uAmplitude * 0.35);

  vec3 baseColor = vec3(0.55, 0.75, 1.0);
  vec3 color     = baseColor * (shape + glow);
  float alpha    = clamp(shape + glow, 0.0, 1.0);

  gl_FragColor = vec4(color * alpha, alpha);
}
`

// ── Props ─────────────────────────────────────────────────────────────────────

interface OrbProps {
  remoteStream:   MediaStream | null
  isAiSpeaking:   boolean
  reducedMotion?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function compileShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[Orb] shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function linkProgram(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  vert: WebGLShader,
  frag: WebGLShader,
): WebGLProgram | null {
  const prog = gl.createProgram()
  if (!prog) return null
  gl.attachShader(prog, vert)
  gl.attachShader(prog, frag)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('[Orb] program link error:', gl.getProgramInfoLog(prog))
    gl.deleteProgram(prog)
    return null
  }
  return prog
}

function readAmplitude(analyser: AnalyserNode | null): number {
  if (!analyser) return 0
  const buf = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteTimeDomainData(buf)
  let sum = 0
  for (let i = 0; i < buf.length; i++) {
    const v = (buf[i] - 128) / 128
    sum += v * v
  }
  return Math.sqrt(sum / buf.length)
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Orb({ remoteStream, isAiSpeaking, reducedMotion: reducedMotionProp }: OrbProps) {
  const containerRef              = useRef<HTMLDivElement>(null)
  const canvasRef                 = useRef<HTMLCanvasElement>(null)
  const reducedMotionInternal     = useReducedMotion()
  const reducedMotion             = reducedMotionProp ?? reducedMotionInternal
  const ambientActive             = useAmbient(containerRef)

  // Measure container width via ResizeObserver (avoids ref-merging with useElementWidth).
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Refs for the rAF loop (never setState in the loop).
  const glRef                     = useRef<WebGLRenderingContext | WebGL2RenderingContext | null>(null)
  const programRef                = useRef<WebGLProgram | null>(null)
  const uTimeLoc                  = useRef<WebGLUniformLocation | null>(null)
  const uAmplitudeLoc             = useRef<WebGLUniformLocation | null>(null)
  const uResolutionLoc            = useRef<WebGLUniformLocation | null>(null)
  const rafRef                    = useRef<number>(0)
  const isAiSpeakingRef           = useRef(isAiSpeaking)
  const ambientActiveRef          = useRef(ambientActive)
  const analyserRef               = useRef<AnalyserNode | null>(null)
  const audioCtxRef               = useRef<AudioContext | null>(null)

  // Sync props/hook values into refs (read by the rAF loop).
  useEffect(() => { isAiSpeakingRef.current = isAiSpeaking }, [isAiSpeaking])
  useEffect(() => { ambientActiveRef.current = ambientActive }, [ambientActive])

  // ── Web Audio setup ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!remoteStream) return
    let ctx: AudioContext
    try {
      ctx = new AudioContext()
    } catch {
      return
    }
    audioCtxRef.current = ctx
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyserRef.current = analyser
    const src = ctx.createMediaStreamSource(remoteStream)
    src.connect(analyser)
    if (ctx.state === 'suspended') void ctx.resume()
    return () => {
      src.disconnect()
      analyser.disconnect()
      analyserRef.current = null
      void ctx.close()
      audioCtxRef.current = null
    }
  }, [remoteStream])

  // ── Canvas resize ────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = glRef.current
    if (!canvas || width === 0) return
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1
    canvas.width  = width * dpr
    canvas.height = width * dpr
    canvas.style.width  = `${width}px`
    canvas.style.height = `${width}px`
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height)
  }, [width])

  // ── WebGL setup + rAF loop ───────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
      (canvas.getContext('webgl') as WebGLRenderingContext | null)

    if (!gl) {
      // WebGL unavailable: skip rAF.
      return
    }
    glRef.current = gl

    function initGL() {
      if (!gl) return false
      const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC)
      const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC)
      if (!vert || !frag) return false
      const program = linkProgram(gl, vert, frag)
      if (!program) return false
      programRef.current = program

      uTimeLoc.current      = gl.getUniformLocation(program, 'uTime')
      uAmplitudeLoc.current = gl.getUniformLocation(program, 'uAmplitude')
      uResolutionLoc.current = gl.getUniformLocation(program, 'uResolution')

      const quadVerts = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
      const vbo = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
      gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW)
      const aPos = gl.getAttribLocation(program, 'aPosition')
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

      gl.useProgram(program)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      return true
    }

    if (!initGL()) return

    function drawFrame(amplitude: number, t: number) {
      if (!gl || !programRef.current) return
      gl.viewport(0, 0, canvas!.width, canvas!.height)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uTimeLoc.current, t)
      gl.uniform1f(uAmplitudeLoc.current, amplitude)
      gl.uniform2f(uResolutionLoc.current, canvas!.width, canvas!.height)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    // Reduced motion: draw one static frame, skip rAF.
    if (reducedMotion) {
      drawFrame(0.12, 0.0)
      return
    }

    const startTime = performance.now()
    let lastDrawTime = 0

    function draw(now: number) {
      rafRef.current = requestAnimationFrame(draw)

      const speaking = isAiSpeakingRef.current
      const ambient  = ambientActiveRef.current

      const targetInterval = speaking ? 1000 / 60 : 1000 / 30
      if (now - lastDrawTime < targetInterval) return
      lastDrawTime = now

      if (!speaking && !ambient) return

      const amplitude = readAmplitude(analyserRef.current)
      const t = (now - startTime) / 1000

      drawFrame(
        speaking ? amplitude : amplitude * 0.04,
        t,
      )
    }

    rafRef.current = requestAnimationFrame(draw)

    function handleContextLost(e: Event) {
      e.preventDefault()
      cancelAnimationFrame(rafRef.current)
    }

    function handleContextRestored() {
      if (!initGL()) return
      rafRef.current = requestAnimationFrame(draw)
    }

    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
    }
  }, [reducedMotion]) // reducedMotion restarts the loop if user toggles OS setting

  return (
    <div
      ref={containerRef}
      className="iv-orb"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  )
}
