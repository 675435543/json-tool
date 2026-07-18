import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

export default function BlogRestApi() {
  return (
    <>
      <SEO
        title="JSON Best Practices for REST API Design — Developer Guide"
        description="Learn JSON best practices for REST API design: naming conventions, error handling, pagination, versioning, and security. Build better APIs with these proven patterns."
        canonicalPath="/blog/json-rest-api-best-practices"
      />
      <Link to="/blog" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← Back to Blog</Link>

      <article style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)', lineHeight: '1.8', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--text-heading)' }}>JSON Best Practices for REST API Design</h1>
        <time style={{ fontSize: '13px', color: 'var(--text-muted)' }}>July 18, 2026</time>

        <section style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>1. Use Consistent Naming Conventions</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>Stick to <strong>camelCase</strong> for JSON property names. This is the JavaScript convention and what most API consumers expect:</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', fontSize: '13px', overflow: 'auto', marginTop: '8px' }}>
{`// ✅ Good
{ "firstName": "John", "lastName": "Doe", "createdAt": "2026-07-18" }

// ❌ Avoid
{ "first_name": "John", "LastName": "Doe", "created_at": "2026-07-18" }`}</pre>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>2. Standardize Your Response Envelope</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>Wrap all API responses in a consistent structure. This makes error handling much easier on the client:</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', fontSize: '13px', overflow: 'auto', marginTop: '8px' }}>
{`// Success response
{
  "success": true,
  "data": { "user": { "id": 1, "name": "Alice" } },
  "meta": { "timestamp": "2026-07-18T12:00:00Z" }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [{ "field": "email", "reason": "must not be empty" }]
  }
}`}</pre>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>3. Handle Pagination Properly</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>Always paginate list endpoints. Include metadata so clients know if there's more data:</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', fontSize: '13px', overflow: 'auto', marginTop: '8px' }}>
{`{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 156,
    "totalPages": 8,
    "hasNextPage": true
  }
}`}</pre>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>4. Use ISO 8601 for Dates</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>Always use ISO 8601 format for date/time values. It's unambiguous, universally parseable, and includes timezone info:</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', fontSize: '13px', overflow: 'auto', marginTop: '8px' }}>
{`// ✅ Good
"createdAt": "2026-07-18T12:00:00Z"
"updatedAt": "2026-07-18T12:00:00+08:00"

// ❌ Avoid
"createdAt": "07/18/2026"        // ambiguous format
"createdAt": 1721304000          // Unix timestamp - not human-readable`}</pre>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>5. Return Proper HTTP Status Codes</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>Don't return 200 for everything. Use the right codes:</p>
            <p>• <strong>200</strong> — Success (GET, PUT, PATCH)</p>
            <p>• <strong>201</strong> — Created (POST)</p>
            <p>• <strong>204</strong> — No Content (DELETE success)</p>
            <p>• <strong>400</strong> — Bad Request (validation error)</p>
            <p>• <strong>401</strong> — Unauthorized</p>
            <p>• <strong>404</strong> — Not Found</p>
            <p>• <strong>429</strong> — Too Many Requests (rate limiting)</p>
            <p>• <strong>500</strong> — Internal Server Error</p>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>6. Validate Everything</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>Never trust client input. Validate JSON payloads before processing:</p>
            <p>✅ Check required fields exist</p>
            <p>✅ Validate data types (string vs number vs boolean)</p>
            <p>✅ Enforce length limits to prevent abuse</p>
            <p>✅ Sanitize string inputs to prevent injection attacks</p>
            <p style={{ marginTop: '8px' }}>Use our <Link to="/json-validator" style={{ color: 'var(--text-link)' }}>JSON Validator</Link> to quickly check payloads during development, and our <Link to="/json-formatter" style={{ color: 'var(--text-link)' }}>JSON Formatter</Link> to make complex payloads readable.</p>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>7. Version Your API</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>Include versioning from day one. The most common approaches:</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', fontSize: '13px', overflow: 'auto', marginTop: '8px' }}>
{`// URL versioning (most common)
GET /api/v1/users

// Header versioning
Accept: application/vnd.myapp.v1+json

// Query parameter versioning
GET /api/users?version=1`}</pre>
          </div>
        </section>

        <section style={{ marginTop: '32px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
            💡 <strong>Pro tip:</strong> Use our <Link to="/json-to-typescript" style={{ color: 'var(--text-link)' }}>JSON to TypeScript</Link> or <Link to="/json-to-java" style={{ color: 'var(--text-link)' }}>JSON to Java POJO</Link> converters to quickly generate type-safe models from your API response examples. Catch breaking changes before they reach production.
          </p>
        </section>
      </article>
    </>
  )
}
