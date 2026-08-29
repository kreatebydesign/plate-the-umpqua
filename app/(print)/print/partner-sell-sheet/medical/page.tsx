import type { Metadata } from 'next'
import PartnerSellSheetPrintPage, {
  buildPartnerSellSheetMetadata,
  isPartnerSellSheetPrintIntent,
} from '@/components/partner-sell-sheet/PartnerSellSheetPrintPage'

export const metadata: Metadata = buildPartnerSellSheetMetadata('medical')

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function MedicalSellSheetPrintRoute({ searchParams }: Props) {
  const params = await searchParams
  return (
    <PartnerSellSheetPrintPage
      slug="medical"
      autoPrint={isPartnerSellSheetPrintIntent(params.print)}
    />
  )
}
