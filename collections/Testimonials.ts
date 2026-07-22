import type { CollectionConfig } from 'payload'
import { operationalCollectionAccess } from '@/lib/access'

export const Testimonials: CollectionConfig = {

  access: operationalCollectionAccess,

  slug: 'testimonials',

  admin: {
    useAsTitle: 'clientName',

    group: 'Brand & Trust',

    defaultColumns: [
      'clientName',
      'experienceType',
      'rating',
      'featured',
    ],
  },

  fields: [
    {
      name: 'clientName',
      type: 'text',
      required: true,
    },

    {
      name: 'experienceType',
      type: 'select',

      options: [
        {
          label: 'Private Dinner',
          value: 'privateDinner',
        },

        {
          label: 'Estate Event',
          value: 'estateEvent',
        },

        {
          label: 'Wine Country Experience',
          value: 'wineCountry',
        },

        {
          label: 'Executive Hospitality',
          value: 'executiveHospitality',
        },

        {
          label: 'Luxury Celebration',
          value: 'luxuryCelebration',
        },

        {
          label: 'White-Label Hospitality',
          value: 'whiteLabelHospitality',
        },
      ],
    },

    {
      name: 'testimonial',
      type: 'textarea',
      required: true,
    },

    {
      name: 'rating',
      type: 'number',

      min: 1,
      max: 5,
    },

    {
      name: 'featured',
      type: 'checkbox',

      defaultValue: false,
    },

    {
      name: 'featuredQuote',
      type: 'text',
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