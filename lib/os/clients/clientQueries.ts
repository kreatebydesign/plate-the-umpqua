import { getPayload } from 'payload'
import type { Where } from 'payload'
import config from '../../../payload.config'
import type { User } from '@/payload-types'
import { canWriteOperational, asPlateUser } from '@/lib/access/roles'
import {
  ACTIVE_EVENT_STATUSES,
  OPEN_INQUIRY_STATUSES,
  EVENT_STATUS_LABELS,
  INQUIRY_STATUS_LABELS,
} from '../constants'
import {
  formatShortDate,
  startOfTodayInTimezone,
} from '../formatDate'
import {
  CLIENT_DETAIL_RELATED_LIMIT,
  CLIENT_FOLLOWUP_INQUIRY_STATUSES,
  CLIENT_PAGE_SIZE_DEFAULT,
  CLIENT_PAGE_SIZE_MAX,
  CLIENT_RELATION_HARVEST_LIMIT,
  CLIENT_SEARCH_MAX,
  CLIENT_UPDATE_ALLOWLIST,
  clientAttentionReason,
  clientTypeLabel,
  clientVipLabel,
  experienceStyleLabel,
  isClientSort,
  isClientType,
  isClientView,
  isClientVip,
  type ClientSortValue,
  type ClientTypeValue,
  type ClientViewFilter,
  type ClientVipValue,
} from './clientConstants'

export type ClientListParams = {
  view?: string | null
  type?: string | null
  vip?: string | null
  q?: string | null
  sort?: string | null
  page?: string | null
  limit?: string | null
}

export type ClientListRow = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  clientType: string
  clientTypeLabel: string
  vipStatus: string
  vipStatusLabel: string
  updatedLabel: string
  hasUpcomingEvent: boolean
  hasOpenInquiry: boolean
  needsAttention: boolean
  attentionReason: string | null
  href: string
}

export type ClientListResult = {
  rows: ClientListRow[]
  page: number
  totalPages: number
  totalDocs: number
  limit: number
  filters: {
    view: ClientViewFilter
    type: ClientTypeValue | null
    vip: ClientVipValue | null
    q: string
    sort: ClientSortValue
  }
  counts: {
    total: number | null
    withUpcomingEvents: number | null
    withOpenInquiries: number | null
    attention: number | null
  }
  errors: string[]
  canManageInAdmin: boolean
  /** Phase 4 is read-only; exposed for verify scripts / future forms. */
  updateAllowlist: readonly string[]
}

export type ClientRelatedInquiry = {
  id: string
  title: string
  statusLabel: string
  receivedLabel: string
  href: string
}

export type ClientRelatedEvent = {
  id: string
  name: string
  statusLabel: string
  dateLabel: string
  href: string
}

export type ClientDetail = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  instagram: string | null
  clientType: string
  clientTypeLabel: string
  vipStatus: string
  vipStatusLabel: string
  preferredExperienceStyles: string[]
  createdLabel: string
  updatedLabel: string
  needsAttention: boolean
  attentionReason: string | null
  upcomingEvents: ClientRelatedEvent[]
  pastEvents: ClientRelatedEvent[]
  openInquiries: ClientRelatedInquiry[]
  recentInquiries: ClientRelatedInquiry[]
  upcomingEventTotal: number | null
  pastEventTotal: number | null
  openInquiryTotal: number | null
  canManageInAdmin: boolean
  adminHref: string
  /**
   * Sensitive private notes and financial fields are intentionally omitted.
   * Dietary notes live in a separate collection and are not surfaced here.
   */
}

function asId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return ''
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
    .slice(0, CLIENT_SEARCH_MAX)
}

function parsePage(raw: string | null | undefined): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.floor(n)
}

function parseLimit(raw: string | null | undefined): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return CLIENT_PAGE_SIZE_DEFAULT
  return Math.min(CLIENT_PAGE_SIZE_MAX, Math.floor(n))
}

function normalizeFilters(params: ClientListParams) {
  const view: ClientViewFilter = isClientView(params.view || '')
    ? (params.view as ClientViewFilter)
    : 'all'
  const type =
    params.type && isClientType(params.type)
      ? (params.type as ClientTypeValue)
      : null
  const vip =
    params.vip && isClientVip(params.vip)
      ? (params.vip as ClientVipValue)
      : null
  const sort: ClientSortValue = isClientSort(params.sort || '')
    ? (params.sort as ClientSortValue)
    : 'newest'
  const q = sanitizeSearch(params.q)
  const page = parsePage(params.page)
  const limit = parseLimit(params.limit)
  return { view, type, vip, sort, q, page, limit }
}

function sortField(sort: ClientSortValue): string {
  switch (sort) {
    case 'oldest':
      return 'updatedAt'
    case 'name-asc':
      return 'fullName'
    case 'name-desc':
      return '-fullName'
    default:
      return '-updatedAt'
  }
}

function uniqueIds(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    if (!value || seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

function mailtoHref(email: string | null | undefined): string | null {
  if (!email) return null
  const trimmed = email.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null
  return `mailto:${trimmed}`
}

function telHref(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/[^\d+]/g, '')
  if (digits.replace(/\D/g, '').length < 7) return null
  return `tel:${digits}`
}

export function clientMailtoHref(email: string | null | undefined) {
  return mailtoHref(email)
}

export function clientTelHref(phone: string | null | undefined) {
  return telHref(phone)
}

async function harvestClientIdsFromEvents(
  payload: Awaited<ReturnType<typeof getPayload>>,
  user: User,
  where: Where,
): Promise<{ ids: string[]; truncated: boolean; error?: string }> {
  try {
    const result = await payload.find({
      collection: 'events',
      user,
      overrideAccess: false,
      depth: 0,
      limit: CLIENT_RELATION_HARVEST_LIMIT,
      where,
      select: { client: true },
    })
    const ids = uniqueIds(result.docs.map((doc) => relId(doc.client)))
    return {
      ids,
      truncated: result.totalDocs > result.docs.length,
    }
  } catch (err) {
    console.error('[os/clients] event harvest', err)
    return { ids: [], truncated: false, error: 'Event relationship scan failed.' }
  }
}

async function harvestClientIdsFromInquiries(
  payload: Awaited<ReturnType<typeof getPayload>>,
  user: User,
  where: Where,
): Promise<{ ids: string[]; truncated: boolean; error?: string }> {
  try {
    const result = await payload.find({
      collection: 'inquiries',
      user,
      overrideAccess: false,
      depth: 0,
      limit: CLIENT_RELATION_HARVEST_LIMIT,
      where,
      select: { client: true },
    })
    const ids = uniqueIds(result.docs.map((doc) => relId(doc.client)))
    return {
      ids,
      truncated: result.totalDocs > result.docs.length,
    }
  } catch (err) {
    console.error('[os/clients] inquiry harvest', err)
    return {
      ids: [],
      truncated: false,
      error: 'Inquiry relationship scan failed.',
    }
  }
}

async function loadRelationFlags(
  payload: Awaited<ReturnType<typeof getPayload>>,
  user: User,
  clientIds: string[],
  todayStart: Date,
): Promise<{
  upcoming: Set<string>
  openInquiry: Set<string>
  followUpInquiry: Set<string>
  errors: string[]
}> {
  const upcoming = new Set<string>()
  const openInquiry = new Set<string>()
  const followUpInquiry = new Set<string>()
  const errors: string[] = []
  if (clientIds.length === 0) {
    return { upcoming, openInquiry, followUpInquiry, errors }
  }

  try {
    const events = await payload.find({
      collection: 'events',
      user,
      overrideAccess: false,
      depth: 0,
      limit: CLIENT_RELATION_HARVEST_LIMIT,
      where: {
        and: [
          { client: { in: clientIds } },
          { eventDate: { greater_than_equal: todayStart.toISOString() } },
          { eventStatus: { in: [...ACTIVE_EVENT_STATUSES] } },
        ],
      },
      select: { client: true },
    })
    for (const doc of events.docs) {
      const id = relId(doc.client)
      if (id) upcoming.add(id)
    }
  } catch (err) {
    console.error('[os/clients] upcoming flags', err)
    errors.push('Upcoming event indicators could not be loaded.')
  }

  try {
    const open = await payload.find({
      collection: 'inquiries',
      user,
      overrideAccess: false,
      depth: 0,
      limit: CLIENT_RELATION_HARVEST_LIMIT,
      where: {
        and: [
          { client: { in: clientIds } },
          { status: { in: [...OPEN_INQUIRY_STATUSES] } },
        ],
      },
      select: { client: true, status: true },
    })
    for (const doc of open.docs) {
      const id = relId(doc.client)
      if (!id) continue
      openInquiry.add(id)
      if (
        doc.status &&
        (CLIENT_FOLLOWUP_INQUIRY_STATUSES as readonly string[]).includes(
          doc.status,
        )
      ) {
        followUpInquiry.add(id)
      }
    }
  } catch (err) {
    console.error('[os/clients] inquiry flags', err)
    errors.push('Inquiry indicators could not be loaded.')
  }

  return { upcoming, openInquiry, followUpInquiry, errors }
}

export async function listClients(
  user: User,
  params: ClientListParams = {},
): Promise<ClientListResult> {
  const payload = await getPayload({ config })
  const filters = normalizeFilters(params)
  const errors: string[] = []
  const shared = { user, overrideAccess: false as const }
  const todayStart = startOfTodayInTimezone()

  const counts: ClientListResult['counts'] = {
    total: null,
    withUpcomingEvents: null,
    withOpenInquiries: null,
    attention: null,
  }

  const upcomingWhere: Where = {
    and: [
      { eventDate: { greater_than_equal: todayStart.toISOString() } },
      { eventStatus: { in: [...ACTIVE_EVENT_STATUSES] } },
      { client: { exists: true } },
    ],
  }
  const openInquiryWhere: Where = {
    and: [
      { status: { in: [...OPEN_INQUIRY_STATUSES] } },
      { client: { exists: true } },
    ],
  }
  const followUpWhere: Where = {
    and: [
      { status: { in: [...CLIENT_FOLLOWUP_INQUIRY_STATUSES] } },
      { client: { exists: true } },
    ],
  }

  const [upcomingHarvest, openHarvest, followUpHarvest] = await Promise.all([
    harvestClientIdsFromEvents(payload, user, upcomingWhere),
    harvestClientIdsFromInquiries(payload, user, openInquiryWhere),
    harvestClientIdsFromInquiries(payload, user, followUpWhere),
  ])

  if (upcomingHarvest.error) errors.push(upcomingHarvest.error)
  if (openHarvest.error) errors.push(openHarvest.error)
  if (followUpHarvest.error) errors.push(followUpHarvest.error)

  try {
    counts.total = (
      await payload.count({ collection: 'clients', ...shared })
    ).totalDocs
  } catch (err) {
    console.error('[os/clients] total count', err)
    errors.push('Client total could not be loaded.')
  }

  // Unique-client relationship counts are exact when harvest was not truncated.
  if (!upcomingHarvest.error) {
    counts.withUpcomingEvents = upcomingHarvest.truncated
      ? null
      : upcomingHarvest.ids.length
    if (upcomingHarvest.truncated) {
      errors.push(
        'Clients-with-upcoming-events count exceeds the bounded scan and was omitted.',
      )
    }
  }
  if (!openHarvest.error) {
    counts.withOpenInquiries = openHarvest.truncated
      ? null
      : openHarvest.ids.length
    if (openHarvest.truncated) {
      errors.push(
        'Clients-with-open-inquiries count exceeds the bounded scan and was omitted.',
      )
    }
  }

  // Attention: upcoming+missing phone OR follow-up inquiry.
  // Missing-phone check requires loading those upcoming-linked clients.
  try {
    const attentionIds = new Set<string>(followUpHarvest.ids)
    if (upcomingHarvest.ids.length > 0) {
      const phoneCheck = await payload.find({
        collection: 'clients',
        ...shared,
        depth: 0,
        limit: CLIENT_RELATION_HARVEST_LIMIT,
        where: {
          and: [
            { id: { in: upcomingHarvest.ids } },
            {
              or: [
                { phone: { exists: false } },
                { phone: { equals: '' } },
              ],
            },
          ],
        },
        select: { phone: true },
      })
      for (const doc of phoneCheck.docs) {
        attentionIds.add(String(doc.id))
      }
    }
    const attentionTruncated =
      upcomingHarvest.truncated || followUpHarvest.truncated
    counts.attention = attentionTruncated ? null : attentionIds.size
    if (attentionTruncated) {
      errors.push(
        'Attention count exceeds the bounded scan and was omitted.',
      )
    }
  } catch (err) {
    console.error('[os/clients] attention count', err)
    errors.push('Attention count could not be loaded.')
  }

  const and: Where[] = []
  if (filters.type) {
    and.push({ clientType: { equals: filters.type } })
  }
  if (filters.vip) {
    and.push({ vipStatus: { equals: filters.vip } })
  }
  if (filters.q) {
    and.push({
      or: [
        { fullName: { contains: filters.q } },
        { email: { contains: filters.q } },
        { phone: { contains: filters.q } },
      ],
    })
  }

  if (filters.view === 'upcoming-events') {
    if (upcomingHarvest.ids.length === 0) {
      and.push({ id: { in: ['__none__'] } })
    } else {
      and.push({ id: { in: upcomingHarvest.ids } })
    }
  } else if (filters.view === 'open-inquiries') {
    if (openHarvest.ids.length === 0) {
      and.push({ id: { in: ['__none__'] } })
    } else {
      and.push({ id: { in: openHarvest.ids } })
    }
  } else if (filters.view === 'attention') {
    const attentionIds = new Set<string>(followUpHarvest.ids)
    if (upcomingHarvest.ids.length > 0) {
      try {
        const phoneCheck = await payload.find({
          collection: 'clients',
          ...shared,
          depth: 0,
          limit: CLIENT_RELATION_HARVEST_LIMIT,
          where: {
            and: [
              { id: { in: upcomingHarvest.ids } },
              {
                or: [
                  { phone: { exists: false } },
                  { phone: { equals: '' } },
                ],
              },
            ],
          },
          select: { phone: true },
        })
        for (const doc of phoneCheck.docs) {
          attentionIds.add(String(doc.id))
        }
      } catch (err) {
        console.error('[os/clients] attention filter', err)
        errors.push('Attention filter could not be completed.')
      }
    }
    if (attentionIds.size === 0) {
      and.push({ id: { in: ['__none__'] } })
    } else {
      and.push({ id: { in: [...attentionIds] } })
    }
  }

  const where: Where | undefined = and.length > 0 ? { and } : undefined

  let rows: ClientListRow[] = []
  let totalDocs = 0
  let totalPages = 1

  try {
    const result = await payload.find({
      collection: 'clients',
      ...shared,
      depth: 0,
      page: filters.page,
      limit: filters.limit,
      sort: sortField(filters.sort),
      where,
      // Explicit select keeps notes, spend, and strategy fields out of list payloads.
      select: {
        fullName: true,
        email: true,
        phone: true,
        clientType: true,
        vipStatus: true,
        updatedAt: true,
      },
    })

    totalDocs = result.totalDocs
    totalPages = Math.max(1, result.totalPages)

    const pageIds = result.docs.map((doc) => String(doc.id))
    const flags = await loadRelationFlags(payload, user, pageIds, todayStart)
    errors.push(...flags.errors)

    rows = result.docs.map((doc) => {
      const id = asId(doc.id)
      const phone = doc.phone?.trim() || null
      const hasUpcomingEvent = flags.upcoming.has(id)
      const hasOpenInquiry = flags.openInquiry.has(id)
      const reason = clientAttentionReason({
        phone,
        hasUpcomingEvent,
        hasFollowUpInquiry: flags.followUpInquiry.has(id),
      })
      return {
        id,
        fullName: doc.fullName?.trim() || 'Unnamed client',
        email: doc.email?.trim() || null,
        phone,
        clientType: doc.clientType || '',
        clientTypeLabel: clientTypeLabel(doc.clientType),
        vipStatus: doc.vipStatus || '',
        vipStatusLabel: clientVipLabel(doc.vipStatus),
        updatedLabel: formatShortDate(doc.updatedAt),
        hasUpcomingEvent,
        hasOpenInquiry,
        needsAttention: Boolean(reason),
        attentionReason: reason,
        href: `/os/clients/${id}`,
      }
    })
  } catch (err) {
    console.error('[os/clients] list', err)
    errors.push('Clients could not be loaded right now.')
  }

  return {
    rows,
    page: filters.page,
    totalPages,
    totalDocs,
    limit: filters.limit,
    filters: {
      view: filters.view,
      type: filters.type,
      vip: filters.vip,
      q: filters.q,
      sort: filters.sort,
    },
    counts,
    errors,
    canManageInAdmin: canWriteOperational(asPlateUser(user)),
    updateAllowlist: CLIENT_UPDATE_ALLOWLIST,
  }
}

export async function getClientDetail(
  user: User,
  id: string,
): Promise<ClientDetail | null> {
  if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
    return null
  }

  const payload = await getPayload({ config })
  const todayStart = startOfTodayInTimezone()
  const canManage = canWriteOperational(asPlateUser(user))

  try {
    const doc = await payload.findByID({
      collection: 'clients',
      id,
      user,
      overrideAccess: false,
      depth: 0,
      // Omit relationshipNotes, internalStrategyNotes, averageSpendRange,
      // favoriteVendors, favoriteVenues from the OS detail payload.
      select: {
        fullName: true,
        email: true,
        phone: true,
        instagram: true,
        clientType: true,
        vipStatus: true,
        preferredExperienceStyle: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!doc) return null

    const phone = doc.phone?.trim() || null
    const styles = Array.isArray(doc.preferredExperienceStyle)
      ? doc.preferredExperienceStyle
          .map((value) => experienceStyleLabel(value))
          .filter((value): value is string => Boolean(value))
      : []

    let upcomingEvents: ClientRelatedEvent[] = []
    let pastEvents: ClientRelatedEvent[] = []
    let openInquiries: ClientRelatedInquiry[] = []
    let recentInquiries: ClientRelatedInquiry[] = []
    let upcomingEventTotal: number | null = null
    let pastEventTotal: number | null = null
    let openInquiryTotal: number | null = null

    try {
      const [upcomingResult, pastResult, openResult, recentResult] =
        await Promise.all([
          payload.find({
            collection: 'events',
            user,
            overrideAccess: false,
            depth: 0,
            limit: CLIENT_DETAIL_RELATED_LIMIT,
            sort: 'eventDate',
            where: {
              and: [
                { client: { equals: id } },
                { eventDate: { greater_than_equal: todayStart.toISOString() } },
                { eventStatus: { in: [...ACTIVE_EVENT_STATUSES] } },
              ],
            },
            select: {
              eventName: true,
              eventStatus: true,
              eventDate: true,
            },
          }),
          payload.find({
            collection: 'events',
            user,
            overrideAccess: false,
            depth: 0,
            limit: CLIENT_DETAIL_RELATED_LIMIT,
            sort: '-eventDate',
            where: {
              and: [
                { client: { equals: id } },
                { eventDate: { less_than: todayStart.toISOString() } },
              ],
            },
            select: {
              eventName: true,
              eventStatus: true,
              eventDate: true,
            },
          }),
          payload.find({
            collection: 'inquiries',
            user,
            overrideAccess: false,
            depth: 0,
            limit: CLIENT_DETAIL_RELATED_LIMIT,
            sort: '-createdAt',
            where: {
              and: [
                { client: { equals: id } },
                { status: { in: [...OPEN_INQUIRY_STATUSES] } },
              ],
            },
            select: {
              eventTitle: true,
              status: true,
              createdAt: true,
            },
          }),
          payload.find({
            collection: 'inquiries',
            user,
            overrideAccess: false,
            depth: 0,
            limit: CLIENT_DETAIL_RELATED_LIMIT,
            sort: '-createdAt',
            where: { client: { equals: id } },
            select: {
              eventTitle: true,
              status: true,
              createdAt: true,
            },
          }),
        ])

      upcomingEventTotal = upcomingResult.totalDocs
      pastEventTotal = pastResult.totalDocs
      openInquiryTotal = openResult.totalDocs

      upcomingEvents = upcomingResult.docs.map((event) => ({
        id: asId(event.id),
        name: event.eventName || 'Untitled event',
        statusLabel:
          EVENT_STATUS_LABELS[event.eventStatus || ''] ||
          event.eventStatus ||
          '—',
        dateLabel: formatShortDate(event.eventDate),
        href: `/os/events/${event.id}`,
      }))

      pastEvents = pastResult.docs.map((event) => ({
        id: asId(event.id),
        name: event.eventName || 'Untitled event',
        statusLabel:
          EVENT_STATUS_LABELS[event.eventStatus || ''] ||
          event.eventStatus ||
          '—',
        dateLabel: formatShortDate(event.eventDate),
        href: `/os/events/${event.id}`,
      }))

      openInquiries = openResult.docs.map((inquiry) => ({
        id: asId(inquiry.id),
        title: inquiry.eventTitle || 'Hospitality inquiry',
        statusLabel:
          INQUIRY_STATUS_LABELS[inquiry.status || ''] || inquiry.status || '—',
        receivedLabel: formatShortDate(inquiry.createdAt),
        href: `/os/inquiries/${inquiry.id}`,
      }))

      recentInquiries = recentResult.docs.map((inquiry) => ({
        id: asId(inquiry.id),
        title: inquiry.eventTitle || 'Hospitality inquiry',
        statusLabel:
          INQUIRY_STATUS_LABELS[inquiry.status || ''] || inquiry.status || '—',
        receivedLabel: formatShortDate(inquiry.createdAt),
        href: `/os/inquiries/${inquiry.id}`,
      }))
    } catch (err) {
      console.error('[os/clients] detail relations', err)
      // Detail remains usable without relationship panels.
    }

    // Follow-up attention uses the same NEW inquiry statuses as Today / inquiries.
    let followUp = false
    try {
      const followUps = await payload.count({
        collection: 'inquiries',
        user,
        overrideAccess: false,
        where: {
          and: [
            { client: { equals: id } },
            { status: { in: [...CLIENT_FOLLOWUP_INQUIRY_STATUSES] } },
          ],
        },
      })
      followUp = followUps.totalDocs > 0
    } catch {
      followUp = false
    }

    const reason = clientAttentionReason({
      phone,
      hasUpcomingEvent: (upcomingEventTotal || 0) > 0,
      hasFollowUpInquiry: followUp,
    })

    return {
      id: asId(doc.id),
      fullName: doc.fullName?.trim() || 'Unnamed client',
      email: doc.email?.trim() || null,
      phone,
      instagram: doc.instagram?.trim() || null,
      clientType: doc.clientType || '',
      clientTypeLabel: clientTypeLabel(doc.clientType),
      vipStatus: doc.vipStatus || '',
      vipStatusLabel: clientVipLabel(doc.vipStatus),
      preferredExperienceStyles: styles,
      createdLabel: formatShortDate(doc.createdAt),
      updatedLabel: formatShortDate(doc.updatedAt),
      needsAttention: Boolean(reason),
      attentionReason: reason,
      upcomingEvents,
      pastEvents,
      openInquiries,
      recentInquiries,
      upcomingEventTotal,
      pastEventTotal,
      openInquiryTotal,
      canManageInAdmin: canManage,
      adminHref: `/admin/collections/clients/${doc.id}`,
    }
  } catch (err) {
    const status =
      err && typeof err === 'object' && 'status' in err
        ? (err as { status?: number }).status
        : undefined
    if (status !== 404) {
      console.error('[os/clients] detail', err)
    }
    return null
  }
}

export function buildClientListHref(params: {
  view?: string
  type?: string | null
  vip?: string | null
  q?: string
  sort?: string
  page?: number
}): string {
  const sp = new URLSearchParams()
  if (params.view && params.view !== 'all') sp.set('view', params.view)
  if (params.type) sp.set('type', params.type)
  if (params.vip) sp.set('vip', params.vip)
  if (params.q) sp.set('q', params.q)
  if (params.sort && params.sort !== 'newest') sp.set('sort', params.sort)
  if (params.page && params.page > 1) sp.set('page', String(params.page))
  const qs = sp.toString()
  return qs ? `/os/clients?${qs}` : '/os/clients'
}
