import { PARTNER_INDUSTRIES } from '@/lib/site/partnerConciergeIndustries'
import { SITE_ORIGIN } from '@/lib/site/siteUrl'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type SitemapEntry = {
  loc: string
  changefreq: 'weekly' | 'monthly'
  priority: string
}

export async function GET() {
  const urls: SitemapEntry[] = [
    { loc: SITE_ORIGIN, changefreq: 'weekly', priority: '1' },
    { loc: `${SITE_ORIGIN}/experiences`, changefreq: 'weekly', priority: '0.95' },
    { loc: `${SITE_ORIGIN}/packages`, changefreq: 'weekly', priority: '0.92' },
    { loc: `${SITE_ORIGIN}/concierge`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/the-valley`, changefreq: 'monthly', priority: '0.85' },
    { loc: `${SITE_ORIGIN}/inquiry`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${SITE_ORIGIN}/partner-concierge`, changefreq: 'weekly', priority: '0.88' },
    ...PARTNER_INDUSTRIES.map((industry) => ({
      loc: `${SITE_ORIGIN}${industry.href}`,
      changefreq: 'weekly' as const,
      priority: '0.86',
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `<url>
<loc>${url.loc}</loc>
<changefreq>${url.changefreq}</changefreq>
<priority>${url.priority}</priority>
</url>`,
  )
  .join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
