import type { Metadata } from 'next'
import PartnerCertificatePrintPage, {
  buildPartnerCertificateMetadata,
} from '@/components/partner-certificate/PartnerCertificatePrintPage'

export const metadata: Metadata = buildPartnerCertificateMetadata('real-estate')

export default function RealEstateCertificatePrintRoute() {
  return <PartnerCertificatePrintPage slug="real-estate" />
}
