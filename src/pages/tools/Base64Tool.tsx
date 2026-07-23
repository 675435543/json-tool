import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

type Mode = 'encode' | 'decode'

export default function Base64Tool() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleConvert = () => {
    const trimmed = input.trim()
    if (!trimmed) { setOutput(''); setError(''); return }
    setError('')
    try {
      if (mode === 'encode') {
        setOutput(btoa(trimmed))
      } else {
        try {
          setOutput(atob(trimmed))
        } catch {
          setError(t('base64.invalid_input') || 'Invalid Base64 input')
          setOutput('')
        }
      }
    } catch (e: any) {
      setError(e.message || 'Error processing input')
      setOutput('')
    }
  }

  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
    } catch { /* ignore */ }
  }

  const handleFileEncode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      setInput(base64)
      setOutput(btoa(base64))
    }
    reader.readAsDataURL(file)
  }

  const switchMode = (newMode: Mode) => {
    setMode(newMode)
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <>
      <SEO
        title="Base64 Encode Decode - Free Online Base64 Converter"
        description="Free online Base64 encoder and decoder. Encode text to Base64 or decode Base64 to text. Also supports file to Base64 conversion. 100% client-side, private."
        keywords="Base64 encode, Base64 decode, Base64 converter, Base64 online, Base64 encoder decoder, file to Base64"
        canonicalPath="/base64-encode-decode"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      <div className="diff-toolbar">
        <div className="diff-toolbar-group" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button
            className={`btn ${mode === 'encode' ? 'btn-purple' : 'btn-outline'}`}
            onClick={() => switchMode('encode')}
          >🔒 {t('base64.encode') || 'Encode'}</button>
          <button
            className={`btn ${mode === 'decode' ? 'btn-purple' : 'btn-outline'}`}
            onClick={() => switchMode('decode')}
          >🔓 {t('base64.decode') || 'Decode'}</button>
        </div>
        <button className="btn btn-purple" onClick={handleConvert}>▶ {t('base64.convert') || 'Convert'}</button>
        <button className="btn btn-purple" onClick={handleCopy} disabled={!output}>📋 {t('base64.copy') || 'Copy'}</button>
      </div>

      <div className="editor-area" style={{ height: '300px' }}>
        <div className="editor-panel">
          <div className="panel-header">
            <span>{mode === 'encode' ? '📝 Input Text' : '🔐 Input Base64'}</span>
            {mode === 'encode' && (
              <label className="action-link" style={{ cursor: 'pointer', fontSize: '13px' }}>
                📁 Upload File
                <input type="file" accept="*" style={{ display: 'none' }} onChange={handleFileEncode} />
              </label>
            )}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...\nOr upload a file using the link above.' : 'Enter Base64 string to decode...'}
            spellCheck={false}
          />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>{mode === 'encode' ? '🔐 Base64 Output' : '📝 Decoded Text'}</span></div>
          <div className="output-area">
            {error && <span style={{ color: 'var(--danger)' }}>{error}</span>}
            {!error && (output || <span className="output-hint">{t('base64.hint') || 'Click Convert to see result'}</span>)}
          </div>
        </div>
      </div>

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>About Base64 Encoding</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>🔒 <strong>Encode</strong> converts plain text or file data to Base64 format. Useful for embedding binary data in text contexts like JSON, HTML, or URLs.</p>
          <p style={{ marginTop: '8px' }}>🔓 <strong>Decode</strong> converts Base64 strings back to readable text.</p>
          <p style={{ marginTop: '8px' }}>📁 <strong>File to Base64:</strong> Upload any file (image, PDF, etc.) to get its Base64 representation.</p>
          <p style={{ marginTop: '8px' }}>🔒 <strong>Privacy:</strong> All processing is 100% client-side. Your data never leaves your browser.</p>
        </div>
      </section>
    </>
  )
}
