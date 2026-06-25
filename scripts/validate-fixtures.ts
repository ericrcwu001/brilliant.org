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
import {
  bayesPosterior, sequentialPosterior, naturalFrequencies,
  posteriorOdds, oddsToProb, bayesUpdate, formatRational,
} from '../src/engine/bayes'
import type { Rational } from '../src/engine/types'

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
courseFiles.forEach((f) => validate(f, CourseSchema))

validate('example-snapshot.json', SnapshotSchema)
validate('canonical.example.json', CanonicalRecurrenceSchema)

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
  'lesson-bayes-rule-1', 'lesson-bayes-rule-2', 'lesson-bayes-rule-3', // Bayes concept L1–L3
  'lesson-bayes-rule-4', 'lesson-bayes-rule-5', 'lesson-bayes-rule-6',
  'lesson-bayes-rule-7', 'lesson-bayes-rule-8',                         // Bayes concept L4–L8
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
  'lesson-bayes-rule-1', 'lesson-bayes-rule-2', 'lesson-bayes-rule-3', // Bayes concept L1–L3
  'lesson-bayes-rule-4', 'lesson-bayes-rule-5', 'lesson-bayes-rule-6',
  'lesson-bayes-rule-7', 'lesson-bayes-rule-8',                         // Bayes concept L4–L8
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

// ── 6. Chapters-coverage assertion — every built lessonId appears in exactly
// one chapter; every chapter lessonId is built and has a real fixture.
// Guards the "invisible lessons" trap (resolveChapters falls back to ERGO_CHAPTERS
// when chapters[] is absent/empty). Exempt: coming-soon stubs with no chapters.
const lessonIdsBuiltFixture = new Set(lessons.map((l) => l.lessonId))
for (const file of courseFiles) {
  const course = readJson(file) as {
    courseId: string
    chapters?: { id: string; lessonIds: string[] }[]
    lessons?: { lessonId: string; built: boolean }[]
  }
  const chapters = course.chapters ?? []
  if (chapters.length === 0) continue
  const builtNodes = (course.lessons ?? []).filter((l) => l.built).map((l) => l.lessonId)
  const chapterIds = chapters.flatMap((c) => c.lessonIds)

  for (const id of chapterIds) {
    if (!builtNodes.includes(id)) fail(`${file}: chapter references non-built lesson "${id}"`)
  }
  for (const id of builtNodes) {
    if (!lessonIdsBuiltFixture.has(id)) fail(`${file}: built lesson node "${id}" has no lesson-*.json fixture`)
    const count = chapterIds.filter((c) => c === id).length
    if (count !== 1) fail(`${file}: built lesson "${id}" appears in ${count} chapters (must be exactly 1)`)
  }
  console.log(`✓ chapters-coverage: ${course.courseId}`)
}

console.log('\nAll fixtures valid.')
