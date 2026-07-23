import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { FEEDBACK_TOKEN_TTL_MS } from './feedbackConstants'

const TOKEN_BYTES = 32

export function generateFeedbackToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url')
}

export function hashFeedbackToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export function feedbackTokenExpiresAt(
  fromMs: number = Date.now(),
  ttlMs: number = FEEDBACK_TOKEN_TTL_MS,
): Date {
  return new Date(fromMs + ttlMs)
}

export function feedbackTokensMatch(
  plaintext: string,
  storedHash: string,
): boolean {
  if (!plaintext || !storedHash) return false
  const incoming = Buffer.from(hashFeedbackToken(plaintext), 'utf8')
  const stored = Buffer.from(storedHash, 'utf8')
  if (incoming.length !== stored.length) return false
  return timingSafeEqual(incoming, stored)
}

export function normalizeFeedbackTokenParam(
  raw: string | null | undefined,
): string | null {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (trimmed.length < 20 || trimmed.length > 128) return null
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) return null
  return trimmed
}

export function feedbackTokenHint(hash: string): string {
  if (!hash || hash.length < 8) return ''
  return hash.slice(0, 8)
}

export type FeedbackLinkState =
  | 'valid'
  | 'invalid'
  | 'expired'
  | 'revoked'
  | 'submitted'
  | 'unavailable'

export function resolveFeedbackLinkState(options: {
  hashFound: boolean
  revokedAt?: string | Date | null
  expiresAt?: string | Date | null
  submittedAt?: string | Date | null
  eventStatus?: string | null
  now?: number
}): FeedbackLinkState {
  if (!options.hashFound) return 'invalid'
  if (options.revokedAt) return 'revoked'
  if (options.submittedAt) return 'submitted'

  if (options.expiresAt) {
    const exp =
      typeof options.expiresAt === 'string'
        ? Date.parse(options.expiresAt)
        : options.expiresAt.getTime()
    if (Number.isFinite(exp) && exp < (options.now ?? Date.now())) {
      return 'expired'
    }
  }

  if (options.eventStatus === 'archived' || options.eventStatus === 'planning') {
    return 'unavailable'
  }

  return 'valid'
}
