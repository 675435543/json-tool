import { toPascalCase, toFieldName, toTypeName } from './utils'

function pyType(val: any): string {
  if (val === null || val === undefined) return 'Any'
  if (typeof val === 'string') return 'str'
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float'
  if (typeof val === 'boolean') return 'bool'
  if (Array.isArray(val)) {
    if (val.length === 0) return 'list[Any]'
    const inners = val.map(v => pyType(v))
    const inner = inners.every(t => t === inners[0]) ? inners[0] : 'Any'
    return `list[${inner}]`
  }
  return 'Any'
}

export function generatePython(obj: any, rootName: string): string {
  const lines: string[] = []
  const classes: string[] = []

  function process(obj: any, name: string): void {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return

    const fields: { key: string; type: string; child?: { name: string; val: any } }[] = []

    for (const [key, val] of Object.entries(obj)) {
      const fname = toFieldName(key)
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        const childName = toTypeName(name + toPascalCase(key))
        fields.push({ key: fname, type: childName, child: { name: childName, val } })
      } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
        const childName = toTypeName(name + toPascalCase(key) + 'Item')
        fields.push({ key: fname, type: `list[${childName}]`, child: { name: childName, val: val[0] } })
      } else {
        fields.push({ key: fname, type: pyType(val) })
      }
    }

    classes.push(`class ${name}:`)
    if (fields.length === 0) {
      classes.push('    pass')
    } else {
      const params = fields.map(f => `${f.key}: ${f.type}`).join(', ')
      classes.push(`    def __init__(self, ${params}):`)
      for (const f of fields) {
        classes.push(`        self.${f.key} = ${f.key}`)
      }
    }
    classes.push('')

    for (const f of fields) {
      if (f.child) process(f.child.val, f.child.name)
    }
  }

  process(obj, toTypeName(rootName))
  return classes.join('\n').trim()
}
