import ServiceLandingPage from '@/components/services/ServiceLandingPage'
import {
  getServicePage,
  servicePageMetadata,
} from '@/lib/site/servicePages'
import { servicePageSchema } from '@/lib/site/servicePageSchema'

const SLUG = 'catering' as const

export const metadata = servicePageMetadata(SLUG)

export default function CateringPage() {
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
