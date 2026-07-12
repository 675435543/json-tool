import { toPascalCase, toFieldName, toTypeName } from './utils'

function swiftType(val: any): string {
  if (val === null || val === undefined) return 'Any?'
  if (typeof val === 'string') return 'String'
  if (typeof val === 'number') return Number.isInteger(val) ? 'Int' : 'Double'
  if (typeof val === 'boolean') return 'Bool'
  if (Array.isArray(val)) {
    if (val.length === 0) return '[Any]'
    const inners = val.map(v => swiftType(v))
    const inner = inners.every(t => t === inners[0]) ? inners[0] : 'Any'
    return `[${inner}]`
  }
  return 'Any'
}

export function generateSwift(obj: any, rootName: string): string {
  const structs: string[] = []

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
        fields.push({ key: fname, type: `[${childName}]`, child: { name: childName, val: val[0] } })
      } else {
        fields.push({ key: fname, type: swiftType(val) })
      }
    }

    structs.push(`struct ${name}: Codable {`)
    for (const f of fields) {
      structs.push(`    let ${f.key}: ${f.type}`)
    }
    structs.push('}')
    structs.push('')

    for (const f of fields) {
      if (f.child) process(f.child.val, f.child.name)
    }
  }

  process(obj, toTypeName(rootName))
  return 'import Foundation\n\n' + structs.join('\n').trim()
}
