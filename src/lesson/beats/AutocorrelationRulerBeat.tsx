// Self-overlap ruler (build-brief §4.4 / §6, L5+L6 self-only). Slides the
// beat-level `pattern` over itself; tapping a shift reveals (engine-driven, via
// autocorrelation) whether that length is a border, and each border adds its
// concrete 2^L chip to a running total. The concrete number leads; the
// binary/Conway form is the beat's collapsed interviewNote layer (never the
// symbol first). DOM mono rows, tap-only, aria-live, no essential motion.

import { useMemo, useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { autocorrelation } from '../../engine/correlation'

export function AutocorrelationRulerBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props
  const target = beat.pattern ?? pattern
  const n = target.length
  const borders = useMemo(() => new Set(autocorrelation(target).overlaps), [target])
  // Examine borders longest-first so the running 2^L total builds like Σ2^L.
  const lengths = useMemo(
    () => Array.from({ length: n }, (_, idx) => n - idx),
    [n],
  )
  const [examined, setExamined] = useState<Set<number>>(new Set())
  const [noteOpen, setNoteOpen] = useState(false)

  if (beat.interaction.type !== 'autocorrelationRuler') return null

  const total = [...examined]
    .filter((L) => borders.has(L))
    .reduce((acc, L) => acc + 2 ** L, 0)
  const complete = examined.size === n
  const interviewNote = beat.interviewNote

  const primary = complete
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check every shift', enabled: false, onClick: () => {} }

  return (
    <BeatShell primary={primary}>
      <div className="ruler">
        <div className="ruler__rows">
          {lengths.map((L) => {
            const offset = n - L // shift of the lower copy
            const isBorder = borders.has(L)
            const seen = examined.has(L)
            return (
              <button
                key={L}
                type="button"
                className={
                  'ruler__row' +
                  (seen ? (isBorder ? ' ruler__row--border' : ' ruler__row--none') : '')
                }
                aria-pressed={seen}
                aria-label={
                  seen
                    ? `Shift ${offset}: ${isBorder ? `overlap of ${L}, worth ${2 ** L}` : 'no overlap'}`
                    : `Check shift ${offset}`
                }
                onClick={() =>
                  setExamined((prev) => {
                    const next = new Set(prev)
                    next.add(L)
                    return next
                  })
                }
              >
                <span className="ruler__top">
                  {target.split('').map((c, i) => (
                    <span key={i} className="ruler__cell">
                      {c}
                    </span>
                  ))}
                </span>
                <span className="ruler__bot" style={{ marginLeft: `${offset * 1.4}em` }}>
                  {target.split('').map((c, i) => (
                    <span
                      key={i}
                      className={
                        'ruler__cell' +
                        (seen && isBorder && i < L ? ' ruler__cell--match' : '')
                      }
                    >
                      {c}
                    </span>
                  ))}
                </span>
                <span className="ruler__verdict">
                  {seen ? (isBorder ? `overlap ${L} → +${2 ** L}` : 'no overlap') : 'tap'}
                </span>
              </button>
            )
          })}
        </div>

        <p className="ruler__total" role="status" aria-live="polite">
          Overlap total so far: <strong>{total}</strong>
          {complete && <> — the wait for {target}.</>}
        </p>

        {interviewNote && (
          <div className="ruler__note">
            {noteOpen ? (
              <p className="ruler__note-body">{interviewNote}</p>
            ) : (
              <button
                type="button"
                className="ruler__note-toggle"
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
