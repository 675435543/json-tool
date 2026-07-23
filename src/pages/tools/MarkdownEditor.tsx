import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import SEO from '../../components/SEO'

// Configure marked for highlight support
marked.setOptions({
  gfm: true,
  breaks: true,
})

export default function MarkdownEditor() {
  const { t } = useTranslation()
  const [input, setInput] = useState(localStorage.getItem('md_editor_content') || `# Welcome to Markdown Editor\n\nStart typing **Markdown** on the left, see the preview on the right.\n\n## Features\n\n- **Bold**, *italic*, ~~strikethrough~~\n- \`Inline code\` and code blocks\n- Tables and lists\n- [Links](https://example.com)\n\n### Code Example\n\n\`\`\`javascript\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\`\`\`\n\n> Blockquote for emphasis\n\n---\n\n| Feature | Status |\n|---------|--------|\n| GFM | ✅ |\n| Tables | ✅ |\n| Syntax Highlight | ✅ |\n`)
  const [html, setHtml] = useState('')
  const [htmlCopied, setHtmlCopied] = useState(false)
  const [htmlExported, setHtmlExported] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // Persist content to localStorage
  useEffect(() => {
    localStorage.setItem('md_editor_content', input)
  }, [input])

  const compile = useCallback((md: string) => {
    if (!md.trim()) {
      setHtml('')
      return
    }
    try {
      const raw = marked.parse(md) as string
      const sanitized = DOMPurify.sanitize(raw)
      setHtml(sanitized)
    } catch {
      setHtml('<p style="color:var(--danger)">⚠️ Failed to parse Markdown</p>')
    }
  }, [])

  // Compile on input change
  useEffect(() => {
    compile(input)
  }, [input, compile])

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html)
      setHtmlCopied(true)
      setTimeout(() => setHtmlCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const handleClear = () => {
    setInput('')
    localStorage.removeItem('md_editor_content')
  }

  const handleExportHtml = () => {
    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Markdown Export</title><style>body{max-width:800px;margin:40px auto;padding:0 20px;font:16px/1.6 system-ui,sans-serif;color:#333}code{background:#f4f4f4;padding:2px 6px;border-radius:3px;font-size:0.9em}pre{background:#f4f4f4;padding:16px;border-radius:8px;overflow-x:auto}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f8f8f8}blockquote{border-left:4px solid #ddd;margin:0;padding:0 16px;color:#666}img{max-width:100%}</style></head><body>${html}</body></html>`], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'markdown-export.html'
    a.click()
    URL.revokeObjectURL(url)
    setHtmlExported(true)
    setTimeout(() => setHtmlExported(false), 2000)
  }

  const handleExportPdf = () => {
    if (!html) return
    // Open in a new window and print
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      // Fallback: if popup blocked, do inline print
      window.print()
      return
    }
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Markdown Export</title><style>body{max-width:800px;margin:40px auto;padding:0 20px;font:16px/1.6 system-ui,sans-serif;color:#333}code{background:#f4f4f4;padding:2px 6px;border-radius:3px;font-size:0.9em}pre{background:#f4f4f4;padding:16px;border-radius:8px;overflow-x:auto;page-break-inside:avoid}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f8f8f8}blockquote{border-left:4px solid #ddd;margin:0;padding:0 16px;color:#666}img{max-width:100%}@media print{body{margin:0;padding:20px}}h1,h2,h3,h4{page-break-after:avoid}</style></head><body>${html}</body></html>`)
    printWindow.document.close()
    printWindow.focus()
    // Wait a moment for styles to load
    setTimeout(() => printWindow.print(), 200)
  }

  const handleExportWord = () => {
    if (!html) return
    // Word can open HTML files - create a Word-compatible HTML document
    const wordHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="utf-8"><title>Markdown Export</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
body{font:12pt/1.6 'Calibri',system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#333}
code{background:#f4f4f4;padding:2px 6px;font-size:10pt}
pre{background:#f4f4f4;padding:16px;border:1px solid #ddd;font-size:10pt;white-space:pre-wrap}
table{border-collapse:collapse;width:100%;margin:8px 0}
td,th{border:1px solid #999;padding:6px 8px}
th{background:#f0f0f0}
blockquote{border-left:4px solid #ddd;margin:8px 0;padding:0 16px;color:#666}
img{max-width:100%}
</style>
</head><body>${html}</body></html>`
    const blob = new Blob([wordHtml], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'markdown-export.doc'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <SEO
        title="Free Online Markdown Editor & Converter - Markdown to HTML"
        description="Free online Markdown editor with live preview. Write Markdown, preview HTML in real-time. Export to HTML, copy HTML code. 100% client-side, no uploads."
        keywords="Markdown editor, online Markdown, Markdown to HTML, Markdown preview, write Markdown, Markdown converter"
        canonicalPath="/markdown-editor"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      <div className="diff-toolbar">
        <button className="btn btn-purple" onClick={handleCopyHtml}>{htmlCopied ? '✅ Copied!' : '📋 ' + (t('md.copy_html') || 'Copy HTML')}</button>
        <button className="btn btn-purple" onClick={handleExportHtml}>{htmlExported ? '✅ Done!' : '📄 ' + (t('md.export_html') || 'Export HTML')}</button>
        <button className="btn btn-purple" onClick={handleExportPdf}>📕 PDF</button>
        <button className="btn btn-purple" onClick={handleExportWord}>📘 Word</button>
        <button className="btn btn-purple" onClick={handleClear}>🗑️ {t('md.clear') || 'Clear'}</button>
        <button className="btn btn-outline" onClick={() => setFullscreen(v => !v)} style={{ marginLeft: 'auto' }}>
          {fullscreen ? '⤵ ' + (t('md.shrink') || 'Shrink') : '⤴ ' + (t('md.expand') || 'Expand')}
        </button>
      </div>

      <div className="editor-area" style={{ height: fullscreen ? 'calc(100vh - 200px)' : '75vh', transition: 'height 0.2s ease' }}>
        <div className="editor-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header"><span>✍️ {t('md.editor') || 'Editor'}</span></div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type Markdown here..."
            spellCheck={false}
            style={{ flex: 1, resize: 'none', fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace", fontSize: '14px' }}
          />
        </div>
        <div className="editor-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header"><span>👁️ {t('md.preview') || 'Preview'}</span></div>
          <div
            ref={previewRef}
            className="md-preview"
            dangerouslySetInnerHTML={{ __html: html }}
            style={{ flex: 1, overflow: 'auto', padding: '16px', lineHeight: '1.7', fontSize: '15px' }}
          />
        </div>
      </div>

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>About This Markdown Editor</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>✍️ Write <strong>Markdown</strong> on the left, see the <strong>HTML preview</strong> on the right in real-time.</p>
          <p style={{ marginTop: '8px' }}>🔒 <strong>Privacy:</strong> All processing happens in your browser. Your content is never uploaded.</p>
          <p style={{ marginTop: '8px' }}>📤 Export your content as a complete <strong>HTML file</strong> or copy the rendered HTML to your clipboard.</p>
          <p style={{ marginTop: '8px' }}>💾 Your content is auto-saved to your browser's local storage.</p>
          <p style={{ marginTop: '8px' }}>Supported: <strong>GFM</strong> (tables, strikethrough, task lists), <strong>code blocks</strong>, <strong>images</strong>, <strong>links</strong>, <strong>blockquotes</strong>, and more.</p>
        </div>
      </section>
    </>
  )
}
