'use no memo'

// Konva state graph — the visual hero (docs/ui_design_system.md "State Graph").
// Nodes are matched-prefix circles (∅, H, HH); H edges are heads-gold, T edges
// tails-teal; self-loops arc above, reset edges curve below. The active node
// pulses and the active edge shows a traveling dash. Reused by the coin-sim,
// overlap, and bias-sandbox beats.
//
// This file mounts a Konva <Stage>, so it opts out of the React Compiler via
// the directive above (see vite.config.ts).

import { useEffect, useRef } from 'react'
import Konva from 'konva'
import { Arrow, Circle, Layer, Stage, Text } from 'react-konva'
import type { Automaton, StateId, Transition } from '../../engine/types'
import { C, edgeColor, FONT_MONO } from './theme'

export type EdgeRef = { from: StateId; on: 'H' | 'T' }

const matches = (t: Transition, e?: EdgeRef | null) =>
  !!e && t.from === e.from && t.on === e.on

export function StateGraph({
  automaton,
  width,
  height,
  activeState = null,
  activeEdge = null,
  highlight = [],
  reducedMotion,
  pulseKey = 0,
}: {
  automaton: Automaton
  width: number
  height: number
  activeState?: StateId | null
  activeEdge?: EdgeRef | null
  highlight?: EdgeRef[]
  reducedMotion?: boolean
  pulseKey?: number
}) {
  const { states, transitions } = automaton
  const n = states.length
  const radius = Math.min(34, Math.max(22, width / (n * 3)))
  const nodeY = height * 0.5
  const padX = radius + 30
  const innerW = Math.max(1, width - padX * 2)
  const xOf = (i: number) => (n <= 1 ? width / 2 : padX + (innerW * i) / (n - 1))
  const indexOf = (id: StateId) => states.findIndex((s) => s.id === id)

  const nodeRefs = useRef<Record<string, Konva.Circle>>({})
  const activeEdgeRef = useRef<Konva.Arrow | null>(null)

  // Node pulse on each flip.
  useEffect(() => {
    if (reducedMotion || !activeState || pulseKey === 0) return
    const node = nodeRefs.current[activeState]
    if (!node) return
    node.to({
      scaleX: 1.16,
      scaleY: 1.16,
      duration: 0.12,
      onFinish: () => node.to({ scaleX: 1, scaleY: 1, duration: 0.2 }),
    })
  }, [pulseKey, activeState, reducedMotion])

  // Traveling dash on the active edge.
  useEffect(() => {
    if (reducedMotion || !activeEdge) return
    const line = activeEdgeRef.current
    if (!line) return
    const anim = new Konva.Animation((frame) => {
      if (frame) line.dashOffset(-((frame.time / 14) % 1000))
    }, line.getLayer())
    anim.start()
    return () => {
      anim.stop()
    }
  }, [activeEdge, reducedMotion])

  function edgeShape(t: Transition, key: string) {
    const fromI = indexOf(t.from)
    const toI = indexOf(t.to)
    const active = matches(t, activeEdge)
    const high = highlight.some((h) => matches(t, h))
    const color = edgeColor(t.on)
    const strokeWidth = active ? 4 : high ? 3.5 : 2
    const common = {
      stroke: color,
      strokeWidth,
      fill: color,
      pointerLength: 7,
      pointerWidth: 7,
      dash: active ? [8, 6] : undefined,
      shadowColor: high ? C.mark : undefined,
      shadowBlur: high ? 12 : 0,
      shadowOpacity: high ? 1 : 0,
      ref: active ? activeEdgeRef : undefined,
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
      <Layer listening={false}>
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
            y={nodeY - 11}
            width={radius * 2}
            align="center"
            fontFamily={FONT_MONO}
            fontStyle="600"
            fontSize={s.label.length > 1 ? 16 : 20}
            fill={s.id === activeState ? C.quillStrong : C.ink}
            listening={false}
          />
        ))}
        {transitions.map((t, i) => edgeLabel(t, `el${i}`))}
      </Layer>
    </Stage>
  )
}
