import type { CollectionConfig } from 'payload'
import { culinaryCollectionAccess } from '@/lib/access'
import { isDirector } from '@/lib/access/roles'

/**
 * Private recipe library for Plate culinary operations.
 * Default visibility is private — never public by default.
 */
export const Recipes: CollectionConfig = {
  access: culinaryCollectionAccess,

  slug: 'recipes',

  admin: {
    useAsTitle: 'name',
    group: 'Culinary',
    defaultColumns: ['name', 'category', 'status', 'visibility', 'updatedAt'],
    description:
      'Private recipe library. Use visibility to mark menu-ready or publishing-candidate recipes.',
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Appetizer', value: 'appetizer' },
        { label: 'Soup', value: 'soup' },
        { label: 'Salad', value: 'salad' },
        { label: 'First Course', value: 'firstCourse' },
        { label: 'Main', value: 'main' },
        { label: 'Side', value: 'side' },
        { label: 'Dessert', value: 'dessert' },
        { label: 'Beverage', value: 'beverage' },
        { label: 'Amuse', value: 'amuse' },
        { label: 'Bread', value: 'bread' },
        { label: 'Sauce', value: 'sauce' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'cuisine',
      type: 'select',
      options: [
        { label: 'Modern American', value: 'modernAmerican' },
        { label: 'Italian', value: 'italian' },
        { label: 'French', value: 'french' },
        { label: 'Japanese', value: 'japanese' },
        { label: 'Mediterranean', value: 'mediterranean' },
        { label: 'Wine Country Seasonal', value: 'wineCountrySeasonal' },
        { label: 'Pacific Northwest', value: 'pacificNorthwest' },
        { label: 'Farm-to-Table', value: 'farmToTable' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'course',
      type: 'select',
      options: [
        { label: 'Welcome', value: 'welcome' },
        { label: 'Appetizer', value: 'appetizer' },
        { label: 'First Course', value: 'first' },
        { label: 'Main Course', value: 'main' },
        { label: 'Side', value: 'side' },
        { label: 'Dessert', value: 'dessert' },
        { label: 'Beverage', value: 'beverage' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'dietaryTags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Vegetarian', value: 'vegetarian' },
        { label: 'Vegan', value: 'vegan' },
        { label: 'Pescatarian', value: 'pescatarian' },
        { label: 'Gluten Free', value: 'glutenFree' },
        { label: 'Dairy Free', value: 'dairyFree' },
        { label: 'Nut Free', value: 'nutFree' },
        { label: 'Halal', value: 'halal' },
        { label: 'Kosher', value: 'kosher' },
      ],
    },
    {
      name: 'allergenTags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Gluten', value: 'gluten' },
        { label: 'Dairy', value: 'dairy' },
        { label: 'Eggs', value: 'eggs' },
        { label: 'Tree Nuts', value: 'treeNuts' },
        { label: 'Peanuts', value: 'peanuts' },
        { label: 'Shellfish', value: 'shellfish' },
        { label: 'Fish', value: 'fish' },
        { label: 'Soy', value: 'soy' },
        { label: 'Sesame', value: 'sesame' },
        { label: 'Pork', value: 'pork' },
        { label: 'Alcohol', value: 'alcohol' },
      ],
    },
    {
      name: 'yieldQuantity',
      type: 'number',
      min: 0,
    },
    {
      name: 'yieldUnit',
      type: 'select',
      options: [
        { label: 'Servings', value: 'servings' },
        { label: 'Portions', value: 'portions' },
        { label: 'Pieces', value: 'pieces' },
        { label: 'Batch', value: 'batch' },
      ],
    },
    {
      name: 'prepTimeMinutes',
      type: 'number',
      min: 0,
    },
    {
      name: 'cookTimeMinutes',
      type: 'number',
      min: 0,
    },
    {
      name: 'ingredients',
      type: 'array',
      labels: { singular: 'Ingredient', plural: 'Ingredients' },
      fields: [
        { name: 'quantity', type: 'text' },
        { name: 'unit', type: 'text' },
        { name: 'ingredient', type: 'text', required: true },
        { name: 'preparationNote', type: 'text' },
      ],
    },
    {
      name: 'steps',
      type: 'array',
      labels: { singular: 'Step', plural: 'Steps' },
      fields: [
        {
          name: 'instruction',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'chefNotes',
      type: 'textarea',
      admin: {
        description: 'Internal culinary notes — never shown on client menus.',
      },
    },
    {
      name: 'platingNotes',
      type: 'textarea',
    },
    {
      name: 'storageNotes',
      type: 'textarea',
      admin: {
        description: 'Storage or make-ahead guidance.',
      },
    },
    {
      name: 'internalCostNotes',
      type: 'textarea',
      access: {
        read: ({ req }) => isDirector(req.user),
        update: ({ req }) => isDirector(req.user),
      },
      admin: {
        description: 'Director-only cost notes. Hidden from non-directors.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Tested', value: 'tested' },
        { label: 'Approved', value: 'approved' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'visibility',
      type: 'select',
      required: true,
      defaultValue: 'private',
      options: [
        { label: 'Private', value: 'private' },
        { label: 'Menu-ready', value: 'menuReady' },
        { label: 'Publishing candidate', value: 'publishingCandidate' },
      ],
      admin: {
        description:
          'Private by default. Menu-ready recipes appear in the menu builder picker. Publishing candidates are reserved for a future cookbook/subscription.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Optional slug for a future public cookbook entry.',
      },
    },
    {
      type: 'collapsible',
      label: 'Publishing foundation (future cookbook)',
      admin: {
        initCollapsed: true,
        description:
          'Optional public-facing fields for a future cookbook or subscription product. Not exposed publicly in this phase.',
      },
      fields: [
        {
          name: 'publicTitle',
          type: 'text',
        },
        {
          name: 'publicSummary',
          type: 'textarea',
        },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'chefIntroduction',
          type: 'textarea',
          admin: {
            description: 'Optional story or chef introduction for publishing.',
          },
        },
      ],
    },
  ],
}
