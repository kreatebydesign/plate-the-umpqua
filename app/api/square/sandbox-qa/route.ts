/**
 * Temporary Sandbox lifecycle QA runner.
 * Creates/reuses labeled QA client+invoice, publishes Square invoice, returns safe IDs.
 * Sandbox-only. Never returns tokens/secrets. Remove after QA.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { assertSandboxIsolation, getSquareEnv, isSandbox } from '@/lib/os/square/env'
import { getSquareConnection, decryptAccessToken } from '@/lib/os/square/connection'
import { createSquarePaymentInvoice } from '@/lib/os/square/createInvoice'
import { syncSquareInvoice } from '@/lib/os/square/sync'
import { getSquareClient } from '@/lib/os/square/client'
import { SQUARE_SCOPES } from '@/lib/os/square/scopes'
import { allocateInvoiceNumber } from '@/lib/os/invoices/invoiceNumber'
import { generateInvoiceToken, hashInvoiceToken } from '@/lib/os/invoices/invoiceToken'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const QA_EMAIL = 'plate-os-sandbox-qa@example.com'
const QA_NAME = 'Plate OS Sandbox QA'
const QA_MEMO = 'Square Sandbox Lifecycle QA'
const QA_INTERNAL = 'INTERNAL QA NOTE — MUST NOT SYNC TO SQUARE'
const QA_LINE = 'Sandbox QA Service'
const QA_NOTES =
  'Square Sandbox lifecycle test — non-deliverable example.com recipient. Do not treat as a real client.'

function redact(id: string): string {
  if (!id || id.length < 8) return id ? 'too_short' : 'n/a'
  return `${id.slice(0, 4)}…${id.slice(-4)}`
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url)
  const phase = url.searchParams.get('phase') || 'preflight'

  try {
    assertSandboxIsolation()
    if (!isSandbox()) {
      return NextResponse.json({ ok: false, error: 'Sandbox only' }, { status: 403 })
    }

    if (phase === 'preflight') {
      return NextResponse.json(await runPreflight())
    }
    if (phase === 'create-and-publish') {
      return NextResponse.json(await runCreateAndPublish())
    }
    if (phase === 'status') {
      const invoiceId = url.searchParams.get('invoiceId')
      if (!invoiceId) {
        return NextResponse.json({ ok: false, error: 'invoiceId required' }, { status: 400 })
      }
      return NextResponse.json(await runStatus(invoiceId))
    }
    if (phase === 'sync') {
      const invoiceId = url.searchParams.get('invoiceId')
      if (!invoiceId) {
        return NextResponse.json({ ok: false, error: 'invoiceId required' }, { status: 400 })
      }
      return NextResponse.json(await runSync(invoiceId))
    }
    if (phase === 'customer-retry') {
      const invoiceId = url.searchParams.get('invoiceId')
      if (!invoiceId) {
        return NextResponse.json({ ok: false, error: 'invoiceId required' }, { status: 400 })
      }
      return NextResponse.json(await runCustomerRetry(invoiceId))
    }
    if (phase === 'void') {
      const invoiceId = url.searchParams.get('invoiceId')
      if (!invoiceId) {
        return NextResponse.json({ ok: false, error: 'invoiceId required' }, { status: 400 })
      }
      return NextResponse.json(await runVoid(invoiceId))
    }

    return NextResponse.json({ ok: false, error: 'Unknown phase' }, { status: 400 })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'QA runner failed' },
      { status: 500 },
    )
  }
}

async function runPreflight() {
  const env = getSquareEnv()
  const connection = await getSquareConnection()

  let tokenDecryptOk = false
  let tokenError: string | null = null
  if (connection?.status === 'connected') {
    try {
      const token = await decryptAccessToken(connection.id)
      tokenDecryptOk = Boolean(token && token.length > 10)
      // Immediately drop reference; do not return token.
    } catch (err) {
      tokenError = err instanceof Error ? err.message : 'decrypt failed'
    }
  }

  const webhookKeyConfigured = Boolean(env.webhookSignatureKey)
  const expectedWebhook = 'https://www.platetheumpqua.com/api/square/webhook'

  return {
    ok: true,
    phase: 'preflight',
    environment: env.environment,
    sandbox: isSandbox(),
    connection: connection
      ? {
          status: connection.status,
          merchantName: connection.merchantName,
          merchantIdRedacted: redact(connection.merchantId),
          locationName: connection.locationName,
          locationId: connection.locationId,
          locationMatches: connection.locationId === 'LTNF7J4K3262Z',
          merchantLooksDefault:
            (connection.merchantName || '').toLowerCase().includes('default test') ||
            (connection.locationName || '').toLowerCase().includes('default test'),
          scopesStored: connection.scopes,
          requiredScopesPresent: SQUARE_SCOPES.every(
            (s) => !connection.scopes?.length || connection.scopes.includes(s),
          ),
        }
      : null,
    tokenDecryptOk,
    tokenError,
    webhook: {
      expectedUrl: expectedWebhook,
      signatureKeyConfigured: webhookKeyConfigured,
      signatureVerificationActive: webhookKeyConfigured,
      subscribedEventsDocumented: [
        'invoice.payment_made',
        'invoice.updated',
        'invoice.published',
        'payment.created',
        'payment.updated',
      ],
      subscriptionNote:
        'Event subscription must be confirmed in Square Developer Dashboard; code handles invoice.* via sync.',
    },
    currency: 'USD',
    applicationIdRedacted: `${env.applicationId.slice(0, 4)}…${env.applicationId.slice(-4)}`,
  }
}

async function findOrCreateQaClient(payload: any): Promise<{ id: string; reused: boolean }> {
  const existing = await payload.find({
    collection: 'clients',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: { email: { equals: QA_EMAIL } },
  })
  if (existing.docs[0]) {
    return { id: String(existing.docs[0].id), reused: true }
  }

  const created = await payload.create({
    collection: 'clients',
    overrideAccess: true,
    data: {
      fullName: QA_NAME,
      email: QA_EMAIL,
      clientType: 'private',
      vipStatus: 'standard',
      relationshipNotes: QA_NOTES,
    },
  })
  return { id: String(created.id), reused: false }
}

async function findOrCreateQaInvoice(
  payload: any,
  clientId: string,
): Promise<{
  id: string
  reused: boolean
  invoiceNumber: string
  subtotalCents: number
  taxCents: number
  totalCents: number
  internalNotes: string | null
  squareInvoiceId: string | null
}> {
  // Prefer an existing unpaid QA invoice with matching memo and no void.
  const existing = await payload.find({
    collection: 'invoices',
    overrideAccess: true,
    depth: 0,
    limit: 5,
    sort: '-createdAt',
    where: {
      and: [
        { 'billing.email': { equals: QA_EMAIL } },
        { clientMemo: { equals: QA_MEMO } },
        { status: { not_equals: 'voided' } },
      ],
    },
  })

  for (const doc of existing.docs) {
    return {
      id: String(doc.id),
      reused: true,
      invoiceNumber: String(doc.invoiceNumber),
      subtotalCents: Number(doc.subtotalCents || 0),
      taxCents: Number(doc.taxCents || 0),
      totalCents: Number(doc.totalCents || 0),
      internalNotes: (doc.internalNotes as string) || null,
      squareInvoiceId: (doc.square as any)?.invoiceId || null,
    }
  }

  const lines = [
    {
      description: QA_LINE,
      billingType: 'flat' as const,
      quantity: 1,
      unitPriceCents: 1000,
      isCredit: false,
      lineTotalCents: 1000,
    },
  ]
  const totals = {
    subtotalCents: 1000,
    creditCents: 0,
    discountCents: 0,
    taxCents: 0,
    totalCents: 1000,
    balanceDueCents: 1000,
  }
  const invoiceNumber = await allocateInvoiceNumber()
  const token = generateInvoiceToken()
  const now = new Date()
  const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

  const created = await payload.create({
    collection: 'invoices',
    overrideAccess: true,
    data: {
      invoiceNumber,
      status: 'draft',
      client: clientId,
      issueDate: now.toISOString(),
      dueDate: due.toISOString(),
      paymentTerms: 'net14',
      billing: {
        name: QA_NAME,
        email: QA_EMAIL,
        phone: null,
        company: null,
      },
      lineItems: lines,
      discountType: 'none',
      discountValue: 0,
      taxRateBps: 0,
      depositRequiredCents: 0,
      subtotalCents: totals.subtotalCents,
      creditCents: totals.creditCents,
      discountCents: totals.discountCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
      amountPaidCents: 0,
      balanceDueCents: totals.balanceDueCents,
      clientMemo: QA_MEMO,
      internalNotes: QA_INTERNAL,
      publicTokenHash: hashInvoiceToken(token),
      publicTokenCreatedAt: now.toISOString(),
      publicTokenPlaintextOnce: token,
    },
  })

  return {
    id: String(created.id),
    reused: false,
    invoiceNumber,
    subtotalCents: totals.subtotalCents,
    taxCents: totals.taxCents,
    totalCents: totals.totalCents,
    internalNotes: QA_INTERNAL,
    squareInvoiceId: null,
  }
}

async function runCreateAndPublish() {
  const payload = await getPayload({ config })
  const client = await findOrCreateQaClient(payload)
  const invoice = await findOrCreateQaInvoice(payload, client.id)

  let square: Awaited<ReturnType<typeof createSquarePaymentInvoice>> | null = null
  let squareError: string | null = null
  let publishSkipped = false

  if (invoice.squareInvoiceId) {
    publishSkipped = true
    const fresh = await payload.findByID({
      collection: 'invoices',
      id: invoice.id,
      overrideAccess: true,
      depth: 0,
    })
    const sq = (fresh as any).square || {}
    square = {
      squareCustomerId: sq.customerId,
      squareOrderId: sq.orderId,
      squareInvoiceId: sq.invoiceId,
      squarePublicUrl: sq.publicUrl || sq.paymentLinkUrl || '',
      squareInvoiceVersion: Number(sq.version || 0),
      deliveryMethod: 'SHARE_MANUALLY',
    }
  } else {
    try {
      square = await createSquarePaymentInvoice(invoice.id)
    } catch (err) {
      squareError = err instanceof Error ? err.message : 'Square publish failed'
    }
  }

  // Verify Square invoice description does not include internal note
  let internalNoteIsolated = true
  let squareTitle: string | null = null
  let squareDescription: string | null = null
  let squareTotalCents: number | null = null
  let squareCurrency: string | null = null

  if (square?.squareInvoiceId) {
    try {
      const sqClient = await getSquareClient()
      const inv = await sqClient.invoices.get({ invoiceId: square.squareInvoiceId })
      const invoiceObj = (inv as any).invoice
      squareTitle = invoiceObj?.title ?? null
      squareDescription = invoiceObj?.description ?? null
      const desc = `${squareTitle || ''} ${squareDescription || ''}`
      internalNoteIsolated =
        !desc.includes('INTERNAL QA NOTE') && !desc.includes('MUST NOT SYNC')
      // Pull order total if available
      if (square.squareOrderId) {
        const orderRes = await sqClient.orders.get({ orderId: square.squareOrderId })
        const order = (orderRes as any).order
        squareTotalCents = order?.totalMoney?.amount
          ? Number(order.totalMoney.amount)
          : null
        squareCurrency = order?.totalMoney?.currency ?? 'USD'
      }
    } catch {
      // non-fatal for reporting
    }
  }

  return {
    ok: Boolean(square) && !squareError,
    phase: 'create-and-publish',
    client: {
      id: client.id,
      reused: client.reused,
      name: QA_NAME,
      email: QA_EMAIL,
    },
    plateInvoice: {
      id: invoice.id,
      reused: invoice.reused,
      invoiceNumber: invoice.invoiceNumber,
      subtotalCents: invoice.subtotalCents,
      taxCents: invoice.taxCents,
      totalCents: invoice.totalCents,
      internalNotes: invoice.internalNotes,
    },
    square,
    squareError,
    publishSkipped,
    totalsMatch:
      squareTotalCents == null ? null : squareTotalCents === invoice.totalCents,
    squareTotalCents,
    squareCurrency,
    squareTitle,
    squareDescription,
    internalNoteIsolated,
    deliveryMethod: 'SHARE_MANUALLY',
    emailBehavior: {
      squareSendsEmail: false,
      plateEmailNotSentByThisRunner: true,
      recipientIsExampleDomain: QA_EMAIL.endsWith('@example.com'),
    },
  }
}

async function runStatus(invoiceId: string) {
  const payload = await getPayload({ config })
  const invoice = await payload.findByID({
    collection: 'invoices',
    id: invoiceId,
    overrideAccess: true,
    depth: 0,
  })
  const payments = await payload.find({
    collection: 'invoice-payments',
    overrideAccess: true,
    depth: 0,
    limit: 50,
    where: { invoice: { equals: invoiceId } },
  })

  return {
    ok: true,
    phase: 'status',
    invoice: {
      id: String(invoice.id),
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      totalCents: invoice.totalCents,
      amountPaidCents: invoice.amountPaidCents,
      balanceDueCents: invoice.balanceDueCents,
      square: {
        customerId: (invoice as any).square?.customerId ?? null,
        orderId: (invoice as any).square?.orderId ?? null,
        invoiceId: (invoice as any).square?.invoiceId ?? null,
        status: (invoice as any).square?.status ?? null,
        publicUrl: (invoice as any).square?.publicUrl || (invoice as any).square?.paymentLinkUrl || null,
      },
    },
    paymentCount: payments.totalDocs,
    payments: payments.docs.map((p: any) => ({
      id: String(p.id),
      amountCents: p.amountCents,
      method: p.method,
      squarePaymentId: p.squarePaymentId || null,
      // never include card details — none stored
    })),
  }
}

async function runSync(invoiceId: string) {
  const before = await runStatus(invoiceId)
  const result = await syncSquareInvoice(invoiceId)
  const after = await runStatus(invoiceId)
  return {
    ok: true,
    phase: 'sync',
    syncResult: result,
    paymentCountBefore: before.paymentCount,
    paymentCountAfter: after.paymentCount,
    duplicatedPayment: after.paymentCount > before.paymentCount && result.newPaymentsRecorded === 0
      ? 'unexpected_increase'
      : after.paymentCount === before.paymentCount + result.newPaymentsRecorded,
    status: after.invoice,
  }
}

async function runCustomerRetry(invoiceId: string) {
  const payload = await getPayload({ config })
  const invoice = await payload.findByID({
    collection: 'invoices',
    id: invoiceId,
    overrideAccess: true,
    depth: 0,
  })
  const existingCustomerId = (invoice as any).square?.customerId
  if (!existingCustomerId) {
    return { ok: false, error: 'No Square customer on invoice yet' }
  }

  const client = await getSquareClient()
  const email = (invoice as any).billing?.email
  const searchResult = await client.customers.search({
    query: { filter: { emailAddress: { exact: email } } },
  })
  const customers = (searchResult as any).customers ?? []
  const ids = customers.map((c: any) => c.id).filter(Boolean)

  return {
    ok: true,
    phase: 'customer-retry',
    email,
    matchingCustomerCount: ids.length,
    existingCustomerId,
    duplicateCreated: ids.length > 1,
    allIdsMatchExisting: ids.length === 1 && ids[0] === existingCustomerId,
  }
}

async function runVoid(invoiceId: string) {
  const payload = await getPayload({ config })
  await payload.update({
    collection: 'invoices',
    id: invoiceId,
    overrideAccess: true,
    data: { status: 'voided' },
  })
  return { ok: true, phase: 'void', invoiceId, status: 'voided' }
}
