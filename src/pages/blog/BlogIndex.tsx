import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

const posts = [
  {
    slug: 'json-guide',
    title: 'JSON Guide for Developers: Syntax, Examples and Best Practices',
    excerpt: 'Master JSON: from basic syntax to advanced patterns. Learn data types, nested structures, arrays, and common mistakes every developer should know.',
    date: '2026-07-15',
  },
  {
    slug: 'json-api-guide',
    title: 'How to Debug JSON API Responses Like a Pro',
    excerpt: 'Learn practical techniques for debugging JSON API responses. Format, validate, and inspect API data with proven developer workflows.',
    date: '2026-07-16',
  },
  {
    slug: 'json-schema-guide',
    title: 'JSON Schema Validation: A Practical Guide for Developers',
    excerpt: 'Understand JSON Schema: how to define data structures, validate API contracts, and ensure data quality across your applications.',
    date: '2026-07-17',
  },
]

export default function BlogIndex() {
  return (
    <>
      <SEO
        title="JSON Tools Blog - Tips, Guides & Tutorials for Developers"
        description="Developer blog about JSON: learn formatting, validation, API debugging, JSON Schema, data conversion. Practical tips and tutorials for frontend and backend developers."
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
