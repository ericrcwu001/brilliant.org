// Graded hand-ranking widget (lesson-combinatorics-6 l6-rank).
// Cards show label + reduced fraction probabilityFromCounts(favorable, total).
// Initial display order is seeded-shuffled (NOT the correct answer).
// Primary path: tap a card → it lands in the next empty ranked slot.
// Keyboard: Tab to focus a card in the pile; Up/Down arrows reorder a placed
// card's slot; Enter confirms. Drag is additive (HTML5 drag events). After all
// slots are filled the answer is graded automatically. Uses useHintLadder like
// RetrievalGridBeat. Narrowed to 'handRanker'.

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import { probabilityFromCounts } from '../../engine/combinatorics'

// Deterministic seeded shuffle — returns a permutation of [0..n-1] driven by
// the beatId string so the initial display order is stable across server/client.
function seededShuffle(n: number, seed: string): number[] {
  const indices = Array.from({ length: n }, (_, i) => i)
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0
  }
  for (let i = n - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) | 0
    const j = Math.abs(h) % (i + 1)
    const tmp = indices[i]!
    indices[i] = indices[j]!
    indices[j] = tmp
  }
  return indices
}

// Human-readable rank label for a slot position (0-indexed).
function rankLabel(slot: number, total: number, order: 'rarestFirst' | 'commonestFirst'): string {
  if (total === 2) {
    if (order === 'rarestFirst') return slot === 0 ? 'Rarest' : 'More common'
    return slot === 0 ? 'Most common' : 'Rarer'
  }
  return `Rank ${slot + 1}`
}

export function HandRankerBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props

  const hr = beat.interaction.type === 'handRanker' ? beat.interaction : null
  const hands = hr?.hands ?? []
  const total = hr?.total ?? 1
  const order = hr?.order ?? 'rarestFirst'

  // Engine-correct order: sort by favorable ascending (rarestFirst) or descending.
  const correctOrder = hands
    .map((_, i) => i)
    .sort((a, b) =>
      order === 'rarestFirst'
        ? hands[a]!.favorable - hands[b]!.favorable
        : hands[b]!.favorable - hands[a]!.favorable,
    )

  // Seeded-shuffled source pile so initial display ≠ correct answer.
  const displayOrder = seededShuffle(hands.length, beat.beatId)

  // ranking[slot] = index into `hands`, or null for an empty slot.
  const [ranking, setRanking] = useState<(number | null)[]>(
    Array(hands.length).fill(null),
  )
  const [liveMsg, setLiveMsg] = useState('')
  const [solved, setSolved] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, pattern),
    required: beat.required,
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: props.reportNeedsReview,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: { lessonId: props.lessonId, beatId: beat.beatId },
  })

  if (!hr) return null

  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed
  const allFilled = ranking.every((r) => r !== null)

  function gradeRanking(r: (number | null)[]) {
    const isCorrect = r.every((idx, slot) => idx === correctOrder[slot])
    if (isCorrect) {
      ladder.submitCorrect()
      setSolved(true)
      setLiveMsg(
        `Correct! ${correctOrder.map((i) => hands[i]!.label).join(', ')}`,
      )
    } else {
      ladder.submitWrong()
    }
  }

  function placeCard(handIdx: number) {
    if (solved || revealed) return
    if (ranking.some((r) => r === handIdx)) return
    const nextEmpty = ranking.findIndex((r) => r === null)
    if (nextEmpty === -1) return
    const newRanking = [...ranking]
    newRanking[nextEmpty] = handIdx
    setRanking(newRanking)
    const { n, d } = probabilityFromCounts(hands[handIdx]!.favorable, total)
    setLiveMsg(
      `${hands[handIdx]!.label} placed in position ${nextEmpty + 1}, ${n}/${d}`,
    )
    if (newRanking.every((r) => r !== null)) {
      gradeRanking(newRanking)
    }
  }

  // Move the card in slot `slotIdx` up or down by `dir` (-1 or +1).
  function moveSlot(slotIdx: number, dir: -1 | 1) {
    const targetIdx = slotIdx + dir
    if (targetIdx < 0 || targetIdx >= hands.length) return
    const newRanking = [...ranking]
    const tmp = newRanking[slotIdx]!
    newRanking[slotIdx] = newRanking[targetIdx]!
    newRanking[targetIdx] = tmp
    setRanking(newRanking)
    const movedIdx = newRanking[targetIdx]
    if (movedIdx !== null) {
      const { n, d } = probabilityFromCounts(hands[movedIdx].favorable, total)
      setLiveMsg(
        `${hands[movedIdx].label} moved to position ${targetIdx + 1}, ${n}/${d}`,
      )
    }
  }

  function reset() {
    setRanking(Array(hands.length).fill(null))
    setLiveMsg('')
    setSolved(false)
    ladder.clear()
  }

  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: allFilled && !revealed, onClick: () => gradeRanking(ranking) }

  // Fractions pre-computed for each hand.
  const fractions = hands.map((h) => probabilityFromCounts(h.favorable, total))

  // Which hand indices are already placed in a slot.
  const placedIndices = new Set(ranking.filter((r): r is number => r !== null))

  const slotStatusClass = (slot: number) => {
    const idx = ranking[slot]
    if (idx === null) return ''
    if (solved) return ' hand-ranker__slot--correct'
    return ' hand-ranker__slot--filled'
  }

  return (
    <BeatShell
      primary={primary}
      feedback={ladder.view}
      secondary={
        !solved && !revealed
          ? { label: 'Reset', onClick: reset, enabled: ranking.some((r) => r !== null) }
          : undefined
      }
      onTryAgain={
        revealed
          ? () => {
              ladder.tryAgain()
              reset()
            }
          : undefined
      }
    >
      <div className="hand-ranker">
        <p
          aria-live="polite"
          aria-atomic="true"
          className="hand-ranker__live"
        >
          {liveMsg}
        </p>

        {/* Ranked slots */}
        <div>
          <p className="hand-ranker__slots-label">Rank (tap a hand below to place)</p>
          <ol className="hand-ranker__slots" aria-label="Ranked slots">
            {ranking.map((handIdx, slot) => (
              <li
                key={slot}
                className={'hand-ranker__slot' + slotStatusClass(slot)}
                onDragOver={(e) => {
                  e.preventDefault()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragIdx !== null) {
                    placeCard(dragIdx)
                    setDragIdx(null)
                  }
                }}
              >
                <span className="hand-ranker__slot-rank">
                  {rankLabel(slot, hands.length, order)}
                </span>
                {handIdx !== null && (
                  <div
                    className="hand-ranker__slot-content"
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${hands[handIdx]!.label}, ${rankLabel(slot, hands.length, order)}`}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        moveSlot(slot, -1)
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        moveSlot(slot, 1)
                      }
                    }}
                  >
                    <span className="hand-ranker__card-label">
                      {hands[handIdx]!.label}
                    </span>
                    <span className="hand-ranker__card-fraction">
                      {String(fractions[handIdx]!.n)}/{String(fractions[handIdx]!.d)}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Source pile */}
        <div>
          <p className="hand-ranker__pile-label">Hands</p>
          <ul className="hand-ranker__pile" aria-label="Hand cards">
            {displayOrder.map((handIdx) => {
              const placed = placedIndices.has(handIdx)
              const frac = fractions[handIdx]!
              return (
                <li key={handIdx}>
                  <button
                    type="button"
                    className="hand-ranker__card"
                    disabled={placed || solved || revealed}
                    aria-label={`${hands[handIdx]!.label}, ${String(frac.n)}/${String(frac.d)}`}
                    draggable={!placed && !solved && !revealed}
                    onDragStart={() => setDragIdx(handIdx)}
                    onDragEnd={() => setDragIdx(null)}
                    onClick={() => placeCard(handIdx)}
                  >
                    <span className="hand-ranker__card-label">
                      {hands[handIdx]!.label}
                    </span>
                    <span className="hand-ranker__card-fraction">
                      {String(frac.n)}/{String(frac.d)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </BeatShell>
  )
}
