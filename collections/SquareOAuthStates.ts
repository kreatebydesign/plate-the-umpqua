import type { CollectionConfig } from 'payload'
import { isDirector } from '@/lib/access/roles'
import type { PlateUserLike } from '@/lib/access/roles'

/**
 * Short-lived OAuth state tokens for CSRF protection during Square OAuth flow.
 * States expire after 10 minutes. Automatically cleaned up on use.
 */
export const SquareOAuthStates: CollectionConfig = {
  slug: 'square-oauth-states',
  access: {
    read: ({ req }) => isDirector(req.user as PlateUserLike),
    create: ({ req }) => isDirector(req.user as PlateUserLike),
    update: ({ req }) => isDirector(req.user as PlateUserLike),
    delete: ({ req }) => isDirector(req.user as PlateUserLike),
  },
  admin: {
    group: 'Integrations',
    description: 'Short-lived CSRF state tokens for Square OAuth. Auto-purged after use.',
    hidden: ({ user }) => !isDirector(user as PlateUserLike),
  },
  fields: [
    {
      name: 'state',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: { description: '10-minute TTL from creation.' },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    {
      name: 'usedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Set when the state is consumed. Prevents replay.',
      },
    },
  ],
}
