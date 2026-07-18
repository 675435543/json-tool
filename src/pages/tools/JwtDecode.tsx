import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

export default function JwtDecode() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')

  const handleDecode = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    try {
      const parts = trimmed.split('.')
      if (parts.length !== 3) { setResult('Invalid JWT format: token must have 3 parts separated by dots'); return }
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      setResult(JSON.stringify({ header, payload }, null, 2))
    } catch { setResult('Failed to decode JWT. Check if the token is valid.') }
  }

  return (
    <>
      <SEO
        title="JWT Decoder Online - Decode JSON Web Tokens Free"
        description="Free online JWT decoder: decode and inspect JSON Web Tokens. View JWT header and payload claims without verification. Perfect for debugging authentication tokens."
        keywords="JWT decoder, JWT decode online, JSON Web Token decoder, decode JWT token, JWT inspector, JWT debugger"
        canonicalPath="/jwt-decode"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      <div className="diff-toolbar">
        <button className="btn btn-purple" onClick={handleDecode}>🔓 {t('jwt.decode')}</button>
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>{t('jwt.input')}</span></div>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t('jwt.placeholder')} spellCheck={false} />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>{t('jwt.result')}</span></div>
          <div className="output-area">{result || <span className="output-hint">{t('jwt.hint')}</span>}</div>
        </div>
      </div>

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>About JWT Decoding</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>🔓 This tool decodes the <strong>header</strong> and <strong>payload</strong> of a JWT token. The signature is not verified — this is for inspection and debugging only.</p>
          <p style={{ marginTop: '8px' }}><strong>JWT structure:</strong> <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>header.payload.signature</code></p>
          <p style={{ marginTop: '8px' }}>⚠️ <strong>Security note:</strong> All decoding happens in your browser. Your JWT tokens are never sent to any server.</p>
        </div>
      </section>
    </>
  )
}
