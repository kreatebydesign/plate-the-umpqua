import type { Metadata } from 'next'
import PartnerCertificatePrintPage, {
  buildPartnerCertificateMetadata,
} from '@/components/partner-certificate/PartnerCertificatePrintPage'

export const metadata: Metadata = buildPartnerCertificateMetadata('sales')

export default function SalesCertificatePrintRoute() {
  return <PartnerCertificatePrintPage slug="sales" />
}
