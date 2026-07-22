import { getPayload } from 'payload'
import type { Where } from 'payload'
import config from '../../../payload.config'
import type { User } from '@/payload-types'
import { canWriteOperational, asPlateUser } from '@/lib/access/roles'
import {
  addDays,
  formatShortDate,
  startOfTodayInTimezone,
} from '../formatDate'
import {
  ACTIVE_EVENT_STATUSES,
  EVENT_PAGE_SIZE_DEFAULT,
  EVENT_PAGE_SIZE_MAX,
  EVENT_SEARCH_MAX,
  type EventPipelineFilter,
  type EventSortValue,
  type EventStatusValue,
  eventAttentionReason,
  isEventPipeline,
  isEventSort,
  isEventStatus,
  statusLabel,
} from './eventConstants'

export type EventListParams = {
  pipeline?: string | null
  status?: string | null
  q?: string | null
  sort?: string | null
  page?: string | null
  limit?: string | null
}

export type EventListRow = {
  id: string
  name: string
  status: string
  statusLabel: string
  dateLabel: string
  guestCount: number | null
  clientName: string | null
  venueName: string | null
  packageName: string | null
  needsAttention: boolean
  attentionReason: string | null
  href: string
}

export type EventListResult = {
  rows: EventListRow[]
  page: number
  totalPages: number
  totalDocs: number
  limit: number
  filters: {
    pipeline: EventPipelineFilter
    status: EventStatusValue | null
    q: string
    sort: EventSortValue
  }
  counts: {
    today: number | null
    upcoming: number | null
    attention: number | null
    completed: number | null
    all: number | null
  }
  errors: string[]
  canManageInAdmin: boolean
}

export type EventDetail = {
  id: string
  name: string
  status: EventStatusValue | string
  statusLabel: string
  dateLabel: string
  guestCount: number | null
  client: {
    id: string | null
    name: string | null
    email: string | null
    phone: string | null
  }
  venue: {
    id: string | null
    name: string | null
    region: string | null
    address: string | null
  }
  packageName: string | null
  arrivalInstructions: string | null
  specialMoments: string | null
  timelineNotes: string | null
  needsAttention: boolean
  attentionReason: string | null
  canEditOperational: boolean
  adminHref: string
  clientAdminHref: string | null
}

function asId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return ''
}

function clientFields(value: unknown): EventDetail['client'] {
  if (!value || typeof value !== 'object') {
    return { id: null, name: null, email: null, phone: null }
  }
  const doc = value as {
    id?: string | number
    fullName?: string | null
    email?: string | null
    phone?: string | null
  }
  return {
    id: doc.id != null ? String(doc.id) : null,
    name: doc.fullName?.trim() || null,
    email: doc.email?.trim() || null,
    phone: doc.phone?.trim() || null,
  }
}

function venueFields(value: unknown): EventDetail['venue'] {
  if (!value || typeof value !== 'object') {
    return { id: null, name: null, region: null, address: null }
  }
  const doc = value as {
    id?: string | number
    venueName?: string | null
    region?: string | null
    address?: string | null
  }
  return {
    id: doc.id != null ? String(doc.id) : null,
    name: doc.venueName?.trim() || null,
    region: doc.region?.trim() || null,
    address: doc.address?.trim() || null,
  }
}

function packageName(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const doc = value as { packageName?: string | null }
  return doc.packageName?.trim() || null
}

function relId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return null
}

function sanitizeSearch(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, EVENT_SEARCH_MAX)
}

function parsePage(raw: string | null | undefined): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.floor(n)
}

function parseLimit(raw: string | null | undefined): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return EVENT_PAGE_SIZE_DEFAULT
  return Math.min(EVENT_PAGE_SIZE_MAX, Math.floor(n))
}

function normalizeFilters(params: EventListParams) {
  const pipeline: EventPipelineFilter = isEventPipeline(params.pipeline || '')
    ? (params.pipeline as EventPipelineFilter)
    : 'upcoming'
  const status =
    params.status && isEventStatus(params.status)
      ? (params.status as EventStatusValue)
      : null
  const sort: EventSortValue = isEventSort(params.sort || '')
    ? (params.sort as EventSortValue)
    : 'soonest'
  const q = sanitizeSearch(params.q)
  const page = parsePage(params.page)
  const limit = parseLimit(params.limit)
  return { pipeline, status, sort, q, page, limit }
}

function sortField(sort: EventSortValue): string {
  switch (sort) {
    case 'latest':
      return '-eventDate'
    case 'newest':
      return '-createdAt'
    case 'oldest':
      return 'createdAt'
    default:
      return 'eventDate'
  }
}

function pipelineWhere(
  pipeline: EventPipelineFilter,
  todayStart: Date,
): Where | null {
  const todayIso = todayStart.toISOString()
  const tomorrowIso = addDays(todayStart, 1).toISOString()
  const day8Iso = addDays(todayStart, 8).toISOString()
  const day31Iso = addDays(todayStart, 31).toISOString()

  switch (pipeline) {
    case 'upcoming':
      return {
        and: [
          { eventDate: { greater_than_equal: todayIso } },
          { eventStatus: { in: [...ACTIVE_EVENT_STATUSES] } },
        ],
      }
    case 'today':
      return {
        and: [
          { eventDate: { greater_than_equal: todayIso } },
          { eventDate: { less_than: tomorrowIso } },
        ],
      }
    case 'next7':
      return {
        and: [
          { eventDate: { greater_than_equal: todayIso } },
          { eventDate: { less_than: day8Iso } },
          { eventStatus: { in: [...ACTIVE_EVENT_STATUSES] } },
        ],
      }
    case 'next30':
      return {
        and: [
          { eventDate: { greater_than_equal: todayIso } },
          { eventDate: { less_than: day31Iso } },
          { eventStatus: { in: [...ACTIVE_EVENT_STATUSES] } },
        ],
      }
    case 'past':
      return { eventDate: { less_than: todayIso } }
    case 'completed':
      return { eventStatus: { in: ['completed', 'archived'] } }
    default:
      return null
  }
}

export async function listEvents(
  user: User,
  params: EventListParams = {},
): Promise<EventListResult> {
  const payload = await getPayload({ config })
  const filters = normalizeFilters(params)
  const errors: string[] = []
  const shared = { user, overrideAccess: false as const }
  const todayStart = startOfTodayInTimezone()
  const weekAhead = addDays(todayStart, 7)
  const tomorrow = addDays(todayStart, 1)

  const counts: EventListResult['counts'] = {
    today: null,
    upcoming: null,
    attention: null,
    completed: null,
    all: null,
  }

  try {
    const [today, upcoming, completed, all] = await Promise.all([
      payload.count({
        collection: 'events',
        ...shared,
        where: {
          and: [
            { eventDate: { greater_than_equal: todayStart.toISOString() } },
            { eventDate: { less_than: tomorrow.toISOString() } },
          ],
        },
      }),
      payload.count({
        collection: 'events',
        ...shared,
        where: {
          and: [
            { eventDate: { greater_than_equal: todayStart.toISOString() } },
            { eventStatus: { in: [...ACTIVE_EVENT_STATUSES] } },
          ],
        },
      }),
      payload.count({
        collection: 'events',
        ...shared,
        where: { eventStatus: { in: ['completed', 'archived'] } },
      }),
      payload.count({ collection: 'events', ...shared }),
    ])
    counts.today = today.totalDocs
    counts.upcoming = upcoming.totalDocs
    counts.completed = completed.totalDocs
    counts.all = all.totalDocs
  } catch (err) {
    console.error('[os/events] counts', err)
    errors.push('Event counts could not be loaded.')
  }

  // Attention count: bounded scan of upcoming active events (not full collection).
  try {
    const attentionScan = await payload.find({
      collection: 'events',
      ...shared,
      depth: 0,
      limit: 50,
      sort: 'eventDate',
      where: {
        and: [
          { eventDate: { greater_than_equal: addDays(todayStart, -30).toISOString() } },
          { eventDate: { less_than: addDays(todayStart, 31).toISOString() } },
          { eventStatus: { in: [...ACTIVE_EVENT_STATUSES] } },
        ],
      },
      select: {
        eventDate: true,
        eventStatus: true,
        guestCount: true,
        venue: true,
      },
    })
    counts.attention = attentionScan.docs.filter((doc) =>
      eventAttentionReason({
        eventDate: doc.eventDate,
        eventStatus: doc.eventStatus,
        venueId: relId(doc.venue),
        guestCount: typeof doc.guestCount === 'number' ? doc.guestCount : null,
        todayStart,
        weekAhead,
      }),
    ).length
  } catch (err) {
    console.error('[os/events] attention count', err)
    errors.push('Attention count could not be loaded.')
  }

  let clientIds: string[] = []
  if (filters.q) {
    try {
      const clients = await payload.find({
        collection: 'clients',
        ...shared,
        limit: 40,
        depth: 0,
        where: {
          or: [
            { fullName: { contains: filters.q } },
            { email: { contains: filters.q } },
          ],
        },
        select: { fullName: true, email: true },
      })
      clientIds = clients.docs.map((doc) => String(doc.id))
    } catch (err) {
      console.error('[os/events] client search', err)
      errors.push('Contact search could not be completed.')
    }
  }

  const and: Where[] = []
  const preset = pipelineWhere(filters.pipeline, todayStart)
  if (preset) and.push(preset)
  if (filters.status) {
    and.push({ eventStatus: { equals: filters.status } })
  }
  if (filters.q) {
    const or: Where[] = [{ eventName: { contains: filters.q } }]
    if (clientIds.length > 0) {
      or.push({ client: { in: clientIds } })
    }
    and.push({ or })
  }

  const where: Where | undefined = and.length > 0 ? { and } : undefined

  let rows: EventListRow[] = []
  let totalDocs = 0
  let totalPages = 1

  try {
    const result = await payload.find({
      collection: 'events',
      ...shared,
      depth: 1,
      page: filters.page,
      limit: filters.limit,
      sort: sortField(filters.sort),
      where,
      select: {
        eventName: true,
        eventStatus: true,
        eventDate: true,
        guestCount: true,
        client: true,
        venue: true,
        packageOption: true,
      },
    })

    totalDocs = result.totalDocs
    totalPages = Math.max(1, result.totalPages)
    rows = result.docs.map((doc) => {
      const client = clientFields(doc.client)
      const venue = venueFields(doc.venue)
      const reason = eventAttentionReason({
        eventDate: doc.eventDate,
        eventStatus: doc.eventStatus,
        venueId: venue.id,
        guestCount: typeof doc.guestCount === 'number' ? doc.guestCount : null,
        todayStart,
        weekAhead,
      })
      return {
        id: asId(doc.id),
        name: doc.eventName || 'Untitled event',
        status: doc.eventStatus || '',
        statusLabel: statusLabel(doc.eventStatus),
        dateLabel: formatShortDate(doc.eventDate),
        guestCount: typeof doc.guestCount === 'number' ? doc.guestCount : null,
        clientName: client.name,
        venueName: venue.name,
        packageName: packageName(doc.packageOption),
        needsAttention: Boolean(reason),
        attentionReason: reason,
        href: `/os/events/${doc.id}`,
      }
    })
  } catch (err) {
    console.error('[os/events] list', err)
    errors.push('Events could not be loaded right now.')
  }

  return {
    rows,
    page: filters.page,
    totalPages,
    totalDocs,
    limit: filters.limit,
    filters: {
      pipeline: filters.pipeline,
      status: filters.status,
      q: filters.q,
      sort: filters.sort,
    },
    counts,
    errors,
    canManageInAdmin: canWriteOperational(asPlateUser(user)),
  }
}

export async function getEventDetail(
  user: User,
  id: string,
): Promise<EventDetail | null> {
  if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
    return null
  }

  const payload = await getPayload({ config })
  const todayStart = startOfTodayInTimezone()
  const weekAhead = addDays(todayStart, 7)
  const canEdit = canWriteOperational(asPlateUser(user))

  try {
    const doc = await payload.findByID({
      collection: 'events',
      id,
      user,
      overrideAccess: false,
      depth: 1,
      // Explicit select keeps staffNotes / clientNotes out of the OS payload.
      select: {
        eventName: true,
        eventStatus: true,
        eventDate: true,
        guestCount: true,
        client: true,
        venue: true,
        packageOption: true,
        arrivalInstructions: true,
        specialMoments: true,
        timelineNotes: true,
      },
    })

    if (!doc) return null

    const client = clientFields(doc.client)
    const venue = venueFields(doc.venue)
    const reason = eventAttentionReason({
      eventDate: doc.eventDate,
      eventStatus: doc.eventStatus,
      venueId: venue.id,
      guestCount: typeof doc.guestCount === 'number' ? doc.guestCount : null,
      todayStart,
      weekAhead,
    })

    return {
      id: asId(doc.id),
      name: doc.eventName || 'Untitled event',
      status: doc.eventStatus || 'planning',
      statusLabel: statusLabel(doc.eventStatus),
      dateLabel: formatShortDate(doc.eventDate),
      guestCount: typeof doc.guestCount === 'number' ? doc.guestCount : null,
      client,
      venue,
      packageName: packageName(doc.packageOption),
      arrivalInstructions: doc.arrivalInstructions?.trim() || null,
      specialMoments: doc.specialMoments?.trim() || null,
      timelineNotes: doc.timelineNotes?.trim() || null,
      needsAttention: Boolean(reason),
      attentionReason: reason,
      canEditOperational: canEdit,
      adminHref: `/admin/collections/events/${doc.id}`,
      clientAdminHref: client.id
        ? `/admin/collections/clients/${client.id}`
        : null,
    }
  } catch (err) {
    const status =
      err && typeof err === 'object' && 'status' in err
        ? (err as { status?: number }).status
        : undefined
    if (status !== 404) {
      console.error('[os/events] detail', err)
    }
    return null
  }
}

export function buildEventListHref(params: {
  pipeline?: string
  status?: string | null
  q?: string
  sort?: string
  page?: number
}): string {
  const sp = new URLSearchParams()
  if (params.pipeline && params.pipeline !== 'upcoming') {
    sp.set('pipeline', params.pipeline)
  }
  if (params.status) sp.set('status', params.status)
  if (params.q) sp.set('q', params.q)
  if (params.sort && params.sort !== 'soonest') sp.set('sort', params.sort)
  if (params.page && params.page > 1) sp.set('page', String(params.page))
  const qs = sp.toString()
  return qs ? `/os/events?${qs}` : '/os/events'
}

export function assertEventStatus(value: unknown): EventStatusValue | null {
  return typeof value === 'string' && isEventStatus(value) ? value : null
}
