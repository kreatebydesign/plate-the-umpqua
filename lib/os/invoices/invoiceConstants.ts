export const INVOICE_PAGE_SIZE_DEFAULT = 20
export const INVOICE_PAGE_SIZE_MAX = 50
export const INVOICE_SEARCH_MAX = 80
export const INVOICE_SEND_COOLDOWN_MS = 60_000

export const PLATE_INVOICE_BUSINESS = {
  name: 'Plate The Umpqua',
  email: 'info@platetheumpqua.com',
  region: 'Roseburg · Umpqua Valley, Oregon',
  phone: '',
} as const

export const INVOICE_STATUS_VALUES = [
  'draft',
  'sent',
  'viewed',
  'partiallyPaid',
  'paid',
  'overdue',
  'voided',
] as const

export type InvoiceStatusValue = (typeof INVOICE_STATUS_VALUES)[number]

export const INVOICE_STATUS_LABELS: Record<InvoiceStatusValue, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  partiallyPaid: 'Partially paid',
  paid: 'Paid',
  overdue: 'Overdue',
  voided: 'Voided',
}

export const BILLING_TYPE_VALUES = [
  'flat',
  'perEvent',
  'perPerson',
  'perHour',
  'quantity',
] as const

export type BillingTypeValue = (typeof BILLING_TYPE_VALUES)[number]

export const BILLING_TYPE_LABELS: Record<BillingTypeValue, string> = {
  flat: 'Flat / custom',
  perEvent: 'Per event',
  perPerson: 'Per person / guest',
  perHour: 'Per hour',
  quantity: 'Quantity / item',
}

export const BILLING_PRESET_DESCRIPTIONS = [
  'Event catering',
  'Per guest',
  'Staffing hours',
  'Client-provided food credit',
  'Equipment rental',
  'Travel',
  'Custom service',
] as const

export const PAYMENT_TERMS_VALUES = [
  'dueOnReceipt',
  'net7',
  'net14',
  'net30',
  'custom',
] as const

export type PaymentTermsValue = (typeof PAYMENT_TERMS_VALUES)[number]

export const PAYMENT_TERMS_LABELS: Record<PaymentTermsValue, string> = {
  dueOnReceipt: 'Due on receipt',
  net7: 'Net 7',
  net14: 'Net 14',
  net30: 'Net 30',
  custom: 'Custom',
}

export const DISCOUNT_TYPE_VALUES = ['none', 'fixed', 'percent'] as const
export type DiscountTypeValue = (typeof DISCOUNT_TYPE_VALUES)[number]

export const PAYMENT_METHOD_VALUES = [
  'cash',
  'check',
  'card',
  'bankTransfer',
  'square',
  'other',
] as const

export type PaymentMethodValue = (typeof PAYMENT_METHOD_VALUES)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodValue, string> = {
  cash: 'Cash',
  check: 'Check',
  card: 'Card',
  bankTransfer: 'Bank transfer',
  square: 'Square',
  other: 'Other',
}

export const INVOICE_SORT_VALUES = [
  'newest',
  'oldest',
  'dueSoonest',
  'amountHigh',
] as const

export type InvoiceSortValue = (typeof INVOICE_SORT_VALUES)[number]

export const INVOICE_SORT_OPTIONS: Array<{ value: InvoiceSortValue; label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'dueSoonest', label: 'Due soonest' },
  { value: 'amountHigh', label: 'Highest total' },
]

export function isInvoiceStatus(value: string): value is InvoiceStatusValue {
  return (INVOICE_STATUS_VALUES as readonly string[]).includes(value)
}

export function isBillingType(value: string): value is BillingTypeValue {
  return (BILLING_TYPE_VALUES as readonly string[]).includes(value)
}

export function isPaymentTerms(value: string): value is PaymentTermsValue {
  return (PAYMENT_TERMS_VALUES as readonly string[]).includes(value)
}

export function isDiscountType(value: string): value is DiscountTypeValue {
  return (DISCOUNT_TYPE_VALUES as readonly string[]).includes(value)
}

export function isPaymentMethod(value: string): value is PaymentMethodValue {
  return (PAYMENT_METHOD_VALUES as readonly string[]).includes(value)
}

export function isInvoiceSort(value: string): value is InvoiceSortValue {
  return (INVOICE_SORT_VALUES as readonly string[]).includes(value)
}

export function paymentTermsLabel(
  terms?: string | null,
  custom?: string | null,
): string {
  if (!terms) return '—'
  if (terms === 'custom') return custom?.trim() || 'Custom terms'
  return PAYMENT_TERMS_LABELS[terms as PaymentTermsValue] || terms
}

export function dueDateFromTerms(
  issueDate: Date,
  terms: PaymentTermsValue,
): Date {
  const d = new Date(issueDate.getTime())
  switch (terms) {
    case 'dueOnReceipt':
      return d
    case 'net7':
      d.setUTCDate(d.getUTCDate() + 7)
      return d
    case 'net14':
      d.setUTCDate(d.getUTCDate() + 14)
      return d
    case 'net30':
      d.setUTCDate(d.getUTCDate() + 30)
      return d
    default:
      d.setUTCDate(d.getUTCDate() + 14)
      return d
  }
}
