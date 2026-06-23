'use no memo'

// Instrumentation-style theory-vs-simulation chart (docs/ui_design_system.md
// "Simulation Chart"): solid ink theory line, quill-blue running empirical
// average, dashed highlighter prediction marker. Labels + dash patterns keep it
// readable without color. Mounts a Konva <Stage>, so it opts out of the React
// Compiler.

import { Circle, Layer, Line, Stage, Text } from 'react-konva'
import { C, FONT_MONO } from './theme'

export function SimChart({
  width,
  height,
  theory,
  prediction,
  points,
}: {
  width: number
  height: number
  theory: number
  prediction?: number
  points: number[]
}) {
  const padL = 38
  const padR = 60
  const padT = 14
  const padB = 26
  const plotL = padL
  const plotR = width - padR
  const plotT = padT
  const plotB = height - padB

  const yMax = Math.max(12, Math.ceil(theory + 2), (prediction ?? 0) + 1)
  const yFor = (v: number) => plotB - (v / yMax) * (plotB - plotT)
  const n = points.length
  const xFor = (i: number) =>
    n <= 1 ? (plotL + plotR) / 2 : plotL + ((plotR - plotL) * i) / (n - 1)

  const yTicks = [0, yMax / 2, yMax]

  const empiricalPts: number[] = []
  points.forEach((v, i) => {
    empiricalPts.push(xFor(i), yFor(v))
  })

  return (
    <Stage width={width} height={height}>
      <Layer listening={false}>
        {/* axes */}
        <Line points={[plotL, plotT, plotL, plotB]} stroke={C.rule} strokeWidth={1} />
        <Line points={[plotL, plotB, plotR, plotB]} stroke={C.rule} strokeWidth={1} />
        {yTicks.map((v) => (
          <Text
            key={`yt-${v}`}
            text={String(Math.round(v))}
            x={0}
            y={yFor(v) - 7}
            width={padL - 6}
            align="right"
            fontFamily={FONT_MONO}
            fontSize={11}
            fill={C.graphiteSoft}
          />
        ))}
        <Text
          text="flips"
          x={2}
          y={plotT - 2}
          fontFamily={FONT_MONO}
          fontSize={10}
          fill={C.graphiteSoft}
        />

        {/* theory line (solid ink) */}
        <Line
          points={[plotL, yFor(theory), plotR, yFor(theory)]}
          stroke={C.ink}
          strokeWidth={2}
        />
        <Text
          text={`theory ${theory}`}
          x={plotR + 4}
          y={yFor(theory) - 6}
          fontFamily={FONT_MONO}
          fontSize={11}
          fill={C.ink}
        />

        {/* prediction marker (dashed mark) */}
        {prediction !== undefined && (
          <>
            <Line
              points={[plotL, yFor(prediction), plotR, yFor(prediction)]}
              stroke={C.mark}
              strokeWidth={2}
              dash={[7, 5]}
            />
            <Text
              text={`you ${prediction}`}
              x={plotR + 4}
              y={yFor(prediction) - 6}
              fontFamily={FONT_MONO}
              fontSize={11}
              fill={C.mark}
            />
          </>
        )}

        {/* empirical running average (quill) */}
        {n > 1 && (
          <Line points={empiricalPts} stroke={C.quill} strokeWidth={2.5} />
        )}
        {points.map((v, i) => (
          <Circle
            key={`pt-${i}`}
            x={xFor(i)}
            y={yFor(v)}
            radius={i === n - 1 ? 4 : 2.5}
            fill={C.quill}
          />
        ))}
        {n >= 1 && (
          <Text
            text="empirical"
            x={plotR + 4}
            y={yFor(points[n - 1]) - 6}
            fontFamily={FONT_MONO}
            fontSize={11}
            fill={C.quill}
          />
        )}
      </Layer>
    </Stage>
  )
}
