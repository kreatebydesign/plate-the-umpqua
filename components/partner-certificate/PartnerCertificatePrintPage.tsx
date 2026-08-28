import type { Metadata } from 'next'
import { Cormorant_Garamond, Work_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import PartnerCertificate from '@/components/partner-certificate/PartnerCertificate'
import {
  CERTIFICATE_SAMPLE_DATA,
  getPartnerCertificateVariant,
  type PartnerCertificateSlug,
} from '@/lib/site/partnerCertificateConfig'

const work = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work',
  weight: ['400', '500', '600'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600'],
})

type PageProps = {
  slug: PartnerCertificateSlug
  /** Industry-specific sample presentation details for design QA */
  sampleOverrides?: Partial<typeof CERTIFICATE_SAMPLE_DATA>
}

export function buildPartnerCertificateMetadata(
  slug: PartnerCertificateSlug,
): Metadata {
  const variant = getPartnerCertificateVariant(slug)
  return {
    title: variant?.seoTitle ?? 'Partner Certificate Print Preview',
    description:
      'Isolated 7×5″ print preview for Plate The Umpqua Partner Concierge gift certificates.',
    robots: { index: false, follow: false },
  }
}

export default function PartnerCertificatePrintPage({
  slug,
  sampleOverrides,
}: PageProps) {
  const variant = getPartnerCertificateVariant(slug)
  if (!variant) notFound()

  const data = { ...CERTIFICATE_SAMPLE_DATA, ...sampleOverrides }

  return (
    <main className={`${work.variable} ${cormorant.variable}`}>
      <PartnerCertificate variant={variant} data={data} />
    </main>
  )
}
