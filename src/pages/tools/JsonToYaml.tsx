import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { tryParseJSON, jsonToYaml } from '../../lib/utils'

export default function JsonToYaml() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleConvert = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return
    const parsed = tryParseJSON(trimmed)
    if (!parsed) { setOutput('Invalid JSON input'); return }
    setOutput(jsonToYaml(parsed, 0))
  }, [input])

  const handleCopy = () => { if (output) navigator.clipboard.writeText(output) }

  const readFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setInput(e.target?.result as string)
    reader.readAsText(file)
  }, [])

  return (
    <>
      <SEO
        title="JSON to YAML Converter Online - Convert JSON to YAML Free"
        description="Free online JSON to YAML converter. Convert JSON to YAML format instantly. Perfect for Docker Compose, Kubernetes configs, CI/CD pipelines, and Ansible playbooks."
        keywords="JSON to YAML, convert JSON to YAML, YAML converter, JSON YAML online, YAML generator, config converter"
        canonicalPath="/json-to-yaml"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      <div className={`upload-zone ${dragOver ? 'dragover' : ''}`} onDragOver={(e: DragEvent) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)} onDrop={(e: DragEvent) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]) }}
        onClick={() => fileInputRef.current?.click()}>
        <div className="file-icon">📂</div>
        <p>{dragOver ? t('upload.dragover') : t('upload.title')}</p>
        <input ref={fileInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={(e: ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) { readFile(e.target.files[0]); e.target.value = '' } }} />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button className="btn btn-purple" onClick={handleConvert}>🔄 {t('yaml.convert')}</button>
        {output && <button className="btn btn-outline" onClick={handleCopy}>{t('btn.copy')}</button>}
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>{t('panel.input')} (JSON)</span></div>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t('textarea.placeholder')} spellCheck={false} />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>{t('yaml.output')}</span></div>
          <div className="output-area">{output || <span className="output-hint">{t('yaml.hint')}</span>}</div>
        </div>
      </div>

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>JSON vs YAML</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>📝 YAML (YAML Ain't Markup Language) is a human-readable data format popular in DevOps:</p>
          <p>• <strong>Docker Compose</strong> files use YAML</p>
          <p>• <strong>Kubernetes</strong> manifests are written in YAML</p>
          <p>• <strong>CI/CD pipelines</strong> (GitHub Actions, GitLab CI) use YAML</p>
          <p>• <strong>Ansible</strong> playbooks use YAML</p>
        </div>
      </section>
    </>
  )
}
