// Answer-acceptance audit: for every checkable beat in every lesson fixture,
// assert that the canonical correct answer is accepted by the real grader.
//
// Environment: Vitest node (no jsdom). All grading helpers are pure / React-free.
// Run: npx vitest run src/lesson/answerAcceptance.audit.test.ts

import fs from 'fs'
import { describe, it, expect } from 'vitest'
import { LessonSchema } from '../content/schema'
import type { Beat, Lesson } from '../content/schema'
import { buildAutomaton } from '../engine/automaton'
import {
  norm,
  gradeAcceptFields,
  // selectionGrid
  selectionGridCount,
  isSelectionGridGraded,
  isSelectionGridCorrect,
  // countingTree
  countingTreeAnswer,
  isCountingTreeGraded,
  isCountingTreeCorrect,
  // vennCounter
  vennUnion,
  isVennCounterGraded,
  isVennCounterCorrect,
  // probabilityCounter
  canonicalProbabilityAnswer,
  isProbabilityCounterGraded,
  isProbabilityCounterCorrect,
  // stateTap
  correctStateTapPicks,
  isStateTapCorrect,
  // overlap
  correctOverlapPattern,
  isOverlapGraded,
  isOverlapCorrect,
  // equationTiles
  correctFill,
  isEquationRowGraded,
  diagnoseRow,
  // bayesUpdate
  isBayesUpdateGraded,
  bayesFocalCount,
  isBayesUpdateCorrect,
  // chainBoard
  isChainBoardGraded,
  correctChainAnswerFor,
  isChainBoardCorrect,
  // balanceSolve
  balancePointFor,
  isBalanceSolved,
  // handRanker
  correctRanking,
  isHandRankerCorrect,
  // retrievalGrid
  correctRetrievalAssignment,
  isRetrievalGridCorrect,
} from './grading'

// ── Known interaction types ──────────────────────────────────────────────────

// Types where grading IS asserted (always or conditionally)
const GRADED_TYPES = new Set([
  'answerEntry',
  'masteryChallenge',
  'equationTiles',
  'stateTap',
  'overlap',
  'bayesUpdate',
  'chainBoard',
  'balanceSolve',
  'handRanker',
  'retrievalGrid',
  'countingTree',
  'selectionGrid',
  'vennCounter',
  'probabilityCounter',
])

// Types that are intentionally ungraded
const UNGRADED_TYPES = new Set([
  'prediction',
  'patternPick',
  'coinSim',
  'slider',
  'substitution',
  'theorySimChart',
  'recap',
  'primer',
  'raceSim',
  'dominanceWheel',
  'walkBoard',
  'gamblerLedger',
  'sumTiles',
  'autocorrelationRuler',
  'tripletReveal',
  'pascalTriangle',
  'pigeonholeBoard',
  'expectationScale',
  'conditionalTree',
  'couponCollectorSim',
  'stoppingBoard',
  'payoffMatrix',
  'gameTree',
  'nimBoard',
  'bitBoard',
  'weighing',
])

const ALL_KNOWN_TYPES = new Set([...GRADED_TYPES, ...UNGRADED_TYPES])

// ── Fixture loading ──────────────────────────────────────────────────────────

const FIXTURE_DIR = 'fixtures'

const lessonFiles = fs
  .readdirSync(FIXTURE_DIR)
  .filter((f) => /^lesson-.*\.json$/.test(f))
  .sort()

const lessons: Lesson[] = lessonFiles.map((f) => {
  const raw = JSON.parse(fs.readFileSync(`${FIXTURE_DIR}/${f}`, 'utf8'))
  return LessonSchema.parse(raw)
})

// ── Coverage counters (collected across all lessons/beats) ───────────────────

const skippedCounts: Record<string, number> = {}
const gradedCounts: Record<string, number> = {}

// ── Thousands-separator helper ───────────────────────────────────────────────

/** True iff s is a proper thousands-grouped integer like "1,000" or "10,000". */
function isThousandsSep(s: string): boolean {
  return /^\d{1,3}(,\d{3})+$/.test(s)
}

// ── Per-beat check dispatchers ───────────────────────────────────────────────

function checkAnswerEntryOrMastery(beat: Beat) {
  const it = beat.interaction
  if (it.type !== 'answerEntry' && it.type !== 'masteryChallenge') return
  const { fields } = it

  for (const f of fields) {
    // (a) non-empty accept list
    expect(f.accept.length, `field ${f.id}: accept is empty`).toBeGreaterThan(0)

    // (c) thousands-separator completeness: any "1,000"-style entry must have
    //     the comma-free digit string also present (norm does NOT strip commas)
    for (const entry of f.accept) {
      if (isThousandsSep(entry)) {
        const bare = entry.replace(/,/g, '')
        const normAccept = f.accept.map(norm)
        expect(
          normAccept,
          `field ${f.id}: accept has "${entry}" (thousands-sep) but comma-free "${bare}" is missing`,
        ).toContain(norm(bare))
      }
    }
  }

  // (b) round-trip: gradeAcceptFields accepts the first entry for each field
  const firstValues: Record<string, string> = {}
  for (const f of fields) {
    firstValues[f.id] = f.accept[0]
  }
  expect(
    gradeAcceptFields(fields, firstValues),
    `gradeAcceptFields with first-entry values returned false`,
  ).toBe(true)

  // masteryChallenge + beat.pattern → check the engine's expected hitting time
  if (it.type === 'masteryChallenge' && beat.pattern) {
    const automaton = buildAutomaton(beat.pattern, 0.5)
    const e0 = automaton.expectedTimes.E0
    const allAccepts = fields.flatMap((f) => f.accept)
    expect(
      allAccepts,
      `masteryChallenge pattern ${beat.pattern} → E=${e0} not found in any field's accept list`,
    ).toContain(String(e0))
  }
}

function checkEquationTiles(beat: Beat) {
  const it = beat.interaction
  if (it.type !== 'equationTiles') return
  for (const row of it.rows) {
    if (!isEquationRowGraded(row)) continue
    const fill = correctFill(row.target)
    const result = diagnoseRow(fill, row.target)
    expect(
      result.ok,
      `equationTiles row ${row.lhs}: diagnoseRow(correctFill(...), target).ok is false`,
    ).toBe(true)
  }
}

function checkStateTap(beat: Beat, lesson: Lesson) {
  const it = beat.interaction
  if (it.type !== 'stateTap') return
  const pattern = beat.pattern ?? lesson.patternOptions[0]
  const automaton = buildAutomaton(pattern, 0.5)

  // Every transition must resolve to a defined next state
  for (const t of it.transitions) {
    const found = automaton.transitions.find((e) => e.from === t.from && e.on === t.on)
    expect(
      found,
      `stateTap: no transition from ${t.from} on ${t.on} in automaton for pattern "${pattern}"`,
    ).toBeDefined()
  }

  const picks = correctStateTapPicks({ transitions: it.transitions }, automaton)
  expect(
    isStateTapCorrect({ transitions: it.transitions }, automaton, picks),
    `isStateTapCorrect returned false for canonical picks`,
  ).toBe(true)
}

function checkOverlap(beat: Beat, lesson: Lesson) {
  const it = beat.interaction
  if (it.type !== 'overlap') return
  if (!isOverlapGraded(beat.density ?? 'merged')) return

  const automata = lesson.patternOptions.map((p) => buildAutomaton(p, 0.5))
  const correctPat = correctOverlapPattern(automata)
  expect(correctPat, `correctOverlapPattern returned undefined`).toBeDefined()
  expect(
    isOverlapCorrect(automata, correctPat!),
    `isOverlapCorrect returned false for correctOverlapPattern`,
  ).toBe(true)
}

function checkBayesUpdate(beat: Beat) {
  const it = beat.interaction
  if (it.type !== 'bayesUpdate') return
  if (!isBayesUpdateGraded(beat)) return

  const population = it.population ?? 3
  const n = bayesFocalCount(beat)
  expect(n, `bayesFocalCount out of range [0, ${population}]`).toBeGreaterThanOrEqual(0)
  expect(n, `bayesFocalCount out of range [0, ${population}]`).toBeLessThanOrEqual(population)
  const tapped = new Set(Array.from({ length: n }, (_, i) => i))
  expect(
    isBayesUpdateCorrect(beat, tapped),
    `isBayesUpdateCorrect returned false for canonical tapped set`,
  ).toBe(true)
}

function checkChainBoard(beat: Beat) {
  const it = beat.interaction
  if (it.type !== 'chainBoard') return
  if (!isChainBoardGraded(beat)) return

  const answer = correctChainAnswerFor(beat)
  expect(
    isChainBoardCorrect(beat, answer),
    `isChainBoardCorrect returned false for correctChainAnswerFor`,
  ).toBe(true)
}

function checkBalanceSolve(beat: Beat, lesson: Lesson) {
  const it = beat.interaction
  if (it.type !== 'balanceSolve') return
  const pattern = beat.pattern ?? lesson.patternOptions[0]
  const automaton = buildAutomaton(pattern, 0.5)
  const bp = balancePointFor(beat, automaton)
  const min = it.min
  const max = it.max

  expect(
    bp,
    `balancePointFor=${bp} is below slider min=${min}`,
  ).toBeGreaterThanOrEqual(min)
  expect(
    bp,
    `balancePointFor=${bp} is above slider max=${max}`,
  ).toBeLessThanOrEqual(max)
  expect(
    isBalanceSolved(beat, automaton, bp),
    `isBalanceSolved returned false at the balance point ${bp}`,
  ).toBe(true)
}

function checkHandRanker(beat: Beat) {
  const it = beat.interaction
  if (it.type !== 'handRanker') return
  const ranking = correctRanking(it)
  expect(
    isHandRankerCorrect(it, ranking),
    `isHandRankerCorrect returned false for correctRanking`,
  ).toBe(true)
}

function checkRetrievalGrid(beat: Beat) {
  const it = beat.interaction
  if (it.type !== 'retrievalGrid') return
  const assignment = correctRetrievalAssignment(it)
  // isRetrievalGridCorrect expects Record<number, string | null>
  const assign: Record<number, string | null> = {}
  for (let i = 0; i < assignment.length; i++) assign[i] = assignment[i]
  expect(
    isRetrievalGridCorrect(it, assign),
    `isRetrievalGridCorrect returned false for correctRetrievalAssignment`,
  ).toBe(true)
}

function checkCountingTree(beat: Beat) {
  const it = beat.interaction
  if (it.type !== 'countingTree') return
  if (!isCountingTreeGraded(it)) return
  const answer = countingTreeAnswer(it)
  expect(
    isCountingTreeCorrect(it, answer),
    `isCountingTreeCorrect returned false for countingTreeAnswer=${answer}`,
  ).toBe(true)
}

function checkSelectionGrid(beat: Beat) {
  const it = beat.interaction
  if (it.type !== 'selectionGrid') return
  if (!isSelectionGridGraded(it)) return
  const countUnordered = selectionGridCount(it, false)
  const countOrdered = selectionGridCount(it, true)
  const correctUnordered = isSelectionGridCorrect(it, countUnordered)
  const correctOrdered = isSelectionGridCorrect(it, countOrdered)
  expect(
    correctUnordered || correctOrdered,
    `selectionGrid: neither unordered count (${countUnordered}) nor ordered count (${countOrdered}) is accepted`,
  ).toBe(true)
}

function checkVennCounter(beat: Beat) {
  const it = beat.interaction
  if (it.type !== 'vennCounter') return
  if (!isVennCounterGraded(it)) return
  const union = vennUnion(it)
  expect(
    isVennCounterCorrect(it, union),
    `isVennCounterCorrect returned false for vennUnion=${union} (strict === check)`,
  ).toBe(true)
}

function checkProbabilityCounter(beat: Beat) {
  const it = beat.interaction
  if (it.type !== 'probabilityCounter') return
  if (!isProbabilityCounterGraded(it)) return
  const answer = canonicalProbabilityAnswer(it)
  if (answer === null) return // null means no factors, skip
  expect(
    isProbabilityCounterCorrect(it, answer),
    `isProbabilityCounterCorrect returned false for answer="${answer}" (strict === check)`,
  ).toBe(true)
}

// ── Main audit ───────────────────────────────────────────────────────────────

describe('answer-acceptance audit', () => {
  it('discovers exactly 54 lesson fixtures', () => {
    expect(lessons.length).toBe(54)
  })

  for (const lesson of lessons) {
    describe(lesson.lessonId, () => {
      for (const beat of lesson.beats) {
        const type = beat.interaction.type

        // Guard: unclassified type must fail loudly
        it(`${beat.beatId} / ${type}`, () => {
          if (!ALL_KNOWN_TYPES.has(type)) {
            throw new Error(
              `Unclassified beat type "${type}" in ${lesson.lessonId}/${beat.beatId} — ` +
              `add it to GRADED_TYPES or UNGRADED_TYPES in the audit.`,
            )
          }

          if (UNGRADED_TYPES.has(type)) {
            skippedCounts[type] = (skippedCounts[type] ?? 0) + 1
            return
          }

          // Graded type — run appropriate check
          gradedCounts[type] = (gradedCounts[type] ?? 0) + 1

          switch (type) {
            case 'answerEntry':
            case 'masteryChallenge':
              checkAnswerEntryOrMastery(beat)
              break
            case 'equationTiles':
              checkEquationTiles(beat)
              break
            case 'stateTap':
              checkStateTap(beat, lesson)
              break
            case 'overlap':
              checkOverlap(beat, lesson)
              break
            case 'bayesUpdate':
              checkBayesUpdate(beat)
              break
            case 'chainBoard':
              checkChainBoard(beat)
              break
            case 'balanceSolve':
              checkBalanceSolve(beat, lesson)
              break
            case 'handRanker':
              checkHandRanker(beat)
              break
            case 'retrievalGrid':
              checkRetrievalGrid(beat)
              break
            case 'countingTree':
              checkCountingTree(beat)
              break
            case 'selectionGrid':
              checkSelectionGrid(beat)
              break
            case 'vennCounter':
              checkVennCounter(beat)
              break
            case 'probabilityCounter':
              checkProbabilityCounter(beat)
              break
          }
        })
      }
    })
  }

  // Summary it — logs skipped and graded counts for auditability
  it('coverage summary (informational)', () => {
    const skippedTotal = Object.values(skippedCounts).reduce((a, b) => a + b, 0)
    const gradedTotal = Object.values(gradedCounts).reduce((a, b) => a + b, 0)
    console.log('\n=== Answer-Acceptance Audit Coverage ===')
    console.log(`Lessons scanned: ${lessons.length}`)
    console.log(`Beats with assertions: ${gradedTotal}`)
    console.log(`Beats skipped (ungraded): ${skippedTotal}`)
    console.log('\nGraded beat counts by type:')
    for (const [type, count] of Object.entries(gradedCounts).sort())
      console.log(`  ${type}: ${count}`)
    console.log('\nSkipped beat counts by type:')
    for (const [type, count] of Object.entries(skippedCounts).sort())
      console.log(`  ${type}: ${count}`)
    // The summary it is always a pass — its job is to report, not gate.
    expect(lessons.length).toBe(54)
  })
})
