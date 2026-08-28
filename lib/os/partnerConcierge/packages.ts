/**
 * Trusted Partner Concierge package resolution for server-side checkout.
 * Prices always come from PREPAID_PARTNER_PACKAGES — never from client input.
 */

import { PREPAID_PARTNER_PACKAGES } from '@/lib/site/partnerConciergePricing'
import type { PartnerIndustrySlug } from '@/lib/site/partnerConciergeIndustries'

export type PartnerPackageId = 'single' | 'five-pack' | 'ten-pack'

export const PARTNER_PACKAGE_IDS: PartnerPackageId[] = ['single', 'five-pack', 'ten-pack']

const PACKAGE_INDEX: Record<PartnerPackageId, number> = {
  single: 0,
  'five-pack': 1,
  'ten-pack': 2,
}

export const PARTNER_PACKAGE_ID_BY_TITLE: Record<string, PartnerPackageId> = {
  'Single Experience': 'single',
  'Professional 5-Pack': 'five-pack',
  'Professional 10-Pack': 'ten-pack',
}

export const PARTNER_INDUSTRY_LABELS: Record<PartnerIndustrySlug, string> = {
  'real-estate': 'Real Estate',
  builders: 'Builders',
  medical: 'Medical',
  legal: 'Legal',
  sales: 'Sales',
}

export type ResolvedPartnerPackage = {
  id: PartnerPackageId
  title: string
  tableCount: number
  priceCents: number
  priceLabel: string
  perExperiencePrice: string
  savingsLabel: string | null
  lineDescription: string
  lineDetail: string
}

export function isPartnerPackageId(value: unknown): value is PartnerPackageId {
  return typeof value === 'string' && PARTNER_PACKAGE_IDS.includes(value as PartnerPackageId)
}

export function isPartnerIndustrySlug(value: unknown): value is PartnerIndustrySlug {
  return (
    typeof value === 'string' &&
    ['real-estate', 'builders', 'medical', 'legal', 'sales'].includes(value)
  )
}

/** Resolve a trusted package ID to pricing from the single marketing source of truth. */
export function resolvePartnerPackage(packageId: unknown): ResolvedPartnerPackage | null {
  if (!isPartnerPackageId(packageId)) return null

  const source = PREPAID_PARTNER_PACKAGES[PACKAGE_INDEX[packageId]]
  if (!source) return null

  const experienceLabel =
    source.tableCount === 1
      ? '1 prepaid private dining experience'
      : `${source.tableCount} prepaid private dining experiences`

  return {
    id: packageId,
    title: source.title,
    tableCount: source.tableCount,
    priceCents: source.priceCents,
    priceLabel: source.price,
    perExperiencePrice: source.perExperiencePrice,
    savingsLabel: source.savingsLabel,
    lineDescription: `Partner Concierge — ${source.title}`,
    lineDetail: `${experienceLabel}. Each experience includes up to 2 adults + 3 children from the recipient household.`,
  }
}

export function partnerIndustryLabel(slug: PartnerIndustrySlug): string {
  return PARTNER_INDUSTRY_LABELS[slug]
}
