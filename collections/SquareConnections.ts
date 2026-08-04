import type { CollectionConfig } from 'payload'
import { isDirector } from '@/lib/access/roles'
import type { PlateUserLike } from '@/lib/access/roles'

/**
 * Stores the live Square OAuth connection for Plate The Umpqua.
 * Access: directors only. Encrypted token ciphertext NEVER returned to client components.
 */
export const SquareConnections: CollectionConfig = {
  slug: 'square-connections',
  access: {
    read: ({ req }) => isDirector(req.user as PlateUserLike),
    create: ({ req }) => isDirector(req.user as PlateUserLike),
    update: ({ req }) => isDirector(req.user as PlateUserLike),
    delete: () => false,
  },
  admin: {
    useAsTitle: 'merchantName',
    group: 'Integrations',
    description:
      'Square OAuth connection records. Encrypted tokens — never expose via API or client components.',
    defaultColumns: ['environment', 'merchantName', 'status', 'connectedAt', 'accessTokenExpiresAt'],
    hidden: ({ user }) => !isDirector(user as PlateUserLike),
  },
  fields: [
    {
      name: 'environment',
      type: 'select',
      required: true,
      defaultValue: 'sandbox',
      options: [
        { label: 'Sandbox', value: 'sandbox' },
        { label: 'Production', value: 'production' },
      ],
      admin: { description: 'Never use production until explicitly authorized.' },
    },
    {
      name: 'merchantId',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'merchantName',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'locationId',
      type: 'text',
      admin: { description: 'Selected Square location ID.' },
    },
    {
      name: 'locationName',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'scopes',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Granted OAuth scopes.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'disconnected',
      options: [
        { label: 'Connected', value: 'connected' },
        { label: 'Disconnected', value: 'disconnected' },
        { label: 'Error', value: 'error' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'encryptedAccessToken',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'AES-256-GCM ciphertext. Never copy or share.',
      },
      access: {
        read: () => false,
      },
    },
    {
      name: 'encryptedRefreshToken',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'AES-256-GCM ciphertext. Never copy or share.',
      },
      access: {
        read: () => false,
      },
    },
    {
      name: 'accessTokenExpiresAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'refreshTokenExpiresAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'lastSyncedAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'lastError',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'connectedAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'disconnectedAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'connectedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
