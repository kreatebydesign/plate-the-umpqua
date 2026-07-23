// collections/Events.ts

import type { CollectionConfig } from 'payload'
import { operationalCollectionAccess } from '@/lib/access'

export const Events: CollectionConfig = {

  access: operationalCollectionAccess,

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
      relationTo: 'clients',
      required: true,
    },

    {
      name: 'packageOption',
      type: 'relationship',
      relationTo: 'package-options',
    },

    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'venues',
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
      relationTo: 'vendor-partners',
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
      relationTo: 'media',
      hasMany: true,
    },

    {
      name: 'feedbackOptOut',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Skip the post-event client feedback email for this event.',
      },
    },

    {
      name: 'feedbackSentAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description:
          'When the post-event feedback email was accepted by the provider. Prevents duplicate sends.',
      },
    },

    {
      name: 'feedbackProviderMessageId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Email provider message id for the feedback request.',
      },
    },

    {
      name: 'feedbackLastError',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Safe last delivery error summary (no secrets).',
      },
    },

    {
      name: 'feedbackSendClaimedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Lease timestamp while a feedback send is in progress.',
      },
    },

    {
      name: 'feedbackTokenHash',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: 'SHA-256 hash of the active feedback link token.',
      },
    },

    {
      name: 'feedbackTokenExpiresAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },

    {
      name: 'feedbackTokenRevokedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },

    {
      name: 'feedbackTokenCreatedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },

    {
      name: 'feedbackSubmittedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'When the client submitted private experience feedback.',
      },
    },
  ],
}