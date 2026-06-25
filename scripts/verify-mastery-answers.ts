// Ground-truth answers from the pure probability engine for quiz authoring.
// Run: ./node_modules/.bin/tsx scripts/verify-mastery-answers.ts

import { buildAutomaton } from '../src/engine/automaton'
import { bestBeater, penneyOdds } from '../src/engine/race'
import { buildWalk } from '../src/engine/walk'
import type { Rational } from '../src/engine/types'

const P = 0.5

function allPatterns(length: number): string[] {
  const out: string[] = []
  const n = 2 ** length
  for (let i = 0; i < n; i++) {
    let s = ''
    for (let b = length - 1; b >= 0; b--) {
      s += i & (1 << b) ? 'H' : 'T'
    }
    out.push(s)
  }
  return out
}

function decimal(r: Rational): string {
  return (r.n / r.d).toFixed(6).replace(/\.?0+$/, '') || '0'
}

function frac(r: Rational): string {
  return `${r.n}/${r.d}=${decimal(r)}`
}

function section(title: string) {
  console.log('')
  console.log('='.repeat(72))
  console.log(title)
  console.log('='.repeat(72))
}

// --- 1. Hitting times ---
section('1. HITTING TIMES (p=0.5)')

for (const len of [2, 3, 4]) {
  console.log('')
  console.log(`--- length ${len} ---`)
  for (const pattern of allPatterns(len)) {
    const E0 = buildAutomaton(pattern, P).expectedTimes.E0
    console.log(`E[${pattern}] = ${E0}`)
  }
}

// --- 2. Penney counters ---
section('2. PENNEY COUNTERS (length-3 patterns, p=0.5)')

for (const b of allPatterns(3)) {
  const counter = bestBeater(b)
  const odds = penneyOdds(counter, b)
  console.log(
    `counter to ${b} = ${counter}, P(${counter} before ${b}) = ${frac(odds.aBeatsB)}`,
  )
}

console.log('')
console.log('--- THH vs HHH (both directions) ---')
{
  const ab = penneyOdds('THH', 'HHH')
  console.log(`P(THH before HHH) = ${frac(ab.aBeatsB)}`)
  console.log(`P(HHH before THH) = ${frac(ab.bBeatsA)}`)
}

// --- 3. Gambler's ruin ---
section("3. GAMBLER'S RUIN (p=0.5)")

for (const N of [4, 6, 8, 10, 12]) {
  const walk = buildWalk(N, P)
  console.log('')
  console.log(`--- N=${N} ---`)
  for (let i = 1; i < N; i++) {
    const win = walk.reachProb[i]
    const steps = walk.duration[i]
    console.log(
      `N=${N} start=${i}: P(win)=${frac(win)}, E[steps]=${steps.n / steps.d}`,
    )
  }
}
