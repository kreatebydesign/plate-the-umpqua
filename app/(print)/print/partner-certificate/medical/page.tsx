import type { Metadata } from 'next'
import PartnerCertificatePrintPage, {
  buildPartnerCertificateMetadata,
} from '@/components/partner-certificate/PartnerCertificatePrintPage'

export const metadata: Metadata = buildPartnerCertificateMetadata('medical')

export default function MedicalCertificatePrintRoute() {
  return (
    <PartnerCertificatePrintPage
      slug="medical"
      sampleOverrides={{
        certificateNumber: 'PTU-MD-000091',
        presentedByName: 'Dr. Elena Vargas',
        presentedByCompany: 'Umpqua Valley Medical Group',
        recipientName: 'The Rivera Family',
      }}
    />
  )
}
