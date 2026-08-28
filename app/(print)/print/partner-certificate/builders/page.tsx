import type { Metadata } from 'next'
import PartnerCertificatePrintPage, {
  buildPartnerCertificateMetadata,
} from '@/components/partner-certificate/PartnerCertificatePrintPage'

export const metadata: Metadata = buildPartnerCertificateMetadata('builders')

export default function BuildersCertificatePrintRoute() {
  return <PartnerCertificatePrintPage slug="builders" />
}
