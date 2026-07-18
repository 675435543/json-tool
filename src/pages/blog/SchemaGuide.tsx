import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

export default function BlogSchemaGuide() {
  return (
    <>
      <SEO
        title="JSON Schema Validation: A Practical Guide for Developers"
        description="Learn JSON Schema validation: define data structures, validate API contracts, enforce data quality. Practical examples for frontend and backend developers."
        canonicalPath="/blog/json-schema-guide"
      />
      <Link to="/blog" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← Back to Blog</Link>

      <article style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)', lineHeight: '1.8', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--text-heading)' }}>JSON Schema Validation: A Practical Guide for Developers</h1>
        <time style={{ fontSize: '13px', color: 'var(--text-muted)' }}>July 17, 2026</time>

        <section style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>What is JSON Schema?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            JSON Schema is a vocabulary that allows you to <strong>annotate and validate</strong> JSON documents. It defines the structure, required fields, data types, and constraints for your JSON data — like a contract between your API and its consumers.
          </p>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>Basic Schema Example</h2>
          <pre style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', fontSize: '13px', overflow: 'auto' }}>
{`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer", "minimum": 0 },
    "email": { "type": "string", "format": "email" }
  },
  "required": ["name", "email"]
}`}</pre>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>Common Validation Keywords</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p><strong>type:</strong> string, number, integer, object, array, boolean, null</p>
            <p><strong>required:</strong> list of fields that must be present</p>
            <p><strong>properties:</strong> define each field's type and constraints</p>
            <p><strong>minimum / maximum:</strong> numeric range validation</p>
            <p><strong>minLength / maxLength:</strong> string length constraints</p>
            <p><strong>pattern:</strong> regex pattern matching for strings</p>
            <p><strong>enum:</strong> restrict values to a fixed set</p>
            <p><strong>format:</strong> semantic validation (email, uri, date-time, ipv4)</p>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>Why Use JSON Schema?</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>✅ <strong>API contract enforcement</strong> — Ensure API requests and responses follow expected structure</p>
            <p>✅ <strong>Form validation</strong> — Validate user input before submission</p>
            <p>✅ <strong>Configuration validation</strong> — Catch misconfigurations early in CI/CD</p>
            <p>✅ <strong>Documentation</strong> — Schema serves as living documentation for your data structures</p>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>Quick Validation Workflow</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>1. Use our <Link to="/json-validator" style={{ color: 'var(--text-link)' }}>JSON Validator</Link> to ensure your data is valid JSON</p>
            <p>2. Define your schema based on expected data structure</p>
            <p>3. Validate data against the schema programmatically or with online tools</p>
            <p>4. Integrate schema validation into your CI/CD pipeline</p>
          </div>
        </section>
      </article>
    </>
  )
}
