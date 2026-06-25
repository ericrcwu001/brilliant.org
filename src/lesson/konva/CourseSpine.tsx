'use no memo'

// Konva course-path spine (docs/adr/0001-konva-course-path-spine.md, Q17). A
// single <Stage> draws the visual layer of the Study Desk course path — the
// vertical rule, the per-lesson node dots + mono glyphs, the locked padlocks,
// and the --mark-wash focus beam — matching the in-lesson StateGraph vocabulary.
//
// It is purely presentational: positions (`ys`) are authored by the caller and
// projected to both this canvas and the parallel DOM-button overlay so the two
// representations stay in sync (Q18). Interaction, focus, keyboard nav, 44px
// targets, and detail panels all live in DOM siblings, not here.
//
// Mounts a <Stage>, so it opts out of the React Compiler (see vite.config.ts).

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import Konva from 'konva'
import { Arc, Circle, Layer, Rect, Stage, Text } from 'react-konva'
import { C, FONT_MONO } from './theme'
import type { DeskNodeState } from '../../pages/studyDesk.model'

export interface SpineItem {
  key: string
  glyph: string
  state: DeskNodeState
  focused: boolean
}

export interface SpineBeam {
  /** Right edge the beam reaches (the detail panel's left edge), in stage px. */
  toX: number
  y: number
}

/** Imperative handle for the Konva spine traversal animation. */
export interface SpineHandle {
  /** Animate the focus halo (and beam) to `targetY` px, resolving when done. */
  traverseTo(targetY: number): Promise<void>
}

interface CourseSpineProps {
  width: number
  height: number
  spineX: number
  dotRadius: number
  items: SpineItem[]
  ys: number[]
  beam?: SpineBeam | null
  reducedMotion?: boolean
}

// Dot fill + ring derive from node state (docs/ui_design_system.md "Node
// states"): completed = filled quill dot; needsReview = filled + --mark ring;
// focused = hollow quill ring (+ pulse); available = hollow ink ring; locked =
// dashed faint ring + dimmed glyph + padlock.
function dotFill(item: SpineItem): string {
  if (item.focused) return C.paper0
  if (item.state === 'completed' || item.state === 'needsReview') return C.quill
  return C.paper0
}

function ringColor(item: SpineItem): string {
  if (item.focused) return C.quill
  if (item.state === 'needsReview') return C.mark
  if (item.state === 'completed') return C.quill
  if (item.state === 'available') return C.ink
  return C.ruleFaint // locked
}

function glyphColor(item: SpineItem): string {
  if (item.focused) return C.quillStrong
  if (item.state === 'completed' || item.state === 'needsReview') return C.paper0
  if (item.state === 'available') return C.ink
  return C.graphiteSoft // locked
}

export const CourseSpine = forwardRef<SpineHandle, CourseSpineProps>(
  function CourseSpine(
    {
      width,
      height,
      spineX,
      dotRadius,
      items,
      ys,
      beam = null,
      reducedMotion = false,
    },
    ref,
  ) {
  const haloRef = useRef<Konva.Circle | null>(null)
  const beamRef = useRef<Konva.Rect | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      traverseTo(targetY: number): Promise<void> {
        return new Promise<void>((resolve) => {
          const halo = haloRef.current
          if (!halo) {
            resolve()
            return
          }
          new Konva.Tween({
            node: halo,
            y: targetY,
            duration: 0.35,
            easing: Konva.Easings.EaseInOut,
            onFinish: resolve,
          }).play()
          const beamNode = beamRef.current
          if (beamNode) {
            new Konva.Tween({
              node: beamNode,
              y: targetY - dotRadius * 0.7,
              duration: 0.35,
              easing: Konva.Easings.EaseInOut,
            }).play()
          }
        })
      },
    }),
    [dotRadius],
  )

  // Gentle focus pulse on the quill halo (docs/ui_design_system.md Motion):
  // a slow opacity breath, collapsed to a static ring under reduced motion.
  useEffect(() => {
    const halo = haloRef.current
    if (!halo) return
    if (reducedMotion) {
      halo.opacity(0.5)
      halo.getLayer()?.batchDraw()
      return
    }
    const anim = new Konva.Animation((frame) => {
      if (!frame) return
      halo.opacity(0.35 + 0.25 * (0.5 + 0.5 * Math.sin(frame.time / 600)))
    }, halo.getLayer())
    anim.start()
    return () => {
      anim.stop()
    }
  }, [reducedMotion, beam])

  const top = ys[0] ?? 0
  const bottom = ys[ys.length - 1] ?? 0

  return (
    <Stage width={width} height={height} listening={false}>
      <Layer listening={false}>
        {/* Central hairline rule connecting the node dots. */}
        {ys.length > 1 && (
          <Rect
            x={spineX - 1}
            y={top}
            width={2}
            height={bottom - top}
            fill={C.ruleFaint}
          />
        )}

        {/* Focus beam: a flat --mark-wash band from the focused dot to the panel. */}
        {beam && (
          <Rect
            ref={(node) => {
              if (node) beamRef.current = node
            }}
            x={spineX}
            y={beam.y - dotRadius * 0.7}
            width={Math.max(0, beam.toX - spineX)}
            height={dotRadius * 1.4}
            fill={C.markWash}
            cornerRadius={dotRadius * 0.7}
          />
        )}

        {items.map((item, i) => {
          const y = ys[i]
          const locked = item.state === 'locked'
          return (
            <Circle
              key={`dot-${item.key}`}
              x={spineX}
              y={y}
              radius={dotRadius}
              fill={dotFill(item)}
              stroke={ringColor(item)}
              strokeWidth={item.focused ? 3 : item.state === 'available' ? 2 : 2}
              dash={locked ? [4, 4] : undefined}
              opacity={item.state === 'completed' && !item.focused ? 0.85 : 1}
            />
          )
        })}

        {/* needsReview keeps the filled dot but adds an outer --mark ring. */}
        {items.map((item, i) =>
          item.state === 'needsReview' && !item.focused ? (
            <Circle
              key={`rev-${item.key}`}
              x={spineX}
              y={ys[i]}
              radius={dotRadius + 4}
              stroke={C.mark}
              strokeWidth={2}
            />
          ) : null,
        )}

        {/* Focused halo (pulses; static under reduced motion). */}
        {items.map((item, i) =>
          item.focused ? (
            <Circle
              key={`halo-${item.key}`}
              ref={(node) => {
                if (node) haloRef.current = node
              }}
              x={spineX}
              y={ys[i]}
              radius={dotRadius + 6}
              stroke={C.quill}
              strokeWidth={2}
              opacity={0.5}
            />
          ) : null,
        )}

        {/* Per-lesson mono glyph centered in the dot. */}
        {items.map((item, i) => (
          <Text
            key={`g-${item.key}`}
            text={item.glyph}
            x={spineX - dotRadius}
            y={ys[i] - (dotRadius < 18 ? 6 : 7)}
            width={dotRadius * 2}
            align="center"
            fontFamily={FONT_MONO}
            fontStyle="600"
            fontSize={item.glyph.length > 2 ? dotRadius * 0.62 : dotRadius * 0.82}
            fill={glyphColor(item)}
            opacity={item.state === 'locked' ? 0.3 : 1}
            listening={false}
          />
        ))}

        {/* Locked padlock badge at the dot's lower-right. */}
        {items.map((item, i) =>
          item.state === 'locked' ? (
            <Padlock
              key={`lock-${item.key}`}
              x={spineX + dotRadius * 0.62}
              y={ys[i] + dotRadius * 0.55}
              s={dotRadius * 0.34}
            />
          ) : null,
        )}
      </Layer>
    </Stage>
  )
},
)

// A tiny notebook padlock: a rounded body Rect under a thin semicircular shackle.
function Padlock({ x, y, s }: { x: number; y: number; s: number }) {
  const bodyW = s * 1.8
  const bodyH = s * 1.5
  return (
    <>
      <Arc
        x={x}
        y={y}
        innerRadius={s * 0.55}
        outerRadius={s * 0.55 + Math.max(1, s * 0.28)}
        angle={180}
        rotation={180}
        fill={C.graphiteSoft}
        listening={false}
      />
      <Rect
        x={x - bodyW / 2}
        y={y}
        width={bodyW}
        height={bodyH}
        cornerRadius={s * 0.35}
        fill={C.graphiteSoft}
        listening={false}
      />
    </>
  )
}
