import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  canonicalPath?: string
  keywords?: string
  ogImage?: string
}

const SITE_URL = 'https://jsonprocess.app'

export default function SEO({ title, description, canonicalPath, keywords, ogImage }: SEOProps) {
  const canonical = canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:url" content={canonical} />
      {ogImage && <meta property="twitter:image" content={ogImage} />}
    </Helmet>
  )
}
