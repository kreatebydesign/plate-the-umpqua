import type { CollectionConfig } from 'payload'

export const Venues: CollectionConfig = {
  slug: 'venues',

  admin: {
    useAsTitle: 'venueName',

    group: 'Hospitality Network',

    defaultColumns: [
      'venueName',
      'venueType',
      'region',
      'guestCapacity',
      'featured',
    ],
  },

  fields: [
    {
      name: 'venueName',
      type: 'text',
      required: true,
    },

    {
      name: 'venueType',
      type: 'select',

      required: true,

      options: [
        {
          label: 'Winery',
          value: 'winery',
        },

        {
          label: 'Private Estate',
          value: 'privateEstate',
        },

        {
          label: 'Country Club',
          value: 'countryClub',
        },

        {
          label: 'Luxury Home',
          value: 'luxuryHome',
        },

        {
          label: 'Hotel',
          value: 'hotel',
        },

        {
          label: 'Resort',
          value: 'resort',
        },

        {
          label: 'Outdoor Scenic',
          value: 'outdoorScenic',
        },

        {
          label: 'Restaurant Partner',
          value: 'restaurantPartner',
        },

        {
          label: 'Club / Lounge',
          value: 'clubLounge',
        },
      ],
    },

    {
      name: 'region',
      type: 'text',

      defaultValue: 'Umpqua Valley',
    },

    {
      name: 'address',
      type: 'textarea',
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
      name: 'contactName',
      type: 'text',
    },

    {
      name: 'contactEmail',
      type: 'email',
    },

    {
      name: 'contactPhone',
      type: 'text',
    },

    {
      name: 'guestCapacity',
      type: 'number',
    },

    {
      name: 'pricingTier',
      type: 'select',

      options: [
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
      name: 'featured',
      type: 'checkbox',

      defaultValue: false,
    },

    {
      name: 'whiteLabelReady',
      type: 'checkbox',

      defaultValue: false,
    },

    {
      name: 'venueFeatures',
      type: 'select',

      hasMany: true,

      options: [
        {
          label: 'Wine Pairing Friendly',
          value: 'winePairing',
        },

        {
          label: 'Scenic Views',
          value: 'scenicViews',
        },

        {
          label: 'Indoor / Outdoor',
          value: 'indoorOutdoor',
        },

        {
          label: 'Chef Friendly Kitchen',
          value: 'chefKitchen',
        },

        {
          label: 'Luxury Lodging',
          value: 'luxuryLodging',
        },

        {
          label: 'Live Music Capable',
          value: 'liveMusic',
        },

        {
          label: 'Wedding Friendly',
          value: 'weddingFriendly',
        },

        {
          label: 'Corporate Ready',
          value: 'corporateReady',
        },

        {
          label: 'Luxury Event Ready',
          value: 'luxuryEventReady',
        },

        {
          label: 'Club Atmosphere',
          value: 'clubAtmosphere',
        },
      ],
    },

    {
      name: 'preferredVendorPartners',
      type: 'relationship',

      relationTo: 'vendor-partners',

      hasMany: true,
    },

    {
      name: 'internalHospitalityNotes',
      type: 'textarea',
    },

    {
      name: 'luxuryExperienceNotes',
      type: 'textarea',

      admin: {
        description:
          'Internal notes about atmosphere, aesthetics, service quality, emotional feel, and overall experience alignment.',
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