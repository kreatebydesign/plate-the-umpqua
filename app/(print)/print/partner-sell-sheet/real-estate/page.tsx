import type { Metadata } from 'next'
import PartnerSellSheetPrintPage, {
  buildPartnerSellSheetMetadata,
} from '@/components/partner-sell-sheet/PartnerSellSheetPrintPage'

export const metadata: Metadata = buildPartnerSellSheetMetadata('real-estate')

export default function RealEstateSellSheetPrintRoute() {
  return <PartnerSellSheetPrintPage slug="real-estate" />
}
