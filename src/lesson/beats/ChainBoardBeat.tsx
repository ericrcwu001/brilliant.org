// Markov-chain board renderer. Dispatches by `display` to five sub-views:
// diagram (graph + token sim), matrix (P grid), powers (Pⁿ grid), distribution
// (evolving bars), stationary (πP=π bars / PageRank / detailed balance).
// Graded iff beat.hero is ABSENT; hero iff beat.hero is PRESENT.
// All engine calls via src/engine/markov.ts — never hardcode a number.

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import {
  matrixPower,
  classifyStates,
  absorptionProbabilities,
  expectedAbsorptionTime,
  stationaryDistribution,
  detailedBalance,
  pagerank,
  simulateChain,
  formatRational,
  formatVector,
} from '../../engine/markov'
import type { Rational } from '../../engine/types'
import { ChainGraph } from '../konva/ChainGraph'
import { chapterColor } from '../chapters'

type ChainIx = Extract<BeatProps['beat']['interaction'], { type: 'chainBoard' }>

const GRAPH_W = 320
const GRAPH_H = 160

// ── Utility: argmax over a Rational array (EXACT — no floats on a graded path) ─
function argmax(v: Rational[]): number {
  let best = 0
  for (let i = 1; i < v.length; i++) {
    // v[i] > v[best]  ⇔  v[i].n·v[best].d > v[best].n·v[i].d  (exact cross-multiply)
    if (v[i].n * v[best].d > v[best].n * v[i].d) best = i
  }
  return best
}

// ── Shared percent helper (bar widths only) ───────────────────────────────────
function pct(r: Rational): number {
  return r.d === 0 ? 0 : Math.min(100, Math.round((r.n / r.d) * 100))
}

// ── DiagramDisplay ────────────────────────────────────────────────────────────
function DiagramDisplay({
  ix,
  beat,
  isLast,
  onAdvance,
  reducedMotion,
  props,
}: {
  ix: ChainIx
  beat: BeatProps['beat']
  isLast: boolean
  onAdvance: () => void
  reducedMotion: boolean
  props: BeatProps
}) {
  // Hero sim state — token walk
  const [simPath, setSimPath] = useState<number[]>([])
  const [simStep, setSimStep] = useState(0)
  const [pulseKey, setPulseKey] = useState(0)

  // Graded state (unconditional hooks)
  const [tappedEdge, setTappedEdge] = useState<{ from: number; to: number } | null>(null)
  const [nodeClass, setNodeClass] = useState<Record<number, string>>({})
  const [tappedNode, setTappedNode] = useState<number | null>(null)
  const [solved, setSolved] = useState(false)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, props.pattern),
    required: beat.required,
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: props.reportNeedsReview,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: { lessonId: props.lessonId, beatId: beat.beatId },
  })

  const accent = chapterColor(props.lessonId)
  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed

  // ── Hero path ──────────────────────────────────────────────────────────────
  if (beat.hero) {
    const started = simPath.length > 0
    const done = started && simStep >= simPath.length - 1
    const displayState = reducedMotion
      ? (ix.start ?? 0)
      : started ? simPath[simStep] : null

    function stepToken() {
      if (!started) {
        const p = simulateChain(ix.matrix, ix.start ?? 0, 8)
        setSimPath(p)
        setSimStep(0)
        setPulseKey((k) => k + 1)
      } else if (!done) {
        setSimStep((s) => s + 1)
        setPulseKey((k) => k + 1)
      }
    }

    const ariaStatus = started
      ? `Token at ${ix.labels[simPath[simStep]]}`
      : 'Tap Step to start the walk.'

    return (
      <BeatShell
        primary={{
          label: isLast ? 'Finish' : 'Continue',
          enabled: done || reducedMotion,
          onClick: onAdvance,
        }}
        secondary={
          !done
            ? {
                label: started ? 'Step →' : 'Start',
                onClick: stepToken,
              }
            : undefined
        }
      >
        <div className="chainboard-diagram">
          <p className="sr-only">{beat.hero.structuralReadout}</p>
          <ChainGraph
            matrix={ix.matrix}
            labels={ix.labels}
            width={GRAPH_W}
            height={GRAPH_H}
            absorbing={ix.absorbing}
            activeState={displayState}
            reducedMotion={reducedMotion}
            pulseKey={pulseKey}
            accent={accent}
          />
          <p role="status" aria-live="polite" className="sr-only">
            {ariaStatus}
          </p>
        </div>
      </BeatShell>
    )
  }

  // ── Graded path ────────────────────────────────────────────────────────────
  const { task, cell, absorbing: absorbingStates, damping } = ix
  const defaultDamping: Rational = damping ?? { n: 85, d: 100 }

  function check() {
    let correct = false
    if (task === 'entry' && cell && tappedEdge) {
      correct = tappedEdge.from === cell.row && tappedEdge.to === cell.col
    } else if (task === 'classify') {
      const classes = classifyStates(ix.matrix)
      correct = classes.every((sc) => nodeClass[sc.index] === sc.kind)
    } else if (task === 'pagerank') {
      const pr = pagerank(ix.matrix, defaultDamping)
      correct = tappedNode !== null && tappedNode === argmax(pr)
    }
    if (correct) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      ladder.submitWrong()
    }
  }

  function resetManipulation() {
    ladder.tryAgain()
    setTappedEdge(null)
    setNodeClass({})
    setTappedNode(null)
    setSolved(false)
  }

  // Has the learner made a manipulation?
  const interacted =
    tappedEdge !== null ||
    tappedNode !== null ||
    Object.keys(nodeClass).length > 0

  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: interacted, onClick: check }

  // Build aria status
  let ariaStatus = ''
  if (task === 'classify') {
    ariaStatus = ix.labels
      .map((lbl, i) => `${lbl}: ${nodeClass[i] ?? 'unclassified'}`)
      .join(', ')
  } else if (task === 'entry' && tappedEdge) {
    const val = matrixPower(ix.matrix, ix.step ?? 1)[tappedEdge.from][tappedEdge.to]
    ariaStatus = `Selected edge ${ix.labels[tappedEdge.from]}→${ix.labels[tappedEdge.to]}: ${formatRational(val)}`
  } else if (task === 'pagerank' && tappedNode !== null) {
    ariaStatus = `Selected node ${ix.labels[tappedNode]}`
  }

  // Render graded task controls
  let taskControls: React.ReactNode = null

  if (task === 'classify') {
    const classifyResult = classifyStates(ix.matrix)
    taskControls = (
      <div className="chainboard-classify">
        <p className="chainboard-classify__prompt">Classify each state:</p>
        {ix.labels.map((lbl, i) => {
          const sc = classifyResult.find((c) => c.index === i)
          const kinds: Array<'recurrent' | 'transient' | 'absorbing'> = [
            'recurrent', 'transient', 'absorbing',
          ]
          return (
            <div key={i} className="chainboard-classify__row">
              <span className="chainboard-classify__label">{lbl}</span>
              {kinds.map((k) => {
                const isCorrect = solved || revealed
                  ? sc?.kind === k
                  : undefined
                return (
                  <button
                    key={k}
                    type="button"
                    className={
                      'chainboard-chip' +
                      (nodeClass[i] === k ? ' chainboard-chip--active' : '') +
                      (isCorrect === true ? ' chainboard-chip--correct' : '') +
                      (isCorrect === false && nodeClass[i] === k ? ' chainboard-chip--wrong' : '')
                    }
                    aria-pressed={nodeClass[i] === k}
                    disabled={solved || revealed}
                    onClick={() => {
                      setNodeClass((prev) => ({ ...prev, [i]: k }))
                      ladder.clear()
                    }}
                    style={{ minHeight: '44px', minWidth: '44px' }}
                  >
                    {k.charAt(0).toUpperCase()}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  } else if (task === 'entry') {
    // Tap the edge corresponding to cell
    taskControls = (
      <div className="chainboard-edges">
        <p className="chainboard-edges__prompt">Tap the edge to read:</p>
        {ix.matrix.flatMap((row, i) =>
          row
            .map((cell_val, j) => {
              if (cell_val.n === 0) return null
              const lbl = `${ix.labels[i]}→${ix.labels[j]}`
              const isSelected =
                tappedEdge?.from === i && tappedEdge?.to === j
              return (
                <button
                  key={`${i}-${j}`}
                  type="button"
                  className={
                    'chainboard-edge-btn' +
                    (isSelected ? ' chainboard-edge-btn--active' : '')
                  }
                  aria-pressed={isSelected}
                  disabled={solved || revealed}
                  onClick={() => {
                    setTappedEdge({ from: i, to: j })
                    ladder.clear()
                  }}
                  style={{ minHeight: '44px' }}
                >
                  {lbl}: {formatRational(matrixPower(ix.matrix, ix.step ?? 1)[i][j])}
                </button>
              )
            })
            .filter(Boolean),
        )}
      </div>
    )
  } else if (task === 'pagerank') {
    const pr = pagerank(ix.matrix, defaultDamping)
    taskControls = (
      <div className="chainboard-nodes">
        <p className="chainboard-nodes__prompt">Tap the highest-ranked node:</p>
        {ix.labels.map((lbl, i) => (
          <button
            key={i}
            type="button"
            className={
              'chainboard-node-btn' +
              (tappedNode === i ? ' chainboard-node-btn--active' : '')
            }
            aria-pressed={tappedNode === i}
            disabled={solved || revealed}
            onClick={() => {
              setTappedNode(i)
              ladder.clear()
            }}
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            {lbl}: {formatRational(pr[i])}
          </button>
        ))}
      </div>
    )
  }

  return (
    <BeatShell
      primary={primary}
      feedback={ladder.view}
      onTryAgain={revealed ? resetManipulation : undefined}
    >
      <div className="chainboard-diagram">
        <ChainGraph
          matrix={ix.matrix}
          labels={ix.labels}
          width={GRAPH_W}
          height={GRAPH_H}
          absorbing={absorbingStates}
          activeState={null}
          reducedMotion={reducedMotion}
          accent={accent}
        />
        {taskControls}
        <p role="status" aria-live="polite" className="sr-only">
          {ariaStatus}
        </p>
      </div>
    </BeatShell>
  )
}

// ── MatrixDisplay ─────────────────────────────────────────────────────────────
function MatrixDisplay({
  ix,
  beat,
  isLast,
  onAdvance,
  props,
}: {
  ix: ChainIx
  beat: BeatProps['beat']
  isLast: boolean
  onAdvance: () => void
  props: BeatProps
}) {
  const [solved, setSolved] = useState(false)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, props.pattern),
    required: beat.required,
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: props.reportNeedsReview,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: { lessonId: props.lessonId, beatId: beat.beatId },
  })

  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed
  const absorbingStates = ix.absorbing ?? []
  const hasAbsorption = ix.task === 'absorption' && absorbingStates.length > 0

  // Compute absorption if relevant
  const absProbs = hasAbsorption
    ? absorptionProbabilities(ix.matrix, absorbingStates)
    : null
  const absTime = hasAbsorption
    ? expectedAbsorptionTime(ix.matrix, absorbingStates)
    : null

  // For graded absorption, we just auto-check (read-only display; grading is
  // implicit — learner reads the computed value and presses Check).
  const [checked, setChecked] = useState(false)

  function check() {
    setChecked(true)
    // Absorption display is a read/verify task — learner sees the solution
    // computed by the engine and confirms understanding.
    ladder.submitCorrect()
    setSolved(true)
  }

  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : beat.hero
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: !checked, onClick: check }

  const n = ix.labels.length
  const ariaStatus = `Transition matrix for ${ix.labels.join(', ')}`

  return (
    <BeatShell
      primary={primary}
      feedback={!beat.hero ? ladder.view : undefined}
      onTryAgain={revealed ? () => { ladder.tryAgain(); setSolved(false); setChecked(false) } : undefined}
    >
      <div className="chainboard-matrix">
        {beat.hero && <p className="sr-only">{beat.hero.structuralReadout}</p>}
        <div className="chainboard-matrix__wrap" role="region" aria-label="Transition matrix P">
          <table className="chainboard-matrix__table">
            <thead>
              <tr>
                <th />
                {ix.labels.map((lbl) => (
                  <th key={lbl} className="chainboard-matrix__hdr">{lbl}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ix.matrix.map((row, i) => (
                <tr key={i}>
                  <th scope="row" className="chainboard-matrix__hdr">{ix.labels[i]}</th>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={
                        'chainboard-matrix__cell' +
                        (absorbingStates.includes(i) || absorbingStates.includes(j)
                          ? ' chainboard-matrix__cell--absorbing'
                          : '')
                      }
                      style={{ minHeight: '44px', minWidth: '44px' }}
                    >
                      {formatRational(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasAbsorption && absProbs && absTime && (
          <div className="chainboard-absorption">
            <p className="chainboard-absorption__title">Absorption probabilities (B = (I−Q)⁻¹R):</p>
            <table className="chainboard-matrix__table" aria-label="Absorption probabilities">
              <thead>
                <tr>
                  <th />
                  {absorbingStates.map((ai) => (
                    <th key={ai} className="chainboard-matrix__hdr">{ix.labels[ai]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {absProbs.map((row, ti) => {
                  const transientIdx = Array.from(
                    { length: n },
                    (_, k) => k,
                  ).filter((k) => !absorbingStates.includes(k))[ti]
                  return (
                    <tr key={ti}>
                      <th scope="row" className="chainboard-matrix__hdr">
                        {ix.labels[transientIdx]}
                      </th>
                      {row.map((cell, j) => (
                        <td key={j} className="chainboard-matrix__cell" style={{ minHeight: '44px', minWidth: '44px' }}>
                          {formatRational(cell)}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="chainboard-absorption__times">
              Expected absorption time:{' '}
              {absTime.map((t, ti) => {
                const transientIdx = Array.from(
                  { length: n },
                  (_, k) => k,
                ).filter((k) => !absorbingStates.includes(k))[ti]
                return `${ix.labels[transientIdx]}: ${formatRational(t)}`
              }).join(' · ')}
            </p>
          </div>
        )}

        <p role="status" aria-live="polite" className="sr-only">
          {ariaStatus}
        </p>
      </div>
    </BeatShell>
  )
}

// ── PowersDisplay ─────────────────────────────────────────────────────────────
function PowersDisplay({
  ix,
  beat,
  isLast,
  onAdvance,
  props,
}: {
  ix: ChainIx
  beat: BeatProps['beat']
  isLast: boolean
  onAdvance: () => void
  props: BeatProps
}) {
  const [solved, setSolved] = useState(false)
  const [tappedCell, setTappedCell] = useState<{ row: number; col: number } | null>(null)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, props.pattern),
    required: beat.required,
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: props.reportNeedsReview,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: { lessonId: props.lessonId, beatId: beat.beatId },
  })

  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed
  const step = ix.step ?? 1
  const Pn = matrixPower(ix.matrix, step)
  const { cell } = ix

  function check() {
    if (!tappedCell || !cell) return
    const correct = tappedCell.row === cell.row && tappedCell.col === cell.col
    if (correct) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      ladder.submitWrong()
    }
  }

  const interacted = tappedCell !== null
  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : beat.hero
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: interacted, onClick: check }

  const highlightCell =
    solved || revealed ? cell : tappedCell

  const ariaStatus = cell
    ? `P^${step}[${ix.labels[cell.row]}][${ix.labels[cell.col]}] = ${formatRational(Pn[cell.row][cell.col])}`
    : `P^${step}: ${formatVector(Pn[0])}`

  return (
    <BeatShell
      primary={primary}
      feedback={!beat.hero ? ladder.view : undefined}
      onTryAgain={
        revealed
          ? () => {
              ladder.tryAgain()
              setSolved(false)
              setTappedCell(null)
            }
          : undefined
      }
    >
      <div className="chainboard-powers">
        {beat.hero && <p className="sr-only">{beat.hero.structuralReadout}</p>}
        <p className="chainboard-powers__step">P<sup>{step}</sup></p>
        <div className="chainboard-matrix__wrap" role="region" aria-label={`P to the power ${step}`}>
          <table className="chainboard-matrix__table">
            <thead>
              <tr>
                <th />
                {ix.labels.map((lbl) => (
                  <th key={lbl} className="chainboard-matrix__hdr">{lbl}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Pn.map((row, i) => (
                <tr key={i}>
                  <th scope="row" className="chainboard-matrix__hdr">{ix.labels[i]}</th>
                  {row.map((cellVal, j) => {
                    const isHighlit =
                      highlightCell?.row === i && highlightCell?.col === j
                    const isCellTarget =
                      !beat.hero && ix.task === 'entry' && cell?.row === i && cell?.col === j
                    return (
                      <td
                        key={j}
                        className={
                          'chainboard-matrix__cell' +
                          (isHighlit ? ' chainboard-matrix__cell--highlighted' : '') +
                          (solved && isCellTarget ? ' chainboard-matrix__cell--correct' : '')
                        }
                        style={{ minHeight: '44px', minWidth: '44px' }}
                      >
                        {!beat.hero && ix.task === 'entry' ? (
                          <button
                            type="button"
                            className="chainboard-cell-btn"
                            aria-pressed={tappedCell?.row === i && tappedCell?.col === j}
                            disabled={solved || revealed}
                            onClick={() => {
                              setTappedCell({ row: i, col: j })
                              ladder.clear()
                            }}
                            style={{ minHeight: '44px', minWidth: '44px' }}
                          >
                            {formatRational(cellVal)}
                          </button>
                        ) : (
                          formatRational(cellVal)
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {ariaStatus}
        </p>
      </div>
    </BeatShell>
  )
}

// ── DistributionDisplay ───────────────────────────────────────────────────────
function DistributionDisplay({
  ix,
  beat,
  isLast,
  onAdvance,
  reducedMotion,
  props,
}: {
  ix: ChainIx
  beat: BeatProps['beat']
  isLast: boolean
  onAdvance: () => void
  reducedMotion: boolean
  props: BeatProps
}) {
  const [solved, setSolved] = useState(false)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, props.pattern),
    required: beat.required,
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: props.reportNeedsReview,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: { lessonId: props.lessonId, beatId: beat.beatId },
  })

  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed
  const startState = ix.start ?? 0
  const step = ix.step ?? 4

  // Row `startState` of Pⁿ is the distribution after `step` steps from that state.
  const evolvedDist = reducedMotion
    ? stationaryDistribution(ix.matrix)
    : matrixPower(ix.matrix, step)[startState]

  const stationary = stationaryDistribution(ix.matrix)

  const ariaStatus = `Distribution after ${step} steps: ${formatVector(evolvedDist)}`

  // For graded 'stationary', just check = correct (read-only verify)
  function check() {
    ladder.submitCorrect()
    setSolved(true)
  }

  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : beat.hero
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: true, onClick: check }

  return (
    <BeatShell
      primary={primary}
      feedback={!beat.hero ? ladder.view : undefined}
      onTryAgain={
        revealed
          ? () => {
              ladder.tryAgain()
              setSolved(false)
            }
          : undefined
      }
    >
      <div className="chainboard-dist">
        {beat.hero && <p className="sr-only">{beat.hero.structuralReadout}</p>}
        <p className="chainboard-dist__subtitle">
          Distribution after {reducedMotion ? '∞' : step} steps (starting from{' '}
          {ix.labels[startState]}):
        </p>
        {evolvedDist.map((r, i) => (
          <div key={i} className="chainboard-dist__row">
            <span className="chainboard-dist__label">{ix.labels[i]}</span>
            <div className="chainboard-dist__track">
              <div
                className="chainboard-dist__fill"
                style={{
                  width: `${pct(r)}%`,
                  transition: reducedMotion ? 'none' : 'width 0.4s ease',
                }}
                aria-hidden="true"
              />
            </div>
            <span className="chainboard-dist__value">{formatRational(r)}</span>
          </div>
        ))}
        <p className="chainboard-dist__subtitle chainboard-dist__subtitle--secondary">
          Stationary: {formatVector(stationary)}
        </p>
        <p role="status" aria-live="polite" className="sr-only">
          {ariaStatus}
        </p>
      </div>
    </BeatShell>
  )
}

// ── StationaryDisplay ─────────────────────────────────────────────────────────
function StationaryDisplay({
  ix,
  beat,
  isLast,
  onAdvance,
  reducedMotion,
  props,
}: {
  ix: ChainIx
  beat: BeatProps['beat']
  isLast: boolean
  onAdvance: () => void
  reducedMotion: boolean
  props: BeatProps
}) {
  const defaultDamping: Rational = ix.damping ?? { n: 85, d: 100 }
  const [dampingPct, setDampingPct] = useState(
    Math.round((defaultDamping.n / defaultDamping.d) * 100),
  )
  const [solved, setSolved] = useState(false)
  const [tappedUnique, setTappedUnique] = useState<boolean | null>(null)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, props.pattern),
    required: beat.required,
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: props.reportNeedsReview,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: { lessonId: props.lessonId, beatId: beat.beatId },
  })

  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed

  const liveDamping: Rational = { n: dampingPct, d: 100 }
  const isPageRank = ix.task === 'pagerank'
  const isBalance = ix.task === 'balance'

  const bars = isPageRank
    ? pagerank(ix.matrix, liveDamping)
    : stationaryDistribution(ix.matrix)

  // Only meaningful for the balance task; skip on PageRank link matrices (which
  // may be sub-stochastic/dangling, where stationaryDistribution is undefined).
  const balance = isBalance ? detailedBalance(ix.matrix) : null
  const reversible = balance?.reversible ?? false
  const pi = balance?.pi ?? []
  const ariaStatus = isPageRank
    ? `PageRank (d=${dampingPct}%): ${formatVector(bars)}`
    : isBalance
    ? `Stationary: ${formatVector(pi)}. Reversible: ${reversible}.`
    : `Stationary distribution: ${formatVector(bars)}`

  function check() {
    const correct = isBalance
      ? (tappedUnique !== null
          ? tappedUnique === reversible
          : ix.headline === 'unique' ? reversible : !reversible)
      : isPageRank
      ? (tappedUnique !== null && tappedUnique === (ix.headline === 'unique'))
      : true
    if (correct) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      ladder.submitWrong()
    }
  }

  const interacted = tappedUnique !== null || (!isBalance && !isPageRank)
  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : beat.hero
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: interacted, onClick: check }

  return (
    <BeatShell
      primary={primary}
      feedback={!beat.hero ? ladder.view : undefined}
      onTryAgain={
        revealed
          ? () => {
              ladder.tryAgain()
              setSolved(false)
              setTappedUnique(null)
            }
          : undefined
      }
    >
      <div className="chainboard-stationary">
        {beat.hero && <p className="sr-only">{beat.hero.structuralReadout}</p>}

        {isPageRank && beat.hero && (
          <label className="chainboard-stationary__damping-label">
            <span>Damping d = {dampingPct}%</span>
            <input
              type="range"
              className="chainboard-stationary__range"
              min={1}
              max={99}
              value={dampingPct}
              onChange={(e) => setDampingPct(Number(e.target.value))}
              aria-label={`Damping factor: ${dampingPct}%`}
              style={{ minHeight: '44px' }}
            />
          </label>
        )}

        <p className="chainboard-stationary__subtitle">
          {isPageRank ? `PageRank (d = ${dampingPct}%)` : 'Stationary distribution π'}
        </p>

        {bars.map((r, i) => (
          <div key={i} className="chainboard-stationary__row">
            <span className="chainboard-stationary__label">{ix.labels[i]}</span>
            <div className="chainboard-stationary__track">
              <div
                className="chainboard-stationary__fill"
                style={{
                  width: `${pct(r)}%`,
                  transition: reducedMotion ? 'none' : 'width 0.4s ease',
                }}
                aria-hidden="true"
              />
            </div>
            <span className="chainboard-stationary__value">{formatRational(r)}</span>
          </div>
        ))}

        {isBalance && (
          <div className="chainboard-balance">
            <p className="chainboard-balance__result">
              Detailed balance: <strong>{reversible ? 'holds' : 'fails'}</strong>
              {' '}— chain is <strong>{reversible ? 'reversible' : 'irreversible'}</strong>
            </p>
          </div>
        )}

        {!beat.hero && (isBalance || isPageRank) && (
          <div className="chainboard-chips" role="group" aria-label="Is the answer unique?">
            {(['unique', 'not unique'] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                className={
                  'chainboard-chip' +
                  (tappedUnique === (choice === 'unique') ? ' chainboard-chip--active' : '')
                }
                aria-pressed={tappedUnique === (choice === 'unique')}
                disabled={solved || revealed}
                onClick={() => {
                  setTappedUnique(choice === 'unique')
                  ladder.clear()
                }}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {choice}
              </button>
            ))}
          </div>
        )}

        <p role="status" aria-live="polite" className="sr-only">
          {ariaStatus}
        </p>
      </div>
    </BeatShell>
  )
}

// ── Public entry point ────────────────────────────────────────────────────────
export function ChainBoardBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion } = props
  if (beat.interaction.type !== 'chainBoard') return null
  const ix = beat.interaction

  if (ix.display === 'diagram') {
    return (
      <DiagramDisplay
        ix={ix}
        beat={beat}
        isLast={isLast}
        onAdvance={onAdvance}
        reducedMotion={reducedMotion}
        props={props}
      />
    )
  }
  if (ix.display === 'matrix') {
    return (
      <MatrixDisplay
        ix={ix}
        beat={beat}
        isLast={isLast}
        onAdvance={onAdvance}
        props={props}
      />
    )
  }
  if (ix.display === 'powers') {
    return (
      <PowersDisplay
        ix={ix}
        beat={beat}
        isLast={isLast}
        onAdvance={onAdvance}
        props={props}
      />
    )
  }
  if (ix.display === 'distribution') {
    return (
      <DistributionDisplay
        ix={ix}
        beat={beat}
        isLast={isLast}
        onAdvance={onAdvance}
        reducedMotion={reducedMotion}
        props={props}
      />
    )
  }
  return (
    <StationaryDisplay
      ix={ix}
      beat={beat}
      isLast={isLast}
      onAdvance={onAdvance}
      reducedMotion={reducedMotion}
      props={props}
    />
  )
}
