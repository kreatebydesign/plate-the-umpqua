import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',

  admin: {
    useAsTitle: 'email',

    group: 'System',
  },

  auth: true,

  fields: [
    {
      name: 'fullName',
      type: 'text',
    },

    {
      name: 'role',
      type: 'select',

      defaultValue: 'team',

      options: [
        {
          label: 'Admin',
          value: 'admin',
        },

        {
          label: 'Hospitality Director',
          value: 'hospitalityDirector',
        },

        {
          label: 'Experience Curator',
          value: 'experienceCurator',
        },

        {
          label: 'Culinary Team',
          value: 'culinaryTeam',
        },

        {
          label: 'Vendor Partner',
          value: 'vendorPartner',
        },

        {
          label: 'Client',
          value: 'client',
        },

        {
          label: 'Team',
          value: 'team',
        },
      ],
    },

    {
      name: 'profilePhoto',
      type: 'upload',

      relationTo: 'media',
    },

    {
      name: 'internalNotes',
      type: 'textarea',
    },
  ],
}