import type { CollectionConfig } from 'payload'
import { dietaryNotesAccess } from '@/lib/access'

export const DietaryNotes: CollectionConfig = {

  access: dietaryNotesAccess,

  slug: 'dietary-notes',

  admin: {
    useAsTitle: 'guestName',

    group: 'Culinary',

    defaultColumns: [
      'guestName',
      'severity',
    ],
  },

  fields: [
    {
      name: 'guestName',
      type: 'text',
      required: true,
    },

    {
      name: 'client',
      type: 'relationship',

      relationTo: 'clients' as any,
    },

    {
      name: 'restrictionType',
      type: 'select',

      hasMany: true,

      options: [
        {
          label: 'Gluten Free',
          value: 'glutenFree',
        },

        {
          label: 'Dairy Free',
          value: 'dairyFree',
        },

        {
          label: 'Nut Allergy',
          value: 'nutAllergy',
        },

        {
          label: 'Shellfish Allergy',
          value: 'shellfishAllergy',
        },

        {
          label: 'Vegetarian',
          value: 'vegetarian',
        },

        {
          label: 'Vegan',
          value: 'vegan',
        },

        {
          label: 'Pescatarian',
          value: 'pescatarian',
        },

        {
          label: 'Kosher',
          value: 'kosher',
        },

        {
          label: 'Halal',
          value: 'halal',
        },

        {
          label: 'No Pork',
          value: 'noPork',
        },

        {
          label: 'No Alcohol',
          value: 'noAlcohol',
        },
      ],
    },

    {
      name: 'severity',
      type: 'select',

      options: [
        {
          label: 'Preference',
          value: 'preference',
        },

        {
          label: 'Sensitivity',
          value: 'sensitivity',
        },

        {
          label: 'Severe Allergy',
          value: 'severeAllergy',
        },
      ],
    },

    {
      name: 'favoriteIngredients',
      type: 'textarea',
    },

    {
      name: 'ingredientsToAvoid',
      type: 'textarea',
    },

    {
      name: 'luxuryPreferenceNotes',
      type: 'textarea',

      admin: {
        description:
          'Capture refined tastes, favorite wines, premium ingredients, dislikes, and guest expectations.',
      },
    },

    {
      name: 'specialNotes',
      type: 'textarea',
    },
  ],
}