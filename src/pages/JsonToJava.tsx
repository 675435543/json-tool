import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SeoHead from '../components/SeoHead'
import JsonEditor from '../components/JsonEditor'
import { tryParseJSON, generateJavaClass } from '../utils/json'
import { Link } from 'react-router-dom'

export default function JsonToJava() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [errorInfo, setErrorInfo] = useState('')

  const handleCopy = () => {
    const text = output || input
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {}, () => {})
  }

  const handleConvert = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const parsed = tryParseJSON(trimmed)
    if (!parsed) {
      setErrorInfo('Invalid JSON')
      return
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      setErrorInfo('Cannot convert: root must be an object (not an array)')
      return
    }
    const pojo = generateJavaClass(parsed, 'JsonRoot')
    setOutput(pojo)
    setErrorInfo('')
  }

  return (
    <div className="container">
      <SeoHead title="JSON to Java POJO" description="Generate Java POJO classes from JSON automatically" canonicalPath="/json-to-java" />
      <header>
        <div className="tool-header">
          <Link to="/" className="back-link">← Back to JSON Tools</Link>
          <h1>☕ JSON to Java POJO</h1>
          <p className="subtitle">Generate Java POJO classes from JSON automatically</p>
        </div>
      </header>
      <div className="toolbar">
        <Link to="/" className="btn btn-outline">{t('btn.back')}</Link>
        <button className="btn btn-primary" onClick={handleConvert}>☕ To Java POJO</button>
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
