import type { Metadata } from 'next'
import PartnerCertificatePrintPage, {
  buildPartnerCertificateMetadata,
} from '@/components/partner-certificate/PartnerCertificatePrintPage'

export const metadata: Metadata = buildPartnerCertificateMetadata('medical')

export default function MedicalCertificatePrintRoute() {
  return <PartnerCertificatePrintPage slug="medical" />
}
