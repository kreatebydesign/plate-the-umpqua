import type { Metadata } from 'next'
import PartnerSellSheetPrintPage, {
  buildPartnerSellSheetMetadata,
} from '@/components/partner-sell-sheet/PartnerSellSheetPrintPage'

export const metadata: Metadata = buildPartnerSellSheetMetadata('medical')

export default function MedicalSellSheetPrintRoute() {
  return <PartnerSellSheetPrintPage slug="medical" />
}
