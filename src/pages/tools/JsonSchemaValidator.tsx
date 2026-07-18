import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

// Lightweight JSON Schema validator (supports core keywords)
function validateSchema(instance: any, schema: any, path = '$'): string[] {
  const errors: string[] = []

  if (schema.type && typeof instance !== schema.type) {
    if (schema.type === 'array' && !Array.isArray(instance)) errors.push(`${path}: expected ${schema.type}, got ${typeof instance}`)
    else if (schema.type !== 'array') errors.push(`${path}: expected ${schema.type}, got ${typeof instance}`)
    return errors
  }

  if (schema.type === 'object' && typeof instance === 'object' && !Array.isArray(instance)) {
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in instance)) errors.push(`${path}: missing required field "${key}"`)
      }
    }
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in instance) {
          errors.push(...validateSchema(instance[key], propSchema, `${path}.${key}`))
        }
      }
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties || {}))
      for (const key of Object.keys(instance)) {
        if (!allowed.has(key)) errors.push(`${path}.${key}: additional property not allowed`)
      }
    }
  }

  if (schema.type === 'array' && Array.isArray(instance)) {
    if (schema.minItems !== undefined && instance.length < schema.minItems) {
      errors.push(`${path}: expected at least ${schema.minItems} items, got ${instance.length}`)
    }
    if (schema.maxItems !== undefined && instance.length > schema.maxItems) {
      errors.push(`${path}: expected at most ${schema.maxItems} items, got ${instance.length}`)
    }
    if (schema.items) {
      instance.forEach((item, i) => {
        errors.push(...validateSchema(item, schema.items, `${path}[${i}]`))
      })
    }
  }

  if (typeof instance === 'string') {
    if (schema.minLength !== undefined && instance.length < schema.minLength) errors.push(`${path}: minLength ${schema.minLength}, got ${instance.length}`)
    if (schema.maxLength !== undefined && instance.length > schema.maxLength) errors.push(`${path}: maxLength ${schema.maxLength}, got ${instance.length}`)
    if (schema.pattern) {
      try { if (!new RegExp(schema.pattern).test(instance)) errors.push(`${path}: does not match pattern /${schema.pattern}/`) }
      catch { errors.push(`${path}: invalid regex pattern "${schema.pattern}"`) }
    }
    if (schema.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(instance)) errors.push(`${path}: invalid email format`)
    if (schema.format === 'uri' && !/^https?:\/\/.+/.test(instance)) errors.push(`${path}: invalid URI format`)
  }

  if (typeof instance === 'number') {
    if (schema.minimum !== undefined && instance < schema.minimum) errors.push(`${path}: minimum ${schema.minimum}, got ${instance}`)
    if (schema.maximum !== undefined && instance > schema.maximum) errors.push(`${path}: maximum ${schema.maximum}, got ${instance}`)
    if (schema.multipleOf !== undefined && instance % schema.multipleOf !== 0) errors.push(`${path}: must be multiple of ${schema.multipleOf}`)
  }

  if (schema.enum && !schema.enum.includes(instance)) {
    errors.push(`${path}: must be one of [${schema.enum.join(', ')}]`)
  }

  return errors
}

const EXAMPLE_SCHEMA = `{
  "type": "object",
  "properties": {
    "name": { "type": "string", "minLength": 2 },
    "age": { "type": "number", "minimum": 0, "maximum": 150 },
    "email": { "type": "string", "format": "email" },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["name", "email"]
}`

const EXAMPLE_DATA = `{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "tags": ["developer", "json"]
}`

export default function JsonSchemaValidator() {
  const [schemaInput, setSchemaInput] = useState('')
  const [dataInput, setDataInput] = useState('')
  const [result, setResult] = useState<{ valid: boolean; errors: string[] } | null>(null)

  const handleValidate = useCallback(() => {
    try {
      const schema = JSON.parse(schemaInput.trim())
      const data = JSON.parse(dataInput.trim())
      const errors = validateSchema(data, schema)
      setResult({ valid: errors.length === 0, errors })
    } catch (e: any) {
      setResult({ valid: false, errors: [`Parse error: ${(e as Error).message}`] })
    }
  }, [schemaInput, dataInput])

  const handleLoadExample = () => {
    setSchemaInput(EXAMPLE_SCHEMA)
    setDataInput(EXAMPLE_DATA)
    setResult(null)
  }

  return (
    <>
      <SEO
        title="JSON Schema Validator Online - Validate JSON Against Schema"
        description="Free online JSON Schema validator: validate JSON data against a JSON Schema definition. Check required fields, data types, string patterns, numeric ranges, and more."
        keywords="JSON Schema validator, validate JSON Schema online, JSON Schema validation, JSON data validator, JSON contract testing"
        canonicalPath="/json-schema-validator"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '12px', display: 'inline-block', textDecoration: 'none' }}>← Back to Home</Link>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button className="btn btn-warning" onClick={handleValidate}>✅ Validate Against Schema</button>
        <button className="btn btn-outline" onClick={handleLoadExample}>📋 Load Example</button>
      </div>

      <div className="editor-area">
        <div className="editor-panel">
          <div className="panel-header"><span>JSON Schema</span></div>
          <textarea value={schemaInput} onChange={e => setSchemaInput(e.target.value)} placeholder='Paste your JSON Schema here...' spellCheck={false} style={{ minHeight: '250px' }} />
        </div>
        <div className="editor-panel">
          <div className="panel-header"><span>JSON Data</span></div>
          <textarea value={dataInput} onChange={e => setDataInput(e.target.value)} placeholder='Paste JSON data to validate...' spellCheck={false} style={{ minHeight: '250px' }} />
        </div>
      </div>

      {result && (
        <div style={{ marginTop: '12px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', padding: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: result.valid ? 'var(--success-text)' : 'var(--danger-text)' }}>
            {result.valid ? '✅ Valid — JSON data conforms to the schema!' : `❌ ${result.errors.length} validation error(s) found`}
          </div>
          {result.errors.map((err, i) => (
            <div key={i} style={{ fontSize: '13px', color: 'var(--danger-text)', fontFamily: 'monospace', marginBottom: '4px' }}>• {err}</div>
          ))}
        </div>
      )}

      <section style={{ marginTop: '32px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-heading)' }}>Supported Schema Keywords</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>✅ <strong>type</strong> — string, number, object, array</p>
          <p>✅ <strong>required</strong> — mandatory fields</p>
          <p>✅ <strong>properties</strong> — nested object validation</p>
          <p>✅ <strong>items</strong> — array element validation</p>
          <p>✅ <strong>minLength / maxLength</strong> — string constraints</p>
          <p>✅ <strong>minimum / maximum</strong> — numeric ranges</p>
          <p>✅ <strong>pattern</strong> — regex validation</p>
          <p>✅ <strong>format</strong> — email, uri</p>
          <p>✅ <strong>enum</strong> — allowed values</p>
          <p>✅ <strong>multipleOf</strong> — numeric divisor</p>
        </div>
      </section>
    </>
  )
}
