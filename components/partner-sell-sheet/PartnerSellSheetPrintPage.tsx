import type { Metadata } from 'next'
import { Cormorant_Garamond, Work_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import PartnerSellSheet from '@/components/partner-sell-sheet/PartnerSellSheet'
import {
  getPartnerSellSheetVariant,
  type PartnerSellSheetSlug,
} from '@/lib/site/partnerSellSheetConfig'

const work = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work',
  weight: ['400', '500', '600'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600'],
})

type PageProps = {
  slug: PartnerSellSheetSlug
}

export function buildPartnerSellSheetMetadata(slug: PartnerSellSheetSlug): Metadata {
  const variant = getPartnerSellSheetVariant(slug)
  return {
    title: variant?.seoTitle ?? 'Partner Sell Sheet Print Preview',
    description:
      'Isolated 8.5×11″ B2B sell-sheet preview for Plate The Umpqua Partner Concierge gifting program.',
    robots: { index: false, follow: false },
  }
}

export default function PartnerSellSheetPrintPage({ slug }: PageProps) {
  const variant = getPartnerSellSheetVariant(slug)
  if (!variant) notFound()

  return (
    <main className={`${work.variable} ${cormorant.variable}`}>
      <PartnerSellSheet variant={variant} />
    </main>
  )
}
