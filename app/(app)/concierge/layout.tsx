import type { Metadata } from 'next'
import { absoluteSiteUrl } from '@/lib/site/siteUrl'

const title = 'Concierge Hospitality for Hosts & Partners'
const description =
  'Premium concierge hospitality for realtors, wineries, estate hosts, and businesses across Roseburg and the Umpqua Valley.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} | Plate The Umpqua`,
    description,
    url: absoluteSiteUrl('/concierge'),
  },
  alternates: {
    canonical: absoluteSiteUrl('/concierge'),
  },
}

export default function ConciergeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
