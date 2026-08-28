import type { PartnerIndustryConfig } from '@/lib/site/partnerConciergeIndustries'
import { partnerIndustryPageSchema } from '@/lib/site/partnerConciergeSchema'

type Props = {
  industry: PartnerIndustryConfig
}

export default function PartnerIndustryJsonLd({ industry }: Props) {
  const schema = partnerIndustryPageSchema(industry)
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
