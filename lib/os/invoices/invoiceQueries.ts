import { getPayload } from 'payload'
import type { Where } from 'payload'
import config from '../../../payload.config'
import type { User } from '@/payload-types'
import { canWriteOperational, asPlateUser } from '@/lib/access/roles'
import { formatShortDate } from '../formatDate'
import { formatUsdFromCents } from './money'
import { deriveInvoiceStatus } from './invoiceStatus'
import {
  INVOICE_PAGE_SIZE_DEFAULT,
  INVOICE_PAGE_SIZE_MAX,
  INVOICE_SEARCH_MAX,
  INVOICE_STATUS_LABELS,
  INVOICE_SORT_OPTIONS,
  type InvoiceSortValue,
  type InvoiceStatusValue,
  isInvoiceSort,
  isInvoiceStatus,
  paymentTermsLabel,
} from './invoiceConstants'
import { getSquareConnectionState } from './squareAdapter'
import { publicInvoiceUrl } from './invoiceToken'
import {
  partnerIndustryLabel,
  isPartnerIndustrySlug,
} from '@/lib/os/partnerConcierge/packages'

export type InvoiceListParams = {
  status?: string | null
  q?: string | null
  sort?: string | null
  page?: string | null
  limit?: string | null
}

export type InvoiceListRow = {
  id: string
  invoiceNumber: string
  clientName: string | null
  eventName: string | null
  issueDateLabel: string
  dueDateLabel: string
  totalLabel: string
  amountPaidLabel: string
  balanceDueLabel: string
  status: string
  statusLabel: string
  partnerConciergeLabel: string | null
  href: string
}

export type InvoiceListResult = {
  rows: InvoiceListRow[]
  page: number
  totalPages: number
  totalDocs: number
  limit: number
  filters: {
    status: InvoiceStatusValue | 'all'
    q: string
    sort: InvoiceSortValue
  }
  counts: Record<string, number | null>
  errors: string[]
  canManage: boolean
}

export type InvoicePaymentRow = {
  id: string
  amountLabel: string
  paidAtLabel: string
  methodLabel: string
  reference: string | null
}

export type InvoiceDetail = {
  id: string
  invoiceNumber: string
  status: InvoiceStatusValue | string
  statusLabel: string
  clientId: string | null
  clientName: string | null
  eventId: string | null
  eventName: string | null
  issueDate: string
  dueDate: string
  issueDateLabel: string
  dueDateLabel: string
  paymentTerms: string
  paymentTermsCustom: string | null
  paymentTermsLabel: string
  billing: {
    name: string
    email: string
    phone: string | null
    company: string | null
  }
  lineItems: Array<{
    itemKey: string
    sortOrder: number
    description: string
    detail: string | null
    billingType: string
    quantity: number
    unitPriceCents: number
    isCredit: boolean
    lineTotalCents: number
    lineTotalLabel: string
  }>
  discountType: string
  discountValue: number
  taxRateBps: number
  depositRequiredCents: number
  subtotalCents: number
  creditCents: number
  discountCents: number
  taxCents: number
  totalCents: number
  amountPaidCents: number
  balanceDueCents: number
  subtotalLabel: string
  creditLabel: string
  discountLabel: string
  taxLabel: string
  totalLabel: string
  amountPaidLabel: string
  balanceDueLabel: string
  depositRequiredLabel: string
  clientMemo: string | null
  internalNotes: string | null
  payments: InvoicePaymentRow[]
  publicLink: string | null
  hasPublicToken: boolean
  canEdit: boolean
  canRecordPayment: boolean
  canManage: boolean
  squareState: 'not_connected' | 'connected' | 'error' | 'disconnected'
  squareInvoiceId: string | null
  squarePublicUrl: string | null
  squareStatus: string | null
  squareLastSyncedAt: string | null
  squareLastError: string | null
  adminHref: string
  sentAtLabel: string | null
  firstViewedAtLabel: string | null
  voidedAtLabel: string | null
  voidReason: string | null
  partnerConcierge: {
    isPartnerPurchase: boolean
    industryLabel: string | null
    packageTitle: string | null
    experienceCount: number | null
    summaryLabel: string | null
  } | null
}

function asId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return ''
}

function partnerConciergeListLabel(doc: {
  partnerConcierge?: {
    isPartnerPurchase?: boolean | null
    industrySlug?: string | null
    packageTitle?: string | null
  } | null
}): string | null {
  const partner = doc.partnerConcierge
  if (!partner?.isPartnerPurchase) return null
  const industry = isPartnerIndustrySlug(partner.industrySlug)
    ? partnerIndustryLabel(partner.industrySlug)
    : null
  const parts = ['Partner Concierge', industry, partner.packageTitle].filter(Boolean)
  return parts.length > 1 ? parts.join(' · ') : 'Partner Concierge'
}

function relName(value: unknown, field: string): string | null {
  if (!value || typeof value !== 'object') return null
  const v = (value as Record<string, unknown>)[field]
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

function sanitizeSearch(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, INVOICE_SEARCH_MAX)
}

function parsePage(raw: string | null | undefined): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.floor(n)
}

function parseLimit(raw: string | null | undefined): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return INVOICE_PAGE_SIZE_DEFAULT
  return Math.min(INVOICE_PAGE_SIZE_MAX, Math.floor(n))
}

function sortField(sort: InvoiceSortValue): string {
  switch (sort) {
    case 'oldest':
      return 'createdAt'
    case 'dueSoonest':
      return 'dueDate'
    case 'amountHigh':
      return '-totalCents'
    default:
      return '-createdAt'
  }
}

export async function listInvoices(
  user: User,
  params: InvoiceListParams = {},
): Promise<InvoiceListResult> {
  const payload = await getPayload({ config })
  const statusFilter: InvoiceStatusValue | 'all' =
    params.status && isInvoiceStatus(params.status) ? params.status : 'all'
  const sort: InvoiceSortValue = isInvoiceSort(params.sort || '')
    ? (params.sort as InvoiceSortValue)
    : 'newest'
  const q = sanitizeSearch(params.q)
  const page = parsePage(params.page)
  const limit = parseLimit(params.limit)
  const errors: string[] = []
  const shared = { user, overrideAccess: false as const }

  const counts: Record<string, number | null> = {
    all: null,
    draft: null,
    sent: null,
    overdue: null,
    paid: null,
  }

  try {
    const [all, draft, sent, overdue, paid] = await Promise.all([
      payload.count({ collection: 'invoices', ...shared }),
      payload.count({
        collection: 'invoices',
        ...shared,
        where: { status: { equals: 'draft' } },
      }),
      payload.count({
        collection: 'invoices',
        ...shared,
        where: { status: { equals: 'sent' } },
      }),
      payload.count({
        collection: 'invoices',
        ...shared,
        where: { status: { equals: 'overdue' } },
      }),
      payload.count({
        collection: 'invoices',
        ...shared,
        where: { status: { equals: 'paid' } },
      }),
    ])
    counts.all = all.totalDocs
    counts.draft = draft.totalDocs
    counts.sent = sent.totalDocs
    counts.overdue = overdue.totalDocs
    counts.paid = paid.totalDocs
  } catch (err) {
    console.error('[os/invoices] counts', err)
    errors.push('Invoice counts could not be loaded.')
  }

  let clientIds: string[] = []
  if (q) {
    try {
      const clients = await payload.find({
        collection: 'clients',
        ...shared,
        limit: 40,
        depth: 0,
        where: {
          or: [
            { fullName: { contains: q } },
            { email: { contains: q } },
          ],
        },
        select: { fullName: true },
      })
      clientIds = clients.docs.map((d) => String(d.id))
    } catch (err) {
      console.error('[os/invoices] client search', err)
    }
  }

  const and: Where[] = []
  if (statusFilter !== 'all') {
    and.push({ status: { equals: statusFilter } })
  }
  if (q) {
    const or: Where[] = [
      { invoiceNumber: { contains: q } },
      { 'billing.name': { contains: q } },
      { 'billing.email': { contains: q } },
    ]
    if (clientIds.length) or.push({ client: { in: clientIds } })
    and.push({ or })
  }

  let rows: InvoiceListRow[] = []
  let totalDocs = 0
  let totalPages = 1

  try {
    const result = await payload.find({
      collection: 'invoices',
      ...shared,
      depth: 1,
      page,
      limit,
      sort: sortField(sort),
      where: and.length ? { and } : undefined,
      select: {
        invoiceNumber: true,
        status: true,
        issueDate: true,
        dueDate: true,
        totalCents: true,
        amountPaidCents: true,
        balanceDueCents: true,
        voidedAt: true,
        sentAt: true,
        firstViewedAt: true,
        client: true,
        event: true,
        billing: true,
        partnerConcierge: true,
      },
    })

    totalDocs = result.totalDocs
    totalPages = Math.max(1, result.totalPages)

    rows = result.docs.map((doc) => {
      const derived = deriveInvoiceStatus({
        currentStatus: doc.status,
        voidedAt: doc.voidedAt,
        totalCents: Number(doc.totalCents || 0),
        amountPaidCents: Number(doc.amountPaidCents || 0),
        balanceDueCents: Number(doc.balanceDueCents || 0),
        dueDate: doc.dueDate,
        sentAt: doc.sentAt,
        firstViewedAt: doc.firstViewedAt,
      })
      return {
        id: asId(doc.id),
        invoiceNumber: doc.invoiceNumber,
        clientName: relName(doc.client, 'fullName') || doc.billing?.name || null,
        eventName: relName(doc.event, 'eventName'),
        issueDateLabel: formatShortDate(doc.issueDate),
        dueDateLabel: formatShortDate(doc.dueDate),
        totalLabel: formatUsdFromCents(Number(doc.totalCents || 0)),
        amountPaidLabel: formatUsdFromCents(Number(doc.amountPaidCents || 0)),
        balanceDueLabel: formatUsdFromCents(Number(doc.balanceDueCents || 0)),
        status: derived,
        statusLabel: INVOICE_STATUS_LABELS[derived],
        partnerConciergeLabel: partnerConciergeListLabel(
          doc as {
            partnerConcierge?: {
              isPartnerPurchase?: boolean | null
              industrySlug?: string | null
              packageTitle?: string | null
            } | null
          },
        ),
        href: `/os/invoices/${doc.id}`,
      }
    })
  } catch (err) {
    console.error('[os/invoices] list', err)
    errors.push('Invoices could not be loaded right now.')
  }

  return {
    rows,
    page,
    totalPages,
    totalDocs,
    limit,
    filters: { status: statusFilter, q, sort },
    counts,
    errors,
    canManage: canWriteOperational(asPlateUser(user)),
  }
}

export async function getInvoiceDetail(
  user: User,
  id: string,
): Promise<InvoiceDetail | null> {
  if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) return null

  const payload = await getPayload({ config })
  const canManage = canWriteOperational(asPlateUser(user))

  try {
    const doc = await payload.findByID({
      collection: 'invoices',
      id,
      user,
      overrideAccess: false,
      depth: 1,
    })
    if (!doc) return null

    const payments = await payload.find({
      collection: 'invoice-payments',
      user,
      overrideAccess: false,
      depth: 0,
      limit: 100,
      sort: '-paidAt',
      where: { invoice: { equals: id } },
      select: {
        amountCents: true,
        paidAt: true,
        method: true,
        reference: true,
      },
    })

    const derived = deriveInvoiceStatus({
      currentStatus: doc.status,
      voidedAt: doc.voidedAt,
      totalCents: Number(doc.totalCents || 0),
      amountPaidCents: Number(doc.amountPaidCents || 0),
      balanceDueCents: Number(doc.balanceDueCents || 0),
      dueDate: doc.dueDate,
      sentAt: doc.sentAt,
      firstViewedAt: doc.firstViewedAt,
      paymentCount: payments.totalDocs,
    })

    const plaintext = doc.publicTokenPlaintextOnce || null

    return {
      id: asId(doc.id),
      invoiceNumber: doc.invoiceNumber,
      status: derived,
      statusLabel: INVOICE_STATUS_LABELS[derived],
      clientId: asId(doc.client) || null,
      clientName: relName(doc.client, 'fullName'),
      eventId: doc.event ? asId(doc.event) : null,
      eventName: relName(doc.event, 'eventName'),
      issueDate: String(doc.issueDate || ''),
      dueDate: String(doc.dueDate || ''),
      issueDateLabel: formatShortDate(doc.issueDate),
      dueDateLabel: formatShortDate(doc.dueDate),
      paymentTerms: String(doc.paymentTerms || 'net14'),
      paymentTermsCustom: doc.paymentTermsCustom || null,
      paymentTermsLabel: paymentTermsLabel(doc.paymentTerms, doc.paymentTermsCustom),
      billing: {
        name: doc.billing?.name || '',
        email: doc.billing?.email || '',
        phone: doc.billing?.phone || null,
        company: doc.billing?.company || null,
      },
      lineItems: (doc.lineItems || []).map((line, index) => ({
        itemKey: line.itemKey || `line-${index}`,
        sortOrder: Number(line.sortOrder ?? index),
        description: line.description || '',
        detail: line.detail || null,
        billingType: line.billingType || 'flat',
        quantity: Number(line.quantity || 0),
        unitPriceCents: Number(line.unitPriceCents || 0),
        isCredit: Boolean(line.isCredit),
        lineTotalCents: Number(line.lineTotalCents || 0),
        lineTotalLabel: formatUsdFromCents(Number(line.lineTotalCents || 0)),
      })),
      discountType: String(doc.discountType || 'none'),
      discountValue: Number(doc.discountValue || 0),
      taxRateBps: Number(doc.taxRateBps || 0),
      depositRequiredCents: Number(doc.depositRequiredCents || 0),
      subtotalCents: Number(doc.subtotalCents || 0),
      creditCents: Number(doc.creditCents || 0),
      discountCents: Number(doc.discountCents || 0),
      taxCents: Number(doc.taxCents || 0),
      totalCents: Number(doc.totalCents || 0),
      amountPaidCents: Number(doc.amountPaidCents || 0),
      balanceDueCents: Number(doc.balanceDueCents || 0),
      subtotalLabel: formatUsdFromCents(Number(doc.subtotalCents || 0)),
      creditLabel: formatUsdFromCents(Number(doc.creditCents || 0)),
      discountLabel: formatUsdFromCents(Number(doc.discountCents || 0)),
      taxLabel: formatUsdFromCents(Number(doc.taxCents || 0)),
      totalLabel: formatUsdFromCents(Number(doc.totalCents || 0)),
      amountPaidLabel: formatUsdFromCents(Number(doc.amountPaidCents || 0)),
      balanceDueLabel: formatUsdFromCents(Number(doc.balanceDueCents || 0)),
      depositRequiredLabel: formatUsdFromCents(Number(doc.depositRequiredCents || 0)),
      clientMemo: doc.clientMemo || null,
      internalNotes: canManage ? doc.internalNotes || null : null,
      payments: payments.docs.map((p) => ({
        id: asId(p.id),
        amountLabel: formatUsdFromCents(Number(p.amountCents || 0)),
        paidAtLabel: formatShortDate(p.paidAt),
        methodLabel: String(p.method || 'other'),
        reference: p.reference || null,
      })),
      publicLink: plaintext ? publicInvoiceUrl(plaintext) : null,
      hasPublicToken: Boolean(doc.publicTokenHash),
      canEdit: canManage && derived !== 'voided',
      canRecordPayment: canManage && derived !== 'voided' && derived !== 'draft',
      canManage,
      squareState: await getSquareConnectionState(),
      squareInvoiceId: doc.square?.invoiceId ?? null,
      squarePublicUrl: doc.square?.publicUrl ?? doc.square?.paymentLinkUrl ?? null,
      squareStatus: doc.square?.status ?? null,
      squareLastSyncedAt: doc.square?.lastSyncedAt ?? null,
      squareLastError: doc.square?.lastError ?? null,
      adminHref: `/admin/collections/invoices/${doc.id}`,
      sentAtLabel: doc.sentAt ? formatShortDate(doc.sentAt) : null,
      firstViewedAtLabel: doc.firstViewedAt ? formatShortDate(doc.firstViewedAt) : null,
      voidedAtLabel: doc.voidedAt ? formatShortDate(doc.voidedAt) : null,
      voidReason: doc.voidReason || null,
      partnerConcierge: (() => {
        const partner = (doc as {
          partnerConcierge?: {
            isPartnerPurchase?: boolean | null
            industrySlug?: string | null
            packageTitle?: string | null
            experienceCount?: number | null
          } | null
        }).partnerConcierge
        if (!partner?.isPartnerPurchase) return null
        const industryLabel = isPartnerIndustrySlug(partner.industrySlug)
          ? partnerIndustryLabel(partner.industrySlug)
          : null
        const summaryLabel = partnerConciergeListLabel({ partnerConcierge: partner })
        return {
          isPartnerPurchase: true,
          industryLabel,
          packageTitle: partner.packageTitle ?? null,
          experienceCount: partner.experienceCount ?? null,
          summaryLabel,
        }
      })(),
    }
  } catch (err) {
    const status =
      err && typeof err === 'object' && 'status' in err
        ? (err as { status?: number }).status
        : undefined
    if (status !== 404) console.error('[os/invoices] detail', err)
    return null
  }
}

export function buildInvoiceListHref(params: {
  status?: string
  q?: string
  sort?: string
  page?: number
}): string {
  const sp = new URLSearchParams()
  if (params.status && params.status !== 'all') sp.set('status', params.status)
  if (params.q) sp.set('q', params.q)
  if (params.sort && params.sort !== 'newest') sp.set('sort', params.sort)
  if (params.page && params.page > 1) sp.set('page', String(params.page))
  const qs = sp.toString()
  return qs ? `/os/invoices?${qs}` : '/os/invoices'
}

export { INVOICE_SORT_OPTIONS }
