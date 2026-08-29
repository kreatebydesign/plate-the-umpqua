import type { Metadata } from 'next'
import PartnerSellSheetPrintPage, {
  buildPartnerSellSheetMetadata,
  isPartnerSellSheetPrintIntent,
} from '@/components/partner-sell-sheet/PartnerSellSheetPrintPage'

export const metadata: Metadata = buildPartnerSellSheetMetadata('builders')

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BuildersSellSheetPrintRoute({ searchParams }: Props) {
  const params = await searchParams
  return (
    <PartnerSellSheetPrintPage
      slug="builders"
      autoPrint={isPartnerSellSheetPrintIntent(params.print)}
    />
  )
}
