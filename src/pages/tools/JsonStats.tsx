import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { analyzeJSON, formatFileSize, type JsonStats } from '../../lib/jsonStats'

const defaultStats: JsonStats = {
  totalKeys: 0, maxDepth: 0, objectCount: 0, arrayCount: 0,
  arrayItemCount: 0, stringCount: 0, numberCount: 0, integerCount: 0,
  booleanCount: 0, nullCount: 0, fileSizeBytes: 0, typeSummary: {},
}

export default function JsonStats() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [stats, setStats] = useState<JsonStats>(defaultStats)
  const [analyzed, setAnalyzed] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = useCallback((type: 'success' | 'error' | 'info', msg: string) => {
    setToast({ type, msg })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const doAnalyze = useCallback((text: string) => {
    if (!text.trim()) {
      showToast('info', t('toast.input.empty'))
      return
    }
    try {
      const parsed = JSON.parse(text.trim())
      const fileBytes = new Blob([text.trim()]).size
      const result = analyzeJSON(parsed, fileBytes)
      setStats(result)
      setAnalyzed(true)
      setError('')
      showToast('success', 'Analysis complete!')
    } catch {
      setError(t('toast.invalid'))
      showToast('error', t('toast.invalid'))
    }
  }, [showToast, t])

  const handleAnalyze = useCallback(() => doAnalyze(input), [input, doAnalyze])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
      showToast('info', t('toast.pasted'))
    } catch { showToast('error', t('toast.paste_failed')) }
  }, [showToast, t])

  const handleClear = useCallback(() => {
    setInput('')
    setStats(defaultStats)
    setAnalyzed(false)
    setError('')
  }, [])

  const readFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setInput(text)
      showToast('success', t('toast.file.loaded').replace('{{file}}', file.name))
    }
    reader.readAsText(file)
  }, [showToast, t])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0])
  }, [readFile])

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { readFile(e.target.files[0]); e.target.value = '' }
  }, [readFile])

  const bar = (label: string, value: number, max?: number) => {
    const m = max ?? Math.max(value, 1)
    const pct = Math.min((value / m) * 100, 100)
    return (
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
          <span>{label}</span>
          <strong>{value.toLocaleString()}</strong>
        </div>
        <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.3s' }} />
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="JSON Statistics Analyzer Online — Analyze JSON Structure & Size"
        description="Free online JSON statistics analyzer. Analyze JSON data: total keys, depth, array count, object count, file size, type summary. 100% client-side, your data stays private. Try now!"
        canonicalPath="/json-stats"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← {t('nav.back_home')}</Link>

      <section className="tool-header">
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-heading)' }}>{t('stats.title')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{t('stats.subtitle')}</p>
      </section>

      {toast && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, padding: '12px 24px', borderRadius: '8px', fontSize: '14px',
          background: toast.type === 'success' ? 'var(--success-bg)' : toast.type === 'error' ? 'var(--danger-bg)' : 'var(--info-bg)',
          color: toast.type === 'success' ? 'var(--success-text)' : toast.type === 'error' ? 'var(--danger-text)' : 'var(--info-text)',
          border: `1px solid ${toast.type === 'success' ? 'var(--success-border)' : toast.type === 'error' ? 'var(--danger-border)' : 'var(--info-border)}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {toast.msg}
        </div>
      )}

      <div className="tool-layout">
        <div className="tool-panel" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
          <div className="tool-panel-header">
            <span className="tool-panel-label">{t('stats.input')}</span>
          </div>
          <textarea
            className="tool-textarea"
            value={input}
            onChange={e => { setInput(e.target.value); setAnalyzed(false) }}
            placeholder={t('stats.placeholder')}
            spellCheck={false}
            style={{ minHeight: '200px' }}
          />
        </div>

        <div className="tool-actions">
          <button className="btn btn-primary" onClick={handlePaste}>📋 {t('action.paste')}</button>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>📁 {t('action.upload_file')}</button>
          <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileSelect} style={{ display: 'none' }} />
          <button className="btn btn-accent" onClick={handleAnalyze}>📊 {t('stats.analyze_btn')}</button>
          <button className="btn" onClick={handleClear}>🗑️ {t('action.clear')}</button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--danger-bg)', borderRadius: '8px', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}>
          {error}
        </div>
      )}

      {analyzed && !error && (
        <section style={{ marginTop: '48px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>{t('stats.results')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            <div className="info-card">
              <h4 style={{ marginBottom: '12px' }}>{t('stats.general')}</h4>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <p><strong>{t('stats.file_size')}:</strong> {formatFileSize(stats.fileSizeBytes)}</p>
                <p><strong>{t('stats.max_depth')}:</strong> {stats.maxDepth}</p>
              </div>
            </div>
            <div className="info-card">
              <h4 style={{ marginBottom: '12px' }}>{t('stats.counts')}</h4>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <p><strong>{t('stats.total_keys')}:</strong> {stats.totalKeys.toLocaleString()}</p>
                <p><strong>{t('stats.objects')}:</strong> {stats.objectCount.toLocaleString()}</p>
                <p><strong>{t('stats.arrays')}:</strong> {stats.arrayCount.toLocaleString()}</p>
                <p><strong>{t('stats.array_items')}:</strong> {stats.arrayItemCount.toLocaleString()}</p>
              </div>
            </div>
            <div className="info-card">
              <h4 style={{ marginBottom: '12px' }}>{t('stats.values')}</h4>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <p><strong>{t('stats.strings')}:</strong> {stats.stringCount.toLocaleString()}</p>
                <p><strong>{t('stats.numbers')}:</strong> {stats.numberCount.toLocaleString()}</p>
                <p><strong>{t('stats.booleans')}:</strong> {stats.booleanCount.toLocaleString()}</p>
                <p><strong>{t('stats.nulls')}:</strong> {stats.nullCount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="info-card" style={{ marginTop: '16px' }}>
            <h4 style={{ marginBottom: '12px' }}>{t('stats.type_distribution')}</h4>
            {(() => {
              const entries = Object.entries(stats.typeSummary)
              const maxVal = Math.max(...entries.map(([, v]) => v), 1)
              return entries.map(([k, v]) => bar(k, v, maxVal))
            })()}
          </div>
        </section>
      )}
    </>
  )
}
