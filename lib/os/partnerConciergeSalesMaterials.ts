/**
 * Partner Concierge OS — sales materials registry.
 *
 * Future OS sections may include Overview, Certificates, Orders, and Redemptions.
 * This task exposes Sales Materials only; routes stay isolated for later expansion.
 */

import type { PartnerSellSheetSlug } from '@/lib/site/partnerSellSheetConfig'

export type PartnerConciergeSalesMaterial = {
  slug: PartnerSellSheetSlug
  industryLabel: string
  programLabel: string
  sellSheetPath: `/print/partner-sell-sheet/${PartnerSellSheetSlug}`
  landingPageUrl: string
}

export const PARTNER_CONCIERGE_OS_BASE = '/os/partner-concierge' as const

/** Active Partner Concierge OS routes (expand as features ship). */
export const PARTNER_CONCIERGE_OS_ROUTES = {
  salesMaterials: `${PARTNER_CONCIERGE_OS_BASE}/sales-materials`,
} as const

export const PARTNER_CONCIERGE_SALES_MATERIALS: PartnerConciergeSalesMaterial[] = [
  {
    slug: 'real-estate',
    industryLabel: 'Real Estate',
    programLabel: 'Closing Gift Program',
    sellSheetPath: '/print/partner-sell-sheet/real-estate',
    landingPageUrl: 'https://www.platetheumpqua.com/partner-concierge/real-estate',
  },
  {
    slug: 'builders',
    industryLabel: 'Builders',
    programLabel: 'Project Completion Gifting',
    sellSheetPath: '/print/partner-sell-sheet/builders',
    landingPageUrl: 'https://www.platetheumpqua.com/partner-concierge/builders',
  },
  {
    slug: 'medical',
    industryLabel: 'Medical',
    programLabel: 'Professional Appreciation',
    sellSheetPath: '/print/partner-sell-sheet/medical',
    landingPageUrl: 'https://www.platetheumpqua.com/partner-concierge/medical',
  },
  {
    slug: 'legal',
    industryLabel: 'Legal',
    programLabel: 'Professional Appreciation',
    sellSheetPath: '/print/partner-sell-sheet/legal',
    landingPageUrl: 'https://www.platetheumpqua.com/partner-concierge/legal',
  },
  {
    slug: 'sales',
    industryLabel: 'Sales',
    programLabel: 'Performance Recognition',
    sellSheetPath: '/print/partner-sell-sheet/sales',
    landingPageUrl: 'https://www.platetheumpqua.com/partner-concierge/sales',
  },
]
