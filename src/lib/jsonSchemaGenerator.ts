/**
 * JSON Schema Generator
 * Generates JSON Schema (draft-07) from JSON data.
 */

export function generateSchema(data: any, rootName: string = 'Root'): object {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: `https://jsonprocess.app/schemas/${rootName.toLowerCase()}`,
    title: rootName,
    ...inferType(data, rootName),
  }
}

function inferType(value: any, path: string): Record<string, any> {
  if (value === null) {
    return { type: 'null' }
  }

  if (Array.isArray(value)) {
    return inferArrayType(value, path)
  }

  const type = typeof value
  switch (type) {
    case 'string':
      return inferStringType(value, path)
    case 'number':
      return inferNumberType(value)
    case 'boolean':
      return { type: 'boolean' }
    case 'object':
      return inferObjectType(value, path)
    default:
      return { type: 'string' }
  }
}

function inferStringType(value: string, path: string): Record<string, any> {
  const schema: Record<string, any> = { type: 'string' }

  // Detect date/time patterns
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    schema.format = 'date-time'
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    schema.format = 'date'
  } else if (/^https?:\/\//.test(value)) {
    schema.format = 'uri'
  } else if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(value)) {
    schema.format = 'email'
  } else if (/^\d{10,11}$/.test(value)) {
    schema.format = 'phone'
  } else if (path.toLowerCase().includes('url') || path.toLowerCase().includes('link')) {
    schema.format = 'uri'
  } else if (path.toLowerCase().includes('email')) {
    schema.format = 'email'
  } else if (path.toLowerCase().includes('date') || path.toLowerCase().includes('time')) {
    schema.format = 'date-time'
  }

  return schema
}

function inferNumberType(value: number): Record<string, any> {
  const schema: Record<string, any> = { type: 'number' }
  if (Number.isInteger(value)) {
    schema.type = 'integer'
  }
  return schema
}

function inferObjectType(value: Record<string, any>, path: string): Record<string, any> {
  const properties: Record<string, any> = {}
  const required: string[] = []

  for (const key of Object.keys(value)) {
    const childPath = path ? `${path}.${key}` : key
    properties[key] = inferType(value[key], childPath)
    // Only mark as required if we have sample data
    if (value[key] !== null && value[key] !== undefined) {
      required.push(key)
    }
  }

  const schema: Record<string, any> = {
    type: 'object',
    properties,
  }

  if (required.length > 0) {
    schema.required = required
  }

  if (Object.keys(value).length === 0) {
    schema.additionalProperties = true
    schema.description = 'Empty object — add properties as needed'
  }

  return schema
}

function inferArrayType(value: any[], path: string): Record<string, any> {
  const schema: Record<string, any> = {
    type: 'array',
  }

  if (value.length === 0) {
    schema.items = {}
    schema.description = 'Empty array — items type is unknown'
    return schema
  }

  // Analyze all items to find common type
  const uniqueSchemas = new Map<string, Record<string, any>>()
  for (const item of value) {
    const itemPath = `${path}[0]`
    const itemSchema = inferType(item, itemPath)
    const key = JSON.stringify(itemSchema)
    if (!uniqueSchemas.has(key)) {
      uniqueSchemas.set(key, itemSchema)
    }
  }

  if (uniqueSchemas.size === 1) {
    // All items have the same type
    schema.items = uniqueSchemas.values().next().value
  } else {
    // Mixed types — use oneOf or anyOf
    schema.items = {
      anyOf: Array.from(uniqueSchemas.values()),
    }
  }

  return schema
}
