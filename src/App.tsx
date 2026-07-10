import { useState, useCallback, useRef, useEffect } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [errorInfo, setErrorInfo] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [lineCount, setLineCount] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Toast
  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ type, msg })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const updateStats = useCallback((text: string) => {
    setCharCount(text.length)
    setLineCount(text ? text.split('\n').length : 0)
  }, [])

  const parseError = useCallback((e: any, jsonStr: string): string => {
    const msg = (e as Error).message || 'JSON 格式错误'
    const match = msg.match(/position\s+(\d+)/)
    if (match) {
      const pos = parseInt(match[1])
      const before = jsonStr.slice(0, pos)
      const line = before.split('\n').length
      const lastNewline = before.lastIndexOf('\n')
      const col = pos - lastNewline
      return `❌ 第 ${line} 行 · 第 ${col} 列: ${msg.replace(/^.*?position\s+\d+\s*/g, '')}`
    }
    return `❌ ${msg}`
  }, [])

  // ============ 上传文件 ============

  const readFile = useCallback((file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      showToast('error', `❌ 只支持 .json 文件，你上传的是 ${file.name}`)
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setInput(text)
      updateStats(text)
      setErrorInfo('')
      showToast('success', `📂 已加载 ${file.name}`)
    }
    reader.onerror = () => {
      showToast('error', '❌ 文件读取失败')
    }
    reader.readAsText(file)
  }, [updateStats, showToast])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      readFile(files[0])
    }
  }, [readFile])

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      readFile(files[0])
    }
    e.target.value = ''
  }, [readFile])

  const handleClickUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // ============ 操作按钮 ============

  const tryParseJSON = useCallback((trimmed: string): any | null => {
    try {
      return JSON.parse(trimmed)
    } catch {
      return null
    }
  }, [])

  const doFormat = useCallback((indent: number) => {
    const trimmed = input.trim()
    if (!trimmed) {
      showToast('error', '📝 请输入 JSON 内容')
      return
    }
    try {
      const parsed = JSON.parse(trimmed)
      const formatted = JSON.stringify(parsed, null, indent)
      setOutput(formatted)
      setErrorInfo('')
      showToast('success', `✅ 已格式化（${indent > 0 ? indent + ' 空格' : '压缩'}）`)
      updateStats(formatted)
    } catch (e: any) {
      const errMsg = parseError(e, trimmed)
      setErrorInfo(errMsg)
      showToast('error', errMsg)
    }
  }, [input, parseError, showToast, updateStats])

  const handleBeautify = useCallback(() => doFormat(2), [doFormat])
  const handleCompact = useCallback(() => doFormat(0), [doFormat])
  const handleFormat4 = useCallback(() => doFormat(4), [doFormat])

  const handleValidate = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) {
      showToast('error', '📝 请输入 JSON 内容')
      return
    }
    try {
      JSON.parse(trimmed)
      setErrorInfo('')
      showToast('success', '✅ JSON 格式正确！🎉')
    } catch (e: any) {
      const errMsg = parseError(e, trimmed)
      setErrorInfo(errMsg)
      showToast('error', errMsg)
    }
  }, [input, parseError, showToast])

  // ============ JSON 转 CSV ============

  const jsonToCSV = useCallback((data: any): string | null => {
    // 如果是对象，包成数组
    const arr = Array.isArray(data) ? data : [data]
    if (arr.length === 0) return null

    // 提取所有字段（以第一个对象的 key 为准）
    const first = arr[0]
    if (typeof first !== 'object' || first === null) {
      return null
    }
    const headers = Object.keys(first)

    // 转义 CSV 值
    const escapeCSV = (val: any): string => {
      const s = val === null || val === undefined ? '' : String(val)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }

    const rows = arr.map((item: any) => {
      return headers.map((h) => escapeCSV(item[h])).join(',')
    })

    return [headers.join(','), ...rows].join('\n')
  }, [])

  const handleToCSV = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) {
      showToast('error', '📝 请输入 JSON 内容')
      return
    }
    const parsed = tryParseJSON(trimmed)
    if (!parsed) {
      showToast('error', '❌ JSON 格式错误，请先校验')
      return
    }
    const csv = jsonToCSV(parsed)
    if (!csv) {
      showToast('error', '❌ 无法转换：JSON 必须是对象或对象数组')
      return
    }
    setOutput(csv)
    setErrorInfo('')
    showToast('success', '✅ 已转换为 CSV！')
    updateStats(csv)
  }, [input, tryParseJSON, jsonToCSV, showToast, updateStats])

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
    if (!text) {
      showToast('error', '📝 没有内容可复制')
      return
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast('success', '📋 已复制到剪贴板！')
    }).catch(() => {
      showToast('error', '❌ 复制失败')
    })
  }, [output, input, showToast])

  const handleSwap = useCallback(() => {
    if (!output) {
      showToast('error', '📝 右侧没有内容可交换')
      return
    }
    setInput(output)
    setOutput('')
    setErrorInfo('')
    updateStats(output)
  }, [output, updateStats, showToast])

  const handleEscape = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) {
      showToast('error', '📝 请输入 JSON 内容')
      return
    }
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
      showToast('success', '✅ 转义成功！')
      updateStats(escaped)
    } catch (e: any) {
      const errMsg = parseError(e, trimmed)
      setErrorInfo(errMsg)
      showToast('error', errMsg)
    }
  }, [input, parseError, showToast, updateStats])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInput(val)
    updateStats(val)
    setErrorInfo('')
  }, [updateStats])

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  return (
    <div className="container">
      <header>
        <h1>🔧 JSON Tool</h1>
        <p>在线 JSON 格式化 · 压缩 · 校验 · 转 CSV · 转义</p>
      </header>

      <div className={`toast ${toast ? toast.type : ''} ${toast ? 'show' : ''}`}>
        {toast?.msg || ''}
      </div>

      <div className="toolbar">
        <button className="btn btn-primary" onClick={handleBeautify}>
          ✨ 格式化 (2空格)
        </button>
        <button className="btn btn-primary" onClick={handleFormat4}>
          📐 格式化 (4空格)
        </button>
        <button className="btn btn-success" onClick={handleCompact}>
          📦 压缩
        </button>
        <button className="btn btn-warning" onClick={handleValidate}>
          ✅ 校验
        </button>
        <button className="btn btn-purple" onClick={handleToCSV}>
          📊 转 CSV
        </button>
        <button className="btn btn-outline" onClick={handleEscape}>
          🔗 转义
        </button>
        <button className="btn btn-outline" onClick={handleSwap}>
          🔄 交换
        </button>
        <button className="btn btn-outline" onClick={handleCopy}>
          📋 复制
        </button>
        <button className="btn btn-danger" onClick={handleClear}>
          🗑️ 清空
        </button>
      </div>

      {/* 上传区域 */}
      <div
        className={`upload-zone ${dragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <div className="file-icon">📂</div>
        <p>点击选择 JSON 文件，或拖拽文件到此处</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header">
            <span>输入</span>
            <span className="action-link" onClick={() => textareaRef.current?.focus()}>
              点击输入
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            placeholder={'粘贴或输入 JSON...\n\n示例:\n{\n  "name": "JSON Tool",\n  "version": 1.0\n}'}
            spellCheck={false}
          />
        </div>

        <div className="editor-panel">
          <div className="panel-header">
            <span>输出</span>
            <span className="action-link" onClick={handleCopy}>
              复制结果
            </span>
          </div>
          <div className="output-area">
            {output || (
              <span style={{ color: '#475569' }}>
                输入 JSON，点击上方按钮操作...
              </span>
            )}
          </div>
          {errorInfo && (
            <div className="error-lines show">
              {errorInfo}
            </div>
          )}
        </div>
      </div>

      <div className="stats-bar">
        <span>📊 字符: {charCount}</span>
        <span>📝 行数: {lineCount}</span>
        <span>⚡ 纯前端 · 无需服务器</span>
      </div>

      <footer>
        JSON Tool · 免费在线工具 · {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default App
