import { toPascalCase, toFieldName, toTypeName } from './utils'

function rustType(val: any): string {
  if (val === null || val === undefined) return 'Option<serde_json::Value>'
  if (typeof val === 'string') return 'String'
  if (typeof val === 'number') return Number.isInteger(val) ? 'i64' : 'f64'
  if (typeof val === 'boolean') return 'bool'
  if (Array.isArray(val)) {
    if (val.length === 0) return 'Vec<serde_json::Value>'
    const inners = val.map(v => rustType(v))
    const inner = inners.every(t => t === inners[0]) ? inners[0] : 'serde_json::Value'
    return `Vec<${inner}>`
  }
  return 'serde_json::Value'
}

export function generateRust(obj: any, rootName: string): string {
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
        fields.push({ key: fname, type: `Vec<${childName}>`, child: { name: childName, val: val[0] } })
      } else {
        fields.push({ key: fname, type: rustType(val) })
      }
    }

    structs.push(`#[derive(Debug, Clone, Serialize, Deserialize)]`)
    structs.push(`#[serde(rename_all = "camelCase")]`)
    structs.push(`pub struct ${name} {`)
    for (const f of fields) {
      structs.push(`    pub ${f.key}: ${f.type},`)
    }
    structs.push('}')
    structs.push('')

    for (const f of fields) {
      if (f.child) process(f.child.val, f.child.name)
    }
  }

  process(obj, toTypeName(rootName))
  return `use serde::{Deserialize, Serialize};\n\n${structs.join('\n').trim()}`
}
