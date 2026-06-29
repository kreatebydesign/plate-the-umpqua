import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',

  admin: {
    useAsTitle: 'alt',

    group: 'Brand & Trust',
  },

  access: {
    read: () => true,
  },

  upload: {
    staticDir: 'media',

    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
        fit: 'cover',
      },

      {
        name: 'card',
        width: 1200,
        height: 800,
        fit: 'cover',
      },

      {
        name: 'hero',
        width: 2000,
        height: 1200,
        fit: 'cover',
      },
    ],

    adminThumbnail: 'thumbnail',

    mimeTypes: [
      'image/*',
      'video/*',
    ],
  },

  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },

    {
      name: 'mediaType',
      type: 'select',

      options: [
        {
          label: 'Food',
          value: 'food',
        },

        {
          label: 'Venue',
          value: 'venue',
        },

        {
          label: 'Experience',
          value: 'experience',
        },

        {
          label: 'Tablescape',
          value: 'tablescape',
        },

        {
          label: 'Wine',
          value: 'wine',
        },

        {
          label: 'Luxury Lifestyle',
          value: 'luxuryLifestyle',
        },

        {
          label: 'Brand',
          value: 'brand',
        },

        {
          label: 'Video',
          value: 'video',
        },
      ],
    },

    {
      name: 'photographerCredit',
      type: 'text',
    },

    {
      name: 'featured',
      type: 'checkbox',

      defaultValue: false,
    },

    {
      name: 'internalNotes',
      type: 'textarea',
    },
  ],
}