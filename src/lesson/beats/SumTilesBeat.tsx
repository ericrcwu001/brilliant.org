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

  const complete = placed.size === overlaps.length
  const runningTotal = [...placed].reduce((acc, k) => acc + 2 ** k, 0)
  const interviewNote = beat.interviewNote

  const primary = complete
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Add every overlap', enabled: false, onClick: () => {} }

  return (
    <BeatShell primary={primary}>
      <div className="sumtiles">
        <p
          className={'sumtiles__kicker' + (complete ? ' sumtiles__kicker--done' : '')}
          role="status"
          aria-live="polite"
        >
          {complete
            ? `All overlaps in — E[wait for ${target}] = ${sum}.`
            : `Tap each overlap tile to add it to the wait for ${target}.`}
        </p>

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
                2<sup>{k}</sup> = {2 ** k}
              </button>
            )
          })}
        </div>

        <div className="sumtiles__equation" aria-hidden="true">
          <span className="sumtiles__eq-lhs">E[wait for {target}] =</span>
          {overlaps.map((k, i) => (
            <span key={k} className="sumtiles__eq-term">
              {i > 0 && <span className="sumtiles__eq-plus">+</span>}
              <span className={'sumtiles__slot' + (placed.has(k) ? ' sumtiles__slot--filled' : '')}>
                {placed.has(k) ? String(2 ** k) : '\u25a1'}
              </span>
            </span>
          ))}
          {complete && <span className="sumtiles__eq-result">= {runningTotal}</span>}
        </div>

        <div className="sumtiles__borders">
          <p className="sumtiles__borders-label">Where these come from</p>
          <div className="sumtiles__border-rows">
            {overlaps.map((L) => {
              const prefix = target.slice(0, L)
              const suffix = target.slice(target.length - L)
              return (
                <div key={L} className="sumtiles__border-row">
                  <span className="sumtiles__border-match">
                    length {L}: <strong>{prefix}</strong> = <strong>{suffix}</strong>
                  </span>
                  <span className="sumtiles__border-value">
                    {'\u2192 '}2<sup>{L}</sup> = {2 ** L}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

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
