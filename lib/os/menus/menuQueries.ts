import type { User } from '@/payload-types'
import { getPayload, type Where } from 'payload'
import config from '../../../payload.config'
import { asPlateUser, canWriteCulinary } from '@/lib/access/roles'
import {
  clampMenuLimit,
  clampMenuPage,
  isMenuListView,
  isMenuSort,
  isMenuStatus,
  isOsDocumentId,
  menuStatusLabel,
  menuViewStatuses,
  normalizeMenuSearch,
  type MenuListView,
  type MenuSortValue,
} from './menuConstants'

export type MenuListRow = {
  id: string
  internalName: string
  occasionTitle: string
  clientName: string | null
  clientHref: string | null
  statusLabel: string
  version: number
  serviceDateLabel: string
  updatedLabel: string
  href: string
}

export type MenuListResult = {
  rows: MenuListRow[]
  totalDocs: number
  page: number
  totalPages: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
  filters: {
    view: MenuListView
    status: string | null
    q: string
    sort: MenuSortValue
  }
  counts: {
    total: number | null
    draft: number | null
    inReview: number | null
    approved: number | null
  }
  errors: string[]
  canWrite: boolean
  canManageInAdmin: boolean
}

export type MenuItemDetail = {
  id?: string | null
  recipeId: string | null
  recipeName: string | null
  clientTitle: string
  clientDescription: string | null
  showDietary: boolean
  dietaryDisplay: string | null
  allergenDisplay: string | null
  internalItemNotes: string | null
}

export type MenuSectionDetail = {
  id?: string | null
  sectionName: string
  items: MenuItemDetail[]
}

export type MenuReviewRow = {
  action: string
  comment: string | null
  submittedAt: string | null
  menuVersion: number | null
}

export type MenuDetail = {
  id: string
  internalName: string
  clientId: string | null
  clientName: string | null
  clientEmail: string | null
  clientHref: string | null
  inquiryId: string | null
  inquiryTitle: string | null
  inquiryHref: string | null
  eventId: string | null
  eventName: string | null
  eventHref: string | null
  occasionTitle: string
  serviceDate: string | null
  serviceDateLabel: string
  guestCount: number | null
  introductoryMessage: string | null
  sections: MenuSectionDetail[]
  pricingPresentation: string | null
  displayInvestment: number | null
  internalNotes: string | null
  status: string
  statusLabel: string
  version: number
  sentAt: string | null
  approvedAt: string | null
  hasActiveReviewLink: boolean
  reviewExpiresLabel: string | null
  reviewRevoked: boolean
  reviews: MenuReviewRow[]
  revisionCount: number
  createdAt: string | null
  updatedAt: string | null
  canWrite: boolean
  canManageInAdmin: boolean
}

function asId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

function formatShort(value?: string | null) {
  if (!value) return '—'
  const ms = Date.parse(value)
  if (!Number.isFinite(ms)) return '—'
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(ms))
  } catch {
    return '—'
  }
}

function authorizedRel(
  value: unknown,
  nameKey: string,
): { id: string; name: string } | null {
  if (!value || typeof value !== 'object' || !('id' in value)) return null
  const id = (value as { id?: string | number }).id
  if (id == null || id === '') return null
  const name = (value as Record<string, unknown>)[nameKey]
  return {
    id: String(id),
    name: typeof name === 'string' && name.trim() ? name.trim() : '—',
  }
}

function relIdOnly(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: string | number }).id
    return id == null ? null : String(id)
  }
  return null
}

export async function listMenus(
  user: User,
  raw: {
    view?: string | null
    status?: string | null
    q?: string | null
    sort?: string | null
    page?: string | null
    limit?: string | null
  },
): Promise<MenuListResult> {
  const payload = await getPayload({ config })
  const shared = { user, overrideAccess: false as const }
  const view = isMenuListView(raw.view || '') ? raw.view! : 'all'
  const status = raw.status && isMenuStatus(raw.status) ? raw.status : null
  const q = normalizeMenuSearch(raw.q)
  const sort: MenuSortValue = isMenuSort(raw.sort || '')
    ? (raw.sort as MenuSortValue)
    : 'newest'
  const page = clampMenuPage(raw.page)
  const limit = clampMenuLimit(raw.limit)

  const errors: string[] = []
  const counts: MenuListResult['counts'] = {
    total: null,
    draft: null,
    inReview: null,
    approved: null,
  }

  try {
    const [total, draft, inReview, approved] = await Promise.all([
      payload.count({ collection: 'menus', ...shared }),
      payload.count({
        collection: 'menus',
        ...shared,
        where: { status: { in: ['draft', 'readyForReview'] } },
      }),
      payload.count({
        collection: 'menus',
        ...shared,
        where: { status: { in: ['sent', 'revisionRequested'] } },
      }),
      payload.count({
        collection: 'menus',
        ...shared,
        where: { status: { equals: 'approved' } },
      }),
    ])
    counts.total = total.totalDocs
    counts.draft = draft.totalDocs
    counts.inReview = inReview.totalDocs
    counts.approved = approved.totalDocs
  } catch (err) {
    console.error('[os/menus] counts', err)
    errors.push('Unable to load menu counts.')
  }

  const and: Where[] = []
  const viewStatuses = menuViewStatuses(view as MenuListView)
  if (viewStatuses) and.push({ status: { in: [...viewStatuses] } })
  if (status) and.push({ status: { equals: status } })
  if (q) {
    and.push({
      or: [
        { internalName: { contains: q } },
        { occasionTitle: { contains: q } },
      ],
    })
  }

  const sortMap: Record<MenuSortValue, string> = {
    newest: '-updatedAt',
    oldest: 'updatedAt',
    serviceDate: 'serviceDate',
  }

  let rows: MenuListRow[] = []
  let totalDocs = 0
  let totalPages = 1
  let hasNextPage = false
  let hasPrevPage = false

  try {
    const result = await payload.find({
      collection: 'menus',
      ...shared,
      where: and.length ? { and } : undefined,
      sort: sortMap[sort],
      page,
      limit,
      depth: 1,
      select: {
        internalName: true,
        occasionTitle: true,
        client: true,
        status: true,
        version: true,
        serviceDate: true,
        updatedAt: true,
      },
    })

    totalDocs = result.totalDocs
    totalPages = result.totalPages
    hasNextPage = result.hasNextPage
    hasPrevPage = result.hasPrevPage

    rows = result.docs.map((doc) => {
      const client = authorizedRel(doc.client, 'fullName')
      return {
        id: asId(doc.id),
        internalName: doc.internalName?.trim() || 'Untitled menu',
        occasionTitle: doc.occasionTitle?.trim() || '—',
        clientName: client?.name || null,
        clientHref: client ? `/os/clients/${client.id}` : null,
        statusLabel: menuStatusLabel(doc.status),
        version: typeof doc.version === 'number' ? doc.version : 1,
        serviceDateLabel: formatShort(doc.serviceDate),
        updatedLabel: formatShort(doc.updatedAt),
        href: `/os/menus/${doc.id}`,
      }
    })
  } catch (err) {
    console.error('[os/menus] list', err)
    errors.push('Unable to load menus.')
  }

  return {
    rows,
    totalDocs,
    page,
    totalPages,
    limit,
    hasNextPage,
    hasPrevPage,
    filters: { view: view as MenuListView, status, q, sort },
    counts,
    errors,
    canWrite: canWriteCulinary(asPlateUser(user)),
    canManageInAdmin: canWriteCulinary(asPlateUser(user)),
  }
}

export async function getMenuDetail(
  user: User,
  rawId: string,
): Promise<MenuDetail | null> {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) return null

  const payload = await getPayload({ config })

  try {
    const doc = await payload.findByID({
      collection: 'menus',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 1,
    })

    const client = authorizedRel(doc.client, 'fullName')
    const clientEmail =
      doc.client &&
      typeof doc.client === 'object' &&
      typeof (doc.client as { email?: string }).email === 'string'
        ? (doc.client as { email: string }).email.trim() || null
        : null

    const inquiry = authorizedRel(doc.inquiry, 'eventTitle')
    const event = authorizedRel(doc.event, 'eventName')

    const now = Date.now()
    const expiresMs = doc.reviewTokenExpiresAt
      ? Date.parse(doc.reviewTokenExpiresAt)
      : NaN
    const hasActiveReviewLink = Boolean(
      doc.reviewTokenHash &&
        !doc.reviewTokenRevokedAt &&
        Number.isFinite(expiresMs) &&
        expiresMs > now,
    )

    return {
      id: asId(doc.id),
      internalName: doc.internalName?.trim() || 'Untitled menu',
      clientId: client?.id || relIdOnly(doc.client),
      clientName: client?.name || null,
      clientEmail,
      clientHref: client ? `/os/clients/${client.id}` : null,
      inquiryId: inquiry?.id || relIdOnly(doc.inquiry),
      inquiryTitle: inquiry?.name || null,
      inquiryHref: inquiry ? `/os/inquiries/${inquiry.id}` : null,
      eventId: event?.id || relIdOnly(doc.event),
      eventName: event?.name || null,
      eventHref: event ? `/os/events/${event.id}` : null,
      occasionTitle: doc.occasionTitle?.trim() || 'Private dining menu',
      serviceDate: doc.serviceDate || null,
      serviceDateLabel: formatShort(doc.serviceDate),
      guestCount: typeof doc.guestCount === 'number' ? doc.guestCount : null,
      introductoryMessage: doc.introductoryMessage?.trim() || null,
      sections: (doc.sections || []).map((section) => ({
        id: section.id || null,
        sectionName: section.sectionName?.trim() || 'Section',
        items: (section.items || []).map((item) => {
          const recipe =
            item.recipe && typeof item.recipe === 'object'
              ? {
                  id: String((item.recipe as { id: string | number }).id),
                  name:
                    typeof (item.recipe as { name?: string }).name === 'string'
                      ? (item.recipe as { name: string }).name.trim()
                      : null,
                }
              : item.recipe
                ? { id: String(item.recipe), name: null }
                : null
          return {
            id: item.id || null,
            recipeId: recipe?.id || null,
            recipeName: recipe?.name || null,
            clientTitle: item.clientTitle?.trim() || '',
            clientDescription: item.clientDescription?.trim() || null,
            showDietary: Boolean(item.showDietary),
            dietaryDisplay: item.dietaryDisplay?.trim() || null,
            allergenDisplay: item.allergenDisplay?.trim() || null,
            internalItemNotes: item.internalItemNotes?.trim() || null,
          }
        }),
      })),
      pricingPresentation: doc.pricingPresentation?.trim() || null,
      displayInvestment:
        typeof doc.displayInvestment === 'number'
          ? doc.displayInvestment
          : null,
      internalNotes: doc.internalNotes?.trim() || null,
      status: doc.status || 'draft',
      statusLabel: menuStatusLabel(doc.status),
      version: typeof doc.version === 'number' ? doc.version : 1,
      sentAt: doc.sentAt || null,
      approvedAt: doc.approvedAt || null,
      hasActiveReviewLink,
      reviewExpiresLabel: formatShort(doc.reviewTokenExpiresAt),
      reviewRevoked: Boolean(doc.reviewTokenRevokedAt),
      reviews: (doc.reviews || [])
        .slice()
        .reverse()
        .slice(0, 20)
        .map((row) => ({
          action: row.action,
          comment: row.comment?.trim() || null,
          submittedAt: row.submittedAt || null,
          menuVersion:
            typeof row.menuVersion === 'number' ? row.menuVersion : null,
        })),
      revisionCount: Array.isArray(doc.revisionHistory)
        ? doc.revisionHistory.length
        : 0,
      createdAt: doc.createdAt || null,
      updatedAt: doc.updatedAt || null,
      canWrite: canWriteCulinary(asPlateUser(user)),
      canManageInAdmin: canWriteCulinary(asPlateUser(user)),
    }
  } catch (err) {
    console.error('[os/menus] detail', err)
    return null
  }
}

export async function listClientOptions(
  user: User,
  q?: string | null,
): Promise<Array<{ id: string; label: string; name: string; email: string | null }>> {
  const payload = await getPayload({ config })
  const search = normalizeMenuSearch(q)
  const where: Where | undefined = search
    ? {
        or: [
          { fullName: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : undefined

  try {
    const result = await payload.find({
      collection: 'clients',
      user,
      overrideAccess: false,
      where,
      sort: 'fullName',
      limit: 40,
      depth: 0,
      select: { fullName: true, email: true },
    })
    return result.docs.map((doc) => {
      const name = doc.fullName?.trim() || 'Client'
      const email = doc.email?.trim() || null
      return {
        id: asId(doc.id),
        name,
        email,
        label: email ? `${name} · ${email}` : name,
      }
    })
  } catch (err) {
    console.error('[os/menus] client options', err)
    return []
  }
}

export async function listInquiryOptions(
  user: User,
  options?: { q?: string | null; clientId?: string | null },
): Promise<Array<{ id: string; label: string }>> {
  const payload = await getPayload({ config })
  const search = normalizeMenuSearch(options?.q)
  const clientId =
    options?.clientId && isOsDocumentId(options.clientId)
      ? options.clientId
      : null

  const and: Where[] = []
  if (clientId) and.push({ client: { equals: clientId } })
  if (search) {
    and.push({
      or: [
        { eventTitle: { contains: search } },
        { preferredRegion: { contains: search } },
      ],
    })
  }

  try {
    const result = await payload.find({
      collection: 'inquiries',
      user,
      overrideAccess: false,
      where: and.length ? { and } : undefined,
      sort: '-updatedAt',
      limit: 40,
      depth: 1,
      select: {
        eventTitle: true,
        eventDate: true,
        status: true,
        client: true,
      },
    })

    return result.docs.map((doc) => {
      const client = authorizedRel(doc.client, 'fullName')
      const title = doc.eventTitle?.trim() || 'Hospitality inquiry'
      const dateLabel = formatShort(doc.eventDate)
      const parts = [
        title,
        client?.name || null,
        dateLabel !== '—' ? dateLabel : null,
      ].filter(Boolean)
      return {
        id: asId(doc.id),
        label: parts.join(' · '),
      }
    })
  } catch (err) {
    console.error('[os/menus] inquiry options', err)
    return []
  }
}

export async function listEventOptions(
  user: User,
  options?: { q?: string | null; clientId?: string | null },
): Promise<Array<{ id: string; label: string }>> {
  const payload = await getPayload({ config })
  const search = normalizeMenuSearch(options?.q)
  const clientId =
    options?.clientId && isOsDocumentId(options.clientId)
      ? options.clientId
      : null

  const and: Where[] = []
  if (clientId) and.push({ client: { equals: clientId } })
  if (search) {
    and.push({ eventName: { contains: search } })
  }

  try {
    const result = await payload.find({
      collection: 'events',
      user,
      overrideAccess: false,
      where: and.length ? { and } : undefined,
      sort: '-eventDate',
      limit: 40,
      depth: 1,
      select: {
        eventName: true,
        eventDate: true,
        eventStatus: true,
        client: true,
      },
    })

    return result.docs.map((doc) => {
      const client = authorizedRel(doc.client, 'fullName')
      const name = doc.eventName?.trim() || 'Event'
      const dateLabel = formatShort(doc.eventDate)
      const parts = [
        name,
        dateLabel !== '—' ? dateLabel : null,
        client?.name || null,
      ].filter(Boolean)
      return {
        id: asId(doc.id),
        label: parts.join(' · '),
      }
    })
  } catch (err) {
    console.error('[os/menus] event options', err)
    return []
  }
}

/**
 * Ensure a currently selected relationship remains available in the picker
 * even when it falls outside the default bounded option list.
 */
export async function ensureRelationshipOption(
  user: User,
  collection: 'clients' | 'inquiries' | 'events',
  id: string | null | undefined,
): Promise<{ id: string; label: string } | null> {
  if (!id || !isOsDocumentId(id)) return null

  try {
    const payload = await getPayload({ config })
    if (collection === 'clients') {
      const doc = await payload.findByID({
        collection: 'clients',
        id,
        user,
        overrideAccess: false,
        depth: 0,
        select: { fullName: true, email: true },
      })
      const name = doc.fullName?.trim() || 'Client'
      const email = doc.email?.trim()
      return {
        id: asId(doc.id),
        label: email ? `${name} · ${email}` : name,
      }
    }

    if (collection === 'inquiries') {
      const doc = await payload.findByID({
        collection: 'inquiries',
        id,
        user,
        overrideAccess: false,
        depth: 1,
        select: { eventTitle: true, eventDate: true, client: true },
      })
      const client = authorizedRel(doc.client, 'fullName')
      const title = doc.eventTitle?.trim() || 'Hospitality inquiry'
      const dateLabel = formatShort(doc.eventDate)
      return {
        id: asId(doc.id),
        label: [title, client?.name, dateLabel !== '—' ? dateLabel : null]
          .filter(Boolean)
          .join(' · '),
      }
    }

    const doc = await payload.findByID({
      collection: 'events',
      id,
      user,
      overrideAccess: false,
      depth: 1,
      select: { eventName: true, eventDate: true, client: true },
    })
    const client = authorizedRel(doc.client, 'fullName')
    const name = doc.eventName?.trim() || 'Event'
    const dateLabel = formatShort(doc.eventDate)
    return {
      id: asId(doc.id),
      label: [name, dateLabel !== '—' ? dateLabel : null, client?.name]
        .filter(Boolean)
        .join(' · '),
    }
  } catch (err) {
    console.error('[os/menus] ensure relationship', err)
    return null
  }
}
