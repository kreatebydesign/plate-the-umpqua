/**
 * Dependency-free abuse signal for public experience-feedback submissions.
 */

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 12

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function getFeedbackClientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return req.headers.get('x-real-ip') || 'unknown'
}

export function isFeedbackRateLimited(clientKey: string): boolean {
  const now = Date.now()
  const existing = buckets.get(clientKey)

  if (!existing || existing.resetAt <= now) {
    buckets.set(clientKey, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  existing.count += 1
  if (existing.count > MAX_ATTEMPTS) return true
  return false
}

export function isPlausibleFeedbackOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')
  const host = req.headers.get('host')

  if (!origin && !referer) return true
  if (!host) return true

  const allowedHosts = new Set(
    [
      host,
      process.env.NEXT_PUBLIC_SERVER_URL
        ? safeHostname(process.env.NEXT_PUBLIC_SERVER_URL)
        : null,
      'localhost:3000',
      'localhost:3010',
      'www.platetheumpqua.com',
      'platetheumpqua.com',
    ].filter(Boolean) as string[],
  )

  if (origin) {
    const originHost = safeHostname(origin)
    return Boolean(originHost && allowedHosts.has(originHost))
  }

  if (referer) {
    const refererHost = safeHostname(referer)
    return Boolean(refererHost && allowedHosts.has(refererHost))
  }

  return true
}

function safeHostname(value: string): string | null {
  try {
    return new URL(value).host
  } catch {
    try {
      return new URL(`https://${value}`).host
    } catch {
      return null
    }
  }
}

export function __resetFeedbackRateLimitForTests() {
  buckets.clear()
}
