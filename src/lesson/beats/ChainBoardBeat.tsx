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
import { ratAdd } from '../../engine/automaton'
import { ChainGraph } from '../konva/ChainGraph'
import { chapterColor } from '../chapters'
import {
  parseFrac,
  isChainBoardCorrect,
} from '../grading'

type ChainIx = Extract<BeatProps['beat']['interaction'], { type: 'chainBoard' }>

const GRAPH_W = 320
const GRAPH_H = 160

// ── Module-level helpers (re-exported for back-compat with existing tests) ────
// These live in grading.ts; re-exported here so test imports keep working.
// eslint-disable-next-line react-refresh/only-export-components
export { parseFrac, argmax, returnProbability, periodicVerdict } from '../grading'

// ── Shared percent helper (bar widths only) ───────────────────────────────────
function pct(r: Rational): number {
  return r.d === 0 ? 0 : Math.min(100, Math.round((r.n / r.d) * 100))
}

// Local eqRat used by MatrixDisplay build grading via isChainBoardCorrect.
const eqRat = (a: Rational, b: Rational) => a.n * b.d === b.n * a.d

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
  const [absInput, setAbsInput] = useState('')
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
  const P = ix.matrix.map((r) => r.cells)

  // ── Hero path ──────────────────────────────────────────────────────────────
  if (beat.hero) {
    const started = simPath.length > 0
    const done = started && simStep >= simPath.length - 1
    const displayState = reducedMotion
      ? (ix.start ?? 0)
      : started ? simPath[simStep] : null

    function stepToken() {
      if (!started) {
        const p = simulateChain(P, ix.start ?? 0, 8)
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
            matrix={P}
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
  const { task, cell, absorbing: absorbingStates } = ix

  function check() {
    let correct = false
    if (task === 'entry' && cell && tappedEdge) {
      correct = isChainBoardCorrect(beat, { kind: 'edge', from: tappedEdge.from, to: tappedEdge.to })
    } else if (task === 'classify') {
      correct = isChainBoardCorrect(beat, { kind: 'nodeClasses', classes: nodeClass })
    } else if (task === 'pagerank') {
      correct = tappedNode !== null && isChainBoardCorrect(beat, { kind: 'node', index: tappedNode })
    } else if (task === 'absorption') {
      correct = isChainBoardCorrect(beat, { kind: 'text', value: absInput })
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
    setAbsInput('')
    setSolved(false)
  }

  // Has the learner made a manipulation?
  const interacted =
    tappedEdge !== null ||
    tappedNode !== null ||
    Object.keys(nodeClass).length > 0 ||
    absInput.trim() !== ''

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
    const val = matrixPower(P, ix.step ?? 1)[tappedEdge.from][tappedEdge.to]
    ariaStatus = `Selected edge ${ix.labels[tappedEdge.from]}→${ix.labels[tappedEdge.to]}: ${formatRational(val)}`
  } else if (task === 'pagerank' && tappedNode !== null) {
    ariaStatus = `Selected node ${ix.labels[tappedNode]}`
  } else if (task === 'absorption') {
    ariaStatus = 'Enter the probability of ever returning to the home state.'
  }

  // Render graded task controls
  let taskControls: React.ReactNode = null

  if (task === 'classify') {
    const classifyResult = classifyStates(P)
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
        {P.flatMap((row, i) =>
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
                  {lbl}: {formatRational(matrixPower(P, ix.step ?? 1)[i][j])}
                </button>
              )
            })
            .filter(Boolean),
        )}
      </div>
    )
  } else if (task === 'pagerank') {
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
            {lbl}
          </button>
        ))}
      </div>
    )
  } else if (task === 'absorption') {
    const homeLabel = ix.labels[cell?.row ?? 0]
    taskControls = (
      <div className="chainboard-absorb">
        <label className="chainboard-absorb__label">
          <span>P(ever return to {homeLabel}) =</span>
          <input
            type="text"
            className="chainboard-absorb__input"
            value={absInput}
            placeholder="e.g. 1/3"
            disabled={solved || revealed}
            autoComplete="off"
            aria-label={`Probability of ever returning to ${homeLabel}`}
            onChange={(e) => { setAbsInput(e.target.value); ladder.clear() }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !solved && absInput.trim() !== '') { e.preventDefault(); check() }
            }}
            style={{ minHeight: '44px' }}
          />
        </label>
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
          matrix={P}
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
  const [cells, setCells] = useState<Record<string, string>>({})

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
  const P = ix.matrix.map((r) => r.cells)
  const absorbingStates = ix.absorbing ?? []
  const n = ix.labels.length

  // ── Graded BUILD: empty editable cells; Check enabled only when every cell is
  //    filled AND each row sums to 1; grade against the intended P (exact). The
  //    target values are NEVER pre-rendered (cells start empty).
  if (!beat.hero && ix.task === 'build') {
    const parsed: (Rational | null)[][] = P.map((row, i) =>
      row.map((_, j) => {
        const s = cells[`${i}-${j}`]
        return s != null && s.trim() !== '' ? parseFrac(s) : null
      }),
    )
    const rowSums = parsed.map((row) =>
      row.every((c) => c !== null)
        ? row.reduce<Rational>((acc, c) => ratAdd(acc, c as Rational), { n: 0, d: 1 })
        : null,
    )
    const allFilled = parsed.every((row) => row.every((c) => c !== null))
    const allRowsOne = rowSums.every((s) => s !== null && eqRat(s, { n: 1, d: 1 }))
    const canCheck = allFilled && allRowsOne

    const check = () => {
      const correct = isChainBoardCorrect(beat, { kind: 'matrix', cells: parsed })
      if (correct) { ladder.submitCorrect(); setSolved(true) } else { ladder.submitWrong() }
    }

    const primary = solved
      ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
      : { label: 'Check', enabled: canCheck, onClick: check }

    const ariaStatus = solved
      ? 'Matrix built correctly.'
      : allFilled
        ? allRowsOne ? 'Every row sums to 1 — ready to check.' : 'Each row must sum to 1.'
        : 'Fill each cell so every row sums to 1.'

    return (
      <BeatShell
        primary={primary}
        feedback={ladder.view}
        onTryAgain={revealed ? () => { ladder.tryAgain(); setSolved(false); setCells({}) } : undefined}
      >
        <div className="chainboard-matrix">
          <div className="chainboard-matrix__wrap" role="region" aria-label="Build the transition matrix P">
            <table className="chainboard-matrix__table">
              <thead>
                <tr>
                  <th />
                  {ix.labels.map((lbl) => <th key={lbl} className="chainboard-matrix__hdr">{lbl}</th>)}
                  <th className="chainboard-matrix__hdr">Σ</th>
                </tr>
              </thead>
              <tbody>
                {P.map((row, i) => (
                  <tr key={i}>
                    <th scope="row" className="chainboard-matrix__hdr">{ix.labels[i]}</th>
                    {row.map((_, j) => (
                      <td key={j} className="chainboard-matrix__cell">
                        <input
                          type="text"
                          className="chainboard-build__input"
                          value={revealed ? formatRational(P[i][j]) : (cells[`${i}-${j}`] ?? '')}
                          placeholder="n/d"
                          disabled={solved || revealed}
                          autoComplete="off"
                          aria-label={`P from ${ix.labels[i]} to ${ix.labels[j]}`}
                          onChange={(e) => { setCells((p) => ({ ...p, [`${i}-${j}`]: e.target.value })); ladder.clear() }}
                          style={{ minHeight: '44px', minWidth: '56px' }}
                        />
                      </td>
                    ))}
                    <td
                      className={
                        'chainboard-build__rowsum' +
                        (rowSums[i] && eqRat(rowSums[i] as Rational, { n: 1, d: 1 }) ? ' chainboard-build__rowsum--ok' : '')
                      }
                    >
                      {rowSums[i] ? formatRational(rowSums[i] as Rational) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p role="status" aria-live="polite" className="sr-only">{ariaStatus}</p>
        </div>
      </BeatShell>
    )
  }

  // ── Hero / read-only (e.g. L5 solve-matrix: watch Q/R → N → B resolve). Ungraded
  //    "watch it resolve" — primary Continue, NO grading (no auto-pass).
  const hasAbsorption = ix.task === 'absorption' && absorbingStates.length > 0
  const absProbs = hasAbsorption ? absorptionProbabilities(P, absorbingStates) : null
  const absTime = hasAbsorption ? expectedAbsorptionTime(P, absorbingStates) : null
  const ariaStatus = `Transition matrix for ${ix.labels.join(', ')}`

  return (
    <BeatShell primary={{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }}>
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
              {P.map((row, i) => (
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
                  const transientIdx = Array.from({ length: n }, (_, k) => k).filter(
                    (k) => !absorbingStates.includes(k),
                  )[ti]
                  return (
                    <tr key={ti}>
                      <th scope="row" className="chainboard-matrix__hdr">{ix.labels[transientIdx]}</th>
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
                const transientIdx = Array.from({ length: n }, (_, k) => k).filter(
                  (k) => !absorbingStates.includes(k),
                )[ti]
                return `${ix.labels[transientIdx]}: ${formatRational(t)}`
              }).join(' · ')}
            </p>
          </div>
        )}

        <p role="status" aria-live="polite" className="sr-only">{ariaStatus}</p>
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
  const [verdict, setVerdict] = useState<'oscillates' | 'converges' | null>(null)

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
  const P = ix.matrix.map((r) => r.cells)
  const step = ix.step ?? 1
  const Pn = matrixPower(P, step)
  const { cell } = ix

  function check() {
    if (ix.task === 'classify') {
      const correct = verdict !== null && isChainBoardCorrect(beat, { kind: 'verdict', value: verdict })
      if (correct) { ladder.submitCorrect(); setSolved(true) } else { ladder.submitWrong() }
    } else if (tappedCell && cell) {
      const correct = isChainBoardCorrect(beat, { kind: 'cell', row: tappedCell.row, col: tappedCell.col })
      if (correct) { ladder.submitCorrect(); setSolved(true) } else { ladder.submitWrong() }
    }
  }

  const interacted = ix.task === 'classify' ? verdict !== null : tappedCell !== null
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
              setVerdict(null)
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
        {!beat.hero && ix.task === 'classify' && (
          <div className="chainboard-chips" role="group" aria-label="Does Pⁿ converge or oscillate?">
            <p className="chainboard-powers__verdict-prompt">As n grows, does Pⁿ settle to one matrix, or keep flipping?</p>
            {(['converges', 'oscillates'] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={'chainboard-chip' + (verdict === v ? ' chainboard-chip--active' : '')}
                aria-pressed={verdict === v}
                disabled={solved || revealed}
                onClick={() => { setVerdict(v); ladder.clear() }}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {v === 'converges' ? 'Converges to π' : 'Oscillates forever'}
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
  const [shareInput, setShareInput] = useState('')

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
  const P = ix.matrix.map((r) => r.cells)
  const stationary = stationaryDistribution(P)
  const cellRow = ix.cell?.row ?? 0

  // ── Hero path (ungraded — e.g. watch-it-settle) ───────────────────────────
  if (beat.hero) {
    const step = ix.step ?? 8
    const Pn = reducedMotion ? null : matrixPower(P, step)

    return (
      <BeatShell
        primary={{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }}
      >
        <div className="chainboard-dist">
          <p className="sr-only">{beat.hero.structuralReadout}</p>
          {([0, 1] as const).map((startIdx) => {
            if (startIdx >= ix.labels.length) return null
            const rowDist = reducedMotion ? stationary : Pn![startIdx]
            return (
              <div key={startIdx}>
                <p className="chainboard-dist__subtitle">Started {ix.labels[startIdx]}</p>
                {rowDist.map((r, i) => (
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
              </div>
            )
          })}
          <p className="chainboard-dist__subtitle chainboard-dist__subtitle--secondary">
            Stationary: {formatVector(stationary)}
          </p>
          <p role="status" aria-live="polite" className="sr-only">
            {`Both starts converge to: ${formatVector(stationary)}`}
          </p>
        </div>
      </BeatShell>
    )
  }

  // ── Graded path (e.g. read-the-share, approach-pi) ───────────────────────
  const target = formatRational(stationary[cellRow])

  function check() {
    const correct = isChainBoardCorrect(beat, { kind: 'text', value: shareInput })
    if (correct) { ladder.submitCorrect(); setSolved(true) } else { ladder.submitWrong() }
  }

  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: shareInput.trim() !== '', onClick: check }

  const ariaStatus = solved
    ? `${ix.labels[cellRow]} settles at ${target}`
    : `Read the settled ${ix.labels[cellRow]} bar and enter its long-run share.`

  return (
    <BeatShell
      primary={primary}
      feedback={ladder.view}
      onTryAgain={
        revealed
          ? () => {
              ladder.tryAgain()
              setSolved(false)
              setShareInput('')
            }
          : undefined
      }
    >
      <div className="chainboard-dist">
        <p className="chainboard-dist__subtitle">
          The distribution has settled — read the {ix.labels[cellRow]} bar and enter its long-run share.
        </p>
        {stationary.map((r, i) => (
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
          </div>
        ))}
        <label className="chainboard-dist__entry">
          <span>Long-run share of {ix.labels[cellRow]} =</span>
          <input
            type="text"
            value={shareInput}
            placeholder="e.g. 1/2"
            disabled={solved || revealed}
            autoComplete="off"
            aria-label={`Long-run share of ${ix.labels[cellRow]}`}
            onChange={(e) => { setShareInput(e.target.value); ladder.clear() }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !solved && shareInput.trim() !== '') { e.preventDefault(); check() }
            }}
            style={{ minHeight: '44px' }}
          />
        </label>
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
  const [dampingPct, setDampingPct] = useState(Math.round((defaultDamping.n / defaultDamping.d) * 100))
  const [solved, setSolved] = useState(false)
  const [tappedChoice, setTappedChoice] = useState<boolean | null>(null)
  const [piInput, setPiInput] = useState('')

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
  const P = ix.matrix.map((r) => r.cells)
  const isPageRank = ix.task === 'pagerank'
  const liveDamping: Rational = { n: dampingPct, d: 100 }

  // ── HERO (explore-damping): damping slider + live PageRank bars, Continue ──
  if (beat.hero) {
    const heroBars = isPageRank ? pagerank(P, liveDamping) : stationaryDistribution(P)
    return (
      <BeatShell primary={{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }}>
        <div className="chainboard-stationary">
          <p className="sr-only">{beat.hero.structuralReadout}</p>
          {isPageRank && (
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
          {heroBars.map((r, i) => (
            <div key={i} className="chainboard-stationary__row">
              <span className="chainboard-stationary__label">{ix.labels[i]}</span>
              <div className="chainboard-stationary__track">
                <div
                  className="chainboard-stationary__fill"
                  style={{ width: `${pct(r)}%`, transition: reducedMotion ? 'none' : 'width 0.4s ease' }}
                  aria-hidden="true"
                />
              </div>
              <span className="chainboard-stationary__value">{formatRational(r)}</span>
            </div>
          ))}
          <p role="status" aria-live="polite" className="sr-only">
            {`${isPageRank ? 'PageRank' : 'Stationary'}: ${formatVector(heroBars)}`}
          </p>
        </div>
      </BeatShell>
    )
  }

  // ── GRADED PageRank (damping-saves-sink): bars + unique/not-unique chips. The
  //    graded value is the CATEGORICAL "unique"; the bars are the sink's PageRank
  //    (not a graded value, not a later-required value) — safe to show. ──
  if (isPageRank) {
    const prBars = pagerank(P, liveDamping)
    const check = () => {
      const correct = tappedChoice !== null && isChainBoardCorrect(beat, { kind: 'bool', value: tappedChoice })
      if (correct) { ladder.submitCorrect(); setSolved(true) } else { ladder.submitWrong() }
    }
    const primary = solved
      ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
      : { label: 'Check', enabled: tappedChoice !== null, onClick: check }
    return (
      <BeatShell
        primary={primary}
        feedback={ladder.view}
        onTryAgain={revealed ? () => { ladder.tryAgain(); setSolved(false); setTappedChoice(null) } : undefined}
      >
        <div className="chainboard-stationary">
          <p className="chainboard-stationary__subtitle">PageRank (d = {dampingPct}%)</p>
          {prBars.map((r, i) => (
            <div key={i} className="chainboard-stationary__row">
              <span className="chainboard-stationary__label">{ix.labels[i]}</span>
              <div className="chainboard-stationary__track">
                <div className="chainboard-stationary__fill" style={{ width: `${pct(r)}%`, transition: reducedMotion ? 'none' : 'width 0.4s ease' }} aria-hidden="true" />
              </div>
              <span className="chainboard-stationary__value">{formatRational(r)}</span>
            </div>
          ))}
          <div className="chainboard-chips" role="group" aria-label="Does a unique PageRank exist?">
            {(['unique', 'not unique'] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                className={'chainboard-chip' + (tappedChoice === (choice === 'unique') ? ' chainboard-chip--active' : '')}
                aria-pressed={tappedChoice === (choice === 'unique')}
                disabled={solved || revealed}
                onClick={() => { setTappedChoice(choice === 'unique'); ladder.clear() }}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {choice}
              </button>
            ))}
          </div>
          <p role="status" aria-live="polite" className="sr-only">{`PageRank (d=${dampingPct}%): ${formatVector(prBars)}`}</p>
        </div>
      </BeatShell>
    )
  }

  // ── GRADED balance: show the read-only P (the chain data) + a control; do NOT
  //    render π or the reversibility verdict (that is the graded answer). Mode by
  //    headline (mirrors validate-fixtures §3c): categorical / vector / scalar. ──
  const db = detailedBalance(P)
  const reversibleChoice = ix.headline === 'not-reversible' || ix.headline === 'reversible'
  const vectorMode = !reversibleChoice && !!ix.headline && ix.headline.includes(',')
  const col = ix.cell?.col ?? 0

  const check = () => {
    const correct = reversibleChoice
      ? (tappedChoice !== null && isChainBoardCorrect(beat, { kind: 'bool', value: tappedChoice }))
      : isChainBoardCorrect(beat, { kind: 'text', value: piInput })
    if (correct) { ladder.submitCorrect(); setSolved(true) } else { ladder.submitWrong() }
  }
  const interacted = reversibleChoice ? tappedChoice !== null : piInput.trim() !== ''
  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: interacted, onClick: check }

  const revealVal = reversibleChoice
    ? (db.reversible ? 'reversible' : 'not reversible')
    : vectorMode ? formatVector(db.pi) : formatRational(db.pi[col])
  const ariaStatus = solved ? `Answer: ${revealVal}` : 'Work it out from the chain, then check.'

  return (
    <BeatShell
      primary={primary}
      feedback={ladder.view}
      onTryAgain={revealed ? () => { ladder.tryAgain(); setSolved(false); setTappedChoice(null); setPiInput('') } : undefined}
    >
      <div className="chainboard-stationary">
        <div className="chainboard-matrix__wrap" role="region" aria-label="Transition matrix P">
          <table className="chainboard-matrix__table">
            <thead>
              <tr>
                <th />
                {ix.labels.map((lbl) => <th key={lbl} className="chainboard-matrix__hdr">{lbl}</th>)}
              </tr>
            </thead>
            <tbody>
              {P.map((row, i) => (
                <tr key={i}>
                  <th scope="row" className="chainboard-matrix__hdr">{ix.labels[i]}</th>
                  {row.map((c, j) => (
                    <td key={j} className="chainboard-matrix__cell" style={{ minHeight: '44px', minWidth: '44px' }}>
                      {formatRational(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reversibleChoice ? (
          <div className="chainboard-chips" role="group" aria-label="Is the chain reversible?">
            {(['Reversible', 'Not reversible'] as const).map((choice) => {
              const choiceVal = choice === 'Reversible'
              return (
                <button
                  key={choice}
                  type="button"
                  className={'chainboard-chip' + (tappedChoice === choiceVal ? ' chainboard-chip--active' : '')}
                  aria-pressed={tappedChoice === choiceVal}
                  disabled={solved || revealed}
                  onClick={() => { setTappedChoice(choiceVal); ladder.clear() }}
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  {choice}
                </button>
              )
            })}
          </div>
        ) : (
          <label className="chainboard-balance__entry">
            <span>{vectorMode ? `π (shares of ${ix.labels.join(', ')}) =` : `π(${ix.labels[col]}) =`}</span>
            <input
              type="text"
              className="chainboard-balance__input"
              value={revealed ? revealVal : piInput}
              placeholder={vectorMode ? 'e.g. a/b,c/d,e/f' : 'e.g. 1/3'}
              disabled={solved || revealed}
              autoComplete="off"
              aria-label="Stationary probability"
              onChange={(e) => { setPiInput(e.target.value); ladder.clear() }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !solved && piInput.trim() !== '') { e.preventDefault(); check() } }}
              style={{ minHeight: '44px' }}
            />
          </label>
        )}

        <p role="status" aria-live="polite" className="sr-only">{ariaStatus}</p>
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
