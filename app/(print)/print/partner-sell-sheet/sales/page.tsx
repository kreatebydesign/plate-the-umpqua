import type { Metadata } from 'next'
import PartnerSellSheetPrintPage, {
  buildPartnerSellSheetMetadata,
  isPartnerSellSheetPrintIntent,
} from '@/components/partner-sell-sheet/PartnerSellSheetPrintPage'

export const metadata: Metadata = buildPartnerSellSheetMetadata('sales')

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SalesSellSheetPrintRoute({ searchParams }: Props) {
  const params = await searchParams
  return (
    <PartnerSellSheetPrintPage
      slug="sales"
      autoPrint={isPartnerSellSheetPrintIntent(params.print)}
    />
  )
}
