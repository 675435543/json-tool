import { useState, useCallback, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { codegenLanguages, sqlDialects, type CodegenEntry } from '../../codegen'

export default function JsonCodeGen() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [selectedLang, setSelectedLang] = useState('python')
  const [isSql, setIsSql] = useState(false)
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
      if (typeof parsed !== 'object' || parsed === null) {
        showToast('error', t('toast.codegen_fail'))
        return
      }
      const langs = isSql ? sqlDialects : codegenLanguages
      const entry = langs.find(l => l.id === selectedLang)
      if (!entry) {
        showToast('error', t('toast.codegen_fail'))
        return
      }
      const result = entry.generate(parsed)
      setOutput(result)
      showToast('success', t('toast.codegen_success'))
    } catch {
      showToast('error', t('toast.codegen_fail'))
    }
  }, [input, selectedLang, isSql, showToast, t])

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
    const extMap: Record<string, string> = {
      python: 'py', go: 'go', csharp: 'cs', rust: 'rs', kotlin: 'kt',
      php: 'php', ruby: 'rb', swift: 'swift', scala: 'scala',
      groovy: 'groovy', c: 'c', cpp: 'cpp',
    }
    const ext = extMap[selectedLang] || 'txt'
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `generated.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [output, selectedLang])

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
    const sample = `{\n  "name": "Alice",\n  "age": 30,\n  "email": "alice@example.com",\n  "active": true,\n  "address": {\n    "city": "Beijing",\n    "country": "China"\n  },\n  "tags": ["developer", "backend"]\n}`
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
        showToast('success', t('toast.file.loaded').replace('{{file}}', file.name))
      }
      reader.readAsText(file)
    } else {
      showToast('error', t('toast.file.only_json').replace('{{file}}', file?.name || ''))
    }
  }, [showToast, t])

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setInput(ev.target?.result as string)
        showToast('success', t('toast.file.loaded').replace('{{file}}', file.name))
      }
      reader.readAsText(file)
    }
  }, [showToast, t])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])

  return (
    <>
      <SEO
        title="JSON to Code Generator - Convert JSON to Python, Go, C#, Rust & More"
        description="Free online JSON to code generator. Convert JSON to Python dataclasses, Go structs, C# classes, Rust structs, TypeScript interfaces, Java POJO, Kotlin, and more. 100% client-side. Try now!"
        canonicalPath="/json-code-generator"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← {t('nav.back_home')}</Link>

      <section className="tool-header">
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-heading)' }}>{t('codegen.page_title')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{t('codegen.page_desc')}</p>
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

      <div className="tool-controls" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={isSql} onChange={e => { setIsSql(e.target.checked); setSelectedLang(isSql ? 'python' : 'sql_mysql') }} />
          SQL Mode
        </label>
        <select
          value={selectedLang}
          onChange={e => setSelectedLang(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)',
            background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px'
          }}
        >
          {(isSql ? sqlDialects : codegenLanguages).map(lang => (
            <option key={lang.id} value={lang.id}>{t(lang.labelKey)}</option>
          ))}
        </select>
      </div>

      <div className="tool-layout">
        <div className="tool-panel" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          style={{ borderColor: dragOver ? 'var(--accent)' : undefined, background: dragOver ? 'var(--bg-tertiary)' : undefined }}>
          <div className="tool-panel-header">
            <span className="tool-panel-label">{t('codegen.input')}</span>
          </div>
          <textarea
            ref={textareaRef}
            className="tool-textarea"
            value={input}
            onChange={handleInputChange}
            placeholder={t('codegen.placeholder')}
            spellCheck={false}
          />
        </div>

        <div className="tool-actions">
          <button className="btn btn-primary" onClick={handlePaste}>📋 {t('action.paste')}</button>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>📁 {t('action.upload_file')}</button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} style={{ display: 'none' }} />
          <button className="btn" onClick={handleSample}>📝 Sample</button>
          <button className="btn btn-accent" onClick={handleGenerate}>⚡ {t('codegen.generate')}</button>
          <button className="btn" onClick={handleClear}>🗑️ {t('action.clear')}</button>
        </div>

        <div className="tool-panel">
          <div className="tool-panel-header">
            <span className="tool-panel-label">{t('codegen.output')}</span>
          </div>
          <textarea
            className="tool-textarea tool-output"
            value={output}
            readOnly
            placeholder={t('codegen.output_placeholder')}
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
        <h3 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>{t('codegen.supported')}</h3>
        <div className="tool-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {codegenLanguages.map(lang => (
            <div key={lang.id} className="info-card" style={{ textAlign: 'center', padding: '16px' }}>
              <h4 style={{ fontSize: '16px', margin: 0, color: 'var(--text-heading)' }}>{t(lang.labelKey)}</h4>
            </div>
          ))}
        </div>
        <h3 style={{ fontSize: '20px', margin: '24px 0 16px', color: 'var(--text-heading)' }}>SQL Dialects</h3>
        <div className="tool-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {sqlDialects.map(lang => (
            <div key={lang.id} className="info-card" style={{ textAlign: 'center', padding: '16px' }}>
              <h4 style={{ fontSize: '16px', margin: 0, color: 'var(--text-heading)' }}>{t(lang.labelKey)}</h4>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
