import type { CollectionConfig } from 'payload'
import { operationalCollectionAccess } from '@/lib/access'

export const PackageOptions: CollectionConfig = {

  access: operationalCollectionAccess,

  slug: 'package-options',

  admin: {
    useAsTitle: 'packageName',

    group: 'Experience Engine',

    defaultColumns: [
      'packageName',
      'clientPrice',
      'estimatedProfit',
      'profitMargin',
      'status',
    ],
  },

  hooks: {
    beforeChange: [
      ({ data }) => {
        const clientPrice = Number(data?.clientPrice || 0)
        const foodCost = Number(data?.foodCost || 0)
        const vendorCost = Number(data?.vendorCost || 0)
        const laborCost = Number(data?.laborCost || 0)
        const travelCost = Number(data?.travelCost || 0)
        const rentalCost = Number(data?.rentalCost || 0)

        const totalCost =
          foodCost +
          vendorCost +
          laborCost +
          travelCost +
          rentalCost

        const estimatedProfit =
          clientPrice - totalCost

        const profitMargin =
          clientPrice > 0
            ? Math.round(
                (estimatedProfit / clientPrice) * 100,
              )
            : 0

        return {
          ...data,

          totalEstimatedCost: totalCost,

          estimatedProfit,

          profitMargin,
        }
      },
    ],
  },

  fields: [
    {
      name: 'packageName',
      type: 'text',
      required: true,
    },

    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
    },

    {
      name: 'experienceBrief',
      type: 'relationship',
      relationTo: 'experience-briefs',
    },

    {
      name: 'status',
      type: 'select',

      defaultValue: 'draft',

      options: [
        {
          label: 'Draft',
          value: 'draft',
        },

        {
          label: 'Internal Review',
          value: 'internalReview',
        },

        {
          label: 'Sent to Client',
          value: 'sentToClient',
        },

        {
          label: 'Approved',
          value: 'approved',
        },

        {
          label: 'Declined',
          value: 'declined',
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
      name: 'selectedVenue',
      type: 'relationship',
      relationTo: 'venues',
    },

    {
      name: 'menuConcept',
      type: 'relationship',
      relationTo: 'menu-concepts',
    },

    {
      name: 'clientPrice',
      type: 'number',
      required: true,
    },

    {
      name: 'foodCost',
      type: 'number',
      defaultValue: 0,
    },

    {
      name: 'vendorCost',
      type: 'number',
      defaultValue: 0,
    },

    {
      name: 'laborCost',
      type: 'number',
      defaultValue: 0,
    },

    {
      name: 'travelCost',
      type: 'number',
      defaultValue: 0,
    },

    {
      name: 'rentalCost',
      type: 'number',
      defaultValue: 0,
    },

    {
      name: 'totalEstimatedCost',
      type: 'number',

      admin: {
        readOnly: true,

        description:
          'Automatically calculated total internal cost.',
      },
    },

    {
      name: 'estimatedProfit',
      type: 'number',

      admin: {
        readOnly: true,

        description:
          'Automatically calculated projected profit.',
      },
    },

    {
      name: 'profitMargin',
      type: 'number',

      admin: {
        readOnly: true,

        description:
          'Automatically calculated profit percentage.',
      },
    },

    {
      name: 'marginStatus',
      type: 'select',

      defaultValue: 'review',

      options: [
        {
          label: 'Review Needed',
          value: 'review',
        },

        {
          label: 'Healthy Margin',
          value: 'healthy',
        },

        {
          label: 'Premium Margin',
          value: 'premium',
        },

        {
          label: 'Too Thin',
          value: 'thin',
        },
      ],
    },

    {
      name: 'experienceSummary',
      type: 'textarea',
    },

    {
      name: 'internalNotes',
      type: 'textarea',
    },
  ],
}