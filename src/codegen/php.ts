import { toPascalCase, toFieldName, toTypeName } from './utils'

function phpType(val: any): string {
  if (val === null || val === undefined) return 'mixed'
  if (typeof val === 'string') return 'string'
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float'
  if (typeof val === 'boolean') return 'bool'
  if (Array.isArray(val)) {
    if (val.length === 0) return 'array'
    return `array`
  }
  return 'mixed'
}

export function generatePHP(obj: any, rootName: string): string {
  const classes: string[] = []

  function process(obj: any, name: string): void {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return

    const fields: { key: string; type: string; child?: { name: string; val: any } }[] = []

    for (const [key, val] of Object.entries(obj)) {
      const fname = toFieldName(key)
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        const childName = name + toPascalCase(key)
        fields.push({ key: fname, type: childName, child: { name: childName, val } })
      } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
        const childName = name + toPascalCase(key) + 'Item'
        fields.push({ key: fname, type: 'array', child: { name: childName, val: val[0] } })
      } else {
        fields.push({ key: fname, type: phpType(val) })
      }
    }

    classes.push(`class ${name}`)
    classes.push('{')
    for (const f of fields) {
      classes.push(`    public ${f.type} $${f.key};`)
    }
    classes.push('}')
    classes.push('')

    for (const f of fields) {
      if (f.child) process(f.child.val, f.child.name)
    }
  }

  process(obj, toTypeName(rootName))
  return `<?php\n\n${classes.join('\n').trim()}\n`
}
