import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SeoHead from '../components/SeoHead'
import { Link } from 'react-router-dom'

const NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kevin', 'Lucy', 'Mike', 'Nina', 'Oscar', 'Paul', 'Quinn', 'Rose', 'Sam', 'Tina']
const CITIES = ['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou', 'Hangzhou', 'Wuhan', 'Chengdu', 'Nanjing']

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateRecords(count: number): any[] {
  const result: any[] = []
  for (let i = 0; i < count; i++) {
    result.push({
      id: i + 1,
      name: randomItem(NAMES),
      age: Math.floor(Math.random() * 40) + 18,
      city: randomItem(CITIES),
      active: Math.random() > 0.3,
      score: Math.round(Math.random() * 10000) / 100,
    })
  }
  return result
}

export default function JsonGenerator() {
  const { t } = useTranslation()
  const [count, setCount] = useState<number>(3)
  const [result, setResult] = useState('')
  const [errorInfo, setErrorInfo] = useState('')

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result).then(() => {}, () => {})
  }

  const handleGenerate = () => {
    const num = Math.max(1, Math.min(100, count || 1))
    const records = generateRecords(num)
    setResult(JSON.stringify(num === 1 ? records[0] : records, null, 2))
    setErrorInfo('')
  }

  return (
    <div className="container">
      <SeoHead title="JSON Generator" description="Generate random JSON data for testing and development" canonicalPath="/json-generator" />
      <header>
        <div className="tool-header">
          <Link to="/" className="back-link">← Back to JSON Tools</Link>
          <h1>⚡ JSON Generator</h1>
          <p className="subtitle">Generate random JSON data for testing and development</p>
        </div>
      </header>
      <div className="toolbar">
        <Link to="/" className="btn btn-outline">{t('btn.back')}</Link>
        <button className="btn btn-primary" onClick={handleGenerate}>⚡ Generate</button>
        <button className="btn btn-outline" onClick={handleCopy}>📋 {t('btn.copy')}</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'var(--surface)', borderRadius: '8px', marginBottom: '1rem' }}>
        <label style={{ fontWeight: 600 }}>Record count:</label>
        <input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={e => setCount(Number(e.target.value))}
          style={{ width: '80px', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }}
        />
        <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>(1–100)</span>
      </div>

      <div className="editor-area" style={{ marginTop: 0 }}>
        <div className="editor-panel">
          <div className="panel-header"><span>Generated JSON</span></div>
          <div className="output-area">
            {result ? <pre className="output-text">{result}</pre> : <span className="output-hint">Set the count and click Generate</span>}
          </div>
        </div>
      </div>

      {errorInfo && <div className="error-lines show">{errorInfo}</div>}

      <footer>
        <div className="footer-links">
          <Link to="/" className="footer-link">{t('app.title')}</Link>
          <span className="footer-sep">·</span>
          <a className="footer-link" href="/blog/">{t('footer.blog')}</a>
          <span className="footer-sep">·</span>
          <a className="footer-link" href="/privacy.html">{t('footer.privacy')}</a>
          <span className="footer-sep">·</span>
          <a className="footer-link" href="/contact.html">{t('footer.contact')}</a>
        </div>
        <div>{t('footer.text', { year: new Date().getFullYear() })}</div>
      </footer>
    </div>
  )
}
