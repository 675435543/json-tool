import { Helmet } from 'react-helmet-async'

interface SeoHeadProps {
  title: string
  description: string
  canonicalPath?: string
}

export default function SeoHead({ title, description, canonicalPath }: SeoHeadProps) {
  const BASE = 'https://jsonprocess.app'
  const url = canonicalPath ? `${BASE}${canonicalPath}` : BASE

  return (
    <Helmet>
      <title>{title} - JSON Process</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={`${title} - JSON Process`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={`${title} - JSON Process`} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}
