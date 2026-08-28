'use client'

import { useEffect } from 'react'
import type { PartnerIndustrySlug } from '@/lib/site/partnerConciergeIndustries'
import type { PartnerPackageId } from '@/lib/site/partnerConciergePricing'
import { trackPartnerPurchaseComplete } from '@/lib/analytics/partnerConciergeEvents'

type Props = {
  dedupeKey: string
  industry: PartnerIndustrySlug
  packageId: PartnerPackageId
  packageName: string
  experienceCount: number
  value: number
}

export default function PartnerPurchaseCompleteAnalytics({
  dedupeKey,
  industry,
  packageId,
  packageName,
  experienceCount,
  value,
}: Props) {
  useEffect(() => {
    const storageKey = `partner_purchase_complete:${dedupeKey}`
    if (sessionStorage.getItem(storageKey)) return
    sessionStorage.setItem(storageKey, '1')
    trackPartnerPurchaseComplete({
      industry,
      package_id: packageId,
      package_name: packageName,
      experience_count: experienceCount,
      value,
      currency: 'USD',
    })
  }, [dedupeKey, industry, packageId, packageName, experienceCount, value])

  return null
}
