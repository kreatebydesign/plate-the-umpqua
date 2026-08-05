'use server'

import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { getPayload } from 'payload'
import config from '../../../payload.config'
import { asPlateUser, canWriteOperational } from '@/lib/access/roles'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { formatShortDate } from '../formatDate'
import { calculateInvoice } from './invoiceCalc'
import {
  INVOICE_SEND_COOLDOWN_MS,
  isBillingType,
  isDiscountType,
  isPaymentMethod,
  isPaymentTerms,
  type BillingTypeValue,
  type DiscountTypeValue,
  type PaymentMethodValue,
  type PaymentTermsValue,
} from './invoiceConstants'
import { allocateInvoiceNumber } from './invoiceNumber'
import { buildInvoiceEmail } from './invoiceEmail'
import { deriveInvoiceStatus } from './invoiceStatus'
import {
  generateInvoiceToken,
  hashInvoiceToken,
  publicInvoiceUrl,
} from './invoiceToken'

type ActionResult<T = Record<string, never>> =
  | ({ ok: true } & T)
  | { ok: false; message: string }

type LineInput = {
  itemKey?: string
  description?: string
  detail?: string | null
  billingType?: string
  quantity?: number
  unitPriceCents?: number
  isCredit?: boolean
}

function revalidateInvoice(id?: string) {
  revalidatePath('/os')
  revalidatePath('/os/invoices')
  if (id) revalidatePath(`/os/invoices/${id}`)
}

function normalizeLines(rawLines: unknown): Array<{
  itemKey: string
  sortOrder: number
  description: string
  detail: string | null
  billingType: BillingTypeValue
  quantity: number
  unitPriceCents: number
  isCredit: boolean
  lineTotalCents: number
}> {
  if (!Array.isArray(rawLines) || rawLines.length < 1) {
    throw new Error('At least one line item is required.')
  }

  const prepared = rawLines.map((raw, index) => {
    const line = raw as LineInput
    const description = String(line.description || '').trim()
    if (!description) throw new Error('Each line item needs a description.')
    const billingType = isBillingType(String(line.billingType || ''))
      ? (line.billingType as BillingTypeValue)
      : 'flat'
    const quantity = Number(line.quantity)
    const unitPriceCents = Number(line.unitPriceCents)
    if (!Number.isFinite(quantity) || quantity < 0) {
      throw new Error('Quantity must be zero or greater.')
    }
    if (!Number.isFinite(unitPriceCents) || unitPriceCents < 0 || !Number.isInteger(unitPriceCents)) {
      throw new Error('Unit price must be a non-negative whole-cent amount.')
    }
    return {
      itemKey: String(line.itemKey || `line-${index}-${Date.now()}`),
      sortOrder: index,
      description: description.slice(0, 200),
      detail: line.detail ? String(line.detail).trim().slice(0, 2000) || null : null,
      billingType,
      quantity,
      unitPriceCents,
      isCredit: Boolean(line.isCredit),
    }
  })

  const calc = calculateInvoice({ lines: prepared })
  return prepared.map((line, i) => ({
    ...line,
    lineTotalCents: calc.lines[i].lineTotalCents,
  }))
}

function buildTotals(
  lines: ReturnType<typeof normalizeLines>,
  discountType: DiscountTypeValue,
  discountValue: number,
  taxRateBps: number,
  amountPaidCents: number,
) {
  return calculateInvoice({
    lines,
    discountType,
    discountValue,
    taxRateBps,
    amountPaidCents,
  })
}

async function requireWriter(returnTo = '/os/invoices') {
  const user = await requirePlateOperator({ returnTo })
  if (!canWriteOperational(asPlateUser(user))) {
    return { user: null as never, error: 'You do not have permission to manage invoices.' }
  }
  return { user, error: null as string | null }
}

export async function createInvoice(rawInput: unknown): Promise<ActionResult<{ id: string }>> {
  const { user, error } = await requireWriter('/os/invoices/new')
  if (error) return { ok: false, message: error }

  try {
    const input = (rawInput || {}) as Record<string, unknown>
    const clientId = String(input.clientId || '')
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(clientId)) {
      return { ok: false, message: 'Select a client.' }
    }

    const payload = await getPayload({ config })
    const client = await payload.findByID({
      collection: 'clients',
      id: clientId,
      user,
      overrideAccess: false,
      depth: 0,
    })

    const eventId = input.eventId ? String(input.eventId) : ''
    if (eventId && !/^[a-zA-Z0-9_-]{1,64}$/.test(eventId)) {
      return { ok: false, message: 'Invalid event.' }
    }

    const lines = normalizeLines(input.lineItems)
    const discountType = isDiscountType(String(input.discountType || 'none'))
      ? (input.discountType as DiscountTypeValue)
      : 'none'
    const discountValue = Math.max(0, Math.floor(Number(input.discountValue || 0)))
    const taxRateBps = Math.max(0, Math.min(10000, Math.floor(Number(input.taxRateBps || 0))))
    const depositRequiredCents = Math.max(0, Math.floor(Number(input.depositRequiredCents || 0)))
    const totals = buildTotals(lines, discountType, discountValue, taxRateBps, 0)
    if (totals.totalCents <= 0) {
      return {
        ok: false,
        message: 'Invoice total must be greater than $0.00. Enter a unit price like 1.00.',
      }
    }

    const paymentTerms = isPaymentTerms(String(input.paymentTerms || 'net14'))
      ? (input.paymentTerms as PaymentTermsValue)
      : 'net14'

    const issueDate = String(input.issueDate || new Date().toISOString())
    const dueDate = String(input.dueDate || issueDate)

    const billToName = String(input.billToName || client.fullName || '').trim()
    const billToEmail = String(input.billToEmail || client.email || '').trim()
    if (!billToName || !billToEmail) {
      return { ok: false, message: 'Billing name and email are required.' }
    }

    const invoiceNumber = await allocateInvoiceNumber()
    const token = generateInvoiceToken()

    const created = await payload.create({
      collection: 'invoices',
      user,
      overrideAccess: false,
      data: {
        invoiceNumber,
        status: 'draft',
        client: clientId,
        event: eventId || null,
        issueDate,
        dueDate,
        paymentTerms,
        paymentTermsCustom:
          paymentTerms === 'custom'
            ? String(input.paymentTermsCustom || '').trim().slice(0, 200) || null
            : null,
        billing: {
          name: billToName.slice(0, 120),
          email: billToEmail.slice(0, 160),
          phone: String(input.billToPhone || client.phone || '').trim().slice(0, 40) || null,
          company: String(input.billToCompany || '').trim().slice(0, 120) || null,
        },
        lineItems: lines,
        discountType,
        discountValue,
        taxRateBps,
        depositRequiredCents,
        subtotalCents: totals.subtotalCents,
        creditCents: totals.creditCents,
        discountCents: totals.discountCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        amountPaidCents: 0,
        balanceDueCents: totals.balanceDueCents,
        clientMemo: String(input.clientMemo || '').trim().slice(0, 4000) || null,
        internalNotes: String(input.internalNotes || '').trim().slice(0, 4000) || null,
        publicTokenHash: hashInvoiceToken(token),
        publicTokenCreatedAt: new Date().toISOString(),
        publicTokenPlaintextOnce: token,
        createdBy: user.id,
        updatedBy: user.id,
      },
    })

    revalidateInvoice(String(created.id))
    return { ok: true, id: String(created.id) }
  } catch (err) {
    console.error('[os/invoices] create', err)
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unable to create invoice.',
    }
  }
}

export async function updateInvoice(
  rawId: unknown,
  rawInput: unknown,
): Promise<ActionResult<{ id: string }>> {
  const { user, error } = await requireWriter()
  if (error) return { ok: false, message: error }
  if (typeof rawId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) {
    return { ok: false, message: 'Invalid invoice.' }
  }

  try {
    const payload = await getPayload({ config })
    const existing = await payload.findByID({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 0,
    })
    if (existing.status === 'voided' || existing.voidedAt) {
      return { ok: false, message: 'Voided invoices cannot be edited.' }
    }

    const input = (rawInput || {}) as Record<string, unknown>
    const lines = normalizeLines(input.lineItems)
    const discountType = isDiscountType(String(input.discountType || 'none'))
      ? (input.discountType as DiscountTypeValue)
      : 'none'
    const discountValue = Math.max(0, Math.floor(Number(input.discountValue || 0)))
    const taxRateBps = Math.max(0, Math.min(10000, Math.floor(Number(input.taxRateBps || 0))))
    const depositRequiredCents = Math.max(0, Math.floor(Number(input.depositRequiredCents || 0)))
    const amountPaid = Number(existing.amountPaidCents || 0)
    const totals = buildTotals(lines, discountType, discountValue, taxRateBps, amountPaid)

    const paymentTerms = isPaymentTerms(String(input.paymentTerms || existing.paymentTerms || 'net14'))
      ? (String(input.paymentTerms || existing.paymentTerms) as PaymentTermsValue)
      : 'net14'

    const payments = await payload.count({
      collection: 'invoice-payments',
      user,
      overrideAccess: false,
      where: { invoice: { equals: rawId } },
    })

    const nextStatus = deriveInvoiceStatus({
      currentStatus: existing.status,
      voidedAt: existing.voidedAt,
      totalCents: totals.totalCents,
      amountPaidCents: amountPaid,
      balanceDueCents: totals.balanceDueCents,
      dueDate: String(input.dueDate || existing.dueDate),
      sentAt: existing.sentAt,
      firstViewedAt: existing.firstViewedAt,
      paymentCount: payments.totalDocs,
    })

    await payload.update({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      data: {
        event: input.eventId ? String(input.eventId) : null,
        issueDate: String(input.issueDate || existing.issueDate),
        dueDate: String(input.dueDate || existing.dueDate),
        paymentTerms,
        paymentTermsCustom:
          paymentTerms === 'custom'
            ? String(input.paymentTermsCustom || '').trim().slice(0, 200) || null
            : null,
        billing: {
          name: String(input.billToName || existing.billing?.name || '').trim().slice(0, 120),
          email: String(input.billToEmail || existing.billing?.email || '').trim().slice(0, 160),
          phone: String(input.billToPhone || existing.billing?.phone || '').trim().slice(0, 40) || null,
          company:
            String(input.billToCompany || existing.billing?.company || '').trim().slice(0, 120) ||
            null,
        },
        lineItems: lines,
        discountType,
        discountValue,
        taxRateBps,
        depositRequiredCents,
        subtotalCents: totals.subtotalCents,
        creditCents: totals.creditCents,
        discountCents: totals.discountCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        amountPaidCents: amountPaid,
        balanceDueCents: totals.balanceDueCents,
        clientMemo: String(input.clientMemo || '').trim().slice(0, 4000) || null,
        internalNotes: String(input.internalNotes || '').trim().slice(0, 4000) || null,
        status: nextStatus,
        updatedBy: user.id,
      },
    })

    revalidateInvoice(rawId)
    return { ok: true, id: rawId }
  } catch (err) {
    console.error('[os/invoices] update', err)
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unable to update invoice.',
    }
  }
}

export async function duplicateInvoice(
  rawId: unknown,
): Promise<ActionResult<{ id: string }>> {
  const { user, error } = await requireWriter()
  if (error) return { ok: false, message: error }
  if (typeof rawId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) {
    return { ok: false, message: 'Invalid invoice.' }
  }

  try {
    const payload = await getPayload({ config })
    const source = await payload.findByID({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 0,
    })

    const invoiceNumber = await allocateInvoiceNumber()
    const token = generateInvoiceToken()
    const totals = buildTotals(
      (source.lineItems || []).map((l, i) => ({
        itemKey: l.itemKey || `dup-${i}`,
        sortOrder: i,
        description: l.description || 'Line item',
        detail: l.detail || null,
        billingType: (l.billingType || 'flat') as BillingTypeValue,
        quantity: Number(l.quantity || 0),
        unitPriceCents: Number(l.unitPriceCents || 0),
        isCredit: Boolean(l.isCredit),
        lineTotalCents: Number(l.lineTotalCents || 0),
      })),
      (source.discountType || 'none') as DiscountTypeValue,
      Number(source.discountValue || 0),
      Number(source.taxRateBps || 0),
      0,
    )

    const created = await payload.create({
      collection: 'invoices',
      user,
      overrideAccess: false,
      data: {
        invoiceNumber,
        status: 'draft',
        client: typeof source.client === 'string' ? source.client : source.client,
        event: source.event || null,
        issueDate: new Date().toISOString(),
        dueDate: source.dueDate,
        paymentTerms: source.paymentTerms,
        paymentTermsCustom: source.paymentTermsCustom,
        billing: source.billing,
        lineItems: (source.lineItems || []).map((l, i) => ({
          ...l,
          itemKey: `dup-${Date.now()}-${i}`,
          sortOrder: i,
          lineTotalCents: totals.lines[i]?.lineTotalCents ?? l.lineTotalCents,
        })),
        discountType: source.discountType,
        discountValue: source.discountValue,
        taxRateBps: source.taxRateBps,
        depositRequiredCents: source.depositRequiredCents,
        subtotalCents: totals.subtotalCents,
        creditCents: totals.creditCents,
        discountCents: totals.discountCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        amountPaidCents: 0,
        balanceDueCents: totals.balanceDueCents,
        clientMemo: source.clientMemo,
        internalNotes: source.internalNotes,
        publicTokenHash: hashInvoiceToken(token),
        publicTokenCreatedAt: new Date().toISOString(),
        publicTokenPlaintextOnce: token,
        createdBy: user.id,
        updatedBy: user.id,
      },
    })

    revalidateInvoice(String(created.id))
    return { ok: true, id: String(created.id) }
  } catch (err) {
    console.error('[os/invoices] duplicate', err)
    return { ok: false, message: 'Unable to duplicate invoice.' }
  }
}

export async function voidInvoice(
  rawId: unknown,
  rawReason: unknown,
): Promise<ActionResult<{ id: string }>> {
  const { user, error } = await requireWriter()
  if (error) return { ok: false, message: error }
  if (typeof rawId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) {
    return { ok: false, message: 'Invalid invoice.' }
  }

  try {
    const payload = await getPayload({ config })
    const existing = await payload.findByID({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 0,
    })
    if (existing.status === 'voided') {
      return { ok: false, message: 'Invoice is already voided.' }
    }

    await payload.update({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      data: {
        status: 'voided',
        voidedAt: new Date().toISOString(),
        voidedBy: user.id,
        voidReason: String(rawReason || '').trim().slice(0, 500) || 'Voided',
        publicTokenRevokedAt: new Date().toISOString(),
        publicTokenPlaintextOnce: null,
        updatedBy: user.id,
      },
    })

    revalidateInvoice(rawId)
    return { ok: true, id: rawId }
  } catch (err) {
    console.error('[os/invoices] void', err)
    return { ok: false, message: 'Unable to void invoice.' }
  }
}

export async function markInvoiceSent(
  rawId: unknown,
): Promise<ActionResult<{ id: string }>> {
  const { user, error } = await requireWriter()
  if (error) return { ok: false, message: error }
  if (typeof rawId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) {
    return { ok: false, message: 'Invalid invoice.' }
  }

  try {
    const payload = await getPayload({ config })
    const existing = await payload.findByID({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 0,
    })
    if (existing.status === 'voided') {
      return { ok: false, message: 'Voided invoices cannot be marked sent.' }
    }

    const status = deriveInvoiceStatus({
      currentStatus: 'sent',
      voidedAt: null,
      totalCents: Number(existing.totalCents || 0),
      amountPaidCents: Number(existing.amountPaidCents || 0),
      balanceDueCents: Number(existing.balanceDueCents || 0),
      dueDate: existing.dueDate,
      sentAt: existing.sentAt || new Date().toISOString(),
      firstViewedAt: existing.firstViewedAt,
    })

    await payload.update({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      data: {
        status: status === 'draft' ? 'sent' : status,
        sentAt: existing.sentAt || new Date().toISOString(),
        updatedBy: user.id,
      },
    })

    revalidateInvoice(rawId)
    return { ok: true, id: rawId }
  } catch (err) {
    console.error('[os/invoices] markSent', err)
    return { ok: false, message: 'Unable to mark invoice sent.' }
  }
}

export async function ensureInvoicePublicLink(
  rawId: unknown,
): Promise<ActionResult<{ url: string; token: string }>> {
  const { user, error } = await requireWriter()
  if (error) return { ok: false, message: error }
  if (typeof rawId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) {
    return { ok: false, message: 'Invalid invoice.' }
  }

  try {
    const payload = await getPayload({ config })
    const existing = await payload.findByID({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 0,
    })
    if (existing.status === 'voided') {
      return { ok: false, message: 'Voided invoices have no public link.' }
    }

    if (existing.publicTokenPlaintextOnce && existing.publicTokenHash) {
      return {
        ok: true,
        url: publicInvoiceUrl(existing.publicTokenPlaintextOnce),
        token: existing.publicTokenPlaintextOnce,
      }
    }

    const token = generateInvoiceToken()
    await payload.update({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      data: {
        publicTokenHash: hashInvoiceToken(token),
        publicTokenCreatedAt: new Date().toISOString(),
        publicTokenRevokedAt: null,
        publicTokenPlaintextOnce: token,
        updatedBy: user.id,
      },
    })

    revalidateInvoice(rawId)
    return { ok: true, url: publicInvoiceUrl(token), token }
  } catch (err) {
    console.error('[os/invoices] ensureLink', err)
    return { ok: false, message: 'Unable to create invoice link.' }
  }
}

export async function recordInvoicePayment(
  rawId: unknown,
  rawInput: unknown,
): Promise<ActionResult<{ id: string }>> {
  const { user, error } = await requireWriter()
  if (error) return { ok: false, message: error }
  if (typeof rawId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) {
    return { ok: false, message: 'Invalid invoice.' }
  }

  try {
    const input = (rawInput || {}) as Record<string, unknown>
    const amountCents = Math.floor(Number(input.amountCents))
    if (!Number.isFinite(amountCents) || amountCents < 1) {
      return { ok: false, message: 'Payment amount must be at least $0.01.' }
    }
    const method = isPaymentMethod(String(input.method || ''))
      ? (input.method as PaymentMethodValue)
      : 'other'
    const paidAt = String(input.paidAt || new Date().toISOString())

    const payload = await getPayload({ config })
    const invoice = await payload.findByID({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 0,
    })
    if (invoice.status === 'voided' || invoice.status === 'draft') {
      return {
        ok: false,
        message:
          invoice.status === 'draft'
            ? 'Mark the invoice sent before recording payments.'
            : 'Cannot record payments on a voided invoice.',
      }
    }

    await payload.create({
      collection: 'invoice-payments',
      user,
      overrideAccess: false,
      data: {
        invoice: rawId,
        amountCents,
        paidAt,
        method,
        reference: String(input.reference || '').trim().slice(0, 120) || null,
        internalNote: String(input.internalNote || '').trim().slice(0, 1000) || null,
        recordedBy: user.id,
      },
    })

    const payments = await payload.find({
      collection: 'invoice-payments',
      user,
      overrideAccess: false,
      depth: 0,
      limit: 500,
      where: { invoice: { equals: rawId } },
      select: { amountCents: true },
    })

    const amountPaidCents = payments.docs.reduce(
      (sum, p) => sum + Number(p.amountCents || 0),
      0,
    )
    const totalCents = Number(invoice.totalCents || 0)
    const balanceDueCents = Math.max(0, totalCents - amountPaidCents)
    const status = deriveInvoiceStatus({
      currentStatus: invoice.status,
      voidedAt: invoice.voidedAt,
      totalCents,
      amountPaidCents,
      balanceDueCents,
      dueDate: invoice.dueDate,
      sentAt: invoice.sentAt,
      firstViewedAt: invoice.firstViewedAt,
      paymentCount: payments.docs.length,
    })

    await payload.update({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      data: {
        amountPaidCents,
        balanceDueCents,
        status,
        updatedBy: user.id,
      },
    })

    revalidateInvoice(rawId)
    return { ok: true, id: rawId }
  } catch (err) {
    console.error('[os/invoices] payment', err)
    return { ok: false, message: 'Unable to record payment.' }
  }
}

export async function sendInvoiceEmail(
  rawId: unknown,
  rawRecipient: unknown,
): Promise<ActionResult<{ id: string }>> {
  const { user, error } = await requireWriter()
  if (error) return { ok: false, message: error }
  if (typeof rawId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) {
    return { ok: false, message: 'Invalid invoice.' }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      message: 'Email is not configured. Set RESEND_API_KEY to send invoices.',
    }
  }

  try {
    const payload = await getPayload({ config })
    const invoice = await payload.findByID({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      depth: 0,
    })
    if (invoice.status === 'voided') {
      return { ok: false, message: 'Cannot send a voided invoice.' }
    }

    if (invoice.lastSendAttemptAt) {
      const last = new Date(invoice.lastSendAttemptAt).getTime()
      if (Date.now() - last < INVOICE_SEND_COOLDOWN_MS) {
        return {
          ok: false,
          message: 'Please wait a moment before sending again.',
        }
      }
    }

    await payload.update({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      data: { lastSendAttemptAt: new Date().toISOString() },
    })

    let token = invoice.publicTokenPlaintextOnce
    if (!token || !invoice.publicTokenHash) {
      token = generateInvoiceToken()
      await payload.update({
        collection: 'invoices',
        id: rawId,
        user,
        overrideAccess: false,
        data: {
          publicTokenHash: hashInvoiceToken(token),
          publicTokenCreatedAt: new Date().toISOString(),
          publicTokenRevokedAt: null,
          publicTokenPlaintextOnce: token,
        },
      })
    }

    const recipient = String(rawRecipient || invoice.billing?.email || '')
      .trim()
      .toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      return { ok: false, message: 'Enter a valid recipient email.' }
    }

    const url = publicInvoiceUrl(token)
    const email = buildInvoiceEmail({
      clientName: invoice.billing?.name || 'there',
      invoiceNumber: invoice.invoiceNumber,
      totalCents: Number(invoice.totalCents || 0),
      balanceDueCents: Number(invoice.balanceDueCents || 0),
      dueDateLabel: formatShortDate(invoice.dueDate),
      invoiceUrl: url,
      memo: invoice.clientMemo,
    })

    const resend = new Resend(apiKey)
    const result = await resend.emails.send({
      from: 'Plate The Umpqua <info@platetheumpqua.com>',
      to: recipient,
      subject: email.subject,
      html: email.html,
      text: email.text,
    })

    if (result.error) {
      await payload.update({
        collection: 'invoices',
        id: rawId,
        user,
        overrideAccess: false,
        data: {
          lastSendError: String(result.error.message || 'Send failed').slice(0, 300),
        },
      })
      return { ok: false, message: 'Email provider rejected the send.' }
    }

    const status = deriveInvoiceStatus({
      currentStatus: 'sent',
      voidedAt: null,
      totalCents: Number(invoice.totalCents || 0),
      amountPaidCents: Number(invoice.amountPaidCents || 0),
      balanceDueCents: Number(invoice.balanceDueCents || 0),
      dueDate: invoice.dueDate,
      sentAt: new Date().toISOString(),
      firstViewedAt: invoice.firstViewedAt,
    })

    await payload.update({
      collection: 'invoices',
      id: rawId,
      user,
      overrideAccess: false,
      data: {
        status: status === 'draft' ? 'sent' : status,
        sentAt: invoice.sentAt || new Date().toISOString(),
        lastSentTo: recipient,
        lastSendError: null,
        updatedBy: user.id,
      },
    })

    revalidateInvoice(rawId)
    return { ok: true, id: rawId }
  } catch (err) {
    console.error('[os/invoices] send', err)
    return { ok: false, message: 'Unable to send invoice email.' }
  }
}
