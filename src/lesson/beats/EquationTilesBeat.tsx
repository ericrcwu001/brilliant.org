// Phase — Build equations (docs/ui_design_system.md beat 5). E0 is a worked
// example; the learner fills the graded E1 row by tapping a slot then a palette
// tile, or a tile then a slot (tap-only, no drag required). Check runs a
// per-slot diagnosis (equationDiagnosis): correct tiles lock in green, a
// targeted/varied hint addresses the single most useful mistake, and the hint
// ladder still drives level escalation + the level-3 answer reveal.

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import type { BeatProps } from './types'
import type { CanonicalRecurrence, Tile } from '../../content/schema'
import type { StateId } from '../../engine/types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import { StateGraph, type EdgeRef } from '../konva/StateGraph'
import { useElementWidth } from '../konva/useElementWidth'
import {
  aggregateProgress,
  a11ySummary,
  diagnoseRow,
  hintForMistake,
  progressLine,
  type RowDiagnosis,
} from '../equationDiagnosis'

type Rational = { n: number; d: number }

type SlotKind = 'const' | 'prob' | 'var'

// Tile kind 'state' is serialized as the 'var' token kind.
const tokenOf = (tile: Tile): string =>
  `${tile.kind === 'state' ? 'var' : tile.kind}:${tile.value}`
const kindOfToken = (token: string): string => token.slice(0, token.indexOf(':'))
const valueOfToken = (token: string): string => token.slice(token.indexOf(':') + 1)

const ratStr = (r: Rational): string => (r.d === 1 ? `${r.n}` : `${r.n}/${r.d}`)

const STATE_ID = /^E\d+$/

function stateLabel(id: string): ReactNode {
  if (!STATE_ID.test(id)) return id
  return (
    <>
      E<sub>{id.slice(1)}</sub>
    </>
  )
}

function displayTokenValue(token: string): ReactNode {
  const kind = kindOfToken(token)
  const value = valueOfToken(token)
  if (kind === 'var') return stateLabel(value)
  return value
}

// Generic fallback copy for the worked E0 example and per-token palette tooltips.
// Fixture-authored `interaction.copy` (de-hardcode, L1 §5.3) overrides these so
// other patterns (L2–L6) can reuse the beat; absent fields fall back here.
const DEFAULT_WORKED_EXPLANATION =
  'From state E₀ (no H matched yet), one flip always costs 1. With probability ½ you flip H and advance to E₁; with probability ½ you flip T and fall back to E₀.'

const DEFAULT_TERM_TIPS: Record<string, string> = {
  const: 'Every flip costs 1 — count the flip you are about to take.',
  'prob-e1': 'Probability ½ of flipping H and advancing to E₁ (one H matched).',
  'var-e1': 'Expected extra flips still needed once one H is matched.',
  'prob-e0': 'Probability ½ of flipping T and falling back to E₀ (no progress kept).',
  'var-e0': 'Expected extra flips still needed from the start state.',
}

const DEFAULT_TOKEN_TIPS: Record<string, string> = {
  'const:1': 'Every flip costs 1 — add this constant to each recurrence.',
  'const:0': 'The absorbing state E₂ needs zero extra flips — already done.',
  'prob:1/2': 'Fair coin: each branch has probability ½.',
  'var:E0': 'Expected extra flips from E₀ — no prefix of HH matched yet.',
  'var:E1': 'Expected extra flips from E₁ — one H matched, one flip from HH.',
  'var:E2': 'Expected extra flips from E₂ — HH matched; absorbing, so E₂ = 0.',
}

const DEFAULT_ABSORBING_NOTE = 'Absorbing state — HH matched, no extra flips needed.'

function slotKindFor(token: string | null, fallback: SlotKind): SlotKind {
  if (!token) return fallback
  const k = kindOfToken(token)
  if (k === 'var') return 'var'
  if (k === 'prob') return 'prob'
  return 'const'
}

const DEFAULT_LEGEND: { id: string; text: string }[] = [
  { id: 'E0', text: 'matched none of HH yet (start)' },
  { id: 'E1', text: 'matched one H (one flip from HH)' },
  { id: 'E2', text: 'matched HH — done, so E₂ = 0' },
]

// Resolved per-beat copy: fixture `interaction.copy` over the generic defaults.
type EqCopy = {
  workedExplanation: string
  termTips: Record<string, string>
  tokenTips: Record<string, string>
  legend: { id: string; text: string }[]
  mistakeHints?: Record<string, [string, string]>
  primer?: { title: string; body: string }
}

function resolveEqCopy(
  copy:
    | {
        workedExplanation?: string
        termTips?: Record<string, string>
        tokenTips?: Record<string, string>
        legend?: { id: string; text: string }[]
        mistakeHints?: Record<string, [string, string]>
        primer?: { title: string; body: string }
      }
    | undefined,
): EqCopy {
  return {
    workedExplanation: copy?.workedExplanation ?? DEFAULT_WORKED_EXPLANATION,
    termTips: { ...DEFAULT_TERM_TIPS, ...(copy?.termTips ?? {}) },
    tokenTips: { ...DEFAULT_TOKEN_TIPS, ...(copy?.tokenTips ?? {}) },
    legend: copy?.legend ?? DEFAULT_LEGEND,
    mistakeHints: copy?.mistakeHints,
    primer: copy?.primer,
  }
}

type InfoTipTriggerProps = {
  onClick?: (e: React.MouseEvent) => void
  onBlur?: (e: React.FocusEvent) => void
  onFocus?: (e: React.FocusEvent) => void
  'aria-label'?: string
  'aria-describedby'?: string
}

function InfoTip({
  label,
  tip,
  children,
  className,
}: {
  label: string
  tip: string
  children: ReactElement<InfoTipTriggerProps>
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [leftPx, setLeftPx] = useState<number | null>(null)
  const tipId = useId()
  const wrapRef = useRef<HTMLSpanElement>(null)
  const bubbleRef = useRef<HTMLSpanElement>(null)

  // Pin the (absolutely positioned) bubble inside the viewport with an explicit
  // left offset. A trigger near a screen edge would otherwise center a wide
  // bubble past the edge — clipping the tooltip and, because the hidden bubble
  // still occupies layout, adding horizontal page scroll. We position via `left`
  // (not `transform`) so the clamped box stays out of the scrollable overflow,
  // and compute it for every bubble (open or not) so closed tips can't overflow.
  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const bubble = bubbleRef.current
    if (!wrap || !bubble) return
    const margin = 8
    const vw = document.documentElement.clientWidth
    const rect = wrap.getBoundingClientRect()
    const w = bubble.offsetWidth
    const desired = rect.left + rect.width / 2 - w / 2
    const clamped = Math.max(margin, Math.min(desired, vw - margin - w))
    setLeftPx(Math.round(clamped - rect.left))
  }, [open, tip])

  const trigger = isValidElement(children)
    ? cloneElement<InfoTipTriggerProps>(children, {
        'aria-describedby': tipId,
        'aria-label': children.props['aria-label'] ?? label,
        onClick: (e: React.MouseEvent) => {
          children.props.onClick?.(e)
          setOpen((cur) => !cur)
        },
        onBlur: (e: React.FocusEvent) => {
          children.props.onBlur?.(e)
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false)
        },
        onFocus: (e: React.FocusEvent) => {
          children.props.onFocus?.(e)
          setOpen(true)
        },
      })
    : children

  return (
    <span
      ref={wrapRef}
      className={['infotip', className].filter(Boolean).join(' ')}
      data-open={open || undefined}
    >
      {trigger}
      <span
        ref={bubbleRef}
        className="infotip__bubble"
        id={tipId}
        role="tooltip"
        style={leftPx === null ? undefined : { left: `${leftPx}px`, transform: 'none' }}
      >
        {tip}
      </span>
    </span>
  )
}

// One leading constant slot, then a prob + state slot per target term, so the
// shape mirrors the canonical recurrence (HH E0 → [const][prob][state][prob][state]).
function slotTemplate(target: CanonicalRecurrence): SlotKind[] {
  const slots: SlotKind[] = ['const']
  for (let i = 0; i < target.terms.length; i++) slots.push('prob', 'var')
  return slots
}

// One valid canonical-order fill, used for the level-3 reveal and the
// first-differing-slot glow.
function correctFill(target: CanonicalRecurrence): string[] {
  const out: string[] = [`const:${target.constant}`]
  for (const term of target.terms) out.push(`prob:${ratStr(term.coeff)}`, `var:${term.var}`)
  return out
}

function targetStatic(target: CanonicalRecurrence): string {
  const parts: string[] = []
  if (target.terms.length === 0 || target.constant !== 0) parts.push(String(target.constant))
  for (const term of target.terms) parts.push(`${ratStr(term.coeff)} ${term.var}`)
  return parts.join(' + ')
}

function tokenCategory(token: string): 'const' | 'prob' | 'state' {
  const kind = kindOfToken(token)
  if (kind === 'var') return 'state'
  if (kind === 'prob') return 'prob'
  return 'const'
}

function prefilledSlotTip(
  target: CanonicalRecurrence,
  idx: number,
  copy: EqCopy,
): string {
  if (idx === 0) return copy.termTips.const
  const termIdx = (idx - 1) >> 1
  const isProb = ((idx - 1) & 1) === 0
  const term = target.terms[termIdx]
  if (!term) return ''
  if (target.lhs === 'E0') {
    const tipKeys = ['prob-e1', 'var-e1', 'prob-e0', 'var-e0'] as const
    const key = tipKeys[idx - 1]
    if (key) return copy.termTips[key]
  }
  if (isProb) {
    return `Probability ${ratStr(term.coeff)} of taking the branch that leads to ${term.var}.`
  }
  return copy.tokenTips[`var:${term.var}`] ?? `Expected extra flips from ${term.var}.`
}

function PrefilledRow({ target, copy }: { target: CanonicalRecurrence; copy: EqCopy }) {
  const values = correctFill(target)

  function placedTile(token: string, idx: number): ReactNode {
    const cat = tokenCategory(token)
    const tip = prefilledSlotTip(target, idx, copy)
    return (
      <InfoTip key={`prefill-${target.lhs}-${idx}`} label={valueOfToken(token)} tip={tip}>
        <span
          tabIndex={0}
          role="button"
          className={`token token--${cat} token--placed`}
          aria-label={`${valueOfToken(token)}: ${tip}`}
        >
          {displayTokenValue(token)}
        </span>
      </InfoTip>
    )
  }

  const nodes: ReactNode[] = [placedTile(values[0], 0)]
  for (let i = 1; i < values.length; i += 2) {
    nodes.push(
      <span className="eqline__op" key={`op-${target.lhs}-${i}`} aria-hidden="true">
        +
      </span>,
      placedTile(values[i], i),
      placedTile(values[i + 1], i + 1),
    )
  }

  return (
    <div className="eqline eqline--prefilled">
      <div className="eqline__body">
        <span className="eqline__lhs">{stateLabel(target.lhs)} =</span>
        {nodes}
      </div>
      <p className="eqline__explain">{copy.workedExplanation}</p>
    </div>
  )
}

function isExampleRow(row: { lhs: string; target: CanonicalRecurrence }): boolean {
  return row.lhs === 'E0' && row.target.terms.length > 0
}

export function EquationTilesBeat(props: BeatProps) {
  const {
    beat,
    pattern,
    automaton,
    isLast,
    onAdvance,
    reportNeedsReview,
    lessonState,
    setLessonState,
  } = props
  const interaction = beat.interaction
  const rows = interaction.type === 'equationTiles' ? interaction.rows : []
  const bank = interaction.type === 'equationTiles' ? interaction.bank : []
  const eqCopy = resolveEqCopy(
    interaction.type === 'equationTiles' ? interaction.copy : undefined,
  )
  // Example rows (E0) are shown pre-filled and never graded interactively.
  const buildableRows = rows.filter((r) => r.graded && !isExampleRow(r))

  // Track A (density 'split') gets the scaffolded rendering: a dyna-link graph,
  // a staged reveal (worked row first, build on tap), and "faded" rungs.
  const split = props.density === 'split'
  // Track-A staged faded rung (L1 §4.6): a graded row flagged `faded` renders
  // with every slot but its final term pre-filled + locked, so the learner
  // completes only the last piece. Only applied on Track A.
  const isFaded = (r: { lhs: string; faded?: boolean }) => split && !!r.faded
  const fadedOpenIdx = (target: CanonicalRecurrence) => slotTemplate(target).length - 1

  // Restore placements persisted into LessonState (Phase 15): a saved row of the
  // matching slot length seeds the build; otherwise start from empty slots (or,
  // for a faded rung, the correct fill with only the last term left open).
  const [filled, setFilled] = useState<Record<string, (string | null)[]>>(() => {
    const saved = lessonState.equationTiles
    const init: Record<string, (string | null)[]> = {}
    for (const row of rows) {
      if (row.graded && !isExampleRow(row)) {
        const template = slotTemplate(row.target)
        const savedRow = saved?.[row.lhs]
        if (savedRow && savedRow.length === template.length) {
          init[row.lhs] = [...savedRow]
        } else if (split && row.faded) {
          const fill = correctFill(row.target)
          const open = template.length - 1
          init[row.lhs] = fill.map((tok, i) => (i === open ? null : tok))
        } else {
          init[row.lhs] = template.map(() => null)
        }
      }
    }
    return init
  })

  // Mirror placements back into LessonState so they persist across navigation
  // and into the restore snapshot. `setLessonState` is referentially stable.
  useEffect(() => {
    setLessonState({ equationTiles: filled })
  }, [filled, setLessonState])
  const [selTile, setSelTile] = useState<string | null>(null)
  const [selSlot, setSelSlot] = useState<{ row: string; idx: number } | null>(null)
  // True while a Check verdict is on screen; cleared by any edit so green/wrong
  // markers and hints never describe a stale attempt.
  const [checked, setChecked] = useState(false)
  const [solved, setSolved] = useState(false)

  // Track-A dyna-link (L1 §5.2): placing a destination-state tile briefly
  // highlights the matching graph edge, bridging the prefix label (∅/H) shown in
  // the graph to the E-id the tile carries. Only rendered when density='split'.
  const [boxRef, gWidth] = useElementWidth<HTMLDivElement>()
  const [dynaEdge, setDynaEdge] = useState<EdgeRef | null>(null)
  const dynaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (dynaTimer.current) clearTimeout(dynaTimer.current)
    },
    [],
  )
  // Track-A staged reveal (L1 §4.6): show the worked row (+ graph + variable
  // primer) first; reveal the legend, build row, and palette on a tap. Track B
  // shows everything at once (buildShown starts true).
  const [buildShown, setBuildShown] = useState(!split)
  const [primerOpen, setPrimerOpen] = useState(false)

  // Per-slot diagnosis of the current placements, recomputed each render. Used
  // for green highlighting, the targeted glow, the progress line, and to derive
  // the dynamic hint copy fed into the ladder below.
  const slotsByRow: Record<string, SlotKind[]> = {}
  for (const row of buildableRows) slotsByRow[row.lhs] = slotTemplate(row.target)
  const diagByRow: Record<string, RowDiagnosis> = {}
  for (const row of buildableRows) {
    diagByRow[row.lhs] = diagnoseRow(filled[row.lhs], row.target)
  }
  const firstWrongRow = buildableRows.find((r) => !diagByRow[r.lhs].ok)
  const primaryMistake = firstWrongRow ? diagByRow[firstWrongRow.lhs].mistake : null

  // Dynamic hint ladder: levels 1-2 target the specific mistake; level 3 keeps
  // the authored literal-answer reveal so the reveal flow is unchanged.
  const base = resolveFeedback(beat.feedback, pattern)
  const dynamicFeedback = primaryMistake
    ? {
        correct: base.correct,
        hints: [
          hintForMistake(primaryMistake, 1, eqCopy.mistakeHints),
          hintForMistake(primaryMistake, 2, eqCopy.mistakeHints),
          base.hints[2],
        ] as [string, string, string],
      }
    : base

  const ladder = useHintLadder({
    feedback: dynamicFeedback,
    required: beat.required,
    maxHintLevel: beat.maxHintLevel,
    onNeedsReview: reportNeedsReview,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: { lessonId: props.lessonId, beatId: beat.beatId },
  })

  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed

  if (interaction.type !== 'equationTiles') return null

  // Level-3 reveal is a render-time display: show the correct tokens for every
  // still-wrong row without mutating the learner's placements (Try again
  // restores their own slots).
  const displayed: Record<string, (string | null)[]> = {}
  for (const row of buildableRows) {
    const d = diagByRow[row.lhs]
    displayed[row.lhs] = revealed && !d.ok ? correctFill(row.target) : (filled[row.lhs] ?? [])
  }

  // Enable Check once every slot in the build row(s) holds a tile.
  const allFilled =
    buildableRows.length > 0 && buildableRows.every((row) => diagByRow[row.lhs].complete)

  const progress = aggregateProgress(buildableRows.map((row) => diagByRow[row.lhs]))

  // Palette: unique placeable tile types (operators are static chrome here).
  const palette: Tile[] = []
  const seen = new Set<string>()
  for (const tile of bank) {
    if (tile.kind === 'op') continue
    const token = tokenOf(tile)
    if (seen.has(token)) continue
    seen.add(token)
    palette.push(tile)
  }

  function placeInto(row: string, idx: number, token: string) {
    setFilled((prev) => {
      const layout = slotsByRow[row]
      if (!layout) return prev
      const nextRow = [...(prev[row] ?? layout.map(() => null))]
      nextRow[idx] = token
      return { ...prev, [row]: nextRow }
    })
    setChecked(false)
    // Editing the row drops the stale verdict from the previous Check.
    ladder.clear()
    // Dyna-link: a destination-state tile lights its graph edge for a beat.
    if (split && kindOfToken(token) === 'var') {
      const dest = valueOfToken(token)
      const edge = automaton.transitions.find((t) => t.from === row && t.to === dest)
      if (edge) {
        setDynaEdge({ from: edge.from, on: edge.on })
        if (dynaTimer.current) clearTimeout(dynaTimer.current)
        dynaTimer.current = setTimeout(() => setDynaEdge(null), 1400)
      }
    }
  }

  function onSlotTap(row: string, idx: number) {
    const rowSlots = filled[row] ?? []
    if (rowSlots[idx] != null) {
      setFilled((prev) => {
        const layout = slotsByRow[row]
        if (!layout) return prev
        const nextRow = [...(prev[row] ?? layout.map(() => null))]
        nextRow[idx] = null
        return { ...prev, [row]: nextRow }
      })
      setSelSlot(null)
      setSelTile(null)
      setChecked(false)
      ladder.clear()
      return
    }
    if (selTile) {
      placeInto(row, idx, selTile)
      setSelTile(null)
      setSelSlot(null)
      return
    }
    setSelSlot((cur) => (cur && cur.row === row && cur.idx === idx ? null : { row, idx }))
    setSelTile(null)
  }

  function onTileTap(token: string) {
    if (selSlot) {
      placeInto(selSlot.row, selSlot.idx, token)
      setSelSlot(null)
      return
    }
    setSelTile((cur) => (cur === token ? null : token))
    setSelSlot(null)
  }

  function onCheck() {
    setChecked(true)
    const allOk = buildableRows.every((row) => diagByRow[row.lhs].ok)
    if (allOk) {
      ladder.submitCorrect()
      setSolved(true)
      setLessonState({ theoreticalValue: automaton.expectedTimes['E0' as StateId] })
    } else {
      ladder.submitWrong()
    }
  }

  function handleTryAgain() {
    // Keep the green (correct) tiles; clear only the wrong/empty slots so the
    // learner iterates on what's left rather than rebuilding from scratch.
    setFilled((prev) => {
      const next = { ...prev }
      for (const row of buildableRows) {
        const d = diagByRow[row.lhs]
        if (d.ok) continue
        const cur = prev[row.lhs] ?? slotsByRow[row.lhs].map(() => null)
        next[row.lhs] = cur.map((tok, i) => (d.slotStatus[i] === 'correct' ? tok : null))
      }
      return next
    })
    setChecked(false)
    setSelTile(null)
    setSelSlot(null)
    ladder.tryAgain()
  }

  // A verdict is "active" (drives green/wrong markers + glow) only right after a
  // Check, before the next edit, and not during the level-3 reveal.
  const hintLevel = ladder.view.kind === 'hint' ? ladder.view.level : 0
  const verdictActive = checked && !revealed
  const glowByRow: Record<string, number | null> = {}
  for (const row of buildableRows) {
    glowByRow[row.lhs] =
      verdictActive && hintLevel >= 2 ? diagByRow[row.lhs].glowIndex : null
  }

  const primary = !buildShown
    ? { label: 'Now your turn', enabled: true, onClick: () => setBuildShown(true) }
    : solved
      ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
      : { label: 'Check', enabled: allFilled, onClick: onCheck }

  function slot(row: (typeof buildableRows)[number], idx: number, kind: SlotKind): ReactNode {
    const rowId = row.lhs
    const value = (displayed[rowId] ?? [])[idx]
    const status = diagByRow[rowId]?.slotStatus[idx]
    // A faded rung pre-fills + locks every slot but its final term, so the
    // learner only completes the last piece (Track A staged scaffold).
    const locked = isFaded(row) && idx !== fadedOpenIdx(row.target)
    // Per-tile verdict: correct tiles lock in green; wrong ones get a quiet
    // marker. Only show while a verdict is active (not mid-edit, not reveal).
    const showCorrect = (verdictActive && status === 'correct') || solved
    const showWrong = verdictActive && !solved && status === 'wrong'
    const isSel = selSlot?.row === rowId && selSlot.idx === idx
    const glow = glowByRow[rowId] === idx
    const placeholder =
      kind === 'const' ? '?' : kind === 'prob' ? '·' : <span aria-hidden="true">E?</span>
    const skin = slotKindFor(value, kind)
    const classes = [
      'slot',
      `slot--${skin}`,
      value ? 'slot--filled' : 'slot--empty',
      isSel ? 'slot--selected' : '',
      glow ? 'slot--glow' : '',
      locked ? 'slot--locked' : '',
      showCorrect ? 'slot--correct' : showWrong ? 'slot--wrong' : '',
    ]
      .filter(Boolean)
      .join(' ')
    const verdict = showCorrect ? ', correct' : showWrong ? ', recheck this' : ''
    const label = `${rowId} ${kind} slot${value ? `, holds ${valueOfToken(value)}` : ', empty'}${
      locked ? ', given' : verdict
    }`
    // No tooltip on build slots — explaining what each slot expects would give
    // away the answer the learner is supposed to assemble.
    return (
      <button
        type="button"
        key={`slot-${rowId}-${idx}`}
        className={classes}
        aria-label={label}
        onClick={() => onSlotTap(rowId, idx)}
        disabled={solved || revealed || locked}
      >
        {value ? displayTokenValue(value) : placeholder}
      </button>
    )
  }

  function renderSlots(row: (typeof buildableRows)[number]): ReactNode[] {
    const rowId = row.lhs
    const kinds = slotsByRow[rowId]
    const nodes: ReactNode[] = [slot(row, 0, kinds[0])]
    for (let i = 1; i < kinds.length; i += 2) {
      nodes.push(
        <span className="eqline__op" key={`op-${rowId}-${i}`} aria-hidden="true">
          +
        </span>,
        slot(row, i, kinds[i]),
        slot(row, i + 1, kinds[i + 1]),
      )
    }
    return nodes
  }

  function renderStaticRow(row: (typeof rows)[number]) {
    return (
      <div className="eqline eqline--static" key={row.lhs}>
        <span className="eqline__lhs">{stateLabel(row.lhs)} =</span>
        <span className="eqline__static">{targetStatic(row.target)}</span>
        <p className="eqline__note">{row.note ?? DEFAULT_ABSORBING_NOTE}</p>
      </div>
    )
  }

  const exampleRow = rows.find(isExampleRow)
  const buildRows = rows.filter((row) => !isExampleRow(row))

  return (
    <BeatShell feedback={ladder.view} onTryAgain={handleTryAgain} primary={primary}>
      <div className="eqtiles">
        {split && (
          <div className="eqtiles__graph canvas-frame" ref={boxRef}>
            {gWidth > 0 && (
              <StateGraph
                automaton={automaton}
                width={gWidth}
                height={Math.max(150, Math.round(gWidth * 0.42))}
                labelMode="dual"
                highlight={dynaEdge ? [dynaEdge] : []}
                reducedMotion={props.reducedMotion}
              />
            )}
          </div>
        )}
        {split && eqCopy.primer && (
          <div className="eqtiles__primer">
            {primerOpen ? (
              <div className="primer__card">
                <p className="primer__kicker">Quick refresher</p>
                <h2 className="primer__title">{eqCopy.primer.title}</h2>
                <p className="primer__body">{eqCopy.primer.body}</p>
              </div>
            ) : (
              <button
                type="button"
                className="primer__disclosure"
                aria-expanded={false}
                onClick={() => setPrimerOpen(true)}
              >
                <span className="primer__kicker">Quick refresher</span>
                <span className="primer__title">{eqCopy.primer.title}</span>
                <span className="primer__chevron" aria-hidden="true">
                  +
                </span>
              </button>
            )}
          </div>
        )}

        {exampleRow && (
          <section className="eqtiles__example" aria-label="Worked example">
            <p className="eqtiles__example-kicker">Worked example</p>
            <PrefilledRow target={exampleRow.target} copy={eqCopy} />
          </section>
        )}

        {buildShown && (
          <>
            <div className="eqtiles__legend">
              <p className="eqtiles__legend-lead">
                E<sub>i</sub> = average extra flips still needed from state i.
              </p>
              <ul className="eqtiles__legend-list">
                {eqCopy.legend.map(({ id, text }) => (
                  <li key={id}>
                    <span className="eqtiles__legend-id">{stateLabel(id)}</span>: {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="eqtiles__rows">
              {buildRows.map((row) =>
                row.graded ? (
                  <div className="eqline eqline--build" key={row.lhs}>
                    <p className="eqline__kicker">
                      {isFaded(row)
                        ? 'Almost there — fill the last piece'
                        : 'Your turn — build this row'}
                    </p>
                    <div className="eqline__body">
                      <span className="eqline__lhs">{stateLabel(row.lhs)} =</span>
                      {renderSlots(row)}
                    </div>
                  </div>
                ) : (
                  renderStaticRow(row)
                ),
              )}
            </div>

            {split && (
              <p className="eqtiles__selfexplain">
                Why does the tail term point back at E₀, not E₁?
              </p>
            )}

            {verdictActive && !solved && (
              <p
                className={`eqprogress${progress.structurallyValid ? '' : ' eqprogress--invalid'}`}
              >
                {progressLine(progress)}
              </p>
            )}
            <p className="sr-only" role="status" aria-live="polite">
              {verdictActive ? a11ySummary(progress) : ''}
            </p>

            <div className="palette">
              <p className="palette__label">
                {selSlot ? 'Tap a tile to fill the selected slot' : 'Tap a tile, then a slot'}
              </p>
              <div className="token-row">
                {palette.map((tile) => {
                  const token = tokenOf(tile)
                  const cat =
                    tile.kind === 'state' ? 'state' : tile.kind === 'prob' ? 'prob' : 'const'
                  const selected = selTile === token
                  return (
                    <button
                      key={token}
                      type="button"
                      className={`token token--${cat}${selected ? ' token--selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => onTileTap(token)}
                    >
                      {tile.kind === 'state' ? stateLabel(String(tile.value)) : tile.value}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </BeatShell>
  )
}
