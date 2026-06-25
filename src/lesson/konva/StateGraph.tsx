'use no memo'

// Konva state graph — the visual hero (docs/ui_design_system.md "State Graph").
// Nodes are matched-prefix circles (∅, H, HH); H edges are heads-gold, T edges
// tails-teal; self-loops arc above, reset edges curve below. The active node
// pulses (~80ms after flip) and a one-shot "energy packet" travels the active
// edge (~120ms→FLIP_BEAT). Reused by the coin-sim, overlap, and bias-sandbox
// beats.
//
// This file mounts a Konva <Stage>, so it opts out of the React Compiler via
// the directive above (see vite.config.ts).

import { useEffect, useLayoutEffect, useRef } from 'react'
import Konva from 'konva'
import { Arrow, Circle, Layer, Stage, Text } from 'react-konva'
import type { Automaton, StateId, Transition } from '../../engine/types'
import { C, edgeColor, FONT_MONO } from './theme'
import { FLIP_BEAT_MS, DUR } from '../../motion/tokens'

export type EdgeRef = { from: StateId; on: 'H' | 'T' }

const matches = (t: Transition, e?: EdgeRef | null) =>
  !!e && t.from === e.from && t.on === e.on

// Phase offsets — fractions of FLIP_BEAT_MS (520ms), matching the design-doc
// choreography. Never hardcoded; derived from the same token.
const PULSE_OFFSET_MS = Math.round(FLIP_BEAT_MS * (80 / 520))   // ≈ 80 ms
const PACKET_START_MS = Math.round(FLIP_BEAT_MS * (120 / 520))  // ≈ 120 ms
const PACKET_DUR_MS = FLIP_BEAT_MS - PACKET_START_MS             // ≈ 400 ms

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function quadBezier(
  t: number,
  sx: number, sy: number,
  cx: number, cy: number,
  ex: number, ey: number,
): { x: number; y: number } {
  const u = 1 - t
  return {
    x: u * u * sx + 2 * u * t * cx + t * t * ex,
    y: u * u * sy + 2 * u * t * cy + t * t * ey,
  }
}

export function StateGraph({
  automaton,
  width,
  height,
  activeState = null,
  activeEdge = null,
  highlight = [],
  reducedMotion,
  pulseKey = 0,
  labelMode = 'prefix',
}: {
  automaton: Automaton
  width: number
  height: number
  activeState?: StateId | null
  activeEdge?: EdgeRef | null
  highlight?: EdgeRef[]
  reducedMotion?: boolean
  pulseKey?: number
  // 'dual' renders the symbolic E-id (E0) beneath the prefix label (∅) so the
  // notation ladder is visible at a glance (L1 §5.2 dual-label). Default
  // 'prefix' keeps the single-label rendering used by every existing beat.
  labelMode?: 'prefix' | 'dual'
}) {
  const { states, transitions } = automaton
  const n = states.length
  // Many-node automata (length-4+ patterns, n>=5) need smaller nodes + tighter
  // side padding to fit a phone width without colliding; the flagship's n<=4
  // graphs keep their original sizing.
  const radius = Math.min(34, Math.max(n > 4 ? 14 : 22, width / (n * 3)))
  const nodeY = height * 0.5
  const padX = radius + (n > 4 ? 16 : 30)
  const innerW = Math.max(1, width - padX * 2)
  const xOf = (i: number) => (n <= 1 ? width / 2 : padX + (innerW * i) / (n - 1))
  const indexOf = (id: StateId) => states.findIndex((s) => s.id === id)

  const nodeRefs = useRef<Record<string, Konva.Circle>>({})
  const layerRef = useRef<Konva.Layer | null>(null)

  // Snapshot of current geometry + reactive props for safe use inside deferred
  // callbacks — avoids stale closures without polluting the effect deps array.
  // Updated via useLayoutEffect (not during render) to satisfy the react-hooks/refs rule.
  const geomRef = useRef({ xOf, nodeY, radius, indexOf, transitions, activeState, activeEdge })
  useLayoutEffect(() => {
    geomRef.current = { xOf, nodeY, radius, indexOf, transitions, activeState, activeEdge }
  })

  // Refs for in-flight animation cleanup.
  const animRef = useRef<Konva.Animation | null>(null)
  const packetRef = useRef<Konva.Circle | null>(null)
  const pulseTmrRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const packetTmrRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Unified flip choreography: node pulse (t≈80ms) + one-shot edge packet
  // (t≈120ms→FLIP_BEAT). Triggered by pulseKey incrementing on each flip.
  // No per-frame React setState — all animation is imperative Konva.
  useEffect(() => {
    if (pulseKey === 0) return

    // Cancel any in-flight animation from a prior flip (rapid-tap safety).
    const stop = () => {
      if (pulseTmrRef.current !== null) {
        clearTimeout(pulseTmrRef.current)
        pulseTmrRef.current = null
      }
      if (packetTmrRef.current !== null) {
        clearTimeout(packetTmrRef.current)
        packetTmrRef.current = null
      }
      if (animRef.current) {
        animRef.current.stop()
        animRef.current = null
      }
      if (packetRef.current) {
        packetRef.current.destroy()
        packetRef.current = null
      }
    }
    stop()

    // Reduced motion: React props already reflect the new active state instantly;
    // skip pulse + packet entirely.
    if (reducedMotion) return

    // ── t≈80ms: node pulse ────────────────────────────────────────────────────
    pulseTmrRef.current = setTimeout(() => {
      const { activeState: aS } = geomRef.current
      if (!aS) return
      const node = nodeRefs.current[aS]
      if (!node) return
      node.to({
        scaleX: 1.16,
        scaleY: 1.16,
        duration: DUR.micro,
        easing: Konva.Easings.EaseOut,
        onFinish: () =>
          node.to({
            scaleX: 1,
            scaleY: 1,
            duration: DUR.base,
            easing: Konva.Easings.EaseInOut,
          }),
      })
    }, PULSE_OFFSET_MS)

    // ── t≈120ms→FLIP_BEAT: one-shot energy packet travels the active edge ─────
    packetTmrRef.current = setTimeout(() => {
      const layer = layerRef.current
      if (!layer) return
      const {
        activeEdge: aE,
        xOf: xOfG,
        nodeY: nY,
        radius: r,
        indexOf: idxOf,
        transitions: trans,
      } = geomRef.current
      if (!aE) return

      const activeTrans = trans.find((t) => t.from === aE.from && t.on === aE.on)
      if (!activeTrans) return

      const fromI = idxOf(activeTrans.from)
      const toI = idxOf(activeTrans.to)
      const srcX = xOfG(fromI)
      const dstX = xOfG(toI)

      // Bezier path that mirrors the Arrow geometry for each edge kind.
      let kind: 'linear' | 'quad' = 'linear'
      let sx = 0, sy = 0, ex = 0, ey = 0, cx = 0, cy = 0

      if (activeTrans.kind === 'self-loop') {
        sx = srcX - r * 0.5;  sy = nY - r
        ex = srcX + r * 0.5;  ey = nY - r
        cx = srcX;            cy = nY - r * 2.5
        kind = 'quad'
      } else if (activeTrans.kind === 'reset') {
        sx = srcX;                    sy = nY + r
        ex = dstX;                    ey = nY + r
        cx = (srcX + dstX) / 2;       cy = nY + r * 2.4
        kind = 'quad'
      } else {
        // advance: straight line between node edges
        sx = srcX + r;  sy = nY
        ex = dstX - r;  ey = nY
      }

      const color = edgeColor(aE.on)
      const packet = new Konva.Circle({
        x: sx,
        y: sy,
        radius: 5,
        fill: color,
        opacity: 0,
        listening: false,
      })
      layer.add(packet)
      packet.moveToTop()
      packetRef.current = packet

      let elapsed = 0
      const anim = new Konva.Animation((frame) => {
        elapsed += frame?.timeDiff ?? 16
        const raw = Math.min(1, elapsed / PACKET_DUR_MS)
        const easedT = easeOutCubic(raw)

        const pos =
          kind === 'quad'
            ? quadBezier(easedT, sx, sy, cx, cy, ex, ey)
            : { x: sx + (ex - sx) * easedT, y: sy }

        packet.x(pos.x)
        packet.y(pos.y)
        // Fade in over first 15%, hold full opacity through 85%, fade out at end.
        const opacity =
          raw < 0.15 ? raw / 0.15 : raw > 0.85 ? (1 - raw) / 0.15 : 1
        packet.opacity(opacity)

        if (raw >= 1) {
          anim.stop()
          animRef.current = null
          packet.destroy()
          packetRef.current = null
        }
      }, layer)

      animRef.current = anim
      anim.start()
    }, PACKET_START_MS)

    return stop
  }, [pulseKey, reducedMotion])

  function edgeShape(t: Transition, key: string) {
    const fromI = indexOf(t.from)
    const toI = indexOf(t.to)
    const active = matches(t, activeEdge)
    const high = highlight.some((h) => matches(t, h))
    const color = edgeColor(t.on)
    const strokeWidth = active ? 4 : high ? 3.5 : 2
    // Active edge is solid (not dashed) — animation is the one-shot packet,
    // not a perpetual marquee.
    const common = {
      stroke: color,
      strokeWidth,
      fill: color,
      pointerLength: 7,
      pointerWidth: 7,
      shadowColor: high ? C.mark : undefined,
      shadowBlur: high ? 12 : 0,
      shadowOpacity: high ? 1 : 0,
      listening: false,
    }
    const cx = xOf(fromI)

    if (t.kind === 'self-loop') {
      const top = nodeY - radius
      return (
        <Arrow
          key={key}
          points={[
            cx - radius * 0.5,
            top,
            cx - radius * 1.1,
            nodeY - radius * 2.5,
            cx + radius * 1.1,
            nodeY - radius * 2.5,
            cx + radius * 0.5,
            top,
          ]}
          tension={0.7}
          {...common}
        />
      )
    }

    if (t.kind === 'reset') {
      const x1 = cx
      const x2 = xOf(toI)
      const midX = (x1 + x2) / 2
      const bottom = nodeY + radius
      return (
        <Arrow
          key={key}
          points={[x1, bottom, midX, nodeY + radius * 2.4, x2, bottom]}
          tension={0.5}
          {...common}
        />
      )
    }

    // advance: straight arrow to the next node
    const x1 = cx + radius
    const x2 = xOf(toI) - radius
    return <Arrow key={key} points={[x1, nodeY, x2, nodeY]} {...common} />
  }

  function edgeLabel(t: Transition, key: string) {
    const fromI = indexOf(t.from)
    const toI = indexOf(t.to)
    const cx = xOf(fromI)
    let lx = cx
    let ly: number
    if (t.kind === 'self-loop') {
      ly = nodeY - radius * 2.5 - 16
    } else if (t.kind === 'reset') {
      lx = (cx + xOf(toI)) / 2
      ly = nodeY + radius * 2.4 + 4
    } else {
      lx = (cx + radius + (xOf(toI) - radius)) / 2
      ly = nodeY - radius - 20
    }
    return (
      <Text
        key={key}
        text={t.on}
        x={lx - 8}
        y={ly}
        width={16}
        align="center"
        fontFamily={FONT_MONO}
        fontStyle="600"
        fontSize={15}
        fill={edgeColor(t.on)}
        listening={false}
      />
    )
  }

  return (
    <Stage width={width} height={height}>
      <Layer ref={(node) => { layerRef.current = node }} listening={false}>
        {transitions.map((t, i) => edgeShape(t, `e${i}`))}
        {states.map((s, i) => {
          const active = s.id === activeState
          return (
            <Circle
              key={s.id}
              ref={(node) => {
                if (node) nodeRefs.current[s.id] = node
              }}
              x={xOf(i)}
              y={nodeY}
              radius={radius}
              fill={active ? C.quillTint : C.paper0}
              stroke={active ? C.quill : s.absorbing ? C.correct : C.graphite}
              strokeWidth={active ? 3 : s.absorbing ? 2.5 : 1.5}
            />
          )
        })}
        {states.map((s, i) =>
          s.absorbing ? (
            <Circle
              key={`ring-${s.id}`}
              x={xOf(i)}
              y={nodeY}
              radius={radius + 5}
              stroke={C.correct}
              strokeWidth={1.5}
              listening={false}
            />
          ) : null,
        )}
        {states.map((s, i) => (
          <Text
            key={`lbl-${s.id}`}
            text={s.label}
            x={xOf(i) - radius}
            y={nodeY - (labelMode === 'dual' ? 19 : 11)}
            width={radius * 2}
            align="center"
            fontFamily={FONT_MONO}
            fontStyle="600"
            fontSize={labelMode === 'dual' ? 16 : s.label.length > 1 ? 16 : 20}
            fill={s.id === activeState ? C.quillStrong : C.ink}
            listening={false}
          />
        ))}
        {labelMode === 'dual' &&
          states.map((s, i) => (
            <Text
              key={`id-${s.id}`}
              text={s.id}
              x={xOf(i) - radius}
              y={nodeY + 4}
              width={radius * 2}
              align="center"
              fontFamily={FONT_MONO}
              fontStyle="600"
              fontSize={12}
              fill={s.id === activeState ? C.quill : C.graphite}
              listening={false}
            />
          ))}
        {transitions.map((t, i) => edgeLabel(t, `el${i}`))}
      </Layer>
    </Stage>
  )
}
