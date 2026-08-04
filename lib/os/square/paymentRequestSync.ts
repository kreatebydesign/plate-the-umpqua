/**
 * Pure helpers for reconciling Square invoice payment requests into Plate ledger amounts.
 * Never logs or returns secrets.
 */

export type SquarePaymentRequestLike = {
  uid?: string | null
  /** @deprecated Square InvoicePaymentRequest has no status field; kept for defensive checks. */
  status?: string | null
  computedAmountMoney?: { amount?: number | bigint | string | null } | null
  totalCompletedAmountMoney?: { amount?: number | bigint | string | null } | null
}

export type CompletedSquarePaymentRequest = {
  uid: string
  amountCents: number
}

function moneyToCents(amount: number | bigint | string | null | undefined): number {
  if (amount == null) return 0
  if (typeof amount === 'bigint') return Number(amount)
  if (typeof amount === 'string') return Number(amount)
  return Number(amount)
}

/**
 * Extract completed payment amounts from Square invoice payment requests.
 * Prefer totalCompletedAmountMoney (actual paid). Do not rely on a status field —
 * InvoicePaymentRequest does not expose one in the Square API.
 */
export function extractCompletedSquarePaymentRequests(
  paymentRequests: SquarePaymentRequestLike[] | null | undefined,
): CompletedSquarePaymentRequest[] {
  const out: CompletedSquarePaymentRequest[] = []
  for (const req of paymentRequests ?? []) {
    const uid = req.uid?.trim()
    if (!uid) continue

    const completedCents = moneyToCents(req.totalCompletedAmountMoney?.amount)
    if (completedCents <= 0) continue

    out.push({ uid, amountCents: completedCents })
  }
  return out
}
