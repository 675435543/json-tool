/**
 * Large file handling hook for JSON tools.
 * Detects file size, shows warnings, and processes large files
 * without blocking the UI.
 */

import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react'

export interface LargeFileState {
  loading: boolean
  progress: number | null  // 0-100 or null for indeterminate
  warning: string | null
  error: string | null
}

export interface FileHandlerCallbacks {
  onContent: (text: string) => void
  onWarning?: (msg: string) => void
  onError?: (msg: string) => void
  onProgress?: (pct: number) => void
}

const WARN_SIZE = 5 * 1024 * 1024    // 5MB - show warning
const CHUNK_SIZE = 2 * 1024 * 1024   // 2MB chunks

/**
 * Hook for handling large JSON file uploads.
 * Returns drag/drop handlers and file state.
 */
export function useLargeFileHandler(callbacks: FileHandlerCallbacks) {
  const [state, setState] = useState<LargeFileState>({
    loading: false,
    progress: null,
    warning: null,
    error: null,
  })

  const readFileRef = useRef<FileReader | null>(null)
  const abortedRef = useRef(false)

  const readFile = useCallback((file: File) => {
    const size = file.size
    abortedRef.current = false

    // Cancel previous read
    if (readFileRef.current) {
      readFileRef.current.abort()
    }

    // Show warning for large files
    if (size > WARN_SIZE) {
      const mb = (size / (1024 * 1024)).toFixed(1)
      setState(prev => ({
        ...prev,
        warning: `File is ${mb}MB. Processing in browser — may be slow on older devices.`,
      }))
      if (callbacks.onWarning) {
        callbacks.onWarning(`File is ${mb}MB. Processing locally — your data stays private.`)
      }
    } else {
      setState(prev => ({ ...prev, warning: null }))
    }

    // For very large files, use chunked reading
    if (size > CHUNK_SIZE * 2) {
      // Show indeterminate progress
      setState(s => ({ ...s, loading: true, progress: null }))

      // Stream read via Blob.text() (async, non-blocking)
      const reader = new FileReader()
      readFileRef.current = reader

      reader.onprogress = (e) => {
        if (e.lengthComputable && !abortedRef.current) {
          const pct = Math.round((e.loaded / e.total) * 100)
          setState(s => ({ ...s, progress: pct }))
          callbacks.onProgress?.(pct)
        }
      }

      reader.onload = (e) => {
        if (!abortedRef.current) {
          const text = e.target?.result as string
          callbacks.onContent(text)
          setState(s => ({ ...s, loading: false, progress: 100 }))
        }
      }

      reader.onerror = () => {
        if (!abortedRef.current) {
          setState(s => ({ ...s, loading: false, progress: null, error: 'Failed to read file' }))
          callbacks.onError?.('Failed to read file')
        }
      }

      reader.readAsText(file)
    } else {
      // Small file — read directly
      const reader = new FileReader()
      readFileRef.current = reader

      reader.onload = (e) => {
        if (!abortedRef.current) {
          const text = e.target?.result as string
          callbacks.onContent(text)
          setState(s => ({ ...s, loading: false, progress: null }))
        }
      }

      reader.onerror = () => {
        setState(s => ({ ...s, error: 'Failed to read file' }))
      }

      reader.readAsText(file)
    }
  }, [callbacks])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      callbacks.onError?.('Only .json files are supported')
      return
    }
    readFile(file)
  }, [readFile, callbacks])

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      readFile(file)
    }
  }, [readFile])

  const cancelRead = useCallback(() => {
    abortedRef.current = true
    if (readFileRef.current) {
      readFileRef.current.abort()
    }
    setState({ loading: false, progress: null, warning: null, error: null })
  }, [])

  return {
    state,
    handleDrop,
    handleFileSelect,
    handleDragOver: useCallback((e: DragEvent) => e.preventDefault(), []),
    cancelRead,
  }
}

export function formatLargeFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}
