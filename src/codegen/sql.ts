import { toFieldName, toTypeName } from './utils'

function sqlType(val: any, isPrimary?: boolean): string {
  if (isPrimary) return 'INTEGER PRIMARY KEY AUTOINCREMENT'
  if (val === null || val === undefined) return 'TEXT'
  if (typeof val === 'string') {
    return val.length > 255 ? 'TEXT' : `VARCHAR(${Math.max(255, val.length)})`
  }
  if (typeof val === 'number') return Number.isInteger(val) ? 'INTEGER' : 'REAL'
  if (typeof val === 'boolean') return 'BOOLEAN'
  return 'TEXT'
}

export function generateSQL(obj: any, rootName: string): string {
  const tableName = toFieldName(rootName).toLowerCase()
  const lines: string[] = []

  // Flatten first-level fields from the first object
  // If root is array, use the first element
  const sample = Array.isArray(obj) ? (obj.length > 0 ? obj[0] : null) : obj
  if (!sample || typeof sample !== 'object') {
    return `-- Cannot generate CREATE TABLE from provided JSON`
  }

  const entries = Object.entries(sample) as [string, any][]

  lines.push(`CREATE TABLE ${tableName} (`)
  lines.push(`    id INTEGER PRIMARY KEY AUTOINCREMENT,`)

  for (let i = 0; i < entries.length; i++) {
    const [key, val] = entries[i]
    const col = toFieldName(key).toLowerCase()
    const isLast = i === entries.length - 1
    const type = sqlType(val)
    const nullable = val === null ? '' : ' NOT NULL'
    lines.push(`    ${col} ${type}${nullable}${isLast ? '' : ','}`)
  }

  lines.push(');')
  lines.push('')

  // Add comment for nested/complex types
  const hasNested = entries.some(([, v]) => v !== null && typeof v === 'object')
  if (hasNested) {
    lines.push('-- Note: Some fields are objects/arrays and stored as TEXT/JSON.')
    lines.push('-- Consider creating separate related tables for normalized design.')
  }

  return lines.join('\n')
}
