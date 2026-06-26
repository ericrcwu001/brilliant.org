'use no memo'

// Konva graph for an arbitrary Markov chain (Wave 0, concept markov-chains).
// Nodes laid out horizontally; arrows for non-zero edges; self-loops arc above;
// backward edges arc below; optional absorbing double-ring (dashed); node pulse
// on pulseKey change. Purely presentational — tap targets live in ChainBoardBeat.
//
// Mirror of StateGraph's DPR/pixelRatio pattern, accentFor, and pulse choreography.

import { useEffect, useLayoutEffect, useRef } from 'react'
import Konva from 'konva'
import { Arrow, Circle, Layer, Stage, Text } from 'react-konva'
import type { Rational } from '../../engine/types'
import { C, accentFor, hexToRgba, FONT_MONO } from './theme'
import { formatRational } from '../../engine/markov'
import { DUR } from '../../motion/tokens'

const PULSE_OFFSET_MS = 80

export function ChainGraph({
  matrix,
  labels,
  width,
  height,
  absorbing,
  activeState = null,
  activeEdge = null,
  reducedMotion,
  pulseKey = 0,
  accent,
}: {
  matrix: Rational[][]
  labels: string[]
  width: number
  height: number
  absorbing?: number[]
  activeState?: number | null
  activeEdge?: { from: number; to: number } | null
  reducedMotion?: boolean
  pulseKey?: number
  accent?: string
  onEdgeTap?: (from: number, to: number) => void
  onNodeTap?: (i: number) => void
}) {
  const { base: acBase, tint: acTint, glow: acGlow } = accentFor(accent ?? C.ch3)

  const n = labels.length
  const radius = Math.min(34, Math.max(n > 4 ? 14 : 22, width / (n * 3)))
  const nodeY = height * 0.5
  const padX = radius + (n > 4 ? 16 : 30)
  const innerW = Math.max(1, width - padX * 2)
  const xOf = (i: number) =>
    Math.round(n <= 1 ? width / 2 : padX + (innerW * i) / (n - 1)) + 0.5

  const nodeRefs = useRef<Record<number, Konva.Circle>>({})
  const geomRef = useRef({ xOf, nodeY, radius, activeState })
  useLayoutEffect(() => {
    geomRef.current = { xOf, nodeY, radius, activeState }
  })

  const pulseTmrRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (pulseKey === 0) return

    if (pulseTmrRef.current !== null) {
      clearTimeout(pulseTmrRef.current)
      pulseTmrRef.current = null
    }
    if (reducedMotion) return

    pulseTmrRef.current = setTimeout(() => {
      const { activeState: aS } = geomRef.current
      if (aS == null) return
      const node = nodeRefs.current[aS]
      if (!node) return
      node.shadowBlur(0)
      node.to({
        scaleX: 1.16,
        scaleY: 1.16,
        shadowBlur: 14,
        duration: DUR.micro,
        easing: Konva.Easings.EaseOut,
        onFinish: () =>
          node.to({
            scaleX: 1,
            scaleY: 1,
            shadowBlur: 8,
            duration: DUR.base,
            easing: Konva.Easings.EaseInOut,
          }),
      })
    }, PULSE_OFFSET_MS)

    return () => {
      if (pulseTmrRef.current !== null) {
        clearTimeout(pulseTmrRef.current)
        pulseTmrRef.current = null
      }
    }
  }, [pulseKey, reducedMotion])

  function edgeShape(i: number, j: number, key: string) {
    const isActive =
      activeEdge !== null && activeEdge.from === i && activeEdge.to === j
    const color = isActive ? acBase : C.graphite
    const sw = isActive ? 3 : 1.8
    const common = {
      stroke: color,
      strokeWidth: sw,
      fill: color,
      pointerLength: 6,
      pointerWidth: 6,
      listening: false as const,
    }

    if (i === j) {
      // Self-loop: arc above
      const cx = xOf(i)
      const top = nodeY - radius
      return (
        <Arrow
          key={key}
          points={[
            cx - radius * 0.5, top,
            cx - radius * 1.1, nodeY - radius * 2.5,
            cx + radius * 1.1, nodeY - radius * 2.5,
            cx + radius * 0.5, top,
          ]}
          tension={0.7}
          {...common}
        />
      )
    }

    if (i < j) {
      // Forward: straight arrow slightly above center
      const x1 = xOf(i) + radius
      const x2 = xOf(j) - radius
      return (
        <Arrow
          key={key}
          points={[x1, nodeY - 5, x2, nodeY - 5]}
          {...common}
        />
      )
    }

    // Backward: arc below
    const x1 = xOf(i) - radius
    const x2 = xOf(j) + radius
    const midX = (xOf(i) + xOf(j)) / 2
    return (
      <Arrow
        key={key}
        points={[x1, nodeY + 5, midX, nodeY + radius * 2.2, x2, nodeY + 5]}
        tension={0.5}
        {...common}
      />
    )
  }

  function edgeLabel(i: number, j: number, rat: Rational, key: string) {
    let lx: number
    let ly: number
    if (i === j) {
      lx = xOf(i)
      ly = nodeY - radius * 2.5 - 16
    } else if (i < j) {
      lx = (xOf(i) + radius + (xOf(j) - radius)) / 2
      ly = nodeY - radius - 20
    } else {
      lx = (xOf(i) + xOf(j)) / 2
      ly = nodeY + radius * 2.2 + 4
    }
    return (
      <Text
        key={key}
        text={formatRational(rat)}
        x={lx - 22}
        y={ly}
        width={44}
        align="center"
        fontFamily={FONT_MONO}
        fontStyle="600"
        fontSize={11}
        fill={C.graphite}
        listening={false}
      />
    )
  }

  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1

  return (
    <Stage width={width} height={height} pixelRatio={dpr}>
      <Layer listening={false}>
        {/* Edges */}
        {matrix.flatMap((row, i) =>
          row.map((cell, j) =>
            cell.n !== 0 ? edgeShape(i, j, `e${i}-${j}`) : null,
          ),
        )}
        {/* Edge labels */}
        {matrix.flatMap((row, i) =>
          row.map((cell, j) =>
            cell.n !== 0 ? edgeLabel(i, j, cell, `el${i}-${j}`) : null,
          ),
        )}
        {/* Node circles — chapter-tinted fill, accent stroke */}
        {labels.map((_, i) => {
          const active = i === activeState
          return (
            <Circle
              key={`n${i}`}
              ref={(node) => {
                if (node) nodeRefs.current[i] = node
              }}
              x={xOf(i)}
              y={nodeY}
              radius={radius}
              fill={active ? acTint : hexToRgba(acBase, 0.1)}
              stroke={acBase}
              strokeWidth={active ? 3 : 1.8}
              shadowColor={active ? acGlow : undefined}
              shadowBlur={active ? 8 : 0}
            />
          )
        })}
        {/* Absorbing double ring — dashed accent */}
        {(absorbing ?? []).map((ai) => (
          <Circle
            key={`ring${ai}`}
            x={xOf(ai)}
            y={nodeY}
            radius={radius + 5}
            stroke={acBase}
            strokeWidth={1.5}
            dash={[3, 2]}
            opacity={0.6}
            listening={false}
          />
        ))}
        {/* Node labels */}
        {labels.map((lbl, i) => (
          <Text
            key={`lbl${i}`}
            text={lbl}
            x={xOf(i) - radius}
            y={nodeY - (lbl.length > 3 ? 8 : 11)}
            width={radius * 2}
            align="center"
            fontFamily={FONT_MONO}
            fontStyle="600"
            fontSize={lbl.length > 3 ? 11 : 16}
            fill={i === activeState ? acBase : C.ink}
            listening={false}
          />
        ))}
      </Layer>
    </Stage>
  )
}
