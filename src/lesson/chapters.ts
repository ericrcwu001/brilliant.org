// Lesson → chapter mapping (Ergo). Single source for the chapter accent used by
// the lesson shell (`data-ch` on `.lesson` → `--accent`/`--accent-tint`), the
// beats (DOM via the CSS cascade), and the Konva visualizations (which can't read
// CSS vars, so they take the resolved hex from `chapterColor`).
//
// Chapters: Ch1 Foundations (indigo), Ch2 Racing & Walks (teal), Ch3 Mastery
// (coral), Ch4 Roadmap (amber). Mirrors ERGO_CHAPTERS in pages/studyDesk.model.ts
// and the lesson→chapter table in docs/ergo-lesson-restyle-brief.md.

export type ChapterHue = 'ch1' | 'ch2' | 'ch3' | 'ch4'

const LESSON_CHAPTER: Record<string, ChapterHue> = {
  'lesson-first-heads': 'ch1',
  'lesson-pattern-hitting-times': 'ch1',
  'lesson-penneys-game': 'ch2',
  'lesson-gamblers-ruin': 'ch2',
  'lesson-states-streaks': 'ch3',
  'lesson-longer-patterns': 'ch3',
  'lesson-overlap-shortcut': 'ch3',
}

// Resolved hex per chapter — keep in sync with the --chN tokens in
// style-dictionary/tokens/color.json (Konva needs literal colors).
const CHAPTER_HEX: Record<ChapterHue, string> = {
  ch1: '#4F46E5',
  ch2: '#0D9488',
  ch3: '#F0584A',
  ch4: '#E0982E',
}

/** The chapter hue token name for a lesson (defaults to ch1 / brand indigo). */
export function chapterOf(lessonId: string): ChapterHue {
  return LESSON_CHAPTER[lessonId] ?? 'ch1'
}

/** CSS custom-property name (without `--`) for the lesson's chapter hue. */
export function chapterHueVar(lessonId: string): ChapterHue {
  return chapterOf(lessonId)
}

/** Resolved hex for the lesson's chapter hue — for Konva (no CSS-var access). */
export function chapterColor(lessonId: string): string {
  return CHAPTER_HEX[chapterOf(lessonId)]
}
