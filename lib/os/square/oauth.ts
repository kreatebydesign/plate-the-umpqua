/**
 * Square OAuth helpers — state generation, authorize URL, code exchange, token refresh, revoke.
 * Server-only. All token values are treated as secrets and never logged.
 */

import crypto from 'crypto'
import { SquareClient, SquareEnvironment } from 'square'
import { getSquareEnv } from './env'
import { scopeString } from './scopes'

export type OAuthState = {
  state: string
  expiresAt: string
}

export type OAuthTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: string
  merchantId: string
  tokenType: string
  scopes: string[]
}

/** Generate a cryptographically random state parameter (32 hex bytes). */
export function generateOAuthState(): OAuthState {
  const state = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min TTL
  return { state, expiresAt }
}

/** Build the Square authorize URL. */
export function buildAuthorizeUrl(state: string): string {
  if (!state?.trim()) {
    throw new Error('OAuth state is required before building the authorize URL')
  }

  const env = getSquareEnv()
  const scopes = scopeString()

  const params = new URLSearchParams({
    client_id: env.applicationId,
    scope: scopes,
    state,
    redirect_uri: env.oauthRedirectUrl,
  })

  // Sandbox only supports the default session=true behavior. session=false is
  // production-only and can render a blank Square authorization page in Sandbox.
  if (env.environment === 'production') {
    params.set('session', 'false')
  }

  return `${env.squareBaseUrl}/oauth2/authorize?${params.toString()}`
}

/**
 * Validate a generated authorize URL without exposing secrets.
 * Throws if the URL would send the seller to a broken Square page.
 */
export function assertAuthorizeUrlSafe(url: string): {
  hostname: string
  pathname: string
  clientIdPresent: boolean
  clientIdPlaceholder: boolean
  redirectUri: string | null
  redirectUriMatch: boolean
  scopeCount: number
  statePresent: boolean
  sessionParam: string | null
} {
  const env = getSquareEnv()
  const parsed = new URL(url)
  const clientId = parsed.searchParams.get('client_id') ?? ''
  const redirectUri = parsed.searchParams.get('redirect_uri')
  const state = parsed.searchParams.get('state') ?? ''
  const scope = parsed.searchParams.get('scope') ?? ''
  const sessionParam = parsed.searchParams.get('session')
  const placeholder =
    !clientId ||
    clientId === 'SQUARE_APPLICATION_ID' ||
    clientId === '${SQUARE_APPLICATION_ID}' ||
    clientId === 'undefined' ||
    clientId === 'null' ||
    clientId.startsWith('${')

  const expectedHost =
    env.environment === 'production' ? 'connect.squareup.com' : 'connect.squareupsandbox.com'
  const expectedRedirect = env.oauthRedirectUrl

  if (parsed.hostname !== expectedHost) {
    throw new Error(`Square OAuth hostname mismatch (expected ${expectedHost})`)
  }
  if (parsed.pathname !== '/oauth2/authorize') {
    throw new Error('Square OAuth path must be /oauth2/authorize')
  }
  if (placeholder) {
    throw new Error('Square OAuth client_id is missing or still a placeholder')
  }
  if (env.environment === 'sandbox' && !clientId.startsWith('sandbox-sq0id')) {
    throw new Error('Square Sandbox OAuth requires a sandbox-sq0id Application ID')
  }
  if (env.environment === 'production' && clientId.startsWith('sandbox-sq0id')) {
    throw new Error('Square Production OAuth rejects Sandbox Application IDs')
  }
  if (env.environment === 'production' && !clientId.startsWith('sq0idp-')) {
    throw new Error('Square Production OAuth requires a Production Application ID (sq0idp-)')
  }
  if (env.environment === 'production' && sessionParam !== 'false') {
    throw new Error('Square Production OAuth must set session=false')
  }
  if (redirectUri !== expectedRedirect) {
    throw new Error('Square OAuth redirect_uri does not match SQUARE_OAUTH_REDIRECT_URL')
  }
  if (!state.trim()) {
    throw new Error('Square OAuth state is missing')
  }
  if (env.environment === 'sandbox' && sessionParam === 'false') {
    throw new Error('Square Sandbox OAuth must not set session=false')
  }

  const scopeCount = scope.split(/[+\s]/).filter(Boolean).length
  if (scopeCount !== 8) {
    throw new Error(`Square OAuth scope count must be 8 (got ${scopeCount})`)
  }

  return {
    hostname: parsed.hostname,
    pathname: parsed.pathname,
    clientIdPresent: Boolean(clientId),
    clientIdPlaceholder: placeholder,
    redirectUri,
    redirectUriMatch: redirectUri === expectedRedirect,
    scopeCount,
    statePresent: Boolean(state.trim()),
    sessionParam,
  }
}

/** Exchange an authorization code for access + refresh tokens. */
export async function exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
  const env = getSquareEnv()
  const squareEnv =
    env.environment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox

  const client = new SquareClient({ environment: squareEnv })

  // HttpResponsePromise<ObtainTokenResponse> resolves to ObtainTokenResponse directly
  const response = await client.oAuth.obtainToken({
    clientId: env.applicationId,
    clientSecret: env.applicationSecret,
    code,
    grantType: 'authorization_code',
    redirectUri: env.oauthRedirectUrl,
  })

  return extractTokens(response)
}

/** Refresh an access token using a stored refresh token. */
export async function refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
  const env = getSquareEnv()
  const squareEnv =
    env.environment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox

  const client = new SquareClient({ environment: squareEnv })

  const response = await client.oAuth.obtainToken({
    clientId: env.applicationId,
    clientSecret: env.applicationSecret,
    refreshToken,
    grantType: 'refresh_token',
  })

  return extractTokens(response)
}

/** Revoke all tokens for a merchant. Uses Client APPLICATION_SECRET auth. */
export async function revokeTokens(merchantId: string, accessToken: string): Promise<void> {
  const env = getSquareEnv()
  const squareEnv =
    env.environment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox

  const client = new SquareClient({ environment: squareEnv })

  try {
    await client.oAuth.revokeToken({
      clientId: env.applicationId,
      accessToken,
      merchantId,
      revokeOnlyAccessToken: false,
    })
  } catch (err) {
    console.error('[square/oauth] revokeTokens error (non-fatal)', err)
  }
}

// ObtainTokenResponse is resolved directly (HttpResponsePromise<T> extends Promise<T>)
import type { ObtainTokenResponse } from 'square'

function extractTokens(response: ObtainTokenResponse): OAuthTokens {
  if (!response.accessToken) {
    throw new Error('Square OAuth: no access token in response')
  }
  if (!response.merchantId) {
    throw new Error('Square OAuth: no merchant ID in response')
  }

  const expiresAt = response.expiresAt
    ? new Date(response.expiresAt).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const refreshToken = response.refreshToken ?? ''

  return {
    accessToken: response.accessToken,
    refreshToken,
    expiresAt,
    merchantId: response.merchantId,
    tokenType: response.tokenType ?? 'bearer',
    scopes: [],
  }
}

/** True if the token will expire within the given buffer (default 7 days). */
export function tokenExpiresWithin(expiresAt: string, bufferMs = 7 * 24 * 60 * 60 * 1000): boolean {
  const expiry = new Date(expiresAt).getTime()
  return expiry - Date.now() < bufferMs
}
