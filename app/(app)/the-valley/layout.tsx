import type { Metadata } from 'next'
import { absoluteSiteUrl } from '@/lib/site/siteUrl'

const title = 'The Umpqua Valley'
const description =
  'Private dinners, estate gatherings, and wine country hospitality rooted in Roseburg, the Umpqua Valley, and Southern Oregon.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} | Plate The Umpqua`,
    description,
    url: absoluteSiteUrl('/the-valley'),
  },
  alternates: {
    canonical: absoluteSiteUrl('/the-valley'),
  },
}

export default function TheValleyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
