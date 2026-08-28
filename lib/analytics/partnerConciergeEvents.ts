import type { PartnerIndustrySlug } from '@/lib/site/partnerConciergeIndustries'
import type { PartnerPackageId } from '@/lib/site/partnerConciergePricing'
import { PARTNER_INDUSTRIES } from '@/lib/site/partnerConciergeIndustries'
import {
  PARTNER_PACKAGE_ID_BY_TITLE,
  PREPAID_PARTNER_PACKAGES,
} from '@/lib/site/partnerConciergePricing'

type PackageEventParams = {
  industry: PartnerIndustrySlug
  package_id: PartnerPackageId
  package_name: string
  experience_count: number
  value: number
  currency?: 'USD'
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function gtagEvent(eventName: string, params: Record<string, string | number>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

export function packageIdFromTitle(title: string | null | undefined): PartnerPackageId | null {
  if (!title) return null
  return PARTNER_PACKAGE_ID_BY_TITLE[title] ?? null
}

export function industrySlugFromLabel(
  label: string | null | undefined,
): PartnerIndustrySlug | null {
  if (!label) return null
  const match = PARTNER_INDUSTRIES.find((industry) => industry.navLabel === label)
  return match?.slug ?? null
}

export function packageValueCents(packageId: PartnerPackageId | null): number | null {
  if (!packageId) return null
  const pkg = PREPAID_PARTNER_PACKAGES.find(
    (item) => PARTNER_PACKAGE_ID_BY_TITLE[item.title] === packageId,
  )
  return pkg?.priceCents ?? null
}

export function trackPartnerPackageSelect(params: PackageEventParams) {
  gtagEvent('partner_package_select', {
    industry: params.industry,
    package_id: params.package_id,
    package_name: params.package_name,
    experience_count: params.experience_count,
    value: params.value,
    currency: params.currency ?? 'USD',
  })
}

export function trackPartnerCheckoutStart(params: PackageEventParams) {
  gtagEvent('partner_checkout_start', {
    industry: params.industry,
    package_id: params.package_id,
    package_name: params.package_name,
    experience_count: params.experience_count,
    value: params.value,
    currency: params.currency ?? 'USD',
  })
}

export function trackPartnerPurchaseComplete(params: PackageEventParams) {
  gtagEvent('partner_purchase_complete', {
    industry: params.industry,
    package_id: params.package_id,
    package_name: params.package_name,
    experience_count: params.experience_count,
    value: params.value,
    currency: params.currency ?? 'USD',
  })
}
