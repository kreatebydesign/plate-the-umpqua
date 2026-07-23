import type { CollectionConfig } from 'payload'
import { operationalCollectionAccess } from '@/lib/access'

/**
 * Brand testimonials and client experience feedback.
 * Public homepage may only render records with publicationStatus = published
 * via a server-side projection (overrideAccess), never via open collection read.
 */
export const Testimonials: CollectionConfig = {
  access: operationalCollectionAccess,

  slug: 'testimonials',

  admin: {
    useAsTitle: 'clientName',
    group: 'Brand & Trust',
    defaultColumns: [
      'clientName',
      'publicationStatus',
      'rating',
      'testimonialPermission',
      'experienceType',
    ],
  },

  fields: [
    {
      name: 'clientName',
      type: 'text',
      required: true,
      admin: {
        description:
          'Internal label. Public pages use publicDisplayName when published.',
      },
    },

    {
      name: 'experienceType',
      type: 'select',
      options: [
        { label: 'Private Dinner', value: 'privateDinner' },
        { label: 'Estate Event', value: 'estateEvent' },
        { label: 'Wine Country Experience', value: 'wineCountry' },
        { label: 'Executive Hospitality', value: 'executiveHospitality' },
        { label: 'Luxury Celebration', value: 'luxuryCelebration' },
        { label: 'White-Label Hospitality', value: 'whiteLabelHospitality' },
      ],
    },

    {
      name: 'testimonial',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'Original client comments (private until an approved public excerpt is published).',
      },
    },

    {
      name: 'stoodOut',
      type: 'textarea',
      admin: {
        description: 'Optional client answer to “What stood out?”',
      },
    },

    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        description: 'Private experience rating. Not shown publicly by default.',
      },
    },

    {
      name: 'source',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Manual / legacy', value: 'manual' },
        { label: 'Client feedback link', value: 'clientFeedback' },
      ],
      admin: { position: 'sidebar' },
    },

    {
      name: 'publicationStatus',
      type: 'select',
      defaultValue: 'private',
      options: [
        { label: 'Private', value: 'private' },
        { label: 'Awaiting moderation', value: 'awaitingModeration' },
        { label: 'Published', value: 'published' },
        { label: 'Unpublished', value: 'unpublished' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Published testimonials may appear on the homepage. Consent and an approved excerpt are required.',
      },
    },

    {
      name: 'testimonialPermission',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Client explicitly allowed Plate The Umpqua to share comments as a testimonial.',
      },
    },

    {
      name: 'consentWordingVersion',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Version id of the consent wording shown to the client.',
      },
    },

    {
      name: 'consentWordingExact',
      type: 'textarea',
      admin: {
        readOnly: true,
        description: 'Exact consent wording accepted by the client.',
      },
    },

    {
      name: 'consentGrantedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },

    {
      name: 'publicExcerpt',
      type: 'textarea',
      admin: {
        description:
          'Operator-approved public excerpt. Must preserve the client’s meaning.',
      },
    },

    {
      name: 'publicDisplayName',
      type: 'text',
      admin: {
        description: 'Public attribution, e.g. “Martin S.” or “Private dinner client”.',
      },
    },

    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 100,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first on the homepage.',
      },
    },

    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
    },

    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      admin: { position: 'sidebar' },
    },

    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      admin: { position: 'sidebar' },
    },

    {
      name: 'submittedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },

    {
      name: 'tokenHint',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Truncated token hash hint for audit only.',
      },
    },

    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Legacy highlight flag. Homepage uses publicationStatus.',
      },
    },

    {
      name: 'featuredQuote',
      type: 'text',
      admin: {
        description: 'Legacy short pull-quote field.',
      },
    },

    {
      name: 'eventGallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },

    {
      name: 'clientPhoto',
      type: 'upload',
      relationTo: 'media',
    },

    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'venues',
    },

    {
      name: 'location',
      type: 'text',
    },

    {
      name: 'luxuryExperienceNotes',
      type: 'textarea',
      admin: {
        description:
          'Internal notes about the overall emotional impact and hospitality quality.',
      },
    },
  ],
}
