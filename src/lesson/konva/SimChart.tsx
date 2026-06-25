'use no memo'

// Instrumentation-style theory-vs-simulation chart (docs/ui_design_system.md
// "Simulation Chart"). The linear x-axis grows to the cumulative simulation
// count, so the running empirical mean (drawn trial by trial as a chapter-
// accent curve with a soft gradient area) always fills the width and re-
// compresses as runs accumulate, sweeping toward the solid ink theory line on
// a logarithmic y-axis. A faint band marks the convergence target, the
// learner's locked prediction is a dashed highlighter mark, and the live "head"
// at the right edge carries a glowing bead plus a value chip.
//
// An optional `accent` prop (resolved hex from chapterColor(lessonId)) re-keys
// the empirical series — curve, area gradient, bead, chip — to the lesson's
// chapter hue. Defaults to C.quill (indigo ch1) so existing callers are stable.
//
// Mounts a Konva <Stage>, so it opts out of the React Compiler.

import { Circle, Layer, Line, Rect, Stage, Text } from 'react-konva'
import { C, FONT_MONO, accentFor, hexToRgba } from './theme'

export function SimChart({
  width,
  height,
  theory,
  prediction,
  points,
  running = false,
  scale = 'log',
  accent,
}: {
  width: number
  height: number
  theory: number
  prediction?: number
  points: number[]
  running?: boolean
  // 'log' (default) = the flagship hitting-time look (y from ~2 up). 'linear' =
  // a [0,1] win-rate / ruin-rate axis for L2/L3 (build-brief §4.7); a log axis
  // can't show values below 1, so this is a real second scale, not a yLo tweak.
  scale?: 'log' | 'linear'
  // Resolved chapter hex from chapterColor(lessonId). Re-keys the empirical
  // curve, area gradient, bead glow, and live chip to the lesson's chapter
  // accent. Defaults to C.quill (indigo) so existing callers compile unchanged.
  accent?: string
}) {
  const { base: acBase, glow: acGlow } = accentFor(accent ?? C.quill)
  // Translucent fill for the gradient area under the empirical curve.
  const acFill = hexToRgba(acBase, 0.16)
  const acFillFade = hexToRgba(acBase, 0)

  const padL = 40
  const padR = 64
  const padT = 16
  const padB = 36
  const plotL = padL
  const plotR = width - padR
  const plotT = padT
  const plotB = height - padB

  const linear = scale === 'linear'

  // Y-axis. 'log': fixed logarithmic axis (chosen up front) so the curve doesn't
  // rescale while it converges; runs from yLo=2 up to a rounded ceiling above
  // theory/prediction. 'linear': a fixed [0,1] axis for win/ruin-rate (a log axis
  // can't represent values below 1).
  const yLo = linear ? 0 : 2
  const yMax = linear ? 1 : Math.ceil(Math.max(theory + 3, (prediction ?? 0) + 1, 10) / 4) * 4
  const lnLo = Math.log(Math.max(yLo, 1e-9))
  const lnSpan = Math.log(yMax) - lnLo
  const yFor = (v: number) =>
    linear
      ? plotB - ((Math.min(Math.max(v, yLo), yMax) - yLo) / (yMax - yLo)) * (plotB - plotT)
      : plotB - ((Math.log(Math.max(v, yLo)) - lnLo) / lnSpan) * (plotB - plotT)
  const yForC = (v: number) => Math.max(plotT, Math.min(plotB, yFor(v)))

  // Dynamic linear x-axis: the domain is [0, n], so run k lands at fraction k/n
  // and the newest run stays pinned to the right edge.
  const n = points.length
  const denom = Math.max(1, n)
  const xForRun = (k: number) => plotL + ((plotR - plotL) * k) / denom

  const last = n > 0 ? points[n - 1] : 0
  const xHead = xForRun(n)
  const yHead = yForC(last)

  // Y ticks: quartiles on a linear [0,1] axis, else 1–2–5 within the log range.
  const yTicks: number[] = []
  if (linear) {
    yTicks.push(0, 0.25, 0.5, 0.75, 1)
  } else {
    for (let p = 1; p <= yMax; p *= 10) {
      for (const m of [1, 2, 5]) {
        const v = p * m
        if (v >= yLo && v <= yMax) yTicks.push(v)
      }
    }
  }

  // Value formatting + axis caption differ by scale.
  const fmt = (v: number) => (linear ? v.toFixed(2) : String(Math.round(v)))
  const yCaption = linear ? 'rate' : 'flips (log)'

  // ±band around theory communicates "settled near the answer".
  const band = linear ? Math.max(0.02, theory * 0.06) : Math.max(0.5, theory * 0.06)

  // Empirical curve as a single polyline (performant for thousands of points);
  // the matching closed polygon paints the gradient area underneath.
  const linePts: number[] = []
  for (let i = 0; i < n; i++) linePts.push(xForRun(i + 1), yForC(points[i]))
  const areaPts = n >= 2 ? [...linePts, xForRun(n), plotB, xForRun(1), plotB] : []

  // Live value chip floats just above the head, clamped inside the plot.
  const chipText = fmt(last)
  const chipW = 12 + chipText.length * 8
  const chipH = 18
  const chipX = Math.max(plotL, Math.min(plotR - chipW, xHead - chipW / 2))
  const chipY = Math.max(plotT, Math.min(plotB - chipH - 12, yHead - chipH - 10))

  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1

  return (
    <Stage width={width} height={height} pixelRatio={dpr}>
      <Layer listening={false}>
        {/* convergence target band around theory */}
        <Rect
          x={plotL}
          y={yFor(theory + band)}
          width={plotR - plotL}
          height={yFor(theory - band) - yFor(theory + band)}
          fill={C.inkBand}
        />

        {/* horizontal gridlines aligned to the y ticks */}
        {yTicks.map((v) => (
          <Line
            key={`grid-${v}`}
            points={[plotL, yFor(v), plotR, yFor(v)]}
            stroke={C.ruleFaint}
            strokeWidth={1}
          />
        ))}

        {/* axes */}
        <Line points={[plotL, plotT, plotL, plotB]} stroke={C.rule} strokeWidth={1} />
        <Line points={[plotL, plotB, plotR, plotB]} stroke={C.rule} strokeWidth={1} />

        {/* y ticks + axis caption */}
        {yTicks.map((v) => (
          <Text
            key={`yt-${v}`}
            text={fmt(v)}
            x={0}
            y={yFor(v) - 6}
            width={padL - 8}
            align="right"
            fontFamily={FONT_MONO}
            fontSize={11}
            fill={C.graphiteSoft}
          />
        ))}
        <Text
          text={yCaption}
          x={2}
          y={plotT - 2}
          fontFamily={FONT_MONO}
          fontSize={10}
          fill={C.graphiteSoft}
        />

        {/* x axis: 0 at the left, live run count at the right edge */}
        <Text
          text="0"
          x={plotL - 20}
          y={plotB + 6}
          width={40}
          align="center"
          fontFamily={FONT_MONO}
          fontSize={11}
          fill={C.graphiteSoft}
        />
        <Text
          text={String(n)}
          x={plotR - 80}
          y={plotB + 6}
          width={80}
          align="right"
          fontFamily={FONT_MONO}
          fontSize={11}
          fill={n > 0 ? acBase : C.graphiteSoft}
        />
        <Text
          text="simulations"
          x={plotL}
          y={plotB + 20}
          width={plotR - plotL}
          align="center"
          fontFamily={FONT_MONO}
          fontSize={10}
          fill={C.graphiteSoft}
        />

        {/* theory line (solid ink — neutral reference, never accented) */}
        <Line
          points={[plotL, yFor(theory), plotR, yFor(theory)]}
          stroke={C.ink}
          strokeWidth={2}
        />
        <Text
          text={`theory ${fmt(theory)}`}
          x={plotR + 4}
          y={yFor(theory) - 6}
          fontFamily={FONT_MONO}
          fontSize={11}
          fill={C.ink}
        />

        {/* prediction marker (dashed --mark amber — the discovery cue) */}
        {prediction !== undefined && (
          <>
            <Line
              points={[plotL, yFor(prediction), plotR, yFor(prediction)]}
              stroke={C.mark}
              strokeWidth={2}
              dash={[7, 5]}
            />
            <Text
              text={`you ${fmt(prediction)}`}
              x={plotR + 4}
              y={yFor(prediction) - 6}
              fontFamily={FONT_MONO}
              fontSize={11}
              fill={C.mark}
            />
          </>
        )}

        {/* empirical running average: chapter-accent gradient area + curve */}
        {areaPts.length > 0 && (
          <Line
            points={areaPts}
            closed
            fillLinearGradientStartPoint={{ x: 0, y: plotT }}
            fillLinearGradientEndPoint={{ x: 0, y: plotB }}
            fillLinearGradientColorStops={[0, acFill, 1, acFillFade]}
          />
        )}
        {n >= 2 && (
          <Line
            points={linePts}
            stroke={acBase}
            strokeWidth={2.5}
            lineJoin="round"
            lineCap="round"
          />
        )}

        {/* live head: guide drop-line, glow, bead, value chip */}
        {n >= 1 && (
          <>
            <Line
              points={[xHead, plotB, xHead, yHead]}
              stroke={acBase}
              strokeWidth={1}
              dash={[2, 4]}
              opacity={0.45}
            />
            <Circle x={xHead} y={yHead} radius={running ? 10 : 8} fill={acGlow} />
            <Circle
              x={xHead}
              y={yHead}
              radius={4.5}
              fill={acBase}
              stroke={C.paper0}
              strokeWidth={1.5}
            />
            <Rect
              x={chipX}
              y={chipY}
              width={chipW}
              height={chipH}
              cornerRadius={5}
              fill={acBase}
              shadowColor={C.ink}
              shadowBlur={6}
              shadowOpacity={0.18}
              shadowOffsetY={1}
            />
            <Text
              text={chipText}
              x={chipX}
              y={chipY + 3}
              width={chipW}
              align="center"
              fontFamily={FONT_MONO}
              fontStyle="600"
              fontSize={12}
              fill={C.paper0}
            />
          </>
        )}
      </Layer>
    </Stage>
  )
}
