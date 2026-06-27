// Validates every committed fixture against its Zod schema, cross-checks
// equation-tile targets against the engine, and enforces the remaining-lesson
// inclusivity contract (build-brief §4.5 / §10). Exits non-zero with a readable
// error so a broken or non-inclusive fixture fails CI and `npm run validate`
// before it can be seeded.

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { z } from 'zod'
import {
  CanonicalRecurrenceSchema,
  CourseSchema,
  LessonSchema,
  SnapshotSchema,
} from '../src/content/schema'
import type { Beat, Course, Lesson } from '../src/content/schema'
import { isGradedBeat } from '../src/lesson/mastery'
import { METHODS, CONFUSABLE } from '../src/content/methods'
import { buildAutomaton, reduce as reduceRational, ratAdd, ratMul } from '../src/engine/automaton'
import {
  nCk,
  nPk,
  factorial,
  pascalRow,
  product,
  unionSize,
  inclusionExclusion,
  derangements,
  pigeonholeMin,
  forcesCollision,
  probabilityFromCounts,
  reduce,
} from '../src/engine/combinatorics'
import {
  bayesPosterior, sequentialPosterior, naturalFrequencies,
  posteriorOdds, oddsToProb, bayesUpdate, smallestKCross, formatRational,
} from '../src/engine/bayes'
import type { Rational } from '../src/engine/types'
import {
  expectedValue,
  totalExpectation,
  indicatorExpectation,
  harmonic,
  couponCollector,
  distinctAfterDraws,
  orderStatUniform,
  noodleLoops,
} from '../src/engine/expectation'
import {
  buildChain, matrixPower, classifyStates, absorptionProbabilities, expectedAbsorptionTime,
  stationaryDistribution, kacReturnTime, detailedBalance, pagerank, formatVector,
} from '../src/engine/markov'
import {
  secretarySuccess, naiveSuccess, successCurve, optimalCutoff, runStrategy,
  formatRational as formatRationalOS,
} from '../src/engine/optimalStopping'
import {
  pureNashEquilibria as gtPureNash,
  iesdsSolution as gtIesds,
  strictlyDominatedRows as gtDomRows,
  saddlePoint as gtSaddle,
  mixedValue2x2 as gtMixedValue,
  mixedNash2x2 as gtMixedNash,
  backwardInduction as gtBackward,
  pirateGame as gtPirate,
  tigerSheepEaten as gtTiger,
  nimSum as gtNimSum,
  nimWinningMoves as gtNimMoves,
  subtractionWinningMove as gtSubMove,
  subtractionIsWinning as gtSubWin,
  formatRational as gtFmt,
  formatVector as gtVec,
  type Game as GtGame,
  type GameTreeNode as GtNode,
} from '../src/engine/gameTheory'
import {
  covariance as covCovariance,
  rhoSquared as covRhoSquared,
  corrRange as covCorrRange,
  variance as covVariance,
  formatRational as covFmt,
  formatRangePair as covFmtRange,
  type JointCell as CovJointCell,
  type Pmf as CovPmf,
} from '../src/engine/covariance'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures')

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(join(fixturesDir, file), 'utf8'))
}

function fail(msg: string): never {
  console.error(`\n✗ ${msg}`)
  process.exit(1)
}

function validate(file: string, schema: z.ZodType): unknown {
  const result = schema.safeParse(readJson(file))
  if (!result.success) {
    console.error(`\n✗ ${file} failed schema validation:\n`)
    console.error(z.prettifyError(result.error))
    process.exit(1)
  }
  console.log(`✓ ${file}`)
  return result.data
}

// ── 1. Schema validation: every lesson-*.json, all course-*.json, plus support fixtures.
const lessonFiles = readdirSync(fixturesDir)
  .filter((f) => /^lesson-.*\.json$/.test(f))
  .sort()
const lessons = lessonFiles.map((f) => validate(f, LessonSchema) as Lesson)

const courseFiles = readdirSync(fixturesDir)
  .filter((f) => /^course-.*\.json$/.test(f))
  .sort()
const courses = courseFiles.map((f) => validate(f, CourseSchema) as Course)

validate('example-snapshot.json', SnapshotSchema)
validate('canonical.example.json', CanonicalRecurrenceSchema)

// ── 1b. Firestore-safe gate: Firestore forbids directly-nested arrays (an array
// element that is itself an array). Walk every raw fixture object and fail fast
// if any such nested array is found. This would have caught the old matrix shape.
function firstNestedArrayPath(v: unknown, path: string): string | null {
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) {
      if (Array.isArray(v[i])) return `${path}[${i}]`
      const deeper = firstNestedArrayPath(v[i], `${path}[${i}]`)
      if (deeper) return deeper
    }
  } else if (v && typeof v === 'object') {
    for (const k of Object.keys(v as object)) {
      const deeper = firstNestedArrayPath((v as Record<string, unknown>)[k], `${path}.${k}`)
      if (deeper) return deeper
    }
  }
  return null
}
{
  const allFixtureFiles = [...lessonFiles, ...courseFiles]
  for (const file of allFixtureFiles) {
    const raw = readJson(file)
    const bad = firstNestedArrayPath(raw, '')
    if (bad) fail(`Firestore nested-array violation: ${file} ${bad}`)
  }
  console.log(`✓ Firestore-safe (no nested arrays): ${allFixtureFiles.length} fixtures`)
}

// ── 1c. Method-tag gate (Foundation B, spec-00). Every GRADED beat (the
// src/lesson/mastery.ts predicate — the same set that drives the mastery signal)
// must carry a valid schemaId. Flag-gated (REQUIRE_SCHEMA_ID=1) until the one-time
// backfill lands; then this becomes unconditional (R4: foundation enforced for good).
const VALID_METHOD_IDS = new Set(Object.keys(METHODS))
{
  const enforce = process.env.REQUIRE_SCHEMA_ID === '1' // ← delete this line + the `if (enforce)` guard at end of backfill
  const offenders: string[] = []
  for (const lesson of lessons) {
    for (const beat of lesson.beats) {
      if (!isGradedBeat(beat)) continue
      const sid = (beat as { schemaId?: string }).schemaId
      if (sid == null) offenders.push(`${lesson.lessonId}/${beat.beatId}: graded beat missing schemaId`)
      else if (!VALID_METHOD_IDS.has(sid)) offenders.push(`${lesson.lessonId}/${beat.beatId}: schemaId "${sid}" not in registry`)
    }
  }
  if (offenders.length > 0) {
    if (enforce) {
      console.error('\n✗ method-tag gate:')
      for (const o of offenders) console.error(`  - ${o}`)
      process.exit(1)
    } else {
      console.warn(`⚠ method-tag gate (advisory; set REQUIRE_SCHEMA_ID=1 to enforce): ${offenders.length} graded beats missing/invalid schemaId`)
    }
  } else {
    console.log(`✓ method-tag gate: every graded beat carries a valid schemaId`)
  }
}

// ── 2. L0 on-ramp golden (L1 §5.7): the single-letter "H" automaton waits 2.
const hAutomaton = buildAutomaton('H', 0.5)
if (hAutomaton.expectedTimes.E0 !== 2) {
  fail(`E[H] expected 2, got ${hAutomaton.expectedTimes.E0}`)
}
console.log('✓ E[H] = 2 (L0 on-ramp)')

// ── 2b. Bayes engine goldens — inline fact-check independent of fixtures;
// mirrors the E[H]=2 golden above so bayes.ts correctness fails CI directly.
{
  const R = (n: number, d = 1): Rational => ({ n, d })
  const G: Array<[string, Rational, string]> = [
    ['two-coin H',    bayesUpdate(R(1,2), R(1), R(1,2)),                  '2/3'],
    ['two-coin HH',   sequentialPosterior(R(1,2), R(1), R(1,2), 2),       '4/5'],
    ['boys-girls',    bayesUpdate(R(1,4), R(1), R(2,3)),                  '1/3'],
    ['two-urn',       bayesUpdate(R(1,2), R(2,3), R(1,3)),                '2/3'],
    ['disease 1%',    bayesUpdate(R(1,100), R(99,100), R(1,100)),         '1/2'],
    ['disease 10%',   bayesUpdate(R(1,10), R(99,100), R(1,100)),          '11/12'],
    ['disease 25%',   bayesUpdate(R(1,4), R(99,100), R(1,100)),           '33/34'],
    ['95%-acc/1%',    bayesUpdate(R(1,100), R(95,100), R(5,100)),         '19/118'],
    ['1000-coin 10H', sequentialPosterior(R(1,1000), R(1), R(1,2), 10),  '1024/2023'],
    ['two 99% tests', oddsToProb(posteriorOdds(posteriorOdds(R(1,99), R(99,1)), R(99,1))), '99/100'],
  ]
  for (const [name, got, want] of G) {
    if (formatRational(got) !== want) fail(`bayes golden ${name}: expected ${want}, got ${formatRational(got)}`)
  }
  // disease 1% via natural frequencies (the tree display path).
  if (formatRational(naturalFrequencies(R(1,100), R(99,100), R(99,100), 10000).ppv) !== '1/2') {
    fail('bayes golden: naturalFrequencies disease 1% ppv ≠ 1/2')
  }
  // "more likely than not" crosses at k = 10, not k = 9.
  const half = R(1,2)
  const lt = (a: Rational, b: Rational) => a.n * b.d < b.n * a.d
  const k9  = sequentialPosterior(R(1,1000), R(1), R(1,2), 9)
  const k10 = sequentialPosterior(R(1,1000), R(1), R(1,2), 10)
  if (!(lt(k9, half) && lt(half, k10))) fail('bayes golden: 1000-coin should cross 1/2 at k = 10')
}
console.log('✓ bayes.ts goldens (2/3, 1/2, 1024/2023, 99/100, k=10, …)')

// ── 2c. Markov engine goldens — inline fact-check independent of fixtures;
// mirrors the bayes goldens so markov.ts correctness fails CI directly.
{
  const r = (n: number, d = 1): Rational => ({ n, d })
  const weather = [[r(3,5),r(2,5)],[r(3,10),r(7,10)]]
  const oz = [[r(1,2),r(1,4),r(1,4)],[r(1,2),r(0),r(1,2)],[r(1,4),r(1,4),r(1,2)]]
  const gr = [[r(1),r(0),r(0),r(0)],[r(1,3),r(0),r(2,3),r(0)],[r(0),r(1,3),r(0),r(2,3)],[r(0),r(0),r(0),r(1)]]
  const sym5 = [[r(1),r(0),r(0),r(0),r(0)],[r(1,2),r(0),r(1,2),r(0),r(0)],[r(0),r(1,2),r(0),r(1,2),r(0)],[r(0),r(0),r(1,2),r(0),r(1,2)],[r(0),r(0),r(0),r(0),r(1)]]
  const cloudy = [[r(0),r(1,2),r(1,2)],[r(1,4),r(1,2),r(1,4)],[r(1,4),r(1,4),r(1,2)]]
  const ehr2 = [[r(0),r(1),r(0)],[r(1,2),r(0),r(1,2)],[r(0),r(1),r(0)]]
  const cyc3 = [[r(0),r(1),r(0)],[r(0),r(0),r(1)],[r(1),r(0),r(0)]]
  const link4 = [[r(0),r(1),r(0),r(0)],[r(1,2),r(0),r(0),r(1,2)],[r(1,2),r(0),r(0),r(1,2)],[r(1,3),r(1,3),r(1,3),r(0)]]
  const okM = (label: string, got: string, want: string) => {
    if (got !== want) fail(`markov golden ${label}: expected ${want}, got ${got}`)
  }
  okM('oz^2 Rain->Snow', formatRational(matrixPower(oz, 2)[0][2]), '3/8')
  const Bgr = absorptionProbabilities(gr, [0, 3])
  okM('gambler absorption', formatVector([Bgr[0][1], Bgr[1][1]]), '4/7,6/7')
  okM('sym5 expected time', formatVector(expectedAbsorptionTime(sym5, [0, 4])), '3,4,3')
  okM('weather stationary', formatVector(stationaryDistribution(weather)), '3/7,4/7')
  okM('cloudy stationary', formatVector(stationaryDistribution(cloudy)), '1/5,2/5,2/5')
  const dbEhr = detailedBalance(ehr2)
  if (!dbEhr.reversible) fail('markov golden: ehr2 must be reversible')
  okM('ehrenfest stationary', formatVector(dbEhr.pi), '1/4,1/2,1/4')
  if (detailedBalance(cyc3).reversible) fail('markov golden: directed 3-cycle must NOT be reversible')
  okM('pagerank link4', formatVector(pagerank(link4, { n: 1, d: 1 })), '4/13,5/13,1/13,3/13')
  okM('pagerank cyc3', formatVector(pagerank(cyc3, { n: 85, d: 100 })), '1/3,1/3,1/3')
  okM('kac cloudy sunny', formatRational(kacReturnTime(cloudy, 0)), '5')
}
console.log('✓ markov.ts goldens (3/8, 4/7,6/7, 3/7,4/7, 1/5,2/5,2/5, 4/13…, kac 5)')

// ── 2d. Game-theory engine goldens — inline fact-check independent of fixtures;
// mirrors the bayes/markov goldens so gameTheory.ts correctness fails CI directly.
{
  const R = (n: number, d = 1): Rational => ({ n, d })
  const C = (r: number, c: number) => ({ row: R(r), col: R(c) })
  const PD: GtGame = [[C(3, 3), C(0, 5)], [C(5, 0), C(1, 1)]]
  const STAG: GtGame = [[C(3, 3), C(0, 1)], [C(1, 0), C(1, 1)]]
  const BOS: GtGame = [[C(3, 2), C(0, 0)], [C(0, 0), C(2, 3)]]
  const MPm = [[R(1), R(-1)], [R(-1), R(1)]]
  const MORRA = [[R(2), R(-3)], [R(-3), R(4)]]
  const okG = (label: string, cond: boolean) => {
    if (!cond) fail(`gameTheory golden failed: ${label}`)
  }
  okG('PD dominated row 0', gtDomRows(PD).join(',') === '0')
  const pd = gtIesds(PD)
  okG('PD iesds (1,1)', !!pd && pd.row === 1 && pd.col === 1)
  okG('PD pure NE (1,1)', gtPureNash(PD).map((e) => `${e.row},${e.col}`).join(';') === '1,1')
  okG('Stag two NE', gtPureNash(STAG).map((e) => `${e.row},${e.col}`).join(';') === '0,0;1,1')
  okG('Matching Pennies no saddle', gtSaddle(MPm) === null)
  okG('Matching Pennies value 0', gtFmt(gtMixedValue(MPm).value) === '0')
  okG('Morra value -1/12', gtFmt(gtMixedValue(MORRA).value) === '-1/12')
  okG('Morra mix 7/12', gtFmt(gtMixedValue(MORRA).p) === '7/12')
  okG('saddle [[3,5],[2,4]] value 3', gtFmt(gtSaddle([[R(3), R(5)], [R(2), R(4)]])!.value) === '3')
  okG('no-saddle [[1,3],[4,2]] value 5/2', gtFmt(gtMixedValue([[R(1), R(3)], [R(4), R(2)]]).value) === '5/2')
  okG('BoS mixed 3/5', gtFmt(gtMixedNash(BOS)!.p) === '3/5')
  okG('pirate 5/100', gtPirate(5, 100).join(',') === '98,0,1,0,1')
  okG('pirate 3/100', gtPirate(3, 100).join(',') === '99,0,1')
  okG('tiger parity', gtTiger(100) === false && gtTiger(7) === true)
  okG('nim 3-4-5 sum 2', gtNimSum([3, 4, 5]) === 2)
  okG('nim 3-4-5 move 3→1', JSON.stringify(gtNimMoves([3, 4, 5])) === JSON.stringify([{ heap: 0, removeTo: 1 }]))
  okG('nim 1-4-5 losing', gtNimSum([1, 4, 5]) === 0)
  okG('subtraction 12 losing / move(10,3)=2', gtSubWin(12, 3) === false && gtSubMove(10, 3) === 2)
  console.log('✓ gameTheory engine self-check (Stage-2 anchor)')
}

// ── 3. Engine cross-check (hitting-time recurrences only). A `equationTiles`
// beat opts into the buildAutomaton cross-check by setting `beat.pattern` to its
// H/T pattern (L0/L1/L5/L6). Race-probability (L2) and walk (L3) tiles encode
// recurrences from race.ts/walk.ts instead, validated by their own engine
// goldens; those beats leave `beat.pattern` unset and are skipped here.
let crossChecked = 0
for (const lesson of lessons) {
  for (const beat of lesson.beats) {
    if (beat.interaction.type !== 'equationTiles' || !beat.pattern) continue
    let auto: ReturnType<typeof buildAutomaton>
    try {
      auto = buildAutomaton(beat.pattern, 0.5)
    } catch (err) {
      fail(`${lesson.lessonId}/${beat.beatId}: invalid pattern "${beat.pattern}": ${String(err)}`)
    }
    for (const row of beat.interaction.rows) {
      const expected = auto.recurrences[row.lhs as keyof typeof auto.recurrences]
      if (JSON.stringify(expected) !== JSON.stringify(row.target)) {
        console.error(
          `\n✗ ${lesson.lessonId}/${beat.beatId}: equation-tiles target for ${row.lhs} (pattern ${beat.pattern}) does not match engine recurrence:`,
        )
        console.error('  engine:  ', JSON.stringify(expected))
        console.error('  fixture: ', JSON.stringify(row.target))
        process.exit(1)
      }
    }
    crossChecked++
  }
}
console.log(`✓ engine recurrences match equation-tile targets (${crossChecked} beats)`)

// ── 3b. Bayes update cross-check — recompute each declared `posterior` via
// bayes.ts and assert equality; surfaces wrong posterior strings in fixtures.
const toR = (r: { n: number; d: number }): Rational => ({ n: r.n, d: r.d })
// A joint cell {x,y,p} — each of x/y/p coerced to a fresh plain-number Rational
// (used by the covarianceBoard §3f cross-check).
const toR3 = (c: {
  x: { n: number; d: number }
  y: { n: number; d: number }
  p: { n: number; d: number }
}): CovJointCell => ({ x: toR(c.x), y: toR(c.y), p: toR(c.p) })
let bayesChecked = 0
for (const lesson of lessons) {
  for (const beat of lesson.beats) {
    const it = beat.interaction
    if (it.type !== 'bayesUpdate' || !it.posterior) continue
    const priors = (it.priors ?? []).map(toR)
    const likelihoods = (it.likelihoods ?? []).map(toR)
    if (priors.length < 2 || priors.length !== likelihoods.length) {
      fail(`${lesson.lessonId}/${beat.beatId}: bayesUpdate needs priors & likelihoods of equal length ≥ 2`)
    }
    let result: Rational
    if (it.display === 'sequence') {
      if (!it.steps) fail(`${lesson.lessonId}/${beat.beatId}: sequence needs steps`)
      result = sequentialPosterior(priors[0], likelihoods[0], likelihoods[1], it.steps)
    } else {
      result = bayesPosterior(priors, likelihoods)[0]
    }
    if (formatRational(result) !== it.posterior) {
      fail(`${lesson.lessonId}/${beat.beatId}: declared posterior ${it.posterior} ≠ engine ${formatRational(result)}`)
    }
    bayesChecked++
  }
}
console.log(`✓ bayesUpdate posteriors match bayes.ts (${bayesChecked} beats)`)

// ── 3c. chainBoard engine cross-check — recompute each declared `headline` via
// markov.ts (switch on display/task/damping) and assert equality. chainBoard is
// NOT in HERO_TYPES/GRADED_TYPES; this cross-check + the beat-level `hero` block
// carry the hero/graded split (mirrors the bayes §3b cross-check).
let chainChecked = 0
for (const lesson of lessons) {
  for (const beat of lesson.beats) {
    const it = beat.interaction
    if (it.type !== 'chainBoard' || !it.headline) continue
    const P = it.matrix.map((r) => r.cells.map(toR))
    let got: string
    switch (it.task) {
      case 'entry': {
        const Pn = matrixPower(P, it.step ?? 1)
        const { row = 0, col = 0 } = it.cell ?? {}
        got = formatRational(Pn[row][col]); break
      }
      case 'build': { buildChain(P, it.labels); got = '1'; break }
      case 'classify': {
        const cls = classifyStates(P)
        const hasAbsorbing = cls.some((c) => c.kind === 'absorbing')
        const recPeriod = (cls.find((c) => c.kind !== 'transient') ?? cls[0]).period
        if (/^\d+$/.test(it.headline)) got = String(recPeriod)
        else if (it.headline === 'absorbing') got = hasAbsorbing ? 'absorbing' : 'ergodic'
        else if (it.headline === 'ergodic') got = hasAbsorbing ? 'absorbing' : 'ergodic'
        else if (it.headline === 'oscillates') got = recPeriod > 1 ? 'oscillates' : 'converges'
        else got = cls.map((c) => c.kind).join(',')
        break
      }
      case 'absorption': {
        // Two reconciled reads (engine unchanged — both compose absorptionProbabilities):
        //  • vector headline + `cell` → reach-a-target-wall COLUMN (L5 solve-matrix):
        //    column `cell.col` of B = P(absorbed at that wall | each transient start).
        //  • scalar headline + `cell` → RETURN probability of the home state `cell.row`
        //    (L4 transient-vs-recurrent): make `home` absorbing, then
        //    f_home = Σ_j P[home][j]·P(reach home before a wall | start j).
        //  • no `cell` → generic flattened B (back-compat).
        const walls = it.absorbing ?? []
        if (it.cell && it.headline.includes(',')) {
          const col = it.cell.col
          const B = absorptionProbabilities(P, walls)
          got = formatVector(B.map((bRow) => bRow[col]))
        } else if (it.cell) {
          const home = it.cell.row
          const absorbing = [home, ...walls.filter((w) => w !== home)]
          const Pmod = P.map((bRow, i) =>
            i === home ? bRow.map((_, j) => ({ n: j === home ? 1 : 0, d: 1 })) : bRow,
          )
          const B = absorptionProbabilities(Pmod, absorbing)
          const transient = P.map((_, i) => i).filter((i) => !absorbing.includes(i))
          const rowOf = new Map(transient.map((s, idx) => [s, idx]))
          let f: Rational = { n: 0, d: 1 }
          for (let j = 0; j < P.length; j++) {
            if (P[home][j].n === 0) continue
            const g: Rational =
              j === home ? { n: 1, d: 1 }
              : absorbing.includes(j) ? { n: 0, d: 1 }
              : B[rowOf.get(j)!][0]
            f = ratAdd(f, ratMul(P[home][j], g))
          }
          got = formatRational(f)
        } else {
          const B = absorptionProbabilities(P, walls)
          got = it.headline.includes(',') ? formatVector(B.flat()) : formatRational(B.flat()[0])
        }
        break
      }
      case 'stationary': {
        const pi = stationaryDistribution(P)
        got = it.cell ? formatRational(pi[it.cell.row]) : formatVector(pi); break
      }
      case 'balance': {
        const db = detailedBalance(P)
        got = !db.reversible ? 'not-reversible'
          : it.cell ? formatRational(db.pi[it.cell.col])
          : formatVector(db.pi); break
      }
      case 'pagerank': {
        const d = it.damping
        if (!d) fail(`${lesson.lessonId}/${beat.beatId}: pagerank needs damping`)
        const pr = pagerank(P, toR(d))
        if (it.headline === 'unique') got = 'unique'
        else if (/^\d+$/.test(it.headline)) {
          let best = 0
          for (let i = 1; i < pr.length; i++) if (pr[i].n * pr[best].d > pr[best].n * pr[i].d) best = i
          got = it.labels[best]
        } else got = formatVector(pr)
        break
      }
      default: continue
    }
    if (got !== it.headline) {
      fail(`${lesson.lessonId}/${beat.beatId}: declared headline ${it.headline} ≠ engine ${got}`)
    }
    chainChecked++
  }
}
console.log(`✓ chainBoard headlines match markov.ts (${chainChecked} beats)`)

// ── 3d. stoppingBoard engine cross-check — recompute each declared `headline`
// via optimalStopping.ts (switch on display) and assert equality. stoppingBoard
// is NOT in HERO_TYPES/GRADED_TYPES; this cross-check carries the math anchor
// (mirrors the chainBoard §3c cross-check). Graded reads live in answerEntry /
// masteryChallenge beats and are checked in the per-lesson factcheck tests.
let stopChecked = 0
for (const lesson of lessons) {
  for (const beat of lesson.beats) {
    const it = beat.interaction
    if (it.type !== 'stoppingBoard' || !it.headline) continue
    const where = `${lesson.lessonId}/${beat.beatId}`
    let got: string
    switch (it.display) {
      case 'sequence': {
        if (!it.order || it.cutoff == null) {
          fail(`${where}: stoppingBoard sequence needs order + cutoff for its headline`)
        }
        const res = runStrategy(it.order, it.cutoff)
        got = it.headline === 'win' || it.headline === 'miss'
          ? (res.win ? 'win' : 'miss')
          : String(res.selectedRank)
        break
      }
      case 'cutoff': {
        got = it.cutoff != null
          ? formatRationalOS(secretarySuccess(it.n, it.cutoff))
          : formatRationalOS(optimalCutoff(it.n).p)
        break
      }
      case 'convergence': {
        const maxN = Math.max(...(it.nValues ?? [it.n]))
        got = String(optimalCutoff(maxN).r)
        break
      }
      default:
        continue
    }
    if (got !== it.headline) {
      fail(`${where}: declared headline ${it.headline} ≠ engine ${got}`)
    }
    stopChecked++
  }
}
console.log(`✓ stoppingBoard headlines match optimalStopping.ts (${stopChecked} beats)`)
// ── 3e. Game-theory headline cross-check — recompute each declared `headline`
// via gameTheory.ts (switch on type/task) and assert equality (mirrors §3c). The
// payoffMatrix/gameTree/nimBoard types are NOT graded/hero; this cross-check is
// their Stage-2 anchor (per-lesson factcheck tests cover answerEntry/mastery accepts).
let gtChecked = 0
for (const lesson of lessons) {
  for (const beat of lesson.beats) {
    const it = beat.interaction
    if (it.type === 'payoffMatrix' && it.headline) {
      const game: GtGame = it.matrix.map((r) =>
        r.cells.map((c) => ({ row: toR(c.row), col: toR(c.col) })),
      )
      const rowM = it.matrix.map((r) => r.cells.map((c) => toR(c.row)))
      let got: string
      switch (it.task) {
        case 'nash': {
          const eqs = gtPureNash(game)
          got = eqs.length ? eqs.map((e) => `${e.row},${e.col}`).join(';') : 'none'
          break
        }
        case 'dominance': {
          const sol = gtIesds(game)
          got = sol ? `${sol.row},${sol.col}` : 'none'
          break
        }
        case 'value': {
          const sp = gtSaddle(rowM)
          got = sp ? gtFmt(sp.value) : 'mixed'
          break
        }
        case 'mix': {
          got = gtFmt(gtMixedValue(rowM).value)
          break
        }
        default:
          continue // bestResponse → ungraded explore, no headline cross-check
      }
      if (got !== it.headline) {
        fail(`${lesson.lessonId}/${beat.beatId}: payoffMatrix(${it.task}) headline ${it.headline} ≠ engine ${got}`)
      }
      gtChecked++
    } else if (it.type === 'gameTree' && it.headline) {
      const got = gtVec(gtBackward(it.root as GtNode).payoff)
      if (got !== it.headline) {
        fail(`${lesson.lessonId}/${beat.beatId}: gameTree headline ${it.headline} ≠ engine ${got}`)
      }
      gtChecked++
    } else if (it.type === 'nimBoard' && it.headline) {
      let got: string
      if ((it.task ?? 'nim') === 'subtraction') {
        if (!it.maxRemove) fail(`${lesson.lessonId}/${beat.beatId}: nimBoard subtraction needs maxRemove`)
        got = String(it.heaps[0] % (it.maxRemove! + 1))
      } else {
        got = String(gtNimSum(it.heaps))
      }
      if (got !== it.headline) {
        fail(`${lesson.lessonId}/${beat.beatId}: nimBoard(${it.task ?? 'nim'}) headline ${it.headline} ≠ engine ${got}`)
      }
      gtChecked++
    }
  }
}
console.log(`✓ gameTheory headlines match gameTheory.ts (${gtChecked} beats)`)

// ── 3f. covarianceBoard engine cross-check — recompute each declared `headline`
// via covariance.ts (switch on task) and assert equality. covarianceBoard is NOT
// in HERO_TYPES/GRADED_TYPES; this cross-check carries the math anchor (mirrors
// the chainBoard §3c / stoppingBoard §3d / gameTheory §3e cross-checks). Graded
// reads live in answerEntry / masteryChallenge beats and are checked in the
// per-lesson factcheck tests (Stage 4). No-op until covariance fixtures land.
//
// Marginal pmf of X (or Y) collapsed from a joint distribution — summing the
// probability mass over each distinct outcome value (exact rationals).
function covMarginal(joint: CovJointCell[], axis: 'x' | 'y'): CovPmf {
  const byVal = new Map<string, { x: Rational; p: Rational }>()
  for (const cell of joint) {
    const v = cell[axis]
    const key = `${v.n}/${v.d}`
    const prev = covAddP(byVal.get(key)?.p, cell.p)
    byVal.set(key, { x: v, p: prev })
  }
  return [...byVal.values()]
}
function covAddP(a: Rational | undefined, b: Rational): Rational {
  if (!a) return b
  return { n: a.n * b.d + b.n * a.d, d: a.d * b.d } // unreduced ok; covVariance reduces
}
let covChecked = 0
for (const lesson of lessons) {
  for (const beat of lesson.beats) {
    const it = beat.interaction
    if (it.type !== 'covarianceBoard' || !it.headline) continue
    const where = `${lesson.lessonId}/${beat.beatId}`
    let got: string
    switch (it.task) {
      case 'covariance': {
        if (!it.joint) fail(`${where}: covarianceBoard task 'covariance' needs joint for its headline`)
        got = covFmt(covCovariance(it.joint.map(toR3)))
        break
      }
      case 'rhoSquared': {
        if (!it.joint) fail(`${where}: covarianceBoard task 'rhoSquared' needs joint for its headline`)
        const joint = it.joint.map(toR3)
        const cov = covCovariance(joint)
        const varX = covVariance(covMarginal(joint, 'x'))
        const varY = covVariance(covMarginal(joint, 'y'))
        got = covFmt(covRhoSquared(cov, varX, varY))
        break
      }
      case 'corrRange': {
        if (!it.rho1 || !it.rho2) fail(`${where}: covarianceBoard task 'corrRange' needs rho1 & rho2 for its headline`)
        got = covFmtRange(covCorrRange(toR(it.rho1), toR(it.rho2)))
        break
      }
      default:
        // No task ⇒ no engine anchor to cross-check (passive display).
        continue
    }
    if (got !== it.headline) {
      fail(`${where}: covarianceBoard(${it.task}) declared headline ${it.headline} ≠ engine ${got}`)
    }
    covChecked++
  }
}
console.log(`✓ covarianceBoard headlines match covariance.ts (${covChecked} beats)`)

// ── 4. Inclusivity gate (build-brief §4.5 / §10). Mechanizable subset of the
// per-lesson DoD, applied to the remaining lessons (L2–L6). L0/L1 predate the
// gate (their own specs) and are exempt. The asserts are dormant until each
// lesson fixture is authored.
const GATED = new Set([
  'lesson-penneys-game', // L2
  'lesson-gamblers-ruin', // L3
  'lesson-states-streaks', // L4
  'lesson-longer-patterns', // L5
  'lesson-overlap-shortcut', // L6
  // Combinatorics concept (Wave-0 contract).
  'lesson-combinatorics-1',
  'lesson-combinatorics-2',
  'lesson-combinatorics-3',
  'lesson-combinatorics-4',
  'lesson-combinatorics-5',
  'lesson-combinatorics-6',
  'lesson-bayes-rule-1', 'lesson-bayes-rule-2', 'lesson-bayes-rule-3', // Bayes concept L1–L3
  'lesson-bayes-rule-4', 'lesson-bayes-rule-5', 'lesson-bayes-rule-6',
  'lesson-bayes-rule-7', 'lesson-bayes-rule-8',                         // Bayes concept L4–L8
  // Expected Value concept (Wave-0 contract).
  'lesson-expected-value-1',
  'lesson-expected-value-2',
  'lesson-expected-value-3',
  'lesson-expected-value-4',
  'lesson-expected-value-5',
  'lesson-expected-value-6',
  // concept-markov-chains
  'lesson-markov-chains-1','lesson-markov-chains-2','lesson-markov-chains-3','lesson-markov-chains-4',
  'lesson-markov-chains-5','lesson-markov-chains-6','lesson-markov-chains-7','lesson-markov-chains-8',
  'lesson-markov-chains-9','lesson-markov-chains-10',
  // concept-optimal-stopping
  'lesson-optimal-stopping-1','lesson-optimal-stopping-2','lesson-optimal-stopping-3',
  'lesson-optimal-stopping-4','lesson-optimal-stopping-5',
  // concept-game-theory
  'lesson-game-theory-1','lesson-game-theory-2','lesson-game-theory-3',
  'lesson-game-theory-4','lesson-game-theory-5','lesson-game-theory-6',
  // concept-covariance
  'lesson-covariance-1','lesson-covariance-2','lesson-covariance-3',
  'lesson-covariance-4','lesson-covariance-5','lesson-covariance-6',
])
// L5 transfer lesson is the logged exception to the retrieval-opener rule.
const NO_RETRIEVAL_OPENER = new Set(['lesson-longer-patterns'])

// Interaction types that REQUIRE a `hero` block (the "watch it resolve" heroes).
const HERO_TYPES = new Set(['raceSim', 'walkBoard', 'gamblerLedger'])
// Graded interactions (a "graded beat" for the early-win / opener checks).
const GRADED_TYPES = new Set([
  'retrievalGrid',
  'equationTiles',
  'substitution',
  'patternPick',
  'stateTap',
  'answerEntry',
  'masteryChallenge',
  // Combinatorics graded types (Wave-0 contract). countingTree/selectionGrid are
  // graded only when `accept` is present; handRanker is always graded. In every
  // combinatorics lesson the retrievalGrid recall is the first graded beat, so
  // the early-win / opener checks are unaffected by these additions.
  'countingTree',
  'selectionGrid',
  'handRanker',
])
// The two hardest graded types — never the first graded beat (early-win rule).
const HARDEST_TYPES = new Set(['equationTiles', 'substitution'])
// A valid retrieval opener.
const OPENER_TYPES = new Set(['retrievalGrid'])

function visibleFor(beats: Beat[], track: 'A' | 'B'): Beat[] {
  return beats.filter((b) => (b.track ?? 'both') === 'both' || b.track === track)
}

function usesByOption(beat: Beat): boolean {
  return (
    typeof beat.feedback === 'object' &&
    beat.feedback !== null &&
    'byOption' in beat.feedback
  )
}

for (const lesson of lessons) {
  if (!GATED.has(lesson.lessonId)) continue
  const id = lesson.lessonId
  const beats = lesson.beats
  const problems: string[] = []

  // ≥1 primer.
  if (!beats.some((b) => b.interaction.type === 'primer')) {
    problems.push('no `primer` beat (JIT notation ladder)')
  }

  // Every `prediction` uses per-option (refutational) feedback.
  for (const b of beats) {
    if (b.interaction.type === 'prediction' && !usesByOption(b)) {
      problems.push(`prediction "${b.beatId}" lacks byOption (refutational) feedback`)
    }
  }

  // Every hero-type beat carries the `hero` block.
  for (const b of beats) {
    if (HERO_TYPES.has(b.interaction.type) && !b.hero) {
      problems.push(`hero beat "${b.beatId}" (${b.interaction.type}) missing the \`hero\` block`)
    }
  }

  // An `interviewNote` exists somewhere (the de-gatekept opt-in quant layer).
  if (!beats.some((b) => b.interviewNote)) {
    problems.push('no `interviewNote` anywhere (the "For the interview" layer)')
  }

  // Guaranteed early win + retrieval opener: the first graded beat is low-stakes
  // (not the hardest type) and, except L5, is a retrieval opener.
  const firstGraded = beats.find((b) => GRADED_TYPES.has(b.interaction.type))
  if (!firstGraded) {
    problems.push('no graded beat at all')
  } else {
    if (HARDEST_TYPES.has(firstGraded.interaction.type)) {
      problems.push(
        `first graded beat "${firstGraded.beatId}" is the hardest type (${firstGraded.interaction.type}); no guaranteed early win`,
      )
    }
    if (!NO_RETRIEVAL_OPENER.has(id) && !OPENER_TYPES.has(firstGraded.interaction.type)) {
      problems.push(
        `first graded beat "${firstGraded.beatId}" (${firstGraded.interaction.type}) is not a retrieval opener (retrievalGrid)`,
      )
    }
  }

  // No symbol before its referent — within each track's visible subsequence.
  for (const track of ['A', 'B'] as const) {
    const vis = visibleFor(beats, track)
    const indexOf = new Map(vis.map((b, i) => [b.beatId, i]))
    vis.forEach((b, i) => {
      if (!b.introducesSymbol) return
      for (const g of b.groundedBy ?? []) {
        const gi = indexOf.get(g)
        if (gi === undefined) {
          problems.push(
            `[track ${track}] "${b.beatId}" introduces ${b.introducesSymbol} but grounding "${g}" is not visible`,
          )
        } else if (gi >= i) {
          problems.push(
            `[track ${track}] "${b.beatId}" introduces ${b.introducesSymbol} before its grounding "${g}"`,
          )
        }
      }
    })
  }

  // L3 must confront the gambler's fallacy with the named primer variant.
  if (id === 'lesson-gamblers-ruin') {
    const has = beats.some(
      (b) => b.interaction.type === 'primer' && b.interaction.variant === 'gamblersFallacy',
    )
    if (!has) problems.push('missing the `gamblersFallacy` primer')
  }

  // L6 must gate `sum-it` behind the exponent primer.
  if (id === 'lesson-overlap-shortcut') {
    const expIdx = beats.findIndex(
      (b) => b.interaction.type === 'primer' && b.interaction.variant === 'exponent',
    )
    const sumIdx = beats.findIndex((b) => b.beatId === 'sum-it')
    if (expIdx === -1) problems.push('missing the `exponent` primer')
    else if (sumIdx === -1) problems.push('missing the `sum-it` beat')
    else if (expIdx >= sumIdx) problems.push('`exponent` primer must precede `sum-it`')
  }

  if (problems.length > 0) {
    console.error(`\n✗ ${id} fails the inclusivity gate:`)
    for (const p of problems) console.error(`  - ${p}`)
    process.exit(1)
  }
  console.log(`✓ inclusivity gate: ${id}`)
}

// ── 5. Mastery-challenge gate (end-of-lesson "prove mastery" question). Each
// core lesson L1-L6 ends with a required masteryChallenge beat immediately
// before its recap closer; pattern-pinned challenges are engine-cross-checked.
const MASTERY_LESSONS = new Set([
  'lesson-pattern-hitting-times',
  'lesson-penneys-game',
  'lesson-gamblers-ruin',
  'lesson-states-streaks',
  'lesson-longer-patterns',
  'lesson-overlap-shortcut',
  // Combinatorics concept (Wave-0 contract).
  'lesson-combinatorics-1',
  'lesson-combinatorics-2',
  'lesson-combinatorics-3',
  'lesson-combinatorics-4',
  'lesson-combinatorics-5',
  'lesson-combinatorics-6',
  'lesson-bayes-rule-1', 'lesson-bayes-rule-2', 'lesson-bayes-rule-3', // Bayes concept L1–L3
  'lesson-bayes-rule-4', 'lesson-bayes-rule-5', 'lesson-bayes-rule-6',
  'lesson-bayes-rule-7', 'lesson-bayes-rule-8',                         // Bayes concept L4–L8
  // Expected Value concept (Wave-0 contract).
  'lesson-expected-value-1',
  'lesson-expected-value-2',
  'lesson-expected-value-3',
  'lesson-expected-value-4',
  'lesson-expected-value-5',
  'lesson-expected-value-6',
  // concept-markov-chains
  'lesson-markov-chains-1','lesson-markov-chains-2','lesson-markov-chains-3','lesson-markov-chains-4',
  'lesson-markov-chains-5','lesson-markov-chains-6','lesson-markov-chains-7','lesson-markov-chains-8',
  'lesson-markov-chains-9','lesson-markov-chains-10',
  // concept-optimal-stopping
  'lesson-optimal-stopping-1','lesson-optimal-stopping-2','lesson-optimal-stopping-3',
  'lesson-optimal-stopping-4','lesson-optimal-stopping-5',
  // concept-game-theory
  'lesson-game-theory-1','lesson-game-theory-2','lesson-game-theory-3',
  'lesson-game-theory-4','lesson-game-theory-5','lesson-game-theory-6',
  // concept-covariance
  'lesson-covariance-1','lesson-covariance-2','lesson-covariance-3',
  'lesson-covariance-4','lesson-covariance-5','lesson-covariance-6',
])
for (const lesson of lessons) {
  if (!MASTERY_LESSONS.has(lesson.lessonId)) continue
  const beats = lesson.beats
  const last = beats[beats.length - 1]
  const penult = beats[beats.length - 2]
  if (!last || last.interaction.type !== 'recap') {
    fail(`${lesson.lessonId}: last beat must be a recap (got ${last?.interaction.type ?? 'none'})`)
  }
  if (!penult) fail(`${lesson.lessonId}: missing the masteryChallenge beat before recap`)
  const interaction = penult.interaction
  if (interaction.type !== 'masteryChallenge') {
    fail(`${lesson.lessonId}: beat before recap must be a masteryChallenge (got ${interaction.type})`)
  }
  if (!penult.required) fail(`${lesson.lessonId}: the masteryChallenge beat must be required`)
  if (penult.pattern) {
    const e0 = buildAutomaton(penult.pattern, 0.5).expectedTimes.E0
    const accepts = interaction.fields.flatMap((f) => f.accept)
    if (!accepts.includes(String(e0))) {
      fail(`${lesson.lessonId}: masteryChallenge pattern ${penult.pattern} -> E=${e0} not in any accept list`)
    }
  }
  // PHT held-out transfer beats are engine-reproduced the SAME way (spec-24 §3.5):
  // a pattern-pinned heldOut beat's `accept` must contain buildAutomaton(pattern).E0,
  // so a transfer problem with an un-reproduced number can't ship. Only the
  // pattern-hitting-times concept uses the automaton engine; other concepts' heldOut
  // cross-checks extend their own per-concept §8x cross-checks.
  for (const ho of beats) {
    if (!(ho as { heldOut?: boolean }).heldOut || !ho.pattern) continue
    const e0 = buildAutomaton(ho.pattern, 0.5).expectedTimes.E0
    const hi = ho.interaction
    if (hi.type !== 'masteryChallenge' && hi.type !== 'answerEntry') {
      fail(`${lesson.lessonId}/${ho.beatId}: pattern-pinned heldOut beat must be masteryChallenge/answerEntry to engine-cross-check`)
    }
    const accepts = hi.fields.flatMap((f) => f.accept)
    if (!accepts.includes(String(e0))) {
      fail(`${lesson.lessonId}/${ho.beatId}: heldOut pattern ${ho.pattern} -> E=${e0} not in any accept list`)
    }
  }
  console.log(`✓ mastery-challenge gate: ${lesson.lessonId}`)
}

// ── 5b. Held-out transfer gate (spec-24 / D7 / D15). A held-out beat is the
// Track-B delayed gold gate: SAME method as the lesson's masteryChallenge
// checkpoint, fresh surface, never rendered in normal flow. Each must be
// well-formed; per-lesson presence is advisory until REQUIRE_TRANSFER=1
// (post-authoring), mirroring the §1c REQUIRE_SCHEMA_ID rollout pattern.
// Reuses the §1 `isGradedBeat` import and the §1c `VALID_METHOD_IDS` registry
// set (spec-00) — does NOT re-derive either.
//
// ★ Flag-ordering (gate Issue #12): do NOT flip REQUIRE_TRANSFER=1 before
// spec-00's REQUIRE_SCHEMA_ID=1 + the 187-beat backfill have landed — check (c)
// ("heldOut schemaId == checkpoint method") is guarded by `if (checkpointSchema)`
// and silently no-ops until every checkpoint carries a real schemaId.
{
  const requireTransfer = process.env.REQUIRE_TRANSFER === '1'
  for (const lesson of lessons) {
    const beats = lesson.beats
    const heldOuts = beats.filter((b) => (b as { heldOut?: boolean }).heldOut === true)
    // a) presence (advisory until the flag flips).
    if (heldOuts.length === 0) {
      const msg = `${lesson.lessonId}: no held-out transfer beat (Track-B gold gate)`
      if (requireTransfer) fail(msg)
      else console.warn(`⚠ transfer gate (advisory; set REQUIRE_TRANSFER=1 to enforce): ${msg}`)
    }
    // Checkpoint method = the lesson's masteryChallenge schemaId (fallback: last
    // graded beat's schemaId, for lesson-first-heads which has no masteryChallenge).
    const checkpoint =
      [...beats].reverse().find((b) => b.interaction.type === 'masteryChallenge') ??
      [...beats].reverse().find((b) => isGradedBeat(b))
    const checkpointSchema = (checkpoint as { schemaId?: string } | undefined)?.schemaId
    for (const b of heldOuts) {
      const where = `${lesson.lessonId}/${b.beatId}`
      // b) well-formed marker.
      if (b.track !== 'B') fail(`${where}: heldOut beat must be track:'B'`)
      if (b.required !== false) fail(`${where}: heldOut beat must be required:false`)
      if (!isGradedBeat(b)) fail(`${where}: heldOut beat must be a graded beat`)
      const sid = (b as { schemaId?: string }).schemaId
      if (sid == null || !VALID_METHOD_IDS.has(sid)) {
        fail(`${where}: heldOut beat needs a valid schemaId (in the methods registry)`)
      }
      // c) SAME method as the checkpoint (guarded — no-ops until spec-00 backfill).
      if (checkpointSchema && sid !== checkpointSchema) {
        fail(`${where}: heldOut schemaId "${sid}" != checkpoint method "${checkpointSchema}"`)
      }
      // d) placed BEFORE the masteryChallenge (preserves the §5 penult/last invariant).
      const mcIdx = beats.findIndex((x) => x.interaction.type === 'masteryChallenge')
      const myIdx = beats.findIndex((x) => x.beatId === b.beatId)
      if (mcIdx !== -1 && myIdx > mcIdx) {
        fail(`${where}: heldOut beat must precede the masteryChallenge`)
      }
      // e) fresh surface (soft): scenario/prompt must differ from the checkpoint's.
      const cpText = checkpoint
        ? ((checkpoint.interaction as { scenario?: string }).scenario ?? checkpoint.prompt)
        : ''
      const myText = (b.interaction as { scenario?: string }).scenario ?? b.prompt
      if (cpText && myText && cpText.trim() === myText.trim()) {
        fail(`${where}: heldOut surface is identical to the checkpoint (must be a FRESH surface)`)
      }
    }
  }
  console.log('✓ held-out transfer gate')
}

// ── 5c. Which-method gate well-formedness (spec-13 / D12). Runs over EVERY lesson
// beat (not just GATED lessons): a `prediction` beat carrying `interaction.gate`
// is a graded method-discrimination checkpoint and must be coherent. No fixture
// ships a gate yet, so this is a no-op on today's corpus but guards future gates.
// Note: the §4 inclusivity check already requires every prediction (gate or not)
// to carry `byOption`; this pass adds the gate-specific cross-checks. Distractors
// come from spec-00's CONFUSABLE map (consumed, never re-derived from domain ∩).
for (const lesson of lessons) {
  for (const beat of lesson.beats) {
    const it = beat.interaction
    if (it.type !== 'prediction' || !it.gate) continue
    const where = `${lesson.lessonId}/${beat.beatId}`
    // a) options ↔ optionMethods positional alignment.
    if (it.gate.optionMethods.length !== it.options.length) {
      fail(`${where}: gate optionMethods length ${it.gate.optionMethods.length} != options ${it.options.length}`)
    }
    // b) correct must be one of the offered methods (no unanswerable gate).
    if (!it.gate.optionMethods.includes(it.gate.correct)) {
      fail(`${where}: gate.correct "${it.gate.correct}" is not among optionMethods`)
    }
    // c) distinct methods (a real discrimination, not a duplicate).
    if (new Set(it.gate.optionMethods).size !== it.gate.optionMethods.length) {
      fail(`${where}: gate optionMethods contains duplicates`)
    }
    // d) graded ⇒ byOption refutation present (mirrors the inclusivity rule).
    if (!usesByOption(beat)) {
      fail(`${where}: which-method gate lacks byOption refutation feedback`)
    }
    // e) byOption.correct (if present) agrees with gate.correct, by option label.
    const correctIdx = it.gate.optionMethods.indexOf(it.gate.correct)
    const correctLabel = it.options[correctIdx]
    const bo = (beat.feedback as { byOption: Record<string, { note: string; correct?: boolean }> }).byOption
    for (const [label, entry] of Object.entries(bo)) {
      const shouldBeCorrect = label === correctLabel
      if (entry.correct !== undefined && entry.correct !== shouldBeCorrect) {
        fail(`${where}: byOption["${label}"].correct=${entry.correct} disagrees with gate.correct`)
      }
    }
    // f) the gate's schemaId is the method it tests (Foundation B coherence).
    const sid = (beat as { schemaId?: string }).schemaId
    if (sid && sid !== it.gate.correct) {
      fail(`${where}: beat.schemaId "${sid}" != gate.correct "${it.gate.correct}"`)
    }
    // g) every distractor is a DECLARED confusable of `correct` (no ad-hoc /
    //    domain-overlap distractors). CONFUSABLE is owned by spec-00; consumed here.
    const confusable = new Set(CONFUSABLE[it.gate.correct] ?? [])
    for (const m of it.gate.optionMethods) {
      if (m === it.gate.correct) continue
      if (!confusable.has(m)) {
        fail(`${where}: distractor "${m}" is not in CONFUSABLE["${it.gate.correct}"] (use a declared near-miss, not an ad-hoc/domain-overlap pick)`)
      }
    }
    console.log(`✓ which-method gate: ${where}`)
  }
}

// ── 6. Combinatorics engine self-check (Stage-2 math anchor for
// course-combinatorics). The per-fixture cross-check — every countingTree /
// selectionGrid / vennCounter / pigeonholeBoard / probabilityCounter /
// handRanker target + `accept` reproduced from the engine — lands with the
// lesson fixtures in the build wave (see concepts/combinatorics/
// wave0-contracts.md). Until then this asserts the frozen engine reproduces
// every Green-Book headline number so the interface cannot silently drift.
{
  const ok = (label: string, cond: boolean) => {
    if (!cond) fail(`combinatorics engine self-check failed: ${label}`)
  }
  ok('nCk(52,5)=2598960', nCk(52, 5) === 2_598_960n)
  ok('nPk(5,3)=60', nPk(5, 3) === 60n)
  ok('nPk(365,3)=48228180', nPk(365, 3) === 48_228_180n)
  ok('pascalRow(4)=[1,4,6,4,1]', pascalRow(4).join(',') === '1,4,6,4,1')
  ok('product([13,4,12,6])=3744', product([13, 4, 12, 6]) === 3744n)
  ok('product([78,6,6,44])=123552', product([78, 6, 6, 44]) === 123_552n)
  ok('unionSize(8,6,3)=11', unionSize(8, 6, 3) === 11n)
  ok('derangements(5)=44', derangements(5) === 44n)
  ok(
    'inclusionExclusion(at-least-one)=76',
    inclusionExclusion([
      { size: 120, sign: 1 },
      { size: 60, sign: -1 },
      { size: 20, sign: 1 },
      { size: 5, sign: -1 },
      { size: 1, sign: 1 },
    ]) === 76n,
  )
  ok('pigeonholeMin(51,25)=3', pigeonholeMin(51, 25) === 3)
  ok('forcesCollision(4,3)=true', forcesCollision(4, 3) === true)
  ok('forcesCollision(3,3)=false', forcesCollision(3, 3) === false)
  const p1 = probabilityFromCounts(624, 2_598_960)
  ok('P(624/2598960)=1/4165', p1.n === 1n && p1.d === 4165n)
  const p2 = probabilityFromCounts(20, 216)
  ok('P(20/216)=5/54', p2.n === 5n && p2.d === 54n)
  const r = reduce(44n, 120n)
  ok('reduce(44,120)=11/30', r.n === 11n && r.d === 30n)
  console.log('✓ combinatorics engine self-check (Stage-2 anchor)')
}

// ── 6b. Expected-value engine self-check (Stage-2 math anchor for
// course-expected-value). Asserts the frozen engine reproduces every Green-Book
// headline number so the interface can't silently drift before the EV fixtures
// land (per-fixture accept cross-checks land with the lessons in the build wave).
{
  const R = (n: number, d: number) => ({ n, d })
  const eq = (a: { n: number; d: number }, b: { n: number; d: number }) =>
    a.n === b.n && a.d === b.d
  const ok = (label: string, cond: boolean) => {
    if (!cond) fail(`expectation engine self-check failed: ${label}`)
  }
  const die = [1, 2, 3, 4, 5, 6].map((x) => ({ x: R(x, 1), p: R(1, 6) }))
  ok('expectedValue(fairDie)=7/2', eq(expectedValue(die), R(7, 2)))
  ok(
    'totalExpectation(coin-die)=7/4',
    eq(totalExpectation([{ p: R(1, 2), value: R(7, 2) }, { p: R(1, 2), value: R(0, 1) }]), R(7, 4)),
  )
  ok(
    'totalExpectation(dice-game)=7',
    eq(totalExpectation([{ p: R(1, 2), value: R(2, 1) }, { p: R(1, 2), restart: { add: R(5, 1) } }]), R(7, 1)),
  )
  ok('indicatorExpectation(1/13)=1/13', eq(indicatorExpectation(R(1, 13)), R(1, 13)))
  ok('harmonic(6)=49/20', eq(harmonic(6), R(49, 20)))
  ok('couponCollector(6)=147/10', eq(couponCollector(6), R(147, 10)))
  ok('distinctAfterDraws(6,2)=11/6', eq(distinctAfterDraws(6, 2), R(11, 6)))
  ok('orderStatUniform(500).max=500/501', eq(orderStatUniform(500).max, R(500, 501)))
  ok('orderStatUniform(2).min=1/3', eq(orderStatUniform(2).min, R(1, 3)))
  ok('noodleLoops(3)=23/15', eq(noodleLoops(3), R(23, 15)))
  console.log('✓ expectation engine self-check (Stage-2 anchor)')
}

// ── 6c. Optimal-stopping engine self-check (Stage-2 math anchor for
// course-optimal-stopping). Asserts the frozen engine reproduces the famous
// secretary-problem table (LibreTexts §12.9) so the interface can't silently
// drift; per-fixture accept/headline cross-checks land with the lessons.
{
  const ok = (label: string, cond: boolean) => {
    if (!cond) fail(`optimal-stopping engine self-check failed: ${label}`)
  }
  ok('naiveSuccess(10)=1/10', formatRationalOS(naiveSuccess(10)) === '1/10')
  ok('secretarySuccess(3,2)=1/2', formatRationalOS(secretarySuccess(3, 2)) === '1/2')
  ok('secretarySuccess(4,2)=11/24', formatRationalOS(secretarySuccess(4, 2)) === '11/24')
  ok('secretarySuccess(5,3)=13/30', formatRationalOS(secretarySuccess(5, 3)) === '13/30')
  ok('secretarySuccess(10,4)=3349/8400', formatRationalOS(secretarySuccess(10, 4)) === '3349/8400')
  ok('successCurve(4)=1/4,11/24,5/12,1/4', successCurve(4).map(formatRationalOS).join(',') === '1/4,11/24,5/12,1/4')
  const o4 = optimalCutoff(4)
  ok('optimalCutoff(4)={2,11/24}', o4.r === 2 && formatRationalOS(o4.p) === '11/24')
  ok('optimalCutoff(7).r=3', optimalCutoff(7).r === 3)
  ok('optimalCutoff(100).r=38', optimalCutoff(100).r === 38)
  ok('runStrategy([2,1,3],2).win', runStrategy([2, 1, 3], 2).win === true)
  ok('runStrategy([2,1,3],1) miss rank2', runStrategy([2, 1, 3], 1).win === false && runStrategy([2, 1, 3], 1).selectedRank === 2)
  console.log('✓ optimal-stopping engine self-check (Stage-2 anchor)')
}

// ── 7. Chapters-coverage gate (live-concept hard requirement, ADR-0004). The
// per-concept journey renders lessons ONLY inside course.chapters[], so for every
// course that declares chapters: each chapter lessonId must be a real lesson node,
// appear in exactly one chapter, and (if built) have a fixture on disk; and every
// built lesson node must be covered by some chapter (else it renders invisible).
const fixtureLessonIds = new Set(lessons.map((l) => l.lessonId))
for (const course of courses) {
  if (!course.chapters || course.chapters.length === 0) continue
  const nodeById = new Map(course.lessons.map((n) => [n.lessonId, n]))
  const seen = new Map<string, number>()
  for (const ch of course.chapters) {
    for (const id of ch.lessonIds) {
      seen.set(id, (seen.get(id) ?? 0) + 1)
      const node = nodeById.get(id)
      if (!node) {
        fail(`${course.courseId}: chapter "${ch.id}" lists ${id}, not a course.lessons[] node`)
      }
      if (node.built && !fixtureLessonIds.has(id)) {
        fail(`${course.courseId}: chapter lessonId ${id} is built but has no lesson fixture on disk`)
      }
    }
  }
  for (const [id, count] of seen) {
    if (count > 1) fail(`${course.courseId}: lessonId ${id} appears in ${count} chapters (must be exactly one)`)
  }
  for (const node of course.lessons) {
    if (node.built && !seen.has(node.lessonId)) {
      fail(`${course.courseId}: built lesson ${node.lessonId} is in no chapter (would render invisible)`)
    }
  }
  console.log(`✓ chapters cover all built lessons: ${course.courseId}`)
}

// ── 8. Combinatorics per-fixture engine cross-check (two-stage fact-check,
// Stage 2). For course-combinatorics beats whose engine inputs live in the
// fixture, recompute from src/engine/combinatorics.ts and compare. Problem-
// specific answerEntry/masteryChallenge accepts are cross-checked per lesson in
// src/content/lesson-combinatorics-*.factcheck.test.ts.
const stripNum = (s: string) => s.replace(/[,\s]/g, '')
let comboChecked = 0
for (const lesson of lessons) {
  if (lesson.courseId !== 'course-combinatorics') continue
  for (const beat of lesson.beats) {
    const it = beat.interaction
    const where = `${lesson.lessonId}/${beat.beatId}`
    if (it.type === 'countingTree' && it.accept) {
      const got = product(it.levels.map((l) => l.options)).toString()
      if (!it.accept.map(stripNum).includes(got)) {
        fail(`${where}: countingTree accept ${JSON.stringify(it.accept)} != product=${got}`)
      }
      comboChecked++
    } else if (it.type === 'selectionGrid' && it.accept) {
      const got = (it.order === 'off' ? nCk(it.n, it.k) : nPk(it.n, it.k)).toString()
      if (!it.accept.map(stripNum).includes(got)) {
        fail(`${where}: selectionGrid(${it.order}) accept ${JSON.stringify(it.accept)} != ${got}`)
      }
      comboChecked++
    } else if (it.type === 'pigeonholeBoard') {
      if (!forcesCollision(it.items, it.holes)) {
        fail(`${where}: pigeonholeBoard items=${it.items} holes=${it.holes} must force a collision (N>H)`)
      }
      comboChecked++
    } else if (it.type === 'probabilityCounter' && it.accept) {
      const fav = Number(product(it.factors.map((f) => f.value)))
      const r = probabilityFromCounts(fav, it.total)
      if (!it.accept.includes(`${r.n}/${r.d}`)) {
        fail(`${where}: probabilityCounter accept ${JSON.stringify(it.accept)} != ${r.n}/${r.d}`)
      }
      comboChecked++
    }
  }
}
console.log(`✓ combinatorics per-fixture engine cross-check (${comboChecked} beats)`)

// ── 8b. Expected-value per-fixture engine cross-check (two-stage fact-check,
// Stage 2; dormant until the EV fixtures land). For course-expected-value beats
// whose engine inputs live in the fixture (conditionalTree cases, couponCollectorSim
// n), recompute and compare any graded `accept`. Problem-specific answerEntry/
// masteryChallenge accepts are cross-checked per lesson in the build wave.
const reduceFrac = (s: string): string => {
  const m = /^(-?\d+)\s*\/\s*(\d+)$/.exec(s.trim())
  if (!m) return s.trim()
  const r = reduceRational(Number(m[1]), Number(m[2]))
  return `${r.n}/${r.d}`
}
let evChecked = 0
for (const lesson of lessons) {
  if (lesson.courseId !== 'course-expected-value') continue
  for (const beat of lesson.beats) {
    const it = beat.interaction
    const where = `${lesson.lessonId}/${beat.beatId}`
    if (it.type === 'conditionalTree' && it.accept) {
      const r = totalExpectation(it.cases)
      const want = `${r.n}/${r.d}`
      if (!it.accept.map(reduceFrac).includes(want) && !it.accept.includes(String(r.n))) {
        fail(`${where}: conditionalTree accept ${JSON.stringify(it.accept)} != totalExpectation=${want}`)
      }
      evChecked++
    } else if (it.type === 'couponCollectorSim' && it.accept) {
      const r = couponCollector(it.n)
      const want = `${r.n}/${r.d}`
      if (!it.accept.map(reduceFrac).includes(want) && !it.accept.includes(String(r.n))) {
        fail(`${where}: couponCollectorSim accept ${JSON.stringify(it.accept)} != couponCollector(${it.n})=${want}`)
      }
      evChecked++
    }
  }
}
console.log(`✓ expectation per-fixture engine cross-check (${evChecked} beats)`)

// ── 9. Held-out transfer ACCEPT cross-check (spec-24 §3.5 step 4 / R9). The §5
// loop already engine-reproduces the ACCEPT of every PATTERN-pinned heldOut beat
// via buildAutomaton (the pattern-hitting-times concept). The other six concepts'
// heldOut beats are masteryChallenge problems with no pattern, so this section
// reproduces each one's graded answer from its own concept engine (src/engine/
// <concept>.ts) — mirroring how that concept already cross-checks its other beats
// (§3b/§3c/§8/§8b and the per-lesson *.factcheck.test.ts). The transfer problem's
// inputs are read off the beat's stated scenario and encoded here exactly as the
// factcheck tests encode their problem numbers (e.g. nPk(365,3)); the engine's
// output must appear in the heldOut field's `accept`. A transfer beat whose number
// the engine does NOT reproduce must not ship (R9: a gold gate keyed off a wrong
// answer silently denies mastery). Membership/normalization mirrors §8's stripNum.
//
// DEFERRED (documented, not silently skipped): five heldOut beats are NOT covered
// here because reproducing them would mean re-encoding the whole problem brittly
// rather than reading a faithful engine input (per the spec's "if it genuinely
// cannot be re-derived from the fixture, defer" clause):
//   • lesson-markov-chains-1  — the accept (3/4) is a transition probability READ
//     OFF the streak rule, not a chain computation; the engine would only echo an
//     input, not derive it.
//   • lesson-markov-chains-2  — requires constructing an ambiguous 3×3 worker-mood
//     matrix from a multi-clause prose rule (re-encoding the problem), and most of
//     its fields (dist-dist=0, rowsum=1) are definitional, not engine outputs.
//   • lesson-markov-chains-4  — the `classes` field is prose, and the return prob
//     has no direct engine fn (it needs a bespoke hand-built sub-calculation).
//   • lesson-markov-chains-5  — requires building a bespoke 4-state race automaton
//     from prose (re-encoding the whole problem).
//   • lesson-optimal-stopping-3 — its accepts (36, 37) are DISPLAY-ROUNDED
//     percentages / a stated r*, not exact engine rational outputs (37 ≈ 100/e);
//     asserting them would require ratToNumber rounding, which the engine marks
//     "never on a graded path." Left to the per-lesson factcheck test.
const R3 = (n: number, d = 1): Rational => ({ n, d })
const C3 = (rr: number, cc: number) => ({ row: R3(rr), col: R3(cc) })
// Each entry recomputes one or more graded fields of a lesson's heldOut beat from
// its concept engine. `want` is the engine's exact answer string; it must appear
// in that field's `accept` (comma/space-stripped, like §8).
const HELDOUT_RECOMPUTE: Record<string, () => { field: string; want: string }[]> = {
  // ----- bayes-rule (src/engine/bayes.ts; same calls as §3b / the bayes goldens) -----
  // L1 trick die: P(trick|66), priors 1/2, L(66|trick)=1, L(66|fair)=(1/6)^2.
  'lesson-bayes-rule-1': () => [{ field: 'trick', want: formatRational(sequentialPosterior(R3(1, 2), R3(1), R3(1, 6), 2)) }],
  // L2 airport scanner: prior 2%, sens 98%, 1−spec = 10%.
  'lesson-bayes-rule-2': () => [{ field: 'p', want: formatRational(bayesUpdate(R3(2, 100), R3(98, 100), R3(10, 100))) }],
  // L3 loaded-die: smallest k with sequentialPosterior(1/100, 1, 1/6, k) ≥ 1/2.
  'lesson-bayes-rule-3': () => [{ field: 'k', want: formatRational(smallestKCross(R3(1, 100), R3(1), R3(1, 6), R3(1, 2))) }],
  // L4 three factories: P(F3|dud), priors 50/30/20%, dud rates 2/4/6%.
  'lesson-bayes-rule-4': () => [{ field: 'pf3', want: formatRational(bayesPosterior([R3(50, 100), R3(30, 100), R3(20, 100)], [R3(2, 100), R3(4, 100), R3(6, 100)])[2]) }],
  // L5 unknowing-host: prize in A/B/C (priors 1/3); friend opens empty C with
  // L(openC|A)=1/2, L(openC|B)=1/2, L(openC|C)=0 ⇒ P(B|openC).
  'lesson-bayes-rule-5': () => [{ field: 'boxb', want: formatRational(bayesPosterior([R3(1, 3), R3(1, 3), R3(1, 3)], [R3(1, 2), R3(1, 2), R3(0)])[1]) }],
  // L6 four girls: P(GGGG | ≥1 girl) — prior 1/16, L=1, L(¬GGGG ∧ ≥1 girl)=14/15.
  'lesson-bayes-rule-6': () => [{ field: 'four', want: formatRational(bayesUpdate(R3(1, 16), R3(1), R3(14, 15))) }],
  // L7 fingerprint database: 1 true source (matches w.p. 1) vs an expected single
  // innocent match (500000 × 1/500000 = 1) ⇒ posterior odds 1:1 ⇒ 1/2.
  'lesson-bayes-rule-7': () => [{ field: 'fingerdb', want: formatRational(bayesUpdate(R3(1, 2), R3(1), R3(1))) }],
  // L8 spam: prior 1/200, recall(sens) 99%, false-positive 2%.
  'lesson-bayes-rule-8': () => [{ field: 'spam', want: formatRational(bayesUpdate(R3(1, 200), R3(99, 100), R3(2, 100))) }],

  // ----- combinatorics (src/engine/combinatorics.ts; same style as §8 / its factchecks) -----
  // L1 4-letter no-repeat code over 26 letters = _26P_4.
  'lesson-combinatorics-1': () => [{ field: 'ans', want: nPk(26, 4).toString() }],
  // L2 arrange 5 distinct runners over 5 medals = 5!.
  'lesson-combinatorics-2': () => [{ field: 'orders', want: factorial(5).toString() }],
  // L3 coefficient of x^2 y^3 in (x+2y)^5 = C(5,3)·2^3.
  'lesson-combinatorics-3': () => [{ field: 'coeff-x2y3', want: (nCk(5, 3) * 8n).toString() }],
  // L4 full house: 13·C(4,3)·12·C(4,2) hands; prob over C(52,5).
  'lesson-combinatorics-4': () => {
    const count = 13n * nCk(4, 3) * 12n * nCk(4, 2)
    const p = probabilityFromCounts(Number(count), 2_598_960)
    return [{ field: 'fh-count', want: count.toString() }, { field: 'fh-prob', want: `${p.n}/${p.d}` }]
  },
  // L5 32 students into 12 months ⇒ ⌈32/12⌉.
  'lesson-combinatorics-5': () => [{ field: 'min-per-month', want: String(pigeonholeMin(32, 12)) }],
  // L6 three-of-a-kind: 13·C(4,3)·C(12,2)·4·4 hands; prob over C(52,5).
  'lesson-combinatorics-6': () => {
    const count = 13n * nCk(4, 3) * nCk(12, 2) * 4n * 4n
    const p = probabilityFromCounts(Number(count), 2_598_960)
    return [{ field: 'trip-count', want: count.toString() }, { field: 'trip-prob', want: `${p.n}/${p.d}` }]
  },

  // ----- expected-value (src/engine/expectation.ts; same style as §6b / §8b) -----
  // L1 sum of two fair d4: Σ x·P(x) over the triangular pmf (weights 1..4..1)/16.
  'lesson-expected-value-1': () => {
    const w = [1, 2, 3, 4, 3, 2, 1]
    const pmf = w.map((wi, i) => ({ x: R3(i + 2), p: R3(wi, 16) }))
    return [{ field: 'ev-two-d4', want: formatRational(expectedValue(pmf)) }]
  },
  // L2 four noodles: E[loops] = Σ 1/(2k−1).
  'lesson-expected-value-2': () => [{ field: 'noodles-4', want: formatRational(noodleLoops(4)) }],
  // L3 three rolls of a d6: E[distinct] = 6·(1 − (5/6)^3) = distinctAfterDraws(6,3).
  'lesson-expected-value-3': () => [{ field: 'e-distinct-3', want: formatRational(distinctAfterDraws(6, 3)) }],
  // L4 self-referential coin replay: E = 1/2·1 + 1/2·(2 + E).
  'lesson-expected-value-4': () => [{ field: 'ev-coin-replay', want: formatRational(totalExpectation([{ p: R3(1, 2), value: R3(1) }, { p: R3(1, 2), restart: { add: R3(2) } }])) }],
  // L5 collect all N=4 colors: coupon collector N·H_N.
  'lesson-expected-value-5': () => [{ field: 'full-set-4', want: formatRational(couponCollector(4)) }],
  // L6 three IID Uniform(0,1): E[max]=n/(n+1), E[min]=1/(n+1) for n=3.
  'lesson-expected-value-6': () => {
    const os = orderStatUniform(3)
    return [{ field: 'ev6-transfer-max', want: formatRational(os.max) }, { field: 'ev6-transfer-min', want: formatRational(os.min) }]
  },

  // ----- game-theory (src/engine/gameTheory.ts; same calls as §2d / §3e) -----
  // L1 advertising (High dominates Low): payoff to each at the dom-strategy
  // equilibrium, plus the (Low,Low) cooperative payoff. row0=High, row1=Low.
  'lesson-game-theory-1': () => {
    const adv = [[C3(2, 2), C3(6, 1)], [C3(1, 6), C3(4, 4)]]
    const sol = gtIesds(adv)
    if (!sol) fail('lesson-game-theory-1: advertising game has no IESDS solution')
    return [
      { field: 'ne', want: String(adv[sol!.row][sol!.col].row.n) },
      { field: 'coop', want: String(adv[1][1].row.n) },
    ]
  },
  // L2 format-coordination game: number of pure Nash equilibria; preferred = same.
  'lesson-game-theory-2': () => {
    const blu = [[C3(2, 1), C3(0, 0)], [C3(0, 0), C3(1, 2)]]
    const n = String(gtPureNash(blu).length)
    return [{ field: 'count', want: n }, { field: 'preferred', want: n }]
  },
  // L3 penalty shootout M=[[3,-1],[-2,4]]: mixed p=(d−c)/Δ, value=(ad−bc)/Δ.
  'lesson-game-theory-3': () => {
    const mv = gtMixedValue([[R3(3), R3(-1)], [R3(-2), R3(4)]])
    return [{ field: 'mix', want: gtFmt(mv.p) }, { field: 'value', want: gtFmt(mv.value) }]
  },
  // L4 newspaper scoop M=[[-2,3],[5,-1]]: same minimax formula.
  'lesson-game-theory-4': () => {
    const mv = gtMixedValue([[R3(-2), R3(3)], [R3(5), R3(-1)]])
    return [{ field: 'value', want: gtFmt(mv.value) }, { field: 'p', want: gtFmt(mv.p) }]
  },
  // L5 pirate 7/100 (proposer keeps, most-junior gets) + tiger&sheep parity at 7.
  'lesson-game-theory-5': () => {
    const split = gtPirate(7, 100)
    return [
      { field: 'keep7', want: String(split[0]) },
      { field: 'junior', want: String(split[split.length - 1]) },
      { field: 'sheep', want: gtTiger(7) ? 'yes' : 'no' },
    ]
  },
  // L6 nim heaps {2,3,4}: nim-sum and win/lose (non-zero ⇒ win).
  'lesson-game-theory-6': () => {
    const s = gtNimSum([2, 3, 4])
    return [{ field: 'nimsum', want: String(s) }, { field: 'win', want: s !== 0 ? 'yes' : 'no' }]
  },

  // ----- optimal-stopping (src/engine/optimalStopping.ts; same calls as §3d / §6c) -----
  // L1 commit to the fixed 4th of 6 (any fixed position) ⇒ 1/n.
  'lesson-optimal-stopping-1': () => [{ field: 'prob', want: formatRationalOS(naiveSuccess(6)) }],
  // L2 look-then-leap with n=6, r=3.
  'lesson-optimal-stopping-2': () => [{ field: 'prob', want: formatRationalOS(secretarySuccess(6, 3)) }],
  // L4 p_6(2) with the explicit formula.
  'lesson-optimal-stopping-4': () => [{ field: 'prob', want: formatRationalOS(secretarySuccess(6, 2)) }],
  // L5 buy a car among 7 with the OPTIMAL cutoff: skip = r*−1, prob = p_7(r*).
  'lesson-optimal-stopping-5': () => {
    const o = optimalCutoff(7)
    return [{ field: 'skip', want: String(o.r - 1) }, { field: 'prob', want: formatRationalOS(o.p) }]
  },

  // ----- markov-chains (src/engine/markov.ts; same calls as §2c / §3c) -----
  // L3 explicit worker-mood matrix: (P^3)[Distracted][Focused].
  'lesson-markov-chains-3': () => {
    const P = [[R3(1, 2), R3(1, 4), R3(1, 4)], [R3(1, 4), R3(1, 2), R3(1, 4)], [R3(1, 2), R3(1, 2), R3(0)]]
    return [{ field: 'df3', want: formatRational(matrixPower(P, 3)[2][0]) }]
  },
  // L6 server-load chain: stationary π (Low/Med/High) + Kac return time to Low.
  'lesson-markov-chains-6': () => {
    const P = [[R3(0), R3(1), R3(0)], [R3(1, 4), R3(1, 2), R3(1, 4)], [R3(0), R3(1, 2), R3(1, 2)]]
    const pi = stationaryDistribution(P)
    return [
      { field: 'piLow', want: formatRational(pi[0]) },
      { field: 'piMedium', want: formatRational(pi[1]) },
      { field: 'piHigh', want: formatRational(pi[2]) },
      { field: 'kacLow', want: formatRational(kacReturnTime(P, 0)) },
    ]
  },
  // L7 two-state mood chain P=[[1/2,1/2],[1/3,2/3]]: long-run π (start-independent),
  // so fromSunny == fromCloudy == π(Sunny).
  'lesson-markov-chains-7': () => {
    const pi = stationaryDistribution([[R3(1, 2), R3(1, 2)], [R3(1, 3), R3(2, 3)]])
    return [{ field: 'fromSunny', want: formatRational(pi[0]) }, { field: 'fromCloudy', want: formatRational(pi[0]) }]
  },
  // L8 Ehrenfest urn m=4: stationary π via detailed balance.
  'lesson-markov-chains-8': () => {
    const P = [
      [R3(0), R3(1), R3(0), R3(0), R3(0)],
      [R3(1, 4), R3(0), R3(3, 4), R3(0), R3(0)],
      [R3(0), R3(1, 2), R3(0), R3(1, 2), R3(0)],
      [R3(0), R3(0), R3(3, 4), R3(0), R3(1, 4)],
      [R3(0), R3(0), R3(0), R3(1), R3(0)],
    ]
    const pi = stationaryDistribution(P)
    return [0, 1, 2, 3, 4].map((i) => ({ field: `pi${i}`, want: formatRational(pi[i]) }))
  },
  // L9 PageRank, d=1, links 1→{2,3}, 2→1, 3→{1,4}, 4→1 (0-indexed pages 0..3).
  'lesson-markov-chains-9': () => {
    const G = [[R3(0), R3(1, 2), R3(1, 2), R3(0)], [R3(1), R3(0), R3(0), R3(0)], [R3(1, 2), R3(0), R3(0), R3(1, 2)], [R3(1), R3(0), R3(0), R3(0)]]
    return [{ field: 'scores', want: formatVector(pagerank(G, R3(1))) }]
  },
  // L10 beetle on stones 0..5, simple random walk, 0 and 5 absorbing: P(end on 5).
  'lesson-markov-chains-10': () => {
    const half = R3(1, 2)
    const P = [
      [R3(1), R3(0), R3(0), R3(0), R3(0), R3(0)],
      [half, R3(0), half, R3(0), R3(0), R3(0)],
      [R3(0), half, R3(0), half, R3(0), R3(0)],
      [R3(0), R3(0), half, R3(0), half, R3(0)],
      [R3(0), R3(0), R3(0), half, R3(0), half],
      [R3(0), R3(0), R3(0), R3(0), R3(0), R3(1)],
    ]
    const B = absorptionProbabilities(P, [0, 5]) // transient 1..4; column 1 = absorb at stone 5
    return [1, 2, 3, 4].map((s, idx) => ({ field: `from${s}`, want: formatRational(B[idx][1]) }))
  },
}
let heldOutChecked = 0
for (const lesson of lessons) {
  const recompute = HELDOUT_RECOMPUTE[lesson.lessonId]
  if (!recompute) continue
  const beat = lesson.beats.find((b) => (b as { heldOut?: boolean }).heldOut === true)
  if (!beat) fail(`${lesson.lessonId}: §9 expected a heldOut transfer beat to cross-check but found none`)
  const it = beat!.interaction
  if (it.type !== 'masteryChallenge' && it.type !== 'answerEntry') {
    fail(`${lesson.lessonId}/${beat!.beatId}: heldOut accept cross-check needs masteryChallenge/answerEntry, got ${it.type}`)
  }
  const fieldsById = new Map(it.fields.map((f) => [f.id, f.accept]))
  for (const { field, want } of recompute()) {
    const accept = fieldsById.get(field)
    if (!accept) fail(`${lesson.lessonId}/${beat!.beatId}: heldOut field "${field}" not found (fields: ${[...fieldsById.keys()].join(', ')})`)
    if (!accept!.map(stripNum).includes(stripNum(want))) {
      fail(`${lesson.lessonId}/${beat!.beatId}: heldOut field "${field}" accept ${JSON.stringify(accept)} does not contain engine answer "${want}"`)
    }
    heldOutChecked++
  }
}
console.log(`✓ held-out transfer accept cross-check (${heldOutChecked} fields, 6 concepts)`)

console.log('\nAll fixtures valid.')
