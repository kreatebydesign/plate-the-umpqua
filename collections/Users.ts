import type { CollectionConfig } from 'payload'
import {
  roleFieldAccess,
  userInternalNotesFieldAccess,
  usersCollectionAccess,
} from '@/lib/access'
import { isAdmin, type PlateRole } from '@/lib/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',

  admin: {
    useAsTitle: 'email',
    group: 'System',
  },

  auth: true,

  access: usersCollectionAccess,

  hooks: {
    beforeChange: [
      ({ req, data, originalDoc, operation }) => {
        if (!data) return data

        // Non-admins cannot assign or change roles (defense in depth beyond field access).
        if (!isAdmin(req.user)) {
          if (operation === 'create') {
            data.role = 'team'
          } else if (originalDoc?.role) {
            data.role = originalDoc.role as PlateRole
          } else {
            delete data.role
          }
        }

        return data
      },
    ],
  },

  fields: [
    {
      name: 'fullName',
      type: 'text',
    },

    {
      name: 'role',
      type: 'select',
      defaultValue: 'team',
      access: {
        create: roleFieldAccess,
        update: roleFieldAccess,
      },
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
      access: {
        read: userInternalNotesFieldAccess,
        update: userInternalNotesFieldAccess,
      },
    },
  ],
}
