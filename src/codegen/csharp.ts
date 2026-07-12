import { toPascalCase, toFieldName, toTypeName } from './utils'

function csType(val: any): string {
  if (val === null || val === undefined) return 'object'
  if (typeof val === 'string') return 'string'
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double'
  if (typeof val === 'boolean') return 'bool'
  if (Array.isArray(val)) {
    if (val.length === 0) return 'List<object>'
    const inners = val.map(v => csType(v))
    const inner = inners.every(t => t === inners[0]) ? inners[0] : 'object'
    return `List<${inner}>`
  }
  return 'object'
}

export function generateCSharp(obj: any, rootName: string): string {
  const classes: string[] = []

  function process(obj: any, name: string): void {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return

    const fields: { key: string; type: string; capKey: string; child?: { name: string; val: any } }[] = []

    for (const [key, val] of Object.entries(obj)) {
      const fname = toFieldName(key)
      const capKey = fname.charAt(0).toUpperCase() + fname.slice(1)
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        const childName = name + toPascalCase(key)
        fields.push({ key: fname, type: childName, capKey, child: { name: childName, val } })
      } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
        const childName = name + toPascalCase(key) + 'Item'
        fields.push({ key: fname, type: `List<${childName}>`, capKey, child: { name: childName, val: val[0] } })
      } else {
        fields.push({ key: fname, type: csType(val), capKey })
      }
    }

    classes.push(`public class ${name}`)
    classes.push('{')
    for (const f of fields) {
      classes.push(`    public ${f.type} ${f.capKey} { get; set; }`)
    }
    classes.push('}')
    classes.push('')

    for (const f of fields) {
      if (f.child) process(f.child.val, f.child.name)
    }
  }

  process(obj, toTypeName(rootName))
  return `using System.Collections.Generic;\n\n${classes.join('\n').trim()}`
}
