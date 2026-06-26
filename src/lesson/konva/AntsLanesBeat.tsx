'use no memo'

// Ants-on-a-string simulation (ev6-explore). 500 ant dots march on a 1D Konva
// track; the "Swap labels on collision" toggle switches between a visual bounce
// and clean pass-through, revealing the set of fall-off times is identical.
// DOM aria-live mirror narrates progress outside the canvas. Reduced-motion →
// static final frame. Hero readout surfaces after the first run completes.

import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Line, Circle, Text as KonvaText } from 'react-konva'
import type { BeatProps } from '../beats/types'
import { BeatShell } from '../BeatShell'
import { C } from './theme'
import { mulberry32 } from '../../engine/simulate'

const W = 320
const H = 80
const TRACK_Y = H / 2
const DOT_R = 4
const CH2 = '#0D9488'
// Full track in 2 real seconds = 1 physics minute; physics_min = elapsed_s / 2
const PX_PER_S = W / 2
const MIRROR_MS = 500

interface Ant {
  pos: number
  vel: number
  dir: 1 | -1
  alive: boolean
  exitTime: number | null
}

type Dot = { x: number; color: string }

function buildAnts(n: number, seed: number): Ant[] {
  const rng = mulberry32(0xa000 + seed)
  return Array.from({ length: n }, () => {
    const dir = (rng() < 0.5 ? 1 : -1) as 1 | -1
    return { pos: rng() * W, vel: dir * PX_PER_S, dir, alive: true, exitTime: null }
  })
}

// In pass-through mode: color by direction. In bounce mode: sort by position
// and alternate colors — when two ants "cross", the sorted order flips and
// both dots appear to reverse direction, creating the visual bounce illusion.
function getRenderDots(ants: Ant[], swapLabels: boolean): Dot[] {
  const alive = ants.filter(a => a.alive)
  if (!swapLabels) {
    return alive.map(a => ({ x: a.pos, color: a.dir === 1 ? C.laneA : C.laneB }))
  }
  return alive
    .slice()
    .sort((a, b) => a.pos - b.pos)
    .map((a, i) => ({ x: a.pos, color: i % 2 === 0 ? C.laneA : C.laneB }))
}

export function AntsLanesBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion } = props
  const n =
    beat.interaction.type === 'raceSim' && beat.interaction.ants
      ? beat.interaction.ants.n
      : 500

  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  const [swapLabels, setSwapLabels] = useState(true)
  const [runCount, setRunCount] = useState(0)
  const [liveText, setLiveText] = useState('')
  // Dots stored in state so render doesn't access refs directly
  const [dotsState, setDotsState] = useState<Dot[]>([])

  const antsRef = useRef<Ant[]>([])
  const elapsedRef = useRef(0)
  const mirrorLastRef = useRef(0)
  const firstOffRef = useRef<number | null>(null)
  const lastOffRef = useRef<number | null>(null)
  // Ref mirror of swapLabels so the RAF loop reads fresh value without closure capture
  const swapLabelsRef = useRef(true)

  const toggleSwapLabels = () => {
    const next = !swapLabelsRef.current
    swapLabelsRef.current = next
    setSwapLabels(next)
    if (antsRef.current.length > 0) {
      setDotsState(getRenderDots(antsRef.current, next))
    }
  }

  const runSim = () => {
    if (reducedMotion) {
      const ants = buildAnts(n, runCount)
      let first: number | null = null
      let last = 0
      for (const ant of ants) {
        ant.alive = false
        const phys = (ant.dir === 1 ? W - ant.pos : ant.pos) / PX_PER_S / 2
        ant.exitTime = phys
        if (first === null || phys < first) first = phys
        if (phys > last) last = phys
      }
      antsRef.current = ants
      firstOffRef.current = first
      lastOffRef.current = last
      setDotsState([])
      setLiveText(`All ${n} ants have fallen off. Last at ${last.toFixed(3)} min.`)
      setPhase('done')
      setRunCount(c => c + 1)
      return
    }
    antsRef.current = buildAnts(n, runCount)
    elapsedRef.current = 0
    mirrorLastRef.current = 0
    firstOffRef.current = null
    lastOffRef.current = null
    setDotsState(getRenderDots(antsRef.current, swapLabelsRef.current))
    setLiveText(`${n} ants still walking.`)
    setPhase('running')
    setRunCount(c => c + 1)
  }

  useEffect(() => {
    if (phase !== 'running') return
    let rafId: number
    let lastTime: number | null = null

    function loop(time: number) {
      if (lastTime === null) lastTime = time
      const dt = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time
      elapsedRef.current += dt

      let aliveCount = 0
      for (const ant of antsRef.current) {
        if (!ant.alive) continue
        ant.pos += ant.vel * dt
        if (ant.pos <= 0 || ant.pos >= W) {
          ant.alive = false
          const physMin = elapsedRef.current / 2
          ant.exitTime = physMin
          if (firstOffRef.current === null) firstOffRef.current = physMin
          lastOffRef.current = physMin
        } else {
          aliveCount++
        }
      }

      if (aliveCount === 0) {
        const t = lastOffRef.current
        setDotsState([])
        setLiveText(
          t !== null
            ? `All ${n} ants have fallen off. Last at ${t.toFixed(3)} min.`
            : `All ${n} ants have fallen off.`,
        )
        setPhase('done')
        return
      }

      if (time - mirrorLastRef.current > MIRROR_MS) {
        mirrorLastRef.current = time
        const first = firstOffRef.current
        setLiveText(
          first !== null
            ? `${aliveCount} ants still walking. First off at ${first.toFixed(3)} min.`
            : `${aliveCount} ants still walking.`,
        )
      }

      setDotsState(getRenderDots(antsRef.current, swapLabelsRef.current))
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [phase, n])

  const heroReadout = beat.hero?.structuralReadout

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: phase === 'done',
        onClick: onAdvance,
        variant: 'ghost',
      }}
      secondary={{
        label: phase === 'running' ? 'Running\u2026' : 'Run simulation',
        onClick: runSim,
        enabled: phase !== 'running',
        variant: 'primary',
      }}
    >
      <div className="ants-beat">
        <button
          type="button"
          role="switch"
          aria-checked={swapLabels}
          aria-label="Swap labels on collision"
          className="ants-beat__toggle"
          onClick={toggleSwapLabels}
        >
          {swapLabels ? 'Bounce view' : 'Pass-through view'}
        </button>

        <div className="ants-beat__canvas-wrap">
          <Stage width={W} height={H}>
            <Layer>
              <Line points={[0, TRACK_Y, W, TRACK_Y]} stroke={CH2} strokeWidth={2} />
              {dotsState.map((d, i) => (
                <Circle key={i} x={d.x} y={TRACK_Y} radius={DOT_R} fill={d.color} />
              ))}
              {phase === 'done' && (
                <KonvaText
                  x={W / 2 - 110}
                  y={TRACK_Y - 20}
                  text="E[max] = 500/501 \u2248 0.998 min"
                  fill={CH2}
                  fontSize={12}
                  fontFamily="'JetBrains Mono', monospace"
                />
              )}
            </Layer>
          </Stage>
        </div>

        <div
          role="log"
          aria-live="polite"
          aria-atomic="false"
          className="ants-mirror"
        >
          {liveText}
        </div>

        {phase === 'done' && heroReadout && (
          <p className="racehero__readout">{heroReadout}</p>
        )}
      </div>
    </BeatShell>
  )
}
