import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { MENU_REVIEW_TOKEN_TTL_MS } from './menuConstants'

const TOKEN_BYTES = 32

/**
 * Opaque review token helpers.
 * Plaintext token is shown once to the operator; only the hash is stored.
 */
export function generateReviewToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url')
}

export function hashReviewToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export function reviewTokenExpiresAt(
  fromMs: number = Date.now(),
  ttlMs: number = MENU_REVIEW_TOKEN_TTL_MS,
): Date {
  return new Date(fromMs + ttlMs)
}

export function tokensMatch(plaintext: string, storedHash: string): boolean {
  if (!plaintext || !storedHash) return false
  const incoming = Buffer.from(hashReviewToken(plaintext), 'utf8')
  const stored = Buffer.from(storedHash, 'utf8')
  if (incoming.length !== stored.length) return false
  return timingSafeEqual(incoming, stored)
}

/**
 * Normalize a URL token param — reject obviously invalid shapes early.
 * Does not create regex from user input; uses a fixed pattern.
 */
export function normalizeReviewTokenParam(
  raw: string | null | undefined,
): string | null {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  // base64url: A-Za-z0-9_- ; expected length ~43 for 32 bytes
  if (trimmed.length < 20 || trimmed.length > 128) return null
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) return null
  return trimmed
}

export type ReviewLinkState =
  | 'valid'
  | 'invalid'
  | 'expired'
  | 'revoked'
  | 'unavailable'

export function resolveReviewLinkState(options: {
  hashFound: boolean
  revokedAt?: string | Date | null
  expiresAt?: string | Date | null
  menuStatus?: string | null
  now?: number
}): ReviewLinkState {
  if (!options.hashFound) return 'invalid'

  if (options.revokedAt) return 'revoked'

  if (options.expiresAt) {
    const exp =
      typeof options.expiresAt === 'string'
        ? Date.parse(options.expiresAt)
        : options.expiresAt.getTime()
    if (Number.isFinite(exp) && exp < (options.now ?? Date.now())) {
      return 'expired'
    }
  }

  if (options.menuStatus === 'archived') return 'unavailable'

  return 'valid'
}
