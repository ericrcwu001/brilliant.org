// Gate hook for ambient "breathing" motion.
//
// Returns `active = true` only when ALL of the following hold:
//   1. Reduced motion is NOT preferred (OS-level prefers-reduced-motion: reduce)
//   2. The browser tab is visible (document.visibilityState === 'visible')
//   3. The element is on-screen (IntersectionObserver; treated as on-screen if unavailable)
//   4. The user is NOT idle (no pointermove/keydown/scroll/pointerdown for idleMs)
//
// Defaults: idleMs = 8000 (8 s of inactivity pauses ambient animations).
// All listeners and observers are cleaned up on unmount.

import { type RefObject, useEffect, useState } from 'react'
import { useReducedMotion } from '../lesson/useReducedMotion'

const DEFAULT_IDLE_MS = 8_000

export function useAmbient(
  ref: RefObject<Element | null>,
  options?: { idleMs?: number },
): boolean {
  const idleMs = options?.idleMs ?? DEFAULT_IDLE_MS
  const reduced = useReducedMotion()

  const [visible, setVisible] = useState(() =>
    typeof document !== 'undefined'
      ? document.visibilityState === 'visible'
      : true,
  )

  const [onScreen, setOnScreen] = useState(() =>
    typeof IntersectionObserver === 'undefined',
  )

  const [idle, setIdle] = useState(false)

  // Tab visibility
  useEffect(() => {
    if (typeof document === 'undefined') return
    const handler = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  // IntersectionObserver — is the element in the viewport?
  // When unavailable (SSR / old browsers), onScreen starts true from useState init.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])

  // Idle detection — reset on any activity, mark idle after timeout
  useEffect(() => {
    if (typeof window === 'undefined') return
    let timer: ReturnType<typeof setTimeout>
    const wake = () => {
      setIdle(false)
      clearTimeout(timer)
      timer = setTimeout(() => setIdle(true), idleMs)
    }
    wake()
    window.addEventListener('pointermove', wake, { passive: true })
    window.addEventListener('pointerdown', wake, { passive: true })
    window.addEventListener('keydown', wake, { passive: true })
    window.addEventListener('scroll', wake, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointermove', wake)
      window.removeEventListener('pointerdown', wake)
      window.removeEventListener('keydown', wake)
      window.removeEventListener('scroll', wake)
    }
  }, [idleMs])

  return !reduced && visible && onScreen && !idle
}
