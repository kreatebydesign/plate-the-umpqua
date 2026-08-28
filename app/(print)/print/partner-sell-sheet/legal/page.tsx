import type { Metadata } from 'next'
import PartnerSellSheetPrintPage, {
  buildPartnerSellSheetMetadata,
} from '@/components/partner-sell-sheet/PartnerSellSheetPrintPage'

export const metadata: Metadata = buildPartnerSellSheetMetadata('legal')

export default function LegalSellSheetPrintRoute() {
  return <PartnerSellSheetPrintPage slug="legal" />
}
