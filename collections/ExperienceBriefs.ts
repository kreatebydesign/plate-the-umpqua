// collections/ExperienceBriefs.ts

import type { CollectionConfig } from 'payload'

export const ExperienceBriefs: CollectionConfig = {
  slug: 'experience-briefs',

  admin: {
    useAsTitle: 'briefTitle',

    group: 'Experience OS',

    defaultColumns: [
      'briefTitle',
      'client',
      'experienceType',
      'status',
      'packageReadiness',
    ],
  },

  hooks: {
    beforeChange: [
      ({ data }) => {
        if (
          data?.status === 'draft' &&
          data?.dreamExperience &&
          data?.experienceType
        ) {
          return {
            ...data,
            status: 'readyForPackage',
            packageReadiness: 'ready',
          }
        }

        return data
      },
    ],
  },

  fields: [
    {
      name: 'briefTitle',
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
      name: 'inquiry',
      type: 'relationship',
      relationTo: 'inquiries' as any,
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
          label: 'Ready for Package Build',
          value: 'readyForPackage',
        },

        {
          label: 'Package Built',
          value: 'packageBuilt',
        },

        {
          label: 'Proposal Ready',
          value: 'proposalReady',
        },
      ],
    },

    {
      name: 'packageReadiness',
      type: 'select',

      defaultValue: 'needsReview',

      options: [
        {
          label: 'Needs Review',
          value: 'needsReview',
        },

        {
          label: 'Ready',
          value: 'ready',
        },

        {
          label: 'Needs Venue Match',
          value: 'needsVenueMatch',
        },

        {
          label: 'Needs Vendor Match',
          value: 'needsVendorMatch',
        },

        {
          label: 'Needs Culinary Direction',
          value: 'needsCulinaryDirection',
        },
      ],
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
          label: 'Estate Dinner',
          value: 'estateDinner',
        },

        {
          label: 'Wine Country Experience',
          value: 'wineCountryExperience',
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
          label: 'Luxury Celebration',
          value: 'luxuryCelebration',
        },

        {
          label: 'White-Label Hospitality Experience',
          value: 'whiteLabelHospitality',
        },
      ],
    },

    {
      name: 'experienceMood',
      type: 'select',

      hasMany: true,

      options: [
        {
          label: 'Warm & Intimate',
          value: 'warmIntimate',
        },

        {
          label: 'Elegant & Refined',
          value: 'elegantRefined',
        },

        {
          label: 'Dark & Cinematic',
          value: 'darkCinematic',
        },

        {
          label: 'Wine Country Relaxed',
          value: 'wineCountryRelaxed',
        },

        {
          label: 'Modern Luxury',
          value: 'modernLuxury',
        },

        {
          label: 'Celebratory',
          value: 'celebratory',
        },

        {
          label: 'High Energy',
          value: 'highEnergy',
        },

        {
          label: 'Quietly Premium',
          value: 'quietlyPremium',
        },
      ],
    },

    {
      name: 'dreamExperience',
      type: 'textarea',

      admin: {
        description:
          'The client’s ideal version of the event. Capture the emotional, visual, culinary, and hospitality vision.',
      },
    },

    {
      name: 'cuisineDirection',
      type: 'textarea',
    },

    {
      name: 'serviceStyle',
      type: 'select',

      options: [
        {
          label: 'Coursed Dinner',
          value: 'coursedDinner',
        },

        {
          label: 'Family Style',
          value: 'familyStyle',
        },

        {
          label: 'Tasting Menu',
          value: 'tastingMenu',
        },

        {
          label: 'Cocktail Reception',
          value: 'cocktailReception',
        },

        {
          label: 'Interactive Stations',
          value: 'interactiveStations',
        },

        {
          label: 'Full Experience Buildout',
          value: 'fullExperienceBuildout',
        },
      ],
    },

    {
      name: 'dietaryRestrictions',
      type: 'relationship',
      relationTo: 'dietary-notes' as any,
      hasMany: true,
    },

    {
      name: 'preferredVenueTypes',
      type: 'select',

      hasMany: true,

      options: [
        {
          label: 'Estate',
          value: 'estate',
        },

        {
          label: 'Winery',
          value: 'winery',
        },

        {
          label: 'Private Residence',
          value: 'privateResidence',
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
          label: 'Outdoor Scenic',
          value: 'outdoorScenic',
        },

        {
          label: 'Club / Lounge',
          value: 'clubLounge',
        },
      ],
    },

    {
      name: 'desiredEnhancements',
      type: 'select',

      hasMany: true,

      options: [
        {
          label: 'Wine Pairing',
          value: 'winePairing',
        },

        {
          label: 'Live Music',
          value: 'liveMusic',
        },

        {
          label: 'DJ',
          value: 'dj',
        },

        {
          label: 'Floral Design',
          value: 'florals',
        },

        {
          label: 'Ice Carving',
          value: 'iceCarving',
        },

        {
          label: 'Luxury Transportation',
          value: 'luxuryTransport',
        },

        {
          label: 'Photography',
          value: 'photography',
        },

        {
          label: 'Videography',
          value: 'videography',
        },

        {
          label: 'Lighting Design',
          value: 'lightingDesign',
        },

        {
          label: 'Luxury Rentals',
          value: 'luxuryRentals',
        },

        {
          label: 'Hotel / Lodging Coordination',
          value: 'hotelLodging',
        },
      ],
    },

    {
      name: 'matchedVenues',
      type: 'relationship',
      relationTo: 'venues' as any,
      hasMany: true,
    },

    {
      name: 'matchedVendors',
      type: 'relationship',
      relationTo: 'vendor-partners' as any,
      hasMany: true,
    },

    {
      name: 'emotionalOutcome',
      type: 'textarea',

      admin: {
        description:
          'Describe how the client wants guests to feel during and after the experience.',
      },
    },

    {
      name: 'internalStrategy',
      type: 'textarea',

      admin: {
        description:
          'Internal notes on how to package, price, position, and protect margin.',
      },
    },
  ],
}