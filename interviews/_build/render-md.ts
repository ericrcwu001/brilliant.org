#!/usr/bin/env tsx
/**
 * Render interviews/course-combinatorics.json → interviews/course-combinatorics.md
 * Deterministic mirror; no engine imports, no JSON mutation.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const JSON_PATH = join(ROOT, 'course-combinatorics.json')
const MD_PATH = join(ROOT, 'course-combinatorics.md')

type Tier = 'hard' | 'harder' | 'brutal'

interface Rubric {
  correctness: string
  approach: string
  rigor: string
  communication: string
  speed: string
}

interface Hidden {
  answer: string
  approaches: string[]
  wrongTurns: string[]
  hintLadder: string[]
  rubric: Rubric
}

interface EngineCheck {
  module: string
  calls: string[]
  answer: string
  verified: boolean
}

interface Question {
  id: string
  tier: Tier
  fingerprint: string
  prompt: string
  source: string
  engineCheck: EngineCheck
  hidden: Hidden
  followUps: string[]
}

interface Template {
  id: string
  title: string
  source: string
  description: string
}

interface Pack {
  version: number
  courseId: string
  concept: string
  greenBookAnchor: string
  engineModule: string
  counts: {
    total: number
    byTier: Record<Tier, number>
    templated: number
    freeForm: number
  }
  interviewerPrompt: string
  generatorPrompt: string
  templates: Template[]
  questions: Question[]
}

const TIER_ORDER: Tier[] = ['hard', 'harder', 'brutal']

function renderQuestion(q: Question): string {
  const ec = q.engineCheck
  const calls = ec.calls.join(' · ')
  const verified = ec.verified ? 'verified' : 'NOT verified'
  const h = q.hidden
  const r = h.rubric

  const lines: string[] = [
    `### ${q.id}  ·  ${q.tier}`,
    '',
    `**Source:** ${q.source}`,
    '',
    `**Fingerprint:** ${q.fingerprint}`,
    '',
    `**Prompt:** ${q.prompt}`,
    '',
    `**Engine check:** \`${ec.module}\` · ${calls} → ${ec.answer} (${verified})`,
    '',
    '#### Hidden',
    '',
    `**Answer:** ${h.answer}`,
    '',
    '**Approaches:**',
    ...h.approaches.map((a) => `- ${a}`),
    '',
    '**Wrong turns:**',
    ...h.wrongTurns.map((w) => `- ${w}`),
    '',
    '**Hint ladder:**',
    ...h.hintLadder.map((hint, i) => `${i + 1}. ${hint}`),
    '',
    '**Rubric:**',
    `- Correctness — ${r.correctness}`,
    `- Approach — ${r.approach}`,
    `- Rigor — ${r.rigor}`,
    `- Communication — ${r.communication}`,
    `- Speed — ${r.speed}`,
    '',
    '**Follow-ups:**',
    ...q.followUps.map((f) => `- ${f}`),
    '',
  ]

  return lines.join('\n')
}

function render(pack: Pack): string {
  const { counts } = pack
  const sections: string[] = [
    '# Combinatorics — AI Quant Interview Pack',
    '',
    '**DORMANT capstone asset:** committed but NOT seeded or deployed. The seed glob matches only `fixtures/course-*.json` and `fixtures/lesson-*.json`; this pack lives under `interviews/`.',
    '',
    `- **courseId:** \`${pack.courseId}\``,
    `- **version:** ${pack.version}`,
    `- **concept:** ${pack.concept}`,
    `- **greenBookAnchor:** ${pack.greenBookAnchor}`,
    `- **engineModule:** \`${pack.engineModule}\``,
    '',
    '## Pool summary',
    '',
    `Total questions: **${counts.total}**`,
    '',
    '| Tier | Count |',
    '| --- | ---: |',
    `| hard | ${counts.byTier.hard} |`,
    `| harder | ${counts.byTier.harder} |`,
    `| brutal | ${counts.byTier.brutal} |`,
    '',
    `- Templated: ${counts.templated}`,
    `- Free-form: ${counts.freeForm}`,
    '',
    '## Interviewer prompt',
    '',
    '```',
    pack.interviewerPrompt,
    '```',
    '',
    '## Generator prompt',
    '',
    '```',
    pack.generatorPrompt,
    '```',
    '',
    '## Templates',
    '',
    '| ID | Title | Source | Description |',
    '| --- | --- | --- | --- |',
    ...pack.templates.map(
      (t) =>
        `| ${t.id} | ${t.title} | ${t.source} | ${t.description} |`,
    ),
    '',
    '## Questions',
    '',
  ]

  for (const tier of TIER_ORDER) {
    const tierQuestions = pack.questions.filter((q) => q.tier === tier)
    if (tierQuestions.length === 0) continue

    sections.push(`#### Tier: ${tier}`, '')
    for (const q of tierQuestions) {
      sections.push(renderQuestion(q))
    }
  }

  return sections.join('\n')
}

const raw = readFileSync(JSON_PATH, 'utf8')
const pack = JSON.parse(raw) as Pack
const md = render(pack)
writeFileSync(MD_PATH, md, 'utf8')
console.log(`Wrote ${MD_PATH} (${md.length} bytes)`)
