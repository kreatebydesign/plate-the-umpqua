import { getPayload } from 'payload'
import config from '../../../payload.config'

export type PublicTestimonial = {
  id: string
  quote: string
  attribution: string
}

/**
 * Homepage-safe published testimonials only.
 * Never returns private comments, ratings, emails, or event details.
 */
export async function getPublishedTestimonialsForHome(
  limit = 3,
): Promise<PublicTestimonial[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'testimonials',
      overrideAccess: true,
      depth: 0,
      limit: Math.min(Math.max(limit, 1), 6),
      sort: 'displayOrder',
      where: {
        and: [
          { publicationStatus: { equals: 'published' } },
          { testimonialPermission: { equals: true } },
          { publicExcerpt: { exists: true } },
        ],
      },
      select: {
        publicExcerpt: true,
        publicDisplayName: true,
        featuredQuote: true,
        clientName: true,
        publicationStatus: true,
        testimonialPermission: true,
      },
    })

    const rows: PublicTestimonial[] = []
    for (const doc of result.docs) {
      if (doc.publicationStatus !== 'published') continue
      if (!doc.testimonialPermission) continue

      const quote =
        (typeof doc.publicExcerpt === 'string' && doc.publicExcerpt.trim()) ||
        (typeof doc.featuredQuote === 'string' && doc.featuredQuote.trim()) ||
        ''
      if (!quote) continue

      const attribution =
        (typeof doc.publicDisplayName === 'string' &&
          doc.publicDisplayName.trim()) ||
        'Plate The Umpqua guest'

      rows.push({
        id: String(doc.id),
        quote: quote.slice(0, 600),
        attribution: attribution.slice(0, 80),
      })
    }

    return rows
  } catch {
    console.error('[testimonials] public home projection')
    return []
  }
}
