import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SeoHead from '../components/SeoHead'
import { Link } from 'react-router-dom'

export default function JwtDecoder() {
  const { t } = useTranslation()
  const [jwtInput, setJwtInput] = useState('')
  const [jwtResult, setJwtResult] = useState('')
  const [errorInfo, setErrorInfo] = useState('')

  const handleCopy = () => {
    const text = jwtResult || jwtInput
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {}, () => {})
  }

  const handleDecode = () => {
    const trimmed = jwtInput.trim()
    if (!trimmed) return
    try {
      const parts = trimmed.split('.')
      if (parts.length !== 3) {
        setErrorInfo('Invalid JWT format — expected 3 parts separated by dots')
        setJwtResult('')
        return
      }
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      setJwtResult(JSON.stringify({ header, payload, signature: parts[2] + '...' }, null, 2))
      setErrorInfo('')
    } catch {
      setErrorInfo('Failed to decode JWT — invalid Base64 or JSON content')
      setJwtResult('')
    }
  }

  return (
    <div className="container">
      <SeoHead title="JWT Decoder" description="Decode JWT tokens and inspect header, payload, and signature" canonicalPath="/jwt-decoder" />
      <header>
        <div className="tool-header">
          <Link to="/" className="back-link">← Back to JSON Tools</Link>
          <h1>🔓 JWT Decoder</h1>
          <p className="subtitle">Decode JWT tokens and inspect header, payload, and signature</p>
        </div>
      </header>
      <div className="toolbar">
        <Link to="/" className="btn btn-outline">{t('btn.back')}</Link>
        <button className="btn btn-primary" onClick={handleDecode}>🔓 Decode</button>
        <button className="btn btn-outline" onClick={handleCopy}>📋 {t('btn.copy')}</button>
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>JWT Token</span></div>
          <textarea
            value={jwtInput}
            onChange={e => setJwtInput(e.target.value)}
            placeholder={`Paste your JWT token here...\n\neyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.xyz`}
            spellCheck={false}
          />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>Decoded Result</span></div>
          <div className="output-area">
            {jwtResult ? <pre className="output-text">{jwtResult}</pre> : <span className="output-hint">Enter a JWT token and click Decode</span>}
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
