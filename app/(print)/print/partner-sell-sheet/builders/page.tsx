import type { Metadata } from 'next'
import PartnerSellSheetPrintPage, {
  buildPartnerSellSheetMetadata,
} from '@/components/partner-sell-sheet/PartnerSellSheetPrintPage'

export const metadata: Metadata = buildPartnerSellSheetMetadata('builders')

export default function BuildersSellSheetPrintRoute() {
  return <PartnerSellSheetPrintPage slug="builders" />
}
