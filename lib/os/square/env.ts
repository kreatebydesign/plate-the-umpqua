/**
 * Square environment configuration.
 * Server-only — validates env vars at call time (soft: throws only when called).
 */

export type SquareEnvConfig = {
  environment: 'sandbox' | 'production'
  applicationId: string
  applicationSecret: string
  oauthRedirectUrl: string
  webhookSignatureKey: string
  squareBaseUrl: string
}

let _cached: SquareEnvConfig | null = null

const PLACEHOLDER_VALUES = new Set([
  '',
  'undefined',
  'null',
  'SQUARE_APPLICATION_ID',
  'SQUARE_APPLICATION_SECRET',
  'SQUARE_OAUTH_REDIRECT_URL',
  'SQUARE_WEBHOOK_SIGNATURE_KEY',
  'SQUARE_TOKEN_ENCRYPTION_KEY',
  'SQUARE_ENVIRONMENT',
])

function rejectUnresolvedPlaceholder(name: string, value: string): void {
  if (PLACEHOLDER_VALUES.has(value) || value === name || value.startsWith('${')) {
    throw new Error(
      `${name} is missing or still set to a placeholder. Set the real Square Sandbox value in Vercel Production (no quotes/spaces; value must not equal the key name).`,
    )
  }
}

function requireTrimmedEnv(name: string): string {
  const raw = process.env[name]
  if (raw == null) {
    throw new Error(`${name} is not set`)
  }
  const value = raw.trim()
  if (!value) {
    throw new Error(`${name} is empty after trimming`)
  }
  rejectUnresolvedPlaceholder(name, value)
  return value
}

function assertApplicationIdFormat(environment: 'sandbox' | 'production', applicationId: string): void {
  if (environment === 'sandbox') {
    if (!applicationId.startsWith('sandbox-sq0id')) {
      throw new Error(
        'SQUARE_APPLICATION_ID must be the Sandbox Application ID (starts with sandbox-sq0id). Production Application IDs cannot be used with Sandbox OAuth.',
      )
    }
    return
  }

  if (applicationId.startsWith('sandbox-sq0id')) {
    throw new Error(
      'SQUARE_APPLICATION_ID looks like a Sandbox ID, but SQUARE_ENVIRONMENT is production.',
    )
  }
  if (!applicationId.startsWith('sq0idp-')) {
    throw new Error(
      'SQUARE_APPLICATION_ID must be a Square Production Application ID (starts with sq0idp-). Sandbox IDs cannot be used in Production.',
    )
  }
}

export function getSquareEnv(): SquareEnvConfig {
  if (_cached) return _cached

  const environment = process.env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'

  const applicationId = requireTrimmedEnv('SQUARE_APPLICATION_ID')
  const applicationSecret = requireTrimmedEnv('SQUARE_APPLICATION_SECRET')
  const oauthRedirectUrl = requireTrimmedEnv('SQUARE_OAUTH_REDIRECT_URL')
  // Sandbox may omit the webhook key; Production must always verify signatures.
  const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim() ?? ''
  if (webhookSignatureKey) {
    rejectUnresolvedPlaceholder('SQUARE_WEBHOOK_SIGNATURE_KEY', webhookSignatureKey)
  }
  if (environment === 'production' && !webhookSignatureKey) {
    throw new Error(
      'SQUARE_WEBHOOK_SIGNATURE_KEY is required when SQUARE_ENVIRONMENT=production. Use the Production webhook subscription signature key from Square Developer Dashboard.',
    )
  }

  assertApplicationIdFormat(environment, applicationId)

  const squareBaseUrl =
    environment === 'production'
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com'

  _cached = {
    environment,
    applicationId,
    applicationSecret,
    oauthRedirectUrl,
    webhookSignatureKey,
    squareBaseUrl,
  }
  return _cached
}

/** Returns true only in sandbox mode — use as production gate. */
export function isSandbox(): boolean {
  return process.env.SQUARE_ENVIRONMENT !== 'production'
}

/** Validates environment isolation: throws if production credentials are used in sandbox context. */
export function assertSandboxIsolation(): void {
  if (process.env.SQUARE_ENVIRONMENT === 'production') {
    throw new Error(
      'Production Square access blocked. Set SQUARE_ENVIRONMENT=production only after explicit operator authorization.',
    )
  }
}

/** Safe, non-secret diagnostics for OAuth configuration. Never includes secrets. */
export function getSquareOAuthConfigDiagnostics(): {
  environment: 'sandbox' | 'production'
  applicationIdPresent: boolean
  applicationIdPlaceholderDetected: boolean
  applicationIdLength: number
  applicationIdRedacted: string | null
  applicationIdSandboxPrefix: boolean
  oauthHostname: string
  oauthPath: string
  redirectUriMatch: boolean
  redirectUriConfigured: boolean
  sessionParam: 'omitted' | 'false'
} {
  const environment = process.env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
  const rawAppId = process.env.SQUARE_APPLICATION_ID ?? ''
  const applicationId = rawAppId.trim()
  const placeholder =
    !applicationId ||
    PLACEHOLDER_VALUES.has(applicationId) ||
    applicationId === 'SQUARE_APPLICATION_ID' ||
    applicationId.startsWith('${')
  const redirect = (process.env.SQUARE_OAUTH_REDIRECT_URL ?? '').trim()
  const expectedRedirect = 'https://www.platetheumpqua.com/api/square/oauth/callback'
  const oauthHostname =
    environment === 'production' ? 'connect.squareup.com' : 'connect.squareupsandbox.com'

  return {
    environment,
    applicationIdPresent: Boolean(applicationId),
    applicationIdPlaceholderDetected: placeholder,
    applicationIdLength: applicationId.length,
    applicationIdRedacted:
      !placeholder && applicationId.length >= 8
        ? `${applicationId.slice(0, 4)}…${applicationId.slice(-4)}`
        : null,
    applicationIdSandboxPrefix: applicationId.startsWith('sandbox-sq0id'),
    oauthHostname,
    oauthPath: '/oauth2/authorize',
    redirectUriMatch: redirect === expectedRedirect,
    redirectUriConfigured: Boolean(redirect),
    sessionParam: environment === 'production' ? 'false' : 'omitted',
  }
}

/** Clear cached config (only useful in tests). */
export function _clearEnvCache(): void {
  _cached = null
}
