import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SeoHead from '../components/SeoHead'
import { diffJSON, type DiffEntry, tryParseJSON } from '../utils/json'
import { Link } from 'react-router-dom'

export default function JsonDiff() {
  const { t } = useTranslation()
  const [leftInput, setLeftInput] = useState('')
  const [rightInput, setRightInput] = useState('')
  const [diffResult, setDiffResult] = useState<DiffEntry[] | null>(null)
  const [errorInfo, setErrorInfo] = useState('')

  const handleCompare = () => {
    const ta = leftInput.trim()
    const tb = rightInput.trim()
    if (!ta && !tb) {
      setErrorInfo('Enter JSON in both panels to compare')
      return
    }
    const pa = tryParseJSON(ta)
    const pb = tryParseJSON(tb)
    if (!pa) { setErrorInfo('Left side requires valid JSON'); return }
    if (!pb) { setErrorInfo('Right side requires valid JSON'); return }
    const result = diffJSON(pa, pb)
    setDiffResult(result)
    setErrorInfo('')
  }

  const handleCopy = () => {
    const text = diffResult ? JSON.stringify(diffResult, null, 2) : ''
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {}, () => {})
  }

  const renderDiffValue = (val: string | undefined) => {
    if (val === undefined) return null
    try {
      return JSON.stringify(JSON.parse(val), null, 2)
    } catch {
      return val
    }
  }

  return (
    <div className="container">
      <SeoHead title="JSON Diff" description="Compare two JSON objects and see the differences" canonicalPath="/json-diff" />
      <header>
        <div className="tool-header">
          <Link to="/" className="back-link">← Back to JSON Tools</Link>
          <h1>🔍 JSON Diff</h1>
          <p className="subtitle">Compare two JSON objects and see the differences</p>
        </div>
      </header>
      <div className="toolbar">
        <Link to="/" className="btn btn-outline">{t('btn.back')}</Link>
        <button className="btn btn-primary" onClick={handleCompare}>🔍 Compare</button>
        {diffResult && <button className="btn btn-outline" onClick={handleCopy}>📋 {t('btn.copy')}</button>}
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>JSON A (Left)</span></div>
          <textarea
            value={leftInput}
            onChange={e => setLeftInput(e.target.value)}
            placeholder={'Paste first JSON here...'}
            spellCheck={false}
          />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>JSON B (Right)</span></div>
          <textarea
            value={rightInput}
            onChange={e => setRightInput(e.target.value)}
            placeholder={'Paste second JSON here...'}
            spellCheck={false}
          />
        </div>
      </div>

      {errorInfo && <div className="error-lines show">{errorInfo}</div>}

      {diffResult !== null && (
        <div className="diff-result">
          {diffResult.length === 0 ? (
            <div className="diff-same">✅ No differences found — both JSONs are identical!</div>
          ) : (
            <div className="diff-entries">
              <div className="diff-summary">
                {diffResult.filter(d => d.type === 'added').length} Added ·
                {diffResult.filter(d => d.type === 'removed').length} Removed ·
                {diffResult.filter(d => d.type === 'modified').length} Modified
              </div>
              {diffResult.map((d, i) => (
                <div key={i} className={`diff-entry diff-${d.type}`}>
                  <div className="diff-path">
                    {d.type === 'added' ? '+' : d.type === 'removed' ? '−' : '∼'} {d.path}
                  </div>
                  <div className="diff-value">
                    {d.a !== undefined && <div className="diff-a">- {renderDiffValue(d.a)}</div>}
                    {d.b !== undefined && <div className="diff-b">+ {renderDiffValue(d.b)}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
