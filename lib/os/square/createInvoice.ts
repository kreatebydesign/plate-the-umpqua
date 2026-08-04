/**
 * Create a Square invoice for an existing Plate invoice.
 * Flow: upsert customer → create order → create invoice → publish invoice.
 * Idempotency keys are deterministic from invoiceId to prevent duplicates.
 * NEVER sends internalNotes to Square.
 * Delivery method is always SHARE_MANUALLY — no surprise Square emails.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Square as SquareTypes } from 'square'
import { getSquareClientWithConnection } from './client'
import { touchConnectionSyncedAt } from './connection'
import { getPayload } from 'payload'
import config from '../../../payload.config'
import type { Invoice } from '@/payload-types'

export type CreateSquareInvoiceResult = {
  squareCustomerId: string
  squareOrderId: string
  squareInvoiceId: string
  squarePublicUrl: string
  squareInvoiceVersion: number
  deliveryMethod: 'SHARE_MANUALLY'
}

/** Build stable idempotency keys scoped to a Plate invoice ID. */
export function idempotencyKey(invoiceId: string, suffix: string): string {
  return `plate-ptu-${invoiceId}-${suffix}`
}

/**
 * Upsert a Square customer for the invoice's billing contact.
 * Searches by email first; creates if not found.
 */
async function upsertSquareCustomer(
  client: Awaited<ReturnType<typeof getSquareClientWithConnection>>['client'],
  billing: NonNullable<Invoice['billing']>,
  invoiceId: string,
): Promise<string> {
  const email = billing.email?.trim()
  if (!email) throw new Error('Billing email is required to create a Square customer')

  // HttpResponsePromise<SearchCustomersResponse> resolves to SearchCustomersResponse
  const searchResult = await client.customers.search({
    query: {
      filter: {
        emailAddress: { exact: email },
      },
    },
  })

  const existing = (searchResult as any).customers?.[0]
  if (existing?.id) return existing.id

  const nameParts = (billing.name ?? '').trim().split(/\s+/)
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ') || undefined

  const createdResult = await client.customers.create({
    idempotencyKey: idempotencyKey(invoiceId, 'customer'),
    givenName: firstName,
    familyName: lastName,
    emailAddress: email,
    phoneNumber: billing.phone?.trim() || undefined,
    companyName: billing.company?.trim() || undefined,
    referenceId: `plate-${invoiceId}`,
  })

  const customerId = (createdResult as any).customer?.id
  if (!customerId) {
    throw new Error('Failed to create Square customer: no ID in response')
  }
  return customerId
}

/**
 * Create a Square order representing the Plate invoice line items.
 * Only public-facing descriptions; no internal notes or staff-only data.
 */
async function createSquareOrder(
  client: Awaited<ReturnType<typeof getSquareClientWithConnection>>['client'],
  locationId: string,
  invoice: Invoice,
  customerId: string,
): Promise<string> {
  const lineItems: SquareTypes.OrderLineItem[] = (invoice.lineItems ?? [])
    .filter((l) => !l.isCredit)
    .map((l, index) => ({
      uid: `line-${index + 1}`,
      name: String(l.description ?? '').slice(0, 500),
      quantity: String(Math.max(1, Number(l.quantity || 1))),
      itemType: 'ITEM',
      basePriceMoney: {
        amount: BigInt(Math.abs(Number(l.unitPriceCents || 0))),
        currency: 'USD' as const,
      },
    }))

  const discounts: SquareTypes.OrderLineItemDiscount[] = []
  if ((invoice.discountCents ?? 0) > 0) {
    discounts.push({
      uid: 'discount-1',
      name: 'Discount',
      type: 'FIXED_AMOUNT',
      amountMoney: {
        amount: BigInt(Number(invoice.discountCents)),
        currency: 'USD' as const,
      },
      scope: 'ORDER',
    })
  }

  const taxes: SquareTypes.OrderLineItemTax[] = []
  if ((invoice.taxRateBps ?? 0) > 0) {
    const taxPct = ((invoice.taxRateBps ?? 0) / 100).toFixed(4)
    taxes.push({
      uid: 'tax-1',
      name: 'Tax',
      type: 'ADDITIVE',
      percentage: taxPct,
      scope: 'ORDER',
    })
  }

  let orderResult: any
  try {
    orderResult = await client.orders.create({
      idempotencyKey: idempotencyKey(String(invoice.id), 'order-v2'),
      order: {
        locationId,
        customerId,
        referenceId: String(invoice.invoiceNumber ?? invoice.id),
        lineItems: lineItems.length
          ? lineItems
          : [
              {
                uid: 'line-1',
                name: 'Invoice',
                quantity: '1',
                itemType: 'ITEM',
                basePriceMoney: {
                  amount: BigInt(Math.max(0, Number(invoice.totalCents || 0))),
                  currency: 'USD' as const,
                },
              },
            ],
        discounts: discounts.length ? discounts : undefined,
        taxes: taxes.length ? taxes : undefined,
      },
    })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    throw new Error(`Square order create failed: ${detail}`)
  }

  const orderId = orderResult?.order?.id
  if (!orderId) {
    const detail = JSON.stringify(orderResult?.errors ?? orderResult).slice(0, 300)
    throw new Error(`Failed to create Square order: no ID in response (${detail})`)
  }
  return orderId
}

/**
 * Main entry point: create and publish a Square invoice for a Plate invoice.
 * Returns the Square IDs and public payment URL.
 */
export async function createSquarePaymentInvoice(
  plateInvoiceId: string,
): Promise<CreateSquareInvoiceResult> {
  const payload = await getPayload({ config })

  const invoice = await payload.findByID({
    collection: 'invoices',
    id: plateInvoiceId,
    overrideAccess: true,
    depth: 0,
  })

  if (!invoice) throw new Error(`Invoice ${plateInvoiceId} not found`)
  if (invoice.status === 'voided') throw new Error('Cannot create Square invoice for a voided Plate invoice')
  if ((invoice.balanceDueCents ?? 0) <= 0) throw new Error('Invoice balance is zero — nothing to collect')

  // Check if Square invoice already exists (idempotent)
  const existingSquareId = (invoice.square as any)?.invoiceId
  if (existingSquareId) {
    throw new Error(
      `Square invoice already exists for this invoice: ${existingSquareId}. Use sync instead.`,
    )
  }

  const { client, locationId, connectionId } = await getSquareClientWithConnection()

  const billing = invoice.billing
  if (!billing) throw new Error('Invoice has no billing information')

  // 1. Upsert customer
  const squareCustomerId = await upsertSquareCustomer(client, billing, plateInvoiceId)

  // 2. Create order
  const squareOrderId = await createSquareOrder(client, locationId, invoice, squareCustomerId)

  // 3. Build payment schedule
  const balanceDue = Number(invoice.balanceDueCents ?? 0)
  const depositRequired = Number(invoice.depositRequiredCents ?? 0)
  const dueDate = invoice.dueDate
    ? new Date(invoice.dueDate).toISOString().split('T')[0]
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  let paymentRequests: SquareTypes.InvoicePaymentRequest[]

  if (depositRequired > 0 && depositRequired < balanceDue) {
    const depositDueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    paymentRequests = [
      {
        requestType: 'DEPOSIT',
        dueDate: depositDueDate,
        fixedAmountRequestedMoney: {
          amount: BigInt(depositRequired),
          currency: 'USD',
        },
        automaticPaymentSource: 'NONE',
        tippingEnabled: false,
      },
      {
        requestType: 'BALANCE',
        dueDate,
        automaticPaymentSource: 'NONE',
        tippingEnabled: false,
      },
    ]
  } else {
    paymentRequests = [
      {
        requestType: 'BALANCE',
        dueDate,
        automaticPaymentSource: 'NONE',
        tippingEnabled: false,
      },
    ]
  }

  // 4. Create invoice draft
  // Note: customFields require Invoices Plus — omit to keep Sandbox/base invoices working.
  const invoiceTitle = `Invoice ${invoice.invoiceNumber ?? plateInvoiceId}`
  const description = invoice.clientMemo?.trim().slice(0, 1000) || undefined

  let createdResult: any
  try {
    createdResult = await client.invoices.create({
      idempotencyKey: idempotencyKey(plateInvoiceId, 'invoice-v2'),
      invoice: {
        locationId,
        orderId: squareOrderId,
        primaryRecipient: { customerId: squareCustomerId },
        paymentRequests,
        deliveryMethod: 'SHARE_MANUALLY',
        invoiceNumber: invoice.invoiceNumber ?? undefined,
        title: invoiceTitle,
        description,
        acceptedPaymentMethods: {
          card: true,
          squareGiftCard: false,
          bankAccount: false,
          buyNowPayLater: false,
          cashAppPay: false,
        },
      },
    })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    throw new Error(`Square invoice create failed: ${detail}`)
  }

  const squareInvoiceId = createdResult?.invoice?.id
  if (!squareInvoiceId) {
    const detail = JSON.stringify(createdResult?.errors ?? createdResult).slice(0, 400)
    throw new Error(`Square invoice creation failed: no ID in response (${detail})`)
  }

  const draftVersion = Number((createdResult as any).invoice?.version ?? 0)

  // 5. Publish (makes the link shareable without emailing)
  const publishedResult = await client.invoices.publish({
    invoiceId: squareInvoiceId,
    version: draftVersion,
    idempotencyKey: idempotencyKey(plateInvoiceId, 'publish'),
  })

  const publicUrl = (publishedResult as any).invoice?.publicUrl ?? ''
  const finalVersion = Number((publishedResult as any).invoice?.version ?? 0)

  // 6. Persist Square IDs to Plate invoice (use any to bypass stale payload-types)
  await payload.update({
    collection: 'invoices',
    id: plateInvoiceId,
    overrideAccess: true,
    data: {
      square: {
        customerId: squareCustomerId,
        orderId: squareOrderId,
        invoiceId: squareInvoiceId,
        paymentLinkUrl: publicUrl,
        status: 'UNPAID',
        lastSyncedAt: new Date().toISOString(),
        version: finalVersion,
        publicUrl,
        deliveryMethod: 'SHARE_MANUALLY',
        lastError: null,
      } as any,
    },
  })

  // 7. Update connection lastSyncedAt
  await touchConnectionSyncedAt(connectionId)

  return {
    squareCustomerId,
    squareOrderId,
    squareInvoiceId,
    squarePublicUrl: publicUrl,
    squareInvoiceVersion: finalVersion,
    deliveryMethod: 'SHARE_MANUALLY',
  }
}
