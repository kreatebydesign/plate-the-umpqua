/**
 * Square environment configuration.
 * Server-only — validates env vars at module load time (soft: throws only when called).
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

export function getSquareEnv(): SquareEnvConfig {
  if (_cached) return _cached

  const environment = process.env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'

  const applicationId = process.env.SQUARE_APPLICATION_ID?.trim() ?? ''
  const applicationSecret = process.env.SQUARE_APPLICATION_SECRET?.trim() ?? ''
  const oauthRedirectUrl = process.env.SQUARE_OAUTH_REDIRECT_URL?.trim() ?? ''
  const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim() ?? ''

  const squareBaseUrl =
    environment === 'production'
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com'

  if (!applicationId) {
    throw new Error('SQUARE_APPLICATION_ID is not set')
  }
  if (!applicationSecret) {
    throw new Error('SQUARE_APPLICATION_SECRET is not set')
  }
  if (!oauthRedirectUrl) {
    throw new Error('SQUARE_OAUTH_REDIRECT_URL is not set')
  }

  _cached = { environment, applicationId, applicationSecret, oauthRedirectUrl, webhookSignatureKey, squareBaseUrl }
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

/** Clear cached config (only useful in tests). */
export function _clearEnvCache(): void {
  _cached = null
}
