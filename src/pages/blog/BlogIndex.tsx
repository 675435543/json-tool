import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

const posts = [
  { slug: 'json-guide', title: 'JSON Guide for Developers: Syntax, Examples and Best Practices', excerpt: 'Master JSON: from basic syntax to advanced patterns. Learn data types, nested structures, arrays, and common mistakes.', date: '2026-07-15' },
  { slug: 'json-api-guide', title: 'How to Debug JSON API Responses Like a Pro', excerpt: 'Practical techniques for debugging JSON API responses. Format, validate, and inspect API data with proven workflows.', date: '2026-07-16' },
  { slug: 'json-schema-guide', title: 'JSON Schema Validation: A Practical Guide for Developers', excerpt: 'Understand JSON Schema: define data structures, validate API contracts, and ensure data quality across applications.', date: '2026-07-17' },
  { slug: 'json-formatter-vs-beautifier-vs-minifier', title: "JSON Formatter vs Beautifier vs Minifier — What's the Difference?", excerpt: 'Learn the key differences between formatting, beautifying, and minifying JSON. When to use each tool.', date: '2026-07-18' },
  { slug: 'top-json-tools', title: 'Top 10 Free JSON Tools Every Developer Needs in 2026', excerpt: 'Discover the best free JSON tools for developers: formatter, validator, diff checker, converters, and more.', date: '2026-07-18' },
  { slug: 'json-rest-api-best-practices', title: 'JSON Best Practices for REST API Design — Developer Guide', excerpt: 'Naming conventions, error handling, pagination, versioning, and security for JSON REST APIs.', date: '2026-07-18' },
]

export default function BlogIndex() {
  return (
    <>
      <SEO
        title="JSON Tools Blog - Tips, Guides & Tutorials for Developers"
        description="Developer blog about JSON: formatting, validation, API debugging, JSON Schema, data conversion, REST API best practices. Practical tips for frontend and backend developers."
        canonicalPath="/blog"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← Back to Home</Link>

      <section>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-heading)' }}>JSON Tools Blog</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Practical tips and tutorials for developers working with JSON</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map(post => (
            <Link key={post.slug} to={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <article style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-heading)' }}>{post.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '8px' }}>{post.excerpt}</p>
                <time style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{post.date}</time>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
