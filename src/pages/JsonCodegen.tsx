import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import SeoHead from '../components/SeoHead'
import JsonEditor from '../components/JsonEditor'
import { tryParseJSON } from '../utils/json'
import { codegenLanguages, sqlDialects, type CodegenEntry } from '../codegen'
import { Link } from 'react-router-dom'

export default function JsonCodegen() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [errorInfo, setErrorInfo] = useState('')
  const [generatedLang, setGeneratedLang] = useState('')
  const [langOpen, setLangOpen] = useState(false)
  const [sqlOpen, setSqlOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const sqlRef = useRef<HTMLDivElement>(null)

  const handleCopy = () => {
    const text = output || input
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {}, () => {})
  }

  const handleCodegenSelect = (entry: CodegenEntry) => {
    setLangOpen(false)
    setSqlOpen(false)
    const trimmed = input.trim()
    if (!trimmed) return
    const parsed = tryParseJSON(trimmed)
    if (!parsed) {
      setErrorInfo('Invalid JSON')
      return
    }
    if (typeof parsed !== 'object' || parsed === null) {
      setErrorInfo('Cannot convert: root must be an object')
      return
    }
    const generated = entry.generate(parsed, 'Root')
    setOutput(generated)
    setGeneratedLang(t(entry.labelKey))
    setErrorInfo('')
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
      if (sqlRef.current && !sqlRef.current.contains(e.target as Node)) setSqlOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="container">
      <SeoHead title="JSON Code Generator" description="Generate code in multiple languages from JSON" canonicalPath="/json-codegen" />
      <header>
        <div className="tool-header">
          <Link to="/" className="back-link">← Back to JSON Tools</Link>
          <h1>💻 JSON Code Generator</h1>
          <p className="subtitle">Generate code in multiple programming languages from JSON</p>
        </div>
      </header>
      <div className="toolbar">
        <Link to="/" className="btn btn-outline">{t('btn.back')}</Link>
        <div className="codegen-wrap" ref={langRef}>
          <button className="btn btn-purple" onClick={() => { setLangOpen(!langOpen); setSqlOpen(false) }}>
            {t('btn.to_other_code')} ▾
          </button>
          {langOpen && (
            <div className="codegen-dropdown">
              {codegenLanguages.map(lang => (
                <button
                  key={lang.id}
                  className="codegen-option"
                  onClick={() => handleCodegenSelect(lang)}
                >
                  {t(lang.labelKey)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="codegen-wrap" ref={sqlRef}>
          <button className="btn btn-purple" onClick={() => { setSqlOpen(!sqlOpen); setLangOpen(false) }}>
            {t('btn.to_sql')} ▾
          </button>
          {sqlOpen && (
            <div className="codegen-dropdown">
              {sqlDialects.map(dialect => (
                <button
                  key={dialect.id}
                  className="codegen-option"
                  onClick={() => handleCodegenSelect(dialect)}
                >
                  {t(dialect.labelKey)}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="btn btn-outline" onClick={handleCopy}>📋 {t('btn.copy')}</button>
      </div>
      <JsonEditor
        input={input} output={output} errorInfo={errorInfo}
        onInputChange={setInput} onCopy={handleCopy}
        generatedLang={generatedLang}
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
