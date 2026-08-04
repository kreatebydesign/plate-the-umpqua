/**
 * Square connection record helpers.
 * Server-only. Never returns raw ciphertext to callers — only decrypted tokens where needed.
 *
 * NOTE: The new square-connections, square-oauth-states, and square-webhook-events collections
 * are not yet in payload-types.ts (requires payload generate:types after first build with DB).
 * All Payload calls use overrideAccess: true + (payload as any) to bypass type checking.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { getPayload } from 'payload'
import config from '../../../payload.config'
import { sealSecret, unsealSecret } from '@/lib/crypto/sealedSecrets'
import type { OAuthTokens } from './oauth'

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'not_configured'

export type ConnectionRecord = {
  id: string
  environment: string
  merchantId: string
  merchantName: string
  locationId: string | null
  locationName: string | null
  scopes: string[]
  status: ConnectionStatus
  accessTokenExpiresAt: string | null
  refreshTokenExpiresAt: string | null
  lastSyncedAt: string | null
  lastError: string | null
  connectedAt: string | null
  disconnectedAt: string | null
  connectedBy: string | null
}

async function getPayloadInstance() {
  return getPayload({ config }) as unknown as any
}

/** Get the current active connection record (if any). Returns null if none. */
export async function getSquareConnection(): Promise<ConnectionRecord | null> {
  const payload = await getPayloadInstance()
  const result = await payload.find({
    collection: 'square-connections',
    limit: 1,
    sort: '-connectedAt',
    overrideAccess: true,
    depth: 0,
    where: { status: { equals: 'connected' } },
  })

  const doc = result.docs[0]
  if (!doc) return null

  return docToRecord(doc)
}

/** Get the most recent connection of any status. */
export async function getAnySquareConnection(): Promise<ConnectionRecord | null> {
  const payload = await getPayloadInstance()
  const result = await payload.find({
    collection: 'square-connections',
    limit: 1,
    sort: '-connectedAt',
    overrideAccess: true,
    depth: 0,
  })

  const doc = result.docs[0]
  if (!doc) return null

  return docToRecord(doc)
}

/** Save a new connection record (called after successful OAuth code exchange). */
export async function saveSquareConnection(
  tokens: OAuthTokens,
  merchantName: string,
  connectedByUserId: string,
): Promise<ConnectionRecord> {
  const payload = await getPayloadInstance()
  const env = process.env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'

  const encryptedAccessToken = sealSecret(tokens.accessToken)
  const encryptedRefreshToken = tokens.refreshToken ? sealSecret(tokens.refreshToken) : ''

  // Deactivate any prior connections
  const existing = await payload.find({
    collection: 'square-connections',
    limit: 100,
    overrideAccess: true,
    depth: 0,
  })
  for (const doc of existing.docs) {
    await payload.update({
      collection: 'square-connections',
      id: String(doc.id),
      overrideAccess: true,
      data: {
        status: 'disconnected',
        disconnectedAt: new Date().toISOString(),
      },
    })
  }

  const created = await payload.create({
    collection: 'square-connections',
    overrideAccess: true,
    data: {
      environment: env,
      merchantId: tokens.merchantId,
      merchantName,
      locationId: null,
      locationName: null,
      scopes: tokens.scopes,
      status: 'connected',
      encryptedAccessToken,
      encryptedRefreshToken,
      accessTokenExpiresAt: tokens.expiresAt,
      refreshTokenExpiresAt: null,
      lastSyncedAt: null,
      lastError: null,
      connectedAt: new Date().toISOString(),
      disconnectedAt: null,
      connectedBy: connectedByUserId,
    },
  })

  return docToRecord(created)
}

/** Update the selected location after connection. */
export async function updateSquareLocation(
  connectionId: string,
  locationId: string,
  locationName: string,
): Promise<void> {
  const payload = await getPayloadInstance()
  await payload.update({
    collection: 'square-connections',
    id: connectionId,
    overrideAccess: true,
    data: { locationId, locationName },
  })
}

/** Store refreshed tokens (called by cron). */
export async function updateSquareTokens(
  connectionId: string,
  tokens: OAuthTokens,
): Promise<void> {
  const payload = await getPayloadInstance()
  await payload.update({
    collection: 'square-connections',
    id: connectionId,
    overrideAccess: true,
    data: {
      encryptedAccessToken: sealSecret(tokens.accessToken),
      encryptedRefreshToken: tokens.refreshToken ? sealSecret(tokens.refreshToken) : undefined,
      accessTokenExpiresAt: tokens.expiresAt,
      lastError: null,
    },
  })
}

/** Mark connection as errored with a message. */
export async function setConnectionError(connectionId: string, message: string): Promise<void> {
  const payload = await getPayloadInstance()
  await payload.update({
    collection: 'square-connections',
    id: connectionId,
    overrideAccess: true,
    data: { lastError: message.slice(0, 500), status: 'error' },
  })
}

/** Disconnect and revoke: marks status=disconnected, clears tokens. */
export async function disconnectSquareConnection(connectionId: string): Promise<void> {
  const payload = await getPayloadInstance()
  await payload.update({
    collection: 'square-connections',
    id: connectionId,
    overrideAccess: true,
    data: {
      status: 'disconnected',
      disconnectedAt: new Date().toISOString(),
      encryptedAccessToken: '',
      encryptedRefreshToken: '',
    },
  })
}

/** Decrypt and return the access token for a connected record. NEVER log the result. */
export async function decryptAccessToken(connectionId: string): Promise<string> {
  const payload = await getPayloadInstance()
  const doc = await payload.findByID({
    collection: 'square-connections',
    id: connectionId,
    overrideAccess: true,
    depth: 0,
  })

  const sealed = (doc as Record<string, unknown>).encryptedAccessToken as string | undefined
  if (!sealed) throw new Error('No encrypted access token found on connection record')
  return unsealSecret(sealed)
}

/** Decrypt and return the refresh token for a connected record. NEVER log the result. */
export async function decryptRefreshToken(connectionId: string): Promise<string> {
  const payload = await getPayloadInstance()
  const doc = await payload.findByID({
    collection: 'square-connections',
    id: connectionId,
    overrideAccess: true,
    depth: 0,
  })

  const sealed = (doc as Record<string, unknown>).encryptedRefreshToken as string | undefined
  if (!sealed) throw new Error('No encrypted refresh token found on connection record')
  return unsealSecret(sealed)
}

/** Update lastSyncedAt on a connection. */
export async function touchConnectionSyncedAt(connectionId: string): Promise<void> {
  const payload = await getPayloadInstance()
  await payload.update({
    collection: 'square-connections',
    id: connectionId,
    overrideAccess: true,
    data: { lastSyncedAt: new Date().toISOString() },
  })
}

function docToRecord(doc: Record<string, any>): ConnectionRecord {
  return {
    id: String(doc.id),
    environment: String(doc.environment ?? 'sandbox'),
    merchantId: String(doc.merchantId ?? ''),
    merchantName: String(doc.merchantName ?? ''),
    locationId: doc.locationId ? String(doc.locationId) : null,
    locationName: doc.locationName ? String(doc.locationName) : null,
    scopes: Array.isArray(doc.scopes) ? doc.scopes.map(String) : [],
    status: (doc.status as ConnectionStatus) ?? 'disconnected',
    accessTokenExpiresAt: doc.accessTokenExpiresAt ?? null,
    refreshTokenExpiresAt: doc.refreshTokenExpiresAt ?? null,
    lastSyncedAt: doc.lastSyncedAt ?? null,
    lastError: doc.lastError ?? null,
    connectedAt: doc.connectedAt ?? null,
    disconnectedAt: doc.disconnectedAt ?? null,
    connectedBy: doc.connectedBy
      ? typeof doc.connectedBy === 'object'
        ? String(doc.connectedBy.id)
        : String(doc.connectedBy)
      : null,
  }
}
