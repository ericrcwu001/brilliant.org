// View Transition helper — the single gate for all document.startViewTransition
// calls in the app. Centralises the reduced-motion + API-support check so callers
// don't repeat it.
//
// The CSS view-transition-name assignments (in shell.css) are scoped to
// :root[data-vt='<type>'] so they only take effect while a transition is running.
// withViewTransition sets that attribute before startViewTransition is called so
// the browser's "old" snapshot sees it, then cleans it up when the transition
// ends.
//
// Race-condition guard: when a rapid second VT starts before the first's
// animation ends, the first is skipped and its `finished` is settled. A naive
// cleanup (delete on either resolve or reject) races with the second VT's
// startViewTransition call — the delete microtask fires between the second call
// and Chrome's "old" snapshot capture, erasing data-vt too early. The generation
// counter ensures only the most-recently-started VT owns the cleanup.

// ── Concept-open transition contract (Wave-0 freeze) ──────────────────────────
// Wave 2 will implement the actual animation; these names are the stable
// identifiers that Stream B (card) and Stream C (concept header) both reference.

/** view-transition name used when opening a concept from the catalog. */
export const CONCEPT_OPEN_TRANSITION = 'concept-open'

// ─────────────────────────────────────────────────────────────────────────────

let _vtGen = 0

export function withViewTransition(fn: () => void, vtType?: string): void {
  const reduced =
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const supported =
    typeof document !== 'undefined' && 'startViewTransition' in document

  if (reduced || !supported) {
    fn()
    return
  }

  const root = document.documentElement
  const gen = ++_vtGen
  root.dataset.vt = vtType ?? ''

  // The callback is async so we can yield (await Promise.resolve()) after
  // calling fn. This gives React one microtask to commit any scheduled state
  // updates before the browser takes the "new" snapshot.
  const transition = (
    document as Document & {
      startViewTransition: (cb: () => Promise<void>) => { finished: Promise<void> }
    }
  ).startViewTransition(async () => {
    fn()
    await Promise.resolve()
  })

  void transition.finished.then(
    () => { if (_vtGen === gen) delete root.dataset.vt },
    () => { if (_vtGen === gen) delete root.dataset.vt },
  )
}
