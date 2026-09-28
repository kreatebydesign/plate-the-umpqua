import type { Metadata } from 'next'
import { absoluteSiteUrl } from '@/lib/site/siteUrl'

const title = 'Private Dining Experiences in Roseburg & the Umpqua Valley'
const description =
  'Chef-led private dining experiences for homes, estates, and wine country gatherings across Roseburg, the Umpqua Valley, and Southern Oregon.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} | Plate The Umpqua`,
    description,
    url: absoluteSiteUrl('/experiences'),
  },
  alternates: {
    canonical: absoluteSiteUrl('/experiences'),
  },
}

export default function ExperiencesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
