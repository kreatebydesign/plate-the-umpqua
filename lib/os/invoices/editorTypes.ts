import type { BillingTypeValue } from './invoiceConstants'

export type EditorClientOption = {
  id: string
  name: string
  email: string
  phone: string | null
}

export type EditorEventOption = {
  id: string
  name: string
  clientId: string | null
  dateLabel: string
  guestCount: number | null
}

export type EditorLine = {
  itemKey: string
  description: string
  detail: string
  billingType: BillingTypeValue
  quantity: number
  unitPriceCents: number
  isCredit: boolean
}
