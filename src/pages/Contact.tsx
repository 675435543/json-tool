import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function Contact() {
  const { t } = useTranslation()
  return (
    <>
      <SEO
        title="Contact Us - JSON Tool Pro"
        description="Contact the JSON Tool Pro team. Get support, report bugs, or suggest new features for our free online JSON tools."
        canonicalPath="/contact"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      <div className="page-content">
        <h2>{t('contact.title')}</h2>
        <p>{t('contact.email')}: <a href="mailto:javahiker123@gmail.com">javahiker123@gmail.com</a></p>
        <p>{t('contact.response')}</p>
      </div>
    </>
  )
}
