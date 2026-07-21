import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { tryParseJSON, diffJSON, renderVisualDiff, type DiffEntry } from '../../lib/utils'

export default function JsonDiff() {
  const { t } = useTranslation()
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [diffEntries, setDiffEntries] = useState<DiffEntry[] | null>(null)

  const handleCompare = useCallback(() => {
    const pa = tryParseJSON(a.trim()), pb = tryParseJSON(b.trim())
    if (!pa || !pb) { setDiffEntries(null); return }
    setDiffEntries(diffJSON(pa, pb) as DiffEntry[])
  }, [a, b])

  const [example] = useState(() => {
    const ea = JSON.stringify({ name: 'Tom', age: 25, city: 'Beijing' }, null, 2)
    const eb = JSON.stringify({ name: 'Tommy', age: 25, city: 'Shanghai', job: 'Engineer' }, null, 2)
    return { a: ea, b: eb }
  })

  const loadExample = useCallback(() => {
    setA(example.a)
    setB(example.b)
  }, [example])

  const pa = tryParseJSON(a.trim())
  const pb = tryParseJSON(b.trim())

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
        <button className="btn btn-outline" onClick={loadExample} style={{ marginLeft: '8px' }}>📋 示例</button>
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

      {diffEntries !== null && pa && pb && (
        <VisualDiffViewer entries={diffEntries} parsedA={pa} parsedB={pb} />
      )}
    </>
  )
}

function VisualDiffViewer({ entries, parsedA, parsedB }: {
  entries: DiffEntry[]
  parsedA: any
  parsedB: any
}) {
  const { t } = useTranslation()

  if (entries.length === 0) {
    return <div className="diff-same" style={{ marginTop: '12px' }}>{t('diff.same')}</div>
  }

  const htmlA = renderVisualDiff(parsedA, entries, 'a')
  const htmlB = renderVisualDiff(parsedB, entries, 'b')

  const nAdded = entries.filter(e => e.type === 'added').length
  const nRemoved = entries.filter(e => e.type === 'removed').length
  const nModified = entries.filter(e => e.type === 'modified').length

  return (
    <div className="vdiff-container">
      {/* Panel A — original */}
      <div className="vdiff-panel">
        <div className="vdiff-panel-header">
          <span>{t('panel.json_a')}</span>
          <span className="vdiff-summary">
            {nRemoved > 0 && <span><span className="badge-rem">−{nRemoved}</span></span>}
            {nModified > 0 && <span><span className="badge-mod">∼{nModified}</span></span>}
          </span>
        </div>
        <pre className="vdiff-code" dangerouslySetInnerHTML={{ __html: htmlA }} />
      </div>

      {/* Panel B — new */}
      <div className="vdiff-panel">
        <div className="vdiff-panel-header">
          <span>{t('panel.json_b')}</span>
          <span className="vdiff-summary">
            {nAdded > 0 && <span><span className="badge-add">+{nAdded}</span></span>}
            {nModified > 0 && <span><span className="badge-mod">∼{nModified}</span></span>}
          </span>
        </div>
        <pre className="vdiff-code" dangerouslySetInnerHTML={{ __html: htmlB }} />
      </div>
    </div>
  )
}
