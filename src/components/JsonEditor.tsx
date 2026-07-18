import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import TreeView from '../TreeView'

interface JsonEditorProps {
  input: string
  output: string
  errorInfo?: string
  generatedLang?: string
  onInputChange?: (val: string) => void
  onCopy?: () => void
  onSwap?: () => void
  showUpload?: boolean
  showStats?: boolean
  inputPlaceholder?: string
  outputPlaceholder?: string
  inputLabel?: string
  outputLabel?: string
}

export default function JsonEditor({
  input,
  output,
  errorInfo = '',
  generatedLang,
  onInputChange,
  onCopy,
  onSwap,
  showUpload = true,
  showStats = true,
  inputPlaceholder,
  outputPlaceholder,
  inputLabel,
  outputLabel,
}: JsonEditorProps) {
  const { t } = useTranslation()
  const [dragOver, setDragOver] = useState(false)
  const [viewMode, setViewMode] = useState<'text' | 'tree'>('text')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const readFile = useCallback((file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      onInputChange?.(text)
    }
    reader.readAsText(file)
  }, [onInputChange])

  const handleDragOver = useCallback((e: DragEvent) => { e.preventDefault(); setDragOver(true) }, [])
  const handleDragLeave = useCallback((e: DragEvent) => { e.preventDefault(); setDragOver(false) }, [])
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault(); setDragOver(false)
    if (e.dataTransfer.files.length > 0) readFile(e.dataTransfer.files[0])
  }, [readFile])

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) readFile(e.target.files[0])
    e.target.value = ''
  }, [readFile])

  const toggleViewMode = useCallback(() => {
    if (viewMode === 'text') {
      const trimmed = output.trim()
      if (!trimmed) return
      try {
        JSON.parse(trimmed)
        setViewMode('tree')
      } catch { /* not valid JSON for tree view */ }
    } else {
      setViewMode('text')
    }
  }, [viewMode, output])

  const charCount = input.length
  const lineCount = input ? input.split('\n').length : 0

  return (
    <>
      {showUpload && (
        <div
          className={`upload-zone ${dragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="file-icon">📂</div>
          <p>{dragOver ? t('upload.dragover') : t('upload.title')}</p>
          <input ref={fileInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleFileSelect} />
        </div>
      )}

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header">
            <span>{inputLabel || t('panel.input')}</span>
            <span className="action-link" onClick={() => textareaRef.current?.focus()}>
              {inputLabel || t('panel.input')}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => onInputChange?.(e.target.value)}
            placeholder={inputPlaceholder || t('textarea.placeholder')}
            spellCheck={false}
          />
        </div>
        <div className="editor-panel">
          <div className="panel-header">
            <span>{outputLabel || t('panel.output')}</span>
            <div className="panel-header-right">
              {generatedLang && <span className="lang-tag">{generatedLang}</span>}
              {output && (() => {
                try { JSON.parse(output.trim()); return true } catch { return false }
              })() && (
                <span className={`view-toggle ${viewMode === 'tree' ? 'active' : ''}`} onClick={toggleViewMode}>
                  {viewMode === 'text' ? '🌳 Tree' : '📄 Text'}
                </span>
              )}
              {onCopy && <span className="action-link" onClick={onCopy}>{t('btn.copy')}</span>}
              {onSwap && output && <span className="action-link" onClick={onSwap}>{t('btn.swap')}</span>}
            </div>
          </div>
          <div className="output-area">
            {output ? (
              viewMode === 'tree' ? (
                <TreeView data={(() => { try { return JSON.parse(output.trim()) } catch { return null } })()} />
              ) : (
                <pre className="output-text">{output}</pre>
              )
            ) : (
              <span className="output-hint">{outputPlaceholder || t('textarea.output_hint')}</span>
            )}
          </div>
          {errorInfo && <div className="error-lines show">{errorInfo}</div>}
        </div>
      </div>

      {showStats && (
        <div className="stats-bar">
          <span>📊 {t('stats.chars')}: {charCount}</span>
          <span>📝 {t('stats.lines')}: {lineCount}</span>
          <span>⚡ {t('stats.pure_frontend')}</span>
        </div>
      )}
    </>
  )
}
