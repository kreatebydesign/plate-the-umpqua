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
  const env = getSquareEnv()
  const scopes = scopeString()

  const params = new URLSearchParams({
    client_id: env.applicationId,
    scope: scopes,
    state,
    redirect_uri: env.oauthRedirectUrl,
    session: 'false',
  })

  return `${env.squareBaseUrl}/oauth2/authorize?${params.toString()}`
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
