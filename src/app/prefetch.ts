// Best-effort warm-up of heavy lazy chunks so navigation is instant. All calls
// are fire-and-forget; a failed prefetch must never surface to the user.
export function prefetchLesson(): void {
  void import('../pages/LessonPage').catch(() => {})
  void import('katex').catch(() => {}) // LessonPlayer lazy-loads katex; warm it too
}
export function prefetchAuth(): void {
  void import('../pages/AuthPage').catch(() => {})
}
