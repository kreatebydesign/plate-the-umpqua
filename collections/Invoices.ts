import type { CollectionConfig } from 'payload'
import { invoicesCollectionAccess } from '@/lib/access'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  access: invoicesCollectionAccess,
  admin: {
    useAsTitle: 'invoiceNumber',
    group: 'Experience Engine',
    defaultColumns: [
      'invoiceNumber',
      'client',
      'status',
      'issueDate',
      'dueDate',
      'totalCents',
      'balanceDueCents',
    ],
    description:
      'Hospitality invoices. Prefer Plate OS (/os/invoices) for day-to-day billing. Void instead of deleting.',
  },
  fields: [
    {
      name: 'invoiceNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Assigned once as PTU-YYYY-NNN. Never recycled.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Viewed', value: 'viewed' },
        { label: 'Partially paid', value: 'partiallyPaid' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Voided', value: 'voided' },
      ],
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: true,
      index: true,
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      index: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'issueDate',
          type: 'date',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'dueDate',
          type: 'date',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'paymentTerms',
      type: 'select',
      defaultValue: 'net14',
      options: [
        { label: 'Due on receipt', value: 'dueOnReceipt' },
        { label: 'Net 7', value: 'net7' },
        { label: 'Net 14', value: 'net14' },
        { label: 'Net 30', value: 'net30' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'paymentTermsCustom',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.paymentTerms === 'custom',
        description: 'Shown on the client invoice when terms are Custom.',
      },
    },
    {
      type: 'group',
      name: 'billing',
      label: 'Billing snapshot',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
        { name: 'company', type: 'text' },
      ],
    },
    {
      name: 'lineItems',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Line item', plural: 'Line items' },
      fields: [
        {
          name: 'itemKey',
          type: 'text',
          required: true,
          admin: {
            description: 'Stable client-side key for reorder.',
          },
        },
        {
          name: 'sortOrder',
          type: 'number',
          required: true,
          defaultValue: 0,
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        {
          name: 'detail',
          type: 'textarea',
        },
        {
          name: 'billingType',
          type: 'select',
          required: true,
          defaultValue: 'flat',
          options: [
            { label: 'Flat / custom', value: 'flat' },
            { label: 'Per event', value: 'perEvent' },
            { label: 'Per person / guest', value: 'perPerson' },
            { label: 'Per hour', value: 'perHour' },
            { label: 'Quantity / item', value: 'quantity' },
          ],
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 0,
          defaultValue: 1,
        },
        {
          name: 'unitPriceCents',
          type: 'number',
          required: true,
          defaultValue: 0,
          admin: {
            description: 'Unit price in integer cents (always non-negative).',
          },
        },
        {
          name: 'isCredit',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'When checked, this line reduces the invoice (client-supplied items, credits).',
          },
        },
        {
          name: 'lineTotalCents',
          type: 'number',
          required: true,
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Server-authored line total in cents (negative for credits).',
          },
        },
      ],
    },
    {
      name: 'discountType',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Fixed dollar', value: 'fixed' },
        { label: 'Percentage', value: 'percent' },
      ],
    },
    {
      name: 'discountValue',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description:
          'Fixed: cents. Percent: basis points of a percent×100 (e.g. 1000 = 10.00%).',
      },
    },
    {
      name: 'taxRateBps',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 10000,
      admin: {
        description: 'Tax rate in basis points (875 = 8.75%).',
      },
    },
    {
      name: 'depositRequiredCents',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'subtotalCents',
          type: 'number',
          defaultValue: 0,
          admin: { readOnly: true, width: '33%' },
        },
        {
          name: 'creditCents',
          type: 'number',
          defaultValue: 0,
          admin: { readOnly: true, width: '33%' },
        },
        {
          name: 'discountCents',
          type: 'number',
          defaultValue: 0,
          admin: { readOnly: true, width: '33%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'taxCents',
          type: 'number',
          defaultValue: 0,
          admin: { readOnly: true, width: '33%' },
        },
        {
          name: 'totalCents',
          type: 'number',
          defaultValue: 0,
          admin: { readOnly: true, width: '33%' },
        },
        {
          name: 'amountPaidCents',
          type: 'number',
          defaultValue: 0,
          admin: { readOnly: true, width: '33%' },
        },
      ],
    },
    {
      name: 'balanceDueCents',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'clientMemo',
      type: 'textarea',
      admin: {
        description: 'Shown on the client-facing invoice.',
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Staff only. Never exposed on public invoice, email, or print.',
      },
    },
    {
      name: 'publicTokenHash',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'publicTokenCreatedAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'publicTokenRevokedAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'publicTokenPlaintextOnce',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description:
          'Transient helper for operators after link generation. Cleared after use where possible.',
      },
    },
    {
      name: 'firstViewedAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'lastViewedAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'lastSentTo',
      type: 'email',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'lastSendAttemptAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'lastSendError',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'voidedAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'voidedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'voidReason',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      type: 'group',
      name: 'square',
      label: 'Square Payment',
      admin: {
        description: 'Square invoice and payment link. Never store access tokens here.',
      },
      fields: [
        {
          name: 'customerId',
          type: 'text',
          admin: { readOnly: true, description: 'Square customer ID (upserted from billing email).' },
        },
        {
          name: 'invoiceId',
          type: 'text',
          admin: { readOnly: true, description: 'Square invoice ID.' },
        },
        {
          name: 'orderId',
          type: 'text',
          admin: { readOnly: true, description: 'Square order ID backing the invoice.' },
        },
        {
          name: 'paymentLinkId',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'paymentLinkUrl',
          type: 'text',
          admin: { readOnly: true, description: 'Square-hosted payment URL (SHARE_MANUALLY).' },
        },
        {
          name: 'publicUrl',
          type: 'text',
          admin: { readOnly: true, description: 'Public Square invoice URL for client.' },
        },
        {
          name: 'paymentId',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'status',
          type: 'text',
          admin: { readOnly: true, description: 'Square invoice status (DRAFT, UNPAID, PAID, etc.).' },
        },
        {
          name: 'version',
          type: 'number',
          admin: { readOnly: true, description: 'Square invoice version for optimistic concurrency.' },
        },
        {
          name: 'deliveryMethod',
          type: 'text',
          defaultValue: 'SHARE_MANUALLY',
          admin: { readOnly: true, description: 'Always SHARE_MANUALLY — no Square emails sent.' },
        },
        {
          name: 'lastSyncedAt',
          type: 'date',
          admin: { readOnly: true },
        },
        {
          name: 'lastError',
          type: 'text',
          admin: { readOnly: true, description: 'Last Square sync error, if any.' },
        },
        {
          name: 'idempotencyKey',
          type: 'text',
          admin: { readOnly: true },
        },
      ],
    },
  ],
}
