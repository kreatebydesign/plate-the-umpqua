export const LEAD_SOURCES = [
  'website',
  'concierge',
  'packages',
  'partner-concierge',
  'community-partnership',
  'realtor',
  'wine-country',
  'referral',
] as const

export type LeadSource = (typeof LEAD_SOURCES)[number]

export const BUDGET_VALUES = ['425-750', '750-1500', '2000+'] as const
export const PACKAGE_VALUES = ['Private Table', 'Estate', 'Concierge', 'Wine'] as const
export const URGENCY_VALUES = ['this-week', 'this-month', 'future'] as const
export const GUEST_VALUES = [
  '2-4 Guests',
  '5-10 Guests',
  '10-20 Guests',
  '20+ Guests',
] as const

export const INQUIRY_LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  location: 200,
  occasion: 120,
  details: 5000,
  guests: 40,
  budget: 40,
  packageInterest: 40,
  urgency: 40,
  source: 64,
} as const

/** Only these keys are accepted from the public inquiry form. */
export const ALLOWED_INQUIRY_KEYS = [
  'name',
  'email',
  'phone',
  'location',
  'guests',
  'budget',
  'packageInterest',
  'urgency',
  'occasion',
  'details',
  'source',
  'companyWebsite', // honeypot
  'formStartedAt', // timing defense
] as const

export type PublicInquiryInput = {
  name: string
  email: string
  phone: string
  location: string
  guests: string
  budget: string
  packageInterest: string
  urgency: string
  occasion: string
  details: string
  source: LeadSource
}

export type InquiryValidationResult =
  | { ok: true; data: PublicInquiryInput }
  | { ok: false; message: string; status: number; code: string }

function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function isEmail(value: string): boolean {
  // Practical validation — not full RFC compliance
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= INQUIRY_LIMITS.email
}

function isAllowedEnum<T extends string>(
  value: string,
  allowed: readonly T[],
): value is T {
  return (allowed as readonly string[]).includes(value)
}

/**
 * Validates and normalizes a public inquiry payload.
 * Rejects unknown keys and privilege-related fields by allowlist.
 */
export function validatePublicInquiry(
  raw: unknown,
  options?: { now?: number },
): InquiryValidationResult {
  const now = options?.now ?? Date.now()

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      ok: false,
      message: 'Invalid request.',
      status: 400,
      code: 'invalid_body',
    }
  }

  const body = raw as Record<string, unknown>
  const keys = Object.keys(body)

  for (const key of keys) {
    if (!(ALLOWED_INQUIRY_KEYS as readonly string[]).includes(key)) {
      return {
        ok: false,
        message: 'Invalid request.',
        status: 400,
        code: 'unsupported_field',
      }
    }
  }

  // Honeypot — must remain empty for legitimate users (visually hidden).
  const honeypot = clean(body.companyWebsite, 200)
  if (honeypot) {
    return {
      ok: false,
      message: 'Unable to submit inquiry.',
      status: 400,
      code: 'honeypot',
    }
  }

  // Timing — reject instant bot posts when the form sent a start timestamp.
  const startedRaw = body.formStartedAt
  if (startedRaw !== undefined && startedRaw !== null && startedRaw !== '') {
    const startedAt = Number(startedRaw)
    if (!Number.isFinite(startedAt) || startedAt > now + 5000) {
      return {
        ok: false,
        message: 'Unable to submit inquiry.',
        status: 400,
        code: 'timing_invalid',
      }
    }
    if (now - startedAt < 1200) {
      return {
        ok: false,
        message: 'Please wait a moment and try again.',
        status: 429,
        code: 'timing_fast',
      }
    }
    // Discard stale forms older than 24h
    if (now - startedAt > 24 * 60 * 60 * 1000) {
      return {
        ok: false,
        message: 'This form expired. Please refresh the page and try again.',
        status: 400,
        code: 'timing_stale',
      }
    }
  }

  const name = clean(body.name, INQUIRY_LIMITS.name)
  const email = clean(body.email, INQUIRY_LIMITS.email).toLowerCase()
  const phone = clean(body.phone, INQUIRY_LIMITS.phone)
  const location = clean(body.location, INQUIRY_LIMITS.location)
  const guests = clean(body.guests, INQUIRY_LIMITS.guests)
  const budget = clean(body.budget, INQUIRY_LIMITS.budget)
  const packageInterest = clean(body.packageInterest, INQUIRY_LIMITS.packageInterest)
  const urgency = clean(body.urgency, INQUIRY_LIMITS.urgency)
  const occasion = clean(body.occasion, INQUIRY_LIMITS.occasion)
  const details = clean(body.details, INQUIRY_LIMITS.details)
  const sourceRaw = clean(body.source, INQUIRY_LIMITS.source)

  if (!name || !email) {
    return {
      ok: false,
      message: 'Missing required fields.',
      status: 400,
      code: 'required',
    }
  }

  if (!isEmail(email)) {
    return {
      ok: false,
      message: 'Please provide a valid email address.',
      status: 400,
      code: 'email',
    }
  }

  if (phone && !/^[+\d\s().-]{7,40}$/.test(phone)) {
    return {
      ok: false,
      message: 'Please provide a valid phone number.',
      status: 400,
      code: 'phone',
    }
  }

  if (guests && !isAllowedEnum(guests, GUEST_VALUES)) {
    return {
      ok: false,
      message: 'Invalid guest count.',
      status: 400,
      code: 'guests',
    }
  }

  if (budget && !isAllowedEnum(budget, BUDGET_VALUES)) {
    return {
      ok: false,
      message: 'Invalid budget selection.',
      status: 400,
      code: 'budget',
    }
  }

  if (packageInterest && !isAllowedEnum(packageInterest, PACKAGE_VALUES)) {
    return {
      ok: false,
      message: 'Invalid experience type.',
      status: 400,
      code: 'package',
    }
  }

  if (urgency && !isAllowedEnum(urgency, URGENCY_VALUES)) {
    return {
      ok: false,
      message: 'Invalid timeline.',
      status: 400,
      code: 'urgency',
    }
  }

  const source: LeadSource = isAllowedEnum(sourceRaw, LEAD_SOURCES)
    ? sourceRaw
    : 'website'

  return {
    ok: true,
    data: {
      name,
      email,
      phone,
      location,
      guests,
      budget,
      packageInterest,
      urgency,
      occasion,
      details,
      source,
    },
  }
}

/**
 * Dependency-free abuse signal for serverless hosts.
 * Not a durable rate limiter — pair with Upstash/Redis in production.
 */
export function getInquiryClientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return req.headers.get('x-real-ip') || 'unknown'
}

export function isPlausibleInquiryOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')
  const host = req.headers.get('host')

  // Allow server-to-server / same-origin without Origin (some browsers omit on same-site POSTs)
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
    if (originHost && allowedHosts.has(originHost)) return true
    // Reject clearly foreign origins when Origin is present
    return false
  }

  if (referer) {
    const refererHost = safeHostname(referer)
    if (refererHost && allowedHosts.has(refererHost)) return true
    return false
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
