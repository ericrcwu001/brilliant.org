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
import { buildAutomaton } from '../src/engine/automaton'
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
  // Combinatorics concept (Wave-0 contract).
  'lesson-combinatorics-1',
  'lesson-combinatorics-2',
  'lesson-combinatorics-3',
  'lesson-combinatorics-4',
  'lesson-combinatorics-5',
  'lesson-combinatorics-6',
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

console.log('\nAll fixtures valid.')
