// Renders the human-readable mirror interviews/course-game-theory.md from the
// canonical interviews/course-game-theory.json (no engine import; deterministic).
// Run: ./node_modules/.bin/tsx interviews/_build/render-game-theory-md.ts

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseInterviewPack } from '../../src/content/interviewPack'

const here = dirname(fileURLToPath(import.meta.url))
const pack = parseInterviewPack(JSON.parse(readFileSync(join(here, '..', 'course-game-theory.json'), 'utf8')))

const lines: string[] = []
lines.push(`# Interview Pack \u2014 ${pack.concept} (${pack.courseId})`)
lines.push('')
lines.push('> Dormant capstone asset (ADR-0005/0008): committed but NOT seeded or deployed. This is the')
lines.push('> human-readable mirror of the canonical JSON. Regenerate with')
lines.push('> `./node_modules/.bin/tsx interviews/_build/render-game-theory-md.ts`.')
lines.push('')
lines.push(`**Green Book anchor:** ${pack.greenBookAnchor}`)
lines.push('')
lines.push(`**Engine:** \`${pack.engineModule}\` (every templated answer is reproduced exactly).`)
lines.push('')
lines.push(
  `**Counts:** ${pack.counts.total} questions \u2014 hard ${pack.counts.byTier.hard} / harder ${pack.counts.byTier.harder} / brutal ${pack.counts.byTier.brutal}; ` +
    `${pack.counts.templated} templated, ${pack.counts.freeForm} free-form.`,
)
lines.push('')
lines.push('## Templates')
lines.push('')
for (const t of pack.templates) {
  lines.push(`- **${t.id}** \u2014 ${t.title}. ${t.description}  \n  _Source:_ ${t.source}`)
}
lines.push('')
lines.push('## Questions')
lines.push('')
for (const tier of ['hard', 'harder', 'brutal'] as const) {
  const qs = pack.questions.filter((q) => q.tier === tier)
  lines.push(`### Tier: ${tier} (${qs.length})`)
  lines.push('')
  for (const q of qs) {
    lines.push(`#### ${q.id}`)
    lines.push('')
    lines.push(`- **Prompt:** ${q.prompt}`)
    lines.push(`- **Answer:** \`${q.hidden.answer}\``)
    lines.push(`- **Source:** ${q.source}`)
    if (q.template) lines.push(`- **Template:** \`${q.template.id}\``)
    lines.push(`- **Engine check:** \`${q.engineCheck.calls.join('; ')}\` \u2014 verified: ${q.engineCheck.verified}`)
    lines.push(`- **Approaches:** ${q.hidden.approaches.join(' / ')}`)
    lines.push(`- **Follow-ups:** ${q.followUps.join(' \u2192 ')}`)
    lines.push('')
  }
}

const out = join(here, '..', 'course-game-theory.md')
writeFileSync(out, lines.join('\n') + '\n')
console.log(`\u2713 wrote ${out} (${pack.questions.length} questions)`)
