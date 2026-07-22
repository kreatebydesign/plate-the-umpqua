import { getPayload } from 'payload'
import type { Where } from 'payload'
import config from '../../../payload.config'
import type { User } from '@/payload-types'
import { canWriteOperational, canReadDietary, asPlateUser } from '@/lib/access/roles'
import { formatShortDate } from '../formatDate'
import {
  INQUIRY_BUDGET_LABELS,
  INQUIRY_LOCATION_LABELS,
  INQUIRY_PAGE_SIZE_DEFAULT,
  INQUIRY_PAGE_SIZE_MAX,
  INQUIRY_PRIORITY_LABELS,
  INQUIRY_SEARCH_MAX,
  type InquiryPipelineFilter,
  type InquiryPriorityValue,
  type InquirySortValue,
  type InquiryStatusValue,
  isInquiryOccasion,
  isInquiryPriority,
  isInquirySort,
  isInquiryStatus,
  isLeadSource,
  isPipelineFilter,
  needsFollowUp,
  occasionLabel,
  pipelineStatuses,
  sourceLabel,
  statusLabel,
} from './inquiryConstants'
import { NEW_INQUIRY_STATUSES, OPEN_INQUIRY_STATUSES } from '../constants'

export type InquiryListParams = {
  pipeline?: string | null
  source?: string | null
  occasion?: string | null
  q?: string | null
  sort?: string | null
  page?: string | null
  limit?: string | null
}

export type InquiryListRow = {
  id: string
  title: string
  status: string
  statusLabel: string
  sourceLabel: string
  occasionLabel: string
  receivedLabel: string
  eventDateLabel: string | null
  guestCount: number | null
  clientName: string | null
  clientEmail: string | null
  needsFollowUp: boolean
  href: string
}

export type InquiryListResult = {
  rows: InquiryListRow[]
  page: number
  totalPages: number
  totalDocs: number
  limit: number
  filters: {
    pipeline: InquiryPipelineFilter
    source: string | null
    occasion: string | null
    q: string
    sort: InquirySortValue
  }
  counts: {
    all: number | null
    new: number | null
    open: number | null
    approved: number | null
    closed: number | null
  }
  errors: string[]
  canManageInAdmin: boolean
}

export type InquiryDetail = {
  id: string
  title: string
  status: InquiryStatusValue | string
  statusLabel: string
  priority: InquiryPriorityValue | string
  priorityLabel: string
  sourceLabel: string
  occasionLabel: string
  receivedLabel: string
  eventDateLabel: string | null
  guestCount: number | null
  locationLabel: string | null
  preferredRegion: string | null
  budgetLabel: string | null
  experienceVision: string | null
  addOns: string[]
  client: {
    id: string | null
    name: string | null
    email: string | null
    phone: string | null
  }
  /** OS client detail when an authorized client relationship is present. */
  clientOsHref: string | null
  dietaryNotes: string | null
  canEditOperational: boolean
  canViewDietary: boolean
  adminHref: string
  /** Hook note for operators when choosing newLead */
  statusHookNote: string
}

function asId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return ''
}

function clientFields(value: unknown): {
  id: string | null
  name: string | null
  email: string | null
  phone: string | null
} {
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

function sanitizeSearch(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, INQUIRY_SEARCH_MAX)
}

function parsePage(raw: string | null | undefined): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.floor(n)
}

function parseLimit(raw: string | null | undefined): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return INQUIRY_PAGE_SIZE_DEFAULT
  return Math.min(INQUIRY_PAGE_SIZE_MAX, Math.floor(n))
}

function normalizeFilters(params: InquiryListParams) {
  const pipeline: InquiryPipelineFilter = isPipelineFilter(params.pipeline || '')
    ? (params.pipeline as InquiryPipelineFilter)
    : 'open'
  const source =
    params.source && isLeadSource(params.source) ? params.source : null
  const occasion =
    params.occasion && isInquiryOccasion(params.occasion) ? params.occasion : null
  const sort: InquirySortValue = isInquirySort(params.sort || '')
    ? (params.sort as InquirySortValue)
    : 'newest'
  const q = sanitizeSearch(params.q)
  const page = parsePage(params.page)
  const limit = parseLimit(params.limit)
  return { pipeline, source, occasion, sort, q, page, limit }
}

export async function listInquiries(
  user: User,
  params: InquiryListParams = {},
): Promise<InquiryListResult> {
  const payload = await getPayload({ config })
  const filters = normalizeFilters(params)
  const errors: string[] = []
  const shared = { user, overrideAccess: false as const }

  const counts: InquiryListResult['counts'] = {
    all: null,
    new: null,
    open: null,
    approved: null,
    closed: null,
  }

  try {
    const [all, neu, open, approved, closed] = await Promise.all([
      payload.count({ collection: 'inquiries', ...shared }),
      payload.count({
        collection: 'inquiries',
        ...shared,
        where: { status: { in: [...NEW_INQUIRY_STATUSES] } },
      }),
      payload.count({
        collection: 'inquiries',
        ...shared,
        where: { status: { in: [...OPEN_INQUIRY_STATUSES] } },
      }),
      payload.count({
        collection: 'inquiries',
        ...shared,
        where: { status: { equals: 'approved' } },
      }),
      payload.count({
        collection: 'inquiries',
        ...shared,
        where: { status: { equals: 'closed' } },
      }),
    ])
    counts.all = all.totalDocs
    counts.new = neu.totalDocs
    counts.open = open.totalDocs
    counts.approved = approved.totalDocs
    counts.closed = closed.totalDocs
  } catch (err) {
    console.error('[os/inquiries] counts', err)
    errors.push('Pipeline counts could not be loaded.')
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
      console.error('[os/inquiries] client search', err)
      errors.push('Contact search could not be completed.')
    }
  }

  const and: Where[] = []
  const statuses = pipelineStatuses(filters.pipeline)
  if (statuses) {
    and.push({ status: { in: [...statuses] } })
  }
  if (filters.source) {
    and.push({ leadSource: { equals: filters.source } })
  }
  if (filters.occasion) {
    and.push({ occasion: { equals: filters.occasion } })
  }
  if (filters.q) {
    const or: Where[] = [
      { eventTitle: { contains: filters.q } },
      { preferredRegion: { contains: filters.q } },
    ]
    if (clientIds.length > 0) {
      or.push({ client: { in: clientIds } })
    }
    and.push({ or })
  }

  const where: Where | undefined = and.length > 0 ? { and } : undefined

  let rows: InquiryListRow[] = []
  let totalDocs = 0
  let totalPages = 1

  try {
    const result = await payload.find({
      collection: 'inquiries',
      ...shared,
      depth: 1,
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort === 'oldest' ? 'createdAt' : '-createdAt',
      where,
      select: {
        eventTitle: true,
        status: true,
        leadSource: true,
        occasion: true,
        createdAt: true,
        eventDate: true,
        guestCount: true,
        client: true,
      },
    })

    totalDocs = result.totalDocs
    totalPages = Math.max(1, result.totalPages)
    rows = result.docs.map((doc) => {
      const client = clientFields(doc.client)
      return {
        id: asId(doc.id),
        title: doc.eventTitle || 'Hospitality inquiry',
        status: doc.status || '',
        statusLabel: statusLabel(doc.status),
        sourceLabel: sourceLabel(doc.leadSource),
        occasionLabel: occasionLabel(doc.occasion),
        receivedLabel: formatShortDate(doc.createdAt),
        eventDateLabel: doc.eventDate ? formatShortDate(doc.eventDate) : null,
        guestCount: typeof doc.guestCount === 'number' ? doc.guestCount : null,
        clientName: client.name,
        clientEmail: client.email,
        needsFollowUp: needsFollowUp(doc.status),
        href: `/os/inquiries/${doc.id}`,
      }
    })
  } catch (err) {
    console.error('[os/inquiries] list', err)
    errors.push('Inquiries could not be loaded right now.')
  }

  return {
    rows,
    page: filters.page,
    totalPages,
    totalDocs,
    limit: filters.limit,
    filters: {
      pipeline: filters.pipeline,
      source: filters.source,
      occasion: filters.occasion,
      q: filters.q,
      sort: filters.sort,
    },
    counts,
    errors,
    canManageInAdmin: canWriteOperational(asPlateUser(user)),
  }
}

export async function getInquiryDetail(
  user: User,
  id: string,
): Promise<InquiryDetail | null> {
  if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
    return null
  }

  const payload = await getPayload({ config })
  const plateUser = asPlateUser(user)
  const canEdit = canWriteOperational(plateUser)
  const canViewDietary = canReadDietary(plateUser)

  try {
    const doc = await payload.findByID({
      collection: 'inquiries',
      id,
      user,
      overrideAccess: false,
      depth: 1,
      // Explicit select keeps internalNotes out of the OS detail payload.
      select: {
        eventTitle: true,
        status: true,
        priorityLevel: true,
        leadSource: true,
        occasion: true,
        createdAt: true,
        eventDate: true,
        guestCount: true,
        locationType: true,
        preferredRegion: true,
        budgetRange: true,
        experienceVision: true,
        desiredAddOns: true,
        dietaryNotes: true,
        client: true,
      },
    })

    if (!doc) return null

    const client = clientFields(doc.client)
    // dietaryNotes is operationally sensitive; never returned from list queries.
    // Detail includes it only when role policy allows dietary read.
    const dietaryRaw =
      typeof doc.dietaryNotes === 'string' ? doc.dietaryNotes.trim() : ''
    const dietary = canViewDietary && dietaryRaw ? dietaryRaw : null

    const addOns = Array.isArray(doc.desiredAddOns)
      ? doc.desiredAddOns.filter((v) => typeof v === 'string')
      : []

    return {
      id: asId(doc.id),
      title: doc.eventTitle || 'Hospitality inquiry',
      status: doc.status || 'newLead',
      statusLabel: statusLabel(doc.status),
      priority: doc.priorityLevel || 'standard',
      priorityLabel:
        INQUIRY_PRIORITY_LABELS[(doc.priorityLevel as InquiryPriorityValue) || 'standard'] ||
        doc.priorityLevel ||
        '—',
      sourceLabel: sourceLabel(doc.leadSource),
      occasionLabel: occasionLabel(doc.occasion),
      receivedLabel: formatShortDate(doc.createdAt),
      eventDateLabel: doc.eventDate ? formatShortDate(doc.eventDate) : null,
      guestCount: typeof doc.guestCount === 'number' ? doc.guestCount : null,
      locationLabel: doc.locationType
        ? INQUIRY_LOCATION_LABELS[doc.locationType] || doc.locationType
        : null,
      preferredRegion: doc.preferredRegion?.trim() || null,
      budgetLabel: doc.budgetRange
        ? INQUIRY_BUDGET_LABELS[doc.budgetRange] || doc.budgetRange
        : null,
      experienceVision: doc.experienceVision?.trim() || null,
      addOns,
      client,
      clientOsHref: client.id ? `/os/clients/${client.id}` : null,
      dietaryNotes: dietary,
      canEditOperational: canEdit,
      canViewDietary: Boolean(dietary),
      adminHref: `/admin/collections/inquiries/${doc.id}`,
      statusHookNote:
        'Setting status to “New lead” while a vision is present will advance to “Discovery needed” via the collection hook.',
    }
  } catch (err) {
    const status =
      err && typeof err === 'object' && 'status' in err
        ? (err as { status?: number }).status
        : undefined
    if (status !== 404) {
      console.error('[os/inquiries] detail', err)
    }
    return null
  }
}

export function buildInquiryListHref(params: {
  pipeline?: string
  source?: string | null
  occasion?: string | null
  q?: string
  sort?: string
  page?: number
}): string {
  const sp = new URLSearchParams()
  if (params.pipeline && params.pipeline !== 'open') sp.set('pipeline', params.pipeline)
  if (params.source) sp.set('source', params.source)
  if (params.occasion) sp.set('occasion', params.occasion)
  if (params.q) sp.set('q', params.q)
  if (params.sort && params.sort !== 'newest') sp.set('sort', params.sort)
  if (params.page && params.page > 1) sp.set('page', String(params.page))
  const qs = sp.toString()
  return qs ? `/os/inquiries?${qs}` : '/os/inquiries'
}

export function assertInquiryStatus(value: unknown): InquiryStatusValue | null {
  return typeof value === 'string' && isInquiryStatus(value) ? value : null
}

export function assertInquiryPriority(value: unknown): InquiryPriorityValue | null {
  return typeof value === 'string' && isInquiryPriority(value) ? value : null
}
