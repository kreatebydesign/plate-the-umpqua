import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Cormorant_Garamond, Work_Sans } from 'next/font/google'
import PartnerPurchaseForm from '@/components/partner-concierge/PartnerPurchaseForm'
import { getPartnerIndustry, PARTNER_INDUSTRIES } from '@/lib/site/partnerConciergeIndustries'
import {
  PREPAID_PARTNER_PACKAGES,
  partnerPackageIdForTitle,
  type PartnerPackageId,
} from '@/lib/site/partnerConciergePricing'
import { isPartnerIndustrySlug, isPartnerPackageId } from '@/lib/os/partnerConcierge/packages'

const work = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work',
  weight: ['400', '500', '600'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Purchase Partner Concierge Package',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] || null
  return value ?? null
}

export default async function PartnerPurchasePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const industryParam = first(params.industry) || 'real-estate'
  const packageParam = first(params.package) || 'single'

  if (!isPartnerIndustrySlug(industryParam)) notFound()

  const initialPackageId: PartnerPackageId = isPartnerPackageId(packageParam)
    ? packageParam
    : 'single'

  const industry = getPartnerIndustry(industryParam)
  if (!industry) notFound()

  const packages = PREPAID_PARTNER_PACKAGES.map((pkg) => {
    const id = partnerPackageIdForTitle(pkg.title)
    if (!id) return null
    return {
      id,
      title: pkg.title,
      priceLabel: pkg.price,
      tableCount: pkg.tableCount,
      perExperiencePrice: pkg.perExperiencePrice,
      savingsLabel: pkg.savingsLabel,
      desc: pkg.desc,
    }
  }).filter(Boolean) as Array<{
    id: PartnerPackageId
    title: string
    priceLabel: string
    tableCount: number
    perExperiencePrice: string
    savingsLabel: string | null
    desc: string
  }>

  return (
    <main
      className={`${work.variable} ${cormorant.variable} min-h-screen bg-[#14120e] px-5 py-28 text-[#efe6d4] md:px-6`}
    >
      <div className="mx-auto max-w-3xl">
        <p className="mb-8 text-[10px] uppercase tracking-[0.28em] text-[#c4a465]/80">
          <Link href={industry.href} className="transition hover:text-[#c4a465]">
            {industry.navLabel}
          </Link>
          <span className="mx-3 text-[#efe6d4]/30">/</span>
          <Link href="/partner-concierge" className="transition hover:text-[#c4a465]">
            Partner Concierge
          </Link>
        </p>

        <PartnerPurchaseForm
          industrySlug={industry.slug}
          industryLabel={industry.navLabel}
          initialPackageId={initialPackageId}
          packages={packages}
        />

        <div className="mt-10 border-t border-[#c4a465]/12 pt-8">
          <p className="text-sm leading-7 text-[#bfb39f]">
            Prefer to talk first?{' '}
            <Link
              href={`/inquiry?source=partner-concierge&industry=${industry.slug}`}
              className="text-[#c4a465] underline-offset-4 hover:underline"
            >
              Request information
            </Link>{' '}
            and Martin will follow up directly.
          </p>
          <ul className="mt-4 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.16em] text-[#efe6d4]/45">
            {PARTNER_INDUSTRIES.map((item) => (
              <li key={item.slug}>
                <Link href={item.href} className="transition hover:text-[#c4a465]">
                  {item.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
