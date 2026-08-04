import type { CollectionConfig } from 'payload'
import { isDirector } from '@/lib/access/roles'
import type { PlateUserLike } from '@/lib/access/roles'

/**
 * Processed Square webhook event log for deduplication.
 * Events are write-once; the eventId unique constraint prevents double-processing.
 */
export const SquareWebhookEvents: CollectionConfig = {
  slug: 'square-webhook-events',
  access: {
    read: ({ req }) => isDirector(req.user as PlateUserLike),
    create: () => true,
    update: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'eventId',
    group: 'Integrations',
    description: 'Processed Square webhook events. Append-only deduplication log.',
    defaultColumns: ['eventId', 'type', 'processedAt', 'invoiceId', 'summary'],
    hidden: ({ user }) => !isDirector(user as PlateUserLike),
  },
  fields: [
    {
      name: 'eventId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Square event_id — guaranteed unique per event.' },
    },
    {
      name: 'type',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'e.g. invoice.payment_made, payment.updated' },
    },
    {
      name: 'processedAt',
      type: 'date',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'invoiceId',
      type: 'text',
      index: true,
      admin: {
        description: 'Plate invoice ID if this event is invoice-related.',
      },
    },
    {
      name: 'summary',
      type: 'text',
      admin: { description: 'Brief human-readable outcome of processing.' },
    },
  ],
}
