// ============ Shared utility functions for all tool pages ============

export function toPascalCase(s: string): string {
  return s.replace(/[^a-zA-Z0-9_]/g, '_').replace(/(?:^|_)(\w)/g, (_, c) => c.toUpperCase())
}

export function toTSName(key: string): string {
  const s = key.replace(/[^a-zA-Z0-9_]/g, '_')
  if (/^[0-9]/.test(s)) return `_${s}`
  return s
}

export function tryParseJSON(trimmed: string): any | null {
  try { return JSON.parse(trimmed) } catch { return null }
}

export function parseError(e: any, jsonStr: string, t: (key: string, opts?: any) => string): string {
  const msg = (e as Error).message || ''
  const match = msg.match(/position\s+(\d+)/)
  if (match) {
    const pos = parseInt(match[1])
    const before = jsonStr.slice(0, pos)
    const line = before.split('\n').length
    const lastNewline = before.lastIndexOf('\n')
    const col = pos - lastNewline
    const cleanMsg = msg.replace(/^.*?position\s+\d+\s*/g, '')
    return t('error.position', { line, col, msg: cleanMsg })
  }
  return t('error.parse', { msg })
}

// ============ JSON → Java POJO ============

function javaType(val: any): string {
  if (val === null || val === undefined) return 'Object'
  if (typeof val === 'string') return 'String'
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double'
  if (typeof val === 'boolean') return 'boolean'
  if (Array.isArray(val)) {
    if (val.length === 0) return 'List<Object>'
    const inner = val.map((v: any) => javaType(v))
    const innerType = inner.every((t: string) => t === inner[0]) ? inner[0] : 'Object'
    return `List<${innerType}>`
  }
  return 'Object'
}

export function generateJavaClass(obj: Record<string, any>, className: string): string {
  const lines: string[] = []
  const innerClasses: string[] = []

  lines.push(`public class ${className} {`)

  for (const [key, val] of Object.entries(obj)) {
    const fieldName = key.replace(/[^a-zA-Z0-9_]/g, '_')
    const capName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    let type: string

    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      const innerName = `${className}${toPascalCase(fieldName)}`
      type = innerName
      innerClasses.push(generateJavaClass(val, innerName))
    } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
      const innerName = `${className}${toPascalCase(fieldName)}Item`
      type = `List<${innerName}>`
      innerClasses.push(generateJavaClass(val[0], innerName))
    } else {
      type = javaType(val)
    }

    lines.push(``)
    lines.push(`    private ${type} ${fieldName};`)
    lines.push(``)
    lines.push(`    public ${type} get${capName}() {`)
    lines.push(`        return ${fieldName};`)
    lines.push(`    }`)
    lines.push(``)
    lines.push(`    public void set${capName}(${type} ${fieldName}) {`)
    lines.push(`        this.${fieldName} = ${fieldName};`)
    lines.push(`    }`)
  }

  lines.push(`}`)
  lines.push(``)
  lines.push(...innerClasses)

  return lines.join('\n')
}

// ============ JSON → TypeScript ============

function tsType(val: any, seen: Set<any>): string {
  if (val === null || val === undefined) return 'any'
  if (typeof val === 'string') return 'string'
  if (typeof val === 'number') return 'number'
  if (typeof val === 'boolean') return 'boolean'
  if (Array.isArray(val)) {
    if (val.length === 0) return 'any[]'
    const inners = val.map((v: any) => tsType(v, seen))
    const inner = inners.every((t: string) => t === inners[0]) ? inners[0] : 'any'
    return `${inner}[]`
  }
  if (typeof val === 'object') {
    if (seen.has(val)) return 'any /* circular */'
    seen.add(val)
    const entries = Object.entries(val as Record<string, any>)
    if (entries.length === 0) return 'Record<string, any>'
    const props = entries.map(([k, v]) => `  ${toTSName(k)}: ${tsType(v, seen)};`)
    return `{\n${props.join('\n')}\n}`
  }
  return 'any'
}

export function generateTSInterfaces(obj: Record<string, any>, name: string): string {
  const lines: string[] = []
  const used = new Set<string>()
  const seen = new Set<any>()

  function process(obj: any, name: string): string {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return tsType(obj, seen)
    const id = name
    if (used.has(id)) return id
    used.add(id)

    const props: string[] = []
    const children: { key: string; childName: string; val: any }[] = []

    for (const [key, val] of Object.entries(obj as Record<string, any>)) {
      const k = toTSName(key)
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        const childName = `${name}${toPascalCase(key)}`
        children.push({ key: k, childName, val })
        props.push(`  ${k}: ${childName};`)
      } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
        const childName = `${name}${toPascalCase(key)}Item`
        children.push({ key: k, childName, val: val[0] })
        props.push(`  ${k}: ${childName}[];`)
      } else {
        props.push(`  ${k}: ${tsType(val, new Set())};`)
      }
    }

    lines.push(`export interface ${name} {`)
    lines.push(props.join('\n'))
    lines.push('}')
    lines.push('')

    for (const child of children) {
      process(child.val, child.childName)
    }

    return name
  }

  process(obj, name)
  return lines.join('\n')
}

// ============ JSON → CSV ============

export function jsonToCSV(data: any): string | null {
  const arr = Array.isArray(data) ? data : [data]
  if (arr.length === 0) return null
  const first = arr[0]
  if (typeof first !== 'object' || first === null) return null
  const headers = Object.keys(first)
  const escapeCSV = (val: any): string => {
    const s = val === null || val === undefined ? '' : String(val)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const rows = arr.map((item: any) => headers.map((h: string) => escapeCSV(item[h])).join(','))
  return [headers.join(','), ...rows].join('\n')
}

// ============ JSON Diff ============

export interface DiffEntry {
  path: string
  type: 'added' | 'removed' | 'modified'
  a?: string
  b?: string
}

export function diffJSON(a: any, b: any, path = ''): DiffEntry[] {
  const result: DiffEntry[] = []

  if (a === b) return result

  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b) || a === null || b === null) {
    result.push({ path, type: 'modified', a: JSON.stringify(a), b: JSON.stringify(b) })
    return result
  }

  if (typeof a === 'object') {
    if (Array.isArray(a) && Array.isArray(b)) {
      const maxLen = Math.max(a.length, b.length)
      for (let i = 0; i < maxLen; i++) {
        const p = `${path}[${i}]`
        if (i >= a.length) {
          result.push({ path: p, type: 'added', b: JSON.stringify(b[i]) })
        } else if (i >= b.length) {
          result.push({ path: p, type: 'removed', a: JSON.stringify(a[i]) })
        } else {
          result.push(...diffJSON(a[i], b[i], p))
        }
      }
    } else {
      const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])
      for (const key of allKeys) {
        const p = path ? `${path}.${key}` : key
        if (!(key in a)) {
          result.push({ path: p, type: 'added', b: JSON.stringify(b[key]) })
        } else if (!(key in b)) {
          result.push({ path: p, type: 'removed', a: JSON.stringify(a[key]) })
        } else {
          result.push(...diffJSON(a[key], b[key], p))
        }
      }
    }
  } else {
    result.push({ path, type: 'modified', a: String(a), b: String(b) })
  }

  return result
}

// ============ JSON → YAML ============

export function jsonToYaml(obj: any, indent: number): string {
  if (obj === null || obj === undefined) return 'null'
  if (typeof obj === 'string') return `"${obj.replace(/"/g, '\\"')}"`
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    return obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        const lines = jsonToYaml(item, indent + 2).split('\n')
        return '- ' + lines[0] + '\n' + lines.slice(1).map(l => '  ' + l).join('\n')
      }
      return '- ' + jsonToYaml(item, indent)
    }).join('\n')
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj)
    if (keys.length === 0) return '{}'
    return keys.map(key => {
      const val = obj[key]
      const yv = jsonToYaml(val, indent + 2)
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        const lines = yv.split('\n')
        return key + ':\n' + lines.map(l => '  ' + l).join('\n')
      } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
        return key + ':\n' + yv.split('\n').map(l => '  ' + l).join('\n')
      }
      return key + ': ' + yv
    }).join('\n')
  }
  return String(obj)
}

// ============ Visual JSON Diff (side-by-side HTML) ============

export type VisualDiffType = 'added' | 'removed' | 'modified'

/**
 * Custom JSON-to-HTML serializer that highlights diff'ed leaf values
 * by wrapping their line in a colored <span>.
 */
function serializeDiffJSON(
  obj: any,
  path: string,
  depth: number,
  indent: string,
  diffMap: Map<string, VisualDiffType>,
  lines: string[]
): void {
  const prefix = indent.repeat(depth)

  if (obj === null || typeof obj !== 'object') {
    // Primitive value
    const valStr = obj === null ? 'null' :
      typeof obj === 'string' ? JSON.stringify(obj) :
      String(obj)
    const diffType = diffMap.get(path)
    if (diffType) {
      const cls = diffType === 'added' ? 'vd-add' : diffType === 'removed' ? 'vd-rem' : 'vd-mod'
      lines.push(`<span class="${cls}">${prefix}${valStr}</span>`)
    } else {
      lines.push(`${prefix}${valStr}`)
    }
    return
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      const diffType = diffMap.get(path)
      if (diffType) {
        const cls = diffType === 'added' ? 'vd-add' : diffType === 'removed' ? 'vd-rem' : 'vd-mod'
        lines.push(`<span class="${cls}">${prefix}[]</span>`)
      } else {
        lines.push(`${prefix}[]`)
      }
      return
    }
    lines.push(`${prefix}[`)
    for (let i = 0; i < obj.length; i++) {
      const childPath = `${path}[${i}]`
      serializeDiffJSON(obj[i], childPath, depth + 1, indent, diffMap, lines)
      if (i < obj.length - 1) {
        // Append comma to the previous line
        const lastIdx = lines.length - 1
        const last = lines[lastIdx]
        if (last.endsWith('</span>')) {
          lines[lastIdx] = last.slice(0, -7) + ',</span>'
        } else {
          lines[lastIdx] = last + ','
        }
      }
    }
    lines.push(`${prefix}]`)
    return
  }

  // Plain object
  const keys = Object.keys(obj)
  if (keys.length === 0) {
    const diffType = diffMap.get(path)
    if (diffType) {
      const cls = diffType === 'added' ? 'vd-add' : diffType === 'removed' ? 'vd-rem' : 'vd-mod'
      lines.push(`<span class="${cls}">${prefix}{}</span>`)
    } else {
      lines.push(`${prefix}{}`)
    }
    return
  }

  lines.push(`${prefix}{`)

  keys.forEach((key, idx) => {
    const childPath = path ? `${path}.${key}` : key
    const val = obj[key]
    const comma = idx < keys.length - 1
    const indent1 = indent.repeat(depth + 1)
    const quotedKey = JSON.stringify(key)

    if (val === null || typeof val !== 'object') {
      // Simple value — put on one line: "key": value,
      const valStr = val === null ? 'null' :
        typeof val === 'string' ? JSON.stringify(val) :
        String(val)
      const content = `${indent1}${quotedKey}: ${valStr}${comma ? ',' : ''}`
      const diffType = diffMap.get(childPath)
      if (diffType) {
        const cls = diffType === 'added' ? 'vd-add' : diffType === 'removed' ? 'vd-rem' : 'vd-mod'
        lines.push(`<span class="${cls}">${content}</span>`)
      } else {
        lines.push(content)
      }
    } else if (Array.isArray(val) && val.length === 0) {
      const content = `${indent1}${quotedKey}: []${comma ? ',' : ''}`
      const diffType = diffMap.get(childPath)
      if (diffType) {
        const cls = diffType === 'added' ? 'vd-add' : diffType === 'removed' ? 'vd-rem' : 'vd-mod'
        lines.push(`<span class="${cls}">${content}</span>`)
      } else {
        lines.push(content)
      }
    } else {
      // Object or non-empty array as value
      lines.push(`${indent1}${quotedKey}:`)
      serializeDiffJSON(val, childPath, depth + 1, indent, diffMap, lines)
      // Comma goes on the last line of the value
      if (comma) {
        const lastIdx = lines.length - 1
        const last = lines[lastIdx]
        if (last.endsWith('</span>')) {
          lines[lastIdx] = last.slice(0, -7) + ',</span>'
        } else {
          lines[lastIdx] = last + ','
        }
      }
    }
  })

  lines.push(`${prefix}}`)
}

/**
 * Render a visual diff panel for one side.
 * @returns HTML string with color-coded <span> elements.
 */
export function renderVisualDiff(
  parsedJSON: any,
  diffEntries: DiffEntry[],
  side: 'a' | 'b'
): string {
  const diffMap = new Map<string, VisualDiffType>()
  for (const entry of diffEntries) {
    // For side 'a': show removed in red, modified in yellow
    // For side 'b': show added in green, modified in yellow
    if (side === 'a') {
      if (entry.type === 'removed' || entry.type === 'modified') {
        diffMap.set(entry.path, entry.type)
      }
    } else {
      if (entry.type === 'added' || entry.type === 'modified') {
        diffMap.set(entry.path, entry.type)
      }
    }
  }

  const lines: string[] = []
  serializeDiffJSON(parsedJSON, '', 0, '  ', diffMap, lines)
  return lines.join('\n')
}
