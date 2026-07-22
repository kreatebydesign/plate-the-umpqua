// collections/Proposals.ts

import type { CollectionConfig } from 'payload'
import { operationalCollectionAccess } from '@/lib/access'

export const Proposals: CollectionConfig = {

  access: operationalCollectionAccess,

  slug: 'proposals',

  admin: {
    useAsTitle: 'proposalTitle',

    group: 'Experience Engine',

    defaultColumns: [
      'proposalTitle',
      'client',
      'proposalStatus',
      'totalInvestment',
      'depositRequired',
      'finalBalance',
    ],
  },

  hooks: {
    beforeChange: [
      ({ data }) => {
        const totalInvestment = Number(data?.totalInvestment || 0)
        const depositRequired = Number(
          data?.depositRequired || Math.round(totalInvestment * 0.5),
        )

        return {
          ...data,
          depositRequired,
          finalBalance: totalInvestment - depositRequired,
        }
      },
    ],
  },

  fields: [
    {
      name: 'proposalTitle',
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
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
    },

    {
      name: 'experienceBrief',
      type: 'relationship',
      relationTo: 'experience-briefs',
    },

    {
      name: 'packageOption',
      type: 'relationship',
      relationTo: 'package-options',
    },

    {
      name: 'proposalStatus',
      type: 'select',

      defaultValue: 'draft',

      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Internal Review', value: 'internalReview' },
        { label: 'Sent', value: 'sent' },
        { label: 'Viewed', value: 'viewed' },
        { label: 'Approved', value: 'approved' },
        { label: 'Deposit Paid', value: 'depositPaid' },
        { label: 'Booked', value: 'booked' },
        { label: 'Declined', value: 'declined' },
      ],
    },

    {
      name: 'proposalSummary',
      type: 'richText',
    },

    {
      name: 'experienceVision',
      type: 'textarea',
    },

    {
      name: 'includedExperiences',
      type: 'array',

      fields: [
        {
          name: 'experienceItem',
          type: 'text',
        },
      ],
    },

    {
      name: 'includedVendors',
      type: 'relationship',
      relationTo: 'vendor-partners',
      hasMany: true,
    },

    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'venues',
    },

    {
      name: 'menuConcept',
      type: 'relationship',
      relationTo: 'menu-concepts',
    },

    {
      name: 'guestCount',
      type: 'number',
    },

    {
      name: 'eventDate',
      type: 'date',
    },

    {
      name: 'totalInvestment',
      type: 'number',
      required: true,
    },

    {
      name: 'depositRequired',
      type: 'number',

      admin: {
        description:
          'Automatically defaults to 50% if left empty.',
      },
    },

    {
      name: 'finalBalance',
      type: 'number',

      admin: {
        readOnly: true,
      },
    },

    {
      name: 'internalProjectedProfit',
      type: 'number',
    },

    {
      name: 'proposalPdf',
      type: 'upload',
      relationTo: 'media',
    },

    {
      name: 'signatureReceived',
      type: 'checkbox',
      defaultValue: false,
    },

    {
      name: 'depositPaid',
      type: 'checkbox',
      defaultValue: false,
    },

    {
      name: 'clientFeedback',
      type: 'textarea',
    },

    {
      name: 'internalNotes',
      type: 'textarea',
    },
  ],
}