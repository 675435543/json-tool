/**
 * Schema-based Mock JSON Generator
 *
 * Users paste a sample/template JSON structure.
 * The tool infers types and generates realistic random data.
 */

// ─── Data pools ─────────────────────────────────────────────────

const FIRST_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack',
  'Kate', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rose', 'Sam', 'Tina',
  'Uma', 'Vince', 'Wendy', 'Xander', 'Yuki', 'Zoe',
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
  'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
  'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
]

const CITIES = [
  'Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou', 'Hangzhou', 'Wuhan', 'Chengdu',
  'Nanjing', 'Tokyo', 'Seoul', 'Singapore', 'New York', 'London', 'Berlin', 'Paris',
  'San Francisco', 'Sydney', 'Toronto', 'Amsterdam', 'Dubai',
]

const WORDS = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
  'ready', 'active', 'pending', 'complete', 'running', 'stopped', 'paused', 'error',
  'start', 'end', 'process', 'queue', 'batch', 'task', 'job', 'event',
  'main', 'backup', 'cache', 'buffer', 'config', 'data', 'file', 'filter',
]

const DOMAINS = [
  'example.com', 'test.io', 'demo.org', 'sample.net', 'mock.dev', 'api.local',
  'data.io', 'service.com', 'cloud.dev', 'app.io',
]

const SENTENCES = [
  'Lorem ipsum dolor sit amet',
  'Consectetur adipiscing elit',
  'Sed do eiusmod tempor incididunt',
  'Ut labore et dolore magna aliqua',
  'Ut enim ad minim veniam',
  'Quis nostrud exercitation ullamco',
  'Duis aute irure dolor in reprehenderit',
  'Excepteur sint occaecat cupidatat non proident',
  'The quick brown fox jumps over the lazy dog',
  'This is a sample sentence for testing purposes',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}


// ─── Type inference from sample values ─────────────────────────

type InferredType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'

interface InferredSchema {
  type: InferredType
  // For strings, try to guess the kind
  stringHint?: 'name' | 'email' | 'url' | 'date' | 'phone' | 'id' | 'city' | 'word' | 'sentence'
  // For numbers
  min?: number
  max?: number
  isInteger?: boolean
  // For objects
  properties?: Record<string, InferredSchema>
  // For arrays
  itemSchema?: InferredSchema
  // Original value for literal
  literal?: any
}

function inferType(value: any): InferredSchema {
  if (value === null || value === undefined) {
    return { type: 'null' }
  }

  if (typeof value === 'string') {
    let hint: InferredSchema['stringHint']

    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      hint = 'email'
    } else if (/^https?:\/\/.+/.test(value)) {
      hint = 'url'
    } else if (/^\d{11}$/.test(value)) {
      hint = 'phone'
    } else if (/^\d{1,10}$/.test(value)) {
      hint = 'id'
    } else if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{4}\/\d{2}\/\d{2}/.test(value)) {
      hint = 'date'
    } else if (/^[A-Z][a-z]+$/.test(value) && value.length <= 10) {
      hint = 'name'
    } else if (value.length > 15) {
      hint = 'sentence'
    } else {
      hint = 'word'
    }

    return { type: 'string', stringHint: hint }
  }

  if (typeof value === 'number') {
    const abs = Math.abs(value)
    const min = abs > 0 ? Math.max(0, value - abs * 0.5) : 0
    const max = value + abs * 0.5
    return {
      type: 'number',
      min: Math.round(min),
      max: Math.round(max),
      isInteger: Number.isInteger(value),
    }
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean' }
  }

  if (Array.isArray(value)) {
    const item: InferredSchema = value.length > 0 ? inferType(value[0]) : { type: 'string', stringHint: 'word' }
    return { type: 'array', itemSchema: item }
  }

  if (typeof value === 'object') {
    const properties: Record<string, InferredSchema> = {}
    for (const [key, val] of Object.entries(value)) {
      properties[key] = inferType(val)
    }
    return { type: 'object', properties }
  }

  return { type: 'string', literal: String(value) }
}

// ─── Generate mock values from schema ──────────────────────────

function generateValue(schema: InferredSchema, index: number): any {
  if (schema.type === 'null') return null

  if (schema.type === 'string') {
    if (schema.literal) return schema.literal

    switch (schema.stringHint) {
      case 'email':
        return `${pick(FIRST_NAMES).toLowerCase()}.${pick(LAST_NAMES).toLowerCase()}${Math.floor(Math.random() * 999) + 1}@${pick(DOMAINS)}`
      case 'url':
        return `https://${pick(DOMAINS)}/${pick(WORDS)}/${Math.floor(Math.random() * 100)}`
      case 'phone':
        return `1${Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')}`
      case 'date':
        const y = 2020 + Math.floor(Math.random() * 6)
        const m = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
        const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
        return `${y}-${m}-${d}`
      case 'id':
        return String(index + 1)
      case 'sentence':
        return pick(SENTENCES)
      case 'word':
        return pick(WORDS)
      case 'city':
        return pick(CITIES)
      case 'name':
      default:
        return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
    }
  }

  if (schema.type === 'number') {
    const min = schema.min ?? 0
    const max = schema.max ?? 100
    const range = Math.max(max - min, 1)
    const val = min + Math.random() * range
    return schema.isInteger ? Math.round(val) : Math.round(val * 100) / 100
  }

  if (schema.type === 'boolean') {
    return Math.random() > 0.5
  }

  if (schema.type === 'array') {
    const count = Math.floor(Math.random() * 3) + 2 // 2-4 items
    return Array.from({ length: count }, (_, i) => generateValue(schema.itemSchema!, i + 1))
  }

  if (schema.type === 'object' && schema.properties) {
    const result: Record<string, any> = {}
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      result[key] = generateValue(propSchema, index)
    }
    return result
  }

  return null
}

// ─── Main entry point ──────────────────────────────────────────

/**
 * Generate mock JSON data based on a sample JSON template.
 * @param template - A sample JSON object/array that defines the structure
 * @param count - Number of records to generate
 * @returns Array of generated records (or single object if array input)
 */
export function generateMockData(template: any, count: number): any {
  const isArray = Array.isArray(template)
  const schema = isArray && template.length > 0
    ? inferType(template[0])
    : inferType(template)

  if (isArray) {
    return Array.from({ length: count }, (_, i) => generateValue(schema!, i + 1))
  } else {
    // Single object mode: if count > 1, return array of objects
    if (count > 1) {
      return Array.from({ length: count }, (_, i) => generateValue(schema, i + 1))
    }
    return generateValue(schema, 1)
  }
}

/**
 * Generate a single value from a schema template.
 */
export function generateFromSchema(template: any, index: number): any {
  const schema = inferType(template)
  return generateValue(schema, index)
}
