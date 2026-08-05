/**
 * Sync Square invoice/payment state into Plate ledger.
 * Append-only payments with squarePaymentId uniqueness.
 * Plate OS remains source of truth; Square state is reflected, not overridden.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { getPayload } from 'payload'
import config from '../../../payload.config'
import { getSquareClientWithConnection } from './client'
import { touchConnectionSyncedAt } from './connection'
import { deriveInvoiceStatus } from '@/lib/os/invoices/invoiceStatus'
import { extractCompletedSquarePaymentRequests } from './paymentRequestSync'

export type SyncResult = {
  squareStatus: string | null
  newPaymentsRecorded: number
  invoiceStatus: string
}

export type SyncSquareInvoiceOptions = {
  /** Square webhook event_id when sync is triggered by a webhook (optional audit trail). */
  webhookEventId?: string | null
}

/** Pull Square invoice state and reconcile payments into Plate ledger. */
export async function syncSquareInvoice(
  plateInvoiceId: string,
  options: SyncSquareInvoiceOptions = {},
): Promise<SyncResult> {
  const payload = await getPayload({ config })

  const invoice = await payload.findByID({
    collection: 'invoices',
    id: plateInvoiceId,
    overrideAccess: true,
    depth: 0,
  })

  const squareInvoiceId = (invoice.square as any)?.invoiceId
  if (!squareInvoiceId) {
    throw new Error('No Square invoice ID on this Plate invoice. Create one first.')
  }

  const { client, connectionId } = await getSquareClientWithConnection()

  // HttpResponsePromise<GetInvoiceResponse> resolves to GetInvoiceResponse
  const getResult = await client.invoices.get({ invoiceId: squareInvoiceId })
  const squareInvoice = (getResult as any).invoice
  if (!squareInvoice) throw new Error('Square invoice not found')

  const squareStatus = squareInvoice.status ?? null

  // Collect completed payment request amounts via totalCompletedAmountMoney.
  // InvoicePaymentRequest has no status field — do not check req.status.
  let newPaymentsRecorded = 0
  const completedRequests = extractCompletedSquarePaymentRequests(squareInvoice.paymentRequests)
  const webhookEventId =
    typeof options.webhookEventId === 'string' && options.webhookEventId.trim()
      ? options.webhookEventId.trim().slice(0, 120)
      : null

  for (const req of completedRequests) {
    const alreadyExists = await payload.find({
      collection: 'invoice-payments',
      overrideAccess: true,
      depth: 0,
      limit: 1,
      where: { squarePaymentId: { equals: req.uid } },
    })
    if (alreadyExists.totalDocs > 0) continue

    // Never write squareWebhookEventId: null — unique optional fields reject null
    // once another payment exists (this blocked Production invoice.payment_made).
    const paymentData: Record<string, unknown> = {
      invoice: plateInvoiceId,
      amountCents: req.amountCents,
      paidAt: new Date().toISOString(),
      method: 'square',
      reference: req.uid,
      squarePaymentId: req.uid,
      internalNote: `Synced from Square invoice ${squareInvoiceId}`,
      recordedBy: null,
    }
    if (webhookEventId) {
      paymentData.squareWebhookEventId = webhookEventId
    }

    await payload.create({
      collection: 'invoice-payments',
      overrideAccess: true,
      data: paymentData as any,
    })
    newPaymentsRecorded++
  }

  // Recalculate totals from ledger
  const allPayments = await payload.find({
    collection: 'invoice-payments',
    overrideAccess: true,
    depth: 0,
    limit: 500,
    where: { invoice: { equals: plateInvoiceId } },
    select: { amountCents: true },
  })

  const amountPaidCents = allPayments.docs.reduce(
    (sum, p) => sum + Number(p.amountCents ?? 0),
    0,
  )
  const totalCents = Number(invoice.totalCents ?? 0)
  const balanceDueCents = Math.max(0, totalCents - amountPaidCents)

  const nextStatus = deriveInvoiceStatus({
    currentStatus: invoice.status,
    voidedAt: invoice.voidedAt,
    totalCents,
    amountPaidCents,
    balanceDueCents,
    dueDate: invoice.dueDate,
    sentAt: invoice.sentAt,
    firstViewedAt: invoice.firstViewedAt,
    paymentCount: allPayments.docs.length,
  })

  const existingSquare = (invoice.square as any) ?? {}

  await payload.update({
    collection: 'invoices',
    id: plateInvoiceId,
    overrideAccess: true,
    data: {
      amountPaidCents,
      balanceDueCents,
      status: nextStatus,
      square: {
        ...existingSquare,
        status: squareStatus ?? existingSquare.status,
        lastSyncedAt: new Date().toISOString(),
        lastError: null,
      } as any,
    },
  })

  // Update connection lastSyncedAt
  await touchConnectionSyncedAt(connectionId)

  return { squareStatus, newPaymentsRecorded, invoiceStatus: nextStatus }
}
