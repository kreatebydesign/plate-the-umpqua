// collections/VendorPartners.ts

import type { CollectionConfig } from 'payload'

export const VendorPartners: CollectionConfig = {
  slug: 'vendor-partners',

  admin: {
    useAsTitle: 'businessName',

    group: 'Hospitality Network',

    defaultColumns: [
      'businessName',
      'vendorType',
      'serviceRegion',
      'pricingTier',
      'preferredPartner',
    ],
  },

  fields: [
    {
      name: 'businessName',
      type: 'text',
      required: true,
    },

    {
      name: 'vendorType',
      type: 'select',

      required: true,

      options: [
        {
          label: 'Venue',
          value: 'venue',
        },

        {
          label: 'Winery',
          value: 'winery',
        },

        {
          label: 'DJ',
          value: 'dj',
        },

        {
          label: 'Live Music',
          value: 'liveMusic',
        },

        {
          label: 'Ice Carver',
          value: 'iceCarver',
        },

        {
          label: 'Florist',
          value: 'florist',
        },

        {
          label: 'Photographer',
          value: 'photographer',
        },

        {
          label: 'Videographer',
          value: 'videographer',
        },

        {
          label: 'Rental Company',
          value: 'rentalCompany',
        },

        {
          label: 'Transportation',
          value: 'transportation',
        },

        {
          label: 'Hotel',
          value: 'hotel',
        },

        {
          label: 'Country Club',
          value: 'countryClub',
        },

        {
          label: 'Private Estate',
          value: 'privateEstate',
        },

        {
          label: 'Bartending',
          value: 'bartending',
        },

        {
          label: 'Security',
          value: 'security',
        },

        {
          label: 'Luxury Concierge',
          value: 'luxuryConcierge',
        },

        {
          label: 'Lighting Design',
          value: 'lightingDesign',
        },

        {
          label: 'Tablescape / Rentals',
          value: 'tablescapeRentals',
        },

        {
          label: 'Private Chef',
          value: 'privateChef',
        },

        {
          label: 'Club / Lounge',
          value: 'clubLounge',
        },
      ],
    },

    {
      name: 'contactName',
      type: 'text',
    },

    {
      name: 'email',
      type: 'email',
    },

    {
      name: 'phone',
      type: 'text',
    },

    {
      name: 'website',
      type: 'text',
    },

    {
      name: 'instagram',
      type: 'text',
    },

    {
      name: 'serviceRegion',
      type: 'text',

      defaultValue: 'Umpqua Valley',
    },

    {
      name: 'pricingTier',
      type: 'select',

      options: [
        {
          label: 'Accessible',
          value: 'accessible',
        },

        {
          label: 'Premium',
          value: 'premium',
        },

        {
          label: 'Luxury',
          value: 'luxury',
        },

        {
          label: 'Ultra Luxury',
          value: 'ultraLuxury',
        },
      ],
    },

    {
      name: 'preferredPartner',
      type: 'checkbox',

      defaultValue: false,
    },

    {
      name: 'whiteLabelApproved',
      type: 'checkbox',

      defaultValue: false,

      admin: {
        description:
          'Approved for white-label KXD hospitality deployment.',
      },
    },

    {
      name: 'averageSpendRange',
      type: 'text',
    },

    {
      name: 'operationalNotes',
      type: 'textarea',
    },

    {
      name: 'luxuryFitNotes',
      type: 'textarea',

      admin: {
        description:
          'Internal notes about aesthetic quality, professionalism, guest experience, and overall fit.',
      },
    },

    {
      name: 'gallery',
      type: 'upload',

      relationTo: 'media',

      hasMany: true,
    },
  ],
}