/** In-memory rate limit for public invoice views — mirrors menu-review pattern. */

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 60

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export function getInvoiceClientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return req.headers.get('x-real-ip') || 'unknown'
}

export function isInvoiceViewRateLimited(clientKey: string): boolean {
  const now = Date.now()
  const existing = buckets.get(clientKey)

  if (!existing || existing.resetAt <= now) {
    buckets.set(clientKey, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  existing.count += 1
  return existing.count > MAX_ATTEMPTS
}
