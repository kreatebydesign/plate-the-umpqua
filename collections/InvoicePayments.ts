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
      unique: true,
      index: true,
      admin: {
        description:
          'Square payment-request UID used for ledger idempotency. Unique when set.',
        position: 'sidebar',
      },
    },
    {
      name: 'squareWebhookEventId',
      type: 'text',
      index: true,
      admin: {
        description:
          'Optional Square webhook event_id for audit. Not unique — webhook events are deduped in square-webhook-events.',
        position: 'sidebar',
      },
    },
  ],
}
