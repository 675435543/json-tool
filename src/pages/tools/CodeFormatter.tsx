import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

type Lang = 'javascript' | 'html' | 'css' | 'json'

const LANG_MAP: Record<Lang, string> = {
  javascript: 'JavaScript / TypeScript',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
}

export default function CodeFormatter() {
  const { t } = useTranslation()
  const [lang, setLang] = useState<Lang>('javascript')
  const [input, setInput] = useState(`function hello(name) {
  const greeting = "Hello, " + name + "!";
  if (name.length > 0) {
    console.log(greeting);
    return greeting;
  }
  return "Hello, World!";
}`)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [tabSize, setTabSize] = useState(2)
  const [beautify, setBeautify] = useState<any>(null)

  // Lazy-load js-beautify
  useEffect(() => {
    import('js-beautify').then(mod => setBeautify(mod))
  }, [])

  useEffect(() => {
    const trimmed = input.trim()
    if (!trimmed) { setOutput(''); return }

    const doFormat = () => {
      try {
        switch (lang) {
          case 'json': {
            try {
              setOutput(JSON.stringify(JSON.parse(trimmed), null, tabSize))
            } catch {
              setOutput('⚠️ Invalid JSON')
            }
            return
          }
          case 'javascript': {
            if (!beautify) { setOutput(trimmed); return }
            setOutput(beautify.js_beautify(trimmed, { indent_size: tabSize, preserve_newlines: true }) || trimmed)
            return
          }
          case 'html': {
            if (!beautify) { setOutput(trimmed); return }
            setOutput(beautify.html_beautify(trimmed, { indent_size: tabSize, indent_inner_html: true, extra_liners: [] }) || trimmed)
            return
          }
          case 'css': {
            if (!beautify) { setOutput(trimmed); return }
            setOutput(beautify.css_beautify(trimmed, { indent_size: tabSize }) || trimmed)
            return
          }
        }
      } catch {
        setOutput('⚠️ Formatting error')
      }
    }

    doFormat()
  }, [input, lang, tabSize, beautify])

  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
  }

  return (
    <>
      <SEO
        title="Code Formatter - Free Online JavaScript, HTML, CSS Formatter"
        description="Free online code formatter for JavaScript, HTML, CSS, and JSON. Beautify and format your code with customizable indentation. 100% client-side, no uploads."
        keywords="code formatter, JavaScript formatter, HTML formatter, CSS formatter, JSON formatter, code beautifier, online code formatter, indent code"
        canonicalPath="/code-formatter"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      {/* Language & Options */}
      <div className="diff-toolbar">
        <div className="diff-toolbar-group" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {(Object.entries(LANG_MAP) as [Lang, string][]).map(([key, label]) => (
            <button
              key={key}
              className={`btn ${lang === key ? 'btn-purple' : 'btn-outline'}`}
              onClick={() => setLang(key)}
            >{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {t('codefmt.tab_size') || 'Tab Size'}:
          </label>
          <select
            value={tabSize}
            onChange={e => setTabSize(Number(e.target.value))}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '13px',
            }}
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={8}>8</option>
          </select>
        </div>
        <button className="btn btn-purple" onClick={handleCopy} disabled={!output}>
          {copied ? '✅ Copied!' : '📋 ' + (t('codefmt.copy') || 'Copy')}
        </button>
        <button className="btn btn-purple" onClick={handleClear}>🗑️ {t('codefmt.clear') || 'Clear'}</button>
      </div>

      <div className="editor-area" style={{ height: '60vh' }}>
        <div className="editor-panel">
          <div className="panel-header"><span>✏️ {t('codefmt.input') || 'Input Code'}</span></div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Paste your ${LANG_MAP[lang]} code here...`}
            spellCheck={false}
            style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace", fontSize: '13px' }}
          />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>✨ {t('codefmt.output') || 'Formatted Code'}</span></div>
          <div
            className="output-area"
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
              fontSize: '13px',
              lineHeight: '1.5',
              overflow: 'auto',
            }}
          >
            {output || <span className="output-hint">{t('codefmt.hint') || 'Enter code above to see formatted result'}</span>}
          </div>
        </div>
      </div>

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>About Code Formatting</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>✨ Clean, properly indented code is easier to read and debug. This tool beautifies your code with one click.</p>
          <p style={{ marginTop: '8px' }}><strong>Supported languages:</strong> JavaScript / TypeScript, HTML, CSS, and JSON.</p>
          <p style={{ marginTop: '8px' }}>📏 Customize the <strong>tab size</strong> (2, 4, or 8 spaces) to match your coding style.</p>
          <p style={{ marginTop: '8px' }}>🔒 100% client-side. Your code never leaves your browser. Powered by <strong>js-beautify</strong>.</p>
        </div>
      </section>
    </>
  )
}
