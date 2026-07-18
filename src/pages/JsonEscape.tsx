import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SeoHead from '../components/SeoHead'
import JsonEditor from '../components/JsonEditor'
import { parseError } from '../utils/json'
import { Link } from 'react-router-dom'

export default function JsonEscape() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [errorInfo, setErrorInfo] = useState('')

  const handleCopy = () => {
    const text = output || input
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {}, () => {})
  }

  const handleEscape = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    try {
      const parsed = JSON.parse(trimmed)
      const str = JSON.stringify(parsed)
      const escaped = str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
      setOutput(escaped)
      setErrorInfo('')
    } catch (e: any) {
      setErrorInfo(parseError(e, trimmed, t))
    }
  }

  const handleUnescape = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    try {
      const unescaped = trimmed
        .replace(/\\\\/g, '\\')
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
      const parsed = JSON.parse(unescaped)
      setOutput(JSON.stringify(parsed, null, 2))
      setErrorInfo('')
    } catch (e: any) {
      setErrorInfo(parseError(e, trimmed, t))
    }
  }

  return (
    <div className="container">
      <SeoHead title="JSON Escape/Unescape" description="Escape or unescape JSON strings safely" canonicalPath="/json-escape" />
      <header>
        <div className="tool-header">
          <Link to="/" className="back-link">← Back to JSON Tools</Link>
          <h1>🔤 JSON Escape/Unescape</h1>
          <p className="subtitle">Escape or unescape JSON strings safely</p>
        </div>
      </header>
      <div className="toolbar">
        <Link to="/" className="btn btn-outline">{t('btn.back')}</Link>
        <button className="btn btn-primary" onClick={handleEscape}>🔤 Escape</button>
        <button className="btn btn-primary" onClick={handleUnescape}>🔓 Unescape</button>
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
