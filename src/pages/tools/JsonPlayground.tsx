import { useState, useCallback, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import TreeView from '../../TreeView'
import { codegenLanguages, sqlDialects } from '../../codegen'
import { generateSchema } from '../../lib/jsonSchemaGenerator'
import { analyzeJSON, formatFileSize } from '../../lib/jsonStats'
import { useKeyboardShortcuts } from '../../lib/useShortcuts'

type TabKey = 'format' | 'tree' | 'codegen' | 'schema' | 'stats'

const tabs: { key: TabKey; icon: string; labelKey: string }[] = [
  { key: 'format',  icon: '✨', labelKey: 'playground.tab_format' },
  { key: 'tree',    icon: '🌳', labelKey: 'playground.tab_tree' },
  { key: 'codegen',  icon: '⚡', labelKey: 'playground.tab_codegen' },
  { key: 'schema',  icon: '📋', labelKey: 'playground.tab_schema' },
  { key: 'stats',   icon: '📊', labelKey: 'playground.tab_stats' },
]

export default function JsonPlayground() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('format')
  const [parsed, setParsed] = useState<any>(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null)
  const [codegenLang, setCodegenLang] = useState('python')
  const [codegenOutput, setCodegenOutput] = useState('')
  const [isSql, setIsSql] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = useCallback((type: 'success' | 'error' | 'info', msg: string) => {
    setToast({ type, msg })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const doParse = useCallback((text: string) => {
    if (!text.trim()) {
      setParsed(null)
      setError('')
      setCodegenOutput('')
      return
    }
    try {
      const p = JSON.parse(text.trim())
      setParsed(p)
      setError('')
      // Auto-trigger codegen if on that tab
      if (activeTab === 'codegen') {
        doCodegen(p)
      }
    } catch {
      setParsed(null)
      setError(t('toast.invalid'))
    }
  }, [activeTab, t])

  const doCodegen = useCallback((data: any) => {
    if (!data || typeof data !== 'object') {
      setCodegenOutput('')
      return
    }
    const langs = isSql ? sqlDialects : codegenLanguages
    const entry = langs.find(l => l.id === codegenLang)
    if (entry) {
      setCodegenOutput(entry.generate(data))
    }
  }, [codegenLang, isSql])

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab)
    if (tab === 'codegen' && parsed && typeof parsed === 'object') {
      doCodegen(parsed)
    }
  }, [parsed, doCodegen])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    doParse(e.target.value)
  }, [doParse])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
      doParse(text)
      showToast('info', t('toast.pasted'))
    } catch { showToast('error', t('toast.paste_failed')) }
  }, [doParse, showToast, t])

  const handleClear = useCallback(() => {
    setInput('')
    setParsed(null)
    setError('')
    setCodegenOutput('')
    if (textareaRef.current) textareaRef.current.focus()
  }, [])

  const handleSample = useCallback(() => {
    const sample = JSON.stringify({
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      age: 30,
      isActive: true,
      address: { street: '123 Main St', city: 'Beijing', country: 'China' },
      tags: ['developer', 'backend'],
      createdAt: '2026-01-15T08:30:00Z',
    }, null, 2)
    setInput(sample)
    doParse(sample)
    showToast('info', 'Sample loaded')
  }, [doParse, showToast])

  const handleCopy = useCallback(async () => {
    let text = ''
    if (activeTab === 'format' && parsed) {
      text = JSON.stringify(parsed, null, 2)
    } else if (activeTab === 'codegen' && codegenOutput) {
      text = codegenOutput
    } else if (activeTab === 'schema' && parsed) {
      text = JSON.stringify(generateSchema(parsed), null, 2)
    } else if (activeTab === 'stats' && parsed) {
      const bytes = new Blob([input.trim()]).size
      const stats = analyzeJSON(parsed, bytes)
      text = JSON.stringify(stats, null, 2)
    }
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      showToast('success', t('toast.copied'))
    } catch { showToast('error', t('toast.copy_fail')) }
  }, [activeTab, parsed, codegenOutput, input, showToast, t])

  const handleDownload = useCallback(() => {
    let text = ''
    let filename = ''
    if (activeTab === 'format' && parsed) {
      text = JSON.stringify(parsed, null, 2)
      filename = 'formatted.json'
    } else if (activeTab === 'codegen' && codegenOutput) {
      text = codegenOutput
      const ext = { python: 'py', go: 'go', csharp: 'cs', rust: 'rs', kotlin: 'kt' }[codegenLang] || 'txt'
      filename = `generated.${ext}`
    } else if (activeTab === 'schema' && parsed) {
      text = JSON.stringify(generateSchema(parsed), null, 2)
      filename = 'schema.json'
    }
    if (!text) return
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
  }, [activeTab, parsed, codegenOutput, codegenLang])

  const handleGas = useCallback(() => {
    if (!parsed) return
    if (activeTab === 'codegen') doCodegen(parsed)
  }, [activeTab, parsed, doCodegen])

  // Auto-trigger codegen on tab switch
  useEffect(() => {
    if (activeTab === 'codegen' && parsed && typeof parsed === 'object') {
      doCodegen(parsed)
    }
  }, [activeTab, parsed, codegenLang, isSql, doCodegen])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        setInput(text)
        doParse(text)
      }
      reader.readAsText(file)
    }
  }, [doParse])

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        setInput(text)
        doParse(text)
      }
      reader.readAsText(file)
    }
  }, [doParse])

  const handleCodegenLangChange = useCallback((lang: string) => {
    setCodegenLang(lang)
    if (parsed && typeof parsed === 'object') {
      const langs = isSql ? sqlDialects : codegenLanguages
      const entry = langs.find(l => l.id === lang)
      if (entry) setCodegenOutput(entry.generate(parsed))
    }
  }, [parsed, isSql])

  useKeyboardShortcuts([
    { key: 'Enter', ctrl: true, handler: () => {
      if (activeTab === 'codegen' && parsed) doCodegen(parsed)
    }},
  ])

  const renderOutput = () => {
    if (!input.trim()) {
      return <div className="output-hint">{t('playground.hint_paste')}</div>
    }
    if (error) {
      return <div className="output-hint" style={{ color: 'var(--danger-text)' }}>{error}</div>
    }
    if (!parsed) {
      return <div className="output-hint">{t('playground.hint_paste')}</div>
    }

    switch (activeTab) {
      case 'format':
        return <pre className="playground-output">{JSON.stringify(parsed, null, 2)}</pre>
      case 'tree':
        return <div style={{ padding: '16px' }}><TreeView data={parsed} /></div>
      case 'codegen':
        return (
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" checked={isSql} onChange={e => { setIsSql(e.target.checked); setCodegenLang(e.target.checked ? 'sql_mysql' : 'python') }} />
                SQL
              </label>
              <select value={codegenLang} onChange={e => handleCodegenLangChange(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px' }}>
                {(isSql ? sqlDialects : codegenLanguages).map(l => (
                  <option key={l.id} value={l.id}>{t(l.labelKey)}</option>
                ))}
              </select>
              <button className="btn btn-accent" style={{ fontSize: '13px', padding: '4px 12px' }} onClick={handleGas}>Generate</button>
            </div>
            {codegenOutput ? (
              <pre className="playground-output">{codegenOutput}</pre>
            ) : (
              <div className="output-hint">{t('playground.hint_codegen')}</div>
            )}
          </div>
        )
      case 'schema':
        return <pre className="playground-output">{JSON.stringify(generateSchema(parsed), null, 2)}</pre>
      case 'stats': {
        const bytes = new Blob([input.trim()]).size
        const stats = analyzeJSON(parsed, bytes)
        return (
          <div style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div><strong>File Size:</strong> {formatFileSize(stats.fileSizeBytes)}</div>
              <div><strong>Max Depth:</strong> {stats.maxDepth}</div>
              <div><strong>Total Keys:</strong> {stats.totalKeys.toLocaleString()}</div>
              <div><strong>Objects:</strong> {stats.objectCount.toLocaleString()}</div>
              <div><strong>Arrays:</strong> {stats.arrayCount.toLocaleString()}</div>
              <div><strong>Array Items:</strong> {stats.arrayItemCount.toLocaleString()}</div>
              <div><strong>Strings:</strong> {stats.stringCount.toLocaleString()}</div>
              <div><strong>Numbers:</strong> {stats.numberCount.toLocaleString()}</div>
              <div><strong>Booleans:</strong> {stats.booleanCount.toLocaleString()}</div>
              <div><strong>Nulls:</strong> {stats.nullCount.toLocaleString()}</div>
            </div>
            {Object.entries(stats.typeSummary).length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <strong style={{ display: 'block', marginBottom: '8px' }}>Type Distribution:</strong>
                {Object.entries(stats.typeSummary).map(([k, v]) => {
                  const max = Math.max(...Object.values(stats.typeSummary), 1)
                  return (
                    <div key={k} style={{ marginBottom: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '2px' }}>
                        <span>{k}</span><strong>{v.toLocaleString()}</strong>
                      </div>
                      <div style={{ height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px' }}>
                        <div style={{ width: `${(v / max) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      }
    }
  }

  // Toast helper
  const toastStyle = () => {
    if (!toast) return {}
    const t2 = toast.type
    return {
      position: 'fixed' as const, top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
      padding: '12px 24px', borderRadius: '8px', fontSize: '14px',
      background: t2 === 'success' ? 'var(--success-bg)' : t2 === 'error' ? 'var(--danger-bg)' : 'var(--info-bg)',
      color: t2 === 'success' ? 'var(--success-text)' : t2 === 'error' ? 'var(--danger-text)' : 'var(--info-text)',
      border: '1px solid ' + (t2 === 'success' ? 'var(--success-border)' : t2 === 'error' ? 'var(--danger-border)' : 'var(--info-border)'),
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }
  }

  return (
    <>
      <SEO
        title="JSON Playground — Online JSON Workspace for Developers"
        description="All-in-one JSON playground: format, view tree, generate code, create schemas, analyze statistics. 100% client-side, your data stays private. One JSON, multiple perspectives."
        canonicalPath="/json-playground"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← {t('nav.back_home')}</Link>

      <section className="tool-header">
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-heading)' }}>{t('playground.title')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{t('playground.subtitle')}</p>
      </section>

      {toast && <div style={toastStyle()}>{toast.msg}</div>}

      {/* Input area */}
      <div className="tool-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-panel" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
          <div className="tool-panel-header">
            <span className="tool-panel-label">{t('playground.input')}</span>
            <div className="tool-panel-info">{input ? `${input.trim().split('\n').length} lines` : ''}</div>
          </div>
          <textarea
            ref={textareaRef}
            className="tool-textarea"
            value={input}
            onChange={handleInputChange}
            placeholder={t('playground.input_placeholder')}
            spellCheck={false}
            style={{ minHeight: '120px', maxHeight: '300px' }}
          />
          <div className="tool-actions" style={{ marginTop: '8px', justifyContent: 'flex-start' }}>
            <button className="btn btn-primary" onClick={handlePaste}>📋 {t('action.paste')}</button>
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>📁 {t('action.upload_file')}</button>
            <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileSelect} style={{ display: 'none' }} />
            <button className="btn" onClick={handleSample}>📝 Sample</button>
            <button className="btn" onClick={handleClear}>🗑️ {t('action.clear')}</button>
            {parsed && <><button className="btn btn-outline" onClick={handleCopy}>📋 {t('action.copy')}</button><button className="btn btn-outline" onClick={handleDownload}>⬇️ {t('action.download')}</button></>}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', marginTop: '24px', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
        {tabs.map(tab => (
          <button key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
              borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: '-2px',
              background: activeTab === tab.key ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-secondary)',
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.15s',
            }}>
            {tab.icon} {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Output area */}
      <div className="tool-panel" style={{ marginTop: '0', borderTopLeftRadius: '0', minHeight: '300px', maxHeight: '600px', overflow: 'auto' }}>
        {renderOutput()}
      </div>
    </>
  )
}
