import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

export default function RegexTester() {
  const { t } = useTranslation()
  const [pattern, setPattern] = useState('(\\d{3,4})[-.\\s]?(\\d{7,8})')
  const [flags, setFlags] = useState('gm')
  const [testText, setTestText] = useState(`Call: 010-12345678
Mobile: 138-0013-8000
Fax: (021) 98765432
Not a phone: 1234`)

  const [replaceText, setReplaceText] = useState('($1) $2')
  const [replacedOutput, setReplacedOutput] = useState('')

  const regex = useMemo(() => {
    try {
      return new RegExp(pattern, flags)
    } catch {
      return null
    }
  }, [pattern, flags])

  const matches = useMemo(() => {
    if (!regex || !testText) return []
    const results: Array<{ full: string; groups: string[]; index: number }> = []
    let m: RegExpExecArray | null
    const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g')
    while ((m = re.exec(testText)) !== null) {
      results.push({
        full: m[0],
        groups: Array.from(m).slice(1),
        index: m.index,
      })
      if (m.index === re.lastIndex) re.lastIndex++
    }
    return results
  }, [regex, testText])

  const handleReplace = useCallback(() => {
    if (!regex || !testText) {
      setReplacedOutput('')
      return
    }
    try {
      setReplacedOutput(testText.replace(regex, replaceText))
    } catch {
      setReplacedOutput('⚠️ Error: invalid replacement pattern')
    }
  }, [regex, testText, replaceText])

  // Auto-run replace when text or replace changes
  useMemo(() => {
    handleReplace()
  }, [handleReplace])

  const highlitText = useMemo(() => {
    if (!regex || !testText || matches.length === 0) return testText
    // For g flag, highlight all matches
    try {
      const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g')
      return testText.replace(re, (match) => `\x00${match}\x01`)
    } catch {
      return testText
    }
  }, [regex, testText, matches])

  // For display, we split by highlight markers
  const displayParts = useMemo(() => {
    if (!highlitText.includes('\x00')) return [{ text: highlitText, highlight: false }]
    const parts: Array<{ text: string; highlight: boolean }> = []
    const segments = highlitText.split(/(\x00[^\x01]*\x01)/)
    for (const seg of segments) {
      if (seg.startsWith('\x00') && seg.endsWith('\x01')) {
        parts.push({ text: seg.slice(1, -1), highlight: true })
      } else {
        parts.push({ text: seg, highlight: false })
      }
    }
    return parts
  }, [highlitText])

  return (
    <>
      <SEO
        title="Regex Tester Online - Test Regular Expressions Free"
        description="Free online regex tester and debugger. Test regular expressions against text in real-time, view match details, and perform replace operations. 100% client-side."
        keywords="regex tester, regular expression tester, regex online, regex debugger, test regex online, regex replace, regular expression test"
        canonicalPath="/regex-tester"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      {/* Pattern & Flags */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            {t('regex.pattern') || 'Regular Expression'}
          </label>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="/pattern/flags"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: `2px solid ${regex ? 'var(--border)' : 'var(--danger)'}`,
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '15px',
              fontFamily: 'monospace',
              outline: 'none',
            }}
          />
          {!regex && pattern && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
              ⚠️ {t('regex.invalid') || 'Invalid regular expression'}
            </div>
          )}
        </div>
        <div style={{ width: '100px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            {t('regex.flags') || 'Flags'}
          </label>
          <input
            type="text"
            value={flags}
            onChange={e => setFlags(e.target.value)}
            placeholder="gim"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '2px solid var(--border)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '15px',
              fontFamily: 'monospace',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ minWidth: '80px', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: regex ? (matches.length > 0 ? 'var(--success)' : 'var(--bg-tertiary)') : 'var(--bg-tertiary)',
            color: regex && matches.length > 0 ? 'white' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: 600,
            width: '100%',
            textAlign: 'center' as const,
          }}>
            {regex ? `${matches.length} ${t('regex.matches') || 'matches'}` : '—'}
          </div>
        </div>
      </div>

      {/* Test Text & Result */}
      <div className="editor-area" style={{ height: '350px' }}>
        <div className="editor-panel">
          <div className="panel-header"><span>{t('regex.test_text') || 'Test Text'}</span></div>
          <textarea
            value={testText}
            onChange={e => setTestText(e.target.value)}
            placeholder="Enter test text..."
            spellCheck={false}
          />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>{t('regex.preview') || 'Matches Preview'}</span></div>
          <div className="output-area" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6', overflow: 'auto' }}>
            {!testText ? (
              <span className="output-hint">{t('regex.hint') || 'Enter text to test'}</span>
            ) : (
              displayParts.map((part, i) =>
                part.highlight
                  ? <span key={i} style={{ background: 'rgba(255, 200, 0, 0.3)', borderRadius: '3px', padding: '1px 0', borderBottom: '2px solid #f59e0b' }}>{part.text}</span>
                  : <span key={i}>{part.text}</span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Replace Section */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            {t('regex.replace_with') || 'Replace with'}
          </label>
          <input
            type="text"
            value={replaceText}
            onChange={e => setReplaceText(e.target.value)}
            placeholder="$1-$2"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '2px solid var(--border)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontFamily: 'monospace',
              outline: 'none',
            }}
          />
        </div>
      </div>
      <div className="editor-area" style={{ height: '120px', marginTop: '8px' }}>
        <div className="editor-panel" style={{ width: '100%' }}>
          <div className="panel-header"><span>{t('regex.replaced') || 'Replaced Output'}</span></div>
          <div className="output-area" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6' }}>
            {replacedOutput || <span className="output-hint">{t('regex.replace_hint') || 'Replace result appears here'}</span>}
          </div>
        </div>
      </div>

      {/* Match Details */}
      {matches.length > 0 && (
        <section style={{ marginTop: '24px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-heading)' }}>
            {t('regex.details') || 'Match Details'} ({matches.length})
          </h3>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-secondary)' }}>#</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-secondary)' }}>{t('regex.match') || 'Match'}</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-secondary)' }}>{t('regex.position') || 'Pos'}</th>
                  <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-secondary)' }}>{t('regex.groups') || 'Groups'}</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>{i + 1}</td>
                    <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{m.full.length > 60 ? m.full.slice(0, 60) + '...' : m.full}</td>
                    <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>{m.index}</td>
                    <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {m.groups.length > 0 ? m.groups.map((g, gi) => g !== undefined ? `$${gi + 1}: ${g.slice(0, 30)}` : null).filter(Boolean).join(', ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>About Regex Testing</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>🔍 Test your regular expressions against sample text in <strong>real-time</strong>. View all matches with their positions and captured groups.</p>
          <p style={{ marginTop: '8px' }}>🔄 Use the <strong>replace</strong> feature to test regex substitutions with <code>$1</code>, <code>$2</code>, etc.</p>
          <p style={{ marginTop: '8px' }}>📌 <strong>Common flags:</strong> <code>g</code> (global), <code>i</code> (case insensitive), <code>m</code> (multiline), <code>s</code> (dotall)</p>
          <p style={{ marginTop: '8px' }}>🔒 100% client-side processing. Your data never leaves your browser.</p>
        </div>
      </section>
    </>
  )
}
