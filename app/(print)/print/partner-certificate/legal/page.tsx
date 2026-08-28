import type { Metadata } from 'next'
import PartnerCertificatePrintPage, {
  buildPartnerCertificateMetadata,
} from '@/components/partner-certificate/PartnerCertificatePrintPage'

export const metadata: Metadata = buildPartnerCertificateMetadata('legal')

export default function LegalCertificatePrintRoute() {
  return (
    <PartnerCertificatePrintPage
      slug="legal"
      sampleOverrides={{
        certificateNumber: 'PTU-LG-000056',
        presentedByName: 'Michael Chen',
        presentedByCompany: 'Chen & Associates LLP',
        recipientName: undefined,
      }}
    />
  )
}
