import type { Metadata } from 'next'
import { absoluteSiteUrl } from '@/lib/site/siteUrl'

const title = 'Request a Private Hospitality Experience'
const description =
  'Inquire about private chef dining, private events, estate gatherings, and concierge hospitality across Roseburg and the Umpqua Valley.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} | Plate The Umpqua`,
    description,
    url: absoluteSiteUrl('/inquiry'),
  },
  alternates: {
    canonical: absoluteSiteUrl('/inquiry'),
  },
}

export default function InquiryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
