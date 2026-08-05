/**
 * READ-ONLY Production diagnostic for Square payment sync defect.
 * Does NOT create/update invoices, payments, refunds, or webhooks.
 *
 * Usage (with Production env already exported):
 *   set -a && source .env.production.local && set +a
 *   SQUARE_ENVIRONMENT=production npx tsx scripts/diagnose-square-payment-sync.ts
 */
import { getPayload } from 'payload'
import config from '../payload.config'
import { getSquareConnection } from '../lib/os/square/connection'
import { getSquareClientWithConnection } from '../lib/os/square/client'
import { extractCompletedSquarePaymentRequests } from '../lib/os/square/paymentRequestSync'

function redact(id: string | null | undefined): string {
  if (!id) return 'null'
  if (id.length < 10) return id
  return `${id.slice(0, 6)}…${id.slice(-4)}`
}

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

async function main() {
  process.env.SQUARE_ENVIRONMENT = process.env.SQUARE_ENVIRONMENT || 'production'

  console.log('=== READ-ONLY Square payment sync diagnostic ===')
  console.log('SQUARE_ENVIRONMENT:', process.env.SQUARE_ENVIRONMENT)
  console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
  console.log('Webhook URL would be:', `${(process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')}/api/square/webhook`)
  console.log('SIGNATURE_KEY set:', Boolean(process.env.SQUARE_WEBHOOK_SIGNATURE_KEY))

  const payload = await getPayload({ config })

  const connection = await getSquareConnection()
  console.log('\n--- Production Square connection ---')
  if (!connection) {
    console.log('NO connected Production Square connection')
  } else {
    console.log({
      id: connection.id,
      environment: connection.environment,
      status: connection.status,
      merchantId: redact(connection.merchantId),
      merchantName: connection.merchantName,
      locationId: redact(connection.locationId),
      locationName: connection.locationName,
      lastSyncedAt: connection.lastSyncedAt,
      lastError: connection.lastError,
    })
  }

  // Recent invoices with Square IDs (exclude known sandbox QA number in report notes)
  const withSquare = await payload.find({
    collection: 'invoices',
    overrideAccess: true,
    depth: 0,
    limit: 30,
    sort: '-createdAt',
    where: {
      and: [
        { 'square.invoiceId': { exists: true } },
        { 'square.invoiceId': { not_equals: '' } },
      ],
    },
  })

  console.log(`\n--- Recent invoices with Square IDs (${withSquare.docs.length}) ---`)
  for (const inv of withSquare.docs) {
    const sq = (inv as any).square || {}
    console.log({
      invoiceNumber: inv.invoiceNumber,
      id: String(inv.id),
      status: inv.status,
      totalCents: inv.totalCents,
      amountPaidCents: inv.amountPaidCents,
      balanceDueCents: inv.balanceDueCents,
      createdAt: inv.createdAt,
      squareInvoiceId: redact(sq.invoiceId),
      squareOrderId: redact(sq.orderId),
      squareCustomerId: redact(sq.customerId),
      squareStatus: sq.status,
      squareLastSyncedAt: sq.lastSyncedAt,
      squareLastError: sq.lastError,
      paymentLinkPresent: Boolean(sq.paymentLinkUrl || sq.publicUrl),
    })
  }

  // $1 invoices (100 cents) — primary suspect
  const dollarOnes = withSquare.docs.filter((inv) => Number(inv.totalCents) === 100)
  console.log(`\n--- $1.00 invoices with Square IDs (${dollarOnes.length}) ---`)

  const targets = dollarOnes.length > 0 ? dollarOnes : withSquare.docs.slice(0, 5)

  let client: Awaited<ReturnType<typeof getSquareClientWithConnection>> | null = null
  try {
    client = await getSquareClientWithConnection()
    console.log('\n--- Live Square client OK ---')
    console.log({
      connectionLocationId: redact(client.locationId),
      merchantId: redact(client.merchantId),
    })
  } catch (err) {
    console.log('\n--- Live Square client FAILED ---')
    console.log(err instanceof Error ? err.message : String(err))
  }

  for (const inv of targets) {
    const sq = (inv as any).square || {}
    const plateId = String(inv.id)
    console.log(`\n======== Plate ${inv.invoiceNumber} (${plateId}) ========`)

    const payments = await payload.find({
      collection: 'invoice-payments',
      overrideAccess: true,
      depth: 0,
      limit: 50,
      where: { invoice: { equals: plateId } },
    })
    console.log(`Ledger entries: ${payments.totalDocs}`)
    for (const p of payments.docs) {
      console.log({
        id: String(p.id),
        amountCents: p.amountCents,
        method: p.method,
        squarePaymentId: redact((p as any).squarePaymentId),
        reference: (p as any).reference,
        paidAt: p.paidAt,
        internalNote: (p as any).internalNote,
      })
    }

    const webhookEvents = await (payload as any).find({
      collection: 'square-webhook-events',
      overrideAccess: true,
      depth: 0,
      limit: 30,
      sort: '-processedAt',
      where: {
        or: [
          { invoiceId: { equals: plateId } },
          { summary: { contains: String(sq.invoiceId || '___none___') } },
        ],
      },
    })
    console.log(`Webhook events linked/matching: ${webhookEvents.totalDocs}`)
    for (const ev of webhookEvents.docs) {
      console.log({
        eventId: redact(ev.eventId),
        type: ev.type,
        processedAt: ev.processedAt,
        invoiceId: ev.invoiceId,
        summary: ev.summary,
      })
    }

    if (client && sq.invoiceId) {
      try {
        const getResult = await client.client.invoices.get({ invoiceId: sq.invoiceId })
        const squareInvoice = (getResult as any).invoice
        const completed = extractCompletedSquarePaymentRequests(squareInvoice?.paymentRequests)
        console.log('Square invoice live:', {
          id: redact(squareInvoice?.id),
          status: squareInvoice?.status,
          locationId: redact(squareInvoice?.locationId),
          locationMatchesConnection: squareInvoice?.locationId === client.locationId,
          orderId: redact(squareInvoice?.orderId),
          paymentRequestCount: squareInvoice?.paymentRequests?.length ?? 0,
          completedPayments: completed.map((c) => ({
            uid: redact(c.uid),
            amount: money(c.amountCents),
          })),
          rawPaymentRequests: (squareInvoice?.paymentRequests ?? []).map((r: any) => ({
            uid: redact(r.uid),
            totalCompletedAmountMoney: r.totalCompletedAmountMoney,
            computedAmountMoney: r.computedAmountMoney,
            requestType: r.requestType,
          })),
        })
      } catch (err) {
        console.log('Square invoices.get FAILED:', err instanceof Error ? err.message : String(err))
      }
    }
  }

  // Recent webhook events overall (last 40)
  const recentEvents = await (payload as any).find({
    collection: 'square-webhook-events',
    overrideAccess: true,
    depth: 0,
    limit: 40,
    sort: '-processedAt',
  })
  console.log(`\n--- Recent webhook events (${recentEvents.totalDocs} shown up to 40) ---`)
  for (const ev of recentEvents.docs) {
    console.log({
      type: ev.type,
      processedAt: ev.processedAt,
      invoiceId: ev.invoiceId,
      summary: ev.summary,
      eventId: redact(ev.eventId),
    })
  }

  // Explicitly note PTU-2026-007
  const sandboxQa = await payload.find({
    collection: 'invoices',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: { invoiceNumber: { equals: 'PTU-2026-007' } },
  })
  if (sandboxQa.docs[0]) {
    const qa = sandboxQa.docs[0]
    console.log('\n--- PTU-2026-007 (must remain untouched) ---')
    console.log({
      status: qa.status,
      totalCents: qa.totalCents,
      amountPaidCents: qa.amountPaidCents,
      balanceDueCents: qa.balanceDueCents,
      squareInvoiceId: redact((qa as any).square?.invoiceId),
    })
  }

  console.log('\n=== Diagnostic complete (read-only; no writes) ===')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
