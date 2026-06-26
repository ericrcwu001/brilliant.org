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
import { buildAutomaton, reduce } from '../src/engine/automaton'
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

// ── 2. L0 on-ramp golden (L1 §5.7): the single-letter "H" automaton waits 2.
const hAutomaton = buildAutomaton('H', 0.5)
if (hAutomaton.expectedTimes.E0 !== 2) {
  fail(`E[H] expected 2, got ${hAutomaton.expectedTimes.E0}`)
}
console.log('✓ E[H] = 2 (L0 on-ramp)')

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
  // Expected Value concept (Wave-0 contract).
  'lesson-expected-value-1',
  'lesson-expected-value-2',
  'lesson-expected-value-3',
  'lesson-expected-value-4',
  'lesson-expected-value-5',
  'lesson-expected-value-6',
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
  // Expected Value concept (Wave-0 contract).
  'lesson-expected-value-1',
  'lesson-expected-value-2',
  'lesson-expected-value-3',
  'lesson-expected-value-4',
  'lesson-expected-value-5',
  'lesson-expected-value-6',
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

// ── 6. Expected-value engine self-check (Stage-2 math anchor for
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

// ── 7. Chapters-coverage gate (live-concept hard requirement, ADR-0004). For
// every course that declares chapters[]: each chapter lessonId must be a real
// lesson node, appear in exactly one chapter, and (if built) have a fixture on
// disk; and every built lesson node must be covered by some chapter.
const fixtureLessonIds = new Set(lessons.map((l) => l.lessonId))
for (const course of courses) {
  if (!course.chapters || course.chapters.length === 0) continue
  const nodeById = new Map(course.lessons.map((nd) => [nd.lessonId, nd]))
  const seen = new Map<string, number>()
  for (const ch of course.chapters) {
    for (const id of ch.lessonIds) {
      seen.set(id, (seen.get(id) ?? 0) + 1)
      const node = nodeById.get(id)
      if (!node) fail(`${course.courseId}: chapter "${ch.id}" lists ${id}, not a course.lessons[] node`)
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

// ── 8. Expected-value per-fixture engine cross-check (two-stage fact-check,
// Stage 2; dormant until the EV fixtures land). For course-expected-value beats
// whose engine inputs live in the fixture (conditionalTree cases, couponCollectorSim
// n), recompute and compare any graded `accept`. Problem-specific answerEntry/
// masteryChallenge accepts are cross-checked per lesson in the build wave.
const reduceFrac = (s: string): string => {
  const m = /^(-?\d+)\s*\/\s*(\d+)$/.exec(s.trim())
  if (!m) return s.trim()
  const r = reduce(Number(m[1]), Number(m[2]))
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
