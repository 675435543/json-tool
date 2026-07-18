import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

export default function BlogJsonGuide() {
  return (
    <>
      <SEO
        title="JSON Guide for Developers: Syntax, Examples and Best Practices"
        description="Complete JSON guide for developers: learn JSON syntax, data types, nested objects, arrays, best practices, and common mistakes. Perfect for beginners and experienced devs."
        canonicalPath="/blog/json-guide"
      />
      <Link to="/blog" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← Back to Blog</Link>

      <article style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)', lineHeight: '1.8', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--text-heading)' }}>JSON Guide for Developers: Syntax, Examples and Best Practices</h1>
        <time style={{ fontSize: '13px', color: 'var(--text-muted)' }}>July 15, 2026</time>

        <section style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>What is JSON?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            JSON (JavaScript Object Notation) is a lightweight data-interchange format. It's easy for humans to read and write, and easy for machines to parse and generate. JSON is the de facto standard for web APIs, configuration files, and data storage.
          </p>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>JSON Data Types</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>JSON supports six data types:</p>
            <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
              <li><strong>String</strong> — <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>"hello world"</code></li>
              <li><strong>Number</strong> — <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>42</code>, <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>3.14</code>, <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>-1.5e10</code></li>
              <li><strong>Boolean</strong> — <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>true</code> or <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>false</code></li>
              <li><strong>null</strong> — represents no value</li>
              <li><strong>Object</strong> — <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{'{ "key": "value" }'}</code></li>
              <li><strong>Array</strong> — <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>[1, 2, 3]</code></li>
            </ul>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>Basic Syntax Rules</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>1. Data is in <strong>name/value pairs</strong>: <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>"name": "John"</code></p>
            <p>2. Data is separated by <strong>commas</strong></p>
            <p>3. <strong>Curly braces</strong> hold objects: <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{'{ }'}</code></p>
            <p>4. <strong>Square brackets</strong> hold arrays: <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>[ ]</code></p>
            <p>5. Keys and string values must use <strong>double quotes</strong></p>
            <p>6. No trailing commas allowed</p>
            <p>7. No comments supported</p>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>Common Mistakes to Avoid</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>❌ <strong>Trailing commas:</strong> JSON does not allow a comma after the last item</p>
            <p>❌ <strong>Single quotes:</strong> Always use double quotes for strings and keys</p>
            <p>❌ <strong>Unquoted keys:</strong> Unlike JavaScript objects, JSON requires keys to be quoted</p>
            <p>❌ <strong>Comments:</strong> JSON spec does not support <code>//</code> or <code>/* */</code></p>
            <p>❌ <strong>Special characters:</strong> Must be escaped: <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>\n</code>, <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>\t</code>, <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>\"</code></p>
          </div>
        </section>

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-heading)' }}>Best Practices</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            <p>✅ Use <strong>camelCase</strong> for property names: <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>"firstName"</code></p>
            <p>✅ Keep structures <strong>flat and simple</strong> — avoid deep nesting</p>
            <p>✅ Use <strong>consistent types</strong> — don't mix strings and numbers for the same field</p>
            <p>✅ Validate with our <Link to="/json-validator" style={{ color: 'var(--text-link)' }}>JSON Validator</Link> before deployment</p>
            <p>✅ Format with our <Link to="/json-formatter" style={{ color: 'var(--text-link)' }}>JSON Formatter</Link> for readability</p>
            <p>✅ Minify for production with our <Link to="/json-compressor" style={{ color: 'var(--text-link)' }}>JSON Compressor</Link></p>
          </div>
        </section>
      </article>
    </>
  )
}
