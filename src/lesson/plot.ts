// Shared SVG plotting helpers for hand-rolled lesson charts. Charts map data to
// pixels through linScale and draw axes/ticks from the SAME scale, so axes and
// data can never drift apart (the class of bug behind "the axes don't work").

export type Scale = (value: number) => number

/** Linear map from a data domain [domainMin, domainMax] to a pixel range. */
export function linScale(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): Scale {
  const span = domainMax - domainMin || 1
  return (value) =>
    rangeMin + ((value - domainMin) / span) * (rangeMax - rangeMin)
}

/**
 * "Nice" tick values spanning [min, max] (~`count` ticks), snapped to 1/2/5×10ⁿ
 * steps. Returns sorted values within the domain; [min] for a degenerate range.
 */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return [min]
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  const rawStep = (hi - lo) / Math.max(1, count)
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const norm = rawStep / mag
  const niceNorm = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10
  const step = niceNorm * mag
  const ticks: number[] = []
  const start = Math.ceil(lo / step) * step
  for (let t = start; t <= hi + step * 1e-9; t += step) {
    ticks.push(Math.abs(t) < step * 1e-9 ? 0 : Number(t.toFixed(10)))
  }
  return ticks
}

/** Compact numeric label for a tick value. */
export function fmtTick(value: number): string {
  if (Number.isInteger(value)) return String(value)
  return Number(value.toFixed(2)).toString()
}
