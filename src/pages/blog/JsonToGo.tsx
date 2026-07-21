import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

export default function BlogJsonToGo() {
  return (
    <>
      <SEO
        title="JSON to Go Struct — Generate Go Types from JSON Automatically"
        description="Learn how to convert JSON to Go struct types. Free online JSON to Go generator, manual conversion guide, and best practices for defining Go data structures from JSON."
        canonicalPath="/blog/json-to-go-struct"
      />
      <Link to="/blog" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← Back to Blog</Link>

      <article style={{ maxWidth: '720px', lineHeight: '1.9', fontSize: '15px', color: 'var(--text-primary)' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>JSON to Go Struct — Complete Guide</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '32px' }}>Published: July 22, 2026</p>

        <p>When building Go applications that consume JSON APIs, one of the first tasks is defining struct types that match the JSON structure. Manually typing out struct definitions for complex JSON can be tedious and error-prone. This guide covers both manual conversion and using automated tools.</p>

        <h2 style={{ fontSize: '22px', marginTop: '32px', marginBottom: '12px' }}>Quick — Use Our Free Tool</h2>
        <p>If you just want to generate Go structs from JSON instantly, use our <Link to="/json-code-generator">JSON Code Generator</Link>. Paste your JSON, select "Go", and get your struct definition in seconds.</p>

        <h2 style={{ fontSize: '22px', marginTop: '32px', marginBottom: '12px' }}>Manual Conversion Rules</h2>
        <p>Understanding how JSON maps to Go types helps you write better structs:</p>

        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '10px 12px', border: '1px solid var(--border)', textAlign: 'left' }}>JSON Type</th>
              <th style={{ padding: '10px 12px', border: '1px solid var(--border)', textAlign: 'left' }}>Go Type</th>
              <th style={{ padding: '10px 12px', border: '1px solid var(--border)', textAlign: 'left' }}>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>string</td><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>string</td><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>"Alice"</td></tr>
            <tr><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>number</td><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>float64 / int</td><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>25</td></tr>
            <tr><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>boolean</td><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>bool</td><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>true</td></tr>
            <tr><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>null</td><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>interface{} / pointer</td><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>nil</td></tr>
            <tr><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>object</td><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>struct</td><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>type X struct</td></tr>
            <tr><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>array</td><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>[]Type</td><td style={{ padding: '10px 12px', border: '1px solid var(--border)' }}>[]string</td></tr>
          </tbody>
        </table>

        <h2 style={{ fontSize: '22px', marginTop: '32px', marginBottom: '12px' }}>Example: API Response to Go Struct</h2>

        <p><strong>Input JSON:</strong></p>
        <pre style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', fontSize: '13px', overflow: 'auto' }}>{`{
  "id": 42,
  "name": "Alice Smith",
  "email": "alice@example.com",
  "age": 28,
  "isActive": true,
  "address": {
    "city": "Beijing",
    "zip": "100001"
  },
  "tags": ["developer", "golang"],
  "projects": [
    {"name": "Project A", "stars": 120},
    {"name": "Project B", "stars": 85}
  ]
}`}</pre>

        <p><strong>Generated Go Struct:</strong></p>
        <pre style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', fontSize: '13px', overflow: 'auto' }}>{'type User struct {\n    ID       int         `json:"id"`\n    Name     string      `json:"name"`\n    Email    string      `json:"email"`\n    Age      int         `json:"age"`\n    IsActive bool        `json:"isActive"`\n    Address  Address     `json:"address"`\n    Tags     []string    `json:"tags"`\n    Projects []UserProject `json:"projects"`\n}\n\ntype Address struct {\n    City string `json:"city"`\n    Zip  string `json:"zip"`\n}\n\ntype UserProject struct {\n    Name  string `json:"name"`\n    Stars int    `json:"stars"`\n}'}</pre>

        <h2 style={{ fontSize: '22px', marginTop: '32px', marginBottom: '12px' }}>JSON Tags in Go</h2>
        <p>Go struct tags control how JSON is encoded and decoded. Key tag options:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li><code>{'json:"field_name"'}</code> — maps to a different JSON key name</li>
          <li><code>{'json:"-"'} </code> — ignores the field during encoding/decoding</li>
          <li><code>{'json:"field_name,omitempty"'}</code> — omits the field if it's empty</li>
          <li><code>{'json:"field_name,string"'}</code> — forces string representation for numbers</li>
        </ul>

        <h2 style={{ fontSize: '22px', marginTop: '32px', marginBottom: '12px' }}>Best Practices</h2>

        <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
          <li><strong>Use explicit field names</strong> — always include JSON tags to handle different naming conventions (snake_case, camelCase)</li>
          <li><strong>Handle optional fields</strong> — use pointer types (<code>*string</code>) or <code>omitempty</code> for fields that may not be present</li>
          <li><strong>Use <code>json.RawMessage</code></strong> for dynamic JSON fields where the structure isn't known in advance</li>
          <li><strong>Define nested types</strong> — break complex JSON into separate struct types for readability</li>
          <li><strong>Use a tool</strong> — for large JSON payloads, always use a JSON to Go generator to avoid manual errors</li>
        </ol>

        <h2 style={{ fontSize: '22px', marginTop: '32px', marginBottom: '12px' }}>Handling Dynamic JSON</h2>
        <p>Sometimes JSON has dynamic keys or unknown structures. Use <code>map[string]interface{}</code> or <code>json.RawMessage</code>:</p>
        <pre style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', fontSize: '13px', overflow: 'auto' }}>{'// Dynamic keys\ntype Response struct {\n    Data map[string]interface{} `json:"data"`\n}\n\n// Raw JSON passthrough\ntype Response struct {\n    Raw json.RawMessage `json:"-"`\n}'}</pre>

        <h2 style={{ fontSize: '22px', marginTop: '32px', marginBottom: '12px' }}>Try It Yourself</h2>
        <p>Head over to our <Link to="/json-code-generator">JSON Code Generator</Link>, paste your JSON, select Go, and generate your struct in one click. It's free, runs entirely in your browser, and your data never leaves your device.</p>
      </article>
    </>
  )
}
