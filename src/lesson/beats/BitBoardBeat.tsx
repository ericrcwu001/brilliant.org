import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import {
  toBinary,
  fromBinary,
  bitsNeeded,
  multiplyByShift,
  xorAll,
} from '../../engine/binary'

export function BitBoardBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion } = props

  // Narrow interaction shape before hooks; hooks must remain unconditional.
  const ix =
    beat.interaction.type === 'bitBoard' ? beat.interaction : null

  const display = ix?.display ?? 'register'
  const interactive = ix?.interactive !== false

  // ── register state ────────────────────────────────────────────────────────
  // Seed from ix.value if present; default 0.
  const seedValue = BigInt(ix?.value ?? 0)
  const [bitmask, setBitmask] = useState<bigint>(seedValue)

  // ── questions (halving game) state ────────────────────────────────────────
  const nOutcomes = ix?.n ?? 1
  const minQuestions = bitsNeeded(BigInt(nOutcomes))
  const [lo, setLo] = useState(1)
  const [hi, setHi] = useState(nOutcomes)
  const [questionsAsked, setQuestionsAsked] = useState(0)
  const [halvesDone, setHalvesDone] = useState(false)

  // ── statusKey for aria-live refresh ──────────────────────────────────────
  const [statusKey, setStatusKey] = useState(0)

  // ─── early return after all hooks ────────────────────────────────────────
  if (ix === null) return null

  // ── register display helpers ──────────────────────────────────────────────
  // From here ix is known non-null.
  const ixBits = ix.bits
  const ixOp = ix.op
  const ixOperands = ix.operands
  const ixItems = ix.items
  const ixCulprit = ix.culprit

  function numBits(): number {
    if (display !== 'register') return 1
    if (ixBits != null) return ixBits
    const needed = bitsNeeded(bitmask === 0n ? 1n : bitmask)
    return Math.max(needed, 1)
  }

  function toggleBit(bitPos: number) {
    setBitmask((prev) => prev ^ (1n << BigInt(bitPos)))
    setStatusKey((n) => n + 1)
  }

  // ── op-result computation (all via engine, no JS bit ops on result) ───────
  function computeOpResult(): { result: bigint; opLabel: string } | null {
    if (!ixOp || !ixOperands) return null
    const a = BigInt(ixOperands.a)
    switch (ixOp) {
      case 'and-x-minus-1': {
        // x & (x-1) clears lowest set bit. Seed from bitmask (live toggling).
        const x = bitmask
        const xMinus1 = x > 0n ? x - 1n : 0n
        const result = x & xMinus1
        return {
          result,
          opLabel: `${toBinary(x)} & (${toBinary(x)} − 1)`,
        }
      }
      case 'shift': {
        const k = ixOperands.k ?? 0
        const result = multiplyByShift(a, k)
        return {
          result,
          opLabel: `${toBinary(a)} << ${k}`,
        }
      }
      case 'xor': {
        const b = BigInt(ixOperands.b ?? 0)
        const result = xorAll([a, b])
        return {
          result,
          opLabel: `${toBinary(a)} XOR ${toBinary(b)}`,
        }
      }
    }
  }

  // ── groupTest helpers ──────────────────────────────────────────────────────
  function padBinary(n: bigint, width: number): string {
    const s = toBinary(n)
    return s.padStart(width, '0')
  }

  // ── questions: handle a halving step ─────────────────────────────────────
  function handleHalve(answerYes: boolean) {
    if (halvesDone) return
    const mid = Math.floor((lo + hi) / 2)
    const newLo = answerYes ? lo : mid + 1
    const newHi = answerYes ? mid : hi
    setLo(newLo)
    setHi(newHi)
    const nextQ = questionsAsked + 1
    setQuestionsAsked(nextQ)
    setStatusKey((n) => n + 1)
    if (newLo === newHi) {
      setHalvesDone(true)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // ── REGISTER ─────────────────────────────────────────────────────────────
  if (display === 'register') {
    const totalBits = numBits()
    const opResult = computeOpResult()
    const displayVal = bitmask
    const binaryStr = toBinary(displayVal).padStart(totalBits, '0')

    return (
      <BeatShell
        primary={{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }}
      >
        <div className="bi-bitboard">
          <p
            aria-live="polite"
            aria-atomic="true"
            className="bi-bitboard__status"
            key={statusKey}
          >
            {`Value: ${displayVal} (${binaryStr})`}
          </p>

          {/* Bit cell row MSB → LSB */}
          <div className="bi-bitboard__row" role="group" aria-label="Binary register bits">
            {Array.from({ length: totalBits }, (_, i) => {
              // i=0 is MSB; bit position from LSB = totalBits - 1 - i
              const bitPos = totalBits - 1 - i
              const isOn = (displayVal >> BigInt(bitPos)) & 1n
              return (
                <button
                  key={bitPos}
                  type="button"
                  className={`bi-bitboard__cell${isOn ? ' bi-bitboard__cell--on' : ''}`}
                  aria-label={`Bit ${bitPos} (${isOn ? '1' : '0'}), click to toggle`}
                  aria-pressed={Boolean(isOn)}
                  onClick={() => toggleBit(bitPos)}
                >
                  {isOn ? '1' : '0'}
                </button>
              )
            })}
          </div>

          {/* Decimal + binary readout */}
          <div className="bi-bitboard__readout">
            <span>{`Decimal: ${displayVal}`}</span>
            <span>{`Binary: ${binaryStr}`}</span>
          </div>

          {/* Op result panel */}
          {opResult !== null && (
            <div className="bi-bitboard__op" aria-live="polite" aria-atomic="true">
              <p className="bi-bitboard__op-label">{opResult.opLabel}</p>
              <p className="bi-bitboard__op-result">
                {`= ${opResult.result} (${toBinary(opResult.result)})`}
              </p>
              {ixOp === 'and-x-minus-1' && (
                <p className="bi-bitboard__op-note">
                  {'x & (x − 1) clears the lowest set bit'}
                </p>
              )}
              {ixOp === 'shift' && ixOperands && (
                <p className="bi-bitboard__op-note">
                  {`${ixOperands.a} × 2^${ixOperands.k ?? 0} = ${opResult.result}`}
                </p>
              )}
              {ixOp === 'xor' && ixOperands && (
                <p className="bi-bitboard__op-note">
                  {`${ixOperands.a} XOR ${ixOperands.b ?? 0} = ${opResult.result}`}
                </p>
              )}
            </div>
          )}
        </div>
      </BeatShell>
    )
  }

  // ── QUESTIONS (halving game) ───────────────────────────────────────────────
  if (display === 'questions') {
    const isStatic = reducedMotion || !interactive
    const mid = Math.floor((lo + hi) / 2)
    const found = lo === hi
    const showAnswer = isStatic || found || halvesDone

    return (
      <BeatShell
        primary={{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }}
      >
        <div className="bi-bitboard">
          <p
            aria-live="polite"
            aria-atomic="true"
            className="bi-bitboard__status"
            key={statusKey}
          >
            {showAnswer
              ? `Minimum yes/no questions: ${minQuestions} (for ${nOutcomes} outcomes)`
              : `Range: ${lo}–${hi} · Questions asked: ${questionsAsked}`}
          </p>

          {!isStatic && !found && !halvesDone && (
            <div
              className="bi-bitboard__row"
              role="group"
              aria-label={`Is the number ≤ ${mid}?`}
            >
              <p className="bi-bitboard__readout">{`Is the number ≤ ${mid}?`}</p>
              <button
                type="button"
                className="bi-bitboard__btn"
                aria-label={`Yes, the number is ≤ ${mid}`}
                onClick={() => handleHalve(true)}
              >
                {`Yes (≤ ${mid})`}
              </button>
              <button
                type="button"
                className="bi-bitboard__btn"
                aria-label={`No, the number is > ${mid}`}
                onClick={() => handleHalve(false)}
              >
                {`No (> ${mid})`}
              </button>
            </div>
          )}

          <div className="bi-bitboard__readout">
            <span>{`Minimum questions needed: ${minQuestions}`}</span>
            {!isStatic && (
              <span>{`Questions asked so far: ${questionsAsked}`}</span>
            )}
          </div>

          {(found || halvesDone) && lo === hi && (
            <p className="bi-bitboard__status" role="status">
              {`Found: the number is ${lo}`}
            </p>
          )}
        </div>
      </BeatShell>
    )
  }

  // ── GROUP TEST (poisoned-wine grid) ────────────────────────────────────────
  if (display === 'groupTest') {
    const items = ixItems ?? 1
    const culprit = ixCulprit ?? 0
    const k = bitsNeeded(BigInt(items))
    const culpritBig = BigInt(culprit)
    const culpritBin = padBinary(culpritBig, k)
    // Recover culprit by reading the dead/alive pattern back as binary
    const recovered = fromBinary(culpritBin)

    return (
      <BeatShell
        primary={{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }}
      >
        <div className="bi-bitboard">
          <p
            aria-live="polite"
            aria-atomic="true"
            className="bi-bitboard__status"
          >
            {`${k} testers distinguish ${items} items. Culprit: item ${culprit} → recovered index: ${recovered}`}
          </p>

          {/* Grid: k tester rows × items columns */}
          <div
            className="bi-bitboard__grid"
            role="table"
            aria-label="Group test grid"
          >
            {/* Header row: item indices in binary */}
            <div className="bi-bitboard__row" role="row">
              <span
                className="bi-bitboard__tester"
                role="columnheader"
                aria-label="Tester column"
              >
                {'Tester'}
              </span>
              {Array.from({ length: items }, (_, col) => (
                <span
                  key={col}
                  className="bi-bitboard__cell"
                  role="columnheader"
                  aria-label={`Item ${col} binary ${padBinary(BigInt(col), k)}`}
                >
                  {padBinary(BigInt(col), k)}
                </span>
              ))}
            </div>

            {/* Tester rows: one per bit position */}
            {Array.from({ length: k }, (_, testerIdx) => {
              return (
                <div
                  key={testerIdx}
                  className="bi-bitboard__row"
                  role="row"
                  aria-label={`Tester ${testerIdx + 1}`}
                >
                  <span
                    className="bi-bitboard__tester"
                    role="rowheader"
                  >
                    {`T${testerIdx + 1}`}
                  </span>
                  {Array.from({ length: items }, (_, col) => {
                    const colBin = padBinary(BigInt(col), k)
                    // Tester row gets item iff that bit is 1 in the item's binary label
                    const bit = colBin[testerIdx] === '1'
                    // Is this the culprit column?
                    const isCulprit = col === culprit
                    const isDead = isCulprit && bit
                    return (
                      <span
                        key={col}
                        className={`bi-bitboard__cell${isDead ? ' bi-bitboard__cell--on' : ''}`}
                        role="cell"
                        aria-label={
                          isDead
                            ? `Item ${col} tester ${testerIdx + 1}: positive (dead)`
                            : bit
                            ? `Item ${col} tester ${testerIdx + 1}: tested`
                            : `Item ${col} tester ${testerIdx + 1}: not tested`
                        }
                      >
                        {bit ? (isDead ? '✕' : '1') : '0'}
                      </span>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Pattern readout */}
          <div className="bi-bitboard__readout">
            <span>{`Dead pattern: ${culpritBin} → item ${recovered}`}</span>
          </div>
        </div>
      </BeatShell>
    )
  }

  // Fallback (shouldn't happen if schema is valid)
  return (
    <BeatShell
      primary={{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }}
    >
      <div className="bi-bitboard">
        <p className="bi-bitboard__status">{'Unknown bitBoard display.'}</p>
      </div>
    </BeatShell>
  )
}
