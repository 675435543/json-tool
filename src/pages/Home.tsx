import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'

const tools = [
  { path: '/json-formatter', icon: '✨', key: 'home.formatter', desc: 'home.desc_formatter' },
  { path: '/json-validator', icon: '✅', key: 'home.validator', desc: 'home.desc_validator' },
  { path: '/json-to-csv', icon: '📊', key: 'home.to_csv', desc: 'home.desc_csv' },
  { path: '/json-to-typescript', icon: '🔷', key: 'home.to_ts', desc: 'home.desc_ts' },
  { path: '/json-to-java', icon: '☕', key: 'home.to_java', desc: 'home.desc_java' },
  { path: '/jsonpath', icon: '🔍', key: 'home.jsonpath', desc: 'home.desc_jsonpath' },
  { path: '/json-diff', icon: '🔄', key: 'home.diff', desc: 'home.desc_diff' },
  { path: '/json-compressor', icon: '📦', key: 'home.compressor', desc: 'home.desc_compressor' },
  { path: '/json-to-yaml', icon: '📝', key: 'home.to_yaml', desc: 'home.desc_yaml' },
  { path: '/jwt-decode', icon: '🔓', key: 'home.jwt', desc: 'home.desc_jwt' },
  { path: '/json-generator', icon: '⚡', key: 'home.generator', desc: 'home.desc_generator' },
]

export default function Home() {
  const { t } = useTranslation()

  return (
    <>
      <SEO
        title="JSON Tool Pro - Free Online JSON Formatter, Validator & Converter"
        description="Free online JSON tools: format, validate, minify, diff, convert to CSV/Java/TypeScript, JSONPath query, JWT decode. Pure frontend — your data never leaves your browser."
        keywords="JSON formatter, JSON validator, JSON to CSV, JSON beautifier, JSON minifier, JSON diff, JSON to TypeScript, JSON to Java, JSONPath, online JSON tools"
        canonicalPath="/"
      />
      <section className="home-hero">
        <h2 className="home-hero-title">{t('home.hero_title')}</h2>
        <p className="home-hero-sub">{t('home.hero_sub')}</p>
      </section>

      <section className="home-tools">
        <h3 className="home-section-title">{t('home.tools_title')}</h3>
        <div className="tool-grid">
          {tools.map(tool => (
            <Link key={tool.path} to={tool.path} className="tool-card">
              <span className="tool-card-icon">{tool.icon}</span>
              <div>
                <div className="tool-card-title">{t(tool.key)}</div>
                <div className="tool-card-desc">{t(tool.desc)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-features">
        <h3 className="home-section-title">{t('home.features_title')}</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h4>{t('home.feat_privacy')}</h4>
            <p>{t('home.feat_privacy_desc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>{t('home.feat_fast')}</h4>
            <p>{t('home.feat_fast_desc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h4>{t('home.feat_i18n')}</h4>
            <p>{t('home.feat_i18n_desc')}</p>
          </div>
        </div>
      </section>
    </>
  )
}
