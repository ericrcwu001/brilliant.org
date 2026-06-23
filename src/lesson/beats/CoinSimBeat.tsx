// Phase 6 — Simulate and watch the state machine. Free coin flips drive the
// Konva state graph (pulse + edge travel) and a left-to-right coin stream with
// the active prefix-state chip. After the exit gate (>=3 flips and >=1 prefix
// change) the primary swaps to Continue, which runs a scripted guided replay to
// the annotated near-miss before advancing. Only the flip count and the last
// committed stream segment are kept in component state — never per-frame.

import { useEffect, useRef, useState } from 'react'
import type { BeatProps } from './types'
import type { StateId } from '../../engine/types'
import { nextStateOf } from '../../engine/simulate'
import { BeatShell } from '../BeatShell'
import { CoinStream, type Flip } from '../CoinStream'
import { StateGraph, type EdgeRef } from '../konva/StateGraph'
import { useElementWidth } from '../konva/useElementWidth'

const labelOf = (automaton: BeatProps['automaton'], id: StateId) =>
  automaton.states.find((s) => s.id === id)?.label ?? ''

export function CoinSimBeat({
  beat,
  automaton,
  reducedMotion,
  isLast,
  onAdvance,
}: BeatProps) {
  const minFlips =
    beat.interaction.type === 'coinSim' &&
    beat.interaction.gate &&
    typeof beat.interaction.gate !== 'string'
      ? beat.interaction.gate.minFlips
      : 3

  const [stream, setStream] = useState<Flip[]>([])
  const [state, setState] = useState<StateId>(automaton.states[0].id)
  const [flipCount, setFlipCount] = useState(0)
  const [sawChange, setSawChange] = useState(false)
  const [activeEdge, setActiveEdge] = useState<EdgeRef | null>(null)
  const [pulseKey, setPulseKey] = useState(0)
  const [phase, setPhase] = useState<'free' | 'replaying' | 'done'>('free')
  const [announce, setAnnounce] = useState('Flip the coin to begin.')

  const [boxRef, width] = useElementWidth<HTMLDivElement>()
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const stageH = Math.max(220, Math.round((width || 320) * 0.52))
  const gated = flipCount >= minFlips && sawChange

  function applyFlip(from: StateId, on: 'H' | 'T', label: string): StateId {
    const to = nextStateOf(automaton, from, on)
    setState(to)
    setActiveEdge({ from, on })
    setPulseKey((k) => k + 1)
    setAnnounce(`${label} flip ${on}. State: ${labelOf(automaton, to)}.`)
    if (to !== from) setSawChange(true)
    return to
  }

  function flipOnce() {
    const on: 'H' | 'T' = Math.random() < automaton.p ? 'H' : 'T'
    setStream((s) => [...s, { on, key: `f${s.length}-${Math.random()}` }])
    setFlipCount((c) => c + 1)
    applyFlip(state, on, 'Free')
  }

  function flipBatch(n: number) {
    let cur = state
    const added: Flip[] = []
    let changed = false
    let last: 'H' | 'T' = 'H'
    for (let i = 0; i < n; i++) {
      const on: 'H' | 'T' = Math.random() < automaton.p ? 'H' : 'T'
      const to = nextStateOf(automaton, cur, on)
      if (to !== cur) changed = true
      added.push({ on, key: `b${flipCount + i}-${Math.random()}` })
      cur = to
      last = on
    }
    setStream((s) => [...s, ...added])
    setFlipCount((c) => c + n)
    setState(cur)
    setActiveEdge({ from: added.length > 1 ? cur : state, on: last })
    setPulseKey((k) => k + 1)
    if (changed) setSawChange(true)
    setAnnounce(`Flipped ${n}. State: ${labelOf(automaton, cur)}.`)
  }

  // Scripted near-miss replay: advance to E1, then take the failing edge the
  // engine flags in overlapHighlights. Gates Continue until it finishes.
  function startReplay() {
    setPhase('replaying')
    const advanceOn = automaton.pattern[0] as 'H' | 'T'
    const nearMiss = automaton.overlapHighlights[0]
    const e0 = automaton.states[0].id
    const replayFlips: Flip[] = [
      { on: advanceOn, key: 'r0' },
      { on: nearMiss.on, key: 'r1' },
    ]
    const target = nextStateOf(automaton, nearMiss.from, nearMiss.on)
    const verb =
      target === e0 ? 'resets all the way to ∅' : 'keeps your matched progress'
    const annotation = `Near-miss: after one ${advanceOn}, a ${nearMiss.on} ${verb}.`

    setStream(replayFlips)
    setState(e0)
    setActiveEdge(null)

    const run = (i: number) => {
      if (i === 0) {
        applyFlip(e0, advanceOn, 'Replay')
      } else {
        applyFlip(nearMiss.from, nearMiss.on, 'Replay')
        setAnnounce(annotation)
        setPhase('done')
      }
    }

    if (reducedMotion) {
      // Immediate: skip the timed travel, land on the near-miss.
      setState(nextStateOf(automaton, e0, advanceOn))
      applyFlip(nearMiss.from, nearMiss.on, 'Replay')
      setAnnounce(annotation)
      setPhase('done')
      return
    }
    timers.current.push(setTimeout(() => run(0), 250))
    timers.current.push(setTimeout(() => run(1), 950))
  }

  const annotationDone = phase === 'done'

  let primaryLabel: string
  let primaryEnabled = true
  let onPrimary: () => void
  if (phase === 'free') {
    if (gated) {
      primaryLabel = 'Continue'
      onPrimary = startReplay
    } else {
      primaryLabel = 'Flip'
      onPrimary = flipOnce
    }
  } else if (phase === 'replaying') {
    primaryLabel = 'Replaying…'
    primaryEnabled = false
    onPrimary = () => {}
  } else {
    primaryLabel = isLast ? 'Finish' : 'Continue'
    onPrimary = onAdvance
  }

  const secondary =
    phase === 'free'
      ? gated
        ? { label: 'Flip', onClick: flipOnce }
        : { label: 'Flip ×8', onClick: () => flipBatch(8) }
      : undefined

  return (
    <BeatShell
      primary={{ label: primaryLabel, enabled: primaryEnabled, onClick: onPrimary }}
      secondary={secondary}
    >
      <div className="coinsim" ref={boxRef}>
        <div className="canvas-frame">
          {width > 0 && (
            <StateGraph
              automaton={automaton}
              width={width}
              height={stageH}
              activeState={state}
              activeEdge={activeEdge}
              reducedMotion={reducedMotion}
              pulseKey={pulseKey}
            />
          )}
        </div>
        <CoinStream
          flips={stream}
          stateLabel={labelOf(automaton, state)}
          announce={announce}
        />
        {phase === 'free' && !gated && (
          <p className="hint-note">
            Flip a few times — watch the active state chip after each flip.
          </p>
        )}
        {annotationDone && <p className="hint-note hint-note--mark">{announce}</p>}
      </div>
    </BeatShell>
  )
}
