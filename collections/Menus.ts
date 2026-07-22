import type { CollectionConfig } from 'payload'
import { culinaryCollectionAccess } from '@/lib/access'

/**
 * Client-facing menu compositions for private dining.
 * Distinct from `menu-concepts` (culinary inspiration library).
 */
export const Menus: CollectionConfig = {
  access: culinaryCollectionAccess,

  slug: 'menus',

  admin: {
    useAsTitle: 'internalName',
    group: 'Culinary',
    defaultColumns: [
      'internalName',
      'client',
      'serviceDate',
      'status',
      'version',
      'updatedAt',
    ],
    description:
      'Client menu builder. Internal notes and review tokens never appear on the client review page.',
  },

  fields: [
    {
      name: 'internalName',
      type: 'text',
      required: true,
      admin: {
        description: 'Operator-facing name — not shown to clients.',
      },
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: true,
    },
    {
      name: 'inquiry',
      type: 'relationship',
      relationTo: 'inquiries',
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
    },
    {
      name: 'occasionTitle',
      type: 'text',
      required: true,
      admin: {
        description: 'Client-facing occasion or event title.',
      },
    },
    {
      name: 'serviceDate',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'guestCount',
      type: 'number',
      min: 0,
    },
    {
      name: 'introductoryMessage',
      type: 'textarea',
      admin: {
        description: 'Client-visible opening note on the menu presentation.',
      },
    },
    {
      name: 'sections',
      type: 'array',
      labels: { singular: 'Section', plural: 'Sections' },
      fields: [
        {
          name: 'sectionName',
          type: 'text',
          required: true,
        },
        {
          name: 'items',
          type: 'array',
          labels: { singular: 'Item', plural: 'Items' },
          fields: [
            {
              name: 'recipe',
              type: 'relationship',
              relationTo: 'recipes',
              admin: {
                description:
                  'Optional link to a saved recipe. Client wording below is independent.',
              },
            },
            {
              name: 'clientTitle',
              type: 'text',
              required: true,
            },
            {
              name: 'clientDescription',
              type: 'textarea',
            },
            {
              name: 'showDietary',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Show dietary / allergen labels on the client menu.',
              },
            },
            {
              name: 'dietaryDisplay',
              type: 'text',
              admin: {
                description: 'Client-facing dietary labels (comma-separated).',
              },
            },
            {
              name: 'allergenDisplay',
              type: 'text',
              admin: {
                description: 'Client-facing allergen labels (comma-separated).',
              },
            },
            {
              name: 'internalItemNotes',
              type: 'textarea',
              admin: {
                description: 'Never shown on client review.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'pricingPresentation',
      type: 'textarea',
      admin: {
        description:
          'Optional client-facing pricing language (e.g. investment note). Do not include cost or margin data.',
      },
    },
    {
      name: 'displayInvestment',
      type: 'number',
      min: 0,
      admin: {
        description:
          'Optional client-visible investment figure. Follows established proposal-style presentation only — never show food cost or margin.',
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Operator notes — never appear on client review.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Ready for Review', value: 'readyForReview' },
        { label: 'Sent', value: 'sent' },
        { label: 'Revision Requested', value: 'revisionRequested' },
        { label: 'Approved', value: 'approved' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'version',
      type: 'number',
      defaultValue: 1,
      min: 1,
      admin: {
        readOnly: true,
        description: 'Incremented when a revision snapshot is recorded.',
      },
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'revisionHistory',
      type: 'array',
      admin: {
        readOnly: true,
        description: 'Bounded snapshots of client-facing menu content.',
      },
      fields: [
        { name: 'version', type: 'number', required: true },
        { name: 'snapshotAt', type: 'date', required: true },
        { name: 'reason', type: 'text' },
        {
          name: 'snapshotJson',
          type: 'textarea',
          required: true,
          admin: {
            description: 'JSON snapshot of client-visible menu fields.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Secure client review link',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'reviewTokenHash',
          type: 'text',
          index: true,
          admin: {
            readOnly: true,
            description: 'SHA-256 hash of the opaque review token. Plaintext is never stored.',
          },
        },
        {
          name: 'reviewTokenExpiresAt',
          type: 'date',
          admin: {
            readOnly: true,
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'reviewTokenRevokedAt',
          type: 'date',
          admin: {
            readOnly: true,
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'reviewTokenCreatedAt',
          type: 'date',
          admin: {
            readOnly: true,
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
      ],
    },
    {
      name: 'reviews',
      type: 'array',
      admin: {
        readOnly: true,
        description: 'Bounded structured client review history.',
      },
      fields: [
        {
          name: 'action',
          type: 'select',
          required: true,
          options: [
            { label: 'Approve', value: 'approve' },
            { label: 'Request revision', value: 'requestRevision' },
          ],
        },
        { name: 'comment', type: 'textarea' },
        { name: 'submittedAt', type: 'date', required: true },
        { name: 'menuVersion', type: 'number' },
        {
          name: 'clientKeyHint',
          type: 'text',
          admin: {
            description: 'Truncated client key for abuse diagnostics — not PII.',
          },
        },
      ],
    },
  ],
}
