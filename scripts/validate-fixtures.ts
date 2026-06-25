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
import type { Beat, Lesson } from '../src/content/schema'
import { buildAutomaton } from '../src/engine/automaton'

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

// ── 1. Schema validation: every lesson-*.json, plus the fixed support fixtures.
const lessonFiles = readdirSync(fixturesDir)
  .filter((f) => /^lesson-.*\.json$/.test(f))
  .sort()
const lessons = lessonFiles.map((f) => validate(f, LessonSchema) as Lesson)
validate('course-pattern-hitting-times.json', CourseSchema)
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

console.log('\nAll fixtures valid.')
