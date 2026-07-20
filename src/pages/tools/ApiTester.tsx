import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import TreeView from '../../TreeView'

interface ApiResult {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  time: number
  size: number
}

export default function ApiTester() {
  const { t } = useTranslation()
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET')
  const [body, setBody] = useState('')
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }])
  const [result, setResult] = useState<ApiResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'formatted' | 'raw' | 'tree'>('formatted')
  const [headersOpen, setHeadersOpen] = useState(false)
  const [toast, setToast] = useState<{ type: string; msg: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const showToast = useCallback((type: string, msg: string) => {
    setToast({ type, msg })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const handleFetch = useCallback(async () => {
    if (!url.trim()) {
      showToast('info', 'Enter an API URL first')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    const start = performance.now()

    try {
      // Build headers from custom header inputs
      const customHeaders: Record<string, string> = {}
      for (const h of headers) {
        if (h.key.trim()) {
          customHeaders[h.key.trim()] = h.value.trim()
        }
      }
      if (method !== 'GET' && body.trim() && !customHeaders['Content-Type']) {
        customHeaders['Content-Type'] = 'application/json'
      }
      const fetchOptions: RequestInit = { method, headers: customHeaders }
      if (method !== 'GET' && body.trim()) {
        fetchOptions.body = body.trim()
      }

      const response = await fetch(url.trim(), fetchOptions)
      const respHeaders: Record<string, string> = {}
      response.headers.forEach((v, k) => { respHeaders[k] = v })

      const text = await response.text()
      const elapsed = Math.round(performance.now() - start)

      let data: any = text
      try {
        data = JSON.parse(text)
      } catch {
        // Not JSON — show raw text
      }

      setResult({
        status: response.status,
        statusText: response.statusText,
        headers: respHeaders,
        data,
        time: elapsed,
        size: new Blob([text]).size,
      })
    } catch (err: any) {
      // CORS might be the issue — show helpful message
      const msg = err.message || 'Request failed'
      if (msg.includes('CORS') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('CORS blocked the request. Try a public API like https://api.github.com/users/octocat or use a CORS proxy.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [url, method, body, showToast])

  const handleCopy = useCallback(async () => {
    if (!result) return
    const text = typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)
    try {
      await navigator.clipboard.writeText(text)
      showToast('success', 'Copied!')
    } catch { showToast('error', 'Copy failed') }
  }, [result])

  const sampleUrls = [
    { label: 'GitHub API', url: 'https://api.github.com/users/octocat' },
    { label: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com/posts/1' },
    { label: 'HTTPBin', url: 'https://httpbin.org/get' },
  ]

  const getStatusColor = (code: number) => {
    if (code < 300) return 'var(--success-text)'
    if (code < 400) return 'var(--warning-text)'
    return 'var(--danger-text)'
  }

  return (
    <>
      <SEO
        title="JSON API Response Tester — Test & Inspect API Responses Online"
        description="Free online API response tester. Send GET/POST/PUT/DELETE requests and inspect formatted JSON response, headers, status codes. 100% client-side. Try now!"
        canonicalPath="/api-tester"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← {t('nav.back_home')}</Link>

      <section className="tool-header">
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-heading)' }}>{t('api.title')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{t('api.subtitle')}</p>
      </section>

      {toast && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
          padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
          background: toast.type === 'success' ? 'var(--success-bg)' : toast.type === 'error' ? 'var(--danger-bg)' : 'var(--info-bg)',
          color: toast.type === 'success' ? 'var(--success-text)' : toast.type === 'error' ? 'var(--danger-text)' : 'var(--info-text)',
          border: '1px solid ' + (toast.type === 'success' ? 'var(--success-border)' : toast.type === 'error' ? 'var(--danger-border)' : 'var(--info-border)'),
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* URL Input */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={method} onChange={e => setMethod(e.target.value as any)}
          style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input type="text" value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://api.example.com/data"
          style={{ flex: 1, minWidth: '250px', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px' }}
          onKeyDown={e => e.key === 'Enter' && handleFetch()} />
        <button className="btn btn-accent" onClick={handleFetch} disabled={loading} style={{ padding: '10px 24px' }}>
          {loading ? '⏳ Sending...' : '🚀 Send'}
        </button>
      </div>

      {/* Sample URLs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        <span>Try:</span>
        {sampleUrls.map(s => (
          <button key={s.label} className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={() => setUrl(s.url)}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Request Body (for POST/PUT) */}
      {(method === 'POST' || method === 'PUT') && (
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Request Body (JSON):</label>
          <textarea value={body} onChange={e => setBody(e.target.value)}
            placeholder='{"key": "value"}'
            style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace' }}
            spellCheck={false} />
        </div>
      )}

      {/* Custom Headers (collapsible) */}
      <details open={headersOpen} style={{ marginTop: '16px', marginBottom: '16px' }}>
        <summary
          onClick={e => { e.preventDefault(); setHeadersOpen(o => !o) }}
          style={{ cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border)', userSelect: 'none' }}
        >
          {headersOpen ? '▼' : '▶'} Custom Headers (Authorization, Content-Type, etc.)
        </summary>
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {headers.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text" value={h.key} onChange={e => {
                  const h2 = [...headers]; h2[i].key = e.target.value; setHeaders(h2)
                }}
                placeholder="Header (e.g. Authorization)"
                style={{ flex: '1', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px' }} />
              <input
                type="text" value={h.value} onChange={e => {
                  const h2 = [...headers]; h2[i].value = e.target.value; setHeaders(h2)
                }}
                placeholder="Value (e.g. Bearer xxx)"
                style={{ flex: '2', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px' }} />
              <button className="btn" style={{ padding: '6px 10px', fontSize: '12px' }} onClick={() => {
                if (headers.length <= 1) return
                setHeaders(headers.filter((_, j) => j !== i))
              }}>✕</button>
            </div>
          ))}
          <button className="btn btn-outline" style={{ alignSelf: 'flex-start', fontSize: '12px', padding: '6px 14px' }} onClick={() => setHeaders([...headers, { key: '', value: '' }])}>
            + Add Header
          </button>
        </div>
      </details>

      {/* Error */}
      {error && (
        <div style={{ padding: '16px', background: 'var(--danger-bg)', borderRadius: '8px', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', fontSize: '14px', marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Status bar */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
            <span>Status: <strong style={{ color: getStatusColor(result.status) }}>{result.status} {result.statusText}</strong></span>
            <span>Time: <strong>{result.time}ms</strong></span>
            <span>Size: <strong>{(result.size / 1024).toFixed(1)} KB</strong></span>
            <span>Content-Type: <strong>{result.headers['content-type'] || result.headers['Content-Type'] || '-'}</strong></span>
          </div>

          {/* View tabs */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '0' }}>
            {(['formatted', 'raw', 'tree'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                style={{
                  padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: '13px',
                  background: viewMode === m ? 'var(--bg-secondary)' : 'transparent',
                  color: viewMode === m ? 'var(--accent)' : 'var(--text-secondary)',
                  borderBottom: viewMode === m ? '2px solid var(--accent)' : '2px solid transparent',
                  fontWeight: viewMode === m ? 600 : 400,
                }}>
                {m === 'formatted' ? '✨ Formatted' : m === 'raw' ? '📄 Raw' : '🌳 Tree'}
              </button>
            ))}
          </div>

          {/* Output */}
          <div className="tool-panel" style={{ marginTop: '0', borderTopLeftRadius: '0', minHeight: '200px', maxHeight: '500px', overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: '8px', padding: '8px', borderBottom: '1px solid var(--border)' }}>
              <button className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={handleCopy}>📋 Copy</button>
            </div>
            {viewMode === 'tree' && typeof result.data === 'object' && result.data !== null ? (
              <div style={{ padding: '16px' }}><TreeView data={result.data} /></div>
            ) : (
              <pre className="playground-output" style={{ margin: 0 }}>
                {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>

          {/* Headers (collapsible) */}
          <details style={{ marginTop: '16px' }}>
            <summary style={{ cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
              📋 Response Headers ({Object.keys(result.headers).length})
            </summary>
            <div style={{ padding: '12px', fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              {Object.entries(result.headers).map(([k, v]) => (
                <div key={k}><strong style={{ color: 'var(--text-heading)' }}>{k}:</strong> {v}</div>
              ))}
            </div>
          </details>
        </>
      )}

      {!result && !error && !loading && (
        <div className="tool-panel" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <p>{t('api.hint')}</p>
          </div>
        </div>
      )}
    </>
  )
}
