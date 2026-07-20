import { useState, useCallback, useRef, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { flattenJSON, unflattenJSON } from '../../lib/jsonFlatten'
import { useKeyboardShortcuts } from '../../lib/useShortcuts'

export default function JsonFlatten() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'flatten' | 'unflatten'>('flatten')
  const [separator, setSeparator] = useState('.')
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const showToast = useCallback((type: 'success' | 'error' | 'info', msg: string) => {
    setToast({ type, msg })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const handleProcess = useCallback(() => {
    if (!input.trim()) {
      showToast('info', t('toast.input.empty'))
      return
    }
    try {
      if (mode === 'flatten') {
        const parsed = JSON.parse(input.trim())
        if (typeof parsed !== 'object' || parsed === null) {
          showToast('error', 'Must be an object or array')
          return
        }
        const flat = flattenJSON(parsed, '', separator)
        setOutput(JSON.stringify(flat, null, 2))
        setError('')
        showToast('success', 'Flattened!')
      } else {
        const parsed = JSON.parse(input.trim())
        const unflat = unflattenJSON(parsed, separator)
        setOutput(JSON.stringify(unflat, null, 2))
        setError('')
        showToast('success', 'Unflattened!')
      }
    } catch {
      setError(t('toast.invalid'))
      showToast('error', t('toast.invalid'))
    }
  }, [input, mode, separator, showToast, t])

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      showToast('success', t('toast.copied'))
    } catch { showToast('error', t('toast.copy_fail')) }
  }, [output, showToast, t])

  const handleDownload = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = mode === 'flatten' ? 'flattened.json' : 'unflattened.json'
    a.click(); URL.revokeObjectURL(url)
  }, [output, mode])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
      showToast('info', t('toast.pasted'))
    } catch { showToast('error', t('toast.paste_failed')) }
  }, [showToast, t])

  const handleClear = useCallback(() => { setInput(''); setOutput(''); setError('') }, [])

  const handleSample = useCallback(() => {
    const s = JSON.stringify({ user: { profile: { name: 'Alice', age: 30 }, roles: ['admin', 'editor'] }, meta: { created: '2026-01-01' } }, null, 2)
    setInput(s)
  }, [])

  useKeyboardShortcuts([{ key: 'Enter', ctrl: true, handler: handleProcess }])

  return (
    <>
      <SEO
        title="JSON Flatten & Unflatten Online — Convert Nested JSON to Dot Notation"
        description="Free online JSON flatten tool. Convert nested JSON to dot notation (key.key=value) and unflatten back. Perfect for data analysis, logging, and ETL. 100% client-side. Try now!"
        canonicalPath="/json-flatten"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← {t('nav.back_home')}</Link>

      <section className="tool-header">
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-heading)' }}>{t('flatten.title')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{t('flatten.subtitle')}</p>
      </section>

      {toast && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, padding: '12px 24px', borderRadius: '8px', fontSize: '14px',
          background: toast.type === 'success' ? 'var(--success-bg)' : toast.type === 'error' ? 'var(--danger-bg)' : 'var(--info-bg)',
          color: toast.type === 'success' ? 'var(--success-text)' : toast.type === 'error' ? 'var(--danger-text)' : 'var(--info-text)',
          border: `1px solid ...`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {toast.msg}
        </div>
      )}

      <div className="tool-controls" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px' }}>
          <button onClick={() => setMode('flatten')} className={`btn ${mode === 'flatten' ? 'btn-accent' : ''}`} style={{ fontSize: '13px', padding: '6px 16px' }}>{t('flatten.flatten_mode')}</button>
          <button onClick={() => setMode('unflatten')} className={`btn ${mode === 'unflatten' ? 'btn-accent' : ''}`} style={{ fontSize: '13px', padding: '6px 16px' }}>{t('flatten.unflatten_mode')}</button>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {t('flatten.separator')}:
          <input value={separator} onChange={e => setSeparator(e.target.value)} style={{ width: '50px', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', textAlign: 'center', fontSize: '14px' }} maxLength={2} />
        </label>
      </div>

      <div className="tool-layout">
        <div className="tool-panel">
          <div className="tool-panel-header"><span className="tool-panel-label">{t('flatten.input')}</span></div>
          <textarea className="tool-textarea" value={input} onChange={e => { setInput(e.target.value); setOutput(''); setError('') }}
            placeholder={mode === 'flatten' ? t('flatten.placeholder') : '{ "user.name": "Alice" }'} spellCheck={false} />
        </div>
        <div className="tool-actions">
          <button className="btn btn-primary" onClick={handlePaste}>📋 {t('action.paste')}</button>
          <button className="btn" onClick={handleSample}>📝 Sample</button>
          <button className="btn btn-accent" onClick={handleProcess}>{mode === 'flatten' ? '🔽' : '🔼'} {mode === 'flatten' ? t('flatten.flatten_btn') : t('flatten.unflatten_btn')}</button>
          <button className="btn" onClick={handleClear}>🗑️ {t('action.clear')}</button>
        </div>
        <div className="tool-panel">
          <div className="tool-panel-header"><span className="tool-panel-label">{mode === 'flatten' ? t('flatten.flattened') : t('flatten.unflattened')}</span></div>
          <textarea className="tool-textarea tool-output" value={output} readOnly
            placeholder={mode === 'flatten' ? t('flatten.output_placeholder') : t('flatten.output_placeholder')}
            spellCheck={false} style={{ color: 'var(--success-text)' }} />
          {output && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button className="btn btn-outline" onClick={handleCopy}>📋 {t('action.copy')}</button>
              <button className="btn btn-outline" onClick={handleDownload}>⬇️ {t('action.download')}</button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--danger-bg)', borderRadius: '8px', color: 'var(--danger-text)' }}>{error}</div>
      )}
    </>
  )
}
