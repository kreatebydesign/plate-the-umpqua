import type { CollectionConfig } from 'payload'
import { operationalCollectionAccess } from '@/lib/access'

export const Clients: CollectionConfig = {

  access: operationalCollectionAccess,

  slug: 'clients',

  admin: {
    useAsTitle: 'fullName',

    group: 'Experience OS',

    defaultColumns: [
      'fullName',
      'brand',
      'email',
      'clientType',
      'vipStatus',
    ],
  },

  fields: [
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands' as any,

      admin: {
        description:
          'Which hospitality brand or white-label instance this client belongs to.',
      },
    },

    {
      name: 'fullName',
      type: 'text',
      required: true,
    },

    {
      name: 'email',
      type: 'email',
      required: true,
    },

    {
      name: 'phone',
      type: 'text',
    },

    {
      name: 'instagram',
      type: 'text',
    },

    {
      name: 'clientType',
      type: 'select',

      defaultValue: 'private',

      options: [
        {
          label: 'Private Client',
          value: 'private',
        },

        {
          label: 'Realtor',
          value: 'realtor',
        },

        {
          label: 'Executive / Corporate',
          value: 'executive',
        },

        {
          label: 'Winery / Estate Partner',
          value: 'partner',
        },

        {
          label: 'Hospitality Brand',
          value: 'hospitalityBrand',
        },

        {
          label: 'White-Label Partner',
          value: 'whiteLabelPartner',
        },
      ],
    },

    {
      name: 'vipStatus',
      type: 'select',

      defaultValue: 'standard',

      options: [
        {
          label: 'Standard',
          value: 'standard',
        },

        {
          label: 'Preferred',
          value: 'preferred',
        },

        {
          label: 'VIP',
          value: 'vip',
        },

        {
          label: 'Founding Hospitality Partner',
          value: 'foundingPartner',
        },
      ],
    },

    {
      name: 'preferredExperienceStyle',
      type: 'select',

      hasMany: true,

      options: [
        {
          label: 'Private Dinner',
          value: 'privateDinner',
        },

        {
          label: 'Estate Dinner',
          value: 'estateDinner',
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
          label: 'Realtor Concierge',
          value: 'realtorConcierge',
        },

        {
          label: 'Celebration / Milestone',
          value: 'celebration',
        },

        {
          label: 'Luxury Event',
          value: 'luxuryEvent',
        },

        {
          label: 'Club / Lounge Experience',
          value: 'clubLounge',
        },
      ],
    },

    {
      name: 'favoriteVendors',
      type: 'relationship',

      relationTo: 'vendor-partners' as any,

      hasMany: true,
    },

    {
      name: 'favoriteVenues',
      type: 'relationship',

      relationTo: 'venues' as any,

      hasMany: true,
    },

    {
      name: 'averageSpendRange',
      type: 'text',
    },

    {
      name: 'relationshipNotes',
      type: 'textarea',

      admin: {
        description:
          'Private relationship notes, preferences, emotional context, luxury expectations, and follow-up details.',
      },
    },

    {
      name: 'internalStrategyNotes',
      type: 'textarea',
    },
  ],
}