import { useState, useCallback, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'

// ============ JSON → Java POJO ============

function toPascalCase(s: string): string {
  return s.replace(/[^a-zA-Z0-9_]/g, '_').replace(/(?:^|_)(\w)/g, (_, c) => c.toUpperCase())
}

function javaType(val: any, depth: number): string {
  if (val === null || val === undefined) return 'Object'
  if (typeof val === 'string') return 'String'
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double'
  if (typeof val === 'boolean') return 'boolean'
  if (Array.isArray(val)) {
    if (val.length === 0) return 'List<Object>'
    const inner = val.map(v => javaType(v, depth))
    const innerType = inner.every(t => t === inner[0]) ? inner[0] : 'Object'
    return `List<${innerType}>`
  }
  if (typeof val === 'object') return `Inner${toPascalCase('')}`
  return 'Object'
}

function generateJavaClass(obj: Record<string, any>, className: string): string {
  const lines: string[] = []
  const innerClasses: string[] = []

  lines.push(`public class ${className} {`)

  for (const [key, val] of Object.entries(obj)) {
    const fieldName = key.replace(/[^a-zA-Z0-9_]/g, '_')
    const capName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    let type: string

    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      const innerName = `${className}${toPascalCase(fieldName)}`
      type = innerName
      innerClasses.push(generateJavaClass(val, innerName))
    } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
      const innerName = `${className}${toPascalCase(fieldName)}Item`
      type = `List<${innerName}>`
      innerClasses.push(generateJavaClass(val[0], innerName))
    } else {
      type = javaType(val, 0)
    }

    lines.push(``)
    lines.push(`    private ${type} ${fieldName};`)
    lines.push(``)
    lines.push(`    public ${type} get${capName}() {`)
    lines.push(`        return ${fieldName};`)
    lines.push(`    }`)
    lines.push(``)
    lines.push(`    public void set${capName}(${type} ${fieldName}) {`)
    lines.push(`        this.${fieldName} = ${fieldName};`)
    lines.push(`    }`)
  }

  lines.push(`}`)
  lines.push(``)
  lines.push(...innerClasses)

  return lines.join('\n')
}

// ============ JSON Diff ============

interface DiffEntry {
  path: string
  type: 'added' | 'removed' | 'modified'
  a?: string
  b?: string
}

function diffJSON(a: any, b: any, path = ''): DiffEntry[] {
  const result: DiffEntry[] = []

  if (a === b) return result

  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b) || a === null || b === null) {
    result.push({ path, type: 'modified', a: JSON.stringify(a), b: JSON.stringify(b) })
    return result
  }

  if (typeof a === 'object') {
    if (Array.isArray(a) && Array.isArray(b)) {
      const maxLen = Math.max(a.length, b.length)
      for (let i = 0; i < maxLen; i++) {
        const p = `${path}[${i}]`
        if (i >= a.length) {
          result.push({ path: p, type: 'added', b: JSON.stringify(b[i]) })
        } else if (i >= b.length) {
          result.push({ path: p, type: 'removed', a: JSON.stringify(a[i]) })
        } else {
          result.push(...diffJSON(a[i], b[i], p))
        }
      }
    } else {
      const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])
      for (const key of allKeys) {
        const p = path ? `${path}.${key}` : key
        if (!(key in a)) {
          result.push({ path: p, type: 'added', b: JSON.stringify(b[key]) })
        } else if (!(key in b)) {
          result.push({ path: p, type: 'removed', a: JSON.stringify(a[key]) })
        } else {
          result.push(...diffJSON(a[key], b[key], p))
        }
      }
    }
  } else {
    result.push({ path, type: 'modified', a: String(a), b: String(b) })
  }

  return result
}

// ============ Language flags ============

const LANG_OPTIONS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
]

// ============ App Component ============

function App() {
  const { t, i18n } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [errorInfo, setErrorInfo] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [lineCount, setLineCount] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [mode, setMode] = useState<'normal' | 'diff'>('normal')
  const [diffA, setDiffA] = useState('')
  const [diffB, setDiffB] = useState('')
  const [diffResult, setDiffResult] = useState<DiffEntry[] | null>(null)
  const [langOpen, setLangOpen] = useState(false)

  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const langRef = useRef<HTMLDivElement>(null)

  // ========== Toast ==========

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ type, msg })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const updateStats = useCallback((text: string) => {
    setCharCount(text.length)
    setLineCount(text ? text.split('\n').length : 0)
  }, [])

  // ========== Error parsing ==========

  const parseError = useCallback((e: any, jsonStr: string): string => {
    const msg = (e as Error).message || ''
    const match = msg.match(/position\s+(\d+)/)
    if (match) {
      const pos = parseInt(match[1])
      const before = jsonStr.slice(0, pos)
      const line = before.split('\n').length
      const lastNewline = before.lastIndexOf('\n')
      const col = pos - lastNewline
      const cleanMsg = msg.replace(/^.*?position\s+\d+\s*/g, '')
      return t('error.position', { line, col, msg: cleanMsg })
    }
    return t('error.parse', { msg })
  }, [t])

  // ========== File upload ==========

  const readFile = useCallback((file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      showToast('error', t('toast.file.only_json', { file: file.name }))
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setInput(text)
      updateStats(text)
      setErrorInfo('')
      showToast('success', t('toast.file.loaded', { file: file.name }))
    }
    reader.onerror = () => showToast('error', t('toast.file.read_failed'))
    reader.readAsText(file)
  }, [updateStats, showToast, t])

  const handleDragOver = useCallback((e: DragEvent) => { e.preventDefault(); setDragOver(true) }, [])
  const handleDragLeave = useCallback((e: DragEvent) => { e.preventDefault(); setDragOver(false) }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault(); setDragOver(false)
    if (e.dataTransfer.files.length > 0) readFile(e.dataTransfer.files[0])
  }, [readFile])

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) readFile(e.target.files[0])
    e.target.value = ''
  }, [readFile])

  const handleClickUpload = useCallback(() => fileInputRef.current?.click(), [])

  // ========== Basic operations ==========

  const tryParseJSON = useCallback((trimmed: string): any | null => {
    try { return JSON.parse(trimmed) } catch { return null }
  }, [])

  const doFormat = useCallback((indent: number) => {
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    try {
      const parsed = JSON.parse(trimmed)
      const formatted = JSON.stringify(parsed, null, indent)
      setOutput(formatted)
      setErrorInfo('')
      const label = indent > 0 ? t('toast.formatted', { indent: `${indent} spaces` }) : t('toast.compacted')
      showToast('success', label)
      updateStats(formatted)
    } catch (e: any) {
      const errMsg = parseError(e, trimmed)
      setErrorInfo(errMsg)
      showToast('error', errMsg)
    }
  }, [input, parseError, showToast, updateStats, t])

  const handleBeautify = useCallback(() => doFormat(2), [doFormat])
  const handleCompact = useCallback(() => doFormat(0), [doFormat])
  const handleFormat4 = useCallback(() => doFormat(4), [doFormat])

  const handleValidate = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    try {
      JSON.parse(trimmed)
      setErrorInfo('')
      showToast('success', t('toast.valid'))
    } catch (e: any) {
      const errMsg = parseError(e, trimmed)
      setErrorInfo(errMsg)
      showToast('error', errMsg)
    }
  }, [input, parseError, showToast, t])

  // ========== JSON to CSV ==========

  const jsonToCSV = useCallback((data: any): string | null => {
    const arr = Array.isArray(data) ? data : [data]
    if (arr.length === 0) return null
    const first = arr[0]
    if (typeof first !== 'object' || first === null) return null
    const headers = Object.keys(first)
    const escapeCSV = (val: any): string => {
      const s = val === null || val === undefined ? '' : String(val)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
      return s
    }
    const rows = arr.map((item: any) => headers.map(h => escapeCSV(item[h])).join(','))
    return [headers.join(','), ...rows].join('\n')
  }, [])

  const handleToCSV = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    const parsed = tryParseJSON(trimmed)
    if (!parsed) { showToast('error', t('toast.invalid')); return }
    const csv = jsonToCSV(parsed)
    if (!csv) { showToast('error', t('toast.csv_fail')); return }
    setOutput(csv)
    setErrorInfo('')
    showToast('success', t('toast.converted_csv'))
    updateStats(csv)
  }, [input, tryParseJSON, jsonToCSV, showToast, updateStats, t])

  const handleEscape = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    try {
      const parsed = JSON.parse(trimmed)
      const str = JSON.stringify(parsed)
      const escaped = str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
      setOutput(escaped)
      setErrorInfo('')
      showToast('success', t('toast.escaped'))
      updateStats(escaped)
    } catch (e: any) {
      const errMsg = parseError(e, trimmed)
      setErrorInfo(errMsg)
      showToast('error', errMsg)
    }
  }, [input, parseError, showToast, updateStats, t])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setToast(null)
    setErrorInfo('')
    setCharCount(0)
    setLineCount(0)
  }, [])

  const handleCopy = useCallback(() => {
    const text = output || input
    if (!text) { showToast('error', t('toast.no_content')); return }
    navigator.clipboard.writeText(text).then(
      () => showToast('success', t('toast.copied')),
      () => showToast('error', t('toast.copy_fail'))
    )
  }, [output, input, showToast, t])

  const handleSwap = useCallback(() => {
    if (!output) { showToast('error', t('toast.swap_empty')); return }
    setInput(output)
    setOutput('')
    setErrorInfo('')
    updateStats(output)
  }, [output, updateStats, showToast, t])

  // ========== JSON → Java POJO ==========

  const handleToJavaPOJO = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    const parsed = tryParseJSON(trimmed)
    if (!parsed) { showToast('error', t('toast.invalid')); return }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      showToast('error', t('toast.java_pojo_fail'))
      return
    }
    const className = 'JsonRoot'
    const pojo = generateJavaClass(parsed, className)
    setOutput(pojo)
    setErrorInfo('')
    showToast('success', t('toast.java_pojo'))
    updateStats(pojo)
  }, [input, tryParseJSON, showToast, updateStats, t])

  // ========== JSON Diff ==========

  const handleDiffCompare = useCallback(() => {
    const ta = diffA.trim()
    const tb = diffB.trim()
    if (!ta && !tb) { showToast('error', t('toast.diff_empty')); return }

    const pa = tryParseJSON(ta)
    const pb = tryParseJSON(tb)

    if (!pa) { showToast('error', t('toast.no_diff_a')); return }
    if (!pb) { showToast('error', t('toast.no_diff_b')); return }

    const result = diffJSON(pa, pb)
    setDiffResult(result)
  }, [diffA, diffB, tryParseJSON, showToast, t])

  const handleDiffMode = useCallback(() => {
    setMode('diff')
    setOutput('')
    setErrorInfo('')
  }, [])

  const handleExitDiff = useCallback(() => {
    setMode('normal')
    setDiffResult(null)
    setDiffA('')
    setDiffB('')
  }, [])

  // ========== Input change ==========

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInput(val)
    updateStats(val)
    setErrorInfo('')
  }, [updateStats])

  // ========== Language ==========

  const switchLang = useCallback((code: string) => {
    i18n.changeLanguage(code)
    setLangOpen(false)
    // RTL for Arabic
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
  }, [i18n])

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [])

  // ========== Render ==========

  const currentLang = LANG_OPTIONS.find(l => l.code === i18n.language) || LANG_OPTIONS[0]

  return (
    <div className={`container ${i18n.language === 'ar' ? 'rtl' : ''}`}>
      <header>
        <div className="header-top">
          <h1>🔧 {t('app.title')}</h1>
          <div className="lang-switcher" ref={langRef}>
            <button className="lang-btn" onClick={() => setLangOpen(!langOpen)}>
              {currentLang.flag} {currentLang.label} ▾
            </button>
            {langOpen && (
              <div className="lang-dropdown">
                {LANG_OPTIONS.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-option ${lang.code === i18n.language ? 'active' : ''}`}
                    onClick={() => switchLang(lang.code)}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="subtitle">{t('app.subtitle')}</p>
      </header>

      <div className={`toast ${toast ? toast.type : ''} ${toast ? 'show' : ''}`}>
        {toast?.msg || ''}
      </div>

      {/* Toolbar — only in normal mode */}
      {mode === 'normal' && (
        <div className="toolbar">
          <div className="toolbar-group">
            <button className="btn btn-primary" onClick={handleBeautify}>{t('btn.beautify2')}</button>
            <button className="btn btn-primary" onClick={handleFormat4}>{t('btn.beautify4')}</button>
            <button className="btn btn-success" onClick={handleCompact}>{t('btn.minify')}</button>
            <button className="btn btn-warning" onClick={handleValidate}>{t('btn.validate')}</button>
          </div>
          <div className="toolbar-group">
            <button className="btn btn-purple" onClick={handleToCSV}>{t('btn.to_csv')}</button>
            <button className="btn btn-outline" onClick={handleEscape}>{t('btn.escape')}</button>
            <button className="btn btn-purple" onClick={handleToJavaPOJO}>{t('btn.java_pojo')}</button>
            <button className="btn btn-purple" onClick={handleDiffMode}>{t('btn.diff')}</button>
          </div>
          <div className="toolbar-group">
            <button className="btn btn-outline" onClick={handleSwap}>{t('btn.swap')}</button>
            <button className="btn btn-outline" onClick={handleCopy}>{t('btn.copy')}</button>
            <button className="btn btn-danger" onClick={handleClear}>{t('btn.clear')}</button>
          </div>
        </div>
      )}

      {/* Upload zone — normal mode only */}
      {mode === 'normal' && (
        <div
          className={`upload-zone ${dragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickUpload}
        >
          <div className="file-icon">📂</div>
          <p>{dragOver ? t('upload.dragover') : t('upload.title')}</p>
          <input ref={fileInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleFileSelect} />
        </div>
      )}

      {/* ===== Normal mode: Input / Output ===== */}
      {mode === 'normal' && (
        <div className="editor-area">
          <div className="editor-panel">
            <div className="panel-header">
              <span>{t('panel.input')}</span>
              <span className="action-link" onClick={() => textareaRef.current?.focus()}>
                {t('panel.input')}
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder={t('textarea.placeholder')}
              spellCheck={false}
            />
          </div>

          <div className="editor-panel">
            <div className="panel-header">
              <span>{t('panel.output')}</span>
              <span className="action-link" onClick={handleCopy}>{t('btn.copy')}</span>
            </div>
            <div className="output-area">
              {output || <span className="output-hint">{t('textarea.output_hint')}</span>}
            </div>
            {errorInfo && <div className="error-lines show">{errorInfo}</div>}
          </div>
        </div>
      )}

      {/* ===== Diff mode ===== */}
      {mode === 'diff' && (
        <div className="diff-section">
          <div className="diff-toolbar">
            <button className="btn btn-outline" onClick={handleExitDiff}>
              {t('diff.btn_back')}
            </button>
            <button className="btn btn-purple diff-compare-btn" onClick={handleDiffCompare}>
              🔍 {t('diff.compare')}
            </button>
          </div>

          <div className="editor-area">
            <div className="editor-panel">
              <div className="panel-header">
                <span>{t('panel.json_a')}</span>
              </div>
              <textarea
                value={diffA}
                onChange={e => setDiffA(e.target.value)}
                placeholder={t('textarea.placeholder')}
                spellCheck={false}
              />
            </div>
            <div className="editor-panel">
              <div className="panel-header">
                <span>{t('panel.json_b')}</span>
              </div>
              <textarea
                value={diffB}
                onChange={e => setDiffB(e.target.value)}
                placeholder={t('textarea.placeholder')}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Diff result */}
          {diffResult !== null && (
            <div className="diff-result">
              {diffResult.length === 0 ? (
                <div className="diff-same">{t('diff.same')}</div>
              ) : (
                <div className="diff-entries">
                  <div className="diff-summary">
                    {diffResult.filter(d => d.type === 'added').length} {t('diff.added')} ·{' '}
                    {diffResult.filter(d => d.type === 'removed').length} {t('diff.removed')} ·{' '}
                    {diffResult.filter(d => d.type === 'modified').length} {t('diff.modified')}
                  </div>
                  {diffResult.map((d, i) => (
                    <div key={i} className={`diff-entry diff-${d.type}`}>
                      <div className="diff-path">{d.type === 'added' ? '+' : d.type === 'removed' ? '−' : '∼'} {d.path}</div>
                      <div className="diff-value">
                        {d.a !== undefined && <div className="diff-a">- {d.a}</div>}
                        {d.b !== undefined && <div className="diff-b">+ {d.b}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {mode === 'normal' && (
        <div className="stats-bar">
          <span>📊 {t('stats.chars')}: {charCount}</span>
          <span>📝 {t('stats.lines')}: {lineCount}</span>
          <span>⚡ {t('stats.pure_frontend')}</span>
        </div>
      )}

      <footer>
        {t('footer.text', { year: new Date().getFullYear() })}
      </footer>
    </div>
  )
}

export default App
