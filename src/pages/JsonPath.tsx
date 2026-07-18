import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SeoHead from '../components/SeoHead'
import { JSONPath } from 'jsonpath-plus'
import { tryParseJSON } from '../utils/json'
import { Link } from 'react-router-dom'

export default function JsonPath() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [jpExpr, setJpExpr] = useState('')
  const [jpResult, setJpResult] = useState('')
  const [errorInfo, setErrorInfo] = useState('')

  const handleCopy = () => {
    const text = jpResult || input
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {}, () => {})
  }

  const handleQuery = () => {
    const expr = jpExpr.trim()
    if (!expr) return
    const trimmed = input.trim()
    if (!trimmed) return
    const parsed = tryParseJSON(trimmed)
    if (!parsed) {
      setErrorInfo('Invalid JSON')
      return
    }
    try {
      const results = JSONPath({ path: expr, json: parsed })
      if (results.length === 0) {
        setJpResult('No results found')
      } else {
        const formatted = results.map((r: any, i: number) => `[${i}] ${JSON.stringify(r, null, 2)}`).join('\n\n')
        setJpResult(formatted)
      }
      setErrorInfo('')
    } catch (e: any) {
      setJpResult(`Error: ${(e as Error).message}`)
      setErrorInfo('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleQuery()
  }

  return (
    <div className="container">
      <SeoHead title="JSONPath Evaluator" description="Query JSON data using JSONPath expressions" canonicalPath="/jsonpath" />
      <header>
        <div className="tool-header">
          <Link to="/" className="back-link">← Back to JSON Tools</Link>
          <h1>🗺️ JSONPath Evaluator</h1>
          <p className="subtitle">Query JSON data using JSONPath expressions</p>
        </div>
      </header>
      <div className="toolbar">
        <Link to="/" className="btn btn-outline">{t('btn.back')}</Link>
        <button className="btn btn-primary" onClick={handleQuery}>🔍 Query</button>
        <button className="btn btn-outline" onClick={handleCopy}>📋 {t('btn.copy')}</button>
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>Input JSON</span></div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'Paste JSON here...'}
            spellCheck={false}
          />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>JSONPath Expression & Results</span></div>
          <div style={{ display: 'flex', gap: '8px', padding: '8px' }}>
            <input
              style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }}
              value={jpExpr}
              onChange={e => setJpExpr(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. $.store.book[*].author"
            />
          </div>
          <div className="output-area">
            {jpResult ? <pre className="output-text">{jpResult}</pre> : <span className="output-hint">Enter a JSONPath expression and click Query</span>}
          </div>
        </div>
      </div>

      {errorInfo && <div className="error-lines show">{errorInfo}</div>}

      <div className="jp-help" style={{ padding: '1rem' }}>
        <details>
          <summary>JSONPath Quick Reference</summary>
          <div className="jp-help-content">
            <code>$</code> — root<br/>
            <code>.key</code> — child property<br/>
            <code>[*]</code> — all array elements<br/>
            <code>[0]</code> — array index<br/>
            <code>[0:3]</code> — array slice<br/>
            <code>[?(@.price&lt;10)]</code> — filter expression<br/>
            <code>..name</code> — recursive descent<br/>
            <br/>
            Examples:<br/>
            <code>$.store.book[*].author</code><br/>
            <code>$..price</code><br/>
            <code>$..book[?(@.price&gt;=10)]</code>
          </div>
        </details>
      </div>

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
