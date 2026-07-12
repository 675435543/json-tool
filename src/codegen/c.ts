import { toPascalCase, toFieldName, toTypeName } from './utils'

function cType(val: any): string {
  if (val === null || val === undefined) return 'char*'
  if (typeof val === 'string') return 'char*'
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double'
  if (typeof val === 'boolean') return 'int'
  if (Array.isArray(val) || typeof val === 'object') return '/* nested type */'
  return 'char*'
}

export function generateC(obj: any, rootName: string): string {
  const structs: string[] = []

  function process(obj: any, name: string): void {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return

    const fields: { key: string; type: string; child?: { name: string; val: any } }[] = []

    for (const [key, val] of Object.entries(obj)) {
      const fname = toFieldName(key)
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        const childName = name + toPascalCase(key)
        fields.push({ key: fname, type: `struct ${childName}*`, child: { name: childName, val } })
      } else if (Array.isArray(val)) {
        fields.push({ key: fname, type: '/* array, use pointer + length */' })
        if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
          const childName = name + toPascalCase(key) + 'Item'
          fields[fields.length - 1].child = { name: childName, val: val[0] }
        }
      } else {
        fields.push({ key: fname, type: cType(val) })
      }
    }

    structs.push(`typedef struct {`)
    for (const f of fields) {
      if (f.type.startsWith('/*')) {
        structs.push(`    ${f.type}`)
      } else {
        structs.push(`    ${f.type} ${f.key};`)
      }
    }
    structs.push(`} ${name};`)
    structs.push('')

    for (const f of fields) {
      if (f.child) process(f.child.val, f.child.name)
    }
  }

  process(obj, toTypeName(rootName))
  return `#include <stddef.h>\n\n${structs.join('\n').trim()}`
}
