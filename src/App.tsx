import { useState, useCallback, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { JSONPath } from 'jsonpath-plus'
import TreeView from './TreeView'
import { codegenLanguages, sqlDialects, type CodegenEntry } from './codegen'
import './App.css'

// ============ JSON → Java POJO ============

function toPascalCase(s: string): string {
  return s.replace(/[^a-zA-Z0-9_]/g, '_').replace(/(?:^|_)(\w)/g, (_, c) => c.toUpperCase())
}

function javaType(val: any): string {
  if (val === null || val === undefined) return 'Object'
  if (typeof val === 'string') return 'String'
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double'
  if (typeof val === 'boolean') return 'boolean'
  if (Array.isArray(val)) {
    if (val.length === 0) return 'List<Object>'
    const inner = val.map(v => javaType(v))
    const innerType = inner.every(t => t === inner[0]) ? inner[0] : 'Object'
    return `List<${innerType}>`
  }
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
      type = javaType(val)
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

// ============ JSON → TypeScript ============

function toTSName(key: string): string {
  const s = key.replace(/[^a-zA-Z0-9_]/g, '_')
  if (/^[0-9]/.test(s)) return `_${s}`
  return s
}

function tsType(val: any, seen: Set<any>): string {
  if (val === null || val === undefined) return 'any'
  if (typeof val === 'string') return 'string'
  if (typeof val === 'number') return 'number'
  if (typeof val === 'boolean') return 'boolean'
  if (Array.isArray(val)) {
    if (val.length === 0) return 'any[]'
    const inners = val.map(v => tsType(v, seen))
    const inner = inners.every(t => t === inners[0]) ? inners[0] : 'any'
    return `${inner}[]`
  }
  if (typeof val === 'object') {
    if (seen.has(val)) return 'any /* circular */'
    seen.add(val)
    const entries = Object.entries(val as Record<string, any>)
    if (entries.length === 0) return 'Record<string, any>'
    const props = entries.map(([k, v]) => `  ${toTSName(k)}: ${tsType(v, seen)};`)
    return `{\n${props.join('\n')}\n}`
  }
  return 'any'
}

function generateTSInterfaces(obj: Record<string, any>, name: string): string {
  const lines: string[] = []
  const used = new Set<string>()
  const seen = new Set<any>()

  function process(obj: any, name: string): string {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return tsType(obj, seen)
    const id = name
    if (used.has(id)) return id
    used.add(id)

    const props: string[] = []
    const children: { key: string; childName: string; val: any }[] = []

    for (const [key, val] of Object.entries(obj as Record<string, any>)) {
      const k = toTSName(key)
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        const childName = `${name}${toPascalCase(key)}`
        children.push({ key: k, childName, val })
        props.push(`  ${k}: ${childName};`)
      } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
        const childName = `${name}${toPascalCase(key)}Item`
        children.push({ key: k, childName, val: val[0] })
        props.push(`  ${k}: ${childName}[];`)
      } else {
        props.push(`  ${k}: ${tsType(val, new Set())};`)
      }
    }

    lines.push(`export interface ${name} {`)
    lines.push(props.join('\n'))
    lines.push('}')
    lines.push('')

    for (const child of children) {
      process(child.val, child.childName)
    }

    return name
  }

  process(obj, name)
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

// ============ Language options ============

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
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null)
  const [errorInfo, setErrorInfo] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [lineCount, setLineCount] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [mode, setMode] = useState<'normal' | 'diff' | 'jsonpath' | 'privacy' | 'contact' | 'jwt' | 'yaml' | 'generator'>('normal')
  const [viewMode, setViewMode] = useState<'text' | 'tree'>('text')
  const [generatedLang, setGeneratedLang] = useState('')
  const [diffA, setDiffA] = useState('')
  const [diffB, setDiffB] = useState('')
  const [diffResult, setDiffResult] = useState<DiffEntry[] | null>(null)
  const [jpExpr, setJpExpr] = useState('')
  const [jpResult, setJpResult] = useState<string>('')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const isLight = theme === 'light'

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', isLight)
    localStorage.setItem('theme', theme)
  }, [theme, isLight])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  const [langOpen, setLangOpen] = useState(false)
  const [codegenOpen, setCodegenOpen] = useState(false)
  const [sqlOpen, setSqlOpen] = useState(false)
  const [encodeOpen, setEncodeOpen] = useState(false)
  const [jwtInput, setJwtInput] = useState('')
  const [jwtResult, setJwtResult] = useState('')
  const [yamlInput, setYamlInput] = useState('')
  const [yamlResult, setYamlResult] = useState('')
  const [genCount, setGenCount] = useState(3)
  const [genResult, setGenResult] = useState('')

  const goHome = () => setMode('normal')

  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const langRef = useRef<HTMLDivElement>(null)
  const codegenRef = useRef<HTMLDivElement>(null)
  const sqlRef = useRef<HTMLDivElement>(null)
  const encodeRef = useRef<HTMLDivElement>(null)

  // ========== Toast ==========

  const showToast = useCallback((type: 'success' | 'error' | 'info', msg: string) => {
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
    setViewMode('text')
    setGeneratedLang('')
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
    const pojo = generateJavaClass(parsed, 'JsonRoot')
    setOutput(pojo)
    setErrorInfo('')
    showToast('success', t('toast.java_pojo'))
    updateStats(pojo)
  }, [input, tryParseJSON, showToast, updateStats, t])

  // ========== JSON → Other Code ==========

  const handleCodegenSelect = useCallback((entry: CodegenEntry) => {
    setCodegenOpen(false)
    setSqlOpen(false)
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    let parsed: any
    try { parsed = JSON.parse(trimmed) } catch { showToast('error', t('toast.invalid')); return }
    if (typeof parsed !== 'object' || parsed === null) {
      showToast('error', t('toast.codegen_fail'))
      return
    }
    const generated = entry.generate(parsed, 'Root')
    setOutput(generated)
    setGeneratedLang(t(entry.labelKey))
    setErrorInfo('')
    showToast('success', t('toast.codegen_success'))
    updateStats(generated)
  }, [input, showToast, updateStats, t])

  // ========== Encode/Decode (Base64, URI, URIComponent) ==========

  const handleEncodeSelect = useCallback((type: string) => {
    setEncodeOpen(false)
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }

    try {
      let result: string
      switch (type) {
        case 'base64-encode':
          // Validate JSON first (backward compatible)
          try { JSON.parse(trimmed) } catch { showToast('error', t('toast.invalid')); return }
          result = btoa(trimmed)
          showToast('success', t('toast.base64_encoded'))
          break
        case 'base64-decode':
          result = atob(trimmed)
          // Try to format if JSON
          try {
            const parsed = JSON.parse(result)
            result = JSON.stringify(parsed, null, 2)
          } catch { /* not JSON, keep raw */ }
          showToast('success', t('toast.base64_decoded'))
          break
        case 'uri-encode':
          result = encodeURI(trimmed)
          showToast('success', t('toast.uri_encoded'))
          break
        case 'uri-decode':
          result = decodeURI(trimmed)
          showToast('success', t('toast.uri_decoded'))
          break
        case 'uricomp-encode':
          result = encodeURIComponent(trimmed)
          showToast('success', t('toast.uri_encoded'))
          break
        case 'uricomp-decode':
          result = decodeURIComponent(trimmed)
          showToast('success', t('toast.uri_decoded'))
          break
        default:
          showToast('error', t('toast.uri_fail'))
          return
      }
      setOutput(result)
      setErrorInfo('')
      updateStats(result)
    } catch {
      showToast('error', type.startsWith('base64') ? t('toast.base64_invalid') : t('toast.uri_invalid'))
    }
  }, [input, showToast, updateStats, t])

  // ========== JSON → TypeScript ==========

  const handleToTypeScript = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    const parsed = tryParseJSON(trimmed)
    if (!parsed) { showToast('error', t('toast.invalid')); return }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      showToast('error', t('toast.ts_interface_fail'))
      return
    }
    const ts = generateTSInterfaces(parsed, 'Root')
    setOutput(ts)
    setErrorInfo('')
    showToast('success', t('toast.ts_interface'))
    updateStats(ts)
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
    setViewMode('text')
  }, [])

  // ========== JSONPath ==========

  const handleJPQuery = useCallback(() => {
    const expr = jpExpr.trim()
    if (!expr) { showToast('error', t('toast.jsonpath_empty')); return }

    const trimmed = input.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }

    const parsed = tryParseJSON(trimmed)
    if (!parsed) { showToast('error', t('toast.invalid')); return }

    try {
      const results = JSONPath({ path: expr, json: parsed })
      if (results.length === 0) {
        setJpResult(t('toast.jsonpath_no_result'))
        showToast('info', t('toast.jsonpath_no_result'))
      } else {
        const formatted = results.map((r: any, i: number) => `[${i}] ${JSON.stringify(r, null, 2)}`).join('\n\n')
        setJpResult(formatted)
        showToast('success', t('toast.jsonpath_result', { count: results.length }))
      }
    } catch (e: any) {
      showToast('error', t('toast.jsonpath_invalid'))
      setJpResult(`Error: ${(e as Error).message}`)
    }
  }, [jpExpr, input, tryParseJSON, showToast, t])

  const handleJPMode = useCallback(() => {
    setMode('jsonpath')
    setOutput('')
    setErrorInfo('')
    setJpExpr('')
    setJpResult('')
  }, [])

  const handleExitJP = useCallback(() => {
    setMode('normal')
    setJpExpr('')
    setJpResult('')
    setViewMode('text')
  }, [])

  const handleJPKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleJPQuery()
  }, [handleJPQuery])

  // ========== JWT Decode ==========
  const handleJWTMode = useCallback(() => {
    setMode('jwt')
    setJwtInput('')
    setJwtResult('')
  }, [])

  const handleJWTDecode = useCallback(() => {
    const trimmed = jwtInput.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    try {
      const parts = trimmed.split('.')
      if (parts.length !== 3) { showToast('error', 'Invalid JWT format'); return }
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      setJwtResult(JSON.stringify({ header, payload, signature: parts[2] + '...' }, null, 2))
    } catch {
      showToast('error', 'Failed to decode JWT')
    }
  }, [jwtInput, t])

  const handleJWTBack = useCallback(() => {
    setMode('normal')
    setJwtInput('')
    setJwtResult('')
  }, [])

  // ========== JSON to YAML ==========
  function jsonToYaml(obj: any, indent: number): string {
    if (obj === null || obj === undefined) return 'null'
    if (typeof obj === 'string') return `"${obj.replace(/"/g, '\\"')}"`
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'
      return obj.map(item => {
        if (typeof item === 'object' && item !== null) {
          const lines = jsonToYaml(item, indent + 2).split('\n')
          return '- ' + lines[0] + '\n' + lines.slice(1).map(l => '  ' + l).join('\n')
        }
        return '- ' + jsonToYaml(item, indent)
      }).join('\n')
    }
    if (typeof obj === 'object') {
      const keys = Object.keys(obj)
      if (keys.length === 0) return '{}'
      return keys.map(key => {
        const val = obj[key]
        const yv = jsonToYaml(val, indent + 2)
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          const lines = yv.split('\n')
          return key + ':\n' + lines.map(l => '  ' + l).join('\n')
        } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
          return key + ':\n' + yv.split('\n').map(l => '  ' + l).join('\n')
        }
        return key + ': ' + yv
      }).join('\n')
    }
    return String(obj)
  }

  const handleYAMLMode = useCallback(() => {
    setMode('yaml')
    setYamlInput('')
    setYamlResult('')
  }, [])

  const handleYAMLConvert = useCallback(() => {
    const trimmed = yamlInput.trim()
    if (!trimmed) { showToast('error', t('toast.input.empty')); return }
    try {
      const parsed = JSON.parse(trimmed)
      setYamlResult(jsonToYaml(parsed, 0))
    } catch {
      showToast('error', t('toast.invalid'))
    }
  }, [yamlInput, t])

  const handleYAMLBack = useCallback(() => {
    setMode('normal')
    setYamlInput('')
    setYamlResult('')
  }, [])

  // ========== JSON Generator ==========
  const handleGenMode = useCallback(() => {
    setMode('generator')
    setGenCount(3)
    setGenResult('')
  }, [])

  const handleGenerate = useCallback(() => {
    const count = Math.max(1, Math.min(100, genCount))
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kevin', 'Lucy', 'Mike', 'Nina', 'Oscar', 'Paul', 'Quinn', 'Rose', 'Sam', 'Tina']
    const cities = ['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou', 'Hangzhou', 'Wuhan', 'Chengdu', 'Nanjing']
    const result: any[] = []
    for (let i = 0; i < count; i++) {
      result.push({
        id: i + 1,
        name: names[Math.floor(Math.random() * names.length)],
        age: Math.floor(Math.random() * 40) + 18,
        city: cities[Math.floor(Math.random() * cities.length)],
        active: Math.random() > 0.3,
        score: Math.round(Math.random() * 10000) / 100
      })
    }
    setGenResult(JSON.stringify(count === 1 ? result[0] : result, null, 2))
  }, [genCount])

  const handleGenBack = useCallback(() => {
    setMode('normal')
    setGenCount(3)
    setGenResult('')
  }, [])

  // ========== Input change ==========

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInput(val)
    updateStats(val)
    setErrorInfo('')
  }, [updateStats])

  // ========== Language ==========

  const toggleViewMode = useCallback(() => {
    if (viewMode === 'text') {
      // Switch to tree: need valid JSON in output
      const trimmed = output.trim()
      if (!trimmed) { showToast('error', t('toast.input.empty')); return }
      try {
        JSON.parse(trimmed)
        setViewMode('tree')
      } catch {
        showToast('error', t('toast.invalid'))
      }
    } else {
      setViewMode('text')
    }
  }, [viewMode, output, showToast, t])

  const switchLang = useCallback((code: string) => {
    i18n.changeLanguage(code)
    setLangOpen(false)
  }, [i18n])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
      if (codegenRef.current && !codegenRef.current.contains(e.target as Node)) setCodegenOpen(false)
      if (sqlRef.current && !sqlRef.current.contains(e.target as Node)) setSqlOpen(false)
      if (encodeRef.current && !encodeRef.current.contains(e.target as Node)) setEncodeOpen(false)
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
    <div className="container">
      <header>
        <div className="header-top">
          <h1>🔧 {t('app.title')}</h1>
          <div className="lang-switcher" ref={langRef}>
            <button className="theme-btn" onClick={toggleTheme} title={isLight ? t('theme.dark') : t('theme.light')}>
              {isLight ? '🌙' : '☀️'}
            </button>
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

      {/* ===== Toolbar (normal mode only) ===== */}
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
            <div className="codegen-wrap" ref={encodeRef}>
              <button className="btn btn-purple" onClick={() => setEncodeOpen(!encodeOpen)}>
                {t('btn.encode_decode')} ▾
              </button>
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
            <button className="btn btn-purple" onClick={handleToJavaPOJO}>{t('btn.java_pojo')}</button>
            <button className="btn btn-purple" onClick={handleToTypeScript}>{t('btn.to_typescript')}</button>
            <div className="codegen-wrap" ref={codegenRef}>
              <button className="btn btn-purple" onClick={() => setCodegenOpen(!codegenOpen)}>
                {t('btn.to_other_code')} ▾
              </button>
              {codegenOpen && (
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
              <button className="btn btn-purple" onClick={() => setSqlOpen(!sqlOpen)}>
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
          </div>
          <div className="toolbar-group">
            <button className="btn btn-purple" onClick={handleJPMode}>{t('btn.jsonpath')}</button>
            <button className="btn btn-purple" onClick={handleDiffMode}>{t('btn.diff')}</button>
            <button className="btn btn-purple" onClick={handleJWTMode}>{t('btn.jwt_decode')}</button>
            <button className="btn btn-purple" onClick={handleYAMLMode}>{t('btn.to_yaml')}</button>
            <button className="btn btn-purple" onClick={handleGenMode}>{t('btn.generator')}</button>
          </div>
          <div className="toolbar-group">
            <button className="btn btn-outline" onClick={handleSwap}>{t('btn.swap')}</button>
            <button className="btn btn-outline" onClick={handleCopy}>{t('btn.copy')}</button>
            <button className="btn btn-danger" onClick={handleClear}>{t('btn.clear')}</button>
          </div>
        </div>
      )}

      {/* ===== Upload zone (normal mode only) ===== */}
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
              <span className="action-link" onClick={() => textareaRef.current?.focus()}>{t('panel.input')}</span>
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
              <div className="panel-header-right">
                {generatedLang && <span className="lang-tag">{generatedLang}</span>}
                {output && (() => {
                  try { JSON.parse(output.trim()); return true } catch { return false }
                })() && (
                  <span className={`view-toggle ${viewMode === 'tree' ? 'active' : ''}`} onClick={toggleViewMode}>
                    {viewMode === 'text' ? '🌳 Tree' : '📄 Text'}
                  </span>
                )}
                <span className="action-link" onClick={handleCopy}>{t('btn.copy')}</span>
              </div>
            </div>
            <div className="output-area">
              {output ? (
                viewMode === 'tree' ? (
                  <TreeView data={(() => { try { return JSON.parse(output.trim()) } catch { return null } })()} />
                ) : (
                  output
                )
              ) : (
                <span className="output-hint">{t('textarea.output_hint')}</span>
              )}
            </div>
            {errorInfo && <div className="error-lines show">{errorInfo}</div>}
          </div>
        </div>
      )}

      {/* ===== Diff mode ===== */}
      {mode === 'diff' && (
        <div className="diff-section">
          <div className="diff-toolbar">
            <button className="btn btn-outline" onClick={handleExitDiff}>{t('diff.btn_back')}</button>
            <button className="btn btn-purple diff-compare-btn" onClick={handleDiffCompare}>🔍 {t('diff.compare')}</button>
          </div>
          <div className="editor-area">
            <div className="editor-panel">
              <div className="panel-header"><span>{t('panel.json_a')}</span></div>
              <textarea value={diffA} onChange={e => setDiffA(e.target.value)} placeholder={t('textarea.placeholder')} spellCheck={false} />
            </div>
            <div className="editor-panel">
              <div className="panel-header"><span>{t('panel.json_b')}</span></div>
              <textarea value={diffB} onChange={e => setDiffB(e.target.value)} placeholder={t('textarea.placeholder')} spellCheck={false} />
            </div>
          </div>

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

      {/* ===== JSONPath mode ===== */}
      {mode === 'jsonpath' && (
        <div className="jp-section">
          <div className="diff-toolbar">
            <button className="btn btn-outline" onClick={handleExitJP}>{t('jsonpath.back')}</button>
          </div>

          <div className="editor-area">
            <div className="editor-panel">
              <div className="panel-header"><span>{t('panel.input')}</span></div>
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder={t('textarea.placeholder')}
                spellCheck={false}
              />
            </div>
            <div className="editor-panel">
              <div className="panel-header"><span>{t('panel.jsonpath_expr')}</span></div>
              <div className="jp-expr-area">
                <input
                  className="jp-expr-input"
                  value={jpExpr}
                  onChange={e => setJpExpr(e.target.value)}
                  onKeyDown={handleJPKeyDown}
                  placeholder={t('textarea.jsonpath_placeholder')}
                />
                <button className="btn btn-purple jp-query-btn" onClick={handleJPQuery}>
                  {t('jsonpath.query_btn')}
                </button>
              </div>
              <div className="jp-result-header">{t('jsonpath.result')}</div>
              <div className="output-area">
                {jpResult || <span className="output-hint">{t('textarea.output_diff_hint')}</span>}
              </div>
            </div>
          </div>

          <div className="jp-help">
            <details>
              <summary>JSONPath Quick Reference</summary>
              <div className="jp-help-content">
                <code>$</code> — root<br/>
                <code>.key</code> — child property<br/>
                <code>[*]</code> — all array elements<br/>
                <code>[0]</code> — array index<br/>
                <code>[0:3]</code> — array slice<br/>
                <code>[?(@.price&lt;10)]</code> — filter expression<br/>
                <code>..name</code> — recursive descent<br/>
                <br/>
                Examples:<br/>
                <code>$.store.book[*].author</code><br/>
                <code>$..price</code><br/>
                <code>$..book[?(@.price&gt;=10)]</code>
              </div>
            </details>
          </div>
        </div>
      )}

      {/* ===== Stats (normal mode only) ===== */}
      {mode === 'normal' && (
        <div className="stats-bar">
          <span>📊 {t('stats.chars')}: {charCount}</span>
          <span>📝 {t('stats.lines')}: {lineCount}</span>
          <span>⚡ {t('stats.pure_frontend')}</span>
        </div>
      )}

      {/* ===== JWT Decode mode ===== */}
      {mode === 'jwt' && (
        <div className="jp-section">
          <div className="diff-toolbar">
            <button className="btn btn-outline" onClick={handleJWTBack}>{t('jwt.back')}</button>
            <button className="btn btn-purple" onClick={handleJWTDecode}>🔓 {t('jwt.decode')}</button>
          </div>
          <div className="editor-area">
            <div className="editor-panel">
              <div className="panel-header"><span>{t('jwt.input')}</span></div>
              <textarea value={jwtInput} onChange={e => setJwtInput(e.target.value)} placeholder={t('jwt.placeholder')} spellCheck={false} />
            </div>
            <div className="editor-panel">
              <div className="panel-header"><span>{t('jwt.result')}</span></div>
              <div className="output-area">{jwtResult || <span className="output-hint">{t('jwt.hint')}</span>}</div>
            </div>
          </div>
        </div>
      )}

      {/* ===== YAML mode ===== */}
      {mode === 'yaml' && (
        <div className="jp-section">
          <div className="diff-toolbar">
            <button className="btn btn-outline" onClick={handleYAMLBack}>{t('yaml.back')}</button>
            <button className="btn btn-purple" onClick={handleYAMLConvert}>🔄 {t('yaml.convert')}</button>
          </div>
          <div className="editor-area">
            <div className="editor-panel">
              <div className="panel-header"><span>{t('panel.input')}</span></div>
              <textarea value={yamlInput} onChange={e => setYamlInput(e.target.value)} placeholder={t('textarea.placeholder')} spellCheck={false} />
            </div>
            <div className="editor-panel">
              <div className="panel-header"><span>{t('yaml.output')}</span></div>
              <div className="output-area">{yamlResult || <span className="output-hint">{t('yaml.hint')}</span>}</div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Generator mode ===== */}
      {mode === 'generator' && (
        <div className="jp-section">
          <div className="diff-toolbar">
            <button className="btn btn-outline" onClick={handleGenBack}>{t('gen.back')}</button>
          </div>
          <div className="gen-area">
            <label>{t('gen.count')}</label>
            <input
              className="gen-input"
              type="number" min="1" max="100" value={genCount}
              onChange={e => setGenCount(Number(e.target.value))}
            />
            <button className="btn btn-purple" onClick={handleGenerate}>⚡ {t('gen.generate')}</button>
          </div>
          <div className="editor-area" style={{ marginTop: '0' }}>
            <div className="editor-panel">
              <div className="panel-header"><span>{t('gen.result')}</span>
                {genResult && <span className="action-link" onClick={() => { navigator.clipboard.writeText(genResult).then(() => showToast('success', t('toast.copied'))).catch(() => showToast('error', t('toast.copy_fail'))) }}>📋 {t('btn.copy')}</span>}
              </div>
              <div className="output-area">{genResult || <span className="output-hint">{t('gen.hint')}</span>}</div>
            </div>
          </div>
        </div>
      )}

      {mode === 'privacy' && (
        <div className="page-content">
          <button className="btn btn-outline" onClick={goHome} style={{ marginBottom: '1rem' }}>← {t('btn.back')}</button>
          <h2>{t('privacy.title')}</h2>
          <p><strong>{t('privacy.last_updated')}</strong></p>

          <h3>{t('privacy.info_title')}</h3>
          <p>{t('privacy.info_desc')}</p>

          <h3>{t('privacy.cookies_title')}</h3>
          <p>{t('privacy.cookies_desc')}</p>

          <h3>{t('privacy.third_party_title')}</h3>
          <p>{t('privacy.third_party_desc')}</p>

          <h3>{t('privacy.ads_title')}</h3>
          <p>{t('privacy.ads_desc')}</p>
          <p>{t('privacy.ads_optout')}</p>

          <h3>{t('privacy.contact_title')}</h3>
          <p>{t('privacy.contact_desc')} <a href="mailto:javahiker123@gmail.com">javahiker123@gmail.com</a></p>
        </div>
      )}

      {mode === 'contact' && (
        <div className="page-content">
          <button className="btn btn-outline" onClick={goHome} style={{ marginBottom: '1rem' }}>← {t('btn.back')}</button>
          <h2>{t('contact.title')}</h2>
          <p>{t('contact.email')}: <a href="mailto:javahiker123@gmail.com">javahiker123@gmail.com</a></p>
          <p>{t('contact.response')}</p>
        </div>
      )}

      <footer>
        <div className="footer-links">
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

export default App
