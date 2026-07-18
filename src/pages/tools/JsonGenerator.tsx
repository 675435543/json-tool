import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

export default function JsonGenerator() {
  const { t } = useTranslation()
  const [count, setCount] = useState(5)
  const [result, setResult] = useState('')

  const handleGenerate = () => {
    const n = Math.max(1, Math.min(100, count))
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack']
    const cities = ['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou', 'Hangzhou', 'Wuhan', 'Chengdu', 'Nanjing']
    const data: any[] = []
    for (let i = 0; i < n; i++) {
      data.push({
        id: i + 1,
        name: names[Math.floor(Math.random() * names.length)],
        age: Math.floor(Math.random() * 40) + 18,
        city: cities[Math.floor(Math.random() * cities.length)],
        email: `user${i + 1}@example.com`,
        active: Math.random() > 0.3,
        score: Math.round(Math.random() * 10000) / 100
      })
    }
    setResult(JSON.stringify(n === 1 ? data[0] : data, null, 2))
  }

  const handleCopy = () => { if (result) navigator.clipboard.writeText(result) }

  return (
    <>
      <SEO
        title="JSON Data Generator - Generate Sample JSON for Testing Free"
        description="Free JSON data generator: create random JSON sample data for testing, development, and prototyping. Generate realistic user data, configure record count 1-100."
        keywords="JSON generator, sample JSON data, mock JSON, test data generator, JSON mock data, fake JSON generator"
        canonicalPath="/json-generator"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      <div className="gen-area">
        <label>{t('gen.count')}</label>
        <input className="gen-input" type="number" min="1" max="100" value={count} onChange={e => setCount(Number(e.target.value))} />
        <button className="btn btn-purple" onClick={handleGenerate}>⚡ {t('gen.generate')}</button>
      </div>

      <div className="editor-area" style={{ marginTop: '12px' }}>
        <div className="editor-panel">
          <div className="panel-header">
            <span>{t('gen.result')}</span>
            {result && <span className="action-link" onClick={handleCopy}>📋 {t('btn.copy')}</span>}
          </div>
          <div className="output-area">{result || <span className="output-hint">{t('gen.hint')}</span>}</div>
        </div>
      </div>

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>Why Use a JSON Data Generator?</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>⚡ <strong>Frontend development</strong> — Test UI components with realistic data before the API is ready</p>
          <p>⚡ <strong>API prototyping</strong> — Create mock API responses for documentation and testing</p>
          <p>⚡ <strong>Database seeding</strong> — Generate sample data for development databases</p>
          <p>⚡ <strong>Load testing</strong> — Create large JSON payloads to test performance</p>
        </div>
      </section>
    </>
  )
}
