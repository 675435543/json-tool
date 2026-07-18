import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import TreeView from '../../TreeView'

export default function JsonViewer() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<any>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleView = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return
    try {
      const data = JSON.parse(trimmed)
      setParsed(data)
      setError('')
    } catch (e: any) {
      setParsed(null)
      setError((e as Error).message)
    }
  }, [input])

  const readFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setInput(text)
      try {
        const data = JSON.parse(text)
        setParsed(data)
        setError('')
      } catch (err: any) {
        setParsed(null)
        setError((err as Error).message)
      }
    }
    reader.readAsText(file)
  }, [])

  return (
    <>
      <SEO
        title="JSON Viewer Online - Explore & Navigate JSON Data Visually"
        description="Free online JSON viewer: explore and navigate complex JSON data with an interactive tree view. Expand/collapse nested objects and arrays. Perfect for inspecting large JSON files."
        keywords="JSON viewer, JSON tree viewer, view JSON online, JSON explorer, JSON data viewer, interactive JSON tree"
        canonicalPath="/json-viewer"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      <div className={`upload-zone ${dragOver ? 'dragover' : ''}`} onDragOver={(e: DragEvent) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)} onDrop={(e: DragEvent) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]) }}
        onClick={() => fileInputRef.current?.click()}>
        <div className="file-icon">📂</div>
        <p>{dragOver ? t('upload.dragover') : t('upload.title')}</p>
        <input ref={fileInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={(e: ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) { readFile(e.target.files[0]); e.target.value = '' } }} />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button className="btn btn-primary" onClick={handleView}>🌳 View JSON</button>
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>{t('panel.input')} (JSON)</span></div>
          <textarea value={input} onChange={e => { setInput(e.target.value); setParsed(null); setError('') }} placeholder={t('textarea.placeholder')} spellCheck={false} />
          {error && <div className="error-lines show">{error}</div>}
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>Tree View</span></div>
          <div className="output-area">
            {parsed ? <TreeView data={parsed} /> : <span className="output-hint">Paste JSON and click View JSON to explore the data structure</span>}
          </div>
        </div>
      </div>

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>Why Use a JSON Viewer?</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>🌳 <strong>Explore nested data</strong> — Expand and collapse objects and arrays to drill into specific sections</p>
          <p>🌳 <strong>Type highlighting</strong> — Keys in purple, strings in green, numbers in cyan, booleans in yellow</p>
          <p>🌳 <strong>Large files</strong> — Much easier to navigate a 1000-line JSON file with a collapsible tree than scrolling through raw text</p>
          <p>🌳 <strong>No scrolling</strong> — Find what you need without losing context of where you are in the structure</p>
          <p style={{ marginTop: '8px' }}>Need to edit JSON instead? Try our <Link to="/json-formatter" style={{ color: 'var(--text-link)' }}>JSON Formatter →</Link></p>
        </div>
      </section>
    </>
  )
}
