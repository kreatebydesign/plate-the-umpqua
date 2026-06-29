// collections/Events.ts

import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',

  admin: {
    useAsTitle: 'eventName',
    group: 'Experience Engine',

    defaultColumns: [
      'eventName',
      'eventDate',
      'eventStatus',
      'guestCount',
    ],
  },

  fields: [
    {
      name: 'eventName',
      type: 'text',
      required: true,
    },

    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients' as any,
      required: true,
    },

    {
      name: 'packageOption',
      type: 'relationship',
      relationTo: 'package-options' as any,
    },

    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'venues' as any,
    },

    {
      name: 'eventDate',
      type: 'date',
      required: true,
    },

    {
      name: 'guestCount',
      type: 'number',
    },

    {
      name: 'eventStatus',
      type: 'select',

      defaultValue: 'planning',

      options: [
        {
          label: 'Planning',
          value: 'planning',
        },

        {
          label: 'Confirmed',
          value: 'confirmed',
        },

        {
          label: 'Vendor Coordination',
          value: 'vendorCoordination',
        },

        {
          label: 'In Production',
          value: 'inProduction',
        },

        {
          label: 'Completed',
          value: 'completed',
        },

        {
          label: 'Archived',
          value: 'archived',
        },
      ],
    },

    {
      name: 'assignedVendors',
      type: 'relationship',
      relationTo: 'vendor-partners' as any,
      hasMany: true,
    },

    {
      name: 'timelineNotes',
      type: 'textarea',
    },

    {
      name: 'staffNotes',
      type: 'textarea',
    },

    {
      name: 'clientNotes',
      type: 'textarea',
    },

    {
      name: 'arrivalInstructions',
      type: 'textarea',
    },

    {
      name: 'specialMoments',
      type: 'textarea',

      admin: {
        description:
          'Memorable moments, surprise elements, guest highlights, and emotional touchpoints.',
      },
    },

    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media' as any,
      hasMany: true,
    },
  ],
}