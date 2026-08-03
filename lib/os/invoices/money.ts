/** Integer-cent money helpers — never use floating-point for totals. */

export function assertFiniteInt(value: unknown, label = 'amount'): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error(`${label} must be an integer`)
  }
  return n
}

export function clampNonNegativeCents(value: number): number {
  return Math.max(0, assertFiniteInt(value, 'cents'))
}

/** Round a non-negative decimal money amount (dollars) to cents. */
export function dollarsToCents(dollars: number): number {
  if (!Number.isFinite(dollars)) throw new Error('Invalid dollar amount')
  return Math.round(dollars * 100)
}

export function centsToDollarsNumber(cents: number): number {
  return assertFiniteInt(cents, 'cents') / 100
}

export function formatUsdFromCents(cents: number): string {
  const value = assertFiniteInt(cents, 'cents') / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

/**
 * Percent stored as percent×100 (e.g. 10.5% → 1050).
 * Apply to an integer cent base with half-up rounding.
 */
export function percentOfCents(baseCents: number, percentTimes100: number): number {
  const base = clampNonNegativeCents(baseCents)
  const pct = clampNonNegativeCents(percentTimes100)
  // (base * pct) / 10000 with half-up
  return Math.round((base * pct) / 10000)
}

/** Tax rate in basis points (875 = 8.75%). */
export function taxFromBps(baseCents: number, taxRateBps: number): number {
  const base = clampNonNegativeCents(baseCents)
  const bps = clampNonNegativeCents(taxRateBps)
  if (bps > 10000) throw new Error('taxRateBps cannot exceed 10000')
  return Math.round((base * bps) / 10000)
}

export function parseMoneyInputToCents(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) return null
    return Math.round(raw * 100)
  }
  const cleaned = String(raw).replace(/[$,\s]/g, '')
  if (!cleaned || !/^-?\d+(\.\d{1,2})?$/.test(cleaned)) return null
  const dollars = Number(cleaned)
  if (!Number.isFinite(dollars)) return null
  return Math.round(dollars * 100)
}
