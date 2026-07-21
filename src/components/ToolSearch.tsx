import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getAllTools, searchTools, type ToolItem } from '../lib/tools'

interface ToolSearchProps {
  open: boolean
  onClose: () => void
}

export default function ToolSearch({ open, onClose }: ToolSearchProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ToolItem[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIdx(0)
      setResults(getAllTools())
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleSearch = useCallback((q: string) => {
    setQuery(q)
    setResults(searchTools(q, t))
    setSelectedIdx(0)
  }, [t])

  const handleSelect = useCallback((tool: ToolItem) => {
    onClose()
    navigate(tool.path)
  }, [navigate, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIdx]) handleSelect(results[selectedIdx])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [results, selectedIdx, handleSelect, onClose])

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIdx])

  if (!open) return null

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
          />
          <kbd className="search-esc">ESC</kbd>
        </div>
        <div className="search-results" ref={listRef}>
          {results.length === 0 ? (
            <div className="search-empty">{t('search.no_results')}</div>
          ) : (
            results.map((tool, i) => (
              <div
                key={tool.path}
                className={`search-item ${i === selectedIdx ? 'active' : ''}`}
                onClick={() => handleSelect(tool)}
                onMouseEnter={() => setSelectedIdx(i)}
              >
                <span className="search-item-icon">{tool.icon}</span>
                <div className="search-item-text">
                  <div className="search-item-name">{t(tool.nameKey)}</div>
                  <div className="search-item-desc">{t(tool.descKey)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
