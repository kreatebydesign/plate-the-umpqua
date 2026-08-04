import { getPayload } from 'payload'
import config from '../../../payload.config'
import {
  buildInvoiceDocumentModel,
  type InvoiceDocumentModel,
} from './invoiceDocumentModel'
import { hashInvoiceToken, normalizeInvoiceTokenParam } from './invoiceToken'

/** @deprecated Prefer InvoiceDocumentModel — kept for verify script imports. */
export type PublicInvoiceView = InvoiceDocumentModel

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

type LookupState = 'invalid' | 'voided' | 'valid'

async function loadInvoiceByToken(token: string) {
  const payload = await getPayload({ config })
  const hash = hashInvoiceToken(token)

  const found = await payload.find({
    collection: 'invoices',
    where: { publicTokenHash: { equals: hash } },
    limit: 1,
    depth: 2,
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
      square: true,
      // intentionally omit internalNotes
    },
  })

  return { payload, doc: found.docs[0] || null }
}

function toDocumentModel(doc: NonNullable<Awaited<ReturnType<typeof loadInvoiceByToken>>['doc']>) {
  const squareUrl =
    doc.square && typeof doc.square === 'object' && 'paymentLinkUrl' in doc.square
      ? String((doc.square as { paymentLinkUrl?: string | null }).paymentLinkUrl || '') || null
      : null

  return buildInvoiceDocumentModel({
    invoiceNumber: doc.invoiceNumber,
    status: String(doc.status || ''),
    issueDate: doc.issueDate,
    dueDate: doc.dueDate,
    paymentTerms: doc.paymentTerms,
    paymentTermsCustom: doc.paymentTermsCustom,
    billing: doc.billing,
    event: doc.event as Parameters<typeof buildInvoiceDocumentModel>[0]['event'],
    lineItems: doc.lineItems,
    subtotalCents: Number(doc.subtotalCents || 0),
    creditCents: Number(doc.creditCents || 0),
    discountCents: Number(doc.discountCents || 0),
    taxCents: Number(doc.taxCents || 0),
    totalCents: Number(doc.totalCents || 0),
    amountPaidCents: Number(doc.amountPaidCents || 0),
    balanceDueCents: Number(doc.balanceDueCents || 0),
    depositRequiredCents: Number(doc.depositRequiredCents || 0),
    clientMemo: doc.clientMemo,
    squarePaymentUrl: squareUrl,
  })
}

/**
 * Resolve a public invoice document without marking viewed.
 * Use for PDF/print helpers when the caller controls view tracking separately.
 */
export async function getPublicInvoiceDocument(
  rawToken: string,
): Promise<{ state: LookupState; view: InvoiceDocumentModel | null; id: string | null }> {
  const token = normalizeInvoiceTokenParam(rawToken)
  if (!token) return { state: 'invalid', view: null, id: null }

  const { doc } = await loadInvoiceByToken(token)
  if (!doc) return { state: 'invalid', view: null, id: null }
  if (doc.publicTokenRevokedAt) return { state: 'invalid', view: null, id: null }
  if (doc.voidedAt || doc.status === 'voided') {
    return { state: 'voided', view: null, id: String(doc.id) }
  }

  const view = toDocumentModel(doc)
  assertPublicProjectionSafe(view)
  return { state: 'valid', view, id: String(doc.id) }
}

export async function lookupPublicInvoice(
  rawToken: string,
): Promise<{ state: LookupState; view: InvoiceDocumentModel | null; id: string | null }> {
  const token = normalizeInvoiceTokenParam(rawToken)
  if (!token) return { state: 'invalid', view: null, id: null }

  const { payload, doc } = await loadInvoiceByToken(token)
  if (!doc) return { state: 'invalid', view: null, id: null }
  if (doc.publicTokenRevokedAt) return { state: 'invalid', view: null, id: null }
  if (doc.voidedAt || doc.status === 'voided') {
    return { state: 'voided', view: null, id: String(doc.id) }
  }

  const view = toDocumentModel(doc)
  assertPublicProjectionSafe(view)

  // Mark viewed only from the interactive public surface.
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
  if (serialized.includes('internalNotes')) {
    throw new Error('Public invoice projection leaked internalNotes')
  }
  // Logo / graphic mark paths must never appear in client document data.
  if (
    serialized.includes('/logo') ||
    serialized.includes('logo.png') ||
    serialized.includes('logo.svg')
  ) {
    throw new Error('Public invoice projection must not include logo assets')
  }
}
