import HomePageClient from './HomePageClient'
import { getPublishedTestimonialsForHome } from '@/lib/os/testimonials/publicTestimonials'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const memories = await getPublishedTestimonialsForHome(3)
  return <HomePageClient memories={memories} />
}
