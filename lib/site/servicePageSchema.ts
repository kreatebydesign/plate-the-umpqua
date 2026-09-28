import type { ServicePageConfig } from '@/lib/site/servicePages'
import { SERVICE_AREA_LABELS } from '@/lib/site/servicePages'
import { absoluteSiteUrl, SITE_ORIGIN } from '@/lib/site/siteUrl'

const PROVIDER = {
  '@type': 'LocalBusiness' as const,
  '@id': `${SITE_ORIGIN}/#business`,
  name: 'Plate The Umpqua',
  url: SITE_ORIGIN,
}

function breadcrumbList(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList' as const,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.name,
      item: absoluteSiteUrl(item.path),
    })),
  }
}

export function servicePageSchema(page: ServicePageConfig) {
  const pageUrl = absoluteSiteUrl(page.href)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: page.seo.title,
        description: page.seo.description,
        isPartOf: {
          '@id': `${SITE_ORIGIN}/#website`,
          '@type': 'WebSite',
          name: 'Plate The Umpqua',
          url: SITE_ORIGIN,
        },
        about: { '@id': `${pageUrl}#service` },
      },
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: page.navLabel, path: page.href },
      ]),
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: page.seo.title,
        description: page.seo.description,
        provider: PROVIDER,
        areaServed: [...SERVICE_AREA_LABELS],
        serviceType: page.navLabel,
        url: pageUrl,
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  }
}

/** Sitewide identity graph — LocalBusiness + chef Person + website. */
export function siteBusinessSchema(description: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        name: 'Plate The Umpqua',
        url: SITE_ORIGIN,
        description,
        publisher: { '@id': `${SITE_ORIGIN}/#business` },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${SITE_ORIGIN}/#business`,
        name: 'Plate The Umpqua',
        url: SITE_ORIGIN,
        description,
        image: absoluteSiteUrl('/og-image.jpg'),
        areaServed: [...SERVICE_AREA_LABELS],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Roseburg',
          addressRegion: 'OR',
          addressCountry: 'US',
        },
        priceRange: '$$$',
        email: 'hello@platetheumpqua.com',
        knowsAbout: [
          'Private chef dining',
          'Private dining',
          'Private events',
          'Elevated private catering',
          'Wine country hospitality',
          'Partner concierge hospitality',
        ],
        makesOffer: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Private Chef',
              url: absoluteSiteUrl('/private-chef'),
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Private Dining',
              url: absoluteSiteUrl('/private-dining'),
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Private Events',
              url: absoluteSiteUrl('/private-events'),
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Private Catering',
              url: absoluteSiteUrl('/catering'),
            },
          },
        ],
        employee: { '@id': `${SITE_ORIGIN}/#chef-martin` },
      },
      {
        '@type': 'Person',
        '@id': `${SITE_ORIGIN}/#chef-martin`,
        name: 'Chef Martin',
        jobTitle: 'Private Chef',
        worksFor: { '@id': `${SITE_ORIGIN}/#business` },
        url: SITE_ORIGIN,
      },
    ],
  }
}
