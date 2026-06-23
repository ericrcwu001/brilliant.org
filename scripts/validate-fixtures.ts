// Validates every committed fixture against its Zod schema. Exits non-zero with
// a readable error on any schema violation, so a broken fixture fails CI and
// the local `npm run validate` check before it can be seeded.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { z } from 'zod'
import {
  CanonicalRecurrenceSchema,
  LessonSchema,
  SnapshotSchema,
} from '../src/content/schema'
import { buildAutomaton } from '../src/engine/automaton'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures')

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(join(fixturesDir, file), 'utf8'))
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

const lesson = validate(
  'lesson-pattern-hitting-times.json',
  LessonSchema,
) as z.infer<typeof LessonSchema>
validate('example-snapshot.json', SnapshotSchema)
validate('canonical.example.json', CanonicalRecurrenceSchema)

// Cross-check: the engine's generated recurrences must equal the fixture's
// equation-tile targets, so the content and the engine never drift apart.
const tilesBeat = lesson.beats.find((b) => b.beatId === 'equation-tiles')
if (!tilesBeat || tilesBeat.interaction.type !== 'equationTiles') {
  console.error('\n✗ equation-tiles beat missing or wrong interaction type')
  process.exit(1)
}
const automaton = buildAutomaton('HH', 0.5)
for (const row of tilesBeat.interaction.rows) {
  const expected = automaton.recurrences[row.lhs as keyof typeof automaton.recurrences]
  if (JSON.stringify(expected) !== JSON.stringify(row.target)) {
    console.error(
      `\n✗ equation-tiles target for ${row.lhs} does not match engine recurrence:`,
    )
    console.error('  engine:  ', JSON.stringify(expected))
    console.error('  fixture: ', JSON.stringify(row.target))
    process.exit(1)
  }
}
console.log('✓ engine recurrences match equation-tile targets (HH)')

console.log('\nAll fixtures valid.')
