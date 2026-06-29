import type { CollectionConfig } from 'payload'

export const MenuConcepts: CollectionConfig = {
  slug: 'menu-concepts',

  admin: {
    useAsTitle: 'menuTitle',
    group: 'Culinary',
    defaultColumns: [
      'menuTitle',
      'cuisineStyle',
      'serviceStyle',
      'luxuryTier',
    ],
  },

  fields: [
    {
      name: 'menuTitle',
      type: 'text',
      required: true,
    },

    {
      name: 'cuisineStyle',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Modern American', value: 'modernAmerican' },
        { label: 'Italian', value: 'italian' },
        { label: 'French', value: 'french' },
        { label: 'Japanese', value: 'japanese' },
        { label: 'Mediterranean', value: 'mediterranean' },
        { label: 'Wine Country Seasonal', value: 'wineCountrySeasonal' },
        { label: 'Pacific Northwest', value: 'pacificNorthwest' },
        { label: 'Farm-to-Table', value: 'farmToTable' },
        { label: 'Custom Client Direction', value: 'customClientDirection' },
      ],
    },

    {
      name: 'serviceStyle',
      type: 'select',
      options: [
        { label: 'Coursed Dinner', value: 'coursedDinner' },
        { label: 'Family Style', value: 'familyStyle' },
        { label: 'Tasting Menu', value: 'tastingMenu' },
        { label: 'Cocktail Reception', value: 'cocktailReception' },
        { label: 'Interactive Stations', value: 'interactiveStations' },
        { label: 'Full Hospitality Experience', value: 'fullHospitalityExperience' },
      ],
    },

    {
      name: 'sampleCourses',
      type: 'array',
      fields: [
        {
          name: 'courseName',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },

    {
      name: 'signatureMoments',
      type: 'array',
      admin: {
        description:
          'Memorable culinary moments, chef interactions, tableside elements, or surprise details.',
      },
      fields: [
        {
          name: 'momentTitle',
          type: 'text',
        },
        {
          name: 'momentDescription',
          type: 'textarea',
        },
      ],
    },

    {
      name: 'winePairingNotes',
      type: 'textarea',
    },

    {
      name: 'seasonality',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Spring', value: 'spring' },
        { label: 'Summer', value: 'summer' },
        { label: 'Fall', value: 'fall' },
        { label: 'Winter', value: 'winter' },
        { label: 'Year-Round', value: 'yearRound' },
      ],
    },

    {
      name: 'estimatedFoodCost',
      type: 'number',
    },

    {
      name: 'suggestedClientPrice',
      type: 'number',
    },

    {
      name: 'luxuryTier',
      type: 'select',
      options: [
        { label: 'Premium', value: 'premium' },
        { label: 'Luxury', value: 'luxury' },
        { label: 'Ultra Luxury', value: 'ultraLuxury' },
      ],
    },

    {
      name: 'chefNotes',
      type: 'textarea',
    },

    {
      name: 'internalMarginNotes',
      type: 'textarea',
    },

    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
  ],
}