import type { Metadata } from 'next'
import { absoluteSiteUrl } from '@/lib/site/siteUrl'

const title = 'Private Hospitality Packages'
const description =
  'Private table, estate and winery, and executive concierge hospitality packages for Roseburg and the Umpqua Valley — starting points for chef-led evenings.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} | Plate The Umpqua`,
    description,
    url: absoluteSiteUrl('/packages'),
  },
  alternates: {
    canonical: absoluteSiteUrl('/packages'),
  },
}

export default function PackagesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
