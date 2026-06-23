// Phase — Build equations (docs/ui_design_system.md beat 5). The learner fills
// each graded recurrence row by tapping a slot then a palette tile, or a tile
// then a slot (tap-only, no drag required). Check grades every graded row with
// the pure equationChecker; the authored hint ladder drives feedback, with a
// targeted slot glow at level 2 and an answer reveal at level 3 (when the beat
// is not capped to level 2).

import { useState, type ReactNode } from 'react'
import type { BeatProps } from './types'
import type { CanonicalRecurrence, Tile } from '../../content/schema'
import type { StateId } from '../../engine/types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import { checkRows } from '../equationChecker'

type Rational = { n: number; d: number }

type SlotKind = 'const' | 'prob' | 'var'
type WrongReason = 'incomplete' | 'wrong-constant' | 'wrong-var' | 'wrong-coeff' | 'malformed'

// Tile kind 'state' is serialized as the 'var' token kind.
const tokenOf = (tile: Tile): string =>
  `${tile.kind === 'state' ? 'var' : tile.kind}:${tile.value}`
const kindOfToken = (token: string): string => token.slice(0, token.indexOf(':'))
const valueOfToken = (token: string): string => token.slice(token.indexOf(':') + 1)

const ratStr = (r: Rational): string => (r.d === 1 ? `${r.n}` : `${r.n}/${r.d}`)

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

// Interleave the static "op:+" separators so the sequence matches the token
// format the checker expects.
function rowSequence(
  target: CanonicalRecurrence,
  values: (string | null)[],
): (string | null)[] {
  const seq: (string | null)[] = [values[0]]
  let i = 1
  for (let t = 0; t < target.terms.length; t++) {
    seq.push('op:+', values[i], values[i + 1])
    i += 2
  }
  return seq
}

function targetStatic(target: CanonicalRecurrence): string {
  const parts: string[] = []
  if (target.terms.length === 0 || target.constant !== 0) parts.push(String(target.constant))
  for (const term of target.terms) parts.push(`${ratStr(term.coeff)} ${term.var}`)
  return parts.join(' + ')
}

const reasonNote: Record<WrongReason, string> = {
  incomplete: 'Fill every slot before checking.',
  'wrong-constant': 'Check the leading constant — every flip costs 1.',
  'wrong-var': 'One term points at the wrong state.',
  'wrong-coeff': 'Check a coefficient — one weight is off.',
  malformed: "That row isn't a valid equation yet.",
}

export function EquationTilesBeat(props: BeatProps) {
  const { beat, pattern, automaton, isLast, onAdvance, reportNeedsReview, setLessonState } =
    props
  const interaction = beat.interaction
  const rows = interaction.type === 'equationTiles' ? interaction.rows : []
  const bank = interaction.type === 'equationTiles' ? interaction.bank : []
  const gradedRows = rows.filter((r) => r.graded)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, pattern),
    required: beat.required,
    maxHintLevel: beat.maxHintLevel,
    onNeedsReview: reportNeedsReview,
  })

  const [filled, setFilled] = useState<Record<string, (string | null)[]>>(() => {
    const init: Record<string, (string | null)[]> = {}
    for (const row of rows) {
      if (row.graded) init[row.lhs] = slotTemplate(row.target).map(() => null)
    }
    return init
  })
  const [selTile, setSelTile] = useState<string | null>(null)
  const [selSlot, setSelSlot] = useState<{ row: string; idx: number } | null>(null)
  const [lastCheck, setLastCheck] = useState<ReturnType<typeof checkRows> | null>(null)
  const [solved, setSolved] = useState(false)

  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed

  if (interaction.type !== 'equationTiles') return null

  const slotsByRow: Record<string, SlotKind[]> = {}
  for (const row of gradedRows) slotsByRow[row.lhs] = slotTemplate(row.target)

  // Level-3 reveal is a render-time display: show the correct tokens for every
  // still-wrong row without mutating the learner's placements (Try again
  // restores their own slots).
  const displayed: Record<string, (string | null)[]> = {}
  for (const row of gradedRows) {
    const r = lastCheck?.results[row.lhs]
    displayed[row.lhs] =
      revealed && r && !r.ok ? correctFill(row.target) : (filled[row.lhs] ?? [])
  }

  const allFilled = gradedRows.every((row) =>
    (filled[row.lhs] ?? []).every((v) => v != null),
  )

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
    if (slotsByRow[row][idx] !== kindOfToken(token)) return
    setFilled((prev) => {
      const nextRow = [...prev[row]]
      nextRow[idx] = token
      return { ...prev, [row]: nextRow }
    })
    setLastCheck(null)
  }

  function onSlotTap(row: string, idx: number) {
    if (filled[row][idx] != null) {
      setFilled((prev) => {
        const nextRow = [...prev[row]]
        nextRow[idx] = null
        return { ...prev, [row]: nextRow }
      })
      setSelSlot(null)
      setSelTile(null)
      setLastCheck(null)
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
    const sequences: Record<string, (string | null)[]> = {}
    for (const row of gradedRows) {
      sequences[row.lhs] = rowSequence(row.target, filled[row.lhs] ?? [])
    }
    const result = checkRows(rows, sequences)
    setLastCheck(result)
    if (result.ok) {
      ladder.submitCorrect()
      setSolved(true)
      setLessonState({ theoreticalValue: automaton.expectedTimes['E0' as StateId] })
    } else {
      ladder.submitWrong()
    }
  }

  function handleTryAgain() {
    setFilled((prev) => {
      const next = { ...prev }
      for (const row of gradedRows) {
        const r = lastCheck?.results[row.lhs]
        if (r && !r.ok) next[row.lhs] = slotsByRow[row.lhs].map(() => null)
      }
      return next
    })
    setLastCheck(null)
    setSelTile(null)
    setSelSlot(null)
    ladder.tryAgain()
  }

  // First wrong row + first differing slot, for the targeted glow and note.
  const hintLevel = ladder.view.kind === 'hint' ? ladder.view.level : 0
  let firstWrong: { row: string; idx: number; reason: WrongReason } | null = null
  if (lastCheck && !solved && !revealed) {
    for (const row of gradedRows) {
      const r = lastCheck.results[row.lhs]
      if (!r || r.ok) continue
      const want = correctFill(row.target)
      const have = filled[row.lhs] ?? []
      const found = want.findIndex((w, i) => have[i] !== w)
      firstWrong = { row: row.lhs, idx: found < 0 ? 0 : found, reason: r.reason }
      break
    }
  }
  const note = firstWrong && hintLevel >= 1 ? reasonNote[firstWrong.reason] : null

  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: allFilled, onClick: onCheck }

  function slot(rowId: string, idx: number, kind: SlotKind): ReactNode {
    const value = (displayed[rowId] ?? [])[idx]
    const rowResult = lastCheck?.results[rowId]
    const rowWrong = !solved && !revealed && rowResult != null && !rowResult.ok
    const isSel = selSlot?.row === rowId && selSlot.idx === idx
    const glow = hintLevel >= 2 && firstWrong?.row === rowId && firstWrong.idx === idx
    const placeholder = kind === 'const' ? '?' : kind === 'prob' ? '·' : 'E?'
    const classes = [
      'slot',
      `slot--${kind}`,
      value ? 'slot--filled' : 'slot--empty',
      isSel ? 'slot--selected' : '',
      glow ? 'slot--glow' : '',
      solved ? 'slot--correct' : rowWrong ? 'slot--wrong' : '',
    ]
      .filter(Boolean)
      .join(' ')
    return (
      <button
        type="button"
        key={`slot-${rowId}-${idx}`}
        className={classes}
        aria-label={`${rowId} ${kind} slot${value ? `, holds ${valueOfToken(value)}` : ', empty'}`}
        onClick={() => onSlotTap(rowId, idx)}
        disabled={solved || revealed}
      >
        {value ? valueOfToken(value) : <span aria-hidden="true">{placeholder}</span>}
      </button>
    )
  }

  function renderSlots(rowId: string): ReactNode[] {
    const kinds = slotsByRow[rowId]
    const nodes: ReactNode[] = [slot(rowId, 0, kinds[0])]
    for (let i = 1; i < kinds.length; i += 2) {
      nodes.push(
        <span className="eqline__op" key={`op-${rowId}-${i}`} aria-hidden="true">
          +
        </span>,
        slot(rowId, i, kinds[i]),
        slot(rowId, i + 1, kinds[i + 1]),
      )
    }
    return nodes
  }

  return (
    <BeatShell feedback={ladder.view} onTryAgain={handleTryAgain} primary={primary}>
      <div className="eqtiles">
        <div className="eqtiles__rows">
          {rows.map((row) =>
            row.graded ? (
              <div className="eqline" key={row.lhs}>
                <span className="eqline__lhs">{row.lhs} =</span>
                {renderSlots(row.lhs)}
              </div>
            ) : (
              <div className="eqline eqline--static" key={row.lhs}>
                <span className="eqline__lhs">{row.lhs} =</span>
                <span className="eqline__static">{targetStatic(row.target)}</span>
              </div>
            ),
          )}
        </div>

        {note && <p className="hint-note hint-note--mark">{note}</p>}

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
                  type="button"
                  key={token}
                  className={`token token--${cat} token--tap${selected ? ' token--selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => onTileTap(token)}
                >
                  {tile.value}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </BeatShell>
  )
}
