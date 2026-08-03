import type { CollectionConfig } from 'payload'
import { invoicePaymentsCollectionAccess } from '@/lib/access'

/** Immutable manual payment ledger for invoices. */
export const InvoicePayments: CollectionConfig = {
  slug: 'invoice-payments',
  access: invoicePaymentsCollectionAccess,
  admin: {
    useAsTitle: 'reference',
    group: 'Experience Engine',
    defaultColumns: ['invoice', 'amountCents', 'paidAt', 'method', 'createdAt'],
    description: 'Append-only payment records. Do not edit or delete payments.',
  },
  fields: [
    {
      name: 'invoice',
      type: 'relationship',
      relationTo: 'invoices',
      required: true,
      index: true,
    },
    {
      name: 'amountCents',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: 'Payment amount in integer cents.',
      },
    },
    {
      name: 'paidAt',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'method',
      type: 'select',
      required: true,
      defaultValue: 'other',
      options: [
        { label: 'Cash', value: 'cash' },
        { label: 'Check', value: 'check' },
        { label: 'Card', value: 'card' },
        { label: 'Bank transfer', value: 'bankTransfer' },
        { label: 'Square', value: 'square' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'reference',
      type: 'text',
      admin: {
        description: 'Optional check number, Square receipt, or transaction ID.',
      },
    },
    {
      name: 'internalNote',
      type: 'textarea',
      admin: {
        description: 'Staff-only note. Never shown on the client invoice.',
      },
    },
    {
      name: 'recordedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'squarePaymentId',
      type: 'text',
      admin: {
        description: 'Future Square payment ID (unused until Square is connected).',
        position: 'sidebar',
      },
    },
    {
      name: 'squareWebhookEventId',
      type: 'text',
      unique: true,
      admin: {
        description: 'Webhook event ID for deduplication (future).',
        position: 'sidebar',
      },
    },
  ],
}
