import { toPascalCase, toFieldName, toTypeName } from './utils'

export function generateRuby(obj: any, rootName: string): string {
  const classes: string[] = []

  function process(obj: any, name: string): void {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return

    const fields: { key: string; child?: { name: string; val: any } }[] = []

    for (const [key, val] of Object.entries(obj)) {
      const fname = toFieldName(key)
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        const childName = name + toPascalCase(key)
        fields.push({ key: fname, child: { name: childName, val } })
      } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
        const childName = name + toPascalCase(key) + 'Item'
        fields.push({ key: fname, child: { name: childName, val: val[0] } })
      } else {
        fields.push({ key: fname })
      }
    }

    classes.push(`class ${name}`)
    if (fields.length > 0) {
      classes.push(`  attr_accessor :${fields.map(f => f.key).join(', :')}`)
      classes.push('')
      const params = fields.map(f => `${f.key}:`).join(', ')
      classes.push(`  def initialize(${params})`)
      for (const f of fields) {
        classes.push(`    @${f.key} = ${f.key}`)
      }
      classes.push('  end')
    }
    classes.push('end')
    classes.push('')

    for (const f of fields) {
      if (f.child) process(f.child.val, f.child.name)
    }
  }

  process(obj, toTypeName(rootName))
  return classes.join('\n').trim()
}
