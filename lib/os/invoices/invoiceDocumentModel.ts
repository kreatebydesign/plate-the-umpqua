import { formatUsdFromCents } from './money'
import {
  BILLING_TYPE_LABELS,
  PLATE_INVOICE_BUSINESS,
  getInvoiceBusiness,
  paymentTermsLabel,
  type BillingTypeValue,
} from './invoiceConstants'
import { formatPhoneForInvoice } from './formatPhone'
import { formatShortDate } from '../formatDate'

/** Client-safe status labels — never expose Draft on client documents. */
export const CLIENT_SAFE_STATUS_LABELS: Record<string, string | null> = {
  draft: null,
  sent: null,
  viewed: null,
  partiallyPaid: 'Partially paid',
  paid: 'Paid',
  overdue: 'Past due',
  voided: 'Voided',
}

export type InvoiceDocumentLine = {
  description: string
  detail: string | null
  billingTypeLabel: string
  quantityLabel: string
  unitPriceLabel: string
  lineTotalLabel: string
  isCredit: boolean
}

export type InvoiceDocumentTotalsRow = {
  key: string
  label: string
  valueLabel: string
  emphasis?: 'normal' | 'strong' | 'due'
}

export type InvoiceDocumentModel = {
  invoiceNumber: string
  clientStatusLabel: string | null
  issueDateLabel: string
  dueDateLabel: string
  paymentTermsLabel: string
  business: ReturnType<typeof getInvoiceBusiness>
  billTo: {
    name: string
    email: string
    phone: string | null
    company: string | null
  }
  event: {
    name: string | null
    dateLabel: string | null
    venue: string | null
    guestCount: number | null
  }
  lines: InvoiceDocumentLine[]
  totalsRows: InvoiceDocumentTotalsRow[]
  amountDueNowLabel: string
  amountDueNowCaption: string
  clientMemo: string | null
  squarePaymentUrl: string | null
  thankYou: string
  /** Raw cents for tests / parity checks */
  cents: {
    subtotal: number
    credit: number
    discount: number
    tax: number
    total: number
    amountPaid: number
    balanceDue: number
    depositRequired: number
    depositDueNow: number
    remainingAfterDeposit: number
  }
}

export function clientSafeStatusLabel(status: string | null | undefined): string | null {
  if (!status) return null
  if (status in CLIENT_SAFE_STATUS_LABELS) {
    return CLIENT_SAFE_STATUS_LABELS[status]
  }
  return null
}

export function buildDepositPresentation(input: {
  totalCents: number
  amountPaidCents: number
  balanceDueCents: number
  depositRequiredCents: number
}): {
  depositDueNowCents: number
  remainingAfterDepositCents: number
  amountDueNowCents: number
  amountDueNowCaption: string
} {
  const total = Math.max(0, Math.floor(input.totalCents))
  const paid = Math.max(0, Math.floor(input.amountPaidCents))
  const balance = Math.max(0, Math.floor(input.balanceDueCents))
  const depositRequired = Math.max(0, Math.floor(input.depositRequiredCents))

  if (balance <= 0) {
    return {
      depositDueNowCents: 0,
      remainingAfterDepositCents: 0,
      amountDueNowCents: 0,
      amountDueNowCaption: 'Paid in full',
    }
  }

  if (depositRequired > 0 && paid < depositRequired) {
    const depositDueNow = Math.min(depositRequired - paid, balance)
    const remainingAfterDeposit = Math.max(0, total - Math.max(depositRequired, paid))
    return {
      depositDueNowCents: depositDueNow,
      remainingAfterDepositCents: remainingAfterDeposit,
      amountDueNowCents: depositDueNow,
      amountDueNowCaption: 'Deposit due now',
    }
  }

  return {
    depositDueNowCents: 0,
    remainingAfterDepositCents: 0,
    amountDueNowCents: balance,
    amountDueNowCaption: paid > 0 ? 'Amount due now' : 'Amount due',
  }
}

export function buildInvoiceDocumentTotals(input: {
  subtotalCents: number
  creditCents: number
  discountCents: number
  taxCents: number
  totalCents: number
  amountPaidCents: number
  balanceDueCents: number
  depositRequiredCents: number
}): {
  rows: InvoiceDocumentTotalsRow[]
  deposit: ReturnType<typeof buildDepositPresentation>
} {
  const deposit = buildDepositPresentation(input)
  const rows: InvoiceDocumentTotalsRow[] = [
    {
      key: 'subtotal',
      label: 'Subtotal',
      valueLabel: formatUsdFromCents(input.subtotalCents),
    },
  ]

  if (input.creditCents > 0) {
    rows.push({
      key: 'credits',
      label: 'Credits',
      valueLabel: `−${formatUsdFromCents(input.creditCents)}`,
    })
  }
  if (input.discountCents > 0) {
    rows.push({
      key: 'discount',
      label: 'Discount',
      valueLabel: `−${formatUsdFromCents(input.discountCents)}`,
    })
  }
  if (input.taxCents > 0) {
    rows.push({
      key: 'tax',
      label: 'Tax',
      valueLabel: formatUsdFromCents(input.taxCents),
    })
  }

  rows.push({
    key: 'total',
    label: 'Total invoice',
    valueLabel: formatUsdFromCents(input.totalCents),
    emphasis: 'strong',
  })

  if (input.amountPaidCents > 0) {
    rows.push({
      key: 'paid',
      label: 'Payments received',
      valueLabel: formatUsdFromCents(input.amountPaidCents),
    })
  }

  if (input.depositRequiredCents > 0 && deposit.depositDueNowCents > 0) {
    rows.push({
      key: 'depositDue',
      label: 'Deposit due now',
      valueLabel: formatUsdFromCents(deposit.depositDueNowCents),
      emphasis: 'due',
    })
    if (deposit.remainingAfterDepositCents > 0) {
      rows.push({
        key: 'afterDeposit',
        label: 'Remaining after deposit',
        valueLabel: formatUsdFromCents(deposit.remainingAfterDepositCents),
      })
    }
    rows.push({
      key: 'balance',
      label: 'Total invoice balance',
      valueLabel: formatUsdFromCents(input.balanceDueCents),
    })
  } else {
    rows.push({
      key: 'balance',
      label: deposit.amountDueNowCaption === 'Paid in full' ? 'Balance' : 'Outstanding balance',
      valueLabel: formatUsdFromCents(input.balanceDueCents),
      emphasis: input.balanceDueCents > 0 ? 'due' : 'strong',
    })
  }

  return { rows, deposit }
}

type EventLike = {
  eventName?: string | null
  eventDate?: string | null
  guestCount?: number | null
  venue?: unknown
}

export function buildInvoiceDocumentModel(input: {
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  paymentTerms?: string | null
  paymentTermsCustom?: string | null
  billing?: {
    name?: string | null
    email?: string | null
    phone?: string | null
    company?: string | null
  } | null
  event?: EventLike | string | null
  lineItems?: Array<{
    description?: string | null
    detail?: string | null
    billingType?: string | null
    quantity?: number | null
    unitPriceCents?: number | null
    lineTotalCents?: number | null
    isCredit?: boolean | null
  }> | null
  subtotalCents: number
  creditCents: number
  discountCents: number
  taxCents: number
  totalCents: number
  amountPaidCents: number
  balanceDueCents: number
  depositRequiredCents: number
  clientMemo?: string | null
  squarePaymentUrl?: string | null
}): InvoiceDocumentModel {
  const { rows, deposit } = buildInvoiceDocumentTotals({
    subtotalCents: input.subtotalCents,
    creditCents: input.creditCents,
    discountCents: input.discountCents,
    taxCents: input.taxCents,
    totalCents: input.totalCents,
    amountPaidCents: input.amountPaidCents,
    balanceDueCents: input.balanceDueCents,
    depositRequiredCents: input.depositRequiredCents,
  })

  const eventObj =
    input.event && typeof input.event === 'object' ? (input.event as EventLike) : null
  let venueName: string | null = null
  const venueRel = eventObj?.venue
  if (venueRel && typeof venueRel === 'object' && venueRel !== null) {
    const named = venueRel as { name?: string; venueName?: string; title?: string }
    venueName = named.name || named.venueName || named.title || null
  }

  const lines: InvoiceDocumentLine[] = (input.lineItems || []).map((line) => {
    const billingType = (line.billingType || 'flat') as BillingTypeValue
    const qty = Number(line.quantity || 0)
    return {
      description: line.description || 'Line item',
      detail: line.detail?.trim() || null,
      billingTypeLabel: BILLING_TYPE_LABELS[billingType] || billingType,
      quantityLabel: Number.isInteger(qty) ? String(qty) : String(qty),
      unitPriceLabel: formatUsdFromCents(Number(line.unitPriceCents || 0)),
      lineTotalLabel: formatUsdFromCents(Number(line.lineTotalCents || 0)),
      isCredit: Boolean(line.isCredit),
    }
  })

  return {
    invoiceNumber: input.invoiceNumber,
    clientStatusLabel: clientSafeStatusLabel(input.status),
    issueDateLabel: formatShortDate(input.issueDate),
    dueDateLabel: formatShortDate(input.dueDate),
    paymentTermsLabel: paymentTermsLabel(input.paymentTerms, input.paymentTermsCustom),
    business: getInvoiceBusiness(),
    billTo: {
      name: input.billing?.name?.trim() || '—',
      email: input.billing?.email?.trim() || '—',
      phone: formatPhoneForInvoice(input.billing?.phone),
      company: input.billing?.company?.trim() || null,
    },
    event: {
      name: eventObj?.eventName?.trim() || null,
      dateLabel: eventObj?.eventDate ? formatShortDate(eventObj.eventDate) : null,
      venue: venueName,
      guestCount:
        typeof eventObj?.guestCount === 'number' && eventObj.guestCount > 0
          ? eventObj.guestCount
          : null,
    },
    lines,
    totalsRows: rows,
    amountDueNowLabel: formatUsdFromCents(deposit.amountDueNowCents),
    amountDueNowCaption: deposit.amountDueNowCaption,
    clientMemo: input.clientMemo?.trim() || null,
    squarePaymentUrl: input.squarePaymentUrl || null,
    thankYou: `Thank you for choosing ${PLATE_INVOICE_BUSINESS.name}.`,
    cents: {
      subtotal: input.subtotalCents,
      credit: input.creditCents,
      discount: input.discountCents,
      tax: input.taxCents,
      total: input.totalCents,
      amountPaid: input.amountPaidCents,
      balanceDue: input.balanceDueCents,
      depositRequired: input.depositRequiredCents,
      depositDueNow: deposit.depositDueNowCents,
      remainingAfterDeposit: deposit.remainingAfterDepositCents,
    },
  }
}
