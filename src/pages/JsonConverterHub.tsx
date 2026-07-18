import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

const converters = [
  { path: '/json-to-csv', icon: '📊', title: 'JSON to CSV', desc: 'Convert JSON arrays to CSV format. Download as .csv file, open in Excel or Google Sheets.' },
  { path: '/csv-to-json', icon: '🔄', title: 'CSV to JSON', desc: 'Convert CSV data to JSON arrays. Auto-detect booleans, numbers, and null values.' },
  { path: '/json-to-typescript', icon: '🔷', title: 'JSON to TypeScript', desc: 'Generate TypeScript interfaces from JSON. Handles nested objects and arrays.' },
  { path: '/json-to-java', icon: '☕', title: 'JSON to Java POJO', desc: 'Generate Java classes with getters/setters. Supports nested inner classes.' },
  { path: '/json-to-yaml', icon: '📝', title: 'JSON to YAML', desc: 'Convert JSON to YAML format. Perfect for Docker Compose, Kubernetes, and Ansible.' },
]

const otherConverters = [
  { path: '/json-formatter', icon: '✨', title: 'JSON Formatter', desc: 'Format, beautify, and prettify JSON with customizable indentation.' },
  { path: '/json-compressor', icon: '📦', title: 'JSON Minifier', desc: 'Compress JSON to smallest size. See compression ratio instantly.' },
  { path: '/jsonpath', icon: '🔍', title: 'JSONPath Tester', desc: 'Query and extract data from JSON with JSONPath expressions.' },
]

export default function JsonConverterHub() {
  return (
    <>
      <SEO
        title="JSON Converter Online - Convert JSON to CSV, Java, TypeScript, YAML"
        description="Free online JSON converter tools: convert JSON to CSV, Java POJO, TypeScript, YAML, and more. All tools are free and run entirely in your browser."
        keywords="JSON converter, JSON conversion tools, JSON to CSV, JSON to Java, JSON to TypeScript, JSON to YAML, online JSON converter"
        canonicalPath="/json-converter"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← Back to Home</Link>

      <section>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-heading)' }}>JSON Converter Tools</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px' }}>Convert JSON to and from other formats. All processing happens in your browser.</p>

        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-heading)' }}>Data Format Converters</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {converters.map(c => (
            <Link key={c.path} to={c.path} className="tool-card">
              <span className="tool-card-icon">{c.icon}</span>
              <div>
                <div className="tool-card-title">{c.title}</div>
                <div className="tool-card-desc">{c.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-heading)' }}>JSON Processing Tools</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {otherConverters.map(c => (
            <Link key={c.path} to={c.path} className="tool-card">
              <span className="tool-card-icon">{c.icon}</span>
              <div>
                <div className="tool-card-title">{c.title}</div>
                <div className="tool-card-desc">{c.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
