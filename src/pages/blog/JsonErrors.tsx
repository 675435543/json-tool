import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

export default function BlogJsonErrors() {
  return (
    <>
      <SEO
        title="10 Common JSON Errors and How to Fix Them — Developer Troubleshooting Guide"
        description="Learn the 10 most common JSON errors developers face: trailing commas, single quotes, missing brackets, and more. Practical fixes with examples. Free online JSON repair tool included."
        canonicalPath="/blog/10-common-json-errors"
      />
      <Link to="/blog" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← Back to Blog</Link>

      <article style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)', lineHeight: '1.8', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--text-heading)' }}>10 Common JSON Errors and How to Fix Them</h1>
        <time style={{ fontSize: '13px', color: 'var(--text-muted)' }}>July 20, 2026</time>

        <section style={{ marginTop: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>JSON errors are among the most frequent issues developers encounter when working with APIs, configuration files, and data exchange. While the JSON specification is simple, small syntax mistakes can waste hours of debugging time.</p>
            <p>Here are the <strong>10 most common JSON errors</strong> — and how to fix each one.</p>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>1. Trailing Commas</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p><strong>Error:</strong> A comma after the last element in an object or array.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--danger-text)' }}>{`{ "name": "Alice", "age": 30, }`}</pre>
            <p><strong>Fix:</strong> Remove the comma after the last item.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--success-text)' }}>{`{ "name": "Alice", "age": 30 }`}</pre>
            <p>JavaScript allows trailing commas in object literals, but JSON strictly does not.</p>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>2. Single Quotes Instead of Double Quotes</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p><strong>Error:</strong> Using single quotes for keys or string values.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--danger-text)' }}>{`{ 'name': 'Alice' }`}</pre>
            <p><strong>Fix:</strong> Replace all single quotes with double quotes.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--success-text)' }}>{`{ "name": "Alice" }`}</pre>
            <p>This is the most common mistake when copying JavaScript objects into a JSON context.</p>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>3. Unquoted Keys</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p><strong>Error:</strong> Object keys without surrounding double quotes.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--danger-text)' }}>{`{ name: "Alice" }`}</pre>
            <p><strong>Fix:</strong> Always wrap keys in double quotes.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--success-text)' }}>{`{ "name": "Alice" }`}</pre>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>4. Missing Comma Between Items</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p><strong>Error:</strong> Missing commas between properties or array elements.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--danger-text)' }}>{`{ "name": "Alice" "age": 30 }`}</pre>
            <p><strong>Fix:</strong> Add a comma after each property (except the last).</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--success-text)' }}>{`{ "name": "Alice", "age": 30 }`}</pre>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>5. Extra Comma Between Items</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p><strong>Error:</strong> A comma in the wrong place, like before a closing bracket.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--danger-text)' }}>{`[1, 2, 3,]`}</pre>
            <p><strong>Fix:</strong> Remove the comma before the closing bracket.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--success-text)' }}>{`[1, 2, 3]`}</pre>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>6. Missing Closing Bracket or Brace</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p><strong>Error:</strong> Unmatched opening braces or brackets without corresponding closing ones.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--danger-text)' }}>{`{ "items": [1, 2, 3`}</pre>
            <p><strong>Fix:</strong> Ensure every opening <code>{`{`}</code> has a closing <code>{`}`}</code>, and every <code>[</code> has a <code>]</code>.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--success-text)' }}>{`{ "items": [1, 2, 3] }`}</pre>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>7. Using Comments</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p><strong>Error:</strong> JSON does not support comments — not even <code>//</code> or <code>/* */</code>.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--danger-text)' }}>{`{ "name": "Alice" /* user's name */ }`}</pre>
            <p><strong>Fix:</strong> Remove all comments from your JSON data.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--success-text)' }}>{`{ "name": "Alice" }`}</pre>
            <p>If you need to add notes, consider using a <code>_comment</code> key in your object instead.</p>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>8. Using True/False/None (Python Style)</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p><strong>Error:</strong> Using Python's boolean or null values instead of JavaScript JSON equivalents.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--danger-text)' }}>{`{ "active": True, "data": None }`}</pre>
            <p><strong>Fix:</strong> Use lowercase <code>true</code>, <code>false</code>, and <code>null</code>.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--success-text)' }}>{`{ "active": true, "data": null }`}</pre>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>9. Undefined Values</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p><strong>Error:</strong> Using JavaScript's <code>undefined</code> in JSON data.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--danger-text)' }}>{`{ "name": undefined }`}</pre>
            <p><strong>Fix:</strong> Use <code>null</code> instead of <code>undefined</code>.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--success-text)' }}>{`{ "name": null }`}</pre>
            <p>Unlike JavaScript, JSON does not have an <code>undefined</code> type.</p>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>10. Invalid Number Formats</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p><strong>Error:</strong> Numbers with leading zeros, hex values, or special number formats.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--danger-text)' }}>{`{ "value": 0123, "hex": 0xFF }`}</pre>
            <p><strong>Fix:</strong> Remove leading zeros and use only decimal numbers.</p>
            <pre style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--success-text)' }}>{`{ "value": 123 }`}</pre>
          </div>
        </section>

        <section style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: '8px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>Quick Fix: Use Our JSON Repair Tool</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '16px' }}>
            Instead of manually hunting for each error, paste your broken JSON into our <strong>JSON Repair Tool</strong>. It automatically fixes all 10 errors listed above — single quotes, trailing commas, unquoted keys, comments, and more.
          </p>
          <Link to="/json-repair" className="btn btn-primary" style={{ display: 'inline-block', padding: '12px 32px', background: 'var(--accent)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' }}>
            🔧 Open JSON Repair Tool →
          </Link>
        </section>
      </article>
    </>
  )
}
