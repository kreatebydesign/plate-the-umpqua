import type { Metadata } from 'next'
import PartnerCertificatePrintPage, {
  buildPartnerCertificateMetadata,
} from '@/components/partner-certificate/PartnerCertificatePrintPage'

export const metadata: Metadata = buildPartnerCertificateMetadata('legal')

export default function LegalCertificatePrintRoute() {
  return <PartnerCertificatePrintPage slug="legal" />
}
