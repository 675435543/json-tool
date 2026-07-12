import { toPascalCase, toFieldName, toTypeName } from './utils'

function cppType(val: any): string {
  if (val === null || val === undefined) return '/* unknown */'
  if (typeof val === 'string') return 'std::string'
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double'
  if (typeof val === 'boolean') return 'bool'
  if (Array.isArray(val)) {
    if (val.length === 0) return 'std::vector</* unknown */>'
    const inners = val.map(v => cppType(v))
    const inner = inners.every(t => t === inners[0]) ? inners[0] : '/* unknown */'
    return `std::vector<${inner}>`
  }
  return '/* unknown */'
}

export function generateCpp(obj: any, rootName: string): string {
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
        fields.push({ key: fname, type: `std::vector<${childName}>`, child: { name: childName, val: val[0] } })
      } else {
        fields.push({ key: fname, type: cppType(val) })
      }
    }

    structs.push(`struct ${name} {`)
    for (const f of fields) {
      structs.push(`    ${f.type} ${f.key};`)
    }
    structs.push('};')
    structs.push('')

    for (const f of fields) {
      if (f.child) process(f.child.val, f.child.name)
    }
  }

  process(obj, toTypeName(rootName))
  return `#include <string>\n#include <vector>\n\n${structs.join('\n').trim()}`
}
