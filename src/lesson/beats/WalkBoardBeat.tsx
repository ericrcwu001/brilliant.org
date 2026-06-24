// L3 Gambler's Ruin hero (build-brief §6, BESPOKE — StateGraph can't express the
// money↔P_i/D_i dual-label). A 1-D lattice between walls 0 (ruin) and N (win);
// exact reach/ruin/duration from buildWalk (a WalkModel, not an Automaton); a
// slow-first single walk then a batched swarm tally; optional bias/start steppers
// (tap-only, "commit on tap"); a `display:'landscape'` reach-curve that warps
// with bias. The plain structural number leads; reduced motion + aria-live render
// the final frame. SVG (static) — no per-frame React state.

import { useMemo, useState } from 'react'
import type { BeatProps } from './types'
import type { Rational } from '../../engine/types'
import { BeatShell } from '../BeatShell'
import { buildWalk, simulateWalk, batchWalkStats } from '../../engine/walk'
import { mulberry32 } from '../../engine/simulate'
import { C } from '../konva/theme'

const ratStr = (r: Rational) => (r.d === 1 ? `${r.n}` : `${r.n}/${r.d}`)
const W = 320
const H = 90

export function WalkBoardBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion } = props
  const init = beat.interaction
  const [pPct, setPPct] = useState(
    init.type === 'walkBoard' ? Math.round((init.p ?? 0.5) * 100) : 50,
  )
  const [start, setStart] = useState(init.type === 'walkBoard' ? (init.start ?? 2) : 2)
  const [single, setSingle] = useState<{ end: 'ruin' | 'win'; steps: number } | null>(null)
  const [batch, setBatch] = useState<{ ruin: number; win: number; meanSteps: number } | null>(
    null,
  )
  const [runs, setRuns] = useState(0)

  const N = init.type === 'walkBoard' ? (init.n ?? 4) : 4
  const p = pPct / 100
  const interactive = init.type === 'walkBoard' ? !!init.interactive : false
  const display = init.type === 'walkBoard' ? init.display : undefined
  const model = useMemo(() => buildWalk(N, p), [N, p])

  if (beat.interaction.type !== 'walkBoard') return null

  const reach = model.reachProb[start]
  const ruin = model.ruinProb[start]
  const dur = model.duration[start]
  const xFor = (i: number) => 20 + (i / N) * (W - 40)

  const readout =
    beat.hero?.structuralReadout ??
    `From $${start}: reach $${N} with probability ${ratStr(reach)}; about ${ratStr(dur)} flips.`

  function runBatch() {
    setBatch(batchWalkStats(start, N, p, mulberry32(0x5eed + runs), 200))
    setRuns((r) => r + 1)
  }

  return (
    <BeatShell
      primary={{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }}
      secondary={{
        label: 'Watch one walk',
        onClick: () => setSingle(simulateWalk(start, N, p, mulberry32(0xa11ce + runs))),
      }}
      tertiary={{ label: batch ? 'Run 200 more' : 'Run 200 walks', onClick: runBatch }}
    >
      <div className="walkboard">
        <p className="walkboard__readout" role="status" aria-live="polite">
          {readout}
        </p>

        {/* Number line with dual labels: money $i and the reach prob P_i. */}
        <svg className="walkboard__svg" viewBox={`0 0 ${W} ${H}`} role="img"
          aria-label={`Walk from 0 to ${N}, start at ${start}`}>
          <line x1={xFor(0)} y1={40} x2={xFor(N)} y2={40} stroke={C.rule} strokeWidth={2} />
          {Array.from({ length: N + 1 }, (_, i) => (
            <g key={i}>
              <circle
                cx={xFor(i)}
                cy={40}
                r={i === 0 || i === N ? 9 : 7}
                fill={i === start ? C.quill : i === 0 ? C.ruinTint : i === N ? C.winTint : C.paper2}
                stroke={i === 0 ? C.ruin : i === N ? C.win : C.rule}
                strokeWidth={1.5}
              />
              <text x={xFor(i)} y={24} textAnchor="middle" fontSize={10} fill={C.graphite}>
                ${i}
              </text>
              <text x={xFor(i)} y={62} textAnchor="middle" fontSize={9} fill={C.graphiteSoft}>
                {ratStr(model.reachProb[i])}
              </text>
            </g>
          ))}
          <text x={xFor(0)} y={78} textAnchor="middle" fontSize={9} fill={C.ruin}>
            ruin
          </text>
          <text x={xFor(N)} y={78} textAnchor="middle" fontSize={9} fill={C.win}>
            win
          </text>
        </svg>
        <p className="walkboard__duallabel">
          top row = money $i · bottom row = P<sub>i</sub> (chance you reach ${N})
        </p>

        {interactive && (
          <div className="walkboard__controls">
            <div className="walkboard__stepper">
              <span>Start ${start}</span>
              <button type="button" onClick={() => setStart((s) => Math.max(1, s - 1))}
                aria-label="Lower start">−</button>
              <button type="button" onClick={() => setStart((s) => Math.min(N - 1, s + 1))}
                aria-label="Raise start">+</button>
            </div>
            <div className="walkboard__stepper">
              <span>P(heads) {p.toFixed(2)}</span>
              <button type="button" onClick={() => setPPct((v) => Math.max(20, v - 5))}
                aria-label="Lower bias">−</button>
              <button type="button" onClick={() => setPPct((v) => Math.min(80, v + 5))}
                aria-label="Raise bias">+</button>
            </div>
          </div>
        )}

        <p className="walkboard__exact">
          reach ${N}: <strong>{ratStr(reach)}</strong> · ruin: <strong>{ratStr(ruin)}</strong> ·
          avg flips: <strong>{ratStr(dur)}</strong>
        </p>

        {single && (
          <p className="walkboard__single">
            That walk ended in <strong>{single.end}</strong> after {single.steps} flips.
          </p>
        )}
        {batch && (
          <p className="walkboard__batch" aria-live="polite">
            Of 200 walks: <strong>{batch.win} reached ${N}</strong>, {batch.ruin} went broke; mean{' '}
            {batch.meanSteps.toFixed(1)} flips.
            {!reducedMotion && ' "Average ≠ typical": most walks are short, a few run long.'}
          </p>
        )}

        {display === 'landscape' && (
          <svg className="walkboard__landscape" viewBox={`0 0 ${W} ${H}`} role="img"
            aria-label="Reach-probability curve across starting money">
            <polyline
              fill="none"
              stroke={C.quill}
              strokeWidth={2}
              points={model.reachProb
                .map((r, i) => `${xFor(i)},${78 - (r.n / r.d) * 56}`)
                .join(' ')}
            />
            <line x1={xFor(0)} y1={78} x2={xFor(N)} y2={78} stroke={C.rule} strokeWidth={1} />
          </svg>
        )}
      </div>
    </BeatShell>
  )
}
