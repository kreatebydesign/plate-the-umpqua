import type { Metadata } from 'next'
import PartnerSellSheetPrintPage, {
  buildPartnerSellSheetMetadata,
} from '@/components/partner-sell-sheet/PartnerSellSheetPrintPage'

export const metadata: Metadata = buildPartnerSellSheetMetadata('sales')

export default function SalesSellSheetPrintRoute() {
  return <PartnerSellSheetPrintPage slug="sales" />
}
