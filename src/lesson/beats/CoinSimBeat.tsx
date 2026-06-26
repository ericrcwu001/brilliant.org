// Phase 6 — Simulate and watch the state machine. Free coin flips drive the
// Konva state graph (pulse + edge travel) and a left-to-right coin stream with
// the active prefix-state chip. After the exit gate (>=3 flips and >=1 prefix
// change) the primary swaps to Continue, which runs a scripted guided replay to
// the annotated near-miss before advancing. Only the flip count and the last
// committed stream segment are kept in component state — never per-frame.
//
// Track B (density 'merged') keeps the original single-beat flow, byte-for-byte.
// Track A (density 'split', L1 §4.3/§5.4) shares the graph-visible-from-load
// opening and adds: dual state labels, a single-stepped near-miss replay with the
// other channels dimmed, and a one-time gambler's-fallacy note on a >=3 same-face run.
//
// EV additive extension: when coinSim.p is present and ≠ 0.5 the export routes
// to IndicatorSim — a biased 0/1 Bernoulli stream whose running average converges
// to p. CoinSimPHT below is the original code, unchanged byte-for-byte.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { BeatProps } from './types'
import type { StateId } from '../../engine/types'
import { nextStateOf } from '../../engine/simulate'
import { BeatShell } from '../BeatShell'
import { CoinStream, type Flip } from '../CoinStream'
import { StateGraph, type EdgeRef } from '../konva/StateGraph'

// ── IndicatorSim — biased 0/1 stream; ev3-explore ────────────────────────────
// Rendered only when coinSim.p is defined and ≠ 0.5. Outcome labels ("Ace (1)"
// / "Not ace (0)"), running average, and theory line at p. PHT path untouched.

function IndicatorSim({
  p,
  gamblerNote,
  isLast,
  reducedMotion,
  onAdvance,
}: {
  p: number
  gamblerNote: string
  isLast: boolean
  reducedMotion: boolean
  onAdvance: () => void
}) {
  const [draws, setDraws] = useState<number[]>([])
  const [lastDraw, setLastDraw] = useState<0 | 1 | null>(null)
  const [showGambler, setShowGambler] = useState(false)
  const gamblerShownRef = useRef(false)
  // Mirror of draws kept in a ref so addDraws can read the current value without
  // a stale closure. Never read during render — only inside event handlers.
  const drawsRef = useRef<number[]>([])

  const count = draws.length
  const avg = count > 0 ? draws.reduce((a, b) => a + b, 0) / count : -1
  const avgPct = avg >= 0 ? (Math.min(avg, 1) * 100).toFixed(2) : '0.00'
  const theoryPct = (Math.min(p, 1) * 100).toFixed(2)

  function addDraws(n: number) {
    const batch = Array.from({ length: n }, () => (Math.random() < p ? 1 : 0)) as (0 | 1)[]
    const next = [...drawsRef.current, ...batch]
    drawsRef.current = next
    setDraws(next)
    setLastDraw(batch[batch.length - 1] ?? null)
    if (!gamblerShownRef.current && next.length >= 50) {
      const nextAvg = next.reduce((a, b) => a + b, 0) / next.length
      if (Math.abs(nextAvg - p) <= 0.02) {
        gamblerShownRef.current = true
        setShowGambler(true)
      }
    }
  }

  const hasDraw = count > 0
  const primaryLabel = hasDraw ? (isLast ? 'Finish' : 'Continue') : 'Draw card'
  const onPrimary = hasDraw ? onAdvance : () => addDraws(1)
  const secondary = hasDraw
    ? { label: 'Draw card', onClick: () => addDraws(1) }
    : { label: 'Run 100', onClick: () => addDraws(100) }
  const tertiary = hasDraw ? { label: 'Run 100', onClick: () => addDraws(100) } : undefined

  return (
    <BeatShell
      primary={{ label: primaryLabel, enabled: true, onClick: onPrimary }}
      secondary={secondary}
      tertiary={tertiary}
    >
      <div className='isim'>
        <p className='isim__count' aria-hidden='true'>
          Outcomes:&nbsp;<strong>Ace&nbsp;(1)</strong>&nbsp;·&nbsp;<strong>Not&nbsp;ace&nbsp;(0)</strong>
        </p>
        <div className='isim__track-wrap'>
          <div className='isim__track' role='presentation' aria-hidden='true'>
            <div
              className='isim__avg-bar'
              style={{
                width: `${avgPct}%`,
                transition: reducedMotion ? 'none' : undefined,
              }}
            />
            <div className='isim__theory-line' style={{ left: `${theoryPct}%` }} />
          </div>
          <div className='isim__axis' aria-hidden='true'>
            <span>0</span>
            <span className='isim__theory-label' style={{ left: `${theoryPct}%` }}>
              P={p.toFixed(3)}
            </span>
            <span>1</span>
          </div>
        </div>
        <p className='isim__readout' aria-live='polite' aria-atomic='true'>
          {avg < 0
            ? 'Running average of indicator: draw to begin'
            : `Running average of indicator: ${avg.toFixed(4)}`}
        </p>
        {lastDraw !== null && (
          <p className='isim__last'>
            Last draw: {lastDraw === 1 ? 'Ace\u00a0(1)' : 'Not\u00a0ace\u00a0(0)'}
          </p>
        )}
        {count > 0 && (
          <p className='isim__count'>
            {count} draw{count !== 1 ? 's' : ''}
          </p>
        )}
        {showGambler && (
          <p className='hint-note hint-note--mark' role='status' aria-live='polite'>
            {gamblerNote}
          </p>
        )}
      </div>
    </BeatShell>
  )
}

// ── Thin router ────────────────────────────────────────────────────────────────
// Dispatches to IndicatorSim (EV p-path) or CoinSimPHT (existing PHT path).
// Keeping dispatch here (not inside CoinSimPHT) satisfies rules-of-hooks: each
// downstream component calls all its own hooks unconditionally.

const labelOf = (automaton: BeatProps['automaton'], id: StateId) =>
  automaton.states.find((s) => s.id === id)?.label ?? ''

const DEFAULT_GAMBLER_NOTE =
  "A long streak feels 'due' to break, but each flip is independent — the coin has no memory."

type Phase = 'free' | 'replaying' | 'done'

export function CoinSimBeat(props: BeatProps) {
  const { beat, reducedMotion, isLast, onAdvance } = props
  const interaction = beat.interaction
  if (
    interaction.type === 'coinSim' &&
    typeof interaction.p === 'number' &&
    interaction.p !== 0.5
  ) {
    const gn =
      interaction.gamblerNote ||
      'As draws grow, the running average of 0s and 1s settles to P.'
    return (
      <IndicatorSim
        p={interaction.p}
        gamblerNote={gn}
        isLast={isLast}
        reducedMotion={reducedMotion}
        onAdvance={onAdvance}
      />
    )
  }
  return <CoinSimPHT {...props} />
}

// ── CoinSimPHT — original PHT automaton simulation (unchanged) ────────────────

function CoinSimPHT({
  beat,
  automaton,
  reducedMotion,
  density,
  isLast,
  onAdvance,
}: BeatProps) {
  const split = density === 'split'
  const interaction = beat.interaction
  const minFlips =
    interaction.type === 'coinSim' &&
    interaction.gate &&
    typeof interaction.gate !== 'string'
      ? interaction.gate.minFlips
      : 3
  const gamblerNote =
    (interaction.type === 'coinSim' && interaction.gamblerNote) || DEFAULT_GAMBLER_NOTE

  const [stream, setStream] = useState<Flip[]>([])
  const [state, setState] = useState<StateId>(automaton.states[0].id)
  const [flipCount, setFlipCount] = useState(0)
  const [sawChange, setSawChange] = useState(false)
  const [activeEdge, setActiveEdge] = useState<EdgeRef | null>(null)
  const [pulseKey, setPulseKey] = useState(0)
  // Both tracks open with the graph visible; Track A adds the split scaffolds below.
  const [phase, setPhase] = useState<Phase>('free')
  const [announce, setAnnounce] = useState('Flip the coin to begin.')
  const [gambler, setGambler] = useState<string | null>(null)

  // Same-face run tracker for the one-time gambler's-fallacy note (Track A).
  const run = useRef<{ face: 'H' | 'T' | null; len: number }>({ face: null, len: 0 })
  const gamblerShown = useRef(false)

  const [width, setWidth] = useState(0)
  const roRef = useRef<ResizeObserver | null>(null)
  const boxRef = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect()
    if (!el) {
      roRef.current = null
      return
    }
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    roRef.current = ro
  }, [])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const stageH = Math.max(220, Math.round((width || 320) * 0.52))
  const gated = flipCount >= minFlips && sawChange

  const e0 = automaton.states[0].id
  const isAbsorbing = (id: StateId) =>
    !!automaton.states.find((s) => s.id === id)?.absorbing
  // The absorbing state has no outgoing edges: once the pattern is matched, the
  // next flip starts a fresh search from ∅, so the stream keeps going.
  const fromState = (id: StateId) => (isAbsorbing(id) ? e0 : id)

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
    // One-time gambler's-fallacy note when a >=3 same-face run appears (Track A).
    if (run.current.face === on) run.current.len += 1
    else run.current = { face: on, len: 1 }
    if (split && run.current.len >= 3 && !gamblerShown.current) {
      gamblerShown.current = true
      setGambler(gamblerNote)
    }
    applyFlip(fromState(state), on, 'Free')
  }

  // Near-miss replay setup shared by both tracks: advance to the prefix state,
  // then take the failing edge the engine flags in overlapHighlights.
  function replayAnnotation(nearMiss: EdgeRef): string {
    const advanceOn = automaton.pattern[0]
    const target = nextStateOf(automaton, nearMiss.from, nearMiss.on)
    const verb =
      target === e0 ? 'resets all the way to ∅' : 'keeps your matched progress'
    return `Near-miss: after one ${advanceOn}, a ${nearMiss.on} ${verb}.`
  }

  function startReplay() {
    setPhase('replaying')
    const advanceOn = automaton.pattern[0] as 'H' | 'T'
    const nearMiss = automaton.overlapHighlights[0]

    // Guard (L1 §5.7): single-letter patterns (the L0 "H" on-ramp) have no
    // near-miss edge, so there is nothing to replay — finish gracefully.
    if (!nearMiss) {
      setStream([{ on: advanceOn, key: 'r0' }])
      setState(e0)
      applyFlip(e0, advanceOn, 'Replay')
      setAnnounce('The pattern just appears on its own schedule — each flip is independent.')
      setPhase('done')
      return
    }

    const replayFlips: Flip[] = [
      { on: advanceOn, key: 'r0' },
      { on: nearMiss.on, key: 'r1' },
    ]
    const annotation = replayAnnotation(nearMiss)

    setState(e0)
    setActiveEdge(null)

    // Track A: single-step. Show the advance flip now; the learner taps Step for
    // the near-miss, so the reset is a deliberate, watched moment.
    if (split) {
      setStream([replayFlips[0]])
      applyFlip(e0, advanceOn, 'Replay')
      return
    }

    setStream(replayFlips)
    const apply = (i: number) => {
      if (i === 0) {
        applyFlip(e0, advanceOn, 'Replay')
      } else {
        applyFlip(nearMiss.from, nearMiss.on, 'Replay')
        setAnnounce(annotation)
        setPhase('done')
      }
    }

    if (reducedMotion) {
      setState(nextStateOf(automaton, e0, advanceOn))
      applyFlip(nearMiss.from, nearMiss.on, 'Replay')
      setAnnounce(annotation)
      setPhase('done')
      return
    }
    timers.current.push(setTimeout(() => apply(0), 250))
    timers.current.push(setTimeout(() => apply(1), 950))
  }

  // Track A single-step: advance the replay to the near-miss on a tap.
  function stepReplay() {
    const advanceOn = automaton.pattern[0] as 'H' | 'T'
    const nearMiss = automaton.overlapHighlights[0]
    if (!nearMiss) {
      setPhase('done')
      return
    }
    setStream([
      { on: advanceOn, key: 'r0' },
      { on: nearMiss.on, key: 'r1' },
    ])
    applyFlip(nearMiss.from, nearMiss.on, 'Replay')
    setAnnounce(replayAnnotation(nearMiss))
    setPhase('done')
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
    if (split) {
      primaryLabel = 'Step'
      onPrimary = stepReplay
    } else {
      primaryLabel = 'Replaying…'
      primaryEnabled = false
      onPrimary = () => {}
    }
  } else {
    primaryLabel = isLast ? 'Finish' : 'Continue'
    onPrimary = onAdvance
  }

  const secondary =
    (phase === 'free' && gated) || phase === 'done'
      ? { label: 'Flip', onClick: flipOnce }
      : undefined

  // Track A dims the stream while the replay/near-miss is the focus.
  const dimStream = split && (phase === 'replaying' || phase === 'done')

  return (
    <BeatShell
      primary={{ label: primaryLabel, enabled: primaryEnabled, onClick: onPrimary }}
      secondary={secondary}
    >
      <div className={`coinsim${dimStream ? ' coinsim--focus' : ''}`}>
        <div className="canvas-frame" ref={boxRef}>
          {width > 0 && (
            <StateGraph
              automaton={automaton}
              width={width}
              height={stageH}
              activeState={state}
              activeEdge={activeEdge}
              reducedMotion={reducedMotion}
              pulseKey={pulseKey}
              labelMode={split ? 'dual' : 'prefix'}
            />
          )}
        </div>
        <p className="coinsim__legend">
          <span className="coinsim__legend-item">circle = state</span>
          <span className="coinsim__legend-item">
            arrow = a flip (<span className="coin coin--H coin--inline">H</span> gold,{' '}
            <span className="coin coin--T coin--inline">T</span> teal)
          </span>
          <span className="coinsim__legend-item">ringed = done</span>
        </p>
        {split ? (
          <div
            className={
              dimStream ? 'coinsim__stream coinsim__stream--dim' : 'coinsim__stream'
            }
          >
            <CoinStream
              flips={stream}
              stateLabel={labelOf(automaton, state)}
              announce={announce}
            />
          </div>
        ) : (
          <CoinStream
            flips={stream}
            stateLabel={labelOf(automaton, state)}
            announce={announce}
          />
        )}
        {phase === 'free' && !gated && (
          <p className="hint-note">
            Flip a few times — watch the active state chip after each flip.
          </p>
        )}
        {gambler && (
          <p className="hint-note hint-note--mark" role="status" aria-live="polite">
            {gambler}
          </p>
        )}
        {annotationDone && <p className="hint-note hint-note--mark">{announce}</p>}
      </div>
    </BeatShell>
  )
}
