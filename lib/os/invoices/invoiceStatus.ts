import { startOfTodayInTimezone } from '../formatDate'
import type { InvoiceStatusValue } from './invoiceConstants'

export type DeriveStatusInput = {
  currentStatus?: string | null
  voidedAt?: string | Date | null
  totalCents: number
  amountPaidCents: number
  balanceDueCents: number
  dueDate?: string | Date | null
  sentAt?: string | Date | null
  firstViewedAt?: string | Date | null
  /** Explicit payment count — paid requires at least one payment when total > 0 */
  paymentCount?: number
  now?: Date
}

/**
 * Derive display/persisted status from payments and dates.
 * Voided is terminal and never overridden.
 */
export function deriveInvoiceStatus(input: DeriveStatusInput): InvoiceStatusValue {
  if (input.voidedAt || input.currentStatus === 'voided') {
    return 'voided'
  }

  const total = Math.max(0, input.totalCents)
  const paid = Math.max(0, input.amountPaidCents)
  const balance = Math.max(0, input.balanceDueCents)
  const paymentCount = input.paymentCount ?? (paid > 0 ? 1 : 0)

  if (total > 0 && balance === 0 && paymentCount > 0) {
    return 'paid'
  }

  if (paid > 0 && balance > 0) {
    return 'partiallyPaid'
  }

  const todayStart = startOfTodayInTimezone(input.now ?? new Date())
  if (input.dueDate && balance > 0) {
    const due = new Date(input.dueDate)
    if (!Number.isNaN(due.getTime()) && due < todayStart) {
      return 'overdue'
    }
  }

  if (input.firstViewedAt) return 'viewed'
  if (input.sentAt || input.currentStatus === 'sent') return 'sent'
  if (input.currentStatus === 'viewed') return 'viewed'
  if (input.currentStatus === 'sent') return 'sent'

  return 'draft'
}

export function canMutateInvoiceContent(status: string | null | undefined): boolean {
  return status !== 'voided'
}

export function canRecordPayment(status: string | null | undefined): boolean {
  return status !== 'voided' && status !== 'draft'
}

export function isVoidTerminal(status: string | null | undefined): boolean {
  return status === 'voided'
}
