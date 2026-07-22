import type { CollectionConfig } from 'payload'
import { operationalCollectionAccess } from '@/lib/access'

export const Experiences: CollectionConfig = {

  access: operationalCollectionAccess,

  slug: 'experiences',

  admin: {
    useAsTitle: 'title',
    group: 'Experiences',
    defaultColumns: [
      'title',
      'brand',
      'experienceType',
      'status',
      'client',
      'eventDate',
    ],
  },

  fields: [
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      required: true,
      admin: {
        description:
          'The hospitality brand or white-label instance this experience belongs to.',
      },
    },

    {
      name: 'title',
      type: 'text',
      required: true,
    },

    {
      name: 'status',
      type: 'select',
      defaultValue: 'lead',
      options: [
        { label: 'Lead', value: 'lead' },
        { label: 'Discovery', value: 'discovery' },
        { label: 'Experience Design', value: 'experienceDesign' },
        { label: 'Package Building', value: 'packageBuilding' },
        { label: 'Proposal Sent', value: 'proposalSent' },
        { label: 'Booked', value: 'booked' },
        { label: 'In Production', value: 'inProduction' },
        { label: 'Completed', value: 'completed' },
        { label: 'Archived', value: 'archived' },
      ],
    },

    {
      name: 'experienceType',
      type: 'select',
      required: true,
      options: [
        { label: 'Private Dinner', value: 'privateDinner' },
        { label: 'Estate Experience', value: 'estateExperience' },
        { label: 'Winery Event', value: 'wineryEvent' },
        { label: 'Luxury Picnic', value: 'luxuryPicnic' },
        { label: 'Hotel / Resort Experience', value: 'hotelResortExperience' },
        { label: 'Country Club Experience', value: 'countryClubExperience' },
        { label: 'Club / Lounge Experience', value: 'clubLoungeExperience' },
        { label: 'Corporate Hospitality', value: 'corporateHospitality' },
        { label: 'Retreat', value: 'retreat' },
        { label: 'Custom', value: 'custom' },
      ],
    },

    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: true,
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
      name: 'budgetRange',
      type: 'select',
      options: [
        { label: '$1K - $5K', value: '1kTo5k' },
        { label: '$5K - $10K', value: '5kTo10k' },
        { label: '$10K - $25K', value: '10kTo25k' },
        { label: '$25K - $50K', value: '25kTo50k' },
        { label: '$50K+', value: '50kPlus' },
      ],
    },

    {
      name: 'clientDream',
      type: 'textarea',
      admin: {
        description:
          'The memorable experience the client is imagining in their own words.',
      },
    },

    {
      name: 'emotionalOutcome',
      type: 'textarea',
      admin: {
        description:
          'How the client wants guests to feel during and after the experience.',
      },
    },

    {
      name: 'styleDirection',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Cinematic', value: 'cinematic' },
        { label: 'Warm & Intimate', value: 'warmIntimate' },
        { label: 'Modern Luxury', value: 'modernLuxury' },
        { label: 'Wine Country', value: 'wineCountry' },
        { label: 'Dark & Moody', value: 'darkMoody' },
        { label: 'High-Energy', value: 'highEnergy' },
        { label: 'Romantic', value: 'romantic' },
        { label: 'Executive', value: 'executive' },
        { label: 'Family-Centered', value: 'familyCentered' },
      ],
    },

    {
      name: 'locationPreferences',
      type: 'group',
      fields: [
        {
          name: 'preferredCity',
          type: 'text',
        },
        {
          name: 'preferredRegion',
          type: 'text',
          defaultValue: 'Umpqua Valley',
        },
        {
          name: 'radiusMiles',
          type: 'number',
          defaultValue: 30,
        },
        {
          name: 'locationNotes',
          type: 'textarea',
        },
      ],
    },

    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'venues',
    },

    {
      name: 'vendors',
      type: 'relationship',
      relationTo: 'vendor-partners',
      hasMany: true,
    },

    {
      name: 'menuConcept',
      type: 'relationship',
      relationTo: 'menu-concepts',
    },

    {
      name: 'packageOptions',
      type: 'relationship',
      relationTo: 'package-options',
      hasMany: true,
    },

    {
      name: 'proposal',
      type: 'relationship',
      relationTo: 'proposals',
    },

    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
    },

    {
      name: 'profitGuardrails',
      type: 'group',
      fields: [
        {
          name: 'targetMargin',
          type: 'number',
          defaultValue: 35,
        },
        {
          name: 'minimumMargin',
          type: 'number',
          defaultValue: 25,
        },
        {
          name: 'estimatedBudget',
          type: 'number',
        },
        {
          name: 'internalCostCap',
          type: 'number',
        },
      ],
    },

    {
      name: 'systemNotes',
      type: 'textarea',
      admin: {
        description:
          'Internal notes for automation logic, package generation, and future AI matching.',
      },
    },

    {
      name: 'vision',
      type: 'richText',
    },
  ],
}