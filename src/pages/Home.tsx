import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'

interface ToolItem {
  path: string
  icon: string
  key: string
  desc: string
}

interface ToolCategory {
  icon: string
  titleKey: string
  tools: ToolItem[]
}

const categories: ToolCategory[] = [
  {
    icon: '🛠',
    titleKey: 'home.cat_format',
    tools: [
      { path: '/json-formatter', icon: '✨', key: 'home.formatter', desc: 'home.desc_formatter' },
      { path: '/json-validator', icon: '✅', key: 'home.validator', desc: 'home.desc_validator' },
      { path: '/json-compressor', icon: '📦', key: 'home.compressor', desc: 'home.desc_compressor' },
      { path: '/json-repair', icon: '🔧', key: 'home.repair', desc: 'home.desc_repair' },
      { path: '/json-viewer', icon: '🌳', key: 'home.json_viewer', desc: 'home.desc_json_viewer' },
    ],
  },
  {
    icon: '🔄',
    titleKey: 'home.cat_convert',
    tools: [
      { path: '/json-to-csv', icon: '📊', key: 'home.to_csv', desc: 'home.desc_csv' },
      { path: '/csv-to-json', icon: '🔄', key: 'home.csv_to_json', desc: 'home.desc_csv_to_json' },
      { path: '/json-to-yaml', icon: '📝', key: 'home.to_yaml', desc: 'home.desc_yaml' },
      { path: '/json-to-typescript', icon: '🔷', key: 'home.to_ts', desc: 'home.desc_ts' },
      { path: '/json-to-java', icon: '☕', key: 'home.to_java', desc: 'home.desc_java' },
      { path: '/json-flatten', icon: '📐', key: 'home.flatten', desc: 'home.desc_flatten' },
      { path: '/json-converter', icon: '🔀', key: 'home.converter_hub', desc: 'home.desc_converter_hub' },
    ],
  },
  {
    icon: '⚡',
    titleKey: 'home.cat_codegen',
    tools: [
      { path: '/json-code-generator', icon: '⚡', key: 'home.codegen', desc: 'home.desc_codegen' },
      { path: '/json-schema-generator', icon: '📋', key: 'home.schema_gen', desc: 'home.desc_schema_gen' },
      { path: '/json-generator', icon: '⚡', key: 'home.generator', desc: 'home.desc_generator' },
      { path: '/json-schema-validator', icon: '📋', key: 'home.schema_validator', desc: 'home.desc_schema_validator' },
    ],
  },
  {
    icon: '🔍',
    titleKey: 'home.cat_devtools',
    tools: [
      { path: '/json-playground', icon: '🎮', key: 'home.playground', desc: 'home.desc_playground' },
      { path: '/jsonpath', icon: '🔍', key: 'home.jsonpath', desc: 'home.desc_jsonpath' },
      { path: '/json-diff', icon: '🔄', key: 'home.diff', desc: 'home.desc_diff' },
      { path: '/jwt-decode', icon: '🔓', key: 'home.jwt', desc: 'home.desc_jwt' },
      { path: '/json-stats', icon: '📊', key: 'home.stats', desc: 'home.desc_stats' },
      { path: '/api-tester', icon: '🚀', key: 'home.api_tester', desc: 'home.desc_api_tester' },
    ],
  },
]

export default function Home() {
  const { t } = useTranslation()

  return (
    <>
      <SEO
        title="JSON Tool Pro: 100% Private Online JSON Formatter & Toolkit"
        description="Free online JSON formatter & toolkit. 100% client-side – your data stays private, never uploaded. Validate, minify, diff, convert to CSV/YAML/TS/Java. Try now!"
        keywords="JSON formatter, JSON validator, JSON to CSV, JSON beautifier, JSON minifier, JSON diff, JSON to TypeScript, JSON to Java, JSONPath, online JSON tools"
        canonicalPath="/"
      />
      <section className="home-hero">
        <h2 className="home-hero-title">{t('home.hero_title')}</h2>
        <p className="home-hero-sub">{t('home.hero_sub')}</p>
      </section>

      {categories.map(cat => (
        <section key={cat.titleKey} className="home-tools">
          <h3 className="home-section-title">{cat.icon} {t(cat.titleKey)}</h3>
          <div className="tool-grid">
            {cat.tools.map(tool => (
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
      ))}

      <section className="home-features">
        <h3 className="home-section-title">{t('home.features_title')}</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h4>{t('home.feat_privacy')}</h4>
            <p>{t('home.feat_privacy_desc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛠</div>
            <h4>{t('home.feat_allinone')}</h4>
            <p>{t('home.feat_allinone_desc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h4>{t('home.feat_free')}</h4>
            <p>{t('home.feat_free_desc')}</p>
          </div>
        </div>
      </section>
    </>
  )
}
