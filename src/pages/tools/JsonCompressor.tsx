import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

export default function JsonCompressor() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [stats, setStats] = useState<{ orig: number; compressed: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCompress = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return
    try {
      const parsed = JSON.parse(trimmed)
      const compressed = JSON.stringify(parsed)
      setOutput(compressed)
      setStats({ orig: trimmed.length, compressed: compressed.length })
    } catch { setOutput('Invalid JSON input') }
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
        title="JSON Minifier Online - Compress & Minify JSON Files Free"
        description="Free online JSON minifier: compress and minify JSON to reduce file size. Remove whitespace and formatting. See compression ratio instantly. Pure frontend, secure."
        keywords="JSON minifier, JSON compressor, minify JSON, compress JSON online, JSON size reducer, JSON minify tool"
        canonicalPath="/json-compressor"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      <div className={`upload-zone ${dragOver ? 'dragover' : ''}`} onDragOver={(e: DragEvent) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)} onDrop={(e: DragEvent) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]) }}
        onClick={() => fileInputRef.current?.click()}>
        <div className="file-icon">📂</div>
        <p>{dragOver ? t('upload.dragover') : t('upload.title')}</p>
        <input ref={fileInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={(e: ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) { readFile(e.target.files[0]); e.target.value = '' } }} />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
        <button className="btn btn-success" onClick={handleCompress}>📦 {t('btn.minify')}</button>
        {output && <button className="btn btn-outline" onClick={handleCopy}>{t('btn.copy')}</button>}
        {stats && (
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
            {stats.orig.toLocaleString()} → {stats.compressed.toLocaleString()} chars ({Math.round((1 - stats.compressed / stats.orig) * 100)}% smaller)
          </span>
        )}
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>{t('panel.input')}</span></div>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t('textarea.placeholder')} spellCheck={false} />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>{t('panel.output')}</span></div>
          <div className="output-area">{output || <span className="output-hint">{t('textarea.output_hint')}</span>}</div>
        </div>
      </div>

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>Why Minify JSON?</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>📦 <strong>Smaller file size</strong> — Minified JSON can be 30-60% smaller, reducing bandwidth and storage costs</p>
          <p>📦 <strong>Faster API responses</strong> — Smaller payloads mean faster network transfer for web and mobile apps</p>
          <p>📦 <strong>Production optimization</strong> — Use minified JSON in production; keep formatted JSON for development</p>
          <p>📦 <strong>Embed in URLs</strong> — Minified JSON fits better in query parameters and URL-encoded data</p>
        </div>
      </section>
    </>
  )
}
