'use no memo'

// Bias-sensitivity chart: expected wait E[pattern] vs coin bias p(H). Two curves
// (HH, HT) on a log y-axis; a vertical guide and per-line dots track the live
// slider value. Mounts a Konva <Stage>, so it opts out of the React Compiler.
//
// Series colors are caller-supplied via BiasSeries[].color, so the chapter
// accent is already applied by the caller (BiasSandboxBeat). The optional
// `accent` prop here tints the p-value guide label so the readout matches the
// lesson's chapter hue. Defaults to C.quill (indigo) for stable existing callers.

import { Circle, Group, Layer, Line, Rect, Stage, Text } from 'react-konva'
import { C, FONT_MONO, accentFor } from './theme'

export type BiasSeries = {
  pattern: string
  color: string
  samples: { p: number; e: number }[]
  current: number
}

function niceLogFloor(v: number): number {
  if (v <= 0) return 1
  const exp = Math.floor(Math.log10(v))
  const base = 10 ** exp
  const frac = v / base
  if (frac >= 5) return 5 * base
  if (frac >= 2) return 2 * base
  return base
}

function niceLogCeil(v: number): number {
  if (v <= 0) return 1
  const exp = Math.floor(Math.log10(v))
  const base = 10 ** exp
  const frac = v / base
  if (frac <= 1) return base
  if (frac <= 2) return 2 * base
  if (frac <= 5) return 5 * base
  return 10 * base
}

function logTicks(yLo: number, yHi: number): number[] {
  const ticks: number[] = []
  for (let p = 1; p <= yHi * 10; p *= 10) {
    for (const m of [1, 2, 5]) {
      const v = p * m
      if (v >= yLo && v <= yHi) ticks.push(v)
    }
  }
  return ticks
}

export function BiasChart({
  width,
  height,
  pMin,
  pMax,
  p,
  series,
  accent,
}: {
  width: number
  height: number
  pMin: number
  pMax: number
  p: number
  series: BiasSeries[]
  // Resolved chapter hex from chapterColor(lessonId). Applied to the p-guide
  // readout label so it matches the lesson's chapter accent. Series curve colors
  // are caller-supplied via BiasSeries[].color. Defaults to C.quill (indigo).
  accent?: string
}) {
  const acBase = accentFor(accent ?? C.quill).base

  const padL = 40
  const padR = 56
  const padT = 16
  const padB = 36
  const plotL = padL
  const plotR = width - padR
  const plotT = padT
  const plotB = height - padB

  const allE = series.flatMap((s) => s.samples.map((pt) => pt.e))
  const rawMin = Math.min(...allE)
  const rawMax = Math.max(...allE)
  const yLo = niceLogFloor(rawMin * 0.85)
  const yHi = niceLogCeil(rawMax * 1.15)
  const lnLo = Math.log(yLo)
  const lnSpan = Math.log(yHi) - lnLo

  const xFor = (pp: number) =>
    plotL + ((pp - pMin) / (pMax - pMin)) * (plotR - plotL)
  const yFor = (v: number) =>
    plotB - ((Math.log(Math.max(v, yLo)) - lnLo) / lnSpan) * (plotB - plotT)
  const yForC = (v: number) => Math.max(plotT, Math.min(plotB, yFor(v)))

  const yTicks = logTicks(yLo, yHi)
  const xTicks = [0.1, 0.3, 0.5, 0.7, 0.9].filter((t) => t >= pMin - 0.001 && t <= pMax + 0.001)

  const xGuide = xFor(p)

  // Stagger value chips vertically when the two dots are close.
  const markerYs = series.map((s) => yForC(s.current))
  const chipOffsets = series.map((_, i) => {
    if (series.length < 2) return -22
    const other = markerYs[1 - i]
    const mine = markerYs[i]
    if (Math.abs(mine - other) < 28) return i === 0 ? -28 : -10
    return -22
  })

  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1

  return (
    <Stage width={width} height={height} pixelRatio={dpr}>
      <Layer listening={false}>
        {/* horizontal gridlines at log y ticks */}
        {yTicks.map((v) => (
          <Line
            key={`grid-y-${v}`}
            points={[plotL, yFor(v), plotR, yFor(v)]}
            stroke={C.ruleFaint}
            strokeWidth={1}
          />
        ))}

        {/* vertical gridlines at p ticks */}
        {xTicks.map((t) => (
          <Line
            key={`grid-x-${t}`}
            points={[xFor(t), plotT, xFor(t), plotB]}
            stroke={C.ruleFaint}
            strokeWidth={1}
          />
        ))}

        {/* axes */}
        <Line points={[plotL, plotT, plotL, plotB]} stroke={C.rule} strokeWidth={1} />
        <Line points={[plotL, plotB, plotR, plotB]} stroke={C.rule} strokeWidth={1} />

        {/* y ticks + caption */}
        {yTicks.map((v) => (
          <Text
            key={`yt-${v}`}
            text={String(v)}
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
          text="flips (log)"
          x={2}
          y={plotT - 2}
          fontFamily={FONT_MONO}
          fontSize={10}
          fill={C.graphiteSoft}
        />

        {/* x ticks + caption */}
        {xTicks.map((t) => (
          <Text
            key={`xt-${t}`}
            text={t.toFixed(1)}
            x={xFor(t) - 20}
            y={plotB + 6}
            width={40}
            align="center"
            fontFamily={FONT_MONO}
            fontSize={11}
            fill={C.graphiteSoft}
          />
        ))}
        <Text
          text="p(H)"
          x={plotL}
          y={plotB + 20}
          width={plotR - plotL}
          align="center"
          fontFamily={FONT_MONO}
          fontSize={10}
          fill={C.graphiteSoft}
        />

        {/* curves + end labels */}
        {series.map((s) => {
          const pts: number[] = []
          for (const pt of s.samples) pts.push(xFor(pt.p), yForC(pt.e))
          const last = s.samples[s.samples.length - 1]
          const labelY = yForC(last.e)
          return (
            <Group key={s.pattern}>
              {pts.length >= 4 && (
                <Line
                  points={pts}
                  stroke={s.color}
                  strokeWidth={2}
                  lineJoin="round"
                  lineCap="round"
                />
              )}
              <Text
                text={s.pattern}
                x={plotR + 4}
                y={labelY - 6}
                fontFamily={FONT_MONO}
                fontSize={11}
                fill={s.color}
              />
            </Group>
          )
        })}

        {/* vertical guide at current p */}
        <Line
          points={[xGuide, plotT, xGuide, plotB]}
          stroke={C.graphiteSoft}
          strokeWidth={1}
          dash={[4, 4]}
          opacity={0.6}
        />
        {/* p readout tinted to chapter accent so it ties to the slider value */}
        <Text
          text={`p = ${p.toFixed(2)}`}
          x={Math.max(plotL, Math.min(plotR - 60, xGuide - 30))}
          y={plotB + 6}
          width={60}
          align="center"
          fontFamily={FONT_MONO}
          fontSize={10}
          fill={acBase}
        />

        {/* per-line marker dots + value chips */}
        {series.map((s, i) => {
          const x = xGuide
          const y = yForC(s.current)
          const chipText = s.current.toFixed(1)
          const chipW = 12 + chipText.length * 8
          const chipH = 18
          const chipX = Math.max(plotL, Math.min(plotR - chipW, x - chipW / 2))
          const chipY = Math.max(plotT, y + chipOffsets[i])
          return (
            <Group key={`marker-${s.pattern}`}>
              <Circle x={x} y={y} radius={8} fill={s.color} opacity={0.2} />
              <Circle
                x={x}
                y={y}
                radius={4.5}
                fill={s.color}
                stroke={C.paper0}
                strokeWidth={1.5}
              />
              <Rect
                x={chipX}
                y={chipY}
                width={chipW}
                height={chipH}
                cornerRadius={5}
                fill={s.color}
                shadowColor={C.ink}
                shadowBlur={4}
                shadowOpacity={0.12}
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
            </Group>
          )
        })}
      </Layer>
    </Stage>
  )
}
