import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SeoHead from '../components/SeoHead'

const TOOLS = [
  { icon: '✨', title: 'JSON Formatter', desc: 'Beautify and format JSON with customizable indentation', path: '/json-formatter' },
  { icon: '✅', title: 'JSON Validator', desc: 'Validate JSON and get detailed statistics', path: '/json-validator' },
  { icon: '🔧', title: 'JSON Minifier', desc: 'Compress and minify JSON to reduce file size', path: '/json-minifier' },
  { icon: '📊', title: 'JSON to CSV', desc: 'Convert JSON data to CSV format instantly', path: '/json-to-csv' },
  { icon: '☕', title: 'JSON to Java POJO', desc: 'Generate Java POJO classes from JSON automatically', path: '/json-to-java' },
  { icon: '🔷', title: 'JSON to TypeScript', desc: 'Generate TypeScript interfaces from JSON automatically', path: '/json-to-typescript' },
  { icon: '🔍', title: 'JSON Diff', desc: 'Compare two JSON objects and see the differences', path: '/json-diff' },
  { icon: '🗺️', title: 'JSONPath', desc: 'Query JSON data using JSONPath expressions', path: '/json-path' },
  { icon: '🔓', title: 'JWT Decoder', desc: 'Decode JWT tokens and inspect header, payload', path: '/jwt-decoder' },
  { icon: '📄', title: 'JSON to YAML', desc: 'Convert JSON data to YAML format instantly', path: '/json-to-yaml' },
  { icon: '⚡', title: 'JSON Generator', desc: 'Generate random JSON data for testing', path: '/json-generator' },
  { icon: '🔤', title: 'JSON Escape / Unescape', desc: 'Escape or unescape JSON strings safely', path: '/json-escape' },
  { icon: '💻', title: 'JSON Code Generator', desc: 'Generate code in multiple languages from JSON', path: '/json-codegen' },
]

const LANG_OPTIONS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
]

export default function Home() {
  const { t, i18n } = useTranslation()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const isLight = theme === 'light'

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', isLight)
    localStorage.setItem('theme', theme)
  }, [theme, isLight])

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const switchLang = useCallback(
    (code: string) => {
      i18n.changeLanguage(code)
      setLangOpen(false)
    },
    [i18n]
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const currentLang = LANG_OPTIONS.find(l => l.code === i18n.language) || LANG_OPTIONS[0]

  return (
    <div className="container">
      <SeoHead title="JSON Process" description="Free Online JSON Tools - Format, Validate, Convert, Generate and more" canonicalPath="/" />

      <header>
        <div className="header-top">
          <h1>🔧 JSON Process</h1>
          <div className="lang-switcher" ref={langRef}>
            <button
              className="theme-btn"
              onClick={toggleTheme}
              title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {isLight ? '🌙' : '☀️'}
            </button>
            <button className="lang-btn" onClick={() => setLangOpen(!langOpen)}>
              {currentLang.flag} {currentLang.label} ▾
            </button>
            {langOpen && (
              <div className="lang-dropdown">
                {LANG_OPTIONS.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-option ${lang.code === i18n.language ? 'active' : ''}`}
                    onClick={() => switchLang(lang.code)}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="subtitle">{t('app.subtitle')}</p>
      </header>

      <section className="hero">
        <h2>JSON Process - Free Online JSON Tools</h2>
        <p>
          Format, validate, minify, convert, and generate JSON data — all in your browser.
          No server uploads, 100% client-side processing.
        </p>
      </section>

      <div className="tool-grid">
        {TOOLS.map(tool => (
          <Link to={tool.path} key={tool.path} className="tool-card">
            <div className="tool-card-icon">{tool.icon}</div>
            <div className="tool-card-content">
              <h3>{tool.title}</h3>
              <p>{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <footer>
        <div className="footer-links">
          <Link to="/" className="footer-link">{t('app.title')}</Link>
          <span className="footer-sep">·</span>
          <a className="footer-link" href="/blog/">{t('footer.blog')}</a>
          <span className="footer-sep">·</span>
          <a className="footer-link" href="/privacy.html">{t('footer.privacy')}</a>
          <span className="footer-sep">·</span>
          <a className="footer-link" href="/contact.html">{t('footer.contact')}</a>
        </div>
        <div>{t('footer.text', { year: new Date().getFullYear() })}</div>
      </footer>
    </div>
  )
}
