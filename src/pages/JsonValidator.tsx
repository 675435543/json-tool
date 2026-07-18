import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SeoHead from '../components/SeoHead'
import JsonEditor from '../components/JsonEditor'
import { parseError } from '../utils/json'
import { Link } from 'react-router-dom'

export default function JsonValidator() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [errorInfo, setErrorInfo] = useState('')

  const handleCopy = () => {
    const text = output || input
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {}, () => {})
  }

  const handleValidate = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    try {
      const parsed = JSON.parse(trimmed)
      const jsonStr = JSON.stringify(parsed, null, 2)
      const chars = jsonStr.length
      const lines = jsonStr.split('\n').length
      const type = Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' && parsed !== null ? 'Object' : typeof parsed
      setOutput(`Valid JSON ✅\n\nType: ${type}\nCharacters: ${chars}\nLines: ${lines}`)
      setErrorInfo('')
    } catch (e: any) {
      setErrorInfo(parseError(e, trimmed, t))
      setOutput('')
    }
  }

  return (
    <div className="container">
      <SeoHead title="JSON Validator" description="Validate JSON and get detailed statistics about your data" canonicalPath="/json-validator" />
      <header>
        <div className="tool-header">
          <Link to="/" className="back-link">← Back to JSON Tools</Link>
          <h1>✅ JSON Validator</h1>
          <p className="subtitle">Validate JSON and get detailed statistics about your data</p>
        </div>
      </header>
      <div className="toolbar">
        <Link to="/" className="btn btn-outline">{t('btn.back')}</Link>
        <button className="btn btn-primary" onClick={handleValidate}>✅ Validate</button>
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
