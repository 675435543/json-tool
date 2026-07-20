import { useState, useCallback, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { generateSchema } from '../../lib/jsonSchemaGenerator'

export default function JsonSchemaGenerator() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [rootName, setRootName] = useState('Root')
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = useCallback((type: 'success' | 'error' | 'info', msg: string) => {
    setToast({ type, msg })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const handleGenerate = useCallback(() => {
    if (!input.trim()) {
      showToast('info', t('toast.input.empty'))
      return
    }
    try {
      const parsed = JSON.parse(input.trim())
      const schema = generateSchema(parsed, rootName.trim() || 'Root')
      setOutput(JSON.stringify(schema, null, 2))
      showToast('success', t('schema.gen_success'))
    } catch {
      showToast('error', t('toast.invalid'))
    }
  }, [input, rootName, showToast, t])

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      showToast('success', t('toast.copied'))
    } catch {
      showToast('error', t('toast.copy_fail'))
    }
  }, [output, showToast, t])

  const handleDownload = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/schema+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'schema.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [output])

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
    setOutput('')
    if (textareaRef.current) textareaRef.current.focus()
  }, [])

  const handleSample = useCallback(() => {
    const sample = JSON.stringify({
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
      isActive: true,
      address: {
        street: '123 Main St',
        city: 'Beijing',
        country: 'China',
      },
      tags: ['developer', 'backend'],
      createdAt: '2026-01-15T08:30:00Z',
    }, null, 2)
    setInput(sample)
    showToast('info', 'Sample JSON loaded')
  }, [showToast])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleDragOver = useCallback((e: DragEvent) => { e.preventDefault(); setDragOver(true) }, [])
  const handleDragLeave = useCallback(() => setDragOver(false), [])
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/json') {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setInput(ev.target?.result as string)
        showToast('success', 'File loaded')
      }
      reader.readAsText(file)
    }
  }, [showToast])
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setInput(ev.target?.result as string)
      reader.readAsText(file)
    }
  }, [])

  return (
    <>
      <SEO
        title="JSON Schema Generator Online — Generate Schema from JSON Data"
        description="Free online JSON Schema generator. Automatically create JSON Schema (draft-07) from your JSON data. Supports nested objects, arrays, and type inference. 100% client-side, private. Try now!"
        canonicalPath="/json-schema-generator"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← {t('nav.back_home')}</Link>

      <section className="tool-header">
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-heading)' }}>{t('schema.title')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{t('schema.subtitle')}</p>
      </section>

      {toast && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
          padding: '12px 24px', borderRadius: '8px', fontSize: '14px',
          background: toast.type === 'success' ? 'var(--success-bg)' : toast.type === 'error' ? 'var(--danger-bg)' : 'var(--info-bg)',
          color: toast.type === 'success' ? 'var(--success-text)' : toast.type === 'error' ? 'var(--danger-text)' : 'var(--info-text)',
          border: `1px solid ${toast.type === 'success' ? 'var(--success-border)' : toast.type === 'error' ? 'var(--danger-border)' : 'var(--info-border)'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toast.msg}
        </div>
      )}

      <div className="tool-controls" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {t('schema.root_name')}:
        </label>
        <input
          type="text"
          value={rootName}
          onChange={e => setRootName(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)',
            background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', width: '150px'
          }}
          placeholder="Root"
        />
      </div>

      <div className="tool-layout">
        <div className="tool-panel" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          style={{ borderColor: dragOver ? 'var(--accent)' : undefined }}>
          <div className="tool-panel-header">
            <span className="tool-panel-label">{t('schema.input')}</span>
          </div>
          <textarea
            ref={textareaRef}
            className="tool-textarea"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('schema.placeholder')}
            spellCheck={false}
          />
        </div>

        <div className="tool-actions">
          <button className="btn btn-primary" onClick={handlePaste}>📋 {t('action.paste')}</button>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>📁 {t('action.upload_file')}</button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} style={{ display: 'none' }} />
          <button className="btn" onClick={handleSample}>📝 Sample</button>
          <button className="btn btn-accent" onClick={handleGenerate}>⚡ {t('schema.generate_btn')}</button>
          <button className="btn" onClick={handleClear}>🗑️ {t('action.clear')}</button>
        </div>

        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{t('schema.output')}</span>
          </div>
          <textarea
            className="tool-textarea tool-output"
            value={output}
            readOnly
            placeholder={t('schema.output_placeholder')}
            spellCheck={false}
            style={{ color: 'var(--success-text)' }}
          />
          {output && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={handleCopy}>📋 {t('action.copy')}</button>
              <button className="btn btn-outline" onClick={handleDownload}>⬇️ {t('action.download')}</button>
            </div>
          )}
        </div>
      </div>

      <section className="tool-info" style={{ marginTop: '48px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>{t('schema.info_title')}</h3>
        <div className="tool-info-grid">
          <div className="info-card">
            <h4>{t('schema.feature_types')}</h4>
            <p style={{ fontSize: '13px' }}>{t('schema.feature_types_desc')}</p>
          </div>
          <div className="info-card">
            <h4>{t('schema.feature_nested')}</h4>
            <p style={{ fontSize: '13px' }}>{t('schema.feature_nested_desc')}</p>
          </div>
          <div className="info-card">
            <h4>{t('schema.feature_formats')}</h4>
            <p style={{ fontSize: '13px' }}>{t('schema.feature_formats_desc')}</p>
          </div>
        </div>
      </section>
    </>
  )
}
