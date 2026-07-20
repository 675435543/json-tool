import { useEffect } from 'react'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  meta?: boolean
  handler: () => void
  // If true, prevent default browser behavior
  preventDefault?: boolean
}

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        const ctrlOrMeta = s.ctrl || s.meta
        const matchesCtrl = ctrlOrMeta ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey
        const matchesShift = s.shift ? e.shiftKey : !e.shiftKey
        const matchesKey = e.key.toLowerCase() === s.key.toLowerCase()

        if (matchesKey && matchesCtrl && matchesShift) {
          if (s.preventDefault !== false) {
            e.preventDefault()
          }
          s.handler()
          return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}
