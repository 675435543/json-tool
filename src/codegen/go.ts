import { toPascalCase } from './utils'

function goType(val: any): string {
  if (val === null || val === undefined) return 'interface{}'
  if (typeof val === 'string') return 'string'
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float64'
  if (typeof val === 'boolean') return 'bool'
  if (Array.isArray(val)) {
    if (val.length === 0) return '[]interface{}'
    const inners = val.map(v => goType(v))
    const inner = inners.every(t => t === inners[0]) ? inners[0] : 'interface{}'
    return `[]${inner}`
  }
  return 'interface{}'
}

export function generateGo(obj: any, rootName: string): string {
  const structs: string[] = []

  function process(obj: any, name: string): void {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return

    const fields: { key: string; type: string; json: string; child?: { name: string; val: any } }[] = []

    for (const [key, val] of Object.entries(obj)) {
      const jsonKey = key
      const fname = toPascalCase(key)
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        const childName = name + toPascalCase(key)
        fields.push({ key: fname, type: childName, json: jsonKey, child: { name: childName, val } })
      } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
        const childName = name + toPascalCase(key) + 'Item'
        fields.push({ key: fname, type: `[]${childName}`, json: jsonKey, child: { name: childName, val: val[0] } })
      } else {
        fields.push({ key: fname, type: goType(val), json: jsonKey })
      }
    }

    structs.push(`type ${name} struct {`)
    for (const f of fields) {
      structs.push(`\t${f.key} ${f.type} \`json:"${f.json}"\``)
    }
    structs.push('}')
    structs.push('')

    for (const f of fields) {
      if (f.child) process(f.child.val, f.child.name)
    }
  }

  process(obj, toPascalCase(rootName))
  return structs.join('\n').trim()
}
