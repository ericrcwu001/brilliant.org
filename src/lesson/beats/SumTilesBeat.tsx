// Σ2^L tile builder (build-brief §4.4, widget catalog). Derives the chips from
// the beat-level `pattern`'s self-overlap borders (autocorrelation, the same
// engine that proves expectedWaitFair). The learner taps each 2^k chip into the
// running sum; when every border chip is in, the total snaps to the closed form
// E[wait] = Σ2^L. Concrete-first (the running number leads); binary/Conway forms
// relegate to the beat's interviewNote. Tap-only, aria-live, no motion needed.

import { useMemo, useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { autocorrelation } from '../../engine/correlation'

export function SumTilesBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props
  const target = beat.pattern ?? pattern
  const { overlaps, sum } = useMemo(() => autocorrelation(target), [target])
  const [placed, setPlaced] = useState<Set<number>>(new Set())
  const [noteOpen, setNoteOpen] = useState(false)

  if (beat.interaction.type !== 'sumTiles') return null

  const runningTotal = [...placed].reduce((acc, k) => acc + 2 ** k, 0)
  const complete = placed.size === overlaps.length
  const interviewNote = beat.interviewNote

  const primary = complete
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Add every overlap', enabled: false, onClick: () => {} }

  return (
    <BeatShell primary={primary}>
      <div className="sumtiles">
        <div className="sumtiles__chips" aria-label="Overlap terms">
          {overlaps.map((k) => {
            const on = placed.has(k)
            return (
              <button
                key={k}
                type="button"
                className={'token token--const' + (on ? ' token--placed' : '')}
                aria-pressed={on}
                onClick={() =>
                  setPlaced((prev) => {
                    const next = new Set(prev)
                    if (next.has(k)) next.delete(k)
                    else next.add(k)
                    return next
                  })
                }
              >
                2^{k} = {2 ** k}
              </button>
            )
          })}
        </div>

        <p className="sumtiles__total" role="status" aria-live="polite">
          Running total: <strong>{runningTotal}</strong>
          {complete && (
            <>
              {' '}— that&apos;s E[wait] for {target} = <strong>{sum}</strong>
            </>
          )}
        </p>

        {interviewNote && (
          <div className="sumtiles__note">
            {noteOpen ? (
              <p className="sumtiles__note-body">{interviewNote}</p>
            ) : (
              <button
                type="button"
                className="sumtiles__note-toggle"
                aria-expanded={false}
                onClick={() => setNoteOpen(true)}
              >
                For the interview
              </button>
            )}
          </div>
        )}
      </div>
    </BeatShell>
  )
}
