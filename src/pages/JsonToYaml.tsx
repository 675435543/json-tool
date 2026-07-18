import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SeoHead from '../components/SeoHead'
import JsonEditor from '../components/JsonEditor'
import { tryParseJSON, jsonToYaml } from '../utils/json'
import { Link } from 'react-router-dom'

export default function JsonToYaml() {
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
    const yaml = jsonToYaml(parsed, 0)
    setOutput(yaml)
    setErrorInfo('')
  }

  return (
    <div className="container">
      <SeoHead title="JSON to YAML" description="Convert JSON data to YAML format instantly" canonicalPath="/json-to-yaml" />
      <header>
        <div className="tool-header">
          <Link to="/" className="back-link">← Back to JSON Tools</Link>
          <h1>📄 JSON to YAML</h1>
          <p className="subtitle">Convert JSON data to YAML format instantly</p>
        </div>
      </header>
      <div className="toolbar">
        <Link to="/" className="btn btn-outline">{t('btn.back')}</Link>
        <button className="btn btn-primary" onClick={handleConvert}>📄 Convert to YAML</button>
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
