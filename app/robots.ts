import type { MetadataRoute } from 'next'
import { SITE_ORIGIN } from '@/lib/site/siteUrl'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/os/', '/partner-concierge/purchase'],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  }
}
