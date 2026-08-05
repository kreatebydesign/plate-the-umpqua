/**
 * One-shot Production reconcile for an existing Square-paid Plate invoice.
 * Idempotent: uses syncSquareInvoice (dedupes by squarePaymentId).
 *
 * Does NOT create Square invoices, send email, refund, or reconnect.
 *
 * Usage:
 *   node -e '...'  (env injected)
 *   RECONCILE_INVOICE_ID=<plateId> npx tsx scripts/reconcile-square-invoice.ts
 */
import { syncSquareInvoice } from '../lib/os/square/sync'
import { getPayload } from 'payload'
import config from '../payload.config'

function redact(id: string | null | undefined): string {
  if (!id) return 'null'
  if (id.length < 10) return id
  return `${id.slice(0, 6)}…${id.slice(-4)}`
}

async function main() {
  const plateId = process.env.RECONCILE_INVOICE_ID?.trim()
  if (!plateId || !/^[a-zA-Z0-9_-]{1,64}$/.test(plateId)) {
    throw new Error('Set RECONCILE_INVOICE_ID to the Plate invoice document id')
  }

  // Safety: never touch the Sandbox QA evidence invoice by number
  const payload = await getPayload({ config })
  const invoice = await payload.findByID({
    collection: 'invoices',
    id: plateId,
    overrideAccess: true,
    depth: 0,
  })
  if (invoice.invoiceNumber === 'PTU-2026-007') {
    throw new Error('Refusing to reconcile PTU-2026-007 (protected Sandbox QA evidence)')
  }

  console.log('Reconciling', {
    invoiceNumber: invoice.invoiceNumber,
    id: plateId,
    beforeStatus: invoice.status,
    beforePaid: invoice.amountPaidCents,
    beforeBalance: invoice.balanceDueCents,
    squareInvoiceId: redact((invoice as any).square?.invoiceId),
  })

  const first = await syncSquareInvoice(plateId)
  console.log('First sync:', first)

  const second = await syncSquareInvoice(plateId)
  console.log('Second sync (idempotency check):', second)

  const after = await payload.findByID({
    collection: 'invoices',
    id: plateId,
    overrideAccess: true,
    depth: 0,
  })
  const payments = await payload.find({
    collection: 'invoice-payments',
    overrideAccess: true,
    depth: 0,
    limit: 20,
    where: { invoice: { equals: plateId } },
  })

  console.log('After reconcile:', {
    status: after.status,
    amountPaidCents: after.amountPaidCents,
    balanceDueCents: after.balanceDueCents,
    squareStatus: (after as any).square?.status,
    ledgerCount: payments.totalDocs,
    ledger: payments.docs.map((p) => ({
      amountCents: p.amountCents,
      method: p.method,
      squarePaymentId: redact((p as any).squarePaymentId),
    })),
  })

  if (second.newPaymentsRecorded !== 0) {
    throw new Error('Idempotency failed: second sync recorded new payments')
  }
  if (payments.totalDocs !== 1) {
    throw new Error(`Expected exactly 1 ledger entry, found ${payments.totalDocs}`)
  }
  if (Number(payments.docs[0]?.amountCents) !== 100) {
    throw new Error(`Expected $1.00 ledger entry, found ${payments.docs[0]?.amountCents} cents`)
  }
  if (after.status !== 'paid' || Number(after.balanceDueCents) !== 0) {
    throw new Error('Invoice not fully paid after reconcile')
  }

  console.log('Reconcile OK — paid, $0 balance, exactly one $1 ledger entry')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
