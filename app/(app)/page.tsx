import type { Metadata } from 'next'
import HomePageClient from './HomePageClient'
import { getPublishedTestimonialsForHome } from '@/lib/os/testimonials/publicTestimonials'
import { absoluteSiteUrl, SITE_ORIGIN } from '@/lib/site/siteUrl'

export const dynamic = 'force-dynamic'

const title = 'Plate The Umpqua | Private Chef Hospitality in Roseburg, Oregon'
const description =
  'Hire Chef Martin for private chef dining, private events, elevated catering, and wine country hospitality across Roseburg, the Umpqua Valley, and Southern Oregon.'

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  openGraph: {
    title,
    description,
    url: SITE_ORIGIN,
  },
  alternates: {
    canonical: absoluteSiteUrl('/'),
  },
}

export default async function HomePage() {
  const memories = await getPublishedTestimonialsForHome(3)
  return <HomePageClient memories={memories} />
}
