/**
 * SquareClient factory. Returns an authenticated SDK client using the stored access token.
 * Server-only — decrypts the token from the sealed connection record.
 */

import { SquareClient, SquareEnvironment } from 'square'
import { getSquareEnv } from './env'
import { getSquareConnection, decryptAccessToken } from './connection'

export async function getSquareClient(): Promise<SquareClient> {
  const env = getSquareEnv()
  const connection = await getSquareConnection()

  if (!connection || connection.status !== 'connected') {
    throw new Error('Square is not connected. Complete OAuth flow in /os/settings/square.')
  }

  const accessToken = await decryptAccessToken(connection.id)

  const squareEnv =
    env.environment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox

  return new SquareClient({
    token: accessToken,
    environment: squareEnv,
  })
}

/** Get the Square client along with connection metadata (no token exposed). */
export async function getSquareClientWithConnection(): Promise<{
  client: SquareClient
  connectionId: string
  locationId: string
  merchantId: string
}> {
  const connection = await getSquareConnection()

  if (!connection || connection.status !== 'connected') {
    throw new Error('Square is not connected. Complete OAuth flow in /os/settings/square.')
  }
  if (!connection.locationId) {
    throw new Error('Square location not selected. Select a location in /os/settings/square.')
  }

  const client = await getSquareClient()

  return {
    client,
    connectionId: connection.id,
    locationId: connection.locationId,
    merchantId: connection.merchantId,
  }
}
