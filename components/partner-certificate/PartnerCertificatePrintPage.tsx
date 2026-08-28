import type { Metadata } from 'next'
import { Cormorant_Garamond, Work_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import PartnerCertificate from '@/components/partner-certificate/PartnerCertificate'
import {
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
}

export function buildPartnerCertificateMetadata(
  slug: PartnerCertificateSlug,
): Metadata {
  const variant = getPartnerCertificateVariant(slug)
  return {
    title: variant?.seoTitle ?? 'Partner Certificate Print Preview',
    description:
      'Isolated 7×5″ bulk-print preview for Plate The Umpqua Partner Concierge gift certificates with handwritten personalization fields.',
    robots: { index: false, follow: false },
  }
}

export default function PartnerCertificatePrintPage({ slug }: PageProps) {
  const variant = getPartnerCertificateVariant(slug)
  if (!variant) notFound()

  return (
    <main className={`${work.variable} ${cormorant.variable}`}>
      <PartnerCertificate variant={variant} />
    </main>
  )
}
