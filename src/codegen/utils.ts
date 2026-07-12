export function toPascalCase(s: string): string {
  return s.replace(/[^a-zA-Z0-9_]/g, '_').replace(/(?:^|_)(\w)/g, (_, c) => c.toUpperCase())
}

export function toFieldName(s: string): string {
  return s.replace(/[^a-zA-Z0-9_]/g, '_')
}

export function toTypeName(s: string): string {
  const pascal = toPascalCase(s)
  if (/^\d/.test(pascal)) return `_${pascal}`
  return pascal
}

export function safeName(s: string): string {
  const cleaned = s.replace(/[^a-zA-Z0-9_]/g, '_')
  if (/^\d/.test(cleaned)) return `_${cleaned}`
  return cleaned
}

export function indent(lines: string, level: number = 1): string {
  const pad = '  '.repeat(level)
  return lines.split('\n').map(l => l ? pad + l : l).join('\n')
}
