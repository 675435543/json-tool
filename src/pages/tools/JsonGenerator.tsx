import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { generateMockData } from '../../lib/mockGenerator'

export default function JsonGenerator() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [count, setCount] = useState(5)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const showToast = useCallback((type: 'success' | 'error' | 'info', msg: string) => {
    setToast({ type, msg })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const loadExample = useCallback(() => {
    setInput(JSON.stringify({
      id: 1,
      name: "Alice Smith",
      email: "alice@example.com",
      age: 28,
      active: true,
      score: 85.5,
      address: { city: "Beijing", zip: "100001" },
      tags: ["alpha", "beta"]
    }, null, 2))
  }, [])

  const handleGenerate = useCallback(() => {
    if (!input.trim()) {
      showToast('info', t('gen.toast_paste'))
      return
    }
    try {
      const parsed = JSON.parse(input.trim())
      const generated = generateMockData(parsed, count)
      setResult(JSON.stringify(generated, null, 2))
      setError('')
      setActiveTab('preview')
      showToast('success', t('gen.toast_generated'))
    } catch {
      setError(t('gen.error_parse'))
      showToast('error', t('gen.error_parse'))
    }
  }, [input, count, showToast, t])

  const handleCopy = useCallback(async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      showToast('success', t('toast.copied'))
    } catch {
      showToast('error', t('toast.copy_failed'))
    }
  }, [result, showToast, t])

  const handleDownload = useCallback(() => {
    if (!result) return
    const blob = new Blob([result], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mock-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [result])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
      showToast('info', t('toast.pasted'))
    } catch {
      showToast('error', t('toast.paste_failed'))
    }
  }, [showToast, t])

  const handleClear = useCallback(() => {
    setInput('')
    setResult('')
    setError('')
    setActiveTab('editor')
  }, [])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    setActiveTab('editor')
  }, [])

  // Drag and drop
  const handleDragOver = useCallback((e: DragEvent) => { e.preventDefault(); setDragOver(true) }, [])
  const handleDragLeave = useCallback(() => setDragOver(false), [])
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'application/json' || file.name.endsWith('.json') || file.name.endsWith('.txt'))) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        setInput(text)
        showToast('success', t('toast.file_loaded'))
      }
      reader.readAsText(file)
    } else {
      showToast('error', t('toast.file_type_error'))
    }
  }, [showToast, t])

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        setInput(text)
        showToast('success', t('toast.file_loaded'))
      }
      reader.readAsText(file)
    }
  }, [showToast, t])

  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <SEO
        title="JSON Mock Data Generator - Generate Sample JSON from Template"
        description="Free JSON mock data generator: paste a JSON template and generate realistic sample data. Auto-infers types and creates random values for testing and development."
        keywords="JSON generator, mock JSON, sample JSON data, JSON mock data generator, fake JSON generator, test data generator, JSON template generator"
        canonicalPath="/json-generator"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      {toast && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
          padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
          background: toast.type === 'success' ? 'var(--success-bg)' : toast.type === 'error' ? 'var(--danger-bg)' : 'var(--info-bg)',
          color: toast.type === 'success' ? 'var(--success-text)' : toast.type === 'error' ? 'var(--danger-text)' : 'var(--info-text)',
          border: `1px solid ${toast.type === 'success' ? 'var(--success-border)' : toast.type === 'error' ? 'var(--danger-border)' : 'var(--info-border)'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toast.msg}
        </div>
      )}

      <section className="tool-header">
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-heading)' }}>{t('gen.title')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{t('gen.subtitle')}</p>
      </section>

      <div className="gen-controls">
        <div className="gen-count-wrap">
          <label className="gen-label">{t('gen.count')}</label>
          <input className="gen-input" type="number" min="1" max="1000" value={count}
            onChange={e => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))} />
        </div>
        <div className="gen-actions">
          <button className="btn btn-primary" onClick={handlePaste}>📋 {t('action.paste')}</button>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>📁 {t('action.upload_file')}</button>
          <input ref={fileInputRef} type="file" accept=".json,.txt" onChange={handleFileSelect} style={{ display: 'none' }} />
          <button className="btn btn-outline" onClick={loadExample}>📝 {t('gen.example')}</button>
          <button className="btn btn-accent" onClick={handleGenerate}>⚡ {t('gen.generate')}</button>
          <button className="btn" onClick={handleClear}>🗑️ {t('action.clear')}</button>
        </div>
      </div>

      <div className="gen-tabs">
        <button
          className={`gen-tab ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >📝 {t('gen.tab_schema')}</button>
        <button
          className={`gen-tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
          disabled={!result}
        >🔍 {t('gen.tab_preview')}</button>
      </div>

      {activeTab === 'editor' ? (
        <div
          className="tool-panel"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ borderColor: dragOver ? 'var(--accent)' : undefined, background: dragOver ? 'var(--bg-tertiary)' : undefined }}
        >
          <div className="tool-panel-header">
            <span>{t('gen.schema_label')}</span>
          </div>
          <textarea
            ref={textareaRef}
            className="tool-textarea"
            value={input}
            onChange={handleInputChange}
            placeholder={t('gen.placeholder')}
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="tool-panel">
          <div className="tool-panel-header">
            <span>{t('gen.result_label')}</span>
            <span className="tool-panel-info">
              {result ? `${result.split('\n').length} lines` : ''}
            </span>
          </div>
          <textarea
            className="tool-textarea tool-output"
            value={result}
            readOnly
            placeholder={t('gen.result_placeholder')}
            spellCheck={false}
            style={{ color: error ? 'var(--warning-text)' : 'var(--success-text)' }}
          />
          {result && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={handleCopy}>📋 {t('action.copy')}</button>
              <button className="btn btn-outline" onClick={handleDownload}>⬇️ {t('action.download')}</button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--warning-bg)', borderRadius: '8px', border: '1px solid var(--warning-border)', color: 'var(--warning-text)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Usage Guide */}
      <section style={{ marginTop: '48px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>{t('gen.info_title')}</h3>
        <div className="tool-info-grid">
          <div className="info-card">
            <h4>{t('gen.how_it_works')}</h4>
            <p style={{ fontSize: '13px', lineHeight: '1.7' }}>{t('gen.how_it_works_desc')}</p>
          </div>
          <div className="info-card">
            <h4>{t('gen.feature_type')}</h4>
            <p style={{ fontSize: '13px', lineHeight: '1.7' }}>{t('gen.feature_type_desc')}</p>
          </div>
          <div className="info-card">
            <h4>{t('gen.feature_array')}</h4>
            <p style={{ fontSize: '13px', lineHeight: '1.7' }}>{t('gen.feature_array_desc')}</p>
          </div>
          <div className="info-card">
            <h4>{t('gen.feature_nested')}</h4>
            <p style={{ fontSize: '13px', lineHeight: '1.7' }}>{t('gen.feature_nested_desc')}</p>
          </div>
        </div>
      </section>
    </>
  )
}
