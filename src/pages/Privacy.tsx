import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function Privacy() {
  const { t } = useTranslation()
  return (
    <>
      <SEO
        title="Privacy Policy - JSON Tool Pro"
        description="Privacy policy for JSON Tool Pro: your JSON data is processed entirely in your browser and never sent to any server. No data collection, no tracking without consent."
        canonicalPath="/privacy"
      />
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>← {t('btn.back')}</Link>

      <div className="page-content">
        <h2>{t('privacy.title')}</h2>
        <p><strong>{t('privacy.last_updated')}</strong></p>

        <h3>{t('privacy.info_title')}</h3>
        <p>{t('privacy.info_desc')}</p>

        <h3>{t('privacy.cookies_title')}</h3>
        <p>{t('privacy.cookies_desc')}</p>

        <h3>{t('privacy.third_party_title')}</h3>
        <p>{t('privacy.third_party_desc')}</p>

        <h3>{t('privacy.ads_title')}</h3>
        <p>{t('privacy.ads_desc')}</p>
        <p>{t('privacy.ads_optout')}</p>

        <h3>{t('privacy.contact_title')}</h3>
        <p>{t('privacy.contact_desc')} <a href="mailto:javahiker123@gmail.com">javahiker123@gmail.com</a></p>
      </div>
    </>
  )
}
