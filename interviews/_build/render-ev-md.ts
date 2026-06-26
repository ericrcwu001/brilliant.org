#!/usr/bin/env tsx
// interviews/_build/render-ev-md.ts
// Renders interviews/course-expected-value.md from interviews/course-expected-value.json.
// No engine imports — JSON.parse only. Deterministic output.

import { readFileSync, writeFileSync } from 'node:fs'

const JSON_PATH = 'interviews/course-expected-value.json'
const MD_PATH = 'interviews/course-expected-value.md'

type Tier = 'hard' | 'harder' | 'brutal'

interface Rubric {
  correctness: string
  approach: string
  rigor: string
  communication: string
  speed: string
}

interface Question {
  id: string
  tier: Tier
  fingerprint: string
  prompt: string
  source: string
  engineCheck: {
    module: string
    calls: string[]
    answer: string
    verified: boolean
  }
  hidden: {
    answer: string
    approaches: string[]
    wrongTurns: string[]
    hintLadder: [string, string, string]
    rubric: Rubric
  }
  followUps: string[]
}

interface Pack {
  version: number
  courseId: string
  concept: string
  greenBookAnchor: string
  engineModule: string
  note: string
  counts: {
    total: number
    byTier: Record<Tier, number>
    templated: number
    freeForm: number
  }
  interviewerPrompt: string
  generatorPrompt: string
  templates: Array<{
    id: string
    title: string
    source: string
    description: string
  }>
  questions: Question[]
}

const TIER_ORDER: Tier[] = ['hard', 'harder', 'brutal']

function bullet(items: string[]): string {
  return items.map(item => `- ${item}`).join('\n')
}

function numbered(items: string[]): string {
  return items.map((item, i) => `${i + 1}. ${item}`).join('\n')
}

function renderQuestion(q: Question): string {
  const ec = q.engineCheck
  const calls = ec.calls.join(', ')
  const h = q.hidden
  const r = h.rubric

  return [
    `### ${q.id}  ·  ${q.tier}`,
    '',
    `**Source:** ${q.source}`,
    '',
    `**Fingerprint:** ${q.fingerprint}`,
    '',
    `**Prompt:** ${q.prompt}`,
    '',
    `**Engine check:** ${ec.module} · ${calls} · answer: ${ec.answer} · verified: ${ec.verified}`,
    '',
    '#### Hidden',
    '',
    `**Answer:** ${h.answer}`,
    '',
    '**Approaches:**',
    bullet(h.approaches),
    '',
    '**Wrong turns:**',
    bullet(h.wrongTurns),
    '',
    '**Hint ladder:**',
    numbered(h.hintLadder),
    '',
    '**Rubric:**',
    `- correctness: ${r.correctness}`,
    `- approach: ${r.approach}`,
    `- rigor: ${r.rigor}`,
    `- communication: ${r.communication}`,
    `- speed: ${r.speed}`,
    '',
    '**Follow-ups:**',
    bullet(q.followUps),
    '',
  ].join('\n')
}

function main(): void {
  const pack = JSON.parse(readFileSync(JSON_PATH, 'utf8')) as Pack

  const lines: string[] = [
    '# Expected Value — AI Quant Interview Pack',
    '',
    `> **DORMANT capstone asset** — committed to the repo but **NOT** seeded or deployed (the seed glob matches only \`fixtures/course-*.json\`; this pack lives under \`interviews/\`).`,
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
    ...TIER_ORDER.map(t => `| ${t} | ${pack.counts.byTier[t]} |`),
    '',
    `- **templated:** ${pack.counts.templated}`,
    `- **freeForm:** ${pack.counts.freeForm}`,
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
    '| id | title | source | description |',
    '| --- | --- | --- | --- |',
    ...pack.templates.map(t =>
      `| ${t.id} | ${t.title} | ${t.source} | ${t.description} |`,
    ),
    '',
    '## Questions',
    '',
  ]

  for (const tier of TIER_ORDER) {
    const group = pack.questions.filter(q => q.tier === tier)
    if (group.length === 0) continue
    lines.push(`**Tier: ${tier}**`, '')
    for (const q of group) {
      lines.push(renderQuestion(q))
    }
  }

  writeFileSync(MD_PATH, lines.join('\n'), 'utf8')
  console.log(`Wrote ${MD_PATH} (${pack.questions.length} questions)`)
}

main()
