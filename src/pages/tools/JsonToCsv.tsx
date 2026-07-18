import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { tryParseJSON, jsonToCSV } from '../../lib/utils'

export default function JsonToCsv() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleConvert = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return
    const parsed = tryParseJSON(trimmed)
    if (!parsed) return
    const csv = jsonToCSV(parsed)
    if (csv) setOutput(csv)
  }, [input])

  const handleCopy = () => { if (output) navigator.clipboard.writeText(output) }
  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'output.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const readFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setInput(e.target?.result as string)
    reader.readAsText(file)
  }, [])

  return (
    <>
      <SEO
        title="JSON to CSV Converter Online - Convert JSON to CSV Free"
        description="Free online JSON to CSV converter. Convert JSON arrays to CSV format instantly. Download as .csv file. Pure frontend — your data stays private and never leaves your browser."
        keywords="JSON to CSV, convert JSON to CSV, JSON to CSV converter online, JSON CSV export, JSON data to spreadsheet"
        canonicalPath="/json-to-csv"
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
        <button className="btn btn-purple" onClick={handleConvert}>📊 {t('btn.to_csv')}</button>
        {output && <button className="btn btn-outline" onClick={handleCopy}>{t('btn.copy')}</button>}
        {output && <button className="btn btn-outline" onClick={handleDownload}>⬇ Download CSV</button>}
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>{t('panel.input')} (JSON)</span></div>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t('textarea.placeholder')} spellCheck={false} />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>CSV {t('panel.output')}</span></div>
          <div className="output-area">{output || <span className="output-hint">{t('textarea.output_hint')}</span>}</div>
        </div>
      </div>

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>How to Convert JSON to CSV</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>1. Paste your JSON array in the left panel (must be an array of objects)</p>
          <p>2. Click <strong>To CSV</strong> to convert</p>
          <p>3. Copy the CSV output or download as a .csv file</p>
          <p>4. Open in Excel, Google Sheets, or any spreadsheet application</p>
          <p style={{ marginTop: '12px' }}><strong>Example input:</strong></p>
          <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', fontSize: '13px', overflow: 'auto' }}>
{`[
  {"name": "Alice", "age": 30, "city": "NYC"},
  {"name": "Bob", "age": 25, "city": "LA"}
]`}</pre>
        </div>
      </section>
    </>
  )
}
