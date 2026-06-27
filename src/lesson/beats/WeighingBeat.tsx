import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { weighingsForN, balancedTernary } from '../../engine/binary'

// Tilt options for the scale display: -1 = left heavy, 0 = balanced, 1 = right heavy
type Tilt = -1 | 0 | 1

export function WeighingBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion } = props

  // Narrow interaction shape before hooks; hooks must remain unconditional.
  const ix =
    beat.interaction.type === 'weighing' ? beat.interaction : null

  const display = ix?.display ?? 'scale'
  const interactive = ix?.interactive !== false

  // ── scale state ───────────────────────────────────────────────────────────
  const [tilt, setTilt] = useState<Tilt | null>(null)
  const [weighingsCount, setWeighingsCount] = useState(0)
  const [statusKey, setStatusKey] = useState(0)

  // ─── early return after all hooks ────────────────────────────────────────
  if (ix === null) return null

  // ── scale helpers ─────────────────────────────────────────────────────────
  function handleTilt(t: Tilt) {
    setTilt(t)
    setWeighingsCount((n) => n + 1)
    setStatusKey((k) => k + 1)
  }

  function tiltLabel(t: Tilt): string {
    if (t === -1) return 'Left heavy'
    if (t === 1) return 'Right heavy'
    return 'Balanced'
  }

  function tiltAriaLabel(t: Tilt): string {
    if (t === -1) return 'Left pan heavier'
    if (t === 1) return 'Right pan heavier'
    return 'Pans balanced'
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // ── SCALE ─────────────────────────────────────────────────────────────────
  if (display === 'scale') {
    const items = ix.items ?? 1
    const directionKnown = ix.directionKnown ?? false
    const minWeighings = weighingsForN(BigInt(items), directionKnown)
    const isStatic = reducedMotion || !interactive

    return (
      <BeatShell
        primary={{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }}
      >
        <div className="bi-weighing">
          <p
            aria-live="polite"
            aria-atomic="true"
            className="bi-weighing__status"
            key={statusKey}
          >
            {isStatic
              ? `Minimum weighings: ${minWeighings} (for ${items} coins, direction ${directionKnown ? 'known' : 'unknown'})`
              : tilt !== null
              ? `${tiltLabel(tilt)} · Weighings so far: ${weighingsCount}`
              : `Tap a pan to record a tilt (${items} coins, direction ${directionKnown ? 'known' : 'unknown'})`}
          </p>

          {/* Two-pan balance visual */}
          <div
            className="bi-weighing__pans"
            role="img"
            aria-label={
              tilt === null
                ? 'Balance scale, no reading yet'
                : tiltAriaLabel(tilt)
            }
          >
            <div
              className={`bi-weighing__pan bi-weighing__pan--left${tilt === -1 ? ' bi-weighing__pan--down' : tilt === 1 ? ' bi-weighing__pan--up' : ''}`}
              aria-label="Left pan"
            >
              {'Left'}
            </div>
            <div
              className={`bi-weighing__pan bi-weighing__pan--right${tilt === 1 ? ' bi-weighing__pan--down' : tilt === -1 ? ' bi-weighing__pan--up' : ''}`}
              aria-label="Right pan"
            >
              {'Right'}
            </div>
          </div>

          {/* Three-way tilt buttons */}
          {!isStatic && (
            <div
              className="bi-weighing__tilt-btns"
              role="group"
              aria-label="Record weighing result"
            >
              {([-1, 0, 1] as Tilt[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`bi-weighing__tilt-btn${tilt === t ? ' bi-weighing__tilt-btn--active' : ''}`}
                  aria-label={tiltAriaLabel(t)}
                  aria-pressed={tilt === t}
                  onClick={() => handleTilt(t)}
                >
                  {t === -1 ? '← Left heavy' : t === 1 ? 'Right heavy →' : 'Balanced'}
                </button>
              ))}
            </div>
          )}

          {/* Weighings counter */}
          <div className="bi-weighing__counter" aria-live="polite" aria-atomic="true">
            {!isStatic && (
              <span>{`Weighings used: ${weighingsCount}`}</span>
            )}
            <span>{`Minimum weighings: ${minWeighings}`}</span>
          </div>

          {/* Base-3 framing */}
          <p className="bi-weighing__status">
            {`Each weighing gives 3 outcomes — a base-3 digit.`}
          </p>
        </div>
      </BeatShell>
    )
  }

  // ── TERNARY (balanced-ternary placement) ──────────────────────────────────
  if (display === 'ternary') {
    const target = ix.target ?? 1
    const weightSet = ix.weights?.set ?? []

    // Sort weights largest-first as required by balancedTernary
    const sortedWeights = [...weightSet].sort((a, b) => b - a)
    const weightsBig = sortedWeights.map(BigInt)

    // Compute the balanced-ternary placement via engine
    let coeffStr = ''
    let errorMsg = ''
    try {
      coeffStr = balancedTernary(BigInt(target), weightsBig)
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : String(e)
    }

    // Parse coefficients: "+1", "-1", "0"
    const coeffs: string[] = coeffStr ? coeffStr.split(',') : []

    // Build the equation string: target = Σ ±weight
    function buildEquation(): string {
      const terms: string[] = []
      for (let i = 0; i < sortedWeights.length; i++) {
        const c = coeffs[i]
        const w = sortedWeights[i]
        if (c === '+1') terms.push(`+${w}`)
        else if (c === '-1') terms.push(`−${w}`)
        // 0 → unused, skip in the sum
      }
      const eq = terms.join(' ') || '0'
      return `${target} = ${eq}`
    }

    return (
      <BeatShell
        primary={{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }}
      >
        <div className="bi-weighing">
          <p
            aria-live="polite"
            aria-atomic="true"
            className="bi-weighing__status"
          >
            {errorMsg
              ? `Cannot balance: ${errorMsg}`
              : `Balanced-ternary placement for target mass ${target}`}
          </p>

          {!errorMsg && (
            <>
              {/* Weight placement chips */}
              <div
                className="bi-weighing__ternary"
                role="list"
                aria-label="Weight placements"
              >
                {sortedWeights.map((w, i) => {
                  const c = coeffs[i]
                  const modClass =
                    c === '+1'
                      ? 'bi-weighing__weight--plus'
                      : c === '-1'
                      ? 'bi-weighing__weight--minus'
                      : 'bi-weighing__weight--off'
                  const placement =
                    c === '+1'
                      ? 'opposite pan (adds)'
                      : c === '-1'
                      ? 'same pan as mass (subtracts)'
                      : 'unused'
                  return (
                    <div
                      key={i}
                      className={`bi-weighing__weight ${modClass}`}
                      role="listitem"
                      aria-label={`Weight ${w}: ${placement}`}
                    >
                      <span className="bi-weighing__weight-sign">
                        {c === '+1' ? '+' : c === '-1' ? '−' : '0'}
                      </span>
                      <span className="bi-weighing__weight-val">{w}</span>
                    </div>
                  )
                })}
              </div>

              {/* Equation readout */}
              <p className="bi-weighing__eq" aria-live="polite" aria-atomic="true">
                {buildEquation()}
              </p>

              {/* Legend */}
              <div className="bi-weighing__status">
                <span>{'+: weight on opposite pan (subtracts from target side)'}</span>
                <span>{'−: weight on same pan as mass (adds to target side)'}</span>
                <span>{'0: unused'}</span>
              </div>
            </>
          )}
        </div>
      </BeatShell>
    )
  }

  // Fallback (shouldn't happen if schema is valid)
  return (
    <BeatShell
      primary={{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }}
    >
      <div className="bi-weighing">
        <p className="bi-weighing__status">{'Unknown weighing display.'}</p>
      </div>
    </BeatShell>
  )
}
