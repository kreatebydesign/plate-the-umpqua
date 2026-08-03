import { getPayload } from 'payload'
import config from '../../../payload.config'
import type { User } from '@/payload-types'
import { formatShortDate } from '../formatDate'
import type { EditorClientOption, EditorEventOption } from './editorTypes'

export async function loadInvoiceEditorOptions(user: User): Promise<{
  clients: EditorClientOption[]
  events: EditorEventOption[]
}> {
  const payload = await getPayload({ config })
  const shared = { user, overrideAccess: false as const }

  const [clientsResult, eventsResult] = await Promise.all([
    payload.find({
      collection: 'clients',
      ...shared,
      depth: 0,
      limit: 200,
      sort: 'fullName',
      select: { fullName: true, email: true, phone: true },
    }),
    payload.find({
      collection: 'events',
      ...shared,
      depth: 0,
      limit: 200,
      sort: '-eventDate',
      select: {
        eventName: true,
        eventDate: true,
        guestCount: true,
        client: true,
      },
    }),
  ])

  return {
    clients: clientsResult.docs.map((doc) => ({
      id: String(doc.id),
      name: doc.fullName || 'Client',
      email: doc.email || '',
      phone: doc.phone || null,
    })),
    events: eventsResult.docs.map((doc) => ({
      id: String(doc.id),
      name: doc.eventName || 'Event',
      clientId:
        typeof doc.client === 'string' || typeof doc.client === 'number'
          ? String(doc.client)
          : doc.client && typeof doc.client === 'object' && 'id' in doc.client
            ? String((doc.client as { id: string | number }).id)
            : null,
      dateLabel: formatShortDate(doc.eventDate),
      guestCount: typeof doc.guestCount === 'number' ? doc.guestCount : null,
    })),
  }
}
