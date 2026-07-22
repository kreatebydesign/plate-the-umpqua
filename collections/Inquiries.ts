import type { CollectionConfig } from 'payload'
import { operationalCollectionAccess } from '@/lib/access'

export const Inquiries: CollectionConfig = {

  access: operationalCollectionAccess,

  slug: 'inquiries',

  admin: {
    useAsTitle: 'eventTitle',

    group: 'Experience OS',

    defaultColumns: [
      'eventTitle',
      'leadSource',
      'brand',
      'client',
      'eventDate',
      'guestCount',
      'status',
      'priorityLevel',
    ],
  },

  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.status === 'newLead' && data?.experienceVision) {
          return {
            ...data,
            status: 'discoveryNeeded',
          }
        }

        return data
      },
    ],
  },

  fields: [
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',

      admin: {
        description:
          'Which hospitality brand or white-label instance this inquiry belongs to.',
      },
    },

    {
      name: 'leadSource',
      type: 'select',

      defaultValue: 'website',

      admin: {
        position: 'sidebar',

        description:
          'The public channel or campaign that originated this inquiry.',
      },

      options: [
        {
          label: 'Website',
          value: 'website',
        },

        {
          label: 'Concierge',
          value: 'concierge',
        },

        {
          label: 'Packages',
          value: 'packages',
        },

        {
          label: 'Partner Concierge Program',
          value: 'partner-concierge',
        },

        {
          label: 'Private Community Partnership',
          value: 'community-partnership',
        },

        {
          label: 'Realtor',
          value: 'realtor',
        },

        {
          label: 'Wine Country',
          value: 'wine-country',
        },

        {
          label: 'Referral',
          value: 'referral',
        },
      ],
    },

    {
      name: 'eventTitle',
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
      name: 'status',
      type: 'select',

      defaultValue: 'newLead',

      options: [
        {
          label: 'New Lead',
          value: 'newLead',
        },

        {
          label: 'Discovery Needed',
          value: 'discoveryNeeded',
        },

        {
          label: 'Discovery Scheduled',
          value: 'discoveryScheduled',
        },

        {
          label: 'Brief In Progress',
          value: 'briefInProgress',
        },

        {
          label: 'Package In Progress',
          value: 'packageInProgress',
        },

        {
          label: 'Proposal In Progress',
          value: 'proposalInProgress',
        },

        {
          label: 'Proposal Sent',
          value: 'proposalSent',
        },

        {
          label: 'Approved',
          value: 'approved',
        },

        {
          label: 'Closed',
          value: 'closed',
        },
      ],
    },

    {
      name: 'eventDate',
      type: 'date',
    },

    {
      name: 'guestCount',
      type: 'number',
    },

    {
      name: 'locationType',
      type: 'select',

      options: [
        {
          label: 'Private Home',
          value: 'privateHome',
        },

        {
          label: 'Estate',
          value: 'estate',
        },

        {
          label: 'Winery',
          value: 'winery',
        },

        {
          label: 'Venue',
          value: 'venue',
        },

        {
          label: 'Country Club',
          value: 'countryClub',
        },

        {
          label: 'Hotel',
          value: 'hotel',
        },

        {
          label: 'Club / Lounge',
          value: 'clubLounge',
        },

        {
          label: 'Undecided',
          value: 'undecided',
        },
      ],
    },

    {
      name: 'preferredRegion',
      type: 'text',

      defaultValue: 'Umpqua Valley',
    },

    {
      name: 'experienceVision',
      type: 'textarea',

      required: true,

      admin: {
        description:
          'Capture the dream version of the experience. Mood, setting, food, music, atmosphere, and emotional goal.',
      },
    },

    {
      name: 'occasion',
      type: 'select',

      options: [
        {
          label: 'Private Dinner',
          value: 'privateDinner',
        },

        {
          label: 'Birthday',
          value: 'birthday',
        },

        {
          label: 'Anniversary',
          value: 'anniversary',
        },

        {
          label: 'Proposal / Engagement',
          value: 'proposalEngagement',
        },

        {
          label: 'Wedding Weekend',
          value: 'weddingWeekend',
        },

        {
          label: 'Corporate / Executive',
          value: 'corporateExecutive',
        },

        {
          label: 'Realtor / Client Hospitality',
          value: 'realtorHospitality',
        },

        {
          label: 'Wine Country Experience',
          value: 'wineCountryExperience',
        },

        {
          label: 'Custom Celebration',
          value: 'customCelebration',
        },

        {
          label: 'White-Label Hospitality',
          value: 'whiteLabelHospitality',
        },
      ],
    },

    {
      name: 'budgetRange',
      type: 'select',

      options: [
        {
          label: '$1K–$3K',
          value: '1-3k',
        },

        {
          label: '$3K–$5K',
          value: '3-5k',
        },

        {
          label: '$5K–$10K',
          value: '5-10k',
        },

        {
          label: '$10K–$25K',
          value: '10-25k',
        },

        {
          label: '$25K+',
          value: '25kPlus',
        },
      ],
    },

    {
      name: 'desiredAddOns',
      type: 'select',

      hasMany: true,

      options: [
        {
          label: 'Venue Sourcing',
          value: 'venueSourcing',
        },

        {
          label: 'Winery Partnership',
          value: 'wineryPartnership',
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
          label: 'Ice Carving',
          value: 'iceCarving',
        },

        {
          label: 'Florals',
          value: 'florals',
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
          label: 'Luxury Transportation',
          value: 'luxuryTransportation',
        },

        {
          label: 'Bartending',
          value: 'bartending',
        },

        {
          label: 'Rentals / Tablescape',
          value: 'rentalsTablescape',
        },

        {
          label: 'Lighting Design',
          value: 'lightingDesign',
        },

        {
          label: 'Hotel / Lodging',
          value: 'hotelLodging',
        },
      ],
    },

    {
      name: 'dietaryNotes',
      type: 'textarea',
    },

    {
      name: 'priorityLevel',
      type: 'select',

      defaultValue: 'standard',

      options: [
        {
          label: 'Standard',
          value: 'standard',
        },

        {
          label: 'High Touch',
          value: 'highTouch',
        },

        {
          label: 'VIP Concierge',
          value: 'vip',
        },
      ],
    },

    {
      name: 'briefGenerated',
      type: 'checkbox',

      defaultValue: false,

      admin: {
        description:
          'Marks whether this inquiry has been turned into an Experience Brief.',
      },
    },

    {
      name: 'internalNotes',
      type: 'textarea',
    },
  ],
}
