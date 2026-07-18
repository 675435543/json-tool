import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { parseError } from '../../lib/utils'

export default function JsonValidator() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [result, setResult] = useState<{ valid: boolean; msg: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleValidate = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) { setResult({ valid: false, msg: t('toast.input.empty') }); return }
    try {
      JSON.parse(trimmed)
      setResult({ valid: true, msg: t('toast.valid') })
    } catch (e: any) {
      setResult({ valid: false, msg: parseError(e, trimmed, t) })
    }
  }, [input, t])

  const readFile = useCallback((file: File) => {
    if (!file.name.endsWith('.json')) { setResult({ valid: false, msg: t('toast.file.only_json', { file: file.name }) }); return }
    const reader = new FileReader()
    reader.onload = (e) => { setInput(e.target?.result as string); setResult(null) }
    reader.readAsText(file)
  }, [t])

  return (
    <>
      <SEO
        title="JSON Validator Online - Check JSON Syntax Errors Free"
        description="Free online JSON Validator: check and fix JSON syntax errors instantly. Validates JSON structure, finds missing commas, invalid quotes, and more. No server upload."
        keywords="JSON validator, validate JSON online, JSON syntax checker, JSON error checker, JSON lint, check JSON"
        canonicalPath="/json-validator"
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
        <button className="btn btn-warning" onClick={handleValidate} style={{ fontSize: '15px', padding: '10px 24px' }}>✅ {t('btn.validate')}</button>
      </div>

      <div className="editor-panel">
        <div className="panel-header"><span>{t('panel.input')}</span></div>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t('textarea.placeholder')} spellCheck={false} />
        {result && (
          <div className={`error-lines show`} style={{ background: result.valid ? 'var(--success-bg)' : 'var(--danger-bg)', color: result.valid ? 'var(--success-text)' : 'var(--danger-text)', borderColor: result.valid ? 'var(--success-border)' : 'var(--danger-border)' }}>
            {result.msg}
          </div>
        )}
      </div>

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>Common JSON Errors</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p><strong>1. Missing Comma:</strong> <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--danger)' }}>{`{ "a": 1 "b": 2 }`}</code> → should be <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--success)' }}>{`{ "a": 1, "b": 2 }`}</code></p>
          <p><strong>2. Trailing Comma:</strong> <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--danger)' }}>{`{ "a": 1, }`}</code> → JSON does not allow trailing commas</p>
          <p><strong>3. Single Quotes:</strong> <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--danger)' }}>{`{ 'key': 'value' }`}</code> → JSON requires double quotes</p>
          <p><strong>4. Unquoted Keys:</strong> <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--danger)' }}>{`{ key: "value" }`}</code> → keys must be quoted in JSON</p>
          <p><strong>5. Comments:</strong> JSON does not support <code>//</code> or <code>/* */</code> comments</p>
        </div>
      </section>
    </>
  )
}
