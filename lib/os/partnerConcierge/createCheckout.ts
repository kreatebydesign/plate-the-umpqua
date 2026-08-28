/**
 * Partner Concierge self-service checkout — reuses Plate invoice + Square hosted invoice flow.
 * Server-only. Package prices are never taken from client input.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { getPayload } from 'payload'
import config from '../../../payload.config'
import { allocateInvoiceNumber } from '@/lib/os/invoices/invoiceNumber'
import { calculateInvoice } from '@/lib/os/invoices/invoiceCalc'
import { generateInvoiceToken, hashInvoiceToken } from '@/lib/os/invoices/invoiceToken'
import { createSquarePaymentInvoice } from '@/lib/os/square/createInvoice'
import { getSquareConnection } from '@/lib/os/square/connection'
import {
  partnerIndustryLabel,
  resolvePartnerPackage,
} from './packages'
import type { PartnerCheckoutInput } from './validateCheckout'

export type PartnerCheckoutResult =
  | {
      ok: true
      squareUrl: string
      confirmationToken: string
      invoiceId: string
      invoiceNumber: string
      reused: boolean
    }
  | { ok: false; message: string; status: number }

async function findClientByEmail(email: string): Promise<string | null> {
  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'clients',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return found.docs[0] ? String(found.docs[0].id) : null
}

async function upsertPartnerClient(input: PartnerCheckoutInput): Promise<string> {
  const payload = await getPayload({ config })
  const existingId = await findClientByEmail(input.billing.email)
  if (existingId) return existingId

  const created = await payload.create({
    collection: 'clients',
    overrideAccess: true,
    data: {
      fullName: input.billing.name,
      email: input.billing.email,
      phone: input.billing.phone || undefined,
      clientType: 'realtor',
      vipStatus: 'standard',
      preferredExperienceStyle: ['realtorConcierge'],
      averageSpendRange:
        input.packageId === 'single'
          ? 'partner-425'
          : input.packageId === 'five-pack'
            ? 'partner-1750'
            : 'partner-3400',
      relationshipNotes: `Partner Concierge self-service checkout · ${partnerIndustryLabel(input.industrySlug)} · ${input.packageId}`,
    },
  })

  return String(created.id)
}

async function findCheckoutByKey(checkoutKey: string) {
  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'invoices',
    where: {
      and: [
        { 'partnerConcierge.isPartnerPurchase': { equals: true } },
        { 'partnerConcierge.checkoutKey': { equals: checkoutKey } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return found.docs[0] ?? null
}

function squareUrlFromInvoice(doc: any): string | null {
  const square = doc?.square
  if (!square || typeof square !== 'object') return null
  return String(square.publicUrl || square.paymentLinkUrl || '').trim() || null
}

function confirmationTokenFromInvoice(doc: any): string | null {
  return doc?.publicTokenPlaintextOnce
    ? String(doc.publicTokenPlaintextOnce)
    : null
}

export async function createPartnerConciergeCheckout(
  input: PartnerCheckoutInput,
): Promise<PartnerCheckoutResult> {
  const pkg = resolvePartnerPackage(input.packageId)
  if (!pkg) {
    return { ok: false, message: 'Package not available.', status: 400 }
  }

  const connection = await getSquareConnection()
  if (!connection || connection.status !== 'connected' || !connection.locationId) {
    return {
      ok: false,
      message:
        'Online checkout is temporarily unavailable. Please request information and Martin will follow up.',
      status: 503,
    }
  }

  const existing = await findCheckoutByKey(input.checkoutKey)
  if (existing) {
    const existingUrl = squareUrlFromInvoice(existing)
    const existingToken = confirmationTokenFromInvoice(existing)
    if (existingUrl && existingToken) {
      return {
        ok: true,
        squareUrl: existingUrl,
        confirmationToken: existingToken,
        invoiceId: String(existing.id),
        invoiceNumber: String(existing.invoiceNumber),
        reused: true,
      }
    }

    if (!existingUrl && !(existing.square as any)?.invoiceId) {
      try {
        const square = await createSquarePaymentInvoice(String(existing.id))
        const payload = await getPayload({ config })
        const refreshed = await payload.findByID({
          collection: 'invoices',
          id: String(existing.id),
          overrideAccess: true,
          depth: 0,
        })
        const token = confirmationTokenFromInvoice(refreshed)
        if (!token) {
          return { ok: false, message: 'Checkout could not be resumed.', status: 500 }
        }
        return {
          ok: true,
          squareUrl: square.squarePublicUrl,
          confirmationToken: token,
          invoiceId: String(existing.id),
          invoiceNumber: String(existing.invoiceNumber),
          reused: true,
        }
      } catch (err) {
        console.error('[partner-checkout] resume failed', err)
        return {
          ok: false,
          message: 'Unable to resume checkout. Please try again or contact us.',
          status: 500,
        }
      }
    }
  }

  const payload = await getPayload({ config })
  const clientId = await upsertPartnerClient(input)
  const invoiceNumber = await allocateInvoiceNumber()
  const token = generateInvoiceToken()
  const now = new Date()
  const issueDate = now.toISOString().split('T')[0]
  const dueDate = issueDate

  const line = {
    itemKey: `partner-${input.packageId}`,
    sortOrder: 0,
    description: pkg.lineDescription,
    detail: pkg.lineDetail,
    billingType: 'flat' as const,
    quantity: 1,
    unitPriceCents: pkg.priceCents,
    isCredit: false,
  }

  const totals = calculateInvoice({
    lines: [line],
    discountType: 'none',
    discountValue: 0,
    taxRateBps: 0,
    amountPaidCents: 0,
  })

  const industryLabel = partnerIndustryLabel(input.industrySlug)

  const created = await payload.create({
    collection: 'invoices',
    overrideAccess: true,
    data: {
      invoiceNumber,
      status: 'sent',
      client: clientId,
      issueDate,
      dueDate,
      paymentTerms: 'dueOnReceipt',
      billing: {
        name: input.billing.name,
        email: input.billing.email,
        phone: input.billing.phone,
        company: input.billing.company,
      },
      lineItems: [
        {
          ...line,
          lineTotalCents: totals.lines[0].lineTotalCents,
        },
      ],
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
      clientMemo:
        'Partner Concierge prepaid package. Martin will follow up with certificate fulfillment details after payment.',
      internalNotes: [
        'Partner Concierge purchase',
        industryLabel,
        pkg.title,
        'Self-service checkout',
      ].join(' · '),
      sentAt: now.toISOString(),
      publicTokenHash: hashInvoiceToken(token),
      publicTokenCreatedAt: now.toISOString(),
      publicTokenPlaintextOnce: token,
      partnerConcierge: {
        isPartnerPurchase: true,
        industrySlug: input.industrySlug,
        packageId: input.packageId,
        packageTitle: pkg.title,
        experienceCount: pkg.tableCount,
        checkoutKey: input.checkoutKey,
      },
    } as any,
  })

  try {
    const square = await createSquarePaymentInvoice(String(created.id))
    return {
      ok: true,
      squareUrl: square.squarePublicUrl,
      confirmationToken: token,
      invoiceId: String(created.id),
      invoiceNumber,
      reused: false,
    }
  } catch (err) {
    console.error('[partner-checkout] square create failed', err)
    await payload.update({
      collection: 'invoices',
      id: created.id,
      overrideAccess: true,
      data: {
        internalNotes: [
          'Partner Concierge purchase',
          industryLabel,
          pkg.title,
          'Self-service checkout',
          'Square invoice creation failed — operator follow-up required.',
        ].join(' · '),
        square: {
          lastError: err instanceof Error ? err.message : 'Square invoice creation failed',
        },
      } as any,
    })
    return {
      ok: false,
      message:
        'We could not start secure checkout. Please request information and Martin will follow up.',
      status: 503,
    }
  }
}
