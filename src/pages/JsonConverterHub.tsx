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

      <section style={{ marginTop: '40px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)', lineHeight: '1.8' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--text-heading)' }}>JSON Converter — Complete Guide</h2>

        <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-heading)' }}>① Why Convert JSON?</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          JSON is the universal data format for APIs, but it's not always the right format for every task. Converting JSON to other formats unlocks powerful workflows:
        </p>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          <p>🔄 <strong>JSON → CSV</strong>: Export API data to Excel, Google Sheets, or any spreadsheet tool for analysis and reporting</p>
          <p>🔄 <strong>CSV → JSON</strong>: Import spreadsheet data into your application or API</p>
          <p>🔄 <strong>JSON → TypeScript</strong>: Generate type-safe interfaces from API responses — no more manual typing!</p>
          <p>🔄 <strong>JSON → Java POJO</strong>: Create Jackson/Gson-ready Java classes for Spring Boot and Android</p>
          <p>🔄 <strong>JSON → YAML</strong>: Convert config JSON to YAML for Docker Compose, Kubernetes, Ansible, and CI/CD</p>
        </div>

        <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-heading)' }}>④ Real-World Use Cases</h3>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          <p><strong>Data export:</strong> You have a JSON endpoint returning user data. Convert to CSV → download → send to the marketing team as a spreadsheet.</p>
          <p style={{ marginTop: '8px' }}><strong>API integration:</strong> You're building a React frontend. Copy the API response → convert to TypeScript interfaces → paste into your project. Type safety in seconds.</p>
          <p style={{ marginTop: '8px' }}><strong>Backend development:</strong> You're building a Spring Boot microservice. Take the API contract JSON → generate Java POJOs → ready for your controller.</p>
          <p style={{ marginTop: '8px' }}><strong>DevOps:</strong> You have a JSON config file. Convert to YAML → use in your Kubernetes deployment or Docker Compose setup.</p>
        </div>

        <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-heading)' }}>⑥ Developer Productivity Boost</h3>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          <p>Using these converters saves <strong>15-30 minutes per integration task</strong> compared to manually typing type definitions or data models. Over a sprint, that adds up to hours of saved development time.</p>
          <p style={{ marginTop: '8px' }}>All converters are <strong>100% client-side</strong> — your data stays in your browser. No server upload, no privacy concerns.</p>
        </div>
      </section>
    </>
  )
}
