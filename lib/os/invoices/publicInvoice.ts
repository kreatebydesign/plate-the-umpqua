import { getPayload } from 'payload'
import config from '../../../payload.config'
import { formatShortDate } from '../formatDate'
import { formatUsdFromCents } from './money'
import {
  BILLING_TYPE_LABELS,
  PLATE_INVOICE_BUSINESS,
  paymentTermsLabel,
  type BillingTypeValue,
} from './invoiceConstants'
import { hashInvoiceToken, normalizeInvoiceTokenParam } from './invoiceToken'

export type PublicInvoiceLine = {
  description: string
  detail: string | null
  billingTypeLabel: string
  quantity: number
  unitPriceLabel: string
  lineTotalLabel: string
  isCredit: boolean
}

export type PublicInvoiceView = {
  invoiceNumber: string
  status: string
  issueDateLabel: string
  dueDateLabel: string
  paymentTermsLabel: string
  billTo: {
    name: string
    email: string
    phone: string | null
    company: string | null
  }
  event: {
    name: string | null
    dateLabel: string | null
  }
  lines: PublicInvoiceLine[]
  subtotalLabel: string
  creditLabel: string
  discountLabel: string
  taxLabel: string
  totalLabel: string
  amountPaidLabel: string
  balanceDueLabel: string
  depositRequiredLabel: string | null
  clientMemo: string | null
  business: typeof PLATE_INVOICE_BUSINESS
  voided: boolean
}

/** Fields that must never appear in a public invoice projection. */
export const PUBLIC_INVOICE_FORBIDDEN_KEYS = [
  'internalNotes',
  'publicTokenHash',
  'publicTokenPlaintextOnce',
  'voidedBy',
  'createdBy',
  'updatedBy',
  'lastSendError',
  'square',
  'recordedBy',
] as const

export async function lookupPublicInvoice(
  rawToken: string,
): Promise<{ state: 'invalid' | 'voided' | 'valid'; view: PublicInvoiceView | null; id: string | null }> {
  const token = normalizeInvoiceTokenParam(rawToken)
  if (!token) return { state: 'invalid', view: null, id: null }

  const payload = await getPayload({ config })
  const hash = hashInvoiceToken(token)

  const found = await payload.find({
    collection: 'invoices',
    where: { publicTokenHash: { equals: hash } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
    select: {
      invoiceNumber: true,
      status: true,
      issueDate: true,
      dueDate: true,
      paymentTerms: true,
      paymentTermsCustom: true,
      billing: true,
      event: true,
      lineItems: true,
      subtotalCents: true,
      creditCents: true,
      discountCents: true,
      taxCents: true,
      totalCents: true,
      amountPaidCents: true,
      balanceDueCents: true,
      depositRequiredCents: true,
      clientMemo: true,
      voidedAt: true,
      publicTokenRevokedAt: true,
      firstViewedAt: true,
      // intentionally omit internalNotes and square
    },
  })

  const doc = found.docs[0]
  if (!doc) return { state: 'invalid', view: null, id: null }

  if (doc.publicTokenRevokedAt) {
    return { state: 'invalid', view: null, id: null }
  }

  if (doc.voidedAt || doc.status === 'voided') {
    return { state: 'voided', view: null, id: String(doc.id) }
  }

  const eventRel = doc.event
  const eventName =
    eventRel && typeof eventRel === 'object' && 'eventName' in eventRel
      ? String((eventRel as { eventName?: string }).eventName || '') || null
      : null
  const eventDate =
    eventRel && typeof eventRel === 'object' && 'eventDate' in eventRel
      ? (eventRel as { eventDate?: string }).eventDate
      : null

  const lines = (doc.lineItems || []).map((line) => {
    const billingType = (line.billingType || 'flat') as BillingTypeValue
    return {
      description: line.description || 'Line item',
      detail: line.detail?.trim() || null,
      billingTypeLabel: BILLING_TYPE_LABELS[billingType] || billingType,
      quantity: Number(line.quantity || 0),
      unitPriceLabel: formatUsdFromCents(Number(line.unitPriceCents || 0)),
      lineTotalLabel: formatUsdFromCents(Number(line.lineTotalCents || 0)),
      isCredit: Boolean(line.isCredit),
    }
  })

  const view: PublicInvoiceView = {
    invoiceNumber: doc.invoiceNumber,
    status: String(doc.status || ''),
    issueDateLabel: formatShortDate(doc.issueDate),
    dueDateLabel: formatShortDate(doc.dueDate),
    paymentTermsLabel: paymentTermsLabel(doc.paymentTerms, doc.paymentTermsCustom),
    billTo: {
      name: doc.billing?.name || '—',
      email: doc.billing?.email || '—',
      phone: doc.billing?.phone || null,
      company: doc.billing?.company || null,
    },
    event: {
      name: eventName,
      dateLabel: eventDate ? formatShortDate(eventDate) : null,
    },
    lines,
    subtotalLabel: formatUsdFromCents(Number(doc.subtotalCents || 0)),
    creditLabel: formatUsdFromCents(Number(doc.creditCents || 0)),
    discountLabel: formatUsdFromCents(Number(doc.discountCents || 0)),
    taxLabel: formatUsdFromCents(Number(doc.taxCents || 0)),
    totalLabel: formatUsdFromCents(Number(doc.totalCents || 0)),
    amountPaidLabel: formatUsdFromCents(Number(doc.amountPaidCents || 0)),
    balanceDueLabel: formatUsdFromCents(Number(doc.balanceDueCents || 0)),
    depositRequiredLabel:
      Number(doc.depositRequiredCents || 0) > 0
        ? formatUsdFromCents(Number(doc.depositRequiredCents || 0))
        : null,
    clientMemo: doc.clientMemo?.trim() || null,
    business: PLATE_INVOICE_BUSINESS,
    voided: false,
  }

  // Mark viewed only from the public surface.
  const now = new Date().toISOString()
  const patch: Record<string, unknown> = { lastViewedAt: now }
  if (!doc.firstViewedAt) {
    patch.firstViewedAt = now
    if (doc.status === 'sent' || doc.status === 'draft') {
      patch.status = 'viewed'
    }
  }
  await payload.update({
    collection: 'invoices',
    id: doc.id,
    data: patch,
    overrideAccess: true,
    depth: 0,
  })

  return { state: 'valid', view, id: String(doc.id) }
}

export function assertPublicProjectionSafe(view: unknown): void {
  const serialized = JSON.stringify(view)
  for (const key of PUBLIC_INVOICE_FORBIDDEN_KEYS) {
    if (serialized.includes(`"${key}"`)) {
      throw new Error(`Public invoice projection leaked ${key}`)
    }
  }
}
