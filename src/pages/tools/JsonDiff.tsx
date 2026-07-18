import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { tryParseJSON, diffJSON, type DiffEntry } from '../../lib/utils'

export default function JsonDiff() {
  const { t } = useTranslation()
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [result, setResult] = useState<DiffEntry[] | null>(null)

  const handleCompare = useCallback(() => {
    const pa = tryParseJSON(a.trim()), pb = tryParseJSON(b.trim())
    if (!pa || !pb) { setResult([{ path: 'Input', type: 'modified', a: 'Invalid JSON in one or both panels', b: '' }]); return }
    setResult(diffJSON(pa, pb))
  }, [a, b])

  return (
    <>
      <SEO
        title="JSON Diff Checker Online - Compare JSON Files & Find Differences"
        description="Free online JSON Diff tool: compare two JSON documents side by side and find differences. See added, removed, and modified fields instantly. Perfect for API response comparison."
        keywords="JSON diff, JSON compare, JSON difference checker, compare JSON online, JSON comparison tool, JSON diff checker"
        canonicalPath="/json-diff"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      <div className="diff-toolbar">
        <button className="btn btn-purple diff-compare-btn" onClick={handleCompare}>🔍 {t('diff.compare')}</button>
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>{t('panel.json_a')}</span></div>
          <textarea value={a} onChange={e => setA(e.target.value)} placeholder={t('textarea.placeholder')} spellCheck={false} />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>{t('panel.json_b')}</span></div>
          <textarea value={b} onChange={e => setB(e.target.value)} placeholder={t('textarea.placeholder')} spellCheck={false} />
        </div>
      </div>

      {result !== null && (
        <div className="diff-result">
          {result.length === 0 ? (
            <div className="diff-same">{t('diff.same')}</div>
          ) : (
            <div className="diff-entries">
              <div className="diff-summary">
                {result.filter(d => d.type === 'added').length} {t('diff.added')} ·{' '}
                {result.filter(d => d.type === 'removed').length} {t('diff.removed')} ·{' '}
                {result.filter(d => d.type === 'modified').length} {t('diff.modified')}
              </div>
              {result.map((d, i) => (
                <div key={i} className={`diff-entry diff-${d.type}`}>
                  <div className="diff-path">{d.type === 'added' ? '+' : d.type === 'removed' ? '−' : '∼'} {d.path}</div>
                  <div className="diff-value">
                    {d.a && <div className="diff-a">- {d.a}</div>}
                    {d.b && <div className="diff-b">+ {d.b}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>When to Use JSON Diff</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>🔄 Compare API responses between environments (dev vs prod)</p>
          <p>🔄 Check configuration file changes between versions</p>
          <p>🔄 Verify data transformations and migrations</p>
          <p>🔄 Debug unexpected JSON output differences</p>
        </div>
      </section>
    </>
  )
}
