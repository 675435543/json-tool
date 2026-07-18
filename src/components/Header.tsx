import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const LANG_OPTIONS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
]

interface HeaderProps {
  isLight: boolean
  toggleTheme: () => void
  langOpen: boolean
  setLangOpen: (v: boolean) => void
  switchLang: (code: string) => void
  langRef: React.RefObject<HTMLDivElement | null>
  showBack?: boolean
}

export default function Header({ isLight, toggleTheme, langOpen, setLangOpen, switchLang, langRef, showBack }: HeaderProps) {
  const { t, i18n } = useTranslation()
  const currentLang = LANG_OPTIONS.find(l => l.code === i18n.language) || LANG_OPTIONS[0]

  return (
    <header>
      <div className="header-top">
        <h1>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🔧 {t('app.title')}
          </Link>
        </h1>
        <div className="lang-switcher" ref={langRef}>
          <button className="theme-btn" onClick={toggleTheme} title={isLight ? t('theme.dark') : t('theme.light')}>
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
      {showBack && (
        <Link to="/" className="btn btn-outline" style={{ marginTop: '12px', display: 'inline-block', textDecoration: 'none' }}>
          ← {t('btn.back')}
        </Link>
      )}
      {!showBack && <p className="subtitle">{t('app.subtitle')}</p>}
    </header>
  )
}
