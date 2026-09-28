import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import {
  getServicePage,
  servicePageMetadata,
} from '@/lib/site/servicePages'
import { servicePageSchema } from '@/lib/site/servicePageSchema'

const SLUG = 'private-chef' as const

export const metadata = servicePageMetadata(SLUG)

export default function PrivateChefPage() {
  const page = getServicePage(SLUG)
  const schema = servicePageSchema(page)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ServiceLandingPage page={page} />
    </>
  )
}
