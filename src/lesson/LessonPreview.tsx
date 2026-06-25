// Focused-node live preview (docs/home-study-desk.md §2.5 / Q10, Q15). The one
// cinematic moment on Home: the L1 lesson's signature 3-node state graph pulsing
// through a flip sequence, reusing the in-lesson Konva StateGraph + engine.
//
// Perf (Q15): defer-mount, static-frame-first, no code-split. A lightweight DOM
// frame paints first; the Konva <Stage> mounts + the loop starts only once the
// panel scrolls on-screen (IntersectionObserver), and the loop pauses while
// off-screen. prefers-reduced-motion renders the representative static frame
// (the matched HH end state) with no loop.

import { useEffect, useState } from 'react'
import type { Automaton, StateId } from '../engine/types'
import { nextStateOf } from '../engine/simulate'
import { StateGraph, type EdgeRef } from './konva/StateGraph'
import { useElementWidth } from './konva/useElementWidth'
import { useAmbient } from '../motion/useAmbient'
import { FLIP_BEAT_MS } from '../motion/tokens'

interface Frame {
  state: StateId
  activeEdge: EdgeRef | null
  pulseKey: number
}

export function LessonPreview({
  automaton,
  reducedMotion,
  label,
  maxHeight = 180,
}: {
  automaton: Automaton
  reducedMotion: boolean
  label: string
  maxHeight?: number
}) {
  const [boxRef, width] = useElementWidth<HTMLDivElement>()
  const e0 = automaton.states[0].id
  const absorbing = automaton.states.find((s) => s.absorbing)?.id ?? e0

  const [onScreen, setOnScreen] = useState(false)
  const [mounted, setMounted] = useState(false) // sticky: once on-screen, keep the Stage
  const [frame, setFrame] = useState<Frame>({
    state: e0,
    activeEdge: null,
    pulseKey: 0,
  })

  // Observe visibility so the Stage + loop only engage on-screen and pause off.
  useEffect(() => {
    const el = boxRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setOnScreen(true)
      setMounted(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting)
        if (entry.isIntersecting) setMounted(true)
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [boxRef])

  // Ambient caps: also pause the loop when the tab is hidden or the user is idle
  // (not just offscreen / reduced-motion), per the Restraint Rails.
  const ambient = useAmbient(boxRef)
  const running = onScreen && !reducedMotion && width > 0 && ambient

  // Autonomous flip loop: walk from ∅ to the matched pattern, then reset. Only
  // the committed step lands in state (never per-frame) — Konva animates the
  // pulse/edge travel internally.
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setFrame((prev) => {
        if (prev.state === absorbing) {
          return { state: e0, activeEdge: null, pulseKey: prev.pulseKey + 1 }
        }
        const on: 'H' | 'T' = Math.random() < automaton.p ? 'H' : 'T'
        const to = nextStateOf(automaton, prev.state, on)
        return {
          state: to,
          activeEdge: { from: prev.state, on },
          pulseKey: prev.pulseKey + 1,
        }
      })
    }, FLIP_BEAT_MS)
    return () => clearInterval(id)
  }, [running, automaton, e0, absorbing])

  // The static representative frame is the matched end state (HH reached).
  const view: Frame = running
    ? frame
    : { state: absorbing, activeEdge: null, pulseKey: 0 }
  const height = Math.round(
    Math.min(maxHeight, Math.max(96, (width || 280) * 0.46)),
  )

  return (
    <div className="lesson-preview" ref={boxRef} aria-hidden="true">
      {mounted && width > 0 ? (
        <StateGraph
          automaton={automaton}
          width={width}
          height={height}
          activeState={view.state}
          activeEdge={view.activeEdge}
          reducedMotion={!running}
          pulseKey={view.pulseKey}
        />
      ) : (
        <div className="lesson-preview__static" style={{ height }}>
          <span className="lesson-preview__glyph mono">{label}</span>
        </div>
      )}
    </div>
  )
}
