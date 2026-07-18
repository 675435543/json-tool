import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { tryParseJSON, generateTSInterfaces } from '../../lib/utils'

export default function JsonToTypeScript() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleConvert = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return
    const parsed = tryParseJSON(trimmed)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return
    setOutput(generateTSInterfaces(parsed, 'Root'))
  }, [input])

  const handleCopy = () => { if (output) navigator.clipboard.writeText(output) }

  const readFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setInput(e.target?.result as string)
    reader.readAsText(file)
  }, [])

  return (
    <>
      <SEO
        title="JSON to TypeScript Interface Converter - Generate TS Types Free"
        description="Convert JSON to TypeScript interfaces instantly. Generate TypeScript type definitions from JSON data. Perfect for frontend developers working with API responses."
        keywords="JSON to TypeScript, JSON to TS interface, TypeScript type generator, JSON to TS types, TypeScript interface from JSON"
        canonicalPath="/json-to-typescript"
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
        <button className="btn btn-purple" onClick={handleConvert}>🔷 {t('btn.to_typescript')}</button>
        {output && <button className="btn btn-outline" onClick={handleCopy}>{t('btn.copy')}</button>}
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>{t('panel.input')} (JSON)</span></div>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t('textarea.placeholder')} spellCheck={false} />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>TypeScript {t('panel.output')}</span></div>
          <div className="output-area">{output || <span className="output-hint">{t('textarea.output_hint')}</span>}</div>
        </div>
      </div>

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>Why Use JSON to TypeScript Converter?</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>🔹 <strong>Save time</strong> — No more manually typing interfaces from API responses</p>
          <p>🔹 <strong>Type safety</strong> — Generated interfaces catch type errors at compile time</p>
          <p>🔹 <strong>Nested objects</strong> — Handles deeply nested JSON structures automatically</p>
          <p>🔹 <strong>Arrays of objects</strong> — Detects array item types and generates proper definitions</p>
          <p style={{ marginTop: '12px' }}><strong>Example:</strong> Paste a JSON API response → get TypeScript interfaces you can paste directly into your project.</p>
        </div>
      </section>
    </>
  )
}
