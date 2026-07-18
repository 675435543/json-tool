import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer>
      <div className="footer-links">
        <Link className="footer-link" to="/blog/">{t('footer.blog')}</Link>
        <span className="footer-sep">·</span>
        <Link className="footer-link" to="/privacy">{t('footer.privacy')}</Link>
        <span className="footer-sep">·</span>
        <Link className="footer-link" to="/contact">{t('footer.contact')}</Link>
      </div>
      <div>{t('footer.text', { year: new Date().getFullYear() })}</div>
    </footer>
  )
}
