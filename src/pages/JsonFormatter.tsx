import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SeoHead from '../components/SeoHead'
import JsonEditor from '../components/JsonEditor'
import { parseError } from '../utils/json'
import { Link } from 'react-router-dom'

export default function JsonFormatter() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [errorInfo, setErrorInfo] = useState('')
  const [indent, setIndent] = useState<number>(2)

  const handleCopy = () => {
    const text = output || input
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {}, () => {})
  }

  const handleFormat = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    try {
      const parsed = JSON.parse(trimmed)
      const formatted = JSON.stringify(parsed, null, indent)
      setOutput(formatted)
      setErrorInfo('')
    } catch (e: any) {
      setErrorInfo(parseError(e, trimmed, t))
    }
  }

  return (
    <div className="container">
      <SeoHead title="JSON Formatter" description="Beautify and format JSON with customizable indentation" canonicalPath="/json-formatter" />
      <header>
        <div className="tool-header">
          <Link to="/" className="back-link">← Back to JSON Tools</Link>
          <h1>✨ JSON Formatter</h1>
          <p className="subtitle">Beautify and format JSON data with customizable indentation</p>
        </div>
      </header>
      <div className="toolbar">
        <Link to="/" className="btn btn-outline">{t('btn.back')}</Link>
        <div className="toolbar-group">
          <button className={`btn ${indent === 2 ? 'btn-primary' : 'btn-outline'}`} onClick={() => setIndent(2)}>2 Spaces</button>
          <button className={`btn ${indent === 4 ? 'btn-primary' : 'btn-outline'}`} onClick={() => setIndent(4)}>4 Spaces</button>
        </div>
        <button className="btn btn-primary" onClick={handleFormat}>✨ Format</button>
        <button className="btn btn-outline" onClick={handleCopy}>📋 {t('btn.copy')}</button>
      </div>
      <JsonEditor
        input={input} output={output} errorInfo={errorInfo}
        onInputChange={setInput} onCopy={handleCopy}
      />
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
