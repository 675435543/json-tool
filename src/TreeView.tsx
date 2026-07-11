import { useState, useCallback } from 'react'

interface TreeViewProps {
  data: any
}

function formatPrimitive(val: any): { text: string; cls: string } {
  if (val === null) return { text: 'null', cls: 'tv-null' }
  if (typeof val === 'string') return { text: `"${val}"`, cls: 'tv-string' }
  if (typeof val === 'number') return { text: String(val), cls: 'tv-number' }
  if (typeof val === 'boolean') return { text: String(val), cls: 'tv-bool' }
  return { text: String(val), cls: '' }
}

function Branch({ name, val, defaultOpen }: { name?: string; val: any; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const toggle = useCallback(() => setOpen(o => !o), [])

  if (val === null || typeof val !== 'object') {
    const { text, cls } = formatPrimitive(val)
    return (
      <div className="tv-row">
        {name !== undefined && <span className="tv-key">{name}: </span>}
        <span className={cls}>{text}</span>
      </div>
    )
  }

  const isArray = Array.isArray(val)
  const entries = isArray
    ? (val as any[]).map((v, i) => [String(i), v] as [string, any])
    : Object.entries(val as Record<string, any>)
  const isEmpty = entries.length === 0
  const bracket = isArray ? (isEmpty ? '[]' : open ? '[' : `[${entries.length}]`) : (isEmpty ? '{}' : open ? '{' : `{${entries.length}}`)
  const count = entries.length

  return (
    <div className="tv-row">
      <span className="tv-toggle" onClick={toggle}>
        {isEmpty ? '  ' : open ? '▾' : '▸'}
      </span>
      {name !== undefined && <span className="tv-key">{name}: </span>}
      <span className="tv-bracket">{bracket}</span>
      {open && count > 0 && (
        <div className="tv-children">
          {entries.map(([k, v]) => (
            <Branch key={k} name={isArray ? undefined : k} val={v} defaultOpen={false} />
          ))}
        </div>
      )}
      {open && count > 0 && (
        <div className="tv-row">
          <span className="tv-bracket">{isArray ? ']' : '}'}</span>
        </div>
      )}
    </div>
  )
}

export default function TreeView({ data }: TreeViewProps) {
  return (
    <div className="tree-view">
      <Branch val={data} defaultOpen={true} />
    </div>
  )
}
