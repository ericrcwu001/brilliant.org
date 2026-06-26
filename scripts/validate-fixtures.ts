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
import { buildAutomaton, reduce as reduceRational, ratAdd, ratMul } from '../src/engine/automaton'
import {
  nCk,
  nPk,
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
  posteriorOdds, oddsToProb, bayesUpdate, formatRational,
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

// ── 3d. Game-theory headline cross-check — recompute each declared `headline`
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
  // concept-game-theory
  'lesson-game-theory-1','lesson-game-theory-2','lesson-game-theory-3',
  'lesson-game-theory-4','lesson-game-theory-5','lesson-game-theory-6',
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
  // concept-game-theory
  'lesson-game-theory-1','lesson-game-theory-2','lesson-game-theory-3',
  'lesson-game-theory-4','lesson-game-theory-5','lesson-game-theory-6',
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
  console.log(`✓ mastery-challenge gate: ${lesson.lessonId}`)
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

console.log('\nAll fixtures valid.')
