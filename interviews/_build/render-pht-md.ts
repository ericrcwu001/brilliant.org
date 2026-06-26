#!/usr/bin/env tsx
// interviews/_build/render-pht-md.ts
// Renders interviews/course-pattern-hitting-times.md from the JSON.
// CANDIDATE-SAFE mirror: NO hidden fields, NO engineCheck.answer/calls.
// No engine imports — JSON.parse only. Deterministic output.

import { readFileSync, writeFileSync } from 'node:fs'

const JSON_PATH = 'interviews/course-pattern-hitting-times.json'
const MD_PATH = 'interviews/course-pattern-hitting-times.md'

type Tier = 'hard' | 'harder' | 'brutal'

interface Question {
  id: string
  tier: Tier
  fingerprint: string
  prompt: string
  source: string
  engineCheck: { module: string; verified: boolean }
  followUps: string[]
}

interface Pack {
  version: number
  courseId: string
  concept: string
  greenBookAnchor: string
  engineModule: string
  note: string
  counts: { total: number; byTier: Record<Tier, number>; templated: number; freeForm: number }
  templates: Array<{ id: string; title: string; source: string; description: string }>
  questions: Question[]
}

const TIER_ORDER: Tier[] = ['hard', 'harder', 'brutal']

function bullet(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n')
}

function renderQuestion(q: Question): string {
  return [
    `### ${q.id}  ·  ${q.tier}`,
    '',
    `**Source:** ${q.source}`,
    '',
    `**Fingerprint:** ${q.fingerprint}`,
    '',
    `**Prompt:** ${q.prompt}`,
    '',
    `**Engine:** ${q.engineCheck.module} · verified: ${q.engineCheck.verified}`,
    '',
    '**Follow-ups:**',
    bullet(q.followUps),
    '',
  ].join('\n')
}

function main(): void {
  const pack = JSON.parse(readFileSync(JSON_PATH, 'utf8')) as Pack

  const lines: string[] = [
    '# Pattern Hitting Times — AI Quant Interview Pack',
    '',
    '> **DORMANT capstone asset** — committed to the repo but **NOT** seeded or deployed. Candidate-safe mirror: hidden answers/rubric and engine answers are intentionally omitted (they live only in the JSON, server-side).',
    '',
    `- **courseId:** ${pack.courseId}`,
    `- **version:** ${pack.version}`,
    `- **concept:** ${pack.concept}`,
    `- **greenBookAnchor:** ${pack.greenBookAnchor}`,
    `- **engineModule:** ${pack.engineModule}`,
    '',
    '## Pool summary',
    '',
    `**Total:** ${pack.counts.total}`,
    '',
    '| Tier | Count |',
    '| --- | ---: |',
    ...TIER_ORDER.map((t) => `| ${t} | ${pack.counts.byTier[t]} |`),
    '',
    `- **templated:** ${pack.counts.templated}`,
    `- **freeForm:** ${pack.counts.freeForm}`,
    '',
    '## Templates',
    '',
    '| id | title | source | description |',
    '| --- | --- | --- | --- |',
    ...pack.templates.map((t) => `| ${t.id} | ${t.title} | ${t.source} | ${t.description} |`),
    '',
    '## Questions',
    '',
  ]

  for (const tier of TIER_ORDER) {
    const group = pack.questions.filter((q) => q.tier === tier)
    if (group.length === 0) continue
    lines.push(`**Tier: ${tier}**`, '')
    for (const q of group) lines.push(renderQuestion(q))
  }

  writeFileSync(MD_PATH, lines.join('\n'), 'utf8')
  console.log(`Wrote ${MD_PATH} (${pack.questions.length} questions)`)
}

main()
