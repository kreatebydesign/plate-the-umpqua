/**
 * Square OAuth scopes — least privilege for Plate OS invoice payments.
 * Only request scopes we actually use; never request POS, catalog, or employee scopes.
 */

export const SQUARE_SCOPES = [
  'MERCHANT_PROFILE_READ',
  'CUSTOMERS_READ',
  'CUSTOMERS_WRITE',
  'ORDERS_READ',
  'ORDERS_WRITE',
  'INVOICES_READ',
  'INVOICES_WRITE',
  'PAYMENTS_READ',
] as const

export type SquareScope = (typeof SQUARE_SCOPES)[number]

/** Space-delimited scope string for OAuth authorize URL. */
export function scopeString(): string {
  return SQUARE_SCOPES.join(' ')
}

/** Validate that a returned scope string covers all required scopes. */
export function validateGrantedScopes(granted: string): {
  ok: boolean
  missing: string[]
} {
  const grantedSet = new Set(granted.split(/[\s,]+/).filter(Boolean))
  const missing = SQUARE_SCOPES.filter((s) => !grantedSet.has(s))
  return { ok: missing.length === 0, missing }
}
