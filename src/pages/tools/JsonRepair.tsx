import { useState, useCallback, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { repairJSON } from '../../lib/jsonRepair'

export default function JsonRepair() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null)
  const [linesBefore, setLinesBefore] = useState(0)
  const [linesAfter, setLinesAfter] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = useCallback((type: 'success' | 'error' | 'info', msg: string) => {
    setToast({ type, msg })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const handleRepair = useCallback(() => {
    if (!input.trim()) {
      showToast('info', t('toast.paste_first'))
      return
    }
    try {
      const repaired = repairJSON(input.trim())
      // Try to parse to verify it's valid
      try {
        JSON.parse(repaired)
        setOutput(JSON.stringify(JSON.parse(repaired), null, 2))
        setLinesAfter(output.split('\n').length)
        setError('')
        showToast('success', t('toast.repaired'))
      } catch {
        // If still invalid, show the best-effort repair
        setOutput(repaired)
        setLinesAfter(repaired.split('\n').length)
        setLinesBefore(input.trim().split('\n').length)
        setError(t('toast.partial_repair'))
        showToast('info', t('toast.partial_repair'))
      }
    } catch {
      showToast('error', t('toast.repair_failed'))
    }
  }, [input, showToast, t])

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      showToast('success', t('toast.copied'))
    } catch {
      showToast('error', t('toast.copy_failed'))
    }
  }, [output, showToast, t])

  const handleDownload = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'repaired.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [output])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
      setLinesBefore(text.trim().split('\n').length)
      showToast('info', t('toast.pasted'))
    } catch {
      showToast('error', t('toast.paste_failed'))
    }
  }, [showToast, t])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError('')
    setLinesBefore(0)
    setLinesAfter(0)
    if (textareaRef.current) textareaRef.current.focus()
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

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
        setLinesBefore(text.trim().split('\n').length)
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
        setLinesBefore(text.trim().split('\n').length)
        showToast('success', t('toast.file_loaded'))
      }
      reader.readAsText(file)
    }
  }, [showToast, t])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    setLinesBefore(e.target.value.trim().split('\n').length)
  }, [])

  return (
    <>
      <SEO
        title="JSON Repair Tool Online — Fix Invalid JSON Automatically"
        description="Free online JSON repair tool. Fix common JSON errors: single quotes, trailing commas, unquoted keys, missing brackets, and more. 100% client-side, your data stays private. Try now!"
        canonicalPath="/json-repair"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← {t('nav.back_home')}</Link>

      <section className="tool-header">
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-heading)' }}>{t('repair.title')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{t('repair.subtitle')}</p>
      </section>

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

      <div className="tool-layout">
        <div className="tool-panel" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          style={{ borderColor: dragOver ? 'var(--accent)' : undefined, background: dragOver ? 'var(--bg-tertiary)' : undefined }}>
          <div className="tool-panel-header">
            <span className="tool-panel-label">{t('repair.broken_json')}</span>
            <span className="tool-panel-info">{linesBefore > 0 ? `${linesBefore} lines` : ''}</span>
          </div>
          <textarea
            ref={textareaRef}
            className="tool-textarea"
            value={input}
            onChange={handleInputChange}
            placeholder={t('repair.placeholder')}
            spellCheck={false}
          />
        </div>

        <div className="tool-actions">
          <button className="btn btn-primary" onClick={handlePaste} title={t('action.paste')}>📋 {t('action.paste')}</button>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} title={t('action.upload_file')}>📁 {t('action.upload_file')}</button>
          <input ref={fileInputRef} type="file" accept=".json,.txt" onChange={handleFileSelect} style={{ display: 'none' }} />
          <button className="btn btn-accent" onClick={handleRepair}>🔧 {t('repair.repair_btn')}</button>
          <button className="btn" onClick={handleClear}>🗑️ {t('action.clear')}</button>
        </div>

        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{t('repair.fixed_json')}</span>
            <span className="tool-panel-info">{linesAfter > 0 ? `${linesAfter} lines` : ''}</span>
          </div>
          <textarea
            className="tool-textarea tool-output"
            value={output}
            readOnly
            placeholder={t('repair.result_placeholder')}
            spellCheck={false}
            style={{ color: error ? 'var(--warning-text)' : 'var(--success-text)' }}
          />
          {output && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={handleCopy}>📋 {t('action.copy')}</button>
              <button className="btn btn-outline" onClick={handleDownload}>⬇️ {t('action.download')}</button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--warning-bg)', borderRadius: '8px', border: '1px solid var(--warning-border)', color: 'var(--warning-text)', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <section className="tool-info" style={{ marginTop: '48px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>{t('repair.info_title')}</h3>
        <div className="tool-info-grid">
          <div className="info-card">
            <h4>{t('repair.fix_quotes')}</h4>
            <p style={{ fontSize: '13px' }}>{t('repair.fix_quotes_desc')}</p>
          </div>
          <div className="info-card">
            <h4>{t('repair.fix_trailing')}</h4>
            <p style={{ fontSize: '13px' }}>{t('repair.fix_trailing_desc')}</p>
          </div>
          <div className="info-card">
            <h4>{t('repair.fix_keys')}</h4>
            <p style={{ fontSize: '13px' }}>{t('repair.fix_keys_desc')}</p>
          </div>
          <div className="info-card">
            <h4>{t('repair.fix_comments')}</h4>
            <p style={{ fontSize: '13px' }}>{t('repair.fix_comments_desc')}</p>
          </div>
          <div className="info-card">
            <h4>{t('repair.fix_bool')}</h4>
            <p style={{ fontSize: '13px' }}>{t('repair.fix_bool_desc')}</p>
          </div>
          <div className="info-card">
            <h4>{t('repair.fix_brackets')}</h4>
            <p style={{ fontSize: '13px' }}>{t('repair.fix_brackets_desc')}</p>
          </div>
        </div>
      </section>
    </>
  )
}
