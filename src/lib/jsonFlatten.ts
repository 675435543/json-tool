/**
 * JSON Flatten / Unflatten
 * Flattens nested JSON into dot-notation and can unflatten back.
 */

export function flattenJSON(data: any, prefix: string = '', separator: string = '.'): Record<string, any> {
  const result: Record<string, any> = {}

  function flatten(value: any, path: string) {
    if (value === null || value === undefined) {
      result[path] = value
      return
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        result[path] = []
        return
      }
      for (let i = 0; i < value.length; i++) {
        flatten(value[i], `${path}[${i}]`)
      }
      return
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value)
      if (keys.length === 0) {
        result[path] = {}
        return
      }
      for (const key of keys) {
        flatten(value[key], path ? `${path}${separator}${key}` : key)
      }
      return
    }

    // Primitive value
    result[path] = value
  }

  flatten(data, prefix)
  return result
}

export function unflattenJSON(flat: Record<string, any>, separator: string = '.'): any {
  const result: any = {}

  for (const key of Object.keys(flat)) {
    const value = flat[key]
    setNestedValue(result, key, value, separator)
  }

  return result
}

function setNestedValue(obj: any, path: string, value: any, separator: string) {
  // Parse path into segments
  const segments: string[] = []
  let current = ''
  let inBracket = false

  for (let i = 0; i < path.length; i++) {
    const ch = path[i]
    if (ch === '[') {
      if (current) segments.push(current)
      current = ''
      inBracket = true
    } else if (ch === ']') {
      if (current) segments.push(current)
      current = ''
      inBracket = false
    } else if (ch === separator && !inBracket) {
      if (current) segments.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current) segments.push(current)

  let currentObj = obj
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const isLast = i === segments.length - 1
    const nextIsArray = !isLast && /^\d+$/.test(segments[i + 1])

    if (isLast) {
      // Try to preserve number type
      if (!isNaN(Number(value)) && value !== '' && value !== true && value !== false && value !== null) {
        currentObj[seg] = Number(value)
      } else {
        currentObj[seg] = value
      }
    } else {
      if (!currentObj[seg]) {
        currentObj[seg] = nextIsArray ? [] : {}
      }
      currentObj = currentObj[seg]
    }
  }
}
