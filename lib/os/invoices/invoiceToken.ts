import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

const TOKEN_BYTES = 32

export function generateInvoiceToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url')
}

export function hashInvoiceToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export function invoiceTokensMatch(plaintext: string, storedHash: string): boolean {
  if (!plaintext || !storedHash) return false
  const incoming = Buffer.from(hashInvoiceToken(plaintext), 'utf8')
  const stored = Buffer.from(storedHash, 'utf8')
  if (incoming.length !== stored.length) return false
  return timingSafeEqual(incoming, stored)
}

export function normalizeInvoiceTokenParam(
  raw: string | null | undefined,
): string | null {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (trimmed.length < 20 || trimmed.length > 128) return null
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) return null
  return trimmed
}

export function publicInvoiceUrl(token: string, siteUrl?: string | null): string {
  const base = (siteUrl || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  if (!base) return `/invoice/${token}`
  return `${base}/invoice/${token}`
}
