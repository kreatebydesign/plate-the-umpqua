import type { Metadata } from 'next'
import PartnerSellSheetPrintPage, {
  buildPartnerSellSheetMetadata,
  isPartnerSellSheetPrintIntent,
} from '@/components/partner-sell-sheet/PartnerSellSheetPrintPage'

export const metadata: Metadata = buildPartnerSellSheetMetadata('real-estate')

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RealEstateSellSheetPrintRoute({ searchParams }: Props) {
  const params = await searchParams
  return (
    <PartnerSellSheetPrintPage
      slug="real-estate"
      autoPrint={isPartnerSellSheetPrintIntent(params.print)}
    />
  )
}
