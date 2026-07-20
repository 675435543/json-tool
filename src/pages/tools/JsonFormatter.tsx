import { useState, useCallback, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { tryParseJSON, parseError, jsonToCSV, generateJavaClass, generateTSInterfaces } from '../../lib/utils'
import { codegenLanguages, sqlDialects, type CodegenEntry } from '../../codegen'
import { useKeyboardShortcuts } from '../../lib/useShortcuts'
import TreeView from '../../TreeView'

export default function JsonFormatter() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null)
  const [errorInfo, setErrorInfo] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [lineCount, setLineCount] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [viewMode, setViewMode] = useState<'text' | 'tree'>('text')
  const [generatedLang, setGeneratedLang] = useState('')
  const [codegenOpen, setCodegenOpen] = useState(false)
  const [sqlOpen, setSqlOpen] = useState(false)
  const [encodeOpen, setEncodeOpen] = useState(false)

  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const codegenRef = useRef<HTMLDivElement>(null)
  const sqlRef = useRef<HTMLDivElement>(null)
  const encodeRef = useRef<HTMLDivElement>(null)

  const updateStats = (text: string) => { setCharCount(text.length); setLineCount(text ? text.split('\n').length : 0) }

  const showToast = useCallback((type: 'success' | 'error' | 'info', msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ type, msg })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const readFile = useCallback((file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      showToast('error', t('toast.file.only_json', { file: file.name })); return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setInput(text); updateStats(text); setErrorInfo('')
      showToast('success', t('toast.file.loaded', { file: file.name }))
    }
    reader.onerror = () => showToast('error', t('toast.file.read_failed'))
    reader.readAsText(file)
  }, [showToast, t])

  const handleDragOver = useCallback((e: DragEvent) => { e.preventDefault(); setDragOver(true) }, [])
  const handleDragLeave = useCallback((e: DragEvent) => { e.preventDefault(); setDragOver(false) }, [])
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault(); setDragOver(false)
    if (e.dataTransfer.files.length > 0) readFile(e.dataTransfer.files[0])
  }, [readFile])
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) { readFile(e.target.files[0]); e.target.value = '' }
  }, [readFile])

  const doFormat = useCallback((indent: number) => {
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    try {
      const parsed = JSON.parse(trimmed)
      setOutput(JSON.stringify(parsed, null, indent)); setErrorInfo(''); setGeneratedLang('')
      showToast('success', indent > 0 ? t('toast.formatted', { indent: `${indent} spaces` }) : t('toast.compacted'))
      updateStats(JSON.stringify(parsed, null, indent))
    } catch (e: any) {
      const errMsg = parseError(e, trimmed, t); setErrorInfo(errMsg); showToast('error', errMsg)
    }
  }, [input, showToast, t])

  const handleValidate = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    try { JSON.parse(trimmed); setErrorInfo(''); showToast('success', t('toast.valid')) }
    catch (e: any) { setErrorInfo(parseError(e, trimmed, t)); showToast('error', parseError(e, trimmed, t)) }
  }, [input, showToast, t])

  const handleToCSV = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    const parsed = tryParseJSON(trimmed)
    if (!parsed) { showToast('error', t('toast.invalid')); return }
    const csv = jsonToCSV(parsed)
    if (!csv) { showToast('error', t('toast.csv_fail')); return }
    setOutput(csv); setErrorInfo(''); setGeneratedLang('')
    showToast('success', t('toast.converted_csv')); updateStats(csv)
  }, [input, showToast, t])

  const handleEscape = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    try {
      const parsed = JSON.parse(trimmed)
      const str = JSON.stringify(parsed)
      const escaped = str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
      setOutput(escaped); setErrorInfo(''); setGeneratedLang('')
      showToast('success', t('toast.escaped')); updateStats(escaped)
    } catch (e: any) { setErrorInfo(parseError(e, trimmed, t)); showToast('error', parseError(e, trimmed, t)) }
  }, [input, showToast, t])

  const handleToJava = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    const parsed = tryParseJSON(trimmed)
    if (!parsed) { showToast('error', t('toast.invalid')); return }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) { showToast('error', t('toast.java_pojo_fail')); return }
    const pojo = generateJavaClass(parsed, 'JsonRoot')
    setOutput(pojo); setErrorInfo(''); setGeneratedLang('')
    showToast('success', t('toast.java_pojo')); updateStats(pojo)
  }, [input, showToast, t])

  const handleToTS = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    const parsed = tryParseJSON(trimmed)
    if (!parsed) { showToast('error', t('toast.invalid')); return }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) { showToast('error', t('toast.ts_interface_fail')); return }
    setOutput(generateTSInterfaces(parsed, 'Root')); setErrorInfo(''); setGeneratedLang('')
    showToast('success', t('toast.ts_interface')); updateStats(generateTSInterfaces(parsed, 'Root'))
  }, [input, showToast, t])

  const handleCodegenSelect = useCallback((entry: CodegenEntry) => {
    setCodegenOpen(false); setSqlOpen(false)
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    let parsed: any
    try { parsed = JSON.parse(trimmed) } catch { showToast('error', t('toast.invalid')); return }
    if (typeof parsed !== 'object' || parsed === null) { showToast('error', t('toast.codegen_fail')); return }
    const generated = entry.generate(parsed, 'Root')
    setOutput(generated); setGeneratedLang(t(entry.labelKey)); setErrorInfo('')
    showToast('success', t('toast.codegen_success')); updateStats(generated)
  }, [input, showToast, t])

  const handleEncodeSelect = useCallback((type: string) => {
    setEncodeOpen(false)
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    try {
      let result: string
      switch (type) {
        case 'base64-encode': try { JSON.parse(trimmed) } catch { showToast('error', t('toast.invalid')); return }; result = btoa(trimmed); showToast('success', t('toast.base64_encoded')); break
        case 'base64-decode': result = atob(trimmed); try { JSON.parse(result) } catch { /* raw */ }; showToast('success', t('toast.base64_decoded')); break
        case 'uri-encode': result = encodeURI(trimmed); showToast('success', t('toast.uri_encoded')); break
        case 'uri-decode': result = decodeURI(trimmed); showToast('success', t('toast.uri_decoded')); break
        case 'uricomp-encode': result = encodeURIComponent(trimmed); showToast('success', t('toast.uri_encoded')); break
        case 'uricomp-decode': result = decodeURIComponent(trimmed); showToast('success', t('toast.uri_decoded')); break
        default: return
      }
      setOutput(result); setErrorInfo(''); setGeneratedLang(''); updateStats(result)
    } catch { showToast('error', t('toast.uri_fail')) }
  }, [input, showToast, t])

  const handleClear = () => { setInput(''); setOutput(''); setToast(null); setErrorInfo(''); setCharCount(0); setLineCount(0); setViewMode('text'); setGeneratedLang('') }
  const handleCopy = () => {
    const text = output || input
    if (!text) { showToast('error', t('toast.no_content')); return }
    navigator.clipboard.writeText(text).then(() => showToast('success', t('toast.copied')), () => showToast('error', t('toast.copy_fail')))
  }
  const handleSwap = () => {
    if (!output) { showToast('error', t('toast.swap_empty')); return }
    setInput(output); setOutput(''); setErrorInfo(''); setGeneratedLang(''); updateStats(output)
  }
  const toggleViewMode = useCallback(() => {
    if (viewMode === 'text') {
      if (!output.trim()) { showToast('error', t('toast.input.empty')); return }
      try { JSON.parse(output.trim()); setViewMode('tree') } catch { showToast('error', t('toast.invalid')) }
    } else setViewMode('text')
  }, [viewMode, output, showToast, t])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (codegenRef.current && !codegenRef.current.contains(e.target as Node)) setCodegenOpen(false)
      if (sqlRef.current && !sqlRef.current.contains(e.target as Node)) setSqlOpen(false)
      if (encodeRef.current && !encodeRef.current.contains(e.target as Node)) setEncodeOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { return () => { if (toastTimer.current) clearTimeout(toastTimer.current) } }, [])

  useKeyboardShortcuts([
    { key: 'Enter', ctrl: true, handler: () => doFormat(2) },
    { key: 'Enter', ctrl: true, shift: true, handler: () => doFormat(0) },
    { key: 'd', ctrl: true, handler: handleCopy },
    { key: 'l', ctrl: true, handler: handleClear },
  ])

  return (
    <>
      <SEO
        title="JSON Formatter Online - Beautify, Validate & Format JSON Free"
        description="Free online JSON Formatter: format, beautify, validate, minify JSON. Convert to CSV, Java POJO, TypeScript. 100% client-side, your data never leaves your browser."
        keywords="JSON formatter, JSON beautifier, JSON validator online, JSON minify, JSON format tool, JSON prettifier, online JSON editor"
        canonicalPath="/json-formatter"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      <div className={`toast ${toast ? toast.type : ''} ${toast ? 'show' : ''}`}>{toast?.msg ?? ''}</div>

      <div className="toolbar">
        <div className="toolbar-group">
          <button className="btn btn-primary" onClick={() => doFormat(2)}>{t('btn.beautify2')}</button>
          <button className="btn btn-primary" onClick={() => doFormat(4)}>{t('btn.beautify4')}</button>
          <button className="btn btn-success" onClick={() => doFormat(0)}>{t('btn.minify')}</button>
          <button className="btn btn-warning" onClick={handleValidate}>{t('btn.validate')}</button>
        </div>
        <div className="toolbar-group">
          <button className="btn btn-purple" onClick={handleToCSV}>{t('btn.to_csv')}</button>
          <button className="btn btn-outline" onClick={handleEscape}>{t('btn.escape')}</button>
          <div className="codegen-wrap" ref={encodeRef}>
            <button className="btn btn-purple" onClick={() => setEncodeOpen(!encodeOpen)}>{t('btn.encode_decode')} ▾</button>
            {encodeOpen && (
              <div className="codegen-dropdown">
                <button className="codegen-option" onClick={() => handleEncodeSelect('base64-encode')}>{t('encode.base64_encode')}</button>
                <button className="codegen-option" onClick={() => handleEncodeSelect('base64-decode')}>{t('encode.base64_decode')}</button>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                <button className="codegen-option" onClick={() => handleEncodeSelect('uri-encode')}>{t('encode.uri_encode')}</button>
                <button className="codegen-option" onClick={() => handleEncodeSelect('uri-decode')}>{t('encode.uri_decode')}</button>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                <button className="codegen-option" onClick={() => handleEncodeSelect('uricomp-encode')}>{t('encode.uricomp_encode')}</button>
                <button className="codegen-option" onClick={() => handleEncodeSelect('uricomp-decode')}>{t('encode.uricomp_decode')}</button>
              </div>
            )}
          </div>
          <button className="btn btn-purple" onClick={handleToJava}>{t('btn.java_pojo')}</button>
          <button className="btn btn-purple" onClick={handleToTS}>{t('btn.to_typescript')}</button>
          <div className="codegen-wrap" ref={codegenRef}>
            <button className="btn btn-purple" onClick={() => setCodegenOpen(!codegenOpen)}>{t('btn.to_other_code')} ▾</button>
            {codegenOpen && (
              <div className="codegen-dropdown">
                {codegenLanguages.map(lang => <button key={lang.id} className="codegen-option" onClick={() => handleCodegenSelect(lang)}>{t(lang.labelKey)}</button>)}
              </div>
            )}
          </div>
          <div className="codegen-wrap" ref={sqlRef}>
            <button className="btn btn-purple" onClick={() => setSqlOpen(!sqlOpen)}>{t('btn.to_sql')} ▾</button>
            {sqlOpen && (
              <div className="codegen-dropdown">
                {sqlDialects.map(d => <button key={d.id} className="codegen-option" onClick={() => handleCodegenSelect(d)}>{t(d.labelKey)}</button>)}
              </div>
            )}
          </div>
        </div>
        <div className="toolbar-group">
          <button className="btn btn-outline" onClick={handleSwap}>{t('btn.swap')}</button>
          <button className="btn btn-outline" onClick={handleCopy}>{t('btn.copy')}</button>
          <button className="btn btn-danger" onClick={handleClear}>{t('btn.clear')}</button>
        </div>
      </div>

      <div className={`upload-zone ${dragOver ? 'dragover' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
        <div className="file-icon">📂</div>
        <p>{dragOver ? t('upload.dragover') : t('upload.title')}</p>
        <input ref={fileInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleFileSelect} />
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>{t('panel.input')}</span><span className="action-link" onClick={() => textareaRef.current?.focus()}>{t('panel.input')}</span></div>
          <textarea ref={textareaRef} value={input} onChange={e => { setInput(e.target.value); updateStats(e.target.value); setErrorInfo('') }} placeholder={t('textarea.placeholder')} spellCheck={false} />
        </div>
        <div className="editor-panel">
          <div className="panel-header">
            <span>{t('panel.output')}</span>
            <div className="panel-header-right">
              {generatedLang && <span className="lang-tag">{generatedLang}</span>}
              {output && (() => { try { JSON.parse(output.trim()); return true } catch { return false } })() && (
                <span className={`view-toggle ${viewMode === 'tree' ? 'active' : ''}`} onClick={toggleViewMode}>{viewMode === 'text' ? '🌳 Tree' : '📄 Text'}</span>
              )}
              <span className="action-link" onClick={handleCopy}>{t('btn.copy')}</span>
            </div>
          </div>
          <div className="output-area">
            {output ? (viewMode === 'tree' ? <TreeView data={(() => { try { return JSON.parse(output.trim()) } catch { return null } })()} /> : output) : <span className="output-hint">{t('textarea.output_hint')}</span>}
          </div>
          {errorInfo && <div className="error-lines show">{errorInfo}</div>}
        </div>
      </div>

      <div className="stats-bar">
        <span>📊 {t('stats.chars')}: {charCount}</span>
        <span>📝 {t('stats.lines')}: {lineCount}</span>
        <span>⚡ {t('stats.pure_frontend')}</span>
      </div>

      <section style={{ marginTop: '40px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--text-heading)' }}>JSON Formatter — Complete Guide</h2>

        <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-heading)' }}>① What is a JSON Formatter?</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          A JSON Formatter is a tool that takes raw, minified, or poorly structured JSON and transforms it into clean, properly indented, human-readable format. It adds consistent line breaks, spacing, and indentation so you can easily read, debug, and understand JSON data. Think of it as "prettifying" ugly code — turning <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{`{"a":1,"b":2}`}</code> into a beautifully structured document.
        </p>

        <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-heading)' }}>② Why Format JSON?</h3>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          <p>✅ <strong>Read API responses</strong> — Most APIs return minified JSON. Formatting makes responses instantly readable.</p>
          <p>✅ <strong>Debug errors</strong> — Spot missing commas, invalid quotes, and structure issues at a glance.</p>
          <p>✅ <strong>Code review</strong> — Formatted JSON is much easier to review in pull requests and documentation.</p>
          <p>✅ <strong>Share examples</strong> — Clean, formatted JSON is professional and easy for teammates to understand.</p>
          <p>✅ <strong>Learn JSON</strong> — Seeing well-formatted JSON helps beginners understand the structure.</p>
        </div>

        <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-heading)' }}>③ How to Format JSON Online</h3>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          <p>1. <strong>Paste</strong> your JSON into the input panel above</p>
          <p>2. Click <strong>Format (2)</strong> for 2-space indentation or <strong>Format (4)</strong> for 4-space</p>
          <p>3. Your formatted JSON appears instantly in the output panel</p>
          <p>4. Click <strong>Copy</strong> to copy the formatted result, or <strong>Swap</strong> to continue editing</p>
          <p>💡 You can also drag & drop a .json file, or upload one with the file picker above.</p>
        </div>

        <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-heading)' }}>④ JSON Beautify vs JSON Minify — What's the Difference?</h3>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          <p><strong>Format/Beautify</strong> adds whitespace, indentation, and line breaks. It makes JSON larger but readable. Use this during <strong>development</strong>.</p>
          <p><strong>Minify/Compress</strong> removes ALL unnecessary whitespace, creating the smallest possible file. Use this for <strong>production</strong> to reduce bandwidth and improve load times.</p>
          <p style={{ marginTop: '8px' }}>Need to compress? Try our dedicated <Link to="/json-compressor" style={{ color: 'var(--text-link)' }}>JSON Compressor →</Link></p>
          <p>Need to validate? Try our <Link to="/json-validator" style={{ color: 'var(--text-link)' }}>JSON Validator →</Link></p>
        </div>

        <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-heading)' }}>⑤ Supported Features</h3>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          <p>✨ <strong>Multiple indent styles</strong> — Choose 2-space or 4-space indentation</p>
          <p>✨ <strong>Syntax error detection</strong> — Invalid JSON is caught instantly with line & column info</p>
          <p>✨ <strong>Tree view</strong> — Toggle between text and interactive tree view for nested data</p>
          <p>✨ <strong>Code generation</strong> — Convert JSON to Java POJO, TypeScript, Python, Go, C#, Rust, Kotlin, PHP, Ruby, Swift, Scala, Groovy, C, C++, and SQL (MySQL, Oracle, SQLite)</p>
          <p>✨ <strong>Encode/Decode</strong> — Base64 encode/decode, URI encode/decode, URIComponent encode/decode</p>
          <p>✨ <strong>File upload & drag-drop</strong> — Load .json files directly</p>
          <p>✨ <strong>Swap input/output</strong> — Edit formatted JSON and reformat with one click</p>
          <p>✨ <strong>Dark & Light theme</strong> — Comfortable viewing in any environment</p>
        </div>

        <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-heading)' }}>⑥ FAQ</h3>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '12px' }}><strong>Q: Is my JSON data uploaded to a server?</strong><br/>
          A: No. JSON Tool Pro is 100% client-side. All processing happens in your browser. Your JSON never leaves your device.</p>

          <p style={{ marginBottom: '12px' }}><strong>Q: Is this JSON formatter free?</strong><br/>
          A: Yes, completely free. No sign-up required, no usage limits.</p>

          <p style={{ marginBottom: '12px' }}><strong>Q: Can I format very large JSON files?</strong><br/>
          A: Yes, but browser performance varies. Files up to a few megabytes work smoothly. For very large files, consider using a command-line tool like <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>jq</code>.</p>

          <p style={{ marginBottom: '12px' }}><strong>Q: Does the formatter change my JSON data?</strong><br/>
          A: No. Formatting only changes whitespace and indentation. Your actual data (keys, values, types, order) remains exactly the same.</p>

          <p style={{ marginBottom: '12px' }}><strong>Q: What's the difference between 2-space and 4-space indent?</strong><br/>
          A: It's purely visual preference. 2-space is more compact (common in JavaScript/Node.js projects). 4-space is slightly more readable (common in Python projects). Both produce valid JSON.</p>
        </div>
      </section>
    </>
  )
}
