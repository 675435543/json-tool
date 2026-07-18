import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

function csvToJson(csv: string): string | null {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return null
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows: any[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const row: any = {}
    headers.forEach((h, j) => {
      const val = values[j] ?? ''
      if (val === 'true') row[h] = true
      else if (val === 'false') row[h] = false
      else if (val === 'null' || val === '') row[h] = null
      else if (/^-?\d+(\.\d+)?$/.test(val)) row[h] = Number(val)
      else row[h] = val
    })
    rows.push(row)
  }
  return JSON.stringify(rows, null, 2)
}

export default function CsvToJson() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const handleConvert = useCallback(() => {
    if (!input.trim()) return
    const result = csvToJson(input)
    if (result) setOutput(result)
    else setOutput('Invalid CSV input. Please provide a header row and at least one data row.')
  }, [input])

  return (
    <>
      <SEO
        title="CSV to JSON Converter Online - Convert CSV to JSON Free"
        description="Free online CSV to JSON converter. Convert CSV files to JSON arrays instantly. Paste CSV data, get formatted JSON output. Pure frontend, no uploads."
        keywords="CSV to JSON, convert CSV to JSON, CSV to JSON online, CSV JSON converter, spreadsheet to JSON"
        canonicalPath="/csv-to-json"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button className="btn btn-purple" onClick={handleConvert}>📊 CSV → JSON</button>
        {output && <button className="btn btn-outline" onClick={() => navigator.clipboard.writeText(output)}>{t('btn.copy')}</button>}
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>CSV Input</span></div>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={`name,age,city\nAlice,30,NYC\nBob,25,LA`} spellCheck={false} />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>JSON Output</span></div>
          <div className="output-area">{output || <span className="output-hint">Paste CSV and click CSV → JSON</span>}</div>
        </div>
      </div>

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>CSV to JSON — How It Works</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>📊 First row is treated as headers (property names)</p>
          <p>📊 Each subsequent row becomes a JSON object</p>
          <p>📊 Values are auto-detected: booleans, numbers, null</p>
          <p>📊 Also try: <Link to="/json-to-csv" style={{ color: 'var(--text-link)' }}>JSON to CSV →</Link></p>
        </div>
      </section>
    </>
  )
}
