// Study Desk course-path model (pure, presentation-layer). Projects the frozen
// Course + Cloud-Function progress cache onto the graph-node spine: per-lesson
// glyph, node state, the single recommended action (Resume > Review > Start >
// Replay), and the derived status/CTA copy. Kept dependency-free so it is unit
// tested without React/Firebase (see studyDesk.model.test.ts) and so the
// presentational StudyDesk stays a pure render of these values.

import type { Course, Progress } from '../content/schema'
import { FLAGSHIP_LESSON_ID } from './routes'

export type DeskNodeState =
  | 'completed'
  | 'needsReview'
  | 'available'
  | 'locked'

export interface DeskNode {
  lessonId: string
  title: string
  hook: string
  glyph: string
  built: boolean
  optional: boolean
  index: number
  state: DeskNodeState
}

// Per-lesson spine glyphs (docs/ui_design_system.md "Per-lesson glyphs").
// Rendered in JetBrains Mono inside the node dot.
export const LESSON_GLYPHS: Record<string, string> = {
  'lesson-first-heads': 'H?',
  'lesson-pattern-hitting-times': 'HH',
  'lesson-penneys-game': 'A≻B',
  'lesson-gamblers-ruin': 'i/N',
  'lesson-states-streaks': 'H',
  'lesson-longer-patterns': 'THH',
  'lesson-overlap-shortcut': 'Σ2ᴸ',
}

// Small bias glyph for the post-L6 "Weighted Coins & Dice" roadmap stub.
export const ROADMAP_GLYPH = 'p'

export function glyphFor(lessonId: string): string {
  return LESSON_GLYPHS[lessonId] ?? '·'
}

// Mirrors the card-precursor's resolveState (CoursePathPage) plus the needsReview
// node variant. Completed-with-review takes its own state so the spine can draw
// the filled dot + --mark ring (docs/home-study-desk.md §2.4 / Q8).
function nodeState(
  lessonId: string,
  built: boolean,
  progress: Progress | undefined,
  predecessorCompleted: boolean,
  optional: boolean,
): DeskNodeState {
  if (progress?.completionStatus === 'completed') {
    return progress.needsReview ? 'needsReview' : 'completed'
  }
  if (!built) return 'locked'
  // The flagship and any optional on-ramp (L1 §6) are always available; the
  // on-ramp is ungated so it never locks behind a predecessor.
  if (lessonId === FLAGSHIP_LESSON_ID || optional) return 'available'
  if (progress?.unlockedAt != null || progress?.completionStatus === 'in_progress') {
    return 'available'
  }
  if (predecessorCompleted) return 'available'
  return 'locked'
}

export function resolveNodes(
  course: Course,
  progressById: Record<string, Progress>,
): DeskNode[] {
  return course.lessons.map((lesson, index) => {
    const predecessor = index === 0 ? null : course.lessons[index - 1]?.lessonId ?? null
    const predecessorCompleted =
      predecessor != null &&
      progressById[predecessor]?.completionStatus === 'completed'
    return {
      lessonId: lesson.lessonId,
      title: lesson.title,
      hook: lesson.summary,
      glyph: glyphFor(lesson.lessonId),
      built: lesson.built,
      optional: lesson.optional ?? false,
      index,
      state: nodeState(
        lesson.lessonId,
        lesson.built,
        progressById[lesson.lessonId],
        predecessorCompleted,
        lesson.optional ?? false,
      ),
    }
  })
}

export type ActionKind = 'resume' | 'review' | 'start' | 'replay'

export interface RecommendedAction {
  kind: ActionKind
  /** The focused/pinned lesson; null only when there are no lessons. */
  lessonId: string | null
}

// Recommended-action priority (docs/home-study-desk.md §2.6 / Q9): an in-progress
// session always wins focus; Review is offered only between lessons; otherwise
// Start the next unlocked lesson; all mastered → Replay.
export function recommendedAction(
  nodes: DeskNode[],
  progressById: Record<string, Progress>,
): RecommendedAction {
  const resume = nodes.find(
    (n) => progressById[n.lessonId]?.completionStatus === 'in_progress',
  )
  if (resume) return { kind: 'resume', lessonId: resume.lessonId }

  const review = nodes.find((n) => n.state === 'needsReview')
  if (review) return { kind: 'review', lessonId: review.lessonId }

  // The optional on-ramp is enterable but never the recommended next step — the
  // chain steers toward the required spine (so it isn't nagged forever).
  const start = nodes.find(
    (n) =>
      !n.optional &&
      n.state === 'available' &&
      progressById[n.lessonId]?.completionStatus == null,
  )
  if (start) return { kind: 'start', lessonId: start.lessonId }

  const anyAvailable = nodes.find((n) => !n.optional && n.state === 'available')
  if (anyAvailable) return { kind: 'start', lessonId: anyAvailable.lessonId }

  const firstRequired = nodes.find((n) => !n.optional) ?? nodes[0]
  return { kind: 'replay', lessonId: firstRequired?.lessonId ?? null }
}

function titleOf(nodes: DeskNode[], lessonId: string | null): string {
  return nodes.find((n) => n.lessonId === lessonId)?.title ?? ''
}

// One-line habit-panel status; agrees with the focused node (Q9).
export function statusLine(action: RecommendedAction, nodes: DeskNode[]): string {
  switch (action.kind) {
    case 'resume':
      return `Resume ${titleOf(nodes, action.lessonId)}`
    case 'review':
      return `Review ${titleOf(nodes, action.lessonId)}`
    case 'start':
      return `Start ${titleOf(nodes, action.lessonId)}`
    case 'replay':
      return 'Course complete — every lesson mastered.'
  }
}

// Quiet --mark note under the status line (Q23): shown only when an active
// session is being resumed and a *different* lesson separately needs review.
export function reviewNote(
  action: RecommendedAction,
  nodes: DeskNode[],
): string | null {
  if (action.kind !== 'resume') return null
  const other = nodes.find(
    (n) => n.state === 'needsReview' && n.lessonId !== action.lessonId,
  )
  return other ? `Worth another look: ${other.title}.` : null
}

// The sole primary CTA label on a node's detail panel; null = no CTA (locked).
export function nodeCtaLabel(
  node: DeskNode,
  progress: Progress | undefined,
): string | null {
  if (node.state === 'locked') return null
  if (progress?.completionStatus === 'in_progress') return 'Resume'
  if (node.state === 'completed' || node.state === 'needsReview') return 'Review'
  return 'Start'
}

// ── Ergo chapter model (Course Journey) ─────────────────────────────────────

export interface Chapter {
  id: string
  label: string
  /** CSS custom property prefix, e.g. 'ch1' → var(--ch1) / var(--ch1-tint) */
  hueVar: string
  lessonIds: string[]
}

export const ERGO_CHAPTERS: Chapter[] = [
  {
    id: 'foundations',
    label: 'Foundations',
    hueVar: 'ch1',
    lessonIds: ['lesson-first-heads', 'lesson-pattern-hitting-times'],
  },
  {
    id: 'racing-walks',
    label: 'Racing & Walks',
    hueVar: 'ch2',
    lessonIds: ['lesson-penneys-game', 'lesson-gamblers-ruin'],
  },
  {
    id: 'mastery',
    label: 'Mastery',
    hueVar: 'ch3',
    lessonIds: ['lesson-states-streaks', 'lesson-longer-patterns', 'lesson-overlap-shortcut'],
  },
]

export function chapterForLesson(lessonId: string): Chapter | undefined {
  return ERGO_CHAPTERS.find((ch) => ch.lessonIds.includes(lessonId))
}

export type MathVizKind =
  | 'coin'
  | 'stateMachine'
  | 'raceLanes'
  | 'randomWalk'
  | 'twoNode'
  | 'fourNode'
  | 'sum'
  | 'dice'

export const LESSON_VIZ: Record<string, MathVizKind> = {
  'lesson-first-heads': 'coin',
  'lesson-pattern-hitting-times': 'stateMachine',
  'lesson-penneys-game': 'raceLanes',
  'lesson-gamblers-ruin': 'randomWalk',
  'lesson-states-streaks': 'twoNode',
  'lesson-longer-patterns': 'fourNode',
  'lesson-overlap-shortcut': 'sum',
}

export function vizForLesson(lessonId: string): MathVizKind {
  return LESSON_VIZ[lessonId] ?? 'coin'
}
