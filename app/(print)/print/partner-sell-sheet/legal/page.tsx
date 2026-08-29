import type { Metadata } from 'next'
import PartnerSellSheetPrintPage, {
  buildPartnerSellSheetMetadata,
  isPartnerSellSheetPrintIntent,
} from '@/components/partner-sell-sheet/PartnerSellSheetPrintPage'

export const metadata: Metadata = buildPartnerSellSheetMetadata('legal')

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LegalSellSheetPrintRoute({ searchParams }: Props) {
  const params = await searchParams
  return (
    <PartnerSellSheetPrintPage
      slug="legal"
      autoPrint={isPartnerSellSheetPrintIntent(params.print)}
    />
  )
}
