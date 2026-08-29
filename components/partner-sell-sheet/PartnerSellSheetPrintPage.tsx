import type { Metadata } from 'next'
import { Cormorant_Garamond, Work_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import AutoPrint from '@/components/partner-sell-sheet/AutoPrint'
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
  /** True when opened via Sales Materials “Print / Save PDF” (`?print=1`). */
  autoPrint?: boolean
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

/** True when the sell-sheet route was opened with print intent (`?print=1`). */
export function isPartnerSellSheetPrintIntent(
  print: string | string[] | undefined,
): boolean {
  const value = Array.isArray(print) ? print[0] : print
  return value === '1'
}

export default function PartnerSellSheetPrintPage({
  slug,
  autoPrint = false,
}: PageProps) {
  const variant = getPartnerSellSheetVariant(slug)
  if (!variant) notFound()

  return (
    <main className={`${work.variable} ${cormorant.variable}`}>
      <AutoPrint enabled={autoPrint} />
      <PartnerSellSheet variant={variant} />
    </main>
  )
}
