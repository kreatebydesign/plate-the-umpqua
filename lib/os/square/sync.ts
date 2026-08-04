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

export type SyncResult = {
  squareStatus: string | null
  newPaymentsRecorded: number
  invoiceStatus: string
}

/** Pull Square invoice state and reconcile payments into Plate ledger. */
export async function syncSquareInvoice(plateInvoiceId: string): Promise<SyncResult> {
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

  // Collect paid payment requests
  let newPaymentsRecorded = 0
  const paymentRequests: any[] = squareInvoice.paymentRequests ?? []

  for (const req of paymentRequests) {
    const reqUid = req.uid
    if (!reqUid) continue

    // Only sync if there's actual payment data
    if (!req.computedAmountMoney?.amount) continue

    const alreadyExists = await payload.find({
      collection: 'invoice-payments',
      overrideAccess: true,
      depth: 0,
      limit: 1,
      where: { squarePaymentId: { equals: reqUid } },
    })
    if (alreadyExists.totalDocs > 0) continue

    const amountCents = Number(req.computedAmountMoney.amount)
    if (amountCents <= 0) continue

    // Only record if status indicates paid
    if (req.status !== 'COMPLETED') continue

    await payload.create({
      collection: 'invoice-payments',
      overrideAccess: true,
      data: {
        invoice: plateInvoiceId,
        amountCents,
        paidAt: new Date().toISOString(),
        method: 'square',
        reference: reqUid,
        squarePaymentId: reqUid,
        squareWebhookEventId: null,
        internalNote: `Synced from Square invoice ${squareInvoiceId}`,
        recordedBy: null,
      },
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
