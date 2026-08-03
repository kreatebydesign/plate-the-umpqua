import {
  clampNonNegativeCents,
  percentOfCents,
  taxFromBps,
} from './money'
import type { DiscountTypeValue } from './invoiceConstants'

export type CalcLineInput = {
  quantity: number
  unitPriceCents: number
  isCredit?: boolean
}

export type CalcInvoiceInput = {
  lines: CalcLineInput[]
  discountType?: DiscountTypeValue | null
  /** Fixed: cents. Percent: percent×100 (1050 = 10.50%). */
  discountValue?: number | null
  taxRateBps?: number | null
  amountPaidCents?: number | null
}

export type CalcInvoiceResult = {
  lines: Array<{ lineTotalCents: number }>
  subtotalCents: number
  creditCents: number
  discountCents: number
  taxCents: number
  totalCents: number
  amountPaidCents: number
  balanceDueCents: number
}

export function lineTotalCents(line: CalcLineInput): number {
  const qty = Number(line.quantity)
  const unit = Number(line.unitPriceCents)
  if (!Number.isFinite(qty) || qty < 0) {
    throw new Error('quantity must be a non-negative number')
  }
  if (!Number.isFinite(unit) || unit < 0 || !Number.isInteger(unit)) {
    throw new Error('unitPriceCents must be a non-negative integer')
  }
  // Allow fractional quantities (e.g. 2.5 hours) — round line to cents.
  const raw = Math.round(qty * unit)
  return line.isCredit ? -raw : raw
}

export function calculateInvoice(input: CalcInvoiceInput): CalcInvoiceResult {
  const computedLines = input.lines.map((line) => ({
    lineTotalCents: lineTotalCents(line),
  }))

  let subtotalCents = 0
  let creditCents = 0
  for (const line of computedLines) {
    if (line.lineTotalCents >= 0) subtotalCents += line.lineTotalCents
    else creditCents += Math.abs(line.lineTotalCents)
  }

  const discountType = input.discountType || 'none'
  const discountValue = clampNonNegativeCents(Number(input.discountValue || 0))
  const afterCredits = Math.max(0, subtotalCents - creditCents)

  let discountCents = 0
  if (discountType === 'fixed') {
    discountCents = Math.min(discountValue, afterCredits)
  } else if (discountType === 'percent') {
    discountCents = Math.min(percentOfCents(afterCredits, discountValue), afterCredits)
  }

  const taxableBase = Math.max(0, afterCredits - discountCents)
  const taxRateBps = clampNonNegativeCents(Number(input.taxRateBps || 0))
  const taxCents = taxFromBps(taxableBase, taxRateBps)
  const totalCents = taxableBase + taxCents

  const amountPaidCents = clampNonNegativeCents(Number(input.amountPaidCents || 0))
  const balanceDueCents = Math.max(0, totalCents - amountPaidCents)

  return {
    lines: computedLines,
    subtotalCents,
    creditCents,
    discountCents,
    taxCents,
    totalCents,
    amountPaidCents,
    balanceDueCents,
  }
}
