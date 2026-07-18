import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { JSONPath } from 'jsonpath-plus'
import SEO from '../../components/SEO'
import { tryParseJSON } from '../../lib/utils'

export default function JsonPath() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [expr, setExpr] = useState('')
  const [result, setResult] = useState('')

  const handleQuery = useCallback(() => {
    if (!expr.trim() || !input.trim()) return
    const parsed = tryParseJSON(input.trim())
    if (!parsed) { setResult('Invalid JSON input'); return }
    try {
      const results = JSONPath({ path: expr.trim(), json: parsed })
      if (results.length === 0) setResult(t('toast.jsonpath_no_result'))
      else setResult(results.map((r: any, i: number) => `[${i}] ${JSON.stringify(r, null, 2)}`).join('\n\n'))
    } catch (e: any) { setResult(`Error: ${(e as Error).message}`) }
  }, [input, expr, t])

  return (
    <>
      <SEO
        title="JSONPath Online Tester - Query JSON Data with JSONPath Expressions"
        description="Free online JSONPath tester. Query and extract data from JSON using JSONPath expressions. Supports filters, slices, recursive descent. Perfect for API testing and data extraction."
        keywords="JSONPath tester, JSONPath online, JSONPath query, JSON query tool, JSONPath expression tester, JSON data extraction"
        canonicalPath="/jsonpath"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>{t('panel.input')}</span></div>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t('textarea.placeholder')} spellCheck={false} />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>{t('panel.jsonpath_expr')}</span></div>
          <div className="jp-expr-area">
            <input className="jp-expr-input" value={expr} onChange={e => setExpr(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuery()} placeholder={t('textarea.jsonpath_placeholder')} />
            <button className="btn btn-purple jp-query-btn" onClick={handleQuery}>{t('jsonpath.query_btn')}</button>
          </div>
          <div className="jp-result-header">{t('jsonpath.result')}</div>
          <div className="output-area">{result || <span className="output-hint">{t('textarea.output_diff_hint')}</span>}</div>
        </div>
      </div>

      <div className="jp-help">
        <details open>
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

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>What is JSONPath?</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>JSONPath is a query language for JSON, similar to XPath for XML. It lets you extract and filter data from complex JSON structures with simple expressions.</p>
          <p style={{ marginTop: '8px' }}><strong>Common use cases:</strong></p>
          <p>• Extract specific fields from large API responses</p>
          <p>• Filter arrays based on conditions</p>
          <p>• Navigate deeply nested JSON structures</p>
          <p>• Test and debug JSON data extraction logic</p>
        </div>
      </section>
    </>
  )
}
