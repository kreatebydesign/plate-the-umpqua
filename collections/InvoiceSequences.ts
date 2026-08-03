import type { CollectionConfig } from 'payload'
import { invoiceSequencesCollectionAccess } from '@/lib/access'

/**
 * Concurrency-safe yearly counters for PTU-YYYY-NNN invoice numbers.
 * Allocated via atomic $inc — never use count+1.
 */
export const InvoiceSequences: CollectionConfig = {
  slug: 'invoice-sequences',
  access: invoiceSequencesCollectionAccess,
  admin: {
    group: 'Experience Engine',
    hidden: true,
    useAsTitle: 'year',
  },
  fields: [
    {
      name: 'year',
      type: 'number',
      required: true,
      unique: true,
      admin: {
        description: 'Calendar year for the invoice number series (America/Los_Angeles).',
      },
    },
    {
      name: 'lastSequence',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
    },
  ],
}
