import type { PartnerIndustrySlug } from '@/lib/site/partnerConciergeIndustries'
import {
  isPartnerIndustrySlug,
  isPartnerPackageId,
  type PartnerPackageId,
} from './packages'

export type PartnerCheckoutInput = {
  packageId: PartnerPackageId
  industrySlug: PartnerIndustrySlug
  checkoutKey: string
  billing: {
    name: string
    email: string
    phone: string | null
    company: string | null
  }
  website?: string
}

const LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  company: 160,
} as const

const CHECKOUT_KEY_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function cleanText(value: unknown, max: number): string {
  return String(value ?? '')
    .trim()
    .slice(0, max)
}

function cleanEmail(value: unknown): string {
  return cleanText(value, LIMITS.email).toLowerCase()
}

export type ValidateCheckoutResult =
  | { ok: true; data: PartnerCheckoutInput }
  | { ok: false; message: string; status: number }

export function validatePartnerCheckout(raw: unknown): ValidateCheckoutResult {
  const body = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null
  if (!body) {
    return { ok: false, message: 'Invalid request.', status: 400 }
  }

  if (typeof body.website === 'string' && body.website.trim()) {
    return { ok: false, message: 'Invalid request.', status: 400 }
  }

  const packageId = body.packageId
  const industrySlug = body.industrySlug
  const checkoutKey = cleanText(body.checkoutKey, 64)

  if (!isPartnerPackageId(packageId)) {
    return { ok: false, message: 'Select a valid Partner Concierge package.', status: 400 }
  }
  if (!isPartnerIndustrySlug(industrySlug)) {
    return { ok: false, message: 'Select a valid industry.', status: 400 }
  }
  if (!CHECKOUT_KEY_RE.test(checkoutKey)) {
    return { ok: false, message: 'Checkout session is invalid. Refresh and try again.', status: 400 }
  }

  const billingRaw =
    body.billing && typeof body.billing === 'object'
      ? (body.billing as Record<string, unknown>)
      : null

  const name = cleanText(billingRaw?.name, LIMITS.name)
  const email = cleanEmail(billingRaw?.email)
  const phone = cleanText(billingRaw?.phone, LIMITS.phone) || null
  const company = cleanText(billingRaw?.company, LIMITS.company) || null

  if (name.length < 2) {
    return { ok: false, message: 'Enter your full name.', status: 400 }
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: 'Enter a valid email address.', status: 400 }
  }

  return {
    ok: true,
    data: {
      packageId,
      industrySlug,
      checkoutKey,
      billing: { name, email, phone, company },
    },
  }
}
