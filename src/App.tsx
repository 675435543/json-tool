import { useState, useCallback, useRef } from 'react'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [lineCount, setLineCount] = useState(0)
  const outputRef = useRef<HTMLDivElement>(null)

  const updateStats = useCallback((text: string) => {
    setCharCount(text.length)
    setLineCount(text ? text.split('\n').length : 0)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInput(val)
    updateStats(val)
    setError('')
    setSuccess('')
  }, [updateStats])

  const formatJSON = useCallback((indent: number) => {
    if (!input.trim()) {
      setError('请输入 JSON 内容')
      return
    }
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indent)
      setOutput(formatted)
      setError('')
      setSuccess('✅ 格式化成功！')
      updateStats(formatted)
    } catch (e: any) {
      const msg = e.message || 'JSON 格式错误'
      // Try to extract line/column
      const match = msg.match(/position\s+(\d+)/)
      if (match) {
        const pos = parseInt(match[1])
        const before = input.slice(0, pos)
        const line = before.split('\n').length
        const col = pos - before.lastIndexOf('\n')
        setError(`❌ 第 ${line} 行 第 ${col} 列: ${msg}`)
      } else {
        setError(`❌ ${msg}`)
      }
      setSuccess('')
    }
  }, [input, updateStats])

  const handleBeautify = useCallback(() => formatJSON(2), [formatJSON])
  const handleCompact = useCallback(() => formatJSON(0), [formatJSON])
  const handleFormat4 = useCallback(() => formatJSON(4), [formatJSON])

  const handleValidate = useCallback(() => {
    if (!input.trim()) {
      setError('请输入 JSON 内容')
      setSuccess('')
      return
    }
    try {
      JSON.parse(input)
      setError('')
      setSuccess('✅ JSON 格式正确！')
    } catch (e: any) {
      const msg = e.message || 'JSON 格式错误'
      const match = msg.match(/position\s+(\d+)/)
      if (match) {
        const pos = parseInt(match[1])
        const before = input.slice(0, pos)
        const line = before.split('\n').length
        const col = pos - before.lastIndexOf('\n')
        setError(`❌ 第 ${line} 行 第 ${col} 列: ${msg}`)
      } else {
        setError(`❌ ${msg}`)
      }
      setSuccess('')
    }
  }, [input])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError('')
    setSuccess('')
    setCharCount(0)
    setLineCount(0)
  }, [])

  const handleCopy = useCallback(() => {
    const text = output || input
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('📋 已复制到剪贴板！')
      setTimeout(() => {
        if (output) setSuccess('✅ 格式化成功！')
        else setSuccess('')
      }, 1500)
    })
  }, [output, input])

  const handleSwap = useCallback(() => {
    if (!output) return
    setInput(output)
    setOutput('')
    setError('')
    setSuccess('')
    updateStats(output)
  }, [output, updateStats])

  const handleEscape = useCallback(() => {
    if (!input.trim()) {
      setError('请输入 JSON 内容')
      return
    }
    try {
      const parsed = JSON.parse(input)
      const str = JSON.stringify(parsed)
      const escaped = str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
      setOutput(escaped)
      setError('')
      setSuccess('✅ 转义成功！')
    } catch (e: any) {
      setError(`❌ ${e.message}`)
      setSuccess('')
    }
  }, [input])

  return (
    <div className="container">
      <header>
        <h1>🔧 JSON Tool</h1>
        <p>在线 JSON 格式化 · 压缩 · 校验 · 转义</p>
      </header>

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

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header">
            <span>输入</span>
            <span className="action-link" onClick={() => document.querySelector<HTMLTextAreaElement>('textarea')?.focus()}>
              点击输入
            </span>
          </div>
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder='粘贴或输入 JSON...&#10;&#10;示例:&#10;{&#10;  "name": "JSON Tool",&#10;  "version": 1.0&#10;}'
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
          <div className="output-area" ref={outputRef}>
            {output || (
              <span style={{ color: '#475569' }}>
                点击「格式化」或「压缩」查看结果...
              </span>
            )}
          </div>
          {error && <div className="error-msg">{error}</div>}
          {success && !error && <div className="success-msg">{success}</div>}
        </div>
      </div>

      <div className="stats-bar">
        <span>📊 字符: {charCount}</span>
        <span>📝 行数: {lineCount}</span>
        <span>⚡ 纯前端 · 无需服务器</span>
      </div>

      <footer>
        <p>JSON Tool · 免费在线工具 · {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default App
