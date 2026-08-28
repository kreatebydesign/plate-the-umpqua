import type { PartnerIndustryConfig } from '@/lib/site/partnerConciergeIndustries'
import { PREPAID_PARTNER_PACKAGES } from '@/lib/site/partnerConciergePricing'
import { absoluteSiteUrl, SITE_ORIGIN } from '@/lib/site/siteUrl'

const PROVIDER = {
  '@type': 'FoodEstablishment' as const,
  name: 'Plate The Umpqua',
  url: SITE_ORIGIN,
}

function prepaidOffers(pageUrl: string) {
  return PREPAID_PARTNER_PACKAGES.map((pkg) => ({
    '@type': 'Offer' as const,
    name: pkg.title,
    description: pkg.desc,
    price: String(pkg.priceCents / 100),
    priceCurrency: 'USD',
    url: pageUrl,
    seller: PROVIDER,
  }))
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

function faqPage(faqs: PartnerIndustryConfig['faqs']) {
  if (faqs.length === 0) return null
  return {
    '@type': 'FAQPage' as const,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question' as const,
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: faq.answer,
      },
    })),
  }
}

export function partnerConciergeHubSchema(description: string) {
  const pageUrl = absoluteSiteUrl('/partner-concierge')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: 'Partner Concierge Program',
        description,
        isPartOf: { '@id': SITE_ORIGIN, '@type': 'WebSite', name: 'Plate The Umpqua' },
      },
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Partner Concierge', path: '/partner-concierge' },
      ]),
      {
        '@type': 'Service',
        name: 'Plate The Umpqua Partner Concierge',
        description,
        provider: PROVIDER,
        areaServed: ['Roseburg, Oregon', 'Umpqua Valley', 'Southern Oregon'],
        offers: prepaidOffers(pageUrl),
      },
      {
        '@type': 'OfferCatalog',
        name: 'Partner Concierge Prepaid Packages',
        itemListElement: PREPAID_PARTNER_PACKAGES.map((pkg) => ({
          '@type': 'Offer',
          name: pkg.title,
          description: pkg.desc,
          price: String(pkg.priceCents / 100),
          priceCurrency: 'USD',
          url: pageUrl,
          seller: PROVIDER,
        })),
      },
    ],
  }
}

export function partnerIndustryPageSchema(industry: PartnerIndustryConfig) {
  const pageUrl = absoluteSiteUrl(industry.href)
  const serviceName = `Partner Concierge — ${industry.navLabel}`
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      '@id': pageUrl,
      url: pageUrl,
      name: industry.seo.title,
      description: industry.seo.description,
      isPartOf: { '@id': SITE_ORIGIN, '@type': 'WebSite', name: 'Plate The Umpqua' },
    },
    breadcrumbList([
      { name: 'Home', path: '/' },
      { name: 'Partner Concierge', path: '/partner-concierge' },
      { name: industry.navLabel, path: industry.href },
    ]),
    {
      '@type': 'Service',
      name: serviceName,
      description: industry.seo.description,
      provider: PROVIDER,
      areaServed: ['Roseburg, Oregon', 'Umpqua Valley', 'Southern Oregon'],
      offers: prepaidOffers(pageUrl),
    },
  ]

  const faq = faqPage(industry.faqs)
  if (faq) graph.push(faq)

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}
