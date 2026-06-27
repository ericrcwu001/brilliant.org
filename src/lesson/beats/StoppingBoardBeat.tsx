// Optimal Stopping board (concept-optimal-stopping). One renderer, three displays
// (Wave-0 contract, cf. ChainBoardBeat / RaceSimBeat):
//   'sequence'    — watch one irrevocable run: candidates arrive as bars (taller =
//                   better); the look-then-leap rule rejects the first cutoff−1, then
//                   takes the first record. Ends win/miss. Replayable; cutoff is
//                   adjustable when interactive.
//   'cutoff'      — the success-probability-vs-cutoff curve; drag the threshold r and
//                   watch pₙ(r) rise then peak at the optimal r*.
//   'convergence' — optimal cutoff fraction r*/n and success pₙ(r*) across many n, both
//                   hugging 1/e ≈ 0.368.
// Ungraded (no hint ladder / grade); every displayed value comes from
// src/engine/optimalStopping.ts. Reduced-motion renders the final frame; an
// aria-live mirror narrates each change.

import { useEffect, useState, type ReactNode } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import {
  secretarySuccess,
  optimalCutoff,
  runStrategy,
  formatRational,
  ratToNumber,
} from '../../engine/optimalStopping'

const STEP_MS = 520 // candidate-reveal cadence (≈ --dur-tell)
const E_INV = 1 / Math.E // 0.3678…, the 1/e reference line

const pct = (x: number): string => `${Math.round(x * 100)}%`

// ── sequence ────────────────────────────────────────────────────────────────

function SequenceView({
  n,
  order,
  cutoff: initialCutoff,
  interactive,
  reducedMotion,
}: {
  n: number
  order: number[]
  cutoff: number
  interactive: boolean
  reducedMotion: boolean
}) {
  const [cutoff, setCutoff] = useState(initialCutoff)
  const [revealed, setRevealed] = useState(reducedMotion ? n : 0)

  // Stepwise reveal once on mount (reduced-motion starts on the final frame).
  // setState only fires inside the async interval callback (never synchronously in
  // the effect body). The cutoff slider then re-derives look/leap/selected on the
  // already-revealed bars — instant, no re-animation.
  useEffect(() => {
    if (reducedMotion) return
    let i = 0
    const id = setInterval(() => {
      i += 1
      setRevealed(i)
      if (i >= n) clearInterval(id)
    }, STEP_MS)
    return () => clearInterval(id)
  }, [n, reducedMotion])

  const result = runStrategy(order, cutoff)
  const done = revealed >= n
  const best = Math.min(...order)

  return (
    <div className="stopboard stopboard--sequence">
      <p className="stopboard__caption">
        Look phase: reject the first {cutoff - 1}. Then leap: take the first candidate better than
        all of them.
      </p>
      <div className="stopboard__lanes" role="img" aria-label={`Run of ${n} candidates, cutoff ${cutoff}`}>
        {order.map((rank, i) => {
          const isRevealed = i < revealed
          const inLook = i < cutoff - 1
          const isSelected = done && i === result.selectedIndex
          const isBest = rank === best
          // Height ∝ quality (rank 1 = best = tallest).
          const h = Math.round((100 * (n - rank + 1)) / n)
          const cls =
            'stopboard__cand' +
            (isRevealed ? ' stopboard__cand--in' : '') +
            (inLook ? ' stopboard__cand--look' : ' stopboard__cand--leap') +
            (isSelected ? ' stopboard__cand--selected' : '')
          return (
            <div key={i} className="stopboard__lane">
              <div className="stopboard__bar-track">
                <div className={cls} style={{ height: `${isRevealed ? h : 0}%` }}>
                  {isRevealed && isBest && <span className="stopboard__crown" aria-hidden="true">★</span>}
                </div>
              </div>
              <span className="stopboard__pos">{i + 1}</span>
              {i === cutoff - 2 && <span className="stopboard__leapline" aria-hidden="true" />}
            </div>
          )
        })}
      </div>
      <p className="stopboard__live" aria-live="polite">
        {done
          ? result.win
            ? `Leapt at candidate #${result.selectedIndex + 1} — the BEST. Win.`
            : `Took candidate #${result.selectedIndex + 1} (rank ${result.selectedRank}). Missed the best (★).`
          : 'Candidates arriving…'}
      </p>
      {interactive && (
        <label className="stopboard__control">
          <span>Cutoff r = {cutoff} (reject first {cutoff - 1})</span>
          <input
            type="range"
            min={1}
            max={n}
            step={1}
            value={cutoff}
            aria-label="Cutoff"
            onChange={(e) => setCutoff(Number(e.target.value))}
          />
        </label>
      )}
    </div>
  )
}

// ── cutoff curve ──────────────────────────────────────────────────────────────

function CutoffView({
  n,
  cutoff: initialCutoff,
}: {
  n: number
  cutoff: number
}) {
  const [r, setR] = useState(initialCutoff)
  const curve = Array.from({ length: n }, (_, i) => secretarySuccess(n, i + 1))
  const opt = optimalCutoff(n)
  const maxP = ratToNumber(opt.p)
  const pr = secretarySuccess(n, r)

  return (
    <div className="stopboard stopboard--cutoff">
      <div
        className="stopboard__curve"
        role="img"
        aria-label={`Success probability versus cutoff for ${n} candidates; peak at r = ${opt.r}`}
      >
        {curve.map((p, i) => {
          const r1 = i + 1
          const h = Math.round((100 * ratToNumber(p)) / maxP)
          const cls =
            'stopboard__cbar' +
            (r1 === r ? ' stopboard__cbar--active' : '') +
            (r1 === opt.r ? ' stopboard__cbar--peak' : '')
          return (
            <div key={i} className="stopboard__clane">
              <div className="stopboard__bar-track">
                <div className={cls} style={{ height: `${h}%` }} />
              </div>
              <span className="stopboard__pos">{r1}</span>
            </div>
          )
        })}
      </div>
      <p className="stopboard__headline" aria-live="polite">
        Reject first {r - 1} of {n} → P(best) = <strong>{formatRational(pr)}</strong> ≈{' '}
        {pct(ratToNumber(pr))}
        {r === opt.r && <span className="stopboard__peak-tag"> ← peak</span>}
      </p>
      <label className="stopboard__control">
        <span>Cutoff r = {r}</span>
        <input
          type="range"
          min={1}
          max={n}
          step={1}
          value={r}
          aria-label="Cutoff"
          onChange={(e) => setR(Number(e.target.value))}
        />
      </label>
    </div>
  )
}

// ── convergence ───────────────────────────────────────────────────────────────

function ConvergenceView({ nValues }: { nValues: number[] }) {
  const rows = nValues.map((n) => {
    const { r, p } = optimalCutoff(n)
    return { n, r, ratio: r / n, p: ratToNumber(p) }
  })
  return (
    <div className="stopboard stopboard--convergence">
      <table className="stopboard__table">
        <thead>
          <tr>
            <th>Candidates n</th>
            <th>Optimal cutoff r*</th>
            <th>r*/n</th>
            <th>P(best)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.n}>
              <td>{row.n}</td>
              <td>{row.r}</td>
              <td>{pct(row.ratio)}</td>
              <td>{pct(row.p)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="stopboard__live" aria-live="polite">
        Both r*/n and P(best) settle toward 1/e ≈ {pct(E_INV)} as n grows — the 37% rule.
      </p>
    </div>
  )
}

// ── dispatcher ──────────────────────────────────────────────────────────────

export function StoppingBoardBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion } = props
  const it = beat.interaction.type === 'stoppingBoard' ? beat.interaction : null

  if (!it) return null

  const primary = {
    label: isLast ? 'Finish' : 'Continue',
    enabled: true,
    onClick: onAdvance,
  }

  let body: ReactNode
  if (it.display === 'sequence') {
    body = (
      <SequenceView
        n={it.n}
        order={it.order ?? Array.from({ length: it.n }, (_, i) => i + 1)}
        cutoff={it.cutoff ?? 1}
        interactive={it.interactive ?? false}
        reducedMotion={reducedMotion}
      />
    )
  } else if (it.display === 'cutoff') {
    body = <CutoffView n={it.n} cutoff={it.cutoff ?? optimalCutoff(it.n).r} />
  } else {
    body = <ConvergenceView nValues={it.nValues ?? [it.n]} />
  }

  return <BeatShell primary={primary}>{body}</BeatShell>
}
