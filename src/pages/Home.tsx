import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'
import { toolCategories } from '../lib/tools'

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

      {/* ===== Hero ===== */}
      <section className="home-hero">
        <div className="hero-badge">{t('home.hero_badge')}</div>
        <h1 className="home-hero-title">{t('home.hero_heading')}</h1>
        <p className="home-hero-sub">{t('home.hero_sub')}</p>
        <div className="hero-actions">
          <Link to="/json-playground" className="btn hero-cta hero-cta-primary">{t('home.hero_cta')} →</Link>
          <span className="hero-hint">
            <kbd>Ctrl</kbd>+<kbd>K</kbd> {t('home.hero_hint')}
          </span>
        </div>
      </section>

      {/* ===== Three Selling Points ===== */}
      <section className="home-usp">
        <div className="usp-card">
          <div className="usp-icon">🔒</div>
          <h3>{t('home.usp_privacy_title')}</h3>
          <p>{t('home.usp_privacy_desc')}</p>
        </div>
        <div className="usp-card">
          <div className="usp-icon">⚡</div>
          <h3>{t('home.usp_speed_title')}</h3>
          <p>{t('home.usp_speed_desc')}</p>
        </div>
        <div className="usp-card">
          <div className="usp-icon">🛠</div>
          <h3>{t('home.usp_tools_title')}</h3>
          <p>{t('home.usp_tools_desc')}</p>
        </div>
      </section>

      {/* ===== Use Cases ===== */}
      <section className="home-use-cases">
        <h2 className="home-section-title">{t('home.usecases_title')}</h2>
        <div className="usecases-grid">
          <div className="usecase-card">
            <div className="usecase-icon">🌐</div>
            <div className="usecase-body">
              <h4>{t('home.usecase_api')}</h4>
              <p>{t('home.usecase_api_desc')}</p>
              <Link to="/json-diff" className="usecase-link">{t('home.usecase_api_link')} →</Link>
            </div>
          </div>
          <div className="usecase-card">
            <div className="usecase-icon">⚛️</div>
            <div className="usecase-body">
              <h4>{t('home.usecase_frontend')}</h4>
              <p>{t('home.usecase_frontend_desc')}</p>
              <Link to="/json-to-typescript" className="usecase-link">{t('home.usecase_frontend_link')} →</Link>
            </div>
          </div>
          <div className="usecase-card">
            <div className="usecase-icon">☕</div>
            <div className="usecase-body">
              <h4>{t('home.usecase_backend')}</h4>
              <p>{t('home.usecase_backend_desc')}</p>
              <Link to="/json-to-java" className="usecase-link">{t('home.usecase_backend_link')} →</Link>
            </div>
          </div>
          <div className="usecase-card">
            <div className="usecase-icon">📊</div>
            <div className="usecase-body">
              <h4>{t('home.usecase_data')}</h4>
              <p>{t('home.usecase_data_desc')}</p>
              <Link to="/json-to-csv" className="usecase-link">{t('home.usecase_data_link')} →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Tool Categories ===== */}
      {toolCategories.map(cat => (
        <section key={cat.titleKey} className="home-tools">
          <h3 className="home-section-title">{cat.icon} {t(cat.titleKey)}</h3>
          <div className="tool-grid">
            {cat.tools.map(tool => (
              <Link key={tool.path} to={tool.path} className="tool-card">
                <span className="tool-card-icon">{tool.icon}</span>
                <div>
                  <div className="tool-card-title">{t(tool.nameKey)}</div>
                  <div className="tool-card-desc">{t(tool.descKey)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* ===== Features ===== */}
      <section className="home-features">
        <h2 className="home-section-title">{t('home.features_title')}</h2>
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
